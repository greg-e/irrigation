# Tapigo Integrated Browser Discovery

Date: 2026-05-27
Environment: Logged-in session in VS Code integrated browser
Tester: Copilot-assisted exploratory pass
Discovery depth: Structural + field-level + technical signal pass (non-destructive)

## Scope and Method

This pass was performed from an authenticated account and focused on:

1. Top-level module access and navigation behavior.
2. Configure-domain objects and create/edit form structures.
3. Operational modules (Survey, Inspect, Approve, Work, Invoice) for list/state behavior.
4. Profile/security-adjacent surfaces visible without changing credentials.
5. Frontend technical signals observable in runtime events.

No records were intentionally created or saved.

## Executive Assessment

Tapigo presents as a workflow suite composed of six core modules (Configure, Survey, Inspect, Approve, Work, Invoice) with a shared property-centric operating model. The account tested is functional and permissioned for broad navigation, but the org has near-empty business data, which limits validation of downstream lifecycle behavior.

Most significant findings:

1. Strong evidence of explicit object/process scaffolding for irrigation maintenance workflows.
2. Concrete pricing-engine structure (labor/material rates + default time/material per asset-action pair).
3. Legacy technical signals in mapping stack and frontend runtime behavior, including ArcGIS tile references and JavaScript errors.
4. Operational modules are reachable and consistent but largely data-gated due to no properties/pending services.

## High-Value Findings

### 1) Full module surface is available in this account

Observed modules:
- Configure
- Survey
- Inspect
- Approve
- Work
- Invoice

Interpretation:
- The account appears to have broad access across setup + execution + commercial process stages.
- This is suitable for deeper end-to-end discovery once seed data exists.

Confidence: High

### 2) Shared, property-centric interaction pattern across operational modules

Survey and Inspect:
- Show property list shell with search, A-Z index rail, and add (+) affordance.
- Empty-state messaging references adding properties.

Approve, Work, Invoice:
- Show property list with tabs such as All/Pending.
- Empty-state messaging specifically references pending services.

Interpretation:
- Workflow appears state-driven and property-centered, likely progressing service items across module-specific statuses.

Confidence: High

### 3) Configure object model includes core admin entities

Observed Configure sidebar entities:
- Organization
- Customers
- Properties
- Users
- Pricing Groups
- Events

Interpretation:
- The setup layer cleanly separates commercial entities (customers/properties/pricing) from platform entities (users/events).

Confidence: High

### 4) Property creation form captures both business and geospatial setup

Observed fields and controls in Configure > Properties > Add:
- Name, address block, phone/fax/email, contact details
- Customer lookup/select
- Pricing Group assignment
- Position section with interactive map controls and zoom/layer affordances

Interpretation:
- Property acts as both operational anchor and Map anchor.
- Pricing group assignment at property level strongly implies pricing inheritance in downstream work/invoice operations.

Confidence: High

### 5) Pricing Groups contain a detailed rate and defaults engine

Observed in Default Irrigation Pricing Group:
- Labor rates (example: Primary Technician with hourly rate)
- Materials unit costs (examples: bag, ft-based materials, size-specific variants)
- Asset/action default matrix with Default Time + Default Materials Cost
  - Examples observed across Backflow Preventer, Controller, Drip Line, Gate Valve, Lateral/Main Line, Master Valve, Pump, Sprinkler Head

Interpretation:
- Tapigo appears to encode estimating/quoting guidance and/or auto-defaults for field work to improve consistency and speed.

Confidence: High

### 6) Events object supports workflow/automation metadata

Observed fields in Configure > Events > Add:
- Name
- Description
- Solution Type (Irrigation Maintenance selected)
- Trigger Type (Manual selected)

Interpretation:
- There is an event framework, likely for process orchestration or reusable trigger-based actions.
- Additional behavior needs seeded data/config to validate.

Confidence: Medium-High

### 7) Profile surface includes details and password management

Observed:
- Profile tabs: Details, Password
- Password form requires Current Password, New Password, Confirm New Password
- User menu exposes My Profile, Need help? (mailto:support@tapigo.com), Logout

Interpretation:
- Baseline account self-service and support routing are present.

Confidence: High

## Technical Signals and Risks

### A) Legacy/transition signal: ArcGIS + Leaflet references in property map area

Observed signals:
- Console warnings for mixed-content requests to ArcGIS Online tile endpoints (auto-upgraded to HTTPS).
- UI text/link references include Leaflet.

Implication:
- Mapping stack appears legacy or hybrid and may carry maintenance/runtime compatibility risk.

Severity: Medium
Confidence: High

### B) Runtime error in property configuration flow

Observed signal:
- Console error while navigating from property add flow:
  - Cannot read properties of undefined (reading '$dirty')
  - Source reported in property.edit.js

Implication:
- Possible form-state bug in AngularJS-era code path; could impact save-state logic or user confidence in edit flows.

Severity: Medium
Confidence: High

### C) Data-poor org prevented deep lifecycle verification

Observed:
- Frequent "No Properties" / "No pending services" states in Survey/Inspect/Approve/Work/Invoice.

Implication:
- Cannot yet validate:
  - full inspection-to-approval-to-work-to-invoice transitions
  - automation/event outcomes
  - role-based handoff behavior
  - generated documents and service history artifacts

Severity: Low (discovery limitation, not necessarily product defect)
Confidence: High

## Inferred Domain Model (From Observed UI)

Likely core entities and links:

1. Organization
- Owns solution configuration and subscriptions.

2. Customer
- Parent commercial entity for one or more properties.

3. Property
- Operational + geospatial anchor.
- Linked to one customer.
- Linked to one pricing group.

4. User
- Access and profile identity.

5. Pricing Group
- Defines labor/material rates and asset-action default effort/cost parameters.

6. Event
- Defines manual (and likely other) trigger configurations by solution type.

7. Service pipeline items (inferred)
- Pending services associated with properties, surfaced differently in Approve/Work/Invoice.

Confidence: Medium-High

## What Was Not Fully Discoverable Yet

1. True end-to-end transaction lifecycle with real records.
2. Approval mechanics and state transitions beyond empty states.
3. Invoice generation details, line-item construction, and export outputs.
4. Permission granularity across different roles.
5. Integration APIs/webhooks and data export formats.
6. Mobile/offline sync behavior from this browser context.

## Recommended Next Discovery Pass (Actionable)

To unlock a true thorough product assessment, run a controlled scenario with seed data:

1. Create 1 customer and 1 property (with map position).
2. Configure or confirm pricing group defaults.
3. Add at least one service candidate in Survey/Inspect context.
4. Progress through Approve -> Work -> Invoice.
5. Capture for each step:
- required fields
- state changes
- generated outputs
- edit restrictions
- audit/history visibility

Suggested evidence artifacts for repo:
- screen-by-screen workflow map
- field dictionary by object
- state transition matrix
- issue log (defect, risk, ambiguity)

## Confidence Summary

Overall confidence in this discovery: Medium-High.

Reasoning:
- High confidence in navigation, visible data model, and technical signals.
- Medium confidence in lifecycle and automation behavior due to empty operational data.

