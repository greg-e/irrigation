# Desktop Map Prototype Feature Inventory

Source reviewed:
- desktop_prototype_with_map.html
- property_record.js
- styles.css

Scope note:
- This inventory describes features present on the desktop_prototype_with_map.html record page and behavior wired by property_record.js.
- It distinguishes currently active features from dormant code paths that exist in JS but are not rendered in the current HTML.

## 1) Active Features (Rendered and Functional)

### 1.1 Salesforce-style record header and contextual highlights
- Salesforce Lightning Design System visual shell with record icon, title, action buttons, and highlight fields.
- Header actions include Follow, Edit, and Back to Report.
- Highlight values update from selected property context:
  - Property Account
  - Account Owner
  - Readiness
  - Branch
  - Last Updated
- Readiness is derived from active asset mix (controller/zone/backflow presence and data completeness).

### 1.2 Multi-tab record workspace
- Tabs rendered in UI:
  - Details
  - Map
  - Hierarchy
  - Program
  - Related
  - Chatter
  - History
- Tab switching is client-side and stateful.
- Dynamic tab visibility based on selected asset type:
  - Program tab shown only for Controller context.
  - Related tab shown only for System context.
  - Map tab shown when any asset context exists.

### 1.3 Details tab with type-aware asset field presentation
- Displays a type-aware detail layout for the selected asset.
- Supports multiple asset types (System, Controller, Pump, Zone, Backflow, Valve, Head, Drip).
- Shows hierarchy context fields:
  - Parent Asset
  - Root Asset
  - Asset Level
- Shows location row with lat/lon and link-out to Google Maps when coordinates exist.
- Includes a timeline section for parent assets based on recent audit entries.
- Details sections are collapsible (SLDS section open/close behavior).

### 1.4 Asset edit/create modal framework (type-specific forms and validation)
- New Asset and Edit Asset modal with large set of fields.
- Dynamic field visibility/required rules by asset type.
- Validation rules include:
  - Required fields by type (for example Controller Label and Total Zones for Controller).
  - Zone uniqueness per controller (Zone Number must be unique under same controller).
  - Parent requirements for child types (Valve/Head/Drip require Parent Zone).
- Retire action with dependency guards:
  - System cannot be retired while linked active Controllers/Backflows/Pumps exist.
  - Controller cannot be retired while linked active Zones exist.
- Related Asset Context panel explains dependency and retire impact.

### 1.5 Hierarchy tab: tree/grid hybrid with navigation and search
- In-tab hierarchy rendering with expandable/collapsible nodes.
- Search filters hierarchy by name/type and related text.
- Selected record shown as CURRENT in hierarchy row.
- Branch-aware rendering:
  - Property-wide mode for top-level navigation.
  - Parent branch mode when context asset is a child.
- Columns include status, SKU-like value, serial, modified metadata, install date.
- Clicking hierarchy asset navigates to same page with updated asset query parameter.
- Hierarchy summary includes breadcrumb-style selected path.

### 1.6 Map tab integration via embedded spatial prototype
- Map tab contains an iframe (spatial-map-frame) loading ../spatial_portable/index.html lazily on first map tab activation.
- Parent page sends property assets to iframe via postMessage payload type SPATIAL_PROTO_ASSETS.
- Parent page listens for iframe messages type SPATIAL_ASSET_LOCATION and persists returned asset lat/lon to local state.
- This creates two-way parent/iframe data flow for spatial context and coordinate updates.

### 1.7 Program tab integration (controller-specific)
- Program tab embeds controller_program.html in an iframe.
- Embed URL is enriched with controller identity and related zones in query params (JSON payload encoded).
- Program tab visibility constrained to controller context.

### 1.8 Related tab: service appointments, callouts, proposals
- Three related-list style tables rendered:
  - Service Appointments
  - Callouts
  - Proposals
- Each section shows record count, empty-state messaging, and sorted rows (newest first by date where available).
- Service appointment status and completion fields are visually badged.

### 1.9 Chatter and History placeholders
- Chatter and History tabs are intentionally present as prototype placeholders.
- Both include explicit messaging that content is not implemented.
- Hidden compatibility containers remain for JS bindings.

### 1.10 Local persistence, migration, and seed bootstrapping
- Data source and persistence model:
  - Seed data from seed_data.json.
  - Runtime state in localStorage key desktopAssetSetupPrototypeV3.
- Migration logic normalizes legacy asset types and structures:
  - Pump/sensor/drip legacy handling.
  - Hierarchy normalization and parent fixes.
  - Auto-creation of System root when required.
  - Backfill arrays for inspections/callouts/proposals.
- Sample related records can be injected for known properties when missing.

## 2) Dormant or Partially Wired Features (Present in JS, Not Rendered in Current HTML)

The following capabilities are implemented in property_record.js but their target controls are not present in desktop_prototype_with_map.html. Because the DOM nodes do not exist, these features are effectively inactive in this page version.

### 2.1 Advanced inline map editing controls (inactive)
- JS supports map editing model with:
  - add point/line/polygon
  - move selected
  - delete selected
  - undo/redo history
  - map type switch (roadmap/satellite/hybrid)
  - zoom controls
  - legend/symbol system
  - sync state badges (Pending/Synced/Failed)
- HTML currently does not include required elements such as map-add-point, map-add-line, map-add-polygon, map-feature-list, map-base-frame.
- Result: map editing UI is dormant; active map experience is the embedded spatial iframe flow.

### 2.2 KML import/export controls (inactive)
- JS includes KML export builder and KML import parser path.
- HTML does not include map-export-kml or map-import-kml controls for this page version.
- Result: KML import/export logic exists but is not user-accessible in this UI.

### 2.3 Legacy table/list hooks (inactive in this page)
- JS contains references for controls like toggle-retired, asset-table-body, asset-list-count, and some program table action hooks.
- These controls are not present in desktop_prototype_with_map.html.
- Result: these paths likely belong to earlier/alternate prototype variants and do not execute here.

## 3) Behavioral Summary

- The page currently behaves as a record-detail shell centered on:
  - asset details and edit modal workflows,
  - hierarchy navigation,
  - embedded map interoperability,
  - controller program embedding,
  - related-record visibility.
- The most significant map functionality now active on this page is iframe-based spatial integration rather than in-page draw/edit tooling.
