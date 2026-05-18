# Irrigation Data Dictionary (Salesforce FSM)

Status: Draft v3
Date: 2026-05-18

## Objective

Define the canonical, Salesforce-only data dictionary for irrigation asset operations, spatial representation, inspection outcomes, and repair execution.

## Scope and Design Rules

1. Salesforce is the system of record for operational and spatial data.
2. Spatial geometry is stored in `Map_Feature__c` as GeoJSON.
3. `Asset.Latitude` and `Asset.Longitude` are centroid reference values only.
4. No phase labels are used in this dictionary.
5. Requiredness is defined with two dimensions:
   - Schema Required: enforced by Salesforce metadata.
   - Process Required: enforced by process, policy, automation, or QA.

## Reference Sources by Major Section

### Identity and Core Asset Modeling

- Salesforce Asset Object Reference: https://developer.salesforce.com/docs/atlas.en-us.260.0.object_reference.meta/object_reference/sforce_api_objects_asset.htm

### Field Service Execution Model

- Field Service Core Data Model: https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap_core.htm
- Field Service Data Objects Overview: https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap.htm

### Spatial Storage and Rendering Pattern

- Internal architecture decision baseline: ../research/fsm_asset_architecture.md
- Internal UX and requirements baseline: ../requirements/fsm_irrigation_requirements.md

## API Name Alignment Notes

1. Fields already used in current project docs are listed directly as their API names.
2. This dictionary includes existing API names only; no proposed API fields are included.
3. `Callout_Status__c` values are aligned to existing project usage: New, Quoted, Approved, Completed.

## Canonical Master Dictionary

| Canonical Field | SF Object.Field | Data Type | Allowed Values / Format | Default | Validation Rule | Schema Required | Process Required | Source of Truth | Reporting Use | Data Owner | System Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| asset_uid | Asset.Id | Id | Salesforce Id | System generated | N/A | Yes | Yes | Salesforce | Joins and lineage | Operations | Salesforce Admin |
| asset_type | Asset.Asset_Type__c | Picklist | System, Controller, Zone, Backflow, Valve, Head, Drip, Pipe, Wire | None | Must be in approved domain set | No | Yes | Asset | Asset mix and coverage | Operations | Salesforce Admin |
| asset_name | Asset.Name | Text | Human-readable label | None | Non-blank | Yes | Yes | Asset | Technician UX and exports | Operations | Salesforce Admin |
| parent_asset_uid | Asset.ParentId | Lookup(Asset) | Valid Asset Id | Null | Required for child components in hierarchy | No | Conditional | Asset | Hierarchy analysis | Operations | Salesforce Admin |
| lifecycle_status | Asset.Status | Picklist | Installed, Needs Repair, Repair In Progress, Decommissioned | Installed | Must follow lifecycle transitions | No | Yes | Asset | Lifecycle KPIs | Operations | Salesforce Admin |
| map_feature_id | Map_Feature__c.Id | Id | Salesforce Id | System generated | N/A | Yes | Yes | Map_Feature__c | Spatial joins | Operations | Salesforce Admin |
| location_geometry | Map_Feature__c.GeoJSON_Geometry__c | Long Text | Valid GeoJSON object | None | Must parse as valid GeoJSON | No | Yes | Map_Feature__c | Map rendering and geometry QA | Operations | Salesforce Dev |
| feature_type | Map_Feature__c.Feature_Type__c | Picklist | Point, Polygon, LineString | Point | Must match geometry type | No | Yes | Map_Feature__c | Layer filtering | Operations | Salesforce Admin |
| latitude | Asset.Latitude | Number(10,7) | -90 to 90 | Null | Required when point centroid is expected | No | Conditional | Asset | Location summaries | Operations | Salesforce Admin |
| longitude | Asset.Longitude | Number(10,7) | -180 to 180 | Null | Required when point centroid is expected | No | Conditional | Asset | Location summaries | Operations | Salesforce Admin |
| spatial_source | Map_Feature__c.Spatial_Source__c | Picklist | Unknown, As-Built, CAD, Digitized, GPS, Field Sketch | Unknown | Must be in approved domain set | No | Yes | Map_Feature__c | Data quality and trust | Operations | Salesforce Admin |
| spatial_confidence | Map_Feature__c.Spatial_Confidence__c | Picklist | Unknown, High, Medium, Low | Unknown | Must be in approved domain set | No | Yes | Map_Feature__c | Confidence overlays | Operations | Salesforce Admin |
| last_inspected_at | Asset.Last_Inspected_At__c | DateTime | ISO datetime | Null | Set on inspection completion | No | Yes | Asset | Inspection recency | Operations | Salesforce Flow Owner |
| condition_score | Asset.Condition_Score__c | Number(1,0) | 1,2,3,4,5 | Null | Must be integer 1-5 | No | Yes | Asset | Condition trend analytics | Operations | Salesforce Admin |
| condition_label | Derived from Asset.Condition_Score__c | Derived label | Excellent, Good, Average, Fair, Poor | Derived | Must map to score scale | No | Yes | Derived | Business-facing condition reporting | Operations | Salesforce Admin |
| repairs_needed | ServiceAppointment.Repairs_Needed__c | Checkbox | True/False | False | Set during inspection workflow | No | Yes | ServiceAppointment | Repair funnel metrics | Field Operations | Salesforce Admin |
| issue_type | WorkOrderLineItem.Issue_Type__c | Picklist | Controlled issue taxonomy | None | Required when callout exists | No | Conditional | WorkOrderLineItem | Failure mode reporting | Field Operations | Salesforce Admin |
| callout_status | WorkOrderLineItem.Callout_Status__c | Picklist | New, Quoted, Approved, Completed | New | Status transition guardrails | No | Conditional | WorkOrderLineItem | Backlog and SLA tracking | Field Operations | Salesforce Admin |

## Domain Standards

### Asset Type Domain

System, Controller, Zone, Backflow, Valve, Head, Drip, Pipe, Wire

### Condition Domain (Dual Standard)

| Score | Label |
|---|---|
| 1 | Excellent |
| 2 | Good |
| 3 | Average |
| 4 | Fair |
| 5 | Poor |

### Spatial Source Domain

Unknown, As-Built, CAD, Digitized, GPS, Field Sketch

### Spatial Confidence Domain

Unknown, High, Medium, Low

## Spatial Requirement by Component

| Component | Map_Feature Required | Minimum Geometry Expectation |
|---|---|---|
| System | Optional | Point or Polygon when modeled |
| Controller | Yes | Point |
| Zone | Yes | Polygon |
| Backflow | Yes | Point |
| Valve | Yes | Point |
| Head | Yes | Point |
| Drip | Yes | Point or LineString |
| Pipe | Yes | LineString |
| Wire | Yes | LineString |

## Component Best-Practice Dictionaries

### System Component

| Field | SF Object.Field | Data Type | Allowed Values / Format | Default | Validation Rule | Schema Required | Process Required | Source of Truth | Reporting Use | Data Owner | System Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| component_type | Asset.Asset_Type__c | Picklist | System | None | Must equal System for this component table | No | Yes | Asset | Hierarchy root analysis | Operations | Salesforce Admin |
| component_name | Asset.Name | Text | Free text | None | Non-blank | Yes | Yes | Asset | Navigation and search | Operations | Salesforce Admin |
| map_link | Map_Feature__c.Asset__c | Lookup(Asset) | Valid Asset Id | Null | Optional for System records | No | No | Map_Feature__c | Optional system footprint maps | Operations | Salesforce Admin |

### Controller Component

| Field | SF Object.Field | Data Type | Allowed Values / Format | Default | Validation Rule | Schema Required | Process Required | Source of Truth | Reporting Use | Data Owner | System Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| component_type | Asset.Asset_Type__c | Picklist | Controller | None | Must equal Controller | No | Yes | Asset | Component classification | Operations | Salesforce Admin |
| total_zones | Asset.Controller_Total_Zones__c | Number(3,0) | 1-999 | Null | Must be >= 1 | No | Yes | Asset | Capacity reporting | Operations | Salesforce Admin |
| map_feature_required | Map_Feature__c.Feature_Type__c | Picklist | Point | Point | Controller must have point geometry | No | Yes | Map_Feature__c | Dispatch map context | Field Operations | Salesforce Admin |

### Zone Component

| Field | SF Object.Field | Data Type | Allowed Values / Format | Default | Validation Rule | Schema Required | Process Required | Source of Truth | Reporting Use | Data Owner | System Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| component_type | Asset.Asset_Type__c | Picklist | Zone | None | Must equal Zone | No | Yes | Asset | Component classification | Operations | Salesforce Admin |
| zone_number | Asset.Zone_Number__c | Number(3,0) | 1-999 | Null | Unique within parent controller | No | Yes | Asset | Zone inventory and troubleshooting | Operations | Salesforce Admin |
| solenoid_resistance_ohms | Asset.Solenoid_Resistance__c | Number(5,1) | 0.0–999.9 | Null | When populated must be > 0 | No | No | Asset | Valve electrical diagnostics; written by inspection checkout (Q6.13c) | Field Operations | Salesforce Admin |
| map_feature_required | Map_Feature__c.Feature_Type__c | Picklist | Polygon | Polygon | Zone must have polygon geometry | No | Yes | Map_Feature__c | Coverage and overlap analysis | Field Operations | Salesforce Admin |

### Backflow Component

| Field | SF Object.Field | Data Type | Allowed Values / Format | Default | Validation Rule | Schema Required | Process Required | Source of Truth | Reporting Use | Data Owner | System Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| component_type | Asset.Asset_Type__c | Picklist | Backflow | None | Must equal Backflow | No | Yes | Asset | Compliance asset inventory | Operations | Salesforce Admin |
| condition_score | Asset.Condition_Score__c | Number(1,0) | 1-5 | Null | Must be 1-5 | No | Yes | Asset | Compliance and risk tracking | Compliance Ops | Salesforce Admin |
| map_feature_required | Map_Feature__c.Feature_Type__c | Picklist | Point | Point | Backflow must have point geometry | No | Yes | Map_Feature__c | Locate regulated device quickly | Compliance Ops | Salesforce Admin |

### Valve Component

| Field | SF Object.Field | Data Type | Allowed Values / Format | Default | Validation Rule | Schema Required | Process Required | Source of Truth | Reporting Use | Data Owner | System Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| component_type | Asset.Asset_Type__c | Picklist | Valve | None | Must equal Valve | No | Yes | Asset | Component classification | Operations | Salesforce Admin |
| valve_type | Asset.Valve_Type__c | Picklist | Solenoid, Ball, Gate, Master | Null | Must be in approved domain set | No | Conditional | Asset | Failure mode and maintenance profile | Operations | Salesforce Admin |
| map_feature_required | Map_Feature__c.Feature_Type__c | Picklist | Point | Point | Valve must have point geometry | No | Yes | Map_Feature__c | Locate and isolate failures | Field Operations | Salesforce Admin |

### Head Component

| Field | SF Object.Field | Data Type | Allowed Values / Format | Default | Validation Rule | Schema Required | Process Required | Source of Truth | Reporting Use | Data Owner | System Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| component_type | Asset.Asset_Type__c | Picklist | Head | None | Must equal Head | No | Yes | Asset | Component classification | Operations | Salesforce Admin |
| head_type | Asset.Head_Type__c | Picklist | Rotor, Spray, Bubbler | Null | Must be in approved domain set | No | Conditional | Asset | Inventory and performance segmentation | Operations | Salesforce Admin |
| map_feature_required | Map_Feature__c.Feature_Type__c | Picklist | Point | Point | Head must have point geometry | No | Yes | Map_Feature__c | Spot-level repair routing | Field Operations | Salesforce Admin |

### Drip Component

| Field | SF Object.Field | Data Type | Allowed Values / Format | Default | Validation Rule | Schema Required | Process Required | Source of Truth | Reporting Use | Data Owner | System Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| component_type | Asset.Asset_Type__c | Picklist | Drip | None | Must equal Drip | No | Yes | Asset | Component classification | Operations | Salesforce Admin |
| flow_rate_gph | Asset.Flow_Rate_GPH__c | Number(6,2) | >= 0 | Null | Must be >= 0 when populated | No | Conditional | Asset | Drip performance analysis | Operations | Salesforce Admin |
| map_feature_required | Map_Feature__c.Feature_Type__c | Picklist | Point or LineString | Point | Drip must have mapped geometry | No | Yes | Map_Feature__c | Drip network visualization | Field Operations | Salesforce Admin |

### Pipe Component

| Field | SF Object.Field | Data Type | Allowed Values / Format | Default | Validation Rule | Schema Required | Process Required | Source of Truth | Reporting Use | Data Owner | System Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| component_type | Asset.Asset_Type__c | Picklist | Pipe | None | Must equal Pipe | No | Yes | Asset | Component classification | Operations | Salesforce Admin |
| parent_asset_uid | Asset.ParentId | Lookup(Asset) | Valid parent Asset Id | Null | Must link to parent asset in modeled hierarchy | No | Conditional | Asset | Network structure and traversal | Operations | Salesforce Admin |
| map_feature_required | Map_Feature__c.Feature_Type__c | Picklist | LineString | LineString | Pipe must have line geometry | No | Yes | Map_Feature__c | Network tracing and impact | Field Operations | Salesforce Admin |

### Wire Component

| Field | SF Object.Field | Data Type | Allowed Values / Format | Default | Validation Rule | Schema Required | Process Required | Source of Truth | Reporting Use | Data Owner | System Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|
| component_type | Asset.Asset_Type__c | Picklist | Wire | None | Must equal Wire | No | Yes | Asset | Component classification | Operations | Salesforce Admin |
| parent_asset_uid | Asset.ParentId | Lookup(Asset) | Valid parent Asset Id | Null | Must link to parent asset in modeled hierarchy | No | Conditional | Asset | Network structure and traversal | Operations | Salesforce Admin |
| map_feature_required | Map_Feature__c.Feature_Type__c | Picklist | LineString | LineString | Wire must have line geometry | No | Yes | Map_Feature__c | Fault isolation context | Field Operations | Salesforce Admin |

## Data Quality Controls

1. Active mappable components must have at least one linked `Map_Feature__c` record.
2. `Map_Feature__c.Feature_Type__c` must match component geometry rules.
3. `Asset.Condition_Score__c` must map to the approved label scale.
4. Asset type must remain in controlled domain values.
5. `WorkOrderLineItem.Callout_Status__c` must stay in approved values: New, Quoted, Approved, Completed.

## Governance

1. Any new domain value requires change review.
2. Data owner approves business semantics and policy changes.
3. System owner approves metadata, automation, and integration impacts.
4. Monthly drift checks should include invalid domains, missing required process fields, and geometry nonconformance.
