const state = {
  token: "",
  site: null,
  applications: { citizens: [], passports: [] }
};

const devLoginForm = document.getElementById("devLoginForm");
const devDashboard = document.getElementById("devDashboard");
const devCitizenApplicationsEl = document.getElementById("devCitizenApplications");
const devPassportApplicationsEl = document.getElementById("devPassportApplications");
const newsManagerList = document.getElementById("newsManagerList");
const alliesManagerList = document.getElementById("alliesManagerList");
const ministriesManagerList = document.getElementById("ministriesManagerList");
const recordTemplate = document.getElementById("recordTemplate");

function setStatus(id, text, type = "") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.classList.remove("is-success", "is-error");
  if (type) {
    el.classList.add(type === "success" ? "is-success" : "is-error");
  }
}

async function apiFetch(url, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function createRecordCard(title, meta, body) {
  const node = recordTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector(".record-card__title").textContent = title;
  node.querySelector(".record-card__meta").textContent = meta;
  node.querySelector(".record-card__body").textContent = body;
  return node;
}

function renderApplications() {
  devCitizenApplicationsEl.innerHTML = "";
  devPassportApplicationsEl.innerHTML = "";

  if (!state.applications.citizens.length) {
    devCitizenApplicationsEl.appendChild(createRecordCard("Citizen Applications", "", "No citizen applications yet."));
  } else {
    state.applications.citizens.forEach((entry) => {
      devCitizenApplicationsEl.appendChild(
        createRecordCard(
          entry.fullName,
          `${entry.submittedAt} · ${entry.territory}`,
          `${entry.residence} · ${entry.birthDate}${entry.notes ? ` · ${entry.notes}` : ""}`
        )
      );
    });
  }

  if (!state.applications.passports.length) {
    devPassportApplicationsEl.appendChild(createRecordCard("Passport Applications", "", "No passport applications yet."));
  } else {
    state.applications.passports.forEach((entry) => {
      devPassportApplicationsEl.appendChild(
        createRecordCard(
          entry.applicantName,
          `${entry.submittedAt} · ${entry.documentType}`,
          `${entry.territory} · ${entry.issueReason}`
        )
      );
    });
  }
}

function managerItem(title, content) {
  return `
    <article class="panel panel--manager">
      <h4>${title}</h4>
      ${content}
    </article>
  `;
}

function renderNewsManager() {
  newsManagerList.innerHTML = state.site.news.map((item, index) => managerItem(
    `News Item ${index + 1}`,
    `
      <div class="official-form">
        <label><span>Title</span><input type="text" data-news-field="title" data-index="${index}" value="${escapeHtml(item.title || "")}"></label>
        <label><span>Date</span><input type="date" data-news-field="date" data-index="${index}" value="${escapeHtml(item.date || "")}"></label>
        <label><span>Summary</span><textarea rows="4" data-news-field="summary" data-index="${index}">${escapeHtml(item.summary || "")}</textarea></label>
        <button class="button button--ghost" type="button" data-remove-news="${index}">Remove</button>
      </div>
    `
  )).join("");

  newsManagerList.querySelectorAll("[data-remove-news]").forEach((button) => {
    button.addEventListener("click", () => {
      state.site.news.splice(Number(button.dataset.removeNews), 1);
      renderNewsManager();
    });
  });
}

function renderAlliesManager() {
  alliesManagerList.innerHTML = state.site.allies.map((item, index) => managerItem(
    `Ally ${index + 1}`,
    `
      <div class="official-form">
        <label><span>Name</span><input type="text" data-ally-field="name" data-index="${index}" value="${escapeHtml(item.name || "")}"></label>
        <label><span>Status</span><input type="text" data-ally-field="status" data-index="${index}" value="${escapeHtml(item.status || "")}"></label>
        <label><span>Notes</span><textarea rows="4" data-ally-field="notes" data-index="${index}">${escapeHtml(item.notes || "")}</textarea></label>
        <button class="button button--ghost" type="button" data-remove-ally="${index}">Remove</button>
      </div>
    `
  )).join("");

  alliesManagerList.querySelectorAll("[data-remove-ally]").forEach((button) => {
    button.addEventListener("click", () => {
      state.site.allies.splice(Number(button.dataset.removeAlly), 1);
      renderAlliesManager();
    });
  });
}

function renderMinistriesManager() {
  ministriesManagerList.innerHTML = state.site.ministries.map((item, index) => managerItem(
    `Ministry ${index + 1}`,
    `
      <div class="official-form">
        <label><span>Internal Name</span><input type="text" data-ministry-field="name" data-index="${index}" value="${escapeHtml(item.name || "")}"></label>
        <label><span>Public Title</span><input type="text" data-ministry-field="title" data-index="${index}" value="${escapeHtml(item.title || "")}"></label>
        <label><span>Minister</span><input type="text" data-ministry-field="minister" data-index="${index}" value="${escapeHtml(item.minister || "")}"></label>
        <label><span>Focus</span><input type="text" data-ministry-field="focus" data-index="${index}" value="${escapeHtml(item.focus || "")}"></label>
        <label><span>Description</span><textarea rows="5" data-ministry-field="description" data-index="${index}">${escapeHtml(item.description || "")}</textarea></label>
        <button class="button button--ghost" type="button" data-remove-ministry="${index}">Remove</button>
      </div>
    `
  )).join("");

  ministriesManagerList.querySelectorAll("[data-remove-ministry]").forEach((button) => {
    button.addEventListener("click", () => {
      state.site.ministries.splice(Number(button.dataset.removeMinistry), 1);
      renderMinistriesManager();
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function syncNewsFromInputs() {
  newsManagerList.querySelectorAll("[data-news-field]").forEach((input) => {
    const index = Number(input.dataset.index);
    const field = input.dataset.newsField;
    state.site.news[index][field] = input.value;
  });
}

function syncAlliesFromInputs() {
  alliesManagerList.querySelectorAll("[data-ally-field]").forEach((input) => {
    const index = Number(input.dataset.index);
    const field = input.dataset.allyField;
    state.site.allies[index][field] = input.value;
  });
}

function syncMinistriesFromInputs() {
  ministriesManagerList.querySelectorAll("[data-ministry-field]").forEach((input) => {
    const index = Number(input.dataset.index);
    const field = input.dataset.ministryField;
    state.site.ministries[index][field] = input.value;
  });
}

function renderManagers() {
  renderNewsManager();
  renderAlliesManager();
  renderMinistriesManager();
}

async function loadDevData() {
  const data = await apiFetch("/api/dev/data", { method: "GET" });
  state.site = data.site;
  state.applications = data.applications;
  devDashboard.hidden = false;
  renderApplications();
  renderManagers();
}

async function saveSiteSection(payload, statusId) {
  try {
    const data = await apiFetch("/api/dev/site", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    state.site = data.site;
    renderManagers();
    setStatus(statusId, "Saved successfully.", "success");
  } catch (error) {
    setStatus(statusId, error.message, "error");
  }
}

devLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(devLoginForm);
  try {
    const data = await apiFetch("/api/dev/login", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    state.token = data.token;
    setStatus("devLoginStatus", "Logged into the dev portal.", "success");
    await loadDevData();
  } catch {
    setStatus("devLoginStatus", "Login failed. Check the portal credentials.", "error");
  }
});

document.getElementById("devRefreshButton").addEventListener("click", async () => {
  try {
    await loadDevData();
  } catch (error) {
    setStatus("devLoginStatus", error.message, "error");
  }
});

document.getElementById("addNewsButton").addEventListener("click", () => {
  state.site.news.push({ id: `news-${Date.now()}`, title: "", date: "", summary: "" });
  renderNewsManager();
});

document.getElementById("addAllyButton").addEventListener("click", () => {
  state.site.allies.push({ id: `ally-${Date.now()}`, name: "", status: "", notes: "" });
  renderAlliesManager();
});

document.getElementById("addMinistryButton").addEventListener("click", () => {
  state.site.ministries.push({ name: "", title: "", minister: "", focus: "", description: "" });
  renderMinistriesManager();
});

document.getElementById("newsManagerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  syncNewsFromInputs();
  await saveSiteSection({ news: state.site.news }, "newsEditorStatus");
});

document.getElementById("alliesManagerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  syncAlliesFromInputs();
  await saveSiteSection({ allies: state.site.allies }, "alliesEditorStatus");
});

document.getElementById("ministriesManagerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  syncMinistriesFromInputs();
  await saveSiteSection({ ministries: state.site.ministries }, "ministriesEditorStatus");
});
