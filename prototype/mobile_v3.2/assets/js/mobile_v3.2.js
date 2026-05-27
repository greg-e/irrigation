const STEPS = [
  "SA Context",
  "Scope Review",
  "Asset Inspection",
  "Callout Capture",
  "Handoff Preview",
  "Completion Gate",
  "Finalize and Output"
];

const state = {
  seed: null,
  currentStep: 0,
  inspectionStatusByAsset: {},
  deferredReasonByAsset: {},
  readings: {},
  callouts: [],
  softAcknowledge: false,
  outputPayload: null
};

const els = {
  stepList: document.getElementById("step-list"),
  stepLabel: document.getElementById("step-label"),
  panel: document.getElementById("panel"),
  backBtn: document.getElementById("back-btn"),
  nextBtn: document.getElementById("next-btn"),
  contextLine: document.getElementById("context-line")
};

function saveLocal() {
  localStorage.setItem("mobile_v3_2_state", JSON.stringify({
    currentStep: state.currentStep,
    inspectionStatusByAsset: state.inspectionStatusByAsset,
    deferredReasonByAsset: state.deferredReasonByAsset,
    readings: state.readings,
    callouts: state.callouts,
    softAcknowledge: state.softAcknowledge,
    outputPayload: state.outputPayload
  }));
}

function loadLocal() {
  const raw = localStorage.getItem("mobile_v3_2_state");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.currentStep = Number(parsed.currentStep || 0);
    state.inspectionStatusByAsset = parsed.inspectionStatusByAsset || {};
    state.deferredReasonByAsset = parsed.deferredReasonByAsset || {};
    state.readings = parsed.readings || {};
    state.callouts = Array.isArray(parsed.callouts) ? parsed.callouts : [];
    state.softAcknowledge = Boolean(parsed.softAcknowledge);
    state.outputPayload = parsed.outputPayload || null;
  } catch {
    // Ignore corrupt local state and continue with seed.
  }
}

function getAssetById(assetId) {
  return state.seed.assets.find((asset) => asset.id === assetId) || null;
}

function computeSoftWarnings() {
  const warnings = [];
  const assets = state.seed.assets;

  assets.forEach((asset) => {
    const status = state.inspectionStatusByAsset[asset.id] || "Unchecked";
    if (status === "Unchecked") {
      warnings.push(`Asset not reviewed: ${asset.name}`);
    }
    if ((status === "Deferred" || status === "Not Present") && !state.deferredReasonByAsset[asset.id]) {
      warnings.push(`Missing reason for ${status.toLowerCase()}: ${asset.name}`);
    }
  });

  state.callouts.forEach((callout, index) => {
    if (!callout.issueType || !callout.assetId || !callout.severity || !callout.disposition) {
      warnings.push(`Callout #${index + 1} has missing structured fields.`);
    }
    if (callout.disposition === "Deferred" && !callout.deferredReason) {
      warnings.push(`Callout #${index + 1} is Deferred without a reason.`);
    }
    if ((callout.severity === "Critical" || callout.severity === "Safety") && !callout.hasPhoto) {
      warnings.push(`Callout #${index + 1} is ${callout.severity} without photo evidence.`);
    }
  });

  state.seed.requiredReadings.forEach((reading) => {
    if (!state.readings[reading.id]) {
      warnings.push(`Required reading missing: ${reading.label}`);
    }
  });

  return warnings;
}

function buildOutputPayload() {
  return {
    generatedAt: new Date().toISOString(),
    serviceAppointment: {
      id: state.seed.serviceAppointment.id,
      number: state.seed.serviceAppointment.number,
      serviceType: state.seed.serviceAppointment.serviceType,
      status: "Completed"
    },
    woli: {
      id: state.seed.woli.id,
      number: state.seed.woli.number,
      serviceName: state.seed.woli.serviceName,
      propertyId: state.seed.woli.propertyId,
      systemAssetId: state.seed.woli.systemAssetId
    },
    inspection: {
      assetStatuses: state.seed.assets.map((asset) => ({
        assetId: asset.id,
        assetName: asset.name,
        status: state.inspectionStatusByAsset[asset.id] || "Unchecked",
        reason: state.deferredReasonByAsset[asset.id] || ""
      })),
      requiredReadings: state.seed.requiredReadings.map((reading) => ({
        id: reading.id,
        label: reading.label,
        value: state.readings[reading.id] || ""
      }))
    },
    structuredCallouts: state.callouts.map((callout) => ({
      id: callout.id,
      issueType: callout.issueType,
      assetId: callout.assetId,
      assetName: getAssetById(callout.assetId)?.name || "",
      severity: callout.severity,
      disposition: callout.disposition,
      deferredReason: callout.deferredReason || "",
      hasPhoto: callout.hasPhoto,
      notes: callout.notes || ""
    })),
    unresolvedWarnings: computeSoftWarnings(),
    resolveLaterAcknowledged: state.softAcknowledge
  };
}

function renderStepper() {
  els.stepLabel.textContent = `Step ${state.currentStep + 1} of ${STEPS.length}`;
  els.stepList.innerHTML = STEPS.map((label, idx) => {
    let className = "";
    if (idx < state.currentStep) className = "complete";
    if (idx === state.currentStep) className = "active";
    return `<li class="${className}">${idx + 1}</li>`;
  }).join("");
}

function renderContext() {
  const sa = state.seed.serviceAppointment;
  const woli = state.seed.woli;
  els.contextLine.textContent = `${sa.number} | ${sa.client} | ${sa.site} | WOLI ${woli.number}`;
}

function renderStepContent() {
  const step = state.currentStep;

  if (step === 0) {
    const sa = state.seed.serviceAppointment;
    els.panel.innerHTML = `
      <h2>SA Context (Auto-Loaded)</h2>
      <p class="muted">Prompt-only-for-exception behavior: no redundant setup fields.</p>
      <div class="grid-2">
        <div class="card"><strong>Client</strong><br/>${sa.client}</div>
        <div class="card"><strong>Site</strong><br/>${sa.site}</div>
        <div class="card"><strong>Service Type</strong><br/>${sa.serviceType}</div>
        <div class="card"><strong>Technician</strong><br/>${sa.assignedTechnician}</div>
      </div>
      <div class="notice">No missing SA context values detected.</div>
    `;
  }

  if (step === 1) {
    els.panel.innerHTML = `
      <h2>Scope Review</h2>
      <p class="muted">WOLI is linked to Property and System Asset for handoff traceability.</p>
      <div class="card">
        <strong>Property:</strong> ${state.seed.woli.propertyName}<br/>
        <strong>System Asset:</strong> ${state.seed.woli.systemAssetName}<br/>
        <strong>Service:</strong> ${state.seed.woli.serviceName}
      </div>
      <table class="table">
        <thead>
          <tr><th>Asset</th><th>Type</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${state.seed.assets.map((asset) => `
            <tr>
              <td>${asset.name}</td>
              <td>${asset.type}</td>
              <td>${state.inspectionStatusByAsset[asset.id] || "Unchecked"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  if (step === 2) {
    const options = ["Unchecked", "Checked", "Deferred", "Not Present"];
    els.panel.innerHTML = `
      <h2>Asset Inspection</h2>
      <p class="muted">Guided, low-friction capture. Deferred/Not Present can continue with reason.</p>
      <div id="asset-status-list"></div>
      <h3>Required Readings</h3>
      <div id="readings-list"></div>
    `;

    const list = document.getElementById("asset-status-list");
    list.innerHTML = state.seed.assets.map((asset) => {
      const selected = state.inspectionStatusByAsset[asset.id] || "Unchecked";
      const reason = state.deferredReasonByAsset[asset.id] || "";
      return `
        <div class="card" style="margin-bottom:8px;">
          <strong>${asset.name}</strong>
          <div class="grid-2" style="margin-top:8px;">
            <div>
              <label>Status</label>
              <select data-asset-status="${asset.id}">
                ${options.map((opt) => `<option value="${opt}" ${selected === opt ? "selected" : ""}>${opt}</option>`).join("")}
              </select>
            </div>
            <div>
              <label>Reason (if Deferred/Not Present)</label>
              <input data-asset-reason="${asset.id}" value="${reason.replace(/"/g, "&quot;")}" />
            </div>
          </div>
        </div>
      `;
    }).join("");

    const readingsList = document.getElementById("readings-list");
    readingsList.innerHTML = state.seed.requiredReadings.map((reading) => {
      const value = state.readings[reading.id] || "";
      return `
        <div class="card" style="margin-bottom:8px;">
          <label>${reading.label}</label>
          <input data-reading-id="${reading.id}" value="${value.replace(/"/g, "&quot;")}" />
        </div>
      `;
    }).join("");

    list.querySelectorAll("select[data-asset-status]").forEach((selectEl) => {
      selectEl.addEventListener("change", () => {
        state.inspectionStatusByAsset[selectEl.dataset.assetStatus] = selectEl.value;
        saveLocal();
      });
    });

    list.querySelectorAll("input[data-asset-reason]").forEach((inputEl) => {
      inputEl.addEventListener("input", () => {
        state.deferredReasonByAsset[inputEl.dataset.assetReason] = inputEl.value.trim();
        saveLocal();
      });
    });

    readingsList.querySelectorAll("input[data-reading-id]").forEach((inputEl) => {
      inputEl.addEventListener("input", () => {
        state.readings[inputEl.dataset.readingId] = inputEl.value.trim();
        saveLocal();
      });
    });
  }

  if (step === 3) {
    els.panel.innerHTML = `
      <h2>Callout Capture</h2>
      <p class="muted">Structured callouts only. Free text is optional enrichment.</p>
      <div class="card">
        <div class="grid-2">
          <div>
            <label>Issue Type</label>
            <select id="issue-type">
              <option value="">Select</option>
              ${state.seed.issueTypes.map((item) => `<option>${item}</option>`).join("")}
            </select>
          </div>
          <div>
            <label>Asset / Zone</label>
            <select id="asset-id">
              <option value="">Select</option>
              ${state.seed.assets.map((asset) => `<option value="${asset.id}">${asset.name}</option>`).join("")}
            </select>
          </div>
          <div>
            <label>Severity</label>
            <select id="severity">
              <option value="">Select</option>
              ${state.seed.severityLevels.map((item) => `<option>${item}</option>`).join("")}
            </select>
          </div>
          <div>
            <label>Disposition</label>
            <select id="disposition">
              <option value="">Select</option>
              ${state.seed.dispositions.map((item) => `<option>${item}</option>`).join("")}
            </select>
          </div>
        </div>
        <label style="margin-top:8px;">Deferred Reason (only if disposition is Deferred)</label>
        <input id="deferred-reason" />
        <label style="margin-top:8px;">Notes (optional)</label>
        <textarea id="callout-notes"></textarea>
        <label style="margin-top:8px;"><input id="has-photo" type="checkbox" style="width:auto; margin-right:6px;" /> Photo captured</label>
        <div class="inline-actions">
          <button id="add-callout" class="slds-button slds-button_brand" type="button">Add Structured Callout</button>
        </div>
      </div>
      <h3>Captured Callouts (${state.callouts.length})</h3>
      <div id="callout-list"></div>
    `;

    document.getElementById("add-callout").addEventListener("click", () => {
      const issueType = document.getElementById("issue-type").value;
      const assetId = document.getElementById("asset-id").value;
      const severity = document.getElementById("severity").value;
      const disposition = document.getElementById("disposition").value;
      const deferredReason = document.getElementById("deferred-reason").value.trim();
      const notes = document.getElementById("callout-notes").value.trim();
      const hasPhoto = document.getElementById("has-photo").checked;

      if (!issueType || !assetId || !severity || !disposition) {
        alert("Issue Type, Asset/Zone, Severity, and Disposition are required for structured callouts.");
        return;
      }

      state.callouts.push({
        id: `co-${Date.now()}`,
        issueType,
        assetId,
        severity,
        disposition,
        deferredReason,
        notes,
        hasPhoto
      });
      saveLocal();
      renderStepContent();
    });

    const calloutList = document.getElementById("callout-list");
    calloutList.innerHTML = state.callouts.length
      ? state.callouts.map((callout, idx) => {
          const asset = getAssetById(callout.assetId);
          return `
            <div class="card" style="margin-bottom:8px;">
              <strong>#${idx + 1} ${callout.issueType}</strong>
              <div class="muted">${asset ? asset.name : "Unknown asset"}</div>
              <div style="margin-top:6px;">
                <span class="badge ${callout.severity === "Critical" || callout.severity === "Safety" ? "danger" : "ok"}">${callout.severity}</span>
                <span class="badge warn">${callout.disposition}</span>
                <span class="badge ${callout.hasPhoto ? "ok" : "warn"}">${callout.hasPhoto ? "Photo" : "No Photo"}</span>
              </div>
              ${callout.deferredReason ? `<div class="muted">Deferred reason: ${callout.deferredReason}</div>` : ""}
            </div>
          `;
        }).join("")
      : `<div class="notice">No callouts captured yet.</div>`;
  }

  if (step === 4) {
    const payload = buildOutputPayload();
    els.panel.innerHTML = `
      <h2>Handoff Preview</h2>
      <p class="muted">Inspection handoff is the output. No estimate-line matching in this iteration.</p>
      <div class="card">
        <strong>SA:</strong> ${payload.serviceAppointment.number}<br/>
        <strong>WOLI:</strong> ${payload.woli.number}<br/>
        <strong>Linked Property/System:</strong> ${state.seed.woli.propertyId} / ${state.seed.woli.systemAssetId}<br/>
        <strong>Structured Callouts:</strong> ${payload.structuredCallouts.length}
      </div>
      <div class="notice">Handoff package will include structured callouts with severity, disposition, and photo flags.</div>
    `;
  }

  if (step === 5) {
    const warnings = computeSoftWarnings();
    els.panel.innerHTML = `
      <h2>Completion Gate (Soft Guidance)</h2>
      <p class="muted">No hard stop in this mode. Resolve Later acknowledgment available on Finalize.</p>
      ${warnings.length
        ? `<div>${warnings.map((msg) => `<div class="notice"><span class="badge warn">Advisory</span> ${msg}</div>`).join("")}</div>`
        : `<div class="notice"><span class="badge ok">Ready</span> No advisory items detected.</div>`}
    `;
  }

  if (step === 6) {
    const warnings = computeSoftWarnings();
    const payload = buildOutputPayload();

    els.panel.innerHTML = `
      <h2>Finalize and Output</h2>
      <p class="muted">Finalize completes SA handoff even if advisories remain.</p>
      <div class="card">
        <strong>Advisory Count:</strong> ${warnings.length}
      </div>
      <label style="margin-top:10px;">
        <input id="soft-ack" type="checkbox" style="width:auto; margin-right:6px;" ${state.softAcknowledge ? "checked" : ""} />
        Resolve Later acknowledgment recorded in handoff summary.
      </label>
      <div class="inline-actions">
        <button id="finalize-btn" class="slds-button slds-button_brand" type="button">Finalize SA Handoff</button>
      </div>
      <h3>Output Bundle</h3>
      <div class="notice output-box" id="output-box">${state.outputPayload ? JSON.stringify(state.outputPayload, null, 2) : "Not finalized yet."}</div>
    `;

    document.getElementById("soft-ack").addEventListener("change", (event) => {
      state.softAcknowledge = event.target.checked;
      saveLocal();
    });

    document.getElementById("finalize-btn").addEventListener("click", () => {
      state.outputPayload = {
        ...payload,
        resolveLaterAcknowledged: state.softAcknowledge
      };
      saveLocal();
      document.getElementById("output-box").textContent = JSON.stringify(state.outputPayload, null, 2);
      alert("Service Appointment handoff finalized.");
    });
  }

  els.backBtn.disabled = state.currentStep === 0;
  els.nextBtn.textContent = state.currentStep === STEPS.length - 1 ? "Stay on Finalize" : "Continue";
}

function moveStep(delta) {
  const next = Math.max(0, Math.min(STEPS.length - 1, state.currentStep + delta));
  state.currentStep = next;
  saveLocal();
  render();
}

function render() {
  renderContext();
  renderStepper();
  renderStepContent();
}

async function init() {
  const response = await fetch("assets/data/mobile_seed_v3_2.json");
  state.seed = await response.json();

  state.seed.assets.forEach((asset) => {
    if (!state.inspectionStatusByAsset[asset.id]) {
      state.inspectionStatusByAsset[asset.id] = "Unchecked";
    }
  });

  state.seed.requiredReadings.forEach((reading) => {
    if (!state.readings[reading.id]) {
      state.readings[reading.id] = reading.value || "";
    }
  });

  loadLocal();

  els.backBtn.addEventListener("click", () => moveStep(-1));
  els.nextBtn.addEventListener("click", () => {
    if (state.currentStep < STEPS.length - 1) {
      moveStep(1);
    }
  });

  render();
}

init().catch((error) => {
  els.panel.innerHTML = `<div class="notice"><span class="badge danger">Error</span> Failed to load mobile seed: ${error.message}</div>`;
});
