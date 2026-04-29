// Gateway registration + probe.

import { $ } from "./dom.js";
import { state } from "./state.js";
import { addMsg } from "./chat-ui.js";

function render() {
  $("gwCards").innerHTML = state.gateways
    .map((g) => {
      const cls = g.status === "online" ? "ok" : g.status === "offline" ? "err" : "pen";
      const dot = g.status === "online" ? "var(--ok)" : g.status === "offline" ? "var(--er)" : "var(--wr)";
      return `<div class="gw ${cls}"><span style="color:${dot}">●</span> ${g.name} <span class="d">${g.status}</span></div>`;
    })
    .join("");
  const online = state.gateways.filter((g) => g.status === "online").length;
  $("gwSt").textContent = state.gateways.length ? `${online}/${state.gateways.length} gw` : "no gw";
}

async function probe(gw) {
  try {
    const r = await fetch(gw.url + "/StatusPing", { signal: AbortSignal.timeout(5000) });
    if (r.ok) {
      gw.status = "online";
      addMsg("sys", "✓ Gateway online: " + gw.name);
      return;
    }
    gw.status = "error";
  } catch (e) {
    gw.status = "offline";
    addMsg("sys", "Gateway unreachable. Local DB still works.");
  }
}

export async function addGateway() {
  const url = $("gwUrl").value.trim();
  if (!url) return;
  const gw = {
    url,
    name: url.replace(/https?:\/\//, "").split(":")[0],
    user: $("gwUser").value,
    pass: $("gwPass").value,
    status: "pending",
  };
  state.gateways.push(gw);
  if (state.db) {
    state.db.run("INSERT OR REPLACE INTO gateways VALUES(?,?,?,datetime('now'))", [gw.url, gw.name, "pending"]);
  }
  render();
  addMsg("sys", "Probing gateway: " + url + "...");
  await probe(gw);
  if (state.db) {
    state.db.run("UPDATE gateways SET status=?,last_ping=datetime('now') WHERE url=?", [gw.status, gw.url]);
  }
  render();
}

export function getOnlineGateway() {
  return state.gateways.find((g) => g.status === "online");
}
