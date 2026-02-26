# Specification

## Summary
**Goal:** Extend PKG Tech Support with a full ticketing system, enhanced AI chat bot, knowledge base, client portal, and analytics dashboard.

**Planned changes:**
- Add a ticketing system with ticket creation form, priority levels (Low, Medium, High, Critical), SLA tracking with visual breach indicators, status workflow (Open, In Progress, Pending, Resolved, Closed), and technician-side status/priority editing. Store ticket data in the backend actor.
- Enhance the existing AIAssistantChat component with an expanded IT FAQ keyword-matching knowledge base (printers, Windows, passwords, networking) and a "Hand off to human agent" escalation action that creates a ticket and routes to live chat, preserving chat history.
- Build a Knowledge Base section in the main navigation with a searchable, category-filtered article library (Printers & Peripherals, Windows Troubleshooting, Network & Connectivity, Account & Passwords, Hardware). Articles stored in the backend with title, category, body, tags, and view count. Includes article cards, full detail view, view count increment, and admin/technician article creation and editing.
- Build a Client Portal tab in the CustomerDashboard showing the customer's tickets with status/priority/SLA badges, a resolved ticket service history timeline, the ability to comment on or reopen tickets, and a Razorpay payment section for support plans or incident payments. Accessible only to authenticated customers.
- Build an Analytics Dashboard tab in the ExpertDashboard (admin/technician only) showing: average first reply time, ticket resolution rate, open ticket count by priority (chart), agent performance table (tickets handled, avg resolution time), and a daily ticket volume chart for the last 30 days. All metrics derived from backend ticket and message data.

**User-visible outcome:** Technicians gain a full ticketing workflow with SLA tracking and an analytics dashboard; customers get a self-service knowledge base, AI-assisted chat with human escalation, a client portal to manage their tickets and make payments via Razorpay; and all users benefit from organized, searchable IT support articles.
