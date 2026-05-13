# Irrigation Inspection and Asset Mapping PRD (v1)

Date: May 13, 2026
Status: Draft for business expert review
Owner: FSM Product/Architecture

## 1. Executive Summary

This product delivers a Salesforce-native irrigation operating model using:

1. OOTB Salesforce Assets as the system of record for irrigation components.
2. Custom inspection LWC in FSM Mobile for field capture and checkout control.
3. Custom Mapbox LWC in desktop and mobile for within-property spatial context.
4. AM-governed callout conversion into pending work for quote and execution.

The goal is to reduce revenue leakage, improve inspection completion accountability, and standardize irrigation execution across branches while preserving regional variants.

## 2. Business Outcomes

Primary outcomes:

1. Increase completion reliability for recurring irrigation inspections.
2. Increase repair and enhancement conversion from field findings.
3. Reduce time from field finding to AM quote decision.
4. Standardize inspection language nationally with controlled regional deltas.
5. Improve customer trust through evidence-backed reporting and map context.

Success KPIs (business-facing):

1. Inspection completion rate by branch and week.
2. Confirmed callouts per completed inspection.
3. Quote cycle time from checkout to AM decision.
4. Enhancement share of total callouts.
5. Revisit rate due to missing/poor field data.

## 3. Scope and Release Boundaries

## 3.1 In Scope (R1)

1. Property-centric OOTB Asset setup and governance on Account.
2. Canonical irrigation taxonomy and minimum bootstrap fields.
3. Immutable question library and deterministic set resolver.
4. Mobile inspection runtime with required-answer checkout gate.
5. Suggested repairs/enhancements confirmation workflow.
6. Pending callout handoff to AM queue.
7. Mapbox LWC map view on desktop and mobile with point/polygon/line rendering from Salesforce geometry.
8. Desktop and mobile pin capture with offline-safe queueing for writes.

## 3.2 In Scope (R1.1)

1. Offline tile strategy and sync instrumentation hardening.
2. Expanded map status badges and richer callout map interactions.
3. Reporting enhancements and branch operational dashboards.

## 3.3 Out of Scope (R1)

1. Full GIS enterprise stack and ArcGIS dependency.
2. Fully automated quote approval orchestration across all external systems.
3. Resident self-service request intake for non-registered users.
4. Advanced predictive analytics outside captured inspection and asset telemetry.

## 4. Users and Core Journeys

Personas:

1. Irrigation Technician (field execution).
2. Irrigation Manager (standards/adoption and oversight).
3. Account Manager (triage, quote decisions, customer follow-through).
4. Branch Leadership (throughput, quality, and revenue accountability).

Primary journeys:

1. Setup journey (desktop): property to baseline asset completeness.
2. Inspection journey (mobile): guided form + map context + required checkout.
3. Callout journey (mobile to desktop): confirm/dismiss/merge suggestions, hand off pending callouts.
4. AM journey (desktop): queue triage and controlled conversion to estimate flow.
5. Reporting journey: completion, backlog, conversion, and quality views.

## 5. Architecture Overview

## 5.1 Architecture Decisions (Locked)

1. System of record for asset and geometry metadata is Salesforce.
2. Geometry is stored in Salesforce `Map_Feature__c` using GeoJSON.
3. Renderer is Mapbox GL JS in custom LWC on Account and Work Order/Service Appointment contexts.
4. Inspection runtime uses custom objects (not Salesforce Assessments path).
5. Published question versions are immutable and append-only.

## 5.2 Component Model

1. OOTB objects: Account, Asset, Work Order, Work Order Line Item, Service Appointment.
2. Custom core objects: `Inspection_Response__c`, `Inspection_Question__c`, `Inspection_Question_Set__c`, `Inspection_Question_Set_Member__c`, `Irrigation_Program__c`, `Map_Feature__c`, staged asset change objects.
3. Custom LWCs: Mobile inspection runtime, checkout review, desktop/mobile map components.
4. Automation: Record-triggered Flow and targeted Apex for resolver, snapshot lock, and controlled conversions.

## 5.3 Platform Principles

1. OOTB first for workspace and record model.
2. Custom only for differentiated UX and deterministic business logic.
3. Offline-safe design for inspection writes and deferred spatial sync.
4. Auditability for every publish, completion, callout conversion, and override.

## 6. Functional Requirements

## 6.1 Asset Setup (Desktop, OOTB-First)

1. Queue-first property setup workflow with completion status and blockers.
2. Controlled taxonomy (Controller, Zone, Backflow, Head, Valve, Drip_Line, Pump, Sensor).
3. Completion guards enforce minimum active asset baseline.
4. Reopen and retire workflows preserve audit integrity.

## 6.2 Map Experience (Desktop + Mobile LWC)

1. Render property geometry from `Map_Feature__c` (points, polygons, lines).
2. Support desktop authoring and mobile field viewing.
3. Support mobile GPS pin capture and deferred sync when offline.
4. Keep map UX low-friction to match field adoption constraints.

## 6.3 Inspection Runtime (Mobile LWC)

1. Resolve exact published question set by region + inspection type/season + work type.
2. Lock snapshot version at inspection start.
3. Render conditional sections/questions with asset binding.
4. Persist responses offline and sync on reconnect.
5. Block checkout on missing required answers.

## 6.4 Suggested Repairs and Enhancements

1. Generate and deduplicate suggestions during inspection.
2. Group and review suggestions at checkout.
3. Require structured confirmation before callout conversion.
4. Carry `Callout_Type` values (`Repair` / `Enhancement`) into pending records.

## 6.5 AM Handoff and Operations

1. Require AM assignment when confirmed callouts exist.
2. Create pending items in review queue with source inspection context.
3. Preserve controlled conversion path to downstream estimate/execution process.

## 6.6 Reporting and Visibility

1. Weekly completion accountability by branch/team/resource.
2. Callout throughput and conversion visibility.
3. Placeholder/normalization and data quality tracking.
4. Pilot adoption and training coverage metrics.

## 7. Non-Functional Requirements

## 7.1 Offline and Sync

1. Inspection completion must function without active data signal.
2. Response records and media queue locally and sync on reconnect.
3. Map writes queue safely; user receives explicit sync state feedback.

## 7.2 Performance

1. Form start (resolved set already available): target under 3 seconds on typical branch mobile conditions.
2. Checkout validation response: target under 2 seconds for standard inspection size.
3. Map initial render (existing feature set): target under 3 seconds on desktop broadband.

## 7.3 Reliability and Observability

1. Resolver failures are explicit and actionable.
2. Sync/apply failures create trackable exceptions without silent data loss.
3. Publish, override, and conversion actions are audit logged.

## 7.4 Security and Compliance

1. Least-privilege access by persona.
2. Publish authority restricted to designated governance role.
3. Field evidence and notes respect internal/external visibility rules.

## 8. Data Model and Governance Requirements

1. Account is the property root record.
2. Assets carry canonical type and hierarchy constraints.
3. `Map_Feature__c` stores geometry and render metadata (`Feature_Type`, `GeoJSON_Geometry__c`, `Spatial_Source`, `Spatial_Confidence`).
4. Question library versions are immutable post-publish.
5. Inspection snapshot remains stable for in-flight session.
6. Data quality flags support normalization backlog management.

## 9. Integration Requirements

1. Maintain existing Salesforce to ExtraWork handoff patterns with pending AM gate.
2. Maintain existing warehouse/BI export compatibility for reporting objects.
3. Define explicit owner for customer-facing distribution and rendering dependencies outside core Salesforce runtime.
4. Defer smart-controller direct integrations unless explicitly approved for release scope.

## 10. Access and Permission Model (Business View)

1. Technician: run inspection, capture media, create/confirm suggestions.
2. Irrigation Manager: monitor completion quality, coach adoption, review branch readiness.
3. Account Manager: review pending callouts, triage and move toward estimate flow.
4. Library Admin: draft and publish question versions.
5. Regional Contributor: draft only, no publish rights.

## 11. Rollout and Change Management

1. Branch-based phased rollout with named pilot owners.
2. Training package includes mobile runtime, map usage, and callout confirmation standards.
3. Adoption support plan includes office hours, issue triage, and reinforcement cadence.
4. Exit criteria per phase are explicit and measured.

## 12. UAT and Business Acceptance

Required business test scenarios:

1. Complete PMI in low-signal conditions.
2. Complete full assessment with conditional branching.
3. Capture map features on desktop and consume/edit from mobile context.
4. Convert repair and enhancement suggestions through checkout and AM queue.
5. Validate completion/accountability reporting outputs.

Business acceptance gates:

1. All critical scenarios pass in pilot branch with representative users.
2. No unresolved Sev-1 or Sev-2 defects in inspection or callout conversion paths.
3. Governance and publish controls validated by designated owner group.

## 13. Risks and Mitigations

1. Adoption risk from mixed digital comfort.
Mitigation: simple UX, phased rollout, voice input, manager-led coaching.

2. Throughput risk from admin/reporting burden.
Mitigation: evidence capture embedded in workflow and targeted automation.

3. Data quality drift across branches.
Mitigation: immutable library versions, required-answer gate, normalization tracking.

4. Offline map behavior variance by device/network.
Mitigation: explicit offline test matrix and sync-state instrumentation.

## 14. Open Decisions for Business Expert Review

1. Final KPI threshold targets by region for go-live gate.
2. Priority order for R1.1 map enhancements vs reporting enhancements.
3. Customer-facing artifact strategy (timing and channel) for inspection outputs.
4. Final owner confirmation and backup for national question publish authority.

## 15. Traceability to Existing Artifacts

Primary source artifacts:

1. `requirements/inspection_form_data_model.md`
2. `requirements/inspection_question_library.md`
3. `requirements/common_data_dictionary_esri_vs_fsm.md`
4. `requirements/desktop_asset_setup_salesforce_blueprint.md`
5. `requirements/stakeholder_followup_questions.md`
6. `stories/build_backlog.md`

This PRD is the review-layer consolidation document. Story-level implementation detail remains in the backlog.
