<<<<<<< HEAD
# EcoGuard — Frontend Web App

React + Vite SPA for the EcoGuard environmental reporting platform. Provides the public reporting interface, the citizen tracking page, and the authority dashboard.

## Stack

- **React 18** + **React Router**
- **Vite** (dev server + build)
- **Leaflet** (interactive maps via OpenStreetMap)
- **Bilingual i18n** — English + Arabic (RTL) via [src/i18n.jsx](src/i18n.jsx)
=======
# EcoGuard — Backend API

FastAPI service for the EcoGuard environmental reporting platform. Owns all data, authentication, and business logic for citizen reports and the authority review workflow.

## Stack

- **FastAPI** (HTTP API)
- **SQLAlchemy** (ORM)
- **python-jose** (JWT authentication)
- **PostgreSQL** via Supabase (production) — auto-seeds 10 demo reports on first launch
>>>>>>> 52f3217 (add backend-api)

## Quick start

```bash
<<<<<<< HEAD
npm install
npm run dev
```

Runs at `http://localhost:3000`. Vite proxies `/api/*` to the backend (configured in [vite.config.js](vite.config.js)).

## Build

```bash
npm run build      # output → dist/
npm run preview    # serve the built bundle locally
```

## Pages

| Route | Page | Audience |
|-------|------|----------|
| `/` | Home — map, filters, latest reports, notices | Public |
| `/submit` | Submit Report — form with map pin + image upload | Public |
| `/track` | Track Report — lookup by CIN + reference | Public |
| `/login` | Authority Login | Officers |
| `/authority` | Dashboard — stats, filters, table | Officers (JWT) |
| `/authority/reports/:id` | Report Detail — review controls, notes, activity log | Officers (JWT) |

## Components

- [MapView.jsx](src/components/MapView.jsx) — color/size-coded report markers
- [LocationPicker.jsx](src/components/LocationPicker.jsx) — click-to-pin map for submissions
- [Legend.jsx](src/components/Legend.jsx) — category colors + urgency sizes
- [Navbar.jsx](src/components/Navbar.jsx) — top navigation with language toggle
- [SceneBg.jsx](src/components/SceneBg.jsx) — animated SVG nature backgrounds

## Backend connection

[src/api.js](src/api.js) holds all `fetch` calls. The `API` constant at the top is the base URL (empty string = use the Vite proxy in dev, same-origin in production behind a reverse proxy).

## Deployment

Deployed via Vercel as a static SPA. SPA fallback configured in [vercel.json](vercel.json) so client-side routes resolve correctly on refresh.
=======
pip install -r requirements.txt
cp .env.example .env       # then edit with your DB credentials
python main.py
```

API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

## Endpoints

| Group | Routes |
|-------|--------|
| Public | `GET /api/config`, `GET /api/reports/public`, `GET /api/notices`, `POST /api/reports/submit`, `GET /api/reports/lookup` |
| Auth | `POST /api/auth/login` |
| Authority (JWT-protected) | `GET /api/authority/reports`, `GET/PATCH /api/authority/reports/{id}`, `POST /api/authority/reports/{id}/notes`, `POST /api/authority/reports/{id}/images`, `GET /api/authority/stats` |

## Data model

Six tables: `reports`, `report_images`, `report_notes`, `status_history`, `officers`, `public_notices`. See [models.py](models.py) for the full schema.

Reports have two independent status dimensions:
- **Verification**: `Pending` → `Approved` / `Rejected`
- **Resolution** (approved only): `Ongoing` → `In Progress` → `Resolved`

## Deployment

Deployed via Railway using Nixpacks. Configuration files: [Procfile](Procfile), [nixpacks.toml](nixpacks.toml), [railway.json](railway.json), [runtime.txt](runtime.txt).

## Environment

```
DATABASE_URL=postgresql://user:pass@host:port/db
```

A default Supabase URL is hardcoded in [models.py](models.py) as a fallback for local development.
>>>>>>> 52f3217 (add backend-api)
