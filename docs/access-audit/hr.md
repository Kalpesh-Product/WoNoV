# HR: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/HR/HrCommonAgreements.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/profile/HR/agreements — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => window.open(params.data.url, "_blank") (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => window.open(params.data.url, "_blank") — [HrCommonAgreements.jsx:78](../../client/src/pages/HR/HrCommonAgreements.jsx#L78) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrCommonAgreements.jsx:108](../../client/src/pages/HR/HrCommonAgreements.jsx#L108) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 77: `params`

## pages/HR/HrCommonAttandenceRequests.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/profile/HR/attendance-correction-requests — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | NOT (isLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrCommonAttandenceRequests.jsx:94](../../client/src/pages/HR/HrCommonAttandenceRequests.jsx#L94) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isLoading**, line 13: `useQuery({ queryKey: ["attandence-correction-requests"], queryFn: async () => { const response = await axios.get( '/api/attendance/get-attendance-requests?userId=${auth.user?._id}' ); return Array.isArray(response.data) ? response.data : []; }, enabled: !!auth?.user?._id, })`
- **auth**, line 11: `useAuth()`

## pages/HR/HrCommonAttendance.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/profile/HR/attendance — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Correction Request (table-generated action) | NOT (isLoading) | No local disabled condition detected | () => { setOpenModal(true); } — [HrCommonAttendance.jsx:115](../../client/src/pages/HR/HrCommonAttendance.jsx#L115) |
| Advanced filter (table-generated utility) | NOT (isLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrCommonAttendance.jsx:115](../../client/src/pages/HR/HrCommonAttendance.jsx#L115) |
| Cancel (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenModal(false) — [HrCommonAttendance.jsx:250](../../client/src/pages/HR/HrCommonAttendance.jsx#L250) |
| Submit (button) | No local render guard detected; page/API access still applies | correctionPending; loading: correctionPending | No inline handler declared; may submit a form or delegate to a component — [HrCommonAttendance.jsx:254](../../client/src/pages/HR/HrCommonAttendance.jsx#L254) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isLoading**, line 70: `useQuery({ queryKey: ["attendance"], queryFn: fetchAttendance, enabled: !!auth?.user?.empId, // only run if empId exists })`
- **auth**, line 28: `useAuth()`

## pages/HR/HrCommonDocuments.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/profile/HR/company-handbook/:department — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrCommonDocuments.jsx:74](../../client/src/pages/HR/HrCommonDocuments.jsx#L74) |

## pages/HR/HrCommonHandbook.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/profile/HR/company-handbook — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: button (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [HrCommonHandbook.jsx:118](../../client/src/pages/HR/HrCommonHandbook.jsx#L118) |
| Icon/action: button (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [HrCommonHandbook.jsx:128](../../client/src/pages/HR/HrCommonHandbook.jsx#L128) |
| Icon/action: () => navigate('${item.title}', { state: { departmentId: item.id, departmentName: item.title, documentType: "sop", }, }) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate('${item.title}', { state: { departmentId: item.id, departmentName: item.title, documentType: "sop", }, }) — [HrCommonHandbook.jsx:243](../../client/src/pages/HR/HrCommonHandbook.jsx#L243) |
| Icon/action: () => navigate('${item.title}', { state: { departmentId: item.id, departmentName: item.title, documentType: "policies", }, }) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate('${item.title}', { state: { departmentId: item.id, departmentName: item.title, documentType: "policies", }, }) — [HrCommonHandbook.jsx:261](../../client/src/pages/HR/HrCommonHandbook.jsx#L261) |

## pages/HR/HrCommonLeaves.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/profile/HR/leaves — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Add Requested Leave (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenModal(true) — [HrCommonLeaves.jsx:154](../../client/src/pages/HR/HrCommonLeaves.jsx#L154) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrCommonLeaves.jsx:154](../../client/src/pages/HR/HrCommonLeaves.jsx#L154) |
| Cancel (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenModal(false) — [HrCommonLeaves.jsx:305](../../client/src/pages/HR/HrCommonLeaves.jsx#L305) |
| Submit (button) | No local render guard detected; page/API access still applies | leaveRequestPending; loading: leaveRequestPending | No inline handler declared; may submit a form or delegate to a component — [HrCommonLeaves.jsx:309](../../client/src/pages/HR/HrCommonLeaves.jsx#L309) |

## pages/HR/HrCommonPayslips.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/profile/HR/payslips — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { const link = params.data?.payslipLink; if (link) { window.open(link, "_blank"); } else { toast.error("No payslip link available."); } } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { const link = params.data?.payslipLink; if (link) { window.open(link, "_blank"); } else { toast.error("No payslip link available."); } } — [HrCommonPayslips.jsx:36](../../client/src/pages/HR/HrCommonPayslips.jsx#L36) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrCommonPayslips.jsx:86](../../client/src/pages/HR/HrCommonPayslips.jsx#L86) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 35: `params`
- **data**, line 14: `useQuery({ queryKey: ["payslips"], queryFn: async () => { try { const response = await axios.get( '/api/payslip/get-payslips/${auth?.user?._id}' ); return response.data \|\| []; } catch (error) { console.warn("Failed to fetch payslips:", error.message); return []; // fallback return to avoid crashes } }, })`
- **auth**, line 12: `useAuth()`
