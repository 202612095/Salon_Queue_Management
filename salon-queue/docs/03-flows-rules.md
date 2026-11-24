# Flows, Business Rules & Testing Checklist

## User Flows

### Flow 1: Remote Customer
1. Customer opens Home (`/`) $\rightarrow$ views live waiting time $\rightarrow$ taps **[ Join Queue ]**.
2. Selects up to 3 services, selects preferred barber (or 'Any barber'), enters phone number $\rightarrow$ taps **[ Confirm ]**.
3. Receives unique daily token (e.g. `S-14`) and arrives at My Status (`/status/:id`).
4. Monitors live progress from home. When 2nd in line, sees warning banner: *"Start coming to the salon"*.
5. When Reception calls their token for Barber Amit, status transitions to `Called`:
   - Customer's screen instantly triggers full-screen gold alert: *"It's your turn! Go to Amit"*.
   - Waiting Area TV flashes token `S-14` in gold with a chime.
6. Customer arrives; Amit taps **[ Start Service ]** (`In chair`), then **[ Done ]** (`Done`).
7. Customer token is archived and leaves active queue.

### Flow 2: Offline Walk-in Customer
1. Customer walks into salon without booking online.
2. Receptionist taps **[ + Add Walk-in ]** on `/reception`.
3. Inputs customer name, phone, chosen services, and preferred barber.
4. Walk-in receives token and joins the same FIFO queue at the very end.

---

## Business Rules

1. **Strict Status Lifecycle**:
   - `Waiting` $\rightarrow$ `Called` $\rightarrow$ `In chair` $\rightarrow$ `Done`. (Transitions can only move forward, never backwards).
   - `Waiting` $\rightarrow$ `Cancelled` (Customer can only cancel while status is `Waiting`).
   - `Called` $\rightarrow$ `No-show` (Receptionist marks no-show if customer doesn't appear within 10 minutes).
2. **First-Come, First-Served (FIFO)**:
   - Queue order is strictly based on check-in timestamp.
3. **Barber Allocation Logic ("Call Next")**:
   - When Barber $X$ clicks **[ Call Next ]**, the system selects the earliest customer in queue who:
     - Chose Barber $X$, OR
     - Chose "Any barber".
   - *Critical Constraint*: A customer who specifically selected Barber Ravi will **never** be assigned to Barber Amit.
4. **Single Active Client per Chair**:
   - A barber can only have one customer `In chair` at a time. The **[ Call Next ]** action is disabled while a service is ongoing.
5. **Waiting Time Estimation Formula**:
   $$\text{Estimated Wait (minutes)} \approx \frac{\text{Total Duration (mins) of Services for Customers Ahead}}{\text{Count of Active Barbers On-Duty}}$$
   - If 0 barbers are on duty, estimated wait displays: *"No barbers currently on duty"*.
6. **Phone Number Uniqueness**:
   - Only **one active queue spot** allowed per phone number at any given time. If a user submits an active number, redirect directly to their active `/status/:id`.
7. **No-Show Rule**:
   - If a customer is marked `No-show`, their spot is closed. If they later arrive in person, the receptionist adds them as a new walk-in at the **END** of the queue with a fresh token.
8. **Queue Closure Rule**:
   - Online queue can be closed via Admin. When closed:
     - `/join` displays: *"Online queue is closed. Please visit salon for walk-in tickets."*
     - Receptionist can still add walk-in clients.
9. **Barber on Break**:
   - If a barber is marked "On Break", customers viewing that barber see *"Barber [Name] is currently on break"*. The system does not assign new "Any barber" customers to them until they toggle "Available".

---

## Test Checklist (QA Verification)

- [ ] **TC-01**: Customer joins with 2 services $\rightarrow$ correct sum of prices and duration shown on summary.
- [ ] **TC-02**: Enforce max 3 services limit $\rightarrow$ attempting to select a 4th service is disabled with user warning.
- [ ] **TC-03**: Same phone joins twice $\rightarrow$ detects active spot and redirects without duplicate token.
- [ ] **TC-04**: Call next for Amit $\rightarrow$ skips a customer ahead who explicitly chose Ravi.
- [ ] **TC-05**: Call next triggers real-time update $\rightarrow$ customer's `/status/:id` triggers full-screen gold alert within 2 seconds.
- [ ] **TC-06**: Start / Done on Barber View $\rightarrow$ updates Reception and TV displays instantly without page reload.
- [ ] **TC-07**: No-show and re-add $\rightarrow$ re-added customer appears at the bottom of queue with a new token.
- [ ] **TC-08**: Close online queue in Admin $\rightarrow$ Join button disabled on Home and `/join` shows closed message.
- [ ] **TC-09**: Language toggle (EN / GU) $\rightarrow$ all headings, badges, buttons, and service titles switch to Gujarati.
- [ ] **TC-10**: Multi-device sync $\rightarrow$ changes reflected across separate browser windows/tabs in real-time.
