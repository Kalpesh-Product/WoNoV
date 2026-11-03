# Sales Dashboard: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Dashboard/SalesDashboard/ActualBusiness/ActualBusinessRevenue.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/turnover — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| 'Open ${vertical} revenue details' (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleVerticalNavigation(vertical) — [ActualBusinessRevenue.jsx:406](../../client/src/pages/Dashboard/SalesDashboard/ActualBusiness/ActualBusinessRevenue.jsx#L406) |
| Export (table-generated utility) | !isTotalRevenue; exportData: true | No local disabled condition detected | Shared table export — [ActualBusinessRevenue.jsx:508](../../client/src/pages/Dashboard/SalesDashboard/ActualBusiness/ActualBusinessRevenue.jsx#L508) |
| Advanced filter (table-generated utility) | !isTotalRevenue; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ActualBusinessRevenue.jsx:508](../../client/src/pages/Dashboard/SalesDashboard/ActualBusiness/ActualBusinessRevenue.jsx#L508) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isTotalRevenue**, line 144: `useQuery({ queryKey: ["turnover-simple-revenue"], queryFn: async () => { const response = await axios.get("/api/sales/simple-consolidated-revenue"); return response.data \|\| {}; }, })`

## pages/Dashboard/SalesDashboard/AltRevenues.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/revenue/alt-revenue — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/billing/client-invoicing/alternate-revenue-invoicing — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/revenue/alt-revenue — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/client-invoicing/alternate-revenue-invoicing — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/mix-bag/revenue/alt-revenue — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/revenue/alt-revenue — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View alternate revenue details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => onView(row) — [AltRevenues.jsx:85](../../client/src/pages/Dashboard/SalesDashboard/AltRevenues.jsx#L85) |
| Edit (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => onEdit(row) — [AltRevenues.jsx:97](../../client/src/pages/Dashboard/SalesDashboard/AltRevenues.jsx#L97) |
| View alternate revenue details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setViewRow(params.data) — [AltRevenues.jsx:474](../../client/src/pages/Dashboard/SalesDashboard/AltRevenues.jsx#L474) |
| Export (table-generated utility) | NOT (isLoadingAlternateRevenue); exportData: true | No local disabled condition detected | Shared table export — [AltRevenues.jsx:589](../../client/src/pages/Dashboard/SalesDashboard/AltRevenues.jsx#L589) |
| Advanced filter (table-generated utility) | NOT (isLoadingAlternateRevenue); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AltRevenues.jsx:589](../../client/src/pages/Dashboard/SalesDashboard/AltRevenues.jsx#L589) |
| Add Alternate (button) | isBillingView AND NOT (isLoadingAlternateRevenue) | No local disabled condition detected | openCreate — [AltRevenues.jsx:625](../../client/src/pages/Dashboard/SalesDashboard/AltRevenues.jsx#L625) |
| modalMode === "edit" ? "Update Alternate" : "Add Alternate" (button) | modalMode | isSavingAlternateRevenue; loading: isSavingAlternateRevenue | No inline handler declared; may submit a form or delegate to a component — [AltRevenues.jsx:938](../../client/src/pages/Dashboard/SalesDashboard/AltRevenues.jsx#L938) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 473: `params`
- **isLoadingAlternateRevenue**, line 124: `useQuery({ queryKey: ["alternateRevenue"], queryFn: async () => { const response = await axios.get("/api/sales/get-alternate-revenue"); return Array.isArray(response.data) ? response.data : []; }, })`
- **isBillingView**, line 112: `!showChart`
- **isSavingAlternateRevenue**, line 367: `useMutation({ mutationFn: async (values) => { const formData = new FormData(); formData.append("revenueId", editRow?._id \|\| ""); if (values.selectedClient) { formData.append("originalClientName", values.selectedClient); } [ ["name", values.name \|\| values.selectedClient], ["clientInvoiceName", values.clientInvoiceName], ["particulars", values.particulars], ["taxableAmount", values.taxableAmount], ["gstRate", values.gstRate], ["gst", values.gst], ["invoiceAmount", values.invoiceAmount], ["status", values.status], ].forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") { formData.append(key, value); } }); if (values.invoiceCreationDate) { formData.append( "invoiceCreationDate", dayjs(values.invoiceCreationDate).toISOString(), ); } if (values.invoicePaidDate) {…`

## pages/Dashboard/SalesDashboard/ClientOnboarding.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/co-working/client-onboarding — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/clients/co-working/client-onboarding — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Submit (button) | No local render guard detected; page/API access still applies | isMutateClientPending; loading: isMutateClientPending | No inline handler declared; may submit a form or delegate to a component — [ClientOnboarding.jsx:945](../../client/src/pages/Dashboard/SalesDashboard/ClientOnboarding.jsx#L945) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [ClientOnboarding.jsx:951](../../client/src/pages/Dashboard/SalesDashboard/ClientOnboarding.jsx#L951) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isMutateClientPending**, line 176: `useMutation({ mutationKey: "clientData", mutationFn: async (data) => { const response = await axios.post( '/api/sales/onboard-co-working-client', data ); return response.data; }, onSuccess: (data) => { toast.success(data.message); reset(); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| error?.message \|\| "Failed to onboard client"); }, })`

## pages/Dashboard/SalesDashboard/CoWorking.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/revenue/co-working — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/billing/client-invoicing/co-working-revenue-invoicing — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/revenue/co-working — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/client-invoicing/co-working-revenue-invoicing — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/mix-bag/revenue/co-working — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/revenue/co-working — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View invoice details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => onView(row) — [CoWorking.jsx:110](../../client/src/pages/Dashboard/SalesDashboard/CoWorking.jsx#L110) |
| Edit (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => onEdit(row) — [CoWorking.jsx:132](../../client/src/pages/Dashboard/SalesDashboard/CoWorking.jsx#L132) |
| Export (table-generated utility) | !isCoWorkingLoading; exportData: true | No local disabled condition detected | Shared table export — [CoWorking.jsx:555](../../client/src/pages/Dashboard/SalesDashboard/CoWorking.jsx#L555) |
| Advanced filter (table-generated utility) | !isCoWorkingLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [CoWorking.jsx:555](../../client/src/pages/Dashboard/SalesDashboard/CoWorking.jsx#L555) |
| View invoice details (button) | NOT (showInvoiceProjections) AND !isCoWorkingLoading | No local disabled condition detected | () => setViewRow(params.data) — [CoWorking.jsx:714](../../client/src/pages/Dashboard/SalesDashboard/CoWorking.jsx#L714) |
| Update Invoice (button) | editRow | isSavingInvoice; loading: isSavingInvoice | No inline handler declared; may submit a form or delegate to a component — [CoWorking.jsx:967](../../client/src/pages/Dashboard/SalesDashboard/CoWorking.jsx#L967) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isCoWorkingLoading**, line 373: `useQuery({ // queryKey: ["coWorkingData"], // queryFn: async () => { // try { // const response = await axios.get('/api/sales/fetch-coworking-revenues'); //queryKey: ["coWorkingData", { useClientDetails: showInvoiceProjections }], queryKey: ["coWorkingData"], queryFn: async () => { try { const response = await axios.get('/api/sales/fetch-coworking-revenues', { // params: showInvoiceProjections ? { useClientDetails: true } : undefined, params: { useClientDetails: true }, }); return Array.isArray(response.data) ? response.data : []; } catch (error) { throw new Error(error.response.data.message); } }, })`
- **params**, line 713: `params`
- **isSavingInvoice**, line 322: `useMutation({ mutationFn: async (values) => { const formData = new FormData(); if (editRow?._id) formData.append("revenueId", editRow._id); formData.append("isProjectedInvoice", String(Boolean(editRow.isProjectedInvoice))); formData.append( "removeInvoice", String(Boolean(editRow?.invoice?.link) && !values.invoiceFile), ); [ ["clients", values.clients], ["service", values.service], ["clientName", values.clientName], ["clientInvoiceName", values.clientInvoiceName], ["channel", values.channel], ["noOfDesks", values.noOfDesks], ["deskRate", values.deskRate], ["occupation", values.occupation], ["revenue", values.revenue], ["totalTerm", values.totalTerm], ["dueTerm", values.dueTerm], ["rentDate", values.rentDate?.toISOString()], ["invoiceUploadedAt", values.invoiceUploadedAt?.toISOString()], ["…`

## pages/Dashboard/SalesDashboard/CoWorkingSeats/BuildingUnits.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/inventory/:location — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [BuildingUnits.jsx:168](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/BuildingUnits.jsx#L168) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [BuildingUnits.jsx:168](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/BuildingUnits.jsx#L168) |

## pages/Dashboard/SalesDashboard/CoWorkingSeats/CheckAvailability.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/inventory — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Check Availability (button) | !hideCheckInventory | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [CheckAvailability.jsx:1193](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/CheckAvailability.jsx#L1193) |

## pages/Dashboard/SalesDashboard/CoWorkingSeats/CoWorkingDetails.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/inventory/:id — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Go Back (button) | !bookings | No local disabled condition detected | () => navigate(-1) — [CoWorkingDetails.jsx:16](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/CoWorkingDetails.jsx#L16) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [CoWorkingDetails.jsx:54](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/CoWorkingDetails.jsx#L54) |

## pages/Dashboard/SalesDashboard/CoWorkingSeats/CoWorkingSeats.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { const parsedDate = dayjs(rowData.date, "DD-MM-YYYY"); const selectedMonth = parsedDate.format("MMM-YYYY"); const monthStart = parsedDate.startOf("month"); const mon… (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { const parsedDate = dayjs(rowData.date, "DD-MM-YYYY"); const selectedMonth = parsedDate.format("MMM-YYYY"); const monthStart = parsedDate.startOf("month"); const monthEnd = parsedDate.endOf("month"); const bookedClients = clientsData.filter((client) => { const clientUnit = client.unit?.unitNo; const clientStart = dayjs(client.start… — [CoWorkingSeats.jsx:335](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/CoWorkingSeats.jsx#L335) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [CoWorkingSeats.jsx:433](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/CoWorkingSeats.jsx#L433) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 330: `params`

## pages/Dashboard/SalesDashboard/CoWorkingSeats/ViewAvailability.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/inventory/:location/:unit — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/mix-bag/inventory/check-availability/view-availability — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/inventory/check-availability/view-availability — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => setImageOpen(true) (clickable action) | tabIndex === 0 | No local disabled condition detected | () => setImageOpen(true) — [ViewAvailability.jsx:231](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/ViewAvailability.jsx#L231) |
| Action: () => setClearedImageOpen(true) (clickable action) | tabIndex === 1 | No local disabled condition detected | () => setClearedImageOpen(true) — [ViewAvailability.jsx:246](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/ViewAvailability.jsx#L246) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [ViewAvailability.jsx:294](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/ViewAvailability.jsx#L294) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ViewAvailability.jsx:294](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/ViewAvailability.jsx#L294) |
| Icon/action: handleOccupiedUpload (button) | pendingImagePreview | isUploadingImage | handleOccupiedUpload — [ViewAvailability.jsx:379](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/ViewAvailability.jsx#L379) |
| Icon/action: handleClearUpload (button) | pendingClearedImagePreview | isUploadingImage | handleClearUpload — [ViewAvailability.jsx:419](../../client/src/pages/Dashboard/SalesDashboard/CoWorkingSeats/ViewAvailability.jsx#L419) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isUploadingImage**, line 80: `useMutation({ mutationFn: async ({ file, imageType }) => { const formData = new FormData(); formData.append("locationImage", file); formData.append("unitId", unit); formData.append("imageType", imageType); return axios.post("/api/company/upload-location-image", formData); }, onSuccess: async (_, variables) => { await queryClient.invalidateQueries({ queryKey: ["unitDetails"] }); toast.success('${variables?.imageType === "clearImage" ? "Clear" : "Occupied"} image uploaded successfully'); variables?.onSuccess?.(); }, onError: (err) => { toast.error(err?.response?.data?.message \|\| "Failed to upload image"); }, })`

## pages/Dashboard/SalesDashboard/ExternalClientCompanies.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/external-client/meetings/external-companies — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/mix-bag/external-client/open-desk/external-companies — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleClickRow(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleClickRow(params.data) — [ExternalClientCompanies.jsx:95](../../client/src/pages/Dashboard/SalesDashboard/ExternalClientCompanies.jsx#L95) |
| Export (table-generated utility) | NOT (loading); exportData: true | No local disabled condition detected | Shared table export — [ExternalClientCompanies.jsx:148](../../client/src/pages/Dashboard/SalesDashboard/ExternalClientCompanies.jsx#L148) |
| Advanced filter (table-generated utility) | NOT (loading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ExternalClientCompanies.jsx:148](../../client/src/pages/Dashboard/SalesDashboard/ExternalClientCompanies.jsx#L148) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 94: `params`

## pages/Dashboard/SalesDashboard/ExternalCompanyMeetings.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/external-client/meetings/external-companies/:clientName/meetings — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/mix-bag/external-client/open-desk/external-companies/:clientName/meetings — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ExternalCompanyMeetings.jsx:161](../../client/src/pages/Dashboard/SalesDashboard/ExternalCompanyMeetings.jsx#L161) |

## pages/Dashboard/SalesDashboard/InternalMeetingsDashboard.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/internal-meetings — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [InternalMeetingsDashboard.jsx:194](../../client/src/pages/Dashboard/SalesDashboard/InternalMeetingsDashboard.jsx#L194) |

## pages/Dashboard/SalesDashboard/ManageUnit.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/manage-units — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Restore unit (button) | unit.isDeleted | isDeletePending \|\| isRestorePending | () => setConfirmationAction({ type: "restore", unit }) — [ManageUnit.jsx:268](../../client/src/pages/Dashboard/SalesDashboard/ManageUnit.jsx#L268) |
| Permanently delete unit (button) | unit.isDeleted | isDeletePending \|\| isRestorePending | () => setConfirmationAction({ type: "permanent-delete", unit }) — [ManageUnit.jsx:280](../../client/src/pages/Dashboard/SalesDashboard/ManageUnit.jsx#L280) |
| Edit unit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleEditClick(unit) — [ManageUnit.jsx:298](../../client/src/pages/Dashboard/SalesDashboard/ManageUnit.jsx#L298) |
| isTechDepartment ? "Permanently delete unit" : "Delete unit" (button) | No local render guard detected; page/API access still applies | isDeletePending \|\| isRestorePending | () => setConfirmationAction({ type: isTechDepartment ? "permanent-delete" : "delete", unit, }) — [ManageUnit.jsx:307](../../client/src/pages/Dashboard/SalesDashboard/ManageUnit.jsx#L307) |
| Add New Unit (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddClick — [ManageUnit.jsx:343](../../client/src/pages/Dashboard/SalesDashboard/ManageUnit.jsx#L343) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [ManageUnit.jsx:343](../../client/src/pages/Dashboard/SalesDashboard/ManageUnit.jsx#L343) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ManageUnit.jsx:343](../../client/src/pages/Dashboard/SalesDashboard/ManageUnit.jsx#L343) |
| modalMode === "edit" ? "Update Unit" : "Add Unit" (button) | No local render guard detected; page/API access still applies | isUpdatePending \|\| isCreatePending | No inline handler declared; may submit a form or delegate to a component — [ManageUnit.jsx:515](../../client/src/pages/Dashboard/SalesDashboard/ManageUnit.jsx#L515) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isDeletePending**, line 106: `useMutation({ mutationKey: ["delete-unit"], mutationFn: async (unitId) => { const response = await axios.delete('/api/company/delete-unit/${unitId}'); return response.data; }, onSuccess: (data) => { toast.success(data?.message \|\| "Unit deleted successfully"); queryClient.invalidateQueries({ queryKey: ["units-data"] }); setConfirmationAction(null); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to delete unit"); }, })`
- **isRestorePending**, line 122: `useMutation({ mutationKey: ["restore-unit"], mutationFn: async (unitId) => { const response = await axios.patch( '/api/company/restore-unit/${unitId}', ); return response.data; }, onSuccess: (data) => { toast.success(data?.message \|\| "Unit restored successfully"); queryClient.invalidateQueries({ queryKey: ["units-data"] }); setConfirmationAction(null); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to restore unit"); }, })`
- **isTechDepartment**, line 29: `(auth?.user?.departments \|\| []).some( (department) => String(department?._id \|\| department) === TECH_DEPARTMENT_ID \|\| ["tech", "tech department"].includes( department?.name?.trim().toLowerCase(), ), )`
- **auth**, line 28: `useAuth()`
- **isUpdatePending**, line 74: `useMutation({ mutationKey: ["update-unit"], mutationFn: async (data) => { const response = await axios.patch("/api/company/update-unit", data); return response.data; }, onSuccess: (data) => { setOpenEdit(null); toast.success(data.message); queryClient.invalidateQueries({ queryKey: ["units-data"] }); }, onError: (error) => { toast.error(error.message); }, })`
- **isCreatePending**, line 90: `useMutation({ mutationKey: ["create-unit"], mutationFn: async (data) => { const response = await axios.post("/api/company/add-unit", data); return response.data; }, onSuccess: (data) => { setOpenEdit(false); toast.success(data.message); queryClient.invalidateQueries({ queryKey: ["units-data"] }); }, onError: (error) => { toast.error(error.message); }, })`

## pages/Dashboard/SalesDashboard/MeetingRevenue.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/revenue/meetings — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/billing/client-invoicing/meeting-revenue-invoicing — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/revenue/meetings — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/client-invoicing/meeting-revenue-invoicing — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/mix-bag/revenue/meetings — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/revenue/meetings — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | NOT (!hasData) AND NOT (isError) AND NOT (isMeetingsLoading); exportData: true | No local disabled condition detected | Shared table export — [MeetingRevenue.jsx:798](../../client/src/pages/Dashboard/SalesDashboard/MeetingRevenue.jsx#L798) |
| Advanced filter (table-generated utility) | NOT (!hasData) AND NOT (isError) AND NOT (isMeetingsLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MeetingRevenue.jsx:798](../../client/src/pages/Dashboard/SalesDashboard/MeetingRevenue.jsx#L798) |
| Manage Meeting (button) | !showChart AND NOT (!hasData) AND NOT (isError) AND NOT (isMeetingsLoading) | No local disabled condition detected | () => navigate( "/app/dashboard/finance-dashboard/mix-bag/manage-meetings/external-clients", ) — [MeetingRevenue.jsx:824](../../client/src/pages/Dashboard/SalesDashboard/MeetingRevenue.jsx#L824) |
| View meeting revenue details (button) | NOT (!hasData) AND NOT (isError) AND NOT (isMeetingsLoading) | No local disabled condition detected | () => setSelectedRevenue(params.data) — [MeetingRevenue.jsx:1010](../../client/src/pages/Dashboard/SalesDashboard/MeetingRevenue.jsx#L1010) |
| Edit (configured menu/action) | !showChart && params.data.id AND NOT (!hasData) AND NOT (isError) AND NOT (isMeetingsLoading) | No local disabled condition detected | () => openEditModal(params.data) — [MeetingRevenue.jsx:1025](../../client/src/pages/Dashboard/SalesDashboard/MeetingRevenue.jsx#L1025) |
| Update Invoice (button) | editingRevenue AND NOT (!hasData) AND NOT (isError) AND NOT (isMeetingsLoading) | isUpdateDisabled; loading: updateInvoice.isPending | No inline handler declared; may submit a form or delegate to a component — [MeetingRevenue.jsx:1344](../../client/src/pages/Dashboard/SalesDashboard/MeetingRevenue.jsx#L1344) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **hasData**, line 553: `Array.isArray(meetingsData) && meetingsData.length > 0`
- **isError**, line 540: `useQuery({ queryKey: ["meetings-revenue"], queryFn: async () => { const response = await axios.get("/api/sales/get-meeting-revenue"); return Array.isArray(response.data) ? response.data : []; }, })`
- **params**, line 1008: `params`
- **isUpdateDisabled**, line 664: `updateInvoice.isPending`

## pages/Dashboard/SalesDashboard/SalesFinance/SalesBudget.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Request Budget (table-generated action) | !isHrLoading AND NOT (!isReady) | No local disabled condition detected | () => setOpenModal(true) — [SalesBudget.jsx:295](../../client/src/pages/Dashboard/SalesDashboard/SalesFinance/SalesBudget.jsx#L295) |
| Advanced filter (table-generated utility) | !isHrLoading AND NOT (!isReady); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [SalesBudget.jsx:295](../../client/src/pages/Dashboard/SalesDashboard/SalesFinance/SalesBudget.jsx#L295) |
| Submit (button) | NOT (!isReady) | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [SalesBudget.jsx:397](../../client/src/pages/Dashboard/SalesDashboard/SalesFinance/SalesBudget.jsx#L397) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isHrLoading**, line 34: `useQuery({ queryKey: ["salesBudget"], queryFn: async () => { try { const response = await axios.get( '/api/budget/company-budget?departmentId=6798bacce469e809084e24a1' ); const budgets = response.data.allBudgets; return Array.isArray(budgets) ? budgets : []; } catch (error) { console.error("Error fetching budget:", error); return []; } }, })`
- **isReady**, line 31: `useState(false)`

## pages/Dashboard/SalesDashboard/SalesSettings/BulkUploadSales.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [BulkUploadSales.jsx:55](../../client/src/pages/Dashboard/SalesDashboard/SalesSettings/BulkUploadSales.jsx#L55) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [BulkUploadSales.jsx:74](../../client/src/pages/Dashboard/SalesDashboard/SalesSettings/BulkUploadSales.jsx#L74) |

## pages/Dashboard/SalesDashboard/SalesSettings/SalesPolicies.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [SalesPolicies.jsx:58](../../client/src/pages/Dashboard/SalesDashboard/SalesSettings/SalesPolicies.jsx#L58) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [SalesPolicies.jsx:75](../../client/src/pages/Dashboard/SalesDashboard/SalesSettings/SalesPolicies.jsx#L75) |

## pages/Dashboard/SalesDashboard/SalesSettings/SalesSops.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [SalesSops.jsx:48](../../client/src/pages/Dashboard/SalesDashboard/SalesSettings/SalesSops.jsx#L48) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [SalesSops.jsx:67](../../client/src/pages/Dashboard/SalesDashboard/SalesSettings/SalesSops.jsx#L67) |

## pages/Dashboard/SalesDashboard/TotalRevenue.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/revenue/total-revenue — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/revenue/total-revenue — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/mix-bag/revenue/total-revenue — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/revenue/total-revenue — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| 'Open ${vertical} revenue details' (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleVerticalNavigation(vertical) — [TotalRevenue.jsx:159](../../client/src/pages/Dashboard/SalesDashboard/TotalRevenue.jsx#L159) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [TotalRevenue.jsx:466](../../client/src/pages/Dashboard/SalesDashboard/TotalRevenue.jsx#L466) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [TotalRevenue.jsx:466](../../client/src/pages/Dashboard/SalesDashboard/TotalRevenue.jsx#L466) |

## pages/Dashboard/SalesDashboard/UniqueLeads.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/unique-leads — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [UniqueLeads.jsx:750](../../client/src/pages/Dashboard/SalesDashboard/UniqueLeads.jsx#L750) |
| View lead details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewClient(params.data) — [UniqueLeads.jsx:861](../../client/src/pages/Dashboard/SalesDashboard/UniqueLeads.jsx#L861) |
| Edit (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleEditLead(params.data) — [UniqueLeads.jsx:872](../../client/src/pages/Dashboard/SalesDashboard/UniqueLeads.jsx#L872) |
| Add Leads (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setAddLeadOpen(true) — [UniqueLeads.jsx:891](../../client/src/pages/Dashboard/SalesDashboard/UniqueLeads.jsx#L891) |
| Export (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleLeadsExport — [UniqueLeads.jsx:895](../../client/src/pages/Dashboard/SalesDashboard/UniqueLeads.jsx#L895) |
| Add Leads (button) | No local render guard detected; page/API access still applies | isCreatingLead; loading: isCreatingLead | No inline handler declared; may submit a form or delegate to a component — [UniqueLeads.jsx:916](../../client/src/pages/Dashboard/SalesDashboard/UniqueLeads.jsx#L916) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 859: `params`
- **isCreatingLead**, line 210: `useMutation({ mutationFn: async (formData) => { const payload = { ...formData, dateOfContact: formatLeadDateValue(formData.dateOfContact), startDate: formatLeadDateValue(formData.startDate, { useCurrentTimeForToday: true, }), proposedLocations: normalizeProposedLocationValue( formData.proposedLocations ), officeInGoa: formData.officeInGoa === "true", openDesks: Number(formData.openDesks \|\| 0), cabinDesks: Number(formData.cabinDesks \|\| 0), totalDesks: Number(formData.totalDesks \|\| 0), clientBudget: Number(formData.clientBudget \|\| 0), }; const response = await axios.post("/api/sales/create-lead", payload); return response.data; }, onSuccess: async (data) => { toast.success(data?.message \|\| "Lead created successfully"); reset(); setAddLeadOpen(false); await fetchLeads(); }, onError: (error) =…`

## pages/Dashboard/SalesDashboard/ViewClientInfo.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/unique-leads/:client — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| isEditing ? "Cancel" : "Edit" (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleEditToggle — [ViewClientInfo.jsx:447](../../client/src/pages/Dashboard/SalesDashboard/ViewClientInfo.jsx#L447) |
| Submit (button) | isEditing | isUpdatingLead; loading: isUpdatingLead | handleSubmit(onSubmit) — [ViewClientInfo.jsx:567](../../client/src/pages/Dashboard/SalesDashboard/ViewClientInfo.jsx#L567) |
| Reset (button) | isEditing | isUpdatingLead | handleReset — [ViewClientInfo.jsx:573](../../client/src/pages/Dashboard/SalesDashboard/ViewClientInfo.jsx#L573) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isEditing**, line 77: `useState( Boolean(location?.state?.editMode), )`
- **isUpdatingLead**, line 228: `useMutation({ mutationFn: async (formData) => { if (!activeLead?._id) { throw new Error("Lead details not found"); } const payload = { leadId: activeLead._id, ...formData, dateOfContact: formatLeadDateValue(formData.dateOfContact), startDate: formatLeadDateValue(formData.startDate), lastFollowUpDate: formatLeadDateValue(formData.lastFollowUpDate), serviceCategory: formData.serviceCategory \|\| "", proposedLocations: formData.proposedLocations \|\| "", officeInGoa: formData.officeInGoa === "Yes", openDesks: Number(formData.openDesks \|\| 0), cabinDesks: Number(formData.cabinDesks \|\| 0), totalDesks: Number(formData.totalDesks \|\| 0), clientBudget: Number(formData.clientBudget \|\| 0), }; const response = await axios.patch("/api/sales/edit-lead", payload); return { response: response.data, payload }; …`

## pages/Dashboard/SalesDashboard/ViewClients/ClientDetails.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/co-working/:clientName/client-details — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| isEditing ? "Cancel" : "Edit" (button) | No local render guard detected; page/API access still applies | !selectedClient?._id \|\| isClientLoading | handleEditToggle — [ClientDetails.jsx:624](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ClientDetails.jsx#L624) |
| Submit (button) | isEditing | No local disabled condition detected | isEditing ? handleSubmit(onSubmit) : handleEditToggle — [ClientDetails.jsx:1296](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ClientDetails.jsx#L1296) |
| Reset (button) | isEditing | No local disabled condition detected | handleReset — [ClientDetails.jsx:1306](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ClientDetails.jsx#L1306) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedClient**, line 156: `useSelector((state) => state.client.selectedClient)`
- **isClientLoading**, line 246: `useQuery({ queryKey: ["coWorkingClientByName", normalizedClientName], enabled: Boolean(normalizedClientName) && (selectedClient?.clientName \|\| "").trim().toLowerCase() !== normalizedClientName, queryFn: async () => { const response = await axios.get("/api/sales/co-working-clients"); const clients = Array.isArray(response?.data) ? response.data : []; const matchedClient = clients.find( (client) => (client?.clientName \|\| "").trim().toLowerCase() === normalizedClientName, ); if (matchedClient?._id) { dispatch(setSelectedClient(matchedClient)); } return matchedClient; }, })`
- **isEditing**, line 268: `useState(false)`

## pages/Dashboard/SalesDashboard/ViewClients/ClientMembers.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/co-working/:clientName/members — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Edit (configured menu/action) | No local render guard detected; page/API access still applies | params.data?.isDeleted | () => handleEditMember(params.data) — [ClientMembers.jsx:484](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ClientMembers.jsx#L484) |
| params.data.status ? "Mark As Inactive" : "Mark As Active" (configured menu/action) | No local render guard detected; page/API access still applies | params.data?.isDeleted | () => handleToggleMemberStatus(params.data) — [ClientMembers.jsx:489](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ClientMembers.jsx#L489) |
| Delete (configured menu/action) | No local render guard detected; page/API access still applies | params.data?.isDeleted \|\| isDeletePending | () => deleteMember(getMemberId(params.data)) — [ClientMembers.jsx:494](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ClientMembers.jsx#L494) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [ClientMembers.jsx:509](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ClientMembers.jsx#L509) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ClientMembers.jsx:509](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ClientMembers.jsx#L509) |
| Submit (button) | No local render guard detected; page/API access still applies | loading: isSubmitting | No inline handler declared; may submit a form or delegate to a component — [ClientMembers.jsx:630](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ClientMembers.jsx#L630) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 480: `params`
- **isDeletePending**, line 307: `useMutation({ mutationFn: async (memberId) => { const response = await axios.delete('/api/sales/co-working-member/${memberId}'); return response.data; }, onSuccess: (response, memberId) => { const updatedMembers = getNextMembersAfterDelete( members, memberId, canViewDisabledMembers, ); setMembers(updatedMembers); dispatch( setSelectedClient({ ...selectedClient, members: updatedMembers, }), ); queryClient.setQueryData( ["selectedCoWorkingClient", clientName, selectedClient?._id, selectedClient?.clientName], (current) => current ? { ...current, members: updatedMembers, } : current, ); queryClient.setQueryData( ["salesClientMembers", resolvedClient?._id, resolvedClient?.clientName], updatedMembers, ); queryClient.invalidateQueries({ queryKey: ["clientsData"] }); queryClient.invalidateQueries(…`
- **canViewDisabledMembers**, line 81: `useMemo( () => canViewDeletedMembers(auth?.user), [auth?.user], )`
- **canViewDeletedMembers**, line 52: `(user) => { const roleTitles = getRoleTitles(user); const departmentNames = getDepartmentNames(user); if (roleTitles.some((role) => ["master admin", "super admin"].includes(role))) { return true; } return ( roleTitles.some((roleTitle) => roleTitle.includes("air tech department") \|\| roleTitle.includes("air tech"), ) \|\| departmentNames.some((departmentName) => departmentName.includes("air tech department") \|\| departmentName.includes("air tech"), ) ); }`
- **auth**, line 75: `useAuth()`
- **selectedClient**, line 77: `useSelector((state) => state.client.selectedClient)`

## pages/Dashboard/SalesDashboard/ViewClients/ClientRevenue.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/co-working/:clientName/revenue — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { if (params?.data) { setClientDetails(params.data); setOpenModal(true); } } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (params?.data) { setClientDetails(params.data); setOpenModal(true); } } — [ClientRevenue.jsx:81](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ClientRevenue.jsx#L81) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [ClientRevenue.jsx:165](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ClientRevenue.jsx#L165) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ClientRevenue.jsx:165](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ClientRevenue.jsx#L165) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 80: `params`

## pages/Dashboard/SalesDashboard/ViewClients/CoWorkingClients.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/co-working — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleClickRow(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleClickRow(params.data) — [CoWorkingClients.jsx:96](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/CoWorkingClients.jsx#L96) |
| Add Client (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( "/app/dashboard/sales-dashboard/mix-bag/clients/co-working/client-onboarding", ) — [CoWorkingClients.jsx:204](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/CoWorkingClients.jsx#L204) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [CoWorkingClients.jsx:204](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/CoWorkingClients.jsx#L204) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [CoWorkingClients.jsx:204](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/CoWorkingClients.jsx#L204) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 95: `params`

## pages/Dashboard/SalesDashboard/ViewClients/Desks.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/co-working/:clientName/desks — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Desks.jsx:168](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/Desks.jsx#L168) |
| Upload (button) | selectedFile | isUploadPending; loading: isUploadPending | No inline handler declared; may submit a form or delegate to a component — [Desks.jsx:222](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/Desks.jsx#L222) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedFile**, line 25: `useState(null)`
- **isUploadPending**, line 110: `useMutation({ mutationKey: ["uploadImage"], mutationFn: uploadRoomImage, onSuccess: (data) => toast.success(data.message), //onError: (error) => toast.error(error.message), onError: (error) => toast.error( error?.response?.data?.message \|\| error.message \|\| "Upload failed", ), })`

## pages/Dashboard/SalesDashboard/ViewClients/ExternalClientMembers.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/external-client/meetings/external-companies/:clientName/members — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/mix-bag/external-client/open-desk/external-companies/:clientName/members — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ExternalClientMembers.jsx:138](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ExternalClientMembers.jsx#L138) |

## pages/Dashboard/SalesDashboard/ViewClients/ExternalClientRevenue.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/external-client/meetings/external-companies/:clientName/revenue — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ExternalClientRevenue.jsx:106](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/ExternalClientRevenue.jsx#L106) |

## pages/Dashboard/SalesDashboard/ViewClients/LeadsLayout.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => toggleInvestorSeries(seriesName) (button) | investorBlueStyle | No local disabled condition detected | () => toggleInvestorSeries(seriesName) — [LeadsLayout.jsx:584](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/LeadsLayout.jsx#L584) |
| <MdNavigateBefore /> (button) | !hideFinancialYearControls | No local disabled condition detected | handlePrevYear — [LeadsLayout.jsx:620](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/LeadsLayout.jsx#L620) |
| <MdNavigateNext /> (button) | !hideFinancialYearControls | No local disabled condition detected | handleNextYear — [LeadsLayout.jsx:628](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/LeadsLayout.jsx#L628) |
| Advanced filter (table-generated utility) | NOT (hideAccordion); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [LeadsLayout.jsx:673](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/LeadsLayout.jsx#L673) |

## pages/Dashboard/SalesDashboard/ViewClients/MemberDetails.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/mix-bag/client-members/client-members-data/:clientName/members/view-member/:id — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/mix-bag/clients/co-working/:clientName/members/view-member/:id — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| isEditing ? "Cancel" : "Edit" (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleEditToggle — [MemberDetails.jsx:94](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/MemberDetails.jsx#L94) |
| Submit (button) | isEditing | No local disabled condition detected | handleSubmit(onSubmit) — [MemberDetails.jsx:162](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/MemberDetails.jsx#L162) |
| Reset (button) | isEditing | No local disabled condition detected | handleReset — [MemberDetails.jsx:166](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/MemberDetails.jsx#L166) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isEditing**, line 53: `useState(false)`

## pages/Dashboard/SalesDashboard/ViewClients/OpenDeskRevenue.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/external-client/open-desk/external-companies/:clientName/revenue — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Payment Details (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setSelectedPaymentEntry(params?.data \|\| null); setOpenPaymentModal(true); } — [OpenDeskRevenue.jsx:86](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/OpenDeskRevenue.jsx#L86) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [OpenDeskRevenue.jsx:151](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/OpenDeskRevenue.jsx#L151) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 84: `params`

## pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClientDesks.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/virtual-office/:clientId/desks — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VirtualOfficeClientDesks.jsx:50](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClientDesks.jsx#L50) |

## pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClientDetails.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/virtual-office/:clientId/client-details — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/clients/virtual-office/:clientId/client-details — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/clients/virtual-office/:clientId/desks — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/clients/virtual-office/:clientId/revenue — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/clients/virtual-office/:clientId/members — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| isEditing ? "Cancel" : "Edit" (button) | No local render guard detected; page/API access still applies | isClientLoading \|\| isClientByNameLoading \|\| !selectedClient?._id | handleEditToggle — [VirtualOfficeClientDetails.jsx:750](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClientDetails.jsx#L750) |
| Submit (button) | isEditing | No local disabled condition detected | isEditing ? handleSubmit(onSubmit) : handleEditToggle — [VirtualOfficeClientDetails.jsx:1509](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClientDetails.jsx#L1509) |
| Reset (button) | isEditing | No local disabled condition detected | handleReset — [VirtualOfficeClientDetails.jsx:1519](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClientDetails.jsx#L1519) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isClientLoading**, line 254: `useQuery({ queryKey: ["virtualOfficeClient", virtualOfficeClientId], enabled: Boolean(virtualOfficeClientId), queryFn: async () => { try { const response = await axios.get( '/api/sales/virtual-office/clients?virtualofficeclientid=${virtualOfficeClientId}', ); const rawClientData = response?.data?.client \|\| response?.data?.data \|\| response?.data; const clientData = Array.isArray(rawClientData) ? rawClientData[0] : rawClientData; if (clientData?._id) { dispatch(setSelectedClient(clientData)); } return clientData; } catch (error) { toast.error( error?.response?.data?.message \|\| "Unable to fetch client details", ); throw error; } }, })`
- **isClientByNameLoading**, line 232: `useQuery({ queryKey: ["virtualOfficeClientByName", normalizedClientName], enabled: Boolean(normalizedClientName) && !/^[a-fA-F0-9]{24}$/.test(clientId \|\| "") && (selectedClient?.clientName \|\| "").trim().toLowerCase() !== normalizedClientName, queryFn: async () => { const response = await axios.get("/api/sales/virtual-office/clients"); const clients = Array.isArray(response?.data) ? response.data : []; const matchedClient = clients.find( (client) => (client?.clientName \|\| "").trim().toLowerCase() === normalizedClientName, ); if (matchedClient?._id) { dispatch(setSelectedClient(matchedClient)); } return matchedClient; }, })`
- **selectedClient**, line 176: `useSelector((state) => state.client.selectedClient)`
- **isEditing**, line 282: `useState(false)`

## pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClientMembers.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/virtual-office/:clientId/members — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VirtualOfficeClientMembers.jsx:57](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClientMembers.jsx#L57) |

## pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClientRevenue.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/virtual-office/:clientId/revenue — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VirtualOfficeClientRevenue.jsx:90](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClientRevenue.jsx#L90) |
| Icon/action: () => setViewRow(params.data) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setViewRow(params.data) — [VirtualOfficeClientRevenue.jsx:104](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClientRevenue.jsx#L104) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 103: `params`

## pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClients.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/virtual-office — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewClient(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewClient(params.data) — [VirtualOfficeClients.jsx:146](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClients.jsx#L146) |
| Edit Client Details (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewClient(params.data) — [VirtualOfficeClients.jsx:174](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClients.jsx#L174) |
| params.data?.isActive ? "Mark As Inactive" : "Mark As Active" (configured menu/action) | No local render guard detected; page/API access still applies | isStatusUpdating | () => handleToggleClientStatus(params.data) — [VirtualOfficeClients.jsx:178](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClients.jsx#L178) |
| Add Client (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( "/app/dashboard/sales-dashboard/mix-bag/clients/virtual-office/client-onboarding", ) — [VirtualOfficeClients.jsx:193](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClients.jsx#L193) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [VirtualOfficeClients.jsx:193](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClients.jsx#L193) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VirtualOfficeClients.jsx:193](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClients.jsx#L193) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 145: `params`
- **data**, line 62: `useQuery({ queryKey: ["clientDetails"], queryFn: async () => { try { const response = await axios.get("/api/sales/consolidated-clients"); return response.data; } catch (error) { console.error(error.response.data.message); } }, })`
- **params**, line 170: `params`
- **isStatusUpdating**, line 89: `useMutation({ mutationFn: async ({ id, isActive }) => { const response = await axios.patch('/api/sales/virtual-office/${id}/status', { isActive, }); return response.data; }, onSuccess: (response) => { toast.success(response?.message \|\| "Client status updated successfully"); queryClient.invalidateQueries({ queryKey: ["clientDetails"] }); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| error?.message \|\| "Failed to update client status", ); }, })`

## pages/Dashboard/SalesDashboard/ViewClients/VisitorDetails.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/external-client/meetings/external-companies/:clientName/client-details — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/mix-bag/external-client/open-desk/external-companies/:clientName/client-details — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| isEditing ? "Cancel" : "Edit" (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setIsEditing((prev) => !prev) — [VisitorDetails.jsx:201](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VisitorDetails.jsx#L201) |
| Submit (button) | isEditing | No local disabled condition detected | handleSubmit(onSubmit) — [VisitorDetails.jsx:295](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VisitorDetails.jsx#L295) |
| Reset (button) | isEditing | No local disabled condition detected | handleReset — [VisitorDetails.jsx:296](../../client/src/pages/Dashboard/SalesDashboard/ViewClients/VisitorDetails.jsx#L296) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isEditing**, line 17: `useState(false)`

## pages/Dashboard/SalesDashboard/VirtualOffice.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/revenue/virtual-office — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/billing/client-invoicing/virtual-office-revenue-invoicing — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/revenue/virtual-office — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/client-invoicing/virtual-office-revenue-invoicing — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/mix-bag/revenue/virtual-office — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/revenue/virtual-office — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View invoice (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setViewRow(data) — [VirtualOffice.jsx:780](../../client/src/pages/Dashboard/SalesDashboard/VirtualOffice.jsx#L780) |
| View invoice (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setViewRow(data) — [VirtualOffice.jsx:954](../../client/src/pages/Dashboard/SalesDashboard/VirtualOffice.jsx#L954) |
| Edit (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openEdit(data) — [VirtualOffice.jsx:965](../../client/src/pages/Dashboard/SalesDashboard/VirtualOffice.jsx#L965) |
| Export (table-generated utility) | !isLoadingVirtualOfficeRevenue; exportData: true | No local disabled condition detected | Shared table export — [VirtualOffice.jsx:1111](../../client/src/pages/Dashboard/SalesDashboard/VirtualOffice.jsx#L1111) |
| Advanced filter (table-generated utility) | !isLoadingVirtualOfficeRevenue; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VirtualOffice.jsx:1111](../../client/src/pages/Dashboard/SalesDashboard/VirtualOffice.jsx#L1111) |
| Add Virtual (button) | showInvoiceProjections AND !isLoadingVirtualOfficeRevenue | No local disabled condition detected | openAdd — [VirtualOffice.jsx:1154](../../client/src/pages/Dashboard/SalesDashboard/VirtualOffice.jsx#L1154) |
| Add Virtual (button) | addRow | isAddingVirtualInvoice; loading: isAddingVirtualInvoice | No inline handler declared; may submit a form or delegate to a component — [VirtualOffice.jsx:1438](../../client/src/pages/Dashboard/SalesDashboard/VirtualOffice.jsx#L1438) |
| Update Invoice (button) | editRow | isPending; loading: isPending | No inline handler declared; may submit a form or delegate to a component — [VirtualOffice.jsx:1904](../../client/src/pages/Dashboard/SalesDashboard/VirtualOffice.jsx#L1904) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **data**, line 779: `{ data }`
- **data**, line 952: `{ data }`
- **isLoadingVirtualOfficeRevenue**, line 198: `useQuery({ queryKey: ["virtualOfficeRevenue", { useClientDetails: true }], // queryKey: ["virtualOfficeRevenue"], // queryKey: [ // "virtualOfficeRevenue", // { useClientDetails: showInvoiceProjections }, // ], queryFn: async () => { try { const response = await axios.get( '/api/sales/get-virtual-office-revenue', { params: { useClientDetails: true } }, // { // params: showInvoiceProjections // ? { useClientDetails: true } // : undefined, // }, ); return Array.isArray(response.data) ? response.data : []; } catch (error) { throw new Error(error.response.data.message); } }, })`
- **isAddingVirtualInvoice**, line 560: `useMutation({ mutationFn: async (values) => { const payload = { client: values.client, location: selectedAddClient?.buildingAddress \|\| selectedAddClient?.city \|\| "", channel: selectedAddClient?.bookingType \|\| "Direct", taxableAmount: addRevenue, revenue: addRevenue, receivedAmount: addReceivedAmountValue, totalReceivedAmount: addTotalReceivedAmount, invoiceUploadedAt: values.invoiceUploadedAt ? dayjs(values.invoiceUploadedAt).toISOString() : new Date().toISOString(), totalTerm: selectedAddClient?.totalTerm \|\| 0, rentDate: values.rentStatus === "Paid" && values.invoiceUploadedAt ? dayjs(values.invoiceUploadedAt).toISOString() : values.rentDate ? dayjs(values.rentDate).toISOString() : selectedAddClient?.rentDate \|\| null, rentStatus: values.rentStatus, annualIncrement: selectedAddClient?.annu…`
- **selectedAddClient**, line 388: `activeVirtualOfficeClients.find( (client) => client._id === selectedAddClientId, )`
- **selectedAddClientId**, line 387: `watchAdd("client")`
- **isPending**, line 332: `useMutation({ mutationFn: async (values) => { const form = new FormData(); form.append("revenueId", editRow._id \|\| ""); form.append( "isProjectedInvoice", String(Boolean(editRow.isProjectedInvoice)), ); form.append( "removeInvoice", String(Boolean(editRow?.invoice?.link) && !values.invoiceFile), ); [ "client", "clientName", "clientInvoiceName", "location", "channel", "noOfDesks", "deskRate", "taxableAmount", "revenue", "receivedAmount", "totalTerm", "securityDeposit", "billingFrequency", "rentStatus", "annualIncrement", "service", ].forEach((field) => { if (values[field] !== undefined && values[field] !== null) { form.append(field, values[field]); } }); form.append("totalReceivedAmount", String(editTotalReceivedAmount)); ["dueTerm", "rentDate", "pastDueDate", "nextIncrementDate"].forEach( …`

## pages/Dashboard/SalesDashboard/VirtualOfficeForm.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/sales-dashboard/mix-bag/clients/virtual-office/client-onboarding — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/clients/virtual-office/client-onboarding — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Submit (button) | No local render guard detected; page/API access still applies | isMutateClientPending; loading: isMutateClientPending | No inline handler declared; may submit a form or delegate to a component — [VirtualOfficeForm.jsx:897](../../client/src/pages/Dashboard/SalesDashboard/VirtualOfficeForm.jsx#L897) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [VirtualOfficeForm.jsx:903](../../client/src/pages/Dashboard/SalesDashboard/VirtualOfficeForm.jsx#L903) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isMutateClientPending**, line 150: `useMutation({ mutationKey: "clientData", mutationFn: async (data) => { const response = await axios.post( "/api/sales/onboard-virtual-office-client", data, ); return response.data; }, onSuccess: (data) => { toast.success(data.message); reset(); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| error?.message \|\| "Failed to onboard client" ); }, })`

## pages/Dashboard/SalesDashboard/Workations.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/revenue/workation — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/billing/client-invoicing/workation-revenue-invoicing — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/revenue/workation — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/client-invoicing/workation-revenue-invoicing — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/mix-bag/revenue/workation — no permission wrapper detected on this route-object chain
- /app/dashboard/sales-dashboard/revenue/workation — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View invoice details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => onView(row) — [Workations.jsx:89](../../client/src/pages/Dashboard/SalesDashboard/Workations.jsx#L89) |
| Edit (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => onEdit(row) — [Workations.jsx:101](../../client/src/pages/Dashboard/SalesDashboard/Workations.jsx#L101) |
| View invoice details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setViewRow(params.data) — [Workations.jsx:460](../../client/src/pages/Dashboard/SalesDashboard/Workations.jsx#L460) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [Workations.jsx:568](../../client/src/pages/Dashboard/SalesDashboard/Workations.jsx#L568) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Workations.jsx:568](../../client/src/pages/Dashboard/SalesDashboard/Workations.jsx#L568) |
| Add Workation (button) | showInvoiceProjections | No local disabled condition detected | openCreate — [Workations.jsx:605](../../client/src/pages/Dashboard/SalesDashboard/Workations.jsx#L605) |
| modalMode === "edit" ? "Update Invoice" : "Add Workation" (button) | modalMode | isSavingInvoice; loading: isSavingInvoice | No inline handler declared; may submit a form or delegate to a component — [Workations.jsx:936](../../client/src/pages/Dashboard/SalesDashboard/Workations.jsx#L936) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 459: `params`
- **isSavingInvoice**, line 357: `useMutation({ mutationFn: async (values) => { const formData = new FormData(); const selectedClient = clientOptions.find( (option) => option.value === values.selectedClient, ); formData.append("revenueId", editRow?._id \|\| ""); formData.append( "isProjectedInvoice", String(Boolean(editRow?.isProjectedInvoice)), ); [ ["nameOfClient", values.nameOfClient], ["clientInvoiceName", values.clientInvoiceName], ["particulars", values.particulars], ["taxableAmount", values.taxableAmount], ["gst", values.gst], ["totalAmount", values.totalAmount], ["status", values.status], ].forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") { formData.append(key, value); } }); if (selectedClient?.clientId) { formData.append("clientId", selectedClient.clientId); formData.append("cli…`
