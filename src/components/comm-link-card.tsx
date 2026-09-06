import { memo, useState } from 'react'
import { ChevronsDownUp, ChevronsUpDown, Download } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { STATUS_META } from '@/components/status-indicator'
import { SignalCardHeader } from '@/components/signal-card-header'
import { FeedFull, FeedPreview, PREVIEW_COUNT } from '@/components/feed-list'
import { formatClock } from '@/lib/format'
import { downloadLog } from '@/lib/download'
import { cn } from '@/lib/utils'
import type { CommLink } from '@/lib/feed/types'

/**
 * One comm link, expandable in place.
 *
 * This is the narrow-screen card: below the two-column breakpoint there is no
 * detail pane to send a selection to, so the feed opens where it stands.
 *
 * The header reads left to right as status icon, name, status chip — the
 * icon and the chip's dot+text are two ends of the same status signal, not
 * two different pieces of information.
 *
 * The feed's controls move with the state they act on. Collapsed, expansion
 * is a single icon tucked into the corner of the feed, since the feed is the
 * thing being expanded and one control does not earn a row of its own. Opened,
 * download joins it and the pair moves up into a row under the header: two
 * touch targets floating over the top-right of the traffic would sit on the
 * newest lines an operator just opened the card to read.
 */
function CommLinkCardImpl({ link }: { link: CommLink }) {
    const [open, setOpen] = useState(false)

    const hiddenCount = Math.max(0, link.messages.length - PREVIEW_COUNT)
    const canExpand = hiddenCount > 0
    const canDownload = link.messages.length > 0
    // A feed with content but nothing to hide (1–3 messages) still needs a
    // way out: expand never becomes available for it, so download can't
    // wait for `open` the way it does for longer feeds — it has to be its
    // own always-visible control instead.
    const showDownload = canDownload && (open || !canExpand)
    const showCollapseTrigger = canExpand
    const controlCount = Number(showDownload) + Number(showCollapseTrigger)

    // Built once and placed in one of two containers below, since the same
    // two buttons sit in the feed's corner while collapsed and in a row of
    // their own while open.
    const controls = controlCount > 0 && (
        <>
            {/* Download only appears once expanded (for feeds with more
                history than the preview shows) or always (for feeds too short
                to ever expand) — either way, a feed with content always has a
                way out. */}
            {showDownload && (
                <Button
                    variant="ghost"
                    onClick={() => downloadLog(link)}
                    title={`Download ${link.name} feed as .log`}
                    className="bg-card hover:bg-accent border-border/70 text-muted-foreground hover:text-foreground size-11 border shadow-xs md:size-7"
                >
                    <Download aria-hidden="true" className="size-4" />
                    <span className="sr-only">Download {link.name} feed as a log file</span>
                </Button>
            )}
            {showCollapseTrigger && (
                <CollapsibleTrigger
                    title={open ? 'Collapse feed' : `Show ${hiddenCount} earlier messages`}
                    className="bg-card text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 border-border/70 flex size-11 items-center justify-center rounded-md border shadow-xs transition-colors focus-visible:ring-[3px] focus-visible:outline-none md:size-7"
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
        </>
    )

    return (
        <Collapsible open={open} onOpenChange={setOpen} asChild>
            <article className="bg-card border-border rounded-lg border shadow-xs">
                {/* Header band: tinted and set apart from the feed below so the
                    link's identity reads before any of its traffic does. */}
                <SignalCardHeader
                    link={link}
                    className="bg-muted/40 rounded-t-lg px-3 py-2 md:px-4"
                />

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

                {/* relative: the collapsed card's corner control anchors to
                    this region only — "top right of the feed", not the card or
                    the header. */}
                <div className="border-border/70 relative border-t px-4 py-2 md:px-5">
                    {open && controls && (
                        <div className="flex items-center justify-end gap-1.5 pb-2">
                            {controls}
                        </div>
                    )}

                    {/* Clearance for the corner controls: wide enough for two
                        44px touch targets side by side on mobile (94px), down
                        to two 28px controls at md+ (62px) when both download
                        and collapse show together; a single button's worth
                        otherwise. Only applies while collapsed — once open the
                        controls are in the flow above and overlap nothing. */}
                    <div
                        className={cn(
                            !open && controlCount === 2 && 'pr-24 md:pr-16',
                            !open && controlCount === 1 && 'pr-14 md:pr-9',
                        )}
                    >
                        {open ? (
                            <CollapsibleContent>
                                <FeedFull messages={link.messages} linkName={link.name} />
                            </CollapsibleContent>
                        ) : (
                            <FeedPreview messages={link.messages} />
                        )}
                    </div>

                    {!open && controls && (
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1.5">
                            {controls}
                        </div>
                    )}
                </div>
            </article>
        </Collapsible>
    )
}

/**
 * Memoised on `link` identity. The feed source replaces only the link objects
 * that actually changed on a given tick, so a board of five cards re-renders
 * the one that just received a message rather than all five — which matters
 * most for the expanded card, where a re-render walks the whole buffer.
 */
export const CommLinkCard = memo(CommLinkCardImpl)
