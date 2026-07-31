#!/usr/bin/env python3
"""Update meta descriptions and schema descriptions for selected tool pages.

Run:
    python3 scripts/update_descriptions.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "frontend"

DESCRIPTIONS = {
    "gzip": "Gzip compress and decompress files or text online with this free gzip tool. No signup, no ads, no tracking — works offline in your browser.",
    "barcode-generator": "Generate EAN, UPC, Code 128, Code 39 and IMEI barcodes instantly. Free barcode generator — works offline in your browser.",
    "qr-scanner": "Scan QR codes and barcodes with your webcam or camera. Free online live QR scanner — no signup, works offline in your browser.",
    "led-resistor": "Calculate the resistor value for LED circuits. Free LED resistor calculator — works offline in your browser.",
    "parking-meter": "Calculate parking cost and track time with this free parking lot cost calculator. No signup — works offline in your browser.",
    "cron-explainer": "Decode cron expressions into plain English with this free cron explainer. No signup, no ads, no tracking — works offline.",
    "ascii-table": "Full ASCII table online with decimal, hex, octal, binary and character codes. Search and copy ASCII codes — works offline.",
    "number-to-words": "Convert numbers to words in English instantly. Type any number like 1234 or 114 and see it written out — works offline.",
    "where-am-i": "Find your GPS coordinates and current location. Get my coordinates with latitude and longitude — works offline in your browser.",
    "keycode-viewer": "See JavaScript key event values, keycodes and key codes. Press any key to test keycode, code and which values — works offline.",
    "tap-bpm": "Tap for BPM or tap tempo to find the beats per minute. Free online tap BPM tool — works in your browser.",
    "sound-meter": "Measure sound level and microphone dB with this free online sound meter. No signup, no ads, no tracking — works offline.",
    "encrypt": "Encrypt and decrypt text online with AES-256-GCM in your browser. Free word encryption tool — works offline, no signup.",
}


def update_page(page_id, description):
    path = ROOT / page_id / "index.html"
    html = path.read_text(encoding="utf-8")
    
    # Update meta description
    html = re.sub(
        r'<meta name="description" content="[^"]*" />',
        f'<meta name="description" content="{description}" />',
        html,
        count=1,
    )
    # Update og:description
    html = re.sub(
        r'<meta property="og:description" content="[^"]*" />',
        f'<meta property="og:description" content="{description}" />',
        html,
        count=1,
    )
    # Update JSON-LD description field
    html = re.sub(
        r'"description": "[^"]*", "applicationCategory"',
        f'"description": "{description}", "applicationCategory"',
        html,
        count=1,
    )
    path.write_text(html, encoding="utf-8")
    print(f"OK {page_id}")


def main():
    for page_id, description in sorted(DESCRIPTIONS.items()):
        update_page(page_id, description)


if __name__ == "__main__":
    main()
