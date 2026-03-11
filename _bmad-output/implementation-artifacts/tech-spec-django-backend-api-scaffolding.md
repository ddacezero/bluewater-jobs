---
title: 'Django backend API scaffolding in backend'
slug: 'django-backend-api-scaffolding'
created: '2026-03-11T21:15:40+0800'
status: 'Implementation Complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Python', 'Django', 'Django REST Framework', 'SQLite (default initial DB unless changed during implementation)', 'JavaScript frontend via Vite + React']
files_to_modify: ['backend/manage.py', 'backend/config/__init__.py', 'backend/config/asgi.py', 'backend/config/wsgi.py', 'backend/config/settings.py', 'backend/config/urls.py', 'backend/users/__init__.py', 'backend/users/admin.py', 'backend/users/apps.py', 'backend/users/models.py', 'backend/users/views.py', 'backend/users/serializers.py', 'backend/users/services.py', 'backend/users/selectors.py', 'backend/users/permissions.py', 'backend/users/urls.py', 'backend/users/tests/__init__.py', 'backend/users/tests/test_views.py', 'backend/users/tests/test_services.py', 'backend/users/migrations/__init__.py', 'backend/requirements.txt']
code_patterns: ['Confirmed clean-slate backend in backend/ with no legacy constraints', 'Separate frontend/backend architecture: Vite React frontend consumes backend API', 'Django project-first setup followed by app creation', 'App-level module separation for views, serializers, services, selectors, and permissions', 'Use Django default User model and keep auth domain ownership in users app without implementing auth flows yet', 'API-oriented routing via project urls including app urls namespaces']
test_patterns: ['No existing backend tests found; establish Django test modules under backend/users/tests', 'Prefer scaffolded module-specific tests for view wiring and service layer placeholders', 'Keep initial tests focused on project/app bootstrapping and import-level verification']
---

# Tech-Spec: Django backend API scaffolding in backend

**Created:** 2026-03-11T21:15:40+0800

## Overview

### Problem Statement

The project currently has an empty `backend` directory and no Django API foundation. A consistent backend setup is needed so the frontend can integrate against a dedicated API codebase without mixing backend concerns into the frontend app.

### Solution

Initialize a Django project inside `backend`, add Django REST Framework as the API layer, and create a single `users` app that owns the initial auth-related domain structure. Keep the setup minimal by using Django's default `User` model and scaffolding only the base project and app modules needed for consistent future development.

### Scope

**In Scope:**
- Django project scaffolding in `backend`
- DRF installation and base configuration
- Create and wire a `users` app
- Scaffold consistent app modules including `models`, `serializers`, `views`, `services`, `selectors`, `permissions`, `urls`, `tests`, `admin`, `apps`, and migration structure
- Configure the backend to operate as an API-only service for the frontend at a project structure level

**Out of Scope:**
- JWT or token auth implementation
- Login, registration, or current-user endpoints
- Custom user model
- Business logic beyond initial project scaffolding
- Extra app modules such as `validators`, `exceptions`, or `constants` unless a concrete implementation need emerges

## Context for Development

### Codebase Patterns

The repository currently contains a Vite frontend in `frontend` and an empty `backend` directory with no existing Django conventions to inherit. This is a confirmed clean slate for the backend, so the scaffold should define the baseline architecture rather than adapt to legacy code.

The dominant repo pattern is separation of concerns by top-level application root: `frontend` is already isolated, and `backend` should mirror that isolation with its own dependency entrypoint, Django project package, and app packages. Within the Django app, the requested structure should explicitly separate transport (`views`, `serializers`, `urls`) from domain/application logic (`services`, `selectors`) and access rules (`permissions`).

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `frontend/package.json` | Confirms the frontend is a separate Vite application consuming the backend API |
| `backend/` | Empty target location for the new Django backend scaffold |
| `backend/manage.py` | Django project entrypoint to create and run the backend |
| `backend/config/settings.py` | Central Django and DRF configuration |
| `backend/config/urls.py` | Root API routing and app inclusion point |
| `backend/users/apps.py` | Registers the initial `users` app |
| `backend/users/models.py` | App model boundary, even if the default Django `User` is used initially |
| `backend/users/serializers.py` | DRF serializer boundary for future auth/user API work |
| `backend/users/views.py` | DRF view boundary for future API endpoints |
| `backend/users/services.py` | Service-layer functions for app business logic |
| `backend/users/selectors.py` | Read/query-layer functions for app data access |
| `backend/users/permissions.py` | DRF permission classes for future auth-related access control |
| `backend/users/urls.py` | App-level route definitions |
| `backend/users/tests/` | Initial backend test structure for scaffold verification |
| `backend/requirements.txt` | Backend dependency manifest if the scaffold standardizes package installation there |

### Technical Decisions

- Use Django with Django REST Framework as the backend API foundation
- Use Django's default `User` model initially to avoid premature auth complexity
- Keep auth ownership conceptually in the `users` app, but do not implement auth flows yet
- Prefer explicit app-layer modules (`services`, `selectors`, `permissions`) so future features follow a consistent structure
- Include standard Django app files like `admin.py`, `apps.py`, `urls.py`, `tests`, and `migrations`
- Exclude `validators`, `exceptions`, and `constants` from the initial scaffold unless Step 2 investigation identifies a concrete reason
- Treat the backend as API-only at the project configuration level, but avoid overengineering special infrastructure before real endpoints exist
- Since no backend test framework conventions exist yet, default to Django/DRF-compatible test modules colocated under `backend/users/tests`

## Implementation Plan

### Tasks

- [x] Task 1: Establish backend dependency and project bootstrap entrypoints
  - File: `backend/requirements.txt`
  - Action: Add the initial backend dependency manifest with Django and Django REST Framework versions appropriate for a new project scaffold.
  - Notes: Keep the dependency surface minimal; do not add JWT/auth packages yet.

- [x] Task 2: Create the Django project skeleton under `backend`
  - File: `backend/manage.py`
  - Action: Generate the Django management entrypoint for the backend project root.
  - Notes: The project package should live inside `backend/config` so the backend root stays clean and conventional.

- [x] Task 3: Add core Django project package files
  - File: `backend/config/__init__.py`
  - Action: Create the package marker for the Django project module.
  - Notes: Keep this file minimal.
  - File: `backend/config/asgi.py`
  - Action: Add the ASGI application entrypoint generated for the Django project.
  - Notes: Use standard Django structure.
  - File: `backend/config/wsgi.py`
  - Action: Add the WSGI application entrypoint generated for the Django project.
  - Notes: Use standard Django structure.

- [x] Task 4: Configure Django settings for an API-oriented backend baseline
  - File: `backend/config/settings.py`
  - Action: Configure installed apps, middleware, templates, database defaults, and REST framework setup for a backend intended to serve API responses to the frontend.
  - Notes: Include `rest_framework` and the `users` app; keep the default SQLite database unless implementation needs change; avoid introducing extra auth packages or premature environment/config abstractions.

- [x] Task 5: Define root URL routing for the backend API
  - File: `backend/config/urls.py`
  - Action: Create root URL configuration that includes admin routing and app-level routing for `users`.
  - Notes: Use namespaced inclusion so additional apps can follow the same routing pattern later.

- [x] Task 6: Create the `users` app registration and standard Django app files
  - File: `backend/users/__init__.py`
  - Action: Create the app package marker.
  - Notes: Keep this file empty unless Django app initialization requires otherwise.
  - File: `backend/users/apps.py`
  - Action: Register the `users` app with a conventional app config class.
  - Notes: Use a stable app label and default auto field consistent with project settings.
  - File: `backend/users/admin.py`
  - Action: Add the base admin module for future user-related registrations.
  - Notes: Since the default Django `User` model remains in use, do not introduce custom admin model registrations unless needed for scaffold integrity.
  - File: `backend/users/migrations/__init__.py`
  - Action: Create the migrations package marker.
  - Notes: Required for consistent Django app scaffolding.

- [x] Task 7: Scaffold the requested app-layer boundaries in `users`
  - File: `backend/users/models.py`
  - Action: Create the app model module and document that the default Django `User` model remains the active user model for now.
  - Notes: Do not add a custom user model or extra tables unless required by the scaffold.
  - File: `backend/users/serializers.py`
  - Action: Add a serializer module placeholder or minimal serializer boundary for future user/auth API work.
  - Notes: Keep it import-safe and aligned with DRF conventions.
  - File: `backend/users/views.py`
  - Action: Add the app view module with minimal API-friendly structure.
  - Notes: If an endpoint is needed for wiring validation, keep it limited to a simple scaffold-safe response rather than auth behavior.
  - File: `backend/users/services.py`
  - Action: Create the service-layer module for future write/business logic.
  - Notes: Keep initial contents minimal but import-safe.
  - File: `backend/users/selectors.py`
  - Action: Create the selector-layer module for future read/query logic.
  - Notes: Keep initial contents minimal but import-safe.
  - File: `backend/users/permissions.py`
  - Action: Create the permission-layer module for future DRF access rules.
  - Notes: Keep initial contents minimal but import-safe.

- [x] Task 8: Create app-level URL definitions for `users`
  - File: `backend/users/urls.py`
  - Action: Define the `users` route module and expose a URL pattern list compatible with inclusion from the project root.
  - Notes: Keep routes minimal and aligned with scaffold-only scope.

- [x] Task 9: Establish the initial backend test structure
  - File: `backend/users/tests/__init__.py`
  - Action: Create the tests package marker.
  - Notes: Use a dedicated tests package rather than a single flat `tests.py` file to support future growth.
  - File: `backend/users/tests/test_views.py`
  - Action: Add initial tests covering URL/view importability or minimal scaffold-level API wiring.
  - Notes: Keep tests focused on structural verification, not auth flows.
  - File: `backend/users/tests/test_services.py`
  - Action: Add initial tests or placeholders validating service-layer import stability and intended test organization.
  - Notes: The goal is to establish the testing pattern, not to simulate future business logic.

- [x] Task 10: Verify the scaffold works as a backend foundation
  - File: `backend/config/settings.py`
  - Action: Confirm the project boots with the configured installed apps and root URLs.
  - Notes: Validation should cover Django checks, app registration, and test discovery without implementing out-of-scope auth features.

### Acceptance Criteria

- [x] AC 1: Given the repository has an empty `backend` directory, when the scaffold is completed, then `backend` contains a valid Django project with `manage.py` and a project package under `backend/config`.
- [x] AC 2: Given the backend dependencies are installed, when Django starts, then `rest_framework` and the `users` app are registered successfully in project settings.
- [x] AC 3: Given the backend project URL configuration is loaded, when root URLs are resolved, then the project includes admin routing and app-level routing for `users` without import errors.
- [x] AC 4: Given the `users` app is scaffolded, when a developer opens the app package, then it contains the agreed baseline modules `models`, `serializers`, `views`, `services`, `selectors`, `permissions`, `urls`, `tests`, `admin`, `apps`, and `migrations`.
- [x] AC 5: Given the initial scaffold uses Django's default authentication model, when the backend is inspected, then no custom user model or out-of-scope auth package has been introduced.
- [x] AC 6: Given the initial scaffold is intended to stay minimal, when the backend app structure is reviewed, then `validators`, `exceptions`, and `constants` are absent unless a concrete implementation need was documented during implementation.
- [x] AC 7: Given the backend is intended as an API foundation for the existing frontend, when DRF configuration is reviewed, then the project is set up for API-oriented development without requiring feature endpoints beyond scaffold validation.
- [x] AC 8: Given the backend test structure is created, when test discovery runs, then tests under `backend/users/tests` are discoverable and aligned with the scaffolded modules.
- [x] AC 9: Given a fresh developer reads this spec, when they follow the task list, then they can implement the backend scaffold without needing additional workflow history or unstated assumptions.

## Additional Context

### Dependencies

- Django
- Django REST Framework
- Python runtime compatible with the selected Django and DRF versions
- Backend package installation workflow in `backend` using a dependency manifest such as `requirements.txt`
- Existing frontend remains independent and consumes the backend through future API integration, but no direct code dependency is required for this scaffold

### Testing Strategy

Use low-cost verification for a greenfield scaffold:

- Unit-level structural tests in `backend/users/tests/test_views.py` and `backend/users/tests/test_services.py`
- Django system checks to confirm settings, installed apps, and URL imports are valid
- Manual verification that the project boots from `backend/manage.py`
- Manual verification that the `users` app is installed and routes can be included without adding out-of-scope auth functionality

### Notes

This spec is intentionally limited to backend foundation work. The initial deliverable is a maintainable API scaffold, not a complete auth implementation.

The highest risk is accidental scope expansion, especially around authentication. The implementation should resist adding JWT, login/register flows, custom user models, or extra support modules that are not justified by the scaffold itself.

Because the backend is a confirmed clean slate, the implementation should prefer conventional Django defaults where possible. Any deviation from defaults should have a direct scaffold-level reason rather than speculative future-proofing.

## Review Notes

- Adversarial review completed
- Findings: 10 total, 5 fixed, 5 skipped
- Resolution approach: walk-through
