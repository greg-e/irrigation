# Common Data Dictionary: Irrigation Asset Model — Mapbox + FSM

Status: Draft v2
Date: 2026-05-13

> **REVISED — May 2026:** ArcGIS dropped as the geometry platform. Client has no ArcGIS Online org. Selected path: **Mapbox GL JS in a custom LWC** for within-property visualization. Geometry (points, polygons, lines) is stored natively in Salesforce on `Map_Feature__c` (GeoJSON). Mapbox renders it client-side. This document has been updated to remove Esri as the geometry authority. Esri field mappings are retained as a reference appendix only.

## Decision Baseline (May 2026)

1. **Geometry authority: Salesforce** — GeoJSON stored on `Map_Feature__c`, linked to Account and optionally to Asset.
2. **Map renderer: Mapbox GL JS** — embedded in a custom LWC on Account and Work Order pages.
3. Primary map user is Irrigation Manager; secondary users are Account Manager and Field Tech.
4. Offline GPS pin capture is required in FSM Mobile. Offline tile strategy documented in E9-S5.

## Objective

Create a common irrigation data dictionary that can be used across:
- Esri ArcGIS irrigation asset model (reference baseline)
- Salesforce FSM irrigation operating model (current project model)

This document compares both models, identifies gaps, and recommends a path forward.

## Source References

- Esri reference model: https://doc.arcgis.com/en/arcgis-solutions/latest/reference/other/IrrigationSystemDM.html
- Current inspection model: ../requirements/inspection_form_data_model.md
- Current logical ERD: ../requirements/diagrams/data_model.mmd
- Current asset architecture: ../research/fsm_asset_architecture.md

## Executive Summary

1. Salesforce is the single system of record — for both operational data (inspections, callouts, WOs) and geometry (GeoJSON on `Map_Feature__c`).
2. Mapbox GL JS renders geometry client-side in a custom LWC; no external geometry authority.
3. FSM model is the execution system for inspection workflow, service execution, and repair handoff.
4. The canonical dictionary defines field names, domain values, and object mappings entirely within Salesforce.
5. Esri domain sets are retained as a reference for domain governance quality (condition scale, asset type vocabulary) — not as a sync target.

## Model Overview

| Dimension | Salesforce FSM Irrigation Model | Mapbox LWC Layer | Notes |
|---|---|---|---|
| Geometry storage | `Map_Feature__c` with GeoJSON_Geometry__c, Feature_Type, Asset lookup | Renders GeoJSON from `Map_Feature__c` via SOQL on component init | Salesforce is geometry authority |
| Asset operations | Asset object with type, parent, lifecycle, condition fields | Asset pins sourced from `Map_Feature__c` Point records linked to Asset | Single source |
| Inspection runtime | SA + Inspection_Response + WOLI callouts | Map badges surface open callout status per asset (E9-S6) | FSM leads |
| GPS capture | Asset.Latitude / Asset.Longitude (centroid ref); full geometry in Map_Feature__c | GPS pin drop in mobile LWC creates Map_Feature__c Point record | Device GPS, no GNSS hardware needed |
| Domain governance | Controlled picklists aligned to canonical domain sets (condition, asset type, spatial source) | Not applicable | Defined below |

## Proposed Common Data Dictionary (Canonical)

The canonical dictionary is organized by subject area.

### A. Asset Identity

| Canonical Field | Meaning | FSM Object / Field | Required |
|---|---|---|---|
| asset_uid | Global unique asset key | Asset.Id (SFDC id) | Yes |
| asset_business_id | Human/business identifier | Asset.Business_Asset_Id__c (new) | Yes |
| asset_type | Normalized asset class | Asset.Asset_Type__c | Yes |
| asset_name | Display name | Asset.Name | Yes |
| parent_asset_uid | Parent relationship | Asset.ParentId | Conditional |
| lifecycle_status | Lifecycle phase | Asset.Normalization_Status__c + Asset Status crosswalk | Yes |

### B. Asset Location and Spatial Quality

| Canonical Field | Meaning | FSM Object / Field | Required |
|---|---|---|---|
| map_feature_id | Salesforce record ID for the Map_Feature__c geometry record | Map_Feature__c.Id | Yes |
| location_geometry | GeoJSON geometry string (Point, Polygon, LineString) | Map_Feature__c.GeoJSON_Geometry__c | Yes |
| feature_type | Geometry type | Map_Feature__c.Feature_Type__c (Point / Polygon / LineString) | Yes |
| latitude | Centroid latitude reference on the asset record | Asset.Latitude | Conditional |
| longitude | Centroid longitude reference on the asset record | Asset.Longitude | Conditional |
| spatial_source | How spatial data was captured | Map_Feature__c.Spatial_Source__c (picklist) | Yes |
| spatial_confidence | Confidence in spatial accuracy | Map_Feature__c.Spatial_Confidence__c (picklist) | Yes |

> **Removed:** `arcgis_feature_id` / `ArcGIS_Feature_Id__c` — Esri-specific, no longer applicable. `gnss_fix_type` and `gnss_horizontal_accuracy_m` — Esri GNSS metadata fields, not needed without dedicated GNSS hardware; device GPS accuracy is not captured at MVP.

### C. Asset Condition and Inspection Summary

| Canonical Field | Meaning | FSM Object / Field | Required |
|---|---|---|---|
| last_inspected_at | Last inspection datetime | Asset.Last_Inspected_At__c | Yes |
| condition_score | Condition scale (1–5) | Asset.Condition_Score__c (new) | Yes |
| condition_notes | Inspection notes summary | Customer_Facing_Notes__c / Internal_Notes__c | No |
| operable_flag | Operability | Asset.Functional__c / status derivation by type | Conditional |

### D. Irrigation Technical Attributes

| Canonical Field | Meaning | FSM Object / Field | Required |
|---|---|---|---|
| controller_station_count | Total stations/zones available | Asset.Controller_Total_Zones__c | Conditional |
| station_number | Station/zone assignment | Asset.Zone_Number__c | Conditional |
| flow_rate_gpm | Flow rate GPM | Asset.Flow_Rate_GPM__c (optional new) | Optional |
| static_pressure_psi | Static pressure PSI | Asset.Static_Pressure_PSI__c (optional new) | Optional |
| pipe_diameter_in | Diameter inches | Asset type-specific diameter field (optional new) | Conditional |
| material | Material category | Asset.Material__c (optional new) | Optional |

### E. Service Execution and Repair

| Canonical Field | Meaning | FSM Object / Field | Required |
|---|---|---|---|
| inspection_event_id | Inspection event identifier | ServiceAppointment.Id | Yes |
| inspection_type | Type of inspection | Inspection_Type__c | Yes |
| repairs_needed | Repair required indicator | Repairs_Needed__c | Yes |
| issue_type | Failure/callout category | WOLI.Issue_Type__c | Conditional |
| callout_status | Repair lifecycle status | WOLI.Callout_Status__c | Conditional |

## Core Domain Values

### Asset Type

| Canonical Value | FSM Asset_Type__c | Notes |
|---|---|---|
| Controller | Controller | MVP |
| Zone | Zone | MVP |
| Backflow | Backflow | MVP |
| Pump | Pump | MVP |
| Sensor | Sensor | MVP |
| Valve | Valve | Phase 2 |
| Head | Head | Phase 2 |
| Drip_Line | Drip_Line | Phase 2 |
| Pipe | Pipe | Phase 2 |
| Wire | Wire | Phase 2 |

### Condition

| Value | Label | FSM Condition_Score__c |
|---|---|---|
| 1 | Excellent | 1 |
| 2 | Good | 2 |
| 3 | Average | 3 |
| 4 | Fair | 4 |
| 5 | Poor | 5 |

### Spatial Source

| Canonical Value | Map_Feature__c.Spatial_Source__c |
|---|---|
| Unknown | Unknown |
| As-Built | As-Built |
| CAD | CAD |
| Digitized | Digitized |
| GPS | GPS |
| Field Sketch | Field Sketch |

### Spatial Confidence

| Canonical Value | Map_Feature__c.Spatial_Confidence__c |
|---|---|
| Unknown | Unknown |
| High | High |
| Medium | Medium |
| Low | Low |

## Gap Assessment

### Strengths of the selected model (FSM-native + Mapbox)

1. Single platform — no cross-system sync, no dual admin model.
2. Geometry stored in Salesforce — inherits standard sharing, reporting, and backup.
3. Mapbox handles all three geometry types (points, polygons, lines) at residential yard scale without enterprise GIS licensing.
4. FSM model already strong for inspection runtime, callout handoff, and service execution.

### Known gaps to close

1. No canonical external asset business key currently defined — need `Business_Asset_Id__c` on Asset.
2. No condition scale field currently enforced in FSM — need `Condition_Score__c`.
3. Spatial source/confidence picklists not yet standardized — need to align to canonical domain values.
4. Asset type vocabulary partially aligned — Valve, Wire, Pipe not yet in FSM taxonomy; scope to Phase 2 unless inspection questions require them at MVP.
5. GeoJSON geometry field requires validation — need a server-side check that stored GeoJSON is well-formed before rendering in Mapbox.

## Recommended Path Forward

**Selected: FSM-Native Geometry with Mapbox Render**

- Salesforce is the single system of record for both operational and spatial data.
- `Map_Feature__c` stores GeoJSON geometry; Asset carries centroid lat/long as a summarized reference.
- Mapbox GL JS renders geometry client-side from SOQL results; no external geometry sync.
- No middleware, no second platform admin, no Esri license required.

## Phased Plan

### Phase 0: Dictionary Ratification

1. Approve canonical fields and domain values in this document (v2).
2. Confirm `Map_Feature__c` object design aligns to E9-S2 acceptance criteria.
3. Define FSM field ownership: Asset team owns identity and type fields; Map LWC team owns `Map_Feature__c`.

### Phase 1: Minimum Viable Data Layer (MVP — aligned to E9-S1 through E9-S4)

1. Deliver `Map_Feature__c` with fields: Account, Asset (nullable), Feature_Type, GeoJSON_Geometry__c, Label, Color_Code, Spatial_Source, Spatial_Confidence.
2. Add Asset fields: Business_Asset_Id__c, Condition_Score__c.
3. Align FSM picklists to canonical domain values (asset type, condition scale, spatial source/confidence).
4. Publish data quality checks: missing geometry records for required asset types, missing centroid lat/long, invalid domain values.

### Phase 2: Asset Vocabulary Expansion

1. Expand FSM asset taxonomy where needed (Valve, Wire, Pipe) if operationally required.
2. Introduce controlled creation rules to prevent taxonomy drift.

### Phase 3: Advanced Spatial-Operational Analytics (later)

1. Add spatial-performance dashboards (condition by zone, callout hotspot mapping).
2. Add predictive maintenance features using condition trend + repair history.

## Governance Model

1. Create Data Dictionary Steward group (Salesforce architect, BA, analytics owner).
2. Version this dictionary (v2, v2.1, v3) with formal change log.
3. Require impact review for any new picklist/domain values.
4. Add monthly drift report:
   - Unmapped or invalid asset types
   - Invalid domain values (condition, spatial source/confidence)
   - Missing Business_Asset_Id__c
   - Condition_Score__c nulls on inspected assets
   - Map_Feature__c records with malformed GeoJSON

## Immediate Action List

1. Approve the canonical fields in sections A-E (this doc v2).
2. Confirm owner for each canonical field (FSM architect vs. Map LWC team).
3. Implement Phase 1 field additions in FSM: `Business_Asset_Id__c`, `Condition_Score__c`.
4. Create `Map_Feature__c` object per E9-S2 acceptance criteria.
5. Align FSM picklists to canonical domain values (asset type, condition, spatial source, spatial confidence).
6. Stand up data quality report for dictionary conformance.

## Appendix: Esri IrrigationSystemDM Reference (retained for future reference only)

Esri ArcGIS Solutions irrigation data model reviewed during original architecture assessment (May 2026). **Not an active dependency.** Retained in case client acquires ArcGIS Online at a future date.

- Reference: https://doc.arcgis.com/en/arcgis-solutions/latest/reference/other/IrrigationSystemDM.html
- Feature classes reviewed: AreaBoundary, BackflowPreventer, Controller, Filter, Fitting, Meter, Pipes, PivotPoint, Pump, Sensor, Sprinkler, SurfaceWater, SurfaceWaterBoundary, SurfaceWaterLine, Valve, Well, Wire, Zone.
- Relate tables reviewed: BackflowPreventerRelate, ControllerRelate, FilterRelate, PumpRelate, SensorRelate, SprinklerRelate, ValveRelate, WellRelate, WireRelate, ZoneRelate.
