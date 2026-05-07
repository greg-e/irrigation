# Stakeholder Follow-Up Questions — Mike, Alex, James

Targeted follow-up question set per stakeholder, derived from the recommended path forward (custom-object schema, Pattern C "Suggested Repairs", standardized question library, FSM Mobile LWC, controller program A–D model, region-specific Question Set variants).

**Date:** May 7, 2026
**Use:** Send/walk through with each individual before locking the inspection LWC user-story backlog. Each question is tied to a specific design decision so we can show why we're asking.

> Format: each question references the design artifact it validates. Aim for short async replies first; reserve a 30-min call only if anything comes back ambiguous.

---

## Mike Trinidad — Florida (paper-form-to-digital benchmark)

**Context:** Mike already uses a digital form in FL. He's the closest to "production user" of any of our inputs. We have his field list mapped in [requirements/inspection_form_data_model.md](inspection_form_data_model.md) §7a.

### A. Form content / question library
1. Walk us through your current FL digital form end-to-end on a real recent inspection — anything we mapped wrong in §7a? *(validates field-level mapping)*
2. Q6.11 "Overspray" is on your form but **not** on James's West Coast grid. Is overspray a region-specific issue (FL turf/landscape) or should it be national? *([requirements/inspection_question_library.md](inspection_question_library.md) §6 + open question)*
3. Your form has a "Wet check Y/N" header — is that something every FL irrigation visit gets, or only certain visit types? *(drives whether `Web_Check_Performed__c` is required at SA completion)*
4. "Hotspots / lateral line breaks / mainline washouts" are checkboxes on your form. Are these *findings* (failures observed during the visit) or *triggers* that escalate the next step? *(drives whether they spawn WOLIs in Pattern C or stay as informational header flags)*
5. Logic-driven expanders ("if Yes, ask…"): list any that exist in your current form so we get the branching captured in `Inspection_Question__c.Branching_Parent__c`.
6. Are drip-specific questions worth their own sub-section, or is conditional rendering inside Section 6 acceptable? *([requirements/inspection_question_library.md](inspection_question_library.md) Open Q)*

### B. Pattern C "Suggested Repairs" review screen
7. Today, when you find a failure during inspection — do you build the quote / callout **inline as you go** or **at the end of the visit** at checkout? *(this directly chooses inline-WOLI vs end-of-visit Pattern C)*
8. If end-of-visit review screen showed every failed response with a "Confirm / Dismiss / Merge into one callout" choice, is that workable or friction?
9. Should the "Repairs Summary" free-text field disappear once we have structured WOLI callouts, or do you still want it as a quick narrative for the AM?

### C. Notes & PDFs
10. Internal vs Customer-Facing notes split — does that match how you actually work today, or are you writing one set of notes and the AM filters?
11. Customer-facing PDF — show us a "good" example you'd want every region to copy.
12. The transcript captured your customer feedback that "we don't see any comments, no feedback, no suggestion." Is the new `Recommendations__c` field enough, or does the customer want more?

### D. Scheduling & ops dashboard (your big ask)
13. The monthly calendar with hours-per-day capacity and drag-and-drop — do you want this in **Salesforce** (Dispatch Console / custom Lightning page) or **Power BI**? Greg leaned BI; Rohit could see a hybrid.
14. Preferred-resource-per-property continuity: when a property's preferred tech is unavailable, what's your fallback rule? (Ranked list? Geo-nearest qualified? Manager picks?)

### E. BV Connect & customer experience
15. Your point about BV Connect "empty boxes" — is the recommendation to **gate** Phase 2 publishing on the property having site maps / rotation maps, or just **flag** it for the AM?
16. For customers **not** subscribed to BV Connect, do you want the inspection PDF emailed directly, or just left as an internal artifact?

### F. Adoption / change management
17. Which FL branch should be Phase 2 pilot? (Sanford was mentioned as enthusiastic.)
18. Top 3 things that would make a tech reject the new tool on day one?

---

## James Carr — West Coast (Excel report + training-org owner)

**Context:** James gave us the actual Excel "Irrigation Preventative Monthly Inspection Report." He's also a national-level training resource. Section 6 + Section 9 are now mirrored to his form. He explicitly offered help — "phone call, e-mail or text away."

### A. Form content / completeness
1. Section 6 now mirrors all 13 of your failure-mode columns. Anything **else** on the report that we haven't captured (e.g., footer fields not pictured in the column-mapping table)? *([requirements/inspection_form_data_model.md](inspection_form_data_model.md) §7b)*
2. Your form does **not** have an "Overspray" column. Is that intentional (West Coast turf/spray pattern) or just left off? Should we still capture overspray nationally?
3. Programs A–D in your footer — is **4** the universal cap, or do some of your controllers run 6/8/16 programs? `Irrigation_Program__c` allows N rows per controller, but the LWC UI currently assumes 4. *([requirements/inspection_form_data_model.md](inspection_form_data_model.md) §5b)*
4. Per-zone grid is 32 rows × 18 columns on your form. On a tablet/phone, we can't show that as a wide grid. Would a **per-zone "card" pattern** (one zone at a time, expandable) be acceptable, or do you specifically need the all-zones-on-one-screen view?
5. The header has "Rain/Freeze Working Y/N" as one combined item. Do you ever need to separate "rain sensor working" from "freeze sensor working" — or is the combined Y/N enough? *(currently one Boolean: `Rain_Freeze_Sensor_Working__c`)*
6. Backflow / Meter / Controller On-Off — do you want any audit trail of *who* turned them off mid-inspection vs found-them-off?

### B. National standardization (your stated mission)
7. You and Mike already aligned on standardizing the report nationally. Of the 8 Question Set variants we drafted, which ones do you think are real and which are noise? *([requirements/inspection_question_library.md](inspection_question_library.md) "Question Set Variants")*
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

## Alex (California) — sheet not yet provided

**Context:** Alex was named in the transcripts as having a standardized California digital sheet. The artifact has not been shared. Alex declined the Discovery session and accepted the Process Review but didn't show. Highest-priority follow-up is just to **get the artifact**.

### A. Get the artifact
1. **Please share the California digital inspection sheet** (Excel / Forms / wherever it lives). Without it, we're locking the question library on FL + West Coast input only and CA gets retro-fitted later.
2. If it's a third-party tool, what tool — and is there a cost / contract we should know about?
3. Any sample completed sheets (sanitized) you can share so we see how it's actually filled in?

### B. CA-specific compliance
4. CA water restrictions / drought stages — are there fields the sheet captures that drive **MWELO** or local water-agency reporting? *(MWELO = CA's Model Water Efficient Landscape Ordinance; we need to know if state compliance lives in the form)*
5. Any city/county-specific items (LADWP, SF SFPUC, San Diego, OC) that show up as required fields?
6. Recycled / purple-pipe systems — same question as for James, but CA penetration is higher.
7. Smart-controller penetration in CA portfolio — Hydrawise, Rachio, RainBird IQ4, Weathermatic, Calsense? Does the form capture cloud-platform refs?

### C. Workflow / scheduling
8. Is your CA flow more like Mike's (per-property quarterly) or James's (per-controller monthly)?
9. Reactive / emergency volume in CA vs scheduled — same 50/50 split as FL/West Coast, or different?
10. Conservation/water-savings audits — are any of your CA contracts contractually required to deliver water-savings estimates? *(currently out of scope per [requirements/inspection_form_data_model.md](inspection_form_data_model.md) §11)*

### D. Question Set variant
11. Once we see the artifact, we'll propose a "Quarterly Inspection — California" or "Monthly Inspection — California" variant. Which inspection cadence fits CA better?
12. Are there branches in CA running fundamentally different processes from each other (NorCal vs SoCal vs Central Valley)?

### E. Tooling adoption
13. Is your team using **paper, Excel, IrrigationCheckups, Pronto Forms, or Salesforce** today? *(transcripts suggested standardized digital sheet but no platform was named)*
14. Migration concerns — anything you'd push back on if Phase 2 says "everyone moves to FSM Mobile"?

### F. Pilot / participation
15. Can we get 30 minutes for an Alex-led walkthrough of the CA sheet on a screen-share?
16. Are you willing to participate in UAT for the CA Question Set variant?

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
