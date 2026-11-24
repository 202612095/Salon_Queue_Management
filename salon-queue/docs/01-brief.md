# Salon Queue — Brief

## Problem
On weekends customers sit 1–2 hours in the salon without knowing their turn. Some leave; others argue about who came first, leading to frustration and lost revenue.

## Users
1. **Customers**: Can join the queue from phone, track live position, and arrive just in time.
2. **Receptionist / Cashier**: Manages walk-ins, calls next customer, marks no-shows.
3. **Barbers**: See current customer, start/complete services, toggle break status.
4. **Owner / Manager**: Oversees service catalog, on-duty staff, queue status, and daily analytics.

## Must-Have Features
1. **Join Queue from Phone**: Mobile form to select services (max 3), choose barber (or 'Any barber (fastest)'), and enter phone number.
2. **Live Customer Status**: Shows token (e.g. `S-14`), live position, dynamic countdown, "Start coming" alert (at 2nd in line), and pulsating gold takeover screen when called.
3. **Receptionist Tablet Dashboard**: Call next customer by barber, add offline walk-ins, mark no-shows, and cancel spots.
4. **Barber Mobile View**: Active client timer, Start / Done actions, preview of next customer, and Available / On Break toggle.
5. **Waiting Area TV Display**: Full-screen 1080p dashboard showing active barber chairs, next 5 tokens, and flashing gold alert with chime for newly-called tokens.
6. **Owner Settings & Analytics**: Toggle services (name, price, duration), toggle barbers on duty, open/close online queue, and view daily stats (served, wait time, no-shows).
7. **Bilingual UI**: Seamless toggle between English (EN) and Gujarati (GU) across all labels.

## Don't Build
- Online payment gateway
- Future-date appointment booking
- Third-party SMS/WhatsApp API integrations
- Loyalty reward points
- Multi-branch salon management

## Look & Feel
- **Theme**: Premium salon aesthetic — Charcoal background (`#1F2937` / `#111827`) with Royal Gold accents (`#D4A017` / `#F59E0B`).
- **Typography & Layout**: Clean, mobile-first responsive cards, high contrast, minimum 44px touch targets.
- **Bilingual**: Complete English and Gujarati translation coverage without hardcoded English text.
