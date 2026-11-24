# AGENTS.md — Salon Queue Management

Queue application for a modern salon: customers join queue from mobile, view estimated wait times, and get called; reception and barbers manage the queue in real-time; TV display shows live tokens in waiting area.

## Read First
- `docs/01-brief.md`        -> Features, scope, and what NOT to build
- `docs/02-screens.md`      -> Detailed layout and behavior for all 7 screens
- `docs/03-flows-rules.md`  -> Business rules, queue assignment logic, and test checklist

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + i18n support.
- **Backend / Realtime Sync**: Node.js + Express + SQLite + Socket.IO (or unified client-server architecture).
- **Run Command**: `npm run dev`
- **Hosting Targets**: Vercel (Frontend), Render / Railway (Backend).
- **Live Demo Link**: Must be placed on the first line after the title in `README.md`.

## Working Rules & Design Principles
1. **One Screen / Feature per task**: Work incrementally and test each screen before proceeding.
2. **Visual Identity**:
   - Background: Dark charcoal (`#111827`, `#1F2937`)
   - Accent: Royal Gold (`#D4A017`, `#F59E0B`)
   - Card surfaces: `#1E293B`, rounded corners (`rounded-xl`), crisp typography.
3. **Bilingual Requirement**: All UI labels, buttons, and system messages must use the EN/GU translation dictionary; no hardcoded English strings.
4. **Queue Rules Centralization**: Queue assignment rules (especially FIFO and barber preference matching) must live in a single centralized module.
5. **Mobile-First**: Optimized for 390px mobile screens, responsive up to 10-inch tablets (Reception) and 1080p widescreen (TV Display).
6. **No "Don't Build" features**: Strictly exclude online payments, Google auth, complex multi-branch logic, or external SMS gateways.
7. **After Each Step**: Verify behavior against `docs/03-flows-rules.md` checklist and log prompts in `prompts.md`.
