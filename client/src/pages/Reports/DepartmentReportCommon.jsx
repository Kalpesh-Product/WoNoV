import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Chip, Popover } from "@mui/material";
import { toast } from "sonner";
import { DateRangePicker } from "react-date-range";
import dayjs from "dayjs";
import { MdCalendarToday } from "react-icons/md";
import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanDate from "../../utils/humanDateForamt";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

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
  const [jobStatusByReportId, setJobStatusByReportId] = useState({});
  const [downloadedByReportId, setDownloadedByReportId] = useState({});
  const reportJobByReportIdRef = useRef({});
  const cancelledJobsRef = useRef(new Set());

  const [dateRange, setDateRange] = useState([
    {
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    },
  ]);
  const [anchorEl, setAnchorEl] = useState(null);
  const isCalendarOpen = Boolean(anchorEl);

  const handleDateRangeChange = (item) => {
    setDateRange([item.selection]);
  };

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

  const triggerReportDownload = (downloadUrl) => {
    if (!downloadUrl) return false;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  };

  const toReadableHeader = (keyPath) =>
    String(keyPath)
      .split(".")
      .map((segment) =>
        segment
          .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
          .replace(/[_-]+/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/^./, (char) => char.toUpperCase()),
      )
      .join(" - ");

  const flattenRow = (value, prefix = "") => {
    if (value === null || value === undefined) {
      return prefix ? { [prefix]: "" } : {};
    }

    if (Array.isArray(value)) {
      if (!value.length) return prefix ? { [prefix]: "" } : {};
      const primitiveArray = value.every(
        (item) =>
          item === null ||
          ["string", "number", "boolean"].includes(typeof item),
      );
      if (primitiveArray) {
        return { [prefix]: value.join(" | ") };
      }

      return { [prefix]: JSON.stringify(value) };
    }

    if (typeof value !== "object") {
      return prefix ? { [prefix]: value } : {};
    }

    const flatObject = {};
    Object.entries(value).forEach(([key, nestedValue]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      if (
        nestedValue !== null &&
        typeof nestedValue === "object" &&
        !Array.isArray(nestedValue)
      ) {
        Object.assign(flatObject, flattenRow(nestedValue, nextPrefix));
      } else {
        Object.assign(flatObject, flattenRow(nestedValue, nextPrefix));
      }
    });

    return flatObject;
  };

  const normalizeReportRows = (reportData) => {
    if (!reportData) return [];

    if (Array.isArray(reportData)) return reportData;

    if (typeof reportData === "string") {
      try {
        const parsedData = JSON.parse(reportData);
        return Array.isArray(parsedData) ? parsedData : [parsedData];
      } catch {
        return [];
      }
    }

    return [reportData];
  };

  const triggerDataDownload = (reportData, reportId) => {
    const rows = normalizeReportRows(reportData);
    if (!rows.length || typeof rows[0] !== "object" || rows[0] === null) {
      return false;
    }

    const normalizedRows = rows.map((row) => flattenRow(row));
    const headers = [
      ...new Set(normalizedRows.flatMap((row) => Object.keys(row || {}))),
    ];
    if (!headers.length) return false;

    const escapeCsvValue = (value) => {
      if (value === null || value === undefined) return "";
      const stringValue =
        typeof value === "object" ? JSON.stringify(value) : String(value);
      const escaped = stringValue.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const csvLines = [
      headers
        .map((header) => escapeCsvValue(toReadableHeader(header)))
        .join(","),
      ...normalizedRows.map((row) =>
        headers.map((header) => escapeCsvValue(row?.[header])).join(","),
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `report-${reportId || "result"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);

    return true;
  };

  const pollReportStatus = async (jobId, reportId) => {
    cancelledJobsRef.current.delete(jobId);
    let attempts = 0;
    const maxAttempts = 120;

    while (attempts < maxAttempts) {
      if (cancelledJobsRef.current.has(jobId)) {
        setJobStatusByReportId((prev) => ({
          ...prev,
          [reportId]: "cancelled",
        }));
        return;
      }

      const response = await axios.get(`/api/reports/status/${jobId}`);
      const status = response?.data?.status;

      setJobStatusByReportId((prev) => ({
        ...prev,
        [reportId]: status || "pending",
      }));

      if (status === "completed") {
        const downloadUrl =
          response?.data?.downloadUrl || response?.data?.fileUrl || null;

        const reportData = response?.data?.data || null;
        const downloadStarted =
          triggerDataDownload(reportData, reportId) ||
          triggerReportDownload(downloadUrl);

        setDownloadedByReportId((prev) => ({
          ...prev,
          [reportId]: downloadStarted,
        }));

        if (downloadStarted) {
          toast.success("Report generated and download started");
        } else {
          toast.error("Report generated, but no  file payload was returned");
        }
        return;
      }

      if (status === "failed") {
        throw new Error(
          response?.data?.error?.message || "Report generation failed",
        );
      }

      attempts += 1;
      if (cancelledJobsRef.current.has(jobId)) {
        setJobStatusByReportId((prev) => ({
          ...prev,
          [reportId]: "cancelled",
        }));
        return;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    }

    throw new Error("Report generation is taking longer than expected");
  };

  const generateReportMutation = useMutation({
    mutationFn: async (reportRow) => {
      const payload = {
        report: reportRow?._id,
        department: reportRow?.departmentId?._id,
        filters: {
          startDate: dateRange?.[0]?.startDate
            ? dayjs(dateRange[0].startDate).startOf("day").toISOString()
            : undefined,
          endDate: dateRange?.[0]?.endDate
            ? dayjs(dateRange[0].endDate).endOf("day").toISOString()
            : undefined,
        },
      };

      setJobStatusByReportId((prev) => ({
        ...prev,
        [reportRow?._id]: "pending",
      }));

      setDownloadedByReportId((prev) => ({
        ...prev,
        [reportRow?._id]: false,
      }));

      const response = await axios.post("/api/reports/generate", payload);
      const jobId = response?.data?.jobId;

      if (!jobId) {
        throw new Error("Report job id was not returned by the server");
      }

      await pollReportStatus(jobId, reportRow?._id);

      reportJobByReportIdRef.current[reportRow?._id] = jobId;

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

  const cancelReportGeneration = (reportId) => {
    const jobId = reportJobByReportIdRef.current?.[reportId];

    if (!jobId) {
      setJobStatusByReportId((prev) => ({
        ...prev,
        [reportId]: "cancelled",
      }));
      toast.info("Report generation cancelled");
      return;
    }

    cancelledJobsRef.current.add(jobId);
    setJobStatusByReportId((prev) => ({
      ...prev,
      [reportId]: "cancelled",
    }));
    toast.info("Report generation cancelled");
  };

  const columns = [
    { field: "srNo", headerName: "S.No.", maxWidth: 90 },
    { field: "reportName", headerName: "Report Name", flex: 1 },
    // {
    //   field: "status",
    //   headerName: "Status",
    //   flex: 1,
    //   cellRenderer: (params) => {
    //     const isActive = Boolean(params?.value);
    //     return (
    //       <Chip
    //         label={isActive ? "Active" : "Inactive"}
    //         style={{
    //           backgroundColor: isActive ? "#90EE90" : "#FFD6D6",
    //           color: isActive ? "#006400" : "#B00020",
    //         }}
    //       />
    //     );
    //   },
    // },
    { field: "startDate", headerName: "Start Date", flex: 1 },
    { field: "endDate", headerName: "End Date", flex: 1 },
    // {
    //   field: "dateRange",
    //   headerName: "Date Range",
    //   renderCell: ({ row }) => {
    //     if (!row.startDate || !row.endDate) return "—";

    //     return `${humanDate(row.dateRange)} → ${humanDate(row.dateRange)}`;
    //   },
    // },
    {
      field: "download",
      headerName: "Download",
      minWidth: 190,
      cellRenderer: (params) => {
        const row = params?.data;
        const status = jobStatusByReportId[row?._id];
        const isPending =
          generateReportMutation.isPending && activeReportId === row?._id;
        const isGenerating =
          status === "pending" || status === "processing" || isPending;
        const isDownloaded = downloadedByReportId[row?._id];
        const buttonLabel =
          status === "processing"
            ? "Processing..."
            : status === "completed"
              ? isDownloaded
                ? "Downloaded"
                : "Download failed"
              : status === "failed" || status === "cancelled"
                ? "Retry"
                : isGenerating
                  ? "Generating..."
                  : "Generate";

        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveReportId(row?._id || null);
                generateReportMutation.mutate(row);
              }}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:bg-blue-300"
              disabled={
                isGenerating ||
                (status === "completed" && isDownloaded) ||
                !row?._id ||
                !row?.departmentId?._id
              }
            >
              {buttonLabel}
            </button>

            <button
              type="button"
              onClick={() => cancelReportGeneration(row?._id)}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              disabled={
                !isGenerating ||
                (status === "completed" && isDownloaded) ||
                !row?._id ||
                !row?.departmentId?._id
              }
            >
              Cancel
            </button>
          </div>
        );
      },
    },
  ];

  const tableData = useMemo(
    () =>
      reports.map((report, index) => ({
        ...report,
        srNo: index + 1,
        startDate: humanDate(report?.filters?.startDate) || "-",
        endDate: humanDate(report?.filters?.endDate) || "-",
        dateRange:
          report?.filters?.startDate && report?.filters?.endDate
            ? `${humanDate(report.filters.startDate)} → ${humanDate(report.filters.endDate)}`
            : "-",
        download: "Generate",
      })),
    [reports],
  );

  if (!selectedModule) return null;

  return (
    <div className="bg-white min-h-full p-4">
      <div className="rounded-xl border border-borderGray bg-white p-4 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <span className="font-pmedium text-title text-primary uppercase">
            {selectedModule.title}
          </span>

          <div className="flex justify-center items-center gap-3">
            <div className="flex items-center gap-2 justify-center">
              <div className="px-6 py-1 rounded-md border-primary border-[1px]">
                <span className="text-gray-600 text-content font-pregular">
                  {dayjs(dateRange?.[0]?.startDate).format("DD MMM YYYY")}
                </span>{" "}
              </div>

              <div className="px-6 py-1 rounded-md border-primary border-[1px]">
                <span className="text-gray-600 text-content font-pregular">
                  {dayjs(dateRange?.[0]?.endDate).format("DD MMM YYYY")}
                </span>
              </div>
            </div>

            <div
              className="p-2 rounded-md bg-primary text-white cursor-pointer hover:bg-[#1E3D55]"
              onClick={(event) => setAnchorEl(event.currentTarget)}
            >
              <MdCalendarToday size={19} />
            </div>

            <Popover
              open={isCalendarOpen}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <DateRangePicker
                onChange={handleDateRangeChange}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                direction="vertical"
              />
            </Popover>
          </div>
        </div>

        <AgTable
          hideTitle
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
