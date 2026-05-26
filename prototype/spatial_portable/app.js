import {
  TOOL_MODES,
  parseContextFromUrl,
  featureTypeLabel,
} from "./core/contracts.js";
import { SpatialFeatureApi } from "./core/fakeApi.js";
import { GoogleMapAdapter } from "./core/googleMapAdapter.js";

const config = window.SPATIAL_PROTO_CONFIG || {};
const context = parseContextFromUrl();
const layoutMode = new URLSearchParams(window.location.search).get("layout") || "default";

if (layoutMode === "map-only") {
  document.body.classList.add("map-only-layout");
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
  linkBackdrop: document.getElementById("link-backdrop"),
  linkSelect: document.getElementById("link-component-select"),
  linkConfirm: document.getElementById("link-confirm"),
  linkSkip: document.getElementById("link-skip"),
  linkCancelHeader: document.getElementById("link-cancel-header"),
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
};

const api = new SpatialFeatureApi();

const mapAdapter = new GoogleMapAdapter(document.getElementById("map-root"), {
  apiKey: config.googleMapsApiKey,
  center: config.defaultCenter || { lat: 33.91551710426391, lng: -84.51719913959514 },
  zoom: Number(config.defaultZoom || 15),
});

function setStatus(message) {
  ui.status.textContent = message;
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

function centerMapOnSystem() {
  if (!mapAdapter.map) return false;
  const systemAsset = getPropertySystem();
  if (!systemAsset || systemAsset.lat == null || systemAsset.lon == null) return false;
  const lat = Number(systemAsset.lat);
  const lon = Number(systemAsset.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  mapAdapter.map.setCenter({ lat, lng: lon });

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
    const linkedName = linkedFeatureName(feature.assetId, feature.name);
    if (!linkedName || linkedName === feature.name) {
      return feature;
    }
    return {
      ...feature,
      name: linkedName,
    };
  });
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

async function promptComponentLink(defaultAssetId = "") {
  const dialog = ui.linkDialog;
  const backdrop = ui.linkBackdrop;
  const select = ui.linkSelect;
  const confirmBtn = ui.linkConfirm;
  const skipBtn = ui.linkSkip;
  const cancelHeaderBtn = ui.linkCancelHeader;

  if (!dialog || !backdrop || !select || !confirmBtn || !skipBtn || !cancelHeaderBtn) {
    return defaultAssetId || "";
  }

  const options = componentCandidates();
  select.innerHTML = options.length
    ? options
        .map((asset) => `<option value="${asset.id}">${asset.type}: ${asset.name}</option>`)
        .join("")
    : "<option value=\"\">No components available</option>";

  const preferred =
    (defaultAssetId && options.find((item) => item.id === defaultAssetId)?.id) ||
    state.selectedAssetId ||
    options[0]?.id ||
    "";
  select.value = preferred;
  confirmBtn.disabled = options.length === 0;

  dialog.showModal();
  backdrop.classList.remove("slds-backdrop_hide");
  backdrop.classList.add("slds-backdrop_open");

  return new Promise((resolve) => {
    const close = (result) => {
      dialog.close();
      backdrop.classList.add("slds-backdrop_hide");
      backdrop.classList.remove("slds-backdrop_open");
      confirmBtn.removeEventListener("click", onConfirm);
      skipBtn.removeEventListener("click", onSkip);
      cancelHeaderBtn.removeEventListener("click", onCancel);
      resolve(result);
    };

    const onConfirm = () => close(select.value || "");
    const onSkip = () => close("");
    const onCancel = () => close(null);

    confirmBtn.addEventListener("click", onConfirm);
    skipBtn.addEventListener("click", onSkip);
    cancelHeaderBtn.addEventListener("click", onCancel);
  });
}

function getAssetTypeIcon(assetType) {
  const typeMap = {
    System: "asset_object",
    Source: "location",
    Backflow: "water",
    Controller: "clock",
    Zone: "choice",
    Pump: "location",
    Valve: "trail",
    Head: "location",
    Drip: "trail",
  };
  const icon = typeMap[assetType] || "record";
  return `<svg class="feature-type-icon-svg" viewBox="0 0 520 520" aria-hidden="true"><use href="salesforce-lightning-design-system-icons/utility-sprite/svg/symbols.svg#${icon}"></use></svg>`;
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

function renderFeatureList() {
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
    const gpsBadge =
      hasLatLon && !hasDrawnGeometry
        ? `<span class="latlon-badge" title="Placed by GPS coordinates only">GPS</span>`
        : "";

    li.innerHTML = `
      <p class="feature-label"><span class="hierarchy-label">${toggleControl}<button type="button" class="asset-selector" data-select-asset="${asset.id}" title="Select for map context"><span class="feature-type-icon ${asset.type}">${icon}</span></button><span class="asset-name">${escapeHtml(asset.name)}</span><a class="record-link" href="${assetUrl}" target="_parent" title="Open component record" aria-label="Open ${escapeHtml(asset.name)} record"><svg viewBox="0 0 520 520" aria-hidden="true"><use href="salesforce-lightning-design-system-icons/utility-sprite/svg/symbols.svg#open"></use></svg></a>${gpsBadge}</span></p>
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
        state.selectedAssetId = asset.id;
        ensureAssetPathExpanded(asset.id);

        const linkedFeature = linkedFeatures[0] || null;
        if (linkedFeature) {
          state.selectedFeatureId = linkedFeature.id;
          mapAdapter.selectFeature(linkedFeature.id);
          setStatus(`Selected ${asset.name} with mapped geometry ${linkedFeature.name}.`);
        } else {
          state.selectedFeatureId = null;
          setStatus(`Selected ${asset.name}. No mapped geometry yet.`);
        }

        updateActionButtons();
        renderFeatureList();
      });
    }

    li.addEventListener("click", () => {
      state.selectedAssetId = asset.id;
      ensureAssetPathExpanded(asset.id);

      const linkedFeature = linkedFeatures[0] || null;
      if (linkedFeature) {
        state.selectedFeatureId = linkedFeature.id;
        mapAdapter.selectFeature(linkedFeature.id);
        setStatus(`Selected ${asset.name} with mapped geometry ${linkedFeature.name}.`);
      } else {
        state.selectedFeatureId = null;
        setStatus(`Selected ${asset.name}. No mapped geometry yet.`);
      }

      updateActionButtons();
      renderFeatureList();
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

function syncLatLonFeatures() {
  if (!mapAdapter.map) return;

  // Remove stale lat/lon auto-markers
  state.features
    .filter((f) => f.isLatLon)
    .forEach((f) => mapAdapter.removeFeature(f.id));
  state.features = state.features.filter((f) => !f.isLatLon);

  // Add a marker for every active asset that has lat+lon
  state.assets
    .filter((a) => a.status !== "Retired" && a.lat != null && a.lon != null)
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
    return Array.isArray(parsed) ? parsed.filter((feature) => !feature?.isAuto) : null;
  } catch (error) {
    console.warn("localStorage load failed:", error);
    return null;
  }
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
  const autoFeatures = apiFeatures.filter((feature) => feature.isAuto);
  const seededUserFeatures = apiFeatures.filter((feature) => !feature.isAuto);
  const storedFeatures = loadFromLocalStorage();

  const userFeatures =
    storedFeatures && storedFeatures.length > 0 ? storedFeatures : seededUserFeatures;

  state.features = normalizeFeatureNames([...autoFeatures, ...userFeatures]);
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
  renderFeatureList();
  setStatus(`Deleted ${feature.name}.`);
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
  state.features = refreshed;
  renderFeatureList();
  setStatus(`Saved ${userFeatures.length} user feature(s). Simulated placements refreshed.`);
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
      setStatus(`Selected ${feature.name}`);
    }
    scrollActiveItemIntoView();
  };

  mapAdapter.onFeatureChanged = async (featureId, geometry) => {
    const feature = featureById(featureId);
    if (!feature) return;
    if (feature.isAuto) {
      setStatus("Simulated placements are read-only.");
      return;
    }

    const updated = await api.upsertFeature(context, {
      ...feature,
      name: linkedFeatureName(feature.assetId, feature.name),
      geometry,
    });
    upsertLocal(updated);
    notifyParentAssetLocation(updated.assetId, updated);
    renderFeatureList();
    setStatus(`Updated ${updated.name}.`);
  };

  mapAdapter.onFeatureCreated = async (draftFeature, overlay) => {
    let linkedAssetId = context.assetId || state.selectedAssetId || "";

    const selectedComponentId = await promptComponentLink(linkedAssetId);
    if (!selectedComponentId) {
      overlay.setMap(null);
      setStatus("Shape creation canceled. A linked component is required.");
      return;
    }
    linkedAssetId = selectedComponentId;

    const created = await api.upsertFeature(context, {
      ...draftFeature,
      name: linkedFeatureName(linkedAssetId, featureTypeLabel(draftFeature.type)),
      assetId: linkedAssetId,
    });

    mapAdapter.addFeature(created, overlay);
    upsertLocal(created);
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

  // Center map on system if it has lat/lon
  centerMapOnSystem();

  // Set tool based on context mode (for asset-first workflows)
  if (context.mode === TOOL_MODES.POLYGON && context.assetId) {
    setTool(TOOL_MODES.POLYGON);
    setStatus(`Ready to draw polygon for asset ${context.assetId}. Click on the map to start.`);
  } else if (context.mode === TOOL_MODES.POLYLINE && context.assetId) {
    setTool(TOOL_MODES.POLYLINE);
    setStatus(`Ready to draw line for asset ${context.assetId}. Click on the map to start.`);
  } else if (context.mode === TOOL_MODES.MARKER && context.assetId) {
    setTool(TOOL_MODES.MARKER);
    setStatus(`Ready to place marker for asset ${context.assetId}. Click on the map.`);
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
  if (!msg || msg.type !== "SPATIAL_PROTO_ASSETS") return;
  if (!Array.isArray(msg.assets)) return;

  state.assets = msg.assets;
  state.assetMap = {};
  msg.assets.forEach((asset) => {
    state.assetMap[asset.id] = asset;
  });
  api.registerAssets(msg.propertyId || context.propertyId, msg.assets);
  syncLatLonFeatures();

  // Center map on system if it has lat/lon
  centerMapOnSystem();

  renderFeatureList();
});
