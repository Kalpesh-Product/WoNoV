import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedMonth } from "../../../../redux/slices/hrSlice";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import SecondaryButton from "../../../../components/SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const calendarMonths = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

const HrKPA = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const selectedMonth = useSelector((state) => state.hr.selectedMonth);
  const tasksRawData = useSelector((state) => state.hr.tasksRawData);

  console.log("tasks data", selectedMonth, tasksRawData);
  const yearArray = tasksRawData.map(
    (item) => item.tasks?.map((task) => task.assignedDate)[0]
  );

  const currentMonthIndex = calendarMonths.findIndex(
    (m) => m.toLowerCase() === selectedMonth?.toLowerCase()
  );

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      dispatch(setSelectedMonth(calendarMonths[currentMonthIndex - 1]));
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < calendarMonths.length - 1) {
      dispatch(setSelectedMonth(calendarMonths[currentMonthIndex + 1]));
    }
  };

  const filteredTasks = useMemo(() => {
    if (!selectedMonth || tasksRawData.length === 0) return [];

    return tasksRawData.flatMap((dept) =>
      dept.tasks
        .filter((task) => {
          const [day, m, y] = task.assignedDate.split("-").map(Number);
          const taskMonth =
            calendarMonths[(new Date(y, m - 1, day).getMonth() + 9) % 12];

          return taskMonth.toLowerCase() === selectedMonth.toLowerCase();
        })
        .map((task) => ({ department: dept.department, ...task }))
    );
  }, [tasksRawData, selectedMonth]);

  const totalCompleted = filteredTasks.filter(
    (t) => t.status === "Completed"
  ).length;
  const totalRemaining = filteredTasks.filter(
    (t) => t.status !== "Completed"
  ).length;

  const allDepartments = useMemo(() => {
    const deptSet = new Set();
    tasksRawData.forEach((dept) => {
      if (dept?.department) deptSet.add(dept.department);
    });
    return Array.from(deptSet);
  }, [tasksRawData]);

  const departmentMap = useMemo(() => {
    const map = {};

    allDepartments.forEach((dept) => {
      map[dept] = { total: 0, achieved: 0 };
    });

    filteredTasks.forEach((task) => {
      const dept = task.department;
      map[dept].total += 1;
      if (task.status === "Completed") map[dept].achieved += 1;
    });

    return map;
  }, [filteredTasks, allDepartments]);

  const graphData = [
    {
      name: "Completed KPA",
      group: `KPA - ${selectedMonth}`,
      data: allDepartments.map((dept) => {
        const { total, achieved } = departmentMap[dept] || {
          total: 0,
          achieved: 0,
        };
        const percent = total ? +((achieved / total) * 100).toFixed(1) : 0;
        return { x: dept, y: percent, raw: achieved };
      }),
    },
    {
      name: "Remaining KPA",
      group: `KPA - ${selectedMonth}`,
      data: allDepartments.map((dept) => {
        const { total, achieved } = departmentMap[dept] || {
          total: 0,
          achieved: 0,
        };
        const remaining = total - achieved;
        const percent = total ? +((remaining / total) * 100).toFixed(1) : 0;
        return { x: dept, y: percent, raw: remaining };
      }),
    },
  ];

  const graphOptions = {
    chart: {
      type: "bar",
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const clickedDept =
            config.w.config.series[config.seriesIndex].data[
              config.dataPointIndex
            ].x;

          // Fetch all tasks for the clicked department for the selected month
          const departmentTasks = groupedTasks[clickedDept] || [];

          navigate(`/app/dashboard/HR-dashboard/overall-KPA/department-KPA/${clickedDept}`, {
            state: {
              month: selectedMonth,
              department: clickedDept,
              tasks: departmentTasks,
              year: yearArray[0].split("-")[2],
            },
          });
        },
      },
      stacked: true, // ✅ Enable stacking
      animations: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "20%", borderRadius: 3 },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ["#fff"] },
    xaxis: {
      title: { text: "Departments" },
      categories: allDepartments,
    },
    yaxis: {
      title: { text: "Completion (%)" },
      max: 100,
      labels: { formatter: (val) => `${val.toFixed(0)}%` },
    },
    colors: ["#54C4A7", "#EB5C45"],
    fill: { opacity: 1 },
    legend: { position: "top" },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const dept = w.config.series[seriesIndex].data[dataPointIndex].x;

        const completed = w.config.series[0].data[dataPointIndex].raw;
        const remaining = w.config.series[1].data[dataPointIndex].raw;
        const total = completed + remaining;

        return `
          <div style="padding:8px; font-family: Poppins, sans-serif; font-size: 13px ; width : 150px ">
            <strong>${dept}</strong><br/>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div>Total KPA</div> 
              <div>${total}</div>
            </div>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div>Completed KPA</div> 
              <div>${completed}</div>
            </div>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
             <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div>Remaining KPA</div> 
              <div>${remaining}</div>
            </div>
          </div>
        `;
      },
    },
  };

  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce((acc, task) => {
      if (!acc[task.department]) acc[task.department] = [];
      acc[task.department].push(task);
      return acc;
    }, {});
  }, [filteredTasks]);

  const tableData = allDepartments.map((dept) => {
    const deptTasks = groupedTasks[dept] || [];
    const total = deptTasks.length;
    const achieved = deptTasks.filter((t) => t.status === "Completed").length;
    const shortfall =
      total > 0 ? (((total - achieved) / total) * 100).toFixed(0) : "0";
    return {
      department: dept,
      totalTasks: total,
      achievedTasks: achieved,
      totalPercent: "100%",
      achievedPercent: `${
        total > 0 ? ((achieved / total) * 100).toFixed(0) : "0"
      }%`,
      shortFall: `${shortfall}%`,
    };
  });

  const tasksColumns = [
    {
      headerName: "Sr No",
      field: "id",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 100,
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() =>
            navigate(
              `/app/dashboard/HR-dashboard/overall-KPA/department-KPA/${params.value}`,
              {
                state: {
                  month: selectedMonth,
                  department: params.value,
                  tasks: groupedTasks[params.value],
                  year: yearArray[0].split("-")[2],
                },
              }
            )
          }
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },
    { field: "totalTasks", headerName: "Total", flex: 1 },
    { field: "achievedTasks", headerName: "Achieved", flex: 1 },
    { field: "achievedPercent", headerName: "Achieved (%)", flex: 1 },
    { field: "shortFall", headerName: "Shortfall (%)", flex: 1 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection
        title={`KPA overview - ${selectedMonth} ${yearArray[0].split("-")[2]}`}
        border
        padding
        greenTitle={"completed"}
        TitleAmountGreen={totalCompleted || 0}
        redTitle={"remaining"}
        TitleAmountRed={totalRemaining || 0}
      >
        <NormalBarGraph
          data={graphData}
          options={graphOptions}
          year={false}
          height={400}
        />
        <div className="flex justify-center items-center">
          <div className="flex items-center pb-4">
            <SecondaryButton
              title={<MdNavigateBefore />}
              handleSubmit={handlePrevMonth}
              // disabled={!isPrevAvailable}
            />
            <div className="text-sm min-w-[120px] text-center">
              {selectedMonth}
            </div>
            <SecondaryButton
              title={<MdNavigateNext />}
              handleSubmit={handleNextMonth}
              // disabled={!isNextAvailable}
            />
          </div>
        </div>
      </WidgetSection>

      <WidgetSection
        title="Department-wise KPA overview"
        border
        TitleAmount={`TOTAL Tasks : ${tableData.reduce(
          (sum, item) => item.totalTasks + sum,
          0
        )}`}
      >
        <AgTable
          columns={tasksColumns}
          data={tableData}
          tableHeight={300}
          hideFilter
        />
      </WidgetSection>
    </div>
  );
};

export default HrKPA;
