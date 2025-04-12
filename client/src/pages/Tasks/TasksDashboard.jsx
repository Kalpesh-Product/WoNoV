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
  tasksPieChartData,
  tasksPieChartOptions,
  tasksMonthlyData,
  tasksMonthlyOptions,
  departmentPendingData,
  departmentPieChartOptions,
  myTasksColumns,
  myTasksData,
  myTodayMeetingsColumns,
  myTodayMeetingsData,
  recentlyAddedTasksCol,
  recentlyAddedTasksData,
} from "./TasksData";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { Chip } from "@mui/material";

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

  const priorityTasks = [
    { taskName: "Review member feedback", type: "Daily", endTime: "12:00 PM" },
    {
      taskName: "Meet with community manager",
      type: "Daily",
      endTime: "03:00 PM",
    },
    {
      taskName: "Analyze space utilization data",
      type: "Monthly",
      endTime: "10:00 AM",
    },
    {
      taskName: "Check inventory of office supplies",
      type: "Daily",
      endTime: "02:30 PM",
    },
    {
      taskName: "Verify cleaning crew checklist",
      type: "Daily",
      endTime: "08:00 AM",
    },
    {
      taskName: "Review security protocols",
      type: "Daily",
      endTime: "11:45 PM",
    },
    {
      taskName: "Approve monthly financial reports",
      type: "Monthly",
      endTime: "06:00 PM",
    },
    {
      taskName: "Plan next community event",
      type: "Daily",
      endTime: "07:30 PM",
    },
    {
      taskName: "Evaluate new location prospects",
      type: "Monthly",
      endTime: "04:15 PM",
    },
    {
      taskName: "Meet with potential partners",
      type: "Monthly",
      endTime: "01:00 PM",
    },
  ];

  const priorityTasksColumns = [
    { id: "id", label: "ID", align: "left" },
    { id: "taskName", label: "Task Name", align: "left" },
    {
      id: "type",
      label: "Type",
      renderCell: (data) => {
        return (
          <>
            <Chip sx={{ color: "#1E3D73" }} label={data.type} />
          </>
        );
      },
      align: "left",
    },
    { id: "endTime", label: "End Time", align: "left" },
  ];

  const executiveTimings = [
    {
      name: "Mac",
      building: "DTC",
      unitNo: "002",
      startTime: "9:00AM",
      endTime: "06:00PM",
    },
  ];
  const executiveTimingsColumns = [
    { id: "id", label: "ID", align: "left" },
    { id: "name", label: "Name", align: "left" },
    { id: "building", label: "Building", align: "left" },
    { id: "unitNo", label: "Unit No", align: "left" },
    { id: "startTime", label: "Start Time", align: "left" },
    { id: "endTime", label: "End Time", align: "left" },
  ];
  //----------------------------------------------------------------------------------------------------------//

  // Dept wise tsks
  //----------------------------------------------------------------------------------------------------------//
  const clientComplaints = [
    { client: "Tech", complaints: "50" },
    { client: "HR", complaints: "60" },
    { client: "Sales", complaints: "30" },
    { client: "Finance", complaints: "80" },
    { client: "Admin", complaints: "80" },
    { client: "IT", complaints: "80" },
    { client: "Maintenamce", complaints: "80" },
    // { client: "G-7", complaints: "8" },
  ];

  const totalClientComplaints = clientComplaints.reduce(
    (sum, item) => sum + item.complaints,
    0
  );
  const pieComplaintsData = clientComplaints.map((item) => ({
    label: `${item.client} (${(
      (item.complaints / totalClientComplaints) *
      100
    ).toFixed(1)}%)`,
    value: item.complaints,
  }));
  const pieComplaintsOptions = {
    labels: clientComplaints.map((item) => item.client),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    tooltip: {
      y: {
        formatter: (val) =>
          `${((val / totalClientComplaints) * 100).toFixed(1)}`,
      },
    },
    colors: [
      "#00ba09",
      "#ff4545",
      "#ffa500",
      "#0000ff",
      "#800080",
      "#ede900",
      "#dc00b0",
    ],
  };
  //----------------------------------------------------------------------------------------------------------//

  // MonthlyDueTasks Data
  const monthlyDueTasksData = [
    { monthlyDueTasks: "Completed Tasks", count: "45" },
    { monthlyDueTasks: "Pending Tasks", count: "40" },
  ];
  const totalMonthlyDueTasksCount = monthlyDueTasksData.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const pieMonthlyDueTasksData = monthlyDueTasksData.map((item) => ({
    label: `${item.monthlyDueTasks} ${(
      (item.count / totalMonthlyDueTasksCount) *
      100
    ).toFixed(1)}%`,
    value: item.count,
  }));
  const pieMonthlyDueTasksOptions = {
    labels: monthlyDueTasksData.map((item) => item.monthlyDueTasks),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    tooltip: {
      y: {
        formatter: (val) =>
          `${((val / totalMonthlyDueTasksCount) * 100).toFixed(1)}%`,
      },
    },
    colors: ["#00ba09", "#ff4545"],
  };
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
    : allTasksQuery.data.length - completedTasks;

  const projectsAssignedByMe = allProjectsQuery.isLoading
    ? 0
    : allProjectsQuery.data?.filter((project) => {
        return project.assignedBy === auth.user._id;
      }).length;

  const projectsAssignedToMe = allProjectsQuery.isLoading
    ? 0
    : allProjectsQuery?.data.filter((project) => {
        return auth.user.firstName in project.assignees;
      }).length;

  // Data for Overall Pending v/s Assigned Tasks
  const completedPercentagePie = allTasksQuery.isLoading
    ? 0
    : (completedTasks / allTasksQuery.data.length) * 100;
  const pendingPercentagePie = allTasksQuery.isLoading
    ? 0
    : (pendingTasks / allTasksQuery.data.length) * 100;

  const tasksPieChartData = [
    { label: "Completed", value: completedPercentagePie },
    { label: "Pending", value: pendingPercentagePie },
  ];

  //Department-wise Pending Tasks

  const calculatePendingTasks = (tasks) => {
    // Group tasks by department
    const departmentMap = tasks.reduce((acc, task) => {
      const department = task.project.department.name;
      const isPending = task.status === "Pending";

      if (!acc[department]) {
        acc[department] = { total: 0, pending: 0 };
      }

      acc[department].total += 1;
      if (isPending) acc[department].pending += 1;

      return acc;
    }, {});

    return Object.entries(departmentMap).map(([department, data]) => ({
      label: department,
      value: (data.pending / data.total) * 100,
    }));
  };

  const tasks = allTasksQuery.isLoading ? [] : allTasksQuery.data;

  const departmentPendingStats = calculatePendingTasks(tasks);

  const departmentPieChartOptions = {
    chart: {
      type: "pie",
    },
    labels: departmentPendingStats.map((d) => d.label),
    colors: ["#FF5733", "#FFC300", "#36A2EB"], // Different colors for each department
    legend: {
      position: "right",
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(1)}%`, // Show percentage with 1 decimal
      },
    },
  };

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
          time: meeting.startTime,
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
          title={"Overall Average Tasks Completion"}>
          <BarGraph
            height={400}
            data={tasksMonthlyData}
            options={tasksMonthlyOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 6,
      widgets: [
        <Card route={"KRA"} title={"KRA"} icon={<RiPagesLine />} />,
        <Card
          route={"/app/tasks/project-list"}
          title={"Project List"}
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
          data={allTasksQuery.isLoading ? 0 : allTasksQuery.data.length}
          description={"Tasks"}
        />,
        <DataCard
          title={"Total"}
          data={pendingTasks}
          description={"Pending Tasks"}
        />,
        <DataCard
          title={"Total"}
          data={completedTasks}
          description={"Completed Tasks"}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          title={"Total"}
          data={allProjectsQuery.isLoading ? 0 : allProjectsQuery.data.length}
          description={"My Projects"}
        />,
        <DataCard
          title={"Total"}
          data={projectsAssignedToMe}
          description={"Tasks Assigned to Me"}
        />,
        <DataCard
          title={"Total"}
          data={projectsAssignedByMe}
          description={"Tasks Assigned by Me"}
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
            data={pieMonthlyDueTasksData}
            options={pieMonthlyDueTasksOptions}
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
            data={pieComplaintsData}
            options={pieComplaintsOptions}
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
            rows={[
              ...priorityTasks.map((task, index) => ({
                id: index + 1,
                taskName: task.taskName,
                type: task.type,
                endTime: task.endTime,
              })),
            ]}
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
