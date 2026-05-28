# Mobile v3.2 Demo Script

Audience: Product, BA, Salesforce Architecture, FSM Stakeholders  
App: FSM Mobile Inspection Prototype  
File: prototype/mobile v3.2/mobile_v3.2.html

## Demo Goal
Demonstrate end-to-end irrigation mobile workflow:
- Work Order -> WOLI execution
- Map-driven and list-driven asset operations
- Checklist capture at component level
- Controller-only program management
- Approvals and submit gating

## Pre-Demo Setup
1. Open the app at prototype/mobile v3.2/mobile_v3.2.html.
2. Confirm top shell loads with Work Order context.
3. Keep demo scope to the single irrigation WOLI visible in the prototype.

## Script (Presenter Talk Track + Actions)

### 1) Enter the irrigation workspace
1. Action: Click NEW on the WOLI row.
2. Say: This transitions the line item from NEW to IN PROGRESS and opens the WOLI execution workspace.
3. Show: Header now displays WOLI context and irrigation work type.

### 2) Navigate core tabs
1. Action: Click MAP, RELATED, FEED, then DETAILS.
2. Say: The tech can move between geospatial, data capture, and collaboration surfaces without leaving the WOLI context.
3. Show: Active tab state and panel content updates.

### 3) Map-first workflow
1. Action: Go to MAP tab.
2. Action: Expand component hierarchy using the map sheet toggle.
3. Action: Select a component from the map sheet.
4. Say: The map sheet supports component selection and quick execution actions.
5. Action: Click Checklist quick action.

### 4) Checklist capture and save
1. Action: Toggle at least one checklist item.
2. Action: Save Checklist.
3. Say: Checklist values are persisted to the selected component and drive touched asset evidence.
4. Show: Confirmation message and checklist state behavior.

### 5) Asset registry and detail editing
1. Action: Navigate to RELATED.
2. Action: Filter assets to Controllers.
3. Action: Open first controller detail record.
4. Action: Update a metadata field (example: Connectivity Type).
5. Action: Save.
6. Say: Component detail supports typed metadata capture and standard edit/save flow.

### 6) Controller programs (controller-only)
1. Action: In controller detail, click + Program.
2. Action: Enter program name.
3. Action: Select at least one day.
4. Action: Add a second start time.
5. Action: Save Program.
6. Action: Use list actions: Toggle and Copy on an existing program.
7. Say: Programs are intentionally available only on Controller assets.

### 7) Spatial continuity from detail
1. Action: Click Show on map from detail sheet.
2. Say: Detail and map contexts are linked so users can jump directly to geospatial context.

### 8) Approvals and submit gating
1. Action: Go to RELATED.
2. Action: Expand Approvals section.
3. Action: Assign Account Manager.
4. Action: Click Open Review.
5. Action: Click Simulate Submit.
6. If modal appears, action: Click Stay on WOLI.
7. Say: Submit is gated by policy (checklist evidence/zero-touch rationale + AM assignment).
8. Show: Status progression to COMPLETED and submit message.

### 9) Reset path demonstration
1. Action: Click Reset Flow.
2. Action: Cancel (or optionally show Soft/Hard options, then cancel).
3. Say: Reset paths are available for controlled rework during the same visit simulation.

### 10) Optional edge-case demonstrations
1. Programs on non-controller asset:
- Action: Open a Zone or Backflow detail and try Program action.
- Show: Guardrail message indicating programs are controller-only.
2. Unsaved create flow:
- Action: Open add-asset form, enter data, attempt cancel.
- Show: Keep Editing / Discard modal path.

## Success Criteria (What to Verify Live)
1. WOLI enters IN PROGRESS when started.
2. Checklist can be saved from map-driven entry point.
3. Metadata edits persist in detail flow.
4. Program create/edit actions work on controllers.
5. Submit remains gated until AM + checklist policy is satisfied.
6. Submit can complete and mark WOLI COMPLETED.

## Demo Notes
1. This is a front-end prototype with in-memory state.
2. Spatial behavior is integrated through iframe postMessage contract.
3. Data is resettable and non-persistent between reloads.

## Timeboxed Version (5-minute cut)
1. Start WOLI (NEW -> IN PROGRESS).
2. MAP: select component -> Checklist quick action -> save one value.
3. RELATED: open controller -> add program -> save.
4. RELATED: assign AM -> Open Review -> Simulate Submit.
5. Confirm COMPLETED state.
