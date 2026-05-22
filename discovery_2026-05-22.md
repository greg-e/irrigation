# Irrigation Tool-of-Choice Definition

Date: 2026-05-22  
Owner: BA  
Status: Working draft

## JTBD (Jobs To Be Done)

1. When I arrive on-site with incomplete setup, help me start and complete an irrigation inspection without getting blocked.
2. When I find issues, help me capture actionable callouts fast so AM can act without clarification calls.
3. When I find no issues, help me complete with a defensible record using minimal effort.
4. When connectivity is poor, help me continue working and sync safely later.
5. When post-submit corrections are needed, help the branch update records without workflow bottlenecks.
6. When customer communication is generated, help us provide clear next actions while protecting internal-only details.

## Tool Recommendation Principles

1. No bottlenecks: default to soft warnings over hard stops unless compliance requires blocking.
2. Minimal required path: require only data needed for immediate actionability.
3. Inline recovery: if required setup is missing, create it inline in seconds.
4. Actionability over completeness: capture enough to act now and enrich later when safe.
5. Non-blocking governance: use traceability and follow-up queues instead of approvals in live flow.
6. Risk-weighted rigor: deeper mandatory detail only for safety-critical findings.
7. Field-first reliability: full offline minimum-path capture is mandatory.
8. Handoff-first defaults: AM first view should be prioritized action lists, not full record detail.
9. Customer-safe output: default communication excludes internal-only content.
10. Traceability without friction: edits and sync exceptions are visible and recoverable.

## Recommended Product Contract (Current)

### 1) Completion Contract

- Parent System Asset is required for completion.
- Completion requires one of:
  - At least one callout, or
  - Explicit No issues found.
- If Unknown asset is used on a callout, a context note is required at completion.

### 2) Missing Setup Behavior

- If Parent System Asset is missing, tech creates it inline.
- Inline Parent System Asset minimum fields:
  - Property
  - System Name
- Child assets can be added inline with name only.

### 3) Callout Contract

- Minimum required callout fields:
  - Callout type
  - Asset reference (or Unknown asset)
  - Short description
- Duplicate callouts should trigger soft warning only (no hard block).

### 4) Safety-Critical Contract

Safety-critical categories:
- Safety/compliance
- Active water loss
- Electrical/control hazards

Safety-critical callouts require:
- Severity
- Short description
- Asset reference
- Recommended action
- One photo

### 5) UX Defaults

- Default landing: Smart Start card.
- If Parent System Asset is missing, Smart Start primary action is Create Parent System Asset inline.
- Completion UX: single smart checklist showing only missing minimum requirements.
- Mobile callout view supports toggle between capture order and priority order.

### 6) Offline + Sync Contract

- Full offline capture for minimum path.
- Auto-sync when connectivity returns.
- Sync failures show a visible unsynced badge with tap-to-resolve queue.

### 7) Handoff + Customer Output Contract

- AM default first view: prioritized callout list with asset links and short descriptions.
- Default customer output: findings summary and recommended next actions.
- Exclude by default from customer output:
  - Internal severity logic
  - Raw technician notes
  - Preliminary cost language before AM review

### 8) Edit Governance Contract

- Post-submit edits are allowed for branch users.
- Post-submit edits require:
  - Reason code
  - Free-text justification
- Safety-critical edits should create non-blocking follow-up tasks.

## True Open Decisions

1. Smart Start primary action when Parent System Asset already exists.
2. Default routing target for safety-critical edit follow-up tasks.

## Non-Goals

- Pilot governance model
- Change-management plan
- KPI targets and enforcement policies
- Vendor/provider final selection decisions

## Decision Rule

Choose options that maximize field completion speed and AM actionability while avoiding hard workflow bottlenecks.
