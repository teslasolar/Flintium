// Selected tag detail + UDT detail panes.

import { $ } from "./dom.js";
import { state } from "./state.js";
import { resolve } from "./udt-registry.js";

export function selectTag(path) {
  if (!state.db) return;
  const r = state.db.exec("SELECT * FROM tags WHERE path=?", [path]);
  if (!r.length || !r[0].values.length) return;
  const v = r[0].values[0];
  const rows = [
    ["path", v[1]],
    ["name", v[2]],
    ["type", v[3]],
    ["value", v[4]],
    ["quality", v[5]],
    ["time", v[6]],
    ["udt", v[7] || "—"],
    ["parent", v[8] || "—"],
    ["depth", v[9]],
  ];
  $("selTag").innerHTML = rows
    .map(([k, val]) => `<div class="prop"><span class="pk">${k}</span><span class="pv">${val}</span></div>`)
    .join("");
  const h = state.db.exec("SELECT value,timestamp FROM tag_history WHERE path=? ORDER BY timestamp DESC LIMIT 6", [path]);
  $("tagHist").innerHTML = h.length
    ? h[0].values.map((row) => `<div style="font-size:6px"><span class="v">${row[0]}</span> <span class="d">${row[1]}</span></div>`).join("")
    : "—";
}

export function showUDT(name) {
  const def = state.udts[name];
  if (!def) return;
  const fields = resolve(name);
  const parentLabel = def.parent ? ` <span class="lv">←${def.parent}</span>` : "";
  const head = `<div><span class="k">${name}</span>${parentLabel}</div>
    <div><span class="d">direct:${def.fields.length} resolved:${fields.length}</span></div>`;
  const body = fields
    .slice(0, 25)
    .map((f) => `<div style="font-size:5.5px"><span class="d">d${f.d}</span> <span style="color:var(--ok)">${f.n}</span> <span class="d">${f.t}</span></div>`)
    .join("");
  const more = fields.length > 25 ? `<div class="d">+${fields.length - 25} more</div>` : "";
  $("udtDetail").innerHTML = head + `<div style="margin-top:2px;border-top:1px solid var(--b);padding-top:2px">${body}${more}</div>`;
}
