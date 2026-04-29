// Diagnostics tab renderer. Loads the issue list from diag-issues.json.

import { $, fetchJson } from "./dom.js";
import { state } from "./state.js";

let issuesCache = null;
async function loadIssues() {
  if (issuesCache) return issuesCache;
  const data = await fetchJson("./js/diag-issues.json");
  issuesCache = data.issues;
  return issuesCache;
}

function renderIssue([title, fix]) {
  return `<div style="border:1px solid var(--b);border-radius:3px;padding:4px 6px;margin:3px 0">
    <div style="color:var(--wr);font-weight:600;font-size:8px">${title}</div>
    <div style="color:var(--t);font-size:7px;margin-top:2px">${fix}</div>
  </div>`;
}

function statRow(label, value, ok) {
  const cls = ok ? "v" : "e";
  return `<div style="margin-bottom:8px"><span class="k">${label}:</span> <span class="${cls}">${value}</span></div>`;
}

export async function renderDiag() {
  const issues = await loadIssues();
  const tagCount = state.db ? state.db.exec("SELECT COUNT(*) FROM tags")[0]?.values[0][0] : 0;
  const onlineGw = state.gateways.filter((g) => g.status === "online").length;

  const stats =
    statRow("WebGPU", navigator.gpu ? "Available" : "Not available", !!navigator.gpu) +
    statRow("Gateways", `${state.gateways.length} configured, ${onlineGw} online`, true) +
    statRow("Database", state.db ? "Ready" : "Error", !!state.db) +
    statRow("Tags", tagCount, true) +
    statRow("LLM", state.llm.ready ? "Ready" : "Not loaded", state.llm.ready);

  $("diagPanel").innerHTML =
    `<div style="color:var(--gold);font-weight:600;margin-bottom:6px">🔧 System Diagnostics</div>` +
    stats +
    `<div style="color:var(--gold);font-weight:600;margin:8px 0 4px">Common Ignition Issues</div>` +
    issues.map(renderIssue).join("");
}
