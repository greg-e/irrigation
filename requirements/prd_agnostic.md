# Irrigation System Assessments and Inspections

Date: 2026-06-03

## 1. Summary

This document describes the irrigation data model and day-to-day operating needs for asset setup, map context, field checklist completion, inspection outputs, and follow-up handoff.

The target way of working has two connected workspaces:

1. A record workspace for hierarchy management, related records, map context, and controller programs.
2. A field workspace for checklist-driven inspections, map-first asset interaction, output capture, and submit checks.

The business goal: move from inspection to follow-up work with clear tracking and less friction in the field.

## 2. Problem Statement

Current irrigation operations are split across disconnected tools and local habits, which leads to:

1. Missed revenue when findings are not turned into approved follow-up work.
2. Inconsistent inspections and evidence capture across branches and regions.
3. Limited visibility into unresolved outputs and delayed follow-through.
4. Duplicate system documentation creation.
5. Unclear completion status for irrigation-specific work.

## 2.1 Discovery Observations

1. Work execution is branch-specific and fragmented, with teams using spreadsheets, paper forms, vendor tools, and local workarounds.
2. Some reporting is standardized, but local differences still drive different ways of capturing notes, photos, and follow-up details.
3. Emergency and ad hoc work is often coordinated manually outside any system.
4. Schedules shift quickly, so teams need one view of upcoming work and an easy way to rebucket jobs.
5. Customer-facing access is inconsistent, and approval workflows vary by account.

## 2.2 Minimal Path to Value

1. Use soft warnings by default, and only block work when compliance requires it.
2. Require only the data needed to take immediate action.
3. Allow in-flow asset edits when required setup is missing.
4. Capture what is needed now and enrich details later when useful.
5. Rely on tracking and follow-up queues instead of live approvals when possible.
6. Support offline field capture with later sync.
7. Prioritize action lists over deep record detail for managers and coordinators.
8. Default outbound communication to customer-safe content.
9. Make edits and sync issues visible and recoverable.

## 3. Goals and Outcomes

### 3.1 Business Outcomes

1. Reduce missed revenue by increasing conversion of actionable outputs into approved work.
2. Improve reliability of output tracking at the property level.
3. Reduce time from inspection result to downstream decision.
4. Improve evidence completeness for outputs and repairs.
5. Improve consistency and auditability across regions.

### 3.2 User Outcomes

1. Field users can complete work with clear scope and low friction.
2. Office users can triage and route unresolved work with full context.
3. Governance users can maintain content quality and consistency across regions.

## 4. Personas

1. Technician or field specialist.
2. Account or operations manager.
3. Branch leadership.
4. Standards or governance owner.
5. Customer-facing stakeholder with read-only access to history.

## 5. Experience Principles

1. Prefer checklist-first output capture over free-form issue capture.
2. Use a strict hierarchy with clear parent-child rules.
3. Retire records instead of hard deleting operational data.
4. Support offline-safe field work with later sync.
5. Keep the data model platform-agnostic with clear integration boundaries.
6. Preserve context when moving between property, asset, map, and work views.
7. Keep customer-facing output safe by default.

## 6. Canonical Domain Model

### 6.1 Core Records

Note: system-managed fields such as record IDs, timestamps, and audit metadata are assumed where needed and listed only when the business process depends on them.

#### 6.1.1 Property

Purpose: top-level operational site.

Minimum fields:

1. Name.
2. Region or branch.
3. Status.

#### 6.1.2 Asset

Purpose: hierarchy node for irrigation components.

Minimum fields:

1. Property context.
2. Asset type.
3. Name.
4. Status, where active and retired are the main lifecycle states.
5. Parent asset, nullable only for System.
6. Description.
7. Install date.
8. Condition state or score.
9. Spatial source and confidence when mapped.
10. Placeholder flag when auto-created or awaiting resolution.

Supported standard asset types:

1. System.
2. Point of Connection.
3. Pump.
4. Backflow.
5. Master Valve.
6. Flow Sensor.
7. Controller.
8. Zone.

Zone-linked component details such as valve, head, drip, station, and drip emitter group data are stored as metadata on the related zone or controller context, not as separate hierarchy nodes.

#### 6.1.3 Service Appointment

Purpose: record for a field service event and its outcomes.

Minimum fields:

1. Property context.
2. Service type.
3. Assigned user.
4. Stage or status.
5. Started and completed timestamps.
6. Checklist template version snapshot reference.
7. Outcome summary payload.
8. Zero-touch reason code and note when no asset changes occur.

#### 6.1.4 Checklist Template

Purpose: versioned checklist catalog that drives field execution.

Minimum fields:

1. Version.
2. Effective status, where draft, published, and archived are the main lifecycle states.
3. Resolver dimensions such as region, service type, inspection type, and season.
4. Asset-type applicability.
5. Question definitions and conditional logic.

#### 6.1.5 Checklist Response

Purpose: responses captured during a Service Appointment and linked to relevant assets.

Minimum fields:

1. Service Appointment context.
2. Asset context, nullable when appointment-scoped only.
3. Template question reference.
4. Typed value.
5. Updated timestamp.
6. Updated by.

#### 6.1.6 Service Appointment Output

Purpose: a concrete inspection result from a Service Appointment that must be tracked, summarized, and handed off for follow-up work, reporting, or customer communication.

Minimum fields:

1. Service Appointment context.
2. Asset context.
3. Output category or type.
4. Severity or priority.
5. Quantity when relevant.
6. Status or disposition.
7. Owner.
8. Evidence links.

Also required:

1. Appointment-level summary of all outputs by asset type.
2. Total output count for the appointment.
3. Plain-language summary of what was found and what needs to happen next.

Use this record when a checklist response becomes something the branch must act on or explain to the customer.

#### 6.1.7 Service Appointment Handoff

Purpose: handoff payload created when Service Appointment outputs are ready for downstream processing.

Minimum fields:

1. Service Appointment context.
2. Source output reference or references, optional.
3. Output status, such as completed or submitted.
4. Emitted timestamp.
5. Destination process reference, optional.
6. Payload summary.

#### 6.1.8 Program Schedule

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

#### 6.1.9 Map Feature

Purpose: geometry and map metadata linked to properties and assets.

Minimum fields:

1. Property context.
2. Linked asset context, optional.
3. Geometry type, with Point, LineString, and Polygon as core forms.
4. Geometry payload in a portable spatial format.
5. Map source.
6. Map confidence.
7. Sync state.

#### 6.1.10 Attachment or Evidence

Purpose: photo, file, or evidence item tied to Service Appointments, findings, or assets.

Minimum fields:

1. Parent entity type and reference.
2. File metadata.
3. Captured timestamp and user.
4. Evidence type tag.

#### 6.1.11 Audit Event

Purpose: immutable event log for key operational actions.

Minimum fields:

1. Entity type and reference.
2. Action.
3. Actor.
4. Timestamp.
5. Detail payload, such as before-and-after summary or reason.

### 6.2 Relationship Rules

1. Each Property has exactly one active System.
2. Point of Connection parent must be System.
3. Pump parent must be Point of Connection.
4. Backflow parent must be Point of Connection.
5. Master Valve parent must be Point of Connection.
6. Flow Sensor parent must be Point of Connection.
7. Controller parent must be Point of Connection.
8. Zone parent must be Controller.
9. Non-root assets must have a valid parent of an allowed type.
10. Zone display name normalizes to Zone N.
11. Zone number must be unique within a Controller.
12. Assets are retired, not hard deleted.
13. Placeholder zones can be created, retired, or skipped when controller capacity changes, and every outcome must be auditable.

## 7. Asset Metadata and Checklist Coverage

### 7.1 Common Metadata

All assets:

1. Name.
2. Asset type.
3. Status.
4. Parent, except System.
5. Install date, optional.
6. Description, optional.
7. Condition state or score, optional unless a workflow requires it.
8. Map linkage or spatial context where mappable.

### 7.2 Type-Specific Metadata

System:

1. Mainline pipe type, optional.
2. Mainline pipe size, optional.
3. Serial number, optional.

Point of Connection:

1. Water source type.
2. Source capacity, optional.

Pump:

1. Operational status, optional.
2. Pressure, optional.
3. Pump type, optional.

Backflow:

1. Backflow type, required at create or edit guard.
2. Serial number, optional.
3. Compliance data such as last test date, last test result, next test due, compliance status, and testing authority.

Master Valve:

1. Operational status, optional.
2. Valve type, optional.
3. Solenoid resistance, optional.

Flow Sensor:

1. Functional status, optional.
2. Sensor model, optional.
3. Flow reading, optional.

Controller:

1. Controller label, required.
2. Total zones, required integer greater than or equal to 1.
3. Make or model, optional.
4. Connectivity type, optional.
5. Smart controller flag, optional.
6. Controller app or platform, optional.

Zone:

1. Zone number, required.
2. Area served, optional.
3. Flow rate, optional.
4. Primary head type, optional.
5. Distribution method, optional.
6. Lateral pipe type or size, optional.
7. Solenoid resistance, optional.
8. Valve type, optional.
9. Station identifier, optional.
10. Station electrical status, optional.

### 7.3 Zone-Linked Component Metadata

These details are modeled as metadata on existing hierarchy assets, not separate hierarchy nodes.

1. Valve type, valve size, and valve location notes.
2. Head type, nozzle, arc, and throw details.
3. Drip emitter profile, spacing, and line notes.
4. Station wire path notes and station electrical status.
5. Drip emitter group details where grouped representation is needed.

### 7.4 Checklist Coverage by Component

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

1. Runtime and condition prompts.
2. Failure prompts for head, nozzle, valve, lateral, and drip conditions.
3. Repair capture and notes.
4. Station wiring fault check.

### 7.5 Zone Sync Rules

When Controller total zones changes:

1. Missing zones from 1..N are auto-created as placeholders.
2. Extra zones greater than N are auto-retired when safe.
3. Extra zones linked to child assets or program references are not auto-retired and must be flagged as skipped.
4. Auto-create, retire, and skipped outcomes must be audit logged.

### 7.6 Create-Time Required Field Rules

Minimum create-time guards:

1. System requires Name.
2. Point of Connection requires Name and parent System.
3. Pump requires Name and parent Point of Connection.
4. Backflow requires Name, Backflow Type, and parent Point of Connection.
5. Master Valve requires Name and parent Point of Connection.
6. Flow Sensor requires Name and parent Point of Connection.
7. Controller requires Name, Controller Label, Total Zones, and parent Point of Connection.
8. Zone requires Zone Number and parent Controller, with display name normalized from the number.

## 8. Functional Requirements

### FR-1 Hierarchy and Asset Management

1. Support System, Point of Connection, Pump, Backflow, Master Valve, Flow Sensor, Controller, and Zone asset types.
2. Enforce parent-child hierarchy rules in create, edit, and render logic.
3. Support retire behavior, not hard delete, for operational assets.
4. Prevent duplicate asset names within active working scope where needed.
5. Prevent duplicate zone numbers per controller.
6. Auto-generate and maintain placeholder zones when controller capacity needs it.
7. Preserve selected asset context across record, map, and checklist workspaces.
8. Support property pivot navigation without losing active context.

### FR-2 Asset Detail and Metadata

1. Support type-specific metadata forms.
2. Persist and edit common metadata such as lifecycle, install date, condition, and spatial source or confidence.
3. Persist and edit controller metadata such as label, zones, make or model, connectivity, smart status, and app or platform.
4. Persist and edit backflow metadata such as type and compliance fields.
5. Persist and edit zone metadata such as zone number, area served, flow, distribution method, piping, solenoid fields, valve details, and station details.
6. Persist and edit zone-linked component metadata for valve, head, drip, and station details.

### FR-3 Checklist Resolution and Output Capture

1. Resolve one published checklist template per Service Appointment using dimensions such as region, service type, and season.
2. Snapshot template version at Service Appointment start so it does not drift mid-appointment by default.
3. Render only applicable checklist sections and questions.
4. Support typed checklist values such as boolean, number, count, text, and select.
5. Persist response timestamps and actor metadata.
6. Allow finding-capable rows to move from unresolved to resolved-on-visit where configured.
7. Support photo attach and remove at asset level.

### FR-4 Turn Responses into Actionable Outputs

1. Generate Service Appointment outputs from checklist responses by asset type.
2. Support informational and actionable outputs.
3. Enforce mutually exclusive no-issues behavior where configured.
4. Maintain appointment-level output counts and summary by asset type.
5. Provide output lists in both global Service Appointment context and asset-detail context.
6. Support output status, owner, severity, quantity, and evidence links.

### FR-5 Submission Rules Without Slowing the Field

1. Support branch-configurable hard blockers for submission.
2. Support branch-configurable soft gates with explicit justification where allowed.
3. Support optional no-change reason code and note capture where configured.
4. Support assignment-based submit eligibility.
5. Support branch-level configuration lifecycle so policy strictness can evolve.
6. On successful submit, move appointment to completed and allow post-submit routing.
7. Keep non-irrigation work items visible, but route them through standard handling instead of irrigation submit flow.

### FR-6 Manage Controller Programs

1. Create, edit, duplicate, toggle active, and delete controller programs.
2. Validate required fields, including program name, at least one schedule day, and at least one start time.
3. Support zone linkage and active or inactive status.
4. Support runtime minutes and seasonal adjustment.
5. Audit create, edit, duplicate, and delete actions.

### FR-7 Work with Map Features in Context

1. Create, edit, and delete Point, LineString, and Polygon features.
2. Link features to assets or leave them unlinked where needed.
3. Preserve property and selected asset context through the workspace contract.
4. Support KML import and export with basic parsing and validation.
5. Enforce feature limits and performance-safe rendering thresholds.
6. Keep map and list behavior aligned around selected asset focus.
7. Support map-driven asset creation and geometry linkage.

### FR-8 See Related Activity and History Clearly

1. Show service visits and appointments with checklist output summaries.
2. Show outputs, optional evidence, and downstream handoff references in related context.
3. Expose an audit timeline for key actions and changes.
4. Show property pivot navigation and previous or next property context where relevant.

### FR-9 Give Managers Clear Operational Visibility

1. Show completion metrics by branch, property, and period.
2. Show output pipeline metrics such as open, aging, by type, by severity, and by owner.
3. Show Service Appointment-to-decision throughput metrics.
4. Show revenue capture metrics, including actionable output value, approved follow-up value, conversion rate, and estimated missed revenue from stale or unresolved outputs.
5. Show data quality metrics such as required completion, evidence coverage, and unresolved placeholders.
6. Keep reporting as a manager surface and avoid adding field completion steps.

## 9. Integration and Handoff Expectations

### 9.1 Context Passing

At minimum, pass:

1. Property identifier.
2. Asset identifier, optional.
3. Service Appointment identifier, optional.
4. Mode, such as field or manager.
5. Selected map context or selected asset context when embedded workspaces are used.

### 9.2 Ownership and Handoff Boundaries

1. The product owns irrigation assets, Service Appointment outcomes, Service Appointment outputs, maintenance records, and map context.
2. The product does not own estimates, contracts, or downstream work records.
3. The product must hand off output status and completion state for downstream use.

### 9.3 Cross-Surface Messaging

Where embedded workspaces exist, such as a map inside a record view:

1. Parent workspace can push asset context to child workspace.
2. Child workspace can return updates and events to parent.
3. Message contracts must be versioned and schema validated.

## 10. Experience and Reliability Requirements

1. Maintain desktop and mobile parity for core workflows.
2. Support offline-capable field work with deferred sync.
3. Support conflict handling and safe merges for delayed writes.
4. Support bulk-safe server operations.
5. Enforce validation on the server side, not UI only.
6. Maintain end-to-end auditability for governance-critical changes.
7. Support configurable policy gates with branch-level evolution.
8. Minimize field friction and protect speed of execution.
9. Preserve working context across tabs and modal transitions.

## 11. Security and Access

1. Support role-based visibility and action permissions.
2. Separate execution authority from approval authority.
3. Control publish authority for checklist templates.
4. Provide audit visibility for compliance and operations stakeholders.
5. Keep customer-safe output separate from internal-only detail.

## 12. Data Quality Controls

1. Validate parent type for all non-root assets.
2. Enforce required metadata checks by asset type.
3. Enforce zone uniqueness and naming normalization checks.
4. Enforce geometry type checks by feature type.
5. Enforce controlled value checks for status and type fields.
6. Enforce downstream handoff linkage checks for actionable outputs where configured.
7. Keep placeholder assets auditable until resolved or retired.

## 13. Migration and Backward Compatibility

1. Support runtime normalization from legacy issue-count or callout formats to checklist output summary.
2. Preserve historical records while projecting normalized summary fields.
3. Maintain idempotent migration behavior at load time.
4. Preserve existing records while introducing newer output and handoff model.

## 14. Open Decisions

1. Final map provider selection, if a third-party map is used.
2. Hard versus soft required-question gating by region or branch.
3. Placeholder asset service-level expectation and ownership.
4. Evidence guidance policy by output type and severity.
5. Final readiness scoring formula and ownership.

## 15. Release Baseline

Release is ready when:

1. Standard hierarchy constraints are enforced in create and edit workflows.
2. Service Appointment runtime resolves and snapshots one published template per appointment.
3. Outputs are generated and summarized by asset type with appointment-level counts.
4. Submission policy supports configured hard blockers, soft-gate justification, and assignment-based eligibility.
5. Controller total-zone sync creates, retires, or skips zones per rules, with audited outcomes.
6. Program CRUD works in controller context with validation, duplicate, toggle active, and delete actions.
7. Map feature CRUD works for point, line, and polygon geometries with basic KML import and export.
8. Related and history views show checklist output summaries, optional evidence, handoff references, and audit trails.
9. Reporting views expose completion, output pipeline, throughput, revenue capture, and data quality metrics.
10. Baseline and trend views quantify missed revenue and conversion improvement over time.
11. Non-irrigation work items stay visible but do not enter irrigation-specific submit flow.

## 16. Traceability to Source Inputs

1. requirements/fsm_irrigation_requirements.md
2. requirements/prdV4.md
3. prototype/desktop/desktop_v3.1.html and prototype/desktop/property_record.js
4. prototype/v4/desktopV4.1.html
5. prototype/v4/mobileV4.1.html
6. prototype/spatial_portable/index.html and prototype/spatial_portable/core/contracts.js
