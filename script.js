document.addEventListener("DOMContentLoaded", () => {

const I18N = {
  en: {
    languageName: "English",
    brandingEyebrow: "Official Public Portal",
    heroOverline: "Official website of the micronation",
    heroIntro: "This public portal presents the institutions, territories, official news, allied relations, and imperial administration of Melonia in a format designed to be clear and formal.",
    heroPrimaryAction: "View News",
    heroSecondaryAction: "Read More",

    factFounded: "Founded",
    factCapital: "Capital",
    factTerritories: "Territories",
    factGovernment: "Government",

    governmentShort: "Empire, Imperial Council, and Ministries",

    sectionAboutEyebrow: "Official Identity",
    sectionAboutTitle: "A sovereign public identity for Melonia",
    sectionAboutBody: "The Imperial Empire of Melonia presents itself as an empire with public institutions, territorial identity, diplomatic development, and ceremonial representation.",

    sectionMissionEyebrow: "Public Mission",
    sectionMissionTitle: "Built for formal presentation",
    sectionMissionBody: "This website is structured for public visibility, multilingual communication, and future expansion.",

    sectionNewsEyebrow: "Official Notices",
    sectionNewsTitle: "News and public announcements",
    sectionNewsLead: "Official public statements and notices issued through the Empire's public portal.",

    sectionGovernmentEyebrow: "Institutions",
    sectionGovernmentTitle: "Emperor, council, and ministries",
    sectionGovernmentLead: "The Empire is organized around imperial authority, an imperial council structure, and ministries responsible for state matters.",

    sectionMonarchyTitle: "The Imperial Crown",
    sectionMonarchyBody: "The Emperor stands at the ceremonial and constitutional center of the Empire.",

    sectionCouncilTitle: "The Imperial Council",
    sectionCouncilBody: "The council supports governance, coordination, and formal administration across the Empire.",

    sectionMinistriesTitle: "Imperial Ministries",

    sectionTerritoriesEyebrow: "Territories",
    sectionTerritoriesTitle: "Territorial composition",
    sectionTerritoriesLead: "The territorial structure currently consists of Melonia Main, Melonia South, and Melonia North.",

    sectionAlliesEyebrow: "External Relations",
    sectionAlliesTitle: "Allies and friendly relations",
    sectionAlliesLead: "This section lists friendly states, partner institutions, and allied relationships.",

    ministryLead: "Official administrative body",
    allyStatus: "Status",
    newsDate: "Date",

    loadError: "Could not load site data."
  }
};

const state = {
  language: "en",
  site: null
};

const languageSwitcherEl = document.getElementById("languageSwitcher");
const ministryGridEl = document.getElementById("ministryGrid");
const territoryGridEl = document.getElementById("territoryGrid");
const newsGridEl = document.getElementById("newsGrid");
const alliesGridEl = document.getElementById("alliesGrid");

function t(key) {
  return I18N[state.language]?.[key] || key;
}

function renderTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
}

function renderLanguageSwitcher() {
  if (!languageSwitcherEl) return;

  languageSwitcherEl.innerHTML = Object.keys(I18N).map((lang) => `
    <button type="button" data-lang="${lang}">
      ${I18N[lang].languageName}
    </button>
  `).join("");

  languageSwitcherEl.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      state.language = button.dataset.lang;
      renderAll();
    });
  });
}

function renderSiteFacts() {
  if (!state.site) return;

  document.title = state.site.name;

  const top = document.getElementById("siteNameTop");
  const hero = document.getElementById("siteNameHero");
  const motto = document.getElementById("siteMotto");
  const founded = document.getElementById("siteFounded");
  const capital = document.getElementById("siteCapital");
  const territories = document.getElementById("territoryCount");
  const flag = document.getElementById("flagImage");

  if (top) top.textContent = state.site.name;
  if (hero) hero.textContent = state.site.name;
  if (motto) motto.textContent = state.site.motto;
  if (founded) founded.textContent = state.site.founded;
  if (capital) capital.textContent = state.site.capital;
  if (territories) territories.textContent = state.site.territories.length;
  if (flag) flag.src = state.site.flag;
}

function renderMinistries() {
  if (!state.site || !ministryGridEl) return;

  ministryGridEl.innerHTML = state.site.ministries.map((ministry) => `
    <article class="ministry-card">
      <strong>${ministry.title || ministry.name}</strong>
      <div class="ministry-card__meta">${ministry.minister || t("ministryLead")}</div>
      <p>${ministry.description || ""}</p>
      <p class="record-card__meta">${ministry.focus || ""}</p>
    </article>
  `).join("");
}

function renderTerritories() {
  if (!state.site || !territoryGridEl) return;

  territoryGridEl.innerHTML = state.site.territories.map((territory) => `
    <article class="card">
      <h3>${territory.name}</h3>
      <p>${territory.summary?.[state.language] || territory.summary?.en || ""}</p>
    </article>
  `).join("");
}

function renderNews() {
  if (!state.site || !newsGridEl) return;

  newsGridEl.innerHTML = state.site.news.map((item) => `
    <article class="card">
      <h3>${item.title}</h3>
      <p class="record-card__meta">${t("newsDate")}: ${item.date}</p>
      <p>${item.summary}</p>
    </article>
  `).join("");
}

function renderAllies() {
  if (!state.site || !alliesGridEl) return;

  alliesGridEl.innerHTML = state.site.allies.map((ally) => `
    <article class="card">
      <h3>${ally.name}</h3>
      <p class="record-card__meta">${t("allyStatus")}: ${ally.status}</p>
      <p>${ally.notes}</p>
    </article>
  `).join("");
}

function renderAll() {
  renderTranslations();
  renderLanguageSwitcher();
  renderSiteFacts();
  renderMinistries();
  renderTerritories();
  renderNews();
  renderAllies();
}

async function loadPublicData() {
  try {
    const response = await fetch("/api/public");
    const data = await response.json();

    state.site = data;
    renderAll();

  } catch (error) {
    console.error(t("loadError"), error);
  }
}

loadPublicData();

});