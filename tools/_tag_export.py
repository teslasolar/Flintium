"""Convert UDT/instance JSON to Ignition tag-import-compatible JSON."""
from ._loader import IGN_TYPE, default_for


def field_to_member(field):
    """Convert a field dict into an Ignition AtomicTag or UdtInstance member."""
    if field["t"].startswith("UDT:"):
        return {
            "name": field["n"],
            "tagType": "UdtInstance",
            "typeId": "Flintium/" + field["t"][4:],
        }
    return {
        "name": field["n"],
        "tagType": "AtomicTag",
        "valueSource": "memory",
        "dataType": IGN_TYPE.get(field["t"], "String"),
        "value": field.get("v", default_for(field["t"])),
    }


def udt_to_tag_def(name, udt):
    """Convert one UDT JSON to an Ignition UdtType node."""
    members = [field_to_member(f) for f in udt["fields"]]
    out = {"name": name, "tagType": "UdtType", "tags": members}
    if udt.get("parent"):
        out["typeId"] = "Flintium/" + udt["parent"]
    return out


def build_udt_export(udts, index):
    """Build the UDT type library tag export."""
    type_defs = [udt_to_tag_def(entry["name"], udts[entry["name"]]) for entry in index["udts"]]
    return {
        "name": "Flintium",
        "tagType": "Folder",
        "tags": [{"name": "_types_", "tagType": "Folder", "tags": type_defs}],
    }


def build_instance_export(instances):
    """Build a tag export of Folder/UdtInstance definitions for the seed presets."""
    tags = []
    for inst in instances:
        path_parts = inst["path"].split("]", 1)
        provider_path = path_parts[1] if len(path_parts) > 1 else inst["path"]
        folders = provider_path.split("/")
        leaf = folders[-1]
        tag = {
            "name": leaf,
            "tagType": "UdtInstance",
            "typeId": "Flintium/" + inst["udt"],
            "parameters": inst.get("overrides", {}),
        }
        tags.append({"path": provider_path, "udt": inst["udt"], "definition": tag})
    return {"name": "FlintiumInstances", "instances": tags}
