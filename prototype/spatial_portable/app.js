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
};

const state = {
  tool: TOOL_MODES.SELECT,
  selectedFeatureId: null,
  features: [],
  assets: [], // Will store the property's asset hierarchy
  assetMap: {}, // Map for quick asset lookup by ID
};

const api = new SpatialFeatureApi();

const mapAdapter = new GoogleMapAdapter(document.getElementById("map-root"), {
  apiKey: config.googleMapsApiKey,
  center: config.defaultCenter || { lat: 39.7392, lng: -104.9903 },
  zoom: Number(config.defaultZoom || 19),
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
  const hasSelection = state.selectedFeatureId !== null;
  ui.renameBtn.disabled = !hasSelection;
  ui.deleteBtn.disabled = !hasSelection;
}

function updateFeatureCount() {
  ui.featureCount.textContent = state.features.length;
}

function getTypeIcon(featureType) {
  const typeMap = {
    marker: "📍",
    polyline: "📏",
    polygon: "🔷",
  };
  return typeMap[featureType] || "📌";
}

function renderFeatureList() {
  ui.featureList.innerHTML = "";
  updateFeatureCount();

  if (!state.features.length) {
    const li = document.createElement("li");
    li.className = "feature-item";
    li.innerHTML = "<p class=\"feature-label\">No features yet</p><p class=\"feature-meta\">Create one from the toolbar.</p>";
    ui.featureList.appendChild(li);
    updateActionButtons();
    return;
  }

  state.features.forEach((feature) => {
    const li = document.createElement("li");
    li.className = `feature-item${feature.id === state.selectedFeatureId ? " active" : ""}`;
    const typeIcon = getTypeIcon(feature.type);
    
    // Build asset context line
    let assetContext = "No Asset";
    if (feature.assetId) {
      const assetCtx = getAssetContext(feature);
      if (assetCtx) {
        const parts = [assetCtx.asset.name];
        if (assetCtx.parent && assetCtx.parent.type !== "System") {
          parts.unshift(`${assetCtx.parent.type}: ${assetCtx.parent.name}`);
        }
        assetContext = parts.join(" ← ");
      } else {
        assetContext = feature.assetId;
      }
    }
    
    // For auto-generated features, show asset type badge
    const isAutoFeature = feature.isAuto ? " [Auto]" : "";
    
    li.innerHTML = `
      <p class="feature-label"><span class="feature-type-icon ${feature.type}">${typeIcon}</span>${feature.name}${isAutoFeature}</p>
      <p class="feature-meta">${featureTypeLabel(feature.type)} | ${assetContext}</p>
    `;
    li.addEventListener("click", () => {
      state.selectedFeatureId = feature.id;
      mapAdapter.selectFeature(feature.id);
      renderFeatureList();
      setStatus(`Selected ${feature.name}`);
    });
    ui.featureList.appendChild(li);
  });
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
    localStorage.setItem(getStorageKey(), JSON.stringify(state.features));
  } catch (error) {
    console.warn("localStorage save failed:", error);
  }
}

function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem(getStorageKey());
    return stored ? JSON.parse(stored) : null;
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
  
  // Check localStorage first
  const storedFeatures = loadFromLocalStorage();
  if (storedFeatures && storedFeatures.length > 0) {
    state.features = storedFeatures;
    state.selectedFeatureId = null;
    mapAdapter.renderFeatures(state.features);
    renderFeatureList();
    setStatus(`Loaded ${state.features.length} features from local storage (demo mode).`);
    return;
  }
  
  // Fall back to API
  state.features = await api.listFeatures(context);
  state.selectedFeatureId = null;
  mapAdapter.renderFeatures(state.features);
  renderFeatureList();
  setStatus(`Loaded ${state.features.length} features.`);
}

async function deleteSelectedFeature() {
  if (!state.selectedFeatureId) {
    setStatus("Select a feature to delete.");
    return;
  }

  const feature = featureById(state.selectedFeatureId);
  if (!feature) return;

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
  state.features = await api.replaceAll(context, state.features);
  
  // Persist to localStorage for demo
  saveToLocalStorage();
  
  renderFeatureList();
  setStatus(`Saved ${state.features.length} features (persisted to local storage for demo).`);
}

function wireEvents() {
  ui.contextChip.textContent = `Property ${context.propertyId} | Asset ${context.assetId || "-"} | Mode ${context.mode}`;

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
    updateActionButtons();
    renderFeatureList();
    if (feature) {
      setStatus(`Selected ${feature.name}`);
    }
  };

  mapAdapter.onFeatureChanged = async (featureId, geometry) => {
    const feature = featureById(featureId);
    if (!feature) return;

    const updated = await api.upsertFeature(context, {
      ...feature,
      geometry,
    });
    upsertLocal(updated);
    renderFeatureList();
    setStatus(`Updated ${updated.name}.`);
  };

  mapAdapter.onFeatureCreated = async (draftFeature, overlay) => {
    const created = await api.upsertFeature(context, {
      ...draftFeature,
      name: newFeatureName(draftFeature.type, state.features.length),
      assetId: context.assetId || "",
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
