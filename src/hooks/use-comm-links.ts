import { useEffect, useState } from 'react'
import { demoFeed } from '@/lib/feed/simulator'
import type { FeedSource } from '@/lib/feed/source'
import type { CommLink } from '@/lib/feed/types'

/**
 * Subscribe the board to a feed source.
 *
 * `null` means "not connected yet" and is what the loading state renders
 * against; an empty array is a real, connected board with nothing on it.
 * Collapsing the two into one value would leave an empty board looking
 * exactly like a board that never arrived.
 *
 * The source is a parameter, defaulted to the demo, so the board can be
 * pointed at a real backend — or a fixed fixture, in a test — without the
 * component knowing which it got.
 */
export function useCommLinks(source: FeedSource = demoFeed): CommLink[] | null {
    const [links, setLinks] = useState<CommLink[] | null>(null)

    // subscribe() returns its own unsubscribe, which is exactly the cleanup
    // React wants back.
    useEffect(() => source.subscribe(setLinks), [source])

    return links
}
