import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import WidgetSection from "../../../../components/WidgetSection";
import { useSelector } from "react-redux";
import SecondaryButton from "../../../../components/SecondaryButton";
import PrimaryButton from "../../../../components/PrimaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const HrDepartmentKPA = () => {
  const location = useLocation();
  const { month, department, tasks, year } = location.state || {};
  const tasksRawData = useSelector((state) => state.hr.tasksRawData);
  const fullMonthNames = {
    Jan: "January",
    Feb: "February",
    Mar: "March",
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December",
  };
  const fyMonths = [
    "Apr-25",
    "May-25",
    "Jun-25",
    "Jul-25",
    "Aug-25",
    "Sep-25",
    "Oct-25",
    "Nov-25",
    "Dec-25",
    "Jan-26",
    "Feb-26",
    "Mar-26",
  ];
  const initialShortMonth = Object.keys(fullMonthNames).find(
    (key) => fullMonthNames[key] === month
  );

  const initialMonthIndex = fyMonths.findIndex((m) =>
    m.startsWith(initialShortMonth)
  );

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    initialMonthIndex !== -1 ? initialMonthIndex : 0
  );

  const selectedMonth = fyMonths[selectedMonthIndex];
  const shortMonth = selectedMonth.split("-")[0];

  if (!department || !tasks?.length) {
    return <div className="">No tasks found for this department.</div>;
  }
  const filteredData = tasksRawData.filter(
    (item) => item.department === department
  );
  const departmentName = filteredData[0]?.department;
  const tasksData = filteredData[0]?.tasks;

  const handlePrevMonth = () => {
    if (selectedMonthIndex > 0) {
      setSelectedMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex < fyMonths.length - 1) {
      setSelectedMonthIndex((prev) => prev + 1);
    }
  };

  const monthlyMap = {};
  fyMonths.forEach((label) => {
    monthlyMap[label] = { total: 0, achieved: 0 };
  });

  tasksData.forEach((task) => {
    const [day, month, year] = task.assignedDate.split("-").map(Number);
    const jsDate = new Date(year, month - 1, day);
    const label = `${jsDate.toLocaleString("default", {
      month: "short",
    })}-${String(jsDate.getFullYear()).slice(2)}`;

    if (monthlyMap[label]) {
      monthlyMap[label].total += 1;
      if (task.status === "Completed") {
        monthlyMap[label].achieved += 1;
      }
    }
  });

  const graphData = [
    {
      name: "Completed Tasks",
      group: `${departmentName} - ${month}`,
      data: fyMonths.map((label) => {
        const { total, achieved } = monthlyMap[label] || {
          total: 0,
          achieved: 0,
        };
        const percent = total > 0 ? (achieved / total) * 100 : 0;
        return {
          x: label,
          y: +percent.toFixed(1),
          raw: achieved,
        };
      }),
    },
    {
      name: "Remaining Tasks",
      group: `${departmentName} - ${month}`,
      data: fyMonths.map((label) => {
        const { total, achieved } = monthlyMap[label] || {
          total: 0,
          achieved: 0,
        };
        const remaining = total - achieved;
        const percent = total > 0 ? (remaining / total) * 100 : 0;
        return {
          x: label,
          y: +percent.toFixed(1),
          raw: remaining,
        };
      }),
    },
  ];

  const graphOptions = {
    chart: {
      type: "bar",
      stacked: true, // ✅ stacked
      animations: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 1,
      colors: ["#fff"],
    },
    xaxis: {
      title: { text: "Months" },
      categories: fyMonths,
    },
    yaxis: {
      title: { text: "Completion (%)" },
      labels: {
        formatter: (val) => `${val.toFixed(0)}%`,
      },
      max: 100,
    },
    colors: ["#54C4A7", "#EB5C45"],
    fill: { opacity: 1 },
    legend: { position: "top" },
    tooltip: {
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const month = w.config.series[seriesIndex].data[dataPointIndex].x;

        const completed = w.config.series[0].data[dataPointIndex].raw;
        const remaining = w.config.series[1].data[dataPointIndex].raw;
        const total = completed + remaining;

        return `
          <div style="padding:8px; font-family: Poppins, sans-serif; font-size: 13px; width: 220px;">
            <strong>${month}</strong>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
    
            <div style="display: flex; justify-content: space-between;">
              <span>Total KPA</span>
              <span>${total}</span>
            </div>
    
            <div style="display: flex; justify-content: space-between;">
              <span>Completed KPA</span>
              <span>${completed}</span>
            </div>
    
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
    
            <div style="display: flex; justify-content: space-between;">
              <span>Remaining KPA</span>
              <span>${remaining}</span>
            </div>
          </div>
        `;
      },
    },
  };

  const tasksColumns = [
    {
      headerName: "Sr No",
      field: "id",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 100,
    },
    {
      field: "taskName",
      headerName: "KPA Name",
      flex: 1,
    },
    {
      field: "assignedTo",
      headerName: "Assigned To",
      flex: 1,
    },
    { field: "assignedBy", headerName: "Assigned By", flex: 1 },
    { field: "assignedDate", headerName: "Assigned Date", flex: 1 },
    // { field: "totalPercent", headerName: "Total (%)", flex: 1 },
    { field: "dueDate", headerName: "Due Date", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          "in-progress": { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
          Completed: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
  ];

  const filteredTasks = tasksData.filter((task) => {
    const [day, month, year] = task.assignedDate.split("-").map(Number);
    const taskMonth =
      fyMonths[(new Date(year, month - 1, day).getMonth() + 9) % 12];
    return taskMonth === selectedMonth;
  });

  return (
    <div className="flex flex-col gap-4">

      <WidgetSection
        title={`${departmentName} department KPA overview`}
        border
        TitleAmount={`TOTAL KPA :  ${tasksData.length || 0}`}
      >
        <NormalBarGraph
          data={graphData}
          options={graphOptions}
          year={false}
          height={350}
        />
      </WidgetSection>

      <WidgetSection
        title={`KPA details`}
        border
        TitleAmount={`${fullMonthNames[shortMonth]} : ${
          filteredTasks.length > 1
            ? `${filteredTasks.length} KPA`
            : `${filteredTasks.length} KPA`
        } `}
      >
          <div className="flex justify-center items-center gap-4">
              <SecondaryButton
                title={<MdNavigateBefore />}
                handleSubmit={handlePrevMonth}
                disabled={selectedMonthIndex === 0}
              />
              <div className="text-subtitle  text-center font-pmedium">
                {selectedMonth}
              </div>
              <PrimaryButton
                title={<MdNavigateNext />}
                handleSubmit={handleNextMonth}
                disabled={selectedMonthIndex === fyMonths.length - 1}
              />
            </div>
        {filteredTasks.length === 0 ? (
          <div className="text-center flex justify-center items-center py-8 text-gray-500 h-80">
            No data available
          </div>
        ) : (
          <div>
          
            <AgTable
              tableHeight={300}
              hideFilter
              columns={tasksColumns}
              data={filteredTasks.map((item, index) => ({
                id: index + 1,
                taskName: item.taskName,
                assignedTo: item.assignedTo,
                assignedBy: item.assignedBy,
                assignedDate: item.assignedDate,
                dueDate: item.dueDate,
                status: item.status,
              }))}
            />
          </div>
        )}
      </WidgetSection>
    </div>
  );
};

export default HrDepartmentKPA;
