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
import { downloadCsv } from "../../utils/downloadCsv";

const REPORT_MODULE_MAP = {
  finance: { title: "Finance Department Report", module: "Finance" },
  ticket: { title: "Ticket Report", module: "Ticket" },
  meeting: { title: "Meeting Report", module: "Meeting" },
  visitor: { title: "Visitor Report", module: "Visitor" },
};

const RETRY_COOLDOWN_STORAGE_KEY = "department-report-retry-cooldown";

const DepartmentReportCommon = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const { moduleKey = "" } = useParams();
  const selectedModule = REPORT_MODULE_MAP[String(moduleKey).toLowerCase()];
  const [activeReportId, setActiveReportId] = useState(null);
  const [jobStatusByReportId, setJobStatusByReportId] = useState({});
  const [downloadedByReportId, setDownloadedByReportId] = useState({});
  const [retryCooldownByReportId, setRetryCooldownByReportId] = useState({});
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

      const allPrimitive = value.every(
        (item) =>
          item === null ||
          ["string", "number", "boolean"].includes(typeof item),
      );

      if (allPrimitive) {
        return { [prefix]: value.join(" | ") };
      }

      // Array of objects — flatten each and prefix with index
      const result = {};
      value.forEach((item, i) => {
        Object.assign(
          result,
          flattenRow(item, prefix ? `${prefix}.${i}` : `${i}`),
        );
      });
      return result;
    }

    if (typeof value === "object") {
      const flat = {};
      Object.entries(value).forEach(([key, nestedValue]) => {
        const nextPrefix = prefix ? `${prefix}.${key}` : key;
        Object.assign(flat, flattenRow(nestedValue, nextPrefix));
      });
      return flat;
    }

    // Primitive
    return prefix ? { [prefix]: value } : {};
  };

  const flattenObject = (obj, prefix = "") => {
    let result = {};

    Object.entries(obj || {}).forEach(([key, value]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        result[nextKey] = "";
      } else if (Array.isArray(value)) {
        // skip arrays here
        result[nextKey] = JSON.stringify(value);
      } else if (typeof value === "object") {
        Object.assign(result, flattenObject(value, nextKey));
      } else {
        result[nextKey] = value;
      }
    });

    return result;
  };

  const normalizeReportRows = (reportData) => {
    if (!reportData || typeof reportData !== "object") return [];

    const rows = [];

    // parent-level primitive/object fields
    const parentFields = {};

    Object.entries(reportData).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        if (typeof value === "object" && value !== null) {
          Object.assign(parentFields, flattenObject(value, key));
        } else {
          parentFields[key] = value;
        }
      }
    });

    // handle arrays
    Object.entries(reportData).forEach(([key, value]) => {
      if (!Array.isArray(value)) return;

      // array of objects
      if (
        value.every(
          (item) =>
            typeof item === "object" && item !== null && !Array.isArray(item),
        )
      ) {
        value.forEach((item) => {
          rows.push({
            ...parentFields,
            ...flattenObject(item),
          });
        });
      } else {
        // primitive arrays
        rows.push({
          ...parentFields,
          [key]: value.join(" | "),
        });
      }
    });

    return rows.length ? rows : [parentFields];
  };

  const triggerDataDownload = (reportData, reportName) => {
    return downloadCsv({
      data: reportData,
      fileName: reportName,
    });
  };

  const getRetryCountdownLabel = (retryAt) => {
    if (!retryAt) return null;
    const remainingMs = Math.max(0, dayjs(retryAt).diff(dayjs()));
    const minutes = Math.ceil(remainingMs / (60 * 1000));
    return minutes > 0 ? `Generate after ${minutes} mins` : "Generate";
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
        const reportRow = reports.find((r) => r?._id === reportId);

        const downloadStarted =
          triggerDataDownload(reportData, reportRow?.reportName) ||
          triggerReportDownload(downloadUrl);

        setDownloadedByReportId((prev) => ({
          ...prev,
          [reportId]: downloadStarted,
        }));

        if (downloadStarted) {
          toast.success("Report Generated.");
        } else {
          toast.error("Report generated, but no  file payload was returned");
        }
        return;
      }

      if (status === "failed") {
        setDownloadedByReportId((prev) => ({
          ...prev,
          [reportId]: false,
        }));
        return;
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

      reportJobByReportIdRef.current[reportRow?._id] = jobId;

      await pollReportStatus(jobId, reportRow?._id);

      return response.data;
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to generate report",
      );
    },
    onSettled: () => setActiveReportId(null),
  });

  const cancelReportMutation = useMutation({
    mutationFn: async ({ reportId, jobId }) => {
      const response = await axios.patch(`/api/reports/cancel/${jobId}`);

      return {
        reportId,
        jobId,
        data: response.data,
      };
    },

    onSuccess: ({ reportId, jobId, data }) => {
      cancelledJobsRef.current.add(jobId);

      setJobStatusByReportId((prev) => ({
        ...prev,
        [reportId]: "cancelled",
      }));

      toast.success("Report generation cancelled");
    },

    onError: (error, variables) => {
      const status = error?.response?.data?.status;
      const message = error?.response?.data?.message;

      if (status === "completed") {
        setJobStatusByReportId((prev) => ({
          ...prev,
          [variables.reportId]: "completed",
        }));

        toast.info("Report already generated");
        return;
      }

      if (status === "failed") {
        toast.info("Report already failed");
        return;
      }

      if (status === "canceled") {
        setJobStatusByReportId((prev) => ({
          ...prev,
          [variables.reportId]: "cancelled",
        }));

        toast.info("Report already cancelled");
        return;
      }

      toast.error(message || "Failed to cancel report");
    },
  });

  const retryReportMutation = useMutation({
    mutationFn: async ({ reportId, jobId }) => {
      const response = await axios.post(`/api/reports/retry/${jobId}`);
      return { reportId, jobId: response?.data?.jobId, data: response?.data };
    },
    onSuccess: async ({ reportId, jobId }) => {
      setRetryCooldownByReportId((prev) => ({ ...prev, [reportId]: null }));
      reportJobByReportIdRef.current[reportId] = jobId;
      setJobStatusByReportId((prev) => ({ ...prev, [reportId]: "pending" }));
      await pollReportStatus(jobId, reportId);
    },
    onError: (error, variables) => {
      if (error?.response?.status === 429) {
        const retryAvailableAt = error?.response?.data?.retryAvailableAt;
        setRetryCooldownByReportId((prev) => ({
          ...prev,
          [variables.reportId]: retryAvailableAt || null,
        }));
        toast.error("Report generation unavailable. Please try again later.");
        return;
      }
      toast.error(error?.response?.data?.message || "Retry failed");
    },
  });

  useEffect(() => {
    const storedCooldownRaw = localStorage.getItem(RETRY_COOLDOWN_STORAGE_KEY);
    if (!storedCooldownRaw || !reports.length) return;

    let storedCooldownByReportId = {};
    try {
      storedCooldownByReportId = JSON.parse(storedCooldownRaw);
    } catch {
      localStorage.removeItem(RETRY_COOLDOWN_STORAGE_KEY);
      return;
    }

    const activeReportIds = new Set(
      reports.map((report) => String(report?._id)),
    );
    const validCooldownByReportId = {};

    Object.entries(storedCooldownByReportId).forEach(([reportId, retryAt]) => {
      if (!activeReportIds.has(String(reportId))) return;
      if (!retryAt || !dayjs(retryAt).isAfter(dayjs())) return;
      validCooldownByReportId[reportId] = retryAt;
    });

    setRetryCooldownByReportId(validCooldownByReportId);
  }, [reports]);

  useEffect(() => {
    const activeCooldownEntries = Object.entries(
      retryCooldownByReportId,
    ).filter(([, retryAt]) => retryAt && dayjs(retryAt).isAfter(dayjs()));

    if (!activeCooldownEntries.length) {
      localStorage.removeItem(RETRY_COOLDOWN_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      RETRY_COOLDOWN_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(activeCooldownEntries)),
    );
  }, [retryCooldownByReportId]);

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
      flex: 1,
      cellRenderer: (params) => {
        const row = params?.data;
        const status = jobStatusByReportId[row?._id];
        const isPending =
          generateReportMutation.isPending && activeReportId === row?._id;
        const isGenerating =
          status === "pending" || status === "processing" || isPending;
        const isDownloaded = downloadedByReportId[row?._id];
        const isCancelling =
          cancelReportMutation.isPending &&
          cancelReportMutation.variables?.reportId === row?._id;

        const retryAvailableAt = retryCooldownByReportId[row?._id];
        const hasCooldown =
          retryAvailableAt && dayjs(retryAvailableAt).isAfter(dayjs());
        const retryLabel = hasCooldown
          ? getRetryCountdownLabel(retryAvailableAt)
          : "Retry";

        const primaryButtonLabel =
          status === "processing"
            ? "Processing..."
            : status === "completed"
              ? isDownloaded
                ? "Generated"
                : "Download failed"
              : status === "failed"
                ? "Failed"
                : isGenerating
                  ? "Generating..."
                  : "Generate";

        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (status === "failed") return;
                setActiveReportId(row?._id || null);
                generateReportMutation.mutate(row);
              }}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:bg-blue-300"
              disabled={
                isGenerating ||
                status === "failed" ||
                !row?._id ||
                !row?.departmentId?._id
              }
            >
              {primaryButtonLabel}
            </button>
            {status === "failed" ? (
              <button
                type="button"
                onClick={() => {
                  const jobId = reportJobByReportIdRef.current?.[row?._id];
                  if (!jobId || hasCooldown) return;
                  retryReportMutation.mutate({ reportId: row?._id, jobId });
                }}
                className="rounded bg-orange-600 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:bg-orange-300"
                disabled={
                  retryReportMutation.isPending || hasCooldown || !row?._id
                }
              >
                {retryReportMutation.isPending ? "Retrying..." : retryLabel}
              </button>
            ) : null}

            {isGenerating ? (
              <button
                type="button"
                onClick={() => {
                  const jobId = reportJobByReportIdRef.current?.[row?._id];

                  if (!jobId) {
                    toast.info("This report is already completed or cancelled");
                    return;
                  }

                  cancelReportMutation.mutate({
                    reportId: row?._id,
                    jobId,
                  });
                }}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </button>
            ) : null}
          </div>
        );
      },
    },
  ];

  const tableData = useMemo(
    () =>
      reports.map((report, index) => {
        console.log("Report data:", report);

        return {
          ...report,
          srNo: index + 1,
          startDate: report?.latestDatefilter?.startDate
            ? dayjs(report.latestDatefilter.startDate).format("DD-MM-YYYY")
            : "-",
          endDate: report?.latestDatefilter?.endDate
            ? dayjs(report.latestDatefilter.endDate).format("DD-MM-YYYY")
            : "-",
          download: "Generate",
        };
      }),
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
