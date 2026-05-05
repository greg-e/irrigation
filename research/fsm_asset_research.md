# FSM Asset Research

Research into whether the Salesforce FSM + standard Asset object is a viable path for the irrigation asset catalog and repair workflow.

---

## Verdict (Early Read)

**Strong fit.** The Salesforce Asset object is a standard, fully supported object with native FSM integration. Work Orders and Service Appointments both have native Asset lookups. Asset hierarchies are supported. This is the intended path in the Salesforce data model for tracking installed equipment and work performed against it. Custom fields on Asset will cover irrigation-specific attributes. The main gap to validate is the estimate/approval workflow — see below.

---

## 1. Asset Object (Standard)

**Source:** [Salesforce Object Reference — Asset (Spring '26 / API v66.0)](https://developer.salesforce.com/docs/atlas.en-us.260.0.object_reference.meta/object_reference/sforce_api_objects_asset.htm)

The `Asset` object represents a product or item of commercial value that a customer has purchased or that is installed at a customer site.

### Key Standard Fields Relevant to Irrigation

| Field | Type | Notes |
|---|---|---|
| `AccountId` | Lookup → Account | **Required** — links the asset to the property |
| `Name` | String | Asset name (e.g., "Zone 3 Valve", "Backflow Preventer") |
| `ParentId` | Lookup → Asset | Parent asset — enables asset hierarchy |
| `AssetLevel` | Integer | Auto-calculated hierarchy depth (root = 1) |
| `LocationId` | Lookup → Location | Physical location (e.g., warehouse, site zone) |
| `Product2Id` | Lookup → Product | Optional link to product catalog |
| `SerialNumber` | String | Component serial number |
| `InstallDate` | Date | Date installed |
| `PurchaseDate` | Date | Date purchased |
| `Status` | Picklist | Customizable — default: Purchased, Shipped, Installed, Registered, Obsolete |
| `Description` | TextArea | Free-text description |
| `Price` | Currency | Price paid |
| `Quantity` | Double | Quantity installed |
| `Address` / Lat/Long | Address / Geo | Physical location of the asset |
| `ConsequenceOfFailure` | Picklist | Insignificant / Minor / Moderate / Major / Critical |
| `AveragetimetoRepair` | Double | Hours to repair — useful for scheduling |

### Asset Hierarchy
- Supports parent-child relationships via `ParentId` up to **10,000 assets** per hierarchy
- `AssetLevel` is auto-calculated (root = 1, children = 2, etc.)
- Example for irrigation: Account → Controller (root) → Zones (children) → Heads/Valves (grandchildren)

### History & Files
- `AssetHistory` — field-level change tracking is natively available
- `AssetFeed` — Chatter feed for collaboration
- Standard Salesforce Files (`ContentDocumentLink`) attach photos, as-builts, and site maps to any Asset or Account record

---

## 2. FSM Core Data Model — Asset Integration

**Source:** [Field Service Core Data Model — Developer Guide (Spring '26)](https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap_core.htm)

### Work Order → Asset
- Work Orders have a native **Asset lookup field** — tracks work performed on a specific asset
- Work Order Line Items also have an Asset lookup — supports line-item-level asset tracking
- Completed work orders build a **native work history on the Asset record**

### Service Appointment → Asset
- Service Appointments can be created as **child records of an Asset directly** (not just Work Orders)
- A record can have multiple child Service Appointments (e.g., two visits to complete a repair)

### Work Types
- Work Types are templates applied to Work Orders and Service Appointments
- Define duration and skill requirements
- Can auto-create a child Service Appointment when a Work Order is created
- → Plan: create an "Irrigation Repair" work type, potentially sub-types per component category

---

## 3. FSM Pricing Data Model — Estimate Path

**Source:** [Field Service Pricing Data Model — Developer Guide (Spring '26)](https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap_pricing.htm)

- Work Orders support a **Price Book lookup** — associate a price book with the job
- Work Order Line Items link to **Price Book Entries** (products/services from the catalog)
- Each line item holds: product, list price, discount, quantity
- The Asset lookup on WO Line Items ties each billable line to the specific component being repaired

### Estimate Solution — ExtraWork Custom App
Estimating will be handled by a **ExtraWork custom app**. The FSM Work Order and Asset records will serve as the source of truth for what work needs to be done and against which components. The ExtraWork app will consume that context to generate estimates and manage the customer approval workflow.

**Integration touchpoints to define:**
- How does the ExtraWork app receive Work Order / Asset context? (lookup, API, custom field trigger)
- Where does approval status write back? (field on Work Order, custom status object, or external only)
- Does estimate line-item data need to flow back into FSM Work Order Line Items for reporting/history?

---

## 4. Preventive Maintenance — Seasonal Relevance

**Source:** [Field Service Preventive Maintenance Data Model — Developer Guide (Spring '26)](https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap_maintenance.htm)

- **Maintenance Plans** can cover multiple Assets under a single Account
- Can link to a Location (e.g., site/property)
- Auto-generate Work Orders on a schedule via "Generate Work Orders" action
- Work Types assignable at plan, asset, or work rule level
- → Relevant for: seasonal startup, winterization, annual backflow testing

---

## 5. Key Documentation Links

| Topic | URL |
|---|---|
| Asset Object Reference (Spring '26) | https://developer.salesforce.com/docs/atlas.en-us.260.0.object_reference.meta/object_reference/sforce_api_objects_asset.htm |
| FSM Developer Guide | https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_introduction.htm |
| FSM Data Objects Overview | https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap.htm |
| FSM Core Data Model | https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap_core.htm |
| FSM Pricing Data Model | https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap_pricing.htm |
| FSM Preventive Maintenance Data Model | https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap_maintenance.htm |
| FSM Field Service Landing Page (Start Here) | https://help.salesforce.com/s/articleView?id=service.fs_landing.htm&type=5 |
| Trailhead — Get on the Road with Field Service | https://trailhead.salesforce.com/en/trails/field_service |

---

## 6. Extending Asset for Irrigation Components

Three mechanisms work together: **Record Types**, **Custom Fields**, and **Asset Hierarchy (ParentId)**. One component type (Controller Program Settings) requires a child custom object due to its one-to-many nature.

### Approach Overview

| Mechanism | Purpose |
|---|---|
| Record Types on Asset | Differentiate component types — drives page layouts and field visibility per type |
| Custom Fields on Asset | Component-specific attributes (conditionally shown per record type) |
| Asset Hierarchy (ParentId) | Model the physical system structure |
| Child custom object: `Irrigation_Program__c` | One-to-many program/schedule records per Controller |

---

### Proposed Asset Hierarchy

```
Account (Property)
└── Irrigation System (Asset — Record Type: System, optional root node)
    └── Controller (Asset — Record Type: Controller)
        ├── Irrigation_Program__c records (child custom object)
        └── Zone 1 (Asset — Record Type: Zone)
            ├── Valve (Asset — Record Type: Valve)
            ├── Head — Rotor (Asset — Record Type: Head)
            ├── Head — Spray (Asset — Record Type: Head)
            └── Drip Emitter Group (Asset — Record Type: Drip)
        └── Zone 2 ...
    └── Backflow Preventer (Asset — Record Type: Backflow)
```

`AssetLevel` is auto-calculated — no maintenance needed.

---

### Record Types + Custom Fields by Component

#### Backflow Preventer
| Field Label | API Name | Type | Notes |
|---|---|---|---|
| Backflow Type | `Backflow_Type__c` | Picklist | Double Check, RPZ, PVB, AVB |
| Last Test Date | `Last_Test_Date__c` | Date | |
| Last Test Result | `Last_Test_Result__c` | Picklist | Pass / Fail / Not Tested |
| Next Test Due | `Next_Test_Due__c` | Date | |
| Compliance Status | `Compliance_Status__c` | Picklist | Compliant / Non-Compliant / Expired |
| Testing Authority | `Testing_Authority__c` | Text | Name of certified tester / company |
| (use standard) `SerialNumber` | — | String | |
| (use standard) `InstallDate` | — | Date | |

---

#### Controller
| Field Label | API Name | Type | Notes |
|---|---|---|---|
| Make | `Controller_Make__c` | Text | |
| Number of Zones | `Zone_Count__c` | Number | |
| Connectivity Type | `Connectivity_Type__c` | Picklist | WiFi, Wired, No Connectivity |
| Smart Controller | `Is_Smart_Controller__c` | Checkbox | |
| App / Platform | `Controller_App__c` | Text | e.g., Rain Bird app, Hunter Hydrawise |
| (use standard) `SerialNumber` | — | String | |
| (use standard) `InstallDate` | — | Date | |

**Program Settings** — stored as `Irrigation_Program__c` child records (see below).

---

#### Zone
| Field Label | API Name | Type | Notes |
|---|---|---|---|
| Zone Number | `Zone_Number__c` | Number | |
| Area Served | `Area_Served__c` | Text | e.g., "Front lawn", "Drip beds NW" |
| Flow Rate (GPM) | `Flow_Rate_GPM__c` | Number | |
| Primary Head Type | `Primary_Head_Type__c` | Picklist | Rotor, Spray, Bubbler, Drip |
| Controller Asset | `Controller_Asset__c` | Lookup → Asset | Redundant with ParentId but useful for direct query |
| (use standard) `ParentId` | — | Lookup → Asset | Points to Controller Asset |

---

#### Valve
| Field Label | API Name | Type | Notes |
|---|---|---|---|
| Valve Type | `Valve_Type__c` | Picklist | Solenoid, Ball, Gate, Master |
| Zone Association | `Zone_Asset__c` | Lookup → Asset | |
| Valve Location Notes | `Valve_Location_Notes__c` | Text | e.g., "NW corner near fence" |
| Condition | `Valve_Condition__c` | Picklist | Good / Needs Attention / Failed |
| (use standard) `ParentId` | — | Lookup → Asset | Points to Zone Asset |
| (use standard) `InstallDate` | — | Date | |

---

#### Head
| Field Label | API Name | Type | Notes |
|---|---|---|---|
| Head Type | `Head_Type__c` | Picklist | Rotor, Spray, Bubbler |
| Nozzle Size | `Nozzle_Size__c` | Text | e.g., "4 inch", "1.5 GPM" |
| Throw Radius (ft) | `Throw_Radius_ft__c` | Number | |
| Arc (degrees) | `Arc_Degrees__c` | Number | |
| Zone Association | `Zone_Asset__c` | Lookup → Asset | |
| (use standard) `ParentId` | — | Lookup → Asset | Points to Zone Asset |
| (use standard) `InstallDate` | — | Date | |

---

#### Drip
| Field Label | API Name | Type | Notes |
|---|---|---|---|
| Emitter Type | `Emitter_Type__c` | Picklist | Point Emitter, Drip Line, Micro Spray, Flag Emitter |
| Flow Rate (GPH) | `Flow_Rate_GPH__c` | Number | Per emitter |
| Emitter Count | `Emitter_Count__c` | Number | Total in zone/group |
| Coverage Area (sq ft) | `Coverage_Area_sqft__c` | Number | |
| Zone Association | `Zone_Asset__c` | Lookup → Asset | |
| (use standard) `ParentId` | — | Lookup → Asset | Points to Zone Asset |

---

### Child Custom Object: `Irrigation_Program__c`

Program Settings are a one-to-many relationship to the Controller — one controller runs multiple programs, each with multiple zone run times. A flat field set on the Controller Asset can't model this cleanly.

| Field Label | API Name | Type | Notes |
|---|---|---|---|
| Controller Asset | `Controller_Asset__c` | Master-Detail → Asset | Parent Controller |
| Program Name | `Program_Name__c` | Text | e.g., "Program A", "Drip Schedule" |
| Schedule Days | `Schedule_Days__c` | Multi-select Picklist | Mon/Tue/Wed/Thu/Fri/Sat/Sun |
| Start Time | `Start_Time__c` | Time | |
| Zone | `Zone_Asset__c` | Lookup → Asset | Zone this run applies to |
| Run Time (minutes) | `Run_Time_Minutes__c` | Number | |
| Seasonal Adjust (%) | `Seasonal_Adjust_Pct__c` | Number | |
| Active | `Is_Active__c` | Checkbox | |

> Note: If a controller runs 3 programs × 6 zones, that's 18 `Irrigation_Program__c` records per controller. Manageable and queryable.

---

### Damage and Repair — Not on Asset Fields

Damage events and repair history are **not stored as fields on the Asset** — they're tracked through the FSM Work Order / Service Appointment records that already link to the Asset. This gives you:
- A native, timestamped history of every repair tied to the Asset record
- Work Order Line Items showing parts and labor per component
- Before/after photos attached to the Service Appointment or Work Order

For damage reported **outside of a formal work order** (e.g., noted during an audit), use a hybrid model:
- Case for intake, triage, and assignment workflow
- `Asset_Damage_Event__c` for structured damage analytics and repeat-failure tracking

---

## 7. Open Questions

- [x] ~~Does the org have Salesforce FSM (Field Service) enabled and licensed?~~ — Yes
- [x] ~~Is CPQ / Revenue Cloud available for native estimate/quote generation?~~ — Estimating handled by ExtraWork custom app
- [x] ~~How will Program Settings (controller schedules) be stored?~~ — Child custom object `Irrigation_Program__c`
- [x] ~~Will as-built site maps be managed as versioned Files on the Account, or does this need a dedicated document management approach?~~ — Versioned Files on Account
- [x] ~~Are there existing Product/Price Book records for irrigation parts and labor that Work Order Line Items could reference?~~ — Partially
- [x] ~~For damage logged outside a work order — custom `Asset_Damage_Event__c` child object or native Case?~~ — Both (Case for intake + custom object for structured tracking)

---

## 8. Salesforce Maps Evaluation

### Opportunity

SF Maps can plot any Salesforce object with lat/long or address fields on an interactive map. The `Asset` object has native `Latitude`, `Longitude`, and `Address` fields, making it immediately compatible.

### What SF Maps Adds for Irrigation

- **Asset Data Layer** — plot irrigation Assets on a map, filterable by Record Type (e.g., all Backflows in red, Controllers in blue, overdue-test assets highlighted)
- **Property-level dispatcher view** — see which accounts have upcoming or overdue Service Appointments across a territory
- **Route optimization** — optimize technician routes between properties on the same day, directly integrated with FSM Service Appointments
- **Territory coverage visibility** — see gaps, density, and workload across service areas

### Critical Limitation — SF Maps is Property-to-Property Only

SF Maps operates at **address/geocode precision**. It cannot:
- Show a site plan or yard layout of a property
- Plot components at sub-property spatial precision (where Zone 3's valve is in the NW corner)
- Render irrigation system drawings or as-built overlays

### Spatial Problem Split

| Spatial Need | Tool |
|---|---|
| Which properties are in a territory / due for service | SF Maps — native |
| Route optimization between properties | SF Maps — native |
| Where on a property each component is located | Files on Account (as-built PDFs/images) |
| Interactive yard-level component pinning | Custom LWC with background image + pin overlay (future phase) |
| GIS-level precision | External GIS tool embedded via LWC (e.g., ArcGIS, Google Maps API) |

### Recommendation

Use SF Maps for **inter-property** dispatch, territory, and routing visibility. Stick with Files on Account for within-property as-built documentation. These are two different spatial problems — SF Maps solves the first; it cannot solve the second.

**SF Maps license required** — confirm whether it is included in the current Salesforce edition or requires an add-on.

### Source
- https://help.salesforce.com/s/articleView?id=sales.salesforce_maps_intro.htm&type=5
- https://developer.salesforce.com/docs/atlas.en-us.maps_developer_guide.meta/maps_developer_guide/maps_overview.htm
