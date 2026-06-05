# Sequence Diagram Explainer

Reference diagram: inspection_sequence.mmd

## Purpose

This sequence shows runtime interaction order across dispatcher, technician, LWC, resolver, Salesforce data layer, completion flows, AM review, and ExtraWork handoff.

## Scope

- Appointment check-in through post-checkout AM actions.
- Branches for no-match resolver failure, submit soft-gate guidance, hard submit blockers, and asset-apply failure.
- Timing of when data becomes suggested versus confirmed callout records.

## How to Read It

1. Read top to bottom using step numbers.
2. Treat each participant lane as a system boundary.
3. For alt blocks, each branch is mutually exclusive runtime behavior.
4. Notes define constraints that must hold at that step.

## Runtime Guarantees Captured

- Resolver must return exactly one published set or fail.
- Service Appointment stores the resolved set and version at start.
- Runtime follows the current WOLI-first mobile flow from Work Order overview into the irrigation WOLI workspace.
- Map context is loaded from Salesforce `Map_Feature__c` through the selected-provider Map LWC and can accept ad hoc feature capture.
- Missing required assets invoke bootstrap mode before inspection proceeds.
- Suggested repairs are continuously updated and deduplicated during response entry.
- Required-question gaps trigger submit-time guidance and justification rather than a hard stop.
- Submit is hard-blocked only until callout policy and AM assignment are satisfied.
- Confirmed repairs/enhancements become pending callouts only after Submit Report review.
- Completion applies staged asset edits; failures create exceptions without losing inspection completion.

## Integration Boundaries

- ExtraWork is only engaged after AM review.
- No direct technician push to customer-facing estimate occurs at checkout.

## Out of Scope

- Transport protocol specifics (REST/event patterns).
- Retry schedules and dead-letter mechanics for failed automations.
- Notification channel implementation.

## Audience

- Developers implementing service orchestration.
- QA validating branch behavior and race-condition handling.
- Stakeholders confirming operational control points.

