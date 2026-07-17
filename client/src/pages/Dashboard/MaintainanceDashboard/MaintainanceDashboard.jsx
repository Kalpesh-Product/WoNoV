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
import { useDispatch } from "react-redux";
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
import { filterPermissions } from "../../../utils/accessConfig";
import StatusChip from "../../../components/StatusChip";
import {
  setSelectedDepartment,
  setSelectedDepartmentName,
} from "../../../redux/slices/assetsSlice";

const MaintainanceDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();
const department = usePageDepartment();
const axios = useAxiosPrivate();
const navigate = useNavigate();
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

const currentDepartmentId = department?._id;
const currentDepartmentName = department?.name || "Maintenance";
const encodedDepartmentName = encodeURIComponent(currentDepartmentName);

const handleUnderMaintenanceAssetsClick = () => {
  if (!currentDepartmentId) return;

  dispatch(setSelectedDepartment(currentDepartmentId));
  dispatch(setSelectedDepartmentName(currentDepartmentName));
  navigate(
    `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/assets-under-maintenance`,
    {
      state: { assetStatusFilter: "underMaintenance" },
    },
  );
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
const currentFiscalMonthIndexForCard =
  dayjs().month() >= 3 ? dayjs().month() - 3 : dayjs().month() + 9;

  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const normalizeListResponse = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.tasks)) return response.tasks;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.response)) return response.response;
    return [];
  };
  const { data: selectedDepartments = [] } = useQuery({
    queryKey: ["maintenance-selectedDepartments"],
    queryFn: async () => {
      const response = await axios.get(
        "api/company/get-company-data?field=selectedDepartments",
      );
      return Array.isArray(response.data?.selectedDepartments)
        ? response.data.selectedDepartments
        : [];
    },
  });

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

  
  //----------------------KPA Data-----------------------//
  const fetchDepartments = async () => {
    if (!department?._id) {
      return [];
    }

    try {
      const response = await axios.get(
        `/api/performance/get-tasks?dept=${department._id}&type=KPA&duration=Monthly`
      );
      return normalizeListResponse(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  };
  const { data: departmentKra = [], isPending: departmentLoading } = useQuery({
    queryKey: ["fetchedMonthlyKPA", department?._id],
    queryFn: fetchDepartments,
    enabled: !!department?._id,
  });
  //----------------------KPA Data-----------------------//
  const totalOverallExpense = isHrFinanceLoading
    ? []
    : hrFinance.reduce((sum, item) => (sum + item.actualAmount || 0, 0));
  console.log("totalExpense : ", totalOverallExpense);
  //----------------------Monthly average-----------------------//

  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks", department?._id],
    queryFn: async () => {
      if (!department?._id) {
        return [];
      }

      try {
        const response = await axios.get(
          `/api/tasks/get-tasks?dept=${department._id}`
        );
        return normalizeListResponse(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        return [];
      }
    },
    enabled: !!department?._id,
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

  const { data: maintenanceAssets = [], isLoading: isMaintenanceAssetsLoading } =
    useQuery({
      queryKey: ["maintenance-assets", department?._id],
      queryFn: async () => {
        if (!department?._id) {
          return [];
        }

        try {
          const response = await axios.get(
            `/api/assets/get-assets?departmentId=${department._id}`,
          );
          return Array.isArray(response.data)
            ? response.data.flatMap((item) => item?.assets || [])
            : [];
        } catch (error) {
          console.error("Error fetching maintenance assets:", error);
          return [];
        }
      },
      enabled: !!department?._id,
    });

  const underMaintenanceAssetsCount = useMemo(() => {
    if (isMaintenanceAssetsLoading || !Array.isArray(maintenanceAssets)) {
      return 0;
    }

    return maintenanceAssets.filter((asset) => asset?.isUnderMaintenance === true)
      .length;
  }, [maintenanceAssets, isMaintenanceAssetsLoading]);

  const monthlyDueTasksCount = useMemo(() => {
    const currentMonth = dayjs();

    return (Array.isArray(tasks) ? tasks : []).filter((task) =>
      task?.dueDate ? dayjs(task.dueDate).isSame(currentMonth, "month") : false,
    ).length;
  }, [tasks]);

  //----------------------Units data-----------------------//

  const { data: weeklySchedule = [], isLoading: isWeeklyScheduleLoading } =
    useQuery({
      queryKey: ["weeklySchedule", department?._id],
      queryFn: async () => {
        if (!department?._id) {
          return [];
        }

        try {
          const response = await axios.get(
            `/api/weekly-unit/fetch-weekly-unit/${department._id}`
          );
          return response.data;
        } catch (error) {
          console.error("Error fetching data:", error);
          return [];
        }
      },
      enabled: !!department?._id,
    });

  const { data: tickets = [], isLoading: isTicketsLoading } = useQuery({
    queryKey: ["maintenance-ticket-issues", department?._id],
    queryFn: async () => {
      if (!department?._id) {
        return [];
      }

      try {
        const response = await axios.get(
          `/api/tickets/department-tickets/${department._id}`
        );
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error("Error fetching maintenance tickets:", error);
        return [];
      }
    },
    enabled: !!department?._id,
  });

  const categoryWiseMaintenance = useMemo(() => {
    if (isTicketsLoading || !Array.isArray(tickets)) return [];

    const categoryCountMap = tickets.reduce((acc, item) => {
      const category = String(item?.ticket || "Others").trim() || "Others";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const sortedCategories = Object.entries(categoryCountMap)
      .map(([unit, expense]) => ({ unit, expense }))
      .sort((first, second) => second.expense - first.expense);

    if (sortedCategories.length <= 5) {
      return sortedCategories;
    }

    const topCategories = sortedCategories.slice(0, 5);
    const othersCount = sortedCategories
      .slice(5)
      .reduce((sum, item) => sum + item.expense, 0);

    return [...topCategories, { unit: "Others", expense: othersCount }];
  }, [isTicketsLoading, tickets]);

  const totalCategoryWiseMaintenance = categoryWiseMaintenance.reduce(
    (sum, item) => sum + item.expense,
    0
  );
  const pieCategoryWiseMaintenanceData = categoryWiseMaintenance.map(
    (item) => ({
      label: item.unit,
      value: item.expense,
    })
  );
  const pieCategoryWiseMaintenanceOptions = {
    labels: categoryWiseMaintenance.map((item) => item.unit),
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
      "#7D6B91",
      "#B7B7A4",
    ],
    tooltip: {
      fillSeriesColor: false,
      custom: ({ series, seriesIndex, w }) => {
        const category =
          categoryWiseMaintenance?.[seriesIndex]?.unit ||
          w?.globals?.labels?.[seriesIndex] ||
          "Unknown";
        const count = series?.[seriesIndex] ?? 0;
        const color =
          w?.globals?.colors?.[seriesIndex] ||
          pieCategoryWiseMaintenanceOptions.colors[
            seriesIndex % pieCategoryWiseMaintenanceOptions.colors.length
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

  const hrBarData = transformBudgetData(!isHrFinanceLoading ? hrFinance : []);
  const totalExpense = hrBarData?.projectedBudget?.reduce(
    (sum, val) => sum + (val || 0),
    0
  );

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

  const expenseOptions = {
  chart: {
    type: "bar",
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
              selectedFiscalYear === currentFiscalYear;
            const isCurrentFiscalMonth =
              config?.dataPointIndex === currentFiscalMonthIndexForCard;

            if (isCurrentFiscalYearSelected && isCurrentFiscalMonth) {
              return "";
            }

            const total =
              config?.w?.globals?.stackedSeriesTotals?.[config?.dataPointIndex] ||
              0;

            return total ? inrFormat(Number(total)) : "";
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

  const budgetBar = useMemo(() => {
    if (isHrFinanceLoading || !Array.isArray(hrFinance)) return null;
    return transformBudgetData(isHrFinanceLoading ? [] : hrFinance);
  }, [isHrFinanceLoading, hrFinance]);
 const totalUtilised =
  expenseRawSeries
    .find(
      (item) =>
        item.group === selectedFiscalYear && item.name === "Actual Amount"
    )
    ?.data?.reduce((acc, val) => acc + val, 0) || 0;

  const currentFyAverageMonthlyExpense = useMemo(() => {
    const currentFyActualSeries = expenseRawSeries.find(
      (item) =>
        item.group === currentFiscalYear && item.name === "Actual Amount"
    );

    const currentFyMonths = Array.isArray(currentFyActualSeries?.data)
      ? currentFyActualSeries.data
      : [];

    if (!currentFyMonths.length) {
      return 0;
    }

    const totalCurrentFyExpense = currentFyMonths.reduce(
      (sum, value) => sum + Number(value || 0),
      0
    );

    return totalCurrentFyExpense / 12;
  }, [currentFiscalYear, expenseRawSeries]);
  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  //const navigate = useNavigate();
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
      tasks.filter(
        (task) => task?.taskType === "Department" && task?.status === "Pending",
      ),
    [tasks],
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

  // ------------------------------------------------------------------------------------------------------------------//
  // ------------------------------------------------------------------------------------------------------------------//
  // Due Maintenance
  const dueTicketStatuses = new Set(["open", "pending", "in progress", "escalated"]);

  const totalMaintenanceTicketsCount = Array.isArray(tickets) ? tickets.length : 0;
  const dueMaintenanceTicketsCount = (Array.isArray(tickets) ? tickets : []).filter(
    (ticket) => dueTicketStatuses.has(String(ticket?.status || "").toLowerCase())
  ).length;

  const dueMaintenanceData = [
    { label: "Total", value: totalMaintenanceTicketsCount },
    { label: "Due", value: dueMaintenanceTicketsCount },
  ];

  const dueMaintenanceOptions = {
    labels: dueMaintenanceData.map((item) => item.label),
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
    colors: ["#93C5FD", "#FCA5A5"],
    tooltip: {
      fillSeriesColor: false,
      custom: ({ series, seriesIndex, w }) => {
        const label = w?.globals?.labels?.[seriesIndex] || "Unknown";
        const count = series?.[seriesIndex] ?? 0;
        const color =
          w?.globals?.colors?.[seriesIndex] ||
          dueMaintenanceOptions.colors[
            seriesIndex % dueMaintenanceOptions.colors.length
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
  //----------------------------------------------------------------------------------------------------------//

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
          // navigate(
          //   "/app/dashboard/admin-dashboard/client-members/client-members-data"
          // );
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

  const priorityTasksColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "taskName", label: "Task Name", align: "left" },
    {
      id: "status",
      label: "Status",
      renderCell: (data) => {
        const status = String(data.status || "-");
        const normalizedStatus = status.toLowerCase();
        const styleMap = {
          approved: { backgroundColor: "#DCFCE7", color: "#166534" },
          pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
          rejected: { backgroundColor: "#FEE2E2", color: "#991B1B" },
          completed: { backgroundColor: "#DCFCE7", color: "#166534" },
        };

        const chipStyle = styleMap[normalizedStatus] || {
          backgroundColor: "#F5F5F5",
          color: "#616161",
        };

        return (
          <>
            <Chip sx={{ ...chipStyle }} label={status} size="small" />
          </>
        );
      },
      align: "left",
    },
    { id: "endTime", label: "End Time", align: "left" },
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

  //--------------------ACCESS CONFIG------------------//

  // 1️⃣ Yearly Graph Config
  const maintenanceYearlyGraphConfigs = [
    {
      key: PERMISSIONS.MAINTENANCE_DEPARTMENT_EXPENSES.value,
      chartId: "bargraph-hr-expense",
      layout: 1,
      title: "BIZ Nest MAINTENANCE DEPARTMENT EXPENSE",
      data: expenseRawSeries,
      options: expenseOptions,
      titleAmount: `INR ${Math.round(totalUtilised).toLocaleString("en-IN")}`,
      onYearChange: setSelectedFiscalYear,
    },
  ];

  const allowedMaintenanceYearlyGraphs = filterPermissions(
    maintenanceYearlyGraphConfigs,
    userPermissions
  );

  // 3️⃣ PieChart Widgets
  const maintenancePieDonutChart = [
    {
      key: PERMISSIONS.MAINTENANCE_CATEGORY_WISE_MAINTENANCE.value,
      title: "Category Wise Maintenance",
      border: true,
      data: pieCategoryWiseMaintenanceData,
      options: pieCategoryWiseMaintenanceOptions,
      centerAlign: true,
      type: "PieChartMui",
    },
    {
      key: PERMISSIONS.MAINTENANCE_DUE_MAINTENANCE.value,
      title: "Due Maintenance",
      border: true,
      data: dueMaintenanceData,
      options: dueMaintenanceOptions,
      centerAlign: true,
      type: "PieChartMui",
    },
  ];
  const allowedPieDonut = filterPermissions(
    maintenancePieDonutChart,
    userPermissions
  );

  // Pie chart and Donuts
  const pieChartConfig = [
    {
      key: PERMISSIONS.MAINTENANCE_CATEGORY_WISE_MAINTENANCE.value,
      title: "Unit Wise Maintenance",
      border: true,
      data: [],
      options: [],
    },
    {
      key: PERMISSIONS.MAINTENANCE_EXECUTION_CHANNEL.value,
      title: "Maintenance Execution Channel",
      border: true,
      data: [],
      options: [],
    },
    {
      key: PERMISSIONS.MAINTENANCE_AVERAGE_MONTHLY_DUE.value,
      title: "Average Monthly Due Maintenance",
      border: true,
      data: [],
      options: [],
    },
    {
      key: PERMISSIONS.MAINTENANCE_AVERAGE_YEARLY_DUE.value,
      title: "Average Yearly Due Maintenance",
      border: true,
      data: [],
      options: [],
    },
  ];
  const allowedPieChartConfig = filterPermissions(
    pieChartConfig,
    userPermissions
  );

  // Data Cards
  const maintenanceDataCardsConfig = [
    {
      key: PERMISSIONS.MAINTENANCE_OFFICES_UNDER_MANAGEMENT.value, // maintenance_offices_under_management
      title: "Total",
      data: Array.isArray(unitsData) ? unitsData.length : 0,
      description: "Offices Under Management",
      route: "maintenance-offices",
    },
    {
      key: PERMISSIONS.MAINTENANCE_MONTHLY_DUE_TASKS.value, // maintenance_monthly_due_tasks
      title: "Total",
      data: monthlyDueTasksCount,
      description: "Monthly Due Tasks",
      route: "/app/tasks",
    },
    {
      key: PERMISSIONS.MAINTENANCE_MONTHLY_EXPENSE.value, // maintenance_monthly_expense
      title: "Average",
      data: `INR ${inrFormat(currentFyAverageMonthlyExpense)}`,
      description: "Monthly Expense",
      route: "maintenance-expenses",
    },
    {
      key: PERMISSIONS.MAINTENANCE_EXPENSE_PER_SQFT.value,
      title: "Total",
      data: `INR ${inrFormat(totalUtilised / totalSqFt)}`,
      description: "Expense per Sqft",
      route: "per-sq-ft-expense",
    },
    {
      key: PERMISSIONS.MAINTENANCE_ASSETS_UNDER_MANAGEMENT.value,
      title: "Total",
      data: underMaintenanceAssetsCount,
      description: "Assets Under Management",
      route: `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/assets-under-maintenance`,
      onClick: handleUnderMaintenanceAssetsClick,
    },
    {
      key: PERMISSIONS.MAINTENANCE_MONTHLY_KPA.value,
      title: "Total",
      data: departmentKra.length || 0,
      description: "Monthly KPA",
      route: "/app/performance",
    },
  ];

  const allowedMaintenanceDataCards = filterPermissions(
    maintenanceDataCardsConfig,
    userPermissions
  );

  // 5️⃣ MuiTables (same component config group)
  const maintenanceTablesConfig = [
    {
      key: PERMISSIONS.MAINTENANCE_TOP_HIGH_PRIORITY_TASKS.value,
      Title: "Top 10 High Priority Due Tasks",
      tableType: "mui",
      rows: transformedTasks,
      columns: priorityTasksColumns,
      scroll: true,
      rowsToDisplay: transformedTasks.length,
    },
    {
      key: PERMISSIONS.MAINTENANCE_WEEKLY_EXECUTIVE_SHIFT_TIMING.value,
      Title: "Weekly Executive Shift Timing",
      tableType: "mui",
      rows: transformedWeeklyShifts,
      columns: executiveTimingsColumns,
      scroll: true,
      rowsToDisplay: transformedWeeklyShifts.length,
    },
  ];

  const allowedMaintenanceTables = filterPermissions(
    maintenanceTablesConfig,
    userPermissions
  );

   const dueTasksConfigs = [
    {
      key: PERMISSIONS.MAINTENANCE_UNIT_WISE_DUE_TASKS.value,
      type: "PieChartMui",
      border: true,
      title: "Unit Wise Due Tasks",
      data: unitWisePieData,
      options: unitPieChartOptions,
      width: 500,
      height: 320,
      centerAlign: true,
    },
    {
      key: PERMISSIONS.MAINTENANCE_EXECUTIVE_WISE_DUE_TASKS.value,
      type: "DonutChart",
      border: true,
      title: "Executive Wise Due Tasks",
      centerLabel: "Tasks",
      labels: executiveTaskLabels,
      colors: executiveTaskColors,
      series: executiveTasksCount,
      tooltipValue: executiveTasksCount,
      tooltipFormatter: (label, value) =>
        `${label}: ${value || 0} pending tasks`,
    },
  ];
  const allowedDueTasks = filterPermissions(dueTasksConfigs, userPermissions);

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
          }
        >
          <WidgetSection normalCase layout={1} padding>
            {allowedMaintenanceYearlyGraphs.map((config) => (
              <YearlyGraph
                data={config.data}
                responsiveResize
                chartId={config.chartId}
                options={config.options}
                onYearChange={config.onYearChange}
                title={config.title}
                titleAmount={config.titleAmount}
              />
            ))}
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
      widgets: allowedMaintenanceDataCards.map((config) => (
        <DataCard
          key={config.key}
          route={config.route}
          title={config.title}
          data={config.data}
          description={config.description}
          onClick={config.onClick}
        />
      )),
    },

    {
      layout: 2,
      widgets: allowedMaintenanceTables.map((config) => (

        <MuiTable
          {...config}
        />
      ))
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
      layout: 2,
      widgets: allowedPieDonut.map((config) => {
        if (config.type === "PieChartMui") {
          return (
            <WidgetSection key={config.key} border={config.border} title={config.title}>
              <PieChartMui
                data={config.data}
                options={config.options}
                width={config.width}
                height={config.height}
                centerAlign={config.centerAlign}
              />
            </WidgetSection>
          );
        } else if (config.type === "Donut") {
          return (
            <WidgetSection key={config.key} border={config.border} title={config.title}>
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
    {
      layout: 2,
      widgets: allowedPieChartConfig.map((config) => (
        <WidgetSection border={config.border} title={config.title}>
          <PieChartMui data={config.data} options={config.options} />
        </WidgetSection>
      ))

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
