# Flintium Ignition Perspective Bundle

Auto-generated artifacts for importing Flintium into an Ignition gateway.
Regenerate with `python3 tools/build_perspective_export.py`.

## What's in this directory

| File | Purpose |
| --- | --- |
| `Flintium-Perspective-Project.zip` | Ignition project zip. Import via Gateway → Config → Projects → Import. |
| `Flintium-UDT-Tags.json` | UDT type library (37 types, 9 levels). Import via Designer → Tag Browser → Import Tags into the `[default]` provider. |
| `Flintium-Instance-Defaults.json` | Reference data for the 12 seed instance presets. Useful as a recipe; not directly importable. |
| `README.md` | This file. |

## Recommended import order

1. **Tags first.** In Designer, open the `[default]` tag provider, hit *Import Tags*, choose `Flintium-UDT-Tags.json`. UDT types land under `[default]Flintium/_types_/`. Set the collision policy to *Overwrite* to keep things clean on repeat imports.
2. **Project second.** On the gateway, go to *Config → Projects → Import*, point at `Flintium-Perspective-Project.zip`, accept the defaults. The project includes:
   - `Perspective/Views/Flintium/Home`
   - `Perspective/Views/Flintium/UDTBrowser`
   - `Perspective/Views/Flintium/Generator`
   - `Perspective/Views/Flintium/Tools`
   - Script library `flintium.tools` (Jython helpers wrapping `system.tag.*`, `system.alarm.*`, etc.)
3. **Open the project** in Designer or the Perspective launcher. Navigate to `Flintium/Home`.
4. **Materialize an instance.** From a script console: `flintium.tools.create_instance("Plant/TK-101", "Tank")`.

## What the views look like

- **Home** — navigation cards to the other views.
- **UDTBrowser** — a table populated from `flintium.tools.list_udts()`.
- **Generator** — a table populated from `flintium.tools.list_instances()`. Pair it with `flintium.tools.create_instance(...)` from a button event to materialize a preset.
- **Tools** — a static reference of every helper and the `system.*` call it wraps.

These are intentionally minimal starter views — they prove the project imports, exercise the script library, and give you something to extend. The richer interactive console lives in the GitHub Pages site under `pages/app/`.

## Customizing

- Add a new UDT: drop a JSON file in `pages/data/udts/`, append it to `pages/data/udts/index.json`, and rerun the build script.
- Add a new instance preset: same flow under `pages/data/instances/`.
- Modify the views: edit `tools/_views.py`. Modify the scripts: edit `tools/_scripts.py`. Both are kept small enough to fit in a single read.
