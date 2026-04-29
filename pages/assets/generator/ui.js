// Generator UI: wires preset palette, project canvas, summary, and exports.

import { rootPrefix } from "../layout.js";
import { loadRegistry } from "./registry.js";
import { resolveUdt, leafCount } from "./resolver.js";
import { makeProject, addInstance, removeInstance, summary, expandInstance } from "./composer.js";
import { toTagsExport, toBundleExport, downloadJson } from "./exporter.js";

const $ = (id) => document.getElementById(id);
const project = makeProject("FlintiumProject");
let registry = null;

function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else if (v != null) n.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return n;
}

function renderPalette() {
  const host = $("palette");
  host.innerHTML = "";
  for (const inst of registry.instIndex.instances) {
    const def = registry.instances[inst.id];
    const tags = leafCount(registry.udts, def.udt);
    const card = el("div", { class: "preset-card" }, [
      el("div", { class: "preset-head" }, [
        el("strong", {}, def.label),
        el("span", { class: "chip", style: "margin-left:auto" }, def.udt),
      ]),
      el("div", { class: "preset-path" }, def.path),
      el("p", {}, def.description),
      el("div", { class: "preset-foot" }, [
        el("span", { class: "muted" }, `${tags} tags`),
        el("button", { class: "btn primary", onclick: () => onAdd(def) }, "Add to project"),
      ]),
    ]);
    host.appendChild(card);
  }
}

function onAdd(preset) {
  addInstance(project, preset);
  renderProject();
}

function onRemove(id) {
  removeInstance(project, id);
  renderProject();
}

function renderProject() {
  const host = $("canvas-list");
  host.innerHTML = "";
  if (project.instances.length === 0) {
    host.appendChild(el("div", { class: "empty" }, "No instances yet. Pick a preset on the left."));
  } else {
    for (const inst of project.instances) {
      const tagCount = leafCount(registry.udts, inst.udt);
      const row = el("div", { class: "canvas-row" }, [
        el("div", { class: "canvas-row-head" }, [
          el("strong", {}, inst.label),
          el("span", { class: "chip" }, inst.udt),
          el("span", { class: "muted", style: "margin-left:auto" }, `${tagCount} tags`),
        ]),
        el("div", { class: "canvas-row-path" }, inst.path),
        el("div", { class: "canvas-row-foot" }, [
          el("button", { class: "btn", onclick: () => onPreview(inst) }, "Preview"),
          el("button", { class: "btn", onclick: () => onRemove(inst.id) }, "Remove"),
        ]),
      ]);
      host.appendChild(row);
    }
  }
  const s = summary(project, registry.udts);
  $("sum-instances").textContent = s.instances;
  $("sum-tags").textContent = s.leafTags;
  $("sum-udts").textContent = Object.keys(s.byUdt).length;
}

function onPreview(inst) {
  const expanded = expandInstance(registry.udts, inst).slice(0, 30);
  const lines = expanded.map((t) => `${t.fullPath.padEnd(60)} ${t.type.padEnd(10)} ${String(t.value)}`);
  $("preview").textContent = lines.join("\n") + (expanded.length === 30 ? "\n… (truncated)" : "");
}

function exportTags() {
  downloadJson(project.name + "-tags.json", toTagsExport(project, registry.udts));
}

function exportBundle() {
  downloadJson(project.name + "-bundle.json", toBundleExport(project, registry));
}

function setName(v) {
  project.name = v.trim() || "FlintiumProject";
}

export async function initGenerator() {
  const prefix = rootPrefix();
  registry = await loadRegistry(prefix);
  renderPalette();
  renderProject();
  $("project-name").addEventListener("input", (e) => setName(e.target.value));
  $("btn-export-tags").addEventListener("click", exportTags);
  $("btn-export-bundle").addEventListener("click", exportBundle);
  $("btn-clear").addEventListener("click", () => {
    project.instances = [];
    renderProject();
    $("preview").textContent = "";
  });
  $("count-udts-loaded").textContent = registry.udtIndex.count;
  $("count-presets-loaded").textContent = registry.instIndex.count;
}
