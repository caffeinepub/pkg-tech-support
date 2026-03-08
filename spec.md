# PKG Tech Support

## Current State
The project has a full Motoko backend with support tickets, chat messaging, technician availability, payment toggle, KB articles, and Stripe integration. The backend is functional but the frontend has accumulated bugs over many iterations: blank pages after login, chat not working, payment image not displaying, and various UI issues.

## Requested Changes (Diff)

### Add
- Nothing new — focus is on fixing and stabilizing existing features

### Modify
- Complete frontend rebuild for stability and correctness
- Separate customer and expert login pages (customer at `/`, expert at `/expert-login`)
- Customer dashboard: create ticket (free, no payment required), view ticket list with status, chat with assigned expert
- Expert dashboard: view all tickets, update ticket status (open/inProgress/resolved), reply to customer chat, toggle payment request per ticket
- Chat: real-time polling every 2 seconds, message history visible for both parties, image attachments supported
- UI: colorful, differentiated panels for customer vs expert, dark green chat text, light blue form backgrounds
- Footer: "Supported by praveenjaexperts@gmail.com"
- Payment section: show $1 charge info, payment methods panel (Stripe/PayU demo), payment popup triggered by expert toggle

### Remove
- Admin panel from customer dashboard
- Auto-scroll to top behavior
- Payment requirement for ticket creation

## Implementation Plan
1. Rebuild frontend App.tsx with clean routing: `/` for customer, `/expert-login` for expert, `/customer` for customer dashboard, `/expert` for expert dashboard
2. Customer login page: name + email form, registers as customer role
3. Expert login page: password-protected (simple PIN) or role-based login
4. Customer dashboard: ticket creation form (title + description, free), ticket list with status badges, chat panel for selected ticket
5. Expert dashboard: all tickets panel, ticket detail + status update, chat panel, payment toggle per ticket
6. Chat component: polls `getChatMessages` every 2s, shows history, supports image attach via blob-storage
7. Payment panel: shows $1 charge, PayU demo info, triggered by expert toggle
8. Consistent color theme: blue/purple gradient headers, teal expert panels, coral customer panels, light blue form backgrounds, dark green chat text
9. Deterministic data-ocid markers on all interactive elements
