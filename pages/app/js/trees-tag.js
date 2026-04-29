// Tag tree renderer.

import { $ } from "./dom.js";
import { state } from "./state.js";
import { selectTag } from "./selected.js";

function buildRoot(rows) {
  const root = {};
  for (const [path, type, value] of rows) {
    const parts = path.split("/");
    let node = root;
    parts.forEach((p, i) => {
      if (!node[p]) node[p] = { _c: {}, _leaf: i === parts.length - 1, _t: type, _v: value, _p: path };
      node = node[p]._c;
    });
  }
  return root;
}

function renderNode(obj, depth) {
  let html = "";
  for (const [name, data] of Object.entries(obj)) {
    const hasKids = Object.keys(data._c).length > 0;
    const ico = data._leaf ? (data._t === "Boolean" ? "🔘" : "📊") : "📁";
    const cls = depth < 2 ? " open" : "";
    html += `<div class="tn${cls}"><div class="tl" data-leaf="${data._leaf ? data._p : ""}" style="padding-left:${depth * 8}px">`;
    html += `<span class="arr">${hasKids ? "▸" : " "}</span><span style="font-size:7px">${ico}</span>`;
    html += `<span style="color:${data._leaf ? "var(--ok)" : "var(--ig)"};flex:1">${name}</span>`;
    if (data._leaf) html += `<span class="d">${(data._v || "").slice(0, 8)}</span>`;
    html += `</div>${hasKids ? `<div class="tc">${renderNode(data._c, depth + 1)}</div>` : ""}</div>`;
  }
  return html;
}

function bindClicks() {
  $("tagTree").querySelectorAll(".tl").forEach((tl) => {
    tl.addEventListener("click", () => {
      tl.parentElement.classList.toggle("open");
      if (tl.dataset.leaf) selectTag(tl.dataset.leaf);
    });
  });
}

export function refreshTagTree() {
  if (!state.db) return;
  const r = state.db.exec("SELECT DISTINCT path,type,value FROM tags ORDER BY path LIMIT 300");
  if (!r.length) {
    $("tagTree").innerHTML = '<span class="d">No tags</span>';
    return;
  }
  $("tagTree").innerHTML = renderNode(buildRoot(r[0].values), 0);
  bindClicks();
}
