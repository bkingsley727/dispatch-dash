import { createDefaultBoard } from './fixtures'
import type { FeedSource } from './source'
import type { CommLink } from './types'

/**
 * The board the app runs against.
 *
 * A `FeedSource` over the fixture board: it connects, publishes once, and
 * holds. There is no live transport behind it yet — pointing the dashboard at
 * a real dispatch backend means writing another `FeedSource` and changing the
 * default `useCommLinks` reaches for, and nothing above this line has to move.
 *
 * The board is built on first connect rather than at module load, so its
 * timestamps are anchored to when the operator opened the dashboard. It is
 * then held, so a second subscriber — including StrictMode's remount — joins
 * the same board rather than forking a private copy with its own clock.
 */
export function createBoardSource(
    createBoard: () => CommLink[] = createDefaultBoard,
): FeedSource {
    let links: CommLink[] | undefined

    return {
        subscribe(listener) {
            // The contract promises the listener is never called
            // synchronously, so the board is delivered on a later turn of the
            // event loop — which is what lets the view show its loading state
            // first rather than skipping straight past it.
            let live = true
            queueMicrotask(() => {
                if (!live) return
                links ??= createBoard()
                listener(links)
            })

            return () => {
                live = false
            }
        },
    }
}

/** Module singleton, so every subscriber shares one board. */
export const boardFeed = createBoardSource()
