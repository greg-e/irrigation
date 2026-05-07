# Irrigation Inspection Form — Data Model

Draft data model for the standardized digital irrigation inspection form captured at Service Appointment checkout.

**Status:** Draft v1 — May 7, 2026
**Aligns with:** [research/fsm_asset_architecture.md](../research/fsm_asset_architecture.md), [research/irrigationcheckups_analysis.md](../research/irrigationcheckups_analysis.md)

> ⚠️ **Open discovery gap:** The Northeast region (which uses IrrigationCheckups.com as their production inspection tool) was **not represented** in either Phase 2 discovery session. The schema below is generic enough to absorb NE input without rework, but Question Set membership / question content / backflow compliance items may need expansion after NE discovery. See [requirements/northeast_discovery_plan.md](northeast_discovery_plan.md).
**Source transcripts:** [discovery/FSM_-_Phase_2_-_Irrigation_Discovery.extracted.txt](../discovery/FSM_-_Phase_2_-_Irrigation_Discovery.extracted.txt), [discovery/FSM_-_Phase_2_-_Irrigation_Process_Review.extracted.txt](../discovery/FSM_-_Phase_2_-_Irrigation_Process_Review.extracted.txt)

---

## Design Principles

1. **Service Appointment is the inspection container.** Per prior decision (`irrigationcheckups_analysis.md` open questions, resolved). Inspection header data lives on SA via custom fields. No separate `System_Checkup__c` object.
2. **Repair Callouts are Work Order Line Items.** Per `fsm_asset_architecture.md`. Each issue found during inspection = one WOLI with extended custom fields. Re-used here, not redefined.
3. **Question responses are a child object.** The standardized question library will evolve (West/East regions, seasonal variants). Hardcoding 30+ booleans onto SA is brittle. A child `Inspection_Response__c` keyed to a question definition supports versioning.
4. **Photos use native Salesforce Files.** `ContentDocumentLink` on SA, WOLI, or Asset. No custom photo object.
5. **Internal vs customer-facing notes are separate fields.** Confirmed in June 2 review (Rohit / Michael exchange).
6. **Asset linkage is required for callouts.** Each WOLI callout points to the specific Zone / Controller / Backflow Asset. Drives Asset history and the "Needs Repair" status flow.

---

## Object Map

```
Account (Property)
└── Work Order
    ├── Service Appointment   ← inspection HEADER fields live here (custom)
    │   └── Inspection_Response__c (child, 1..n)   ← per-question answers
    │   └── ContentDocumentLink (Files)            ← inspection-level photos
    └── Work Order Line Item   ← per-issue REPAIR CALLOUT
        ├── Asset (lookup → Zone/Controller/etc.)
        └── ContentDocumentLink (Files)            ← callout photos

Reference data:
Inspection_Question__c (library, version-controlled)
Inspection_Question_Set__c (groups questions by Work Type / season / region)
```

---

## 1. Service Appointment — Inspection Header Fields (Custom)

Added to standard `ServiceAppointment`. Populated by the guided checkout flow on irrigation Work Types.

### 1a. Visit Context

| Field API Name | Type | Required | Notes / Picklist Values |
|---|---|---|---|
| `Inspection_Type__c` | Picklist | Yes | Quarterly / Monthly / Seasonal Startup / Mid-Season / Winterization / Backflow Test / Reactive Repair / Service Request |
| `Inspection_Reason__c` | Picklist | Yes | Scheduled Contract / Customer Request / Wet Check / Emergency Dispatch / Follow-Up |
| `Location_Scope__c` | Picklist | Yes | Whole Property / Common Area / Specific Resident — drives the address selector below |
| `Resident_Address__c` | Text(255) | Conditional | Required when `Location_Scope__c = Specific Resident`. Single-resident HOA inspections (Mike's form). |
| `Common_Area_Identifier__c` | Text(255) | Conditional | Required when `Location_Scope__c = Common Area`. Free text or controlled list per property. |
| `Inspection_GPS_Latitude__c` | Number(10,7) | Yes | Auto-captured at check-in via mobile LWC |
| `Inspection_GPS_Longitude__c` | Number(10,7) | Yes | Auto-captured at check-in via mobile LWC |
| `Inspected_By__c` | Lookup → User | Yes | Defaults to assigned ServiceResource |
| `Inspection_Started_At__c` | DateTime | Yes | Set on check-in |
| `Inspection_Completed_At__c` | DateTime | Yes | Set on checkout |

### 1b. System State Snapshot

| Field API Name | Type | Required | Notes |
|---|---|---|---|
| `Controller_Number__c` | Text(50) | Conditional | When inspection covers a controller |
| `Controller_Asset__c` | Lookup → Asset | Conditional | Preferred over text — links to Controller Asset |
| `Controller_Type__c` | Text(80) | No | Make/model — from James's form header |
| `Controller_Total_Zones__c` | Number(3,0) | No | Total zones on this controller (header total — James's form) |
| `Zones_Inspected_Count__c` | Number(3,0) | No | Count of zones visited during this SA |
| `Controller_Power_State__c` | Picklist | Yes | On / Off — from James's form header |
| `Backflow_State__c` | Picklist | No | On / Off — from James's form header |
| `Meter_State__c` | Picklist | No | On / Off — from James's form header |
| `Rain_Freeze_Sensor_Working__c` | Checkbox | Yes | Header Y/N from James's form (replaces generic rain sensor question) |
| `Water_Restrictions_In_Place__c` | Checkbox | Yes | Drives compliance reporting |
| `Water_Restriction_Notes__c` | Text(255) | Conditional | When checkbox = true |
| `Weather_Conditions__c` | Picklist | No | Sunny / Cloudy / Light Rain / Heavy Rain / Wind |
| `Web_Check_Performed__c` | Checkbox | No | "Wet check" — irrigation system run during inspection |

### 1c. Findings Summary

| Field API Name | Type | Required | Notes |
|---|---|---|---|
| `Repairs_Needed__c` | Checkbox | Yes | Logic field — drives downstream flows. Maps to Mike's "Are repairs needed?" Yes/No. |
| `Repairs_Summary__c` | Long Text Area(2000) | Conditional | Required when `Repairs_Needed__c = true`. Internal-facing detail for AM proposal generation. |
| `Hotspots_Identified__c` | Checkbox | No | Per Mike's form |
| `Lateral_Line_Breaks__c` | Checkbox | No | Per Mike's form |
| `Mainline_Issues__c` | Checkbox | No | Per Mike's form |
| `Estimated_Labor_Hours__c` | Number(5,2) | No | For AM proposal sizing |
| `Overall_System_Status__c` | Picklist | Yes | Operational / Operational with Repairs Needed / Partial Outage / Full Outage |

### 1d. Notes — Internal vs External Split

| Field API Name | Type | Required | Notes |
|---|---|---|---|
| `Internal_Notes__c` | Long Text Area(4000) | No | AM/branch-only. Includes parts pricing notes, labor estimates, proposal commentary. **Never** included in customer PDF. |
| `Customer_Facing_Notes__c` | Long Text Area(4000) | No | Surfaced in customer PDF and BV Connect view. |
| `Recommendations__c` | Long Text Area(2000) | No | Customer-facing — addresses Mike's discovery point: "customers pushed back saying we don't see any comments, no feedback, no suggestion." |

### 1e. Completion / Partial Completion

| Field API Name | Type | Required | Notes |
|---|---|---|---|
| `Inspection_Completion_Status__c` | Picklist | Yes | Completed / Partially Completed / Not Started |
| `Incompletion_Reason__c` | Picklist | Conditional | Weather / Property Access / Customer Reschedule / Equipment Failure / Other — required when status ≠ Completed |
| `Incompletion_Detail__c` | Text(255) | Conditional | Free text when reason = Other |

### 1f. PDF / Output Tracking

| Field API Name | Type | Required | Notes |
|---|---|---|---|
| `Internal_PDF_Generated_At__c` | DateTime | No | Set when internal PDF auto-generates on checkout |
| `Customer_PDF_Generated_At__c` | DateTime | No | Set when customer-facing PDF auto-generates |
| `BV_Connect_Published__c` | Checkbox | No | True once published to BV Connect (where customer is subscribed) |

---

## 2. `Inspection_Response__c` — Per-Question Answers (New Custom Object)

One row per question answered during the inspection. Supports the standardized question library and per-question photo/note capture.

### Object Settings
- Master-detail to `ServiceAppointment` (or Lookup if cross-org reporting requires; recommend M-D for cascade delete)
- Allow Activities: No
- Reports: Yes
- Track Field History: No (response data is immutable post-checkout)

### Fields

| Field API Name | Type | Required | Notes |
|---|---|---|---|
| `Service_Appointment__c` | Master-Detail → ServiceAppointment | Yes | Parent |
| `Question__c` | Lookup → Inspection_Question__c | Yes | Pinned to the question library version in use |
| `Question_Text_Snapshot__c` | Text(255) | Yes | Copied from question at time of answer — preserves text if library changes |
| `Question_Order__c` | Number(3,0) | Yes | Display order within the form |
| `Response_Type__c` | Picklist | Yes | Boolean / Picklist / Numeric / Text / Photo Required — copied from question |
| `Response_Boolean__c` | Checkbox | Conditional | Used when type = Boolean |
| `Response_Picklist__c` | Text(80) | Conditional | Used when type = Picklist |
| `Response_Number__c` | Number(10,2) | Conditional | Used when type = Numeric |
| `Response_Text__c` | Long Text Area(2000) | Conditional | Used when type = Text or for "explain" branches |
| `Failed_Inspection__c` | Checkbox | No | True if this response triggers a follow-up callout (e.g., zone failed) |
| `Asset__c` | Lookup → Asset | No | When question is asset-scoped (e.g., "Zone 3 — head condition") |
| `Photo_Required__c` | Checkbox | No | Copied from question — UI enforces photo capture |
| `Voice_Note_Transcript__c` | Long Text Area(2000) | No | Voice-to-text capture per `irrigationcheckups_analysis.md` benchmark |

> **Why an object, not flat fields on SA:** the question library will be revised regularly (transcript: "We'll review it once a year, add items, take them off"). Schema-driven storage avoids constant SA field churn and keeps reporting clean across question versions.

---

## 3. `Inspection_Question__c` — Question Library (New Custom Object, Reference Data)

Master list of all standardized questions. Versioned. Maintained by a designated admin (e.g., national irrigation lead).

### Fields

| Field API Name | Type | Required | Notes |
|---|---|---|---|
| `Name` | Text(80) | Yes | Short label, e.g., "Backflow operational" |
| `Question_Text__c` | Text(255) | Yes | Full prompt shown to tech |
| `Help_Text__c` | Text(255) | No | Tooltip for tech |
| `Response_Type__c` | Picklist | Yes | Boolean / Picklist / Numeric / Text / Photo Required |
| `Picklist_Values__c` | Long Text Area(1000) | Conditional | Newline-separated values when Response_Type = Picklist |
| `Photo_Required__c` | Checkbox | No | Force photo capture when answered |
| `Default_Failed_Value__c` | Text(80) | No | Value that flags the response as a failed inspection (drives callout creation) |
| `Asset_Scoped__c` | Checkbox | No | True if this question is asked per-Asset (zone/controller) rather than once per inspection |
| `Branching_Parent__c` | Lookup → Inspection_Question__c | No | For "if Yes, then ask…" logic |
| `Branching_Trigger_Value__c` | Text(80) | No | Parent answer that surfaces this question |
| `Active__c` | Checkbox | Yes | False = retired but historical responses preserved |
| `Version__c` | Number(3,0) | Yes | Library version |
| `Region__c` | Picklist (Multi) | No | National / East / West / Florida / Arizona / etc. |

---

## 4. `Inspection_Question_Set__c` — Question Set Assembly (New Custom Object)

Groups questions into a form definition tied to a Work Type and/or season. Allows different forms for Quarterly vs Winterization vs Backflow Test without duplicating questions.

### Fields

| Field API Name | Type | Required | Notes |
|---|---|---|---|
| `Name` | Text(80) | Yes | e.g., "Quarterly Inspection — National" |
| `Work_Type__c` | Lookup → WorkType | Yes | Drives which set is loaded for an SA |
| `Inspection_Type__c` | Picklist | Yes | Mirrors `ServiceAppointment.Inspection_Type__c` |
| `Active__c` | Checkbox | Yes | |
| `Effective_Start__c` | Date | Yes | |
| `Effective_End__c` | Date | No | |

### Junction: `Inspection_Question_Set_Member__c`

| Field API Name | Type | Required | Notes |
|---|---|---|---|
| `Question_Set__c` | Master-Detail → Inspection_Question_Set__c | Yes | |
| `Question__c` | Lookup → Inspection_Question__c | Yes | |
| `Display_Order__c` | Number(3,0) | Yes | |
| `Required__c` | Checkbox | Yes | Tech cannot submit without answering |

---

## 5. Repair Callout — `WorkOrderLineItem` (Existing — Reference Only)

Already defined in [research/fsm_asset_architecture.md](../research/fsm_asset_architecture.md). Listed here for completeness — **no schema changes proposed**.

| Field API Name | Source | Notes |
|---|---|---|
| `AssetId` | Standard | Required for irrigation callouts — Zone/Controller/Backflow |
| `Subject` | Standard | Issue summary |
| `Quantity` / `UnitPrice` | Standard | Parts/labor |
| `Issue_Type__c` | Custom (existing) | Broken Head / Valve Fault / Controller Issue / Leak / Low Pressure / Overspray / Clog / Other |
| `Callout_Status__c` | Custom (existing) | New / Quoted / Approved / Completed |
| `Callout_Notes__c` | Custom (existing) | |
| `Callout_Photo__c` | Custom (existing) | |
| `ExtraWork_Estimate_Line_Ref__c` | Custom (existing) | |

**New field proposed for inspection linkage:**

| Field API Name | Type | Notes |
|---|---|---|
| `Source_Inspection_Response__c` | Lookup → Inspection_Response__c | Optional — links the callout back to the failed question response that generated it. Enables "callout reason" drill-down in reporting. |

---

## 5b. `Irrigation_Program__c` — Controller Program Schedule (New Custom Object)

Captures the program schedule(s) running on a Controller — sourced directly from the footer grid on James Carr's West Coast inspection report (Programs A–D, four start times each, water days, budget %). One Controller may have multiple Programs (typically up to 4: A/B/C/D).

### Object Settings
- Lookup to `Asset` (Controller record type) — durable program record on the asset
- Optional Lookup to `ServiceAppointment` — captures program state as observed at a specific inspection (snapshot)
- Reports: Yes
- Track Field History: Yes (program changes are audit-relevant)

### Fields

| Field API Name | Type | Required | Notes |
|---|---|---|---|
| `Controller_Asset__c` | Lookup → Asset | Yes | Parent Controller |
| `Service_Appointment__c` | Lookup → ServiceAppointment | No | Inspection where this program state was captured |
| `Program_Letter__c` | Picklist | Yes | A / B / C / D |
| `Start_Time_1__c` | Time | No | |
| `Start_Time_2__c` | Time | No | |
| `Start_Time_3__c` | Time | No | |
| `Start_Time_4__c` | Time | No | |
| `Water_Day_Mon__c` | Checkbox | No | |
| `Water_Day_Tue__c` | Checkbox | No | |
| `Water_Day_Wed__c` | Checkbox | No | |
| `Water_Day_Thu__c` | Checkbox | No | |
| `Water_Day_Fri__c` | Checkbox | No | |
| `Water_Day_Sat__c` | Checkbox | No | |
| `Water_Day_Sun__c` | Checkbox | No | |
| `Budget_Percent__c` | Number(5,0) | No | Default 100. Maps to controller seasonal adjust % |
| `Active__c` | Checkbox | Yes | True if program is enabled |
| `Notes__c` | Text(255) | No | |

> **Why a child object, not flat fields on Controller Asset:** up to 4 programs per controller, each with 4 start times and 7 day flags = 60+ fields. Worse, controllers vary in program count and capabilities (some support 8 programs). A child object scales cleanly and supports the historical snapshot pattern when paired with Service Appointment.

---

## 5c. Per-Zone Inspection Detail

The per-zone grid on James's report (32 rows × 18 columns) is captured via `Inspection_Response__c` rows with `Asset_Scoped__c = true` and `Asset__c` pointing to each Zone Asset. Each grid column maps to one question in the library — see [requirements/inspection_question_library.md](inspection_question_library.md) Section 6 for the full mapping.

Key per-zone data points captured:

- Zone number / location
- Distribution method (S=spray / R=rotor / B=bubbler / D=drip)
- Turf / Bed / Color (T/B/C)
- # of heads
- Minutes/zone (runtime)
- 13 discrete failure-mode checkboxes (broken head, clogged nozzle, broken drip line, head not retracting, sunken/tilted head, head not rotating, valve box lid missing, valve not activating, seeping valve, mainline leak, bad solenoid, lateral leak, no issues found)
- Repairs made
- Notes

Each failed checkbox maps deterministically to a `WorkOrderLineItem` callout `Issue_Type__c` value — full mapping in the question library doc.

---

## 6. Photos — Native Files

No custom object. Use `ContentDocumentLink` to attach photos to:

- `ServiceAppointment` — overall inspection photos
- `Inspection_Response__c` — per-question photos (e.g., zone condition)
- `WorkOrderLineItem` — per-callout photos (the failed component)
- `Asset` — durable photos kept on the asset record (versioned)

Annotations / comments per photo: use the `Title` and `Description` fields on `ContentVersion`. If richer per-photo notes are required, add a `Photo_Caption__c` text field via a small wrapper LWC that writes to `ContentVersion.Description`.

---

## 7. Field Population Map — Source Forms → Salesforce

### 7a. Mike Trinidad — Florida Digital Form

| Form Field | Salesforce Target |
|---|---|
| Inspection address (auto-populated) | `ServiceAppointment.Address` (standard) + `Resident_Address__c` |
| GPS auto-locate | `Inspection_GPS_Latitude/Longitude__c` |
| Time and date stamp | `Inspection_Started_At__c` / `Inspection_Completed_At__c` |
| Inspector name (checkbox) | `Inspected_By__c` |
| Reason for inspection | `Inspection_Reason__c` |
| Wet check Y/N | `Web_Check_Performed__c` |
| Hotspots / lateral line breaks / mainline washouts | `Hotspots_Identified__c` / `Lateral_Line_Breaks__c` / `Mainline_Issues__c` |
| Controller number | `Controller_Number__c` + `Controller_Asset__c` |
| Zone number | Per-zone `Inspection_Response__c` rows with `Asset__c` → Zone |
| Water restrictions | `Water_Restrictions_In_Place__c` / `Water_Restriction_Notes__c` |
| Repairs needed Y/N (logic) | `Repairs_Needed__c` |
| Repair detail (red expand on Yes) | `Repairs_Summary__c` + WOLI callouts per issue |
| Comments / suggestions / feedback | `Customer_Facing_Notes__c` + `Recommendations__c` |
| Internal pricing/parts notes | `Internal_Notes__c` |
| Photos | Files on SA / Inspection_Response / WOLI |

### 7b. James Carr — West Coast "Irrigation Preventative Monthly Inspection Report"

**Header:**

| Form Field | Salesforce Target |
|---|---|
| Property Name | `ServiceAppointment.Account` (standard, derived from WO) |
| Controller Name | `Controller_Asset__c.Name` |
| Location | `Common_Area_Identifier__c` or `Resident_Address__c` based on `Location_Scope__c` |
| Controller Type | `Controller_Type__c` |
| # Zones | `Controller_Total_Zones__c` |
| Rain/Freeze Working (Y/N) | `Rain_Freeze_Sensor_Working__c` |
| Backflow (On/Off) | `Backflow_State__c` |
| Date | `Inspection_Started_At__c` |
| Controller (On/Off) | `Controller_Power_State__c` |
| Meter (On/Off) | `Meter_State__c` |

**Per-zone grid (one Inspection_Response__c set per zone, Asset__c → Zone):**

| Form Column | Question ID | Salesforce Target |
|---|---|---|
| Zone # | Q6.1 | Response_Number on Inspection_Response__c |
| Location | Q6.2 | Response_Text |
| S/R/B/D (distribution method) | Q6.3 | Response_Picklist |
| T/B/C (Turf/Bed/Color) | Q6.4 | Response_Picklist |
| # of heads | Q6.5 | Response_Number |
| Minutes/Zone | Q6.6 | Response_Number |
| No Issues Found | Q6.7 | Response_Boolean |
| Valve not activating | Q6.13a | Response_Boolean → WOLI Issue_Type = Valve Fault |
| Seeping Valve | Q6.13b | Response_Boolean → WOLI Issue_Type = Valve Fault |
| Mainline Leak | Q7.1 | Response_Boolean → WOLI Issue_Type = Leak |
| Bad Solenoid | Q6.13c | Response_Boolean → WOLI Issue_Type = Valve Fault |
| Lateral Leak | Q6.12 | Response_Boolean → WOLI Issue_Type = Leak |
| Broken Head | Q6.8 | Response_Boolean → WOLI Issue_Type = Broken Head |
| Broken/Clogged Nozzle | Q6.9 | Response_Boolean → WOLI Issue_Type = Clog |
| Broken drip line | Q6.15 | Response_Boolean → WOLI Issue_Type = Leak |
| Head not Retracting | Q6.10a | Response_Boolean → WOLI Issue_Type = Broken Head |
| Sunken/Tilted Head | Q6.10 | Response_Boolean → WOLI Issue_Type = Broken Head |
| Head not Rotating | Q6.10b | Response_Boolean → WOLI Issue_Type = Broken Head |
| Valve box lid missing | Q6.14 | Response_Boolean |
| Repairs Made | Q6.17 | Response_Boolean |
| Notes | Q6.19 | Response_Text |

**Programs footer (one Irrigation_Program__c row per program A/B/C/D):**

| Form Field | Salesforce Target |
|---|---|
| PROG (A/B/C/D) | `Program_Letter__c` |
| Start Time 1–4 | `Start_Time_1__c` … `Start_Time_4__c` |
| Water Days M–S | `Water_Day_Mon__c` … `Water_Day_Sun__c` |
| Budget % | `Budget_Percent__c` |

---

## 8. Validation Rules (proposed)

1. `ServiceAppointment`: when Work Type is irrigation and Status = Completed, require `Inspection_Completion_Status__c`, `Repairs_Needed__c`, `Overall_System_Status__c`.
2. `ServiceAppointment`: when `Repairs_Needed__c = true`, require at least one related `WorkOrderLineItem` with `Issue_Type__c` populated (or `Repairs_Summary__c` non-blank).
3. `ServiceAppointment`: when `Location_Scope__c = Specific Resident`, require `Resident_Address__c`.
4. `ServiceAppointment`: when `Location_Scope__c = Common Area`, require `Common_Area_Identifier__c`.
5. `ServiceAppointment`: when `Inspection_Completion_Status__c ≠ Completed`, require `Incompletion_Reason__c`.
6. `Inspection_Response__c`: enforce response field matches `Response_Type__c` (e.g., Boolean type → `Response_Boolean__c` non-null).

---

## 9. Triggers / Flows Touching This Model

Cross-reference with [research/automation_flows_design.md](../research/automation_flows_design.md). New flows implied:

1. **On `Inspection_Response__c` insert with `Failed_Inspection__c = true`** → optionally auto-create a `WorkOrderLineItem` callout pre-populated with the response context. (User decision: auto-create vs prompt-tech-to-create.)
2. **On `ServiceAppointment` checkout (Status → Completed) for irrigation Work Type** → generate internal PDF, generate customer PDF, set `Internal_PDF_Generated_At__c` / `Customer_PDF_Generated_At__c`, queue BV Connect publish if customer is subscribed.
3. **On `WorkOrderLineItem` insert with `Issue_Type__c` populated and `AssetId` set** → set `Asset.Status = Needs Repair` (existing Flow 2a in `automation_flows_design.md`).

---

## 10. Open Questions

- [ ] Auto-create callout WOLI from a failed `Inspection_Response__c`, or require tech to explicitly create it? Auto-create reduces friction but risks duplicate/garbage callouts.
- [ ] Should `Inspection_Question_Set__c` be replaced by Salesforce **Assessment Tasks** / **Assessment Indicator Definitions** (Industries Common Layer)? If the org licenses include it, that may be a lower-code path. Validate license availability.
- [ ] How are seasonal variants modeled — separate Question Sets per season, or active-date filters on questions within one set?
- [ ] Photo annotation depth — caption only, or freehand markup? Freehand markup requires a richer LWC and storage approach.
- [ ] Where does the question library live for editing — pure admin UI, or a custom LWC editor for the national irrigation lead?
- [ ] Multi-zone inspection: does each zone get its own SA, or one SA with N zone-scoped responses? Recommend: one SA with N responses to keep scheduling simple.
- [ ] Tech-level revenue attribution (James's ask) — store `Inspected_By__c` user on SA is sufficient, or also denormalize onto each WOLI for easier roll-up?

---

## 11. Out of Scope (this draft)

- Conservation audit / water savings calculator (deferred per `irrigationcheckups_analysis.md`)
- E-signature on inspection summary (ExtraWork owns signatures)
- Spatial pin overlay map (covered separately in `spatial_mapping_options.md`)
- ExtraWork integration field-level mapping (covered in `fsm_asset_architecture.md`)
- BV Connect rendering of customer PDF (separate UX spec)
