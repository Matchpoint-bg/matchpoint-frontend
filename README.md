# MatchPoint — Web App + PWA

A front-end for the [MatchPoint Django REST backend](https://github.com/Corentin-dupriez/matchpoint).
Single-page app, no build step, installable as a PWA. Design theme: **floodlit night court**,
built on the tennis-ball palette `#7bc133 · #92d250 · #acdf77 · #c3e69e · #dff6c8`.

## Files

```
index.html              The whole app (HTML + CSS design system + JS)
manifest.webmanifest    PWA manifest (name, icons, shortcuts, theme)
sw.js                   Service worker (offline app-shell cache; never caches /api)
icons/                  Tennis-ball icons (any + maskable + apple-touch + favicons)
make_icons.py           Script that generates the icons (optional, for regeneration)
```

## Run it

A PWA needs to be **served over HTTP(S)** (service workers don't run from `file://`).

```bash
cd matchpoint
python3 -m http.server 5173
# open http://localhost:5173
```

For install/offline to work in production, serve over **HTTPS**.

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
| `PATCH /api/reservations/{id}/` | Used by the reschedule path in the client |

**Staff view** (Settings → Staff view) reveals the management buttons. On the real
backend those endpoints enforce their own permissions, so non-staff accounts get a clear
error toast rather than a broken action.

## Booking flow

Court page → pick a day (14-day strip) → the grid loads live 30-minute slots
(`availabilities?date=`). Tap consecutive open slots; the sticky summary totals the price
and **Book** sends one reservation spanning the selection. The backend rejects clashes
(`CourtBusyException`), surfaced as a toast.

## PWA notes

- `display: standalone`, theme color `#7bc133`, maskable icons, and app shortcuts
  (**Book a court**, **My reservations**).
- The service worker caches the app shell for offline launch and uses
  stale-while-revalidate for fonts; **API calls always hit the network** so availability
  and bookings are never stale.
- Install: Chrome/Edge show an install icon in the address bar (and the in-app
  **Install** button); on iOS use **Share → Add to Home Screen**.

## Regenerate icons

```bash
pip install Pillow
python3 make_icons.py
```
