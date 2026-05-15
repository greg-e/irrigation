const STORAGE_KEY = "desktopAssetSetupPrototypeV3";

const STATUS_ORDER = {
  "In Progress": 0,
  "Not Started": 1,
  Complete: 2,
};

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

function normalizeAssetType(type) {
  if (type === "Pump") return "System";
  if (type === "Sensor") return "Head";
  if (type === "Drip_Line") return "Drip";
  return type;
}

function migratePropertyToHierarchy(property) {
  property.assets = Array.isArray(property.assets) ? property.assets : [];

  const hasSystemRoot = typeof property.hasSystemRoot === "boolean" ? property.hasSystemRoot : Boolean(property.hasPumpSystem);
  const trackZoneComponents =
    typeof property.trackZoneComponents === "boolean" ? property.trackZoneComponents : Boolean(property.hasSensors);

  property.hasSystemRoot = hasSystemRoot;
  property.trackZoneComponents = trackZoneComponents;

  property.assets.forEach((asset) => {
    const originalType = asset.type;
    asset.type = normalizeAssetType(asset.type);
    if (originalType === "Pump") {
      if (!asset.name) {
        asset.name = "Irrigation System";
      }
    }
    if (asset.type === "System" && asset.name && /pump/i.test(asset.name)) {
      asset.name = asset.name.replace(/pump/gi, "System");
    }
    if (asset.type === "System" && !asset.name) {
      asset.name = "Irrigation System";
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

  delete property.hasPumpSystem;
  delete property.hasSensors;

  const hasSystemChildren = property.assets.some(
    (a) => a.status !== "Retired" && (a.type === "Controller" || a.type === "Backflow")
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
        (asset.type === "Controller" || asset.type === "Backflow") &&
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
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return deepClone(seed);
  }

  if (!Array.isArray(parsed.properties)) {
    parsed.properties = deepClone(seed.properties || []);
  }
  if (Array.isArray(parsed.properties)) {
    parsed.properties.forEach((prop) => {
      migratePropertyToHierarchy(prop);
    });
  }
  if (!Array.isArray(parsed.amQueue)) {
    parsed.amQueue = deepClone(seed.amQueue || []);
  }
  parsed.amQueue = parsed.amQueue.map((item) => ({
    ...item,
    issue:
      item.issue === "Upgrade to smart weather sensor controller"
        ? "Upgrade to smart weather-aware controller"
        : item.issue,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  return parsed;
}

let state = null;

const els = {
  queueBody: document.getElementById("queue-body"),
  totalRecords: document.getElementById("total-records"),
  displayedRecords: document.getElementById("displayed-records"),
  amQueueBody: document.getElementById("am-queue-body"),
  amOpenCount: document.getElementById("am-open-count"),
  amNeedsInfoCount: document.getElementById("am-needs-info-count"),
  amApprovedCount: document.getElementById("am-approved-count"),
  inspectionsQueueBody: document.getElementById("inspections-queue-body"),
  inspCompletedCount: document.getElementById("insp-completed-count"),
  inspRepairsCount: document.getElementById("insp-repairs-count"),
  inspPartialCount: document.getElementById("insp-partial-count"),
  resetDemo: document.getElementById("reset-demo"),
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function activeAssets(property) {
  return property.assets.filter((a) => a.status !== "Retired");
}

function placeholderCount(property) {
  return activeAssets(property).filter((a) => a.type === "Zone" && a.isPlaceholder).length;
}

function zoneCountForController(property, controllerId) {
  return activeAssets(property).filter((a) => a.type === "Zone" && a.parentId === controllerId).length;
}

function firstActiveController(property) {
  return activeAssets(property).find((a) => a.type === "Controller") || null;
}

function firstActiveSystem(property) {
  return activeAssets(property).find((a) => a.type === "System") || null;
}

function topHierarchyAsset(property) {
  return firstActiveSystem(property) || firstActiveController(property) || null;
}

function parentSystemForController(property, controller) {
  if (!controller || !controller.parentId) return null;
  return activeAssets(property).find((a) => a.id === controller.parentId && a.type === "System") || null;
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function fmtDateOnly(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function addDays(iso, days) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function reportQueue() {
  return state.properties
    .sort((a, b) => {
      const aOrder = STATUS_ORDER[a.status] ?? 9;
      const bOrder = STATUS_ORDER[b.status] ?? 9;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    });
}

function statusChip(status) {
  const cls =
    status === "Complete"
      ? "status-complete"
      : status === "In Progress"
      ? "status-in-progress"
      : "status-not-started";
  return `<span class="status-chip ${cls}">${status}</span>`;
}

function renderQueue() {
  const rows = reportQueue();
  els.totalRecords.textContent = state.properties.length.toLocaleString();
  els.displayedRecords.textContent = rows.length.toLocaleString();

  els.queueBody.innerHTML = rows
    .map((p) => {
      const systemRoot = firstActiveSystem(p);
      const topAsset = topHierarchyAsset(p);
      const controllerCount = activeAssets(p).filter((a) => a.type === "Controller").length;
      const totalZones = activeAssets(p).filter((a) => a.type === "Zone").length;
      const placeholderZones = placeholderCount(p);
      const lastAssetUpdate = fmtDateOnly(p.updatedAt);
      const systemName = systemRoot ? systemRoot.name : "No System";
      const systemCell = topAsset
        ? `<a href="property_record.html?property=${p.id}&asset=${topAsset.id}" target="_blank" rel="noopener">${systemName}</a>`
        : systemName;
      return `<tr>
        <td>${p.branch}</td>
        <td>${p.name}</td>
        <td>${statusChip(p.status)}</td>
        <td>${systemCell}</td>
        <td>${controllerCount}</td>
        <td>${totalZones}</td>
        <td>${placeholderZones}</td>
        <td>${lastAssetUpdate}</td>
      </tr>`;
    })
    .join("");
}

function amStatusChip(status) {
  const cls =
    status === "Approved"
      ? "status-complete"
      : status === "Needs Info"
      ? "status-in-progress"
      : status === "Dismissed"
      ? "status-not-started"
      : "status-not-started";
  return `<span class="status-chip ${cls}">${status}</span>`;
}

function renderAmQueue() {
  if (!els.amQueueBody || !els.amOpenCount || !els.amNeedsInfoCount || !els.amApprovedCount) {
    return;
  }

  const queue = [...state.amQueue].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const openCount = queue.filter((item) => item.status === "Pending Review").length;
  const needsInfoCount = queue.filter((item) => item.status === "Needs Info").length;
  const approvedCount = queue.filter((item) => item.status === "Approved").length;

  els.amOpenCount.textContent = openCount.toLocaleString();
  els.amNeedsInfoCount.textContent = needsInfoCount.toLocaleString();
  els.amApprovedCount.textContent = approvedCount.toLocaleString();

  els.amQueueBody.innerHTML = queue
    .map((item) => {
      const disableApprove = item.status === "Approved";
      const disableNeedsInfo = item.status === "Needs Info";
      const disableDismiss = item.status === "Dismissed";

      return `<tr>
        <td>${item.propertyName}</td>
        <td>${item.assetName}</td>
        <td>${item.calloutType}</td>
        <td>${item.issue}</td>
        <td>${item.amName}</td>
        <td>${amStatusChip(item.status)}</td>
        <td>
          <div class="am-actions">
            <button class="slds-button slds-button_brand am-action-btn" data-am-action="approve" data-am-id="${item.id}" ${disableApprove ? "disabled" : ""}>Approve</button>
            <button class="slds-button slds-button_neutral am-action-btn" data-am-action="needs-info" data-am-id="${item.id}" ${disableNeedsInfo ? "disabled" : ""}>Needs Info</button>
            <button class="slds-button slds-button_destructive am-action-btn" data-am-action="dismiss" data-am-id="${item.id}" ${disableDismiss ? "disabled" : ""}>Dismiss</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");
}

function renderInspectionsQueue() {
  if (!els.inspectionsQueueBody) return;

  const rows = [];
  (state.properties || []).forEach((prop) => {
    (prop.inspections || []).forEach((insp) => {
      rows.push({ propertyName: prop.name, ...insp });
    });
  });

  rows.sort((a, b) => {
    if (!a.completedAt && !b.completedAt) return 0;
    if (!a.completedAt) return 1;
    if (!b.completedAt) return -1;
    return new Date(b.completedAt) - new Date(a.completedAt);
  });

  const completed = rows.filter((r) => r.completionStatus === "Completed").length;
  const repairs = rows.filter((r) => r.overallStatus === "Operational with Repairs Needed" || r.overallStatus === "Partial Outage" || r.overallStatus === "Full Outage").length;
  const partial = rows.filter((r) => r.completionStatus === "Partially Completed" || r.completionStatus === "Not Started").length;

  if (els.inspCompletedCount) els.inspCompletedCount.textContent = completed.toLocaleString();
  if (els.inspRepairsCount) els.inspRepairsCount.textContent = repairs.toLocaleString();
  if (els.inspPartialCount) els.inspPartialCount.textContent = partial.toLocaleString();

  const statusTheme = {
    "Operational": "status-complete",
    "Operational with Repairs Needed": "status-in-progress",
    "Partial Outage": "status-incomplete",
    "Full Outage": "status-incomplete",
  };
  const completionTheme = {
    "Completed": "status-complete",
    "Partially Completed": "status-in-progress",
    "Not Started": "status-not-started",
  };

  if (!rows.length) {
    els.inspectionsQueueBody.innerHTML = `<tr><td colspan="8" class="slds-text-align_center slds-p-around_medium slds-text-color_weak">No inspection records across any property.</td></tr>`;
    return;
  }

  els.inspectionsQueueBody.innerHTML = rows
    .map((r) => {
      const overallBadge = r.overallStatus
        ? `<span class="status-chip ${statusTheme[r.overallStatus] || ""}">${r.overallStatus}</span>`
        : "—";
      const completionBadge = `<span class="status-chip ${completionTheme[r.completionStatus] || ""}">${r.completionStatus}</span>`;
      return `<tr>
        <td>${r.propertyName}</td>
        <td>${r.saNumber}</td>
        <td>${r.completedAt ? new Date(r.completedAt).toLocaleDateString() : "—"}</td>
        <td>${r.inspectionType}</td>
        <td>${r.technician}</td>
        <td>${overallBadge}</td>
        <td>${r.calloutCount}</td>
        <td>${completionBadge}</td>
      </tr>`;
    })
    .join("");
}

function bindEvents() {
  if (els.resetDemo) {
    els.resetDemo.addEventListener("click", async () => {
      if (!confirm("Reset all demo data?")) return;
      state = await getSeedData();
      saveState();
      renderQueue();
      renderAmQueue();
      renderInspectionsQueue();
    });
  }

  if (els.amQueueBody) {
    els.amQueueBody.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-am-action]");
      if (!button) return;

      const queueItem = state.amQueue.find((item) => item.id === button.dataset.amId);
      if (!queueItem) return;

      if (button.dataset.amAction === "approve") {
        queueItem.status = "Approved";
      }
      if (button.dataset.amAction === "needs-info") {
        queueItem.status = "Needs Info";
      }
      if (button.dataset.amAction === "dismiss") {
        queueItem.status = "Dismissed";
      }

      queueItem.updatedAt = new Date().toISOString();
      saveState();
      renderAmQueue();
    });
  }
}

async function init() {
  state = await loadState();
  bindEvents();
  renderQueue();
  renderAmQueue();
  renderInspectionsQueue();
}

init().catch((error) => {
  console.error("Failed to initialize desktop prototype", error);
});
