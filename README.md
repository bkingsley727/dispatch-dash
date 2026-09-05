# Relay Dispatch Dashboard

A dashboard for managing and monitoring radio communication links.

## Design Justification
- Colors: standard green and red for active and error states respectively. Light blue chosen for stand-by state representing a neutral state not requiring operator attention. Minimal color footprint and icon usage to maintain modern operation first aesthetic. Deep blue background used to subtley tie into the police dispatch theme.
- Layout: Vertically oriented cards for each signal allowing for easy scanning and quick identification of signal status. Collapsible design allows for users to focus on active signals while maintaining access to historical data.
- Controls: Sort / Filter. Allow for operator control of the information they see first. Download: tying design to real operational capability. Balance function with aesthetic.




## Mock Backend
The board runs against an in-browser demo simulator ([src/lib/feed/simulator.ts](src/lib/feed/simulator.ts)) rather than a live dispatch system.

- **Swappable.** The UI depends only on the `FeedSource` interface in [src/lib/feed/source.ts](src/lib/feed/source.ts) — subscribe, receive whole boards. Pointing the dashboard at a real backend means writing another `FeedSource` and passing it to `useCommLinks`; no component changes.
- **Under your control.** The board starts stopped, showing the default state; the play/stop control in the header's `Demo` tag starts live updates. Stopping is a reset, not a pause — the board returns to the default state, so what is on screen when the demo is idle is the curated one rather than wherever the random walk happened to leave it.
- **Seeded.** It starts from the default board, so every state the UI handles — a feed long enough to scroll, a fault with a reason, a link that has never transmitted — is on screen at first paint instead of only once the simulator happens to produce it. All variation then comes from one seeded PRNG, so a given seed replays the same demo and a screenshot can be reproduced.
- **Tuned for the board, not the link.** Transition odds are balanced so the board settles at roughly 50% active / 40% stand-by / 10% errored, and is entirely quiet only about 2% of the time. Links seeded silent are held silent for a guaranteed two minutes, so the "awaiting first transmission" state is reliably observable rather than merely probable.
- **Bounded.** Each link keeps its newest 200 messages, so a dashboard left open all shift does not grow without limit.

Run it with `npm run dev`, then press play in the header.
