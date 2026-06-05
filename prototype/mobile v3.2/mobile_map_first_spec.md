# Mobile Map-First UX Spec (v3.3)

## Goal
Adapt the desktop hierarchy + map relationship into a mobile pattern that preserves context without forcing split-pane layout.

## Principles
- Map is the primary canvas in mobile MAP tab.
- Hierarchy is always available via a bottom sheet.
- Selection is a single source of truth shared by map and hierarchy.
- Editing remains explicit (open detail sheet for save/remove/checklist actions).

## Interaction Model

### 1. MAP Tab Default
- Full map visible on entry.
- Bottom sheet starts in `peek` state.
- Status strip shows map context and selected component when available.

### 2. Bottom Sheet States
- `peek`: selected component summary and quick expand control.
- `half`: compact hierarchy list for quick scanning.
- `full`: full hierarchy list with search and type filter.

State transitions:
- Handle tap cycles: `peek -> half -> full -> peek`.
- Header action button cycles same states.

### 3. Hierarchy in Sheet
- Search input filters by component name, type, and description.
- Type filter options: All, Zones, Controllers, Backflows.
- List rows show:
  - Component name
  - Type + status metadata
  - Active highlight for selected component

### 4. Selection Sync
- Tapping a row in the sheet sets selected component (`mapTab.selectedKey` + `assetTab.selectedKey`).
- Selected component updates:
  - map iframe context (selected asset in URL/payload)
  - bottom sheet selected summary chip
  - status strip selected text
- Selection from other flows (related list, detail sheet) reflects in sheet highlight.

### 5. Edit Workflow
- Bottom sheet remains browse/select only.
- Editing uses existing detail sheet actions (`save`, `toggle status`, `checklist`, `remove`).
- This avoids accidental map edits while scrolling on mobile.

## UX Acceptance Criteria
- MAP tab is usable one-handed in portrait.
- Hierarchy can be opened without leaving MAP tab.
- Selected component is always obvious.
- Selection from hierarchy updates map context immediately.
- No desktop-only split pane assumptions in mobile layout.

## Notes for Prototype
- Keep desktop behavior unchanged.
- This spec targets only `prototype/mobile v3.2/mobile_v3.2.html`.
- Existing map rendering and detail sheets are reused; this is a layout + interaction adaptation.
