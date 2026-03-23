import React, { useEffect, useMemo, useState } from "react";
import { RiArchiveDrawerLine, RiPagesLine } from "react-icons/ri";
import { MdFormatListBulleted, MdMiscellaneousServices } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import Card from "../../../components/Card";
import dayjs from "dayjs";
import WidgetSection from "../../../components/WidgetSection";
import DataCard from "../../../components/DataCard";
import MuiTable from "../../../components/Tables/MuiTable";
import BarGraph from "../../../components/graphs/BarGraph";
import PieChartMui from "../../../components/graphs/PieChartMui";
import DonutChart from "../../../components/graphs/DonutChart";
import { inrFormat } from "../../../utils/currencyFormat";
import {
  financialYearMonths,
  sourcingChannelsOptions,
  upcomingBirthdaysColumns,
  calculateCompletedTime,
} from "./SalesData/SalesData";
import { useNavigate } from "react-router-dom";
import ParentRevenue from "./ParentRevenue";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import {
  setClientData,
  setLeadsData,
  setUnitData,
} from "../../../redux/slices/salesSlice";
import { CircularProgress, Skeleton } from "@mui/material";
import { SiCashapp, SiGoogleadsense } from "react-icons/si";
import { useSidebar } from "../../../context/SideBarContext";
import FinanceCard from "../../../components/FinanceCard";
import { YearCalendar } from "@mui/x-date-pickers";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import humanDate from "../../../utils/humanDateForamt";
import LazyDashboardWidget from "../../../components/Optimization/LazyDashboardWidget";
import SectorLegend from "../../../components/graphs/SectorLegend";
import FyBarGraph from "../../../components/graphs/FyBarGraph";
import FyBarGraphCount from "../../../components/graphs/FyBarGraphCount";
import useAuth from "../../../hooks/useAuth";
import { PERMISSIONS } from "./../../../constants/permissions";
import {
  configYearlyGrpah,
  filterPermissions,
} from "../../../utils/accessConfig";
import {
  salesConfigYearlyGrpah,
  salesFilterPermissions,
} from "./salesAccessConfig";
import usePageDepartment from "../../../hooks/usePageDepartment";

const SalesDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("FY 2025-26");

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const department = usePageDepartment();

  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

   const { data: selectedDepartments = [] } = useQuery({
    queryKey: ["sales-selectedDepartments"],
    queryFn: async () => {
      const response = await axios.get(
        "api/company/get-company-data?field=selectedDepartments",
      );
      return Array.isArray(response.data?.selectedDepartments)
        ? response.data.selectedDepartments
        : [];
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["sales-dashboard-tasks", department?._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/tasks/get-tasks?dept=${department?._id}`,
      );
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: Boolean(department?._id),
  });


  //------------------------PAGE ACCESS START-------------------//
  const cardsConfig = [
    {
      route: "turnover",
      title: "Turnover",
      icon: <RiPagesLine />,
      permission: PERMISSIONS.SALES_TURNOVER.value,
    },
    {
      route: "/app/dashboard/sales-dashboard/finance",
      title: "Finance",
      icon: <SiCashapp />,
      permission: PERMISSIONS.SALES_FINANCE.value,
    },
    {
      route: "mix-bag",
      title: "Mix Bag",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.SALES_MIX_BAG.value,
    },
    {
      route: "/app/dashboard/sales-dashboard/data",
      title: "Data",
      icon: <SiGoogleadsense />,
      permission: PERMISSIONS.SALES_DATA.value,
    },
    {
      route: "/app/dashboard/sales-dashboard/settings",
      title: "Settings",
      icon: <MdMiscellaneousServices />,
      permission: PERMISSIONS.SALES_SETTINGS.value,
    },
  ];

  const allowedCards = cardsConfig.filter(
    (card) => !card.permission || userPermissions.includes(card.permission)
  );

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

      if (!acc[unitName]) {
        acc[unitName] = {
          label: unitName,
          value: 0,
        };
      }

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
        dataPointSelection: () => {
          navigate("/app/tasks");
        },
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
      const label = `${managerName} (${departmentName})`;

      if (!acc[label]) {
        acc[label] = {
          name: label,
          tasks: 0,
        };
      }

      acc[label].tasks += 1;
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

  //------------------------PAGE ACCESS END-------------------//

  //-----------------------------------------------------Graph------------------------------------------------------//
  function aggregateMonthlyRevenueByYear(data = []) {
    const monthsInYear = 12;
    const revenueByYear = {};

    data.forEach((item) => {
      Object.entries(item?.data || {}).forEach(([year, revenueArray]) => {
        if (!revenueByYear[year]) {
          revenueByYear[year] = new Array(monthsInYear).fill(0);
        }

        for (let i = 0; i < monthsInYear; i++) {
          revenueByYear[year][i] += revenueArray?.[i] || 0;
        }
      });
    });

    return revenueByYear;
  }

  const { data: totalRevenue = [], isLoading: isTotalLoading } = useQuery({
    queryKey: ["totalRevenue"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/consolidated-revenue");
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
  });

  const revenueByFiscalYear = useMemo(
    () => aggregateMonthlyRevenueByYear(totalRevenue),
    [totalRevenue]
  );

  const incomeExpenseData = useMemo(
    () =>
      Object.entries(revenueByFiscalYear)
        .sort(([yearA], [yearB]) => yearA.localeCompare(yearB))
        .map(([year, data]) => ({
          name: "Expense",
          group: `FY ${year}`,
          data,
        })),
    [revenueByFiscalYear]
  );

  const selectedSeries = incomeExpenseData.find(
    (item) => item.group === selectedFiscalYear
  );

  const totalValue = useMemo(() => {
    if (!selectedSeries) return 0;
    return selectedSeries.data.reduce((sum, val) => sum + val, 0);
  }, [selectedSeries]);

  const selectedFiscalYearShort = selectedSeries?.group?.replace("FY ", "");
  const selectedFiscalYearStart = Number(
    selectedFiscalYearShort?.split("-")?.[0]
  );
  const incomeExpenseCategories =
    Number.isFinite(selectedFiscalYearStart) && selectedFiscalYearStart > 0
      ? [
        `Apr-${String(selectedFiscalYearStart).slice(-2)}`,
        `May-${String(selectedFiscalYearStart).slice(-2)}`,
        `Jun-${String(selectedFiscalYearStart).slice(-2)}`,
        `Jul-${String(selectedFiscalYearStart).slice(-2)}`,
        `Aug-${String(selectedFiscalYearStart).slice(-2)}`,
        `Sep-${String(selectedFiscalYearStart).slice(-2)}`,
        `Oct-${String(selectedFiscalYearStart).slice(-2)}`,
        `Nov-${String(selectedFiscalYearStart).slice(-2)}`,
        `Dec-${String(selectedFiscalYearStart).slice(-2)}`,
        `Jan-${String(selectedFiscalYearStart + 1).slice(-2)}`,
        `Feb-${String(selectedFiscalYearStart + 1).slice(-2)}`,
        `Mar-${String(selectedFiscalYearStart + 1).slice(-2)}`,
      ]
      : [];
  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      animations: {
        enabled: false, // ✅ disables all animations
      },
      toolbar: { show: false },
      events: {
        dataPointSelection: () => {
          navigate("turnover");
        },
      },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7", "#EB5C45"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6, // Adds rounded corners to the top of bars
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => inrFormat(val), // <-- format here
      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
      offsetY: -22,
    },

    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: incomeExpenseCategories,
    },
    yaxis: {
      min: 0,
      max: 6000000,
      tickAmount: 4,
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => val / 100000, // Converts value to Lakhs
      },
    },

    fill: {
      opacity: 1,
    },
    tooltip: {
      enabled: false,
      y: {
        formatter: (val) => `INR ${inrFormat(val)}`,
      },
    },
  };
  //-----------------------------------------------------Graph------------------------------------------------------//

  const monthShortToFull = {
    "Apr-24": "April",
    "May-24": "May",
    "Jun-24": "June",
    "Jul-24": "July",
    "Aug-24": "August",
    "Sep-24": "September",
    "Oct-24": "October",
    "Nov-24": "November",
    "Dec-24": "December",
    "Jan-25": "January",
    "Feb-25": "February",
    "Mar-25": "March",
  };

  //-----------------------------------------------API-----------------------------------------------------------//
  const { data: leadsData = [], isPending: isLeadsPending } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/leads");
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setLeadsData(data));
    },
    onError: (error) => {
      console.error("Error fetching leads:", error);
    },
  });

  const graphData = isLeadsPending
    ? []
    : leadsData.map((item) => ({
      ...item,
      category: item.serviceCategory?.serviceName,
    }));

  const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
    queryKey: ["clientsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/co-working-clients");
        const data = response.data.filter((item) => item.isActive);
        dispatch(setClientData(data));
        return data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });
  const { data: unitsData = [], isPending: isUnitsPending } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        dispatch(setUnitData(response.data));
        return response.data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });
  //-----------------------------------------------API-----------------------------------------------------------//
  //-----------------------------------------------For Data cards-----------------------------------------------------------//
  const totalCoWorkingSeats = unitsData
    .filter((item) => item.isActive === true)
    .reduce(
      (sum, item) =>
        sum +
        (item.openDesks ? item.openDesks : 0) +
        (item.cabinDesks ? item.cabinDesks : 0),
      0
    );

  const totalSqft = unitsData
    .filter((item) => item.isActive === true)
    .reduce((sum, item) => (item.sqft || 0) + sum, 0);

  const RevenueData = {
    cardTitle: "REVENUE",
    descriptionData: [
      {
        title: selectedFiscalYear,
        value: `INR ${inrFormat(totalValue) || 0}`,
        route: "/app/dashboard/sales-dashboard/revenue/total-revenue",
      },
      {
        title: `March ${Number.isFinite(selectedFiscalYearStart)
            ? selectedFiscalYearStart + 1
            : ""
          }`,
        value: `INR ${inrFormat(selectedSeries?.data?.[11] || 0)}`,
        route: "/app/dashboard/sales-dashboard/revenue/total-revenue",
      },
      {
        title: "Closing Desks",
        value: totalCoWorkingSeats || 0,
        route: "/app/dashboard/sales-dashboard/mix-bag/inventory",
      },
      {
        title: "Active Sq Ft",
        value: inrFormat(totalSqft) || 0,
        route: "/app/dashboard/sales-dashboard/mix-bag/inventory",
      },
      {
        title: "Per Sq. Ft.",
        value: inrFormat((totalValue || 0) / (totalSqft || 0)),
        route: "/app/dashboard/sales-dashboard/mix-bag/inventory",
      },
    ],
  };

  //-----------------------------------------------For Data cards-----------------------------------------------------------//

  const totalOccupiedSeats = clientsData
    .filter((item) => item.isActive === true)
    .reduce((sum, item) => (item.totalDesks || 0) + sum, 0);

  const keyStatsData = {
    cardTitle: "KEY STATS",
    descriptionData: [
      {
        title: "Opening Desks",
        value: totalCoWorkingSeats || 0,
        route: "/app/dashboard/sales-dashboard/mix-bag/inventory",
      },
      {
        title: "Occupied Desks",
        value: totalOccupiedSeats || 0,
        route: "/app/dashboard/sales-dashboard/mix-bag/inventory",
      },
      {
        title: "Occupancy %",
        value:
          ((totalOccupiedSeats / totalCoWorkingSeats) * 100).toFixed(0) || 0,
        route: "/app/dashboard/sales-dashboard/mix-bag/inventory",
      },
      {
        title: "Current Free Desks",
        value: totalCoWorkingSeats - totalOccupiedSeats || 0,
        route: "/app/dashboard/sales-dashboard/mix-bag/inventory",
      },
      {
        title: "Unique Clients",
        value: clientsData.length || 0,
        route: "/app/dashboard/sales-dashboard/clients",
      },
    ],
  };
  const salesAverageData = {
    cardTitle: "AVERAGE",
    descriptionData: [
      {
        title: "Revenue",
        value: `INR ${inrFormat(totalValue / 12)}`,
        route: "/app/dashboard/sales-dashboard/revenue/total-revenue",
      },
      {
        title: "Occupied Desks",
        value: 553,
        route: "/app/dashboard/sales-dashboard/mix-bag/inventory",
      },
      {
        title: "Occupancy %",
        value: "93",
        route: "/app/dashboard/sales-dashboard/mix-bag/inventory",
      },
      {
        title: "Clients",
        value: "45",
        route: "/app/dashboard/sales-dashboard/clients",
      },
      {
        title: "Provisioned Desks",
        value: "140",
        route: "/app/dashboard/sales-dashboard/mix-bag/inventory",
      },
    ],
  };

  //-----------------------------------------------For Data cards-----------------------------------------------------------//
  //-----------------------------------------------Conversion of leads into graph-----------------------------------------------------------//

  const transformedLeadsData = [];

  if (Array.isArray(leadsData)) {
    const domainMap = {};

    leadsData.forEach((lead) => {
      const domain = lead.serviceCategory?.serviceName;
      if (!domain) return;

      const createdMonth = `${dayjs(lead.dateOfContact).month()}`; // 0 = Jan, 11 = Dec

      // Initialize if domain not yet seen
      if (!domainMap[domain]) {
        domainMap[domain] = Array(12).fill(0);
      }

      domainMap[domain][createdMonth]++;
    });

    // Convert domainMap to array format
    for (const domain in domainMap) {
      transformedLeadsData.push({
        domain,
        leads: domainMap[domain],
      });
    }
  }
  const reorderToFinancialYear = (leadsArray) => {
    return [
      ...leadsArray.slice(3), // Apr to Dec (indexes 3 to 11)
      ...leadsArray.slice(0, 3), // Jan to Mar (indexes 0 to 2)
    ];
  };

  const monthlyLeadsOptions = {
    chart: {
      type: "bar",
      animation: false,
      toolbar: false,
      stacked: true,
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selectedMonthAbbr = financialYearMonths[config.dataPointIndex];
          const selectedMonthFull = monthShortToFull[selectedMonthAbbr];
          navigate(
            `unique-leads?month=${encodeURIComponent(selectedMonthAbbr)}`
          );
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "35%",
        borderRadius: 5,
        dataLabels: {
          position: "center",
        },
      },
    },
    yaxis: {
      title: { text: "Lead Count" },
      tickAmount: 5,
    },
    legend: { position: "top" },
    dataLabels: { enabled: true },
    tooltip: {
      y: {
        formatter: (val) => `${val} Leads`,
      },
    },
    colors: [
      "#1E3D73", // Dark Blue (Co-Working)
      "#2196F3", // Bright Blue (Meetings)
      "#98F5E1", // Light Mint Green (Virtual Office)
      "#00BCD4", // Cyan Blue (Workation)
      "#1976D2", // Medium Blue (Alt Revenues)
    ],
  };
  //-----------------------------------------------Conversion of leads into graph-----------------------------------------------------------//
  //-----------------------------------------------Conversion of Sources into graph-----------------------------------------------------------//
  const transformedSourceData = [];
  if (Array.isArray(leadsData)) {
    const sourceMap = {};
    leadsData.forEach((item) => {
      const source = item.leadSource;
      if (!source) return;

      const createdMonth = `${dayjs(item.startDate).month()}`;

      if (!sourceMap[source]) {
        sourceMap[source] = Array(12).fill(0);
      }
      sourceMap[source][createdMonth]++;
    });
    for (const source in sourceMap) {
      transformedSourceData.push({
        source,
        sources: sourceMap[source],
      });
    }
  }
  const monthlySourceData = transformedSourceData.map((item) => ({
    name: item.source,
    data: reorderToFinancialYear(item.sources),
  }));
  //-----------------------------------------------Conversion of Sources into graph-----------------------------------------------------------//
  //-----------------------------------------------Conversion of Clients into Pie-graph-----------------------------------------------------------//
  let simplifiedClientsPie = [];

  if (!isClientsDataPending && Array.isArray(clientsData)) {
    const normalizedClientDeskData = clientsData
      .map((item) => ({
        companyName: item?.clientName || "Unknown",
        totalDesks: Number(item?.totalDesks) || 0,
      }))
      .filter((item) => item.totalDesks > 0)
      .sort((a, b) => b.totalDesks - a.totalDesks);

    const totalClientsDesks = normalizedClientDeskData.reduce(
      (sum, item) => sum + item.totalDesks,
      0
    );
    let otherTotalDesks = 0;
    simplifiedClientsPie = normalizedClientDeskData.reduce((acc, item) => {
      const clientOccupancyPercent =
        totalClientsDesks > 0 ? (item.totalDesks / totalClientsDesks) * 100 : 0;

      if (clientOccupancyPercent < 4) {
        otherTotalDesks += item.totalDesks;
        return acc;
      }

      acc.push(item);
      return acc;
    }, []);

    if (otherTotalDesks > 0) {
      simplifiedClientsPie.push({
        companyName: "Other",
        totalDesks: otherTotalDesks,
      });
    }
  }

  const totalClientsDesks = simplifiedClientsPie.reduce(
    (sum, item) => sum + item.totalDesks,
    0
  );

  const totalDeskPercent = simplifiedClientsPie.map((item) => ({
    label: `${item.companyName} ${totalClientsDesks > 0
      ? ((item.totalDesks / totalClientsDesks) * 100).toFixed(1)
      : 0
      }%`,
    value: item.totalDesks,
  }));
  const clientsDesksPieOptions = {
    labels: simplifiedClientsPie.map((item) => {
      const label = item?.companyName ? `${item.companyName}` : "Unknown";
      return label.length > 10 ? label.slice(0, 15) + "..." : label;
    }),
    chart: {
      fontFamily: "Poppins-Regular",
      toolbar: false,
    },
    colors: [
      "#0F172A", // deep navy blue
      "#1E293B", // dark slate blue
      "#1D4ED8", // vibrant blue (slightly electric)
      "#2563EB", // crisp blue
      "#3B82F6", // standard vivid blue
      "#0284C7", // cyan-leaning blue
      "#0369A1", // oceanic deep blue
      "#0EA5E9", // bright cool blue
      "#3A60B5", // bold steel blue
      "#4C51BF", // indigo-tinged blue
    ],

    tooltip: {
      y: {
        formatter: (val) => {
          return `${val} Desks`; // Explicitly return the formatted value
        },
      },
    },
    legend: {
      position: "right",
    },
  };

  //-----------------------------------------------Conversion of Clients into Pie-graph-----------------------------------------------------------//
  //-----------------------------------------------Conversion of Sector-wise into Pie-graph-----------------------------------------------------------//

  const sectorwiseData = Array.isArray(clientsData)
    ? clientsData.map((item) => ({
      clientName: item.clientName,
      sector: item.sector,
    }))
    : [];

  const totalClients = sectorwiseData.length;
  const sectorMap = {};

  sectorwiseData.forEach(({ sector }) => {
    if (!sector) return;
    sectorMap[sector] = (sectorMap[sector] || 0) + 1;
  });

  const sectorWiseRawData = Object.entries(sectorMap).map(
    ([sector, count]) => ({
      label: sector,
      count,
    })
  );

  // Step 3: Sort descending by count
  sectorWiseRawData.sort((a, b) => b.count - a.count);

  // Step 4: Group sectors below 4% into "Other"
  let otherCount = 0;
  const filteredData = [];

  sectorWiseRawData.forEach((item) => {
    const percent = (item.count / totalClients) * 100;
    if (percent < 4) {
      otherCount += item.count;
    } else {
      filteredData.push(item);
    }
  });

  if (otherCount > 0) {
    filteredData.push({
      label: "Other",
      count: otherCount,
    });
  }

  const sectorPieData = filteredData.map((item) => ({
    label: `${item.count} ${((item.count / totalClients) * 100).toFixed(1)}%`,
    value: item.count,
  }));

  const sectorPieChartOptions = {
    chart: {
      fontFamily: "Poppins-Regular",
    },

    stroke: {
      show: true,
      width: 2, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    labels: filteredData.map((item) => {
      const label = item?.label || "Unknown";
      return label.length > 10 ? label.slice(0, 15) + "..." : label;
    }),
    tooltip: {
      y: {
        formatter: (val) => `${val} Clients`,
      },
    },
    colors: [
      "#1E3D73", // original
      "#34528A", // slightly lighter
      "#4A68A1", // medium shade
      "#608DB8", // lighter
      "#76A2CF", // even lighter
      "#8CB8E6", // lightest acceptable for white bg
      "#A0BFE6", // mid-light with good contrast
      "#87A9D9", // moderate light blue
      "#6D94CC", // slightly deeper pastel blue
      "#537FBF", // transition shade before original
    ],

    legend: {
      position: "bottom",
     fontSize: "12px",
    },
  };

  //-----------------------------------------------Conversion of Sector-wise Pie-graph-----------------------------------------------------------//
  //-----------------------------------------------Conversion of Gender-wise Pie-graph-----------------------------------------------------------//
  const clientMembersData = isClientsDataPending
    ? []
    : clientsData
      .filter((item) => item.members?.length > 0)
      .map((item) => item.members)
      .flat();
  const genderCounts = clientMembersData.reduce(
  (acc, member) => {
    const value = String(member?.gender || "").trim().toLowerCase();

    if (value.startsWith("m")) acc.Male += 1;
    else if (value.startsWith("f")) acc.Female += 1;

    return acc;
  },
  { Male: 0, Female: 0 }
);

  const genderWiseData = [
  { label: "Male", value: genderCounts.Male || 0 },
  { label: "Female", value: genderCounts.Female || 0 },
];

  const genderPieChartOptions = {
  chart: {
    type: "pie",
    fontFamily: "Poppins-Regular",
  },
  labels: genderWiseData.map((item) => item.label),
  series: genderWiseData.map((item) => item.value),
  tooltip: {
    y: {
      formatter: (val) => `${val} Members`,
    },
  },
  legend: {
    position: "right",
  },
  colors: ["#1E3D73", "#54C4A7"],
};

// console.log(clientsData);
// console.log(clientMembersData);
//console.log(genderCounts);
// console.log(config.data);
// console.log(genderWiseData);
// console.log(clientMembersData);

  
  //-----------------------------------------------Conversion of Gender-wise Pie-graph-----------------------------------------------------------//
  //-----------------------------------------------Client Anniversary-----------------------------------------------------------//
  const companyTableColumns = [
    { id: "id", label: "Sr No" },
    { id: "company", label: "Company" },
    { id: "startDate", label: "Date of Join" },
    { id: "completedTime", label: "Completed Time" },
  ];

  const currentMonth = new Date().getMonth(); // 0-based index (0 = Jan, 5 = June, etc.)

  const formattedCompanyTableData = clientsData
    .filter((company) => {
      const start = new Date(company.startDate);
      return start.getMonth() === currentMonth;
    })
    .map((company, index) => ({
      id: index + 1,
      company: company.clientName,
      startDate: humanDate(company.startDate) || "18-10-2001",
      completedTime: calculateCompletedTime(company.startDate),
    }));
  //-----------------------------------------------Client Anniversary-----------------------------------------------------------//
  //-----------------------------------------------Client Birthday-----------------------------------------------------------//

  function getUpcomingBirthdays(data) {
    const today = new Date();
    const currentYear = today.getFullYear();
    let globalId = 1; // Global counter for IDs

    return data.flatMap((company) => {
      const { clientName: companyName, members } = company;

      return members
        .filter((member) => {
          if (!member.dob) return false;

          const dob = new Date(member.dob);
          const thisYearBirthday = new Date(
            currentYear,
            dob.getMonth(),
            dob.getDate()
          );

          const birthdayThisYear =
            thisYearBirthday < today
              ? new Date(currentYear + 1, dob.getMonth(), dob.getDate())
              : thisYearBirthday;

          const diffDays = Math.ceil(
            (birthdayThisYear - today) / (1000 * 60 * 60 * 24)
          );
          return diffDays >= 0 && diffDays <= 7;
        })
        .map((member) => {
          const dob = new Date(member.dob);
          const birthdayThisYear = new Date(
            currentYear,
            dob.getMonth(),
            dob.getDate()
          );
          const finalBirthday =
            birthdayThisYear < today
              ? new Date(currentYear + 1, dob.getMonth(), dob.getDate())
              : birthdayThisYear;

          const daysLeft = Math.ceil(
            (finalBirthday - today) / (1000 * 60 * 60 * 24)
          );

          return {
            id: globalId++,
            name: member.employeeName,
            birthday: dob.toISOString().split("T")[0],
            daysLeft,
            company: companyName,
          };
        });
    });
  }
  const upcomingBirthdays = getUpcomingBirthdays(clientsData || []);
  const formattedClientMemberBirthday = upcomingBirthdays.map((client) => ({
    ...client,
    birthday: dayjs(client.birthday).format("DD-MM-YYYY"),
  }));
  //-----------------------------------------------Client Birthday-----------------------------------------------------------//

  //-----------------------------------------------Conversion of Sector-wise Pie-graph-----------------------------------------------------------//
  //-----------------------------------------------Conversion of India-wise Pie-graph-----------------------------------------------------------//
  function getLocationWiseData(data) {
    const locationMap = {};

    // Step 1: Count companies per hoState
    data.forEach((client) => {
      const state = client.hoState || "Unknown";
      if (!locationMap[state]) {
        locationMap[state] = 0;
      }
      locationMap[state] += 1;
    });

    const processed = [];
    let othersCount = 0;

    // Step 2: Split into main locations and 'Others'
    for (const [location, count] of Object.entries(locationMap)) {
      if (count >= 2) {
        processed.push({ label: location, value: count });
      } else {
        othersCount += count;
      }
    }

    if (othersCount > 0) {
      processed.push({ label: "Others", value: othersCount });
    }

    return processed;
  }

  const locationWiseData = getLocationWiseData(clientsData);

  const locationPieChartOptions = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
    },
    labels: locationWiseData.map((item) => item.label),
    tooltip: {
      y: {
        formatter: (val) => `${val} Companies`, // Show as count
      },
    },
    legend: {
      position: "right",
    },
  };
  //-----------------------------------------------Conversion of India-wise Pie-graph-----------------------------------------------------------//

  //----------------------ACCESS CONFIG------------------//

  //Yearly graph
  const yearlyGraph = salesConfigYearlyGrpah(
    PERMISSIONS.SALES_DEPARTMENT_REVENUES.value,
    "bargraph-sales-dashboard",
    incomeExpenseData,
    incomeExpenseOptions,
    "BIZ Nest SALES DEPARTMENT REVENUES",
    `INR ${inrFormat(totalValue)}`,
    setSelectedFiscalYear
  );

  const allowedGraph = salesFilterPermissions(yearlyGraph, userPermissions);

  //Finance Cards
  const FinanceCardConfig = [
    { key: PERMISSIONS.SALES_REVENUE.value, value: RevenueData },
    { key: PERMISSIONS.SALES_KEY_STATS.value, value: keyStatsData },
    { key: PERMISSIONS.SALES_AVERAGE.value, value: salesAverageData },
  ];

  const allowedFinanceCards = salesFilterPermissions(
    FinanceCardConfig,
    userPermissions
  );

  //Unique Leads Graph
  const graphCountConfig = [
    {
      key: PERMISSIONS.SALES_MONTHLY_UNIQUE_LEADS.value,
      graphTitle: "MONTHLY UNIQUE LEADS",
      data: graphData,
      chartOptions: monthlyLeadsOptions,
      dateKey: "dateOfContact",
      groupKey: "category",
    },
    {
      key: PERMISSIONS.SALES_SOURCING_CHANNELS.value,
      graphTitle: "SOURCING CHANNELS",
      data: graphData,
      chartOptions: monthlyLeadsOptions,
      dateKey: "dateOfContact",
      groupKey: "leadSource",
    },
  ];

  const allowedGraphs = salesFilterPermissions(
    graphCountConfig,
    userPermissions
  );

  const pieChartConfigs = [
    {
      key: PERMISSIONS.SALES_SECTOR_WISE_OCCUPANCY.value,
      title: "Sector-wise Occupancy",
      border: true,
      layout: 1,
      data: sectorPieData,
      options: sectorPieChartOptions,
      height:320,
      width:500,
    },
    {
      key: PERMISSIONS.SALES_CLIENT_WISE_OCCUPANCY.value,
      title: "Client-wise Occupancy",
      border: true,
      layout: 1,
      data: totalDeskPercent,
      options: clientsDesksPieOptions,
      height:320,
      width:500,
    },
  ];
  const allowedPieCharts = salesFilterPermissions(
    pieChartConfigs,
    userPermissions
  );

  const pieChartLocalConfigs = [
    {
      key: PERMISSIONS.SALES_CLIENT_GENDER_WISE_DATA.value,
      title: "Client Member Gender Wise Data",
      border: true,
      layout: 1,
      height:320,
      width:500,
      data: genderWiseData,
      options: genderPieChartOptions,
    },
    {
      key: PERMISSIONS.SALES_INDIA_WISE_MEMBERS.value,
      title: "India-wise Members",
      border: true,
      layout: 1,
      height:320,
      width:500,
      data: locationWiseData,
      options: locationPieChartOptions,
    },
  ];
  const allowedLocalPieCharts = salesFilterPermissions(
    pieChartLocalConfigs,
    userPermissions
  );

  const muiTableConfigs = [
    
    {
      Title: "Client Member Birthday",
      columns: upcomingBirthdaysColumns,
      rows: formattedClientMemberBirthday,
      rowKey: "id",
      rowsToDisplay: 40,
      scroll: true,
      className: "h-full",
      layout: 1,
      padding: true,
      key: PERMISSIONS.SALES_CLIENT_MEMBER_BIRTHDAY.value,
    },
    {
      Title: "Current Month Client Anniversary",
      columns: companyTableColumns,
      rows: formattedCompanyTableData,
      rowKey: "id",
      rowsToDisplay: 40,
      scroll: true,
      className: "h-full",
      layout: 1,
      key: PERMISSIONS.SALES_CURRENT_MONTH_CLIENT_ANNIVERSARY.value,
    },
  ];
  const allowedMuiTableConfigs = salesFilterPermissions(
    muiTableConfigs,
    userPermissions
  );

  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        <>
          {!isTotalLoading ? (
            allowedGraph.map((config) => (
              <YearlyGraph
                key={config.key}
                chartId={config.chartId}
                data={config.data}
                options={config.options}
                title={config.title}
                titleAmount={config.titleAmount}
                onYearChange={config.onYearChange}
              />
            ))
          ) : (
            <div className="h-72 flex items-center justify-center">
              <CircularProgress />
            </div>
          )}
        </>,
      ],
    },
    {
      layout: 3,
      widgets: allowedFinanceCards.map((config) => (
        <FinanceCard titleCenter {...config.value} />
      )),
    },
    // {
    //   layout: 5,
    //   widgets: [
    //     <Card route={"turnover"} title={"Turnover"} icon={<RiPagesLine />} />,
    //     <Card
    //       route={"/app/dashboard/sales-dashboard/finance"}
    //       title={"Finance"}
    //       icon={<SiCashapp />}
    //     />,
    //     <Card
    //       route={"mix-bag"}
    //       title={"Mix Bag"}
    //       icon={<MdFormatListBulleted />}
    //     />,
    //     // <Card route={""} title={"Reports"} icon={<CgProfile />} />,
    //     <Card
    //       route={"/app/dashboard/sales-dashboard/data"}
    //       title={"Data"}
    //       icon={<SiGoogleadsense />}
    //     />,
    //     <Card
    //       route={"/app/dashboard/sales-dashboard/settings"}
    //       title={"Settings"}
    //       icon={<MdMiscellaneousServices />}
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

    ...allowedGraphs.map((config) => ({
      layout: 1,
      widgets: [
        <>
          {isLeadsPending ? (
            <div className="space-y-4">
              <Skeleton variant="rectangular" width="100%" height={40} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </div>
          ) : (
            <FyBarGraphCount
              graphTitle={config.graphTitle}
              data={config.data}
              chartOptions={config.chartOptions}
              dateKey={config.dateKey}
              groupKey={config.groupKey}
            />
          )}
        </>,
      ],
    })),
    {
      layout: 2,
      widgets: allowedPieCharts.map((config) => (
        <WidgetSection
          layout={config.layout}
          title={config.title}
          border={config.border}
        >
          {!isClientsDataPending ? (
            <PieChartMui
              data={config.data}
              options={config.options}
              width={config?.width}
              height={config?.height}
              centerAlign
            />
          ) : (
            <CircularProgress color="#1E3D73" />
          )}
        </WidgetSection>
      )),
    },
    {
      layout: 2,
      widgets: allowedLocalPieCharts.map((config) => (
        <WidgetSection
          key={config.key}
          layout={config.layout}
          title={config.title}
          border={config.border}
        >
            <PieChartMui
            data={config.data}
            options={config.options}
            width={config?.width}
            height={config?.height}
            centerAlign
          />
        </WidgetSection>
      )),
    },
    
    {
      layout: 2,
      widgets: [
        <WidgetSection key="sales-unit-wise-due-tasks" border title="Unit Wise Due Tasks">
          <PieChartMui
            data={unitWisePieData}
            options={unitPieChartOptions}
            width={500}
            height={320}
            centerAlign
          />
        </WidgetSection>,
        <WidgetSection
          key="sales-executive-wise-due-tasks"
          border
          title="Executive Wise Due Tasks"
        >
          <DonutChart
            centerLabel="Tasks"
            labels={executiveTaskLabels}
            colors={executiveTaskColors}
            series={executiveTasksCount}
            tooltipValue={executiveTasksCount}
            tooltipFormatter={(label, value) =>
              `${label}: ${value || 0} pending tasks`
            }
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: allowedMuiTableConfigs.map((config, index) => (
        <WidgetSection layout={config.layout} padding key={index}>
          <MuiTable {...config} />
        </WidgetSection>
      )),
    },
  ];
  return (
    <div>
      <div className="flex flex-col gap-4">
        {meetingsWidgets.map((widget, index) => (
          <LazyDashboardWidget
            key={index}
            layout={widget.layout}
            widgets={widget.widgets}
          />
        ))}
      </div>
    </div>
  );
};

export default SalesDashboard;
