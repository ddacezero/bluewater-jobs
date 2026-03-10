# Monorepo Restructure + Profile Popup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the project into a flat monorepo (`frontend/` + `backend/`), scaffold a Django backend with JWT auth, and add a persistent profile popup menu to the sidebar.

**Architecture:** All current Vite/React files move into `frontend/` unchanged. A new `backend/` Django project is scaffolded with a `core` app that provides `/api/auth/` endpoints using DRF + SimpleJWT. The profile popup is a new `ProfileMenu` component anchored to the sidebar footer, with outside-click dismissal handled by a ref in `SideContent`.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind v4 (frontend); Django 5 + DRF + djangorestframework-simplejwt + django-cors-headers + pytest-django (backend)

---

## Chunk 1: Monorepo File Restructure

### File Map

| Action | Path |
|--------|------|
| Create dir | `frontend/` |
| git mv | `src/` → `frontend/src/` |
| git mv | `public/` → `frontend/public/` |
| git mv | `index.html` → `frontend/index.html` |
| git mv | `package.json` → `frontend/package.json` |
| git mv | `package-lock.json` → `frontend/package-lock.json` |
| git mv | `vite.config.ts` → `frontend/vite.config.ts` |
| git mv | `tsconfig.json` → `frontend/tsconfig.json` |
| Stay at root | `CLAUDE.md`, `README.md`, `.gitignore`, `docs/`, `.claude/` |
| Modify | `.gitignore` — add backend + venv ignores |

---

### Task 1: Move all frontend files into `frontend/`

**Files:**
- Create dir: `frontend/`
- Move: `src/`, `public/`, `index.html`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`

- [ ] **Step 1: Create the frontend directory**

```bash
mkdir frontend
```

- [ ] **Step 2: Move all frontend source files using git mv**

```bash
git mv src frontend/src
git mv public frontend/public
git mv index.html frontend/index.html
git mv package.json frontend/package.json
git mv tsconfig.json frontend/tsconfig.json
git mv vite.config.ts frontend/vite.config.ts
```

- [ ] **Step 3: Move package-lock.json if it exists**

```bash
# Only run if the file exists
ls package-lock.json 2>/dev/null && git mv package-lock.json frontend/package-lock.json || echo "No lock file at root"
```

- [ ] **Step 4: Clean up orphaned build artifacts at root**

`node_modules/` and `dist/` are gitignored and were not moved by `git mv`. They remain at the root and are safe to delete — the frontend will reinstall them inside `frontend/`.

```bash
rm -rf node_modules dist
```

- [ ] **Step 5: Verify structure looks correct**

```bash
ls -la
ls -la frontend/
```

Expected root (at minimum): `frontend/`, `docs/`, `.gitignore`, `CLAUDE.md`, `README.md`. Also present but normal: `.git/`, `.claude/`, `.superpowers/` — these are not affected by the move.
Expected `frontend/`: `src/`, `public/`, `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`

- [ ] **Step 6: Verify the frontend still runs**

```bash
cd frontend && npm install && npm run dev
```

Expected: Vite dev server starts on `http://localhost:5173`. Open in browser and confirm all 6 pages load and function. Stop with Ctrl+C.

- [ ] **Step 7: Update .gitignore to cover backend artifacts**

Edit root `.gitignore` and add the following block at the end:

```
# Backend
backend/venv/
backend/__pycache__/
backend/**/__pycache__/
backend/*.pyc
backend/db.sqlite3
backend/.env
backend/.pytest_cache/
```

- [ ] **Step 8: Commit the restructure**

```bash
cd /Users/bronny/SaaSProjects/bluewater-jobs
git add .gitignore
git commit -m "Refactor: Move frontend into frontend/ directory for monorepo structure"
```

---

## Chunk 2: Django Backend Scaffold + Core Auth App

### File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `backend/requirements.txt` | Python dependencies |
| Create | `backend/.env.example` | Environment variable template |
| Generated | `backend/manage.py` | Django CLI entrypoint |
| Generated | `backend/config/__init__.py` | Makes config a package |
| Generated | `backend/config/urls.py` | Root URL router |
| Generated | `backend/config/wsgi.py` | WSGI entrypoint |
| Generated | `backend/config/asgi.py` | ASGI entrypoint |
| Create | `backend/config/settings/__init__.py` | Empty — makes settings a package |
| Create | `backend/config/settings/base.py` | Shared settings (apps, middleware, DRF, JWT) |
| Create | `backend/config/settings/dev.py` | Dev overrides (DEBUG, SQLite, CORS) |
| Generated | `backend/core/__init__.py` | Makes core a package |
| Generated | `backend/core/apps.py` | App config (update label) |
| Generated | `backend/core/migrations/__init__.py` | Migrations package |
| Create/Modify | `backend/core/models.py` | Custom User extending AbstractUser |
| Create | `backend/core/serializers.py` | RegisterSerializer + UserSerializer |
| Create/Modify | `backend/core/views.py` | RegisterView + MeView |
| Create | `backend/core/urls.py` | /api/auth/ URL patterns |
| Modify | `backend/config/urls.py` | Include core.urls |
| Create/Modify | `backend/core/admin.py` | Register User model |
| Create | `backend/pytest.ini` | pytest-django settings module config |
| Create | `backend/tests/__init__.py` | Makes tests a package |
| Create | `backend/tests/test_auth.py` | Auth endpoint tests (TDD) |

---

### Task 2: Bootstrap the Django project

**Files:**
- Create: `backend/` dir, `backend/requirements.txt`, `backend/.env.example`
- Generated: `backend/manage.py`, `backend/config/`

- [ ] **Step 1: Create backend directory and requirements file**

```bash
mkdir backend
```

Create `backend/requirements.txt` with exactly this content:

```
Django>=5.0,<6.0
djangorestframework>=3.15
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
python-dotenv>=1.0
pytest>=8.0
pytest-django>=4.8
```

- [ ] **Step 2: Create a Python virtual environment and install dependencies**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Expected: All packages install without errors.

- [ ] **Step 3: Scaffold the Django project into the backend/ directory**

```bash
# Still inside backend/ with venv active
django-admin startproject config .
```

Expected files created: `manage.py`, `config/__init__.py`, `config/settings.py`, `config/urls.py`, `config/wsgi.py`, `config/asgi.py`

- [ ] **Step 4: Create the core app**

```bash
python manage.py startapp core
```

Expected: `core/` directory created with `__init__.py`, `admin.py`, `apps.py`, `migrations/__init__.py`, `models.py`, `tests.py`, `views.py`

- [ ] **Step 5: Create the .env.example file**

Create `backend/.env.example`:

```
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

### Task 3: Split settings into base + dev

**Files:**
- Create: `backend/config/settings/__init__.py`
- Create: `backend/config/settings/base.py`
- Create: `backend/config/settings/dev.py`
- Delete: `backend/config/settings.py` (the generated one)

- [ ] **Step 1: Create the settings package directory**

```bash
mkdir backend/config/settings
```

- [ ] **Step 2: Create `backend/config/settings/__init__.py` (empty)**

```bash
touch backend/config/settings/__init__.py
```

- [ ] **Step 3: Create `backend/config/settings/base.py`**

```python
from pathlib import Path
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-change-me-in-production")

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "corsheaders",
    # Local
    "core",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "core.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}
```

- [ ] **Step 4: Create `backend/config/settings/dev.py`**

```python
from .base import *

DEBUG = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

CORS_ALLOW_ALL_ORIGINS = True
```

- [ ] **Step 5: Delete the generated settings.py**

```bash
rm backend/config/settings.py
```

- [ ] **Step 6: Update wsgi.py and asgi.py to point to dev settings**

In `backend/config/wsgi.py`, change:
```python
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
```
To:
```python
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
```

In `backend/config/asgi.py`, make the identical change:
```python
# Before
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
# After
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
```

---

### Task 4: Implement the core auth app

**Files:**
- Modify: `backend/core/models.py`
- Create: `backend/core/serializers.py`
- Modify: `backend/core/views.py`
- Create: `backend/core/urls.py`
- Modify: `backend/core/admin.py`
- Modify: `backend/config/urls.py`

- [ ] **Step 1: Write the failing tests first (TDD)**

Create `backend/tests/__init__.py` (empty):

```bash
mkdir backend/tests
touch backend/tests/__init__.py
```

Create `backend/pytest.ini`:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings.dev
python_files = tests/test_*.py
```

Create `backend/tests/test_auth.py`:

```python
import pytest
from rest_framework.test import APIClient


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def registered_user(client):
    """Creates a user and returns credentials."""
    payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepass123",
    }
    client.post("/api/auth/register/", payload)
    return payload


@pytest.mark.django_db
def test_register_creates_user(client):
    resp = client.post("/api/auth/register/", {
        "username": "newuser",
        "email": "new@example.com",
        "password": "securepass123",
    })
    assert resp.status_code == 201
    assert resp.data["username"] == "newuser"
    assert "password" not in resp.data  # write_only


@pytest.mark.django_db
def test_register_rejects_duplicate_username(client, registered_user):
    resp = client.post("/api/auth/register/", registered_user)
    assert resp.status_code == 400


@pytest.mark.django_db
def test_login_returns_jwt_tokens(client, registered_user):
    resp = client.post("/api/auth/login/", {
        "username": registered_user["username"],
        "password": registered_user["password"],
    })
    assert resp.status_code == 200
    assert "access" in resp.data
    assert "refresh" in resp.data


@pytest.mark.django_db
def test_me_requires_authentication(client):
    resp = client.get("/api/auth/me/")
    assert resp.status_code == 401


@pytest.mark.django_db
def test_me_returns_current_user(client, registered_user):
    login = client.post("/api/auth/login/", {
        "username": registered_user["username"],
        "password": registered_user["password"],
    })
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    resp = client.get("/api/auth/me/")
    assert resp.status_code == 200
    assert resp.data["username"] == registered_user["username"]


@pytest.mark.django_db
def test_token_refresh_returns_new_access_token(client, registered_user):
    login = client.post("/api/auth/login/", {
        "username": registered_user["username"],
        "password": registered_user["password"],
    })
    resp = client.post("/api/auth/token/refresh/", {
        "refresh": login.data["refresh"],
    })
    assert resp.status_code == 200
    assert "access" in resp.data
```

- [ ] **Step 2: Run tests — verify they all fail (TDD red phase)**

```bash
cd backend
source venv/bin/activate
pytest tests/test_auth.py -v
```

Expected: All 6 tests FAIL (ImportError or 404s — the endpoints don't exist yet). This confirms the test setup is wired correctly.

- [ ] **Step 3: Implement `backend/core/models.py`**

```python
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    class Meta:
        db_table = "users"
```

- [ ] **Step 4: Implement `backend/core/serializers.py`**

```python
from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")
```

- [ ] **Step 5: Implement `backend/core/views.py`**

```python
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
```

- [ ] **Step 6: Create `backend/core/urls.py`**

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import RegisterView, MeView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", TokenObtainPairView.as_view(), name="auth-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
]
```

- [ ] **Step 7: Update `backend/config/urls.py`**

Replace the entire file content with:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("core.urls")),
]
```

- [ ] **Step 8: Update `backend/core/admin.py`**

```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

admin.site.register(User, UserAdmin)
```

- [ ] **Step 9: Update `backend/core/apps.py` — set the default_auto_field**

Open `backend/core/apps.py`. Verify it reads:

```python
from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"
```

No changes needed if it already looks like this.

- [ ] **Step 10: Run migrations**

```bash
cd backend
source venv/bin/activate
DJANGO_SETTINGS_MODULE=config.settings.dev python manage.py makemigrations
DJANGO_SETTINGS_MODULE=config.settings.dev python manage.py migrate
```

Expected output: Migration files created in `core/migrations/`, DB tables created.

- [ ] **Step 11: Run tests — verify they all pass (TDD green phase)**

```bash
pytest tests/test_auth.py -v
```

Expected:
```
PASSED tests/test_auth.py::test_register_creates_user
PASSED tests/test_auth.py::test_register_rejects_duplicate_username
PASSED tests/test_auth.py::test_login_returns_jwt_tokens
PASSED tests/test_auth.py::test_me_requires_authentication
PASSED tests/test_auth.py::test_me_returns_current_user
PASSED tests/test_auth.py::test_token_refresh_returns_new_access_token

6 passed
```

- [ ] **Step 12: Verify the dev server runs**

```bash
DJANGO_SETTINGS_MODULE=config.settings.dev python manage.py runserver
```

Expected: Server starts on `http://127.0.0.1:8000`. Open `http://127.0.0.1:8000/api/auth/register/` in browser — should show DRF browsable API. Stop with Ctrl+C.

- [ ] **Step 13: Commit the backend**

```bash
cd /Users/bronny/SaaSProjects/bluewater-jobs
git add backend/
git commit -m "Feat: Scaffold Django backend with core JWT auth app"
```

---

## Chunk 3: Profile Popup Menu (Frontend)

### File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `frontend/src/components/ProfileMenu.tsx` | Popup menu UI — Profile, Settings, Logout items |
| Modify | `frontend/src/App.tsx` | Add state + ref to SideContent; render ProfileMenu; add stub routes |

---

### Task 5: Create ProfileMenu component

**Files:**
- Create: `frontend/src/components/ProfileMenu.tsx`

- [ ] **Step 1: Create `frontend/src/components/ProfileMenu.tsx`**

`PersonIcon` already exists in `frontend/src/components/icons/index.tsx` — import and reuse it instead of duplicating the SVG.

`onLogout` is a named stub prop (no-op for now) that gives future auth integration a clear attachment point. Logout calls `onLogout?.()` then `onClose()`.

```tsx
/**
 * ProfileMenu — popup that appears above the sidebar profile card.
 * Rendered by SideContent; outside-click is handled via a ref in the parent.
 *
 * Props:
 *   onClose    — closes this menu
 *   onNavigate — optional, also closes the mobile sidebar overlay on navigation
 *   onLogout   — stub hook for auth API; no-op until auth is implemented
 */

import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { PersonIcon } from "./icons";

interface ProfileMenuProps {
  onClose: () => void;
  onNavigate?: () => void;
  onLogout?: () => void;
}

const ProfileMenu: FC<ProfileMenuProps> = ({ onClose, onNavigate, onLogout }) => {
  const navigate = useNavigate();

  const go = (path: string) => {
    navigate(path);
    onClose();
    onNavigate?.();
  };

  const handleLogout = () => {
    onLogout?.(); // hook point — wire to POST /api/auth/logout/ when auth is ready
    onClose();
  };

  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--color-surface)] rounded-[var(--radius-md)] border border-[var(--color-surface-border)] py-1 z-50"
      style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.10)" }}
    >
      {/* Profile */}
      <button
        onClick={() => go("/profile")}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-bg)] transition-colors bg-transparent border-none cursor-pointer text-left"
      >
        <PersonIcon className="text-[var(--color-text-muted)] shrink-0" style={{ width: 16, height: 16 }} />
        Profile
      </button>

      {/* Settings */}
      <button
        onClick={() => go("/settings")}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-bg)] transition-colors bg-transparent border-none cursor-pointer text-left"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)] shrink-0">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M18.66 5.34l1.41-1.41" />
        </svg>
        Settings
      </button>

      {/* Divider */}
      <div className="my-1 h-px bg-[var(--color-surface-border)]" />

      {/* Logout — stub; wire onLogout to auth API in the next implementation */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--color-danger)] hover:bg-[var(--color-surface-bg)] transition-colors bg-transparent border-none cursor-pointer text-left"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </div>
  );
};

export default ProfileMenu;
```

---

### Task 6: Wire ProfileMenu into App.tsx

**Files:**
- Modify: `frontend/src/App.tsx`

Three changes to make in `App.tsx`:

1. Import `ProfileMenu`
2. Convert `SideContent` to use state for the popup + a ref for outside-click
3. Add stub routes for `/profile` and `/settings`

> **Note — collapsed sidebar:** The collapsed sidebar state (icon-only mode) renders a bare `Avatar` in its footer with no popup. Wiring the popup to the collapsed state is **out of scope** for this chunk — the collapsed avatar is a visual affordance only.

- [ ] **Step 1: Add the ProfileMenu import to `frontend/src/App.tsx`**

Find the existing imports block (after the Avatar import):

```tsx
import Avatar from "./components/Avatar";
import ScrollToTopButton from "./components/ScrollToTopButton";
```

Add below it:

```tsx
import ProfileMenu from "./components/ProfileMenu";
```

- [ ] **Step 2: Replace the `SideContent` component**

Find the entire `SideContent` component (from `const SideContent: FC<SideContentProps>` to its closing `</>`), and replace it with:

```tsx
const SideContent: FC<SideContentProps> = ({ onClose, onCollapse }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-[var(--color-surface-border)]">
        <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-gradient-end)] flex items-center justify-center text-white font-extrabold text-sm shrink-0">
          BW
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="font-extrabold text-[15px] text-[var(--color-text-heading)] truncate">
            Bluewater Resorts
          </span>
          <span className="text-[10.5px] text-[var(--color-text-secondary)] font-medium">Jobs Portal</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto bg-transparent border-none cursor-pointer text-[var(--color-text-muted)] flex shrink-0"
          >
            <XIcon />
          </button>
        )}
        {onCollapse && (
          <button
            onClick={onCollapse}
            title="Collapse sidebar"
            className="ml-auto shrink-0 w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-bg)] hover:text-[var(--color-primary)] bg-transparent border-none cursor-pointer transition-colors duration-150"
          >
            <ChevIcon style={{ transform: "rotate(180deg)" }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="py-3 flex-1 overflow-y-auto">
        {NAV_ITEMS.map((n) => (
          <NavLink
            key={n.path}
            to={n.path}
            end={n.path === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-3 my-0.5 rounded-[var(--radius-md)] cursor-pointer text-[13.5px] no-underline transition-all duration-200 ${
                isActive
                  ? "font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                  : "font-medium text-[var(--color-text-subtle)] hover:bg-[var(--color-surface-bg)] hover:text-[var(--color-text-heading)]"
              }`
            }
          >
            {n.icon}
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile card — popup anchor */}
      <div
        ref={profileRef}
        className="relative px-4 py-3.5 border-t border-[var(--color-surface-border)]"
      >
        {profileOpen && (
          <ProfileMenu
            onClose={() => setProfileOpen(false)}
            onNavigate={onClose}
            // onLogout intentionally omitted — wire to auth API in next implementation
          />
        )}
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-bg)] transition-colors p-1 -m-1 cursor-pointer bg-transparent border-none"
        >
          <Avatar initials="AD" size="sm" />
          <div className="min-w-0 text-left">
            <div className="font-semibold text-[12.5px] text-[var(--color-text-heading)]">Admin</div>
            <div className="text-[10.5px] text-[var(--color-text-muted)]">HR Manager</div>
          </div>
        </button>
      </div>
    </>
  );
};
```

- [ ] **Step 3: Add stub routes for /profile and /settings in the App Routes**

Find the routes block:

```tsx
<Route element={<Layout />}>
  <Route index element={<Dashboard />} />
  <Route path="candidates" element={<Candidates />} />
  <Route path="pipeline" element={<Pipeline />} />
  <Route path="jobs" element={<Jobs />} />
  <Route path="reports" element={<Reports />} />
  <Route path="pool" element={<TalentPool />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Route>
```

Add stub routes before the `*` catch-all:

```tsx
<Route path="profile" element={<div className="p-8 text-[var(--color-text-heading)] font-semibold text-lg">Profile — coming soon</div>} />
<Route path="settings" element={<div className="p-8 text-[var(--color-text-heading)] font-semibold text-lg">Settings — coming soon</div>} />
```

- [ ] **Step 4: Verify the frontend compiles with no TypeScript errors**

```bash
cd frontend
npm run build
```

Expected: Build succeeds with no errors. (`tsc` + Vite bundle output in `dist/`)

- [ ] **Step 5: Manually verify the profile popup in the browser**

```bash
npm run dev
```

Open `http://localhost:5173`. Check:
- [ ] Clicking the profile card (bottom-left sidebar) opens the popup above it
- [ ] Popup shows Profile, Settings, Logout with icons
- [ ] Logout text is red
- [ ] Clicking outside the popup closes it
- [ ] Clicking "Profile" navigates to `/profile` (shows stub page)
- [ ] Clicking "Settings" navigates to `/settings` (shows stub page)
- [ ] Navigate to `/candidates`, `/pipeline`, etc. — profile card is present on every page
- [ ] Works in both light and dark mode

- [ ] **Step 6: Commit the profile popup**

```bash
cd /Users/bronny/SaaSProjects/bluewater-jobs
git add frontend/src/components/ProfileMenu.tsx frontend/src/App.tsx
git commit -m "Feat: Add profile popup menu to sidebar (Profile, Settings, Logout)"
```
