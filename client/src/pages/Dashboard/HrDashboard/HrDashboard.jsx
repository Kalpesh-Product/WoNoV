import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import WidgetSection from "../../../components/WidgetSection";
import Card from "../../../components/Card";
import { LuHardDriveUpload } from "react-icons/lu";
import { Skeleton, Box, CircularProgress } from "@mui/material";
import { CgWebsite } from "react-icons/cg";
import { SiCashapp } from "react-icons/si";
import { SiGoogleadsense } from "react-icons/si";
import { MdMiscellaneousServices } from "react-icons/md";
import PayRollExpenseGraph from "../../../components/HrDashboardGraph/PayRollExpenseGraph";
import MuiTable from "../../../components/Tables/MuiTable";
import PieChartMui from "../../../components/graphs/PieChartMui";
import DonutChart from "../../../components/graphs/DonutChart";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { inrFormat } from "../../../utils/currencyFormat";
import { useSidebar } from "../../../context/SideBarContext";
import { transformBudgetData } from "../../../utils/transformBudgetData";
import { calculateAverageAttendance } from "../../../utils/calculateAverageAttendance ";
import { calculateAverageDailyWorkingHours } from "../../../utils/calculateAverageDailyWorkingHours ";
import FinanceCard from "../../../components/FinanceCard";
import dayjs from "dayjs";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedMonth,
  setTasksData,
  setTasksOverallData,
} from "../../../redux/slices/hrSlice";
import dateToHyphen from "../../../utils/dateToHyphen";
import LazyDashboardWidget from "../../../components/Optimization/LazyDashboardWidget";
import usePageDepartment from "../../../hooks/usePageDepartment";

import { PERMISSIONS } from "./../../../constants/permissions";

const HrDashboard = () => {
const { setIsSidebarOpen } = useSidebar();
const dispatch = useDispatch();

const getFiscalYearStart = (date = dayjs()) => {
  const parsedDate = dayjs(date);
  return parsedDate.month() >= 3 ? parsedDate.year() : parsedDate.year() - 1;
};

const formatFiscalYear = (startYear) =>
  `FY ${startYear}-${String(startYear + 1).slice(-2)}`;

const getFiscalMonthIndex = (date) => {
  const parsedDate = dayjs(date);
  const month = parsedDate.month();

  return month >= 3 ? month - 3 : month + 9;
};

const getAmount = (value) => {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const fiscalMonths = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

const currentFiscalYear = formatFiscalYear(getFiscalYearStart());

const [selectedFiscalYear, setSelectedFiscalYear] =
  useState(currentFiscalYear);

const [selectedHrFiscalYear, setSelectedHrFiscalYear] =
  useState(currentFiscalYear);

const department = usePageDepartment();

  const [budgetData, setBudgetData] = useState({});
  const [totalSalary, setTotalSalary] = useState({});
  const tasksRawData = useSelector((state) => state.hr.tasksRawData);
  const tasksOverallRedux = useSelector((state) => state.hr.tasksOverallData);

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  //------------------------PAGE ACCESS START-------------------//
  const cardsConfig = [
    {
      route: "employee",
      title: "Employee",
      icon: <CgWebsite />,
      permission: PERMISSIONS.HR_EMPLOYEE.value,
    },
    {
      route: "company",
      title: "Company",
      icon: <LuHardDriveUpload />,
      permission: PERMISSIONS.HR_COMPANY.value,
    },
    {
      route: "finance",
      title: "Finance",
      icon: <SiCashapp />,
      permission: PERMISSIONS.HR_FINANCE.value,
    },
    {
      route: "mix-bag",
      title: "Mix Bag",
      icon: <CgWebsite />,
      permission: PERMISSIONS.HR_MIX_BAG.value,
    },
    {
      route: "data",
      title: "Data",
      icon: <SiGoogleadsense />,
      permission: PERMISSIONS.HR_DATA.value,
    },
    {
      route: "settings/bulk-upload",
      title: "Settings",
      icon: <MdMiscellaneousServices />,
      permission: PERMISSIONS.HR_SETTINGS.value,
    },
  ];

  const allowedCards = cardsConfig.filter(
    (card) => !card.permission || userPermissions.includes(card.permission)
  );
  //------------------------PAGE ACCESS END-------------------//

  const axios = useAxiosPrivate();
  const { data: selectedDepartments = [] } = useQuery({
    queryKey: ["hr-selectedDepartments"],
    queryFn: async () => {
      const response = await axios.get(
        "api/company/get-company-data?field=selectedDepartments",
      );
      return Array.isArray(response.data?.selectedDepartments)
        ? response.data.selectedDepartments
        : [];
    },
  });

  const { data: dashboardTasks = [] } = useQuery({
    queryKey: ["hr-dashboard-tasks", department?._id],
    queryFn: async () => {
      const response = await axios.get(`/api/tasks/get-tasks?dept=${department?._id}`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: Boolean(department?._id),
  });

  const { data: hrTickets = [], isLoading: isHrTicketsLoading } = useQuery({
    queryKey: ["hr-dashboard-tickets", department?._id],
    queryFn: async () => {
      if (!department?._id) {
        return [];
      }

      try {
        const response = await axios.get(
          `/api/tickets/department-tickets/${department._id}`,
        );
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error("Error fetching HR tickets:", error);
        return [];
      }
    },
    enabled: !!department?._id,
  });

  const navigate = useNavigate();
   const managerByDepartmentName = useMemo(() => {
    const map = new Map();

    selectedDepartments.forEach((item) => {
      const departmentName = item?.department?.name?.trim();
      if (departmentName) {
        map.set(departmentName.toLowerCase(), item?.admin || "Unassigned");
      }
    });

    return map;
  }, [selectedDepartments]);

  const pendingDepartmentTasks = useMemo(
    () =>
      dashboardTasks.filter(
        (task) => task?.taskType === "Department" && task?.status === "Pending",
      ),
    [dashboardTasks],
  );

  const unitWisePieData = useMemo(() => {
    const groupedTasks = pendingDepartmentTasks.reduce((acc, task) => {
      const unitName = task?.location?.unitNo || "Unassigned";
      if (!acc[unitName]) acc[unitName] = { label: unitName, value: 0 };
      acc[unitName].value += 1;
      return acc;
    }, {});

    return Object.values(groupedTasks).sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true }),
    );
  }, [pendingDepartmentTasks]);

  const unitPieChartOptions = {
    labels: unitWisePieData.map((item) => item.label),
    chart: {
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => navigate("/app/tasks"),
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Due tasks`,
      },
    },
  };

  const executiveTasks = useMemo(() => {
    const groupedTasks = pendingDepartmentTasks.reduce((acc, task) => {
      const departmentName =
        typeof task?.department === "object"
          ? task?.department?.name
          : task?.department || department?.name || "Unknown Department";
      const managerName =
        managerByDepartmentName.get(departmentName.toLowerCase()) ||
        "Unassigned";
       if (!acc[managerName]) acc[managerName] = { name: managerName, tasks: 0 };
      acc[managerName].tasks += 1;
      return acc;
    }, {});

    return Object.values(groupedTasks).sort((a, b) => b.tasks - a.tasks);
  }, [department?.name, managerByDepartmentName, pendingDepartmentTasks]);

  const executiveTaskLabels = executiveTasks.map((item) => item.name);
  const executiveTasksCount = executiveTasks.map((item) => item.tasks);
  const executiveTaskColors = [
    "#FF5733",
    "#FFC300",
    "#28B463",
    "#5B6CFF",
    "#9B59B6",
    "#17A2B8",
    "#E67E22",
    "#E91E63",
  ];

  const hrCategoryWiseTickets = useMemo(() => {
    if (isHrTicketsLoading || !Array.isArray(hrTickets)) return [];

    const categoryCountMap = hrTickets.reduce((acc, item) => {
      const category = String(item?.ticket || "Others").trim() || "Others";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const sortedCategories = Object.entries(categoryCountMap)
      .map(([label, value]) => ({ label, value }))
      .sort((first, second) => second.value - first.value);

    if (sortedCategories.length <= 5) {
      return sortedCategories;
    }

    const topCategories = sortedCategories.slice(0, 5);
    const othersCount = sortedCategories
      .slice(5)
      .reduce((sum, item) => sum + item.value, 0);

    return [...topCategories, { label: "Others", value: othersCount }];
  }, [hrTickets, isHrTicketsLoading]);

  const hrCategoryWiseTicketsData = hrCategoryWiseTickets.map((item) => ({
    label: item.label,
    value: item.value,
  }));

  const hrCategoryWiseTicketsOptions = {
    labels: hrCategoryWiseTickets.map((item) => item.label),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    legend: {
      horizontalAlign: "center",
      itemMargin: {
        horizontal: 4,
        vertical: 2,
      },
      formatter: (seriesName) =>
        `<span title="${seriesName}" style="display:inline-block;max-width:92px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom;font-size:12px;line-height:1.2;">${seriesName}</span>`,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#ffffff"],
    },
    colors: [
      "#274C77",
      "#6096BA",
      "#A3CEF1",
      "#8B5E3C",
      "#5B8E7D",
      "#D08C60",
    ],
    tooltip: {
      fillSeriesColor: false,
      custom: ({ series, seriesIndex, w }) => {
        const category =
          hrCategoryWiseTickets?.[seriesIndex]?.label ||
          w?.globals?.labels?.[seriesIndex] ||
          "Unknown";
        const count = series?.[seriesIndex] ?? 0;
        const color =
          w?.globals?.colors?.[seriesIndex] ||
          hrCategoryWiseTicketsOptions.colors[
            seriesIndex % hrCategoryWiseTicketsOptions.colors.length
          ];

        return `<div style="
          padding:8px 12px;
          font-size:12px;
          font-family:Poppins-Regular;
          font-weight:600;
          background:${color};
          color:#fff;
          border-radius:6px;
        ">
          ${category} : ${count}
        </div>`;
      },
    },
  };

  const hrPendingStatuses = new Set(["open", "pending", "in progress", "escalated"]);

  const hrPendingTicketsCount = (Array.isArray(hrTickets) ? hrTickets : []).filter(
    (ticket) => hrPendingStatuses.has(String(ticket?.status || "").toLowerCase())
  ).length;

  const hrCompletedTicketsCount = (Array.isArray(hrTickets) ? hrTickets : []).filter(
    (ticket) => String(ticket?.status || "").toLowerCase() === "closed"
  ).length;

  const hrDueTicketsData = [
    { label: "Completed", value: hrCompletedTicketsCount },
    { label: "Pending", value: hrPendingTicketsCount },
  ];

  const hrDueTicketsOptions = {
    labels: hrDueTicketsData.map((item) => item.label),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    legend: {
      horizontalAlign: "center",
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#ffffff"],
    },
    colors: ["#59C9A5", "#FCA5A5"],
    tooltip: {
      fillSeriesColor: false,
      custom: ({ series, seriesIndex, w }) => {
        const label = w?.globals?.labels?.[seriesIndex] || "Unknown";
        const count = series?.[seriesIndex] ?? 0;
        const color =
          w?.globals?.colors?.[seriesIndex] ||
          hrDueTicketsOptions.colors[
            seriesIndex % hrDueTicketsOptions.colors.length
          ];

        return `<div style="
          padding:8px 12px;
          font-size:12px;
          font-family:Poppins-Regular;
          font-weight:600;
          background:${color};
          color:#fff;
          border-radius:6px;
        ">
          ${label} : ${count}
        </div>`;
      },
    },
  };

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        return response.data.filter((u) => u.isActive);
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
    keepPreviousData: true,
  });

  const pastEmployeesQuery = useQuery({
    queryKey: ["past-employees-summary"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users", {
          params: { status: "false" },
        });
        return Array.isArray(response.data)
          ? response.data.filter((employee) => employee.isActive === false)
          : [];
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch past employees");
      }
    },
    keepPreviousData: true,
  });

  //--------------------HR BUDGET---------------------------//
  const { data: hrFinance = [], isLoading: isHrFinanceLoading } = useQuery({
    queryKey: ["hrFinance"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=6798bab9e469e809084e249e
            `
        );
        return response.data?.allBudgets;
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

  //--------------------HR BUDGET---------------------------//
  //------------------------Graph round functions-------------------//
  //------------------------Graph round functions-------------------//
  //--------------------HR BUDGET---------------------------//

  //-------------------HR Expense graph start--------------------//

  const expenseRawSeries = useMemo(() => {
  const fyData = {};

  hrFinance.forEach((item) => {
    if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;

    const fiscalYearStart = getFiscalYearStart(item.dueDate);
    const fiscalYearLabel = formatFiscalYear(fiscalYearStart);
    const monthIndex = getFiscalMonthIndex(item.dueDate);

    if (!fyData[fiscalYearLabel]) {
      fyData[fiscalYearLabel] = {
        actual: Array(12).fill(0),
        projectedBalance: Array(12).fill(0),
      };
    }

    const actualAmount = getAmount(item.actualAmount);
    const projectedAmount = getAmount(item.projectedAmount);
    const remainingProjectedAmount = Math.max(projectedAmount - actualAmount, 0);

    fyData[fiscalYearLabel].actual[monthIndex] += actualAmount;
    fyData[fiscalYearLabel].projectedBalance[monthIndex] +=
      remainingProjectedAmount;
  });

  if (!fyData[currentFiscalYear]) {
    fyData[currentFiscalYear] = {
      actual: Array(12).fill(0),
      projectedBalance: Array(12).fill(0),
    };
  }

  return Object.entries(fyData)
    .sort(([fyA], [fyB]) => {
      const startA = Number(fyA.slice(3, 7));
      const startB = Number(fyB.slice(3, 7));
      return startA - startB;
    })
    .flatMap(([fiscalYear, data]) => {
      return [
        {
          name: "Actual Amount",
          group: fiscalYear,
          data: data.actual,
        },
        {
          name: "Projected Amount",
          group: fiscalYear,
          data: data.projectedBalance,
        },
      ];
    });
}, [hrFinance, currentFiscalYear]);

const roundedMax = useMemo(() => {
  const fiscalYears = [
    ...new Set(expenseRawSeries.map((series) => series.group)),
  ];

  const maxValue = fiscalYears.reduce((max, fiscalYear) => {
    const actualSeries = expenseRawSeries.find(
      (series) =>
        series.group === fiscalYear && series.name === "Actual Amount"
    );

    const projectedSeries = expenseRawSeries.find(
      (series) =>
        series.group === fiscalYear && series.name === "Projected Amount"
    );

    const monthlyMax = Array.from({ length: 12 }, (_, index) => {
      const actual = actualSeries?.data?.[index] || 0;
      const projectedBalance = projectedSeries?.data?.[index] || 0;

      return actual + projectedBalance;
    });

    return Math.max(max, ...monthlyMax);
  }, 0);

  return Math.ceil((maxValue + 100000) / 100000) * 100000;
}, [expenseRawSeries]);

  const selectedHrExpenseSeries = expenseRawSeries.find(
  (item) =>
    item.group === selectedHrFiscalYear && item.name === "Actual Amount"
);

const selectedHrProjectedSeries = expenseRawSeries.find(
  (item) =>
    item.group === selectedHrFiscalYear && item.name === "Projected Amount"
);

const totalUtilised = useMemo(() => {
  if (!selectedHrExpenseSeries) return 0;

  return selectedHrExpenseSeries.data.reduce((sum, val) => sum + val, 0);
}, [selectedHrExpenseSeries]);

const currentFiscalMonthIndexForCard =
  dayjs().month() >= 3 ? dayjs().month() - 3 : dayjs().month() + 9;
const previousFiscalMonthIndexForCard =
  currentFiscalMonthIndexForCard > 0 ? currentFiscalMonthIndexForCard - 1 : 11;

const selectedHrFiscalStartYear = Number(
  String(selectedHrFiscalYear || "").match(/\d{4}/)?.[0],
);

const previousExpenseMonthLabel = Number.isFinite(selectedHrFiscalStartYear)
  ? dayjs(
      new Date(
        previousFiscalMonthIndexForCard <= 8
          ? selectedHrFiscalStartYear
          : selectedHrFiscalStartYear + 1,
        (previousFiscalMonthIndexForCard + 3) % 12,
        1,
      ),
    ).format("MMMM-YY")
  : "";

const previousMonthActualExpense = Math.round(
  selectedHrExpenseSeries?.data?.[previousFiscalMonthIndexForCard] || 0
);

const previousMonthProjectedExpense = Math.round(
  selectedHrProjectedSeries?.data?.[previousFiscalMonthIndexForCard] || 0
);

const averageActualAmount = useMemo(() => {
  if (!selectedHrExpenseSeries?.data?.length) return 0;

  const totalActual = selectedHrExpenseSeries.data.reduce(
    (sum, value) => sum + (Number(value) || 0),
    0
  );

  return totalActual / selectedHrExpenseSeries.data.length;
}, [selectedHrExpenseSeries]);

const averageProjectedAmount = useMemo(() => {
  if (!selectedHrProjectedSeries?.data?.length) return 0;

  const totalProjected = selectedHrProjectedSeries.data.reduce(
    (sum, value) => sum + (Number(value) || 0),
    0
  );

  return totalProjected / selectedHrProjectedSeries.data.length;
}, [selectedHrProjectedSeries]);

const activeHeadCount = usersQuery.isLoading
  ? 0
  : Array.isArray(usersQuery.data)
    ? usersQuery.data.length
    : 0;

const previousMonthExitLabel = dayjs().subtract(1, "month").format("MMMM-YY");
const previousMonthStart = dayjs().subtract(1, "month").startOf("month");
const previousMonthEnd = dayjs().subtract(1, "month").endOf("month");

const previousMonthExitCount = useMemo(() => {
  const pastEmployees = Array.isArray(pastEmployeesQuery.data)
    ? pastEmployeesQuery.data
    : [];

  return pastEmployees.filter((employee) => {
    const exitDate = employee?.endDate || employee?.updatedAt;
    if (!exitDate) return false;

    const parsedExitDate = dayjs(exitDate);
    if (!parsedExitDate.isValid()) return false;

    return (
      parsedExitDate.isSameOrAfter(previousMonthStart, "day") &&
      parsedExitDate.isSameOrBefore(previousMonthEnd, "day")
    );
  }).length;
}, [pastEmployeesQuery.data, previousMonthEnd, previousMonthStart]);

const previousMonthExitEmployeeIds = useMemo(() => {
  const pastEmployees = Array.isArray(pastEmployeesQuery.data)
    ? pastEmployeesQuery.data
    : [];

  return pastEmployees
    .filter((employee) => {
      const exitDate = employee?.endDate || employee?.updatedAt;
      if (!exitDate) return false;

      const parsedExitDate = dayjs(exitDate);
      if (!parsedExitDate.isValid()) return false;

      return (
        parsedExitDate.isSameOrAfter(previousMonthStart, "day") &&
        parsedExitDate.isSameOrBefore(previousMonthEnd, "day")
      );
    })
    .map((employee) => employee?._id || employee?.empId)
    .filter(Boolean);
}, [pastEmployeesQuery.data, previousMonthEnd, previousMonthStart]);

 const expenseOptions = {
  chart: {
    type: "bar",
    animations: { enabled: false },
    toolbar: { show: false },
    stacked: true,
    fontFamily: "Poppins-Regular, Arial, sans-serif",
    events: {
      dataPointSelection: () => {
        navigate("finance/budget");
      },
    },
  },
  colors: ["#54C4A7", "#c4c4c4"],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "40%",
      borderRadius: 5,
      borderRadiusApplication: "end",
      dataLabels: {
        position: "top",
        total: {
          enabled: true,
          formatter: (_, config) => {
            const isCurrentFiscalYearSelected =
              selectedHrFiscalYear === currentFiscalYear;
            const isCurrentFiscalMonth =
              config?.dataPointIndex === currentFiscalMonthIndexForCard;

            if (isCurrentFiscalYearSelected && isCurrentFiscalMonth) {
              return "";
            }

            const total =
              config?.w?.globals?.stackedSeriesTotals?.[config?.dataPointIndex] ||
              0;

            return total ? Math.round(Number(total)).toLocaleString("en-IN") : "";
          },
          style: {
            fontSize: "12px",
            fontWeight: 600,
            color: "#000",
          },
          offsetY: -8,
        },
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: fiscalMonths,
    title: {
      text: "  ",
    },
  },
  yaxis: {
    min: 0,
    max: roundedMax,
    tickAmount: 4,
    title: { text: "Amount In Lakhs (INR)" },
    labels: {
      formatter: (val) => `${Math.round(val / 100000)}`,
    },
  },
  fill: {
    opacity: 1,
  },
  states: {
    hover: {
      filter: {
        type: "none",
      },
    },
    active: {
      filter: {
        type: "none",
      },
    },
  },
  legend: {
    show: true,
    position: "top",
  },
  tooltip: {
    enabled: true,
    custom: function ({ seriesIndex, dataPointIndex, w }) {
      const seriesName = w.globals.seriesNames?.[seriesIndex];

      const actualSeries = w.globals.initialSeries.find(
        (item) => item.name === "Actual Amount"
      );

      const projectedSeries = w.globals.initialSeries.find(
        (item) => item.name === "Projected Amount"
      );

      const actualAmount = actualSeries?.data?.[dataPointIndex] || 0;
      const projectedBalance = projectedSeries?.data?.[dataPointIndex] || 0;

      const monthLabel =
        w.globals.labels && w.globals.labels[dataPointIndex]
          ? w.globals.labels[dataPointIndex]
          : `Month ${dataPointIndex + 1}`;

      const isActual = seriesName === "Actual Amount";

      const label = isActual ? "Actual Amount" : "Projected Amount";
      const amount = isActual ? actualAmount : projectedBalance;
      const color = isActual ? "#54C4A7" : "#c4c4c4";

      return `
        <div class="apexcharts-tooltip-title" style="
          font-family: Poppins-Regular;
          font-size: 12px;
          padding: 6px 10px;
          margin-bottom: 0;
        ">
          ${monthLabel}
        </div>

        <div style="
          padding: 8px 10px;
          font-family: Poppins-Regular;
          font-size: 12px;
          background: #fff;
          min-width: 230px;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          ">
            <span style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: ${color};
              display: inline-block;
            "></span>

            <span>${label}:</span>

            <span style="font-weight: 600;">
              INR ${Math.round(amount).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      `;
    },
  },
};

  //-------------------HR Expense graph end--------------------//
  //-------------------Tasks vs Achievements graph--------------------//

  const { data: departmentTasks = [], isLoading: isDepartmentLoading } =
    useQuery({
      queryKey: ["departmentTasks"],
      queryFn: async () => {
        try {
          const response = await axios.get("/api/performance/get-kpa-tasks");
          const formattedData = response.data.map((dept) => ({
            ...dept,
            tasks: dept.tasks.map((task) => ({
              ...task,
              assignedDate: dateToHyphen(task.assignedDate),
              dueDate: dateToHyphen(task.dueDate),
            })),
          }));
          dispatch(setTasksData(formattedData));
          return response.data;
        } catch (error) {
          console.error(error);
        }
      },
    });

  const { data: tasksOverallData = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasksRawData"],
    queryFn: async () => {
      const response = await axios.get("api/tasks/get-tasks-summary");
      const formattedData = response.data.map((dept) => ({
        ...dept,
        department:
          typeof dept.department === "object"
            ? dept.department.name
            : dept.department,
        tasks: dept.tasks.map((task) => ({
          ...task,
          department:
            typeof task.department === "object"
              ? task.department.name
              : task.department,
          assignedDate: dateToHyphen(task.assignedDate),
          dueDate: dateToHyphen(task.dueDate),
        })),
      }));
      dispatch(setTasksOverallData(formattedData));
      return response.data;
    },
  });

  function getFiscalYearDateRange(fyString) {
    // Example: "FY 2024-25"
    const [startYearStr, endYearStr] = fyString.replace("FY ", "").split("-");
    const startYear = parseInt(startYearStr);
    const endYear = parseInt("20" + endYearStr); // Handles "25" as 2025

    const startDate = new Date(`${startYear}-04-01T00:00:00.000Z`);
    const endDate = new Date(`${endYear}-03-31T23:59:59.999Z`);

    return { startDate, endDate };
  }

  function getTasksForSelectedFiscalYear(departments, selectedFiscalYear) {
    if (selectedFiscalYear === "FY 2024-25") {
      return []; // Override to show zero tasks for FY 2024-25
    }

    const { startDate, endDate } = getFiscalYearDateRange(selectedFiscalYear);
    const filteredTasks = [];

    departments.forEach((dept) => {
      dept.tasks?.forEach((task) => {
        const dueDate = new Date(task.dueDate);
        if (dueDate >= startDate && dueDate <= endDate) {
          filteredTasks.push({
            ...task,
            department: dept.department,
          });
        }
      });
    });

    return filteredTasks;
  }

  const isDepartmentTask = (task) => task?.taskType === "Department";

  const tasksForSelectedYear = getTasksForSelectedFiscalYear(
    departmentTasks,
    selectedFiscalYear
  );

  const overallTasksForYear = getTasksForSelectedFiscalYear(
    tasksOverallData,
    selectedFiscalYear
  );

  // Month names in financial year order (Apr to Mar)
  const fyMonths = [
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

  const buildCompletionSeriesByFiscalYear = (
    departments,
    completedLabel,
    remainingLabel,
    taskFilter = () => true
  ) => {
    const fyData = {};

    (Array.isArray(departments) ? departments : []).forEach((dept) => {
      (Array.isArray(dept?.tasks) ? dept.tasks : []).forEach((task) => {
        if (!taskFilter(task)) return;

        const assignedDate = task?.assignedDate;
        if (!assignedDate) return;

        const [day, month, year] = assignedDate.split("-").map(Number);
        if (!day || !month || !year) return;

        const taskDate = dayjs(new Date(year, month - 1, day));
        if (!taskDate.isValid()) return;

        const fiscalYearLabel = formatFiscalYear(getFiscalYearStart(taskDate));
        const monthIndex = getFiscalMonthIndex(taskDate);

        if (!fyData[fiscalYearLabel]) {
          fyData[fiscalYearLabel] = {
            totals: Array(12).fill(0),
            completed: Array(12).fill(0),
          };
        }

        fyData[fiscalYearLabel].totals[monthIndex] += 1;
        if (task.status === "Completed") {
          fyData[fiscalYearLabel].completed[monthIndex] += 1;
        }
      });
    });

    if (!fyData[currentFiscalYear]) {
      fyData[currentFiscalYear] = {
        totals: Array(12).fill(0),
        completed: Array(12).fill(0),
      };
    }

    return Object.entries(fyData)
      .sort(([fyA], [fyB]) => {
        const startA = Number(fyA.slice(3, 7));
        const startB = Number(fyB.slice(3, 7));
        return startA - startB;
      })
      .flatMap(([fiscalYear, data]) => {
        const completedSeries = fyMonths.map((month, index) => {
          const total = data.totals[index] || 0;
          const completed = data.completed[index] || 0;
          const percent = total > 0 ? (completed / total) * 100 : 0;

          return { x: month, y: +percent.toFixed(1), raw: completed };
        });

        const remainingSeries = fyMonths.map((month, index) => {
          const total = data.totals[index] || 0;
          const completed = data.completed[index] || 0;
          const remaining = total - completed;
          const percent = total > 0 ? (remaining / total) * 100 : 0;

          return { x: month, y: +percent.toFixed(1), raw: remaining };
        });

        return [
          {
            name: completedLabel,
            group: fiscalYear,
            data: completedSeries,
          },
          {
            name: remainingLabel,
            group: fiscalYear,
            data: remainingSeries,
          },
        ];
      });
  };

  const tasksData = buildCompletionSeriesByFiscalYear(
    tasksRawData,
    "Completed KPA",
    "Remaining KPA"
  );

  const tasksGraphData = buildCompletionSeriesByFiscalYear(
    tasksOverallRedux,
    "Completed Tasks",
    "Remaining Tasks",
    isDepartmentTask
  );

  const annualKpaTotals = useMemo(() => {
    const selectedYearSeries = tasksData.filter(
      (series) => series.group === selectedFiscalYear
    );

    const monthlyCompleted = Array(12).fill(0);
    const monthlyPending = Array(12).fill(0);

    selectedYearSeries.forEach((series) => {
      (series.data || []).forEach((point, index) => {
        const rawCount = Number(point?.raw) || 0;
        if (series.name === "Completed KPA") {
          monthlyCompleted[index] = rawCount;
        }
        if (series.name === "Remaining KPA") {
          monthlyPending[index] = rawCount;
        }
      });
    });

    return {
      completed: monthlyCompleted.reduce((sum, count) => sum + count, 0),
      pending: monthlyPending.reduce((sum, count) => sum + count, 0),
    };
  }, [tasksData, selectedFiscalYear]);

  const annualKpaTotal =
    annualKpaTotals.completed + annualKpaTotals.pending;

  const annualTasksTotals = useMemo(() => {
    const selectedYearSeries = tasksGraphData.filter(
      (series) => series.group === selectedFiscalYear
    );

    const monthlyCompleted = Array(12).fill(0);
    const monthlyPending = Array(12).fill(0);

    selectedYearSeries.forEach((series) => {
      (series.data || []).forEach((point, index) => {
        const rawCount = Number(point?.raw) || 0;
        if (series.name === "Completed Tasks") {
          monthlyCompleted[index] = rawCount;
        }
        if (series.name === "Remaining Tasks") {
          monthlyPending[index] = rawCount;
        }
      });
    });

    return {
      completed: monthlyCompleted.reduce((sum, count) => sum + count, 0),
      pending: monthlyPending.reduce((sum, count) => sum + count, 0),
    };
  }, [tasksGraphData, selectedFiscalYear]);

  const annualTasksTotal =
    annualTasksTotals.completed + annualTasksTotals.pending;

  const tasksOptions = {
    chart: {
      type: "bar",
      stacked: true, // ✅ Enable stacking
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const clickedMonth =
            config.w.config.series[config.seriesIndex].data[
              config.dataPointIndex
            ].x;

          dispatch(setSelectedMonth(clickedMonth));

          const selectedMonthTasks = [];
          tasksOverallRedux.forEach((dept) => {
            dept.tasks.forEach((task) => {
              if (!isDepartmentTask(task)) return;

              const [day, month, year] = task.assignedDate
                .split("-")
                .map(Number);
              const taskDate = new Date(year, month - 1, day);
              const taskMonth = fyMonths[(taskDate.getMonth() + 9) % 12];

              if (taskMonth === clickedMonth) {
                selectedMonthTasks.push({
                  department: dept.department,
                  ...task,
                });
              }
            });
          });

            navigate("/app/dashboard/HR-dashboard/overall-KPA/department-KPA", {
              state: {
                month: clickedMonth,
                tasks: selectedMonthTasks,
              },
            });
          },
        },
      animations: { enabled: false },
      fontFamily: "Poppins-Regular",
      toolbar: { show: false },
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
      width: 1,
      colors: ["#fff"],
    },
    yaxis: {
      title: { text: "Completion (%)" },
      max: 100,
      labels: { formatter: (val) => `${val.toFixed(0)}%` },
    },
    legend: {
      position: "top",
    },
    fill: {
      opacity: 1,
    },
    colors: ["#54C4A7", "#EB5C45"],
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const month = w.config.series[seriesIndex].data[dataPointIndex].x;

        const completed = w.config.series[0].data[dataPointIndex].raw;
        const remaining = w.config.series[1].data[dataPointIndex].raw;
        const total = completed + remaining;

        return `
          <div style="padding:8px; font-family: Poppins, sans-serif; font-size: 13px; width : 200px ">
            <strong>${month}</strong><br/>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div style="width:100px ">Total KPA </div>
              <div style="width:"100%" ">:</div>
              <div style="width:"100%" ">${total}</div>
            </div>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div style="width:100px ">Completed KPA</div>
              <div style="width:"100%" ">:</div>
              <div style="width:"100%" ">${completed}</div>
            </div>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div style="width:100px ">Pending KPA</div>
              <div style="width:"100%" ">:</div>
              <div style="width:"100%" ">${remaining}</div>
            </div>
           
          </div>
        `;
      },
    },
  };
  const tasksOverallOptions = {
    chart: {
      type: "bar",
      stacked: true, // ✅ Enable stacking
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const clickedMonth =
            config.w.config.series[config.seriesIndex].data[
              config.dataPointIndex
            ].x;

          dispatch(setSelectedMonth(clickedMonth));

          const selectedMonthTasks = [];
          tasksRawData.forEach((dept) => {
            dept.tasks.forEach((task) => {
              const [day, month, year] = task.assignedDate
                .split("-")
                .map(Number);
              const taskDate = new Date(year, month - 1, day);
              const taskMonth = fyMonths[(taskDate.getMonth() + 9) % 12];

              if (taskMonth === clickedMonth) {
                selectedMonthTasks.push({
                  department: dept.department,
                  ...task,
                });
              }
            });
          });

          navigate(`overall-KPA/department-tasks`, {
            state: {
              month: clickedMonth,
              tasks: selectedMonthTasks,
            },
          });
        },
      },
      animations: { enabled: false },
      fontFamily: "Poppins-Regular",
      toolbar: { show: false },
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
      width: 1,
      colors: ["#fff"],
    },
    yaxis: {
      title: { text: "Completion (%)" },
      max: 100,
      labels: { formatter: (val) => `${val.toFixed(0)}%` },
    },
    legend: {
      position: "top",
    },
    fill: {
      opacity: 1,
    },
    colors: ["#54C4A7", "#EB5C45"],
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const month = w.config.series[seriesIndex].data[dataPointIndex].x;

        const completed = w.config.series[0].data[dataPointIndex].raw;
        const remaining = w.config.series[1].data[dataPointIndex].raw;
        const total = completed + remaining;

        return `
          <div style="padding:8px; font-family: Poppins, sans-serif; font-size: 13px; width : 200px ">
            <strong>${month}</strong><br/>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div style="width:100px ">Total tasks </div>
              <div style="width:"100%" ">:</div>
              <div style="width:"100%" ">${total}</div>
            </div>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div style="width:100px ">Completed tasks</div>
              <div style="width:"100%" ">:</div>
              <div style="width:"100%" ">${completed}</div>
            </div>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div style="width:100px ">Pending tasks</div>
              <div style="width:"100%" ">:</div>
              <div style="width:"100%" ">${remaining}</div>
            </div>
           
          </div>
        `;
      },
    },
  };

  //-------------------Tasks vs Achievements graph--------------------//

  //--------------------Attendance Data---------------//
  const { data: attendanceData = [], isLoading: isAttendanceLoading } =
    useQuery({
      queryKey: ["attendance"],
      queryFn: async () => {
        try {
          const response = await axios.get("/api/company/company-attandances");
          return response.data;
        } catch (error) {
          throw new Error(error.response.data.message);
        }
      },
    });
  //--------------------Attendance Data---------------//

  //-----------------------Working Hours-------------------//
  const { companyAttandances = [], workingDays } = attendanceData;
  const averageAttendance = calculateAverageAttendance(
    companyAttandances,
    workingDays
  );
  const averageWorkingHours = calculateAverageDailyWorkingHours(
    companyAttandances,
    workingDays
  );
  //-----------------------Working Hours-------------------//

  const columns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "title", label: "Name", align: "left" },
    { id: "start", label: "Date", align: "left" },
    { id: "day", label: "Day", align: "left" },
  ];
  //------------------Birthdays----------//
  const getUpcomingBirthdays = (employeeList) => {
    const today = dayjs();

    return employeeList
      .filter((emp) => emp.dateOfBirth) // ✅ filter out if dateOfBirth is missing/null
      .map((emp) => {
        const birthDate = dayjs(emp.dateOfBirth);

        // Prevent invalid dates like Feb 29 on non-leap years
        const normalizedDate = dayjs(
          `${today.year()}-${birthDate.format("MM-DD")}`,
          "YYYY-MM-DD",
          true // strict parsing
        );

        if (!normalizedDate.isValid()) return null;

        return {
          title: `${emp.firstName} ${emp.lastName}`,
          start: normalizedDate.format("YYYY-MM-DD"),
        };
      })
      .filter((item) => {
        if (!item) return false; // skip nulls from invalid date handling
        const birthday = dayjs(item.start);
        return birthday.month() === today.month(); // current month only
      });
  };

  const birthdays = getUpcomingBirthdays(
    usersQuery.isLoading ? [] : usersQuery.data
  );

  //------------------Birthdays----------//

  const columns2 = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "title", label: "Holiday/Event", align: "center" },
    { id: "start", label: "Date", align: "left" },
    { id: "day", label: "Day", align: "left" },
  ];

  const { data: holidayEvents = [] } = useQuery({
    queryKey: ["holidayEvents"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/events/all-events?thisMonth=true"
        );
        const filteredEvents = response.data.filter(
          (event) => event.extendedProps.type !== "birthday"
        );
        return filteredEvents;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  // Calculate total and gender-specific counts
  const totalUsers = usersQuery.isLoading ? [] : usersQuery?.data?.length;

  const maleCount = usersQuery.isLoading
    ? []
    : usersQuery.data.filter((user) => user.gender === "Male").length;

  const femaleCount = usersQuery.isLoading
    ? []
    : usersQuery.data.filter((user) => user.gender === "Female").length;

  const genderData = [
    {
      id: 0,
      value: ((maleCount / totalUsers) * 100).toFixed(2),
      actualCount: maleCount,
      label: "Male",
      color: "#0056B3",
    },
    {
      id: 1,
      value: ((femaleCount / totalUsers) * 100).toFixed(2),
      actualCount: femaleCount,
      label: "Female",
      color: "#FD507E",
    },
  ];

  const genderPieChart = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => {
          navigate("employee/employee-list");
        },
      },
    },
    stroke: {
      show: true,
      width: 1, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    labels: ["Male", "Female"], // Labels for the pie slices
    colors: ["#0056B3", "#FD507E"], // Pass colors as an array
    dataLabels: {
      enabled: true,
      position: "center",
      style: {
        fontSize: "14px", // Adjust the font size of the labels
        fontWeight: "bold",
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: "#000",
        opacity: 0.45,
      },
      formatter: function (val) {
        return `${val.toFixed(0)}%`; // Show percentage value in the center
      },
    },
    tooltip: {
      enabled: true,
      custom: function ({ seriesIndex }) {
        const item = genderData[seriesIndex]; // Use genderData to fetch the correct item
        return `
          <div style="padding: 5px; font-size: 12px;">
            ${item.label}: ${item.actualCount} employees
          </div>`;
      },
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
    },
  };

  const budgetBar = useMemo(() => {
    if (isHrFinanceLoading || !Array.isArray(hrFinance)) return null;
    const data = transformBudgetData(hrFinance);
    setBudgetData(data);
    return data;
  }, [isHrFinanceLoading, hrFinance]);

  // const totalUtilised =
  //   budgetBar?.[selectedFiscalYear]?.utilisedBudget?.reduce(
  //     (acc, val) => acc + val,
  //     0
  //   ) || 0;

  //Salary calculation

  const totalEmployees = useQuery.isLoading ? [] : usersQuery?.data?.length;
  const salaryExpense = isHrFinanceLoading
    ? []
    : hrFinance.filter((item) => item.expanseType === "SALARY EXPENSES");

  const salaryBar = useMemo(() => {
    if (isHrFinanceLoading || !Array.isArray(hrFinance)) return null;
    const data = transformBudgetData(salaryExpense);
    setBudgetData(data);
    return data;
  }, [isHrFinanceLoading, hrFinance]);

  // const totalSalary =
  //   salaryBar?.[selectedFiscalYear]?.utilisedBudget?.reduce(
  //     (acc, val) => acc + val,
  //     0
  //   ) || 0;

  const lastUtilisedValue = hrBarData?.utilisedBudget?.at(-1) || 0;

  //------------------- UnitData -----------------------//
  const { data: unitsData = [], isPending: isUnitsPending } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");

        return response.data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  const totalSqft = unitsData
    .filter((item) => item.isActive === true)
    .reduce((sum, item) => (item.sqft || 0) + sum, 0);
  //--------------------UnitData -----------------------//
  //--------------------New Data card data -----------------------//

  const HrExpenses = {
  cardTitle: "Expenses",
  descriptionData: [
    {
      title: `${selectedHrFiscalYear}`,
      value: `INR ${inrFormat(totalUtilised)}`,
      route: "finance",
    },
    {
      title: `Projected Amount ${previousExpenseMonthLabel}`,
      value: `INR ${inrFormat(previousMonthProjectedExpense)}`,
      route: "finance",
    },
    {
      title: `Actual Amount ${previousExpenseMonthLabel}`,
      value: `INR ${inrFormat(previousMonthActualExpense)}`,
      route: "finance",
    },
    {
      title: "Overall Active Head Count",
      value: activeHeadCount,
      route: "employee/employee-list",
    },
    {
      title: `Exit Head Count ${previousMonthExitLabel}`,
      value: previousMonthExitCount,
      route: "employee/past-employees",
      stateData: {
        filterType: "last-month-exits",
        startDate: previousMonthStart.toISOString(),
        endDate: previousMonthEnd.toISOString(),
        label: previousMonthExitLabel,
        employeeIds: previousMonthExitEmployeeIds,
      },
    },
  ],
};
  function getFYDateRange(fyString) {
    const match = fyString.match(/FY\s*(\d{4})-(\d{2})/);
    if (!match) throw new Error("Invalid FY format");

    const startYear = parseInt(match[1], 10);
    const endYear = startYear + 1;
    const fyStart = `${startYear}-04-01`;
    const fyEnd = `${endYear}-03-31`;

    return { fyStart, fyEnd };
  }
  function getAverageHeadcount(employees, selectedFiscalYear) {
    const { fyStart, fyEnd } = getFYDateRange(selectedFiscalYear);

    const months = [];
    let current = dayjs(fyStart).startOf("month");

    while (current.isSameOrBefore(fyEnd, "month")) {
      months.push(current);
      current = current.add(1, "month");
    }

    const monthlyCounts = months.map((monthStart) => {
      const monthEnd = monthStart.endOf("month");

      const activeCount = employees?.filter((emp) => {
        const start = dayjs(emp.startDate);
        const end = emp.endDate ? dayjs(emp.endDate) : null;

        return (
          start.isSameOrBefore(monthEnd, "day") &&
          (!end || end.isSameOrAfter(monthStart, "day"))
        );
      }).length;

      return activeCount;
    });

    const average =
      monthlyCounts.reduce((sum, count) => sum + count, 0) /
      monthlyCounts.length;

    return {
      monthlyCounts,
      average: Math.round(average),
    };
  }

  const averageHeadCount = useMemo(() => {
    return getAverageHeadcount(
      usersQuery.isLoading ? [] : usersQuery.data,
      selectedHrFiscalYear
    );
  }, [usersQuery.data, usersQuery.isLoading, selectedHrFiscalYear]);

  useEffect(() => {
    console.log("selectedYear : ", selectedHrFiscalYear);
  }, [selectedHrFiscalYear]);

  const HrAverageExpense = useMemo(
    () => ({
      cardTitle: "Averages",
      descriptionData: [
        {
          title: "Annual Average Expense",
          value: `INR ${inrFormat(totalUtilised / 12)}`,
          route: "finance",
        },
        {
          title: "Annual Average Projected Amt",
          value: `INR ${inrFormat(averageProjectedAmount)}`,
          route: "finance",
        },
        {
          title: "Annual Average Actual Amt",
          value: `INR ${inrFormat(averageActualAmount)}`,
          route: "finance",
        },
        {
          title: "Average Attendance",
          route: "employee/attendance",
          value: averageAttendance
            ? `${Number(averageAttendance).toFixed(0)}%`
            : "0%",
        },
        {
          title: "Average Hours",
          route: "employee/attendance",
          value: averageWorkingHours
            ? `${Number(averageWorkingHours).toFixed(2)}h`
            : "0h",
        },
      ],
    }),
    [
      totalUtilised,
      averageProjectedAmount,
      averageActualAmount,
      averageAttendance,
      averageWorkingHours,
    ]
  );

  //--------------------New Data card data -----------------------//

  //First pie-chart config data end

  //----------------------------------Second pie-chart config data start--------------------------------

  const cityData = {};

  usersQuery.data?.forEach((emp) => {
    let rawCity = emp?.homeAddress?.city || "Others";
    let normalizedCity = rawCity.trim().toLowerCase();
    let displayCity =
      normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1);

    cityData[displayCity] = (cityData[displayCity] || 0) + 1;
  });

  // 🔁 Group small-count cities into 'Others'
  const processedCityData = {};
  let othersCount = 0;

  Object.entries(cityData).forEach(([city, count]) => {
    if (count <= 1) {
      othersCount += count;
    } else {
      processedCityData[city] = count;
    }
  });

  if (othersCount > 0) {
    processedCityData["Others"] =
      (processedCityData["Others"] || 0) + othersCount;
  }

  // ✅ Convert to array for PieChartMui
  const pieChartData = Object.entries(processedCityData).map(
    ([city, count]) => ({
      label: city,
      value: count,
    })
  );

  const techGoaVisitorsOptions = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
    },
    labels: pieChartData.map((item) => item.label),
    colors: [
      "#1E3D73", // original
      "#34528A", // slightly lighter
      "#4A68A1", // medium shade
      "#608DB8", // lighter
      "#76A2CF", // even lighter
      "#8CB8E6", // lightest
    ],

    legend: {
      position: "right",
    },
    stroke: {
      show: true,
      width: 1, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return `${value} employee${value > 1 ? "s" : ""}`;
        },
      },
    },
  };

  // PIE START
  const pieChartsConfig = [
    {
      layout: 1,
      key: "employeeGenderDistribution",
      title: "Employee Gender Distribution ",
      border: true,
      percent: true,
      data: genderData,
      options: genderPieChart,
      height:320,
      width:500,
      permission: PERMISSIONS.HR_EMPLOYEE_GENDER_DISTRIBUTION_PIE.value,
    },
    {
      layout: 1,
      key: "cityWiseEmployees",
      title: "City Wise Employees ",
      border: true,
      percent: true,
      data: pieChartData,
      options: techGoaVisitorsOptions,
      height:320,
      width:500,
      permission: PERMISSIONS.HR_CITY_WISE_EMPLOYEES_PIE.value,
    },
  ];

  const allowedPieCharts = pieChartsConfig.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission)
  );
  // PIE END

  // Graphs
  const expenseGraphConfig = {
    permission: PERMISSIONS.HR_DEPARTMENT_EXPENSE.value,
  };

  const kpaGraphConfig = {
    permission: PERMISSIONS.HR_ANNUAL_KPA_VS_ACHIEVEMENTS.value,
  };

  const tasksGraphConfig = {
    permission: PERMISSIONS.HR_ANNUAL_TASKS_VS_ACHIEVEMENTS.value,
  };

  // Cards
  const financeCardConfig = {
    permission: PERMISSIONS.HR_EXPENSES.value,
  };
  const averageCardConfig = {
    permission: PERMISSIONS.HR_AVERAGES.value,
  };

  // Tables
  const birthdayTableConfig = {
    permission: PERMISSIONS.HR_CURRENT_MONTH_BIRTHDAY_LIST.value,
  };
  const holidayTableConfig = {
    permission: PERMISSIONS.HR_CURRENT_MONTH_HOLIDAY_LIST.value,
  };
// unit wise due task , executive wise due taska
   const dueTasksConfigs = [
    {
      key: PERMISSIONS.HR_UNIT_WISE_DUE_TASKS.value,
      title: "Unit Wise Due Tasks",
      type: "PieChartMui",
      border: true,
      data: unitWisePieData,
      options: unitPieChartOptions,
      width: 500,
      height: 320,
      centerAlign: true,
    },
    {
      key: PERMISSIONS.HR_EXECUTIVE_WISE_DUE_TASKS.value,
      title: "Executive Wise Due Tasks",
      type: "DonutChart",
      border: true,
      centerLabel: "Tasks",
      labels: executiveTaskLabels,
      colors: executiveTaskColors,
      series: executiveTasksCount,
      tooltipValue: executiveTasksCount,
      tooltipFormatter: (label, value) => `${label}: ${value || 0} pending tasks`,
    },
  ];

  const allowedDueTasks = dueTasksConfigs.filter((widget) =>
    userPermissions.includes(widget.key)
  );

  const hrTicketChartConfigs = [
    {
      key: PERMISSIONS.HR_CATEGORY_WISE_TICKETS.value,
      type: "PieChartMui",
      border: true,
      title: "Category Wise Tickets",
      data: hrCategoryWiseTicketsData,
      options: hrCategoryWiseTicketsOptions,
      centerAlign: true,
      height: 320,
      width: 500,
    },
    {
      key: PERMISSIONS.HR_DUE_TICKETS.value,
      type: "PieChartMui",
      border: true,
      title: "Due Tickets",
      data: hrDueTicketsData,
      options: hrDueTicketsOptions,
      centerAlign: true,
      height: 320,
      width: 500,
    },
  ];

  const allowedHrTicketCharts = hrTicketChartConfigs.filter((widget) =>
    userPermissions.includes(widget.key)
  );

  const hrWidgets = [
    {
      layout: 1,
      widgets: [
        userPermissions.includes(expenseGraphConfig.permission) && (
          <Suspense
            fallback={
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Skeleton variant="text" width={200} height={30} />
                <Skeleton variant="rectangular" width="100%" height={300} />
              </Box>
            }
          >
            <WidgetSection normalCase layout={1} padding>
              <YearlyGraph
                data={expenseRawSeries}
                responsiveResize
                chartId={"bargraph-hr-expense"}
                options={expenseOptions}
                title={`BIZ Nest HR DEPARTMENT EXPENSE`}
                titleAmount={`INR ${inrFormat(totalUtilised)}`}
                onYearChange={setSelectedHrFiscalYear}
              />
            </WidgetSection>
          </Suspense>
        ),
      ].filter(Boolean),
    },
    {
      layout: 2,
      widgets: [
        userPermissions.includes(financeCardConfig.permission) && (
          <FinanceCard titleCenter {...HrExpenses} />
        ),
        userPermissions.includes(averageCardConfig.permission) && (
          <FinanceCard titleCenter {...HrAverageExpense} />
        ),
      ].filter(Boolean),
    },
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
      layout: 2,
      widgets: [
        userPermissions.includes(kpaGraphConfig.permission) && (
          <Suspense
            fallback={
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Skeleton variant="text" width={200} height={30} />
                <Skeleton variant="rectangular" width="100%" height={300} />
              </Box>
            }
          >
            <YearlyGraph
              data={tasksData}
              options={tasksOptions}
              title={"ANNUAL KPA VS ACHIEVEMENTS"}
              titleAmount=""
              TitleAmountTotal={annualKpaTotal}
              TitleAmountGreen={annualKpaTotals.completed}
              TitleAmountRed={annualKpaTotals.pending}
              totalTitle="Total"
              greenTitle="KPA"
              redTitle="KPA"
              summaryChipVariant="ticket"
              secondParam
              currentYear={true}
              onYearChange={setSelectedFiscalYear}
            />
          </Suspense>
        ),
        userPermissions.includes(tasksGraphConfig.permission) && (
          <Suspense
            fallback={
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Skeleton variant="text" width={200} height={30} />
                <Skeleton variant="rectangular" width="100%" height={300} />
              </Box>
            }
          >
            <YearlyGraph
              data={tasksGraphData}
              options={tasksOverallOptions}
              title={"ANNUAL TASKS VS ACHIEVEMENTS"}
              titleAmount=""
              TitleAmountTotal={annualTasksTotal}
              TitleAmountGreen={annualTasksTotals.completed}
              TitleAmountRed={annualTasksTotals.pending}
              totalTitle="Total"
              greenTitle="Tasks"
              redTitle="Tasks"
              summaryChipVariant="ticket"
              secondParam
              currentYear={true}
              onYearChange={setSelectedFiscalYear}
            />
          </Suspense>
        ),
      ].filter(Boolean),
    },
    {
      layout: allowedPieCharts.length,
      widgets: allowedPieCharts.map((item) => (
        <WidgetSection
          key={item.key}
          layout={item.layout}
          title={item.title}
          border={item.border}
        >
          <PieChartMui
            percent={item.percent}
            title={item.title}
            data={item.data}
            options={item.options}
            width={item?.width}
            height={item?.height}
            centerAlign
          />
        </WidgetSection>
      )),
    },
    {
       layout: allowedDueTasks.length,
      widgets: allowedDueTasks.map((config) => (
        <WidgetSection key={config.key} border title={config.title}>
          {config.type === "PieChartMui" ? (
            <PieChartMui
              data={config.data}
              options={config.options}
              width={config.width}
              height={config.height}
              centerAlign={config.centerAlign}
            />
          ) : (
            <DonutChart
              centerLabel={config.centerLabel}
              labels={config.labels}
              colors={config.colors}
              series={config.series}
              tooltipValue={config.tooltipValue}
              tooltipFormatter={config.tooltipFormatter}
            />
          )}
        </WidgetSection>
      )),
    },
    {
      layout: allowedHrTicketCharts.length,
      widgets: allowedHrTicketCharts.map((config) => (
        <WidgetSection key={config.title} border title={config.title}>
          <PieChartMui
            data={config.data}
            options={config.options}
            width={config.width}
            height={config.height}
            centerAlign={config.centerAlign}
          />
        </WidgetSection>
      )),
    },
    {
      layout: 2,
      widgets: [
        userPermissions.includes(birthdayTableConfig.permission) &&
          (!usersQuery.isLoading ? (
            <MuiTable
              key={birthdays.length}
              Title="Current Month's Birthday List"
              columns={columns}
              rows={birthdays
                .filter((bd) => bd.start)
                .sort(
                  (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
                )
                .map((bd, index) => ({
                  id: index + 1,
                  title: bd.title,
                  start: dayjs(bd.start).format("DD-MM-YYYY"),
                  day: dayjs(bd.start).format("dddd"),
                }))}
              rowsToDisplay={40}
              scroll={true}
              className="h-full"
            />
          ) : (
            <CircularProgress key="loading-spinner" />
          )),
        userPermissions.includes(holidayTableConfig.permission) && (
          <MuiTable
            Title="Current Months Holiday List"
            columns={columns2}
            rows={holidayEvents
              .filter((h) => h.start)
              .sort(
                (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
              )
              .map((holiday, index) => ({
                id: index + 1,
                title: holiday.title,
                start: dayjs(holiday.start).format("DD-MM-YYYY"),
                day: dayjs(holiday.start).format("dddd"),
              }))}
            rowsToDisplay={40}
            scroll={true}
            className="h-full"
          />
        ),
      ].filter(Boolean),
    },
  ];

  const visibleHrWidgets = hrWidgets.filter(
    (widget) => Array.isArray(widget?.widgets) && widget.widgets.length > 0,
  );

  // const hrWidgets = [
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
  //         }>
  //         <WidgetSection normalCase layout={1} padding>
  //           <YearlyGraph
  //             data={expenseRawSeries}
  //             responsiveResize
  //             chartId={"bargraph-hr-expense"}
  //             options={expenseOptions}
  //             title={`BIZ Nest HR DEPARTMENT EXPENSE`}
  //             titleAmount={`INR ${inrFormat(totalUtilised)}`}
  //             onYearChange={setSelectedHrFiscalYear}
  //           />
  //         </WidgetSection>
  //       </Suspense>,
  //     ],
  //   },
  //   {
  //     layout: 2,
  //     widgets: [
  //       <FinanceCard titleCenter {...HrExpenses} />,
  //       <FinanceCard titleCenter {...HrAverageExpense} />,
  //     ],
  //   },
  //   // {
  //   //   layout: 6,
  //   //   widgets: [
  //   //     { icon: <CgWebsite />, title: "Employee", route: "employee" },
  //   //     { icon: <LuHardDriveUpload />, title: "Company", route: "company" },
  //   //     { icon: <SiCashapp />, title: "Finance", route: "finance" },
  //   //     { icon: <CgWebsite />, title: "Mix Bag", route: "mix-bag" },
  //   //     { icon: <SiGoogleadsense />, title: "Data", route: "data" },
  //   //     {
  //   //       icon: <MdMiscellaneousServices />,
  //   //       title: "Settings",
  //   //       route: "settings/bulk-upload",
  //   //     },
  //   //   ]
  //   //     // .filter((widget) => accessibleModules.has(widget.title)) // ✅ Filter widgets
  //   //     .map((widget, index) => (
  //   //       <Card
  //   //         key={index}
  //   //         icon={widget.icon}
  //   //         title={widget.title}
  //   //         route={widget.route}
  //   //       />
  //   //     )), // ✅ Convert objects into JSX elements
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
  //     layout: 2,
  //     widgets: [
  //       <Suspense
  //         fallback={
  //           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
  //             {/* Simulating chart skeleton */}
  //             <Skeleton variant="text" width={200} height={30} />
  //             <Skeleton variant="rectangular" width="100%" height={300} />
  //           </Box>
  //         }>
  //         <YearlyGraph
  //           data={tasksData}
  //           options={tasksOptions}
  //           title={"ANNUAL KPA VS ACHIEVEMENTS"}
  //           titleAmount={`TOTAL KPA : ${tasksForSelectedYear.length || 0}`}
  //           secondParam
  //           currentYear={true}
  //           onYearChange={setSelectedFiscalYear}
  //         />
  //       </Suspense>,
  //       <Suspense
  //         fallback={
  //           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
  //             {/* Simulating chart skeleton */}
  //             <Skeleton variant="text" width={200} height={30} />
  //             <Skeleton variant="rectangular" width="100%" height={300} />
  //           </Box>
  //         }>
  //         <YearlyGraph
  //           data={tasksGraphData}
  //           options={tasksOverallOptions}
  //           title={"ANNUAL TASKS VS ACHIEVEMENTS"}
  //           titleAmount={`TOTAL TASKS : ${overallTasksForYear.length || 0}`}
  //           secondParam
  //           currentYear={true}
  //           onYearChange={setSelectedFiscalYear}
  //         />
  //       </Suspense>,
  //     ],
  //   },

  //   // {
  //   //   layout: 2,
  //   //   heading: "Site Visitor Analytics",
  //   //   widgets: [
  //   //     <WidgetSection title={"Employee Gender Distribution"} border>
  //   //       <PieChartMui
  //   //         percent={true} // Enable percentage display
  //   //         title={"Gender Distribution"}
  //   //         data={genderData} // Pass processed data
  //   //         options={genderPieChart}
  //   //       />
  //   //     </WidgetSection>,
  //   //     <WidgetSection layout={1} border title={"City Wise Employees"}>
  //   //       {!usersQuery.isLoading ? (
  //   //         <PieChartMui
  //   //           percent={true} // Enable percentage display
  //   //           data={pieChartData} // Pass processed data
  //   //           options={techGoaVisitorsOptions}
  //   //         />
  //   //       ) : (
  //   //         <Skeleton height={"100%"} width={"100%"} />
  //   //       )}
  //   //     </WidgetSection>,
  //   //   ],
  //   // },
  //   {
  //     layout: allowedPieCharts.length, // ✅ dynamic layout
  //     widgets: allowedPieCharts.map((item) => (
  //       <WidgetSection
  //         key={item.key}
  //         layout={item.layout}
  //         title={item.title}
  //         border={item.border}>
  //         <PieChartMui
  //           percent={item.percent}
  //           title={item.title}
  //           data={item.data}
  //           options={item.options}
  //         />
  //       </WidgetSection>
  //     )),
  //   },

  //   {
  //     layout: 2,
  //     widgets: [
  //       !usersQuery.isLoading ? (
  //         <MuiTable
  //           key={birthdays.length}
  //           Title="Current Month's Birthday List"
  //           columns={columns}
  //           rows={birthdays
  //             .filter((bd) => bd.start) // Only entries with a start date
  //             .sort(
  //               (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
  //             ) // ✅ Sort by date ascending
  //             .map((bd, index) => {
  //               const date = dayjs(bd.start);
  //               return {
  //                 id: index + 1,
  //                 title: bd.title,
  //                 start: date.format("DD-MM-YYYY"),
  //                 day: date.format("dddd"),
  //               };
  //             })}
  //           rowsToDisplay={40}
  //           scroll={true}
  //           className="h-full"
  //         />
  //       ) : (
  //         <CircularProgress key="loading-spinner" />
  //       ),

  //       <MuiTable
  //         Title="Current Months Holiday List"
  //         columns={columns2}
  //         rows={holidayEvents
  //           .filter((h) => h.start) // Optional: safety check for valid dates
  //           .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()) // ✅ Sort ascending
  //           .map((holiday, index) => {
  //             const date = dayjs(holiday.start);
  //             return {
  //               id: index + 1,
  //               title: holiday.title,
  //               start: date.format("DD-MM-YYYY"),
  //               day: date.format("dddd"),
  //             };
  //           })}
  //         rowsToDisplay={40}
  //         scroll={true}
  //         className="h-full"
  //       />,
  //     ],
  //   },
  // ];

  useEffect(() => {
    if (!isHrFinanceLoading && Array.isArray(hrFinance)) {
      const data = transformBudgetData(hrFinance);
      const utilised = data?.[selectedFiscalYear]?.utilisedBudget?.reduce(
        (a, b) => a + b,
        0
      );

      //Salary calculation
      const salary = transformBudgetData(salaryExpense);
      const utilisedSalary = salary?.[
        selectedFiscalYear
      ]?.utilisedBudget?.reduce((a, b) => a + b, 0);
      setTotalSalary(utilisedSalary);
    }
  }, [isHrFinanceLoading, hrFinance]);

  return (
    <>
      <div>
        <div className="flex flex-col gap-4">
          {visibleHrWidgets.map((widget, index) => (
            <LazyDashboardWidget
              key={index}
              layout={widget.layout}
              widgets={widget.widgets}
            />
            // <WidgetSection key={index} layout={widget?.layout}>
            //   {widget?.widgets}
            // </WidgetSection>
          ))}
        </div>
      </div>
    </>
  );
};

export default HrDashboard;
