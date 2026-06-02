# Irrigation Service Appointment and Asset Operations PRD (Agnostic)

Date: 2026-05-26  

## 1. Problem Statement

Current irrigation operations are fragmented across disconnected tools and ad hoc practices, causing:

1. Missed revenue from findings that are not converted into approved, scoped follow-up work.
2. Lack of standardized, easy-to-document inspection workflows across branches.
3. Weak visibility of unresolved inspection outcomes and delayed follow-through.
4. Duplicate/manual re-entry of Irrigation System Assets including Maps.

## 1.1 Discovery Observations

1. Current irrigation execution is branch-specific and fragmented, with teams using spread sheets, paper forms, SAAS Applications, and Manufacturer apps.
2. Standardized reporting exists in pockets, but local variation still drives different ways of capturing notes, photos, and follow-up details.
3. Emergency and ad hoc work are handled through manual coordination, with account managers and field service coordinators/dispatch filling in the gaps outside the system.
4. Scheduling is hard to keep current because irrigation work changes quickly, so branches want a single view of upcoming work and an easier way to rebucket jobs.
5. Customer-facing access is uneven because BrightView Connect is useful where enabled, but not every account has it turned on today and is missing a direct approval flow.

## 1.2 Minimal path to awesome... how this can become the defacto Tool-of-Choice

Standards are only as strong as the process that makes them easy to follow, visible when missed, and recoverable when corrected.

1. No bottlenecks: default to soft warnings over hard stops unless compliance requires blocking.
2. Minimal required path: require only the data needed for immediate actionability.
3. Inline recovery: if required system setup is missing, create it inline in seconds.
4. Actionability over completeness: capture enough to act now and enrich later if needed.
5. Non-blocking governance: use traceability and follow-up queues instead of approvals in live flow.
6. Field-first reliability: full offline minimum-path capture is mandatory.
7. Handoff-first defaults: AM first view should be prioritized action lists, not full record detail.
8. Customer-safe output: default communication excludes internal-only content.
9. Traceability without friction: edits and sync exceptions are visible and recoverable.

## 2. What the Product Needs to Do

The product needs to bring together three connected capabilities:

1. A system of record for irrigation assets, service appointment outcomes, service appointment outputs, and maintenance records.
2. A map-based representation of that system, including asset location and related map geometry.
3. Field interaction with both the operational system and its map representation for assessment and maintenance workflows.

### 2.1 Keep the Operational Record Straight

Teams need a system of record that lets them:

1. Maintain a Standard irrigation hierarchy and lifecycle.
2. Capture service outcomes in a mobile-first, checklist-by-asset-type flow.
3. Record Service Appointment outcomes, generate outputs, and prepare clean downstream handoffs.
4. Manage controller programs.
5. Review reporting on completion, service appointment outputs, throughput, and data quality.
6. Apply audit history and role-based controls.

### 2.2 Keep Map Context Visible and Usable

Teams need a mapping layer that lets them:

1. Create and use point, line, and polygon features in context.
2. See property- and asset-level location data.
3. Import and export KML.
4. Keep map features linked to the Standard asset structure.

### 2.3 Support Field Assessment and Maintenance Work

Field users need to be able to:

1. Work in a mobile-first flow with low data-entry burden.
2. Interact with both asset records and mapped geometry during assessment.
3. Capture service appointment outputs and recommended follow-up actions from the field, with optional evidence.
4. Work offline and reconcile later.
5. Update assets and map context during or after a Service Appointment.

## 3. Goals and Outcomes

### 3.1 Business Outcomes

1. Reduce missed revenue by increasing conversion of actionable service appointment outputs to approved work.
2. Improve Service Appointment output reliability at the property level.
3. Reduce time from Service Appointment outcome to downstream decision.
4. Increase service appointment output evidence completeness.
5. Improve consistency and auditability across regions.

### 3.2 User Outcomes

1. Field users can complete Service Appointment work with clear scope and minimal friction.
2. Office users can triage and route unresolved work with full context.
3. Governance users can maintain content quality and cross-region consistency.

## 4. Personas

1. Technician (field execution).
2. Account/Operations Manager (triage and routing).
3. Branch Leadership (performance and accountability).
4. Standards/Governance Owner (content and policy control).
5. Customer-facing stakeholder (read-only history visibility).

## 5. Experience Principles

1. Default to checklist-first Service Appointment outcome capture rather than free-form issue capture.
2. Standard hierarchy with strict parent-child rules.
3. Retire instead of hard delete for operational records.
4. Offline-safe field execution with later reconciliation.
5. Platform-agnostic domain model with clean integration boundaries.

## 6. Core Records and Structures

### 6.1 Core Objects

Note: platform-managed fields such as record IDs, created/updated timestamps, and audit metadata are assumed where needed and are listed only when the business process depends on them.

#### 6.1.1 Property

**Purpose:** the top-level operational site.

**Minimum fields:**
1. Name.
2. Region/Branch.
3. Status.

#### 6.1.2 Asset

**Purpose:** the Standard hierarchy node for irrigation components.

**Minimum fields:**
1. Property context.
2. Asset Type.
3. Name.
4. Status (Active/Retired).
5. Parent asset (nullable only for System).
6. Description.
7. Install Date.
8. Coordinates (optional centroid fields).
9. Is Placeholder (boolean).

**Supported Standard types:**
1. System.
2. Point of Connection.
3. Pump.
4. Backflow.
5. Master Valve.
6. Flow Sensor.
7. Controller.
8. Zone.

**Supported optional operational/component metadata** (implementation-configurable), captured in the parent asset context rather than as standalone assets:
1. Valve.
2. Head.
3. Drip.
4. Station details.

#### 6.1.3 Service Appointment

**Purpose:** the record that holds a field service event and its outcomes.

**Minimum fields:**
1. Property context.
2. Service Type.
3. Assigned user.
4. Stage/Status.
5. Started/Completed timestamps.
6. Checklist Template Version snapshot reference.
7. Outcome summary payload.
8. Zero-touch reason code/note (when no asset updates occur).

#### 6.1.4 Checklist Template

**Purpose:** the versioned checklist catalog used to drive field execution.

**Minimum fields:**
1. Version.
2. Effective status (Draft/Published/Archived).
3. Resolver dimensions (Region, Inspection Type, Season).
4. Asset-type applicability.
5. Question definitions and conditional logic.

#### 6.1.5 Checklist Response

**Purpose:** the responses captured during a Service Appointment and linked to relevant assets.

**Minimum fields:**
1. Service Appointment context.
2. Asset context (nullable when appointment-scoped only).
3. Template question reference.
4. Value (typed).
5. Updated timestamp.
6. Updated by.

#### 6.1.6 Service Appointment Output

**Purpose:** the concrete inspection result captured during a Service Appointment that must be tracked, summarized, and handed off for follow-up work, reporting, or customer communication.

**Minimum fields:**
1. Service Appointment context.
2. Asset context.
3. Output category/type.
4. Severity/priority.
5. Quantity (when applicable).
6. Status/disposition.
7. Owner.
8. Evidence links.

**Also required:**
1. A Service Appointment-level summary of all outputs by asset type.
2. A total output count for the appointment.
3. A plain-language summary that explains what was found and what needs to happen next.

Use this record when a checklist response becomes something the branch must act on or explain to the customer. It connects the raw inspection answer to the follow-up work, proposal, or report that follows.

#### 6.1.7 Service Appointment Handoff

**Purpose:** the handoff payload created when Service Appointment outputs are ready for downstream processes.

**Minimum fields:**
1. Service Appointment context.
2. Source Output reference(s) (optional).
3. Output status (for example Completed/Submitted).
4. Emitted timestamp.
5. Destination process reference (optional).
6. Payload summary.

#### 6.1.8 Program Schedule

**Purpose:** the controller-specific runtime schedule and zone linkage.

**Minimum fields:**
1. Controller context.
2. Program Name.
3. Linked Zone context (optional).
4. Days of week.
5. Start time.
6. Run time (minutes).
7. Seasonal adjustment (%).
8. Active flag.

#### 6.1.9 Map Feature

**Purpose:** the geometry and map metadata linked to properties and assets.

**Minimum fields:**
1. Property context.
2. Linked asset context (optional).
3. Geometry Type (Point, LineString, Polygon).
4. Geometry payload (GeoJSON).
5. Map source.
6. Map confidence.
7. Sync state.

#### 6.1.10 Attachment / Evidence

**Purpose:** the photo, file, or evidence artifact tied to Service Appointments, findings, or assets.

**Minimum fields:**
1. Parent entity type/reference.
2. File metadata.
3. Captured timestamp/user.
4. Evidence type tag.

#### 6.1.11 Audit Event

**Purpose:** the immutable event log for key operational actions.

**Minimum fields:**
1. Entity type/reference.
2. Action.
3. Actor.
4. Timestamp.
5. Detail payload (before/after summary or reason).

### 6.2 Relationship Rules

1. Each Property has exactly one active System.
2. Point of Connection parent must be System.
3. Pump parent must be Point of Connection.
4. Backflow parent must be Point of Connection.
5. Master Valve parent must be Point of Connection.
6. Flow Sensor parent must be Point of Connection.
7. Controller parent must be Point of Connection.
8. Zone parent must be Controller.
9. Non-root assets require valid parent of allowed type.
10. Zone display name normalizes to "Zone N".
11. Zone number must be unique within a Controller scope.
12. Assets are retired, not hard deleted.

## 7. What Needs to Be Captured by Asset Type

### 7.1 Common Metadata

**All assets:**
1. Name.
2. Asset Type.
3. Status.
4. Parent (except System).
5. Install Date (optional).
6. Description (optional).

### 7.2 Type-Specific Metadata

**System:**
1. Mainline Pipe Type (optional).
2. Mainline Pipe Size (optional).
3. Serial Number (optional).

**Point of Connection:**
1. Water Source Type.
2. Source Capacity (optional).

**Pump:**
1. Operational Status (optional).
2. Pressure (PSI) (optional).
3. Pump Type (optional).

**Backflow:**
1. Backflow Type (required at create/edit guard).
2. Serial Number (optional).
3. Test/compliance fields (last test date/result, next test due, compliance status, testing authority).

**Master Valve:**
1. Operational Status (optional).
2. Valve Type (optional).
3. Solenoid Resistance (optional).

**Flow Sensor:**
1. Functional Status (optional).
2. Sensor Model (optional).
3. Flow Reading (GPM) (optional).

**Controller:**
1. Controller Label (required).
2. Total Zones (required integer >= 1).
3. Make/Model (optional).
4. Connectivity Type (optional).
5. Smart Controller flag (optional).
6. Controller App/Platform (optional).

**Zone:**
1. Zone Number (required).
2. Area Served (optional).
3. Flow Rate (optional).
4. Primary Head Type (optional).
5. Distribution Method (optional).
6. Lateral Pipe Type/Size (optional).
7. Solenoid Resistance (optional).
8. Valve Type (optional).
9. Station Identifier (optional).
10. Station Electrical Status (optional).

### 7.3 Checklist Coverage by Component

**System:**
1. Mainline leak visibility.
2. Mainline pressure stability.
3. Isolation valve condition.
4. Quick-coupler valve condition (where applicable).

**Point of Connection:**
1. Water restrictions in place.
2. Restriction details when applicable.

**Pump:**
1. Pump operational state (conditional when present).
2. Pump pressure reading.
3. Abnormal cycling/noise check.

**Backflow:**
1. Visible damage and leak checks.
2. Test-required and test-passed branching.
3. Certificate upload when testing is performed.

**Master Valve:**
1. Operational check (conditional when present).
2. Leak/seepage check.
3. Manual-override serviceability check.

**Flow Sensor:**
1. Installed/connected check (conditional when present).
2. Reading plausibility check.
3. Fault/alarm state check.

**Controller:**
1. Power/sensor/state checks.
2. Program compliance and adjustment capture.
3. Winterization branch where applicable.

**Zone:**
1. Runtime and condition prompts.
2. Failure prompts for head/nozzle/valve/lateral/drip conditions.
3. Repair capture and notes.
4. Station wiring fault check.

### 7.4 Zone Sync Rules

**When Controller Total Zones changes:**

1. Missing zones from 1..N are auto-created as placeholders.
2. Excess zones > N are auto-retired when safe.
3. Excess zones linked to child assets or program references are not auto-retired and must be flagged as skipped.
4. Auto-create/retire/skipped outcomes must be audit logged.

## 8. What Users and Teams Need to Be Able to Do

### FR-1 Run the Right Checklist at the Right Time

1. Resolve one published checklist template per Service Appointment using Region + Service Type + Season.
2. Snapshot template version at Service Appointment start (no mid-appointment drift by default policy).
3. Render only applicable checklist sections/questions.
4. Support typed checklist values (boolean, number, count, text, select).
5. Persist response timestamps and actor metadata.

### FR-2 Turn Checklist Responses into Actionable Outputs

1. Generate service appointment outputs from checklist responses by asset type.
2. Support informational and actionable outputs.
3. Enforce mutually exclusive "No issues" behavior where configured.
4. Maintain Service Appointment-level aggregate output counts and summary by asset type.
5. Provide output list in both global (Service Appointment) and asset-detail context.

### FR-3 Apply Submission Rules Without Slowing the Field

1. Support branch-configurable hard blockers for outcome submission.
2. Support branch-configurable soft gates with explicit justification where allowed.
3. Support optional no-change reason code/note capture where configured.
4. Support branch-level configuration lifecycle so policy strictness can mature over time.

### FR-4 Maintain the Asset Hierarchy Cleanly

1. Create, edit, and retire assets with type-aware field guards.
2. Enforce parent/child consistency constraints.
3. Enforce uniqueness constraints (for example zone number per controller).
4. Support placeholder assets with explicit resolution workflow.
5. Keep selected asset context synchronized across views.

### FR-5 Manage Controller Programs

1. Create, edit, and delete controller programs.
2. Validate required fields (program name minimum).
3. Support zone linkage and active/inactive state.
4. Support schedule days, start time, runtime minutes, seasonal adjustment.
5. Audit create/edit/delete actions.

### FR-6 Work with Map Features in Context

1. Create, edit, and delete Point, LineString, and Polygon features.
2. Link features to assets or leave unlinked where needed.
3. Preserve property and selected asset context through the URL/query context contract.
4. Support KML export and import with basic parsing/validation.
5. Enforce feature limits and performance-safe rendering thresholds.
6. Maintain map/list hybrid behavior with selected-asset focus.

### FR-7 See Related Activity and History Clearly

1. Display service visits and appointments with checklist output summaries.
2. Display outputs, optional evidence, and downstream handoff references in related context.
3. Expose audit timeline for key actions and changes.

### FR-8 Give Managers Clear Operational Visibility

1. Completion metrics by branch, property, period.
2. Service appointment output pipeline metrics (open, aging, by type/severity/owner).
3. Service Appointment-to-decision throughput metrics.
4. Revenue capture metrics, including at minimum:
   - actionable output value,
   - approved follow-up value,
   - conversion rate from outputs to approved work,
   - estimated missed revenue from stale or unresolved actionable outputs.
5. Data quality metrics (required completion, evidence coverage, unresolved placeholders).
6. Reporting is a management surface and must not introduce additional field completion steps.

## 9. Integration and Handoff Expectations

### 9.1 Context Passing

At a minimum, the product needs to pass:
1. Property ID.
2. Asset ID (optional).
3. Service Appointment ID (optional).
4. Mode (for example field/manager).

### 9.2 Ownership and Handoff Boundaries

1. Product owns irrigation assets, Service Appointment outcomes, service appointment outputs, maintenance records, and map context.
2. Product does not own estimates, contracts, or downstream work records.
3. Product must support handoff of Service Appointment output/completion status for downstream consumption.

### 9.3 Cross-Surface Messaging

Where embedded surfaces exist, such as a map inside a record view:
1. Parent can push asset context to child surface.
2. Child can return updates/events to parent.
3. Message contracts must be versioned and schema-validated.

## 10. Experience and Reliability Requirements

1. Mobile and desktop parity for core workflows.
2. Offline-capable field workflow with deferred sync.
3. Conflict handling and safe merges for delayed writes.
4. Bulk-safe server operations.
5. Data validation enforced server-side, not UI-only.
6. End-to-end auditability for governance-critical changes.
7. Configurable policy gates (hard vs soft) with branch-level evolution over time.
8. Field interaction flow must minimize friction and protect speed of execution.

## 11. Security and Access

1. Role-based visibility and action permissions.
2. Separation of execution vs approval authority.
3. Controlled publish authority for checklist templates.
4. Audit visibility for compliance and operations stakeholders.

## 12. Data Quality Controls

1. Parent type validation for all non-root assets.
2. Type-specific required metadata checks.
3. Zone uniqueness and naming normalization checks.
4. Geometry type checks by feature type.
5. Controlled domain checks for status/type fields.
6. Downstream handoff linkage checks for actionable outputs where configured.

## 13. Migration and Backward Compatibility

1. Support runtime normalization from legacy issue-count/callout representations to checklist output summary.
2. Preserve historical records while projecting normalized summary fields.
3. Maintain idempotent migration behavior at load time.

## 14. Open Decisions

1. Final mapping provider selection (if third-party map is used).
2. Hard vs soft required-question gate policy by region.
3. Placeholder asset SLA and ownership model.
4. Evidence guidance policy by output type and severity (optional vs recommended).

## 15. Release Baseline

The release is ready when:

1. Standard hierarchy constraints are enforced in create/edit workflows.
2. Service Appointment runtime resolves and snapshots one published template per appointment.
3. Outputs are generated and summarized by asset type with Service Appointment-level counts.
4. Submission policy supports configured hard blockers and soft-gate justification by branch.
5. Controller Total Zones sync creates/retire/skips zones per rules and audits the outcomes.
6. Program CRUD works for controller context with validation and zone linkage.
7. Map feature CRUD works for point/line/polygon and supports basic KML import/export.
8. Related/history surfaces show checklist output summaries, optional evidence, handoff references, and audit trails.
9. Reporting endpoints/datasets expose completion, output pipeline, throughput, revenue-capture, and data-quality metrics.
10. Baseline and trend views quantify missed revenue and conversion improvement over time.

## 16. Traceability to Source Inputs

1. requirements/prd_v3.1.md
2. requirements/fsm_irrigation_requirements.md
3. prototype/desktop/desktop_v3.1.html + prototype/desktop/property_record.js
4. prototype/mobile/mobile_v3.1.html
5. prototype/spatial_portable/index.html + prototype/spatial_portable/core/contracts.js

