import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CgProfile } from "react-icons/cg";
import { MdFormatListBulleted } from "react-icons/md";
import { RiArchiveDrawerLine, RiPagesLine } from "react-icons/ri";
import Card from "../../components/Card";
import FyBarGraphCount from "../../components/graphs/FyBarGraphCount";
import { PERMISSIONS } from "../../constants/permissions";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

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

  const graphConfigs = [
    {
      key: "monthlyTotalPrintout",
      data: printouts,
      dateKey: "takenAt",
      graphTitle: "MONTHLY TOTAL PRINTOUT",
      permission: PERMISSIONS.PRINTOUT_MONTHLY_TOTAL_PRINTOUT.value,
    },
  ];

  const allowedGraphs = graphConfigs.filter(
    (graph) => !graph.permission || userPermissions.includes(graph.permission),
  );

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      {allowedGraphs.map((graph) => (
        <div key={graph.key} className="w-full flex-none overflow-hidden">
          <FyBarGraphCount
            data={printoutGraphData}
            dateKey="takenAt"
            groupKey="printoutLegend"
            graphTitle={graph.graphTitle}
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
      ))}
      <div
        className={`grid gap-4 ${
          allowedCards.length <= 1
            ? "grid-cols-1"
            : allowedCards.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        } relative z-10 mt-6 flex-none pb-10`}
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
    </div>
  );
};

export default PrintoutDashboard;
