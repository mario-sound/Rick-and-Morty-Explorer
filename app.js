/* =========================
   Config / DOM refs
========================= */
const API_BASE = "https://rickandmortyapi.com/api";
const LS_KEY = "rm_favs_characters_v1";

const el = {
  searchInput: document.getElementById("searchInput"),
  statusSelect: document.getElementById("statusSelect"),
  speciesInput: document.getElementById("speciesInput"),
  applyBtn: document.getElementById("applyBtn"),
  resetBtn: document.getElementById("resetBtn"),

  tabExplore: document.getElementById("tabExplore"),
  tabFavs: document.getElementById("tabFavs"),
  tabEpisodes: document.getElementById("tabEpisodes"),

  feedback: document.getElementById("feedback"),
  grid: document.getElementById("grid"),
  detailBox: document.getElementById("detailBox"),
  episodesList: document.getElementById("episodesList"),

  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  pageInfo: document.getElementById("pageInfo"),
};

/* =========================
   App state
========================= */
const state = {
  mode: "explore", // "explore" | "favs" | "episodes"

  // Characters
  page: 1,
  info: null,
  query: { name: "", status: "", species: "" },
  characters: [],
  selectedId: null,

  // Episodes
  episodes: [],
  episodePage: 1,
  episodeInfo: null,
  selectedEpisode: null,
};

/* =========================
   UI helpers
========================= */
function setFeedback(msg = "", type = "info") {
  if (!msg) {
    el.feedback.textContent = "";
    return;
  }
  el.feedback.style.color = type === "error" ? "#ffb3b3" : "";
  el.feedback.textContent = msg;
}

function showCharactersPanel() {
  el.grid.hidden = false;
  if (el.episodesList) el.episodesList.hidden = true;
}

function showEpisodesPanel() {
  el.grid.hidden = true;
  if (el.episodesList) el.episodesList.hidden = false;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   Favorites (localStorage)
========================= */
function getFavs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setFavs(favs) {
  localStorage.setItem(LS_KEY, JSON.stringify(favs));
}

function isFav(id) {
  return getFavs().includes(id);
}

function toggleFav(id) {
  const favs = getFavs();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(id);
  setFavs(favs);
}

/* =========================
   API helpers
========================= */
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    // 404 = no results (caso “normal” en búsquedas)
    if (res.status === 404) return { info: null, results: [] };
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

function buildCharactersUrl(page) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (state.query.name) params.set("name", state.query.name);
  if (state.query.status) params.set("status", state.query.status);
  if (state.query.species) params.set("species", state.query.species);
  return `${API_BASE}/character/?${params.toString()}`;
}

/* =========================
   Render - Characters
========================= */
function statusDotClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "alive") return "alive";
  if (s === "dead") return "dead";
  return "unknown";
}

function renderGrid(list) {
  el.grid.innerHTML = "";

  if (!list.length) {
    el.grid.innerHTML = `<p class="muted">No hay resultados.</p>`;
    return;
  }

  for (const c of list) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.id = String(c.id);

    const favLabel = isFav(c.id) ? "★" : "☆";

    card.innerHTML = `
      <img src="${c.image}" alt="${escapeHtml(c.name)}" />
      <div class="content">
        <div class="row">
          <strong>${escapeHtml(c.name)}</strong>
          <button class="fav" type="button" data-action="fav" aria-label="Favorito">${favLabel}</button>
        </div>
        <div class="badge">
          <span class="dot ${statusDotClass(c.status)}"></span>
          <span>${escapeHtml(c.status)} · ${escapeHtml(c.species)}</span>
        </div>
      </div>
    `;
    el.grid.appendChild(card);
  }
}

function renderPagination() {
  if (state.mode === "episodes") {
    renderEpisodesPagination();
    return;
  }

  const pages = state.info?.pages ?? 1;
  const page = state.page;

  el.pageInfo.textContent =
    state.mode === "explore"
      ? `Página ${page} / ${pages}`
      : `Favoritos (${getFavs().length})`;

  el.prevBtn.textContent = "Anterior";
  el.nextBtn.textContent = "Siguiente";

  el.prevBtn.disabled = state.mode !== "explore" || !state.info?.prev;
  el.nextBtn.disabled = state.mode !== "explore" || !state.info?.next;
}

function renderDetail(character) {
  if (!character) {
    el.detailBox.innerHTML = `<p class="muted">Selecciona un personaje para ver el detalle.</p>`;
    return;
  }

  const favText = isFav(character.id)
    ? "Quitar de favoritos"
    : "Añadir a favoritos";

  const episodeIds = character.episode
    .slice(0, 10)
    .map((url) => url.split("/").pop());

  const more =
    character.episode.length > 10
      ? `(+${character.episode.length - 10} más)`
      : "";

  el.detailBox.innerHTML = `
    <div class="detailHeader">
      <img src="${character.image}" alt="${escapeHtml(character.name)}" />
      <div>
        <h2 style="margin:0 0 6px;">${escapeHtml(character.name)}</h2>
        <div class="badge">
          <span class="dot ${statusDotClass(character.status)}"></span>
          <span>${escapeHtml(character.status)} · ${escapeHtml(character.species)} · ${escapeHtml(character.gender)}</span>
        </div>
        <div style="margin-top:10px;">
          <button id="detailFavBtn" type="button">${favText}</button>
        </div>
      </div>
    </div>

    <div class="kv">
      <div><strong>Origen:</strong> <span class="muted">${escapeHtml(character.origin?.name ?? "-")}</span></div>
      <div><strong>Localización:</strong> <span class="muted">${escapeHtml(character.location?.name ?? "-")}</span></div>
      <div><strong>Tipo:</strong> <span class="muted">${escapeHtml(character.type || "—")}</span></div>
    </div>

    <div class="episodes">
      <strong>Episodios</strong> <span class="muted">${more}</span>

      <ul id="detailEpisodeList">
        ${episodeIds
          .map(
            (id) =>
              `<li class="muted">Cargando episodio ${escapeHtml(id)}…</li>`,
          )
          .join("")}
      </ul>
    </div>
  `;

  // Favoritos desde detalle
  const detailFavBtn = document.getElementById("detailFavBtn");
  detailFavBtn.addEventListener("click", () => {
    toggleFav(character.id);
    renderDetail(character);

    if (state.mode === "favs") loadFavsView();
    else renderGrid(state.characters);

    renderPagination();
  });

  // Cargar nombres reales de episodios (clicables)
  loadEpisodeNamesIntoDetail(episodeIds);
}

/* =========================
   Data loaders - Characters
========================= */
async function loadCharacters() {
  state.mode = "explore";
  showCharactersPanel();
  setFeedback("Cargando personajes…", "loading");
  renderDetail(null);

  try {
    const url = buildCharactersUrl(state.page);
    const data = await fetchJson(url);

    state.info = data.info;
    state.characters = data.results ?? [];

    setFeedback(
      state.characters.length ? "" : "Sin resultados para esos filtros.",
    );
    renderGrid(state.characters);
    renderPagination();
  } catch (err) {
    setFeedback(`Error cargando datos: ${err.message}`, "error");
    state.info = null;
    state.characters = [];
    renderGrid([]);
    renderPagination();
  }
}

async function loadCharacterDetail(id) {
  showCharactersPanel();
  setFeedback("Cargando detalle…", "loading");
  try {
    const data = await fetchJson(`${API_BASE}/character/${id}`);
    setFeedback("");
    state.selectedId = id;
    renderDetail(data);
  } catch (err) {
    setFeedback(`No se pudo cargar el detalle: ${err.message}`, "error");
  }
}

async function loadFavsView() {
  state.mode = "favs";
  showCharactersPanel();
  setFeedback("");
  renderDetail(null);

  const favIds = getFavs();
  if (!favIds.length) {
    el.grid.innerHTML = `<p class="muted">No tienes favoritos todavía.</p>`;
    renderPagination();
    return;
  }

  setFeedback("Cargando favoritos…", "loading");
  try {
    const data = await fetchJson(`${API_BASE}/character/${favIds.join(",")}`);
    const list = Array.isArray(data) ? data : [data];

    setFeedback("");
    renderGrid(list);
    renderPagination();
  } catch (err) {
    setFeedback(`Error cargando favoritos: ${err.message}`, "error");
  }
}

/* =========================
   Render + loaders - Episodes
========================= */
function renderEpisodesList(list) {
  el.episodesList.innerHTML = "";

  for (const ep of list) {
    const div = document.createElement("div");
    div.className = "episodeItem";
    div.dataset.id = String(ep.id);

    div.innerHTML = `
      <strong>${escapeHtml(ep.episode)} — ${escapeHtml(ep.name)}</strong>
      <div class="muted" style="margin-top:6px;">Emisión: ${escapeHtml(ep.air_date)}</div>
      <button type="button" data-action="open-episode">Ver personajes</button>
    `;
    el.episodesList.appendChild(div);
  }
}

function renderEpisodesPagination() {
  const pages = state.episodeInfo?.pages ?? 1;
  const page = state.episodePage;

  el.pageInfo.textContent = `Episodios: página ${page} / ${pages}`;

  // Si el botón está en modo “volver”, no lo tocamos aquí
  if (el.prevBtn.textContent.includes("Volver")) return;

  el.prevBtn.textContent = "Anterior";
  el.nextBtn.textContent = "Siguiente";

  el.prevBtn.disabled = !state.episodeInfo?.prev;
  el.nextBtn.disabled = !state.episodeInfo?.next;
}

async function loadEpisodes() {
  state.mode = "episodes";
  showEpisodesPanel();
  setFeedback("Cargando episodios…", "loading");
  renderDetail(null);

  // Reset del botón volver si venimos de un episodio abierto
  el.prevBtn.textContent = "Anterior";
  el.nextBtn.textContent = "Siguiente";

  try {
    const url = `${API_BASE}/episode?page=${state.episodePage}`;
    const data = await fetchJson(url);

    state.episodeInfo = data.info;
    state.episodes = data.results ?? [];

    setFeedback("");
    renderEpisodesList(state.episodes);
    renderEpisodesPagination();
  } catch (err) {
    setFeedback(`Error cargando episodios: ${err.message}`, "error");
    el.episodesList.innerHTML = "";
  }
}

function renderPaginationEpisodeBack(ep) {
  el.pageInfo.textContent = `Episodio ${ep.episode}`;
  el.prevBtn.disabled = false;
  el.nextBtn.disabled = true;
  el.prevBtn.textContent = "Volver a episodios";
}

async function openEpisode(id) {
  showCharactersPanel();
  setFeedback("Cargando episodio…", "loading");

  try {
    const ep = await fetchJson(`${API_BASE}/episode/${id}`);
    setFeedback("");

    const ids = ep.characters.map((u) => u.split("/").pop()).join(",");
    const chars = ids ? await fetchJson(`${API_BASE}/character/${ids}`) : [];
    const list = Array.isArray(chars) ? chars : [chars];

    renderGrid(list);
    renderPaginationEpisodeBack(ep);
  } catch (err) {
    setFeedback(`No se pudo abrir el episodio: ${err.message}`, "error");
  }
}

async function loadEpisodeNamesIntoDetail(ids) {
  const ul = document.getElementById("detailEpisodeList");
  if (!ul) return;

  if (!ids || !ids.length) {
    ul.innerHTML = `<li class="muted">Sin episodios.</li>`;
    return;
  }

  try {
    const data = await fetchJson(`${API_BASE}/episode/${ids.join(",")}`);
    const list = Array.isArray(data) ? data : [data];

    const byId = new Map(list.map((ep) => [String(ep.id), ep]));

    ul.innerHTML = ids
      .map((id) => {
        const ep = byId.get(String(id));
        if (!ep) {
          return `<li class="muted">Episodio ${escapeHtml(id)} (no encontrado)</li>`;
        }

        // data-episode-id para capturar el click con delegación
        return `
          <li>
            <button
              type="button"
              class="episodeLink"
              data-action="open-episode-from-detail"
              data-episode-id="${escapeHtml(ep.id)}"
              style="
                background: transparent;
                border: 0;
                padding: 0;
                color: inherit;
                text-align: left;
                cursor: pointer;
                font: inherit;
              "
            >
              <span class="muted">${escapeHtml(ep.episode)} — ${escapeHtml(ep.name)}</span>
            </button>
          </li>
        `;
      })
      .join("");
  } catch (err) {
    ul.innerHTML = `<li class="muted">No se pudieron cargar los episodios.</li>`;
  }
}

/* =========================
   Filters / Tabs
========================= */
function applyFiltersFromUI() {
  state.query.name = el.searchInput.value.trim();
  state.query.status = el.statusSelect.value.trim();
  state.query.species = el.speciesInput.value.trim();
  state.page = 1;
}

function resetFiltersUI() {
  el.searchInput.value = "";
  el.statusSelect.value = "";
  el.speciesInput.value = "";
  applyFiltersFromUI();
}

function setTab(mode) {
  state.mode = mode;
  el.tabExplore.classList.toggle("active", mode === "explore");
  el.tabFavs.classList.toggle("active", mode === "favs");
  el.tabEpisodes.classList.toggle("active", mode === "episodes");
}

/* =========================
   SPA routing (hash)
========================= */
function navigateTo(hash) {
  location.hash = hash;
}

window.addEventListener("hashchange", () => {
  const h = location.hash.replace("#", "");

  if (!h || h === "explore") {
    setTab("explore");
    loadCharacters();
    return;
  }
  if (h === "favs") {
    setTab("favs");
    loadFavsView();
    return;
  }
  if (h === "episodes") {
    setTab("episodes");
    loadEpisodes();
    return;
  }
  if (h.startsWith("character/")) {
    const id = Number(h.split("/")[1]);
    if (Number.isFinite(id)) loadCharacterDetail(id);
    return;
  }
});

/* =========================
   Events
========================= */
// Delegación: tarjetas + favs
el.grid.addEventListener("click", (e) => {
  const favBtn = e.target.closest("[data-action='fav']");
  const card = e.target.closest(".card");
  if (!card) return;

  const id = Number(card.dataset.id);
  if (!Number.isFinite(id)) return;

  if (favBtn) {
    toggleFav(id);
    if (state.mode === "favs") loadFavsView();
    else renderGrid(state.characters);
    renderPagination();
    return;
  }

  navigateTo(`character/${id}`);
});

// Buscar / aplicar / reset
el.applyBtn.addEventListener("click", () => {
  applyFiltersFromUI();
  navigateTo("explore");
});

el.resetBtn.addEventListener("click", () => {
  resetFiltersUI();
  navigateTo("explore");
});

el.searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    applyFiltersFromUI();
    navigateTo("explore");
  }
});

// Paginación (un solo handler para prev/next)
el.prevBtn.addEventListener("click", () => {
  if (state.mode === "episodes") {
    // volver desde lista de personajes de episodio
    if (el.prevBtn.textContent.includes("Volver")) {
      showEpisodesPanel();
      renderEpisodesList(state.episodes);
      el.prevBtn.textContent = "Anterior";
      el.nextBtn.textContent = "Siguiente";
      renderEpisodesPagination();
      return;
    }
    if (!state.episodeInfo?.prev) return;
    state.episodePage = Math.max(1, state.episodePage - 1);
    loadEpisodes();
    return;
  }

  // explore
  if (state.mode !== "explore" || !state.info?.prev) return;
  state.page = Math.max(1, state.page - 1);
  loadCharacters();
});

el.nextBtn.addEventListener("click", () => {
  if (state.mode === "episodes") {
    if (!state.episodeInfo?.next) return;
    state.episodePage = state.episodePage + 1;
    loadEpisodes();
    return;
  }

  // explore
  if (state.mode !== "explore" || !state.info?.next) return;
  state.page = state.page + 1;
  loadCharacters();
});

// Tabs
el.tabExplore.addEventListener("click", () => navigateTo("explore"));
el.tabFavs.addEventListener("click", () => navigateTo("favs"));
el.tabEpisodes.addEventListener("click", () => navigateTo("episodes"));

// Episodios: abrir episodio -> personajes
el.episodesList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action='open-episode']");
  if (!btn) return;
  const wrap = e.target.closest(".episodeItem");
  if (!wrap) return;
  openEpisode(Number(wrap.dataset.id));
});

el.detailBox.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action='open-episode-from-detail']");
  if (!btn) return;

  const id = Number(btn.dataset.episodeId);
  if (!Number.isFinite(id)) return;

  // Ir a la sección de episodios (SPA) y abrir el episodio
  navigateTo("episodes"); // activa tab + loadEpisodes por hashchange
  openEpisode(id); // muestra personajes de ese episodio
});

/* =========================
   Init
========================= */
(function init() {
  applyFiltersFromUI();
  if (!location.hash) {
    navigateTo("explore");
  } else {
    // fuerza render inicial según hash actual
    window.dispatchEvent(new Event("hashchange"));
  }
})();
