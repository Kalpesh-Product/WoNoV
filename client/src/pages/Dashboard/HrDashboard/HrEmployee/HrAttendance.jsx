import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import AgTable from "../../../../components/AgTable";
import dayjs from "dayjs";
import SecondaryButton from "../../../../components/SecondaryButton";
import PrimaryButton from "../../../../components/PrimaryButton";
import { MenuItem, Skeleton, TextField } from "@mui/material";

const HrAttendance = () => {
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

  const formattedMonth = dayjs(currentMonth).format("MMMM YYYY");

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
  
      let hasData = false;
  
      for (let day = 1; day <= daysInMonth; day++) {
        const date = dayjs(new Date(currentYearNum, currentMonthNum, day));
        const key = `${userId}-${date.format("YYYY-MM-DD")}`;
        const isWeekend = date.day() === 0 || date.day() === 6;
  
        if (attendanceMap[key]) {
          row[`day${day}`] = "✅";
          hasData = true;
        } else if (leaveMap[key]) {
          row[`day${day}`] = leaveMap[key];
          hasData = true;
        } else if (!isWeekend) {
          row[`day${day}`] = "H";
        } else {
          row[`day${day}`] = "";
        }
      }
  
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
      width: 60,
      cellStyle: { textAlign: "center" },
      headerTooltip: `${date.format("dddd, MMM D")}`,
    };
  });

  const columns = [
    { field: "srno", headerName: "SR No", width: 80, pinned: "left" },
    { field: "empId", headerName: "Employee ID", width: 130, pinned: "left" },
    {
      field: "empName",
      headerName: "Employee Name",
      width: 200,
      pinned: "left",
    },
    ...dayColumns,
  ];

  const isMonthWithinFY =
    dayjs(currentMonth).isSameOrAfter(dayjs(selectedFY.start), "month") &&
    dayjs(currentMonth).isSameOrBefore(dayjs(selectedFY.end), "month");

    return (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
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
              <SecondaryButton handleSubmit={handlePrevMonth} title="Prev" />
              <span className="font-semibold text-subtitle">{formattedMonth}</span>
              <PrimaryButton handleSubmit={handleNextMonth} title="Next" />
            </div>
          </div>
      
          {!isLoading ? (
            isMonthWithinFY ? (
              <AgTable
                data={tableData}
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
      );
    }
      
export default HrAttendance;
