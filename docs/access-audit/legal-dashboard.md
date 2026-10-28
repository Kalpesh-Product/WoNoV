# Legal Dashboard: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Dashboard/LegalDashboard/LegalDashboard.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/legal-dashboard — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate(route) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate(route) — [LegalDashboard.jsx:34](../../client/src/pages/Dashboard/LegalDashboard/LegalDashboard.jsx#L34) |
