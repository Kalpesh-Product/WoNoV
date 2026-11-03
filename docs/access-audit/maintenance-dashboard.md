# Maintenance Dashboard: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Dashboard/MaintainanceDashboard/Inventory.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/inventory/overall-inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/overall-st-inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/overall-dtc-inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/overall-st-inventory/sunteck-kanaka-units — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/overall-st-inventory/sunteck-kanaka-units/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/overall-dtc-inventory/dempo-trade-center — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/overall-dtc-inventory/dempo-trade-center/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/category — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/item — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/sunteck-kanaka-units — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/sunteck-kanaka-units/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/dempo-trade-center — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/dempo-trade-center/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/overall-inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/overall-st-inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/overall-dtc-inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/overall-st-inventory/sunteck-kanaka-units — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/overall-st-inventory/sunteck-kanaka-units/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/overall-dtc-inventory/dempo-trade-center — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/overall-dtc-inventory/dempo-trade-center/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/category — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/item — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/sunteck-kanaka-units — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/sunteck-kanaka-units/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/dempo-trade-center — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/dempo-trade-center/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/overall-inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/overall-st-inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/overall-dtc-inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/overall-st-inventory/sunteck-kanaka-units — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/overall-st-inventory/sunteck-kanaka-units/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/overall-dtc-inventory/dempo-trade-center — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/overall-dtc-inventory/dempo-trade-center/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/category — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/item — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/sunteck-kanaka-units — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/sunteck-kanaka-units/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/dempo-trade-center — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/dempo-trade-center/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/overall-inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/overall-st-inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/overall-dtc-inventory — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/category — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/item — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/sunteck-kanaka-units — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/sunteck-kanaka-units/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/dempo-trade-center — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/dempo-trade-center/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/overall-st-inventory/sunteck-kanaka-units — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/overall-st-inventory/sunteck-kanaka-units/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/overall-dtc-inventory/dempo-trade-center — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/overall-dtc-inventory/dempo-trade-center/:unitNo — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { handleDetailsClick(params.data); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { handleDetailsClick(params.data); } — [Inventory.jsx:1745](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L1745) |
| inventoryRootView === "overall" ? "Assign" : "Edit" (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setSelectedAsset(params.data); setModalMode("edit"); setIsModalOpen(true); } — [Inventory.jsx:1842](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L1842) |
| View Records (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { const currentPath = location.pathname.endsWith("/") ? location.pathname.slice(0, -1) : location.pathname; const recordPath = '${currentPath}/${encodeURIComponent( params.data.itemName, )}'; navigate(recordPath, { state: { inventoryCategory: params.data.categoryName \|\| "", buildingName: params.data.buildingName \|\| "", }, }); } — [Inventory.jsx:1850](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L1850) |
| Action: () => { handleDetailsClick(params.data); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { handleDetailsClick(params.data); } — [Inventory.jsx:1884](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L1884) |
| Edit (configured menu/action) | !overallBuildingTab | No local disabled condition detected | () => handleEditInventory(params.data) — [Inventory.jsx:1982](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L1982) |
| Assign (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { const recordBuildingName = normalizeBuildingName( params.data?.buildingName \|\| "", ); const matchingBuildingTab = tabOptions.find((tab) => tab.buildingAliases.some((alias) => recordBuildingName.includes(normalizeBuildingName(alias)), ), ); if (matchingBuildingTab) { setSelectedBuildingTab(matchingBuildingTab.key); } setSelectedAss… — [Inventory.jsx:1988](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L1988) |
| View Records (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { const currentPath = location.pathname.endsWith("/") ? location.pathname.slice(0, -1) : location.pathname; const recordPath = '${currentPath}/${encodeURIComponent( params.data.itemName, )}'; navigate(recordPath, { state: { inventoryCategory: params.data.categoryName \|\| "", buildingName: params.data.buildingName \|\| "", }, }); } — [Inventory.jsx:2008](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2008) |
| Action: () => handleUnitOpen(params.data.rawUnit) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleUnitOpen(params.data.rawUnit) — [Inventory.jsx:2210](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2210) |
| Action: () => handleCategoryDetailsClick(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleCategoryDetailsClick(params.data) — [Inventory.jsx:2445](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2445) |
| Restore category (button) | params.data.isDeleted | isDeletingCategory \|\| isRestoringCategory | () => setCategoryAction({ type: "restore", row: params.data }) — [Inventory.jsx:2470](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2470) |
| Delete category (button) | params.data.isActive | isDeletingCategory \|\| isRestoringCategory | () => setCategoryAction({ type: "delete", row: params.data }) — [Inventory.jsx:2484](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2484) |
| Edit (configured menu/action) | !params.data.isDeleted | No local disabled condition detected | () => handleCategoryEditOpen(params.data) — [Inventory.jsx:2501](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2501) |
| Action: () => handleItemDetailsClick(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleItemDetailsClick(params.data) — [Inventory.jsx:2536](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2536) |
| Restore item (button) | params.data.isDeleted | isDeletingItem \|\| isRestoringItem | () => setItemAction({ type: "restore", row: params.data }) — [Inventory.jsx:2560](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2560) |
| Delete item (button) | params.data.isActive | isDeletingItem \|\| isRestoringItem | () => { const category = inventoryCategories.find( (item) => String(item?._id) === String(params.data.category?._id), ); const isCategoryActive = category?.isActive ?? params.data.category?.isActive; const isCategoryDeleted = category?.isDeleted ?? params.data.category?.isDeleted; if (!isCategoryActive \|\| isCategoryDeleted) { toast.error(… — [Inventory.jsx:2574](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2574) |
| Edit (configured menu/action) | !params.data.isDeleted | No local disabled condition detected | () => handleItemEditOpen(params.data) — [Inventory.jsx:2606](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2606) |
| Add Inventory (table-generated action) | inventoryRootView === "overall" | No local disabled condition detected | handleAddAsset — [Inventory.jsx:2634](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2634) |
| Export (table-generated utility) | inventoryRootView === "overall"; exportData: true | No local disabled condition detected | Shared table export — [Inventory.jsx:2634](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2634) |
| Advanced filter (table-generated utility) | inventoryRootView === "overall"; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Inventory.jsx:2634](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2634) |
| Add Category (table-generated action) | inventoryRootView === "category" | No local disabled condition detected | handleOpenCategoryModal — [Inventory.jsx:2662](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2662) |
| Export (table-generated utility) | inventoryRootView === "category"; exportData: true | No local disabled condition detected | Shared table export — [Inventory.jsx:2662](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2662) |
| Advanced filter (table-generated utility) | inventoryRootView === "category"; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Inventory.jsx:2662](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2662) |
| Add Item (table-generated action) | inventoryRootView === "item" | No local disabled condition detected | handleOpenAddItemModal — [Inventory.jsx:2685](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2685) |
| Export (table-generated utility) | inventoryRootView === "item"; exportData: true | No local disabled condition detected | Shared table export — [Inventory.jsx:2685](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2685) |
| Advanced filter (table-generated utility) | inventoryRootView === "item"; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Inventory.jsx:2685](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2685) |
| Icon/action: () => handleTabChange(tab.key) (button) | !forcedBuildingTab AND !selectedUnit AND inventoryRootView === "building" | isActive | () => handleTabChange(tab.key) — [Inventory.jsx:2725](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2725) |
| Export (table-generated utility) | !selectedUnit AND inventoryRootView === "building"; exportData: true | No local disabled condition detected | Shared table export — [Inventory.jsx:2745](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2745) |
| Advanced filter (table-generated utility) | !selectedUnit AND inventoryRootView === "building"; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Inventory.jsx:2745](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2745) |
| Export (table-generated utility) | NOT (!selectedUnit) AND inventoryRootView === "building"; exportData: true | No local disabled condition detected | Shared table export — [Inventory.jsx:2771](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2771) |
| Advanced filter (table-generated utility) | NOT (!selectedUnit) AND inventoryRootView === "building"; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Inventory.jsx:2771](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2771) |
| isCreatingCategory ? "Adding..." : "Add Inventory Category" (button) | categoryModalMode === "add" | isCreatingCategory | No inline handler declared; may submit a form or delegate to a component — [Inventory.jsx:2851](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2851) |
| isUpdatingCategory ? "Updating..." : "Update Category" (button) | categoryModalMode === "edit" | isUpdatingCategory | No inline handler declared; may submit a form or delegate to a component — [Inventory.jsx:2943](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L2943) |
| isCreatingItem ? "Adding..." : "Add Item" (button) | itemModalMode === "add" | isCreatingItem | No inline handler declared; may submit a form or delegate to a component — [Inventory.jsx:3075](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L3075) |
| isUpdatingItem ? "Updating..." : "Update Item" (button) | itemModalMode === "edit" | isUpdatingItem | No inline handler declared; may submit a form or delegate to a component — [Inventory.jsx:3184](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L3184) |
| modalMode === "inventoryEdit" ? "Save Changes" : "Add Inventory" (button) | ["add", "inventoryEdit"].includes(modalMode) | modalMode === "inventoryEdit" && isUpdatingAsset | No inline handler declared; may submit a form or delegate to a component — [Inventory.jsx:3477](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L3477) |
| inventoryRootView === "overall" ? "Assign " : "Update Inventory" (button) | ["edit", "assign"].includes(modalMode) | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [Inventory.jsx:4004](../../client/src/pages/Dashboard/MaintainanceDashboard/Inventory.jsx#L4004) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 1744: `params`
- **params**, line 1838: `params`
- **params**, line 1883: `params`
- **params**, line 1976: `params`
- **params**, line 2209: `params`
- **params**, line 2444: `params`
- **params**, line 2467: `params`
- **isDeletingCategory**, line 1246: `useMutation({ mutationFn: async (categoryId) => (await axios.delete('/api/assets/category/${categoryId}')).data, onSuccess: (data) => { toast.success(data?.message \|\| "Category deleted successfully!"); queryClient.invalidateQueries({ queryKey: ["inventory-categories", department?._id], }); setCategoryAction(null); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to delete category."); }, })`
- **isRestoringCategory**, line 1261: `useMutation({ mutationFn: async (categoryId) => (await axios.patch('/api/assets/category/${categoryId}/restore')).data, onSuccess: (data) => { toast.success(data?.message \|\| "Category restored successfully!"); queryClient.invalidateQueries({ queryKey: ["inventory-categories", department?._id], }); setCategoryAction(null); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to restore category."); }, })`
- **params**, line 2535: `params`
- **params**, line 2557: `params`
- **isDeletingItem**, line 1342: `useMutation({ mutationFn: async (itemId) => (await axios.delete('/api/items/${itemId}')).data, onSuccess: (data) => { toast.success(data?.message \|\| "Item deleted successfully!"); queryClient.invalidateQueries({ queryKey: ["inventory-items", department?._id], }); setItemAction(null); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to delete item."); }, })`
- **isRestoringItem**, line 1357: `useMutation({ mutationFn: async (itemId) => (await axios.patch('/api/items/${itemId}/restore')).data, onSuccess: (data) => { toast.success(data?.message \|\| "Item restored successfully!"); queryClient.invalidateQueries({ queryKey: ["inventory-items", department?._id], }); setItemAction(null); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to restore item."); }, })`
- **selectedUnit**, line 146: `useState(null)`
- **isActive**, line 2723: `selectedBuildingTab === tab.key`
- **selectedBuildingTab**, line 147: `useState( forcedBuildingTab \|\| "sunteck", )`
- **isCreatingCategory**, line 1190: `useMutation( { mutationFn: async (data) => { const response = await axios.post("/api/category/create-category", { assetCategoryName: data.categoryName, departmentId: department._id, appliesTo: "inventory", }); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Category added successfully!"); queryClient.invalidateQueries({ queryKey: ["inventory-categories", department?._id], }); setIsCategoryModalOpen(false); resetCategoryForm(); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| "Failed to add category.", ); console.error(error); }, }, )`
- **isUpdatingCategory**, line 1217: `useMutation( { mutationFn: async (data) => { const response = await axios.patch( "/api/category/update-category", data, ); return response.data; }, onSuccess: (data) => { toast.success(data?.message \|\| "Category updated successfully!"); queryClient.invalidateQueries({ queryKey: ["inventory-categories", department?._id], }); queryClient.invalidateQueries({ queryKey: ["inventory-items", department?._id], }); setIsCategoryModalOpen(false); setSelectedCategory(null); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| "Failed to update category.", ); console.error(error); }, }, )`
- **isCreatingItem**, line 1276: `useMutation({ mutationFn: async (data) => { const response = await axios.post("/api/items", data, { headers: { "Content-Type": "application/json" }, }); return response.data; }, onSuccess: () => { toast.success("Item added successfully!"); queryClient.invalidateQueries({ queryKey: ["inventory-items", department?._id], }); setIsAddItemModalOpen(false); resetAddItemForm(); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to add item."); console.error(error); }, })`
- **isUpdatingItem**, line 1297: `useMutation({ mutationFn: async (data) => { const response = await axios.patch( '/api/items/${selectedItem?._id}', data, { headers: { "Content-Type": "application/json" }, }, ); return response.data; }, onSuccess: () => { // for item toast.success("Item updated successfully!"); queryClient.setQueriesData( { queryKey: ["inventory-items", department?._id] }, (oldData) => { if (!Array.isArray(oldData) \|\| !selectedItem?._id) return oldData; return oldData.map((item) => String(item?._id) === String(selectedItem._id) ? { ...item, name: getItemEditValues("itemName")?.trim() \|\| item.name, category: inventoryCategories.find( (cat) => String(cat?._id) === String(getItemEditValues("category")), ) \|\| item.category, isActive: getItemEditValues("status") === "true", } : item, ); }, ); setIsAddItemModalO…`
- **selectedItem**, line 144: `useState(null)`
- **isUpdatingAsset**, line 1372: `useMutation({ mutationFn: async (formData) => { const consumedUnits = Number( formData?.newConsumedUnitValue ?? formData?.consumedNewPurchaseInventoryUnits ?? 0, ); const payload = modalMode === "inventoryEdit" ? { category: formData.category, itemName: formData.itemName, buildingName: formData.buildingName?.trim() \|\| "", openingInventoryUnits: Number(formData.openingInventoryUnits), openingPerUnitPrice: Number(formData.openingPerUnitPrice), newPurchaseUnits: Number(formData.newPurchaseUnits), newPurchasePerUnitPrice: Number( formData.newPurchasePerUnitPrice, ), } : inventoryRootView === "overall" ? { unit: formData.unit, buildingName: formData.buildingName, ...(consumedUnits > 0 ? { consumptions: [ { quantity: consumedUnits, source: "newPurchase", }, ], } : {}), } : { consumptions: [ { qu…`
- **selectedAsset**, line 141: `useState(null)`

## pages/Dashboard/MaintainanceDashboard/InventoryRecordHistory.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/admin-dashboard/inventory/overall-st-inventory/sunteck-kanaka-units/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/overall-dtc-inventory/dempo-trade-center/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/overall-dtc-inventory/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/overall-inventory/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/overall-st-inventory/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/sunteck-kanaka-units/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/admin-dashboard/inventory/dempo-trade-center/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/overall-st-inventory/sunteck-kanaka-units/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/overall-dtc-inventory/dempo-trade-center/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/overall-inventory/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/overall-st-inventory/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/overall-dtc-inventory/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/sunteck-kanaka-units/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/inventory/dempo-trade-center/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/overall-st-inventory/sunteck-kanaka-units/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/overall-dtc-inventory/dempo-trade-center/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/overall-inventory/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/overall-st-inventory/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/overall-dtc-inventory/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/sunteck-kanaka-units/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/IT-dashboard/inventory/dempo-trade-center/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/overall-inventory/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/overall-st-inventory/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/overall-dtc-inventory/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/sunteck-kanaka-units/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/dempo-trade-center/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/overall-st-inventory/sunteck-kanaka-units/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain
- /app/dashboard/cafe-dashboard/inventory/overall-dtc-inventory/dempo-trade-center/:unitNo/:inventoryItemName — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleAssetClick(params) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleAssetClick(params) — [InventoryRecordHistory.jsx:396](../../client/src/pages/Dashboard/MaintainanceDashboard/InventoryRecordHistory.jsx#L396) |
| Action: () => handleAssetClick(params) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleAssetClick(params) — [InventoryRecordHistory.jsx:406](../../client/src/pages/Dashboard/MaintainanceDashboard/InventoryRecordHistory.jsx#L406) |
| Restore inventory (button) | params.data.isDeleted | isDeletingInventory \|\| isRestoringInventory | () => setInventoryAction({ type: "restore", row: params.data, }) — [InventoryRecordHistory.jsx:632](../../client/src/pages/Dashboard/MaintainanceDashboard/InventoryRecordHistory.jsx#L632) |
| Delete inventory (button) | No local render guard detected; page/API access still applies | isDeletingInventory \|\| isRestoringInventory | () => setInventoryAction({ type: "delete", row: params.data }) — [InventoryRecordHistory.jsx:648](../../client/src/pages/Dashboard/MaintainanceDashboard/InventoryRecordHistory.jsx#L648) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [InventoryRecordHistory.jsx:698](../../client/src/pages/Dashboard/MaintainanceDashboard/InventoryRecordHistory.jsx#L698) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [InventoryRecordHistory.jsx:698](../../client/src/pages/Dashboard/MaintainanceDashboard/InventoryRecordHistory.jsx#L698) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 395: `params`
- **params**, line 405: `params`
- **params**, line 629: `params`
- **isDeletingInventory**, line 233: `useMutation({ mutationFn: async (inventoryId) => (await axios.delete('/api/inventory/${inventoryId}')).data, onSuccess: (data) => { toast.success(data.message); queryClient.invalidateQueries({ queryKey: ["inventory-record-history"], }); queryClient.invalidateQueries({ queryKey: ["maintainance-inventory"], }); setInventoryAction(null); setIsViewModalOpen(false); }, onError: (error) => toast.error( error?.response?.data?.message \|\| "Failed to delete inventory", ), })`
- **isRestoringInventory**, line 254: `useMutation({ mutationFn: async (inventoryId) => (await axios.patch('/api/inventory/${inventoryId}/restore')).data, onSuccess: (data) => { toast.success(data.message); queryClient.invalidateQueries({ queryKey: ["inventory-record-history"], }); queryClient.invalidateQueries({ queryKey: ["maintainance-inventory"], }); setInventoryAction(null); setIsViewModalOpen(false); }, onError: (error) => toast.error( error?.response?.data?.message \|\| "Failed to restore inventory", ), })`

## pages/Dashboard/MaintainanceDashboard/MaintainanceDashboard.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Total (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleUnderMaintenanceAssetsClick — [MaintainanceDashboard.jsx:1472](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintainanceDashboard.jsx#L1472) |

## pages/Dashboard/MaintainanceDashboard/MaintenanceAnnualExpenses.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { handleDetailsClick(params.data); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { handleDetailsClick(params.data); } — [MaintenanceAnnualExpenses.jsx:112](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceAnnualExpenses.jsx#L112) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [MaintenanceAnnualExpenses.jsx:220](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceAnnualExpenses.jsx#L220) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceAnnualExpenses.jsx:220](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceAnnualExpenses.jsx#L220) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | () => { toast.success("Expense type added succesfully"); setIsModalOpen(false); } — [MaintenanceAnnualExpenses.jsx:320](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceAnnualExpenses.jsx#L320) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 111: `params`

## pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAmcRecords.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/data/amc-records — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { handleDetailsClick(params.data); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { handleDetailsClick(params.data); } — [MaintenanceAmcRecords.jsx:117](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAmcRecords.jsx#L117) |
| Add Record (table-generated action) | No local render guard detected; page/API access still applies | disabled | handleAddAsset — [MaintenanceAmcRecords.jsx:257](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAmcRecords.jsx#L257) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [MaintenanceAmcRecords.jsx:257](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAmcRecords.jsx#L257) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceAmcRecords.jsx:257](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAmcRecords.jsx#L257) |
| Select Image (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenanceAmcRecords.jsx:305](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAmcRecords.jsx#L305) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenanceAmcRecords.jsx:559](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAmcRecords.jsx#L559) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 116: `params`

## pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAssetList.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { handleDetailsClick(params.data); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { handleDetailsClick(params.data); } — [MaintenanceAssetList.jsx:116](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAssetList.jsx#L116) |
| Add Asset (table-generated action) | No local render guard detected; page/API access still applies | disabled | handleAddAsset — [MaintenanceAssetList.jsx:256](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAssetList.jsx#L256) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceAssetList.jsx:256](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAssetList.jsx#L256) |
| Select Image (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenanceAssetList.jsx:303](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAssetList.jsx#L303) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenanceAssetList.jsx:557](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAssetList.jsx#L557) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 115: `params`

## pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceMonthlyInvoice.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/data/monthly-invoice-reports — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { handleDetailsClick(params.data); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { handleDetailsClick(params.data); } — [MaintenanceMonthlyInvoice.jsx:114](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceMonthlyInvoice.jsx#L114) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceMonthlyInvoice.jsx:228](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceMonthlyInvoice.jsx#L228) |
| Select Image (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenanceMonthlyInvoice.jsx:274](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceMonthlyInvoice.jsx#L274) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenanceMonthlyInvoice.jsx:528](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceMonthlyInvoice.jsx#L528) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 113: `params`

## pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceVendorReports.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { handleDetailsClick(params.data); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { handleDetailsClick(params.data); } — [MaintenanceVendorReports.jsx:114](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceVendorReports.jsx#L114) |
| Add Vendor (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddAsset — [MaintenanceVendorReports.jsx:246](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceVendorReports.jsx#L246) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceVendorReports.jsx:246](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceVendorReports.jsx#L246) |
| Select Image (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenanceVendorReports.jsx:292](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceVendorReports.jsx#L292) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenanceVendorReports.jsx:545](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceVendorReports.jsx#L545) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 113: `params`

## pages/Dashboard/MaintainanceDashboard/MaintenanceExpenses/MaintenanceExpenses.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/maintenance-expenses — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [MaintenanceExpenses.jsx:1009](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceExpenses/MaintenanceExpenses.jsx#L1009) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceExpenses.jsx:1009](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceExpenses/MaintenanceExpenses.jsx#L1009) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenanceExpenses.jsx:1171](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceExpenses/MaintenanceExpenses.jsx#L1171) |

## pages/Dashboard/MaintainanceDashboard/MaintenanceExpenses/MaintenanceExpensesClear.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/maintenance-expenses/maintenance-expenses-layout/:client/maintenance-expenses-clear — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceExpensesClear.jsx:151](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceExpenses/MaintenanceExpensesClear.jsx#L151) |

## pages/Dashboard/MaintainanceDashboard/MaintenanceExpenses/MaintenanceExpensesOccupied.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/maintenance-expenses/maintenance-expenses-layout/:client/maintenance-expenses-occupied — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceExpensesOccupied.jsx:151](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceExpenses/MaintenanceExpensesOccupied.jsx#L151) |

## pages/Dashboard/MaintainanceDashboard/MaintenanceFinance/MaintenanceBudget.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Request Budget (table-generated action) | !isHrLoading AND NOT (!isReady) | No local disabled condition detected | () => setOpenModal(true) — [MaintenanceBudget.jsx:312](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceFinance/MaintenanceBudget.jsx#L312) |
| Advanced filter (table-generated utility) | !isHrLoading AND NOT (!isReady); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceBudget.jsx:312](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceFinance/MaintenanceBudget.jsx#L312) |
| Submit (button) | NOT (!isReady) | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenanceBudget.jsx:432](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceFinance/MaintenanceBudget.jsx#L432) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isHrLoading**, line 35: `useQuery({ queryKey: ["maintainanceBudget"], queryFn: async () => { try { const response = await axios.get( '/api/budget/company-budget?${department?._id}' ); const budgets = response.data.allBudgets; return Array.isArray(budgets) ? budgets : []; } catch (error) { console.error("Error fetching budget:", error); return []; } }, })`
- **isReady**, line 31: `useState(false)`

## pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/EnergyDailyReadingHistory.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/mix-bag/:module/energy-daily-reading-history — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [EnergyDailyReadingHistory.jsx:70](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/EnergyDailyReadingHistory.jsx#L70) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [EnergyDailyReadingHistory.jsx:70](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/EnergyDailyReadingHistory.jsx#L70) |

## pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/EnergyMonthlyReadingHistory.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/mix-bag/st-energy-monthly-reading/energy-monthly-reading-history — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/mix-bag/dtc-energy-monthly-reading/energy-monthly-reading-history — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/mix-bag/st-energy-monthly-reading/energy-monthly-reading-history/:readingId — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/mix-bag/dtc-energy-monthly-reading/energy-monthly-reading-history/:readingId — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/mix-bag/energy-monthly-reading-history/:module/:readingId — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [EnergyMonthlyReadingHistory.jsx:79](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/EnergyMonthlyReadingHistory.jsx#L79) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [EnergyMonthlyReadingHistory.jsx:79](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/EnergyMonthlyReadingHistory.jsx#L79) |

## pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingDaily.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/mix-bag/dtc-energy-daily-reading — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| close-modal (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | onClose — [MaintainanceDtcEnergyReadingDaily.jsx:146](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingDaily.jsx#L146) |
| view-reading (button) | params.data.id | No local disabled condition detected | () => openViewModal(params.data) — [MaintainanceDtcEnergyReadingDaily.jsx:448](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingDaily.jsx#L448) |
| Edit (configured menu/action) | params.data.id | No local disabled condition detected | () => openEditModal(params.data) — [MaintainanceDtcEnergyReadingDaily.jsx:459](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingDaily.jsx#L459) |
| View Record (configured menu/action) | params.data.id | No local disabled condition detected | () => { sessionStorage.setItem( "energyDailyReadingHistory:dtc-energy-daily-reading", params.data.id, ); navigate( "/app/dashboard/maintenance-dashboard/mix-bag/dtc-energy-daily-reading/energy-daily-reading-history", { state: { readingId: params.data.id }, }, ); } — [MaintainanceDtcEnergyReadingDaily.jsx:463](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingDaily.jsx#L463) |
| Add Reading (table-generated action) | No local render guard detected; page/API access still applies | isAddReadingDisabled | openAddModal — [MaintainanceDtcEnergyReadingDaily.jsx:492](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingDaily.jsx#L492) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [MaintainanceDtcEnergyReadingDaily.jsx:492](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingDaily.jsx#L492) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintainanceDtcEnergyReadingDaily.jsx:492](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingDaily.jsx#L492) |
| Icon/action: handlePreviousDate (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handlePreviousDate — [MaintainanceDtcEnergyReadingDaily.jsx:526](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingDaily.jsx#L526) |
| Icon/action: handleNextDate (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleNextDate — [MaintainanceDtcEnergyReadingDaily.jsx:575](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingDaily.jsx#L575) |
| Icon/action: handleAddDailyReadings (button) | modalMode === "add" | saving | handleAddDailyReadings — [MaintainanceDtcEnergyReadingDaily.jsx:722](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingDaily.jsx#L722) |
| Icon/action: motion.button (button) | modalMode === "edit" | saving | No inline handler declared; may submit a form or delegate to a component — [MaintainanceDtcEnergyReadingDaily.jsx:867](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingDaily.jsx#L867) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 445: `params`
- **isAddReadingDisabled**, line 241: `readings.some((row) => Boolean(row.id))`

## pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/mix-bag/dtc-energy-monthly-reading — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| close-modal (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | onClose — [MaintainanceDtcEnergyReadingMonthly.jsx:226](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx#L226) |
| Icon/action: () => navigate('${encodeURIComponent(params.value)}') (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate('${encodeURIComponent(params.value)}') — [MaintainanceDtcEnergyReadingMonthly.jsx:804](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx#L804) |
| view-record (button) | params.data?.id | No local disabled condition detected | () => openViewModal(params.data) — [MaintainanceDtcEnergyReadingMonthly.jsx:861](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx#L861) |
| Edit (configured menu/action) | params.data?.id | No local disabled condition detected | () => openEditModal(params.data) — [MaintainanceDtcEnergyReadingMonthly.jsx:872](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx#L872) |
| View Record (configured menu/action) | params.data?.id | No local disabled condition detected | () => navigate( "/app/dashboard/maintenance-dashboard/mix-bag/dtc-energy-monthly-reading/energy-monthly-reading-history", { state: { readingId: params.data.id }, }, ) — [MaintainanceDtcEnergyReadingMonthly.jsx:876](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx#L876) |
| previous-graph-month (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setGraphSelectedMonth((current) => current.subtract(1, "month"), ) — [MaintainanceDtcEnergyReadingMonthly.jsx:949](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx#L949) |
| next-graph-month (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setGraphSelectedMonth((current) => current.add(1, "month")) — [MaintainanceDtcEnergyReadingMonthly.jsx:966](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx#L966) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [MaintainanceDtcEnergyReadingMonthly.jsx:982](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx#L982) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintainanceDtcEnergyReadingMonthly.jsx:982](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx#L982) |
| Add Bill (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | openAddModal — [MaintainanceDtcEnergyReadingMonthly.jsx:1002](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx#L1002) |
| Icon/action: handleAddBills (button) | modalMode === "add" | saving | handleAddBills — [MaintainanceDtcEnergyReadingMonthly.jsx:1131](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx#L1131) |
| Icon/action: motion.button (button) | modalMode === "edit" | saving | No inline handler declared; may submit a form or delegate to a component — [MaintainanceDtcEnergyReadingMonthly.jsx:1236](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceDtcEnergyReadingMonthly.jsx#L1236) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 803: `params`
- **params**, line 858: `params`

## pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingDaily.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/mix-bag/st-energy-daily-reading — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| close-modal (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | onClose — [MaintainanceStEnergyReadingDaily.jsx:145](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingDaily.jsx#L145) |
| view-reading (button) | params.data.id | No local disabled condition detected | () => openViewModal(params.data) — [MaintainanceStEnergyReadingDaily.jsx:447](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingDaily.jsx#L447) |
| Edit (configured menu/action) | params.data.id | No local disabled condition detected | () => openEditModal(params.data) — [MaintainanceStEnergyReadingDaily.jsx:458](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingDaily.jsx#L458) |
| View Record (configured menu/action) | params.data.id | No local disabled condition detected | () => { sessionStorage.setItem( "energyDailyReadingHistory:st-energy-daily-reading", params.data.id, ); navigate( "/app/dashboard/maintenance-dashboard/mix-bag/st-energy-daily-reading/energy-daily-reading-history", { state: { readingId: params.data.id }, }, ); } — [MaintainanceStEnergyReadingDaily.jsx:462](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingDaily.jsx#L462) |
| Add Reading (table-generated action) | No local render guard detected; page/API access still applies | isAddReadingDisabled | openAddModal — [MaintainanceStEnergyReadingDaily.jsx:491](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingDaily.jsx#L491) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [MaintainanceStEnergyReadingDaily.jsx:491](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingDaily.jsx#L491) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintainanceStEnergyReadingDaily.jsx:491](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingDaily.jsx#L491) |
| Icon/action: handlePreviousDate (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handlePreviousDate — [MaintainanceStEnergyReadingDaily.jsx:525](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingDaily.jsx#L525) |
| Icon/action: handleNextDate (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleNextDate — [MaintainanceStEnergyReadingDaily.jsx:574](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingDaily.jsx#L574) |
| Icon/action: handleAddDailyReadings (button) | modalMode === "add" | saving | handleAddDailyReadings — [MaintainanceStEnergyReadingDaily.jsx:721](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingDaily.jsx#L721) |
| Icon/action: motion.button (button) | modalMode === "edit" | saving | No inline handler declared; may submit a form or delegate to a component — [MaintainanceStEnergyReadingDaily.jsx:864](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingDaily.jsx#L864) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 444: `params`
- **isAddReadingDisabled**, line 240: `readings.some((row) => Boolean(row.id))`

## pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/mix-bag/st-energy-monthly-reading — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| close-modal (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | onClose — [MaintainanceStEnergyReadingMonthly.jsx:227](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx#L227) |
| Icon/action: () => navigate('${encodeURIComponent(params.value)}') (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate('${encodeURIComponent(params.value)}') — [MaintainanceStEnergyReadingMonthly.jsx:804](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx#L804) |
| view-record (button) | params.data?.id | No local disabled condition detected | () => openViewModal(params.data) — [MaintainanceStEnergyReadingMonthly.jsx:861](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx#L861) |
| Edit (configured menu/action) | params.data?.id | No local disabled condition detected | () => openEditModal(params.data) — [MaintainanceStEnergyReadingMonthly.jsx:872](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx#L872) |
| View Record (configured menu/action) | params.data?.id | No local disabled condition detected | () => navigate( "/app/dashboard/maintenance-dashboard/mix-bag/st-energy-monthly-reading/energy-monthly-reading-history", { state: { readingId: params.data.id }, }, ) — [MaintainanceStEnergyReadingMonthly.jsx:876](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx#L876) |
| previous-graph-month (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setGraphSelectedMonth((current) => current.subtract(1, "month"), ) — [MaintainanceStEnergyReadingMonthly.jsx:949](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx#L949) |
| next-graph-month (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setGraphSelectedMonth((current) => current.add(1, "month")) — [MaintainanceStEnergyReadingMonthly.jsx:966](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx#L966) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [MaintainanceStEnergyReadingMonthly.jsx:981](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx#L981) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintainanceStEnergyReadingMonthly.jsx:981](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx#L981) |
| Add Bill (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | openAddModal — [MaintainanceStEnergyReadingMonthly.jsx:1001](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx#L1001) |
| Icon/action: handleAddBills (button) | modalMode === "add" | saving | handleAddBills — [MaintainanceStEnergyReadingMonthly.jsx:1130](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx#L1130) |
| Icon/action: motion.button (button) | modalMode === "edit" | saving | No inline handler declared; may submit a form or delegate to a component — [MaintainanceStEnergyReadingMonthly.jsx:1236](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/MaintainanceStEnergyReadingMonthly.jsx#L1236) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 803: `params`
- **params**, line 858: `params`

## pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/YearwiseEnergyBilling.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/mix-bag/st-energy-monthly-reading/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/mix-bag/st-overall-energy-consumption-billing — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/mix-bag/dtc-energy-monthly-reading/:unitNo — no permission wrapper detected on this route-object chain
- /app/dashboard/maintenance-dashboard/mix-bag/dtc-overall-energy-consumption-billing — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| previous-financial-year (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFYStartYear((current) => current - 1) — [YearwiseEnergyBilling.jsx:357](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/YearwiseEnergyBilling.jsx#L357) |
| next-financial-year (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFYStartYear((current) => current + 1) — [YearwiseEnergyBilling.jsx:370](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/YearwiseEnergyBilling.jsx#L370) |
| Export (table-generated utility) | !embedded; exportData: true | No local disabled condition detected | Shared table export — [YearwiseEnergyBilling.jsx:383](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/YearwiseEnergyBilling.jsx#L383) |
| Advanced filter (table-generated utility) | !embedded; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [YearwiseEnergyBilling.jsx:383](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag/YearwiseEnergyBilling.jsx#L383) |

## pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOffices.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Layout (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { localStorage.setItem("client", domain.name); navigate( '/app/dashboard/maintenance-dashboard/maintenance-offices/maintenance-offices-layout/${domain.name}' ); } — [MaintenanceOffices.jsx:325](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOffices.jsx#L325) |

## pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesClear.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/maintenance-offices/:client/maintenance-offices-clear — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceOfficesClear.jsx:150](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesClear.jsx#L150) |

## pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesLayout.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/maintenance-offices/:client — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [MaintenanceOfficesLayout.jsx:227](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesLayout.jsx#L227) |

## pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesNew.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/maintenance-offices — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { navigate( '/app/dashboard/maintenance-dashboard/maintenance-offices/${params.value}', { state: { unitId: params.data._id, unitName: params.value } } ); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { navigate( '/app/dashboard/maintenance-dashboard/maintenance-offices/${params.value}', { state: { unitId: params.data._id, unitName: params.value } } ); } — [MaintenanceOfficesNew.jsx:116](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesNew.jsx#L116) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [MaintenanceOfficesNew.jsx:152](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesNew.jsx#L152) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceOfficesNew.jsx:152](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesNew.jsx#L152) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 115: `params`

## pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesOccupied.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/maintenance-offices/:client/maintenance-offices-occupied — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceOfficesOccupied.jsx:151](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesOccupied.jsx#L151) |

## pages/Dashboard/MaintainanceDashboard/MaintenancePerSqFtExpense.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/maintenance-dashboard/per-sq-ft-expense — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFY(shiftFinancialYear(selectedFY, -1)) — [MaintenancePerSqFtExpense.jsx:209](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenancePerSqFtExpense.jsx#L209) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFY(shiftFinancialYear(selectedFY, 1)) — [MaintenancePerSqFtExpense.jsx:220](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenancePerSqFtExpense.jsx#L220) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [MaintenancePerSqFtExpense.jsx:230](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenancePerSqFtExpense.jsx#L230) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenancePerSqFtExpense.jsx:230](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenancePerSqFtExpense.jsx#L230) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedFY**, line 52: `useState(getCurrentFinancialYearLabel())`

## pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenanceBulkUpload.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenanceBulkUpload.jsx:55](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenanceBulkUpload.jsx#L55) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceBulkUpload.jsx:74](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenanceBulkUpload.jsx#L74) |

## pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenancePolicies.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenancePolicies.jsx:57](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenancePolicies.jsx#L57) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenancePolicies.jsx:75](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenancePolicies.jsx#L75) |

## pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenanceSops.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MaintenanceSops.jsx:49](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenanceSops.jsx#L49) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MaintenanceSops.jsx:68](../../client/src/pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenanceSops.jsx#L68) |
