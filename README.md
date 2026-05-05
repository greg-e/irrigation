# Irrigation Asset Management — Salesforce FSM

## Overview

This project delivers a Salesforce Field Service Management (FSM) feature to catalog irrigation system assets scoped to a property (Account), connect those assets to irrigation work orders and service appointments, and streamline the estimate-to-approval workflow for repairs.

## Core Objectives

- **Asset Catalog**: Track individual irrigation system components (zones, controllers, heads, valves, backflow preventers, etc.) as Salesforce Assets linked to their parent Account (property).
- **Asset-to-Service Appointment Linkage**: Associate irrigation work type service appointments with specific assets so repair history is captured at the component level.
- **Estimate Workflow**: Generate estimates (quotes/work orders) directly from a service appointment context, enabling rapid customer review and digital approval so crews can proceed without delays.

## Key Entities

| Entity | Purpose |
|---|---|
| Account | Represents the property (customer site) |
| Asset | Individual irrigation component at the property |
| Work Order / Work Order Line Item | Scopes the repair or maintenance job |
| Service Appointment | Scheduled visit; linked to asset and work type |
| Quote / Estimate | Customer-facing cost breakdown tied to the work order |

## Workflow Summary

1. Property is onboarded as an **Account**.
2. Irrigation components are cataloged as **Assets** under that Account.
3. A service need is identified → **Work Order** created with irrigation work type.
4. A **Service Appointment** is scheduled and linked to the relevant Asset(s).
5. Technician documents scope → **Estimate** generated from the work order.
6. Customer receives estimate and provides **digital approval**.
7. Approval triggers crew dispatch and work completion tracking.

## Requirements

### Property-Centric

All system data is stored and maintained on the **Property Account** record. The Account is the single source of truth for the irrigation system at that site.

---

### Component Audit and Tracking

The following irrigation components must be cataloged as discrete Assets under the Property Account, with fields and history tracked at the component level:

#### Backflows
- Model, serial number, install date, last test date, test results, compliance status

#### Controllers
- Make/model, serial number, number of zones supported, install date, connectivity type (WiFi, wired, etc.)

##### Program Settings
- Zone run times, schedule days/times, seasonal adjustments, program names — stored as related records or structured data on the Controller asset

#### Zones
- Zone number, description, area served, flow rate, head type, valve association

#### Valves
- Type (ball, gate, solenoid), zone association, location description, install date, condition

#### Heads
- Type (rotor, spray, bubbler), model, nozzle size, radius, zone association, location

#### Drip
- Emitter type, GPH rating, zone association, coverage area

---

### Documentation

#### As-Built and Site Maps
- Attach as files to the Property Account; support versioning and date-stamped uploads

#### Photos
- Attach photos to the Property Account and/or individual Asset records; categorized by type (install, condition, damage, repair)

#### Damage
- Log damage events against a specific Asset with date, description, cause, and photo attachments

#### Repair
- Log repair history against a specific Asset with date, technician, work performed, parts used, and linked Service Appointment

---

### Output / Outcomes

- Full component inventory visible from the Property Account
- Repair and service history per Asset
- Estimates generated from Service Appointments with line items tied to specific Assets
- Customer digital approval of estimates before work proceeds
- Completed work captured against the Asset for ongoing audit trail

---

## Status

In progress — solution design phase.