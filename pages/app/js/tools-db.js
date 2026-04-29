// MCP tools — DB and OPC/PLC namespaces.

import { state } from "./state.js";

const need = () => (state.db ? null : { error: "no db" });

export const dbTools = {
  "db.query": {
    d: "Run SQL",
    fn: (a) => {
      const e = need(); if (e) return e;
      try {
        const r = state.db.exec(a.sql);
        return r.length ? { columns: r[0].columns, rows: r[0].values.slice(0, 15) } : { result: "empty" };
      } catch (err) {
        return { error: err.message };
      }
    },
  },
  "opc.browse": {
    d: "Browse OPC server",
    fn: (a) => {
      const e = need(); if (e) return e;
      const filter = (a.path || "").replace(/'/g, "''");
      const r = state.db.exec(
        "SELECT DISTINCT path FROM tags WHERE path LIKE '[Ignition OPC%' AND path LIKE '%" + filter + "%' LIMIT 20"
      );
      return { nodes: r.length ? r[0].values.map((v) => v[0]) : ["[No OPC tags — click 🔌 SEED PLC]"] };
    },
  },
  "plc.status": {
    d: "Check PLC status",
    fn: (a) => {
      const e = need(); if (e) return e;
      const r = state.db.exec(
        "SELECT path,value FROM tags WHERE path LIKE '%" + (a.name || "") + "%' AND (name='CommOK' OR name='Fault' OR name='Status') LIMIT 10"
      );
      return { status: r.length ? r[0].values.map((v) => ({ path: v[0], value: v[1] })) : [] };
    },
  },
};
