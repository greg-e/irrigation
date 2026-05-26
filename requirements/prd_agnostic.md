# Irrigation Inspection and Asset Operations PRD (Agnostic)

Date: 2026-05-26  
Status: Draft for implementation planning  
Owner: Product / BA  
Source baseline: requirements/prd_v3.1.md, requirements/fsm_irrigation_requirements.md, prototype behaviors in desktop/mobile/spatial artifacts

## 1. Purpose

Define a platform-agnostic product requirement set for irrigation inspection and asset operations. This document intentionally avoids vendor-specific architecture and provides:

1. Domain objects and relationships.
2. Functional requirements and guardrails.
3. Data and workflow requirements derived from current prototypes.
4. Non-functional and reporting requirements for production implementation.

## 2. Problem Statement

Current irrigation operations are fragmented across disconnected tools and ad hoc practices, causing:

1. Missed revenue from findings that are not converted into approved, scoped follow-up work.
2. Inconsistent inspection quality and standards across branches.
3. Weak visibility of unresolved findings and delayed follow-through.
4. Asset hierarchy drift and duplicate/manual re-entry.
5. Spatial context loss between field and office.
6. Low field adoption when data entry burden is high.

## 3. Goals and Outcomes

### 3.1 Business Outcomes

1. Reduce missed revenue by increasing conversion of actionable findings to approved work.
2. Improve inspection completion reliability at property level.
3. Reduce time from visit completion to follow-up decision.
4. Increase finding evidence completeness.
5. Improve consistency and auditability across regions.

### 3.2 User Outcomes

1. Field users can complete visits with clear scope and minimal friction.
2. Office users can triage and route unresolved work with full context.
3. Governance users can maintain content quality and cross-region consistency.

## 4. Scope

### 4.1 In Scope

1. Canonical irrigation hierarchy and lifecycle management.
2. Mobile-first inspection capture with checklist-by-asset-type behavior.
3. Visit findings capture, routing, and follow-up readiness.
4. Spatial authoring and context (point/line/polygon), including KML import/export (basic fidelity).
5. Controller program management.
6. Reporting for completion, findings, throughput, and data quality.
7. Audit history and role-based controls.

### 4.2 Out of Scope (Initial Release)

1. Smart-controller OEM integrations.
2. Enterprise GIS dual-write.
3. Advanced geospatial conflict engine beyond baseline merge/rules.
4. Customer self-service write-back workflows.

## 5. Personas

1. Technician (field execution).
2. Account/Operations Manager (triage and routing).
3. Branch Leadership (performance and accountability).
4. Standards/Governance Owner (content and policy control).
5. Customer-facing stakeholder (read-only history visibility).

## 6. Product Principles

1. Checklist-first inspection capture, not free-form issue capture by default.
2. Canonical hierarchy with strict parent-child rules.
3. Retire instead of hard delete for operational records.
4. Offline-safe field execution with later reconciliation.
5. Platform-agnostic domain model with clean integration boundaries.

## 7. Domain Model (Objects)

## 7.1 Core Objects

### 7.1.1 Property

Purpose: top-level operational site.

Minimum fields:
1. Property ID (system-generated).
2. Name.
3. Region/Branch.
4. Status.
5. Updated timestamp.

### 7.1.2 Asset

Purpose: canonical hierarchy node for irrigation system components.

Minimum fields:
1. Asset ID.
2. Property ID.
3. Asset Type.
4. Name.
5. Status (Active/Retired).
6. Parent Asset ID (nullable only for System).
7. Description.
8. Install Date.
9. Coordinates (optional centroid fields).
10. Is Placeholder (boolean).

Supported canonical types:
1. System.
2. Source.
3. Backflow.
4. Controller.
5. Zone.

Supported optional operational/component types (implementation-configurable):
1. Pump.
2. Valve.
3. Head.
4. Drip.

### 7.1.3 Inspection Visit

Purpose: execution container for one property service event.

Minimum fields:
1. Visit ID.
2. Property ID.
3. Assigned user.
4. Stage/Status.
5. Started/Completed timestamps.
6. Question Set Version snapshot reference.
7. Follow-up owner assignment.
8. Zero-touch reason code/note (when no asset updates occur).

### 7.1.4 Checklist Template

Purpose: versioned question/checklist definition catalog.

Minimum fields:
1. Template ID.
2. Version.
3. Effective status (Draft/Published/Archived).
4. Resolver dimensions (Region, Inspection Type, Season).
5. Asset-type applicability.
6. Question definitions and conditional logic.

### 7.1.5 Checklist Response

Purpose: per-visit captured responses linked to relevant assets.

Minimum fields:
1. Response ID.
2. Visit ID.
3. Asset ID (nullable when visit-scoped only).
4. Template Question ID.
5. Value (typed).
6. Updated timestamp.
7. Updated by.

### 7.1.6 Finding

Purpose: actionable or informational result derived from checklist responses.

Minimum fields:
1. Finding ID.
2. Visit ID.
3. Asset ID.
4. Finding category/type.
5. Severity/priority.
6. Quantity (when applicable).
7. Status/disposition.
8. Owner.
9. Evidence links.

Also required:
1. Aggregated summary by asset type at visit level.
2. Total finding count.
3. Human-readable summary string.

### 7.1.7 Work Item (Follow-up Execution)

Purpose: downstream execution unit for approved/actioned findings.

Minimum fields:
1. Work Item ID.
2. Source Finding ID(s).
3. Type/category.
4. Quantity.
5. Status.
6. Assignee/owner.
7. Target dates.

### 7.1.8 Program Schedule

Purpose: controller-specific runtime schedule and zone linkage.

Minimum fields:
1. Program ID.
2. Controller Asset ID.
3. Program Name.
4. Linked Zone Asset ID (optional).
5. Days of week.
6. Start time.
7. Run time (minutes).
8. Seasonal adjustment (%).
9. Active flag.

### 7.1.9 Spatial Feature

Purpose: geometry and map metadata linked to property/assets.

Minimum fields:
1. Feature ID.
2. Property ID.
3. Linked Asset ID (optional).
4. Geometry Type (Point, LineString, Polygon).
5. Geometry payload (GeoJSON).
6. Spatial source.
7. Spatial confidence.
8. Sync state.

### 7.1.10 Attachment / Evidence

Purpose: photo/file/evidence artifact for visits/findings/assets.

Minimum fields:
1. Attachment ID.
2. Parent entity type/id.
3. File metadata.
4. Captured timestamp/user.
5. Evidence type tag.

### 7.1.11 Audit Event

Purpose: immutable event log for key operational actions.

Minimum fields:
1. Event ID.
2. Entity type/id.
3. Action.
4. Actor.
5. Timestamp.
6. Detail payload (before/after summary or reason).

## 7.2 Relationship Rules

1. Each Property has exactly one active System.
2. Source parent must be System.
3. Backflow parent must be Source.
4. Controller parent must be Backflow.
5. Zone parent must be Controller.
6. Non-root assets require valid parent of allowed type.
7. Zone display name normalizes to "Zone <number>".
8. Zone number must be unique within a Controller scope.
9. Assets are retired, not hard deleted.

## 8. Metadata Requirements by Asset Type

## 8.1 Common Metadata

All assets:
1. Name.
2. Asset Type.
3. Status.
4. Parent (except System).
5. Install Date (optional).
6. Description (optional).

## 8.2 Type-Specific Metadata

System:
1. Mainline Pipe Type (optional).
2. Mainline Pipe Size (optional).
3. Serial Number (optional).

Source:
1. Water Source Type.
2. Source Capacity (optional).

Backflow:
1. Backflow Type (required at create/edit guard).
2. Serial Number (optional).
3. Test/compliance fields (last test date/result, next test due, compliance status, testing authority).

Controller:
1. Controller Label (required).
2. Total Zones (required integer >= 1).
3. Make/Model (optional).
4. Connectivity Type (optional).
5. Smart Controller flag (optional).
6. Controller App/Platform (optional).

Zone:
1. Zone Number (required).
2. Area Served (optional).
3. Flow Rate (optional).
4. Primary Head Type (optional).
5. Distribution Method (optional).
6. Lateral Pipe Type/Size (optional).
7. Solenoid Resistance (optional).

## 8.3 Prototype-Derived Zone Sync Rules

When Controller Total Zones changes:

1. Missing zones from 1..N are auto-created as placeholders.
2. Excess zones > N are auto-retired when safe.
3. Excess zones linked to child assets or program references are not auto-retired and must be flagged as skipped.
4. Auto-create/retire/skipped outcomes must be audit logged.

## 9. Functional Requirements

## FR-1 Inspection Runtime and Resolver

1. Resolve one published checklist template per visit using Region + Inspection Type + Season.
2. Snapshot template version at visit start (no mid-visit drift by default policy).
3. Render only applicable checklist sections/questions.
4. Support typed checklist values (boolean, number, count, text, select).
5. Persist response timestamps and actor metadata.

## FR-2 Checklist Findings

1. Generate findings from checklist responses by asset type.
2. Support informational and actionable findings.
3. Enforce mutually exclusive "No issues" behavior where configured.
4. Maintain visit-level aggregate finding counts and summary by asset type.
5. Provide findings list in both global (visit) and asset-detail context.

## FR-3 Submit and Completion Policy

Hard blockers:
1. Follow-up owner assignment is required.
2. Required completion policy rules configured as hard gates must pass.

Soft gates:
1. Required-question deficits may proceed with explicit justification where policy allows.

Conditional policy:
1. If no asset changes occurred, require reason code and note before submit.

## FR-4 Asset and Hierarchy Management

1. Create/edit/retire assets with type-aware field guards.
2. Enforce parent/child consistency constraints.
3. Enforce uniqueness constraints (for example zone number per controller).
4. Support placeholder assets with explicit resolution workflow.
5. Keep selected asset context synchronized across views.

## FR-5 Controller Program Management

1. CRUD for controller programs.
2. Validate required fields (program name minimum).
3. Support zone linkage and active/inactive state.
4. Support schedule days, start time, runtime minutes, seasonal adjustment.
5. Audit create/edit/delete actions.

## FR-6 Spatial Workflows

1. CRUD for Point/LineString/Polygon features.
2. Link features to assets or leave unlinked where needed.
3. Preserve property and selected asset context via URL/query context contract.
4. Support KML export and import with basic parsing/validation.
5. Enforce feature limits and performance-safe rendering thresholds.
6. Maintain map/list hybrid behavior with selected-asset focus.

## FR-7 Related and History Views

1. Display service visits/appointments with checklist findings summaries.
2. Display findings, proposals/work items, and evidence in related context.
3. Expose audit timeline for key actions and changes.

## FR-8 Reporting and Accountability

1. Completion metrics by branch, property, period.
2. Findings pipeline metrics (open, aging, by type/severity/owner).
3. Visit-to-decision throughput metrics.
4. Revenue capture metrics, including at minimum:
1. actionable findings value,
2. approved follow-up value,
3. conversion rate from findings to approved work,
4. estimated missed revenue from stale/unresolved actionable findings.
5. Data quality metrics (required completion, evidence coverage, unresolved placeholders).

## 10. Integration and Event Contracts

## 10.1 Context Contract

System must support context passing at minimum for:
1. Property ID.
2. Asset ID (optional).
3. Visit/Work Order ID (optional).
4. Mode (for example field/manager).

## 10.2 Cross-Surface Messaging

Where embedded surfaces exist (for example map in record view):
1. Parent can push asset context to child surface.
2. Child can return updates/events to parent.
3. Message contracts must be versioned and schema-validated.

## 11. Non-Functional Requirements

1. Mobile and desktop parity for core workflows.
2. Offline-capable field workflow with deferred sync.
3. Conflict handling and safe merges for delayed writes.
4. Bulk-safe server operations.
5. Data validation enforced server-side, not UI-only.
6. End-to-end auditability for governance-critical changes.
7. Configurable policy gates (hard vs soft).

## 12. Security and Access

1. Role-based visibility and action permissions.
2. Separation of execution vs approval authority.
3. Controlled publish authority for checklist templates.
4. Audit visibility for compliance and operations stakeholders.

## 13. Data Quality Controls

1. Parent type validation for all non-root assets.
2. Type-specific required metadata checks.
3. Zone uniqueness and naming normalization checks.
4. Geometry type checks by feature type.
5. Controlled domain checks for status/type fields.
6. Follow-up linkage checks for actionable findings.

## 14. Migration and Backward Compatibility

1. Support runtime normalization from legacy issue-count/callout representations to checklist findings summary.
2. Preserve historical records while projecting normalized summary fields.
3. Maintain idempotent migration behavior at load time.

## 15. Open Decisions

1. Final mapping provider selection (if third-party map is used).
2. Hard vs soft required-question gate policy by region.
3. Placeholder asset SLA and ownership model.
4. Evidence minimum policy by finding type and severity.

## 16. Acceptance Criteria (Release Baseline)

1. Canonical hierarchy constraints are enforced in create/edit workflows.
2. Inspection runtime resolves and snapshots one published template per visit.
3. Findings are generated and summarized by asset type with visit-level counts.
4. Submit policy enforces hard blockers and supports configured soft-gate justification.
5. Controller Total Zones sync creates/retire/skips zones per rules and audits the outcomes.
6. Program CRUD works for controller context with validation and zone linkage.
7. Spatial feature CRUD works for point/line/polygon and supports basic KML import/export.
8. Related/history surfaces show checklist findings summaries and audit trails.
9. Reporting endpoints/datasets expose completion, findings pipeline, throughput, revenue-capture, and data-quality metrics.
10. Baseline and trend views quantify missed revenue and conversion improvement over time.

## 17. Traceability to Source Inputs

1. requirements/prd_v3.1.md
2. requirements/fsm_irrigation_requirements.md
3. prototype/desktop/desktop_v3.1.html + prototype/desktop/property_record.js
4. prototype/mobile/mobile_v3.1.html
5. prototype/spatial_portable/index.html + prototype/spatial_portable/core/contracts.js
