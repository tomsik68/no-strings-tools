#!/usr/bin/env python3
"""Generate frontend/index.html and frontend/sitemap.xml from frontend/apps.json.

Run this after editing apps.json or before deploying:
    python3 scripts/generate.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "frontend"
APPS_JSON = ROOT / "apps.json"
TEMPLATE = ROOT / "index.template.html"
DASHBOARD = ROOT / "index.html"
SITEMAP = ROOT / "sitemap.xml"


def load_apps():
    with APPS_JSON.open("r", encoding="utf-8") as f:
        apps = json.load(f)
    # Sort by id (folder name) for stable output
    return sorted(apps, key=lambda a: a["id"])


def render_card(app):
    href = f"./{app['id']}/index.html"
    title = app["title"]
    emoji = app.get("emoji", "")
    desc = app["description"]
    heading = f"{emoji} {title}".strip()
    return (
        f'      <a href="{href}" class="app-card">\n'
        f"        <div>\n"
        f"          <h3>{heading}</h3>\n"
        f"          <p>{desc}</p>\n"
        f"        </div>\n"
        f"      </a>\n"
    )


def generate_dashboard(apps):
    cards = "".join(render_card(a) for a in apps)
    template = TEMPLATE.read_text(encoding="utf-8")
    output = template.replace("<!-- APPS -->", cards)
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


def main():
    apps = load_apps()
    generate_dashboard(apps)
    generate_sitemap(apps)
    print(f"Generated dashboard and sitemap for {len(apps)} apps.")


if __name__ == "__main__":
    main()
