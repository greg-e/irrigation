# FSM Irrigation Requirements

## 1. Asset Hierarchy

The hierarchy is easiest to read in tree form.

```text
Account / Property
└── System (optional)
    ├── Controller
    │   ├── Programs
    │   ├── Zone 1
    │   │   ├── Valve
    │   │   ├── Head (Rotor)
    │   │   ├── Head (Spray)
    │   │   └── Drip
    │   └── Zone 2
    ├── Pump
    └── Backflow Preventer
```


### 1.1 Hierarchy Rules

| Rule | Requirement |
|---|---|
| Parent-child consistency | Every asset must use the correct parent type for its record type. |
| Zone ownership | A Zone must belong to exactly one Controller. |
| Zone components | Valve, Head, and Drip are children of a Zone, not siblings of Controller or System. |
| System grouping | System is optional and exists to group a property's irrigation assets. |
| Backflow location | Backflow is grouped under System. |
| Pump location | Pump is grouped under System when the property has pump equipment. |
| Naming | Zone display names should be normalized to `Zone <number>` to reduce user input. |
| Retire-only behavior | Assets should be retired, not hard deleted, when removed from active use. |

## 2. Component Metadata

This section defines the prototype-driven metadata baseline for each irrigation asset type in the desktop setup flow (`prototype/desktop_assets_setup/property_record.html` + `property_record.js`).

### 2.1 Common Metadata

| Field | Purpose | Applies To |
|---|---|---|
| `Name` | Human-readable asset name shown in UI and hierarchy. | All assets (Zone name is system-generated) |
| `Asset Type` | Canonical asset discriminator. | All assets |
| `Status` | Active / Retired lifecycle state. | All assets |
| `Parent` | Links the asset to the correct place in the hierarchy. | All assets except System root |
| `Install Date` | Optional lifecycle date captured in edit flow. | System, Controller, Pump, Zone, Backflow, Valve, Head, Drip |
| `Description` | Optional free-text context. | System, Pump, Valve |

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
| `Parent` | Yes | Parent is `System` when present. |
| `Controller Label` | Yes | Human-friendly identifier used by the tech. |
| `Total Zones` | Yes | Capacity / zone count for the controller. |
| `Make / Model` | No | Manufacturer and model information. |
| `Connectivity Type` | No | For example WiFi, Wired, or No Connectivity. |
| `Smart Controller` | No | Indicates whether the controller is smart / weather-based. |
| `Controller App / Platform` | No | Companion app name or platform name. |
| `Install Date` | No | Optional lifecycle date. |

### 2.4 Zone Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Automatically generated and normalized to `Zone <number>`. |
| `Asset Type` | Yes | Must be `Zone`. |
| `Parent` | Yes | Parent is the Controller. |
| `Zone Number` | Yes | Primary zone identifier; must be unique per Controller. |
| `Area Served` | No | Human-readable area description. |
| `Flow Rate (GPM)` | No | Operational or design flow rate. |
| `Primary Head Type` | No | Useful when the zone is mapped to a head subtype. |
| `Distribution Method` | No | Spray / Rotor / Bubbler / Drip. Captured during inspection per Q6.3. |
| `Lateral Pipe Type` | No | Descriptive lateral/drip line material. Optional; examples: soaker hose, drip tape, mainline lateral. |
| `Lateral Pipe Size` | No | Descriptive diameter/designation. Optional. |
| `Solenoid Resistance (Ω)` | No | Last measured solenoid resistance in ohms. Nominal range 20–60 Ω; out-of-range flags valve diagnostic need. Written by inspection checkout via Q6.13c. |
| `Install Date` | No | Optional lifecycle date. |

### 2.5 Backflow Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Backflow display name. |
| `Asset Type` | Yes | Must be `Backflow`. |
| `Parent` | Yes | Parent is the System. |
| `Backflow Type` | Yes | Examples: RPZ, DCV, PVB, Other. |
| `Serial Number` | No | Useful for compliance tracking. |
| `Last Test Date` | No | Compliance history. |
| `Last Test Result` | No | Options in prototype: Pass, Fail, Not Tested. |
| `Next Test Due` | No | Optional date for upcoming compliance activity. |
| `Compliance Status` | No | Current compliance state. |
| `Testing Authority` | No | Authority or vendor responsible for testing. |

### 2.6 Valve Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Valve display name. |
| `Asset Type` | Yes | Must be `Valve`. |
| `Parent` | Yes | Parent is the Zone. |
| `Valve Type` | No | Optional valve classification (e.g., Solenoid, Ball, Gate, Master). |
| `Valve Location Notes` | No | Free-text location/context notes. |
| `Valve Condition` | No | Optional condition value (Good, Needs Attention, Failed). |
| `Install Date` | No | Optional lifecycle date. |
| `Description` | No | Optional free-text details. |

### 2.7 Head Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Head display name. |
| `Asset Type` | Yes | Must be `Head`. |
| `Parent` | Yes | Parent is the Zone. |
| `Head Subtype` | No | Examples: Rotor, Spray, Bubbler, Other. |
| `Nozzle Size` | No | Optional nozzle specification. |
| `Throw Radius (ft)` | No | Optional throw radius measurement. |
| `Arc (degrees)` | No | Optional arc setting. |
| `Install Date` | No | Optional lifecycle date. |

### 2.8 Drip Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Drip group display name. |
| `Asset Type` | Yes | Must be `Drip`. |
| `Parent` | Yes | Parent is the Zone. |
| `Emitter Type` | No | Optional emitter classification (Point Emitter, Drip, Micro Spray, Flag Emitter). |
| `Flow Rate (GPH)` | No | Optional emitter flow rate. |
| `Emitter Count` | No | Optional count of emitters in group. |
| `Coverage Area (sq ft)` | No | Optional service area estimate. |
| `Install Date` | No | Optional lifecycle date. |

### 2.9 Pump Metadata

| Metadata | Required | Notes |
|---|---|---|
| `Name` | Yes | Pump display name. |
| `Asset Type` | Yes | Must be `Pump`. |
| `Parent` | Yes | Parent is the System. |
| `Make / Model` | No | Equipment identification. |
| `Serial Number` | No | Useful for service tracking. |
| `Install Date` | No | Optional lifecycle date. |
| `Description` | No | Optional context notes. |

### 2.10 Create-Time Required Field Rules (Prototype)

The desktop prototype currently enforces these required fields at create time:

| Asset Type | Required Fields at Create |
|---|---|
| `System` | `Name` |
| `Controller` | `Name`, `Controller Label`, `Total Zones` |
| `Pump` | `Name` |
| `Zone` | `Zone Number`, `Parent Controller` (name auto-normalized) |
| `Backflow` | `Name`, `Backflow Type` |
| `Valve` | `Name`, `Parent Zone` |
| `Head` | `Name`, `Parent Zone` |
| `Drip` | `Name`, `Parent Zone` |

## 3. Notes

1. This file starts with the canonical asset hierarchy and metadata because that is the base model every setup and validation decision depends on.
2. This document should stay aligned with the prototype behavior in `prototype/desktop_assets_setup/` and the broader irrigation requirements set.
3. If new asset types are introduced, they should be added here with their parent rule and minimum metadata before they are added to the setup UI.
