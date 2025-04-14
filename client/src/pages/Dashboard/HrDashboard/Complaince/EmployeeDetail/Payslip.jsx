import React, { useState } from "react";
import AgTable from "../../../../../components/AgTable";
import MuiModal from "../../../../../components/MuiModal";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { inrFormat } from "../../../../../utils/currencyFormat"

const Payslip = () => {
  const name = localStorage.getItem("employeeName") || "Employee";

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewPayslip, setViewPayslip] = useState(null);

  const rows = [
    { id: 1, payslips: "Dec, 2024", netPay: "70000", deductions: "5000", issuedBy: "HR Dept" },
    { id: 2, payslips: "Nov, 2024", netPay: "70000", deductions: "4500", issuedBy: "HR Dept" },
    { id: 3, payslips: "Oct, 2024", netPay: "68000", deductions: "6000", issuedBy: "HR Dept" },
  ];

  const handleViewPayslip = (rowData) => {
    setViewPayslip(rowData);
    setViewModalOpen(true);
  };

  const payslipColumns = [
    {
      headerName: "S. No",
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
          <div className="space-y-3 text-sm">
            <div><strong>Month:</strong>&nbsp; {viewPayslip.payslips}</div>
            <div><strong>Net Pay:</strong>&nbsp; INR&nbsp;{inrFormat(viewPayslip.netPay) || "N/A"}</div>
            <div><strong>Deductions:</strong>&nbsp; INR&nbsp;{inrFormat(viewPayslip.deductions) || "N/A"}</div>
            <div><strong>Issued By:</strong>&nbsp; {viewPayslip.issuedBy || "N/A"}</div>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default Payslip;
