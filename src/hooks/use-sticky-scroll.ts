import { useCallback, useEffect, useRef } from 'react'

/** How close to the bottom still counts as "following the tail". */
const PIN_THRESHOLD_PX = 40

/**
 * Follow-the-tail scrolling for a live feed.
 *
 * A monitoring feed that always jumps to the newest message is unusable the
 * moment an operator scrolls up to read what just happened — the next message
 * yanks them back. So the view only auto-follows while the reader is already
 * at the bottom. Scroll up and the feed holds still; scroll back down and it
 * resumes following on its own.
 *
 * @param revision changes whenever new content arrives
 * @param enabled false while the feed is collapsed, so nothing is measured
 */
export function useStickyScroll(revision: unknown, enabled: boolean) {
    const viewportRef = useRef<HTMLDivElement>(null)
    const pinnedRef = useRef(true)

    const handleScroll = useCallback(() => {
        const el = viewportRef.current
        if (!el) return
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
        pinnedRef.current = distanceFromBottom <= PIN_THRESHOLD_PX
    }, [])

    // Opening the feed should land at the newest message, and re-pin, so an
    // operator who scrolled up, collapsed, and reopened is not left mid-history.
    useEffect(() => {
        if (!enabled) {
            pinnedRef.current = true
            return
        }
        const el = viewportRef.current
        if (!el) return
        el.scrollTop = el.scrollHeight
        pinnedRef.current = true
    }, [enabled])

    useEffect(() => {
        if (!enabled) return
        const el = viewportRef.current
        if (!el || !pinnedRef.current) return
        el.scrollTop = el.scrollHeight
    }, [revision, enabled])

    return { viewportRef, handleScroll }
}
