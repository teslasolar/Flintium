// Resolves Perspective propConfig bindings on a node's props.
// Supported: expression bindings of the form runScript("path", arg).

import { runScript } from "./tools-mock.js";

function setPath(obj, dotted, value) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] == null || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

async function evalExpr(expr) {
  const m = expr.match(/^\s*runScript\(\s*"([^"]+)"\s*(?:,\s*(.+))?\s*\)\s*$/);
  if (m) {
    const name = m[1];
    const arg = m[2];
    let parsed = [];
    if (arg != null && arg.trim().length) {
      try {
        parsed = [JSON.parse(arg)];
      } catch (e) {
        parsed = [arg];
      }
    }
    return runScript(name, ...parsed);
  }
  return null;
}

export async function resolveBindings(props, propConfig) {
  const out = JSON.parse(JSON.stringify(props || {}));
  for (const [path, config] of Object.entries(propConfig || {})) {
    if (!path.startsWith("props.")) continue;
    const propPath = path.slice("props.".length);
    const binding = config?.binding;
    if (!binding) continue;
    if (binding.type === "expr") {
      try {
        const value = await evalExpr(binding.config?.expression || "");
        setPath(out, propPath, value);
      } catch (e) {
        console.warn("[perspective] binding error:", path, e);
      }
    }
  }
  return out;
}
