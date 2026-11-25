# FAQ drafts — nostrings.tools

Three Q&As per app, phrased around how people actually search. Answers only claim what the UI shows; anything marked **[verify]** depends on implementation details I didn't confirm in code.
Pages that already have FAQs (14) are skipped, as is `about`.

---

### ascii-table
**What is ASCII?** — ASCII is a 7-bit character encoding with 128 codes (0–127): control characters, digits, punctuation and the English alphabet. Most modern encodings, including UTF-8, start with the same 128 codes.
**How do I find the ASCII code of a character?** — Type the character or its name in the search box. The table shows its decimal, hex, octal and binary code.
**What's the difference between ASCII and Unicode?** — ASCII covers only 128 characters. Unicode covers over 150,000 characters from every script and includes ASCII as its first 128 code points.

### aspect-ratio
**How do I resize an image without changing its aspect ratio?** — Enter the original width and height, then fill in either the new width or the new height. The other side is calculated so the proportions stay the same.
**What is a 16:9 resolution?** — 16:9 is the standard widescreen ratio, used by 1920×1080 (Full HD), 2560×1440 and 3840×2160 (4K).
**What does the decimal number next to the ratio mean?** — It's width divided by height, e.g. 1.778 for 16:9. Two sizes with the same decimal have the same aspect ratio.

### backup
**Where do these tools store my data?** — In your browser's localStorage, on this device only. Nothing is sent to a server.
**How do I move my data to a new computer or browser?** — Download a backup here, copy the JSON file to the other device, and use "Restore from backup". For a live transfer, use Data Sync.
**Will clearing my browser data delete my lists and logs?** — Yes. Clearing site data removes localStorage, so download a backup first.

### barcode-generator
**Which barcode type should I use?** — Use EAN-13 or UPC-A for retail products, Code 128 for any text or internal labels, and ITF for shipping cartons.
**Do I need to enter the check digit?** — No. For EAN-13 you can enter 12 digits and for UPC-A 11, and the check digit is calculated for you. **[verify]**
**Can I print the barcode?** — Yes. Download it as a PNG and print it at full size. Shrinking a barcode too much can make it unscannable.

### barcode-scanner
**Can I scan a barcode without installing an app?** — Yes. Click "Start scanning", allow camera access, and point the camera at the barcode.
**Which barcode formats are supported?** — EAN, UPC, Code 128 and other common 1D formats. **[verify full list]**
**Are the camera images uploaded?** — No. Decoding happens in your browser and no image leaves your device.

### base64
**What is Base64 encoding used for?** — It turns binary data or text into plain ASCII characters so it can travel safely in emails, URLs, JSON or data URIs.
**Is Base64 encryption?** — No. Anyone can decode Base64 instantly, so never use it to hide passwords or secrets.
**Does it handle accents and emoji?** — Yes, text is encoded as UTF-8 first. **[verify]**

### base-converter
**How do I convert decimal to binary?** — Type the number in the Decimal field. Binary, octal and hex update as you type.
**How do I convert hex to decimal?** — Type the hex value (e.g. FF) in the Hex field to see 255 in decimal.
**Why is hex used in programming?** — Each hex digit represents exactly 4 bits, so a byte is always two hex digits, which is much shorter than binary.

### bet-tracker
**What is this for?** — Tracking friendly bets among a group, e.g. on a match or race. It works out each person's payout and net win or loss.
**How are payouts calculated?** — Payouts follow the pool or odds you set for each outcome. **[verify: pari-mutuel?]**
**Is any money handled here?** — No. It's a scorekeeper only; settle up between yourselves.

### big-text
**How do I show a message in big letters on my screen?** — Type your message and tap "Show it big". The text fills the whole screen.
**What can I use it for?** — Airport pickup signs, messages across a room or a stage, reading from a distance, or a quick sign at a concert.
**Does it work on a phone?** — Yes. Turn your phone sideways for the biggest letters.

### bill-splitter
**How do I split a bill with friends?** — Add each bill with who paid and who shared it. The settlement shows the fewest payments needed to even up.
**Can people pay different amounts?** — Yes. Each bill can be paid by a different person, and the totals balance everything out.
**Is my data saved?** — Yes, on this device only, until you clear it.

### birthday-tracker
**How do I keep track of birthdays without social media?** — Add names and birth dates here. The list shows whose birthday is coming up next.
**Does it show how old someone turns?** — **[verify]**
**Where are birthdays stored?** — Only in your browser on this device. Use Backup to keep a copy.

### blood-pressure
**What is a normal blood pressure reading?** — Under 120/80 mmHg is considered normal for adults. 130/80 or above is generally classed as high. Ask your doctor what's right for you.
**What do systolic and diastolic mean?** — Systolic (top number) is the pressure when your heart beats. Diastolic (bottom number) is the pressure between beats.
**Can I show my log to my doctor?** — Yes. Keep logging readings and bring the history to your appointment. **[verify export]**

### bmr-tdee
**What is the difference between BMR and TDEE?** — BMR is the calories your body burns at complete rest. TDEE adds your daily activity, so it's what you burn on a normal day.
**Which formula does this use?** — The Mifflin–St Jeor equation, considered the most accurate common formula for most adults.
**How many calories should I eat to lose weight?** — A common starting point is about 500 kcal below your TDEE per day. Treat it as an estimate and adjust based on results.

### body-weight
**How often should I weigh myself?** — Daily or a few times a week, at the same time of day. Look at the trend rather than single readings.
**Why does my weight change from day to day?** — Water, salt, food in the gut and hormones can move the scale 1–2 kg in a day. That's why the trend matters.
**Is my weight data private?** — Yes. It's stored only on your device.

### breathing-pacer
**What is box breathing?** — Breathing in, holding, breathing out and holding again, each for the same count (often 4 seconds). It's used to calm stress quickly.
**How long should I do it?** — Even 1–2 minutes can help. Many people do 5 minutes.
**Can I use it to fall asleep?** — Yes. A slow, steady breathing rhythm helps many people relax before sleep.

### business-days
**How do I count working days between two dates?** — Enter the From and To dates under "Count between two dates". Weekends are excluded.
**Are public holidays excluded?** — No. Only Saturdays and Sundays are skipped. Subtract holidays in your country yourself.
**How do I add 10 business days to a date?** — Enter the start date and 10 under "Add N working days" to get the resulting date.

### capacitor-decoder
**How do I read a capacitor code like 104?** — The first two digits are the value and the third is the number of zeros, in picofarads: 104 = 10 × 10⁴ pF = 100 nF = 0.1 µF.
**What does the letter after the code mean?** — It's the tolerance, e.g. J = ±5%, K = ±10%, M = ±20%.
**How do I convert pF to nF and µF?** — 1000 pF = 1 nF and 1000 nF = 1 µF.

### car-maintenance
**How often should I change my oil?** — Typically every 10,000–15,000 km or once a year for modern cars. Check your owner's manual.
**How does the overdue list work?** — Enter when each task was last done and how often it repeats. Overdue and upcoming items are highlighted.
**Can I track multiple cars?** — **[verify]**

### case-converter
**How do I convert text to camelCase or snake_case?** — Paste the text and every case variant appears at once: UPPER, lower, Title, camelCase, snake_case, kebab-case and more.
**How do I change uppercase to lowercase?** — Paste the text and copy the lowercase version.
**What's the difference between camelCase and PascalCase?** — camelCase starts lowercase (myVariable). PascalCase capitalizes the first letter too (MyVariable).

### char-picker
**How do I type special characters like ©, → or ✓?** — Search for the character by name, click it to copy, and paste it anywhere.
**Can I find a symbol by drawing it?** — Yes. Sketch the shape and the picker suggests matching characters. **[verify]**
**Does it include emoji?** — Yes. Emoji are searchable alongside symbols.

### chess-clock
**How do I use an online chess clock?** — Pick a time control (1, 3, 5 or 10 minutes), then tap your side after each move to stop your clock and start your opponent's.
**Can I use my phone as a chess clock?** — Yes. Put the phone between the players; each half of the screen is one player's button.
**Does it support increment (Fischer) time?** — **[verify]**

### chmod-calculator
**What does chmod 755 mean?** — Owner can read, write and execute (7). Group and others can read and execute (5). It's the usual setting for scripts and directories.
**What does chmod 644 mean?** — Owner can read and write. Everyone else can only read. It's the usual setting for regular files.
**How are the numbers calculated?** — Read = 4, write = 2, execute = 1. Add them for each of owner, group and others.

### chord-transposer
**How do I transpose chords to a different key?** — Paste the chords or the song with chords, then press +1 or −1 to shift every chord by a semitone.
**How many semitones do I need to move?** — Count the steps between keys: e.g. from G to A is +2, and from E to C is −4.
**Can I transpose for a capo?** — Yes. Transpose down one semitone per capo fret to get the shapes to play.

### colorblind-simulator
**How do I check if my design is colorblind-friendly?** — Drop in a screenshot or image to see it as people with protanopia, deuteranopia and tritanopia would.
**What is the most common type of color blindness?** — Red-green deficiency (deuteranomaly), which affects about 5% of men.
**Is my image uploaded?** — No. It's processed entirely in your browser.

### color-converter
**How do I convert HEX to RGB?** — Type or paste the HEX value (e.g. #3366ff) and the RGB and HSL values appear instantly.
**What is HSL?** — Hue, saturation and lightness. It makes it easy to create lighter, darker or less saturated versions of a color.
**Can I pick a color visually?** — Yes. Use the color picker, then copy any format.

### color-palette
**How do I generate a color palette?** — Click "Generate Palette" for a new harmonious set, then copy the HEX or RGB values.
**Can I use the colors in CSS?** — Yes. Copy the values straight into your stylesheet.
**Are the palettes random?** — **[verify method]**

### compass
**Does the online compass work on my phone?** — Yes, on phones and tablets with a magnetometer. Tap "Enable compass" and allow motion access.
**Why doesn't the compass work on my laptop?** — Most laptops have no compass sensor, so there is nothing for the browser to read.
**How do I make the compass more accurate?** — Move away from metal and electronics, and calibrate by moving the phone in a figure-8.

### compass-logger
**How do I log compass bearings on my phone?** — Enable the compass, add an optional note, and tap "Log bearing", or use Record to save your heading every second.
**How do I export the readings?** — Tap "Export CSV" to download all logged bearings with timestamps.
**Is it true north or magnetic north?** — **[verify]**

### contact-notes
**What is this for?** — Remembering things about people: kids' names, birthdays, preferences, or what you last talked about.
**Does it access my phone contacts?** — No. You add only the notes you want.
**Where are the notes stored?** — Only on this device.

### contrast-checker
**What contrast ratio does WCAG require?** — AA needs 4.5:1 for normal text and 3:1 for large text. AAA needs 7:1 and 4.5:1.
**What counts as large text?** — 18pt (24px) regular, or 14pt (about 18.7px) bold and above.
**How is the contrast ratio calculated?** — From the relative luminance of the two colors: (L1 + 0.05) / (L2 + 0.05), ranging from 1:1 to 21:1.

### cost-per-minute
**How much do I earn per minute?** — Enter your salary or hourly rate and see it per minute, hour, day, week, month and year.
**What working hours are assumed?** — 8-hour days, 5 days a week, 52 weeks a year (2,080 hours).
**How do I convert an annual salary to hourly?** — Divide by 2,080. For example, 52,000 a year is 25 an hour.

### countdown
**How do I set a countdown timer?** — Enter minutes and seconds, then press Start.
**Will it make a sound when time is up?** — **[verify]**
**Does it keep running in the background?** — Keep the tab open. Browsers may slow timers in background tabs, but the time is corrected when you return. **[verify]**

### cron-explainer
**What does `0 9 * * 1-5` mean?** — At 9:00 AM, Monday to Friday.
**What do the five cron fields mean?** — Minute, hour, day of month, month, day of week, in that order.
**What does `*/5` mean in cron?** — Every 5 units, e.g. `*/5` in the minute field runs every 5 minutes.

### crop-factor
**What is crop factor?** — How much smaller a sensor is than full frame (36×24 mm). Multiply focal length by it to get the full-frame equivalent field of view.
**What is 50mm on APS-C equivalent to?** — About 75 mm on Nikon, Sony or Fuji (1.5×) and 80 mm on Canon (1.6×).
**Does crop factor change the aperture?** — The f-number for exposure stays the same, but the depth of field looks like that of an aperture multiplied by the crop factor.

### csv-json
**How do I convert CSV to JSON?** — Paste CSV with a header row and click "CSV → JSON". Each row becomes an object keyed by the headers.
**How do I convert JSON to CSV?** — Paste a JSON array of objects and click "JSON → CSV".
**Is there a file size limit?** — No server is involved, so the only limit is your browser's memory.

### data-sync
**How do I sync data between my phone and computer?** — Open this page on both devices, click Start on one, and enter the code on the other.
**Does my data go through a server?** — No. It's sent directly between the devices (WebRTC). Internet is needed only to connect them.
**Does syncing overwrite data?** — **[verify merge behaviour]**

### date-difference
**How many days are there between two dates?** — Pick the From and To dates to see total days, weeks and a years/months/days breakdown.
**Is the end date included?** — **[verify]**
**How many weeks between two dates?** — The Weeks result shows it directly.

### day-counter
**How many days until a date?** — Add the date to see how many days are left, updated every day.
**Can I count days since something happened?** — Yes. Past dates show how many days have passed.
**Are my dates saved?** — Yes, on this device, so you can come back and check the count.

### dead-pixel
**How do I test my monitor for dead pixels?** — Click "Start fullscreen test" and cycle through solid colors, looking for dots that don't match.
**What's the difference between a dead and a stuck pixel?** — A dead pixel stays black on every color. A stuck pixel stays one color (red, green or blue) and can sometimes be fixed.
**Does it work on phones and TVs?** — Yes. Any screen with a browser works; tap to change color.

### debt-payoff
**How long will it take to pay off my debt?** — Enter the balance, interest rate (APR) and monthly payment to see the payoff date and total interest.
**How much do extra payments help?** — Raise the monthly payment and watch the payoff date and total interest drop.
**What if my payment is too low?** — If it doesn't cover the monthly interest, the debt never gets paid off, and the calculator tells you.

### device-status
**How do I check my battery and network from the browser?** — Open the page to see battery level, network type, screen size, CPU cores and memory.
**Why is some information missing?** — Some browsers (Safari and Firefox) hide battery or memory details for privacy.
**What is my user agent?** — It's shown on the page. Copy it when a support team asks for it.

### dice-roller
**How do I roll a d20 online?** — Tap d20. The result and a roll history appear immediately.
**Can I roll several dice at once?** — **[verify]**
**Are the rolls truly random?** — They use the browser's random number generator, which is fair for games.

### dinner-picker
**How do I decide what to eat for dinner?** — Add the meals you like, then tap "Pick for me!" to get a random choice.
**Is my list saved?** — Yes, on this device, so you build it once and reuse it.
**Can I use it for restaurants too?** — Yes. Add anything you want to choose between.

### doc-scanner
**How do I scan a document to PDF without an app?** — Capture pages with your camera (or upload photos), drag the corners onto the page edges, and download one PDF.
**Are my documents uploaded?** — No. Everything is processed in your browser.
**Can I reorder pages?** — Yes. Drag the thumbnails, or focus one and use the arrow keys.

### doctor-visits
**How often should I see the dentist or do a check-up?** — Common intervals are 6 months for the dentist and 1–2 years for a general check-up. Follow your doctor's advice.
**How does the reminder list work?** — Enter the last visit and the check-up interval to see when each doctor is due.
**Is my health data shared?** — No. It's stored only on your device.

### dof-calculator
**What is depth of field?** — The range of distance in front of and behind your subject that looks acceptably sharp.
**How do I get a shallow depth of field?** — Use a wider aperture (smaller f-number), a longer focal length, or get closer to the subject.
**What is circle of confusion (CoC)?** — The largest blur spot still perceived as sharp. It depends on sensor size, which is why you choose the sensor.

### dpi-print
**How big can I print a photo?** — Divide the pixels by the DPI. For example, 3000 px at 300 DPI is 10 inches (25.4 cm).
**What DPI do I need for printing?** — 300 DPI for close-up prints and photos, 150 for posters seen from a distance.
**Is DPI the same as PPI?** — For this purpose, yes: both mean pixels per inch of the printed image.

### duration-adder
**How do I add up hours and minutes?** — Enter durations like 7:45, one per line, to get the total.
**Can I add up timesheet hours?** — Yes. Paste each day's hours to get the weekly total.
**What formats are accepted?** — h:mm, e.g. 7:45. **[verify other formats]**

### electricity-cost
**How much does it cost to run an appliance?** — Enter the power in watts, hours per day and your price per kWh to see the cost per day, month and year.
**How do I calculate kWh?** — Watts × hours ÷ 1000. A 2000 W heater running for 3 hours uses 6 kWh.
**Where do I find the wattage?** — On the label or power supply of the device, or in its manual.

### encrypt
**How do I encrypt text with a password?** — Enter a password and your text, then click Encrypt. Share the result; the recipient decrypts it here with the same password.
**How secure is it?** — It uses AES-256-GCM, a modern standard cipher. Security depends on a strong password.
**Is my text sent anywhere?** — No. Encryption and decryption run in your browser.

### entropy-calculator
**What is Shannon entropy?** — A measure of how unpredictable text is, in bits per character.
**How strong is my password?** — Type it in to see its entropy and estimated crack time. Your password never leaves your browser.
**How many bits of entropy is a strong password?** — 60+ bits is solid for most accounts. 80+ is very strong.

### event-qr
**How do I make a QR code for an event?** — Enter the title, start and end time, then download the QR code. Scanning it adds the event to a calendar.
**What is an .ics file?** — A standard calendar file that Google Calendar, Outlook and Apple Calendar can import.
**Does it work on iPhone and Android?** — Yes. Both camera apps can recognize calendar QR codes. **[verify]**

### exif-stripper
**How do I remove location data from a photo?** — Drop the photo in and download the clean copy, which has the GPS and camera metadata stripped.
**What is EXIF data?** — Hidden information saved in photos: GPS location, camera model, date and settings.
**Does it reduce image quality?** — **[verify re-encode]**

### expense-log
**How do I track my spending?** — Log each expense with an amount, category and date to see monthly totals by category.
**Is this connected to my bank?** — No. Entries are manual and stay on your device.
**Can I export my expenses?** — **[verify]**

### eyedropper
**How do I pick a color from my screen?** — Click "Pick a color" and click anywhere on your screen to get its HEX and RGB values.
**Which browsers support it?** — Chrome, Edge and Opera on desktop (EyeDropper API). Firefox and Safari don't support it yet.
**Can I pick colors from other apps?** — Yes. The picker works across your whole screen, not just the browser.

### fasting-timer
**How does intermittent fasting 16:8 work?** — You fast for 16 hours and eat within an 8-hour window. Start the timer when you finish eating.
**Can I change the fasting goal?** — Yes. Set any number of hours, e.g. 18 or 20.
**Does the timer keep running if I close the tab?** — Yes. The start time is saved, so it shows the correct elapsed time when you return.

### favicon-generator
**What sizes does a favicon need?** — Typically 16×16, 32×32, 180×180 (Apple touch icon) and 192/512 for Android. This tool makes all of them.
**How do I add the favicon to my site?** — Copy the HTML snippet into your page's `<head>` and upload the files.
**What image should I start from?** — A square image of at least 512×512 px, ideally simple and recognizable at small sizes.

### flashlight
**How do I turn my phone screen into a flashlight?** — Tap "Turn on". The screen goes full white at full brightness and stays awake.
**Can it turn on my phone's camera LED?** — Yes, on phones whose browser allows torch control (mainly Chrome on Android). Otherwise the screen is used.
**Does it work on a laptop?** — Yes. Your screen becomes a soft light, which is good for video calls or finding things in the dark.

### fridge-expiry
**How do I keep track of food expiry dates?** — Add each item with its use-by date and location. The list is sorted by what expires first.
**What's the difference between use-by and best-before?** — Use-by is about safety, so don't eat food after it. Best-before is about quality, and food is usually fine after it.
**Can I track freezer items?** — Yes. Choose Fridge, Freezer or Pantry for each item.

### fuel-log
**How do I calculate fuel consumption?** — Log the odometer and litres at each fill-up to get L/100 km between fill-ups.
**Should I fill the tank completely?** — Yes. Full-to-full fill-ups give the most accurate consumption figures.
**Does it work in miles and gallons?** — **[verify]**

### gamepad-tester
**How do I test my controller in a browser?** — Plug it in or pair it via Bluetooth, then press any button. All buttons, sticks and triggers are shown live.
**How do I check for stick drift?** — Let the sticks rest. If the values don't stay near 0, the stick is drifting.
**Does it work with PS5 and Xbox controllers?** — Yes. Any controller the browser recognizes as a gamepad works.

### gps-speedometer
**How accurate is a GPS speedometer?** — Usually within 1–2 km/h when moving steadily with a clear view of the sky.
**Does it work without mobile data?** — Yes. GPS works without internet once the page is loaded.
**Why does it show 0 or jump around?** — GPS needs a few seconds to lock on, and it's less accurate indoors or among tall buildings.

### gratitude-journal
**What is a gratitude journal?** — A daily habit of writing down three things you're grateful for, linked to better mood and sleep.
**Can anyone read my entries?** — No. They're stored only on your device.
**How long does it take?** — About a minute a day.

### gzip
**How do I decompress a .gz file online?** — Drop the .gz file in to get the original file back.
**Can I gzip text?** — Yes. Paste or drop it in to compress it and download the .gz file.
**Is my file uploaded?** — No. It's compressed in your browser using the built-in CompressionStream API.

### habit-tracker
**How do I track a daily habit?** — Add a habit and mark it done each day to build a streak.
**What happens if I miss a day?** — Your streak resets, but your history stays.
**Is it private?** — Yes. Habits are stored only on your device.

### hash-generator
**How do I get the SHA-256 hash of a file?** — Drop the file on the page to see its SHA-256, MD5 and other hashes.
**How do I verify a download's checksum?** — Hash the downloaded file and compare it with the checksum published by the site.
**Is MD5 still safe?** — Not for security, because it can be forged. It's still fine for checking accidental corruption.

### headache-log
**Why keep a headache diary?** — It helps you and your doctor spot triggers, frequency and patterns such as sleep, food or stress.
**What should I record?** — Date, severity, duration, location and anything that might have triggered it.
**Is my health data private?** — Yes. It stays on your device.

### home-maintenance
**How often should I change my HVAC filter?** — Typically every 1–3 months, depending on the filter and whether you have pets.
**How often should I test my smoke alarms?** — Test them monthly and replace batteries yearly, unless they're sealed 10-year units.
**How does it know what's overdue?** — Enter when each task was last done and how often it repeats.

### html-entities
**What are HTML entities?** — Codes like `&amp;` or `&copy;` that show special characters safely in HTML.
**Which characters must be escaped in HTML?** — `<`, `>`, `&`, plus `"` and `'` inside attributes.
**How do I decode `&amp;` back to `&`?** — Paste the encoded text into the HTML-encoded box to get plain text.

### iban-validator
**How do I check if an IBAN is valid?** — Paste it to check the country length and the mod-97 checksum instantly.
**Does a valid IBAN mean the account exists?** — No. It only means the number is correctly formed. Only the bank can confirm the account.
**Is my IBAN sent anywhere?** — No. Validation runs entirely on your device.

### id-expiry
**When should I renew my passport?** — Many countries require 6 months of validity left, so renew about 9 months before expiry.
**What documents can I track?** — Passports, ID cards, driving licences, residence permits, insurance cards and more.
**Is it secure to store this?** — Only the document type and date are needed, and they're stored only on this device.

### image-resizer
**How do I resize a photo without uploading it?** — Drop the image to get resized versions to download. Everything happens in your browser.
**Does resizing reduce quality?** — Shrinking keeps it looking sharp. Enlarging beyond the original size can't add detail.
**How do I make an image smaller in file size?** — Resizing to fewer pixels is the most effective way to cut the file size.

### image-to-base64
**How do I convert an image to Base64?** — Drop the image in and copy the data URI.
**How do I use a Base64 image in HTML or CSS?** — Paste the data URI into `<img src="…">` or `url(…)`.
**When should I avoid Base64 images?** — For large images. Base64 is about 33% bigger than the file and can't be cached separately.

### instrument-tuner
**How do I tune my guitar online?** — Tap "Start tuning", allow the microphone, and play a string. The needle shows if you're flat or sharp.
**What are cents?** — 1/100 of a semitone. Aim for within ±5 cents.
**Can I tune other instruments?** — Yes. It detects any note, so it works for ukulele, violin, bass and voice.

### interval-timer
**How do I set up a HIIT timer?** — Set work seconds, rest seconds and rounds, then press Start.
**What is a Tabata interval?** — 20 seconds of work, 10 seconds of rest, 8 rounds (4 minutes).
**Does it beep between intervals?** — **[verify]**

### investment-calculator
**How much will my investment grow?** — Enter the initial amount, monthly contribution, annual return and years to see the future value.
**What return should I assume?** — Long-term stock index averages are often quoted around 7% per year after inflation, but returns aren't guaranteed.
**Does it use compound interest?** — Yes. Returns are compounded so growth builds on growth. **[verify frequency]**

### invoice-generator
**How do I create an invoice for free?** — Fill in the supplier, customer and items, and the invoice is generated with VAT totals.
**What is Pay by Square?** — A Slovak payment QR standard. Customers scan it in their banking app to pay with the details pre-filled.
**Can I reuse my details?** — Yes. Save the invoice as a template and load it next time.

### json-beautifier
**How do I format JSON?** — Paste it in to get it indented and validated instantly.
**How do I find a JSON syntax error?** — The error message points to the problem, usually a missing comma, trailing comma or unquoted key.
**Is my JSON uploaded?** — No. It's processed locally, so it's safe for API responses and configs.

### jwt-decoder
**How do I decode a JWT?** — Paste the token to see its header, payload and signature.
**Does this verify the signature?** — No. Verification needs the secret or key, so do it on your server.
**Is it safe to paste a JWT here?** — Yes. The token never leaves your browser.

### keep-awake
**How do I stop my screen from turning off?** — Tap once and the screen stays awake while this tab is visible.
**Does it work on iPhone?** — Yes, in modern Safari and Chrome, which support the Wake Lock API.
**Why did it stop working?** — Switching tabs or locking the phone releases the lock. Tap again when you come back.

### keycode-viewer
**What is the keyCode for Enter?** — 13. Press any key to see its `key`, `code` and `keyCode`.
**What's the difference between event.key and event.code?** — `key` is the character produced (depends on the keyboard layout). `code` is the physical key position.
**Is keyCode deprecated?** — Yes. Use `event.key` or `event.code` in new code.

### kitchen-timer
**Can I set several kitchen timers at once?** — Yes. Run up to four named timers at once, one per pot.
**Will it ring when done?** — **[verify]**
**Does it work offline?** — Yes, once the page is loaded.

### knot-guide
**What knots should everyone know?** — The bowline, clove hitch, square (reef) knot, figure-eight and taut-line hitch cover most everyday needs.
**What is the strongest knot for a loop?** — The figure-eight loop is the standard for climbing. The bowline is easier to untie.
**Which knot for tying a tarp?** — The taut-line hitch is adjustable and holds under tension.

### led-resistor
**What resistor do I need for an LED?** — R = (supply voltage − LED forward voltage) ÷ current. Enter them here to get the value.
**What resistor for an LED on 5V?** — For a red LED (2 V, 20 mA): (5 − 2) / 0.02 = 150 Ω.
**What if the exact value isn't available?** — Use the next higher standard value. It's slightly dimmer but safe.

### light-detector
**Can my phone measure lux?** — Yes, on Android in Chrome with the Ambient Light Sensor enabled. iPhones don't expose the sensor to browsers. **[verify flag]**
**How many lux do plants need?** — Low-light plants need about 500–2,500 lux. Most houseplants need 10,000+, and full sun is over 30,000.
**How bright should a room be?** — Living rooms are about 100–300 lux, offices about 500, and detailed work 750–1,000.

### line-tools
**How do I sort lines alphabetically?** — Paste the lines and click Sort.
**How do I remove duplicate lines?** — Paste the list and use the dedupe action. **[verify button name]**
**How many lines can it handle?** — Thousands. Everything runs in your browser.

### live-pad
**How do I share text between my phone and PC?** — Open Live Pad on both, create a pad on one, and join with the code on the other. Both can type.
**Is the text saved?** — No. It disappears when both tabs close.
**Does it go through a server?** — No. It goes peer-to-peer; a public broker only helps the devices find each other.

### loan-calculator
**How do I calculate a monthly loan payment?** — Enter the amount, annual interest rate and term in years to see the monthly payment and total interest.
**What formula is used?** — The standard amortization formula: fixed monthly payments covering interest plus principal.
**Can I use it for a mortgage or car loan?** — Yes. It works for any fixed-rate loan.

### lorem-ipsum
**What is Lorem Ipsum?** — Scrambled Latin placeholder text, used since the 1500s to fill layouts before the real copy exists.
**How do I generate more paragraphs?** — Set the number of paragraphs and copy.
**Why use Lorem Ipsum instead of real text?** — It looks like natural text but doesn't distract reviewers with meaning.

### maidenhead
**What is my Maidenhead grid square?** — Tap "Use my location" to see your 6-character locator.
**How do I convert a grid square to latitude and longitude?** — Paste the grid square (e.g. JN88) to get the coordinates of its center.
**What is a QTH locator?** — Another name for a Maidenhead locator, used by radio amateurs to share their location briefly.

### medicine-tracker
**How do I keep track of whether I took my pills?** — Add each medication and tap when you take a dose. The log shows when you last took it.
**Will it send notifications?** — **[verify]**
**Is my medication list private?** — Yes. It's stored only on your device.

### meditation-timer
**How long should I meditate?** — Beginners often start with 5–10 minutes a day.
**Does it ring at the end?** — Yes, a soft bell sounds when time is up. **[verify]**
**Can I set a custom duration?** — Yes. Enter any number of minutes.

### meeting-cost
**How much does a meeting cost?** — People × average hourly rate × duration. Start the timer to watch it tick up.
**What hourly rate should I use?** — Use roughly salary ÷ 2,080, or a loaded cost about 1.3× that to include overheads.
**Why use this?** — To make the cost of long or crowded meetings visible.

### meeting-overlap
**How do I find a meeting time across time zones?** — Add each person's timezone and waking hours. Green windows show when everyone is awake.
**What times are shown?** — Your local time, for the next 24 hours.
**Does it handle daylight saving time?** — Yes. It uses your browser's timezone database.

### metronome
**How do I use an online metronome?** — Set the BPM with + and − (or type it) and press Start.
**What BPM should I practice at?** — Start slow enough to play cleanly, then increase by 5–10 BPM.
**Does it work offline?** — Yes, once loaded. It uses the Web Audio API for accurate timing.

### mileage-log
**How do I log mileage for taxes?** — Record each trip's date, start, destination, distance and purpose, then use the monthly totals.
**What does a tax authority need in a mileage log?** — Usually the date, destination, business purpose and distance for every trip.
**Is it km or miles?** — Kilometres. **[verify]**

### mirror
**How do I use my camera as a mirror?** — Tap "Start mirror" and allow camera access.
**What is a true mirror?** — A non-reversed view that shows you as others see you.
**Is the video recorded?** — No. Nothing is recorded or uploaded.

### mood-tracker
**How do I track my mood?** — Pick how you feel today (Rough to Great) with an optional note. The last 30 days are shown at a glance.
**Why track mood?** — Patterns linked to sleep, exercise or events become easier to see.
**Is it private?** — Yes. It's stored only on your device.

### moon-phase
**What is the moon phase today?** — Open the page to see today's phase and illumination, or pick any date.
**When is the next full moon?** — It's shown below the current phase, along with the next new moon.
**How long is a lunar cycle?** — About 29.5 days from one new moon to the next.

### morse-code
**How do I translate text to Morse code?** — Type text in "Text → Morse" to see dots and dashes as you type.
**What is SOS in Morse code?** — `... --- ...`
**How are letters and words separated?** — A space between letters and a slash (/) between words. **[verify]**

### nfc-tags
**Can I read NFC tags in a browser?** — Yes, in Chrome on Android, which supports Web NFC. iPhones don't support it in browsers.
**How do I write a URL to an NFC tag?** — Enter the text or URL, tap "Write to tag", and hold the tag to your phone.
**What NFC tags work?** — NDEF-formatted tags such as NTAG213/215/216.

### noise-generator
**What's the difference between white, pink and brown noise?** — White is equal energy at all frequencies (hiss). Pink is softer in the highs. Brown is deep and rumbly.
**Which noise is best for sleep?** — Many people prefer pink or brown noise because it's less harsh than white.
**Can it play all night?** — Yes. It plays until you stop it, with the tab open.

### note-taker
**Where are my notes saved?** — In your browser on this device. They're auto-saved as you type.
**Does it support Markdown?** — Yes, with a live preview.
**How do I get my notes onto another device?** — Use Backup to export them, or Data Sync to transfer them peer-to-peer.

### one-rep-max
**How do I calculate my one rep max?** — Enter the weight lifted and the reps to get your estimated 1RM.
**Which formula is used?** — **[verify: Epley/Brzycki]**
**How accurate is it?** — Most accurate from sets of 2–10 reps. It's an estimate, not a test.

### p2p-chat
**Is P2P chat private?** — Messages go directly between browsers and aren't stored anywhere. They vanish when the room closes.
**How do I invite someone?** — Create a room and share the room code or link.
**Can I send files?** — Yes.

### p2p-file-transfer
**How do I send a large file without uploading it?** — Open the page on both devices, start a session on one, and join on the other. Files go directly between them.
**Is there a file size limit?** — No server limit. Very large files depend on the receiving device's memory.
**Does it work between phone and computer?** — Yes, between any two devices with a modern browser.

### pace-calculator
**How do I calculate my running pace?** — Enter the distance and time to get your pace per km and predicted 5K, 10K, half and full marathon times.
**What pace for a sub-2-hour half marathon?** — About 5:41 per km.
**What pace for a 25-minute 5K?** — 5:00 per km.

### packing-list
**What should I pack for a weekend trip?** — Load the Weekend Trip preset and adjust it.
**Can I reuse a list?** — Yes. "Uncheck all" resets it for the next trip.
**Is my list saved?** — Yes, on this device.

### paint-estimator
**How much paint do I need for a room?** — Enter the room length, width and height, coats and coverage to get litres and number of cans.
**How much does a litre of paint cover?** — Usually 10–12 m² per coat. Check the can.
**How much extra flooring should I buy?** — 5–10% for waste, more for diagonal or patterned layouts.

### parking-meter
**How much will parking cost?** — Enter the rate and duration to see the total.
**How long can I park for a given budget?** — Use "How long can I park?" and enter your budget.
**Does it track when my meter expires?** — **[verify timer]**

### parking-spot
**How do I remember where I parked?** — Save your GPS location and a note (level, row, pillar) when you park.
**Does it need internet?** — GPS works offline. Opening a map needs internet.
**Is my location shared?** — No. It's stored only on your phone.

### password-generator
**How does this password generator work?** — It derives a unique password from your master password and the site name, so the same inputs always give the same password and nothing needs to be stored. **[verify algorithm]**
**Is my master password sent anywhere?** — No. Everything is computed locally.
**What if I forget my master password?** — The passwords can't be recovered, so choose one you'll remember.

### pdf-merger
**How do I combine PDF files into one?** — Drop the PDFs, arrange them, and click "Merge & download".
**Are my PDFs uploaded?** — No. Merging happens in your browser.
**Is there a page or size limit?** — Only your device's memory.

### pdf-tiler
**How do I print multiple copies of a business card on one page?** — Drop the PDF and choose the paper size. The content is auto-cropped and tiled as many times as fit.
**What paper sizes are supported?** — A3, A4 and others.
**Is my file uploaded?** — No. It's processed in your browser; internet is only needed on first use to load the PDF library.

### pedometer
**Can my phone count steps in a browser?** — Yes, using the motion sensor. Keep the page open and the phone with you.
**How is distance estimated?** — Steps × stride length (0.65 m by default; adjust it for your height).
**Why isn't it counting?** — Allow motion access (on iPhone, tap to grant permission) and keep the screen on.

### percentage-calculator
**How do I calculate X% of a number?** — Enter the percent and the number, e.g. 20% of 150 = 30.
**How do I calculate percentage change?** — Enter the from and to values: (new − old) / old × 100.
**What percent is 30 of 150?** — 20%.

### period-tracker
**How is my next period predicted?** — From your average cycle length based on the start dates you log.
**Is my data shared with anyone?** — No. It never leaves your device, and there's no account or server.
**How many cycles do I need to log?** — Predictions get better after 3 or more cycles.

### pet-care
**How often should I give flea and worming treatment?** — Commonly monthly for flea treatment and every 3 months for worming. Ask your vet.
**Can I track several pets?** — Yes. Add each dog, cat or other pet.
**Can I log my pet's weight?** — Yes, alongside vaccines and treatments.

### plant-watering
**How often should I water my houseplants?** — It varies: succulents every 2–3 weeks, most tropicals weekly. Check that the soil is dry first.
**How does it remind me?** — Each plant shows when it's next due, based on when it was last watered.
**Can I add my own plants?** — Yes. Type any name and choose an interval.

### pomodoro
**What is the Pomodoro technique?** — 25 minutes of focused work, then a 5-minute break. Take a longer break after 4 rounds.
**Can I change the work length?** — Yes. Set the work minutes.
**Does it make a sound when the phase ends?** — **[verify]**

### qr-code
**How do I make a QR code for a link?** — Type or paste the URL and download the QR code.
**Do these QR codes expire?** — No. They're static and contain the data directly.
**Is my text sent to a server?** — No. The code is generated in your browser.

### qr-scanner
**How do I scan a QR code on my computer?** — Click "Start scanning" and hold the QR code up to your webcam.
**Can I scan a QR code from an image?** — **[verify]**
**Is it safe to open scanned links?** — Check the decoded link before tapping "Open link".

### random-picker
**How do I pick a random name from a list?** — Enter the names, one per line, and tap "Pick one".
**Is it fair?** — Yes. Each item has an equal chance.
**Can I use it for giveaways?** — Yes, for small giveaways and classroom picks.

### reaction-time
**What is a good reaction time?** — The average is about 250 ms. Under 200 ms is fast.
**How does the test work?** — Wait for green, then tap as fast as you can. There are 5 rounds and you get the average.
**Why is my time slower on some devices?** — Screen refresh and touch latency add a few milliseconds.

### readability
**What is a good Flesch reading ease score?** — 60–70 is plain English. Higher is easier to read.
**What grade level should my writing be?** — Aim for grade 7–9 for general audiences.
**How do I make my text easier to read?** — Use shorter sentences and words with fewer syllables.

### reading-log
**How do I keep track of books I've read?** — Add each book with its status (Want to Read, Reading, Read) and notes.
**Is it like Goodreads?** — It's a private, offline alternative with no account and no social features.
**Can I export my list?** — Yes, via Backup.

### recipe-box
**Where can I save my recipes?** — Here, on your device, with ingredients, steps and notes.
**Can I use it offline in the kitchen?** — Yes.
**Can I move recipes to another device?** — Use Backup or Data Sync.

### recipe-scaler
**How do I scale a recipe?** — Enter the original and desired servings plus the ingredients. All quantities are rescaled.
**Can I halve a recipe?** — Yes. Set the desired servings to half the original.
**What about baking times?** — These aren't scaled. Larger amounts usually need more time, so check as you go.

### rent-vs-buy
**Is it better to rent or buy?** — It depends on prices, rates and how long you'll stay. Enter your numbers to see a rough break-even point.
**What is the break-even point?** — How many years until buying costs less overall than renting.
**Is this financial advice?** — No, it's a rough estimate.

### resistor-decoder
**How do I read resistor color codes?** — Click each band to set its color and the value and tolerance appear.
**What does brown, black, red mean?** — 1, 0, ×100 = 1,000 Ω (1 kΩ).
**Which end do I start from?** — The end away from the gold or silver tolerance band.

### roman-numerals
**What is 2026 in Roman numerals?** — MMXXVI.
**How do I convert Roman numerals to numbers?** — Type the numeral (e.g. XLII) to see 42.
**What's the largest Roman numeral?** — Standard notation goes up to 3999 (MMMCMXCIX).

### schengen
**How does the Schengen 90/180 rule work?** — You can stay up to 90 days in any rolling 180-day period across all Schengen countries combined.
**How do I count my days?** — Add each trip's entry and exit dates to see days used and remaining. Entry and exit days both count.
**Does the UK count?** — No. The UK, Ireland and Cyprus aren't in the Schengen area.

### scoreboard
**How do I keep score for a game?** — Add players and tap to add points. The display is large enough to read across a room.
**Can I have more than two players?** — Yes. Add as many as you need.
**Is the score saved?** — **[verify]**

### screen-recorder
**How do I record my screen without software?** — Click "Start recording", choose a screen, window or tab, and download the video when done.
**How do I record with audio?** — Tick "Share audio" in the browser's picker for system sound, and enable the microphone to narrate.
**Is there a time limit or watermark?** — No.

### seismometer
**Can my phone detect earthquakes?** — It can measure vibration with its accelerometer, but it's not a calibrated seismograph.
**What does m/s² mean?** — Acceleration. Higher values mean stronger shaking.
**How do I measure vibration?** — Place the phone flat on the surface and tap Start.

### shared-sketchpad
**How do I draw together online?** — Create a room, share the code, and everyone draws on the same canvas live.
**Do I need an account?** — No. Just pick a nickname.
**How long does the room last?** — As long as the host's tab stays open.

### shared-timer
**How do I share a timer with others?** — Start a countdown and share the code. Everyone sees the same time.
**What is it useful for?** — Workshops, classes, timed games and remote meetings.
**Does everyone need the page open?** — Yes. Each person joins with the code.

### shopping-list
**Is my shopping list saved?** — Yes. It's saved automatically on your device.
**Does it work without signal in the store?** — Yes. It works offline.
**Can I share the list with my partner?** — Use Data Sync to copy it to another device.

### signal-mirror
**How does a signal mirror work?** — It reflects sunlight as a bright flash that can be seen many kilometres away.
**How do I aim a signal mirror?** — Hold out two fingers in a V around the target and move the reflected spot across it.
**How far can a signal mirror be seen?** — In full sun, often 10+ km.

### size-converter
**How do I convert US to EU shoe sizes?** — Pick the category and size to see equivalents for other countries.
**Are sizes the same across brands?** — No. Treat these as a starting point.
**Does it cover clothing?** — Yes, clothing and shoes.

### sketch-pad
**How do I draw a signature online?** — Sign with a mouse, finger or stylus and download it as a PNG.
**Is the background transparent?** — **[verify]**
**Is my drawing uploaded?** — No.

### sleep-calculator
**What time should I go to bed?** — Enter your wake-up time to see bedtimes that give 5–6 full sleep cycles.
**How long is a sleep cycle?** — About 90 minutes.
**Why wake up at the end of a cycle?** — You feel less groggy waking from light sleep than from deep sleep.

### sleep-log
**How do I track my sleep?** — Log your bedtime and wake time each night to see hours slept and averages.
**How much sleep do adults need?** — 7–9 hours.
**Do I need a smartwatch?** — No. Entries are manual.

### slug-cleaner
**What is a URL slug?** — The readable part of a URL, like `my-first-post`.
**How do I make a slug from a title?** — Type the title to get a lowercase, dash-separated, ASCII-only slug.
**What happens to accents?** — They're converted to plain letters (é → e).

### sound-meter
**How do I measure decibels with my phone?** — Tap "Start listening" and allow the microphone.
**What is dBFS?** — Decibels relative to full scale (0 = loudest the mic can record). It's not calibrated SPL.
**How loud is too loud?** — Above about 85 dB SPL for long periods can damage hearing.

### speaker-test
**How do I test left and right speakers?** — Play the Left, Right and Both tones.
**How do I check for a blown speaker?** — Use the sweep and listen for rattling or buzzing.
**Does it work with headphones?** — Yes.

### speaking-clock
**Can the clock announce the time?** — Yes. Tap Announce, or auto-announce every minute or hour.
**Who is it for?** — People with low vision, or anyone who wants hands-free time checks.
**Does it work offline?** — Yes, using your device's built-in voices.

### speech-to-text
**How do I convert speech to text online?** — Tap Start Recording and speak. The transcript appears as you talk.
**Which browsers work?** — Chrome, Edge and Safari support the Web Speech API. Firefox doesn't yet.
**Does it work offline?** — Chrome sends the audio to Google for recognition, so it usually needs internet. **[verify — conflicts with "works offline" claim]**

### spirit-level
**Can I use my phone as a spirit level?** — Yes. Lay it on the surface and read the X and Y angles.
**How accurate is it?** — Usually within about 1°, depending on the sensor.
**Why does it say waiting for motion data?** — Allow motion access (on iPhone, tap to grant permission).

### sql-formatter
**How do I format SQL?** — Paste it in to get indented, readable SQL.
**Which SQL dialects are supported?** — Standard SQL. **[verify]**
**Is my SQL uploaded?** — No.

### stopwatch
**How do I record lap times?** — Press Lap while the stopwatch is running.
**Does it keep running if I switch tabs?** — Yes. Time is measured from the start timestamp.
**Does it work offline?** — Yes.

### subnet-calculator
**How many hosts are in a /24?** — 254 usable (256 − network − broadcast).
**What is the subnet mask for /27?** — 255.255.255.224, with 30 usable hosts.
**How do I calculate a network range?** — Enter the IP and CIDR to see the network, broadcast and first and last host.

### subscription-tracker
**How much do I spend on subscriptions?** — Add each one with its cost and cycle to see the monthly total.
**Can I add yearly subscriptions?** — Yes, and they're converted to a monthly cost.
**Does it remind me before renewal?** — It shows what renews soon.

### sum-calculator
**How do I add up a list of numbers?** — Paste them. Any spaces or new lines work, and the sum appears instantly.
**Does it handle currency symbols and commas?** — Yes.
**What gets ignored?** — Words and values with units like "2kg".

### sunrise-sunset
**What time is sunrise today?** — Tap "Use my location" to see sunrise, sunset, golden hour and day length.
**When is golden hour?** — Roughly the first and last hour of sunlight. Exact times are shown.
**What is civil dawn?** — When the sun is 6° below the horizon. It's light enough to see outside.

### swim-bike-pace
**How do I calculate swim pace per 100m?** — Enter the distance and time.
**How do I calculate cycling speed?** — Choose Bike and enter the distance and time.
**Can I use miles?** — Yes.

### tally-counter
**Is my count saved?** — Yes. It's kept on your device.
**Can I use keyboard shortcuts?** — Space or ↑ adds one, ↓ subtracts one.
**Can I count on my phone?** — Yes. Tap +.

### tap-bpm
**How do I find the BPM of a song?** — Tap along to the beat (spacebar or screen). The BPM updates live.
**How many taps do I need?** — 8–10 taps give a stable reading.
**How do I reset?** — Pause for a few seconds and start tapping again. **[verify]**

### teleprompter
**How do I use a teleprompter online?** — Paste your script and press Start. Adjust speed and size to suit.
**Does it support mirror mode?** — Yes, for beam-splitter glass.
**Is my script saved?** — Yes, automatically.

### text-to-speech
**How do I make my computer read text aloud?** — Paste the text and tap Speak.
**Can I change the voice?** — Yes. Choose the voice, rate and pitch.
**Can I download the audio?** — No. Browsers don't expose speech as a file.

### timezone
**How do I convert a time between time zones?** — Enter the time, the source zone and the target zone.
**Does it handle daylight saving?** — Yes, automatically.
**How do I find a time for a meeting across zones?** — Use Meeting Overlap.

### tip-tax
**How much should I tip?** — In the US, 15–20% is standard at restaurants.
**Should I tip on the pre-tax amount?** — Usually yes. Check "Tax already included" if it applies.
**How do I split the bill?** — Enter the number of people.

### tone-generator
**How do I generate a tone at a specific frequency?** — Enter the Hz, choose the waveform and press Play.
**What frequency is the A note?** — 440 Hz.
**What's the hearing range?** — About 20 Hz–20 kHz. It narrows with age.

### totp
**How do I generate a 2FA code from a secret key?** — Paste the Base32 secret to see the current 6-digit code.
**Is it safe?** — The secret is never stored or sent. It's meant for testing, though.
**Why doesn't my code match?** — Check your device clock. TOTP depends on the exact time.

### touch-tester
**How do I test my touchscreen?** — Touch the screen to see touch points.
**How many touches does my screen support?** — Use several fingers; the max is shown.
**How do I find dead zones?** — Drag a finger slowly across the whole screen.

### transfer-time
**How long does a 1 GB download take?** — At 100 Mbps, about 80 seconds.
**Mbps vs MB/s?** — 1 byte = 8 bits, so 100 Mbps is about 12.5 MB/s.
**Why is my transfer slower than calculated?** — Network overhead and congestion.

### unit-converter
**How do I convert cm to inches?** — Enter the value and unit to see all related units.
**Does it convert temperature?** — Yes.
**Metric and imperial?** — Both.

### unit-price
**How do I compare prices by unit?** — Enter the price and quantity for each option.
**Which is the better deal?** — The lowest price per unit is highlighted.
**Can I compare more than two?** — Up to three.

### unix-timestamp
**What is a Unix timestamp?** — Seconds since 1 January 1970 UTC.
**How do I convert a timestamp to a date?** — Paste it in. Both seconds and milliseconds are accepted.
**What's the current timestamp?** — Click Now.

### url-parser
**How do I extract query parameters from a URL?** — Paste the URL to see the decoded query parameters.
**What are the parts of a URL?** — Protocol, host, port, path, query and hash.
**Does it decode %20?** — Yes.

### user-agent-parser
**What is my user agent?** — It's shown on the page.
**How do I parse a user agent string?** — Paste it in.
**Why is it inaccurate?** — Browsers increasingly freeze or reduce their UA strings.

### uuid-generator
**What is a UUID v4?** — A 128-bit random identifier.
**Can UUIDs collide?** — It's practically impossible.
**How do I generate many UUIDs?** — Set the count and copy them all.

### vaccination-tracker
**When is my next tetanus booster due?** — Every 10 years.
**How do I track my vaccines?** — Add each dose and interval.
**Is my data private?** — Yes.

### vcard-qr
**How do I make a QR code for contact details?** — Fill in your name, phone and email, then download.
**What happens when someone scans it?** — Their phone offers to save the contact.
**Is this a vCard?** — Yes.

### voice-recorder
**How do I record audio online?** — Tap Start recording and allow the microphone.
**What format is the recording?** — **[verify webm/ogg]**
**Is there a time limit?** — No.

### voltage-divider
**What's the voltage divider formula?** — Vout = Vin × R2 / (R1 + R2).
**How do I get 3.3V from 5V?** — For example, R1 = 1 kΩ and R2 = 2 kΩ (gives 3.33 V).
**Can I power a device from a voltage divider?** — No. Use a regulator. Dividers are for signals.

### warranty-tracker
**How do I track warranties?** — Add the item, purchase date and warranty months.
**What's the typical warranty length?** — Two years in the EU, often one year elsewhere.
**Where are receipts stored?** — Not here. Keep a note of where the receipt is.

### water-reminder
**How much water should I drink?** — About 2–3 litres a day, including food.
**How does it track?** — Tap once per glass.
**Can I change my goal?** — Yes.

### where-am-i
**What are my GPS coordinates?** — Tap Locate me.
**Does it work offline?** — Yes. GPS doesn't need internet.
**How accurate is it?** — The accuracy is shown in metres.

### wishlist
**How do I make a wishlist?** — Add items with an optional price and link.
**Can I share it?** — Not directly. Use Data Sync or a screenshot.
**Is it private?** — Yes.

### word-counter
**How many words is a 5-minute speech?** — About 650–750 words.
**Does it count characters without spaces?** — Yes.
**How is reading time calculated?** — At about 200–250 words per minute. **[verify]**

### workout-log
**How do I track my workouts?** — Log the exercise, sets, reps and weight.
**How do I see progress?** — Look through the history per exercise.
**Is it private?** — Yes.

### world-clock
**How do I see times in multiple cities?** — Add the time zones you need.
**Are they saved?** — Yes.
**Does it handle daylight saving?** — Yes.

### yaml-json
**How do I convert YAML to JSON?** — Paste the YAML.
**JSON to YAML?** — Paste JSON instead.
**Does it validate YAML?** — Yes, and errors are shown.
