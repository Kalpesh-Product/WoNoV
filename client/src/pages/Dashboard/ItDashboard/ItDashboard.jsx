import React, { Suspense, useEffect, useMemo, useState } from "react";
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
import { Box, Chip, Skeleton } from "@mui/material";
import DonutChart from "../../../components/graphs/DonutChart";
import { useNavigate } from "react-router-dom";
import BudgetGraph from "../../../components/graphs/BudgetGraph";
import { inrFormat } from "../../../utils/currencyFormat";
import { useSidebar } from "../../../context/SideBarContext";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { transformBudgetData } from "../../../utils/transformBudgetData";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import usePageDepartment from "../../../hooks/usePageDepartment";
import humanDate from "../../../utils/humanDateForamt";
import humanTime from "../../../utils/humanTime";
import useAuth from "../../../hooks/useAuth";
import { PERMISSIONS } from "./../../../constants/permissions";
import { filterPermissions } from "../../../utils/accessConfig";

const ItDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();
  const department = usePageDepartment();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("FY 2024-25");
  const axios = useAxiosPrivate();

  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  //------------------------PAGE ACCESS START-------------------//
  const cardsConfig = [
    {
      route: "/app/dashboard/IT-dashboard/annual-expenses",
      title: "Annual Expenses",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.IT_ANNUAL_EXPENSES.value,
    },
    {
      route: "/app/dashboard/IT-dashboard/inventory",
      title: "Inventory",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.IT_INVENTORY.value,
    },
    {
      route: "/app/dashboard/IT-dashboard/finance",
      title: "Finance",
      icon: <SiCashapp />,
      permission: PERMISSIONS.IT_FINANCE.value,
    },
    {
      route: "/app/dashboard/it-dashboard/mix-bag",
      title: "Mix Bag",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.IT_MIX_BAG.value,
    },
    {
      route: "/app/dashboard/IT-dashboard/data",
      title: "Data",
      icon: <SiGoogleadsense />,
      permission: PERMISSIONS.IT_DATA.value,
    },
    {
      route: "/app/dashboard/IT-dashboard/settings",
      title: "Settings",
      icon: <MdOutlineMiscellaneousServices />,
      permission: PERMISSIONS.IT_SETTINGS.value,
    },
  ];

  const allowedCards = cardsConfig.filter(
    (card) => !card.permission || userPermissions.includes(card.permission)
  );
  //------------------------PAGE ACCESS END-------------------//

  const { data: hrFinance = [], isLoading: isHrFinanceLoading } = useQuery({
    queryKey: ["it-budget"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=6798baa8e469e809084e2497
            `
        );
        return response.data?.allBudgets;
      } catch (error) {
        throw new Error("Error fetching data");
      }
    },
  });

  const totalOverallExpense = isHrFinanceLoading
    ? []
    : hrFinance.reduce((sum, item) => sum + item.actualAmount || 0, 0);

  const monthlyGroups = {};

  hrFinance.forEach((item) => {
    const dueDate = new Date(item.dueDate);
    const monthKey = `${dueDate.getFullYear()}-${dueDate.getMonth() + 1}`; // e.g., "2024-4"
    if (!monthlyGroups[monthKey]) monthlyGroups[monthKey] = [];
    monthlyGroups[monthKey].push(item.actualAmount || 0);
  });

  const monthlyTotals = Object.values(monthlyGroups).map((amounts) =>
    amounts.reduce((sum, val) => sum + val, 0)
  );

  const averageMonthlyExpense = monthlyTotals.length
    ? monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length
    : 0;

  //------------------------Graph round functions-------------------//
  const expenseSeries = useMemo(() => {
    // Initialize monthly buckets
    const months = Array.from({ length: 12 }, (_, index) =>
      dayjs(`2024-04-01`).add(index, "month").format("MMM")
    );

    const fyData = {
      "FY 2024-25": Array(12).fill(0),
      "FY 2025-26": Array(12).fill(0),
    };

    hrFinance.forEach((item) => {
      const date = dayjs(item.dueDate);
      const year = date.year();
      const monthIndex = date.month(); // 0 = Jan, 11 = Dec

      if (year === 2024 && monthIndex >= 3) {
        // Apr 2024 to Dec 2024 (month 3 to 11)
        fyData["FY 2024-25"][monthIndex - 3] += item.actualAmount || 0;
      } else if (year === 2025) {
        if (monthIndex <= 2) {
          // Jan to Mar 2025 (months 0–2)
          fyData["FY 2024-25"][monthIndex + 9] += item.actualAmount || 0;
        } else if (monthIndex >= 3) {
          // Apr 2025 to Dec 2025 (months 3–11)
          fyData["FY 2025-26"][monthIndex - 3] += item.actualAmount || 0;
        }
      } else if (year === 2026 && monthIndex <= 2) {
        // Jan to Mar 2026
        fyData["FY 2025-26"][monthIndex + 9] += item.actualAmount || 0;
      }
    });

    return [
      {
        name: "total",
        group: "FY 2024-25",
        data: fyData["FY 2024-25"],
      },
      {
        name: "total",
        group: "FY 2025-26",
        data: fyData["FY 2025-26"],
      },
    ];
  }, [hrFinance]);

  const maxExpenseValue = Math.max(
    ...expenseSeries.flatMap((series) => series.data)
  );
  const roundedMax = Math.ceil((maxExpenseValue + 100000) / 100000) * 100000;
  //------------------------Graph round functions-------------------//
  //----------------------KPA Data-----------------------//
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `api/performance/get-tasks?dept=${department?._id}&type=KPA`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
    queryKey: ["fetchedMonthlyKPA"],
    queryFn: fetchDepartments,
  });
  //----------------------KPA Data-----------------------//
  //----------------------------Tasks Data-------------------------------//
  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tasks/get-tasks?dept=${department._id}`
        );
        return response.data;
      } catch (error) {
        throw new Error("Error fetching data");
      }
    },
  });

  //----------------------------Tasks Data-------------------------------//
  //----------------------Units data-----------------------//
  const { data: unitsData = [], isLoading: isUnitsData } = useQuery({
    queryKey: ["units-data"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/company/fetch-simple-units
          `
        );
        return response.data;
      } catch (error) {
        throw new Error("Error fetching data");
      }
    },
  });
  const totalSqFt = isUnitsData
    ? []
    : unitsData.reduce((acc, unit) => acc + (unit.sqft || 0), 0);

  const internetExpense = isHrFinanceLoading
    ? []
    : hrFinance
        .filter((item) => item.expanseType === "INTERNET EXPENSES")
        .reduce((sum, item) => sum + item.actualAmount || 0, 0);

  //----------------------Units data-----------------------//

  const { data: weeklySchedule = [], isLoading: isWeeklyScheduleLoading } =
    useQuery({
      queryKey: ["weeklySchedule"],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/weekly-unit/fetch-weekly-unit/${department._id}`
          );
          return response.data;
        } catch (error) {
          throw new Error("Error fetching data");
        }
      },
    });

  const { data: tickets = [], isLoading: isTicketsLoading } = useQuery({
    queryKey: ["ticketIssues"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tickets/department-tickets/${department._id}`
        );
        return response.data;
      } catch (error) {
        throw new Error("Error fetching data");
      }
    },
  });

  const hrBarData = transformBudgetData(!isHrFinanceLoading ? hrFinance : []);
  const totalExpense = hrBarData?.projectedBudget?.reduce(
    (sum, val) => sum + (val || 0),
    0
  );

  const expenseRawSeries = useMemo(() => {
    // Initialize monthly buckets
    const months = Array.from({ length: 12 }, (_, index) =>
      dayjs(`2024-04-01`).add(index, "month").format("MMM")
    );

    const fyData = {
      "FY 2024-25": Array(12).fill(0),
      "FY 2025-26": Array(12).fill(0),
    };

    hrFinance.forEach((item) => {
      const date = dayjs(item.dueDate);
      const year = date.year();
      const monthIndex = date.month(); // 0 = Jan, 11 = Dec

      if (year === 2024 && monthIndex >= 3) {
        // Apr 2024 to Dec 2024 (month 3 to 11)
        fyData["FY 2024-25"][monthIndex - 3] += item.actualAmount || 0;
      } else if (year === 2025) {
        if (monthIndex <= 2) {
          // Jan to Mar 2025 (months 0–2)
          fyData["FY 2024-25"][monthIndex + 9] += item.actualAmount || 0;
        } else if (monthIndex >= 3) {
          // Apr 2025 to Dec 2025 (months 3–11)
          fyData["FY 2025-26"][monthIndex - 3] += item.actualAmount || 0;
        }
      } else if (year === 2026 && monthIndex <= 2) {
        // Jan to Mar 2026
        fyData["FY 2025-26"][monthIndex + 9] += item.actualAmount || 0;
      }
    });

    return [
      {
        name: "total",
        group: "FY 2024-25",
        data: fyData["FY 2024-25"],
      },
      {
        name: "total",
        group: "FY 2025-26",
        data: fyData["FY 2025-26"],
      },
    ];
  }, [hrFinance]);

  const expenseOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },

      stacked: false,
      fontFamily: "Poppins-Regular, Arial, sans-serif",
      events: {
        dataPointSelection: () => {
          navigate("finance/budget");
        },
      },
    },
    colors: ["#54C4A7", "#EB5C45"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
        borderRadiusApplication: "none",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => {
        return inrFormat(val);
      },

      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
      offsetY: -22,
    },

    yaxis: {
      min: 0,
      max: roundedMax,
      tickAmount: 4,
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => `${val / 100000}`,
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      show: true,
      position: "top",
    },

    tooltip: {
      enabled: false,
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        const rawData = expenseRawSeries[seriesIndex]?.data[dataPointIndex];
        // return `<div style="padding: 8px; font-family: Poppins, sans-serif;">
        //       HR Expense: INR ${rawData.toLocaleString("en-IN")}
        //     </div>`;
        return `
              <div style="padding: 8px; font-size: 13px; font-family: Poppins, sans-serif">
          
                <div style="display: flex; align-items: center; justify-content: space-between; background-color: #d7fff4; color: #00936c; padding: 6px 8px; border-radius: 4px; margin-bottom: 4px;">
                  <div><strong>Finance Expense:</strong></div>
                  <div style="width: 10px;"></div>
               <div style="text-align: left;">INR ${Math.round(
                 rawData
               ).toLocaleString("en-IN")}</div>
  
                </div>
       
              </div>
            `;
      },
    },
  };
  const budgetBar = useMemo(() => {
    if (isHrFinanceLoading || !Array.isArray(hrFinance)) return null;
    return transformBudgetData(isHrFinanceLoading ? [] : hrFinance);
  }, [isHrFinanceLoading, hrFinance]);
  const totalUtilised =
    budgetBar?.[selectedFiscalYear]?.utilisedBudget?.reduce(
      (acc, val) => acc + val,
      0
    ) || 0;
  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const navigate = useNavigate();
  const utilisedData = [
    1250000, 1500000, 990000, 850000, 700000, 500000, 800000, 950000, 1000000,
    650000, 500000, 1200000,
  ];

  const maxBudget = [
    1000000, 1200000, 1000000, 1000000, 800000, 600000, 850000, 950000, 1000000,
    700000, 600000, 1100000,
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
    tooltip: {
      y: {
        formatter: (val) => `${val} Due tasks`, // ✅ Show actual task count
      },
    },
  };

  // ------------------------------------------------------------------------------------------------------------------//
  const executiveTasks = [
    { name: "Machindranath", tasks: 10 },
    { name: "Rajiv", tasks: 20 },
    { name: "Faizan Shaikh", tasks: 30 },
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

  // Label shows % but value used for actual data
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
    tooltip: {
      y: {
        formatter: (val) => `INR ${val.toLocaleString()}`, // ✅ shows actual expense
      },
    },
  };

  //----------------------------------------------------------------------------------------------------------//
  const genderData = [
    { gender: "Male", count: 45 },
    { gender: "Female", count: 40 },
  ];

  // Calculate total for reference
  const totalGenderCount = genderData.reduce(
    (sum, item) => sum + item.count,
    0
  );

  // Prepare pie chart data with labels showing % but values are actual
  const pieGenderData = genderData.map((item) => ({
    label: `${item.gender} ${((item.count / totalGenderCount) * 100).toFixed(
      1
    )}%`,
    value: item.count,
  }));

  // Apex chart options with tooltip showing actual value
  const pieGenderOptions = {
    labels: genderData.map((item) => item.gender),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Members`, // 👈 Show raw value on hover
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
      id: "status",
      label: "Status",
      renderCell: (data) => {
        return (
          <>
            <Chip sx={{ color: "#1E3D73" }} label={data.status} />
          </>
        );
      },
      align: "left",
    },
    { id: "endTime", label: "End Time", align: "left" },
  ];

  const executiveTimings = [
    {
      name: "Machindranath Parkar",
      building: "DTC",
      unitNo: "002",
      startTime: "9:00AM",
      endTime: "06:00PM",
    },
    {
      name: "Faizan Shaikh",
      building: "DTC",
      unitNo: "004",
      startTime: "10:00AM",
      endTime: "07:00PM",
    },
    {
      name: "Faizan Shaikh",
      building: "ST",
      unitNo: "601(A)",
      startTime: "8:30AM",
      endTime: "05:30PM",
    },
    {
      name: "Dasmond Goes",
      building: "ST",
      unitNo: "701(A)",
      startTime: "9:15AM",
      endTime: "06:15PM",
    },
    {
      name: "Dasmond Goes",
      building: "DTC",
      unitNo: "501(B)",
      startTime: "10:00AM",
      endTime: "07:00PM",
    },
    {
      name: "Rajiv Kumar Pal",
      building: "DTC",
      unitNo: "601(B)",
      startTime: "8:00AM",
      endTime: "04:00PM",
    },
    {
      name: "Rajiv Kumar Pal",
      building: "ST",
      unitNo: "701(A)",
      startTime: "11:00AM",
      endTime: "08:00PM",
    },
    {
      name: "Faizan Shaikh",
      building: "ST",
      unitNo: "005",
      startTime: "9:45AM",
      endTime: "06:45PM",
    },
  ];

  const executiveTimingsColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "name", label: "Name", align: "left" },
    { id: "unitNo", label: "Unit No", align: "left" },
    { id: "startDate", label: "Start Date", align: "left" },
    { id: "endDate", label: "End Date", align: "left" },
  ];
  //----------------------------------------------------------------------------------------------------------//
  const clientComplaints = [
    { client: "Zomato", complaints: 1 },
    { client: "SqaudStack", complaints: 2 },
    { client: "Swiggy", complaints: 1 },
    { client: "Zimetrics", complaints: 1 },
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
        formatter: (val) => `${val} complaints`, // ✅ shows actual number
      },
    },
  };

  //----------------------------------------------------------------------------------------------------------//
  // const complaintTypes = [
  //   { type: "WiFi", count: 8 },
  //   { type: "Assets", count: 12 },
  //   { type: "Biometrics", count: 6 },
  //   { type: "Others", count: 12 },
  // ];

  const complaintMap = {};

  tickets.forEach((ticket) => {
    const type = ticket.ticket.trim(); // use exact ticket name as type

    if (!complaintMap[type]) {
      complaintMap[type] = 0;
    }

    complaintMap[type]++;
  });

  const complaintTypes = Object.entries(complaintMap).map(([type, count]) => ({
    type,
    count,
  }));

  const totalComplaintTypes = complaintTypes.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const donutComplaintTypeData = complaintTypes.map((item) =>
    parseFloat(((item.count / totalComplaintTypes) * 100).toFixed(1))
  );
  const complaintCounts = complaintTypes.map((item) => item.count);
  const complaintTypeLabels = complaintTypes.map((item) => item.type);

  const transformedWeeklyShifts = useMemo(() => {
    if (isWeeklyScheduleLoading || !weeklySchedule.length) return [];

    return weeklySchedule.map((emp, index) => ({
      srNo: index + 1,
      id: index + 1,
      name: `${emp.employee.id.firstName} ${emp.employee.id.lastName}`,
      startDate: humanDate(emp.startDate),
      endDate: humanDate(emp.endDate),
      building: emp.location.building.buildingName,
      unitNo: emp.location.unitNo,
    }));
  }, [weeklySchedule, isWeeklyScheduleLoading]);

  const transformedTasks = tasks.map((task, index) => {
    return {
      id: index + 1,
      taskName: task.taskName,
      status: task.status,
      endTime: humanTime(task.dueTime),
    };
  });

  //--------------------ACCESS CONFIG-------------------------//
  const yearlyGraphConfig = [
    {
      key: PERMISSIONS.IT_DEPARTMENT_EXPENSES.value,
      layout: 1,
      type: "BarGraph",
      title: "BIZ Nest IT DEPARTMENT EXPENSE",
      responsiveResize: true,
      chartId: "bargraph-hr-expense",
      options: expenseOptions,
      data: expenseRawSeries,
      titleAmount: `INR ${Math.round(totalUtilised).toLocaleString("en-IN")}`,
      onYearChange: setSelectedFiscalYear,
    },
  ];

  const allowedYearlyGraph = filterPermissions(
    yearlyGraphConfig,
    userPermissions
  );

  //data cards
  const dataCardConfigs = [
    {
      key: PERMISSIONS.IT_OFFICES_UNDER_MANAGEMENT.value,
      title: "Offices",
      data: Array.isArray(unitsData) ? unitsData.length : 0,
      description: "Under Management",
      route: "IT-offices",
    },
    {
      key: PERMISSIONS.IT_DUE_TASKS_THIS_MONTH.value,
      title: "Total",
      data: tasks.length || 0,
      description: "Due Tasks This Month",
      route: "/app/tasks/department-tasks",
    },
    {
      key: PERMISSIONS.IT_INTERNET_EXPENSE_PER_SQFT.value,
      title: "Total",
      data: `INR ${inrFormat(internetExpense / totalSqFt)}`,
      description: "Internet Expense per sq.ft",
      route: "per-sq-ft-internet-expense",
    },
    {
      key: PERMISSIONS.IT_EXPENSE_PER_SQFT.value,
      title: "Total",
      data: `INR ${inrFormat((totalOverallExpense || 0) / totalSqFt)}`,
      description: "Expense per sq.ft",
      route: "per-sq-ft-expense",
    },
    {
      key: PERMISSIONS.IT_MONTHLY_EXPENSE.value,
      title: "Average",
      data: `INR ${inrFormat(averageMonthlyExpense)}`,
      description: "Monthly Expense",
      route: "IT-expenses",
    },
    {
      key: PERMISSIONS.IT_MONTHLY_KPA.value,
      title: "Total",
      data: departmentKra.length || 0,
      description: "Monthly KPA",
      route: "/app/performance/IT/monthly-KPA",
    },
  ];

  const allowedITDataCards = filterPermissions(
    dataCardConfigs,
    userPermissions
  );

  //MUI Tables
  const tableWidgetConfigs = [
    {
      key: PERMISSIONS.IT_TOP_10_HIGH_PRIORITY_DUE_TASKS.value,
      scroll: true,
      rowsToDisplay: 4,
      title: "Top 10 High Priority Due Tasks",
      rows: transformedTasks,
      columns: priorityTasksColumns,
    },
    {
      key: PERMISSIONS.IT_WEEKLY_EXECUTIVE_SHIFT_TIMING.value,
      scroll: true,
      rowsToDisplay: 4,
      title: "Weekly Executive Shift Timing",
      rows: transformedWeeklyShifts,
      columns: executiveTimingsColumns,
    },
  ];

  const allowedTables = filterPermissions(tableWidgetConfigs, userPermissions);

  const pieChartConfig = [
    {
      key: PERMISSIONS.IT_UNIT_WISE_IT_EXPENSES.value,
      type: "PieChartMui",
      title: "Unit Wise IT Expenses",
      border: true,
      data: [],
      options: [],
    },
    {
      key: PERMISSIONS.IT_BIOMETRICS_GENDER_DATA.value,
      type: "PieChartMui",
      title: "Biometrics Activation Data",
      border: true,
      data: [],
      options: [],
    },
  ];
  const allowedPieCharts = filterPermissions(pieChartConfig, userPermissions);

  const dueTasksConfigs = [
    {
      key: PERMISSIONS.IT_UNIT_WISE_DUE_TASKS.value,
      type: "PieChartMui",
      border: true,
      title: "Unit Wise Due Tasks",
      data: [],
      options: [],
    },
    {
      key: PERMISSIONS.IT_EXECUTIVE_WISE_DUE_TASKS.value,
      type: "DonutChart",
      border: true,
      title: "Executive Wise Due Tasks",
      centerLabel: "Tasks",
      labels: [],
      colors: colors,
      series: [],
      tooltipValue: executiveTasksCount,
      width: 500,
    },
  ];
  const allowedDueTasks = filterPermissions(dueTasksConfigs, userPermissions);

  const pieDonutConfig = [
    {
      key: PERMISSIONS.IT_CLIENT_WISE_COMPLAINTS.value,
      type: "PieChartMui",
      border: true,
      title: "Client-Wise Complaints",
      data: [],
      options: [],
    },
    {
      key: PERMISSIONS.IT_TYPE_OF_IT_COMPLAINTS.value,
      type: "DonutChart",
      border: true,
      title: "Type Of IT Complaints",
      centerLabel: "",
      labels: complaintTypeLabels,
      series: donutComplaintTypeData,
      tooltipValue: complaintCounts,
    },
  ];
  const allowedPieDonut = filterPermissions(pieDonutConfig, userPermissions);

  //
  // ----------------------------------------------------------------------------------------------------------//

  // const techWidgets = [
  //   {
  //     layout: 1,
  //     widgets: [
  //       <Suspense
  //         fallback={
  //           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
  //             {/* Simulating chart skeleton */}
  //             <Skeleton variant="text" width={200} height={30} />
  //             <Skeleton variant="rectangular" width="100%" height={300} />
  //           </Box>
  //         }
  //       >
  //         <WidgetSection normalCase layout={1} padding>
  //           <YearlyGraph
  //             data={expenseRawSeries}
  //             responsiveResize
  //             chartId={"bargraph-hr-expense"}
  //             options={expenseOptions}
  //             onYearChange={setSelectedFiscalYear}
  //             title={"BIZ Nest IT DEPARTMENT EXPENSE"}
  //             titleAmount={`INR ${Math.round(totalUtilised).toLocaleString(
  //               "en-IN"
  //             )}`}
  //           />
  //         </WidgetSection>
  //       </Suspense>,
  //     ],
  //   },
  //   // {
  //   //   layout: 6,
  //   //   widgets: [
  //   //     <Card
  //   //       icon={<MdFormatListBulleted />}
  //   //       title="Annual Expense"
  //   //       route={"/app/dashboard/IT-dashboard/annual-expenses"}
  //   //     />,
  //   //     <Card
  //   //       icon={<MdFormatListBulleted />}
  //   //       title="Inventory"
  //   //       route={"/app/dashboard/IT-dashboard/inventory"}
  //   //     />,
  //   //     <Card
  //   //       icon={<SiCashapp />}
  //   //       title="Finance"
  //   //       route={"/app/dashboard/IT-dashboard/finance"}
  //   //     />,
  //   //     <Card
  //   //       icon={<MdFormatListBulleted />}
  //   //       title="Mix-Bag"
  //   //       route={"/app/dashboard/it-dashboard/mix-bag"}
  //   //     />,
  //   //     <Card
  //   //       icon={<SiGoogleadsense />}
  //   //       title="Data"
  //   //       route={"/app/dashboard/IT-dashboard/data"}
  //   //     />,
  //   //     <Card
  //   //       icon={<MdOutlineMiscellaneousServices />}
  //   //       title="Settings"
  //   //       route={"/app/dashboard/IT-dashboard/settings"}
  //   //     />,
  //   //   ],
  //   // },
  //   {
  //     layout: allowedCards.length, // ✅ dynamic layout
  //     widgets: allowedCards.map((card) => (
  //       <Card
  //         key={card.title}
  //         route={card.route}
  //         title={card.title}
  //         icon={card.icon}
  //       />
  //     )),
  //   },
  //   {
  //     layout: 3,
  //     widgets: [
  //       <DataCard
  //         data={Array.isArray(unitsData) ? unitsData.length : 0}
  //         title={"Offices"}
  //         description={"Under Management"}
  //         route={"IT-offices"}
  //       />,
  //       <DataCard
  //         route={"/app/tasks"}
  //         data={tasks.length || 0}
  //         title={"Total"}
  //         description={"Due Tasks This Month"}
  //       />,
  //       <DataCard
  //         data={`INR ${inrFormat(internetExpense / totalSqFt)}`}
  //         title={"Total"}
  //         description={"Internet Expense per sq.ft"}
  //         route={"per-sq-ft-internet-expense"}
  //       />,
  //       <DataCard
  //         data={`INR ${inrFormat((totalOverallExpense || 0) / totalSqFt)}`}
  //         title={"Total"}
  //         description={"Expense per sq.ft"}
  //         route={"per-sq-ft-expense"}
  //       />,
  //       <DataCard
  //         route={"IT-expenses"}
  //         title={"Average"}
  //         data={`INR ${inrFormat(averageMonthlyExpense)}`}
  //         description={"Monthly Expense"}
  //       />,
  //       <DataCard
  //         data={departmentKra.length || 0}
  //         title={"Total"}
  //         description={"Monthly KPA"}
  //       />,
  //     ],
  //   },
  //   {
  //     layout: 2,
  //     widgets: [
  //       <MuiTable
  //         key={priorityTasks.length}
  //         scroll
  //         rowsToDisplay={4}
  //         Title={"Top 10 High Priority Due Tasks"}
  //         rows={transformedTasks}
  //         columns={priorityTasksColumns}
  //       />,
  //       <MuiTable
  //         key={executiveTimings.length}
  //         Title={"Weekly Executive Shift Timing"}
  //         rows={transformedWeeklyShifts}
  //         columns={executiveTimingsColumns}
  //         scroll
  //         rowsToDisplay={4}
  //       />,
  //     ],
  //   },
  //   {
  //     layout: 2,
  //     widgets: [
  //       <WidgetSection border title={"Unit Wise Due Tasks"}>
  //         <PieChartMui data={[]} options={[]} />
  //       </WidgetSection>,
  //       <WidgetSection border title={"Executive Wise Due Tasks"}>
  //         <DonutChart
  //           centerLabel="Tasks"
  //           labels={[]}
  //           colors={colors}
  //           series={[]}
  //           tooltipValue={executiveTasksCount}
  //           width={500}
  //         />
  //       </WidgetSection>,
  //     ],
  //   },
  //   {
  //     layout: 2,
  //     widgets: [
  //       <WidgetSection border title={"Unit Wise IT Expenses"}>
  //         <PieChartMui data={[]} options={[]} />
  //       </WidgetSection>,
  //       <WidgetSection border title={"Biometrics Gender Data"}>
  //         <PieChartMui data={[]} options={[]} />
  //       </WidgetSection>,
  //     ],
  //   },
  //   //Last section
  //   {
  //     layout: 2,
  //     widgets: [
  //       <WidgetSection border title={"Client-Wise Complaints"}>
  //         <PieChartMui data={[]} options={[]} />
  //       </WidgetSection>,
  //       <WidgetSection border title={"Type Of IT Complaints"}>
  //         <DonutChart
  //           centerLabel={``}
  //           labels={complaintTypeLabels}
  //           series={donutComplaintTypeData}
  //           tooltipValue={complaintCounts}
  //         />
  //       </WidgetSection>,
  //     ],
  //   },
  // ];

  const techWidgets = [
    {
      layout: 1,
      widgets: allowedYearlyGraph.map((config) => (
        <WidgetSection
          normalCase
          layout={config.layout}
          padding
          key={config.key}
        >
          <YearlyGraph
            chartId={config.chartId}
            data={config.data}
            options={config.options}
            title={config.title}
            titleAmount={config.titleAmount}
            onYearChange={config.onYearChange}
            responsiveResize
          />
        </WidgetSection>
      )),
    },
    {
      layout: allowedCards.length,
      widgets: allowedCards.map((card) => (
        <Card
          key={card.title}
          route={card.route}
          title={card.title}
          icon={card.icon}
        />
      )),
    },
    {
      layout: 3,
      widgets: allowedITDataCards.map((config) => (
        <DataCard
          key={config.key}
          data={config.data}
          title={config.title}
          description={config.description}
          route={config.route}
        />
      )),
    },
    {
      layout: allowedTables.length,
      widgets: allowedTables.map((config) => (
        <MuiTable
          key={config.key}
          scroll={config.scroll}
          rowsToDisplay={config.rowsToDisplay}
          Title={config.title}
          rows={config.rows}
          columns={config.columns}
        />
      )),
    },
    {
      layout: allowedDueTasks.length,
      widgets: allowedDueTasks.map((config) => {
        if (config.type === "PieChartMui") {
          return (
            <WidgetSection
              key={config.key}
              border={config.border}
              title={config.title}
            >
              <PieChartMui data={config.data} options={config.options} />
            </WidgetSection>
          );
        } else if (config.type === "DonutChart") {
          return (
            <WidgetSection
              key={config.key}
              border={config.border}
              title={config.title}
            >
              <DonutChart
                centerLabel={config.centerLabel}
                labels={config.labels}
                colors={config.colors}
                series={config.series}
                tooltipValue={config.tooltipValue}
                width={config.width}
              />
            </WidgetSection>
          );
        }
      }),
    },
    {
      layout: allowedPieCharts.length,
      widgets: allowedPieCharts.map((config) => (
        <WidgetSection
          key={config.key}
          border={config.border}
          title={config.title}
        >
          <PieChartMui data={config.data} options={config.options} />
        </WidgetSection>
      )),
    },
    {
      layout: allowedPieDonut.length,
      widgets: allowedPieDonut.map((config) => {
        if (config.type === "PieChartMui") {
          return (
            <WidgetSection
              key={config.key}
              border={config.border}
              title={config.title}
            >
              <PieChartMui data={config.data} options={config.options} />
            </WidgetSection>
          );
        } else if (config.type === "DonutChart") {
          return (
            <WidgetSection
              key={config.key}
              border={config.border}
              title={config.title}
            >
              <DonutChart
                centerLabel={config.centerLabel}
                labels={config.labels}
                series={config.series}
                tooltipValue={config.tooltipValue}
              />
            </WidgetSection>
          );
        }
      }),
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
