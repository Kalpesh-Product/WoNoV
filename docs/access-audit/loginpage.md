# LoginPage: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/LoginPage/LoginPage.jsx

Referenced by the application route/main import graph.

Declared route paths:

- / — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => setDrawerOpen(false) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setDrawerOpen(false) — [LoginPage.jsx:228](../../client/src/pages/LoginPage/LoginPage.jsx#L228) |
| Action: () => setDrawerOpen(false) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setDrawerOpen(false) — [LoginPage.jsx:235](../../client/src/pages/LoginPage/LoginPage.jsx#L235) |
| Icon/action: () => setShowPassword(!showPassword) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setShowPassword(!showPassword) — [LoginPage.jsx:325](../../client/src/pages/LoginPage/LoginPage.jsx#L325) |
| Icon/action: button (button) | No local render guard detected; page/API access still applies | loading | No inline handler declared; may submit a form or delegate to a component — [LoginPage.jsx:355](../../client/src/pages/LoginPage/LoginPage.jsx#L355) |
