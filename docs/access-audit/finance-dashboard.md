# Finance Dashboard: button access inventory

Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).

## pages/Dashboard/FinanceDashboard/AverageProfitLoss/AverageProfitLoss.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/annual-average-profit-loss — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/annual-average-profit-loss — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate( "/app/dashboard/finance-dashboard/annual-average-profit-loss/income-details" ) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( "/app/dashboard/finance-dashboard/annual-average-profit-loss/income-details" ) — [AverageProfitLoss.jsx:325](../../client/src/pages/Dashboard/FinanceDashboard/AverageProfitLoss/AverageProfitLoss.jsx#L325) |
| Action: () => navigate( "/app/dashboard/finance-dashboard/mix-bag/department-wise-budget" ) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( "/app/dashboard/finance-dashboard/mix-bag/department-wise-budget" ) — [AverageProfitLoss.jsx:343](../../client/src/pages/Dashboard/FinanceDashboard/AverageProfitLoss/AverageProfitLoss.jsx#L343) |
| Export (table-generated utility) | monthlyProfitLossData.length > 0; exportData: true | No local disabled condition detected | Shared table export — [AverageProfitLoss.jsx:543](../../client/src/pages/Dashboard/FinanceDashboard/AverageProfitLoss/AverageProfitLoss.jsx#L543) |
| Advanced filter (table-generated utility) | monthlyProfitLossData.length > 0; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [AverageProfitLoss.jsx:543](../../client/src/pages/Dashboard/FinanceDashboard/AverageProfitLoss/AverageProfitLoss.jsx#L543) |

## pages/Dashboard/FinanceDashboard/Billing/BudgetHistory.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/billing/budget-request/budget-history — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/budget-request/budget-history — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| View budget details (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setViewDetails({ ...params.data, srNo: params.node?.rowIndex == null ? params.data.srNo : params.node.rowIndex + 1 }) — [BudgetHistory.jsx:178](../../client/src/pages/Dashboard/FinanceDashboard/Billing/BudgetHistory.jsx#L178) |
| isUnapprovePending ? "Returning..." : "Unapprove" (configured menu/action) | canUseBulkBudgetActions && isApproved | No local disabled condition detected | () => { if (isUnapprovePending) return; unapproveBudget(params.data._id); } — [BudgetHistory.jsx:192](../../client/src/pages/Dashboard/FinanceDashboard/Billing/BudgetHistory.jsx#L192) |
| canUseBulkBudgetActions ? isBulkUnapprovePending ? "Returning..." : "Unapprove All" : undefined (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | (selectedRows) => { if (!canUseBulkBudgetActions \|\| isBulkUnapprovePending) return; unapproveSelectedBudgets(selectedRows); } — [BudgetHistory.jsx:291](../../client/src/pages/Dashboard/FinanceDashboard/Billing/BudgetHistory.jsx#L291) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [BudgetHistory.jsx:291](../../client/src/pages/Dashboard/FinanceDashboard/Billing/BudgetHistory.jsx#L291) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [BudgetHistory.jsx:291](../../client/src/pages/Dashboard/FinanceDashboard/Billing/BudgetHistory.jsx#L291) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 172: `params`
- **canUseBulkBudgetActions**, line 41: `isTechDepartmentUser(auth?.user)`
- **isTechDepartmentUser**, line 22: `(user) => (Array.isArray(user?.departments) ? user.departments : []).some( (department) => String(department?._id \|\| department) === TECH_DEPARTMENT_ID \|\| String(department?.name \|\| "").trim().toLowerCase() === "tech department", )`
- **auth**, line 38: `useAuth()`
- **isApproved**, line 173: `String(params.data?.status \|\| "").toLowerCase() === "approved"`
- **isUnapprovePending**, line 59: `useMutation({ mutationKey: ["unapproveBudget"], mutationFn: async (budgetId) => { const response = await axios.patch( '/api/budget/unapprove-budget/${budgetId}', ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Budget returned to pending approvals"); queryClient.invalidateQueries({ queryKey: ["budgetHistory"] }); queryClient.invalidateQueries({ queryKey: ["pendingApprovalsBudget"] }); queryClient.invalidateQueries({ queryKey: ["allBudgets"] }); navigate(pendingApprovalsPath); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| error?.message \|\| "Failed to unapprove budget", ); }, })`
- **isBulkUnapprovePending**, line 84: `useMutation({ mutationKey: ["bulkUnapproveBudget"], mutationFn: async (selectedRows) => { const budgetIds = selectedRows.map((row) => row._id).filter(Boolean); if (!budgetIds.length) { throw new Error("Please select at least one approved budget"); } const responses = await Promise.all( budgetIds.map((budgetId) => axios.patch('/api/budget/unapprove-budget/${budgetId}'), ), ); return responses.map((response) => response.data); }, onSuccess: (_, selectedRows) => { toast.success('${selectedRows.length} budget(s) returned to pending'); queryClient.invalidateQueries({ queryKey: ["budgetHistory"] }); queryClient.invalidateQueries({ queryKey: ["pendingApprovalsBudget"] }); queryClient.invalidateQueries({ queryKey: ["allBudgets"] }); navigate(pendingApprovalsPath); }, onError: (error) => { toast.er…`

## pages/Dashboard/FinanceDashboard/Billing/DepartmentInvoice.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/billing/voucher-request/department-invoice-voucher — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/voucher-request/department-invoice-voucher — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setViewDetails(params.data); setViewModal(true); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setViewDetails(params.data); setViewModal(true); } — [DepartmentInvoice.jsx:118](../../client/src/pages/Dashboard/FinanceDashboard/Billing/DepartmentInvoice.jsx#L118) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [DepartmentInvoice.jsx:237](../../client/src/pages/Dashboard/FinanceDashboard/Billing/DepartmentInvoice.jsx#L237) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DepartmentInvoice.jsx:237](../../client/src/pages/Dashboard/FinanceDashboard/Billing/DepartmentInvoice.jsx#L237) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 116: `params`

## pages/Dashboard/FinanceDashboard/Billing/DepartmentInvoiceBudget.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/billing/budget-request/department-invoice-budget — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/budget-request/department-invoice-budget — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setViewDetails(params.data); setViewModal(true); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setViewDetails(params.data); setViewModal(true); } — [DepartmentInvoiceBudget.jsx:111](../../client/src/pages/Dashboard/FinanceDashboard/Billing/DepartmentInvoiceBudget.jsx#L111) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [DepartmentInvoiceBudget.jsx:206](../../client/src/pages/Dashboard/FinanceDashboard/Billing/DepartmentInvoiceBudget.jsx#L206) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DepartmentInvoiceBudget.jsx:206](../../client/src/pages/Dashboard/FinanceDashboard/Billing/DepartmentInvoiceBudget.jsx#L206) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 109: `params`

## pages/Dashboard/FinanceDashboard/Billing/InvoiceCreation.jsx

Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setViewDetails(params.data); setViewModal(true); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setViewDetails(params.data); setViewModal(true); } — [InvoiceCreation.jsx:129](../../client/src/pages/Dashboard/FinanceDashboard/Billing/InvoiceCreation.jsx#L129) |
| Mark As Paid (configured menu/action) | No local render guard detected; page/API access still applies | params.data.status === "Paid" | () => { updateInvoice(params.data.id); } — [InvoiceCreation.jsx:185](../../client/src/pages/Dashboard/FinanceDashboard/Billing/InvoiceCreation.jsx#L185) |
| Add Invoice (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setViewAddTemplateModal(true) — [InvoiceCreation.jsx:210](../../client/src/pages/Dashboard/FinanceDashboard/Billing/InvoiceCreation.jsx#L210) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [InvoiceCreation.jsx:210](../../client/src/pages/Dashboard/FinanceDashboard/Billing/InvoiceCreation.jsx#L210) |
| Add Invoice (button) | viewAddTemplateModal | isSubmitPending; loading: isSubmitPending | No inline handler declared; may submit a form or delegate to a component — [InvoiceCreation.jsx:351](../../client/src/pages/Dashboard/FinanceDashboard/Billing/InvoiceCreation.jsx#L351) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 128: `params`
- **params**, line 180: `params`
- **isSubmitPending**, line 78: `useMutation({ mutationKey: ["submitInvoice"], mutationFn: async (data) => { const response = await axios.post( "/api/finance/upload-client-invoice", data, { headers: { "Content-Type": "multipart/form-data" }, } ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Invoice uploaded"); queryClient.invalidateQueries({ queryKey: ["invoiceData"] }); reset(); setViewAddTemplateModal(false); }, onError: (error) => { toast.error(error.message \|\| "Error uploading invoice"); }, })`

## pages/Dashboard/FinanceDashboard/Billing/PendingApprovals.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/billing/voucher-request/pending-approvals-voucher — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/voucher-request/pending-approvals-voucher — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setSelectedBudget(params.data); setModalType("view"); setModalOpen(true); } (clickable action) | NOT (isRejectPending) | No local disabled condition detected | () => { setSelectedBudget(params.data); setModalType("view"); setModalOpen(true); } — [PendingApprovals.jsx:135](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovals.jsx#L135) |
| Review (configured menu/action) | NOT (isRejectPending) | No local disabled condition detected | () => { dispatch(setVoucherDetails(params.data)); setSelectedBudget(params.data); navigate( '/app/dashboard/finance-dashboard/billing/voucher-request/pending-approvals-voucher/review-request', ); } — [PendingApprovals.jsx:146](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovals.jsx#L146) |
| Reject (configured menu/action) | NOT (isRejectPending) | No local disabled condition detected | () => { setSelectedBudget(params.data); setModalType("reject"); setModalOpen(true); } — [PendingApprovals.jsx:156](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovals.jsx#L156) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PendingApprovals.jsx:177](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovals.jsx#L177) |
| Submit (button) | modalType === "reject" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [PendingApprovals.jsx:225](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovals.jsx#L225) |
| Icon/action: () => setModalOpen(false) (button) | modalType === "review" | No local disabled condition detected | () => setModalOpen(false) — [PendingApprovals.jsx:386](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovals.jsx#L386) |
| Submit (button) | modalType === "review" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [PendingApprovals.jsx:555](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovals.jsx#L555) |
| Export to PDF (button) | modalType === "review" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [PendingApprovals.jsx:562](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovals.jsx#L562) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isRejectPending**, line 73: `useMutation({ mutationKey: ["rejectRequest"], mutationFn: async (data) => { const response = await axios.patch( '/api/budget/reject-budget/${selectedBudget._id}', data, ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "REQUEST REJECTED"); queryClient.invalidateQueries({ queryKey: ["pendingApprovals"] }); reset(); }, onError: (error) => { toast.error(error.message \|\| "FAILED TO REJECT REQUEST"); }, })`
- **selectedBudget**, line 28: `useState([])`
- **params**, line 126: `params`

## pages/Dashboard/FinanceDashboard/Billing/PendingApprovalsBudget.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/billing/budget-request/pending-approvals-budget — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/budget-request/pending-approvals-budget — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setSelectedBudget({ ...params.data, srNo: params.node?.rowIndex == null ? params.data.srNo : params.node.rowIndex + 1 }); setModalType("view"); setModalOpen(true); … (clickable action) | NOT (isRejectPending) | No local disabled condition detected | () => { setSelectedBudget({ ...params.data, srNo: params.node?.rowIndex == null ? params.data.srNo : params.node.rowIndex + 1 }); setModalType("view"); setModalOpen(true); } — [PendingApprovalsBudget.jsx:211](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovalsBudget.jsx#L211) |
| Approve (configured menu/action) | NOT (isRejectPending) | No local disabled condition detected | () => { submitRequest(params.data._id); } — [PendingApprovalsBudget.jsx:223](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovalsBudget.jsx#L223) |
| Reject (configured menu/action) | NOT (isRejectPending) | No local disabled condition detected | () => { setSelectedBudget(params.data); setModalType("reject"); setModalOpen(true); } — [PendingApprovalsBudget.jsx:229](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovalsBudget.jsx#L229) |
| canUseBulkBudgetActions ? isBulkApprovePending ? "Approving..." : "Approve All" : undefined (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | (selectedRows) => { if (!canUseBulkBudgetActions \|\| isBulkApprovePending) return; approveSelectedRequests(selectedRows); } — [PendingApprovalsBudget.jsx:251](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovalsBudget.jsx#L251) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [PendingApprovalsBudget.jsx:251](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovalsBudget.jsx#L251) |
| Submit (button) | modalType === "reject" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [PendingApprovalsBudget.jsx:311](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovalsBudget.jsx#L311) |
| Icon/action: () => setModalOpen(false) (button) | modalType === "review" | No local disabled condition detected | () => setModalOpen(false) — [PendingApprovalsBudget.jsx:432](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovalsBudget.jsx#L432) |
| Submit (button) | modalType === "review" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [PendingApprovalsBudget.jsx:601](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovalsBudget.jsx#L601) |
| Export to PDF (button) | modalType === "review" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [PendingApprovalsBudget.jsx:608](../../client/src/pages/Dashboard/FinanceDashboard/Billing/PendingApprovalsBudget.jsx#L608) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isRejectPending**, line 87: `useMutation({ mutationKey: ["rejectRequest"], mutationFn: async (data) => { const response = await axios.patch( '/api/budget/reject-budget/${selectedBudget._id}', data ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "REQUEST REJECTED"); queryClient.invalidateQueries({ queryKey: ["pendingApprovalsBudget"] }); queryClient.invalidateQueries({ queryKey: ["budgetHistory"] }); queryClient.invalidateQueries({ queryKey: ["allBudgets"] }); queryClient.invalidateQueries({ queryKey: ["budgetData", "finance-dashboard1"], refetchType: "all" }); reset(); navigate( "/app/dashboard/finance-dashboard/billing/budget-request/budget-history" ); }, onError: (error) => { toast.error(error.response?.data?.message \|\| error.message \|\| "FAILED TO REJECT REQUEST"); }, })`
- **selectedBudget**, line 52: `useState([])`
- **params**, line 202: `params`
- **canUseBulkBudgetActions**, line 49: `canUseBulkApprove(auth?.user) \|\| isApprovalAdmin`
- **canUseBulkApprove**, line 26: `(user) => (Array.isArray(user?.departments) ? user.departments : []).some( (department) => [TECH_DEPARTMENT_ID, FINANCE_DEPARTMENT_ID].includes( String(department?._id \|\| department), ) \|\| ["tech department", "finance department"].includes( String(department?.name \|\| "").trim().toLowerCase(), ), )`
- **auth**, line 45: `useAuth()`
- **isApprovalAdmin**, line 46: `(auth?.user?.role \|\| []).some((role) => ["master admin", "super admin"].includes(String(role?.roleTitle \|\| role).trim().toLowerCase()), )`
- **isBulkApprovePending**, line 135: `useMutation({ mutationKey: ["bulkApproveBudget"], mutationFn: async (selectedRows) => { if (selectedRows.some((row) => !row.canApproveBudget)) throw new Error("Selection contains budgets requiring another approval level" ); const budgetIds = selectedRows.map((row) => row._id).filter(Boolean); if (!budgetIds.length) { throw new Error("Please select at least one budget request"); } const responses = await Promise.all( budgetIds.map((budgetId) => axios.patch('/api/budget/approve-budget', { budgetId }), ), ); return responses.map((response) => response.data); }, onSuccess: (_, selectedRows) => { toast.success( "Selected budget approved successfully. You can view the approval details in the Budget History tab.", ); queryClient.invalidateQueries({ queryKey: ["pendingApprovalsBudget"] }); queryCl…`

## pages/Dashboard/FinanceDashboard/Billing/RejectedVoucher.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/billing/voucher-request/reject-voucher — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/voucher-request/reject-voucher — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setSelectedBudget(params.data); setModalOpen(true); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setSelectedBudget(params.data); setModalOpen(true); } — [RejectedVoucher.jsx:101](../../client/src/pages/Dashboard/FinanceDashboard/Billing/RejectedVoucher.jsx#L101) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [RejectedVoucher.jsx:180](../../client/src/pages/Dashboard/FinanceDashboard/Billing/RejectedVoucher.jsx#L180) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [RejectedVoucher.jsx:180](../../client/src/pages/Dashboard/FinanceDashboard/Billing/RejectedVoucher.jsx#L180) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 99: `params`

## pages/Dashboard/FinanceDashboard/Billing/ReviewRequest.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/billing/voucher-request/pending-approvals-voucher/review-request — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/billing/budget-request/pending-approvals-budget/review-request — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/voucher-request/pending-approvals-voucher/review-request — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/budget-request/pending-approvals-budget/review-request — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Add (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { const { particularName, particularAmount } = watch(); if (particularName && particularAmount) { append({ particularName: particularName, particularAmount: parseFloat(particularAmount), }); setValue("particularName", ""); setValue("particularAmount", ""); } } — [ReviewRequest.jsx:321](../../client/src/pages/Dashboard/FinanceDashboard/Billing/ReviewRequest.jsx#L321) |
| Delete (button) | fields.length > 0 | No local disabled condition detected | () => remove(index) — [ReviewRequest.jsx:355](../../client/src/pages/Dashboard/FinanceDashboard/Billing/ReviewRequest.jsx#L355) |
| Preview (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenPreview(true) — [ReviewRequest.jsx:558](../../client/src/pages/Dashboard/FinanceDashboard/Billing/ReviewRequest.jsx#L558) |
| Icon/action: () => setOpenPreview(false) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenPreview(false) — [ReviewRequest.jsx:573](../../client/src/pages/Dashboard/FinanceDashboard/Billing/ReviewRequest.jsx#L573) |
| Submit (button) | No local render guard detected; page/API access still applies | isSubmitRequest; loading: isSubmitRequest | onUpload — [ReviewRequest.jsx:847](../../client/src/pages/Dashboard/FinanceDashboard/Billing/ReviewRequest.jsx#L847) |
| Export to PDF (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | exportToPDF — [ReviewRequest.jsx:854](../../client/src/pages/Dashboard/FinanceDashboard/Billing/ReviewRequest.jsx#L854) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isSubmitRequest**, line 190: `useMutation({ mutationKey: ["approve"], mutationFn: async (formData) => { const response = await axios.patch( '/api/budget/approve-budget', formData, { headers: { "Content-Type": "multipart/form-data", }, }, ); return response.data; }, onSuccess: (data) => { toast.success(data.message); setOpenPreview(false); reset(); navigate( "/app/dashboard/finance-dashboard/billing/voucher-request/pending-approvals-voucher", ); }, onError: (error) => { toast.error(error.message); }, })`

## pages/Dashboard/FinanceDashboard/Billing/VoucherCreation.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/billing/voucher-request/voucher-history — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/billing/voucher-request/voucher-history — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { setViewDetails(params.data); setViewModal(true); } (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setViewDetails(params.data); setViewModal(true); } — [VoucherCreation.jsx:104](../../client/src/pages/Dashboard/FinanceDashboard/Billing/VoucherCreation.jsx#L104) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [VoucherCreation.jsx:121](../../client/src/pages/Dashboard/FinanceDashboard/Billing/VoucherCreation.jsx#L121) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [VoucherCreation.jsx:121](../../client/src/pages/Dashboard/FinanceDashboard/Billing/VoucherCreation.jsx#L121) |
| Submit (configured menu/action) | viewAddVoucherModal | No local disabled condition detected | handleSubmit(onSubmitTemplate) — [VoucherCreation.jsx:286](../../client/src/pages/Dashboard/FinanceDashboard/Billing/VoucherCreation.jsx#L286) |
| Icon/action: IconButton (button) | viewAddVoucherModal | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [VoucherCreation.jsx:322](../../client/src/pages/Dashboard/FinanceDashboard/Billing/VoucherCreation.jsx#L322) |
| Add Voucher (button) | viewAddVoucherModal | No local disabled condition detected | () => { toast.success("Added Voucher successfully"); setViewVoucherModal(false); } — [VoucherCreation.jsx:349](../../client/src/pages/Dashboard/FinanceDashboard/Billing/VoucherCreation.jsx#L349) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 102: `params`

## pages/Dashboard/FinanceDashboard/Cashflow/HistoricalPnl.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/cashflow/historical-P&L — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/cashflow/historical-P&L — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [HistoricalPnl.jsx:292](../../client/src/pages/Dashboard/FinanceDashboard/Cashflow/HistoricalPnl.jsx#L292) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [HistoricalPnl.jsx:292](../../client/src/pages/Dashboard/FinanceDashboard/Cashflow/HistoricalPnl.jsx#L292) |

## pages/Dashboard/FinanceDashboard/Cashflow/Projections.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/cashflow/projections — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/cashflow/projections — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewModal(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewModal(params.data) — [Projections.jsx:188](../../client/src/pages/Dashboard/FinanceDashboard/Cashflow/Projections.jsx#L188) |
| Export (table-generated action) | !isBudgetDataLoading | No local disabled condition detected | handleExportMonthlyPnL — [Projections.jsx:298](../../client/src/pages/Dashboard/FinanceDashboard/Cashflow/Projections.jsx#L298) |
| Advanced filter (table-generated utility) | !isBudgetDataLoading; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Projections.jsx:298](../../client/src/pages/Dashboard/FinanceDashboard/Cashflow/Projections.jsx#L298) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 186: `params`
- **isBudgetDataLoading**, line 61: `useQuery({ queryKey: ["budgetData"], queryFn: async () => { const response = await axios.get("/api/budget/company-budget"); return Array.isArray(response.data?.allBudgets) ? response.data.allBudgets : []; }, })`

## pages/Dashboard/FinanceDashboard/Finance/Collections.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/collection-payments/collection — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/collection-payments/collection — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewModal(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewModal(params.data) — [Collections.jsx:122](../../client/src/pages/Dashboard/FinanceDashboard/Finance/Collections.jsx#L122) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFiscalYearStart((prev) => prev - 1) — [Collections.jsx:462](../../client/src/pages/Dashboard/FinanceDashboard/Finance/Collections.jsx#L462) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFiscalYearStart((prev) => prev + 1) — [Collections.jsx:471](../../client/src/pages/Dashboard/FinanceDashboard/Finance/Collections.jsx#L471) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [Collections.jsx:503](../../client/src/pages/Dashboard/FinanceDashboard/Finance/Collections.jsx#L503) |
| Export (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleExport — [Collections.jsx:504](../../client/src/pages/Dashboard/FinanceDashboard/Finance/Collections.jsx#L504) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 121: `params`

## pages/Dashboard/FinanceDashboard/Finance/CollectionsLayout.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/collection-payments/collection/paid — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/collection-payments/collection/paid — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [CollectionsLayout.jsx:37](../../client/src/pages/Dashboard/FinanceDashboard/Finance/CollectionsLayout.jsx#L37) |

## pages/Dashboard/FinanceDashboard/Finance/DeptWiseBudget.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/department-wise-budget — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/department-wise-budget — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: handleClick (clickable action) | !acc[month] | No local disabled condition detected | handleClick — [DeptWiseBudget.jsx:81](../../client/src/pages/Dashboard/FinanceDashboard/Finance/DeptWiseBudget.jsx#L81) |
| Action: handleClick (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleClick — [DeptWiseBudget.jsx:168](../../client/src/pages/Dashboard/FinanceDashboard/Finance/DeptWiseBudget.jsx#L168) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [DeptWiseBudget.jsx:740](../../client/src/pages/Dashboard/FinanceDashboard/Finance/DeptWiseBudget.jsx#L740) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DeptWiseBudget.jsx:740](../../client/src/pages/Dashboard/FinanceDashboard/Finance/DeptWiseBudget.jsx#L740) |

## pages/Dashboard/FinanceDashboard/Finance/DeptWiseBudgetDetails.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/department-wise-budget/:department — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/department-wise-budget/:department — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [DeptWiseBudgetDetails.jsx:787](../../client/src/pages/Dashboard/FinanceDashboard/Finance/DeptWiseBudgetDetails.jsx#L787) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DeptWiseBudgetDetails.jsx:787](../../client/src/pages/Dashboard/FinanceDashboard/Finance/DeptWiseBudgetDetails.jsx#L787) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [DeptWiseBudgetDetails.jsx:909](../../client/src/pages/Dashboard/FinanceDashboard/Finance/DeptWiseBudgetDetails.jsx#L909) |

## pages/Dashboard/FinanceDashboard/Finance/FilterUnits.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Next (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [FilterUnits.jsx:167](../../client/src/pages/Dashboard/FinanceDashboard/Finance/FilterUnits.jsx#L167) |

## pages/Dashboard/FinanceDashboard/Finance/FinanceBudget.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Request Budget (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | !isTop ? () => setOpenModal(true) : undefined — [FinanceBudget.jsx:346](../../client/src/pages/Dashboard/FinanceDashboard/Finance/FinanceBudget.jsx#L346) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [FinanceBudget.jsx:346](../../client/src/pages/Dashboard/FinanceDashboard/Finance/FinanceBudget.jsx#L346) |
| Submit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [FinanceBudget.jsx:508](../../client/src/pages/Dashboard/FinanceDashboard/Finance/FinanceBudget.jsx#L508) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isTop**, line 28: `auth.user.departments.some((item) => { return departmentAccess.includes(item._id.toString()); })`
- **auth**, line 21: `useAuth()`

## pages/Dashboard/FinanceDashboard/Finance/LandlordPaymentLocation.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/collection-payments/landlord-payments-unit — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/collection-payments/landlord-payments-unit — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewModal(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewModal(params.data) — [LandlordPaymentLocation.jsx:344](../../client/src/pages/Dashboard/FinanceDashboard/Finance/LandlordPaymentLocation.jsx#L344) |
| Export (table-generated utility) | NOT (payments.length === 0) AND NOT (landlordPaymentsLoading) AND NOT (landlordPaymentsError); exportData: true | No local disabled condition detected | Shared table export — [LandlordPaymentLocation.jsx:435](../../client/src/pages/Dashboard/FinanceDashboard/Finance/LandlordPaymentLocation.jsx#L435) |
| Advanced filter (table-generated utility) | NOT (payments.length === 0) AND NOT (landlordPaymentsLoading) AND NOT (landlordPaymentsError); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [LandlordPaymentLocation.jsx:435](../../client/src/pages/Dashboard/FinanceDashboard/Finance/LandlordPaymentLocation.jsx#L435) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 343: `params`

## pages/Dashboard/FinanceDashboard/Finance/LandlordPayments.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/collection-payments/landlord-payments — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/collection-payments/landlord-payments — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| <MdNavigateBefore /> (button) | NOT (landLordData.length === 0) AND NOT (isHrLoading) AND NOT (isError) | No local disabled condition detected | () => setSelectedFiscalYearStart((prev) => prev - 1) — [LandlordPayments.jsx:588](../../client/src/pages/Dashboard/FinanceDashboard/Finance/LandlordPayments.jsx#L588) |
| <MdNavigateNext /> (button) | NOT (landLordData.length === 0) AND NOT (isHrLoading) AND NOT (isError) | No local disabled condition detected | () => setSelectedFiscalYearStart((prev) => prev + 1) — [LandlordPayments.jsx:597](../../client/src/pages/Dashboard/FinanceDashboard/Finance/LandlordPayments.jsx#L597) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isHrLoading**, line 60: `useQuery({ queryKey: ["allBudgets"], queryFn: async () => { try { const response = await axios.get( '/api/budget/company-budget?departmentId=6798bab0e469e809084e249a' ); return response.data?.allBudgets \|\| []; } catch (error) { console.error("Error fetching budget:", error); return []; } }, })`

## pages/Dashboard/FinanceDashboard/Finance/StatutoryPayments.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/collection-payments/statutory-payments — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/collection-payments/statutory-payments — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewModal(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewModal(params.data) — [StatutoryPayments.jsx:384](../../client/src/pages/Dashboard/FinanceDashboard/Finance/StatutoryPayments.jsx#L384) |
| <MdNavigateBefore /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFiscalYearStart((prev) => prev - 1) — [StatutoryPayments.jsx:583](../../client/src/pages/Dashboard/FinanceDashboard/Finance/StatutoryPayments.jsx#L583) |
| <MdNavigateNext /> (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setSelectedFiscalYearStart((prev) => prev + 1) — [StatutoryPayments.jsx:593](../../client/src/pages/Dashboard/FinanceDashboard/Finance/StatutoryPayments.jsx#L593) |
| canExport ? "Export" : undefined (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleExport — [StatutoryPayments.jsx:614](../../client/src/pages/Dashboard/FinanceDashboard/Finance/StatutoryPayments.jsx#L614) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [StatutoryPayments.jsx:614](../../client/src/pages/Dashboard/FinanceDashboard/Finance/StatutoryPayments.jsx#L614) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 383: `params`

## pages/Dashboard/FinanceDashboard/FinanceData/FinanceAssetList.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewModal(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewModal(params.data) — [FinanceAssetList.jsx:122](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceAssetList.jsx#L122) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [FinanceAssetList.jsx:160](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceAssetList.jsx#L160) |
| Select Image (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [FinanceAssetList.jsx:231](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceAssetList.jsx#L231) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [FinanceAssetList.jsx:484](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceAssetList.jsx#L484) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 118: `params`

## pages/Dashboard/FinanceDashboard/FinanceData/FinanceMonthlyInvoices.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/data/finance-monthly-invoices — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/data/finance-monthly-invoices — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewModal(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewModal(params.data) — [FinanceMonthlyInvoices.jsx:154](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceMonthlyInvoices.jsx#L154) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [FinanceMonthlyInvoices.jsx:262](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceMonthlyInvoices.jsx#L262) |
| Select Image (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [FinanceMonthlyInvoices.jsx:350](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceMonthlyInvoices.jsx#L350) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [FinanceMonthlyInvoices.jsx:603](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceMonthlyInvoices.jsx#L603) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 150: `params`

## pages/Dashboard/FinanceDashboard/FinanceData/FinanceMonthlyVouchers.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/data/finance-monthly-vouchers — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/data/finance-monthly-vouchers — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate('${template.id}') (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate('${template.id}') — [FinanceMonthlyVouchers.jsx:53](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceMonthlyVouchers.jsx#L53) |

## pages/Dashboard/FinanceDashboard/FinanceData/FinanceVendorDatabase.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => handleViewModal(params.data) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleViewModal(params.data) — [FinanceVendorDatabase.jsx:118](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceVendorDatabase.jsx#L118) |
| Add Vendor (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | handleAddAsset — [FinanceVendorDatabase.jsx:319](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceVendorDatabase.jsx#L319) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [FinanceVendorDatabase.jsx:319](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceVendorDatabase.jsx#L319) |
| Select Image (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [FinanceVendorDatabase.jsx:407](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceVendorDatabase.jsx#L407) |
| modalMode === "add" ? "Submit" : "Update" (button) | modalMode === "add" | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [FinanceVendorDatabase.jsx:660](../../client/src/pages/Dashboard/FinanceDashboard/FinanceData/FinanceVendorDatabase.jsx#L660) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 114: `params`

## pages/Dashboard/FinanceDashboard/FinanceSettings/FinanceBulkUpload.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [FinanceBulkUpload.jsx:64](../../client/src/pages/Dashboard/FinanceDashboard/FinanceSettings/FinanceBulkUpload.jsx#L64) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [FinanceBulkUpload.jsx:83](../../client/src/pages/Dashboard/FinanceDashboard/FinanceSettings/FinanceBulkUpload.jsx#L83) |

## pages/Dashboard/FinanceDashboard/FinanceSettings/FinancePolicies.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [FinancePolicies.jsx:63](../../client/src/pages/Dashboard/FinanceDashboard/FinanceSettings/FinancePolicies.jsx#L63) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [FinancePolicies.jsx:81](../../client/src/pages/Dashboard/FinanceDashboard/FinanceSettings/FinancePolicies.jsx#L81) |

## pages/Dashboard/FinanceDashboard/FinanceSettings/FinanceSops.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Choose File (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | No inline handler declared; may submit a form or delegate to a component — [FinanceSops.jsx:62](../../client/src/pages/Dashboard/FinanceDashboard/FinanceSettings/FinanceSops.jsx#L62) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [FinanceSops.jsx:81](../../client/src/pages/Dashboard/FinanceDashboard/FinanceSettings/FinanceSops.jsx#L81) |

## pages/Dashboard/FinanceDashboard/IncomeDetails/IncomeDetails.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/monthly-profit-loss/income-details — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/annual-average-profit-loss/income-details — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/overall-profit-loss/income-details — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/sqft-wise-data/income-details — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/monthly-profit-loss/income-details — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/annual-average-profit-loss/income-details — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/overall-profit-loss/income-details — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/sqft-wise-data/income-details — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| 'Open ${vertical} income details' (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => handleVerticalNavigation(vertical) — [IncomeDetails.jsx:196](../../client/src/pages/Dashboard/FinanceDashboard/IncomeDetails/IncomeDetails.jsx#L196) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [IncomeDetails.jsx:279](../../client/src/pages/Dashboard/FinanceDashboard/IncomeDetails/IncomeDetails.jsx#L279) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [IncomeDetails.jsx:279](../../client/src/pages/Dashboard/FinanceDashboard/IncomeDetails/IncomeDetails.jsx#L279) |

## pages/Dashboard/FinanceDashboard/MixBag/ClientAgreementData.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/client-agreements/:name — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/client-agreements/:name — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: (event) => setAnchorEl(event.currentTarget) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | (event) => setAnchorEl(event.currentTarget) — [ClientAgreementData.jsx:23](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreementData.jsx#L23) |
| Edit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setAnchorEl(null); onEdit(); } — [ClientAgreementData.jsx:27](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreementData.jsx#L27) |
| Action: () => window.open(params.data.url, "_blank") (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => window.open(params.data.url, "_blank") — [ClientAgreementData.jsx:160](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreementData.jsx#L160) |
| Add New Agreement (table-generated action) | NOT (isLoading) | !selectedClient | openAddModal — [ClientAgreementData.jsx:198](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreementData.jsx#L198) |
| Advanced filter (table-generated utility) | NOT (isLoading); Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ClientAgreementData.jsx:198](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreementData.jsx#L198) |
| isEditMode ? "Save Changes" : "Add New Agreement" (button) | No local render guard detected; page/API access still applies | isPending \|\| !selectedClient; loading: isPending | No inline handler declared; may submit a form or delegate to a component — [ClientAgreementData.jsx:250](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreementData.jsx#L250) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 159: `params`
- **isLoading**, line 49: `useQuery({ queryKey: ["finance-client-agreements"], queryFn: async () => { const response = await axios.get("/api/finance/client-agreements"); return Array.isArray(response.data) ? response.data : []; }, })`
- **selectedClient**, line 57: `useMemo( () => clientsData.find((item) => (item?.clientName \|\| "").trim().toLowerCase() === clientName.trim().toLowerCase()), [clientsData, clientName] )`
- **isPending**, line 113: `useMutation({ mutationFn: async (formData) => { if (isEditMode) { const response = await axios.patch("/api/finance/client-agreements/agreement", formData, { headers: { "Content-Type": "multipart/form-data" }, }); return response.data; } const response = await axios.post("/api/finance/client-agreements/agreement", formData, { headers: { "Content-Type": "multipart/form-data" }, }); return response.data; }, onSuccess: () => { toast.success(isEditMode ? "Agreement updated successfully" : "Agreement uploaded successfully"); queryClient.invalidateQueries({ queryKey: ["finance-client-agreements"] }); resetModal(); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| (isEditMode ? "Failed to update agreement" : "Failed to upload agreement")); }, })`
- **isEditMode**, line 45: `useState(false)`

## pages/Dashboard/FinanceDashboard/MixBag/ClientAgreements.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/client-agreements — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/client-agreements — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { if (params.data.isDeleted) return; navigate( location.pathname.includes("mix-bag") ? '/app/dashboard/finance-dashboard/mix-bag/client-agreements/${encodeURIComponen… (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (params.data.isDeleted) return; navigate( location.pathname.includes("mix-bag") ? '/app/dashboard/finance-dashboard/mix-bag/client-agreements/${encodeURIComponent(params.data.name)}' : '/app/client-agreements/${encodeURIComponent(params.data.name)}', { state: { files: params.data.files \|\| [], name: params.data.name \|\| "Unnamed"… — [ClientAgreements.jsx:194](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreements.jsx#L194) |
| Restore client agreement entry (button) | data.isDeleted | isManagingClient | () => handleRestore(data) — [ClientAgreements.jsx:240](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreements.jsx#L240) |
| Permanently delete client agreement entry (button) | data.isDeleted | isManagingClient | () => handleDelete(data) — [ClientAgreements.jsx:250](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreements.jsx#L250) |
| Edit client (button) | NOT (data.isDeleted) | No local disabled condition detected | () => { setEditingClient(data); reset({ name: data.name }); setOpenModal(true); } — [ClientAgreements.jsx:263](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreements.jsx#L263) |
| Delete client agreement entry (button) | NOT (data.isDeleted) | isManagingClient | () => handleDelete(data) — [ClientAgreements.jsx:276](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreements.jsx#L276) |
| Add New Client (table-generated action) | !isClientsDataPending | No local disabled condition detected | () => { setEditingClient(null); reset({ name: "" }); setOpenModal(true); } — [ClientAgreements.jsx:299](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreements.jsx#L299) |
| editingClient ? "Save Changes" : "Add New Client" (button) | No local render guard detected; page/API access still applies | isCreateClientPending \|\| isUpdateClientPending; loading: isCreateClientPending \|\| isUpdateClientPending | No inline handler declared; may submit a form or delegate to a component — [ClientAgreements.jsx:343](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ClientAgreements.jsx#L343) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 193: `params`
- **data**, line 237: `{ data }`
- **isManagingClient**, line 105: `useMutation({ mutationFn: async ({ clientId, action }) => { const response = await axios.patch( "/api/finance/client-agreements/client/action", { clientId, action }, ); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Client agreement entry updated successfully"); queryClient.invalidateQueries({ queryKey: ["finance-client-agreements"] }); setConfirmationAction(null); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| "Failed to update client agreement entry", ); }, })`
- **isClientsDataPending**, line 49: `useQuery({ queryKey: ["finance-client-agreements", Boolean(isTechDepartment)], queryFn: async () => { const response = await axios.get("/api/finance/client-agreements", { params: { includeDeleted: Boolean(isTechDepartment) }, }); return Array.isArray(response.data) ? response.data : []; }, })`
- **isTechDepartment**, line 30: `auth?.user?.departments?.some( (department) => String(department?._id \|\| department) === TECH_DEPARTMENT_ID \|\| ["tech", "tech department"].includes( department?.name?.trim().toLowerCase(), ), )`
- **auth**, line 26: `useAuth()`
- **isCreateClientPending**, line 59: `useMutation({ mutationFn: async (payload) => { const response = await axios.post("/api/finance/client-agreements/client", payload); return response.data; }, onSuccess: (response) => { toast.success("Client created successfully"); queryClient.invalidateQueries({ queryKey: ["finance-client-agreements"] }); closeModal(); const client = response?.client; if (client?._id) { navigate( location.pathname.includes("mix-bag") ? '/app/dashboard/finance-dashboard/mix-bag/client-agreements/${encodeURIComponent(client.clientName)}' : '/app/client-agreements/${encodeURIComponent(client.clientName)}', { state: { files: [], name: client.clientName, id: client._id, }, } ); } }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to create client"); }, })`
- **isUpdateClientPending**, line 90: `useMutation({ mutationFn: async (payload) => { const response = await axios.patch("/api/finance/client-agreements/client", payload); return response.data; }, onSuccess: () => { toast.success("Client updated successfully"); queryClient.invalidateQueries({ queryKey: ["finance-client-agreements"] }); closeModal(); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to update client"); }, })`

## pages/Dashboard/FinanceDashboard/MixBag/ComplianceData.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/compliance-documents — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/mix-bag/compliance-documents/:name — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/compliance-documents — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/compliance-documents/:name — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Restore compliance document (button) | data.isDeleted | isManaging | () => handleRestore(data) — [ComplianceData.jsx:269](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ComplianceData.jsx#L269) |
| Permanently delete compliance document (button) | data.isDeleted | isManaging | () => handleDelete(data) — [ComplianceData.jsx:279](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ComplianceData.jsx#L279) |
| Edit compliance document (button) | NOT (data.isDeleted) | No local disabled condition detected | () => openEditModal(data) — [ComplianceData.jsx:292](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ComplianceData.jsx#L292) |
| Delete compliance document (button) | NOT (data.isDeleted) | isManaging | () => handleDelete(data) — [ComplianceData.jsx:301](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ComplianceData.jsx#L301) |
| Add Document (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | openAddModal — [ComplianceData.jsx:323](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ComplianceData.jsx#L323) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [ComplianceData.jsx:323](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ComplianceData.jsx#L323) |
| selectedDocument ? "Save Changes" : "Submit" (button) | No local render guard detected; page/API access still applies | isUploading \|\| isUpdating; loading: isUploading \|\| isUpdating | No inline handler declared; may submit a form or delegate to a component — [ComplianceData.jsx:374](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ComplianceData.jsx#L374) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **data**, line 266: `{ data }`
- **isManaging**, line 121: `useMutation({ mutationFn: async ({ documentId, action }) => { const res = await axios.patch("/api/company/manage-compliance-document", { documentId, action, }); return res.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Compliance document updated successfully"); queryClient.invalidateQueries({ queryKey: ["complianceDocuments"] }); setConfirmationAction(null); }, onError: (error) => { toast.error( error?.response?.data?.message \|\| "Failed to update compliance document", ); }, })`
- **isUploading**, line 78: `useMutation({ mutationFn: async (formData) => { const res = await axios.post( "/api/company/add-compliance-document", formData, { headers: { "Content-Type": "multipart/form-data", }, } ); return res.data; }, onSuccess: () => { toast.success("Document uploaded successfully"); queryClient.invalidateQueries({ queryKey: ["complianceDocuments"] }); setOpenModal(false); reset(); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Upload failed. Try again."); }, })`
- **isUpdating**, line 102: `useMutation({ mutationFn: async (formData) => { const res = await axios.patch( "/api/company/update-compliance-document", formData, { headers: { "Content-Type": "multipart/form-data" } }, ); return res.data; }, onSuccess: () => { toast.success("Document updated successfully"); queryClient.invalidateQueries({ queryKey: ["complianceDocuments"] }); closeModal(); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Document update failed"); }, })`

## pages/Dashboard/FinanceDashboard/MixBag/ComplianceDocuments.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate('/app/company-KYC/${params.data.id}', { state: { name: params.data.name, files: params.data.files, }, }) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate('/app/company-KYC/${params.data.id}', { state: { name: params.data.name, files: params.data.files, }, }) — [ComplianceDocuments.jsx:40](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/ComplianceDocuments.jsx#L40) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 39: `params`

## pages/Dashboard/FinanceDashboard/MixBag/DirectorData.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/directors-company-KYC/:name — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/directors-company-KYC/:name — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/directors-company-KYC/:name — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/directors-company-KYC/:name — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: (event) => setAnchorEl(event.currentTarget) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | (event) => setAnchorEl(event.currentTarget) — [DirectorData.jsx:22](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/DirectorData.jsx#L22) |
| Edit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setAnchorEl(null); onEdit(); } — [DirectorData.jsx:26](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/DirectorData.jsx#L26) |
| Add Document (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | openAddModal — [DirectorData.jsx:211](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/DirectorData.jsx#L211) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [DirectorData.jsx:211](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/DirectorData.jsx#L211) |
| isEditMode ? "Save Changes" : "Submit" (button) | No local render guard detected; page/API access still applies | isSaving; loading: isSaving | No inline handler declared; may submit a form or delegate to a component — [DirectorData.jsx:290](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/DirectorData.jsx#L290) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isSaving**, line 121: `useMutation({ mutationFn: async (formData) => { if (isEditMode) { const res = await axios.patch("/api/company/update-kyc-document", formData, { headers: { "Content-Type": "multipart/form-data" }, }); return res.data; } const res = await axios.post("/api/company/add-kyc-document", formData, { headers: { "Content-Type": "multipart/form-data" }, }); return res.data; }, onSuccess: () => { toast.success(isEditMode ? "Document updated successfully" : "Document uploaded successfully"); queryClient.invalidateQueries({ queryKey: ["directorsCompany"] }); resetModal(); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| (isEditMode ? "Update failed. Try again." : "Upload failed. Try again.")); }, })`
- **isEditMode**, line 45: `useState(false)`

## pages/Dashboard/FinanceDashboard/MixBag/DirectorsCompany.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/directors-company-KYC — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/directors-company-KYC — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/directors-company-KYC — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/directors-company-KYC — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { if (params.data.isDeleted) return; navigate( location.pathname.includes("mix-bag") ? '/app/dashboard/finance-dashboard/mix-bag/directors-company-KYC/${encodeURIComp… (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (params.data.isDeleted) return; navigate( location.pathname.includes("mix-bag") ? '/app/dashboard/finance-dashboard/mix-bag/directors-company-KYC/${encodeURIComponent(params.data.routeName)}' : '/app/company-KYC/${encodeURIComponent(params.data.routeName)}', { state: { files: params.data.files, name: params.data.routeName, }, }… — [DirectorsCompany.jsx:231](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/DirectorsCompany.jsx#L231) |
| Restore KYC entry (button) | data.isDeleted | isManagingEntry | () => handleRestore(data) — [DirectorsCompany.jsx:275](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/DirectorsCompany.jsx#L275) |
| Permanently delete KYC entry (button) | data.isDeleted | isManagingEntry | () => handleDelete(data) — [DirectorsCompany.jsx:285](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/DirectorsCompany.jsx#L285) |
| Edit KYC entry (button) | NOT (data.isDeleted) | No local disabled condition detected | () => openEditModal(data) — [DirectorsCompany.jsx:298](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/DirectorsCompany.jsx#L298) |
| Delete KYC entry (button) | NOT (data.isDeleted) | isManagingEntry | () => handleDelete(data) — [DirectorsCompany.jsx:307](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/DirectorsCompany.jsx#L307) |
| Add New Director KYC (table-generated action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => openCreateModal("directorKyc") — [DirectorsCompany.jsx:347](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/DirectorsCompany.jsx#L347) |
| editTarget ? "Save Changes" : "Create" (button) | No local render guard detected; page/API access still applies | isCreating \|\| isUpdating; loading: isCreating \|\| isUpdating | No inline handler declared; may submit a form or delegate to a component — [DirectorsCompany.jsx:387](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/DirectorsCompany.jsx#L387) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 230: `params`
- **data**, line 272: `{ data }`
- **isManagingEntry**, line 124: `useMutation({ mutationFn: async ({ row, action }) => { const response = await axios.patch("/api/company/manage-kyc-entry", { type: row.type, entryId: row.type === "directorKyc" ? row.id : undefined, action, }); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "KYC entry updated successfully"); queryClient.invalidateQueries({ queryKey: ["directorsCompany"] }); setConfirmationAction(null); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to update KYC entry"); }, })`
- **isCreating**, line 77: `useMutation({ mutationFn: async (payload) => { const response = await axios.post("/api/company/create-kyc-entry", payload); return response.data; }, onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: ["directorsCompany"] }); closeModal(); toast.success( variables.type === "directorKyc" ? "Director KYC created successfully" : "Company KYC ready to add documents" ); const targetName = variables.type === "directorKyc" ? variables.nameOfDirector : "Company"; navigate( location.pathname.includes("mix-bag") ? '/app/dashboard/finance-dashboard/mix-bag/directors-company-KYC/${encodeURIComponent(targetName)}' : '/app/company-KYC/${encodeURIComponent(targetName)}', { state: { files: [], name: targetName, }, } ); }, onError: (error) => { toast.error(error?.response?.data?.messag…`
- **isUpdating**, line 109: `useMutation({ mutationFn: async (payload) => { const response = await axios.patch("/api/company/update-kyc-entry-name", payload); return response.data; }, onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: ["directorsCompany"] }); closeModal(); toast.success(variables.type === "companyKyc" ? "Company name updated successfully" : "Director name updated successfully"); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to update name"); }, })`

## pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreementData.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/landlord-agreements/:name — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/landlord-agreements/:name — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: (event) => setAnchorEl(event.currentTarget) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | (event) => setAnchorEl(event.currentTarget) — [LandlordAgreementData.jsx:23](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreementData.jsx#L23) |
| Edit (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setAnchorEl(null); onEdit(); } — [LandlordAgreementData.jsx:27](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreementData.jsx#L27) |
| Action: () => window.open(params.data.url, "_blank") (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => window.open(params.data.url, "_blank") — [LandlordAgreementData.jsx:168](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreementData.jsx#L168) |
| Add Agreement (table-generated action) | No local render guard detected; page/API access still applies | !selectedLandlord | openAddModal — [LandlordAgreementData.jsx:199](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreementData.jsx#L199) |
| Advanced filter (table-generated utility) | No local render guard detected; page/API access still applies; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [LandlordAgreementData.jsx:199](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreementData.jsx#L199) |
| isEditMode ? "Save Changes" : "Add Agreement" (button) | No local render guard detected; page/API access still applies | isPending \|\| !selectedLandlord; loading: isPending | No inline handler declared; may submit a form or delegate to a component — [LandlordAgreementData.jsx:254](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreementData.jsx#L254) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 167: `params`
- **selectedLandlord**, line 58: `useMemo(() => { if (routeId) { const byId = landlordData.find((item) => item._id === routeId); if (byId) return byId; } return landlordData.find( (item) => (item?.name \|\| "").trim().toLowerCase() === name.trim().toLowerCase() ); }, [landlordData, name, routeId])`
- **isPending**, line 119: `useMutation({ mutationFn: async (formData) => { if (isEditMode) { const response = await axios.patch("/api/finance/landlord-agreements/document", formData, { headers: { "Content-Type": "multipart/form-data" }, }); return response.data; } const response = await axios.post("/api/finance/add-landlord-agreement", formData, { headers: { "Content-Type": "multipart/form-data" }, }); return response.data; }, onSuccess: () => { toast.success(isEditMode ? "Agreement updated successfully" : "Agreement uploaded successfully"); queryClient.invalidateQueries({ queryKey: ["landlord-agreements"] }); resetModal(); }, onError: (err) => { console.error(isEditMode ? "Update failed:" : "Upload failed:", err); toast.error(err?.response?.data?.message \|\| (isEditMode ? "Failed to update agreement" : "Failed to up…`
- **isEditMode**, line 47: `useState(false)`

## pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreements.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/mix-bag/landlord-agreements — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/mix-bag/landlord-agreements — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => { if (params.data.isDeleted) return; navigate( location.pathname.includes("mix-bag") ? '/app/dashboard/finance-dashboard/mix-bag/landlord-agreements/${encodeURICompon… (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { if (params.data.isDeleted) return; navigate( location.pathname.includes("mix-bag") ? '/app/dashboard/finance-dashboard/mix-bag/landlord-agreements/${encodeURIComponent(params.data.name)}' : '/app/landlord-agreements/${encodeURIComponent(params.data.name)}', { state: { files: params.data.files \|\| [], name: params.data.name \|\| "Unna… — [LandlordAgreements.jsx:167](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreements.jsx#L167) |
| Restore landlord (button) | data.isDeleted | isManaging | () => handleRestore(data) — [LandlordAgreements.jsx:213](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreements.jsx#L213) |
| Permanently delete landlord (button) | data.isDeleted | isManaging | () => handleDelete(data) — [LandlordAgreements.jsx:223](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreements.jsx#L223) |
| Edit landlord (button) | NOT (data.isDeleted) | No local disabled condition detected | () => { setEditingLandlord(data); reset({ name: data.name }); setOpenModal(true); } — [LandlordAgreements.jsx:236](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreements.jsx#L236) |
| Delete landlord (button) | NOT (data.isDeleted) | isManaging | () => handleDelete(data) — [LandlordAgreements.jsx:249](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreements.jsx#L249) |
| Add New Landlord (table-generated action) | !isLoading | No local disabled condition detected | () => { setEditingLandlord(null); reset({ name: "" }); setOpenModal(true); } — [LandlordAgreements.jsx:320](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreements.jsx#L320) |
| editingLandlord ? "Save Changes" : "Create" (button) | No local render guard detected; page/API access still applies | isCreating \|\| isUpdating; loading: isCreating \|\| isUpdating | No inline handler declared; may submit a form or delegate to a component — [LandlordAgreements.jsx:360](../../client/src/pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreements.jsx#L360) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **params**, line 166: `params`
- **data**, line 210: `{ data }`
- **isManaging**, line 113: `useMutation({ mutationFn: async ({ landlordId, action }) => { const response = await axios.patch("/api/finance/landlord/action", { landlordId, action, }); return response.data; }, onSuccess: (data) => { toast.success(data.message \|\| "Landlord updated successfully"); queryClient.invalidateQueries({ queryKey: ["landlord-agreements"] }); setConfirmationAction(null); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to update landlord"); }, })`
- **isLoading**, line 51: `useQuery({ queryKey: ["landlord-agreements", Boolean(isTechDepartment)], queryFn: async () => { try { const response = await axios.get( "/api/finance/get-landlord-agreements", { params: { includeDeleted: Boolean(isTechDepartment) } }, ); return response.data \|\| []; } catch (error) { console.error("Failed to fetch landlord agreements:", error); return []; } }, })`
- **isTechDepartment**, line 30: `auth?.user?.departments?.some( (department) => String(department?._id \|\| department) === TECH_DEPARTMENT_ID \|\| ["tech", "tech department"].includes( department?.name?.trim().toLowerCase(), ), )`
- **auth**, line 26: `useAuth()`
- **isCreating**, line 67: `useMutation({ mutationFn: async (payload) => { const response = await axios.post("/api/finance/create-landlord", payload); return response.data; }, onSuccess: (response) => { queryClient.invalidateQueries({ queryKey: ["landlord-agreements"] }); closeModal(); toast.success("Landlord created successfully"); const landlord = response?.landlord; if (landlord?._id) { navigate( location.pathname.includes("mix-bag") ? '/app/dashboard/finance-dashboard/mix-bag/landlord-agreements/${encodeURIComponent(landlord.name)}' : '/app/landlord-agreements/${encodeURIComponent(landlord.name)}', { state: { files: [], name: landlord.name, id: landlord._id, }, } ); } }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to create landlord"); }, })`
- **isUpdating**, line 98: `useMutation({ mutationFn: async (payload) => { const response = await axios.patch("/api/finance/landlord", payload); return response.data; }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["landlord-agreements"] }); closeModal(); toast.success("Landlord updated successfully"); }, onError: (error) => { toast.error(error?.response?.data?.message \|\| "Failed to update landlord"); }, })`

## pages/Dashboard/FinanceDashboard/MonthyProfitLoss/MonthlyProfitLoss.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/monthly-profit-loss — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/monthly-profit-loss — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate('${routeBase}/monthly-profit-loss/income-details') (clickable action) | NOT (isInvestorDashboard) | No local disabled condition detected | () => navigate('${routeBase}/monthly-profit-loss/income-details') — [MonthlyProfitLoss.jsx:385](../../client/src/pages/Dashboard/FinanceDashboard/MonthyProfitLoss/MonthlyProfitLoss.jsx#L385) |
| Action: () => navigate(departmentBudgetRoute) (clickable action) | NOT (isInvestorDashboard) | No local disabled condition detected | () => navigate(departmentBudgetRoute) — [MonthlyProfitLoss.jsx:405](../../client/src/pages/Dashboard/FinanceDashboard/MonthyProfitLoss/MonthlyProfitLoss.jsx#L405) |
| Export (table-generated utility) | monthlyProfitLossData.length > 0; exportData: !isInvestorDashboard | No local disabled condition detected | Shared table export — [MonthlyProfitLoss.jsx:640](../../client/src/pages/Dashboard/FinanceDashboard/MonthyProfitLoss/MonthlyProfitLoss.jsx#L640) |
| Advanced filter (table-generated utility) | monthlyProfitLossData.length > 0; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [MonthlyProfitLoss.jsx:640](../../client/src/pages/Dashboard/FinanceDashboard/MonthyProfitLoss/MonthlyProfitLoss.jsx#L640) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isInvestorDashboard**, line 57: `routeBase.includes("/investor-dashboard")`

## pages/Dashboard/FinanceDashboard/OverallProfitLoss/OverallProfitLoss.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/overall-profit-loss — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/overall-profit-loss — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate( "/app/dashboard/finance-dashboard/overall-profit-loss/income-details" ) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( "/app/dashboard/finance-dashboard/overall-profit-loss/income-details" ) — [OverallProfitLoss.jsx:325](../../client/src/pages/Dashboard/FinanceDashboard/OverallProfitLoss/OverallProfitLoss.jsx#L325) |
| Action: () => navigate( "/app/dashboard/finance-dashboard/mix-bag/department-wise-budget" ) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( "/app/dashboard/finance-dashboard/mix-bag/department-wise-budget" ) — [OverallProfitLoss.jsx:343](../../client/src/pages/Dashboard/FinanceDashboard/OverallProfitLoss/OverallProfitLoss.jsx#L343) |
| Export (table-generated utility) | monthlyProfitLossData.length > 0; exportData: true | No local disabled condition detected | Shared table export — [OverallProfitLoss.jsx:543](../../client/src/pages/Dashboard/FinanceDashboard/OverallProfitLoss/OverallProfitLoss.jsx#L543) |
| Advanced filter (table-generated utility) | monthlyProfitLossData.length > 0; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [OverallProfitLoss.jsx:543](../../client/src/pages/Dashboard/FinanceDashboard/OverallProfitLoss/OverallProfitLoss.jsx#L543) |

## pages/Dashboard/FinanceDashboard/SqftWiseData/SqWiseData.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/sqft-wise-data — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard/sqft-wise-data — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Action: () => navigate( "/app/dashboard/finance-dashboard/sqft-wise-data/income-details", ) (clickable action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate( "/app/dashboard/finance-dashboard/sqft-wise-data/income-details", ) — [SqWiseData.jsx:354](../../client/src/pages/Dashboard/FinanceDashboard/SqftWiseData/SqWiseData.jsx#L354) |
| Export (table-generated utility) | monthlyProfitLossData.length > 0; exportData: true | No local disabled condition detected | Shared table export — [SqWiseData.jsx:551](../../client/src/pages/Dashboard/FinanceDashboard/SqftWiseData/SqWiseData.jsx#L551) |
| Advanced filter (table-generated utility) | monthlyProfitLossData.length > 0; Requires visible table controls and filterable columns at runtime | No local disabled condition detected | Shared table filter drawer — [SqWiseData.jsx:551](../../client/src/pages/Dashboard/FinanceDashboard/SqftWiseData/SqWiseData.jsx#L551) |

## pages/Dashboard/FinanceDashboard/Templates/VoucherForm.jsx

Referenced by the application route/main import graph.

No direct route-object binding detected; access may be inherited from its parent page/component.

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Preview Voucher (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenPreview(true) — [VoucherForm.jsx:74](../../client/src/pages/Dashboard/FinanceDashboard/Templates/VoucherForm.jsx#L74) |
| Add (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { const { newParticular, newAmount } = watch(); if (newParticular && newAmount) { append({ particular: newParticular, amount: parseFloat(newAmount), }); setValue("newParticular", ""); setValue("newAmount", ""); } } — [VoucherForm.jsx:172](../../client/src/pages/Dashboard/FinanceDashboard/Templates/VoucherForm.jsx#L172) |
| Icon/action: () => setOpenPreview(false) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => setOpenPreview(false) — [VoucherForm.jsx:281](../../client/src/pages/Dashboard/FinanceDashboard/Templates/VoucherForm.jsx#L281) |
| Export to PDF (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | exportToPDF — [VoucherForm.jsx:516](../../client/src/pages/Dashboard/FinanceDashboard/Templates/VoucherForm.jsx#L516) |

## pages/Dashboard/FinanceDashboard/financeDashboard1.jsx

Referenced by the application route/main import graph.

Declared route paths:

- /app/dashboard/finance-dashboard1/finance-3-years-snapshot — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/biznest-3-years-snapshot — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/monthly-income-breakdown — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/inventory-vs-occupancy — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/active-unique-clients — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1/real-estate-owned — no permission wrapper detected on this route-object chain
- /app/dashboard/finance-dashboard1 — no permission wrapper detected on this route-object chain

| Button/action | Rendered when | Disabled when | Handler / source |
|---|---|---|---|
| Icon/action: () => toggleLegend(label) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => toggleLegend(label) — [financeDashboard1.jsx:1248](../../client/src/pages/Dashboard/FinanceDashboard/financeDashboard1.jsx#L1248) |
| Icon/action: () => navigate("/app/dashboard/finance-dashboard1/finance-3-years-snapshot") (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => navigate("/app/dashboard/finance-dashboard1/finance-3-years-snapshot") — [financeDashboard1.jsx:1283](../../client/src/pages/Dashboard/FinanceDashboard/financeDashboard1.jsx#L1283) |
| Icon/action: () => toggleFinanceLegend(label) (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => toggleFinanceLegend(label) — [financeDashboard1.jsx:2085](../../client/src/pages/Dashboard/FinanceDashboard/financeDashboard1.jsx#L2085) |
| View payment (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => viewPayout(row) — [financeDashboard1.jsx:2723](../../client/src/pages/Dashboard/FinanceDashboard/financeDashboard1.jsx#L2723) |
| Approve (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => updatePayoutApproval({ row, action: "approve" }) — [financeDashboard1.jsx:2724](../../client/src/pages/Dashboard/FinanceDashboard/financeDashboard1.jsx#L2724) |
| Reject (configured menu/action) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setPayoutRejectReason(""); setPayoutRejectRow(row); } — [financeDashboard1.jsx:2724](../../client/src/pages/Dashboard/FinanceDashboard/financeDashboard1.jsx#L2724) |
| Export (table-generated utility) | No local render guard detected; page/API access still applies; exportData: true | No local disabled condition detected | Shared table export — [financeDashboard1.jsx:3283](../../client/src/pages/Dashboard/FinanceDashboard/financeDashboard1.jsx#L3283) |
| Icon/action: button (button) | No local render guard detected; page/API access still applies | isPayoutApprovalPending \|\| !payoutRejectReason.trim() | No inline handler declared; may submit a form or delegate to a component — [financeDashboard1.jsx:3342](../../client/src/pages/Dashboard/FinanceDashboard/financeDashboard1.jsx#L3342) |
| Icon/action: () => { setSettingsAnchor(null); navigate(card.route); } (button) | No local render guard detected; page/API access still applies | No local disabled condition detected | () => { setSettingsAnchor(null); navigate(card.route); } — [financeDashboard1.jsx:3410](../../client/src/pages/Dashboard/FinanceDashboard/financeDashboard1.jsx#L3410) |
| Settings (button) | settingsCards.length > 0 | No local disabled condition detected | (event) => setSettingsAnchor(event.currentTarget) — [financeDashboard1.jsx:3425](../../client/src/pages/Dashboard/FinanceDashboard/financeDashboard1.jsx#L3425) |

Access/condition definitions referenced by these controls (expressions may be abbreviated):

- **isPayoutApprovalPending**, line 2679: `useMutation({ mutationFn: async ({ row, action, reason }) => { if (!row.canApproveBudget \|\| row.status !== "Pending") throw new Error("This budget is not eligible for approval actions"); return action === "approve" ? axios.patch("/api/budget/approve-budget", { budgetId: row._id }) : axios.patch('/api/budget/reject-budget/${row._id}', { reason }); }, onSuccess: async (_response, { row, action }) => { const status = action === "approve" ? "Approved" : "Rejected"; payoutQueryClient.setQueryData(["budgetData", "finance-dashboard1"], (rows) => Array.isArray(rows) ? rows.map((item) => item._id === row._id ? { ...item, status } : item) : rows); payoutQueryClient.setQueryData(["pendingApprovalsBudget"], (rows) => Array.isArray(rows) ? rows.filter((item) => item._id !== row._id) : rows); setPayoutD…`
