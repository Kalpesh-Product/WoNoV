import React from "react";
import Card from "../../../components/Card";
import {
  MdFormatListBulleted,
  MdOutlineMiscellaneousServices,
} from "react-icons/md";
import { SiCashapp, SiGoogleadsense } from "react-icons/si";
import WidgetSection from "../../../components/WidgetSection";
import DataCard from "../../../components/DataCard";
import PieChartMui from "../../../components/graphs/PieChartMui";
import MuiTable from "../../../components/Tables/MuiTable";
import { Chip } from "@mui/material";
import DonutChart from "../../../components/graphs/DonutChart";
import { useNavigate } from "react-router-dom";
import BudgetGraph from "../../../components/graphs/BudgetGraph";
import { inrFormat } from "../../../utils/currencyFormat";

const ItDashboard = () => {
  const navigate = useNavigate()
  const utilisedData = [
    1250000, 1500000, 990000, 850000, 700000, 500000, 800000, 950000, 1000000, 650000,
    500000, 1200000,
  ];

  const maxBudget = [
    1000000, 1200000, 1000000, 1000000, 800000, 600000, 850000, 950000, 1000000, 700000,
    600000, 1100000,
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
      events: {
        dataPointSelection: () => {
          navigate("/app/tasks");
        },
      },
    },
    toolTip: {
      y: {
        formatter: (val) => `${((val / totalUnitWiseTask) * 100).toFixed(1)}%`,
      },
    },
  };

  // ------------------------------------------------------------------------------------------------------------------//
  const executiveTasks = [
    { name: "Mac", tasks: 10 },
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
  const pieUnitWiseExpenseOptions = {
    labels: unitWiseExpense.map((item) => item.unit),
    chart: {
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => {
          navigate("/app/dashboard/IT-dashboard/annual-expenses");
        },
      },
    },
    toolTip: {
      y: {
        formatter: (val) => `${((val / totalUnitWiseTask) * 100).toFixed(1)}%`,
      },
    },
  };
  //----------------------------------------------------------------------------------------------------------//
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
    },
    tooltip: {
      y: {
        formatter: (val) => `${((val / totalGenderCount) * 100).toFixed(1)}%`,
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
      name: "Mac",
      building: "DTC",
      unitNo: "002",
      startTime: "9:00AM",
      endTime: "06:00PM",
    },
    {
      name: "Faizan",
      building: "DTC",
      unitNo: "004",
      startTime: "10:00AM",
      endTime: "07:00PM",
    },
    {
      name: "Faizan",
      building: "ST",
      unitNo: "601(A)",
      startTime: "8:30AM",
      endTime: "05:30PM",
    },
    {
      name: "Dasmond",
      building: "ST",
      unitNo: "701(A)",
      startTime: "9:15AM",
      endTime: "06:15PM",
    },
    {
      name: "Dasmond",
      building: "DTC",
      unitNo: "501(B)",
      startTime: "10:00AM",
      endTime: "07:00PM",
    },
    {
      name: "Rajeev",
      building: "DTC",
      unitNo: "601(B)",
      startTime: "8:00AM",
      endTime: "04:00PM",
    },
    {
      name: "Rajeev",
      building: "ST",
      unitNo: "701(A)",
      startTime: "11:00AM",
      endTime: "08:00PM",
    },
    {
      name: "Faizan",
      building: "ST",
      unitNo: "005",
      startTime: "9:45AM",
      endTime: "06:45PM",
    },
  ];
  
  const executiveTimingsColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "name", label: "Name", align: "left" },
    { id: "building", label: "Building", align: "left" },
    { id: "unitNo", label: "Unit No", align: "left" },
    { id: "startTime", label: "Start Time", align: "left" },
    { id: "endTime", label: "End Time", align: "left" },
  ];
  //----------------------------------------------------------------------------------------------------------//
  const clientComplaints = [
    { client: "Zomato", complaints: "5" },
    { client: "SqaudStack", complaints: "6" },
    { client: "Swiggy", complaints: "3" },
    { client: "Zimetrics", complaints: "8" },
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
  };
  //----------------------------------------------------------------------------------------------------------//
  const complaintTypes = [
    { type: "WiFi", count: 8 },
    { type: "Assets", count: 12 },
    { type: "Biometrics", count: 6 },
    { type: "Others", count: 12 },
  ];

  const totalComplaintTypes = complaintTypes.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const donutComplaintTypeData = complaintTypes.map((item) =>
    parseFloat(((item.count / totalComplaintTypes) * 100).toFixed(1))
  );
  const complaintCounts = complaintTypes.map((item) => item.count);
  const complaintTypeLabels = complaintTypes.map((item) => item.type);
  //----------------------------------------------------------------------------------------------------------//

  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection border title={"Budget v/s Achievements"}>
          <BudgetGraph utilisedData={utilisedData} maxBudget={maxBudget} />
          <hr />
          <WidgetSection layout={3} padding>
            <DataCard
              data={"INR " + inrFormat("4000000")}
              title={"Projected"}
              route={"/app/dashboard/it-dashboard/finance/budget"}
              description={`Current Month : ${new Date().toLocaleString(
                "default",
                { month: "long" }
              )}`}
            />
            <DataCard
              data={"INR " + inrFormat("3500000")}
              title={"Actual"}
              route={"/app/dashboard/it-dashboard/finance/budget"}
              description={`Current Month : ${new Date().toLocaleString(
                "default",
                { month: "long" }
              )}`}
            />
            <DataCard
              data={"INR " + inrFormat(60000)}
              title={"Requested"}
              route={"/app/dashboard/it-dashboard/finance/budget"}
              description={`Current Month : ${new Date().toLocaleString(
                "default",
                { month: "long" }
              )}`}
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
          title="Annual Expense"
          route={"/app/dashboard/IT-dashboard/annual-expenses"}
        />,
        <Card
          icon={<MdFormatListBulleted />}
          title="Inventory"
          route={"/app/dashboard/IT-dashboard/inventory"}
        />,
        <Card
          icon={<SiCashapp />}
          title="Finance"
          route={"/app/dashboard/IT-dashboard/finance"}
        />,
        <Card icon={<MdFormatListBulleted />} title="Mix-Bag" />,
        <Card
          icon={<SiGoogleadsense />}
          title="Data"
          route={"/app/dashboard/IT-dashboard/data"}
        />,
        <Card
          icon={<MdOutlineMiscellaneousServices />}
          title="Settings"
          route={"/app/dashboard/IT-dashboard/settings"}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          data={"05"}
          title={"Offices"}
          description={"Under Management"}
          route={"it-offices"}
        />,
        <DataCard
          data={"58"}
          title={"Total"}
          description={"Due Tasks This Month"}
        />,
        <DataCard
          data={"500"}
          title={"Total"}
          description={"Internet Expense per sq.ft"}
          route={"per-sq-ft-internet-expense"}
        />,
        <DataCard
          data={"350"}
          title={"Total"}
          description={"Expense per sq.ft"}
          route={"per-sq-ft-expense"}
        />,
        <DataCard
          route={"it-expenses"}
          title={"Average"}
          data={"INR " + inrFormat("600000")}
          description={"Monthly Expense"}
        />,
        <DataCard
          data={"INR " + inrFormat("8000000")}
          title={"Average"}
          description={"Yearly Expense"}
        />,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Unit Wise Due Tasks"}>
          <PieChartMui data={unitWisePieData} options={unitPieChartOptions} />
        </WidgetSection>,
        <WidgetSection border title={"Executive Wise Due Tasks"}>
          <DonutChart
            centerLabel="Tasks"
            labels={labels}
            colors={colors}
            series={pieExecutiveData}
            tooltipValue={executiveTasksCount}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Unit Wise IT Expenses"}>
          <PieChartMui
            data={pieUnitWiseExpenseData}
            options={pieUnitWiseExpenseOptions}
          />
        </WidgetSection>,
        <WidgetSection border title={"Biometrics Gender Data"}>
          <PieChartMui data={pieGenderData} options={pieGenderOptions} />
        </WidgetSection>,
      ],
    },
    //Last section
    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Client-Wise Complaints"}>
          <PieChartMui
            data={pieComplaintsData}
            options={pieComplaintsOptions}
          />
        </WidgetSection>,
        <WidgetSection border title={"Type Of IT Complaints"}>
          <DonutChart
            centerLabel={``}
            labels={complaintTypeLabels}
            series={donutComplaintTypeData}
            tooltipValue={complaintCounts}
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
              id: index + 1,
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

export default ItDashboard;
