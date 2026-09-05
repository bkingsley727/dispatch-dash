import { Activity, ClockFading, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LinkStatus } from '@/lib/feed/types'

/**
 * Status is carried on three independent channels at once — colour, icon
 * silhouette, and text. Never colour alone: that fails for roughly 8% of men
 * with a red/green deficiency, and again under forced-colors mode where the
 * palette is replaced wholesale.
 *
 * The icons are chosen for silhouette contrast, not just meaning:
 *   Activity      horizontal zigzag   traffic is moving on this line
 *   ClockFading   fading clock face   idle, waiting — not urgent
 *   TriangleAlert triangle            fault
 *
 * Nothing here is amber. Amber neighbours red, which would make the two
 * states most in need of separation the easiest pair to confuse at a glance,
 * and it implies caution when standby is a perfectly healthy state.
 */
export const STATUS_META: Record<
    LinkStatus,
    {
        label: string
        Icon: LucideIcon
        /** Per-icon stroke: dense glyphs need a thinner line to stay legible. */
        stroke: number
        text: string
        dot: string
        tint?: string
    }
> = {
    active: {
        label: 'Active',
        Icon: Activity,
        stroke: 2.25,
        text: 'text-status-active',
        dot: 'bg-status-active',
    },
    standby: {
        label: 'Standby',
        Icon: ClockFading,
        stroke: 1.6,
        text: 'text-status-standby',
        dot: 'bg-status-standby',
    },
    error: {
        label: 'Error',
        Icon: TriangleAlert,
        stroke: 2.25,
        text: 'text-status-error',
        dot: 'bg-status-error',
        tint: 'bg-status-error-bg',
    },
}

/**
 * Bare status icon, anchored to the far left of a card header. No circle,
 * no fill — just the coloured silhouette that tells the icon-shape channel
 * apart from the badge it used to sit inside.
 */
export function StatusBadge({ status, className }: { status: LinkStatus; className?: string }) {
    const { Icon, stroke, text } = STATUS_META[status]

    return (
        <Icon
            aria-hidden="true"
            className={cn('size-5 shrink-0', text, className)}
            strokeWidth={stroke}
        />
    )
}

/**
 * Outlined tag, anchored to the far right of a card header — a small solid
 * dot (the live/motion channel), then the status text. Square-cornered and
 * bordered rather than a filled pill: the border colour comes from
 * `border-current`, which just follows whatever `text` sets, so there's no
 * separate border token to keep in sync with it.
 */
export function StatusChip({ status, className }: { status: LinkStatus; className?: string }) {
    const { label, text, dot } = STATUS_META[status]

    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-current px-2.5 py-1 text-xs font-semibold tracking-widest uppercase',
                text,
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={cn('size-1.5 rounded-full', dot, status === 'active' && 'signal-pulse')}
            />
            {/* Sentence case in the DOM, uppercased in CSS — screen readers
                should say "Standby", not spell out the letters. */}
            {label}
        </span>
    )
}
