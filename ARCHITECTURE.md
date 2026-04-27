# EcoGuard — Architecture Overview

EcoGuard is split into three independently developed and deployed components.

## Repositories

| Repo | Owner | Purpose | Deploys to |
|------|-------|---------|------------|
| `backend-api` | Person 1 | FastAPI service, SQLAlchemy models, JWT auth, all business logic | Railway |
| `frontend-web` | Person 2 | React + Vite SPA, public pages, authority dashboard, bilingual i18n | Vercel |
| `project-docs` | Person 3 | Project README, screenshots, this architecture document | GitHub Pages (optional) |

## Runtime topology

```
                ┌────────────────────┐
                │   User browser     │
                └────────┬───────────┘
                         │ HTTPS
                         ▼
              ┌────────────────────┐
              │ Vercel (static SPA)│   ← frontend-web
              └────────┬───────────┘
                       │ /api/* (CORS)
                       ▼
              ┌────────────────────┐
              │ Railway (FastAPI)  │   ← backend-api
              └────────┬───────────┘
                       │ asyncpg
                       ▼
              ┌────────────────────┐
              │ Supabase Postgres  │
              └────────────────────┘
```

## Contract between frontend and backend

The frontend talks to the backend over a REST API. All endpoints are namespaced under `/api/`:

- `/api/config`, `/api/reports/public`, `/api/notices`, `/api/reports/submit`, `/api/reports/lookup` — public, no auth
- `/api/auth/login` — issues a JWT for officers
- `/api/authority/*` — JWT-protected, used by the authority dashboard

When the API contract changes (new field, renamed endpoint, etc.), both repo owners need to coordinate. Document the change in this file.

## Data model

Lives in `backend-api/models.py`. Six tables: `reports`, `report_images`, `report_notes`, `status_history`, `officers`, `public_notices`.

Reports have two independent status dimensions:
- **Verification** — `Pending` → `Approved` / `Rejected` (officer decision on legitimacy)
- **Resolution** — `Ongoing` → `In Progress` → `Resolved` (only meaningful for approved reports)

## Local development

Each component runs independently. Typical workflow:

```bash
# Terminal 1
cd backend-api && python main.py        # → :8000

# Terminal 2
cd frontend-web && npm run dev          # → :3000, proxies /api to :8000
```

The frontend's `vite.config.js` proxies `/api/*` to `localhost:8000` so CORS is not a concern in dev.

## Deployment

- **Backend** — `git push` to the backend-api GitHub repo; Railway picks up `nixpacks.toml` and `Procfile`.
- **Frontend** — `git push` to the frontend-web GitHub repo; Vercel detects Vite, runs `npm run build`, serves `dist/`. The `vercel.json` rewrite ensures SPA routes resolve.
- **Docs** — optional GitHub Pages from the project-docs repo.

## Coordination notes

- The frontend assumes the backend is at the same origin in production. If Vercel and Railway are on different domains, set the API base URL in `frontend-web/src/api.js`.
- Database migrations are not automated. The `models.py` `init_db()` call creates missing tables on startup but does not alter existing ones — schema changes require manual coordination.
