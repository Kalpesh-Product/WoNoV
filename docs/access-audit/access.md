# Access: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Access/AccessProfile.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/access/permissions/ — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| title (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | value — [AccessProfile.jsx:97](../../client/src/pages/Access/AccessProfile.jsx#L97) |
| Action: () => navigate('${module}', { state: { module, permissions, user, currentPermissions: accessProfile?.permissions \|\| [], }, }) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate('${module}', { state: { module, permissions, user, currentPermissions: accessProfile?.permissions \|\| [], }, }) — [AccessProfile.jsx:201](../../client/src/pages/Access/AccessProfile.jsx#L201) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **permissions**, line 199: `[module, permissions]`
- **user**, line 38: `useSelector((state) => state.hr.selectedEmployee)`
- **accessProfile**, line 48: `useQuery({ queryKey: ["userPermissions", user?._id], queryFn: fetchUserPermissions, enabled: !!user?._id, })`

## pages/Access/ModulePermissions.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/access/permissions/:module — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| isEditing ? "Cancel" : "Edit" (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setIsEditing((prev) => !prev) — [ModulePermissions.jsx:150](../../client/src/pages/Access/ModulePermissions.jsx#L150) |
| Action: () => setFilterDrawerOpen(true) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setFilterDrawerOpen(true) — [ModulePermissions.jsx:174](../../client/src/pages/Access/ModulePermissions.jsx#L174) |
| Update Permissions (button) | isEditing | mutation.isPending; loading: mutation.isPending | No inline handler declared; may submit a form or delegate to a component — [ModulePermissions.jsx:244](../../client/src/pages/Access/ModulePermissions.jsx#L244) |
| Apply Filters (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | applyFilters — [ModulePermissions.jsx:312](../../client/src/pages/Access/ModulePermissions.jsx#L312) |
| Clear Filters (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | clearFilters — [ModulePermissions.jsx:313](../../client/src/pages/Access/ModulePermissions.jsx#L313) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isEditing**, line 31: `useState(false)`
