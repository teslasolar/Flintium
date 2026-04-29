// Tiny DOM helpers shared across modules.
export const $ = (id) => document.getElementById(id);

export function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else if (v != null) n.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return n;
}

export async function fetchText(url) {
  const r = await fetch(url, { cache: "no-cache" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

export async function fetchJson(url) {
  const r = await fetch(url, { cache: "no-cache" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

export async function include(slot, url) {
  slot.outerHTML = await fetchText(url);
}
