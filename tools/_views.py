"""Perspective view JSON builders. Each view returns a dict that gets dumped to view.json."""


def _coord_root(children, bg="#0e1116"):
    return {
        "children": children,
        "meta": {"name": "root"},
        "props": {"style": {"backgroundColor": bg}},
        "type": "ia.container.coord",
    }


def _label(name, x, y, w, h, text, *, size=14, bold=False, color="#e6edf3"):
    return {
        "meta": {"name": name},
        "position": {"x": x, "y": y, "width": w, "height": h},
        "props": {
            "text": text,
            "style": {
                "fontSize": size,
                "color": color,
                "fontWeight": "bold" if bold else "normal",
            },
        },
        "type": "ia.display.label",
    }


def _link(name, x, y, w, h, text, view_path):
    return {
        "events": {
            "dom": {
                "onClick": {
                    "type": "script",
                    "config": {
                        "script": f"system.perspective.navigate('{view_path}')",
                        "scope": "G",
                    },
                }
            }
        },
        "meta": {"name": name},
        "position": {"x": x, "y": y, "width": w, "height": h},
        "props": {
            "text": text,
            "style": {
                "backgroundColor": "#1c232c",
                "color": "#58a6ff",
                "borderColor": "#2a313c",
                "borderStyle": "solid",
                "borderWidth": 1,
                "borderRadius": 8,
                "padding": "12px 16px",
                "cursor": "pointer",
                "fontSize": 14,
            },
        },
        "type": "ia.display.label",
    }


def home_view():
    return {
        "custom": {},
        "params": {},
        "props": {"defaultSize": {"height": 768, "width": 1200}},
        "root": _coord_root([
            _label("title", 24, 24, 800, 50, "Flintium", size=32, bold=True, color="#f0883e"),
            _label("sub", 24, 76, 800, 30,
                   "Ignition Perspective project · UDT browser · MCP tools · project generator",
                   size=14, color="#8b949e"),
            _link("link_browser", 24, 130, 320, 80,
                  "▸ UDT Browser  —  view all 37 type definitions",
                  "Flintium/UDTBrowser"),
            _link("link_generator", 24, 222, 320, 80,
                  "▸ Project Generator  —  compose tag instances",
                  "Flintium/Generator"),
            _link("link_tools", 24, 314, 320, 80,
                  "▸ MCP Tools  —  call helpers from script consoles",
                  "Flintium/Tools"),
        ]),
    }


def udt_browser_view():
    return {
        "custom": {},
        "params": {},
        "props": {"defaultSize": {"height": 768, "width": 1200}},
        "root": _coord_root([
            _label("title", 24, 24, 800, 40, "UDT Type Browser", size=24, bold=True),
            _label("hint", 24, 70, 1100, 30,
                   "Each UDT is defined under Flintium/_types_/ in the tag browser. Click a row to inspect.",
                   color="#8b949e"),
            {
                "meta": {"name": "udtTable"},
                "position": {"x": 24, "y": 110, "width": 1150, "height": 580},
                "propConfig": {
                    "props.data": {
                        "binding": {
                            "type": "expr",
                            "config": {"expression": 'runScript("flintium.tools.list_udts", 0)'},
                        }
                    }
                },
                "props": {
                    "selection": {"mode": "single"},
                    "columns": [
                        {"field": "name", "header": "Type"},
                        {"field": "parent", "header": "Parent"},
                        {"field": "level", "header": "ISA Level"},
                        {"field": "fieldCount", "header": "Direct"},
                        {"field": "resolved", "header": "Resolved"},
                    ],
                },
                "type": "ia.display.table",
            },
        ]),
    }


def generator_view():
    return {
        "custom": {"projectName": "FlintiumProject"},
        "params": {},
        "props": {"defaultSize": {"height": 768, "width": 1200}},
        "root": _coord_root([
            _label("title", 24, 24, 800, 40, "Project Generator", size=24, bold=True),
            _label("hint", 24, 70, 1100, 30,
                   "Pick instance presets and call flintium.tools.create_instance(path, udt) to materialize them.",
                   color="#8b949e"),
            {
                "meta": {"name": "instTable"},
                "position": {"x": 24, "y": 110, "width": 1150, "height": 580},
                "propConfig": {
                    "props.data": {
                        "binding": {
                            "type": "expr",
                            "config": {"expression": 'runScript("flintium.tools.list_instances", 0)'},
                        }
                    }
                },
                "props": {
                    "selection": {"mode": "single"},
                    "columns": [
                        {"field": "id", "header": "Preset"},
                        {"field": "label", "header": "Label"},
                        {"field": "udt", "header": "UDT Type"},
                        {"field": "path", "header": "Tag Path"},
                    ],
                },
                "type": "ia.display.table",
            },
        ]),
    }


def tools_view():
    rows = [
        ("tag.read(path)", "system.tag.readBlocking([path])[0]"),
        ("tag.write(path, value)", "system.tag.writeBlocking([path],[value])[0]"),
        ("tag.browse(path)", "system.tag.browse(path)"),
        ("tag.history(path)", "system.tag.queryTagHistory([path])"),
        ("udt.list()", "flintium.tools.list_udts()"),
        ("udt.detail(name)", "flintium.tools.udt_detail(name)"),
        ("udt.create(path, udt)", "flintium.tools.create_instance(path, udt)"),
        ("alarm.active()", "system.alarm.queryStatus()"),
        ("alarm.ack(path)", "system.alarm.acknowledge([path])"),
        ("gw.status()", "system.util.getGatewayAddress()"),
        ("db.query(sql)", "system.db.runQuery(sql, 'default')"),
        ("opc.browse(path)", "system.opc.browseServer(...)"),
        ("plc.status(name)", "flintium.tools.plc_status(name)"),
        ("troubleshoot(issue)", "flintium.tools.troubleshoot(issue)"),
    ]
    rendered = ""
    for i, (call, impl) in enumerate(rows):
        y = 110 + i * 40
        rendered += f"<div style='font-size:13px;margin:6px 0'><b>{call}</b> → {impl}</div>"
    return {
        "custom": {},
        "params": {},
        "props": {"defaultSize": {"height": 768, "width": 1200}},
        "root": _coord_root([
            _label("title", 24, 24, 800, 40, "MCP Tool Reference", size=24, bold=True),
            _label("hint", 24, 70, 1100, 30,
                   "These browser-side MCP tools map onto Ignition system.* calls via flintium.tools.",
                   color="#8b949e"),
            {
                "meta": {"name": "list"},
                "position": {"x": 24, "y": 110, "width": 1150, "height": 580},
                "props": {
                    "html": rendered,
                    "style": {"color": "#e6edf3", "padding": "16px",
                              "backgroundColor": "#161b22", "borderRadius": 8, "overflow": "auto"},
                },
                "type": "ia.display.markdown",
            },
        ]),
    }
