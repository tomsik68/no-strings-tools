# No Strings Tools (nostrings.tools)

A collection of simple, fast, offline-first web tools that solve single problems without unnecessary complexity, login, or friction. No strings attached.

## Philosophy

**"No strings attached"** means:

- **No fluff:** Every UI element has a job. No decorative animations, no "modern" overhead.
- **No friction:** Works offline, no account, instant. Page loads in <1 second.
- **No complexity:** Code is readable and maintainable by one person. No build step. No hidden magic.
- **No tracking/privacy:** No analytics, no ads, no data collection.
- **Opinionated UX:** Strong defaults, minimal user choice. One happy path per app. Users get the right behavior without configuring it.

## What Is a "No-Strings" App?

An app belongs in this suite if it:

- **Solves a single, narrow problem** (timezone converter, JSON formatter, unit converter, hash generator, etc.)
- **Works completely offline** (HTML + JS in the browser)
- **Loads and responds in <1 second** on a typical connection
- **Requires no login**
- **Has no tracking, ads, or data collection**
- **Code is <500 lines** (if it's bigger, it's probably solving the wrong problem or the wrong way)
- **One person can understand and maintain it**

## Inclusion Criteria Checklist

Before shipping an app, verify:

- ✅ Single problem solved (no feature creep)
- ✅ No login
- ✅ No tracking/analytics
- ✅ Offline-first (works without internet)
- ✅ file:/// compatible (can open directly as `file:///path/to/index.html`)
- ✅ Opinionated UX (dead-simple HTML form, auto-focus, sensible defaults)
- ✅ <500 lines of code
- ✅ <1 second load time
- ✅ Modern browsers only (no IE11, no polyfills)

## Tech Stack

### Frontend
- **HTML5 semantic markup** (no div soup)
- **W3.CSS** (via CDN) for styling—prefer it first
- **Custom CSS:** small `<style>` blocks in `index.html` are OK when W3 can't do the layout (flex rows, badges, grids, timer displays). **No separate `.css` files.** Soft cap ~40 lines; rethink past ~80. No decorative animations or design-system sprawl.
- **Vanilla JavaScript** (ES2020+) for interactivity
- **HTMX** or **Alpine.js** acceptable for dynamic behavior, but only if necessary
- **No build step.** Write plain HTML/JS files, link via CDN.

### Backend

There is no backend. Every app is pure client-side; data lives in localStorage.
Cross-device needs are served peer-to-peer (WebRTC/PeerJS), not through a server.
This is a hard rule — if an idea needs a server, it doesn't belong in this suite.

### Browser Support
- **Modern browsers only:** Last 2 years of Chrome, Firefox, Safari, Edge
- **ES2020+ features are OK** (destructuring, async/await, optional chaining, etc.)
- **No polyfills needed**

### Hosting
- **Cloudflare Pages, Vercel, or GitHub Pages**
- Deploy on every push; no manual steps
- CDN globally distributed
- Free tier covers this use case

## Repository Structure

```
no-strings-tools/
├── frontend/                        # Deploy this: all user-facing apps
│   ├── index.html                   # Dashboard with search
│   ├── timezone/
│   │   ├── index.html
│   │   ├── app.js
│   │   └── (no CSS—use W3.CSS)
│   ├── [more app folders]/
│   └── README.md
│
├── deploy.sh                        # Deploy frontend
├── justfile                         # Alternative: requires `just` CLI
├── CLAUDE.md                        # This file
└── README.md                        # Root overview
```

### App Structure

Each app is a self-contained folder in `frontend/`:
- **`index.html`** — the entire UI (semantic HTML + W3.CSS classes; optional small `<style>` block)
- **`app.js`** — vanilla JS for interactivity (optional if no JS needed)
- **No separate `.css` file** — keep styles in the HTML if needed

**Important:** Use **relative links** for all navigation (e.g., `./timezone/` or `../`), not absolute paths starting with `/`. This ensures the app works both online and offline.

```html
<!-- ✅ Good: works offline and online -->
<a href="./timezone/">Timezone Converter</a>
<a href="../">Back to home</a>

<!-- ❌ Bad: breaks offline -->
<a href="/timezone/">Timezone Converter</a>
<a href="/">Back to home</a>
```

### Dashboard (`frontend/index.html`)

Provides:
- Grid of all apps with search
- Footer with sponsor link

## Development Workflow

### Creating a New App

1. Create a folder in `frontend/`: `mkdir frontend/new-app`
2. Write `index.html` with semantic HTML + W3.CSS classes
3. Add `app.js` if you need interactivity
4. Link to W3.CSS via CDN; add a small `<style>` block only if W3 isn't enough
5. Test offline (open as `file:///` or use local server)
6. Add to `frontend/index.html` app grid
7. Push to git; deploy via `./deploy.sh`

### Code Reuse

- **Duplication is OK.** Copy-paste HTML snippets if needed.
- **No shared modules.** Each app is fully self-contained; don't over-abstract.
- **No components library.** HTML is the component library.

### Performance

- **Test with DevTools Network throttle** (simulating slow connection)
- **Goal:** <1 second page load + interactivity
- **Audit:** Use Lighthouse (Chrome DevTools)
- **Test offline:** Open app as `file:///` in browser

## Deployment

### Frontend (Required)

Deploy the frontend to any static host:

**Option 1: To your server**
```bash
./deploy.sh
# Deploys to /srv/blog/nostrings/index.html on server
```

**Option 2: Cloudflare Pages**
```bash
wrangler pages deploy frontend
```

**Option 3: Any CDN (S3, etc.)**
```bash
# Copy frontend/ to your host
scp -r frontend/* user@server:/var/www/nostrings/
```

**Apps work immediately** — no backend needed.

## UX Principles

Each app should have **opinionated, strong defaults:**

- **Auto-focus** on the primary input (user starts typing immediately)
- **Tab order** is intuitive (top to bottom, left to right)
- **Enter key** submits the form or performs the action
- **Keyboard-friendly** — all interactive elements accessible via Tab; Enter/Space to activate buttons
- **Immediate feedback** (results appear as you type, or after one click)
- **No settings/options.** Bake in the right defaults instead.
- **Clear outcome.** When the user acts, something visible happens.
- **Mobile-first responsive** — test on phone first, then desktop. Works fluidly at any width.
- **Accessible by default** — ARIA labels on icon buttons, sufficient color contrast (WCAG AA minimum), works with keyboard alone
- **Friendly error messages** (1 line max, human-readable). Invalid input? Tell users what they need in a kind way.

**Example:** A timezone converter auto-focuses the time input, shows results in real-time as you type, and has a single "Convert" button. No "precision" dropdown, no "locale settings"—the defaults are right. Works on mobile and desktop. Keyboard-navigable (Tab through inputs, Enter to convert). If invalid input, shows "Invalid timezone" — friendly and clear.

## State Persistence Pattern

Be intentional about which apps persist state to `localStorage`:

- **Persist (workspace apps):** Apps where users *edit* or *configure* something and want it saved. Examples: bill-splitter, shopping-list, world-clock (saved timezones), pomodoro (if mid-session).
- **Don't persist (reference apps):** Lookup tools, calculators, converters where state is ephemeral. Examples: periodic table, morse code, timezone converter, QR code generator.
- **Rule of thumb:** "Would I want this saved if I close and reopen?" If yes, persist. If no, don't.

## Offline-First & file:/// Support

**All apps must work offline.**

- **No required network calls** — All logic in HTML + JS, no mandatory API requests
- **file:/// compatible** — Users should be able to open `frontend/index.html` directly in a browser (no server needed)
- **CSS from CDN only** — W3.CSS via CDN works offline after first load (cached)
- **No fetching local files** — Don't use `fetch('./data.json')` (CORS blocks this). Bake data into the HTML/JS instead.

**Exception — P2P apps:** WebRTC apps (p2p-chat) need internet for peer
discovery (PeerJS broker), but degrade gracefully and never store data anywhere.

**Test:** Open your app as `file:///path/to/frontend/app-name/index.html` in a browser with no server running. It should work completely.

**Why:** Offline-first means maximum portability. Users can save apps locally, use them anywhere, share them freely. No internet required.

## Cross-Device Data

There are no accounts in any app. If users need their data elsewhere:
- **localStorage** is the only persistence apps may rely on
- **Backup app** exports/imports all of it as a JSON file the user owns
- For live sharing between devices, use WebRTC peer-to-peer (see p2p-chat)

## Example Apps

- **Timezone Converter** — Input a time and timezone, see it converted. Pure client-side.
- **JSON Formatter** — Paste JSON, see it pretty-printed with validation errors. Pure client-side.
- **Unit Converter** — Select units, enter a value, see conversions. Pure client-side.
- **QR Code Generator** — Type text, see QR code. Pure client-side.
- **Hash Generator** — Paste text, see SHA256/MD5 hashes. Pure client-side.
- **Image Resizer** — Upload image, resize it, download. Pure client-side (canvas).

## Maintenance

- Each app should be **self-contained and independently maintainable**
- No central state or shared code unless necessary
- Code reviews: Is this solving one problem? <500 lines? No cruft?
- Deprecation: If an app becomes unused or broken, remove it cleanly (don't leave stubs)

## What Not to Do

- ❌ Don't add accounts, logins, or server-side anything—localStorage and P2P only
- ❌ Don't add separate `.css` files or large decorative stylesheets—W3.CSS first, small inline `<style>` only when needed
- ❌ Don't build a framework or component library
- ❌ Don't add analytics, ads, or tracking
- ❌ Don't support old browsers (>2 years old)
- ❌ Don't solve multiple problems in one app
- ❌ Don't add unnecessary features or options
- ❌ Don't use a build step or bundler
- ❌ Don't over-abstract or DRY for its own sake
- ❌ Don't forget offline-first—always test as `file:///`

---

**Built for simplicity, speed, and pragmatism.**
