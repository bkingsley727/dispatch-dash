import { chatterLine, faultReason } from './chatter'
import { createDefaultBoard } from './fixtures'
import type { FeedSource } from './source'
import type { CommLink, LinkStatus, Message } from './types'

/**
 * The demo backend.
 *
 * A `FeedSource` that runs entirely in the browser: it starts from the default
 * board and, once played, puts traffic on the wire and moves links between
 * states on its own, so the dashboard can be reviewed — and demoed — behaving
 * the way it would against a live dispatch system.
 *
 * It starts stopped. The header's transport control is what sets it running,
 * and stopping returns the board to the default state rather than freezing it
 * mid-walk — see `stop()`.
 *
 * Design notes:
 *
 * - **One heartbeat, not a timer per link.** Every link carries its own next
 *   event time and a single tick decides whose turn it is. Five links with
 *   five drifting timers would be five things to leak; this is one.
 *
 * - **Seeded randomness.** All variation comes from one PRNG, so a given seed
 *   replays the same demo. That matters for design review: a screenshot can
 *   be reproduced instead of chased.
 *
 * - **Reference-counted clock.** Board state outlives its subscribers, so
 *   React's StrictMode double-mount (subscribe, unsubscribe, subscribe) does
 *   not restart the demo or leave two clocks running against it. The heartbeat
 *   needs three conditions at once — connected, watched, and playing — and
 *   `syncHeartbeat` is the only thing allowed to act on them.
 *
 * - **Bounded buffers.** Each link keeps at most `bufferLimit` messages, so a
 *   dashboard left open all afternoon does not grow without limit. This is
 *   the source honouring the bound that `types.ts` promises the view.
 */

/**
 * Heartbeat at `speed: 1`. Every scheduling decision is quantised to this, so
 * it scales with `speed` alongside the intervals — otherwise a sped-up demo
 * would still be floored at one event per link per second, and `speed` would
 * quietly stop meaning anything below 1.
 */
const TICK_MS = 1000

/** Floor on the scaled heartbeat: past this, ticks cost more than they show. */
const MIN_TICK_MS = 16

/** Newest-N kept per link. Older messages fall off the front. */
const DEFAULT_BUFFER_LIMIT = 200

/** Delay before the first board lands, so the loading state is real. */
const DEFAULT_CONNECT_DELAY_MS = 450

/**
 * Guaranteed silence, in seconds, for a link seeded with no traffic at all.
 *
 * `quietToActive` alone only makes an early wake *unlikely* — it can still
 * fire on the very first event, which is how "awaiting first transmission"
 * disappeared a minute into a review session. A floor is the honest way to
 * express "this state must be observable", where a smaller probability would
 * only have made losing it rarer and harder to reproduce.
 */
const QUIET_HOLD_S = 120

/**
 * Seconds between events, per state. Errored links are silent — the only
 * event they schedule is an attempt to recover.
 */
const EVENT_INTERVAL_S: Record<LinkStatus, [min: number, max: number]> = {
    active: [2, 9],
    standby: [20, 50],
    error: [25, 70],
}

/**
 * Chance an event is a state change rather than another line of traffic.
 *
 * These are balanced against `EVENT_INTERVAL_S` for the mix the board settles
 * at, not for how interesting any single transition is. Sampled across twelve
 * seeds over ~1.5 hours of simulated time on the fixture board, it holds at
 * roughly 50% active / 40% stand-by / 10% errored: two or three links carrying
 * traffic at any moment, a fault surfacing every few minutes, and every link
 * quiet at once only about 2% of the time.
 *
 * The first pass at these numbers looked fine per-link but drifted: a link
 * left `active` about twice as fast as it came back, so after a few minutes
 * the whole board would be sitting on stand-by with nothing to watch.
 *
 * The odd-looking active values are deliberate. These are per-*event* odds, so
 * shortening the active interval to 2s made an active link roll to leave the
 * state more often too — draining the board of traffic as a side effect of
 * asking the feeds to update faster. Scaling both by the change in mean
 * interval (5.5/6) holds the dwell time at ~100s, so the interval controls how
 * fast a link talks and these control how long it keeps talking.
 *
 * If you change one of these, re-measure the mix rather than reasoning about
 * the single transition — and measure against a board whose links have
 * messages. Seeding every link empty flags them all `quiet`, which swaps
 * `standbyToActive` for `quietToActive` and badly skews the result.
 */
const TRANSITION_CHANCE = {
    /** Active link falls quiet. */
    activeToStandby: 0.041,
    /** Active link faults. */
    activeToError: 0.014,
    /** Stand-by link picks up traffic. */
    standbyToActive: 0.35,
    /**
     * As above, for a link that has never transmitted. Held low on purpose,
     * and floored by `QUIET_HOLD_S`: "awaiting first transmission" is a state
     * the board should hold long enough to actually be seen, not a frame it
     * passes through on the way to its first message.
     */
    quietToActive: 0.08,
    /** Fault clears. */
    errorRecovers: 0.6,
} as const

/**
 * Transport control for the demo. Deliberately separate from `FeedSource`:
 * a real dispatch backend has no play button, and the board should not learn
 * to expect one.
 */
export interface DemoController {
    /** Begin live updates from the board's current state. */
    play(): void
    /** Halt live updates and reset the board to its default state. */
    stop(): void
    isRunning(): boolean
    /** Notified whenever `isRunning()` changes. */
    subscribeRunning(listener: (running: boolean) => void): () => void
}

export type DemoFeed = FeedSource & DemoController

export interface SimulatorOptions {
    /**
     * Builds the board's default state. A factory rather than an array
     * because `stop()` rebuilds it, and the timestamps have to be re-anchored
     * to the moment of the reset.
     */
    createBoard?: () => CommLink[]
    /** PRNG seed. The same seed replays the same demo. */
    seed?: number
    connectDelayMs?: number
    bufferLimit?: number
    /** Multiplies every interval. `0.25` runs the demo four times faster. */
    speed?: number
}

/** mulberry32 — small, fast, and good enough for demo traffic. */
function createRng(seed: number): () => number {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/** Per-link scheduling state. Never handed to the view. */
interface LinkClock {
    /** Epoch ms of this link's next event. */
    dueAt: number
    /** Counter behind simulated message ids, so they stay unique per link. */
    seq: number
    /** Seeded with no traffic at all — see `quietToActive`. */
    quiet: boolean
}

export function createSimulator(options: SimulatorOptions = {}): DemoFeed {
    const {
        createBoard = createDefaultBoard,
        seed = 0x5e1ec7,
        connectDelayMs = DEFAULT_CONNECT_DELAY_MS,
        bufferLimit = DEFAULT_BUFFER_LIMIT,
        speed = 1,
    } = options

    const rng = createRng(seed)
    const tickMs = Math.max(MIN_TICK_MS, TICK_MS * speed)

    let links: CommLink[] = createBoard()
    const clocks = new Map<string, LinkClock>()

    let listeners: ((links: CommLink[]) => void)[] = []
    let runningListeners: ((running: boolean) => void)[] = []
    let connected = false
    let playing = false
    let connectTimer: ReturnType<typeof setTimeout> | undefined
    let heartbeat: ReturnType<typeof setInterval> | undefined

    function scheduleNext(link: CommLink, clock: LinkClock, now: number): void {
        const [min, max] = EVENT_INTERVAL_S[link.status]
        clock.dueAt = now + (min + rng() * (max - min)) * 1000 * speed
    }

    function initClocks(now: number): void {
        for (const link of links) {
            const clock: LinkClock = {
                dueAt: 0,
                seq: 0,
                quiet: link.messages.length === 0,
            }
            scheduleNext(link, clock, now)
            if (clock.quiet) {
                clock.dueAt = Math.max(clock.dueAt, now + QUIET_HOLD_S * 1000 * speed)
            }
            clocks.set(link.id, clock)
        }
    }

    function append(link: CommLink, clock: LinkClock, body: string, at: number): Message[] {
        const message: Message = { id: `${link.id}-s${clock.seq++}`, at, body }
        const next = [...link.messages, message]
        return next.length > bufferLimit ? next.slice(next.length - bufferLimit) : next
    }

    /**
     * Advance one link. Returns a new object if anything changed, or the very
     * same one if not — identity is the signal the view uses to skip
     * re-rendering cards that did not move.
     */
    function advance(link: CommLink, clock: LinkClock, now: number): CommLink {
        const roll = rng()

        switch (link.status) {
            case 'active': {
                if (roll < TRANSITION_CHANCE.activeToError) {
                    return {
                        ...link,
                        status: 'error',
                        fault: { reason: faultReason(rng), at: now },
                    }
                }
                if (roll < TRANSITION_CHANCE.activeToError + TRANSITION_CHANCE.activeToStandby) {
                    return {
                        ...link,
                        status: 'standby',
                        messages: append(link, clock, chatterLine('standby', rng), now),
                    }
                }
                return { ...link, messages: append(link, clock, chatterLine('active', rng), now) }
            }

            case 'standby': {
                const wakeChance = clock.quiet
                    ? TRANSITION_CHANCE.quietToActive
                    : TRANSITION_CHANCE.standbyToActive
                if (roll < wakeChance) {
                    clock.quiet = false
                    return {
                        ...link,
                        status: 'active',
                        messages: append(link, clock, chatterLine('wake', rng), now),
                    }
                }
                // A link that has never transmitted stays silent until it
                // wakes: its first line should be the one that matters.
                if (clock.quiet) return link
                return { ...link, messages: append(link, clock, chatterLine('standby', rng), now) }
            }

            case 'error': {
                if (roll >= TRANSITION_CHANCE.errorRecovers) return link
                // `fault` is only meaningful while status is 'error', so it is
                // dropped rather than left behind as stale explanation.
                const { fault: _cleared, ...rest } = link
                return {
                    ...rest,
                    status: 'active',
                    messages: append(rest, clock, chatterLine('recovery', rng), now),
                }
            }
        }
    }

    function tick(): void {
        const now = Date.now()
        let changed = false

        const next = links.map((link) => {
            const clock = clocks.get(link.id)
            if (!clock || now < clock.dueAt) return link

            const advanced = advance(link, clock, now)
            scheduleNext(advanced, clock, now)
            if (advanced !== link) changed = true
            return advanced
        })

        // A tick where every link was either not due or chose to stay put
        // publishes nothing: the board only re-renders when it has moved.
        if (!changed) return
        links = next
        emit()
    }

    function emit(): void {
        for (const listener of listeners) listener(links)
    }

    function emitRunning(): void {
        for (const listener of runningListeners) listener(playing)
    }

    /**
     * Wall time keeps moving while the heartbeat is stopped, so on resume every
     * clock is overdue by however long the pause lasted. Without re-basing,
     * the first tick back fires an event on every link at once — a burst that
     * reads as a glitch rather than as traffic.
     */
    function rebaseOverdueClocks(now: number): void {
        for (const link of links) {
            const clock = clocks.get(link.id)
            if (clock && clock.dueAt < now) scheduleNext(link, clock, now)
        }
    }

    /**
     * The single place the heartbeat is turned on or off. It runs only when
     * the board is connected, someone is watching, and the demo is playing —
     * three independent conditions that were previously two separate code
     * paths racing to own the same interval handle.
     */
    function syncHeartbeat(): void {
        const shouldRun = connected && playing && listeners.length > 0

        if (shouldRun && heartbeat === undefined) {
            rebaseOverdueClocks(Date.now())
            heartbeat = setInterval(tick, tickMs)
        } else if (!shouldRun && heartbeat !== undefined) {
            clearInterval(heartbeat)
            heartbeat = undefined
        }
    }

    /** First subscriber arrived. */
    function attach(): void {
        if (connected) {
            syncHeartbeat()
            return
        }
        connectTimer = setTimeout(() => {
            connectTimer = undefined
            connected = true
            initClocks(Date.now())
            emit()
            syncHeartbeat()
        }, connectDelayMs)
    }

    /** Last subscriber left. */
    function detach(): void {
        clearTimeout(connectTimer)
        connectTimer = undefined
        syncHeartbeat()
    }

    return {
        subscribe(listener) {
            listeners = [...listeners, listener]
            if (listeners.length === 1) attach()
            // A late subscriber joins a board already in progress, and should
            // not sit on a skeleton waiting for the next event to fire.
            else if (connected) listener(links)

            let live = true
            return () => {
                if (!live) return
                live = false
                listeners = listeners.filter((l) => l !== listener)
                if (listeners.length === 0) detach()
            }
        },

        isRunning: () => playing,

        subscribeRunning(listener) {
            runningListeners = [...runningListeners, listener]
            let live = true
            return () => {
                if (!live) return
                live = false
                runningListeners = runningListeners.filter((l) => l !== listener)
            }
        },

        play() {
            if (playing) return
            playing = true
            syncHeartbeat()
            emitRunning()
        },

        /**
         * Stop is a reset, not a pause.
         *
         * What sits on screen while the demo is idle is the board's calling
         * card, so it should be the curated default — every status on show,
         * a feed long enough to need scrolling — rather than wherever the
         * random walk happened to leave things. Resuming from a fresh default
         * board is also what makes the demo repeatable for review.
         */
        stop() {
            playing = false
            syncHeartbeat()

            links = createBoard()
            clocks.clear()
            initClocks(Date.now())

            // Before the connect delay has elapsed there is nothing on screen
            // but the skeleton; publishing here would cut that short.
            if (connected) emit()
            emitRunning()
        },
    }
}

/**
 * The board the app runs against. A module singleton so every subscriber —
 * including StrictMode's second mount — shares one demo rather than forking
 * a private copy of it.
 */
export const demoFeed = createSimulator()
