const STORAGE_KEY = "desktopAssetSetupPrototypeV3";
const CURRENT_USER = "Prototype User";
const MAP_FEATURE_LIMIT = 250;
const MAP_SYNC_STATES = ["Pending", "Synced", "Failed"];
const MAP_TOOL_KEYS = ["add-point", "add-line", "add-polygon", "move", "delete"];
const SEED_DATA_URL = "seed_data.json";

let seedDataCache = null;

function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}

async function getSeedData() {
  if (seedDataCache) {
    return deepClone(seedDataCache);
  }
  const response = await fetch(SEED_DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load ${SEED_DATA_URL}: ${response.status}`);
  }
  seedDataCache = await response.json();
  return deepClone(seedDataCache);
}

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

function normalizeAssetType(type) {
  const raw = String(type || "").trim();
  const lower = raw.toLowerCase();

  if (lower === "sensor") return "Head";
  if (lower === "drip_line" || lower === "dripline") return "Drip";
  if (lower === "system") return "System";
  if (lower === "controller") return "Controller";
  if (lower === "pump") return "Pump";
  if (lower === "zone") return "Zone";
  if (lower === "backflow") return "Backflow";
  if (lower === "valve") return "Valve";
  if (lower === "head") return "Head";
  if (lower === "drip") return "Drip";
  return raw;
}

function getSampleRelatedData(propertyId) {
  const seed = {
    "prop-001": {
      callouts: [
        {
          id: "callout-001",
          number: "CO-2026-0142",
          createdAt: "2026-05-13T09:05:00.000Z",
          summary: "Zone 2 drip leak near east bed",
          priority: "High",
          status: "Open",
        },
        {
          id: "callout-002",
          number: "CO-2026-0111",
          createdAt: "2026-04-28T15:40:00.000Z",
          summary: "Backflow enclosure lid replacement",
          priority: "Medium",
          status: "Closed",
        },
      ],
      proposals: [
        {
          id: "proposal-001",
          number: "PR-2026-0068",
          createdAt: "2026-05-14T11:20:00.000Z",
          description: "Convert east bed spray heads to matched-precipitation nozzles",
          amount: "$1,250",
          status: "Pending Approval",
        },
        {
          id: "proposal-002",
          number: "PR-2026-0054",
          createdAt: "2026-05-02T08:55:00.000Z",
          description: "Replace aging RPZ backflow assembly",
          amount: "$3,850",
          status: "Draft",
        },
      ],
    },
  };

  return seed[propertyId] || null;
}

function migratePropertyToHierarchy(property) {
  property.assets = Array.isArray(property.assets) ? property.assets : [];

  const hasSystemRoot = typeof property.hasSystemRoot === "boolean" ? property.hasSystemRoot : Boolean(property.hasPumpSystem);
  const trackZoneComponents =
    typeof property.trackZoneComponents === "boolean" ? property.trackZoneComponents : Boolean(property.hasSensors);

  property.hasSystemRoot = hasSystemRoot;
  property.trackZoneComponents = trackZoneComponents;

  property.assets.forEach((asset) => {
    asset.type = normalizeAssetType(asset.type);
    if (asset.type === "System" && !asset.name) {
      asset.name = "Irrigation System";
    }
    if (asset.type === "Zone" && asset.zoneNumber != null) {
      asset.name = `Zone ${asset.zoneNumber}`;
    }
    if (asset.type === "Head") {
      if (!asset.headSubtype && asset.sensorType) {
        asset.headSubtype = asset.sensorType;
      }
      if (!asset.headSubtype) asset.headSubtype = "";
    }
    if (asset.type === "Controller" && !Array.isArray(asset.programs)) {
      asset.programs = [];
    }
    if (asset.type !== "Head") {
      asset.headSubtype = asset.headSubtype || "";
    }
    if (Object.prototype.hasOwnProperty.call(asset, "sensorType")) {
      delete asset.sensorType;
    }
  });

  property.assets.forEach((asset) => {
    if (asset.type !== "Head" || !asset.parentId) return;
    const parent = property.assets.find((candidate) => candidate.id === asset.parentId);
    if (parent && parent.type === "Valve" && parent.parentId) {
      asset.parentId = parent.parentId;
    }
  });

  delete property.hasPumpSystem;
  delete property.hasSensors;

  if (!Array.isArray(property.inspections)) {
    property.inspections = [];
  }
  if (!Array.isArray(property.callouts)) {
    property.callouts = [];
  }
  if (!Array.isArray(property.proposals)) {
    property.proposals = [];
  }

  const sampleRelated = getSampleRelatedData(property.id);
  if (sampleRelated) {
    if (!property.callouts.length) {
      property.callouts = sampleRelated.callouts.map((item) => ({ ...item }));
    }
    if (!property.proposals.length) {
      property.proposals = sampleRelated.proposals.map((item) => ({ ...item }));
    }
  }

  const hasSystemChildren = property.assets.some(
    (a) => a.status !== "Retired" && (a.type === "Controller" || a.type === "Backflow" || a.type === "Pump")
  );
  let system = property.assets.find((a) => a.type === "System" && a.status !== "Retired") || null;

  if ((property.hasSystemRoot || hasSystemChildren) && !system) {
    system = {
      id: `asset-s-migrated-${Math.random().toString(36).slice(2, 8)}`,
      type: "System",
      name: "Irrigation System",
      status: "Active",
      isPlaceholder: false,
      parentId: null,
      zoneNumber: null,
    };
    property.assets.push(system);
  }

  if (hasSystemChildren) {
    property.hasSystemRoot = true;
  }

  if (system) {
    const activeSystemIds = new Set(
      property.assets.filter((a) => a.type === "System" && a.status !== "Retired").map((a) => a.id)
    );
    property.assets.forEach((asset) => {
      if (asset.status === "Retired") return;
      if (
        (asset.type === "Controller" || asset.type === "Backflow" || asset.type === "Pump") &&
        (!asset.parentId || !activeSystemIds.has(asset.parentId))
      ) {
        asset.parentId = system.id;
      }
    });
  }
}

async function loadState() {
  const seed = await getSeedData();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return deepClone(seed);
  }
  let loaded;
  try {
    loaded = JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return deepClone(seed);
  }

  if (!Array.isArray(loaded.properties)) {
    loaded.properties = deepClone(seed.properties || []);
  }

  // Migration: add inspections and Controller programs arrays if missing
  loaded.properties.forEach((prop) => {
    migratePropertyToHierarchy(prop);
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
  return loaded;
}

let state = null;
let selectedAssetId = null;
let activeTab = "details";
let expandedAssets = new Set();

const params = new URLSearchParams(window.location.search);
const propertyId = params.get("property");
const recordAssetIdParam = params.get("asset") || params.get("controller");

const els = {
  recordTitle: document.getElementById("record-title"),
  headerEditBtn: document.getElementById("header-edit-btn"),
  detailEditBtns: document.querySelectorAll(".detail-edit-btn"),
  hierarchyNewBtn: document.getElementById("hierarchy-new-btn"),
  relatedTabButton: document.querySelector("[data-tab-target='inspections']"),
  relatedTabPanel: document.querySelector("[data-tab-panel='inspections']"),
  assetModal: document.getElementById("asset-modal"),
  assetModalBackdrop: document.getElementById("asset-modal-backdrop"),
  assetModalTitle: document.getElementById("asset-modal-title"),
  assetModalClose: document.getElementById("asset-modal-close"),
  assetModalCancel: document.getElementById("asset-modal-cancel"),
  assetModalSave: document.getElementById("asset-modal-save"),
  retireAsset: document.getElementById("retire-asset"),
  modalCreateSection: document.getElementById("modal-create-section"),
  modalEditSection: document.getElementById("modal-edit-section"),
  treeRoot: document.getElementById("tree-root"),
  createAssetForm: document.getElementById("create-asset-form"),
  createType: document.getElementById("create-type"),
  createName: document.getElementById("create-name"),
  createControllerLabel: document.getElementById("create-controller-label"),
  createMakeModel: document.getElementById("create-make-model"),
  createTotalZones: document.getElementById("create-total-zones"),
  createZoneNumber: document.getElementById("create-zone-number"),
  createZoneController: document.getElementById("create-zone-controller"),
  createBackflowType: document.getElementById("create-backflow-type"),
  createHeadSubtype: document.getElementById("create-head-subtype"),
  createParentZone: document.getElementById("create-parent-zone"),
  createParentLabel: document.querySelector("label[for='create-parent-zone']"),
  createSerial: document.getElementById("create-serial"),
  createMsg: document.getElementById("create-msg"),
  editAssetForm: document.getElementById("edit-asset-form"),
  editId: document.getElementById("edit-id"),
  editName: document.getElementById("edit-name"),
  editType: document.getElementById("edit-type"),
  editStatus: document.getElementById("edit-status"),
  editParentSystem: document.getElementById("edit-parent-system"),
  editControllerLabel: document.getElementById("edit-controller-label"),
  editMakeModel: document.getElementById("edit-make-model"),
  editTotalZones: document.getElementById("edit-total-zones"),
  editConnectivityType: document.getElementById("edit-connectivity-type"),
  editSmartController: document.getElementById("edit-smart-controller"),
  editControllerApp: document.getElementById("edit-controller-app"),
  editZoneNumber: document.getElementById("edit-zone-number"),
  editZoneController: document.getElementById("edit-zone-controller"),
  editAreaServed: document.getElementById("edit-area-served"),
  editFlowRateGpm: document.getElementById("edit-flow-rate-gpm"),
  editPrimaryHeadType: document.getElementById("edit-primary-head-type"),
  editBackflowType: document.getElementById("edit-backflow-type"),
  editLastTestDate: document.getElementById("edit-last-test-date"),
  editLastTestResult: document.getElementById("edit-last-test-result"),
  editNextTestDue: document.getElementById("edit-next-test-due"),
  editComplianceStatus: document.getElementById("edit-compliance-status"),
  editTestingAuthority: document.getElementById("edit-testing-authority"),
  editValveType: document.getElementById("edit-valve-type"),
  editValveLocationNotes: document.getElementById("edit-valve-location-notes"),
  editValveCondition: document.getElementById("edit-valve-condition"),
  editHeadSubtype: document.getElementById("edit-head-subtype"),
  editNozzleSize: document.getElementById("edit-nozzle-size"),
  editThrowRadiusFt: document.getElementById("edit-throw-radius-ft"),
  editArcDegrees: document.getElementById("edit-arc-degrees"),
  editEmitterType: document.getElementById("edit-emitter-type"),
  editFlowRateGph: document.getElementById("edit-flow-rate-gph"),
  editEmitterCount: document.getElementById("edit-emitter-count"),
  editCoverageAreaSqft: document.getElementById("edit-coverage-area-sqft"),
  editParentZone: document.getElementById("edit-parent-zone"),
  editParentLabel: document.querySelector("label[for='edit-parent-zone']"),
  editSerial: document.getElementById("edit-serial"),
  editInstallDate: document.getElementById("edit-install-date"),
  editDescription: document.getElementById("edit-description"),
  relatedContext: document.getElementById("related-context"),
  relatedSummary: document.getElementById("related-summary"),
  relatedList: document.getElementById("related-list"),
  mapFeatureCount: document.getElementById("map-feature-count"),
  mapContext: document.getElementById("map-context"),
  mapSyncSummary: document.getElementById("map-sync-summary"),
  mapSelection: document.getElementById("map-selection"),
  mapStage: document.getElementById("map-stage"),
  mapOverlay: document.getElementById("map-overlay"),
  mapBaseFrame: document.getElementById("map-base-frame"),
  mapFeatureList: document.getElementById("map-feature-list"),
  mapMessage: document.getElementById("map-message"),
  mapTypeRoadmap: document.getElementById("map-type-roadmap"),
  mapTypeSatellite: document.getElementById("map-type-satellite"),
  mapTypeHybrid: document.getElementById("map-type-hybrid"),
  mapSymbolLegend: document.getElementById("map-symbol-legend"),
  mapZoomOut: document.getElementById("map-zoom-out"),
  mapZoomIn: document.getElementById("map-zoom-in"),
  mapAddPoint: document.getElementById("map-add-point"),
  mapAddLine: document.getElementById("map-add-line"),
  mapAddPolygon: document.getElementById("map-add-polygon"),
  mapMoveSelected: document.getElementById("map-move-selected"),
  mapDeleteSelected: document.getElementById("map-delete-selected"),
  mapUndo: document.getElementById("map-undo"),
  mapRedo: document.getElementById("map-redo"),
  mapExportKml: document.getElementById("map-export-kml"),
  mapImportKml: document.getElementById("map-import-kml"),
  mapImportKmlInput: document.getElementById("map-import-kml-input"),
  retireAsset: document.getElementById("retire-asset"),
  editMsg: document.getElementById("edit-msg"),
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
  detailTimelineSection: document.getElementById("detail-timeline-section"),
  detailTimeline: document.getElementById("detail-timeline"),
  hierarchyTree: document.getElementById("hierarchy-tree"),
  hierarchySummary: document.getElementById("hierarchy-summary"),
  hierarchySearch: document.getElementById("hierarchy-search"),
  hlProperty: document.getElementById("hl-property"),
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

function updateRelatedTabVisibility(asset) {
  const isParentAsset = Boolean(asset) && !asset.parentId;

  const mapTabButton = document.querySelector("[data-tab-target='map']");
  const mapTabItem = mapTabButton ? mapTabButton.closest(".slds-tabs_default__item") : null;
  const mapTabPanel = document.querySelector("[data-tab-panel='map']");

  if (mapTabButton) {
    mapTabButton.style.display = isParentAsset ? "" : "none";
  }
  if (mapTabItem) {
    mapTabItem.style.display = isParentAsset ? "" : "none";
  }
  if (mapTabPanel) {
    mapTabPanel.style.display = isParentAsset ? "" : "none";
  }

  if (els.relatedTabButton) {
    els.relatedTabButton.style.display = isParentAsset ? "" : "none";
    const relatedTabItem = els.relatedTabButton.closest(".slds-tabs_default__item");
    if (relatedTabItem) {
      relatedTabItem.style.display = isParentAsset ? "" : "none";
    }
  }

  if (els.relatedTabPanel) {
    els.relatedTabPanel.style.display = isParentAsset ? "" : "none";
  }

  if (!isParentAsset && (activeTab === "inspections" || activeTab === "map")) {
    setActiveTab("details");
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function hashNumber(value) {
  let hash = 0;
  const text = String(value || "");
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function ensureMapState(property, contextAsset) {
  if (!property.mapPrototype) {
    property.mapPrototype = {
      selectedFeatureId: "",
      features: [],
      undoStack: [],
      redoStack: [],
      mapType: "hybrid",
      zoom: 18,
      activeTool: "",
    };
  }

  if (!Array.isArray(property.mapPrototype.features)) {
    property.mapPrototype.features = [];
  }
  if (!Array.isArray(property.mapPrototype.undoStack)) {
    property.mapPrototype.undoStack = [];
  }
  if (!Array.isArray(property.mapPrototype.redoStack)) {
    property.mapPrototype.redoStack = [];
  }
  if (!["roadmap", "satellite", "hybrid"].includes(property.mapPrototype.mapType)) {
    property.mapPrototype.mapType = "hybrid";
  }
  if (typeof property.mapPrototype.zoom !== "number") {
    property.mapPrototype.zoom = 18;
  }
  if (!MAP_TOOL_KEYS.includes(property.mapPrototype.activeTool)) {
    property.mapPrototype.activeTool = "";
  }

  if (!property.mapPrototype.features.length && contextAsset) {
    const active = activeAssets(property);
    const parentAssetId = contextAsset.id;
    const parentChildren = active.filter((asset) => asset.parentId === parentAssetId);
    const zones = active.filter((asset) => asset.type === "Zone" && asset.parentId && parentChildren.some((child) => child.id === asset.parentId));

    const seedFeatures = [];
    parentChildren
      .filter((asset) => asset.type === "Controller" || asset.type === "Backflow" || asset.type === "Pump")
      .forEach((asset, idx) => {
        seedFeatures.push({
          id: genId("mapf"),
          type: "Point",
          name: asset.name || `Point ${idx + 1}`,
          assetType: normalizeMapAssetType(asset.type),
          status: "Active",
          syncState: "Synced",
          linkedAssetId: asset.id,
        });
      });

    zones.slice(0, 24).forEach((asset, idx) => {
      seedFeatures.push({
        id: genId("mapf"),
        type: idx % 2 === 0 ? "Polygon" : "Line",
        name: asset.name || `Zone ${idx + 1}`,
        assetType: "zone",
        status: "Active",
        syncState: "Synced",
        linkedAssetId: asset.id,
      });
    });

    property.mapPrototype.features = seedFeatures.slice(0, MAP_FEATURE_LIMIT);
  }

  property.mapPrototype.features.forEach((feature) => {
    feature.assetType = inferAssetTypeFromName(feature.name, feature.assetType);
  });

  return property.mapPrototype;
}

function mapSnapshot(mapState) {
  return {
    selectedFeatureId: mapState.selectedFeatureId || "",
    features: cloneJson(mapState.features || []),
  };
}

function pushMapHistory(mapState) {
  mapState.undoStack.push(mapSnapshot(mapState));
  if (mapState.undoStack.length > 40) {
    mapState.undoStack.shift();
  }
  mapState.redoStack = [];
}

function restoreMapSnapshot(mapState, snapshot) {
  mapState.selectedFeatureId = snapshot.selectedFeatureId || "";
  mapState.features = cloneJson(snapshot.features || []);
}

function mapFeaturePosition(feature) {
  const h1 = hashNumber(`${feature.id}:${feature.name}`);
  const h2 = hashNumber(`${feature.type}:${feature.id}`);
  return {
    left: (h1 % 84) + 8,
    top: (h2 % 78) + 8,
  };
}

function mapSyncClass(syncState) {
  if (syncState === "Failed") return "map-sync-failed";
  if (syncState === "Pending") return "map-sync-pending";
  return "map-sync-synced";
}

function normalizeMapAssetType(assetType) {
  const value = String(assetType || "").trim().toLowerCase();
  const valid = ["controller", "backflow", "pump", "zone", "valve", "head", "drip"];
  if (valid.includes(value)) return value;
  return "generic";
}

function inferAssetTypeFromName(name, fallback = "generic") {
  const text = String(name || "").toLowerCase();
  if (text.includes("controller")) return "controller";
  if (text.includes("backflow")) return "backflow";
  if (text.includes("pump")) return "pump";
  if (text.includes("zone")) return "zone";
  if (text.includes("valve")) return "valve";
  if (text.includes("head") || text.includes("spray") || text.includes("rotor")) return "head";
  if (text.includes("drip") || text.includes("emitter")) return "drip";
  return normalizeMapAssetType(fallback);
}

function mapSymbolSpec(assetType) {
  const key = normalizeMapAssetType(assetType);
  const spec = {
    controller: { code: "CTR", label: "Controller" },
    backflow: { code: "BFL", label: "Backflow" },
    pump: { code: "PMP", label: "Pump" },
    zone: { code: "ZON", label: "Zone" },
    valve: { code: "VLV", label: "Valve" },
    head: { code: "HED", label: "Head" },
    drip: { code: "DRP", label: "Drip" },
    generic: { code: "GEN", label: "Generic" },
  };
  return { key, ...spec[key] };
}

function googleMapTypeCode(mapType) {
  if (mapType === "satellite") return "k";
  if (mapType === "hybrid") return "h";
  return "m";
}

function getMapEmbedUrl(property, contextAsset, mapType, zoom) {
  const locationHint = `${contextAsset?.name || "Irrigation property"}, ${property?.name || ""}`.trim();
  const encoded = encodeURIComponent(locationHint);
  const typeCode = googleMapTypeCode(mapType);
  const z = Math.max(14, Math.min(21, Number(zoom) || 18));
  return `https://maps.google.com/maps?q=${encoded}&t=${typeCode}&z=${z}&output=embed`;
}

function buildKml(features) {
  const placemarks = features
    .map((feature) => `\n    <Placemark><name>${feature.name}</name><description>${feature.type}|${feature.syncState || "Synced"}</description><Point><coordinates>-77.0365,38.8977,0</coordinates></Point></Placemark>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document>${placemarks}\n  </Document>\n</kml>`;
}

function parseKmlNames(kmlText) {
  const names = [];
  const nameRegex = /<name>([^<]+)<\/name>/gi;
  let match = nameRegex.exec(kmlText);
  while (match) {
    names.push(match[1].trim());
    match = nameRegex.exec(kmlText);
  }
  return names;
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

function renderControllerOptions(selectEl, includeBlank = true) {
  const property = getProperty();
  if (!property) return;
  const controllers = activeAssets(property).filter((a) => a.type === "Controller");

  selectEl.innerHTML = `${includeBlank ? "<option value=''>Select</option>" : ""}${controllers
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("")}`;
}

function renderSystemOptions(selectEl, includeBlank = true) {
  const property = getProperty();
  if (!property) return;
  const systems = activeAssets(property).filter((a) => a.type === "System");

  selectEl.innerHTML = `${includeBlank ? "<option value=''>Select</option>" : ""}${systems
    .map((s) => `<option value="${s.id}">${s.name}</option>`)
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

function renderParentOptionsByType(selectEl, type, includeBlank = true) {
  renderZoneOptions(selectEl, includeBlank);
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

function syncZoneNameField(nameField, zoneNumberField, isZone) {
  if (!nameField) return;
  if (!isZone) {
    nameField.readOnly = false;
    nameField.required = true;
    return;
  }

  const zoneNumber = zoneNumberField?.value ? Number(zoneNumberField.value) : null;
  nameField.readOnly = true;
  nameField.required = false;
  nameField.value = zoneNumber ? `Zone ${zoneNumber}` : "Zone";
}

function configureCreateFormByType() {
  const type = els.createType.value;

  const isController = type === "Controller";
  const isPump = type === "Pump";
  const isZone = type === "Zone";
  const isBackflow = type === "Backflow";
  const isZoneChild = type === "Valve" || type === "Head" || type === "Drip";
  syncZoneNameField(els.createName, els.createZoneNumber, isZone);

  setFormFieldState(els.createControllerLabel, { visible: isController, required: isController });
  setFormFieldState(els.createMakeModel, { visible: isController || isPump, required: false });
  setFormFieldState(els.createTotalZones, { visible: isController, required: isController });

  setFormFieldState(els.createZoneNumber, { visible: isZone, required: isZone });
  setFormFieldState(els.createZoneController, { visible: isZone, required: isZone });

  setFormFieldState(els.createBackflowType, { visible: isBackflow, required: isBackflow });
  setFormFieldState(els.createHeadSubtype, { visible: type === "Head", required: false });
  setFormFieldState(els.createParentZone, { visible: isZoneChild, required: isZoneChild });

  setFormFieldState(els.createSerial, { visible: isBackflow || isPump, required: false });

  if (isZoneChild) {
    renderParentOptionsByType(els.createParentZone, type);
  }
  if (els.createParentLabel) {
    els.createParentLabel.textContent = "Parent Zone";
  }
}

function configureEditFormByType(type) {
  const isController = type === "Controller";
  const isPump = type === "Pump";
  const isZone = type === "Zone";
  const isBackflow = type === "Backflow";
  const isValve = type === "Valve";
  const isHead = type === "Head";
  const isDrip = type === "Drip";
  const isSystem = type === "System";
  const isZoneChild = type === "Valve" || type === "Head" || type === "Drip";
  const usesSystemParent = isController || isBackflow || isPump;
  syncZoneNameField(els.editName, els.editZoneNumber, isZone);

  setFormFieldState(els.editParentSystem, { visible: usesSystemParent, required: false });
  setFormFieldState(els.editControllerLabel, { visible: isController, required: isController });
  setFormFieldState(els.editMakeModel, { visible: isController || isPump, required: false });
  setFormFieldState(els.editTotalZones, { visible: isController, required: isController });
  setFormFieldState(els.editConnectivityType, { visible: isController, required: false });
  setFormFieldState(els.editSmartController, { visible: isController, required: false });
  setFormFieldState(els.editControllerApp, { visible: isController, required: false });

  setFormFieldState(els.editZoneNumber, { visible: isZone, required: isZone });
  setFormFieldState(els.editZoneController, { visible: isZone, required: isZone });
  setFormFieldState(els.editAreaServed, { visible: isZone, required: false });
  setFormFieldState(els.editFlowRateGpm, { visible: isZone, required: false });
  setFormFieldState(els.editPrimaryHeadType, { visible: isZone, required: false });

  setFormFieldState(els.editBackflowType, { visible: isBackflow, required: isBackflow });
  setFormFieldState(els.editLastTestDate, { visible: isBackflow, required: false });
  setFormFieldState(els.editLastTestResult, { visible: isBackflow, required: false });
  setFormFieldState(els.editNextTestDue, { visible: isBackflow, required: false });
  setFormFieldState(els.editComplianceStatus, { visible: isBackflow, required: false });
  setFormFieldState(els.editTestingAuthority, { visible: isBackflow, required: false });

  setFormFieldState(els.editValveType, { visible: isValve, required: false });
  setFormFieldState(els.editValveLocationNotes, { visible: isValve, required: false });
  setFormFieldState(els.editValveCondition, { visible: isValve, required: false });

  setFormFieldState(els.editHeadSubtype, { visible: isHead, required: false });
  setFormFieldState(els.editNozzleSize, { visible: isHead, required: false });
  setFormFieldState(els.editThrowRadiusFt, { visible: isHead, required: false });
  setFormFieldState(els.editArcDegrees, { visible: isHead, required: false });

  setFormFieldState(els.editEmitterType, { visible: isDrip, required: false });
  setFormFieldState(els.editFlowRateGph, { visible: isDrip, required: false });
  setFormFieldState(els.editEmitterCount, { visible: isDrip, required: false });
  setFormFieldState(els.editCoverageAreaSqft, { visible: isDrip, required: false });

  setFormFieldState(els.editParentZone, { visible: isZoneChild, required: isZoneChild });
  if (els.editParentLabel) {
    els.editParentLabel.textContent = "Parent Zone";
  }

  setFormFieldState(els.editSerial, { visible: isBackflow || isSystem || isPump, required: false });
  setFormFieldState(els.editInstallDate, { visible: isSystem || isController || isPump || isZone || isBackflow || isValve || isHead || isDrip, required: false });
  setFormFieldState(els.editDescription, { visible: isSystem || isPump || isValve, required: false });
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
    const parentId = contextAsset.parentId || null;

    if (parentId) {
      relatedIds.add(parentId);
    }

    scopePool
      .filter((asset) => asset.parentId === contextAsset.parentId || asset.parentId === contextAsset.id)
      .forEach((asset) => relatedIds.add(asset.id));

    displayed = scopePool.filter((asset) => relatedIds.has(asset.id));
    subtitleScope = `Related to ${contextAsset.name} (parent, siblings, children)`;

    const parentAsset = parentId ? scopePool.find((asset) => asset.id === parentId) : null;
    const selectedAsset = scopePool.find((asset) => asset.id === contextAsset.id) || contextAsset;
    const children = displayed
      .filter((asset) => asset.parentId === contextAsset.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    const siblings = displayed
      .filter((asset) => asset.parentId === parentId && asset.id !== contextAsset.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    const ordered = [];
    if (parentAsset) ordered.push(parentAsset);
    if (selectedAsset) ordered.push(selectedAsset);
    ordered.push(...siblings, ...children);
    const seen = new Set();
    displayed = ordered.filter((asset) => {
      if (!asset || seen.has(asset.id)) return false;
      seen.add(asset.id);
      return true;
    });
  }

  const sorted =
    contextAsset && contextAsset.type !== "Controller"
      ? [...displayed]
      : [...displayed].sort((a, b) => a.name.localeCompare(b.name));

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
  renderParentOptionsByType(els.createParentZone, els.createType.value);
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
    setActiveTab("hierarchy");
  }

  selectedAssetId = assetId;

  els.editId.value = asset.id;
  els.editName.value = asset.name || "";
  els.editType.value = asset.type || "";
  els.editStatus.value = asset.status || "Active";
  els.editControllerLabel.value = asset.controllerLabel || "";
  els.editMakeModel.value = asset.makeModel || "";
  els.editTotalZones.value = asset.totalZones ?? "";
  els.editConnectivityType.value = asset.connectivityType || "";
  els.editSmartController.value =
    asset.isSmartController === true ? "true" : asset.isSmartController === false ? "false" : "";
  els.editControllerApp.value = asset.controllerApp || "";
  els.editZoneNumber.value = asset.zoneNumber ?? "";
  els.editAreaServed.value = asset.areaServed || "";
  els.editFlowRateGpm.value = asset.flowRateGpm ?? "";
  els.editPrimaryHeadType.value = asset.primaryHeadType || "";
  els.editBackflowType.value = asset.backflowType || "";
  els.editLastTestDate.value = asset.lastTestDate || "";
  els.editLastTestResult.value = asset.lastTestResult || "";
  els.editNextTestDue.value = asset.nextTestDue || "";
  els.editComplianceStatus.value = asset.complianceStatus || "";
  els.editTestingAuthority.value = asset.testingAuthority || "";
  els.editValveType.value = asset.valveType || "";
  els.editValveLocationNotes.value = asset.valveLocationNotes || "";
  els.editValveCondition.value = asset.valveCondition || "";
  els.editHeadSubtype.value = asset.headSubtype || "";
  els.editNozzleSize.value = asset.nozzleSize || "";
  els.editThrowRadiusFt.value = asset.throwRadiusFt ?? "";
  els.editArcDegrees.value = asset.arcDegrees ?? "";
  els.editEmitterType.value = asset.emitterType || "";
  els.editFlowRateGph.value = asset.flowRateGph ?? "";
  els.editEmitterCount.value = asset.emitterCount ?? "";
  els.editCoverageAreaSqft.value = asset.coverageAreaSqft ?? "";
  els.editSerial.value = asset.serialNumber || "";
  els.editInstallDate.value = asset.installDate || "";
  els.editDescription.value = asset.description || "";
  syncZoneNameField(els.editName, els.editZoneNumber, asset.type === "Zone");
  renderControllerOptions(els.editZoneController);
  els.editZoneController.value = asset.parentId || "";
  renderSystemOptions(els.editParentSystem);
  els.editParentSystem.value = asset.parentId || "";
  renderParentOptionsByType(els.editParentZone, asset.type);
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
  const property = getProperty();

  if (asset.type === "System") {
    asset.description = els.editDescription.value.trim();
    asset.installDate = els.editInstallDate.value || "";
    asset.serialNumber = els.editSerial.value.trim();
    asset.zoneNumber = null;
    asset.parentId = null;
    asset.backflowType = "";
    asset.headSubtype = "";
    return { ok: true };
  }

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
    asset.connectivityType = els.editConnectivityType.value || "";
    asset.isSmartController =
      els.editSmartController.value === "" ? null : els.editSmartController.value === "true";
    asset.controllerApp = els.editControllerApp.value.trim();
    asset.installDate = els.editInstallDate.value || "";

    const system = property ? activeAssets(property).find((a) => a.type === "System" && a.id === els.editParentSystem.value) || activeAssets(property).find((a) => a.type === "System") : null;
    asset.zoneNumber = null;
    asset.parentId = system ? system.id : null;
    asset.backflowType = "";
    asset.headSubtype = "";
    asset.serialNumber = "";
    return { ok: true };
  }

  if (asset.type === "Pump") {
    asset.makeModel = els.editMakeModel.value.trim();
    asset.serialNumber = els.editSerial.value.trim();
    asset.installDate = els.editInstallDate.value || "";
    asset.description = els.editDescription.value.trim();

    const system = property ? activeAssets(property).find((a) => a.type === "System" && a.id === els.editParentSystem.value) || activeAssets(property).find((a) => a.type === "System") : null;
    asset.zoneNumber = null;
    asset.parentId = system ? system.id : null;
    asset.backflowType = "";
    asset.headSubtype = "";
    asset.controllerLabel = "";
    asset.totalZones = null;
    return { ok: true };
  }

  if (asset.type === "Zone") {
    const zoneNumber = Number(els.editZoneNumber.value);
    const parentId = els.editZoneController.value;
    if (!zoneNumber || !parentId) {
      return { ok: false, message: "Zone Number and Parent Controller are required for Zones." };
    }

    asset.zoneNumber = zoneNumber;
    asset.name = `Zone ${zoneNumber}`;
    asset.parentId = parentId;
    asset.areaServed = els.editAreaServed.value.trim();
    asset.flowRateGpm =
      els.editFlowRateGpm.value === "" ? null : Number(els.editFlowRateGpm.value);
    asset.primaryHeadType = els.editPrimaryHeadType.value || "";
    asset.installDate = els.editInstallDate.value || "";

    asset.controllerLabel = "";
    asset.makeModel = "";
    asset.totalZones = null;
    asset.backflowType = "";
    asset.headSubtype = "";
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
    asset.lastTestDate = els.editLastTestDate.value || "";
    asset.lastTestResult = els.editLastTestResult.value || "";
    asset.nextTestDue = els.editNextTestDue.value || "";
    asset.complianceStatus = els.editComplianceStatus.value || "";
    asset.testingAuthority = els.editTestingAuthority.value.trim();
    asset.installDate = els.editInstallDate.value || "";

    asset.controllerLabel = "";
    asset.makeModel = "";
    asset.totalZones = null;
    const system = property ? activeAssets(property).find((a) => a.type === "System" && a.id === els.editParentSystem.value) || activeAssets(property).find((a) => a.type === "System") : null;
    asset.zoneNumber = null;
    asset.parentId = system ? system.id : null;
    asset.isPlaceholder = false;
    asset.headSubtype = "";
    return { ok: true };
  }

  if (asset.type === "Valve" || asset.type === "Head" || asset.type === "Drip") {
    const parentId = els.editParentZone.value;
    if (!parentId) {
      return { ok: false, message: "Parent Zone is required." };
    }

    asset.parentId = parentId;
    asset.installDate = els.editInstallDate.value || "";

    asset.controllerLabel = "";
    asset.makeModel = "";
    asset.totalZones = null;
    asset.zoneNumber = null;
    asset.isPlaceholder = false;
    asset.backflowType = "";
    if (asset.type === "Valve") {
      asset.valveType = els.editValveType.value || "";
      asset.valveLocationNotes = els.editValveLocationNotes.value.trim();
      asset.valveCondition = els.editValveCondition.value || "";
      asset.description = els.editDescription.value.trim();
      asset.headSubtype = "";
      asset.nozzleSize = "";
      asset.throwRadiusFt = null;
      asset.arcDegrees = null;
      asset.emitterType = "";
      asset.flowRateGph = null;
      asset.emitterCount = null;
      asset.coverageAreaSqft = null;
    } else if (asset.type === "Head") {
      asset.headSubtype = els.editHeadSubtype.value || "";
      asset.nozzleSize = els.editNozzleSize.value.trim();
      asset.throwRadiusFt =
        els.editThrowRadiusFt.value === "" ? null : Number(els.editThrowRadiusFt.value);
      asset.arcDegrees =
        els.editArcDegrees.value === "" ? null : Number(els.editArcDegrees.value);
      asset.valveType = "";
      asset.valveLocationNotes = "";
      asset.valveCondition = "";
      asset.description = "";
      asset.emitterType = "";
      asset.flowRateGph = null;
      asset.emitterCount = null;
      asset.coverageAreaSqft = null;
    } else {
      asset.emitterType = els.editEmitterType.value || "";
      asset.flowRateGph =
        els.editFlowRateGph.value === "" ? null : Number(els.editFlowRateGph.value);
      asset.emitterCount =
        els.editEmitterCount.value === "" ? null : Number(els.editEmitterCount.value);
      asset.coverageAreaSqft =
        els.editCoverageAreaSqft.value === "" ? null : Number(els.editCoverageAreaSqft.value);
      asset.valveType = "";
      asset.valveLocationNotes = "";
      asset.valveCondition = "";
      asset.description = "";
      asset.headSubtype = "";
      asset.nozzleSize = "";
      asset.throwRadiusFt = null;
      asset.arcDegrees = null;
    }
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
  asset.headSubtype = "";
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
          ? "Retire impact: consider creating another backflow before retiring this record."
          : "Retire impact: another backflow remains active at this property.",
      ],
    };
  }

  const sameTypeCount = assets.filter((a) => a.type === asset.type).length;
  return {
    summary: `${sameTypeCount} active asset(s) of type ${asset.type}.`,
    lines: ["Retire impact: review parent-child dependencies before retiring."],
  };
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
  const systems = assets.filter((a) => a.type === "System").length;
  const controllers = assets.filter((a) => a.type === "Controller").length;
  const pumps = assets.filter((a) => a.type === "Pump").length;
  const zones = assets.filter((a) => a.type === "Zone").length;
  const components = assets.filter((a) => a.type === "Valve" || a.type === "Head" || a.type === "Drip").length;
  const backflows = assets.filter((a) => a.type === "Backflow").length;
  els.hlProperty.textContent = property.name;
  els.hlOwner.textContent = property.assignedManager;
  els.hlStatus.textContent = property.status;
  els.hlBranch.textContent = property.branch;
  els.hlUpdated.textContent = fmtDate(property.updatedAt);

  els.railRelatedList.innerHTML = [
    `Property Account: ${property.name}`,
    `Systems: ${systems}`,
    `Controllers: ${controllers}`,
    `Pumps: ${pumps}`,
    `Zones: ${zones}`,
    `Zone Components: ${components}`,
    `Backflows: ${backflows}`,
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

function renderTimeline(property, asset = null) {
  const isParentAsset = Boolean(asset) && !asset.parentId;
  if (els.detailTimelineSection) {
    els.detailTimelineSection.classList.toggle("hidden", !isParentAsset);
  }

  if (!isParentAsset) {
    return;
  }

  const timelineItems = [];

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
    path.unshift(cursor);
    cursor = property.assets.find((a) => a.id === cursor.parentId) || null;
  }
  return path;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function assetRecordHref(assetId) {
  const next = new URLSearchParams(window.location.search);
  if (propertyId) {
    next.set("property", propertyId);
  }
  next.set("asset", assetId);
  return `property_record.html?${next.toString()}`;
}

function getAssetDisplayTitle(asset) {
  if (!asset) return "";
  if (asset.type === "Zone" && asset.zoneNumber != null) {
    return `Zone ${asset.zoneNumber}`;
  }
  return asset.name || asset.type || "";
}

function renderHierarchy(property, contextAsset = null) {
  const term = (els.hierarchySearch?.value || "").trim().toLowerCase();
  const assets = activeAssets(property);
  const byParent = new Map();
  const descendantMatchCache = new Map();

  assets.forEach((asset) => {
    const parentKey = asset.parentId || "root";
    if (!byParent.has(parentKey)) {
      byParent.set(parentKey, []);
    }
    byParent.get(parentKey).push(asset);
  });

  byParent.forEach((group) => group.sort((a, b) => a.name.localeCompare(b.name)));

  // Count all descendants recursively
  function countAllDescendants(assetId) {
    const directChildren = byParent.get(assetId) || [];
    let total = directChildren.length;
    directChildren.forEach((child) => {
      total += countAllDescendants(child.id);
    });
    return total;
  }

  function nodeMatches(asset) {
    if (!term) return true;
    const haystack = `${asset.name} ${asset.type} ${asset.controllerLabel || ""} ${asset.backflowType || ""}`.toLowerCase();
    return haystack.includes(term);
  }

  function hasMatchingDescendant(assetId) {
    if (!term) return true;
    if (descendantMatchCache.has(assetId)) {
      return descendantMatchCache.get(assetId);
    }
    const children = byParent.get(assetId) || [];
    const result = children.some((child) => nodeMatches(child) || hasMatchingDescendant(child.id));
    descendantMatchCache.set(assetId, result);
    return result;
  }

  function renderNode(asset) {
    const children = byParent.get(asset.id) || [];
    const hasChildren = children.length > 0;
    const hasMatchingChildren = children.some((child) => nodeMatches(child) || hasMatchingDescendant(child.id));
    const isExpanded = expandedAssets.has(asset.id);
    const shouldExpand = term ? isExpanded || hasMatchingChildren : isExpanded;
    const totalDescendants = countAllDescendants(asset.id);
    const childHtml = shouldExpand ? children.map(renderNode).join("") : "";
    const matches = nodeMatches(asset) || hasMatchingChildren;
    if (!matches) {
      return "";
    }

    const isSelected = selectedAssetId === asset.id;
    const line2 = asset.type === "Zone" ? asset.type : asset.type;

    const toggleBtn = hasChildren
      ? `<button type="button" class="tree-toggle" data-tree-toggle="${asset.id}" title="${shouldExpand ? 'Collapse' : 'Expand'}" aria-expanded="${shouldExpand}"><svg class="slds-icon slds-icon_x-small" aria-hidden="true"><use xlink:href="https://cdnjs.cloudflare.com/ajax/libs/design-system/2.22.0/icons/utility-sprite/svg/symbols.svg#chevronright"></use></svg></button>`
      : `<span class="tree-toggle-placeholder"></span>`;

    const countBadge = totalDescendants > 0 ? `<span class="tree-count-badge" title="Total child assets including zones">${totalDescendants}</span>` : "";

    return `<div class="tree-node ${isSelected ? "tree-node-selected" : ""} ${shouldExpand && hasChildren ? "tree-node-expanded" : ""}">
      <div class="tree-node-header">
        ${toggleBtn}
        <button type="button" class="tree-node-btn" data-hierarchy-asset="${asset.id}">
          <span class="tree-node-title">${escapeHtml(getAssetDisplayTitle(asset))}</span>
          <span class="tree-node-subtitle">${line2}${countBadge}</span>
        </button>
      </div>
      ${hasChildren && shouldExpand ? `<div class="tree-children">${childHtml}</div>` : ""}
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
    const breadcrumb = getAssetPath(property, selected)
      .map((node) => `<a class="slds-text-link" href="${assetRecordHref(node.id)}">${escapeHtml(getAssetDisplayTitle(node))}</a>`)
      .join(" &gt; ");
    els.hierarchySummary.innerHTML = `${prefix}: ${breadcrumb}`;
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
    const firstValue = (...values) => {
      for (const value of values) {
        if (value === 0) return value;
        if (value === false) return value;
        if (value !== undefined && value !== null && value !== "") return value;
      }
      return null;
    };
    const asDate = (value) => (value ? fmtDate(value) : blank);
    const asBool = (value) => (value === true ? "Yes" : value === false ? "No" : blank);
    const joinValues = (labelA, valueA, labelB, valueB) => {
      const parts = [];
      if (valueA != null && valueA !== "" && valueA !== blank) parts.push(`${labelA}: ${valueA}`);
      if (valueB != null && valueB !== "" && valueB !== blank) parts.push(`${labelB}: ${valueB}`);
      return parts.length ? parts.join(" | ") : blank;
    };
    const parentName = parent ? parent.name : blank;

    let leftFields = [];
    let rightFields = [];

    if (asset.type === "Controller") {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Parent Asset", value: parentName },
        { label: "Controller Label", value: firstValue(asset.controllerLabel) },
        { label: "Make / Model", value: firstValue(asset.makeModel, asset.controllerMake) },
      ];
      rightFields = [
        { label: "Status", value: asset.status },
        { label: "Total Zones", value: firstValue(asset.totalZones, asset.zoneCount) },
        { label: "Connectivity Type", value: firstValue(asset.connectivityType) },
        { label: "App / Platform", value: firstValue(asset.controllerApp, asDate(firstValue(asset.installDate))) },
      ];
    } else if (asset.type === "Pump") {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Make", value: firstValue(asset.makeModel) },
        { label: "Parent Asset", value: parentName },
        { label: "Description", value: asset.description },
      ];
      rightFields = [
        { label: "Status", value: asset.status },
        { label: "Serial Number", value: firstValue(asset.serialNumber) },
        { label: "Install Date", value: asDate(asset.installDate) },
        { label: "Linked Child Assets", value: childCount },
      ];
    } else if (asset.type === "Zone") {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Zone Number", value: asset.zoneNumber },
        { label: "Area Served", value: firstValue(asset.areaServed, asset.description) },
        { label: "Flow Rate (GPM)", value: firstValue(asset.flowRateGpm) },
      ];
      rightFields = [
        { label: "Primary Head Type", value: firstValue(asset.primaryHeadType) },
        { label: "Controller Asset", value: parentName },
        { label: "Status", value: asset.status },
        { label: "Install Date", value: asDate(asset.installDate) },
      ];
    } else if (asset.type === "Backflow") {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Parent Asset", value: parentName },
        { label: "Backflow Type", value: firstValue(asset.backflowType) },
        { label: "Serial Number", value: firstValue(asset.serialNumber) },
        { label: "Compliance Status", value: firstValue(asset.complianceStatus) },
      ];
      rightFields = [
        { label: "Status", value: asset.status },
        { label: "Install Date", value: asDate(firstValue(asset.installDate)) },
        {
          label: "Last Test",
          value: joinValues("Date", asDate(firstValue(asset.lastTestDate)), "Result", firstValue(asset.lastTestResult)),
        },
        {
          label: "Compliance / Next Due",
          value: joinValues("Status", firstValue(asset.complianceStatus), "Due", asDate(firstValue(asset.nextTestDue))),
        },
      ];
    } else if (asset.type === "Valve") {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Valve Type", value: firstValue(asset.valveType) },
        { label: "Zone Association", value: parentName },
        { label: "Valve Location Notes", value: firstValue(asset.valveLocationNotes, asset.description) },
      ];
      rightFields = [
        { label: "Condition", value: firstValue(asset.valveCondition) },
        { label: "Parent Asset", value: parentName },
        { label: "Status", value: asset.status },
        { label: "Install Date", value: asDate(asset.installDate) },
      ];
    } else if (asset.type === "Head") {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Head Type", value: firstValue(asset.headSubtype, asset.headType) },
        { label: "Nozzle Size", value: firstValue(asset.nozzleSize) },
        { label: "Throw Radius (ft)", value: firstValue(asset.throwRadiusFt) },
      ];
      rightFields = [
        { label: "Arc (degrees)", value: firstValue(asset.arcDegrees) },
        { label: "Zone Association", value: parentName },
        { label: "Status", value: asset.status },
        { label: "Install Date", value: asDate(asset.installDate) },
      ];
    } else if (asset.type === "Drip") {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Emitter Type", value: firstValue(asset.emitterType) },
        { label: "Flow Rate (GPH)", value: firstValue(asset.flowRateGph) },
        { label: "Emitter Count", value: firstValue(asset.emitterCount) },
      ];
      rightFields = [
        { label: "Coverage Area (sq ft)", value: firstValue(asset.coverageAreaSqft) },
        { label: "Zone Association", value: parentName },
        { label: "Status", value: asset.status },
        { label: "Install Date", value: asDate(asset.installDate) },
      ];
    } else if (asset.type === "System") {
      leftFields = [
        { label: "Name", value: asset.name },
        { label: "Asset Type", value: asset.type },
        { label: "Property Account", value: property.name },
        { label: "Description", value: asset.description },
        null,
      ];
      rightFields = [
        { label: "Status", value: asset.status },
        { label: "Install Date", value: asDate(asset.installDate) },
        { label: "Serial Number", value: firstValue(asset.serialNumber) },
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
        { label: "Install Date", value: asDate(asset.installDate) },
        { label: "Linked Child Assets", value: childCount },
      ];
    }

    leftSlots.forEach((slot, idx) => applySlot(slot, leftFields[idx] || null));
    rightSlots.forEach((slot, idx) => applySlot(slot, rightFields[idx] || null));
  }

  const firstAudit = property.audit.length ? property.audit[property.audit.length - 1] : null;
  els.detailCreatedBy.textContent = firstAudit ? `${firstAudit.user}, ${fmtDate(firstAudit.when)}` : "Prototype User";
  els.detailModifiedBy.textContent = `Prototype User, ${fmtDate(property.updatedAt)}`;
}

function renderPrograms(property, controllerAsset) {
  const programsCard = document.getElementById("programs-card");
  const programsTableBody = document.getElementById("programs-table-body");
  const programsCount = document.getElementById("programs-count");
  if (!programsCard || !programsTableBody) return;

  if (!controllerAsset || controllerAsset.type !== "Controller") {
    programsCard.classList.add("hidden");
    return;
  }

  programsCard.classList.remove("hidden");
  const programs = controllerAsset.programs || [];
  if (programsCount) programsCount.textContent = `(${programs.length})`;

  if (!programs.length) {
    programsTableBody.innerHTML = `<tr><td colspan="8" class="slds-text-align_center slds-p-around_medium slds-text-color_weak">No programs. Click New Program to create the first schedule.</td></tr>`;
    return;
  }

  const zones = activeAssets(property).filter((a) => a.type === "Zone");
  const ICON_BASE = "https://cdnjs.cloudflare.com/ajax/libs/design-system/2.22.0/icons";
  programsTableBody.innerHTML = programs
    .map((prog) => {
      const zone = zones.find((z) => z.id === prog.zoneAssetId);
      const zoneName = zone ? zone.name : (prog.zoneAssetId ? prog.zoneAssetId : "—");
      const days = prog.scheduleDays && prog.scheduleDays.length ? prog.scheduleDays.join("/") : "—";
      const activeBadge = prog.isActive
        ? `<span class="slds-badge slds-theme_success" style="font-size:0.7rem">Active</span>`
        : `<span class="slds-badge" style="font-size:0.7rem">Inactive</span>`;
      const adjust = prog.seasonalAdjustPct != null ? prog.seasonalAdjustPct + "%" : "—";
      return `<tr class="slds-hint-parent">
        <td data-label="Program Name">
          <button class="slds-button slds-button_reset slds-text-link" type="button" data-edit-program="${prog.id}">${prog.programName}</button>
        </td>
        <td data-label="Days">${days}</td>
        <td data-label="Start">${prog.startTime || "—"}</td>
        <td data-label="Zone">${zoneName}</td>
        <td data-label="Run (min)">${prog.runTimeMinutes != null ? prog.runTimeMinutes : "—"}</td>
        <td data-label="Seasonal %">${adjust}</td>
        <td data-label="Active">${activeBadge}</td>
        <td style="width:3rem">
          <button class="slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small" data-delete-program="${prog.id}" type="button" title="Delete Program">
            <svg class="slds-button__icon" aria-hidden="true">
              <use xlink:href="${ICON_BASE}/utility-sprite/svg/symbols.svg#delete"></use>
            </svg>
            <span class="slds-assistive-text">Delete Program</span>
          </button>
        </td>
      </tr>`;
    })
    .join("");
}

function renderRelated(property) {
  const saBody = document.getElementById("inspections-table-body");
  const saCountEl = document.getElementById("inspections-count");
  const calloutsBody = document.getElementById("callouts-table-body");
  const calloutsCountEl = document.getElementById("callouts-count");
  const proposalsBody = document.getElementById("proposals-table-body");
  const proposalsCountEl = document.getElementById("proposals-count");

  const inspections = property.inspections || [];
  const callouts = property.callouts || [];
  const proposals = property.proposals || [];

  if (saCountEl) saCountEl.textContent = `(${inspections.length})`;
  if (calloutsCountEl) calloutsCountEl.textContent = `(${callouts.length})`;
  if (proposalsCountEl) proposalsCountEl.textContent = `(${proposals.length})`;

  if (saBody) {
    if (!inspections.length) {
      saBody.innerHTML = `<tr><td colspan="7" class="slds-text-align_center slds-p-around_medium slds-text-color_weak">No service appointments for this property.</td></tr>`;
    } else {
      const statusTheme = {
        "Operational": "slds-theme_success",
        "Operational with Repairs Needed": "slds-theme_warning",
        "Partial Outage": "slds-theme_error",
        "Full Outage": "slds-theme_error",
      };
      const completionTheme = {
        "Completed": "slds-theme_success",
        "Partially Completed": "slds-theme_warning",
        "Not Started": "",
      };

      saBody.innerHTML = [...inspections]
        .sort((a, b) => {
          if (!a.completedAt && !b.completedAt) return 0;
          if (!a.completedAt) return 1;
          if (!b.completedAt) return -1;
          return new Date(b.completedAt) - new Date(a.completedAt);
        })
        .map((insp) => {
          const overallBadge = insp.overallStatus
            ? `<span class="slds-badge ${statusTheme[insp.overallStatus] || ""}" style="font-size:0.7rem">${insp.overallStatus}</span>`
            : "—";
          const completionBadge = `<span class="slds-badge ${completionTheme[insp.completionStatus] || ""}" style="font-size:0.7rem">${insp.completionStatus}</span>`;
          return `<tr class="slds-hint-parent">
            <td data-label="SA Number">${insp.saNumber}</td>
            <td data-label="Completed">${insp.completedAt ? fmtDate(insp.completedAt) : "—"}</td>
            <td data-label="Type">${insp.inspectionType}</td>
            <td data-label="Technician">${insp.technician}</td>
            <td data-label="Overall Status">${overallBadge}</td>
            <td data-label="Callouts">${insp.calloutCount}</td>
            <td data-label="Completion">${completionBadge}</td>
          </tr>`;
        })
        .join("");
    }
  }

  if (calloutsBody) {
    if (!callouts.length) {
      calloutsBody.innerHTML = `<tr><td colspan="5" class="slds-text-align_center slds-p-around_medium slds-text-color_weak">No callouts for this property.</td></tr>`;
    } else {
      calloutsBody.innerHTML = [...callouts]
        .sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .map((callout) => `<tr class="slds-hint-parent">
          <td data-label="Callout #">${callout.number || "—"}</td>
          <td data-label="Created">${callout.createdAt ? fmtDate(callout.createdAt) : "—"}</td>
          <td data-label="Summary">${callout.summary || "—"}</td>
          <td data-label="Priority">${callout.priority || "—"}</td>
          <td data-label="Status">${callout.status || "—"}</td>
        </tr>`)
        .join("");
    }
  }

  if (proposalsBody) {
    if (!proposals.length) {
      proposalsBody.innerHTML = `<tr><td colspan="5" class="slds-text-align_center slds-p-around_medium slds-text-color_weak">No proposals for this property.</td></tr>`;
    } else {
      proposalsBody.innerHTML = [...proposals]
        .sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .map((proposal) => `<tr class="slds-hint-parent">
          <td data-label="Proposal #">${proposal.number || "—"}</td>
          <td data-label="Created">${proposal.createdAt ? fmtDate(proposal.createdAt) : "—"}</td>
          <td data-label="Description">${proposal.description || "—"}</td>
          <td data-label="Amount">${proposal.amount || "—"}</td>
          <td data-label="Status">${proposal.status || "—"}</td>
        </tr>`)
        .join("");
    }
  }
}

function renderMapTab(property, contextAsset) {
  if (!els.mapStage || !els.mapFeatureList) return;

  if (!contextAsset || contextAsset.parentId) {
    if (els.mapOverlay) {
      els.mapOverlay.innerHTML = "<p class='slds-text-body_small slds-text-color_weak slds-p-around_small'>Map is available only on parent assets.</p>";
    }
    els.mapFeatureList.innerHTML = "";
    if (els.mapFeatureCount) els.mapFeatureCount.textContent = "(0)";
    if (els.mapSelection) els.mapSelection.textContent = "No feature selected";
    if (els.mapSyncSummary) els.mapSyncSummary.textContent = "Pending 0 | Synced 0 | Failed 0";
    if (els.mapContext) els.mapContext.textContent = "Open a parent asset to manage irrigation map features.";
    return;
  }

  const mapState = ensureMapState(property, contextAsset);
  const features = mapState.features;
  const selectedId = mapState.selectedFeatureId;
  const selected = features.find((feature) => feature.id === selectedId) || null;

  const pending = features.filter((feature) => feature.syncState === "Pending").length;
  const synced = features.filter((feature) => feature.syncState === "Synced").length;
  const failed = features.filter((feature) => feature.syncState === "Failed").length;

  if (els.mapFeatureCount) {
    els.mapFeatureCount.textContent = `(${features.length}/${MAP_FEATURE_LIMIT})`;
  }
  if (els.mapContext) {
    els.mapContext.textContent = `${contextAsset.name} map centered from Parent Asset location. Google Maps visual mock.`;
  }
  if (els.mapSyncSummary) {
    els.mapSyncSummary.textContent = `Pending ${pending} | Synced ${synced} | Failed ${failed}`;
  }
  if (els.mapSelection) {
    const selectedSymbol = selected ? mapSymbolSpec(selected.assetType) : null;
    els.mapSelection.textContent = selected
      ? `Selected: ${selected.name} (${selectedSymbol.label})`
      : "No feature selected";
  }

  if (els.mapBaseFrame) {
    els.mapBaseFrame.src = getMapEmbedUrl(property, contextAsset, mapState.mapType, mapState.zoom);
  }

  const setMapTypeBtn = (btn, key) => {
    if (!btn) return;
    const active = mapState.mapType === key;
    btn.classList.toggle("slds-button_brand", active);
    btn.classList.toggle("slds-button_neutral", !active);
  };
  const setMapToolBtn = (btn, key) => {
    if (!btn) return;
    const active = mapState.activeTool === key;
    btn.classList.toggle("map-tool-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  };
  setMapTypeBtn(els.mapTypeRoadmap, "roadmap");
  setMapTypeBtn(els.mapTypeSatellite, "satellite");
  setMapTypeBtn(els.mapTypeHybrid, "hybrid");
  setMapToolBtn(els.mapAddPoint, "add-point");
  setMapToolBtn(els.mapAddLine, "add-line");
  setMapToolBtn(els.mapAddPolygon, "add-polygon");
  setMapToolBtn(els.mapMoveSelected, "move");
  setMapToolBtn(els.mapDeleteSelected, "delete");

  if (els.mapSymbolLegend) {
    const legendOrder = ["controller", "backflow", "pump", "zone", "valve", "head", "drip", "generic"];
    els.mapSymbolLegend.innerHTML = legendOrder
      .map((assetType) => {
        const symbol = mapSymbolSpec(assetType);
        return `<span class="map-legend-item"><span class="map-feature-symbol map-asset-${symbol.key}">${symbol.code}</span><span>${symbol.label}</span></span>`;
      })
      .join("");
  }

  if (els.mapOverlay) {
    els.mapOverlay.innerHTML = "";
  }
  features.forEach((feature) => {
    feature.assetType = inferAssetTypeFromName(feature.name, feature.assetType);
    const featureEl = document.createElement("button");
    const pos = mapFeaturePosition(feature);
    const symbol = mapSymbolSpec(feature.assetType);
    featureEl.type = "button";
    featureEl.className = `map-feature map-symbol-only feature-${feature.type.toLowerCase()} map-asset-${symbol.key}${selectedId === feature.id ? " map-feature-selected" : ""}`;
    featureEl.dataset.mapFeatureId = feature.id;
    featureEl.innerHTML = `<span class="map-feature-symbol">${symbol.code}</span>`;
    featureEl.setAttribute("aria-label", `${feature.name} (${symbol.label})`);
    featureEl.style.left = `${pos.left}%`;
    featureEl.style.top = `${pos.top}%`;
    featureEl.title = `${symbol.label} | ${feature.type} | ${feature.syncState || "Synced"}`;
    els.mapOverlay?.appendChild(featureEl);
  });

  if (!features.length && els.mapOverlay) {
    els.mapOverlay.innerHTML = "<p class='slds-text-body_small slds-text-color_weak slds-p-around_small'>No map features yet. Use Add Point/Line/Polygon to begin.</p>";
  }

  els.mapFeatureList.innerHTML = features
    .map((feature) => {
      const isSelected = feature.id === selectedId;
      const symbol = mapSymbolSpec(feature.assetType);
      return `<li class="map-feature-list-item${isSelected ? " selected" : ""}" data-map-list-id="${feature.id}">
        <div><strong><span class="map-feature-symbol map-asset-${symbol.key}">${symbol.code}</span> ${feature.name}</strong></div>
        <div class="map-feature-meta">
          <span>${symbol.label}</span>
          <span class="map-sync-badge ${mapSyncClass(feature.syncState)}">${feature.syncState || "Synced"}</span>
        </div>
      </li>`;
    })
    .join("");
}

function updateMapMessage(text, tone = "neutral") {
  if (!els.mapMessage) return;
  els.mapMessage.textContent = text;
  if (tone === "ok") {
    els.mapMessage.style.color = "#056034";
    return;
  }
  if (tone === "warn") {
    els.mapMessage.style.color = "#8f4b00";
    return;
  }
  if (tone === "error") {
    els.mapMessage.style.color = "#ba0517";
    return;
  }
  els.mapMessage.style.color = "#5f6b7a";
}

function openProgramModal(mode, prog = null) {
  const modal = document.getElementById("program-modal");
  const backdrop = document.getElementById("program-modal-backdrop");
  const title = document.getElementById("program-modal-title");
  const deleteBtn = document.getElementById("program-modal-delete");
  const msgEl = document.getElementById("program-msg");
  const form = document.getElementById("program-form");

  form.reset();
  msgEl.textContent = "";
  document.getElementById("program-edit-id").value = prog ? prog.id : "";
  title.textContent = prog ? "Edit Program" : "New Program";
  deleteBtn.classList.toggle("hidden", !prog);

  if (prog) {
    document.getElementById("program-name").value = prog.programName || "";
    document.getElementById("program-zone").value = prog.zoneAssetId || "";
    document.getElementById("program-start-time").value = prog.startTime || "";
    document.getElementById("program-run-time").value = prog.runTimeMinutes != null ? prog.runTimeMinutes : "";
    document.getElementById("program-seasonal-adjust").value = prog.seasonalAdjustPct != null ? prog.seasonalAdjustPct : "";
    document.getElementById("program-active").value = prog.isActive ? "true" : "false";
    const days = prog.scheduleDays || [];
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((d) => {
      const cb = document.getElementById("day-" + d.toLowerCase());
      if (cb) cb.checked = days.includes(d);
    });
  }

  modal.classList.remove("hidden");
  modal.classList.add("slds-fade-in-open");
  backdrop.classList.remove("hidden");
  backdrop.classList.add("slds-backdrop_open");
  document.body.classList.add("slds-overflow-hidden");
}

function closeProgramModal() {
  const modal = document.getElementById("program-modal");
  const backdrop = document.getElementById("program-modal-backdrop");
  modal.classList.add("hidden");
  modal.classList.remove("slds-fade-in-open");
  backdrop.classList.add("hidden");
  backdrop.classList.remove("slds-backdrop_open");
  document.body.classList.remove("slds-overflow-hidden");
}

function renderPage() {
  const property = getProperty();
  if (!property) {
    els.recordTitle.textContent = "Irrigation Asset Not Found";
    return;
  }

  const recordAsset =
    (recordAssetIdParam && property.assets.find((a) => a.id === recordAssetIdParam)) ||
    property.assets.find((a) => a.type === "System") ||
    property.assets.find((a) => a.type === "Controller");

  const detailAsset =
    (selectedAssetId && property.assets.find((a) => a.id === selectedAssetId)) ||
    recordAsset ||
    property.assets[0] ||
    null;

  if (detailAsset) {
    selectedAssetId = detailAsset.id;
  }

  updateRelatedTabVisibility(detailAsset);

  els.recordTitle.textContent = recordAsset ? getAssetDisplayTitle(recordAsset) : property.name;

  renderDetailsTab(property, detailAsset);
  renderTimeline(property, detailAsset);
  renderHierarchy(property, detailAsset);
  renderMapTab(property, detailAsset);
  renderRelated(property);
  if (!selectedAssetId && detailAsset) {
    setSelectedAsset(detailAsset.id, { suppressTabSwitch: true });
  } else if (selectedAssetId) {
    setSelectedAsset(selectedAssetId, { suppressTabSwitch: true });
  }
  renderAudit(property);
  renderContextRail(property);
  saveState();
}

function openCurrentAssetEditor() {
  const property = getProperty();
  if (!property) return;

  const currentAssetId =
    selectedAssetId ||
    recordAssetIdParam ||
    (property.assets[0] && property.assets[0].id) ||
    null;

  if (!currentAssetId) return;
  setSelectedAsset(currentAssetId);
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
    // Handle toggle button clicks
    const toggleBtn = event.target.closest("[data-tree-toggle]");
    if (toggleBtn) {
      event.preventDefault();
      event.stopPropagation();
      const assetId = toggleBtn.dataset.treeToggle;
      if (!assetId) return;
      if (expandedAssets.has(assetId)) {
        expandedAssets.delete(assetId);
      } else {
        expandedAssets.add(assetId);
      }
      const property = getProperty();
      if (!property) return;
      const currentAsset = property.assets.find((a) => a.id === selectedAssetId) || null;
      renderHierarchy(property, currentAsset);
      return;
    }
    
    // Handle asset button clicks
    const trigger = event.target.closest("[data-hierarchy-asset]");
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    const assetId = trigger.dataset.hierarchyAsset;
    if (!assetId) return;
    navigateToRelatedAsset(assetId);
  });

  els.hierarchyNewBtn?.addEventListener("click", () => {
    setActiveTab("hierarchy");
    openCreateModal();
  });

  els.headerEditBtn?.addEventListener("click", openCurrentAssetEditor);
  els.detailEditBtns?.forEach((button) => {
    button.addEventListener("click", openCurrentAssetEditor);
  });

  function getMapContext() {
    const property = getProperty();
    if (!property) return null;
    const contextAsset = property.assets.find((asset) => asset.id === selectedAssetId) || null;
    if (!contextAsset || contextAsset.parentId) return null;
    return {
      property,
      contextAsset,
      mapState: ensureMapState(property, contextAsset),
    };
  }

  function addMapFeature(type) {
    const context = getMapContext();
    if (!context) {
      updateMapMessage("Open a parent asset to edit map features.", "warn");
      return;
    }
    if (context.mapState.features.length >= MAP_FEATURE_LIMIT) {
      updateMapMessage(`Feature limit reached (${MAP_FEATURE_LIMIT}).`, "error");
      return;
    }

    const requestedName = window.prompt(`${type} name (required):`, `${type} ${context.mapState.features.length + 1}`);
    if (requestedName === null) return;
    const name = requestedName.trim();
    if (!name) {
      updateMapMessage("Type + Name are required before save.", "error");
      return;
    }

    const requestedAssetType = window.prompt(
      "Asset type code: controller, backflow, pump, zone, valve, head, drip",
      inferAssetTypeFromName(name, type === "Polygon" ? "zone" : "generic")
    );
    if (requestedAssetType === null) return;
    const assetType = normalizeMapAssetType(requestedAssetType);

    pushMapHistory(context.mapState);
    const feature = {
      id: genId("mapf"),
      type,
      name,
      assetType,
      status: "Active",
      syncState: "Pending",
      linkedAssetId: "",
    };
    context.mapState.features.push(feature);
    context.mapState.selectedFeatureId = feature.id;
    addAudit(context.property, "Map Feature", feature.name, `${type} added on map`);
    saveState();
    renderPage();
    updateMapMessage(`${type} created and auto-saved.`, "ok");
  }

  els.mapAddPoint?.addEventListener("click", () => {
    const context = getMapContext();
    if (context) {
      context.mapState.activeTool = "add-point";
      saveState();
      renderPage();
    }
    addMapFeature("Point");
  });
  els.mapAddLine?.addEventListener("click", () => {
    const context = getMapContext();
    if (context) {
      context.mapState.activeTool = "add-line";
      saveState();
      renderPage();
    }
    addMapFeature("Line");
  });
  els.mapAddPolygon?.addEventListener("click", () => {
    const context = getMapContext();
    if (context) {
      context.mapState.activeTool = "add-polygon";
      saveState();
      renderPage();
    }
    addMapFeature("Polygon");
  });

  const setDesktopMapType = (mapType) => {
    const context = getMapContext();
    if (!context) return;
    context.mapState.mapType = mapType;
    saveState();
    renderPage();
    updateMapMessage(`Map type set to ${mapType}.`, "ok");
  };

  els.mapTypeRoadmap?.addEventListener("click", () => setDesktopMapType("roadmap"));
  els.mapTypeSatellite?.addEventListener("click", () => setDesktopMapType("satellite"));
  els.mapTypeHybrid?.addEventListener("click", () => setDesktopMapType("hybrid"));

  const adjustDesktopZoom = (delta) => {
    const context = getMapContext();
    if (!context) return;
    const next = Math.max(14, Math.min(21, (Number(context.mapState.zoom) || 18) + delta));
    context.mapState.zoom = next;
    saveState();
    renderPage();
    updateMapMessage(`Zoom set to ${next}.`, "ok");
  };

  els.mapZoomOut?.addEventListener("click", () => adjustDesktopZoom(-1));
  els.mapZoomIn?.addEventListener("click", () => adjustDesktopZoom(1));

  els.mapStage?.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-map-feature-id]");
    if (!trigger) return;
    const context = getMapContext();
    if (!context) return;
    context.mapState.selectedFeatureId = trigger.dataset.mapFeatureId || "";
    saveState();
    renderPage();
  });

  els.mapFeatureList?.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-map-list-id]");
    if (!trigger) return;
    const context = getMapContext();
    if (!context) return;
    context.mapState.selectedFeatureId = trigger.dataset.mapListId || "";
    saveState();
    renderPage();
  });

  els.mapMoveSelected?.addEventListener("click", () => {
    const context = getMapContext();
    if (!context) return;
    context.mapState.activeTool = "move";
    const selected = context.mapState.features.find((feature) => feature.id === context.mapState.selectedFeatureId);
    if (!selected) {
      saveState();
      renderPage();
      updateMapMessage("Select a feature to move/reshape.", "warn");
      return;
    }
    pushMapHistory(context.mapState);
    selected.name = `${selected.name} *`;
    selected.syncState = "Pending";
    addAudit(context.property, "Map Feature", selected.name, "Feature moved/reshaped");
    saveState();
    renderPage();
    updateMapMessage("Feature moved/reshaped and auto-saved.", "ok");
  });

  els.mapDeleteSelected?.addEventListener("click", () => {
    const context = getMapContext();
    if (!context) return;
    context.mapState.activeTool = "delete";
    const idx = context.mapState.features.findIndex((feature) => feature.id === context.mapState.selectedFeatureId);
    if (idx === -1) {
      saveState();
      renderPage();
      updateMapMessage("Select a feature to delete.", "warn");
      return;
    }
    pushMapHistory(context.mapState);
    const removed = context.mapState.features.splice(idx, 1)[0];
    context.mapState.selectedFeatureId = "";
    addAudit(context.property, "Map Feature", removed.name, "Feature deleted");
    saveState();
    renderPage();
    updateMapMessage("Feature deleted.", "warn");
  });

  els.mapUndo?.addEventListener("click", () => {
    const context = getMapContext();
    if (!context) return;
    const previous = context.mapState.undoStack.pop();
    if (!previous) {
      updateMapMessage("Nothing to undo.", "warn");
      return;
    }
    context.mapState.redoStack.push(mapSnapshot(context.mapState));
    restoreMapSnapshot(context.mapState, previous);
    saveState();
    renderPage();
    updateMapMessage("Undo applied.", "ok");
  });

  els.mapRedo?.addEventListener("click", () => {
    const context = getMapContext();
    if (!context) return;
    const next = context.mapState.redoStack.pop();
    if (!next) {
      updateMapMessage("Nothing to redo.", "warn");
      return;
    }
    context.mapState.undoStack.push(mapSnapshot(context.mapState));
    restoreMapSnapshot(context.mapState, next);
    saveState();
    renderPage();
    updateMapMessage("Redo applied.", "ok");
  });

  els.mapExportKml?.addEventListener("click", () => {
    const context = getMapContext();
    if (!context) return;
    const kml = buildKml(context.mapState.features);
    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `${context.contextAsset.id || "asset-map"}.kml`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    updateMapMessage("KML export generated.", "ok");
  });

  els.mapImportKml?.addEventListener("click", () => {
    els.mapImportKmlInput?.click();
  });

  els.mapImportKmlInput?.addEventListener("change", async () => {
    const context = getMapContext();
    const file = els.mapImportKmlInput.files && els.mapImportKmlInput.files[0];
    if (!context || !file) return;

    const text = await file.text();
    const names = parseKmlNames(text).slice(0, 25);
    if (!names.length) {
      updateMapMessage("No valid Placemark names found in KML.", "error");
      return;
    }

    pushMapHistory(context.mapState);
    names.forEach((name) => {
      if (context.mapState.features.length >= MAP_FEATURE_LIMIT) return;
      context.mapState.features.push({
        id: genId("mapf"),
        type: "Point",
        name,
        assetType: inferAssetTypeFromName(name, "generic"),
        status: "Active",
        syncState: "Pending",
        linkedAssetId: "",
      });
    });
    addAudit(context.property, "Map Import", context.contextAsset.name, `Imported ${names.length} KML feature(s)`);
    els.mapImportKmlInput.value = "";
    saveState();
    renderPage();
    updateMapMessage(`Imported ${names.length} feature(s) from KML.`, "ok");
  });

  els.createType.addEventListener("change", configureCreateFormByType);
  els.createZoneNumber?.addEventListener("input", () => {
    syncZoneNameField(els.createName, els.createZoneNumber, els.createType.value === "Zone");
  });
  els.editZoneNumber?.addEventListener("input", () => {
    syncZoneNameField(els.editName, els.editZoneNumber, els.editType.value === "Zone");
  });

  els.createAssetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const property = getProperty();
    if (!property) return;

    const type = els.createType.value;
    const isZone = type === "Zone";
    if (!isZone) {
      els.createName.required = true;
    }
    const name = els.createName.value.trim();
    if (!isZone && !name) {
      els.createMsg.textContent = "Name is required.";
      return;
    }

    const base = {
      id: genId("asset"),
      type,
      name: isZone ? (els.createName.value.trim() || (els.createZoneNumber.value ? `Zone ${els.createZoneNumber.value}` : "Zone")) : name,
      status: "Active",
      isPlaceholder: false,
      parentId: null,
      zoneNumber: null,
      controllerLabel: "",
      makeModel: "",
      totalZones: null,
      backflowType: "",
      headSubtype: "",
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
      const system = activeAssets(property).find((a) => a.type === "System");
      if (system) {
        base.parentId = system.id;
      }
    }

    if (type === "Pump") {
      base.makeModel = els.createMakeModel.value.trim();
      base.serialNumber = els.createSerial.value.trim();
      const system = activeAssets(property).find((a) => a.type === "System");
      if (system) {
        base.parentId = system.id;
      }
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
      base.name = `Zone ${zoneNumber}`;
      base.parentId = parentId;

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
      const system = activeAssets(property).find((a) => a.type === "System");
      if (system) {
        base.parentId = system.id;
      }
    }

    if (type === "Valve" || type === "Head" || type === "Drip") {
      const parentId = els.createParentZone.value;
      if (!parentId) {
        els.createMsg.textContent = "Parent Zone is required.";
        return;
      }

      base.parentId = parentId;
      base.headSubtype = type === "Head" ? (els.createHeadSubtype.value || "") : "";
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

  // ── Program modal bindings ──
  document.getElementById("program-new-btn")?.addEventListener("click", () => {
    const property = getProperty();
    if (!property) return;
    const contextAsset = selectedAssetId ? property.assets.find((a) => a.id === selectedAssetId) : null;
    if (!contextAsset || contextAsset.type !== "Controller") return;
    renderZoneOptions(document.getElementById("program-zone"), true);
    openProgramModal("create");
  });

  document.getElementById("program-modal-close")?.addEventListener("click", closeProgramModal);
  document.getElementById("program-modal-cancel")?.addEventListener("click", closeProgramModal);
  document.getElementById("program-modal-backdrop")?.addEventListener("click", closeProgramModal);

  document.getElementById("program-modal-save")?.addEventListener("click", () => {
    const property = getProperty();
    if (!property) return;
    const contextAsset = selectedAssetId ? property.assets.find((a) => a.id === selectedAssetId) : null;
    if (!contextAsset || contextAsset.type !== "Controller") return;
    if (!contextAsset.programs) contextAsset.programs = [];

    const progName = document.getElementById("program-name").value.trim();
    if (!progName) {
      document.getElementById("program-msg").textContent = "Program Name is required.";
      return;
    }

    const checkedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].filter((d) => {
      const cb = document.getElementById("day-" + d.toLowerCase());
      return cb && cb.checked;
    });

    const editId = document.getElementById("program-edit-id").value;
    if (editId) {
      const existing = contextAsset.programs.find((p) => p.id === editId);
      if (existing) {
        existing.programName = progName;
        existing.zoneAssetId = document.getElementById("program-zone").value || "";
        existing.scheduleDays = checkedDays;
        existing.startTime = document.getElementById("program-start-time").value || "";
        existing.runTimeMinutes = document.getElementById("program-run-time").value !== "" ? Number(document.getElementById("program-run-time").value) : null;
        existing.seasonalAdjustPct = document.getElementById("program-seasonal-adjust").value !== "" ? Number(document.getElementById("program-seasonal-adjust").value) : 0;
        existing.isActive = document.getElementById("program-active").value === "true";
        addAudit(property, "Edit Program", existing.programName, `Program updated on ${contextAsset.name}`);
      }
    } else {
      const newProg = {
        id: genId("prog"),
        programName: progName,
        zoneAssetId: document.getElementById("program-zone").value || "",
        scheduleDays: checkedDays,
        startTime: document.getElementById("program-start-time").value || "",
        runTimeMinutes: document.getElementById("program-run-time").value !== "" ? Number(document.getElementById("program-run-time").value) : null,
        seasonalAdjustPct: document.getElementById("program-seasonal-adjust").value !== "" ? Number(document.getElementById("program-seasonal-adjust").value) : 0,
        isActive: document.getElementById("program-active").value === "true",
      };
      contextAsset.programs.push(newProg);
      addAudit(property, "Create Program", newProg.programName, `Program added to ${contextAsset.name}`);
    }

    closeProgramModal();
    renderPage();
  });

  document.getElementById("program-modal-delete")?.addEventListener("click", () => {
    const property = getProperty();
    if (!property) return;
    const contextAsset = selectedAssetId ? property.assets.find((a) => a.id === selectedAssetId) : null;
    if (!contextAsset || contextAsset.type !== "Controller") return;
    const editId = document.getElementById("program-edit-id").value;
    if (!editId) return;
    const idx = (contextAsset.programs || []).findIndex((p) => p.id === editId);
    if (idx === -1) return;
    const progName = contextAsset.programs[idx].programName;
    contextAsset.programs.splice(idx, 1);
    addAudit(property, "Delete Program", progName, `Program removed from ${contextAsset.name}`);
    closeProgramModal();
    renderPage();
  });

  document.getElementById("programs-table-body")?.addEventListener("click", (event) => {
    const editBtn = event.target.closest("button[data-edit-program]");
    if (editBtn) {
      const property = getProperty();
      if (!property) return;
      const contextAsset = selectedAssetId ? property.assets.find((a) => a.id === selectedAssetId) : null;
      if (!contextAsset) return;
      const prog = (contextAsset.programs || []).find((p) => p.id === editBtn.dataset.editProgram);
      if (!prog) return;
      renderZoneOptions(document.getElementById("program-zone"), true);
      openProgramModal("edit", prog);
      document.getElementById("program-zone").value = prog.zoneAssetId || "";
      return;
    }
    const deleteBtn = event.target.closest("button[data-delete-program]");
    if (deleteBtn) {
      const property = getProperty();
      if (!property) return;
      const contextAsset = selectedAssetId ? property.assets.find((a) => a.id === selectedAssetId) : null;
      if (!contextAsset) return;
      const progId = deleteBtn.dataset.deleteProgram;
      const idx = (contextAsset.programs || []).findIndex((p) => p.id === progId);
      if (idx === -1) return;
      const progName = contextAsset.programs[idx].programName;
      if (!confirm(`Delete program "${progName}"?`)) return;
      contextAsset.programs.splice(idx, 1);
      addAudit(property, "Delete Program", progName, `Program removed from ${contextAsset.name}`);
      renderPage();
    }
  });

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

    if (asset.type === "System") {
      const linkedActiveSystemChildren = activeAssets(property).filter(
        (a) => (a.type === "Controller" || a.type === "Backflow" || a.type === "Pump") && a.parentId === asset.id
      );
      if (linkedActiveSystemChildren.length) {
        els.editMsg.textContent =
          "Cannot retire System while active Controllers, Backflows, or Pumps are linked. Reassign or retire child assets first.";
        return;
      }
    }

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

}

async function init() {
  state = await loadState();
  bindEvents();
  setActiveTab(activeTab);
  renderPage();
}

init().catch((error) => {
  console.error("Failed to initialize property record", error);
});
