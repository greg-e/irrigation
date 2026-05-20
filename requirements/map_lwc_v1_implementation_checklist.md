# Map LWC V1 Implementation Checklist

Source baseline: requirements/map_lwc_responsive_v1_first_pass.md

## 1) Architecture and State

- [ ] Define unified state model for desktop and mobile rendering.
- [ ] Implement context-gated initialization (asset context required).
- [ ] Implement center fallback chain:
  - [ ] Asset/parent location
  - [ ] User location (neighborhood zoom)
  - [ ] Last known extent
- [ ] Implement child auto-selection by nearest distance.
- [ ] Implement tie behavior: center between tied assets, no highlight.

## 2) Responsive UI

- [ ] Implement map-first mobile layout.
- [ ] Implement bottom sheet states: peek and expanded.
- [ ] Set default selected-asset state to peek.
- [ ] Pin peek actions: Edit Details, Photo, Notes.
- [ ] Render geometry controls in expanded sheet only.
- [ ] Preserve panel/edit state across rotation.
- [ ] Validate portrait and landscape parity.

## 3) Geometry Editing

- [ ] Gate edit mode behind explicit Edit Geometry action.
- [ ] Implement full geometry edit capabilities needed for parity.
- [ ] Enforce single confirmation dialog for destructive actions.
- [ ] Implement single-step undo.
- [ ] Set snapping default to off.

## 4) Save, Pending, and Retry

- [ ] Enable auto-save for geometry/details changes.
- [ ] Add inline save chip: Saving, Saved, Failed.
- [ ] On save failure, keep user in editable flow.
- [ ] Queue pending edits for retry.
- [ ] Retry pending edits in background.
- [ ] Surface pending state via global banner.
- [ ] Append repeated edits to existing pending set for same asset.

## 5) Offline and Sync

- [ ] Support full offline editing and local persistence.
- [ ] Trigger immediate background auto-sync on reconnect.
- [ ] Detect and handle conflicts with user resolution prompt.
- [ ] Implement shift/day cache retention policy.
- [ ] Carry unsynced pending edits across shift boundary until synced.

## 6) GPS and Follow Behavior

- [ ] Enable always-follow behavior when GPS available.
- [ ] Pause GPS follow during active geometry edits.
- [ ] Implement GPS unavailable fallback to last known location + manual pan.

## 7) Marker and Density Strategy

- [ ] Implement marker clustering with tap-to-expand.
- [ ] Validate behavior under dense asset loads.
- [ ] Prioritize data completeness in density tradeoffs.

## 8) Manual Add-to-Map Flow

- [ ] Enforce manual-only add behavior (no auto placement).
- [ ] Implement add flow step 1: map tap placement.
- [ ] Implement add flow step 2: details capture.

## 9) Performance and Reliability

- [ ] Measure mobile time-to-interactive in target apps.
- [ ] Optimize to under 2 seconds in expected scenarios.
- [ ] Validate preload strategy impact (entire service area).
- [ ] Confirm no critical regressions from parity features.

## 10) Security and Audit

- [ ] Apply map-access permission checks for geometry edit eligibility.
- [ ] Persist audit metadata for geometry changes:
  - [ ] User
  - [ ] Timestamp

## 11) QA and Release Readiness

- [ ] Execute P0/P1 scenarios from map_lwc_v1_test_matrix.md.
- [ ] Verify Salesforce Mobile App behavior.
- [ ] Verify Salesforce FSM Mobile App behavior.
- [ ] Run UAT for field workflow with poor-connectivity test cases.
- [ ] Sign off unresolved open items for first-pass doc.

## Open Decisions to Close Before Build Freeze

- [ ] Point placement precision assist default.
- [ ] Destructive confirmation copy.
- [ ] Icon strategy within SLDS constraints.
