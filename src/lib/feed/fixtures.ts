import type { CommLink, Message } from './types'

/**
 * Static board used while the visual design is under review, before the demo
 * simulator is wired in. Anchored to load time so timestamps read as recent
 * traffic rather than a stale fixed date.
 */

const NOW = Date.now()

/**
 * `lines` are ordered newest-first for readability here; the returned feed is
 * flipped to the newest-last order the view expects.
 */
function feed(linkId: string, lines: [secondsAgo: number, body: string][]): Message[] {
    return lines
        .map(([secondsAgo, body], i) => ({
            id: `${linkId}-m${i}`,
            at: NOW - secondsAgo * 1000,
            body,
        }))
        .reverse()
}

export const FIXTURE_LINKS: CommLink[] = [
    {
        id: 'northgate',
        name: 'Northgate Relay',
        designator: 'NG-04',
        status: 'active',
        messages: feed('northgate', [
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
        ]),
    },
    {
        id: 'harbor',
        name: 'Harbor Watch',
        designator: 'HW-11',
        status: 'standby',
        messages: feed('harbor', [
            [248, 'Channel idle, holding'],
            [612, 'Tide watch complete, nothing to report'],
            [980, 'Pier 3 camera back online'],
            [1444, 'Handing watch to night shift'],
            [1902, 'Night shift acknowledged'],
        ]),
    },
    {
        id: 'ridgeline',
        name: 'Ridgeline Post',
        designator: 'RL-02',
        status: 'error',
        fault: { reason: 'Carrier lost — no acknowledgement in 3 cycles', at: NOW - 184 * 1000 },
        messages: feed('ridgeline', [
            [191, 'Signal degrading, switching to backup antenna'],
            [206, 'Backup antenna online, quality poor'],
            [233, 'Ridgeline, do you copy'],
            [271, 'Wind advisory in effect at summit'],
            [318, 'Mast inspection scheduled for 0800'],
        ]),
    },
    {
        id: 'crosstown',
        name: 'Crosstown Dispatch',
        designator: 'CT-07',
        status: 'active',
        messages: feed('crosstown', [
            [4, 'Unit 12 clear of the scene'],
            [17, 'Roger, marking closed at 14:21'],
            [31, 'Two more calls holding in queue'],
            [46, 'Assigning Unit 6 to the first'],
            [63, 'Unit 6 acknowledging, en route'],
            [88, 'Second call reassigned to Eastside'],
            [117, 'Eastside confirms, they have capacity'],
            [149, 'Queue clear, standing by'],
        ]),
    },
    {
        id: 'sable',
        name: 'Sable Ridge Outpost',
        designator: 'SR-19',
        status: 'standby',
        // Deliberately empty: exercises the "awaiting first transmission" state.
        messages: [],
    },
]
