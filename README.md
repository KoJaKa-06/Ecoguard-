# EcoGuard - Environmental Reporting System
### Ifrane Region, Morocco

An environmental reporting and monitoring platform built for the Ifrane region. Citizens can submit and track environmental reports, while authority officers review, verify, and manage them through a dedicated dashboard.

---

## Screenshots

### Public Home Page
![Home Page](project-docs/screenshots/01-home.png)

### Home Page — Expanded Report
![Home Expanded](project-docs/screenshots/02-home-expanded.png)

### Submit Report — Guest Submission with Map Picker
![Submit Report](project-docs/screenshots/03-submit-report.png)

### Track Report — Lookup by CIN & Reference
![Track Report](project-docs/screenshots/04-track-report.png)

### Track Report — Result View
![Track Result](project-docs/screenshots/05-track-result.png)

### Authority Login
![Authority Login](project-docs/screenshots/06-authority-login.png)

### Authority Dashboard — Stats, Map, Filters
![Dashboard](project-docs/screenshots/07-dashboard.png)

### Authority Dashboard — Reports Table
![Dashboard Table](project-docs/screenshots/08-dashboard-table.png)

### Report Detail — Review Controls, Notes, Activity Log
![Report Detail](project-docs/screenshots/09-report-detail.png)

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Authority Officer | `authority@ifrane.ma` | `admin123` |

---

## Database (Supabase PostgreSQL)

| Field | Value |
|-------|-------|
| Provider | Supabase (PostgreSQL) |
| Project URL | `https://fbenxxnclsxztfrfpmjs.supabase.co` |
| Connection | Pooler via `aws-0-eu-west-1.pooler.supabase.com:6543` |
| Database | `postgres` |

### Tables

| Table | Purpose |
|-------|---------|
| `reports` | Core report data (category, location, verification, resolution, urgency, coordinates) |
| `report_images` | Multiple images per report, with primary flag |
| `report_notes` | Timeline of public/internal notes with author tracking |
| `status_history` | Audit trail — who changed what, when, old/new values |
| `officers` | Authority user accounts |
| `public_notices` | Public announcements displayed on home page |

### Status Model

Reports have two independent status dimensions:

| Dimension | Values | Meaning |
|-----------|--------|---------|
| **Verification** | Pending → Approved / Rejected | Is the report legitimate? |
| **Resolution** | Ongoing → In Progress → Resolved | What's happening with the issue? (Approved reports only) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router, Leaflet (maps), Vite |
| Backend | FastAPI, SQLAlchemy, python-jose (JWT) |
| Database | Supabase PostgreSQL (via connection pooler) |
| Map | OpenStreetMap tiles via Leaflet |

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend-api
pip install -r requirements.txt
python main.py
```

The API runs at `http://localhost:8000`. Database auto-seeds with 10 demo reports on first launch.

### Frontend

```bash
cd frontend-web
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and proxies API requests to the backend.

---

## Pages & Features

### Public Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Interactive map with color/size-coded markers, urgency-sorted report list with selection-to-top, expandable note timelines, public notices, Atlas Mountains background. Reports older than 30 days hidden automatically. |
| Submit Report | `/submit` | Guest submission with map location picker (click to pin) — **location auto-detected from coordinates**, no dropdown to fill. Multi-image upload (up to 5). "What happens next" timeline + live community count in the sidebar. |
| Track Report | `/track` | Lookup by CIN + reference number, shows verification/resolution status, urgency, and public notes. |
| Authority Login | `/login` | Officer authentication with demo credentials, dedicated layout (no global navbar) with single language toggle. |

### Authority Pages (requires login)

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/authority` | Three sectioned views (Pending / Active / Done — collapsible), animated stat cards with share bars, live polling every 30s with toast notifications for new pending reports, urgency-sorted within each section, map with category-icon markers + pulsing rings on Critical urgencies. |
| Report Detail | `/authority/reports/:id` | Full review panel with image gallery, notes timeline, activity log, status controls. One-click Reject button (no longer requires filling other fields). |
| Notices | `/authority/notices` | Manage public notices — publish new ones (title + content), delete existing. Notices appear on the public Home page in real time. |

### Key Features

- **Bilingual UI** — full English + Arabic translation with proper RTL layout flipping (`<html dir="rtl">`); Inter font for English, Cairo for Arabic.
- **Auto-location detection** — Submit page does Voronoi-style nearest-neighbor matching: click anywhere on the map and the report's `location` field is auto-set to the closest of the 10 named Ifrane regions. No dropdown to fill.
- **Live notification polling** — Dashboard polls `/api/authority/reports` every 30s; new pending reports trigger a glassmorphic toast (top-right) and a pulse ring on the Pending section header.
- **Sectioned report workflow** — instead of one flat table, the dashboard splits reports into Pending Review (FIFO oldest-first), Active (urgency-sorted, ongoing-first), and Done (collapsed by default). Each section has a colored accent bar header.
- **30-day relevance filter** — both the public Home and the authority Dashboard automatically hide reports older than 30 days from list, map, and stats — no clutter from old archived events.
- **Selection-to-top + auto-scroll** — clicking any report (card on Home, row on Dashboard, or marker on the map) promotes it to the top of the list, highlights it with a teal gradient + glow border, and scrolls it into view. If it's in the collapsed Done section, that section auto-expands first.
- **Expandable public note timeline** — on Home, when a report has multiple updates, click "+N more updates" to see the full timeline of public officer notes with author + timestamp.
- **Authority-managed public notices** — officers can publish/delete announcements on the home page from `/authority/notices`.
- **Map location picker** — reporters click on a map to pin exact coordinates with animated drop-pin marker.
- **Multi-image upload** — up to 5 photos per report with preview thumbnails.
- **Two-status model** — verification (Pending/Approved/Rejected) + resolution (Ongoing/In Progress/Resolved).
- **Notes timeline** — officers add public/internal notes without overwriting history.
- **Status audit trail** — every change logged with officer name, timestamp, old/new values; includes who changed what and when in the Activity Log on each report detail page.
- **Image gallery with lightbox** — click thumbnails to zoom.
- **Responsive design** — works on laptop and mobile.
- **Interactive SVG backgrounds** — unique nature scenes per page (mountains, forest, lake, snow).

### Map Features

- **Category-icon markers** — each report's marker shows its category emoji (🔥 Wildfire, ☣ Pollution, ❄ Snow Closure, 🗑 Illegal Dumping, 💧 Water Contamination, 🌲 Deforestation) inside a color-coded circle.
- **Color + size + animation triple cue** — color encodes category; size encodes urgency (Critical 22px → Low 12px); **Critical urgency markers have an animated pulsing ring** that draws the eye immediately.
- **Gradient marker fills** — each marker has a subtle linear gradient instead of a flat color.
- **Legend** showing color and size mappings.
- **Click markers** to see report summary popup.
- **Bidirectional selection** — clicking a report highlights its marker, and clicking a marker promotes the report to the top of the list with a teal flash highlight.

### UI / UX Design

- **Glassmorphic cards and stat panels** — `backdrop-filter: blur(8px)` over a multi-blob mesh-gradient background (teal / blue / amber / green radials over slate base).
- **Animated stat counters** — numbers count up from 0 with `easeOutCubic` over ~700ms when stats load.
- **Mini share bars** — under each stat card, a 4px gradient bar shows the stat's proportion of the relevant total (e.g. Pending as % of Total).
- **Frosted live-notification toast** — slides in from the right with `cubic-bezier(0.16, 1, 0.3, 1)` easing, glass background, auto-dismisses after 6s.
- **Process timeline on Submit** — vertical 4-step timeline ("You submit → Officer reviews → Visible on map → Resolution updates") with the current step highlighted in pulsing teal.
- **Premium typography** — Inter font (English) and Cairo font (Arabic) loaded from Google Fonts, antialiased, tight letter-spacing.
- **Custom scrollbar** — slate gradient that turns teal on hover.
- **Sidebar polish** — gradient hover state with a 3px teal accent bar that scales in from top to bottom; active item has a glowing accent.
- **Gradient buttons** — three-stop diagonal gradients with inner highlights and color-tinted shadows that intensify on hover.

---

## Environment Variables

The backend uses a `.env` file:

```
DATABASE_URL=postgresql://postgres.fbenxxnclsxztfrfpmjs:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://fbenxxnclsxztfrfpmjs.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_KEY=sb_secret_...
```

---

## Project Structure

```
Ecoguard-/
├── README.md                  # This file — project overview
├── backend-api/               # Person 1 — FastAPI service
│   ├── main.py                # All endpoints
│   ├── models.py              # SQLAlchemy models (6 tables)
│   ├── seed_data.py           # Demo data seeder
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Database config template
│   ├── Procfile, nixpacks.toml, railway.json, runtime.txt   # Railway deployment
│   └── README.md              # Backend-scoped docs
├── frontend-web/              # Person 2 — React + Vite SPA
│   ├── public/logo.svg
│   ├── src/
│   │   ├── api.js, App.jsx, main.jsx, index.css, i18n.jsx
│   │   ├── components/  (Navbar, MapView, LocationPicker, Legend, SceneBg)
│   │   └── pages/       (Home, SubmitReport, TrackReport, AuthLogin, Dashboard, ReportDetail)
│   ├── index.html, package.json, vite.config.js, vercel.json
│   └── README.md              # Frontend-scoped docs
└── project-docs/              # Person 3 — Documentation
    ├── ARCHITECTURE.md        # Topology + repo split notes
    └── screenshots/           # 9 page screenshots
```

---

## Functional Requirements Coverage

Covers all 52 functional requirements (FR-1 through FR-52) from the project deliverable, including:
- Public home screen with map and filters (FR-1 to FR-13)
- Guest report submission with CIN validation (FR-14 to FR-28)
- Reporter status lookup (FR-29 to FR-32)
- Authority authentication and report review (FR-33 to FR-44)
- Authority dashboard map and interaction (FR-45 to FR-52)

## Non-Functional Requirements

- Responsive on laptop and mobile (NFR-4)
- Only JPG/PNG under 5MB accepted (NFR-10)
- Role-based access control via JWT (NFR-8, NFR-11)
- Public interface does not expose CIN or internal notes (NFR-9)
- React + FastAPI + Supabase stack (NFR-17)
- PostgreSQL for structured data (NFR-18)
- Runs on Chrome and Edge (NFR-21)

---

## Authors

Badr FATOUH, Omar MERHABY, Hassan LAKHDIM
