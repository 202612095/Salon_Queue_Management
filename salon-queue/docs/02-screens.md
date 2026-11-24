# Screen Specifications & Features

## Screen 1: Home (`/`)
- **Primary User**: Customer (Phone/Desktop)
- **Top Bar**: Salon Name ("Royal Touch Salon / રોયલ ટચ સેલોન"), Open Status Badge ('Open · Closes 9 PM' or 'Online Queue Closed'), Language Toggle (EN / GU).
- **Live Status Card**: "X people waiting · about Y min wait".
- **Barber Availability Chips**: Horizontal scrolling cards showing active barbers and status:
  - Ravi (Busy - in chair)
  - Amit (Available)
  - Imran (On Break)
- **Primary Action**: Big gold button `[ Join Queue ]` (navigates to `/join`, disabled with clear message if online queue is closed by Owner).
- **Bottom Navigation**: Quick links for testing: `[Reception]`, `[Barber]`, `[TV Display]`, `[Admin]`.

## Screen 2: Join Queue (`/join`)
- **Primary User**: Customer (Phone)
- **Input Fields**:
  - Customer Name (Required, minimum 2 characters).
  - Phone Number (10 digits validation with Indian format check `[6-9][0-9]{9}`).
- **Service Cards (Multi-select, max 3)**:
  - Haircut (30 min · ₹150)
  - Beard Trim (15 min · ₹80)
  - Hair Spa (45 min · ₹400)
  - Shave (20 min · ₹100)
  - Face Massage (25 min · ₹250)
  - Hair Color (40 min · ₹350)
- **Barber Picker**:
  - "Any barber (fastest)" — default recommended choice.
  - Individual cards for each barber on duty (photo, name, current wait status).
- **Sticky Live Summary**:
  - Displays: `Selected X services · Total ₹XXX · Total duration XX min · Est. wait ~XX min`.
  - Action: Big Gold Button `[ Confirm & Join Queue ]`.
  - Redirects directly to `/status/:id`.

## Screen 3: My Status (`/status/:id`)
- **Primary User**: Customer (Phone)
- **Header**: Active Token Number in huge display font (e.g. `S-14`), Position (`4th in line`).
- **Dynamic Circular Progress**: Real-time estimated wait countdown (e.g., `about 25 min left`).
- **Contextual Alert Banners**:
  - When 2nd in line: Amber pulsating banner: `⚠️ Start coming to the salon! You are next in line.`
  - When status is `Called`: Full-screen Gold Takeover: `🎉 It's your turn! Please proceed to Barber [Name]!` with sound chime and vibrating alert effect.
  - When status is `In chair`: Blue banner: `✂️ In Service with [Barber Name]`.
- **Secondary Action**: `[ Cancel My Spot ]` with a safety confirmation modal.

## Screen 4: Reception Dashboard (`/reception`)
- **Primary User**: Receptionist / Manager (Tablet landscape / Laptop)
- **Security**: Protected by PIN (Default `1234`).
- **Left Panel (Barber Workstations)**:
  - Card for each active barber:
    - Barber photo, name, status (`Free`, `Busy`, `Break`).
    - Current customer token & name, elapsed timer.
    - Action: `[ Call Next ]` button (disabled if barber already has customer in chair).
- **Right Panel (Live Queue Table)**:
  - Ordered chronologically (FIFO):
    - Token, Customer Name, Phone, Selected Services, Preferred Barber, Waiting Time.
    - Highlight rows waiting > 60 min in amber/red alert.
    - Actions: `[ No-Show ]` (moves to end of queue with new token if they reappear) and `[ Cancel ]`.
- **Top Action**: `[ + Add Walk-in ]` button opens quick modal (Name, Phone, Services, Barber preference).

## Screen 5: Barber View (`/barber/:name`)
- **Primary User**: Individual Barber on mobile device (Ravi, Amit, Imran, etc.)
- **Header**: Barber profile name, current status pill.
- **Current Customer Card**:
  - Customer Token, Name, Services ordered, Total duration.
  - Live count-up timer since service started.
  - Big actionable touch buttons:
    - `[ Start Service ]` (moves customer from `Called` to `In chair`).
    - `[ Complete Service / Done ]` (moves to `Done`, frees barber).
- **Next in Line Preview**:
  - Shows `Next for you: Token S-15 - Kunal (Haircut)`.
- **Barber Controls**:
  - Toggle: `[ Available / On Break ]` (On break updates Home and Reception immediately).

## Screen 6: Waiting Area TV Display (`/display`)
- **Primary User**: Salon Waiting Area TV (1920x1080 full-screen landscape, dark theme)
- **Left Section (Active Chairs - "Now Serving")**:
  - Grid of barbers with chair numbers.
  - Shows Barber name, current customer token (huge font, e.g., `S-12`), and service.
- **Right Section ("Up Next")**:
  - List of the next 5 tokens in waiting order.
  - Shows Token number, Customer Name initials, and estimated wait.
- **Real-Time Notification Event**:
  - When a customer is called, their token flashes in gold for 5 seconds accompanied by an audio alert chime.

## Screen 7: Owner Settings & Analytics (`/admin`)
- **Primary User**: Salon Owner / Admin (Laptop / Tablet)
- **Security**: Protected by PIN (Default `1234`).
- **Today's Stats Summary Cards**:
  - Total Customers Served Today
  - Average Waiting Time
  - Total No-shows & Cancellations
  - Most Popular Service
- **Service Catalog Management**:
  - Table of all services with English & Gujarati names, duration (mins), price (₹), and active On/Off toggle.
  - Ability to add new service or edit existing prices.
- **Staff Duty Management**:
  - Toggle barbers on/off duty for the day.
- **Master Queue Control**:
  - Switch: `[ Open / Close Online Queue ]` (Disables online `/join` while still allowing Reception walk-ins).
