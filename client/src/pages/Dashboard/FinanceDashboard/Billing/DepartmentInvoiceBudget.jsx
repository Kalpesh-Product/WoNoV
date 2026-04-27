import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { Chip } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import { inrFormat } from "../../../../utils/currencyFormat";
import PageFrame from "../../../../components/Pages/PageFrame";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const DepartmentInvoiceBudget = () => {
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
          return !(
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
    { headerName: "Expense Name", field: "expanseName", flex: 1 },
    { headerName: "Expense Type", field: "expanseType", flex: 1 },
    { headerName: "Payment Type", field: "paymentType", flex: 1,hide: true },
    { headerName: "Projected Amount(INR)", field: "projectedAmount", flex: 1,valueFormatter: (params) => inrFormat(params.value), },
    { headerName: "Actual Amount(INR)", field: "actualAmount", flex: 1,valueFormatter: (params) => inrFormat(params.value), },
    { headerName: "Unit", field: "unitName", flex: 1, hide: true },
    { headerName: "Unit No", field: "unitNo", flex: 1, hide: true },
    { headerName: "Building", field: "buildingName", flex: 1, hide: true },
    { headerName: "Due Date", field: "dueDate", flex: 1 },
    { headerName: "Invoice Name", field: "invoiceName", flex: 1, hide: true },
    { headerName: "Invoice Date", field: "invoiceDate", flex: 1, hide: true },
    { headerName: "Approval Status", field: "status", flex: 1, hide: true },
    { headerName: "Paid Status", field: "isPaid", flex: 1, hide: true },
    { headerName: "Invoice File", field: "invoiceLink", flex: 1, hide: true },
    //{ headerName: "Invoice Name", field: "invoiceName", flex: 1 },
    // { headerName: "GSTIN", field: "gstIn", flex: 1 },
    //{ headerName: "Invoice Date", field: "invoiceDate", flex: 1 },
   
   

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
    const finance = item.finance || {};
    const unit = item.unit || {};
    const building = unit.building || {};
    const departmentName = item.department?.name || "-";

    return {
      ...item,

      id: item._id,
      expanseName: item.expanseName || "-",
      expanseType: item.expanseType || "-",
      department: departmentName,
      unitName: unit.unitName || "-",
      unitNo: unit.unitNo || "-",
      buildingName: building.buildingName || "-",
      dueDate: item.dueDate || "-",
      gstIn: item.gstIn || "-",
      isPaid: item.isPaid || "Unpaid",
      projectedAmount: item.projectedAmount || 0,
      actualAmount: item.actualAmount || 0,

      invoiceName: invoice.name || "-",
      invoiceLink: invoice.link || "-",
      invoiceDate: invoice.date || null,

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
          tableTitle="Department-Invoice Budget"
          dateColumn="dueDate"
          formatDate={true}
          tableHeight={450}
          exportData
        />
      </PageFrame>

      {viewModal && viewDetails && (
        <MuiModal
          open={viewModal}
          onClose={() => {
            setViewModal(false);
            setViewDetails(null);
          }}
           title={
            <span className="text-subtitle font-pmedium text-primary my-4 uppercase">
              Department-Invoice Budget Summary
            </span>
          }
        >
          <div className="space-y-3">
            {/* <div className="font-bold">Department Invoice Budget Summary</div> */}
              {/* <span className="text-subtitle font-pmedium text-primary my-4 uppercase">
                Department-Invoice Budget Summary
              </span> */}
            <DetalisFormatted
              title="Department"
              detail={viewDetails.department || "-"}
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
              title="Payment Type"
              detail={viewDetails.paymentType || "-"}
            />
            <DetalisFormatted
              title="Projected Amount"
              detail={`INR ${(viewDetails.projectedAmount || 0).toLocaleString()}`}
            />
            <DetalisFormatted
              title="Actual Amount"
              detail={`INR ${(viewDetails.actualAmount || 0).toLocaleString()}`}
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
            <DetalisFormatted
              title="Invoice Name"
              detail={viewDetails.invoiceName || "-"}
            />
            {/* <DetalisFormatted title="GSTIN" detail={viewDetails.gstIn || "-"} /> */}
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
            <DetalisFormatted title="Approval Status" detail={viewDetails.status} />
            <DetalisFormatted
              title="Paid Status"
              detail={viewDetails.isPaid || "Unpaid"}
            />
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

            {/* Finance details fields are intentionally commented out for Department-Invoice Budget popup. */}
          </div>
        </MuiModal>
      )}
    </div>
  );
};

export default DepartmentInvoiceBudget;
