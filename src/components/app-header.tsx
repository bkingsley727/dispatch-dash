import { Play, Radio, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The demo tag doubles as the board's transport control.
 *
 * It stays a tag rather than becoming a separate button beside one: the thing
 * being started and stopped *is* the demo, so folding the control into the
 * label keeps one object on screen instead of two that have to be read
 * together. The icon carries the state on shape (triangle vs square) as well
 * as colour, the same rule the status indicators follow, so it survives
 * greyscale and forced-colors.
 *
 * The icon shows the *action*, not the state — a square means "press to
 * stop", which is the convention every media control uses — so the live
 * signal is carried by colour and by the pulsing dot beside it instead.
 */
export function AppHeader({
    running,
    onToggleDemo,
}: {
    running: boolean
    onToggleDemo: () => void
}) {
    return (
        <header className="bg-transparent border-border sticky top-0 z-10 border-b backdrop-blur-md">
            <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-3 sm:px-6 lg:px-8 xl:px-12">
                <Radio aria-hidden="true" className="text-status-active size-5 shrink-0" />
                <span className="text-xl font-semibold tracking-[0.18em] uppercase">Relay</span>

                <button
                    type="button"
                    onClick={onToggleDemo}
                    aria-label={
                        running
                            ? 'Demo running. Stop live updates and reset the board.'
                            : 'Demo stopped. Start live updates.'
                    }
                    title={
                        running
                            ? 'Stop live updates and reset the board'
                            : 'Start live updates'
                    }
                    className={cn(
                        'border-border text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 ml-1 flex items-center gap-1.5 rounded border py-1 pr-2 pl-1.5 font-mono text-[0.625rem] tracking-wider uppercase transition-colors focus-visible:ring-[3px] focus-visible:outline-none',
                        running && 'text-foreground border-status-active/40',
                    )}
                >
                    {running ? (
                        <Square
                            aria-hidden="true"
                            className="text-status-active size-2.5 fill-current"
                        />
                    ) : (
                        <Play aria-hidden="true" className="size-2.5 fill-current" />
                    )}
                    Demo
                </button>
            </div>
        </header>
    )
}
