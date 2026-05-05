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
    └── Service Appointment (scheduled visit)
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
| Service Appointment | Scheduled field visit; parent is WO or WOLI |
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
| `Issue_Type__c` | Picklist | Broken Head / Valve Fault / Controller Issue / Leak / Low Pressure / Overspray / Clog / Other |
| `Callout_Status__c` | Picklist | New / Quoted / Approved / Completed |
| `Callout_Notes__c` | Long Text Area | Tech voice/text notes captured in the field |
| `Callout_Photo__c` | Text (URL) | Reference to Files attachment; or use native Files on WOLI |
| `ExtraWork_Estimate_Line_Ref__c` | Text | Reference ID to linked ExtraWork estimate line item |

> **Usage:** During a checkup Service Appointment, the field tech creates WOLI records per issue found. Each WOLI starts at `Callout_Status__c = New`. When the ExtraWork estimate is built, the relevant WOLI records are updated with the estimate line reference and status advances to `Quoted`. Customer approval triggers advancement to `Approved`, completion of work advances to `Completed`.

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
