#!/usr/bin/env python3
"""Generate frontend/index.html, frontend/sitemap.xml and frontend/llms.txt
from frontend/apps.json.

Run this after editing apps.json or before deploying:
    python3 scripts/generate.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "frontend"
APPS_JSON = ROOT / "apps.json"
TEMPLATE = ROOT / "index.template.html"
DASHBOARD = ROOT / "index.html"
SITEMAP = ROOT / "sitemap.xml"
LLMS_TXT = ROOT / "llms.txt"

# Apps whose app.js declares localStorage keys that don't represent the
# user's own saved data (e.g. generic import/export helpers), so they should
# never show up in the "apps with your data" dashboard section even though
# they technically call localStorage.
STORAGE_KEY_SCAN_EXCLUDE = {"backup", "data-sync"}

KEY_PATTERNS = [
    re.compile(r'const\s+[A-Z_]*KEY[A-Z_]*\s*=\s*["\']([^"\']+)["\']'),
    re.compile(r'localStorage\.(?:get|set|remove)Item\(\s*["\']([^"\']+)["\']'),
]


def load_apps():
    with APPS_JSON.open("r", encoding="utf-8") as f:
        apps = json.load(f)
    # Sort by id (folder name) for stable output
    return sorted(apps, key=lambda a: a["id"])


def scan_storage_keys(apps):
    """Best-effort extraction of each app's localStorage key(s) by scanning
    its app.js for `const FOO_KEY = "..."` declarations and direct
    localStorage.*Item("...") calls. Used to detect which apps already hold
    user data, for the dashboard's "apps with your data" section."""
    mapping = {}
    for app in apps:
        app_id = app["id"]
        if app_id in STORAGE_KEY_SCAN_EXCLUDE:
            continue
        app_js = ROOT / app_id / "app.js"
        if not app_js.exists():
            continue
        content = app_js.read_text(encoding="utf-8", errors="ignore")
        if "localStorage" not in content:
            continue
        keys = set()
        for pattern in KEY_PATTERNS:
            keys.update(pattern.findall(content))
        if keys:
            mapping[app_id] = sorted(keys)
    return mapping


def render_card(app):
    href = f"./{app['id']}/"
    title = app["title"]
    emoji = app.get("emoji", "")
    desc = app["description"]
    heading = f"{emoji} {title}".strip()
    return (
        f'      <div class="app-card" data-href="{href}">\n'
        f'        <h3><a href="{href}">{heading}</a></h3>\n'
        f"        <p>{desc}</p>\n"
        f"      </div>\n"
    )


def generate_dashboard(apps):
    cards = "".join(render_card(a) for a in apps)
    storage_map = scan_storage_keys(apps)
    template = TEMPLATE.read_text(encoding="utf-8")
    output = template.replace("<!-- APPS -->", cards)
    output = output.replace(
        "/* APP_STORAGE_KEYS */ {}",
        json.dumps(storage_map, separators=(",", ":")),
    )
    DASHBOARD.write_text(output, encoding="utf-8")


def generate_sitemap(apps):
    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    from datetime import date
    today = date.today().isoformat()
    lines.append(f"  <url><loc>https://nostrings.tools/</loc><lastmod>{today}</lastmod></url>")
    lines.append(f"  <url><loc>https://nostrings.tools/about/</loc><lastmod>{today}</lastmod></url>")
    for app in apps:
        lines.append(f"  <url><loc>https://nostrings.tools/{app['id']}/</loc><lastmod>{today}</lastmod></url>")
    lines.append("</urlset>")
    SITEMAP.write_text("\n".join(lines) + "\n", encoding="utf-8")


def generate_llms_txt(apps):
    """Write llms.txt (https://llmstxt.org): a Markdown map of the site for LLMs."""
    lines = [
        "# No Strings Tools",
        "",
        "> nostrings.tools is a collection of small, single-purpose web tools "
        "(converters, calculators, generators, trackers). Every tool runs entirely "
        "in the browser: no login, no tracking, no ads, no server, and it works offline.",
        "",
        "Data a tool saves stays in the browser's localStorage on the user's device; "
        "the Backup tool exports and restores it as a JSON file. Tools are free to use "
        "and each page is self-contained.",
        "",
        "## Tools",
        "",
    ]
    for app in apps:
        lines.append(f"- [{app['title']}](https://nostrings.tools/{app['id']}/): {app['description']}")
    lines += [
        "",
        "## Optional",
        "",
        "- [About](https://nostrings.tools/about/): The philosophy behind the project",
        "- [Source code](https://github.com/tomsik68/no-strings-tools): All tools, plain HTML and JavaScript",
    ]
    LLMS_TXT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    apps = load_apps()
    generate_dashboard(apps)
    generate_sitemap(apps)
    generate_llms_txt(apps)
    print(f"Generated dashboard, sitemap and llms.txt for {len(apps)} apps.")


if __name__ == "__main__":
    main()
