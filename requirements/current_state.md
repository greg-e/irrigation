# Irrigation Current State

Last updated: 2026-05-22
Owner: BA (G. Ehrenberg)
Purpose: Lightweight snapshot of what is current now.
Current focus this week: (1) complete map-provider evidence pack (cost + offline behavior) for GATE-001, (2) run Northeast discovery interviews to advance GATE-002/GATE-003.

## Standard Working Docs

- Data model: `requirements/fsm_irrigation_requirements.md`
- Process baseline: `requirements/prd_v3.1.md`
- Execution backlog: `stories/build_backlog.md`

## Current Locked Decisions

- Service Appointment is the inspection container (no separate `System_Checkup__c` object).
- Repair callouts are modeled as `WorkOrderLineItem` records.
- Pipe is modeled as attributes on System/Zone assets, not as a separate asset type.
- Mobile inspection UX follows WOLI-first flow.
- ArcGIS is out for MVP.
- Active map provider decision remains open between Mapbox and Google Maps.

## Discovery Observations

- Current irrigation execution is still branch-specific and fragmented: teams described Excel sheets, paper forms, WordPress tools, Weathermatic, and ad hoc spreadsheets as active patterns.
- Standardized reporting is desired, but the current state depends on local variation in how technicians capture notes, photos, and follow-up details.
- Emergency and ad hoc work is handled through manual coordination, with account managers and field service coordinators/dispatch filling in the gaps outside the system.
- Scheduling quality is uneven because irrigation work changes quickly, so branches want a single view of upcoming work and a simpler way to re-bucket jobs.
- Customer-facing access is not uniform; BrightView Connect is useful where enabled, but not every account has it turned on today.

## Current Open Gates

- GATE-001: Mapping provider finalization (Mapbox vs Google) — target decision date: 2026-06-07
- GATE-002: Northeast discovery gap closure
- GATE-003: Question library content lock
- GATE-004: PDF strategy in R1
- GATE-005: Required-answer edge policy
- GATE-006: AM assignment defaulting model
- GATE-007: Regional photo baseline by callout type
- GATE-008: Customer portal license timing

## Notes

- Use this file for day-to-day status.
- Keep `requirements/decision_log.md` for historical decision details.



