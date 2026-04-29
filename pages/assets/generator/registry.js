// Loads UDT definitions and instance presets from /pages/data/.
// Caches the loaded registry for the lifetime of the page.

let _registry = null;

export async function loadRegistry(prefix) {
  if (_registry) return _registry;
  const dataBase = prefix + "pages/data/";
  const [udtIndex, instIndex] = await Promise.all([
    fetch(dataBase + "udts/index.json").then((r) => r.json()),
    fetch(dataBase + "instances/index.json").then((r) => r.json()),
  ]);
  const udts = {};
  await Promise.all(
    udtIndex.udts.map((u) =>
      fetch(dataBase + "udts/" + u.file)
        .then((r) => r.json())
        .then((def) => {
          udts[def.name] = def;
        })
    )
  );
  const instances = {};
  await Promise.all(
    instIndex.instances.map((i) =>
      fetch(dataBase + "instances/" + i.file)
        .then((r) => r.json())
        .then((def) => {
          instances[def.id] = def;
        })
    )
  );
  _registry = { udts, instances, udtIndex, instIndex };
  return _registry;
}
