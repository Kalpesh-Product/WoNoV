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
import TreemapGraph from "../../../components/graphs/TreemapGraph";
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

const SalesDashboard = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();

  const monthShortToFull = {
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December",
    Jan: "January",
    Feb: "February",
    Mar: "March",
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
        console.log(response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });
  //-----------------------------------------------API-----------------------------------------------------------//
  //-----------------------------------------------For Data cards-----------------------------------------------------------//
  const totalCoWorkingSeats = unitsData.reduce(
    (sum, item) => sum + (item.openDesks + item.cabinDesks),
    0
  );
  //-----------------------------------------------For Data cards-----------------------------------------------------------//
  //-----------------------------------------------Conversion of leads into graph-----------------------------------------------------------//

  const transformedLeadsData = [];

  if (Array.isArray(leadsData)) {
    const domainMap = {};

    leadsData.forEach((lead) => {
      const domain = lead.serviceCategory?.serviceName;
      if (!domain) return;

      const createdMonth = dayjs(lead.startDate).month(); // 0 = Jan, 11 = Dec

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
        columnWidth: "50%",
        borderRadius: 5,
        dataLabels: {
          position: "center",
        },
      },
    },
    xaxis: {
      categories: financialYearMonths,
      title: { text: "Months" },
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

      const createdMonth = dayjs(item.startDate).month();

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
      toolbar: false
    },
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
    labels: filteredData.map((item) => {
      const label = item?.label || "Unknown";
      return label.length > 10 ? label.slice(0, 15) + "..." : label;
    }),
    tooltip: {
      y: {
        formatter: (val) => `${((val / totalClients) * 100).toFixed(1)}%`, // Show as percentage
      },
    },
    legend: {
      position: "right",
    },
  };

  //-----------------------------------------------Conversion of Sector-wise Pie-graph-----------------------------------------------------------//

  const mockSalesData = [
    {
      month: "April",
      actual: 0,
      projected: 10000,
      adjustedProjected: 0,
      revenueBreakup: [
        {
          client: "Client A",
          revenue: 4500,
          region: "North",
          industry: "Retail",
        },
        {
          client: "Client B",
          revenue: 3500,
          region: "South",
          industry: "Finance",
        },
        {
          client: "Client C",
          revenue: 2000,
          region: "West",
          industry: "Technology",
        },
      ],
    },
    {
      month: "May",
      actual: 0,
      projected: 10000,
      adjustedProjected: 0,
      revenueBreakup: [
        {
          client: "Client D",
          revenue: 5000,
          region: "East",
          industry: "Healthcare",
        },
        {
          client: "Client E",
          revenue: 4000,
          region: "North",
          industry: "Retail",
        },
        {
          client: "Client F",
          revenue: 2100,
          region: "West",
          industry: "Technology",
        },
      ],
    },
    {
      month: "June",
      actual: 0,
      projected: 10000,
      adjustedProjected: 0,
      revenueBreakup: [
        {
          client: "Client G",
          revenue: 3000,
          region: "South",
          industry: "E-commerce",
        },
        {
          client: "Client H",
          revenue: 2500,
          region: "West",
          industry: "Logistics",
        },
        {
          client: "Client I",
          revenue: 2500,
          region: "East",
          industry: "Finance",
        },
      ],
    },
    {
      month: "July",
      actual: 0,
      projected: 10000,
      adjustedProjected: 0,
      revenueBreakup: [
        {
          client: "Client J",
          revenue: 4000,
          region: "North",
          industry: "Retail",
        },
        {
          client: "Client K",
          revenue: 3000,
          region: "South",
          industry: "Technology",
        },
      ],
    },
    {
      month: "August",
      actual: 0,
      projected: 10000,
      adjustedProjected: 0,
      revenueBreakup: [
        {
          client: "Client L",
          revenue: 4500,
          region: "East",
          industry: "Healthcare",
        },
        {
          client: "Client M",
          revenue: 3500,
          region: "West",
          industry: "Real Estate",
        },
        {
          client: "Client N",
          revenue: 1500,
          region: "North",
          industry: "Manufacturing",
        },
      ],
    },
    {
      month: "September",
      actual: 0,
      projected: 10000,
      adjustedProjected: 0,
      revenueBreakup: [
        {
          client: "Client O",
          revenue: 5200,
          region: "South",
          industry: "Automobile",
        },
        {
          client: "Client P",
          revenue: 3000,
          region: "North",
          industry: "Retail",
        },
        {
          client: "Client Q",
          revenue: 2000,
          region: "West",
          industry: "Banking",
        },
      ],
    },
    {
      month: "October",
      actual: 0,
      projected: 10000,
      adjustedProjected: 0,
      revenueBreakup: [
        {
          client: "Client R",
          revenue: 6000,
          region: "East",
          industry: "Technology",
        },
        {
          client: "Client S",
          revenue: 4000,
          region: "North",
          industry: "Logistics",
        },
        {
          client: "Client T",
          revenue: 1500,
          region: "South",
          industry: "Retail",
        },
      ],
    },
    {
      month: "November",
      actual: 0,
      projected: 10000,
      adjustedProjected: 0,
      revenueBreakup: [
        {
          client: "Client U",
          revenue: 5000,
          region: "West",
          industry: "E-commerce",
        },
        {
          client: "Client V",
          revenue: 3500,
          region: "South",
          industry: "Banking",
        },
        {
          client: "Client W",
          revenue: 4000,
          region: "North",
          industry: "Healthcare",
        },
      ],
    },
    {
      month: "December",
      actual: 0,
      projected: 10000,
      adjustedProjected: 0,
      revenueBreakup: [
        {
          client: "Client X",
          revenue: 7000,
          region: "East",
          industry: "Technology",
        },
        {
          client: "Client Y",
          revenue: 4000,
          region: "North",
          industry: "Retail",
        },
        {
          client: "Client Z",
          revenue: 3000,
          region: "West",
          industry: "Logistics",
        },
      ],
    },
    {
      month: "January",
      actual: 0,
      projected: 10000,
      adjustedProjected: 0,
      revenueBreakup: [
        {
          client: "Client AA",
          revenue: 6000,
          region: "South",
          industry: "Manufacturing",
        },
        {
          client: "Client AB",
          revenue: 5000,
          region: "North",
          industry: "Banking",
        },
        {
          client: "Client AC",
          revenue: 2000,
          region: "West",
          industry: "E-commerce",
        },
      ],
    },
    {
      month: "February",
      actual: 0,
      projected: 10000,
      adjustedProjected: 0,
      revenueBreakup: [
        {
          client: "Client AD",
          revenue: 8000,
          region: "East",
          industry: "Technology",
        },
        {
          client: "Client AE",
          revenue: 4000,
          region: "South",
          industry: "Finance",
        },
        {
          client: "Client AF",
          revenue: 3000,
          region: "North",
          industry: "Retail",
        },
      ],
    },
    {
      month: "March",
      actual: 0,
      projected: 10000,
      adjustedProjected: 0,
      revenueBreakup: [
        {
          client: "Client AG",
          revenue: 7000,
          region: "West",
          industry: "Logistics",
        },
        {
          client: "Client AH",
          revenue: 6000,
          region: "North",
          industry: "Healthcare",
        },
        {
          client: "Client AI",
          revenue: 3000,
          region: "South",
          industry: "Automobile",
        },
      ],
    },
  ];
  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection layout={1} border title={"Annual Monthly Revenue"}>
          <ParentRevenue salesData={mockSalesData} falseAccordion />
        </WidgetSection>,
      ],
    },
    {
      layout: 5,
      widgets: [
        <Card route={"turnover"} title={"Turnover"} icon={<RiPagesLine />} />,
        <Card
          route={"/app/dashboard/sales-dashboard/finance"}
          title={"Finance"}
          icon={<MdFormatListBulleted />}
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
    {
      layout: 3,
      widgets: [
        <DataCard
          route={"revenue"}
          title={"Actual"}
          data={`${((totalClientsDesks / totalCoWorkingSeats) * 100).toFixed(1)}%`}
          description={"Occupancy"}
        />,
        <DataCard
          route={"revenue"}
          title={"Total"}
          data={"80L"}
          description={"Revenues"}
        />,
        <DataCard
          route={"clients"}
          title={"Unique"}
          data={clientsData.length || '0'}
          description={"Clients"}
        />,
        <DataCard
          route={"co-working-seats"}
          title={"Total"}
          data={totalCoWorkingSeats}
          description={"Co-working Seats"}
        />,
        <DataCard
          route={"co-working-seats"}
          title={"Booked"}
          data={totalClientsDesks}
          description={"Co-working Seats"}
        />,
        <DataCard
          route={"revenue"}
          title={"Free"}
          data={(totalCoWorkingSeats - totalClientsDesks).toString()}
          description={"Co-working Seats"}
        />,
      ],
    },

    {
      layout: 1,
      widgets: [
        <WidgetSection layout={1} title={"Monthly Unique Leads"} border>
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
        <WidgetSection layout={1} title={"Sourcing Channels"} border>
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
            <CircularProgress color="#1E3D73"/>
          )}
        </WidgetSection>,
        <WidgetSection layout={1} title={"Client-wise Occupancy"} border>
          {!isClientsDataPending ? (

            <TreemapGraph data={totalDeskPercent} options={clientsDesksPieOptions} width={"100%"} />

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
            rows={upcomingBirthdays}
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
