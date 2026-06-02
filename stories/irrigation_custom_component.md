# Job Story: Irrigation Custom Component

## Job Story

The business needs one irrigation workspace for both system setup and in-visit execution, the need is for a custom Lightning Web Component that supports setup/location authoring across Desktop, Salesforce Mobile, and FSM Mobile with Service Appointment inspection workload in FSM Mobile, to output one consistent asset-centric experience where setup data and field execution stay connected.

## Business Value

- Creates a single custom workspace instead of split tooling for setup and field execution.
- Enables Desktop, Salesforce Mobile, and FSM Mobile users to complete setup and map-location authoring directly in the same component.
- Keeps setup, map, asset, checklist, and submission data synchronized in one runtime surface.
- Preserves operational guardrails and traceability across channel-specific responsibilities.

## Scope

This story covers the custom LWC irrigation workspace experience, including:

- map-first asset interaction
- setup workflows for adding related assets
- location workflows for adding or editing map locations tied to related assets
- selected asset context and hierarchy awareness
- asset-type checklist rendering
- finding capture and resolved-on-visit handling
- photo and evidence support
- summary and submit gating behavior
- channel-specific behavior across desktop, Salesforce Mobile, and FSM Mobile wrappers

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

## Component Model

- Base component pattern: custom LWC runtime with channel-specific wrappers for desktop, Salesforce Mobile, and FSM Mobile.
- Entry rule: map entry is always in asset context; no out-of-context map launch.
- Mobile interaction model: map-first with bottom sheet as the primary control surface.
- Salesforce data boundary: Salesforce remains the system of record for assets, checklist findings, and map metadata.
- Channel responsibility boundary for Desktop and Salesforce Mobile: setup and location authoring tasks, including related-asset add/edit and map location updates.
- Channel responsibility boundary for FSM Mobile: supports setup/location authoring and carries Service Appointment inspection workload, including checklist execution, callout recording, and SA completion.
- System boundary: Service Appointment inspection completion and Asset checklist callout recording are executed in this Irrigation Custom Component flow.

## Platform Boundaries

| Platform | Primary Purpose | In Scope | Out of Scope |
| --- | --- | --- | --- |
| Desktop | Setup and location authoring | Add/edit related irrigation assets, maintain hierarchy relationships, add/update map locations, review asset/map context | Service Appointment inspection completion |
| Salesforce Mobile | Setup and location authoring in mobile shell | Add/edit related irrigation assets, maintain hierarchy relationships, add/update map locations, review asset/map context | Service Appointment inspection completion |
| FSM Mobile | Service Appointment inspection execution plus setup/location support | Run SA inspection workload, complete checklist, record Asset checklist callouts, complete SA, and perform setup/location authoring when needed | None specific to setup/location in this story |

## Included Story: Irrigation AM Salesforce App Setup and Location Support

### Included Job Story

The business needs Account Managers working outside FSM Mobile to prepare irrigation data before or between service visits, the need is for Salesforce app support to perform setup and map-location updates for related irrigation assets, to output current and accurate asset/location context for field teams executing Service Appointment inspection workload in FSM Mobile.

### Included Scope Outcomes

- Related irrigation assets are added and updated in hierarchy context from Salesforce app.
- Map locations for related assets are added and updated from Salesforce app.
- Hierarchy and mapping integrity are preserved for downstream FSM Mobile inspection use.
- Setup/location outcomes are immediately available to FSM Mobile inspection users.

### Included Channel Outcomes

- Primary AM channel is Salesforce app for setup/location authoring.
- Desktop can perform equivalent setup/location workflows through the shared component.
- FSM Mobile remains the Service Appointment inspection workload channel and can also perform setup/location work when needed.
- Salesforce app setup/location path does not require Service Appointment inspection completion.

### Included Acceptance Criteria

1. Related irrigation assets are added and updated by AM users in Salesforce app without FSM Mobile dependency.
2. Setup outcomes preserve required hierarchy rules across System, Point of Connection, Pump, Backflow, Master Valve, Flow Sensor, Controller, and Zone.
3. Map locations for related irrigation assets are added and updated by AM users in Salesforce app.
4. Setup and location updates persist to the same asset and map records consumed by FSM Mobile inspection workload.
5. Setup/location changes maintain traceability to the acting user and timestamp.
6. Invalid hierarchy or mapping combinations are prevented and return actionable remediation guidance.
7. Channel differences do not change core asset model semantics, hierarchy rules, or location data meaning.
8. Service Appointment inspection completion is not required in this Salesforce app setup/location path.

## Acceptance Criteria

1. The solution is delivered as a custom LWC experience, not as a standard record page flow stitched together from unrelated components.
2. The component is available in desktop, Salesforce Mobile, and FSM Mobile channels with platform-appropriate behavior.
3. The experience starts in irrigation asset context and preserves selected-asset context across map, detail, checklist, and summary surfaces.
4. On mobile form factors, the experience follows a map-first pattern with bottom-sheet controls.
5. Related irrigation assets are added and maintained in hierarchy-compliant structure within Desktop, Salesforce Mobile, and FSM Mobile channels.
6. Map locations for related assets are added and updated within Desktop, Salesforce Mobile, and FSM Mobile channels.
7. Setup and location updates persist to the same asset and map records used during FSM inspection execution.
8. FSM Mobile carries the Service Appointment inspection workload, including checklist execution, callout recording, and SA completion.
9. Desktop and Salesforce Mobile channels do not perform Service Appointment inspection completion.
10. Asset selection from map context leads directly to checklist and asset-detail actions.
11. Checklist content is organized by asset type for system, point of connection, pump, backflow, master valve, flow sensor, controller, and zone contexts.
12. Required response types are captured successfully, including boolean, count, number, and text.
13. Findings include resolved-on-visit outcomes and display dependent prompts where applicable.
14. Asset-level evidence includes both photo attachment and photo removal outcomes.
15. Checklist outcomes persist at the asset visit level with enough detail for summary and downstream handoff.
16. The summary surface reflects captured checklist status and prevents submission when completion rules are not met.
17. Submission remains unavailable until required inspection questions, checklist output requirements, and AM assignment requirements are satisfied.
18. Service Appointment inspection completion occurs within this component experience.
19. Confirmed findings are recorded as Asset checklist callouts within this component experience using shared callout rules.
20. Working context is preserved across tab switches, panel changes, and responsive layout changes.
21. Geometry interaction outcomes include selected-asset map context, edit mode entry, and asset creation where workflow permits.
22. FSM Mobile execution meets field-usage expectations for speed, clarity, and low-friction navigation.
23. Asset-scoped inspection questions align to Standard irrigation hierarchy assets: System, Point of Connection, Pump, Backflow, Master Valve, Flow Sensor, Controller, and Zone.
24. Checkout review supports clear suggestion disposition outcomes: confirmed, dismissed, or merged before callout recording.
25. Suggestions are categorized and grouped as `Repair` and `Enhancement` callout types in checkout review.

## Notes

- This story is for the custom customer inspection component surface, not the underlying OOTB asset record model.
- This story is the shared component boundary for setup/location authoring and SA execution, with channel responsibilities explicitly split.
- The component should align to the map-first and checklist-output behavior already defined in the responsive map LWC and V4 mobile runtime requirements.
- This story assumes the OOTB Asset hierarchy remains the durable context model while the custom LWC provides the interaction layer.
- Detailed provider choice for the embedded map remains gated between Mapbox GL JS and Google Maps JavaScript API.

## Source Context

- requirements/fsm_irrigation_requirements.md
- requirements/map_lwc_responsive_v1_first_pass.md
- requirements/prdV4.md
- requirements/prd_v3.1.md
