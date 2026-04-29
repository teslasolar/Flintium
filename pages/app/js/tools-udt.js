// MCP tools — UDT namespace.

import { state } from "./state.js";
import { resolve } from "./udt-registry.js";
import { createInstance } from "./seed.js";

export const udtTools = {
  "udt.list": {
    d: "List UDT definitions",
    fn: () => ({
      udts: Object.entries(state.udts).map(([n, def]) => ({
        name: n,
        parent: def.parent,
        fields: def.fields.length,
        resolved: resolve(n).length,
      })),
    }),
  },
  "udt.detail": {
    d: "Resolve UDT fields",
    fn: (a) => {
      const f = resolve(a.name);
      return f.length
        ? {
            name: a.name,
            parent: state.udts[a.name]?.parent,
            fields: f.map((x) => ({ name: x.n, type: x.t, depth: x.d })),
          }
        : { error: "not found" };
    },
  },
  "udt.create": {
    d: "Create UDT instance",
    fn: (a) => {
      const c = createInstance(a.path, a.udt_type);
      return c ? { ok: true, tags: c } : { error: "failed" };
    },
  },
};
