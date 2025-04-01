import React from "react";
import AgTable from "../../../../../components/AgTable";

const KPI = () => {
  const kpiColumn = [
    { field: "kpi", headerName: "KPIs" ,flex:1},
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
          <span className="text-primary hover:underline text-content cursor-pointer">
              View KPI
            </span>
          </div>
        </>
      ),
    },
  ];

  const rows = [
    {
        id: 1,
        kpi: "2025-01-01",
    },
    {
        id: 2,
        kpi: "2025-02-01",
    },
    {
        id: 3,
        kpi: "2025-03-01",
    },
    {
        id: 4,
        kpi: "2025-04-01",
    },
    {
        id: 5,
        kpi: "2025-05-01",
    },
];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          buttonTitle={"Add KPI"}
          searchColumn={"KPIs"}
          tableTitle={"Aiwin's KPI List"}
          data={rows}
          columns={kpiColumn}
        />
      </div>
    </div>
  );
};

export default KPI;
