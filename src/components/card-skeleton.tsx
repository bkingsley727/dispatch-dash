import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading placeholder shaped like the card it replaces — status chip, name,
 * download slot, three feed lines — so the board does not reflow when real
 * data lands.
 */
export function CardSkeleton() {
    return (
        <div className="bg-card border-border rounded-lg border shadow-xs">
            <div className="flex items-center gap-3 px-3 py-2.5 md:px-4">
                <Skeleton className="size-2 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-40" />
                <div className="flex-1" />
                <Skeleton className="size-5 rounded" />
            </div>
            <div className="border-border/70 space-y-2 border-t px-3 py-3 md:px-4">
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
