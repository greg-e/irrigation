# Desktop Asset Setup - UX Guardrails (Do / Don't)

Purpose: keep the Salesforce asset-baseline experience focused, low-noise, and fast for BM/AM/IM.

## Do

1. Do keep one primary goal per screen state.
2. Do show blockers at top with direct fix path.
3. Do keep only essential actions visible:
   - Add Asset
   - Validate
    - Validate Baseline
4. Do keep warning language neutral and concise.
5. Do use progressive disclosure for secondary details.
6. Do keep labels operational and plain-language.
7. Do preserve standard Salesforce interaction patterns where possible.
8. Do make readiness obvious without extra clicks.
9. Do default to compact list/table density for queue operations.
10. Do keep color semantics consistent:
    - Red: blocking errors only
    - Amber: warnings
    - Blue: primary action

## Don't

1. Don't add decorative visuals that compete with task focus.
2. Don't create multiple primary CTAs in the same section.
3. Don't force users to parse long prose before acting.
4. Don't hide blockers behind tabs or collapsible sections.
5. Don't duplicate readiness messages in multiple components.
6. Don't require modal confirmations unless risk is meaningful.
7. Don't use custom UI patterns if OOTB solves the use case.
8. Don't surface non-essential metrics in the workspace body.
9. Don't overload forms with optional fields up front.
10. Don't introduce role-based UI branching unless permission logic actually differs.

## Screen-Level Guardrails

## Queue

1. Keep filters to: Branch, Process Stage, Assigned Manager, Has Placeholders.
2. Keep sort deterministic and obvious.
3. Keep KPI strip to five numbers max.

## Workspace Overview

1. Place readiness and rule meter above the fold.
2. Keep applicability flags in one compact card.
3. Show placeholder count as warning, not blocker.

## Assets

1. Keep hierarchy simple and readable.
2. Keep canonical hierarchy visible in context: Account -> System (optional) -> Controller -> Zone -> components (Valve, Head, Drip) with Backflow under System.
3. Prefer explicit edit actions over gesture interactions.
4. Hide retired assets by default with one toggle.

## Validation

1. Show actionable issues with one-click navigation.
2. Separate blockers from warnings visually and semantically.
3. Keep validation output scannable in under 10 seconds.

## Audit

1. Keep read-only by default.
2. Show latest entries first.
3. Include who, when, action, entity, details.

## Definition of Done (UX)

1. New user can validate one property baseline in under 5 minutes.
2. User can identify blockers in under 10 seconds.
3. User can complete without opening more than one secondary section.
4. No decorative element competes with primary CTA visibility.
