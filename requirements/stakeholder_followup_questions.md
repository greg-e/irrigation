# Stakeholder Follow-Up Questions — Mike, Alex, James

Targeted follow-up question set per stakeholder, derived from the recommended path forward (custom-object schema, Pattern C "Suggested Repairs", standardized question library, FSM Mobile LWC, controller program A–D model, region-specific Question Set variants).

**Date:** May 11, 2026
**Use:** Send/walk through with each individual before locking the inspection LWC user-story backlog. Each question is tied to a specific design decision so we can show why we're asking.

> Format: each question references the design artifact it validates. Aim for short async replies first; reserve a 30-min call only if anything comes back ambiguous.

---

## Mike Trinidad — Florida (paper-form-to-digital benchmark)

**Context:** Mike already uses a digital form in FL. He's the closest to "production user" of any of our inputs. We have his field list mapped in [requirements/inspection_form_data_model.md](inspection_form_data_model.md) §7a.

### A. Form content / question library
1. Walk us through your current FL digital form end-to-end on a real recent inspection — anything we mapped wrong in §7a? *(validates field-level mapping)*
2. Q6.11 "Overspray" is on your form but **not** on James's West Coast grid. Is overspray a region-specific issue (FL turf/landscape) or should it be national? *([requirements/inspection_question_library.md](inspection_question_library.md) §6 + open question)*
3. Logic-driven expanders ("if Yes, ask…"): list any that exist in your current form so we get the branching captured in `Inspection_Question__c.Branching_Parent__c`.
4. Are drip-specific questions worth their own sub-section, or is conditional rendering inside Section 6 acceptable? *([requirements/inspection_question_library.md](inspection_question_library.md) Open Q)*

### C. Notes & PDFs
5. Internal vs Customer-Facing notes split — does that match how you actually work today, or are you writing one set of notes and the AM filters?
6. Customer-facing PDF — show us a "good" example you'd want every region to copy.
7. The transcript captured your customer feedback that "we don't see any comments, no feedback, no suggestion." Is the new `Recommendations__c` field enough, or does the customer want more?

### D. Scheduling & ops dashboard (your big ask)
8. The monthly calendar with hours-per-day capacity and drag-and-drop - Does the existing Dispatch Console and Crew Calendar meet this requirement? Greg leaned BI; Rohit could see a hybrid.
9. Preferred-resource-per-property continuity: when a property's preferred tech is unavailable, what's your fallback rule? (Ranked list? Geo-nearest qualified? Manager picks?)

### E. BV Connect & customer experience
10. Your point about BV Connect "empty boxes" — is the recommendation to **gate** Phase 2 publishing on the property having site maps / rotation maps, or just **flag** it for the AM?
11. For customers **not** subscribed to BV Connect, do you want the inspection PDF emailed directly, or just left as an internal artifact?

### F. Adoption / change management
12. Which FL branch should be Phase 2 pilot? (Sanford was mentioned as enthusiastic.)
13. Top 3 things that would make a tech reject the new tool on day one?

---

## James Carr — West Coast (Excel report + training-org owner)

**Context:** James gave us the actual Excel "Irrigation Preventative Monthly Inspection Report." He's also a national-level training resource. Section 6 + Section 9 are now mirrored to his form. He explicitly offered help — "phone call, e-mail or text away." The workbook sample includes repeated controller blocks and zone rows extending to at least 96, with a partially filled example property ("City of Grapevine").

### A. Form content / completeness
1. Section 6 now mirrors all 13 of your failure-mode columns. Anything **else** on the report that we haven't captured (e.g., footer fields not pictured in the column-mapping table)? *([requirements/inspection_form_data_model.md](inspection_form_data_model.md) §7b)*
2. Your form does **not** have an "Overspray" column. Is that intentional (West Coast turf/spray pattern) or just left off? Should we still capture overspray nationally?
3. Programs A–D in your footer — is **4** the universal cap, or do some of your controllers run 6/8/16 programs? `Irrigation_Program__c` allows N rows per controller, but the LWC UI currently assumes 4. *([requirements/inspection_form_data_model.md](inspection_form_data_model.md) §5b)*
4. Per-zone grid is 32 rows × 18 columns on your form. On a tablet/phone, we can't show that as a wide grid. Would a **per-zone "card" pattern** (one zone at a time, expandable) be acceptable, or do you specifically need the all-zones-on-one-screen view?
5. The header has "Rain/Freeze Working Y/N" as one combined item. Do you ever need to separate "rain sensor working" from "freeze sensor working" — or is the combined Y/N enough? *(currently one Boolean: `Rain_Freeze_Sensor_Working__c`)*
6. Backflow / Meter / Controller On-Off — do you want any audit trail of *who* turned them off mid-inspection vs found-them-off?
7. We see one section using "Broken drip line" and another using "Leaking Seal" in that same failure-mode position. Which label is authoritative for the national question library?

### B. National standardization (your stated mission)
8. Who in the org should own the question library (national irrigation lead role)? Is that a James-owned function or someone else?
9. How often do you expect the library to change (annual review per the transcript — but mid-year hot-fix path)?
10. For training: should the standardized form drive your training curriculum, or vice-versa?

### C. Reclaimed water / pump stations / compliance
11. Reclaimed (purple-pipe) systems are common on the West Coast. Do they need their own Question Set variant or just additional questions inside the standard one? *([requirements/inspection_question_library.md](inspection_question_library.md) Open Q)*
12. Pump stations — do they need a Section 10 (separate from controllers)? *([requirements/inspection_question_library.md](inspection_question_library.md) Open Q)*
13. Backflow test certificate — should this be a Compliance custom object with expiry tracking, or just a photo attachment? *([requirements/inspection_question_library.md](inspection_question_library.md) Open Q)*
14. CA / OR / WA state-level water-board reporting requirements — anything we need to capture *in the form* to feed downstream reporting?

### D. Tech-level attribution (your specific ask)
15. You wanted tech-level revenue attribution. Is `Inspected_By__c` on the SA enough, or do you need it denormalized onto every resulting WOLI/Estimate? *([requirements/inspection_form_data_model.md](inspection_form_data_model.md) Open Q)*

### E. Adoption / pilot
16. Which West Coast branch is the right pilot for the standardized form?
17. What's the biggest objection you expect from a senior West Coast tech who's been using the Excel form for years?

### F. Northeast / region coordination
18. Have you worked with the Northeast irrigation managers? They're not represented in our discovery and they use IrrigationCheckups.com. Can you broker an intro? *([requirements/northeast_discovery_plan.md](northeast_discovery_plan.md))*

---

## Alex Chavez (California) — sheet received (May 11)

**Context:** Alex's workbook is now in discovery. It includes a summary tab and controller tabs (A-E) with a repair-price catalog and totals. One controller sample appears partially filled (site/address "intuitive # 109", controller name "node", inspection date 2/5/2026), while most controller metadata fields remain blank.

### A. Artifact walkthrough (now that we have it)
1. Confirm this is the current California production sheet, not a draft/training copy.
2. Which fields are truly required for tech completion vs optional in practice? (Many metadata fields appear blank in sample tabs.)
3. Is one workbook intended per property visit, or does one workbook persist across multiple visits?

### B. Header/data quality rules
4. Should Site Name and Irrigation Tech on the Summary tab be mandatory before submit?
5. Controller-level metadata (serial, make/model, location, water type, backflow spec) is mostly blank in the sample. Do techs usually skip these, or is this just an incomplete sample?
6. "Controller has remote harness" and "Controller has Map" look like yes/no prompts. Should those be required booleans in the mobile form?
7. Are controller totals expected to be non-zero on most visits, or are many visits true "inspection only/no repair" outcomes?

### C. Repair catalog and pricing governance
8. The controller tabs include a large fixed repair catalog with unit costs. Who owns these prices and how often do they change?
9. Do you need region-level price books (NorCal vs SoCal) or one statewide standard price list?
10. When techs identify issues not in the catalog, do they add free-text lines, or should we add an "Other repair" pattern?

### D. Workflow / cadence
11. Is CA flow more like Mike's (per-property quarterly) or James's (per-controller monthly)?
12. How should A-E controller tabs map to Salesforce records: one parent inspection with child controller inspections, or separate service appointments per controller?
13. Do you need separate completion states for "inspected, no repairs" vs "inspected, repairs recommended"?

### E. CA-specific compliance
14. Which CA water-restriction or agency compliance fields are missing from this workbook but required for operations/reporting (MWELO, city utility mandates, drought stage)?
15. Recycled/purple-pipe systems: should this be a dedicated Question Set variant or conditional questions in the standard CA set?
16. Smart-controller ecosystem in CA portfolio (Hydrawise, Rain Bird IQ4, Weathermatic, Calsense, etc.): which platforms must we explicitly capture in the data model?

### F. Adoption / pilot
17. Can we schedule a 30-minute Alex-led walkthrough of a fully completed real inspection using this sheet?
18. Which CA branch should pilot the FSM Mobile version first?

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
1. Current workbook evidence supports a "template + occasional partial completion" usage pattern, so required-field policy, prefill rules, and controller-level completion gates should be explicitly decided before finalizing LWC validation logic.

---

## Cross-cutting questions (ask all three)

These shouldn't go in three separate emails — package them once and walk through together if possible.

1. **Pattern C confirmation.** "Suggested Repairs" review screen at checkout — failed responses surface as draft WOLIs that the tech confirms / dismisses / merges. Mark agree / disagree / depends. *([requirements/diagrams/process_flow.mmd](diagrams/process_flow.mmd))*
2. **Voice-to-text** — in your region, is this actually used or do techs type? Drives how much we invest in the LWC voice UX.
3. **Photo capture frequency** — typical photos per inspection in your region (helps size offline-storage budget).
4. **Offline reality** — what % of your visits hit poor/no signal? (West Coast canyons, FL rural, CA central valley all have dead zones.)
5. **Acceptance criteria for "this replaces my old tool"** — give us your top 3 must-haves and top 3 deal-breakers.
6. **Pilot branch nomination** — if Phase 2 launches in your region, which one branch should pilot?
7. **What hasn't anyone asked about yet that's going to bite us?**

---

## Tracking

Use the table below to log replies. Update [requirements/inspection_question_library.md](inspection_question_library.md) "Open Questions" and [requirements/inspection_form_data_model.md](inspection_form_data_model.md) §10 once each item is resolved.

| Q# | Stakeholder | Sent | Replied | Resolution | Doc Updated |
|---|---|---|---|---|---|
| | | | | | |
