#!/usr/bin/env python3
"""Update titles and meta descriptions for all apps based on SEO audit.

This script updates:
- <title> tags
- meta description
- og:description
- JSON-LD description

Run:
    python3 scripts/update_seo_comprehensive.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "frontend"

# Format: "app-folder": ("new_title", "new_description")
UPDATES = {
    "metronome": ("Tap Tempo & Metronome Online", "Tap to find your BPM or use the metronome. Real-time tempo detection as you tap — adjust the speed instantly. Works offline."),
    "noise-generator": ("Tone Generator Online", "Generate sine wave tones or white noise online. Adjust frequency and volume, play instantly. Useful for hearing tests, audio work, meditation."),
    "uuid-generator": ("Random UUID Generator Online", "Generate random UUIDs (v4) instantly. Copy with one click, no server involved — works in your browser."),
    "tap-bpm": ("Tap BPM Online", "Tap the spacebar or screen to find BPM. Real-time tempo display updates instantly as you tap. Works in any browser."),
    "gzip": ("Gzip Compress & Decompress Online", "Compress or decompress text and files with gzip. Paste or upload, instant results. No size limits."),
    "wifi-qr": ("WiFi QR Code Generator Online", "Generate a QR code for your Wi-Fi network. Share with guests — they scan to connect instantly. With or without password."),
    "qr-scanner": ("QR Code Scanner Online", "Scan QR codes and barcodes with your webcam. Point and decode instantly, no app needed."),
    "keystroke-test": ("Keystroke Test Online", "Test keyboard speed and ghosting. Measure keys per second and per minute. Instant results, no calibration needed."),
    "typing-test": ("Typing Test Online", "Measure typing speed (WPM) and accuracy in real-time. Results show your performance — compare sessions to track improvement."),
    "phonetic-alphabet": ("NATO Phonetic Alphabet Online", "Reference and converter: Alpha, Bravo, Charlie … Zulu. Look up codes or convert any text to phonetic spelling instantly."),
    "json-beautifier": ("JSON Formatter Online", "Paste messy JSON, get it formatted with syntax highlighting. Errors highlighted in red. Copy formatted result instantly."),
    "text-diff": ("Text Diff Online", "Paste two texts to see line-by-line differences. Color-coded additions and removals. Instant results."),
    "regex-tester": ("Regex Tester Online", "Test JavaScript regular expressions with live match highlighting. Test against sample text instantly, see all matches and groups."),
    "encrypt": ("Encrypt & Decrypt Text Online", "Encrypt text with AES-256-GCM in your browser. Paste text, set a password, copy encrypted result. Offline, reversible."),
    "base64": ("Base64 Encoder Online", "Encode or decode Base64 strings instantly. Paste or type, no upload, no server involved."),
    "hash-generator": ("Hash Generator Online", "Compute SHA-256, MD5 and other hashes. Paste text or upload a file — everything stays in your browser."),
    "password-generator": ("Password Generator Online", "Generate strong random passwords. Choose length and character sets instantly. Copy with one click."),
    "unit-converter": ("Unit Converter Online", "Convert length, weight, temperature, volume and more instantly. Switch between metric and imperial, no refresh needed."),
    "color-converter": ("Color Converter Online", "Convert colors between HEX, RGB, HSL and more. Pick a color or paste any format — instant conversion."),
    "timezone": ("Timezone Converter Online", "Convert meeting times, flight times and deadlines between timezones instantly. See time in both zones side-by-side."),
    "qr-code": ("QR Code Generator Online", "Create QR codes for text, URLs, Wi-Fi and more. No signup, no tracking — download instantly."),
    "shopping-list": ("Shopping List Online", "Add items, check them off as you shop. Saves automatically to your device. Works offline."),
    "bill-splitter": ("Bill Splitter Online", "Add expenses and people, then see who owes whom. Settle up fairly in seconds."),
    "countdown": ("Countdown Online", "Set a date and time, watch the countdown to your event. Adjustable colors and fonts."),
    "pomodoro": ("Pomodoro Online", "25 minutes of focus, then 5 minutes rest. Build sessions to keep going longer."),
    "note-taker": ("Note Taker Online", "Write Markdown notes with live preview. Your notes stay on your device, no server, no signup."),
    "meditation-timer": ("Meditation Timer Online", "Set a meditation duration with optional breathing cues. Timer rings softly at the end."),
    "stopwatch": ("Stopwatch Online", "Start, pause and reset. Track and review laps. Perfect for workouts or timing."),
    "p2p-chat": ("P2P Chat Online", "Chat privately peer-to-peer with files. No server, no account — everything stays between you and them."),
    "world-clock": ("World Clock Online", "Save timezones and see current time everywhere at once. Stays synced to now."),
    "speech-to-text": ("Speech to Text Online", "Speak and let your browser transcribe it to text. Works in most browsers on most devices."),
    "text-to-speech": ("Text to Speech Online", "Paste text and hear it read aloud. Adjust speed and voice. Useful for proofreading or accessibility."),
    "base-converter": ("Base Converter Online", "Convert between binary, hex, octal, decimal instantly. Works offline."),
    "ascii-table": ("ASCII Table Online", "Full ASCII table with decimal, hex, octal, binary and character codes. Search and copy instantly."),
    "unix-timestamp": ("Unix Timestamp Converter Online", "Convert Unix timestamps to human dates and back instantly and offline."),
    "jwt-decoder": ("JWT Decoder Online", "Decode JWT tokens locally. The token never leaves your browser — inspect headers and payloads safely."),
    "cron-explainer": ("Cron Explainer Online", "Paste a cron expression and see it decoded into plain English. Perfect for debugging schedules."),
    "barcode-generator": ("Barcode Generator Online", "Generate EAN, UPC, Code 128, Code 39 and IMEI barcodes instantly. Download as image or print."),
    "barcode-scanner": ("Barcode Scanner Online", "Scan EAN, UPC, Code 128 and more with your camera. Works in your browser, no app needed."),
    "image-resizer": ("Image Resizer Online", "Resize images instantly in your browser. Download as JPEG, PNG or WebP, nothing uploaded to any server."),
    "exif-stripper": ("EXIF Remover Online", "Remove EXIF metadata and GPS location from photos. Files stay on your device, no upload, no tracking."),
    "sketch-pad": ("Sketch Pad Online", "Draw sketches and signatures with mouse, finger or stylus. Download as PNG, no signup, no ads."),
    "word-counter": ("Word Counter Online", "Count words, characters and reading time in real-time. Results update as you type. Fully private."),
    "chord-transposer": ("Chord Transposer Online", "Transpose chords up or down. Perfect for adapting songs to your vocal range or instrument key."),
    "teleprompter": ("Teleprompter Online", "Paste a script and read along as it scrolls. Adjust speed and text size for your pace."),
    "speed-reader": ("Speed Reader Online", "Paste text, set reading speed (WPM) and watch one word at a time. Practice speed reading offline."),
    "day-counter": ("Day Counter Online", "Count days between dates or count down to a future date. See total and remaining days instantly."),
    "font-viewer": ("Font Viewer Online", "Upload a font and preview it in different sizes, weights and styles before using it."),
    "network-tools": ("Network Tools Online", "Calculate subnets, CIDR notation and IPv4 ranges. Perfect for network engineers and system admins."),
    "password-strength": ("Password Strength Checker Online", "Check password strength and get suggestions for improvement. Your password never leaves your browser."),
    "resistor-decoder": ("Resistor Decoder Online", "Identify resistor values from color bands. Supports 4-band, 5-band and 6-band resistors."),
    "capacitor-decoder": ("Capacitor Decoder Online", "Decode capacitor markings to find their value. Supports ceramic, film and other types."),
    "led-resistor": ("LED Resistor Calculator Online", "Calculate the resistor for your LED circuit. Enter supply voltage, LED voltage and current to get the exact resistor value."),
    "voltage-divider": ("Voltage Divider Calculator Online", "Calculate voltage divider ratios and output voltage. Enter R1, R2 and Vin to get exact output."),
    "entropy-calculator": ("Entropy Calculator Online", "Calculate Shannon entropy of text or files. See how random or compressible your data is."),
    "chmod-calculator": ("Chmod Calculator Online", "Convert between chmod notation and rwxrwxrwx permissions. Understand Unix file permission bits instantly."),
    "subnet-calculator": ("Subnet Calculator Online", "Calculate subnet masks, CIDR notation and IP ranges. Essential for network design and configuration."),
    "color-palette": ("Color Palette Generator Online", "Generate color palettes instantly. Export as hex, RGB or CSS code for your projects."),
    "colorblind-simulator": ("Colorblind Simulator Online", "Simulate how your design looks to people with color blindness. Test protanopia, deuteranopia and tritanopia."),
    "contrast-checker": ("Contrast Checker Online", "Check color contrast and WCAG AA, AAA compliance. Enter two colors and see if they pass accessibility standards."),
    "eyedropper": ("Color Picker Online", "Pick colors from your screen or images. Get hex, RGB, HSL values instantly, copy with one click."),
    "signal-mirror": ("Signal Mirror Calculator Online", "Calculate signal mirror angles and performance. Useful for outdoor communication and navigation."),
    "compass": ("Compass Online", "Use your device compass to navigate. Get bearing and direction in real-time."),
    "gps-speedometer": ("GPS Speedometer Online", "Track speed using GPS. See current, average and top speed. Perfect for athletics, driving or testing."),
    "where-am-i": ("Location Finder Online", "Show your GPS coordinates and location. Get latitude and longitude instantly on any device."),
    "seismometer": ("Seismometer Online", "Use your device as a vibration detector. Measure tremors and movement in real-time."),
    "light-detector": ("Light Meter Online", "Measure ambient light level in lux. Useful for photography, lighting design or accessibility testing."),
    "sound-meter": ("Sound Meter Online", "Measure sound level in decibels using your microphone. See peak and average dB in real-time."),
    "touch-tester": ("Touch Tester Online", "Test touch sensitivity and multi-touch on your device. See touch points and latency in real-time."),
    "gamepad-tester": ("Gamepad Tester Online", "Connect a gamepad and test all buttons, sticks and triggers. See input readings and calibration instantly."),
    "reaction-time": ("Reaction Time Tester Online", "Test reaction time with visual or audio cues. See your best, average and millisecond timing."),
    "mirror": ("Mirror Online", "Use your device as a mirror via camera. Adjust brightness and zoom for your needs."),
    "flashlight": ("Flashlight Online", "Turn your screen into a flashlight. Adjust brightness and choose white or color modes."),
    "screen-recorder": ("Screen Recorder Online", "Record your screen with audio. Perfect for tutorials, screencasts or documentation. Download as video."),
    "voice-recorder": ("Voice Recorder Online", "Record audio with your microphone. Trim clips and download. No limits, no file size caps."),
    "speaker-test": ("Speaker Test Online", "Test device speakers with tones in each channel. Detect dead speakers or channel issues instantly."),
    "flashcards": ("Flashcard Online", "Create flashcards on your device. Flip card, choose know or study again. Stays local on your device."),
    "pet-care": ("Pet Care Log Online", "Log pet care: vaccines, flea treatment, deworming, weight. See what's due and overdue at a glance."),
    "kitchen-timer": ("Kitchen Timer Online", "Set up to four named timers at once. Perfect for cooking multiple dishes. Works offline."),
    "fridge-expiry": ("Fridge Expiry Checker Online", "Log fridge and pantry items with expiry dates. See what's expiring soon at a glance."),
    "work-hours": ("Work Hours Logger Online", "Clock in and out with one tap. See this week's hours at a glance. No account needed."),
    "plant-watering": ("Plant Watering Reminder Online", "Log watering and care for each plant. Get reminders so nothing dies. See full care history."),
    "imei-barcode": ("IMEI Barcode Generator Online", "Generate Code 128 barcodes from IMEI numbers. Validate and encode instantly, offline."),
    "live-pad": ("Live Pad Online", "Share a live scratchpad in real-time with others. Peer-to-peer, no server, no signup. Vanishes when you close the tab."),
    "shared-timer": ("Shared Timer Online", "Start a countdown and share it with others. Everyone sees the same timer in real-time, peer-to-peer."),
    "shared-sketchpad": ("Shared Sketchpad Online", "Draw together in real-time with others. No server, no signup. Room lasts as long as the host tab."),
    "p2p-file-transfer": ("P2P File Transfer Online", "Send files directly between devices peer-to-peer. No server, no signup, no size limits. Works in your browser."),
    "pdf-merger": ("PDF Merger Online", "Merge multiple PDFs into one. Your files stay on your device, no upload, no size limits."),
    "pdf-tiler": ("PDF Tiler Online", "Tile multiple PDF copies on one sheet, auto-crop whitespace. Perfect for business cards, labels, vouchers. No upload."),
    "data-sync": ("Data Sync Online", "Sync all your app data between phone and PC. Peer-to-peer, no server. Both devices must be online at once."),
    "vcard-qr": ("Contact QR Code Online", "Generate QR codes from contact info. People scan to add you to their phone instantly."),
    "event-qr": ("Event QR Online", "Convert an event to a QR code or calendar file (.ics). Create locally on your device, nothing uploaded."),
    "image-to-base64": ("Image to Base64 Online", "Convert images to Base64 data URIs locally. Nothing uploaded to any server. Copy instantly."),
    "favicon-generator": ("Favicon Generator Online", "Upload one image, download all favicon sizes needed. Generated locally on your device, no upload."),
    "slug-cleaner": ("URL Slug Generator Online", "Convert titles to clean URL slugs: lowercase, dashes, ASCII. Works offline."),
    "sql-formatter": ("SQL Formatter Online", "Paste SQL and get it formatted and indented. Readable code instantly, offline."),
    "user-agent-parser": ("User-Agent Parser Online", "Paste a User-Agent string to see browser, OS and device. Defaults to your current browser."),
    "dpi-print": ("Image DPI & Print Size Online", "Convert pixels and DPI to print size. See dimensions in inches and centimeters. Essential for photographers."),
    "maidenhead": ("Maidenhead Locator Online", "Convert between coordinates and Maidenhead locator (QTH grid). Free ham radio tool for operators."),
    "aspect-ratio": ("Aspect Ratio Calculator Online", "Scale dimensions while keeping aspect ratio. Works offline. Perfect for video or image work."),
    "size-converter": ("Size Converter Online", "Convert clothing, shoe and other sizes across brands and countries. Find your size instantly."),
    "unit-price": ("Unit Price Calculator Online", "Calculate price per unit to find the best value. Compare products and see real cost per unit."),
    "electricity-cost": ("Electricity Cost Calculator Online", "Calculate how much your appliances cost to run. Enter wattage, hours and electricity rate."),
    "pace-calculator": ("Pace Calculator Online", "Calculate pace from distance and time. Convert between min/km, min/mile and other formats."),
    "tip-tax": ("Tip & Tax Calculator Online", "Add tip and tax to a bill. Split per person instantly. Works offline."),
    "paint-estimator": ("Paint & Flooring Estimator Online", "Enter room dimensions, get paint or flooring quantities with waste included. Quick estimates offline."),
    "business-days": ("Business Days Calculator Online", "Count or add business days between dates. Weekends skipped automatically. Free, offline."),
    "meeting-overlap": ("Meeting Overlap Finder Online", "Select timezones and awake hours. See when everyone can meet instantly. Works offline."),
    "swim-bike-pace": ("Swim & Bike Pace Calculator Online", "Calculate swim pace (per 100m) or cycling speed from distance and time. Free, offline."),
    "readability": ("Readability Analyzer Online", "Paste text and get readability scores and grade level. See complexity and comprehension level instantly."),
    "transfer-time": ("File Transfer Time Calculator Online", "Calculate file transfer time from size and speed. See download or upload ETA instantly, offline."),
    "id-expiry": ("ID Expiry Tracker Online", "Track when your ID, passport or license expires. See days remaining at a glance. Fully private."),
    "rent-vs-buy": ("Rent vs Buy Calculator Online", "Compare renting vs buying over time. See rough break-even point for your situation, offline."),
    "crop-factor": ("Crop Factor Calculator Online", "Convert focal length to full-frame equivalent. Enter lens and sensor crop factor, get equivalent length."),
    "dof-calculator": ("Depth of Field Calculator Online", "Calculate near and far focus distances. Enter focal length, aperture, distance and sensor crop factor."),
    "schengen": ("Schengen Visa Calculator Online", "Log your Schengen area trips. See days used in the current 180-day rolling window and remaining time."),
    "debt-payoff": ("Debt Payoff Calculator Online", "See payoff date, total interest and impact of extra payments. Enter balance, APR and payment instantly."),
    "meeting-cost": ("Meeting Cost Calculator Online", "See the live ticking cost of your meeting. Enter attendees, hourly rate and duration. Uncomfortable on purpose."),
    "invoice-generator": ("Invoice Generator Online", "Create invoices with line items and tax. Print or save as PDF instantly. Data stays on your device."),
    "chess-clock": ("Chess Clock Online", "Time chess games with two-player timer. Tap to move and switch players. Works offline."),
    "scoreboard": ("Scoreboard Online", "Keep score for any game or match. Large, easy-to-read display works for any sport."),
    "dinner-picker": ("Dinner Picker Online", "Add meals and spin to pick what's for dinner tonight. Ends the \"what should we eat?\" debate."),
    "contact-notes": ("Contact Notes Online", "Store notes for each contact: birthday, anniversary, details or anything you want to remember."),
    "recipe-box": ("Recipe Box Online", "Save recipes with ingredients, instructions and notes. Search and access them offline anytime."),
    "medicine-tracker": ("Medicine Tracker Online", "Log medications and doses. See when you took each and get gentle reminders. Stays private on your device."),
    "packing-list": ("Packing List Online", "Create a packing list, check off items as you pack. Reuse lists for similar trips."),
    "doctor-visits": ("Doctor Visit Log Online", "Log doctor visits with notes. Track medication changes and what was recommended."),
    "fuel-log": ("Fuel Log Online", "Log fuel purchases and calculate fuel economy. See trends and efficiency over time."),
    "moon-phase": ("Moon Phase Online", "See the current moon phase and moon position. Useful for photography, gardening or astronomy."),
    "water-reminder": ("Water Reminder Online", "Set reminders to drink water. Track daily intake and hydration goal progress."),
    "parking-spot": ("Parking Location Saver Online", "Mark where you parked. View location on a map to find your car later."),
    "line-tools": ("Line Tools Online", "Draw lines and measure angles on screen. Useful for design, layout and graphics work."),
    "breathing-pacer": ("Breathing Pacer Online", "Follow animated box breathing guide. Calm your stress instantly with guided breathing cues."),
    "tally-counter": ("Tally Counter Online", "Count anything with one-tap increments. Perfect for inventory, crowds or scoring."),
    "timer": ("Timer Online", "Set a countdown timer with alarms. Adjustable duration and repeat options."),
    "interval-timer": ("Interval Timer Online", "Create interval workouts: work and rest periods customizable. Track sets and reps."),
    "big-text": ("Big Text Online", "Display text huge across the room. Ideal for presentations or announcements. Adjust size and colors."),
    "dice-roller": ("Dice Roller Online", "Roll any dice combination. See total and individual results. Perfect for tabletop games."),
    "backup": ("Backup & Restore Online", "Export all your app data to a JSON file or restore it later. You own the file, not a cloud company."),
    "morse-code": ("Morse Code Translator Online", "Convert text to Morse code or decode Morse back to text. See dots and dashes as you type."),
    "url-parser": ("URL Parser Online", "Paste any URL and see all parts: protocol, domain, path, query params, fragments. Instant breakdown."),
    "case-converter": ("Case Converter Online", "Convert text between UPPER, lower, camelCase, snake_case, kebab-case, Title Case and more instantly."),
    "html-entities": ("HTML Entities Encoder Online", "Encode or decode HTML entities. See &amp; codes for special characters like &, ©, etc instantly."),
    "char-picker": ("Character Picker Online", "Browse special characters, emojis and symbols. Search by name or draw to find what you need."),
    "number-to-words": ("Number to Words Online", "Convert any number to words instantly: type 1234 to see one thousand two hundred thirty-four."),
    "roman-numerals": ("Roman Numerals Converter Online", "Convert between decimal numbers and Roman numerals instantly. Works both directions."),
    "yaml-json": ("YAML to JSON Converter Online", "Convert YAML to JSON or back to YAML. Validate syntax and see formatted output instantly."),
    "csv-json": ("CSV to JSON Converter Online", "Convert CSV to JSON or back. No upload, no size limits, no signup."),
    "lorem-ipsum": ("Lorem Ipsum Generator Online", "Generate Lorem Ipsum text instantly. Adjust paragraphs, words and sentences to your needs."),
    "nfc-tags": ("NFC Reader & Writer Online", "Read and write NFC tags from your browser. Your tag data never leaves your device — no server, no signup."),
    "dead-pixel": ("Dead Pixel Checker Online", "Fill your screen with solid colors to find dead pixels. Test all colors instantly."),
    "totp": ("TOTP Codes Online", "Generate TOTP 2FA codes from a secret key, entirely in your browser. Nothing is sent anywhere."),
    "mood-tracker": ("Mood Tracker Online", "Log your mood daily. See patterns over time and what might be affecting it."),
    "sleep-log": ("Sleep Log Online", "Log sleep duration and quality. See patterns and average hours per night over time."),
    "habit-tracker": ("Habit Tracker Online", "Track daily habits and see your streak. Mark done each day and watch your consistency build."),
    "workout-log": ("Workout Log Online", "Log exercises, weight and reps. Track your progress over time and see strength gains."),
    "expense-log": ("Expense Log Online", "Log expenses with category and date. See monthly spending by category. Analyze your habits."),
    "mileage-log": ("Mileage Log Online", "Log trips with from, to and distance. See monthly mileage for taxes or expense reports."),
    "reading-log": ("Reading Log Online", "Log books you're reading or have read. Add ratings and notes. See your reading history."),
    "gratitude-journal": ("Gratitude Journal Online", "Log three things you're grateful for each day. Simple and private. Runs locally on your device."),
    "headache-log": ("Headache Log Online", "Log headaches with severity, duration and triggers. See frequency and patterns. Useful for doctor visits."),
    "subscription-tracker": ("Subscription Tracker Online", "Track subscriptions and recurring bills. See monthly total and what renews soon. Stay on budget."),
    "wishlist": ("Wishlist Online", "Add items you want with optional prices. Check them off when you get them. Stays on your device."),
    "body-weight": ("Body Weight Log Online", "Log your weight and track trends. See data over time and progress toward your goals."),
    "blood-pressure": ("Blood Pressure Log Online", "Log and review with this free blood pressure log. No signup, no ads, no tracking — works offline."),
    "period-tracker": ("Period Tracker Online", "Log your period and get predictions. Track cycle length and patterns. Completely private on your device."),
    "home-maintenance": ("Home Maintenance Log Online", "Track home maintenance: HVAC filter, smoke alarm battery, boiler service and more. See what's overdue at a glance."),
    "car-maintenance": ("Car Maintenance Log Online", "Track car maintenance: oil changes, tyre rotation, tire pressure and more. See what's overdue at a glance."),
}

def update_page(app_id, new_title, new_description):
    """Update title and descriptions in app's index.html"""
    path = ROOT / app_id / "index.html"

    if not path.exists():
        print(f"SKIP {app_id} (file not found)")
        return False

    html = path.read_text(encoding="utf-8")

    # Update <title> tag
    html = re.sub(
        r'<title>[^<]*</title>',
        f'<title>{new_title} | nostrings.tools</title>',
        html,
        count=1,
    )

    # Update meta description
    html = re.sub(
        r'<meta name="description" content="[^"]*" />',
        f'<meta name="description" content="{new_description}" />',
        html,
        count=1,
    )

    # Update og:description
    html = re.sub(
        r'<meta property="og:description" content="[^"]*" />',
        f'<meta property="og:description" content="{new_description}" />',
        html,
        count=1,
    )

    # Update JSON-LD description field
    html = re.sub(
        r'"description": "[^"]*?"(?=, "applicationCategory"|, "url"|, "offers")',
        f'"description": "{new_description}"',
        html,
        count=1,
    )

    path.write_text(html, encoding="utf-8")
    print(f"OK  {app_id}")
    return True

def main():
    total = len(UPDATES)
    updated = 0

    for app_id, (title, description) in sorted(UPDATES.items()):
        if update_page(app_id, title, description):
            updated += 1

    print(f"\n✓ Updated {updated}/{total} apps")

if __name__ == "__main__":
    main()
