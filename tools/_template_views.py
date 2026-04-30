"""Generate Perspective gallery views for the existing PlantPAx Vision
templates and windows.

Each gallery view is a single ia.display.markdown node containing a grid of
cards built from pages/assets/catalog.json. The view renders identically in
Ignition Perspective and in the in-browser renderer at pages/perspective.html.
"""
from html import escape

CARD_STYLE = (
    "display:inline-block;width:200px;margin:6px;background:#161b22;"
    "border:1px solid #2a313c;border-radius:8px;overflow:hidden;"
    "vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
)

THUMB_STYLE = "width:100%;height:140px;object-fit:contain;background:#fff;display:block"
META_STYLE = "padding:8px"
NAME_STYLE = "color:#e6edf3;font-size:13px;font-weight:600;word-break:break-word"
LABEL_STYLE = "color:#8b949e;font-size:11px;margin-top:2px;word-break:break-word"
LINK_STYLE = "color:#58a6ff;font-size:11px;display:block;margin-top:6px;text-decoration:none"


def card_html(item, repo, branch):
    raw = f"https://raw.githubusercontent.com/{repo}/{branch}/{item['thumbnail']}"
    blob = f"https://github.com/{repo}/tree/{branch}/{item['path']}"
    name = escape(item["name"])
    label = escape(item["label"])
    return (
        f"<div style=\"{CARD_STYLE}\">"
        f"<img src=\"{raw}\" alt=\"{name}\" style=\"{THUMB_STYLE}\" />"
        f"<div style=\"{META_STYLE}\">"
        f"<div style=\"{NAME_STYLE}\">{name}</div>"
        f"<div style=\"{LABEL_STYLE}\">{label}</div>"
        f"<a href=\"{blob}\" target=\"_blank\" style=\"{LINK_STYLE}\">View on GitHub →</a>"
        f"</div></div>"
    )


def gallery_view(title, subtitle, items, repo, branch):
    cards = "".join(card_html(i, repo, branch) for i in items)
    inner_html = (
        f"<div style=\"padding:0 12px 24px\">"
        f"<div style=\"color:#f0883e;font-size:24px;font-weight:600;margin-bottom:6px\">{escape(title)}</div>"
        f"<div style=\"color:#8b949e;font-size:13px;margin-bottom:14px\">{escape(subtitle)}</div>"
        f"<div>{cards}</div></div>"
    )
    height = max(700, 220 + (len(items) // 6 + 1) * 220)
    return {
        "custom": {},
        "params": {},
        "props": {"defaultSize": {"height": height, "width": 1400}},
        "root": {
            "children": [
                {
                    "meta": {"name": "gallery"},
                    "position": {"x": 0, "y": 0, "width": 1400, "height": height},
                    "props": {
                        "html": inner_html,
                        "style": {"backgroundColor": "#0e1116", "overflow": "auto"},
                    },
                    "type": "ia.display.markdown",
                }
            ],
            "meta": {"name": "root"},
            "props": {"style": {"backgroundColor": "#0e1116"}},
            "type": "ia.container.coord",
        },
    }


def index_view(catalog, repo):
    """Index/landing view that links to every gallery."""
    sections = []

    def section(title, links):
        items = "".join(
            f"<a href=\"#view=Flintium/Templates/{escape(slug)}\" "
            f"style=\"display:inline-block;margin:4px 8px 4px 0;padding:8px 14px;"
            f"background:#161b22;border:1px solid #2a313c;border-radius:6px;"
            f"color:#58a6ff;text-decoration:none;font-size:13px\">{escape(label)} ({count})</a>"
            for slug, label, count in links
        )
        return (
            f"<div style=\"margin-bottom:16px\">"
            f"<div style=\"color:#e6edf3;font-size:14px;font-weight:600;margin-bottom:8px\">{escape(title)}</div>"
            f"{items}</div>"
        )

    template_categories = sorted({i["category"] for i in catalog["templates"]})
    window_categories = sorted({i["category"] for i in catalog["windows"]})

    sections.append(
        section(
            "Templates",
            [("Templates_All", "All", len(catalog["templates"]))]
            + [
                (
                    f"Templates_{cat}",
                    cat,
                    sum(1 for i in catalog["templates"] if i["category"] == cat),
                )
                for cat in template_categories
            ],
        )
    )

    sections.append(
        section(
            "Windows",
            [("Windows_All", "All", len(catalog["windows"]))]
            + [
                (
                    f"Windows_{cat}",
                    cat,
                    sum(1 for i in catalog["windows"] if i["category"] == cat),
                )
                for cat in window_categories
            ],
        )
    )

    body = (
        f"<div style=\"padding:24px\">"
        f"<div style=\"color:#f0883e;font-size:32px;font-weight:700;margin-bottom:6px\">PlantPAx Template Library</div>"
        f"<div style=\"color:#8b949e;font-size:14px;margin-bottom:24px\">"
        f"{len(catalog['templates'])} Vision templates and {len(catalog['windows'])} windows from "
        f"<a href=\"https://github.com/{repo}\" target=\"_blank\" style=\"color:#58a6ff\">{escape(repo)}</a>, "
        f"organised by category. Click a chip to open that gallery; each card links back to the source on GitHub."
        f"</div>"
        + "".join(sections)
        + "</div>"
    )

    return {
        "custom": {},
        "params": {},
        "props": {"defaultSize": {"height": 700, "width": 1200}},
        "root": {
            "children": [
                {
                    "meta": {"name": "index"},
                    "position": {"x": 0, "y": 0, "width": 1200, "height": 700},
                    "props": {
                        "html": body,
                        "style": {"backgroundColor": "#0e1116", "overflow": "auto"},
                    },
                    "type": "ia.display.markdown",
                }
            ],
            "meta": {"name": "root"},
            "props": {"style": {"backgroundColor": "#0e1116"}},
            "type": "ia.container.coord",
        },
    }


def build_template_views(catalog, repo, branch):
    """Return dict[view_path] -> view_dict for the template Perspective project."""
    views = {"Flintium/Templates/Index": index_view(catalog, repo)}

    views["Flintium/Templates/Templates_All"] = gallery_view(
        "All Vision Templates",
        f"{len(catalog['templates'])} templates · click any card to open the source on GitHub",
        catalog["templates"],
        repo,
        branch,
    )
    for cat in sorted({i["category"] for i in catalog["templates"]}):
        items = [i for i in catalog["templates"] if i["category"] == cat]
        views[f"Flintium/Templates/Templates_{cat}"] = gallery_view(
            f"Templates · {cat}",
            f"{len(items)} templates in the {cat} category",
            items,
            repo,
            branch,
        )

    views["Flintium/Templates/Windows_All"] = gallery_view(
        "All Vision Windows",
        f"{len(catalog['windows'])} windows · faceplates, popups, examples, administration",
        catalog["windows"],
        repo,
        branch,
    )
    for cat in sorted({i["category"] for i in catalog["windows"]}):
        items = [i for i in catalog["windows"] if i["category"] == cat]
        views[f"Flintium/Templates/Windows_{cat}"] = gallery_view(
            f"Windows · {cat}",
            f"{len(items)} windows in the {cat} category",
            items,
            repo,
            branch,
        )
    return views
