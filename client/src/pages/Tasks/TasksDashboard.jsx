import React from "react";
import { RiPagesLine } from "react-icons/ri";
import { MdFormatListBulleted, MdMiscellaneousServices } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import Card from "../../components/Card";
import DonutChart from "../../components/graphs/DonutChart";
import WidgetSection from "../../components/WidgetSection";
import DataCard from "../../components/DataCard";
import MuiTable from "../../components/Tables/MuiTable";
import BarGraph from "../../components/graphs/BarGraph";
import PieChartMui from "../../components/graphs/PieChartMui";
import {
  tasksPieChartOptions,
  tasksMonthlyData,
  tasksMonthlyOptions,
  pieGenderData,
  pieGenderOptions,
  myTasksColumns,
  myTodayMeetingsColumns,
  recentlyAddedTasksCol,
} from "./TasksData";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { Chip } from "@mui/material";
import humanDate from "../../utils/humanDateForamt";
import humanTime from "../../utils/humanTime";
import dayjs from "dayjs";
import { useEffect } from "react";

const TasksDashboard = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();

  const allTasksQuery = useQuery({
    queryKey: ["allTasks"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/tasks/get-all-tasks");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const allProjectsQuery = useQuery({
    queryKey: ["allProjectsQuery"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/tasks/get-projects");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { data: taskList, isLoading: isTaskListLoading } = useQuery({
    queryKey: ["taskList"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/tasks/get-today-tasks");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  //----------------------------------------------------------------------------------------------------------//

  // const priorityTasks = [
  //   { taskName: "Check Lights", type: "Daily", endTime: "12:00 PM" },
  //   {
  //     taskName: "Inspect Fire Extinguishers",
  //     type: "Daily",
  //     endTime: "03:00 PM",
  //   },
  //   { taskName: "Test Alarm System", type: "Monthly", endTime: "10:00 AM" },
  //   { taskName: "Clean AC Filters", type: "Daily", endTime: "02:30 PM" },
  //   { taskName: "Check Water Pressure", type: "Daily", endTime: "08:00 AM" },
  //   {
  //     taskName: "Monitor Security Cameras",
  //     type: "Daily",
  //     endTime: "11:45 PM",
  //   },
  //   {
  //     taskName: "Update Software Patches",
  //     type: "Monthly",
  //     endTime: "06:00 PM",
  //   },
  //   { taskName: "Backup Server Data", type: "Daily", endTime: "07:30 PM" },
  //   { taskName: "Test Emergency Lights", type: "Monthly", endTime: "04:15 PM" },
  //   { taskName: "Calibrate Sensors", type: "Monthly", endTime: "01:00 PM" },
  // ];

  const today = dayjs().startOf("day");
  const recentlyAddedTasksData = allTasksQuery.isLoading
    ? []
    : allTasksQuery.data
        .filter((task) => dayjs(task.assignedDate).isSame(today, "day"))
        .map((task, index) => ({
          id: index + 1,
          taskName: task.taskName,
          department: task.department?.name || "N/A",
          status: task.status,
          assignedBy: `${task.assignedBy?.firstName || ""} ${
            task.assignedBy?.lastName || ""
          }`,
          assignedDate: dayjs(task.assignedDate).format("DD MMM YYYY, hh:mm A"),
        }));

  const priorityTasks = allTasksQuery.isLoading
    ? []
    : allTasksQuery.data
        .filter((task) => task.priority === "High")
        .slice(0, 10) // Top 10 only
        .map((task, index) => ({
          id: index + 1,
          taskName: task.taskName,
          type: task.workCategory || "N/A",
          endTime: dayjs(task.dueDate).format("hh:mm A"),
        }));

  const priorityTasksColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "taskName", label: "Task Name", align: "left" },
    {
      id: "type",
      label: "Type",
      renderCell: (data) => (
        <Chip sx={{ color: "#1E3D73" }} label={data.type} />
      ),
      align: "left",
    },
    { id: "endTime", label: "End Time", align: "left" },
  ];

  //----------------------------------------------------------------------------------------------------------//

  // Dept wise tsks
  //----------------------------------------------------------------------------------------------------------//





  //----------------------------------------------------------------------------------------------------------//

  // MonthlyDueTasks Data

  //----------------------------------------------------------------------------------------------------------//

  const meetingsQuery = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/meetings/get-meetings");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const completedTasks = allTasksQuery.isLoading
    ? 0
    : allTasksQuery.data.filter((task) => task.status === "Completed").length;

  const pendingTasks = allTasksQuery.isLoading
    ? 0
    : allTasksQuery.data.filter((task) => task.status === "Pending").length;

  const totalTasks = completedTasks + pendingTasks;

  const dynamicTasksPieChartData = [
    {
      label: `Completed (${((completedTasks / totalTasks) * 100).toFixed(1)}%)`,
      value: completedTasks,
    },
    {
      label: `Pending (${((pendingTasks / totalTasks) * 100).toFixed(1)}%)`,
      value: pendingTasks,
    },
  ];

  const dynamicTasksPieChartOptions = {
    labels: ["Completed", "Pending"],
    chart: {
      fontFamily: "Poppins-Regular",
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Tasks`,
      },
    },
    datalabels: {
      enabled: true,
      formatter: (val) => {
        `${((val / totalTasks) * 100).toFixed(0)}%`;
      },
    },
    colors: ["#00ba09", "#ff4545"],
  };

  // const completedTasks = allTasksQuery.isLoading
  //   ? 0
  //   : allTasksQuery.data.filter((task) => task.status === "Completed").length;

  // const pendingTasks = allTasksQuery.isLoading
  //   ? 0
  //   : allTasksQuery.data.length - completedTasks;

  // const projectsAssignedByMe = allProjectsQuery.isLoading
  //   ? 0
  //   : allProjectsQuery.data?.filter((project) => {
  //       return project.assignedBy === auth.user._id;
  //     }).length;

  // const projectsAssignedToMe = allProjectsQuery.isLoading
  //   ? 0
  //   : allProjectsQuery?.data.filter((project) => {
  //       return auth.user.firstName in project.assignees;
  //     }).length;

  // Data for Overall Pending v/s Assigned Tasks
  // const completedPercentagePie = allTasksQuery.isLoading
  //   ? 0
  //   : (completedTasks / allTasksQuery.data.length) * 100;
  // const pendingPercentagePie = allTasksQuery.isLoading
  //   ? 0
  //   : (pendingTasks / allTasksQuery.data.length) * 100;

  // const tasksPieChartData = [
  //   { label: "Completed", value: completedPercentagePie },
  //   { label: "Pending", value: pendingPercentagePie },
  // ];

  //Department-wise Pending Tasks

  const calculateDepartmentPendingStats = (tasks) => {
    const departmentMap = tasks.reduce((acc, task) => {
      const departmentName = task.department?.name || "Unknown";
      const isPending = task.status === "Pending";

      if (!acc[departmentName]) {
        acc[departmentName] = { total: 0, pending: 0 };
      }

      acc[departmentName].total += 1;
      if (isPending) acc[departmentName].pending += 1;

      return acc;
    }, {});

    return Object.entries(departmentMap).map(([department, data]) => ({
      label: `${department} (${((data.pending / data.total) * 100).toFixed(
        1
      )}%)`,
      value: data.pending,
    }));
  };

  const departmentPendingStats = allTasksQuery.isLoading
    ? []
    : calculateDepartmentPendingStats(allTasksQuery.data);

  const tasks = allTasksQuery.isLoading ? [] : allTasksQuery.data;

  const departmentPendingOptions = {
    labels: departmentPendingStats.map((d) => d.label),
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Pending Tasks`,
      },
    },
    legend: {
      position: "right",
    },
    colors: [
      "#FF5733",
      "#FFC300",
      "#36A2EB",
      "#4CAF50",
      "#9C27B0",
      "#FF9800",
      "#795548",
    ],
  };

  //Overall task completeion graph data
  const allTasks = [ /* your full task data array here */ ];

const financialMonths = [ 
  "Apr-24", "May-24", "Jun-24", "Jul-24", "Aug-24", "Sep-24",
  "Oct-24", "Nov-24", "Dec-24", "Jan-25", "Feb-25", "Mar-25"
];

function formatMonth(dateStr) {
  const [day, month, year] = dateStr.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = parseInt(month, 10) - 1;
  const yearShort = String(year).slice(-2);
  return `${months[monthIndex]}-${yearShort}`;
}

const departmentMap = {};

if (!allTasksQuery.isLoading && allTasksQuery.data) {
  allTasksQuery.data.forEach(task => {
    const deptName = task.department;
    const status = task.status;
    const month = formatMonth(task.assignedDate);

    if (!financialMonths.includes(month)) return;

    if (!departmentMap[deptName]) {
      departmentMap[deptName] = {
        department: deptName,
        tasksAllocated: Array(financialMonths.length).fill(0),
        tasksCompleted: Array(financialMonths.length).fill(0),
      };
    }

    const monthIndex = financialMonths.indexOf(month);
    departmentMap[deptName].tasksAllocated[monthIndex] += 1;
    if (status === "Completed") {
      departmentMap[deptName].tasksCompleted[monthIndex] += 1;
    }
  });
}

const departments = Object.values(departmentMap);

console.log("deptt",departments)
const totalAllocated = financialMonths.map((_, index) =>
  departments.reduce((sum, dept) => sum + dept.tasksAllocated[index], 0)
);

const totalCompleted = financialMonths.map((_, index) =>
  departments.reduce((sum, dept) => sum + dept.tasksCompleted[index], 0)
);

// Calculate Pending Tasks
const totalPending = totalAllocated.map(
  (allocated, index) => allocated - totalCompleted[index]
);

// Convert to percentage
const completionPercentage = totalAllocated.map((allocated, index) =>
  allocated > 0 ? (totalCompleted[index] / allocated) * 100 : 0
);

const pendingPercentage = totalAllocated.map((allocated, index) =>
  allocated > 0 ? (totalPending[index] / allocated) * 100 : 0
);

const monthlyTasksData = [
  {
    name: "Completed",
    data: completionPercentage,
  },
  {
    name: "Pending",
    data: pendingPercentage,
  },
];

  const myTodayMeetingsData = !meetingsQuery.isLoading
    ? meetingsQuery.data.map((meeting, index) => {
        return {
          id: index + 1,
          meeting: meeting.subject,
          location: meeting.roomName,
          participants:
            meeting?.participants?.length > 0
              ? meeting.participants.map((participant) => ({
                  name: participant.email,
                  avatar:
                    "https://ui-avatars.com/api/?name=Alice+Johnson&background=random",
                }))
              : [],
          time: humanTime(meeting.startTime),
        };
      })
    : [];


  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection
          layout={1}
          border
          title={"Overall Average Tasks Completion"}
        >
          <BarGraph
            height={400}
            data={monthlyTasksData}
            options={tasksMonthlyOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 6,
      widgets: [
        <Card route={"/app/tasks/my-tasks"} title={"My Tasks"} icon={<RiPagesLine />} />,
        <Card
          route={"/app/tasks/department-tasks"}
          title={"Department Tasks"}
          icon={<RiPagesLine />}
        />,
        <Card
          route={"team-members"}
          title={"Team Members"}
          icon={<MdFormatListBulleted />}
        />,
        <Card route={""} title={"Mix Bag"} icon={<MdFormatListBulleted />} />,
        <Card
          route={"/app/tasks/reports"}
          title={"Reports"}
          icon={<CgProfile />}
        />,
        <Card
          route={""}
          title={"Settings"}
          icon={<MdMiscellaneousServices />}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          title={"Total"}
          // data={allTasksQuery.isLoading ? 0 : allTasksQuery.data.length}
          data={allTasksQuery.isLoading ? 0 : allTasksQuery.data.length}
          description={"Tasks"}
        />,
        <DataCard
          title={"Total"}
          data={
            allTasksQuery.isLoading
              ? 0
              : allTasksQuery.data.filter((task) => task.status === "Pending")
                  .length
          }
          description={"Pending Tasks"}
        />,
        <DataCard
          title={"Total"}
          data={
            allTasksQuery.isLoading
              ? 0
              : allTasksQuery.data.filter((task) => task.status === "Completed")
                  .length
          }
          description={"Completed Tasks"}
        />,
      ],
    },
    {
      layout: 2,
      widgets: [
        // <WidgetSection
        //   layout={1}
        //   title={"Overall Pending v/s Assigned Tasks"}
        //   border>
        //   <PieChartMui
        //     data={tasksPieChartData}
        //     options={tasksPieChartOptions}
        //   />
        // </WidgetSection>,
        <WidgetSection border title={"Overall Pending v/s Completed Tasks"}>
          <PieChartMui
            data={dynamicTasksPieChartData}
            options={dynamicTasksPieChartOptions}
          />
        </WidgetSection>,
        // <WidgetSection
        //   layout={1}
        //   title={"Department-wise Pending Tasks"}
        //   border>
        //   <PieChartMui
        //     data={departmentPendingStats}
        //     options={departmentPieChartOptions}
        //   />
        // </WidgetSection>,

        <WidgetSection border title={"Department-wise Pending Tasks"}>
          <PieChartMui
            data={departmentPendingStats}
            options={departmentPendingOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 1,
      widgets: [
        <WidgetSection layout={2} padding>
          {/* <MuiTable
            Title="My Tasks Today"
            columns={myTasksColumns}
            rows={isTaskListLoading ? [] : taskList || []}
            rowKey="id"
            rowsToDisplay={10}
            scroll={true}
            className="h-full"
          /> */}
          <MuiTable
            key={priorityTasks.length}
            scroll
            rowsToDisplay={4}
            Title={"Top 10 High Priority Due Tasks"}
            rows={priorityTasks}
            columns={priorityTasksColumns}
          />

          <MuiTable
            Title="My Meetings Today"
            columns={myTodayMeetingsColumns}
            rows={myTodayMeetingsData}
            rowKey="id"
            rowsToDisplay={10}
            scroll={true}
            className="h-full"
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 1,
      widgets: [
        <WidgetSection layout={1} padding>
          <MuiTable
            Title={"Recently Added tasks"}
            columns={recentlyAddedTasksCol}
            rows={recentlyAddedTasksData}
            rowKey="id"
            rowsToDisplay={10}
            scroll={true}
            className="h-full"
          />
        </WidgetSection>,
      ],
    },
  ];
  return (
    <div>
      <div className="flex flex-col p-4 gap-4">
        {meetingsWidgets.map((widget, index) => (
          <div>
            <WidgetSection key={index} layout={widget.layout} padding>
              {widget?.widgets}
            </WidgetSection>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksDashboard;
