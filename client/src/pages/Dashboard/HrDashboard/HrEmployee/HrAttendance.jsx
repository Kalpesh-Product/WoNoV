import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import AgTable from "../../../../components/AgTable";
import dayjs from "dayjs";
import SecondaryButton from "../../../../components/SecondaryButton";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Box, MenuItem, Skeleton, TextField, Tooltip } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PageFrame from "../../../../components/Pages/PageFrame";

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
  ];

  const [selectedFY, setSelectedFY] = useState(fyOptions[0]);
  const [currentMonth, setCurrentMonth] = useState(selectedFY.start);

  const { data: attendanceData = {}, isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const response = await axios.get("/api/company/company-attandances");
      return response.data;
    },
  });

  const formattedMonth = dayjs(currentMonth).format("MMMM YYYY");
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

  const DAILY_WORK_HOURS = 9;

  const tableData = useMemo(() => {
    const groupedUsers = {};
    const attendanceMap = {};

    attendanceData?.companyAttandances?.forEach((entry) => {
      const userId = entry.user?._id;
      const dateKey = dayjs(entry.inTime).format("YYYY-MM-DD");
      const inTime = dayjs(entry.inTime);
      const outTime = dayjs(entry.outTime);
      const workedHours = outTime.diff(inTime, "minute") / 60;

      attendanceMap[`${userId}-${dateKey}`] = Number(workedHours.toFixed(2));

      if (!groupedUsers[userId]) {
        groupedUsers[userId] = {
          empId: entry.user?.empId,
          empName: `${entry.user?.firstName || ""} ${
            entry.user?.lastName || ""
          }`.trim(),
        };
      }
    });

    const leaveMap = {};
    attendanceData?.allLeaves?.forEach((leave) => {
      const userId = leave.takenBy?._id;
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
          empId: leave.takenBy?.empId || "",
          empName: `${leave.takenBy?.firstName || ""} ${
            leave.takenBy?.lastName || ""
          }`.trim(),
        };
      }
    });

    const finalRows = Object.entries(groupedUsers)
      .map(([userId, userInfo], index) => {
        const row = {
          // srno: index + 1,
          ...userInfo,
        };

        let totalWorkedHours = 0;
        let hasData = false;

        const userAttendance = attendanceData.companyAttandances?.find(
          (entry) => entry.user?._id === userId && entry.user?.startDate
        );
        const startDate = dayjs(userAttendance?.user?.startDate);

        for (let day = 1; day <= daysInMonth; day++) {
          const date = dayjs(new Date(currentYearNum, currentMonthNum, day));
          const key = `${userId}-${date.format("YYYY-MM-DD")}`;
          const isWeekend = date.day() === 0 || date.day() === 6;
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
            row[`day${day}`] = "H";
            hasData = true;
          } else {
            row[`day${day}`] = "";
          }
        }

        row["totalHours"] = DAILY_WORK_HOURS * workingDaysInMonth;
        row["workedHours"] = Number(totalWorkedHours.toFixed(2));

        return hasData ? row : null;
      })
      .filter(Boolean);

    return finalRows;
  }, [attendanceData, currentMonth]);

  const dayColumns = Array.from({ length: daysInMonth }, (_, i) => {
    const date = dayjs(new Date(currentYearNum, currentMonthNum, i + 1));
    const dayOfWeek = date.format("ddd");
    const isSaturday = dayOfWeek === "Sat";
    const isSunday = dayOfWeek === "Sun";

    return {
      field: `day${i + 1}`,
      headerName: isSaturday ? "SAT" : isSunday ? "SUN" : `${i + 1}`,
      width: 80,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-center-header",
      headerTooltip: `${date.format("dddd, MMM D")}`,
      cellRenderer: (params) => {
        const value = params.value;

        if (typeof value === "number") {
          const bgColor = "#d1fae5";
          const textColor = "#065f46";
          const label = value.toFixed(2);
          const tooltip = `Worked ${label} hours`;

          return (
            <div className="py-2">
              <Tooltip title={tooltip}>
                <Box
                  sx={{
                    bgcolor: bgColor,
                    color: textColor,
                    fontSize: "0.75rem",
                    px: 1,
                    borderRadius: "6px",
                    textAlign: "center",
                    fontWeight: 500,
                    width: "100%",
                  }}
                >
                  {label}
                </Box>
              </Tooltip>
            </div>
          );
        }

        let bgColor = "";
        let textColor = "";
        let label = "";
        let tooltip = "";

        switch (value) {
          case "PL":
            bgColor = "#fee2e2";
            textColor = "#991b1b";
            label = "PL";
            tooltip = "Privileged Leave";
            break;
          case "SL":
            bgColor = "#fee2e2";
            textColor = "#991b1b";
            label = "SL";
            tooltip = "Sick Leave";
            break;
          case "H":
            bgColor = "#dbeafe";
            textColor = "#1e3a8a";
            label = "H";
            tooltip = "Public Holiday";
            break;
          case "N/A":
            bgColor = "#f3f4f6";
            textColor = "#6b7280";
            label = "N/A";
            tooltip = "Not Applicable";
            break;
          default:
            return null;
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
                }}
              >
                {label}
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
                  const fy = fyOptions.find(
                    (fy) => fy.label === e.target.value
                  );
                  setSelectedFY(fy);
                  setCurrentMonth(fy.start);
                }}
                className="min-w-[140px]"
              >
                {fyOptions.map((fy) => (
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
                }}
                className="min-w-[160px]"
                SelectProps={{
                  IconComponent: KeyboardArrowDownIcon,
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
                srNo: index + 1,
                ...data,
              }))}
              columns={columns}
              search={true}
              searchColumn="empName"
            />
          ) : (
            <div className="text-center text-gray-500 py-8 text-lg">
              Data not available for selected financial year.
            </div>
          )
        ) : (
          <Skeleton width={"100%"} height={600} />
        )}
      </div>
    </PageFrame>
  );
};

export default HrAttendance;
