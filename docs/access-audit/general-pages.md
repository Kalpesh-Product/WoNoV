# General pages: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Chat.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/chat — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { if (contact.subGroups) { setExpandedGroup( expandedGroup === contact.id ? null : contact.id ); } else { setActiveContact(contact); } } (clickable action) | activeTab === 0 | No local disabled condition detected | () => { if (contact.subGroups) { setExpandedGroup( expandedGroup === contact.id ? null : contact.id ); } else { setActiveContact(contact); } } — [Chat.jsx:319](../../client/src/pages/Chat.jsx#L319) |
| Action: handleFileSelect (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleFileSelect — [Chat.jsx:443](../../client/src/pages/Chat.jsx#L443) |
| Icon/action: handleSendMessage (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleSendMessage — [Chat.jsx:461](../../client/src/pages/Chat.jsx#L461) |

## pages/LogPage.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/secret-logs — `<PerformancePermissionRoute element={<LogPage />} permissions={[PERMISSIONS.SIDEBAR_LOGS]} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View log details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewlog(params.data.payload) — [LogPage.jsx:189](../../client/src/pages/LogPage.jsx#L189) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [LogPage.jsx:400](../../client/src/pages/LogPage.jsx#L400) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [LogPage.jsx:400](../../client/src/pages/LogPage.jsx#L400) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 187: `params`
- **data**, line 24: `useQuery({ queryKey: ["secret-logs", selectedLogDateKey], queryFn: async () => { try { // const response = await axios.get("/api/logs/get-logs"); const response = await axios.get("/api/logs/get-logs", { params: { fromDate: selectedLogDateKey, toDate: selectedLogDateKey, }, }); return response.data \|\| []; } catch (error) { console.error(error?.response?.data?.message \|\| error.message); return []; // return response.data; // } catch (error) { // console.error(error.response.data.message); } }, })`
- **selectedLogDateKey**, line 20: `selectedLogDate.format("YYYY-MM-DD")`
- **selectedLogDate**, line 16: `useState(() => dayjs().startOf("day"), )`

## pages/MonthMeetings.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/meetings/:meetings — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View meeting details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewMeeting(params.data) — [MonthMeetings.jsx:239](../../client/src/pages/MonthMeetings.jsx#L239) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [MonthMeetings.jsx:316](../../client/src/pages/MonthMeetings.jsx#L316) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MonthMeetings.jsx:316](../../client/src/pages/MonthMeetings.jsx#L316) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 238: `params`

## pages/Unauthorized.jsx

Referenced by the application route/main import graph.

Declared route paths:

- unauthorized — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => { if (redirectTarget) { navigate(redirectTarget, { replace: true }); return; } navigate(-2); } (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (redirectTarget) { navigate(redirectTarget, { replace: true }); return; } navigate(-2); } — [Unauthorized.jsx:41](../../client/src/pages/Unauthorized.jsx#L41) |
