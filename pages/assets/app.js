// Flintium GitHub Pages viewer
// Resolves catalog.json relative to this script and renders galleries.

const REPO = "teslasolar/Flintium";
const BRANCH = "main";

const state = {
  catalog: null,
  filter: { kind: null, category: "All", query: "" },
};

// Resolve repo-root relative URL regardless of which page calls us.
// Pages live in /pages/, index lives in /. Catalog & thumbnails are repo-root paths.
function rootUrl(relPath) {
  // Walk up from current page to repo root.
  // If we're at /pages/foo.html -> ../  ; at /index.html -> ./
  const path = window.location.pathname;
  // strip filename
  const dir = path.replace(/[^/]*$/, "");
  // count subdirs after pages base. Assume site lives at site root or under a subpath.
  // Simpler: anchor by detecting "/pages/" in path.
  if (dir.includes("/pages/")) {
    return "../" + relPath.replace(/^\.?\//, "");
  }
  return "./" + relPath.replace(/^\.?\//, "");
}

function rawUrl(repoPath) {
  return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${repoPath}`;
}

function blobUrl(repoPath) {
  return `https://github.com/${REPO}/blob/${BRANCH}/${repoPath}`;
}

function treeUrl(repoPath) {
  return `https://github.com/${REPO}/tree/${BRANCH}/${repoPath}`;
}

async function loadCatalog() {
  if (state.catalog) return state.catalog;
  const url = rootUrl("pages/assets/catalog.json");
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load catalog: ${res.status}`);
  state.catalog = await res.json();
  return state.catalog;
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function makeTile(item) {
  const thumbSrc = rootUrl(item.thumbnail);
  const tile = el("div", { class: "tile", role: "button", tabindex: "0" }, [
    el("div", { class: "thumb" }, [
      el("img", { src: thumbSrc, alt: item.label, loading: "lazy" }),
    ]),
    el("div", { class: "meta" }, [
      el("div", { class: "name" }, item.name),
      el("div", { class: "label" }, item.label),
    ]),
  ]);
  tile.addEventListener("click", () => openModal(item));
  tile.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(item);
    }
  });
  return tile;
}

function openModal(item) {
  const backdrop = document.getElementById("modal");
  const head = backdrop.querySelector(".modal-head h2");
  const body = backdrop.querySelector(".modal-body");

  head.textContent = item.label;
  body.innerHTML = "";

  const preview = el("div", { class: "preview" }, [
    el("img", { src: rootUrl(item.thumbnail), alt: item.label }),
  ]);

  const info = el("dl", { class: "info" }, [
    el("dt", {}, "Name"), el("dd", {}, item.name),
    el("dt", {}, "Type"), el("dd", {}, `${item.kind} / ${item.category}`),
    el("dt", {}, "Path"), el("dd", {}, item.path),
    el("dt", {}, "Files"), el("dd", {}, item.files.join(", ")),
  ]);

  const btns = el("div", { class: "btn-row" }, [
    el("a", { class: "btn primary", href: treeUrl(item.path), target: "_blank", rel: "noopener" }, "View on GitHub"),
    ...item.files.map((f) =>
      el("a", { class: "btn", href: rawUrl(item.path + "/" + f), target: "_blank", rel: "noopener", download: f }, `Download ${f}`)
    ),
  ]);

  body.append(preview, info, btns);
  backdrop.classList.add("open");
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
}

function renderToolbar(host, items, opts) {
  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category))).sort()];

  const search = el("input", {
    type: "search",
    placeholder: opts.placeholder || "Search by name…",
    "aria-label": "Search",
  });
  search.addEventListener("input", (e) => {
    state.filter.query = e.target.value.toLowerCase();
    renderGallery(opts.gallery, items);
  });

  const chipRow = el("div", { class: "toolbar", style: "gap: 6px;" });
  for (const cat of categories) {
    const chip = el("span", { class: "chip" + (cat === state.filter.category ? " active" : ""), "data-cat": cat }, cat);
    chip.addEventListener("click", () => {
      state.filter.category = cat;
      chipRow.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c.dataset.cat === cat));
      renderGallery(opts.gallery, items);
    });
    chipRow.appendChild(chip);
  }

  host.innerHTML = "";
  host.append(el("div", { class: "toolbar" }, [search]), chipRow);
}

function renderGallery(host, items) {
  const q = state.filter.query;
  const cat = state.filter.category;
  const filtered = items.filter((i) => {
    if (cat && cat !== "All" && i.category !== cat) return false;
    if (q && !(`${i.name} ${i.label}`).toLowerCase().includes(q)) return false;
    return true;
  });

  host.innerHTML = "";
  if (filtered.length === 0) {
    host.appendChild(el("div", { class: "empty" }, "No matches. Try a different search or filter."));
    return;
  }
  for (const item of filtered) host.appendChild(makeTile(item));
}

async function initGalleryPage(kind) {
  // kind: 'windows' | 'templates'
  const catalog = await loadCatalog();
  const items = catalog[kind] || [];

  const toolbarHost = document.getElementById("toolbar");
  const galleryHost = document.getElementById("gallery");

  state.filter = { kind, category: "All", query: "" };
  renderToolbar(toolbarHost, items, { gallery: galleryHost, placeholder: `Search ${items.length} items…` });
  renderGallery(galleryHost, items);

  const countEl = document.getElementById("count");
  if (countEl) countEl.textContent = items.length;
}

async function initIndex() {
  const catalog = await loadCatalog();
  const w = catalog.windows.length;
  const t = catalog.templates.length;
  const setText = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  setText("count-windows", w);
  setText("count-templates", t);
  setText("count-faceplates", catalog.windows.filter((x) => x.category === "Faceplates").length);
  setText("count-examples", catalog.windows.filter((x) => x.category === "ExampleMain").length);
}

async function initDemo() {
  const catalog = await loadCatalog();
  // Demo apps = ExampleMain windows
  const demos = catalog.windows.filter((x) => x.category === "ExampleMain");
  const host = document.getElementById("gallery");
  host.innerHTML = "";
  for (const item of demos) host.appendChild(makeTile(item));
  const countEl = document.getElementById("count");
  if (countEl) countEl.textContent = demos.length;
}

// Wire modal close button on every page that includes the markup.
document.addEventListener("DOMContentLoaded", () => {
  const backdrop = document.getElementById("modal");
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
    const closeBtn = backdrop.querySelector(".modal-head button");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});

window.Flintium = { initIndex, initGalleryPage, initDemo };
