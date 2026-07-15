# No Strings Tools — Frontend

Simple, offline-first web apps. No backend, no accounts, no tracking. No strings attached.

## Structure

```
frontend/
├── index.html                 # Dashboard with search
├── [130+ app directories]/    # Each app is self-contained
│   ├── index.html
│   └── app.js
```

## Deployment

### Quick Deploy to Server

```bash
cd ..
./deploy.sh
```

Deploys to `/srv/blog/nostrings/index.html` on server.

### Deploy to Cloudflare Pages

```bash
wrangler pages deploy frontend
```

### Deploy Anywhere

The frontend is pure HTML+JS. No build step needed.

```bash
# Copy to your server:
scp -r frontend/* user@server:/var/www/nostrings/

# Or upload to S3:
aws s3 sync frontend s3://my-nostrings-bucket/
```

## Features

### Offline-First
- All apps work completely offline
- No account required
- Data stored in localStorage only
- **Backup app** exports/imports everything as a JSON file the user owns
- Cross-device sharing is peer-to-peer (WebRTC), never through a server

## App Development

Each app is a self-contained folder with:

```
app-name/
├── index.html     # Semantic HTML + W3.CSS only
└── app.js         # Vanilla JavaScript (ES2020+)
```

## Guidelines

- **No custom CSS** — Use W3.CSS only
- **<500 lines** — Keep apps simple
- **One problem** — Don't feature-creep
- **No tracking** — Zero analytics
- **No backend** — Pure client-side, always
- **Opinionated** — Strong defaults, no settings
- **Keyboard friendly** — Full keyboard nav
- **Mobile responsive** — Test on mobile first

See `../CLAUDE.md` for full philosophy.

## File /// Support

All apps work when opened as `file:///` (offline):

```bash
# Open in browser:
open frontend/index.html

# Or with python server:
cd frontend && python3 -m http.server 8000
```

## Development

### Local Server

```bash
cd frontend
python3 -m http.server 8000
# Open http://localhost:8000
```

### Development Tips

- Check browser console for errors
- Use DevTools Network tab to test offline
- Test mobile in DevTools device mode
- Search dashboard filters all apps
- Each app has "← Back" link

## Performance

Target: **<1 second page load**

- No build step
- No bundler
- No transpilation
- Direct CDN links (W3.CSS, libraries)
- Minimal JavaScript
- CSS loaded once (W3.CSS)

## Browser Support

- Modern browsers only (Chrome, Firefox, Safari, Edge)
- Last 2 years of releases
- ES2020+ features OK
- No IE11, no polyfills

## Privacy

- Zero analytics
- Zero ads
- Zero tracking
- Zero cookies
- Data never leaves the user's device
