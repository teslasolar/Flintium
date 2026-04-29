// Shared page layout: loads header/footer partials + nav from manifest.
// Each page sets <body data-page="<id>"> and includes <div data-include="header"></div>.

const PARTIAL_BASE = "pages/partials/";
const MANIFEST_URL = "pages/assets/manifest.json";

export function rootPrefix() {
  // Pages live at site root or one level deep (pages/foo.html or pages/app/foo.html).
  const path = window.location.pathname;
  const dir = path.replace(/[^/]*$/, "");
  const depth = (dir.match(/\/pages\//) ? dir.split("/pages/")[1].split("/").filter(Boolean).length : -1);
  // depth: -1 => at root; 0 => /pages/foo.html; 1 => /pages/sub/foo.html
  if (depth === -1) return "./";
  return "../".repeat(depth + 1);
}

async function fetchText(url) {
  const r = await fetch(url, { cache: "no-cache" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

async function fetchJson(url) {
  const r = await fetch(url, { cache: "no-cache" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

function applyManifestText(root, manifest) {
  const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), manifest);
  root.querySelectorAll("[data-manifest]").forEach((el) => {
    const v = get(el.dataset.manifest);
    if (v != null) el.textContent = v;
  });
  root.querySelectorAll("[data-manifest-href]").forEach((el) => {
    const v = get(el.dataset.manifestHref);
    if (v) el.setAttribute("href", `https://github.com/${v}`);
  });
}

function applyRootHrefs(root, prefix) {
  root.querySelectorAll("[data-root-href]").forEach((a) => {
    a.setAttribute("href", prefix + a.dataset.rootHref);
  });
}

function renderNav(host, manifest, prefix, currentPage) {
  host.innerHTML = "";
  for (const item of manifest.nav) {
    const a = document.createElement("a");
    a.textContent = item.label;
    if (item.external) {
      a.href = item.href;
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a.href = prefix + item.rootHref;
      if (item.id === currentPage) a.classList.add("active");
    }
    host.appendChild(a);
  }
}

async function include(slot, name, prefix) {
  const html = await fetchText(prefix + PARTIAL_BASE + name + ".html");
  slot.outerHTML = html;
}

export async function bootLayout() {
  const prefix = rootPrefix();
  const manifest = await fetchJson(prefix + MANIFEST_URL);
  const currentPage = document.body.dataset.page;
  // Replace include slots
  for (const slot of [...document.querySelectorAll("[data-include]")]) {
    await include(slot, slot.dataset.include, prefix);
  }
  applyManifestText(document.body, manifest);
  applyRootHrefs(document.body, prefix);
  for (const navHost of document.querySelectorAll("[data-nav]")) {
    renderNav(navHost, manifest, prefix, currentPage);
  }
  document.body.dataset.prefix = prefix;
  return { manifest, prefix };
}

bootLayout().catch((e) => console.error("layout boot:", e));
