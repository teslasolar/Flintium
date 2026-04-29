// MCP tools — tag namespace.

import { state } from "./state.js";

const need = () => (state.db ? null : { error: "no db" });

export const tagTools = {
  "tag.read": {
    d: "Read tag value",
    fn: (a) => {
      const e = need(); if (e) return e;
      const r = state.db.exec(
        "SELECT path,value,type,quality,timestamp FROM tags WHERE path LIKE '%" + (a.path || "").replace(/'/g, "''") + "%' LIMIT 10"
      );
      return r.length
        ? { tags: r[0].values.map((v) => ({ path: v[0], value: v[1], type: v[2], quality: v[3] })) }
        : { error: "not found" };
    },
  },
  "tag.write": {
    d: "Write tag value",
    fn: (a) => {
      const e = need(); if (e) return e;
      state.db.run("UPDATE tags SET value=?,timestamp=datetime('now') WHERE path=?", [a.value, a.path]);
      state.db.run("INSERT INTO tag_history VALUES(NULL,?,?,192,datetime('now'))", [a.path, a.value]);
      return { ok: true, path: a.path };
    },
  },
  "tag.browse": {
    d: "Browse children",
    fn: (a) => {
      const e = need(); if (e) return e;
      const p = a.path || "[default]";
      const r = state.db.exec(
        "SELECT DISTINCT path FROM tags WHERE path LIKE ?||'/%' ORDER BY path LIMIT 30",
        [p]
      );
      return { children: r.length ? r[0].values.map((v) => v[0]) : [] };
    },
  },
  "tag.history": {
    d: "Query history",
    fn: (a) => {
      const e = need(); if (e) return e;
      const r = state.db.exec(
        "SELECT value,timestamp FROM tag_history WHERE path=? ORDER BY timestamp DESC LIMIT 15",
        [a.path]
      );
      return { history: r.length ? r[0].values.map((v) => ({ v: v[0], t: v[1] })) : [] };
    },
  },
  "tag.search": {
    d: "Search by pattern",
    fn: (a) => {
      const e = need(); if (e) return e;
      const q = (a.q || "").replace(/'/g, "''");
      const r = state.db.exec(
        "SELECT path,value,type FROM tags WHERE path LIKE '%" + q + "%' OR name LIKE '%" + q + "%' LIMIT 20"
      );
      return { results: r.length ? r[0].values.map((v) => ({ path: v[0], value: v[1], type: v[2] })) : [] };
    },
  },
};
