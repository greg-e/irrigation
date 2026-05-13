# ArcGIS Maps for Salesforce — Native GIS Research

Status: **SUPERSEDED — May 2026**
Date: 2026-05-12

> **⚠️ SUPERSEDED — May 2026**
> ArcGIS has been **dropped from the MVP architecture**. Client confirmed no existing ArcGIS Online org. The Esri path requires a net-new license, a second admin platform, and ArcGIS Field Maps for offline mobile support — complexity not justified for within-property residential irrigation mapping at this scale.
> **Selected path: Mapbox GL JS in a custom LWC.** See `research/spatial_mapping_options.md` for the current recommendation.
> This document is retained for reference if the client later acquires an ArcGIS Online org.

---

## Original Decision (Superseded)

1. ~~ArcGIS Maps for Salesforce is required in MVP based on business need.~~ — **Reversed**
2. Primary user: Irrigation Manager. Secondary users: Account Manager and Field Tech. — still current
3. ~~Native ArcGIS Lightning component is the default map delivery path.~~ — **Reversed; custom LWC with Mapbox GL JS is the path**

## What Changed

The original mapping assessment in `spatial_mapping_options.md` evaluated ArcGIS integration as a **future-state, medium-fit option** because it required custom LWC development, external API key management, and significant GIS investment. That analysis was based on the pre-GA state of the Esri–Salesforce integration.

**ArcGIS Maps for Salesforce went GA in September 2024.** It is now a Salesforce-supported managed package (AppExchange) with native Lightning components, no custom LWC required. This materially changes the cost-benefit calculus and re-opens the native map discussion for both desktop and mobile in this project.

---

## What ArcGIS Maps for Salesforce Is

ArcGIS Maps for Salesforce is a managed package from Esri, installable from AppExchange, that embeds ArcGIS Online map capabilities directly into Salesforce Lightning Experience. It is not a custom code integration — it delivers a native **Map Lightning Component** that admins drag and drop into Lightning App Builder like any standard component.

### Key Capabilities (GA Feature Set)

| Capability | Detail |
|---|---|
| Native Lightning Component | Drag-and-drop in Lightning App Builder — no LWC development for basic map embedding |
| Record Plotting | Plots Salesforce records as map pins using Latitude/Longitude fields on any object |
| Basemap Support | Satellite imagery, topographic, streets, and custom Esri basemaps |
| Feature Layers | Custom point, line, and polygon layers stored in ArcGIS Online — can represent irrigation system geometry |
| Drawing Tools | Users can draw points, lines, and polygons on the map; geometry can be saved back |
| Map-to-Record Linkage | Map features can be related to Salesforce records (Account, Asset, Work Order, etc.) |
| Filtering + Spatial Queries | Filter map content by Salesforce record context (e.g., show only assets for the current Account) |
| Mobile Support | Map component renders in Salesforce Mobile App; compatible with FSM Mobile app |
| Offline Support | Offline map capability via ArcGIS Field Maps integration; requires additional Esri config |
| Access Control | Inherits Salesforce profiles/permission sets for who can view vs. edit map layers |

### License Model

- Requires ArcGIS Online (organizational account) or ArcGIS Location Platform subscription from Esri
- The Salesforce–Esri partnership (formalized 2019, expanded 2023–2024) includes bundled access options when both platforms are licensed
- Exact pricing depends on Esri negotiation — not publicly listed
- Named user model on the Esri side; Salesforce user access controlled via permission sets
- **Open question:** Does the client have or intend to pursue an ArcGIS Online org? This is the key gate.

---

## Why This Matters for the Irrigation Project

The project has two distinct mapping needs that were previously addressed with placeholder approaches:

1. **Desktop — System Creation:** Office admin or field supervisor maps a new irrigation system layout when a property is onboarded
2. **Mobile — System Evaluation:** Field tech views and updates the system map during an inspection or service visit

Native GIS via ArcGIS Maps for Salesforce can now serve both without custom LWC development.

---

## Use Case 1: Desktop — System Creation (Account Record Page)

### Scenario

When a new property is onboarded, the office user or a technician (post-first-visit) needs to document where each irrigation component is physically located on the property.

### Proposed Approach with Native GIS

Embed the ArcGIS Map Lightning Component on the **Account record page** as a dedicated "Irrigation System Map" tab.

1. A feature layer in ArcGIS Online is configured per property, linked to the Account record ID.
2. The admin or tech uses drawing tools directly in the map component to:
   - Drop a **point** for each component (valve box, controller, backflow, pump, sensor, head)
   - Draw a **polygon** for each irrigation zone (zone boundary)
   - Draw a **line** for any pipe routing or wire run documentation
3. Each drawn feature is linked to the corresponding Salesforce **Asset** record via a related field on the feature layer.
4. The map persists on the Account record, accessible to any user with the right permission set.

### What This Replaces

Replaces the proposed "Background image + pin overlay" custom LWC (Option 1 in `spatial_mapping_options.md`). Delivers more capability (real satellite basemap, actual geometry, spatial queries) at lower dev cost because no custom component build is needed.

### Data Alignment with Common Data Dictionary

Per `common_data_dictionary_esri_vs_fsm.md`, the Esri model carries native geometry on each feature class. The native GIS approach here is consistent with that architecture:
- ArcGIS Online becomes the **geometry authority** for irrigation system layouts
- Salesforce Asset records carry `Latitude` / `Longitude` as a summarized centroid reference
- Full geometry lives in the ArcGIS feature layer, related to Asset via `asset_uid` / Asset.Id mapping

### Dev Effort

| Task | Effort Estimate |
|---|---|
| Install ArcGIS Maps for Salesforce managed package | Low |
| Configure ArcGIS Online org + feature layers for irrigation components | Medium |
| Add Map component to Account Lightning page (App Builder) | Low |
| Configure component to filter features by current Account | Low |
| Map ArcGIS feature layer fields to Asset object (data dictionary alignment) | Medium |
| Total | Medium — no custom Apex or LWC required |

---

## Use Case 2: Mobile — System Evaluation / Inspection (FSM Mobile)

### Scenario

A field tech arrives at a property for an annual inspection or service call. They need to:
- See where all components are on the property
- Confirm location of components they're about to inspect
- Mark any component location changes (e.g., relocated valve box)
- Capture GPS coordinates for new or previously unmapped components

### Proposed Approach with Native GIS

Embed the ArcGIS Map Lightning Component on:
- The **Work Order** record page (tech context during active job)
- The **Service Appointment** mobile view (pre-visit review)

FSM Mobile renders Lightning components configured for phone form factor.

1. Tech opens the map tab on the Work Order — sees all Assets plotted for the property, color-coded by type and inspection status.
2. Tapping a pin opens the linked Asset record for context (last inspection date, condition, notes).
3. If a component has moved or a new one is added, tech drops a new pin or edits the existing feature geometry on mobile.
4. GPS capture: the mobile device's GPS feeds the map directly — no manual lat/long entry needed.
5. At end of visit, updated geometry syncs back to ArcGIS Online; Asset lat/long centroid fields update via flow or integration.

### Offline Consideration

FSM Mobile field visits often occur in areas with poor connectivity (residential back yards, rural properties). Native offline support for ArcGIS Maps for Salesforce requires **ArcGIS Field Maps** (a separate Esri mobile app) or pre-cached tile packages. The embedded map in FSM Mobile itself does not guarantee offline tile rendering without additional Esri configuration.

**Risk:** Partial connectivity degradation may affect map tile loading on mobile during active visits. Mitigation: pre-load property map data as a cached tile package for scheduled visits; fall back to GPS coordinate capture and sync.

---

## Impact on Original Mapping Recommendations

| Original Recommendation | Revised Assessment |
|---|---|
| MVP: Files on Account for PDFs and photos only | **Expanded** — retain files baseline and add ArcGIS native map component in MVP |
| Phase 2: Custom LWC background image + pin overlay | **Not primary** — use only as fallback/augmentation for offline-specific workflows |
| Future/Scale: Google Maps API embedded LWC | **Deprioritized** — if ArcGIS license is obtained, native integration is strictly better (no API key management, Salesforce-native permission model, Esri data model alignment) |
| ArcGIS: "overkill, future state only" | **Revised** — GA managed package removes the custom-code barrier; licensing is still the key gate, not dev complexity |

---

## Alignment with Esri Irrigation Data Model

The `common_data_dictionary_esri_vs_fsm.md` already identifies Esri's ArcGIS Solutions irrigation data model (`IrrigationSystemDM`) as the geometry authority. Using ArcGIS Maps for Salesforce natively is the direct implementation path for that architecture decision:

- Esri feature classes (Controller, Zone, Valve, Sprinkler, Pipe, Wire) become the geometric record
- Salesforce Asset records carry the operational record
- `asset_uid` / `asset_business_id` from the canonical dictionary become the join key between the two systems
- No separate sync tool needed if the map component directly surfaces ArcGIS features alongside Salesforce Asset context

### Common Data Dictionary Implementation Minimums (MVP)

To stay consistent with `requirements/common_data_dictionary_esri_vs_fsm.md`, MVP should enforce these minimum mappings:

1. `asset_uid` and `asset_business_id` are present and populated for map-linked assets.
2. `ArcGIS_Feature_Id__c` is populated on each mapped Asset to support deterministic traceability.
3. `Spatial_Source__c` and `Spatial_Confidence__c` use canonical domain values.
4. Asset `Latitude`/`Longitude` remains a summarized reference; full geometry remains in ArcGIS feature layers.
5. Data quality checks flag records missing join keys or spatial domain values.

---

## Open Questions

- [ ] Does the client have an existing ArcGIS Online organizational account, or is this a net-new Esri license?
- [ ] Is a combined Salesforce + Esri bundle available at current contract scale?
- [ ] Which Esri feature layer schema should be used — Esri's pre-built irrigation solution template (from ArcGIS Solutions) or a custom schema aligned to the canonical dictionary?
- [ ] Should the ArcGIS feature layer IDs be stored on the Salesforce Account record for direct URL-linking, or managed entirely through the map component context?
- [ ] What is the offline tile strategy for FSM Mobile — ArcGIS Field Maps hybrid, pre-cached tiles, or accept online-only?
- [ ] Who owns the ArcGIS Online org admin role — IT, operations, or the Salesforce team?

---

## Sources and References

- Existing mapping analysis: `research/spatial_mapping_options.md`
- Esri–Salesforce data model alignment: `requirements/common_data_dictionary_esri_vs_fsm.md`
- Asset architecture: `research/fsm_asset_architecture.md`
- ArcGIS Maps for Salesforce went GA: September 2024 (Esri announcement, Dreamforce 2024 adjacent)
- ArcGIS Solutions irrigation data model reference: https://doc.arcgis.com/en/arcgis-solutions/latest/reference/other/IrrigationSystemDM.html
- Confidence: High on feature capabilities and GA status; Medium on licensing specifics (Esri pricing not publicly listed)
