import React, { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IoMdDownload } from "react-icons/io";
import { Chip } from "@mui/material";
import { toast } from "sonner";
import AgTable from "../../../components/AgTable";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import humanDate from "../../../utils/humanDateForamt";

const FinanceReports = () => {
  const axios = useAxiosPrivate();
  const [reportJobId, setReportJobId] = useState(null);

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

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        report: "69fefcd440b6762f0e07ccb9",
        department: "6798bab0e469e809084e249a",
        filters: { startDate: "2025-01-01", endDate: "2026-03-01" },
      };

      const response = await axios.post("/api/reports/generate", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setReportJobId(data?.jobId || null);
      toast.success("Report generation started");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to start report job",
      );
    },
  });

  const { data: reportStatus } = useQuery({
    queryKey: ["finance-report-status", reportJobId],
    queryFn: async () => {
      const response = await axios.get(`/api/reports/status/${reportJobId}`);
      return response.data;
    },
    enabled: Boolean(reportJobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") {
        return false;
      }
      return 2000;
    },
  });

  const statusLabel =
    reportStatus?.status === "processing" || reportStatus?.status === "pending"
      ? "Generating"
      : reportStatus?.status === "completed"
        ? "Active"
        : reportStatus?.status === "failed"
          ? "Failed"
          : "Active";

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
          Failed: { backgroundColor: "#FFD6D6", color: "#B00020" },
          Generating: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Active: { backgroundColor: "#90EE90", color: "#006400" },
        };

        const { backgroundColor, color } = statusColorMap[statusLabel] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <Chip
            label={statusLabel}
            style={{
              backgroundColor,
              color,
            }}
          />
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
          disabled={generateReportMutation.isPending}
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

  const downloadCsv = useCallback((rows = []) => {
    if (!rows.length) return;

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

    const csvRows = rows.map((item, index) => {
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
  }, []);

  const handleFinanceDownload = async () => {
    await generateReportMutation.mutateAsync();
  };

  React.useEffect(() => {
    if (!reportStatus) return;

    if (reportStatus.status === "completed") {
      const rows = Array.isArray(reportStatus.data) ? reportStatus.data : [];
      if (!rows.length) {
        toast.warning("Report completed with no rows to download");
        return;
      }
      downloadCsv(rows);
      toast.success("Report ready. Download started");
      setReportJobId(null);
    }

    if (reportStatus.status === "failed") {
      toast.error(reportStatus.error || "Report generation failed");
      setReportJobId(null);
    }
  }, [downloadCsv, reportStatus]);

  const tableData = useMemo(
    () => [
      {
        id: "expense-and-budget",
        srNo: 1,
        reportName: "Expense and Budget",
        status: statusLabel,
        date: "07-05-2026",
        lastModified: humanDate(reportStatus?.completedAt) || "",
        download: "Download",
      },
    ],
    [reportStatus, statusLabel],
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
