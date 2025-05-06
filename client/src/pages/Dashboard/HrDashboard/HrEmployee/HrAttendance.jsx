import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import AgTable from "../../../../components/AgTable";
import { Button } from "@mui/material";
import dayjs from "dayjs";

const HrAttendance = () => {
  const axios = useAxiosPrivate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: attendanceData = [], isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const response = await axios.get("/api/company/company-attandances");
      return response.data.companyAttandances;
    },
  });

  const formattedMonth = dayjs(currentMonth).format("MMMM YYYY");

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => dayjs(prev).subtract(1, "month").toDate());
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => dayjs(prev).add(1, "month").toDate());
  };

  // Get total days in selected month
  const daysInMonth = dayjs(currentMonth).daysInMonth();
  const currentMonthNum = dayjs(currentMonth).month();
  const currentYearNum = dayjs(currentMonth).year();

  // Transform attendance data to employee-wise rows
  const tableData = useMemo(() => {
    const grouped = {};

    attendanceData.forEach((entry) => {
      const userId = entry.user?._id;
      const empId = entry.user?.empId;
      const empName = `${entry.user?.firstName || ""} ${entry.user?.lastName || ""}`.trim();

      const inDate = dayjs(entry.inTime);
      const entryDay = inDate.date();
      const entryMonth = inDate.month();
      const entryYear = inDate.year();

      if (entryMonth === currentMonthNum && entryYear === currentYearNum) {
        if (!grouped[userId]) {
          grouped[userId] = {
            empId,
            empName,
          };
        }

        grouped[userId][`day${entryDay}`] = "✅";
      }
    });

    return Object.values(grouped).map((row, idx) => ({
      srno: idx + 1,
      ...row,
    }));
  }, [attendanceData, currentMonthNum, currentYearNum]);

  // Generate dynamic columns for days 1–31
  const dayColumns = Array.from({ length: daysInMonth }, (_, i) => {
    const date = dayjs(new Date(currentYearNum, currentMonthNum, i + 1));
    const dayOfWeek = date.format("ddd"); // e.g., Mon, Tue, Sat, Sun
    const isSaturday = dayOfWeek === "Sat";
    const isSunday = dayOfWeek === "Sun";
  
    return {
      field: `day${i + 1}`,
      headerName: isSaturday
        ? "SAT"
        : isSunday
        ? "SUN"
        : `${i + 1}`,
      width: 60,
      cellStyle: { textAlign: "center" },
      headerTooltip: `${date.format("dddd, MMM D")}`,
    };
  });
  
  

  const columns = [
    {
        field: "srno",
        headerName: "SR No",
        width: 80,
        pinned: "left",
      },
      {
        field: "empId",
        headerName: "Employee ID",
        width: 130,
        pinned: "left",
      },
      {
        field: "empName",
        headerName: "Employee Name",
        width: 200,
        pinned: "left",
      },
    ...dayColumns,
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-2">
        <Button variant="outlined" onClick={handlePrevMonth}>
          Prev
        </Button>
        <h2 className="font-semibold text-lg">{formattedMonth}</h2>
        <Button variant="outlined" onClick={handleNextMonth}>
          Next
        </Button>
      </div>

      <AgTable
        data={isLoading ? [] : tableData}
        columns={columns}
        search={true}
      />
    </div>
  );
};

export default HrAttendance;
