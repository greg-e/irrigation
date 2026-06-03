# Job Story: Irrigation Service Appointment

## Job Story

The business needs irrigation Service Appointment inspection execution to capture findings that may become customer-facing work, the need is for the Service Appointment workflow in FSM to drive structured inspection capture and controlled conversion of confirmed findings into pending callout WOLIs, to output complete and auditable inspection outcomes that are ready for AM review without losing asset context.

## Business Value

- Anchors irrigation inspection execution to the FSM Service Appointment lifecycle instead of ad hoc note capture.
- Converts actionable inspection findings into standardized pending callout WOLIs with controlled status and ownership.
- Preserves traceability from asset-level inspection response to pending WOLI and downstream estimate decisions.
- Improves data quality by enforcing required responses, constrained status values, and controlled callout recording rules.

## Scope

This story covers irrigation inspection requirements executed from FSM Service Appointment with pending callout WOLI outcomes, including:

- Service Appointment execution context and lifecycle ownership
- inspection snapshot and response persistence model
- actionable finding lifecycle and pending WOLI conversion workflow
- AM assignment requirements at checkout
- callout type and status governance for pending callout WOLIs

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

## Service Appointment and Pending Callout Model

- Service Appointment is the visit execution container and inspection context owner.
- SA inspection completion and pending callout conversion are executed through the Irrigation Custom Component flow.
- FSM Mobile is the channel that carries the full Service Appointment inspection workload.
- Inspection responses are persisted with SA linkage and question snapshot context.
- Failed or manually-added findings become suggestions first, then require explicit confirmation at checkout.
- Confirmed findings are converted to pending callout WOLIs linked to the related Asset.
- Pending callout WOLIs retain source inspection linkage and target asset context.
- Irrigation inspection findings and actionable outputs are recorded in Service Appointment-linked responses and pending callout WOLIs.
- AM assignment is required before checkout can complete when confirmed callouts exist.
- Submit is blocked until checklist output policy is met (touched assets or explicit no-touch reason code plus note).

## Acceptance Criteria

1. Irrigation inspection is executed only in Service Appointment context, with Service Appointment as the parent execution record.
2. Each in-flight inspection is governed by one locked effective question set for its Service Appointment context.
3. Per-question outcomes persist with Service Appointment linkage and audit-ready context.
4. Actionable findings are available as suggestions before conversion and remain adjustable until checkout conversion is finalized.
5. Confirmed suggestions become pending callout WOLIs in Pending AM Review status.
6. Converted pending callout WOLIs carry issue type, quantity, callout type, severity, source inspection linkage, and target asset linkage where applicable.
7. Inspection findings and actionable outputs are completed in Service Appointment workflow and represented as Service Appointment-linked responses and pending callout WOLIs only.
8. Pending callout status values remain within approved business states.
9. Invalid issue-type-to-asset-type combinations do not convert and return actionable remediation feedback.
10. SA checkout completes only when each pending callout has AM assignment, with clear remediation guidance when assignment is missing.
11. Submit remains blocked until checklist output policy is satisfied (touched assets or explicit no-touch reason code plus note).
12. Service Appointment-level `Repairs_Needed__c` is set consistently based on confirmed callout outcomes.
13. Successful submit transitions the irrigation WOLI to COMPLETED, with reopen support returning it to active execution state.
14. Inspection record integrity is preserved even when downstream pending-callout conversion errors occur, and those failures are reportable for retry.

## Notes

- This story focuses on SA execution and pending callout WOLI outcomes, not the full custom component UI design.
- System boundary: SA completion and pending-callout conversion logic run in the Irrigation Custom Component flow.
- Component interaction and submit-gating requirements are defined in `stories/irrigation_custom_component.md`.
- Platform distinctions are defined in the Platform Boundaries section of `stories/irrigation_custom_component.md`.
- Setup and map-location authoring behavior for desktop and mobile channels are defined in `stories/irrigation_custom_component.md` and are out of scope for this SA workload story.
- Asset hierarchy and metadata remain governed by the Standard irrigation model.
- Any downstream work-item creation is a separate post-inspection process and is not the inspection output.

## Source Context

- requirements/fsm_irrigation_requirements.md
- stories/build_backlog.md
- requirements/prdV4.md
- requirements/current_state.md
- requirements/decision_log.md
