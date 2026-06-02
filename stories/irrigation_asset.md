# Job Story: OOTB Salesforce Irrigation Asset

## Job Story

The business needs a durable irrigation asset record in Salesforce that can be used across setup, inspection, repair, and reporting, the need is for irrigation infrastructure represented on the standard Salesforce Asset object, to output one consistent asset model across field operations, service workflows, and downstream reporting.

## Business Value

- Uses the out-of-the-box Salesforce Asset object as the system of record instead of introducing a parallel custom asset object.
- Keeps irrigation setup, map context, inspection outputs, and repair workflows tied to the same asset identity.
- Supports durable lifecycle tracking, hierarchy validation, and reporting across System, Source, Backflow, Controller, and Zone.

## Scope

This story covers the baseline OOTB Salesforce Asset implementation for irrigation, including:

- standard Asset as the primary asset record
- irrigation asset type classification
- parent-child hierarchy enforcement
- minimum required metadata
- retire-only lifecycle behavior
- map linkage and inspection readiness

## Hierarchy Diagram

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

## Acceptance Criteria

1. Irrigation assets are stored on the standard Salesforce Asset object, not a separate custom asset object.
2. The irrigation asset type model supports exactly these controlled values: System, Source, Backflow, Controller, Zone.
3. Each non-root irrigation asset must have a valid parent Asset based on the defined hierarchy: System -> Source -> Backflow -> Controller -> Zone.
4. Each property has exactly one System asset, and all other irrigation assets roll up beneath that System through the required parent chain.
5. The Asset record contains the required common irrigation data elements: Name, Asset Type, Status, Parent, and type-specific required create-time fields.
6. Zone naming is normalized to Zone plus the zone number, and Zone Number is required and uniquely managed within the working property context.
7. Assets are retired rather than hard deleted when removed from active use.
8. The asset record model links downstream to map features, inspection activity, and repair callouts without duplicate asset records.
9. Component details such as pump, valve, head, drip, and pipe context are captured as metadata on the appropriate irrigation Asset record rather than modeled as separate child asset records.
10. The asset structure is reportable so operations can filter and summarize irrigation assets by type, status, hierarchy position, and inspection/repair state.

## Notes

- Standard object baseline: Asset
- Standard hierarchy baseline: System, Source, Backflow, Controller, Zone
- Parent validation is a business rule, even where Salesforce requires custom validation/configuration to enforce it.
- This job story establishes the durable record model that later stories can extend with map geometry, inspection metadata, checklist outputs, and Asset checklist callout linkage.

## Source Context

- requirements/fsm_irrigation_requirements.md
- stories/build_backlog.md
