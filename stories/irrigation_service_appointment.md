# Job Story: Irrigation Service Appointment

## Job Story

The business needs irrigation Service Appointment inspection execution to capture findings that may become customer-facing work, the need is for the Service Appointment workflow in FSM to drive structured inspection capture and Asset-level checklist callout recording, to output complete and auditable inspection outcomes that are ready for AM review without losing asset context.

## Business Value

- Anchors irrigation inspection execution to the FSM Service Appointment lifecycle instead of ad hoc note capture.
- Converts actionable inspection findings into standardized checklist callouts recorded on the related Asset.
- Preserves traceability from asset-level inspection response to callout and downstream estimate decisions.
- Improves data quality by enforcing required responses, constrained status values, and controlled callout recording rules.

## Scope

This story covers irrigation inspection requirements executed from FSM Service Appointment with Asset checklist callout outcomes, including:

- Service Appointment execution context and lifecycle ownership
- inspection snapshot and response persistence model
- actionable finding lifecycle and checklist callout recording workflow
- AM assignment requirements at checkout
- callout type and status governance for recorded checklist callouts

## Asset Context Hierarchy

```text
Account / Property
└── System
    └── Source
        └── Backflow
            └── Controller
                ├── Programs
                ├── Zone 1
                └── Zone 2
```

## Service Appointment and Asset Callout Model

- Service Appointment is the visit execution container and inspection context owner.
- SA inspection completion and checklist callout recording are executed through the Irrigation Custom Component flow.
- FSM Mobile is the channel that carries the full Service Appointment inspection workload.
- Inspection responses are persisted with SA linkage and question snapshot context.
- Failed or manually-added findings become suggestions first, then require explicit confirmation at checkout.
- Confirmed findings are recorded as checklist callouts on the related Asset.
- Checklist callouts retain source inspection linkage and target asset context.
- Irrigation inspection findings and actionable output are recorded in Service Appointment-linked records and Asset checklist callouts only.
- AM assignment is required before checkout can complete when confirmed callouts exist.

## Acceptance Criteria

1. Irrigation inspection is executed only in Service Appointment context, with Service Appointment as the parent execution record.
2. Each in-flight inspection is governed by one locked effective question set for its Service Appointment context.
3. Per-question outcomes persist with Service Appointment linkage and audit-ready context.
4. Actionable findings are available as suggestions before recording and remain adjustable until callout recording is finalized.
5. Confirmed suggestions become checklist callouts recorded on the related Asset.
6. Inspection findings and actionable outputs are completed in Service Appointment workflow and represented as Service Appointment-linked responses and Asset checklist callouts only.
7. Recorded checklist callouts carry issue type, quantity, callout type, severity, source inspection linkage, and target asset linkage where applicable.
8. Checklist callout status values remain within approved business states.
9. Invalid issue-type-to-asset-type combinations do not record and return actionable remediation feedback.
10. SA checkout completes only when each pending callout has AM assignment, with clear remediation guidance when assignment is missing.
11. Service Appointment-level `Repairs_Needed__c` is set consistently based on confirmed callout outcomes.
12. Inspection record integrity is preserved even when downstream callout-recording errors occur, and those failures are reportable for retry.

## Notes

- This story focuses on SA execution + Asset checklist callout outcomes, not the full custom inspection UI design.
- System boundary: SA completion and checklist callout recording logic run in the Irrigation Custom Component flow.
- Component interaction and submit-gating requirements are defined in `stories/irrigation_custom_inspection_component.md`.
- Platform distinctions are defined in the Platform Boundaries section of `stories/irrigation_custom_inspection_component.md`.
- AM non-FSM channel requirements are tracked separately in `stories/irrigation_am_salesforce_app_assessment.md`.
- Setup and map-location authoring behavior for Desktop, Salesforce Mobile, and FSM Mobile channels are defined in `stories/irrigation_custom_inspection_component.md` and are out of scope for this SA workload story.
- Asset hierarchy and metadata remain governed by the Standard irrigation model.
- Any downstream work-item creation is a separate post-inspection process and is not the inspection output.

## Source Context

- requirements/fsm_irrigation_requirements.md
- stories/build_backlog.md
- requirements/map_lwc_responsive_v1_first_pass.md
