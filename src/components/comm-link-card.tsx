import { useState } from 'react'
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { StatusBadge, StatusChip, STATUS_META } from '@/components/status-indicator'
import { FeedFull, FeedPreview, PREVIEW_COUNT } from '@/components/feed-list'
import { formatClock } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CommLink } from '@/lib/feed/types'

/**
 * One comm link.
 *
 * The header reads left to right as status icon, name, status chip — the
 * icon and the chip's dot+text are two ends of the same status signal, not
 * two different pieces of information. Expansion is a small icon control
 * anchored to the corner of the feed itself, since the feed is the thing
 * being expanded.
 */
export function CommLinkCard({ link }: { link: CommLink }) {
    const [open, setOpen] = useState(false)

    const hiddenCount = Math.max(0, link.messages.length - PREVIEW_COUNT)
    const canExpand = hiddenCount > 0

    return (
        <Collapsible open={open} onOpenChange={setOpen} asChild>
            <article className="bg-card border-border rounded-lg border shadow-xs">
                {/* Header band: tinted and set apart from the feed below so the
                    link's identity reads before any of its traffic does. */}
                <header className="bg-muted/40 flex items-center gap-3 rounded-t-lg px-3 py-2 md:px-4">
                    <StatusBadge status={link.status} />

                    <div className="flex min-w-0 flex-1 items-baseline gap-2.5">
                        {/* Prominence is a desktop/tablet win: at phone width
                            the bolder, larger name would truncate too eagerly
                            against the status chip sharing the row, so it
                            steps up from the breakpoint up rather than
                            applying at every width. */}
                        <h2 className="truncate text-sm font-bold tracking-wide uppercase sm:text-base">
                            {link.name}
                        </h2>
                        <span className="text-muted-foreground hidden font-mono text-xs sm:inline">
                            {link.designator}
                        </span>
                    </div>

                    <StatusChip status={link.status} />
                </header>

                {link.status === 'error' && link.fault && (
                    <div
                        className={cn(
                            'flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 text-xs md:px-5',
                            STATUS_META.error.tint,
                        )}
                    >
                        <p className="text-status-error flex-1 font-medium">
                            {link.fault.reason}
                            <span className="text-muted-foreground ml-2 font-mono">
                                {formatClock(link.fault.at)}
                            </span>
                        </p>
                    </div>
                )}

                {/* relative: the expand control anchors to this region only —
                    "top right of the feed", not the card or the header. */}
                <div className="border-border/70 relative border-t px-4 py-2 md:px-5">
                    <div className={canExpand ? 'pr-9' : undefined}>
                        {open ? (
                            <CollapsibleContent>
                                <FeedFull messages={link.messages} linkName={link.name} />
                            </CollapsibleContent>
                        ) : (
                            <FeedPreview messages={link.messages} />
                        )}
                    </div>

                    {canExpand && (
                        <CollapsibleTrigger
                            title={open ? 'Collapse feed' : `Show ${hiddenCount} earlier messages`}
                            className="bg-card text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 border-border/70 absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-md border shadow-xs transition-colors focus-visible:ring-[3px] focus-visible:outline-none md:size-7"
                        >
                            {open ? (
                                <ChevronsDownUp aria-hidden="true" className="size-4" />
                            ) : (
                                <ChevronsUpDown aria-hidden="true" className="size-4" />
                            )}
                            <span className="sr-only">
                                {open ? 'Collapse feed' : `Show ${hiddenCount} earlier messages`}
                            </span>
                        </CollapsibleTrigger>
                    )}
                </div>
            </article>
        </Collapsible>
    )
}
