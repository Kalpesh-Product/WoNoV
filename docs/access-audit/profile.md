# Profile: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Profile/ChangePassword.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/profile/change-password — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| 'toggle ${field}' (button) | No local render guard detected; page/API access still applies | disabled | () => togglePasswordVisibility(field) — [ChangePassword.jsx:65](../../client/src/pages/Profile/ChangePassword.jsx#L65) |
| Verify (button) | !passwordVerified | !canChangePassword | handlePasswordCheck — [ChangePassword.jsx:179](../../client/src/pages/Profile/ChangePassword.jsx#L179) |
| Submit (button) | No local render guard detected; page/API access still applies | !canChangePassword \|\| !passwordVerified | handlePasswordChange — [ChangePassword.jsx:235](../../client/src/pages/Profile/ChangePassword.jsx#L235) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **canChangePassword**, line 20: `userDepartments.some((dept) => dept?.name?.trim().toLowerCase() === "tech") \|\| roleTitles.some((roleTitle) => roleTitle?.includes("tech employee"))`
- **userDepartments**, line 17: `auth?.user?.departments \|\| []`
- **auth**, line 13: `useAuth()`
- **roleTitles**, line 18: `auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) \|\| []`

## pages/Profile/MeetingRoomCredits.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/profile/my-meetings — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewDetails(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewDetails(params.data) — [MeetingRoomCredits.jsx:143](../../client/src/pages/Profile/MeetingRoomCredits.jsx#L143) |
| Advanced filter (table-generated utility) | !isMyMeetingsPending; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MeetingRoomCredits.jsx:183](../../client/src/pages/Profile/MeetingRoomCredits.jsx#L183) |
| Submit (button) | No local render guard detected; page/API access still applies | isAddReviewPending; loading: isAddReviewPending | No inline handler declared; may submit a form or delegate to a component — [MeetingRoomCredits.jsx:286](../../client/src/pages/Profile/MeetingRoomCredits.jsx#L286) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 122: `params`
- **isMyMeetingsPending**, line 31: `useQuery({ queryKey: ["myMeetings"], queryFn: async () => { try { const response = await axios.get("/api/meetings/my-meetings"); return response.data; } catch (error) { toast.error(error \|\| "Failed to load your bookings"); } }, })`
- **isAddReviewPending**, line 53: `useMutation({ mutationKey: ["addReview"], mutationFn: async (review) => { const response = await axios.post("/api/meetings/create-review", review); return response.data; }, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["myMeetings"] }); toast.success(data.message \|\| "REVIEW added"); }, onError: (error) => { toast.error(error.message \|\| "Failed to add review"); }, })`

## pages/Profile/MyAssets.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/profile/my-assets — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MyAssets.jsx:73](../../client/src/pages/Profile/MyAssets.jsx#L73) |

## pages/Profile/MyProfile.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: handleUpload (button) | previewUrl | uploading | handleUpload — [MyProfile.jsx:365](../../client/src/pages/Profile/MyProfile.jsx#L365) |
| isEditable ? "Cancel" : "Edit" (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleEditClick — [MyProfile.jsx:403](../../client/src/pages/Profile/MyProfile.jsx#L403) |
| Save (button) | isEditable | No local disabled condition detected | handleSubmit — [MyProfile.jsx:442](../../client/src/pages/Profile/MyProfile.jsx#L442) |
| Reset (button) | isEditable | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [MyProfile.jsx:447](../../client/src/pages/Profile/MyProfile.jsx#L447) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isEditable**, line 167: `useState(false)`

## pages/Profile/TicketsHistory.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/profile/tickets-history — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewTicketDetails(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewTicketDetails(params.data) — [TicketsHistory.jsx:98](../../client/src/pages/Profile/TicketsHistory.jsx#L98) |
| Advanced filter (table-generated utility) | NOT (ticketsLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [TicketsHistory.jsx:122](../../client/src/pages/Profile/TicketsHistory.jsx#L122) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 96: `params`

## pages/Profile/UserDetails.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/profile/my-profile — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: handleUpload (button) | previewUrl | uploading | handleUpload — [UserDetails.jsx:618](../../client/src/pages/Profile/UserDetails.jsx#L618) |
| Edit (button) | !editMode | No local disabled condition detected | () => { // if (userDetails) reset(userDetails); if (userDetails) reset(getNormalizedUserDetails(userDetails)); setEditMode(true); } — [UserDetails.jsx:929](../../client/src/pages/Profile/UserDetails.jsx#L929) |
| Save (button) | editMode | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [UserDetails.jsx:946](../../client/src/pages/Profile/UserDetails.jsx#L946) |
| Cancel (button) | editMode | No local disabled condition detected | () => setEditMode(false) — [UserDetails.jsx:947](../../client/src/pages/Profile/UserDetails.jsx#L947) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **userDetails**, line 94: `useQuery({ queryKey: ["userDetails"], queryFn: async () => { const res = await axios.get('/api/users/fetch-single-user/${empId}'); return res.data; }, })`
