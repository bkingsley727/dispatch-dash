import { cn } from '@/lib/utils'
import { formatClock } from '@/lib/format'
import type { Message } from '@/lib/feed/types'

/**
 * One line of traffic: `[HH:MM:SS] Message text here` — monospace throughout,
 * in the muted/secondary tone. Both choices exist to set the feed apart from
 * the rest of the interface, which is sans-serif and full-contrast: glance at
 * a card and the log region should read as a distinct instrument, not another
 * paragraph of UI copy.
 *
 * A wrapped line hangs under the message start rather than under the
 * bracket, so a long line still reads as prose rather than breaking back to
 * the left edge. `11ch` is the exact width of `[HH:MM:SS] ` in a monospace
 * face, so the indent lines up without measuring anything at runtime.
 */
export function FeedLine({ message, faded = false }: { message: Message; faded?: boolean }) {
    return (
        <p
            className={cn(
                'text-muted-foreground py-0.5 pl-[11ch] font-mono text-sm leading-snug indent-[-11ch]',
                faded && 'feed-fade-oldest',
            )}
        >
            <time dateTime={new Date(message.at).toISOString()} className="tabular-nums">
                [{formatClock(message.at)}]
            </time>{' '}
            {message.body}
        </p>
    )
}
