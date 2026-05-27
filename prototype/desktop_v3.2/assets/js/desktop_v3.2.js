const state = {
  handoffs: [],
  activeHandoffId: null,
  seedSummary: null
};

const els = {
  handoffView: document.getElementById("handoff-view"),
  recordView: document.getElementById("record-view"),
  showHandoff: document.getElementById("show-handoff"),
  showRecord: document.getElementById("show-record"),
  backToHandoff: document.getElementById("back-to-handoff")
};

function sortNewestFirst(items) {
  return [...items].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
}

function byId(id) {
  return state.handoffs.find((item) => item.id === id) || null;
}

function renderHandoffView() {
  const sorted = sortNewestFirst(state.handoffs);
  const active = byId(state.activeHandoffId) || sorted[0] || null;
  if (active && !state.activeHandoffId) {
    state.activeHandoffId = active.id;
  }

  const listHtml = sorted.map((handoff) => {
    const isActive = handoff.id === state.activeHandoffId;
    return `
      <article class="item ${isActive ? "active" : ""}" data-handoff-id="${handoff.id}">
        <strong>${handoff.serviceAppointmentNumber}</strong>
        <div class="meta">Completed ${new Date(handoff.completedAt).toLocaleString()}</div>
        <div class="meta">WOLI ${handoff.woliNumber} | ${handoff.propertyName}</div>
        <div style="margin-top:5px;">
          <span class="badge ${handoff.advisoryCount > 0 ? "warn" : "ok"}">${handoff.advisoryCount} advisories</span>
          <span class="badge ok">${handoff.structuredCallouts.length} callouts</span>
        </div>
      </article>
    `;
  }).join("");

  const detailHtml = !active
    ? `<div class="card"><p class="muted">No handoff records found.</p></div>`
    : `
      <div class="card">
        <h2>${active.serviceAppointmentNumber}</h2>
        <p class="muted">Newest-first handoff review for desktop processing.</p>
        <div><strong>Completed:</strong> ${new Date(active.completedAt).toLocaleString()}</div>
        <div><strong>Technician:</strong> ${active.technician}</div>
        <div><strong>WOLI:</strong> ${active.woliNumber} (${active.woliId})</div>
        <div><strong>Property/System Link:</strong> ${active.propertyId} / ${active.systemAssetId}</div>
        <div><strong>Resolve Later Acknowledged:</strong> ${active.resolveLaterAcknowledged ? "Yes" : "No"}</div>
      </div>
      <div class="card">
        <h3>Structured Callouts</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Asset</th>
              <th>Severity</th>
              <th>Disposition</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            ${active.structuredCallouts.map((callout) => `
              <tr>
                <td>${callout.issueType}</td>
                <td>${callout.assetName}</td>
                <td>${callout.severity}</td>
                <td>${callout.disposition}</td>
                <td>${callout.hasPhoto ? "Yes" : "No"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div class="card">
        <h3>Seed Data Reference</h3>
        <p class="muted">Desktop v3.2 keeps baseline desktop seed data cloned from v3.1 for setup/config continuity.</p>
        <div><strong>Properties in seed:</strong> ${state.seedSummary?.propertyCount || 0}</div>
        <div><strong>Seed source:</strong> assets/data/seed_data_v3_2.json</div>
      </div>
    `;

  els.handoffView.innerHTML = `
    <section class="card">
      <h2>Handoff Queue</h2>
      <p class="muted">Sorted newest completed SA first.</p>
      <div class="list">${listHtml}</div>
    </section>
    <section>${detailHtml}</section>
  `;

  els.handoffView.querySelectorAll("[data-handoff-id]").forEach((item) => {
    item.addEventListener("click", () => {
      state.activeHandoffId = item.dataset.handoffId;
      renderHandoffView();
    });
  });
}

function showHandoffView() {
  els.handoffView.classList.remove("hidden");
  els.recordView.classList.add("hidden");
  els.showHandoff.classList.remove("slds-button_neutral");
  els.showHandoff.classList.add("slds-button_brand");
  els.showRecord.classList.remove("slds-button_brand");
  els.showRecord.classList.add("slds-button_neutral");
}

function showRecordView() {
  els.handoffView.classList.add("hidden");
  els.recordView.classList.remove("hidden");
  els.showRecord.classList.remove("slds-button_neutral");
  els.showRecord.classList.add("slds-button_brand");
  els.showHandoff.classList.remove("slds-button_brand");
  els.showHandoff.classList.add("slds-button_neutral");
}

async function init() {
  const handoffResponse = await fetch("assets/data/handoff_seed_v3_2.json");
  const handoffSeed = await handoffResponse.json();
  state.handoffs = Array.isArray(handoffSeed.handoffs) ? handoffSeed.handoffs : [];

  const seedResponse = await fetch("assets/data/seed_data_v3_2.json");
  const seedData = await seedResponse.json();
  state.seedSummary = {
    propertyCount: Array.isArray(seedData.properties) ? seedData.properties.length : 0
  };

  state.activeHandoffId = sortNewestFirst(state.handoffs)[0]?.id || null;
  renderHandoffView();
  showHandoffView();

  els.showHandoff.addEventListener("click", showHandoffView);
  els.showRecord.addEventListener("click", showRecordView);
  els.backToHandoff.addEventListener("click", showHandoffView);
}

init().catch((error) => {
  els.handoffView.innerHTML = `<div class="card"><p>Failed to load v3.2 desktop data: ${error.message}</p></div>`;
});
