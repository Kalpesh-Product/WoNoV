import React from "react";
import AgTable from "../../../../../components/AgTable";

const KRA = () => {
  const kraColumn = [
    { field: "kra", headerName: "KRAs" ,flex:1},
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
          <span className="text-primary hover:underline text-content cursor-pointer">
              View KRA
            </span>
          </div>
        </>
      ),
    },
  ];

  const rows = [
    {
        id: 1,
        kra: "2025-01-01",
    },
    {
        id: 2,
        kra: "2025-02-01",
    },
    {
        id: 3,
        kra: "2025-03-01",
    },
    {
        id: 4,
        kra: "2025-04-01",
    },
    {
        id: 5,
        kra: "2025-05-01",
    },
];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          buttonTitle={"Add KRA"}
          searchColumn={"kra"}
          tableTitle={"Aiwin's KRA List"}
          data={rows}
          columns={kraColumn}
        />
      </div>
    </div>
  );
};

export default KRA;
