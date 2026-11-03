# Tickets: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Tickets/DepartmentTicketSettings.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tickets/ticket-settings/department-wise/:departmentId — no permission wrapper detected on this route-object chain
- /app/tickets/ticket-settings/:departmentName — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => navigate('/app/tickets/ticket-settings/${encodeURIComponent(value)}') (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate('/app/tickets/ticket-settings/${encodeURIComponent(value)}') — [DepartmentTicketSettings.jsx:113](../../client/src/pages/Tickets/DepartmentTicketSettings.jsx#L113) |
| 'Edit ${data.title}' (button) | No local render guard detected; page/API access still applies | mutation.isPending | () => openForm("edit", data) — [DepartmentTicketSettings.jsx:133](../../client/src/pages/Tickets/DepartmentTicketSettings.jsx#L133) |
| 'Delete ${data.title}' (button) | No local render guard detected; page/API access still applies | mutation.isPending | () => setModal({ mode: "delete", issue: data }) — [DepartmentTicketSettings.jsx:143](../../client/src/pages/Tickets/DepartmentTicketSettings.jsx#L143) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: Boolean(selectedDepartment) | No local disabled condition detected | Shared table export — [DepartmentTicketSettings.jsx:206](../../client/src/pages/Tickets/DepartmentTicketSettings.jsx#L206) |
| Add Ticket Issues (button) | selectedDepartment | No local disabled condition detected | () => openForm("add") — [DepartmentTicketSettings.jsx:221](../../client/src/pages/Tickets/DepartmentTicketSettings.jsx#L221) |
| modal?.mode === "edit" ? "Update" : "Submit" (button) | No local render guard detected; page/API access still applies | loading: mutation.isPending | No inline handler declared; may submit a form or delegate to a component — [DepartmentTicketSettings.jsx:256](../../client/src/pages/Tickets/DepartmentTicketSettings.jsx#L256) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **data**, line 131: `{ data }`
- **selectedDepartment**, line 69: `useMemo( () => accessibleDepartments.find((item) => departmentName ? item.department?.name === departmentName \|\| item.department?._id === departmentName : legacyDepartmentId && item.department?._id === legacyDepartmentId ), [accessibleDepartments, departmentName, legacyDepartmentId] )`
- **accessibleDepartments**, line 61: `useMemo(() => { if (isTopManagementUser) return departments; return departments.filter((item) => userDepartmentIds.has(item.department?._id?.toString()) ); }, [departments, isTopManagementUser, userDepartmentIds])`
- **isTopManagementUser**, line 39: `useMemo( () => roleTitles.some((roleTitle) => ["Master Admin", "Super Admin", "Top Management"].includes(roleTitle) ) \|\| auth?.user?.departments?.some( (department) => department?.name?.trim().toLowerCase() === "top management" ), [auth?.user?.departments, roleTitles] )`
- **roleTitles**, line 34: `useMemo( () => auth?.user?.role?.map((role) => role?.roleTitle \|\| "") \|\| [], [auth?.user?.role] )`
- **auth**, line 17: `useAuth()`
- **userDepartmentIds**, line 51: `useMemo( () => new Set( (auth?.user?.departments \|\| []) .map((department) => department?._id?.toString()) .filter(Boolean) ), [auth?.user?.departments] )`

## pages/Tickets/DepartmentWiseTickets.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tickets/department-wise-tickets — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Accept (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => acceptMutate(params.data) — [DepartmentWiseTickets.jsx:248](../../client/src/pages/Tickets/DepartmentWiseTickets.jsx#L248) |
| Assign (configured menu/action) | auth.user.role.length > 0 && (auth.user.role[0].roleTitle === "Master Admin" \|\| auth.user.role[0].roleTitle === "Super Admin" \|\| auth.user.role[0].roleTitle.endsWith("Admin")) | No local disabled condition detected | () => handleOpenAssignModal(params.data.id) — [DepartmentWiseTickets.jsx:259](../../client/src/pages/Tickets/DepartmentWiseTickets.jsx#L259) |
| Reject (configured menu/action) | auth.user.role.length > 0 && (auth.user.role[0].roleTitle === "Master Admin" \|\| auth.user.role[0].roleTitle === "Super Admin" \|\| auth.user.role[0].roleTitle.endsWith("Admin")) | No local disabled condition detected | () => rejectMutate(params.data) — [DepartmentWiseTickets.jsx:263](../../client/src/pages/Tickets/DepartmentWiseTickets.jsx#L263) |
| Advanced filter (table-generated utility) | NOT (isLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DepartmentWiseTickets.jsx:288](../../client/src/pages/Tickets/DepartmentWiseTickets.jsx#L288) |
| Assign (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [DepartmentWiseTickets.jsx:322](../../client/src/pages/Tickets/DepartmentWiseTickets.jsx#L322) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 243: `params`
- **auth**, line 17: `useAuth()`
- **isLoading**, line 69: `useQuery({ queryKey: ["tickets"], queryFn: async () => { try { const response = await axios.get("/api/tickets/get-tickets"); return response.data; } catch (error) { throw new Error(error.response.data.message); } }, })`

## pages/Tickets/ManageTicketsHome.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tickets/manage-tickets — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { dispatch(setSelectedDepartment(params.data.mongoId)); navigate('${params.value}'); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { dispatch(setSelectedDepartment(params.data.mongoId)); navigate('${params.value}'); } — [ManageTicketsHome.jsx:69](../../client/src/pages/Tickets/ManageTicketsHome.jsx#L69) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 67: `params`

## pages/Tickets/RaiseTicket.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tickets/raise-ticket — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewTicketDetails(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewTicketDetails(params.data) — [RaiseTicket.jsx:308](../../client/src/pages/Tickets/RaiseTicket.jsx#L308) |
| Permanently delete ticket (button) | params.data.status === "Open" | isDeletingTicket | () => setTicketToDelete(params.data) — [RaiseTicket.jsx:315](../../client/src/pages/Tickets/RaiseTicket.jsx#L315) |
| Icon/action: IconButton (button) | No local render guard detected; page/API access still applies | value?.length >= 5 | No inline handler declared; may submit a form or delegate to a component — [RaiseTicket.jsx:544](../../client/src/pages/Tickets/RaiseTicket.jsx#L544) |
| Submit (button) | No local render guard detected; page/API access still applies | pendingRaise; loading: pendingRaise | No inline handler declared; may submit a form or delegate to a component — [RaiseTicket.jsx:642](../../client/src/pages/Tickets/RaiseTicket.jsx#L642) |
| Advanced filter (table-generated utility) | NOT (ticketsLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [RaiseTicket.jsx:662](../../client/src/pages/Tickets/RaiseTicket.jsx#L662) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 306: `params`
- **isDeletingTicket**, line 185: `useMutation({ mutationFn: async (ticketId) => { const response = await axios.delete('/api/tickets/${ticketId}'); return response.data; }, onSuccess: (data) => { toast.success(data.message); setTicketToDelete(null); queryClient.invalidateQueries({ queryKey: ["my-tickets"] }); queryClient.invalidateQueries({ queryKey: ["tickets"] }); }, onError: (error) => { toast.error(error.response?.data?.message \|\| "Unable to delete ticket"); }, })`

## pages/Tickets/Tables/AcceptedTickets.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Support (configured menu/action) | showOtherActions | No local disabled condition detected | () => handleSupportTicket(params.data.id) — [AcceptedTickets.jsx:311](../../client/src/pages/Tickets/Tables/AcceptedTickets.jsx#L311) |
| Escalate (configured menu/action) | canManageAssignments AND showOtherActions | No local disabled condition detected | () => handleEscalateTicket(params.data) — [AcceptedTickets.jsx:317](../../client/src/pages/Tickets/Tables/AcceptedTickets.jsx#L317) |
| Close (configured menu/action) | showOtherActions | No local disabled condition detected | () => handleCloseTicket(params.data.id) — [AcceptedTickets.jsx:324](../../client/src/pages/Tickets/Tables/AcceptedTickets.jsx#L324) |
| Action: () => handleViewTicket(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewTicket(params.data) — [AcceptedTickets.jsx:333](../../client/src/pages/Tickets/Tables/AcceptedTickets.jsx#L333) |
| Advanced filter (table-generated utility) | !isLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AcceptedTickets.jsx:398](../../client/src/pages/Tickets/Tables/AcceptedTickets.jsx#L398) |
| Submit (button) | No local render guard detected; page/API access still applies | isGetSupportPending; loading: isGetSupportPending | No inline handler declared; may submit a form or delegate to a component — [AcceptedTickets.jsx:478](../../client/src/pages/Tickets/Tables/AcceptedTickets.jsx#L478) |
| Escalate Ticket (button) | No local render guard detected; page/API access still applies | isEscalatePending; loading: isEscalatePending | No inline handler declared; may submit a form or delegate to a component — [AcceptedTickets.jsx:540](../../client/src/pages/Tickets/Tables/AcceptedTickets.jsx#L540) |
| Close Ticket (button) | No local render guard detected; page/API access still applies | isClosing; loading: isClosing | No inline handler declared; may submit a form or delegate to a component — [AcceptedTickets.jsx:743](../../client/src/pages/Tickets/Tables/AcceptedTickets.jsx#L743) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 297: `params`
- **canManageAssignments**, line 307: `roleTitle.endsWith("Admin")`
- **roleTitle**, line 306: `auth?.user?.role?.[0]?.roleTitle \|\| ""`
- **auth**, line 42: `useAuth()`
- **isLoading**, line 135: `useQuery({ queryKey: ["accepted-tickets"], queryFn: async () => { try { const response = await axios.get( '/api/tickets/ticket-filter/accept/${departmentId}', ); const filtered = response.data; const hasAssigned = filtered.some( (ticket) => ticket.assignees?.length > 0, ); return filtered; } catch (error) { console.error("Error fetching tickets:", error); throw new Error("Failed to fetch tickets"); } }, })`
- **isGetSupportPending**, line 201: `useMutation({ mutationKey: ["get-support"], mutationFn: async (data) => { const response = await axios.post('/api/tickets/support-ticket', data); return response.data; }, onSuccess: function (data) { toast.success(data.message \|\| "Support ticket created successfully"); queryClient.invalidateQueries({ queryKey: ["accepted-tickets"] }); queryClient.invalidateQueries({ queryKey: ["tickets-data"] }); resetSupportTicketForm(); setOpenModal(false); }, onError: function (error) { toast.error( error.response.data.message \|\| "Failed to create support ticket", ); }, })`
- **isEscalatePending**, line 220: `useMutation({ mutationKey: ["escalate-ticket"], mutationFn: async (ticketDetails) => { const response = await axios.patch("/api/tickets/escalate-ticket", { ticketId: esCalatedTicket.id, description: ticketDetails.description, departmentIds: [ticketDetails.departmentIds], }); return response.data; }, onSuccess: (data) => { setEscalateModal(false); resetEscalateForm(); toast.success(data.message \|\| "Ticket escalated successfully"); queryClient.invalidateQueries({ queryKey: ["accepted-tickets"] }); queryClient.invalidateQueries({ queryKey: ["tickets-data"] }); }, onError: (error) => { toast.error(error.response.data.message \|\| "Failed to escalate ticket"); }, })`
- **isClosing**, line 179: `useMutation({ mutationKey: ["close-ticket"], mutationFn: async ({ ticketId, closingRemark, closingCategories }) => { const response = await axios.patch("/api/tickets/close-ticket", { ticketId, closingRemark, closingCategories, }); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Ticket closed successfully"); queryClient.invalidateQueries({ queryKey: ["accepted-tickets"] }); queryClient.invalidateQueries({ queryKey: ["tickets-data"] }); resetCloseForm(); setCloseModal(false); }, onError: (err) => { toast.error(err.response.data.message \|\| "Failed to close ticket"); }, })`

## pages/Tickets/Tables/AssignedTickets.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Re-Assign (configured menu/action) | canReassignTicket | No local disabled condition detected | () => handleOpenAssignModal(params.data.id) — [AssignedTickets.jsx:338](../../client/src/pages/Tickets/Tables/AssignedTickets.jsx#L338) |
| Escalate (configured menu/action) | canEscalateTicket | No local disabled condition detected | () => handleEscalateTicket(params.data) — [AssignedTickets.jsx:346](../../client/src/pages/Tickets/Tables/AssignedTickets.jsx#L346) |
| Support (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleSupportTicket(params.data.id) — [AssignedTickets.jsx:352](../../client/src/pages/Tickets/Tables/AssignedTickets.jsx#L352) |
| Close (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleCloseTicket(params.data.id) — [AssignedTickets.jsx:357](../../client/src/pages/Tickets/Tables/AssignedTickets.jsx#L357) |
| Action: () => handleViewTicket(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewTicket(params.data) — [AssignedTickets.jsx:365](../../client/src/pages/Tickets/Tables/AssignedTickets.jsx#L365) |
| Advanced filter (table-generated utility) | !isClosingTicket; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AssignedTickets.jsx:567](../../client/src/pages/Tickets/Tables/AssignedTickets.jsx#L567) |
| Assign (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AssignedTickets.jsx:610](../../client/src/pages/Tickets/Tables/AssignedTickets.jsx#L610) |
| Submit (button) | No local render guard detected; page/API access still applies | isGetSupportPending; loading: isGetSupportPending | No inline handler declared; may submit a form or delegate to a component — [AssignedTickets.jsx:642](../../client/src/pages/Tickets/Tables/AssignedTickets.jsx#L642) |
| Escalate Ticket (button) | No local render guard detected; page/API access still applies | isEscalatePending; loading: isEscalatePending | No inline handler declared; may submit a form or delegate to a component — [AssignedTickets.jsx:723](../../client/src/pages/Tickets/Tables/AssignedTickets.jsx#L723) |
| Close Ticket (button) | No local render guard detected; page/API access still applies | isClosingTicket; loading: isClosingTicket | No inline handler declared; may submit a form or delegate to a component — [AssignedTickets.jsx:912](../../client/src/pages/Tickets/Tables/AssignedTickets.jsx#L912) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **canReassignTicket**, line 332: `isTop`
- **isTop**, line 47: `useTopDepartment()`
- **params**, line 323: `params`
- **canEscalateTicket**, line 333: `roleTitle.endsWith("Admin") \|\| isTop`
- **roleTitle**, line 331: `auth?.user?.role?.[0]?.roleTitle \|\| ""`
- **auth**, line 37: `useAuth()`
- **isClosingTicket**, line 381: `useMutation({ mutationKey: ["close-ticket"], mutationFn: async ({ ticketId, closingRemark, closingCategories }) => { const response = await axios.patch("/api/tickets/close-ticket", { ticketId, closingRemark, closingCategories, }); return response.data; }, onSuccess: (data) => { toast.success(data.message); queryClient.invalidateQueries({ queryKey: ["assigned-tickets"] }); queryClient.invalidateQueries({ queryKey: ["tickets-data"] }); resetCloseForm(); setCloseModal(false); }, onError: (err) => { toast.error(err.response?.data?.message \|\| "Failed to close ticket"); }, })`
- **isGetSupportPending**, line 403: `useMutation({ mutationKey: ["get-support"], mutationFn: async (data) => { const response = await axios.post('/api/tickets/support-ticket', data); return response.data; }, onSuccess: function (data) { toast.success(data.message \|\| "Support ticket created successfully"); queryClient.invalidateQueries({ queryKey: ["assigned-tickets"] }); queryClient.invalidateQueries({ queryKey: ["tickets-data"] }); resetSupportTicketForm(); setOpenSupportModal(false); }, onError: function (error) { toast.error( error.response?.data?.message \|\| "Failed to create support ticket", ); }, })`
- **isEscalatePending**, line 516: `useMutation({ mutationKey: ["escalate-ticket"], mutationFn: async (ticketDetails) => { const response = await axios.patch("/api/tickets/escalate-ticket", { ticketId: esCalatedTicket.id, description: ticketDetails.description, departmentIds: ticketDetails.departmentIds, }); return response.data; }, onSuccess: (data) => { setEscalateModal(false); resetEscalateForm(); toast.success(data.message \|\| "Ticket escalated successfully"); queryClient.invalidateQueries({ queryKey: ["supported-tickets"] }); queryClient.invalidateQueries({ queryKey: ["tickets-data"] }); }, onError: (error) => { toast.error(error.response.data.message \|\| "Failed to escalate ticket"); }, })`

## pages/Tickets/Tables/ClosedTickets.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewTicketDetails(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewTicketDetails(params.data) — [ClosedTickets.jsx:169](../../client/src/pages/Tickets/Tables/ClosedTickets.jsx#L169) |
| Advanced filter (table-generated utility) | NOT (isLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ClosedTickets.jsx:188](../../client/src/pages/Tickets/Tables/ClosedTickets.jsx#L188) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 167: `params`
- **data**, line 34: `useQuery({ queryKey: ["closed-tickets", departmentId], queryFn: async () => { const response = await axios.get( '/api/tickets/ticket-filter/close/${departmentId}', ); return response.data \|\| []; }, initialData: [], })`
- **isLoading**, line 34: `useQuery({ queryKey: ["closed-tickets", departmentId], queryFn: async () => { const response = await axios.get( '/api/tickets/ticket-filter/close/${departmentId}', ); return response.data \|\| []; }, initialData: [], })`

## pages/Tickets/Tables/EscalatedTickets.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Close (configured menu/action) | isClosed | No local disabled condition detected | () => { setClosingTicketId(params.data.id); setCloseModal(true); } — [EscalatedTickets.jsx:306](../../client/src/pages/Tickets/Tables/EscalatedTickets.jsx#L306) |
| Action: () => handleViewTicket(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewTicket(params.data) — [EscalatedTickets.jsx:316](../../client/src/pages/Tickets/Tables/EscalatedTickets.jsx#L316) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [EscalatedTickets.jsx:339](../../client/src/pages/Tickets/Tables/EscalatedTickets.jsx#L339) |
| Close Ticket (button) | No local render guard detected; page/API access still applies | isClosingTicket; loading: isClosingTicket | No inline handler declared; may submit a form or delegate to a component — [EscalatedTickets.jsx:480](../../client/src/pages/Tickets/Tables/EscalatedTickets.jsx#L480) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isClosed**, line 304: `params.data.escalatedStatus === "Closed"`
- **params**, line 294: `params`
- **isClosingTicket**, line 93: `useMutation({ mutationKey: ["close-ticket"], mutationFn: async ({ ticketId, closingRemark, closingCategories }) => { const response = await axios.patch("/api/tickets/close-ticket", { ticketId, closingRemark, closingCategories, }); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Ticket closed successfully"); queryClient.invalidateQueries({ queryKey: ["escalate-tickets"], }); }, onError: (err) => { toast.error(err.response.data.message \|\| "Failed to close ticket"); }, })`

## pages/Tickets/Tables/RecievedTickets.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewTicket(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewTicket(params.data) — [RecievedTickets.jsx:245](../../client/src/pages/Tickets/Tables/RecievedTickets.jsx#L245) |
| Accept (configured menu/action) | auth.user.role.length > 0 && // Case 1: If user is in Top Management & ticket is for Top Management ((auth.user.role[0].roleTitle === "Top Management" && params.data.raisedToDepartment === "Top Management") \|\| // Case 2: If user is not Top Management auth.user.role[0].roleTitle !== "Top Management") | No local disabled condition detected | () => acceptMutate(params.data) — [RecievedTickets.jsx:264](../../client/src/pages/Tickets/Tables/RecievedTickets.jsx#L264) |
| Assign (configured menu/action) | auth.user.role.length > 0 && (auth.user.role[0].roleTitle === "Master Admin" \|\| auth.user.role[0].roleTitle === "Super Admin" \|\| auth.user.role[0].roleTitle.endsWith("Admin")) | No local disabled condition detected | () => handleOpenAssignModal(params.data.id) — [RecievedTickets.jsx:283](../../client/src/pages/Tickets/Tables/RecievedTickets.jsx#L283) |
| Reject (configured menu/action) | auth.user.role.length > 0 && (auth.user.role[0].roleTitle === "Master Admin" \|\| auth.user.role[0].roleTitle === "Super Admin" \|\| auth.user.role[0].roleTitle.endsWith("Admin")) | No local disabled condition detected | () => handleRejectClick(params.data) — [RecievedTickets.jsx:287](../../client/src/pages/Tickets/Tables/RecievedTickets.jsx#L287) |
| Advanced filter (table-generated utility) | NOT (isLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [RecievedTickets.jsx:314](../../client/src/pages/Tickets/Tables/RecievedTickets.jsx#L314) |
| Assign (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [RecievedTickets.jsx:396](../../client/src/pages/Tickets/Tables/RecievedTickets.jsx#L396) |
| Icon/action: handleRejectSubmit (button) | No local render guard detected; page/API access still applies | !rejectionReason.trim() \|\| rejectPending | handleRejectSubmit — [RecievedTickets.jsx:414](../../client/src/pages/Tickets/Tables/RecievedTickets.jsx#L414) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 243: `params`
- **auth**, line 23: `useAuth()`
- **isLoading**, line 47: `useQuery({ queryKey: ["tickets"], queryFn: async () => { try { const response = await axios.get( '/api/tickets/get-tickets/${departmentId}', ); return response.data; } catch (error) { throw new Error(error.response.data.message); } }, })`

## pages/Tickets/Tables/SupportTickets.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Accept (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => acceptTicket(params.data.id) — [SupportTickets.jsx:507](../../client/src/pages/Tickets/Tables/SupportTickets.jsx#L507) |
| Re-Assign (configured menu/action) | canManageAssignments | No local disabled condition detected | () => handleOpenAssignModal(params.data.id) — [SupportTickets.jsx:513](../../client/src/pages/Tickets/Tables/SupportTickets.jsx#L513) |
| Escalate (configured menu/action) | canManageAssignments | No local disabled condition detected | () => handleEscalateTicket(params.data) — [SupportTickets.jsx:517](../../client/src/pages/Tickets/Tables/SupportTickets.jsx#L517) |
| Close (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleCloseTicket(params.data.id) — [SupportTickets.jsx:524](../../client/src/pages/Tickets/Tables/SupportTickets.jsx#L524) |
| Action: () => handleViewTicket(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewTicket(params.data) — [SupportTickets.jsx:531](../../client/src/pages/Tickets/Tables/SupportTickets.jsx#L531) |
| Advanced filter (table-generated utility) | !isClosingTicket; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [SupportTickets.jsx:561](../../client/src/pages/Tickets/Tables/SupportTickets.jsx#L561) |
| Assign (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [SupportTickets.jsx:604](../../client/src/pages/Tickets/Tables/SupportTickets.jsx#L604) |
| Escalate Ticket (button) | No local render guard detected; page/API access still applies | isEscalatePending; loading: isEscalatePending | No inline handler declared; may submit a form or delegate to a component — [SupportTickets.jsx:679](../../client/src/pages/Tickets/Tables/SupportTickets.jsx#L679) |
| Close Ticket (button) | No local render guard detected; page/API access still applies | isClosingTicket; loading: isClosingTicket | No inline handler declared; may submit a form or delegate to a component — [SupportTickets.jsx:869](../../client/src/pages/Tickets/Tables/SupportTickets.jsx#L869) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 494: `params`
- **canManageAssignments**, line 223: `roleTitle.endsWith("Admin")`
- **roleTitle**, line 221: `auth?.user?.role?.[0]?.roleTitle \|\| ""`
- **auth**, line 37: `useAuth()`
- **isClosingTicket**, line 272: `useMutation({ mutationKey: ["close-ticket"], mutationFn: async ({ ticketId, closingRemark, closingCategories }) => { const response = await axios.patch("/api/tickets/close-ticket", { ticketId, closingRemark, closingCategories, }); return response.data; }, onSuccess: (data) => { toast.success(data.message); resetCloseForm(); setCloseModal(false); queryClient.invalidateQueries({ queryKey: ["supported-tickets"] }); queryClient.invalidateQueries({ queryKey: ["tickets-data"] }); queryClient.invalidateQueries({ queryKey: ["closed-tickets"] }); }, onError: (err) => { toast.error(err.response?.data?.message \|\| "Failed to close ticket"); }, })`
- **isEscalatePending**, line 380: `useMutation({ mutationKey: ["escalate-ticket"], mutationFn: async (ticketDetails) => { const response = await axios.patch("/api/tickets/escalate-ticket", { ticketId: esCalatedTicket.id, description: ticketDetails.description, departmentIds: ticketDetails.departmentIds, }); return response.data; }, onSuccess: (data) => { setEscalateModal(false); resetEscalateForm(); toast.success(data.message \|\| "Ticket escalated successfully"); queryClient.invalidateQueries({ queryKey: ["supported-tickets"] }); queryClient.invalidateQueries({ queryKey: ["tickets-data"] }); }, onError: (error) => { toast.error(error.response.data.message \|\| "Failed to escalate ticket"); }, })`

## pages/Tickets/TeamMembers.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tickets/team-members — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | !isTeamMembers; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [TeamMembers.jsx:98](../../client/src/pages/Tickets/TeamMembers.jsx#L98) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isTeamMembers**, line 20: `useQuery({ queryKey: ["teamMembers"], queryFn: async () => { try { const response = await axios.get( '/api/tickets/get-team-members/${selectedDepartment}' ); return response.data; } catch (error) { console.error(error); } }, })`
- **selectedDepartment**, line 14: `useSelector( (state) => state.performance.selectedDepartment )`

## pages/Tickets/TicketReports.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tickets/reports — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { handleSelectedMeeting(params.data); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { handleSelectedMeeting(params.data); } — [TicketReports.jsx:207](../../client/src/pages/Tickets/TicketReports.jsx#L207) |
| Export (table-generated utility) | !isLoading; exportData: true | No local disabled condition detected | Shared table export — [TicketReports.jsx:406](../../client/src/pages/Tickets/TicketReports.jsx#L406) |
| Advanced filter (table-generated utility) | !isLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [TicketReports.jsx:406](../../client/src/pages/Tickets/TicketReports.jsx#L406) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 204: `params`
- **isLoading**, line 106: `useQuery({ queryKey: [ "tickets-data", "report", dateRange.startDate, dateRange.endDate, pagination.page, pagination.limit, debouncedTicketSearch, ], placeholderData: keepPreviousData, queryFn: async () => { try { const response = await axios.get('/api/tickets/get-all-tickets', { params: { startDate: toUtcDayBoundary(dateRange.startDate), endDate: toUtcDayBoundary(dateRange.endDate, true), page: pagination.page, limit: pagination.limit, search: debouncedTicketSearch \|\| undefined, }, }); const responsePagination = response.data.pagination; setPagination((current) => ({ page: Number(responsePagination?.page) \|\| current.page, limit: Number(responsePagination?.limit) \|\| current.limit, total: Number(responsePagination?.total) \|\| 0, })); // queryKey: ["tickets-data", departmentId], // enabled: B…`

## pages/Tickets/TicketSettings.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => toggleRowExpansion(params.data.Id) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => toggleRowExpansion(params.data.Id) — [TicketSettings.jsx:64](../../client/src/pages/Tickets/TicketSettings.jsx#L64) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [TicketSettings.jsx:157](../../client/src/pages/Tickets/TicketSettings.jsx#L157) |
| Approve (button) | isExpanded | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [TicketSettings.jsx:201](../../client/src/pages/Tickets/TicketSettings.jsx#L201) |
| Reject (button) | isExpanded | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [TicketSettings.jsx:204](../../client/src/pages/Tickets/TicketSettings.jsx#L204) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 60: `params`
- **isExpanded**, line 164: `expandedRow === props.data.id`

## pages/Tickets/TicketSettingsnew.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tickets/ticket-settings/others-settings — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => setOpen(!open) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpen(!open) — [TicketSettingsnew.jsx:124](../../client/src/pages/Tickets/TicketSettingsnew.jsx#L124) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [TicketSettingsnew.jsx:174](../../client/src/pages/Tickets/TicketSettingsnew.jsx#L174) |
