# EcoGuard - Environmental Reporting System
### Ifrane Region, Morocco

An environmental reporting and monitoring platform built for the Ifrane region. Citizens can submit and track environmental reports, while authority officers review, verify, and manage them through a dedicated dashboard.

---

## Screenshots

### Public Home Page
![Home Page](screenshots/01-home.png)

### Home Page — Expanded Report
![Home Expanded](screenshots/02-home-expanded.png)

### Submit Report — Guest Submission with Map Picker
![Submit Report](screenshots/03-submit-report.png)

### Track Report — Lookup by CIN & Reference
![Track Report](screenshots/04-track-report.png)

### Track Report — Result View
![Track Result](screenshots/05-track-result.png)

### Authority Login
![Authority Login](screenshots/06-authority-login.png)

### Authority Dashboard — Stats, Map, Filters
![Dashboard](screenshots/07-dashboard.png)

### Authority Dashboard — Reports Table
![Dashboard Table](screenshots/08-dashboard-table.png)

### Report Detail — Review Controls, Notes, Activity Log
![Report Detail](screenshots/09-report-detail.png)

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
cd backend
pip install -r requirements.txt
python main.py
```

The API runs at `http://localhost:8000`. Database auto-seeds with 10 demo reports on first launch.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and proxies API requests to the backend.

---

## Pages & Features

### Public Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Interactive map with color/size-coded markers, filterable report list, public notices, Atlas Mountains background |
| Submit Report | `/submit` | Guest submission with map location picker (click to pin), multi-image upload (up to 5), category/location validation |
| Track Report | `/track` | Lookup by CIN + reference number, shows verification/resolution status and public notes |
| Authority Login | `/login` | Officer authentication with demo credentials |

### Authority Pages (requires login)

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/authority` | Stats (verification + resolution), filters, map, report table |
| Report Detail | `/authority/reports/:id` | Full review panel with image gallery, notes timeline, activity log, status controls |

### Key Features

- **Map location picker** — reporters click on a map to pin exact coordinates
- **Multi-image upload** — up to 5 photos per report with preview thumbnails
- **Two-status model** — verification (Pending/Approved/Rejected) + resolution (Ongoing/In Progress/Resolved)
- **Notes timeline** — officers add public/internal notes without overwriting history
- **Status audit trail** — every change logged with officer name, timestamp, old/new values
- **Image gallery with lightbox** — click thumbnails to zoom
- **Responsive design** — works on laptop and mobile
- **Interactive SVG backgrounds** — unique nature scenes per page (mountains, forest, lake, snow)

### Map Features

- **Color-coded markers** by category (Wildfire=red, Pollution=purple, Snow Closure=blue, etc.)
- **Size-coded markers** by urgency (Critical > High > Medium > Low)
- **Legend** showing color and size mappings
- **Click markers** to see report summary popup
- **Bidirectional selection** — clicking a report highlights its marker and vice versa

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
ecoguard/
├── backend/
│   ├── main.py              # FastAPI app — all endpoints
│   ├── models.py            # SQLAlchemy models (6 tables)
│   ├── seed_data.py         # Demo data seeder
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Database credentials
├── frontend/
│   ├── public/
│   │   └── logo.svg         # EcoGuard logo
│   ├── src/
│   │   ├── api.js           # API client functions
│   │   ├── App.jsx          # Router setup
│   │   ├── index.css        # All styles + animations
│   │   ├── main.jsx         # React entry point
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Top navigation
│   │   │   ├── MapView.jsx      # Leaflet map with markers
│   │   │   ├── LocationPicker.jsx  # Click-to-pin map
│   │   │   ├── Legend.jsx       # Map legend
│   │   │   └── SceneBg.jsx     # SVG background scenes
│   │   └── pages/
│   │       ├── Home.jsx         # Public home + map + reports
│   │       ├── SubmitReport.jsx # Guest submission form
│   │       ├── TrackReport.jsx  # CIN + reference lookup
│   │       ├── AuthLogin.jsx    # Officer login
│   │       ├── Dashboard.jsx    # Authority dashboard
│   │       └── ReportDetail.jsx # Report review panel
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
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
