/**
 * The signed-in operator, parked at the end of the app bar.
 *
 * A tag, not a menu: it exists so the console reads as a session someone is
 * holding — a manned position with a name against it — and there is nothing
 * behind it to open. The dot repeats the "on shift" state that the name and
 * watch number already carry in text, so it is decoration rather than the
 * only place that information lives.
 */

const OPERATOR = {
    name: 'M. Reyes',
    initials: 'MR',
    watch: 'Watch 2',
} as const

export function OperatorTag() {
    return (
        <div
            className="border-border/70 bg-card/60 ml-auto flex shrink-0 items-center gap-2.5 rounded-md border py-1 pr-3 pl-1.5"
            title={`Signed in as ${OPERATOR.name} — ${OPERATOR.watch}, on shift`}
        >
            <span
                aria-hidden="true"
                className="bg-muted text-foreground/90 flex size-7 items-center justify-center rounded font-mono text-[0.7rem] font-semibold tracking-wider"
            >
                {OPERATOR.initials}
            </span>

            <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-xs font-semibold">{OPERATOR.name}</span>
                <span className="text-muted-foreground hidden font-mono text-[0.625rem] tracking-wider uppercase sm:inline">
                    {OPERATOR.watch} · On shift
                </span>
            </span>

            <span
                aria-hidden="true"
                className="bg-status-active signal-pulse size-1.5 shrink-0 rounded-full"
            />
        </div>
    )
}
