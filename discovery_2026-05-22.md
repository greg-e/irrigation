# Irrigation Discovery Session Pack

Date: 2026-05-22  
Owner: BA  
Status: Draft for iteration

## 1) Purpose

Run a field-first learning session for attendees who are seeing this work for the first time.

Capture practical feedback on:
- Slide narrative (hierarchy, setup, question library, process, mobile structure, report outcomes)
- Desktop and mobile prototype behavior
- Real-world field constraints, exceptions, and adoption risks

Primary outcome: leave with validated field insights, top friction points, and refined hypotheses for the next decision session.

## 2) Inputs Used

- discovery/FSM_-_Phase_2_-_Irrigation_Discovery.extracted.txt
- discovery/FSM_-_Phase_2_-_Irrigation_Process_Review.extracted.txt
- requirements/decision_log.md
- requirements/irrigation_prd_v2.md
- requirements/inspection_question_library.md
- requirements/northeast_discovery_plan.md

## 2.1) Language Rules for Discovery #1

Use field-first terms in the room. Avoid system jargon unless asked.

Say this:
- Output Item
- Action Item for AM
- Inspection Result
- Field Finding

Not this (unless clarifying in notes):
- WOLI
- Work Order Line Item

Clarify these two concepts up front:
- PMI = the routine, fast inspection for existing systems.
- Assessment = the deeper review for new properties, onboarding, or revenue-oriented evaluation.

Facilitator script:
"You will hear us say Output Item. In the system this may map to a Work Order Line Item later, but today we are validating the field workflow first."

## 2.2) Quick Translation (For Facilitator Only)

| Field Language | System/Build Language |
|---|---|
| Output Item | Work Order Line Item (WOLI) |
| Action Item for AM | Pending review WOLI / queue item |
| Inspection Result | Service Appointment + related output records |
| Field Finding | Inspection response / suggested repair |

## 3) Scope for This Session

In scope:
- Understand current field workflow from dispatch through reporting
- Validate prototype usability against real technician behavior
- Capture where proposed flow does not match branch reality

Out of scope:
- Final architecture lock
- SLA finalization and approval-routing final design
- Provider selection deep dive for map vendor (keep as gate)

## 4) Working Hypotheses (To Validate in Discovery #1)

1. Inspection container: Service Appointment.
2. Callout output can be represented through Output Item patterns (actively under review).
3. Mobile execution can be output-first with submit gating.
4. AM action queue can be list-view driven with standard record-page evidence packaging.

If challenged, capture it as evidence and convert to a decision candidate for session #2.

### Reopen Request Active

- Reopen ID: REOPEN-001
- Topic: Irrigation Service output model
- Why reopened: Current decision does not align with stakeholder expectation for inspection output packaging and downstream actionability.
- Decision owner: BA + Product + FSM architect
- Target decision date: Next discovery validation session

## 5) 75-Minute Agenda (Learning Mode)

1. 0-8 min: Context and framing (this is a learning session, not a lock session).
2. 8-22 min: Field reality baseline (how work is done today).
3. 22-42 min: Mobile prototype walkthrough with field scenarios.
4. 42-57 min: Desktop/report walkthrough with AM/coordinator scenarios.
5. 57-68 min: Output model reactions (single vs per-issue vs hybrid).
6. 68-75 min: Playback of findings, risks, and follow-up decision items.

Use this line between sections:
"We are not locking this today; we are validating what works in the field and what does not."

## 6) Slide-by-Slide Questions (Field Learning Focused)

### Slide 2: Irrigation System Hierarchy

1. Where does this hierarchy match how your team actually thinks in the field?
2. Where does it break in real jobs (shared assets, urgency, incomplete data)?
3. Which hierarchy details are too hard to maintain in daily operations?

### Slide 3: Desktop Setup Layout

1. What setup steps would your team skip under time pressure?
2. Which fields are realistically known at setup vs only known on-site?
3. Which errors currently hurt you most downstream?

### Slide 4: Process

1. Walk through your last emergency visit: where would this process help or slow you down?
2. Where do handoffs fail today between AM, coordinator, and technician?
3. What level of automation would your branch trust on day one?
4. Do PMI and Assessment need different field flows, or just different question sets?

Slide-ready process notes:

- Planned work comes from the normal contract flow.
- Emergency work starts as a simple field request, then gets routed for action.
- The tech captures the visit results in one place.
- PMI should stay fast and routine; Assessment should support deeper detail when the job calls for it.
- Internal users see the details they need to decide next steps.
- The customer gets a clear service confirmation or report.
- Branch leadership can use the output to create a proposal or follow-up action.
- Keep internal notes separate from customer-facing notes.
- Do not assume the field user knows system terms; use plain language in the room.

### Slide 5: Inspection Question Library

1. Which questions feel essential for field quality vs administrative noise?
2. Which questions are confusing or likely to be answered inconsistently?
3. Which missing questions would prevent a useful handoff to AM?
4. Where should PMI stop and a full Assessment begin?

### Slide 6: Mobile App Structure

1. In what order would a tech naturally use these sections at a property?
2. Which step feels unnecessary or out of sequence?
3. What must still work when connectivity is poor?

### Slide 7: Service Appointment

Context for facilitator:
- This slide is about how technicians interact with and complete the Service Appointment in the SF FSM Mobile app.

1. In the SF FSM Mobile app, what does a tech need to see first to confidently start the Service Appointment?
2. Which steps in the Service Appointment flow feel natural in-field, and which feel like extra admin work?
3. Where would a tech likely abandon or bypass the intended Service Appointment flow?
4. What one change would most increase adoption and completion quality in your branch?

### Slide 8: Report Results

1. What report output helps you take action fastest today?
2. What information is missing when AM receives field output now?
3. What customer-facing output creates trust vs confusion?

### Cross-Slide Focus: Irrigation Service Output Model (Reopened)

1. What is the canonical output of an irrigation service event: single summary item, one item per issue, or hybrid?
2. If hybrid, what are split rules for when detail becomes child records vs embedded output payload?
3. Which consumers need the output and in what format: AM action queue, customer report, billing handoff, analytics?
4. What output elements must be customer-visible vs internal-only?
5. What is the minimum output needed for quote creation without follow-up calls?

## 7) Prototype Demo Script

Note: Keep demos short and scenario-based. Ask attendees to narrate "what I would do next" at each step.

### Mobile Prototype (Run During Live Demo)

1. Run a real branch scenario end-to-end (planned visit).
2. Run an emergency scenario and compare behavior.
3. Simulate low connectivity and capture confidence level from users.
4. Ask users to identify where they would hesitate or workaround.

### Desktop Prototype (Run During Live Demo)

1. Show how AM would triage a day of outputs in under 10 minutes.
2. Ask what extra calls/emails would still be needed after viewing the record.
3. Validate whether evidence packaging is enough for quote handoff.
4. Confirm what report view leadership would actually use weekly.

## 8) Anti-Vague Follow-up Prompts (Learning Mode)

Use these repeatedly when answers are fuzzy:

1. Tell me about the last real example.
2. Where did that process fail?
3. What did your team do as a workaround?
4. What would have made that easier in the field?
5. What would make this unusable for your branch?

## 9) Capture Template (Use Live)

For each finding, record:

1. Field scenario described
2. Friction point observed
3. Current workaround
4. Impact (time, quality, revenue, customer)
5. Prototype fit (good / partial / poor)
6. Suggested change
7. Follow-up owner
8. Decision required later? (Y/N)

For REOPEN-001 add:

9. Output pattern chosen (single / per-issue / hybrid)
10. Record-level mapping (system fields, related objects, or derived report payload)
11. Consumer mapping (AM, customer, billing, reporting)

## 10) Learning Log Table (Fill During Session)

| ID | Topic | Field Finding | Current Workaround | Impact | Follow-up Owner | Status |
|---|---|---|---|---|---|---|
| REOPEN-001 | Irrigation Service output model |  |  |  | BA/Product/Architect | Reopened |
| L-001 |  |  |  |  |  | Open |
| L-002 |  |  |  |  |  | Open |
| L-003 |  |  |  |  |  | Open |

## 10.1) Discovery #1 Success Criteria

Discovery #1 is successful when:

1. At least 8 concrete field examples are captured.
2. Top 5 friction points are ranked by impact.
3. Output model concerns are clearly stated in user language.
4. Follow-up decisions are queued for Discovery #2.
5. Attendees confirm the prototype direction is understandable and worth iterating.

## 11) Parking Lot (Do Not Lose Time In-Session)

| Topic | Why Parked | Owner | Follow-up Date |
|---|---|---|---|
| Map provider final selection (Mapbox vs Google) | Separate cost/offline gate | BA |  |
| NE-specific question set additions | Requires NE discovery | BA |  |
| Portal rollout details | Post core flow validation | Product/BA |  |

## 12) Open Gates to Track

1. Spatial mapping provider decision (cost + offline behavior comparison).
2. Northeast discovery interviews completion.
3. Question library content lock after NE input.
4. REOPEN-001 closure: Irrigation Service output model locked.

## 12.1) Acceptance Criteria for REOPEN-001 Closure

REOPEN-001 is only closed when all criteria are true:

1. Output pattern is selected and documented with examples.
2. Field-level mapping is defined for required downstream users.
3. Customer-visible vs internal-only content is explicitly separated.
4. AM can triage and decide without additional technician follow-up for standard cases.
5. Reporting team confirms extractability of pipeline and conversion metrics.
6. Billing/quote handoff path is unambiguous for emergency and planned work.

## 12.2) REOPEN-001 Option Set (For In-Session Selection)

Discovery #1 guidance:
- Present options as conversation prompts only.
- Do not force selection in first-touch session.
- Capture reactions and missing conditions for each option.

### Option A: Single Output Item Summary

Pattern:
- One irrigation service output item per appointment/output event.
- All findings summarized in notes/structured summary fields.
- Child detail is report-only, not represented as separate action records.

Pros:
- Simplest operationally.
- Low record volume and low admin overhead.
- Fastest to implement.

Cons:
- Weak granularity for AM triage and analytics.
- Mixed issue types in one record reduce accountability.
- Harder to route, age, and convert individual opportunities.

Best fit when:
- Priority is speed of rollout over precision.
- Teams accept manual decomposition during quoting.

### Option B: One Output Item Per Issue

Pattern:
- Every confirmed issue becomes its own output item.
- Each output item carries asset context, issue type, severity, and evidence links.
- Queue and conversion happen at issue-level.

Pros:
- Highest actionability and accountability.
- Clean reporting by issue type, age, owner, conversion.
- Strongest support for AM and quote workflows.

Cons:
- Highest record volume.
- More workflow noise if minor issues are not filtered well.
- Requires tighter validation and triage rules.

Best fit when:
- Priority is precision, conversion visibility, and measurable throughput.

### Option C: Hybrid Output (Recommended for Validation)

Pattern:
- One parent irrigation service summary item per event.
- Only qualifying issues generate issue-level action items (or linked actionable child records).
- Minor/informational findings remain summarized under parent output.

Pros:
- Balances clarity and record volume.
- Maintains strong AM actionability for meaningful issues.
- Preserves concise customer-facing summary output.

Cons:
- More complex rule design (what qualifies as actionable).
- Requires consistent threshold governance.

Best fit when:
- Organization wants operational control without losing analytics and conversion precision.

## 12.3) Qualification Rules for Hybrid (Draft)

An issue becomes actionable output when one or more are true:

1. Safety/compliance risk is present.
2. Estimated cost is above branch threshold.
3. Customer approval is required.
4. Repair cannot be completed during current visit.
5. Issue type is in mandatory-action category list.

Otherwise, issue is summary-only output.

## 12.4) Decision Matrix (Use Live)

Discovery #1 guidance:
- Do not score live with first-time attendees.
- Use this matrix in Discovery #2 after field findings are captured.

Score each option 1-5 (5 is best):

| Criteria | Weight | A: Single | B: Per-Issue | C: Hybrid |
|---|---:|---:|---:|---:|
| AM actionability | 5 | 2 | 5 | 4 |
| Reporting precision | 5 | 2 | 5 | 4 |
| Record volume control | 4 | 5 | 2 | 4 |
| Billing/quote clarity | 5 | 2 | 4 | 5 |
| Field usability | 4 | 5 | 3 | 4 |
| Implementation complexity | 3 | 5 | 2 | 3 |
| Change management risk | 3 | 3 | 2 | 4 |
| **Weighted Total** |  | **94** | **102** | **118** |

### 12.4.1) Proposed Baseline Scoring Rationale

Note: Baseline is prep material for facilitators and should not be used to steer first-touch participants toward a preselected answer.

Use this as the starting position for stakeholder review:

1. A: Single scored high on speed and simplicity, but low on AM actionability and reporting precision.
2. B: Per-issue scored highest on actionability and analytics, but lowest on record volume and change-management burden.
3. C: Hybrid scored highest overall by balancing operational clarity, billing handoff, and manageable volume.

### 12.4.2) Provisional Recommendation (Before Live Validation)

Discovery #1 handling:
- Treat this as internal hypothesis only.
- Re-evaluate after learning log evidence is collected.

Provisional default: Option C (Hybrid), pending confirmation of qualification thresholds and downstream extract/report behavior.

Confidence in baseline: Medium-High.

Reason for confidence level:
- High on directional fit from existing discovery themes (AM actionability, revenue conversion, field usability).
- Medium on final threshold settings because branch-specific practices and NE discovery are still open.

Decision rule:
- Highest weighted total wins unless blocked by compliance or billing constraints.

## 12.5) Recommended Validation Questions for Option Selection

1. Which option lets AM decide without calling technicians in standard cases?
2. Which option gives leadership trustworthy pipeline and conversion reporting?
3. Which option keeps field workflow simple enough for consistent adoption?
4. Which option avoids billing ambiguity on emergency work?
5. If hybrid is chosen, what is the exact qualification threshold list?

## 13) End-of-Session Playback Script

Use this exact close:

1. "Here are the decisions we locked today."
2. "Here are the rules and owners."
3. "Here are open gates and due dates."
4. "Here is what changes in prototype/workflow before next review."

## 14) Iteration Log

### v0.1 - 2026-05-22

- Created initial full-session playbook.
- Added slide-specific question bank and prototype script.
- Added decision and parking lot tables for iterative use.

### v0.2 - 2026-05-22

- Marked output behavior as an active reopen request (REOPEN-001).
- Added focused cross-slide question set for output model validation.
- Added closure acceptance criteria to prevent premature relock.

### vNext Notes

- Add actual outcomes from next stakeholder session.
- Convert open decisions to locked entries with owners.
- Tune question bank based on where discussion drifted.

## 15) Glossary of Terms

This glossary is for Discovery #1 and uses field-first language where possible.

| Term | Meaning |
|---|---|
| Service Appointment (SA) | The scheduled field visit record that technicians work from in the SF FSM Mobile app. |
| SF FSM Mobile app | Salesforce Field Service mobile app used by technicians to view and complete the Service Appointment in the field. |
| PMI | Preventative Maintenance Inspection. The routine, fast inspection for existing systems. |
| Assessment | A deeper review used for new properties, onboarding, or revenue-oriented evaluation. |
| Repair | Reactive work to fix a known issue found in the field or reported by the customer. |
| System information | The setup and context that must already exist before the visit, such as account, hierarchy, and related asset details. |
| System hierarchy | The structure of account, system, controller, program, zone, pump, and backflow relationships. |
| Setup | The office-side or branch-side work of creating and maintaining the system information before a field visit. |
| Field finding | A specific issue or observation captured during the visit. |
| Output item | The trackable follow-up created from a visit finding so internal teams can act on it. |
| AM | Account Manager. The internal owner who reviews field output, approves next steps, or creates a proposal. |
| Coordinator | The branch role that helps route, schedule, or manage work assignment. |
| Customer-facing output | The report or confirmation the customer receives after the work is done. |
| Internal notes | Notes meant only for internal users, not shown to the customer. |
| AM action queue | The list or queue where field output is reviewed and acted on by internal users. |
| Output model | The rule for how a visit result is packaged: summary item, per-issue item, or hybrid. |
| Hybrid output | A model where a summary item exists for the visit and only qualifying issues become separate action items. |
| Actionable issue | A finding that requires follow-up because of cost, risk, customer approval, or inability to complete the work on site. |

### Glossary Usage Rule

When speaking in the room, use the field-first term first. If needed, explain the system mapping once and then keep using the field term.
