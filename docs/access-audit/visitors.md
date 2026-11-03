# Visitors: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Visitors/ConvertInternalVisitors.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/visitors/mix-bag/visitors-to-client/convert-internal-visitors — `<PerformancePermissionRoute element={<ConvertInternalVisitors />} permissions={[ PERMISSIONS.VISITORS_MIX_BAG_VISITORS_TO_CLIENT, PERMISSIONS.VISITORS_MIX_BAG_CONVERT_INTERNAL_VISITORS, ]} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => openViewModal(data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openViewModal(data) — [ConvertInternalVisitors.jsx:475](../../client/src/pages/Visitors/ConvertInternalVisitors.jsx#L475) |
| Convert to Client (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openConvertModal(data) — [ConvertInternalVisitors.jsx:485](../../client/src/pages/Visitors/ConvertInternalVisitors.jsx#L485) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ConvertInternalVisitors.jsx:501](../../client/src/pages/Visitors/ConvertInternalVisitors.jsx#L501) |
| isConverting ? "Converting..." : "Convert to Client" (button) | No local render guard detected; page/API access still applies | isConverting | No inline handler declared; may submit a form or delegate to a component — [ConvertInternalVisitors.jsx:1037](../../client/src/pages/Visitors/ConvertInternalVisitors.jsx#L1037) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **data**, line 473: `{ data }`
- **isConverting**, line 331: `useMutation({ mutationFn: async (payload) => { const response = await axios.post( '/api/visitors/convert-to-client/${selectedVisitor?.id}', payload, { headers: { "Content-Type": "multipart/form-data", }, }, ); return response.data; }, onSuccess: () => { toast.success("Visitor converted to client successfully."); setIsConvertModalOpen(false); setSelectedVisitor(null); queryClient.invalidateQueries({ queryKey: ["mix-bag-convert-internal-visitors"], }); queryClient.invalidateQueries({ queryKey: ["visitors"] }); queryClient.invalidateQueries({ queryKey: ["clients"] }); reset(); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| "Failed to convert visitor.", ); }, })`
- **selectedVisitor**, line 145: `useState(null)`

## pages/Visitors/ExternalClients.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/manage-meetings/day-pass — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/manage-meetings/day-pass — no permission wrapper detected on this route-object chain
- /app/visitors/manage-visitors/external-clients — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View History (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( '/app/visitors/manage-visitors/visitor-history/${params.data.mongoId}?type=client', { state: { breadcrumbLabel: params.data.name \|\| "Visitor History", }, }, ) — [ExternalClients.jsx:723](../../client/src/pages/Visitors/ExternalClients.jsx#L723) |
| Review Payment (configured menu/action) | isPaid && verificationStatus === "pending" AND financeStatusMenu | No local disabled condition detected | () => handleVerifyPayment(params.data, "Under Review") — [ExternalClients.jsx:741](../../client/src/pages/Visitors/ExternalClients.jsx#L741) |
| Verify Payment (configured menu/action) | isPaid && verificationStatus === "under review" AND financeStatusMenu | No local disabled condition detected | () => handleVerifyPayment(params.data, "Verified") — [ExternalClients.jsx:747](../../client/src/pages/Visitors/ExternalClients.jsx#L747) |
| Completed (configured menu/action) | isPaid && verificationStatus === "verified" AND financeStatusMenu | No local disabled condition detected | () => handleVerifyPayment(params.data, "Completed") — [ExternalClients.jsx:752](../../client/src/pages/Visitors/ExternalClients.jsx#L752) |
| Review Payment (configured menu/action) | isPaid && // !["pending", "under review", "verified"].includes( // verificationStatus, // ) && { ![ "pending", "under review", "verified", "completed", ].includes(verificationStatus) AND financeStatusMenu | No local disabled condition detected | () => handleVerifyPayment(params.data, "Under Review") — [ExternalClients.jsx:770](../../client/src/pages/Visitors/ExternalClients.jsx#L770) |
| Edit (configured menu/action) | NOT (financeStatusMenu) | No local disabled condition detected | () => { setSelectedVisitor(params.data); setModalMode("edit"); setIsEditing(true); setIsModalOpen(true); } — [ExternalClients.jsx:778](../../client/src/pages/Visitors/ExternalClients.jsx#L778) |
| Update Payment Details (configured menu/action) | params.data.visitorType !== "Meeting" && !isPaid AND NOT (financeStatusMenu) | No local disabled condition detected | () => handleOpenPaymentModal(params.data) — [ExternalClients.jsx:789](../../client/src/pages/Visitors/ExternalClients.jsx#L789) |
| Action: () => handleDetailsClick({ ...params.data }) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleDetailsClick({ ...params.data }) — [ExternalClients.jsx:823](../../client/src/pages/Visitors/ExternalClients.jsx#L823) |
| Action: (e) => { e.stopPropagation(); // Prevent row selection on click } (clickable action) | No local render guard detected; page/API access still applies | params.data.checkOut | (e) => { e.stopPropagation(); // Prevent row selection on click } — [ExternalClients.jsx:830](../../client/src/pages/Visitors/ExternalClients.jsx#L830) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: financeStatusMenu | No local disabled condition detected | Shared table export — [ExternalClients.jsx:1035](../../client/src/pages/Visitors/ExternalClients.jsx#L1035) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ExternalClients.jsx:1035](../../client/src/pages/Visitors/ExternalClients.jsx#L1035) |
| isPending ? "Saving..." : "Save" (button) | isEditing | isPending | No inline handler declared; may submit a form or delegate to a component — [ExternalClients.jsx:1725](../../client/src/pages/Visitors/ExternalClients.jsx#L1725) |
| Save Payment Details (button) | No local render guard detected; page/API access still applies | isPaymentPending | No inline handler declared; may submit a form or delegate to a component — [ExternalClients.jsx:1917](../../client/src/pages/Visitors/ExternalClients.jsx#L1917) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 717: `params`
- **isPaid**, line 718: `isPaymentCompleted(params.data.paymentStatus)`
- **isPaymentCompleted**, line 487: `(status) => { if (typeof status === "boolean") return status; if (!status) return false; return ["paid", "completed"].includes(String(status).toLowerCase()); }`
- **isEditing**, line 96: `useState(false)`
- **isPending**, line 307: `useMutation({ mutationFn: async (updatedData) => { const response = await axios.patch( '/api/visitors/update-visitor/${selectedVisitor.mongoId}', updatedData, ); return response.data; }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["clients"] }); toast.success("Visitor updated successfully"); handleCloseModal(); }, onError: (error) => { toast.error(error.response.data.message \|\| "Update failed"); }, })`
- **selectedVisitor**, line 95: `useState([])`
- **isPaymentPending**, line 349: `useMutation({ mutationKey: ["visitor-payment"], mutationFn: async (data) => { const externalVisitId = data.get("externalVisitId"); const paymentVisitorType = data.get("visitorType") \|\| data.get("purposeOfVisit"); console.log("Payment Data:", Object.fromEntries(data.entries())); console.log( "Payment Visitor Type (raw):", data.get("visitorType"), data.get("purposeOfVisit"), ); console.log("Payment Visitor Type:", paymentVisitorType); const isDayPassPayment = isFullOrHalfDayPass(paymentVisitorType) && Boolean(externalVisitId); console.log("Is Day Pass Payment:", isDayPassPayment); const response = await axios.patch( isDayPassPayment ? '/api/visitors/day-pass/payment/${externalVisitId}' : '/api/visitors/payment/${data.get("visitorId")}', data, { headers: { "Content-Type": "multipart/form-data…`
- **isFullOrHalfDayPass**, line 446: `(value) => { const normalizedValue = normalizeVisitorType(value); return ( normalizedValue === "Full-Day Pass" \|\| normalizedValue === "Half-Day Pass" ); }`

## pages/Visitors/Forms/AddClient.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/visitors/add-client — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => navigate(existingVisitorRoute) (button) | existingVisitor AND NOT (isCheckingVisitor) AND debouncedVisitorPhone | No local disabled condition detected | () => navigate(existingVisitorRoute) — [AddClient.jsx:470](../../client/src/pages/Visitors/Forms/AddClient.jsx#L470) |
| Submit (button) | No local render guard detected; page/API access still applies | isMutateVisitor \|\| isCheckingVisitor \|\| Boolean(existingVisitor); loading: isMutateVisitor | No inline handler declared; may submit a form or delegate to a component — [AddClient.jsx:1144](../../client/src/pages/Visitors/Forms/AddClient.jsx#L1144) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [AddClient.jsx:1152](../../client/src/pages/Visitors/Forms/AddClient.jsx#L1152) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isCheckingVisitor**, line 122: `useQuery({ queryKey: ["visitor-exists", debouncedVisitorPhone], queryFn: async () => { const response = await axios.get("/api/visitors/check-existing", { params: { phoneNumber: debouncedVisitorPhone }, }); return response.data; }, enabled: Boolean(debouncedVisitorPhone), retry: false, })`
- **isMutateVisitor**, line 236: `useMutation({ mutationKey: ["addVisitor"], mutationFn: async (data) => { const response = await axios.post("/api/visitors/add-visitor", data, { headers: { "Content-Type": "multipart/form-data", }, }); return response.data; }, onSuccess: (data) => { reset(); toast.custom((t) => ( <div className="p-4 bg-successGreen rounded shadow text-green-800 flex flex-col gap-4"> <span className="text-content font-pmedium"> {data.message \|\| "Visitor Added Successfully"} </span> </div> )); }, onError: (error) => { toast.error(error.response.data.message \|\| "Error Adding Visitor"); }, })`

## pages/Visitors/Forms/AddVisitor.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/visitors/add-visitor — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Repeat Visitor (button) | existingVisitor AND NOT (isCheckingVisitor) AND debouncedVisitorPhone | No local disabled condition detected | () => { const params = new URLSearchParams(); if (existingVisitor.id) { params.set("visitorId", existingVisitor.id); } if (existingVisitor.lastVisitedAt) { params.set( "lastVisitedAt", existingVisitor.lastVisitedAt, ); } navigate({ pathname: "/app/visitors/mix-bag/repeat-visitors/repeat-internal-visitors", search: params.toString() ? '?${… — [AddVisitor.jsx:421](../../client/src/pages/Visitors/Forms/AddVisitor.jsx#L421) |
| Submit (button) | No local render guard detected; page/API access still applies | isMutateVisitor \|\| isCheckingVisitor \|\| Boolean(existingVisitor); loading: isMutateVisitor | No inline handler declared; may submit a form or delegate to a component — [AddVisitor.jsx:894](../../client/src/pages/Visitors/Forms/AddVisitor.jsx#L894) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [AddVisitor.jsx:902](../../client/src/pages/Visitors/Forms/AddVisitor.jsx#L902) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isCheckingVisitor**, line 113: `useQuery({ queryKey: ["visitor-exists", debouncedVisitorPhone], queryFn: async () => { const response = await axios.get("/api/visitors/check-existing", { params: { phoneNumber: debouncedVisitorPhone }, }); return response.data; }, enabled: Boolean(debouncedVisitorPhone), retry: false, })`
- **isMutateVisitor**, line 246: `useMutation({ mutationKey: ["addVisitor"], mutationFn: async (data) => { const isBiznest = data.toMeetCompany === "6799f0cd6a01edbe1bc3fcea"; console.log("viz data", data.toMeet); console.log("isBiznest", isBiznest); const response = await axios.post("/api/visitors/add-visitor", { ...data, department: selectedDepartment === "na" ? null : selectedDepartment, toMeet: isBiznest ? data.toMeet : null, // only for BIZNest clientToMeet: !isBiznest ? data.toMeet : null, // only for other companies }); return response.data; }, onSuccess: (data) => { reset(); toast.custom((t) => ( <div className="p-4 bg-successGreen rounded shadow text-green-800 flex flex-col gap-4"> <span className="text-content font-pmedium"> {data.message \|\| "Visitor Added Successfully"} </span> </div> )); }, onError: (error) => …`
- **selectedDepartment**, line 90: `useState("")`

## pages/Visitors/Forms/ViewVisitorDetails.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| mode === "add" ? "Submit" : "Update" (button) | mode !== "view" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ViewVisitorDetails.jsx:398](../../client/src/pages/Visitors/Forms/ViewVisitorDetails.jsx#L398) |
| Cancel (button) | mode === "edit" AND mode !== "view" | No local disabled condition detected | () => { onModeChange("view"); reset(); } — [ViewVisitorDetails.jsx:401](../../client/src/pages/Visitors/Forms/ViewVisitorDetails.jsx#L401) |
| Edit (button) | NOT (mode !== "view") | No local disabled condition detected | () => { onModeChange("edit"); } — [ViewVisitorDetails.jsx:485](../../client/src/pages/Visitors/Forms/ViewVisitorDetails.jsx#L485) |

## pages/Visitors/ManageVisitors.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/visitors/manage-visitors/internal-visitors — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => openModalWithMode(data, "view") (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openModalWithMode(data, "view") — [ManageVisitors.jsx:272](../../client/src/pages/Visitors/ManageVisitors.jsx#L272) |
| View History (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( '/app/visitors/manage-visitors/visitor-history/${data.mongoId}?type=internal', { state: { breadcrumbLabel: data.name \|\| "Visitor History", }, }, ) — [ManageVisitors.jsx:281](../../client/src/pages/Visitors/ManageVisitors.jsx#L281) |
| Edit (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openModalWithMode(data, "edit") — [ManageVisitors.jsx:293](../../client/src/pages/Visitors/ManageVisitors.jsx#L293) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ManageVisitors.jsx:444](../../client/src/pages/Visitors/ManageVisitors.jsx#L444) |
| isUpdating ? "Saving..." : "Save" (button) | NOT (modalMode === "view") | isUpdating | No inline handler declared; may submit a form or delegate to a component — [ManageVisitors.jsx:740](../../client/src/pages/Visitors/ManageVisitors.jsx#L740) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **data**, line 269: `{ data }`
- **isUpdating**, line 127: `useMutation({ mutationFn: async (updatedData) => { const response = await axios.patch( '/api/visitors/update-visitor/${selectedVisitor.mongoId}', updatedData, ); return response.data; }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["visitors"] }); toast.success("Visitor updated successfully"); handleCloseModal(); }, onError: (error) => { toast.error(error.response.data.message \|\| "Update failed"); }, })`
- **selectedVisitor**, line 37: `useState(null)`

## pages/Visitors/RepeatDayPass.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Repeat Clien (configured menu/action) | No local render guard detected; page/API access still applies | !canRepeatClient | () => openRepeatModal(params.data) — [RepeatDayPass.jsx:154](../../client/src/pages/Visitors/RepeatDayPass.jsx#L154) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [RepeatDayPass.jsx:168](../../client/src/pages/Visitors/RepeatDayPass.jsx#L168) |
| repeatClientMutation.isPending ? "Submitting..." : "Submit" (button) | No local render guard detected; page/API access still applies | repeatClientMutation.isPending | No inline handler declared; may submit a form or delegate to a component — [RepeatDayPass.jsx:281](../../client/src/pages/Visitors/RepeatDayPass.jsx#L281) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **canRepeatClient**, line 24: `userPermissions.includes( PERMISSIONS.VISITORS_MIX_BAG_REPEAT_CLIENT.value, )`
- **userPermissions**, line 23: `auth?.user?.permissions?.permissions \|\| []`
- **auth**, line 22: `useAuth()`
- **params**, line 150: `params`
- **isPending**, line 41: `useQuery({ queryKey: ["mix-bag-repeat-day-pass"], queryFn: async () => { const response = await axios.get("/api/visitors/fetch-visitors"); return response.data; }, })`

## pages/Visitors/RepeatExternalCompaanies.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/visitors/mix-bag/repeat-day-pass/repeat-external-companies — `<PerformancePermissionRoute element={<RepeatExternalCompaanies />} permissions={[ PERMISSIONS.VISITORS_MIX_BAG_REPEAT_DAY_PASS, ]} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Check out (configured menu/action) | conflict?.requiresCheckout | No local disabled condition detected | () => { const params = new URLSearchParams(); if (conflict.checkIn) { params.set("lastVisitedAt", conflict.checkIn); } navigate( '/app/visitors/manage-visitors/external-clients?${params.toString()}', ); } — [RepeatExternalCompaanies.jsx:248](../../client/src/pages/Visitors/RepeatExternalCompaanies.jsx#L248) |
| Repeat Day Pass (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openRepeatClientModal(params.data) — [RepeatExternalCompaanies.jsx:284](../../client/src/pages/Visitors/RepeatExternalCompaanies.jsx#L284) |
| Book Meeting Room (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => bookMeetingRoom(params.data) — [RepeatExternalCompaanies.jsx:288](../../client/src/pages/Visitors/RepeatExternalCompaanies.jsx#L288) |
| Advanced filter (table-generated utility) | NOT (loading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [RepeatExternalCompaanies.jsx:308](../../client/src/pages/Visitors/RepeatExternalCompaanies.jsx#L308) |
| isSubmittingRepeatClient ? "Submitting..." : "Submit" (button) | No local render guard detected; page/API access still applies | isSubmittingRepeatClient | No inline handler declared; may submit a form or delegate to a component — [RepeatExternalCompaanies.jsx:504](../../client/src/pages/Visitors/RepeatExternalCompaanies.jsx#L504) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 281: `params`
- **isSubmittingRepeatClient**, line 29: `useState(false)`

## pages/Visitors/RepeatInternalVisitors.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/visitors/mix-bag/repeat-visitors/repeat-internal-visitors — `<PerformancePermissionRoute element={<RepeatInternalVisitors />} permissions={[ PERMISSIONS.VISITORS_MIX_BAG_REPEAT_VISITORS, PERMISSIONS.VISITORS_MIX_BAG_REPEAT_INTERNAL_VISITORS, ]} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Check out (configured menu/action) | conflict?.requiresCheckout | No local disabled condition detected | () => { const params = new URLSearchParams(); if (conflict.checkIn) { params.set("lastVisitedAt", conflict.checkIn); } navigate( '/app/visitors/manage-visitors/internal-visitors?${params.toString()}', ); } — [RepeatInternalVisitors.jsx:240](../../client/src/pages/Visitors/RepeatInternalVisitors.jsx#L240) |
| Repeat Visitor (configured menu/action) | canRepeatVisitor | No local disabled condition detected | () => openRepeatModal(data) — [RepeatInternalVisitors.jsx:486](../../client/src/pages/Visitors/RepeatInternalVisitors.jsx#L486) |
| Action: () => openModalWithMode(data, "view") (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openModalWithMode(data, "view") — [RepeatInternalVisitors.jsx:494](../../client/src/pages/Visitors/RepeatInternalVisitors.jsx#L494) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [RepeatInternalVisitors.jsx:515](../../client/src/pages/Visitors/RepeatInternalVisitors.jsx#L515) |
| isUpdating ? "Saving..." : "Save" (button) | NOT (modalMode === "view") | isUpdating | No inline handler declared; may submit a form or delegate to a component — [RepeatInternalVisitors.jsx:702](../../client/src/pages/Visitors/RepeatInternalVisitors.jsx#L702) |
| isRepeatingVisitor ? "Submitting..." : "Submit" (button) | No local render guard detected; page/API access still applies | isRepeatingVisitor | No inline handler declared; may submit a form or delegate to a component — [RepeatInternalVisitors.jsx:1052](../../client/src/pages/Visitors/RepeatInternalVisitors.jsx#L1052) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **canRepeatVisitor**, line 33: `userPermissions.includes( PERMISSIONS.VISITORS_MIX_BAG_REPEAT_VISITOR.value, )`
- **userPermissions**, line 32: `auth?.user?.permissions?.permissions \|\| []`
- **auth**, line 31: `useAuth()`
- **data**, line 482: `{ data }`
- **isUpdating**, line 201: `useMutation({ mutationFn: async (updatedData) => { const response = await axios.patch( '/api/visitors/update-visitor/${selectedVisitor.mongoId}', updatedData, ); return response.data; }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["visitors"] }); toast.success("Visitor updated successfully"); closeViewEditModal(); }, onError: (error) => { toast.error(error.response?.data?.message \|\| "Update failed"); }, })`
- **selectedVisitor**, line 40: `useState(null)`
- **isRepeatingVisitor**, line 219: `useMutation({ mutationFn: async (payload) => { const response = await axios.patch( '/api/visitors/repeat-internal-visitor/${selectedVisitor?.mongoId}', payload, ); return response.data; }, onSuccess: () => { toast.success("Repeat visitor submitted successfully"); queryClient.invalidateQueries({ queryKey: ["visitors"] }); setIsRepeatModalOpen(false); resetRepeatForm(); navigate("/app/visitors/manage-visitors/internal-visitors"); }, onError: (error) => { const responseData = error.response?.data; const conflict = responseData?.conflict; const toastOptions = conflict?.requiresCheckout ? { duration: 10000, action: { label: "Check out", onClick: () => { const params = new URLSearchParams(); if (conflict.checkIn) { params.set("lastVisitedAt", conflict.checkIn); } navigate( '/app/visitors/manage-…`

## pages/Visitors/VisitorHistory.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/visitors/manage-visitors/visitor-history/:visitorId — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View visit details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedVisit(visit) — [VisitorHistory.jsx:192](../../client/src/pages/Visitors/VisitorHistory.jsx#L192) |
| Back (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate(-1) — [VisitorHistory.jsx:329](../../client/src/pages/Visitors/VisitorHistory.jsx#L329) |
| Export (table-generated utility) | NOT (isError); exportData: true | No local disabled condition detected | Shared table export — [VisitorHistory.jsx:335](../../client/src/pages/Visitors/VisitorHistory.jsx#L335) |
| Advanced filter (table-generated utility) | NOT (isError); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VisitorHistory.jsx:335](../../client/src/pages/Visitors/VisitorHistory.jsx#L335) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isError**, line 42: `useQuery({ queryKey: ["visitor-history", visitorId, historyType], enabled: Boolean(visitorId), queryFn: async () => { const response = await axios.get( '/api/visitors/visitor-history/${visitorId}', ); return response.data; }, })`

## pages/Visitors/VisitorReports.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/visitors/reports — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleDetailsClick(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleDetailsClick(params.data) — [VisitorReports.jsx:199](../../client/src/pages/Visitors/VisitorReports.jsx#L199) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [VisitorReports.jsx:465](../../client/src/pages/Visitors/VisitorReports.jsx#L465) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VisitorReports.jsx:465](../../client/src/pages/Visitors/VisitorReports.jsx#L465) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 198: `params`

## pages/Visitors/VisitorReviews.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/visitors/reviews — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: handleClick (clickable action) | params.value === "Reply Review" | No local disabled condition detected | handleClick — [VisitorReviews.jsx:130](../../client/src/pages/Visitors/VisitorReviews.jsx#L130) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VisitorReviews.jsx:185](../../client/src/pages/Visitors/VisitorReviews.jsx#L185) |
| Submit (button) | No local render guard detected; page/API access still applies | isReplyReviewPending; loading: isReplyReviewPending | No inline handler declared; may submit a form or delegate to a component — [VisitorReviews.jsx:247](../../client/src/pages/Visitors/VisitorReviews.jsx#L247) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 106: `params`
- **isReplyReviewPending**, line 48: `useMutation({ mutationFn: async (data) => { const response = await axios.post("/api/meetings/create-reply", { reviewId: reviewData.id, reply: data.reply, replierEmail: auth.user.email, replierName: auth.user.firstName, }); return response.data; }, onSuccess: function (data) { toast.success(data.message); setOpenSidebar(false); queryClient.invalidateQueries(["reviews"]); }, onError: function (error) { toast.error(error.message); }, })`
- **reviewData**, line 24: `useState({})`
- **auth**, line 34: `useAuth()`

## pages/Visitors/VisitorSettings/VisitorBulkUpload.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: button (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [VisitorBulkUpload.jsx:65](../../client/src/pages/Visitors/VisitorSettings/VisitorBulkUpload.jsx#L65) |
| Icon/action: button (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [VisitorBulkUpload.jsx:68](../../client/src/pages/Visitors/VisitorSettings/VisitorBulkUpload.jsx#L68) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VisitorBulkUpload.jsx:80](../../client/src/pages/Visitors/VisitorSettings/VisitorBulkUpload.jsx#L80) |

## pages/Visitors/VisitorTeamMembers.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/visitors/team-members — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VisitorTeamMembers.jsx:44](../../client/src/pages/Visitors/VisitorTeamMembers.jsx#L44) |
