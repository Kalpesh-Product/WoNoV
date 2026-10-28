# HR Dashboard: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Dashboard/HrDashboard/Complaince/CompanyHandbook.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/company/company-settings/company-handbook — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => navigate('${item.title}', { state: { departmentId: item.id, departmentName: item.title, documentType: "sop", }, }) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate('${item.title}', { state: { departmentId: item.id, departmentName: item.title, documentType: "sop", }, }) — [CompanyHandbook.jsx:246](../../client/src/pages/Dashboard/HrDashboard/Complaince/CompanyHandbook.jsx#L246) |
| Icon/action: () => navigate('${item.title}', { state: { departmentId: item.id, departmentName: item.title, documentType: "policies", }, }) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate('${item.title}', { state: { departmentId: item.id, departmentName: item.title, documentType: "policies", }, }) — [CompanyHandbook.jsx:264](../../client/src/pages/Dashboard/HrDashboard/Complaince/CompanyHandbook.jsx#L264) |

## pages/Dashboard/HrDashboard/Complaince/DepartmentPolicies.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DepartmentPolicies.jsx:58](../../client/src/pages/Dashboard/HrDashboard/Complaince/DepartmentPolicies.jsx#L58) |

## pages/Dashboard/HrDashboard/Complaince/DepartmentSOP.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/company/company-settings/company-handbook/:department — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DepartmentSOP.jsx:78](../../client/src/pages/Dashboard/HrDashboard/Complaince/DepartmentSOP.jsx#L78) |

## pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Agreements.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/employee-list/agreements — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => window.open(params.data.url, "_blank") (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => window.open(params.data.url, "_blank") — [Agreements.jsx:180](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Agreements.jsx#L180) |
| Update Status (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleEdit(params.data) — [Agreements.jsx:208](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Agreements.jsx#L208) |
| Add Agreement (table-generated action) | No local render guard detected; page/API access still applies | !hasAgreementRequestAccess | () => { setModalMode("add"); setModalOpen(true); } — [Agreements.jsx:228](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Agreements.jsx#L228) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Agreements.jsx:228](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Agreements.jsx#L228) |
| Submit (button) | modalMode === "add" | isAddPending; loading: isAddPending | No inline handler declared; may submit a form or delegate to a component — [Agreements.jsx:282](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Agreements.jsx#L282) |
| Update (button) | modalMode === "update" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [Agreements.jsx:318](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Agreements.jsx#L318) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 179: `params`
- **params**, line 202: `params`
- **hasAgreementRequestAccess**, line 29: `useMemo(() => { return auth?.permissions?.some( (permission) => permission.value === PERMISSIONS.HR_AGREEMENT_REQUEST.value ); }, [auth?.permissions])`
- **auth**, line 27: `useAuth()`
- **isAddPending**, line 113: `useMutation({ mutationKey: ["addAgreement"], mutationFn: async (data) => { const formData = new FormData(); formData.append("agreementName", data.agreementName); formData.append("agreement", data.agreement); // file object formData.append("userId", selectedEmployee?._id); // include employee ID if required console.log("form Data : ", formData); const response = await axios.post( "/api/agreement/add-agreement", formData, { headers: { "Content-Type": "multipart/form-data", }, } ); return response.data; }, onSuccess: () => { toast.success("Agreement uploaded successfully"); queryClient.invalidateQueries({ queryKey: ["agreements", id] }); reset(); setModalOpen(false); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| "Failed to upload agreement" ); console.error("Upload e…`
- **selectedEmployee**, line 86: `isEmployeeLoading ? [] : employees.find((item) => item.empId === id)`
- **isEmployeeLoading**, line 69: `useQuery({ queryKey: ["employees"], queryFn: async () => { try { const response = await axios.get("/api/users/fetch-users"); const filteredData = response.data.filter( (employee) => employee.isActive ); return filteredData; } catch (error) { throw new Error( error.response?.data?.message \|\| "Failed to fetch employees" ); } }, })`

## pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Attendance.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/employee-list/attendance — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Correction Request (table-generated action) | !isLoading | !hasCorrectionRequestAccess | () => { setOpenModal(true); } — [Attendance.jsx:800](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Attendance.jsx#L800) |
| Export (table-generated utility) | !isLoading; exportData: true | No local disabled condition detected | Shared table export — [Attendance.jsx:800](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Attendance.jsx#L800) |
| Advanced filter (table-generated utility) | !isLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Attendance.jsx:800](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Attendance.jsx#L800) |
| Cancel (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setOpenModal(false); } — [Attendance.jsx:933](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Attendance.jsx#L933) |
| Submit (button) | No local render guard detected; page/API access still applies | correctionPending; loading: correctionPending | No inline handler declared; may submit a form or delegate to a component — [Attendance.jsx:939](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Attendance.jsx#L939) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isLoading**, line 116: `useQuery({ queryKey: ["user-attendance", employmentID], queryFn: fetchAttendance, enabled: Boolean(employmentID), })`
- **hasCorrectionRequestAccess**, line 59: `userPermissions.includes( PERMISSIONS.HR_CORRECTION_REQUEST.value )`
- **userPermissions**, line 58: `auth?.user?.permissions?.permissions \|\| []`
- **auth**, line 57: `useAuth()`

## pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/EditDetails.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/employee-list/edit-details — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| '${visiblePasswords[fieldName] ? "Hide" : "Show"} ${label}' (button) | No local render guard detected; page/API access still applies | disabled | () => togglePasswordVisibility(fieldName) — [EditDetails.jsx:340](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/EditDetails.jsx#L340) |
| Edit (button) | !isEditing | !hasEmployeeEditAccess | handleEditToggle — [EditDetails.jsx:1178](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/EditDetails.jsx#L1178) |
| Cancel (button) | NOT (!isEditing) | No local disabled condition detected | () => setIsEditing(false) — [EditDetails.jsx:1186](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/EditDetails.jsx#L1186) |
| View (clickable action) | policyOptionsByField[fieldKey].length AND ["leavePolicy", "holidayPolicy"].includes( fieldKey, ) AND NOT (fieldKey === "attendanceSource") AND NOT (fieldKey === "workSchedulePolicy") AND NOT (fieldKey === "email") AND NOT (fieldKey === "status") AND isEditing AND NOT (isLoading) | No local disabled condition detected | (event) => event.stopPropagation() — [EditDetails.jsx:1686](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/EditDetails.jsx#L1686) |
| Icon/action: () => openPolicyPreview( resolvePolicyLink( transformEmployeeData[fieldKey], ), getPolicyDisplayName( transformEmployeeData[fieldKey], ), ) (button) | ["leavePolicy", "holidayPolicy"].includes( fieldKey, ) && resolvePolicyLink(transformEmployeeData[fieldKey]) AND NOT (isEditing) AND NOT (isLoading) | No local disabled condition detected | () => openPolicyPreview( resolvePolicyLink( transformEmployeeData[fieldKey], ), getPolicyDisplayName( transformEmployeeData[fieldKey], ), ) — [EditDetails.jsx:1744](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/EditDetails.jsx#L1744) |
| Verify (button) | isEditing | No local disabled condition detected | verifyCurrentPassword — [EditDetails.jsx:2327](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/EditDetails.jsx#L2327) |
| Submit (button) | isEditing | updateEmployeeStatus.isPending | isEditing ? handleSubmit(onSubmit) : handleEditToggle — [EditDetails.jsx:2392](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/EditDetails.jsx#L2392) |
| Reset (button) | isEditing | No local disabled condition detected | handleReset — [EditDetails.jsx:2400](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/EditDetails.jsx#L2400) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isEditing**, line 260: `useState(false)`
- **hasEmployeeEditAccess**, line 712: `userPermissions.includes( PERMISSIONS.HR_EMPLOYEE_EDIT.value, )`
- **userPermissions**, line 711: `auth?.user?.permissions?.permissions \|\| []`
- **auth**, line 710: `useAuth()`
- **isLoading**, line 76: `useQuery({ queryKey: ["employeeData", employmentID], queryFn: async () => { try { const response = await axios.get( '/api/users/fetch-single-user/${employmentID}', ); return response.data; } catch (error) { throw new Error(error.response.data.message); } }, })`

## pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KPI.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/employee-list/kpi — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewKPI(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewKPI(params.data) — [KPI.jsx:110](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KPI.jsx#L110) |
| Add KPA (table-generated action) | !isLoading | No local disabled condition detected | () => setModalOpen(true) — [KPI.jsx:125](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KPI.jsx#L125) |
| Advanced filter (table-generated utility) | !isLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [KPI.jsx:125](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KPI.jsx#L125) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddKPI — [KPI.jsx:156](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KPI.jsx#L156) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 108: `params`
- **isLoading**, line 65: `useQuery({ queryKey: ["kpa"], queryFn: async () => { try { const response = await axios.get( '/api/tasks/get-tasks/?empId=${id}&type=KPA' ); return response.data; } catch (error) { throw new Error(error.response.data.message); } }, })`

## pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KRA.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/employee-list/kra — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewKRA(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewKRA(params.data) — [KRA.jsx:114](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KRA.jsx#L114) |
| Add KRA (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setModalOpen(true) — [KRA.jsx:128](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KRA.jsx#L128) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [KRA.jsx:128](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KRA.jsx#L128) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddKRA — [KRA.jsx:154](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KRA.jsx#L154) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 112: `params`

## pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/employee-list/leaves — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Approve (configured menu/action) | params.data.status === "Rejected" | No local disabled condition detected | () => approveLeave(params.data._id) — [Leaves.jsx:177](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves.jsx#L177) |
| Reject (configured menu/action) | params.data.status === "Approved" | No local disabled condition detected | () => rejectLeave(params.data._id) — [Leaves.jsx:186](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves.jsx#L186) |
| Approve (configured menu/action) | params.data.status !== "Approved" && params.data.status !== "Rejected" | No local disabled condition detected | () => approveLeave(params.data._id) — [Leaves.jsx:196](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves.jsx#L196) |
| Reject (configured menu/action) | params.data.status !== "Approved" && params.data.status !== "Rejected" | No local disabled condition detected | () => rejectLeave(params.data._id) — [Leaves.jsx:201](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves.jsx#L201) |
| <MdNavigateBefore /> (button) | NOT (isLoading) | No local disabled condition detected | () => setSelectedYear((year) => year - 1) — [Leaves.jsx:422](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves.jsx#L422) |
| <MdNavigateNext /> (button) | NOT (isLoading) | selectedYear >= currentFiscalYear | () => setSelectedYear((year) => year + 1) — [Leaves.jsx:429](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves.jsx#L429) |
| Add Requested Leave (table-generated action) | No local render guard detected; page/API access still applies | !hasCorrectionRequestAccess | () => { setOpenModal(true); } — [Leaves.jsx:446](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves.jsx#L446) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [Leaves.jsx:446](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves.jsx#L446) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Leaves.jsx:446](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves.jsx#L446) |
| Cancel (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setOpenModal(false); } — [Leaves.jsx:623](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves.jsx#L623) |
| Submit (button) | No local render guard detected; page/API access still applies | correctionPending; loading: correctionPending | No inline handler declared; may submit a form or delegate to a component — [Leaves.jsx:629](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves.jsx#L629) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 158: `params`
- **isLoading**, line 70: `useQuery({ queryKey: ["leaves", id], queryFn: async () => { try { const response = await axios.get('/api/leaves/view-leaves/${id}'); return response.data; } catch (error) { throw new Error(error.response.data.message); } }, enabled: Boolean(id), })`
- **selectedYear**, line 60: `useState(currentFiscalYear)`
- **hasCorrectionRequestAccess**, line 64: `useMemo(() => { return auth?.permissions?.some( (permission) => permission.value === PERMISSIONS.HR_LEAVE_REQUEST.value ); }, [auth?.permissions])`
- **auth**, line 62: `useAuth()`

## pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Payslip.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/employee-list/payslip — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Payslip (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { const link = params.data?.payslipLink; if (link) { window.open(link, "_blank"); } else { toast.error("No payslip link available."); } } — [Payslip.jsx:49](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Payslip.jsx#L49) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Payslip.jsx:80](../../client/src/pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Payslip.jsx#L80) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 47: `params`
- **data**, line 15: `useQuery({ queryKey: ["payslips"], queryFn: async () => { try { const response = await axios.get( '/api/payslip/get-payslips/${employmentID}' ); return response.data \|\| []; } catch (error) { console.warn("Failed to fetch payslips:", error.message); return []; // fallback return to avoid crashes } }, })`

## pages/Dashboard/HrDashboard/Complaince/HoildaysEvents.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/company/company-calendar-activities/holidays — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Delete holiday (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setHolidayToDelete(params.data) — [HoildaysEvents.jsx:56](../../client/src/pages/Dashboard/HrDashboard/Complaince/HoildaysEvents.jsx#L56) |
| Add Holiday (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setModalOpen(true) — [HoildaysEvents.jsx:143](../../client/src/pages/Dashboard/HrDashboard/Complaince/HoildaysEvents.jsx#L143) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HoildaysEvents.jsx:143](../../client/src/pages/Dashboard/HrDashboard/Complaince/HoildaysEvents.jsx#L143) |
| Add Holiday (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [HoildaysEvents.jsx:234](../../client/src/pages/Dashboard/HrDashboard/Complaince/HoildaysEvents.jsx#L234) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 55: `params`

## pages/Dashboard/HrDashboard/Complaince/HrEvents.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/company/company-calendar-activities/events — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Delete event (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setEventToDelete(params.data) — [HrEvents.jsx:53](../../client/src/pages/Dashboard/HrDashboard/Complaince/HrEvents.jsx#L53) |
| Add Event (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setModalOpen(true) — [HrEvents.jsx:137](../../client/src/pages/Dashboard/HrDashboard/Complaince/HrEvents.jsx#L137) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrEvents.jsx:137](../../client/src/pages/Dashboard/HrDashboard/Complaince/HrEvents.jsx#L137) |
| Add Event (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [HrEvents.jsx:242](../../client/src/pages/Dashboard/HrDashboard/Complaince/HrEvents.jsx#L242) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 52: `params`

## pages/Dashboard/HrDashboard/Complaince/TemplateSection/ExperienceLetter.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | exportToPDF — [ExperienceLetter.jsx:173](../../client/src/pages/Dashboard/HrDashboard/Complaince/TemplateSection/ExperienceLetter.jsx#L173) |

## pages/Dashboard/HrDashboard/Complaince/ViewEmployees.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/employee-list — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { localStorage.setItem("employeeName", params.data.employeeName); navigate( '/app/dashboard/HR-dashboard/employee/employee-list/edit-details' // '/app/dashboard/HR-da… (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { localStorage.setItem("employeeName", params.data.employeeName); navigate( '/app/dashboard/HR-dashboard/employee/employee-list/edit-details' // '/app/dashboard/HR-dashboard/employee/employee-list/${params.data.employeeName}/edit-details' ); dispatch(setSelectedEmployee(params.data.employmentID)); dispatch(setSelectedEmployeeMongoId… — [ViewEmployees.jsx:98](../../client/src/pages/Dashboard/HrDashboard/Complaince/ViewEmployees.jsx#L98) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [ViewEmployees.jsx:201](../../client/src/pages/Dashboard/HrDashboard/Complaince/ViewEmployees.jsx#L201) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ViewEmployees.jsx:201](../../client/src/pages/Dashboard/HrDashboard/Complaince/ViewEmployees.jsx#L201) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 97: `params`

## pages/Dashboard/HrDashboard/Complaince/ViewVendors.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Edit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleEditToggle — [ViewVendors.jsx:84](../../client/src/pages/Dashboard/HrDashboard/Complaince/ViewVendors.jsx#L84) |

## pages/Dashboard/HrDashboard/Data/JobApplicationList.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/data/job-application-list — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewApplicationDetails(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewApplicationDetails(params.data) — [JobApplicationList.jsx:213](../../client/src/pages/Dashboard/HrDashboard/Data/JobApplicationList.jsx#L213) |
| Restore job application (button) | params.data.isDeleted | applicationActionMutation.isPending | () => restoreApplication(params.data) — [JobApplicationList.jsx:284](../../client/src/pages/Dashboard/HrDashboard/Data/JobApplicationList.jsx#L284) |
| Permanently delete job application (button) | params.data.isDeleted | applicationActionMutation.isPending | () => permanentlyDeleteApplication(params.data) — [JobApplicationList.jsx:294](../../client/src/pages/Dashboard/HrDashboard/Data/JobApplicationList.jsx#L294) |
| Edit job application (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openEditApplication(params.data) — [JobApplicationList.jsx:310](../../client/src/pages/Dashboard/HrDashboard/Data/JobApplicationList.jsx#L310) |
| Delete job application (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => archiveApplication(params.data) — [JobApplicationList.jsx:319](../../client/src/pages/Dashboard/HrDashboard/Data/JobApplicationList.jsx#L319) |
| Add Job Application (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | openCreateApplication — [JobApplicationList.jsx:369](../../client/src/pages/Dashboard/HrDashboard/Data/JobApplicationList.jsx#L369) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [JobApplicationList.jsx:369](../../client/src/pages/Dashboard/HrDashboard/Data/JobApplicationList.jsx#L369) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [JobApplicationList.jsx:369](../../client/src/pages/Dashboard/HrDashboard/Data/JobApplicationList.jsx#L369) |
| Cancel (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | closeAddModal — [JobApplicationList.jsx:715](../../client/src/pages/Dashboard/HrDashboard/Data/JobApplicationList.jsx#L715) |
| editingApplication ? "Save Changes" : "Add Application" (button) | No local render guard detected; page/API access still applies | loading: saveApplicationMutation.isPending | No inline handler declared; may submit a form or delegate to a component — [JobApplicationList.jsx:721](../../client/src/pages/Dashboard/HrDashboard/Data/JobApplicationList.jsx#L721) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 212: `params`
- **params**, line 280: `params`

## pages/Dashboard/HrDashboard/Data/PayrollReports.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewApplicationDetails(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewApplicationDetails(params.data) — [PayrollReports.jsx:59](../../client/src/pages/Dashboard/HrDashboard/Data/PayrollReports.jsx#L59) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [PayrollReports.jsx:102](../../client/src/pages/Dashboard/HrDashboard/Data/PayrollReports.jsx#L102) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PayrollReports.jsx:102](../../client/src/pages/Dashboard/HrDashboard/Data/PayrollReports.jsx#L102) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 58: `params`

## pages/Dashboard/HrDashboard/Data/Reports.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/data/reports — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [Reports.jsx:187](../../client/src/pages/Dashboard/HrDashboard/Data/Reports.jsx#L187) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Reports.jsx:187](../../client/src/pages/Dashboard/HrDashboard/Data/Reports.jsx#L187) |

## pages/Dashboard/HrDashboard/Data/TemplatePreview.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Back (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate(-1) — [TemplatePreview.jsx:18](../../client/src/pages/Dashboard/HrDashboard/Data/TemplatePreview.jsx#L18) |

## pages/Dashboard/HrDashboard/Data/Templates.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/company/company-templates-configuration/templates — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Add Template (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenModal(true) — [Templates.jsx:136](../../client/src/pages/Dashboard/HrDashboard/Data/Templates.jsx#L136) |
| Action: () => { const extension = template.documentLink ?.split(".") .pop() ?.toLowerCase() \|\| "pdf"; const safeName = template.name.replace( /[^a-z0-9_\- ]/gi, "_" ); // sanitize … (clickable action) | NOT (isTemplatesLoading) AND !isTemplatesLoading | No local disabled condition detected | () => { const extension = template.documentLink ?.split(".") .pop() ?.toLowerCase() \|\| "pdf"; const safeName = template.name.replace( /[^a-z0-9_\- ]/gi, "_" ); // sanitize filename const fileName = '${safeName}.${extension}'; const downloadUrl = template.documentLink.replace( "/upload/", "/upload/fl_attachment/" ); const link = document.c… — [Templates.jsx:146](../../client/src/pages/Dashboard/HrDashboard/Data/Templates.jsx#L146) |
| Icon/action: () => imageInputRef.current?.click() (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => imageInputRef.current?.click() — [Templates.jsx:268](../../client/src/pages/Dashboard/HrDashboard/Data/Templates.jsx#L268) |
| Add Template (button) | No local render guard detected; page/API access still applies | isDocumentPending; loading: isDocumentPending | No inline handler declared; may submit a form or delegate to a component — [Templates.jsx:284](../../client/src/pages/Dashboard/HrDashboard/Data/Templates.jsx#L284) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isTemplatesLoading**, line 41: `useQuery({ queryKey: ["templates"], queryFn: async () => { try { const response = await axios.get( "/api/company/get-company-documents/templates" ); return response.data.templates; } catch (error) { console.log(error); } }, })`
- **isDocumentPending**, line 55: `useMutation({ mutationFn: async ({ documentName, file }) => { const formData = new FormData(); formData.append("documentName", documentName); formData.append("document", file); formData.append("type", "template"); const response = await axios.post( "/api/company/upload-company-document", formData, { headers: { "Content-Type": "multipart/form-data" }, } ); return response.data; }, onSuccess: () => { toast.success("Template uploaded successfully!"); setOpenModal(false); reset(); queryClient.invalidateQueries({ queryKey: ["templates"] }); // refresh the list }, onError: (err) => { toast.error("Failed to upload template."); console.error("Upload error:", err); }, })`

## pages/Dashboard/HrDashboard/Finance/HrBudget.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Request Budget (table-generated action) | !isHrLoading AND NOT (!isReady) | No local disabled condition detected | () => setOpenModal(true) — [HrBudget.jsx:274](../../client/src/pages/Dashboard/HrDashboard/Finance/HrBudget.jsx#L274) |
| Advanced filter (table-generated utility) | !isHrLoading AND NOT (!isReady); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrBudget.jsx:274](../../client/src/pages/Dashboard/HrDashboard/Finance/HrBudget.jsx#L274) |
| Submit (button) | NOT (!isReady) | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [HrBudget.jsx:377](../../client/src/pages/Dashboard/HrDashboard/Finance/HrBudget.jsx#L377) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isHrLoading**, line 33: `useQuery({ queryKey: ["hrFinance"], queryFn: async () => { try { const response = await axios.get( '/api/budget/company-budget?departmentId=6798bab9e469e809084e249e' ); const budgets = response.data.allBudgets; return Array.isArray(budgets) ? budgets : []; } catch (error) { console.error("Error fetching budget:", error); return []; } }, })`
- **isReady**, line 30: `useState(false)`

## pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/payroll — `<PerformancePermissionRoute permissions={[PERMISSIONS.HR_RUN_PAYROLL_MIX_BAG]} element={<HrPayroll />} />`
- /app/dashboard/HR-dashboard/finance/payroll — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate( isMixBagPayroll ? '/app/dashboard/HR-dashboard/mix-bag/payroll/${params.value}' : '/app/dashboard/HR-dashboard/finance/payroll/${params.value}', { state: { … (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( isMixBagPayroll ? '/app/dashboard/HR-dashboard/mix-bag/payroll/${params.value}' : '/app/dashboard/HR-dashboard/finance/payroll/${params.value}', { state: { empId: params.data.id, month: params.data.month, status: params.data.status, employeeName: params.data.employeeName, departmentName: params.data.departmentName, employe… — [HrPayroll.jsx:204](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L204) |
| isSelectedPayrollProcessed ? "Payroll Processed" : currentPayrollProgress ? "Resume Payroll" : "Start Payroll" (button) | isMixBagPayroll && !payrollStarted | isLoading \|\| isPayrollHistoryLoading \|\| isSelectedPayrollProcessed \|\| !selectedBatch \|\| !selectedPayPeriod | () => { const savedStep = Number(currentPayrollProgress?.activeStep) \|\| 0; setActivePayrollStep(savedStep); setCompletedPayrollSteps( Array.from({ length: savedStep }, (_, index) => index) ); if (!currentPayrollProgress) { updatePayrollProgress(payrollProgressKey, { activeStep: 0, startedAt: new Date().toISOString(), startedBy: [auth?.use… — [HrPayroll.jsx:923](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L923) |
| Icon/action: button (button) | isMixBagPayroll AND NOT (isMixBagPayroll && !payrollStarted) | true | No inline handler declared; may submit a form or delegate to a component — [HrPayroll.jsx:976](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L976) |
| Export (table-generated utility) | isMixBagPayroll && activePayrollStep === 0 AND NOT (isMixBagPayroll && !payrollStarted); exportData: true | No local disabled condition detected | Shared table export — [HrPayroll.jsx:1012](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L1012) |
| Advanced filter (table-generated utility) | isMixBagPayroll && activePayrollStep === 0 AND NOT (isMixBagPayroll && !payrollStarted); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrPayroll.jsx:1012](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L1012) |
| Advanced filter (table-generated utility) | isMixBagPayroll && activePayrollStep === 2 AND NOT (isMixBagPayroll && activePayrollStep === 1) AND NOT (isMixBagPayroll && activePayrollStep === 0) AND NOT (isMixBagPayroll && !payrollStarted); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrPayroll.jsx:1029](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L1029) |
| Advanced filter (table-generated utility) | isMixBagPayroll && activePayrollStep === 3 AND NOT (isMixBagPayroll && activePayrollStep === 2) AND NOT (isMixBagPayroll && activePayrollStep === 1) AND NOT (isMixBagPayroll && activePayrollStep === 0) AND NOT (isMixBagPayroll && !payrollStarted); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrPayroll.jsx:1042](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L1042) |
| Advanced filter (table-generated utility) | isMixBagPayroll && activePayrollStep === 4 AND NOT (isMixBagPayroll && activePayrollStep === 3) AND NOT (isMixBagPayroll && activePayrollStep === 2) AND NOT (isMixBagPayroll && activePayrollStep === 1) AND NOT (isMixBagPayroll && activePayrollStep === 0) AND NOT (isMixBagPayroll && !payrollStarted); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrPayroll.jsx:1050](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L1050) |
| Generate (table-generated action) | NOT (isMixBagPayroll) AND NOT (isMixBagPayroll && activePayrollStep === 4) AND NOT (isMixBagPayroll && activePayrollStep === 3) AND NOT (isMixBagPayroll && activePayrollStep === 2) AND NOT (isMixBagPayroll && activePayrollStep === 1) AND NOT (isMixBagPayroll && activePayrollStep === 0) AND NOT (isMixBagPayroll && !payrollStarted) | No local disabled condition detected | handleBatchAction — [HrPayroll.jsx:1062](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L1062) |
| Export (table-generated utility) | NOT (isMixBagPayroll) AND NOT (isMixBagPayroll && activePayrollStep === 4) AND NOT (isMixBagPayroll && activePayrollStep === 3) AND NOT (isMixBagPayroll && activePayrollStep === 2) AND NOT (isMixBagPayroll && activePayrollStep === 1) AND NOT (isMixBagPayroll && activePayrollStep === 0) AND NOT (isMixBagPayroll && !payrollStarted); exportData: true | No local disabled condition detected | Shared table export — [HrPayroll.jsx:1062](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L1062) |
| Advanced filter (table-generated utility) | NOT (isMixBagPayroll) AND NOT (isMixBagPayroll && activePayrollStep === 4) AND NOT (isMixBagPayroll && activePayrollStep === 3) AND NOT (isMixBagPayroll && activePayrollStep === 2) AND NOT (isMixBagPayroll && activePayrollStep === 1) AND NOT (isMixBagPayroll && activePayrollStep === 0) AND NOT (isMixBagPayroll && !payrollStarted); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrPayroll.jsx:1062](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L1062) |
| Back (button) | activePayrollStep > 0 AND isMixBagPayroll AND NOT (isMixBagPayroll && !payrollStarted) | isSavingPayrollDraft | () => { const previousStep = Math.max(activePayrollStep - 1, 0); setActivePayrollStep(previousStep); updatePayrollProgress(payrollProgressKey, { activeStep: previousStep, }); } — [HrPayroll.jsx:1086](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L1086) |
| activePayrollStep === payrollSteps.length - 1 ? "Submit" : "Continue" (button) | isMixBagPayroll AND NOT (isMixBagPayroll && !payrollStarted) | isSavingPayrollDraft \|\| (activePayrollStep === 1 && (attendanceApproval.isLoading \|\| !attendanceApproval.allApproved)) | () => { if (activePayrollStep === payrollSteps.length - 1) { savePayrollDraft(); return; } setCompletedPayrollSteps((completedSteps) => completedSteps.includes(activePayrollStep) ? completedSteps : [...completedSteps, activePayrollStep] ); const nextStep = Math.min( activePayrollStep + 1, payrollSteps.length - 1 ); setActivePayrollStep(ne… — [HrPayroll.jsx:1098](../../client/src/pages/Dashboard/HrDashboard/Finance/HrPayroll.jsx#L1098) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isMixBagPayroll**, line 70: `location.pathname.includes("/mix-bag/payroll")`
- **params**, line 203: `params`
- **isLoading**, line 153: `useQuery({ queryKey: ["payrollData"], queryFn: async () => { try { const response = await axios.get("/api/payroll/get-payrolls"); return response.data; } catch (error) { throw new Error( error.response?.data?.message \|\| "Failed to fetch employees" ); } }, })`
- **isPayrollHistoryLoading**, line 168: `useQuery({ queryKey: ["payrollDrafts"], enabled: isMixBagPayroll, queryFn: async () => { const response = await axios.get("/api/payroll/drafts"); return response.data; }, })`
- **isSelectedPayrollProcessed**, line 488: `selectedPayrollRecord?.status === "Processed"`
- **selectedPayrollRecord**, line 473: `payrollDrafts.find((draft) => { const draftPeriod = new Date(draft.payPeriod); const draftPeriodKey = '${draftPeriod.getUTCFullYear()}-${String( draftPeriod.getUTCMonth() + 1 ).padStart(2, "0")}'; return ( draft.batchName === selectedBatch && draftPeriodKey === selectedPayPeriod ); })`
- **selectedBatch**, line 79: `useState( queryBatchName \|\| payrollReturnState?.batchName \|\| "Full Time Batch" )`
- **selectedPayPeriod**, line 82: `useState(() => { if (queryPayPeriod) return queryPayPeriod; if (payrollReturnState?.payPeriod) return payrollReturnState.payPeriod; const currentDate = new Date(); return '${currentDate.getFullYear()}-${String( currentDate.getMonth() + 1 ).padStart(2, "0")}'; })`
- **auth**, line 67: `useAuth()`
- **isSavingPayrollDraft**, line 131: `useMutation({ mutationFn: async () => { const response = await axios.post("/api/payroll/drafts", { batchName: selectedBatch, payPeriod: selectedPayPeriod, }); return response.data; }, onSuccess: (response) => { updatePayrollProgress(payrollProgressKey, null); queryClient.invalidateQueries({ queryKey: ["payrollDrafts"] }); toast.success(response.message \|\| "Payroll draft saved"); navigate("/app/dashboard/HR-dashboard/mix-bag/payroll-summary"); }, onError: (error) => { toast.error( error.response?.data?.message \|\| "Failed to save payroll draft" ); }, })`

## pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/payroll-summary/:draftId — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_SUMMARY_PAYROLL_MIX_BAG, ]} element={<PayrollEntry />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: onClick (button) | onClick | disabled | onClick — [PayrollEntry.jsx:58](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L58) |
| Remove (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | onRemove — [PayrollEntry.jsx:115](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L115) |
| 'Undo changes for ${employee.employeeName}' (button) | No local render guard detected; page/API access still applies | isProcessed \|\| (!isMarkedForDelete && !canUndoEmployee) \|\| isUndoingEmployee | () => { if (isMarkedForDelete) { toggleEmployeeForDelete(employee); return; } setEmployeeToUndo(employee); } — [PayrollEntry.jsx:792](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L792) |
| 'Edit ${employee.employeeName}' (button) | No local render guard detected; page/API access still applies | isProcessed | () => openEmployeeEdit(employee) — [PayrollEntry.jsx:818](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L818) |
| '${isMarkedForDelete ? "Unmark" : "Mark"} ${employee.employeeName} for deletion' (button) | No local render guard detected; page/API access still applies | isProcessed | () => toggleEmployeeForDelete(employee) — [PayrollEntry.jsx:828](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L828) |
| Void Payroll (button) | !isProcessed | isVoidingPayroll | () => setShowVoidConfirmation(true) — [PayrollEntry.jsx:883](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L883) |
| isPayrollSubmitted ? "Processed" : "Submit Payroll" (button) | No local render guard detected; page/API access still applies | isPayrollSubmitted \|\| isSubmittingPayroll; loading: isSubmittingPayroll | () => setShowSubmitConfirmation(true) — [PayrollEntry.jsx:889](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L889) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PayrollEntry.jsx:1025](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L1025) |
| Undo (button) | No local render guard detected; page/API access still applies | isProcessed \|\| (selectedEmployees.length === 0 && !draft.canUndo) \|\| isUndoingDraft; loading: isUndoingDraft | handleUndo — [PayrollEntry.jsx:1046](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L1046) |
| Payroll Detailed Export (button) | No local render guard detected; page/API access still applies | isExportingPayroll; loading: isExportingPayroll | exportPayrollDetails — [PayrollEntry.jsx:1058](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L1058) |
| 'Delete (${selectedEmployees.length})' (button) | selectedEmployees.length > 0 | No local disabled condition detected | () => setShowDeleteConfirmation(true) — [PayrollEntry.jsx:1065](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L1065) |
| Cancel (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setShowReleasePayslips(false) — [PayrollEntry.jsx:1187](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L1187) |
| payslipsGenerated ? "Retry Emails" : "Release" (button) | No local render guard detected; page/API access still applies | isReleasingOrRetrying \|\| allPayslipEmailsSent; loading: isReleasingOrRetrying | handleReleasePayslips — [PayrollEntry.jsx:1191](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L1191) |
| + Add New (button) | editingEmployee | No local disabled condition detected | () => addPayrollRow("allowanceItems", allowanceOptions) — [PayrollEntry.jsx:1255](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L1255) |
| + Add New (button) | editingEmployee | No local disabled condition detected | () => addPayrollRow("deductionItems", deductionOptions) — [PayrollEntry.jsx:1287](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L1287) |
| Cancel (button) | editingEmployee | No local disabled condition detected | () => setEditingEmployee(null) — [PayrollEntry.jsx:1388](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L1388) |
| Save (button) | editingEmployee | isSavingEmployee; loading: isSavingEmployee | saveEmployeeEdit — [PayrollEntry.jsx:1393](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollEntry.jsx#L1393) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isProcessed**, line 415: `draft.status === "Processed"`
- **isMarkedForDelete**, line 784: `selectedEmployees.some( (item) => item.id === employee.id )`
- **selectedEmployees**, line 225: `useState([])`
- **canUndoEmployee**, line 787: `(draft.undoableEmployeeIds \|\| []).some( (employeeId) => String(employeeId) === String(employee.employee) )`
- **isUndoingEmployee**, line 314: `useMutation({ mutationFn: async (employeeId) => { const response = await axios.post( '/api/payroll/drafts/${draftId}/employees/${employeeId}/undo' ); return response.data; }, })`
- **isVoidingPayroll**, line 268: `useMutation({ mutationFn: async () => { const response = await axios.delete('/api/payroll/drafts/${draftId}'); return response.data; }, })`
- **isPayrollSubmitted**, line 233: `useState(false)`
- **isSubmittingPayroll**, line 261: `useMutation({ mutationFn: async () => { const response = await axios.post('/api/payroll/drafts/${draftId}/submit'); return response.data; }, })`
- **isUndoingDraft**, line 307: `useMutation({ mutationFn: async () => { const response = await axios.post('/api/payroll/drafts/${draftId}/undo'); return response.data; }, })`
- **isExportingPayroll**, line 325: `useMutation({ mutationFn: async () => { const response = await axios.get( '/api/payroll/drafts/${draftId}/export' ); return response.data; }, })`
- **isReleasingOrRetrying**, line 436: `isReleasingPayslips \|\| isRetryingPayslipEmails`
- **isReleasingPayslips**, line 274: `useMutation({ mutationFn: async (sendEmails) => { const response = await axios.post( '/api/payroll/drafts/${draftId}/release-payslips', { sendEmails } ); return response.data; }, })`
- **isRetryingPayslipEmails**, line 284: `useMutation({ mutationFn: async () => { const response = await axios.post( '/api/payroll/drafts/${draftId}/retry-payslip-emails' ); return response.data; }, })`
- **allowanceOptions**, line 540: `canUseHra ? [...baseAllowanceOptions, "House Rent Allowance"] : baseAllowanceOptions`
- **canUseHra**, line 539: `Boolean(hraType) && hraType !== "custom"`
- **isSavingEmployee**, line 241: `useMutation({ mutationFn: async ({ employeeId, payload }) => { const response = await axios.patch( '/api/payroll/drafts/${draftId}/employees/${employeeId}', payload ); return response.data; }, })`

## pages/Dashboard/HrDashboard/Finance/PayrollSummary.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/payroll-summary — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_SUMMARY_PAYROLL_MIX_BAG, ]} element={<PayrollSummary />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => navigate( '/app/dashboard/HR-dashboard/mix-bag/payroll-summary/${row._id}', { state: { breadcrumbLabel: '${row.batchName} - ${dayjs( row.payPeriodValue ).format(… (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( '/app/dashboard/HR-dashboard/mix-bag/payroll-summary/${row._id}', { state: { breadcrumbLabel: '${row.batchName} - ${dayjs( row.payPeriodValue ).format("MMMM YYYY")}', }, } ) — [PayrollSummary.jsx:26](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollSummary.jsx#L26) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PayrollSummary.jsx:106](../../client/src/pages/Dashboard/HrDashboard/Finance/PayrollSummary.jsx#L106) |

## pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/finance/payroll/:id — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Remove (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | onRemove — [ViewPayroll.jsx:252](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L252) |
| View (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewUser(params.data) — [ViewPayroll.jsx:315](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L315) |
| Approve (configured menu/action) | status !== "Approved" && status !== "Rejected" | No local disabled condition detected | () => approveRequest(params.data.correctionId) — [ViewPayroll.jsx:324](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L324) |
| Reject (configured menu/action) | status !== "Approved" && status !== "Rejected" | No local disabled condition detected | () => rejectRequest(params.data.correctionId) — [ViewPayroll.jsx:329](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L329) |
| Accept (configured menu/action) | params.data.status === "Pending" | No local disabled condition detected | () => approveLeave(params.data.id) — [ViewPayroll.jsx:365](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L365) |
| Reject (configured menu/action) | params.data.status === "Pending" | No local disabled condition detected | () => rejectLeave(params.data.id) — [ViewPayroll.jsx:369](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L369) |
| Advanced filter (table-generated utility) | !compensationOnly; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ViewPayroll.jsx:980](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L980) |
| Advanced filter (table-generated utility) | !compensationOnly; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ViewPayroll.jsx:990](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L990) |
| Save (button) | isEditingCompensation AND !hideCompensationStructure | isSavingBankDetails \|\| isSavingPayrollCompensation \|\| !canValidateCtc \|\| isCtcMismatch; loading: isSavingBankDetails \|\| isSavingPayrollCompensation | handleSaveCompensation — [ViewPayroll.jsx:1006](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L1006) |
| Cancel (button) | isEditingCompensation AND !hideCompensationStructure | No local disabled condition detected | handleCancelCompensation — [ViewPayroll.jsx:1017](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L1017) |
| Edit (button) | NOT (isEditingCompensation) AND !hideCompensationStructure | No local disabled condition detected | handleEditCompensation — [ViewPayroll.jsx:1026](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L1026) |
| + Add Bank Details (button) | !visibleCompensation.compensation.bankName && !visibleCompensation.compensation.accountNumber AND visibleCompensation.compensation.paymentMethod === "Bank Deposit" AND NOT (isEditingCompensation) AND !hideCompensationStructure | No local disabled condition detected | handleAddBankDetails — [ViewPayroll.jsx:1313](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L1313) |
| + Add Bank Details (button) | visibleCompensation.compensation.paymentMethod !== "Bank Deposit" && !visibleCompensation.compensation.bankName && !visibleCompensation.compensation.accountNumber AND NOT (isEditingCompensation) AND !hideCompensationStructure | No local disabled condition detected | handleAddBankDetails — [ViewPayroll.jsx:1327](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L1327) |
| + Add New (button) | isEditingCompensation AND !hideCompensationStructure | No local disabled condition detected | () => addDynamicRow("allowances", availableAllowanceOptions) — [ViewPayroll.jsx:1397](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L1397) |
| + Add New (button) | isEditingCompensation AND !hideCompensationStructure | No local disabled condition detected | () => addDynamicRow("deductions", deductionOptions) — [ViewPayroll.jsx:1463](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L1463) |
| Generate Payslip (button) | status !== "Completed" AND !compensationOnly AND !hideCompensationStructure | true | handleGeneratePayslip — [ViewPayroll.jsx:1535](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L1535) |
| Download Payslip (button) | !compensationOnly AND !hideCompensationStructure | true | handleDownloadPayslip — [ViewPayroll.jsx:1542](../../client/src/pages/Dashboard/HrDashboard/Finance/ViewPayroll.jsx#L1542) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 312: `params`
- **params**, line 359: `params`
- **isEditingCompensation**, line 271: `useState(false)`
- **isSavingBankDetails**, line 441: `useMutation({ mutationFn: async (bankDetails) => { const response = await axios.patch( '/api/users/${employeeRecord?._id \|\| empId}/bank-details', bankDetails, ); return response.data; }, })`
- **isSavingPayrollCompensation**, line 452: `useMutation({ mutationFn: async (compensation) => { const response = await axios.patch( '/api/users/${employeeRecord?._id \|\| empId}/payroll-compensation', compensation, ); return response.data; }, })`
- **canValidateCtc**, line 755: `!isEmployeeLoading && !isEmployerCostsLoading && !isEmployerCostsError`
- **isEmployeeLoading**, line 412: `useQuery({ queryKey: ["payrollEmployee", employeeId], enabled: Boolean(employeeId), queryFn: async () => { const response = await axios.get( '/api/users/fetch-single-user/${employeeId}', ); return response.data; }, })`
- **isEmployerCostsLoading**, line 427: `useQuery({ queryKey: ["companyEmployerCosts"], queryFn: async () => { const response = await axios.get( "/api/company/get-company-data?field=employerCosts", ); return response.data?.employerCosts \|\| {}; }, })`
- **isCtcMismatch**, line 757: `canValidateCtc && Math.abs(calculatedCtc - storedCtc) > 0.01`

## pages/Dashboard/HrDashboard/HrEmployee/HrAttendance.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/attendance — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Attendance (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openViewAttendance(params.data) — [HrAttendance.jsx:515](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrAttendance.jsx#L515) |
| Manage Attendance (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openManageAttendance(params.data) — [HrAttendance.jsx:519](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrAttendance.jsx#L519) |
| Export (table-generated utility) | !isLoading; exportData: true | No local disabled condition detected | Shared table export — [HrAttendance.jsx:586](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrAttendance.jsx#L586) |
| Advanced filter (table-generated utility) | !isLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrAttendance.jsx:586](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrAttendance.jsx#L586) |
| Advanced filter (table-generated utility) | NOT (attendanceDetailsLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrAttendance.jsx:648](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrAttendance.jsx#L648) |
| Save (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setAttendanceSaveAttempted(true); if (workedDaysMatch) { setManageAttendanceOpen(false); setSelectedEmployee(null); setAttendanceSaveAttempted(false); } } — [HrAttendance.jsx:740](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrAttendance.jsx#L740) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 511: `params`
- **isLoading**, line 42: `useQuery({ queryKey: [ "hr-attendance", dateRange.startDate, dateRange.endDate, pagination.page, pagination.limit, ], queryFn: async () => { const response = await axios.get("/api/company/company-attandances", { params: { ...getAttendanceRangeParams(dateRange), page: pagination.page, limit: pagination.limit, }, }); const responsePagination = response.data?.pagination; setPagination((current) => ({ page: Number(responsePagination?.page) \|\| current.page, limit: Number(responsePagination?.limit) \|\| current.limit, total: Number(responsePagination?.total) \|\| 0, })); return response.data; }, placeholderData: keepPreviousData, })`

## pages/Dashboard/HrDashboard/HrEmployee/HrLeaves.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/leaves — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Leaves (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openViewLeaves(params.data) — [HrLeaves.jsx:831](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrLeaves.jsx#L831) |
| Manage Leaves (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openManageLeaves(params.data) — [HrLeaves.jsx:835](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrLeaves.jsx#L835) |
| Clear all (button) | activeFilterChips.length > 0 | No local disabled condition detected | () => setAppliedFilters(createDefaultFilters()) — [HrLeaves.jsx:970](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrLeaves.jsx#L970) |
| Export (table-generated utility) | !isLoading; exportData: true | No local disabled condition detected | Shared table export — [HrLeaves.jsx:981](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrLeaves.jsx#L981) |
| Open advanced leave filters (button) | !isLoading | No local disabled condition detected | () => setFilterOpen(true) — [HrLeaves.jsx:991](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrLeaves.jsx#L991) |
| Update Leaves (button) | No local render guard detected; page/API access still applies | loading: updateLeaveCountsMutation.isPending | No inline handler declared; may submit a form or delegate to a component — [HrLeaves.jsx:1153](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrLeaves.jsx#L1153) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 827: `params`
- **isLoading**, line 147: `useQuery({ queryKey: ["attendance"], queryFn: async () => { const response = await axios.get("/api/company/company-attandances"); return response.data; }, })`

## pages/Dashboard/HrDashboard/HrEmployee/HrLeavesAdvancedFilter.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | resetFilters — [HrLeavesAdvancedFilter.jsx:135](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrLeavesAdvancedFilter.jsx#L135) |
| Apply (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => onApply(filters) — [HrLeavesAdvancedFilter.jsx:136](../../client/src/pages/Dashboard/HrDashboard/HrEmployee/HrLeavesAdvancedFilter.jsx#L136) |

## pages/Dashboard/HrDashboard/HrSettings/BulkUpload.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [BulkUpload.jsx:60](../../client/src/pages/Dashboard/HrDashboard/HrSettings/BulkUpload.jsx#L60) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [BulkUpload.jsx:79](../../client/src/pages/Dashboard/HrDashboard/HrSettings/BulkUpload.jsx#L79) |

## pages/Dashboard/HrDashboard/HrSettings/CompanyLogo.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/company/company-settings/company-logo — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| uploading ? "Uploading..." : "Upload Image" (button) | selectedFile | uploading | No inline handler declared; may submit a form or delegate to a component — [CompanyLogo.jsx:126](../../client/src/pages/Dashboard/HrDashboard/HrSettings/CompanyLogo.jsx#L126) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedFile**, line 19: `watch("logo")`

## pages/Dashboard/HrDashboard/HrSettings/EmployeeType.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/company/company-structure-workforce/employee-type — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View employee type (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleView(params.data) — [EmployeeType.jsx:236](../../client/src/pages/Dashboard/HrDashboard/HrSettings/EmployeeType.jsx#L236) |
| Restore employee type (button) | isDeleted | No local disabled condition detected | () => handleRestore(params.data) — [EmployeeType.jsx:248](../../client/src/pages/Dashboard/HrDashboard/HrSettings/EmployeeType.jsx#L248) |
| Permanently delete employee type (button) | isDeleted | No local disabled condition detected | () => handlePermanentDelete(params.data) — [EmployeeType.jsx:257](../../client/src/pages/Dashboard/HrDashboard/HrSettings/EmployeeType.jsx#L257) |
| Edit employee type (button) | NOT (isDeleted) | No local disabled condition detected | () => handleEdit(params.data) — [EmployeeType.jsx:269](../../client/src/pages/Dashboard/HrDashboard/HrSettings/EmployeeType.jsx#L269) |
| isTechDepartment ? "Permanently delete employee type" : "Delete employee type" (button) | NOT (isDeleted) | No local disabled condition detected | () => handleDelete(params.data) — [EmployeeType.jsx:278](../../client/src/pages/Dashboard/HrDashboard/HrSettings/EmployeeType.jsx#L278) |
| Add Employee Type (table-generated action) | No local render guard detected; page/API access still applies | !hasAddEmployeeTypeAccess | handleAddType — [EmployeeType.jsx:322](../../client/src/pages/Dashboard/HrDashboard/HrSettings/EmployeeType.jsx#L322) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [EmployeeType.jsx:322](../../client/src/pages/Dashboard/HrDashboard/HrSettings/EmployeeType.jsx#L322) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [EmployeeType.jsx:322](../../client/src/pages/Dashboard/HrDashboard/HrSettings/EmployeeType.jsx#L322) |
| modalMode === "add" ? "Add" : "Update" (button) | NOT (modalMode === "view") | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [EmployeeType.jsx:432](../../client/src/pages/Dashboard/HrDashboard/HrSettings/EmployeeType.jsx#L432) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 231: `params`
- **isDeleted**, line 232: `params.data.isDeleted`
- **hasAddEmployeeTypeAccess**, line 43: `hasPermission( PERMISSIONS.HR_ADD_EMPLOYEE_TYPE.value, )`
- **hasPermission**, line 33: `useUserPermissions()`

## pages/Dashboard/HrDashboard/HrSettings/HrPolicies.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [HrPolicies.jsx:63](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrPolicies.jsx#L63) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrPolicies.jsx:82](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrPolicies.jsx#L82) |

## pages/Dashboard/HrDashboard/HrSettings/HrSOP.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/company/company-settings/sops — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Restore SOP (button) | isDeleted | restoreSopMutation.isPending \|\| deleteSopMutation.isPending | () => handleRestore(params.data) — [HrSOP.jsx:334](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSOP.jsx#L334) |
| Permanently delete SOP (button) | isDeleted | deleteSopMutation.isPending \|\| restoreSopMutation.isPending | () => handleDelete(params.data) — [HrSOP.jsx:346](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSOP.jsx#L346) |
| 'Mark SOP as ${isActive ? "inactive" : "active"}' (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleOpenInactive(params.data) — [HrSOP.jsx:364](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSOP.jsx#L364) |
| Edit SOP (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleOpenEdit(params.data) — [HrSOP.jsx:381](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSOP.jsx#L381) |
| isTechDepartment ? "Permanently delete SOP" : "Delete SOP" (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleDelete(params.data) — [HrSOP.jsx:390](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSOP.jsx#L390) |
| Add SOP (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleOpenAdd — [HrSOP.jsx:407](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSOP.jsx#L407) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrSOP.jsx:407](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSOP.jsx#L407) |
| Update SOP (button) | modalType === "edit" | loading: updateSopMutation.isPending | No inline handler declared; may submit a form or delegate to a component — [HrSOP.jsx:472](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSOP.jsx#L472) |
| Icon/action: IconButton (button) | NOT (modalType === "edit") | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [HrSOP.jsx:524](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSOP.jsx#L524) |
| Add SOP (button) | NOT (modalType === "edit") | loading: addSopMutation.isPending | No inline handler declared; may submit a form or delegate to a component — [HrSOP.jsx:534](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSOP.jsx#L534) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isDeleted**, line 329: `params.data.isDeleted`
- **params**, line 327: `params`

## pages/Dashboard/HrDashboard/HrSettings/HrSettingsDepartments.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/company/company-structure-workforce/departments — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| 'Mark department as ${isActive ? "inactive" : "active"}' (button) | No local render guard detected; page/API access still applies | isUpdatingDepartmentStatus && statusUpdatingDepartmentId === params.data.departmentId | () => handleStatus(params.data) — [HrSettingsDepartments.jsx:266](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsDepartments.jsx#L266) |
| Edit department (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleOpenEdit(params.data) — [HrSettingsDepartments.jsx:287](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsDepartments.jsx#L287) |
| Add Department (table-generated action) | !departmentLoading | No local disabled condition detected | handleOpenModal — [HrSettingsDepartments.jsx:315](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsDepartments.jsx#L315) |
| Export (table-generated utility) | !departmentLoading; exportData: true | No local disabled condition detected | Shared table export — [HrSettingsDepartments.jsx:315](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsDepartments.jsx#L315) |
| Advanced filter (table-generated utility) | !departmentLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrSettingsDepartments.jsx:315](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsDepartments.jsx#L315) |
| modalType === "edit" ? "Update Department" : "Add Department" (button) | No local render guard detected; page/API access still applies | isAddingDepartment \|\| isEditingDepartment; loading: isAddingDepartment \|\| isEditingDepartment | () => {} — [HrSettingsDepartments.jsx:371](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsDepartments.jsx#L371) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isUpdatingDepartmentStatus**, line 100: `useMutation({ mutationKey: ["mark-department-status"], mutationFn: async ({ departmentId, isActive }) => { const response = await axios.patch( "/api/company/mark-department-status", { departmentId, isActive, }, ); return response.data; }, onMutate: ({ departmentId }) => { setStatusUpdatingDepartmentId(departmentId); }, onSuccess: (data) => { toast.success(data?.message \|\| "Department status updated"); queryClient.invalidateQueries({ queryKey: ["departments"] }); queryClient.invalidateQueries({ queryKey: ["selectedDepartments"] }); setConfirmationAction(null); }, onError: (error) => { const message = error?.response?.data?.message \|\| error.message; toast.error(message \|\| "Failed to update department status"); }, onSettled: () => { setStatusUpdatingDepartmentId(null); }, })`
- **params**, line 261: `params`
- **isAddingDepartment**, line 77: `useMutation({ mutationKey: ["add-department"], mutationFn: async ({ deptName }) => { const payload = { deptName: deptName.trim(), deptId: createDepartmentId(deptName), }; const response = await axios.post("/api/company/add-department", payload); return response.data; }, onSuccess: (data) => { toast.success(data?.message \|\| "Department added"); queryClient.invalidateQueries({ queryKey: ["departments"] }); queryClient.invalidateQueries({ queryKey: ["selectedDepartments"] }); reset(); setOpenModal(false); }, onError: (error) => { const message = error?.response?.data?.message \|\| error.message; toast.error(message \|\| "Failed to add department"); }, })`
- **isEditingDepartment**, line 133: `useMutation({ mutationKey: ["edit-department"], mutationFn: async ({ departmentId, deptName }) => { const response = await axios.patch("/api/company/edit-department", { departmentId, name: deptName.trim(), }); return response.data; }, onSuccess: (data) => { toast.success(data?.message \|\| "Department updated"); queryClient.invalidateQueries({ queryKey: ["departments"] }); queryClient.invalidateQueries({ queryKey: ["selectedDepartments"] }); reset(); setSelectedDepartment(null); setOpenModal(false); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| "Failed to update department", ); }, })`

## pages/Dashboard/HrDashboard/HrSettings/HrSettingsPolicies.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/company/company-settings/policies — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Restore policy (button) | isDeleted | restorePolicyMutation.isPending \|\| deletePolicyMutation.isPending | () => handleRestore(params.data) — [HrSettingsPolicies.jsx:340](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsPolicies.jsx#L340) |
| Permanently delete policy (button) | isDeleted | deletePolicyMutation.isPending \|\| restorePolicyMutation.isPending | () => handleDelete(params.data) — [HrSettingsPolicies.jsx:353](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsPolicies.jsx#L353) |
| 'Mark policy as ${isActive ? "inactive" : "active"}' (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleStatus(params.data) — [HrSettingsPolicies.jsx:372](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsPolicies.jsx#L372) |
| Edit policy (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleEdit(params.data) — [HrSettingsPolicies.jsx:389](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsPolicies.jsx#L389) |
| isTechDepartment ? "Permanently delete policy" : "Delete policy" (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleDelete(params.data) — [HrSettingsPolicies.jsx:398](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsPolicies.jsx#L398) |
| Add Policy (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setModalType("add"); addReset({ policyName: "", policyType: "None", file: null }); setOpenModal(true); } — [HrSettingsPolicies.jsx:415](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsPolicies.jsx#L415) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrSettingsPolicies.jsx:415](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsPolicies.jsx#L415) |
| Icon/action: IconButton (button) | modalType === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [HrSettingsPolicies.jsx:526](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsPolicies.jsx#L526) |
| Submit (button) | modalType === "add" | addPolicyMutation.isPending; loading: addPolicyMutation.isPending | No inline handler declared; may submit a form or delegate to a component — [HrSettingsPolicies.jsx:539](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsPolicies.jsx#L539) |
| modalType === "edit" ? "Update Policy" : "Add Policy" (button) | modalType === "edit" | addPolicyMutation.isPending \|\| updatePolicyMutation.isPending; loading: addPolicyMutation.isPending \|\| updatePolicyMutation.isPending | No inline handler declared; may submit a form or delegate to a component — [HrSettingsPolicies.jsx:594](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSettingsPolicies.jsx#L594) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isDeleted**, line 335: `params.data.isDeleted`
- **params**, line 333: `params`

## pages/Dashboard/HrDashboard/HrSettings/HrSops.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | triggerFileDialog — [HrSops.jsx:97](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSops.jsx#L97) |
| Action: handleUpload (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleUpload — [HrSops.jsx:101](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSops.jsx#L101) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrSops.jsx:122](../../client/src/pages/Dashboard/HrDashboard/HrSettings/HrSops.jsx#L122) |

## pages/Dashboard/HrDashboard/HrSettings/LeaveType.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Add Leave Type (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [LeaveType.jsx:89](../../client/src/pages/Dashboard/HrDashboard/HrSettings/LeaveType.jsx#L89) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [LeaveType.jsx:89](../../client/src/pages/Dashboard/HrDashboard/HrSettings/LeaveType.jsx#L89) |

## pages/Dashboard/HrDashboard/HrSettings/Shifts.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/company/company-structure-workforce/shifts — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View shift (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleView(params.data) — [Shifts.jsx:247](../../client/src/pages/Dashboard/HrDashboard/HrSettings/Shifts.jsx#L247) |
| Restore shift (button) | isDeleted | No local disabled condition detected | () => handleRestore(params.data) — [Shifts.jsx:259](../../client/src/pages/Dashboard/HrDashboard/HrSettings/Shifts.jsx#L259) |
| Permanently delete shift (button) | isDeleted | No local disabled condition detected | () => handlePermanentDelete(params.data) — [Shifts.jsx:268](../../client/src/pages/Dashboard/HrDashboard/HrSettings/Shifts.jsx#L268) |
| Edit shift (button) | NOT (isDeleted) | No local disabled condition detected | () => handleEdit(params.data) — [Shifts.jsx:280](../../client/src/pages/Dashboard/HrDashboard/HrSettings/Shifts.jsx#L280) |
| isTechDepartment ? "Permanently delete shift" : "Delete shift" (button) | NOT (isDeleted) | No local disabled condition detected | () => handleDelete(params.data) — [Shifts.jsx:289](../../client/src/pages/Dashboard/HrDashboard/HrSettings/Shifts.jsx#L289) |
| Add Shift List (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setModalMode("add"); setOpenModal(true); } — [Shifts.jsx:352](../../client/src/pages/Dashboard/HrDashboard/HrSettings/Shifts.jsx#L352) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [Shifts.jsx:352](../../client/src/pages/Dashboard/HrDashboard/HrSettings/Shifts.jsx#L352) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Shifts.jsx:352](../../client/src/pages/Dashboard/HrDashboard/HrSettings/Shifts.jsx#L352) |
| Add Shift (button) | modalMode === "add" | loading: isAddPending | No inline handler declared; may submit a form or delegate to a component — [Shifts.jsx:473](../../client/src/pages/Dashboard/HrDashboard/HrSettings/Shifts.jsx#L473) |
| Update Shift (button) | modalMode === "edit" | loading: isAddPending | No inline handler declared; may submit a form or delegate to a component — [Shifts.jsx:566](../../client/src/pages/Dashboard/HrDashboard/HrSettings/Shifts.jsx#L566) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 242: `params`
- **isDeleted**, line 243: `params.data.isDeleted`

## pages/Dashboard/HrDashboard/HrSettings/WorkLocations.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/company/company-structure-workforce/work-locations — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Restore work location (button) | isDeleted | restoreLocationMutation.isPending \|\| deleteLocationMutation.isPending | () => handleRestore(params.data) — [WorkLocations.jsx:325](../../client/src/pages/Dashboard/HrDashboard/HrSettings/WorkLocations.jsx#L325) |
| Permanently delete work location (button) | isDeleted | deleteLocationMutation.isPending \|\| restoreLocationMutation.isPending | () => handleDelete(params.data) — [WorkLocations.jsx:338](../../client/src/pages/Dashboard/HrDashboard/HrSettings/WorkLocations.jsx#L338) |
| 'Mark work location as ${isActive ? "inactive" : "active"}' (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleMarkStatus(params.data) — [WorkLocations.jsx:357](../../client/src/pages/Dashboard/HrDashboard/HrSettings/WorkLocations.jsx#L357) |
| Edit work location (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleEdit(params.data) — [WorkLocations.jsx:374](../../client/src/pages/Dashboard/HrDashboard/HrSettings/WorkLocations.jsx#L374) |
| isTechDepartment ? "Permanently delete work location" : "Delete work location" (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleDelete(params.data) — [WorkLocations.jsx:383](../../client/src/pages/Dashboard/HrDashboard/HrSettings/WorkLocations.jsx#L383) |
| Add Work Location (table-generated action) | NOT (isLoading) | No local disabled condition detected | handleAddLocation — [WorkLocations.jsx:434](../../client/src/pages/Dashboard/HrDashboard/HrSettings/WorkLocations.jsx#L434) |
| Export (table-generated utility) | NOT (isLoading); exportData: true | No local disabled condition detected | Shared table export — [WorkLocations.jsx:434](../../client/src/pages/Dashboard/HrDashboard/HrSettings/WorkLocations.jsx#L434) |
| Advanced filter (table-generated utility) | NOT (isLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [WorkLocations.jsx:434](../../client/src/pages/Dashboard/HrDashboard/HrSettings/WorkLocations.jsx#L434) |
| modalType === "edit" ? "Update" : "Submit" (button) | No local render guard detected; page/API access still applies | isAddWorkLocation \|\| isEditWorkLocation; loading: isAddWorkLocation \|\| isEditWorkLocation | No inline handler declared; may submit a form or delegate to a component — [WorkLocations.jsx:652](../../client/src/pages/Dashboard/HrDashboard/HrSettings/WorkLocations.jsx#L652) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isDeleted**, line 320: `params.data.isDeleted`
- **params**, line 318: `params`
- **isLoading**, line 142: `useQuery({ queryKey: ["workLocation", Boolean(isTechDepartment)], queryFn: async () => { try { const response = await axios.get( '/api/company/buildings${ isTechDepartment ? "?includeDeleted=true" : "" }', ); return response.data; } catch (error) { throw new Error(error.response.data.message); } }, })`
- **isTechDepartment**, line 32: `auth?.user?.departments?.some( (department) => String(department?._id \|\| department) === TECH_DEPARTMENT_ID \|\| ["tech", "tech department"].includes( department?.name?.trim().toLowerCase(), ), )`
- **auth**, line 25: `useAuth()`
- **isAddWorkLocation**, line 71: `useMutation({ mutationKey: ["mutateWorkLocation"], mutationFn: async (data) => { const response = await axios.post("/api/company/add-building", { buildingName: data.workLocation, address: data.address, city: data.city, // state: data.state, state: states?.find((c) => c.isoCode === data.state).name, country: countries.find((c) => c.isoCode === data.country).name, pincode: data.pincode, }); return response.data; }, onSuccess: (data) => { reset(); toast.success(data.message \|\| "Work Location Added"); queryClient.invalidateQueries({ queryKey: ["workLocation"] }); reset(); setOpenModal(false); }, onError: (error) => { toast.error(error.message \|\| "Failed to Add Work Location"); }, })`
- **isEditWorkLocation**, line 102: `useMutation({ mutationFn: async ({ buildingId, payload }) => { const response = await axios.patch( '/api/company/edit-building/${buildingId}', payload, ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Work Location updated"); queryClient.invalidateQueries({ queryKey: ["workLocation"] }); setOpenModal(false); setConfirmationAction(null); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| "Failed to update Work Location", ); }, })`

## pages/Dashboard/HrDashboard/HrTasks/HrCompletedMemberKpaDetails.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/overall-KPA/department-KPA/:department/member-wise/*/monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KPA_MEMBER_WISE_OVERVIEW_TAB, ]} element={<HrMemberKpaDetailsLayout />} />`
- /app/dashboard/HR-dashboard/overall-KPA/department-KPA/:department/member-wise/*/individual-Monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KPA_MEMBER_WISE_OVERVIEW_TAB, ]} element={<HrMemberKpaDetailsLayout />} />`
- /app/dashboard/HR-dashboard/overall-KPA/department-KPA/:department/member-wise/*/team-Monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KPA_MEMBER_WISE_OVERVIEW_TAB, ]} element={<HrMemberKpaDetailsLayout />} />`
- /app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KPA/:department/member-wise/*/monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KPA_MEMBER_WISE_OVERVIEW_TAB, ]} element={<HrMemberKpaDetailsLayout />} />`
- /app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KPA/:department/member-wise/*/individual-Monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KPA_MEMBER_WISE_OVERVIEW_TAB, ]} element={<HrMemberKpaDetailsLayout />} />`
- /app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KPA/:department/member-wise/*/team-Monthly-KPA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KPA_MEMBER_WISE_OVERVIEW_TAB, ]} element={<HrMemberKpaDetailsLayout />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [HrCompletedMemberKpaDetails.jsx:164](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrCompletedMemberKpaDetails.jsx#L164) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrCompletedMemberKpaDetails.jsx:164](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrCompletedMemberKpaDetails.jsx#L164) |

## pages/Dashboard/HrDashboard/HrTasks/HrCompletedMemberKraDetails.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/overall-KPA/department-KRA/:department/member-wise/*/daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KRA_MEMBER_WISE_OVERVIEW_TAB, ]} element={<HrMemberKraDetailsLayout />} />`
- /app/dashboard/HR-dashboard/overall-KPA/department-KRA/:department/member-wise/*/individual-Daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KRA_MEMBER_WISE_OVERVIEW_TAB, ]} element={<HrMemberKraDetailsLayout />} />`
- /app/dashboard/HR-dashboard/overall-KPA/department-KRA/:department/member-wise/*/team-Daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KRA_MEMBER_WISE_OVERVIEW_TAB, ]} element={<HrMemberKraDetailsLayout />} />`
- /app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KRA/:department/member-wise/*/daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KRA_MEMBER_WISE_OVERVIEW_TAB, ]} element={<HrMemberKraDetailsLayout />} />`
- /app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KRA/:department/member-wise/*/individual-Daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KRA_MEMBER_WISE_OVERVIEW_TAB, ]} element={<HrMemberKraDetailsLayout />} />`
- /app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KRA/:department/member-wise/*/team-Daily-KRA — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KRA_MEMBER_WISE_OVERVIEW_TAB, ]} element={<HrMemberKraDetailsLayout />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Today Export (table-generated action) | No local render guard detected; page/API access still applies | isDailyExportDisabled | handleDailyExport — [HrCompletedMemberKraDetails.jsx:244](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrCompletedMemberKraDetails.jsx#L244) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrCompletedMemberKraDetails.jsx:244](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrCompletedMemberKraDetails.jsx#L244) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isDailyExportDisabled**, line 203: `!hasTodayCompletedRows \|\| !isTodayInSelectedRange`
- **hasTodayCompletedRows**, line 190: `useMemo( () => completedRows.some((row) => { const completionDate = row?.actualCompletionDateRaw; if (!completionDate) return false; return ( (row?.status \|\| "").toString().toLowerCase() === "completed" && toDateKey(completionDate) === dayjs().format("YYYY-MM-DD") ); }), [completedRows], )`
- **isTodayInSelectedRange**, line 69: `useState(true)`

## pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKPA.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/overall-KPA/department-KPA/:department/department-wise — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KPA_DEPARTMENT_WISE_OVERVIEW_TAB, ]} element={<HrDepartmentKPA />} />`
- /app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KPA/:department/department-wise — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KPA_DEPARTMENT_WISE_OVERVIEW_TAB, ]} element={<HrDepartmentKPA />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handlePrevFiscalYear — [HrDepartmentKPA.jsx:500](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKPA.jsx#L500) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleNextFiscalYear — [HrDepartmentKPA.jsx:506](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKPA.jsx#L506) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handlePrevMonth — [HrDepartmentKPA.jsx:524](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKPA.jsx#L524) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleNextMonth — [HrDepartmentKPA.jsx:533](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKPA.jsx#L533) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [HrDepartmentKPA.jsx:542](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKPA.jsx#L542) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrDepartmentKPA.jsx:542](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKPA.jsx#L542) |

## pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKRA.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/overall-KPA/department-KRA/:department/department-wise — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KRA_DEPARTMENT_WISE_OVERVIEW_TAB, ]} element={<HrDepartmentKRA />} />`
- /app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KRA/:department/department-wise — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_DEPARTMENT_KRA_DEPARTMENT_WISE_OVERVIEW_TAB, ]} element={<HrDepartmentKRA />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handlePreviousDate — [HrDepartmentKRA.jsx:382](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKRA.jsx#L382) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleNextDate — [HrDepartmentKRA.jsx:392](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKRA.jsx#L392) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [HrDepartmentKRA.jsx:406](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKRA.jsx#L406) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrDepartmentKRA.jsx:406](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKRA.jsx#L406) |

## pages/Dashboard/HrDashboard/HrTasks/HrDepartmentTasks.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/overall-KPA/department-tasks/:department — no permission wrapper detected on this route-object chain
- /app/dashboard/HR-dashboard/mix-bag/department-tasks/department-task/:department — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handlePrevFiscalYear — [HrDepartmentTasks.jsx:453](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentTasks.jsx#L453) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleNextFiscalYear — [HrDepartmentTasks.jsx:461](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentTasks.jsx#L461) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handlePrevMonth — [HrDepartmentTasks.jsx:479](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentTasks.jsx#L479) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleNextMonth — [HrDepartmentTasks.jsx:488](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentTasks.jsx#L488) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [HrDepartmentTasks.jsx:496](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentTasks.jsx#L496) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrDepartmentTasks.jsx:496](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrDepartmentTasks.jsx#L496) |

## pages/Dashboard/HrDashboard/HrTasks/HrKPA.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/overall-KPA/department-KPA — no permission wrapper detected on this route-object chain
- /app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KPA — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate( '${params.value}', { state: { month: effectiveSelectedMonth, department: params.value, tasks: groupedTasks[params.value], year: effectiveSelectedYear, }, } … (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( '${params.value}', { state: { month: effectiveSelectedMonth, department: params.value, tasks: groupedTasks[params.value], year: effectiveSelectedYear, }, } ) — [HrKPA.jsx:257](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrKPA.jsx#L257) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handlePrevMonth — [HrKPA.jsx:303](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrKPA.jsx#L303) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleNextMonth — [HrKPA.jsx:312](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrKPA.jsx#L312) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [HrKPA.jsx:330](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrKPA.jsx#L330) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrKPA.jsx:330](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrKPA.jsx#L330) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 256: `params`

## pages/Dashboard/HrDashboard/HrTasks/HrKRA.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/overall-KPA/department-KRA — no permission wrapper detected on this route-object chain
- /app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KRA — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate('${params.value}', { state: { department: params.value, tasks: groupedTasks[params.value], selectedDate: selectedDateKey, }, }) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate('${params.value}', { state: { department: params.value, tasks: groupedTasks[params.value], selectedDate: selectedDateKey, }, }) — [HrKRA.jsx:296](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrKRA.jsx#L296) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handlePreviousDate — [HrKRA.jsx:377](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrKRA.jsx#L377) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleNextDate — [HrKRA.jsx:387](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrKRA.jsx#L387) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [HrKRA.jsx:401](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrKRA.jsx#L401) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrKRA.jsx:401](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrKRA.jsx#L401) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 295: `params`
- **selectedDate**, line 63: `useState(new Date())`
- **selectedDateKey**, line 65: `formatDateKey(selectedDate)`

## pages/Dashboard/HrDashboard/HrTasks/HrOverallTasks.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/overall-KPA/department-tasks — no permission wrapper detected on this route-object chain
- /app/dashboard/HR-dashboard/mix-bag/department-tasks/department-task — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate( // '/app/dashboard/HR-dashboard/overall-KPA/department-tasks/${params.value}', '${params.value}', { state: { month: activeMonth, department: params.value, t… (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( // '/app/dashboard/HR-dashboard/overall-KPA/department-tasks/${params.value}', '${params.value}', { state: { month: activeMonth, department: params.value, tasks: groupedTasks[params.value], year: activeYear, }, } ) — [HrOverallTasks.jsx:308](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrOverallTasks.jsx#L308) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handlePrevMonth — [HrOverallTasks.jsx:355](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrOverallTasks.jsx#L355) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleNextMonth — [HrOverallTasks.jsx:364](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrOverallTasks.jsx#L364) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [HrOverallTasks.jsx:382](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrOverallTasks.jsx#L382) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrOverallTasks.jsx:382](../../client/src/pages/Dashboard/HrDashboard/HrTasks/HrOverallTasks.jsx#L382) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 307: `params`

## pages/Dashboard/HrDashboard/Mixbag/AttendanceCompleted.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/attendance/completed — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewDetails(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewDetails(params.data) — [AttendanceCompleted.jsx:43](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceCompleted.jsx#L43) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AttendanceCompleted.jsx:88](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceCompleted.jsx#L88) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AttendanceCompleted.jsx:88](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceCompleted.jsx#L88) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 42: `params`
- **data**, line 20: `useQuery({ queryKey: ["attendance-requests"], queryFn: async () => { try { const response = await axios.get( "/api/attendance/get-attendance-requests" ); return response.data.filter((data) => data.status !== "Pending"); } catch (error) { console.warn(error.mesage); } }, })`

## pages/Dashboard/HrDashboard/Mixbag/AttendanceLogsTimeline.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/logs-timeline — `<PerformancePermissionRoute permissions={[PERMISSIONS.HR_ATTENDANCE_LOGS_TIMELINE]} element={<AttendanceLogsTimeline />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Photo (button) | value | No local disabled condition detected | () => setSelectedPhoto({ url: value, employeeName: data.employeeName, type: data.type, typeLabel: data.typeLabel, date: data.date, timeLabel: data.timeLabel, }) — [AttendanceLogsTimeline.jsx:351](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceLogsTimeline.jsx#L351) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AttendanceLogsTimeline.jsx:379](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceLogsTimeline.jsx#L379) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AttendanceLogsTimeline.jsx:379](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceLogsTimeline.jsx#L379) |
| Previous day (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedDate((date) => shiftDate(date, -1)) — [AttendanceLogsTimeline.jsx:432](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceLogsTimeline.jsx#L432) |
| Next day (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedDate((date) => shiftDate(date, 1)) — [AttendanceLogsTimeline.jsx:476](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceLogsTimeline.jsx#L476) |
| Close attendance photo (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedPhoto(null) — [AttendanceLogsTimeline.jsx:610](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceLogsTimeline.jsx#L610) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **data**, line 349: `{ value, data }`

## pages/Dashboard/HrDashboard/Mixbag/AttendanceRequests.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/attendance/pending-approvals — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Details (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewUser(params.data) — [AttendanceRequests.jsx:101](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceRequests.jsx#L101) |
| Approve (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => approveRequest(params.data._id) — [AttendanceRequests.jsx:109](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceRequests.jsx#L109) |
| Reject (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => rejectRequest(params.data._id) — [AttendanceRequests.jsx:114](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceRequests.jsx#L114) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AttendanceRequests.jsx:151](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceRequests.jsx#L151) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AttendanceRequests.jsx:151](../../client/src/pages/Dashboard/HrDashboard/Mixbag/AttendanceRequests.jsx#L151) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 99: `params`

## pages/Dashboard/HrDashboard/Mixbag/CompletedLeaveRequests.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/leaves/completed-approvals — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [CompletedLeaveRequests.jsx:96](../../client/src/pages/Dashboard/HrDashboard/Mixbag/CompletedLeaveRequests.jsx#L96) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [CompletedLeaveRequests.jsx:96](../../client/src/pages/Dashboard/HrDashboard/Mixbag/CompletedLeaveRequests.jsx#L96) |

## pages/Dashboard/HrDashboard/Mixbag/CurrentLeaveBalanceReport.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/reports/current-leave-balance — `<PerformancePermissionRoute permissions={[PERMISSIONS.HR_REPORTS_MIX_BAG]} element={<CurrentLeaveBalanceReport />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Open advanced report filters (button) | NOT (isLoading && !rows.length) | No local disabled condition detected | () => setFilterOpen(true) — [CurrentLeaveBalanceReport.jsx:104](../../client/src/pages/Dashboard/HrDashboard/Mixbag/CurrentLeaveBalanceReport.jsx#L104) |
| Export (button) | NOT (isLoading && !rows.length) | No local disabled condition detected | () => tableRef.current?.api?.exportDataAsCsv({ fileName: "Current Leave Balance Report.csv", }) — [CurrentLeaveBalanceReport.jsx:112](../../client/src/pages/Dashboard/HrDashboard/Mixbag/CurrentLeaveBalanceReport.jsx#L112) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isLoading**, line 24: `useQuery({ queryKey: [ "current-leave-balance-report", filters, search, pagination.page, pagination.limit, ], queryFn: async () => { const response = await axios.get("/api/leaves/current-leave-balance-report", { params: { ...filters, search, page: pagination.page, limit: pagination.limit, }, }); return response.data; }, placeholderData: keepPreviousData, })`

## pages/Dashboard/HrDashboard/Mixbag/CurrentLeaveBalanceReportFilter.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | reset — [CurrentLeaveBalanceReportFilter.jsx:64](../../client/src/pages/Dashboard/HrDashboard/Mixbag/CurrentLeaveBalanceReportFilter.jsx#L64) |
| Apply (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => onApply(filters) — [CurrentLeaveBalanceReportFilter.jsx:65](../../client/src/pages/Dashboard/HrDashboard/Mixbag/CurrentLeaveBalanceReportFilter.jsx#L65) |

## pages/Dashboard/HrDashboard/Mixbag/HrPayslips.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/payslips — `<PerformancePermissionRoute permissions={[PERMISSIONS.HR_PAYSLIPS_MIX_BAG]} element={<HrPayslips />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Download payslip (button) | data?.payslipLink | No local disabled condition detected | () => handleDownloadPayslip(data) — [HrPayslips.jsx:208](../../client/src/pages/Dashboard/HrDashboard/Mixbag/HrPayslips.jsx#L208) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [HrPayslips.jsx:319](../../client/src/pages/Dashboard/HrDashboard/Mixbag/HrPayslips.jsx#L319) |
| Filter payslips (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setFiltersOpen(true) — [HrPayslips.jsx:327](../../client/src/pages/Dashboard/HrDashboard/Mixbag/HrPayslips.jsx#L327) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **data**, line 206: `{ data }`

## pages/Dashboard/HrDashboard/Mixbag/HrReportDirectory.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/reports — `<PerformancePermissionRoute permissions={[PERMISSIONS.HR_REPORTS_MIX_BAG]} element={<HrReportDirectory />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => openReport(report) (button) | No local render guard detected; page/API access still applies | report !== "Paid & Unpaid Leave Report" && report !== "Current Leave Balance Report" && report !== "Leaves History Report" | () => openReport(report) — [HrReportDirectory.jsx:81](../../client/src/pages/Dashboard/HrDashboard/Mixbag/HrReportDirectory.jsx#L81) |

## pages/Dashboard/HrDashboard/Mixbag/LeaveHistoryReport.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/reports/leave-history — `<PerformancePermissionRoute permissions={[PERMISSIONS.HR_REPORTS_MIX_BAG]} element={<LeaveHistoryReport />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Open advanced report filters (button) | NOT (isLoading && !rows.length) | No local disabled condition detected | () => setFilterOpen(true) — [LeaveHistoryReport.jsx:109](../../client/src/pages/Dashboard/HrDashboard/Mixbag/LeaveHistoryReport.jsx#L109) |
| Export (button) | NOT (isLoading && !rows.length) | No local disabled condition detected | () => tableRef.current?.api?.exportDataAsCsv({ fileName: "Leaves History Report.csv", }) — [LeaveHistoryReport.jsx:117](../../client/src/pages/Dashboard/HrDashboard/Mixbag/LeaveHistoryReport.jsx#L117) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isLoading**, line 36: `useQuery({ queryKey: ["leave-history-report", filters, search, pagination.page, pagination.limit], queryFn: async () => { const response = await axios.get("/api/leaves/leave-history-report", { params: { ...filters, search, page: pagination.page, limit: pagination.limit, }, }); return response.data; }, placeholderData: keepPreviousData, })`

## pages/Dashboard/HrDashboard/Mixbag/LeaveHistoryReportFilter.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | reset — [LeaveHistoryReportFilter.jsx:83](../../client/src/pages/Dashboard/HrDashboard/Mixbag/LeaveHistoryReportFilter.jsx#L83) |
| Apply (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => onApply(filters) — [LeaveHistoryReportFilter.jsx:84](../../client/src/pages/Dashboard/HrDashboard/Mixbag/LeaveHistoryReportFilter.jsx#L84) |

## pages/Dashboard/HrDashboard/Mixbag/MonthlyAttendanceSummary.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/monthly-attendance — `<PerformancePermissionRoute permissions={[ PERMISSIONS.HR_MONTHLY_ATTENDANCE_SUMMARY_MIX_BAG, ]} element={<MonthlyAttendanceSummary />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Manage Attendance (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openManageAttendance(params.data) — [MonthlyAttendanceSummary.jsx:235](../../client/src/pages/Dashboard/HrDashboard/Mixbag/MonthlyAttendanceSummary.jsx#L235) |
| Icon/action: () => openManageAttendance(params.data) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openManageAttendance(params.data) — [MonthlyAttendanceSummary.jsx:253](../../client/src/pages/Dashboard/HrDashboard/Mixbag/MonthlyAttendanceSummary.jsx#L253) |
| Undo (button) | params.value === "Finalized" | updateSummaryStatus.isPending | () => updateSummaryStatus.mutate({ status: "Draft", ids: [params.data._id] }) — [MonthlyAttendanceSummary.jsx:286](../../client/src/pages/Dashboard/HrDashboard/Mixbag/MonthlyAttendanceSummary.jsx#L286) |
| Export (table-generated utility) | NOT (isLoading && !rows.length); exportData: true | No local disabled condition detected | Shared table export — [MonthlyAttendanceSummary.jsx:356](../../client/src/pages/Dashboard/HrDashboard/Mixbag/MonthlyAttendanceSummary.jsx#L356) |
| Advanced filter (table-generated utility) | NOT (isLoading && !rows.length); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MonthlyAttendanceSummary.jsx:356](../../client/src/pages/Dashboard/HrDashboard/Mixbag/MonthlyAttendanceSummary.jsx#L356) |
| Approve (button) | payrollView AND NOT (isLoading && !rows.length) | !selectedRows.length \|\| updateSummaryStatus.isPending | () => setConfirmationAction("approve") — [MonthlyAttendanceSummary.jsx:381](../../client/src/pages/Dashboard/HrDashboard/Mixbag/MonthlyAttendanceSummary.jsx#L381) |
| Undo All (button) | payrollView AND NOT (isLoading && !rows.length) | isLoading \|\| updateSummaryStatus.isPending | () => setConfirmationAction("undoAll") — [MonthlyAttendanceSummary.jsx:386](../../client/src/pages/Dashboard/HrDashboard/Mixbag/MonthlyAttendanceSummary.jsx#L386) |
| Save (button) | No local render guard detected; page/API access still applies | updateSummary.isPending \|\| !Number.isFinite(Number(workingDays)) \|\| Number(workingDays) < 0; loading: updateSummary.isPending | () => { setSaveAttempted(true); if (workingDaysAreValid) updateSummary.mutate(); } — [MonthlyAttendanceSummary.jsx:475](../../client/src/pages/Dashboard/HrDashboard/Mixbag/MonthlyAttendanceSummary.jsx#L475) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 231: `params`
- **data**, line 48: `useQuery({ queryKey: [ "monthly-attendance-summaries", month, search, pagination.page, pagination.limit, payrollBatch, ], queryFn: async () => { const response = await axios.get("/api/attendance/monthly-summaries", { params: { month, search, page: pagination.page, limit: pagination.limit, ...(payrollBatch && { batch: payrollBatch }), }, }); return response.data; }, placeholderData: keepPreviousData, })`
- **params**, line 252: `params`
- **params**, line 283: `params`
- **isLoading**, line 48: `useQuery({ queryKey: [ "monthly-attendance-summaries", month, search, pagination.page, pagination.limit, payrollBatch, ], queryFn: async () => { const response = await axios.get("/api/attendance/monthly-summaries", { params: { month, search, page: pagination.page, limit: pagination.limit, ...(payrollBatch && { batch: payrollBatch }), }, }); return response.data; }, placeholderData: keepPreviousData, })`
- **selectedRows**, line 36: `useState([])`

## pages/Dashboard/HrDashboard/Mixbag/PaidUnpaidLeaveReport.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/reports/paid-unpaid-leaves — `<PerformancePermissionRoute permissions={[PERMISSIONS.HR_REPORTS_MIX_BAG]} element={<PaidUnpaidLeaveReport />} />`

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Open advanced report filters (button) | NOT (isLoading && !rows.length) | No local disabled condition detected | () => setFilterOpen(true) — [PaidUnpaidLeaveReport.jsx:85](../../client/src/pages/Dashboard/HrDashboard/Mixbag/PaidUnpaidLeaveReport.jsx#L85) |
| Export (button) | NOT (isLoading && !rows.length) | No local disabled condition detected | () => tableRef.current?.api?.exportDataAsCsv({ fileName: "Paid & Unpaid Leave Report.csv", }) — [PaidUnpaidLeaveReport.jsx:93](../../client/src/pages/Dashboard/HrDashboard/Mixbag/PaidUnpaidLeaveReport.jsx#L93) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isLoading**, line 31: `useQuery({ queryKey: ["paid-unpaid-leave-report", filters, search, pagination.page, pagination.limit], queryFn: async () => { const response = await axios.get("/api/leaves/paid-unpaid-report", { params: { ...filters, search, page: pagination.page, limit: pagination.limit }, }); return response.data; }, placeholderData: keepPreviousData, })`

## pages/Dashboard/HrDashboard/Mixbag/PaidUnpaidLeaveReportFilter.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | reset — [PaidUnpaidLeaveReportFilter.jsx:70](../../client/src/pages/Dashboard/HrDashboard/Mixbag/PaidUnpaidLeaveReportFilter.jsx#L70) |
| Apply (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => onApply(filters) — [PaidUnpaidLeaveReportFilter.jsx:71](../../client/src/pages/Dashboard/HrDashboard/Mixbag/PaidUnpaidLeaveReportFilter.jsx#L71) |

## pages/Dashboard/HrDashboard/Mixbag/PendingLeaveRequests.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/mix-bag/leaves/pending-approvals — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Manage Leave (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setSelectedLeave(params.data); setComment(""); } — [PendingLeaveRequests.jsx:119](../../client/src/pages/Dashboard/HrDashboard/Mixbag/PendingLeaveRequests.jsx#L119) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [PendingLeaveRequests.jsx:134](../../client/src/pages/Dashboard/HrDashboard/Mixbag/PendingLeaveRequests.jsx#L134) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PendingLeaveRequests.jsx:134](../../client/src/pages/Dashboard/HrDashboard/Mixbag/PendingLeaveRequests.jsx#L134) |
| Icon/action: () => rejectLeave(selectedLeave._id) (button) | No local render guard detected; page/API access still applies | isApproving \|\| isRejecting | () => rejectLeave(selectedLeave._id) — [PendingLeaveRequests.jsx:169](../../client/src/pages/Dashboard/HrDashboard/Mixbag/PendingLeaveRequests.jsx#L169) |
| Icon/action: () => approveLeave(selectedLeave._id) (button) | No local render guard detected; page/API access still applies | isApproving \|\| isRejecting | () => approveLeave(selectedLeave._id) — [PendingLeaveRequests.jsx:173](../../client/src/pages/Dashboard/HrDashboard/Mixbag/PendingLeaveRequests.jsx#L173) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 115: `params`
- **isApproving**, line 25: `useMutation({ mutationFn: async (leaveId) => { const res = await axios.patch('/api/leaves/approve-leave/${leaveId}', { comment: comment.trim() }); return res.data; }, onSuccess: (data) => { setSelectedLeave(null); setComment(""); toast.success(data.message \|\| "Leave Approved"); queryClient.invalidateQueries({ queryKey: ["leave-requests"] }); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Approval failed"); }, })`
- **isRejecting**, line 41: `useMutation({ mutationFn: async (leaveId) => { const res = await axios.patch('/api/leaves/reject-leave/${leaveId}', { comment: comment.trim() }); return res.data; }, onSuccess: (data) => { setSelectedLeave(null); setComment(""); toast.success(data.message \|\| "Leave Rejected"); queryClient.invalidateQueries({ queryKey: ["leave-requests"] }); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Rejection failed"); }, })`
- **selectedLeave**, line 14: `useState(null)`

## pages/Dashboard/HrDashboard/OnBoarding/EmployeeOnboard.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/employee-onboarding — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View (clickable action) | leavePolicies.length | No local disabled condition detected | (event) => event.stopPropagation() — [EmployeeOnboard.jsx:1216](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/EmployeeOnboard.jsx#L1216) |
| View (clickable action) | holidayPolicies.length | No local disabled condition detected | (event) => event.stopPropagation() — [EmployeeOnboard.jsx:1266](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/EmployeeOnboard.jsx#L1266) |
| isPending ? "Submitting..." : "Submit" (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [EmployeeOnboard.jsx:1982](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/EmployeeOnboard.jsx#L1982) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [EmployeeOnboard.jsx:1986](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/EmployeeOnboard.jsx#L1986) |

## pages/Dashboard/HrDashboard/OnBoarding/MemberOnboard.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/member-onboarding — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MemberOnboard.jsx:501](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/MemberOnboard.jsx#L501) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [MemberOnboard.jsx:502](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/MemberOnboard.jsx#L502) |

## pages/Dashboard/HrDashboard/OnBoarding/PastEmployees.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/HR-dashboard/employee/past-employees — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { localStorage.setItem("employeeName", params.data.employeeName); navigate( '/app/dashboard/HR-dashboard/employee/employee-list/edit-details' // '/app/dashboard/HR-da… (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { localStorage.setItem("employeeName", params.data.employeeName); navigate( '/app/dashboard/HR-dashboard/employee/employee-list/edit-details' // '/app/dashboard/HR-dashboard/employee/employee-list/${params.data.employeeName}/edit-details' ); dispatch(setSelectedEmployee(params.data.employmentID)); } — [PastEmployees.jsx:134](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/PastEmployees.jsx#L134) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [PastEmployees.jsx:236](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/PastEmployees.jsx#L236) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PastEmployees.jsx:236](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/PastEmployees.jsx#L236) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 133: `params`

## pages/Dashboard/HrDashboard/OnBoarding/VendorOnboard.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate( '/app/dashboard/HR-dashboard/data/vendor/${params.data.vendorName}', { state: params.data } ) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( '/app/dashboard/HR-dashboard/data/vendor/${params.data.vendorName}', { state: params.data } ) — [VendorOnboard.jsx:99](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/VendorOnboard.jsx#L99) |
| Action: () => { setOpenModal(true); setSelectedVendor(params.data); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setOpenModal(true); setSelectedVendor(params.data); } — [VendorOnboard.jsx:135](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/VendorOnboard.jsx#L135) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [VendorOnboard.jsx:635](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/VendorOnboard.jsx#L635) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [VendorOnboard.jsx:636](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/VendorOnboard.jsx#L636) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VendorOnboard.jsx:648](../../client/src/pages/Dashboard/HrDashboard/OnBoarding/VendorOnboard.jsx#L648) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 98: `params`
- **data**, line 73: `useQuery({ queryKey: ["vendors", "6798bab9e469e809084e249e"], queryFn: async function () { const response = await axios.get( "/api/vendors/get-vendors/6798bab9e469e809084e249e" ); return response.data; }, })`
- **params**, line 132: `params`
