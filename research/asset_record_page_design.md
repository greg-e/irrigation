# Asset Record Page Design

Stub for the Lightning record page layout for irrigation Assets in Salesforce FSM. The page should work for all Asset record types using component visibility rules to show/hide sections per type.

---

## Design Decision: Shared Page for All Record Types

One Lightning record page is used for all Asset record types (Backflow, Controller, Zone, Valve, Head, Drip). Component Visibility Rules in Lightning App Builder show/hide field sections based on the active Record Type. This is Salesforce best practice — avoids maintaining six separate pages and keeps deployment and updates centralized.

The only record-type-specific addition is the Controller type, which gets an inline `Irrigation_Program__c` related list not shown for other types. Handled via the same visibility rule.

---

## Page Structure (Lightning App Builder)

### Header / Highlights Panel

Standard Highlights Panel component — surface these key fields:

| Field | Notes |
|---|---|
| `Name` | Asset name (e.g., "Zone 3 — Front Lawn") |
| Record Type | Drives context (Backflow, Controller, Zone, etc.) |
| `Status` | Installed / Needs Repair / Decommissioned |
| `AccountId` | Property (hyperlink to Account) |
| `ParentId` | Parent Asset (e.g., which Controller owns this Zone) |
| `InstallDate` | |
| `ConsequenceOfFailure` | Badge-style — surfaced for risk visibility |

---

## Tab Layout

Recommended: two-column layout above tabs, full-width tabs below.

---

### Above-Tab Section (Always Visible)

**Left column — Core Details**

- `Description`
- `SerialNumber`
- `Product2Id` (linked product, if cataloged)
- `Price` / `Quantity`
- `Latitude` / `Longitude` (standard geo fields — populated via GPS capture LWC)

**Right column — Location & Hierarchy**

- `AccountId`
- `ParentId`
- `AssetLevel` (read-only, auto-calculated)
- `LocationId`
- Address fields

---

### Tab: Details

Content controlled by **Component Visibility Rules** (filter on Record Type):

#### Backflow Preventer (Record Type: Backflow)

- `Backflow_Type__c`
- `Last_Test_Date__c`
- `Last_Test_Result__c`
- `Next_Test_Due__c`
- `Compliance_Status__c`
- `Testing_Authority__c`

> Flag `Compliance_Status__c = Non-Compliant` with a red badge or conditional formatting via Dynamic Forms.

---

#### Controller (Record Type: Controller)

- `Controller_Make__c`
- `Zone_Count__c`
- `Connectivity_Type__c`
- `Is_Smart_Controller__c`
- `Controller_App__c`

**Related List — Irrigation Programs**
- `Irrigation_Program__c` records (child custom object)
- Show: Program Name, Days Active, Start Time, Total Run Time
- New button visible inline

---

#### Zone (Record Type: Zone)

- `Zone_Number__c`
- `Area_Served__c`
- `Flow_Rate_GPM__c`
- `Primary_Head_Type__c`
- `Controller_Asset__c`

---

#### Valve (Record Type: Valve)

- `Valve_Type__c`
- `Valve_Size__c`
- *(add additional valve fields from fsm_asset_research.md)*

---

#### Head (Record Type: Head)

- Head type, nozzle, throw radius, precipitation rate
- *(add fields from fsm_asset_research.md)*

---

#### Drip (Record Type: Drip)

- Emitter type, flow rate, spacing
- *(add fields from fsm_asset_research.md)*

---

### Tab: Work History

- **Related List — Work Orders** (where `AssetId = this record`)
  - Columns: WO Number, Subject, Status, Created Date, Closed Date
  - Filter: all statuses
- **Related List — Work Order Line Items** (where `AssetId = this record`)
  - Columns: Subject, Issue Type, Callout Status, WO Number, SA Date
  - This is the Repair Callout view — shows all `Issue_Type__c` / `Callout_Status__c` history per component
- **Related List — Service Appointments** (child of WOs linked to this Asset)
  - Columns: SA Number, Scheduled Start, Status, Assigned Resource

---

### Tab: Photos & Files

- **Files component** — standard Salesforce Files related list
- Photos uploaded during field audit attach here
- As-built drawings, install docs attach here
- Consider subfolder convention: `/Photos`, `/As-Built`, `/Inspection Reports`

---

### Tab: Spatial Map (MVP Decision Gate)

> Activate after MVP mapping stack selection (Mapbox GL JS or Google Maps JavaScript API).

- Custom LWC: shows asset pins plus optional zone polygons and pipe/wire polylines
- Backed by geospatial fields/records defined in the selected mapping implementation path
- GPS Capture button (LWC) — triggers device GPS write to `Latitude` / `Longitude`

---

## Quick Actions (Header Bar)

| Action | Type | Notes |
|---|---|---|
| New Work Order | Quick Action | Pre-fills `AssetId` and `AccountId` |
| Log Repair Callout | Quick Action | Creates a WOLI linked to this Asset and the active SA |
| Capture GPS Location | LWC Quick Action | Writes device GPS to `Latitude` / `Longitude` — Phase 1 |
| Upload Photo | Quick Action | Attaches file to this Asset record |
| Send to ExtraWork | Quick Action | Opens or invokes ExtraWork app with WO/Asset context |

---

## Mobile Considerations (FSM Mobile App)

The FSM Mobile app renders a subset of the Lightning page. Prioritize these for mobile:

- Highlights panel (Name, Status, Account, Record Type)
- Details tab — record-type-specific fields only
- Work History tab — WOLI (Repair Callouts) with New Callout action
- GPS Capture quick action
- Photo upload quick action

Avoid surfacing the Map Pin tab on mobile until the LWC is built and tested offline.

---

## Open Questions

- [x] Should `ConsequenceOfFailure` drive any automation (e.g., alert on Critical + Non-Compliant backflow)? **→ Yes — trigger automation when ConsequenceOfFailure = Critical AND Compliance_Status__c = Non-Compliant. Build as a Flow: auto-create a Case and alert the account owner.**
- [x] Is the Repair Callout quick action ("Log Repair Callout") workable without a pre-existing SA context, or does it require an active SA to attach to? **→ Require an active SA — callout must attach to a visit. Tech must have an open SA on their device before logging callouts.**
- [x] Should the Work History tab filter to show only the last 12 months by default, or all time? **→ All time — show full history by default.**
- [x] Who sets the asset `Status` field — automation, the tech, or office admin? **→ Automation — Flow-driven. Status flips to "Needs Repair" when a callout is logged; flips back to "Installed" when the parent WO is closed.**
- [ ] Which mapping stack wins MVP for the Spatial Map tab (Mapbox or Google) based on offline behavior and 12-month projected usage cost?
