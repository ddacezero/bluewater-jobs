# Design Spec: Monorepo Restructure + Profile Popup Menu

**Date:** 2026-03-10
**Author:** Bronn
**Status:** Approved

---

## 1. Overview

Two deliverables in this implementation:

1. **Monorepo restructure** — Move all frontend code into `frontend/`, scaffold a Django backend in `backend/` with JWT auth via the `core` app.
2. **Profile popup menu** — Add a persistent popover above the sidebar profile card with Profile, Settings, and Logout options.

---

## 2. Monorepo Structure

**Approach:** Flat monorepo — two self-contained subdirectories, no workspace tooling overhead.

```
bluewater-jobs/
├── frontend/                  ← all current project files (src/, public/, etc.)
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── ...
├── backend/                   ← new Django project
│   ├── manage.py
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   └── dev.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── core/                  ← auth app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   ├── requirements.txt
│   └── .env.example
├── .gitignore                 ← updated for both frontend + backend
├── CLAUDE.md
└── README.md
```

### Migration steps (frontend)
- Move all current root-level frontend files into `frontend/`
- No changes to internal src/ structure
- Update `.gitignore` to cover `backend/` artifacts (`__pycache__`, `db.sqlite3`, `.env`, `venv/`)

---

## 3. Django Backend

### Dependencies (`requirements.txt`)

| Package | Purpose |
|---------|---------|
| `Django>=5.0` | Web framework |
| `djangorestframework` | REST API layer |
| `djangorestframework-simplejwt` | JWT access + refresh tokens |
| `django-cors-headers` | CORS for Vite dev server (`localhost:5173`) |
| `python-dotenv` | Load `.env` secrets |

### Settings split

- `config/settings/base.py` — shared settings (installed apps, middleware, auth config, JWT config)
- `config/settings/dev.py` — extends base; `DEBUG=True`, SQLite DB, CORS allow all origins

### `core` app — Auth endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register/` | Create new user account |
| `POST` | `/api/auth/login/` | Returns `access` + `refresh` JWT tokens |
| `POST` | `/api/auth/token/refresh/` | Exchange refresh token for new access token |
| `GET` | `/api/auth/me/` | Returns authenticated user's profile |

### User model
- Extends Django's `AbstractUser` (no field changes initially, extensible later)
- Registered in `admin.py`

### `.env.example`
```
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## 4. Profile Popup Menu

### Component
**New file:** `frontend/src/components/ProfileMenu.tsx`

### Behavior
- Rendered inside `SideContent` in `App.tsx`, anchored to the profile card
- Click profile card → `isOpen` toggles to `true` → popup appears **above** the card
- Click outside (via `useEffect` + `ref`) → `isOpen` set to `false`
- Persistent across all pages — lives in the layout shell, not page components

### Visual style (Option C)
- Soft upward box-shadow, no border, border-radius consistent with app tokens
- SVG icons (from existing `src/components/icons/index.tsx` where available)
- Logout text in red (`var(--color-danger)`)
- Divider line before Logout

### Menu items

| Item | Icon | Action |
|------|------|--------|
| Profile | `PersonIcon` | `navigate('/profile')` — stub route |
| Settings | Gear SVG (new) | `navigate('/settings')` — stub route |
| *(divider)* | — | — |
| Logout | Arrow-out SVG (new) | No-op; hook point for auth API later |

### Files changed
- **New:** `frontend/src/components/ProfileMenu.tsx`
- **Modified:** `frontend/src/App.tsx` — import `ProfileMenu`, drop into `SideContent` footer

---

## 5. Out of Scope

- Auth integration between frontend and backend (next implementation)
- `/profile` and `/settings` page content
- Production database (PostgreSQL deferred)
- Workspace tooling (pnpm workspaces, Turborepo)
