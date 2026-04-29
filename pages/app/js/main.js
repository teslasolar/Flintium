// TAG.DB v2 entry point. Loads partials, wires modules, boots the DB.

import { include } from "./dom.js";
import { loadUdts } from "./udt-registry.js";
import { initDB, updateStats } from "./db.js";
import { refreshTagTree, refreshUDTTree } from "./trees.js";
import { renderToolList } from "./tools.js";
import { addMsg } from "./chat-ui.js";
import { wireUp } from "./wiring.js";

const SQLJS_SCRIPT = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js";

async function loadPartials() {
  const slots = [...document.querySelectorAll("[data-include]")];
  for (const slot of slots) {
    await include(slot, "./partials/" + slot.dataset.include + ".html");
  }
}

function loadSqlJs() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SQLJS_SCRIPT;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function boot() {
  await loadPartials();
  wireUp();
  renderToolList();
  await loadUdts();
  refreshUDTTree();
  await loadSqlJs();
  await initDB();
  updateStats();
  refreshTagTree();
  addMsg(
    "sys",
    "TAG.DB v2 ready. UDTs loaded from /pages/data/udts/, instances from /pages/data/instances/. " +
      "Click 🌱 SEED for process tags, 🔌 SEED PLC for rack/slot/module structure."
  );
}

boot().catch((e) => {
  console.error(e);
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div style="color:#ff4466;padding:8px;font-family:monospace;font-size:11px">boot error: ${e.message}</div>`
  );
});
