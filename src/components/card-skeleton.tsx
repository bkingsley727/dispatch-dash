import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading placeholder shaped like the card it replaces — bare status icon,
 * name, status-chip pill, three feed lines — so the board does not reflow
 * when real data lands. Kept in step with CommLinkCard's header shape
 * on purpose: a skeleton previewing a layout that no longer exists is
 * worse than no skeleton at all.
 */
export function CardSkeleton() {
    return (
        <div className="bg-card border-border rounded-lg border shadow-xs">
            <div className="bg-muted/40 flex items-center gap-3 rounded-t-lg px-3 py-2 md:px-4">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-3.5 w-28" />
                <div className="flex-1" />
                <Skeleton className="h-6 w-20 rounded-sm" />
            </div>
            <div className="border-border/70 space-y-2 border-t px-4 py-3 md:px-5">
                <Skeleton className="h-3 w-[70%]" />
                <Skeleton className="h-3 w-[55%]" />
                <Skeleton className="h-3 w-[62%]" />
            </div>
        </div>
    )
}

export function BoardSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div aria-hidden="true" className="flex flex-col gap-3">
            {Array.from({ length: count }, (_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}
