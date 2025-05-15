import React from "react";
import { useLocation } from "react-router-dom";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import WidgetSection from "../../../../components/WidgetSection";

const HrDepartmentTasks = () => {
  const location = useLocation();
  const { month, department, tasks } = location.state || {};

  if (!department || !tasks?.length) {
    return <div className="">No tasks found for this department.</div>;
  }

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

  const monthlyMap = {};
  fyMonths.forEach((label) => {
    monthlyMap[label] = { total: 0, achieved: 0 };
  });

  tasks.forEach((task) => {
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
      name: "Total Tasks",
      group: `${department} - ${month}`,
      data: fyMonths.map((label) => ({
        x: label,
        y: 100,
        raw: monthlyMap[label].total,
      })),
    },
    {
      name: "Achieved Tasks",
      group: `${department} - ${month}`,
      data: fyMonths.map((label) => {
        const { total, achieved } = monthlyMap[label];
        const percent = total > 0 ? (achieved / total) * 100 : 0;
        return {
          x: label,
          y: +percent.toFixed(1),
          raw: achieved,
        };
      }),
    },
  ];

  const graphOptions = {
    chart: {
      type: "bar",
      animations: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 5,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      title: { text: "Months" },
      categories: fyMonths,
    },
    yaxis: {
      title: { text: "Completion (%)" },
      labels: {
        formatter: (val) => {
          return `${val.toFixed(0)}`;
        },
      },
      max: 100,
    },
    colors: ["#54C4A7", "#EB5C45"],
    fill: { opacity: 1 },
    legend: { position: "top" },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const item = w.config.series[seriesIndex].data[dataPointIndex];
        const label = seriesIndex === 0 ? "Total" : "Achieved";
        return `
          <div style="padding:8px">
            <strong>${item.x}</strong><br/>
            ${label} Tasks: ${item.raw}
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
      headerName: "Task Name",
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
  return (
    <div className="flex flex-col gap-4">
      <WidgetSection
        title={`${department} department task overview - ${month}`}
        border
      >
        <NormalBarGraph data={graphData} options={graphOptions} year={false} />
      </WidgetSection>

      <WidgetSection title={`Task details`} border>
        <AgTable
        tableHeight={300}
        hideFilter
          columns={tasksColumns}
          data={[
            ...tasks.map((item) => ({
              id: item.id,
              taskName: item.taskName,
              assignedTo: item.assignedTo,
              assignedBy: item.assignedBy,
              assignedDate: item.assignedDate,
              dueDate: item.dueDate,
              status: item.status,
            })),
          ]}
        />
      </WidgetSection>
    </div>
  );
};

export default HrDepartmentTasks;
