# Specification

## Summary
**Goal:** Simplify the customer panel by removing the history tab, disabling auto-scroll on both dashboards, and replacing the full payment requirement for ticket creation with a minimal $1 fixed charge.

**Planned changes:**
- Remove the "History" / "Service History" tab and `ServiceHistoryTimeline` component from the CustomerDashboard and ClientPortal (expert-side history remains untouched).
- Disable automatic scroll-to-top behavior triggered by tab switches in both the CustomerDashboard and ExpertDashboard.
- Replace the full payment block in `TicketCreationForm` with a $1 fixed minimum charge; clearly display the $1 charge to the customer before submission.
- Remove backend full-payment validation that currently blocks ticket creation; allow ticket creation to proceed after the $1 charge is processed.

**User-visible outcome:** Customers no longer see a history tab, the page no longer jumps to the top when switching tabs, and they can create a ticket by paying only $1 instead of being blocked by a full payment requirement.
