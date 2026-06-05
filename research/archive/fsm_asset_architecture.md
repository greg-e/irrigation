> **SUPERSEDED**
> **Superseded by:** [requirements/fsm_irrigation_requirements.md](../../requirements/fsm_irrigation_requirements.md) + [requirements/irrigation_prd_v2.md](../../requirements/irrigation_prd_v2.md)
> **Rationale:** Architecture decisions are consolidated into the Standard FSM requirements metadata baseline and PRD. Asset hierarchy, object chain, and scope decisions are now authoritative in those docs.
> **Decision Log ID:** DL-002
> **Archived:** 2026-05-18
> **Owner:** BA (G. Ehrenberg)

---

# FSM Asset Architecture

Architecture notes for Salesforce Field Service Management (FSM) asset modeling in the irrigation solution.

## Scope

This document captures the target architecture for:
- Property-centric asset cataloging
- Service contract coverage for irrigation assets
- Work order and service appointment execution
- Integration touchpoints with the ExtraWork estimating app

## Decision: Maintenance Plans — Not In Scope

**Decision:** Maintenance Plans will not be used.

**Reason:** Work Order generation is already handled by an existing process. The primary value of the FSM Maintenance Plan object is auto-generating Work Orders on a schedule — since that capability already exists, Maintenance Plans add no value and would introduce redundant configuration.

**Clarification:** Native Field Service data-model diagrams still reference `Maintenance Plan`, `Maintenance Asset`, and `Maintenance Work Rule` because they describe the broader FSM object graph. We are keeping them out of the solution design, but they remain useful as reference when interpreting mobile screenshots and relationship diagrams.

**Research retained in:** [fsm_asset_research.md](fsm_asset_research.md) and the `.mmd` / `.md` diagram files for reference.

---

## Target Architecture

### Core Object Chain

```
Account (Property)
└── Service Contract (agreement terms + coverage)
    └── Contract Line Item (per-asset or per-service coverage)
Asset (Irrigation Component)
└── Work Order (planned or reactive job, linked to Asset + Account)
    └── Work Order Line Item (task/parts line, linked to Asset)
    └── Service Appointment (scheduled visit; parent can be WO, WOLI, or Asset)
```

### Object Roles

| Object | Role in Irrigation Solution |
|---|---|
| Account | Property — single source of truth for the site |
| Asset | Individual irrigation component (Backflow, Controller, Zone, Valve, Head, Drip) |
| Service Contract | Property-level agreement defining covered services and term |
| Contract Line Item | Coverage detail rows — optionally per asset, product, or service category |
| Work Order | Execution record for any planned or reactive irrigation job; linked to Asset |
| Work Order Line Item | Task or parts line within a WO; also linked to Asset |
| Service Appointment | Scheduled field visit; parent is polymorphic (`ParentRecordId`) and can be WO, WOLI, Asset, Account, Lead, or Opportunity |
| Work Type | Template applied to WO/SA — defines duration, skills, task standard |

### Work Type Strategy

Recommended initial Work Type catalog:

- `Irrigation - Seasonal Startup`
- `Irrigation - Mid-Season Inspection`
- `Irrigation - Winterization`
- `Irrigation - Backflow Test`
- `Irrigation - Controller Program Audit`
- `Irrigation - Drip System Flush`
- `Irrigation - Reactive Repair`

### Work Order Line Item — Extended Schema

Standard WOLI fields (native):

| Field | Type | Notes |
|---|---|---|
| `Subject` | Text | Task or part description |
| `AssetId` | Lookup → Asset | Which component this line targets |
| `WorkOrderId` | Lookup → Work Order | Parent WO |
| `ServiceAppointmentId` | Lookup → Service Appointment | SA this line is tied to |
| `Quantity` | Number | Units of labor or parts |
| `UnitPrice` | Currency | From Price Book |
| `Status` | Picklist | New / In Progress / Completed / Canceled |
| `Description` | Long Text | General notes |

Custom fields added for Repair Callout tracking (decisions from irrigationcheckups_analysis.md):

| Field API Name | Type | Values / Notes |
|---|---|---|
| `Issue_Type__c` | Picklist | Broken Head / Valve Fault / Controller Issue / Leak / Low Pressure / Overwatering / Clog / Other |
| `Callout_Status__c` | Picklist | New / Quoted / Approved / Completed |
| `Callout_Notes__c` | Long Text Area | Tech voice/text notes captured in the field |
| `Callout_Photo__c` | Text (URL) | Reference to Files attachment; or use native Files on WOLI |
| `ExtraWork_Estimate_Line_Ref__c` | Text | Reference ID to linked ExtraWork estimate line item |

> **Usage:** During a checkup Service Appointment, the field tech captures findings and callout outputs on the inspection record. WOLI linkage, when needed for execution tracking, is handled by downstream work management and not auto-created per issue.

---

### Estimating Boundary

- All repair estimates handled by the ExtraWork custom app.
- ExtraWork receives Work Order and Asset context from FSM.
- Customer approval status writes back to Work Order fields.
- Line item detail may optionally sync back to Work Order Line Items for reporting.

### Service Plan View on Asset

Expose these related signals on the Asset record page:

- Active Service Contract and coverage term
- Last completed planned service date
- Upcoming Service Appointment
- Full Work Order history (planned and reactive)
- Planned vs reactive WO count (rolling 12 months)

### Implementation Notes

- `Asset` is the system of record for all irrigation components.
- Use Files on Account and Asset for as-built maps, site maps, and photos (versioned).
- Price Book/Product setup is partial — start with labor-first line items, phase in full parts pricing.
- Damage outside a WO: Case for intake + `Asset_Damage_Event__c` custom object for structured tracking.

### Field Service Mobile Behavior: Asset vs WOLI Placement

Observed behavior from discovery and Salesforce object docs supports your finding that Asset can appear as a separate item above Work Order Line Items in mobile, but the exact visual order is still a page-layout / mobile-card configuration concern.

What is confirmed:

- `WorkOrder.AssetId` exists as a native lookup, so Asset is first-class context on the WO record.
- `WorkOrderLineItem.AssetId` exists as a native lookup and is explicitly **not automatically inherited** from the parent Work Order.
- `ServiceAppointment` is linked by `ParentRecordId` (polymorphic) and can parent to `WorkOrder`, `WorkOrderLineItem`, `Asset`, `Account`, `Lead`, or `Opportunity`.

Why Asset appears as its own item above WOLIs in mobile:

- On mobile record pages, lookup context fields/cards (for example the work context Asset) typically render in the record detail/header zone.
- WOLIs are a child collection and render as a related list/child section.
- This naturally creates a visual hierarchy where a single Asset context appears above a list of WOLIs.

What the diagrams add:

- In the core Field Service object model, `ServiceAppointment` is the central scheduling record and `ParentRecordId` is the actual link that controls which business record owns the appointment.
- `Asset` is a separate first-class object under `Account`, and `WorkOrder` / `WorkOrderLineItem` each have their own `AssetId`.
- The maintenance model introduces `Maintenance Plan` / `Maintenance Asset`, but that is orthogonal to our chosen implementation and mainly explains some native FSM diagrams.

Design implication for irrigation:

- Treat Asset as the working context anchor.
- Treat WOLIs as scoped task/callout rows under that context.
- Always set `WOLI.AssetId` intentionally; do not rely on WO asset defaults.

Validation checklist in sandbox (recommended):

1. Build one `WorkOrder` with `AssetId = A1`.
2. Add two `WorkOrderLineItem` records, one with `AssetId = A1`, one with `AssetId = A2`.
3. Open the assigned `ServiceAppointment` in Field Service Mobile.
4. Confirm Asset context placement vs WOLI related list placement.
5. Confirm each WOLI keeps its own asset linkage independent of WO asset.
6. Confirm the service appointment parent record is the intended record type (`WorkOrder` vs `WorkOrderLineItem` vs `Asset`) before drawing any UI conclusions.

Execution runbook:

- [Mobile prototype notes and walkthrough](../prototype/mobile/notes.md)

Source evidence:

- Salesforce Object Reference — Work Order: `AssetId` field
  https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_workorder.htm
- Salesforce Object Reference — Work Order Line Item: `AssetId` exists and is not auto-inherited
  https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_workorderlineitem.htm
- Salesforce Object Reference — Service Appointment: `ParentRecordId` polymorphic parent (`...WorkOrder, WorkOrderLineItem, Asset...`)
  https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_serviceappointment.htm
- Field Service Core Data Model (parent/child behavior for WO, WOLI, SA)
  https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap_core.htm

### Risks and Mitigations

- Risk: Asset hierarchy inconsistency reduces reporting quality.
  Mitigation: Enforce record-type-specific validation rules and required parent fields.
- Risk: Gaps between ExtraWork estimate approval status and FSM WO execution status.
  Mitigation: Define explicit status field mapping and assign clear integration ownership.
- Risk: Work Order not linked to Asset at creation.
  Mitigation: Validation rule or required field on WO for irrigation work types.

### Source Links

- https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap_core.htm
- https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_soap_pricing.htm
- https://developer.salesforce.com/docs/atlas.en-us.260.0.object_reference.meta/object_reference/sforce_api_objects_asset.htm

