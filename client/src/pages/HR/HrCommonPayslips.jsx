import React from "react";
import AgTable from "../../components/AgTable";

const HrCommonPayslips = () => {
  const payslipColumns = [
    { field: "payslips", headerName: "Payslip" ,flex:1},
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
          <span className="text-primary hover:underline text-content cursor-pointer">
              View Payslip
            </span>
          </div>
        </>
      ),
    },
  ];

  const rows = [
    {
        id: 1,
        payslips: "Dec, 2024",
    },
    {
        id: 2,
        payslips: "Nov, 2024",
    },
    {
        id: 3,
        payslips: "Oct, 2024",
    },
];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
        key={rows.length}
          search={true}
          tableHeight={300}
          searchColumn={"payslips"}
          tableTitle={"Payslips"}
          data={rows}
          columns={payslipColumns}
        />
      </div>
    </div>
  );
};

export default HrCommonPayslips;
