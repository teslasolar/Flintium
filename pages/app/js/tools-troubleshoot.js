// MCP tools — troubleshooting knowledge base.

import { fetchJson } from "./dom.js";

let kbCache = null;

async function loadKB() {
  if (kbCache) return kbCache;
  kbCache = await fetchJson("./partials/troubleshoot.json");
  return kbCache;
}

export const troubleshootTools = {
  troubleshoot: {
    d: "Diagnose issue",
    fn: async (a) => {
      const kb = await loadKB();
      const issue = (a.issue || "").toLowerCase();
      const key = Object.keys(kb).find((k) => issue.includes(k));
      return key
        ? { diagnosis: kb[key], issue: a.issue }
        : { diagnosis: "Describe more specifically. Topics: " + Object.keys(kb).join(", ") };
    },
  },
};
