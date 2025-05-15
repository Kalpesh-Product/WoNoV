import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setTasksData } from "../../../../redux/slices/hrSlice";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";

const HrTasks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedMonth = useSelector((state) => state.hr.selectedMonth);
  console.log(selectedMonth);
  const tasksRawData = useSelector((state) => state.hr.tasksRawData);
  const runCountRef = useRef(0);

  useEffect(() => {
    if (tasksRawData.length === 0) {
      const staticData = [
        {
          department: "Tech",
          total: 40,
          achieved: 35,
          tasks: [
            {
              taskName: "Complete sales module",
              assignedBy: "Kalpesh Naik",
              assignedTo: "Aiwinraj",
              assignedDate: "13-05-2025",
              dueDate: "14-05-2025",
              status: "Pending",
            },
            {
              taskName: "Deploy chat feature",
              assignedBy: "Kalpesh Naik",
              assignedTo: "Priya Shah",
              assignedDate: "12-05-2025",
              dueDate: "15-05-2025",
              status: "Completed",
            },
            {
              taskName: "Fix API bugs",
              assignedBy: "Kalpesh Naik",
              assignedTo: "Ravi Mehta",
              assignedDate: "11-05-2025",
              dueDate: "13-05-2025",
              status: "Pending",
            },
          ],
        },
        {
          department: "HR",
          total: 30,
          achieved: 28,
          tasks: [
            {
              taskName: "Finalize payroll structure",
              assignedBy: "Nisha Patel",
              assignedTo: "Ritika Sharma",
              assignedDate: "10-05-2025",
              dueDate: "13-05-2025",
              status: "Completed",
            },
            {
              taskName: "Schedule employee training",
              assignedBy: "Nisha Patel",
              assignedTo: "Amit Desai",
              assignedDate: "12-05-2025",
              dueDate: "16-05-2025",
              status: "Pending",
            },
            {
              taskName: "Update leave policy",
              assignedBy: "Nisha Patel",
              assignedTo: "Meera Rao",
              assignedDate: "13-05-2025",
              dueDate: "18-05-2025",
              status: "Pending",
            },
          ],
        },
        {
          department: "Sales",
          total: 50,
          achieved: 47,
          tasks: [
            {
              taskName: "Follow up with client leads",
              assignedBy: "Suresh Menon",
              assignedTo: "Deepak Verma",
              assignedDate: "11-05-2025",
              dueDate: "14-05-2025",
              status: "Completed",
            },
            {
              taskName: "Update CRM with new data",
              assignedBy: "Suresh Menon",
              assignedTo: "Neha Joshi",
              assignedDate: "12-05-2025",
              dueDate: "13-05-2025",
              status: "Pending",
            },
            {
              taskName: "Prepare Q2 sales report",
              assignedBy: "Suresh Menon",
              assignedTo: "Vikram Chauhan",
              assignedDate: "13-05-2025",
              dueDate: "15-05-2025",
              status: "Pending",
            },
          ],
        },
        {
          department: "Finance",
          total: 35,
          achieved: 33,
          tasks: [
            {
              taskName: "Reconcile April transactions",
              assignedBy: "Anita Rao",
              assignedTo: "Rahul Sengupta",
              assignedDate: "10-05-2025",
              dueDate: "12-05-2025",
              status: "Completed",
            },
            {
              taskName: "Review expense claims",
              assignedBy: "Anita Rao",
              assignedTo: "Sneha Kulkarni",
              assignedDate: "13-05-2025",
              dueDate: "14-05-2025",
              status: "Pending",
            },
            {
              taskName: "Prepare audit documents",
              assignedBy: "Anita Rao",
              assignedTo: "Manoj Iyer",
              assignedDate: "11-05-2025",
              dueDate: "16-05-2025",
              status: "Pending",
            },
          ],
        },
      ];

      dispatch(setTasksData(staticData));
    }
  }, [dispatch, tasksRawData.length]);

  // Filter tasks by Redux selectedMonth
  const filteredTasks = [];

  tasksRawData.forEach((dept) => {
    dept.tasks.forEach((task) => {
      const [day, m, y] = task.assignedDate.split("-").map(Number);
      const date = new Date(y, m - 1, day);
      const taskMonthName = date.toLocaleString("default", { month: "long" });

      if (taskMonthName.toLowerCase() === selectedMonth?.toLowerCase()) {
        filteredTasks.push({ department: dept.department, ...task });
      }
    });
  });
 

  if (!selectedMonth || filteredTasks.length === 0) {
    return <div className="flex justify-center items-center h-80">No data available for the selected month.</div>;
  }

  // Group by department
  const departmentMap = {};
  filteredTasks.forEach((task) => {
    const dept = task.department;
    if (!departmentMap[dept]) departmentMap[dept] = { total: 0, achieved: 0 };
    departmentMap[dept].total += 1;
    if (task.status === "Completed") departmentMap[dept].achieved += 1;
  });

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
        y:
          stats.total > 0
            ? +((stats.achieved / stats.total) * 100).toFixed(1)
            : 0,
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
      bar: {
        horizontal: false,
        columnWidth: "40%",
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
      title: { text: "Departments" },
      categories: Object.keys(departmentMap),
    },
    yaxis: {
      title: { text: "Completion (%)" },
      labels: {
        formatter: (val) => `${val.toFixed(0)}`,
      },
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

  const groupTasksByDepartment = (tasks) => {
    return tasks.reduce((acc, task) => {
      const dept = task.department;
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(task);
      return acc;
    }, {});
  };

  const groupedTasks = groupTasksByDepartment(filteredTasks);

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
      </WidgetSection>
      <WidgetSection title={"departement-wise task overview"} border>
        <AgTable columns={tasksColumns} data={tableData} tableHeight={300} />
      </WidgetSection>
    </div>
  );
};

export default HrTasks;
