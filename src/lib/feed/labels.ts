import type { LinkStatus } from './types'

/**
 * Uppercase status names for the exported log.
 *
 * Kept separate from STATUS_META so lib/ has no dependency on components/ —
 * the log renderer must stay usable without React.
 */
export const STATUS_LABEL_FOR_LOG: Record<LinkStatus, string> = {
    active: 'ACTIVE',
    standby: 'STAND-BY',
    error: 'ERROR',
}
