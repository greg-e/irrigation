# Irrigation Inspection Design Readout Pack

Use this pack to run a stakeholder review from process to data to runtime behavior.

## Recommended Readout Order

1. Process context and control gates
2. Data model and governance structure
3. Runtime sequence and branch behavior
4. Decision recap and implementation implications

## 1) Process Flow

- Diagram: [process_flow.mmd](process_flow.mmd)
- Explainer: [process_flow_explainer.md](process_flow_explainer.md)

Focus points:
- Mapbox-backed within-property map context from `Map_Feature__c` (desktop and mobile).
- Deterministic form resolution and hard-fail behavior on no-match.
- Bootstrap flow for missing asset inventory.
- Required-answer checkout gate.
- Suggested repair/enhancement confirmation and AM ownership.
- Non-blocking asset-sync failure handling with explicit exceptions.

## 2) ERD

- Diagram: [data_model.mmd](data_model.mmd)
- Explainer: [erd_explainer.md](erd_explainer.md)

Focus points:
- Immutable question and set version governance.
- Regional/seasonal deltas on pinned base versions.
- Separation of suggested repairs from confirmed pending callouts.
- Staged asset-change objects and exception records.

## 3) Runtime Sequence

- Diagram: [inspection_sequence.mmd](inspection_sequence.mmd)
- Explainer: [sequence_explainer.md](sequence_explainer.md)

Focus points:
- Interaction timing from check-in through AM handoff.
- Exact branch handling for no-match, missing required answers, and asset apply failures.
- Guardrail that technician checkout does not directly create customer-facing estimates.

## 4) Diagram-to-Backlog Traceability (Validated May 13, 2026)

Backlog source of truth: [../../stories/build_backlog.md](../../stories/build_backlog.md)

### Process Flow and Sequence Traceability

| Diagram area / control point | Mapped backlog stories | Coverage status |
|---|---|---|
| Deterministic question set resolution + hard-fail paths | E2-S1, E2-S3 | Fully represented in process and sequence diagrams |
| Snapshot lock on inspection start | E2-S2 | Fully represented |
| Dynamic mobile form rendering + response persistence | E3-S1, E3-S2 | Fully represented |
| Required-answer checkout gate | E3-S3 | Fully represented |
| Missing-asset bootstrap flow | E4-S1, E4A-S3 | Fully represented |
| Staged asset changes + apply-on-complete + exception path | E4-S2, E4-S3, E4-S4 | Fully represented |
| Asset taxonomy and compatibility controls | E4A-S1 through E4A-S5 | Represented at architecture level; detailed validation logic remains in backlog text |
| Suggested repair/enhancement generation + checkout confirmation | E5-S1, E5-S2 | Fully represented |
| Pending WOLI creation from confirmed items | E5-S3 | Fully represented |
| AM-required ownership + AM review + controlled quote handoff | E6-S1, E6-S2, E6-S3 | Fully represented |
| Completion automation (PDF, publish, reporting dataset) | E7-S1, E7-S2, E7-S3 | Fully represented |
| Mapbox desktop/mobile map usage and feature capture | E9-S1 through E9-S4 | Fully represented |
| Offline map and tile strategy | E9-S5 | Represented conceptually; implementation detail remains in backlog and capability docs |
| Map-to-callout context linkage | E9-S6 | Fully represented |

### ERD Traceability

| ERD entity group | Mapped backlog stories | Coverage status |
|---|---|---|
| Question governance objects and delta model | E1-S1, E1-S2, E1-S3, E1-S4 | Fully represented |
| Runtime resolver/snapshot and inspection response model | E2-S1 through E2-S3, E3-S1 through E3-S3 | Fully represented |
| Asset bootstrap/staging/exception objects | E4-S1 through E4-S4, E4A-S1 through E4A-S4 | Fully represented |
| Suggested repair and pending callout conversion model | E5-S1 through E5-S3 | Fully represented |
| AM handoff and estimate reference model | E6-S1 through E6-S3 | Fully represented |
| Reporting and completion tracking fields | E7-S1 through E7-S3 | Fully represented |
| Map geometry object model | E9-S2, E9-S3, E9-S4, E9-S6 | Fully represented |

### Intentional Out-of-Diagram Scope

The following stories are intentionally not expanded in diagram detail because they are policy/control overlays rather than runtime flow complexity:

1. E8-S1 Permission model for admin vs regional lead vs tech vs AM.
2. E8-S2 Audit logging for governance and routing actions.

Security and audit controls are treated as cross-cutting constraints applied to all diagrammed flows.

## Design Decisions to Reconfirm Live

- AM reassignment at checkout allowed from valid AM list.
- Photos are optional; structured description plus severity are required.
- No runtime SLA enforcement; performance tracked via dashboards/reports.

## Suggested Meeting Script (10-15 minutes)

1. Walk process flow and ask if any operational step is missing.
2. Confirm governance model in ERD (versioning, deltas, snapshot behavior).
3. Validate sequence branches and expected user/system messages.
4. Confirm handoff to build backlog and acceptance criteria.

## Build-Ready Artifacts

- Requirements decision lock-ins:
  - [../inspection_form_data_model.md](../inspection_form_data_model.md)
  - [../fsm_irrigation_requirements.md](../fsm_irrigation_requirements.md#L20)
  - [../../research/automation_flows_design.md](../../research/automation_flows_design.md)

- Diagrams:
  - [process_flow.mmd](process_flow.mmd)
  - [data_model.mmd](data_model.mmd)
  - [inspection_sequence.mmd](inspection_sequence.mmd)

- Diagram explainers:
  - [process_flow_explainer.md](process_flow_explainer.md)
  - [erd_explainer.md](erd_explainer.md)
  - [sequence_explainer.md](sequence_explainer.md)
