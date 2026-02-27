# Specification

## Summary
**Goal:** Fix customer chat history visibility, enable customer reply messages, and remove the payment gate from ticket creation in PKG Tech Support.

**Planned changes:**
- Fix the ChatSection component so customers can see the full message history for their active chat sessions, fetched from the backend in chronological order with correct sender attribution.
- Fix the ChatSection component so customers can type and send reply messages; ensure the message input field and send button are rendered and functional for authenticated customers.
- Remove all payment gate checks (Stripe/Razorpay/subscription validation) from the ticket creation flow in ClientPortal and TicketCreationForm so any authenticated customer can create a ticket unconditionally.
- Audit and fix backend `main.mo` authorization checks on `getChatMessages` and `sendMessage` to allow customers to read and write their own chat session messages while denying access to other customers' sessions.

**User-visible outcome:** Customers can view their full chat history, send reply messages in active support sessions, and create new support tickets without any payment or plan prompts blocking them.
