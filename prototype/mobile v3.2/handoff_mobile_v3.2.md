# Mobile v3.2 Prototype Handoff

Audience: Salesforce Architect  
Source: prototype/mobile v3.2/mobile_v3.2.html

## 1) Purpose and Scope
This prototype simulates a Field Service Mobile irrigation workflow for a single Work Order and one irrigation Work Order Line Item (WOLI). It combines:
- Work Order/WOLI context and progress
- Component management (Zones, Controllers, Backflows)
- Checklist capture at component level
- Account Manager assignment and submit gating
- Embedded spatial map interaction via iframe messaging
- Controller-only irrigation program editing

It is a front-end prototype with in-memory state and no backend persistence.

## 2) Runtime Architecture
Single-file app pattern:
- Markup, styling, and behavior are in one HTML file.
- Global state object and helper functions drive UI rendering.
- Rendering is imperative via DOM updates (renderAll and focused render functions).

Primary session/runtime objects:
- state: active irrigation session data
- workOrder: top-level WO with WOLIs
- woliSessions: map of per-WOLI session snapshots
- mapTab, assetTab, mapFilters, mapGeometryState, sheetState: view/control state

## 3) Business Flow Summary
### WO and WOLI behavior
- App launches in Work Order mode.
- Selecting WOLI starts/opens irrigation workspace.
- WOLI status transitions:
  - NEW -> IN PROGRESS when started
  - IN PROGRESS -> COMPLETED on successful submit

### Submit gating
Submit is blocked unless both are true:
- Checklist requirement met:
  - At least one touched asset, or
  - Zero-touch reason code plus note
- Account Manager assigned

### Zero-touch policy
If no checklist updates exist, submit prompts for reason in format:
- CODE: note

## 4) Component Model in Prototype
Component types:
- Zone
- Controller
- Backflow

Current relationships in memory:
- Zone references Controller by name
- Zone references Backflow by name
- Controller includes an array of linked zone numbers
- Controller includes Programs collection

Lifecycle operations supported in UI:
- Create component
- Edit component
- Remove component
- Rename with downstream reference updates

## 5) Checklist Model
Checklist definitions are type-driven:
- System
- Source
- Backflow
- Controller
- Zone

Field kinds supported:
- boolean
- count
- number
- text

Stored state per component:
- checklistState dictionary keyed by checklist item id
- entry payload includes kind-specific value, resolved flag (for finding items), and updatedAt timestamp

Derived behavior:
- Findings and resolved state are summarized at component and global callout views
- Checklist changes add audit-like entries to visitImprint and touchedAssetKeys

## 6) Metadata in Component Edit
Component edit includes metadata fields based on type:
- Common metadata (asset type, parent, lifecycle status, install date, confidence/source, etc.)
- Type-specific metadata for controller/backflow/zone

Prototype behavior:
- Defaults are synthesized for missing metadata
- Draft values are compared for dirty check
- Save merges metadata into component.ref.metadata
- Selected metadata fields also backfill base fields:
  - Controller make/model
  - Backflow serial

## 7) Programs Feature (Controller-Only)
Programs are visible/editable only when active asset type is Controller.

Program editor supports:
- Name
- Days (Mon-Sun chips)
- One or more start times
- Zone
- Runtime minutes
- Seasonal adjust percent
- Active flag

List actions:
- Edit
- Copy
- Toggle active/paused
- Delete

Normalization logic keeps compatibility fields in sync:
- startTimes and legacy startTime
- zones[0] and legacy zone/runTimeMinutes

Important rule enforced:
- Non-controller assets cannot open program editor; warning is shown.

## 8) Spatial Map Integration Contract
Map is embedded via iframe:
- ../spatial_portable/index.html with URL params (propertyId, workOrderId, mode, layout, geomEdit, assetId)

Outbound messages from mobile prototype:
- SPATIAL_PROTO_ASSETS
- SPATIAL_SET_EDIT_MODE
- SPATIAL_SET_TOOL
- SPATIAL_SELECT_ASSET_CONTEXT
- SPATIAL_DELETE_SELECTED_GEOMETRY
- SPATIAL_DELETE_ASSET_GEOMETRY

Inbound messages handled by mobile prototype:
- SPATIAL_COMPONENT_CREATED
- SPATIAL_MAP_OBJECT_SELECTED
- SPATIAL_GEOMETRY_DELETED
- SPATIAL_MAPPED_ASSETS
- SPATIAL_ASSET_LOCATION

Geometry edit support:
- Edit mode toggle
- Marker tool
- Polygon tool
- Delete geometry

## 9) UI/UX State Modes
Top-level app modes:
- wo (Work Order shell)
- woli (WOLI workspace)

Key panels:
- Overview
- Details
- Map
- Related
- Feed

Detail sheet modes:
- Full edit mode
- Checklist-only mode (hides other sections)

Map sheet states:
- peek
- half
- full

## 10) Salesforce Object Mapping Guidance
Suggested target mapping from prototype concepts:
- Work Order -> standard WorkOrder
- WOLI -> WorkOrderLineItem
- Component records:
  - Zone, Controller, Backflow can be modeled as Asset with record types or as custom objects with parent references
- Program records:
  - Irrigation_Program__c child to Controller asset/object
- Checklist results:
  - Either normalized child object (one row per checklist answer) or JSON field strategy with versioning
- Metadata fields:
  - Move from generic metadata map into explicit fields on target objects where reporting/filtering is required

## 11) Data and Persistence Considerations
Current prototype constraints:
- In-memory only
- No offline queue
- No server-side validation

Architecture decisions needed for Salesforce implementation:
- Offline-first strategy for mobile field updates
- Sync conflict resolution (record and checklist answer level)
- Validation ownership (client vs Apex vs Flow)
- Audit model (who/when changed checklist/program/metadata)

## 12) Security and Governance Considerations
- Enforce CRUD/FLS for program/checklist/metadata fields
- Restrict who can submit WOLI and assign AM
- Maintain immutable submit event/audit trail
- Consider data retention policy for checklist historical entries

## 13) Recommended Next Steps for Build Design
1. Finalize canonical object model for Zone/Controller/Backflow and Program.
2. Define checklist answer persistence pattern with versioned checklist definitions.
3. Formalize iframe/map API contract as versioned integration spec.
4. Design offline sync and conflict strategy for field technician workflows.
5. Convert prototype submit gating into declarative/business-rule implementation (Flow + Apex where needed).

## 14) Notable Prototype Constraints to Preserve or Revisit
- Program editor is intentionally controller-only.
- Checklist can open in checklist-only detail view.
- Submit requires checklist policy and AM assignment.
- Geometry/map ownership is delegated to embedded spatial app.
