const state = {
  stage: "INSPECTING",
  controllers: [
    {
      id: "controller-a",
      name: "Controller A",
      model: "Hydrawise HC-12",
      description: "North lawn and clubhouse frontage clock.",
      zones: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
      id: "controller-b",
      name: "Controller B",
      model: "Rain Bird ESP-LX",
      description: "Athletic field and east perimeter clock.",
      zones: [9, 10, 11, 12, 13, 14, 15, 16],
    },
    {
      id: "controller-c",
      name: "Controller C",
      model: "Toro Tempus Pro",
      description: "Pool deck and south slope clock.",
      zones: [17, 18, 19, 20, 21, 22, 23, 24],
    },
  ],
  backflows: [
    {
      id: "bf-01",
      name: "Backflow North",
      serial: "BFN-44210",
      status: "Pass",
      description: "Feeds north campus mainline.",
    },
    {
      id: "bf-02",
      name: "Backflow South",
      serial: "BFS-44211",
      status: "Due Test",
      description: "Feeds south and pool line.",
    },
  ],
  zones: Array.from({ length: 24 }, (_, idx) => {
    const zoneNumber = idx + 1;
    return {
      id: `zone-${zoneNumber}`,
      label: `Zone ${zoneNumber}`,
      status: [3, 11, 18, 22].includes(zoneNumber) ? "alert" : "ok",
      controller: zoneNumber <= 8 ? "Controller A" : zoneNumber <= 16 ? "Controller B" : "Controller C",
      backflow: zoneNumber <= 12 ? "Backflow North" : "Backflow South",
      description: `Coverage area for ${zoneNumber <= 12 ? "north/east" : "south/west"} campus section.`,
    };
  }),
  requiredQuestions: [
    { id: "q1", text: "Controller A serial captured", answered: true },
    { id: "q2", text: "Controller B serial captured", answered: true },
    { id: "q3", text: "Controller C serial captured", answered: true },
    { id: "q4", text: "Backflow North compliance verified", answered: true },
    { id: "q5", text: "Backflow South compliance verified", answered: false },
    { id: "q6", text: "Zone pressure sample for Zones 1-8", answered: false },
    { id: "q7", text: "Zone pressure sample for Zones 9-16", answered: false },
    { id: "q8", text: "Zone pressure sample for Zones 17-24", answered: false },
    { id: "q9", text: "Valve conditions recorded", answered: false },
    { id: "q10", text: "Coverage audit photos uploaded", answered: false },
    { id: "q11", text: "Flow variance captured", answered: false },
    { id: "q12", text: "Customer walkthrough completed", answered: false },
  ],
  callouts: [
    { id: 1, asset: "Zone 3", issue: "Broken Head", severity: "High", confirmed: true },
    { id: 2, asset: "Zone 11", issue: "Valve leak at manifold", severity: "Medium", confirmed: false },
    { id: 3, asset: "Backflow South", issue: "Test window expired", severity: "High", confirmed: true },
  ],
  clockFilter: "ALL",
  amAssigned: false,
  amName: "",
};

const meterFill = document.getElementById("meter-fill");
const meterLabel = document.getElementById("meter-label");
const requiredList = document.getElementById("required-list");
const calloutList = document.getElementById("callout-list");
const calloutForm = document.getElementById("callout-form");
const assetInput = document.getElementById("asset-input");
const issueInput = document.getElementById("issue-input");
const severityInput = document.getElementById("severity-input");
const amName = document.getElementById("am-name");
const amStatus = document.getElementById("am-status");
const submitResult = document.getElementById("submit-result");
const stageChip = document.getElementById("stage-chip");
const navButtons = document.querySelectorAll(".nav-btn");
const navPanels = document.querySelectorAll(".nav-panel");
const mapGrid = document.getElementById("map-grid");
const controllerList = document.getElementById("controller-list");
const backflowList = document.getElementById("backflow-list");
const systemScope = document.getElementById("system-scope");
const assetSnapshot = document.getElementById("asset-snapshot");
const mapCaption = document.getElementById("map-caption");
const clockFilter = document.getElementById("clock-filter");
const calloutContextHint = document.getElementById("callout-context-hint");
const assetForm = document.getElementById("asset-form");
const assetType = document.getElementById("asset-type");
const assetName = document.getElementById("asset-name");
const assetDescription = document.getElementById("asset-description");
const zoneLinks = document.getElementById("zone-links");
const zoneController = document.getElementById("zone-controller");
const zoneBackflow = document.getElementById("zone-backflow");
const descriptionForm = document.getElementById("description-form");
const descriptionAsset = document.getElementById("description-asset");
const descriptionInput = document.getElementById("description-input");

function getRequiredAnswered() {
  return state.requiredQuestions.filter((q) => q.answered).length;
}

function getConfirmedCallouts() {
  return state.callouts.filter((callout) => callout.confirmed).length;
}

function getAlertZonesCount() {
  return state.zones.filter((zone) => zone.status === "alert").length;
}

function getFilteredZones() {
  if (state.clockFilter === "ALL") {
    return state.zones;
  }
  return state.zones.filter((zone) => zone.controller === state.clockFilter);
}

function getAllAssets() {
  const controllers = state.controllers.map((item) => ({
    key: `controller:${item.id}`,
    type: "controller",
    name: item.name,
    description: item.description || "",
    ref: item,
  }));

  const backflows = state.backflows.map((item) => ({
    key: `backflow:${item.id}`,
    type: "backflow",
    name: item.name,
    description: item.description || "",
    ref: item,
  }));

  const zones = state.zones.map((item) => ({
    key: `zone:${item.id}`,
    type: "zone",
    name: item.label,
    description: item.description || "",
    ref: item,
  }));

  return [...controllers, ...backflows, ...zones];
}

function setStage(nextStage) {
  state.stage = nextStage;
  stageChip.textContent = nextStage;
  stageChip.classList.remove("chip-positive", "chip-warning", "chip-danger", "chip-blue");

  if (nextStage === "COMPLETED") {
    stageChip.classList.add("chip-positive");
  } else if (nextStage === "REVIEW") {
    stageChip.classList.add("chip-warning");
  } else if (nextStage === "INSPECTING") {
    stageChip.classList.add("chip-blue");
  } else {
    stageChip.classList.add("chip-danger");
  }

  document.querySelectorAll("#timeline li").forEach((item) => {
    const itemStage = item.dataset.stage;
    item.classList.remove("active", "done");

    const order = ["RESOLVED", "BOOTSTRAP", "INSPECTING", "REVIEW", "COMPLETED"];
    const currentIdx = order.indexOf(nextStage);
    const itemIdx = order.indexOf(itemStage);

    if (itemIdx < currentIdx) {
      item.classList.add("done");
    } else if (itemIdx === currentIdx) {
      item.classList.add("active");
    }
  });
}

function setActiveTab(tabName) {
  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  navPanels.forEach((panel) => {
    const isCheckoutTab = tabName === "checkout";
    if (isCheckoutTab) {
      panel.classList.toggle("active", panel.dataset.panel === "checkout");
      return;
    }
    panel.classList.toggle("active", panel.dataset.panel === tabName);
  });
}

function setSubmitMessage(message, tone) {
  submitResult.textContent = message;
  if (tone === "ok") {
    submitResult.style.color = "#2e844a";
  } else if (tone === "warn") {
    submitResult.style.color = "#8f4b00";
  } else {
    submitResult.style.color = "#ba0517";
  }
}

function routeZoneToCalloutContext(zone) {
  setActiveTab("callouts");
  assetInput.value = zone.label;

  if (zone.status === "alert") {
    issueInput.value = `Issue observed in ${zone.label}`;
    severityInput.value = "Medium";
    calloutContextHint.textContent = `${zone.label} is flagged. Add or confirm a callout for this zone.`;
    calloutContextHint.style.color = "#8f4b00";
    calloutContextHint.style.background = "#fff4df";
    calloutContextHint.style.borderColor = "#f1be6a";
  } else {
    issueInput.value = `Observation note for ${zone.label}`;
    severityInput.value = "Low";
    calloutContextHint.textContent = `${zone.label} is stable. Add a note or leave as-is.`;
    calloutContextHint.style.color = "#014486";
    calloutContextHint.style.background = "#edf6ff";
    calloutContextHint.style.borderColor = "#c6def3";
  }

  issueInput.focus();
  issueInput.setSelectionRange(0, issueInput.value.length);
}

function renderSystemScope() {
  systemScope.textContent = `${state.controllers.length} controllers / ${state.backflows.length} backflows / ${state.zones.length} zones`;
}

function renderSystemCards() {
  controllerList.innerHTML = "";
  backflowList.innerHTML = "";

  state.controllers.forEach((controller) => {
    const item = document.createElement("li");
    item.textContent = `${controller.name} - ${controller.model} (${controller.zones.length} zones)${controller.description ? ` | ${controller.description}` : ""}`;
    controllerList.appendChild(item);
  });

  state.backflows.forEach((backflow) => {
    const item = document.createElement("li");
    item.textContent = `${backflow.name} - ${backflow.serial} (${backflow.status})${backflow.description ? ` | ${backflow.description}` : ""}`;
    backflowList.appendChild(item);
  });
}

function renderAssetSnapshot() {
  const filteredZones = getFilteredZones();
  const filteredAlerts = filteredZones.filter((zone) => zone.status === "alert").length;

  assetSnapshot.textContent = `${filteredAlerts} flagged in view (${getAlertZonesCount()} total). ${getConfirmedCallouts()} confirmed callouts.`;

  if (state.clockFilter === "ALL") {
    mapCaption.textContent = `Tap any of ${state.zones.length} zones to toggle status across ${state.controllers.length} clocks and ${state.backflows.length} backflows.`;
    return;
  }

  mapCaption.textContent = `Clock filter: ${state.clockFilter}. Showing ${filteredZones.length} zones in this clock.`;
}

function renderMapGrid() {
  mapGrid.innerHTML = "";

  const filteredZones = getFilteredZones();

  filteredZones.forEach((zone) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `zone ${zone.status === "alert" ? "zone-alert" : "zone-ok"}`;
    button.dataset.zoneId = zone.id;
    button.innerHTML = `${zone.label}<small>${zone.controller} / ${zone.backflow}${zone.description ? ` | ${zone.description}` : ""}</small>`;
    mapGrid.appendChild(button);
  });

  if (!filteredZones.length) {
    const empty = document.createElement("p");
    empty.className = "panel-subtitle";
    empty.textContent = "No zones match this clock filter.";
    mapGrid.appendChild(empty);
  }
}

function renderClockFilterOptions() {
  clockFilter.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "ALL";
  allOption.textContent = "All Clocks";
  clockFilter.appendChild(allOption);

  state.controllers.forEach((controller) => {
    const option = document.createElement("option");
    option.value = controller.name;
    option.textContent = controller.name;
    clockFilter.appendChild(option);
  });

  clockFilter.value = state.clockFilter;
}

function renderAssetOptions() {
  assetInput.innerHTML = "";
  const assets = [
    ...state.controllers.map((item) => item.name),
    ...state.backflows.map((item) => item.name),
    ...state.zones.map((item) => item.label),
  ];

  assets.forEach((assetName) => {
    const option = document.createElement("option");
    option.value = assetName;
    option.textContent = assetName;
    assetInput.appendChild(option);
  });
}

function renderAssetManagerOptions() {
  zoneController.innerHTML = "";
  zoneBackflow.innerHTML = "";
  descriptionAsset.innerHTML = "";

  state.controllers.forEach((controller) => {
    const option = document.createElement("option");
    option.value = controller.name;
    option.textContent = controller.name;
    zoneController.appendChild(option);
  });

  state.backflows.forEach((backflow) => {
    const option = document.createElement("option");
    option.value = backflow.name;
    option.textContent = backflow.name;
    zoneBackflow.appendChild(option);
  });

  const assets = getAllAssets();
  assets.forEach((asset) => {
    const option = document.createElement("option");
    option.value = asset.key;
    option.textContent = `${asset.type.toUpperCase()} - ${asset.name}`;
    descriptionAsset.appendChild(option);
  });

  if (assets.length) {
    descriptionAsset.value = assets[0].key;
    descriptionInput.value = assets[0].description;
  } else {
    descriptionInput.value = "";
  }
}

function refreshAfterAssetChange() {
  renderSystemScope();
  renderSystemCards();
  renderClockFilterOptions();
  renderAssetOptions();
  renderAssetManagerOptions();
  renderMapGrid();
  renderAssetSnapshot();
}

function renderProgress() {
  const requiredAnswered = getRequiredAnswered();
  const requiredTotal = state.requiredQuestions.length;
  const pct = Math.round((requiredAnswered / requiredTotal) * 100);

  meterFill.style.width = `${pct}%`;
  meterLabel.textContent = `${requiredAnswered} of ${requiredTotal} answered`;
}

function renderRequiredQuestions() {
  requiredList.innerHTML = "";

  state.requiredQuestions.forEach((question) => {
    const item = document.createElement("li");
    item.className = "required-item";

    const label = document.createElement("label");
    const check = document.createElement("input");
    check.type = "checkbox";
    check.dataset.questionId = question.id;
    check.checked = question.answered;

    const span = document.createElement("span");
    span.textContent = question.text;

    label.append(check, span);
    item.appendChild(label);
    requiredList.appendChild(item);
  });
}

function renderCallouts() {
  calloutList.innerHTML = "";

  if (!state.callouts.length) {
    const empty = document.createElement("li");
    empty.className = "callout-item";
    empty.textContent = "No callouts yet.";
    calloutList.appendChild(empty);
    renderAssetSnapshot();
    return;
  }

  state.callouts.forEach((callout) => {
    const item = document.createElement("li");
    item.className = `callout-item ${callout.confirmed ? "confirmed" : ""}`;

    const title = document.createElement("p");
    title.innerHTML = `<strong>${callout.asset}</strong> - ${callout.issue}`;

    const meta = document.createElement("p");
    meta.className = "callout-meta";
    meta.textContent = `Severity: ${callout.severity} | ${callout.confirmed ? "Confirmed" : "Draft"}`;

    const actions = document.createElement("div");
    actions.className = "callout-actions";

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.className = "btn btn-neutral";
    confirmBtn.dataset.action = "confirm";
    confirmBtn.dataset.calloutId = String(callout.id);
    confirmBtn.textContent = callout.confirmed ? "Unconfirm" : "Confirm";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-destructive";
    removeBtn.dataset.action = "remove";
    removeBtn.dataset.calloutId = String(callout.id);
    removeBtn.textContent = "Remove";

    actions.append(confirmBtn, removeBtn);
    item.append(title, meta, actions);
    calloutList.appendChild(item);
  });

  renderAssetSnapshot();
}

function simulateSubmit() {
  setStage("REVIEW");

  if (getRequiredAnswered() < state.requiredQuestions.length) {
    setSubmitMessage("Blocked: required questions incomplete.", "error");
    return;
  }

  const hasConfirmedCallouts = state.callouts.some((callout) => callout.confirmed);
  if (hasConfirmedCallouts && !state.amAssigned) {
    setSubmitMessage("Blocked: AM required for confirmed callouts.", "error");
    return;
  }

  setStage("COMPLETED");
  setSubmitMessage("Success: inspection can complete.", "ok");
}

function resetFlow() {
  state.requiredQuestions.forEach((q, idx) => {
    q.answered = idx < 4;
  });

  state.zones.forEach((zone) => {
    zone.status = [3, 11, 18, 22].includes(Number(zone.id.replace("zone-", ""))) ? "alert" : "ok";
  });

  state.callouts = [
    { id: 1, asset: "Zone 3", issue: "Broken Head", severity: "High", confirmed: true },
    { id: 2, asset: "Zone 11", issue: "Valve leak at manifold", severity: "Medium", confirmed: false },
    { id: 3, asset: "Backflow South", issue: "Test window expired", severity: "High", confirmed: true },
  ];
  state.clockFilter = "ALL";

  state.amAssigned = false;
  state.amName = "";
  amName.value = "";
  amStatus.textContent = "AM not assigned.";
  amStatus.style.color = "#5c6f82";
  setStage("INSPECTING");
  setSubmitMessage("Flow reset for complex system.", "warn");
  renderAll();
}

function renderAll() {
  renderSystemScope();
  renderSystemCards();
  renderClockFilterOptions();
  renderAssetOptions();
  renderAssetManagerOptions();
  renderMapGrid();
  renderProgress();
  renderRequiredQuestions();
  renderCallouts();
  renderAssetSnapshot();
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setActiveTab(btn.dataset.tab);
  });
});

assetType.addEventListener("change", () => {
  zoneLinks.style.display = assetType.value === "zone" ? "grid" : "none";
});

assetForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const type = assetType.value;
  const rawName = assetName.value.trim();
  const description = assetDescription.value.trim();

  if (type === "controller") {
    if (!rawName) {
      setSubmitMessage("Controller name is required.", "error");
      return;
    }
    state.controllers.push({
      id: `controller-${Date.now()}`,
      name: rawName,
      model: "Custom Clock",
      description,
      zones: [],
    });
    setSubmitMessage(`Added controller ${rawName}.`, "ok");
  } else if (type === "backflow") {
    if (!rawName) {
      setSubmitMessage("Backflow name is required.", "error");
      return;
    }
    state.backflows.push({
      id: `backflow-${Date.now()}`,
      name: rawName,
      serial: `NEW-${Date.now().toString().slice(-5)}`,
      status: "Pending",
      description,
    });
    setSubmitMessage(`Added backflow ${rawName}.`, "ok");
  } else {
    const nextZoneNumber = state.zones.length + 1;
    const zoneLabel = rawName || `Zone ${nextZoneNumber}`;
    const selectedController = zoneController.value || state.controllers[0]?.name || "";
    const selectedBackflow = zoneBackflow.value || state.backflows[0]?.name || "";

    state.zones.push({
      id: `zone-${Date.now()}`,
      label: zoneLabel,
      status: "ok",
      controller: selectedController,
      backflow: selectedBackflow,
      description,
    });

    const controller = state.controllers.find((item) => item.name === selectedController);
    if (controller) {
      controller.zones.push(nextZoneNumber);
    }
    setSubmitMessage(`Added ${zoneLabel}.`, "ok");
  }

  assetName.value = "";
  assetDescription.value = "";
  refreshAfterAssetChange();
});

descriptionAsset.addEventListener("change", () => {
  const selected = getAllAssets().find((asset) => asset.key === descriptionAsset.value);
  descriptionInput.value = selected ? selected.description : "";
});

descriptionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selected = getAllAssets().find((asset) => asset.key === descriptionAsset.value);
  if (!selected) {
    setSubmitMessage("Select an asset to update description.", "error");
    return;
  }

  selected.ref.description = descriptionInput.value.trim();
  setSubmitMessage(`Updated description for ${selected.name}.`, "ok");
  refreshAfterAssetChange();
});

clockFilter.addEventListener("change", () => {
  state.clockFilter = clockFilter.value;
  renderMapGrid();
  renderAssetSnapshot();
});

mapGrid.addEventListener("click", (event) => {
  const target = event.target;
  const zoneButton = target instanceof HTMLElement ? target.closest("button.zone") : null;
  if (!zoneButton) {
    return;
  }

  const zone = state.zones.find((item) => item.id === zoneButton.dataset.zoneId);
  if (!zone) {
    return;
  }

  zone.status = zone.status === "alert" ? "ok" : "alert";

  if (zone.status === "alert") {
    setSubmitMessage(`${zone.label} flagged for follow-up.`, "warn");
  } else {
    setSubmitMessage(`${zone.label} marked as stable.`, "warn");
  }

  renderMapGrid();
  renderAssetSnapshot();
  routeZoneToCalloutContext(zone);
});

requiredList.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const question = state.requiredQuestions.find((q) => q.id === target.dataset.questionId);
  if (!question) {
    return;
  }

  question.answered = target.checked;
  if (state.stage === "COMPLETED") {
    setStage("INSPECTING");
  }
  renderProgress();
});

calloutList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const calloutId = Number(target.dataset.calloutId);
  const action = target.dataset.action;

  if (action === "remove") {
    state.callouts = state.callouts.filter((callout) => callout.id !== calloutId);
    renderCallouts();
    return;
  }

  if (action === "confirm") {
    const callout = state.callouts.find((item) => item.id === calloutId);
    if (!callout) {
      return;
    }

    callout.confirmed = !callout.confirmed;
    renderCallouts();
  }
});

calloutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const issue = issueInput.value.trim();
  if (!issue) {
    return;
  }

  state.callouts.push({
    id: Date.now(),
    asset: assetInput.value,
    issue,
    severity: severityInput.value,
    confirmed: false,
  });

  issueInput.value = "";
  setSubmitMessage("Draft callout added.", "warn");
  renderCallouts();
});

document.getElementById("toggle-am").addEventListener("click", () => {
  if (state.amAssigned) {
    state.amAssigned = false;
    state.amName = "";
    amName.value = "";
    amStatus.textContent = "AM cleared.";
    amStatus.style.color = "#8f4b00";
    return;
  }

  if (!amName.value) {
    amStatus.textContent = "Select an AM before assigning.";
    amStatus.style.color = "#ba0517";
    return;
  }

  state.amAssigned = true;
  state.amName = amName.value;
  amStatus.textContent = `AM assigned: ${state.amName}`;
  amStatus.style.color = "#2e844a";
});

document.getElementById("open-review").addEventListener("click", () => {
  setStage("REVIEW");
  setSubmitMessage("Review opened. Confirm callouts and AM before submit.", "warn");
});

document.getElementById("simulate-submit").addEventListener("click", simulateSubmit);
document.getElementById("reset-flow").addEventListener("click", resetFlow);

setStage("INSPECTING");
setSubmitMessage("Complex campus system loaded.", "warn");
zoneLinks.style.display = "grid";
setActiveTab("map");
renderAll();
