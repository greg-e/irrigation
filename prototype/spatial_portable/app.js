import {
  TOOL_MODES,
  parseContextFromUrl,
  featureTypeLabel,
} from "./core/contracts.js";
import { SpatialFeatureApi } from "./core/fakeApi.js";
import { GoogleMapAdapter } from "./core/googleMapAdapter.js";

const config = window.SPATIAL_PROTO_CONFIG || {};
const context = parseContextFromUrl();
const urlParams = new URLSearchParams(window.location.search);
const layoutMode = urlParams.get("layout") || "default";
let mapOnlyEditEnabled = layoutMode === "map-only" && urlParams.get("geomEdit") === "1";
const hideMapUiControlsInMapOnly = layoutMode === "map-only";
let geometryEditingEnabled = layoutMode !== "map-only" || mapOnlyEditEnabled;
const gestureHandlingMode = layoutMode === "map-only" ? "greedy" : "auto";

if (layoutMode === "map-only") {
  document.body.classList.add("map-only-layout");
}

function filterFeaturesForLayout(features) {
  // In map-only layout, keep all component geometry visible.
  // Editability is handled separately via allowAutoFeatureEditing/map mode.
  return features;
}

const ui = {
  featureList: document.getElementById("feature-list"),
  status: document.getElementById("status"),
  contextChip: document.getElementById("context-chip"),
  featureCount: document.getElementById("feature-count"),
  renameBtn: document.getElementById("rename-btn"),
  deleteBtn: document.getElementById("delete-btn"),
  saveBtn: document.getElementById("save-btn"),
  reloadBtn: document.getElementById("reload-btn"),
  toolButtons: Array.from(document.querySelectorAll("[data-tool]")),
  linkDialog: document.getElementById("link-dialog"),
  linkDialogContext: document.getElementById("link-dialog-context"),
  linkBackdrop: document.getElementById("link-backdrop"),
  linkActionMode: document.getElementById("link-action-mode"),
  linkModeLinkBtn: document.getElementById("link-mode-link"),
  linkModeNewBtn: document.getElementById("link-mode-new"),
  linkExistingSection: document.getElementById("link-existing-section"),
  linkNewSection: document.getElementById("link-new-section"),
  linkSelect: document.getElementById("link-component-select"),
  linkConfirm: document.getElementById("link-confirm"),
  linkSkip: document.getElementById("link-skip"),
  linkCancelHeader: document.getElementById("link-cancel-header"),
  linkCreateConfirm: document.getElementById("link-create-confirm"),
  linkCreateType: document.getElementById("link-create-type"),
  linkCreateName: document.getElementById("link-create-name"),
  linkCreateParent: document.getElementById("link-create-parent"),
};

const state = {
  tool: TOOL_MODES.SELECT,
  selectedFeatureId: null,
  selectedAssetId: null,
  hasAppliedSystemZoom: false,
  features: [],
  assets: [], // Will store the property's asset hierarchy
  assetMap: {}, // Map for quick asset lookup by ID
  expandedAssetIds: new Set(),
  collapsedAssetIds: new Set(),
  hiddenAutoFeatureIds: new Set(),
};

const api = new SpatialFeatureApi();

const mapAdapter = new GoogleMapAdapter(document.getElementById("map-root"), {
  apiKey: config.googleMapsApiKey,
  center: config.defaultCenter || { lat: 33.91551710426391, lng: -84.51719913959514 },
  zoom: Number(config.defaultZoom || 15),
  hideMapUiControls: hideMapUiControlsInMapOnly,
  gestureHandling: gestureHandlingMode,
  allowAutoFeatureEditing: mapOnlyEditEnabled,
  allowFeatureEditing: geometryEditingEnabled,
});

function setStatus(message) {
  ui.status.textContent = message;
}

function setGeometryEditingEnabled(enabled) {
  geometryEditingEnabled = Boolean(enabled);
  if (layoutMode === "map-only") {
    // In map-only embed mode, runtime edit toggle should control map-only edit behavior
    // even when the iframe URL is not reloaded.
    mapOnlyEditEnabled = geometryEditingEnabled;
  }
  if (mapAdapter?.setFeatureEditingEnabled) {
    mapAdapter.setFeatureEditingEnabled(geometryEditingEnabled, mapOnlyEditEnabled);
  }
}

function featureById(id) {
  return state.features.find((feature) => feature.id === id) || null;
}

function assetById(id) {
  return state.assetMap[id] || null;
}

// Load seed data and register assets with API
async function loadAndRegisterAssets() {
  try {
    // If parent already pushed the live asset payload, keep it and avoid overwriting.
    if (state.assets.length > 0) {
      api.registerAssets(context.propertyId, state.assets);
      return;
    }

    // Try desktop seed data from the renamed desktop prototype folder.
    let response = null;
    for (const path of ["../desktop/seed_data.json"]) {
      try {
        const r = await fetch(path);
        if (r.ok) { response = r; break; }
      } catch (_) { /* try next */ }
    }
    if (!response) {
      console.warn("Could not load seed_data.json, proceeding without asset hierarchy");
      return;
    }
    const data = await response.json();
    
    // Find the property's assets
    const property = data.properties?.find((p) => p.id === context.propertyId);
    if (!property || !property.assets) {
      console.warn(`No assets found for property ${context.propertyId}`);
      return;
    }

    // Parent iframe message may have arrived while seed fetch was in-flight.
    // If so, do not overwrite richer live asset payload.
    if (state.assets.length > 0) {
      api.registerAssets(context.propertyId, state.assets);
      return;
    }
    
    // Store assets and build lookup map
    state.assets = property.assets;
    state.assets.forEach((asset) => {
      state.assetMap[asset.id] = asset;
    });
    
    // Register with API for auto-feature generation
    api.registerAssets(context.propertyId, state.assets);
    console.log(`Loaded ${state.assets.length} assets for property ${context.propertyId}`);
  } catch (error) {
    console.warn("Error loading assets:", error);
  }
}

// Get asset hierarchy context for a feature
function getAssetContext(feature) {
  if (!feature.assetId) return null;
  
  const asset = assetById(feature.assetId);
  if (!asset) return null;
  
  const context = {
    asset,
    parent: asset.parentId ? assetById(asset.parentId) : null,
  };
  
  // Get grandparent for zones (parent is controller, grandparent is system)
  if (context.parent && context.parent.parentId) {
    context.grandparent = assetById(context.parent.parentId);
  }
  
  return context;
}

function getParentSystemForAsset(asset) {
  if (!asset) return null;

  // Walk up the hierarchy until we hit a System or run out of parents.
  let current = asset;
  const visited = new Set();

  while (current && !visited.has(current.id)) {
    if (String(current.type || "").toLowerCase() === "system") {
      return current;
    }

    visited.add(current.id);
    current = current.parentId ? assetById(current.parentId) : null;
  }

  return null;
}

function getPropertySystem() {
  return (
    state.assets.find(
      (asset) =>
        String(asset.type || "").toLowerCase() === "system" && asset.status !== "Retired"
    ) || null
  );
}

function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function deriveCenterFromFeatureGeometry() {
  const geometryFeatures = (state.features || []).filter((feature) => !feature?.isLatLon);
  const points = [];

  geometryFeatures.forEach((feature) => {
    if (feature?.type === "marker") {
      const lat = toFiniteNumber(feature?.geometry?.lat);
      const lng = toFiniteNumber(feature?.geometry?.lng);
      if (lat != null && lng != null) {
        points.push({ lat, lng });
      }
      return;
    }

    const path = Array.isArray(feature?.geometry?.path) ? feature.geometry.path : [];
    path.forEach((point) => {
      const lat = toFiniteNumber(point?.lat);
      const lng = toFiniteNumber(point?.lng);
      if (lat != null && lng != null) {
        points.push({ lat, lng });
      }
    });
  });

  if (!points.length) return null;
  const lat = points.reduce((sum, point) => sum + point.lat, 0) / points.length;
  const lng = points.reduce((sum, point) => sum + point.lng, 0) / points.length;
  return { lat, lng };
}

function deriveCenterFromAssets() {
  const activeAssets = state.assets.filter(
    (asset) => String(asset?.status || "").toLowerCase() !== "retired"
  );

  const directPoints = activeAssets
    .map((asset) => {
      const lat = toFiniteNumber(asset?.lat);
      const lon = toFiniteNumber(asset?.lon);
      if (lat == null || lon == null) return null;
      return { lat, lng: lon };
    })
    .filter(Boolean);

  if (directPoints.length) {
    const lat = directPoints.reduce((sum, point) => sum + point.lat, 0) / directPoints.length;
    const lng = directPoints.reduce((sum, point) => sum + point.lng, 0) / directPoints.length;
    return { lat, lng };
  }

  const baseLat = toFiniteNumber(config?.defaultCenter?.lat) ?? 33.91551710426391;
  const baseLng = toFiniteNumber(config?.defaultCenter?.lng) ?? -84.51719913959514;
  const pseudoPoints = activeAssets
    .map((asset) => {
      const x = toFiniteNumber(asset?.mapX);
      const y = toFiniteNumber(asset?.mapY);
      if (x == null || y == null) return null;
      return {
        lat: baseLat + (50 - y) * 0.00042,
        lng: baseLng + (x - 50) * 0.00042,
      };
    })
    .filter(Boolean);

  if (!pseudoPoints.length) return null;
  const lat = pseudoPoints.reduce((sum, point) => sum + point.lat, 0) / pseudoPoints.length;
  const lng = pseudoPoints.reduce((sum, point) => sum + point.lng, 0) / pseudoPoints.length;
  return { lat, lng };
}

function centerMapOnSystem() {
  if (!mapAdapter.map) return false;
  const systemAsset = getPropertySystem();
  const systemLat = toFiniteNumber(systemAsset?.lat);
  const systemLon = toFiniteNumber(systemAsset?.lon);

  const fallbackCenter =
    deriveCenterFromFeatureGeometry() ||
    deriveCenterFromAssets();

  const center =
    systemLat != null && systemLon != null
      ? { lat: systemLat, lng: systemLon }
      : fallbackCenter;

  if (!center) return false;
  mapAdapter.map.setCenter(center);

  // Apply a tighter default zoom only once so user zoom changes are preserved.
  if (!state.hasAppliedSystemZoom) {
    const systemZoom = Number(config.systemCenterZoom || 18);
    if (Number.isFinite(systemZoom) && systemZoom > 0) {
      mapAdapter.map.setZoom(systemZoom);
    }
    state.hasAppliedSystemZoom = true;
  }

  return true;
}

function upsertLocal(feature) {
  const idx = state.features.findIndex((item) => item.id === feature.id);
  if (idx >= 0) {
    state.features[idx] = feature;
  } else {
    state.features.push(feature);
  }
}

function removeLocal(featureId) {
  state.features = state.features.filter((item) => item.id !== featureId);
  if (state.selectedFeatureId === featureId) {
    state.selectedFeatureId = null;
  }
}

function linkedFeatureName(assetId, fallbackName = "") {
  return assetById(assetId)?.name || fallbackName;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function assetRecordUrl(assetId) {
  if (!context.propertyId || !assetId) return "#";
  return `../desktop/desktop_v3.1.html?property=${encodeURIComponent(context.propertyId)}&asset=${encodeURIComponent(assetId)}`;
}

function normalizeFeatureNames(features) {
  return features.map((feature) => {
    const linkedAsset = feature.assetId ? assetById(feature.assetId) : null;
    const linkedName = linkedFeatureName(feature.assetId, feature.name);
    const nextAssetType = linkedAsset?.type || feature.assetType;
    const nextAssetStatus = linkedAsset?.status || feature.assetStatus;

    const hasNameChange = Boolean(linkedName && linkedName !== feature.name);
    const hasTypeChange = nextAssetType !== feature.assetType;
    const hasStatusChange = nextAssetStatus !== feature.assetStatus;

    if (!hasNameChange && !hasTypeChange && !hasStatusChange) {
      return feature;
    }

    return {
      ...feature,
      name: linkedName || feature.name,
      assetType: nextAssetType,
      assetStatus: nextAssetStatus,
    };
  });
}

function dedupeFeaturesById(features) {
  // Keep the latest instance of each id (user overrides auto when arrays are [auto, user]).
  const byId = new Map();
  features.forEach((feature) => {
    if (feature?.id) {
      byId.set(feature.id, feature);
    }
  });
  return Array.from(byId.values());
}

function updateActionButtons() {
  const selectedFeature = state.selectedFeatureId ? featureById(state.selectedFeatureId) : null;
  const hasSelection = Boolean(selectedFeature && !selectedFeature.isAuto);
  ui.renameBtn.disabled = true;
  ui.deleteBtn.disabled = !hasSelection;
}

function updateFeatureCount() {
  if (!ui.featureCount) return;
  const activeAssetCount = state.assets.filter((asset) => asset.status !== "Retired").length;
  ui.featureCount.textContent = activeAssetCount;
}

function componentCandidates() {
  return state.assets
    .filter((asset) => asset.status !== "Retired")
    .sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return (a.name || "").localeCompare(b.name || "");
    });
}

function hasMappedLocation(assetId) {
  return state.features.some((feature) => feature.assetId === assetId && !feature.isLatLon);
}

function linkableComponentCandidates() {
  return componentCandidates().filter((asset) => !hasMappedLocation(asset.id));
}

function parentCandidatesForType(typeKey) {
  const type = String(typeKey || "").toLowerCase();
  const active = componentCandidates();

  if (type === "zone") {
    return active.filter((asset) => String(asset.type || "").toLowerCase() === "controller");
  }

  if (type === "controller" || type === "backflow") {
    return active.filter((asset) => {
      const parentType = String(asset.type || "").toLowerCase();
      return parentType === "system" || parentType === "source";
    });
  }

  return active.filter((asset) => String(asset.type || "").toLowerCase() === "system");
}

function nameExistsForType(name, typeKey) {
  const normalizedName = String(name || "").trim().toLowerCase();
  const normalizedType = String(typeKey || "").trim().toLowerCase();
  if (!normalizedName || !normalizedType) return false;

  return state.assets.some((asset) => {
    const assetType = String(asset.type || "").trim().toLowerCase();
    if (assetType !== normalizedType) return false;
    const assetName = String(asset.name || asset.label || "").trim().toLowerCase();
    return assetName === normalizedName;
  });
}

function nextAvailableName(base, typeKey) {
  const root = String(base || "").trim() || "New Component";
  if (!nameExistsForType(root, typeKey)) return root;

  let idx = 2;
  let candidate = `${root} ${idx}`;
  while (nameExistsForType(candidate, typeKey)) {
    idx += 1;
    candidate = `${root} ${idx}`;
  }
  return candidate;
}

function getNextZoneNumber() {
  let maxZoneNumber = 0;

  state.assets.forEach((asset) => {
    if (String(asset.type || "").toLowerCase() !== "zone") return;
    const source = `${asset.name || ""} ${asset.label || ""} ${asset.id || ""}`;
    const match = source.match(/zone[^0-9]*([0-9]+)/i);
    if (!match) return;
    const n = Number(match[1]);
    if (Number.isFinite(n)) {
      maxZoneNumber = Math.max(maxZoneNumber, n);
    }
  });

  return Math.max(1, maxZoneNumber + 1);
}

function getSuggestedControllerName() {
  const existing = new Set(
    state.assets
      .filter((asset) => String(asset.type || "").toLowerCase() === "controller")
      .map((asset) => String(asset.name || "").trim().toLowerCase())
  );

  const letterMatches = Array.from(existing)
    .map((name) => name.match(/^controller\s+([a-z])$/i))
    .filter(Boolean)
    .map((match) => match[1].toUpperCase());

  if (letterMatches.length) {
    const maxLetter = letterMatches.sort().slice(-1)[0].charCodeAt(0);
    const nextCode = Math.min(90, maxLetter + 1);
    const suggested = `Controller ${String.fromCharCode(nextCode)}`;
    if (!nameExistsForType(suggested, "controller")) return suggested;
  }

  return nextAvailableName("Controller", "controller");
}

function getSuggestedBackflowName() {
  return nextAvailableName("Backflow", "backflow");
}

function buildAutoComponentName(typeKey, parentId) {
  const normalizedType = String(typeKey || "component").toLowerCase();
  if (normalizedType === "zone") {
    return `Zone ${getNextZoneNumber()}`;
  }
  if (normalizedType === "controller") {
    return getSuggestedControllerName();
  }
  if (normalizedType === "backflow") {
    return getSuggestedBackflowName();
  }

  const typeLabel = toTitleCase(normalizedType);
  return nextAvailableName(typeLabel, normalizedType);
}

function nextAssetId(typeKey) {
  const normalized = String(typeKey || "component").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "component";
  let index = 1;
  let candidate = `asset-${normalized}-${index}`;
  while (state.assetMap[candidate]) {
    index += 1;
    candidate = `asset-${normalized}-${index}`;
  }
  return candidate;
}

function toTitleCase(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "Component";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function inferDefaultParentId(typeKey) {
  const type = String(typeKey || "").toLowerCase();
  if (type === "zone") {
    return state.assets.find((asset) => String(asset.type || "").toLowerCase() === "controller")?.id || "";
  }
  return state.assets.find((asset) => String(asset.type || "").toLowerCase() === "system")?.id || "";
}

function addAssetToLocalHierarchy(nextAsset) {
  if (!nextAsset?.id || state.assetMap[nextAsset.id]) return false;
  state.assets.push(nextAsset);
  state.assetMap[nextAsset.id] = nextAsset;
  api.registerAssets(context.propertyId, state.assets);
  renderFeatureList();
  return true;
}

function notifyParentComponentCreated(asset) {
  if (!asset || window.parent === window) return;
  window.parent.postMessage(
    {
      type: "SPATIAL_COMPONENT_CREATED",
      propertyId: context.propertyId,
      asset,
    },
    "*"
  );
}

function createAssetFromMapInput({ typeKey, rawName, parentId, geometryFeature }) {
  const normalizedType = String(typeKey || "zone").toLowerCase();
  const typeLabel = toTitleCase(normalizedType);
  const coord = extractCentroid(geometryFeature);
  const suggestedName = buildAutoComponentName(normalizedType, parentId || "");
  const name = String(rawName || "").trim() || suggestedName;

  if (["zone", "controller"].includes(normalizedType) && nameExistsForType(name, normalizedType)) {
    setStatus(`${typeLabel} name already exists. Suggested: ${suggestedName}.`);
    return null;
  }

  const assetId = nextAssetId(normalizedType);
  const finalParentId = parentId || inferDefaultParentId(normalizedType) || null;
  const created = {
    id: assetId,
    name,
    type: normalizedType,
    status: normalizedType === "backflow" ? "Pass" : normalizedType === "zone" ? "ok" : "active",
    description: "Created from map.",
    parentId: finalParentId,
  };

  if (coord) {
    created.lat = Number(coord.lat);
    created.lon = Number(coord.lon);
  }

  if (normalizedType === "zone") {
    const firstController = state.assets.find((asset) => String(asset.type || "").toLowerCase() === "controller")?.name || "";
    const firstBackflow = state.assets.find((asset) => String(asset.type || "").toLowerCase() === "backflow")?.name || "";
    created.controller = firstController;
    created.backflow = firstBackflow;
    created.label = name;
  }

  if (normalizedType === "controller") {
    created.model = "Field Added";
    created.zones = [];
    created.programs = [];
  }

  return addAssetToLocalHierarchy(created) ? created : null;
}

async function promptComponentLink(defaultAssetId = "", geometryFeature = null) {
  const dialog = ui.linkDialog;
  const dialogContext = ui.linkDialogContext;
  const backdrop = ui.linkBackdrop;
  const actionMode = ui.linkActionMode;
  const modeLinkBtn = ui.linkModeLinkBtn;
  const modeNewBtn = ui.linkModeNewBtn;
  const existingSection = ui.linkExistingSection;
  const newSection = ui.linkNewSection;
  const select = ui.linkSelect;
  const confirmBtn = ui.linkConfirm;
  const createBtn = ui.linkCreateConfirm;
  const createType = ui.linkCreateType;
  const createName = ui.linkCreateName;
  const createParent = ui.linkCreateParent;
  const skipBtn = ui.linkSkip;
  const cancelHeaderBtn = ui.linkCancelHeader;

  if (!dialog || !backdrop || !actionMode || !existingSection || !newSection || !select || !confirmBtn || !createBtn || !createType || !createName || !createParent || !skipBtn || !cancelHeaderBtn) {
    return defaultAssetId || "";
  }

  const describeGeometry = (draft) => {
    const geometryType = featureTypeLabel(draft?.type || "marker");
    const coordinates = draft?.geometry?.coordinates;
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      const lon = Number(coordinates[0]);
      const lat = Number(coordinates[1]);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        return `${geometryType} at ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      }
    }
    return geometryType;
  };

  if (dialogContext) {
    dialogContext.textContent = `Choose an existing component or create a new one and link this ${describeGeometry(geometryFeature)}.`;
  }

  const linkOptions = linkableComponentCandidates();
  select.innerHTML = linkOptions.length
    ? linkOptions
        .map((asset) => `<option value="${asset.id}">${asset.type}: ${asset.name}</option>`)
        .join("")
    : "<option value=\"\">No components without location</option>";

  const preferred =
    (defaultAssetId && linkOptions.find((item) => item.id === defaultAssetId)?.id) ||
    state.selectedAssetId ||
    linkOptions[0]?.id ||
    "";
  select.value = preferred;
  confirmBtn.disabled = linkOptions.length === 0;

  const syncModeButtons = (mode) => {
    const isLink = mode !== "new";
    if (modeLinkBtn) {
      modeLinkBtn.classList.toggle("is-active", isLink);
      modeLinkBtn.setAttribute("aria-pressed", isLink ? "true" : "false");
    }
    if (modeNewBtn) {
      modeNewBtn.classList.toggle("is-active", !isLink);
      modeNewBtn.setAttribute("aria-pressed", !isLink ? "true" : "false");
    }
  };

  const syncNewComponentInputs = () => {
    const parentOptions = parentCandidatesForType(createType.value);
    createParent.innerHTML = parentOptions.length
      ? parentOptions.map((asset) => `<option value="${asset.id}">${asset.type}: ${asset.name}</option>`).join("")
      : "<option value=\"\">No available parent</option>";

    const inferredParent = inferDefaultParentId(createType.value);
    const candidateParentId = createParent.value || inferredParent || parentOptions[0]?.id || "";
    if (candidateParentId && parentOptions.find((asset) => asset.id === candidateParentId)) {
      createParent.value = candidateParentId;
    } else if (parentOptions[0]) {
      createParent.value = parentOptions[0].id;
    } else {
      createParent.value = "";
    }

    createName.value = buildAutoComponentName(createType.value, createParent.value);
  };

  const syncActionMode = () => {
    const isLink = actionMode.value !== "new";
    syncModeButtons(actionMode.value);
    existingSection.classList.toggle("slds-hide", !isLink);
    newSection.classList.toggle("slds-hide", isLink);
    confirmBtn.classList.toggle("slds-hide", !isLink);
    createBtn.classList.toggle("slds-hide", isLink);
    if (!isLink) {
      syncNewComponentInputs();
      createType.focus();
      return;
    }
    if (!confirmBtn.disabled) select.focus();
  };

  const setActionMode = (mode) => {
    actionMode.value = mode === "new" ? "new" : "link";
    syncActionMode();
  };

  setActionMode("link");

  dialog.showModal();
  backdrop.classList.remove("slds-backdrop_hide");
  backdrop.classList.add("slds-backdrop_open");

  return new Promise((resolve) => {
    const close = (result) => {
      dialog.close();
      backdrop.classList.add("slds-backdrop_hide");
      backdrop.classList.remove("slds-backdrop_open");
      actionMode.removeEventListener("change", onModeChange);
      modeLinkBtn?.removeEventListener("click", onModeLinkClick);
      modeNewBtn?.removeEventListener("click", onModeNewClick);
      createType.removeEventListener("change", onCreateInputsChange);
      createParent.removeEventListener("change", onCreateInputsChange);
      confirmBtn.removeEventListener("click", onConfirm);
      createBtn.removeEventListener("click", onCreate);
      skipBtn.removeEventListener("click", onSkip);
      cancelHeaderBtn.removeEventListener("click", onCancel);
      resolve(result);
    };

    const onModeChange = () => syncActionMode();
    const onModeLinkClick = () => setActionMode("link");
    const onModeNewClick = () => setActionMode("new");
    const onCreateInputsChange = () => syncNewComponentInputs();
    const onConfirm = () => close(select.value || "");
    const onCreate = () => {
      const typeKey = createType.value || "zone";
      const name = createName.value.trim() || buildAutoComponentName(typeKey, createParent.value || "");

      const createdAsset = createAssetFromMapInput({
        typeKey,
        rawName: name,
        parentId: createParent.value || "",
        geometryFeature,
      });

      if (!createdAsset) {
        setStatus("Unable to create component in hierarchy.");
        return;
      }

      notifyParentComponentCreated(createdAsset);
      close(createdAsset.id);
    };
    const onSkip = () => close("");
    const onCancel = () => close(null);

    actionMode.addEventListener("change", onModeChange);
  modeLinkBtn?.addEventListener("click", onModeLinkClick);
  modeNewBtn?.addEventListener("click", onModeNewClick);
    createType.addEventListener("change", onCreateInputsChange);
    createParent.addEventListener("change", onCreateInputsChange);
    confirmBtn.addEventListener("click", onConfirm);
    createBtn.addEventListener("click", onCreate);
    skipBtn.addEventListener("click", onSkip);
    cancelHeaderBtn.addEventListener("click", onCancel);
  });
}

function getAssetTypeIcon(assetType) {
  const typeMap = {
    system: "asset_object",
    source: "location",
    backflow: "water",
    controller: "clock",
    zone: "choice",
    pump: "location",
    valve: "trail",
    head: "location",
    drip: "trail",
  };
  const icon = typeMap[String(assetType || "").toLowerCase()] || "record";
  return `<svg class="feature-type-icon-svg" viewBox="0 0 520 520" aria-hidden="true"><use href="salesforce-lightning-design-system-icons/utility-sprite/svg/symbols.svg#${icon}"></use></svg>`;
}

function getMapGeometryBadge(linkedFeatures) {
  const geometryFeatures = (linkedFeatures || []).filter((feature) => !feature.isLatLon);
  if (!geometryFeatures.length) return "";

  const hasPolyGeometry = geometryFeatures.some(
    (feature) => feature.type === "polygon" || feature.type === "polyline"
  );
  const iconName = hasPolyGeometry ? "calculated_insights" : "checkin";
  const badgeLabel = hasPolyGeometry ? "poly" : "marker";

  return `<span class="map-geometry-badge" title="Has mapped ${badgeLabel} geometry" aria-label="Has mapped ${badgeLabel} geometry"><svg viewBox="0 0 520 520" aria-hidden="true"><use href="salesforce-lightning-design-system-icons/utility-sprite/svg/symbols.svg#${iconName}"></use></svg></span>`;
}

function ensureAssetPathExpanded(assetId) {
  let cursor = assetById(assetId);
  const visited = new Set();

  while (cursor && !visited.has(cursor.id)) {
    visited.add(cursor.id);
    state.expandedAssetIds.add(cursor.id);
    state.collapsedAssetIds.delete(cursor.id);
    cursor = cursor.parentId ? assetById(cursor.parentId) : null;
  }
}

function findPrimaryFeatureForAsset(assetId) {
  if (!assetId) return null;
  const linked = state.features.filter((feature) => feature.assetId === assetId);
  if (!linked.length) return null;
  const nonLatLon = linked.find((feature) => !feature.isLatLon);
  return nonLatLon || linked[0] || null;
}

function focusMapOnFeature(feature, zoom = 19) {
  if (!feature || !mapAdapter.map) return false;
  const center = extractCentroid(feature);
  if (!center) return false;

  mapAdapter.map.setCenter({ lat: center.lat, lng: center.lon });
  if (Number.isFinite(zoom) && zoom > 0) {
    mapAdapter.map.setZoom(zoom);
  }
  return true;
}

function selectAssetContext(assetId, options = {}) {
  const { shouldFocusMap = true, selectionSource = "sync" } = options;
  const asset = assetById(assetId);
  if (!asset) return;

  state.selectedAssetId = asset.id;
  ensureAssetPathExpanded(asset.id);

  const linkedFeature = findPrimaryFeatureForAsset(asset.id);
  if (linkedFeature) {
    state.selectedFeatureId = linkedFeature.id;
    mapAdapter.selectFeature(linkedFeature.id);
    if (shouldFocusMap) {
      focusMapOnFeature(linkedFeature, Number(config.selectionZoom || 19));
    }
    setStatus(`Selected ${asset.name} with mapped geometry ${linkedFeature.name}.`);
    notifyParentMapObjectSelected(linkedFeature, selectionSource);
  } else {
    state.selectedFeatureId = null;
    if (shouldFocusMap) {
      // If the selected asset has no geometry yet, fall back to system centering
      // so refreshes don't stay on the default map location.
      centerMapOnSystem();
    }
    setStatus(`Selected ${asset.name}. No mapped geometry yet.`);
    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: "SPATIAL_MAP_OBJECT_SELECTED",
          assetId: asset.id,
          featureId: null,
          shouldOpenDetail: !mapOnlyEditEnabled,
          selectionSource,
        },
        "*"
      );
    }
  }

  updateActionButtons();
  renderFeatureList();
}

function renderFeatureList() {
  notifyParentMappedAssets();

  if (!ui.featureList) {
    updateActionButtons();
    return;
  }

  ui.featureList.innerHTML = "";
  updateFeatureCount();

  const activeAssets = state.assets.filter((asset) => asset.status !== "Retired");
  const assetIdSet = new Set(activeAssets.map((asset) => asset.id));

  if (!activeAssets.length) {
    const li = document.createElement("li");
    li.className = "feature-item";
    li.innerHTML = "<p class=\"feature-label\">No assets in hierarchy</p><p class=\"feature-meta\">No active hierarchy assets found for this property.</p>";
    ui.featureList.appendChild(li);
    updateActionButtons();
    return;
  }

  const childrenByParentId = new Map();
  const featuresByAssetId = new Map();

  state.features.forEach((feature) => {
    if (!feature.assetId) return;
    if (!featuresByAssetId.has(feature.assetId)) {
      featuresByAssetId.set(feature.assetId, []);
    }
    featuresByAssetId.get(feature.assetId).push(feature);
  });

  activeAssets.forEach((asset) => {
    const parentId = asset.parentId && assetIdSet.has(asset.parentId) ? asset.parentId : "ROOT";
    if (!childrenByParentId.has(parentId)) {
      childrenByParentId.set(parentId, []);
    }
    childrenByParentId.get(parentId).push(asset);
  });

  const TYPE_ORDER = {
    System: 0,
    Source: 1,
    Backflow: 2,
    Controller: 3,
    Zone: 4,
    Pump: 5,
    Valve: 6,
    Head: 7,
    Drip: 8,
  };

  const sortAssets = (assets) => {
    return [...assets].sort((a, b) => {
      const typeDiff = (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99);
      if (typeDiff !== 0) return typeDiff;
      return (a.name || "").localeCompare(b.name || "");
    });
  };

  const renderAssetNode = (asset, depth) => {
    const li = document.createElement("li");
    li.className = `feature-item hierarchy-item${asset.id === state.selectedAssetId ? " active" : ""}`;
    li.style.paddingLeft = `${12 + Math.min(depth * 18, 72)}px`;

    const children = sortAssets(childrenByParentId.get(asset.id) || []);
    const hasChildren = children.length > 0;
    const hasExplicitState =
      state.expandedAssetIds.has(asset.id) || state.collapsedAssetIds.has(asset.id);
    const isExpanded = hasChildren
      ? hasExplicitState
        ? state.expandedAssetIds.has(asset.id)
        : depth === 0
      : false;

    const toggleControl = hasChildren
      ? `<button type="button" class="tree-toggle" data-tree-toggle="${asset.id}" aria-expanded="${isExpanded}" title="${isExpanded ? "Collapse" : "Expand"}"><svg viewBox="0 0 520 520" aria-hidden="true"><use href="salesforce-lightning-design-system-icons/utility-sprite/svg/symbols.svg#chevronright"></use></svg></button>`
      : '<span class="tree-toggle-spacer" aria-hidden="true"></span>';

    const icon = getAssetTypeIcon(asset.type);
    const linkedFeatures = featuresByAssetId.get(asset.id) || [];
    const assetUrl = assetRecordUrl(asset.id);

    const hasLatLon = asset.lat != null && asset.lon != null;
    const hasDrawnGeometry = linkedFeatures.some((f) => !f.isLatLon);
    const geometryBadge = getMapGeometryBadge(linkedFeatures);
    const gpsBadge =
      hasLatLon && !hasDrawnGeometry
        ? `<span class="latlon-badge" title="Placed by GPS coordinates only">GPS</span>`
        : "";

    li.innerHTML = `
      <p class="feature-label"><span class="hierarchy-label">${toggleControl}<button type="button" class="asset-selector" data-select-asset="${asset.id}" title="Select for map context"><span class="feature-type-icon ${asset.type}">${icon}</span></button><span class="asset-name">${escapeHtml(asset.name)}</span><a class="record-link" href="${assetUrl}" target="_parent" title="Open component record" aria-label="Open ${escapeHtml(asset.name)} record"><svg viewBox="0 0 520 520" aria-hidden="true"><use href="salesforce-lightning-design-system-icons/utility-sprite/svg/symbols.svg#open"></use></svg></a>${geometryBadge}${gpsBadge}</span></p>
    `;

    const toggleEl = li.querySelector("[data-tree-toggle]");
    if (toggleEl) {
      toggleEl.addEventListener("click", (event) => {
        event.stopPropagation();
        const nextExpanded = toggleEl.getAttribute("aria-expanded") !== "true";
        if (nextExpanded) {
          state.expandedAssetIds.add(asset.id);
          state.collapsedAssetIds.delete(asset.id);
        } else {
          state.collapsedAssetIds.add(asset.id);
          state.expandedAssetIds.delete(asset.id);
        }
        renderFeatureList();
      });
    }

    const assetSelector = li.querySelector("[data-select-asset]");
    if (assetSelector) {
      assetSelector.addEventListener("click", (event) => {
        event.stopPropagation();
        selectAssetContext(asset.id, { shouldFocusMap: true, selectionSource: "hierarchy" });
      });
    }

    li.addEventListener("click", () => {
      selectAssetContext(asset.id, { shouldFocusMap: true, selectionSource: "hierarchy" });
    });

    ui.featureList.appendChild(li);

    if (hasChildren && isExpanded) {
      children.forEach((child) => renderAssetNode(child, depth + 1));
    }
  };

  const roots = sortAssets(childrenByParentId.get("ROOT") || []);
  roots.forEach((rootAsset) => renderAssetNode(rootAsset, 0));
  updateActionButtons();
}

function setTool(mode) {
  state.tool = mode;
  ui.toolButtons.forEach((button) => {
    button.classList.toggle("tool-active", button.dataset.tool === mode);
  });
  mapAdapter.setMode(mode);
  setStatus(mode === TOOL_MODES.SELECT ? "Select and edit existing geometry." : `Drawing ${mode}.`);
}

function extractCentroid(feature) {
  const g = feature.geometry;
  if (!g) return null;
  if (feature.type === "marker") {
    return { lat: g.lat, lon: g.lng };
  }
  const pts = g.path || [];
  if (!pts.length) return null;
  const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lon = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
  return { lat, lon };
}

function notifyParentAssetLocation(assetId, feature) {
  if (!assetId || window.parent === window) return;
  const coord = extractCentroid(feature);
  if (!coord) return;
  window.parent.postMessage(
    { type: "SPATIAL_ASSET_LOCATION", assetId, lat: coord.lat, lon: coord.lon },
    "*"
  );
}

function notifyParentMapObjectSelected(feature, selectionSource = "map") {
  if (!feature?.assetId || window.parent === window) return;
  window.parent.postMessage(
    {
      type: "SPATIAL_MAP_OBJECT_SELECTED",
      assetId: feature.assetId,
      featureId: feature.id,
      shouldOpenDetail: !mapOnlyEditEnabled,
      selectionSource,
    },
    "*"
  );
}

function notifyParentMappedAssets() {
  if (window.parent === window) return;

  const mappedAssetIds = Array.from(
    new Set(
      state.features
        .filter((feature) => feature?.assetId && !feature.isLatLon)
        .map((feature) => feature.assetId)
    )
  );

  window.parent.postMessage(
    {
      type: "SPATIAL_MAPPED_ASSETS",
      assetIds: mappedAssetIds,
    },
    "*"
  );
}

function syncLatLonFeatures() {
  if (!mapAdapter.map) return;

  // Remove stale lat/lon auto-markers
  state.features
    .filter((f) => f.isLatLon)
    .forEach((f) => mapAdapter.removeFeature(f.id));
  state.features = state.features.filter((f) => !f.isLatLon);

  // Add a marker for active assets with lat/lon only when they do not already
  // have explicit drawn geometry linked in the map dataset.
  state.assets
    .filter((a) => {
      if (a.status === "Retired") return false;
      if (a.lat == null || a.lon == null) return false;
      if (hasMappedLocation(a.id)) return false;
      return true;
    })
    .forEach((asset) => {
      const feature = {
        id: `latlon-${asset.id}`,
        propertyId: context.propertyId,
        assetId: asset.id,
        assetType: asset.type,
        type: "marker",
        name: asset.name,
        geometry: { lat: asset.lat, lng: asset.lon },
        isAuto: true,
        isLatLon: true,
        modifiedAt: Date.now(),
      };
      state.features.push(feature);
      mapAdapter.addFeature(feature);
    });
}

function getStorageKey() {
  return `spatial-demo-${context.propertyId}`;
}

function getHiddenAutoStorageKey() {
  return `spatial-demo-hidden-auto-${context.propertyId}`;
}

function saveToLocalStorage() {
  try {
    const userFeatures = state.features.filter((feature) => !feature.isAuto);
    localStorage.setItem(getStorageKey(), JSON.stringify(userFeatures));
  } catch (error) {
    console.warn("localStorage save failed:", error);
  }
}

function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem(getStorageKey());
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    const userOnly = parsed.filter((feature) => !feature?.isAuto);
    return dedupeFeaturesById(userOnly);
  } catch (error) {
    console.warn("localStorage load failed:", error);
    return null;
  }
}

function saveHiddenAutoToLocalStorage() {
  try {
    localStorage.setItem(
      getHiddenAutoStorageKey(),
      JSON.stringify(Array.from(state.hiddenAutoFeatureIds))
    );
  } catch (error) {
    console.warn("localStorage hidden-auto save failed:", error);
  }
}

function loadHiddenAutoFromLocalStorage() {
  try {
    const stored = localStorage.getItem(getHiddenAutoStorageKey());
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === "string" && id.length > 0));
  } catch (error) {
    console.warn("localStorage hidden-auto load failed:", error);
    return new Set();
  }
}

function notifyParentGeometryDeleted(assetId, deletedCount, message, success = true) {
  if (window.parent === window) return;
  window.parent.postMessage(
    {
      type: "SPATIAL_GEOMETRY_DELETED",
      assetId: assetId || "",
      deletedCount,
      success,
      message,
    },
    "*"
  );
}

function clearLocalStorage() {
  try {
    localStorage.removeItem(getStorageKey());
  } catch (error) {
    console.warn("localStorage clear failed:", error);
  }
}

async function loadFeatures() {
  setStatus("Loading features...");

  const apiFeatures = await api.listFeatures(context);
  state.hiddenAutoFeatureIds = loadHiddenAutoFromLocalStorage();
  const autoFeatures = apiFeatures.filter(
    (feature) => feature.isAuto && !state.hiddenAutoFeatureIds.has(feature.id)
  );
  const seededUserFeatures = apiFeatures.filter((feature) => !feature.isAuto);
  const storedFeatures = loadFromLocalStorage();

  const userFeatures =
    storedFeatures && storedFeatures.length > 0 ? storedFeatures : seededUserFeatures;

  const mergedFeatures = dedupeFeaturesById([...autoFeatures, ...userFeatures]);
  state.features = normalizeFeatureNames(filterFeaturesForLayout(mergedFeatures));
  state.selectedFeatureId = null;
  state.selectedAssetId = null;
  mapAdapter.renderFeatures(state.features);
  renderFeatureList();
  setStatus(
    `Loaded ${userFeatures.length} user feature(s) and ${autoFeatures.length} simulated placement(s).`
  );
}

async function deleteSelectedFeature() {
  if (!state.selectedFeatureId) {
    setStatus("Select a feature to delete.");
    return;
  }

  const feature = featureById(state.selectedFeatureId);
  if (!feature) return;
  if (feature.isAuto) {
    setStatus("Simulated placements are read-only. Delete user-created geometry only.");
    return;
  }

  await api.deleteFeature(context, feature.id);
  mapAdapter.removeFeature(feature.id);
  removeLocal(feature.id);
  saveToLocalStorage();
  renderFeatureList();
  setStatus(`Deleted ${feature.name}.`);
}

async function deleteGeometryForAsset(assetId) {
  if (!assetId) {
    setStatus("No component selected for delete.");
    notifyParentGeometryDeleted(assetId, 0, "No component selected.", false);
    return;
  }

  const canDeleteGeometry = geometryEditingEnabled || mapOnlyEditEnabled;
  if (!canDeleteGeometry) {
    const msg = "Enable edit mode first to delete map geometry.";
    setStatus(msg);
    notifyParentGeometryDeleted(assetId, 0, msg, false);
    return;
  }

  const linked = state.features.filter((feature) => feature.assetId === assetId);
  if (!linked.length) {
    const msg = "No map geometry found for this component.";
    setStatus(msg);
    notifyParentGeometryDeleted(assetId, 0, msg, true);
    return;
  }

  let deletedCount = 0;
  for (const feature of linked) {
    if (feature.isAuto) {
      state.hiddenAutoFeatureIds.add(feature.id);
      mapAdapter.removeFeature(feature.id);
      removeLocal(feature.id);
      deletedCount += 1;
      continue;
    }

    await api.deleteFeature(context, feature.id);
    mapAdapter.removeFeature(feature.id);
    removeLocal(feature.id);
    deletedCount += 1;
  }

  saveToLocalStorage();
  saveHiddenAutoToLocalStorage();
  renderFeatureList();

  const linkedName = assetById(assetId)?.name || "component";
  const msg = `Deleted ${deletedCount} map item(s) for ${linkedName}.`;
  setStatus(msg);
  notifyParentGeometryDeleted(assetId, deletedCount, msg, true);
}

async function deleteGeometryForCurrentSelection() {
  const selectedFeature = state.selectedFeatureId ? featureById(state.selectedFeatureId) : null;
  const selectedAssetId = selectedFeature?.assetId || state.selectedAssetId || "";

  if (!selectedAssetId) {
    const msg = "Select map geometry first, then delete.";
    setStatus(msg);
    notifyParentGeometryDeleted(selectedAssetId, 0, msg, false);
    return;
  }

  await deleteGeometryForAsset(selectedAssetId);
}

async function renameSelectedFeature() {
  setStatus("Feature names come from the linked component and cannot be edited.");
}

async function saveAll() {
  setStatus("Saving all features...");

  const userFeatures = state.features.filter((feature) => !feature.isAuto);
  await api.replaceAll(context, userFeatures);
  saveToLocalStorage();

  const refreshed = await api.listFeatures(context);
  state.features = dedupeFeaturesById(refreshed);
  renderFeatureList();
  setStatus(`Saved ${userFeatures.length} user feature(s). Simulated placements refreshed.`);
}

async function resetAllUserGeometry() {
  const removable = state.features.filter((feature) => !feature.isAuto);
  removable.forEach((feature) => mapAdapter.removeFeature(feature.id));

  state.features = state.features.filter((feature) => feature.isAuto);
  state.selectedFeatureId = null;
  state.selectedAssetId = null;

  await api.replaceAll(context, []);
  clearLocalStorage();

  renderFeatureList();
  updateActionButtons();
  setStatus("All map geometry cleared.");
}

function wireEvents() {
  if (ui.contextChip) {
    ui.contextChip.textContent = `Property ${context.propertyId} | Asset ${context.assetId || "-"} | Mode ${context.mode}`;
  }

  ui.toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setTool(button.dataset.tool);
    });
  });

  ui.deleteBtn.addEventListener("click", () => {
    deleteSelectedFeature().catch((error) => setStatus(error.message));
  });

  ui.renameBtn.addEventListener("click", () => {
    renameSelectedFeature().catch((error) => setStatus(error.message));
  });

  ui.saveBtn.addEventListener("click", () => {
    saveAll().catch((error) => setStatus(error.message));
  });

  ui.reloadBtn.addEventListener("click", () => {
    loadFeatures().catch((error) => setStatus(error.message));
  });
}

function scrollActiveItemIntoView() {
  const activeItem = ui.featureList.querySelector(".feature-item.active");
  if (activeItem) {
    activeItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

async function start() {
  wireEvents();

  // Load assets before loading features (so auto-features can be generated)
  await loadAndRegisterAssets();

  mapAdapter.onFeatureSelected = (featureId) => {
    state.selectedFeatureId = featureId;
    const feature = featureById(featureId);
    state.selectedAssetId = feature?.assetId || null;
    if (state.selectedAssetId) {
      ensureAssetPathExpanded(state.selectedAssetId);
    }
    updateActionButtons();
    renderFeatureList();
    if (feature) {
      notifyParentMapObjectSelected(feature, "map");
      setStatus(`Selected ${feature.name}`);
    }
    scrollActiveItemIntoView();
  };

  mapAdapter.onMapBackgroundClick = () => {
    state.selectedFeatureId = null;
    state.selectedAssetId = null;
    updateActionButtons();
    renderFeatureList();
    setStatus("No component selected.");

    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: "SPATIAL_MAP_OBJECT_SELECTED",
          assetId: "",
          featureId: null,
          shouldOpenDetail: false,
        },
        "*"
      );
    }
  };

  mapAdapter.onFeatureChanged = async (featureId, geometry) => {
    const feature = featureById(featureId);
    if (!feature) return;
    if (!geometryEditingEnabled) {
      setStatus("Enable edit mode first to modify map geometry.");
      return;
    }
    if (feature.isAuto && !mapOnlyEditEnabled) {
      setStatus("Simulated placements are read-only.");
      return;
    }

    const updated = await api.upsertFeature(context, {
      ...feature,
      name: linkedFeatureName(feature.assetId, feature.name),
      assetType: assetById(feature.assetId)?.type || feature.assetType,
      assetStatus: assetById(feature.assetId)?.status || feature.assetStatus,
      geometry,
      isAuto: false,
    });
    upsertLocal(updated);
    saveToLocalStorage();
    notifyParentAssetLocation(updated.assetId, updated);
    renderFeatureList();
    setStatus(`Updated ${updated.name}.`);
  };

  mapAdapter.onFeatureCreated = async (draftFeature, overlay) => {
    if (!geometryEditingEnabled) {
      if (overlay?.setMap) overlay.setMap(null);
      setStatus("Enable edit mode first to create map geometry.");
      return;
    }

    // Only auto-link when a component is actively selected in the current map context.
    let linkedAssetId = state.selectedAssetId || "";

    if (!linkedAssetId) {
      const selectedComponentId = await promptComponentLink(linkedAssetId, draftFeature);
      if (!selectedComponentId) {
        overlay.setMap(null);
        setStatus("Shape creation canceled. A linked component is required.");
        return;
      }
      linkedAssetId = selectedComponentId;
    }

    const created = await api.upsertFeature(context, {
      ...draftFeature,
      name: linkedFeatureName(linkedAssetId, featureTypeLabel(draftFeature.type)),
      assetId: linkedAssetId,
      assetType: assetById(linkedAssetId)?.type || draftFeature.assetType,
      assetStatus: assetById(linkedAssetId)?.status || draftFeature.assetStatus,
    });

    mapAdapter.addFeature(created, overlay);
    upsertLocal(created);
    saveToLocalStorage();
    state.selectedFeatureId = created.id;
    mapAdapter.selectFeature(created.id);
    notifyParentAssetLocation(created.assetId, created);
    renderFeatureList();
    setTool(TOOL_MODES.SELECT);
    setStatus(`Created ${created.name}.`);
  };

  await mapAdapter.init();
  await loadFeatures();
  syncLatLonFeatures();

  // If map is launched with a selected asset context, focus that component first.
  if (context.assetId && assetById(context.assetId)) {
    selectAssetContext(context.assetId, { shouldFocusMap: true, selectionSource: "sync" });
  } else {
    // Otherwise use system-level centering fallback.
    centerMapOnSystem();
  }

  // Set tool based on context mode (for asset-first workflows)
  if (context.mode === TOOL_MODES.POLYGON) {
    setTool(TOOL_MODES.POLYGON);
    setStatus(
      context.assetId
        ? `Ready to draw polygon for asset ${context.assetId}. Click on the map to start.`
        : "Ready to draw polygon. Click on the map to start and then link or create a component."
    );
  } else if (context.mode === TOOL_MODES.POLYLINE) {
    setTool(TOOL_MODES.POLYLINE);
    setStatus(
      context.assetId
        ? `Ready to draw line for asset ${context.assetId}. Click on the map to start.`
        : "Ready to draw line. Click on the map to start and then link or create a component."
    );
  } else if (context.mode === TOOL_MODES.MARKER) {
    setTool(TOOL_MODES.MARKER);
    setStatus(
      context.assetId
        ? `Ready to place marker for asset ${context.assetId}. Click on the map.`
        : "Ready to place marker. Click on the map and then link or create a component."
    );
  } else if (mapOnlyEditEnabled) {
    setTool(TOOL_MODES.SELECT);
    setStatus("Edit mode active. Select geometry or pick Add Marker from mobile controls.");
  } else {
    setTool(TOOL_MODES.SELECT);
  }
}

start().catch((error) => {
  setStatus(`Initialization error: ${error.message}`);
});

// Listen for live asset data pushed from parent page (when embedded as iframe in desktop)
window.addEventListener("message", (event) => {
  const msg = event.data;
  if (!msg) return;

  if (msg.type === "SPATIAL_RESET_GEOMETRY") {
    resetAllUserGeometry().catch((error) => {
      setStatus(error?.message || "Unable to clear map geometry.");
    });
    return;
  }

  if (msg.type === "SPATIAL_DELETE_ASSET_GEOMETRY") {
    deleteGeometryForAsset(msg.assetId).catch((error) => {
      const errorMessage = error?.message || "Delete geometry failed.";
      setStatus(errorMessage);
      notifyParentGeometryDeleted(msg.assetId, 0, errorMessage, false);
    });
    return;
  }

  if (msg.type === "SPATIAL_DELETE_SELECTED_GEOMETRY") {
    deleteGeometryForCurrentSelection().catch((error) => {
      const errorMessage = error?.message || "Delete geometry failed.";
      setStatus(errorMessage);
      notifyParentGeometryDeleted("", 0, errorMessage, false);
    });
    return;
  }

  if (msg.type === "SPATIAL_SET_EDIT_MODE") {
    setGeometryEditingEnabled(Boolean(msg.enabled));
    if (!geometryEditingEnabled) {
      setTool(TOOL_MODES.SELECT);
      setStatus("Edit mode is off. Map geometry is read-only.");
    }
    return;
  }

  if (msg.type === "SPATIAL_SET_TOOL") {
    const requestedTool = String(msg.tool || TOOL_MODES.SELECT).toLowerCase();
    const nextTool =
      requestedTool === TOOL_MODES.MARKER ||
      requestedTool === TOOL_MODES.POLYGON ||
      requestedTool === TOOL_MODES.POLYLINE
        ? requestedTool
        : TOOL_MODES.SELECT;
    setTool(nextTool);
    return;
  }

  if (msg.type === "SPATIAL_SELECT_ASSET_CONTEXT") {
    const assetId = String(msg.assetId || "").trim();
    if (!assetId) return;
    selectAssetContext(assetId, { shouldFocusMap: msg.shouldFocusMap !== false, selectionSource: "sync" });
    return;
  }

  if (msg.type !== "SPATIAL_PROTO_ASSETS") return;
  if (!Array.isArray(msg.assets)) return;

  const incomingAssets = msg.assets;
  const preservedContextAssets = state.assets.filter((asset) => {
    const typeKey = String(asset?.type || "").toLowerCase();
    return typeKey === "system" || typeKey === "source";
  });

  const incomingIds = new Set(incomingAssets.map((asset) => asset.id));
  const mergedAssets = [
    ...preservedContextAssets.filter((asset) => !incomingIds.has(asset.id)),
    ...incomingAssets,
  ];

  state.assets = mergedAssets;
  state.assetMap = {};
  state.assets.forEach((asset) => {
    state.assetMap[asset.id] = asset;
  });
  api.registerAssets(msg.propertyId || context.propertyId, state.assets);
  syncLatLonFeatures();

  // Center map on system if it has lat/lon
  centerMapOnSystem();

  renderFeatureList();
});
