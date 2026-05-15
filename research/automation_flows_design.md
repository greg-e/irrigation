# Automation Flows Design

Current-state stubs for Salesforce Flows aligned to irrigation inspection requirements and WOLI-first execution.

---

## Flow 1: Compliance Alert — Critical Backflow Non-Compliant

### Trigger
- Object: `Asset`
- Trigger type: Record-Triggered Flow — After Save (insert and update)
- Entry criteria:
  - `RecordType.DeveloperName = 'Backflow'`
  - `ConsequenceOfFailure = 'Critical'`
  - `Compliance_Status__c = 'Non-Compliant'`
- Run when: Record is created or updated and meets conditions

### Actions

1. **Create Case**
   - `Subject`: "Backflow Non-Compliance Alert — {Asset.Name}"
   - `AccountId`: `{Asset.AccountId}`
   - `AssetId`: `{Asset.Id}`
   - `Status`: New
   - `Priority`: High
   - `Origin`: System — Automated
   - `Description`: "Asset flagged as Critical + Non-Compliant. Immediate review required."

2. **Send Alert Notification**
   - Target: Account Owner (`Asset.Account.OwnerId`)
   - Custom Notification or Email Alert
   - Message: "Backflow asset {Asset.Name} at {Asset.Account.Name} is Critical and Non-Compliant. A Case has been created."

### Guard Conditions (prevent re-fire)
- Add an entry condition checking that an open Case for this Asset does not already exist, OR
- Use a `Has_Open_Compliance_Case__c` checkbox on Asset (set by Flow, cleared when Case closes) to prevent duplicate Case creation on subsequent saves

### Open Questions
- [ ] What Case Record Type should be used — Service, Compliance, or default?
- [ ] Should the notification go to the Account Owner, a dedicated Compliance queue, or both?
- [ ] Should the Flow also update `Asset.Status` to "Non-Compliant" (custom status value) when this fires?

---

## Flow 2: Asset Status — Needs Repair / Restored on WO Close

### Purpose
Automatically flip `Asset.Status` based on repair callout activity and Work Order lifecycle.

---

### Flow 2a: Status → "Needs Repair" on Callout Logged

**Trigger**
- Object: `WorkOrderLineItem`
- Trigger type: Record-Triggered Flow — After Save (insert only)
- Entry criteria:
   - `Issue_Type__c != null`
  - `AssetId != null`
- Run when: Record is created and meets conditions

**Actions**
1. Get the related Asset record
2. Update `Asset.Status` = `'Needs Repair'`
   - Only if current Status is not already `'Needs Repair'` (avoid unnecessary write)

---

### Flow 2b: Status → "Installed" on Work Order Closed

**Trigger**
- Object: `WorkOrder`
- Trigger type: Record-Triggered Flow — After Save (update only)
- Entry criteria:
  - `Status` changed to `'Closed'` or `'Completed'`
  - `AssetId != null`
- Run when: Record is updated and meets conditions

**Actions**
1. Get all open Work Order Line Items for this Asset
   - Query: `WorkOrderLineItems WHERE AssetId = {WorkOrder.AssetId} AND (Callout_Status__c = null OR Callout_Status__c != 'Completed')`
2. **Decision: Are there any remaining open callouts?**
   - **Yes → No action.** Asset still has unresolved issues — do not flip status back.
   - **No → Update `Asset.Status` = `'Installed'`** (back to baseline)

> Implementation note: if the org later adopts additional terminal callout states (for example `Declined`), update this query to treat those as closed states.

---

### Asset Status Value Strategy

Recommended custom picklist values for `Asset.Status`:

| Value | Meaning |
|---|---|
| `Installed` | Baseline — asset is in service, no open issues |
| `Needs Repair` | One or more open repair callouts exist |
| `Repair In Progress` | A Work Order is actively open against this asset *(optional — adds granularity)* |
| `Non-Compliant` | Driven by compliance fields (Backflow only) *(optional — vs. using Compliance_Status__c separately)* |
| `Decommissioned` | Asset removed from service |

> Note: If `Non-Compliant` is added as a Status value, Flow 1 should set it instead of (or in addition to) creating the Case. Decision needed.

### Open Questions
- [ ] Should `Repair In Progress` be a distinct Status value, or is `Needs Repair` sufficient for the full open-WO lifecycle?
- [ ] If multiple WOs are open against one Asset, does closing one WO trigger the status check, or wait for all WOs to close?
- [ ] Should Flow 2b also clear `Has_Open_Compliance_Case__c` if used (from Flow 1 guard condition)?
- [ ] Is `Asset.Status` visible and editable by techs, or read-only (automation-only)?

---

## Flow 3: Suggested Repairs from Failed Inspection Responses

### Purpose
Generate deduplicated suggested repairs during inspection, then allow explicit confirmation at checkout.

### Trigger
- Object: `Inspection_Response__c`
- Trigger type: Record-Triggered Flow — After Save (insert and update)
- Entry criteria:
   - `Failed_Inspection__c = true`
   - `Asset__c != null`
   - mapped `Issue_Type__c` can be derived from question/response

### Actions
1. Resolve target issue type from failed response mapping.
2. Upsert suggested repair record using dedupe key `(Inspection, Asset, Issue Type)`.
3. Preserve/edit quantity, severity, and notes if record already exists.
4. Surface suggested repairs in checkout review UI for tech confirmation.

### Open Questions
- [ ] Final object/API name for suggested repair staging record.
- [ ] Should severity be required at suggestion time or only at checkout confirmation?

---

## Flow 4: Checkout Automation Bundle

### Purpose
On irrigation checkout completion, run downstream automation consistently.

### Trigger
- Object: `ServiceAppointment`
- Trigger type: Record-Triggered Flow — After Save (update only)
- Entry criteria:
   - irrigation Work Type
   - `Status` transitions to `Completed`

### Actions
1. Generate internal and customer PDFs and stamp generated-at fields.
2. Queue BV Connect publish when customer subscription criteria are met.
3. Convert confirmed suggested repairs into AM-owned pending callout WOLIs.
4. Apply staged asset changes from pending-change records.
5. If asset apply fails, keep inspection completion but flag asset-sync failure and create follow-up exception task/case.

### Open Questions
- [ ] Should checkout automation run synchronously or via async queue for reliability and mobile latency?
- [ ] What is the canonical exception object for asset-sync failures (Case, custom object, or platform event)?
