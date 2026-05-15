# Desktop Asset Setup - OOTB-First Blueprint (Low Distraction)

Date: May 11, 2026

Goal: deliver property-related irrigation asset setup in Salesforce with the least distracting user experience and the least custom build.

## 1. Product Intent

Primary objective:

1. Help BM/AM/IM quickly move a property from Not Started to Complete.
2. Keep user attention on only the next required action.
3. Prefer Salesforce OOTB behavior and admin config before custom UI.

Low-distraction design principle:

- Blockers first
- Warnings second
- Everything else collapsed or secondary

## 2. Scope Lock

In scope:

1. Queue-first workflow
2. Manual asset setup
3. Setup statuses: Not Started, In Progress, Complete
4. Required completion baseline
5. Reopen Setup action
6. Retire-only behavior (no hard delete)
7. Visible audit history
8. Canonical hierarchy in setup flow:
   - Account (Property)
   - Optional root Asset record type `System` (Irrigation System)
   - Controller assets under System
   - Zone assets under Controller
   - Zone component assets under Zone: Valve, Head, Drip
   - Backflow asset under System
   - `Irrigation_Program__c` as child records under Controller

Out of scope (v1):

1. Import
2. Property ownership automation
3. Auto notifications
4. Complex role-based UI differences
5. Program A/B/C/D schedule setup in this flow

## 3. OOTB vs Low-Code vs Custom Matrix

## 3.1 Queue and Progress

Requirement: property queue with filters and KPI visibility.

Recommendation:

1. OOTB List View for queue.
2. OOTB Dashboard for KPI strip.
3. OOTB Report charts for status and placeholder tracking.

Implementation level: OOTB

## 3.2 Setup Workspace

Requirement: focused property workspace with minimal distractions.

Recommendation:

1. Lightning Record Page for Account (Property).
2. Dynamic Forms sections for setup summary.
3. Related List - Single for Assets.
4. Utility bar or compact related list for audit history.

Implementation level: OOTB

## 3.3 Completion and Reopen Actions

Requirement: controlled status transitions and validation gates.

Recommendation:

1. Screen Flow action: Mark Setup Complete.
2. Screen Flow action: Reopen Setup.
3. Validation logic in flow + validation rules.

Implementation level: OOTB + Flow

## 3.4 Validation and Guardrails

Requirement: baseline checks and prevent destructive invalid changes.

Recommendation:

1. Validation Rules for required field constraints.
2. Duplicate Rule for zone uniqueness key.
3. Record-triggered Flow for conditional System/component gating.
4. Record-triggered Flow for retire safeguards.

Implementation level: OOTB + Flow

## 3.5 Audit Trail

Requirement: immutable visible action history.

Recommendation:

1. Field History Tracking where adequate.
2. Custom audit object for richer action logs.
3. Record-triggered Flow to write audit entries.

Implementation level: OOTB + Flow

## 3.6 What would require custom LWC (only if later needed)

1. Single-page synchronized tree + detail + inline validation jump UX.
2. Highly customized embedded queue/workspace shell.

Implementation level: Custom (deferred)

## 4. Minimal Salesforce Page Blueprint

## 4.1 Account Record Page (Property Setup)

Section order (top to bottom):

1. Setup Header
   - Irrigation Setup Status
   - System Root Present
   - Placeholder Zone Count
2. Actions
   - Mark Setup Complete
   - Reopen Setup
3. Blockers Card (Flow output)
4. Assets Related List
5. Audit History Related List

Keep everything else in secondary tabs or collapsed sections.

## 4.2 Queue Entry Point

Landing page should be a list view with default sort:

1. In Progress
2. Not Started
3. Complete
4. Oldest updated first within each status

Filters:

1. Branch
2. Setup Status
3. Assigned Manager
4. Has Placeholders

## 5. Data Model Additions

On Account:

1. Irrigation_Setup_Status__c (Not Started, In Progress, Complete)
2. Has_System_Root__c (Checkbox)
3. Placeholder_Zone_Count__c (Number)

On Asset (confirm existing fields from canonical model):

1. Asset_Type__c
2. Controller_Label__c
3. Controller_Total_Zones__c
4. Zone_Number__c
5. ParentId
6. Backflow_Type__c
7. Is_Placeholder__c
8. Normalization_Status__c
9. Status
10. Head_Subtype__c (Rotor, Spray)

On Irrigation_Program__c:

1. Controller_Asset__c
2. Program_Name__c
3. Schedule_Days__c
4. Start_Time__c
5. Zone_Asset__c
6. Run_Time_Minutes__c
7. Seasonal_Adjust_Pct__c
8. Is_Active__c

Audit object:

1. Irrigation_Setup_Audit__c
2. Account__c, Asset__c, Actor__c
3. Action__c, Action_Timestamp__c, Details__c
4. Changed_Fields_JSON__c

## 6. Validation Logic (Implementation Ready)

## 6.1 Completion Blockers

Mark Setup Complete checks:

1. At least one active Controller
2. At least one active Zone
3. Every active Zone linked to active Controller
4. At least one active Backflow
5. If active System exists, each active Controller must have ParentId -> System
6. If active System exists, at least one active Backflow must have ParentId -> System

If any fail: block completion and show detailed list.

## 6.2 Zone Integrity

1. Zone must have Zone_Number__c.
2. Zone must have ParentId.
3. Zone parent must be Controller.
4. Zone number unique per controller.

## 6.3 Retire Rules

1. Cannot retire a Controller if active Zones still linked.
2. If property status = Complete, block retire when resulting state violates completion baseline.
3. Cannot retire System when active Controller or Backflow assets are still linked.

## 6.4 Optional System Root Save Rules

On Account save:

1. If Has_System_Root__c = true, at least one active System asset must exist.
2. If Has_System_Root__c = true and active System exists, all active Controllers and Backflow assets must be parented to that System.

## 7. Automation Sequence

## 7.1 Auto Status to In Progress

When first setup asset is created:

- If status = Not Started, set status = In Progress.

## 7.2 Placeholder Count Maintenance

On Zone create/edit/retire:

- Recalculate and write Placeholder_Zone_Count__c.

## 7.3 Audit Writes

On key actions:

1. Create Asset
2. Edit Asset
3. Retire Asset
4. Mark Complete
5. Reopen Setup
6. Validate

Write one immutable audit row per action.

## 8. Low-Distraction UX Rules (Build Constraints)

1. Show max three primary actions on screen at once.
2. Never show non-blocking warnings in red; reserve red for blockers.
3. Keep optional details collapsed by default.
4. Do not show decorative visual noise in operational pages.
5. Use concise labels and avoid duplicate status wording.

## 9. Acceptance Tests

1. User can complete setup in under 5 minutes for one property.
2. Blockers are clear and actionable.
3. Placeholder zones allow completion but show warning count.
4. Reopen works without ownership or notification side effects.
5. Retire safeguards prevent invalid baseline breaks.

## 10. Delivery Recommendation

Phase 1 (admin-first): OOTB + Flow only.

Phase 2 (only if proven necessary): limited custom LWC for advanced single-screen productivity patterns.
