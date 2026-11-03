# Printout: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Printout/AddPrintout.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/printouts/add-printout — `<PerformancePermissionRoute element={<AddPrintout />} permissions={[PERMISSIONS.PRINTOUT_ADD_PRINTOUT]} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Submit (button) | No local render guard detected; page/API access still applies | isAddingPrintout; loading: isAddingPrintout | No inline handler declared; may submit a form or delegate to a component — [AddPrintout.jsx:507](../../client/src/pages/Printout/AddPrintout.jsx#L507) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [AddPrintout.jsx:513](../../client/src/pages/Printout/AddPrintout.jsx#L513) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isAddingPrintout**, line 140: `useMutation({ mutationKey: ["addPrintout"], mutationFn: async (formData) => { const payload = { takenBy: auth?.user?._id, takenAt: dayjs(formData.dateOfPrintout) .hour(dayjs(formData.timeOfPrintout).hour()) .minute(dayjs(formData.timeOfPrintout).minute()) .second(0) .millisecond(0) .toISOString(), location: formData.location, unit: formData.unit, client: formData.client, requestedBy: formData.requestedBy, department: isBiznestClient ? formData.department \|\| null : null, printoutCount: Number(formData.printoutCount), remark: formData.remarks?.trim() \|\| "", }; const response = await axios.post("/api/printout", payload); return response.data; }, onSuccess: (data) => { toast.success(data?.message \|\| "Printout added successfully"); queryClient.invalidateQueries({ queryKey: ["printouts"] }); res…`
- **auth**, line 32: `useAuth()`
- **isBiznestClient**, line 63: `selectedClient === companyId`
- **selectedClient**, line 60: `watch("client")`

## pages/Printout/ManagePrintout.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/printouts/manage-printout — `<PerformancePermissionRoute element={<ManagePrintout />} permissions={[PERMISSIONS.PRINTOUT_MANAGE_PRINTOUT]} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View printout details (button) | data.rawPrintout.isDeleted | No local disabled condition detected | () => openViewModal(data) — [ManagePrintout.jsx:464](../../client/src/pages/Printout/ManagePrintout.jsx#L464) |
| Restore printout (button) | data.rawPrintout.isDeleted | isDeletingPrintout \|\| isRestoringPrintout | () => handleRestorePrintout(data) — [ManagePrintout.jsx:472](../../client/src/pages/Printout/ManagePrintout.jsx#L472) |
| Permanently delete printout (button) | data.rawPrintout.isDeleted | isDeletingPrintout \|\| isRestoringPrintout | () => handleDeletePrintout(data) — [ManagePrintout.jsx:482](../../client/src/pages/Printout/ManagePrintout.jsx#L482) |
| View printout details (button) | NOT (data.rawPrintout.isDeleted) | No local disabled condition detected | () => openViewModal(data) — [ManagePrintout.jsx:495](../../client/src/pages/Printout/ManagePrintout.jsx#L495) |
| Delete printout (button) | NOT (data.rawPrintout.isDeleted) | isDeletingPrintout \|\| (!canPermanentlyDelete && isPermanentDeleteDepartment(data.rawPrintout.department)) | () => handleDeletePrintout(data) — [ManagePrintout.jsx:503](../../client/src/pages/Printout/ManagePrintout.jsx#L503) |
| Edit (configured menu/action) | NOT (data.rawPrintout.isDeleted) | No local disabled condition detected | () => openEditModal(data) — [ManagePrintout.jsx:525](../../client/src/pages/Printout/ManagePrintout.jsx#L525) |
| Action: handleOpenCalendar (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleOpenCalendar — [ManagePrintout.jsx:557](../../client/src/pages/Printout/ManagePrintout.jsx#L557) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ManagePrintout.jsx:583](../../client/src/pages/Printout/ManagePrintout.jsx#L583) |
| Save (button) | No local render guard detected; page/API access still applies | isUpdatingPrintout; loading: isUpdatingPrintout | No inline handler declared; may submit a form or delegate to a component — [ManagePrintout.jsx:943](../../client/src/pages/Printout/ManagePrintout.jsx#L943) |
| Cancel (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | closeEditModal — [ManagePrintout.jsx:949](../../client/src/pages/Printout/ManagePrintout.jsx#L949) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **data**, line 460: `{ data }`
- **isDeletingPrintout**, line 259: `useMutation( { mutationKey: ["deletePrintout"], mutationFn: async (printoutId) => { const response = await axios.delete('/api/printout/${printoutId}'); return response.data; }, onSuccess: (data) => { toast.success(data?.message \|\| "Printout deleted successfully"); setConfirmationAction(null); queryClient.invalidateQueries({ queryKey: ["printouts"] }); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| "An error occurred while deleting printout", ); }, }, )`
- **isRestoringPrintout**, line 280: `useMutation({ mutationKey: ["restorePrintout"], mutationFn: async (printoutId) => { const response = await axios.patch( '/api/printout/${printoutId}/restore', ); return response.data; }, onSuccess: (data) => { toast.success(data?.message \|\| "Printout restored successfully"); setConfirmationAction(null); queryClient.invalidateQueries({ queryKey: ["printouts"] }); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| "An error occurred while restoring printout", ); }, })`
- **canPermanentlyDelete**, line 104: `(auth?.user?.departments \|\| []).some( isPermanentDeleteDepartment, )`
- **auth**, line 100: `useAuth()`
- **isPermanentDeleteDepartment**, line 66: `(department) => getId(department) === TECH_DEPARTMENT_ID \|\| PERMANENT_DELETE_DEPARTMENTS.has(department?.name?.trim().toLowerCase())`
- **isUpdatingPrintout**, line 302: `useMutation( { mutationKey: ["updatePrintout"], mutationFn: async (formData) => { const payload = { takenAt: dayjs(formData.dateOfPrintout) .hour(dayjs(formData.timeOfPrintout).hour()) .minute(dayjs(formData.timeOfPrintout).minute()) .second(0) .millisecond(0) .toISOString(), location: formData.location, unit: formData.unit, client: formData.client, requestedBy: formData.requestedBy, department: isBiznestClient ? formData.department \|\| null : null, printoutCount: Number(formData.printoutCount), remark: formData.remarks?.trim() \|\| "", }; const response = await axios.patch( '/api/printout/${selectedPrintout._id}', payload, ); return response.data; }, onSuccess: (data) => { toast.success(data?.message \|\| "Printout updated successfully"); queryClient.invalidateQueries({ queryKey: ["printouts"]…`
- **isBiznestClient**, line 137: `selectedClient === companyId`
- **selectedClient**, line 134: `watch("client")`
- **selectedPrintout**, line 108: `useState(null)`

## pages/Printout/ReportPrintout.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/printouts/report-printout — `<PerformancePermissionRoute element={<ReportPrintout />} permissions={[PERMISSIONS.PRINTOUT_REPORT_PRINTOUT]} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: handleOpenCalendar (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleOpenCalendar — [ReportPrintout.jsx:275](../../client/src/pages/Printout/ReportPrintout.jsx#L275) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ReportPrintout.jsx:301](../../client/src/pages/Printout/ReportPrintout.jsx#L301) |
| Export (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleExport — [ReportPrintout.jsx:302](../../client/src/pages/Printout/ReportPrintout.jsx#L302) |
