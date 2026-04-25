import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { Chip } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import PageFrame from "../../../../components/Pages/PageFrame";
import { inrFormat } from "../../../../utils/currencyFormat";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const DepartmentInvoice = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  const [viewModal, setViewModal] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);

  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
    queryKey: ["allBudgets"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/budget/company-budget`);
         const budgets = Array.isArray(response.data.allBudgets)
          ? response.data.allBudgets
          : [];

        return budgets.filter((budget) => {
          const expenseType = String(budget.expanseType || "")
            .trim()
            .toLowerCase();
          return (
            expenseType.includes("reimbursement") ||
            expenseType.includes("voucher")
          );
        });
      } catch (error) {
        console.error("Error fetching budget:", error);
        return [];
      }
    },
  });

  const invoiceCreationColumns = [
    { headerName: "Sr No", field: "srNo", width: 100 },
    { headerName: "Department", field: "department", flex: 1 },
    { headerName: "Invoice Name", field: "invoiceName", flex: 1 },
    { headerName: "GSTIN", field: "gstIn", flex: 1 },
    { headerName: "Invoice Date", field: "invoiceDate", flex: 1 },
    { headerName: "Due Date", field: "dueDate", flex: 1 },

    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <div className="p-2 flex gap-2 items-center">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => {
              setViewDetails(params.data);
              setViewModal(true);
            }}>
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  const mappedRows = (hrFinance || []).map((item, index) => {
    const invoice = item.invoice || {};
    const voucher = item.voucher || {};
    const finance = item.finance || {};
    const unit = item.unit || {};
    const building = unit.building || {};
    const departmentName = item.department?.name || "-";
    const particulars = Array.isArray(item.particulars) ? item.particulars : [];
    const particularDetails = particulars.map((p, idx) => ({
      label: `Particular ${idx + 1}`,
      name: p?.particularName || "-",
      amount: Number(p?.particularAmount || 0),
    }));
    return {
      ...item,

      id: item._id,
      voucherSrNo: item.srNo || "-",
      expanseName: item.expanseName || "-",
      expanseType: item.expanseType || "-",
      department: departmentName,
      unitName: unit.unitName || "-",
      unitNo: unit.unitNo || "-",
      buildingName: building.buildingName || "-",
      particularDetails,
      dueDate: item.dueDate || "-",
      gstIn: item.gstIn || "-",
      status: item.status || "Pending",
      isPaid: item.isPaid || "Unpaid",
      isExtraBudget: Boolean(item.isExtraBudget),
      preApproved: Boolean(item.preApproved),
      emergencyApproval: Boolean(item.emergencyApproval),
      budgetApproval: Boolean(item.budgetApproval),
      l1Approval: Boolean(item.l1Approval),
      invoiceAttached: Boolean(item.invoiceAttached),
      reimbursementDate: item.reimbursementDate || null,

      invoiceName: invoice.name || "-",
      invoiceLink: invoice.link || "-",
      invoiceDate: invoice.date || null,
      voucherName: voucher.name || "-",
      voucherLink: voucher.link || "-",

      finance: {
        fSrNo: finance.fSrNo || "-",
        modeOfPayment: finance.modeOfPayment || "-",
        chequeNo: finance.chequeNo || "-",
        chequeDate: finance.chequeDate || null,
        approvedAt: finance.approvedAt || null,
        expectedDateInvoice: finance.expectedDateInvoice || null,
        advanceAmount: finance.advanceAmount || 0,
        voucher: finance.voucher || null,
        particulars: Array.isArray(finance.particulars)
          ? finance.particulars
          : [],
      },
      unit: unit,
    };
  });


  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        <YearWiseTable
          data={mappedRows}
          dropdownColumns={["department"]}
          columns={invoiceCreationColumns}
          search
          tableTitle="Department-Invoice Voucher"
          dateColumn="dueDate"
          formatDate={true}
          tableHeight={450}
        />
      </PageFrame>

      {viewModal && viewDetails && (
        <MuiModal
          open={viewModal}
          onClose={() => {
            setViewModal(false);
            setViewDetails(null);
          }}
          title="Invoice Details">
          <div className="space-y-3">
            {/* <div className="font-bold">Department-Invoice Voucher Summary</div> */}
             <span className="text-subtitle font-pmedium text-primary my-4 uppercase">
                 Department-Invoice Voucher Summary
                </span>
            <DetalisFormatted
              title="Voucher Sr.No"
              detail={viewDetails.voucherSrNo || "-"}
            />    
            <DetalisFormatted
              title="Expense Name"
              detail={viewDetails.expanseName || "-"}
            />
            <DetalisFormatted
              title="Expense Type"
              detail={viewDetails.expanseType || "-"}
            />
            <DetalisFormatted
              title="Department"
              detail={viewDetails.department || "-"}
            />
            {/* <DetalisFormatted
              title="Particular"
              detail={viewDetails.particularNames || "-"}
            /> */}
             {Array.isArray(viewDetails.particularDetails) &&
            viewDetails.particularDetails.length > 0 ? (
              viewDetails.particularDetails.map((particular, index) => (
                <DetalisFormatted
                  key={`${particular.name}-${index}`}
                  title={particular.label}
                  detail={`${particular.name} — INR ${inrFormat(particular.amount || 0)}`}
                />
              ))
            ) : (
              <DetalisFormatted title="Particular" detail="-" />
            )}
            <DetalisFormatted
              title="Total Amount"
              detail={`INR ${Number(viewDetails.projectedAmount || 0).toLocaleString("en-IN")}`}
            />
            <DetalisFormatted
              title="Unit"
              detail={viewDetails.unitName || "-"}
            />
            <DetalisFormatted
              title="Unit No"
              detail={viewDetails.unitNo || "-"}
            />
            <DetalisFormatted
              title="Building"
              detail={viewDetails.buildingName || "-"}
            />
            <DetalisFormatted
              title="Due Date"
              detail={
                viewDetails.dueDate
                  ? new Date(viewDetails.dueDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"
              }
            />
             <DetalisFormatted title="GSTIN" detail={viewDetails.gstIn || "-"} />
            <DetalisFormatted
              title="Approval Status"
              detail={viewDetails.status || "Pending"}
            />
            <DetalisFormatted
              title="Paid Status"
              detail={viewDetails.isPaid || "Unpaid"}
            />
            <DetalisFormatted
              title="Invoice Name"
              detail={viewDetails.invoiceName || "-"}
            />
             <DetalisFormatted
              title="Extra Budget"
              detail={viewDetails.isExtraBudget ? "Yes" : "No"}
            />
            <DetalisFormatted
              title="Pre-Approved"
              detail={viewDetails.preApproved ? "Yes" : "No"}
            />
            <DetalisFormatted
              title="Emergency Approval"
              detail={viewDetails.emergencyApproval ? "Yes" : "No"}
            />
            <DetalisFormatted
              title="Budget Approval"
              detail={viewDetails.budgetApproval ? "Yes" : "No"}
            />
            <DetalisFormatted
              title="L1 Approval"
              detail={viewDetails.l1Approval ? "Yes" : "No"}
            />
            <DetalisFormatted
              title="Invoice Attached"
              detail={viewDetails.invoiceAttached ? "Yes" : "No"}
            />
            <DetalisFormatted
              title="Voucher Name"
              detail={viewDetails.voucherName || "-"}
            />
            <DetalisFormatted
              title="Voucher Link"
              detail={
                viewDetails.voucherLink !== "-" ? (
                  <a
                    href={viewDetails.voucherLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline">
                    {viewDetails.voucherName || "View Voucher"}
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <DetalisFormatted
              title="Reimbursement Date"
              detail={
                viewDetails.reimbursementDate
                  ? new Date(viewDetails.reimbursementDate).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "-"
              }
            />
            <DetalisFormatted
              title="Invoice Date"
              detail={
                viewDetails.invoiceDate
                  ? new Date(viewDetails.invoiceDate).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "-"
              }
            />
              {/* <DetalisFormatted
                title="Status"
                detail={viewDetails.isPaid || "Unpaid"}
              /> */}
            <DetalisFormatted
              title="Invoice File"
              detail={
                viewDetails.invoiceLink !== "-" ? (
                  <a
                    href={viewDetails.invoiceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline">
                    {viewDetails.invoiceName}
                  </a>
                ) : (
                  "-"
                )
              }
            />

            {/* Finance Details */}
            {viewDetails.finance && (
              <div className="mt-4 flex flex-col gap-4">
                <span className="text-subtitle font-pmedium text-primary my-0.5 uppercase">
                 Voucher History Finance Details
                </span>
                <DetalisFormatted
                  title="Finance Sr No"
                  detail={viewDetails.finance.fSrNo || "-"}
                />
                <DetalisFormatted
                  title="Mode of Payment"
                  detail={viewDetails.finance.modeOfPayment || "-"}
                />                
                <DetalisFormatted
                  title="Cheque No"
                  detail={viewDetails.finance.chequeNo || "-"}
                />
                <DetalisFormatted
                  title="Cheque Date"
                  detail={
                    viewDetails.finance.chequeDate
                      ? new Date(
                          viewDetails.finance.chequeDate
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"
                  }
                />
                <DetalisFormatted
                  title="Approved At"
                  detail={
                    viewDetails.finance.approvedAt
                      ? new Date(
                          viewDetails.finance.approvedAt
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"
                  }
                />
                <DetalisFormatted
                  title="Expected Invoice Date"
                  detail={
                    viewDetails.finance.expectedDateInvoice
                      ? new Date(
                          viewDetails.finance.expectedDateInvoice
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"
                  }
                />
                 {(viewDetails.finance.particulars || []).map((p, idx) => (
                  // <div key={idx} className="border-t pt-2">
                    <DetalisFormatted
                      title={`Particular ${idx + 1}`}
                      detail={`${p.particularName || "-"} — INR ${inrFormat(p.particularAmount || 0)}`}
                    />
                  // </div>
                ))}
                 <DetalisFormatted
                  title="Total Amount"
                  detail={`INR ${(viewDetails.finance.particulars || []).reduce(
                    (sum, item) => sum + Number(item?.particularAmount || 0),
                    0
                  )}`}
                />
                <DetalisFormatted
                  title="Advance Amount"
                  detail={`INR ${inrFormat(viewDetails.finance.advanceAmount || 0)}`}
                />
                <DetalisFormatted
                  title="Voucher File"
                  detail={
                    viewDetails.finance.voucher?.link ? (
                      <a
                        href={viewDetails.finance.voucher.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline">
                        {viewDetails.finance.voucher.name}
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
                {/* {(viewDetails.finance.particulars || []).map((p, idx) => (
                  // <div key={idx} className="border-t pt-2">
                    <DetalisFormatted
                      title={`Particular ${idx + 1}`}
                      detail={`${p.particularName || "-"} — ₹${
                        p.particularAmount || 0
                      }`}
                    />
                  // </div>
                ))} */}

              </div>
            )}
          </div>
        </MuiModal>
      )}
    </div>
  );
};

export default DepartmentInvoice;
