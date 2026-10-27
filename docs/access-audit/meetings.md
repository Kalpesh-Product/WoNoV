# Meetings: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Meetings/BookMeetings.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/meetings/book-meeting — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewDetails(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewDetails(params.data) — [BookMeetings.jsx:318](../../client/src/pages/Meetings/BookMeetings.jsx#L318) |
| Permanently delete meeting (button) | params.data.status === "Upcoming" | isDeletingMeeting | () => setMeetingToDelete(params.data) — [BookMeetings.jsx:325](../../client/src/pages/Meetings/BookMeetings.jsx#L325) |
| Add Review (configured menu/action) | canAddReview | No local disabled condition detected | () => handleAddReview(params.data) — [BookMeetings.jsx:340](../../client/src/pages/Meetings/BookMeetings.jsx#L340) |
| Next (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [BookMeetings.jsx:482](../../client/src/pages/Meetings/BookMeetings.jsx#L482) |
| Advanced filter (table-generated utility) | !isMyMeetingsPending; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [BookMeetings.jsx:490](../../client/src/pages/Meetings/BookMeetings.jsx#L490) |
| Update Meeting (button) | modalMode === "edit" | loading: updateMutation.isLoading | No inline handler declared; may submit a form or delegate to a component — [BookMeetings.jsx:668](../../client/src/pages/Meetings/BookMeetings.jsx#L668) |
| Submit (button) | modalMode === "review" | isAddReviewPending; loading: isAddReviewPending | No inline handler declared; may submit a form or delegate to a component — [BookMeetings.jsx:733](../../client/src/pages/Meetings/BookMeetings.jsx#L733) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 302: `params`
- **isDeletingMeeting**, line 222: `useMutation({ mutationFn: async (meetingId) => { const response = await axios.delete( '/api/meetings/my-meetings/${meetingId}', ); return response.data; }, onSuccess: (data) => { toast.success(data.message); setMeetingToDelete(null); queryClient.invalidateQueries({ queryKey: ["myMeetings"] }); }, onError: (error) => { toast.error(error.response?.data?.message \|\| "Unable to delete meeting"); }, })`
- **canAddReview**, line 311: `meetingReviews.length === 0 && userName === params.data.bookedBy && params.data.status === "Completed"`
- **userName**, line 310: `'${auth.user?.firstName} ${auth.user?.lastName}'`
- **auth**, line 42: `useAuth()`
- **isMyMeetingsPending**, line 176: `useQuery({ queryKey: ["myMeetings"], queryFn: async () => { try { const response = await axios.get("/api/meetings/my-meetings"); return response.data; } catch (error) { toast.error(error \|\| "Failed to load your bookings"); } }, })`
- **isAddReviewPending**, line 207: `useMutation({ mutationKey: ["addReview"], mutationFn: async (review) => { const response = await axios.post("/api/meetings/create-review", review); return response.data; }, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["myMeetings"] }); toast.success(data.message \|\| "REVIEW added"); }, onError: (error) => { toast.error(error.message \|\| "Failed to add review"); }, })`

## pages/Meetings/ExternalMeetingClients.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/manage-meetings/external-clients — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/manage-meetings/external-clients — no permission wrapper detected on this route-object chain
- /app/meetings/manage-meetings/external-clients — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Verify Payment (configured menu/action) | isPaid && isFinance && paymentVerificationStatus === "Under Review" | No local disabled condition detected | () => handleVerifyPayment(params.data, "Verified") — [ExternalMeetingClients.jsx:1072](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1072) |
| Review Payment (configured menu/action) | isPaid && isFinance && paymentVerificationStatus === "Pending" | No local disabled condition detected | () => handleVerifyPayment(params.data, "Under Review") — [ExternalMeetingClients.jsx:1079](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1079) |
| Completed (configured menu/action) | isPaid && isFinance && paymentVerificationStatus === "Verified" | No local disabled condition detected | () => handleVerifyPayment(params.data, "Completed") — [ExternalMeetingClients.jsx:1086](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1086) |
| Update Payment Details (configured menu/action) | !isPaid AND !isFinance | No local disabled condition detected | () => handleOpenPaymentModal(params.data) — [ExternalMeetingClients.jsx:1094](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1094) |
| Update Checklist (configured menu/action) | !isOngoing && !isHousekeepingCompleted AND !isFinance | No local disabled condition detected | () => handleOpenChecklistModal("update", params.data._id) — [ExternalMeetingClients.jsx:1099](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1099) |
| Edit (configured menu/action) | canEditMeeting(params.data) AND !isFinance | No local disabled condition detected | () => handleEditMeeting("edit", params.data) — [ExternalMeetingClients.jsx:1104](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1104) |
| Mark As Ongoing (configured menu/action) | !isOngoing && !isHousekeepingPending AND !isFinance | No local disabled condition detected | () => handleOngoing("ongoing", params.data._id) — [ExternalMeetingClients.jsx:1109](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1109) |
| Mark As Completed (configured menu/action) | !isUpcoming AND !isFinance | No local disabled condition detected | () => handleCompleted("complete", params.data._id) — [ExternalMeetingClients.jsx:1113](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1113) |
| Cancel (configured menu/action) | isUpcoming AND !isFinance | No local disabled condition detected | () => handleSelectedMeeting("cancel", params.data) — [ExternalMeetingClients.jsx:1118](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1118) |
| Action: () => handleSelectedMeeting("viewDetails", params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleSelectedMeeting("viewDetails", params.data) — [ExternalMeetingClients.jsx:1128](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1128) |
| Export (table-generated utility) | NOT (isMeetingsLoading && meetings.length === 0); exportData: shouldShowExportButton | No local disabled condition detected | Shared table export — [ExternalMeetingClients.jsx:1155](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1155) |
| Advanced filter (table-generated utility) | NOT (isMeetingsLoading && meetings.length === 0); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ExternalMeetingClients.jsx:1155](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1155) |
| Icon/action: () => handleRemoveChecklistItem(index) (button) | modalMode === "update" AND checklists[selectedMeetingId]?.customItems?.length > 0 | No local disabled condition detected | () => handleRemoveChecklistItem(index) — [ExternalMeetingClients.jsx:1246](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1246) |
| Add (button) | modalMode === "update" | No local disabled condition detected | handleAddChecklistItem — [ExternalMeetingClients.jsx:1272](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1272) |
| Submit (button) | modalMode === "update" | isSubmitDisabled() | handleSubmitChecklist — [ExternalMeetingClients.jsx:1285](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1285) |
| Cancel Meeting (button) | modalMode === "cancel" | isCancelPending; loading: isCancelPending | No inline handler declared; may submit a form or delegate to a component — [ExternalMeetingClients.jsx:1551](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1551) |
| Extend Meeting (button) | modalMode === "extend" | isExtendPending; loading: isExtendPending | No inline handler declared; may submit a form or delegate to a component — [ExternalMeetingClients.jsx:1623](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1623) |
| Update Meeting (button) | modalMode === "edit" | isEditPending; loading: isEditPending | No inline handler declared; may submit a form or delegate to a component — [ExternalMeetingClients.jsx:1807](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L1807) |
| Save Payment Details (button) | No local render guard detected; page/API access still applies | isPaymentPending | No inline handler declared; may submit a form or delegate to a component — [ExternalMeetingClients.jsx:2010](../../client/src/pages/Meetings/ExternalMeetingClients.jsx#L2010) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isPaid**, line 1047: `params.data.paymentStatus === "Paid"`
- **params**, line 1044: `params`
- **isFinance**, line 132: `department?.name?.toLowerCase().includes("finance") \|\| location.pathname.includes("finance-dashboard")`
- **isOngoing**, line 1050: `status === "Ongoing"`
- **isHousekeepingCompleted**, line 1053: `housekeepingStatus === "Completed"`
- **canEditMeeting**, line 643: `(meeting) => { if (!meeting) return false; if ( meeting.meetingStatus === "Cancelled" \|\| meeting.meetingStatus === "Completed" ) { return false; } const meetingStart = dayjs(meeting.startTime); if (meetingStart.isAfter(currentTime)) { return true; } if (!hasSpecialEditWindowAccess) { return false; } return true; }`
- **hasSpecialEditWindowAccess**, line 160: `isAdminTimingUser \|\| canEditMeetingDate`
- **isAdminTimingUser**, line 146: `roleTitles.some((roleTitle) => adminTimingRoles.includes(roleTitle)) \|\| departmentNames.some((deptName) => ["Admin", "Administration"].includes(deptName), )`
- **roleTitles**, line 62: `auth?.user?.role?.map((role) => role?.roleTitle) \|\| []`
- **canEditMeetingDate**, line 157: `roleTitles.some((roleTitle) => meetingDateEditRoles.includes(roleTitle), )`
- **isHousekeepingPending**, line 1052: `housekeepingStatus === "Pending"`
- **isUpcoming**, line 1048: `status === "Upcoming"`
- **isMeetingsLoading**, line 304: `useQuery({ queryKey: financeView ? [ "meetings", "finance-external-meetings", meetingFilters.startDate, meetingFilters.endDate, pagination.page, pagination.limit, debouncedMeetingSearch, ] : [ "meetings", "external-meetings", meetingFilters.startDate, meetingFilters.endDate, "false", pagination.page, pagination.limit, debouncedMeetingSearch, ], placeholderData: keepPreviousData, queryFn: async () => { const response = await axios.get("/api/meetings/get-meetings", { params: financeView ? { startDate: meetingFilters.startDate, endDate: meetingFilters.endDate, type: "External", page: pagination.page, limit: pagination.limit, search: debouncedMeetingSearch \|\| undefined, searchContext: "external-table", } : { startDate: meetingFilters.startDate, endDate: meetingFilters.endDate, type: "External"…`
- **selectedMeetingId**, line 64: `useState(null)`
- **isSubmitDisabled**, line 807: `() => { if (!selectedMeetingId) return true; const { defaultItems, customItems } = checklists[selectedMeetingId] \|\| { defaultItems: [], customItems: [], }; return [...defaultItems, ...customItems].some((item) => !item.checked); }`
- **isCancelPending**, line 460: `useMutation({ mutationFn: async (data) => { const respone = await axios.patch( '/api/meetings/cancel-meeting/${selectedMeetingId}', data, ); refreshMeetingQueries(); return respone.data; }, onSuccess: (data) => { toast.success(data.message); }, onError: (error) => {}, })`
- **isExtendPending**, line 475: `useMutation({ mutationFn: async (data) => { const respone = await axios.patch('/api/meetings/extend-meeting', data); refreshMeetingQueries(); return respone.data; }, onSuccess: (data) => { toast.success(data.message); setDetailsModal(false); resetExtendMeeting(); }, onError: (error) => { toast.error(error.message); }, })`
- **isEditPending**, line 509: `useMutation({ mutationFn: async (data) => { const respone = await axios.patch( '/api/meetings/update-meeting-details', { ...data, meetingId: selectedMeetingId, }, ); return respone.data; }, onSuccess: (data) => { refreshMeetingQueries(); toast.success(data.message \|\| "UPDATED"); setDetailsModal(false); }, onError: (error) => { toast.error(error.message); }, })`
- **isPaymentPending**, line 531: `useMutation({ mutationKey: ["meeting-payment"], mutationFn: async (data) => { const response = await axios.patch( '/api/meetings/update-meeting/${data.get("meetingId")}', data, { headers: { "Content-Type": "multipart/form-data", }, }, ); return response.data; }, onSuccess: () => { toast.success("Payment details updated successfully"); refreshMeetingQueries(); setOpenPaymentModal(false); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| error?.response?.data?.error \|\| error?.message \|\| "Payment update failed", ); }, })`

## pages/Meetings/Forms/BookMeetingsForm.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Open Modal (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpen(true) — [BookMeetingsForm.jsx:58](../../client/src/pages/Meetings/Forms/BookMeetingsForm.jsx#L58) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [BookMeetingsForm.jsx:373](../../client/src/pages/Meetings/Forms/BookMeetingsForm.jsx#L373) |

## pages/Meetings/ManageMeetings.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/manage-meetings/internal-meetings — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/manage-meetings/internal-meetings — no permission wrapper detected on this route-object chain
- /app/meetings/manage-meetings/internal-meetings — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Update Checklist (configured menu/action) | !isOngoing && !isHousekeepingCompleted | No local disabled condition detected | () => handleOpenChecklistModal("update", params.data._id) — [ManageMeetings.jsx:877](../../client/src/pages/Meetings/ManageMeetings.jsx#L877) |
| Edit (configured menu/action) | isEditAllowed | No local disabled condition detected | () => handleEditMeeting("edit", params.data) — [ManageMeetings.jsx:882](../../client/src/pages/Meetings/ManageMeetings.jsx#L882) |
| Mark As Ongoing (configured menu/action) | !isOngoing && !isHousekeepingPending | No local disabled condition detected | () => handleOngoing("ongoing", params.data._id) — [ManageMeetings.jsx:887](../../client/src/pages/Meetings/ManageMeetings.jsx#L887) |
| Mark As Completed (configured menu/action) | !isUpcoming | No local disabled condition detected | () => handleCompleted("complete", params.data._id) — [ManageMeetings.jsx:891](../../client/src/pages/Meetings/ManageMeetings.jsx#L891) |
| Extend Meeting (configured menu/action) | !isUpcoming | No local disabled condition detected | () => handleExtendMeetingModal("extend", params.data) — [ManageMeetings.jsx:895](../../client/src/pages/Meetings/ManageMeetings.jsx#L895) |
| Cancel (configured menu/action) | isUpcoming | No local disabled condition detected | () => handleSelectedMeeting("cancel", params.data) — [ManageMeetings.jsx:900](../../client/src/pages/Meetings/ManageMeetings.jsx#L900) |
| Action: () => handleSelectedMeeting("viewDetails", params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleSelectedMeeting("viewDetails", params.data) — [ManageMeetings.jsx:908](../../client/src/pages/Meetings/ManageMeetings.jsx#L908) |
| Advanced filter (table-generated utility) | NOT (isMeetingsLoading && meetings.length === 0); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ManageMeetings.jsx:932](../../client/src/pages/Meetings/ManageMeetings.jsx#L932) |
| Icon/action: () => handleRemoveChecklistItem(index) (button) | modalMode === "update" AND checklists[selectedMeetingId]?.customItems?.length > 0 | No local disabled condition detected | () => handleRemoveChecklistItem(index) — [ManageMeetings.jsx:1022](../../client/src/pages/Meetings/ManageMeetings.jsx#L1022) |
| Add (button) | modalMode === "update" | No local disabled condition detected | handleAddChecklistItem — [ManageMeetings.jsx:1048](../../client/src/pages/Meetings/ManageMeetings.jsx#L1048) |
| Submit (button) | modalMode === "update" | isSubmitDisabled() | handleSubmitChecklist — [ManageMeetings.jsx:1061](../../client/src/pages/Meetings/ManageMeetings.jsx#L1061) |
| Cancel Meeting (button) | modalMode === "cancel" | isCancelPending; loading: isCancelPending | No inline handler declared; may submit a form or delegate to a component — [ManageMeetings.jsx:1206](../../client/src/pages/Meetings/ManageMeetings.jsx#L1206) |
| Extend Meeting (button) | modalMode === "extend" | isExtendPending; loading: isExtendPending | No inline handler declared; may submit a form or delegate to a component — [ManageMeetings.jsx:1278](../../client/src/pages/Meetings/ManageMeetings.jsx#L1278) |
| Update Meeting (button) | modalMode === "edit" | isUpdatePending; loading: isUpdatePending | No inline handler declared; may submit a form or delegate to a component — [ManageMeetings.jsx:1667](../../client/src/pages/Meetings/ManageMeetings.jsx#L1667) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isOngoing**, line 869: `status === "Ongoing"`
- **isHousekeepingCompleted**, line 872: `housekeepingStatus === "Completed"`
- **params**, line 863: `params`
- **isEditAllowed**, line 873: `canEditMeeting(params.data)`
- **canEditMeeting**, line 486: `(meeting) => { if (!meeting) return false; if ( meeting.meetingStatus === "Cancelled" \|\| meeting.meetingStatus === "Completed" ) { return false; } const meetingStart = dayjs(meeting.startTime); if (meetingStart.isAfter(currentTime)) { return true; } if (!hasSpecialEditWindowAccess) { return false; } return true; }`
- **hasSpecialEditWindowAccess**, line 141: `isAdminTimingUser \|\| canEditMeetingDate`
- **isAdminTimingUser**, line 127: `roleTitles.some((roleTitle) => adminTimingRoles.includes(roleTitle)) \|\| departmentNames.some((deptName) => ["Admin", "Administration"].includes(deptName), )`
- **canEditMeetingDate**, line 138: `roleTitles.some((roleTitle) => meetingDateEditRoles.includes(roleTitle), )`
- **isHousekeepingPending**, line 871: `housekeepingStatus === "Pending"`
- **isUpcoming**, line 867: `status === "Upcoming"`
- **isMeetingsLoading**, line 363: `useQuery({ queryKey: financeView ? [ "meetings", "finance-internal-meetings", meetingFilters.startDate, meetingFilters.endDate, pagination.page, pagination.limit, debouncedMeetingSearch, ] : [ "meetings", "internal-meetings", meetingFilters.startDate, meetingFilters.endDate, pagination.page, pagination.limit, debouncedMeetingSearch, ], placeholderData: keepPreviousData, queryFn: async () => { const response = await axios.get("/api/meetings/get-meetings", { params: financeView ? { startDate: meetingFilters.startDate, endDate: meetingFilters.endDate, type: "internal", page: pagination.page, limit: pagination.limit, search: debouncedMeetingSearch \|\| undefined, searchContext: "internal-table", } : { startDate: meetingFilters.startDate, endDate: meetingFilters.endDate, type: "internal", complet…`
- **selectedMeetingId**, line 48: `useState(null)`
- **isSubmitDisabled**, line 715: `() => { if (!selectedMeetingId) return true; const { defaultItems, customItems } = checklists[selectedMeetingId] \|\| { defaultItems: [], customItems: [], }; return [...defaultItems, ...customItems].some((item) => !item.checked); }`
- **isCancelPending**, line 553: `useMutation({ mutationFn: async (data) => { const respone = await axios.patch( '/api/meetings/cancel-meeting/${selectedMeetingId}', data, ); queryClient.invalidateQueries({ queryKey: ["meetings"] }); return respone.data; }, onSuccess: (data) => { toast.success(data.message); }, onError: (error) => { toast.error(error.response.data.message); }, })`
- **isExtendPending**, line 570: `useMutation({ mutationFn: async (data) => { const respone = await axios.patch('/api/meetings/extend-meeting', data); queryClient.invalidateQueries({ queryKey: ["meetings"] }); return respone.data; }, onSuccess: (data) => { toast.success(data.message); setDetailsModal(false); resetExtendMeeting(); }, onError: (error) => { toast.error(error.response.data.message); }, })`
- **isUpdatePending**, line 275: `useMutation({ mutationKey: ["update-meeting"], mutationFn: async (data) => { const response = await axios.patch( "/api/meetings/update-meeting-details", // { ...data, meetingId: selectedMeetingId, internalParticipants: [] } { ...data, meetingId: selectedMeetingId }, ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "UPDATED"); queryClient.invalidateQueries({ queryKey: ["meetings"] }); setDetailsModal(false); }, onError: (error) => { toast.error(error.response.data.message \|\| "Failed to update meeting"); }, })`

## pages/Meetings/MeetingDashboard.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/meetings — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Total (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate("reports?source=biz-nest") — [MeetingDashboard.jsx:1177](../../client/src/pages/Meetings/MeetingDashboard.jsx#L1177) |
| Total (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate("reports?source=guest-bookings") — [MeetingDashboard.jsx:1190](../../client/src/pages/Meetings/MeetingDashboard.jsx#L1190) |
| Total (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate("reports?source=cancelled") — [MeetingDashboard.jsx:1218](../../client/src/pages/Meetings/MeetingDashboard.jsx#L1218) |

## pages/Meetings/MeetingFormLayout.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/meetings/book-meeting/schedule-meeting — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Add Participant (button) | meetingType === "External" | No local disabled condition detected | () => append({ name: "", mobileNumber: "" }) — [MeetingFormLayout.jsx:1588](../../client/src/pages/Meetings/MeetingFormLayout.jsx#L1588) |
| Submit (button) | No local render guard detected; page/API access still applies | isCreateMeeting \|\| isCurrentUserUnavailable; loading: isCreateMeeting | No inline handler declared; may submit a form or delegate to a component — [MeetingFormLayout.jsx:1688](../../client/src/pages/Meetings/MeetingFormLayout.jsx#L1688) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isCreateMeeting**, line 720: `useMutation({ mutationKey: ["createMeeting"], mutationFn: async (data) => { const normalizeText = (value) => String(value \|\| "").trim().toLowerCase(); const currentUserEmail = normalizeText(auth.user?.email); const currentUserFullName = normalizeText( [auth.user?.firstName, auth.user?.lastName].filter(Boolean).join(" "), ); const currentUserPhone = normalizeText( auth.user?.phone \|\| auth.user?.mobileNo \|\| auth.user?.mobileNumber, ); const findCurrentClientMember = (members = []) => members.find((member) => { const memberEmail = normalizeText(member?.email); const memberName = normalizeText( member?.employeeName \|\| member?.name, ); const memberPhone = normalizeText( member?.mobileNo \|\| member?.phoneNumber \|\| member?.phone, ); return ( (currentUserEmail && memberEmail === currentUserEmail) \|…`
- **auth**, line 45: `useAuth()`
- **isCurrentUserUnavailable**, line 573: `useMemo(() => { if (!startDate \|\| !endDate) return false; if (!startTime \|\| !endTime) return false; if (!auth?.user?._id) return false; if (canBypassMeetingAvailability) return false; if (!isSameDaySelection) return false; return !currentUserAvailability?.some( (user) => user._id === auth.user?._id, ); }, [ auth?.user?._id, canBypassMeetingAvailability, currentUserAvailability, endDate, endTime, isSameDaySelection, startDate, startTime, ])`
- **canBypassMeetingAvailability**, line 67: `useMemo( () => // Administration roles.includes("Administration Admin") \|\| roles.includes("Administration Employee") \|\| // Tech & IT roles.includes("Tech Admin") \|\| roles.includes("Tech Employee") \|\| roles.includes("IT Admin") \|\| roles.includes("IT Employee") \|\| // Finance roles.includes("Finance Admin") \|\| roles.includes("Finance Employee") \|\| // Sales roles.includes("Sales Admin") \|\| roles.includes("Sales Employee") \|\| // HR roles.includes("HR Admin") \|\| roles.includes("HR Employee") \|\| // Marketing roles.includes("Marketing Admin") \|\| roles.includes("Marketing Employee") \|\| // Maintenance roles.includes("Maintenance Admin") \|\| roles.includes("Maintenance Employee") \|\| // Cafe roles.includes("Cafe Admin") \|\| roles.includes("Cafe Employee") \|\| // Global Admins roles.includes("Super Admin"…`
- **roles**, line 61: `auth.user.role.map((role) => role.roleTitle)`
- **isSameDaySelection**, line 202: `useMemo( () => startDate && endDate && dayjs(startDate).isSame(dayjs(endDate), "day"), [endDate, startDate], )`

## pages/Meetings/MeetingReports.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/meetings/reports — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { handleSelectedMeeting(params.data); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { handleSelectedMeeting(params.data); } — [MeetingReports.jsx:373](../../client/src/pages/Meetings/MeetingReports.jsx#L373) |
| Export (table-generated utility) | !isMeetingsPending; exportData: true | No local disabled condition detected | Shared table export — [MeetingReports.jsx:395](../../client/src/pages/Meetings/MeetingReports.jsx#L395) |
| Advanced filter (table-generated utility) | !isMeetingsPending; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MeetingReports.jsx:395](../../client/src/pages/Meetings/MeetingReports.jsx#L395) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 369: `params`
- **isMeetingsPending**, line 109: `useQuery({ // queryKey: ["meetings", pagination.page, pagination.limit], queryKey: [ "meetings", meetingFilters.startDate, meetingFilters.endDate, pagination.page, pagination.limit, debouncedMeetingSearch, ], queryFn: async () => { try { // const response = await axios.get("/api/meetings/get-meetings", { // params: { // page: pagination.page, // limit: pagination.limit, // }, // }); // const responsePagination = response.data.pagination \|\| response.data; // setPagination((current) => ({ // page: Number(responsePagination.page) \|\| current.page, // limit: Number(responsePagination.limit) \|\| current.limit, // total: Number(responsePagination.total) \|\| 0, // })); // return response.data.data \|\| []; const response = await axios.get("/api/meetings/get-meetings", { params: { filters: meetingFilte…`

## pages/Meetings/MeetingSettings.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/meetings/settings — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| 'Show previous image for ${room.name}' (button) | images.length > 1 | No local disabled condition detected | showPreviousImage — [MeetingSettings.jsx:81](../../client/src/pages/Meetings/MeetingSettings.jsx#L81) |
| 'Show next image for ${room.name}' (button) | images.length > 1 | No local disabled condition detected | showNextImage — [MeetingSettings.jsx:89](../../client/src/pages/Meetings/MeetingSettings.jsx#L89) |
| Edit Room (button) | !isMeetingRoomsLoading | No local disabled condition detected | () => handleOpenEditModal(room) — [MeetingSettings.jsx:358](../../client/src/pages/Meetings/MeetingSettings.jsx#L358) |
| Submit (button) | No local render guard detected; page/API access still applies | createRoomMutation.isPending; loading: createRoomMutation.isPending | No inline handler declared; may submit a form or delegate to a component — [MeetingSettings.jsx:591](../../client/src/pages/Meetings/MeetingSettings.jsx#L591) |
| Save Changes (button) | No local render guard detected; page/API access still applies | editRoomMutation.isPending; loading: editRoomMutation.isPending | No inline handler declared; may submit a form or delegate to a component — [MeetingSettings.jsx:834](../../client/src/pages/Meetings/MeetingSettings.jsx#L834) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isMeetingRoomsLoading**, line 247: `useQuery({ queryKey: ["meetingRooms"], queryFn: async () => { try { const response = await axios.get("/api/meetings/get-rooms"); return response.data; } catch (error) { throw new Error(error.response.data.message); } }, })`

## pages/Meetings/Reviews.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/meetings/client-credit — no permission wrapper detected on this route-object chain
- /app/meetings/client-review — no permission wrapper detected on this route-object chain
- /app/meetings/reviews — no permission wrapper detected on this route-object chain
- /app/assets/reviews — no permission wrapper detected on this route-object chain
- /app/tasks/reviews — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleOpenModal(params.data, "reviewView") (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleOpenModal(params.data, "reviewView") — [Reviews.jsx:300](../../client/src/pages/Meetings/Reviews.jsx#L300) |
| !params.data.replyText ? "Reply to Review" : "Replied" (configured menu/action) | No local render guard detected; page/API access still applies | !!params.data.replyText | () => handleOpenModal(params.data, "reviewReply") — [Reviews.jsx:312](../../client/src/pages/Meetings/Reviews.jsx#L312) |
| Action: () => handleOpenModal(params.data, "creditView") (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleOpenModal(params.data, "creditView") — [Reviews.jsx:516](../../client/src/pages/Meetings/Reviews.jsx#L516) |
| Advanced filter (table-generated utility) | activeTabKey === "clientReview"; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Reviews.jsx:598](../../client/src/pages/Meetings/Reviews.jsx#L598) |
| Advanced filter (table-generated utility) | activeTabKey === "clientCredit" AND NOT (activeTabKey === "clientReview"); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Reviews.jsx:629](../../client/src/pages/Meetings/Reviews.jsx#L629) |
| Action: handleOpenCalendar (clickable action) | activeTabKey === "clientCredit" AND NOT (activeTabKey === "clientReview") | No local disabled condition detected | handleOpenCalendar — [Reviews.jsx:644](../../client/src/pages/Meetings/Reviews.jsx#L644) |
| Export (button) | activeTabKey === "clientCredit" AND NOT (activeTabKey === "clientReview") | No local disabled condition detected | () => exportClientCredits() — [Reviews.jsx:658](../../client/src/pages/Meetings/Reviews.jsx#L658) |
| Submit (button) | modalType === "reviewReply" | isReplyReviewPending; loading: isReplyReviewPending | No inline handler declared; may submit a form or delegate to a component — [Reviews.jsx:766](../../client/src/pages/Meetings/Reviews.jsx#L766) |
| Save (button) | modalType === "creditEdit" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [Reviews.jsx:835](../../client/src/pages/Meetings/Reviews.jsx#L835) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 298: `params`
- **params**, line 514: `params`
- **isReplyReviewPending**, line 228: `useMutation({ mutationFn: async (data) => { const response = await axios.post("/api/meetings/create-reply", { reviewId: selectedData.id, reply: data.reply, replierEmail: auth.user.email, replierName: auth.user.firstName, }); return response.data; }, onSuccess: function (data) { toast.success(data.message); handleCloseModal(); queryClient.invalidateQueries(["reviews"]); }, onError: function (error) { toast.error(error?.response?.data?.message \|\| error.message); }, })`
- **selectedData**, line 42: `useState({})`
- **auth**, line 38: `useAuth()`
