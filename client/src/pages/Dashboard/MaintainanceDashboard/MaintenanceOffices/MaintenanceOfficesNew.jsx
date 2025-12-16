import React from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import PageFrame from "../../../../components/Pages/PageFrame";
import WidgetSection from "../../../../components/WidgetSection";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import { useNavigate } from "react-router-dom";

const MaintenanceOfficesNew = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate()
  const { data: unitsData = [], isPending: isUnitsLoading } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-simple-units");
      return response.data || [];
    },
  });

  const inrFormat = (val) => val.toLocaleString("en-IN");

  // Prepare table and chart data
  const tableData = isUnitsLoading ? [] : unitsData
    .filter((unit) => unit.isActive)
    .map((unit, index) => {
      return {
        ...unit,
        srNo: index + 1,
        unitNo: unit.unitNo || "-",
        unitName: unit.unitName || "-",
        unitId: unit._id,
        buildingName: unit.building?.buildingName || "-",
        sqft: (unit.sqft) || 0,
        clientsCount: unit.coworkingClientsCount || 0,
      };
    });


  const chartData = tableData.map((unit) => ({
    unitNo: unit.unitNo,
    occupied: unit.clientsCount,
  }));

  const maxY = Math.max(...chartData.map((item) => item.occupied), 5);
  const roundedMax = Math.ceil(maxY / 5) * 5;

  const barGraphSeries = [
    {
      name: "Clients",
      data: chartData.map((item) => item.occupied),
    },
  ];

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
      title: { text: "No. of Clients" },
    },
    xaxis: {
      categories: chartData.map((item) => item.unitNo),
    },
    fill: { opacity: 1 },
    legend: {
      show: true,
      position: "top",
    },
  };

  const columns = [
    { headerName: "SR NO", field: "srNo", width: 100 },
    { headerName: "Unit No", field: "unitNo", flex: 1, cellRenderer: (params) => (
        <span
          role="button"
          onClick={() => {
            navigate(
              `/app/dashboard/maintenance-dashboard/maintenance-offices/${params.value}`,
              { state: { unitId: params.data._id, unitName: params.value } }
            );
          }}
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </span>
      ), },
    { headerName: "Building", field: "buildingName", flex: 1 },
    { headerName: "Sqft", field: "sqft", width: 120 },
    {
      headerName: "Clients",
      field: "clientsCount",
      width: 150,
      cellStyle: { textAlign: "center" },
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <WidgetSection
        layout={1}
        border
        padding
        title={"Maintenance Offices"}
        TitleAmount={`TOTAL OFFICES : ${unitsData.length || 0}`} 
      >
        <NormalBarGraph data={barGraphSeries} options={expenseOptions} />
      </WidgetSection>

      <PageFrame>
        <YearWiseTable
          data={tableData}
          columns={columns}
          search
          tableTitle="Maintenance Offices Details"
        />
      </PageFrame>
    </div>
  );
};

export default MaintenanceOfficesNew;
