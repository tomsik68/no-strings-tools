#!/usr/bin/env python3
"""Update JSON-LD schemas in all tool pages to SoftwareApplication.

Run:
    python3 scripts/update_schemas.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "frontend"
APPS_JSON = ROOT / "apps.json"


def load_apps():
    with APPS_JSON.open("r", encoding="utf-8") as f:
        apps = json.load(f)
    return {a["id"]: a for a in apps}


def update_tool_page(path, app):
    html = path.read_text(encoding="utf-8")
    # Replace WebApplication with SoftwareApplication in JSON-LD blocks
    html = html.replace('"@type": "WebApplication"', '"@type": "SoftwareApplication"')
    html = html.replace('"@type":"WebApplication"', '"@type":"SoftwareApplication"')
    path.write_text(html, encoding="utf-8")
    return '"WebApplication"' not in html


def update_about_page(path):
    html = path.read_text(encoding="utf-8")
    if "application/ld+json" in html:
        return True
    # Insert a WebPage schema after the twitter:card meta or before </head>
    schema = (
        '  <script type="application/ld+json">'
        '{"@context": "https://schema.org", "@type": "AboutPage", '
        '"name": "About No Strings Tools", '
        '"url": "https://nostrings.tools/about/", '
        '"description": "About No Strings Tools — a collection of free, offline-first web tools with no accounts, no ads and no tracking.", '
        '"author": {"@type": "Person", "name": "Tomáš Jašek", "url": "https://jasku.xyz"}}'
        '</script>\n'
    )
    if "<meta name=\"twitter:card\"" in html:
        html = html.replace(
            '<meta name="twitter:card" content="summary_large_image" />\n',
            '<meta name="twitter:card" content="summary_large_image" />\n' + schema,
        )
    else:
        html = html.replace("</head>", schema + "</head>", 1)
    path.write_text(html, encoding="utf-8")
    return True


def main():
    apps = load_apps()
    tool_dirs = [d for d in ROOT.iterdir() if d.is_dir() and (d / "index.html").exists()]
    updated = 0
    for d in sorted(tool_dirs):
        idx = d / "index.html"
        app_id = d.name
        if app_id in apps:
            if update_tool_page(idx, apps[app_id]):
                updated += 1
            else:
                print(f"WARN: {app_id} still has WebApplication")
        elif app_id == "about":
            update_about_page(idx)
            updated += 1
    print(f"Updated schemas in {updated} pages.")


if __name__ == "__main__":
    main()
