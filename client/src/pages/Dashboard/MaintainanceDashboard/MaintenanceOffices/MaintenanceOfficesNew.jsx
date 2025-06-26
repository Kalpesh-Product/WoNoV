import React from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import AgTable from "../../../../components/AgTable";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../../../components/Pages/PageFrame";
import WidgetSection from "../../../../components/WidgetSection";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";

const MaintenancOfficesNew = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
    queryKey: ["clientsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/co-working-clients");
        const data = response.data.filter((item) => item.isActive);
        return data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  // Group by Unit Number
  const groupedByUnits = clientsData.reduce((acc, item) => {
    const unitNo = item.unit?.unitNo || "-";

    if (!acc[unitNo]) {
      acc[unitNo] = {
        unitNo,
        unitName: item.unit?.unitName || "-",
        unitId: item.unit?._id,
        clients: [],
        buildingName: item.unit?.building?.buildingName,
      };
    }

    acc[unitNo].clients.push(item);

    return acc;
  }, {});

  const tableData = Object.values(groupedByUnits)
    .sort((a, b) =>
      a.unitNo.localeCompare(b.unitNo, undefined, { numeric: true })
    )
    .map((group, index) => ({
      srNo: index + 1,
      unitId: group.unitId,
      unitNo: group.unitNo,
      unitName: group.unitName,
      buildingName: group.buildingName,
      clientsCount: group.clients.length,
      rawClients: group.clients,
    }));

  const columns = [
    { headerName: "SR NO", field: "srNo", width: 100 },
    {
      headerName: "Unit No",
      field: "unitNo",
      flex: 1,
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() => {
            navigate(
              `/app/dashboard/maintenance-dashboard/maintenance-offices/${params.value}`,
              { state: { unitId: params.data.unitId, unitName: params.value } }
            );
          }}
          className="text-primary underline cursor-pointer">
          {params.value}
        </span>
      ),
    },
    { headerName: "Building", field: "buildingName", flex: 1 },
    { headerName: "Clients Count", field: "clientsCount" },
  ];

  // Step 1: Prepare chartData
  const chartData = tableData.map((unit) => ({
    unitNo: unit.unitNo,
    occupied: unit.clientsCount,
  }));

  const maxY = Math.max(...chartData.map((item) => item.occupied), 5);
  const roundedMax = Math.ceil(maxY / 5) * 5;

  const inrFormat = (val) => val.toLocaleString("en-IN");

  const barGraphSeries = [
    {
      name: "Clients",
      data: chartData.map((item) => item.occupied),
    },
  ];
  const totalOffices = chartData.reduce((sum, item) => item.occupied + sum, 0);

  const expenseOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      stacked: false,
      fontFamily: "Poppins-Regular, Arial, sans-serif",
    },
    colors: ["#54C4A7"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "30%",
        borderRadius: 5,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => inrFormat(val),
      style: { fontSize: "12px", colors: ["#000"] },
      offsetY: -22,
    },
    yaxis: {
      max: roundedMax,
      title: { text: "Client Count" },
    },
    xaxis: {
      categories: chartData.map((item) => item.unitNo),
    },
    fill: {
      opacity: 1,
    },
    legend: {
      show: true,
      position: "top",
    },
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <WidgetSection
        layout={1}
        border
        padding
        title={"maintenance offices"}
        TitleAmount={`Total clients: ${totalOffices}`}>
        <NormalBarGraph data={barGraphSeries} options={expenseOptions} />
      </WidgetSection>
      <PageFrame>
        <AgTable
          data={tableData}
          columns={columns}
          search
          tableTitle="Maintenance Offices"
        />
      </PageFrame>
    </div>
  );
};

export default MaintenancOfficesNew;
