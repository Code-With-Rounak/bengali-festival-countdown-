# Bengali Festival Countdown

A self-contained, dependency-free (HTML/CSS/vanilla JS) countdown site for
Durga Puja, Lakshmi Puja, and Kali Puja. No backend, no build step, no
tracking, no external services.

## Run it locally

No build tools needed — just serve the folder over HTTP (not `file://`,
since the service worker and fetch-based image loading need a real
origin):

```bash
cd bengali-festival
python3 -m http.server 8080
# open http://localhost:8080
```

## Project structure

```
index.html
css/style.css          — design tokens, layout, gradient background fallbacks
css/responsive.css      — breakpoints
js/festivals.js         — ★ all festival dates & Bengali content live here
js/storage.js           — safe localStorage wrapper (prefs only)
js/countdown.js         — date math: live/upcoming/Mahalaya/cycle logic
js/theme.js              — IST time-of-day detection + background crossfade
js/audio.js               — user-gated music playback
js/effects.js              — particles + interactive diya
js/app.js                   — wires it all to the DOM
manifest.webmanifest
sw.js                        — offline app-shell cache
assets/images/<festival>/{morning,afternoon,evening,night}.webp
assets/audio/{durga,lakshmi,kali}.mp3
icons/                        — PWA icons (192, 512, maskable 512)
```

## What's already working

- Accurate countdown to Durga Puja (Mahalaya 10 Oct 2026 → Shashthi 17 Oct →
  Vijaya Dashami 21 Oct), Lakshmi Puja / Kojagari Purnima (25 Oct 2026), and
  Kali Puja (8 Nov 2026), verified against multiple 2026 panjika sources.
- Automatic switching between festivals, a Mahalaya special mode, and a
  cycle-reset fallback if the app is ever left running past the last
  configured festival (see "Updating dates every year" below).
- Four IST-based backgrounds per festival (morning/afternoon/evening/night)
  with smooth crossfade — currently rendered as **CSS gradients** as a
  placeholder art direction (see "Adding real images" below); dropping a
  real photo into the matching path upgrades it automatically.
- Countdown, progress bar, timeline, Bengali date, status pill, rotating
  messages, share button, Puja Mode, and an interactive diya.
- Music controls wired to `<audio>`, gated behind user interaction,
  degrading gracefully if a track is missing.
- Service worker + manifest for offline/installable use.
- Reduced-motion support, keyboard accessibility, ARIA live regions.

## Adding real images (required before you publish)

The site ships with no photos — I can't source or generate licensed
festival photography for you. Drop your own images at:

```
assets/images/durga/morning.webp   (and afternoon/evening/night)
assets/images/lakshmi/...
assets/images/kali/...
```

Nothing else needs to change — `theme.js` tries to load the image first and
silently keeps the CSS-gradient placeholder if the file 404s, so you can
replace festivals one at a time. Use WebP or AVIF, ~150–300KB each, ideally
shot/cropped for a 9:16–16:9 range so it works on both phones and desktop.

## Adding music (required before you publish)

Drop licensed/royalty-free tracks at:

```
assets/audio/durga.mp3
assets/audio/lakshmi.mp3
assets/audio/kali.mp3
```

Keep files small (compressed, ~1–3 min loop, <2MB) for mobile data. If a
file is missing, the music button disables itself instead of breaking
anything.

## Replacing fonts (optional but recommended)

`style.css` currently falls back to whatever Bengali-capable system font
the visitor's device has (Noto Sans Bengali on most Android/Chrome,
Hind Siliguri on many others). For a fully self-contained, consistent
look, download a licensed Bengali webfont (e.g. Hind Siliguri or Baloo Da 2
from Google Fonts — both OFL-licensed) and:

1. Place the `.woff2` files in `assets/fonts/`.
2. Add `@font-face { src: url("assets/fonts/...") }` rules in `style.css`.
3. Update `font-src 'self'` in the CSP (already scoped correctly below).

## Updating festival dates every year

Bengali festival dates follow the lunisolar Panjika calendar and shift
every year — **never** reuse this year's dates for next year. Once a
year, open `js/festivals.js` and update, for each festival:

- `mahalayaDate` (Durga Puja only)
- `startDate` / `endDate`
- `timelineDates`

Look them up fresh from a trusted panjika source (a local purohit's
calendar, or a site like drikpanchang.com) — that's the only file that
needs touching. Everything else (countdown math, switching logic, UI)
adapts automatically.

## Security notes

The site is a static frontend with no server-side code, no secrets, and
no third-party scripts. Recommended response headers (set at your host/CDN
— not achievable from a static HTML `<meta>` tag alone for all of these):

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:; media-src 'self';
  style-src 'self'; font-src 'self'; script-src 'self'; connect-src 'self';
  object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none';
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

On free static hosts (GitHub Pages, Cloudflare Pages, Netlify, Vercel),
these are set via a `_headers` file (Netlify/Cloudflare Pages) or
`vercel.json` (Vercel) rather than in HTML — check your host's docs for
the exact syntax.

## Privacy

No accounts, no logins, no analytics, no ad trackers, no GPS, no photo
uploads. `localStorage` is used only for: music on/off, volume, and Puja
Mode on/off — nothing identifying. If `localStorage` is blocked entirely
(private browsing), the site still works with in-memory defaults.

## Testing checklist

- [ ] Change your system clock to a date inside each festival window and
      confirm the "live" state, message pool, and progress bar behave.
- [ ] Step through a full year to confirm the transition overlay fires
      between festivals and the timeline highlights "today" correctly.
- [ ] Load with DevTools "Slow 3G" / offline (after first visit) to check
      the service worker keeps the countdown ticking.
- [ ] Toggle `prefers-reduced-motion` in DevTools and confirm particles/
      transitions stop.
- [ ] Delete/rename an image or audio file and confirm the page still
      loads cleanly (gradient/disabled-button fallback).
- [ ] Resize from 320px to a 4K monitor; rotate to landscape on a phone.
