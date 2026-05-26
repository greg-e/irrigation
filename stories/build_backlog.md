# Irrigation Inspection Build Backlog

## Scope Baseline
This backlog reflects the locked design decisions documented in:
- requirements/inspection_form_data_model.md
- requirements/fsm_irrigation_requirements.md
- research/automation_flows_design.md
- requirements/diagrams/process_flow.mmd
- requirements/diagrams/data_model.mmd
- requirements/diagrams/inspection_sequence.mmd

## Delivery Assumptions
- Platform: Salesforce FSM + custom objects + Flow/Apex + mobile LWC.
- Question library uses custom objects (no Assessments path).
- Published questions and question sets are immutable.
- Runtime set resolution is deterministic: region + inspection type/season + work type.
- Checkout is blocked when required answers are incomplete.
- AM-owned pending callout handoff is required before ExtraWork estimate creation.
- Within-property mapping MVP stack is a decision gate between Mapbox GL JS and Google Maps JavaScript API.

## Priority Legend
- P0: Must-have for first production go-live
- P1: Should-have for early optimization wave
- P2: Nice-to-have or post-stabilization

---

## Epic E1: Question Library Governance and Versioning (P0)
Goal: Deliver immutable, versioned question governance with regional and seasonal deltas.

### Story E1-S1: Create core question library objects
As an admin, I need core library objects to define questions, sets, and memberships.

Acceptance criteria:
1. Custom objects exist for Question, Question Set, and Set Member.
2. Question supports response type, failed-value mapping, and branching metadata.
3. Question Set supports work type, inspection type/season, region, and publish status.
4. Set Member supports display order and required flag.
5. Objects are reportable.

### Story E1-S2: Enforce immutable publish model
As a library admin, I need published versions to be append-only.

Acceptance criteria:
1. Published Question records cannot be edited in protected fields.
2. Published Question Set records cannot change membership/order.
3. New version action creates successor records with incremented version.
4. Prior versions remain queryable and selectable for historical reads.

### Story E1-S3: Implement pinned base + delta model
As a solution owner, I need regional/seasonal variants to inherit from pinned base versions with explicit deltas.

Acceptance criteria:
1. Delta object exists with actions Add, Override, Remove.
2. Overrides are limited to membership/order and surface behavior fields.
3. Response type and branching structure are blocked from delta override.
4. Resolution service composes effective set from base version + deltas.

### Story E1-S4: Restrict publish authority
As an operations lead, I need only designated admins to publish.

Acceptance criteria:
1. Publish action is permission-gated to designated role/permission set.
2. Regional leads can create/update drafts but cannot publish.
3. Publish and unpublish events are audit logged with user and timestamp.

Dependencies: None

---

## Epic E2: Runtime Set Resolution and Snapshot Locking (P0)
Goal: Resolve exactly one published form at start and lock inspection to that snapshot.

### Story E2-S1: Build deterministic resolver
As the system, I must resolve one published set by region + inspection type/season + work type.

Acceptance criteria:
1. Resolver accepts SA context and returns exactly one published set + version.
2. Resolver supports effective-date boundaries.
3. If no match exists, resolver returns explicit error code and operator message.
4. If multiple matches exist, resolver returns explicit configuration-conflict error.

### Story E2-S2: Snapshot selection on inspection start
As a tech, I need the selected form version locked for in-flight consistency.

Acceptance criteria:
1. On inspection start, SA stores resolved set ID and version.
2. Re-opened inspection uses snapshot values, not fresh resolution.
3. Mid-inspection changes to work type/inspection type do not mutate active form.
4. Abandon-and-restart path can create a new snapshot when explicitly requested.

### Story E2-S3: Hard-fail messaging
As a dispatcher/admin, I need clear remediation guidance when set resolution fails.

Acceptance criteria:
1. No-match/multi-match errors block form launch.
2. Error panel includes reason, expected keys, and owner next steps.
3. Error events are logged for dashboard/reporting.

Dependencies: E1-S1, E1-S2, E1-S3

---

## Epic E3: Mobile Inspection Experience and Response Capture (P0)
Goal: Deliver mobile inspection UX with required-answer enforcement and per-question response storage.

### Story E3-S1: Render dynamic multi-section inspection form
As a tech, I need to complete the resolved inspection sections on mobile.

Acceptance criteria:
1. Form renders sections and ordered questions from effective composed set.
2. Required and conditional display behavior works as configured.
3. Asset-scoped questions bind to selected assets.
4. Draft progress persists offline.

### Story E3-S2: Persist responses with snapshots
As the system, I need durable and interpretable response records.

Acceptance criteria:
1. Each answer creates/updates a response record tied to SA and question.
2. Question text snapshot is captured on response.
3. Response-type field usage is validated (boolean/picklist/number/text).
4. Failed-value evaluation sets failed flag correctly.

### Story E3-S3: Block checkout on missing required answers
As a quality owner, I need complete required data before completion.

Acceptance criteria:
1. Checkout action validates all required responses.
2. Missing required items block checkout.
3. UI highlights unresolved required questions.
4. Validation is enforced server-side.

Dependencies: E2-S2

---

## Epic E4: Asset Bootstrap and Staged Asset Change Pipeline (P0)
Goal: Support inspections when asset inventory is incomplete using staged updates applied at completion.

### Story E4-S1: Detect missing required asset types and enter bootstrap mode
As a tech, I need guided bootstrap when required asset types are absent.

Acceptance criteria:
1. Required asset types are derived from resolved form + inspection type/season.
2. Missing types trigger bootstrap mode before asset-scoped sections open.
3. Bootstrap supports minimal required fields per asset type.
4. Placeholder zone creation is supported.

### Story E4-S2: Stage inline create/edit changes
As the system, I need staged pending changes with before/after values.

Acceptance criteria:
1. Pending asset change object stores one record per field change.
2. Records include SA, target asset (or create intent), field API name, before and after values.
3. Only whitelisted fields by asset type are editable.
4. Changes are editable until checkout submission.

### Story E4-S3: Apply staged changes on completion
As operations, I need staged changes committed at checkout completion.

Acceptance criteria:
1. Completion flow attempts to apply all staged changes.
2. Successful applies are stamped with applied timestamp.
3. If apply fails, inspection still completes and asset-sync failure is recorded.
4. Asset-sync exceptions are reportable.

### Story E4-S4: Flag normalization follow-up for placeholders
As management, I need visibility to unresolved placeholders.

Acceptance criteria:
1. If placeholder zones remain at completion, property normalization flag is set.
2. Flag is exposed for dashboard/reporting.
3. Repeat inspections can resolve placeholder records to standard assets.

Dependencies: E3-S1

---

## Epic E4A: Irrigation Asset Type Model and Governance (P0)
Goal: Implement the canonical irrigation asset taxonomy and field governance used by bootstrap, inspection rendering, and callout linkage.

### Story E4A-S1: Implement irrigation asset taxonomy
As a solution architect, I need a controlled irrigation asset taxonomy on standard Asset.

Acceptance criteria:
1. Controlled asset type values are implemented: System, Source, Backflow, Controller, Zone.
2. Record type strategy and validation rules enforce valid parent-child relationships.
3. Asset type is required for all irrigation assets.
4. Existing irrigation assets are mapped/migrated to canonical type values.

### Story E4A-S2: Deliver common asset fields and normalization tracking
As operations, I need consistent cross-type fields for inspection and reporting.

Acceptance criteria:
1. Common fields are implemented: location, install date, placeholder flag, normalization status, last inspected pointers.
2. Placeholder and normalization statuses are reportable.
3. Completion flow updates last-inspected fields for touched assets.
4. Field-level help text documents intended usage.

### Story E4A-S3: Implement minimum bootstrap field sets by asset type
As a tech, I need minimal create friction during bootstrap while preserving data quality.

Acceptance criteria:
1. Bootstrap create forms enforce minimum required fields per type (System, Source, Backflow, Controller, Zone).
2. Zone requires zone number and controller parent.
3. Controller requires label and total zones.
4. Backflow requires backflow type and source parent.
5. Source requires system parent.

### Story E4A-S4: Whitelist editable fields by asset type
As a data steward, I need inline edits restricted to approved fields by type.

Acceptance criteria:
1. Editable field whitelist exists per asset type.
2. Non-whitelisted field edits are blocked in mobile and server validation.
3. Audit records capture blocked update attempts for diagnostics.
4. Whitelist config is documented for admins.

### Story E4A-S5: Configure callout-to-asset type compatibility
As AM operations, I need callouts tied to appropriate asset types.

Acceptance criteria:
1. Issue types map to valid target asset types in the canonical hierarchy (for example broken head -> Zone).
2. Invalid combinations are blocked during conversion to pending WOLI.
3. Error messages explain how to correct asset selection.
4. Mapping table is reportable and admin-maintainable.

Dependencies: E3-S1

---

## Epic E5: Suggested Repairs, Enhancements, and Pending Callout Conversion (P0)
Goal: Generate continuous suggestions (repairs and enhancements) and convert confirmed items to AM-owned pending callouts at checkout.

### Story E5-S1: Generate and de-duplicate suggested repairs and enhancements continuously
As a tech, I need live suggested repair and enhancement visibility while answering questions.

Acceptance criteria:
1. Failed responses create/update suggestion records in near-real time.
2. Suggestions are de-duplicated by Inspection + Asset + Issue Type.
3. Suggestions track quantity, severity, and notes.
4. Suggestions remain editable in checkout review.
5. Each suggestion carries a Callout_Type picklist: `Repair` (something broken) or `Enhancement` (improvement opportunity beyond what's broken).
6. Enhancement suggestions can be created manually by the tech at any point, not only triggered by failed responses.

### Story E5-S2: Checkout review and confirmation workflow
As a tech, I need explicit control over what becomes a callout.

Acceptance criteria:
1. Checkout shows all current suggestions, grouped by Callout_Type (Repair / Enhancement).
2. Tech can confirm, dismiss, or merge suggestions.
3. Confirmed items require structured description.
4. Severity is required and constrained to standard values.
5. Enhancement suggestions display distinct visual treatment from repair suggestions in checkout UI.

### Story E5-S3: Convert confirmed suggestions to pending WOLIs
As AM operations, I need pending callouts ready for estimate review.

Acceptance criteria:
1. Confirmed items create WOLIs in Pending AM Review status.
2. WOLI stores source inspection response linkage.
3. WOLI carries Callout_Type field (`Repair` / `Enhancement`) sourced from confirmed suggestion.
4. AM assignment is required at checkout.
5. If AM is missing, checkout is blocked with actionable message.

Dependencies: E3-S3

---

## Epic E6: AM Ownership and ExtraWork Handoff (P0)
Goal: Route pending callouts to AM for quote decisions and controlled ExtraWork creation.

### Story E6-S1: Enforce AM assignment and override constraints
As a branch lead, I need controlled AM ownership.

Acceptance criteria:
1. AM must be assigned for each pending callout at checkout.
2. Tech can reassign AM only from valid AM list for account/branch.
3. Invalid AM selections are blocked.
4. Assignment events are audit logged.

### Story E6-S2: AM review workspace for pending callouts
As an AM, I need a queue and detail view to triage pending callouts.

Acceptance criteria:
1. AM queue filters by owner and status.
2. Callout detail shows source context (asset, issue type, Callout_Type, severity, notes).
3. AM can mark quotable or in-contract repair path.
4. Status transitions are captured for reporting.

### Story E6-S3: Controlled ExtraWork estimate handoff
As AM, I need to create ExtraWork estimate lines from approved pending callouts.

Acceptance criteria:
1. ExtraWork handoff is AM-only action.
2. Successful handoff writes estimate line reference back to WOLI.
3. Failed handoff surfaces retryable error without data loss.
4. Customer-facing estimate lines are never created directly by tech checkout.

Dependencies: E5-S3

---

## Epic E7: Completion Automation, Documents, and Reporting (P1)
Goal: Complete post-visit automation with document generation and operational observability.

### Story E7-S1: Generate internal and customer PDFs on completion
As branch operations, I need separate internal and customer outputs.

Acceptance criteria:
1. Completion generates internal PDF including internal notes.
2. Completion generates customer PDF excluding internal notes.
3. SA timestamps are set for each PDF generation event.
4. Failures are logged and retriable.

### Story E7-S2: Publish customer artifact downstream
As customer ops, I need post-generation publish tracking.

Acceptance criteria:
1. Customer PDF publish attempt updates published flag and timestamp on success.
2. Publish failures are captured with error reason.
3. Publish state is visible in reporting extracts.

### Story E7-S3: Dashboard/report dataset completeness
As leadership, I need complete metrics for process health.

Acceptance criteria:
1. Reporting includes resolver errors, checkout blocks, pending callout aging, and asset-sync exceptions.
2. Normalization flags are exposed at property level.
3. Inspection completeness and AM throughput metrics are available.
4. Data dictionary for report fields is documented.

Dependencies: E4-S3, E6-S2

---

## Epic E9: Spatial Mapping LWC — Decision Gate and Implementation (P0)
Goal: Deliver a custom Lightning Web Component for within-property irrigation mapping, selecting one MVP provider (Mapbox or Google Maps) via a short decision gate.

> **Architecture constraint (May 2026):** ArcGIS is out for MVP due to no client ArcGIS Online org and added admin overhead. Full geometry is still required (points for components, polygons for zones, lines for pipe/wire runs). MVP provider decision is Mapbox GL JS vs Google Maps JavaScript API.

### Story E9-S1: Run provider decision gate (Mapbox vs Google)
As a solution owner, I need a time-boxed technical decision gate to choose a single mapping stack for MVP.

Acceptance criteria:
1. Two thin POCs exist with equivalent behaviors: load basemap, render sample point/polygon/line, and save/reload geometry.
2. Both POCs are validated in desktop Lightning and FSM Mobile contexts.
3. Decision scorecard exists with weighted criteria: offline behavior, implementation effort, performance, governance/security, and projected 12-month usage cost.
4. Security model is defined for each provider key/token handling approach.
5. Final decision is documented with rationale and approved by product/architecture owners.
6. One provider is selected and the other is explicitly retired from MVP scope.

Dependencies: None

---

### Story E9-S2: Define provider-agnostic geometry data model
As a solution architect, I need a Salesforce-native geometry storage model that survives provider choice.

Acceptance criteria:
1. `Map_Feature__c` custom object exists with fields: Account lookup, Asset lookup (nullable for zone polygons and pipe lines), Feature_Type picklist (Point / Polygon / LineString), GeoJSON_Geometry__c (long text area), Label__c, Color_Code__c, Sort_Order__c.
2. Feature_Type picklist values are controlled: Point, Polygon, LineString.
3. Asset lookup is nullable — zone boundary polygons and pipe lines are account-level features, not always tied to a single asset.
4. Object is reportable and accessible via standard Salesforce SOQL.
5. Sharing model allows field techs to read; only authorized roles can create/edit.
6. Geometry representation is normalized and does not require provider-specific storage formats.

Dependencies: E4A-S1

---

### Story E9-S3: Build desktop feature authoring with selected provider (Account page)
As an Irrigation Manager or office admin, I need to draw and label irrigation system geometry on the Account record.

Acceptance criteria:
1. Map LWC embeds on the Account record page as a dedicated "Irrigation Map" tab.
2. Selected provider supports draw tools: place point, draw polygon (zone), draw line (pipe/wire).
3. On save, drawn geometry is stored as a `Map_Feature__c` record linked to the Account.
4. Point features prompt a popup to select the linked Asset record and confirm the label.
5. Polygon and line features prompt for label and optional color code.
6. Existing features load from `Map_Feature__c` on component init and render on the map.
7. Users with edit permission can drag/reshape existing features; changes persist on save.
8. Delete action removes the `Map_Feature__c` record after confirmation.

Dependencies: E9-S1, E9-S2

---

### Story E9-S4: Build mobile feature view and GPS pin capture (FSM Mobile / Work Order)
As a field tech, I need to view the property map and add or update component pins from mobile during a visit.

Acceptance criteria:
1. Map LWC embeds on the Work Order record page in a "Property Map" tab visible in FSM Mobile.
2. All existing `Map_Feature__c` records for the account are rendered on load.
3. Asset pins are color-coded by asset type (system, controller, zone, backflow, valve/head/drip components).
4. Tapping a pin shows a popup with asset name, type, and last inspected date; tapping "Open Asset" navigates to the Asset record.
5. "Drop GPS Pin" action captures device GPS coordinates and creates a new Point `Map_Feature__c` record linked to the account, prompting asset selection.
6. Tech can edit the label and asset linkage of an existing pin they dropped; cannot delete or reshape features authored by office admin.
7. Component gracefully degrades when device GPS is unavailable (button disabled with explanatory message).

Dependencies: E9-S1, E9-S2, E9-S3

---

### Story E9-S5: Implement and validate offline mapping strategy
As a field tech, I need the property map to be usable in low-connectivity residential environments.

Acceptance criteria:
1. Offline approach for the selected provider is documented, tested, and approved.
2. Component detects network state and renders a "Offline mode — map tiles may not load" banner when offline.
3. GPS pin capture (E9-S4) functions offline and queues the `Map_Feature__c` record for sync.
4. Queued offline records sync automatically on next connectivity restore without user action.
5. Sync failures surface in the Salesforce standard offline conflict UI or a custom notification.

Dependencies: E9-S4

---

### Story E9-S6: Link map features to inspection and callout context
As an AM or office user, I need to see repair callout status reflected on the property map.

Acceptance criteria:
1. Asset pins on the map display a status badge when the linked Asset has an open pending callout (WOLI in Pending AM Review or In Progress status).
2. Badge color/icon is distinct from default pin — uses controlled value set (open callout, in-progress repair, no issues).
3. Tapping a badged pin shows the callout summary (issue type, severity, AM owner) in the popup.
4. Badge state updates within one map reload after callout status changes.
5. Filtering control on the map allows showing only assets with open callouts.

Dependencies: E9-S3, E5-S3

---

## Epic E8: Security, Permissions, and Audit Controls (P1)
Goal: Enforce least privilege and traceability for governance-critical actions.

### Story E8-S1: Permission model for admin vs regional lead vs tech vs AM
As a security admin, I need role-based access controls aligned to duties.

Acceptance criteria:
1. Library publish permissions are restricted to designated admin role.
2. Regional leads can manage drafts only.
3. Techs can complete inspection and assign valid AMs but cannot publish library changes.
4. AMs can transition pending callouts and perform estimate handoff.

### Story E8-S2: Audit logging for governance and routing actions
As compliance, I need action traceability.

Acceptance criteria:
1. Logs capture publish actions, resolver failures, AM assignment changes, and completion exceptions.
2. Audit fields include user, timestamp, before/after where applicable.
3. Logs are reportable for governance review.

Dependencies: E1-S4, E6-S1

---

## Cross-Epic Non-Functional Stories

### NFR-S1: Offline resiliency (P0)
Acceptance criteria:
1. Mobile response capture works without network.
2. Suggestion generation remains deterministic after sync reconciliation.
3. Conflicts are handled predictably with documented behavior.

### NFR-S2: Performance budget (P1)
Acceptance criteria:
1. Inspection form initial load meets agreed threshold on typical mobile devices.
2. Checkout validation completes within agreed threshold for large zone counts.

### NFR-S3: Test coverage baseline (P0)
Acceptance criteria:
1. Unit/integration tests cover resolver, snapshot locking, checkout blocking, and callout conversion.
2. End-to-end test covers bootstrap -> inspection -> checkout -> AM handoff path.

---

## Milestone Cut Suggestion

### Milestone M1 (P0 core go-live)
- E1, E2, E3, E4, E4A, E5, E6
- E9-S1, E9-S2, E9-S3, E9-S4 (provider decision + desktop authoring + mobile GPS pin)
- NFR-S1, NFR-S3

### Milestone M2 (operational hardening)
- E7, E8
- E9-S5, E9-S6 (offline tile strategy + callout map badges)
- NFR-S2

---

## Backlog Intake Template (for Jira)
Use for each story during import:
- Story ID:
- Epic:
- Priority:
- Persona:
- Problem statement:
- Acceptance criteria (numbered):
- Dependencies:
- Data objects touched:
- Automation touched:
- Test notes:
