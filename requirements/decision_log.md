# Irrigation Project — Decision Log

**Location:** `requirements/decision_log.md`
**Owner:** BA (G. Ehrenberg)
**Governance:** Updated on every material requirement change. This document is the tie-breaker when docs conflict.

---

## Artifact Governance Rules (DL-GOV-001)

**Date:** 2026-05-18 | **Owner:** BA | **Status:** Locked

| Rule | Decision |
|---|---|
| Governance model | Hybrid by domain: process in `requirements/`, UX in `research/`, execution in `stories/` |
| Conflict resolution | This decision log is the tie-breaker |
| Active canonical types | Data model + Process flow + Execution backlog (3 max) |
| Canonical authority | One canonical file per type |
| Non-canonical redirect | Non-canonical docs get a superseded header pointing to canonical |
| Archive behavior | Non-canonical docs moved to `archive/` subfolder within 24 hours of canonical update |
| Archive header format | Superseded by + rationale + decision log ID + date + owner |
| Update cadence | On every material requirement change |
| Archival owner | BA (G. Ehrenberg) |

**Canonical file assignments:**

| Domain | Canonical File | Role |
|---|---|---|
| Data model | `requirements/irrigation_data_dictionary.md` | Canonical Salesforce object and field reference |
| Process flow | `requirements/irrigation_prd_v2.md` | JTBD anchor, scope, and outcome definitions |
| Execution backlog | `stories/build_backlog.md` | Sprint execution authority |

---

## Architecture Decisions

### DL-001 — Inspection Data Model Canonical Promoted to Data Dictionary

**Date:** 2026-05-18 | **Owner:** BA | **Status:** Locked

`requirements/inspection_form_data_model.md` (v1, May 7) is superseded by `requirements/irrigation_data_dictionary.md` (v3, May 18). The data dictionary absorbed and expanded the inspection form schema into a unified canonical Salesforce object reference.

**Action:** `requirements/inspection_form_data_model.md` archived to `requirements/archive/`.

---

### DL-002 — Asset Architecture and Research Files Archived

**Date:** 2026-05-18 | **Owner:** BA | **Status:** Locked

`research/fsm_asset_architecture.md` and `research/fsm_asset_research.md` are superseded by `requirements/irrigation_data_dictionary.md` and `requirements/irrigation_prd_v2.md`. Architecture decisions have been absorbed into the canonical docs. Raw research is retained in archive for audit.

**Action:** Both files archived to `research/archive/`.

---

### DL-003 — PM Data Model Out of Scope

**Date:** Pre-existing | Formalized: 2026-05-18 | **Owner:** BA | **Status:** Locked

Maintenance Plans, Maintenance Assets, and Maintenance Work Rules are explicitly out of scope. Work Order generation is handled by an existing process; Maintenance Plans would add no value and introduce redundant configuration.

**Action:** `research/fsm_preventive_maintenance_data_model.md` archived to `research/archive/`.

---

### DL-004 — Stakeholder Follow-Up Questions Session Closed

**Date:** 2026-05-18 | **Owner:** BA | **Status:** Locked

`requirements/stakeholder_followup_questions.md` was a pre-call facilitation script for May 2026 stakeholder sessions. Session outcomes should be entered as individual DL entries here. The script is no longer active.

**Action:** File archived to `requirements/archive/`.

---

### DL-005 — ArcGIS Dropped; MVP Mapping Narrowed to Mapbox vs Google Maps

**Date:** May 2026 | Formalized: 2026-05-18 | **Owner:** BA | **Status:** Locked

ArcGIS is not the MVP spatial mapping path. Client has no existing ArcGIS Online org. Esri requires dual-platform licensing and ArcGIS Field Maps for offline mobile — unjustified at this scale.

**Active MVP candidates:** Mapbox GL JS vs Google Maps JavaScript API, both embedded in a custom LWC. Decision gate open pending cost estimate and offline behavior comparison.

**Reference:** `research/spatial_mapping_options.md` (active)

---

### DL-006 — Maintenance Plans Not Used

**Date:** Pre-existing | Formalized: 2026-05-18 | **Owner:** BA | **Status:** Locked

Maintenance Plans will not be used. Work Order generation is handled by an existing process. No redundant configuration.

---

### DL-007 — Service Appointment is the Inspection Container

**Date:** Pre-existing | Formalized: 2026-05-18 | **Owner:** BA | **Status:** Locked

Inspection header data lives on Service Appointment via custom fields. No separate `System_Checkup__c` object.

---

### DL-008 — Repair Callouts Are Work Order Line Items

**Date:** Pre-existing | Formalized: 2026-05-18 | **Owner:** BA | **Status:** Locked

Each issue found during inspection = one WOLI with extended custom fields. Repair callouts are not a separate object.

---

### DL-009 — WOLI-First Mobile Execution Pivot

**Date:** May 2026 | Formalized: 2026-05-18 | **Owner:** BA | **Status:** Locked

Mobile inspection uses a WOLI-first UX. WO Overview includes Service Appointment (collapsed default) and WOLI (expanded default). WOLI workspace uses DETAILS/RELATED/FEED tabs. Submit gated until: (1) Repair Callouts requirement met and (2) AM assigned.

**Reference:** `prototype/mobile/ui/fsm_mobile_inspection_standalone.html`

---

## Open Decision Gates

| ID | Topic | Gate Condition | Owner |
|---|---|---|---|
| GATE-001 | Spatial mapping: Mapbox vs Google Maps | Cost estimate + offline behavior comparison complete | BA |
| GATE-002 | Northeast discovery gap | NE stakeholder interviews held | BA |
| GATE-003 | Question library content lock | NE input incorporated | BA |

---

## New Entry Template

```
### DL-XXX — [Short title]

**Date:** YYYY-MM-DD | **Owner:** [Name/role] | **Status:** [Locked / Open / Reversed]

[Description of decision and rationale.]

**Supersedes:** [prior decision or doc, if applicable]
**Action:** [file changes, if any]
```
