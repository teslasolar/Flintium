"""Load UDT and instance JSON files from pages/data/."""
import json
from ._paths import DATA_DIR


def load_udts():
    index = json.loads((DATA_DIR / "udts" / "index.json").read_text())
    udts = {}
    for entry in index["udts"]:
        udts[entry["name"]] = json.loads((DATA_DIR / "udts" / entry["file"]).read_text())
    return udts, index


def load_instances():
    index = json.loads((DATA_DIR / "instances" / "index.json").read_text())
    instances = []
    for entry in index["instances"]:
        instances.append(json.loads((DATA_DIR / "instances" / entry["file"]).read_text()))
    return instances, index


IGN_TYPE = {
    "Boolean": "Boolean",
    "Int4": "Int4",
    "Float8": "Float8",
    "String": "String",
    "DateTime": "DateTime",
}


def default_for(t):
    if t == "Boolean":
        return False
    if t in ("Int4", "Float8"):
        return 0
    if t in ("String", "DateTime"):
        return ""
    return None
