import { RadioTower } from 'lucide-react'

/** No links provisioned at all — distinct from a link with no traffic. */
export function EmptyBoard() {
    return (
        <div className="border-border flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
            <RadioTower aria-hidden="true" className="text-muted-foreground/50 size-7" />
            <h2 className="text-sm font-semibold tracking-wide uppercase">No comm links</h2>
            <p className="text-muted-foreground max-w-sm text-sm">
                Nothing is provisioned on this board yet. Links appear here as soon as one
                is registered with dispatch.
            </p>
        </div>
    )
}
