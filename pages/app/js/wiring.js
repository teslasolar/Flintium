// Binds every button and tab in the partials to its module function.
// Kept separate from main.js so the wiring map is easy to scan.

import { $ } from "./dom.js";
import { addGateway } from "./gateways.js";
import { runScript } from "./console.js";
import { runSQL } from "./sql.js";
import { showTab } from "./tabs.js";
import { send } from "./chat.js";
import { loadLLM } from "./llm.js";
import { seedDB, seedPLC } from "./seed.js";
import { toggleRec } from "./recorder.js";

const BINDINGS = [
  ["btnConnectGw", "click", addGateway],
  ["btnSend", "click", send],
  ["btnRunScript", "click", runScript],
  ["btnRunSql", "click", runSQL],
  ["btnLoadLLM", "click", loadLLM],
  ["btnSeed", "click", seedDB],
  ["btnSeedPlc", "click", seedPLC],
  ["btnRec", "click", toggleRec],
];

export function wireUp() {
  for (const [id, evt, fn] of BINDINGS) {
    const node = $(id);
    if (node) node.addEventListener(evt, fn);
  }
  $("chatIn")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  });
  document.querySelectorAll(".tab").forEach((t) => {
    t.addEventListener("click", () => showTab(t.dataset.tab, t));
  });
  document.querySelectorAll(".ts-item").forEach((it) => {
    it.style.cursor = "pointer";
    it.style.padding = "1px 0";
    it.addEventListener("click", () => {
      $("chatIn").value = it.dataset.q;
      send();
    });
  });
}
