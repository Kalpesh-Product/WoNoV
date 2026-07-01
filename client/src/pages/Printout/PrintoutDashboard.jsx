import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CgProfile } from "react-icons/cg";
import { MdFormatListBulleted } from "react-icons/md";
import { RiArchiveDrawerLine, RiPagesLine } from "react-icons/ri";
import Card from "../../components/Card";
import DonutChart from "../../components/graphs/DonutChart";
import PieChartMui from "../../components/graphs/PieChartMui";
import FyBarGraphCount from "../../components/graphs/FyBarGraphCount";
import WidgetSection from "../../components/WidgetSection";
import { PERMISSIONS } from "../../constants/permissions";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
const getUnitName = (unit) => unit?.unitNo || unit?.unitName || "—";
const getCompanyName = (company) =>
  company?.clientName || company?.companyName || company?.name || "—";

const getTopPrintoutQuantityData = (items, labelKey) => {
  const sortedItems = [...items].sort((a, b) => b.quantity - a.quantity);

  if (sortedItems.length <= 7) {
    return sortedItems;
  }

  const topClients = sortedItems.slice(0, 6);
  const othersQuantity = sortedItems
    .slice(6)
    .reduce((total, item) => total + item.quantity, 0);

  return [
    ...topClients,
    {
      [labelKey]: "Others",
      quantity: othersQuantity,
    },
  ];
};


const PrintoutDashboard = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  const { data: printouts = [] } = useQuery({
    queryKey: ["printouts"],
    queryFn: async () => {
      const response = await axios.get("/api/printout");
      return response.data?.printouts || [];
    },
  });

  const cardsConfig = [
    {
      title: "Add Printout",
      route: "/app/printouts/add-printout",
      icon: <RiPagesLine />,
      permission: PERMISSIONS.PRINTOUT_ADD_PRINTOUT.value,
    },
    {
      title: "Manage Printout",
      route: "/app/printouts/manage-printout",
      icon: <RiArchiveDrawerLine />,
      permission: PERMISSIONS.PRINTOUT_MANAGE_PRINTOUT.value,
    },
    {
      title: "Report Printout",
      route: "/app/printouts/report-printout",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.PRINTOUT_REPORT_PRINTOUT.value,
    },
  ];

  const allowedCards = cardsConfig.filter(
    (card) => !card.permission || userPermissions.includes(card.permission),
  );

  const printoutGraphData = useMemo(
    () =>
      printouts.flatMap((printout, index) => {
        const quantity = Number(printout?.printoutCount);
        const safeQuantity = Number.isFinite(quantity) && quantity > 0
          ? Math.floor(quantity)
          : 0;

        return Array.from({ length: safeQuantity }, (_, countIndex) => ({
          takenAt: printout?.takenAt,
          printoutLegend: "Quantity",
          id: `${printout?._id || index}-${countIndex}`,
        }));
      }),
    [printouts],
  );
const unitWisePrintoutData = useMemo(() => {
    const unitQuantityMap = new Map();

    printouts.forEach((printout) => {
      const unitName = getUnitName(printout?.unit);
      const quantity = Number(printout?.printoutCount);
      const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;

      unitQuantityMap.set(unitName, (unitQuantityMap.get(unitName) || 0) + safeQuantity);
    });

    return Array.from(unitQuantityMap, ([unit, quantity]) => ({
      unit,
      quantity,
    }));
  }, [printouts]);

  const unitWisePrintoutLabels = unitWisePrintoutData.map((item) => item.unit);
  const unitWisePrintoutSeries = unitWisePrintoutData.map((item) => item.quantity);
  const unitWisePrintoutTooltip = unitWisePrintoutData.map(
    (item) => `Quantity : ${item.quantity.toLocaleString("en-IN")}`,
  );

  const clientWiseQuantityData = useMemo(() => {
    const clientQuantityMap = new Map();

    printouts.forEach((printout) => {
      const clientName = getCompanyName(printout?.client);
      const quantity = Number(printout?.printoutCount);
      const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;

      clientQuantityMap.set(
        clientName,
        (clientQuantityMap.get(clientName) || 0) + safeQuantity,
      );
    });

    const clientQuantities = Array.from(clientQuantityMap, ([client, quantity]) => ({
      client,
      quantity,
    }));

    return getTopPrintoutQuantityData(clientQuantities, "client");
  }, [printouts]);

  const clientWiseQuantityLabels = clientWiseQuantityData.map((item) => item.client);
  const clientWiseQuantityPieData = clientWiseQuantityData.map((item) => ({
    label: item.client,
    value: item.quantity,
  }));
  const clientWiseQuantityPieOptions = {
    labels: clientWiseQuantityLabels,
    legend: {
      position: "bottom",
    },
    tooltip: {
      y: {
        formatter: (val) => `Quantity : ${Number(val).toLocaleString("en-IN")}`,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
    },
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
    },
    colors: [
      "#FFB946",
      "#54C4A7",
      "#6A5ACD",
      "#FF4D4F",
      "#00C49F",
      "#4BC0C0",
      "#9966FF",
    ],
  };

  const canViewMonthlyTotalPrintout = userPermissions.includes(
    PERMISSIONS.PRINTOUT_MONTHLY_TOTAL_PRINTOUT.value,
     );

  const canViewUnitWisePrintout = userPermissions.includes(
    PERMISSIONS.PRINTOUT_UNIT_WISE_PRINTOUT.value,
  );

const canViewClientWiseQuantity = userPermissions.includes(
    PERMISSIONS.PRINTOUT_CLIENT_WISE_QUANTITY.value,
  );

  const printoutQuantityCharts = [
    canViewUnitWisePrintout && {
      key: "unitWisePrintout",
      chartType: "donut",
      title: "Overall Unit wise",
      titleLabel: "Printout",
      labels: unitWisePrintoutLabels,
      colors: ["#54C4A7", "#FFB946", "#FF4D4F", "#6A5ACD"],
      series: unitWisePrintoutSeries,
      tooltipValue: unitWisePrintoutTooltip,
    },
    canViewClientWiseQuantity && {
      key: "clientWiseQuantity",
      chartType: "pie",
      title: "Overall",
      titleLabel: "Client Wise Printout",
      data: clientWiseQuantityPieData,
      options: clientWiseQuantityPieOptions,
    },
  ].filter(Boolean);
  // const graphConfigs = [
  //   {
  //     key: "monthlyTotalPrintout",
  //     data: printouts,
  //     dateKey: "takenAt",
  //     graphTitle: "MONTHLY TOTAL PRINTOUT",
  //     permission: PERMISSIONS.PRINTOUT_MONTHLY_TOTAL_PRINTOUT.value,
  //   },
  // ];

  // const allowedGraphs = graphConfigs.filter(
  //   (graph) => !graph.permission || userPermissions.includes(graph.permission),
  //);

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
       {canViewMonthlyTotalPrintout && (
        <div className="w-full flex-none overflow-hidden">
          <FyBarGraphCount
            data={printoutGraphData}
            dateKey="takenAt"
            groupKey="printoutLegend"
            graphTitle="MONTHLY TOTAL PRINTOUT"
            chartOptions={{
              yaxis: {
                title: { text: "Quantity" },
              },
              tooltip: {
                shared: false,
              },
              colors: ["#2196F3"],
            }}
          />
        </div>
      )}
      <div
        className={`grid gap-4 ${
          allowedCards.length <= 1
            ? "grid-cols-1"
            : allowedCards.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        } relative z-10 mt-4 flex-none pb-2`}
      >
        {allowedCards.map((card) => (
          <Card
            key={card.title}
            title={card.title}
            route={card.route}
            icon={card.icon || <CgProfile />}
          />
        ))}
      </div>
       {printoutQuantityCharts.length > 0 && (
        <div className="w-full flex-none overflow-visible">
          <div
            className={`grid items-stretch gap-4 ${
              printoutQuantityCharts.length <= 1
                ? "grid-cols-1"
                : "grid-cols-1 xl:grid-cols-2"
            }`}
          >
            {printoutQuantityCharts.map((chart) => (
              <WidgetSection
                key={chart.key}
                title={chart.title}
                titleLabel={chart.titleLabel}
                border
              >
                {chart.chartType === "pie" ? (
                  <PieChartMui
                    data={chart.data}
                    options={chart.options}
                    width={500}
                    height={320}
                    centerAlign
                  />
                ) : (
                  <DonutChart
                    centerLabel="Quantity"
                    labels={chart.labels}
                    colors={chart.colors}
                    series={chart.series}
                    tooltipValue={chart.tooltipValue}
                  />
                )}
              </WidgetSection>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintoutDashboard;
