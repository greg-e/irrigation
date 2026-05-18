# Irrigation Inspection — Canonical Question Library

Consolidated, standardized question set for the digital irrigation inspection form. Intended to replace Mike's Florida form, James's West Coast Excel, Alex's California sheet, Idaho's tracker, and Texas's Pronto Forms with one national library.

**Status:** Draft v2 — May 7, 2026 (Section 5/6 reconciled to James Carr's actual report)
**Schema target:** [requirements/inspection_form_data_model.md](inspection_form_data_model.md) (`Inspection_Question__c`, `Inspection_Question_Set__c`, `Irrigation_Program__c`)
**Source inputs:**
- Mike Trinidad's Florida digital form (described in [discovery/FSM_-_Phase_2_-_Irrigation_Discovery.extracted.txt](../discovery/FSM_-_Phase_2_-_Irrigation_Discovery.extracted.txt))
- **James Carr's West Coast "Irrigation Preventative Monthly Inspection Report"** (Excel template — reviewed May 7, 2026; see Section 6 and Section 9)
- Alex's California standardized digital sheet (referenced in transcripts — source artifact not yet provided)
- Industry standard practices ([research/irrigationcheckups_analysis.md](../research/irrigationcheckups_analysis.md))

> **Confidence:** High on items derived from Mike's form, James's actual Excel report, and IrrigationCheckups feature inventory. Medium on Alex's California sheet — still needs validation against the actual artifact before lock.
>
> ⚠️ **Open discovery gap — Northeast region.** The NE region uses IrrigationCheckups.com as their production tool and was **not represented** in the Phase 2 discovery sessions. Question Set variants, the Winterization Question Set, and the Backflow section (§4) are most likely to require additions once NE is interviewed. See [requirements/northeast_discovery_plan.md](northeast_discovery_plan.md). **Library content should not be locked until NE discovery has occurred.**

---

## Library Structure

Questions are organized into **8 sections**. Each Question Set (form variant) selects which sections apply.

| # | Section | Scope |
|---|---|---|
| 1 | Visit Context | Once per inspection (header) |
| 2 | Site Conditions | Once per inspection |
| 3 | Water Source & Restrictions | Once per inspection |
| 4 | Backflow | Per-Backflow asset (1..n) |
| 5 | Controller / Programming | Per-Controller asset (1..n) |
| 6 | Zone Inspection | Per-Zone asset (1..n) — bulk of the form |
| 7 | Mainline / Distribution | Once per inspection |
| 8 | Summary & Recommendations | Once per inspection (footer) |
| 9 | Controller Program Schedule | Per-Program (A–D) per Controller |

> Sections 1, 2, 3, 7, 8 map to fields on `ServiceAppointment` (header data). Sections 4, 5, 6 map to `Inspection_Response__c` rows with `Asset_Scoped__c = true`. Section 9 maps to `Irrigation_Program__c` records.

---

## Question Set Variants (initial)

| Question Set | Sections Included | Notes |
|---|---|---|
| Quarterly Inspection — National | 1, 2, 3, 4, 5, 6, 7, 8, 9 | Default for residential HOA quarterly checks |
| Monthly Inspection — West Coast | 1, 2, 3, 5 (header), 6, 9 | Mirrors James Carr's "Irrigation Preventative Monthly Inspection Report" |
| Monthly Inspection — National | 1, 2, 3, 6 (subset), 8 | Lighter; per-zone walk only |
| Seasonal Startup | 1, 2, 3, 4, 5, 6, 7, 8, 9 | Full system bring-up |
| Mid-Season Inspection | 1, 2, 3, 5, 6, 8 | Skip backflow if recently tested |
| Winterization | 1, 2, 5, 6 (drain confirmation), 7 | Shutdown checklist |
| Backflow Test Only | 1, 4, 8 | Compliance-driven |
| Reactive Repair / Service Request | 1, (zone or asset that failed), 8 | Minimal — drives WOLI callout |

---

## Section 1 — Visit Context (header)

| ID | Question | Type | Required | Photo | Failed Value | Notes |
|---|---|---|---|---|---|---|
| Q1.1 | Reason for site visit | Picklist | Yes | — | — | Scheduled Contract / Customer Request / Wet Check / Emergency Dispatch / Follow-Up |
| Q1.2 | Inspection type | Picklist | Yes | — | — | Quarterly / Monthly / Seasonal Startup / Mid-Season / Winterization / Backflow Test / Reactive Repair |
| Q1.3 | Location scope | Picklist | Yes | — | — | Whole Property / Common Area / Specific Resident |
| Q1.4 | Resident address (if applicable) | Text | Conditional | — | — | Required when Q1.3 = Specific Resident |
| Q1.5 | Common area identifier | Text | Conditional | — | — | Required when Q1.3 = Common Area |
| Q1.6 | Inspector | Lookup → User | Yes | — | — | Defaults to assigned ServiceResource |
| Q1.7 | GPS location captured | Auto (Number) | Yes | — | — | Mobile LWC at check-in |

---

## Section 2 — Site Conditions

| ID | Question | Type | Required | Photo | Failed Value | Notes |
|---|---|---|---|---|---|---|
| Q2.1 | Weather at time of inspection | Picklist | No | — | — | Sunny / Cloudy / Light Rain / Heavy Rain / Wind |
| Q2.2 | Hotspots / dry areas observed? | Boolean | Yes | If Yes | True | From Mike's form |
| Q2.3 | Standing water / pooling observed? | Boolean | Yes | If Yes | True | |
| Q2.4 | Erosion observed? | Boolean | No | If Yes | True | |
| Q2.5 | Visible turf stress / discoloration? | Boolean | No | If Yes | True | |

---

## Section 3 — Water Source & Restrictions

| ID | Question | Type | Required | Photo | Failed Value | Notes |
|---|---|---|---|---|---|---|
| Q3.1 | Water source | Picklist | Yes | — | — | Potable / Reclaimed / Well / Pond / Other |
| Q3.2 | Water restrictions in place? | Boolean | Yes | — | True | Drives compliance reporting |
| Q3.3 | Restriction details | Text | Conditional | — | — | Required when Q3.2 = Yes (days, hours allowed) |
| Q3.4 | Pump operational? | Boolean | Conditional | If No | False | When applicable to property |
| Q3.5 | Pump pressure (PSI) | Numeric | No | — | — | When applicable |

---

## Section 4 — Backflow (per-Backflow asset)

> Asset-scoped: one response set per Backflow Asset on the property.

| ID | Question | Type | Required | Photo | Failed Value | Notes |
|---|---|---|---|---|---|---|
| Q4.1 | Backflow type | Picklist | Yes | — | — | RPZ / DCV / PVB / Other |
| Q4.2 | Visible damage? | Boolean | Yes | If Yes | True | |
| Q4.3 | Leaks at backflow assembly? | Boolean | Yes | If Yes | True | |
| Q4.4 | Test required this visit? | Boolean | Yes | — | — | Drives Q4.5 / Q4.6 |
| Q4.5 | Test passed? | Boolean | Conditional | — | False | Required when Q4.4 = Yes |
| Q4.6 | Test certificate uploaded? | Boolean | Conditional | Required | False | Required when Q4.4 = Yes |
| Q4.7 | Insulation / freeze protection in place? | Boolean | No | — | False | Seasonal — winterization variant |

---

## Section 5 — Controller / Programming (per-Controller asset)

> Confirmed against James Carr's report header (Controller Name, Type, # Zones, Rain/Freeze Working, Controller On/Off, Backflow On/Off, Meter On/Off) and Mike Trinidad's Florida form.

| ID | Question | Type | Required | Photo | Failed Value | Notes |
|---|---|---|---|---|---|---|
| Q5.1 | Controller make / model | Text | Yes | — | — | James header: Controller Type |
| Q5.2 | Controller name / number / label | Text | Yes | — | — | James header: Controller Name |
| Q5.3 | Total zones on controller | Numeric | Yes | — | — | James header: # Zones |
| Q5.4 | Controller power state | Picklist | Yes | If Off | Off | On / Off — James header |
| Q5.5 | Backflow state | Picklist | Yes | — | Off | On / Off — James header |
| Q5.6 | Meter state | Picklist | Yes | — | Off | On / Off — James header |
| Q5.7 | Rain / freeze sensor working? | Boolean | Yes | If No | False | James header: Rain/Freeze Working Y/N |
| Q5.8 | Smart controller / weather-based? | Boolean | No | — | — | Reporting flag |
| Q5.9 | Flow sensor connected and functional? | Boolean | No | — | False | When applicable |
| Q5.10 | Master valve operational? | Boolean | No | — | False | When applicable |
| Q5.11 | Programs match contract / season? | Boolean | Yes | — | False | Programming audit |
| Q5.12 | Adjustments made this visit? | Boolean | Yes | — | — | |
| Q5.13 | Adjustment notes | Text | Conditional | — | — | Required when Q5.12 = Yes — plus full program detail captured in Section 9 |
| Q5.14 | System winterized / drained? | Boolean | Conditional | — | False | Winterization variant only |

---

## Section 6 — Zone Inspection (per-Zone asset) — the meat

> One response set per Zone Asset inspected. **Confirmed against James Carr's per-zone grid** (32-row table on the West Coast monthly report). Each grid column maps to one question. Per-zone failed responses drive WOLI callout creation.

| ID | Question | Type | Required | Photo | Failed Value | Notes / Source |
|---|---|---|---|---|---|---|
| Q6.1 | Zone number | Numeric | Yes | — | — | James col: Zone |
| Q6.2 | Zone location / description | Text | Yes | — | — | James col: Location |
| Q6.3 | Distribution method | Picklist | Yes | — | — | S=Spray / R=Rotor / B=Bubbler / D=Drip — James col |
| Q6.4 | Landscape type | Picklist | Yes | — | — | T=Turf / B=Bed / C=Color — James col |
| Q6.5 | # of heads | Numeric | No | — | — | James col |
| Q6.6 | Minutes / zone (runtime) | Numeric | No | — | — | James col |
| Q6.7 | No issues found | Boolean | Yes | — | — | James col — if checked, downstream Q6.8–6.16 should all be unchecked (validation rule candidate) |
| Q6.8 | Broken head | Boolean | Yes | If Yes | True | James col → WOLI Issue_Type = Broken Head |
| Q6.9 | Broken / clogged nozzle | Boolean | Yes | If Yes | True | James col → WOLI Issue_Type = Clog |
| Q6.10 | Sunken / tilted head | Boolean | Yes | If Yes | True | James col → WOLI Issue_Type = Broken Head |
| Q6.10a | Head not retracting | Boolean | Yes | If Yes | True | James col → WOLI Issue_Type = Broken Head |
| Q6.10b | Head not rotating | Boolean | Yes | If Yes | True | James col → WOLI Issue_Type = Broken Head |
| Q6.11 | Overwatering onto hardscape | Boolean | No | If Yes | True | FL-only delta (confirmed May 13, 2026 — James adapts form regionally; not national baseline) → WOLI Issue_Type = Overwatering |
| Q6.12 | Lateral leak | Boolean | Yes | If Yes | True | James col: Lateral Leak → WOLI Issue_Type = Leak |
| Q6.13 | Valve not activating | Boolean | Yes | If Yes | True | James col → WOLI Issue_Type = Valve Fault |
| Q6.13a | Seeping valve | Boolean | Yes | If Yes | True | James col → WOLI Issue_Type = Valve Fault |
| Q6.13b | Bad solenoid | Boolean | Yes | If Yes | True | James col → WOLI Issue_Type = Valve Fault |
| Q6.13c | Solenoid resistance reading (ohms) | Number | Conditional | — | <15 or >60 | Surfaced when Q6.13 = True or Q6.13b = True; nominal range 20–60 Ω; out-of-range → WOLI Issue_Type = Valve Fault; written to `Asset.Solenoid_Resistance__c` on Zone record at checkout |
| Q6.14 | Valve box lid missing | Boolean | Yes | If Yes | True | James col |
| Q6.15 | Broken drip line | Boolean | Conditional | If Yes | True | James col — surfaced when Q6.3 = D → WOLI Issue_Type = Leak |
| Q6.16 | Drip emitters / filter / regulator OK? | Boolean | Conditional | If No | False | When Q6.3 = D — not on James's grid; retained from IrrigationCheckups industry standard |
| Q6.17 | Repairs made on site this visit? | Boolean | Yes | — | — | James col: Repairs Made |
| Q6.18 | Repair description | Text | Conditional | — | — | Required when Q6.17 = Yes |
| Q6.19 | Zone notes | Text | No | — | — | James col: Notes |

> **Trigger logic:** any Q6.x answered with the Failed Value generates a recommended WOLI callout. Q6.7 ("No issues found") should be mutually exclusive with all failure-mode checkboxes — enforce via validation rule.

---

## Section 7 — Mainline / Distribution

| ID | Question | Type | Required | Photo | Failed Value | Notes |
|---|---|---|---|---|---|---|
| Q7.1 | Visible mainline leak? | Boolean | Yes | If Yes | True | James col (per-zone grid) and Mike's "visual mainline washouts". Captured per-zone in Section 6 grid; this row records the inspection-level summary. |
| Q7.2 | Mainline pressure stable? | Boolean | No | — | False | |
| Q7.3 | Isolation valves operational? | Boolean | No | — | False | |
| Q7.4 | Quick coupler valves operational (where applicable)? | Boolean | No | — | False | |

---

## Section 9 — Controller Program Schedule (per-Controller, per-Program A–D)

> **Confirmed against James Carr's report footer** — captures up to 4 programs (A/B/C/D) per controller with start times, water days, and budget %. Stored in `Irrigation_Program__c` (see [requirements/inspection_form_data_model.md](inspection_form_data_model.md) Section 5b), not as `Inspection_Response__c` rows.

| ID | Field | Type | Required | Notes |
|---|---|---|---|---|
| Q9.1 | Program letter | Picklist | Yes | A / B / C / D |
| Q9.2 | Active? | Boolean | Yes | |
| Q9.3 | Start Time 1 | Time | No | |
| Q9.4 | Start Time 2 | Time | No | |
| Q9.5 | Start Time 3 | Time | No | |
| Q9.6 | Start Time 4 | Time | No | |
| Q9.7 | Water Days | Multi-checkbox | No | M / T / W / T / F / S / S |
| Q9.8 | Budget % | Numeric | No | Default 100 |
| Q9.9 | Notes | Text | No | |

> **UX note:** capture as a small editable grid (Program A row, Program B row, etc.) rather than a long sequence of questions. Renders straight to the program footer block in the customer-facing PDF, mirroring James's report layout exactly.

---

## Section 8 — Summary & Recommendations (footer)

| ID | Question | Type | Required | Photo | Failed Value | Notes |
|---|---|---|---|---|---|---|
| Q8.1 | Overall system status | Picklist | Yes | — | — | Operational / Operational with Repairs Needed / Partial Outage / Full Outage |
| Q8.2 | Repairs needed beyond what was completed? | Boolean | Yes | — | True | Maps to `Repairs_Needed__c` |
| Q8.3 | Estimated additional labor hours | Numeric | Conditional | — | — | When Q8.2 = Yes |
| Q8.4 | Recommendations to customer | Text | No | — | — | `Recommendations__c` — customer-facing |
| Q8.5 | Customer-facing summary notes | Text | No | — | — | `Customer_Facing_Notes__c` |
| Q8.6 | Internal notes (not shown to customer) | Text | No | — | — | `Internal_Notes__c` — pricing, parts, proposal commentary |
| Q8.7 | Inspection completion status | Picklist | Yes | — | — | Completed / Partially Completed / Not Started |
| Q8.8 | Incompletion reason | Picklist | Conditional | — | — | When Q8.7 ≠ Completed |
| Q8.9 | Photos — overall site (before/after) | Photo | No | Yes | — | |

---

## Failed Response → WOLI Callout Mapping

| Question | Source | Auto-suggested WOLI `Issue_Type__c` |
|---|---|---|
| Q4.2 Backflow damage | Mike | Other |
| Q4.3 Backflow leak | Mike | Leak |
| Q4.5 Backflow test fail | Compliance | Other (Compliance) |
| Q5.4 Controller power Off | James | Controller Issue |
| Q5.6 Meter Off | James | Other |
| Q5.7 Rain/freeze sensor not working | James | Controller Issue |
| Q6.8 Broken head | James | Broken Head |
| Q6.9 Broken / clogged nozzle | James | Clog |
| Q6.10 Sunken / tilted head | James | Broken Head |
| Q6.10a Head not retracting | James | Broken Head |
| Q6.10b Head not rotating | James | Broken Head |
| Q6.11 Overwatering | Mike | Overwatering |
| Q6.12 Lateral leak | James | Leak |
| Q6.13 Valve not activating | James | Valve Fault |
| Q6.13a Seeping valve | James | Valve Fault |
| Q6.13b Bad solenoid | James | Valve Fault |
| Q6.14 Valve box lid missing | James | Other |
| Q6.15 Broken drip line | James | Leak |
| Q6.16 Drip emitters not functional | Industry | Clog |
| Q7.1 Mainline leak | James (in-grid) + Mike | Leak |

---

## Branching Logic Summary

- Q1.4 surfaced when Q1.3 = "Specific Resident"
- Q1.5 surfaced when Q1.3 = "Common Area"
- Q3.3 surfaced when Q3.2 = Yes
- Q3.4–Q3.5 surfaced only when site has pump-station context
- Q4.5–Q4.6 surfaced when Q4.4 = Yes
- Q5.10 surfaced when Q5.9 = Yes
- Q6.15–Q6.16 surfaced when Q6.3 includes Drip
- Q6.18 surfaced when Q6.17 = Yes
- Q8.3 surfaced when Q8.2 = Yes
- Q8.8 surfaced when Q8.7 ≠ Completed

---

## Open Questions for Stakeholder Validation

- [x] **James (West Coast):** ~~Confirm Section 6 covers all items on the West Coast uniform Excel sheet.~~ **Resolved May 7, 2026** — Section 6 now mirrors all 13 failure-mode columns on James's report. New Section 9 added for the program schedule footer.
- [x] **James:** Confirmed May 13, 2026 — Overwatering (Q6.11) is FL-only delta. James adapts form regionally; West Coast does not include this question.
- [ ] **Alex (California):** Confirm Section 5 controller/programming questions match the California digital sheet. Any CA water-board reporting items missing?
- [ ] **Mike (Florida):** Confirm Section 6 zone questions cover everything in the FL digital form, especially logic-driven expanders.
- [ ] **National irrigation lead:** Should drip-specific questions be a separate sub-section rather than conditional within Section 6?
- [ ] Should backflow test certificate be modeled as a Compliance custom object rather than a photo attachment? (May tie into [research/automation_flows_design.md](../research/automation_flows_design.md) Flow 1.)
- [ ] Reclaimed water systems — are there per-region required questions (purple-pipe signage, cross-connection checks)?
- [ ] Pump stations — does this need its own section (Section 10)?
- [ ] Should the question count be capped per variant for tech UX? Recommend max ~30 questions per variant excluding per-zone repeats.
- [ ] Validation rule: when Q6.7 "No issues found" = true, all of Q6.8–6.16 must be false. Confirm this is the intended UX.

---

## Notes on Variant Lock

Once stakeholders sign off, each Question Set should be locked with a `Version__c` value. Future revisions create new Question Set records (e.g., "Quarterly Inspection — National v2") so historical responses remain interpretable. Reporting joins `Inspection_Response__c.Question_Text_Snapshot__c` rather than the live question text.

### Locked Governance Decisions (May 11, 2026)

- Custom-object library path is final (no Salesforce Assessments path).
- Published questions are immutable; edits create new versions.
- Published question sets are immutable; membership/order changes create new set versions.
- Published sets pin exact question versions at publish time.
- Regional model uses pinned base version plus explicit deltas (add/override/remove markers).
- Regional and seasonal overrides can change membership/order and surface behavior only; no response-type or branching-structure changes.
- Seasonal forms are separate question-set variants derived from pinned regional variants.
- Runtime selection is deterministic by region + inspection type/season + work type, with exactly one published match.
- Inspection start snapshots the selected published set version; in-flight inspections remain locked.
- Checkout is blocked until all required questions are answered.
