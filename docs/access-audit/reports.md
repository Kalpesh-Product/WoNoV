# Reports: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Reports/DepartmentReportCommon.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/reports/reports-section/cafe — `<PerformancePermissionRoute permissions={[PERMISSIONS.REPORTS_CAFE]} element={<DepartmentReportCommon />} />`
- /app/reports/reports-section/legal — `<PerformancePermissionRoute permissions={[PERMISSIONS.REPORTS_LEGAL]} element={<DepartmentReportCommon />} />`
- /app/reports/reports-section/:moduleKey — `<PerformancePermissionRoute permissions={[PERMISSIONS.REPORTS_SECTION]} element={<DepartmentReportCommon />} />`
- /app/reports/department-report-common — `<PerformancePermissionRoute permissions={[PERMISSIONS.REPORTS_DASHBOARD]} element={<DepartmentReportCommon />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => { if (status === "failed" \|\| hasDownloadFailed) return; setActiveReportId(row?._id \|\| null); generateReportMutation.mutate(row); } (button) | No local render guard detected; page/API access still applies | isGenerating \|\| status === "failed" \|\| hasDownloadFailed \|\| !row?._id | () => { if (status === "failed" \|\| hasDownloadFailed) return; setActiveReportId(row?._id \|\| null); generateReportMutation.mutate(row); } — [DepartmentReportCommon.jsx:3046](../../client/src/pages/Reports/DepartmentReportCommon.jsx#L3046) |
| Regenerate (button) | hasDownloadFailed | isGenerating \|\| !row?._id | () => { setActiveReportId(row?._id \|\| null); generateReportMutation.mutate(row); } — [DepartmentReportCommon.jsx:3064](../../client/src/pages/Reports/DepartmentReportCommon.jsx#L3064) |
| Action: (event) => setAnchorEl(event.currentTarget) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | (event) => setAnchorEl(event.currentTarget) — [DepartmentReportCommon.jsx:3191](../../client/src/pages/Reports/DepartmentReportCommon.jsx#L3191) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DepartmentReportCommon.jsx:3217](../../client/src/pages/Reports/DepartmentReportCommon.jsx#L3217) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isGenerating**, line 3016: `status === "pending" \|\| status === "processing" \|\| isPending`
- **isPending**, line 3014: `generateReportMutation.isPending && activeReportId === row?._id`
- **hasDownloadFailed**, line 3019: `status === "completed" && !isDownloaded`
- **isDownloaded**, line 3018: `downloadedByReportId[row?._id]`

## pages/Reports/ReportsSection.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/reports/reports-section — `<PerformancePermissionRoute permissions={[PERMISSIONS.REPORTS_SECTION]} element={<ReportsSection />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => navigate(module.route) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate(module.route) — [ReportsSection.jsx:152](../../client/src/pages/Reports/ReportsSection.jsx#L152) |
