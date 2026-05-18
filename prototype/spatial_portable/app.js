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

function renderFeatureList() {
  ui.featureList.innerHTML = "";

  if (!state.features.length) {
    const li = document.createElement("li");
    li.className = "feature-item";
    li.innerHTML = "<p class=\"feature-label\">No features yet</p><p class=\"feature-meta\">Create one from the toolbar.</p>";
    ui.featureList.appendChild(li);
    return;
  }

  state.features.forEach((feature) => {
    const li = document.createElement("li");
    li.className = `feature-item${feature.id === state.selectedFeatureId ? " active" : ""}`;
    li.innerHTML = `
      <p class="feature-label">${feature.name}</p>
      <p class="feature-meta">${featureTypeLabel(feature.type)} | ${feature.assetId || "No Asset"}</p>
    `;
    li.addEventListener("click", () => {
      state.selectedFeatureId = feature.id;
      mapAdapter.selectFeature(feature.id);
      renderFeatureList();
      setStatus(`Selected ${feature.name}`);
    });
    ui.featureList.appendChild(li);
  });
}

function setTool(mode) {
  state.tool = mode;
  ui.toolButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === mode);
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
  const input = document.getElementById("rename-input");
  const confirmBtn = document.getElementById("rename-confirm");
  const cancelBtn = document.getElementById("rename-cancel");

  input.value = feature.name;
  input.select();
  dialog.showModal();

  return new Promise((resolve) => {
    const cleanup = () => {
      dialog.close();
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
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

  mapAdapter.onFeatureSelected = (featureId) => {
    state.selectedFeatureId = featureId;
    const feature = featureById(featureId);
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
  setTool(TOOL_MODES.SELECT);
}

start().catch((error) => {
  setStatus(`Initialization error: ${error.message}`);
});
