# Job Story: OOTB Salesforce Irrigation Asset

## Job Story

The business needs a durable irrigation asset record in Salesforce that can be used across setup, inspection, repair, and reporting, the need is for irrigation infrastructure represented on the standard Salesforce Asset object with the current hierarchy and metadata baseline, to output one consistent asset model across field operations, service workflows, and downstream reporting.

## Business Value

- Uses the out-of-the-box Salesforce Asset object as the system of record instead of introducing a parallel custom asset object.
- Keeps irrigation setup, map context, inspection outputs, and repair workflows tied to the same asset identity.
- Supports durable lifecycle tracking, hierarchy validation, and reporting across System, Point of Connection (Source in checklist context), Pump, Backflow, Master Valve, Flow Sensor, Controller, and Zone.

## Scope

This story covers the baseline OOTB Salesforce Asset implementation for irrigation, including:

- standard Asset as the primary asset record
- controlled irrigation asset taxonomy and type compatibility
- parent-child hierarchy enforcement
- minimum required metadata
- create-time required field enforcement by asset type
- zone naming and zone number normalization behavior
- retire-only lifecycle behavior
- map linkage and inspection readiness

## Hierarchy Diagram

```text
Property Account
└── System
    └── Point of Connection (Water Source)
        ├── Pump
        ├── Backflow
        ├── Master Valve
        ├── Flow Sensor
        └── Controller
            └── Zone
```

## Acceptance Criteria

1. Irrigation assets are stored on the standard Salesforce Asset object, not a separate custom asset object.
2. The irrigation asset type model supports this controlled baseline: System, Point of Connection (Source alias), Pump, Backflow, Master Valve, Flow Sensor, Controller, and Zone.
3. Each non-root irrigation asset must have a valid parent Asset based on the defined hierarchy: System -> Point of Connection -> (Pump, Backflow, Master Valve, Flow Sensor, Controller) and Controller -> Zone.
4. Each property has exactly one System asset, and all other irrigation assets roll up beneath that System through the required parent chain.
5. The Asset record contains the required common irrigation data elements: Name, Asset Type, Status, Parent, Install Date, Description, and type-specific required create-time fields.
6. Zone naming is normalized to Zone plus the zone number, and Zone Number is required at create time.
7. Assets are retired rather than hard deleted when removed from active use.
8. The asset record model links downstream to map features, inspection activity, checklist output, and repair callouts without duplicate asset records.
9. Valve, station, head, drip, and pipe context are captured as metadata on the appropriate hierarchy assets (primarily Zone and Controller); they are not required as independent hierarchy levels in the baseline data model.
10. Asset create and edit behavior enforces type-specific required fields and parent compatibility rules, and invalid saves return actionable validation feedback.
11. The asset structure is reportable so operations can filter and summarize irrigation assets by type, status, hierarchy position, and inspection/repair state.

## Notes

- Standard object baseline: Asset
- Standard hierarchy baseline: System, Point of Connection (Source alias), Pump, Backflow, Master Valve, Flow Sensor, Controller, Zone
- Parent validation is a business rule, even where Salesforce requires custom validation/configuration to enforce it.
- This job story establishes the durable record model that later stories can extend with map geometry, inspection metadata, checklist outputs, and Asset checklist callout linkage.
- Current v5 prototype create UX focuses on System, Controller, Pump, Backflow, and Zone with zone-linked component entries; the canonical model remains the requirements hierarchy above.

## Source Context

- requirements/fsm_irrigation_requirements.md
- prototype/v5/desktopV5.1.html
- prototype/v5/mobileV5.1.html
- stories/build_backlog.md
