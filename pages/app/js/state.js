// Shared mutable state for the TAG.DB v2 app.
// One module owns it; everything else imports from here.

export const state = {
  db: null,
  udts: {},
  udtIndex: null,
  gateways: [],
  llm: { engine: null, ready: false, generating: false },
  recorder: null,
  recChunks: [],
};

export function setDb(db) { state.db = db; }
export function setUdts(udts, index) { state.udts = udts; state.udtIndex = index; }
