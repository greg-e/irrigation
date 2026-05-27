# Process Flow Diagram Explainer

Reference diagram: process_flow.mmd

## Purpose

This diagram shows the end-to-end irrigation inspection operating flow from work generation through AM review and estimate handoff.

## Scope

- Includes upstream Phase 1 context, field execution, checkout controls, post-visit automation, and downstream estimate/repair routing.
- Includes WOLI-first mobile execution, current submit blockers, and failure handling decided in the latest repo decisions.

## How to Read It

1. Read top to bottom by numbered subgraph sections.
2. Follow decision diamonds for branch behavior.
3. Treat red-path style nodes labeled as block/fail as intentional guardrails.

## Color Legend

- Phase containers (blue): major lifecycle stages.
- Salesforce records/automation (orange): core platform entities and flows.
- Mobile/LWC actions (green): technician runtime interactions.
- External systems (lavender): Oracle CPQ, ExtraWork, and reporting outputs.
- Decision nodes (yellow): deterministic branch points and quality gates.
- Done/reporting nodes (light green): terminal outcomes and monitoring sinks.

## Critical Rules Captured

- Map context is a selected-provider Map LWC backed by Salesforce `Map_Feature__c` (point/polygon/line), available during desktop/mobile execution.
- Mobile execution is WOLI-first: the technician works from the irrigation WOLI workspace after opening the Work Order overview.
- Question set must resolve to exactly one published match.
- No-match condition fails loudly with explicit admin next steps.
- Selected question set version is snapshotted at inspection start and stays locked.
- Bootstrap mode is used when required asset types are missing.
- Required questions are advisory at submit time; unanswered items trigger a justification/helper flow rather than a hard stop.
- Hard submit blockers are callout policy compliance (`1+` callout or `No Issues Found`) and AM assignment.
- Suggested repairs and enhancements are generated continuously, then explicitly confirmed during Submit Report review.
- Pending callout WOLIs are created only when actionable findings are confirmed.
- Asset apply failures do not discard inspection completion; exception is recorded.

## Out of Scope

- Screen-level UX wireframes.
- Detailed field mappings for every integration payload.
- SLA policy definitions (tracked through dashboards/reports, not runtime enforcement).

## Audience

- BA and solution architect for requirement validation.
- Admin/developer team for implementation planning.
- Operations leadership for process accountability.

