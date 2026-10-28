# Tasks: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Tasks/DepartmentTasks/DepartmentTasks.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tasks/department-tasks — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { dispatch(setSelectedDepartment(params.data.mongoId)); navigate('${params.value}'); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { dispatch(setSelectedDepartment(params.data.mongoId)); navigate('${params.value}'); } — [DepartmentTasks.jsx:104](../../client/src/pages/Tasks/DepartmentTasks/DepartmentTasks.jsx#L104) |
| Action: handleOpenCalendar (clickable action) | NOT (departmentLoading) | No local disabled condition detected | handleOpenCalendar — [DepartmentTasks.jsx:169](../../client/src/pages/Tasks/DepartmentTasks/DepartmentTasks.jsx#L169) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 102: `params`

## pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tasks/department-tasks/:department — `<ProtectedDepartmentRoute element={<TasksViewDepartment />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setModalMode("view"); setSelectedTask(formatDateTimeFields(params.data)); setOpenMultiModal(true); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setModalMode("view"); setSelectedTask(formatDateTimeFields(params.data)); setOpenMultiModal(true); } — [TasksViewDepartment.jsx:649](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L649) |
| Action: () => { if (!params.node.selected \|\| isUpdatePending \|\| isDeletePending) return; openMarkDoneModal(params.data); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (!params.node.selected \|\| isUpdatePending \|\| isDeletePending) return; openMarkDoneModal(params.data); } — [TasksViewDepartment.jsx:721](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L721) |
| isUpdatePending ? "⏳" : "Mark As Done" (button) | No local render guard detected; page/API access still applies | !params.node.selected \|\| isUpdatePending \|\| isDeletePending | No inline handler declared; may submit a form or delegate to a component — [TasksViewDepartment.jsx:730](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L730) |
| Edit Task (button) | isManagerLevel | !params.node.selected \|\| isDeletePending \|\| isUpdatePending \|\| isEditPending | () => { const taskData = params.data; setSelectedTask(taskData); setModalMode("edit-task"); setOpenModal(true); reset({ taskName: taskData?.taskName \|\| "", description: taskData?.description \|\| "", assignTo: taskData?.assignToId \|\| "", location: taskData?.locationId \|\| "", unit: taskData?.unitId \|\| "", startDate: taskData?.assignedDate ? … — [TasksViewDepartment.jsx:741](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L741) |
| Delete Task (button) | isManagerLevel | !params.node.selected \|\| isDeletePending \|\| isUpdatePending | () => setDeleteTargetId(params.data.id) — [TasksViewDepartment.jsx:779](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L779) |
| View Completed Task (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setModalMode("completed"); setSelectedTask(formatDateTimeFields(params.data)); setOpenMultiModal(true); } — [TasksViewDepartment.jsx:831](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L831) |
| hasAccess && !isEmployee ? "Add Task" : undefined (table-generated action) | !departmentLoading | isEmployee | () => { reset(); setModalMode("add-task"); setOpenModal(true); } — [TasksViewDepartment.jsx:935](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L935) |
| Advanced filter (table-generated utility) | !departmentLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [TasksViewDepartment.jsx:935](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L935) |
| Export (table-generated utility) | !departmentLoading; exportData: true | No local disabled condition detected | Shared table export — [TasksViewDepartment.jsx:965](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L965) |
| Advanced filter (table-generated utility) | !departmentLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [TasksViewDepartment.jsx:965](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L965) |
| modalMode === "edit-task" ? "Update" : "Submit" (button) | modalMode === "add-task" \|\| modalMode === "edit-task" | modalMode === "edit-task" ? isEditPending : isAddKraPending; loading: modalMode === "edit-task" ? isEditPending : isAddKraPending | No inline handler declared; may submit a form or delegate to a component — [TasksViewDepartment.jsx:1246](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L1246) |
| Done (button) | modalMode === "comment" | isUpdatePending; loading: isUpdatePending | handleMarkAsDoneWithComment — [TasksViewDepartment.jsx:1273](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L1273) |
| Cancel (button) | modalMode === "comment" | isUpdatePending | () => { setCompletionComment(""); setCompletionCommentError(""); setSelectedTask({}); setOpenModal(false); } — [TasksViewDepartment.jsx:1279](../../client/src/pages/Tasks/DepartmentTasks/TasksViewDepartment.jsx#L1279) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 648: `params`
- **params**, line 717: `params`
- **isUpdatePending**, line 268: `useMutation({ mutationKey: ["updateDailyTasks"], mutationFn: async (data) => { const response = await axios.patch( '/api/tasks/update-task-status/${data.taskId}', { comment: data.comment }, ); return response.data; }, onSuccess: (data) => { refreshDepartmentTaskQueries(); toast.success(data.message \|\| "DATA UPDATED"); setCompletionComment(""); setCompletionCommentError(""); setSelectedTask({}); setOpenModal(false); }, onError: (error) => { toast.error(error.message \|\| "Error Updating"); }, })`
- **isDeletePending**, line 250: `useMutation({ mutationKey: ["deleteDepartmentTask"], mutationFn: async (taskId) => { const response = await axios.delete( '/api/tasks/department-task/${taskId}', ); return response.data; }, onSuccess: (data) => { refreshDepartmentTaskQueries(); toast.success(data.message \|\| "Task deleted"); }, onError: (error) => { toast.error(error.message \|\| "Error deleting task"); }, })`
- **isManagerLevel**, line 248: `!isEmployee`
- **isEmployee**, line 71: `auth?.user?.role?.some((role) => role?.roleTitle?.toLowerCase().includes("employee"), )`
- **auth**, line 51: `useAuth()`
- **isEditPending**, line 290: `useMutation({ mutationKey: ["editDepartmentTask"], mutationFn: async ({ id, data }) => { const response = await axios.patch('/api/tasks/update-task/${id}', data); return response.data; }, onSuccess: (data) => { refreshDepartmentTaskQueries(); toast.success(data.message \|\| "Task updated"); setOpenModal(false); reset(); }, onError: (error) => { toast.error(error.message \|\| "Error updating task"); }, })`
- **params**, line 830: `params`
- **isAddKraPending**, line 203: `useMutation({ mutationKey: ["addDailyTasks"], mutationFn: async (data) => { const response = await axios.post("/api/tasks/create-tasks", { taskName: data.taskName, startDate: data.startDate, endDate: data.endDate, dueTime: data.dueTime, description: data.description, assignTo: data.assignTo, department: deptId, taskType: "Department", location: data.unit, }); return response.data; }, onSuccess: (data) => { refreshDepartmentTaskQueries(); toast.success(data.message \|\| "KRA Added"); setOpenModal(false); reset(); // clear out old junk after closing }, onError: (error) => { toast.error(error.message \|\| "Error Adding KRA"); }, })`

## pages/Tasks/My-Tasklist/AdditionalTasks.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AdditionalTasks.jsx:50](../../client/src/pages/Tasks/My-Tasklist/AdditionalTasks.jsx#L50) |

## pages/Tasks/My-Tasklist/DailyTasks.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tasks/my-tasks — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewTask(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewTask(params.data) — [DailyTasks.jsx:264](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L264) |
| Action: () => { if (!params.node.selected \|\| isUpdatePending \|\| isDeletePending) return; openMarkDoneModal(params.data); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (!params.node.selected \|\| isUpdatePending \|\| isDeletePending) return; openMarkDoneModal(params.data); } — [DailyTasks.jsx:327](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L327) |
| isUpdatePending ? "⏳" : "Mark As Done" (button) | No local render guard detected; page/API access still applies | !params.node.selected \|\| isUpdatePending \|\| isDeletePending | No inline handler declared; may submit a form or delegate to a component — [DailyTasks.jsx:336](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L336) |
| Edit Task (button) | No local render guard detected; page/API access still applies | !params.node.selected \|\| isDeletePending \|\| isUpdatePending \|\| isEditPending | () => { const taskData = params.data; setSelectedTask(taskData); setModalMode("edit-task"); reset({ taskName: taskData?.taskList \|\| "", description: taskData?.description \|\| "", startDate: taskData?.assignedDate ? dayjs(taskData.assignedDate).toISOString() : null, endDate: taskData?.dueDate ? dayjs(taskData.dueDate).toISOString() : null, … — [DailyTasks.jsx:347](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L347) |
| Delete Task (button) | No local render guard detected; page/API access still applies | !params.node.selected \|\| isDeletePending \|\| isUpdatePending | () => setDeleteTargetId(params.data.id) — [DailyTasks.jsx:379](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L379) |
| View Completed Task (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setModalMode("view-completed"); setSelectedTask( formatDateTimeFields({ ...params.data, assignedTime: params.data?.assignedDate, }), ); setOpenModal(true); } — [DailyTasks.jsx:446](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L446) |
| Add Task (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { reset(taskFormDefaultValues); setModalMode("add-task"); setOpenModal(true); } — [DailyTasks.jsx:764](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L764) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DailyTasks.jsx:764](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L764) |
| Export (table-generated utility) | !isCompletedLoading; exportData: true | No local disabled condition detected | Shared table export — [DailyTasks.jsx:801](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L801) |
| Advanced filter (table-generated utility) | !isCompletedLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DailyTasks.jsx:801](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L801) |
| modalMode === "edit-task" ? "Update" : "Submit" (button) | modalMode === "add-task" \|\| modalMode === "edit-task" | modalMode === "edit-task" ? isEditPending : isAddKpaPending; loading: modalMode === "edit-task" ? isEditPending : isAddKpaPending | No inline handler declared; may submit a form or delegate to a component — [DailyTasks.jsx:976](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L976) |
| Done (button) | modalMode === "comment" | isUpdatePending; loading: isUpdatePending | handleMarkAsDoneWithComment — [DailyTasks.jsx:1007](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L1007) |
| Cancel (button) | modalMode === "comment" | isUpdatePending | () => { completionCommentRef.current = ""; setCompletionCommentError(""); setSelectedTask({}); setOpenModal(false); } — [DailyTasks.jsx:1013](../../client/src/pages/Tasks/My-Tasklist/DailyTasks.jsx#L1013) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 263: `params`
- **params**, line 323: `params`
- **isUpdatePending**, line 166: `useMutation({ mutationKey: ["updateMyTasks"], mutationFn: async (data) => { const response = await axios.patch( '/api/tasks/update-task-status/${data.taskId}', { comment: data.comment }, ); return response.data; }, onSuccess: (data) => { queryClient.refetchQueries({ queryKey: ["fetchMyTask"] }); queryClient.invalidateQueries({ queryKey: ["fetchMyTask"] }); queryClient.invalidateQueries({ queryKey: ["completedTasks"] }); toast.success(data.message \|\| "Task updated"); completionCommentRef.current = ""; setCompletionCommentError(""); setSelectedTask({}); setOpenModal(false); }, onError: (error) => { toast.error(error.message \|\| "Error Updating"); }, })`
- **isDeletePending**, line 190: `useMutation({ mutationKey: ["deleteMyTask"], mutationFn: async (taskId) => { const response = await axios.delete('/api/tasks/my-task/${taskId}'); return response.data; }, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["fetchMyTask"] }); queryClient.invalidateQueries({ queryKey: ["completedTasks"] }); toast.success(data.message \|\| "Task deleted"); }, onError: (error) => { toast.error(error.message \|\| "Error deleting task"); }, })`
- **isEditPending**, line 212: `useMutation({ mutationKey: ["editMyTask"], mutationFn: async ({ id, data }) => { const response = await axios.patch('/api/tasks/update-task/${id}', data); return response.data; }, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["fetchMyTask"] }); toast.success(data.message \|\| "Task updated"); reset(taskFormDefaultValues); setOpenModal(false); }, onError: (error) => { toast.error(error.message \|\| "Error updating task"); }, })`
- **params**, line 445: `params`
- **isCompletedLoading**, line 108: `useQuery({ queryKey: ["completedTasks"], queryFn: async () => { try { const response = await axios.get('/api/tasks/get-my-completed-tasks'); return response.data; } catch (error) { console.error(error); } }, })`
- **isAddKpaPending**, line 121: `useMutation({ mutationKey: ["addMonthlyKpa"], mutationFn: async (data) => { const response = await axios.post("/api/tasks/create-tasks", { taskName: data.taskName, startDate: data.startDate, endDate: data.endDate, dueTime: data.dueTime, description: data.description, department: myTaskDepartmentId, taskType: "Self", }); return response.data; }, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["fetchMyTask"] }); toast.success(data.message \|\| "KRA Added"); reset(taskFormDefaultValues); setOpenModal(false); }, onError: (error) => { queryClient.invalidateQueries({ queryKey: ["fetchMyTask"] }); toast.error(error.message \|\| "Error Adding Tasks"); setOpenModal(false); }, })`

## pages/Tasks/My-Tasklist/MonthlyTasks.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MonthlyTasks.jsx:75](../../client/src/pages/Tasks/My-Tasklist/MonthlyTasks.jsx#L75) |

## pages/Tasks/ProjectList/EditProject.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tasks/project-list/edit-project/:id — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Add Task (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenModal(true) — [EditProject.jsx:74](../../client/src/pages/Tasks/ProjectList/EditProject.jsx#L74) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [EditProject.jsx:74](../../client/src/pages/Tasks/ProjectList/EditProject.jsx#L74) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [EditProject.jsx:203](../../client/src/pages/Tasks/ProjectList/EditProject.jsx#L203) |

## pages/Tasks/ProjectList/ProjectList.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tasks/project-list/edit-project — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Add Project (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenModal(true) — [ProjectList.jsx:349](../../client/src/pages/Tasks/ProjectList/ProjectList.jsx#L349) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ProjectList.jsx:571](../../client/src/pages/Tasks/ProjectList/ProjectList.jsx#L571) |
| Icon/action: handleEditClick (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleEditClick — [ProjectList.jsx:714](../../client/src/pages/Tasks/ProjectList/ProjectList.jsx#L714) |
| Icon/action: (event) => setAnchorEl(event.currentTarget) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | (event) => setAnchorEl(event.currentTarget) — [ProjectList.jsx:754](../../client/src/pages/Tasks/ProjectList/ProjectList.jsx#L754) |
| Edit Project (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleEditClick — [ProjectList.jsx:765](../../client/src/pages/Tasks/ProjectList/ProjectList.jsx#L765) |
| Delete Project (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setAnchorEl(null) — [ProjectList.jsx:766](../../client/src/pages/Tasks/ProjectList/ProjectList.jsx#L766) |

## pages/Tasks/TaskReports.jsx/AssignedTaskReports.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tasks/reports/assigned-task-reports — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Task Details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewDetails(params.data) — [AssignedTaskReports.jsx:210](../../client/src/pages/Tasks/TaskReports.jsx/AssignedTaskReports.jsx#L210) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AssignedTaskReports.jsx:253](../../client/src/pages/Tasks/TaskReports.jsx/AssignedTaskReports.jsx#L253) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AssignedTaskReports.jsx:253](../../client/src/pages/Tasks/TaskReports.jsx/AssignedTaskReports.jsx#L253) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 209: `params`

## pages/Tasks/TaskReports.jsx/DepartmentTaskReports.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tasks/reports/department-task-reports — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Task Details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewDetails(params) — [DepartmentTaskReports.jsx:101](../../client/src/pages/Tasks/TaskReports.jsx/DepartmentTaskReports.jsx#L101) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DepartmentTaskReports.jsx:170](../../client/src/pages/Tasks/TaskReports.jsx/DepartmentTaskReports.jsx#L170) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 100: `params`

## pages/Tasks/TaskReports.jsx/MyTaskReports.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tasks/reports/my-task-reports — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Task Details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewDetails(params) — [MyTaskReports.jsx:143](../../client/src/pages/Tasks/TaskReports.jsx/MyTaskReports.jsx#L143) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [MyTaskReports.jsx:214](../../client/src/pages/Tasks/TaskReports.jsx/MyTaskReports.jsx#L214) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MyTaskReports.jsx:214](../../client/src/pages/Tasks/TaskReports.jsx/MyTaskReports.jsx#L214) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 142: `params`

## pages/Tasks/TeamMembers/TeamMember.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/tasks/team-members — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [TeamMember.jsx:259](../../client/src/pages/Tasks/TeamMembers/TeamMember.jsx#L259) |
