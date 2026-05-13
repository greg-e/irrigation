# Salesforce FSM Capability Validation

Validation matrix for the irrigation inspection workflow against actual Salesforce Field Service capabilities. Goal: identify before build any required capability that FSM cannot deliver natively, and call out the development effort for the rest.

**Date:** May 7, 2026
**Source platform:** Salesforce Field Service (FSM) managed package + FSM Mobile (iOS/Android)
**Release referenced:** Spring '26 (API v66.0)

---

## Confidence Legend

| Symbol | Meaning |
|---|---|
| ✅ | Native capability — fully supported, low effort |
| 🟢 | Supported via standard configuration — low effort |
| 🟡 | Supported via custom development (Apex / LWC / Flow) — medium effort |
| 🟠 | Supported with caveats / limits — design must work within them |
| 🔴 | Not natively supported — requires workaround or third-party |
| ❓ | Unverified — needs hands-on validation in the actual org |

---

## 1. Data Model Capabilities

| # | Requirement | FSM Capability | Effort | Notes |
|---|---|---|---|---|
| 1.1 | Custom fields on `ServiceAppointment` (~40 inspection-header fields) | ✅ Native | Low | SA supports unlimited custom fields per standard org limits (500 custom fields per object). Our header count is well within bounds. |
| 1.2 | Custom child object (`Inspection_Response__c`) with master-detail to SA | 🟢 Standard | Low | Master-detail to standard objects (including SA) is supported. Cascade delete works as expected. |
| 1.3 | Custom field `Source_Inspection_Response__c` (Lookup) on `WorkOrderLineItem` | 🟢 Standard | Low | WOLI accepts custom lookup fields. |
| 1.4 | Custom child object (`Irrigation_Program__c`) with Lookup to Asset and SA | 🟢 Standard | Low | |
| 1.5 | Custom reference object (`Inspection_Question__c`) — question library | 🟢 Standard | Low | Pure metadata table; no FSM-specific concerns. |
| 1.6 | Asset hierarchy (Account → Controller → Zone → Head) | ✅ Native | Low | `ParentId` supports up to 10,000-asset hierarchy. Source: [Asset object reference](https://developer.salesforce.com/docs/atlas.en-us.260.0.object_reference.meta/object_reference/sforce_api_objects_asset.htm). |
| 1.7 | Asset lookup on Work Order and WOLI | ✅ Native | Low | Both objects have native `AssetId`. Source: [research/fsm_asset_research.md](../research/fsm_asset_research.md). |
| 1.8 | File attachments (`ContentDocumentLink`) on SA, WOLI, Asset, custom objects | ✅ Native | Low | Salesforce Files works on any object. |

---

## 2. Inspection Form UX (FSM Mobile)

| # | Requirement | FSM Capability | Effort | Notes |
|---|---|---|---|---|
| 2.1 | Render a multi-section inspection form on FSM Mobile | 🟡 Custom LWC | Medium-High | FSM Mobile supports LWC plug-ins as Quick Actions on Service Appointment. Source: [FSM Mobile LWC guide](https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_mobile_lwc.htm). The form itself must be built as an LWC. **Not a native "form builder."** |
| 2.2 | Dynamic form content based on Work Type / question set | 🟡 Custom LWC | Medium | LWC reads `Inspection_Question_Set__c` records keyed to Work Type and renders the matching questions. Standard Salesforce Dynamic Forms applies to Lightning record pages, not FSM Mobile screens. |
| 2.3 | Branching / conditional questions ("if Yes, ask…") | 🟡 Custom LWC | Medium | Built into the LWC by reading `Branching_Parent__c` / `Branching_Trigger_Value__c` from the question library. |
| 2.4 | Photo capture per question / per zone | ✅ Native | Low | FSM Mobile camera integration is native. LWC can attach photos to any record via Salesforce Files. |
| 2.5 | GPS auto-capture at check-in | ✅ Native (LocationService) | Low | `LocationService` plug-in gives device GPS to LWC. Source: [Use Location on a Mobile Device](https://developer.salesforce.com/docs/atlas.en-us.260.0.mobile_offline.meta/mobile_offline/use_locationservice.htm). |
| 2.6 | Voice-to-text on notes | 🟢 Native (OS-level) | Low | iOS/Android keyboards provide voice dictation directly into any text field. No FSM-specific implementation needed. |
| 2.7 | Barcode/QR scan (e.g., to identify a controller) | ✅ Native plug-in | Low | `BarcodeScanner` LWC plug-in available. Source: [Scan Barcodes on a Mobile Device](https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_mobile_lwc_barcode_scanner.htm). |
| 2.8 | Document scan (e.g., backflow test certificate) | ✅ Native plug-in | Low | `DocumentScanner` LWC plug-in. |
| 2.9 | Per-zone grid editing UX (32-row table like James's report) | 🟡 Custom LWC | Medium | No native data-grid component for mobile. Must be custom-built. Mobile screen size makes this nontrivial — consider per-zone "card" pattern instead of a wide table. **Design risk.** |

---

## 3. Offline / Sync

| # | Requirement | FSM Capability | Effort | Notes |
|---|---|---|---|---|
| 3.1 | Tech can complete inspection in low/no signal | ✅ Native | Low | FSM Mobile is offline-first. Records cache locally and sync when online. |
| 3.2 | Custom objects (`Inspection_Response__c`, `Irrigation_Program__c`) sync offline | ✅ Native | Low | FSM Mobile syncs any object included in the **mobile profile**. Custom objects are supported. Configuration step: add to FSM mobile profile + offline priming object list. |
| 3.3 | Photos taken offline upload when online | ✅ Native | Low | Files queue locally and upload on reconnect. |
| 3.4 | LWC plug-ins work offline | 🟢 Standard | Low | LWC plug-ins are designed to be offline-capable. Source: [FSM Mobile LWC guide](https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_mobile_lwc.htm). LWC must be authored to use offline-friendly APIs (`@wire` with cached adapters or local SQLite via `@salesforce/mobile-offline`). |
| 3.5 | Conflict resolution when 2 users edit same record offline | 🟠 Caveat | — | Salesforce uses last-write-wins by default. Inspection responses are essentially append-only post-checkout, so conflict risk is low. Validation rule prevents post-completion edits. |
| 3.6 | MVP within-property map delivered via custom Mapbox LWC component | 🟡 Custom LWC | Medium | Mapbox GL JS is embedded in custom LWC for desktop/mobile contexts and renders Salesforce-hosted GeoJSON from `Map_Feature__c`. |
| 3.7 | Map usability in no-signal scenarios | 🟠 Caveat | Medium | Map rendering depends on tile availability and cache strategy. Keep inspection writes and GPS capture as offline-safe baseline; map writes queue and sync when online. |

---

## 4. Workflow Logic / Automation

| # | Requirement | FSM Capability | Effort | Notes |
|---|---|---|---|---|
| 4.1 | Programmatic WOLI creation from a flow/LWC mid-appointment (Pattern C "Suggested Repairs") | ✅ Native | Low | Standard Apex / Flow create. WOLI is just a record. |
| 4.2 | Auto-PDF generation on SA completion (internal + customer PDFs) | 🟡 Custom | Medium | Salesforce does NOT have a native "render record as PDF" button anymore (Visualforce-renderAs is deprecated for new dev). Options: (a) Apex + `getContentAsPDF()` on a Visualforce page (still supported); (b) third-party like Conga / DocGen / Documind; (c) Salesforce **Doc Gen** (formerly Apex API for OmniStudio templates) — license required. **Decision needed: build vs buy.** |
| 4.3 | E-mail PDF to branch leadership on completion | ✅ Native | Low | Standard Email Alert from Flow with attachment. |
| 4.4 | Update Asset status to "Needs Repair" when WOLI callout created | ✅ Native | Low | Record-Triggered Flow on WOLI. Already designed in [research/automation_flows_design.md](../research/automation_flows_design.md). |
| 4.5 | Validation rules (Q6.7 "No issues found" XOR all failure-mode checkboxes) | ✅ Native | Low | Standard validation rules. |
| 4.6 | Service Appointment status auto-set to "In Progress" on check-in | ✅ Native | Low | FSM has standard check-in actions that update SA status. |

---

## 5. Scheduling / Dispatch

| # | Requirement | FSM Capability | Effort | Notes |
|---|---|---|---|---|
| 5.1 | Dispatch Console filtering by Work Type (irrigation) | ✅ Native | Low | Confirmed in transcript (Rohit demoed live). |
| 5.2 | Filtering by resource skill (irrigation) | ✅ Native | Low | Confirmed in transcript. |
| 5.3 | Service Resources include OM/EM/AM (not just crews) | ✅ Native | Low | `ServiceResource` supports User-based resources, named resources, and crews. Setting AM/OM/EM as service resources is a config decision, not a platform limitation. |
| 5.4 | Manual assignment for emergency work | ✅ Native | Low | Standard dispatcher workflow. |
| 5.5 | Automated optimizer scheduling for planned work | ✅ Native | Low | Field Service Scheduling Optimization (FSSO) handles this. Already in scope for Phase 1. |
| 5.6 | Preferred/required resource on Service Contract for continuity | ✅ Native | Low | `ServiceCrew` + `ServiceResourcePreference` objects support this. Greg's ask in the transcript. |
| 5.7 | Irrigation Manager dashboard (capacity by day) | 🟢 Standard | Low | Resource Absence + Service Appointment data → Power BI report. Not in FSM directly but trivially derivable. |

---

## 6. Integration Points

| # | Requirement | FSM Capability | Effort | Notes |
|---|---|---|---|---|
| 6.1 | Oracle CPQ → Service Contract → Work Order | ✅ Phase 1 | — | Already built. |
| 6.2 | ExtraWork → Sales Order → Work Order | ✅ Phase 1 | — | Already built. |
| 6.3 | Emergency WO created in SF, then matched to ExtraWork SO after the fact | 🟡 Custom flow | Medium | Requires reverse-link logic so the integration doesn't generate a duplicate WO. Designed at conceptual level in process review; needs Flow/Apex. |
| 6.4 | BV Connect rendering of customer PDF | ❓ | — | Depends on BV Connect platform capability — not a Salesforce platform question. **Owner:** BV Connect product team. |
| 6.5 | BV Connect — bundle inspection PDF into existing Service Confirmation email | ❓ | Medium | Same — depends on BV Connect's email composition/templating. |
| 6.6 | Power BI export of all custom objects via data warehouse | ✅ Native | Low | Confirmed in transcripts. Standard nightly extract. |

---

## 7. Out-of-the-Box Alternative: Salesforce Assessments

Status: evaluated and not selected for this project. The team has locked on a custom-object question library path.

Worth a serious look as an alternative to building `Inspection_Question__c` / `Inspection_Response__c` from scratch. Salesforce ships standard objects that match this pattern:

| Standard Object | Maps To Our Concept |
|---|---|
| `AssessmentTaskDefinition` | Question Set (form variant) |
| `AssessmentIndicatorDefinition` | Question (with response type, validation) |
| `AssessmentTask` | An instance of the form for one parent record (e.g., one SA) |
| `AssessmentTaskIndicator` | An individual question response |
| `AssessmentResponse` | The captured answer (boolean / number / text / picklist) |

### Pros of using Assessments
- Zero custom-object build for the question library
- Versioning is built in via Definition vs Instance separation
- Standard reporting works out of the box
- Salesforce continues to invest in this area (used by Industries clouds, Net Zero Cloud, etc.)

### Cons / risks
- **License gating** — Assessment objects historically required Industries Cloud / Net Zero / Public Sector / Health Cloud. Need to verify whether they're available in a base FSM org. **Critical to validate.**
- LWC for rendering assessment responses on FSM Mobile may need to be custom (no native FSM Mobile assessment renderer)
- Less common in the FSM-only ecosystem; fewer reference implementations

### Recommendation
Do not pursue the Assessments path for Phase 2. Continue with the custom-object design in [requirements/inspection_form_data_model.md](inspection_form_data_model.md): `Inspection_Question__c`, `Inspection_Question_Set__c`, `Inspection_Response__c`, and related versioning/variant governance.

---

## 8. Summary — Build vs Configure vs Risk

| Bucket | Items | Notes |
|---|---|---|
| **Native / standard config** | Object hierarchy, custom fields, validation rules, files, GPS, barcode/scan, dispatch filtering, automated scheduling, offline sync, asset history, Flow automation, email alerts | Low effort. ~70% of the workflow. |
| **Custom LWC required** | Inspection form UI, per-zone editing UX, dynamic question rendering, branching logic, "Suggested Repairs" review screen, GPS-on-checkin LWC | Medium-High effort. The bulk of phase 2 dev. |
| **Build-vs-buy decision** | PDF generation (internal + customer-facing) | Pick one: Apex + Visualforce `renderAs="pdf"`; AppExchange tool (Conga, DocGen Pro, Titan); Salesforce DocGen (license-gated). |
| **Open dependencies** | BV Connect rendering, BV Connect email bundling | Owned outside Salesforce platform — needs BV Connect product confirmation. |
| **License validations** | Salesforce Assessment objects availability in this org's edition | Must verify with Salesforce account team before committing to Assessments path. |
| **Design risk** | Per-zone grid UX on mobile (32 rows × 18 columns) | Mobile screen forces per-zone "card" pattern. Design + UX prototype recommended before build. |

---

## 9. Items That Should Trigger a Hands-On Spike Before Build

These are the items where the docs say "yes" but production behavior on a live org has historically had gotchas. Recommend a 1–2 day spike on each:

1. **FSM Mobile LWC offline + custom object writes.** Verify that an LWC can create `Inspection_Response__c` records offline and they sync correctly on reconnect.
2. **PDF generation path.** Build a thin proof-of-concept PDF for one completed SA using the chosen method. Validate file size, attachment behavior, email delivery.
3. **Assessment objects availability** in the org's existing license stack.
4. **Salesforce Files on `Inspection_Response__c`** — confirm `ContentDocumentLink` works on a master-detail child object as expected for offline sync.
5. **Dispatch Console performance with AM/OM/EM as service resources** at scale — does the optimizer handle non-crew resources cleanly when they have partial availability?
6. **Take Two + Inspection Form coexistence on check-in.** Both are LWC quick actions. Confirm they don't conflict and the flow ordering is configurable.

---

## 10. Discovery Gap — Northeast Region

The Phase 2 discovery sessions did **not** include representation from the Northeast region. The NE uses **IrrigationCheckups.com** as their production tool. This is a separate dimension from FSM platform capability — it's about whether the workflow we've designed matches NE's actual process and whether the LWC UX will meet the adoption bar set by their incumbent tool. See [requirements/northeast_discovery_plan.md](northeast_discovery_plan.md) for the discovery interview guide and action plan.

Key FSM-capability implications if NE workflow differs materially:

| If NE workflow is… | Capability impact |
|---|---|
| Inline quote-build during inspection (not end-of-visit review) | May require redesign of Pattern C "Suggested Repairs" UX (Section 4.1) — still feasible, just different LWC flow |
| Heavy use of geo-tagged site map | Increases priority on `LocationService` LWC + spatial mapping work in [research/spatial_mapping_options.md](../research/spatial_mapping_options.md) |
| State-specific backflow compliance forms (MA, CT, NY, NJ) | More Question Set variants, possibly state-conditional rendering in the inspection LWC |
| Required conservation-audit functionality | Pulls water-savings calc back into scope (currently out of scope) |

**No items in this validation matrix are expected to flip from green to red based on NE input** — they would shift the *scope and priority* of the LWC build, not the underlying platform feasibility.

---

## 11. Recommendation

**The workflow is supported by Salesforce FSM at the platform level.** The model in [requirements/inspection_form_data_model.md](inspection_form_data_model.md) is achievable, but the build is **LWC-heavy** rather than configuration-heavy. Phase 2 effort is dominated by:

1. The Inspection Form LWC (custom, multi-screen, mobile-optimized)
2. The "Suggested Repairs" Review Screen LWC (Pattern C from the WOLI discussion)
3. PDF generation pipeline
4. Question library admin UX

Decision alignment update (May 2026):

1. Mapbox GL JS in a custom LWC is the MVP mapping path for within-property irrigation visualization.
2. Custom LWC includes both inspection runtime and map experiences (desktop/mobile).
3. Mapbox offline tile/cache behavior must be validated with a dedicated spike before release.

Before locking the build plan, prioritize the spikes in Section 9 — especially **PDF generation path**.

---

## Sources

- Salesforce Field Service Developer Guide (Spring '26 / API v66.0): https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_introduction.htm
- FSM Mobile LWC Plug-Ins: https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/fsl_dev_mobile_lwc.htm
- Salesforce Mobile and Offline Developer Guide — LocationService: https://developer.salesforce.com/docs/atlas.en-us.260.0.mobile_offline.meta/mobile_offline/use_locationservice.htm
- Asset Object Reference: https://developer.salesforce.com/docs/atlas.en-us.260.0.object_reference.meta/object_reference/sforce_api_objects_asset.htm
- Discovery transcripts: [discovery/FSM_-_Phase_2_-_Irrigation_Discovery.extracted.txt](../discovery/FSM_-_Phase_2_-_Irrigation_Discovery.extracted.txt), [discovery/FSM_-_Phase_2_-_Irrigation_Process_Review.extracted.txt](../discovery/FSM_-_Phase_2_-_Irrigation_Process_Review.extracted.txt)
- Internal research: [research/fsm_asset_architecture.md](../research/fsm_asset_architecture.md), [research/fsm_asset_research.md](../research/fsm_asset_research.md)
