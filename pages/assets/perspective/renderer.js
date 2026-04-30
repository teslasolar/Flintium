// Perspective view renderer. Walks a view JSON and produces a DOM subtree
// using the components registered in components/index.js.

import { COMPONENTS } from "./components/index.js";
import { resolveBindings } from "./bindings.js";

export async function renderView(viewJson, host) {
  host.innerHTML = "";
  host.style.position = "relative";
  host.style.overflow = "hidden";
  const size = viewJson?.props?.defaultSize;
  if (size) {
    host.style.width = size.width + "px";
    host.style.height = size.height + "px";
  }
  const root = await renderNode(viewJson.root);
  host.appendChild(root);
  return root;
}

async function renderNode(node) {
  if (!node) return document.createComment("(empty)");
  const comp = COMPONENTS[node.type];
  if (!comp) {
    const fallback = document.createElement("div");
    fallback.textContent = "[unsupported component: " + node.type + "]";
    fallback.style.color = "#ff4466";
    fallback.style.fontFamily = "monospace";
    fallback.style.padding = "6px";
    return fallback;
  }
  const props = await resolveBindings(node.props, node.propConfig);
  const el = comp.render({
    name: node.meta?.name,
    props,
    position: node.position,
    events: node.events,
  });
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const childEl = await renderNode(child);
      el.appendChild(childEl);
    }
  }
  return el;
}
