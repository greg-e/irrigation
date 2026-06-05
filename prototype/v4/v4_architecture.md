# V4 Architecture

## Purpose

Define the split architecture for the irrigation map experience in version 4.

This folder is a container for related V4 assets, not just one mobile variant.

## Implementation Spec

- [v4_implementation_spec.md](v4_implementation_spec.md)

## Architecture Model

Use one shared base LWC for the core workspace, then wrap it with channel-specific shells for desktop, Salesforce Mobile App, and FSM Mobile App.

### Shared Base

- `irrigation-map-workspace`
- Owns selected asset state, edit state, save state, offline state, and layout orchestration
- Coordinates the map canvas, bottom sheet, and workflow panels

### Channel Wrappers

- `irrigation-map-desktop`
- `irrigation-map-mobile`
- `irrigation-map-fsm-mobile`

Each wrapper handles channel-specific layout rules, density, and navigation conventions while reusing the shared base behavior.

### Child Components

- `irrigation-map-canvas`
- `irrigation-map-bottom-sheet`
- `irrigation-map-checklist`
- `irrigation-map-submit-panel`
- `irrigation-map-components-panel`
- `irrigation-map-status-chip`
- `irrigation-geometry-toolbar`

## UI Split

[v4_ui_split.mmd](v4_ui_split.mmd)

## Split Rules

- Keep the base LWC responsible for shared state and workflow coordination.
- Put layout differences in wrappers, not in the shared base.
- Use child LWCs only when a region has meaningful state, behavior, or reuse value.
- Keep simple visual sections inside the parent template if they do not need their own lifecycle.

## Mobile Behavior

- Mobile is map-first.
- The bottom sheet is the primary control surface.
- Peek state shows quick actions.
- Expanded state exposes checklist, submit, components, and geometry tools.
- Auto-save remains visible through the status chip.
- Rotation must preserve the open panel and edit state.

## Desktop Behavior

- Desktop can show more simultaneous surface area.
- The base workspace still owns the same state model.
- The wrapper can present a less compressed layout while reusing the same child pieces.

## FSM Mobile Behavior

- FSM Mobile should preserve the map-first workflow.
- It may prioritize quicker access to asset actions and field-edit flows.
- The wrapper can tune spacing, ordering, and visible density without changing shared state rules.

## Design Principle

The goal is one architecture with multiple surfaces: shared behavior in the base, channel behavior in wrappers, and focused UI pieces in children.
