# Desktop Asset Record With Map PRD

Date: May 19, 2026
Status: Draft
Owner: FSM Product / UX
Source Prototype: prototype/desktop/desktop_v3.1.html

## 1. Product Summary

This PRD defines the desktop Asset Record experience represented by the desktop map prototype page. The experience supports irrigation asset setup, hierarchy navigation, map context, related operational records, and program management from a Salesforce-style record layout.

The page is designed for account and operations users who need to maintain irrigation asset structure and validate readiness before and after field inspections.

## 2. Problem Statement

Teams need one desktop workspace where they can:

1. View and edit irrigation assets by type-specific rules.
2. Navigate parent-child hierarchy quickly.
3. See and update map context for an asset through embedded spatial mapping.
4. Review related records (service appointments, callouts, proposals) alongside the asset.
5. Manage controller-level irrigation programs.
6. Preserve a simple audit trail of changes during setup and triage.

Without this unified view, users jump across separate tools and lose context between hierarchy, map, and related records.

## 3. Goals and Non-Goals

### 3.1 Goals

1. Deliver a desktop record page with tabbed views for Details, Map, Hierarchy, Related, Chatter, and History.
2. Enforce asset type-specific create and edit rules.
3. Support controlled retire behavior with dependency checks.
4. Provide embedded map context and bidirectional integration with the spatial module.
5. Keep all prototype data persistent in browser local storage for repeatable demos.

### 3.2 Non-Goals

1. Production-grade authentication, permissions, and server-side persistence.
2. Full Salesforce Chatter and History implementation (placeholder only).
3. Hard delete of assets.
4. Full GIS authoring UI directly inside the desktop map tab (handled by embedded spatial module).

## 4. Personas and Primary Jobs

1. Account Manager: maintain accurate asset baseline, review related callouts/proposals, and track readiness.
2. Irrigation/Operations Manager: maintain hierarchy quality, retire or reassign safely, verify audit timeline.
3. Dispatcher/Coordinator: inspect service appointment outcomes and linked records by property.

## 5. User Experience Scope

## 5.1 Page Header and Context

1. Record header shows asset title, Property Account, Account Owner, Readiness, Branch, Last Updated.
2. Readiness is computed from active assets:
   - Ready for Field when Controller, Zone, and Backflow all exist and no zone is unlinked.
   - Data Build otherwise.
   - Needs Asset Build when no active assets exist.
3. Header actions include Follow, Edit, and Back to Report.

## 5.2 Tabs

1. Details: primary asset data and timeline.
2. Map: embedded spatial iframe.
3. Hierarchy: in-tab tree/grid navigation.
4. Related: service appointments, callouts, proposals.
5. Chatter: placeholder content.
6. History: placeholder content.

Visibility rules:

1. Map tab is visible when an asset context exists.
2. Related tab is shown only for parent assets.

## 5.3 Details Tab

1. Show type-specific field layouts for System, Controller, Pump, Zone, Backflow, Valve, Head, Drip.
2. Show OOTB hierarchy fields:
   - Parent Asset
   - Root Asset
   - Asset Level
3. Show location row only when latitude or longitude exists.
4. Show timeline only for parent assets, sourced from recent audit entries.

## 5.4 Hierarchy Tab

1. Display hierarchy in related-style grid with expand/collapse.
2. Support search filter across name/type/labels.
3. Highlight current asset and show breadcrumb summary.
4. Provide New action to open create modal.
5. Clicking a hierarchy asset navigates to that asset record context.

## 5.5 Related Tab

1. Service Appointments table:
   - SA Number, Completed Date, Inspection Type, Technician, Overall Status, Callouts, Completion Status.
2. Callouts table:
   - Callout Number, Created, Summary, Priority, Status.
3. Proposals table:
   - Proposal Number, Created, Description, Amount, Status.
4. Tables are sorted newest-first where dates are present.

## 5.6 Programs Related List

Programs card is shown only when current context asset is a Controller.

Features:

1. List program rows with schedule days, start, zone, runtime, seasonal adjust, active flag.
2. Create, edit, and delete program records in modal.
3. Program Name is required.
4. Program operations write to audit trail.

## 5.7 Asset Create/Edit Modal

Shared modal supports Create and Edit modes.

Create behavior:

1. Type selector drives dynamic field visibility and required rules.
2. Required by type:
   - System: Name
   - Controller: Name, Controller Label, Total Zones
   - Pump: Name
   - Zone: Zone Number, Parent Controller
   - Backflow: Name, Backflow Type
   - Valve/Head/Drip: Name, Parent Zone
3. Zone name auto-normalizes to Zone <number>.
4. Zone number must be unique per Controller.

Edit behavior:

1. Type-specific fields shown with guardrails.
2. Name required for all assets.
3. Type-specific validation errors shown inline.
4. Save updates asset and appends audit record when data changed.

Retire behavior:

1. System cannot retire if active Controllers, Backflows, or Pumps remain linked.
2. Controller cannot retire if active Zones remain linked.
3. Retire marks status as Retired and records audit entry.

## 5.8 Map Tab and Spatial Integration

Desktop page behavior:

1. Map tab hosts iframe to prototype/spatial_portable/index.html.
2. On first map open, iframe is lazy-loaded.
3. Desktop sends asset payload to iframe via postMessage message type SPATIAL_PROTO_ASSETS.
4. Desktop listens for SPATIAL_ASSET_LOCATION messages and updates selected asset lat/lon.

Embedded spatial module capabilities (dependency):

1. Google Maps JavaScript API rendering.
2. Geometry create/edit for marker, polyline, polygon.
3. Save/reload through fake async API.
4. Asset hierarchy panel for selecting geometry context.

## 6. Functional Requirements

### FR-1 State and Persistence

1. System shall load seed data from seed_data.json on first run.
2. System shall persist state in localStorage key desktopAssetSetupPrototypeV3.
3. System shall migrate older data structures to hierarchy-compatible shape at load.

### FR-2 Asset Taxonomy and Parenting

1. System shall support asset types: System, Controller, Pump, Zone, Backflow, Valve, Head, Drip.
2. System shall auto-normalize legacy types (for example Sensor to Head, Drip_Line to Drip).
3. Controller, Backflow, and Pump default parent shall be active System when available.
4. Zone parent shall be Controller.
5. Valve, Head, and Drip parent shall be Zone.

### FR-3 Readiness and Summary

1. System shall compute readiness in header summary.
2. System shall surface branch, owner, and last updated from property state.

### FR-4 Type-Specific Validation

1. System shall enforce required fields by type for Create and Edit.
2. System shall enforce unique zone number per controller.
3. System shall reject invalid retire actions when dependency blocks exist.

### FR-5 Related Data Rendering

1. System shall render inspections, callouts, and proposals tables.
2. System shall backfill sample callouts/proposals for known demo property when empty.

### FR-6 Program Management

1. System shall allow create, edit, and delete of controller programs.
2. System shall require Program Name.
3. System shall support schedule days, start time, runtime, seasonal adjust, active toggle, and optional linked zone.

### FR-7 Audit and Timeline

1. System shall append audit entries on create/edit/retire/program/map import actions.
2. System shall render recent audit events in timeline and history placeholders used for compatibility.

### FR-8 Hierarchy Navigation

1. System shall provide expandable hierarchy with search.
2. System shall support deep-link navigation using query params property and asset.
3. System shall keep selected asset context synchronized across tabs.

### FR-9 Map Integration Contract

1. System shall initialize spatial iframe with propertyId query param.
2. System shall push current asset hierarchy to spatial iframe after load.
3. System shall consume location updates from iframe and write lat/lon to asset.

## 7. Data Model (Prototype Level)

### 7.1 Property

1. id, name, branch, assignedManager, updatedAt.
2. assets array.
3. inspections array.
4. callouts array.
5. proposals array.
6. audit array.

### 7.2 Asset

Common fields:

1. id, type, name, status, parentId.
2. installDate, serialNumber, description.
3. lat, lon.

Type-specific examples:

1. Controller: controllerLabel, totalZones, connectivityType, isSmartController, controllerApp.
2. Zone: zoneNumber, areaServed, flowRateGpm, primaryHeadType, distributionMethod, lateralPipeType, lateralPipeSize, solenoidResistanceOhms.
3. Backflow: backflowType, lastTestDate, lastTestResult, nextTestDue, complianceStatus, testingAuthority.
4. Valve: valveType, valveLocationNotes, valveCondition.
5. Head: headSubtype, nozzleSize, throwRadiusFt, arcDegrees.
6. Drip: emitterType, flowRateGph, emitterCount, coverageAreaSqft.

### 7.3 Program

1. id, programName.
2. zoneAssetId.
3. scheduleDays array.
4. startTime.
5. runTimeMinutes.
6. seasonalAdjustPct.
7. isActive.

## 8. Non-Functional Requirements

1. Prototype shall run in a modern desktop browser without build step.
2. UI shall remain responsive with typical property-sized asset hierarchies.
3. Map iframe load should be deferred until Map tab is selected.
4. State changes should be immediately persisted to localStorage.

## 9. Acceptance Criteria

### AC-1 Record Context

1. Given a valid property and asset query string, when page loads, then header and details render for selected asset.
2. Given invalid property, when page loads, then title shows asset not found state.

### AC-2 Asset Create/Edit

1. Given Create modal and type Zone, when Zone Number and Parent Controller are entered and saved, then a zone named Zone <number> is created.
2. Given duplicate Zone Number for same controller, when save is attempted, then user sees validation error and save is blocked.

### AC-3 Retire Guardrails

1. Given System has linked active Controller/Backflow/Pump, when retire is attempted, then retire is blocked with explanatory message.
2. Given Controller has linked active Zones, when retire is attempted, then retire is blocked with explanatory message.

### AC-4 Program Management

1. Given selected asset is Controller, when user opens New Program and saves valid values, then row appears in programs table.
2. Given existing program, when deleted, then row is removed and audit entry added.

### AC-5 Hierarchy and Navigation

1. Given hierarchy search text, when user types, then rows filter to matching nodes and descendants.
2. Given hierarchy asset link click, then page reloads with selected asset in query string.

### AC-6 Map Integration

1. Given user opens Map tab first time, when iframe loads, then asset payload is posted to iframe.
2. Given iframe posts SPATIAL_ASSET_LOCATION with valid assetId/lat/lon, then asset coordinates update and persist.

## 10. Analytics and Success Metrics (Prototype)

1. Time to create baseline hierarchy for one property.
2. Number of validation blocks encountered before successful save.
3. Program records created per controller in test scenario.
4. Map location updates received from spatial iframe.
5. Retire attempts blocked due to dependency guardrails.

## 11. Risks and Open Questions

1. Some legacy map control code exists in script but is not represented in current HTML markup; decision needed on whether to remove or restore those controls.
2. Chatter and History are placeholders; define minimum viable connected behavior for next phase.
3. localStorage persistence is single-browser and non-shared; production persistence model must be defined.
4. Spatial module contract currently uses permissive postMessage target; origin restrictions should be specified for production.

## 12. Future Enhancements

1. Add role-based field/edit permissions by persona.
2. Add server-backed persistence and conflict handling.
3. Add full field history table and timeline filtering.
4. Add map edit controls directly into desktop tab or formalize iframe-only ownership.
5. Add baseline readiness checklist with explicit blocker cards.
