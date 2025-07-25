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

const SalesDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("FY 2024-25");

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();

  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

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
  //------------------------PAGE ACCESS END-------------------//

  //-----------------------------------------------------Graph------------------------------------------------------//
  function aggregateMonthlyRevenue(data, year = "2024-25") {
    const monthsInYear = 12;
    const result = new Array(monthsInYear).fill(0);

    data?.forEach((item) => {
      const revenueArray = item.data[year];
      if (revenueArray) {
        for (let i = 0; i < monthsInYear; i++) {
          result[i] += revenueArray[i] || 0;
        }
      }
    });

    return result;
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

  const finalRevenueGraph = aggregateMonthlyRevenue(totalRevenue);

  const incomeExpenseData = [
    {
      name: "Expense",
      group: "FY 2024-25",
      data: finalRevenueGraph,
    },
  ];

  const selectedSeries = incomeExpenseData.find(
    (item) => item.group === selectedFiscalYear
  );

  const totalValue = useMemo(() => {
    if (!selectedSeries) return 0;
    return selectedSeries.data.reduce((sum, val) => sum + val, 0);
  }, [selectedSeries]);
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
        title:
          selectedFiscalYear === "FY 2024-25" ? "March 2025" : "March 2026",
        value: `INR ${
          selectedFiscalYear === "FY 2024-25"
            ? inrFormat(finalRevenueGraph[11])
            : 0
        }`,
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
    let otherTotalDesks = 0;

    simplifiedClientsPie = clientsData.reduce((acc, item) => {
      const { clientName: companyName, totalDesks } = item;

      if (totalDesks < 15) {
        otherTotalDesks += totalDesks;
        return acc;
      }

      acc.push({ companyName, totalDesks });
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
    label: `${item.companyName} ${(
      (item.totalDesks / totalClientsDesks) *
      100
    ).toFixed(1)}%`,
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
      horizontalAlign: "center",
      fontSize: "14px",
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
      markers: {
        width: 12,
        height: 12,
      },
      formatter: (seriesName) => {
        return seriesName.length > 20
          ? seriesName.slice(0, 20) + "..."
          : seriesName;
      },
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

  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        <>
          {!isTotalLoading ? (
            <YearlyGraph
              chartId={"bargraph-sales-dashboard"}
              data={incomeExpenseData}
              options={incomeExpenseOptions}
              title={"BIZ Nest SALES DEPARTMENT REVENUES"}
              titleAmount={`INR ${inrFormat(totalValue)}`}
              onYearChange={setSelectedFiscalYear}
            />
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
      widgets: [
        <FinanceCard titleCenter {...RevenueData} />,
        <FinanceCard titleCenter {...keyStatsData} />,
        <FinanceCard titleCenter {...salesAverageData} />,
      ],
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
    {
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
              graphTitle="MONTHLY UNIQUE LEADS"
              data={graphData}
              chartOptions={monthlyLeadsOptions}
              dateKey="dateOfContact"
              groupKey="category"
            />
          )}
        </>,
      ],
    },
    {
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
              graphTitle="SOURCING CHANNELS"
              data={graphData}
              chartOptions={monthlyLeadsOptions}
              dateKey="dateOfContact"
              groupKey="leadSource"
            />
          )}
        </>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection layout={1} title={"Sector-wise Occupancy"} border>
          {!isClientsDataPending ? (
            <PieChartMui data={sectorPieData} options={sectorPieChartOptions} />
          ) : (
            <CircularProgress color="#1E3D73" />
          )}
        </WidgetSection>,
        <WidgetSection layout={1} title={"Client-wise Occupancy"} border>
          {!isClientsDataPending ? (
            <PieChartMui
              data={totalDeskPercent}
              options={clientsDesksPieOptions}
              width={"100%"}
            />
          ) : (
            <CircularProgress color="#1E3D73" />
          )}
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection layout={1} title={"Client Gender Wise Data"} border>
          <div className="h-[300px]">
            <PieChartMui data={[]} options={[]} />
          </div>
        </WidgetSection>,
        <WidgetSection layout={1} title={"India-wise Members"} border>
          <div className="h-[300px]">
            <PieChartMui
              data={locationWiseData}
              options={locationPieChartOptions}
            />
          </div>
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection layout={1} padding>
          <MuiTable
            Title="Current Month Client Anniversary"
            columns={companyTableColumns}
            rows={formattedCompanyTableData}
            rowKey="id"
            rowsToDisplay={40}
            scroll={true}
            className="h-full"
          />
        </WidgetSection>,
        <WidgetSection layout={1} padding>
          <MuiTable
            Title="Client Member Birthday"
            columns={upcomingBirthdaysColumns}
            rows={formattedClientMemberBirthday}
            rowKey="id"
            rowsToDisplay={40}
            scroll={true}
            className="h-full"
          />
        </WidgetSection>,
      ],
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
