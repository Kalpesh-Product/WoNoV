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
import humanTime from "../../utils/humanTime";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { downloadCsv } from "../../utils/downloadCsv";
import { queryClient } from "../../main";
import useAuth from "../../hooks/useAuth";
import useUserPermissions from "../../hooks/useUserPermissions";
import { Task } from "@mui/icons-material";
import { State } from "country-state-city";

const getStateName = (stateValue) => {
  if (!stateValue) return stateValue;

  const normalizedStateValue = String(stateValue).trim();
  const state = State.getStateByCodeAndCountry(
    normalizedStateValue.toUpperCase(),
    "IN",
  );

  return state?.name || normalizedStateValue;
};

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
    const formatParticularEntry = (item) => {
      if (!item || typeof item !== "object") return "";

      const parts = [];

      if (
        item.particularName !== undefined &&
        item.particularName !== null &&
        item.particularName !== ""
      ) {
        parts.push(`Particular Name:${item.particularName}`);
      }

      if (
        item.particularAmount !== undefined &&
        item.particularAmount !== null &&
        item.particularAmount !== ""
      ) {
        parts.push(`Particular Amount:${item.particularAmount}`);
      }

      return parts.join(", ");
    };

    const formatParticularString = (value) => {
      if (typeof value !== "string" || !value.includes("particularName")) {
        return value;
      }

      const matches = value.match(/\{[^{}]*"particularName"[^{}]*\}/g);
      if (!Array.isArray(matches) || !matches.length) {
        return value;
      }

      const formatted = matches
        .map((entry) => {
          try {
            return formatParticularEntry(JSON.parse(entry));
          } catch {
            return "";
          }
        })
        .filter(Boolean);

      return formatted.length ? formatted.join(" | ") : value;
    };

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
              if (item && typeof item === "object") {
                const formattedParticular = formatParticularEntry(item);
                if (formattedParticular) {
                  return formattedParticular;
                }
              }

              return (
                item.employeeName ||
                item.firstName ||
                item.name ||
                item.email ||
                formatParticularString(JSON.stringify(item))
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
        result[nextKey] =
          typeof value === "string" ? formatParticularString(value) : value;
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

  const mergeTicketCsvFields = (rows = []) => {
    if (normalizedModuleKey !== "ticket") return rows;

    return rows.map((row) => {
      const fromDepartment = Array.isArray(row?.raisedBy?.departments)
        ? row.raisedBy.departments
            .map((department) => department?.name || "")
            .filter(Boolean)
            .join(", ")
        : String(row?.["raisedBy.departments"] || "").trim();
      const raisedByFirstName = String(
        row?.raisedBy?.firstName || row?.["raisedBy.firstName"] || "",
      ).trim();
      const raisedByLastName = String(
        row?.raisedBy?.lastName || row?.["raisedBy.lastName"] || "",
      ).trim();
      const raisedByName = [raisedByFirstName, raisedByLastName]
        .filter(Boolean)
        .join(" ");
      const rejectedByFirstName = String(
        row?.reject?.rejectedBy?.firstName ||
          row?.["reject.rejectedBy.firstName"] ||
          "",
      ).trim();
      const rejectedByLastName = String(
        row?.reject?.rejectedBy?.lastName ||
          row?.["reject.rejectedBy.lastName"] ||
          "",
      ).trim();
      const rejectedByName = [rejectedByFirstName, rejectedByLastName]
        .filter(Boolean)
        .join(" ");
      const acceptedByFirstName = String(
        row?.acceptedBy?.firstName || row?.["acceptedBy.firstName"] || "",
      ).trim();
      const acceptedByLastName = String(
        row?.acceptedBy?.lastName || row?.["acceptedBy.lastName"] || "",
      ).trim();
      const acceptedByName = [acceptedByFirstName, acceptedByLastName]
        .filter(Boolean)
        .join(" ");
      const closedByFirstName = String(
        row?.closedBy?.firstName || row?.["closedBy.firstName"] || "",
      ).trim();
      const closedByLastName = String(
        row?.closedBy?.lastName || row?.["closedBy.lastName"] || "",
      ).trim();
      const closedByName = [closedByFirstName, closedByLastName]
        .filter(Boolean)
        .join(" ");
      const assignToName = Array.isArray(row?.assignedTo)
        ? row.assignedTo
            .map((assignment) =>
              [
                assignment?.assignee?.firstName ||
                  assignment?.firstName ||
                  assignment?.["assignee.firstName"],
                assignment?.assignee?.lastName ||
                  assignment?.lastName ||
                  assignment?.["assignee.lastName"],
              ]
                .filter(Boolean)
                .join(" ")
                .trim(),
            )
            .filter(Boolean)
            .join(", ")
        : [
            row?.assignedTo?.assignee?.firstName ||
              row?.assignedTo?.firstName ||
              row?.["assignedTo.assignee.firstName"] ||
              row?.["assignedTo.firstName"],
            row?.assignedTo?.assignee?.lastName ||
              row?.assignedTo?.lastName ||
              row?.["assignedTo.assignee.lastName"] ||
              row?.["assignedTo.lastName"],
          ]
            .filter(Boolean)
            .join(" ")
            .trim();
      const escalatedToDepartmentName = Array.isArray(row?.escalatedTo)
        ? row.escalatedTo
            .map((escalation) =>
              String(
                escalation?.raisedToDepartment?.name ||
                  escalation?.["raisedToDepartment.name"] ||
                  "",
              ).trim(),
            )
            .filter(Boolean)
            .join(", ")
        : String(
            row?.escalatedTo?.raisedToDepartment?.name ||
              row?.["escalatedTo.raisedToDepartment.name"] ||
              "",
          ).trim();
      const escalatedStatus = Array.isArray(row?.escalatedTo)
        ? row.escalatedTo
            .map((escalation) => String(escalation?.status || "").trim())
            .filter(Boolean)
            .join(", ")
        : String(
            row?.escalatedTo?.status || row?.["escalatedTo.status"] || "",
          ).trim();
      const escalatedRaisedAt = Array.isArray(row?.escalatedTo)
        ? row.escalatedTo
            .map((escalation) => escalation?.createdAt || "")
            .filter(Boolean)
            .join(", ")
        : row?.escalatedTo?.createdAt || row?.["escalatedTo.createdAt"] || "";
      const rejectReason = String(
        row?.reject?.reason || row?.["reject.reason"] || "",
      ).trim();
      const rejectAt = row?.reject?.rejectedAt || row?.["reject.rejectedAt"] || "";

      const nextRow = { ...row };

      if (raisedByName) {
        nextRow.raisedBy = raisedByName;
      }

      if (fromDepartment) {
        nextRow.fromDepartment = fromDepartment;
      }

      if (rejectedByName) {
        nextRow.rejectedBy = rejectedByName;
      }

      if (acceptedByName) {
        nextRow.acceptedBy = acceptedByName;
      }

      if (closedByName) {
        nextRow.closedBy = closedByName;
      }

      if (assignToName) {
        nextRow.assignedTo = assignToName;
      }

      if (rejectReason) {
        nextRow.rejectReason = rejectReason;
      }

      if (rejectAt) {
        nextRow.rejectAt = rejectAt;
      }

      if (row?.ticket) {
        nextRow.ticketTitle = row.ticket;
      }

      const raisedToDepartmentName = String(
        row?.raisedToDepartment?.name || row?.["raisedToDepartment.name"] || "",
      ).trim();

      if (raisedToDepartmentName) {
        nextRow.raisedToDepartment = raisedToDepartmentName;
      }

      delete nextRow["raisedBy.firstName"];
      delete nextRow["raisedBy.lastName"];
      delete nextRow["raisedBy.departments"];
      delete nextRow["acceptedBy.firstName"];
      delete nextRow["acceptedBy.lastName"];
      delete nextRow["closedBy.firstName"];
      delete nextRow["closedBy.lastName"];
      delete nextRow["assignedTo.assignee"];
      delete nextRow["assignedTo.assignee.firstName"];
      delete nextRow["assignedTo.assignee.lastName"];
      delete nextRow["assignedTo.assignedAt"];
      delete nextRow["assignedTo.firstName"];
      delete nextRow["assignedTo.lastName"];
      delete nextRow["escalatedTo.raisedToDepartment"];
      delete nextRow["escalatedTo.raisedToDepartment.name"];
      delete nextRow["escalatedTo.status"];
      delete nextRow["escalatedTo.createdAt"];
      delete nextRow.escalatedTo;

      if (escalatedToDepartmentName) {
        nextRow.escalatedTo = escalatedToDepartmentName;
      }

      if (escalatedStatus) {
        nextRow.escalatedStatus = escalatedStatus;
      }

      if (escalatedRaisedAt) {
        nextRow.raisedAt = escalatedRaisedAt;
      }

      delete nextRow["raisedToDepartment.name"];
      delete nextRow.assignees;
      delete nextRow["assignees.firstName"];
      delete nextRow["assignees.lastName"];
      delete nextRow.image;
      delete nextRow["image.url"];
      delete nextRow["image.filename"];
      delete nextRow["image.path"];
      delete nextRow["image.mimetype"];
      delete nextRow.ticket;
      delete nextRow["reject.reason"];
      delete nextRow["reject.rejectedAt"];
      delete nextRow["reject.rejectedBy"];
      delete nextRow["reject.rejectedBy.firstName"];
      delete nextRow["reject.rejectedBy.lastName"];
      delete nextRow.reject;

      return nextRow;
    });
  };

  const mergeTaskCsvFields = (rows = [], reportName = "") => {
    if (normalizedModuleKey !== "task") return rows;

    const isMyTaskReport = String(reportName).trim().toLowerCase().includes("my task");
    const isDepartmentTaskReport = String(reportName)
      .trim()
      .toLowerCase()
      .includes("department task");
    const formatTaskTime = (value) => {
      if (!value) return value;

      const formattedTime = humanTime(value);
      return formattedTime === "Invalid date" ? value : formattedTime;
    };

    return rows.map((row) => {
      const assignedByFirstName = String(
        row?.assignedBy?.firstName || row?.["assignedBy.firstName"] || "",
      ).trim();
      const assignedByLastName = String(
        row?.assignedBy?.lastName || row?.["assignedBy.lastName"] || "",
      ).trim();
      const assignedByName = [assignedByFirstName, assignedByLastName]
        .filter(Boolean)
        .join(" ");
      const assignedToName = (() => {
        if (Array.isArray(row?.assignedTo)) {
          return row.assignedTo
            .map((person) =>
              [person?.firstName, person?.lastName].filter(Boolean).join(" ").trim(),
            )
            .filter(Boolean)
            .join(", ");
        }

        if (row?.assignedTo && typeof row.assignedTo === "object") {
          return [row.assignedTo.firstName, row.assignedTo.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
        }

        const firstName = String(row?.["assignedTo.firstName"] || "").trim();
        const lastName = String(row?.["assignedTo.lastName"] || "").trim();

        return [firstName, lastName].filter(Boolean).join(" ").trim();
      })();
      const unitNo = String(
        row?.location?.unitNo || row?.["location.unitNo"] || "",
      ).trim();
      const unitName = String(
        row?.location?.unitName || row?.["location.unitName"] || "",
      ).trim();
      const buildingName = String(
        row?.location?.building?.buildingName ||
          row?.["location.building.buildingName"] ||
          "",
      ).trim();
      const formattedDueTime = formatTaskTime(
        row?.dueTime || row?.["dueTime"],
      );
      const formattedCompletedTime =
        isMyTaskReport || isDepartmentTaskReport
        ? formatTaskTime(row?.completedDate || row?.["completedDate"])
        : "";

      if (
        !assignedByName &&
        !assignedToName &&
        !unitNo &&
        !unitName &&
        !buildingName &&
        !formattedDueTime &&
        !formattedCompletedTime
      ) {
        return row;
      }

      const nextRow = { ...row };

      delete nextRow.isDeleted;

      if (assignedByName) {
        nextRow.assignedBy = assignedByName;
      }

      if (assignedToName) {
        nextRow.assignedTo = assignedToName;
      }

      if (unitNo) {
        nextRow.unitNo = unitNo;
      }

      if (unitName) {
        nextRow.unitName = unitName;
      }

      if (buildingName) {
        nextRow.buildingName = buildingName;
      }

      if (formattedDueTime) {
        nextRow.dueTime = formattedDueTime;
      }

      if (formattedCompletedTime) {
        nextRow.completedTime = formattedCompletedTime;
      }

      if (isMyTaskReport) {
        delete nextRow.assignedTo;
        delete nextRow["assignedTo.firstName"];
        delete nextRow["assignedTo.lastName"];
      }

      delete nextRow.location;
      delete nextRow["location.unitNo"];
      delete nextRow["location.unitName"];
      delete nextRow["location.building"];
      delete nextRow["location.building.buildingName"];
      delete nextRow["assignedBy.firstName"];
      delete nextRow["assignedBy.lastName"];
      delete nextRow["location.building._id"];
      delete nextRow["location._id"];

      return nextRow;
    });
  };

  const mergeMeetingCsvFields = (rows = []) => {
    if (normalizedModuleKey !== "meeting") return rows;

    const formatMeetingTime = (value) => {
      if (!value) return value;

      const formattedTime = humanTime(value);
      return formattedTime === "Invalid date" ? value : formattedTime;
    };

    return rows.map((row) => ({
      ...row,
      startTime: formatMeetingTime(row?.startTime),
      endTime: formatMeetingTime(row?.endTime),
      extendTime: formatMeetingTime(row?.extendTime),
    }));
  };

  const mergeVisitorCsvFields = (rows = []) => {
    if (normalizedModuleKey !== "visitor") return rows;

    return rows.map((row) => {
      const nextRow = { ...row };
      const checkedInByName = [
        row?.checkedInBy?.firstName || row?.["checkedInBy.firstName"] || "",
        row?.checkedInBy?.lastName || row?.["checkedInBy.lastName"] || "",
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const checkedOutByName = [
        row?.checkedOutBy?.firstName || row?.["checkedOutBy.firstName"] || "",
        row?.checkedOutBy?.lastName || row?.["checkedOutBy.lastName"] || "",
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const toMeetName = [
        row?.toMeet?.firstName || row?.["toMeet.firstName"] || "",
        row?.toMeet?.lastName || row?.["toMeet.lastName"] || "",
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const toMeetCompanyClientName = String(
        row?.["toMeetCompany.clientName"] ||
          row?.toMeetCompany?.clientName ||
          row?.toMeetCompany?.companyName ||
          row?.toMeetCompany?.name ||
          row?.toMeetCompany ||
          "",
      ).trim();
      const clientToMeetEmployeeName = String(
        row?.["clientToMeet.employeeName"] ||
          row?.clientToMeet?.employeeName ||
          row?.clientToMeet ||
          "",
      ).trim();
      const departmentName = String(
        row?.["department.name"] || row?.department?.name || row?.department || "",
      ).trim();
      const unitNo = String(
        row?.["unit.unitNo"] || row?.unit?.unitNo || row?.unitNo || "",
      ).trim();
      const unitName = String(
        row?.["unit.unitName"] || row?.unit?.unitName || row?.unitName || "",
      ).trim();
      const buildingName = String(
        row?.["unit.building.buildingName"] ||
          row?.unit?.building?.buildingName ||
          row?.building?.buildingName ||
          row?.buildingName ||
          "",
      ).trim();
      const stateName = getStateName(row?.state);

      if (checkedInByName) {
        nextRow.checkedInBy = checkedInByName;
      }

      if (checkedOutByName) {
        nextRow.checkedOutBy = checkedOutByName;
      }

      if (toMeetName) {
        nextRow.toMeet = toMeetName;
      }

      if (toMeetCompanyClientName) {
        nextRow["toMeetCompany.clientName"] = toMeetCompanyClientName;
      }

      if (clientToMeetEmployeeName) {
        nextRow["clientToMeet.employeeName"] = clientToMeetEmployeeName;
      }

      if (departmentName) {
        nextRow["department.name"] = departmentName;
      }

      if (unitNo) {
        nextRow.unitNo = unitNo;
      }

      if (unitName) {
        nextRow.unitName = unitName;
      }

      if (buildingName) {
        nextRow.buildingName = buildingName;
      }

      if (stateName) {
        nextRow.state = stateName;
      }

      delete nextRow["checkedInBy.firstName"];
      delete nextRow["checkedInBy.lastName"];
      delete nextRow["checkedOutBy.firstName"];
      delete nextRow["checkedOutBy.lastName"];
      delete nextRow["toMeet.firstName"];
      delete nextRow["toMeet.lastName"];
      delete nextRow["unit.unitNo"];
      delete nextRow["unit.unitName"];
      delete nextRow["unit.building.buildingName"];
      delete nextRow.toMeetCompany;
      delete nextRow.clientToMeet;
      delete nextRow.meeting;
      delete nextRow.department;
      

    

      return nextRow;
    });
  };

  const mergeAssetCsvFields = (rows = []) => {
    if (normalizedModuleKey !== "asset") return rows;

    return rows.map((row) => {
      const nextRow = { ...row };
       const assignedAssetApprovedByName = [
        row?.assignedAsset?.approvedBy?.firstName ||
          row?.["assignedAsset.approvedBy.firstName"] ||
          "",
        row?.assignedAsset?.approvedBy?.lastName ||
          row?.["assignedAsset.approvedBy.lastName"] ||
          "",
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
       const assignedAssetAssignedByName = [
        row?.assignedAsset?.assignedBy?.firstName ||
          row?.["assignedAsset.assignedBy.firstName"] ||
          "",
        row?.assignedAsset?.assignedBy?.lastName ||
          row?.["assignedAsset.assignedBy.lastName"] ||
          "",
      ]
        .filter(Boolean)
        .join(" ")
        .trim();  
      const assignedAssetRejectededByName = [
        row?.assignedAsset?.rejectededBy?.firstName ||
          row?.["assignedAsset.rejectededBy.firstName"] ||
          "",
        row?.assignedAsset?.rejectededBy?.lastName ||
          row?.["assignedAsset.rejectededBy.lastName"] ||
          "",
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const assignedAssetAssigneeName = [
        row?.assignedAsset?.assignee?.firstName ||
          row?.["assignedAsset.assignee.firstName"] ||
          "",
        row?.assignedAsset?.assignee?.lastName ||
          row?.["assignedAsset.assignee.lastName"] ||
          "",
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const assignedAssetUnitNo = String(
        row?.assignedAsset?.location?.unitNo ||
          row?.["assignedAsset.location.unitNo"] ||
          "",
      ).trim();
      const assignedAssetUnitName = String(
        row?.assignedAsset?.location?.unitName ||
          row?.["assignedAsset.location.unitName"] ||
          "",
      ).trim();
      const assignedAssetBuildingName = String(
        row?.assignedAsset?.location?.building?.buildingName ||
          row?.["assignedAsset.location.building.buildingName"] ||
          "",
      ).trim();
      const categoryName = String(
        row?.category?.categoryName || row?.["category.categoryName"] || "",
      ).trim();

      if (categoryName) {
        nextRow.category = categoryName;
      }

      if (row?.assetId) {
        nextRow.assetNo = row.assetId;
      }

      if (row?.name) {
        nextRow.assetName = row.name;
      }

      if (row?.warranty !== undefined && row?.warranty !== null && row?.warranty !== "") {
        nextRow.warrantyMonth = row.warranty;
      }

      const addedByName = [
        row?.createdBy?.firstName || row?.["createdBy.firstName"] || auth?.user?.firstName,
        row?.createdBy?.lastName || row?.["createdBy.lastName"] || auth?.user?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const fallbackAddedBy =
        addedByName ||
        row?.createdBy?.name ||
        row?.["createdBy.name"] ||
        auth?.user?.name ||
        "";

      if (fallbackAddedBy) {
        nextRow.addedBy = fallbackAddedBy;
      }

      if (row?.createdAt) {
        nextRow.addedAt = row.createdAt;
      }

      nextRow.quantity =
        Number.isFinite(Number(row?.quantity)) && Number(row?.quantity) > 0
          ? Number(row.quantity)
          : 1;

      const subCategoryName = String(
        row?.subCategory?.subCategoryName || row?.["subCategory.subCategoryName"] || "",
      ).trim();

      if (subCategoryName) {
        nextRow.subCategory = subCategoryName;
      }

      const unitNo = String(
        row?.location?.unitNo || row?.["location.unitNo"] || "",
      ).trim();
      const unitName = String(
        row?.location?.unitName || row?.["location.unitName"] || "",
      ).trim();
      const buildingName = String(
        row?.location?.building?.buildingName ||
          row?.["location.building.buildingName"] ||
          "",
      ).trim();

      if (unitNo) {
        nextRow.unitNo = unitNo;
      }

      if (unitName) {
        nextRow.unitName = unitName;
      }

      if (buildingName) {
        nextRow.buildingName = buildingName;
      }

      if (nextRow.assignedAsset && typeof nextRow.assignedAsset === "object") {
        nextRow.assignedAsset = { ...nextRow.assignedAsset };
        delete nextRow.assignedAsset.asset;

        if (assignedAssetApprovedByName) {
          nextRow.assignedAsset.approvedBy = assignedAssetApprovedByName;
        }
         if (assignedAssetAssignedByName) {
          nextRow.assignedAsset.assignedBy = assignedAssetAssignedByName;
        }

        // if (assignedAssetRejectededByName) {
        //   nextRow.assignedAsset.rejectededBy = assignedAssetRejectededByName;
        // }
        if (assignedAssetRejectededByName) {
          nextRow.assignedAsset["Rejected By"] = assignedAssetRejectededByName;
          delete nextRow.assignedAsset.rejectededBy;
        }

        if (assignedAssetAssigneeName) {
          nextRow.assignedAsset.assignee = assignedAssetAssigneeName;
        }

        if (assignedAssetUnitNo) {
          nextRow.assignedAsset.unitNo = assignedAssetUnitNo;
        }

        if (assignedAssetUnitName) {
          nextRow.assignedAsset.unitName = assignedAssetUnitName;
        }

        if (assignedAssetBuildingName) {
          nextRow.assignedAsset.buildingName = assignedAssetBuildingName;
        }

        delete nextRow.assignedAsset.location;
      }

      if (
        nextRow.assignedAsset === null ||
        nextRow.assignedAsset === undefined ||
        typeof nextRow.assignedAsset !== "object"
      ) {
        delete nextRow.assignedAsset;
      }

      if (nextRow.vendor && typeof nextRow.vendor === "object") {
        nextRow.vendor = { ...nextRow.vendor };
        delete nextRow.vendor.departmentId;
      }

      delete nextRow["category._id"];
      delete nextRow["category.categoryName"];
      delete nextRow.createdAt;
      delete nextRow["createdBy.firstName"];
      delete nextRow["createdBy.lastName"];
      delete nextRow["createdBy.name"];
      delete nextRow.location;
      delete nextRow["location._id"];
      delete nextRow["location.unitNo"];
      delete nextRow["location.unitName"];
      delete nextRow["location.building"];
      delete nextRow["location.building._id"];
      delete nextRow["location.building.buildingName"];
      delete nextRow["subCategory._id"];
      delete nextRow["subCategory.subCategoryName"];
      delete nextRow.assetId;
      delete nextRow.name;
      delete nextRow.warranty;
      delete nextRow.departmentAssetId;
      delete nextRow["vendor.departmentId.name"];
      delete nextRow["assignedAsset.asset"];
      delete nextRow["assignedAsset.approvedBy.firstName"];
      delete nextRow["assignedAsset.approvedBy.lastName"];
      delete nextRow["assignedAsset.assignedBy.firstName"];
      delete nextRow["assignedAsset.assignedBy.lastName"];
      delete nextRow["assignedAsset.rejectededBy.firstName"];
      delete nextRow["assignedAsset.rejectededBy.lastName"];
      delete nextRow["assignedAsset.assignee.firstName"];
      delete nextRow["assignedAsset.assignee.lastName"];
      delete nextRow["assignedAsset.location.unitNo"];
      delete nextRow["assignedAsset.location.unitName"];
      delete nextRow["assignedAsset.location.building"];
      delete nextRow["assignedAsset.location.building.buildingName"];

      return nextRow;
    });
  };

  const mergePerformanceCsvFields = (rows = [], reportName = "") => {
    if (normalizedModuleKey !== "performance") return rows;

    const normalizedReportName = String(reportName).trim().toLowerCase();
    const isIndividualKpaReport =
      normalizedReportName.includes("individual kpa report");
    const isDepartmentKpaReport =
      normalizedReportName.includes("department kpa report") ||
      normalizedReportName.includes("departments kpa report");
    const isIndividualKraReport =
      normalizedReportName.includes("individual kra report");
    const isDepartmentKraReport =
      normalizedReportName.includes("department kra report") ||
      normalizedReportName.includes("departments kra report");

    if (
      !isIndividualKpaReport &&
      !isDepartmentKpaReport &&
      !isIndividualKraReport &&
      !isDepartmentKraReport
    ) {
      return rows;
    }

    const formatPerformanceTime = (value) => {
      const formattedTime = humanTime(value);

      if (
        !formattedTime ||
        formattedTime === "Invalid date" ||
        formattedTime === "â€”"
      ) {
        return "";
      }

      return formattedTime;
    };

    return rows.map((row) => {
      const nextRow = { ...row };
      const formattedDueTime = formatPerformanceTime(
        row?.dueDate || row?.["dueDate"],
      );
      const formattedCompletedTime = formatPerformanceTime(
        row?.completionDate || row?.["completionDate"],
      );

      if (formattedDueTime) {
        nextRow.dueTime = formattedDueTime;
      }

      if (formattedCompletedTime) {
        nextRow.completedTime = formattedCompletedTime;
      }

      return nextRow;
    });
  };

  const appendReportSerialNumbers = (reportData, reportName = "") => {
    const rows = Array.isArray(reportData)
      ? reportData
      : normalizeReportRows(reportData);
    const normalizedRows = mergeVisitorCsvFields(
      mergeAssetCsvFields(
        mergeMeetingCsvFields(
          mergePerformanceCsvFields(
            mergeTaskCsvFields(mergeTicketCsvFields(rows), reportName),
            reportName,
          ),
        ),
      ),
    );

    const reorderTimeColumns = (inputRow) => {
      const entries = Object.entries(inputRow || {});
      const reorderedEntries = [];
      const dueTimeValue = inputRow?.dueTime;
      const completedTimeValue = inputRow?.completedTime;
      let dueTimeInserted = false;
      let completedTimeInserted = false;

      entries.forEach(([key, value]) => {
        if (key === "dueTime" || key === "completedTime") {
          return;
        }

        reorderedEntries.push([key, value]);

        if (key === "dueDate" && !dueTimeInserted && dueTimeValue !== undefined) {
          reorderedEntries.push(["dueTime", dueTimeValue]);
          dueTimeInserted = true;
        }

        if (
          (key === "completedDate" || key === "completionDate") &&
          !completedTimeInserted &&
          completedTimeValue !== undefined
        ) {
          reorderedEntries.push(["completedTime", completedTimeValue]);
          completedTimeInserted = true;
        }
      });

      if (!dueTimeInserted && dueTimeValue !== undefined) {
        reorderedEntries.push(["dueTime", dueTimeValue]);
      }

      if (!completedTimeInserted && completedTimeValue !== undefined) {
        reorderedEntries.push(["completedTime", completedTimeValue]);
      }

      return Object.fromEntries(reorderedEntries);
    };

    return normalizedRows.map((row, index) => {
      const sanitizedRow = {
        ...row,
        dueTime:
          row?.dueTime === "â€”" || row?.dueTime === "—" ? "" : row?.dueTime,
        completedTime:
          row?.completedTime === "â€”" || row?.completedTime === "—"
            ? ""
            : row?.completedTime,
      };
      const orderedRow = reorderTimeColumns(sanitizedRow);

      if (normalizedModuleKey === "ticket" && row?.ticketTitle) {
        const { ticketTitle, ...restRow } = orderedRow;

        return {
          "Sr.No": index + 1,
          ticketTitle,
          ...restRow,
        };
      }

      return {
        "Sr.No": index + 1,
        ...orderedRow,
      };
    });
  };

  const triggerDataDownload = (reportData, reportName) => {
    const normalizedReportName = String(reportName || "").trim().toLowerCase();
    const hiddenFields = [];

    if (
      normalizedModuleKey === "performance" &&
      (normalizedReportName.includes("individual kpa report") ||
        normalizedReportName.includes("individual kra report") ||
        normalizedReportName.includes("department kpa report") ||
        normalizedReportName.includes("departments kpa report") ||
        normalizedReportName.includes("department kra report") ||
        normalizedReportName.includes("departments kra report"))
    ) {
      hiddenFields.push("roleTaskId");
    }

    if (
      normalizedModuleKey === "performance" &&
      (normalizedReportName.includes("individual kra report") ||
        normalizedReportName.includes("department kra report") ||
        normalizedReportName.includes("departments kra report"))
    ) {
      hiddenFields.push("kpaDuration");
    }

    if (normalizedModuleKey === "visitor") {
      hiddenFields.push(
        /^toMeetCompany$/,
        /^toMeetCompany\.companyName$/,
        /^toMeetCompany\.name$/,
        /^clientToMeet$/,
        /^clientToMeet\.email$/,
        /^meeting$/,
        /^department$/,
        /^unit$/,
        /^unit\.unitNo$/,
        /^unit\.unitName$/,
        /^unit\.building$/,
        /^unit\.building\.buildingName$/,
      );
    }

    return downloadCsv({
      data: appendReportSerialNumbers(reportData, reportName),
      fileName: reportName,
      hiddenFields,
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
