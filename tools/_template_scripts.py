"""Render the flintium.templates Jython script library that ships inside the
templates Perspective zip. It exposes the catalog as Python data so views in
a real Ignition gateway can do `runScript('flintium.templates.list_all', 0)`.
"""

INIT_PY = '"""flintium.templates - PlantPAx template catalog helpers."""\n'

CODE_TEMPLATE = '''"""flintium.templates - browse the bundled PlantPAx template catalog.

Auto-generated from pages/assets/catalog.json. Re-run
`python3 tools/build_templates_perspective.py` to regenerate.
"""

CATALOG = __CATALOG__


def list_all():
    """Return every template + window as a flat list."""
    return CATALOG["windows"] + CATALOG["templates"]


def list_by_kind(kind):
    """kind is 'windows' or 'templates'."""
    return CATALOG.get(kind, [])


def list_by_category(category):
    """Filter both kinds by category name (e.g. 'Components', 'Faceplates')."""
    return [i for i in list_all() if i.get("category") == category]


def detail(path):
    """Look up a single entry by its repo path."""
    for item in list_all():
        if item.get("path") == path:
            return item
    return None


def categories():
    """Return a sorted list of unique categories across both kinds."""
    return sorted({i.get("category") for i in list_all() if i.get("category")})
'''


def render_templates_py(catalog):
    slim = {
        "windows": [
            {k: v for k, v in i.items() if k != "files"} for i in catalog["windows"]
        ],
        "templates": [
            {k: v for k, v in i.items() if k != "files"} for i in catalog["templates"]
        ],
    }
    return CODE_TEMPLATE.replace("__CATALOG__", repr(slim))
