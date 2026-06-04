# Irrigation System Assessments and Inspections

Date: 2026-06-04

## 1. Summary

This document defines a platform-agnostic product baseline for irrigation setup, inspection execution, map interaction, output capture, and follow-up handoff.

The current target operating model has one shared irrigation workspace with channel-specific shells:

1. A desktop record workspace for property pivot, asset hierarchy management, detail editing, irrigation map work, controller programs, and related activity review.
2. A mobile field workspace for work-order-driven execution, map-first asset interaction, checklist output capture, and submit readiness.

The business goal is to move from inspection to actionable follow-up work with less field friction, clearer operational visibility, and better conversion of findings into downstream work.

## 2. Problem Statement

Current irrigation operations are fragmented across spreadsheets, paper, local branch habits, and disconnected systems, which leads to:

1. Missed revenue when findings do not become approved follow-up work.
2. Inconsistent inspections, evidence capture, and output quality across regions.
3. Poor visibility into unresolved outputs, readiness blockers, and aging follow-up work.
4. Duplicate documentation effort between setup, inspection, and reporting.
5. Weak continuity between property, asset, map, checklist, and follow-up records.

## 2.1 Discovery Observations

1. Work execution varies by branch, but the core need is consistent: know what assets exist, inspect them quickly, and route the outcomes.
2. Field users need map and asset context without leaving the inspection flow.
3. Office users need property-level visibility across assets, appointments, callouts, proposals, and history.
4. Some jobs are irrigation-specific and need irrigation workflow behavior; others must remain visible but stay on standard FSM handling.
5. Checklist-driven issue capture is more reliable than free-form issue logging for repeated irrigation work.

## 2.2 Minimal Path to Value

1. Use soft warnings by default and reserve hard blockers for true policy requirements.
2. Require only the data needed to complete the current step safely.
3. Allow in-flow asset creation or correction when setup gaps are discovered.
4. Keep map, asset, checklist, and submit context connected in one workspace.
5. Support offline-tolerant field capture with visible save state and recoverable sync.
6. Keep non-irrigation work visible without forcing it into irrigation-only submit logic.

## 3. Goals and Outcomes

### 3.1 Business Outcomes

1. Increase conversion of actionable outputs into approved follow-up work.
2. Improve property-level visibility into unresolved irrigation issues.
3. Reduce time from field finding to downstream routing and decision.
4. Improve evidence completeness and output quality.
5. Reduce duplicate setup and inspection documentation.

### 3.2 User Outcomes

1. Field users can complete irrigation work from a map-first workflow with low friction.
2. Office users can review setup, related activity, and history from a property-centric record workspace.
3. Managers can see readiness, completion, output pipeline, and quality trends without adding field burden.

## 4. Operating Roles

1. Field technician or irrigation specialist working from a work order or service appointment.
2. Account manager or operations coordinator reviewing property and follow-up status.
3. Branch leadership monitoring pipeline, quality, and missed revenue.
4. Governance owner maintaining checklist and policy consistency.
5. Customer-facing stakeholder consuming customer-safe summaries or follow-up outputs.

## 5. Experience Principles

1. Prefer checklist-first output capture over free-form issue logging.
2. Use one shared workspace contract with channel-specific layout wrappers rather than separate behavior models.
3. Keep record, map, checklist, and related views in the same working context.
4. Support a strict irrigation hierarchy with clear parent-child rules.
5. Retire operational records instead of hard deleting them.
6. Keep save state and offline state visible to field users.
7. Default customer-facing output to safe summary language.
8. Preserve context when moving between property, asset, work item, map, and submit surfaces.

## 6. Canonical Domain Model

### 6.1 Core Records

Note: system-managed fields such as IDs, timestamps, audit metadata, and platform ownership fields are assumed where needed and listed only where business behavior depends on them.

#### 6.1.1 Property

Purpose: top-level operational site.

Minimum fields:

1. Name.
2. Region or branch.
3. Status.
4. Primary service context, optional.

#### 6.1.2 Work Order

Purpose: scheduling and parent execution context for one or more line items.

Minimum fields:

1. Work order number.
2. Property context.
3. Service territory.
4. Scheduled window.
5. Status.

#### 6.1.3 Work Order Line Item

Purpose: mobile execution context for a specific scoped work item.

Minimum fields:

1. Work Order context.
2. Work type.
3. Irrigation mode flag.
4. Read-only or standard-flow flag when not irrigation scoped.
5. Assignment state.
6. Duration or man-hours.
7. Progress or readiness snapshot.

#### 6.1.4 Service Appointment

Purpose: field service event linked to the work scope and its captured outcomes.

Minimum fields:

1. Property context.
2. Work Order or Work Order Line Item context, optional.
3. Service type.
4. Assigned user.
5. Stage or status.
6. Started and completed timestamps.
7. Checklist template version snapshot reference.
8. Outcome summary payload.
9. No-touch reason code and note when no asset changes occur.

#### 6.1.5 Asset or Component

Purpose: irrigation record used in setup, map, checklist, and output workflows.

Minimum fields:

1. Property context.
2. Asset type.
3. Name.
4. Status, where active and retired are the main lifecycle states.
5. Parent asset, nullable only for System.
6. Root system reference.
7. Asset level or component level.
8. Description.
9. Install date, optional.
10. Serial number, optional.
11. Mapped geometry or linked feature reference, optional.
12. Spatial source and confidence, optional.
13. Placeholder flag when auto-created or awaiting resolution.

Supported asset types are grouped into two categories:

1. Core hierarchy assets: System, Point of Connection, Pump, Backflow, Master Valve, Flow Sensor, Controller, Zone.
2. Zone-linked components exposed in v4.2: Valve, Head, Drip Emitter Group.

Implementations may persist zone-linked components either as first-class child records or as a specialized component subtype, but they must remain individually selectable, editable, and referenceable in map and output workflows.

#### 6.1.6 Checklist Template

Purpose: versioned checklist catalog that drives field execution.

Minimum fields:

1. Version.
2. Effective status, where draft, published, and archived are the main lifecycle states.
3. Resolver dimensions such as region, service type, inspection type, season, and branch policy.
4. Asset-type applicability.
5. Question definitions, branching rules, and output behavior.

#### 6.1.7 Checklist Response

Purpose: typed response captured during a Service Appointment and linked to an asset or appointment scope.

Minimum fields:

1. Service Appointment context.
2. Asset or component context, nullable when appointment scoped only.
3. Template question reference.
4. Typed value.
5. Quantity when relevant.
6. Resolved-on-visit flag when supported.
7. Updated timestamp.
8. Updated by.

#### 6.1.8 Service Appointment Output

Purpose: concrete inspection result created from checklist responses and tracked for follow-up, reporting, or customer communication.

Minimum fields:

1. Service Appointment context.
2. Asset or component context.
3. Output category or type.
4. Severity or priority.
5. Quantity when relevant.
6. Status or disposition.
7. Owner.
8. Evidence links.
9. Customer-safe summary text.

Also required:

1. Appointment-level summary of outputs by asset type.
2. Total output count for the appointment.
3. Plain-language summary of what was found and what should happen next.

#### 6.1.9 Service Appointment Handoff

Purpose: handoff payload emitted when outputs are ready for downstream processes such as callouts, proposals, or follow-up work.

Minimum fields:

1. Service Appointment context.
2. Source output reference or references, optional.
3. Output status such as completed or submitted.
4. Emitted timestamp.
5. Destination process reference, optional.
6. Payload summary.

#### 6.1.10 Program Schedule

Purpose: controller runtime schedule and zone linkage.

Minimum fields:

1. Controller context.
2. Program name.
3. Linked zone context, optional.
4. Days of week.
5. Start time.
6. Run time in minutes.
7. Seasonal adjustment percent.
8. Active flag.

#### 6.1.11 Map Feature

Purpose: geometry and map metadata linked to properties, assets, and components.

Minimum fields:

1. Property context.
2. Linked asset or component context, optional.
3. Geometry type, with Point, LineString, and Polygon as core forms.
4. Geometry payload in a portable spatial format.
5. Map source.
6. Map confidence.
7. Sync state.

#### 6.1.12 Attachment or Evidence

Purpose: photo, file, or evidence item tied to appointments, checklist rows, outputs, or assets.

Minimum fields:

1. Parent entity type and reference.
2. File metadata.
3. Captured timestamp and user.
4. Evidence type tag.

#### 6.1.13 Audit Event

Purpose: immutable event log for key operational actions.

Minimum fields:

1. Entity type and reference.
2. Action.
3. Actor.
4. Timestamp.
5. Detail payload such as before-and-after summary, skip reason, or policy outcome.

### 6.2 Relationship Rules

1. Each Property has exactly one active System.
2. Point of Connection parent must be System.
3. Pump parent must be Point of Connection.
4. Backflow parent must be Point of Connection.
5. Master Valve parent must be Point of Connection.
6. Flow Sensor parent must be Point of Connection.
7. Controller parent must be Point of Connection.
8. Zone parent must be Controller.
9. Valve parent must be Zone.
10. Head parent must be Zone.
11. Drip Emitter Group parent must be Zone.
12. Non-root records must have a valid parent of an allowed type.
13. Zone display name should normalize to `Zone <number>`.
14. Zone number must be unique within a Controller.
15. Assets and components are retired, not hard deleted.
16. Work Order Line Items must stay visible even when not irrigation scoped, but irrigation-only actions must be gated off.
17. Placeholder zones created during controller sync must remain auditable until resolved, skipped, or retired.

## 7. Asset Metadata and Checklist Coverage

### 7.1 Common Metadata

All assets and components:

1. Name.
2. Asset type.
3. Status.
4. Parent, except System.
5. Install date, optional.
6. Description, optional.
7. Serial number, optional where relevant.
8. Map linkage or spatial context where mappable.

### 7.2 Type-Specific Metadata

System:

1. Mainline pipe type, optional.
2. Mainline pipe size, optional.

Point of Connection:

1. Water source type.
2. Source capacity or pressure, optional.

Pump:

1. Operational status, optional.
2. Pressure, optional.
3. Pump type, optional.
4. Make or model, optional.

Backflow:

1. Backflow type, required at create or edit guard.
2. Backflow size, optional.
3. Last test date, optional.
4. Last test result, optional.
5. Last rebuild date, optional.
6. Next test due, optional.
7. Compliance status, optional.
8. Testing authority, optional.

Master Valve:

1. Operational status, optional.
2. Valve type, optional.
3. Solenoid resistance, optional.

Flow Sensor:

1. Functional status, optional.
2. Flow reading, optional.
3. Last calibration date, optional.

Controller:

1. Controller label, required.
2. Total zones, required integer greater than or equal to 1.
3. Total zones used, optional.
4. Make or model, optional.
5. Connectivity type, optional.
6. Smart controller flag, optional.
7. Smart controller status, optional.
8. Controller app or platform, optional.
9. Rain sensor, optional.

Zone:

1. Zone number, required.
2. Area served, optional.
3. Flow rate, optional.
4. Pressure, optional.
5. Primary head type, optional.
6. Distribution method, optional.
7. Lateral pipe type or size, optional.
8. Solenoid resistance, optional.
9. Valve type, optional.
10. Valve location notes, optional.
11. Station identifier, optional.
12. Station wire path notes, optional.
13. Station electrical status, optional.

Valve:

1. Valve type.
2. Valve location notes, optional.
3. Valve condition, optional.

Head:

1. Head subtype.
2. Nozzle size, optional.
3. Throw radius, optional.
4. Arc degrees, optional.

Drip Emitter Group:

1. Emitter type.
2. Flow rate, optional.
3. Emitter count, optional.
4. Coverage area, optional.

### 7.3 Checklist Coverage by Component

System:

1. Mainline leak visibility.
2. Mainline pressure stability.
3. Isolation valve condition.
4. Quick-coupler valve condition where relevant.

Point of Connection:

1. Water restrictions in place.
2. Restriction details when relevant.

Pump:

1. Pump operational state when present.
2. Pump pressure reading.
3. Abnormal cycling or noise check.

Backflow:

1. Visible damage and leak checks.
2. Test-required and test-passed branching.
3. Certificate upload when testing is completed.
4. Seasonal or freeze-protection check where relevant.

Master Valve:

1. Operational check when present.
2. Leak or seepage check.
3. Manual override serviceability check.

Flow Sensor:

1. Installed or connected check when present.
2. Reading plausibility check.
3. Fault or alarm state check.

Controller:

1. Power, accessory, and state checks.
2. Program compliance and seasonal adjustment capture.
3. Winterization branch where relevant.

Zone:

1. Runtime minutes.
2. Failure prompts for broken head, bad wiper or clogged nozzle, sunken or tilted head, head not retracting, head not rotating, lateral leak, valve not activating, and seeping valve.
3. Overspray prompt where regionally required.
4. Stuck-valve and low-head-drainage dependent branches where configured.
5. Repair capture, quantity support, and notes.
6. Station wiring fault check.

Zone-linked components:

1. Components must be referenceable from map selection and outputs even when checklist questions are primarily zone scoped.
2. Evidence capture may attach at either the zone level or the component level.

### 7.4 Zone Sync Rules

When Controller total zones changes:

1. Missing zones from 1..N are auto-created as placeholders.
2. Extra zones greater than N are auto-retired when safe.
3. Extra zones linked to child components, program references, or outputs are not auto-retired and must be flagged as skipped.
4. Auto-create, retire, and skipped outcomes must be audit logged.

### 7.5 Create-Time Required Field Rules

Minimum create-time guards:

1. System requires Name.
2. Point of Connection requires Name and parent System.
3. Pump requires Name and parent Point of Connection.
4. Backflow requires Name, Backflow Type, and parent Point of Connection.
5. Master Valve requires Name and parent Point of Connection.
6. Flow Sensor requires Name and parent Point of Connection.
7. Controller requires Name, Controller Label, Total Zones, and parent Point of Connection.
8. Zone requires Zone Number and parent Controller, with display name normalized from the number.
9. Valve requires Name and parent Zone.
10. Head requires Name and parent Zone.
11. Drip Emitter Group requires Name and parent Zone.

## 8. Functional Requirements

### FR-1 Shared Workspace Contract

1. The product must use one shared irrigation workspace model across desktop and mobile surfaces.
2. The shared model must own selected asset state, edit state, save state, offline state, and layout orchestration.
3. Desktop must support a record-first shell with Details, Irrigation, Program, Related, and History surfaces.
4. Desktop must support property pivot navigation without losing the active asset or property context.
5. Mobile must support a work-order-driven shell with Workspace, Details, Irrigation, Summary, and Feed surfaces.
6. Mobile irrigation flow must stay map first, with the bottom sheet as the primary workflow container.
7. The mobile bottom sheet must support at least peek and expanded states.
8. The mobile irrigation workflow stack must support Assets, Checklist Output, and Submit Reports in one continuous scroll path.
9. Non-irrigation work items must remain visible but use standard flow instead of irrigation-only submit behavior.

### FR-2 Hierarchy and Asset Management

1. Support System, Point of Connection, Pump, Backflow, Master Valve, Flow Sensor, Controller, Zone, Valve, Head, and Drip Emitter Group records or equivalent component records.
2. Enforce parent-child hierarchy rules in create, edit, import, and render logic.
3. Support retire behavior, not hard delete, for operational assets and components.
4. Prevent duplicate zone numbers per controller.
5. Prevent invalid reparenting that would break hierarchy rules.
6. Auto-generate and maintain placeholder zones when controller capacity requires it.
7. Preserve selected asset context across record, map, checklist, and related surfaces.
8. Allow in-flow create and edit from both record and map entry points.

### FR-3 Asset Detail and Metadata

1. Support type-specific metadata forms for core hierarchy assets and zone-linked components.
2. Persist and edit common metadata such as install date, description, serial number, and map linkage.
3. Persist and edit controller metadata such as label, total zones, connectivity, smart status, and platform.
4. Persist and edit backflow metadata such as type and compliance fields.
5. Persist and edit zone metadata such as number, area served, flow, distribution method, piping, solenoid values, and station details.
6. Persist and edit valve, head, and drip component metadata when those components are modeled explicitly.
7. Show related asset context during edit actions where parent or linked records matter.
8. Expose an asset-level timeline or equivalent audit-oriented history summary where available.

### FR-4 Checklist Resolution and Output Capture

1. Resolve one published checklist template per Service Appointment using dimensions such as region, service type, season, and policy context.
2. Snapshot template version at Service Appointment start so it does not drift mid-appointment by default.
3. Render only applicable checklist sections and questions.
4. Support typed checklist values such as boolean, number, count, text, select, and evidence attachments.
5. Support quantity-based finding rows for repeatable irrigation failures.
6. Allow finding-capable rows to move from unresolved to resolved-on-visit where configured.
7. Support evidence attach and remove from checklist rows or the linked asset context.
8. Support opening checklist work directly from map-selected assets or components.

### FR-5 Turn Responses into Actionable Outputs

1. Generate Service Appointment outputs from checklist responses by asset or component context.
2. Support informational and actionable outputs.
3. Enforce mutually exclusive no-issues behavior where configured.
4. Maintain appointment-level output counts and summary by asset type.
5. Provide output lists in both global appointment context and selected-asset context.
6. Support output status, owner, severity, quantity, disposition, and evidence links.
7. Support customer-safe summary text separate from internal detail.

### FR-6 Submission and Readiness Rules

1. Support branch-configurable hard blockers for submission.
2. Support branch-configurable soft gates with explicit justification where allowed.
3. Support optional no-touch reason code and note capture where configured.
4. Support assignment-based submit eligibility.
5. Support visible readiness or progress status in the mobile workspace.
6. Keep save state visible through a compact status indicator.
7. On successful submit, move the appointment or work item to completed and allow post-submit routing.
8. Keep non-irrigation work items visible, but route them through standard handling instead of irrigation submit flow.

### FR-7 Manage Controller Programs

1. Create, edit, duplicate, activate or deactivate, and delete controller programs.
2. Validate required fields, including program name, at least one schedule day, and at least one zone runtime greater than zero.
3. Support zone linkage and active or inactive status.
4. Support runtime minutes and seasonal adjustment.
5. Support controller-context program views from the desktop workspace.
6. Audit create, edit, duplicate, activate, deactivate, and delete actions.

### FR-8 Work with Map Features in Context

1. Create, edit, and delete Point, LineString, and Polygon features.
2. Link features to assets or components or leave them unlinked where needed.
3. Preserve property, work item, and selected asset context through the shared workspace.
4. Support layer visibility, filtering, and search for mapped irrigation assets.
5. Support asset selection from the map with direct actions such as open asset, open checklist, save, and remove.
6. Support map fullscreen mode on mobile without losing the active selection or workflow state.
7. Support map-driven asset creation and geometry linkage.
8. Support KML and other common GIS file uploads with parsing, validation, and import into asset-linked geometry where source data is sufficient.
9. Support a bundled import mode for whole-system component creation where source files represent a full hierarchy.
10. Enforce feature limits and performance-safe rendering thresholds.

### FR-9 Related Activity and History

1. Show service appointments with checklist findings summaries.
2. Show callouts or equivalent downstream follow-up records linked to the property.
3. Show proposals or equivalent downstream commercial artifacts when relevant.
4. Show files or evidence counts where available.
5. Expose an audit timeline for key setup and execution actions.
6. Support a history surface even when some underlying platform history is not yet fully implemented.

### FR-10 Manager Visibility and Reporting

1. Show completion metrics by branch, property, and period.
2. Show output pipeline metrics such as open, aging, by type, by severity, and by owner.
3. Show Service Appointment-to-decision throughput metrics.
4. Show revenue capture metrics, including actionable output value, approved follow-up value, conversion rate, and estimated missed revenue.
5. Show data quality metrics such as required completion, evidence coverage, unresolved placeholders, and skipped zone-sync exceptions.
6. Keep reporting as a manager-facing surface and avoid adding field completion steps.

## 9. Integration and Handoff Expectations

### 9.1 Context Passing

At minimum, pass:

1. Property identifier.
2. Work Order or Work Order Line Item identifier, optional.
3. Service Appointment identifier, optional.
4. Asset or component identifier, optional.
5. Mode, such as field, desktop-record, or manager.
6. Selected map context when embedded workspaces are used.

### 9.2 Ownership and Handoff Boundaries

1. The product owns irrigation assets and components, Service Appointment outcomes, outputs, map context, and controller programs.
2. The product does not own estimates, contracts, or downstream work execution records.
3. The product must hand off output status, customer-safe summary, and completion state for downstream use.

### 9.3 Cross-Surface Messaging

Where embedded workspaces exist, such as a map inside a record view:

1. Parent workspace can push property and asset context to child workspace.
2. Child workspace can return updates, selection changes, and save-state events to parent.
3. Message contracts must be versioned and schema validated.

## 10. Experience and Reliability Requirements

1. Maintain desktop and mobile parity for core irrigation workflows even when layout differs.
2. Support offline-tolerant field work with deferred sync.
3. Support conflict handling and safe merges for delayed writes.
4. Support visible save-state feedback such as saving, saved, and failed.
5. Support bulk-safe server operations for import and multi-record updates.
6. Enforce validation on the server side, not UI only.
7. Maintain end-to-end auditability for governance-critical changes.
8. Minimize field friction and protect speed of execution.
9. Preserve working context across tabs, sheets, and modal transitions.

## 11. Security and Access

1. Support role-based visibility and action permissions.
2. Separate execution authority from approval authority.
3. Control publish authority for checklist templates and policy gates.
4. Provide audit visibility for compliance and operations stakeholders.
5. Keep customer-safe output separate from internal-only detail.

## 12. Data Quality Controls

1. Validate parent type for all non-root assets and components.
2. Enforce required metadata checks by asset type.
3. Enforce zone uniqueness and naming normalization checks.
4. Enforce geometry type checks by feature type.
5. Enforce controlled value checks for status, type, and disposition fields.
6. Enforce downstream handoff linkage checks for actionable outputs where configured.
7. Keep placeholder assets auditable until resolved, skipped, or retired.
8. Enforce irrigation-mode gating so non-irrigation work items cannot submit through irrigation-only flow.

## 13. Migration and Backward Compatibility

1. Support runtime normalization from legacy issue-count or callout formats to checklist output summary.
2. Preserve historical records while projecting normalized summary fields.
3. Maintain idempotent migration behavior at load time.
4. Preserve existing records while introducing newer output and handoff models.
5. Where historical systems treated valve, head, or drip details as zone metadata only, support projection into individually addressable component views without losing historical source context.

## 14. Open Decisions

1. Final map provider selection, if a third-party map is used.
2. Hard versus soft required-question gating by region or branch.
3. Final readiness scoring formula and ownership.
4. Evidence guidance policy by output type and severity.
5. Final persistence model for zone-linked components in the implementation platform.

## 15. Release Baseline

Release is ready when:

1. Shared desktop and mobile workspace behavior is defined and implemented with channel-specific shells.
2. Standard hierarchy constraints are enforced in create and edit workflows.
3. Service Appointment runtime resolves and snapshots one published template per appointment.
4. Outputs are generated and summarized by asset or component type with appointment-level counts.
5. Submission policy supports configured hard blockers, soft-gate justification, assignment-based eligibility, and no-touch capture.
6. Controller total-zone sync creates, retires, or skips zones per rules, with audited outcomes.
7. Program CRUD works in controller context with validation, duplicate, toggle active, and delete actions.
8. Map feature CRUD works for point, line, and polygon geometries, with map selection actions and basic KML import.
9. Related and history views show checklist findings or output summaries, downstream artifacts, and audit trails.
10. Reporting views expose completion, output pipeline, throughput, revenue capture, and data quality metrics.
11. Non-irrigation work items stay visible but do not enter irrigation-specific submit flow.

## 16. Traceability to Source Inputs

1. requirements/fsm_irrigation_requirements.md
2. prototype/v4/v4_architecture.md
3. prototype/v4/v4_implementation_spec.md
4. prototype/v4/desktopV4.2.html
5. prototype/v4/mobileV4.2.html
6. prototype/v4/controller_program.html
