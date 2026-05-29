# V4 Implementation Spec

## Goal

Make the V4 architecture real in the prototype set by aligning the desktop and mobile experiences to the same shared workspace model.

## Shared Contract

All V4 surfaces use the same top-level workspace concept:

- `irrigation-map-workspace`
- Shared state: selected asset, edit state, save state, offline state, layout state
- Shared child surfaces: map canvas, bottom sheet shell, checklist output, submit reports, components panel, save status chip, geometry toolbar

## Channel Wrappers

- `irrigation-map-desktop` should present a wider workspace with simultaneous map and control surfaces.
- `irrigation-map-mobile` should stay map-first with the bottom sheet as the primary control surface.
- `irrigation-map-fsm-mobile` should reuse the same shared behavior but optimize density for field use.

## Desktop Prototype Requirements

- Introduce a visible V4 workspace surface that shows the shared base, wrappers, and child panels.
- Keep the existing record tabs available as supporting context, but make the workspace contract the primary V4 concept.
- Show the map canvas and bottom sheet shell as coordinated halves of the workspace.
- Show checklist output, submit reports, components panel, geometry toolbar, and save status chip as child pieces of the bottom sheet shell.

## Mobile Prototype Requirements

- Keep the mobile experience map-first.
- Make the bottom sheet shell explicit as the primary interaction container.
- Surface peek and expanded states directly in the map workflow.
- Treat checklist output, submit reports, components panel, and save status chip as content inside the bottom sheet shell rather than separate competing surfaces.

## Prototype Acceptance Criteria

1. The V4 folder contains one architecture note and one implementation spec.
2. The desktop prototype shows the shared workspace contract in the UI.
3. The mobile prototype shows the same workspace contract and bottom sheet roles.
4. The diagrams in the V4 folder match the spec and do not duplicate the same model in multiple files.
5. The prototype labels use the same host, wrapper, and child component names as the spec.
