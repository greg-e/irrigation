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
- Deterministic form resolution and hard-fail behavior on no-match.
- Bootstrap flow for missing asset inventory.
- Required-answer checkout gate.
- Suggested repair confirmation and AM ownership.
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
  - [../inspection_question_library.md](../inspection_question_library.md)
  - [../fsm_capability_validation.md](../fsm_capability_validation.md)

- Diagrams:
  - [process_flow.mmd](process_flow.mmd)
  - [data_model.mmd](data_model.mmd)
  - [inspection_sequence.mmd](inspection_sequence.mmd)

- Diagram explainers:
  - [process_flow_explainer.md](process_flow_explainer.md)
  - [erd_explainer.md](erd_explainer.md)
  - [sequence_explainer.md](sequence_explainer.md)
