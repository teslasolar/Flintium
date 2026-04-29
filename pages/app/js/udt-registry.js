// Loads UDT definitions from /pages/data/udts/ and provides resolver.

import { fetchJson } from "./dom.js";
import { setUdts, state } from "./state.js";

const DATA_BASE = "../data/udts/";

export async function loadUdts() {
  const index = await fetchJson(DATA_BASE + "index.json");
  const udts = {};
  await Promise.all(
    index.udts.map((u) =>
      fetchJson(DATA_BASE + u.file).then((def) => {
        udts[def.name] = def;
      })
    )
  );
  setUdts(udts, index);
  return { udts, index };
}

const MAX_DEPTH = 9;

export function resolve(name, depth = 0) {
  if (depth > MAX_DEPTH || !state.udts[name]) return [];
  const def = state.udts[name];
  const fields = [];
  if (def.parent) fields.push(...resolve(def.parent, depth + 1));
  for (const field of def.fields) {
    if (field.t.startsWith("UDT:")) {
      const sub = resolve(field.t.slice(4), depth + 1);
      for (const s of sub) {
        fields.push({ n: field.n + "/" + s.n, t: s.t, v: s.v, d: s.d + 1 });
      }
    } else {
      fields.push({ n: field.n, t: field.t, v: field.v ?? "", d: depth });
    }
  }
  return fields;
}
