import { useCallback, useSyncExternalStore } from 'react'
import { demoFeed } from '@/lib/feed/simulator'
import type { DemoController } from '@/lib/feed/simulator'

/**
 * Bind the header's transport control to the demo.
 *
 * `useSyncExternalStore` rather than `useState` + an effect: the running flag
 * lives outside React, and this is the hook built for exactly that — it reads
 * the current value during render instead of catching up to it one paint
 * later, so the button can never show "stopped" over a board that is moving.
 *
 * The subscribe and snapshot functions come off the singleton unchanged on
 * every render, which is what keeps the store from resubscribing each time.
 */
export function useDemoControls(controller: DemoController = demoFeed) {
    const running = useSyncExternalStore(controller.subscribeRunning, controller.isRunning)

    const toggle = useCallback(() => {
        if (controller.isRunning()) controller.stop()
        else controller.play()
    }, [controller])

    return { running, toggle }
}
