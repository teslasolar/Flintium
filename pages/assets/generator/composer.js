// Composes a project bundle from a list of selected instances.
// State shape: { instances: [{ id, path, udt, label, overrides }], options: {...} }

import { resolveUdt, leafCount } from "./resolver.js";

export function makeProject(name) {
  return { name: name || "FlintiumProject", instances: [], createdAt: new Date().toISOString() };
}

export function addInstance(project, preset) {
  const inst = {
    id: preset.id + "-" + Math.random().toString(36).slice(2, 6),
    path: preset.path,
    udt: preset.udt,
    label: preset.label,
    description: preset.description,
    overrides: { ...(preset.overrides || {}) },
  };
  project.instances.push(inst);
  return inst;
}

export function removeInstance(project, instId) {
  project.instances = project.instances.filter((i) => i.id !== instId);
}

export function summary(project, udts) {
  const totals = { instances: project.instances.length, leafTags: 0, byUdt: {} };
  for (const inst of project.instances) {
    const n = leafCount(udts, inst.udt);
    totals.leafTags += n;
    totals.byUdt[inst.udt] = (totals.byUdt[inst.udt] || 0) + 1;
  }
  return totals;
}

export function expandInstance(udts, inst) {
  const fields = resolveUdt(udts, inst.udt);
  return fields.map((f) => ({
    fullPath: inst.path + "/" + f.path,
    type: f.type,
    value: applyOverride(inst.overrides, f.path, f.defaultValue),
    depth: f.depth,
  }));
}

function applyOverride(overrides, path, fallback) {
  if (!overrides) return fallback;
  if (Object.prototype.hasOwnProperty.call(overrides, path)) return overrides[path];
  const head = path.split("/")[0];
  if (Object.prototype.hasOwnProperty.call(overrides, head)) return overrides[head];
  return fallback;
}
