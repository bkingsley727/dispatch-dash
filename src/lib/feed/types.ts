/**
 * Domain types for the dispatch board.
 *
 * These are deliberately transport-agnostic: nothing here knows whether the
 * messages arrived from a socket, a poll, or the in-browser demo simulator.
 */

export type LinkStatus = 'active' | 'standby' | 'error'

export interface Message {
    id: string
    /** Epoch milliseconds. Formatting is a view concern, never stored. */
    at: number
    body: string
}

export interface Fault {
    /** Operator-facing cause, e.g. "Carrier lost". */
    reason: string
    at: number
}

export interface CommLink {
    id: string
    /** Human name shown on the card, e.g. "Northgate Relay". */
    name: string
    /** Short operational designator, e.g. "NG-04". */
    designator: string
    status: LinkStatus
    /**
     * Newest last. Bounded by the source; the view never assumes a length.
     */
    messages: Message[]
    /** Set only while `status` is 'error'. */
    fault?: Fault
}
