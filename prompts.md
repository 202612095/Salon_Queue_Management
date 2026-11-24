# Prompts Log — Salon Queue Management System

This file contains the ordered sequence of prompts used to design, build, refine, and verify the Salon Queue Management System (`Royal Touch Salon` / `Royal Trim Studio`).

---

## Prompt 1 — Initial Project Setup, Theme & Multi-Window State Sync
> Read `AGENTS.md` and all files in `docs/`. Set up a React + Vite + TypeScript + Tailwind CSS project with SPA routing support, dark charcoal (`#111827` / `#1F2937`) and gold (`#D4A017`) styling, real-time state synchronization across browser windows, English/Gujarati (`EN`/`GU`) support, realistic salon dummy data (3 barbers: Ravi, Amit, Imran; services with duration and price; sample queue entries), and routes for `/`, `/join`, `/status/:id`, `/reception`, `/barber/:name`, `/display`, and `/admin`.

*Note: Encountered an initial AI agent connection error ("Sorry, something went wrong.") on the first attempt before retrying and scaffolding the core project files.*

---

## Prompt 2 — Customer Screens: Home (`/`), Join Queue (`/join`) & My Status (`/status/:id`)
> Build Screen 1 (`/`), Screen 2 (`/join`), and Screen 3 (`/status/:id`) following `docs/02-screens.md` and `docs/03-flows-rules.md`. Include 10-digit phone validation, duplicate active phone check, service selection limit (max 3), live total duration and price summary, sequential token generation (`S-1`, `S-2`...), live queue position and estimated wait calculation, `"Start coming"` alert when near the front, full-screen gold `"It's your turn!"` state when called, and cancellation while waiting. Ensure a mobile-first layout (`390px`) with at least `44px` tap targets.

---

## Prompt 3 — Reception Dashboard (`/reception`), Barber View (`/barber/:name`) & Waiting Area TV (`/display`)
> Build Screen 4 (`/reception`), Screen 5 (`/barber/:name`), and Screen 6 (`/display`) following `docs/02-screens.md` and `docs/03-flows-rules.md`. Enforce FIFO order and barber preference rules on `Call Next`, support walk-in additions on Reception, enforce forward-only status transitions (`Waiting -> Called -> In Chair -> Done`, plus `No-Show` and `Cancel`), support barber `Available / On Break` toggles, and provide a large waiting-area TV display where newly called tokens highlight automatically without manual refresh.

---

## Prompt 4 — Owner Settings (`/admin`) & Bilingual / Edge-Case Polish
> Build Screen 7 (`/admin`) with PIN `1234`, daily summary stats (customers served, average wait, no-shows), online queue open/close toggle, barbers on-duty toggles, and service management controls. Audit all screens in English and Gujarati (`GU`) for missing translations, layout overflow, empty states, and no-show re-queueing at the end of the line.

---

## Prompt 5 — End-to-End Checklist Verification & Production Build Check
> Run through every item in the test checklist in `docs/03-flows-rules.md`, fix reproducible issues, verify the production build completes cleanly, and format the top of `README.md` with the live demo link and test PIN.
