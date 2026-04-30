// Perspective demo: loads the view index, renders the chosen view, wires
// up navigate events from inside the rendered tree.

import { rootPrefix } from "../layout.js";
import { renderView } from "./renderer.js";

const $ = (id) => document.getElementById(id);

const state = {
  prefix: null,
  index: null,
  current: null,
};

async function fetchJson(rel) {
  const r = await fetch(state.prefix + rel, { cache: "no-cache" });
  if (!r.ok) throw new Error(r.status + " " + rel);
  return r.json();
}

async function loadView(viewPath) {
  state.current = viewPath;
  $("status").textContent = "Loading " + viewPath + "…";
  $("picker").value = viewPath;
  const file = "pages/data/perspective/views/" + viewPath + "/view.json";
  try {
    const view = await fetchJson(file);
    await renderView(view, $("view-host"));
    $("status").textContent = "Rendered " + viewPath;
    $("source-link").href = state.prefix + file;
  } catch (e) {
    $("view-host").innerHTML =
      '<div style="color:#ff4466;padding:16px;font-family:monospace">render error: ' + e.message + "</div>";
    $("status").textContent = "Error: " + e.message;
  }
}

function populatePicker() {
  $("picker").innerHTML = "";
  for (const v of state.index.views) {
    const opt = document.createElement("option");
    opt.value = v.path;
    opt.textContent = v.path;
    $("picker").appendChild(opt);
  }
}

export async function initPerspectiveDemo() {
  state.prefix = rootPrefix();
  state.index = await fetchJson("pages/data/perspective/views/index.json");
  populatePicker();
  $("picker").addEventListener("change", (e) => loadView(e.target.value));
  $("reload").addEventListener("click", () => loadView(state.current));
  window.addEventListener("perspective:navigate", (e) => {
    const target = e.detail?.view;
    if (target) loadView(target);
  });
  const initial = window.location.hash.match(/view=([^&]+)/)?.[1] || state.index.views[0].path;
  await loadView(initial);
}
