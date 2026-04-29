// Chat send pipeline: tries direct tool JSON, troubleshoot KB, then LLM.

import { $ } from "./dom.js";
import { state } from "./state.js";
import { addMsg } from "./chat-ui.js";
import { execTool, parseToolCall, TOOLS } from "./tools.js";
import { SYS_PROMPT } from "./llm-prompt.js";

function renderToolResult(name, result) {
  return `<b>→${name}</b><pre>${JSON.stringify(result, null, 1).slice(0, 400)}</pre>`;
}

async function maybeDirectTool(input) {
  const direct = parseToolCall(input);
  if (!direct) return false;
  const r = await execTool(direct);
  addMsg("tool", renderToolResult(direct.tool, r));
  return true;
}

async function maybeTroubleshoot(input) {
  const r = await TOOLS.troubleshoot.fn({ issue: input });
  if (r.diagnosis && !r.diagnosis.startsWith("Describe")) {
    addMsg("tool", renderToolResult("troubleshoot", r));
    return true;
  }
  return false;
}

async function streamLLM(input, botDiv) {
  const chunks = await state.llm.engine.chat.completions.create({
    messages: [{ role: "system", content: SYS_PROMPT }, { role: "user", content: input }],
    max_tokens: 300,
    temperature: 0.3,
    stream: true,
  });
  let full = "";
  for await (const chunk of chunks) {
    full += chunk.choices[0]?.delta?.content || "";
    botDiv.textContent = full;
    $("chatArea").scrollTop = 1e6;
  }
  return full;
}

async function maybeExtractTool(full) {
  const m = full.match(/\{"tool"\s*:\s*"[^"]+"/);
  if (!m) return;
  try {
    const start = full.indexOf(m[0]);
    const end = full.indexOf("}", start) + 1;
    const j = JSON.parse(full.slice(start, end));
    const r = await execTool(j);
    addMsg("tool", renderToolResult(j.tool, r));
  } catch (e) {}
}

export async function send() {
  const input = $("chatIn").value.trim();
  if (!input) return;
  $("chatIn").value = "";
  addMsg("user", input);
  if (await maybeDirectTool(input)) return;
  const tsHandled = await maybeTroubleshoot(input);
  if (!state.llm.ready) {
    if (!tsHandled) addMsg("sys", 'Load model or use JSON: {"tool":"tag.browse","path":"[default]"}');
    return;
  }
  state.llm.generating = true;
  const botDiv = addMsg("bot", "");
  try {
    const full = await streamLLM(input, botDiv);
    await maybeExtractTool(full);
  } catch (e) {
    botDiv.textContent = "Error: " + e.message;
  } finally {
    state.llm.generating = false;
  }
}
