# Performance: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Performance/DailyLogEditHistory.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Select edit history date range (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | (event) => setAnchor(event.currentTarget) — [DailyLogEditHistory.jsx:46](../../client/src/pages/Performance/DailyLogEditHistory.jsx#L46) |

## pages/Performance/DepartmentDetails/PerformanceAnnual.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/:overallType/:memberWiseType/annual-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/assign-KRA-KPA/annual-KPA — `<ProtectedDepartmentRoute allowHrForPerformance={true} allowAdminForPerformance={true} element={<DepartmentPerformanceLayout />} />`
- /app/tasks/department-tasks/:department/Annual-KRA — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceAnnual.jsx:69](../../client/src/pages/Performance/DepartmentDetails/PerformanceAnnual.jsx#L69) |

## pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/department-KPA/member-wise-KPA/individual-Monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/:overallType/:memberWiseType/individual-Monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/department-KRA/member-wise-KRA/individual-Monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/assign-KRA-KPA/individual-Monthly-KPA — `<ProtectedDepartmentRoute allowHrForPerformance={true} allowAdminForPerformance={true} element={<DepartmentPerformanceLayout />} />`
- /app/performance/employee-KRA-KPA/individual-Monthly-KPA — `<PerformancePermissionRoute permissions={[PERMISSIONS.PERFORMANCE_EMPLOYEE_KRA_KPA]} element={<EmployeePerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_EMPLOYEE_INDIVIDUAL_MONTHLY_KPA, ]} element={<PerformanceIndividualKpa />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { if ( !params.node.selected \|\| isUpdatePending \|\| isDeletePending ) return; openMarkDoneModal(params.data); } (clickable action) | actionVisibility.showMarkDone AND (shouldForceOwnControlsInEmployeeRoute \|\| matchingDepartment \|\| isManager) && canShowControls && actionVisibility.showActionColumn && !shouldHideManagerControlsForSelectedMemberView | No local disabled condition detected | () => { if ( !params.node.selected \|\| isUpdatePending \|\| isDeletePending ) return; openMarkDoneModal(params.data); } — [PerformanceIndividualKpa.jsx:661](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L661) |
| isUpdatePending ? "⏳" : "Mark As Done" (button) | actionVisibility.showMarkDone AND (shouldForceOwnControlsInEmployeeRoute \|\| matchingDepartment \|\| isManager) && canShowControls && actionVisibility.showActionColumn && !shouldHideManagerControlsForSelectedMemberView | !params.node.selected \|\| isUpdatePending \|\| isDeletePending | No inline handler declared; may submit a form or delegate to a component — [PerformanceIndividualKpa.jsx:675](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L675) |
| Edit (button) | !isAddKpaDisabled && actionVisibility.showEdit AND (shouldForceOwnControlsInEmployeeRoute \|\| matchingDepartment \|\| isManager) && canShowControls && actionVisibility.showActionColumn && !shouldHideManagerControlsForSelectedMemberView | !params.node.selected \|\| isUpdatePending \|\| isDeletePending | () => handleOpenEditModal(params.data) — [PerformanceIndividualKpa.jsx:689](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L689) |
| Delete Recurrence (button) | canDeleteRecurrence && actionVisibility.showDelete AND (shouldForceOwnControlsInEmployeeRoute \|\| matchingDepartment \|\| isManager) && canShowControls && actionVisibility.showActionColumn && !shouldHideManagerControlsForSelectedMemberView | !params.node.selected \|\| isDeletePending \|\| isUpdatePending | () => setDeleteTargetId(params.data.mongoId) — [PerformanceIndividualKpa.jsx:702](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L702) |
| View Completed KPA (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setCompletedTaskView(params.data) — [PerformanceIndividualKpa.jsx:742](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L742) |
| showAddMonthlyKpaButton ? "Add Individual Monthly KPA" : undefined (table-generated action) | !isCompletedLoading && !isUpdatePending | hideMemberLevelControls \|\| isAddKpaDisabled \|\| !canShowControls \|\| isRestrictedRoleInNonCurrentMonth | openAddIndividualModal — [PerformanceIndividualKpa.jsx:915](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L915) |
| !showAddTeamMonthlyKpaButton ? undefined : "Add Team Monthly KPA" (table-generated action) | !isCompletedLoading && !isUpdatePending | !showAddTeamMonthlyKpaButton | openAddTeamModal — [PerformanceIndividualKpa.jsx:915](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L915) |
| Advanced filter (table-generated utility) | !isCompletedLoading && !isUpdatePending; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceIndividualKpa.jsx:915](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L915) |
| Export (table-generated utility) | !isCompletedLoading; exportData: selectedMonthContext !== "next" | No local disabled condition detected | Shared table export — [PerformanceIndividualKpa.jsx:999](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L999) |
| Advanced filter (table-generated utility) | !isCompletedLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceIndividualKpa.jsx:999](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L999) |
| Mark as Done (button) | selectedKpa | isUpdatePending; loading: isUpdatePending | handleMarkAsDoneWithComment — [PerformanceIndividualKpa.jsx:1074](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L1074) |
| Cancel (button) | selectedKpa | isUpdatePending | () => { setSelectedKpa(null); completionCommentRef.current = ""; setCompletionCommentError(""); setOpenModal(false); } — [PerformanceIndividualKpa.jsx:1080](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L1080) |
| Submit (button) | NOT (selectedKpa) | isAddKpaPending; loading: isAddKpaPending | No inline handler declared; may submit a form or delegate to a component — [PerformanceIndividualKpa.jsx:1268](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKpa.jsx#L1268) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isManager**, line 120: `userPermissions.includes(PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA.value) \|\| userPermissions.includes(PERMISSIONS.PERFORMANCE_MONTHLY_KPA.value)`
- **userPermissions**, line 119: `auth?.user?.permissions?.permissions \|\| []`
- **auth**, line 40: `useAuth()`
- **canShowControls**, line 193: `shouldForceOwnControlsInEmployeeRoute \|\| (!hideMemberLevelControls && !isRoleEmployee && (isManager \|\| isMasterOrSuperAdmin \|\| shouldShowManagerControlsInEmployeeRoute \|\| !shouldHideAddButtonForSelectedMemberView))`
- **isRoleEmployee**, line 116: `roleTitles.some((roleTitle) => roleTitle?.includes("employee") )`
- **roleTitles**, line 114: `auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) \|\| []`
- **isMasterOrSuperAdmin**, line 124: `roleTitles.some( (roleTitle) => roleTitle?.includes("master admin") \|\| roleTitle?.includes("super admin") )`
- **params**, line 655: `params`
- **isUpdatePending**, line 371: `useMutation({ mutationKey: ["updateMonthlyKpa"], mutationFn: async (data) => { const response = await axios.patch( '/api/performance/update-status/${data.taskId}/KPA', { comment: data.comment } ); return response.data; }, onSuccess: async (data, taskId) => { const removeTaskFromPending = (prev) => Array.isArray(prev) ? prev.filter((item) => String(item?.id) !== String(taskId?.taskId \|\| taskId)) : prev; // Remove instantly from pending lists so employee sees the change without manual refresh. queryClient.setQueryData( ["fetchedMonthlyKPA", effectiveDeptId], removeTaskFromPending, ); queryClient.setQueryData( ["fetchedTeamKPAForIndividual", effectiveDeptId], removeTaskFromPending, ); await Promise.all([ queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA", effectiveDeptId], }), que…`
- **isDeletePending**, line 239: `useMutation({ mutationKey: ["deleteMonthlyKpaRecurrence"], mutationFn: async (taskId) => { const response = await axios.patch('/api/performance/delete-recurrence/${taskId}'); return response.data; }, onSuccess: (data, deletedTaskId) => { const removeDeletedTask = (prev = []) => Array.isArray(prev) ? prev.filter((item) => item?.id?.toString?.() !== deletedTaskId?.toString?.()) : prev; queryClient.setQueryData( ["fetchedMonthlyKPA", effectiveDeptId], removeDeletedTask ); queryClient.setQueryData( ["fetchedTeamKPAForIndividual", effectiveDeptId], removeDeletedTask ); queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA", effectiveDeptId] }); queryClient.invalidateQueries({ queryKey: ["fetchedTeamKPAForIndividual", effectiveDeptId] }); queryClient.refetchQueries({ queryKey: ["fetchedM…`
- **isAddKpaDisabled**, line 95: `auth?.user?.role?.some((role) => restrictedRoles.includes(role.roleTitle) )`
- **canDeleteRecurrence**, line 98: `!isAddKpaDisabled`
- **params**, line 741: `params`
- **isCompletedLoading**, line 535: `useQuery({ queryKey: ["completedEntriesIndividualKPA", effectiveDeptId], queryFn: async () => { try { const response = await axios.get( '/api/performance/get-completed-tasks?dept=${effectiveDeptId}&type=INDIVIDUALKPA' ); return response.data; } catch (error) { console.error(error); return []; } }, })`
- **isRestrictedRoleInNonCurrentMonth**, line 203: `(isManagerAdmin \|\| isEmployeeOnly) && selectedMonthContext !== "current"`
- **isManagerAdmin**, line 128: `isManager && !isMasterOrSuperAdmin`
- **selectedKpa**, line 46: `useState(null)`
- **isAddKpaPending**, line 279: `useMutation({ mutationKey: ["addMonthlyKpa"], mutationFn: async (data) => { const response = await axios.post("/api/performance/create-task", { task: data.kpaName, taskType: modalTaskType, //taskType: "INDIVIDUALKPA", // description: data.description, department: effectiveDeptId, assignedDate: data.startDate, dueDate: data.endDate, kpaDuration: "Monthly", assignTo: data.assignTo, }); return response.data; }, onSuccess: (data) => { // queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] }); // queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA"] }); queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA", effectiveDeptId] }); queryClient.invalidateQueries({ queryKey: ["fetchedTeamKPAForIndividual", effectiveDeptId] }); queryClient.refetchQueries({ queryKey: ["fetch…`

## pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/department-KPA/member-wise-KPA/individual-Daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/:overallType/:memberWiseType/individual-Daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/department-KRA/member-wise-KRA/individual-Daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/assign-KRA-KPA/individual-Daily-KRA — `<ProtectedDepartmentRoute allowHrForPerformance={true} allowAdminForPerformance={true} element={<DepartmentPerformanceLayout />} />`
- /app/performance/employee-KRA-KPA/individual-Daily-KRA — `<PerformancePermissionRoute permissions={[PERMISSIONS.PERFORMANCE_EMPLOYEE_KRA_KPA]} element={<EmployeePerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_EMPLOYEE_INDIVIDUAL_DAILY_KRA, ]} element={<PerformanceIndividualKra />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { if (!rowCanMarkDone \|\| !isRowSelected \|\| isUpdatePending \|\| isDeletePending) return; openMarkDoneModal(params.data); } (clickable action) | showMarkAsDone AND (isSuperOrMasterAdmin \|\| isCurrentDateView \|\| (isFutureDateView && selectedMemberCanManageView)) && (matchingDepartment \|\| selectedMemberCanManageView \|\| shouldForceOwnControlsInEmployeeRoute) && canShowControls && !shouldHideActionsForEmployeeFuture && !shouldHideManagerControlsForSelectedMemberView | No local disabled condition detected | () => { if (!rowCanMarkDone \|\| !isRowSelected \|\| isUpdatePending \|\| isDeletePending) return; openMarkDoneModal(params.data); } — [PerformanceIndividualKra.jsx:554](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx#L554) |
| isUpdatePending ? "⏳" : "Mark As Done" (button) | showMarkAsDone AND (isSuperOrMasterAdmin \|\| isCurrentDateView \|\| (isFutureDateView && selectedMemberCanManageView)) && (matchingDepartment \|\| selectedMemberCanManageView \|\| shouldForceOwnControlsInEmployeeRoute) && canShowControls && !shouldHideActionsForEmployeeFuture && !shouldHideManagerControlsForSelectedMemberView | !rowCanMarkDone \|\| !isRowSelected \|\| isUpdatePending \|\| isDeletePending | No inline handler declared; may submit a form or delegate to a component — [PerformanceIndividualKra.jsx:563](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx#L563) |
| Edit (button) | rowCanEditDelete && !isAddKraDisabled AND (isSuperOrMasterAdmin \|\| isCurrentDateView \|\| (isFutureDateView && selectedMemberCanManageView)) && (matchingDepartment \|\| selectedMemberCanManageView \|\| shouldForceOwnControlsInEmployeeRoute) && canShowControls && !shouldHideActionsForEmployeeFuture && !shouldHideManagerControlsForSelectedMemberView | !isRowSelected \|\| !rowCanEditDelete \|\| isUpdatePending \|\| isDeletePending | () => { if (!isRowSelected \|\| !rowCanEditDelete) return; handleOpenEditModal(params.data); } — [PerformanceIndividualKra.jsx:588](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx#L588) |
| Delete Recurrence (button) | rowCanEditDelete && canDeleteRecurrence AND (isSuperOrMasterAdmin \|\| isCurrentDateView \|\| (isFutureDateView && selectedMemberCanManageView)) && (matchingDepartment \|\| selectedMemberCanManageView \|\| shouldForceOwnControlsInEmployeeRoute) && canShowControls && !shouldHideActionsForEmployeeFuture && !shouldHideManagerControlsForSelectedMemberView | !isRowSelected \|\| !rowCanEditDelete \|\| isDeletePending \|\| isUpdatePending | () => { if (!isRowSelected \|\| !rowCanEditDelete) return; setDeleteTargetId(params.data.id); } — [PerformanceIndividualKra.jsx:605](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx#L605) |
| View Completed KRA (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setCompletedTaskView(params.data) — [PerformanceIndividualKra.jsx:651](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx#L651) |
| canShowAddIndividualKraButton ? addButtonLabel : undefined (table-generated action) | !departmentLoading | isAddKraDisabled \|\| !canShowControls \|\| !canShowAddIndividualKraButton | handleOpenAddModal — [PerformanceIndividualKra.jsx:834](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx#L834) |
| Advanced filter (table-generated utility) | !departmentLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceIndividualKra.jsx:834](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx#L834) |
| Export (table-generated utility) | !departmentLoading; exportData: !isFutureDateView | No local disabled condition detected | Shared table export — [PerformanceIndividualKra.jsx:916](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx#L916) |
| Advanced filter (table-generated utility) | !departmentLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceIndividualKra.jsx:916](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx#L916) |
| Mark as Done (button) | selectedKra | isUpdatePending; loading: isUpdatePending | handleMarkAsDoneWithComment — [PerformanceIndividualKra.jsx:988](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx#L988) |
| Cancel (button) | selectedKra | isUpdatePending | () => { setOpenModal(false); setSelectedKra(null); completionCommentRef.current = ""; setCompletionCommentError(""); } — [PerformanceIndividualKra.jsx:994](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx#L994) |
| Submit (button) | NOT (selectedKra) | isAddKraPending; loading: isAddKraPending | No inline handler declared; may submit a form or delegate to a component — [PerformanceIndividualKra.jsx:1112](../../client/src/pages/Performance/DepartmentDetails/PerformanceIndividualKra.jsx#L1112) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isSuperOrMasterAdmin**, line 113: `roleTitles.some((roleTitle) => roleTitle?.includes("super admin")) \|\| roleTitles.some((roleTitle) => roleTitle?.includes("master admin"))`
- **roleTitles**, line 110: `auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) \|\| []`
- **auth**, line 35: `useAuth()`
- **isCurrentDateView**, line 161: `selectedDateKey === todayKey`
- **selectedDateKey**, line 159: `selectedDate.format("YYYY-MM-DD")`
- **selectedDate**, line 42: `useState(dayjs().startOf("day"))`
- **isFutureDateView**, line 163: `selectedDateKey > todayKey`
- **selectedMemberCanManageView**, line 127: `isManager \|\| isSuperOrMasterAdmin`
- **isManager**, line 112: `userPermissions.includes(PERMISSIONS.PERFORMANCE_DAILY_KRA.value)`
- **userPermissions**, line 109: `auth?.user?.permissions?.permissions \|\| []`
- **canShowControls**, line 164: `shouldForceOwnControlsInEmployeeRoute \|\| isCurrentDateView \|\| selectedMemberCanManageView \|\| (!isSelectedMemberEmployee && (selectedMemberCanManageView \|\| !activeMember?.memberId \|\| isViewingOwnMember))`
- **isSelectedMemberEmployee**, line 130: `!!activeMember?.memberId && !isSelectedMemberManager`
- **isAddKraDisabled**, line 90: `auth?.user?.role?.some((role) => restrictedRoles.includes(role.roleTitle) )`
- **canDeleteRecurrence**, line 94: `!isAddKraDisabled`
- **params**, line 650: `params`
- **selectedKra**, line 74: `useState(null)`
- **isUpdatePending**, line 366: `useMutation({ mutationKey: ["updateDailyKra"], mutationFn: async (data) => { const response = await axios.patch( '/api/performance/update-status/${data.taskId}/KRA', { comment: data.comment } ); return response.data; }, onSuccess: (data, variables) => { const removeCompletedTaskFromList = (oldData = []) => (oldData \|\| []).filter((item) => { const rowId = item?.id \|\| item?._id; return rowId?.toString?.() !== variables?.taskId?.toString?.(); }); // Remove immediately from all visible pending sources so row disappears without refresh. queryClient.setQueryData(individualKraQueryKey, removeCompletedTaskFromList); queryClient.setQueryData( ["fetchedTeamKRAForIndividual", effectiveDeptId, selectedDateKey], removeCompletedTaskFromList ); queryClient.setQueryData(teamKraQueryKey, removeCompletedTas…`
- **isAddKraPending**, line 260: `useMutation({ mutationKey: ["addDailyKra"], mutationFn: async (data) => { const response = await axios.post("/api/performance/create-task", { task: data.individualDailyKra, // Fixed field name taskType: data.taskType \|\| "INDIVIDUALKRA", // description: data.description, department: effectiveDeptId, assignedDate: data.assignedDate, assignTo: data.assignTo, }); return response.data; }, onSuccess: (data, variables) => { const createdTasks = Array.isArray(data?.data) ? data.data : data?.data ? [data.data] : []; if (createdTasks.length > 0) { const normalizeCreatedTask = (task) => ({ id: task?._id \|\| task?.id, taskName: task?.task \|\| task?.taskName \|\| variables?.individualDailyKra \|\| "", assignedDate: task?.assignedDate \|\| variables?.assignedDate \|\| null, dueDate: task?.dueDate \|\| task?.assigne…`

## pages/Performance/DepartmentDetails/PerformanceKra.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/department-KPA/member-wise-KPA/daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/:overallType/:memberWiseType/daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/department-KRA/member-wise-KRA/daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/assign-KRA-KPA/daily-KRA — `<ProtectedDepartmentRoute allowHrForPerformance={true} allowAdminForPerformance={true} element={<DepartmentPerformanceLayout />} />`
- /app/performance/employee-KRA-KPA/daily-KRA — `<PerformancePermissionRoute permissions={[PERMISSIONS.PERFORMANCE_EMPLOYEE_KRA_KPA]} element={<EmployeePerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_EMPLOYEE_DEPARTMENT_DAILY_KRA, ]} element={<PerformanceKra />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { if (!rowCanMarkDone \|\| !isRowSelected \|\| isUpdatePending \|\| isDeletePending) return; openMarkDoneModal(params.data); } (clickable action) | showMarkAsDone AND (isSuperOrMasterAdmin \|\| !isPastDateView) && canShowControls && !shouldHideActionsForEmployeeFuture && !shouldHideManagerControlsForSelectedMemberView | No local disabled condition detected | () => { if (!rowCanMarkDone \|\| !isRowSelected \|\| isUpdatePending \|\| isDeletePending) return; openMarkDoneModal(params.data); } — [PerformanceKra.jsx:422](../../client/src/pages/Performance/DepartmentDetails/PerformanceKra.jsx#L422) |
| isUpdatePending ? "⏳" : "Mark As Done" (button) | showMarkAsDone AND (isSuperOrMasterAdmin \|\| !isPastDateView) && canShowControls && !shouldHideActionsForEmployeeFuture && !shouldHideManagerControlsForSelectedMemberView | !rowCanMarkDone \|\| !isRowSelected \|\| isUpdatePending \|\| isDeletePending | No inline handler declared; may submit a form or delegate to a component — [PerformanceKra.jsx:431](../../client/src/pages/Performance/DepartmentDetails/PerformanceKra.jsx#L431) |
| Edit (button) | !isAddKraDisabled AND (isSuperOrMasterAdmin \|\| !isPastDateView) && canShowControls && !shouldHideActionsForEmployeeFuture && !shouldHideManagerControlsForSelectedMemberView | !isRowSelected \|\| !rowCanEditDelete \|\| isUpdatePending \|\| isDeletePending | () => { if (!isRowSelected \|\| !rowCanEditDelete) return; handleOpenEditModal(params.data); } — [PerformanceKra.jsx:448](../../client/src/pages/Performance/DepartmentDetails/PerformanceKra.jsx#L448) |
| Delete Recurrence (button) | canDeleteRecurrence AND (isSuperOrMasterAdmin \|\| !isPastDateView) && canShowControls && !shouldHideActionsForEmployeeFuture && !shouldHideManagerControlsForSelectedMemberView | !isRowSelected \|\| !rowCanEditDelete \|\| isDeletePending \|\| isUpdatePending | () => { if (!isRowSelected \|\| !rowCanEditDelete) return; setDeleteTargetId(params.data.id \|\| params.data._id); } — [PerformanceKra.jsx:474](../../client/src/pages/Performance/DepartmentDetails/PerformanceKra.jsx#L474) |
| View Completed KRA (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setCompletedTaskView(params.data) — [PerformanceKra.jsx:520](../../client/src/pages/Performance/DepartmentDetails/PerformanceKra.jsx#L520) |
| canShowAddDepartmentKraButton ? "Add Department Daily KRA" : undefined (table-generated action) | !departmentLoading | isAddKraDisabled \|\| !canShowControls \|\| !canShowAddDepartmentKraButton | handleOpenAddModal — [PerformanceKra.jsx:666](../../client/src/pages/Performance/DepartmentDetails/PerformanceKra.jsx#L666) |
| Advanced filter (table-generated utility) | !departmentLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceKra.jsx:666](../../client/src/pages/Performance/DepartmentDetails/PerformanceKra.jsx#L666) |
| Export (table-generated utility) | !departmentLoading; exportData: !isFutureDateView | No local disabled condition detected | Shared table export — [PerformanceKra.jsx:731](../../client/src/pages/Performance/DepartmentDetails/PerformanceKra.jsx#L731) |
| Advanced filter (table-generated utility) | !departmentLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceKra.jsx:731](../../client/src/pages/Performance/DepartmentDetails/PerformanceKra.jsx#L731) |
| Mark as Done (button) | selectedKra | isUpdatePending; loading: isUpdatePending | handleMarkAsDoneWithComment — [PerformanceKra.jsx:812](../../client/src/pages/Performance/DepartmentDetails/PerformanceKra.jsx#L812) |
| Cancel (button) | selectedKra | isUpdatePending | () => { setOpenModal(false); setSelectedKra(null); completionCommentRef.current = ""; setCompletionCommentError(""); } — [PerformanceKra.jsx:818](../../client/src/pages/Performance/DepartmentDetails/PerformanceKra.jsx#L818) |
| Submit (button) | NOT (selectedKra) | isAddKraPending; loading: isAddKraPending | No inline handler declared; may submit a form or delegate to a component — [PerformanceKra.jsx:898](../../client/src/pages/Performance/DepartmentDetails/PerformanceKra.jsx#L898) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isSuperOrMasterAdmin**, line 130: `roleTitles.some((roleTitle) => roleTitle?.includes("super admin")) \|\| roleTitles.some((roleTitle) => roleTitle?.includes("master admin"))`
- **roleTitles**, line 105: `auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) \|\| []`
- **auth**, line 34: `useAuth()`
- **isPastDateView**, line 147: `selectedDateKey < todayKey`
- **selectedDateKey**, line 144: `selectedDate.format("YYYY-MM-DD")`
- **selectedDate**, line 68: `useState(dayjs().startOf("day"))`
- **canShowControls**, line 149: `true`
- **isRowSelected**, line 413: `!!params?.node?.selected`
- **params**, line 409: `params`
- **isUpdatePending**, line 271: `useMutation({ mutationKey: ["updateDailyKra"], mutationFn: async (data) => { const response = await axios.patch( '/api/performance/update-status/${data.taskId}/KRA', { comment: data.comment } ); return response.data; }, onSuccess: (data, variables) => { queryClient.setQueriesData( { queryKey: ["fetchedDepartmentsKRA", effectiveDeptId] }, (oldData = []) => (oldData \|\| []).filter((item) => { const rowId = item?.id \|\| item?._id; return rowId?.toString?.() !== variables?.taskId?.toString?.(); }) ); queryClient.invalidateQueries({ queryKey: ["fetchedDepartmentsKRA", effectiveDeptId] }); queryClient.invalidateQueries({ queryKey: ["completedEntries", effectiveDeptId] }); toast.success(data.message \|\| "KRA updated"); completionCommentRef.current = ""; setCompletionCommentError(""); setSelectedKra(…`
- **isDeletePending**, line 182: `useMutation({ mutationKey: ["deleteDailyKraRecurrence"], mutationFn: async (taskId) => { const response = await axios.patch('/api/performance/delete-recurrence/${taskId}'); return response.data; }, onSuccess: (data) => { queryClient.refetchQueries({ queryKey: ["fetchedDepartmentsKRA", effectiveDeptId] }); queryClient.refetchQueries({ queryKey: ["completedEntries", effectiveDeptId] }); toast.success(data.message \|\| "KRA recurrence removed"); }, onError: () => { toast.error("Failed to remove recurrence"); }, })`
- **isAddKraDisabled**, line 83: `auth?.user?.role?.some((role) => restrictedRoles.includes(role.roleTitle) )`
- **canDeleteRecurrence**, line 87: `!isAddKraDisabled`
- **params**, line 519: `params`
- **canShowAddDepartmentKraButton**, line 648: `isEmployeeKraKpaRoute ? isSuperOrMasterAdmin \|\| isManager : isSuperOrMasterAdmin \|\| isCurrentDateView`
- **isEmployeeKraKpaRoute**, line 48: `location.pathname.includes("/employee-KRA-KPA")`
- **isManager**, line 107: `userPermissions.includes(PERMISSIONS.PERFORMANCE_DAILY_KRA.value)`
- **userPermissions**, line 104: `auth?.user?.permissions?.permissions \|\| []`
- **isCurrentDateView**, line 146: `selectedDateKey === todayKey`
- **selectedKra**, line 64: `useState(null)`
- **isAddKraPending**, line 205: `useMutation({ mutationKey: ["addDailyKra"], mutationFn: async (data) => { const response = await axios.post("/api/performance/create-task", { task: data.dailyKra, taskType: "KRA", // description: data.description, department: effectiveDeptId, assignedDate: data.assignedDate, }); return response.data; }, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["fetchedDepartmentsKRA", effectiveDeptId] }); queryClient.refetchQueries({ queryKey: ["fetchedDepartmentsKRA", effectiveDeptId] }); toast.success(data.message \|\| "KRA Added"); reset(); setOpenModal(false); setIsEditMode(false); setEditingTaskId(null); }, onError: (error) => { toast.error("Adding failed"); // toast.error(error.message \|\| "Error Adding KRA"); }, })`

## pages/Performance/DepartmentDetails/PerformanceMonthly.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/department-KPA/member-wise-KPA/monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/:overallType/:memberWiseType/monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/department-KRA/member-wise-KRA/monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/assign-KRA-KPA/monthly-KPA — `<ProtectedDepartmentRoute allowHrForPerformance={true} allowAdminForPerformance={true} element={<DepartmentPerformanceLayout />} />`
- /app/performance/employee-KRA-KPA/monthly-KPA — `<PerformancePermissionRoute permissions={[PERMISSIONS.PERFORMANCE_EMPLOYEE_KRA_KPA]} element={<EmployeePerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_EMPLOYEE_DEPARTMENT_MONTHLY_KPA, ]} element={<PerformanceMonthly />} />`
- /app/tasks/department-tasks/:department/monthly-KPA — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { if ( // !params.node.selected \|\| !isRowSelected \|\| isUpdatePending \|\| isDeletePending ) return; openMarkDoneModal(params.data); } (clickable action) | rowPermissions.showMarkAsDone AND showActionsColumn | No local disabled condition detected | () => { if ( // !params.node.selected \|\| !isRowSelected \|\| isUpdatePending \|\| isDeletePending ) return; openMarkDoneModal(params.data); } — [PerformanceMonthly.jsx:488](../../client/src/pages/Performance/DepartmentDetails/PerformanceMonthly.jsx#L488) |
| isUpdatePending ? "⏳" : "Mark As Done" (button) | rowPermissions.showMarkAsDone AND showActionsColumn | !isRowSelected \|\| // !params.node.selected \|\| isUpdatePending \|\| isDeletePending | No inline handler declared; may submit a form or delegate to a component — [PerformanceMonthly.jsx:503](../../client/src/pages/Performance/DepartmentDetails/PerformanceMonthly.jsx#L503) |
| Edit (button) | rowPermissions.showEdit && !isAddKpaDisabled AND showActionsColumn | !isRowSelected \|\| isUpdatePending \|\| isDeletePending | () => handleOpenEditModal(params.data) — [PerformanceMonthly.jsx:519](../../client/src/pages/Performance/DepartmentDetails/PerformanceMonthly.jsx#L519) |
| Delete Recurrence (button) | rowPermissions.showDelete && canDeleteRecurrence AND showActionsColumn | !isRowSelected \|\| // !params.node.selected \|\| isDeletePending \|\| isUpdatePending | () => setDeleteTargetId(params.data.mongoId) — [PerformanceMonthly.jsx:543](../../client/src/pages/Performance/DepartmentDetails/PerformanceMonthly.jsx#L543) |
| View Completed KPA (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setCompletedTaskView(params.data) — [PerformanceMonthly.jsx:585](../../client/src/pages/Performance/DepartmentDetails/PerformanceMonthly.jsx#L585) |
| shouldHideAddButtonForManager ? "" : "Add Department Monthly KPA" (table-generated action) | !isCompletedLoading && !isUpdatePending | shouldHideAddButtonForManager \|\| isAddKpaDisabled | () => { setIsEditMode(false); setEditingTaskId(null); setOpenModal(true); } — [PerformanceMonthly.jsx:723](../../client/src/pages/Performance/DepartmentDetails/PerformanceMonthly.jsx#L723) |
| Advanced filter (table-generated utility) | !isCompletedLoading && !isUpdatePending; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceMonthly.jsx:723](../../client/src/pages/Performance/DepartmentDetails/PerformanceMonthly.jsx#L723) |
| Export (table-generated utility) | !isCompletedLoading; exportData: showCompletedExport | No local disabled condition detected | Shared table export — [PerformanceMonthly.jsx:767](../../client/src/pages/Performance/DepartmentDetails/PerformanceMonthly.jsx#L767) |
| Advanced filter (table-generated utility) | !isCompletedLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceMonthly.jsx:767](../../client/src/pages/Performance/DepartmentDetails/PerformanceMonthly.jsx#L767) |
| Mark as Done (button) | selectedKpa | isUpdatePending; loading: isUpdatePending | handleMarkAsDoneWithComment — [PerformanceMonthly.jsx:845](../../client/src/pages/Performance/DepartmentDetails/PerformanceMonthly.jsx#L845) |
| Cancel (button) | selectedKpa | isUpdatePending | () => { setSelectedKpa(null); completionCommentRef.current = ""; setCompletionCommentError(""); setOpenModal(false); } — [PerformanceMonthly.jsx:851](../../client/src/pages/Performance/DepartmentDetails/PerformanceMonthly.jsx#L851) |
| Submit (button) | NOT (selectedKpa) | isAddKpaPending; loading: isAddKpaPending | No inline handler declared; may submit a form or delegate to a component — [PerformanceMonthly.jsx:985](../../client/src/pages/Performance/DepartmentDetails/PerformanceMonthly.jsx#L985) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isRowSelected**, line 481: `params.node.selected && !isSelectionBlocked`
- **params**, line 478: `params`
- **isSelectionBlocked**, line 480: `rowPermissions.disableRowSelection`
- **isUpdatePending**, line 325: `useMutation({ mutationKey: ["updateMonthlyKpa"], mutationFn: async (data) => { const response = await axios.patch( '/api/performance/update-status/${data.taskId}/KPA', { comment: data.comment } ); return response.data; }, onSuccess: (data) => { queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] }); queryClient.refetchQueries({ queryKey: ["completedEntriesKPA"] }); queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA"] }); queryClient.invalidateQueries({ queryKey: ["completedEntriesKPA"] }); toast.success(data.message \|\| "KPA updated"); setSelectedKpa(null); completionCommentRef.current = ""; setCompletionCommentError(""); setOpenModal(false); }, onError: (error) => { // toast.success("KPA updated"); toast.error(error.message \|\| "Error Updating"); }, })`
- **isDeletePending**, line 373: `useMutation({ mutationKey: ["deleteMonthlyKpaRecurrence"], mutationFn: async (taskId) => { const response = await axios.patch('/api/performance/delete-recurrence/${taskId}'); return response.data; }, onSuccess: (data) => { queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] }); queryClient.refetchQueries({ queryKey: ["completedEntriesKPA"] }); toast.success(data.message \|\| "KPA recurrence removed"); }, onError: () => { toast.error("Failed to remove recurrence"); }, })`
- **isAddKpaDisabled**, line 126: `auth?.user?.role?.some((role) => restrictedRoles.includes(role.roleTitle) )`
- **auth**, line 38: `useAuth()`
- **canDeleteRecurrence**, line 135: `!isAddKpaDisabled`
- **params**, line 584: `params`
- **isCompletedLoading**, line 409: `useQuery({ queryKey: ["completedEntriesKPA", effectiveDeptId], queryFn: async () => { try { const response = await axios.get( '/api/performance/get-completed-tasks?dept=${effectiveDeptId}&type=KPA' ); return response.data; } catch (error) { console.error(error); } }, })`
- **selectedKpa**, line 45: `useState(null)`
- **isAddKpaPending**, line 245: `useMutation({ mutationKey: ["addMonthlyKpa"], mutationFn: async (data) => { const response = await axios.post("/api/performance/create-task", { task: data.kpaName, taskType: "KPA", // description: data.description, // department: deptId, department: effectiveDeptId, assignedDate: data.startDate, dueDate: data.endDate, kpaDuration: "Monthly", }); return response.data; }, onSuccess: (data) => { queryClient.refetchQueries({ queryKey: ["fetchedMonthlyKPA"] }); queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKPA"] }); toast.success(data.message \|\| "KPA Added"); reset(); reset(); setOpenModal(false); setIsEditMode(false); setEditingTaskId(null); }, onError: (error) => { queryClient.invalidateQueries({ queryKey: ["fetchedMonthlyKra"] }); queryClient.refetchQueries({ queryKey: ["fetchedM…`

## pages/Performance/DepartmentDetails/PerformanceTeamKpa.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/department-KPA/member-wise-KPA/team-Monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/:overallType/:memberWiseType/team-Monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/department-KRA/member-wise-KRA/team-Monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/assign-KRA-KPA/team-Monthly-KPA — `<ProtectedDepartmentRoute allowHrForPerformance={true} allowAdminForPerformance={true} element={<DepartmentPerformanceLayout />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Edit (button) | getRowPermissions(params.data).showEdit AND showActionsColumn | No local disabled condition detected | () => handleOpenEditModal(params.data) — [PerformanceTeamKpa.jsx:443](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKpa.jsx#L443) |
| Delete Recurrence (button) | canDeleteRecurrence && getRowPermissions(params.data).showDelete AND showActionsColumn | No local disabled condition detected | () => setDeleteTargetId(params.data.id) — [PerformanceTeamKpa.jsx:454](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKpa.jsx#L454) |
| shouldHideAddButtonForManager ? "" : "Add Team Monthly KPA" (table-generated action) | !teamLoading | shouldHideAddButtonForManager \|\| isAddKpaDisabled | () => setOpenModal(true) — [PerformanceTeamKpa.jsx:567](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKpa.jsx#L567) |
| Advanced filter (table-generated utility) | !teamLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceTeamKpa.jsx:567](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKpa.jsx#L567) |
| Export (table-generated utility) | !isCompletedLoading; exportData: showCompletedExport | No local disabled condition detected | Shared table export — [PerformanceTeamKpa.jsx:602](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKpa.jsx#L602) |
| Advanced filter (table-generated utility) | !isCompletedLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceTeamKpa.jsx:602](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKpa.jsx#L602) |
| Submit (button) | No local render guard detected; page/API access still applies | isAddKpaPending; loading: isAddKpaPending | No inline handler declared; may submit a form or delegate to a component — [PerformanceTeamKpa.jsx:806](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKpa.jsx#L806) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 439: `params`
- **canDeleteRecurrence**, line 109: `!isAddKpaDisabled`
- **isAddKpaDisabled**, line 105: `auth?.user?.role?.some((role) => restrictedRoles.includes(role.roleTitle) )`
- **auth**, line 33: `useAuth()`
- **isCompletedLoading**, line 255: `useQuery({ queryKey: ["completedEntriesKPA", deptId], queryFn: async () => { try { const response = await axios.get( '/api/performance/get-completed-tasks?dept=${deptId}&type=TEAMKPA', ); return response.data; } catch (error) { console.error(error); } }, })`
- **isAddKpaPending**, line 229: `useMutation({ mutationKey: ["addTeamMonthlyKpa"], mutationFn: async (data) => { const response = await axios.post("/api/performance/create-task", { task: data.teamKpaName, taskType: "TEAMKPA", department: deptId, assignedDate: data.startDate, dueDate: data.endDate, kpaDuration: "Monthly", assignTo: data.assignTo, }); return response.data; }, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["fetchedTeamKPA", deptId] }); toast.success(data.message \|\| "Team KPA Added"); reset(); setOpenModal(false); setIsEditMode(false); setEditingTaskId(null); }, onError: (error) => { toast.error("Task type should be KRA"); }, })`

## pages/Performance/DepartmentDetails/PerformanceTeamKra.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/department-KPA/member-wise-KPA/team-Daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/:overallType/:memberWiseType/team-Daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/department-KRA/member-wise-KRA/team-Daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_DAILY_KRA, PERMISSIONS.PERFORMANCE_MONTHLY_KPA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA, PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA, PERMISSIONS.PERFORMANCE_TEAM_KRA, PERMISSIONS.PERFORMANCE_TEAM_KPA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`
- /app/performance/assign-KRA-KPA/team-Daily-KRA — `<ProtectedDepartmentRoute allowHrForPerformance={true} allowAdminForPerformance={true} element={<DepartmentPerformanceLayout />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Edit (button) | canShowControls && (!isPastDateView \|\| isSuperOrMasterAdmin) | !params.data?.canEditDeleteRow \|\| isDeletePending | () => { if (!params.data?.canEditDeleteRow) return; handleOpenEditModal(params.data); } — [PerformanceTeamKra.jsx:446](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKra.jsx#L446) |
| Delete Recurrence (button) | canDeleteRecurrence AND canShowControls && (!isPastDateView \|\| isSuperOrMasterAdmin) | !params.data?.canEditDeleteRow \|\| isDeletePending | () => { if (!params.data?.canEditDeleteRow) return; setDeleteTargetId(params.data.id); } — [PerformanceTeamKra.jsx:459](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKra.jsx#L459) |
| isSuperOrMasterAdmin \|\| isCurrentDateView ? "Add Team Daily KRA" : undefined (table-generated action) | !teamLoading | isAddKraDisabled \|\| !canShowControls \|\| (!isSuperOrMasterAdmin && (isEmployeeLevel \|\| !isCurrentDateView)) | () => setOpenModal(true) — [PerformanceTeamKra.jsx:581](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKra.jsx#L581) |
| Advanced filter (table-generated utility) | !teamLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceTeamKra.jsx:581](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKra.jsx#L581) |
| Export (table-generated utility) | !isCompletedLoading; exportData: !isFutureDateView | No local disabled condition detected | Shared table export — [PerformanceTeamKra.jsx:637](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKra.jsx#L637) |
| Advanced filter (table-generated utility) | !isCompletedLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceTeamKra.jsx:637](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKra.jsx#L637) |
| Submit (button) | No local render guard detected; page/API access still applies | isAddKraPending; loading: isAddKraPending | No inline handler declared; may submit a form or delegate to a component — [PerformanceTeamKra.jsx:783](../../client/src/pages/Performance/DepartmentDetails/PerformanceTeamKra.jsx#L783) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **canShowControls**, line 125: `shouldForceOwnControlsInEmployeeRoute \|\| isCurrentDateView \|\| canManageSelectedMemberView \|\| !activeMember?.memberId \|\| isViewingOwnMember`
- **isCurrentDateView**, line 122: `selectedDateKey === todayKey`
- **selectedDateKey**, line 120: `selectedDate.format("YYYY-MM-DD")`
- **selectedDate**, line 39: `useState(dayjs().startOf("day"))`
- **canManageSelectedMemberView**, line 118: `isSuperOrMasterAdmin \|\| isManager`
- **isSuperOrMasterAdmin**, line 106: `roleTitles.some((roleTitle) => roleTitle?.includes("super admin")) \|\| roleTitles.some((roleTitle) => roleTitle?.includes("master admin"))`
- **roleTitles**, line 104: `auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) \|\| []`
- **isManager**, line 110: `userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KRA.value)`
- **userPermissions**, line 109: `auth?.user?.permissions?.permissions \|\| []`
- **isViewingOwnMember**, line 111: `normalizeValue(activeMember?.memberId) === normalizeValue(userId) \|\| normalizeValue(activeMember?.memberName) === normalizeValue(loggedInUserName)`
- **userId**, line 61: `auth.user._id`
- **auth**, line 32: `useAuth()`
- **canDeleteRecurrence**, line 174: `!isAddKraDisabled`
- **isAddKraDisabled**, line 170: `auth?.user?.role?.some((role) => restrictedRoles.includes(role.roleTitle) )`
- **isCompletedLoading**, line 250: `useQuery({ queryKey: ["completedEntriesKPA", deptId], queryFn: async () => { try { const response = await axios.get( '/api/performance/get-completed-tasks?dept=${deptId}&type=TEAMKRA', ); return response.data; } catch (error) { console.error(error); } }, })`
- **isAddKraPending**, line 226: `useMutation({ mutationKey: ["addTeamDailyKra"], mutationFn: async (data) => { const response = await axios.post("/api/performance/create-task", { task: data.teamDailyKra, taskType: "TEAMKRA", department: deptId, assignedDate: data.assignedDate, assignTo: data.assignTo, }); return response.data; }, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["fetchedTeamKRA", deptId] }); toast.success(data.message \|\| "Team KPA Added"); reset(); setOpenModal(false); setIsEditMode(false); setEditingTaskId(null); }, onError: (error) => { toast.error("Adding failed"); }, })`

## pages/Performance/KraKpaDailyLogs.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/kra-kpa/individual/kra-kpa/daily-logs — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="kra-kpa" showPendingApprovals /> } />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_SELF_KRA]} element={<KraKpaDailyLogs />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard/kra-kpa/daily-logs — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="kra-kpa" basePath="/app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard/kra-kpa" /> } />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_SELF_KRA]} element={<KraKpaDailyLogs />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/daily-logs — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_SELF_KRA]} element={<KraKpaDailyLogs />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| 'View edit history for ${data.dayTaskName}' (button) | No local render guard detected; page/API access still applies | disabled | () => onHistory(data) — [KraKpaDailyLogs.jsx:66](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L66) |
| Mark As Done (button) | canComplete | disabled | () => onAction("complete", data) — [KraKpaDailyLogs.jsx:70](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L70) |
| 'Edit ${data.dayTaskName}' (button) | canEdit | disabled | () => onEdit(data) — [KraKpaDailyLogs.jsx:79](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L79) |
| 'Delete ${data.dayTaskName}' (button) | canDelete | disabled | () => onAction("delete", data) — [KraKpaDailyLogs.jsx:91](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L91) |
| Icon/action: () => setViewRecord(data) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setViewRecord(data) — [KraKpaDailyLogs.jsx:459](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L459) |
| 'View edit history for ${data.dayTaskName}' (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setHistoryRecord(data) — [KraKpaDailyLogs.jsx:560](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L560) |
| Export (table-generated utility) | NOT (isLoading); exportData: true | No local disabled condition detected | Shared table export — [KraKpaDailyLogs.jsx:582](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L582) |
| Advanced filter (table-generated utility) | NOT (isLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [KraKpaDailyLogs.jsx:582](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L582) |
| Add Daily Log (button) | canAddDailyLog AND NOT (isLoading) | No local disabled condition detected | openCreate — [KraKpaDailyLogs.jsx:584](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L584) |
| Previous day (button) | NOT (isLoading) | No local disabled condition detected | () => setSelectedDate(date => date.subtract(1, "day")) — [KraKpaDailyLogs.jsx:590](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L590) |
| Next day (button) | NOT (isLoading) | No local disabled condition detected | () => setSelectedDate(date => date.add(1, "day")) — [KraKpaDailyLogs.jsx:623](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L623) |
| Export (table-generated utility) | NOT (isLoading); exportData: true | No local disabled condition detected | Shared table export — [KraKpaDailyLogs.jsx:657](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L657) |
| Advanced filter (table-generated utility) | NOT (isLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [KraKpaDailyLogs.jsx:657](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L657) |
| Close (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setModalOpen(false) — [KraKpaDailyLogs.jsx:932](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L932) |
| Save (button) | No local render guard detected; page/API access still applies | loading: saveLog.isPending | No inline handler declared; may submit a form or delegate to a component — [KraKpaDailyLogs.jsx:937](../../client/src/pages/Performance/KraKpaDailyLogs.jsx#L937) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **data**, line 42: `{ data, node, onEdit, onHistory, onAction, canComplete, canEdit, canDelete, isPending, }`
- **canComplete**, line 42: `{ data, node, onEdit, onHistory, onAction, canComplete, canEdit, canDelete, isPending, }`
- **canEdit**, line 42: `{ data, node, onEdit, onHistory, onAction, canComplete, canEdit, canDelete, isPending, }`
- **canDelete**, line 42: `{ data, node, onEdit, onHistory, onAction, canComplete, canEdit, canDelete, isPending, }`
- **data**, line 458: `{ data, value }`
- **data**, line 558: `{ data }`
- **isLoading**, line 175: `useQuery({ queryKey: [ "kraKpaDailyLogs", departmentId, employeeId, selectedDate.format("YYYY-MM-DD"), ], enabled: Boolean(departmentId && employeeId), queryFn: async () => { const response = await axios.get("/api/kra-kpa/daily-log", { params: { department: departmentId, employee: employeeId, date: selectedDate.format("YYYY-MM-DD"), }, }); return response.data \|\| []; }, })`
- **selectedDate**, line 158: `useState(() => dayjs().startOf("day"))`
- **canAddDailyLog**, line 157: `isOwnPage \|\| canManageOthers`
- **isOwnPage**, line 154: `String(employeeId) === String(auth?.user?._id)`
- **auth**, line 110: `useAuth()`
- **canManageOthers**, line 146: `roleTitles.some( (role) => role.includes("manager") \|\| role.endsWith("admin") \|\| /^hr(?:\s\|$)/.test(role) \|\| role === "top management", )`
- **roleTitles**, line 144: `auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) \|\| []`

## pages/Performance/KraKpaDueTask.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/kra-kpa/individual/kra-kpa/due-task — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="kra-kpa" showPendingApprovals /> } />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_SELF_KRA]} element={<KraKpaDueTask />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard/kra-kpa/due-task — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="kra-kpa" basePath="/app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard/kra-kpa" /> } />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_SELF_KRA]} element={<KraKpaDueTask />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/due-task — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_SELF_KRA]} element={<KraKpaDueTask />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| 'View edit history for ${data.dueTaskName}' (button) | No local render guard detected; page/API access still applies | disabled | () => onHistory(data) — [KraKpaDueTask.jsx:80](../../client/src/pages/Performance/KraKpaDueTask.jsx#L80) |
| 'Edit ${data.dueTaskName}' (button) | data.status !== "Closed" && canEdit | disabled | () => onEdit(data) — [KraKpaDueTask.jsx:84](../../client/src/pages/Performance/KraKpaDueTask.jsx#L84) |
| 'Delete ${data.dueTaskName}' (button) | canDelete | disabled | () => onAction("delete", data) — [KraKpaDueTask.jsx:96](../../client/src/pages/Performance/KraKpaDueTask.jsx#L96) |
| Icon/action: () => setViewRecord(data) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setViewRecord(data) — [KraKpaDueTask.jsx:539](../../client/src/pages/Performance/KraKpaDueTask.jsx#L539) |
| Export (table-generated utility) | NOT (isLoading); exportData: true | No local disabled condition detected | Shared table export — [KraKpaDueTask.jsx:646](../../client/src/pages/Performance/KraKpaDueTask.jsx#L646) |
| Advanced filter (table-generated utility) | NOT (isLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [KraKpaDueTask.jsx:646](../../client/src/pages/Performance/KraKpaDueTask.jsx#L646) |
| Add Due Task (button) | canAdd AND NOT (isLoading) | No local disabled condition detected | openCreate — [KraKpaDueTask.jsx:648](../../client/src/pages/Performance/KraKpaDueTask.jsx#L648) |
| Select date range (button) | NOT (isLoading) | No local disabled condition detected | event => setCalendarAnchor(event.currentTarget) — [KraKpaDueTask.jsx:659](../../client/src/pages/Performance/KraKpaDueTask.jsx#L659) |
| 'Add Daily Logs (${selectedDueTasks.length})' (button) | NOT (isLoading) | !canAddSelectedTasks \|\| addToDailyLogs.isPending | openAddToDailyLogs — [KraKpaDueTask.jsx:686](../../client/src/pages/Performance/KraKpaDueTask.jsx#L686) |
| 'Remove ${record.dueTaskName}' (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setDailyLogTargets((current) => current.filter((item) => item._id !== record._id), ) — [KraKpaDueTask.jsx:803](../../client/src/pages/Performance/KraKpaDueTask.jsx#L803) |
| Cancel (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setDailyLogTargets([]) — [KraKpaDueTask.jsx:845](../../client/src/pages/Performance/KraKpaDueTask.jsx#L845) |
| Add Daily Logs (button) | No local render guard detected; page/API access still applies | loading: addToDailyLogs.isPending | No inline handler declared; may submit a form or delegate to a component — [KraKpaDueTask.jsx:850](../../client/src/pages/Performance/KraKpaDueTask.jsx#L850) |
| Close (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setModalOpen(false) — [KraKpaDueTask.jsx:1047](../../client/src/pages/Performance/KraKpaDueTask.jsx#L1047) |
| Save (button) | No local render guard detected; page/API access still applies | loading: saveTask.isPending | No inline handler declared; may submit a form or delegate to a component — [KraKpaDueTask.jsx:1052](../../client/src/pages/Performance/KraKpaDueTask.jsx#L1052) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **data**, line 57: `{ data, node, onEdit, onHistory, onAction, canEdit, canDelete, isPending, }`
- **canDelete**, line 57: `{ data, node, onEdit, onHistory, onAction, canEdit, canDelete, isPending, }`
- **data**, line 538: `{ data, value }`
- **isLoading**, line 180: `useQuery({ queryKey: ["kraKpaDueTask", departmentId, employeeId], enabled: Boolean(departmentId && employeeId), queryFn: async () => { const response = await axios.get("/api/kra-kpa/due-task", { params: { department: departmentId, employee: employeeId }, }); return response.data \|\| []; }, })`
- **canAdd**, line 156: `String(employeeId) === String(auth?.user?._id) \|\| canManageOthers`
- **auth**, line 115: `useAuth()`
- **canManageOthers**, line 149: `roleTitles.some( (role) => role.includes("manager") \|\| role.endsWith("admin") \|\| /^hr(?:\s\|$)/.test(role) \|\| role === "top management", )`
- **roleTitles**, line 147: `auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) \|\| []`
- **canAddSelectedTasks**, line 471: `selectedDueTasks.length > 0 && selectedDueTasks.every(canAddToDailyLogsRecord)`
- **selectedDueTasks**, line 165: `useState([])`
- **canAddToDailyLogsRecord**, line 464: `(record) => !record.isAddedToDailyLogs && record.status !== "Closed" && Boolean(record.deadline && dayjs(record.deadline).isValid()) && !dayjs(record.deadline).isBefore(dayjs(), "day") && (isTaskEmployee(record) \|\| canCloseRecord(record))`
- **isTaskEmployee**, line 457: `(record) => String(record?.employee?._id \|\| record?.employee) === String(auth?.user?._id)`
- **canCloseRecord**, line 462: `(record) => String(record.lead?._id \|\| record.lead) === String(auth?.user?._id)`
- **record**, line 784: `record`

## pages/Performance/KraKpaIndividualMonthlyKpa.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/kra-kpa/individual/kra-kpa/individual-Monthly-KPA — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="kra-kpa" showPendingApprovals /> } />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, ]} element={<KraKpaIndividualMonthlyKpa />} />`
- /app/kra-kpa/individual/kra-kpa/self-KRA — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="kra-kpa" showPendingApprovals /> } />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_SELF_KRA]} element={<KraKpaIndividualMonthlyKpa />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard/kra-kpa/individual-Monthly-KPA — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="kra-kpa" basePath="/app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard/kra-kpa" /> } />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, ]} element={<KraKpaIndividualMonthlyKpa />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard/kra-kpa/self-KRA — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="kra-kpa" basePath="/app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard/kra-kpa" /> } />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_SELF_KRA]} element={<KraKpaIndividualMonthlyKpa />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/individual-Monthly-KPA — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, ]} element={<KraKpaIndividualMonthlyKpa />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/self-KRA — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_SELF_KRA]} element={<KraKpaIndividualMonthlyKpa />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| 'View edit history for ${data.target \|\| data.title \|\| "task"}' (button) | showHistory | !selected \|\| isPending | () => onHistory(data) — [KraKpaIndividualMonthlyKpa.jsx:128](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L128) |
| Mark As Done (button) | data.status !== "Completed" && canComplete | disabled | () => onAction("complete", data) — [KraKpaIndividualMonthlyKpa.jsx:140](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L140) |
| 'Edit ${data.target \|\| data.title \|\| "Self KRA"}' (button) | canEditActions | editDisabled | () => onEdit(data) — [KraKpaIndividualMonthlyKpa.jsx:149](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L149) |
| 'Delete ${data.target \|\| data.title \|\| "Self KRA"}' (button) | canDelete | disabled | () => onAction("delete", data) — [KraKpaIndividualMonthlyKpa.jsx:164](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L164) |
| 'View edit history for ${data.title \|\| data.target \|\| "task"}' (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openEditHistory(data) — [KraKpaIndividualMonthlyKpa.jsx:916](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L916) |
| Icon/action: () => setViewRecord(data) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setViewRecord(data) — [KraKpaIndividualMonthlyKpa.jsx:965](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L965) |
| Icon/action: () => setViewRecord(data) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setViewRecord(data) — [KraKpaIndividualMonthlyKpa.jsx:1004](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1004) |
| Icon/action: () => setViewRecord(data) (button) | isSelfKra | No local disabled condition detected | () => setViewRecord(data) — [KraKpaIndividualMonthlyKpa.jsx:1041](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1041) |
| Icon/action: () => setViewRecord(data) (button) | NOT (isSelfKra) | No local disabled condition detected | () => setViewRecord(data) — [KraKpaIndividualMonthlyKpa.jsx:1076](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1076) |
| 'View edit history for ${data.target \|\| "KPA"}' (button) | NOT (isSelfKra) | No local disabled condition detected | () => openEditHistory(data) — [KraKpaIndividualMonthlyKpa.jsx:1111](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1111) |
| Export (table-generated utility) | NOT (isLoading); exportData: true | No local disabled condition detected | Shared table export — [KraKpaIndividualMonthlyKpa.jsx:1200](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1200) |
| Advanced filter (table-generated utility) | NOT (isLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [KraKpaIndividualMonthlyKpa.jsx:1200](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1200) |
| Add Category (button) | canAddKraCategory AND canAddKraKpa \|\| canAddKraCategory AND NOT (isLoading) | No local disabled condition detected | openCategoryModal — [KraKpaIndividualMonthlyKpa.jsx:1203](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1203) |
| isSelfKra ? "Add Self KRA" : "Add Self KPA" (button) | canAddKraKpa AND canAddKraKpa \|\| canAddKraCategory AND NOT (isLoading) | No local disabled condition detected | openCreate — [KraKpaIndividualMonthlyKpa.jsx:1204](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1204) |
| Select date range (button) | !isSelfKra AND NOT (isLoading) | No local disabled condition detected | event => setCalendarAnchor(event.currentTarget) — [KraKpaIndividualMonthlyKpa.jsx:1217](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1217) |
| Previous day (button) | isSelfKra AND NOT (isLoading) | No local disabled condition detected | () => setSelectedSelfKraDate(date => date.subtract(1, "day")) — [KraKpaIndividualMonthlyKpa.jsx:1235](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1235) |
| Next day (button) | isSelfKra AND NOT (isLoading) | No local disabled condition detected | () => setSelectedSelfKraDate(date => date.add(1, "day")) — [KraKpaIndividualMonthlyKpa.jsx:1268](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1268) |
| 'Add to Daily Logs (${selectedSelfKras.length})' (button) | isSelfKra AND NOT (isLoading) | !canScheduleSelectedSelfKras \|\| addSelfKrasToDailyLogs.isPending | openAddSelfKrasToDailyLogs — [KraKpaIndividualMonthlyKpa.jsx:1291](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1291) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [KraKpaIndividualMonthlyKpa.jsx:1314](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1314) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [KraKpaIndividualMonthlyKpa.jsx:1314](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1314) |
| 'Remove ${record.title}' (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setDailyLogTargets((current) => current.filter((item) => item._id !== record._id), ) — [KraKpaIndividualMonthlyKpa.jsx:1370](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1370) |
| Cancel (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setDailyLogTargets([]); setDailyLogDateError(""); } — [KraKpaIndividualMonthlyKpa.jsx:1410](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1410) |
| Add Daily Logs (button) | No local render guard detected; page/API access still applies | addSelfKrasToDailyLogs.isPending; loading: addSelfKrasToDailyLogs.isPending | No inline handler declared; may submit a form or delegate to a component — [KraKpaIndividualMonthlyKpa.jsx:1418](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1418) |
| Select edit history date range (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | (event) => setHistoryCalendarAnchor(event.currentTarget) — [KraKpaIndividualMonthlyKpa.jsx:1648](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1648) |
| Close (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setCategoryModalOpen(false); setCategoryName(""); setCategoryError(""); } — [KraKpaIndividualMonthlyKpa.jsx:1800](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1800) |
| Save (button) | No local render guard detected; page/API access still applies | isLoadingKraCategories \|\| addKraCategory.isPending; loading: addKraCategory.isPending | No inline handler declared; may submit a form or delegate to a component — [KraKpaIndividualMonthlyKpa.jsx:1809](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L1809) |
| Close (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setModalOpen(false); setFormErrors({}); } — [KraKpaIndividualMonthlyKpa.jsx:2168](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L2168) |
| Save (button) | canEdit \|\| canEditReview | saveRecord.isPending; loading: saveRecord.isPending | No inline handler declared; may submit a form or delegate to a component — [KraKpaIndividualMonthlyKpa.jsx:2177](../../client/src/pages/Performance/KraKpaIndividualMonthlyKpa.jsx#L2177) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selected**, line 112: `useState(() => Boolean(node.isSelected()))`
- **isPending**, line 100: `{ data, node, onEdit, onHistory, onAction, isPending, canDelete, canEditActions, canComplete, showHistory, }`
- **data**, line 100: `{ data, node, onEdit, onHistory, onAction, isPending, canDelete, canEditActions, canComplete, showHistory, }`
- **canEditActions**, line 100: `{ data, node, onEdit, onHistory, onAction, isPending, canDelete, canEditActions, canComplete, showHistory, }`
- **canDelete**, line 100: `{ data, node, onEdit, onHistory, onAction, isPending, canDelete, canEditActions, canComplete, showHistory, }`
- **data**, line 914: `{ data }`
- **data**, line 964: `{ data, value }`
- **data**, line 1003: `{ data, value }`
- **isSelfKra**, line 183: `location.pathname.toLowerCase().endsWith("/self-kra")`
- **data**, line 1040: `{ data, value }`
- **data**, line 1075: `{ data, value }`
- **data**, line 1109: `{ data }`
- **isLoading**, line 305: `useQuery({ queryKey: [ isSelfKra ? "kraKpaSelfKra" : "kraKpaIndividualMonthlyKpa", departmentId, employeeId, ...(isSelfKra ? [selectedSelfKraDate.format("YYYY-MM-DD")] : []), ], enabled: Boolean(departmentId && employeeId), queryFn: async () => { const response = await axios.get( isSelfKra ? "/api/kra-kpa/self-kra" : "/api/kra-kpa/individual-monthly-kpa", { params: { department: departmentId, employee: employeeId, ...(isSelfKra && { date: selectedSelfKraDate.format("YYYY-MM-DD"), }), }, }, ); return response.data \|\| []; }, })`
- **selectedSelfKraDate**, line 227: `useState(() => dayjs().startOf("day"), )`
- **canAddKraCategory**, line 282: `isSelfKra`
- **canAddKraKpa**, line 277: `String(employeeId) === String(auth?.user?._id) \|\| isManager \|\| isTopManagement \|\| (isHrUser && !isSelfKra)`
- **auth**, line 184: `useAuth()`
- **isManager**, line 252: `roleTitles.some((role) => role.includes("manager"))`
- **roleTitles**, line 250: `auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) \|\| []`
- **isTopManagement**, line 253: `roleTitles.includes("top management") \|\| auth?.user?.departments?.some( (department) => department?.name?.trim().toLowerCase() === "top management", )`
- **isHrUser**, line 259: `roleTitles.some((role) => /^hr(?:\s\|$)/.test(role))`
- **canScheduleSelectedSelfKras**, line 529: `selectedSelfKras.length > 0 && selectedSelfKras.every(canScheduleSelfKra)`
- **selectedSelfKras**, line 238: `useState([])`
- **canScheduleSelfKra**, line 524: `(record) => record?.isActive !== false && !record?.isScheduled && String(record?.lead?._id \|\| record?.lead \|\| "") === String(auth?.user?._id \|\| "")`
- **record**, line 1354: `record`
- **isLoadingKraCategories**, line 350: `useQuery({ queryKey: ["kraCategories", departmentId], enabled: Boolean(isSelfKra && departmentId), queryFn: async () => { const response = await axios.get("/api/kra-kpa/self-kra-categories", { params: { department: departmentId }, }); return response.data \|\| []; }, })`
- **canEdit**, line 272: `String(employeeId) === String(auth?.user?._id) \|\| canManageOthers \|\| isTopManagement \|\| isHrUser`
- **canManageOthers**, line 266: `roleTitles.some( (role) => role.includes("manager") \|\| role.endsWith("admin") \|\| role === "hr employee", )`
- **canEditReview**, line 400: `Boolean(reviewAccess?.canEditReview)`
- **reviewAccess**, line 387: `useQuery({ queryKey: ["kraKpaIndividualMonthlyKpaReviewAccess", departmentId], enabled: Boolean(departmentId && !isSelfKra), queryFn: async () => { const response = await axios.get( "/api/kra-kpa/individual-monthly-kpa/review-access", { params: { department: departmentId }, }, ); return response.data; }, })`

## pages/Performance/KraKpaPendingApprovals.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/kra-kpa/individual/kra-kpa/pending-approvals — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="kra-kpa" showPendingApprovals /> } />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, ]} element={<KraKpaPendingApprovals />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/member-pending-approvals — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/pending-approvals — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, ]} element={<KraKpaPendingApprovals />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| 'Edit ${data.target}' (button) | No local render guard detected; page/API access still applies | disabled | () => onEdit(data) — [KraKpaPendingApprovals.jsx:49](../../client/src/pages/Performance/KraKpaPendingApprovals.jsx#L49) |
| Approve (button) | No local render guard detected; page/API access still applies | disabled | () => onApprove(data) — [KraKpaPendingApprovals.jsx:59](../../client/src/pages/Performance/KraKpaPendingApprovals.jsx#L59) |
| 'Reject ${data.target}' (button) | No local render guard detected; page/API access still applies | disabled | () => onReject(data) — [KraKpaPendingApprovals.jsx:66](../../client/src/pages/Performance/KraKpaPendingApprovals.jsx#L66) |
| Select date range (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | (event) => setCalendarAnchor(event.currentTarget) — [KraKpaPendingApprovals.jsx:281](../../client/src/pages/Performance/KraKpaPendingApprovals.jsx#L281) |
| Export (table-generated utility) | NOT (isLoading); exportData: true | No local disabled condition detected | Shared table export — [KraKpaPendingApprovals.jsx:310](../../client/src/pages/Performance/KraKpaPendingApprovals.jsx#L310) |
| Advanced filter (table-generated utility) | NOT (isLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [KraKpaPendingApprovals.jsx:310](../../client/src/pages/Performance/KraKpaPendingApprovals.jsx#L310) |
| Cancel (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setEditingRecord(null) — [KraKpaPendingApprovals.jsx:378](../../client/src/pages/Performance/KraKpaPendingApprovals.jsx#L378) |
| Save (button) | No local render guard detected; page/API access still applies | saveKpa.isPending; loading: saveKpa.isPending | No inline handler declared; may submit a form or delegate to a component — [KraKpaPendingApprovals.jsx:383](../../client/src/pages/Performance/KraKpaPendingApprovals.jsx#L383) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **data**, line 38: `{ data, node, onEdit, onApprove, onReject, isPending }`
- **isLoading**, line 115: `useQuery({ queryKey: ["kraKpaPendingApprovals", departmentId, employeeId], enabled: Boolean(departmentId && employeeId), queryFn: async () => { const response = await axios.get( "/api/kra-kpa/individual-monthly-kpa/pending-approvals", { params: { department: departmentId, employee: employeeId } }, ); return response.data \|\| []; }, })`

## pages/Performance/KraKpaRating.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/kra-kpa/individual/daily-score/kpa-rating — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="daily-score" /> } />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, ]} element={<KraKpaRating type="kpa" />} />`
- /app/kra-kpa/individual/daily-score/daily-logs-rating — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="daily-score" /> } />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_SELF_KRA]} element={<KraKpaRating type="daily-logs" />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard/daily-score/kpa-rating — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="daily-score" basePath="/app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard/daily-score" /> } />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, ]} element={<KraKpaRating type="kpa" />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard/daily-score/daily-logs-rating — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={ <KraKpaIndividualLayout section="daily-score" basePath="/app/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard/daily-score" /> } />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_SELF_KRA]} element={<KraKpaRating type="daily-logs" />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/kpa-rating — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, ]} element={<KraKpaRating type="kpa" />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/daily-logs-rating — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[ PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA, PERMISSIONS.KRAKPA_SELF_KRA, ]} mode="any" element={<DepartmentPerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_SELF_KRA]} element={<KraKpaRating type="daily-logs" />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| 'View ${data.metric.toLowerCase()} for ${date.format("DD MMM YYYY")}' (button) | isClickable | No local disabled condition detected | openDrilldown — [KraKpaRating.jsx:404](../../client/src/pages/Performance/KraKpaRating.jsx#L404) |
| Select date range (button) | isKpaRating AND NOT (isLoading) | No local disabled condition detected | (event) => setCalendarAnchor(event.currentTarget) — [KraKpaRating.jsx:621](../../client/src/pages/Performance/KraKpaRating.jsx#L621) |
| Export (table-generated utility) | isKpaRating AND NOT (isLoading); exportData: true | No local disabled condition detected | Shared table export — [KraKpaRating.jsx:647](../../client/src/pages/Performance/KraKpaRating.jsx#L647) |
| Export (table-generated utility) | NOT (isKpaRating) AND NOT (isLoading); exportData: true | No local disabled condition detected | Shared table export — [KraKpaRating.jsx:674](../../client/src/pages/Performance/KraKpaRating.jsx#L674) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isClickable**, line 383: `isTaskCount && Number(value) > 0`
- **isTaskCount**, line 380: `["total", "closed", "carriedForward"].includes( data.metricKey, )`
- **data**, line 372: `{ data, value }`
- **isKpaRating**, line 95: `type === "kpa"`
- **isLoading**, line 103: `useQuery({ queryKey: ["kraKpaRatings", type, departmentId, employeeId], enabled: Boolean(departmentId && employeeId), queryFn: async () => { const response = await axios.get( isKpaRating ? "/api/kra-kpa/individual-monthly-kpa" : "/api/kra-kpa/daily-log", { params: { department: departmentId, employee: employeeId } }, ); return response.data \|\| []; }, })`

## pages/Performance/PerformanceDepartmentKPA.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/overall-department-kpa/department-KPA/:department — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_ANNUAL_KPA_VS_ACHIEVEMENTS, ]} element={<PerformanceDepartmentKPA />} />`
- /app/performance/overall-KPA/department-KPA/:department — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_ANNUAL_KPA_VS_ACHIEVEMENTS, ]} element={<PerformanceDepartmentKPA />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | selectedMonthIndex === 0 | () => { if (selectedMonthIndex > 0) { setSelectedMonthIndex((prev) => prev - 1); } } — [PerformanceDepartmentKPA.jsx:204](../../client/src/pages/Performance/PerformanceDepartmentKPA.jsx#L204) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | selectedMonthIndex === fyMonths.length - 1 | () => { if (selectedMonthIndex < fyMonths.length - 1) { setSelectedMonthIndex((prev) => prev + 1); } } — [PerformanceDepartmentKPA.jsx:216](../../client/src/pages/Performance/PerformanceDepartmentKPA.jsx#L216) |
| Advanced filter (table-generated utility) | NOT (filteredTasks.length === 0); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceDepartmentKPA.jsx:232](../../client/src/pages/Performance/PerformanceDepartmentKPA.jsx#L232) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedMonthIndex**, line 55: `useState( initialMonthIndex !== -1 ? initialMonthIndex : 0 )`

## pages/Performance/PerformanceDepartmentWiseKra.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/department-KRA — `<PerformancePermissionRoute permissions={[ // PERMISSIONS.PERFORMANCE_DEPARTMENT_KRA_CARD, PERMISSIONS.PERFORMANCE_OVERALL_DEPARTMENT_WISE_KRA, ]} // mode="any" element={<PerformanceDepartmentWiseKra />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { openMemberWisePage(params.value, params.data.mongoId); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { openMemberWisePage(params.value, params.data.mongoId); } — [PerformanceDepartmentWiseKra.jsx:358](../../client/src/pages/Performance/PerformanceDepartmentWiseKra.jsx#L358) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | false | () => { const previousDate = parseIsoDate(selectedDate); if (!previousDate) return; previousDate.setDate(previousDate.getDate() - 1); setSelectedDate(toLocalIsoDate(previousDate)); } — [PerformanceDepartmentWiseKra.jsx:413](../../client/src/pages/Performance/PerformanceDepartmentWiseKra.jsx#L413) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | false | () => { const nextDate = parseIsoDate(selectedDate); if (!nextDate) return; nextDate.setDate(nextDate.getDate() + 1); setSelectedDate(toLocalIsoDate(nextDate)); } — [PerformanceDepartmentWiseKra.jsx:428](../../client/src/pages/Performance/PerformanceDepartmentWiseKra.jsx#L428) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 357: `params`
- **selectedDate**, line 62: `useState( clickedDate \|\| toLocalIsoDate(new Date()), )`

## pages/Performance/PerformanceDepartmentWiseKraKpa.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/department-KPA — `<PerformancePermissionRoute permissions={[ // PERMISSIONS.PERFORMANCE_DEPARTMENT_KPA_CARD, PERMISSIONS.PERFORMANCE_OVERALL_DEPARTMENT_WISE_KPA, ]} //mode="any" element={<PerformanceDepartmentWiseKraKpa />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { dispatch(setSelectedDepartment(params.data.mongoId)); dispatch(setSelectedDepartmentName(params.data.department)); navigate( '${modulePath}/department-KPA/member-wi… (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { dispatch(setSelectedDepartment(params.data.mongoId)); dispatch(setSelectedDepartmentName(params.data.department)); navigate( '${modulePath}/department-KPA/member-wise-KPA', // '/app/performance/department-wise/overall-department-KPA/member-wise-KPA', // '/app/performance/overall-department-kpa/member-wise-kra-kpa/${params.value}',… — [PerformanceDepartmentWiseKraKpa.jsx:409](../../client/src/pages/Performance/PerformanceDepartmentWiseKraKpa.jsx#L409) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | false | () => { const prevIndex = currentMonthIndex === 0 ? fiscalMonths.length - 1 : currentMonthIndex - 1; setSelectedMonth(fiscalMonths[prevIndex]); } — [PerformanceDepartmentWiseKraKpa.jsx:468](../../client/src/pages/Performance/PerformanceDepartmentWiseKraKpa.jsx#L468) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | false | () => { const nextIndex = currentMonthIndex === fiscalMonths.length - 1 ? 0 : currentMonthIndex + 1; setSelectedMonth(fiscalMonths[nextIndex]); } — [PerformanceDepartmentWiseKraKpa.jsx:483](../../client/src/pages/Performance/PerformanceDepartmentWiseKraKpa.jsx#L483) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 408: `params`
- **selectedMonth**, line 64: `useState( clickedMonth \|\| getCurrentFiscalMonth(), )`

## pages/Performance/PerformanceMemberWiseKra.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/department-KRA/member-wise-KRA — `<PerformancePermissionRoute permissions={[PERMISSIONS.PERFORMANCE_MEMBER_WISE_KRA]} element={<PerformanceMemberWiseKra />} />`
- /app/performance/department-KRA/member-wise-KRA/:department — `<PerformancePermissionRoute permissions={[PERMISSIONS.PERFORMANCE_MEMBER_WISE_KRA]} element={<PerformanceMemberWiseKra />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: handleMemberNavigation (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleMemberNavigation — [PerformanceMemberWiseKra.jsx:581](../../client/src/pages/Performance/PerformanceMemberWiseKra.jsx#L581) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | false | () => { setSelectedDate( (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() - 1), ); } — [PerformanceMemberWiseKra.jsx:695](../../client/src/pages/Performance/PerformanceMemberWiseKra.jsx#L695) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | false | () => { setSelectedDate( (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 1), ); } — [PerformanceMemberWiseKra.jsx:707](../../client/src/pages/Performance/PerformanceMemberWiseKra.jsx#L707) |

## pages/Performance/PerformanceMemberWiseKraKpa.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/department-KPA/member-wise-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_MEMBER_WISE_KPA, ]} element={<PerformanceMemberWiseKraKpa />} />`
- /app/performance/department-KPA/member-wise-KPA/:department — `<PerformancePermissionRoute permissions={[PERMISSIONS.PERFORMANCE_MEMBER_WISE_KPA]} element={<PerformanceMemberWiseKraKpa />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MEMBER_WISE_KPA]} element={<PerformanceMemberWiseKraKpa />} />`
- /app/kra-kpa/department-KPA/member-wise-KPA/:department — `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MODULE_ACCESS]} element={<PerformanceLayout />} />`; `<PerformancePermissionRoute permissions={[PERMISSIONS.KRAKPA_MEMBER_WISE_KPA]} element={<PerformanceMemberWiseKraKpa />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: handleMemberNavigation (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleMemberNavigation — [PerformanceMemberWiseKraKpa.jsx:821](../../client/src/pages/Performance/PerformanceMemberWiseKraKpa.jsx#L821) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | false | () => { const prevIndex = currentMonthIndex === 0 ? fiscalMonths.length - 1 : currentMonthIndex - 1; setSelectedMonth(fiscalMonths[prevIndex]); } — [PerformanceMemberWiseKraKpa.jsx:955](../../client/src/pages/Performance/PerformanceMemberWiseKraKpa.jsx#L955) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | false | () => { const nextIndex = currentMonthIndex === fiscalMonths.length - 1 ? 0 : currentMonthIndex + 1; setSelectedMonth(fiscalMonths[nextIndex]); } — [PerformanceMemberWiseKraKpa.jsx:967](../../client/src/pages/Performance/PerformanceMemberWiseKraKpa.jsx#L967) |

## pages/Performance/PerformanceOverallKPA.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/overall-department-kpa — `<PerformancePermissionRoute permissions={[ PERMISSIONS.PERFORMANCE_ANNUAL_KPA_VS_ACHIEVEMENTS, ]} element={<PerformanceOverallKPA />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (currentMonthIndex > 0) { setSelectedMonth(fiscalMonths[currentMonthIndex - 1]); } } — [PerformanceOverallKPA.jsx:230](../../client/src/pages/Performance/PerformanceOverallKPA.jsx#L230) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (currentMonthIndex < fiscalMonths.length - 1) { setSelectedMonth(fiscalMonths[currentMonthIndex + 1]); } } — [PerformanceOverallKPA.jsx:239](../../client/src/pages/Performance/PerformanceOverallKPA.jsx#L239) |
| Action: () => openDepartment(params.value) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openDepartment(params.value) — [PerformanceOverallKPA.jsx:269](../../client/src/pages/Performance/PerformanceOverallKPA.jsx#L269) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 268: `params`

## pages/Performance/PerformanceReportKraKpa.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/performance/report-KRA-KPA — `<PerformancePermissionRoute permissions={[PERMISSIONS.PERFORMANCE_REPORT_KRA_KPA]} element={<PerformanceReportKraKpa />} />`
- /app/performance/report-KRA-KPA/:departmentName — `<PerformancePermissionRoute permissions={[PERMISSIONS.PERFORMANCE_REPORT_KRA_KPA]} element={<PerformanceReportKraKpa />} />`
- /app/performance/report-KRA-KPA/:departmentName/:reportType — `<PerformancePermissionRoute permissions={[PERMISSIONS.PERFORMANCE_REPORT_KRA_KPA]} element={<PerformanceReportKraKpa />} />`
- /app/performance/report-KRA-KPA/:departmentName/:reportType/:reportStatus — `<PerformancePermissionRoute permissions={[PERMISSIONS.PERFORMANCE_REPORT_KRA_KPA]} element={<PerformanceReportKraKpa />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| 'View Completed ${activeTypeTab}' (button) | activeStatusTab === "Completed" | No local disabled condition detected | () => setCompletedTaskView(params.data) — [PerformanceReportKraKpa.jsx:259](../../client/src/pages/Performance/PerformanceReportKraKpa.jsx#L259) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [PerformanceReportKraKpa.jsx:391](../../client/src/pages/Performance/PerformanceReportKraKpa.jsx#L391) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PerformanceReportKraKpa.jsx:391](../../client/src/pages/Performance/PerformanceReportKraKpa.jsx#L391) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 258: `params`
