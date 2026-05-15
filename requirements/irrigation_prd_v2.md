# Irrigation Inspection and Asset Management PRD (v2)

**Date:** May 14, 2026
**Status:** Draft for stakeholder review
**Owner:** FSM Product / Architecture
**Supersedes:** prior v1 draft (removed from active repo; architecture and scope carry forward, JTBD framing and FSM capability mapping are new)

---

## How to Read This Document

This PRD is organized around **Jobs to Be Done (JTBD)** first, then maps each job to what the platform delivers. Every design decision is grounded in explicit stakeholder evidence or a locked architecture constraint. The goal is to demonstrate that the outcome is achievable inside Salesforce FSM with a small, purposeful custom surface — not a rebuild.

> **The anti-pattern we are actively avoiding:** Pronto Forms — an app that loaded every possible question and expected users to skip irrelevant ones. Nobody used it. — *James Carr, West Coast*

---

## 1. Problem Statement

Irrigation operations are running on a patchwork of Excel workbooks, iAuditor forms, and branch-created Google Slides maps. The result is:

1. **Revenue leakage.** Field findings don't reliably reach the AM queue. Approvals stall because evidence is buried in email threads. — *Alex Chavez; Trinidad*
2. **No accountability at scale.** Missed inspections are disputed because there is no unambiguous completion signal at the property level. — *Trinidad*
3. **Map artifacts are a throughput bottleneck.** Manual map production (Google Slides, PDF export) takes time that prevents volume handoffs. — *Alex Chavez*
4. **Customization fatigue.** Previous digital tools failed adoption because complexity exceeded the tolerance of the median field technician. — *Carr*
5. **No living customer output.** Static PDFs are sent and forgotten. Customers want filterable history without calling their manager. — *Trinidad*

---

## 2. Jobs to Be Done

These are the primary JTBD statements that anchor every product decision. Each is derived from direct stakeholder language, not inferred.

### JTBD-1 — Irrigation Technician (Field)

> **When** I am on-site doing a scheduled inspection,  
> **I need** to capture exactly the questions relevant to this property and this visit type, with photos and notes, and confirm what to flag for repair or enhancement,  
> **so that** I finish the job completely and leave nothing for the office to clean up later.

**Validated signal:** Carr's "even the lowest-tech technician can use it" PMI benchmark. Trinidad's tablet/voice workflow in FL. Alex's Excel-on-tablet baseline.  
**Failure mode (current):** Techs skip questions, submit incomplete forms, or re-use prior visit data because the tool puts too much on them.

---

### JTBD-2 — Account Manager (Triage and Revenue)

> **When** I open my queue after a day in the field or in client meetings,  
> **I need** to see a structured list of confirmed callouts — with photos, asset context, and a clear Repair vs. Enhancement label — so I can approve, quote, or escalate without making calls.

**Validated signal:** Carr pushed for Enhancement as a first-class callout type alongside Repair. Alex described manual SO splitting under the $2,500 approval threshold as a symptom of poor evidence packaging. Trinidad cited approval latency as the primary revenue leakage driver.  
**Failure mode (current):** AMs receive email threads with attachments and must reconstruct context to act.

---

### JTBD-3 — Branch Leadership (Operations and Revenue Accountability)

> **When** I do my weekly review,  
> **I need** to know which properties are behind on inspections, what confirmed callout revenue is sitting unconverted, and who is blocking it,  
> **so that** I can intervene before the week closes and the revenue cycle slips.

**Validated signal:** Carr explicitly framed the completion dashboard as a revenue accountability tool, not an ops report. Trinidad required per-house completion enforcement at board-report level.  
**Failure mode (current):** No single view. Data lives in iAuditor exports, Excel, and Salesforce separately.

---

### JTBD-4 — Irrigation Manager / Quality Steward (Standards)

> **When** a new branch or a new tech is onboarded,  
> **I need** the inspection form to be authoritative and correct for their region and season without me having to re-configure it manually,  
> **so that** I can maintain national quality standards while accommodating legitimate regional differences.

**Validated signal:** Carr shut down "every region is different" and volunteered to own the national question library. He drew the exact line: terms and principles are national; piping material, winterization timing, CA spray/drip, and NJ/TX licensing are regional deltas.  
**Failure mode (current):** No governed question source. Each region runs its own form with no version control.

---

### JTBD-5 — Customer / Property Manager (Trust and Self-Service)

> **When** my irrigation manager has completed an inspection,  
> **I need** to see what was found, with photos and location context, without having to call or email,  
> **so that** I can confirm the work is happening and quickly approve repairs that require my sign-off.

**Validated signal:** Trinidad explicitly named "living, breathing" digital inspection history as the target output, contrasted with static PDF snapshots. Customers asked Alex for photo-backed, location-specific evidence per issue.  
**Failure mode (current):** Customer receives a PDF if the AM remembers to send it, and the history is locked inside branch systems.

---

## 3. JTBD → Platform Coverage Matrix

This table maps each JTBD to the platform capability that delivers it. Effort levels use the FSM capability validation legend.

| JTBD | User Outcome | FSM / Salesforce Capability | Delivery Mode | Effort |
|---|---|---|---|---|
| JTBD-1 | Right questions, right visit | `Inspection_Question_Set__c` resolver by Region + Type + Season | Custom: Apex resolver + OOTB custom objects | Medium |
| JTBD-1 | Offline-safe field capture | FSM Mobile offline-first sync | OOTB | Low |
| JTBD-1 | Photo and voice capture | FSM Mobile camera + OS keyboard dictation | OOTB | Low |
| JTBD-1 | Required-answer checkout gate | LWC checkout validation logic | Custom LWC | Medium |
| JTBD-1 | Map context without GIS complexity | Spatial map LWC (Mapbox GL JS or Google Maps JavaScript API) rendering `Map_Feature__c` | Custom LWC | Medium |
| JTBD-2 | Structured callout queue with context | WOLI records with `Callout_Type__c` (Repair / Enhancement) + linked photos | OOTB record model + custom fields | Low–Medium |
| JTBD-2 | AM assignment enforcement | Required field + Flow validation on SA checkout | OOTB Flow | Low |
| JTBD-2 | Controlled conversion to estimate | Pending WOLI → quote handoff via AM review queue | OOTB + custom status picklist | Low |
| JTBD-3 | Completion accountability dashboard | SA completion data → CRM Analytics / Power BI | OOTB data model + reporting layer | Low |
| JTBD-3 | Callout revenue pipeline view | WOLI + Opportunity/Quote rollup | OOTB objects + report | Low |
| JTBD-4 | Published, immutable question versions | Append-only `Inspection_Question__c` governance | Custom objects + record policy | Low |
| JTBD-4 | National base + regional deltas | Question set membership by Region picklist | Custom objects + config | Low |
| JTBD-5 | Customer-accessible inspection history | Experience Cloud portal with filtered SA/WOLI views | OOTB Experience Cloud (license req.) | Low–Medium |
| JTBD-5 | Photo-backed callout evidence | `ContentDocumentLink` on WOLI | OOTB Salesforce Files | Low |

**Custom surface is bounded to:**
1. Inspection form runtime LWC (FSM Mobile)
2. Question set resolver (Apex)
3. Checkout review LWC (FSM Mobile)
4. Spatial map LWC (desktop + mobile; provider selected via decision gate)
5. Desktop asset setup governance UI

Everything else is OOTB Salesforce FSM objects, standard automation, and configuration.

---

## 4. Business Outcomes and KPIs

| Outcome | KPI | Stakeholder Source |
|---|---|---|
| Increase inspection completion reliability | Completion rate by branch, week, and property | Trinidad (per-house accountability), Carr (accountability dashboard) |
| Reduce revenue leakage from field-to-quote | Confirmed callouts per inspection; days from checkout to AM decision | Trinidad, Alex (approval latency) |
| Improve callout evidence quality | % callouts with at least one photo attached | Alex (clients want photo-backed evidence) |
| Standardize national inspection content | % inspections using current published library version | Carr (national ownership) |
| Reduce map production overhead | Map LWC adoption rate; time from pin capture to record sync | Alex (bottleneck), Carr (Google My Maps bar) |
| Enable customer self-service | Customer portal login rate; PDF request volume (target: decline) | Trinidad (living inspection history) |

---

## 5. Users and Personas

| Persona | Primary Platform | Primary JTBD |
|---|---|---|
| Irrigation Technician | FSM Mobile | JTBD-1 |
| Account Manager | Salesforce Desktop | JTBD-2 |
| Branch Leadership | Salesforce Desktop / Reports | JTBD-3 |
| Irrigation Manager / Standards Owner | Salesforce Desktop | JTBD-4 |
| Customer / Property Manager | Experience Cloud Portal | JTBD-5 |

**Pilot participants (Sanford, FL):** Andrew McCall (lead), Carlos Victoria, Edwin Gonzalez. — *Trinidad, verbatim*

---

## 6. Architecture Decisions (Locked)

1. System of record for asset and geometry metadata is Salesforce.
2. OOTB Asset object is the record for all irrigation components with canonical hierarchy: optional System root, Controller, Zone, Backflow, Head, Valve, Drip. No custom asset-class objects.
3. Service Appointment is the inspection runtime container. It uses polymorphic `ParentRecordId` (WO, WOLI, or Asset depending on journey).
4. Inspection responses are a child object (`Inspection_Response__c`), not hardcoded fields on SA. This preserves versioning and prevents field-count bloat.
5. Geometry is stored in `Map_Feature__c` as GeoJSON. Renderer is a custom LWC with provider selected by decision gate (Mapbox GL JS or Google Maps JavaScript API).
6. Published question versions are immutable and append-only. James Carr is the designated national library owner; regional leads may draft.
7. ArcGIS is out of scope. No client ArcGIS Online org. MVP provider decision is Mapbox GL JS vs Google Maps JavaScript API.
8. Salesforce Assessments are not used. Custom object question library is the final path.

---

## 7. Platform Principle: OOTB First

Every feature decision starts here: **Can FSM or standard Salesforce deliver this without code?**

| Decision Point | OOTB Path | Custom Required | Rationale |
|---|---|---|---|
| Asset record model | ✅ OOTB Asset with custom fields and `ParentId` hierarchy | No | 10,000-node hierarchy is native. Taxonomy is picklist configuration. |
| Work Order + WOLI for callout representation | ✅ OOTB | No | WOLI is the canonical callout record. `Callout_Type__c` is a custom picklist field only. |
| Scheduling and dispatch | ✅ FSM Dispatch Console + FSSO optimizer | No | Work Type filtering, skill-based routing, and preferred-resource rules are native. |
| Photo / voice capture in field | ✅ OOTB FSM Mobile | No | Camera and OS voice dictation are native. |
| Offline field operation | ✅ OOTB FSM Mobile sync | No | Custom objects require mobile profile inclusion (config, not code). |
| Inspection form rendering | 🟡 Custom LWC required | Yes | FSM Mobile has no native form builder. LWC Quick Action on SA. |
| Question set resolver | 🟡 Apex required | Yes | Deterministic resolution by Region + Type + Season with hard-fail behavior requires Apex. |
| Map experience | 🟡 Custom LWC required | Yes | No native within-property map in FSM. Selected provider (Mapbox or Google Maps) is embedded in LWC. |
| Customer portal | ✅ Experience Cloud | No | Standard filtered views on SA and WOLI. License required. |
| Completion and callout reporting | ✅ OOTB reports + CRM Analytics / Power BI | No | SA completion data and WOLI pipeline are native report sources. |
| PDF generation | 🟡 Apex + Visualforce or DocGen | Yes | Native PDF render is deprecated for new dev. Decision open: Apex/VF vs. DocGen license. |

---

## 8. Functional Scope

### 8.1 Asset Setup (Desktop — OOTB First)

**Delivers:** JTBD-4 (standards enforcement on data quality before inspection can run)

1. Queue-based property setup view: unsetup properties with completion status and blockers.
2. OOTB Asset taxonomy: System (optional) -> Controller -> Zone -> (Head, Valve, Drip) with Backflow under System, using `Asset.ParentId`.
3. Completion guard: minimum active asset baseline required before Work Type is schedulable.
4. Controlled edit workflow: controller fields, zone reassignment, backflow type/serial, retire/reopen with audit trail.

**Not custom-built:** The record model is OOTB Assets with custom fields. The setup view is a Lightning App Page with OOTB list views and standard record pages.

---

### 8.2 Inspection Question Library (Configuration — OOTB Custom Objects)

**Delivers:** JTBD-1, JTBD-4

1. `Inspection_Question__c`: single authoritative library. Published versions are immutable. New versions are append-only.
2. `Inspection_Question_Set__c`: named grouping with Region, Inspection Type, and Season picklists.
3. `Inspection_Question_Set_Member__c`: junction with sequence, required flag, and branching rule.
4. Two-tier set model (Carr's exact framing):
   - **PMI set** — simplified routine check. Controller name, zone count, failure modes. Any tech can use it.
   - **Full Assessment set** — new property onboarding or in-depth evaluation. Supports the "irrigation book" workflow.
5. Regional deltas are additional questions on a regional set, not forks of the national set. National base is non-negotiable.

---

### 8.3 Inspection Runtime (FSM Mobile LWC)

**Delivers:** JTBD-1

1. Resolver identifies the exact published question set at inspection start by: Region (from Account) + Inspection Type (from Work Type) + Season (derived from date and region).
2. Question set version is snapshotted at start and locked in-flight. A set update mid-inspection does not affect the running form.
3. Conditional sections render based on `Branching_Parent__c` / `Branching_Trigger_Value__c` — no unrelated questions shown. **This is the Pronto Forms anti-pattern fix.**
4. Per-zone card pattern for zone-level capture (Carr validated: acceptable to use one-zone-at-a-time card over a wide grid).
5. Offline-safe: responses written to local SQLite via `@salesforce/mobile-offline`; sync on reconnect.
6. Checkout gate: required-answer validation blocks submit until all required questions are answered.
7. Photo capture: OOTB FSM camera; files attached to SA or WOLI via `ContentDocumentLink`.

---

### 8.4 Suggested Repairs and Enhancements (FSM Mobile LWC + OOTB WOLI)

**Delivers:** JTBD-1, JTBD-2

1. Suggestions generated continuously as technician answers failure-mode questions.
2. Checkout review screen: technician confirms, dismisses, or merges suggestions before submit.
3. `Callout_Type__c` picklist on WOLI: `Repair` | `Enhancement`. Both are required values — not optional. — *Carr verbatim: "for every controller you should have a list of upgrades or enhancements."*
4. AM assignment is required before submit when any confirmed callouts exist. If no AM is assigned at the account level, the field is surfaced for manual entry.
5. Confirmed callouts generate WOLI records linked to the specific Asset (Zone/Controller/Backflow) with inspection context and attached photos.

---

### 8.5 AM Queue and Callout Conversion (Desktop — OOTB)

**Delivers:** JTBD-2

1. AM queue is a standard Salesforce list view: WOLIs with `Callout_Type__c` populated and Status = Pending Review, filtered by Account Owner.
2. Each WOLI surfaces: the Asset it targets, the `Inspection_Response__c` it originated from, attached photos, and `Callout_Type__c`.
3. AM actions: Approve (advance to estimate/quote flow), Dismiss with reason, or Merge (combine with existing open WOLI on the same asset).
4. Evidence packaging for AM: all photos linked to the WOLI are visible on the standard record page. No custom UI required.
5. Approval-threshold routing: `Callout_Amount__c` + standard Flow logic routes small approvals to automated approval process and larger amounts to leadership review. — *Alex: manual SO-splitting is a workaround for this exact gap.*

---

### 8.6 Map Experience (Desktop + Mobile LWC)

**Delivers:** JTBD-1 (field context), JTBD-2 (callout location evidence), JTBD-5 (customer context)

**UX Guardrail: the complexity bar is Google My Maps — "Fisher Price."** Any tech-resistant field tech must be able to use it on day one without training. — *Carr, verbatim*

1. `Map_Feature__c` stores geometry as GeoJSON: zone polygons, pipe/wire lines, asset pins.
2. Spatial map LWC renders all features on Account record page (desktop) and Service Appointment / Work Order (mobile) using the selected provider.
3. Desktop authoring: click to drop pin; drag to reposition; save writes back to `Map_Feature__c`. — *Carr explicitly required: "Will they have the ability to put a pin at a desktop?"*
4. Mobile GPS pin capture: OOTB `LocationService` plug-in. Deferred write queues when offline and syncs on reconnect.
5. Satellite basemap toggle: required in MVP and implemented via selected provider style/layer controls.
6. Callout map interaction: confirmed callouts display as pins with `Callout_Type__c` badge on the map.

---

### 8.7 Reporting and Accountability (OOTB Reports + Dashboard)

**Delivers:** JTBD-3

Carr framed this explicitly as a **revenue accountability tool**, not an ops report. This distinction matters for how dashboards are titled and organized.

1. **Inspection Completion:** SA completion rate by branch, week, and property. Per-house accountability — not street-level sampling. — *Trinidad*
2. **Callout Pipeline:** Open WOLIs by `Callout_Type__c`, age, AM owner, and branch. Revenue at risk.
3. **Conversion Velocity:** Days from SA checkout to WOLI status = Approved/Converted. Leakage signal.
4. **Data Quality:** % inspections with required questions answered; % callouts with photos.
5. All reports are OOTB Salesforce reports on standard + custom objects. No custom report types required for v1.

---

### 8.8 Customer Output (Experience Cloud — Post-R1)

**Delivers:** JTBD-5

1. Filtered SA history on a customer-facing Experience Cloud portal.
2. Property managers see: inspection date, technician, completion status, confirmed callouts, and linked photos per inspection.
3. No manager-mediated report prep required. — *Trinidad: "living, breathing" inside customer experience.*
4. **Scope gate:** Experience Cloud license is required. R1 ships PDF via email. Portal is R1.1.

---

## 9. Release Boundaries

### R1 — Core Workflow (Target Pilot: Sanford, FL)

| # | Capability | Delivery Mode |
|---|---|---|
| 1 | OOTB Asset taxonomy and desktop setup queue | Config + custom fields |
| 2 | National PMI question set + FL regional delta | Custom objects + data load |
| 3 | Mobile inspection LWC with offline sync and checkout gate | Custom LWC |
| 4 | Suggested repairs/enhancements with Callout_Type (Repair/Enhancement) | Custom LWC + OOTB WOLI |
| 5 | AM assignment enforcement and callout handoff | OOTB Flow + config |
| 6 | AM queue view and evidence packaging (photos, asset context) | OOTB list view + record page |
| 7 | Spatial map LWC (selected provider): desktop authoring + mobile GPS pin capture | Custom LWC |
| 8 | Completion and callout reporting dashboards | OOTB reports |
| 9 | PDF generation on SA completion (Apex/VF path) | Custom (Apex + VF) |

### R1.1 — Hardening and Portal

| # | Capability | Delivery Mode |
|---|---|---|
| 1 | West Coast question set delta (Carr-owned content) | Config + data load |
| 2 | Customer Experience Cloud portal with filtered inspection history | OOTB Experience Cloud |
| 3 | Offline mapping hardening and sync instrumentation for selected provider | Custom LWC update |
| 4 | Approval-threshold routing automation | OOTB Approval Process + Flow |
| 5 | Branch expansion pack (pilot lesson-learned content updates) | Config |

### Out of Scope (All Releases)

1. ArcGIS / enterprise GIS stack.
2. Smart-controller platform integrations (WeatherMatic, Rain Bird cloud, etc.).
3. Northeast question set content (pending NE discovery — schema is ready).
4. Resident self-service repair request intake.
5. Predictive analytics on inspection telemetry.

---

## 10. Open Decisions (Require Stakeholder Sign-Off Before R1 Build)

| # | Decision | Options | Owner | Due |
|---|---|---|---|---|
| D-1 | PDF generation approach | (a) Apex + Visualforce; (b) DocGen license | Arch + Leadership | TBD |
| D-2 | Required-answer gate tolerance at high volume | Hard block vs. soft warning with reason code | Mike Trinidad, James Carr | TBD |
| D-3 | AM assignment policy | Account-default with override / Branch-default / Always manual | Operations | TBD |
| D-4 | Photo baseline per region | None / One per callout / Full evidence set | Mike, James, Alex | TBD |
| D-5 | Severity taxonomy | Single national set vs. regional variants | James Carr (library owner) | TBD |
| D-6 | Reclaimed water / pump station handling | Separate variant set vs. conditional block in base set | James Carr + West Coast | TBD |
| D-7 | Backflow certificate tracking | Compliance object with expiry vs. attachment-only at v1 | Mike Trinidad (FL compliance) | TBD |
| D-8 | Northeast discovery gate | Block national publish until NE validates, or publish base and patch | James Carr + NE lead | TBD |
| D-9 | Customer portal license path | Experience Cloud license procurement timing | Leadership | TBD |
| D-10 | Spatial map provider selection | Mapbox GL JS vs Google Maps JavaScript API | Arch + Product | TBD |

---

## 11. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Pronto Forms adoption failure pattern recurs | Field techs stop using the tool; data quality collapses | Two-tier form (PMI keeps it fast); Carr validation of minimal form UX; pilot with willing lead (Andrew McCall) |
| Map LWC exceeds Google My Maps simplicity threshold | Field techs skip mapping; spatial data never populated | UX guardrail locked: one-tap pin, no zoom+pan training required; desktop fallback for off-signal scenarios |
| NE discovery gap delays national publish | Question library version 1 ships without NE input; NE rejects or forks | Gate NE content on NE discovery session; schema is additive-safe |
| AM queue not acted on (approval latency unchanged) | Revenue leakage persists; field trust erodes | Approval-threshold routing (D-3) reduces AM bottleneck for low-dollar callouts |
| PDF solution blocked by license cost | Customer output is delayed | Apex/VF path is zero-license-cost fallback; DocGen evaluated in parallel |
| FSM irrigation penetration low at pilot branch | Techs have no FSM habit to build on; adoption starts from zero | Sanford stakeholders identified (Andrew/Carlos/Edwin); pilot training package required |

---

## 12. What This Is Not

The following patterns are explicitly excluded to manage scope and adoption risk:

1. **Not a GIS project.** The spatial map LWC is a lightweight property context tool. It is not an enterprise spatial database or a replacement for ArcGIS.
2. **Not a form builder.** The question library is governed, versioned data. It does not expose a general-purpose form authoring UI to end users.
3. **Not an AI/ML inspection tool.** Suggestions at checkout are rule-based, not model-scored. The data model supports future scoring, but v1 does not build it.
4. **Not a customer repair request portal.** JTBD-5 is read-only inspection history for customers. Customers cannot raise work requests through this system in R1.

---

*Sources: discovery/carr_feedback.vtt, discovery/trinidad_followup.vtt, discovery/Alex_FollowUp.vtt, requirements/inspection_form_data_model.md, requirements/stakeholder_followup_questions.md, research/automation_flows_design.md*
