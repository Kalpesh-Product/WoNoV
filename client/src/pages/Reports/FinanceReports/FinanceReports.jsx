// import React from "react";

// const FinanceReports = () => {
//   return <div className="bg-white p-4">Finance Reports</div>;
// };

// export default FinanceReports;
// import React from "react";
// import DepartmentReportCommon from "../DepartmentReportCommon";

// const FinanceReports = () => {
//   return <DepartmentReportCommon title="Finance Department Report" />;
// };

// export default FinanceReports;


import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoMdDownload } from "react-icons/io";
import { Chip } from "@mui/material";
import AgTable from "../../../components/AgTable";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const FinanceReports = () => {
  const axios = useAxiosPrivate();

  const { data: budgetRows = [] } = useQuery({
    queryKey: ["finance-report-budget-rows"],
    queryFn: async () => {
      const response = await axios.get(`/api/budget/company-budget`);
      const budgets = Array.isArray(response?.data?.allBudgets)
        ? response.data.allBudgets
        : [];

      return budgets.filter((budget) => {
        const expenseType = String(budget.expanseType || "")
          .trim()
          .toLowerCase();
        return !(
          expenseType.includes("reimbursement") ||
          expenseType.includes("voucher")
        );
      });
    },
  });

  const financeColumns = [
    { field: "srNo", headerName: "S.No.", maxWidth: 90 },
    { field: "reportName", headerName: "Report Name", flex: 1 },
    {
         headerName: "Status",
         field: "isActive",
         flex: 1,
         sort: "desc",
         cellRenderer: () => {
           const statusColorMap = {
             Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
             Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
           };
   
           const { backgroundColor, color } = statusColorMap["Active"] || {
             backgroundColor: "gray",
             color: "white",
           };
           return (
             <>
               <Chip
                 label={"Active"}
                 style={{
                   backgroundColor,
                   color,
                 }}
               />
             </>
           );
         },
       },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "lastModified", headerName: "Last Modified", flex: 1 },
    {
      field: "download",
      headerName: "Download",
      maxWidth: 140,
      cellRenderer: () => (
        <button
          type="button"
          onClick={handleFinanceDownload}
          className="text-black"
          title="Download"
        >
          <IoMdDownload size={18} />
        </button>
      ),
    },
  ];

  const buildCsvRow = (values) =>
    values
      .map((value) => {
        const safeValue = String(value ?? "").replace(/"/g, '""');
        return `"${safeValue}"`;
      })
      .join(",");

  const handleFinanceDownload = () => {
    if (!budgetRows.length) return;

    const headers = [
      "Sr No",
      "Department",
      "Expense Name",
      "Expense Type",
      "Payment Type",
      "Projected Amount(INR)",
      "Actual Amount(INR)",
      "Unit",
      "Unit No",
      "Building",
      "Due Date",
      "Invoice Name",
      "Invoice Date",
      "Approval Status",
      "Paid Status",
      "Invoice File",
    ];

    const csvRows = budgetRows.map((item, index) => {
        const unit = item.unit || {};
        const building = unit.building || {};
        const invoice = item.invoice || {};

        return buildCsvRow([
          index + 1,
          item.department?.name || "-",
          item.expanseName || "-",
          item.expanseType || "-",
          item.paymentType || "-",
          item.projectedAmount || 0,
          item.actualAmount || 0,
          unit.unitName || "-",
          unit.unitNo || "-",
          building.buildingName || "-",
          item.dueDate || "-",
          invoice.name || "-",
          invoice.date || "-",
          item.status || "-",
          item.status === "Approved" ? "Paid" : "Unpaid",
          invoice.link || "-",
        ]);
    });

    const csvContent = [buildCsvRow(headers), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Expense and Budget.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tableData = useMemo(
    () => [
      {
        id: "expense-and-budget",
        srNo: 1,
        reportName: "Expense and Budget",
        status: "Active",
        date: "07-05-2026",
        lastModified: "",
        download: "Download",
      },
    ],
    [budgetRows.length]
  );

  return (
    <div className="bg-white min-h-full p-4">
      <div className="rounded-xl border border-borderGray bg-white p-4 shadow-sm">
        <AgTable
          tableTitle="Finance Department Report"
          data={tableData}
          columns={financeColumns}
          search={true}
        />
      </div>
    </div>
  );
};

export default FinanceReports;
