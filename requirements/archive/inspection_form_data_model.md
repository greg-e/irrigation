> **SUPERSEDED**
> **Superseded by:** [requirements/irrigation_data_dictionary.md](../irrigation_data_dictionary.md)
> **Rationale:** Data dictionary (v3, 2026-05-18) absorbed and expanded the inspection form schema into a unified canonical Salesforce object reference.
> **Decision Log ID:** DL-001
> **Archived:** 2026-05-18
> **Owner:** BA (G. Ehrenberg)

---

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
| `Wet_Check_Performed__c` | Checkbox | No | "Wet check" — irrigation system run during inspection |

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

## 4b. Irrigation Asset Type Model (Canonical)

This section defines the required irrigation asset taxonomy and minimum fields by type. It is the canonical model used by bootstrap mode, asset-scoped question rendering, and callout linkage.

### 4b.1 Asset Taxonomy and Record Types

Use standard `Asset` with irrigation record types and `Asset_Type__c` as a controlled picklist:

| Record Type / Asset Type | Parent Required | Used In Inspection Sections | Notes |
|---|---|---|---|
| `System` | Account | N/A | Optional hierarchy root node for irrigation system grouping |
| `Controller` | System (preferred) or Account | 5, 9 | Parent for Zone assets; stores controller identity and capacity |
| `Zone` | Controller | 6 | Primary inspection loop target |
| `Backflow` | System (preferred) or Account | 4 | Compliance and leak/test flows |
| `Head` | Zone | Optional detail for advanced mapping | Not required for baseline go-live |
| `Valve` | Zone | Optional detail for advanced mapping | Can be represented as zone-level finding at go-live |
| `Drip` | Zone | 6 (conditional) | Drip emitter group modeling under Zone |

### 4b.2 Common Fields (all irrigation asset types)

| Field API Name | Type | Required | Purpose |
|---|---|---|---|
| `Asset_Type__c` | Picklist | Yes | Canonical type discriminator |
| `Irrigation_System_Key__c` | Text(80) | No | Groups assets belonging to same irrigation system |
| `Install_Date__c` | Date | No | Lifecycle reporting |
| `Location_Description__c` | Text(255) | No | Human-readable location guidance |
| `Latitude__c` | Number(10,7) | No | Spatial context |
| `Longitude__c` | Number(10,7) | No | Spatial context |
| `Is_Placeholder__c` | Checkbox | Yes (default false) | Marks temporary bootstrap records |
| `Normalization_Status__c` | Picklist | Yes | Pending / Normalized / Retired |
| `Last_Inspected_At__c` | DateTime | No | Updated on completed inspections |
| `Last_Inspected_SA__c` | Lookup -> ServiceAppointment | No | Last inspection pointer |

### 4b.3 Minimum Bootstrap Fields by Asset Type

These are the minimum required fields when tech creates assets in bootstrap mode.

| Asset Type | Minimum Required Fields at Bootstrap |
|---|---|
| `System` | `Name`, `Asset_Type__c` |
| `Controller` | `Name`, `Asset_Type__c`, `Controller_Label__c`, `Controller_Total_Zones__c` |
| `Zone` | `Name`, `Asset_Type__c`, `Zone_Number__c`, `ParentId` (Controller) |
| `Backflow` | `Name`, `Asset_Type__c`, `Backflow_Type__c` |

### 4b.4 Managed Fields by Asset Type (non-exhaustive)

| Asset Type | Field API Name | Type | Required | Notes |
|---|---|---|---|---|
| Controller | `Controller_Label__c` | Text(80) | Yes | Human-friendly id shown to tech |
| Controller | `Controller_Model__c` | Text(80) | No | Make/model |
| Controller | `Controller_Total_Zones__c` | Number(3,0) | Yes | Capacity |
| Controller | `Smart_Controller__c` | Checkbox | No | Weather-based controller flag |
| Controller | `Flow_Sensor_Functional__c` | Checkbox | No | Used in Section 5 |
| Zone | `Zone_Number__c` | Number(3,0) | Yes | Primary zone key |
| Zone | `Distribution_Method__c` | Picklist | No | Spray / Rotor / Bubbler / Drip |
| Zone | `Landscape_Type__c` | Picklist | No | Turf / Bed / Color |
| Zone | `Default_Runtime_Minutes__c` | Number(5,2) | No | Planning baseline |
| Zone | `Is_Placeholder__c` | Checkbox | Yes | Placeholder allowed per locked decision |
| Head | `Head_Subtype__c` | Picklist | No | Rotor / Spray |
| Backflow | `Backflow_Type__c` | Picklist | Yes | RPZ / DCV / PVB / Other |
| Backflow | `Last_Test_Date__c` | Date | No | Compliance tracking |
| Backflow | `Compliance_Status__c` | Picklist | No | Compliant / Due / Failed |

### 4b.5 Asset Type Resolution Rules

1. Asset-scoped sections can render only for asset types included in the resolved and snapshotted question set.
2. If required asset types are missing, bootstrap mode creates minimal records first.
3. Placeholder zones can be used to complete inspection and must set property normalization flag on completion.
4. Callouts (`WorkOrderLineItem`) must reference a concrete asset record (including placeholder assets until normalized).

---

## 5. Repair Callout — `WorkOrderLineItem` (Existing — Reference Only)

Already defined in [research/fsm_asset_architecture.md](../research/fsm_asset_architecture.md). Listed here for completeness — **no schema changes proposed**.

| Field API Name | Source | Notes |
|---|---|---|
| `AssetId` | Standard | Required for irrigation callouts — Zone/Controller/Backflow |
| `Subject` | Standard | Issue summary |
| `Quantity` / `UnitPrice` | Standard | Parts/labor |
| `Issue_Type__c` | Custom (existing) | Broken Head / Valve Fault / Controller Issue / Leak / Low Pressure / Overwatering / Clog / Other |
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
| Wet check Y/N | `Wet_Check_Performed__c` |
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

1. **On `Inspection_Response__c` insert with `Failed_Inspection__c = true`** → create/update a *suggested repair* record (no WOLI yet). Suggestions are generated continuously, de-duplicated by `(Inspection, Asset, Issue Type)`, and editable for quantity/severity/notes at checkout review.
2. **On `ServiceAppointment` checkout (Status → Completed) for irrigation Work Type** → generate internal PDF, generate customer PDF, set `Internal_PDF_Generated_At__c` / `Customer_PDF_Generated_At__c`, queue BV Connect publish if customer is subscribed.
3. **On `WorkOrderLineItem` insert with `Issue_Type__c` populated and `AssetId` set** → set `Asset.Status = Needs Repair` (existing Flow 2a in `automation_flows_design.md`).

4. **On checkout review confirm** → convert confirmed suggested repairs into AM-owned pending callout WOLIs (not pushed to ExtraWork yet). Require structured description and standardized severity on each confirmed callout.

5. **On checkout complete** → apply staged asset changes from pending-change records. If any apply fails, complete inspection data, mark asset-sync as failed, and raise a clear exception for follow-up.

---

## 10. Locked Decisions (May 11, 2026)

1. **Question library architecture:** Use custom objects, not Salesforce Assessments.
2. **Versioning:** Published questions and question sets are immutable. New versions are append-only.
3. **Set composition:** Question sets pin exact question versions at publish time.
4. **Regional model:** Regional base library with pinned base version + explicit deltas (add/override/remove markers).
5. **Allowed overrides:** Membership/order and surface behavior only; no response-type or branching-structure changes in overrides.
6. **Season model:** Separate seasonal variants derived from pinned regional variants.
7. **Runtime resolution:** Deterministic match by region + inspection type/season + work type, with exactly one published match.
8. **No match behavior:** Fail loudly with clear admin-facing error and next steps.
9. **Snapshot timing:** Selected question-set version is snapshotted at inspection start and remains locked in-flight.
10. **Asset handling in inspection:** Inline create/edit allowed via staged pending-change records; apply on completion.
11. **Asset apply failures:** Do not lose inspection. Mark asset-sync failure and create actionable exception.
12. **Bootstrap behavior:** If required assets are missing, run lightweight bootstrap based on resolved question set and inspection type.
13. **Placeholder zones:** Allowed during inspection; completion allowed with follow-up normalization flag.
14. **Callout generation:** Suggested repairs generated continuously, explicitly confirmed at checkout.
15. **Callout dedupe key:** `(Inspection, Asset, Issue Type)`.
16. **Callout evidence:** Photos optional; structured description and standardized severity required.
17. **AM flow:** Confirmed callouts are pending in Salesforce; AM creates ExtraWork estimate.
18. **AM assignment:** Required at checkout; tech may reassign from valid AM list.
19. **Checkout quality gate:** Block checkout until all required questions are answered.

## 11. Remaining Open Questions

- [ ] Photo annotation depth — caption only, or freehand markup? Freehand markup requires a richer LWC and storage approach.
- [ ] Where does the question library live for editing — pure admin UI, or a custom LWC editor for the national irrigation lead?
- [ ] Multi-zone inspection: does each zone get its own SA, or one SA with N zone-scoped responses? Recommend: one SA with N responses to keep scheduling simple.
- [ ] Tech-level revenue attribution (James's ask) — store `Inspected_By__c` user on SA is sufficient, or also denormalize onto each WOLI for easier roll-up?

---

## 12. Out of Scope (this draft)

- Conservation audit / water savings calculator (deferred per `irrigationcheckups_analysis.md`)
- E-signature on inspection summary (ExtraWork owns signatures)
- Spatial pin overlay map (covered separately in `spatial_mapping_options.md`)
- ExtraWork integration field-level mapping (covered in `fsm_asset_architecture.md`)
- BV Connect rendering of customer PDF (separate UX spec)
