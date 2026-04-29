// Aggregated MCP tool registry.

import { $ } from "./dom.js";
import { tagTools } from "./tools-tag.js";
import { udtTools } from "./tools-udt.js";
import { miscTools } from "./tools-misc.js";
import { updateStats } from "./db.js";
import { refreshTagTree } from "./trees.js";

export const TOOLS = { ...tagTools, ...udtTools, ...miscTools };

export function renderToolList() {
  $("mcpTools").innerHTML = Object.entries(TOOLS)
    .map(([n, t]) => `<div style="padding:1px 0"><span class="o">${n}</span> <span class="d">${t.d}</span></div>`)
    .join("");
}

export async function execTool(call) {
  const t = TOOLS[call.tool];
  if (!t) return { error: "unknown tool: " + call.tool };
  const result = t.fn.constructor.name === "AsyncFunction" ? await t.fn(call) : t.fn(call);
  updateStats();
  refreshTagTree();
  return result;
}

export function parseToolCall(text) {
  try {
    const j = JSON.parse(text);
    if (j && j.tool) return j;
  } catch (e) {}
  return null;
}
