# Northeast Region — Irrigation Discovery Gap

The two Phase 2 discovery sessions did **not** include representation from the Northeast region. The Northeast uses **IrrigationCheckups.com** as their day-to-day inspection tool. So far, IrrigationCheckups has been treated as a competitive benchmark in [research/irrigationcheckups_analysis.md](../research/irrigationcheckups_analysis.md) — but it is also the **incumbent production tool for an entire region** that will be migrated onto Salesforce FSM.

This is a material gap. Status: **open**.

**Date:** May 7, 2026
**Status:** Discovery gap — interviews not yet held
**Confidence in current design without NE input:** ⚠️ Medium. The custom-object design and question library in [requirements/inspection_form_data_model.md](inspection_form_data_model.md) and [requirements/inspection_question_library.md](inspection_question_library.md) draw on FL (Mike), West Coast (James), CA (Alex). Northeast is unrepresented.

---

## 1. Why This Matters

| Risk | Impact |
|---|---|
| NE workflow may differ enough to invalidate question library variants | Re-cut Question Sets after build → rework |
| NE techs are accustomed to a polished inspection-specific UX | Salesforce FSM Mobile LWC must meet or beat IrrigationCheckups' UX or adoption tanks |
| NE relies on IrrigationCheckups' auto-quote-from-callouts feature | Confirm Pattern C "Suggested Repairs" closes this gap; otherwise NE perceives regression |
| NE has historical inspection data in IrrigationCheckups | Migration / archive plan needed (out of scope today; flag as Phase 3) |
| NE may have region-specific compliance items (e.g., MA, CT, NY backflow regulations) | Question library needs NE-specific Question Set variant |
| NE has season-specific rituals (winterization is a major event in NE) | Winterization Question Set must be validated by an NE practitioner |
| Change-management blowback if NE is told "you're losing your tool, here's an unfinished form" | Need NE champion for build feedback + UAT |

---

## 2. Who To Interview (proposed)

We don't have names today. Need from leadership:

- **NE Irrigation Manager** — process owner, current IrrigationCheckups admin
- **NE Branch-level Irrigation Tech** — actual day-to-day user (1 senior + 1 newer hire if possible, to capture both expert and novice perspectives)
- **NE Account Manager / Operations Manager** — receives reports, fields client questions
- **Whoever maintains the IrrigationCheckups subscription / templates** — knows the question content, price book setup, and report customizations the NE region has built up

If we cannot get all four, prioritize: NE Irrigation Manager + 1 senior tech.

---

## 3. Discovery Questions (NE-specific interview guide)

### A. Current state — IrrigationCheckups usage
1. Walk us through a typical irrigation checkup from drive-up to handoff. (No prompts — let them describe their actual flow.)
2. Which IrrigationCheckups report template(s) do you use? (Repair-focused? Conservation-focused? Custom?)
3. Show us the question content / fields you've configured in IrrigationCheckups. *Capture screenshot/export.*
4. What price book(s) do you have in IrrigationCheckups? How are they organized (by client? by component?)
5. How do callouts flow from inspection → quote → customer? (Validate the auto-quote-from-callout pattern.)
6. Where do photos go? How are they captioned/organized?
7. What does the customer-facing PDF look like? *Capture sample.*
8. How is e-signature used? Always? Only for big jobs?
9. How do you use the geo-tag site map? Does it actually get used post-audit?
10. How do you share in-process checkups across techs?

### B. Gaps and pain points in IrrigationCheckups
11. What does IrrigationCheckups not do that you wish it did?
12. What workarounds are you running outside the tool? (Spreadsheets? Texts? Photos in iPhone library?)
13. Where does data have to be re-entered into other systems (Aspire, Asset, accounting)?
14. Any IrrigationCheckups quirks / bugs / limitations you've learned to work around?

### C. Region-specific irrigation realities
15. NE-specific compliance: backflow testing requirements by state (MA RPZ requirements, CT cross-connection, NY 1013/1015, NJ DEP, etc.) — which states do you serve and what regulations apply?
16. Winterization process — is it the dominant seasonal event for NE? Walk us through the inspection flow at winterization.
17. Spring startup process — what's captured, what's checked?
18. Mid-season inspections — frequency, contract structure, what's checked?
19. Drip-vs-spray-vs-rotor mix in NE relative to other regions
20. Do you do conservation/water-efficiency audits? Required by any client types? (Some NE municipalities/HOAs may mandate.)
21. Smart controller penetration in NE (Hydrawise, Rachio, RainBird IQ4) — affects whether program data is being read off a panel or pulled from cloud

### D. Migration to Salesforce FSM
22. What would you have to lose from IrrigationCheckups for the migration to feel like a downgrade?
23. What would you have to gain from Salesforce FSM for it to feel like an upgrade?
24. How important is it to have your historical IrrigationCheckups data accessible after cutover? (Read-only archive? Migrate? Walk away?)
25. Who's the right NE champion to participate in UAT?

### E. Reporting & internal use
26. How do NE managers track tech productivity, completion rates, callout volumes? What reports do they look at weekly?
27. Are there any customer-facing dashboards or recurring report packs the NE region produces?

---

## 4. Specific Items in the Current Design To Re-Validate With NE

These are the design decisions most likely to shift once NE is in the room:

| Design Decision | Source | NE Validation Needed |
|---|---|---|
| Question Set variants list (8 variants) | [requirements/inspection_question_library.md](inspection_question_library.md) §"Question Set Variants" | Add **"Quarterly Inspection — Northeast"** and **"Winterization — Northeast"** variants if NE flow differs. |
| Q4.x Backflow questions | [requirements/inspection_question_library.md](inspection_question_library.md) §4 | NE has stricter / state-by-state backflow regs. Question content likely needs expansion. |
| Q5.x Controller programming | [requirements/inspection_question_library.md](inspection_question_library.md) §5 | Smart-controller mix may differ — confirm whether to capture cloud-platform reference (Hydrawise account, etc.) |
| Q6.x Zone failure modes | [requirements/inspection_question_library.md](inspection_question_library.md) §6 | NE may have additional or differently-named failure modes (e.g., freeze-damage variants) |
| Winterization Question Set | [requirements/inspection_question_library.md](inspection_question_library.md) Variants | Currently a stub. Winterization is the **major** seasonal event in NE and needs a real fill-in. |
| Pattern C "Suggested Repairs" review screen at checkout | [research/automation_flows_design.md](../research/automation_flows_design.md) Flow 3 / Flow 4 | IrrigationCheckups auto-builds quotes during the checkup, not at checkout. NE techs may expect inline quote-build, not end-of-visit review. |
| PDF report content + style | [requirements/inspection_form_data_model.md](inspection_form_data_model.md) §9 | Use NE's IrrigationCheckups PDFs as reference benchmark. |
| Per-zone grid UX (mobile) | [prototype/mobile/ui/fsm_mobile_inspection_standalone.html](../prototype/mobile/ui/fsm_mobile_inspection_standalone.html) | NE will say whether IrrigationCheckups' per-zone UX (which is well-regarded) sets the bar — or if our card-based design is acceptable. |
| GPS site map | [research/spatial_mapping_options.md](../research/spatial_mapping_options.md) | NE actively uses IrrigationCheckups' site map. Confirm utility expectation. |
| Conservation/water-efficiency audit | [requirements/inspection_form_data_model.md](inspection_form_data_model.md) §11 (out of scope) | Currently deferred. NE may have municipal contracts that require it — could pull this back into scope. |

---

## 5. Migration / Cutover Considerations (preliminary)

These are not Phase 2 build items but are flagged so leadership can plan around them:

1. **Historical inspection data in IrrigationCheckups.** Vendor offers historical report storage with active subscription. Options: (a) export to PDF and archive in Salesforce Files attached to Account; (b) build a one-time ETL into the new objects (effort cost likely > value); (c) keep a read-only IrrigationCheckups subscription for archive access; (d) walk away. Get NE input on which is acceptable.
2. **Price book in IrrigationCheckups.** Should map to ExtraWork price book — confirm parity.
3. **Active in-flight checkups at cutover.** Need a freeze date and a "complete in old tool, all new in new tool" line.
4. **Subscription cancellation timing.** Monthly subscription — easy to cut. Don't cancel until full UAT signoff.
5. **Tech change-management.** NE techs are actively using a polished tool. The migration narrative needs to lead with "single system of record / no double entry / connects to your work orders, contracts, billing" — not "we're replacing your tool with one we built."

---

## 6. Action Items

| # | Action | Owner | Status |
|---|---|---|---|
| 1 | Identify NE Irrigation Manager + 1–2 techs to interview | BA (Greg) + Phase 2 leadership | Open |
| 2 | Schedule NE discovery session(s) using interview guide above | BA | Open |
| 3 | Request NE's IrrigationCheckups exports: question content, price book, sample PDFs, site map screenshots | BA via NE manager | Open |
| 4 | After interviews — update [requirements/inspection_question_library.md](inspection_question_library.md) with NE-specific variants and any new questions/failure modes | BA | Blocked on #2 |
| 5 | After interviews — update [requirements/inspection_form_data_model.md](inspection_form_data_model.md) Open Questions section with NE-specific items resolved | BA | Blocked on #2 |
| 6 | Document NE-specific backflow compliance requirements by state | BA + NE manager | Blocked on #2 |
| 7 | Decision on historical IrrigationCheckups data — migrate / archive / walk away | Phase 2 sponsor | Blocked on #2 |
| 8 | Identify NE champion for UAT participation | NE manager | Blocked on #2 |
| 9 | Confirm NE coverage states + applicable backflow regulations | BA | Blocked on #2 |

---

## 7. Recommendation

**Do not lock the data model or question library design until at least one NE discovery session has happened.** The current design is unlikely to need a full rewrite — but the Question Set variants, the Winterization content, and the backflow section are where NE will most likely contribute material additions.

In parallel, the FSM custom-object schema work (`Inspection_Response__c`, `Inspection_Question__c`, `Inspection_Question_Set__c`, `Irrigation_Program__c`) is **safe to proceed** — the schema is generic and additions to the question library do not change the schema. What changes after NE input is **Question Set membership and question content**, both of which are data-only changes against the locked schema.

So: **schema build can start; library content lock is gated on NE discovery.**
