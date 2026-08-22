import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import AgTable from "../../../../components/AgTable";
import dayjs from "dayjs";
import { DateRangePicker } from "react-date-range";
import { MdCalendarToday } from "react-icons/md";
import { IoFilter } from "react-icons/io5";
import { Box, Chip, Popover, Skeleton, Tooltip } from "@mui/material";
import PageFrame from "../../../../components/Pages/PageFrame";
import HrLeavesAdvancedFilter from "./HrLeavesAdvancedFilter";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const MemoizedAgTable = React.memo(AgTable);
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
    []
  );

  const defaultFY = useMemo(() => {
    const today = dayjs();
    const currentFyStartYear =
      today.month() >= 3 ? today.year() : today.year() - 1;

    return (
      extendedFyOptions.find(
        (fy) => fy.start.getFullYear() === currentFyStartYear
      ) || extendedFyOptions[extendedFyOptions.length - 1]
    );
  }, [extendedFyOptions]);

  useEffect(() => {
    setSelectedFY(defaultFY);
    setCurrentMonth(
      dayjs().isBetween(dayjs(defaultFY.start), dayjs(defaultFY.end), "month", "[]")
        ? new Date()
        : defaultFY.start
    );
  }, [defaultFY]);

  const { data: attendanceData = {}, isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const response = await axios.get("/api/company/company-attandances");
      return response.data;
    },
  });

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
        hours: leave.hours,
        description: leave.description,
      });
      return matches;
    }, {});

    const activeUsersMap = new Map(
      (attendanceData?.activeEmployees || []).map((employee) => [
        employee?._id?.toString(),
        employee,
      ])
    );

    (attendanceData?.activeEmployees || []).forEach((employee) => {
      const userId = employee?._id?.toString();
      if (!userId) return;
      const departmentIds = (employee.departments || []).map((department) =>
        (department?._id || department)?.toString(),
      );
      if (
        appliedFilters.employee &&
        appliedFilters.employee !== userId
      ) {
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
        empId: employee.empId || "",
        empName: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
        startDate: employee.startDate,
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
      const matchesFilter =
        appliedFilters.statuses.includes(leave.status) &&
        (!appliedFilters.leaveType ||
          normalizeLeaveType(leave.leaveType) === appliedFilters.leaveType);

      const from = dayjs(leave.fromDate);
      const to = dayjs(leave.toDate);

      for (let d = from; d.isSameOrBefore(to, "day"); d = d.add(1, "day")) {
        const dateKey = d.format("YYYY-MM-DD");
        leaveMap[`${userId}-${dateKey}`] = {
          kind: "leave",
          code: leaveCode,
          leaveType: leave.leaveType,
          status: leave.status,
          hours: leave.hours,
          description: leave.description,
          fromDate: leave.fromDate,
          toDate: leave.toDate,
          matchesFilter,
        };
      }

    });

    // Compile table rows
    const finalRows = Object.entries(groupedUsers)
      .map(([userId, userInfo], index) => {
        const row = {
          srno: index + 1,
          ...userInfo,
        };

        let workedDays = 0;

        let hasData = false;

        const startDate = dayjs(userInfo?.startDate);

        displayDates.forEach((date, index) => {
          const day = index + 1;
          const key = `${userId}-${date.format("YYYY-MM-DD")}`;
          const isWeekend = date.day() === 0 || date.day() === 7;

          const beforeJoining =
            startDate.isValid() && date.isBefore(startDate, "day");

          if (leaveMap[key]) {
            row[`day${day}`] = leaveMap[key];
            hasData = true;
          } else if (attendanceMap[key]) {
            row[`day${day}`] = "✅";
            workedDays += 1;
            hasData = true;
          } else if (beforeJoining) {
            row[`day${day}`] = "N/A";
          } else if (!isWeekend) {
            row[`day${day}`] = "A";
            hasData = true;
          } else {
            row[`day${day}`] = "H";
          }
        });

        row["totalDays"] = totalOperationalDays;
        row["workedDays"] = workedDays;

        return hasData ? row : null;
      })
      .filter(Boolean);

    return finalRows;
  }, [
    appliedFilters,
    attendanceData,
    dateRange,
    displayDates,
    hasActiveLeaveCriteria,
  ]);

  const dayColumns = useMemo(() => displayDates.map((date, i) => {
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
              <div><strong>Type:</strong> {leaveDetails.leaveType || "N/A"}</div>
              <div><strong>Status:</strong> {leaveDetails.status || "N/A"}</div>
              <div>
                <strong>Date:</strong>{" "}
                {dayjs(leaveDetails.fromDate).format("DD MMM YYYY")} -{" "}
                {dayjs(leaveDetails.toDate).format("DD MMM YYYY")}
              </div>
              <div><strong>Hours:</strong> {leaveDetails.hours ?? "N/A"}</div>
              <div>
                <strong>Description:</strong> {leaveDetails.description || "N/A"}
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
                    hasActiveLeaveCriteria &&
                    (!leaveDetails || !leaveDetails.matchesFilter)
                      ? 0.3
                      : 1,
                  border:
                    hasActiveLeaveCriteria && leaveDetails?.matchesFilter
                      ? "2px solid #1E3D73"
                      : "2px solid transparent",
                  boxShadow:
                    hasActiveLeaveCriteria && leaveDetails?.matchesFilter
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
  }), [displayDates, hasActiveLeaveCriteria]);
  const columns = useMemo(() => [
    { field: "srNo", headerName: "SR No", width: 80, pinned: "left" },
    { field: "empId", headerName: "Employee ID", width: 130, pinned: "left" },
    {
      field: "empName",
      headerName: "Employee Name",
      width: 200,
      pinned: "left",
    },
    ...(hasActiveLeaveCriteria
      ? [
          {
            field: "matchedLeaves",
            headerName: "Matched Leaves",
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
                    fromDate === toDate ? fromDate : `${fromDate} - ${toDate}`;

                  return (
                    <Tooltip
                      key={leave.id || `${dateLabel}-${index}`}
                      title={
                        <div className="space-y-1 p-1 text-xs">
                          <div><strong>Type:</strong> {leave.leaveType}</div>
                          <div><strong>Status:</strong> {leave.status}</div>
                          <div><strong>Hours:</strong> {leave.hours ?? "N/A"}</div>
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
        ]
      : []),
    {
      field: "totalDays",
      headerName: "Working Days",
      width: 130,
      headerClass: "ag-center-header",
      pinned: "left",
      cellStyle: { textAlign: "center" },
    },
    {
      field: "workedDays",
      headerName: "Worked Days",
      width: 130,
      headerClass: "ag-center-header",
      pinned: "left",
      cellStyle: { textAlign: "center" },
    },
    ...dayColumns,
  ], [dayColumns, hasActiveLeaveCriteria]);

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
          label: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
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
      </div>
    </PageFrame>
  );
};

export default HrLeaves;
