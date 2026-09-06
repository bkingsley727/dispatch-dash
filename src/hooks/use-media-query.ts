import { useCallback, useMemo, useSyncExternalStore } from 'react'

/**
 * Width at which the board becomes a two-pane console.
 *
 * Tailwind's `lg`, kept here as the single definition so the JS that decides
 * *behaviour* (selectable card vs. expandable card) and the CSS that decides
 * *layout* can never disagree about where the switch happens.
 */
export const TWO_COLUMN_QUERY = '(min-width: 1024px)'

/**
 * Track a media query as React state.
 *
 * `useSyncExternalStore` rather than `useState` + an effect: the match lives
 * outside React, and this hook reads it during render instead of catching up
 * to it one paint later — so the board never renders the wrong layout first
 * and then swaps it out underneath the operator.
 *
 * The mode has to be known in JS, not just expressed in classes: at these two
 * widths a card is a genuinely different control, and rendering both trees
 * behind `hidden lg:block` would put every card on the page twice — two feeds
 * claiming the same live region, and two tab stops for one signal.
 */
export function useMediaQuery(query: string): boolean {
    const mql = useMemo(
        () => (typeof window === 'undefined' ? null : window.matchMedia(query)),
        [query],
    )

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            if (!mql) return () => {}
            mql.addEventListener('change', onStoreChange)
            return () => mql.removeEventListener('change', onStoreChange)
        },
        [mql],
    )

    return useSyncExternalStore(
        subscribe,
        () => mql?.matches ?? false,
        // Server/prerender has no viewport; assume the narrow layout, which
        // is the one that works at every width.
        () => false,
    )
}
