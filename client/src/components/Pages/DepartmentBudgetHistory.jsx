import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import dayjs from "dayjs";
import PageFrame from "./PageFrame";
import YearWiseTable from "../Tables/YearWiseTable";
import DetalisFormatted from "../DetalisFormatted";
import MuiModal from "../MuiModal";
import PaidAmountHistory from "../PaidAmountHistory";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";
import { inrFormat } from "../../utils/currencyFormat";
import humanDate from "../../utils/humanDateForamt";

const DepartmentBudgetHistory = () => {
  const [viewDetails, setViewDetails] = useState(null);
  const axios = useAxiosPrivate();
  const department = usePageDepartment();
  const departmentTitle = department?.name || "Department";

  const { data: budgetHistory = [], isPending: isBudgetLoading } = useQuery({
    queryKey: ["departmentBudgetHistory", department?._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/budget/company-budget?departmentId=${department?._id}`,
      );
      const budgets = response?.data?.allBudgets;
      return Array.isArray(budgets) ? budgets : [];
    },
    enabled: !!department?._id,
  });

  const columns = [
    {
      field: "srNo",
      headerName: "Sr No",
      flex: 0.5,
      sortable: false,
      valueGetter: (params) =>
        params.node?.rowIndex == null ? "" : params.node.rowIndex + 1,
    },
    { field: "expanseName", headerName: "Expense Name", flex: 1 },
    { field: "expanseType", headerName: "Expense Type", flex: 1 },
    { field: "paymentType", headerName: "Payment Type", flex: 1 },
    { field: "projectedAmount", headerName: "Projected Amount (INR)", flex: 1 },
    { field: "financeAmount", headerName: "Paid Amount (INR)", flex: 1 },
    { field: "remainingAmount", headerName: "Remaining Amount (INR)", flex: 1 },
    { field: "actualAmount", headerName: "Actual Amount (INR)", flex: 1 },
    { field: "dueDate", headerName: "Due Date", flex: 1 },
    {
      field: "status",
      headerName: "Approval Status",
      pinned:"right",
      flex: 1,
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
      width: 80,
      sortable: false,
      cellRenderer: (params) => (
        <button
          type="button"
          className="text-subtitle text-primary cursor-pointer"
          title="View budget details"
          aria-label="View budget details"
          onClick={() =>
            setViewDetails({
              ...params.data,
              srNo:
                params.node?.rowIndex == null
                  ? params.data.srNo
                  : params.node.rowIndex + 1,
            })
          }
        >
          <MdOutlineRemoveRedEye />
        </button>
      ),
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
        return hasBudgetShape && !hasVoucherData && isApprovedOrRejected;

      //   const isExtraBudget = item?.isExtraBudget === true;

      //      return (
      //   hasBudgetShape && !hasVoucherData && isApprovedOrRejected && isExtraBudget
      // );
    })
    .map((item) => {
      const projectedAmount = Number(item?.projectedAmount || 0);
      const financeAmount = Number(item?.financeAmount || 0);
      const actualAmount = Number(item?.actualAmount || 0);

      return {
        ...item,
        financeAmountRaw: financeAmount,
        actualAmountRaw: actualAmount,
        remainingAmountRaw: actualAmount - financeAmount,
        projectedAmount: inrFormat(projectedAmount),
        financeAmount: inrFormat(financeAmount),
        remainingAmount: inrFormat(actualAmount - financeAmount),
        actualAmount: inrFormat(actualAmount),
        dueDate: item?.dueDate ? humanDate(item.dueDate) : "-",
        dueDateRaw: item?.dueDate ? dayjs(item.dueDate).toISOString() : null,
        status: item?.status || "-",
      };
    });

  return (
    <PageFrame>
      <YearWiseTable
        data={tableData}
        columns={columns}
        dateColumn="dueDateRaw"
        search
        tableTitle={`${departmentTitle} Budget History`}
        tableHeight={450}
        isLoading={isBudgetLoading}
        exportData
      />
      {viewDetails && (
        <MuiModal
          open={Boolean(viewDetails)}
          onClose={() => setViewDetails(null)}
          title={
            <span className="text-subtitle font-pmedium text-primary my-4 uppercase">
              Budget Details
            </span>
          }
        >
          <div className="space-y-3">
            <DetalisFormatted title="Sr No" detail={viewDetails.srNo} />
            <DetalisFormatted title="Expense Name" detail={viewDetails.expanseName || "-"} />
            <DetalisFormatted title="Expense Type" detail={viewDetails.expanseType || "-"} />
            <DetalisFormatted title="Vendor" detail={viewDetails.vendor?.companyName || viewDetails.vendor?.name || "-"} />
            <DetalisFormatted title="Paid Amount" detail={`INR ${inrFormat(viewDetails.financeAmountRaw || 0)}`} />
            <DetalisFormatted
              title="Paid Amount History"
              detail={
                <PaidAmountHistory
                  history={viewDetails.financeAmountHistory}
                  currentAmount={viewDetails.financeAmountRaw}
                  currentDate={viewDetails.financeAmountDate}
                />
              }
            />
            <DetalisFormatted title="Remaining Amount" detail={`INR ${inrFormat(viewDetails.remainingAmountRaw ?? (Number(viewDetails.actualAmountRaw || 0) - Number(viewDetails.financeAmountRaw || 0)))}`} />
            <DetalisFormatted title="Actual Amount" detail={`INR ${inrFormat(viewDetails.actualAmountRaw || 0)}`} />
            <DetalisFormatted title="Due Date" detail={viewDetails.dueDate || "-"} />
            <DetalisFormatted title="Approval Status" detail={viewDetails.status || "-"} />
          </div>
        </MuiModal>
      )}
    </PageFrame>
  );
};

export default DepartmentBudgetHistory;
