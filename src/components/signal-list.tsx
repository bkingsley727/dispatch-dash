import { memo, useRef, type KeyboardEvent } from 'react'
import { SignalCardHeader } from '@/components/signal-card-header'
import { STATUS_META } from '@/components/status-indicator'
import { FeedPreview } from '@/components/feed-list'
import { cn } from '@/lib/utils'
import type { CommLink } from '@/lib/feed/types'

/**
 * The selectable signal list — the left half of the two-pane console.
 *
 * A listbox, not a stack of buttons. Two reasons, both practical: a button may
 * only contain phrasing content, and these rows carry a three-line feed
 * preview built from paragraphs; and an operator scanning a board wants to
 * walk it with the arrow keys rather than tabbing through every signal to
 * reach the last one. Selection follows focus, which is the standard
 * single-select listbox behaviour and exactly what a master-detail pane wants.
 *
 * Roving tabindex: only the selected row is a tab stop, so the list is one
 * stop on the way to the detail pane instead of five.
 */
export function SignalList({
    links,
    selectedId,
    onSelect,
}: {
    links: CommLink[]
    selectedId: string | null
    onSelect: (id: string) => void
}) {
    const listRef = useRef<HTMLUListElement>(null)

    function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
        const current = links.findIndex((link) => link.id === selectedId)

        let next: number
        switch (event.key) {
            case 'ArrowDown':
                next = Math.min(links.length - 1, current + 1)
                break
            case 'ArrowUp':
                next = Math.max(0, current - 1)
                break
            case 'Home':
                next = 0
                break
            case 'End':
                next = links.length - 1
                break
            default:
                return
        }

        const link = links[next]
        if (!link) return

        // Arrow keys scroll a listbox by default; here they move the
        // selection, and the browser brings the newly focused row into view.
        event.preventDefault()
        onSelect(link.id)
        listRef.current
            ?.querySelector<HTMLElement>(`[data-signal-id="${link.id}"]`)
            ?.focus()
    }

    return (
        <ul
            ref={listRef}
            role="listbox"
            aria-label="Signals"
            className="flex flex-col gap-2"
            onKeyDown={handleKeyDown}
        >
            {links.map((link) => (
                <SignalListItem
                    key={link.id}
                    link={link}
                    selected={link.id === selectedId}
                    onSelect={onSelect}
                />
            ))}
        </ul>
    )
}

function SignalListItemImpl({
    link,
    selected,
    onSelect,
}: {
    link: CommLink
    selected: boolean
    onSelect: (id: string) => void
}) {
    return (
        <li
            role="option"
            aria-selected={selected}
            data-signal-id={link.id}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(link.id)}
            className={cn(
                'focus-visible:ring-ring/50 relative cursor-pointer overflow-hidden rounded-lg border shadow-xs transition-colors duration-150 outline-none focus-visible:ring-[3px]',
                selected
                    ? 'border-border bg-accent/70'
                    : 'border-border/70 bg-card/70 hover:border-border hover:bg-accent/35',
            )}
        >
            {/* Status-coloured selection marker. It grows from the card's left
                edge rather than fading in, so the eye can follow the selection
                moving down the list instead of hunting for where it landed. */}
            <span
                aria-hidden="true"
                className={cn(
                    'absolute inset-y-0 left-0 w-[3px] origin-left transition-transform duration-150 ease-out',
                    STATUS_META[link.status].dot,
                    selected ? 'scale-x-100' : 'scale-x-0',
                )}
            />

            <SignalCardHeader
                link={link}
                nameAs="span"
                size="list"
                className={cn(
                    'px-3 py-2 transition-colors md:px-4',
                    selected ? 'bg-muted/50' : 'bg-muted/30',
                )}
            />

            <div className="border-border/60 border-t px-4 py-2 md:px-5">
                <FeedPreview messages={link.messages} />
            </div>
        </li>
    )
}

/**
 * Memoised on link identity and selection: switching signals re-renders the
 * row losing selection and the row gaining it, not the whole board.
 */
const SignalListItem = memo(SignalListItemImpl)
