// MCP tools — alarm namespace.

import { state } from "./state.js";

const need = () => (state.db ? null : { error: "no db" });

export const alarmTools = {
  "alarm.active": {
    d: "List active alarms",
    fn: () => {
      const e = need(); if (e) return e;
      const r = state.db.exec(
        "SELECT path,value FROM tags WHERE name='Active' AND value='true' AND path LIKE '%Alarm%' LIMIT 20"
      );
      return { alarms: r.length ? r[0].values.map((v) => ({ path: v[0] })) : [] };
    },
  },
  "alarm.ack": {
    d: "Acknowledge alarm",
    fn: (a) => {
      const e = need(); if (e) return e;
      state.db.run("UPDATE tags SET value='true' WHERE path=?", [a.path.replace("/Active", "/Acked")]);
      return { ok: true };
    },
  },
};
