# Spatial Mapping Portable Prototype

HTML-first portable prototype for irrigation asset spatial mapping.

## Scope in this pass

- Real Google Maps JavaScript API rendering
- Geometry CRUD for:
  - Asset points (markers)
  - Zone boundaries (polygons)
  - Pipe/wire paths (polylines)
- Fake async API contract to mirror future Apex/service calls
- Portable context contract (`propertyId`, `assetId`, `workOrderId`, `mode`) via URL query params

## Run

1. Copy `config.local.example.js` to `config.local.js`.
2. Add your Google Maps API key in `config.local.js`.
3. Open `index.html` in a browser.

Example URL with context:

`index.html?propertyId=prop-002&assetId=asset-z-1&workOrderId=wo-101&mode=field`

## Files

- `index.html`: shell UI
- `styles.css`: presentation
- `app.js`: orchestration and UI bindings
- `core/fakeApi.js`: async in-memory repository
- `core/googleMapAdapter.js`: map adapter and geometry interaction layer
- `core/contracts.js`: shared types, defaults, and helpers

## Notes

- `config.local.js` is ignored by git.
- This is a prototype, not production code.
- The adapter/API seams are intentionally structured to ease migration to LWC + Apex.
