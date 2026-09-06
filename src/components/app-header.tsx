import { Radio } from 'lucide-react'
import { OperatorTag } from '@/components/operator-tag'

/**
 * The console's top bar.
 *
 * Full-bleed: it spans the window rather than sitting inside the same clamped
 * column as the content, so the bar reads as the frame the board is mounted
 * in — the way a fixed instrument panel does — instead of a card that happens
 * to be first on the page.
 */
export function AppHeader() {
    return (
        <header className="bg-background/70 border-border sticky top-0 z-10 w-full shrink-0 border-b backdrop-blur-md">
            <div className="flex h-14 w-full items-center gap-3 px-3 sm:px-6 lg:px-8">
                <Radio aria-hidden="true" className="text-status-active size-5 shrink-0" />
                <span className="text-xl font-semibold tracking-[0.18em] uppercase">Relay</span>
                <span className="text-muted-foreground border-border/70 hidden border-l pl-3 font-mono text-[0.625rem] tracking-widest uppercase sm:inline">
                    Ops console
                </span>

                <OperatorTag />
            </div>
        </header>
    )
}
