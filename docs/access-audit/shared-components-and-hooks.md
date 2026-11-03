# Shared components and hooks: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## components/AccessTree.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Close (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleBack — [AccessTree.jsx:148](../../client/src/components/AccessTree.jsx#L148) |
| Action: () => {click ? navigate("permissions", { state: { user } }) : ''} (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => {click ? navigate("permissions", { state: { user } }) : ''} — [AccessTree.jsx:186](../../client/src/components/AccessTree.jsx#L186) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **user**, line 168: `{ user, handleSelectUser, isTopLevel, click = true }`

## components/AgTable.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (button) | exportData AND NOT (exportAction !== undefined) | No local disabled condition detected | () => { if (gridRef.current) { gridRef.current.api.exportDataAsCsv({ fileName: '${tableTitle \|\| "table-data"}.csv', allColumns: true, columnKeys: getExportColumnKeys(), processCellCallback: formatExportCell, }); } } — [AgTable.jsx:286](../../client/src/components/AgTable.jsx#L286) |
| buttonTitle (button) | buttonTitle AND showTableControls \|\| exportData \|\| exportAction \|\| toolbarActions \|\| searchRowActions \|\| buttonTitle \|\| headerActions | disabled | handleClick — [AgTable.jsx:427](../../client/src/components/AgTable.jsx#L427) |
| Advanced filter (button) | NOT (!showTableControls \|\| hideFilter \|\| advancedFilterAction \|\| !filterableColumns.length) AND showTableControls \|\| exportData \|\| exportAction \|\| toolbarActions \|\| searchRowActions \|\| buttonTitle \|\| headerActions | No local disabled condition detected | () => setFilterDrawerOpen(true) — [AgTable.jsx:440](../../client/src/components/AgTable.jsx#L440) |
| Apply Filters (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | applyFilters — [AgTable.jsx:513](../../client/src/components/AgTable.jsx#L513) |
| Clear Filters (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | clearFilters — [AgTable.jsx:514](../../client/src/components/AgTable.jsx#L514) |

## components/AttendanceCameraModal.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Close camera (button) | No local render guard detected; page/API access still applies | isLoading | onClose — [AttendanceCameraModal.jsx:167](../../client/src/components/AttendanceCameraModal.jsx#L167) |
| Icon/action: capturedPhoto ? retake : onClose (button) | No local render guard detected; page/API access still applies | isLoading | capturedPhoto ? retake : onClose — [AttendanceCameraModal.jsx:269](../../client/src/components/AttendanceCameraModal.jsx#L269) |
| Icon/action: cameraError ? () => setCameraRetryKey((current) => current + 1) : capturedPhoto ? proceed : capture (button) | No local render guard detected; page/API access still applies | (!cameraError && !capturedPhoto && !isReady) \|\| isLoading | cameraError ? () => setCameraRetryKey((current) => current + 1) : capturedPhoto ? proceed : capture — [AttendanceCameraModal.jsx:286](../../client/src/components/AttendanceCameraModal.jsx#L286) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isLoading**, line 12: `{ open, title, isLoading, onClose, onCapture, }`
- **isReady**, line 21: `useState(false)`

## components/BudgetDisplay.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Request Budget (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenModal(true) — [BudgetDisplay.jsx:172](../../client/src/components/BudgetDisplay.jsx#L172) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [BudgetDisplay.jsx:180](../../client/src/components/BudgetDisplay.jsx#L180) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [BudgetDisplay.jsx:273](../../client/src/components/BudgetDisplay.jsx#L273) |

## components/ClockInOutAttendance.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: hasTakenBreak ? handleEnBreak : handleStartBreak (button) | hasClockedIn | isBreakDisabled \|\| isStartbreak \|\| isEndBreak | hasTakenBreak ? handleEnBreak : handleStartBreak — [ClockInOutAttendance.jsx:634](../../client/src/components/ClockInOutAttendance.jsx#L634) |
| Icon/action: handleClockOutClick (button) | hasClockedIn | isClockingOut \|\| correctionPending | handleClockOutClick — [ClockInOutAttendance.jsx:649](../../client/src/components/ClockInOutAttendance.jsx#L649) |
| Icon/action: handleStart (button) | NOT (hasClockedIn) | Boolean(clockOutTime && isToday) \|\| isClockingIn | handleStart — [ClockInOutAttendance.jsx:660](../../client/src/components/ClockInOutAttendance.jsx#L660) |
| Cancel (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenModal(false) — [ClockInOutAttendance.jsx:804](../../client/src/components/ClockInOutAttendance.jsx#L804) |
| Submit (button) | No local render guard detected; page/API access still applies | loading: correctionPending | No inline handler declared; may submit a form or delegate to a component — [ClockInOutAttendance.jsx:808](../../client/src/components/ClockInOutAttendance.jsx#L808) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **hasClockedIn**, line 52: `useSelector((state) => { return state.user; })`
- **isBreakDisabled**, line 594: `!isToday`
- **isToday**, line 138: `getAttendanceClockState({ inTime: clockInTime, outTime: clockOutTime, shiftSnapshot: attendanceRecord?.inTime === clockInTime ? attendanceRecord?.shiftSnapshot : undefined, })`
- **isStartbreak**, line 270: `useMutation({ // mutationFn: async (breakTime) => { // const res = await axios.patch("/api/attendance/start-break", { // startBreak: breakTime, // }); mutationFn: async ({ time: breakTime, image }) => { const payload = new FormData(); payload.append("startBreak", breakTime); payload.append("image", image, "break-in.jpg"); const res = await axios.patch("/api/attendance/start-break", payload); return { data: res.data, breakTime }; // Return both server response and time }, onSuccess: ({ data, breakTime }) => { toast.success("Break started"); setTakeBreak(breakTime); setOffset(0); // start fresh // setTotalHours((prev) => ({ // ...prev, // workHours: calculateTotalHours( // breaks, // startTime, // breakTime, // "workhours" // ), // })); const updatedBreaks = [...breaks]; if ( !updatedBreaks.…`
- **userId**, line 107: `auth?.user?._id`
- **auth**, line 50: `useAuth()`
- **isEndBreak**, line 323: `useMutation({ // mutationFn: async (breakTime) => { // const res = await axios.patch("/api/attendance/end-break", { // endBreak: breakTime, // }); mutationFn: async ({ time: breakTime, image }) => { const payload = new FormData(); payload.append("endBreak", breakTime); payload.append("image", image, "break-out.jpg"); const res = await axios.patch("/api/attendance/end-break", payload); return { data: res.data, breakTime }; // Return both server response and time }, onSuccess: ({ data, breakTime }) => { toast.success("Break ended"); setTakeBreak(null); const updatedBreaks = [...breaks]; const lastIndex = updatedBreaks.length - 1; if (lastIndex >= 0 && !updatedBreaks[lastIndex].end) { updatedBreaks[lastIndex] = { ...updatedBreaks[lastIndex], end: breakTime, }; } setOffset(0); // start fresh /…`
- **isClockingOut**, line 219: `useMutation({ // mutationFn: async (outTime) => { // const res = await axios.patch("/api/attendance/clock-out", { // outTime, // }); mutationFn: async ({ time: outTime, image }) => { const payload = new FormData(); payload.append("outTime", outTime); payload.append("image", image, "clock-out.jpg"); const res = await axios.patch("/api/attendance/clock-out", payload); return { data: res.data, outTime }; }, onSuccess: ({ data, outTime }) => { setOpenClockOutConfirmation(false); toast.success("Clocked out successfully!"); if (clockInTime) { // avoid showing clock-out time if clocking out for prev day setClockTime((prev) => ({ ...prev, endTime: outTime })); if (breaks.length > 0) { // setTotalHours((prev) => ({ // ...prev, // workHours: calculateTotalHours( // breaks, // startTime, // outTime, …`
- **isClockingIn**, line 181: `useMutation({ // mutationFn: async (inTime) => { // const res = await axios.post("/api/attendance/clock-in", { // inTime, // entryType: "web", // }); mutationFn: async ({ time: inTime, image }) => { const payload = new FormData(); payload.append("inTime", inTime); payload.append("entryType", "web"); payload.append("image", image, "clock-in.jpg"); const res = await axios.post("/api/attendance/clock-in", payload); return { data: res.data, inTime }; // Return both server response and time }, onSuccess: ({ data, inTime }) => { toast.success("Clocked in successfully!"); setStartTime(inTime); setClockTime({ startTime: inTime, endTime: null }); setBreaks([]); dispatch(setClockOutTime(null)); dispatch(setBreakTimings([])); dispatch(setHasTakenBreak(false)); dispatch(setWorkHours("00:00:00")); disp…`
- **isSameDay**, line 463: `(time) => { const curr = new Date(); const clockInDate = new Date(time); const today = curr.getFullYear() === clockInDate.getFullYear() && curr.getMonth() === clockInDate.getMonth() && curr.getDate() === clockInDate.getDate(); return today; }`

## components/ConfirmationModal.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| confirmText (button) | No local render guard detected; page/API access still applies | isLoading \|\| confirmDisabled; loading: isLoading | onConfirm — [ConfirmationModal.jsx:23](../../client/src/components/ConfirmationModal.jsx#L23) |
| cancelText (button) | No local render guard detected; page/API access still applies | isLoading | onClose — [ConfirmationModal.jsx:30](../../client/src/components/ConfirmationModal.jsx#L30) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isLoading**, line 4: `{ open, onClose, onConfirm, title = "Delete Record", message = "Are you sure you want to delete this record?", confirmText = "Yes", cancelText = "No", isLoading = false, children, cancelFirst = false, confirmDisabled = false, }`

## components/CurrencySelector.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Investor dashboard currency (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setIsOpen((open) => !open) — [CurrencySelector.jsx:39](../../client/src/components/CurrencySelector.jsx#L39) |
| - (button) | isOpen | No local disabled condition detected | () => { setCurrency(code); setIsOpen(false); } — [CurrencySelector.jsx:76](../../client/src/components/CurrencySelector.jsx#L76) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isOpen**, line 13: `useState(false)`

## components/DangerButton.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: handleSubmit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleSubmit — [DangerButton.jsx:6](../../client/src/components/DangerButton.jsx#L6) |

## components/FinanceCard.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: isLink ? () => navigate(item.route, { state: item.stateData \|\| {} }) : undefined (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | isLink ? () => navigate(item.route, { state: item.stateData \|\| {} }) : undefined — [FinanceCard.jsx:127](../../client/src/components/FinanceCard.jsx#L127) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isLink**, line 91: `!disableLinks && item.route && item.route !== "#"`

## components/Footer.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: linkObj.link (clickable action) | typeof linkObj.link === "function" | No local disabled condition detected | linkObj.link — [Footer.jsx:124](../../client/src/components/Footer.jsx#L124) |
| Content and Copyright Policy (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | goToHostsContentCopyright — [Footer.jsx:169](../../client/src/components/Footer.jsx#L169) |
| Content Use & Removal Policy (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | goToHostsContentUseRemoval — [Footer.jsx:175](../../client/src/components/Footer.jsx#L175) |
| Action: () => setShowLangModal(true) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setShowLangModal(true) — [Footer.jsx:187](../../client/src/components/Footer.jsx#L187) |
| Action: () => setShowCurrencyModal(true) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setShowCurrencyModal(true) — [Footer.jsx:196](../../client/src/components/Footer.jsx#L196) |
| Icon/action: () => setShowLangModal(false) (button) | showLangModal | No local disabled condition detected | () => setShowLangModal(false) — [Footer.jsx:214](../../client/src/components/Footer.jsx#L214) |
| Action: () => { if (isDisabled) return; // block clicks setSelectedLang(lang); setShowLangModal(false); } (clickable action) | showLangModal | No local disabled condition detected | () => { if (isDisabled) return; // block clicks setSelectedLang(lang); setShowLangModal(false); } — [Footer.jsx:228](../../client/src/components/Footer.jsx#L228) |
| Icon/action: () => setShowCurrencyModal(false) (button) | showCurrencyModal | No local disabled condition detected | () => setShowCurrencyModal(false) — [Footer.jsx:256](../../client/src/components/Footer.jsx#L256) |
| Action: () => { if (isDisabled) return; // block clicks setSelectedCurrency(cur); setShowCurrencyModal(false); } (clickable action) | showCurrencyModal | No local disabled condition detected | () => { if (isDisabled) return; // block clicks setSelectedCurrency(cur); setShowCurrencyModal(false); } — [Footer.jsx:268](../../client/src/components/Footer.jsx#L268) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isDisabled**, line 225: `index !== 0`
- **isDisabled**, line 265: `index !== 0`

## components/GoogleFolderCard.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate( '${routeId}', { state: {title : title, files:files}, replace:true } ) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( '${routeId}', { state: {title : title, files:files}, replace:true } ) — [GoogleFolderCard.jsx:9](../../client/src/components/GoogleFolderCard.jsx#L9) |

## components/GroupedButton.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: handleSubmit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleSubmit — [GroupedButton.jsx:6](../../client/src/components/GroupedButton.jsx#L6) |

## components/HRReports/HrReports.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [HrReports.jsx:100](../../client/src/components/HRReports/HrReports.jsx#L100) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HrReports.jsx:100](../../client/src/components/HRReports/HrReports.jsx#L100) |

## components/Header.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => setIsSidebarOpen(!isSidebarOpen) (button) | !isMobile | No local disabled condition detected | () => setIsSidebarOpen(!isSidebarOpen) — [Header.jsx:150](../../client/src/components/Header.jsx#L150) |
| CURRENT COMPANY POSITION (button) | showCurrencySelector AND !isMobile | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [Header.jsx:171](../../client/src/components/Header.jsx#L171) |
| POST SERIES A (button) | showCurrencySelector AND !isMobile | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [Header.jsx:178](../../client/src/components/Header.jsx#L178) |
| END VISION (button) | showCurrencySelector AND !isMobile | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [Header.jsx:185](../../client/src/components/Header.jsx#L185) |
| Icon/action: (e) => { setNotificationAnchorEl(e.currentTarget); } (button) | !isMobile | No local disabled condition detected | (e) => { setNotificationAnchorEl(e.currentTarget); } — [Header.jsx:217](../../client/src/components/Header.jsx#L217) |
| Icon/action: () => markAllRead() (button) | No local render guard detected; page/API access still applies | unseenCount === 0 \|\| isMarkingAllRead | () => markAllRead() — [Header.jsx:360](../../client/src/components/Header.jsx#L360) |
| Icon/action: onRefreshNotifications (button) | No local render guard detected; page/API access still applies | isRefreshingNotifications | onRefreshNotifications — [Header.jsx:368](../../client/src/components/Header.jsx#L368) |
| Action: () => { if (!hasRead) { updateRead(n._id); } if (notificationRoute) { navigate(notificationRoute); setNotificationAnchorEl(null); } } (clickable action) | NOT (notifications.length === 0) AND NOT (isRefreshingNotifications) | No local disabled condition detected | () => { if (!hasRead) { updateRead(n._id); } if (notificationRoute) { navigate(notificationRoute); setNotificationAnchorEl(null); } } — [Header.jsx:419](../../client/src/components/Header.jsx#L419) |
| Mark as Read (button) | !hasRead AND NOT (notifications.length === 0) AND NOT (isRefreshingNotifications) | isUpdatePending | () => updateRead(n._id) — [Header.jsx:451](../../client/src/components/Header.jsx#L451) |
| View more (button) | notifications.length > 9 AND NOT (notifications.length === 0) AND NOT (isRefreshingNotifications) | No local disabled condition detected | () => { setNotificationAnchorEl(null); navigate("/app/notifications"); } — [Header.jsx:470](../../client/src/components/Header.jsx#L470) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isMobile**, line 63: `useMediaQuery("(max-width: 768px)")`
- **isSidebarOpen**, line 58: `useSidebar()`
- **isMarkingAllRead**, line 84: `useMutation({ mutationKey: ["markAllRead"], mutationFn: async () => { const response = await axios.patch('/api/notifications/mark-all-read'); return response.data; }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notifications"] }); }, onError: (error) => { toast.error(error.message \|\| "Error"); }, })`
- **isRefreshingNotifications**, line 49: `{ notifications = [], unseenCount = 0, onRefreshNotifications, isRefreshingNotifications = false, }`
- **hasRead**, line 407: `userEntry?.userActions?.hasRead`
- **userEntry**, line 399: `n.users?.find( (item) => String( item.userActions?.whichUser?._id \|\| item.userActions?.whichUser ) === String(currentUser) )`
- **isUpdatePending**, line 67: `useMutation({ mutationKey: ["updateRead"], mutationFn: async (notificationId) => { const response = await axios.patch( '/api/notifications/mark-as-read/${notificationId}' ); return response.data; }, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["notifications"] }); toast.success(data.message \|\| "UPDATED"); }, onError: (error) => { toast.error(error.message \|\| "Error"); }, })`

## components/HierarchyTree.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate('/user/${user.id}') (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate('/user/${user.id}') — [HierarchyTree.jsx:154](../../client/src/components/HierarchyTree.jsx#L154) |
| Action: () => navigate("/app/access/permissions", { state: { user: users[0] }, }) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate("/app/access/permissions", { state: { user: users[0] }, }) — [HierarchyTree.jsx:197](../../client/src/components/HierarchyTree.jsx#L197) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **user**, line 143: `user`
- **users**, line 8: `[ { id: 1, name: "Abrar Shaikh", role: "Master Admin", reports: null, avatarColor: "#f44336", email: "abrar.shaikh@example.com", userSince: "2020-01-01", status: "Active", department: "Management", }, { id: 2, name: "Kashif Shaikh", role: "Super Admin", reports: 1, avatarColor: "#2196f3", email: "kashif.shaikh@example.com", userSince: "2020-03-15", status: "Active", department: "Operations", }, { id: 3, name: "Farzeen Qudri", role: "Super Admin", reports: 1, avatarColor: "#2196f3", email: "farzeen.qudri@example.com", userSince: "2020-05-20", status: "Active", department: "Operations", }, { id: 4, name: "Kalpesh Naik", role: "Admin", reports: 2, avatarColor: "#4caf50", email: "kalpesh.naik@example.com", userSince: "2021-02-10", status: "Active", department: "Administration", }, { id: 5, nam…`

## components/HrSearchPalette.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Close search palette (button) | open | No local disabled condition detected | closePalette — [HrSearchPalette.jsx:361](../../client/src/components/HrSearchPalette.jsx#L361) |
| Icon/action: () => openDestination(destination) (button) | filteredDestinations.length AND open | No local disabled condition detected | () => openDestination(destination) — [HrSearchPalette.jsx:391](../../client/src/components/HrSearchPalette.jsx#L391) |

## components/MuiAccordion.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => itemClick?.(emp) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => itemClick?.(emp) — [MuiAccordion.jsx:54](../../client/src/components/MuiAccordion.jsx#L54) |

## components/MuiAside.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: onClose (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | onClose — [MuiAside.jsx:14](../../client/src/components/MuiAside.jsx#L14) |

## components/MuiModal.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: onClose (button) | !hideHeader | No local disabled condition detected | onClose — [MuiModal.jsx:36](../../client/src/components/MuiModal.jsx#L36) |

## components/Pages/AnnualExpense.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [AnnualExpense.jsx:379](../../client/src/components/Pages/AnnualExpense.jsx#L379) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AnnualExpense.jsx:379](../../client/src/components/Pages/AnnualExpense.jsx#L379) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [AnnualExpense.jsx:541](../../client/src/components/Pages/AnnualExpense.jsx#L541) |

## components/Pages/BudgetPage.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Request Budget (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | canRequestBudget ? () => setOpenModal(true) : undefined — [BudgetPage.jsx:815](../../client/src/components/Pages/BudgetPage.jsx#L815) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [BudgetPage.jsx:815](../../client/src/components/Pages/BudgetPage.jsx#L815) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [BudgetPage.jsx:815](../../client/src/components/Pages/BudgetPage.jsx#L815) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [BudgetPage.jsx:1018](../../client/src/components/Pages/BudgetPage.jsx#L1018) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **canRequestBudget**, line 108: `requestBudgetPermission ? hasPermission(requestBudgetPermission) : true`
- **hasPermission**, line 72: `useUserPermissions()`

## components/Pages/BulkUpload.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: (event) => { event.preventDefault(); handleTemplateDownload(params.data); } (clickable action) | params.data.documentLink | No local disabled condition detected | (event) => { event.preventDefault(); handleTemplateDownload(params.data); } — [BulkUpload.jsx:916](../../client/src/components/Pages/BulkUpload.jsx#L916) |
| Upload Document (table-generated action) | No local render guard detected; page/API access still applies | !canUploadDocuments | () => { setModalMode("add"); setOpenModal(true); } — [BulkUpload.jsx:936](../../client/src/components/Pages/BulkUpload.jsx#L936) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [BulkUpload.jsx:936](../../client/src/components/Pages/BulkUpload.jsx#L936) |
| Upload (button) | modalMode === "add" | isUploading; loading: isUploading | No inline handler declared; may submit a form or delegate to a component — [BulkUpload.jsx:1043](../../client/src/components/Pages/BulkUpload.jsx#L1043) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 913: `params`
- **canUploadDocuments**, line 367: `useMemo(() => { const allowedDepartmentIds = new Set([ "6798ba9de469e809084e2494", // Tech "6798bab0e469e809084e249a", // Finance "6798bab9e469e809084e249e", // HR ]); const allowedDepartmentNames = ["tech", "finance", "hr"]; const topManagementDepartmentId = "67b2cf85b9b6ed5cedeb9a2e"; // Top const currentDepartmentName = deptDetails?.name?.toLowerCase() \|\| ""; const isAllowedCurrentDepartment = allowedDepartmentIds.has(deptDetails?._id) \|\| allowedDepartmentNames.some((departmentName) => currentDepartmentName.includes(departmentName), ); const isTopManagementUser = auth?.user?.departments?.some((department) => { const departmentName = department?.name?.toLowerCase() \|\| ""; return ( department?._id === topManagementDepartmentId \|\| departmentName.includes("top management") ); }); return isA…`
- **auth**, line 338: `useAuth()`
- **isUploading**, line 758: `useMutation({ // mutationFn: async ({ file, documentName }) => { mutationFn: async ({ file, buildingId }) => { if (!selectedTemplate?.route \|\| !selectedTemplate?.fileKey) { console.log("!selectedTemplate?.route", selectedTemplate?.route); console.log("!selectedTemplate?.fileKey", selectedTemplate?.fileKey); throw new Error( "Bulk upload route is not configured for the selected template.", ); } if (requiresBuildingSelection && !buildingId) { throw new Error("Building is required for this template."); } const formData = new FormData(); formData.append(selectedTemplate.fileKey, file); if (requiresBuildingSelection && buildingId) { formData.append("buildingId", buildingId); } const response = await axios.post(selectedTemplate.route, formData, { headers: { "Content-Type": "multipart/form-data",…`
- **selectedTemplate**, line 656: `templateOptions.find( (item) => item.id === selectedDoc, )`
- **selectedDoc**, line 485: `watch("documentName")`
- **isTemplateNotFoundError**, line 329: `(error) => String(error?.response?.data?.message \|\| error?.message \|\| "") .toLowerCase() .includes("template not found")`

## components/Pages/DepartmentAssetCommon.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View asset details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setSelectedAsset(params.data); setViewModalOpen(true); } — [DepartmentAssetCommon.jsx:49](../../client/src/components/Pages/DepartmentAssetCommon.jsx#L49) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DepartmentAssetCommon.jsx:120](../../client/src/components/Pages/DepartmentAssetCommon.jsx#L120) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 48: `params`

## components/Pages/DepartmentBudgetHistory.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [DepartmentBudgetHistory.jsx:109](../../client/src/components/Pages/DepartmentBudgetHistory.jsx#L109) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DepartmentBudgetHistory.jsx:109](../../client/src/components/Pages/DepartmentBudgetHistory.jsx#L109) |

## components/Pages/DepartmentRejectedVoucher.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setSelectedBudget(params.data); setModalOpen(true); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setSelectedBudget(params.data); setModalOpen(true); } — [DepartmentRejectedVoucher.jsx:107](../../client/src/components/Pages/DepartmentRejectedVoucher.jsx#L107) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [DepartmentRejectedVoucher.jsx:232](../../client/src/components/Pages/DepartmentRejectedVoucher.jsx#L232) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DepartmentRejectedVoucher.jsx:232](../../client/src/components/Pages/DepartmentRejectedVoucher.jsx#L232) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 105: `params`

## components/Pages/DepartmentVoucherHistory.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setViewDetails(params.data); setViewModal(true); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setViewDetails(params.data); setViewModal(true); } — [DepartmentVoucherHistory.jsx:102](../../client/src/components/Pages/DepartmentVoucherHistory.jsx#L102) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [DepartmentVoucherHistory.jsx:119](../../client/src/components/Pages/DepartmentVoucherHistory.jsx#L119) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DepartmentVoucherHistory.jsx:119](../../client/src/components/Pages/DepartmentVoucherHistory.jsx#L119) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 100: `params`

## components/Pages/MonthlyBudgetCommon.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setSelectedRow(params.data); setViewModal(true); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setSelectedRow(params.data); setViewModal(true); } — [MonthlyBudgetCommon.jsx:162](../../client/src/components/Pages/MonthlyBudgetCommon.jsx#L162) |
| Export (table-generated utility) | departmentId; exportData: true | No local disabled condition detected | Shared table export — [MonthlyBudgetCommon.jsx:180](../../client/src/components/Pages/MonthlyBudgetCommon.jsx#L180) |
| Advanced filter (table-generated utility) | departmentId; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MonthlyBudgetCommon.jsx:180](../../client/src/components/Pages/MonthlyBudgetCommon.jsx#L180) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 160: `params`

## components/Pages/MonthlyInvoiceCommon.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setViewDetails(params.data); setViewModal(true); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setViewDetails(params.data); setViewModal(true); } — [MonthlyInvoiceCommon.jsx:183](../../client/src/components/Pages/MonthlyInvoiceCommon.jsx#L183) |
| Export (table-generated utility) | departmentId; exportData: true | No local disabled condition detected | Shared table export — [MonthlyInvoiceCommon.jsx:342](../../client/src/components/Pages/MonthlyInvoiceCommon.jsx#L342) |
| Advanced filter (table-generated utility) | departmentId; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MonthlyInvoiceCommon.jsx:342](../../client/src/components/Pages/MonthlyInvoiceCommon.jsx#L342) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 181: `params`

## components/Pages/PolicyUpload.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Restore Policy (button) | params.data.isDeleted | documentActionMutation.isPending | () => setConfirmationAction({ type: "restore", policy: params.data, }) — [PolicyUpload.jsx:284](../../client/src/components/Pages/PolicyUpload.jsx#L284) |
| Permanently delete Policy (button) | params.data.isDeleted | documentActionMutation.isPending | () => setConfirmationAction({ type: "permanent-delete", policy: params.data, }) — [PolicyUpload.jsx:299](../../client/src/components/Pages/PolicyUpload.jsx#L299) |
| 'Mark Policy as ${params.data.isActive ? "inactive" : "active"}' (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setConfirmationAction({ type: "status", policy: params.data }) — [PolicyUpload.jsx:320](../../client/src/components/Pages/PolicyUpload.jsx#L320) |
| Edit Policy (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleEdit(params.data) — [PolicyUpload.jsx:339](../../client/src/components/Pages/PolicyUpload.jsx#L339) |
| isTechDepartment ? "Permanently delete Policy" : "Delete Policy" (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setConfirmationAction({ type: isTechDepartment ? "permanent-delete" : "delete", policy: params.data, }) — [PolicyUpload.jsx:348](../../client/src/components/Pages/PolicyUpload.jsx#L348) |
| Upload Policy (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddPolicy — [PolicyUpload.jsx:401](../../client/src/components/Pages/PolicyUpload.jsx#L401) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PolicyUpload.jsx:401](../../client/src/components/Pages/PolicyUpload.jsx#L401) |
| Upload Policy (button) | modalType === "add" | isPending; loading: isPending | No inline handler declared; may submit a form or delegate to a component — [PolicyUpload.jsx:469](../../client/src/components/Pages/PolicyUpload.jsx#L469) |
| Update Policy (button) | modalType === "edit" | isEditPending; loading: isEditPending | No inline handler declared; may submit a form or delegate to a component — [PolicyUpload.jsx:511](../../client/src/components/Pages/PolicyUpload.jsx#L511) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 280: `params`
- **data**, line 179: `useQuery({ queryKey: [ "departmentPolicy", department?._id, Boolean(isTechDepartment), ], queryFn: async () => { const response = await axios.get( '/api/company/get-department-documents?departmentId=${department?._id}&type=policies${ isTechDepartment ? "&includeDeleted=true" : "" }', ); return response?.data?.documents?.policyDocuments \|\| []; }, enabled: !!department?._id, })`
- **isTechDepartment**, line 27: `auth?.user?.departments?.some( (userDepartment) => String(userDepartment?._id \|\| userDepartment) === TECH_DEPARTMENT_ID \|\| ["tech", "tech department"].includes( userDepartment?.name?.trim().toLowerCase(), ), )`
- **auth**, line 26: `useAuth()`
- **isPending**, line 69: `useMutation({ mutationFn: async ({ policy, documentName }) => { const formData = new FormData(); formData.append("department-document", policy); formData.append("type", "policy"); formData.append( "documentName", documentName \|\| policy?.name \|\| "Untitled" ); const response = await axios.post( '/api/company/add-department-document/${department?._id \|\| ""}', formData, { headers: { "Content-Type": "multipart/form-data", }, } ); return response.data; }, onSuccess: () => { toast.success("Policy uploaded successfully!"); reset(); // reset form setOpenModal(false); // close modal queryClient.invalidateQueries({ queryKey: ["departmentPolicy", department?._id], }); }, onError: (error) => { toast.error(error?.message \|\| "Failed to upload SOP."); }, })`
- **isEditPending**, line 103: `useMutation({ mutationFn: async (data) => { const response = await axios.patch( '/api/company/update-department-document', data ); return response.data; }, onSuccess: () => { toast.success("Policy uploaded successfully!"); reset(); // reset form setOpenModal(false); // close modal queryClient.invalidateQueries({ queryKey: ["departmentPolicy"] }); }, onError: () => { toast.error("Failed to upload Policy."); }, })`

## components/Pages/Reimbursement.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Add (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { const { particularName, particularAmount } = watch(); const amountValid = parseFloat(particularAmount) > 0; if (!particularName \|\| !particularAmount \|\| !amountValid) { // trigger validation manually return; } append({ particularName, particularAmount: parseFloat(particularAmount), }); setValue("particularName", ""); setValue("part… — [Reimbursement.jsx:520](../../client/src/components/Pages/Reimbursement.jsx#L520) |
| Delete (button) | fields.length > 0 | No local disabled condition detected | () => remove(index) — [Reimbursement.jsx:560](../../client/src/components/Pages/Reimbursement.jsx#L560) |
| Preview (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenPreview(true) — [Reimbursement.jsx:705](../../client/src/components/Pages/Reimbursement.jsx#L705) |
| Icon/action: () => setOpenPreview(false) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenPreview(false) — [Reimbursement.jsx:724](../../client/src/components/Pages/Reimbursement.jsx#L724) |
| Submit (button) | No local render guard detected; page/API access still applies | isSubmitRequest; loading: isSubmitRequest | onUpload — [Reimbursement.jsx:885](../../client/src/components/Pages/Reimbursement.jsx#L885) |
| Export to PDF (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | exportToPDF — [Reimbursement.jsx:892](../../client/src/components/Pages/Reimbursement.jsx#L892) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isSubmitRequest**, line 241: `useMutation({ mutationKey: ["reimbursement"], mutationFn: async (data) => { const response = await axios.post( '/api/budget/request-budget/${department?._id}', data, { headers: { "Content-Type": "multipart/form-data", }, } ); return response.data; }, onSuccess: (data) => { toast.success(data.message); setOpenPreview(false); reset(); }, onError: (error) => { toast.error(error.response.data.message); }, })`

## components/Pages/SopUpload.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Restore SOP (button) | params.data.isDeleted | documentActionMutation.isPending | () => setConfirmationAction({ type: "restore", sop: params.data }) — [SopUpload.jsx:279](../../client/src/components/Pages/SopUpload.jsx#L279) |
| Permanently delete SOP (button) | params.data.isDeleted | documentActionMutation.isPending | () => setConfirmationAction({ type: "permanent-delete", sop: params.data, }) — [SopUpload.jsx:291](../../client/src/components/Pages/SopUpload.jsx#L291) |
| 'Mark SOP as ${params.data.isActive ? "inactive" : "active"}' (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setConfirmationAction({ type: "status", sop: params.data }) — [SopUpload.jsx:312](../../client/src/components/Pages/SopUpload.jsx#L312) |
| Edit SOP (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleEdit(params.data) — [SopUpload.jsx:331](../../client/src/components/Pages/SopUpload.jsx#L331) |
| isTechDepartment ? "Permanently delete SOP" : "Delete SOP" (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setConfirmationAction({ type: isTechDepartment ? "permanent-delete" : "delete", sop: params.data, }) — [SopUpload.jsx:340](../../client/src/components/Pages/SopUpload.jsx#L340) |
| Upload SOP (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddSop — [SopUpload.jsx:393](../../client/src/components/Pages/SopUpload.jsx#L393) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [SopUpload.jsx:393](../../client/src/components/Pages/SopUpload.jsx#L393) |
| Upload SOP (button) | modalType === "add" | isPending; loading: isPending | No inline handler declared; may submit a form or delegate to a component — [SopUpload.jsx:460](../../client/src/components/Pages/SopUpload.jsx#L460) |
| Update SOP (button) | modalType === "edit" | isEditPending; loading: isEditPending | No inline handler declared; may submit a form or delegate to a component — [SopUpload.jsx:502](../../client/src/components/Pages/SopUpload.jsx#L502) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 275: `params`
- **data**, line 177: `useQuery({ queryKey: ["departmentSOP", department?._id, Boolean(isTechDepartment)], queryFn: async () => { const response = await axios.get( '/api/company/get-department-documents?departmentId=${department?._id}&type=sop${ isTechDepartment ? "&includeDeleted=true" : "" }', ); return response?.data?.documents?.sopDocuments \|\| []; }, enabled: !!department?._id, staleTime: 1000 * 60 * 5, })`
- **isTechDepartment**, line 31: `auth?.user?.departments?.some( (userDepartment) => String(userDepartment?._id \|\| userDepartment) === TECH_DEPARTMENT_ID \|\| ["tech", "tech department"].includes( userDepartment?.name?.trim().toLowerCase(), ), )`
- **auth**, line 30: `useAuth()`
- **isPending**, line 76: `useMutation({ mutationFn: async ({ sop, documentName }) => { const formData = new FormData(); formData.append("department-document", sop); formData.append("type", "sop"); formData.append("documentName", documentName \|\| sop?.name \|\| "Untitled"); const response = await axios.post( '/api/company/add-department-document/${department?._id \|\| ""}', formData, { headers: { "Content-Type": "multipart/form-data", }, } ); return response.data; }, onSuccess: () => { toast.success("SOP uploaded successfully!"); reset(); // reset form setOpenModal(false); // close modal queryClient.invalidateQueries({ queryKey: ["departmentSOP"] }); }, onError: (error) => { toast.error(error?.message \|\| "Failed to upload SOP."); }, })`
- **isEditPending**, line 105: `useMutation({ mutationFn: async (data) => { const response = await axios.patch( '/api/company/update-department-document', data ); return response.data; }, onSuccess: () => { toast.success("SOP updated successfully!"); reset(); // reset form setOpenModal(false); // close modal queryClient.invalidateQueries({ queryKey: ["departmentSOP"] }); }, onError: () => { toast.error("Failed to update SOP."); }, })`

## components/Pages/TeamMemberDetails.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Assign Substitute (button) | modalType === "view" && selectedEvent | No local disabled condition detected | () => { setModalType("edit"); } — [TeamMemberDetails.jsx:357](../../client/src/components/Pages/TeamMemberDetails.jsx#L357) |
| Assign (button) | modalType === "edit" | isPending; loading: isPending | No inline handler declared; may submit a form or delegate to a component — [TeamMemberDetails.jsx:442](../../client/src/components/Pages/TeamMemberDetails.jsx#L442) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedEvent**, line 24: `useState(null)`
- **isPending**, line 259: `useMutation({ mutationFn: async (data) => { const res = await axios.patch("/api/weekly-unit/add-substitute", data); return res.data; }, onSuccess: (res) => { toast.success(res.message \|\| "Substitute assigned successfully!"); queryClient.invalidateQueries({ queryKey: ["schedule"] }); closeDrawer(); }, onError: (err) => { toast.error(err.message \|\| "Something went wrong"); }, })`

## components/Pages/TeamMembersSchedule.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { navigate('${params.value}', { state: { id: params.data.mongoId, name: params.value, }, }); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { navigate('${params.value}', { state: { id: params.data.mongoId, name: params.value, }, }); } — [TeamMembersSchedule.jsx:361](../../client/src/components/Pages/TeamMembersSchedule.jsx#L361) |
| Action: () => handleViewUser(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewUser(params.data) — [TeamMembersSchedule.jsx:391](../../client/src/components/Pages/TeamMembersSchedule.jsx#L391) |
| Action: () => handleEditUser(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleEditUser(params.data) — [TeamMembersSchedule.jsx:397](../../client/src/components/Pages/TeamMembersSchedule.jsx#L397) |
| Assign Member (table-generated action) | !isUnitAssignees | No local disabled condition detected | handleAddUser — [TeamMembersSchedule.jsx:529](../../client/src/components/Pages/TeamMembersSchedule.jsx#L529) |
| Advanced filter (table-generated utility) | !isUnitAssignees; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [TeamMembersSchedule.jsx:529](../../client/src/components/Pages/TeamMembersSchedule.jsx#L529) |
| Submit (button) | modalMode === "add" | isAssignMemberPending; loading: isAssignMemberPending | No inline handler declared; may submit a form or delegate to a component — [TeamMembersSchedule.jsx:713](../../client/src/components/Pages/TeamMembersSchedule.jsx#L713) |
| Submit (button) | modalMode === "edit" && selectedUser | isAssignPrimary; loading: isAssignPrimary | No inline handler declared; may submit a form or delegate to a component — [TeamMembersSchedule.jsx:906](../../client/src/components/Pages/TeamMembersSchedule.jsx#L906) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 360: `params`
- **params**, line 389: `params`
- **isUnitAssignees**, line 183: `useQuery({ queryKey: ["unitAssignees"], queryFn: async () => { try { const response = await axios.get( '/api/weekly-unit/get-primary-units?id=${department?._id}&name=${department?.name}' ); return response.data; } catch (error) { throw new Error(error.response.data.message); } }, })`
- **isAssignMemberPending**, line 304: `useMutation({ mutationKey: ["assignMember"], mutationFn: async (data) => { const response = await axios.post( "/api/administration/assign-weekly-unit", { ...data, department: department?._id } ); return response.data; }, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["unitAssignees"] }); toast.success(data.message \|\| "Data submitted successfully!"); reset(); setIsModalOpen(false); }, onError: (error) => { toast.error(error.message \|\| "Error submitting data"); }, })`
- **selectedUser**, line 27: `useState(null)`
- **isAssignPrimary**, line 325: `useMutation({ mutationKey: ["assignPrimary"], mutationFn: async (data) => { const response = await axios.patch( "/api/company/assign-primary-unit", data ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "PRIMARY ASSIGNED"); queryClient.invalidateQueries({ queryKey: ["unitsData"] }); setIsModalOpen(false); primaryReset(); }, onError: (error) => { toast.error(error.message \|\| "CHECK LOG"); }, })`

## components/Pages/VendorTable.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate('${params.data.vendorName}', { state: params.data }) (clickable action) | !isEmpty | No local disabled condition detected | () => navigate('${params.data.vendorName}', { state: params.data }) — [VendorTable.jsx:52](../../client/src/components/Pages/VendorTable.jsx#L52) |
| Add Vendor (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate("vendor-onboard") — [VendorTable.jsx:190](../../client/src/components/Pages/VendorTable.jsx#L190) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [VendorTable.jsx:190](../../client/src/components/Pages/VendorTable.jsx#L190) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VendorTable.jsx:190](../../client/src/components/Pages/VendorTable.jsx#L190) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isEmpty**, line 49: `params.value === "N/A"`
- **params**, line 48: `params`
- **data**, line 21: `useQuery({ queryKey: ["vendors", department?._id], enabled: !!department?._id, queryFn: async function () { const response = await axios.get( '/api/vendors/get-vendors/${department._id}' ); return response.data; }, })`

## components/PrimaryButton.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: handleSubmit (button) | No local render guard detected; page/API access still applies | disabled \|\| isLoading | handleSubmit — [PrimaryButton.jsx:18](../../client/src/components/PrimaryButton.jsx#L18) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isLoading**, line 5: `{ title, handleSubmit, type, fontSize, externalStyles, disabled, padding, className, isLoading, // New prop for showing the spinner }`

## components/SecondaryButton.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: handleSubmit (button) | No local render guard detected; page/API access still applies | disabled \|\| isLoading | handleSubmit — [SecondaryButton.jsx:15](../../client/src/components/SecondaryButton.jsx#L15) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isLoading**, line 5: `{ title, handleSubmit, type, fontSize, externalStyles, disabled, isLoading, // New prop for showing the spinner }`

## components/Sidebar.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { if (module.hasModulePermission) { navigate(module.route, { flushSync: true }); } else if (module.submenus?.length) { toggleModule(index); } } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (module.hasModulePermission) { navigate(module.route, { flushSync: true }); } else if (module.submenus?.length) { toggleModule(index); } } — [Sidebar.jsx:337](../../client/src/components/Sidebar.jsx#L337) |
| Action: () => module.submenus && toggleModule(index) (clickable action) | isSidebarOpen && module.submenus | No local disabled condition detected | () => module.submenus && toggleModule(index) — [Sidebar.jsx:371](../../client/src/components/Sidebar.jsx#L371) |
| Action: () => handleMenuOpen(submenu) (clickable action) | module.submenus | No local disabled condition detected | () => handleMenuOpen(submenu) — [Sidebar.jsx:391](../../client/src/components/Sidebar.jsx#L391) |
| Action: () => handleMenuOpen(item) (clickable action) | menuItems.length > 0 | No local disabled condition detected | () => handleMenuOpen(item) — [Sidebar.jsx:430](../../client/src/components/Sidebar.jsx#L430) |
| Action: () => handleMenuOpen(item) (clickable action) | generalItems.length > 0 | No local disabled condition detected | () => handleMenuOpen(item) — [Sidebar.jsx:459](../../client/src/components/Sidebar.jsx#L459) |
| Action: () => handleMenuOpen(item) (clickable action) | upcomingItems.length > 0 | No local disabled condition detected | () => handleMenuOpen(item) — [Sidebar.jsx:488](../../client/src/components/Sidebar.jsx#L488) |
| Action: () => handleMenuOpen(item) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleMenuOpen(item) — [Sidebar.jsx:516](../../client/src/components/Sidebar.jsx#L516) |
| Icon/action: handleSignOut (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleSignOut — [Sidebar.jsx:538](../../client/src/components/Sidebar.jsx#L538) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isSidebarOpen**, line 42: `useSidebar()`

## components/TableDateFilter.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Select date range (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | (event) => setAnchor(event.currentTarget) — [TableDateFilter.jsx:25](../../client/src/components/TableDateFilter.jsx#L25) |

## components/Tables/AllocatedBudget.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: IconButton (button) | No local render guard detected; page/API access still applies | files.length >= 15 | No inline handler declared; may submit a form or delegate to a component — [AllocatedBudget.jsx:151](../../client/src/components/Tables/AllocatedBudget.jsx#L151) |
| 'View all ${links.length} invoice files' (button) | links.length > 1 AND params.data?.invoiceAttached && links.length AND column.field === "invoiceStatus" | No local disabled condition detected | () => setInvoiceFiles(links.map((link, index) => ({ link, name: params.data.invoices?.find((file) => file.link === link)?.name \|\| 'Invoice ${index + 1}', }))) — [AllocatedBudget.jsx:623](../../client/src/components/Tables/AllocatedBudget.jsx#L623) |
| View budget details (button) | enableActionMenu AND !noInvoice | No local disabled condition detected | () => setViewBudget(params.data) — [AllocatedBudget.jsx:681](../../client/src/components/Tables/AllocatedBudget.jsx#L681) |
| Restore budget (button) | params.data.isDeleted && canDeleteBudgets AND enableActionMenu AND !noInvoice | isDeletePending \|\| isRestorePending | () => setConfirmationAction({ type: "restore", row: params.data }) — [AllocatedBudget.jsx:691](../../client/src/components/Tables/AllocatedBudget.jsx#L691) |
| Delete budget (button) | params.data.status === "Pending" && canDeleteBudgets AND enableActionMenu AND !noInvoice | isDeletePending \|\| isRestorePending | () => setConfirmationAction({ type: params.data.isDeleted \|\| canPermanentlyDelete ? "permanent-delete" : "delete", row: params.data, }) — [AllocatedBudget.jsx:705](../../client/src/components/Tables/AllocatedBudget.jsx#L705) |
| Icon/action: (event) => handleOpenActionMenu(event, params.data) (button) | !params.data.isDeleted AND enableActionMenu AND !noInvoice | false | (event) => handleOpenActionMenu(event, params.data) — [AllocatedBudget.jsx:731](../../client/src/components/Tables/AllocatedBudget.jsx#L731) |
| Upload Invoice (button) | isApproved && !invoiceAttached AND !noInvoice | No local disabled condition detected | () => { setSelectedRow(params.data); setUploadModalOpen(true); } — [AllocatedBudget.jsx:750](../../client/src/components/Tables/AllocatedBudget.jsx#L750) |
| Action: handleOpenCalendar (clickable action) | dateRange.length > 0 && dateRange[0] | No local disabled condition detected | handleOpenCalendar — [AllocatedBudget.jsx:864](../../client/src/components/Tables/AllocatedBudget.jsx#L864) |
| Request Budget (button) | onRequestBudget | No local disabled condition detected | onRequestBudget — [AllocatedBudget.jsx:916](../../client/src/components/Tables/AllocatedBudget.jsx#L916) |
| Export (button) | exportData | No local disabled condition detected | handleExportPass — [AllocatedBudget.jsx:923](../../client/src/components/Tables/AllocatedBudget.jsx#L923) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AllocatedBudget.jsx:970](../../client/src/components/Tables/AllocatedBudget.jsx#L970) |
| Submit (button) | No local render guard detected; page/API access still applies | isUploadPending; loading: isUploadPending | No inline handler declared; may submit a form or delegate to a component — [AllocatedBudget.jsx:1133](../../client/src/components/Tables/AllocatedBudget.jsx#L1133) |
| Edit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (actionRow) { handleOpenEditModal(actionRow); } handleCloseActionMenu(); } — [AllocatedBudget.jsx:1162](../../client/src/components/Tables/AllocatedBudget.jsx#L1162) |
| Submit (button) | No local render guard detected; page/API access still applies | isUpdatePending \|\| isUploadPending; loading: isUpdatePending \|\| isUploadPending | No inline handler declared; may submit a form or delegate to a component — [AllocatedBudget.jsx:1388](../../client/src/components/Tables/AllocatedBudget.jsx#L1388) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 599: `params`
- **params**, line 677: `params`
- **canDeleteBudgets**, line 206: `canManageBudgetDeletes(auth?.user)`
- **canManageBudgetDeletes**, line 55: `(user) => (user?.role \|\| []).some((role) => { const roleTitle = String(role?.roleTitle \|\| role).trim().toLowerCase(); return ( !roleTitle.includes("employee") && ["manager", "admin", "top management"].some((title) => roleTitle.includes(title), ) ); })`
- **auth**, line 202: `useAuth()`
- **isDeletePending**, line 385: `useMutation({ mutationFn: async (budgetId) => (await axios.delete('/api/budget/${budgetId}')).data, onSuccess: (data) => { toast.success(data.message \|\| "Budget deleted successfully"); setConfirmationAction(null); queryClient.invalidateQueries({ queryKey: ["financeBudget"] }); queryClient.invalidateQueries({ queryKey: ["departmentBudget"] }); queryClient.invalidateQueries({ queryKey: ["allBudgets"] }); queryClient.invalidateQueries({ queryKey: ["pendingApprovalsBudget"] }); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to delete budget"); }, })`
- **isRestorePending**, line 402: `useMutation({ mutationFn: async (budgetId) => (await axios.patch('/api/budget/${budgetId}/restore')).data, onSuccess: (data) => { toast.success(data.message \|\| "Budget restored successfully"); setConfirmationAction(null); queryClient.invalidateQueries({ queryKey: ["financeBudget"] }); queryClient.invalidateQueries({ queryKey: ["departmentBudget"] }); queryClient.invalidateQueries({ queryKey: ["allBudgets"] }); queryClient.invalidateQueries({ queryKey: ["pendingApprovalsBudget"] }); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to restore budget"); }, })`
- **canPermanentlyDelete**, line 203: `(auth?.user?.departments \|\| []).some( isPermanentDeleteDepartment, )`
- **isPermanentDeleteDepartment**, line 51: `(department) => String(department?._id \|\| department) === TECH_DEPARTMENT_ID \|\| PERMANENT_DELETE_DEPARTMENTS.has(department?.name?.trim().toLowerCase())`
- **isApproved**, line 745: `status === "Approved"`
- **isUploadPending**, line 331: `useMutation({ mutationFn: async (formData) => { const rowId = formData.get("rowId"); formData.delete("rowId"); const response = await axios.patch( '/api/budget/upload-budget-invoice/${rowId}', formData, { headers: { "Content-Type": "multipart/form-data" }, } ); return response.data; }, onSuccess: () => { reset(); setUploadModalOpen(false); setEditModalOpen(false); queryClient.invalidateQueries({ queryKey: ["financeBudget"] }); queryClient.invalidateQueries({ queryKey: ["departmentBudget"] }); }, onError: (error) => { toast.error("Failed to upload invoice."); console.error(error); }, })`
- **isUpdatePending**, line 358: `useMutation({ mutationFn: async ({ budgetId, payload }) => { const response = await axios.patch( '/api/budget/update-budget/${budgetId}', payload ); return response.data; }, onSuccess: (data, { invoiceImage, row, syncInvoices }) => { toast.success(data.message \|\| "Budget updated successfully"); if (syncInvoices) { onUpload({ invoiceImage }, row); } else { setEditModalOpen(false); resetEdit(); } setActionAnchorEl(null); setActionRow(null); queryClient.invalidateQueries({ queryKey: ["financeBudget"] }); queryClient.invalidateQueries({ queryKey: ["departmentBudget"] }); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to update budget"); }, })`

## components/Tables/DateWiseTable.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | dateLabels.length > 0 | selectedDateIndex === 0 | () => setSelectedDateIndex((prev) => Math.max(prev - 1, 0)) — [DateWiseTable.jsx:103](../../client/src/components/Tables/DateWiseTable.jsx#L103) |
| <MdNavigateNext /> (button) | dateLabels.length > 0 | selectedDateIndex === dateLabels.length - 1 | () => setSelectedDateIndex((prev) => Math.min(prev + 1, dateLabels.length - 1) ) — [DateWiseTable.jsx:113](../../client/src/components/Tables/DateWiseTable.jsx#L113) |
| Export (button) | exportData | No local disabled condition detected | handleExportPass — [DateWiseTable.jsx:126](../../client/src/components/Tables/DateWiseTable.jsx#L126) |
| buttonTitle (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleSubmit — [DateWiseTable.jsx:138](../../client/src/components/Tables/DateWiseTable.jsx#L138) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DateWiseTable.jsx:138](../../client/src/components/Tables/DateWiseTable.jsx#L138) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedDateIndex**, line 65: `useState(defaultDateIndex)`

## components/Tables/MonthWiseAgTable.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | filteredMonths.length > 0 | selectedMonthIndex === 0 | () => setSelectedMonthIndex((prev) => Math.max(prev - 1, 0)) — [MonthWiseAgTable.jsx:127](../../client/src/components/Tables/MonthWiseAgTable.jsx#L127) |
| <MdNavigateNext /> (button) | filteredMonths.length > 0 | selectedMonthIndex === filteredMonths.length - 1 | () => setSelectedMonthIndex((prev) => Math.min(prev + 1, filteredMonths.length - 1) ) — [MonthWiseAgTable.jsx:137](../../client/src/components/Tables/MonthWiseAgTable.jsx#L137) |
| <MdNavigateBefore /> (button) | fiscalYears.length > 0 | selectedFYIndex === 0 | () => setSelectedFYIndex((prev) => Math.max(prev - 1, 0)) — [MonthWiseAgTable.jsx:151](../../client/src/components/Tables/MonthWiseAgTable.jsx#L151) |
| <MdNavigateNext /> (button) | fiscalYears.length > 0 | selectedFYIndex === fiscalYears.length - 1 | () => setSelectedFYIndex((prev) => Math.min(prev + 1, fiscalYears.length - 1) ) — [MonthWiseAgTable.jsx:161](../../client/src/components/Tables/MonthWiseAgTable.jsx#L161) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MonthWiseAgTable.jsx:185](../../client/src/components/Tables/MonthWiseAgTable.jsx#L185) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedMonthIndex**, line 51: `useState(0)`
- **selectedFYIndex**, line 16: `useState(0)`

## components/Tables/MonthWiseTable.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | monthLabels.length > 0 | selectedMonthIndex === 0 | () => setSelectedMonthIndex((prev) => Math.max(prev - 1, 0)) — [MonthWiseTable.jsx:101](../../client/src/components/Tables/MonthWiseTable.jsx#L101) |
| <MdNavigateNext /> (button) | monthLabels.length > 0 | selectedMonthIndex === monthLabels.length - 1 | () => setSelectedMonthIndex((prev) => Math.min(prev + 1, monthLabels.length - 1) ) — [MonthWiseTable.jsx:111](../../client/src/components/Tables/MonthWiseTable.jsx#L111) |
| Export (button) | exportData | No local disabled condition detected | handleExportPass — [MonthWiseTable.jsx:124](../../client/src/components/Tables/MonthWiseTable.jsx#L124) |
| buttonTitle (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleSubmit — [MonthWiseTable.jsx:137](../../client/src/components/Tables/MonthWiseTable.jsx#L137) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MonthWiseTable.jsx:137](../../client/src/components/Tables/MonthWiseTable.jsx#L137) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedMonthIndex**, line 59: `useState( selectedMonthIndexDefault )`
- **selectedMonthIndexDefault**, line 53: `useMemo(() => { const index = monthLabels.findIndex((label) => label === currentMonth); return index >= 0 ? index : 0; }, [monthLabels])`

## components/Tables/MuiCollapsibleTable.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => toggleRow(rowId) (button) | NOT (filteredRows.length === 0) | No local disabled condition detected | () => toggleRow(rowId) — [MuiCollapsibleTable.jsx:82](../../client/src/components/Tables/MuiCollapsibleTable.jsx#L82) |

## components/Tables/WidgetTable.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: handleOpenCalendar (clickable action) | dateRange.length > 0 && dateRange[0] | No local disabled condition detected | handleOpenCalendar — [WidgetTable.jsx:369](../../client/src/components/Tables/WidgetTable.jsx#L369) |
| buttonTitle (button) | buttonTitle | No local disabled condition detected | handleSubmit — [WidgetTable.jsx:424](../../client/src/components/Tables/WidgetTable.jsx#L424) |
| batchButton (button) | batchButton && selectedRows.length > 0 | No local disabled condition detected | () => handleBatchAction(selectedRows) — [WidgetTable.jsx:428](../../client/src/components/Tables/WidgetTable.jsx#L428) |
| Export (button) | exportData AND NOT (exportAction !== undefined) | No local disabled condition detected | handleExportPass — [WidgetTable.jsx:435](../../client/src/components/Tables/WidgetTable.jsx#L435) |
| batchButton (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [WidgetTable.jsx:459](../../client/src/components/Tables/WidgetTable.jsx#L459) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [WidgetTable.jsx:459](../../client/src/components/Tables/WidgetTable.jsx#L459) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedRows**, line 63: `useState([])`

## components/Tables/YearWiseTable.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: handleOpenCalendar (clickable action) | !hideDateControls && !showDateNavigator && dateRange.length > 0 && dateRange[0] | No local disabled condition detected | handleOpenCalendar — [YearWiseTable.jsx:415](../../client/src/components/Tables/YearWiseTable.jsx#L415) |
| Icon/action: onPreviousDay (button) | !hideDateControls && showDateNavigator | No local disabled condition detected | onPreviousDay — [YearWiseTable.jsx:435](../../client/src/components/Tables/YearWiseTable.jsx#L435) |
| Icon/action: onNextDay (button) | !hideDateControls && showDateNavigator | No local disabled condition detected | onNextDay — [YearWiseTable.jsx:493](../../client/src/components/Tables/YearWiseTable.jsx#L493) |
| secondaryButtonTitle (button) | secondaryButtonTitle | secondaryButtonDisabled | handleSecondarySubmit — [YearWiseTable.jsx:549](../../client/src/components/Tables/YearWiseTable.jsx#L549) |
| middleButtonTitle (button) | middleButtonTitle | middleButtonDisabled | handleMiddleSubmit — [YearWiseTable.jsx:550](../../client/src/components/Tables/YearWiseTable.jsx#L550) |
| customExportTitle (button) | customExportTitle && handleCustomExport | customExportDisabled | handleCustomExport — [YearWiseTable.jsx:553](../../client/src/components/Tables/YearWiseTable.jsx#L553) |
| exportButtonTitle (button) | exportData AND NOT (customExportTitle && handleCustomExport) | No local disabled condition detected | handleExportPass — [YearWiseTable.jsx:559](../../client/src/components/Tables/YearWiseTable.jsx#L559) |
| buttonTitle (table-generated action) | No local render guard detected; page/API access still applies | buttonDisabled | handleSubmit — [YearWiseTable.jsx:583](../../client/src/components/Tables/YearWiseTable.jsx#L583) |
| batchButton (table-generated action) | No local render guard detected; page/API access still applies | buttonDisabled | No inline handler declared; may submit a form or delegate to a component — [YearWiseTable.jsx:583](../../client/src/components/Tables/YearWiseTable.jsx#L583) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [YearWiseTable.jsx:583](../../client/src/components/Tables/YearWiseTable.jsx#L583) |
| batchButton (button) | batchButton && selectedRows.length > 0 | No local disabled condition detected | () => handleBatchAction(selectedRows) — [YearWiseTable.jsx:608](../../client/src/components/Tables/YearWiseTable.jsx#L608) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedRows**, line 81: `useState([])`

## components/ThreeDotMenu.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: handleOpen (button) | No local render guard detected; page/API access still applies | disabled | handleOpen — [ThreeDotMenu.jsx:22](../../client/src/components/ThreeDotMenu.jsx#L22) |
| Action: () => { if (!itemDisabled) { onClick(); handleClose(); // optionally close after click } } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (!itemDisabled) { onClick(); handleClose(); // optionally close after click } } — [ThreeDotMenu.jsx:37](../../client/src/components/ThreeDotMenu.jsx#L37) |

## components/TicketCard.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate(route) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate(route) — [TicketCard.jsx:17](../../client/src/components/TicketCard.jsx#L17) |

## components/UploadFileInput.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: IconButton (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [UploadFileInput.jsx:269](../../client/src/components/UploadFileInput.jsx#L269) |
| Preview (clickable action) | value && previewUrl | No local disabled condition detected | () => setOpenModal(true) — [UploadFileInput.jsx:279](../../client/src/components/UploadFileInput.jsx#L279) |
| Icon/action: handleClear (button) | value && previewUrl | No local disabled condition detected | handleClear — [UploadFileInput.jsx:293](../../client/src/components/UploadFileInput.jsx#L293) |

## components/UploadMultipleFilesInput.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Select files (button) | No local render guard detected; page/API access still applies | disabled | (event) => { if (reachedLimit) { event.preventDefault(); toast.error("You can attach a maximum of 5 files"); } } — [UploadMultipleFilesInput.jsx:222](../../client/src/components/UploadMultipleFilesInput.jsx#L222) |
| Open preview (clickable action) | showPreviews && previews.length > 0 | No local disabled condition detected | () => { setModalIndex(i); setOpenModal(true); } — [UploadMultipleFilesInput.jsx:279](../../client/src/components/UploadMultipleFilesInput.jsx#L279) |
| Remove (button) | showPreviews && previews.length > 0 | No local disabled condition detected | () => handleRemoveAt(i) — [UploadMultipleFilesInput.jsx:308](../../client/src/components/UploadMultipleFilesInput.jsx#L308) |
| Remove all (button) | showClearAll && value?.length > 0 | No local disabled condition detected | handleClear — [UploadMultipleFilesInput.jsx:325](../../client/src/components/UploadMultipleFilesInput.jsx#L325) |
| Delete this file (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { handleRemoveAt(modalIndex); setOpenModal(false); } — [UploadMultipleFilesInput.jsx:350](../../client/src/components/UploadMultipleFilesInput.jsx#L350) |

## components/Vendor.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [Vendor.jsx:720](../../client/src/components/Vendor.jsx#L720) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [Vendor.jsx:721](../../client/src/components/Vendor.jsx#L721) |

## components/WidgetSection.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| buttonTitle (button) | button AND title | No local disabled condition detected | handleClick — [WidgetSection.jsx:226](../../client/src/components/WidgetSection.jsx#L226) |

## components/graphs/AreaGraph.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => setTimeFilter(filter) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setTimeFilter(filter) — [AreaGraph.jsx:270](../../client/src/components/graphs/AreaGraph.jsx#L270) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setActiveArrow("prev"); if (timeFilter === "Yearly") { setCurrentDate((prev) => prev.subtract(1, "year")); } else if (timeFilter === "Monthly") { setCurrentDate((prev) => prev.subtract(1, "month")); } else if (timeFilter === "Weekly") { setCurrentDate((prev) => prev.subtract(1, "week")); } } — [AreaGraph.jsx:292](../../client/src/components/graphs/AreaGraph.jsx#L292) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setActiveArrow("next"); if (timeFilter === "Yearly") { setCurrentDate((prev) => prev.add(1, "year")); } else if (timeFilter === "Monthly") { setCurrentDate((prev) => prev.add(1, "month")); } else if (timeFilter === "Weekly") { setCurrentDate((prev) => prev.add(1, "week")); } } — [AreaGraph.jsx:329](../../client/src/components/graphs/AreaGraph.jsx#L329) |

## components/graphs/BarGraph.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | departments | departmentIndex === 0 | handlePrev — [BarGraph.jsx:148](../../client/src/components/graphs/BarGraph.jsx#L148) |
| <MdNavigateNext /> (button) | departments | departmentIndex === departments.length - 1 | handleNext — [BarGraph.jsx:156](../../client/src/components/graphs/BarGraph.jsx#L156) |

## components/graphs/FyBarGraph.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => updateSelectedFY(shiftFinancialYear(selectedFY, -1)) — [FyBarGraph.jsx:319](../../client/src/components/graphs/FyBarGraph.jsx#L319) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => updateSelectedFY(shiftFinancialYear(selectedFY, 1)) — [FyBarGraph.jsx:328](../../client/src/components/graphs/FyBarGraph.jsx#L328) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedFY**, line 87: `controlledSelectedFY ?? internalSelectedFY`

## components/graphs/FyBarGraphCount.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFYStartYear((prevYear) => prevYear - 1) — [FyBarGraphCount.jsx:196](../../client/src/components/graphs/FyBarGraphCount.jsx#L196) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFYStartYear((prevYear) => prevYear + 1) — [FyBarGraphCount.jsx:205](../../client/src/components/graphs/FyBarGraphCount.jsx#L205) |

## components/graphs/FyBarGraphPercentage.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => toggleInvestorLegendItem(item.label) (button) | investorVariant | No local disabled condition detected | () => toggleInvestorLegendItem(item.label) — [FyBarGraphPercentage.jsx:766](../../client/src/components/graphs/FyBarGraphPercentage.jsx#L766) |
| Icon/action: () => setHiddenLegendSeries((current) => current.includes(seriesName) ? current.filter((item) => item !== seriesName) : [...current, seriesName] ) (button) | !investorVariant && legendItems.length > 0 | No local disabled condition detected | () => setHiddenLegendSeries((current) => current.includes(seriesName) ? current.filter((item) => item !== seriesName) : [...current, seriesName] ) — [FyBarGraphPercentage.jsx:789](../../client/src/components/graphs/FyBarGraphPercentage.jsx#L789) |
| <MdNavigateBefore /> (button) | !hideYearNavigation | No local disabled condition detected | () => setSelectedFYStartYear((prevYear) => prevYear - 1) — [FyBarGraphPercentage.jsx:824](../../client/src/components/graphs/FyBarGraphPercentage.jsx#L824) |
| <MdNavigateNext /> (button) | !hideYearNavigation | No local disabled condition detected | () => setSelectedFYStartYear((prevYear) => prevYear + 1) — [FyBarGraphPercentage.jsx:835](../../client/src/components/graphs/FyBarGraphPercentage.jsx#L835) |

## components/graphs/FyMonthBarGraph.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | Boolean(fixedFY) | () => setSelectedFY(shiftFinancialYear(selectedFY, -1)) — [FyMonthBarGraph.jsx:243](../../client/src/components/graphs/FyMonthBarGraph.jsx#L243) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | Boolean(fixedFY) | () => setSelectedFY(shiftFinancialYear(selectedFY, 1)) — [FyMonthBarGraph.jsx:253](../../client/src/components/graphs/FyMonthBarGraph.jsx#L253) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | currentMonthIndex === 0 | () => setSelectedMonth(monthOptions[currentMonthIndex - 1]) — [FyMonthBarGraph.jsx:264](../../client/src/components/graphs/FyMonthBarGraph.jsx#L264) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | currentMonthIndex === monthOptions.length - 1 | () => setSelectedMonth(monthOptions[currentMonthIndex + 1]) — [FyMonthBarGraph.jsx:272](../../client/src/components/graphs/FyMonthBarGraph.jsx#L272) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedFY**, line 90: `useState("")`

## components/graphs/NormalBarGraph.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | departments | departmentIndex === 0 | handlePrev — [NormalBarGraph.jsx:110](../../client/src/components/graphs/NormalBarGraph.jsx#L110) |
| <MdNavigateNext /> (button) | departments | departmentIndex === departments.length - 1 | handleNext — [NormalBarGraph.jsx:119](../../client/src/components/graphs/NormalBarGraph.jsx#L119) |

## components/graphs/YearlyGraph.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | !hideYearNavigation | Boolean( minFiscalYear && selectedYearStart <= minFiscalYear, ) | goToPrevYear — [YearlyGraph.jsx:189](../../client/src/components/graphs/YearlyGraph.jsx#L189) |
| <MdNavigateNext /> (button) | !hideYearNavigation | No local disabled condition detected | goToNextYear — [YearlyGraph.jsx:204](../../client/src/components/graphs/YearlyGraph.jsx#L204) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedYearStart**, line 68: `useState(() => { const currentYearStart = getStartYearFromFiscalYear(currentYear); if (currentYearStart) return currentYearStart; if (dateKey && data?.length > 0) { const dateValue = data[0]?.[dateKey]; if (dateValue) return getYearIndexFromDate(dateValue); } return currentFYStartYear; })`
- **data**, line 7: `{ options, data, dataPoint, title, titleAmount, chartId, TitleAmountGreen, TitleAmountRed, TitleAmountTotal, headerRightContent, greenTitle, redTitle, totalTitle, summaryChipVariant, responsiveResize = false, headerCenterContent, headerCenterContentInline = false, chartTopContent, secondParam = false, chartHeight, sectionHeight = "", currentYear, onYearChange, refreshOnDataChange = false, navigationLabel = "", hideYearNavigation = false, categories, dateKey, // 👈 New prop minFiscalYear, sectionBorderColor, sectionBodyBorderColor, }`

## components/graphs/YearlyGraph2.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | selectedYearIndex === 0 | goToPrevYear — [YearlyGraph2.jsx:154](../../client/src/components/graphs/YearlyGraph2.jsx#L154) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | selectedYearIndex === fiscalYears.length - 1 | goToNextYear — [YearlyGraph2.jsx:165](../../client/src/components/graphs/YearlyGraph2.jsx#L165) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **selectedYearIndex**, line 49: `useState(() => { if (dateKey && data?.length > 0) { const dateValue = data[0]?.dateKey; if (dateValue) return getYearIndexFromDate(dateValue); } return 1; })`
- **data**, line 7: `{ options, data, dataPoint, title, titleAmount, chartId, TitleAmountGreen, TitleAmountRed, TitleAmountTotal, greenTitle, redTitle, totalTitle, responsiveResize = false, secondParam = false, chartHeight, currentYear, onYearChange, dateKey, // 👈 New prop }`

## components/vendor/ViewVendor.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Edit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleEditToggle — [ViewVendor.jsx:261](../../client/src/components/vendor/ViewVendor.jsx#L261) |
| Submit (button) | isEditing | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [ViewVendor.jsx:659](../../client/src/components/vendor/ViewVendor.jsx#L659) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isEditing**, line 29: `useState(false)`

## hooks/useTableControls.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpen(true) — [useTableControls.jsx:27](../../client/src/hooks/useTableControls.jsx#L27) |
| Apply Filters (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setApplied(filters); setOpen(false); } — [useTableControls.jsx:35](../../client/src/hooks/useTableControls.jsx#L35) |
| Clear Filters (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | clear — [useTableControls.jsx:36](../../client/src/hooks/useTableControls.jsx#L36) |

## layouts/MainLayout.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => setMobileOpen(true) (button) | isMobile | No local disabled condition detected | () => setMobileOpen(true) — [MainLayout.jsx:123](../../client/src/layouts/MainLayout.jsx#L123) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isMobile**, line 96: `useMediaQuery("(max-width: 768px)")`
