#!/usr/bin/env python3
"""Inject related-tools sections into selected tool pages.

Run:
    python3 scripts/add_related_tools.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "frontend"

RELATED = {
    "qr-code": [("Wi-Fi QR", "wifi-qr/"), ("QR Scanner", "qr-scanner/"), ("Barcode Generator", "barcode-generator/")],
    "barcode-generator": [("QR Code Generator", "qr-code/"), ("QR Scanner", "qr-scanner/"), ("Wi-Fi QR", "wifi-qr/")],
    "qr-scanner": [("QR Code Generator", "qr-code/"), ("Wi-Fi QR", "wifi-qr/"), ("Barcode Generator", "barcode-generator/")],
    "gzip": [("Text Diff", "text-diff/"), ("Base64", "base64/"), ("Hash Generator", "hash-generator/")],
    "encrypt": [("Hash Generator", "hash-generator/"), ("Password Generator", "password-generator/"), ("UUID Generator", "uuid-generator/")],
    "led-resistor": [("Resistor Decoder", "resistor-decoder/"), ("Voltage Divider", "voltage-divider/"), ("Capacitor Decoder", "capacitor-decoder/")],
    "parking-meter": [("Trip Calculator", "fuel-log/"), ("Day Counter", "day-counter/"), ("Where Am I", "where-am-i/")],
    "cron-explainer": [("Unix Timestamp", "unix-timestamp/"), ("Date Difference", "date-difference/"), ("Countdown", "countdown/")],
    "ascii-table": [("Unicode Inspector", "unicode-inspector/"), ("Base Converter", "base-converter/"), ("HTML Entities", "html-entities/")],
    "number-to-words": [("Word Counter", "word-counter/"), ("Roman Numerals", "roman-numerals/"), ("Typing Test", "typing-test/")],
    "where-am-i": [("GPS Speedometer", "gps-speedometer/"), ("Maidenhead / QTH", "maidenhead/"), ("Parking Spot", "parking-spot/")],
    "keycode-viewer": [("Typing Test", "typing-test/"), ("Touch Tester", "touch-tester/"), ("Unicode Inspector", "unicode-inspector/")],
    "tap-bpm": [("Metronome", "metronome/"), ("Tone Generator", "tone-generator/"), ("Sound Meter", "sound-meter/")],
    "case-converter": [("Text Diff", "text-diff/"), ("Slug Cleaner", "slug-cleaner/"), ("Line Tools", "line-tools/")],
    "line-tools": [("Text Diff", "text-diff/"), ("Case Converter", "case-converter/"), ("JSON Beautifier", "json-beautifier/")],
    "hash-generator": [("UUID Generator", "uuid-generator/"), ("Password Generator", "password-generator/"), ("Encrypt/Decrypt", "encrypt/")],
    "password-generator": [("Hash Generator", "hash-generator/"), ("UUID Generator", "uuid-generator/"), ("Encrypt/Decrypt", "encrypt/")],
    "tone-generator": [("Sound Meter", "sound-meter/"), ("Metronome", "metronome/"), ("Tap BPM", "tap-bpm/")],
    "metronome": [("Tap BPM", "tap-bpm/"), ("Tone Generator", "tone-generator/"), ("Interval Timer", "interval-timer/")],
    "eyedropper": [("Color Converter", "color-converter/"), ("Contrast Checker", "contrast-checker/"), ("Color Palette", "color-palette/")],
    "color-converter": [("Eyedropper", "eyedropper/"), ("Contrast Checker", "contrast-checker/"), ("Color Palette", "color-palette/")],
    "json-beautifier": [("CSV ↔ JSON", "csv-json/"), ("YAML ⇄ JSON", "yaml-json/"), ("SQL Formatter", "sql-formatter/")],
    "csv-json": [("JSON Beautifier", "json-beautifier/"), ("YAML ⇄ JSON", "yaml-json/"), ("SQL Formatter", "sql-formatter/")],
    "yaml-json": [("JSON Beautifier", "json-beautifier/"), ("CSV ↔ JSON", "csv-json/"), ("SQL Formatter", "sql-formatter/")],
    "sql-formatter": [("JSON Beautifier", "json-beautifier/"), ("CSV ↔ JSON", "csv-json/"), ("YAML ⇄ JSON", "yaml-json/")],
    "base64": [("Gzip", "gzip/"), ("Hash Generator", "hash-generator/"), ("Image to Base64", "image-to-base64/")],
    "iban-validator": [("Loan Calculator", "loan-calculator/"), ("Debt Payoff", "debt-payoff/"), ("Tip & Tax", "tip-tax/")],
    "recipe-scaler": [("Unit Price", "unit-price/"), ("Tip & Tax", "tip-tax/"), ("Timer", "kitchen-timer/")],
    "unit-converter": [("Size Converter", "size-converter/"), ("Aspect Ratio", "aspect-ratio/"), ("DPI / Print Size", "dpi-print/")],
    "speaking-clock": [("World Clock", "world-clock/"), ("Timezone", "timezone/"), ("Unix Timestamp", "unix-timestamp/")],
    "timezone": [("World Clock", "world-clock/"), ("Meeting Overlap", "meeting-overlap/"), ("Unix Timestamp", "unix-timestamp/")],
    "world-clock": [("Timezone", "timezone/"), ("Meeting Overlap", "meeting-overlap/"), ("Speaking Clock", "speaking-clock/")],
    "stopwatch": [("Countdown", "countdown/"), ("Kitchen Timer", "kitchen-timer/"), ("Interval Timer", "interval-timer/")],
    "countdown": [("Stopwatch", "stopwatch/"), ("Kitchen Timer", "kitchen-timer/"), ("Interval Timer", "interval-timer/")],
    "kitchen-timer": [("Stopwatch", "stopwatch/"), ("Countdown", "countdown/"), ("Interval Timer", "interval-timer/")],
    "morse-code": [("Phonetic Alphabet", "phonetic-alphabet/"), ("NATO Phonetic", "phonetic-alphabet/"), ("Text to Speech", "text-to-speech/")],
}

SECTION_TEMPLATE = """\n    <section style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #ddd;">
      <h3 class="w3-medium">Related tools</h3>
      <p class="w3-small w3-text-grey">
{links}
      </p>
    </section>"""


def make_links(related):
    parts = []
    for label, href in related:
        parts.append(f'        <a href="../{href}" class="w3-text-blue" style="text-decoration: none;">{label}</a>')
    return " ·\n".join(parts)


def inject(page_id, related):
    path = ROOT / page_id / "index.html"
    html = path.read_text(encoding="utf-8")
    if "Related tools" in html:
        print(f"SKIP {page_id}: already has related tools")
        return
    section = SECTION_TEMPLATE.format(links=make_links(related))
    marker = "\n  <script src=\"app.js\"></script>"
    if marker not in html:
        print(f"WARN {page_id}: cannot find script marker")
        return
    html = html.replace(marker, section + marker, 1)
    path.write_text(html, encoding="utf-8")
    print(f"OK {page_id}")


def main():
    for page_id, related in sorted(RELATED.items()):
        inject(page_id, related)


if __name__ == "__main__":
    main()
