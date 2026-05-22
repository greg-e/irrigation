# Mobile Prototype

This folder contains the standalone mobile inspection prototype for FSM irrigation discovery work.

## Primary Surface

- Primary file: mobile_v3.1.html
- This is the current source of truth for mobile demo behavior.

## Quick Start

1. Open mobile_v3.1.html in a browser.
2. Start from Work Order overview.
3. Open the irrigation WOLI into the WOLI workspace.

## What The Working Standalone Demonstrates

- Work Order to WOLI transition (WO mode to WOLI mode).
- WOLI progress scoring:
	- 60% callout policy
	- 20% AM assignment
	- 20% required-question completion
- Resolver context visibility (Region, Inspection Type, Season, question set version).
- Tab model in WOLI workspace:
	- Details
	- Map
	- Related
	- Feed
- Related sections:
	- Components (asset list and edits)
	- Inspection Guide (required question checklist)
	- Callouts
	- Submit Report
- Map/list hybrid behavior for assets, including:
	- Asset create/edit/remove
	- Status toggle
	- Inline callout creation
	- Optional geolocation capture for callouts
- Submit gate behavior:
	- Hard blockers:
		- Callout policy met (at least one callout, or No irrigation issues found)
		- Account Manager assigned
	- Soft gate:
		- Remaining required questions are advisory; submission can proceed with justification flow messaging

## Mobile Folder Contents

- mobile_v3.1.html: Active standalone prototype (primary).
- index.html: Older shell/alternate entry point kept for reference.
- app.js: Legacy script used by index.html.
- styles.css: Legacy stylesheet used by index.html.
- notes.md: Handoff notes and implementation history.

## Suggested Demo Path

1. From Overview, open the irrigation WOLI.
2. In Map or Components, review/edit assets.
3. In Callouts, add at least one callout (or mark No irrigation issues found if eligible).
4. In Submit Report, assign AM.
5. Submit irrigation report and verify status/result messaging.

## Notes

- Prototype only; not production code.
- Data is mocked in the standalone file.
- External SLDS CSS is loaded from CDN in the standalone file.
