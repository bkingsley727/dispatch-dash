import { useMemo, useState } from 'react'
import { AppHeader } from '@/components/app-header'
import { CommLinkCard } from '@/components/comm-link-card'
import { BoardSkeleton } from '@/components/card-skeleton'
import { EmptyBoard } from '@/components/empty-board'
import {
    BoardToolbar,
    type SortDir,
    type SortField,
    type StatusFilter,
} from '@/components/board-toolbar'
import { STATUS_META } from '@/components/status-indicator'
import { useCommLinks } from '@/hooks/use-comm-links'
import type { LinkStatus } from '@/lib/feed/types'

const STATUS_RANK: Record<LinkStatus, number> = { active: 0, standby: 1, error: 2 }

function emptyCounts(): Record<LinkStatus, number> {
    return { active: 0, standby: 0, error: 0 }
}

/**
 * Board shell.
 *
 * The board is a pure view over whatever the feed source hands it — filter,
 * sort and counts are all derived here, and nothing is cached across
 * emissions. That is what lets links change status underneath the operator
 * without the toolbar ever falling out of step with the cards.
 */
export default function App() {
    const links = useCommLinks()
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

    return (
        <div className="min-h-dvh">
            <AppHeader />

            <main className="mx-auto w-full max-w-[1600px] px-3 py-3 sm:px-6 md:py-4 lg:px-8 xl:px-12">
                <h1 className="sr-only">Relay comm links</h1>

                {links === null ? (
                    <>
                        <BoardSkeleton />
                        <p role="status" className="sr-only">
                            Loading comm links
                        </p>
                    </>
                ) : links.length === 0 ? (
                    <EmptyBoard />
                ) : (
                    <>
                        <BoardToolbar
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            sortField={sortField}
                            onSortFieldChange={setSortField}
                            sortDir={sortDir}
                            onSortDirToggle={() =>
                                setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                            }
                            counts={counts}
                            total={links.length}
                        />

                        {visibleLinks && visibleLinks.length === 0 ? (
                            <p className="text-muted-foreground border-border rounded-lg border border-dashed px-4 py-10 text-center text-sm">
                                No links match{' '}
                                <span className="font-medium">
                                    {statusFilter === 'all' ? 'this filter' : STATUS_META[statusFilter].label}
                                </span>
                                .
                            </p>
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
