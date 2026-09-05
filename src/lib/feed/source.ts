import type { CommLink } from './types'

/**
 * The board's data contract.
 *
 * Everything above this line is transport-agnostic: the view subscribes and
 * receives whole boards, and never learns whether they came from a socket, a
 * poll, or the in-browser demo simulator. Swapping the demo for a real
 * backend means writing another `FeedSource` and nothing else.
 *
 * Boards are delivered whole rather than as deltas because the view already
 * derives everything it shows (counts, filters, sort order) from the full
 * list — a delta protocol would only move that reassembly work into the
 * component. Link objects that did not change keep their identity across
 * emissions, so "whole board" stays cheap to render.
 */
export interface FeedSource {
    /**
     * Begin receiving boards. The listener is called once the source has
     * connected — never synchronously — and again on every change.
     *
     * @returns unsubscribe. Safe to call more than once.
     */
    subscribe(listener: (links: CommLink[]) => void): () => void
}
