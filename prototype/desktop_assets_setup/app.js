const STORAGE_KEY = "desktopAssetSetupPrototypeV1";

const STATUS_ORDER = {
  "In Progress": 0,
  "Not Started": 1,
  Complete: 2,
};

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

const els = {
  queueBody: document.getElementById("queue-body"),
  totalRecords: document.getElementById("total-records"),
  displayedRecords: document.getElementById("displayed-records"),
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
      const activeZones = controller ? zoneCountForController(p, controller.id) : 0;
      const placeholderZones = placeholderCount(p);
      const lastAssetUpdate = fmtDateOnly(p.updatedAt);
      const controllerCell = controller
        ? `<a href="property_record.html?property=${p.id}&controller=${controller.id}" target="_blank" rel="noopener">${controller.name}</a>`
        : "No Controller";
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

function bindEvents() {
  els.resetDemo.addEventListener("click", () => {
    if (!confirm("Reset all demo data?")) return;
    state = createSeedData();
    saveState();
    renderQueue();
  });
}

function init() {
  bindEvents();
  renderQueue();
}

init();
