// Seed instances into SQLite from /pages/data/instances/ presets.

import { fetchJson } from "./dom.js";
import { state } from "./state.js";
import { resolve } from "./udt-registry.js";
import { updateStats } from "./db.js";
import { addMsg } from "./chat-ui.js";
import { refreshTagTree } from "./trees.js";

const INST_BASE = "../data/instances/";

function randVal(type, fallback) {
  if (type === "Boolean") return Math.random() > 0.7 ? "true" : "false";
  if (type === "Float8") return (Math.random() * 100).toFixed(2);
  if (type === "Int4") return String(Math.floor(Math.random() * 5));
  if (type === "DateTime") return new Date().toISOString();
  return (fallback ?? "").toString();
}

export function createInstance(path, udt) {
  if (!state.db || !state.udts[udt]) return 0;
  const fields = resolve(udt);
  let count = 0;
  for (const f of fields) {
    const fp = path + "/" + f.n;
    const val = randVal(f.t, f.v);
    try {
      state.db.run(
        'INSERT OR REPLACE INTO tags VALUES(NULL,?,?,?,?,192,datetime("now"),?,?,?)',
        [fp, f.n.split("/").pop(), f.t, val, udt, path, f.d]
      );
      count++;
    } catch (e) {}
    for (let i = 0; i < 3; i++) {
      const hv = f.t === "Float8" ? (parseFloat(val) + Math.random() * 10 - 5).toFixed(2) : val;
      try {
        state.db.run(
          'INSERT INTO tag_history VALUES(NULL,?,?,192,datetime("now","-"||?||" minutes"))',
          [fp, hv, String(i * 15)]
        );
      } catch (e) {}
    }
  }
  return count;
}

async function seedFiltered(filter, label) {
  const idx = await fetchJson(INST_BASE + "index.json");
  let total = 0, n = 0;
  for (const i of idx.instances.filter(filter)) {
    const def = await fetchJson(INST_BASE + i.file);
    total += createInstance(def.path, def.udt);
    n++;
  }
  updateStats();
  refreshTagTree();
  addMsg("sys", `Seeded ${n} ${label} instances → ${total} tags.`);
}

export const seedDB = () => seedFiltered((i) => !i.path.startsWith("[Ignition"), "process");
export const seedPLC = () => seedFiltered((i) => i.path.startsWith("[Ignition"), "PLC");
