// WebLLM loader. The system prompt lives next to it but in its own file so we
// can keep this module under the token cap.

import { $ } from "./dom.js";
import { state } from "./state.js";
import { addMsg } from "./chat-ui.js";

export const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

export async function loadLLM() {
  if (state.llm.ready || state.llm.generating) return;
  $("llmSt").textContent = "LOADING";
  $("llmSt").style.color = "var(--wr)";
  $("btnLoadLLM").textContent = "⏳";
  addMsg("sys", "Loading " + MODEL_ID + "...");
  try {
    if (!navigator.gpu) throw new Error("WebGPU required");
    const webllm = await import("https://esm.run/@mlc-ai/web-llm");
    state.llm.engine = await webllm.CreateMLCEngine(MODEL_ID, {
      initProgressCallback: (p) => {
        $("llmProg").style.width = p.progress * 100 + "%";
        $("llmSt").textContent = (p.text || "").slice(0, 25);
      },
    });
    state.llm.ready = true;
    $("llmSt").textContent = "READY";
    $("llmSt").style.color = "var(--ok)";
    $("btnLoadLLM").textContent = "🧠";
    $("llmProg").style.width = "100%";
    $("llmProg").style.background = "var(--ok)";
    addMsg("sys", "Model ready. Ask about tags, UDTs, PLCs, alarms, or troubleshooting.");
  } catch (e) {
    $("llmSt").textContent = "ERR";
    $("llmSt").style.color = "var(--er)";
    $("btnLoadLLM").textContent = "🧠";
    addMsg("sys", "LLM: " + e.message + ". Tools still work via direct JSON.");
  }
}
