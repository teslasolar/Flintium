// Chat message rendering. Kept in its own module so seed/gateway can call addMsg
// without pulling in the full chat send pipeline.

import { $ } from "./dom.js";

export function addMsg(type, text) {
  const d = document.createElement("div");
  d.className = "msg " + type;
  if (type === "tool") d.innerHTML = text;
  else d.textContent = text;
  const host = $("chatArea");
  if (host) {
    host.appendChild(d);
    host.scrollTop = 1e6;
  }
  return d;
}
