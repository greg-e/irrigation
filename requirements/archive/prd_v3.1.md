# Irrigation Inspection and Asset Management PRD v3.1

Date: 2026-05-22
Status: Consolidated draft for build execution
Owner: FSM Product / Architecture
Supersedes: requirements/fsm_irrigation_requirements.md, requirements/map_lwc_responsive_v1_first_pass.md, requirements/decision_log.md (authoritative decision lineage)

## 1. Executive Summary

This document merges prior PRD versions into a single implementation baseline for irrigation inspection, asset hierarchy management, Map workflows, and controller program operations in Salesforce.

Governance note: if this PRD conflicts with `requirements/decision_log.md`, the decision log is authoritative.

The strategy is intentionally hybrid:

1. Use OOTB Salesforce FSM as the operational foundation and system of record.
2. Use focused custom LWCs for interaction-heavy experiences (inspection runtime, map, hierarchy, program workspace, checkout review).
3. Roll out pilot-first and scale by branch waves with governance gates.

## 2. Problem Statement

Current operations rely on disconnected tools (Excel, iAuditor, slides/PDF maps, email threads), creating:

1. Revenue leakage from delayed or incomplete follow-through on checklist findings.
2. Weak property-level completion accountability.
3. Manual map artifact bottlenecks.
4. Lack of standardized, easy-to-document inspection workflows across branches, driving both inconsistency and low field adoption.

## 2.1 Tool-of-Choice Dimensions

The inspection and asset workflow should be shaped by these dimensions:

Standards are only as strong as the process that makes them easy to follow, visible when missed, and recoverable when corrected.

1. No bottlenecks: default to soft warnings over hard stops unless compliance requires blocking.
2. Minimal required path: require only the data needed for immediate actionability.
3. Inline recovery: if required setup is missing, create it inline in seconds.
4. Actionability over completeness: capture enough to act now and enrich later when safe.
5. Non-blocking governance: use traceability and follow-up queues instead of approvals in live flow.
6. Risk-weighted rigor: deeper mandatory detail only for safety-critical findings.
7. Field-first reliability: full offline minimum-path capture is mandatory.
8. Handoff-first defaults: AM first view should be prioritized action lists, not full record detail.
9. Customer-safe output: default communication excludes internal-only content.
10. Traceability without friction: edits and sync exceptions are visible and recoverable.

## 3. Personas and Jobs to Be Done

1. Irrigation Technician: complete relevant inspections quickly with offline-safe capture, evidence, and minimal complexity.
2. Account Manager: triage checklist findings with clear severity, category, and evidence context.
3. Branch Leadership: monitor completion, pipeline, and conversion velocity.
4. Irrigation Standards Owner: govern a national question library with controlled regional deltas.
5. Customer/Property Manager: access living inspection history and evidence without manager mediation.

## 4. Scope

### 4.1 In Scope (MVP / R1)

1. Unified Asset record experience with Details, Map, Hierarchy, Related, Program tabs.
2. OOTB Asset-centered hierarchy and readiness workflows.
3. Question library and question-set resolver by Region + Inspection Type + Season.
4. FSM mobile inspection runtime with conditional rendering, offline sync, and required-answer checkout gate.
5. Asset-type inspection checklist capture with standardized finding categories and evidence support.
6. AM queue and conversion flow on standard records.
7. Map workflows with `Map_Feature__c` GeoJSON persistence.
8. MVP map provider candidate set for rendering/editing: Mapbox GL JS and Google Maps JavaScript API.
9. KML import/export in MVP (basic fidelity only).
10. Controller program management workspace.
11. Core dashboards for completion, checklist findings, and downstream follow-through.

### 4.2 Out of Scope (MVP)

1. ArcGIS and enterprise GIS dual-write.
2. Full KML style round-trip fidelity.
3. Advanced offline conflict engine beyond platform baseline.
4. Smart-controller vendor integrations.
5. Customer write-back request intake.

## 5. Product and Architecture Baseline

1. Salesforce is the system of record for hierarchy, inspection checklist findings, and map metadata.
2. OOTB `Asset` object is the Standard irrigation hierarchy container.
3. `ServiceAppointment` is the inspection runtime container.
4. Inspection responses are stored in child records, not on SA fields.
5. `Map_Feature__c` stores geometry (GeoJSON) and map metadata.
6. MVP map provider remains open between Mapbox GL JS and Google Maps JavaScript API until the mapping decision gate is closed.
7. Question library is append-only for published versions.
8. Build pattern is OOTB foundation with custom-first UX for high-interaction surfaces.
9. Reuse pattern is base LWC + channel-specific wrappers (desktop, Salesforce Mobile, FSM Mobile).
10. Rollout strategy is pilot-first with steering-group phase gates.

## 6. OOTB vs Custom Delivery Boundary

### 6.1 OOTB Foundation

1. Core objects: `Asset`, `WorkOrder`, `WorkOrderLineItem`, `ServiceAppointment`.
2. Scheduling/dispatch through FSM capabilities.
3. Files/photos via Salesforce Files.
4. AM queueing through list views, statuses, and record pages.
5. Dynamic Forms, Lightning App Builder, related lists, quick actions.
6. Field History Tracking (selected critical fields).
7. Reporting via Salesforce reports and analytics layer.

### 6.2 Required Custom Surfaces

1. Inspection runtime LWC.
2. Checkout review and required-answer gate LWC.
3. Apex question-set resolver.
4. Map LWC platform (base + wrappers).
5. Hierarchy LWC platform (base + wrappers).
6. Program workspace LWC platform (base + wrappers).
7. Apex orchestration for multi-record transactional and KML operations.

## 7. Data Model Requirements

### 7.1 Standard Hierarchy

Supported asset taxonomy:

1. System
2. Point of Connection
3. Pump
4. Backflow
5. Master Valve
6. Flow Sensor
7. Controller
8. Zone

Parenting rules:

1. Each Property has exactly one System.
2. Point of Connection must belong to a System.
3. Pump must belong to a Point of Connection.
4. Backflow must belong to a Point of Connection.
5. Master Valve must belong to a Point of Connection.
6. Flow Sensor must belong to a Point of Connection.
7. Controller must belong to a Point of Connection.
8. Zone must belong to a Controller.
9. Zone valve/station details are represented as zone-linked metadata.

### 7.2 Inspection Checklist Outputs Model

1. `Inspection_Response__c` child model for version-safe responses.
2. `Inspection_Question__c`, `Inspection_Question_Set__c`, and set-membership junction model.
3. Checklist output summaries are stored at inspection level with counts by asset type and linked evidence.

### 7.3 Map and Program Models

1. `Map_Feature__c`: geometry type, GeoJSON payload, source/confidence metadata, account/asset links.
2. `Irrigation_Program__c`: controller-scoped schedule and zone linkage metadata.

### 7.4 Asset Metadata Coverage by Component

1. System: mainline pipe type/size, serial number, install/lifecycle context.
2. Point of Connection: water source type, source capacity, restriction context.
3. Pump: operational status, pressure reading, pump type.
4. Backflow: backflow type, serial number, test/compliance dates/results, testing authority.
5. Master Valve: operational status, valve type, serviceability diagnostics.
6. Flow Sensor: functional status, sensor model, observed flow reading.
7. Controller: controller label, total zones, make/model, connectivity, smart-controller flag, app/platform.
8. Zone: zone number, area served, flow rate, head/distribution context, lateral pipe fields, solenoid resistance.
9. Zone-linked subcomponent metadata: valve type and station mapping/electrical status are stored on the zone context.

### 7.5 Checklist Coverage by Component

1. System checklist includes mainline pressure/leak and isolation/quick-coupler condition prompts.
2. Point of Connection checklist includes water restrictions and related details.
3. Pump checklist includes operational state, pressure capture, and abnormal cycle/noise check.
4. Backflow checklist includes visual condition, leak checks, and conditional compliance test prompts.
5. Master Valve checklist includes operational check, leak check, and manual-override serviceability.
6. Flow Sensor checklist includes install/connectivity state, plausibility of reading, and fault/alarm state.
7. Controller checklist includes power/sensor/program controls and adjustment/winterization prompts.
8. Zone checklist includes runtime/condition/failure prompts, repair capture, and station-wiring checks.
9. Checklist output summary must be maintained by asset type across all listed components.

## 8. Lightning Record Experience Specification

Page Name: Asset Record - Irrigation Unified  
Target Object: Asset  
Form Factors: Desktop and Phone

Top region:

1. Highlights panel.
2. Optional status/path strip.
3. Quick actions: New Work Order, Log Checklist Finding, Capture GPS Location, Upload Photo.

Main layout:

1. Dynamic Forms sections by asset type.
2. Hierarchy wrapper and map wrapper as first-class components.
3. Tab set: Details, Hierarchy, Map, Program, Related, History.

Visibility rules:

1. Program workspace visible only for Controller context.
2. Zone controls visible only for zone-eligible context.
3. Map edit controls gated by role and lifecycle stage.
4. Small form-factor wrappers used for mobile channels.

## 9. Functional Requirements

### FR-1 Inspection Runtime

1. Resolve and snapshot one published question set per inspection start.
2. Render only relevant sections through branching rules.
3. Persist offline and sync on reconnect.
4. Enforce required-answer gate at checkout.

### FR-2 Checklist Outputs Capture and AM Handoff

1. Generate checklist outputs from inspection responses by asset type.
2. Require technician confirmation and categorization of outputs at checkout.
3. Require AM assignment and disposition status when actionable outputs exist.
4. Persist links from outputs to source evidence and asset context.

### FR-3 Hierarchy and Asset Guardrails

1. Enforce type-specific required fields.
2. Enforce uniqueness of hierarchy identifiers within property scope.
3. Enforce strict parent requirements for Point of Connection, Pump, Backflow, Master Valve, Flow Sensor, Controller, and Zone.
4. Keep selected asset context synchronized across tabs and deep links.

### FR-4 Map Workflows

1. Create/edit/delete point, line, polygon features.
2. Support desktop authoring and mobile location capture.
3. Sync selected map feature context with hierarchy selection.
4. Support KML import/export with validation and error handling.

### FR-5 Program Workflows

1. Allow create/edit/delete of controller programs.
2. Require program name and validate schedule constraints.
3. Support zone linkage and active/inactive controls.

### FR-6 Reporting and Accountability

1. Completion rate by branch, property, and week.
2. Open actionable output pipeline by category, owner, and age.
3. Checkout-to-approval conversion velocity.
4. Data quality metrics (required completion and photo coverage).

## 10. Non-Functional Requirements

1. Desktop and mobile usability for target pilot data volumes.
2. Mobile workflows remain operable in low-connectivity conditions supported by platform baseline.
3. Custom operations are bulk-safe where server-side orchestration is required.
4. Security and validation are enforced server-side, not UI only.

## 11. Release Plan

### R1 (Pilot)

1. Asset model and unified page.
2. Question library foundation and initial regionalized set.
3. Inspection runtime and checkout gate.
4. Checklist output handoff flow and AM queue.
5. Candidate-provider map features and KML MVP (Mapbox or Google based on gate closure).
6. Program workspace.
7. Core dashboard pack.

### R1.1 (Hardening and Expansion)

1. Additional regional question deltas.
2. Offline and channel hardening.
3. Approval-threshold automation expansion.
4. Experience Cloud customer history (license-gated).

## 12. Jira Execution Epics

1. Salesforce foundation and data model.
2. Unified asset page and Dynamic Forms.
3. Reusable hierarchy LWC platform.
4. Reusable map LWC platform with KML.
5. Reusable program LWC platform.
6. Security and lifecycle guardrails.
7. Migration, pilot, and governance.
8. Cross-channel QA and release certification.

## 13. Risks and Mitigations

1. Field adoption risk from complexity: enforce simplified workflows and strict UX guardrails.
2. Channel behavior drift: test matrix and shared base contract across wrappers.
3. Audit depth limitations with field history only: evaluate post-MVP event-level extension.
4. Pilot branch variance: phased migration with rollback and steering gates.

## 14. Open Decisions

Open decision and gate authority is maintained in `requirements/decision_log.md` under **Open Decision Gates**.

This PRD references the active gate set and should not maintain a duplicated open-decision list.

## 15. Success Metrics

1. Inspection completion reliability at property level.
2. Days from inspection checkout to AM decision.
3. Percentage of checklist outputs with complete evidence.
4. Time to establish baseline hierarchy for pilot properties.
5. Channel parity pass rate for hierarchy/map/program workflows.

## 16. Source Inputs for This Consolidated Version

1. requirements/fsm_irrigation_requirements.md
2. requirements/decision_log.md
3. requirements/map_lwc_responsive_v1_first_pass.md
4. requirements/northeast_discovery_plan.md
5. research/asset_record_page_design.md
6. research/automation_flows_design.md
7. research/spatial_mapping_options.md
8. requirements/archive/inspection_form_data_model.md (archived predecessor)
9. research/archive/fsm_asset_architecture.md (archived predecessor)
10. research/archive/fsm_asset_research.md (archived predecessor)
11. discovery transcripts and extracted discovery notes in discovery/.



