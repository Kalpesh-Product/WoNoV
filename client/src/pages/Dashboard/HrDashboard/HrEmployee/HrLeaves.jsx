import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import AgTable from "../../../../components/AgTable";
import dayjs from "dayjs";
import SecondaryButton from "../../../../components/SecondaryButton";
import PrimaryButton from "../../../../components/PrimaryButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { Box, MenuItem, Skeleton, TextField, Tooltip } from "@mui/material";
import PageFrame from "../../../../components/Pages/PageFrame";

const HrLeaves = () => {
  const axios = useAxiosPrivate();

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

  const tableData = useMemo(() => {
    const groupedUsers = {};
    const totalOperationalDays = Array.from({ length: daysInMonth }, (_, i) => {
      const date = dayjs(new Date(currentYearNum, currentMonthNum, i + 1));
      const day = date.day();
      return day !== 0; // Exclude Sunday only
    }).filter(Boolean).length;

    // Attendance map
    const attendanceMap = {};
    attendanceData?.companyAttandances?.forEach((entry) => {
      const userId = entry.user?._id;
      const dateKey = dayjs(entry.inTime).format("YYYY-MM-DD");
      attendanceMap[`${userId}-${dateKey}`] = "✅";

      if (!groupedUsers[userId]) {
        groupedUsers[userId] = {
          empId: entry.user?.empId,
          empName: `${entry.user?.firstName || ""} ${
            entry.user?.lastName || ""
          }`.trim(),
        };
      }
    });

    // Leave map
    const leaveMap = {};
    attendanceData?.allLeaves?.forEach((leave) => {
      const userId = leave.takenBy?._id;
      const leaveType = leave.leaveType?.toLowerCase().includes("sick")
        ? "SL"
        : leave.leaveType?.toLowerCase().includes("comp")
        ? "CO"
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

    // Compile table rows
    const finalRows = Object.entries(groupedUsers)
      .map(([userId, userInfo], index) => {
        const row = {
          srno: index + 1,
          ...userInfo,
        };

        let workedDays = 0;

        let hasData = false;

        // Get user startDate from attendance entry (only companyAttandances has it)
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
            row[`day${day}`] = "✅";
            workedDays += 1;
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

        row["totalDays"] = totalOperationalDays;
        row["workedDays"] = workedDays;

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
      headerTooltip: `${date.format("dddd, MMM D")}`,
      cellRenderer: (params) => {
        const value = params.value;

        let bgColor = "";
        let textColor = "";
        let label = "";
        let tooltip = "";

        switch (value) {
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
  ];

  const isMonthWithinFY =
    dayjs(currentMonth).isSameOrAfter(dayjs(selectedFY.start), "month") &&
    dayjs(currentMonth).isSameOrBefore(dayjs(selectedFY.end), "month");

  return (
    <PageFrame>
      <div>
        <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-4">
          <div className="flex gap-2 items-center">
            <TextField
              select
              size="small"
              value={selectedFY.label}
              onChange={(e) => {
                const fy = fyOptions.find((fy) => fy.label === e.target.value);
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

export default HrLeaves;
