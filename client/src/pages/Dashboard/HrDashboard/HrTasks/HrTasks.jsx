import React, { useMemo } from "react";
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

const HrTasks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const selectedMonth = useSelector((state) => state.hr.selectedMonth);
  const tasksRawData = useSelector((state) => state.hr.tasksRawData);

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

  const hasMonthData = (monthName) => {
    return tasksRawData.some((dept) =>
      dept.tasks.some((task) => {
        const [day, m, y] = task.assignedDate.split("-").map(Number);
        const taskMonth =
          calendarMonths[(new Date(y, m - 1, day).getMonth() + 9) % 12];

        return taskMonth.toLowerCase() === monthName.toLowerCase();
      })
    );
  };

  const isPrevAvailable =
    currentMonthIndex > 0 &&
    hasMonthData(calendarMonths[currentMonthIndex - 1]);
  const isNextAvailable =
    currentMonthIndex < calendarMonths.length - 1 &&
    hasMonthData(calendarMonths[currentMonthIndex + 1]);

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



  

  const departmentMap = useMemo(() => {
    const map = {};
    filteredTasks.forEach((task) => {
      const dept = task.department;
      if (!map[dept]) map[dept] = { total: 0, achieved: 0 };
      map[dept].total += 1;
      if (task.status === "Completed") map[dept].achieved += 1;
    });
    return map;
  }, [filteredTasks]);

  const graphData = [
    {
      name: "Total Tasks",
      group: `Tasks - ${selectedMonth}`,
      data: Object.entries(departmentMap).map(([dept, stats]) => ({
        x: dept,
        y: 100,
        raw: stats.total,
      })),
    },
    {
      name: "Achieved Tasks",
      group: `Tasks - ${selectedMonth}`,
      data: Object.entries(departmentMap).map(([dept, stats]) => ({
        x: dept,
        y: stats.total ? +((stats.achieved / stats.total) * 100).toFixed(1) : 0,
        raw: stats.achieved,
      })),
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
      bar: { horizontal: false, columnWidth: "40%", borderRadius: 5 },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      title: { text: "Departments" },
      categories: Object.keys(departmentMap),
    },
    yaxis: {
      title: { text: "Completion (%)" },
      labels: { formatter: (val) => `${val.toFixed(0)}` },
      max: 100,
    },
    colors: ["#54C4A7", "#EB5C45"],
    fill: { opacity: 1 },
    legend: { position: "top" },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const item = w.config.series[seriesIndex].data[dataPointIndex];
        const label = seriesIndex === 0 ? "Achieved" : "Total";
        return `
          <div style="padding:8px">
            <strong>${item.x}</strong><br/>
            ${label} Tasks: ${item.raw}
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

  const tableData = Object.entries(groupedTasks).map(([dept, deptTasks]) => {
    const total = deptTasks.length;
    const achieved = deptTasks.filter((t) => t.status === "Completed").length;
    return {
      department: dept,
      totalTasks: total,
      achievedTasks: achieved,
      totalPercent: "100%",
      achievedPercent: `${((achieved / total) * 100).toFixed(0)}%`,
      shortFall: `${(((total - achieved) / total) * 100).toFixed(0)}%`,
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
            navigate("department-tasks", {
              state: {
                month: selectedMonth,
                department: params.value,
                tasks: groupedTasks[params.value],
              },
            })
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
      <WidgetSection title={`Task overview - ${selectedMonth}`} border padding>
        <NormalBarGraph data={graphData} options={graphOptions} year={false} />
        <div className="flex justify-center items-center">
          <div className="flex items-center pb-4">
            <SecondaryButton
              title={<MdNavigateBefore />}
              handleSubmit={handlePrevMonth}
              disabled={!isPrevAvailable}
            />
            <div className="text-sm min-w-[120px] text-center">
              {selectedMonth}
            </div>
            <SecondaryButton
              title={<MdNavigateNext />}
              handleSubmit={handleNextMonth}
              disabled={!isNextAvailable}
            />
          </div>
        </div>
      </WidgetSection>

      <WidgetSection title="Department-wise task overview" border>
        <AgTable columns={tasksColumns} data={tableData} tableHeight={300} />
      </WidgetSection>
    </div>
  );
};

export default HrTasks;
