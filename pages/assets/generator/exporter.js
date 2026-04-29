// Exports a composed project as Ignition-friendly JSON.
// Two formats:
//   - "tags": flat tag list compatible with system.tag.configure / Designer Import
//   - "bundle": full snapshot (UDT defs + instances + flat tags) for archival

import { expandInstance } from "./composer.js";

const IGN_TYPE = {
  Boolean: "Boolean",
  Int4: "Int4",
  Float8: "Float8",
  String: "String",
  DateTime: "DateTime",
};

export function toTagsExport(project, udts) {
  const tags = [];
  for (const inst of project.instances) {
    const expanded = expandInstance(udts, inst);
    for (const t of expanded) {
      tags.push({
        name: t.fullPath.split("/").pop(),
        path: t.fullPath,
        valueSource: "memory",
        dataType: IGN_TYPE[t.type] || "String",
        value: t.value,
      });
    }
  }
  return {
    name: project.name,
    tagType: "Folder",
    tags,
    metadata: {
      generatedBy: "Flintium Project Generator",
      createdAt: project.createdAt,
      instanceCount: project.instances.length,
      tagCount: tags.length,
    },
  };
}

export function toBundleExport(project, registry) {
  const usedUdts = new Set();
  for (const inst of project.instances) {
    walkUdt(inst.udt, registry.udts, usedUdts);
  }
  return {
    project: {
      name: project.name,
      createdAt: project.createdAt,
    },
    udts: [...usedUdts].map((n) => registry.udts[n]),
    instances: project.instances,
    tags: toTagsExport(project, registry.udts).tags,
  };
}

function walkUdt(name, udts, acc) {
  if (acc.has(name) || !udts[name]) return;
  acc.add(name);
  const def = udts[name];
  if (def.parent) walkUdt(def.parent, udts, acc);
  for (const f of def.fields) {
    if (typeof f.t === "string" && f.t.startsWith("UDT:")) walkUdt(f.t.slice(4), udts, acc);
  }
}

export function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
