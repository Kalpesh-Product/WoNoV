# Frontend Dashboard: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Dashboard/FrontendDashboard/Data/FrontendLeads.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/frontend-dashboard/data/leads — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [FrontendLeads.jsx:540](../../client/src/pages/Dashboard/FrontendDashboard/Data/FrontendLeads.jsx#L540) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [FrontendLeads.jsx:540](../../client/src/pages/Dashboard/FrontendDashboard/Data/FrontendLeads.jsx#L540) |

## pages/Dashboard/FrontendDashboard/Data/FrontendWebsiteIssueReports.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/frontend-dashboard/data/website-issue-reports — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => ("View Details clicked for id", params.data.id) — [FrontendWebsiteIssueReports.jsx:40](../../client/src/pages/Dashboard/FrontendDashboard/Data/FrontendWebsiteIssueReports.jsx#L40) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [FrontendWebsiteIssueReports.jsx:173](../../client/src/pages/Dashboard/FrontendDashboard/Data/FrontendWebsiteIssueReports.jsx#L173) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [FrontendWebsiteIssueReports.jsx:173](../../client/src/pages/Dashboard/FrontendDashboard/Data/FrontendWebsiteIssueReports.jsx#L173) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 38: `params`

## pages/Dashboard/FrontendDashboard/FrontendFinance/FrontendBudget.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Request Budget (table-generated action) | !isHrLoading AND NOT (!isReady) | No local disabled condition detected | () => setOpenModal(true) — [FrontendBudget.jsx:276](../../client/src/pages/Dashboard/FrontendDashboard/FrontendFinance/FrontendBudget.jsx#L276) |
| Advanced filter (table-generated utility) | !isHrLoading AND NOT (!isReady); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [FrontendBudget.jsx:276](../../client/src/pages/Dashboard/FrontendDashboard/FrontendFinance/FrontendBudget.jsx#L276) |
| Submit (button) | NOT (!isReady) | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [FrontendBudget.jsx:379](../../client/src/pages/Dashboard/FrontendDashboard/FrontendFinance/FrontendBudget.jsx#L379) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isHrLoading**, line 35: `useQuery({ queryKey: ["frontendBudget"], queryFn: async () => { try { const response = await axios.get( '/api/budget/company-budget?departmentId=6798ba9de469e809084e2494' ); const budgets = response.data.allBudgets; return Array.isArray(budgets) ? budgets : []; } catch (error) { console.error("Error fetching budget:", error); return []; } }, })`
- **isReady**, line 31: `useState(false)`

## pages/Dashboard/FrontendDashboard/FrontendSettings/BulkUpload.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [BulkUpload.jsx:53](../../client/src/pages/Dashboard/FrontendDashboard/FrontendSettings/BulkUpload.jsx#L53) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [BulkUpload.jsx:73](../../client/src/pages/Dashboard/FrontendDashboard/FrontendSettings/BulkUpload.jsx#L73) |

## pages/Dashboard/FrontendDashboard/FrontendSettings/Policies.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [Policies.jsx:64](../../client/src/pages/Dashboard/FrontendDashboard/FrontendSettings/Policies.jsx#L64) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Policies.jsx:82](../../client/src/pages/Dashboard/FrontendDashboard/FrontendSettings/Policies.jsx#L82) |

## pages/Dashboard/FrontendDashboard/FrontendSettings/Sops.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [Sops.jsx:49](../../client/src/pages/Dashboard/FrontendDashboard/FrontendSettings/Sops.jsx#L49) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Sops.jsx:68](../../client/src/pages/Dashboard/FrontendDashboard/FrontendSettings/Sops.jsx#L68) |

## pages/Dashboard/FrontendDashboard/WebsiteBuilder/CreateWebsite.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/frontend-dashboard/create-website — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Remove (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => removeAbout(index) — [CreateWebsite.jsx:314](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/CreateWebsite.jsx#L314) |
| + Add Para (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => appendAbout({ text: "" }) — [CreateWebsite.jsx:342](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/CreateWebsite.jsx#L342) |
| Remove (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => removeProduct(index) — [CreateWebsite.jsx:379](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/CreateWebsite.jsx#L379) |
| + Add Product (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => appendProduct({ ...defaultProduct }) — [CreateWebsite.jsx:485](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/CreateWebsite.jsx#L485) |
| Remove (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => removeTestimonial(index) — [CreateWebsite.jsx:560](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/CreateWebsite.jsx#L560) |
| + Add Testimonial (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => appendTestimonial({ ...defaultTestimonial }) — [CreateWebsite.jsx:661](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/CreateWebsite.jsx#L661) |
| Submit (button) | No local render guard detected; page/API access still applies | loading: isCreateWebsiteLoading | No inline handler declared; may submit a form or delegate to a component — [CreateWebsite.jsx:824](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/CreateWebsite.jsx#L824) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [CreateWebsite.jsx:829](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/CreateWebsite.jsx#L829) |

## pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditTemplate.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/frontend-dashboard/edit-theme/:templateName/:pageName — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Add Page (button) | NOT (error) AND NOT (isLoading) | No local disabled condition detected | () => setInput(true) — [EditTemplate.jsx:287](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditTemplate.jsx#L287) |
| Save (button) | No local render guard detected; page/API access still applies | isSaveEditorData; loading: isSaveEditorData | saveEditorData — [EditTemplate.jsx:292](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditTemplate.jsx#L292) |
| Cancel (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setInput(false); reset(); } — [EditTemplate.jsx:329](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditTemplate.jsx#L329) |
| Add Page (button) | No local render guard detected; page/API access still applies | isAddPagePending; loading: isAddPagePending | No inline handler declared; may submit a form or delegate to a component — [EditTemplate.jsx:336](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditTemplate.jsx#L336) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isLoading**, line 61: `useQuery({ queryKey: ["pages", templateName], queryFn: fetchPages, enabled: !!templateName, // ✅ Fetch only when templateName is available })`
- **isSaveEditorData**, line 180: `useMutation({ mutationFn: async () => { await saveEditorDatas(); }, onSuccess: () => { toast.success("Changes saved"); }, onError: () => { toast.error("Error saving data"); }, })`
- **isAddPagePending**, line 71: `useMutation({ mutationFn: async (data) => { const response = await axios.post( '/api/editor/templates/${encodeURIComponent(templateName)}/addPage', { pageName: data.pageName, } ); return response.data; }, onSuccess: function (data) { toast.success(data.message \|\| "Page added successfully"); queryClient.invalidateQueries({ queryKey: ["pages"] }); setInput(false); reset(); }, onError: function (error) { toast.error(error.message \|\| "Error adding pages"); }, })`

## pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsite.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/frontend-dashboard/websites/:website — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Remove (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => removeAbout(index) — [EditWebsite.jsx:488](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsite.jsx#L488) |
| + Add Para (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => appendAbout({ text: "" }) — [EditWebsite.jsx:517](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsite.jsx#L517) |
| Remove (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => removeProduct(index) — [EditWebsite.jsx:554](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsite.jsx#L554) |
| + Add Product (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => appendProduct({ ...defaultProduct }) — [EditWebsite.jsx:675](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsite.jsx#L675) |
| Remove (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => removeTestimonial(index) — [EditWebsite.jsx:762](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsite.jsx#L762) |
| + Add Testimonial (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => appendTestimonial({ ...defaultTestimonial }) — [EditWebsite.jsx:879](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsite.jsx#L879) |
| isUpdating ? "Updating..." : "Submit" (button) | No local render guard detected; page/API access still applies | loading: isUpdating | No inline handler declared; may submit a form or delegate to a component — [EditWebsite.jsx:1029](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsite.jsx#L1029) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [EditWebsite.jsx:1034](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsite.jsx#L1034) |
| Delete (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => onDelete(img) — [EditWebsite.jsx:1059](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsite.jsx#L1059) |

## pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsiteTemp.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/frontend-dashboard/websites/inactive/:website — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Remove (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => removeAbout(index) — [EditWebsiteTemp.jsx:488](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsiteTemp.jsx#L488) |
| + Add Para (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => appendAbout({ text: "" }) — [EditWebsiteTemp.jsx:517](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsiteTemp.jsx#L517) |
| Remove (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => removeProduct(index) — [EditWebsiteTemp.jsx:554](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsiteTemp.jsx#L554) |
| + Add Product (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => appendProduct({ ...defaultProduct }) — [EditWebsiteTemp.jsx:675](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsiteTemp.jsx#L675) |
| Remove (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => removeTestimonial(index) — [EditWebsiteTemp.jsx:762](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsiteTemp.jsx#L762) |
| + Add Testimonial (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => appendTestimonial({ ...defaultTestimonial }) — [EditWebsiteTemp.jsx:879](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsiteTemp.jsx#L879) |
| isUpdating ? "Updating..." : "Submit" (button) | No local render guard detected; page/API access still applies | loading: isUpdating | No inline handler declared; may submit a form or delegate to a component — [EditWebsiteTemp.jsx:1029](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsiteTemp.jsx#L1029) |
| Reset (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleReset — [EditWebsiteTemp.jsx:1034](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsiteTemp.jsx#L1034) |
| Delete (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => onDelete(img) — [EditWebsiteTemp.jsx:1059](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditWebsiteTemp.jsx#L1059) |

## pages/Dashboard/FrontendDashboard/WebsiteBuilder/InActiveWebsites.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/frontend-dashboard/websites/inactive — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Mark As Active (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { markAsActive(params.data.searchKey); } — [InActiveWebsites.jsx:70](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/InActiveWebsites.jsx#L70) |
| Edit (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { navigate( '/app/dashboard/frontend-dashboard/websites/inactive/${params?.data?.companyName}', { state: { website: params.data, isLoading: isPending, }, } ) } — [InActiveWebsites.jsx:76](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/InActiveWebsites.jsx#L76) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [InActiveWebsites.jsx:99](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/InActiveWebsites.jsx#L99) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 65: `params`
- **data**, line 15: `useQuery({ queryKey: ["inactive-websites"], queryFn: async () => { try { const response = await axios.get("/api/editor/get-inactive-websites"); return response.data; } catch (error) { console.error(error); } }, })`

## pages/Dashboard/FrontendDashboard/WebsiteBuilder/ThemeGrid.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/frontend-dashboard/select-theme — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate("/app/dashboard/frontend-dashboard/view-theme", { state: { templateName: template.templateName, pageName: template.pages[0]?.pageName, tag: "co-working", lin… (clickable action) | !isTemplatesPending | No local disabled condition detected | () => navigate("/app/dashboard/frontend-dashboard/view-theme", { state: { templateName: template.templateName, pageName: template.pages[0]?.pageName, tag: "co-working", link : "https://www.biznest.co.in/" }, }) — [ThemeGrid.jsx:133](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/ThemeGrid.jsx#L133) |
| Action: () => { navigate("/app/dashboard/frontend-dashboard/view-theme", { state: { image }, }); // Pass theme data window.scrollTo({ top: 0, behavior: "instant" }); } (clickable action) | !isTemplatesPending | No local disabled condition detected | () => { navigate("/app/dashboard/frontend-dashboard/view-theme", { state: { image }, }); // Pass theme data window.scrollTo({ top: 0, behavior: "instant" }); } — [ThemeGrid.jsx:156](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/ThemeGrid.jsx#L156) |
| Get started (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { navigate("/register"); window.scrollTo({ top: 0, behavior: "instant" }); } — [ThemeGrid.jsx:206](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/ThemeGrid.jsx#L206) |
| Get started (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { navigate("/register"); window.scrollTo({ top: 0, behavior: "instant" }); } — [ThemeGrid.jsx:244](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/ThemeGrid.jsx#L244) |
| Connect With us → (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { navigate("/contact"); window.scrollTo({ top: 0, behavior: "instant" }); } — [ThemeGrid.jsx:278](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/ThemeGrid.jsx#L278) |
| Browse all services → (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { navigate("/saas"); window.scrollTo({ top: 0, behavior: "instant" }); } — [ThemeGrid.jsx:293](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/ThemeGrid.jsx#L293) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isTemplatesPending**, line 42: `useQuery({ queryKey: ["templates"], queryFn: fetchTemplates, })`

## pages/Dashboard/FrontendDashboard/WebsiteBuilder/ThemePreview.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View Demo (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => window.open(theme.demoLink, "_blank") — [ThemePreview.jsx:33](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/ThemePreview.jsx#L33) |
| Go Back (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate(-1) — [ThemePreview.jsx:41](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/ThemePreview.jsx#L41) |

## pages/Dashboard/FrontendDashboard/WebsiteBuilder/ViewTheme.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/frontend-dashboard/view-theme — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Edit theme (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (templateName && pageName) { navigate( '/app/dashboard/frontend-dashboard/select-theme/edit-theme/${templateName}/${pageName}' ); } else { toast.success("Coming Soon."); } } — [ViewTheme.jsx:176](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/ViewTheme.jsx#L176) |
| Live Demo (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (link) { window.open(link, "_blank"); // ✅ open external link in new tab } else { navigate( "/app/dashboard/frontend-dashboard/live-demo" ); // fallback internal route } } — [ViewTheme.jsx:189](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/ViewTheme.jsx#L189) |
| Action: () => { handleImageClick(rec); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { handleImageClick(rec); } — [ViewTheme.jsx:264](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/ViewTheme.jsx#L264) |
| Load More (button) | filteredRecommendations.length > 4 && !showAll | No local disabled condition detected | handleViewMore — [ViewTheme.jsx:280](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/ViewTheme.jsx#L280) |

## pages/Dashboard/FrontendDashboard/WebsiteBuilder/Websites.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/frontend-dashboard/websites/active — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate( '/app/dashboard/frontend-dashboard/websites/${template.companyName}', { state: { website: template, isLoading: isTemplatesPending, }, } ) (clickable action) | !isTemplatesPending | No local disabled condition detected | () => navigate( '/app/dashboard/frontend-dashboard/websites/${template.companyName}', { state: { website: template, isLoading: isTemplatesPending, }, } ) — [Websites.jsx:96](../../client/src/pages/Dashboard/FrontendDashboard/WebsiteBuilder/Websites.jsx#L96) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isTemplatesPending**, line 42: `useQuery({ queryKey: ["templates"], queryFn: fetchTemplates, })`
