import { formatClock, formatFileStamp } from './format'
import { STATUS_LABEL_FOR_LOG } from './feed/labels'
import type { CommLink } from './feed/types'

/**
 * Render a link's full buffer as a plain-text log.
 *
 * The header block exists so the file still makes sense once it has been
 * pasted into a ticket and separated from the dashboard: which link, what
 * state it was in, when it was pulled, and how much is here.
 *
 * Always the whole buffer, never just what happened to be on screen.
 */
export function renderLog(link: CommLink, exportedAt: number = Date.now()): string {
    const header = [
        `# ${link.name} (${link.designator})`,
        `# Status: ${STATUS_LABEL_FOR_LOG[link.status]}`,
        link.fault ? `# Fault: ${link.fault.reason} at ${formatClock(link.fault.at)}` : null,
        `# Exported: ${new Date(exportedAt).toISOString()}`,
        `# Messages: ${link.messages.length}`,
        '',
    ].filter((line): line is string => line !== null)

    const body = link.messages.map((m) => `${formatClock(m.at)}  ${m.body}`)

    return [...header, ...body, ''].join('\n')
}

export function logFilename(link: CommLink, exportedAt: number = Date.now()): string {
    const slug = link.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    return `${slug}-${formatFileStamp(exportedAt)}.log`
}

/**
 * Build the file in the browser and hand it to the user. No server round
 * trip, so this works offline and against any feed source identically.
 */
export function downloadLog(link: CommLink): void {
    const exportedAt = Date.now()
    const blob = new Blob([renderLog(link, exportedAt)], {
        type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = logFilename(link, exportedAt)
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()

    // Revoking synchronously can cancel the download in some browsers; give
    // the click a turn of the event loop to be picked up first.
    setTimeout(() => URL.revokeObjectURL(url), 0)
}
