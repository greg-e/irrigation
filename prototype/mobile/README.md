# Mobile Prototype

This prototype is intentionally lightweight and disposable. The canonical stakeholder surface is:

- ui/fsm_mobile_inspection_standalone.html

## Surfaces

1. Logic sanity check (terminal)
- File: inspection_state_machine.py
- Run (Windows PowerShell): python .\prototype\mobile\inspection_state_machine.py

2. Canonical mobile UI demo
- File: ui/fsm_mobile_inspection_standalone.html
- Open in browser to run the WOLI-first flow

3. Legacy comparison UI (kept for reference)
- Files: ui/index.html, ui/styles.css, ui/app.js

## What the canonical UI now demonstrates

- WOLI-first workspace from Work Order overview
- Deterministic set resolver visibility (Region + Inspection Type + Season)
- Hard submit blockers:
	- Callout policy met (callout exists or "No irrigation issues found")
	- AM assigned
- Advisory-only required question completion (non-blocking)
- Required callout type on create: Repair or Enhancement

## Guided Demo (Mobile Segment)

1. Open Work Order overview and select the irrigation WOLI.
2. In Related tab, log at least one callout and set type.
3. Assign AM and submit irrigation report.
4. Return to Work Order overview and verify WOLI status transition.

## Notes

- This is not production code.
- Data is mocked.
- Sync behavior is intentionally implicit for this prototype pass.
