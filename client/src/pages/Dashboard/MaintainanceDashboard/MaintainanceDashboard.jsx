import React, { Suspense, useEffect, useMemo, useState } from "react";
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
import { Box, Chip, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BudgetGraph from "../../../components/graphs/BudgetGraph";
import { inrFormat } from "../../../utils/currencyFormat";
import { useSidebar } from "../../../context/SideBarContext";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import { transformBudgetData } from "../../../utils/transformBudgetData";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import usePageDepartment from "../../../hooks/usePageDepartment";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import useAuth from "../../../hooks/useAuth";
import { PERMISSIONS } from "./../../../constants/permissions";

const MaintainanceDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();
  const department = usePageDepartment();
  const axios = useAxiosPrivate();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("FY 2024-25");

  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  //------------------------PAGE ACCESS START-------------------//
  const cardsConfig = [
    {
      route: "/app/dashboard/maintenance-dashboard/annual-expenses",
      title: "Annual Expenses",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.MAINTENANCE_ANNUAL_EXPENSES.value,
    },
    {
      route: "/app/dashboard/maintenance-dashboard/inventory",
      title: "Inventory",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.MAINTENANCE_INVENTORY.value,
    },
    {
      route: "/app/dashboard/maintenance-dashboard/finance",
      title: "Finance",
      icon: <SiCashapp />,
      permission: PERMISSIONS.MAINTENANCE_FINANCE.value,
    },
    {
      route: "/app/dashboard/maintenance-dashboard/mix-bag",
      title: "Mix Bag",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.MAINTENANCE_MIX_BAG.value,
    },
    {
      route: "/app/dashboard/maintenance-dashboard/data",
      title: "Data",
      icon: <SiGoogleadsense />,
      permission: PERMISSIONS.MAINTENANCE_DATA.value,
    },
    {
      route: "/app/dashboard/maintenance-dashboard/settings",
      title: "Settings",
      icon: <MdOutlineMiscellaneousServices />,
      permission: PERMISSIONS.MAINTENANCE_SETTINGS.value,
    },
  ];

  const allowedCards = cardsConfig.filter(
    (card) => !card.permission || userPermissions.includes(card.permission)
  );
  //------------------------PAGE ACCESS END-------------------//

  const { data: hrFinance = [], isLoading: isHrFinanceLoading } = useQuery({
    queryKey: ["maintainance-budget"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=6798bafbe469e809084e24a7
            `
        );
        return response.data?.allBudgets;
      } catch (error) {
        throw new Error("Error fetching data");
      }
    },
  });

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
  //----------------------Monthly average-----------------------//
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

  const totalOverallExpense = isHrFinanceLoading
    ? []
    : hrFinance.reduce((sum, item) => (sum + item.actualAmount || 0, 0));
  console.log("totalExpense : ", totalOverallExpense);
  //----------------------Monthly average-----------------------//

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
      tickAmount: 4,
      max: roundedMax,
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

  const navigate = useNavigate();

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

  // ------------------------------------------------------------------------------------------------------------------//
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

  const dueMaintenanceCount = dueMaintenance.map((user) => user.tasks);
  const colorsMaintenance = [
    "#FF5733",
    "#FFC300",
    "#28B463",
    "#28b49a",
    "#7a02ad",
    "#ff00e6",
  ];
  //----------------------------------------------------------------------------------------------------------//

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

  const transformedTasks = tasks.map((task, index) => {
    return {
      id: index + 1,
      taskName: task.taskName,
      status: task.status,
      endTime: humanTime(task.dueTime),
    };
  });

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
    // { id: "building", label: "Building", align: "left" },
    { id: "unitNo", label: "Unit No", align: "left" },
    { id: "startDate", label: "Start Date", align: "left" },
    { id: "endDate", label: "End Date", align: "left" },
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

  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <Suspense
          fallback={
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Simulating chart skeleton */}
              <Skeleton variant="text" width={200} height={30} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </Box>
          }>
          <WidgetSection normalCase layout={1} padding>
            <YearlyGraph
              data={expenseRawSeries}
              responsiveResize
              chartId={"bargraph-hr-expense"}
              options={expenseOptions}
              onYearChange={setSelectedFiscalYear}
              title={"BIZ Nest MAINTENANCE DEPARTMENT EXPENSE"}
              titleAmount={`INR ${Math.round(totalUtilised).toLocaleString(
                "en-IN"
              )}`}
            />
          </WidgetSection>
        </Suspense>,
      ],
    },
    // {
    //   layout: 6,
    //   widgets: [
    //     <Card
    //       icon={<MdFormatListBulleted />}
    //       title="Annual Expenses"
    //       route={"/app/dashboard/maintenance-dashboard/annual-expenses"}
    //     />,
    //     <Card
    //       icon={<MdFormatListBulleted />}
    //       title="Inventory"
    //       route={"/app/dashboard/maintenance-dashboard/inventory"}
    //     />,
    //     <Card
    //       icon={<SiCashapp />}
    //       title="Finance"
    //       route={"/app/dashboard/maintenance-dashboard/finance"}
    //     />,
    //     <Card
    //       icon={<MdFormatListBulleted />}
    //       title="Mix-Bag"
    //       route={"/app/dashboard/maintenance-dashboard/mix-bag"}
    //     />,
    //     <Card
    //       icon={<SiGoogleadsense />}
    //       title="Data"
    //       route={"/app/dashboard/maintenance-dashboard/data"}
    //     />,
    //     <Card
    //       icon={<MdOutlineMiscellaneousServices />}
    //       title="Settings"
    //       route={"/app/dashboard/maintenance-dashboard/settings"}
    //     />,
    //   ],
    // },
    {
      layout: allowedCards.length, // ✅ dynamic layout
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
      widgets: [
        <DataCard
          route={"maintenance-offices"}
          title={"Total"}
          data={Array.isArray(unitsData) ? unitsData.length : 0}
          description={"Offices Under Management"}
        />,
        <DataCard
          route={"/app/tasks"}
          title={"Total"}
          data={tasks.length || 0}
          description={"Monthly Due Tasks"}
        />,
        <DataCard
          route={"maintenance-expenses"}
          title={"Average"}
          data={`INR ${inrFormat(averageMonthlyExpense)}`}
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
          data={`INR ${inrFormat(totalUtilised / totalSqFt)}`}
          description={"Expense Per Sq. Ft."}
        />,
        <DataCard
          // route={"maintenance-assets"}
          title={"Total"}
          data={0}
          description={"Assets Under Management"}
        />,
        <DataCard
          route={`/app/performance`}
          title={"Total"}
          data={departmentKra.length || 0}
          description={"Monthly KPA"}
        />,
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
          rows={transformedTasks}
          columns={priorityTasksColumns}
        />,
        <MuiTable
          key={executiveTimings.length}
          Title={"Weekly Executive Shift Timing"}
          rows={transformedWeeklyShifts}
          columns={executiveTimingsColumns}
          scroll
          rowsToDisplay={4}
        />,
      ],
    },

    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Category Wise Maintenance"}>
          <PieChartMui data={[]} options={[]} />
        </WidgetSection>,
        <WidgetSection border title={"Due Maintenance"}>
          <DonutChart
            centerLabel="Due Tasks"
            labels={[]}
            colors={colorsMaintenance}
            series={[]}
            tooltipValue={dueMaintenanceCount}
          />
        </WidgetSection>,
      ],
    },

    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Unit Wise Maintenance"}>
          <PieChartMui data={[]} options={[]} />
        </WidgetSection>,
        <WidgetSection border title={"Maintenance Execution Channel"}>
          <PieChartMui data={[]} options={[]} />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Average Monthly Due Maintenance"}>
          <PieChartMui data={[]} options={[]} />
        </WidgetSection>,
        <WidgetSection border title={"Average Yearly Due Maintenance"}>
          <PieChartMui data={[]} options={[]} />
        </WidgetSection>,
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
