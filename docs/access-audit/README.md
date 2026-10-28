# Application-wide button access inventory

Source snapshot reviewed for 2026-10-27. No application code or permission assignments were changed by this audit.

Scanned 717 client JavaScript/JSX source files. Found **1727 control declarations/configurations** across **419 files**; 1680 are in the route/main import graph. Found 97 backend authorization declarations. Parse failures: 0.

## How to read access

- Effective access combines parent-route access, assigned user permissions, local visibility, disabled/selection/status conditions, ownership and the API's server-side rules.
- The app can load permissions per user; a role name alone cannot establish which users may invoke a button. This report does not query the live permission database or list actual user assignments.
- 'No local guard detected' does NOT mean 'all users allowed'. Page wrappers, handler functions, reusable components or backend rules can still reject the operation.
- Render conditions and disabled expressions are quoted from source. Nearby definitions help interpret names such as isHr, canDelete, isTop, selectedRows and reviewAccess. Conditions are not collapsed into guessed roles.
- Shared controls, table-generated actions, dynamic labels, repeated table instances, menu entries and clickable actions are listed separately. Counts are declarations, NOT distinct labels, live buttons or security findings.
- Route/main import reachability is not proof a component is rendered: imported legacy/demo components remain flagged as reachable. Unreached files are retained and explicitly marked, not claimed to be live pages.
- Runtime-generated controls, remote configuration, alias imports, guards inside external helpers and conditions applied by filtered data/configuration may require manual tracing. Backend branches are listed separately, not exhaustively paired to frontend buttons.
- Excluded: commented-out code, test files, plain navigation links without click handlers, and ordinary inputs/select options. Schema/config objects with action callbacks are included as configured actions.

## Module lists

| Module | Declarations | In route/main import graph | Files |
|---|---:|---:|---:|
| [Access](access.md) | 7 | 7 | 2 |
| [Admin Dashboard](admin-dashboard.md) | 107 | 104 | 35 |
| [Assets](assets.md) | 48 | 48 | 13 |
| [Cafe Dashboard](cafe-dashboard.md) | 1 | 1 | 1 |
| [Finance Dashboard](finance-dashboard.md) | 178 | 173 | 42 |
| [Frontend Dashboard](frontend-dashboard.md) | 60 | 58 | 15 |
| [General pages](general-pages.md) | 10 | 10 | 4 |
| [HR](hr.md) | 18 | 18 | 7 |
| [HR Dashboard](hr-dashboard.md) | 301 | 295 | 65 |
| [IT Dashboard](it-dashboard.md) | 53 | 53 | 20 |
| [Investor Dashboard](investor-dashboard.md) | 10 | 10 | 2 |
| [Legal Dashboard](legal-dashboard.md) | 1 | 1 | 1 |
| [LoginPage](loginpage.md) | 4 | 4 | 1 |
| [Maintenance Dashboard](maintenance-dashboard.md) | 146 | 146 | 28 |
| [Meetings](meetings.md) | 64 | 62 | 9 |
| [Performance](performance.md) | 155 | 155 | 20 |
| [Printout](printout.md) | 15 | 15 | 3 |
| [Profile](profile.md) | 17 | 17 | 6 |
| [Reports](reports.md) | 5 | 5 | 2 |
| [Sales Dashboard](sales-dashboard.md) | 133 | 133 | 40 |
| [Shared components and hooks](shared-components-and-hooks.md) | 219 | 200 | 63 |
| [Tasks](tasks.md) | 48 | 46 | 11 |
| [Test](test.md) | 1 | 0 | 1 |
| [Tickets](tickets.md) | 67 | 63 | 14 |
| [Visitors](visitors.md) | 59 | 56 | 14 |

## Supporting evidence

- [Backend authorization declarations](backend-checks.md)
- [Machine-readable control inventory](button-access.json)
- [Read-only audit generator](generate.cjs)

## Verification

This is static source inspection. No production database, credentials, .env files or browser sessions were read. No live authorization or API mutation tests were performed. Treat this as a complete inventory of the supported detectable source patterns, not a certified role-to-button security matrix.
