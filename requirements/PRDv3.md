# Irrigation Salesforce Build PRD v3

Date: 2026-05-21
Status: Draft for execution planning
Owner: FSM Product / Architecture
Primary audience: Product Discovery, Salesforce delivery team, Jira project admins

## 1. Executive Summary

This PRD translates the desktop map prototype and existing repository requirements into a Salesforce implementation plan with explicit OOTB vs custom boundaries, page layout specifications, and Jira-ready execution structure.

The custom LWC suite in this PRD (`Program`, `Spatial`, `Hierarchy`) is explicitly designed for three runtime channels:

1. Lightning Experience desktop.
2. Salesforce Mobile App.
3. Field Service Mobile App.

Delivery strategy selected in discovery:

1. Custom-first UX for map, hierarchy, and program workflows.
2. Salesforce remains system of record, including custom spatial objects for geometry.
3. Reusable LWC architecture: base component + context wrappers (desktop, mobile, standalone).
4. Pilot-first rollout by branch/region with steering-group gates.

## 2. Discovery Decisions (Locked Inputs)

1. Implementation pattern: Custom-first.
2. Geometry system of record: Salesforce custom spatial objects.
3. Program UX: Custom LWC embedded on Asset record.
4. Offline approach: Mobile app dependent.
5. Release strategy: Pilot-first, then scale.
6. Security model: Mixed role + stage restrictions.
7. Map provider: Mapbox GL JS.
8. KML scope: Import + Export in MVP (no full style fidelity).
9. Hierarchy UX: Custom LWC tree/grid.
10. Reuse strategy: Shared base LWC + thin wrappers.
11. OOTB vs custom principle: OOTB platform foundation, custom interaction-heavy UX.
12. Jira detail level: Full MVP detail, post-MVP as outlined backlog.
13. Data access pattern: Mixed LDS/UI API + Apex orchestration.
14. Audit approach: Field History Tracking only.
15. Migration: Phased by branch with rollback plan.
16. Success model: Balanced scorecard (delivery + adoption + outcomes).
17. Governance: Steering group at phase gates.

## 3. Product Discovery High Overview

### 3.1 Problem to Solve

Irrigation operations need one Salesforce-centered operating model that:

1. Maintains canonical irrigation asset hierarchy.
2. Supports geometry-aware map workflows for field and office users.
3. Preserves controller/zone program operational context.
4. Improves inspection-to-callout conversion and accountability.

### 3.2 Target Users

1. Irrigation Manager (primary).
2. Account Manager.
3. Field Technician.
4. Branch Leadership.
5. Salesforce Admin and support roles.

### 3.3 Core Outcomes

1. Faster and more accurate setup and maintenance of irrigation hierarchy.
2. Improved spatial precision and usability in service workflows.
3. Better callout throughput and reduced rework.
4. Scalable reusable UX patterns across desktop, mobile, and standalone contexts.

## 4. Scope Statement

### 4.1 In Scope (MVP)

1. Asset Record experience with custom tabs for Hierarchy, Map, and Program workflows.
2. Custom spatial data model and Mapbox-powered map interactions (point/line/polygon).
3. KML import/export (basic fidelity).
4. Custom controller program workspace LWC.
5. Role + stage edit controls.
6. Pilot rollout and branch-wave migration.

### 4.2 Out of Scope (MVP)

1. Full GIS style fidelity round-trip for KML.
2. Enterprise GIS dual-write architecture.
3. Complete offline conflict engine beyond mobile-platform baseline.
4. Full post-MVP optimization backlog implementation.

## 5. OOTB vs Custom Build Matrix

### 5.1 OOTB Foundation Features and Requirements

| Capability | OOTB Asset | Requirement for Implementation |
|---|---|---|
| Core record model | Standard objects (`Asset`, `WorkOrder`, `WorkOrderLineItem`, `ServiceAppointment`) | Enable Field Service and configure object model, lookups, page assignments, and profiles/permission sets. |
| Record page administration | Lightning App Builder + Dynamic Forms | Build one shared Asset record page with component visibility and Dynamic Forms sections by record type. |
| Record CRUD forms | LDS base components (`lightning-record-form`/`lightning-record-edit-form`) where suitable | Use metadata-driven forms for simple admin/utility surfaces; avoid custom coding for basic record editing where not needed. |
| Related lists and highlights | Standard Highlights, Related Lists, Files | Configure component placement, columns, sort, and quick actions. |
| Field-level auditing | Field History Tracking | Enable tracking on selected business-critical fields for `Asset`, `WorkOrder`, `WorkOrderLineItem`, and `ServiceAppointment`. |
| Mobile/offline runtime baseline | Salesforce mobile and LWC Offline capabilities | Configure app eligibility, data priming strategy, and object access for mobile users. |

### 5.2 Custom Development Features and Requirements

| Capability | Custom Asset | Requirement for Implementation |
|---|---|---|
| Spatial geometry persistence | Custom spatial objects | Implement `Map_Feature__c` model storing geometry payloads (GeoJSON) and metadata; enforce ownership, lifecycle, and relationship to asset/property context. |
| Map interaction UX | Reusable LWC (Mapbox) | Build draw/edit/delete flows for point/line/polygon, map-layer context, and selection behavior aligned to prototype. |
| KML interoperability | LWC + Apex service | Support KML import and export with validation and size/error handling; no guaranteed style fidelity in MVP. |
| Hierarchy UX | Reusable LWC tree/grid | Implement search, expand/collapse, breadcrumb context, and context-aware selection/navigation. |
| Program management UX | Reusable LWC program workspace | Implement create/edit/delete scheduling logic for controller programs and related zone assignments. |
| Cross-record transaction logic | Apex orchestration layer | Use Apex for multi-record transactional operations, bulk actions, and advanced validations not suited for independent LDS transactions. |
| Reuse architecture | Base + wrappers | Create one shared base package for map/hierarchy behavior and wrapper LWCs for desktop record page, mobile shell, and standalone desktop app page. |

## 6. Salesforce Architecture Requirements

### 6.1 Data Model Requirements

1. Continue canonical hierarchy centered on `Asset` object and parent-child relationships.
2. Create custom object `Map_Feature__c` with at minimum:
   - Link to property/account context.
   - Link to asset context where applicable.
   - Feature type (`Point`, `LineString`, `Polygon`).
   - Geometry payload field (long text).
   - Source, confidence, and update metadata fields.
3. Preserve controller program object model (`Irrigation_Program__c`) with zone linkage and schedule metadata.
4. Maintain inspection/callout flow anchored on `ServiceAppointment` and `WorkOrderLineItem`.

### 6.2 Integration and Data Access Requirements

1. Use LDS/UI API for simple single-record reads/writes.
2. Use Apex for:
   - Multi-record atomic operations.
   - Bulk map feature operations.
   - KML parse/validation orchestration.
   - Guardrail rules spanning multiple object types.
3. Ensure all custom services are permission-aware and respect sharing/FLS.

### 6.3 Security and Access Requirements

1. Enforce role-based edit controls by persona.
2. Enforce stage-based edit controls by lifecycle status.
3. Support read-only users for visibility without modification rights.
4. Apply security consistently in both UI affordances and server-side validation.

### 6.4 Audit and Compliance Requirements

1. Implement Field History Tracking only (as selected).
2. Track enough fields to reconstruct critical changes for:
   - Asset hierarchy and status.
   - Program operational parameters.
   - Callout status transitions.
3. Note risk: pure field history does not fully capture non-field user actions (for example import/export intent). Mitigation should be considered as a post-MVP governance enhancement.

## 7. Lightning Page Layout Specification (Implementation Grade)

## 7.1 Record Page Definition

Page name: `Asset Record - Irrigation Unified`
Target object: `Asset`
Form factors: Desktop + Phone
Assignment: all irrigation-related Asset record types
Runtime intent: primary desktop shell plus mobile-compatible wrappers for Salesforce Mobile App and Field Service Mobile App.

### 7.1.1 Top Region Components

1. Highlights Panel (OOTB).
2. Path or status strip (optional, if lifecycle path is enabled).
3. Quick actions row including:
   - New Work Order
   - Log Repair Callout
   - Capture GPS Location
   - Upload Photo

### 7.1.2 Main Body Layout

Recommended: 2-column desktop layout with full-width tab region.

Column A (primary operational context):

1. Dynamic Forms section group: Core Asset Details.
2. Dynamic Forms section group: Hierarchy Context.
3. Custom LWC wrapper: `irrigationHierarchyDesktopWrapper`.

Column B (secondary but high-value context):

1. Custom LWC wrapper: `irrigationMapDesktopWrapper`.
2. Related list single: latest service appointments.
3. Related list single: latest callouts.

Full-width tab set below columns:

1. Details tab (dynamic forms blocks).
2. Hierarchy tab (custom LWC tree/grid).
3. Map tab (custom LWC map workspace).
4. Program tab (custom LWC controller program workspace).
5. Related tab (OOTB related lists).
6. History tab (Field History related components where applicable).

## 7.2 Dynamic Forms Section Specification

Use Dynamic Forms to split sections and apply visibility rules by record type and status.

Required section set:

1. Common Fields (all record types).
2. System Fields.
3. Controller Fields.
4. Zone Fields.
5. Backflow Fields.
6. Valve Fields.
7. Head Fields.
8. Drip Fields.
9. Pump Fields.

Visibility rules:

1. By record type (primary).
2. By stage/status (editability and informational sections).
3. By user profile/permission set where needed.

## 7.3 Component Visibility Rules

1. Program tab and program LWC visible only when Asset type is Controller.
2. Zone-specific controls visible only for Zone and zone-child records where relevant.
3. Map editing controls visible only for users with map edit entitlement and eligible lifecycle stage.
4. Mobile wrapper components visible only on small form factor.

## 7.4 Mobile Page Spec

Phone form factor page (`Small`):

1. Reuse base components via `irrigationMapMobileWrapper` and `irrigationHierarchyMobileWrapper`.
2. Keep map-first visual priority.
3. Restrict high-density admin sections.
4. Preserve critical quick actions and read context.

## 7.5 LWC Metadata and Packaging Requirements

1. All wrapper LWCs exposed for `lightning__RecordPage`.
2. Explicit object targeting to `Asset` and required custom objects.
3. Form factor declarations include `Large` and `Small` where intended.
4. Public properties configured for context mode, edit policy, and feature toggles.

## 7.6 Cross-Channel LWC Deployment Specification

### 7.6.1 Base Components

1. `irrigationHierarchyBase`
2. `irrigationMapBase`
3. `irrigationProgramBase`

These base components contain shared domain logic, validation behavior, and service contracts.

### 7.6.2 Wrapper Components by Channel

Desktop wrappers:

1. `irrigationHierarchyDesktopWrapper`
2. `irrigationMapDesktopWrapper`
3. `irrigationProgramDesktopWrapper`

Salesforce Mobile App wrappers:

1. `irrigationHierarchySfMobileWrapper`
2. `irrigationMapSfMobileWrapper`
3. `irrigationProgramSfMobileWrapper`

Field Service Mobile App wrappers:

1. `irrigationHierarchyFsmMobileWrapper`
2. `irrigationMapFsmMobileWrapper`
3. `irrigationProgramFsmMobileWrapper`

### 7.6.3 Channel Behavior Requirements

1. Desktop wrappers prioritize multi-panel productivity and high-density contextual views.
2. Salesforce Mobile wrappers prioritize compact navigation and touch-first interactions.
3. FSM Mobile wrappers prioritize field workflow continuity, low-connectivity resilience, and technician action flow.
4. All wrappers must consume the same base contract to avoid business-rule drift across channels.
5. Wrapper-only differences are limited to layout, interaction affordances, and channel-specific guardrails.

### 7.6.4 App Builder and Targeting Requirements

1. Expose wrappers with `lightning__RecordPage` support and explicit `supportedFormFactors`.
2. Restrict object targeting to intended objects (`Asset` and required custom objects) via `targetConfig`.
3. Use component visibility rules to assign desktop wrappers to `Large` form factor surfaces and mobile wrappers to `Small` surfaces.
4. Maintain separate page assignments where required for Salesforce Mobile App versus Field Service Mobile App experience design.

## 8. Functional Requirements by Capability

### 8.1 Hierarchy Capability Requirements

1. Tree/grid render of full irrigation hierarchy with expandable nodes.
2. Search by asset name/type and contextual labels.
3. Breadcrumb path for selected node.
4. Fast navigation to related node context.
5. Reusable service and UI contract across desktop/mobile/standalone wrappers.
6. Channel parity requirement: hierarchy behaviors must be functionally equivalent across desktop, Salesforce Mobile App, and Field Service Mobile App, except approved wrapper UX differences.

### 8.2 Map Capability Requirements

1. Mapbox GL JS integration in reusable base component.
2. Geometry operations: create/edit/delete for point/line/polygon.
3. Selection model synchronized with asset context.
4. KML import pipeline with validation and error reporting.
5. KML export pipeline for selected scope.
6. Stage and role-aware edit controls.
7. Mobile-compatible behavior aligned with selected offline strategy.
8. Channel requirement: map workflows must be available on desktop, Salesforce Mobile App, and Field Service Mobile App through channel wrappers.

### 8.3 Program Capability Requirements

1. Controller-scoped program workspace embedded on Asset page.
2. Program CRUD with required fields and schedule constraints.
3. Zone linkage and validation.
4. Active/inactive control and visibility in operational context.
5. Channel requirement: program workflows must run in desktop, Salesforce Mobile App, and Field Service Mobile App with wrapper-appropriate layouts.

### 8.4 Related Operational Data Requirements

1. Service appointments listed in descending completion/schedule relevance.
2. Callouts/proposals surfaced for operational triage.
3. Core callout statuses aligned to existing process model.

### 8.5 Validation and Guardrails Requirements

1. Zone uniqueness by controller.
2. Retire dependency checks (do not allow invalid hierarchy breaks).
3. Parent-child type consistency enforcement.
4. Required-field and lifecycle-state validation by type.

## 9. Non-Functional Requirements

1. Desktop map tab first meaningful paint within acceptable pilot thresholds under typical branch data.
2. Mobile interaction must remain usable under low connectivity conditions consistent with platform mobile/offline configuration.
3. All custom services must support bulk-safe execution patterns.
4. Security enforcement must be server-side authoritative.

## 10. Migration and Cutover Requirements

1. Migration waves are branch-based.
2. Each wave includes:
   - Pre-validation report.
   - Load execution.
   - Post-validation checks.
   - Rollback runbook.
3. No branch moves to production wave without steering-group gate approval.

## 11. Rollout and Governance

### 11.1 Phase Gates (Steering Group)

Gate participants:

1. Product
2. Operations
3. Salesforce Admin/Architect
4. Field leadership

Gate sequence:

1. Design Complete
2. Build Complete
3. UAT Exit
4. Pilot Exit

### 11.2 Success Scorecard

Balanced scorecard categories:

1. Delivery: schedule adherence, defect trends.
2. Adoption: active usage of map/hierarchy/program features.
3. Operational outcomes: throughput, rework reduction, conversion velocity.

## 12. Jira Execution Blueprint

This section is designed to be converted directly into Jira artifacts.

## 12.1 MVP Epics (Full Detail)

### EPIC A: Salesforce Foundation and Data Model

Objective: Stand up OOTB foundation and custom objects for MVP.

Stories:

1. Configure Asset record types and core fields for irrigation taxonomy.
2. Create and secure `Map_Feature__c` and supporting metadata.
3. Configure `Irrigation_Program__c` model and relationships.
4. Configure Field History Tracking scope.

Acceptance highlights:

1. All required fields and lookups deploy and validate.
2. Profiles/permission sets enforce intended object and field access.

### EPIC B: Lightning Page Layout and Dynamic Forms

Objective: Deliver implementation-grade record page behavior.

Stories:

1. Build `Asset Record - Irrigation Unified` Lightning page.
2. Implement Dynamic Forms sections by type.
3. Implement component visibility and form-factor rules.
4. Configure quick actions and related list placements.

Acceptance highlights:

1. Record types display only intended sections.
2. Program and map contexts appear only when rules are met.

### EPIC C: Reusable Hierarchy LWC Platform

Objective: Build reusable hierarchy base and wrappers.

Stories:

1. Build `irrigationHierarchyBase` service and UI core.
2. Build desktop wrapper.
3. Build Salesforce Mobile App wrapper.
4. Build Field Service Mobile App wrapper.
4. Build standalone app wrapper.

Acceptance highlights:

1. Shared behavior is consistent across wrappers.
2. Search/expand/navigation rules pass test scenarios.
3. Channel certification passes for desktop, Salesforce Mobile App, and Field Service Mobile App.

### EPIC D: Reusable Map LWC Platform (Mapbox + KML)

Objective: Build reusable map base and wrappers with MVP map operations.

Stories:

1. Build `irrigationMapBase` Mapbox integration.
2. Implement feature CRUD (point/line/polygon).
3. Implement KML import.
4. Implement KML export.
5. Build desktop wrapper.
6. Build Salesforce Mobile App wrapper.
7. Build Field Service Mobile App wrapper.

Acceptance highlights:

1. Feature edits persist correctly to Salesforce model.
2. KML import/export passes supported test matrix.
3. Channel certification passes for desktop, Salesforce Mobile App, and Field Service Mobile App.

### EPIC E: Controller Program Workspace LWC

Objective: Deliver embedded program operations in Asset context.

Stories:

1. Build `irrigationProgramBase` service and UI core.
2. Build desktop wrapper.
3. Build Salesforce Mobile App wrapper.
4. Build Field Service Mobile App wrapper.
5. Program create/edit/delete flows.
6. Zone assignment and validation.
7. Controller visibility and permission gating.

Acceptance highlights:

1. All required scheduling fields enforce validation.
2. Controller-only visibility works in page context.
3. Channel certification passes for desktop, Salesforce Mobile App, and Field Service Mobile App.

### EPIC H: Cross-Channel QA and Release Certification

Objective: certify parity, usability, and readiness of Program, Spatial, and Hierarchy LWCs across all target channels.

Stories:

1. Build channel-specific test matrix for desktop, Salesforce Mobile App, and Field Service Mobile App.
2. Execute parity tests for hierarchy, map, and program workflows.
3. Execute low-connectivity and reconnect tests in Field Service Mobile App.
4. Document channel-specific known issues and release blockers.

Acceptance highlights:

1. All P0 scenarios pass in all three channels.
2. Any channel-specific deviations are approved by steering group before pilot gate.

### EPIC F: Security, Lifecycle Guardrails, and Validation

Objective: Implement mixed role + stage policy controls.

Stories:

1. Role-based permission model for edit/read.
2. Stage-based editability policy.
3. Server-side guardrail validations for hierarchy/map/program actions.

Acceptance highlights:

1. Unauthorized edits are blocked in UI and API pathways.
2. Guardrails prevent invalid retire/reparent scenarios.

### EPIC G: Migration, Pilot, and Release Governance

Objective: Execute phased branch migration and pilot delivery.

Stories:

1. Build migration mapping and validation scripts.
2. Define wave runbooks and rollback plans.
3. Pilot execution and gate reviews.
4. Scale rollout readiness package.

Acceptance highlights:

1. Pilot branch passes go/no-go thresholds.
2. Rollback runbook validated in rehearsal.

## 12.2 Example Story Template (Ready for Jira)

Title: Build Dynamic Forms sections for Asset record types

Description:

Implement Dynamic Forms sectioning and visibility rules for all irrigation asset record types on the unified Asset page.

Acceptance criteria:

1. System, Controller, Zone, Backflow, Valve, Head, Drip, and Pump sections exist and show only under intended conditions.
2. Required fields and read-only behavior align to lifecycle and permissions.
3. Desktop and mobile render paths validated.

Technical subtasks:

1. Configure field sections in App Builder.
2. Configure visibility expressions.
3. Update metadata in source control.
4. Add deployment notes.

Test subtasks:

1. Manual scenario matrix by record type and profile.
2. Regression on related list visibility.
3. Mobile form-factor verification.

## 12.3 Post-MVP Backlog (Outlined)

1. Enhanced offline sync and conflict handling.
2. Advanced KML style round-trip.
3. Expanded analytics and performance tuning.
4. Optional audit enhancement for non-field action traces.

## 13. Risks and Mitigations

1. Risk: Field History-only audit may not provide full action-intent trace.
   - Mitigation: strict field tracking policy now; evaluate event-level audit extension post-MVP.
2. Risk: Map complexity across form factors.
   - Mitigation: base + wrapper architecture with shared test matrix.
3. Risk: Pilot adoption variance by branch practices.
   - Mitigation: pilot-first governance and wave-based rollout.

## 14. Sources and Evidence

Internal repository sources:

1. prototype/desktop/desktop_prototype_with_map_feature_inventory.md
2. requirements/desktop_map_prototype_prd.md
3. requirements/irrigation_prd_v2.md
4. requirements/map_lwc_v1_implementation_checklist.md
5. research/spatial_mapping_options.md
6. research/asset_record_page_design.md
7. research/automation_flows_design.md
8. requirements/fsm_irrigation_requirements.md
9. requirements/irrigation_data_dictionary.md

Salesforce sources:

1. https://developer.salesforce.com/docs/platform/lwc/guide/data-guidelines.html
2. https://developer.salesforce.com/docs/platform/lwc/guide/data-ui-api.html
3. https://developer.salesforce.com/docs/platform/lwc/guide/apex.html
4. https://developer.salesforce.com/docs/platform/lwc/guide/use-config-for-app-builder.html
5. https://developer.salesforce.com/docs/platform/lwc/guide/targets-lightning-record-page.html
6. https://developer.salesforce.com/docs/platform/lwc/guide/reference-lightning-locationservice.html
7. https://developer.salesforce.com/docs/component-library/bundle/lightning-map/documentation
8. https://developer.salesforce.com/docs/component-library/bundle/lightning-record-form/documentation
9. https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_workorder.htm
10. https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_workorderlineitem.htm
11. https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_serviceappointment.htm
12. https://help.salesforce.com/s/articleView?id=sf.dynamic_forms_overview.htm&type=5
13. https://help.salesforce.com/s/articleView?id=sf.tracking_field_history.htm&type=5
14. https://developer.salesforce.com/docs/atlas.en-us.mobile_offline.meta/mobile_offline/

## 15. Confidence Statement

Overall confidence in this PRD: High for architecture direction and implementation structure, Medium-High for detailed Salesforce feature constraints where source docs are clear, and Medium for areas dependent on org-specific limits/configuration and pilot behavior.

Confidence by major area:

1. OOTB vs custom boundary decisions: High.
2. Record page layout and Dynamic Forms strategy: High.
3. LWC data access pattern (LDS/UI API + Apex mix): High.
4. Field Service object fit (Work Order, WOLI, Service Appointment): High.
5. Mobile/offline behavior in your exact org profile: Medium.
6. Field History-only audit sufficiency for governance needs: Medium-Low (known limitation risk).
