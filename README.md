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

`npm run dev` reads `.env.development`, which turns **demo mode on** — the whole UI works
with no backend running. Copy `.env.example` to `.env.local` to point dev at a different
API. Demo mode is a build-time decision: an ordinary production build compiles it out
entirely, so a deployed app can never serve fixtures or accept a fake login. Building with
`VITE_DEMO=1` opts a specific image in — see [Running it with no backend at all](#docker).

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

That builds the app and serves `dist/` with nginx. Keep the `--build`: the bundle is
compiled into the image, so a plain `docker compose up -d` reuses whatever was built
last and silently serves stale source. If a rebuilt page still looks old, the PWA
service worker is caching it — hard-reload, or unregister it under DevTools →
Application.

For a dev server with hot reload
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
| `nginx.conf` | SPA fallback, `/api/` proxy, security headers, cache headers, gzip, `.webmanifest` MIME type. Copied in as an envsubst **template** so `API_ORIGIN` is settable per-deployment |
| `docker-compose.yml` | `web` (production) and `dev` (Vite HMR, under the `dev` profile) |
| `.dockerignore` | Keeps `node_modules`, `dist`, and `.git` out of the build context |

The build stage runs `npm run build`, which typechecks first — a type error fails the
image build rather than shipping.

**Caching.** Hashed files under `/assets/` are served `immutable` for a year; `index.html`,
`sw.js`, `registerSW.js`, and the manifest are `no-cache`. That split matters: a cached
`sw.js` or `index.html` pins clients to an old build with no way to update itself.

**Security headers.** nginx sends `X-Frame-Options: DENY`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`, and a `Content-Security-Policy` that allows only
this origin plus Google Fonts. Locations that set their own `Cache-Control` via `add_header`
must repeat them — nginx's `add_header` replaces inherited headers rather than merging, which
is why most cache rules use `expires` instead.

**Talking to the backend.** Two options, both configured at deploy time — there is no
user-facing API-URL field in production:

1. **Same origin (default, recommended).** Build with an empty `VITE_API_URL`; the app calls
   `/api/…` on its own origin and nginx proxies that to `API_ORIGIN`. No CORS at all.
   ```bash
   API_ORIGIN=http://host.docker.internal:8000 docker compose up web --build
   ```
2. **Cross-origin.** Bake in an absolute base URL, add the front-end origin to Django's
   `CORS_ALLOWED_ORIGINS`, and widen the CSP so the browser is allowed to reach it:
   ```bash
   VITE_API_URL=https://api.example.com \
   CSP_CONNECT_SRC="'self' https://api.example.com" \
   docker compose up web --build
   ```

**Running it with no backend at all.** `npm run dev` already does this — `.env.development` sets
`VITE_DEMO=1`, so the dev server at :5173 serves the demo fixtures. For the built app, make a demo
image:

```bash
VITE_DEMO=1 docker compose up --build web    # http://localhost:8080, no API required
```

Everything works against sample Sofia clubs: sign in with any email and password, book, cancel,
reschedule. A **Demo data** badge sits in the header the whole time, and Settings gains the dev
controls (demo off, staff view, API URL) so the same image can be pointed at a real backend. This is
a build-time switch — an image built without `VITE_DEMO=1` cannot be talked into serving fixtures,
whatever is in `localStorage`.

| Variable | Where it applies | Default |
|---|---|---|
| `VITE_API_URL` | Build arg, baked into the bundle | empty (same origin) |
| `API_ORIGIN` | Container env, nginx `/api/` proxy target | `http://host.docker.internal:8000` |
| `CSP_CONNECT_SRC` | Container env, CSP `connect-src` | `'self'` |
| `VITE_DEMO` | Build/dev env, `1` builds a demo image that runs on fixtures | `0` (a build without it can never serve fixtures) |

## Project layout

```
index.html              Vite entry: #root plus the anti-flash theme script
vite.config.ts          Build config + PWA manifest/service-worker generation
Dockerfile              Multi-stage build → nginx
nginx.conf              Static-serving config used by the image
docker-compose.api.yml  Overlay adding Postgres + the Django API, for the full stack
scripts/seed_api.py     Demo clubs/courts/hours/prices/logins for the local backend
docker-compose.yml      web (production) + dev (Vite HMR) services
make_icons.py           Regenerates public/icons/ from icon-512.png
public/icons/           PWA icons (any + maskable + apple-touch + favicons)
.env.example            Documented build/runtime variables — copy to .env.local
.env.development        Dev defaults (demo mode on)
src/
  app/                  App composition: providers, router, guards, shell
  pages/                Route-level composition; no API implementations
  features/             Vertical slices: auth, clubs, courts, booking, staff, etc.
    <feature>/api/       HTTP/demo operations for that domain
    <feature>/model/     Types, query keys, hooks, mutations, state logic
    <feature>/ui/        Feature components with colocated CSS modules
    <feature>/index.ts   Public API used outside the feature
  shared/               Domain-neutral API, storage, utilities, hooks and UI
  demo/                 Development fixtures and demo persistence
  styles/               Tokens and cross-app layout/design primitives by concern
  i18n/                 en.ts / bg.ts dictionaries + I18nProvider
  theme/                ThemeProvider (light/dark)
  main.tsx              Mounts AppProviders and App
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for dependency, export, and TanStack Query rules.

### Routes

Routing is **hash-based** (`#/clubs`) because the PWA manifest shortcuts point at
`/?source=pwa#/clubs` and `#/reservations`.

| Route | Page file | Access |
|---|---|---|
| `#/login` | `pages/auth/AuthPage.tsx` | signed out |
| `#/forgot-password` | `pages/forgot-password/ForgotPasswordPage.tsx` | signed out |
| `#/reset-password/:uid/:token` | `pages/reset-password/ResetPasswordPage.tsx` | signed out |
| `#/players` | `pages/clubs/ClubsPage.tsx` | public |
| `#/search` | `pages/clubs/ClubResultsPage.tsx` | public |
| `#/clubs/:id` | `pages/club-details/ClubDetailsPage.tsx` | public |
| `#/courts/:id` | `pages/court-details/CourtDetailsPage.tsx` | public; reschedule only |
| `#/book/:courtId/review` | `pages/booking-review/BookingReviewPage.tsx` | public |
| `#/book/:courtId/checkout` | `pages/booking-checkout/BookingCheckoutPage.tsx` | signed in |
| `#/booking/confirmation/:id` | `pages/booking-confirmation/BookingConfirmationPage.tsx` | signed in |
| `#/for-clubs` | `pages/for-clubs/ForClubsPage.tsx` | public |
| `#/club`, `#/club/schedule`, `#/club/bookings`, `#/club/courts`, `#/club/team`, `#/club/settings` | `pages/club/*` | staff |
| `#/reservations` | `pages/reservations/ReservationsPage.tsx` | signed in |
| `#/profile` | `pages/profile/ProfilePage.tsx` | signed in |
| `#/settings` | `pages/settings/SettingsPage.tsx` | signed in |
| anything else | `pages/not-found/NotFoundPage.tsx` | public |

`RequireAuth` in `src/app/router/RouteGuards.tsx` bounces signed-out visitors to `#/login` and remembers where they
were headed, so a deep link survives the detour. A stored token is verified against
`GET /api/v1/auth/user/` on boot: an expired or hand-edited one lands on the sign-in screen
instead of an app where every request 401s.

> **Password-reset emails.** Routing is hash-based, so Django's reset email must link to
> `<site>/#/reset-password/<uid>/<token>`.

## Run the whole stack

`docker-compose.api.yml` is an overlay that brings up Postgres, the
[MatchPoint API](https://github.com/Corentin-dupriez/matchpoint) and this front end together.
Check the API out as a sibling directory (`../matchpoint-api`, or set `API_PATH`) and:

```bash
docker compose -f docker-compose.yml -f docker-compose.api.yml up --build
```

| | |
|---|---|
| App | <http://localhost:8080> |
| API | <http://localhost:8000/api/> |
| Swagger | <http://localhost:8000/api/schema/swagger-ui/> |
| Django admin | <http://localhost:8000/admin/> |

The API container runs migrations, seeds demo data, then starts the dev server. Nothing is
written into the API checkout — its settings module reads everything from the environment,
which the overlay supplies, so that repository stays exactly as cloned.

**Seed data.** `scripts/seed_api.py` is mounted read-only into the API container and creates
three Sofia clubs with courts, seven-day opening hours and peak/off-peak prices, plus these
logins (password `matchpoint` for all of them):

| Email | Role |
|---|---|
| `player@matchpoint.bg` | Ordinary player |
| `admin@matchpoint.bg` | Django superuser — sees the club workspace and every booking |
| `staff@lozenets.example`, `staff@center.example`, `staff@vitosha.example` | Employee of that one club |

It is idempotent, so a restart tops the data up rather than duplicating it. `SEED=0` skips it.
To reseed by hand at any point:

```bash
docker compose -f docker-compose.yml -f docker-compose.api.yml \
  exec -T api python manage.py shell < scripts/seed_api.py
```

`docker compose … down -v` drops the `pg-matchpoint` volume and starts over from empty.

For the Vite dev server against the same backend, with hot reload and demo mode off:

```bash
docker compose -f docker-compose.yml -f docker-compose.api.yml --profile dev up dev
```

## Connect to the backend

In development the app opens in **Demo mode** (sample Sofia clubs, any email/password
works) so the design is usable immediately. To develop against your real API:

1. Start the Django backend (`python manage.py runserver` → `http://localhost:8000`, or the
   stack above).
2. Run the dev server with fixtures off — `VITE_DEMO=0 npm run dev` — or turn **Demo mode off**
   in **Settings** (a card that exists only on the dev server and in demo images, alongside the
   API base URL).

> CORS: allow the front-end origin on the Django side (e.g. `django-cors-headers`,
> `CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]`). Deployments can skip this by using
> the same-origin `/api/` proxy described under Docker.

Auth is JWT: the app calls `POST /api/v1/auth/login/`, stores the access/refresh pair, sends
`Authorization: Bearer …`, and refreshes via `POST /api/v1/auth/token/refresh/` on 401. If that
refresh is rejected the tokens are cleared and the app returns to the sign-in screen. All of
that is split between `src/shared/api/httpClient.ts`, feature API modules, and `src/demo/`.
TanStack Query owns server-state caching and invalidation.

> **Tokens live in `localStorage`**, which means any XSS on this origin can read them. The
> CSP is the mitigation; moving to httpOnly cookies would be the structural fix.

## Every backend feature has a button

| Backend endpoint | Where in the UI |
|---|---|
| `POST /api/v1/auth/login/`, `/api/v1/auth/token/refresh/` | Sign in screen; automatic refresh |
| `POST /api/v1/auth/registration/` | **Create account** tab |
| `GET · PATCH /api/v1/auth/user/` | Profile page · **Edit profile** modal (also the boot-time token check) |
| `POST /api/v1/auth/password/change/` | **Change password** modal on the profile |
| `POST /api/v1/auth/password/reset/` | **Forgot password?** on the sign-in screen |
| `POST /api/v1/auth/password/reset/confirm/` | The link in the reset email |
| `GET /api/v1/auth/google/` | **Continue with Google** button |
| `GET /api/clubs/` | Clubs grid (home) |
| `GET /api/clubs/{id}/` | Club detail header |
| `GET /api/clubs/{id}/courts/` | Court cards on club page |
| `GET · POST /api/clubs/{id}/opening-hours/` | Opening-hours panel · **Add opening hours** (staff) |
| `GET /api/clubs/{id}/employees/` | **View staff** modal (staff) |
| `PATCH /api/clubs/{id}/` | **Edit club** modal (staff) |
| `GET /api/courts/{id}/` | Court detail header |
| `GET /api/courts/{id}/availabilities/?date=` | The **booking scoreboard** — one call per court, fanned out by `availabilityApi.club` to build a club-wide grid |
| `GET · PUT /api/courts/{id}/prices/` | **Set prices** modal (staff) |
| `GET · PUT /api/courts/{id}/unavailabilities/` | **Block time** modal (staff) |
| `POST /api/courts/` | **New court** modal (staff) |
| `PATCH /api/courts/{id}/` | **Edit court** modal (staff) |
| `DELETE /api/courts/{id}/` | **Delete** court (staff) |
| `GET /api/reservations/` | **Reservations** tab (own; all if staff) |
| `POST /api/reservations/` | **Confirm booking** on the review page |
| `DELETE /api/reservations/{id}/` | **Cancel** on an upcoming booking |
| `PATCH /api/reservations/{id}/` | **Reschedule** on an upcoming booking |

**Staff UI** is driven by `is_staff` / `is_superuser` on the user the server returns, exposed
as `isStaff` from `useAuth()`. Dev builds can force it on with **Settings → Staff view**;
that toggle does not exist in production. The backend still enforces the real permissions —
this only decides what gets rendered.

## Booking flow

Search on `#/players` → results on `#/search` → a club page that opens with its own availability
grid (`ClubAvailability`, one row per court for the chosen day). Tap consecutive open slots; the
summary totals the price and **Review** carries the selection to `#/book/:courtId/review` as a
`BookingIntent` in `sessionStorage`, so a reload or the sign-in detour does not lose it. Signing in
happens in a modal, not a separate screen.

Nothing is booked until **Confirm** on `#/book/:courtId/checkout`. `useBookingIntentValidation`
re-checks the run against fresh availability first, a `useRef` latch means one request per confirm,
and the reservation's id is looked up from the list when the POST response omits it
(`useResolveReservationId`). Success lands on `#/booking/confirmation/:id`, which paints from the
stored snapshot and re-reads the reservation from the API, so the URL survives a reload in any tab.

There is no temporary hold: the backend has no `HELD` state, so the app shows no countdown and
claims nothing is reserved before confirm. Payment is on site — reservation-only MVP.

**Reschedule** reuses the same screen: the button on an upcoming reservation opens
`#/courts/<court>?reschedule=<id>`, which swaps the confirm action from `POST` to
`PATCH /api/reservations/{id}/` and shows a banner explaining the mode.

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

## Where the API stops short

Found while wiring this front end to the backend on `main`. None of it is fixable from here;
each one has a defined behaviour in the UI rather than a blank screen.

- **No club-wide availability endpoint.** `/api/clubs/{id}/availability/` is a 404, so
  `src/features/booking/api/availability.api.ts` assembles the same shape from
  `/api/clubs/{id}/courts/` plus one `/api/courts/{id}/availabilities/` per court, in parallel.
  A club closed on the chosen weekday answers 400 per court; that is read as "no slots", not
  as an error.
- **Slots carry no `status`.** `CourtOpeningSerializer` sends `{start, end, available, price}`
  only. `normalizeSlots` derives past/booked/available from `end` and `available`, which is
  what the selection logic reads. The API cannot distinguish a reservation from an exceptional
  closure, so both show as booked.
- **The user serializer has no id.** `/api/v1/auth/user/` returns no `pk` and `/api/users/` is
  admin-only, so `shared/api/session.ts` reads `user_id` out of the JWT — otherwise editing
  your own profile has no URL to PATCH.
- **`/api/openinghours/{pk}/` rejects everyone.** `IsClubEmployeeOrAdmin.has_object_permission`
  only answers for `Club` and `Court` objects and returns `None` for anything else, which DRF
  treats as denied — so PATCH and DELETE 403 even for a superuser. The same applies to
  `/api/pricing/{pk}/` and `/api/unavailabilities/{pk}/`. Adding hours to a day that has none
  still works (that is a POST on the club). The editor says so instead of showing the
  misleading permission text.
- **`/api/clubs/{id}/employees/` requires `IsAdminUser`,** so a club's own manager cannot list
  their colleagues — only a Django superuser can.
- **No "clubs I work for" endpoint,** so the club workspace lists every club and asks the
  operator to pick one (`useStaffClub`).
- **`GET /api/clubs/` has no ordering,** so Postgres returns the rows in whatever order it
  likes; `clubsApi.list` sorts by name to keep the grid stable between refetches.
- **Password reset needs an email backend.** Django's default is SMTP, which the local stack
  has none of, so `POST /api/v1/auth/password/reset/` fails there.
- Clubs carry no `facilities`, `gallery_urls`, `cancellation_policy` or `starting_price`; the
  UI falls back to platform defaults or hides those blocks. `header_image` from the list
  serializer is mapped onto `thumbnail_url`.

## Known gaps

Deliberately out of scope so far, in rough priority order:

- **Accessibility.** The modal has dialog semantics but no focus trap or Escape-to-close;
  there's no global `:focus-visible` ring or
  `prefers-reduced-motion` handling.
- **Validation in the staff modals.** An empty price field still POSTs `NaN`, and no modal
  checks that an end time is after its start.
- **No tests, linter, or CI.** `tsc --noEmit` (run by `npm run build`) is the only gate.
- **No error telemetry.** Failures are toasts and console output; nothing is reported.
- **No code splitting.** Every page is in one bundle, including the staff-only modals.
- **SEO.** Hash routing plus client rendering means nothing is indexable; there are no
  Open Graph or Twitter tags.
- The demo fixtures are still bundled in production builds (unreachable — `store.demo` is
  hard-false there — but not tree-shaken, since the branch is a runtime check).
