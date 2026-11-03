# Investor Dashboard: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Dashboard/InvestorDashboard/InvestorDashboard.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/investor-dashboard — no permission wrapper detected on this route-object chain
- /app/dashboard/investor-dashboard/income-expense — no permission wrapper detected on this route-object chain
- /app/dashboard/investor-dashboard/unique-clients — no permission wrapper detected on this route-object chain
- /app/dashboard — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => snapshotRoute && snapshotNavigate(snapshotRoute) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => snapshotRoute && snapshotNavigate(snapshotRoute) — [InvestorDashboard.jsx:611](../../client/src/pages/Dashboard/InvestorDashboard/InvestorDashboard.jsx#L611) |
| Open FY 2025-26 calendar (button) | card.hasCalendar | No local disabled condition detected | (event) => { event.stopPropagation(); setCalendarAnchorEl(event.currentTarget); } — [InvestorDashboard.jsx:628](../../client/src/pages/Dashboard/InvestorDashboard/InvestorDashboard.jsx#L628) |
| Icon/action: () => toggleProjectionLegendItem(item.label) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => toggleProjectionLegendItem(item.label) — [InvestorDashboard.jsx:2123](../../client/src/pages/Dashboard/InvestorDashboard/InvestorDashboard.jsx#L2123) |

## pages/Dashboard/InvestorDashboard/InvestorOperationalCharts.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | showGenderDetails; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [InvestorOperationalCharts.jsx:686](../../client/src/pages/Dashboard/InvestorDashboard/InvestorOperationalCharts.jsx#L686) |
| Advanced filter (table-generated utility) | showAgeDetails; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [InvestorOperationalCharts.jsx:704](../../client/src/pages/Dashboard/InvestorDashboard/InvestorOperationalCharts.jsx#L704) |
| Advanced filter (table-generated utility) | showIndiaDetails; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [InvestorOperationalCharts.jsx:724](../../client/src/pages/Dashboard/InvestorDashboard/InvestorOperationalCharts.jsx#L724) |
| Advanced filter (table-generated utility) | showSectorDetails; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [InvestorOperationalCharts.jsx:744](../../client/src/pages/Dashboard/InvestorDashboard/InvestorOperationalCharts.jsx#L744) |
| Advanced filter (table-generated utility) | showVisitorCategoryDetails; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [InvestorOperationalCharts.jsx:762](../../client/src/pages/Dashboard/InvestorDashboard/InvestorOperationalCharts.jsx#L762) |
| Advanced filter (table-generated utility) | showVisitorClientTypeDetails; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [InvestorOperationalCharts.jsx:779](../../client/src/pages/Dashboard/InvestorDashboard/InvestorOperationalCharts.jsx#L779) |
| Advanced filter (table-generated utility) | showVisitorGenderDetails; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [InvestorOperationalCharts.jsx:790](../../client/src/pages/Dashboard/InvestorDashboard/InvestorOperationalCharts.jsx#L790) |
