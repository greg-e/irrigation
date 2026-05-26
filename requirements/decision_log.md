# Irrigation Project — Decision Log

**Location:** `requirements/decision_log.md`
**Owner:** BA (G. Ehrenberg)
**Governance:** Updated on every material requirement change. This document is the tie-breaker when docs conflict.

Day-to-day current view: `requirements/current_state.md`

---

## Table of Contents

1. [Current Canonical Snapshot (Active)](#current-canonical-snapshot-active)
2. [Artifact Governance Rules (DL-GOV-001)](#artifact-governance-rules-dl-gov-001)
3. [Architecture Decisions](#architecture-decisions)
4. [Open Decision Gates](#open-decision-gates)
5. [New Entry Template](#new-entry-template)
6. [Gate Update Template](#gate-update-template)

Latest Decisions:
- [DL-014](#dl-014)
- [DL-013](#dl-013)
- [DL-012](#dl-012)

---

## Current Canonical Snapshot (Active)

**Snapshot owner:** BA (G. Ehrenberg)
**Update trigger:** Update this snapshot on the same day any canonical authority decision is set to Locked or Reversed.

| Domain | Active Canonical File | Active Decision Source |
|---|---|---|
| Data model | `requirements/fsm_irrigation_requirements.md` | DL-001 (Locked) |
| Process flow | `requirements/prd_v3.1.md` | DL-012 (Locked) |
| Execution backlog | `stories/build_backlog.md` | DL-012 (Locked) |

**Use rule:** This snapshot reflects the most recent locked decisions. Historical entries remain authoritative for chronology and audit.

---

## Artifact Governance Rules (DL-GOV-001)

Historical reference only: use **Current Canonical Snapshot (Active)** above for current authority.

**Date:** 2026-05-18 | **Owner:** BA | **Status:** Reversed

| Rule | Decision |
|---|---|
| Governance model | Hybrid by domain: process in `requirements/`, UX in `research/`, execution in `stories/` |
| Conflict resolution | This decision log is the tie-breaker |
| Active canonical types | Data model + Process flow + Execution backlog (3 max) |
| Canonical authority | One canonical file per type |
| Non-canonical redirect | Non-canonical docs get a superseded header pointing to canonical |
| Archive behavior | Non-canonical docs moved to `archive/` subfolder within 24 hours of canonical update |
| Archive header format | Superseded by + rationale + decision log ID + date + owner |
| Reversed-entry cleanup | Reversed entries may be deleted after a summary DL entry is Locked and explicitly references the removed entry IDs. |
| Update cadence | On every material requirement change |
| Archival owner | BA (G. Ehrenberg) |

**Canonical file assignments:**

| Domain | Canonical File | Role |
|---|---|---|
| Data model | `requirements/fsm_irrigation_requirements.md` | Canonical Salesforce object and field reference |
| Process flow | `requirements/irrigation_prd_v2.md` | JTBD anchor, scope, and outcome definitions |
| Execution backlog | `stories/build_backlog.md` | Sprint execution authority |

**Reversal note:** Reversed by DL-012 on 2026-05-22.

---

## Architecture Decisions

### DL-001 — Inspection Data Model Canonical Promoted to Data Dictionary

**Date:** 2026-05-18 | **Owner:** BA | **Status:** Locked

`requirements/inspection_form_data_model.md` (v1, May 7) is superseded by `requirements/fsm_irrigation_requirements.md` (metadata baseline sections). The dictionary content was consolidated into the requirements file to keep one canonical Salesforce object reference.

**Action:** `requirements/inspection_form_data_model.md` archived to `requirements/archive/`.

---

### DL-002 — Asset Architecture and Research Files Archived

**Date:** 2026-05-18 | **Owner:** BA | **Status:** Reversed

`research/fsm_asset_architecture.md` and `research/fsm_asset_research.md` are superseded by `requirements/fsm_irrigation_requirements.md` and `requirements/irrigation_prd_v2.md`. Architecture decisions have been absorbed into the canonical docs. Raw research is retained in archive for audit.

**Action:** Both files archived to `research/archive/`.

**Reversal note:** Reversed by DL-013 on 2026-05-22.

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

**Reference:** `prototype/mobile/mobile_v3.1.html`

---

## Open Decision Gates

| ID | Topic | Gate Condition | Owner | Target Date | Last Reviewed |
|---|---|---|---|---|---|
| GATE-001 | Spatial mapping: Mapbox vs Google Maps | Cost estimate + offline behavior comparison complete | BA | 2026-06-07 | 2026-05-22 |
| GATE-004 | PDF strategy in R1 | Decision recorded: Apex/VF fallback vs licensed doc-gen approach | BA | 2026-06-07 | 2026-05-22 |
| GATE-005 | Required-answer edge policy | Decision recorded: hard block vs soft warning with reason | BA | 2026-06-07 | 2026-05-22 |
| GATE-002 | Northeast discovery gap | NE stakeholder interviews held | BA | 2026-06-14 | 2026-05-22 |
| GATE-006 | AM assignment defaulting model | Decision recorded by account/branch rule | BA | 2026-06-14 | 2026-05-22 |
| GATE-003 | Question library content lock | NE input incorporated | BA | 2026-06-21 | 2026-05-22 |
| GATE-007 | Regional photo baseline by callout type | Baseline matrix approved for pilot branches | BA | 2026-06-21 | 2026-05-22 |
| GATE-008 | Customer portal license timing | Experience Cloud license timing and rollout gate approved | BA | 2026-06-28 | 2026-05-22 |

---

### DL-010 — Pipe Modeled as Attributes on System and Zone

**Date:** 2026-05-19 | **Owner:** BA (field operator input) | **Status:** Locked

Pipe is not modeled as a separate Asset component type. Instead, pipe-related metadata is stored as attributes (custom fields) on System and Zone Asset records:
- **System-level pipe:** `Mainline_Pipe_Type__c` (e.g., PVC, Poly, Copper); `Mainline_Pipe_Size__c` (e.g., 1", 1.5")
- **Zone-level pipe:** `Zone_Lateral_Type__c` (e.g., Soaker, Drip, Spray); `Zone_Lateral_Size__c`
- Mainline inspection is captured as a question in Section 7 of the inspection form (visible leak observation + notes)
- Zone-level distribution method is captured per-zone in Section 6 (Q6.3: Spray/Rotor/Bubbler/Drip)

**Rationale:** Field teams report that pipe data is descriptive/operational context, not a discrete component requiring serial numbers, repair history, or independent asset lifecycle. Storing as attributes keeps setup fast and hierarchy flat. Pipe geometry (mainline routing, lateral branches) is captured in spatial map as polylines on `Map_Feature__c`, not as a separate Asset.

**Supersedes:** Deprecated Pipe as Asset Type in [fsm_irrigation_requirements.md](fsm_irrigation_requirements.md)
**Action:** Remove Pipe from Asset_Type picklist domain; add pipe attributes to System and Zone metadata sections in [fsm_irrigation_requirements.md](fsm_irrigation_requirements.md).

---

### DL-011 — Mobile Prototype Refinement Decisions (FSM Irrigation)

**Date:** 2026-05-21 | **Owner:** BA (G. Ehrenberg) | **Status:** Locked

Refinement decisions captured for the mobile prototype in [prototype/mobile/mobile_v3.1.html](../prototype/mobile/mobile_v3.1.html). This entry records selected behavior and UX direction prior to implementation.

**Selected decisions:**
- Submit callout gate accepts any callout type (Repair or Enhancement) or No irrigation issues found.
- Single source of truth for asset creation: full-screen New Asset flow.
- Callout resolve behavior: conditional status reset only when issue fixed on-site is confirmed.
- Re-enable native mobile map interactions for this standalone prototype.
- Required questions gate: soft gate with required justification when unanswered.
- AM assignment flow: auto-assign on selection with separate clear action.
- Remove browser-native dialogs; use only in-app modal/toast patterns.
- Post-submit navigation: show success choice to stay on WOLI or return to WO.
- WOLI/WO progress uses weighted model rather than binary gate.
- No issues toggle remains visible; disabled with guidance when open callouts exist.
- Non-irrigation WOLI handling: show sections collapsed with lock badges and not applicable guidance.
- Map/list mode: keep list mode as automatic fallback only when map fails.
- Resolved callouts retained as history (not deleted).
- Add compact visible stage tracker in WOLI header.
- Standardize map language to vendor-neutral spatial terminology.
- Add unsaved-changes confirmation to New Asset sheet.
- Callout history location: same Callouts list with resolved subsection.
- Remove legacy inline GIS create implementation; keep full-screen New Asset implementation.
- Provide two reset options: Reset Inspection (soft) and Reset All Data (hard).
- Progress weighting selected: 60% checklist, 20% callout policy, 20% AM assignment.

**Implementation note:**
- Implementation intentionally deferred in this step; code changes are not included in DL-011.

---

<a id="dl-012"></a>
### DL-012 — Process Canonical Reassigned to PRD v3.1

**Date:** 2026-05-22 | **Owner:** BA (G. Ehrenberg) | **Status:** Locked

Process-flow canonical authority is reassigned from `requirements/irrigation_prd_v2.md` to `requirements/prd_v3.1.md`.

Execution-backlog canonical authority is confirmed as `stories/build_backlog.md` for sprint execution governance.

**Rationale:** `requirements/prd_v3.1.md` is the active consolidated implementation baseline and now carries the current scope, architecture baseline, release plan, and open decisions.

**Supersedes:** DL-GOV-001 (process and execution-backlog canonical assignments)
**Action:** Treat `requirements/prd_v3.1.md` as canonical process reference and `stories/build_backlog.md` as canonical execution backlog reference for active delivery.

---

<a id="dl-013"></a>
### DL-013 — Archived Architecture Lineage Updated to PRD v3.1

**Date:** 2026-05-22 | **Owner:** BA (G. Ehrenberg) | **Status:** Locked

Lineage for archived architecture research (`research/fsm_asset_architecture.md`, `research/fsm_asset_research.md`) is updated so active process reference points to `requirements/prd_v3.1.md`, with `requirements/fsm_irrigation_requirements.md` remaining canonical for data-model authority.

**Rationale:** Prior lineage pointed to legacy process reference. Updating lineage keeps archive traceability aligned to current canonical process baseline.

**Supersedes:** DL-002
**Action:** Use `requirements/fsm_irrigation_requirements.md` + `requirements/prd_v3.1.md` as the active superseding pair for archived architecture research.

---

<a id="dl-014"></a>
### DL-014 — Governance Maintenance Bundle (Session Summary)

**Date:** 2026-05-22 | **Owner:** BA (G. Ehrenberg) | **Status:** Locked

This entry consolidates governance maintenance updates completed during the May 22, 2026 decision-log review session.

**Included changes:**
- Added `Current Canonical Snapshot (Active)` for fast active-state reference.
- Added snapshot ownership and same-day update trigger rules.
- Marked legacy governance lineage as historical/reversed and anchored active authority through replacement entries.
- Aligned PRD governance language so `requirements/decision_log.md` is the tie-breaker in conflicts.
- Made `Open Decision Gates` the single authority for open decision tracking.
- Expanded gate tracking with `Target Date` and `Last Reviewed` columns.
- Added weekly gate review cadence and explicit target-date reset rule requiring a same-day DL entry.
- Added a dedicated gate update template for consistent gate change records.

**Rationale:** Bundle-level summary improves audit readability by providing one anchor for this governance refactor while preserving detailed line-item changes in the referenced entries and tables.

**Supersedes:** N/A (session summary)
**Action:** Continue using granular DL entries for future decision changes; use this entry as the audit anchor for the May 22 governance refactor batch.

---

## New Entry Template

Template note (forward-only): use inline code-style repo-relative paths for file references in new entries; do not refactor historical entries for style consistency.
Ordering rule (forward-only): place newest DL entries first (reverse chronology) within the decision section.

```
### DL-XXX — [Short title]

**Date:** YYYY-MM-DD | **Owner:** [Name/role] | **Status:** [Locked / Open / Reversed]
**Related Gate:** [GATE-00X / N/A]

[Description of decision and rationale.]

**Supersedes:** [prior decision or doc, if applicable]
**Action:** [file changes, if any]
```

### Gate Update Template

```
### DL-XXX — Gate Update: GATE-00X [Short title]

**Date:** YYYY-MM-DD | **Owner:** [Name/role] | **Status:** [Locked / Open / Reversed]

**Gate:** GATE-00X
**Change Type:** [Close Gate / Reset Target Date / Change Gate Condition]
**Prior Target Date:** YYYY-MM-DD
**New Target Date:** YYYY-MM-DD
**Rationale:** [Reason for closure or reset]

**Supersedes:** [prior gate update entry, if applicable]
**Action:** [decision_log table updates and any linked doc updates]
```
