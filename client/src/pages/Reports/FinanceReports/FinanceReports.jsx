import React from "react";
import DepartmentReportCommon from "../DepartmentReportCommon";

const FinanceReports = () => {
  return (
    <DepartmentReportCommon
      title="Finance Department Report"
      moduleKey="Finance"
    />
  );
};

export default FinanceReports;

// import React, { useCallback, useMemo, useState } from "react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { AiOutlineLoading3Quarters } from "react-icons/ai";
// import { Chip } from "@mui/material";
// import { toast } from "sonner";
// import AgTable from "../../../components/AgTable";
// import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
// import humanDate from "../../../utils/humanDateForamt";

// const FinanceReports = () => {
//   const axios = useAxiosPrivate();
//   const [reportJobId, setReportJobId] = useState(null);
//   const [isDownloading, setIsDownloading] = useState(false);

//   const { data: budgetRows = [] } = useQuery({
//     queryKey: ["finance-report-budget-rows"],
//     queryFn: async () => {
//       const response = await axios.get(`/api/budget/company-budget`);
//       const budgets = Array.isArray(response?.data?.allBudgets)
//         ? response.data.allBudgets
//         : [];

//       return budgets.filter((budget) => {
//         const expenseType = String(budget.expanseType || "")
//           .trim()
//           .toLowerCase();
//         return !(
//           expenseType.includes("reimbursement") ||
//           expenseType.includes("voucher")
//         );
//       });
//     },
//   });

//   const generateReportMutation = useMutation({
//     mutationFn: async () => {
//       const payload = {
//         report: "69fefcd440b6762f0e07ccb9",
//         department: "6798bab0e469e809084e249a",
//         filters: { startDate: "2025-01-01", endDate: "2026-03-01" },
//       };

//       const response = await axios.post("/api/reports/generate", payload);
//       return response.data;
//     },
//     onSuccess: (data) => {
//       setReportJobId(data?.jobId || null);
//       toast.success("Report generation started");
//     },
//     onError: (error) => {
//       toast.error(
//         error?.response?.data?.message || "Failed to start report job",
//       );
//     },
//   });

//   const { data: reportStatus } = useQuery({
//     queryKey: ["finance-report-status", reportJobId],
//     queryFn: async () => {
//       // const response = await axios.get(`/api/reports/status/${reportJobId}`);
//       const response = await axios.get(`/api/budget/company-budget`);
//       return response.data;
//     },
//     enabled: Boolean(reportJobId),
//     refetchInterval: (query) => {
//       const status = query.state.data?.status;
//       if (status === "completed" || status === "failed") {
//         return false;
//       }
//       return 2000;
//     },
//   });

//   const financeColumns = [
//     { field: "srNo", headerName: "S.No.", maxWidth: 90 },
//     { field: "reportName", headerName: "Report Name", flex: 1 },
//     {
//       headerName: "Status",
//       field: "isActive",
//       flex: 1,
//       sort: "desc",
//       cellRenderer: (params) => {
//         const isActive = Boolean(params?.value);
//         const currentStatus = isActive ? "Active" : "Inactive";
//         const statusColorMap = {
//           Active: { backgroundColor: "#90EE90", color: "#006400" },
//           Inactive: { backgroundColor: "#FFD6D6", color: "#B00020" },
//         };

//         const { backgroundColor, color } = statusColorMap[currentStatus];
//         return (
//           <Chip
//             label={currentStatus}
//             style={{
//               backgroundColor,
//               color,
//             }}
//           />
//         );
//       },
//     },
//     { field: "date", headerName: "Date", flex: 1 },
//     { field: "lastModified", headerName: "Last Modified", flex: 1 },
//     // {
//     //   field: "download",
//     //   headerName: "Download",
//     //   minWidth: 190,
//     //   cellRenderer: () => {
//     //     const jobStatus = reportStatus?.status;

//     //     if (isDownloading) {
//     //       return (
//     //         <span className="inline-flex items-center gap-2 text-sm text-blue-700">
//     //           <AiOutlineLoading3Quarters className="animate-spin text-lg" />
//     //           Downloading...
//     //         </span>
//     //       );
//     //     }

//     //     if (!reportJobId && jobStatus !== "completed") {
//     //       return (
//     //         <button
//     //           type="button"
//     //           onClick={handleFinanceDownload}
//     //           className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
//     //           disabled={generateReportMutation.isPending}
//     //         >
//     //           {generateReportMutation.isPending ? "Generating..." : "Generate"}
//     //         </button>
//     //       );
//     //     }

//     //     if (jobStatus === "processing" || jobStatus === "pending") {
//     //       return <span className="text-sm text-amber-600">Generating...</span>;
//     //     }

//     //     if (jobStatus === "completed") {
//     //       return (
//     //         <span className="text-sm text-green-700">Download started</span>
//     //       );
//     //     }

//     //     return (
//     //       <button
//     //         type="button"
//     //         onClick={handleFinanceDownload}
//     //         className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
//     //         disabled={generateReportMutation.isPending}
//     //       >
//     //         Generate
//     //       </button>
//     //     );
//     //   },
//     // },
//   ];

//   const buildCsvRow = (values) =>
//     values
//       .map((value) => {
//         const safeValue = String(value ?? "").replace(/"/g, '""');
//         return `"${safeValue}"`;
//       })
//       .join(",");

//   const downloadCsv = useCallback((rows = []) => {
//     if (!rows.length) return;

//     const headers = [
//       "Sr No",
//       "Department",
//       "Expense Name",
//       "Expense Type",
//       "Payment Type",
//       "Projected Amount(INR)",
//       "Actual Amount(INR)",
//       "Unit",
//       "Unit No",
//       "Building",
//       "Due Date",
//       "Invoice Name",
//       "Invoice Date",
//       "Approval Status",
//       "Paid Status",
//       "Invoice File",
//     ];

//     const csvRows = rows.map((item, index) => {
//       const unit = item.unit || {};
//       const building = unit.building || {};
//       const invoice = item.invoice || {};

//       return buildCsvRow([
//         index + 1,
//         item.department?.name || "-",
//         item.expanseName || "-",
//         item.expanseType || "-",
//         item.paymentType || "-",
//         item.projectedAmount || 0,
//         item.actualAmount || 0,
//         unit.unitName || "-",
//         unit.unitNo || "-",
//         building.buildingName || "-",
//         item.dueDate || "-",
//         invoice.name || "-",
//         invoice.date || "-",
//         item.status || "-",
//         item.status === "Approved" ? "Paid" : "Unpaid",
//         invoice.link || "-",
//       ]);
//     });

//     const csvContent = [buildCsvRow(headers), ...csvRows].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", "Expense and Budget.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   }, []);

//   const handleFinanceDownload = async () => {
//     await generateReportMutation.mutateAsync();
//   };

//   const startDownload = useCallback(() => {
//     const rows = Array.isArray(reportStatus?.data)
//       ? reportStatus.data
//       : Array.isArray(reportStatus?.data?.allBudgets)
//         ? reportStatus.data.allBudgets
//         : [];

//     if (!rows.length) {
//       toast.warning("Report completed with no rows to download");
//       return;
//     }

//     setIsDownloading(true);
//     downloadCsv(rows);
//     toast.success("Download started");
//     setTimeout(() => setIsDownloading(false), 900);
//     setReportJobId(null);
//   }, [downloadCsv, reportStatus]);

//   React.useEffect(() => {
//     if (!reportStatus) return;

//     if (reportStatus.status === "completed") {
//       console.log("report data for download:", reportStatus.completedAt);
//       startDownload();
//       return;
//     }

//     if (reportStatus.status === "failed") {
//       toast.error(reportStatus.error || "Report generation failed");
//       setReportJobId(null);
//     }
//   }, [reportStatus, startDownload]);

//   const tableData = useMemo(
//     () => [
//       {
//         id: "expense-and-budget",
//         srNo: 1,
//         reportName: "Expense and Budget",
//         isActive: true,
//         date: "07-05-2026",
//         lastModified: humanDate(reportStatus?.completedAt) || "",
//         download: "Download",
//       },
//     ],
//     [reportStatus],
//   );

//   console.log("Finance report status:", reportStatus);
//   return (
//     <div className="bg-white min-h-full p-4">
//       <div className="rounded-xl border border-borderGray bg-white p-4 shadow-sm">
//         <AgTable
//           tableTitle="Finance Department Report"
//           data={tableData}
//           columns={financeColumns}
//           search={true}
//         />
//       </div>
//     </div>
//   );
// };

// export default FinanceReports;
