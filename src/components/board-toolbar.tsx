import { ArrowDown, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { STATUS_META } from '@/components/status-indicator'
import type { LinkStatus } from '@/lib/feed/types'

export type StatusFilter = 'all' | LinkStatus
export type SortField = 'name' | 'status'
export type SortDir = 'asc' | 'desc'

const STATUS_ORDER: LinkStatus[] = ['active', 'standby', 'error']

/**
 * Selected-state classes per status, written out in full. Tailwind's
 * scanner only picks up class names that appear as literal strings in
 * source — building `data-[state=on]:${tint}` via interpolation would
 * silently produce no CSS at all, so each combination is spelled out here
 * instead of composed from STATUS_META's fragments.
 */
const FILTER_ON_CLASS: Record<LinkStatus, string> = {
    active: 'data-[state=on]:bg-status-active-bg data-[state=on]:text-status-active',
    standby: 'data-[state=on]:bg-status-standby-bg data-[state=on]:text-status-standby',
    error: 'data-[state=on]:bg-status-error-bg data-[state=on]:text-status-error',
}

/**
 * Filter and sort controls for the board.
 *
 * Both are built from ToggleGroup rather than a <select>: a segmented
 * control shows every option and the current one at a glance, which fits
 * the density of five values or fewer far better than a dropdown that has
 * to be opened to be read.
 */
export function BoardToolbar({
    statusFilter,
    onStatusFilterChange,
    sortField,
    onSortFieldChange,
    sortDir,
    onSortDirToggle,
    counts,
    total,
}: {
    statusFilter: StatusFilter
    onStatusFilterChange: (value: StatusFilter) => void
    sortField: SortField
    onSortFieldChange: (value: SortField) => void
    sortDir: SortDir
    onSortDirToggle: () => void
    counts: Record<LinkStatus, number>
    total: number
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 pb-3 sm:gap-x-6 sm:gap-y-3">
            {/* items-start, not items-center: once the chip row wraps to two
                lines on a narrow viewport, centering would float the label
                between them instead of pinning it to the first line. */}
            <div className="flex items-center gap-2.5 pt-0.5">
                {/* <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Filter
                </span> */}
                <ToggleGroup
                    type="single"
                    size="sm"
                    className="flex-wrap"
                    value={statusFilter}
                    // Radix reports "" when the active item is clicked again;
                    // a filter needs a rest state, so re-clicking "all" (which
                    // is already the rest state) is a no-op rather than a
                    // dead end with nothing selected.
                    onValueChange={(value) => {
                        if (value) onStatusFilterChange(value as StatusFilter)
                    }}
                    aria-label="Filter by status"
                >
                    <ToggleGroupItem value="all" className="gap-1.5 text-xs font-medium">
                        All
                        <span className="text-muted-foreground tabular-nums">{total}</span>
                    </ToggleGroupItem>
                    {STATUS_ORDER.map((status) => {
                        const { label, Icon, stroke } = STATUS_META[status]
                        return (
                            <ToggleGroupItem
                                key={status}
                                value={status}
                                className={`gap-1.5 text-xs font-medium ${FILTER_ON_CLASS[status]}`}
                            >
                                <Icon aria-hidden="true" className="size-3.5" strokeWidth={stroke} />
                                {label}
                                <span className="text-muted-foreground tabular-nums">
                                    {counts[status]}
                                </span>
                            </ToggleGroupItem>
                        )
                    })}
                </ToggleGroup>
            </div>

            <div className="flex items-center gap-2.5 pt-0.5">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Sort
                </span>
                <ToggleGroup
                    type="single"
                    size="sm"
                    className="flex-wrap"
                    value={sortField}
                    onValueChange={(value) => {
                        if (value) onSortFieldChange(value as SortField)
                    }}
                    aria-label="Sort by"
                >
                    <ToggleGroupItem value="name" className="text-xs font-medium">
                        Name
                    </ToggleGroupItem>
                    <ToggleGroupItem value="status" className="text-xs font-medium">
                        Status
                    </ToggleGroupItem>
                </ToggleGroup>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={onSortDirToggle}
                    title={sortDir === 'asc' ? 'Sort ascending' : 'Sort descending'}
                    className="size-8"
                >
                    {sortDir === 'asc' ? (
                        <ArrowUp aria-hidden="true" className="size-3.5" />
                    ) : (
                        <ArrowDown aria-hidden="true" className="size-3.5" />
                    )}
                    <span className="sr-only">
                        {sortDir === 'asc' ? 'Sorted ascending, click for descending' : 'Sorted descending, click for ascending'}
                    </span>
                </Button>
            </div>
        </div>
    )
}
