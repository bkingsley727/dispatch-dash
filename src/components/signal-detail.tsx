import { Download, RadioTower } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignalCardHeader } from '@/components/signal-card-header'
import { STATUS_META } from '@/components/status-indicator'
import { FeedFull } from '@/components/feed-list'
import { formatClock } from '@/lib/format'
import { downloadLog } from '@/lib/download'
import { cn } from '@/lib/utils'
import type { CommLink } from '@/lib/feed/types'

/**
 * The selected signal, filling the right pane.
 *
 * This is the payoff of the two-pane layout: the whole buffer, at full window
 * height, instead of the 320px an expanded card can afford in a single
 * column. The pane is a fixed-height column — identity, fault, controls, then
 * a feed that takes every remaining pixel and scrolls inside itself, so the
 * header and the download control stay put while an operator reads back
 * through the traffic.
 *
 * Download is a full labelled button here, not the card's icon-only corner
 * control. There is room for the word, and pulling a log for a ticket is the
 * one thing an operator does with this pane besides read it.
 */
export function SignalDetail({ link }: { link: CommLink }) {
    const canDownload = link.messages.length > 0

    return (
        <section
            aria-label={`${link.name} activity`}
            className="detail-enter bg-card/70 border-border flex h-full min-h-0 flex-col overflow-hidden rounded-lg border shadow-xs"
        >
            <SignalCardHeader
                link={link}
                size="detail"
                className="bg-muted/40 shrink-0 px-4 py-3 md:px-5"
            />

            {link.status === 'error' && link.fault && (
                <div
                    className={cn(
                        'shrink-0 px-4 py-2 text-xs md:px-5',
                        STATUS_META.error.tint,
                    )}
                >
                    <p className="text-status-error font-medium">
                        {link.fault.reason}
                        <span className="text-muted-foreground ml-2 font-mono">
                            {formatClock(link.fault.at)}
                        </span>
                    </p>
                </div>
            )}

            <div className="border-border/60 flex shrink-0 items-center justify-between gap-3 border-y px-4 py-2 md:px-5">
                <p className="text-muted-foreground font-mono text-[0.7rem] tracking-wider uppercase">
                    {link.messages.length === 0
                        ? 'No traffic buffered'
                        : `${link.messages.length} messages buffered`}
                </p>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadLog(link)}
                    disabled={!canDownload}
                    title={
                        canDownload
                            ? `Download ${link.name} feed as .log`
                            : 'Nothing to download yet'
                    }
                >
                    <Download aria-hidden="true" />
                    Download log
                </Button>
            </div>

            {/* min-h-0 is what lets the feed scroll instead of pushing the
                pane taller than the window: without it this flex child refuses
                to shrink below its content. */}
            <div className="min-h-0 flex-1 px-4 py-2 md:px-5">
                <FeedFull
                    messages={link.messages}
                    linkName={link.name}
                    className="h-full"
                />
            </div>
        </section>
    )
}

/** Shown only when a filter leaves nothing to select. */
export function EmptyDetail() {
    return (
        <div className="border-border text-muted-foreground flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 text-center">
            <RadioTower aria-hidden="true" className="text-muted-foreground/40 size-7" />
            <p className="text-sm">No signal selected.</p>
        </div>
    )
}
