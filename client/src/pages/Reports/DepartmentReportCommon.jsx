import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";
import { toast } from "sonner";
import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanDate from "../../utils/humanDateForamt";

const REPORT_MODULE_MAP = {
  finance: { title: "Finance Department Report", module: "Finance" },
  ticket: { title: "Ticket Report", module: "Ticket" },
  meeting: { title: "Meeting Report", module: "Meeting" },
  visitor: { title: "Visitor Report", module: "Visitor" },
};

const DepartmentReportCommon = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const { moduleKey = "" } = useParams();
  const selectedModule = REPORT_MODULE_MAP[String(moduleKey).toLowerCase()];
  const [activeReportId, setActiveReportId] = useState(null);

  useEffect(() => {
    if (selectedModule) return;
    toast.error("Invalid report module selected");
    navigate("../reports-section", { replace: true });
  }, [navigate, selectedModule]);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["department-reports", selectedModule?.module],
    queryFn: async () => {
      const response = await axios.get("/api/reports", {
        params: { module: selectedModule?.module },
      });
      return Array.isArray(response?.data?.reports)
        ? response.data.reports
        : [];
    },
    enabled: Boolean(selectedModule?.module),
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportRow) => {
      const payload = {
        report: reportRow?._id,
        department: reportRow?.departmentId?._id,
      };

      const response = await axios.post("/api/reports/generate", payload);
      return response.data;
    },
    onSuccess: () => toast.success("Report generation started"),
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to generate report",
      );
    },
    onSettled: () => setActiveReportId(null),
  });

  const columns = [
    { field: "srNo", headerName: "S.No.", maxWidth: 90 },
    { field: "reportName", headerName: "Report Name", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const isActive = Boolean(params?.value);
        return (
          <Chip
            label={isActive ? "Active" : "Inactive"}
            style={{
              backgroundColor: isActive ? "#90EE90" : "#FFD6D6",
              color: isActive ? "#006400" : "#B00020",
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
      minWidth: 190,
      cellRenderer: (params) => {
        const row = params?.data;
        const isPending =
          generateReportMutation.isPending && activeReportId === row?._id;

        return (
          <button
            type="button"
            onClick={() => {
              setActiveReportId(row?._id || null);
              generateReportMutation.mutate(row);
            }}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={isPending || !row?._id || !row?.departmentId?._id}
          >
            {isPending ? "Generating..." : "Generate"}
          </button>
        );
      },
    },
  ];

  const tableData = useMemo(
    () =>
      reports.map((report, index) => ({
        ...report,
        srNo: index + 1,
        date: humanDate(report?.createdAt) || "-",
        lastModified: humanDate(report?.updatedAt) || "-",
        download: "Generate",
      })),
    [reports],
  );

  if (!selectedModule) return null;

  return (
    <div className="bg-white min-h-full p-4">
      <div className="rounded-xl border border-borderGray bg-white p-4 shadow-sm">
        <AgTable
          tableTitle={selectedModule.title}
          data={tableData}
          columns={columns}
          search={true}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default DepartmentReportCommon;

// import React from "react";
// import AgTable from "../../components/AgTable";

// const DepartmentReportCommon = ({ title }) => {
// //   useEffect(() => {
// //     document.title = title || "WoNoV";

// //     return () => {
// //       document.title = "WoNoV";
// //     };
// //   }, [title]);

//   const DepartmentReportCommons = [
//     { field: "srNo", headerName: "S.No.", maxWidth: 90 },
//     { field: "reportName", headerName: "Report Name", flex: 1 },
//     { field: "status", headerName: "Status", maxWidth: 180 },
//     { field: "date", headerName: "Date", maxWidth: 180 },
//     { field: "lastModified", headerName: "Last Modified", flex: 1 },
//     { field: "download", headerName: "Download", maxWidth: 140 },
//   ];

//   return (
//     <div className="bg-white min-h-full p-4">
//       <div className="rounded-xl border border-borderGray bg-white p-4 shadow-sm">
//         <AgTable
//           tableTitle={title}
//           data={[]}
//           columns={DepartmentReportCommons}
//           search={true}
//         />
//       </div>
//     </div>
//   );
// };

// export default DepartmentReportCommon;
