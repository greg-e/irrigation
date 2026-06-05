# Job Story: Irrigation Custom Component

## Job Story

When users need to manage irrigation setup and execute mobile WOLI inspections in one workspace, I want a custom Lightning Web Component that combines desktop record management with a mobile WOLI runtime using the current requirements hierarchy and checklist model, so I can keep asset context, checklist output, and submission gating in one connected flow.

## Business Value

- Creates one custom workspace for desktop asset management and mobile WOLI execution instead of split tooling.
- Keeps asset, map, checklist, callout, and submission data synchronized in one runtime surface.
- Preserves operational guardrails and traceability across desktop and mobile channel responsibilities.
- Supports faster setup-to-execution handoff for office users and field users.

## Scope

This story covers the custom LWC irrigation workspace experience, including:

- desktop record workspace tabs for Details, Irrigation, Program, Related, Chatter, and History
- desktop asset create/edit/retire modal workflows with type-specific fields
- desktop map embed and map context sync
- desktop controller program CRUD
- desktop property pivot controls for previous/next property and property selector navigation
- mobile Work Order mode and WOLI mode
- mobile map-first workflow with asset selection, full-screen map mode, and map edit controls
- mobile checklist composer by asset type with issue detection and resolution state
- mobile submission gating based on checklist output, no-touch policy, and AM assignment
- local session persistence for irrigation WOLIs

## Asset Context Hierarchy

```text
Account / Property
└── System
    └── Point of Connection (Source)
        ├── Pump
        ├── Backflow
        ├── Master Valve
        ├── Flow Sensor
        └── Controller
            ├── Zone 1
            └── Zone 2
```

Component variants such as Valve, Head, and Drip Emitter Group are handled as zone-linked component metadata or map-linked variants where applicable.

## Component Model

- Base component pattern: custom LWC runtime with a desktop record workspace and a mobile WOLI execution workspace.
- Entry rule: map entry is always in asset context; no out-of-context map launch.
- Desktop responsibility boundary: hierarchy management, map authoring, controller program management, related records, and property pivot navigation.
- Mobile responsibility boundary: inspection execution, checklist output capture, callout recording, and submit gating.
- Salesforce remains the system of record for assets, checklist findings, callouts, and map metadata.
- Mobile interaction model: map-first with bottom sheet as the primary control surface.
- System boundary: Service Appointment or WOLI completion and checklist output recording are executed in this Irrigation Custom Component flow.

## Platform Boundaries

| Platform | Primary Purpose | In Scope | Out of Scope |
| --- | --- | --- | --- |
| Desktop | Record workspace and map authoring | Add/edit related irrigation assets, maintain hierarchy relationships, add/update map locations, manage controller programs, review related records | WOLI completion and submit gating |
| Mobile | WOLI execution workspace | Run inspection workload, complete checklist, record Asset checklist callouts, complete submit flow, and perform setup/location authoring when needed | Non-irrigation WOLIs beyond standard-flow placeholder behavior |

## Included Story: Mobile WOLI Output and AM Handoff

### Included Job Story

When a mobile user completes irrigation inspection work, I want checklist output, findings, and AM assignment checks to gate submit, so I can complete a WOLI with auditable outcomes ready for handoff.

### Included Scope Outcomes

- Asset-scoped checklist output is captured by asset type in the mobile WOLI workspace.
- Results persist with before/after values, timestamps, and visit imprint context.
- Findings can be resolved on visit and promoted into callouts.
- AM assignment and no-touch policy gate submit eligibility.

### Included Channel Outcomes

- Mobile is the primary execution channel for WOLI inspection work.
- Desktop remains available for setup, hierarchy management, and map authoring.
- The same asset and map records are used across setup and execution.
- Non-irrigation WOLIs remain visible but follow read-only/standard-flow placeholder behavior.

### Included Acceptance Criteria

1. Asset-scoped checklist output is captured in the mobile WOLI workspace with before/after values and timestamped visit imprint entries.
2. Checklist definitions vary by asset type and support boolean, count, number, select, and text response types.
3. Finding-capable rows support resolved-on-visit state and dependent prompts where configured.
4. Asset-level evidence supports both photo attachment and photo removal outcomes.
5. Summary surfaces show captured output with clear status and asset context.
6. Submit remains unavailable until the checklist output requirement is met, using touched assets or an explicit no-touch reason code plus note.
7. Submit remains unavailable until AM assignment is satisfied.
8. Successful submit transitions the irrigation WOLI to COMPLETED and offers post-submit routing or reopen flow.

## Acceptance Criteria

1. The solution is delivered as a custom LWC experience, not as a standard record page flow stitched together from unrelated components.
2. The component is available in desktop and mobile channels with platform-appropriate behavior.
3. The experience starts in irrigation asset context and preserves selected-asset context across map, detail, checklist, and summary surfaces.
4. On mobile form factors, the experience follows a map-first pattern with bottom-sheet controls.
5. Desktop supports hierarchy-compliant asset management, controller program management, and property pivot navigation.
6. Desktop and mobile both support related irrigation asset add and edit flows within the shared component.
7. Map locations for related assets are added and updated within desktop and mobile channels.
8. Mobile checklist content is organized by asset type for system, source/point-of-connection, backflow, controller, and zone contexts, including source-context pump checks and conditional branches defined by visit context.
9. Required response types are captured successfully, including boolean, count, number, select, and text.
10. Findings include resolved-on-visit outcomes and display dependent prompts where applicable.
11. Asset-level evidence includes both photo attachment and photo removal outcomes.
12. Checklist outcomes persist at the asset visit level with enough detail for summary and downstream handoff.
13. The summary surface reflects captured checklist status and prevents submission when completion rules are not met.
14. Submission remains unavailable until required checklist output policy and AM assignment requirements are satisfied, including zero-touch reason code plus note when no asset checklist values were changed.
15. Successful submit transitions the irrigation WOLI to COMPLETED and presents next-step routing options.
16. Completed irrigation WOLIs support reopen back to active execution state with persisted session context.
17. Non-irrigation WOLIs remain visible in overview but are blocked from irrigation submit flow and routed to standard FSM handling.
18. Working context is preserved across tab switches, panel changes, and responsive layout changes.
19. Geometry interaction outcomes include selected-asset map context, edit mode entry, and asset creation where workflow permits.
20. Checklist findings and summary output remain auditable and available for downstream pending-callout/handoff workflows.
21. FSM Mobile execution meets field-usage expectations for speed, clarity, and low-friction navigation.

## Notes

- This story is for the custom customer inspection component surface, not the underlying OOTB asset record model.
- This story is the shared component boundary for setup/location authoring and WOLI execution, with desktop and mobile responsibilities explicitly split.
- The component should align to the map-first and checklist-output behavior demonstrated in v5.1 desktop/mobile prototypes.
- This story assumes the OOTB Asset hierarchy remains the durable context model while the custom LWC provides the interaction layer.
- Detailed provider choice for the embedded map remains gated between Mapbox GL JS and Google Maps JavaScript API.

## Source Context

- requirements/current_state.md
- requirements/fsm_irrigation_requirements.md
- requirements/map_lwc_responsive_v1_first_pass.md
- requirements/prdV4.md
- prototype/v5/desktopV5.1.html
- prototype/v5/mobileV5.1.html
