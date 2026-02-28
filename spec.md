# Specification

## Summary
**Goal:** Fix history display on customer and expert dashboards, remove payment option from ticket creation form, fix the expert payment request modal toggle, and resolve deployment build errors.

**Planned changes:**
- Remove all payment-related fields and toggles from the ticket creation form in the CustomerDashboard so tickets can be created without any payment input.
- Fix the expert/technician payment request toggle in the ChatSection so that activating it correctly opens the payment request modal, and closing it resets the toggle state.
- Fix the Service History tab on the CustomerDashboard to correctly fetch and display resolved tickets for the logged-in customer, with proper loading and empty states.
- Fix the history section on the ExpertDashboard to correctly fetch and display resolved/closed tickets assigned to the logged-in technician, with proper loading and empty states.
- Audit and fix any backend Motoko compilation errors, frontend TypeScript/bundler errors, type mismatches, or missing imports causing deployment failures.

**User-visible outcome:** Customers can create tickets without seeing payment options, experts can successfully open the payment request popup via the toggle, both customers and experts can view their ticket history, and the application builds and deploys without errors.
