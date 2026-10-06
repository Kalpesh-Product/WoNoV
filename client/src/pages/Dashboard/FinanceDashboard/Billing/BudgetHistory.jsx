import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Chip } from "@mui/material";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import MuiModal from "../../../../components/MuiModal";
import PageFrame from "../../../../components/Pages/PageFrame";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import useAuth from "../../../../hooks/useAuth";
import { inrFormat } from "../../../../utils/currencyFormat";
import humanDate from "../../../../utils/humanDateForamt";
import { queryClient } from "../../../../main";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const isTechDepartmentUser = (user) =>
  (Array.isArray(user?.departments) ? user.departments : []).some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      String(department?.name || "").trim().toLowerCase() ===
        "tech department",
  );

const BudgetHistory = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [viewDetails, setViewDetails] = useState(null);
  const canUseBulkBudgetActions = isTechDepartmentUser(auth?.user);
  const pendingApprovalsPath =
    "/app/dashboard/finance-dashboard/billing/budget-request/pending-approvals-budget";

  const { data: budgetHistory = [], isPending: isBudgetLoading } = useQuery({
    queryKey: ["budgetHistory"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/budget/company-budget");
        const budgets = response.data.allBudgets;
        return Array.isArray(budgets) ? budgets : [];
      } catch (error) {
        console.error("Error fetching budget history:", error);
        return [];
      }
    },
  });

  const { mutate: unapproveBudget, isPending: isUnapprovePending } =
    useMutation({
      mutationKey: ["unapproveBudget"],
      mutationFn: async (budgetId) => {
        const response = await axios.patch(
          `/api/budget/unapprove-budget/${budgetId}`,
        );
        return response.data;
      },
      onSuccess: (data) => {
        toast.success(data.message || "Budget returned to pending approvals");
        queryClient.invalidateQueries({ queryKey: ["budgetHistory"] });
        queryClient.invalidateQueries({ queryKey: ["pendingApprovalsBudget"] });
        queryClient.invalidateQueries({ queryKey: ["allBudgets"] });
        navigate(pendingApprovalsPath);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to unapprove budget",
        );
      },
    });

  const {
    mutate: unapproveSelectedBudgets,
    isPending: isBulkUnapprovePending,
  } = useMutation({
    mutationKey: ["bulkUnapproveBudget"],
    mutationFn: async (selectedRows) => {
      const budgetIds = selectedRows.map((row) => row._id).filter(Boolean);

      if (!budgetIds.length) {
        throw new Error("Please select at least one approved budget");
      }

      const responses = await Promise.all(
        budgetIds.map((budgetId) =>
          axios.patch(`/api/budget/unapprove-budget/${budgetId}`),
        ),
      );

      return responses.map((response) => response.data);
    },
    onSuccess: (_, selectedRows) => {
      toast.success(`${selectedRows.length} budget(s) returned to pending`);
      queryClient.invalidateQueries({ queryKey: ["budgetHistory"] });
      queryClient.invalidateQueries({ queryKey: ["pendingApprovalsBudget"] });
      queryClient.invalidateQueries({ queryKey: ["allBudgets"] });
      navigate(pendingApprovalsPath);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to unapprove selected budgets",
      );
    },
  });

  const columns = [
    {
      field: "srNo",
      headerName: "Sr No",
      flex: 0.8,
      sortable: false,
      valueGetter: (params) =>
        params.node?.rowIndex == null ? "" : params.node.rowIndex + 1,
    },
    { field: "expanseName", headerName: "Expense Name", flex: 1.5 },
    { field: "expanseType", headerName: "Expense Type", flex: 1.2 },
     { field: "paymentType", headerName: "Payment Type", flex: 1.2 },
    { field: "projectedAmount", headerName: "Projected Amount (INR)", flex: 1.2 },
    { field: "actualAmount", headerName: "Actual Amount (INR)", flex: 1.2 },
    { field: "dueDate", headerName: "Due Date", flex: 1.1 },
    {
      field: "status",
      headerName: "Approval Status",
      flex: 1,
       pinned: "right",
      cellRenderer: (params) => {
        const status = String(params?.value || "-");
        const normalizedStatus = status.toLowerCase();

        const styleMap = {
          approved: { backgroundColor: "#DCFCE7", color: "#166534" },
          rejected: { backgroundColor: "#FEE2E2", color: "#991B1B" },
        };

        const chipStyle = styleMap[normalizedStatus] || {
          backgroundColor: "#F5F5F5",
          color: "#616161",
        };

        return (
          <Chip
            label={status}
            size="small"
            sx={{
              ...chipStyle,
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      width: canUseBulkBudgetActions ? 110 : 90,
      cellRenderer: (params) => {
        const isApproved =
          String(params.data?.status || "").toLowerCase() === "approved";

        return (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              className="text-subtitle text-primary cursor-pointer"
              title="View budget details"
              aria-label="View budget details"
              onClick={() => setViewDetails(params.data)}
            >
              <MdOutlineRemoveRedEye />
            </button>

            {canUseBulkBudgetActions && isApproved && (
              <ThreeDotMenu
                rowId={params.data?._id}
                menuItems={[
                  {
                    label: isUnapprovePending ? "Returning..." : "Unapprove",
                    onClick: () => {
                      if (isUnapprovePending) return;
                      unapproveBudget(params.data._id);
                    },
                  },
                ]}
              />
            )}
          </div>
        );
      },
    },
  ];

  const tableData = budgetHistory
    .filter((item) => {
      const hasBudgetShape =
        item?.expanseName || item?.expanseType || item?.projectedAmount;
      const hasVoucherData =
        item?.finance?.voucher?.name ||
        item?.finance?.voucher?.link ||
        item?.voucher?.name ||
        item?.voucher?.link;

      const normalizedStatus = String(item?.status || "").toLowerCase();
      const isApprovedOrRejected =
        normalizedStatus === "approved" || normalizedStatus === "rejected";
      const isExtraBudget = item?.isExtraBudget === true;
      const isBulkBudget = item?.isExtraBudget === false;

      return (
        hasBudgetShape && !hasVoucherData && isApprovedOrRejected &&
        (isExtraBudget || isBulkBudget)
      );
    })
    .map((item) => {
      const invoice = item?.invoice || {};
      const unit = item?.unit || {};

      return {
        ...item,
        department: item?.department?.name || item?.department || "-",
        unitName: unit?.unitName || "-",
        unitNo: unit?.unitNo || "-",
        buildingName: unit?.building?.buildingName || "-",
        projectedAmountRaw: item?.projectedAmount || 0,
        actualAmountRaw: item?.actualAmount || 0,
        projectedAmount: inrFormat(item?.projectedAmount || 0),
        actualAmount: inrFormat(item?.actualAmount || 0),
        dueDate: item?.dueDate ? humanDate(item.dueDate) : "-",
        dueDateRaw: item?.dueDate ? dayjs(item.dueDate).toISOString() : null,
        invoiceName: invoice?.name || "-",
        invoiceDate: invoice?.date ? humanDate(invoice.date) : "-",
        invoiceLink: invoice?.link || "-",
        status: item?.status || "-",
        isPaid: item?.status === "Approved" ? "Paid" : "Unpaid",
      };
    });

  const invoiceFiles = viewDetails
    ? (viewDetails?.invoices?.length
        ? viewDetails.invoices
        : viewDetails?.invoice?.link
          ? [viewDetails.invoice]
          : []
      ).filter((file) => file?.link)
    : [];

  const invoiceChips = invoiceFiles.length ? (
    <span className="flex max-w-full flex-wrap gap-2">
      {invoiceFiles.map((file, index) => {
        const name = file.name || `Invoice ${index + 1}`;

        return (
          <Chip
            key={file.id || `${file.link}-${index}`}
            component="a"
            href={file.link}
            target="_blank"
            rel="noopener noreferrer"
            clickable
            label={name}
            title={name}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ maxWidth: "100%" }}
          />
        );
      })}
    </span>
  ) : (
    "-"
  );

  return (
    <PageFrame>
      <YearWiseTable
        data={tableData}
        columns={columns}
        dateColumn="dueDateRaw"
        search
        tableTitle="Budget History"
        tableHeight={450}
        isLoading={isBudgetLoading}
        exportData
        checkbox={canUseBulkBudgetActions}
        checkAll={canUseBulkBudgetActions}
        isRowSelectable={(node) =>
          canUseBulkBudgetActions &&
          String(node.data?.status || "").toLowerCase() === "approved"
        }
        batchButton={
          canUseBulkBudgetActions
            ? isBulkUnapprovePending
              ? "Returning..."
              : "Unapprove All"
            : undefined
        }
        handleBatchAction={(selectedRows) => {
          if (!canUseBulkBudgetActions || isBulkUnapprovePending) return;
          unapproveSelectedBudgets(selectedRows);
        }}
      />

      {viewDetails && (
        <MuiModal
          open={Boolean(viewDetails)}
          onClose={() => setViewDetails(null)}
          title={
            <span className="text-subtitle font-pmedium text-primary my-4 uppercase">
              Department-Invoice Approval Budget Summary
            </span>
          }
        >
          <div className="space-y-3">
            <DetalisFormatted
              title="Department"
              detail={viewDetails.department || "-"}
            />
            <DetalisFormatted
              title="Expense Name"
              detail={viewDetails.expanseName || "-"}
            />
            <DetalisFormatted
              title="Expense Type"
              detail={viewDetails.expanseType || "-"}
            />
            <DetalisFormatted
              title="Payment Type"
              detail={viewDetails.paymentType || "-"}
            />
            <DetalisFormatted
              title="Projected Amount"
              detail={`INR ${Number(viewDetails.projectedAmountRaw || 0).toLocaleString("en-IN")}`}
            />
            <DetalisFormatted
              title="Actual Amount"
              detail={`INR ${Number(viewDetails.actualAmountRaw || 0).toLocaleString("en-IN")}`}
            />
            <DetalisFormatted title="Unit" detail={viewDetails.unitName || "-"} />
            <DetalisFormatted title="Unit No" detail={viewDetails.unitNo || "-"} />
            <DetalisFormatted
              title="Building"
              detail={viewDetails.buildingName || "-"}
            />
            <DetalisFormatted title="Due Date" detail={viewDetails.dueDate || "-"} />
            <DetalisFormatted
              title="Invoice Name"
              detail={`${invoiceFiles.length} ${invoiceFiles.length === 1 ? "file" : "files"} uploaded`}
            />
            <DetalisFormatted
              title="Invoice Date"
              detail={viewDetails.invoiceDate || "-"}
            />
            <DetalisFormatted
              title="Approval Status"
              detail={viewDetails.status || "-"}
            />
            <DetalisFormatted
              title="Paid Status"
              detail={viewDetails.isPaid || "Unpaid"}
            />
            <DetalisFormatted title="Invoice File" detail={invoiceChips} />
          </div>
        </MuiModal>
      )}
    </PageFrame>
  );
};

export default BudgetHistory;



// import { useQuery } from "@tanstack/react-query";
// import dayjs from "dayjs";
// import PageFrame from "../../../../components/Pages/PageFrame";
// import YearWiseTable from "../../../../components/Tables/YearWiseTable";
// import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
// import { inrFormat } from "../../../../utils/currencyFormat";
// import humanDate from "../../../../utils/humanDateForamt";

// const BudgetHistory = () => {
//   const axios = useAxiosPrivate();

//   const { data: budgetHistory = [], isPending: isBudgetLoading } = useQuery({
//     queryKey: ["budgetHistory"],
//     queryFn: async () => {
//       try {
//         const response = await axios.get("/api/budget/company-budget");
//         const budgets = response.data.allBudgets;
//         return Array.isArray(budgets) ? budgets : [];
//       } catch (error) {
//         console.error("Error fetching budget history:", error);
//         return [];
//       }
//     },
//   });

//   const columns = [
//     { field: "srNo", headerName: "Sr No", flex: 0.8 },
//     { field: "expanseName", headerName: "Expense Name", flex: 1.5 },
//     { field: "expanseType", headerName: "Expense Type", flex: 1.2 },
//     { field: "projectedAmount", headerName: "Amount (INR)", flex: 1.2 },
//     { field: "actualAmount", headerName: "Actual Amount (INR)", flex: 1.2 },
//     { field: "dueDate", headerName: "Due Date", flex: 1.1 },
//     { field: "status", headerName: "Status", flex: 1 },
//   ];

//   const tableData = budgetHistory
//     .filter((item) => {
//       const hasBudgetShape =
//         item?.expanseName || item?.expanseType || item?.projectedAmount;
//       const hasVoucherData =
//         item?.finance?.voucher?.name ||
//         item?.finance?.voucher?.link ||
//         item?.voucher?.name ||
//         item?.voucher?.link;

//       const normalizedStatus = String(item?.status || "").toLowerCase();
//       const isApprovedOrRejected =
//         normalizedStatus === "approved" || normalizedStatus === "rejected";

//       return hasBudgetShape && !hasVoucherData && isApprovedOrRejected;
//     })
//     .map((item, index) => ({
//       ...item,
//       srNo: index + 1,
//       projectedAmount: inrFormat(item?.projectedAmount || 0),
//       actualAmount: inrFormat(item?.actualAmount || 0),
//       dueDate: item?.dueDate ? humanDate(item.dueDate) : "-",
//       dueDateRaw: item?.dueDate ? dayjs(item.dueDate).toISOString() : null,
//       status: item?.status || "-",
//     }));

//   return (
//     <PageFrame>
//       <YearWiseTable
//         data={tableData}
//         columns={columns}
//         dateColumn="dueDateRaw"
//         search
//         tableTitle="Budget History"
//         tableHeight={450}
//         isLoading={isBudgetLoading}
//       />
//     </PageFrame>
//   );
// };

// export default BudgetHistory;


// import dayjs from "dayjs";
// import { useQuery } from "@tanstack/react-query";
// import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
// import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
// import { inrFormat } from "../../../../utils/currencyFormat";

// const BudgetHistory = () => {
//   const axios = useAxiosPrivate();

//   const { data: financeBudget = [], isPending: isBudgetLoading } = useQuery({
//     queryKey: ["financeBudget"],
//     queryFn: async () => {
//       try {
//         const response = await axios.get(
//           `/api/budget/company-budget?departmentId=6798bab0e469e809084e249a`
//         );
//         const budgets = response.data.allBudgets;
//         return Array.isArray(budgets) ? budgets : [];
//       } catch (error) {
//         console.error("Error fetching budget:", error);
//         return [];
//       }
//     },
//   });

//   const groupedData = financeBudget.reduce((acc, item) => {
//     const month = dayjs(item.dueDate).format("MMMM YYYY");

//     if (!acc[month]) {
//       acc[month] = {
//         month,
//         latestDueDate: item.dueDate,
//         projectedAmount: 0,
//         amount: 0,
//         tableData: {
//           rows: [],
//           columns: [
//             { field: "expanseName", headerName: "Expense Name", flex: 1 },
//             { field: "expanseType", headerName: "Expense Type", flex: 1 },
//             { field: "projectedAmount", headerName: "Projected Amount(INR)", flex: 1 },
//             { field: "actualAmount", headerName: "Actual Amount(INR)", flex: 1 },
//             { field: "dueDate", headerName: "Due Date", flex: 1 },
//             { field: "status", headerName: "Status", flex: 1 },
//           ],
//         },
//       };
//     }

//     acc[month].projectedAmount += item.projectedAmount;
//     acc[month].amount += item?.actualAmount;
//     acc[month].tableData.rows.push({
//       id: item._id,
//       expanseName: item.expanseName,
//       expanseType: item.expanseType,
//       projectedAmount: item?.projectedAmount?.toFixed(2),
//       actualAmount: inrFormat(item?.actualAmount || 0),
//       dueDate: dayjs(item.dueDate).format("DD-MM-YYYY"),
//       status: item.status,
//       invoiceAttached: item.invoiceAttached,
//     });

//     return acc;
//   }, {});

//   const financialData = Object.values(groupedData)
//     .map((data) => {
//       const transformedRows = data.tableData.rows.map((row, index) => ({
//         ...row,
//         srNo: index + 1,
//         projectedAmount: Number(
//           row.projectedAmount?.toLocaleString("en-IN").replace(/,/g, "")
//         ).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
//       }));

//       return {
//         ...data,
//         projectedAmount: data.projectedAmount.toLocaleString("en-IN"),
//         amount: data.amount.toLocaleString("en-IN"),
//         tableData: {
//           ...data.tableData,
//           rows: transformedRows,
//           columns: [{ field: "srNo", headerName: "SR NO", width: 100 }, ...data.tableData.columns],
//         },
//       };
//     })
//     .sort((a, b) => dayjs(b.latestDueDate).diff(dayjs(a.latestDueDate)));

//   return <AllocatedBudget financialData={financialData} isLoading={isBudgetLoading} noInvoice />;
// };

// export default BudgetHistory;
