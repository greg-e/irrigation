# IrrigationCheckups.com — Competitive Analysis and Requirements Assessment

Source: https://www.irrigationcheckups.com
Reviewed: May 5, 2026

## What It Is

IrrigationCheckups.com is a purpose-built SaaS inspection and reporting platform for irrigation professionals. Its core workflow is: perform a system checkup in the field using a mobile device → auto-generate a customized PDF report → create a repair quote → capture customer e-signature → share with client.

It is a standalone tool, not integrated into a CRM or FSM platform. It is not an invoicing or billing system.

Pricing: $79/mo PRO (unlimited checkups, up to 250 zones/controller, e-signature, price books, team users, company branding).

---

## Feature Inventory

### Client and Site Management
- Client accounts with contact information
- Multi-site support — one billing contact, multiple site locations
- Google Maps autocomplete for address entry
- Client site map showing all sites on a map

### System Inventory per Site
- Pumps
- Backflow devices (with geo-tag and photos)
- Controllers (model, zone count, accessories — master valve, sensors; geo-tag and photos)
- Sensors
- Zones (location description, landscaping type, head type, emitter type)
- Up to 5 photos per device

### Program Settings
- Days watering, start times, zone run times
- Conservation checkup shows estimated water savings with a new program

### Inspection / Checkup Workflow
- Customizable report templates (repair-focused or conservation-focused)
- Per-zone repair callouts with customizable issue types per template
- Voice-to-text notes on callouts
- Photo capture per zone/callout
- Fast quote building — callouts auto-populate quote line items during the checkup
- Parts list PDF generation for supply house ordering

### Geo-Tagging / Site Map
- GPS location capture for pumps, backflows, controllers, zone valves
- Property-specific site map showing all geo-tagged components
- Accuracy: consumer device GPS (5–20 ft range)

### Quoting
- Price books (multiple, assignable by client type or specific client)
- Quote items tied to specific repair callouts
- Quote auto-builds as callouts are recorded during the checkup
- Quote PDF generation
- Electronic signature capture — embedded in the final checkup report

### Reporting
- PDF report generation (customizable, company-branded)
- Repair-focused and conservation-focused report types
- Historical report storage (active subscription)
- Dashboard with weekly/monthly/annual trend reporting

### Team and Access
- Multi-user team accounts (PRO plan)
- Role-based access: Admin, Manager, Technician
- Multi-location hierarchy: Corporate → Division → Region → Branch
- Share in-process checkups between team users

---

## Requirements Derived for Our Salesforce FSM Build

### Already Captured in Our Design

| IrrigationCheckups Feature | Our Equivalent |
|---|---|
| Client account with multiple sites | Account (Property) with service location data |
| Backflow device record + photos | Asset (Record Type: Backflow) + Files |
| Controller record + zone count + photos | Asset (Record Type: Controller) + Files |
| Program settings (days, start time, run times) | `Irrigation_Program__c` child custom object |
| Zone descriptions (location, head type) | Asset (Record Type: Zone) with custom fields |
| Repair quote with price book | ExtraWork custom app (estimating) |
| Photo capture per component | Files on Asset |
| Historical inspection reports | Work Order / Service Appointment history per Asset |

---

### Gaps and New Requirements Identified

#### 1. Repair Callout Object
IrrigationCheckups has a structured "Repair Callout" concept — a discrete issue flagged at a specific zone or component during a checkup, with notes, photos, and an auto-linked quote item.

**Decision:** Repair Callouts are modeled as **Work Order Line Items with extended custom fields** — no separate custom object. Schema defined in [fsm_asset_architecture.md](fsm_asset_architecture.md):
- `Issue_Type__c` — Picklist (Broken Head / Valve Fault / Controller Issue / Leak / Low Pressure / Overspray / Clog / Other)
- `Callout_Status__c` — Picklist (New / Quoted / Approved / Completed)
- `Callout_Notes__c` — Long Text Area
- `Callout_Photo__c` — Files attachment reference
- `ExtraWork_Estimate_Line_Ref__c` — Reference to linked ExtraWork estimate line

#### 2. Structured Inspection / Checkup Record
IrrigationCheckups treats each site visit as a discrete "Checkup" record — not just a work order. A checkup captures the full system state snapshot at a point in time (program settings, zone conditions, repair callouts).

Our current model uses Service Appointment + Work Order. Consider:
- Whether the SA/WO is sufficient as the checkup container, or
- Whether a dedicated `System_Checkup__c` object tied to the SA provides cleaner separation between scheduling and inspection data

#### 3. Conservation / Water Efficiency Audit Type
IrrigationCheckups distinguishes two inspection types: repair-focused and conservation-focused. The conservation type includes estimated water savings from program changes.

We have not modeled this. Requirements:
- Work Type differentiation: `Irrigation - Checkup (Repair Focus)` vs `Irrigation - Checkup (Conservation Focus)`
- On conservation checkup: capture current program run times and proposed run times
- Calculate and display estimated water savings (gallons/week, or % reduction)
- This could be formula fields on `Irrigation_Program__c` comparing current vs recommended run times

#### 4. Parts List Generation
IrrigationCheckups generates a parts list PDF for supply house ordering from a completed checkup.

We have not modeled a parts list workflow. Requirements:
- Work Order Line Items (parts) should be exportable as a parts list
- This could be a simple Report → PDF in Salesforce, or a custom action on the Work Order
- Coordinate with ExtraWork app — if estimate line items include parts, the parts list may come from ExtraWork output

#### 5. Geo-Tag During Field Audit (Mobile GPS Capture)
IrrigationCheckups captures GPS coordinates for backflows, controllers, and zone valves in the field at time of audit. This feeds the property site map.

Our design already has `Latitude`/`Longitude` on the Asset object. The missing piece is:
- A mobile-friendly flow or LWC in the FSM Mobile app that captures device GPS and writes it to the Asset record at audit time
- Without this, coordinates must be entered manually — high friction, likely skipped

This directly unblocks the spatial mapping options explored in `spatial_mapping_options.md`.

#### 6. Customer-Facing Report Delivery
IrrigationCheckups auto-generates a branded PDF report and delivers it to the customer, with e-signature capture embedded in the report.

Our ExtraWork app handles estimates and approvals. The gap is the **post-checkup inspection summary report** delivered to the customer showing:
- System inventory snapshot
- Issues found (repair callouts)
- Recommended program changes
- Quote summary (linked to ExtraWork estimate)

Requirements:
- Decide whether this report comes out of Salesforce (Visualforce/Report/Flow-generated PDF) or ExtraWork
- E-signature for quote approval is owned by ExtraWork — confirm whether inspection summary also needs signature or just delivery

---

## Summary Assessment

IrrigationCheckups.com is strong validation that the workflow we are building is the right one. Its feature set maps closely to our design. Key gaps it exposes:

1. **Repair Callout** as a structured in-field record during inspection — not currently modeled
2. **Checkup as a discrete record type** — may need cleaner separation from WO/SA
3. **Conservation audit work type** — water savings calculation not modeled
4. **Parts list generation** — not modeled, likely solved by WO Line Item report
5. **GPS capture at audit time** in FSM Mobile — unblocks spatial mapping
6. **Customer-facing inspection report** — needs a delivery mechanism and ownership decision (SF vs ExtraWork)

---

## Open Questions

- [x] Should Repair Callouts be a custom object or modeled as Work Order Line Items with an issue type/status? **→ Work Order Line Item with extra fields (Issue Type picklist, Status, Callout Notes, photo attachment).**
- [x] Is a discrete `System_Checkup__c` record needed, or is Service Appointment sufficient as the checkup container? **→ Service Appointment is sufficient. Attach checkup data directly to the SA.**
- [x] Who owns the post-checkup customer report delivery — Salesforce or ExtraWork? **→ Salesforce owns the report (Flow + PDF output or Visualforce).**
- [x] Should conservation audit / water savings estimation be in scope for this build? **→ Out of scope — future phase.**
- [x] Is GPS coordinate capture during field audit feasible in the FSM Mobile app at launch? **→ Yes — build GPS capture at launch. Custom LWC screen flow writes device GPS to Asset Latitude/Longitude fields.**
