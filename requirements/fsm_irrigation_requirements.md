# FSM Irrigation Requirements

## 1. Asset Hierarchy

The hierarchy is easiest to read in tree form.

```text
Account / Property
└── System
    └── Source
        └── Backflow
            └── Controller
                ├── Programs
                ├── Zone 1
                └── Zone 2
```

### 1.1 Hierarchy Rules

| Rule | Requirement |
|---|---|
| Parent-child consistency | Every asset must use the correct parent type for its record type. |
| Property system cardinality | Each Property has exactly one System. |
| Source ownership | A Source must belong to exactly one System. |
| Backflow ownership | A Backflow must belong to exactly one Source. |
| Controller ownership | A Controller must belong to exactly one Backflow. |
| Zone ownership | A Zone must belong to exactly one Controller. |
| System grouping | System is required and groups a property's irrigation assets. |
| Naming | Zone display names should be normalized to `Zone <number>` to reduce user input. |
| Retire-only behavior | Assets should be retired, not hard deleted, when removed from active use. |
| Component modeling | Pump, valve, head, drip, and other subcomponents are represented as metadata on Standard hierarchy assets, not as separate child assets. |

## 2. Component Metadata

This section defines the prototype-driven metadata baseline for each irrigation asset type in the desktop setup flow (`prototype/desktop/desktop_v3.1.html` + `property_record.js`).

### 2.1 Common Metadata

| Field | Purpose | Applies To |
|---|---|---|
| `Name` | Human-readable asset name shown in UI and hierarchy. | All assets (Zone name is system-generated) |
| `Asset Type` | Standard asset discriminator. | All assets |
| `Status` | Active / Retired lifecycle state. | All assets |
| `Parent` | Links the asset to the correct place in the hierarchy. | All assets except System root |
| `Install Date` | Optional lifecycle date captured in edit flow. | System, Source, Backflow, Controller, Zone |
| `Description` | Optional free-text context. | System, Source, Backflow, Controller, Zone |

### 2.2 System Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Root grouping label for the irrigation system. |
| `Asset Type` | Yes | Must be `System`. |
| `Parent` | No | Stored as root (`parentId = null`) and grouped under the selected Property context. |
| `Description` | No | Optional system context shown in detail panel. |
| `Install Date` | No | Useful for lifecycle context. |
| `Serial Number` | No | Displayed in detail panel; currently edit flow clears this value (known prototype gap). |
| `Mainline Pipe Type` | No | Descriptive pipe material (PVC, Poly, Copper, etc.). Optional; captured at setup. |
| `Mainline Pipe Size` | No | Descriptive pipe diameter (e.g., 1", 1.5"). Optional; captured at setup. |

### 2.3 Controller Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Controller display name. |
| `Asset Type` | Yes | Must be `Controller`. |
| `Parent` | Yes | Parent is `Backflow`. |
| `Controller Label` | Yes | Human-friendly identifier used by the tech. |
| `Total Zones` | Yes | Capacity / zone count for the controller. |
| `Make / Model` | No | Manufacturer and model information. |
| `Connectivity Type` | No | For example WiFi, Wired, or No Connectivity. |
| `Smart Controller` | No | Indicates whether the controller is smart / weather-based. |
| `Controller App / Platform` | No | Companion app name or platform name. |
| `Install Date` | No | Optional lifecycle date. |

### 2.4 Source Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Source display name. |
| `Asset Type` | Yes | Must be `Source`. |
| `Parent` | Yes | Parent is `System`. |
| `Water Source Type` | No | Examples: Potable, Reclaimed, Well, Other. |
| `Source Capacity` | No | Optional capacity or pressure metadata for planning. |
| `Install Date` | No | Optional lifecycle date. |

### 2.5 Zone Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Automatically generated and normalized to `Zone <number>`. |
| `Asset Type` | Yes | Must be `Zone`. |
| `Parent` | Yes | Parent is the Controller. |
| `Zone Number` | Yes | Primary zone identifier; must be unique per Property. |
| `Area Served` | No | Human-readable area description. |
| `Flow Rate (GPM)` | No | Operational or design flow rate. |
| `Primary Head Type` | No | Useful when the zone is mapped to a head subtype. |
| `Distribution Method` | No | Spray / Rotor / Bubbler / Drip. Captured during inspection per Q6.3. |
| `Lateral Pipe Type` | No | Descriptive lateral/drip line material. Optional; examples: soaker hose, drip tape, mainline lateral. |
| `Lateral Pipe Size` | No | Descriptive diameter/designation. Optional. |
| `Solenoid Resistance (Ω)` | No | Last measured solenoid resistance in ohms. Nominal range 20–60 Ω; out-of-range flags valve diagnostic need. Written by inspection checkout via Q6.13c. |
| `Install Date` | No | Optional lifecycle date. |

### 2.6 Backflow Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Backflow display name. |
| `Asset Type` | Yes | Must be `Backflow`. |
| `Parent` | Yes | Parent is the Source. |
| `Backflow Type` | Yes | Examples: RPZ, DCV, PVB, Other. |
| `Serial Number` | No | Useful for compliance tracking. |
| `Last Test Date` | No | Compliance history. |
| `Last Test Result` | No | Options in prototype: Pass, Fail, Not Tested. |
| `Next Test Due` | No | Optional date for upcoming compliance activity. |
| `Compliance Status` | No | Current compliance state. |
| `Testing Authority` | No | Authority or vendor responsible for testing. |

### 2.7 Inspection-Linked Metadata

These fields come from the Standard question library and should live alongside the asset metadata model so setup, inspection, and reporting all refer to the same record shape.

| Asset Type | Metadata | Required | Notes |
|---|---|---|---|
| Source | `Water Source Type` | Yes | Potable / Reclaimed / Well / Pond / Other. Captured by inspection Q3.1 and stored on the Source asset. |
| Source | `Source Capacity` | No | Optional capacity or pressure metadata for planning. |
| Backflow | `Backflow Type` | Yes | RPZ / DCV / PVB / Other. Captured by inspection Q4.1 and stored on the Backflow asset. |
| Controller | `Controller Label` | Yes | Human-friendly controller identifier used in the field. Captured by inspection Q5.2. |
| Controller | `Total Zones` | Yes | Capacity / zone count for the controller. Captured by inspection Q5.3. |
| Controller | `Make / Model` | No | Manufacturer and model information. Captured by inspection Q5.1 when discovered or corrected. |
| Controller | `Smart Controller` | No | Indicates whether the controller is smart / weather-based. Captured by inspection Q5.8. |
| Controller | `Flow Sensor Connected and Functional` | No | Controller equipment-package metadata. Captured by inspection Q5.9 when applicable. |
| Zone | `Zone Number` | Yes | Primary zone identifier; must be unique per Property. Captured by inspection Q6.1. |
| Zone | `Area Served` | No | Human-readable area description. Captured by inspection Q6.2. |
| Zone | `Distribution Method` | No | Spray / Rotor / Bubbler / Drip. Captured by inspection Q6.3. |
| Zone | `Landscape Type` | No | Turf / Bed / Color or similar setup label used by the field team. Captured by inspection Q6.4. |
| Zone | `# of Heads` | No | Zone component metadata. Captured by inspection Q6.5. |
| Zone | `Solenoid Resistance (Ω)` | No | Last measured solenoid resistance in ohms. Captured by inspection Q6.13c. |
| System | `Mainline Pipe Type` | No | Descriptive pipe material. Captured during setup and referenced in inspection reporting. |
| System | `Mainline Pipe Size` | No | Descriptive diameter/designation. Captured during setup and referenced in inspection reporting. |

### 2.8 Inspection Checklist Items

These are visit-scoped observations or actionable finding prompts. They should not be treated as static asset metadata, even when they are recorded against an asset-scoped inspection response.

| Asset Type | Checklist Item | Required | Notes |
|---|---|---|---|
| Source | Water restrictions in place? | Yes | Compliance check captured during the visit. |
| Source | Restriction details | Conditional | Required when restrictions are in place. |
| Source | Pump operational? | Conditional | Only when the Source asset has pump context. |
| Source | Pump pressure (PSI) | No | Diagnostic reading taken during the visit. |
| Backflow | Visible damage? | Yes | Visual condition check. |
| Backflow | Leaks at backflow assembly? | Yes | Visual condition check. |
| Backflow | Test required this visit? | Yes | Drives test-specific branching. |
| Backflow | Test passed? | Conditional | Required when testing is performed. |
| Backflow | Test certificate uploaded? | Conditional | Required when testing is performed. |
| Backflow | Insulation / freeze protection in place? | No | Seasonal checklist prompt. |
| Controller | Controller power state | Yes | On / Off. |
| Controller | Backflow state | Yes | On / Off. |
| Controller | Meter state | Yes | On / Off. |
| Controller | Rain / freeze sensor working? | Yes | Controller accessory check. |
| Controller | Master valve operational? | No | Conditional to applicable sites. |
| Controller | Programs match contract / season? | Yes | Programming audit. |
| Controller | Adjustments made this visit? | Yes | Drives adjustment notes. |
| Controller | Adjustment notes | Conditional | Required when adjustments were made. |
| Controller | System winterized / drained? | Conditional | Winterization-only branch. |
| Zone | Minutes / zone (runtime) | No | Operational/programming observation. |
| Zone | No issues found | Yes | Mutually exclusive with failure items below. |
| Zone | Broken head | Yes | Failure item; creates an actionable checklist finding (can map to WOLI in AM flow). |
| Zone | Broken / clogged nozzle | Yes | Failure item; creates an actionable checklist finding (can map to WOLI in AM flow). |
| Zone | Sunken / tilted head | Yes | Failure item; creates an actionable checklist finding (can map to WOLI in AM flow). |
| Zone | Head not retracting | Yes | Failure item; creates an actionable checklist finding (can map to WOLI in AM flow). |
| Zone | Head not rotating | Yes | Failure item; creates an actionable checklist finding (can map to WOLI in AM flow). |
| Zone | Overwatering onto hardscape | No | Region-specific delta. |
| Zone | Lateral leak | Yes | Failure item; creates an actionable checklist finding (can map to WOLI in AM flow). |
| Zone | Valve not activating | Yes | Failure item; creates an actionable checklist finding (can map to WOLI in AM flow). |
| Zone | Seeping valve | Yes | Failure item; creates an actionable checklist finding (can map to WOLI in AM flow). |
| Zone | Bad solenoid | Yes | Failure item; creates an actionable checklist finding (can map to WOLI in AM flow). |
| Zone | Valve box lid missing | Yes | Failure item; creates an actionable checklist finding (can map to WOLI in AM flow). |
| Zone | Broken drip line | Conditional | Drip-only branch. |
| Zone | Drip emitters / filter / regulator OK? | Conditional | Drip-only branch. |
| Zone | Repairs made on site this visit? | Yes | Captures whether the tech completed corrective work. |
| Zone | Repair description | Conditional | Required when repairs were made. |
| Zone | Zone notes | No | Free-form inspection notes. |
| System | Visible mainline leak? | Yes | Mainline/distribution summary. |
| System | Mainline pressure stable? | No | System-level condition check. |
| System | Isolation valves operational? | No | System-level condition check. |
| System | Quick coupler valves operational (where applicable)? | No | System-level condition check. |

### 2.9 Component Metadata (Non-Hierarchy)

Pump, valve, head, drip, and other equipment details are modeled as metadata attached to Standard hierarchy assets. This keeps the hierarchy fixed at System -> Source -> Backflow -> Controller -> Zone while still supporting detailed operational capture.

Examples:
1. Zone-level metadata: valve type, head mix, emitter profile, lateral pipe attributes.
2. Controller-level metadata: sensor package, flow monitoring setup.
3. Backflow-level metadata: compliance and testing attributes.

### 2.10 Create-Time Required Field Rules (Prototype)

The desktop prototype currently enforces these required fields at create time:

| Asset Type | Required Fields at Create |
|---|---|
| `System` | `Name` |
| `Source` | `Name`, `Parent System` |
| `Backflow` | `Name`, `Backflow Type`, `Parent Source` |
| `Controller` | `Name`, `Controller Label`, `Total Zones`, `Parent Backflow` |
| `Zone` | `Zone Number`, `Parent Controller` (name auto-normalized) |

## 3. Standard Salesforce Metadata Baseline

This section is the Standard Salesforce field dictionary for irrigation asset setup, Map representation, inspection outcomes, and repair execution.

### 3.1 Cross-Asset Standard Field Dictionary

| Standard Field | SF Object.Field | Type | Allowed Values / Rule | Schema Required | Process Required | Applies To |
|---|---|---|---|---|---|---|
| `asset_uid` | `Asset.Id` | Id | System-generated Salesforce Id. | Yes | Yes | All assets |
| `asset_type` | `Asset.Asset_Type__c` | Picklist | `System`, `Source`, `Backflow`, `Controller`, `Zone`. | No | Yes | All assets |
| `asset_name` | `Asset.Name` | Text | Non-blank user-facing name (Zone name normalized from number). | Yes | Yes | All assets |
| `parent_asset_uid` | `Asset.ParentId` | Lookup(Asset) | Required for all non-root assets with correct parent type. | No | Conditional | Source, Backflow, Controller, Zone |
| `lifecycle_status` | `Asset.Status` | Picklist | `Installed`, `Needs Repair`, `Repair In Progress`, `Decommissioned`. | No | Yes | All assets |
| `map_feature_id` | `Map_Feature__c.Id` | Id | System-generated Salesforce Id. | Yes | Yes | Mappable assets |
| `location_geometry` | `Map_Feature__c.GeoJSON_Geometry__c` | Long Text | Valid GeoJSON; geometry type must match component rule. | No | Yes | Mappable assets |
| `feature_type` | `Map_Feature__c.Feature_Type__c` | Picklist | `Point`, `Polygon`, `LineString`. | No | Yes | Mappable assets |
| `latitude` | `Asset.Latitude` | Number(10,7) | `-90` to `90`; centroid reference only. | No | Conditional | Point-addressable assets |
| `longitude` | `Asset.Longitude` | Number(10,7) | `-180` to `180`; centroid reference only. | No | Conditional | Point-addressable assets |
| `spatial_source` | `Map_Feature__c.Spatial_Source__c` | Picklist | `Unknown`, `As-Built`, `CAD`, `Digitized`, `GPS`, `Field Sketch`. | No | Yes | Mappable assets |
| `spatial_confidence` | `Map_Feature__c.Spatial_Confidence__c` | Picklist | `Unknown`, `High`, `Medium`, `Low`. | No | Yes | Mappable assets |
| `last_inspected_at` | `Asset.Last_Inspected_At__c` | DateTime | Set on inspection completion. | No | Yes | All assets |
| `condition_score` | `Asset.Condition_Score__c` | Number(1,0) | Integer `1`-`5`. | No | Yes | Condition-scored assets |
| `repairs_needed` | `ServiceAppointment.Repairs_Needed__c` | Checkbox | `true` / `false`; set in inspection workflow. | No | Yes | Visit scope |
| `issue_type` | `WorkOrderLineItem.Issue_Type__c` | Picklist | Controlled issue taxonomy. | No | Conditional | Actionable findings mapped to WOLI |
| `issue_quantity` | `WorkOrderLineItem.Quantity` | Number | Integer `>= 1` when actionable finding is mapped. | No | Conditional | Actionable findings mapped to WOLI |
| `callout_status` | `WorkOrderLineItem.Callout_Status__c` | Picklist | `New`, `Quoted`, `Approved`, `Completed` (legacy API name retained). | No | Conditional | Actionable findings mapped to WOLI |

### 3.2 Asset-Specific Metadata and Map Rules

| Asset Type | Required Metadata (Process) | Optional Metadata (Key) | Required Geometry |
|---|---|---|---|
| `System` | `Asset.Asset_Type__c = System`, `Asset.Name` | Description, Mainline Pipe Type, Mainline Pipe Size | Point or Polygon |
| `Source` | `Asset.Asset_Type__c = Source`, `Asset.Name`, `Asset.ParentId` (System parent) | Water Source Type, Source Capacity | Point |
| `Backflow` | `Asset.Asset_Type__c = Backflow`, `Asset.Name`, `Asset.ParentId` (Source parent) | Backflow Type, Serial Number, Last Test Date, Next Test Due, Compliance Status | Point |
| `Controller` | `Asset.Asset_Type__c = Controller`, `Asset.Name`, `Asset.ParentId` (Backflow parent), `Asset.Controller_Total_Zones__c` | Controller Label, Make / Model, Connectivity Type, Smart Controller, Controller App / Platform | Point |
| `Zone` | `Asset.Asset_Type__c = Zone`, `Asset.ParentId` (Controller parent), `Asset.Zone_Number__c` | Area Served, Flow Rate (GPM), Distribution Method, Lateral Pipe Type, Lateral Pipe Size, Solenoid Resistance (ohms) | Polygon |

### 3.3 Controlled Domains

| Domain | Values |
|---|---|
| `Asset.Asset_Type__c` | `System`, `Source`, `Backflow`, `Controller`, `Zone` |
| `Map_Feature__c.Spatial_Source__c` | `Unknown`, `As-Built`, `CAD`, `Digitized`, `GPS`, `Field Sketch` |
| `Map_Feature__c.Spatial_Confidence__c` | `Unknown`, `High`, `Medium`, `Low` |
| `Asset.Condition_Score__c` | `1`, `2`, `3`, `4`, `5` |
| `WorkOrderLineItem.Callout_Status__c` | `New`, `Quoted`, `Approved`, `Completed` |

### 3.4 Data Quality Controls and Ownership

| Control | Enforcement |
|---|---|
| Active mappable components must have linked `Map_Feature__c` rows. | Process QA + automation |
| `Map_Feature__c.Feature_Type__c` must match asset geometry rule. | Validation + map QA |
| `Asset.Condition_Score__c` must remain integer `1`-`5`. | Validation rule |
| Non-root assets must have valid parent by hierarchy rule. | Validation + setup flow checks |
| `WorkOrderLineItem.Callout_Status__c` must stay in approved status domain. | Validation + automation |

Ownership baseline:
1. Data owner: Operations / Field Operations / Compliance Operations by process area.
2. System owner: Salesforce Admin (metadata, validation, automation control).
3. Change governance: new domains or semantics require decision log update before release.

## 4. Notes

1. This file starts with the Standard asset hierarchy and metadata because that is the base model every setup and validation decision depends on.
2. This document should stay aligned with the prototype behavior in `prototype/desktop/` and the broader irrigation requirements set.
3. This document is the Standard metadata reference for irrigation assets and supersedes the standalone dictionary format.
4. If new asset types are introduced, they should be added here with their parent rule and minimum metadata before they are added to the setup UI.


