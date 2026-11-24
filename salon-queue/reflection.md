# Half-Page Reflection — Vibe Coding Lab

**Course:** MSc IT  
**Project:** Salon Queue Management System  
**Theme:** Charcoal (`#1F2937`) & Gold (`#D4A017`) · Bilingual EN/GU

---

### What the AI Agent Got Wrong & How It Was Noticed
During the implementation of Step 4 (Reception and Barber Assignment), the initial automated implementation attempted to assign the next waiting customer strictly based on timestamp without checking whether the customer had selected a specific preferred barber. Specifically, if Customer A arrived at 10:00 AM requesting Barber Ravi, and Customer B arrived at 10:05 AM selecting "Any barber (fastest)", clicking "Call Next" from Barber Amit's workstation initially assigned Customer A to Amit.

I noticed this flaw while testing the scenario against the business rules laid out in `docs/03-flows-rules.md`, which strictly state:
> *"A customer who chose Ravi is never given to another barber."*

Because Customer A chose Ravi exclusively, Amit should have skipped Customer A and called Customer B instead, leaving Customer A in line for Ravi.

### How the Prompt and Documentation Were Refined
To permanently resolve this discrepancy across both the frontend React client and the backend Express/Socket.IO logic, I took two targeted actions:

1. **Rule Centralization in `queueLogic.ts`**:
   I created a dedicated function `findNextTicketForBarber(tickets, barberId)` that enforces the compound predicate:
   $$\text{ticket.status} = \text{'Waiting'} \land (\text{ticket.preferredBarberId} = \text{'any'} \lor \text{ticket.preferredBarberId} = \text{barberId})$$
2. **Explicit Edge-Case Prompting**:
   Instead of a general prompt like *"Make Call Next work"*, I issued a constrained prompt with concrete test data:
   > *"Implement the 'Call next' rule: When Amit clicks Call Next, filter tickets for status=='Waiting' and match preferredBarberId == 'any' OR preferredBarberId == Amit's ID. Customer S-1 requesting Ravi must be skipped. Test this exact case and confirm with an assertion."*

In addition, writing the automated test suite `server/test_queue_logic.js` provided instant regression testing to verify that barber preferences, forward-only status transitions, and phone number uniqueness remained strictly enforced after every change.
