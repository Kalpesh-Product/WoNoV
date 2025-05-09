import React, { useEffect } from "react";
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
  clientGenderData,
  clientGenderPieChartOptions,
  locationPieChartData,
  locationPieChartOptions,
  companyTableColumns,
  formattedCompanyTableData,
  upcomingBirthdaysColumns,
  upcomingBirthdays,
} from "./SalesData/SalesData";
import { useNavigate } from "react-router-dom";
import ParentRevenue from "./ParentRevenue";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setClientData, setLeadsData } from "../../../redux/slices/salesSlice";
import { CircularProgress, Skeleton } from "@mui/material";
import { SiCashapp } from "react-icons/si";
import { useSidebar } from "../../../context/SideBarContext";
import FinanceCard from "../../../components/FinanceCard";

const SalesDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();

  //-----------------------------------------------------Graph------------------------------------------------------//
  const incomeExpenseData = [
    {
      name: "FY 2024-25",
      data: [
        1123500, // Nov
        1184200, // Oct
        1347800, // Sep
        1436500, // Mar
        1489300, // Jun
        1532100, // Dec
        1598700, // Jan
        1642900, // May
        1695000, // Feb
        1746800, // Jul
        1791200, // Aug
        1823400, // Apr
      ],
    },
  ];
  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      toolbar: { show: false },
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
      max: 2000000,
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
  const { data: leadsData, isPending: isLeadsPending } = useQuery({
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
  const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
    queryKey: ["clientsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/co-working-clients");
        dispatch(setClientData(response.data));
        return response.data;
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

  const RevenueData = {
    cardTitle: "REVENUE",
    descriptionData: [
      {
        title: "FY 2024-25",
        value: "INR 2,09,00,000",
      },
      {
        title: "March 2025",
        value: "INR 18,23,400",
      },
      {
        title: "Total Desks",
        value: "589",
      },
      { title: "Active Sq Ft", value: "60,000" },
      { title: "Per Sq. Ft.", value: "348" },
    ],
  };
  const keyStatsData = {
    cardTitle: "KEY STATS",
    descriptionData: [
      {
        title: "Active Desks",
        value: 589,
      },
      {
        title: "Occupied Desks",
        value: 582,
      },
      {
        title: "Occupancy %",
        value: "98",
      },
      { title: "Free Desks", value: "7" },
      { title: "Unique Clients", value: "46" },
    ],
  };
  const salesAverageData = {
    cardTitle: "AVERAGE",
    descriptionData: [
      {
        title: "Revenue",
        value: "INR 17,41,666",
      },
      {
        title: "Occupied Desks",
        value: 553,
      },
      {
        title: "Occupancy %",
        value: "93",
      },
      { title: "Clients", value: "45" },
      { title: "Provisioned Desks", value: "140" },
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

      const createdMonth = `${dayjs(lead.startDate).month()}`; // 0 = Jan, 11 = Dec

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

  const monthlyLeadsData = transformedLeadsData.map((domain) => ({
    name: domain.domain,
    data: reorderToFinancialYear(domain.leads),
  }));

  const monthlyLeadsOptions = {
    chart: {
      type: "bar",
      toolbar: false,
      stacked: true,
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const selectedMonthAbbr = financialYearMonths[config.dataPointIndex];
          const selectedMonthFull = monthShortToFull[selectedMonthAbbr];
          navigate(
            `unique-leads?month=${encodeURIComponent(selectedMonthFull)}`
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
    xaxis: {
      categories: financialYearMonths,
      title: { text: "" },
    },
    yaxis: {
      title: { text: "Lead Count" },
      tickAmount: 10,
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
      const label = item?.companyName || "Unknown";
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
        formatter: (val) => val,
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
        formatter: (val) => `${((val / totalClients) * 100).toFixed(1)}%`, // Show as percentage
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
      position: "right",
    },
  };

  //-----------------------------------------------Conversion of Sector-wise Pie-graph-----------------------------------------------------------//
  const clientMemberBirthday = [
    {
      id: "1",
      name: "Aarav Sharma",
      birthday: "1990-04-20",
      daysLeft: 6,
      company: "Zomato",
    },
    {
      id: "2",
      name: "Priya Mehta",
      birthday: "1988-05-02",
      daysLeft: 18,
      company: "Turtlemint",
    },
    {
      id: "3",
      name: "Rohan Verma",
      birthday: "1992-04-14",
      daysLeft: 0,
      company: "Infuse",
    },
    {
      id: "4",
      name: "Sneha Kapoor",
      birthday: "1995-04-25",
      daysLeft: 11,
      company: "Zimetrics",
    },
    {
      id: "5",
      name: "Vikram Joshi",
      birthday: "1991-06-01",
      daysLeft: 48,
      company: "LanceSoft",
    },
    {
      id: "6",
      name: "Tanvi Nair",
      birthday: "1993-04-18",
      daysLeft: 4,
      company: "91HR",
    },
    {
      id: "7",
      name: "Kunal Desai",
      birthday: "1990-05-10",
      daysLeft: 26,
      company: "Zimetrics",
    },
    {
      id: "8",
      name: "Meera Iyer",
      birthday: "1989-04-30",
      daysLeft: 16,
      company: "Turtlemint",
    },
  ];

  const formattedClientMemberBirthday = clientMemberBirthday.map((client) => ({
    ...client,
    birthday: dayjs(client.birthday).format("DD-MM-YYYY"),
  }));

  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection
          border
          normalCase
          title={"BIZ Nest SALES DEPARTMENT REVENUES FY 2024-25"}
          TitleAmount={`INR ${inrFormat("20900000")}`}
        >
          <BarGraph data={incomeExpenseData} options={incomeExpenseOptions} departments={["FY 2024-25", "FY 2025-26"]} />
        </WidgetSection>,
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
    {
      layout: 5,
      widgets: [
        <Card route={"turnover"} title={"Turnover"} icon={<RiPagesLine />} />,
        <Card
          route={"/app/dashboard/sales-dashboard/finance"}
          title={"Finance"}
          icon={<SiCashapp />}
        />,
        <Card
          route={"mix-bag"}
          title={"Mix Bag"}
          icon={<MdFormatListBulleted />}
        />,
        <Card route={""} title={"Reports"} icon={<CgProfile />} />,
        <Card
          route={"/app/dashboard/sales-dashboard/settings"}
          title={"Settings"}
          icon={<MdMiscellaneousServices />}
        />,
      ],
    },

    // {
    //   layout: 3,
    //   widgets: [
    //     <DataCard
    //       route={"co-working-seats"}
    //       title={"Actual"}
    //       data={`${((totalClientsDesks / totalCoWorkingSeats) * 100).toFixed(
    //         0
    //       )}%`}
    //       // data={"96.32%"}
    //       description={"Occupancy"}
    //     />,
    //     <DataCard
    //       route={"revenue"}
    //       title={"Total"}
    //       data={"INR " + inrFormat("43050000")}
    //       description={"Revenues"}
    //     />,
    //     <DataCard
    //       route={"clients"}
    //       title={"Unique"}
    //       data={clientsData.length || "0"}
    //       description={"Clients"}
    //     />,
    //     <DataCard
    //       route={"co-working-seats"}
    //       title={"Total"}
    //       data={totalCoWorkingSeats}
    //       // data={totalClientsDesks}
    //       description={"Co-working Seats"}
    //     />,
    //     <DataCard
    //       route={"co-working-seats"}
    //       title={"Booked"}
    //       data={totalClientsDesks}
    //       // data={totalCoWorkingSeats}
    //       description={"Co-working Seats"}
    //     />,
    //     <DataCard
    //       route={"co-working-seats"}
    //       title={"Free"}
    //       data={totalCoWorkingSeats - totalClientsDesks}
    //       description={"Co-working Seats"}
    //     />,
    //   ],
    // },

    {
      layout: 1,
      widgets: [
        <WidgetSection
          layout={1}
          title={"Monthly Unique Leads"}
          titleLabel={"FY 2024-25"}
          border
        >
          {isLeadsPending ? (
            <div className="space-y-4">
              <Skeleton variant="rectangular" width="100%" height={40} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </div>
          ) : (
            <BarGraph
              height={400}
              data={monthlyLeadsData}
              options={monthlyLeadsOptions}
            />
          )}
        </WidgetSection>,
      ],
    },
    {
      layout: 1,
      widgets: [
        <WidgetSection
          layout={1}
          title={"Sourcing Channels"}
          titleLabel={"FY 2024-25"}
          border
        >
          {isLeadsPending ? (
            <div className="space-y-4">
              <Skeleton variant="rectangular" width="100%" height={40} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </div>
          ) : (
            <BarGraph
              height={400}
              data={monthlySourceData}
              options={sourcingChannelsOptions}
            />
          )}
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection layout={1} title={"Sector-wise Occupancy"} border>
          {!isClientsDataPending ? (
            <PieChartMui
              data={sectorPieData}
              options={sectorPieChartOptions}
              width={"100%"}
            />
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
        <WidgetSection layout={1} title={"Gender-wise data"} border>
          <PieChartMui
            data={clientGenderData}
            width={"100%"}
            options={clientGenderPieChartOptions}
          />
        </WidgetSection>,
        <WidgetSection layout={1} title={"India-wise Members"} border>
          <PieChartMui
            data={locationPieChartData}
            options={locationPieChartOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection layout={1} padding>
          <MuiTable
            Title="Client Anniversary"
            columns={companyTableColumns}
            rows={formattedCompanyTableData}
            rowKey="id"
            rowsToDisplay={10}
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

export default SalesDashboard;
