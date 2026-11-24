# Salon Queue Management System

**Live demo:** https://salon-queue-mscit.vercel.app  
**Hosted on:** Vercel (Frontend) + Render (Backend)  
**Staff Test PIN:** `1234`  
**GitHub Public Repository:** https://github.com/manav-patel/salon-queue

---

## 📌 About the Project
**Royal Touch Salon Queue Management System** is a real-time web application built using the **Vibe Coding** methodology for the MSc IT Lab. It replaces chaotic weekend salon waiting lines with a digital queue where customers can join remotely from their smartphones, track their live position, and arrive just in time. Barbers and receptionists manage the queue from tablets/phones, and waiting customers view active tokens on a full-screen 1080p TV display board.

### ✨ Key Highlights
- **Premium Salon Aesthetic**: Dark Charcoal (`#1F2937`) background with Royal Gold (`#D4A017`) accents and rounded card surfaces.
- **Bilingual Interface**: Seamless instant toggle between **English (EN)** and **Gujarati (ગુજરાતી)** across all screens, buttons, and alert banners.
- **Real-Time Multi-Device Sync**: Built with WebSockets (Socket.IO) and BroadcastChannel fallback to keep phone, tablet, and TV windows synchronized within milliseconds.
- **Smart Queue Scheduling**:
  - Barber preference matching (customers who requested Barber Ravi are never given to another stylist).
  - Dynamic waiting time estimation:
    $$\text{Estimated Wait} \approx \frac{\text{Total Duration (mins) of Services Ahead}}{\text{Active Barbers On Duty}}$$
  - "Start Coming" alert when 2nd in line.
  - Pulsating Gold screen takeover with Web Audio chime when Called.

---

## 🖥️ The 7 Application Screens

| # | Screen | URL / Route | Primary Audience | Key Functions |
|---|---|---|---|---|
| 1 | **Home** | `/#home` | Customer (Mobile) | Live salon status, current waiting count & wait time, stylist availability chips (free/busy/break), and **[Join Queue]** button. |
| 2 | **Join Queue** | `/#join` | Customer (Mobile) | 10-digit Indian mobile validation, multi-select services (max 3), barber selector ("Any barber" or specific stylist), live price/time summary. |
| 3 | **My Status** | `/#status/:id` | Customer (Mobile) | Huge token number (e.g. `S-14`), circular countdown, amber alert at 2nd in line, full-screen gold alert with audio chime when Called. |
| 4 | **Reception Dashboard** | `/#reception` | Receptionist (Tablet) | Barber workstation cards with **[Call Next]**, FIFO waiting table, **[+ Add Walk-in]** quick form, **[No-show]**, **[Cancel]**. |
| 5 | **Barber View** | `/#barber` | Barber (Mobile) | Stylist switcher, active customer card with count-up timer, large touch targets for **[Start Service]** and **[Complete / Done]**, **Available / On Break** toggle. |
| 6 | **Waiting Area TV** | `/#display` | Waiting Area TV | 1920x1080 full-screen board: Barbers with active tokens under "Now Serving", next 5 tokens under "Up Next", and flashing gold alert with chime for newly called clients. |
| 7 | **Owner Settings** | `/#admin` | Owner (Desktop/Tablet) | Today's analytics cards (Served, Avg Wait, No-Shows), service catalog price & duration editor, barber on/off duty toggles, and master online queue switch. |

---

## 📁 Repository Structure
```text
salon-queue/
├── AGENTS.md                  # Project instructions for AI agents
├── docs/
│   ├── 01-brief.md            # Problem statement, scope & must-haves
│   ├── 02-screens.md          # UI & behavioral specifications for all 7 screens
│   └── 03-flows-rules.md      # Business rules, waiting formula & QA checklist
├── prompts.md                 # Complete chronological log of vibe coding prompts
├── reflection.md              # Half-page reflection on AI debugging & prompt refinement
├── client/                    # React 19 + Vite + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/        # Navbar & shared UI elements
│   │   ├── context/           # SalonContext with Socket.IO & multi-tab sync
│   │   ├── screens/           # 7 Screen components
│   │   ├── utils/             # Web Audio API chime synthesizer
│   │   ├── i18n.ts            # English & Gujarati bilingual dictionary
│   │   ├── queueLogic.ts      # Pure business rules & wait time calculations
│   │   └── types.ts           # TypeScript interfaces
│   └── vercel.json            # SPA routing rewrite configuration for Vercel
├── server/                    # Node.js + Express + Socket.IO Backend
│   ├── server.js              # REST API & WebSocket server with file persistence
│   └── test_queue_logic.js    # Automated test suite for business rules
└── package.json               # Monorepo management scripts
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone the repository
git clone https://github.com/manav-patel/salon-queue.git
cd salon-queue

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running Locally
You can run both client and server concurrently:
```bash
# Terminal 1: Run Express + Socket.IO Server (Port 4000)
cd server
npm start

# Terminal 2: Run Vite React Frontend (Port 5173)
cd client
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Testing Checklist & Verification (PASS / FAIL)

| Test ID | Scenario | Verification Method | Result |
|---|---|---|---|
| **TC-01** | Multi-service price & duration calculation | Select 2 services on `/join` | **PASS** |
| **TC-02** | 3-service maximum limit enforcement | Attempt to select a 4th service | **PASS** |
| **TC-03** | Phone number uniqueness & duplication check | Re-enter existing phone number | **PASS** |
| **TC-04** | Barber preference matching | Amit calls next, skips client who wanted Ravi | **PASS** |
| **TC-05** | Real-time multi-device notification | Calling ticket triggers gold takeover & chime | **PASS** |
| **TC-06** | Forward-only status lifecycle | Waiting $\rightarrow$ Called $\rightarrow$ In chair $\rightarrow$ Done | **PASS** |
| **TC-07** | No-show to queue end | Re-registered client placed at bottom of queue | **PASS** |
| **TC-08** | Online queue closure | Closing in Admin disables `/join` button | **PASS** |
| **TC-09** | Gujarati language localization | Toggle EN/GU switches all UI labels | **PASS** |
| **TC-10** | Multi-tab synchronization | Changes propagate across tabs within 200ms | **PASS** |

---

## 🌐 Free Cloud Deployment Instructions

### Option 1: Frontend on Vercel + Backend on Render (Recommended)
1. **Deploy Backend on Render**:
   - Create a free account at [render.com](https://render.com).
   - Click **New Web Service** $\rightarrow$ Connect your GitHub repo.
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `node server.js`
   - Copy your Render live URL (e.g., `https://salon-queue-api.onrender.com`).
2. **Deploy Frontend on Vercel**:
   - Create an account at [vercel.com](https://vercel.com) and import the repo.
   - Root directory: `client`
   - Framework preset: `Vite`
   - Environment Variable: `VITE_BACKEND_URL` = your Render live backend URL.
   - Click **Deploy**. Vercel will build and assign your live demo URL!

---

## 👨‍💻 Submission Checklist
- [x] Working live link on line 1 of `README.md`
- [x] Staff test PIN (`1234`) provided
- [x] All 7 screens fully implemented and responsive
- [x] Bilingual support (English & Gujarati) verified
- [x] `prompts.md` with complete prompt history
- [x] `reflection.md` half-page learning analysis
- [x] Automated business logic tests passing
