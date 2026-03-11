# Backend API Conventions

## Goal

Keep backend app creation simple and consistent.

Core workflow:

`create app -> add app urls.py -> register app under /api/<domain>/ in project urls.py`

## URL Rules

1. `backend/config/urls.py` owns the public API shape.
2. Each app owns only its internal routes.
3. All API routes are mounted under `/api/<domain>/`.
4. Avoid putting business endpoints directly in project-level URLs.

## Standard Pattern

Project-level URL config:

```python
urlpatterns = [
    path("api/users/", include(("users.urls", "users"), namespace="users")),
    path("api/projects/", include(("projects.urls", "projects"), namespace="projects")),
]
```

App-level URL config:

```python
app_name = "users"

urlpatterns = [
    path("", UserListView.as_view(), name="list"),
    path("me/", CurrentUserView.as_view(), name="me"),
    path("<int:pk>/", UserDetailView.as_view(), name="detail"),
]
```

Result:

- `/api/users/`
- `/api/users/me/`
- `/api/users/1/`

## New App Minimum

Every new app should start with:

- `apps.py`
- `models.py`
- `views.py`
- `urls.py`
- `serializers.py`
- `services.py`
- `permissions.py`
- `selectors.py`
- `tests/`
- `migrations/`

Add files only when needed. Do not force extra layers for simple features.

## Recommended App Creation Flow

1. Run the Django `startapp` command.
2. Place the app under `backend/<app_name>/`.
3. Add `urls.py` to the app.
4. Register the app in `backend/config/urls.py` under `/api/<app_name>/`.
5. Add one smoke test for the main route.

## Reference Example: `users`

Current structure:

```text
backend/users/
├── __init__.py
├── admin.py
├── apps.py
├── migrations/
├── models.py
├── permissions.py
├── selectors.py
├── serializers.py
├── services.py
├── tests/
├── urls.py
└── views.py
```

Current URL example in this project:

```python
# backend/config/urls.py
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include(("users.urls", "users"), namespace="users")),
]
```

```python
# backend/users/urls.py
app_name = "users"

urlpatterns = [
    path("ping/", UsersPingView.as_view(), name="ping"),
]
```

This produces:

- `/api/users/ping/`

## Practical Rule

If you create a new app, the backend should be understandable by scanning only:

- `backend/config/urls.py`
- `backend/<app_name>/urls.py`
- `backend/<app_name>/views.py`
