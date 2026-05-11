# Stakeholder Follow-Up Questions — Mike, Alex, James

Targeted follow-up question set per stakeholder, updated after May 11 design lock-ins (custom-object question library, immutable published versions, deterministic set resolution, required-question checkout gate, suggested-repair confirmation flow, AM-required handoff, staged asset-change apply with exception handling).

**Date:** May 11, 2026
**Use:** Run live on a stakeholder call before final story slicing and pilot branch selection. Questions focus on unresolved policy/operational details, not decisions already locked.

> Call format: use this as a facilitator script. Capture explicit decisions, owners, and due dates in real time.

---

## Call Runbook (60 minutes)

### Suggested agenda
1. 0-5 min: Frame scope and confirm locked decisions (no re-open unless new evidence).
2. 5-15 min: Cross-cutting decisions (severity, AM policy, required-answer gate, offline/photo baseline).
3. 15-35 min: Region-specific decisions (Mike -> James -> Alex).
4. 35-50 min: Pilot branch nominations and adoption risks.
5. 50-60 min: Confirm decision log, owners, due dates, and document update assignments.

### Facilitation rules
1. Ask one decision question at a time; force a clear outcome: Yes / No / Depends.
2. If "Depends," capture the exact dependency and owner.
3. Park non-blocking ideas in a parking lot; do not derail decision flow.
4. End each section by reading back the decision and getting verbal confirmation.

### Decision capture shorthand

Use these tags during live note-taking:

- `[DECIDED]` final decision reached
- `[FOLLOW-UP]` unresolved; owner + due date assigned
- `[PARKED]` out of scope for this call

---

## What Is Already Locked (Do Not Re-open)

Use this list to avoid re-litigating decisions in follow-up calls.

1. Custom-object library path is final (no Salesforce Assessments path). *([requirements/inspection_form_data_model.md](inspection_form_data_model.md) §10)*
2. Published questions and sets are immutable; new versions are append-only. *([requirements/inspection_question_library.md](inspection_question_library.md) Locked Governance Decisions)*
3. Runtime set selection is deterministic by Region + Inspection Type/Season + Work Type, with hard fail on no match. *([requirements/diagrams/process_flow.mmd](diagrams/process_flow.mmd))*
4. Question-set version is snapshotted at inspection start and remains locked in-flight. *([requirements/diagrams/inspection_sequence.mmd](diagrams/inspection_sequence.mmd))*
5. Checkout is blocked until required questions are answered.
6. Suggested repairs are generated continuously and explicitly confirmed at checkout.
7. AM assignment is required before submit when confirmed callouts exist.
8. Staged asset changes apply on completion; apply failures create exceptions without losing inspection completion.

---

## Mike Trinidad — Florida (paper-form-to-digital benchmark)

**Context:** Mike already uses a digital form in FL. He's the closest to "production user" of any of our inputs. We have his field list mapped in [requirements/inspection_form_data_model.md](inspection_form_data_model.md) §7a.

### A. Form content / regional deltas
1. Walk us through your current FL digital form on one real recent inspection. Anything in our FL mapping still wrong in §7a? *(validates field-level mapping)*
2. Q6.11 "Overspray" appears in FL but not West Coast. Should this be a national baseline question or an FL-only delta? *([requirements/inspection_question_library.md](inspection_question_library.md))*
3. List your must-have conditional expanders ("if Yes, ask...") so we can finalize branching structures before publish.
4. Drip-specific content: separate subsection or conditional questions in Section 6?

### B. Notes, photos, and customer output
5. Internal vs customer-facing note split: does this match your actual workflow, or are you still writing one blended note set today?
6. What is the minimum customer-facing narrative needed in the PDF so customers no longer say "no comments/no suggestions"?
7. Photo expectations for FL: minimum evidence per inspection (none/targeted/high-volume) and whether captions are sufficient.

### C. Scheduling and pilot operations
8. Monthly capacity planning: can Dispatch Console + Crew Calendar satisfy your requirement, or do you still need a custom planning layer?
9. Preferred tech continuity fallback rule: ranked backup list, nearest qualified, or manager discretion?

### D. BV Connect and completion policy
10. BV Connect "empty boxes": should missing map artifacts block publish, or create a post-completion exception/flag only?
11. For non-BV-Connect customers, should customer PDF distribution be auto-email, manual-send, or no distribution by default?

### E. Adoption and pilot
12. Which FL branch should be first pilot branch (still Sanford, or changed)?
13. Top 3 day-one rejection risks from field techs, and what mitigation you want in pilot training.

---

## James Carr — West Coast (Excel report + training-org owner)

**Context:** James gave us the actual Excel "Irrigation Preventative Monthly Inspection Report." He's also a national-level training resource. Section 6 + Section 9 are now mirrored to his form. He explicitly offered help — "phone call, e-mail or text away." The workbook sample includes repeated controller blocks and zone rows extending to at least 96, with a partially filled example property ("City of Grapevine").

### A. Form content / completeness
1. Section 6 mirrors your 13 failure-mode columns. What is still missing from your report that must be in v1? *([requirements/inspection_form_data_model.md](inspection_form_data_model.md) §7b)*
2. Overspray absent in your sheet: intentional regional difference or missing item?
3. Programs A-D: is 4 programs enough for v1 UI, or must we support >4 at go-live?
4. Mobile UX for per-zone capture: acceptable to use one-zone-at-a-time card workflow instead of wide grid?
5. Rain/freeze as single Y/N: acceptable or must be split into separate fields?
6. Do you need an explicit action audit for operator-controlled toggles (backflow/meter/controller on-off)?
7. "Broken drip line" vs "Leaking Seal" label conflict: which canonical wording should library use?

### B. Governance ownership (critical unresolved)
8. Who is the named owner of publish authority for national question/set versions?
9. What is the approved change cadence: annual major, quarterly minor, and emergency hot-fix path?
10. Training alignment: does training conform to library versions, or can training lead library changes?

### C. Reclaimed water / pump stations / compliance
11. Reclaimed (purple-pipe) systems: separate variant or conditional block inside base set?
12. Pump station checks: new dedicated section now, or defer to post-v1 extension?
13. Backflow certificate: compliance object with expiry tracking, or attachment-only at v1?
14. CA/OR/WA reporting fields: what must be captured in form versus derived downstream?

### D. Tech-level attribution (your specific ask)
15. Is SA-level tech attribution enough, or do you require denormalized tech attribution on every callout and estimate line?

### E. Adoption / pilot
16. Which West Coast branch should pilot first?
17. Biggest objection expected from long-tenured techs, and which product behavior must be preserved to reduce pushback?

### F. Northeast / region coordination
18. Can you broker Northeast intros this week so we can validate content deltas before national publish? *([requirements/northeast_discovery_plan.md](northeast_discovery_plan.md))*

---

## Alex Chavez (California) — sheet received (May 11)

**Context:** Alex's workbook is now in discovery. It includes a summary tab and controller tabs (A-E) with a repair-price catalog and totals. One controller sample appears partially filled (site/address "intuitive # 109", controller name "node", inspection date 2/5/2026), while most controller metadata fields remain blank.

### A. Artifact validity / workflow intent
1. Confirm this is your current production sheet (not a draft/training copy).
2. Which fields are truly required at completion versus optional in day-to-day practice?
3. Is workbook lifecycle per visit, per month, or persistent across seasons?

### B. Data quality and required-field policy
4. Should Site Name and Irrigation Tech be hard-required before checkout?
5. Controller metadata mostly blank in sample: intentional optional capture, or a compliance gap we must enforce?
6. "Controller has remote harness" and "Controller has map": required booleans or optional annotations?
7. Expected distribution of visits: inspection-only versus repairs-recommended versus immediate in-contract repair.

### C. Repair catalog and pricing governance
8. Who owns the repair catalog prices and update approval?
9. One CA statewide list or separate NorCal/SoCal pricing variants?
10. For uncatalogued issues, should we support controlled "Other" callout categories or unrestricted free text?

### D. Workflow / cadence and data shape
11. Is CA cadence closer to per-property quarterly or per-controller monthly?
12. Preferred Salesforce mapping: one SA with child controller scope, or one SA per controller?
13. Do you need separate completion outcomes for "no repairs" and "repairs recommended"?

### E. CA-specific compliance and platform profile
14. Which CA compliance fields are mandatory for operations/reporting but missing from current workbook (MWELO, utility mandates, drought stage)?
15. Recycled/purple-pipe: dedicated variant or conditional branch in CA base set?
16. Which smart-controller platforms must be explicitly captured in v1 data model?

### F. Adoption / pilot
17. Can we schedule a 30-minute walkthrough using a fully completed real inspection sample?
18. Which CA branch should run first pilot?

---

## Observed Data Completeness Snapshot (May 11)

Evidence from the newly added form files, used to prioritize follow-up questions.

### Alex Chavez form observations
1. Summary tab labels exist for Site Name, Irrigation Tech, and Date, but corresponding values appear blank in the sampled workbook.
2. Controller A has partial metadata only: Site/Address = "intuitive # 109", Controller Name = "node", Inspection Date = "2/5/2026".
3. Controller A-E tabs all include the same metadata prompts (remote harness, map, water type, backflow spec, serial, make/model, location), but most values are blank.
4. Controller A-E tabs all show REPAIRS TOTAL = $0, SYSTEM UPGRADE TOTAL = $0, and TOTAL ESTIMATE = $0 in the sampled workbook.

### James Carr form observations
1. Workbook is primarily template-style, with repeated monthly inspection blocks and repeated program A-D footer sections.
2. Partial sample values appear (for example, Property Name = "City of Grapevine"), but most per-zone and controller detail fields are blank in sampled rows.
3. Repeated header blocks indicate potential multi-range zone handling beyond 32 zones (for example, 1-32, 33-64, 65-96 style layout), which requires explicit modeling confirmation.
4. Failure-mode labels are not fully consistent across repeated sections (for example, one section uses "Broken drip line" while another uses "Leaking Seal" in a comparable slot).

### Design implication
1. Current workbook evidence suggests "template + partial completion" behavior. Required-field policy, prefill strategy, and controller-level completion gates need explicit stakeholder sign-off before LWC validation is finalized.

---

## Cross-cutting questions (ask all three)

Run this block first while everyone is on the line.

1. **Required-answer gate tolerance.** Are you comfortable hard-blocking checkout when required answers are incomplete, including in high-volume field days?
2. **Suggested repair review UX.** Is confirm/dismiss/merge enough, or do you need additional queue actions in review?
3. **Severity taxonomy.** Can we standardize to a single severity set across all regions?
4. **AM assignment policy.** Should AM assignment be account-default with override, branch-default with override, or always manual?
5. **Photo baseline.** Region minimum: none, one-per-callout, or documented evidence set.
6. **Offline reality.** Percent of jobs with poor/no signal and expected offline session duration.
7. **Replacement acceptance criteria.** Top 3 must-haves and top 3 deal-breakers to replace current process.
8. **Pilot branch nomination.** One branch per region for Phase 2 pilot.
9. **Unknown unknowns.** What are we still not asking that creates the highest rollout risk?

---

## Suggested Talk Track (Facilitator Prompts)

Use these to keep the call moving and avoid ambiguity.

1. "We are not reopening locked architecture decisions unless there is net-new evidence. Agreed?"
2. "For each question, I need a decision, not just discussion. If unresolved, we assign owner and due date before we move on."
3. "When answers vary by region, we will treat that as a delta decision, not a blocker to national baseline."
4. "Before we leave each section, I will read back what we decided and who owns follow-through."

---

## Live Decision Log (Use During Call)

Paste updates into this table in real time.

| Topic | Stakeholder(s) | Decision (Yes/No/Depends) | Notes / Dependency | Owner | Due Date |
|---|---|---|---|---|---|
| Required-answer gate tolerance | All |  |  |  |  |
| Severity taxonomy standard | All |  |  |  |  |
| AM assignment policy default | All |  |  |  |  |
| Photo evidence baseline | All |  |  |  |  |
| Offline expected duration | All |  |  |  |  |
| FL overspray national vs delta | Mike |  |  |  |  |
| West program count limit (>4?) | James |  |  |  |  |
| CA SA mapping model | Alex |  |  |  |  |
| Pilot branches (FL/West/CA) | All |  |  |  |  |

---

## Tracking

After the call, update the source docs within 24 hours:

1. [requirements/inspection_question_library.md](inspection_question_library.md) (remaining open questions and governance ownership)
2. [requirements/inspection_form_data_model.md](inspection_form_data_model.md) §11 (remaining open questions)
3. [stories/build_backlog.md](../stories/build_backlog.md) (story acceptance criteria deltas)

| Q# | Stakeholder | Topic | Decision | Owner | Due Date | Doc Updated |
|---|---|---|---|---|---|---|
| | | | | | | |
