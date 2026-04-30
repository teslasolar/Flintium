// Browser-side mock of the flintium.tools Jython package.
// runScript(name, ...args) returns the same shapes the gateway would.

import { rootPrefix } from "../layout.js";

let _cache = {};

async function fetchJson(rel) {
  if (_cache[rel]) return _cache[rel];
  const url = rootPrefix() + rel;
  const r = await fetch(url, { cache: "no-cache" });
  if (!r.ok) throw new Error(r.status + " " + url);
  const data = await r.json();
  _cache[rel] = data;
  return data;
}

const TOOLS = {
  "flintium.tools.list_udts": async () => {
    const idx = await fetchJson("pages/data/udts/index.json");
    return idx.udts.map((u) => ({
      name: u.name,
      parent: u.parent || "—",
      level: u.level,
      group: u.group,
      fieldCount: u.fieldCount,
      resolved: u.fieldCount,
    }));
  },
  "flintium.tools.list_instances": async () => {
    const idx = await fetchJson("pages/data/instances/index.json");
    return idx.instances.map((i) => ({
      id: i.id,
      label: i.label,
      udt: i.udt,
      path: i.path,
    }));
  },
  "flintium.tools.udt_detail": async (name) => {
    const all = await TOOLS["flintium.tools.list_udts"]();
    return all.find((u) => u.name === name) || null;
  },
};

export async function runScript(name, ...args) {
  const fn = TOOLS[name];
  if (!fn) {
    console.warn("[perspective] unknown script:", name);
    return null;
  }
  return fn(...args);
}

export function clearToolCache() {
  _cache = {};
}
