# No Strings Tools

![License: MIT](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![130+ tools](https://img.shields.io/badge/tools-130%2B-blue?style=for-the-badge)
![Works offline](https://img.shields.io/badge/works-offline-orange?style=for-the-badge)
![Zero tracking](https://img.shields.io/badge/tracking-zero-red?style=for-the-badge)
![No build step](https://img.shields.io/badge/build_step-none-lightgrey?style=for-the-badge)
[![Deploy](https://img.shields.io/github/actions/workflow/status/tomsik68/no-strings-tools/deploy-pages.yml?style=for-the-badge&label=deploy)](https://github.com/tomsik68/no-strings-tools/actions)

A collection of 130+ simple, offline-first web tools without bloat, tracking, or friction. No strings attached.

Live at [nostrings.tools](https://nostrings.tools).

## Philosophy

**"No strings attached"** means:
- **No fluff** — Every element has a purpose
- **No friction** — Works offline, no login required, instant
- **No complexity** — Code is readable, no build step
- **No tracking** — Zero analytics, ads, or data collection
- **Opinionated** — Strong defaults, one happy path per app

See [CLAUDE.md](CLAUDE.md) for full guidelines.

## Repository Structure

```
no-strings-tools/
├── frontend/                  # All 130+ apps (deploy this)
│   ├── index.html             # Dashboard & search
│   ├── [130+ app folders]/    # Each app
│   └── README.md
│
├── deploy.sh                  # Deploy frontend to server
├── justfile                   # Alternative (requires `just` CLI)
├── CLAUDE.md                  # App development guidelines
└── README.md                  # This file
```

There is no backend. Every app is pure HTML + JS; data lives in localStorage.

## Quick Start

```bash
# Open apps offline
open frontend/index.html

# Or start local server
cd frontend
python3 -m http.server 8000
# Visit http://localhost:8000
```

## What You Get

### All Apps Work Offline
- No account required
- No internet needed
- Data in localStorage
- Open as `file:///`

## Example Apps

**Utilities:**
- Timezone converter
- Unit converter
- JSON formatter
- Base64 encoder/decoder
- QR code generator

**Productivity:**
- Shopping list
- Notes with markdown
- Recipe scaler
- Bill splitter
- Pomodoro timer

**Reference:**
- Periodic table
- Planets
- Physics constants
- Phonetic alphabet
- Knot guide

**Sensors (Device APIs):**
- Compass
- Spirit level
- Pedometer
- Light detector
- Seismometer

**Audio/Video:**
- Text-to-speech
- Speech-to-text
- Metronome
- Noise generator
- Speaking clock

**Developer Tools:**
- Regex tester
- Cron explainer
- JWT decoder
- Resistor decoder
- Capacitor decoder

**P2P Networking:**
- Chat & file sharing (WebRTC)

...and 100+ more.

## Development

### Add a New App

1. Create folder: `frontend/new-app/`
2. Write `index.html` (semantic HTML + W3.CSS)
3. Write `app.js` (vanilla JS, optional)
4. Add to `frontend/index.html` app grid
5. Test offline

## Deployment

Every push to `main` deploys `frontend/` to GitHub Pages automatically
(`.github/workflows/deploy-pages.yml`). Manual alternatives:

```bash
./deploy.sh  # To your server
# OR
wrangler pages deploy frontend  # To Cloudflare Pages
```

## Performance

- **Page load:** <1 second
- **Offline:** 100% functional
- **File size:** ~50KB per app (average)
- **No build:** Direct CDN links
- **ES2020+:** Modern browsers only

## Privacy & Security

- **Zero tracking** — No analytics, no ads
- **Offline-first** — Data stays on your device
- **No accounts** — Nothing to log into, nothing stored server-side
- **Open source** — Code is auditable
- **HTTPS** — Encrypted in transit

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- No IE11, no polyfills

## License

MIT - Use freely, modify, fork, deploy anywhere.

## Questions?

- See [CLAUDE.md](CLAUDE.md) for app guidelines
- See [frontend/README.md](frontend/README.md) for app dev

---

**Built with simplicity, speed, and pragmatism.**
