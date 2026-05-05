# Automation Flows Design

Stubs for Salesforce Flows driven by decisions in asset_record_page_design.md.

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
- Trigger type: Record-Triggered Flow — After Save (insert and update)
- Entry criteria:
  - `Callout_Status__c = 'New'`
  - `AssetId != null`
- Run when: Record is created or updated and meets conditions

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
   - Query: `WorkOrderLineItems WHERE AssetId = {WorkOrder.AssetId} AND Callout_Status__c NOT IN ('Completed', 'Canceled')`
2. **Decision: Are there any remaining open callouts?**
   - **Yes → No action.** Asset still has unresolved issues — do not flip status back.
   - **No → Update `Asset.Status` = `'Installed'`** (back to baseline)

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
