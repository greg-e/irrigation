const STORAGE_KEY = "desktopAssetSetupPrototypeV1";

const STATUS_ORDER = {
  "In Progress": 0,
  "Not Started": 1,
  Complete: 2,
};

function createSeedData() {
  return {
    amQueue: [
      {
        id: "amq-001",
        propertyName: "Oak Ridge HOA Campus",
        assetName: "Zone 3",
        calloutType: "Repair",
        issue: "Broken spray head at north median",
        amName: "Jamie Rivers",
        status: "Pending Review",
        updatedAt: "2026-05-13T16:05:00.000Z",
      },
      {
        id: "amq-002",
        propertyName: "Hillside Commons",
        assetName: "Controller West",
        calloutType: "Enhancement",
        issue: "Upgrade to smart weather-aware controller",
        amName: "Morgan Chen",
        status: "Needs Info",
        updatedAt: "2026-05-13T15:40:00.000Z",
      },
      {
        id: "amq-003",
        propertyName: "Willow Park Retail Center",
        assetName: "Backflow North",
        calloutType: "Repair",
        issue: "Backflow test expired and leaking at union",
        amName: "Alex Patel",
        status: "Pending Review",
        updatedAt: "2026-05-13T14:20:00.000Z",
      },
    ],
    properties: [
      {
        id: "prop-001",
        name: "Oak Ridge HOA Campus",
        branch: "Northeast",
        assignedManager: "Jamie Rivers",
        status: "In Progress",
        hasSystemRoot: true,
        trackZoneComponents: false,
        updatedAt: "2026-05-10T13:12:00.000Z",
        assets: [
          {
            id: "asset-s-1",
            type: "System",
            name: "Irrigation System - Main",
            status: "Active",
            isPlaceholder: false,
            parentId: null,
            zoneNumber: null,
          },
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
            parentId: "asset-s-1",
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
            parentId: "asset-s-1",
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
        hasSystemRoot: false,
        trackZoneComponents: false,
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
        hasSystemRoot: true,
        trackZoneComponents: false,
        updatedAt: "2026-05-07T10:05:00.000Z",
        assets: [
          {
            id: "asset-s-2",
            type: "System",
            name: "Irrigation System - West",
            status: "Active",
            isPlaceholder: false,
            parentId: null,
            zoneNumber: null,
          },
          {
            id: "asset-c-2",
            type: "Controller",
            name: "Controller West",
            controllerLabel: "W",
            makeModel: "Rain Bird ESP-LX",
            totalZones: null,
            status: "Active",
            isPlaceholder: false,
            parentId: "asset-s-2",
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
            parentId: "asset-s-2",
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

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = createSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed.properties)) {
    parsed.properties.forEach((prop) => {
      migratePropertyToHierarchy(prop);
    });
  }
  if (!Array.isArray(parsed.amQueue)) {
    parsed.amQueue = createSeedData().amQueue;
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

let state = loadState();

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

function processStageFor(property) {
  if (property.status === "Complete") return "Active";
  if (property.status === "In Progress") return "Category Review";
  return "Ready for Work";
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
      const controller = firstActiveController(p);
      const systemRoot = firstActiveSystem(p);
      const topAsset = topHierarchyAsset(p);
      const system = parentSystemForController(p, controller);
      const activeZones = controller ? zoneCountForController(p, controller.id) : 0;
      const placeholderZones = placeholderCount(p);
      const lastAssetUpdate = fmtDateOnly(p.updatedAt);
      const hierarchyLabel =
        controller && (system || systemRoot)
          ? `${(system || systemRoot).name} / ${controller.name}`
          : controller
          ? controller.name
          : systemRoot
          ? systemRoot.name
          : "No System";
      const controllerCell = topAsset
        ? `<a href="property_record.html?property=${p.id}&asset=${topAsset.id}" target="_blank" rel="noopener">${hierarchyLabel}</a>`
        : hierarchyLabel;
      return `<tr>
        <td>${p.branch}</td>
        <td>${processStageFor(p)}</td>
        <td>${p.name}</td>
        <td>${controllerCell}</td>
        <td>${activeZones}</td>
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
  els.resetDemo.addEventListener("click", () => {
    if (!confirm("Reset all demo data?")) return;
    state = createSeedData();
    saveState();
    renderQueue();
    renderAmQueue();
    renderInspectionsQueue();
  });

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

function init() {
  bindEvents();
  renderQueue();
  renderAmQueue();
  renderInspectionsQueue();
}

init();
