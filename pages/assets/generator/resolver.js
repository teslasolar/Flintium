// Resolves a UDT into a flat list of leaf fields by walking parents and
// inlining nested UDT references up to a depth cap.
// Returns: [{ path, type, defaultValue, depth }]

const MAX_DEPTH = 9;

function fieldsFor(udts, name) {
  const def = udts[name];
  if (!def) return [];
  const parentFields = def.parent ? fieldsFor(udts, def.parent) : [];
  return [...parentFields, ...def.fields];
}

export function resolveUdt(udts, name, depth = 0) {
  if (depth > MAX_DEPTH || !udts[name]) return [];
  const out = [];
  for (const field of fieldsFor(udts, name)) {
    if (typeof field.t === "string" && field.t.startsWith("UDT:")) {
      const sub = resolveUdt(udts, field.t.slice(4), depth + 1);
      for (const s of sub) {
        out.push({
          path: field.n + "/" + s.path,
          type: s.type,
          defaultValue: s.defaultValue,
          depth: s.depth + 1,
        });
      }
    } else {
      out.push({
        path: field.n,
        type: field.t,
        defaultValue: field.v ?? defaultFor(field.t),
        depth,
      });
    }
  }
  return out;
}

export function defaultFor(type) {
  switch (type) {
    case "Boolean": return false;
    case "Int4": return 0;
    case "Float8": return 0;
    case "String": return "";
    case "DateTime": return "";
    default: return null;
  }
}

export function leafCount(udts, name) {
  return resolveUdt(udts, name).length;
}
