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
iauditor.com
### A. Form content / regional deltas
1. Walk us through your current FL digital form on one real recent inspection. Anything in our FL mapping still wrong in §7a? *(validates field-level mapping)*
2. Q6.11 "Overwatering" appears in FL but not West Coast. Should this be a national baseline question or an FL-only delta? *([requirements/inspection_question_library.md](inspection_question_library.md))*
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

## James Carr — West Coast (Excel report + training-org owner)

**Context:** James gave us the actual Excel "Irrigation Preventative Monthly Inspection Report." He's also a national-level training resource. Section 6 + Section 9 are now mirrored to his form. He explicitly offered help — "phone call, e-mail or text away." The workbook sample includes repeated controller blocks and zone rows extending to at least 96, with a partially filled example property ("City of Grapevine").

### A. Form content / completeness
1. Section 6 mirrors your 13 failure-mode columns. What is still missing from your report that must be in v1? *([requirements/inspection_form_data_model.md](inspection_form_data_model.md) §7b)*
2. Overwatering absent in your sheet: intentional regional difference or missing item?
3. Programs A-D: is 4 programs enough for v1 UI, or must we support >4 at go-live?
4. Mobile UX for per-zone capture: acceptable to use one-zone-at-a-time card workflow instead of wide grid?
5. Rain/freeze as single Y/N: acceptable or must be split into separate fields?
6. Do you need an explicit action audit for operator-controlled toggles (backflow/meter/controller on-off)?
7. "Broken drip line" vs "Leaking Seal" label conflict: which canonical wording should library use?

### B. Governance ownership
8. ~~Who is the named owner of publish authority for national question/set versions?~~ `[DECIDED — Carr call May 13, 2026]` James Carr volunteered as national library owner and steward, pending official role expansion from leadership. Regional leads may draft; Carr holds publish authority.
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

### G. Carr Transcript Notes (Complete, May 13, 2026)
Source: discovery call transcript [discovery/carr_feedback.vtt](discovery/carr_feedback.vtt), reviewed end-to-end (00:00 to 55:04).

#### Key signals from Carr (high confidence, verbatim-sourced)
1. Two-tier form model - loud validation
He independently named exactly what you have:

PMI (Preventative Maintenance Inspection) = simplified routine check. Controller name, zone count, what's wrong per zone. "Even the lowest-tech technician can use it."
Full assessment = new property onboarding, or an in-depth assessment for extra work revenue. Think "irrigation book" - the 500-page manual book he's been doing by hand for 400-home sites.
This mirrors the design direction. You have alignment.

2. The Pronto Forms failure is the North Star anti-pattern
He named it directly: previous app loaded every possible question, techs were supposed to skip irrelevant ones, nobody used it. His framing: "with technology we've got to make it super simple." The question library / conditional rendering design addresses exactly this.

3. Google My Maps is the actual field benchmark for mapping
Not Esri. Not WeatherMatic. Google My Maps - because it's "Fisher Price," any tech can use it, and it exports KML. His teams are literally using a spreadsheet + map link per property. This is a strong signal that the bar for the Map LWC is: easy enough for the most tech-resistant person on the team. The E9-S1 acceptance criteria around form factor and E9-S4 GPS pin simplicity are directly validated.

4. Desktop pinning is explicitly required
He asked directly: "Will they have the ability to put a pin at a desktop?" - because techs often have no signal in the field and come back to the office to pin. This validates the desktop authoring story (E9-S3) as a hard requirement, not a nice-to-have.

5. Enhancement callouts, not just repair callouts
He pushed on this: "for every controller you should have a list of upgrades or enhancements the AM can use to build a relationship." You confirmed it's on your list. Worth checking whether the current callout model in E5 has a callout type of Enhancement vs Repair - if not, that's a gap.

6. Accountability/reporting dashboard is a personal priority
He asked about access to completion status like QSA reports - who's done, who hasn't. That's E7-S3 territory. He framed it explicitly as a revenue accountability tool, not just ops reporting.

7. Terminology can be nationalized - regional deltas only on approach
He shut down the "every region is different" objection definitively. Terms and principles are the same everywhere. What varies: winterization seasons, piping material, California spray vs drip, NJ/TX licensing. This validates the pinned base + delta model (E1-S3) architecturally. Base question set is national; regional deltas handle seasonal/approach differences.

8. James Carr as the national question library owner
He volunteered it: "I would try to take ownership of it... I'm just waiting on the official thumbs up." This resolves the open question of who owns publish authority for E1-S4. Carr = designated admin; regional leads = draft creators only.

Gaps this surfaces for the backlog:

| Gap | Where it lands |
|---|---|
| Callout type needs Enhancement value alongside Repair | E5-S1/S2 - add Enhancement as a confirmed callout type |
| Map LWC complexity bar must be "Google My Maps level" - explicitly documented as a UX guardrail | E9-S1 acceptance criteria / UX guardrails doc |
| Desktop pin authoring is hard-required, not just preferred | E9-S3 already covers it - but should be noted as explicitly validated |
| Question library owner is James Carr (pending official role expansion) | Stakeholder doc / E1-S4 notes |

### H. Trinidad Transcript Notes (Complete)
Source: follow-up transcript [discovery/trinidad_followup.vtt](discovery/trinidad_followup.vtt), reviewed end-to-end.

#### Key signals from Trinidad (high confidence, verbatim-sourced)
1. Living, customer-accessible inspection history is the target output
He contrasted static PDF reports with always-available digital inspection history and said the report should be "living, breathing" inside customer experience.

2. Per-house accountability is operationally mandatory
He described board-level requirements for inspection at the home level, not street-level sampling, and called out high weekly volume pressure.

3. Current branch workflow uses iAuditor with voice and media capture
He confirmed tablet/field inspection execution with voice-to-text and photo/video evidence, replacing older manual habits.

4. Mapping and zone context are still largely manual artifacts
He described branch-created map outputs that guide timer/master valve flow but are not a dynamic system-of-record experience for field teams.

5. Visual cues and rapid escalation matter in execution
He highlighted overwatering/line-break cues as actionable red flags that should trigger immediate follow-up, not end-of-cycle review.

6. FSM irrigation penetration at Sanford is incomplete
He explicitly noted irrigation manager transition and said he was not aware that FSM had fully reached irrigation workflow at branch level.

7. Weekly cadence and completion accountability need stronger enforcement
He called out friction around missed-inspection claims and requested a recurring cadence that makes expected completion unambiguous.

8. Sanford pilot ownership path is clear
He identified Andrew McCall as a willing lead and named supporting stakeholders (Carlos Victoria, Edwin Gonzalez) as practical pilot participants.

9. Customer self-service filtering is a differentiator
He emphasized value when property managers can directly filter and view recent inspections without manager-mediated report prep.

10. Revenue leakage and approval latency are tied to reporting friction
He described repair revenue being lost after approval/cost friction, reinforcing need for faster, clearer evidence and approval flow.

Gaps this surfaces for the backlog:

| Gap | Where it lands |
|---|---|
| Customer-visible, filterable living inspection history (vs static snapshots) | E7 reporting/portal integration scope |
| Per-house scheduling and completion enforcement at scale | Core SA cadence and completion model |
| Alert/escalation path for visual red flags (overwatering, breaks) | Inspection runtime + AM notification flow |
| Digital map/system context replacing branch-local static artifacts | E9 map experience and data model adoption |
| Sanford pilot stakeholder package (Andrew/Carlos/Edwin) formalized | Pilot planning and rollout workstream |
| Strong weekly accountability signal for missed-inspection disputes | E7 dashboard + operational cadence instrumentation |

### I. Alex Transcript Notes (Complete)
Source: follow-up transcript [discovery/Alex_FollowUp.vtt](discovery/Alex_FollowUp.vtt), reviewed end-to-end.

#### Key signals from Alex (high confidence, verbatim-sourced)
1. Excel-on-tablet PMI workflow is the current operating baseline
He described a tech arriving on site, finding controller(s), and completing the inspection form on a tablet using Excel.

2. Map production is valuable but a major throughput bottleneck
He described manual map production (Google Slides/PDF workflows) as useful in the long run but currently too time-intensive for handoff volume.

3. Clients increasingly require photo-backed, location-specific evidence
He said clients are asking for photos and mapped break locations for each issue, which increases admin burden but drives trust and approvals.

4. Approval threshold behavior is driving manual SO splitting
He described breaking work into sub-threshold chunks (for example, under $2,500) because those approvals move faster than larger bundled requests.

5. Resistance checks are a critical frontline diagnostic
He described controller-terminal resistance checks up front to identify wire/solenoid risk before station activation.

6. Separate ad hoc work-order flow exists outside PMI structure
He described a distinct work-order form without embedded pricing, requiring manual aggregation of hours/parts afterward.

7. Emergency response is rule-based and billable
He described on-call response with a minimum-hours charging model, indicating clear business-rule candidates for system codification.

8. Compliance timing (ASIR/recycled-water context) can accelerate repair approvals
He described using compliance certification pressure windows to drive client action on broken distribution issues.

9. Smart-controller ecosystem is multi-vendor and noisy
He listed multiple controller platforms and described alert overload, with many alerts effectively buried by email volume.

10. Proposal generation volume is high and paperwork is the bottleneck
He described aggressive extra-work targets and indicated proposal/admin overhead, not field diagnosis, is the limiting factor.

Gaps this surfaces for the backlog:

| Gap | Where it lands |
|---|---|
| Replace Excel tablet workflow with structured mobile capture while preserving speed | Mobile inspection UX and schema alignment |
| Automate photo/map attachment from field context to callout/proposal records | E5/E6 handoff and proposal evidence model |
| Encode approval-threshold routing to reduce manual SO splitting overhead | AM review and quote routing logic |
| Support per-controller/per-zone evidence packaging for faster approvals | Reporting + quote artifact generation |
| Consolidate/filter multi-platform controller alerts to reduce alert blindness | Monitoring integration and notification governance |
| Convert email/folder paperwork burden into tracked system workflow | E6 operations workspace and lifecycle state model |
| Add compliance-aware prompts/windows to motivate timely corrective work | Question set variants + operational reminders |
| Capture and trend diagnostic resistance data for repeat-failure insight | Asset/inspection telemetry extension |

---

## Alex Chavez (California) — sheet received (May 11)

**Context:** Alex's workbook is now in discovery. It includes a summary tab and controller tabs (A-E) with a repair-price catalog and totals. One controller sample appears partially filled (site/address "intuitive # 109", controller name "node", inspection date 2/5/2026), while most controller metadata fields remain blank.

### A. Lead walkthrough (start condition -> final output)
1. Please take us through one fully completed real irrigation evaluation from initial site/start condition to final output (repairs, totals, customer-facing deliverable, and handoff).
2. Which fields are truly required at completion versus optional in day-to-day practice?
3. Is workbook lifecycle per visit, per month, or persistent across seasons?

### B. Repair catalog and pricing governance
4. Who owns the repair catalog prices and update approval?
5. For uncatalogued issues, should we support controlled "Other" callout categories or unrestricted free text?

### C. Completion outcomes and CA-specific requirements
6. Do you need separate completion outcomes for "no repairs" and "repairs recommended"?
7. Which CA compliance fields are mandatory for operations/reporting but missing from current workbook (MWELO, utility mandates, drought stage)?
8. Which smart-controller platforms must be explicitly captured in v1 data model?

### D. Adoption / pilot
9. Which CA branch should run first pilot?

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
| FL overwatering national vs delta | Mike |  |  |  |  |
| West program count limit (>4?) | James |  |  |  |  |
| CA SA mapping model | Alex |  |  |  |  |
| Pilot branches (FL/West/CA) | All |  |  |  |  |
| **National question library owner** | James Carr | Yes — Carr volunteered | Pending official role expansion from leadership | James Carr | TBD |
| **Callout type taxonomy (Repair vs Enhancement)** | All | Confirmed — both types needed | Carr: techs must document "beyond what's broken" enhancements per controller for AM pipeline | Greg | Before E5 story slice |

---

## Tracking

After the call, update the source docs within 24 hours:

1. [requirements/inspection_question_library.md](inspection_question_library.md) (remaining open questions and governance ownership)
2. [requirements/inspection_form_data_model.md](inspection_form_data_model.md) §11 (remaining open questions)
3. [stories/build_backlog.md](../stories/build_backlog.md) (story acceptance criteria deltas)

| Q# | Stakeholder | Topic | Decision | Owner | Due Date | Doc Updated |
|---|---|---|---|---|---|---|
| | | | | | | |

---

## Alex Chavez Call Capture (May 12, 2026)

Captured live in one-question-at-a-time format.

| Q# | Question Topic | Alex Answer (Captured) | Evaluation | Notes / Impact |
|---|---|---|---|---|
| 1 | End-to-end evaluation walkthrough | Site arrival -> safety check -> start at controller -> verify map/water type/backflow spec -> note plants/distribution type -> resistance test each zone -> make on-the-spot adjustments -> customer priorities by zone -> collect pictures + map locations -> share workbook + photo folder -> Alex or lead tech creates ExtraWork Proposal | DECIDED | Strong operational flow. Requires zone-level photo/map linkage and explicit handoff state to proposal process. |
| 2 | Required vs optional completion fields | Minimal required per zone callout: (1) issue category, (2) severity, (3) recommendation, (5) photo. Cost estimate and map location are optional. | DECIDED | Cost and map location are optional at minimum checkout — but photo is required, so photo upload flow must work fully offline on Galaxy tablets. |
| 3 | Workbook lifecycle | Ad hoc | DECIDED | Define trigger rules for creating new inspections to preserve trend/history quality. |
| 4 | Repair catalog pricing owner | Alex | DECIDED | Add backup approver policy for coverage. |
| 5 | Uncatalogued issue handling | "Other" plus notes | DECIDED | Hybrid approach preserves reporting consistency with field flexibility. |
| 6 | Completion outcomes | Include explicit "no repairs needed" and also track improvements when not broken | DECIDED | Suggested outcomes: (1) no repairs/no improvements, (2) no repairs/improvements recommended, (3) repairs recommended. |
| 7 | CA compliance/reporting gaps | Recycled water ASIR (Annual Self-Inspection Report) required annually in Apr-Jul; annual backflow inspection requirement; customer gets notification and BV schedules work; San Jose Bay Area context | DECIDED | Add region-scoped compliance schedule + workflow states for notify/schedule/complete. |
| 8 | Smart controller platforms and monitoring | Platforms: WeatherTRAK, Hunter, Rain Master Eagle, Rain Bird, Baseline, Weathermatic. Heavy use of Basemanager + WeatherTRAK (~250 controllers). Some flow meters (OptiFlow/direct wire/flow link). Usually one water source per controller. Monitoring is mixed between Alex and onsite teams. | DECIDED | Requires platform picklist, per-controller flow configuration fields, and monitoring ownership assignment model. |
| 9 | CA pilot branch | 4203 Mountain View | DECIDED | Capture backup branch in follow-up if needed. |
| 10 | Field device baseline | Techs use Galaxy tablets (non-BV managed) | DECIDED | BYOD/non-BV device constraint: validate browser support, auth/session policy, offline behavior, camera/photo flow, and MDM assumptions. |
| 11 | Offline requirement and preloading | Full offline capability required. Team must load SA and prime property asset data before leaving the office. | DECIDED | Add pre-dispatch sync/prime step, offline create/update queue, and conflict-resolution rules on reconnect. |
| 12 | Map availability and format | Site map usually available; zone maps available often but not always. Map artifacts are commonly PDF printouts, with editable map source maintained for updates and client PDF outputs. | DECIDED | Need optional-map workflow and editable map artifact support with generated client-facing PDF output. |
| 13 | Baseline inspection cadence | Goal is to inspect properties 4x/year, with some contracts requiring monthly inspection. | DECIDED | Scheduling model must support contract-driven frequency per account, not a single global cadence. |
| 14 | Existing data reuse behavior | Team sometimes starts fresh from master copy, but preferred behavior is reuse of prior property/controller details with only totals reset. | DECIDED | Reinforces persistent baseline + prefill requirement to avoid repeated zone metadata entry. |
| 15 | Output packet and handoff | Inspection report is the primary output in shared drive; Alex or lead tech generates proposal; client packet includes report, proposal, and increasingly photo gallery + map locations. | DECIDED | Requires explicit output-package model and handoff ownership states. |
| 16 | Pricing source and governance | No separate extra-work catalog; prices live in the workbook and are updated by Alex using material cost + typical labor assumptions. | DECIDED | Maintain single owned price source with versioning/governance controls. |
| 17 | Workflow variants | Distinct forms/workflows for contract PMI inspections vs work-order execution; work orders are not full inspection flows. | DECIDED | Product needs separate guided paths for inspection versus execution contexts. |
| 18 | Backflow execution model | Backflow inspection is annually required, but inspection/repair is typically subcontracted due to certification constraints. | DECIDED | Backflow process should support external-vendor referral/tracking, not only in-house execution. |
| 19 | Current FSM usage and pilot posture | Branch is not currently using FSM appointments for irrigation; Alex is willing to pilot with capacity caveat (time-constrained operations). | DECIDED | Adoption plan must minimize incremental effort and include phased enablement/training. |

### Open Follow-Ups

1. ~~Confirm ASRI acronym spelling and exact compliance artifact name.~~ CLOSED — ASIR (Annual Self-Inspection Report).
2. ~~Finalize mandatory fields for the minimum per-zone callout.~~ CLOSED — required: issue category, severity, recommendation, photo. Cost and map location optional.
3. Confirm whether a backup CA pilot branch is needed now.
4. [PARKED] Day-one tech rejection risks — deferred to UAT phase.

---

## James Carr Call Capture (May 13, 2026)

Captured live in one-question-at-a-time format.

| Q# | Question Topic | James Answer (Captured) | Evaluation | Notes / Impact |
|---|---|---|---|---|
| 1 | Section 6 completeness gaps for v1 | "We covered it all we can move on." No additional non-negotiable gaps identified for v1. | DECIDED | Section 6 baseline accepted for v1. |
| 2 | Overwatering in West Coast forms | Regional adaptation; not a national baseline requirement. | DECIDED | Keep Overwatering as regional delta logic. |
| 3 | Program count limit (A-D vs >4) | Adapted by region; no single national cap. | DECIDED | UI/question-set design must allow configurable program count by region. |
| 4 | Mobile UX for per-zone capture | Two service levels: PMI for existing systems and Assessment for new properties. Mobile UX priority is PMI first. | DECIDED | Card-style one-zone-at-a-time workflow is acceptable for PMI; Assessment flow treated as separate variant. |
| 5 | Rain and freeze sensor field structure | Separate fields. | DECIDED | Split rain and freeze capture in data model/UI. |
| 6 | Action audit for operator-controlled toggles | General notes are sufficient. | DECIDED | No mandatory explicit action-audit object required in v1. |
| 7 | Drip wording canonical term | Regional wording. | DECIDED | No single national canonical term; support regional label variants. |
| 8 | Publish authority owner | James Carr (Manager, Regional Irrigation). | DECIDED | Record governance owner for question/set publish decisions. |
| 9 | Change cadence / hot-fix path | Ad-hoc hot-fix path approved. | DECIDED | Urgent changes can bypass regular cadence via defined hot-fix process. |
| 10 | Training vs library authority | Training can lead and drive change. | DECIDED | Governance model must allow training-led change initiation before formal release. |
| 11 | Reclaimed water handling | Conditional block in main form. | DECIDED | Implement reclaimed water questions as conditional logic in base set. |
| 12 | Pump station checks timing | Add as a component. | DECIDED | Include pump-station content as a modular component in scope. |
| 13 | Backflow certificate handling | Model as a skill in FSM. | DECIDED | Treat backflow certification as FSM skill/capability requirement rather than attachment-only. |
| 14 | CA/OR/WA reporting fields | Deferred. | PARKED | Revisit after core form/data capture scope is settled. |
| 15 | Tech attribution granularity | SA-level attribution is enough. | DECIDED | Do not denormalize tech attribution onto every callout and estimate line. |
| 16 | West Coast pilot branch | Deferred. | PARKED | Revisit when pilot-nomination details are ready. |
| 17 | Long-tenured tech objection | Overcomplicated; not suited for non-technical users and folks who do not read/write well. | DECIDED | Preserve simple, low-reading-burden workflows and avoid unnecessary complexity. |
| 18 | Northeast intros | Yes, can broker intros this week. | DECIDED | Validate regional deltas before national publish. |

---

## Mike Trinidad Call Capture (May 13, 2026)

Captured from the follow-up transcript and prior live notes.

| Q# | Question Topic | Mike Answer (Captured) | Evaluation | Notes / Impact |
|---|---|---|---|---|
| 1 | Current FL digital form walkthrough | The audit is a living inspection report with property address, time/date, inspector, reason for inspection, visual notes, and details. Inputs are largely touch-driven or speech-to-text, with geolocation capture and supporting photos/video. | DECIDED | Confirms a low-typing, field-friendly workflow with rich media and geo capture. |
| 2 | Overwatering national vs FL delta | Mike treated Overwatering as a national baseline question / rename from Overspray. | DECIDED | Needs reconciliation with West Coast regional delta before final publish. |
| 3 | Must-have conditional expanders | Deferred for later. | PARKED | Capture exact branching list in a later pass. |
| 4 | Drip-specific content placement | Conditional within Section 6. | DECIDED | No separate subsection required for FL baseline. |
| 5 | Internal vs customer-facing note split | One blended note set. | DECIDED | Keep note model simple; do not split internal/customer notes in v1. |
| 6 | Minimum customer-facing narrative | Pictures plus the outcome of adjustments. | DECIDED | Customer PDF should explain what was changed and show evidence. |
| 7 | Photo expectations | Targeted photos with captions. | DECIDED | No high-volume photo burden; captioned evidence is enough. |
| 8 | Monthly capacity planning | Dispatch Console + Crew Calendar are sufficient. | DECIDED | No separate custom planning layer required at this stage. |
| 9 | Tech continuity fallback | Manager discretion. | DECIDED | Keep fallback flexible rather than enforcing a rigid ranking. |
| 10 | BV Connect empty boxes | Do not block publish; flag only. | DECIDED | Missing map artifacts should surface as exceptions, not hard stops. |
| 11 | Non-BV-Connect PDF distribution | No distribution by default. | DECIDED | Avoid auto-sending customer PDFs for non-BV Connect accounts. |
| 12 | FL pilot branch | Follow-up needed with Andrew McCall. | FOLLOW-UP | Owner: Andrew McCall. Branch decision not finalized in transcript. |
| 13 | Day-one rejection risks | Deferred to UAT. | PARKED | Collect rejection risks during UAT planning instead of here. |

### Open Follow-Ups

1. Follow up with Andrew McCall on the FL pilot branch.
2. Revisit the conditional expander list when final branching scope is being locked.
3. Resolve the Overwatering regional-vs-national wording across FL and West Coast before publish.
