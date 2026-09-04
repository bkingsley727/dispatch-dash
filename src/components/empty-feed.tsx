import { RadioReceiver } from 'lucide-react'

/**
 * A connected link that has not spoken yet. This is a normal operating
 * condition, not a failure, so it reads as waiting rather than broken —
 * and it says what it is waiting for.
 *
 * Laid out on one line rather than stacked: an idle link should not tower
 * over its neighbours and break the board's vertical rhythm.
 */
export function EmptyFeed() {
    return (
        <div className="flex items-center justify-center gap-2.5 py-3 text-center">
            <RadioReceiver aria-hidden="true" className="text-muted-foreground/50 size-4" />
            <p className="text-muted-foreground text-sm">Awaiting first transmission</p>
            <span className="text-muted-foreground/60 hidden text-xs sm:inline">
                — link is up and listening
            </span>
        </div>
    )
}
