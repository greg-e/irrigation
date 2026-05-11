# Desktop Assets Setup Prototype

Separate desktop prototype artifact for property-linked irrigation asset setup.

## Scope Locked in This Prototype

- Queue-first desktop workflow
- Shared BM/AM/IM UI and permissions
- Manual asset setup only (import intentionally out of scope)
- Required baseline for completion:
  - At least 1 Controller
  - At least 1 Zone
  - Every Zone linked to a Controller
  - At least 1 Backflow
  - Pump/Sensor conditional rules based on property flags
- Placeholder Zones allowed and counted as non-blocking warning
- Retire-only behavior (no hard delete)
- Immutable in-workspace audit log
- Local persistence via browser localStorage

## Run

Open index.html in a browser.

## Demo Success Benchmark

Target scenario: move one property from Not Started to Complete in under 5 minutes, including at least one blocker resolution and one placeholder warning acknowledgment.

## Notes

- This is a prototype only, not production code.
- Data model and interactions are intentionally simplified to validate flow and decision logic.
