# Spatial Mapping Options — Within-Property Irrigation Component Visualization

Exploration of options for mapping irrigation system components at the yard/property level inside Salesforce.

## Problem Statement

Salesforce Maps resolves property-to-property routing and territory visibility but cannot map components within a property. Technicians and admins need a way to see where each irrigation component (zone valve, head, backflow, controller) is physically located on the property — both for audit purposes and to guide techs during service visits.

---

## Option 1: Custom LWC with Background Image + Pin Overlay

### Concept

Upload a site photo, as-built drawing, or aerial image as a File on the Account. A custom Lightning Web Component (LWC) renders that image as a canvas and allows users to place, move, and label pins tied to Asset records.

### How It Works

1. Admin or tech uploads a property image (aerial photo, hand-drawn map, PDF-converted image) as a File on the Account.
2. The LWC loads that image as the background.
3. Users click on the image to place a pin at a component location.
4. Each pin is linked to an Asset record — clicking the pin opens the Asset detail or a quick-action popup.
5. Pin coordinates are stored as X/Y percentage offsets on a custom object (e.g., `Asset_Map_Pin__c`) so they scale proportionally if the image size changes.

### Data Model

| Object | Purpose |
|---|---|
| `Asset_Map_Pin__c` | Stores pin position and Asset reference |
| `Asset_Map_Pin__c.Asset__c` | Lookup → Asset |
| `Asset_Map_Pin__c.Account__c` | Lookup → Account (property) |
| `Asset_Map_Pin__c.Image_File_Id__c` | Reference to the ContentDocument used as background |
| `Asset_Map_Pin__c.X_Position__c` | Number — X offset as % of image width |
| `Asset_Map_Pin__c.Y_Position__c` | Number — Y offset as % of image height |
| `Asset_Map_Pin__c.Pin_Label__c` | Text — display label on pin |

### Pros

- Fully native to Salesforce — no external license or dependency
- Works with any image format (aerial photo, hand-drawn sketch, imported PDF page)
- Pins are directly linked to Asset records — click-through to repair history, work orders, status
- Can be embedded on the Account record page as a tab or component
- Offline-capable in FSM Mobile app (with some LWC configuration)

### Cons

- Requires LWC development effort (estimated: medium complexity)
- Image is static — not a live map tile, no zoom/satellite toggle
- If property layout changes, image must be reuploaded and pins may need adjustment
- Not geospatially precise — coordinate system is image-relative, not lat/long

### Fit for Irrigation

**High fit for MVP+.** The aerial photo of a property is usually sufficient to communicate where a valve box or backflow is located. This is a practical, low-dependency approach that keeps everything inside Salesforce and linked to Asset records.

---

## Option 2: External GIS Tool Embedded via LWC

### Concept

Embed a live map tile (Google Maps, ArcGIS, Mapbox) inside a Salesforce LWC using an iFrame or JavaScript API. Components are plotted as georeferenced markers using lat/long coordinates stored on each Asset record.

### Sub-Options

#### 2a. Google Maps JavaScript API

- Embed a Google Maps satellite or hybrid tile view inside an LWC
- Plot Asset records as custom markers using their `Latitude` / `Longitude` fields
- Clicking a marker opens a popup with Asset details or navigates to the record
- Requires a Google Maps API key (paid beyond free tier usage)

#### 2b. ArcGIS Maps SDK for JavaScript

- Enterprise-grade GIS platform with full spatial analysis capabilities
- Supports custom layers, drawing tools, feature services, and offline maps
- Can store irrigation system geometry (zones as polygons, pipes as lines) as GIS features
- Esri has a Salesforce connector for bidirectional data sync
- Requires ArcGIS Online or ArcGIS Enterprise license

#### 2c. Mapbox GL JS

- Lighter alternative to ArcGIS with strong custom styling
- Supports custom marker layers, vector tiles, drawing tools
- Embedded via LWC iFrame or JS API
- Pay-per-use pricing model

### Data Requirements

All three options require lat/long coordinates on each Asset record. The `Asset` object has native `Latitude` and `Longitude` fields. Coordinates would need to be captured either:
- Manually entered by the technician during initial audit
- Captured via the FSM Mobile app GPS at time of component documentation
- Derived from a georeferencing workflow if an existing as-built is imported

### Pros

- Live satellite imagery — no static image upload needed
- Geospatially precise — coordinates are real-world lat/long
- Zoom, pan, satellite/terrain toggle
- ArcGIS option supports polygon zones, pipe routing, and full GIS analysis
- Future-proof for multi-property spatial analysis and water usage reporting

### Cons

- External API dependency and ongoing license/usage cost
- Requires lat/long on every Asset — data entry burden during initial audit
- More development complexity than Option 1
- ArcGIS is significant investment — overkill for a single-contractor irrigation operation without GIS team
- Google Maps API key management adds a security surface (key must be scoped and restricted)

### Fit for Irrigation

**Medium fit — strong future-state, lower priority for MVP.** The value increases significantly if the business grows to multi-property portfolio management, water usage auditing, or regulatory compliance reporting. For a single property visit the aerial photo + pin model (Option 1) is sufficient and far simpler to build and maintain.

---

## Recommendation

| Phase | Approach |
|---|---|
| MVP | Files on Account for as-built PDFs and site photos. No interactive pinning yet. |
| Phase 2 | Custom LWC (Option 1) — background image + Asset pin overlay. Medium dev effort, high value for field audits. |
| Future / Scale | Google Maps API embedded LWC (Option 2a) if lat/long coordinates are captured during field audits and multi-property spatial reporting becomes a need. ArcGIS only if GIS capability becomes a strategic investment. |

---

## Open Questions

- [x] Is lat/long capture feasible during the initial asset audit phase using FSM Mobile GPS? **→ Yes — GPS capture will be built at launch. Custom LWC screen flow writes device GPS to Asset Latitude/Longitude fields during field audit. (Decided in irrigationcheckups_analysis.md)**
- [ ] Does the org have an existing Google Maps API key or ArcGIS license?
- [ ] What is the primary user for the within-property map — office admin, dispatcher, or field tech?
- [ ] Does the LWC need to work offline in the FSM Mobile app?
