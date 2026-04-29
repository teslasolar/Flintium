// UDT definition tree renderer.

import { $ } from "./dom.js";
import { state } from "./state.js";
import { resolve } from "./udt-registry.js";
import { showUDT } from "./selected.js";

function fieldLine(f) {
  const color = f.t.startsWith("UDT") ? "var(--lav)" : "var(--ok)";
  return `<div style="padding:0 3px 0 16px;font-size:6px"><span style="color:${color}">${f.n}</span> <span class="d">${f.t}</span></div>`;
}

function udtRow(name, def) {
  const fields = resolve(name);
  const parentLabel = def.parent ? "←" + def.parent : "";
  const color = def.parent ? "var(--lav)" : "var(--ig)";
  const fieldsHtml = def.fields.map(fieldLine).join("");
  return `<div class="tn"><div class="tl" data-udt="${name}">
    <span class="arr">▸</span><span style="font-size:7px">📐</span>
    <span style="color:${color}">${name}</span>
    <span class="d">${parentLabel} (${fields.length})</span></div>
    <div class="tc">${fieldsHtml}</div></div>`;
}

export function refreshUDTTree() {
  $("udtTree").innerHTML = Object.entries(state.udts).map(([n, def]) => udtRow(n, def)).join("");
  $("udtTree").querySelectorAll(".tl").forEach((tl) => {
    tl.addEventListener("click", () => {
      tl.parentElement.classList.toggle("open");
      showUDT(tl.dataset.udt);
    });
  });
}
