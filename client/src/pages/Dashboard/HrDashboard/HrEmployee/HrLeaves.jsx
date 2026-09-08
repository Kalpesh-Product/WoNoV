import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import AgTable from "../../../../components/AgTable";
import dayjs from "dayjs";
import { DateRangePicker } from "react-date-range";
import { MdCalendarToday } from "react-icons/md";
import { IoFilter } from "react-icons/io5";
import {
  Box,
  Chip,
  Popover,
  Skeleton,
  TextField,
  Tooltip,
} from "@mui/material";
import PageFrame from "../../../../components/Pages/PageFrame";
import HrLeavesAdvancedFilter from "./HrLeavesAdvancedFilter";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import { queryClient } from "../../../../main";
import { toast } from "sonner";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const MemoizedAgTable = React.memo(AgTable);
const DAILY_WORK_HOURS = 9;
const leaveTypeOptions = [
  { label: "Priviledged", value: "privileged" },
  { label: "Sick", value: "sick" },
  { label: "Compoff", value: "compoff" },
];
const batchOptions = [
  { label: "Full Time Batch", value: "Full Time Batch" },
  { label: "Intern Batch", value: "Intern Batch" },
  { label: "Consultant Batch", value: "Consultant Batch" },
];

const toOptions = (values) =>
  values
    .filter((option) => option?.label && option?.value)
    .sort((a, b) => a.label.localeCompare(b.label))
    .filter(
      (option, index, options) =>
        options.findIndex((item) => item.value === option.value) === index,
    );

const createDefaultFilters = () => ({
  statuses: ["Pending", "Approved", "Rejected"],
  leaveType: "",
  batch: "",
  department: "",
  employee: "",
});

const normalizeLeaveType = (leaveType = "") => {
  const normalizedType = leaveType.toLowerCase().replace(/[\s-]/g, "");

  if (
    normalizedType.includes("privileged") ||
    normalizedType.includes("priviledged")
  ) {
    return "privileged";
  }
  if (normalizedType.includes("sick")) return "sick";
  if (normalizedType.includes("compoff")) return "compoff";

  return normalizedType;
};

const HrLeaves = () => {
  const axios = useAxiosPrivate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [manageLeavesOpen, setManageLeavesOpen] = useState(false);
  const [viewLeavesOpen, setViewLeavesOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaveCounts, setLeaveCounts] = useState({ privileged: "", sick: "" });
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(createDefaultFilters);
  const [dateRange, setDateRange] = useState(() => [
    {
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    },
  ]);

  // Financial year options
  const fyOptions = [
    {
      label: "FY 2024–25",
      start: new Date(2024, 3, 1), // April 1, 2024
      end: new Date(2025, 2, 31), // March 31, 2025
    },
    {
      label: "FY 2025–26",
      start: new Date(2025, 3, 1),
      end: new Date(2026, 2, 31),
    },
    {
      label: "FY 2026–27",
      start: new Date(2026, 3, 1),
      end: new Date(2027, 2, 31),
    },
  ];

  const [selectedFY, setSelectedFY] = useState(fyOptions[fyOptions.length - 1]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const extendedFyOptions = useMemo(
    () =>
      Array.from({ length: 11 }, (_, index) => {
        const startYear = 2020 + index;
        return {
          label: `FY ${startYear}-${String(startYear + 1).slice(-2)}`,
          start: new Date(startYear, 3, 1),
          end: new Date(startYear + 1, 2, 31),
        };
      }),
    [],
  );

  const defaultFY = useMemo(() => {
    const today = dayjs();
    const currentFyStartYear =
      today.month() >= 3 ? today.year() : today.year() - 1;

    return (
      extendedFyOptions.find(
        (fy) => fy.start.getFullYear() === currentFyStartYear,
      ) || extendedFyOptions[extendedFyOptions.length - 1]
    );
  }, [extendedFyOptions]);

  useEffect(() => {
    setSelectedFY(defaultFY);
    setCurrentMonth(
      dayjs().isBetween(
        dayjs(defaultFY.start),
        dayjs(defaultFY.end),
        "month",
        "[]",
      )
        ? new Date()
        : defaultFY.start,
    );
  }, [defaultFY]);

  const { data: attendanceData = {}, isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const response = await axios.get("/api/company/company-attandances");
      return response.data;
    },
  });

  const updateLeaveCountsMutation = useMutation({
    mutationFn: async ({ employeeId, leaves }) => {
      const response = await axios.patch("/api/users/employee-leaves", {
        employeeId,
        leaves,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Employee leave counts updated successfully");
      setManageLeavesOpen(false);
      setSelectedEmployee(null);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to update leave counts",
      );
    },
  });

  const openManageLeaves = useCallback((employee) => {
    const storedLeaves = employee?.leavesCount || [];
    const getCount = (type) =>
      storedLeaves.find(
        (leave) => normalizeLeaveType(leave?.leaveType) === type,
      )?.count ?? 0;

    setSelectedEmployee(employee);
    setLeaveCounts({
      privileged: String(getCount("privileged")),
      sick: String(getCount("sick")),
    });
    setManageLeavesOpen(true);
  }, []);

  const openViewLeaves = useCallback((employee) => {
    setSelectedEmployee(employee);
    setViewLeavesOpen(true);
  }, []);

  const handleLeaveCountSubmit = (event) => {
    event.preventDefault();
    const privileged = Number(leaveCounts.privileged);
    const sick = Number(leaveCounts.sick);

    if (
      !Number.isFinite(privileged) ||
      !Number.isFinite(sick) ||
      privileged < 0 ||
      sick < 0
    ) {
      toast.error("Leave counts must be valid non-negative numbers");
      return;
    }

    updateLeaveCountsMutation.mutate({
      employeeId: selectedEmployee.empId,
      leaves: [
        { leaveType: "Privileged", count: privileged },
        { leaveType: "Sick", count: sick },
      ],
    });
  };

  const remainingLeaveCounts = useMemo(() => {
    const usedLeaves = { privileged: 0, sick: 0 };
    const currentYear = dayjs().year();

    (attendanceData?.allLeaves || []).forEach((leave) => {
      const employeeId = String(leave?.takenBy?._id || leave?.takenBy || "");
      const leaveDate = dayjs(leave?.fromDate);
      const leaveType = normalizeLeaveType(leave?.leaveType);

      if (
        employeeId !== String(selectedEmployee?.userId || "") ||
        String(leave?.status || "").toLowerCase() !== "approved" ||
        !leaveDate.isValid() ||
        leaveDate.year() !== currentYear ||
        !Object.hasOwn(usedLeaves, leaveType)
      ) {
        return;
      }

      usedLeaves[leaveType] += (Number(leave?.hours) || 0) / DAILY_WORK_HOURS;
    });

    const privilegedAllotted = Number(leaveCounts.privileged || 0);
    const sickAllotted = Number(leaveCounts.sick || 0);

    return {
      privileged: {
        used: usedLeaves.privileged,
        remaining: Math.max(privilegedAllotted - usedLeaves.privileged, 0),
        overflow: Math.max(usedLeaves.privileged - privilegedAllotted, 0),
      },
      sick: {
        used: usedLeaves.sick,
        remaining: Math.max(sickAllotted - usedLeaves.sick, 0),
        overflow: Math.max(usedLeaves.sick - sickAllotted, 0),
      },
    };
  }, [attendanceData?.allLeaves, leaveCounts, selectedEmployee?.userId]);

  const viewLeaveRows = useMemo(() => {
    const rangeStart = dayjs(dateRange[0]?.startDate).startOf("day");
    const rangeEnd = dayjs(dateRange[0]?.endDate).endOf("day");

    return (attendanceData?.allLeaves || [])
      .filter((leave) => {
        const employeeId = String(leave?.takenBy?._id || leave?.takenBy || "");
        const leaveStart = dayjs(leave?.fromDate);
        const leaveEnd = dayjs(leave?.toDate || leave?.fromDate);
        return (
          employeeId === String(selectedEmployee?.userId || "") &&
          leaveStart.isValid() &&
          leaveEnd.isValid() &&
          leaveStart.isSameOrBefore(rangeEnd, "day") &&
          leaveEnd.isSameOrAfter(rangeStart, "day")
        );
      })
      .sort((first, second) =>
        dayjs(first.fromDate).diff(dayjs(second.fromDate)),
      )
      .map((leave, index) => ({
        srNo: index + 1,
        fromDate: dayjs(leave.fromDate).format("DD-MM-YYYY"),
        toDate: dayjs(leave.toDate || leave.fromDate).format("DD-MM-YYYY"),
        leaveType: leave.leaveType || "N/A",
        leavePeriod: leave.leavePeriod || "N/A",
        hours: leave.hours ?? "N/A",
        description: leave.description || "N/A",
        status: leave.status || "N/A",
      }));
  }, [attendanceData?.allLeaves, dateRange, selectedEmployee?.userId]);

  const viewLeaveColumns = useMemo(
    () => [
      { field: "srNo", headerName: "Sr No", width: 80 },
      { field: "fromDate", headerName: "From Date", width: 130 },
      { field: "toDate", headerName: "To Date", width: 130 },
      { field: "leaveType", headerName: "Leave Type", width: 150 },
      { field: "leavePeriod", headerName: "Leave Period", width: 140 },
      { field: "hours", headerName: "Hours", width: 90 },
      { field: "description", headerName: "Description", minWidth: 220, flex: 1 },
      { field: "status", headerName: "Status", width: 120 },
    ],
    [],
  );

  const generateMonthOptions = (startDate, endDate) => {
    const months = [];
    let date = dayjs(startDate);

    while (date.isSameOrBefore(endDate, "month")) {
      months.push({
        label: date.format("MMM-YY"),
        value: date.format("YYYY-MM"),
      });
      date = date.add(1, "month");
    }

    return months;
  };

  const handlePrevMonth = () => {
    const newMonth = dayjs(currentMonth).subtract(1, "month").toDate();
    if (newMonth >= selectedFY.start) setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = dayjs(currentMonth).add(1, "month").toDate();
    if (newMonth <= selectedFY.end) setCurrentMonth(newMonth);
  };

  const displayDates = useMemo(() => {
    const dates = [];
    let date = dayjs(dateRange[0].startDate).startOf("day");
    const endDate = dayjs(dateRange[0].endDate).startOf("day");

    while (date.isSameOrBefore(endDate, "day")) {
      dates.push(date);
      date = date.add(1, "day");
    }
    return dates;
  }, [dateRange]);

  const hasActiveLeaveCriteria =
    appliedFilters.statuses.length < 3 || Boolean(appliedFilters.leaveType);

  const tableData = useMemo(() => {
    const groupedUsers = {};
    const totalOperationalDays = displayDates.filter(
      (date) => date.day() !== 0,
    ).length;
    const rangeStart = dayjs(dateRange[0].startDate).startOf("day");
    const rangeEnd = dayjs(dateRange[0].endDate).endOf("day");
    const filteredLeaves = (attendanceData?.allLeaves || []).filter((leave) => {
      const overlapsRange =
        dayjs(leave.fromDate).isSameOrBefore(rangeEnd) &&
        dayjs(leave.toDate).isSameOrAfter(rangeStart);
      const matchesStatus = appliedFilters.statuses.includes(leave.status);
      const matchesType =
        !appliedFilters.leaveType ||
        normalizeLeaveType(leave.leaveType) === appliedFilters.leaveType;

      return overlapsRange && matchesStatus && matchesType;
    });
    const matchingLeaveUsers = new Set(
      filteredLeaves.map((leave) => leave.takenBy?._id?.toString()),
    );
    const matchingLeavesByUser = filteredLeaves.reduce((matches, leave) => {
      const userId = leave.takenBy?._id?.toString();
      if (!userId) return matches;

      if (!matches[userId]) matches[userId] = [];
      matches[userId].push({
        id: leave._id,
        code:
          normalizeLeaveType(leave.leaveType) === "sick"
            ? "SL"
            : normalizeLeaveType(leave.leaveType) === "compoff"
              ? "CO"
              : "PL",
        leaveType: leave.leaveType,
        status: leave.status,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        leavePeriod: leave.leavePeriod,
        hours: leave.hours,
        description: leave.description,
      });
      return matches;
    }, {});

    const activeUsersMap = new Map(
      (attendanceData?.activeEmployees || []).map((employee) => [
        employee?._id?.toString(),
        employee,
      ]),
    );

    (attendanceData?.activeEmployees || []).forEach((employee) => {
      const userId = employee?._id?.toString();
      if (!userId) return;
      const departmentIds = (employee.departments || []).map((department) =>
        (department?._id || department)?.toString(),
      );
      if (appliedFilters.employee && appliedFilters.employee !== userId) {
        return;
      }
      if (
        appliedFilters.batch &&
        employee.payrollInformation?.payrollBatch !== appliedFilters.batch
      ) {
        return;
      }
      if (
        appliedFilters.department &&
        !departmentIds.includes(appliedFilters.department)
      ) {
        return;
      }
      if (hasActiveLeaveCriteria && !matchingLeaveUsers.has(userId)) return;

      groupedUsers[userId] = {
        userId,
        empId: employee.empId || "",
        empName:
          `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
        startDate: employee.startDate,
        leavesCount: employee.employeeType?.leavesCount || [],
        matchedLeaves: matchingLeavesByUser[userId] || [],
      };
    });

    // Attendance map
    const attendanceMap = {};
    attendanceData?.companyAttandances?.forEach((entry) => {
      const userId = entry.user?._id?.toString();
      if (!userId || !activeUsersMap.has(userId)) return;
      const dateKey = dayjs(entry.inTime).format("YYYY-MM-DD");
      attendanceMap[`${userId}-${dateKey}`] = "✅";
    });

    // Leave map
    const leaveMap = {};
    (attendanceData?.allLeaves || []).forEach((leave) => {
      const userId = leave.takenBy?._id?.toString();
      if (!userId || !groupedUsers[userId]) return;
      const leaveCode = leave.leaveType?.toLowerCase().includes("sick")
        ? "SL"
        : leave.leaveType?.toLowerCase().includes("comp")
          ? "CO"
          : "PL";
      const from = dayjs(leave.fromDate);
      const to = dayjs(leave.toDate);

      for (let d = from; d.isSameOrBefore(to, "day"); d = d.add(1, "day")) {
        const dateKey = d.format("YYYY-MM-DD");
        leaveMap[`${userId}-${dateKey}`] = {
          id: leave._id?.toString(),
          kind: "leave",
          code: leaveCode,
          leaveType: leave.leaveType,
          leavePeriod: leave.leavePeriod,
          status: leave.status,
          hours: leave.hours,
          description: leave.description,
          fromDate: leave.fromDate,
          toDate: leave.toDate,
        };
      }
    });

    // Compile table rows
    const finalRows = Object.entries(groupedUsers)
      .map(([userId, userInfo], index) => {
        const row = {
          srNo: index + 1,
          ...userInfo,
        };

        let workedDays = 0;

        let hasData = false;

        const startDate = dayjs(userInfo?.startDate);

        displayDates.forEach((date, index) => {
          const day = index + 1;
          const key = `${userId}-${date.format("YYYY-MM-DD")}`;
          const hasAttendance = Boolean(attendanceMap[key]);
          const isWeekend = date.day() === 0 || date.day() === 7;

          const beforeJoining =
            startDate.isValid() && date.isBefore(startDate, "day");

          if (leaveMap[key]) {
            row[`day${day}`] = leaveMap[key];
            hasData = true;
          } else if (hasAttendance) {
            row[`day${day}`] = "✅";
            hasData = true;
          } else if (beforeJoining) {
            row[`day${day}`] = "N/A";
          } else if (!isWeekend) {
            row[`day${day}`] = "A";
            hasData = true;
          } else {
            row[`day${day}`] = "H";
          }

          // A partial leave with attendance represents half a worked day.
          // Other attendance records continue to count as one worked day.
          if (hasAttendance) {
            const isPartialLeave =
              leaveMap[key]?.leavePeriod?.toLowerCase() === "partial";
            workedDays += isPartialLeave ? 0.5 : 1;
          }
        });

        row["totalDays"] = totalOperationalDays;
        row["workedDays"] = workedDays;

        return hasData ? row : null;
      })
      .filter(Boolean);

    if (!hasActiveLeaveCriteria) return finalRows;

    return finalRows
      .flatMap((row) =>
        row.matchedLeaves
          .slice()
          .sort((first, second) =>
            dayjs(first.fromDate).diff(dayjs(second.fromDate)),
          )
          .map((leave) => ({
            ...row,
            leaveRecordId: leave.id,
            fromDate: leave.fromDate,
            toDate: leave.toDate,
            leaveType: leave.leaveType,
            leavePeriod: leave.leavePeriod,
            leaveHours: leave.hours,
            leaveStatus: leave.status,
            leaveDescription: leave.description,
          })),
      )
      .map((row, index) => ({ ...row, srNo: index + 1 }));
  }, [
    appliedFilters,
    attendanceData,
    dateRange,
    displayDates,
    hasActiveLeaveCriteria,
  ]);

  const dayColumns = useMemo(
    () =>
      displayDates.map((date, i) => {
        const dayOfWeek = date.format("ddd");
        const isSunday = dayOfWeek === "Sun";

        return {
          field: `day${i + 1}`,
          headerName: isSunday ? "SUN" : date.format("D"),
          width: 80,
          cellStyle: { textAlign: "center" },
          headerTooltip: `${date.format("dddd, MMM D")}`,
          cellRenderer: (params) => {
            const value = params.value;
            const leaveDetails = value?.kind === "leave" ? value : null;
            const displayValue = leaveDetails?.code || value;
            const isSelectedLeave =
              hasActiveLeaveCriteria &&
              leaveDetails?.id === params.data?.leaveRecordId?.toString();

            let bgColor = "";
            let textColor = "";
            let label = "";
            let tooltip = "";

            switch (displayValue) {
              case "A":
                bgColor = "#fee2e2"; // light red
                textColor = "#991b1b"; // dark red
                label = "A";
                tooltip = "Absent";
                break;
              case "✅":
                bgColor = "#d1fae5"; // light green
                textColor = "#065f46"; // dark green
                label = "P";
                tooltip = "Present";
                break;
              case "PL":
                bgColor = "#fee2e2"; // light red
                textColor = "#991b1b"; // dark red
                label = "PL";
                tooltip = "Privileged Leave";
                break;
              case "CO":
                bgColor = "#fee2e2"; // light red
                textColor = "#991b1b"; // dark red
                label = "CO";
                tooltip = "Comp Off";
                break;
              case "SL":
                bgColor = "#fee2e2";
                textColor = "#991b1b";
                label = "SL";
                tooltip = "Sick Leave";
                break;
              case "H":
                bgColor = "#dbeafe"; // light blue
                textColor = "#1e3a8a"; // dark blue
                label = "H";
                tooltip = "Public Holiday";
                break;
              case "N/A":
                bgColor = "#f3f4f6"; // gray
                textColor = "#6b7280"; // muted
                label = "N/A";
                tooltip = "Not Applicable";
                break;
              default:
                return null;
            }

            if (leaveDetails) {
              tooltip = (
                <div className="space-y-1 p-1 text-xs">
                  <div>
                    <strong>Type:</strong> {leaveDetails.leaveType || "N/A"}
                  </div>
                  <div>
                    <strong>Status:</strong> {leaveDetails.status || "N/A"}
                  </div>
                  <div>
                    <strong>Date:</strong>{" "}
                    {dayjs(leaveDetails.fromDate).format("DD MMM YYYY")} -{" "}
                    {dayjs(leaveDetails.toDate).format("DD MMM YYYY")}
                  </div>
                  <div>
                    <strong>Hours:</strong> {leaveDetails.hours ?? "N/A"}
                  </div>
                  <div>
                    <strong>Description:</strong>{" "}
                    {leaveDetails.description || "N/A"}
                  </div>
                </div>
              );
            }

            return (
              <div className="py-2">
                <Tooltip title={tooltip}>
                  <Box
                    sx={{
                      bgcolor: bgColor,
                      color: textColor,
                      fontSize: "0.75rem",
                      px: 0.8,
                      borderRadius: "6px",
                      textAlign: "center",
                      fontWeight: 500,
                      width: "100%",
                      opacity:
                        hasActiveLeaveCriteria && !isSelectedLeave ? 0.3 : 1,
                      border: isSelectedLeave
                        ? "2px solid #1E3D73"
                        : "2px solid transparent",
                      boxShadow: isSelectedLeave
                        ? "0 0 0 2px rgba(30, 61, 115, 0.14)"
                        : "none",
                    }}
                  >
                    {label}
                  </Box>
                </Tooltip>
              </div>
            );
          },
        };
      }),
    [displayDates, hasActiveLeaveCriteria],
  );

  const processLeaveExportCell = useCallback((params) => {
    const field = params?.column?.getColDef?.()?.field || "";
    const value = params?.value;

    if (field === "fromDate" || field === "toDate") {
      return value && dayjs(value).isValid()
        ? dayjs(value).format("DD-MM-YYYY")
        : "";
    }

    if (/^day\d+$/.test(field)) {
      if (value?.kind === "leave") {
        const rowLeaveId = params?.node?.data?.leaveRecordId?.toString();
        if (rowLeaveId && value.id !== rowLeaveId) return "";
        return value.code || "";
      }
      if (value === "✅") return "P";
      if (value === "N/A" || value === null || value === undefined) return "";
      return String(value);
    }

    return undefined;
  }, []);

  const columns = useMemo(
    () => [
      { field: "srNo", headerName: "SR No", width: 80, pinned: "left" },
      { field: "empId", headerName: "Employee ID", width: 130, pinned: "left" },
      {
        field: "empName",
        headerName: "Employee Name",
        width: 175,
        pinned: "left",
      },
      ...(hasActiveLeaveCriteria
        ? [
            {
              field: "actionMatchedLeaves",
              headerName: "Matched Leaves",
              hide: true,
              width: 300,
              minWidth: 260,
              pinned: "left",
              lockPinned: true,
              autoHeight: true,
              sortable: false,
              filter: false,
              cellRenderer: (params) => (
                <div className="flex flex-col gap-1 py-2">
                  {(params.value || []).map((leave, index) => {
                    const fromDate = dayjs(leave.fromDate).format("DD MMM");
                    const toDate = dayjs(leave.toDate).format("DD MMM");
                    const dateLabel =
                      fromDate === toDate
                        ? fromDate
                        : `${fromDate} - ${toDate}`;

                    return (
                      <Tooltip
                        key={leave.id || `${dateLabel}-${index}`}
                        title={
                          <div className="space-y-1 p-1 text-xs">
                            <div>
                              <strong>Type:</strong> {leave.leaveType}
                            </div>
                            <div>
                              <strong>Status:</strong> {leave.status}
                            </div>
                            <div>
                              <strong>Hours:</strong> {leave.hours ?? "N/A"}
                            </div>
                            <div>
                              <strong>Description:</strong>{" "}
                              {leave.description || "N/A"}
                            </div>
                          </div>
                        }
                      >
                        <div className="rounded-md bg-[#e8eef8] px-2 py-1 text-xs font-pmedium text-primary">
                          {dateLabel} · {leave.code} · {leave.status || "N/A"}
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              ),
            },
            {
              field: "fromDate",
              headerName: "From Date",
              width: 140,
              valueFormatter: (params) =>
                params.value ? dayjs(params.value).format("DD-MM-YYYY") : "N/A",
            },
            {
              field: "toDate",
              headerName: "To Date",
              width: 140,
              valueFormatter: (params) =>
                params.value ? dayjs(params.value).format("DD-MM-YYYY") : "N/A",
            },
            { field: "leaveType", headerName: "Leave Type", width: 150 },
            { field: "leavePeriod", headerName: "Leave Period", width: 140 },
            { field: "leaveHours", headerName: "Hours", width: 100 },
            {
              field: "leaveDescription",
              headerName: "Description",
              minWidth: 220,
              flex: 1,
              valueFormatter: (params) => params.value || "N/A",
            },
            { field: "leaveStatus", headerName: "Status", width: 130 },
          ]
        : []),
      {
        field: "totalDays",
        headerName: "Working Days",
        width: 115,
        headerClass: "ag-center-header",
        pinned: "left",
        cellStyle: { textAlign: "center" },
      },
      {
        field: "workedDays",
        headerName: "Worked Days",
        width: 115,
        headerClass: "ag-center-header",
        pinned: "left",
        cellStyle: { textAlign: "center" },
      },
      ...dayColumns,
      {
        field: "actions",
        headerName: "Action",
        width: 100,
        pinned: "right",
        lockPinned: true,
        sortable: false,
        filter: false,
        suppressCsvExport: true,
        cellRenderer: (params) => (
          <ThreeDotMenu
            rowId={params.data.userId}
            menuItems={[
              {
                label: "View Leaves",
                onClick: () => openViewLeaves(params.data),
              },
              {
                label: "Manage Leaves",
                onClick: () => openManageLeaves(params.data),
              },
            ]}
          />
        ),
      },
    ],
    [dayColumns, hasActiveLeaveCriteria, openManageLeaves, openViewLeaves],
  );

  const departmentOptions = useMemo(
    () =>
      toOptions(
        (attendanceData?.activeEmployees || []).flatMap((employee) =>
          (employee.departments || []).map((department) => ({
            label: department?.name,
            value: (department?._id || department)?.toString(),
          })),
        ),
      ),
    [attendanceData?.activeEmployees],
  );
  const employeeOptions = useMemo(
    () =>
      toOptions(
        (attendanceData?.activeEmployees || []).map((employee) => ({
          label:
            `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
          value: employee._id?.toString(),
        })),
      ),
    [attendanceData?.activeEmployees],
  );
  const getOptionLabel = (options, value) =>
    options.find((option) => option.value === value)?.label || value;
  const activeFilterChips = [
    ...(appliedFilters.statuses.length < 3
      ? [
          {
            key: "statuses",
            label: `Status: ${appliedFilters.statuses.join(", ") || "None"}`,
          },
        ]
      : []),
    ...(appliedFilters.leaveType
      ? [
          {
            key: "leaveType",
            label: `Leave Type: ${getOptionLabel(
              leaveTypeOptions,
              appliedFilters.leaveType,
            )}`,
          },
        ]
      : []),
    ...(appliedFilters.batch
      ? [
          {
            key: "batch",
            label: `Batch: ${getOptionLabel(
              batchOptions,
              appliedFilters.batch,
            )}`,
          },
        ]
      : []),
    ...(appliedFilters.department
      ? [
          {
            key: "department",
            label: `Department: ${getOptionLabel(
              departmentOptions,
              appliedFilters.department,
            )}`,
          },
        ]
      : []),
    ...(appliedFilters.employee
      ? [
          {
            key: "employee",
            label: `Employee: ${getOptionLabel(
              employeeOptions,
              appliedFilters.employee,
            )}`,
          },
        ]
      : []),
  ];
  const removeAppliedFilter = (key) => {
    setAppliedFilters((current) => ({
      ...current,
      [key]: key === "statuses" ? createDefaultFilters().statuses : "",
    }));
  };
  const selectedRange = dateRange[0];
  const rangeLabel = `${dayjs(selectedRange.startDate).format(
    "DD MMM YYYY",
  )} - ${dayjs(selectedRange.endDate).format("DD MMM YYYY")}`;
  const displayTableData = useMemo(
    () =>
      tableData.map((data, index) => ({
        srNo: index + 1,
        ...data,
      })),
    [tableData],
  );

  return (
    <PageFrame>
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div>
            <span className="text-title text-primary font-pmedium uppercase">
              LEAVES
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="rounded-md border border-primary px-4 py-2 text-sm text-primary">
              {rangeLabel}
            </div>
            <button
              type="button"
              onClick={(event) => setCalendarAnchor(event.currentTarget)}
              className="rounded-md bg-primary p-2.5 text-white"
              aria-label="Select leave date range"
            >
              <MdCalendarToday size={19} />
            </button>
            <Popover
              open={Boolean(calendarAnchor)}
              anchorEl={calendarAnchor}
              onClose={() => setCalendarAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <DateRangePicker
                ranges={dateRange}
                onChange={(item) => setDateRange([item.selection])}
                moveRangeOnFirstSelection={false}
                direction="vertical"
              />
            </Popover>
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="rounded-full border border-borderGray p-2.5 text-primary hover:bg-gray-100"
              aria-label="Open advanced leave filters"
            >
              <IoFilter size={19} />
            </button>
          </div>
        </div>

        {activeFilterChips.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-pmedium text-primary">
              Active filters:
            </span>
            {activeFilterChips.map((filter) => (
              <Chip
                key={filter.key}
                size="small"
                label={filter.label}
                onDelete={() => removeAppliedFilter(filter.key)}
                sx={{ backgroundColor: "#e8eef8", color: "#1E3D73" }}
              />
            ))}
            <button
              type="button"
              onClick={() => setAppliedFilters(createDefaultFilters())}
              className="text-sm font-pmedium text-primary underline"
            >
              Clear all
            </button>
          </div>
        )}

        {!isLoading ? (
          <MemoizedAgTable
            data={displayTableData}
            columns={columns}
            search={true}
            searchColumn="empName"
            exportData
            hideFilter
            processExportCell={processLeaveExportCell}
          />
        ) : (
          <Skeleton width={"100%"} height={600} />
        )}

        <HrLeavesAdvancedFilter
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          value={appliedFilters}
          onApply={(filters) => {
            setAppliedFilters(filters);
            setFilterOpen(false);
          }}
          leaveTypes={leaveTypeOptions}
          batches={batchOptions}
          departments={departmentOptions}
          employees={employeeOptions}
        />

        <MuiModal
          open={viewLeavesOpen}
          onClose={() => {
            setViewLeavesOpen(false);
            setSelectedEmployee(null);
          }}
          title={`Leave Details: ${selectedEmployee?.empName || "Employee"}`}
          widthClass="w-4/5"
        >
          <div className="flex flex-col gap-4">
            <TextField
              size="small"
              label="Date Range"
              value={rangeLabel}
              disabled
              fullWidth
            />
            <MemoizedAgTable
              data={viewLeaveRows}
              columns={viewLeaveColumns}
              search
              hideFilter
              hideTitle
              tableHeight={360}
            />
          </div>
        </MuiModal>

        <MuiModal
          open={manageLeavesOpen}
          onClose={() => {
            if (updateLeaveCountsMutation.isPending) return;
            setManageLeavesOpen(false);
            setSelectedEmployee(null);
          }}
          title="Manage Leaves"
        >
          <form
            onSubmit={handleLeaveCountSubmit}
            className="flex flex-col gap-5"
          >
            <div>
              <p className="text-sm text-gray-500">Employee</p>
              <p className="font-pmedium text-primary">
                {selectedEmployee?.empName || "N/A"}
                {selectedEmployee?.empId ? ` (${selectedEmployee.empId})` : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                type="number"
                size="small"
                fullWidth
                required
                label="Privileged Leaves"
                value={leaveCounts.privileged}
                onChange={(event) =>
                  setLeaveCounts((current) => ({
                    ...current,
                    privileged: event.target.value,
                  }))
                }
                inputProps={{ min: 0, step: 0.5 }}
              />
              <TextField
                size="small"
                fullWidth
                disabled
                label="Used Privileged Leaves"
                value={Number(remainingLeaveCounts.privileged.used.toFixed(2))}
              />
              <TextField
                size="small"
                fullWidth
                disabled
                label="Remaining Privileged Leaves"
                value={Number(
                  remainingLeaveCounts.privileged.remaining.toFixed(2),
                )}
              />
              <TextField
                size="small"
                fullWidth
                disabled
                label="Overflow Privileged Leaves"
                value={Number(
                  remainingLeaveCounts.privileged.overflow.toFixed(2),
                )}
              />
              <TextField
                type="number"
                size="small"
                fullWidth
                required
                label="Sick Leaves"
                value={leaveCounts.sick}
                onChange={(event) =>
                  setLeaveCounts((current) => ({
                    ...current,
                    sick: event.target.value,
                  }))
                }
                inputProps={{ min: 0, step: 0.5 }}
              />
              <TextField
                size="small"
                fullWidth
                disabled
                label="Used Sick Leaves"
                value={Number(remainingLeaveCounts.sick.used.toFixed(2))}
              />
              <TextField
                size="small"
                fullWidth
                disabled
                label="Remaining Sick Leaves"
                value={Number(remainingLeaveCounts.sick.remaining.toFixed(2))}
              />
              <TextField
                size="small"
                fullWidth
                disabled
                label="Overflow Sick Leaves"
                value={Number(remainingLeaveCounts.sick.overflow.toFixed(2))}
              />
            </div>
            <div className="flex justify-end">
              <PrimaryButton
                title="Update Leaves"
                type="submit"
                isLoading={updateLeaveCountsMutation.isPending}
              />
            </div>
          </form>
        </MuiModal>
      </div>
    </PageFrame>
  );
};

export default HrLeaves;
