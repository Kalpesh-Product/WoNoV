# Admin Dashboard: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Dashboard/AdminDashboard/AdminAnnualExpenses.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Add Expense (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddAsset — [AdminAnnualExpenses.jsx:174](../../client/src/pages/Dashboard/AdminDashboard/AdminAnnualExpenses.jsx#L174) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AdminAnnualExpenses.jsx:174](../../client/src/pages/Dashboard/AdminDashboard/AdminAnnualExpenses.jsx#L174) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminAnnualExpenses.jsx:174](../../client/src/pages/Dashboard/AdminDashboard/AdminAnnualExpenses.jsx#L174) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | () => { toast.success("Expense type added succesfully"); setIsModalOpen(false); } — [AdminAnnualExpenses.jsx:281](../../client/src/pages/Dashboard/AdminDashboard/AdminAnnualExpenses.jsx#L281) |

## pages/Dashboard/AdminDashboard/AdminClientDetails.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/mix-bag/client-members/client-members-data/:clientName/client-details — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Edit (button) | No local render guard detected; page/API access still applies | true | No inline handler declared; may submit a form or delegate to a component — [AdminClientDetails.jsx:317](../../client/src/pages/Dashboard/AdminDashboard/AdminClientDetails.jsx#L317) |

## pages/Dashboard/AdminDashboard/AdminClientMemberDetails.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Edit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleEditToggle — [AdminClientMemberDetails.jsx:72](../../client/src/pages/Dashboard/AdminDashboard/AdminClientMemberDetails.jsx#L72) |
| isEditing ? "Submit" : "Edit" (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | isEditing ? handleSubmit(onSubmit) : handleEditToggle — [AdminClientMemberDetails.jsx:413](../../client/src/pages/Dashboard/AdminDashboard/AdminClientMemberDetails.jsx#L413) |
| Reset (button) | isEditing | No local disabled condition detected | handleReset — [AdminClientMemberDetails.jsx:420](../../client/src/pages/Dashboard/AdminDashboard/AdminClientMemberDetails.jsx#L420) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isEditing**, line 48: `useState(false)`

## pages/Dashboard/AdminDashboard/AdminClientMembers.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/mix-bag/client-members/client-members-data/:clientName/members — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Restore member (button) | params.data?.isDeleted | isRestorePending \|\| isDeletePending | () => restoreMember(getMemberId(params.data)) — [AdminClientMembers.jsx:580](../../client/src/pages/Dashboard/AdminDashboard/AdminClientMembers.jsx#L580) |
| params.data.status ? "Mark member as inactive" : "Mark member as active" (button) | NOT (params.data?.isDeleted) | isStatusPending | () => handleToggleMemberStatus(params.data) — [AdminClientMembers.jsx:592](../../client/src/pages/Dashboard/AdminDashboard/AdminClientMembers.jsx#L592) |
| Edit member (button) | NOT (params.data?.isDeleted) | No local disabled condition detected | () => handleEditMember(params.data) — [AdminClientMembers.jsx:612](../../client/src/pages/Dashboard/AdminDashboard/AdminClientMembers.jsx#L612) |
| params.data?.isDeleted ? "Permanently delete member" : "Delete member" (button) | No local render guard detected; page/API access still applies | isDeletePending \|\| isRestorePending | () => setMemberToDelete(params.data) — [AdminClientMembers.jsx:623](../../client/src/pages/Dashboard/AdminDashboard/AdminClientMembers.jsx#L623) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AdminClientMembers.jsx:644](../../client/src/pages/Dashboard/AdminDashboard/AdminClientMembers.jsx#L644) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminClientMembers.jsx:644](../../client/src/pages/Dashboard/AdminDashboard/AdminClientMembers.jsx#L644) |
| Submit (button) | No local render guard detected; page/API access still applies | loading: isSubmitting | No inline handler declared; may submit a form or delegate to a component — [AdminClientMembers.jsx:787](../../client/src/pages/Dashboard/AdminDashboard/AdminClientMembers.jsx#L787) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 577: `params`
- **isRestorePending**, line 330: `useMutation({ mutationFn: async (memberId) => { const response = await axios.patch( '/api/sales/co-working-member/${memberId}/restore', ); return response.data; }, onSuccess: (response, memberId) => { const updatedMembers = members.map((member) => getCurrentMemberId(member) === memberId ? { ...member, ...response?.data } : member, ); setMembers(updatedMembers); dispatch( setSelectedClient({ ...selectedClient, members: updatedMembers, }), ); queryClient.setQueryData( [ "selectedCoWorkingClientMembers", resolvedClient?._id, resolvedClient?.clientName, ], updatedMembers, ); queryClient.invalidateQueries({ queryKey: ["clientsData"] }); queryClient.invalidateQueries({ queryKey: ["co-working-clients"] }); queryClient.invalidateQueries({ queryKey: ["selectedCoWorkingClient"] }); queryClient.inval…`
- **selectedClient**, line 89: `useSelector((state) => state.client.selectedClient)`
- **isDeletePending**, line 376: `useMutation({ mutationFn: async (memberId) => { const response = await axios.delete('/api/sales/co-working-member/${memberId}'); return response.data; }, onSuccess: (response, memberId) => { const updatedMembers = members.filter( (member) => getCurrentMemberId(member) !== memberId, ); setMembers(updatedMembers); dispatch( setSelectedClient({ ...selectedClient, members: updatedMembers, }), ); queryClient.setQueryData( ["selectedCoWorkingClient", clientName, selectedClient?._id, selectedClient?.clientName], (current) => current ? { ...current, members: updatedMembers, memberCount: canViewDisabledMembers ? updatedMembers.length : updatedMembers.length, } : current, ); queryClient.setQueryData( ["selectedCoWorkingClientMembers", resolvedClient?._id, resolvedClient?.clientName], updatedMembers,…`
- **canViewDisabledMembers**, line 94: `useMemo( () => canViewDeletedMembers(auth?.user), [auth?.user], )`
- **canViewDeletedMembers**, line 66: `(user) => { const roleTitles = getRoleTitles(user); const departmentNames = getDepartmentNames(user); return ( roleTitles.some( (roleTitle) => roleTitle.includes("top management") \|\| roleTitle.includes("tech department") \|\| roleTitle.includes("air tech"), ) \|\| departmentNames.some((departmentName) => PRIVILEGED_DEPARTMENTS.has(departmentName), ) ); }`
- **auth**, line 87: `useAuth()`
- **isStatusPending**, line 271: `useMutation({ mutationFn: async ({ memberId, isActive }) => { const response = await axios.patch( '/api/sales/co-working-member/${memberId}/status', { isActive }, ); return response.data; }, onSuccess: (response, variables) => { const updatedMembers = members.map((member) => { const currentMemberId = getMemberId(member); if (currentMemberId !== variables.memberId) { return member; } return { ...member, isActive: variables.isActive, status: variables.isActive ? "Active" : "Inactive", biometricStatus: normalizeBiometricStatus( response?.data?.biometricStatus, ), }; }); setMembers(updatedMembers); dispatch( setSelectedClient({ ...selectedClient, members: updatedMembers, }), ); queryClient.setQueryData( [ "selectedCoWorkingClientMembers", resolvedClient?._id, resolvedClient?.clientName, ], upd…`

## pages/Dashboard/AdminDashboard/AdminClientsData/AdminClientOnboard.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/mix-bag/client-members/client-members-onboard — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Submit (button) | No local render guard detected; page/API access still applies | isMutateClientPending; loading: isMutateClientPending | No inline handler declared; may submit a form or delegate to a component — [AdminClientOnboard.jsx:647](../../client/src/pages/Dashboard/AdminDashboard/AdminClientsData/AdminClientOnboard.jsx#L647) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [AdminClientOnboard.jsx:653](../../client/src/pages/Dashboard/AdminDashboard/AdminClientsData/AdminClientOnboard.jsx#L653) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isMutateClientPending**, line 157: `useMutation({ mutationKey: "clientMemberData", mutationFn: async (data) => { const response = await axios.post( '/api/sales/onboard-co-working-member', data, ); return response.data; }, onSuccess: (data) => { toast.success(data.message); queryClient.invalidateQueries({ queryKey: ["clientsData"] }); reset(); }, onError: (error) => { toast.error(error.message); }, })`

## pages/Dashboard/AdminDashboard/AdminClientsData/AdminClientsData.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/mix-bag/client-members/client-members-data — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleClickRow(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleClickRow(params.data) — [AdminClientsData.jsx:100](../../client/src/pages/Dashboard/AdminDashboard/AdminClientsData/AdminClientsData.jsx#L100) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AdminClientsData.jsx:229](../../client/src/pages/Dashboard/AdminDashboard/AdminClientsData/AdminClientsData.jsx#L229) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminClientsData.jsx:229](../../client/src/pages/Dashboard/AdminDashboard/AdminClientsData/AdminClientsData.jsx#L229) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 99: `params`

## pages/Dashboard/AdminDashboard/AdminClientsList.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleClickRow(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleClickRow(params.data) — [AdminClientsList.jsx:50](../../client/src/pages/Dashboard/AdminDashboard/AdminClientsList.jsx#L50) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminClientsList.jsx:139](../../client/src/pages/Dashboard/AdminDashboard/AdminClientsList.jsx#L139) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 49: `params`

## pages/Dashboard/AdminDashboard/AdminData/AdminAssetList.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { // Find the full asset object from dummyAssets + assetsList const fullAsset = [ ...(assetsList \|\| []), ...dummyAssets, ].find( (item) => item.name === params.data.c… (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { // Find the full asset object from dummyAssets + assetsList const fullAsset = [ ...(assetsList \|\| []), ...dummyAssets, ].find( (item) => item.name === params.data.category && item.brand === params.data.brand && item.price .toString() .includes(params.data.price.replace(/,/g, "")), // fuzzy match in case formatting differs ); if (f… — [AdminAssetList.jsx:120](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminAssetList.jsx#L120) |
| Add Asset (table-generated action) | No local render guard detected; page/API access still applies | true | handleAddAsset — [AdminAssetList.jsx:285](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminAssetList.jsx#L285) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminAssetList.jsx:285](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminAssetList.jsx#L285) |
| Select Image (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AdminAssetList.jsx:328](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminAssetList.jsx#L328) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AdminAssetList.jsx:581](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminAssetList.jsx#L581) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 116: `params`

## pages/Dashboard/AdminDashboard/AdminData/AdminElectricityExpenses.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/data/electricity-expenses — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AdminElectricityExpenses.jsx:374](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminElectricityExpenses.jsx#L374) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminElectricityExpenses.jsx:374](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminElectricityExpenses.jsx#L374) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AdminElectricityExpenses.jsx:540](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminElectricityExpenses.jsx#L540) |

## pages/Dashboard/AdminDashboard/AdminData/AdminMonthlyInvoiceReports.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleDetailsClick(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleDetailsClick(params.data) — [AdminMonthlyInvoiceReports.jsx:118](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminMonthlyInvoiceReports.jsx#L118) |
| Add Invoiced (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddAsset — [AdminMonthlyInvoiceReports.jsx:257](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminMonthlyInvoiceReports.jsx#L257) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminMonthlyInvoiceReports.jsx:257](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminMonthlyInvoiceReports.jsx#L257) |
| Submit (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AdminMonthlyInvoiceReports.jsx:446](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminMonthlyInvoiceReports.jsx#L446) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 116: `params`

## pages/Dashboard/AdminDashboard/AdminData/AdminVendorDatabase.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { const fullVendor = vendorsList.find( (v) => v.name === params.data.name && v.email === params.data.email, ); handleDetailsClick(fullVendor); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { const fullVendor = vendorsList.find( (v) => v.name === params.data.name && v.email === params.data.email, ); handleDetailsClick(fullVendor); } — [AdminVendorDatabase.jsx:116](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminVendorDatabase.jsx#L116) |
| Add Vendor (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddAsset — [AdminVendorDatabase.jsx:270](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminVendorDatabase.jsx#L270) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminVendorDatabase.jsx:270](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminVendorDatabase.jsx#L270) |
| Submit (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AdminVendorDatabase.jsx:425](../../client/src/pages/Dashboard/AdminDashboard/AdminData/AdminVendorDatabase.jsx#L425) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 114: `params`

## pages/Dashboard/AdminDashboard/AdminExecutiveExpenses.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/admin-executive-expense — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminExecutiveExpenses.jsx:357](../../client/src/pages/Dashboard/AdminDashboard/AdminExecutiveExpenses.jsx#L357) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AdminExecutiveExpenses.jsx:522](../../client/src/pages/Dashboard/AdminDashboard/AdminExecutiveExpenses.jsx#L522) |

## pages/Dashboard/AdminDashboard/AdminExpenses/AdminExpenses.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/admin-expenses — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AdminExpenses.jsx:988](../../client/src/pages/Dashboard/AdminDashboard/AdminExpenses/AdminExpenses.jsx#L988) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminExpenses.jsx:988](../../client/src/pages/Dashboard/AdminDashboard/AdminExpenses/AdminExpenses.jsx#L988) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AdminExpenses.jsx:1150](../../client/src/pages/Dashboard/AdminDashboard/AdminExpenses/AdminExpenses.jsx#L1150) |

## pages/Dashboard/AdminDashboard/AdminExpenses/AdminExpensesClear.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/admin-expenses/admin-expenses-layout/:client/admin-expenses-clear — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminExpensesClear.jsx:150](../../client/src/pages/Dashboard/AdminDashboard/AdminExpenses/AdminExpensesClear.jsx#L150) |

## pages/Dashboard/AdminDashboard/AdminExpenses/AdminExpensesOccupied.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/admin-expenses/admin-expenses-layout/:client/admin-expenses-occupied — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminExpensesOccupied.jsx:151](../../client/src/pages/Dashboard/AdminDashboard/AdminExpenses/AdminExpensesOccupied.jsx#L151) |

## pages/Dashboard/AdminDashboard/AdminFinance/AdminBudget.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Request Budget (table-generated action) | !isHrLoading AND NOT (!isReady) | No local disabled condition detected | () => setOpenModal(true) — [AdminBudget.jsx:305](../../client/src/pages/Dashboard/AdminDashboard/AdminFinance/AdminBudget.jsx#L305) |
| Advanced filter (table-generated utility) | !isHrLoading AND NOT (!isReady); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminBudget.jsx:305](../../client/src/pages/Dashboard/AdminDashboard/AdminFinance/AdminBudget.jsx#L305) |
| Submit (button) | NOT (!isReady) | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AdminBudget.jsx:408](../../client/src/pages/Dashboard/AdminDashboard/AdminFinance/AdminBudget.jsx#L408) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isHrLoading**, line 49: `useQuery({ queryKey: ["adminBudget"], queryFn: async () => { try { const response = await axios.get( '/api/budget/company-budget?departmentId=6798bae6e469e809084e24a4' // IT Department ID ); const budgets = response.data.allBudgets; return Array.isArray(budgets) ? budgets : []; } catch (error) { console.error("Error fetching budget:", error); return []; } }, })`
- **isReady**, line 31: `useState(false)`

## pages/Dashboard/AdminDashboard/AdminHolidaysEvents.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/mix-bag/holidays-events — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Add Holiday - Event (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setModalOpen(true) — [AdminHolidaysEvents.jsx:97](../../client/src/pages/Dashboard/AdminDashboard/AdminHolidaysEvents.jsx#L97) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminHolidaysEvents.jsx:97](../../client/src/pages/Dashboard/AdminDashboard/AdminHolidaysEvents.jsx#L97) |
| Add Holiday - Event (button) | No local render guard detected; page/API access still applies | isCreatingHolidayEvent; loading: isCreatingHolidayEvent | No inline handler declared; may submit a form or delegate to a component — [AdminHolidaysEvents.jsx:168](../../client/src/pages/Dashboard/AdminDashboard/AdminHolidaysEvents.jsx#L168) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isCreatingHolidayEvent**, line 31: `useMutation({ mutationFn: async () => { const startDate = newEvent.startDate ? dayjs(newEvent.startDate) : null; return axios.post("/api/events/create-event", { title: newEvent.title.trim(), type: newEvent.type, description: newEvent.description.trim() \|\| newEvent.title.trim(), start: startDate ? startDate.startOf("day").toISOString() : null, end: startDate ? startDate.endOf("day").toISOString() : null, }); }, onSuccess: () => { toast.success("Holiday / event added successfully"); setNewEvent({ title: "", type: "Holiday", description: "", startDate: null, }); setModalOpen(false); queryClient.invalidateQueries({ queryKey: ["holidayEvents"] }); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| "Failed to add holiday / event", ); }, })`

## pages/Dashboard/AdminDashboard/AdminInventory.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleDetailsClick(params.data) — [AdminInventory.jsx:115](../../client/src/pages/Dashboard/AdminDashboard/AdminInventory.jsx#L115) |
| Add Inventory (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddAsset — [AdminInventory.jsx:214](../../client/src/pages/Dashboard/AdminDashboard/AdminInventory.jsx#L214) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminInventory.jsx:214](../../client/src/pages/Dashboard/AdminDashboard/AdminInventory.jsx#L214) |
| Submit (button) | modalMode === "add" | No local disabled condition detected | () => { toast.success("Added item successfully"); setIsModalOpen(false); } — [AdminInventory.jsx:396](../../client/src/pages/Dashboard/AdminDashboard/AdminInventory.jsx#L396) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 114: `params`

## pages/Dashboard/AdminDashboard/AdminOffices/AdminOffices.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { navigate( '/app/dashboard/admin-dashboard/admin-offices/${params.value}', { state: { unitId: params.data.unitId, unitName: params.value } } ); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { navigate( '/app/dashboard/admin-dashboard/admin-offices/${params.value}', { state: { unitId: params.data.unitId, unitName: params.value } } ); } — [AdminOffices.jsx:66](../../client/src/pages/Dashboard/AdminDashboard/AdminOffices/AdminOffices.jsx#L66) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminOffices.jsx:149](../../client/src/pages/Dashboard/AdminDashboard/AdminOffices/AdminOffices.jsx#L149) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 65: `params`

## pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesClear.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/admin-offices/:client/admin-offices-clear — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminOfficesClear.jsx:149](../../client/src/pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesClear.jsx#L149) |

## pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesLayout.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/admin-offices/:client — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AdminOfficesLayout.jsx:227](../../client/src/pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesLayout.jsx#L227) |

## pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesNew.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/admin-offices — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { navigate( '/app/dashboard/admin-dashboard/admin-offices/${params.value}', { state: { unitId: params.data._id, unitName: params.value } } ); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { navigate( '/app/dashboard/admin-dashboard/admin-offices/${params.value}', { state: { unitId: params.data._id, unitName: params.value } } ); } — [AdminOfficesNew.jsx:115](../../client/src/pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesNew.jsx#L115) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AdminOfficesNew.jsx:151](../../client/src/pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesNew.jsx#L151) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminOfficesNew.jsx:151](../../client/src/pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesNew.jsx#L151) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 114: `params`

## pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesOccupied.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/admin-offices/:client/admin-offices-occupied — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminOfficesOccupied.jsx:50](../../client/src/pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesOccupied.jsx#L50) |

## pages/Dashboard/AdminDashboard/AdminPerSqFtElectricityExpense.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/per-sq-ft-electricity-expense — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AdminPerSqFtElectricityExpense.jsx:135](../../client/src/pages/Dashboard/AdminDashboard/AdminPerSqFtElectricityExpense.jsx#L135) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminPerSqFtElectricityExpense.jsx:135](../../client/src/pages/Dashboard/AdminDashboard/AdminPerSqFtElectricityExpense.jsx#L135) |

## pages/Dashboard/AdminDashboard/AdminPerSqFtExpense.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/per-sq-ft-expense — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFY(shiftFinancialYear(selectedFY, -1)) — [AdminPerSqFtExpense.jsx:361](../../client/src/pages/Dashboard/AdminDashboard/AdminPerSqFtExpense.jsx#L361) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFY(shiftFinancialYear(selectedFY, 1)) — [AdminPerSqFtExpense.jsx:372](../../client/src/pages/Dashboard/AdminDashboard/AdminPerSqFtExpense.jsx#L372) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AdminPerSqFtExpense.jsx:382](../../client/src/pages/Dashboard/AdminDashboard/AdminPerSqFtExpense.jsx#L382) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminPerSqFtExpense.jsx:382](../../client/src/pages/Dashboard/AdminDashboard/AdminPerSqFtExpense.jsx#L382) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedFY**, line 204: `useState(getCurrentFinancialYearLabel())`

## pages/Dashboard/AdminDashboard/AdminSettings/AdminBulkUpload.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AdminBulkUpload.jsx:63](../../client/src/pages/Dashboard/AdminDashboard/AdminSettings/AdminBulkUpload.jsx#L63) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminBulkUpload.jsx:82](../../client/src/pages/Dashboard/AdminDashboard/AdminSettings/AdminBulkUpload.jsx#L82) |

## pages/Dashboard/AdminDashboard/AdminSettings/AdminPolicies.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AdminPolicies.jsx:65](../../client/src/pages/Dashboard/AdminDashboard/AdminSettings/AdminPolicies.jsx#L65) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminPolicies.jsx:83](../../client/src/pages/Dashboard/AdminDashboard/AdminSettings/AdminPolicies.jsx#L83) |

## pages/Dashboard/AdminDashboard/AdminSettings/AdminSops.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AdminSops.jsx:65](../../client/src/pages/Dashboard/AdminDashboard/AdminSettings/AdminSops.jsx#L65) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminSops.jsx:84](../../client/src/pages/Dashboard/AdminDashboard/AdminSettings/AdminSops.jsx#L84) |

## pages/Dashboard/AdminDashboard/AdminTeamMembersSchedule.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewUser(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewUser(params.data) — [AdminTeamMembersSchedule.jsx:135](../../client/src/pages/Dashboard/AdminDashboard/AdminTeamMembersSchedule.jsx#L135) |
| Action: () => handleEditUser(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleEditUser(params.data) — [AdminTeamMembersSchedule.jsx:141](../../client/src/pages/Dashboard/AdminDashboard/AdminTeamMembersSchedule.jsx#L141) |
| Assign Member (table-generated action) | !isUnitAssignees | No local disabled condition detected | handleAddUser — [AdminTeamMembersSchedule.jsx:184](../../client/src/pages/Dashboard/AdminDashboard/AdminTeamMembersSchedule.jsx#L184) |
| Advanced filter (table-generated utility) | !isUnitAssignees; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdminTeamMembersSchedule.jsx:184](../../client/src/pages/Dashboard/AdminDashboard/AdminTeamMembersSchedule.jsx#L184) |
| Submit (button) | modalMode === "add" | isAssignMemberPending; loading: isAssignMemberPending | No inline handler declared; may submit a form or delegate to a component — [AdminTeamMembersSchedule.jsx:291](../../client/src/pages/Dashboard/AdminDashboard/AdminTeamMembersSchedule.jsx#L291) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 133: `params`
- **isUnitAssignees**, line 89: `useQuery({ queryKey: ["unitAssignees"], queryFn: async () => { try { const response = await axios.get( '/api/administration/fetch-weekly-unit/${department._id}' ); return response.data; } catch (error) { throw new Error(error.response.data.message); } }, })`
- **isAssignMemberPending**, line 103: `useMutation({ mutationKey: ["assignMember"], mutationFn: async (data) => { const response = await axios.post( "/api/administration/assign-weekly-unit", { ...data, department: department?._id } ); return response.data; }, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["unitAssignees"] }); toast.success(data.message \|\| "Data submitted successfully!"); reset(); setIsModalOpen(false); }, onError: (error) => { toast.error(error.message \|\| "Error submitting data"); }, })`

## pages/Dashboard/AdminDashboard/BiometricAccess/BiometricAccessClients.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/mix-bag/biometric-access — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/mix-bag/biometric-access — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleClickRow(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleClickRow(params.data) — [BiometricAccessClients.jsx:48](../../client/src/pages/Dashboard/AdminDashboard/BiometricAccess/BiometricAccessClients.jsx#L48) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [BiometricAccessClients.jsx:108](../../client/src/pages/Dashboard/AdminDashboard/BiometricAccess/BiometricAccessClients.jsx#L108) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [BiometricAccessClients.jsx:108](../../client/src/pages/Dashboard/AdminDashboard/BiometricAccess/BiometricAccessClients.jsx#L108) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 47: `params`
- **data**, line 80: `clientsData.map((item, index) => ({ ...item, id: index + 1, _id: item._id, clientName: item.clientName, localPocEmail: item.localPoc?.email \|\| item.localPocEmail \|\| "-", members: item.members \|\| [], memberCount: Number(item.memberCount ?? item.members?.length ?? 0), status: item.isActive, isActive: item.isActive, }))`

## pages/Dashboard/AdminDashboard/BiometricAccess/BiometricAccessMembers.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/mix-bag/biometric-access/:clientName — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/mix-bag/biometric-access/:clientName — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Edit (configured menu/action) | No local render guard detected; page/API access still applies | params.data?.isDeleted | () => handleEditMember(params.data) — [BiometricAccessMembers.jsx:418](../../client/src/pages/Dashboard/AdminDashboard/BiometricAccess/BiometricAccessMembers.jsx#L418) |
| params.data.status ? "Mark As Inactive" : "Mark As Active" (configured menu/action) | canEditAllFields | params.data?.isDeleted | () => handleToggleMemberStatus(params.data) — [BiometricAccessMembers.jsx:425](../../client/src/pages/Dashboard/AdminDashboard/BiometricAccess/BiometricAccessMembers.jsx#L425) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [BiometricAccessMembers.jsx:442](../../client/src/pages/Dashboard/AdminDashboard/BiometricAccess/BiometricAccessMembers.jsx#L442) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [BiometricAccessMembers.jsx:442](../../client/src/pages/Dashboard/AdminDashboard/BiometricAccess/BiometricAccessMembers.jsx#L442) |
| Submit (button) | No local render guard detected; page/API access still applies | loading: isSubmitting | No inline handler declared; may submit a form or delegate to a component — [BiometricAccessMembers.jsx:563](../../client/src/pages/Dashboard/AdminDashboard/BiometricAccess/BiometricAccessMembers.jsx#L563) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 417: `params`
- **canEditAllFields**, line 80: `!isItDashboard`
- **isItDashboard**, line 79: `location.pathname.includes("/IT-dashboard/")`

## pages/Dashboard/AdminDashboard/HouseKeepingMembersList.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/mix-bag/housekeeping-members/members-list — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Restore housekeeping member (button) | params.data.isDeleted | isRestorePending \|\| isDeletePending | () => restoreHousekeepingMember(params.data._id) — [HouseKeepingMembersList.jsx:233](../../client/src/pages/Dashboard/AdminDashboard/HouseKeepingMembersList.jsx#L233) |
| Edit housekeeping member (button) | NOT (params.data.isDeleted) | No local disabled condition detected | () => handleEditUser(params.data) — [HouseKeepingMembersList.jsx:244](../../client/src/pages/Dashboard/AdminDashboard/HouseKeepingMembersList.jsx#L244) |
| params.data.isDeleted ? "Permanently delete housekeeping member" : "Delete housekeeping member" (button) | No local render guard detected; page/API access still applies | isDeletePending \|\| isRestorePending | () => handleDeleteUser(params.data) — [HouseKeepingMembersList.jsx:254](../../client/src/pages/Dashboard/AdminDashboard/HouseKeepingMembersList.jsx#L254) |
| Export (table-generated utility) | houseKeepingData?.length > 0; exportData: true | No local disabled condition detected | Shared table export — [HouseKeepingMembersList.jsx:297](../../client/src/pages/Dashboard/AdminDashboard/HouseKeepingMembersList.jsx#L297) |
| Advanced filter (table-generated utility) | houseKeepingData?.length > 0; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HouseKeepingMembersList.jsx:297](../../client/src/pages/Dashboard/AdminDashboard/HouseKeepingMembersList.jsx#L297) |
| Submit (button) | modalMode === "edit" && selectedUser | isPending | No inline handler declared; may submit a form or delegate to a component — [HouseKeepingMembersList.jsx:579](../../client/src/pages/Dashboard/AdminDashboard/HouseKeepingMembersList.jsx#L579) |
| Reset (button) | modalMode === "edit" && selectedUser | No local disabled condition detected | () => editReset() — [HouseKeepingMembersList.jsx:585](../../client/src/pages/Dashboard/AdminDashboard/HouseKeepingMembersList.jsx#L585) |
| Cancel (button) | modalMode === "delete" && selectedUser | No local disabled condition detected | () => setIsModalOpen(false) — [HouseKeepingMembersList.jsx:605](../../client/src/pages/Dashboard/AdminDashboard/HouseKeepingMembersList.jsx#L605) |
| Yes, Delete (button) | modalMode === "delete" && selectedUser | isDeletePending | () => deleteHousekeepingMember() — [HouseKeepingMembersList.jsx:609](../../client/src/pages/Dashboard/AdminDashboard/HouseKeepingMembersList.jsx#L609) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 230: `params`
- **isRestorePending**, line 201: `useMutation({ mutationFn: async (memberId) => { const response = await axios.patch( '/api/company/restore-housekeeping-member/${memberId}', ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Member restored successfully!"); queryClient.invalidateQueries({ queryKey: ["housekeeping-staff"] }); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| "Failed to restore member.", ); }, })`
- **isDeletePending**, line 179: `useMutation({ mutationFn: async () => { const response = await axios.delete( '/api/company/soft-delete-housekeeping-member/${selectedUser?._id}' ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Member deleted successfully!"); setIsModalOpen(false); setSelectedUser(null); queryClient.invalidateQueries({ queryKey: ["housekeeping-staff"] }); }, onError: (error) => { console.error("Delete failed:", error); toast.error( error?.response?.data?.message \|\| "Failed to delete member." ); }, })`
- **selectedUser**, line 80: `useState([])`
- **isPending**, line 159: `useMutation({ mutationFn: async (formData) => { const response = await axios.patch( '/api/company/update-housekeeping-member/${selectedUser?._id}', formData ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Employee onboarded successfully!"); setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ["housekeeping-staff"] }); editReset(); }, onError: (error) => { console.error("Submission failed:", error); toast.error("Something went wrong."); }, })`

## pages/Dashboard/AdminDashboard/HouseKeepingOnboard.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/mix-bag/housekeeping-members/member-onboard — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Submit (button) | No local render guard detected; page/API access still applies | isPending | No inline handler declared; may submit a form or delegate to a component — [HouseKeepingOnboard.jsx:325](../../client/src/pages/Dashboard/AdminDashboard/HouseKeepingOnboard.jsx#L325) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [HouseKeepingOnboard.jsx:331](../../client/src/pages/Dashboard/AdminDashboard/HouseKeepingOnboard.jsx#L331) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isPending**, line 49: `useMutation({ mutationFn: async (formData) => { const response = await axios.post( "/api/company/add-housekeeping-member", formData ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Employee onboarded successfully!"); reset(), queryClient.invalidateQueries({ queryKey: ["housekeeping-staff"] }); }, onError: (error) => { console.error("Submission failed:", error); toast.error("Something went wrong."); }, })`

## pages/Dashboard/AdminDashboard/HousekeepingTeamMembersCalendar.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/mix-bag/housekeeping-members/member-schedule/:id — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Assign Substitute (button) | modalType === "view" && selectedEvent | No local disabled condition detected | () => { setModalType("edit"); } — [HousekeepingTeamMembersCalendar.jsx:289](../../client/src/pages/Dashboard/AdminDashboard/HousekeepingTeamMembersCalendar.jsx#L289) |
| Assign (button) | modalType === "edit" | isPending; loading: isPending | No inline handler declared; may submit a form or delegate to a component — [HousekeepingTeamMembersCalendar.jsx:374](../../client/src/pages/Dashboard/AdminDashboard/HousekeepingTeamMembersCalendar.jsx#L374) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedEvent**, line 24: `useState(null)`
- **isPending**, line 196: `useMutation({ mutationFn: async (data) => { const res = await axios.patch("/api/weekly-unit/add-substitute", { ...data, flag: "HK", }); return res.data; }, onSuccess: (res) => { toast.success(res.message \|\| "Substitute assigned successfully!"); queryClient.invalidateQueries({ queryKey: ["schedule"] }); closeDrawer(); }, onError: (err) => { toast.error(err.message \|\| "Something went wrong"); }, })`

## pages/Dashboard/AdminDashboard/HousekeepingTeamMembersSchedule.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/mix-bag/housekeeping-members/member-schedule — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { navigate( '/app/dashboard/admin-dashboard/mix-bag/housekeeping-members/member-schedule/${params.value}', { state: { id: params.data.mongoId, name: params.value, }, … (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { navigate( '/app/dashboard/admin-dashboard/mix-bag/housekeeping-members/member-schedule/${params.value}', { state: { id: params.data.mongoId, name: params.value, }, } ); } — [HousekeepingTeamMembersSchedule.jsx:314](../../client/src/pages/Dashboard/AdminDashboard/HousekeepingTeamMembersSchedule.jsx#L314) |
| Action: () => handleViewUser(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewUser(params.data) — [HousekeepingTeamMembersSchedule.jsx:348](../../client/src/pages/Dashboard/AdminDashboard/HousekeepingTeamMembersSchedule.jsx#L348) |
| Assign Housekeeping Member (table-generated action) | isSuccess && unitsData.length > 0 AND NOT (isUnitsPending) | No local disabled condition detected | handleAddUser — [HousekeepingTeamMembersSchedule.jsx:443](../../client/src/pages/Dashboard/AdminDashboard/HousekeepingTeamMembersSchedule.jsx#L443) |
| Advanced filter (table-generated utility) | isSuccess && unitsData.length > 0 AND NOT (isUnitsPending); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HousekeepingTeamMembersSchedule.jsx:443](../../client/src/pages/Dashboard/AdminDashboard/HousekeepingTeamMembersSchedule.jsx#L443) |
| Submit (button) | modalMode === "add" | isAssignMemberPending; loading: isAssignMemberPending | No inline handler declared; may submit a form or delegate to a component — [HousekeepingTeamMembersSchedule.jsx:622](../../client/src/pages/Dashboard/AdminDashboard/HousekeepingTeamMembersSchedule.jsx#L622) |
| Submit (button) | modalMode === "edit" && selectedUser | isAssignPrimary; loading: isAssignPrimary | No inline handler declared; may submit a form or delegate to a component — [HousekeepingTeamMembersSchedule.jsx:799](../../client/src/pages/Dashboard/AdminDashboard/HousekeepingTeamMembersSchedule.jsx#L799) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 313: `params`
- **params**, line 346: `params`
- **isSuccess**, line 89: `useQuery({ queryKey: ["houseKeepingUnitsData"], queryFn: async () => { try { const response = await axios.get("/api/company/fetch-units"); const formattedUnits = response.data.map((unit, index) => ({ ...unit, mongoId: unit._id, unitNo: unit.unitNo, unitName: unit.unitName, buildingName: unit.building?.buildingName ?? "N/A", sqft: unit.sqft, openDesks: unit.openDesks, cabinDesks: unit.cabinDesks, lead: department?.name === "Administration" ? '${unit?.adminLead?.firstName} ${unit?.adminLead?.lastName}' : department?.name === "Maintenance" ? '${unit?.maintenanceLead?.firstName} ${unit?.maintenanceLead?.lastName}' : '${unit?.itLead?.firstName} ${unit?.itLead?.lastName}', })); const sortedUnits = formattedUnits.sort((a, b) => a.unitNo.localeCompare(b.unitNo, undefined, { numeric: true, sensitiv…`
- **isAssignMemberPending**, line 252: `useMutation({ mutationKey: ["assign-houskeeping"], mutationFn: async (data) => { const response = await axios.post( "/api/company/assign-new-housekeeping-schedule", { unitId: data.location, memberId: data.employee, startDate: data.startDate, endDate: data.endDate, } ); return response.data; }, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["unitAssignees"] }); toast.success(data.message \|\| "Data submitted successfully!"); reset(); setIsModalOpen(false); }, onError: (error) => { toast.error(error.message \|\| "Error submitting data"); }, })`
- **selectedUser**, line 27: `useState(null)`
- **isAssignPrimary**, line 278: `useMutation({ mutationKey: ["assignPrimary"], mutationFn: async (data) => { const response = await axios.patch( "/api/company/assign-primary-unit", data ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "PRIMARY ASSIGNED"); queryClient.invalidateQueries({ queryKey: ["unitsData"] }); setIsModalOpen(false); primaryReset(); }, onError: (error) => { toast.error(error.message \|\| "CHECK LOG"); }, })`
