# FSM Irrigation Requirements

## 1. Asset Hierarchy

The hierarchy is easiest to read in tree form.

```text
Property Account
└── System
    └── Point of Connection (Meta: Water Source)
        ├── Pump
        ├── Backflow
        ├── Master Valve
        ├── Flow Sensor
        └── Controller
            └── Zone (Valve, Station)
```

### 1.1 Hierarchy Rules

| Rule | Requirement |
|---|---|
| Parent-child consistency | Every asset must use the correct parent type for its record type. |
| Property system cardinality | Each Property has exactly one System. |
| Point of Connection ownership | A Point of Connection must belong to exactly one System. |
| Pump ownership | A Pump must belong to exactly one Point of Connection. |
| Backflow ownership | A Backflow must belong to exactly one Point of Connection. |
| Master Valve ownership | A Master Valve must belong to exactly one Point of Connection. |
| Flow Sensor ownership | A Flow Sensor must belong to exactly one Point of Connection. |
| Controller ownership | A Controller must belong to exactly one Point of Connection. |
| Zone ownership | A Zone must belong to exactly one Controller. |
| System grouping | System is required and groups a property's irrigation assets. |
| Naming | Zone display names should be normalized to `Zone <number>` to reduce user input. |
| Retire-only behavior | Assets should be retired, not hard deleted, when removed from active use. |
| Component modeling | Valve and station details are represented as zone-linked metadata; Point-of-Connection assets (Pump, Backflow, Master Valve, Flow Sensor) are explicit hierarchy children. |

## 2. Component Metadata

This section defines the prototype-driven metadata baseline for each irrigation asset type in the desktop setup flow (`prototype/desktop/desktop_v3.1.html` + `property_record.js`).

### 2.1 Common Metadata

| Field | Purpose | Applies To |
|---|---|---|
| `Name` | Human-readable asset name shown in UI and hierarchy. | All assets (Zone name is system-generated) |
| `Asset Type` | Standard asset discriminator. | All assets |
| `Status` | Active / Retired lifecycle state. | All assets |
| `Parent` | Links the asset to the correct place in the hierarchy. | All assets except System root |
| `Install Date` | Optional lifecycle date captured in edit flow. | System, Point of Connection, Pump, Backflow, Master Valve, Flow Sensor, Controller, Zone |
| `Description` | Optional free-text context. | System, Point of Connection, Pump, Backflow, Master Valve, Flow Sensor, Controller, Zone |

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
| `Parent` | Yes | Parent is the Point of Connection. |
| `Controller Label` | Yes | Human-friendly identifier used by the tech. |
| `Total Zones` | Yes | Capacity / zone count for the controller. |
| `Make / Model` | No | Manufacturer and model information. |
| `Connectivity Type` | No | For example WiFi, Wired, or No Connectivity. |
| `Smart Controller` | No | Indicates whether the controller is smart / weather-based. |
| `Controller App / Platform` | No | Companion app name or platform name. |
| `Install Date` | No | Optional lifecycle date. |

### 2.4 Point of Connection Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Point-of-Connection display name. |
| `Asset Type` | Yes | Must be `Point of Connection`. |
| `Parent` | Yes | Parent is `System`. |
| `Water Source Type` | No | Meta field examples: Potable, Reclaimed, Well, Other. |
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
| `Parent` | Yes | Parent is the Point of Connection. |
| `Backflow Type` | Yes | Examples: RPZ, DCV, PVB, Other. |
| `Serial Number` | No | Useful for compliance tracking. |
| `Last Test Date` | No | Compliance history. |
| `Last Test Result` | No | Options in prototype: Pass, Fail, Not Tested. |
| `Next Test Due` | No | Optional date for upcoming compliance activity. |
| `Compliance Status` | No | Current compliance state. |
| `Testing Authority` | No | Authority or vendor responsible for testing. |

### 2.7 Pump Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Pump display name. |
| `Asset Type` | Yes | Must be `Pump`. |
| `Parent` | Yes | Parent is the Point of Connection. |
| `Operational Status` | No | Running / Off / Faulted snapshot from inspection or service event. |
| `Pressure (PSI)` | No | Last observed pressure reading at inspection time. |
| `Pump Type` | No | Example values: Booster, Well, Transfer, Other. |
| `Install Date` | No | Optional lifecycle date. |

### 2.8 Master Valve Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Master valve display name. |
| `Asset Type` | Yes | Must be `Master Valve`. |
| `Parent` | Yes | Parent is the Point of Connection. |
| `Operational Status` | No | Open / Closed / Faulted snapshot from inspection or service event. |
| `Valve Type` | No | Example values: Normally Closed, Normally Open, Latching, Other. |
| `Solenoid Resistance (Ω)` | No | Measured value used for troubleshooting when applicable. |
| `Install Date` | No | Optional lifecycle date. |

### 2.9 Flow Sensor Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Flow sensor display name. |
| `Asset Type` | Yes | Must be `Flow Sensor`. |
| `Parent` | Yes | Parent is the Point of Connection. |
| `Functional Status` | No | Connected / Not Connected / Faulted. |
| `Sensor Model` | No | Manufacturer/model value used for troubleshooting. |
| `Flow Reading (GPM)` | No | Last observed live reading when available. |
| `Install Date` | No | Optional lifecycle date. |

### 2.10 Zone Subcomponent Metadata (Valve + Station)

| Metadata | Required | Notes |
|---|---|---|
| `Valve Type` | No | Zone valve hardware classification. |
| `Valve Size` | No | Physical size/designation. |
| `Valve Location Notes` | No | Field notes for locating the valve box and valve. |
| `Station Identifier` | No | Controller station/channel mapped to this zone. |
| `Station Wire Path Notes` | No | Wiring trace notes for troubleshooting. |
| `Station Electrical Status` | No | Good / Open / Short / Intermittent. |

### 2.11 Inspection-Linked Metadata

These fields come from the Standard question library and should live alongside the asset metadata model so setup, inspection, and reporting all refer to the same record shape.

| Asset Type | Metadata | Required | Notes |
|---|---|---|---|
| System | `Mainline Pipe Type` | No | Descriptive pipe material. Captured during setup and referenced in inspection reporting. |
| System | `Mainline Pipe Size` | No | Descriptive diameter/designation. Captured during setup and referenced in inspection reporting. |
| Point of Connection | `Water Source Type` | Yes | Potable / Reclaimed / Well / Pond / Other. Captured by inspection Q3.1 and stored on the Point of Connection asset. |
| Point of Connection | `Source Capacity` | No | Optional capacity or pressure metadata for planning. |
| Pump | `Operational Status` | No | Captured when pump equipment is present and inspected. |
| Pump | `Pressure (PSI)` | No | Captured from field reading during inspection/service. |
| Backflow | `Backflow Type` | Yes | RPZ / DCV / PVB / Other. Captured by inspection Q4.1 and stored on the Backflow asset. |
| Master Valve | `Operational Status` | No | Captured when master valve is installed at the site. |
| Master Valve | `Solenoid Resistance (Ω)` | No | Diagnostic measurement captured when troubleshooting is performed. |
| Flow Sensor | `Functional Status` | No | Connected / Not Connected / Faulted state captured during inspection. |
| Flow Sensor | `Flow Reading (GPM)` | No | Current reading captured when sensor telemetry is available. |
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
| Zone | `Station Identifier` | No | Controller station/channel mapping for this zone. |
| Zone | `Station Electrical Status` | No | Wiring health result captured during troubleshooting. |

### 2.12 Inspection Checklist Items

These are visit-scoped observations or actionable finding prompts. They should not be treated as static asset metadata, even when they are recorded against an asset-scoped inspection response.

| Asset Type | Checklist Item | Required | Notes |
|---|---|---|---|
| System | Visible mainline leak? | Yes | Mainline/distribution summary. |
| System | Mainline pressure stable? | No | System-level condition check. |
| System | Isolation valves operational? | No | System-level condition check. |
| System | Quick coupler valves operational (where applicable)? | No | System-level condition check. |
| Point of Connection | Water restrictions in place? | Yes | Compliance check captured during the visit. |
| Point of Connection | Restriction details | Conditional | Required when restrictions are in place. |
| Pump | Pump operational? | Conditional | Required when a Pump component exists under the Point of Connection. |
| Pump | Pump pressure (PSI) | No | Diagnostic reading taken during the visit. |
| Pump | Pump cycling/noise abnormal? | No | Flags short-cycling or abnormal operating behavior. |
| Backflow | Visible damage? | Yes | Visual condition check. |
| Backflow | Leaks at backflow assembly? | Yes | Visual condition check. |
| Backflow | Test required this visit? | Yes | Drives test-specific branching. |
| Backflow | Test passed? | Conditional | Required when testing is performed. |
| Backflow | Test certificate uploaded? | Conditional | Required when testing is performed. |
| Backflow | Insulation / freeze protection in place? | No | Seasonal checklist prompt. |
| Master Valve | Master valve operational? | Conditional | Required when a Master Valve component exists. |
| Master Valve | Master valve leaking? | No | Condition check for seepage or failure. |
| Master Valve | Master valve manual override functional? | No | Confirms serviceability during diagnostics. |
| Flow Sensor | Flow sensor installed and connected? | Conditional | Required when a Flow Sensor component exists. |
| Flow Sensor | Flow sensor reading plausible? | No | Confirms observed reading matches expected zone/system behavior. |
| Flow Sensor | Flow sensor fault/alarm present? | No | Captures diagnostic state for follow-up. |
| Controller | Controller power state | Yes | On / Off. |
| Controller | Backflow state | Yes | On / Off. |
| Controller | Meter state | Yes | On / Off. |
| Controller | Rain / freeze sensor working? | Yes | Controller accessory check. |
| Controller | Programs match contract / season? | Yes | Programming audit. |
| Controller | Adjustments made this visit? | Yes | Drives adjustment notes. |
| Controller | Adjustment notes | Conditional | Required when adjustments were made. |
| Controller | System winterized / drained? | Conditional | Winterization-only branch. |
| Zone | Minutes / zone (runtime) | No | Operational/programming observation. |
| Zone | No issues found | Yes | Mutually exclusive with failure items below. |
| Zone | Broken head | Yes | Failure item; creates an actionable checklist finding. |
| Zone | Broken / clogged nozzle | Yes | Failure item; creates an actionable checklist finding. |
| Zone | Sunken / tilted head | Yes | Failure item; creates an actionable checklist finding. |
| Zone | Head not retracting | Yes | Failure item; creates an actionable checklist finding. |
| Zone | Head not rotating | Yes | Failure item; creates an actionable checklist finding. |
| Zone | Overwatering onto hardscape | No | Region-specific delta. |
| Zone | Lateral leak | Yes | Failure item; creates an actionable checklist finding. |
| Zone | Valve not activating | Yes | Failure item; creates an actionable checklist finding. |
| Zone | Seeping valve | Yes | Failure item; creates an actionable checklist finding. |
| Zone | Bad solenoid | Yes | Failure item; creates an actionable checklist finding. |
| Zone | Valve box lid missing | Yes | Failure item; creates an actionable checklist finding. |
| Zone | Broken drip line | Conditional | Drip-only branch. |
| Zone | Drip emitters / filter / regulator OK? | Conditional | Drip-only branch. |
| Zone | Station wiring fault observed? | No | Captures station-level electrical issues linked to the zone. |
| Zone | Repairs made on site this visit? | Yes | Captures whether the tech completed corrective work. |
| Zone | Repair description | Conditional | Required when repairs were made. |
| Zone | Zone notes | No | Free-form inspection notes. |

### 2.13 Component Metadata (Non-Hierarchy)

Valve, head, drip, station, and other zone-level equipment details are modeled as metadata attached to Standard hierarchy assets. This keeps the hierarchy fixed at System -> Point of Connection -> Controller -> Zone (with Pump, Backflow, Master Valve, and Flow Sensor as Point-of-Connection children) while still supporting detailed operational capture.

Examples:
1. Zone-level metadata: valve type, head mix, emitter profile, lateral pipe attributes.
2. Controller-level metadata: sensor package, flow monitoring setup.
3. Backflow-level metadata: compliance and testing attributes.

### 2.14 Create-Time Required Field Rules (Prototype)

The desktop prototype currently enforces these required fields at create time:

| Asset Type | Required Fields at Create |
|---|---|
| `System` | `Name` |
| `Point of Connection` | `Name`, `Parent System` |
| `Pump` | `Name`, `Parent Point of Connection` |
| `Backflow` | `Name`, `Backflow Type`, `Parent Point of Connection` |
| `Master Valve` | `Name`, `Parent Point of Connection` |
| `Flow Sensor` | `Name`, `Parent Point of Connection` |
| `Controller` | `Name`, `Controller Label`, `Total Zones`, `Parent Point of Connection` |
| `Zone` | `Zone Number`, `Parent Controller` (name auto-normalized) |

## 3. Standard Salesforce Metadata Baseline

This section is the Standard Salesforce field dictionary for irrigation asset setup, Map representation, inspection outcomes, and repair execution.

### 3.1 Cross-Asset Standard Field Dictionary

| Standard Field | SF Object.Field | Type | Allowed Values / Rule | Schema Required | Process Required | Applies To |
|---|---|---|---|---|---|---|
| `asset_uid` | `Asset.Id` | Id | System-generated Salesforce Id. | Yes | Yes | All assets |
| `asset_type` | `Asset.Asset_Type__c` | Picklist | `System`, `Point of Connection`, `Pump`, `Backflow`, `Master Valve`, `Flow Sensor`, `Controller`, `Zone`. | No | Yes | All assets |
| `asset_name` | `Asset.Name` | Text | Non-blank user-facing name (Zone name normalized from number). | Yes | Yes | All assets |
| `parent_asset_uid` | `Asset.ParentId` | Lookup(Asset) | Required for all non-root assets with correct parent type. | No | Conditional | Point of Connection, Pump, Backflow, Master Valve, Flow Sensor, Controller, Zone |
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
| `Point of Connection` | `Asset.Asset_Type__c = Point of Connection`, `Asset.Name`, `Asset.ParentId` (System parent) | Water Source Type, Source Capacity | Point |
| `Pump` | `Asset.Asset_Type__c = Pump`, `Asset.Name`, `Asset.ParentId` (Point of Connection parent) | Operational Status, Pressure (PSI), Notes | Point |
| `Backflow` | `Asset.Asset_Type__c = Backflow`, `Asset.Name`, `Asset.ParentId` (Point of Connection parent) | Backflow Type, Serial Number, Last Test Date, Next Test Due, Compliance Status | Point |
| `Master Valve` | `Asset.Asset_Type__c = Master Valve`, `Asset.Name`, `Asset.ParentId` (Point of Connection parent) | Valve Type, Operational Status, Notes | Point |
| `Flow Sensor` | `Asset.Asset_Type__c = Flow Sensor`, `Asset.Name`, `Asset.ParentId` (Point of Connection parent) | Sensor Model, Functional Status, Notes | Point |
| `Controller` | `Asset.Asset_Type__c = Controller`, `Asset.Name`, `Asset.ParentId` (Point of Connection parent), `Asset.Controller_Total_Zones__c` | Controller Label, Make / Model, Connectivity Type, Smart Controller, Controller App / Platform | Point |
| `Zone` | `Asset.Asset_Type__c = Zone`, `Asset.ParentId` (Controller parent), `Asset.Zone_Number__c` | Area Served, Flow Rate (GPM), Distribution Method, Lateral Pipe Type, Lateral Pipe Size, Solenoid Resistance (ohms), Valve Type, Station Identifier, Station Electrical Status | Polygon |

### 3.3 Controlled Domains

| Domain | Values |
|---|---|
| `Asset.Asset_Type__c` | `System`, `Point of Connection`, `Pump`, `Backflow`, `Master Valve`, `Flow Sensor`, `Controller`, `Zone` |
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


