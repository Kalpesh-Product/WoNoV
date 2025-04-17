import React, { useState } from "react";
import AgTable from "../../../../../components/AgTable";
import MuiModal from "../../../../../components/MuiModal";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { inrFormat } from "../../../../../utils/currencyFormat"
import DetalisFormatted from "../../../../../components/DetalisFormatted";

const Payslip = () => {
  const name = localStorage.getItem("employeeName") || "Employee";

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewPayslip, setViewPayslip] = useState(null);

  const rows = [
    { id: 1, payslips: "Dec-24", netPay: "70000", deductions: "5000", issuedBy: "HR Dept" },
    { id: 2, payslips: "Nov-24", netPay: "70000", deductions: "4500", issuedBy: "HR Dept" },
    { id: 3, payslips: "Oct-24", netPay: "68000", deductions: "6000", issuedBy: "HR Dept" },
    { id: 4, payslips: "Sep-24", netPay: "69000", deductions: "5500", issuedBy: "HR Dept" },
    { id: 5, payslips: "Aug-24", netPay: "70000", deductions: "5000", issuedBy: "HR Dept" },
    { id: 6, payslips: "Jul-24", netPay: "69000", deductions: "5200", issuedBy: "HR Dept" },
    { id: 7, payslips: "Jun-24", netPay: "68000", deductions: "4800", issuedBy: "HR Dept" },
  ];


  const handleViewPayslip = (rowData) => {
    setViewPayslip(rowData);
    setViewModalOpen(true);
  };

  const payslipColumns = [
    {
      headerName: "Sr No",
      field: "serialNo",
      valueGetter: (params) => params.node.rowIndex + 1,
      maxWidth: 100,
    },
    {
      field: "payslips",
      headerName: "Payslip",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => handleViewPayslip(params.data)}
          >
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <AgTable
        key={rows.length}
        search={true}
        searchColumn={"payslips"}
        tableTitle={`${name}'s Payslip List`}
        data={rows}
        columns={payslipColumns}
      />

      {/* Modal for viewing Payslip */}
      <MuiModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Payslip Detail"
      >
        {viewPayslip && (
          <>
            <DetalisFormatted title="Month" detail={viewPayslip.payslips} />
            <DetalisFormatted title="Net Pay" detail={`INR ${inrFormat(viewPayslip.netPay) || "N/A"}`} />
            <DetalisFormatted title="Deductions" detail={`INR ${inrFormat(viewPayslip.deductions) || "N/A"}`} />
            <DetalisFormatted title="Issued By" detail={viewPayslip.issuedBy || "N/A"} />
          </>
        )}

      </MuiModal>
    </div>
  );
};

export default Payslip;
