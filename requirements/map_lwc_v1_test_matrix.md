# Map LWC V1 Test Matrix

Source baseline: requirements/map_lwc_responsive_v1_first_pass.md

## Test Scope

Validate responsive behavior, editing parity, offline reliability, and map initialization logic across desktop and mobile runtimes.

## Environment Matrix

| Environment | Device Type | Orientation | Connectivity Modes |
|---|---|---|---|
| Salesforce Desktop | Desktop browser | N/A | Online |
| Salesforce Mobile App | Phone | Portrait + Landscape | Online, Offline, Reconnect |
| Salesforce FSM Mobile App | Phone | Portrait + Landscape | Online, Offline, Reconnect |

## Functional Test Matrix

| ID | Area | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| T01 | Entry Scope | Open map with valid asset context | Map opens successfully | P0 |
| T02 | Entry Scope | Attempt open without asset context | Access blocked per scope | P0 |
| T03 | Init Centering | Parent location exists | Map centers on parent/asset context | P0 |
| T04 | Init Centering | Parent missing location, GPS available | Map centers on user location at neighborhood zoom | P0 |
| T05 | Init Centering | Parent missing location, GPS unavailable | Map opens at last known extent | P0 |
| T06 | Mobile Layout | Select asset on mobile | Bottom sheet opens in peek state | P0 |
| T07 | Mobile Layout | Peek actions visible | Edit Details, Photo, Notes visible | P0 |
| T08 | Rotation | Rotate during details state | State preserved after reflow | P0 |
| T09 | Rotation | Rotate during geometry edit | Edit state preserved after reflow | P0 |
| T10 | Geometry Entry | Tap Edit Geometry | Edit mode starts | P0 |
| T11 | Geometry Controls | In mobile edit mode | Geometry tools in expanded sheet only | P0 |
| T12 | Auto-Save | Perform edit change | Save triggers automatically | P0 |
| T13 | Save Feedback | Save in progress/success/failure | Inline chip shows correct status | P0 |
| T14 | Save Failure | Save fails during edit | Edit continues, pending state retained, retry queued | P0 |
| T15 | Undo | Perform edit then undo | Single-step undo works | P0 |
| T16 | Destructive Action | Delete action invoked | Single confirmation required | P0 |
| T17 | Offline Edit | Edit while offline | Local pending edit stored | P0 |
| T18 | Reconnect Sync | Restore network | Auto-sync begins immediately | P0 |
| T19 | Conflict Handling | Server conflict on reconnect | User prompted to resolve conflict | P0 |
| T20 | Pending Indicator | Pending edits exist | Global banner visible | P0 |
| T21 | Pending Merge | Edit asset with existing pending changes | Changes append to same pending set | P1 |
| T22 | GPS Follow | GPS available, not editing | Map follows user location | P1 |
| T23 | GPS During Edit | Geometry editing active | Auto-follow pauses | P1 |
| T24 | GPS Fallback | GPS lost mid-session | Last known location + manual pan retained | P1 |
| T25 | Child Selection | Multiple children | Nearest child auto-selected | P1 |
| T26 | Tie Handling | Equal nearest distance | Map centers between tied assets, no highlight | P1 |
| T27 | Add Asset | Start add flow | Manual add only (no auto placement) | P1 |
| T28 | Add Asset | First step in add flow | Map tap placement required before details | P1 |
| T29 | Snapping | New placement/edit by default | Snapping is off | P2 |
| T30 | Clustering | Dense map view | Cluster + tap-to-expand behavior works | P1 |
| T31 | Performance | Mobile initial load | Time-to-interactive < 2 seconds in target context | P0 |
| T32 | Cache Retention | Shift/day boundary with cache | Cache follows current shift/day policy | P1 |
| T33 | Pending Across Shift | Unsynced edits at shift end | Pending carries to next shift until sync | P1 |
| T34 | Geometry Quality | Invalid geometry detected | Auto-repair runs in background | P1 |
| T35 | Geometry Quality | Auto-repair fails | Manual geometry edit available to resolve | P1 |
| T36 | Access Control | Mobile user with map access edits geometry | Edit allowed | P2 |
| T37 | Audit Baseline | Geometry saved | User + timestamp recorded | P2 |

## Non-Functional Checks

| ID | Check | Target |
|---|---|---|
| N01 | Mobile TTI | Under 2 seconds |
| N02 | State Preservation | Rotation does not reset active context/edit state |
| N03 | Offline Reliability | Pending edits survive app/background transitions |
| N04 | Data Completeness | No unintended data drop under high density |

## Defect Triage Guidance

- Severity 1: Any P0 scenario blocking field edit, sync, or map load in valid context.
- Severity 2: P1 behavior mismatch with viable workaround.
- Severity 3: Cosmetic or low-impact P2 mismatch.
