// SQLite (sql.js) initialization + stats refresh.

import { $ } from "./dom.js";
import { state, setDb } from "./state.js";

const SQLJS_BASE = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";

export async function initDB() {
  try {
    const SQL = await window.initSqlJs({ locateFile: (f) => SQLJS_BASE + f });
    const db = new SQL.Database();
    db.run(`CREATE TABLE IF NOT EXISTS tags(id INTEGER PRIMARY KEY AUTOINCREMENT,path TEXT UNIQUE,name TEXT,type TEXT,value TEXT,quality INTEGER DEFAULT 192,timestamp TEXT DEFAULT(datetime('now')),udt_type TEXT,parent_path TEXT,depth INTEGER DEFAULT 0)`);
    db.run(`CREATE TABLE IF NOT EXISTS tag_history(id INTEGER PRIMARY KEY AUTOINCREMENT,path TEXT,value TEXT,quality INTEGER,timestamp TEXT DEFAULT(datetime('now')))`);
    db.run(`CREATE TABLE IF NOT EXISTS udt_defs(name TEXT PRIMARY KEY,parent TEXT,fields TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS gateways(url TEXT PRIMARY KEY,name TEXT,status TEXT,last_ping TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS scripts(id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT,result TEXT,timestamp TEXT DEFAULT(datetime('now')),scope TEXT)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tp ON tags(path)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_hp ON tag_history(path)`);
    setDb(db);
    $("dbSt").textContent = "DB:ok";
    $("dbSt").style.color = "var(--ok)";
    return db;
  } catch (e) {
    $("dbSt").textContent = "DB:err";
    throw e;
  }
}

export function updateStats() {
  if (!state.db) return;
  const tc = state.db.exec("SELECT COUNT(*) FROM tags")[0]?.values[0][0] || 0;
  const hc = state.db.exec("SELECT COUNT(*) FROM tag_history")[0]?.values[0][0] || 0;
  $("tagCt").textContent = tc;
  const udtCount = state.udtIndex?.count ?? Object.keys(state.udts).length;
  $("dbStats").innerHTML =
    `<div><span class="k">tags:</span><span class="v">${tc}</span></div>` +
    `<div><span class="k">hist:</span><span class="v">${hc}</span></div>` +
    `<div><span class="k">udts:</span><span class="v">${udtCount}</span></div>` +
    `<div><span class="k">depth:</span><span class="v">9</span></div>`;
}
