# IT Dashboard: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Dashboard/ItDashboard/ItAnnualExpenses.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [ItAnnualExpenses.jsx:117](../../client/src/pages/Dashboard/ItDashboard/ItAnnualExpenses.jsx#L117) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItAnnualExpenses.jsx:117](../../client/src/pages/Dashboard/ItDashboard/ItAnnualExpenses.jsx#L117) |

## pages/Dashboard/ItDashboard/ItData/ItAmcRecords.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/IT-dashboard/data/amc-records — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { const original = assetsList.find( (a) => a.name === params.data.assetName, ); handleDetailsClick(original); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { const original = assetsList.find( (a) => a.name === params.data.assetName, ); handleDetailsClick(original); } — [ItAmcRecords.jsx:120](../../client/src/pages/Dashboard/ItDashboard/ItData/ItAmcRecords.jsx#L120) |
| Add Record (table-generated action) | No local render guard detected; page/API access still applies | true | handleAddAsset — [ItAmcRecords.jsx:280](../../client/src/pages/Dashboard/ItDashboard/ItData/ItAmcRecords.jsx#L280) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [ItAmcRecords.jsx:280](../../client/src/pages/Dashboard/ItDashboard/ItData/ItAmcRecords.jsx#L280) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItAmcRecords.jsx:280](../../client/src/pages/Dashboard/ItDashboard/ItData/ItAmcRecords.jsx#L280) |
| Submit (button) | modalMode === "add" | loading: isAddingAsset | No inline handler declared; may submit a form or delegate to a component — [ItAmcRecords.jsx:517](../../client/src/pages/Dashboard/ItDashboard/ItData/ItAmcRecords.jsx#L517) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 118: `params`

## pages/Dashboard/ItDashboard/ItData/ItAssetList.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { // Find the full asset object from dummyAssets + assetsList const fullAsset = [...(assetsList \|\| []), ...dummyAssets].find( (item) => item.name === params.data.cate… (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { // Find the full asset object from dummyAssets + assetsList const fullAsset = [...(assetsList \|\| []), ...dummyAssets].find( (item) => item.name === params.data.category && item.brand === params.data.brand && item.price .toString() .includes(params.data.price.replace(/,/g, "")), // fuzzy match in case formatting differs ); if (full… — [ItAssetList.jsx:221](../../client/src/pages/Dashboard/ItDashboard/ItData/ItAssetList.jsx#L221) |
| Add Asset (table-generated action) | No local render guard detected; page/API access still applies | true | No inline handler declared; may submit a form or delegate to a component — [ItAssetList.jsx:279](../../client/src/pages/Dashboard/ItDashboard/ItData/ItAssetList.jsx#L279) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItAssetList.jsx:279](../../client/src/pages/Dashboard/ItDashboard/ItData/ItAssetList.jsx#L279) |
| Select Image (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ItAssetList.jsx:326](../../client/src/pages/Dashboard/ItDashboard/ItData/ItAssetList.jsx#L326) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ItAssetList.jsx:579](../../client/src/pages/Dashboard/ItDashboard/ItData/ItAssetList.jsx#L579) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 218: `params`

## pages/Dashboard/ItDashboard/ItData/ItMonthlyInvoice.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/IT-dashboard/data/monthly-invoice-reports — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleDetailsClick(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleDetailsClick(params.data) — [ItMonthlyInvoice.jsx:117](../../client/src/pages/Dashboard/ItDashboard/ItData/ItMonthlyInvoice.jsx#L117) |
| Add Invoice (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddAsset — [ItMonthlyInvoice.jsx:255](../../client/src/pages/Dashboard/ItDashboard/ItData/ItMonthlyInvoice.jsx#L255) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItMonthlyInvoice.jsx:255](../../client/src/pages/Dashboard/ItDashboard/ItData/ItMonthlyInvoice.jsx#L255) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ItMonthlyInvoice.jsx:446](../../client/src/pages/Dashboard/ItDashboard/ItData/ItMonthlyInvoice.jsx#L446) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 115: `params`

## pages/Dashboard/ItDashboard/ItData/ItVendorReports.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { const fullVendor = vendorsList.find( (v) => v.name === params.data.name && v.email === params.data.email, ); handleDetailsClick(fullVendor); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { const fullVendor = vendorsList.find( (v) => v.name === params.data.name && v.email === params.data.email, ); handleDetailsClick(fullVendor); } — [ItVendorReports.jsx:218](../../client/src/pages/Dashboard/ItDashboard/ItData/ItVendorReports.jsx#L218) |
| Add Vendor (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddAsset — [ItVendorReports.jsx:268](../../client/src/pages/Dashboard/ItDashboard/ItData/ItVendorReports.jsx#L268) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItVendorReports.jsx:268](../../client/src/pages/Dashboard/ItDashboard/ItData/ItVendorReports.jsx#L268) |
| Submit (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ItVendorReports.jsx:423](../../client/src/pages/Dashboard/ItDashboard/ItData/ItVendorReports.jsx#L423) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 216: `params`

## pages/Dashboard/ItDashboard/ItExpenses/ItExpenses.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/IT-dashboard/IT-expenses — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [ItExpenses.jsx:972](../../client/src/pages/Dashboard/ItDashboard/ItExpenses/ItExpenses.jsx#L972) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItExpenses.jsx:972](../../client/src/pages/Dashboard/ItDashboard/ItExpenses/ItExpenses.jsx#L972) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ItExpenses.jsx:1134](../../client/src/pages/Dashboard/ItDashboard/ItExpenses/ItExpenses.jsx#L1134) |

## pages/Dashboard/ItDashboard/ItExpenses/ItExpensesClear.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/IT-dashboard/IT-expenses/IT-expenses-layout/:client/IT-expenses-clear — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItExpensesClear.jsx:151](../../client/src/pages/Dashboard/ItDashboard/ItExpenses/ItExpensesClear.jsx#L151) |

## pages/Dashboard/ItDashboard/ItExpenses/ItExpensesOccupied.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/IT-dashboard/IT-expenses/IT-expenses-layout/:client/IT-expenses-occupied — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItExpensesOccupied.jsx:150](../../client/src/pages/Dashboard/ItDashboard/ItExpenses/ItExpensesOccupied.jsx#L150) |

## pages/Dashboard/ItDashboard/ItFinance/ItBudget.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Request Budget (table-generated action) | !isHrLoading AND NOT (!isReady) | No local disabled condition detected | () => setOpenModal(true) — [ItBudget.jsx:289](../../client/src/pages/Dashboard/ItDashboard/ItFinance/ItBudget.jsx#L289) |
| Advanced filter (table-generated utility) | !isHrLoading AND NOT (!isReady); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItBudget.jsx:289](../../client/src/pages/Dashboard/ItDashboard/ItFinance/ItBudget.jsx#L289) |
| Submit (button) | NOT (!isReady) | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ItBudget.jsx:392](../../client/src/pages/Dashboard/ItDashboard/ItFinance/ItBudget.jsx#L392) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isHrLoading**, line 33: `useQuery({ queryKey: ["hrFinance"], queryFn: async () => { try { const response = await axios.get( '/api/budget/company-budget?departmentId=6798baa8e469e809084e2497' // IT Department ID ); const budgets = response.data.allBudgets; return Array.isArray(budgets) ? budgets : []; } catch (error) { console.error("Error fetching budget:", error); return []; } }, })`
- **isReady**, line 30: `useState(false)`

## pages/Dashboard/ItDashboard/ItInventory.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleDetailsClick(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleDetailsClick(params.data) — [ItInventory.jsx:247](../../client/src/pages/Dashboard/ItDashboard/ItInventory.jsx#L247) |
| Add Inventory (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddAsset — [ItInventory.jsx:279](../../client/src/pages/Dashboard/ItDashboard/ItInventory.jsx#L279) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItInventory.jsx:279](../../client/src/pages/Dashboard/ItDashboard/ItInventory.jsx#L279) |
| Select Image (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ItInventory.jsx:325](../../client/src/pages/Dashboard/ItDashboard/ItInventory.jsx#L325) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ItInventory.jsx:578](../../client/src/pages/Dashboard/ItDashboard/ItInventory.jsx#L578) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 245: `params`

## pages/Dashboard/ItDashboard/ItOffices/ItOffices.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Layout (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { localStorage.setItem("client", domain.name); navigate( '/app/dashboard/It-dashboard/it-offices/it-offices-layout/${domain.name}' ); } — [ItOffices.jsx:483](../../client/src/pages/Dashboard/ItDashboard/ItOffices/ItOffices.jsx#L483) |

## pages/Dashboard/ItDashboard/ItOffices/ItOfficesClear.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/IT-dashboard/IT-offices/:client/IT-offices-clear — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItOfficesClear.jsx:150](../../client/src/pages/Dashboard/ItDashboard/ItOffices/ItOfficesClear.jsx#L150) |

## pages/Dashboard/ItDashboard/ItOffices/ItOfficesLayout.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/IT-dashboard/IT-offices/:client — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [ItOfficesLayout.jsx:231](../../client/src/pages/Dashboard/ItDashboard/ItOffices/ItOfficesLayout.jsx#L231) |

## pages/Dashboard/ItDashboard/ItOffices/ItOfficesOccupied.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/IT-dashboard/IT-offices/:client/IT-offices-occupied — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItOfficesOccupied.jsx:36](../../client/src/pages/Dashboard/ItDashboard/ItOffices/ItOfficesOccupied.jsx#L36) |

## pages/Dashboard/ItDashboard/ItOffices/ItOfficessNew.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/IT-dashboard/IT-offices — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { navigate('/app/dashboard/IT-dashboard/IT-offices/${params.value}', { state: { unitId: params.data._id, unitName: params.value }, }); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { navigate('/app/dashboard/IT-dashboard/IT-offices/${params.value}', { state: { unitId: params.data._id, unitName: params.value }, }); } — [ItOfficessNew.jsx:118](../../client/src/pages/Dashboard/ItDashboard/ItOffices/ItOfficessNew.jsx#L118) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [ItOfficessNew.jsx:154](../../client/src/pages/Dashboard/ItDashboard/ItOffices/ItOfficessNew.jsx#L154) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItOfficessNew.jsx:154](../../client/src/pages/Dashboard/ItDashboard/ItOffices/ItOfficessNew.jsx#L154) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 117: `params`

## pages/Dashboard/ItDashboard/ItPerSqExpense.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/IT-dashboard/per-sq-ft-expense — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFY(shiftFinancialYear(selectedFY, -1)) — [ItPerSqExpense.jsx:207](../../client/src/pages/Dashboard/ItDashboard/ItPerSqExpense.jsx#L207) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFY(shiftFinancialYear(selectedFY, 1)) — [ItPerSqExpense.jsx:218](../../client/src/pages/Dashboard/ItDashboard/ItPerSqExpense.jsx#L218) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [ItPerSqExpense.jsx:228](../../client/src/pages/Dashboard/ItDashboard/ItPerSqExpense.jsx#L228) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItPerSqExpense.jsx:228](../../client/src/pages/Dashboard/ItDashboard/ItPerSqExpense.jsx#L228) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedFY**, line 52: `useState(getCurrentFinancialYearLabel())`

## pages/Dashboard/ItDashboard/ItPerSqInternetExpense.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/IT-dashboard/per-sq-ft-internet-expense — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [ItPerSqInternetExpense.jsx:372](../../client/src/pages/Dashboard/ItDashboard/ItPerSqInternetExpense.jsx#L372) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItPerSqInternetExpense.jsx:372](../../client/src/pages/Dashboard/ItDashboard/ItPerSqInternetExpense.jsx#L372) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ItPerSqInternetExpense.jsx:534](../../client/src/pages/Dashboard/ItDashboard/ItPerSqInternetExpense.jsx#L534) |

## pages/Dashboard/ItDashboard/ItSettings/ItBulkUpload.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ItBulkUpload.jsx:64](../../client/src/pages/Dashboard/ItDashboard/ItSettings/ItBulkUpload.jsx#L64) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItBulkUpload.jsx:83](../../client/src/pages/Dashboard/ItDashboard/ItSettings/ItBulkUpload.jsx#L83) |

## pages/Dashboard/ItDashboard/ItSettings/ItPolicies.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ItPolicies.jsx:66](../../client/src/pages/Dashboard/ItDashboard/ItSettings/ItPolicies.jsx#L66) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItPolicies.jsx:85](../../client/src/pages/Dashboard/ItDashboard/ItSettings/ItPolicies.jsx#L85) |

## pages/Dashboard/ItDashboard/ItSettings/ItSops.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ItSops.jsx:66](../../client/src/pages/Dashboard/ItDashboard/ItSettings/ItSops.jsx#L66) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ItSops.jsx:85](../../client/src/pages/Dashboard/ItDashboard/ItSettings/ItSops.jsx#L85) |
