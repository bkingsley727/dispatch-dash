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
 * Selected-state classes per tile, written out in full. Tailwind's scanner
 * only picks up class names that appear as literal strings in source —
 * building `data-[state=on]:${tint}` by interpolation would silently produce
 * no CSS at all, so each combination is spelled out here rather than composed
 * from STATUS_META's fragments.
 */
const TILE_ON_CLASS: Record<StatusFilter, string> = {
    all: 'data-[state=on]:border-foreground/25 data-[state=on]:bg-muted data-[state=on]:text-foreground',
    active: 'data-[state=on]:border-status-active/45 data-[state=on]:bg-status-active-bg data-[state=on]:text-status-active',
    standby: 'data-[state=on]:border-status-standby/45 data-[state=on]:bg-status-standby-bg data-[state=on]:text-status-standby',
    error: 'data-[state=on]:border-status-error/45 data-[state=on]:bg-status-error-bg data-[state=on]:text-status-error',
}

/** Shared tile shape: a count over its label, sized by content rather than by the toggle's stock height. */
const TILE_CLASS =
    'h-auto min-w-0 flex-col items-start gap-1 rounded-md border border-border/60 bg-card/50 px-2.5 py-2 transition-colors'

/**
 * The board's state and its filter, as one control.
 *
 * The counts and the filter chips used to be two things saying the same
 * numbers a few pixels apart. A tile that reports "2 standby" and *is* the
 * standby filter removes the duplication and gives the operator a target
 * worth aiming at — read the board and act on it in one movement.
 *
 * Built on ToggleGroup rather than hand-rolled buttons: single-select radio
 * semantics, keyboard handling, and the roving focus all come with it, and
 * only the skin is ours.
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
        <div className="flex flex-col gap-2.5">
            <ToggleGroup
                type="single"
                className="grid w-full grid-cols-2 gap-1.5 rounded-none sm:grid-cols-4"
                value={statusFilter}
                // Radix reports "" when the active item is clicked again; a
                // filter needs a rest state, so re-clicking "All" (which is
                // already the rest state) is a no-op rather than a dead end
                // with nothing selected.
                onValueChange={(value) => {
                    if (value) onStatusFilterChange(value as StatusFilter)
                }}
                aria-label="Filter by status"
            >
                <ToggleGroupItem
                    value="all"
                    className={`${TILE_CLASS} ${TILE_ON_CLASS.all}`}
                    aria-label={`All signals, ${total}`}
                >
                    <span className="text-foreground text-xl leading-none font-semibold tabular-nums group-data-[state=on]/toggle:text-current">
                        {total}
                    </span>
                    <span className="text-muted-foreground truncate text-[0.625rem] font-semibold tracking-wider uppercase group-data-[state=on]/toggle:text-current">
                        All
                    </span>
                </ToggleGroupItem>

                {STATUS_ORDER.map((status) => {
                    const { label, Icon, stroke } = STATUS_META[status]
                    return (
                        <ToggleGroupItem
                            key={status}
                            value={status}
                            className={`${TILE_CLASS} ${TILE_ON_CLASS[status]}`}
                            aria-label={`${label}, ${counts[status]}`}
                        >
                            <span className="text-foreground text-xl leading-none font-semibold tabular-nums group-data-[state=on]/toggle:text-current">
                                {counts[status]}
                            </span>
                            <span className="text-muted-foreground flex w-full min-w-0 items-center gap-1 text-[0.625rem] font-semibold tracking-wider uppercase group-data-[state=on]/toggle:text-current">
                                <Icon aria-hidden="true" className="size-3 shrink-0" strokeWidth={stroke} />
                                <span className="truncate">{label}</span>
                            </span>
                        </ToggleGroupItem>
                    )
                })}
            </ToggleGroup>

            <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-[0.625rem] font-semibold tracking-widest uppercase">
                    Sort
                </span>

                <ToggleGroup
                    type="single"
                    size="sm"
                    spacing={0}
                    className="border-border/60 overflow-hidden rounded-md border"
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
                    className="size-11 md:size-7"
                >
                    {sortDir === 'asc' ? (
                        <ArrowUp aria-hidden="true" className="size-3.5" />
                    ) : (
                        <ArrowDown aria-hidden="true" className="size-3.5" />
                    )}
                    <span className="sr-only">
                        {sortDir === 'asc'
                            ? 'Sorted ascending, click for descending'
                            : 'Sorted descending, click for ascending'}
                    </span>
                </Button>
            </div>
        </div>
    )
}
