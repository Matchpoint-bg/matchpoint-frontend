# MatchPoint — Web App + PWA

A front-end for the [MatchPoint Django REST backend](https://github.com/Corentin-dupriez/matchpoint).
React + TypeScript, built with Vite, installable as a PWA. Design theme: **floodlit night court**,
built on the tennis-ball palette `#7bc133 · #92d250 · #acdf77 · #c3e69e · #dff6c8`.
Ships with light/dark themes and English/Bulgarian translations.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typechecks, then builds to `dist/` (also emits the service worker) |
| `npm run preview` | Serves the production build — use this to test PWA/offline behavior |
| `npm run typecheck` | `tsc --noEmit` |

The service worker only runs in a production build, so test install/offline with
`npm run build && npm run preview`. In production, serve over **HTTPS**.

> **Don't serve the source directory with a plain static server.** This used to be a
> no-build app where `python3 -m http.server` worked; it isn't anymore. `index.html` now
> loads `/src/main.tsx`, which Vite has to transpile first — a static server hands the raw
> file over as `application/octet-stream` and the browser fails with
> _"'application/octet-stream' is not a valid JavaScript MIME type."_
> Use `npm run dev` for development, or `npm run build` and serve `dist/`.

If `npm` isn't found, load nvm in your shell first: `source ~/.bashrc` (or open a new
terminal). This repo builds with the Node version in nvm's `default` alias.

## Docker

No local Node needed — the build happens inside the image.

```bash
docker compose up web --build          # http://localhost:8080
```

That builds the app and serves `dist/` with nginx. For a dev server with hot reload
inside a container instead (source is bind-mounted):

```bash
docker compose --profile dev up dev    # http://localhost:5173
```

Override ports with `WEB_PORT` / `DEV_PORT`, e.g. `WEB_PORT=3000 docker compose up web`.

Without Compose:

```bash
docker build -t matchpoint-frontend .
docker run --rm -p 8080:80 matchpoint-frontend
```

| File | Role |
|---|---|
| `Dockerfile` | Multi-stage: `node:24-alpine` builds, `nginx:1.27-alpine` serves (~74 MB final image) |
| `nginx.conf` | SPA fallback, cache headers, gzip, `.webmanifest` MIME type |
| `docker-compose.yml` | `web` (production) and `dev` (Vite HMR, under the `dev` profile) |
| `.dockerignore` | Keeps `node_modules`, `dist`, and `.git` out of the build context |

The build stage runs `npm run build`, which typechecks first — a type error fails the
image build rather than shipping.

**Caching.** Hashed files under `/assets/` are served `immutable` for a year; `index.html`,
`sw.js`, `registerSW.js`, and the manifest are `no-cache`. That split matters: a cached
`sw.js` or `index.html` pins clients to an old build with no way to update itself.

**Talking to the backend.** The container serves static files only. Set the API base URL
at runtime in **Settings → Backend connection** (it lives in `localStorage`, so there is no
build-time env var), and allow the front-end origin in Django's `CORS_ALLOWED_ORIGINS` —
e.g. `http://localhost:8080`. Alternatively, put both behind one origin and proxy `/api`
to Django from nginx, which avoids CORS entirely.

## Project layout

```
index.html              Vite entry: #root plus the anti-flash theme script
vite.config.ts          Build config + PWA manifest/service-worker generation
Dockerfile              Multi-stage build → nginx
nginx.conf              Static-serving config used by the image
docker-compose.yml      web (production) + dev (Vite HMR) services
make_icons.py           Regenerates public/icons/ from icon-512.png
public/icons/           PWA icons (any + maskable + apple-touch + favicons)
src/
  main.tsx              Provider tree
  App.tsx               HashRouter + routes + auth gate
  types.ts              Backend response shapes
  styles/global.css     The whole design system, including the dark-theme tokens
  lib/                  store (localStorage), api (fetch + JWT), demo data, formatters
  i18n/                 en.ts / bg.ts dictionaries + I18nProvider
  theme/                ThemeProvider (light/dark)
  context/              Auth, Settings, Toast, Modal providers
  components/           Shell, Icons, Chip, ToggleRow, States, staff modals
  pages/                One file per view (see the routes table below)
  hooks/                useAsync, useInstallPrompt
```

### Routes

Routing is **hash-based** (`#/clubs`) because the PWA manifest shortcuts point at
`/?source=pwa#/clubs` and `#/reservations`.

| Route | Page file |
|---|---|
| _(unauthenticated)_ | `pages/AuthPage.tsx` |
| `#/clubs` | `pages/ClubsPage.tsx` |
| `#/clubs/:id` | `pages/ClubDetailPage.tsx` |
| `#/courts/:id` | `pages/CourtDetailPage.tsx` |
| `#/reservations` | `pages/ReservationsPage.tsx` |
| `#/profile` | `pages/ProfilePage.tsx` |
| `#/settings` | `pages/SettingsPage.tsx` |

## Connect to the backend

The app opens in **Demo mode** (sample Sofia clubs, any email/password works) so the
design is usable immediately. To use your real API:

1. Start the Django backend (`python manage.py runserver` → `http://localhost:8000`).
2. In the app go to **Settings → Backend connection** and set the API base URL.
3. Turn **Demo mode off**.

> CORS: allow the front-end origin on the Django side (e.g. `django-cors-headers`,
> `CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]`).

Auth is JWT: the app calls `POST /api/token/`, stores the access/refresh pair, sends
`Authorization: Bearer …`, and silently refreshes via `POST /api/token/refresh/` on 401.
All of that lives in `src/lib/api.ts`, which also serves the demo fixtures so every screen
works without a server.

## Every backend feature has a button

| Backend endpoint | Where in the UI |
|---|---|
| `POST /api/token/`, `/api/token/refresh/` | Sign in screen; automatic refresh |
| `POST /api/v1/auth/registration` | **Create account** tab |
| `GET /api/v1/auth/google/` | **Continue with Google** button |
| `GET /api/clubs/` | Clubs grid (home) |
| `GET /api/clubs/{id}/` | Club detail header |
| `GET /api/clubs/{id}/courts/` | Court cards on club page |
| `GET · POST /api/clubs/{id}/opening-hours/` | Opening-hours panel · **Add opening hours** (staff) |
| `GET /api/clubs/{id}/employees/` | **View staff** modal (staff) |
| `PATCH /api/clubs/{id}/` | **Edit club** modal (staff) |
| `GET /api/courts/{id}/` | Court detail header |
| `GET /api/courts/{id}/availabilities/?date=` | The **booking scoreboard** (date picker → slots) |
| `GET · PUT /api/courts/{id}/prices/` | **Set prices** modal (staff) |
| `GET · PUT /api/courts/{id}/unavailabilities/` | **Block time** modal (staff) |
| `POST /api/courts/` | **New court** modal (staff) |
| `PATCH /api/courts/{id}/` | **Edit court** modal (staff) |
| `DELETE /api/courts/{id}/` | **Delete** court (staff) |
| `GET /api/reservations/` | **Reservations** tab (own; all if staff) |
| `POST /api/reservations/` | **Book** button after selecting slots |
| `DELETE /api/reservations/{id}/` | **Cancel** on an upcoming booking |
| `PATCH /api/reservations/{id}/` | `api.updateReservation` — exposed for the reschedule path, no screen calls it yet |

**Staff view** (Settings → Staff view) reveals the management buttons. On the real
backend those endpoints enforce their own permissions, so non-staff accounts get a clear
error toast rather than a broken action.

## Booking flow

Court page → pick a day (14-day strip) → the grid loads live 30-minute slots
(`availabilities?date=`). Tap consecutive open slots; the sticky summary totals the price
and **Book** sends one reservation spanning the selection. Non-consecutive selections
disable the button. The backend rejects clashes (`CourtBusyException`), surfaced as a toast.

## Theme and language

- **Theme**: light/dark, toggled from the top bar or Settings → Appearance. On a first
  visit it follows the OS `prefers-color-scheme`, then persists in `localStorage`
  (`mp_theme`). An inline script in `index.html` applies it before first paint so there is
  no flash of the wrong theme.
- **Language**: English and Bulgarian, toggled from the top bar or Settings, persisted as
  `mp_lang`. Dates and weekday names localize with the UI.
- Adding a string means adding a key to `src/i18n/en.ts`; `bg.ts` is typed as
  `Record<TranslationKey, string>`, so a missing translation is a **compile error**.

## PWA notes

- `display: standalone`, theme color `#7bc133`, maskable icons, and app shortcuts
  (**Book a court**, **My reservations**).
- The service worker and manifest are generated at build time by `vite-plugin-pwa`, so the
  precache list always matches the hashed build output. **API calls always hit the network**
  (`NetworkOnly` for `/api/`) so availability and bookings are never stale; fonts use
  stale-while-revalidate.
- Install: Chrome/Edge show an install icon in the address bar (and the in-app
  **Install** button); on iOS use **Share → Add to Home Screen**.

## Regenerate icons

```bash
pip install Pillow
python3 make_icons.py
```

Regenerates every size in `public/icons/` from `icon-512.png`, padding the maskable
variants into Android's safe zone.
