import React, { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import AgTable from "../../../../components/AgTable";
import dayjs from "dayjs";
import SecondaryButton from "../../../../components/SecondaryButton";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Box, MenuItem, Skeleton, TextField, Tooltip } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PageFrame from "../../../../components/Pages/PageFrame";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import MuiModal from "../../../../components/MuiModal";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../../../../constants/pagination";
const DAILY_WORK_HOURS = 9;

const getLocalMonthBoundary = (value, endOfMonth = false) => {
  const month = dayjs(value);
  const boundary = endOfMonth ? month.endOf("month") : month.startOf("month");

  return boundary.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
};

const HrAttendance = () => {
  const axios = useAxiosPrivate();

  const fyOptions = [
    {
      label: "FY 2024–25",
      start: new Date(2024, 3, 1),
      end: new Date(2025, 2, 31),
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
  const [manageAttendanceOpen, setManageAttendanceOpen] = useState(false);
  const [viewAttendanceOpen, setViewAttendanceOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceMonth, setAttendanceMonth] = useState(() =>
    dayjs().format("YYYY-MM"),
  );
  const [editableWorkedDays, setEditableWorkedDays] = useState(0);
  const [attendanceSaveAttempted, setAttendanceSaveAttempted] = useState(false);
const [pagination, setPagination] = useState({ page: 1, limit: DEFAULT_PAGE_SIZE, total: 0 });
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
       setPagination((current) => ({ ...current, page: 1 }));
    setCurrentMonth(
      dayjs().isBetween(dayjs(defaultFY.start), dayjs(defaultFY.end), "month", "[]")
        ? new Date()
        : defaultFY.start
    );
  }, [defaultFY]);

  const { data: attendanceData = {}, isLoading } = useQuery({
     queryKey: [
      "hr-attendance",
      currentMonth,
      pagination.page,
      pagination.limit,
    ],
    queryFn: async () => {
     const response = await axios.get("/api/company/company-attandances", {
        params: {
          startDate: getLocalMonthBoundary(currentMonth),
          endDate: getLocalMonthBoundary(currentMonth, true),
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      const responsePagination = response.data?.pagination;

      setPagination((current) => ({
        page: Number(responsePagination?.page) || current.page,
        limit: Number(responsePagination?.limit) || current.limit,
        total: Number(responsePagination?.total) || 0,
      }));
      return response.data;
    },
     placeholderData: keepPreviousData,
  });

  const formattedMonth = dayjs(currentMonth).format("MMMM YYYY");

  const { data: attendanceDetails = {}, isLoading: attendanceDetailsLoading } =
    useQuery({
      queryKey: [
        "employee-attendance-details",
        selectedEmployee?.userId,
        attendanceMonth,
      ],
      queryFn: async () => {
        const month = dayjs(`${attendanceMonth}-01`);
        const response = await axios.get("/api/company/company-attandances", {
          params: {
            employeeId: selectedEmployee.userId,
            startDate: getLocalMonthBoundary(month),
            endDate: getLocalMonthBoundary(month, true),
          },
        });
        return response.data;
      },
      enabled:
        (manageAttendanceOpen || viewAttendanceOpen) &&
        Boolean(selectedEmployee?.userId),
    });

  const attendanceSummary = useMemo(() => {
    const monthStart = dayjs(`${attendanceMonth}-01`).startOf("month");
    const monthEnd = monthStart.endOf("month");
    const yearStart = monthStart.startOf("year");
    const employeeId = selectedEmployee?.userId;

    const attendanceHours = (attendanceDetails?.companyAttandances || [])
      .filter(
        (entry) => String(entry?.user?._id || entry?.user) === employeeId,
      )
      .reduce((total, entry) => {
        const inTime = dayjs(entry?.inTime);
        const outTime = dayjs(entry?.outTime);
        if (!inTime.isValid() || !outTime.isValid() || outTime.isBefore(inTime)) {
          return total;
        }
        return total + outTime.diff(inTime, "minute") / 60;
      }, 0);

    let weeklyOffs = 0;
    for (
      let date = monthStart;
      date.isSameOrBefore(monthEnd, "day");
      date = date.add(1, "day")
    ) {
      if (date.day() === 0) weeklyOffs += 1;
    }

    const holidayDates = new Set();
    (attendanceDetails?.holidays || []).forEach((holiday) => {
      let date = dayjs(holiday?.start).startOf("day");
      const eventEnd = dayjs(holiday?.end || holiday?.start).endOf("day");
      if (!date.isValid() || !eventEnd.isValid()) return;

      const boundedStart = date.isBefore(monthStart) ? monthStart : date;
      const boundedEnd = eventEnd.isAfter(monthEnd) ? monthEnd : eventEnd;
      for (
        date = boundedStart;
        date.isSameOrBefore(boundedEnd, "day");
        date = date.add(1, "day")
      ) {
        holidayDates.add(date.format("YYYY-MM-DD"));
      }
    });

    const approvedEmployeeLeaves = (attendanceDetails?.allLeaves || []).filter(
      (leave) => {
        const leaveEmployeeId = String(leave?.takenBy?._id || leave?.takenBy);
        return (
          leaveEmployeeId === employeeId &&
          String(leave?.status || "").toLowerCase() === "approved"
        );
      },
    );

    const leaveHours = approvedEmployeeLeaves
      .filter((leave) => {
        const overlapsMonth =
          dayjs(leave?.fromDate).isSameOrBefore(monthEnd, "day") &&
          dayjs(leave?.toDate).isSameOrAfter(monthStart, "day");
        return overlapsMonth;
      })
      .reduce((total, leave) => total + (Number(leave?.hours) || 0), 0);

    const normalizeLeaveType = (value) => {
      const type = String(value || "").trim().toLowerCase();
      if (type.includes("sick")) return "sick";
      if (
        type.includes("privileged") ||
        type.includes("priviledged") ||
        type.includes("abrupt")
      ) {
        return "privileged";
      }
      return null;
    };

    const employee = (attendanceDetails?.activeEmployees || []).find(
      (entry) => String(entry?._id) === employeeId,
    );
    const allottedLeaves = { sick: 0, privileged: 0 };
    (employee?.employeeType?.leavesCount || []).forEach((leave) => {
      const category = normalizeLeaveType(leave?.leaveType);
      if (category) allottedLeaves[category] += Number(leave?.count) || 0;
    });

    const usedBeforeMonth = { sick: 0, privileged: 0 };
    const usedThroughMonth = { sick: 0, privileged: 0 };
    approvedEmployeeLeaves.forEach((leave) => {
      const category = normalizeLeaveType(leave?.leaveType);
      const leaveDate = dayjs(leave?.fromDate);
      if (
        !category ||
        !leaveDate.isValid() ||
        leaveDate.isBefore(yearStart, "day") ||
        leaveDate.isAfter(monthEnd, "day")
      ) {
        return;
      }

      const leaveDays = (Number(leave?.hours) || 0) / DAILY_WORK_HOURS;
      usedThroughMonth[category] += leaveDays;
      if (leaveDate.isBefore(monthStart, "day")) {
        usedBeforeMonth[category] += leaveDays;
      }
    });

    const lop = Number(
      Object.keys(allottedLeaves)
        .reduce((total, category) => {
          const overflowBefore = Math.max(
            usedBeforeMonth[category] - allottedLeaves[category],
            0,
          );
          const overflowThrough = Math.max(
            usedThroughMonth[category] - allottedLeaves[category],
            0,
          );
          return total + Math.max(overflowThrough - overflowBefore, 0);
        }, 0)
        .toFixed(2),
    );

    const attendanceDays = Number(
      (attendanceHours / DAILY_WORK_HOURS).toFixed(2),
    );
    const weekdayHolidayCount = [...holidayDates].filter(
      (date) => dayjs(date).day() !== 0,
    ).length;
    const timeOff = Number((leaveHours / DAILY_WORK_HOURS).toFixed(2));
    const totalWorkingDays =
      monthEnd.date() - weeklyOffs - weekdayHolidayCount;

    return {
      workingDays: attendanceDays,
      totalWorkingDays,
      expectedWorkedDays: Number((totalWorkingDays - timeOff).toFixed(2)),
      weeklyOffs,
      holidays: holidayDates.size,
      overtime: 0,
      timeOff,
      lop,
    };
  }, [attendanceDetails, attendanceMonth, selectedEmployee?.userId]);

  useEffect(() => {
    if (!manageAttendanceOpen || attendanceDetailsLoading) return;
    setEditableWorkedDays(attendanceSummary.workingDays);
  }, [
    attendanceDetailsLoading,
    attendanceMonth,
    attendanceSummary.workingDays,
    manageAttendanceOpen,
    selectedEmployee?.userId,
  ]);

  const workedDaysMatch =
    Number(editableWorkedDays) === attendanceSummary.expectedWorkedDays;
  const workedDaysDifference = Number(
    (
      attendanceSummary.expectedWorkedDays - Number(editableWorkedDays || 0)
    ).toFixed(2),
  );

  const openManageAttendance = (employee) => {
    setSelectedEmployee(employee);
    setAttendanceMonth(dayjs(currentMonth).format("YYYY-MM"));
    setAttendanceSaveAttempted(false);
    setManageAttendanceOpen(true);
  };
  const openViewAttendance = (employee) => {
    setSelectedEmployee(employee);
    setAttendanceMonth(dayjs(currentMonth).format("YYYY-MM"));
    setViewAttendanceOpen(true);
  };
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

  const daysInMonth = dayjs(currentMonth).daysInMonth();
  const currentMonthNum = dayjs(currentMonth).month();
  const currentYearNum = dayjs(currentMonth).year();

  const workingDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => {
    const date = dayjs(new Date(currentYearNum, currentMonthNum, i + 1));
    const day = date.day();
    return day !== 0 && day !== 6;
  }).filter(Boolean).length;

  const tableData = useMemo(() => {
    const groupedUsers = {};
    const attendanceMap = {};

    const activeUsersMap = new Map(
      (attendanceData?.activeEmployees || []).map((employee) => [
        employee?._id?.toString(),
        employee,
      ])
    );

    (attendanceData?.activeEmployees || []).forEach((employee) => {
      const userId = employee?._id?.toString();
      if (!userId) return;

      groupedUsers[userId] = {
        userId,
        empId: employee.empId || "",
        empName: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
        startDate: employee.startDate,
      };
    });

    attendanceData?.companyAttandances?.forEach((entry) => {
      const userId = entry.user?._id?.toString();
      if (!userId || !activeUsersMap.has(userId)) return;
      const dateKey = dayjs(entry.inTime).format("YYYY-MM-DD");
      const inTime = dayjs(entry.inTime);
      const outTime = dayjs(entry.outTime);
      const workedHours = outTime.diff(inTime, "minute") / 60;

      attendanceMap[`${userId}-${dateKey}`] = Number(workedHours.toFixed(2));

      if (!groupedUsers[userId]) {
        groupedUsers[userId] = {
          userId,
          empId: entry.user?.empId,
          empName: `${entry.user?.firstName || ""} ${entry.user?.lastName || ""
            }`.trim(),
          startDate: entry.user?.startDate,
        };
      }
    });

    const leaveMap = {};
    attendanceData?.allLeaves?.forEach((leave) => {
      const userId = leave.takenBy?._id?.toString();
      if (!userId || !activeUsersMap.has(userId)) return;
      const leaveType = leave.leaveType?.toLowerCase().includes("sick")
        ? "SL"
        : "PL";

      const from = dayjs(leave.fromDate);
      const to = dayjs(leave.toDate);

      for (let d = from; d.isSameOrBefore(to, "day"); d = d.add(1, "day")) {
        const dateKey = d.format("YYYY-MM-DD");
        leaveMap[`${userId}-${dateKey}`] = leaveType;
      }

      if (!groupedUsers[userId]) {
        groupedUsers[userId] = {
          userId,
          empId: leave.takenBy?.empId || "",
          empName: `${leave.takenBy?.firstName || ""} ${leave.takenBy?.lastName || ""
            }`.trim(),
          startDate: leave.takenBy?.startDate,
        };
      }
    });

    const finalRows = Object.entries(groupedUsers)
      .map(([userId, userInfo], index) => {
        const row = {
          srNo: (pagination.page - 1) * pagination.limit + index + 1,
          ...userInfo,
        };

        let totalWorkedHours = 0;
        let hasData = false;

        const startDate = dayjs(userInfo?.startDate);

        for (let day = 1; day <= daysInMonth; day++) {
          const date = dayjs(new Date(currentYearNum, currentMonthNum, day));
          const key = `${userId}-${date.format("YYYY-MM-DD")}`;
          const isWeekend = date.day() === 0 || date.day() === 7;
          const beforeJoining =
            startDate.isValid() && date.isBefore(startDate, "day");

          if (beforeJoining) {
            row[`day${day}`] = "N/A";
          } else if (attendanceMap[key]) {
            const worked = attendanceMap[key];
            row[`day${day}`] = worked;
            totalWorkedHours += worked;
            hasData = true;
          } else if (leaveMap[key]) {
            row[`day${day}`] = leaveMap[key];
            hasData = true;
          } else if (!isWeekend) {
            row[`day${day}`] = "A";
            hasData = true;
          } else {
            row[`day${day}`] = "H";
          }
        }

        row["totalHours"] = DAILY_WORK_HOURS * workingDaysInMonth;
        row["workedHours"] = Number(totalWorkedHours.toFixed(2));

        return hasData ? row : null;
      })
      .filter(Boolean);

    return finalRows;
  }, [
    attendanceData,
    currentMonthNum,
    currentYearNum,
    daysInMonth,
    pagination.limit,
    pagination.page,
    workingDaysInMonth,
  ]);

  const dayColumns = Array.from({ length: daysInMonth }, (_, i) => {
    const date = dayjs(new Date(currentYearNum, currentMonthNum, i + 1));
    const isSunday = date.format("ddd") === "Sun";

    return {
      field: `day${i + 1}`,
      headerName: isSunday ? "SUN" : `${i + 1}`,
      width: 80,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-center-header",
      headerTooltip: date.format("dddd, MMM D"),
      cellRenderer: (params) => {
        const value = params.value;

        if (typeof value === "number") {
          const workedHours = value.toFixed(2);
          return (
            <div className="py-2">
              <Tooltip title={`Present - worked ${workedHours} hours`}>
                <Box
                  sx={{
                    bgcolor: "#d1fae5",
                    color: "#065f46",
                    fontSize: "0.75rem",
                    px: 1,
                    borderRadius: "6px",
                    textAlign: "center",
                    fontWeight: 500,
                    width: "100%",
                  }}
                >
                  P
                </Box>
              </Tooltip>
            </div>
          );
        }

        const statusStyles = {
          A: ["#fee2e2", "#991b1b", "Absent"],
          PL: ["#fee2e2", "#991b1b", "Privileged Leave"],
          SL: ["#fee2e2", "#991b1b", "Sick Leave"],
          H: ["#dbeafe", "#1e3a8a", "Public Holiday"],
          "N/A": ["#f3f4f6", "#6b7280", "Not Applicable"],
        };
        const style = statusStyles[value];
        if (!style) return null;

        return (
          <div className="py-2">
            <Tooltip title={style[2]}>
              <Box
                sx={{
                  bgcolor: style[0],
                  color: style[1],
                  fontSize: "0.75rem",
                  px: 0.8,
                  borderRadius: "6px",
                  textAlign: "center",
                  fontWeight: 500,
                  width: "100%",
                }}
              >
                {value}
              </Box>
            </Tooltip>
          </div>
        );
      },
    };
  });

  const columns = [
    { field: "srNo", headerName: "SR No", width: 80, pinned: "left" },
    { field: "empId", headerName: "Employee ID", width: 130, pinned: "left" },
    {
      field: "empName",
      headerName: "Employee Name",
      width: 200,
      pinned: "left",
    },
    {
      field: "totalHours",
      headerName: "Total Hours",
      width: 100,
      headerTooltip: "Total Hours",
      headerClass: "ag-center-header",
      cellStyle: { textAlign: "center" },
      pinned: "left",
    },
    {
      field: "workedHours",
      headerName: "Worked Hours",
      headerTooltip: "Worked Hours",
      width: 100,
      headerClass: "ag-center-header",
      cellStyle: { textAlign: "center" },
      pinned: "left",
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
              label: "View Attendance",
              onClick: () => openViewAttendance(params.data),
            },
            {
              label: "Manage Attendance",
              onClick: () => openManageAttendance(params.data),
            },
          ]}
        />
      ),
    },
  ];

  const formatBreakDuration = (duration) => {
    const totalSeconds = Math.max(0, Math.round((Number(duration) || 0) * 60));
    if (totalSeconds < 60) return `${totalSeconds} sec`;
    const totalMinutes = Math.round(totalSeconds / 60);
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
  };

  const viewAttendanceRows = (attendanceDetails?.companyAttandances || [])
    .slice()
    .sort((a, b) => new Date(a.inTime) - new Date(b.inTime))
    .map((entry, index) => {
      const inTime = dayjs(entry.inTime);
      const outTime = dayjs(entry.outTime);
      const workedMinutes =
        inTime.isValid() && outTime.isValid() && !outTime.isBefore(inTime)
          ? outTime.diff(inTime, "minute")
          : null;
      return {
        srNo: index + 1,
        date: inTime.isValid() ? inTime.format("DD-MM-YYYY") : "N/A",
        inTime: inTime.isValid() ? inTime.format("h:mm a") : "N/A",
        outTime: outTime.isValid() ? outTime.format("h:mm a") : "N/A",
        workHours:
          workedMinutes === null
            ? "N/A"
            : `${Math.floor(workedMinutes / 60)} hr ${workedMinutes % 60} min`,
        breakHours: formatBreakDuration(entry.breakDuration),
        status: entry.status || "N/A",
      };
    });

  const viewAttendanceColumns = [
    { field: "srNo", headerName: "Sr No", width: 80 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "inTime", headerName: "In Time", flex: 1 },
    { field: "outTime", headerName: "Out Time", flex: 1 },
    { field: "workHours", headerName: "Work Hours", flex: 1 },
    { field: "breakHours", headerName: "Break Hours", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
  ];

  const isMonthWithinFY =
    dayjs(currentMonth).isSameOrAfter(dayjs(selectedFY.start), "month") &&
    dayjs(currentMonth).isSameOrBefore(dayjs(selectedFY.end), "month");

  return (
    <PageFrame>
      <div>
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4 justify-between">
          <div>
            <span className="text-title text-primary font-pmedium uppercase">
              ATTENDANCE - {formattedMonth}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-2 items-center ">
              <TextField
                select
                size="small"
                value={selectedFY.label}
                onChange={(e) => {
                  const fy = extendedFyOptions.find(
                    (fy) => fy.label === e.target.value
                  );
                  setSelectedFY(fy);
                  setCurrentMonth(fy.start);
                  setPagination((current) => ({ ...current, page: 1 }));
                }}
                className="min-w-[140px]"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#1E3D73",
                    color: "#fff",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1E3D73",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#fff",
                  },
                }}
              >
                {extendedFyOptions.map((fy) => (
                  <MenuItem key={fy.label} value={fy.label}>
                    {fy.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            <div className="flex items-center gap-4">
              {/* <SecondaryButton handleSubmit={handlePrevMonth} title="Prev" /> */}

              <TextField
                select
                size="small"
                value={dayjs(currentMonth).format("YYYY-MM")}
                onChange={(e) => {
                  const [year, month] = e.target.value.split("-");
                  const newDate = dayjs(`${year}-${month}-01`).toDate();
                  setCurrentMonth(newDate);
                   setPagination((current) => ({ ...current, page: 1 }));
                }}
                className="min-w-[160px]"
                SelectProps={{
                  IconComponent: KeyboardArrowDownIcon,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#1E3D73",
                    color: "#fff",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1E3D73",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#fff",
                  },
                }}
              >
                {generateMonthOptions(selectedFY.start, selectedFY.end).map(
                  (option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  )
                )}
              </TextField>

              {/* <PrimaryButton handleSubmit={handleNextMonth} title="Next" /> */}
            </div>
          </div>
        </div>

        {!isLoading ? (
          isMonthWithinFY ? (
            <AgTable
              data={tableData.map((data, index) => ({
                srNo: (pagination.page - 1) * pagination.limit + index + 1,
                ...data,
              }))}
              columns={columns}
              search={true}
              searchColumn="empName"
              exportData
              serverPagination
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              paginationPageSize={pagination.limit}
              paginationPage={pagination.page}
              paginationTotal={pagination.total}
              onPaginationPageChange={(page) =>
                setPagination((current) => ({ ...current, page }))
              }
              onPaginationPageSizeChange={(limit) =>
                setPagination((current) =>
                  current.limit === limit
                    ? current
                    : { ...current, page: 1, limit },
                )
              }
            />
          ) : (
            <div className="text-center text-gray-500 py-8 text-lg">
              Data not available for selected financial year.
            </div>
          )
        ) : (
          <Skeleton width={"100%"} height={600} />
        )}

        <MuiModal
          open={viewAttendanceOpen}
          onClose={() => {
            setViewAttendanceOpen(false);
            setSelectedEmployee(null);
          }}
          title={`Attendance Details: ${selectedEmployee?.empName || "Employee"}`}
          widthClass="w-4/5"
        >
          <div className="flex flex-col gap-4">
            <TextField
              size="small"
              label="Month"
              value={dayjs(`${attendanceMonth}-01`).format("MMMM, YYYY")}
              disabled
              fullWidth
            />
            {attendanceDetailsLoading ? (
              <Skeleton width="100%" height={320} />
            ) : (
              <AgTable
                data={viewAttendanceRows}
                columns={viewAttendanceColumns}
                search
                hideTitle
                tableHeight={360}
              />
            )}
          </div>
        </MuiModal>

        <MuiModal
          open={manageAttendanceOpen}
          onClose={() => {
            setManageAttendanceOpen(false);
            setSelectedEmployee(null);
            setAttendanceSaveAttempted(false);
          }}
          title={`Attendance Details: ${selectedEmployee?.empName || "Employee"}`}
        >
          <div className="flex flex-col gap-5">
            <TextField
              type="month"
              size="small"
              fullWidth
              label="Month"
              value={attendanceMonth}
              onChange={(event) => {
                setAttendanceMonth(event.target.value);
                setAttendanceSaveAttempted(false);
              }}
              inputProps={{ max: dayjs().format("YYYY-MM") }}
              InputLabelProps={{ shrink: true }}
            />

            {attendanceDetailsLoading ? (
              <Skeleton width="100%" height={220} />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <TextField
                    type="number"
                    size="small"
                    label="Working Days"
                    value={editableWorkedDays}
                    onChange={(event) => {
                      setEditableWorkedDays(event.target.value);
                      setAttendanceSaveAttempted(false);
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                    fullWidth
                  />
                  {attendanceSaveAttempted && !workedDaysMatch && (
                    <div className="mt-2 text-sm">
                      <p className="text-gray-500">
                        Expected {attendanceSummary.expectedWorkedDays} day(s):{" "}
                        {attendanceSummary.totalWorkingDays} total working day(s)
                        {" - "}
                        {attendanceSummary.timeOff} leave day(s).
                      </p>
                      <p className="mt-1 text-red-600">
                        {Math.abs(workedDaysDifference)} day(s){" "}
                        {workedDaysDifference > 0
                          ? "are not accounted for by attendance."
                          : "exceed the expected attendance."}
                      </p>
                    </div>
                  )}
                </div>
                {[
                  ["Time Off", attendanceSummary.timeOff],
                  ["Weekly Offs", attendanceSummary.weeklyOffs],
                  ["Holidays", attendanceSummary.holidays],
                  ["Over Time", attendanceSummary.overtime],
                  ["LOP", attendanceSummary.lop],
                ].map(([label, value]) => (
                  <TextField
                    key={label}
                    size="small"
                    label={label}
                    value={`${value} Day(s)`}
                    disabled
                    fullWidth
                  />
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <PrimaryButton
                title="Save"
                handleSubmit={() => {
                  setAttendanceSaveAttempted(true);
                  if (workedDaysMatch) {
                    setManageAttendanceOpen(false);
                    setSelectedEmployee(null);
                    setAttendanceSaveAttempted(false);
                  }
                }}
              />
            </div>
          </div>
        </MuiModal>
      </div>
    </PageFrame>
  );
};

export default HrAttendance;
