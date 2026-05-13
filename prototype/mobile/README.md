# Mobile Throwaway Prototype

This prototype is intentionally lightweight and disposable. It supports two branches:

1. Terminal branch for state and business-logic sanity checks.
2. UI branch with multiple radically different mobile layouts from one route.

## 1) Terminal branch

File: inspection_state_machine.py

Run:

- Windows PowerShell: python .\prototype\mobile_throwaway\inspection_state_machine.py

What it tests:

- Deterministic form resolution
- Bootstrap when required assets are missing
- Required-answer checkout blocking
- Suggested repair confirmation flow
- AM assignment requirement
- Complete with asset sync exceptions (without losing inspection)

## 2) UI branch

Files in ui/:

- index.html
- styles.css
- app.js

Open index.html in a browser.

What it tests:

- Three very different visual approaches from one route
- Shared interaction model with a style toggle
- Fast comparison before committing to one direction

## Notes

- This is not production code.
- Data is mocked.
- The goal is design and workflow validation speed.
