import React, { useEffect } from "react";
import Card from "../../../components/Card";
import {
  MdFormatListBulleted,
  MdOutlineMiscellaneousServices,
} from "react-icons/md";
import { SiCashapp, SiGoogleadsense } from "react-icons/si";
import WidgetSection from "../../../components/WidgetSection";
import LayerBarGraph from "../../../components/graphs/LayerBarGraph";
import DataCard from "../../../components/DataCard";
import PieChartMui from "../../../components/graphs/PieChartMui";
import DonutChart from "../../../components/graphs/DonutChart";
import MuiTable from "../../../components/Tables/MuiTable";
import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BudgetGraph from "../../../components/graphs/BudgetGraph";
import { inrFormat } from "../../../utils/currencyFormat";
import { useSidebar } from "../../../context/SideBarContext";

const MaintainanceDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const navigate = useNavigate();
  const utilisedData = [
    125000, 150000, 99000, 85000, 70000, 50000, 80000, 95000, 100000, 65000,
    50000, 120000,
  ];

  const maxBudget = [
    100000, 120000, 100000, 100000, 80000, 60000, 85000, 95000, 100000, 70000,
    60000, 110000,
  ];

  const taskData = [
    { unit: "ST-701A", tasks: 25 },
    { unit: "ST-701B", tasks: 30 },
  ];

  const totalUnitWiseTask = taskData.reduce((sum, item) => sum + item.tasks, 0);
  const unitWisePieData = taskData.map((item) => ({
    label: `${item.unit} (${((item.tasks / totalUnitWiseTask) * 100).toFixed(
      1
    )}%)`,
    value: item.tasks,
  }));

  const unitPieChartOptions = {
    labels: unitWisePieData.map((item) => item.label),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    toolTip: {
      y: {
        formatter: (val) => `${((val / totalUnitWiseTask) * 100).toFixed(1)}%`,
      },
    },
  };

  // ------------------------------------------------------------------------------------------------------------------//
  const executiveTasks = [
    { name: "Mac", tasks:  10 },
    { name: "Rajiv", tasks: 20 },
    { name: "Faizan", tasks: 30 },
  ];

  const executiveTotalTasks = executiveTasks.reduce(
    (sum, user) => sum + user.tasks,
    0
  );
  const pieExecutiveData = executiveTasks.map((user) =>
    parseFloat(((user.tasks / executiveTotalTasks) * 100).toFixed(1))
  );
  const executiveTasksCount = executiveTasks.map((user) => user.tasks);
  const labels = executiveTasks.map((user) => user.name);
  const colors = ["#FF5733", "#FFC300", "#28B463"];

  // ------------------------------------------------------------------------------------------------------------------//
  // Due Maintenance
  const dueMaintenance = [
    { name: "AC", tasks: 10 },
    { name: "Furniture", tasks: 20 },
    { name: "Carpets", tasks: 30 },
    { name: "Plumbing", tasks: 30 },
    { name: "Glass Items", tasks: 30 },
    { name: "Others", tasks: 30 },
  ];

  const executiveDueMaintenance = dueMaintenance.reduce(
    (sum, user) => sum + user.tasks,
    0
  );
  const pieDueMaintenanceData = dueMaintenance.map((user) =>
    parseFloat(((user.tasks / executiveDueMaintenance) * 100).toFixed(1))
  );
  const dueMaintenanceCount = dueMaintenance.map((user) => user.tasks);
  const labelsMaintenance = dueMaintenance.map((user) => user.name);
  const colorsMaintenance = [
    "#FF5733",
    "#FFC300",
    "#28B463",
    "#28b49a",
    "#7a02ad",
    "#ff00e6",
  ];
  //----------------------------------------------------------------------------------------------------------//
  const unitWiseExpense = [
    { unit: "ST-701A", expense: 12000 },
    { unit: "ST-701B", expense: 10000 },
    { unit: "ST-601A", expense: 11500 },
    { unit: "ST-601B", expense: 10000 },
  ];
  const totalUnitWiseExpense = unitWiseExpense.reduce(
    (sum, item) => sum + item.expense,
    0
  );
  const pieUnitWiseExpenseData = unitWiseExpense.map((item) => ({
    label: `${item.unit} (${(
      (item.expense / totalUnitWiseExpense) *
      100
    ).toFixed(1)}%)`,
    value: item.expense,
  }));

  //----------------------------------------------------------------------------------------------------------//
  // Categoty Wise Maintenance
  const categoryWiseMaintenance = [
    { unit: "AC", expense: 12000 },
    { unit: "Carpets", expense: 10000 },
    { unit: "Plumbing", expense: 11500 },
    { unit: "Furniture", expense: 10000 },
    { unit: "Electronics", expense: 10000 },
    { unit: "Stationery", expense: 10000 },
    { unit: "Glass Items", expense: 10000 },
    { unit: "Others", expense: 10000 },
  ];
  const totalCategoryWiseMaintenance = categoryWiseMaintenance.reduce(
    (sum, item) => sum + item.expense,
    0
  );
  const pieCategoryWiseMaintenanceData = categoryWiseMaintenance.map(
    (item) => ({
      label: `${item.unit} (${(
        (item.expense / totalCategoryWiseMaintenance) *
        100
      ).toFixed(1)}%)`,
      value: item.expense,
    })
  );
  const pieCategoryWiseMaintenanceOptions = {
    labels: categoryWiseMaintenance.map((item) => item.unit),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    stroke: {
      show: true,
      width: 5, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    colors: [
      "#0D47A1", // Dark Blue
      "#1565C0",
      "#1976D2",
      "#1E88E5",
      "#2196F3",
      "#42A5F5",
      "#64B5F6",
      "#90CAF9", // Lightest
    ],
    toolTip: {
      y: {
        formatter: (val) => `${((val / totalUnitWiseTask) * 100).toFixed(1)}%`,
      },
    },
  };
  //----------------------------------------------------------------------------------------------------------//
  // Gender Data
  const genderData = [
    { gender: "Male", count: "45" },
    { gender: "Female", count: "40" },
  ];
  const totalGenderCount = genderData.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const pieGenderData = genderData.map((item) => ({
    label: `${item.gender} ${((item.count / totalGenderCount) * 100).toFixed(
      1
    )}%`,
    value: item.count,
  }));
  const pieGenderOptions = {
    labels: genderData.map((item) => item.gender),
    chart: {
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => {
          navigate(
            "/app/dashboard/admin-dashboard/client-members/client-members-data"
          );
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${((val / totalGenderCount) * 100).toFixed(1)}%`,
      },
    },
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
    stroke: {
      show: true,
      width: 6, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
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
  // YearlyDueTasks Data
  const yearlyDueTasksData = [
    { yearlyDueTasks: "Completed Tasks", count: "360" },
    { yearlyDueTasks: "Pending Tasks", count: "480" },
  ];
  const totalYearlyDueTasksCount = yearlyDueTasksData.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const pieYearlyDueTasksData = yearlyDueTasksData.map((item) => ({
    label: `${item.yearlyDueTasks} ${(
      (item.count / totalYearlyDueTasksCount) *
      100
    ).toFixed(1)}%`,
    value: item.count,
  }));
  const pieYearlyDueTasksOptions = {
    labels: yearlyDueTasksData.map((item) => item.yearlyDueTasks),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    tooltip: {
      y: {
        formatter: (val) =>
          `${((val / totalYearlyDueTasksCount) * 100).toFixed(1)}%`,
      },
    },
    stroke: {
      show: true,
      width: 6, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    colors: ["#00ba09", "#ff4545"],
  };

  //----------------------------------------------------------------------------------------------------------//
  // Execution Channel
  const executionChannelData = [
    { executionChannel: "Internal", count: "45" },
    { executionChannel: "External", count: "40" },
  ];
  const totalExecutionChannelCount = executionChannelData.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const pieExecutionChannelData = executionChannelData.map((item) => ({
    label: `${item.executionChannel} ${(
      (item.count / totalExecutionChannelCount) *
      100
    ).toFixed(1)}%`,
    value: item.count,
  }));
  const pieExecutionChannelOptions = {
    labels: executionChannelData.map((item) => item.executionChannel),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    stroke: {
      show: true,
      width: 6, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    tooltip: {
      y: {
        formatter: (val) =>
          `${((val / totalExecutionChannelCount) * 100).toFixed(1)}%`,
      },
    },
  };
  //----------------------------------------------------------------------------------------------------------//

  const priorityTasks = [
    { taskName: "Check Lights", type: "Daily", endTime: "12:00 PM" },
    {
      taskName: "Inspect Fire Extinguishers",
      type: "Daily",
      endTime: "03:00 PM",
    },
    { taskName: "Test Alarm System", type: "Monthly", endTime: "10:00 AM" },
    { taskName: "Clean AC Filters", type: "Daily", endTime: "02:30 PM" },
    { taskName: "Check Water Pressure", type: "Daily", endTime: "08:00 AM" },
    {
      taskName: "Monitor Security Cameras",
      type: "Daily",
      endTime: "11:45 PM",
    },
    {
      taskName: "Update Software Patches",
      type: "Monthly",
      endTime: "06:00 PM",
    },
    { taskName: "Backup Server Data", type: "Daily", endTime: "07:30 PM" },
    { taskName: "Test Emergency Lights", type: "Monthly", endTime: "04:15 PM" },
    { taskName: "Calibrate Sensors", type: "Monthly", endTime: "01:00 PM" },
  ];

  const priorityTasksColumns = [
    { id: "id", label: "Sr No", align: "left" },
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
      srNo: 1,
      id: 2,
      name: "Rajesh Sawant",
      building: "DTC",
      unitNo: "002",
      startTime: "9:00AM",
      endTime: "06:00PM",
    },
    {
      srNo: 2,
      id: 2,
      name: "Praktan Madkaikar",
      building: "ST",
      unitNo: "501(B)",
      startTime: "09:30 AM",
      endTime: "06:30 PM",
    },
    {
      srNo: 3,
      id: 3,
      name: "Rajesh Sawant",
      building: "ST",
      unitNo: "701(A)",
      startTime: "09:00 AM",
      endTime: "06:00 PM",
    },
    {
      srNo: 4,
      id: 4,
      name: "Praktan Madkaikar",
      building: "DTC",
      unitNo: "007",
      startTime: "09:00 AM",
      endTime: "06:00 PM",
    },
    {
      srNo: 5,
      id: 5,
      name: "Praktan Madkaikar",
      building: "DTC",
      unitNo: "004",
      startTime: "09:00 AM",
      endTime: "06:00 PM",
    },
    {
      srNo: 6,
      id: 6,
      name: "Praktan Madkaikar",
      building: "ST",
      unitNo: "601(A)",
      startTime: "09:00 AM",
      endTime: "06:00 PM",
    },
    {
      srNo: 7,
      id: 7,
      name: "Praktan Madkaikar",
      building: "ST",
      unitNo: "601(B)",
      startTime: "09:00 AM",
      endTime: "06:00 PM",
    },
    {
      srNo: 8,
      id: 8,
      name: "Praktan Madkaikar",
      building: "ST",
      unitNo: "501(A)",
      startTime: "09:00 AM",
      endTime: "06:00 PM",
    },
  ];

  const executiveTimingsColumns = [
    { id: "srNo", label: "Sr No", align: "left" },
    { id: "name", label: "Name", align: "left" },
    { id: "building", label: "Building", align: "left" },
    { id: "unitNo", label: "Unit No", align: "left" },
    { id: "startTime", label: "Start Time", align: "left" },
    { id: "endTime", label: "End Time", align: "left" },
  ];
  //----------------------------------------------------------------------------------------------------------//
  const clientComplaints = [
    { client: "ST-701A", complaints: "5" },
    { client: "ST-701B", complaints: "6" },
    { client: "ST-601A", complaints: "3" },
    { client: "ST-601B", complaints: "8" },
    { client: "ST-501A", complaints: "8" },
    { client: "ST-501B", complaints: "8" },
    { client: "G-1", complaints: "8" },
    { client: "G-7", complaints: "8" },
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
    colors: [
      "#0D47A1", // Dark Blue
      "#1565C0",
      "#1976D2",
      "#1E88E5",
      "#2196F3",
      "#42A5F5",
      "#64B5F6",
      "#90CAF9", // Lightest
    ],
    stroke: {
      show: true,
      width: 6, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    tooltip: {
      y: {
        formatter: (val) =>
          `${((val / totalClientComplaints) * 100).toFixed(1)}`,
      },
    },
  };
  //----------------------------------------------------------------------------------------------------------//

  //----------------------------------------------------------------------------------------------------------//

  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection
          border
          title={"Budget v/s Achievements"}
          titleLabel={"FY 2024-25"}>
          <BudgetGraph
            utilisedData={utilisedData}
            maxBudget={maxBudget}
            route={"finance/budget"}
          />
          <hr />
          <WidgetSection layout={3} padding>
            <DataCard
              data={"INR 40,000"}
              title={"Projected"}
              route={"/app/dashboard/maintenance-dashboard/finance/budget"}
              description={`Current Month: ${new Date().toLocaleString(
                "default",
                {
                  month: "short",
                }
              )}-25`}
            />
            <DataCard
              data={"INR 35,000"}
              title={"Actual"}
              route={"/app/dashboard/maintenance-dashboard/finance/budget"}
              description={`Current Month: ${new Date().toLocaleString(
                "default",
                {
                  month: "short",
                }
              )}-25`}
            />
            <DataCard
              data={"INR 16,000"}
              title={"Requested"}
              route={"/app/dashboard/maintenance-dashboard/finance/budget"}
              description={`Current Month: ${new Date().toLocaleString(
                "default",
                {
                  month: "short",
                }
              )}-25`}
            />
          </WidgetSection>
        </WidgetSection>,
      ],
    },
    {
      layout: 6,
      widgets: [
        <Card
          icon={<MdFormatListBulleted />}
          title="Annual Expenses"
          route={"/app/dashboard/maintenance-dashboard/annual-expenses"}
        />,
        <Card
          icon={<MdFormatListBulleted />}
          title="Inventory"
          route={"/app/dashboard/maintenance-dashboard/inventory"}
        />,
        <Card
          icon={<SiCashapp />}
          title="Finance"
          route={"/app/dashboard/maintenance-dashboard/finance"}
        />,
        <Card icon={<MdFormatListBulleted />} title="Mix-Bag" />,
        <Card
          icon={<SiGoogleadsense />}
          title="Data"
          route={"/app/dashboard/maintenance-dashboard/data"}
        />,
        <Card
          icon={<MdOutlineMiscellaneousServices />}
          title="Settings"
          route={"/app/dashboard/maintenance-dashboard/settings"}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          route={"maintenance-offices"}
          title={"Total"}
          data={"11"}
          description={"Offices Under Maintenance"}
        />,
        <DataCard
          route={"/app/tasks"}
          title={"Total"}
          data={"38"}
          description={"Monthly Due Tasks"}
        />,
        <DataCard
          route={"maintenance-expenses"}
          title={"Average"}
          data={`INR ${inrFormat("61000")}`}
          description={"Monthly Expense"}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          route={"per-sq-ft-expense"}
          title={"Total"}
          data={"INR 350"}
          description={"Expense Per Sq. Ft."}
        />,
        <DataCard
          route={"maintenance-assets"}
          title={"Total"}
          data={"250"}
          description={"Assets Under Management"}
        />,
        <DataCard
          route={"annual-expenses"}
          title={"Free"}
          data={"INR 200"}
          description={"Yearly Expense"}
        />,
      ],
    },

    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Category Wise Maintenance"}>
          <PieChartMui
            data={pieCategoryWiseMaintenanceData}
            options={pieCategoryWiseMaintenanceOptions}
          />
        </WidgetSection>,
        <WidgetSection border title={"Due Maintenance"}>
          <DonutChart
            centerLabel="Due Tasks"
            labels={labelsMaintenance}
            colors={colorsMaintenance}
            series={pieDueMaintenanceData}
            tooltipValue={dueMaintenanceCount}
          />
        </WidgetSection>,
      ],
    },

    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Unit Wise Maintenance"}>
          <PieChartMui
            data={pieComplaintsData}
            options={pieComplaintsOptions}
          />
        </WidgetSection>,
        <WidgetSection border title={"Maintenance Execution Channel"}>
          <PieChartMui
            data={pieExecutionChannelData}
            options={pieExecutionChannelOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Average Monthly Due Maintenance"}>
          <PieChartMui
            data={pieMonthlyDueTasksData}
            options={pieMonthlyDueTasksOptions}
          />
        </WidgetSection>,
        <WidgetSection border title={"Average Yearly Due Maintenance"}>
          <PieChartMui
            data={pieYearlyDueTasksData}
            options={pieYearlyDueTasksOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
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
        />,
        <MuiTable
          key={executiveTimings.length}
          Title={"Weekly Executive Shift Timing"}
          rows={[
            ...executiveTimings.map((timing, index) => ({
              srNo: index + 1,
              name: timing.name,
              building: timing.building,
              unitNo: timing.unitNo,
              startTime: timing.startTime,
              endTime: timing.endTime,
            })),
          ]}
          columns={executiveTimingsColumns}
          scroll
          rowsToDisplay={4}
        />,
      ],
    },
  ];

  return (
    <div>
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout}>
          {section?.widgets}
        </WidgetSection>
      ))}
    </div>
  );
};

export default MaintainanceDashboard;
