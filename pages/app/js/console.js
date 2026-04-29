// Local script console: pattern-matches Ignition system.* calls against the SQLite DB.

import { $ } from "./dom.js";
import { state } from "./state.js";
import { getOnlineGateway } from "./gateways.js";

function localExec(code) {
  if (!state.db) return "[no db]";
  if (code.includes("system.tag.readBlocking")) {
    const m = code.match(/\['([^']+)'\]/);
    if (!m) return "[no path]";
    const r = state.db.exec("SELECT value,quality FROM tags WHERE path LIKE '%" + m[1] + "%' LIMIT 5");
    return r.length ? JSON.stringify(r[0].values) : "[Tag not found]";
  }
  if (code.includes("system.tag.browse")) {
    const m = code.match(/'([^']+)'/);
    if (!m) return "[no path]";
    const r = state.db.exec("SELECT DISTINCT path FROM tags WHERE path LIKE '" + m[1] + "%' LIMIT 10");
    return r.length ? r[0].values.map((v) => v[0]).join("\n") : "[Empty]";
  }
  if (code.includes("system.db.runQuery")) {
    const m = code.match(/"([^"]+)"/);
    if (!m) return "[no SQL]";
    try {
      const r = state.db.exec(m[1]);
      return r.length ? JSON.stringify(r[0].values.slice(0, 5)) : "[Empty]";
    } catch (e) {
      return "Error: " + e.message;
    }
  }
  if (code.startsWith("print")) {
    const m = code.match(/print\s*\(?(.+?)\)?$/);
    return m ? String(m[1]) : "None";
  }
  return "[Executed — no output. Use print() or system.tag.* / system.db.* calls]";
}

async function gatewayExec(code, host) {
  const gw = getOnlineGateway();
  if (!gw) return;
  try {
    const r = await fetch(gw.url + "/system/webdev/script", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Basic " + btoa(gw.user + ":" + gw.pass) },
      body: JSON.stringify({ script: code }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await r.json();
    host.innerHTML += `<div style="color:var(--teal);font-size:7px">[GATEWAY] ${JSON.stringify(data).slice(0, 200)}</div>`;
  } catch (e) {}
}

export function runScript() {
  const code = $("scriptIn").value.trim();
  if (!code) return;
  const out = $("consoleOut");
  const div = document.createElement("div");
  div.innerHTML = `<div style="color:var(--ig);font-size:7px;margin-top:4px">>>> ${code}</div>`;
  const result = localExec(code);
  div.innerHTML += `<div style="color:var(--ok);font-size:8px;white-space:pre-wrap">${result}</div>`;
  out.appendChild(div);
  out.scrollTop = 1e6;
  if (state.db) {
    state.db.run("INSERT INTO scripts VALUES(NULL,?,?,datetime('now'),'gateway')", [code, result]);
  }
  gatewayExec(code, div);
}
