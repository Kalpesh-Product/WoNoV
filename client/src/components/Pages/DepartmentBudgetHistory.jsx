import { useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";
import dayjs from "dayjs";
import PageFrame from "./PageFrame";
import YearWiseTable from "../Tables/YearWiseTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";
import { inrFormat } from "../../utils/currencyFormat";
import humanDate from "../../utils/humanDateForamt";

const DepartmentBudgetHistory = () => {
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
    { field: "srNo", headerName: "Sr No", flex: 0.8 },
    { field: "expanseName", headerName: "Expense Name", flex: 1.5 },
    { field: "expanseType", headerName: "Expense Type", flex: 1.2 },
    { field: "paymentType", headerName: "Payment Type", flex: 1.2 },
    { field: "projectedAmount", headerName: "Projected Amount (INR)", flex: 1.2 },
    { field: "actualAmount", headerName: "Actual Amount (INR)", flex: 1.2 },
    { field: "dueDate", headerName: "Due Date", flex: 1.1 },
    {
      field: "status",
      headerName: "Status",
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

           return (
        hasBudgetShape && !hasVoucherData && isApprovedOrRejected && isExtraBudget
      );
    })
    .map((item, index) => ({
      ...item,
      srNo: index + 1,
      projectedAmount: inrFormat(item?.projectedAmount || 0),
      actualAmount: inrFormat(item?.actualAmount || 0),
      dueDate: item?.dueDate ? humanDate(item.dueDate) : "-",
      dueDateRaw: item?.dueDate ? dayjs(item.dueDate).toISOString() : null,
      status: item?.status || "-",
    }));

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
      />
    </PageFrame>
  );
};

export default DepartmentBudgetHistory;