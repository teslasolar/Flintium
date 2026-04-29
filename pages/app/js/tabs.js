// Tab switching only. Diagnostics renderer lives in tabs-diag.js.

import { $ } from "./dom.js";
import { renderDiag } from "./tabs-diag.js";

export function showTab(name, target) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("on"));
  if (target) target.classList.add("on");
  $("chatPanel").style.display = name === "chat" ? "flex" : "none";
  $("consolePanel").style.display = name === "console" ? "flex" : "none";
  $("diagPanel").style.display = name === "diag" ? "block" : "none";
  if (name === "diag") renderDiag();
}
