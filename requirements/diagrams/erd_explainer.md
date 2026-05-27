# ERD Diagram Explainer

Reference diagram: data_model.mmd

## Purpose

This ERD defines the logical data architecture for irrigation inspections, including question governance, response capture, suggested repairs, staged asset edits, and exception handling.

## Scope

- Core Salesforce objects used in inspection and repair handoff.
- Custom objects introduced for question versioning, delta overlays, and runtime artifacts.
- Logical relationships (not full physical schema or index design).

## How to Read It

1. Start with Service Appointment as the inspection container.
2. Trace child objects for responses, suggestions, staged asset changes, and exceptions.
3. Follow question library objects for governance and published variant composition.
4. Follow callout path from confirmed suggestions to Work Order Line Item and AM handoff.

## Relationship Conventions

- One-to-many links model parent ownership and reporting joins.
- Self-reference on Asset models hierarchy.
- Self-reference on Inspection Question Set models pinned base-set inheritance.

## Key Entity Groups

- Inspection runtime data:
  - Service Appointment
  - Inspection Response
  - Irrigation Program
- Governance/configuration data:
  - Inspection Question
  - Inspection Question Set
  - Inspection Question Set Member
  - Inspection Question Set Delta
- Post-processing and controls:
  - Inspection Suggested Repair
  - Inspection Asset Change
  - Asset Sync Exception
  - Work Order Line Item

## Critical Design Rules Captured

- Published sets/questions are versioned and immutable.
- Set resolution is deterministic and snapshotted on Service Appointment.
- Regional/seasonal variation is represented as explicit deltas over pinned base versions.
- Suggested repairs are distinct from final pending callouts.
- Pending callouts preserve quantity and source-response traceability back to inspection evidence.
- Staged asset edits preserve before/after values and can fail independently of inspection completion.

## Out of Scope

- Validation rule formulas.
- Trigger/Flow implementation details.
- Security model (profiles, permission sets, field-level security).

## Audience

- Architects validating logical model integrity.
- Salesforce admins/developers planning object configuration.
- BI/reporting team mapping extract requirements.
