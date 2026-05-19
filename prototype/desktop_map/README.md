# Desktop Assets Baseline Prototype

Separate desktop prototype artifact for property-linked irrigation asset baseline.

## Scope Locked in This Prototype

- Queue-first desktop view
- Shared BM/AM/IM UI and permissions
- Lightweight AM queue for post-inspection callout triage
- Manual asset updates only (import intentionally out of scope)
- Canonical hierarchy:
  - Account (Property)
  - Optional System root asset
  - Controller assets
  - Zone assets under Controller
  - Zone component assets: Valve, Head, Drip
  - Backflow asset under System
  - Irrigation programs as `Irrigation_Program__c` child records of Controller
- Required baseline:
  - At least 1 Controller
  - At least 1 Zone
  - Every Zone linked to a Controller
  - At least 1 Backflow
- Placeholder Zones allowed and counted as non-blocking warning
- Retire-only behavior (no hard delete)
- Immutable in-workspace audit log
- Local persistence via browser localStorage

## Run

Open index.html in a browser.

## Demo Success Benchmark

Target scenario: bring one property to baseline-ready in under 5 minutes, including at least one blocker resolution and one placeholder warning acknowledgment.

## AM Queue Actions

- Approve
- Needs Info
- Dismiss

## Guided End-to-End Demo Flow

1. Desktop: complete baseline requirements for one property in index.html.
2. Mobile: run irrigation WOLI flow in ../mobile/ui/fsm_mobile_inspection_standalone.html.
3. Desktop: return to index.html and process AM queue items.

## Notes

- This is a prototype only, not production code.
- Data model and interactions are intentionally simplified to validate flow and decision logic.
