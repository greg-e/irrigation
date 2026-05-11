const STORAGE_KEY = "desktopAssetSetupPrototypeV1";
const CURRENT_USER = "Prototype User";

function nowIso() {
  return new Date().toISOString();
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function genId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function createSeedData() {
  return {
    properties: [
      {
        id: "prop-001",
        name: "Oak Ridge HOA Campus",
        branch: "Northeast",
        assignedManager: "Jamie Rivers",
        status: "In Progress",
        hasPumpSystem: false,
        hasSensors: false,
        updatedAt: "2026-05-10T13:12:00.000Z",
        assets: [
          {
            id: "asset-c-1",
            type: "Controller",
            name: "Controller A",
            controllerLabel: "A",
            makeModel: "Hydrawise HC-12",
            totalZones: null,
            status: "Active",
            isPlaceholder: false,
            backflowType: "",
            serialNumber: "",
            zoneNumber: null,
            parentId: null,
          },
          {
            id: "asset-z-1",
            type: "Zone",
            name: "Zone 1 Front Lawn",
            zoneNumber: 1,
            parentId: "asset-c-1",
            isPlaceholder: false,
            status: "Active",
            backflowType: "",
            serialNumber: "",
          },
          {
            id: "asset-z-2",
            type: "Zone",
            name: "Zone Placeholder - East Bed",
            zoneNumber: 2,
            parentId: "asset-c-1",
            isPlaceholder: true,
            status: "Active",
            backflowType: "",
            serialNumber: "",
          },
          {
            id: "asset-b-1",
            type: "Backflow",
            name: "Backflow North",
            backflowType: "RPZ",
            serialNumber: "",
            isPlaceholder: false,
            status: "Active",
            parentId: null,
            zoneNumber: null,
          },
        ],
        audit: [
          {
            when: "2026-05-10T13:12:00.000Z",
            user: "Prototype User",
            action: "Create Asset",
            entity: "Controller A",
            details: "Controller created",
          },
        ],
      },
      {
        id: "prop-002",
        name: "Willow Park Retail Center",
        branch: "Northeast",
        assignedManager: "Alex Patel",
        status: "Not Started",
        hasPumpSystem: false,
        hasSensors: false,
        updatedAt: "2026-05-08T15:30:00.000Z",
        assets: [],
        audit: [],
      },
      {
        id: "prop-003",
        name: "Hillside Commons",
        branch: "Southeast",
        assignedManager: "Morgan Chen",
        status: "Complete",
        hasPumpSystem: true,
        hasSensors: false,
        updatedAt: "2026-05-07T10:05:00.000Z",
        assets: [
          {
            id: "asset-c-2",
            type: "Controller",
            name: "Controller West",
            controllerLabel: "W",
            makeModel: "Rain Bird ESP-LX",
            totalZones: null,
            status: "Active",
            isPlaceholder: false,
            parentId: null,
          },
          {
            id: "asset-z-3",
            type: "Zone",
            name: "Zone 1 Turf",
            zoneNumber: 1,
            parentId: "asset-c-2",
            isPlaceholder: false,
            status: "Active",
          },
          {
            id: "asset-b-2",
            type: "Backflow",
            name: "Backflow Main",
            backflowType: "DCV",
            serialNumber: "A-4421",
            status: "Active",
            isPlaceholder: false,
          },
          {
            id: "asset-p-1",
            type: "Pump",
            name: "Pump Primary",
            status: "Active",
            isPlaceholder: false,
          },
        ],
        audit: [
          {
            when: "2026-05-07T10:05:00.000Z",
            user: "Prototype User",
            action: "Mark Complete",
            entity: "Hillside Commons",
            details: "Setup marked complete",
          },
        ],
      },
    ],
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = createSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw);
}

let state = loadState();
let selectedAssetId = null;
let activeTab = "details";

const params = new URLSearchParams(window.location.search);
const propertyId = params.get("property");
const recordAssetIdParam = params.get("asset") || params.get("controller");

const els = {
  recordTitle: document.getElementById("record-title"),
  assetTableBody: document.getElementById("asset-table-body"),
  assetListCount: document.getElementById("asset-list-count"),
  assetListSubtitle: document.getElementById("asset-list-subtitle"),
  assetNewBtn: document.getElementById("asset-new-btn"),
  assetRefreshBtn: document.getElementById("asset-refresh-btn"),
  assetModal: document.getElementById("asset-modal"),
  assetModalBackdrop: document.getElementById("asset-modal-backdrop"),
  assetModalTitle: document.getElementById("asset-modal-title"),
  assetModalClose: document.getElementById("asset-modal-close"),
  assetModalCancel: document.getElementById("asset-modal-cancel"),
  assetModalSave: document.getElementById("asset-modal-save"),
  retireAsset: document.getElementById("retire-asset"),
  modalCreateSection: document.getElementById("modal-create-section"),
  modalEditSection: document.getElementById("modal-edit-section"),
  statusPill: document.getElementById("status-pill"),
  statusProgress: document.getElementById("status-progress"),
  actionComplete: document.getElementById("action-complete"),
  actionReopen: document.getElementById("action-reopen"),
  overviewWarning: document.getElementById("overview-warning"),
  flagPump: document.getElementById("flag-pump"),
  flagSensor: document.getElementById("flag-sensor"),
  flagsForm: document.getElementById("flags-form"),
  flagsMsg: document.getElementById("flags-msg"),
  ruleList: document.getElementById("rule-list"),
  toggleRetired: document.getElementById("toggle-retired"),
  treeRoot: document.getElementById("tree-root"),
  createAssetForm: document.getElementById("create-asset-form"),
  createType: document.getElementById("create-type"),
  createName: document.getElementById("create-name"),
  createControllerLabel: document.getElementById("create-controller-label"),
  createMakeModel: document.getElementById("create-make-model"),
  createTotalZones: document.getElementById("create-total-zones"),
  createZoneNumber: document.getElementById("create-zone-number"),
  createZoneController: document.getElementById("create-zone-controller"),
  createPlaceholder: document.getElementById("create-placeholder"),
  createBackflowType: document.getElementById("create-backflow-type"),
  createSensorType: document.getElementById("create-sensor-type"),
  createParentZone: document.getElementById("create-parent-zone"),
  createSerial: document.getElementById("create-serial"),
  createMsg: document.getElementById("create-msg"),
  editAssetForm: document.getElementById("edit-asset-form"),
  editId: document.getElementById("edit-id"),
  editName: document.getElementById("edit-name"),
  editType: document.getElementById("edit-type"),
  editStatus: document.getElementById("edit-status"),
  editControllerLabel: document.getElementById("edit-controller-label"),
  editMakeModel: document.getElementById("edit-make-model"),
  editTotalZones: document.getElementById("edit-total-zones"),
  editZoneNumber: document.getElementById("edit-zone-number"),
  editZoneController: document.getElementById("edit-zone-controller"),
  editPlaceholder: document.getElementById("edit-placeholder"),
  editBackflowType: document.getElementById("edit-backflow-type"),
  editSensorType: document.getElementById("edit-sensor-type"),
  editParentZone: document.getElementById("edit-parent-zone"),
  editSerial: document.getElementById("edit-serial"),
  relatedContext: document.getElementById("related-context"),
  relatedSummary: document.getElementById("related-summary"),
  relatedList: document.getElementById("related-list"),
  retireAsset: document.getElementById("retire-asset"),
  editMsg: document.getElementById("edit-msg"),
  runValidate: document.getElementById("run-validate"),
  issueList: document.getElementById("issue-list"),
  warningCount: document.getElementById("warning-count"),
  auditBody: document.getElementById("audit-body"),
  detailName: document.getElementById("detail-name"),
  detailType: document.getElementById("detail-type"),
  detailCtrlLabel: document.getElementById("detail-ctrl-label"),
  detailMakeModel: document.getElementById("detail-make-model"),
  detailDescription: document.getElementById("detail-description"),
  detailAssetStatus: document.getElementById("detail-asset-status"),
  detailTotalZones: document.getElementById("detail-total-zones"),
  detailSerial: document.getElementById("detail-serial"),
  detailInstallDate: document.getElementById("detail-install-date"),
  detailProperty: document.getElementById("detail-property"),
  detailBranch: document.getElementById("detail-branch"),
  detailManager: document.getElementById("detail-manager"),
  detailPlaceholderCount: document.getElementById("detail-placeholder-count"),
  detailCreatedBy: document.getElementById("detail-created-by"),
  detailModifiedBy: document.getElementById("detail-modified-by"),
  detailRowL1: document.getElementById("detail-row-l1"),
  detailRowL2: document.getElementById("detail-row-l2"),
  detailRowL3: document.getElementById("detail-row-l3"),
  detailRowL4: document.getElementById("detail-row-l4"),
  detailRowL5: document.getElementById("detail-row-l5"),
  detailRowR1: document.getElementById("detail-row-r1"),
  detailRowR2: document.getElementById("detail-row-r2"),
  detailRowR3: document.getElementById("detail-row-r3"),
  detailRowR4: document.getElementById("detail-row-r4"),
  detailLabelL1: document.getElementById("detail-label-l1"),
  detailLabelL2: document.getElementById("detail-label-l2"),
  detailLabelL3: document.getElementById("detail-label-l3"),
  detailLabelL4: document.getElementById("detail-label-l4"),
  detailLabelL5: document.getElementById("detail-label-l5"),
  detailLabelR1: document.getElementById("detail-label-r1"),
  detailLabelR2: document.getElementById("detail-label-r2"),
  detailLabelR3: document.getElementById("detail-label-r3"),
  detailLabelR4: document.getElementById("detail-label-r4"),
  detailTimeline: document.getElementById("detail-timeline"),
  hierarchyTree: document.getElementById("hierarchy-tree"),
  hierarchySummary: document.getElementById("hierarchy-summary"),
  hierarchySearch: document.getElementById("hierarchy-search"),
  hlOwner: document.getElementById("hl-owner"),
  hlStatus: document.getElementById("hl-status"),
  hlBranch: document.getElementById("hl-branch"),
  hlUpdated: document.getElementById("hl-updated"),
  railRelatedList: document.getElementById("rail-related-list"),
  railRecentActivity: document.getElementById("rail-recent-activity"),
  tabButtons: document.querySelectorAll("[data-tab-target]"),
  tabPanels: document.querySelectorAll("[data-tab-panel]"),
};

function setActiveTab(tabKey) {
  activeTab = tabKey;
  els.tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === tabKey;
    button.classList.toggle("active", isActive);
    const tabItem = button.closest(".slds-tabs_default__item");
    if (tabItem) {
      tabItem.classList.toggle("slds-is-active", isActive);
    }
  });
  els.tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tabPanel === tabKey);
  });
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function navigateToRelatedAsset(assetId) {
  const next = new URLSearchParams(window.location.search);
  if (propertyId) {
    next.set("property", propertyId);
  }
  next.set("asset", assetId);
  window.location.assign(`property_record.html?${next.toString()}`);
}

function getProperty() {
  return state.properties.find((p) => p.id === propertyId) || null;
}

function activeAssets(property) {
  return property.assets.filter((a) => a.status !== "Retired");
}

function addAudit(property, action, entity, details) {
  property.audit.unshift({
    when: nowIso(),
    user: CURRENT_USER,
    action,
    entity,
    details,
  });
  property.updatedAt = nowIso();
}

function uniqueZonePerController(property, zone, skipId = null) {
  return !activeAssets(property).some((a) => {
    if (a.id === skipId) return false;
    return a.type === "Zone" && a.parentId === zone.parentId && Number(a.zoneNumber) === Number(zone.zoneNumber);
  });
}

function getValidation(property) {
  const assets = activeAssets(property);
  const controllers = assets.filter((a) => a.type === "Controller");
  const zones = assets.filter((a) => a.type === "Zone");
  const backflows = assets.filter((a) => a.type === "Backflow");
  const pumps = assets.filter((a) => a.type === "Pump");
  const sensors = assets.filter((a) => a.type === "Sensor");

  const issues = [];

  if (!controllers.length) {
    issues.push({ id: "rule-controllers", text: "At least one Controller is required.", assetId: null });
  }
  if (!zones.length) {
    issues.push({ id: "rule-zones", text: "At least one Zone is required.", assetId: null });
  }
  if (!backflows.length) {
    issues.push({ id: "rule-backflow", text: "At least one Backflow is required.", assetId: null });
  }

  zones.forEach((zone) => {
    const controller = controllers.find((c) => c.id === zone.parentId);
    if (!controller) {
      issues.push({
        id: `zone-link-${zone.id}`,
        text: `Zone ${zone.name} is not linked to a valid Controller.`,
        assetId: zone.id,
      });
    }
    if (zone.zoneNumber == null || zone.zoneNumber === "") {
      issues.push({
        id: `zone-number-${zone.id}`,
        text: `Zone ${zone.name} must have Zone Number.`,
        assetId: zone.id,
      });
    }
  });

  const duplicates = zones.filter((zone) => {
    if (!zone.parentId || zone.zoneNumber == null || zone.zoneNumber === "") return false;
    return !uniqueZonePerController(property, zone, zone.id);
  });

  duplicates.forEach((zone) => {
    issues.push({
      id: `zone-dup-${zone.id}`,
      text: `Zone Number ${zone.zoneNumber} is duplicated under the same Controller.`,
      assetId: zone.id,
    });
  });

  if (property.hasPumpSystem && !pumps.length) {
    issues.push({ id: "rule-pump", text: "Pump System is enabled but no Pump asset exists.", assetId: null });
  }
  if (property.hasSensors && !sensors.length) {
    issues.push({ id: "rule-sensor", text: "Sensors are enabled but no Sensor asset exists.", assetId: null });
  }

  const placeholderZones = zones.filter((z) => z.isPlaceholder).length;

  const rules = [
    {
      key: "controllers",
      label: "At least one Controller",
      pass: controllers.length > 0,
    },
    {
      key: "zones",
      label: "At least one Zone",
      pass: zones.length > 0,
    },
    {
      key: "zoneLinks",
      label: "Every Zone linked to a Controller",
      pass: zones.length > 0 && zones.every((z) => controllers.some((c) => c.id === z.parentId)),
    },
    {
      key: "backflow",
      label: "At least one Backflow",
      pass: backflows.length > 0,
    },
    {
      key: "conditional",
      label: "Pump/Sensor conditional rules",
      pass: (!property.hasPumpSystem || pumps.length > 0) && (!property.hasSensors || sensors.length > 0),
    },
  ];

  return {
    issues,
    rules,
    warnings: {
      placeholderZones,
    },
  };
}

function renderControllerOptions(selectEl, includeBlank = true) {
  const property = getProperty();
  if (!property) return;
  const controllers = activeAssets(property).filter((a) => a.type === "Controller");

  selectEl.innerHTML = `${includeBlank ? "<option value=''>Select</option>" : ""}${controllers
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("")}`;
}

function renderZoneOptions(selectEl, includeBlank = true) {
  const property = getProperty();
  if (!property) return;
  const zones = activeAssets(property).filter((a) => a.type === "Zone");

  selectEl.innerHTML = `${includeBlank ? "<option value=''>Select</option>" : ""}${zones
    .map((z) => `<option value="${z.id}">${z.name}</option>`)
    .join("")}`;
}

function setFormFieldState(fieldEl, options = {}) {
  if (!fieldEl) return;
  const row = fieldEl.closest(".slds-form-element");
  const visible = options.visible !== false;
  if (row) {
    row.classList.toggle("hidden", !visible);
  }
  fieldEl.disabled = options.disabled === true || !visible;
  if (typeof options.required === "boolean") {
    fieldEl.required = options.required;
  }
}

function configureCreateFormByType() {
  const type = els.createType.value;

  const isController = type === "Controller";
  const isZone = type === "Zone";
  const isBackflow = type === "Backflow";
  const isSensor = type === "Sensor";
  const isZoneChild = type === "Valve" || type === "Head" || type === "Drip_Line";

  setFormFieldState(els.createControllerLabel, { visible: isController, required: isController });
  setFormFieldState(els.createMakeModel, { visible: isController, required: false });
  setFormFieldState(els.createTotalZones, { visible: isController, required: isController });

  setFormFieldState(els.createZoneNumber, { visible: isZone, required: isZone });
  setFormFieldState(els.createZoneController, { visible: isZone || isSensor, required: isZone || isSensor });
  setFormFieldState(els.createPlaceholder, { visible: isZone, required: false });

  setFormFieldState(els.createBackflowType, { visible: isBackflow, required: isBackflow });
  setFormFieldState(els.createSensorType, { visible: isSensor, required: isSensor });
  setFormFieldState(els.createParentZone, { visible: isZoneChild, required: isZoneChild });

  setFormFieldState(els.createSerial, { visible: isBackflow || isSensor, required: false });
}

function configureEditFormByType(type) {
  const isController = type === "Controller";
  const isZone = type === "Zone";
  const isBackflow = type === "Backflow";
  const isSensor = type === "Sensor";
  const isZoneChild = type === "Valve" || type === "Head" || type === "Drip_Line";

  setFormFieldState(els.editControllerLabel, { visible: isController, required: isController });
  setFormFieldState(els.editMakeModel, { visible: isController, required: false });
  setFormFieldState(els.editTotalZones, { visible: isController, required: isController });

  setFormFieldState(els.editZoneNumber, { visible: isZone, required: isZone });
  setFormFieldState(els.editZoneController, { visible: isZone || isSensor, required: isZone || isSensor });
  setFormFieldState(els.editPlaceholder, { visible: isZone, required: false });

  setFormFieldState(els.editBackflowType, { visible: isBackflow, required: isBackflow });
  setFormFieldState(els.editSensorType, { visible: isSensor, required: isSensor });
  setFormFieldState(els.editParentZone, { visible: isZoneChild, required: isZoneChild });

  setFormFieldState(els.editSerial, { visible: isBackflow || isSensor, required: false });
}

function renderStatusOverview(property) {
  const val = getValidation(property);
  const passed = val.rules.filter((r) => r.pass).length;

  els.statusPill.textContent = property.status;
  els.statusPill.className = "status-pill";
  if (property.status === "Complete") {
    els.statusPill.classList.add("status-complete");
  } else if (property.status === "In Progress") {
    els.statusPill.classList.add("status-in-progress");
  } else {
    els.statusPill.classList.add("status-not-started");
  }

  els.statusProgress.textContent = `${passed} / ${val.rules.length} required checks passed`;

  els.flagPump.checked = property.hasPumpSystem;
  els.flagSensor.checked = property.hasSensors;

  els.overviewWarning.textContent =
    val.warnings.placeholderZones > 0
      ? `${val.warnings.placeholderZones} placeholder zone(s) present. Non-blocking warning.`
      : "";

  els.ruleList.innerHTML = val.rules
    .map(
      (rule) => `<div class="rule-item"><span>${rule.label}</span><span class="${
        rule.pass ? "rule-pass" : "rule-fail"
      }">${rule.pass ? "Pass" : "Fail"}</span></div>`
    )
    .join("");
}

function renderAssetTable(contextAsset = null) {
  const property = getProperty();
  if (!property) return;

  const showRetired = els.toggleRetired.checked;
  const allActive = activeAssets(property);
  const scopePool = showRetired ? property.assets : allActive;

  let displayed = scopePool;
  let subtitleScope = "All property assets";

  if (contextAsset && contextAsset.type !== "Controller") {
    const relatedIds = new Set([contextAsset.id]);

    if (contextAsset.parentId) {
      relatedIds.add(contextAsset.parentId);
    }

    scopePool
      .filter((asset) => asset.parentId === contextAsset.parentId || asset.parentId === contextAsset.id)
      .forEach((asset) => relatedIds.add(asset.id));

    displayed = scopePool.filter((asset) => relatedIds.has(asset.id));
    subtitleScope = `Related to ${contextAsset.name} (parent, siblings, children)`;
  }

  const sorted = [...displayed].sort((a, b) => a.name.localeCompare(b.name));

  const total = sorted.length;
  els.assetListCount.textContent = `(${total})`;
  els.assetListSubtitle.textContent = `${total} item${total !== 1 ? "s" : ""} • ${subtitleScope} • Sorted by Name${showRetired ? " • Showing retired" : ""}`;

  if (!sorted.length) {
    els.assetTableBody.innerHTML = `<tr><td colspan="7" class="slds-text-align_center slds-p-around_medium slds-text-color_weak">No assets. Click New to create the first asset.</td></tr>`;
    renderControllerOptions(els.createZoneController);
    renderControllerOptions(els.editZoneController);
    renderZoneOptions(els.createParentZone);
    renderZoneOptions(els.editParentZone);
    return;
  }

  const ICON_BASE = "https://cdnjs.cloudflare.com/ajax/libs/design-system/2.22.0/icons";

  els.assetTableBody.innerHTML = sorted.map((asset, idx) => {
    const zoneNum = asset.zoneNumber != null ? asset.zoneNumber : "";
    const makeModel = asset.makeModel || "";
    const isRetired = asset.status === "Retired";
    const statusBadge = isRetired
      ? `<span class="slds-badge slds-theme_error" style="font-size:0.7rem">${asset.status}</span>`
      : asset.status;
    return `<tr class="slds-hint-parent${isRetired ? " slds-text-color_weak" : ""}">
      <td class="slds-text-align_right slds-text-color_weak" data-label="Row" style="width:2.5rem">${idx + 1}</td>
      <td data-label="Name">
        <button class="slds-button slds-button_reset slds-text-link" data-select-asset="${asset.id}" type="button">${asset.name}</button>
      </td>
      <td data-label="Type">${asset.type}</td>
      <td data-label="Status">${statusBadge}</td>
      <td data-label="Zone #">${zoneNum}</td>
      <td data-label="Make / Model">${makeModel}</td>
      <td style="width:3rem">
        <button class="slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small" data-row-action="${asset.id}" type="button" title="Row Actions">
          <svg class="slds-button__icon" aria-hidden="true">
            <use xlink:href="${ICON_BASE}/utility-sprite/svg/symbols.svg#down"></use>
          </svg>
          <span class="slds-assistive-text">Row Actions</span>
        </button>
      </td>
    </tr>`;
  }).join("");

  renderControllerOptions(els.createZoneController);
  renderControllerOptions(els.editZoneController);
  renderZoneOptions(els.createParentZone);
  renderZoneOptions(els.editParentZone);
}

function openCreateModal() {
  els.modalCreateSection.classList.remove("hidden");
  els.modalEditSection.classList.add("hidden");
  els.assetModalTitle.textContent = "New Asset";
  els.assetModalSave.textContent = "Save";
  els.retireAsset.style.display = "none";
  els.createMsg.textContent = "";
  els.createAssetForm.reset();
  renderControllerOptions(els.createZoneController);
  renderZoneOptions(els.createParentZone);
  configureCreateFormByType();
  els.assetModal.classList.remove("hidden");
  els.assetModal.classList.add("slds-fade-in-open");
  els.assetModalBackdrop.classList.remove("hidden");
  els.assetModalBackdrop.classList.add("slds-backdrop_open");
  document.body.classList.add("slds-overflow-hidden");
}

function openEditModal() {
  els.modalCreateSection.classList.add("hidden");
  els.modalEditSection.classList.remove("hidden");
  els.assetModalTitle.textContent = "Edit Asset";
  els.assetModalSave.textContent = "Save";
  els.retireAsset.style.display = "";
  els.editMsg.textContent = "";
  els.assetModal.classList.remove("hidden");
  els.assetModal.classList.add("slds-fade-in-open");
  els.assetModalBackdrop.classList.remove("hidden");
  els.assetModalBackdrop.classList.add("slds-backdrop_open");
  document.body.classList.add("slds-overflow-hidden");
}

function closeAssetModal() {
  els.assetModal.classList.add("hidden");
  els.assetModal.classList.remove("slds-fade-in-open");
  els.assetModalBackdrop.classList.add("hidden");
  els.assetModalBackdrop.classList.remove("slds-backdrop_open");
  document.body.classList.remove("slds-overflow-hidden");
}

function setSelectedAsset(assetId, options = {}) {
  const property = getProperty();
  if (!property) return;
  const asset = property.assets.find((a) => a.id === assetId);
  if (!asset) return;

  if (!options.suppressTabSwitch) {
    setActiveTab("assets");
  }

  selectedAssetId = assetId;

  els.editId.value = asset.id;
  els.editName.value = asset.name || "";
  els.editType.value = asset.type || "";
  els.editStatus.value = asset.status || "Active";
  els.editControllerLabel.value = asset.controllerLabel || "";
  els.editMakeModel.value = asset.makeModel || "";
  els.editTotalZones.value = asset.totalZones ?? "";
  els.editZoneNumber.value = asset.zoneNumber ?? "";
  els.editPlaceholder.value = asset.isPlaceholder ? "true" : "false";
  els.editBackflowType.value = asset.backflowType || "";
  els.editSensorType.value = asset.sensorType || "";
  els.editSerial.value = asset.serialNumber || "";
  renderControllerOptions(els.editZoneController);
  els.editZoneController.value = asset.parentId || "";
  renderZoneOptions(els.editParentZone);
  els.editParentZone.value = asset.parentId || "";
  configureEditFormByType(asset.type);

  const related = getRelatedAssetContext(property, asset);
  els.relatedContext.classList.remove("hidden");
  els.relatedSummary.textContent = related.summary;
  els.relatedList.innerHTML = related.lines.length
    ? related.lines.map((line) => `<li>${line}</li>`).join("")
    : "<li>No linked assets.</li>";

  if (!options.suppressTabSwitch) {
    openEditModal();
  }
}

function applyEditGuards(asset) {
  if (asset.type === "Controller") {
    const controllerLabel = els.editControllerLabel.value.trim();
    const totalZones = els.editTotalZones.value;

    if (!controllerLabel) {
      return { ok: false, message: "Controller Label is required for Controllers." };
    }
    if (!totalZones) {
      return { ok: false, message: "Total Zones is required for Controllers." };
    }

    asset.controllerLabel = controllerLabel;
    asset.makeModel = els.editMakeModel.value.trim();
    asset.totalZones = Number(totalZones);

    asset.zoneNumber = null;
    asset.parentId = null;
    asset.isPlaceholder = false;
    asset.backflowType = "";
    asset.sensorType = "";
    asset.serialNumber = "";
    return { ok: true };
  }

  if (asset.type === "Zone") {
    const zoneNumber = Number(els.editZoneNumber.value);
    const parentId = els.editZoneController.value;
    if (!zoneNumber || !parentId) {
      return { ok: false, message: "Zone Number and Parent Controller are required for Zones." };
    }

    asset.zoneNumber = zoneNumber;
    asset.parentId = parentId;
    asset.isPlaceholder = els.editPlaceholder.value === "true";

    asset.controllerLabel = "";
    asset.makeModel = "";
    asset.totalZones = null;
    asset.backflowType = "";
    asset.sensorType = "";
    asset.serialNumber = "";
    return { ok: true };
  }

  if (asset.type === "Backflow") {
    const backflowType = els.editBackflowType.value;
    if (!backflowType) {
      return { ok: false, message: "Backflow Type is required." };
    }

    asset.backflowType = backflowType;
    asset.serialNumber = els.editSerial.value.trim();

    asset.controllerLabel = "";
    asset.makeModel = "";
    asset.totalZones = null;
    asset.zoneNumber = null;
    asset.parentId = null;
    asset.isPlaceholder = false;
    asset.sensorType = "";
    return { ok: true };
  }

  if (asset.type === "Sensor") {
    const sensorType = els.editSensorType.value;
    const parentId = els.editZoneController.value;

    if (!sensorType || !parentId) {
      return { ok: false, message: "Sensor Type and Parent Controller are required for Sensors." };
    }

    asset.sensorType = sensorType;
    asset.parentId = parentId;
    asset.serialNumber = els.editSerial.value.trim();

    asset.controllerLabel = "";
    asset.makeModel = "";
    asset.totalZones = null;
    asset.zoneNumber = null;
    asset.isPlaceholder = false;
    asset.backflowType = "";
    return { ok: true };
  }

  if (asset.type === "Valve" || asset.type === "Head" || asset.type === "Drip_Line") {
    const parentZoneId = els.editParentZone.value;
    if (!parentZoneId) {
      return { ok: false, message: "Parent Zone is required." };
    }

    asset.parentId = parentZoneId;

    asset.controllerLabel = "";
    asset.makeModel = "";
    asset.totalZones = null;
    asset.zoneNumber = null;
    asset.isPlaceholder = false;
    asset.backflowType = "";
    asset.sensorType = "";
    asset.serialNumber = "";
    return { ok: true };
  }

  // Fallthrough: generic assets — no type-specific fields.
  asset.controllerLabel = "";
  asset.makeModel = "";
  asset.totalZones = null;
  asset.zoneNumber = null;
  asset.parentId = null;
  asset.isPlaceholder = false;
  asset.backflowType = "";
  asset.sensorType = "";
  asset.serialNumber = "";
  return { ok: true };
}

function getRelatedAssetContext(property, asset) {
  const assets = activeAssets(property);

  if (asset.type === "Controller") {
    const linkedZones = assets.filter((a) => a.type === "Zone" && a.parentId === asset.id);
    return {
      summary: `${linkedZones.length} active zone(s) linked to this controller.`,
      lines: [
        ...(linkedZones.length
          ? linkedZones.map((z) => `Zone ${z.zoneNumber ?? "?"}: ${z.name}`)
          : ["No linked zones yet."]),
        ...(linkedZones.length
          ? ["Retire impact: blocked until linked zones are reassigned or retired."]
          : ["Retire impact: no zone dependency block."]),
      ],
    };
  }

  if (asset.type === "Zone") {
    const parent = property.assets.find((a) => a.id === asset.parentId);
    const siblings = assets.filter(
      (a) => a.type === "Zone" && a.parentId === asset.parentId && a.id !== asset.id
    );
    return {
      summary: `Zone is ${parent ? `linked to ${parent.name}` : "not linked to a valid controller"}.`,
      lines: [
        `Sibling zones under same controller: ${siblings.length}.`,
        ...(siblings.length ? siblings.map((z) => `Zone ${z.zoneNumber ?? "?"}: ${z.name}`) : []),
        "Retire impact: no direct dependency block.",
      ],
    };
  }

  if (asset.type === "Backflow") {
    const count = assets.filter((a) => a.type === "Backflow").length;
    return {
      summary: `${count} active backflow asset(s) at this property.`,
      lines: [
        count <= 1
          ? "Retire impact: setup validation will fail until another backflow is created."
          : "Retire impact: validation can still pass if another backflow remains active.",
      ],
    };
  }

  const sameTypeCount = assets.filter((a) => a.type === asset.type).length;
  return {
    summary: `${sameTypeCount} active asset(s) of type ${asset.type}.`,
    lines: ["Retire impact: review conditional pump/sensor rules before retiring."],
  };
}

function renderValidation(property, includeAudit = false) {
  const val = getValidation(property);
  els.issueList.innerHTML = val.issues.length
    ? val.issues
        .map((issue) => {
          const link = issue.assetId
            ? `<button class="issue-link" type="button" data-jump-asset="${issue.assetId}">Open asset</button>`
            : "";
          return `<li>${issue.text} ${link}</li>`;
        })
        .join("")
    : "<li>No blocking issues found.</li>";

  els.warningCount.textContent =
    val.warnings.placeholderZones > 0
      ? `${val.warnings.placeholderZones} placeholder zone(s) detected. Warning only.`
      : "No warnings.";

  if (includeAudit) {
    addAudit(
      property,
      "Validate",
      property.name,
      val.issues.length ? `Validation found ${val.issues.length} blocking issue(s)` : "Validation passed"
    );
  }
}

function renderAudit(property) {
  if (!els.auditBody) return;
  els.auditBody.innerHTML = property.audit.length
    ? property.audit
        .map(
          (entry) => `<tr>
      <td>${fmtDate(entry.when)}</td>
      <td>${entry.user}</td>
      <td>${entry.action}</td>
      <td>${entry.entity}</td>
      <td>${entry.details}</td>
    </tr>`
        )
        .join("")
    : "<tr><td colspan='5'>No audit records yet.</td></tr>";
}

function renderContextRail(property) {
  const assets = activeAssets(property);
  const controllers = assets.filter((a) => a.type === "Controller").length;
  const zones = assets.filter((a) => a.type === "Zone").length;
  const backflows = assets.filter((a) => a.type === "Backflow").length;
  const placeholderZones = assets.filter((a) => a.type === "Zone" && a.isPlaceholder).length;
  const blockingIssues = getValidation(property).issues.length;

  els.hlOwner.textContent = property.assignedManager;
  els.hlStatus.textContent = property.status;
  els.hlBranch.textContent = property.branch;
  els.hlUpdated.textContent = fmtDate(property.updatedAt);

  els.railRelatedList.innerHTML = [
    `Property Account: ${property.name}`,
    `Controllers: ${controllers}`,
    `Zones: ${zones}`,
    `Backflows: ${backflows}`,
    `Placeholder Zones: ${placeholderZones}`,
    `Blocking Issues: ${blockingIssues}`,
  ]
    .map((line) => `<li>${line}</li>`)
    .join("");

  const recent = property.audit.slice(0, 5);
  if (els.railRecentActivity) {
    els.railRecentActivity.innerHTML = recent.length
      ? recent.map((entry) => `<li>${entry.action}: ${entry.entity}</li>`).join("")
      : "<li>No recent activity.</li>";
  }
}

function renderTimeline(property) {
  const val = getValidation(property);
  const timelineItems = [];

  if (val.issues.length) {
    timelineItems.push({
      tone: "alert",
      title: `Validation blocked (${val.issues.length})`,
      details: "Resolve blocking issues before completion.",
      when: property.updatedAt,
    });
  }

  if (val.warnings.placeholderZones > 0) {
    timelineItems.push({
      tone: "warning",
      title: `${val.warnings.placeholderZones} placeholder zone(s)`,
      details: "Warning only; placeholders are still allowed.",
      when: property.updatedAt,
    });
  }

  property.audit.slice(0, 8).forEach((entry) => {
    timelineItems.push({
      tone: "neutral",
      title: `${entry.action} - ${entry.entity}`,
      details: entry.details,
      when: entry.when,
    });
  });

  els.detailTimeline.innerHTML = timelineItems.length
    ? timelineItems
        .map(
          (item) => `<li class="timeline-item timeline-${item.tone}">
      <div class="timeline-meta">${fmtDate(item.when)}</div>
      <p class="timeline-title">${item.title}</p>
      <p class="timeline-detail">${item.details}</p>
    </li>`
        )
        .join("")
    : "<li class='timeline-item timeline-neutral'><p class='timeline-title'>No timeline activity yet.</p></li>";
}

function getAssetPath(property, asset) {
  const path = [];
  let cursor = asset;
  while (cursor) {
    path.unshift(cursor.name);
    cursor = property.assets.find((a) => a.id === cursor.parentId) || null;
  }
  return path;
}

function renderHierarchy(property, contextAsset = null) {
  const term = (els.hierarchySearch?.value || "").trim().toLowerCase();
  const assets = activeAssets(property);
  const byParent = new Map();

  assets.forEach((asset) => {
    const parentKey = asset.parentId || "root";
    if (!byParent.has(parentKey)) {
      byParent.set(parentKey, []);
    }
    byParent.get(parentKey).push(asset);
  });

  byParent.forEach((group) => group.sort((a, b) => a.name.localeCompare(b.name)));

  function nodeMatches(asset) {
    if (!term) return true;
    const haystack = `${asset.name} ${asset.type} ${asset.controllerLabel || ""} ${asset.backflowType || ""}`.toLowerCase();
    return haystack.includes(term);
  }

  function renderNode(asset) {
    const children = byParent.get(asset.id) || [];
    const childHtml = children.map(renderNode).join("");
    const matches = nodeMatches(asset) || childHtml.length > 0;
    if (!matches) {
      return "";
    }

    const isSelected = selectedAssetId === asset.id;
    const line2 = asset.type === "Zone" && asset.zoneNumber != null ? `Zone ${asset.zoneNumber}` : asset.type;

    return `<div class="tree-node ${isSelected ? "tree-node-selected" : ""}">
      <button type="button" data-hierarchy-asset="${asset.id}">
        <span class="tree-node-title">${asset.name}</span>
        <span class="tree-node-subtitle">${line2}</span>
      </button>
      ${childHtml ? `<div class="tree-children">${childHtml}</div>` : ""}
    </div>`;
  }

  let roots = byParent.get("root") || [];
  let hierarchyMode = "property";

  if (contextAsset && contextAsset.parentId) {
    const parent = assets.find((a) => a.id === contextAsset.parentId) || null;
    roots = parent ? [parent] : [contextAsset];
    hierarchyMode = "branch";
  }

  const html = roots.map(renderNode).join("");

  els.hierarchyTree.innerHTML = html || "<p class='muted'>No hierarchy matches the current filter.</p>";

  const selected = assets.find((a) => a.id === selectedAssetId);
  if (selected) {
    const prefix =
      hierarchyMode === "branch"
        ? "Child branch view"
        : "Selected path";
    els.hierarchySummary.textContent = `${prefix}: ${getAssetPath(property, selected).join(" > ")}`;
  } else {
    els.hierarchySummary.textContent = `${assets.length} active asset(s) in hierarchy.`;
  }
}

function renderDetailsTab(property, controllerAsset) {
  const asset = controllerAsset;
  const blank = "—";

  const leftSlots = [
    { row: els.detailRowL1, label: els.detailLabelL1, value: els.detailName },
    { row: els.detailRowL2, label: els.detailLabelL2, value: els.detailType },
    { row: els.detailRowL3, label: els.detailLabelL3, value: els.detailCtrlLabel },
    { row: els.detailRowL4, label: els.detailLabelL4, value: els.detailMakeModel },
    { row: els.detailRowL5, label: els.detailLabelL5, value: els.detailDescription },
  ];

  const rightSlots = [
    { row: els.detailRowR1, label: els.detailLabelR1, value: els.detailAssetStatus },
    { row: els.detailRowR2, label: els.detailLabelR2, value: els.detailTotalZones },
    { row: els.detailRowR3, label: els.detailLabelR3, value: els.detailSerial },
    { row: els.detailRowR4, label: els.detailLabelR4, value: els.detailInstallDate },
  ];

  function applySlot(slot, field) {
    if (!slot.row || !slot.label || !slot.value) return;
    if (!field) {
      slot.row.classList.add("hidden");
      slot.value.textContent = blank;
      return;
    }
    slot.row.classList.remove("hidden");
    slot.label.textContent = field.label;
    slot.value.textContent = field.value == null || field.value === "" ? blank : String(field.value);
  }

  if (!asset) {
    leftSlots.forEach((slot, idx) => applySlot(slot, idx === 0 ? { label: "Name", value: blank } : null));
    rightSlots.forEach((slot, idx) => applySlot(slot, idx === 0 ? { label: "Status", value: blank } : null));
  } else {
    const parent = property.assets.find((a) => a.id === asset.parentId);
    const childCount = activeAssets(property).filter((a) => a.parentId === asset.id).length;

    let leftFields = [];
    let rightFields = [];

    if (asset.type === "Controller") {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Controller Label", value: asset.controllerLabel },
        { label: "Make / Model", value: asset.makeModel },
        { label: "Description", value: asset.description },
      ];
      rightFields = [
        { label: "Status", value: asset.status },
        { label: "Total Zones", value: asset.totalZones },
        { label: "Linked Child Assets", value: childCount },
        { label: "Install Date", value: asset.installDate ? fmtDate(asset.installDate) : blank },
      ];
    } else if (asset.type === "Zone") {
      const siblingCount = activeAssets(property).filter(
        (a) => a.type === "Zone" && a.parentId === asset.parentId && a.id !== asset.id
      ).length;
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Zone Number", value: asset.zoneNumber },
        { label: "Parent Controller", value: parent ? parent.name : blank },
        { label: "Placeholder Zone", value: asset.isPlaceholder ? "Yes" : "No" },
      ];
      rightFields = [
        { label: "Status", value: asset.status },
        { label: "Sibling Zones", value: siblingCount },
        { label: "Serial Number", value: asset.serialNumber },
        { label: "Description", value: asset.description },
      ];
    } else if (asset.type === "Backflow") {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Backflow Type", value: asset.backflowType },
        { label: "Serial Number", value: asset.serialNumber },
        { label: "Description", value: asset.description },
      ];
      rightFields = [
        { label: "Status", value: asset.status },
        { label: "Parent Controller", value: parent ? parent.name : blank },
        { label: "Install Date", value: asset.installDate ? fmtDate(asset.installDate) : blank },
        { label: "Linked Child Assets", value: childCount },
      ];
    } else if (asset.type === "Sensor") {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Sensor Type", value: asset.sensorType },
        { label: "Parent Controller", value: parent ? parent.name : blank },
        { label: "Description", value: asset.description },
      ];
      rightFields = [
        { label: "Status", value: asset.status },
        { label: "Serial Number", value: asset.serialNumber },
        { label: "Install Date", value: asset.installDate ? fmtDate(asset.installDate) : blank },
        { label: "Linked Child Assets", value: childCount },
      ];
    } else if (asset.type === "Valve" || asset.type === "Head" || asset.type === "Drip_Line") {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Parent Zone", value: parent ? parent.name : blank },
        null,
        { label: "Description", value: asset.description },
      ];
      rightFields = [
        { label: "Status", value: asset.status },
        { label: "Serial Number", value: asset.serialNumber },
        { label: "Install Date", value: asset.installDate ? fmtDate(asset.installDate) : blank },
        { label: "Linked Child Assets", value: childCount },
      ];
    } else {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        null,
        null,
        { label: "Description", value: asset.description },
      ];
      rightFields = [
        { label: "Status", value: asset.status },
        { label: "Serial Number", value: asset.serialNumber },
        { label: "Install Date", value: asset.installDate ? fmtDate(asset.installDate) : blank },
        { label: "Linked Child Assets", value: childCount },
      ];
    }

    leftSlots.forEach((slot, idx) => applySlot(slot, leftFields[idx] || null));
    rightSlots.forEach((slot, idx) => applySlot(slot, rightFields[idx] || null));
  }

  els.detailProperty.textContent = property.name;
  els.detailBranch.textContent = property.branch || blank;
  els.detailManager.textContent = property.assignedManager || blank;

  const placeholderCount = activeAssets(property).filter((a) => a.type === "Zone" && a.isPlaceholder).length;
  els.detailPlaceholderCount.textContent = placeholderCount;

  const firstAudit = property.audit.length ? property.audit[property.audit.length - 1] : null;
  els.detailCreatedBy.textContent = firstAudit ? `${firstAudit.user}, ${fmtDate(firstAudit.when)}` : "Prototype User";
  els.detailModifiedBy.textContent = `Prototype User, ${fmtDate(property.updatedAt)}`;
}

function renderPage() {
  const property = getProperty();
  if (!property) {
    els.recordTitle.textContent = "Controller Asset Not Found";
    return;
  }

  const recordAsset =
    (recordAssetIdParam && property.assets.find((a) => a.id === recordAssetIdParam)) ||
    property.assets.find((a) => a.type === "Controller");

  const detailAsset =
    (selectedAssetId && property.assets.find((a) => a.id === selectedAssetId)) ||
    recordAsset ||
    property.assets[0] ||
    null;

  if (detailAsset) {
    selectedAssetId = detailAsset.id;
  }

  els.recordTitle.textContent = recordAsset ? recordAsset.name : property.name;

  renderStatusOverview(property);
  renderDetailsTab(property, detailAsset);
  renderTimeline(property);
  renderHierarchy(property, detailAsset);
  renderAssetTable(detailAsset);
  if (!selectedAssetId && detailAsset) {
    setSelectedAsset(detailAsset.id, { suppressTabSwitch: true });
  } else if (selectedAssetId) {
    setSelectedAsset(selectedAssetId, { suppressTabSwitch: true });
  }
  renderValidation(property);
  renderAudit(property);
  renderContextRail(property);
  saveState();
}

function bindEvents() {
  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTab(button.dataset.tabTarget);
    });
  });

  document.querySelectorAll(".slds-section__title-action").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.closest(".slds-section");
      if (section) section.classList.toggle("slds-is-open");
    });
  });

  els.hierarchySearch?.addEventListener("input", () => {
    const property = getProperty();
    if (!property) return;
    const currentAsset = property.assets.find((a) => a.id === selectedAssetId) || null;
    renderHierarchy(property, currentAsset);
  });

  els.hierarchyTree?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-hierarchy-asset]");
    if (!button) return;
    navigateToRelatedAsset(button.dataset.hierarchyAsset);
  });

  els.createType.addEventListener("change", configureCreateFormByType);

  els.flagsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const property = getProperty();
    if (!property) return;

    const nextPump = els.flagPump.checked;
    const nextSensor = els.flagSensor.checked;

    const hasPumpAsset = activeAssets(property).some((a) => a.type === "Pump");
    const hasSensorAsset = activeAssets(property).some((a) => a.type === "Sensor");

    if (nextPump && !hasPumpAsset) {
      els.flagsMsg.textContent = "Save blocked: Pump System enabled but no Pump asset exists.";
      els.flagPump.checked = property.hasPumpSystem;
      return;
    }

    if (nextSensor && !hasSensorAsset) {
      els.flagsMsg.textContent = "Save blocked: Sensors enabled but no Sensor asset exists.";
      els.flagSensor.checked = property.hasSensors;
      return;
    }

    property.hasPumpSystem = nextPump;
    property.hasSensors = nextSensor;
    if (property.status === "Not Started") {
      property.status = "In Progress";
    }
    addAudit(property, "Edit Property Flags", property.name, `Pump=${nextPump}, Sensors=${nextSensor}`);
    els.flagsMsg.textContent = "Flags saved.";
    renderPage();
  });

  els.createAssetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const property = getProperty();
    if (!property) return;

    const type = els.createType.value;
    const name = els.createName.value.trim();
    if (!name) {
      els.createMsg.textContent = "Name is required.";
      return;
    }

    const base = {
      id: genId("asset"),
      type,
      name,
      status: "Active",
      isPlaceholder: false,
      parentId: null,
      zoneNumber: null,
      controllerLabel: "",
      makeModel: "",
      totalZones: null,
      backflowType: "",
      sensorType: "",
      serialNumber: "",
    };

    if (type === "Controller") {
      const controllerLabel = els.createControllerLabel.value.trim();
      const total = els.createTotalZones.value;
      if (!controllerLabel) {
        els.createMsg.textContent = "Controller Label is required.";
        return;
      }
      if (!total) {
        els.createMsg.textContent = "Total Zones is required.";
        return;
      }
      base.controllerLabel = controllerLabel;
      base.makeModel = els.createMakeModel.value.trim();
      base.totalZones = Number(total);
    }

    if (type === "Zone") {
      const zoneNumber = els.createZoneNumber.value;
      const parentId = els.createZoneController.value;
      if (!zoneNumber) {
        els.createMsg.textContent = "Zone Number is required.";
        return;
      }
      if (!parentId) {
        els.createMsg.textContent = "Parent Controller is required.";
        return;
      }
      base.zoneNumber = Number(zoneNumber);
      base.parentId = parentId;
      base.isPlaceholder = els.createPlaceholder.value === "true";

      if (!uniqueZonePerController(property, base)) {
        els.createMsg.textContent = "Zone Number must be unique per Controller.";
        return;
      }
    }

    if (type === "Backflow") {
      const bfType = els.createBackflowType.value;
      if (!bfType) {
        els.createMsg.textContent = "Backflow Type is required.";
        return;
      }
      base.backflowType = bfType;
      base.serialNumber = els.createSerial.value.trim();
    }

    if (type === "Sensor") {
      const sensorType = els.createSensorType.value;
      const parentId = els.createZoneController.value;
      if (!sensorType) {
        els.createMsg.textContent = "Sensor Type is required.";
        return;
      }
      if (!parentId) {
        els.createMsg.textContent = "Parent Controller is required for Sensors.";
        return;
      }
      base.sensorType = sensorType;
      base.parentId = parentId;
      base.serialNumber = els.createSerial.value.trim();
    }

    if (type === "Valve" || type === "Head" || type === "Drip_Line") {
      const parentZoneId = els.createParentZone.value;
      if (!parentZoneId) {
        els.createMsg.textContent = "Parent Zone is required.";
        return;
      }
      base.parentId = parentZoneId;
    }

    property.assets.push(base);
    if (property.status === "Not Started") {
      property.status = "In Progress";
      addAudit(property, "Auto Status", property.name, "Moved to In Progress after first asset activity");
    }
    addAudit(property, "Create Asset", base.name, `${base.type} created`);
    els.createMsg.textContent = `${base.type} created.`;

    closeAssetModal();
    els.createAssetForm.reset();
    renderPage();
  });

  els.assetTableBody.addEventListener("click", (event) => {
    const selectBtn = event.target.closest("button[data-select-asset]");
    if (selectBtn) {
      navigateToRelatedAsset(selectBtn.dataset.selectAsset);
      return;
    }
    const rowActionBtn = event.target.closest("button[data-row-action]");
    if (rowActionBtn) {
      setSelectedAsset(rowActionBtn.dataset.rowAction);
    }
  });

  els.assetNewBtn.addEventListener("click", openCreateModal);

  els.assetRefreshBtn.addEventListener("click", () => renderPage());

  els.assetModalClose.addEventListener("click", closeAssetModal);
  els.assetModalCancel.addEventListener("click", closeAssetModal);
  els.assetModalBackdrop.addEventListener("click", closeAssetModal);

  els.assetModalSave.addEventListener("click", () => {
    const createVisible = !els.modalCreateSection.classList.contains("hidden");
    if (createVisible) {
      els.createAssetForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    } else {
      els.editAssetForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  });

  els.editAssetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const property = getProperty();
    if (!property) return;

    const asset = property.assets.find((a) => a.id === els.editId.value);
    if (!asset) return;

    const prev = JSON.stringify(asset);
    asset.name = els.editName.value.trim();
    if (!asset.name) {
      els.editMsg.textContent = "Name is required.";
      return;
    }

    const guardResult = applyEditGuards(asset);
    if (!guardResult.ok) {
      els.editMsg.textContent = guardResult.message;
      return;
    }

    if (asset.type === "Zone" && !uniqueZonePerController(property, asset, asset.id)) {
      els.editMsg.textContent = "Zone Number must be unique per Controller.";
      return;
    }

    const next = JSON.stringify(asset);
    if (prev !== next) {
      addAudit(property, "Edit Asset", asset.name, `${asset.type} updated`);
    }

    els.editMsg.textContent = "Asset saved.";
    closeAssetModal();
    renderPage();
  });

  els.retireAsset.addEventListener("click", () => {
    const property = getProperty();
    if (!property) return;

    const asset = property.assets.find((a) => a.id === els.editId.value);
    if (!asset) return;

    if (asset.type === "Controller") {
      const linkedActiveZones = activeAssets(property).filter(
        (a) => a.type === "Zone" && a.parentId === asset.id
      );
      if (linkedActiveZones.length) {
        els.editMsg.textContent =
          "Cannot retire Controller while active Zones are linked. Reassign or retire Zones first.";
        return;
      }
    }

    asset.status = "Retired";
    addAudit(property, "Retire Asset", asset.name, `${asset.type} retired`);
    selectedAssetId = null;
    closeAssetModal();
    renderPage();
  });

  els.actionComplete.addEventListener("click", () => {
    const property = getProperty();
    if (!property) return;
    const val = getValidation(property);
    if (val.issues.length) {
      alert("Setup is blocked. Resolve validation issues first.");
      return;
    }

    const warningText =
      val.warnings.placeholderZones > 0
        ? `Warning: ${val.warnings.placeholderZones} placeholder zone(s) exist. Continue?`
        : "No warnings. Mark setup complete?";

    if (!confirm(warningText)) {
      return;
    }

    property.status = "Complete";
    addAudit(property, "Mark Complete", property.name, "Setup marked complete");
    renderPage();
  });

  els.actionReopen.addEventListener("click", () => {
    const property = getProperty();
    if (!property) return;
    property.status = "In Progress";
    addAudit(property, "Reopen Setup", property.name, "Setup status changed back to In Progress");
    renderPage();
  });

  els.runValidate.addEventListener("click", () => {
    const property = getProperty();
    if (!property) return;
    renderValidation(property, true);
    renderAudit(property);
    saveState();
  });

  els.issueList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-jump-asset]");
    if (!button) return;
    setActiveTab("assets");
    setSelectedAsset(button.dataset.jumpAsset);
  });

  els.toggleRetired.addEventListener("change", renderPage);
}

function init() {
  bindEvents();
  setActiveTab(activeTab);
  renderPage();
}

init();
