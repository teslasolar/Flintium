#!/usr/bin/env python3
"""Build a Perspective project zip that catalogs every Vision template +
window already in the repo. Reads pages/assets/catalog.json, generates a
gallery-per-category set of Perspective views, and bundles them with a
flintium.templates script library."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools._paths import DIST_DIR, ROOT
from tools._template_views import build_template_views
from tools._template_scripts import INIT_PY, render_templates_py
from tools._zip_writer import write_project_zip

REPO = "teslasolar/Flintium"
BRANCH = "master"


def load_catalog():
    return json.loads((ROOT / "pages" / "assets" / "catalog.json").read_text())


def main():
    catalog = load_catalog()
    views = build_template_views(catalog, REPO, BRANCH)

    scripts = {
        "flintium": INIT_PY,
        "flintium/templates": render_templates_py(catalog),
    }

    DIST_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = DIST_DIR / "Flintium-PlantPAx-Templates-Perspective.zip"
    write_project_zip(zip_path, views=views, scripts=scripts)

    # Mirror to the in-browser renderer so the demo picker can show them.
    persp_root = ROOT / "pages" / "data" / "perspective" / "views"
    existing_index = json.loads((persp_root / "index.json").read_text())
    existing_paths = {v["path"] for v in existing_index["views"]}

    for view_path, view_dict in views.items():
        view_dir = persp_root / view_path
        view_dir.mkdir(parents=True, exist_ok=True)
        (view_dir / "view.json").write_text(json.dumps(view_dict, indent=2))
        if view_path not in existing_paths:
            existing_index["views"].append(
                {
                    "path": view_path,
                    "name": view_path.split("/")[-1],
                    "file": view_path + "/view.json",
                }
            )
    existing_index["views"].sort(key=lambda v: v["path"])
    (persp_root / "index.json").write_text(json.dumps(existing_index, indent=2))

    print("Templates zip:", zip_path, "(", zip_path.stat().st_size, "bytes )")
    print("Views written:", len(views))
    print("Categories: templates =",
          len({i["category"] for i in catalog["templates"]}),
          "; windows =", len({i["category"] for i in catalog["windows"]}))
    print("Catalog: ", len(catalog["templates"]), "templates +",
          len(catalog["windows"]), "windows")


if __name__ == "__main__":
    main()
