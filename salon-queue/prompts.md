# Prompts Log — Salon Queue Management System

Every prompt executed during the vibe coding lifecycle of this project:

### Step 1: Specifications & Documentation
> "Read the MSc IT TA handout for Salon Queue Management System. Create the 4 core documents in docs/ (01-brief.md, 02-screens.md, 03-flows-rules.md) and AGENTS.md in the project root. Ensure must-haves, don't-build list, 7 screens, barber preference rules, waiting time formulas, and charcoal (#1F2937) + gold (#D4A017) theme are thoroughly detailed."

### Step 2: Architecture & Bilingual Setup
> "Initialize a React + Vite + TypeScript project for client and Express + Socket.IO for server. Configure Tailwind CSS with dark charcoal surfaces and royal gold accents. Build an i18n translation dictionary supporting full English (EN) and Gujarati (GU) language toggle. Set up empty routed views for all 7 screens."

### Step 3: Customer Journey (Home, Join Queue & My Status)
> "Build Screen 1 (Home), Screen 2 (Join Queue), and Screen 3 (My Status). Screen 1 shows live salon wait cards and stylist availability chips. Screen 2 validates 10-digit Indian phone numbers, enforces maximum 3 services limit, and provides barber selection ('Any' or specific stylist) with live price/wait summary. Screen 3 displays huge token numbers (e.g. S-14), position, circular countdown, 'Start coming' alert when 2nd in line, and pulsating gold takeover screen with audio chime when Called."

### Step 4: Operations (Reception & Barber Views)
> "Build Screen 4 (Reception Dashboard) for tablet landscape and Screen 5 (Barber View) for mobile. Reception features station cards, FIFO queue, [+ Add Walk-in] modal, [Call Next], [No-show], and [Cancel]. Enforce barber preference rules so Amit never receives a client who exclusively picked Ravi. Barber view features active client details, elapsed service timer, big [Start] and [Done] buttons, and Available/On Break toggle."

### Step 5: Waiting Area TV Display
> "Build Screen 6 (Waiting Area TV Display) optimized for 1920x1080 resolution. Display active barber chairs under 'Now Serving' with giant token numbers, and display the next 5 tokens under 'Up Next'. When an order is Called, flash the token in gold for 5 seconds and play an audio chime alert."

### Step 6: Owner Settings & Analytics
> "Build Screen 7 (Owner Settings & Analytics) protected with Staff PIN 1234. Display metrics for customers served, average wait time, and no-shows. Implement service price/duration inline editing, barbers on/off duty toggles, and master online queue open/closed switch."

### Step 7: QA Audit & Bug Fixing
> "Review all 10 checklist test cases from docs/03-flows-rules.md. Write an automated verification script test_queue_logic.js testing barber preferences, wait formula, forward-only status transitions, and phone number uniqueness. Fix TypeScript verbatimModuleSyntax and unused local variable warnings in the client build."

### Step 8: Deployment & Submission Preparation
> "Prepare production build with vite build. Create vercel.json with SPA rewrites for Vercel deployment. Structure README.md with the live demo link and test PIN placed at the very top. Include deployment instructions for Vercel (frontend) and Render (backend)."
