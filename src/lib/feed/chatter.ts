/**
 * Traffic the demo simulator puts on the wire.
 *
 * Kept apart from the simulator itself so the timing model and the prose can
 * be read — and changed — independently: this file is what the board *says*,
 * simulator.ts is *when* it says it.
 *
 * Lines are templates with `{unit}`, `{grid}` and `{street}` slots filled at
 * emit time. That is what keeps a long session from reading as a loop: a
 * few dozen templates times the slot values is a large enough space that
 * repeats stay rare, without hand-writing hundreds of lines.
 */

const UNITS = ['Unit 4', 'Unit 6', 'Unit 7', 'Unit 9', 'Unit 12', 'Unit 15', 'Unit 21']
const GRIDS = ['grid 3', 'grid 7', 'grid 9', 'sector 2', 'sector 3', 'sector 5']
const STREETS = ['Vernon', 'Halsted', 'Fifth and Main', 'the ridge road', 'Pier 3', 'Eastside']

/** Routine traffic on a link that is carrying calls. */
const ACTIVE_LINES = [
    '{unit} en route, ETA 6 min',
    '{unit} on scene, beginning survey',
    '{unit} clear of the scene',
    '{unit} checking in from {grid}',
    '{unit} requesting route around {street} closure',
    '{unit} standing down, returning to post',
    '{unit} acknowledging, en route',
    '{unit} reporting minor collision at {street}',
    '{unit} diverting to assist',
    'Copy {unit}, proceed to standard patrol',
    'Copy that, proceeding to {grid}',
    'Reroute approved via {street}',
    'Dispatch, confirm handoff',
    'Handoff confirmed, you are clear',
    'Traffic control notified, lanes held',
    'Assigning {unit} to the first call in queue',
    'Two more calls holding in queue',
    'Queue clear, standing by',
    'Tow requested for disabled vehicle at {street}',
    'Tow en route, ETA 15 minutes',
    'Scene secured, one lane open',
    'Flaggers dispatched from station 2',
    '{street} reopened, all lanes clear',
    'Log updated, shift board current',
    'Radio check, all units respond',
    'All units accounted for, radio check complete',
    'Weather advisory issued for {grid}, monitor conditions',
    'Acknowledged, visibility dropping on {street}',
]

/** The sparse housekeeping a quiet link still puts out. */
const STANDBY_LINES = [
    'Channel idle, holding',
    'Nothing to report',
    'Watch rotation complete',
    'Camera check at {street} — nominal',
    'Holding steady, no active calls',
    'Shift log updated',
    'Perimeter sweep complete, {grid} clear',
    'Handing watch to next shift',
]

/** First line after a link wakes from stand-by. */
const WAKE_LINES = [
    'Coming up on channel, {unit} inbound',
    'Call assigned, taking {grid}',
    'Traffic inbound, link going active',
    'Dispatch has work for us, standing to',
]

/** First line after a fault clears. */
const RECOVERY_LINES = [
    'Carrier restored, link back on channel',
    'Backup antenna holding, signal nominal',
    'Fault cleared, resuming normal watch',
    'Link re-acquired, no traffic lost',
]

/** Operator-facing causes for the fault banner. */
const FAULT_REASONS = [
    'Carrier lost — no acknowledgement in 3 cycles',
    'Signal below threshold — backup antenna not responding',
    'Repeater timeout — no keying detected',
    'Sync lost — channel drift beyond tolerance',
    'Power fault reported at mast — running on reserve',
]

function pick<T>(items: readonly T[], rng: () => number): T {
    return items[Math.floor(rng() * items.length)]
}

function fill(template: string, rng: () => number): string {
    return template
        .replace('{unit}', () => pick(UNITS, rng))
        .replace('{grid}', () => pick(GRIDS, rng))
        .replace('{street}', () => pick(STREETS, rng))
}

export type ChatterKind = 'active' | 'standby' | 'wake' | 'recovery'

const LINES: Record<ChatterKind, readonly string[]> = {
    active: ACTIVE_LINES,
    standby: STANDBY_LINES,
    wake: WAKE_LINES,
    recovery: RECOVERY_LINES,
}

export function chatterLine(kind: ChatterKind, rng: () => number): string {
    return fill(pick(LINES[kind], rng), rng)
}

export function faultReason(rng: () => number): string {
    return pick(FAULT_REASONS, rng)
}
