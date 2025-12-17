import Card from "../../../components/Card";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LayerBarGraph from "../../../components/graphs/LayerBarGraph";
import WidgetSection from "../../../components/WidgetSection";
import { MdRebaseEdit } from "react-icons/md";
import { LuHardDriveUpload } from "react-icons/lu";
import { CgWebsite } from "react-icons/cg";
import DataCard from "../../../components/DataCard";
import { SiCashapp } from "react-icons/si";
import { SiGoogleadsense } from "react-icons/si";
import { MdMiscellaneousServices } from "react-icons/md";
import BarGraph from "../../../components/graphs/BarGraph";
import PieChartMui from "../../../components/graphs/PieChartMui";
import LineGraph from "../../../components/graphs/LineGraph";
import BudgetGraph from "../../../components/graphs/BudgetGraph";
import { inrFormat } from "../../../utils/currencyFormat";
import { useSidebar } from "../../../context/SideBarContext";
import { transformBudgetData } from "../../../utils/transformBudgetData";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import { Box, Skeleton } from "@mui/material";
import dayjs from "dayjs";
import { filterPermissions } from "../../../utils/accessConfig";
import useAuth from "../../../hooks/useAuth";
import { PERMISSIONS } from "../../../constants/permissions";

const FrontendDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();
  const [isReady, setIsReady] = useState(false);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("FY 2024-25");
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  //--------------------Frontend budget-graph-----------------------//
  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
    queryKey: ["frontendBudget"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=6798ba9de469e809084e2494`
        );
        const budgets = response.data.allBudgets;
        return Array.isArray(budgets) ? budgets : [];
      } catch (error) {
        console.error("Error fetching budget:", error);
        return [];
      }
    },
  });

  const budgetBar = useMemo(() => {
    if (isHrLoading || !Array.isArray(hrFinance)) return null;
    return transformBudgetData(isHrLoading ? [] : hrFinance);
  }, [isHrLoading, hrFinance]);

  useEffect(() => {
    if (!isHrLoading) {
      const timer = setTimeout(() => setIsReady(true), 1000);
      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [isHrLoading]);

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
      max: 50000,
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
  //--------------------Frontend budget-graph-----------------------//

  const utilisedData = [
    125000, 150000, 99000, 85000, 70000, 50000, 80000, 95000, 100000, 65000,
    50000, 120000,
  ];

  const maxBudget = [
    100000, 120000, 100000, 100000, 80000, 60000, 85000, 95000, 100000, 70000,
    60000, 110000,
  ];

  const siteVisitorsData = [
    {
      name: "Site Visitors",
      data: [
        1200, 1000, 900, 1100, 1300, 800, 950, 1050, 1150, 1250, 1350, 1400,
      ], // Monthly counts
    },
  ];

  // Chart options
  const siteVisitorOptions = {
    chart: {
      fontFamily: "Poppins-Regular",
      id: "site-visitors-bar",
      toolbar: { show: false },
    },
    xaxis: {
      categories: [
        "Apr-24",
        "May-24",
        "Jun-24",
        "Jul-24",
        "Aug-24",
        "Sep-24",
        "Oct-24",
        "Nov-24",
        "Dec-24",
        "Jan-25",
        "Feb-25",
        "Mar-25",
      ], // Financial year months
      title: {
        text: undefined, // 👈 empty string works too
      },
    },
    yaxis: {
      title: {
        text: "Visitors Count",
      },
      min: 0,
      max: 1700,
      tickAmount: 5, // 0, 20, 40, ... 140
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: "35%",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true, // Disable data labels for a cleaner look
      style: {
        fontSize: "12px",
        colors: ["#000"], // Set label color
      },
      offsetY: -22, // Adjust position slightly above the bars
    },
    tooltip: {
      theme: "light",
    },
  };

  const nationWiseData = [
    { id: 0, value: 30, actualCount: 300, label: "Mumbai", color: "#00274D" }, // Deep Navy Blue
    { id: 1, value: 20, actualCount: 200, label: "Delhi", color: "#003F7F" }, // Dark Blue
    {
      id: 2,
      value: 15,
      actualCount: 150,
      label: "Bangalore",
      color: "#0056B3",
    }, // Royal Blue
    {
      id: 3,
      value: 10,
      actualCount: 100,
      label: "Hyderabad",
      color: "#0073E6",
    }, // Bright Blue
    { id: 4, value: 8, actualCount: 80, label: "Chennai", color: "#338FFF" }, // Sky Blue
    { id: 5, value: 7, actualCount: 70, label: "Kolkata", color: "#6699FF" }, // Light Blue
    { id: 6, value: 5, actualCount: 50, label: "Pune", color: "#99B3FF" }, // Soft Blue
    { id: 7, value: 5, actualCount: 50, label: "Ahmedabad", color: "#CCD9FF" }, // Very Light Blue
  ];

  // Updated Pie Chart Configuration
  const nationWisePieChart = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
    },
    labels: nationWiseData.map((item) => item.label),
    colors: nationWiseData.map((item) => item.color), // Apply new shades of blue
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${val.toFixed(0)}%`; // Display percentage
      },
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex }) {
        const item = nationWiseData[seriesIndex];
        return `
          <div style="padding: 5px; font-size: 12px;">
            ${item.label}: ${item.actualCount} visitors
          </div>`;
      },
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
    },
  };

  //Line Graph data

  const totalIssues = [5, 7, 6, 6, 5, 5, 5, 8, 6, 4, 6, 7];
  const resolvedIssues = [4, 7, 5, 6, 4, 4, 5, 7, 6, 4, 5, 7];

  // Calculate percentage of resolved issues
  const resolvedPercentage = totalIssues.map((total, index) => {
    return ((resolvedIssues[index] / total) * 100).toFixed(2); // Convert to percentage
  });

  const websiteIssuesOptions = {
    chart: {
      id: "website-resolved-issues",
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Poppins-Regular",
    },
    stroke: {
      width: 4,
    },
    markers: {
      size: 6,
      colors: ["#0056B3"],
      strokeColors: "#fff",
      strokeWidth: 2,
    },
    xaxis: {
      categories: [
        "Apr-24",
        "May-24",
        "Jun-24",
        "Jul-24",
        "Aug-24",
        "Sep-24",
        "Oct-24",
        "Nov-24",
        "Dec-24",
        "Jan-25",
        "Feb-25",
        "Mar-25",
      ],
    },
    yaxis: {
      title: {
        text: "Resolved Percentage (%)",
      },
      labels: {
        formatter: (value) => `${value}%`,
      },
      min: 0,
      max: 100,
      tickAmount: 5, // 0, 20, 40, 60, 80, 100
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        return `<div style="padding: 8px; font-size: 12px;">
          <strong>Resolved Percentage:</strong> ${resolvedPercentage[dataPointIndex]}%<br />
          <strong>Total Issues:</strong> ${totalIssues[dataPointIndex]}<br />
          <strong>Resolved Issues:</strong> ${resolvedIssues[dataPointIndex]}
        </div>`;
      },
    },
    legend: {
      show: true, // No need for legend since only one line is displayed
    },
  };

  const websiteIssuesData = [
    {
      name: "Resolved Percentage",
      data: resolvedPercentage,
      color: "#0056B3",
    },
  ];

  const goaDistrictData = [
    { id: 0, value: 40, actualCount: 400, label: "Panaji", color: "#00274D" }, // Deep Navy Blue
    { id: 1, value: 25, actualCount: 250, label: "Margao", color: "#003F7F" }, // Dark Blue
    { id: 2, value: 15, actualCount: 150, label: "Mapusa", color: "#0056B3" }, // Royal Blue
    { id: 3, value: 10, actualCount: 100, label: "Pernem", color: "#0073E6" }, // Bright Blue
    { id: 4, value: 10, actualCount: 100, label: "Vasco", color: "#338FFF" }, // Sky Blue
  ];

  // Updated Pie Chart Configuration for Goa Districts
  const goaDistrictPieChart = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
    },
    labels: goaDistrictData.map((item) => item.label),
    colors: goaDistrictData.map((item) => item.color),
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${val.toFixed(0)}%`; // Display percentage
      },
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex }) {
        const item = goaDistrictData[seriesIndex];
        return `
          <div style="padding: 5px; font-size: 12px;">
            ${item.label}: ${item.actualCount} visitors
          </div>`;
      },
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
    },
  };

  const totalUtilised =
    budgetBar?.[selectedFiscalYear]?.utilisedBudget?.reduce(
      (acc, val) => acc + val,
      0
    ) || 0;

  //---------------ACCESS-------------//

  const techSalesGraphConfig = [
    {
      key: PERMISSIONS.FRONTEND_SITE_VISITORS.value,
      layout: 1,
      border: true,
      title: "Site Visitors",
      titleLabel: "FY 2024-25",
      data: [],
      options: siteVisitorOptions,
    },
  ];

  const allowedSalesGraph = filterPermissions(
    techSalesGraphConfig,
    userPermissions
  );

  const cardsConfigFrontend = [
    {
    key: PERMISSIONS.FRONTEND_CREATE_WEBSITE.value,
    route: "create-website",
    title: "Create Website",
    icon: <LuHardDriveUpload />,
  },
  {
    key: PERMISSIONS.FRONTEND_EDIT_WEBSITE.value,
    route: "websites",
    title: "Edit website",
    icon: <LuHardDriveUpload />,
  },
  {
    key: PERMISSIONS.FRONTEND_NEW_THEMES.value,
    route: "select-theme",
    title: "New Themes",
    icon: <CgWebsite />,
  },
  {
    key: PERMISSIONS.FRONTEND_FINANCE.value,
    route: "finance",
    title: "Finance",
    icon: <SiCashapp />,
  },
  {
    key: PERMISSIONS.FRONTEND_DATA.value,
    route: "data",
    title: "Data",
    icon: <SiGoogleadsense />,
  },
  {
    key: PERMISSIONS.FRONTEND_SETTINGS.value,
    route: "settings",
    title: "Settings",
    icon: <MdMiscellaneousServices />,
  },
];

  const allowedCards = filterPermissions(
    cardsConfigFrontend,
    userPermissions
  );

  const techExpenseGraphConfig = [
    {
      key: PERMISSIONS.FRONTEND_DEPARTMENT_EXPENSE.value,
      title: "BIZ Nest TECH DEPARTMENT EXPENSE",
      data: expenseRawSeries,
      options: expenseOptions,
      onYearChange: setSelectedFiscalYear,
      titleAmount: `INR ${Math.round(totalUtilised).toLocaleString("en-IN")}`,
    },
  ];

  const allowedExpenseGraph = filterPermissions(
    techExpenseGraphConfig,
    userPermissions
  );
  const techIssuesGraphConfig = [
    {
      key: PERMISSIONS.FRONTEND_WEBSITE_ISSUES_RAISED.value,
      layout: 1,
      border: true,
      title: "Website Issues Raised",
      data: [],
      options: websiteIssuesOptions,
    },
  ];

  const allowedIssuesGraph = filterPermissions(
    techIssuesGraphConfig,
    userPermissions
  );

  const pieChartConfig = [
  {
    key: PERMISSIONS.FRONTEND_NATION_WISE_SITE_VISITORS.value,
    layout: 1,
    border: true,
    title: "Nation-wise site Visitors",
    percent: true,
    data: [],
    options: [],
    width: 500,
  },
  {
    key: PERMISSIONS.FRONTEND_STATE_WISE_SITE_VISITORS.value,
    layout: 1,
    border: true,
    title: "State-wise site Visitors",
    percent: true,
    data: [],
    options: [],
    width: 500,
  },
];


  const allowedPieCharts = filterPermissions(
    pieChartConfig,
    userPermissions
  );

  const techWidgets = [
    {
      layout: allowedSalesGraph.length,
      widgets: allowedSalesGraph.map((config) => (
        <WidgetSection
          layout={1}
          border
          title={config.title}
          titleLabel={config.titleLabel}
        >
          <BarGraph data={config.data} options={config.options} />
        </WidgetSection>
      )),
    },
    {
      layout: allowedCards.length,
      widgets: allowedCards.map((config)=>  <Card
          icon={config.icon}
          title={config.title}
          route={config.route}
        />)
    },
    {
      layout: allowedPieCharts.length,
      widgets: allowedPieCharts.map((config)=>
       <WidgetSection layout={1} border title={config.title}>
          <PieChartMui
            percent={config.percent} // Enable percentage display
            data={config.data} // Pass processed data
            options={config.options}
            width={config.width}
          />
        </WidgetSection>)
    },
    {
      layout: allowedExpenseGraph.length,
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
          {
            allowedExpenseGraph.map((config)=>
            <YearlyGraph
            data={config.data}
            options={config.options}
            title={config.title}
            onYearChange={config.onYearChange}
            titleAmount={config.titleAmount}
          />)
          }
        </Suspense>,
      ],
    },

    {
      layout: allowedIssuesGraph.length,
      widgets: allowedIssuesGraph.map((config)=>
       <WidgetSection layout={config.layout} title={config.title} border>
          <LineGraph options={config.options} data={config.data} />
        </WidgetSection>,
        ),
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

export default FrontendDashboard;
