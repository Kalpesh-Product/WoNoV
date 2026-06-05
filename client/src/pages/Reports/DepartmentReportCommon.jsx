import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
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
import { queryClient } from "../../main";
import useAuth from "../../hooks/useAuth";
import useUserPermissions from "../../hooks/useUserPermissions";
import { Task } from "@mui/icons-material";

const REPORT_MODULE_MAP = {
  ticket: {
    title: "Ticket Report",
    module: "Ticket",
    reportType: "app",
     permission: "reports_tickets",
  },

  meeting: {
    title: "Meeting Report",
    module: "Meeting",
    reportType: "app",
    permission: "reports_meetings",
  },

  visitor: {
    title: "Visitor Report",
    module: "Visitor",
    reportType: "app",
    permission: "reports_visitors",
  },

  asset: {
    title: "Asset Report",
    module: "Asset",
    reportType: "app",
    permission: "reports_assets",
  },
  task: {
    title: "Task Report",
    module: "Task",
    reportType: "app",
    permission: "reports_tasks",
  },
  performance: {
    title: "Performance Report",
    module: "Performance",
    reportType: "app",
    permission: "reports_performance",
  },
};

const RETRY_COOLDOWN_STORAGE_KEY = "department-report-retry-cooldown";

const DepartmentReportCommon = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
   const { permissions } = useUserPermissions();
  const location = useLocation();
  const { moduleKey = "" } = useParams();
  const normalizedModuleKey = String(moduleKey).trim().toLowerCase();
  const matchedReportModule = REPORT_MODULE_MAP[normalizedModuleKey];

  const { data: departments = [], isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["report-departments"],
    queryFn: async () => {
      const response = await axios.get("/api/departments/get-departments");
      return Array.isArray(response?.data) ? response.data : [];
    },
  });

  const userDepartments = useMemo(
    () => (Array.isArray(auth?.user?.departments) ? auth.user.departments : []),
    [auth?.user?.departments],
  );

  const selectedDepartment = useMemo(() => {
    if (!normalizedModuleKey || matchedReportModule) {
      return null;
    }

    return (
      departments.find(
        (department) =>
          department?.isActive !== false &&
          String(department?.name || "")
            .trim()
            .toLowerCase() === normalizedModuleKey,
      ) || null
    );
  }, [departments, matchedReportModule, normalizedModuleKey]);

  const selectedModule = matchedReportModule
    ? {
        title: matchedReportModule.title,
        module: matchedReportModule.module,
        reportType: matchedReportModule.reportType,
      }
    : {
        title: `${String(selectedDepartment?.name || moduleKey || "")
          .trim()
          .toUpperCase()} Department Report`,
        module: selectedDepartment?.name || "",
        reportType: "dashboard",
      };

  const selectedDepartmentKey = String(selectedDepartment?.name || "")
    .trim()
    .toLowerCase();
  const requiredPermission =
    matchedReportModule?.permission ||
    (selectedDepartmentKey
      ? `reports_${selectedDepartmentKey.replace(/\s+/g, "_")}`
      : null);
  const isDepartmentReportRoute = !matchedReportModule;
  const hasRequiredPermission =
    !requiredPermission || permissions.includes(requiredPermission);

  const selectedDepartmentId = selectedDepartment?._id || null;
  const reportTypeForFetch = selectedModule.reportType || "app";
  // const { moduleKey = "" } = useParams();
  // const normalizedModuleKey = String(moduleKey).toLowerCase();
  // const matchedReportModule = REPORT_MODULE_MAP[normalizedModuleKey];
  // const selectedModule = matchedReportModule || {
  //   title: `${String(moduleKey || "").toUpperCase()} Department Report`,
  //   module:
  //     String(moduleKey || "")
  //       .trim()
  //       .replace(/^./, (char) => char.toUpperCase()) || "",
  // };

  // const userDepartments = Array.isArray(auth?.user?.departments)
  //   ? auth.user.departments
  //   : [];
  // const selectedDepartment = useMemo(() => {
  //   const normalizedDepartmentName = String(moduleKey || "").trim().toLowerCase();

  //   if (!normalizedDepartmentName || matchedReportModule) {
  //     return null;
  //   }

  //   return (
  //     userDepartments.find(
  //       (department) =>
  //         String(department?.name || "")
  //           .trim()
  //           .toLowerCase() === normalizedDepartmentName,
  //     ) || null
  //   );
  // }, [matchedReportModule, moduleKey, userDepartments]);

  // const selectedDepartmentId = selectedDepartment?._id || null;
  // const reportTypeForFetch = selectedDepartmentId ? "dashboard" : "app";

  const selectedDepartmentNames = useMemo(() => {
    if (selectedDepartment?.name) {
      return [selectedDepartment.name];
    }

    return userDepartments.map((dept) => dept?.name).filter(Boolean);
  }, [selectedDepartment, userDepartments]);

  const [activeReportId, setActiveReportId] = useState(null);
  const [jobStatusByReportId, setJobStatusByReportId] = useState({});
  const [downloadedByReportId, setDownloadedByReportId] = useState({});
  // Replace the useState initialization
  const [retryCooldownByReportId, setRetryCooldownByReportId] = useState(() => {
    try {
      const stored = localStorage.getItem(RETRY_COOLDOWN_STORAGE_KEY);
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      const now = Date.now();
      const scoped = parsed?.[selectedModule?.module] || {};

      return Object.fromEntries(
        Object.entries(scoped).filter(
          ([, retryAt]) => retryAt && new Date(retryAt).getTime() > now,
        ),
      );
    } catch {
      return {};
    }
  });
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

  useEffect(() => {
    setRetryCooldownByReportId({});
  }, [selectedModule?.module]);

  const handleDateRangeChange = (item) => {
    setDateRange([item.selection]);
  };

  const { data: reports = [], isLoading } = useQuery({
    queryKey: [
      "department-reports",
      selectedModule?.module,
      reportTypeForFetch,
      selectedDepartmentNames.join(","),
    ],
    queryFn: async () => {
      const response = await axios.get("/api/reports", {
        params: {
          module: selectedModule?.module,
          reportType: reportTypeForFetch,
          departments: selectedDepartmentNames.join(","),
        },
      });
      return Array.isArray(response?.data?.reports)
        ? response.data.reports
        : [];
    },
    //enabled: Boolean(selectedModule?.module),
   enabled:
      Boolean(selectedModule?.module) &&
      hasRequiredPermission &&
      (!isDepartmentReportRoute || !isDepartmentsLoading),
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

  // const toReadableHeader = (keyPath) =>
  //   String(keyPath)
  //     .split(".")
  //     .map((segment) =>
  //       segment
  //         .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  //         .replace(/[_-]+/g, " ")
  //         .replace(/\s+/g, " ")
  //         .trim()
  //         .replace(/^./, (char) => char.toUpperCase()),
  //     )
  //     .join(" - ");

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

  // const flattenObject = (obj, prefix = "") => {
  //   let result = {};

  //   Object.entries(obj || {}).forEach(([key, value]) => {
  //     const nextKey = prefix ? `${prefix}.${key}` : key;

  //     if (value === null || value === undefined) {
  //       result[nextKey] = "";
  //     } else if (Array.isArray(value)) {
  //       // skip arrays here
  //       result[nextKey] = JSON.stringify(value);
  //     } else if (typeof value === "object") {
  //       Object.assign(result, flattenObject(value, nextKey));
  //     } else {
  //       result[nextKey] = value;
  //     }
  //   });

  //   return result;
  // };

  const flattenObject = (obj, prefix = "") => {
    let result = {};

    Object.entries(obj || {}).forEach(([key, value]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        result[nextKey] = "";
      }

      // Arrays
      else if (Array.isArray(value)) {
        if (!value.length) {
          result[nextKey] = "";
        }

        // array of objects
        else if (typeof value[0] === "object") {
          result[nextKey] = value
            .map((item) => {
              return (
                item.employeeName ||
                item.firstName ||
                item.name ||
                item.email ||
                JSON.stringify(item)
              );
            })
            .join(" | ");
        }

        // primitive arrays
        else {
          result[nextKey] = value.join(" | ");
        }
      }

      // Objects
      else if (typeof value === "object") {
        Object.assign(result, flattenObject(value, nextKey));
      }

      // Primitive
      else {
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

  const handleCompletedReportResponse = (responseData, reportId) => {
    const downloadUrl =
      responseData?.downloadUrl || responseData?.fileUrl || null;

    const reportData = responseData?.data || null;
    const reportRow = reports.find((r) => r?._id === reportId);

    const hasDataPayload = (() => {
      if (!reportData) return false;

      if (Array.isArray(reportData)) {
        return reportData.length > 0;
      }

      if (typeof reportData === "object") {
        return Object.values(reportData).some((value) => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }

          if (value && typeof value === "object") {
            return Object.keys(value).length > 0;
          }

          return Boolean(value);
        });
      }

      return Boolean(reportData);
    })();

    console.info("[Reports] Completed response received", {
      reportId,
      status: responseData?.status,
      hasDataPayload,
      hasDownloadUrl: Boolean(downloadUrl),
      dataKeys:
        responseData?.data && typeof responseData.data === "object"
          ? Object.keys(responseData.data)
          : [],
      allBudgetsLength: Array.isArray(responseData?.data?.allBudgets)
        ? responseData.data.allBudgets.length
        : null,
    });

    if (!hasDataPayload && !downloadUrl) {
      setDownloadedByReportId((prev) => ({
        ...prev,
        [reportId]: false,
      }));
      toast.info("No data found for the selected filters.");
      return;
    }

    const downloadStarted =
      (hasDataPayload &&
        triggerDataDownload(reportData, reportRow?.reportName)) ||
      triggerReportDownload(downloadUrl);

    setDownloadedByReportId((prev) => ({
      ...prev,
      [reportId]: Boolean(downloadStarted),
    }));

    if (downloadStarted) {
      toast.success("Report Generated.");
    } else {
      toast.error("Report was generated, but the download failed.");
    }
  };

  const hasReportData = (reportData) => {
    if (Array.isArray(reportData)) return reportData.length > 0;
    if (reportData && typeof reportData === "object")
      return Object.keys(reportData).length > 0;
    return Boolean(reportData);
  };

  const getRetryCountdownLabel = (retryAt) => {
    if (!retryAt) return "Retry";
    const remainingMs = Math.max(0, dayjs(retryAt).diff(dayjs()));
    const minutes = Math.ceil(remainingMs / (60 * 1000));
    return minutes > 0
      ? `Generate after ${minutes} min${minutes > 1 ? "s" : ""}`
      : "Generate";
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
        handleCompletedReportResponse(response?.data, reportId);
        return;
      }

      if (status === "failed") {
        setDownloadedByReportId((prev) => ({
          ...prev,
          [reportId]: false,
        }));
        toast.error(
          response?.data?.error?.message || "Report generation failed",
        );
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
        department:
          selectedDepartmentId || reportRow?.departmentId?._id || null,
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

      let response = await axios.post("/api/reports/generate", payload);
      const responseData = response?.data;
      const responseStatus = responseData?.status;
      const jobId = responseData?.jobId;

      console.info("[Reports] Generate response received", {
        reportId: reportRow?._id,
        status: responseStatus,
        hasJobId: Boolean(jobId),
        hasData: Boolean(responseData?.data),
        hasAllBudgets: Array.isArray(responseData?.data?.allBudgets),
      });

      if (responseStatus === "completed") {
        setJobStatusByReportId((prev) => ({
          ...prev,
          [reportRow?._id]: "completed",
        }));

        handleCompletedReportResponse(responseData, reportRow?._id);
        return responseData;
      }

      if (!jobId) {
        console.error("[Reports] Unexpected generate response shape", {
          reportId: reportRow?._id,
          status: responseStatus,
          responseData,
        });
        throw new Error("Report job id was not returned by the server");
      }

      reportJobByReportIdRef.current[reportRow?._id] = jobId;

      await pollReportStatus(jobId, reportRow?._id);

      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "department-reports",
          selectedModule?.module,
          reportTypeForFetch,
          selectedDepartmentNames.join(","),
        ],
      });
    },
    onError: (error, reportRow) => {
      if (reportRow?._id) {
        setJobStatusByReportId((prev) => ({
          ...prev,
          [reportRow._id]: "failed",
        }));
        setDownloadedByReportId((prev) => ({
          ...prev,
          [reportRow._id]: false,
        }));
      }
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
    if (!selectedModule?.module || !reports.length) return;

    const storedCooldownRaw = localStorage.getItem(RETRY_COOLDOWN_STORAGE_KEY);
    if (!storedCooldownRaw) return;

    let storedCooldownByReportId = {};
    try {
      const parsedStorage = JSON.parse(storedCooldownRaw);
      storedCooldownByReportId = parsedStorage?.[selectedModule.module] || {};
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
    setJobStatusByReportId((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.keys(validCooldownByReportId).map((reportId) => [
          reportId,
          "failed",
        ]),
      ),
    }));
  }, [reports, selectedModule?.module]);

  useEffect(() => {
    if (!selectedModule?.module) return;

    const activeCooldownEntries = Object.entries(
      retryCooldownByReportId,
    ).filter(([, retryAt]) => retryAt && dayjs(retryAt).isAfter(dayjs()));

    let existingStorage = {};
    try {
      existingStorage = JSON.parse(
        localStorage.getItem(RETRY_COOLDOWN_STORAGE_KEY) || "{}",
      );
    } catch {
      existingStorage = {};
    }

    if (!activeCooldownEntries.length) {
      delete existingStorage[selectedModule.module];
      if (!Object.keys(existingStorage).length) {
        localStorage.removeItem(RETRY_COOLDOWN_STORAGE_KEY);
        return;
      }
      localStorage.setItem(
        RETRY_COOLDOWN_STORAGE_KEY,
        JSON.stringify(existingStorage),
      );
      return;
    }

    existingStorage[selectedModule.module] = Object.fromEntries(
      activeCooldownEntries,
    );

    localStorage.setItem(
      RETRY_COOLDOWN_STORAGE_KEY,
      JSON.stringify(existingStorage),
    );
  }, [retryCooldownByReportId, selectedModule?.module]);

  const columns = [
    { field: "srNo", headerName: "S.No.", maxWidth: 90 },
    { field: "reportName", headerName: "Report Name", flex: 1 },
    { field: "startDate", headerName: "Start Date", flex: 1 },
    { field: "endDate", headerName: "End Date", flex: 1 },
    {
      field: "download",
      headerName: "Download",
      cellStyle: { display: "flex", alignItems: "center" },
      flex: 1,
      cellRenderer: (params) => {
        const row = params?.data;
        const status = jobStatusByReportId[row?._id];
        const isPending =
          generateReportMutation.isPending && activeReportId === row?._id;
        const isGenerating =
          status === "pending" || status === "processing" || isPending;
        const isDownloaded = downloadedByReportId[row?._id];
        const hasDownloadFailed = status === "completed" && !isDownloaded;
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
                if (status === "failed" || hasDownloadFailed) return;
                setActiveReportId(row?._id || null);
                generateReportMutation.mutate(row);
              }}
              className="rounded bg-primary px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-400"
              disabled={
                isGenerating ||
                status === "failed" ||
                hasDownloadFailed ||
                !row?._id
              }
            >
              {primaryButtonLabel}
            </button>
            {hasDownloadFailed ? (
              <button
                type="button"
                onClick={() => {
                  setActiveReportId(row?._id || null);
                  generateReportMutation.mutate(row);
                }}
                className="rounded bg-orange-600 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:bg-orange-300"
                disabled={isGenerating || !row?._id}
              >
                Regenerate
              </button>
            ) : null}
            {/* {status === "failed" || hasCooldown ? (
              hasCooldown ? (
                <span className="rounded bg-orange-100 px-3 py-1 text-sm text-orange-700">
                  {retryLabel}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const jobId =
                      reportJobByReportIdRef.current?.[row?._id] ||
                      row?.latestJobId ||
                      row?.jobId ||
                      row?.latestJob?._id;

                    if (!jobId) {
                      toast.error(
                        "Unable to find failed job for this report. Please generate again.",
                      );
                      return;
                    }

                    reportJobByReportIdRef.current[row?._id] = jobId;
                    retryReportMutation.mutate({ reportId: row?._id, jobId });
                  }}
                  className="rounded bg-orange-600 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:bg-orange-300"
                  disabled={retryReportMutation.isPending || !row?._id}
                >
                  {retryReportMutation.isPending ? "Retrying..." : retryLabel}
                </button>
              )
            ) : null} */}

            {/* {isGenerating ? (
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
            ) : null} */}
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

  // if (!selectedModule) return null;
  if (isDepartmentReportRoute && isDepartmentsLoading) return null;

  if (isDepartmentReportRoute && !selectedDepartment) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  if (!hasRequiredPermission) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

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
