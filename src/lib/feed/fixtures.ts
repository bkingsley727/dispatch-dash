import type { CommLink, LinkStatus, Message } from './types'

/**
 * The board's default state: what it shows before live updates are started,
 * and what it returns to when they are stopped.
 *
 * Every state the UI has to handle is present here — a feed long enough to
 * need scrolling, a short one, a fault with a reason, and a link that has
 * never transmitted — so the board is fully reviewable standing still,
 * without waiting for the simulator to happen to produce each case.
 *
 * Stored as offsets rather than timestamps. `createDefaultBoard` anchors them
 * when it is called, so a reset after an hour of live traffic still reads as
 * recent chatter instead of dropping the board back into the past.
 */

interface LinkSeed {
    id: string
    name: string
    designator: string
    status: LinkStatus
    fault?: { reason: string; secondsAgo: number }
    /** Newest first here for readability; flipped to newest-last on build. */
    lines: [secondsAgo: number, body: string][]
}

const SEEDS: LinkSeed[] = [
    {
        id: 'northgate',
        name: 'Northgate Relay',
        designator: 'NG-04',
        status: 'active',
        // Deliberately long — a full shift's worth of chatter — so the
        // expanded view has a real, non-marginal case for the max-height
        // cap and internal scroll to demonstrate, not just a feed that
        // happens to peek a few pixels past the threshold.
        lines: [
            [12, 'Unit 4 en route, ETA 6 min'],
            [24, 'Copy that, proceeding to grid 7'],
            [39, 'Dispatch, confirm handoff to Northgate'],
            [58, 'Handoff confirmed, you are clear'],
            [76, 'Unit 4 requesting route around Vernon closure'],
            [94, 'Reroute approved via Halsted'],
            [119, 'Traffic control notified, lanes held'],
            [143, 'Unit 9 standing down, returning to post'],
            [168, 'Log updated, shift board current'],
            [201, 'All units check in complete'],
            [236, 'Weather advisory lifted for sector 3'],
            [274, 'Unit 4 on scene, beginning survey'],
            [315, 'Survey clear, no obstruction found'],
            [359, 'Returning Northgate to normal watch'],
            [402, 'Unit 4 requesting fuel stop before next assignment'],
            [438, 'Approved, ten minutes'],
            [471, 'Northgate holding steady, no active calls'],
            [512, 'Unit 7 checking in from grid 3'],
            [549, 'Copy Unit 7, proceed to standard patrol'],
            [588, 'Weather advisory issued for sector 3, monitor conditions'],
            [624, 'Acknowledged, visibility dropping on the ridge road'],
            [671, 'Unit 9 reporting minor collision at Fifth and Main'],
            [703, 'Dispatch, need a second unit for traffic control'],
            [739, 'Unit 4 diverting to assist Unit 9'],
            [782, 'Unit 4 on scene, no injuries reported'],
            [820, 'Tow requested for disabled vehicle'],
            [861, 'Tow en route, ETA 15 minutes'],
            [903, 'Traffic backing up on Main, requesting flaggers'],
            [947, 'Flaggers dispatched from station 2'],
            [985, 'Scene secured, one lane open'],
            [1024, 'Unit 9 clearing scene, handing off to tow crew'],
            [1068, 'Main Street reopened, all lanes clear'],
            [1112, 'Nice work, Northgate. Returning to normal patrol'],
            [1156, 'Shift log updated with incident report'],
            [1203, 'Unit 4 requesting lunch break, thirty minutes'],
            [1247, 'Approved, Northgate holding position'],
            [1289, 'Radio check, all units respond'],
            [1334, 'Unit 4 copy'],
            [1378, 'Unit 7 copy'],
            [1415, 'Unit 9 copy'],
            [1449, 'All units accounted for, radio check complete'],
        ],
    },
    {
        id: 'harbor',
        name: 'Harbor Watch',
        designator: 'HW-11',
        status: 'standby',
        lines: [
            [248, 'Channel idle, holding'],
            [612, 'Tide watch complete, nothing to report'],
            [980, 'Pier 3 camera back online'],
            [1444, 'Handing watch to night shift'],
            [1902, 'Night shift acknowledged'],
        ],
    },
    {
        id: 'ridgeline',
        name: 'Ridgeline Post',
        designator: 'RL-02',
        status: 'error',
        fault: { reason: 'Carrier lost — no acknowledgement in 3 cycles', secondsAgo: 184 },
        lines: [
            [191, 'Signal degrading, switching to backup antenna'],
            [206, 'Backup antenna online, quality poor'],
            [233, 'Ridgeline, do you copy'],
            [271, 'Wind advisory in effect at summit'],
            [318, 'Mast inspection scheduled for 0800'],
        ],
    },
    {
        id: 'crosstown',
        name: 'Crosstown Dispatch',
        designator: 'CT-07',
        status: 'active',
        lines: [
            [4, 'Unit 12 clear of the scene'],
            [17, 'Roger, marking closed at 14:21'],
            [31, 'Two more calls holding in queue'],
            [46, 'Assigning Unit 6 to the first'],
            [63, 'Unit 6 acknowledging, en route'],
            [88, 'Second call reassigned to Eastside'],
            [117, 'Eastside confirms, they have capacity'],
            [149, 'Queue clear, standing by'],
        ],
    },
    {
        id: 'sable',
        name: 'Sable Ridge Outpost',
        designator: 'SR-19',
        status: 'standby',
        // Deliberately empty: exercises the "awaiting first transmission" state.
        lines: [],
    },
]


/**
 * Build the default board, with every timestamp measured back from `at`.
 */
export function createDefaultBoard(at: number = Date.now()): CommLink[] {
    return SEEDS.map((seed) => {
        const messages: Message[] = seed.lines
            .map(([secondsAgo, body], i) => ({
                id: `${seed.id}-m${i}`,
                at: at - secondsAgo * 1000,
                body,
            }))
            .reverse()

        return {
            id: seed.id,
            name: seed.name,
            designator: seed.designator,
            status: seed.status,
            messages,
            ...(seed.fault
                ? { fault: { reason: seed.fault.reason, at: at - seed.fault.secondsAgo * 1000 } }
                : {}),
        }
    })
}
