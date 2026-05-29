# Irrigation Product Requirements Document (PRD) V4

Date: 2026-05-29
Status: Prototype-grounded draft
Owner: FSM Product / Architecture
Source Prototypes: prototype/v4/desktopV4.html, prototype/v4/mobileV4.html

## 1. Executive Summary

This PRD defines V4 requirements based on implemented behavior in the desktop and mobile prototypes.

V4 expands the irrigation experience into a two-surface operating model:

1. Desktop record workspace for hierarchy management, map workspace, related records, and controller program management.
2. Mobile WOLI execution workspace for map-first field operations, checklist output capture, approval gating, and submission.

The target outcome is consistent operational handoff from field inspection actions to Account Manager (AM) follow-through, with clear gating rules and per-asset traceability.

## 2. Problem Statement

Current field and office workflows remain fragmented, causing:

1. Incomplete asset-level inspection evidence.
2. Weak handoff discipline from field checklist output to AM action.
3. Inconsistent map and asset context between desktop planning and mobile execution.
4. Ambiguous completion state for irrigation WOLIs.

## 3. Product Goals

1. Provide a unified desktop workspace for irrigation asset records and related operational context.
2. Provide a mobile-first WOLI runtime with explicit checklist and approval requirements prior to submit.
3. Keep asset/map/checklist context synchronized across list, detail, and spatial interactions.
4. Enforce minimum operational controls while preserving field speed.

## 4. Scope

### 4.1 In Scope

1. Desktop record workspace tabs: Details, Irrigation, Program, Related, Chatter (placeholder), History (placeholder).
2. Desktop asset create/edit/retire modal workflows with type-specific fields.
3. Desktop map embed and map context sync.
4. Desktop controller program CRUD.
5. Mobile Work Order overview mode and WOLI workspace mode.
6. Mobile map-first workflow with asset selection, full-screen map mode, and map edit controls.
7. Mobile checklist composer by asset type with issue detection/resolution state.
8. Mobile submission gating based on checklist output/no-touch policy and AM assignment.
9. Local session persistence for irrigation WOLIs.

### 4.2 Out of Scope (V4 Prototype)

1. Production backend persistence and sync conflict resolution.
2. Full Salesforce Chatter integration.
3. Full Salesforce field history integration.
4. Real GIS system-of-record writeback and enterprise GIS integration.
5. Final readiness scoring algorithm.

## 5. Personas

1. Irrigation Technician: execute WOLI inspections, capture findings, and submit output.
2. Account Manager: receive assigned output and disposition field findings.
3. Branch/Operations Lead: monitor completion state and execution quality.
4. Irrigation Admin: maintain hierarchy and controller program quality on desktop.

## 6. Information Architecture

### 6.1 Desktop V4

1. Record header with Property Account, Account Owner, Readiness, Branch, Last Updated.
2. Tabs:
3. Details: Asset Information, Asset Timeline, System Information.
4. Irrigation: embedded map workspace.
5. Program: controller program workspace.
6. Related: Service Appointments, Callouts, Proposals.
7. Chatter: placeholder.
8. History: placeholder.

Tab visibility constraints:

1. Program tab is shown for controller context only.
2. Related tab is shown for system context.
3. Map tab requires an active asset context.

### 6.2 Mobile V4

1. Two runtime modes:
2. Work Order mode: overview of line items and related summary counts.
3. WOLI mode: execution workspace for irrigation line items.
4. Navigation tabs: WORKSPACE, DETAILS, IRRIGATION, SUMMARY, FEED.
5. Map-first panel with map controls and workflow surfaces (Assets, Checklist Output, Submit Reports).

## 7. Functional Requirements

### FR-1 Hierarchy and Asset Management (Desktop + Mobile)

1. Support asset types: System, Controller, Backflow, Zone, plus map-linked component variants.
2. Enforce parent-child hierarchy conventions in migration and rendering logic.
3. Support soft-retire/remove behavior for assets.
4. Prevent duplicate asset names within active working scope.
5. Auto-generate and maintain placeholder zones when controller zone capacity requires it.
6. Prevent duplicate zone numbers per controller.

### FR-2 Asset Detail and Metadata

1. Support type-specific metadata forms.
2. Persist/edit common metadata (lifecycle, install date, condition, spatial source/confidence).
3. Persist/edit controller metadata (label, zones, make/model, connectivity, smart status, app/platform).
4. Persist/edit backflow metadata (type, serial, testing/compliance fields).
5. Persist/edit zone metadata (zone number, area served, flow, distribution method, piping/solenoid fields).

### FR-3 Program Management

1. Program management is available for controller assets only.
2. Program create/edit requires program name and at least one schedule day.
3. Program create/edit requires at least one start time.
4. Program supports zone link, runtime minutes, seasonal adjust percent, active flag.
5. Program supports duplicate, toggle active, and delete actions.

### FR-4 Map Workspace

1. Map must support asset selection and context sync with detail surfaces.
2. Map must support geometry edit mode and marker placement mode.
3. Map must support geometry delete with explicit confirmation behavior.
4. Map must support full-screen mode on mobile.
5. Map must support opening checklist and asset detail directly from selected map context.
6. Map must support asset create from map events and link new geometry to created assets.

### FR-5 Mobile Checklist Output Capture

1. Checklist definitions must vary by asset type (system, source, backflow, controller, zone).
2. Checklist entries must support boolean, count, number, and text types.
3. Checklist rows marked as finding-capable must support resolved-on-visit state.
4. Dependent text prompts must unlock based on prerequisite finding toggles where configured.
5. Checklist save must create per-asset visit imprint entries with before/after values and timestamp.
6. Checklist must support photo attachment and removal at the asset level.

### FR-6 Related Output and Submission

1. SUMMARY surfaces must show captured checklist output entries with status chips.
2. Open Checklist actions must deep-link to the selected asset composer.
3. AM assignment is required for submit eligibility.
4. Submit is blocked until both conditions are met:
5. Checklist output requirement met (touched assets OR explicit no-touch reason code + note).
6. AM assignment requirement met.
7. On successful submit, irrigation WOLI status transitions to COMPLETED.
8. User is offered post-submit routing: remain on WOLI or return to Work Order overview.

### FR-7 WOLI and Work Order Mode Behavior

1. Non-irrigation WOLIs remain visible but use a read-only/standard-flow placeholder behavior.
2. Irrigation WOLI transitions NEW -> IN PROGRESS -> COMPLETED.
3. Completed WOLIs support reopen action and return to active execution state.
4. WOLI progress score combines checklist completion, output/no-touch compliance, and AM assignment.

### FR-8 Related Records (Desktop)

1. Related tab must include Service Appointments table with checklist findings summary/count.
2. Related tab must include Callouts table with status and priority context.
3. Related tab must include Proposals table with amount and status context.

## 8. Data Requirements

1. Property-level state includes hierarchy assets, inspections, callouts, proposals, audit, and map prototype state.
2. Controller-level state includes embedded programs collection.
3. Inspection rows support checklist findings by asset type and normalized total finding count.
4. Mobile irrigation session state includes:
5. Controllers, backflows, zones.
6. Required question completion array.
7. Touched asset keys.
8. Visit imprint history.
9. AM assignment state.
10. No-touch reason code and note.

## 9. Validation and Guardrails

1. Required validation for asset and program names.
2. Duplicate name protection for created/edited assets.
3. Program save validation for missing days/start times.
4. Submission guardrails for AM assignment and checklist/no-touch policy.
5. Destructive map actions use double-tap confirmation windows.

## 10. Non-Functional Requirements

1. Support desktop and mobile form factors with mode-specific navigation behavior.
2. Persist in-progress irrigation session state locally by WOLI identifier.
3. Preserve working context across tab switches and modal/dialog transitions.
4. Maintain responsiveness in map-first UI while selection/edit states change.

## 11. Known Gaps and Placeholders

1. Readiness value is displayed but not computed by a finalized rule engine.
2. Chatter tab content is placeholder only.
3. History tab content is placeholder only.
4. Prototype uses local/session browser storage and simulated map events, not production integration.

## 12. Acceptance Criteria (V4 Prototype Baseline)

1. User can open a desktop asset, navigate tabs, and edit/create/retire assets with type-appropriate fields.
2. User can manage controller programs end-to-end from the Program workspace.
3. User can open mobile WOLI workspace, select assets from map/list, and save checklist output.
4. User can attach checklist photos and see output reflected in summary surfaces.
5. Submit remains disabled until AM assignment and checklist/no-touch requirements are satisfied.
6. Successful submit marks irrigation WOLI as completed and presents next-step routing options.

## 13. Open Decisions for Production PRD

1. Final readiness scoring formula and ownership.
2. Production persistence and integration contract for map geometry lifecycle.
3. Final source-of-truth boundary between Salesforce records and map runtime state.
4. Audit/event retention model for checklist and geometry edits.