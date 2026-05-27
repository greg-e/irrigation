# FSM Mobile UI Handoff (Latest)

## Workspace + Active Surface
- Repo root: C:/Users/GEhrenberg/irrigation
- Primary file: prototype/mobile/mobile_v3.1.html
- Active browser page during validation: FSM Mobile Inspection Prototype (file URL in VS Code browser)

## Current Product Flow

### 1) Work Order to WOLI Workspace
- Default launch is Work Order mode with overview and WOLI list.
- Opening an irrigation WOLI switches to WOLI mode and loads a per-WOLI session state.
- WOLI start/reopen behavior updates status (NEW -> IN PROGRESS) and routes to map/details as appropriate.

### 2) WOLI Session Model
- Session state is isolated per WOLI via an in-memory woliSessions map.
- Session includes:
	- controllers, backflows, zones
	- required questions
	- callouts and callout history
	- AM assignment
	- no-issues flag
	- stage/progress metadata

### 3) Tabs and Sections
- Top tabs in WOLI mode: Details, Map, Related, Feed.
- Related tab sections:
	- Components
	- Inspection Guide
	- Callouts
	- Submit Report
- Related section expansion is guidance-driven (map-first prioritization based on unresolved requirements).

## Submit and Compliance Logic

### Hard Blockers
- Submit is blocked until both are true:
	- Callout policy met: at least one callout OR No irrigation issues found checked.
	- Account Manager assignment present.

### Soft Gate
- Required questions are advisory for submit eligibility.
- Remaining required questions are displayed in submit helper text and can require justification flow messaging.

### Progress Scoring
- WOLI progress is weighted:
	- 60% callout policy
	- 20% AM assignment
	- 20% required-question completion

## Map and Asset Interaction State

### Map Workspace
- Map iframe is used for map context and asset payload updates.
- Bottom sheet supports quick actions and expanded controls.

### List-Mode Fallback
- If map is unavailable, map canvas enters list mode.
- List mode supports:
	- inline asset edit (name, links, map coordinates, notes)
	- status toggle
	- remove
	- inline callout creation
	- optional geolocation capture for callouts

### Asset Consistency
- Save/remove/status flows refresh dependent surfaces (snapshot, callouts, registry/list, map UI).
- Name validation prevents blank and duplicate asset names.
- Callout references and asset relationships are updated when assets are renamed/removed.

## Resolver + Inspection Guide
- Resolver metadata is visible in Inspection Guide:
	- region
	- inspection type
	- season
	- question set version
- Required checklist completion meter updates with answered count and percentage.

## Known Implementation Notes
- SLDS styles are loaded from CDN.
- Data is mock/session-local and not persisted.
- List expanded card uses significant inline style blocks; functionally stable but not ideal for maintainability.

## Recommended Next Steps
- Refactor repeated inline list-card styles into CSS classes to reduce UI drift.
- Add lightweight smoke checks around submit gating and per-WOLI session switching.
- If parity is needed, align list expanded card layout to the detail sheet component structure.

