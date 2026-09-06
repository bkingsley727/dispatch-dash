import { StatusBadge, StatusChip } from '@/components/status-indicator'
import { cn } from '@/lib/utils'
import type { CommLink } from '@/lib/feed/types'

/**
 * The identity row for a signal: status icon, name, designator, status chip.
 *
 * Extracted because three surfaces now show it — the expandable card, the
 * selectable list row, and the detail pane header — and a board where the same
 * link reads differently depending on which pane you are looking at would be
 * worse than no consistency rule at all. Same reasoning the loading skeleton
 * is held in step with the card it stands in for.
 *
 * `nameAs` exists for the list row: an option in a listbox is a selectable
 * item, not a section, so the name there is a span. Only the surfaces that
 * really do head a region get a heading element.
 */
export function SignalCardHeader({
    link,
    nameAs: Name = 'h2',
    size = 'card',
    className,
}: {
    link: CommLink
    nameAs?: 'h2' | 'span'
    size?: 'card' | 'list' | 'detail'
    className?: string
}) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <StatusBadge status={link.status} className={size === 'detail' ? 'size-6' : undefined} />

            <div className="flex min-w-0 flex-1 items-baseline gap-2.5">
                {/* Prominence is a desktop/tablet win: at phone width the
                    bolder, larger name would truncate too eagerly against the
                    status chip sharing the row, so it steps up from the
                    breakpoint rather than applying at every width. */}
                <Name
                    className={cn(
                        'truncate font-bold tracking-wide uppercase',
                        size === 'detail' && 'text-base sm:text-lg',
                        // The list column is the narrowest surface the header
                        // appears on, and it has a status chip and a
                        // designator sharing the row: holding the name at
                        // text-sm is what keeps whole names readable there
                        // instead of truncating most of them.
                        size === 'list' && 'text-sm',
                        size === 'card' && 'text-sm sm:text-base',
                    )}
                >
                    {link.name}
                </Name>
                <span className="text-muted-foreground hidden shrink-0 font-mono text-xs whitespace-nowrap sm:inline">
                    {link.designator}
                </span>
            </div>

            <StatusChip status={link.status} />
        </div>
    )
}
