import { Radio } from 'lucide-react'

export function AppHeader() {
    return (
        <header className="bg-transparent border-border sticky top-0 z-10 border-b backdrop-blur-md">
            <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-3 sm:px-6 lg:px-8 xl:px-12">
                <Radio aria-hidden="true" className="text-status-active size-5 shrink-0" />
                <span className="text-xl font-semibold tracking-[0.18em] uppercase">Relay</span>

                <span className="border-border text-muted-foreground ml-1 rounded border px-1.5 py-0.5 font-mono text-[0.625rem] tracking-wider uppercase">
                    Demo
                </span>
            </div>
        </header>
    )
}
