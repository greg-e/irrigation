import {
  TOOL_MODES,
  parseContextFromUrl,
  featureTypeLabel,
  newFeatureName,
} from "./core/contracts.js";
import { SpatialFeatureApi } from "./core/fakeApi.js";
import { GoogleMapAdapter } from "./core/googleMapAdapter.js";

const config = window.SPATIAL_PROTO_CONFIG || {};
const context = parseContextFromUrl();

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
    // Try to load seed data (same location as property_record.js uses)
    const response = await fetch("../desktop/seed_data.json");
    if (!response.ok) {
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
    if (current.type === "System") {
      return current;
    }

    visited.add(current.id);
    current = current.parentId ? assetById(current.parentId) : null;
  }

  return null;
}

function getPropertySystem() {
  return state.assets.find((asset) => asset.type === "System" && asset.status !== "Retired") || null;
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

function updateActionButtons() {
  const selectedFeature = state.selectedFeatureId ? featureById(state.selectedFeatureId) : null;
  const hasSelection = Boolean(selectedFeature && !selectedFeature.isAuto);
  ui.renameBtn.disabled = !hasSelection;
  ui.deleteBtn.disabled = !hasSelection;
}

function updateFeatureCount() {
  if (!ui.featureCount) return;
  const activeAssetCount = state.assets.filter((asset) => asset.status !== "Retired").length;
  ui.featureCount.textContent = activeAssetCount;
}

function componentCandidates() {
  const componentTypes = new Set(["Valve", "Head", "Drip", "Pump", "Backflow"]);
  return state.assets
    .filter((asset) => asset.status !== "Retired" && componentTypes.has(asset.type))
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
    System: "layers",
    Controller: "target",
    Zone: "record",
    Backflow: "refresh",
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
    li.innerHTML = "<p class=\"feature-label\">No assets in hierarchy</p><p class=\"feature-meta\">No active system assets found for this property.</p>";
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
    Controller: 1,
    Pump: 2,
    Backflow: 3,
    Zone: 4,
    Valve: 5,
    Head: 6,
    Drip: 7,
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

    li.innerHTML = `
      <p class="feature-label"><span class="hierarchy-label">${toggleControl}<span class="feature-type-icon ${asset.type}">${icon}</span>${asset.name}</span></p>
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

  state.features = [...autoFeatures, ...userFeatures];
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
  if (!state.selectedFeatureId) {
    setStatus("Select a feature to rename.");
    return;
  }

  const feature = featureById(state.selectedFeatureId);
  if (!feature) return;
  if (feature.isAuto) {
    setStatus("Simulated placements are read-only. Rename user-created geometry only.");
    return;
  }

  const dialog = document.getElementById("rename-dialog");
  const backdrop = document.getElementById("rename-backdrop");
  const input = document.getElementById("rename-input");
  const confirmBtn = document.getElementById("rename-confirm");
  const cancelBtn = document.getElementById("rename-cancel");
  const cancelHeaderBtn = document.getElementById("rename-cancel-header");

  input.value = feature.name;
  input.select();
  
  // Show modal with backdrop
  dialog.showModal();
  backdrop.classList.remove("slds-backdrop_hide");
  backdrop.classList.add("slds-backdrop_open");

  return new Promise((resolve) => {
    const cleanup = () => {
      dialog.close();
      backdrop.classList.add("slds-backdrop_hide");
      backdrop.classList.remove("slds-backdrop_open");
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
      cancelHeaderBtn.removeEventListener("click", onCancel);
      input.removeEventListener("keydown", onKeyDown);
    };

    const onConfirm = async () => {
      const nextName = input.value.trim();
      if (!nextName) {
        setStatus("Feature name cannot be empty.");
        return;
      }

      const updated = await api.upsertFeature(context, {
        ...feature,
        name: nextName,
      });

      upsertLocal(updated);
      renderFeatureList();
      setStatus(`Renamed to ${updated.name}.`);
      cleanup();
      resolve();
    };

    const onCancel = () => {
      cleanup();
      resolve();
    };

    const onKeyDown = (e) => {
      if (e.key === "Enter") {
        onConfirm();
      } else if (e.key === "Escape") {
        onCancel();
      }
    };

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
    cancelHeaderBtn.addEventListener("click", onCancel);
    input.addEventListener("keydown", onKeyDown);
  });
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
      geometry,
    });
    upsertLocal(updated);
    renderFeatureList();
    setStatus(`Updated ${updated.name}.`);
  };

  mapAdapter.onFeatureCreated = async (draftFeature, overlay) => {
    let linkedAssetId = context.assetId || state.selectedAssetId || "";

    if (draftFeature.type === TOOL_MODES.MARKER) {
      const selectedComponentId = await promptComponentLink(linkedAssetId);
      if (selectedComponentId === null) {
        overlay.setMap(null);
        setStatus("Point creation canceled.");
        return;
      }
      linkedAssetId = selectedComponentId;
    }

    const created = await api.upsertFeature(context, {
      ...draftFeature,
      name: newFeatureName(draftFeature.type, state.features.length),
      assetId: linkedAssetId,
    });

    mapAdapter.addFeature(created, overlay);
    upsertLocal(created);
    state.selectedFeatureId = created.id;
    mapAdapter.selectFeature(created.id);
    renderFeatureList();
    setTool(TOOL_MODES.SELECT);
    setStatus(`Created ${created.name}.`);
  };

  await mapAdapter.init();
  await loadFeatures();
  
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
