# Assets: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Assets/AssetsCategory/AssetModal.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Edit (button) | NOT (mode !== "view") | No local disabled condition detected | () => { onModeChange("edit"); } — [AssetModal.jsx:201](../../client/src/pages/Assets/AssetsCategory/AssetModal.jsx#L201) |

## pages/Assets/AssetsCategory/AssetsCategories.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/assets/view-assets/:department/assets-categories — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setModalMode("view"); setSelectedAsset(params.data); setModalOpen(true); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setModalMode("view"); setSelectedAsset(params.data); setModalOpen(true); } — [AssetsCategories.jsx:172](../../client/src/pages/Assets/AssetsCategory/AssetsCategories.jsx#L172) |
| Restore (button) | params.data.isDeleted | No local disabled condition detected | () => setConfirmationAction({ type: "restore", row: params.data }) — [AssetsCategories.jsx:210](../../client/src/pages/Assets/AssetsCategory/AssetsCategories.jsx#L210) |
| Edit (button) | NOT (params.data.isDeleted) | No local disabled condition detected | () => handleEdit(params.data) — [AssetsCategories.jsx:221](../../client/src/pages/Assets/AssetsCategory/AssetsCategories.jsx#L221) |
| params.data.isDeleted ? "Delete permanently" : "Delete" (button) | params.data.isActive | No local disabled condition detected | () => setConfirmationAction({ type: "delete", row: params.data }) — [AssetsCategories.jsx:231](../../client/src/pages/Assets/AssetsCategory/AssetsCategories.jsx#L231) |
| Add Category (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setModalMode("add"); setModalOpen(true); } — [AssetsCategories.jsx:273](../../client/src/pages/Assets/AssetsCategory/AssetsCategories.jsx#L273) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AssetsCategories.jsx:273](../../client/src/pages/Assets/AssetsCategory/AssetsCategories.jsx#L273) |
| Submit (button) | modalMode === "add" | pendingCreate; loading: pendingCreate | No inline handler declared; may submit a form or delegate to a component — [AssetsCategories.jsx:324](../../client/src/pages/Assets/AssetsCategory/AssetsCategories.jsx#L324) |
| Submit (button) | modalMode === "edit" | pendingCreate; loading: pendingCreate | No inline handler declared; may submit a form or delegate to a component — [AssetsCategories.jsx:384](../../client/src/pages/Assets/AssetsCategory/AssetsCategories.jsx#L384) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 171: `params`
- **params**, line 206: `params`

## pages/Assets/AssetsCategory/AssetsSubCategories.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/assets/view-assets/:department/assets-sub-categories — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setModalMode("view"); setSelectedAsset(params.data); setModalOpen(true); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setModalMode("view"); setSelectedAsset(params.data); setModalOpen(true); } — [AssetsSubCategories.jsx:213](../../client/src/pages/Assets/AssetsCategory/AssetsSubCategories.jsx#L213) |
| Restore (button) | params.data.isDeleted | No local disabled condition detected | () => setConfirmationAction({ type: "restore", row: params.data }) — [AssetsSubCategories.jsx:246](../../client/src/pages/Assets/AssetsCategory/AssetsSubCategories.jsx#L246) |
| Edit (button) | NOT (params.data.isDeleted) | No local disabled condition detected | () => handleEdit(params.data) — [AssetsSubCategories.jsx:257](../../client/src/pages/Assets/AssetsCategory/AssetsSubCategories.jsx#L257) |
| params.data.isDeleted ? "Delete permanently" : "Delete" (button) | params.data.isActive | No local disabled condition detected | () => { const category = assetCategories.find( (item) => String(item?._id) === String(params.data.category?._id), ); const isCategoryActive = category?.isActive ?? params.data.category?.isActive; const isCategoryDeleted = category?.isDeleted ?? params.data.category?.isDeleted; if ( !params.data.isDeleted && (!isCategoryActive \|\| isCategor… — [AssetsSubCategories.jsx:267](../../client/src/pages/Assets/AssetsCategory/AssetsSubCategories.jsx#L267) |
| Add Sub-Category (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setModalMode("add"); setModalOpen(true); } — [AssetsSubCategories.jsx:322](../../client/src/pages/Assets/AssetsCategory/AssetsSubCategories.jsx#L322) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AssetsSubCategories.jsx:322](../../client/src/pages/Assets/AssetsCategory/AssetsSubCategories.jsx#L322) |
| Submit (button) | modalMode === "add" | pendingCreate; loading: pendingCreate | No inline handler declared; may submit a form or delegate to a component — [AssetsSubCategories.jsx:400](../../client/src/pages/Assets/AssetsCategory/AssetsSubCategories.jsx#L400) |
| Submit (button) | modalMode === "edit" | pendingCreate; loading: pendingCreate | No inline handler declared; may submit a form or delegate to a component — [AssetsSubCategories.jsx:458](../../client/src/pages/Assets/AssetsCategory/AssetsSubCategories.jsx#L458) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 212: `params`
- **params**, line 242: `params`

## pages/Assets/AssetsCategory/ListOfAssets.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/assets/view-assets/:department/list-of-assets — no permission wrapper detected on this route-object chain
- /app/assets/view-assets/:department/list-of-assets/:assetCard — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleView(params.data) — [ListOfAssets.jsx:751](../../client/src/pages/Assets/AssetsCategory/ListOfAssets.jsx#L751) |
| Restore (button) | params.data.isDeleted | No local disabled condition detected | () => setConfirmationAction({ type: "restore", row: params.data }) — [ListOfAssets.jsx:760](../../client/src/pages/Assets/AssetsCategory/ListOfAssets.jsx#L760) |
| params.data.isDeleted ? "Delete permanently" : "Delete" (button) | params.data.canDelete | No local disabled condition detected | () => setConfirmationAction({ type: "delete", row: params.data }) — [ListOfAssets.jsx:772](../../client/src/pages/Assets/AssetsCategory/ListOfAssets.jsx#L772) |
| Edit (configured menu/action) | !params.data.isDeleted | No local disabled condition detected | () => handleEdit(params.data) — [ListOfAssets.jsx:787](../../client/src/pages/Assets/AssetsCategory/ListOfAssets.jsx#L787) |
| isAssetCardView ? undefined : "Add Asset" (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | isAssetCardView ? undefined : handleAddAsset — [ListOfAssets.jsx:873](../../client/src/pages/Assets/AssetsCategory/ListOfAssets.jsx#L873) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: !isAssetCardView | No local disabled condition detected | Shared table export — [ListOfAssets.jsx:873](../../client/src/pages/Assets/AssetsCategory/ListOfAssets.jsx#L873) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ListOfAssets.jsx:873](../../client/src/pages/Assets/AssetsCategory/ListOfAssets.jsx#L873) |
| Add Asset (button) | modalMode === "add" | isAddingAsset; loading: isAddingAsset | No inline handler declared; may submit a form or delegate to a component — [ListOfAssets.jsx:1379](../../client/src/pages/Assets/AssetsCategory/ListOfAssets.jsx#L1379) |
| Update Asset (button) | modalMode === "edit" | isUpdateAsset; loading: isUpdateAsset | No inline handler declared; may submit a form or delegate to a component — [ListOfAssets.jsx:1766](../../client/src/pages/Assets/AssetsCategory/ListOfAssets.jsx#L1766) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 749: `params`
- **isAssetCardView**, line 134: `isAssetCardRoute \|\| Boolean(location.state?.assetListTitle)`
- **isAssetCardRoute**, line 133: `Boolean(selectedAssetCardConfig)`
- **selectedAssetCardConfig**, line 126: `assetCardRouteConfig[normalizedAssetCard] \|\| null`
- **isAddingAsset**, line 347: `useMutation({ mutationKey: ["addAsset"], mutationFn: async (data) => { const formData = new FormData(); formData.append("departmentId", data.departmentId \|\| departmentId); formData.append("categoryId", data.categoryId); formData.append("subCategoryId", data.subCategoryId); formData.append("vendorId", data.vendorId); formData.append("name", data.name); formData.append("serialNumber", data.serialNumber \|\| ""); formData.append("description", data.description \|\| ""); formData.append("assetId", data.assetId); formData.append("secondaryId", data.secondaryId \|\| ""); formData.append("isDamaged", data.isDamaged); formData.append("isUnderMaintenance", data.isUnderMaintenance); formData.append("isExtra", data.isExtra); formData.append("status", data.status); formData.append("purchaseDate", data.purch…`
- **isUpdateAsset**, line 497: `useMutation({ mutationKey: ["editAsset"], mutationFn: async (data) => { console.log("data for edit", data); const formData = new FormData(); formData.append("departmentId", data.departmentId \|\| departmentId); formData.append("categoryId", data.categoryId); formData.append("subCategoryId", data.subCatId); formData.append("vendorId", data.vendorId); formData.append("name", data.name); formData.append("serialNumber", data.serialNumber \|\| ""); formData.append("description", data.description \|\| ""); formData.append("assetId", data.assetId); formData.append("secondaryId", data.secondaryId \|\| ""); formData.append("purchaseDate", data.purchaseDate); formData.append("quantity", Number(data.quantity)); formData.append("price", Number(data.price)); formData.append("brand", data.brand); formData.appen…`

## pages/Assets/AssetsDashboard.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/assets — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => setVisibleAssetTooltipMetrics((prev) => ({ ...prev, [item.key]: !prev[item.key], })) (button) | userPermissions.includes(assetsValueGraph.permission) | No local disabled condition detected | () => setVisibleAssetTooltipMetrics((prev) => ({ ...prev, [item.key]: !prev[item.key], })) — [AssetsDashboard.jsx:945](../../client/src/pages/Assets/AssetsDashboard.jsx#L945) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **userPermissions**, line 131: `auth?.user?.permissions?.permissions \|\| []`
- **auth**, line 42: `useAuth()`

## pages/Assets/AssetsData/Data.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [Data.jsx:308](../../client/src/pages/Assets/AssetsData/Data.jsx#L308) |

## pages/Assets/AssetsHome.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/assets/view-assets — no permission wrapper detected on this route-object chain
- /app/assets/view-assets/list-of-assets/:assetCard — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { dispatch(setSelectedDepartment(params.data?.departmentId)); dispatch(setSelectedDepartmentName(params.value)); navigate( shouldOpenDepartmentListOfAssets ? buildDep… (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { dispatch(setSelectedDepartment(params.data?.departmentId)); dispatch(setSelectedDepartmentName(params.value)); navigate( shouldOpenDepartmentListOfAssets ? buildDepartmentAssetsPath(params.value) : assetOwnershipType ? buildDepartmentAssetsPath(params.value) : assetStatusFilter ? buildDepartmentAssetsPath(params.value) // ? '/app/… — [AssetsHome.jsx:159](../../client/src/pages/Assets/AssetsHome.jsx#L159) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 157: `params`

## pages/Assets/AssetsSettings/BulkUpload.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/assets/settings/bulk-upload — no permission wrapper detected on this route-object chain
- /app/tasks/settings/bulk-upload — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: button (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [BulkUpload.jsx:36](../../client/src/pages/Assets/AssetsSettings/BulkUpload.jsx#L36) |
| Icon/action: button (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [BulkUpload.jsx:39](../../client/src/pages/Assets/AssetsSettings/BulkUpload.jsx#L39) |

## pages/Assets/ManageAssets/Approvals.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/assets/manage-assets/:department/approvals — no permission wrapper detected on this route-object chain
- /app/tasks/manage-assets/approvals — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Approve (configured menu/action) | !viewOnlyStatuses.includes(status) && !isEmployeeRole && status === "Pending" | No local disabled condition detected | () => approveAsset(params.data) — [Approvals.jsx:187](../../client/src/pages/Assets/ManageAssets/Approvals.jsx#L187) |
| Reject (configured menu/action) | !viewOnlyStatuses.includes(status) && !isEmployeeRole && status === "Pending" | No local disabled condition detected | () => rejectAsset(params.data) — [Approvals.jsx:191](../../client/src/pages/Assets/ManageAssets/Approvals.jsx#L191) |
| View (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleView(params.data) — [Approvals.jsx:211](../../client/src/pages/Assets/ManageAssets/Approvals.jsx#L211) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [Approvals.jsx:366](../../client/src/pages/Assets/ManageAssets/Approvals.jsx#L366) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Approvals.jsx:366](../../client/src/pages/Assets/ManageAssets/Approvals.jsx#L366) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isEmployeeRole**, line 39: `userRoles.some((role) => role?.includes("Employee"))`
- **userRoles**, line 38: `auth?.user?.role?.map((item) => item?.roleTitle) \|\| []`
- **auth**, line 37: `useAuth()`
- **params**, line 180: `params`

## pages/Assets/ManageAssets/AssignAssets.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/assets/manage-assets/:department/overall-asset — no permission wrapper detected on this route-object chain
- /app/tasks/manage-assets/overall-asset — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewAsset(params.data) — [AssignAssets.jsx:238](../../client/src/pages/Assets/ManageAssets/AssignAssets.jsx#L238) |
| Assign (configured menu/action) | isAssignable | No local disabled condition detected | () => handleAssignAsset(params.data) — [AssignAssets.jsx:250](../../client/src/pages/Assets/ManageAssets/AssignAssets.jsx#L250) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AssignAssets.jsx:323](../../client/src/pages/Assets/ManageAssets/AssignAssets.jsx#L323) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AssignAssets.jsx:323](../../client/src/pages/Assets/ManageAssets/AssignAssets.jsx#L323) |
| Assign Asset (button) | modalMode === "assign" | isAssigning; loading: isAssigning | No inline handler declared; may submit a form or delegate to a component — [AssignAssets.jsx:579](../../client/src/pages/Assets/ManageAssets/AssignAssets.jsx#L579) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 234: `params`
- **isAssignable**, line 235: `params.data.isAssigned === "Available"`
- **isAssigning**, line 111: `useMutation({ mutationFn: async (data) => { const response = await axios.post("/api/assets/new-asset-assignment", { ...data, fromDepartmentId: departmentId, assetId: selectedAsset?._id, }); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "ASSIGNED"); queryClient.invalidateQueries({ queryKey: ["assetsList"] }); setOpenModal(false); reset(); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| error?.message \|\| "Failed to assign asset" ); }, })`
- **selectedAsset**, line 26: `useState([])`

## pages/Assets/ManageAssets/AssignedAssets.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/assets/manage-assets/:department/assigned-assets — no permission wrapper detected on this route-object chain
- /app/tasks/manage-assets/assigned-assets — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleView(params.data) — [AssignedAssets.jsx:169](../../client/src/pages/Assets/ManageAssets/AssignedAssets.jsx#L169) |
| Revoke (configured menu/action) | params.data.status !== "Revoked" | No local disabled condition detected | () => revokeAsset(params.data) — [AssignedAssets.jsx:180](../../client/src/pages/Assets/ManageAssets/AssignedAssets.jsx#L180) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AssignedAssets.jsx:328](../../client/src/pages/Assets/ManageAssets/AssignedAssets.jsx#L328) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AssignedAssets.jsx:328](../../client/src/pages/Assets/ManageAssets/AssignedAssets.jsx#L328) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 167: `params`

## pages/Assets/ManageAssetsHome.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/assets/manage-assets — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { dispatch(setSelectedDepartment(params.data?.departmentId)); dispatch(setSelectedDepartmentName(params.value)); navigate( isInUseView ? '/app/assets/manage-assets/${… (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { dispatch(setSelectedDepartment(params.data?.departmentId)); dispatch(setSelectedDepartmentName(params.value)); navigate( isInUseView ? '/app/assets/manage-assets/${params.value}/assigned-assets' : isAvailableView ? '/app/assets/manage-assets/${params.value}/unassigned-assets' : '/app/assets/manage-assets/${params.value}', isInUseV… — [ManageAssetsHome.jsx:233](../../client/src/pages/Assets/ManageAssetsHome.jsx#L233) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 231: `params`
- **isInUseView**, line 25: `assetViewFilter === "inUse"`
- **isAvailableView**, line 26: `assetViewFilter === "available"`

## pages/Assets/Reports/AssetReports.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/assets/reports — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AssetReports.jsx:323](../../client/src/pages/Assets/Reports/AssetReports.jsx#L323) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AssetReports.jsx:323](../../client/src/pages/Assets/Reports/AssetReports.jsx#L323) |
