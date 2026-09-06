import { useMemo, useState, type ReactNode } from 'react'
import { AppHeader } from '@/components/app-header'
import { CommLinkCard } from '@/components/comm-link-card'
import { BoardSkeleton, SignalListSkeleton } from '@/components/card-skeleton'
import { EmptyBoard } from '@/components/empty-board'
import { SignalList } from '@/components/signal-list'
import { EmptyDetail, SignalDetail } from '@/components/signal-detail'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
    BoardToolbar,
    type SortDir,
    type SortField,
    type StatusFilter,
} from '@/components/board-toolbar'
import { STATUS_META } from '@/components/status-indicator'
import { useCommLinks } from '@/hooks/use-comm-links'
import { TWO_COLUMN_QUERY, useMediaQuery } from '@/hooks/use-media-query'
import type { LinkStatus } from '@/lib/feed/types'

const STATUS_RANK: Record<LinkStatus, number> = { active: 0, standby: 1, error: 2 }

/**
 * List and detail. The list is given a floor so signal names and their
 * designators never collide, and the detail pane takes roughly twice the
 * width because it is the one showing full lines of traffic.
 */
const TWO_COLUMN_GRID =
    'grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(390px,1fr)_minmax(0,1.7fr)] xl:grid-cols-[minmax(430px,1fr)_minmax(0,2fr)]'

function emptyCounts(): Record<LinkStatus, number> {
    return { active: 0, standby: 0, error: 0 }
}

function PaneLabel({ children }: { children: ReactNode }) {
    return (
        <p className="text-muted-foreground text-[0.625rem] font-semibold tracking-widest uppercase">
            {children}
        </p>
    )
}

/**
 * Board shell.
 *
 * The board is a pure view over whatever the feed source hands it — filter,
 * sort and counts are all derived here, and nothing is cached across
 * emissions. That is what lets links change status underneath the operator
 * without the toolbar ever falling out of step with the cards.
 *
 * Above the breakpoint the board is a two-pane console: cards on the left are
 * selected rather than expanded, and the selection fills the right pane at
 * full window height. Below it there is no room for a second pane, so the
 * cards go back to opening in place.
 */
export default function App() {
    const links = useCommLinks()
    const twoColumn = useMediaQuery(TWO_COLUMN_QUERY)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortDir, setSortDir] = useState<SortDir>('asc')

    const counts = useMemo(() => {
        const c = emptyCounts()
        for (const link of links ?? []) c[link.status] += 1
        return c
    }, [links])

    const visibleLinks = useMemo(() => {
        if (!links) return null

        const filtered =
            statusFilter === 'all' ? links : links.filter((l) => l.status === statusFilter)

        // Status sorts by severity rank (active, then standby, then error) —
        // "ascending" is reading order for a monitoring board, not alphabetical,
        // which would otherwise put "Active" and "Error" next to each other
        // and bury the one status that most needs to surface first.
        const sorted = [...filtered].sort((a, b) => {
            const cmp =
                sortField === 'name'
                    ? a.name.localeCompare(b.name)
                    : STATUS_RANK[a.status] - STATUS_RANK[b.status]
            return sortDir === 'asc' ? cmp : -cmp
        })

        return sorted
    }, [links, statusFilter, sortField, sortDir])

    // Derived, not stored: one expression covers the first load (nothing
    // picked yet), a filter hiding the current selection, and a link leaving
    // the board. Storing the resolved selection instead would need an effect
    // to repair it, and would leave a frame where the pane shows a signal the
    // list no longer offers.
    const selected =
        visibleLinks?.find((link) => link.id === selectedId) ?? visibleLinks?.[0] ?? null

    const toolbar = (
        <BoardToolbar
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortField={sortField}
            onSortFieldChange={setSortField}
            sortDir={sortDir}
            onSortDirToggle={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            counts={counts}
            total={links?.length ?? 0}
        />
    )

    const noMatches = visibleLinks !== null && visibleLinks.length === 0
    const emptyFilterNotice = (
        <p className="text-muted-foreground border-border rounded-lg border border-dashed px-4 py-10 text-center text-sm">
            No links match{' '}
            <span className="font-medium">
                {statusFilter === 'all' ? 'this filter' : STATUS_META[statusFilter].label}
            </span>
            .
        </p>
    )

    return (
        // A fixed-height surface from the breakpoint up: the panes scroll, the
        // page does not. Below it the page scrolls normally, which is what a
        // phone expects.
        <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
            <AppHeader />

            <main className="flex w-full flex-1 flex-col px-3 py-3 sm:px-6 lg:min-h-0 lg:px-8 lg:py-4">
                <h1 className="sr-only">Relay comm links</h1>

                {links === null ? (
                    <>
                        {twoColumn ? (
                            <div className={TWO_COLUMN_GRID}>
                                <SignalListSkeleton />
                                <Skeleton className="h-full w-full rounded-lg" />
                            </div>
                        ) : (
                            <BoardSkeleton />
                        )}
                        <p role="status" className="sr-only">
                            Loading comm links
                        </p>
                    </>
                ) : links.length === 0 ? (
                    <EmptyBoard />
                ) : twoColumn ? (
                    <div className={TWO_COLUMN_GRID}>
                        <div className="flex min-h-0 flex-col gap-2.5">
                            <div className="flex items-baseline justify-between gap-2">
                                <PaneLabel>Signals</PaneLabel>
                                <span className="text-muted-foreground font-mono text-[0.625rem] tracking-widest tabular-nums uppercase">
                                    {visibleLinks?.length ?? 0} of {links.length}
                                </span>
                            </div>

                            {toolbar}

                            {noMatches ? (
                                emptyFilterNotice
                            ) : (
                                <ScrollArea className="min-h-0 flex-1 pr-1">
                                    <SignalList
                                        links={visibleLinks ?? []}
                                        selectedId={selected?.id ?? null}
                                        onSelect={setSelectedId}
                                    />
                                </ScrollArea>
                            )}
                        </div>

                        <div className="min-h-0">
                            {/* Keyed on the signal: each selection mounts a
                                fresh pane, which plays the enter animation and
                                re-pins the feed to its newest line. */}
                            {selected ? (
                                <SignalDetail key={selected.id} link={selected} />
                            ) : (
                                <EmptyDetail />
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="pb-3">{toolbar}</div>

                        {noMatches ? (
                            emptyFilterNotice
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                {visibleLinks?.map((link) => (
                                    <CommLinkCard key={link.id} link={link} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
