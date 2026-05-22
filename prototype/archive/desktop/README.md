# Desktop Map Prototype

This folder contains the desktop irrigation prototype with a report entry page and a record page that includes hierarchy, map, program, and related data behaviors.

## Primary Artifact

The primary prototype page is `desktop_v3.1.html`.

Use it to evaluate:
- Asset record details and edits
- Hierarchy navigation
- Embedded map integration (via `../spatial_portable/index.html`)
- Controller program embed (via `../program/controller_program.html`)
- Related service appointments, callouts, and proposals

## File Guide (Reviewed)

- `desktop_v3.1.html`: Main record experience (primary page).
- `property_record.js`: Core record-page logic, migrations, tab behavior, edit/create modals, map iframe messaging, related/program rendering.
- `index.html`: Report-style landing page that links into the record page.
- `app.js`: Report-page logic and AM queue actions.
- `styles.css`: Shared styling for report and record pages.
- `seed_data.json`: Seed state for properties, assets, programs, inspections, and queue data.
- `desktop_prototype_with_map_feature_inventory.md`: Detailed active vs dormant feature inventory.

## How to Run

Because this prototype uses `fetch("seed_data.json")`, run from a local web server rather than opening files directly from disk.

From the repo root:

```powershell
cd prototype/desktop
python -m http.server 5500
```

Then open:
- `http://localhost:5500/index.html`
- `http://localhost:5500/desktop_v3.1.html?property=prop-001`

## Navigation Flow

1. Start at `index.html` for report-style queue context.
2. Click an irrigation system link to open `desktop_v3.1.html` with query params.
3. In the record page, switch tabs: Details, Map, Hierarchy, Program, Related, Chatter, History.
4. Use Edit/New modal workflows to change assets and validate dependency rules.

## URL Parameters

`desktop_v3.1.html` supports:
- `property`: Property ID, for example `prop-001`.
- `asset`: Optional asset ID to open specific context.
- `controller`: Legacy-compatible alias for selecting a controller context.

Example:

`desktop_v3.1.html?property=prop-001&asset=asset-s-1`

If `property` does not resolve, the page shows `Irrigation Asset Not Found`.

## Data and Persistence

- Shared localStorage key: `desktopAssetSetupPrototypeV3`
- Seed file: `seed_data.json`
- Both `app.js` and `property_record.js` run migration/normalization logic during load.
- Record changes (including map coordinate updates from iframe messaging) persist to localStorage.

To reset demo data:
- Use the reset control on `index.html`, or
- Clear browser localStorage for this origin.

## Scope Notes

Implemented and active:
- Record details/editing with type-aware fields
- Hierarchy tree navigation
- Embedded spatial map integration using postMessage
- Controller program embedding
- Related records rendering

Present in JS but not currently surfaced in this HTML variant:
- Advanced in-page map editing controls (draw/move/delete)
- KML import/export controls

See `desktop_prototype_with_map_feature_inventory.md` for full detail.

## Prototype Constraints

- Prototype-only implementation (not production hardened).
- Data model and UI logic are intentionally simplified to validate workflow and UX decisions.
