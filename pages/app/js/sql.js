// SQL panel runner.

import { $ } from "./dom.js";
import { state } from "./state.js";

export function runSQL() {
  if (!state.db) return;
  const sql = $("sqlIn").value.trim();
  if (!sql) return;
  try {
    const r = state.db.exec(sql);
    if (!r.length) {
      $("sqlOut").innerHTML = '<span class="v">OK</span>';
      return;
    }
    const headRow = `<div style="color:var(--ig)">${r[0].columns.join("|")}</div>`;
    const dataRows = r[0].values.slice(0, 10).map((row) => `<div>${row.join("|")}</div>`).join("");
    $("sqlOut").innerHTML = headRow + dataRows;
  } catch (e) {
    $("sqlOut").innerHTML = `<span class="e">${e.message}</span>`;
  }
}
