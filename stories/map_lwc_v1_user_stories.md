# Map LWC V1 User Stories

Source baseline: requirements/map_lwc_responsive_v1_first_pass.md

## Epic: Responsive Map LWC V1

Deliver a responsive map component with desktop-mobile parity for irrigation asset context workflows in Salesforce Desktop, Salesforce Mobile App, and FSM Mobile App.

## Story 1: Context-Based Map Initialization

- Story: As a field user, I want the map to open in the correct asset context so I can act immediately without manual setup.
- Priority: P0
- Acceptance Criteria:
  1. Given a valid asset context with parent location, when map loads, then it centers on that context.
  2. Given parent asset has no location, when map loads, then it centers on current user location at neighborhood-level zoom.
  3. Given asset location and GPS are unavailable, when map loads, then it opens last known map extent.
  4. Given no asset context, when map access is attempted, then map entry is blocked per scope rules.

## Story 2: Mobile-First Responsive Layout

- Story: As a mobile user, I want a map-first layout with adaptive controls so I can work efficiently on small screens.
- Priority: P0
- Acceptance Criteria:
  1. Given mobile viewport, when map loads, then map-first layout is used.
  2. Given asset selected, when details open, then bottom sheet defaults to peek state.
  3. Given peek state, when actions render, then pinned actions are Edit Details, Photo, Notes.
  4. Given orientation changes, when device rotates, then exact open panel and edit state are preserved.
  5. Given portrait or landscape mode, when user interacts, then full V1 behavior remains available.

## Story 3: Geometry Editing Parity

- Story: As a map user, I want full geometry editing on desktop and mobile so I can update assets in place.
- Priority: P0
- Acceptance Criteria:
  1. Given selected asset, when user taps Edit Geometry, then edit mode starts.
  2. Given mobile edit mode, when tools are shown, then geometry tools appear in expanded sheet only.
  3. Given user performs edit actions, when edits complete, then expected geometry updates are applied.
  4. Given destructive action, when user confirms, then action proceeds; if canceled, no change is applied.

## Story 4: Auto-Save and Edit Feedback

- Story: As a field user, I want automatic saving with clear status so I can keep moving without manual save steps.
- Priority: P0
- Acceptance Criteria:
  1. Given geometry or detail changes, when user edits, then changes auto-save.
  2. Given save lifecycle, when status updates, then inline chip shows Saving, Saved, or Failed.
  3. Given save failure, when user continues editing, then edits are retained as pending and retry in background.
  4. Given active session, when user requests undo, then one-step undo is available.

## Story 5: Offline Editing and Reconnect Sync

- Story: As a mobile user, I want full offline editing and reliable sync so I can work in low-connectivity areas.
- Priority: P0
- Acceptance Criteria:
  1. Given offline mode, when user edits, then edits are stored locally and remain editable.
  2. Given connectivity restored, when reconnect occurs, then auto-sync starts immediately in background.
  3. Given sync conflict, when conflict is detected, then user is prompted to resolve.
  4. Given pending edits exist, when viewing UI, then global pending banner is visible.
  5. Given pending edits on an asset, when user edits same asset again, then changes append to same pending set.

## Story 6: GPS and Follow Behavior

- Story: As a mobile user, I want location-aware behavior that does not disrupt precision editing.
- Priority: P1
- Acceptance Criteria:
  1. Given mobile usage, when GPS is available, then map follows current location.
  2. Given active geometry editing, when edit session starts, then GPS auto-follow pauses.
  3. Given GPS is unavailable, when map remains open, then map continues with last known location and manual pan.

## Story 7: Child Asset Selection Behavior

- Story: As a field user, I want predictable child-asset selection so I can find the right asset quickly.
- Priority: P1
- Acceptance Criteria:
  1. Given multiple child assets, when map initializes, then nearest child to user is selected.
  2. Given nearest-distance tie, when tie detected, then map centers between tied assets.
  3. Given tie-centered state, when map settles, then no child auto-highlight is applied.

## Story 8: Manual Add Asset to Map

- Story: As a field user, I want intentional asset placement so accidental geometry creation is avoided.
- Priority: P1
- Acceptance Criteria:
  1. Given add-asset flow, when initiated, then placement is manual only.
  2. Given placement step, when user starts flow, then first step is tap map to place point.
  3. Given point placement complete, when flow advances, then details form is shown.
  4. Given default placement mode, when editing, then snapping is off by default.

## Story 9: Data Density and Marker Behavior

- Story: As a mobile user, I want dense-map readability without losing data coverage.
- Priority: P1
- Acceptance Criteria:
  1. Given dense marker view, when map renders, then markers are clustered with tap-to-expand.
  2. Given heavy density, when performance tradeoffs occur, then data completeness is prioritized.
  3. Given mobile load, when launching map in target context, then time-to-interactive is under 2 seconds.

## Story 10: Access and Audit Baseline

- Story: As an admin stakeholder, I want controlled editing and baseline auditability for map changes.
- Priority: P2
- Acceptance Criteria:
  1. Given map-access users, when using mobile map, then geometry edits are permitted.
  2. Given geometry update, when persisted, then audit fields capture user and timestamp.

## Out of Scope for V1

- Non-context map entry.
- Auto-placement of assets without explicit user action.
- Multi-step undo history beyond one step.
- Mandatory FPS SLA.

## Backlog Notes

- Close open item: default point-placement precision assist.
- Finalize destructive confirmation copy.
- Confirm map-control icon strategy within SLDS constraints.
