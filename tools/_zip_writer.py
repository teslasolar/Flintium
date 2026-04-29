"""Assemble the Ignition Perspective project zip from the parts."""
import io
import json
import zipfile

from ._paths import PROJECT_NAME, TIMESTAMP


def view_resource_json():
    """Standard Perspective view resource manifest."""
    return {
        "scope": "G",
        "version": 1,
        "restricted": False,
        "overridable": True,
        "files": ["view.json"],
        "attributes": {
            "lastModification": {"actor": "admin", "timestamp": TIMESTAMP},
            "lastModificationSignature": "",
        },
    }


def script_resource_json():
    """Standard script-package resource manifest."""
    return {
        "scope": "G",
        "version": 1,
        "restricted": False,
        "overridable": True,
        "files": ["code.py"],
        "attributes": {
            "lastModification": {"actor": "admin", "timestamp": TIMESTAMP},
            "lastModificationSignature": "",
        },
    }


def project_manifest():
    """Top-level project.json that Ignition reads on import."""
    return {
        "title": PROJECT_NAME,
        "description": "Flintium UDT browser, MCP tools, and project generator (auto-generated).",
        "parent": "",
        "enabled": True,
        "inheritable": False,
    }


def write_json(zf, path, payload):
    zf.writestr(path, json.dumps(payload, indent=2))


def write_text(zf, path, text):
    zf.writestr(path, text)


def add_view(zf, view_path, view_dict):
    """view_path looks like 'Flintium/Home'."""
    base = "com.inductiveautomation.perspective/views/" + view_path + "/"
    write_json(zf, base + "view.json", view_dict)
    write_json(zf, base + "resource.json", view_resource_json())


def add_script(zf, package_path, code):
    """package_path looks like 'flintium/tools'."""
    base = "ignition/script-python/" + package_path + "/"
    write_text(zf, base + "code.py", code)
    write_json(zf, base + "resource.json", script_resource_json())


def write_project_zip(out_path, *, views, scripts):
    """views: dict[view_path] -> view_dict.   scripts: dict[package_path] -> code_str."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        write_json(zf, "project.json", project_manifest())
        for view_path, view in views.items():
            add_view(zf, view_path, view)
        for pkg_path, code in scripts.items():
            add_script(zf, pkg_path, code)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(buf.getvalue())
    return out_path
