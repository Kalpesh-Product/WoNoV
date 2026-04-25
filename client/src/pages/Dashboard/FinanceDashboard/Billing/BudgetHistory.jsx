import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Chip } from "@mui/material";
import PageFrame from "../../../../components/Pages/PageFrame";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";
import humanDate from "../../../../utils/humanDateForamt";

const BudgetHistory = () => {
  const axios = useAxiosPrivate();

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

  const columns = [
    { field: "srNo", headerName: "Sr No", flex: 0.8 },
    { field: "expanseName", headerName: "Expense Name", flex: 1.5 },
    { field: "expanseType", headerName: "Expense Type", flex: 1.2 },
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
          approved: {
            backgroundColor: "#E8F5E9",
            color: "#2E7D32",
          },
          rejected: {
            backgroundColor: "#FDECEA",
            color: "#C62828",
          },
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
              fontWeight: 600,
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

      return hasBudgetShape && !hasVoucherData && isApprovedOrRejected;
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
        tableTitle="Budget History"
        tableHeight={450}
        isLoading={isBudgetLoading}
      />
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