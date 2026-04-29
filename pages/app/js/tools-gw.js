// MCP tools — gateway namespace.

import { state } from "./state.js";

export const gwTools = {
  "gw.status": {
    d: "Gateway status",
    fn: () => ({ gateways: state.gateways.map((g) => ({ url: g.url, status: g.status })) }),
  },
  "gw.ping": {
    d: "Ping gateway",
    fn: async (a) => {
      try {
        const r = await fetch(a.url + "/StatusPing", { signal: AbortSignal.timeout(3000) });
        return { ok: r.ok };
      } catch (e) {
        return { error: e.message };
      }
    },
  },
};
