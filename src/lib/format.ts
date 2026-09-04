/**
 * Timestamp formatting. Intl only — no date library.
 *
 * Formatters are module-level constants because constructing an
 * Intl.DateTimeFormat is comparatively expensive and the board renders
 * hundreds of timestamps per second once feeds are live.
 */

/** 24-hour HH:MM:SS — the bracketed timestamp prefix on every feed line. */
const clockFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
})

export function formatClock(at: number): string {
    return clockFormatter.format(at)
}

/** Compact stamp for filenames: 2026-09-04T1422. */
export function formatFileStamp(at: number): string {
    const d = new Date(at)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}`
}
