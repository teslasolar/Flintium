// Event dispatch. Perspective events are stored as { type: "script",
// config: { script: "..." } } — we run them through a tiny pattern-matcher
// that recognises the system.* calls used by the demo views.

const NAVIGATE_RE = /system\.perspective\.navigate\(\s*['"]([^'"]+)['"]\s*\)/;

export function dispatchEvent(handler) {
  if (!handler) return;
  if (handler.type !== "script") {
    console.warn("[perspective] unsupported event type:", handler.type);
    return;
  }
  const code = handler.config?.script || "";
  const m = code.match(NAVIGATE_RE);
  if (m) {
    const target = m[1];
    window.dispatchEvent(new CustomEvent("perspective:navigate", { detail: { view: target } }));
    return;
  }
  console.warn("[perspective] unrecognised script:", code);
}
