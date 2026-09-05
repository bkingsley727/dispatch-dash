import { ScrollArea } from '@/components/ui/scroll-area'
import { FeedLine } from '@/components/feed-line'
import { EmptyFeed } from '@/components/empty-feed'
import { useStickyScroll } from '@/hooks/use-sticky-scroll'
import type { Message } from '@/lib/feed/types'

/** Lines shown while the card is collapsed. */
export const PREVIEW_COUNT = 3

/**
 * Collapsed: the newest few lines, oldest of them masked to a fade so the
 * truncation is visible before the "show earlier" label is read.
 *
 * The faded line is NOT hidden from assistive tech. Fading is a visual
 * de-emphasis; removing real content from the accessibility tree because it
 * looks dim would silently cost screen reader users a message.
 */
export function FeedPreview({ messages }: { messages: Message[] }) {
    if (messages.length === 0) return <EmptyFeed />

    const preview = messages.slice(-PREVIEW_COUNT)
    const isTruncated = messages.length > PREVIEW_COUNT

    return (
        <div>
            {preview.map((message, i) => (
                <FeedLine
                    key={message.id}
                    message={message}
                    faded={isTruncated && i === 0}
                />
            ))}
        </div>
    )
}

/**
 * Expanded: the whole buffer, oldest at top, newest at bottom, following the
 * tail only while the reader is already there.
 *
 * `max-h-80`, not `h-80`: a short feed should expand to exactly its own
 * height with no dead space at the bottom, and only cap and start
 * scrolling once the content actually reaches 320px. `max-height` on the
 * Root plus `height: 100%` on Radix's Viewport is what makes that work —
 * with height undefined, the Root shrinks to fit its content up to the
 * cap; only past the cap does it become a definite 320px that the
 * Viewport (and its own scrolling) then fills exactly.
 *
 * `role="log"` with a polite live region is applied here and only here. Five
 * simultaneously-live feeds would make the page unusable with a screen
 * reader, so collapsed previews stay silent.
 */
export function FeedFull({ messages, linkName }: { messages: Message[]; linkName: string }) {
    // The newest message's id, not the count: the source caps each buffer, so
    // once a busy link is full its length stops changing and a count-based
    // revision would quietly stop following the tail exactly when there is
    // the most traffic to follow.
    const { viewportRef, handleScroll } = useStickyScroll(messages.at(-1)?.id, true)

    if (messages.length === 0) return <EmptyFeed />

    return (
        <ScrollArea
            className="max-h-80"
            viewportRef={viewportRef}
            onScrollCapture={handleScroll}
        >
            <div
                role="log"
                aria-live="polite"
                aria-label={`${linkName} feed`}
                className="pr-1"
            >
                {messages.map((message) => (
                    <FeedLine key={message.id} message={message} />
                ))}
            </div>
        </ScrollArea>
    )
}
