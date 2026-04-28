import { useState } from "react";
import { Chip } from "@mui/material";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import PageFrame from "../../../../components/Pages/PageFrame";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";
import humanDate from "../../../../utils/humanDateForamt";

const RejectedVoucher = () => {
  const axios = useAxiosPrivate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const { data: rejectedVouchers = [], isPending: isRejectedLoading } = useQuery({
    queryKey: ["rejectedVouchers"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/budget/company-budget`);
        const budgets = response.data.allBudgets;

        return Array.isArray(budgets)
          ? budgets.filter((budget) => {
              const expenseType = String(budget.expanseType || "")
                .trim()
                .toLowerCase();
              const status = String(budget.status || "").trim().toLowerCase();

              return (
                (expenseType.includes("reimbursement") ||
                  expenseType.includes("voucher")) &&
                status === "rejected"
              );
            })
          : [];
      } catch (error) {
        console.error("Error fetching rejected vouchers:", error);
        return [];
      }
    },
  });

  const columns = [
    { field: "srno", headerName: "Sr No", flex: 0.8 },
    { field: "expanseName", headerName: "Expense Name ", flex: 1.5  },
    { field: "department", headerName: "Department", flex: 1.5},
    { field: "expanseType", headerName: "Expense Type " ,flex: 1.5},
    { field: "projectedAmount", headerName: "Particular Amount (INR)",flex: 1.5 },
    { field: "reimbursementDate", headerName: "Date" ,hide: true},
    { field: "dueDate", headerName: "Due Date" ,flex: 1.5},
    {
      field: "status",
      headerName: "Approval Status",
      cellRenderer: (params) => (
        <Chip
          label={params.value || "-"}
          size="small"
          sx={{
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
            fontWeight: 500,
            textTransform: "capitalize",
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <div className="h-10 flex items-center gap-3">
          <MdOutlineRemoveRedEye
            className="cursor-pointer text-lg"
            onClick={() => {
              setSelectedBudget(params.data);
              setModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const tableData = rejectedVouchers.map((item, index) => ({
    ...item,
    srNo: item.srNo,
    srno: index + 1,
    department: item.department?.name,
    unitName: item.unit?.unitName || "-",
    unitNo: item.unit?.unitNo || "-",
    buildingName: item.unit?.building?.buildingName || "-",
    reimbursementDate: item.reimbursementDate ? humanDate(item.reimbursementDate) : "-",
    dueDate: item.dueDate ? humanDate(item.dueDate) : "-",
    dueDateRaw: item?.dueDate || null,
    projectedAmount: inrFormat(item.projectedAmount),
    status: item?.status || "Rejected",
  }));

  return (
    <div>
      <PageFrame>
        <YearWiseTable
          dateColumn={"dueDateRaw"}
          search={true}
          tableTitle={"Rejected Voucher"}
          data={tableData}
          columns={columns}
          isLoading={isRejectedLoading}
        />
      </PageFrame>

      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={"Rejected Voucher Details"}
      >
        {selectedBudget && (
           <div className="flex flex-col gap-4">
              <span className="text-subtitle font-pmedium text-primary my-0.5 uppercase">
                 Rejected Voucher
                </span>
              {/* <DetalisFormatted title="Sr No" detail={selectedBudget.srNo} /> */}
              <DetalisFormatted
                title="Sr No"
                detail={selectedBudget.srNo}
              />
              <DetalisFormatted
                title="Expense Name"
                detail={selectedBudget.expanseName}
              />
              <DetalisFormatted
                title="Expense Type"
                detail={selectedBudget.expanseType}
              />
              <DetalisFormatted
                title="Department"
                detail={selectedBudget.department}
              />

              <DetalisFormatted title="Unit" detail={selectedBudget.unitName} />
              <DetalisFormatted
                title="Unit No"
                detail={selectedBudget.unitNo}
              />
              <DetalisFormatted
                title="Building"
                detail={selectedBudget.buildingName}
              />
              
           {Array.isArray(selectedBudget.particulars) &&
            selectedBudget.particulars.length > 0 ? (
              <>
                {selectedBudget.particulars.map((item, idx) => (
                  <DetalisFormatted
                    key={`${item.particularName}-${idx}`}
                    title={`Particular ${idx + 1}`}
                    detail={`${item.particularName || "-"} — INR ${
                      inrFormat(item.particularAmount || 0)
                    }`}
                  />
                ))}
              </>
            ) : (
              <DetalisFormatted title="Particulars" detail="-" />
)}

            

              {/* <DetalisFormatted
                title="Particular Amount"
                detail={selectedBudget.projectedAmount?.toLocaleString()}
              /> */}
              
              <DetalisFormatted
                title="Total Amount"
                // detail={`₹${(selectedBudget.projectedAmount || 0).toLocaleString()}`}
                detail={`INR ${(selectedBudget.projectedAmount || 0).toLocaleString()}`}
              />
              <DetalisFormatted title="GSTIN" detail={selectedBudget.gstIn} />
              <DetalisFormatted title="Approval Status" detail={selectedBudget.status} />
              <DetalisFormatted
                title="Paid Status"
                detail={selectedBudget.isPaid}
              />
              <DetalisFormatted
                title="Extra Budget"
                detail={selectedBudget.isExtraBudget ? "Yes" : "No"}
              />
              <DetalisFormatted
                title="Pre-Approved"
                detail={selectedBudget.preApproved ? "Yes" : "No"}
                //detail={selectedBudget.preApproved}
              />
              <DetalisFormatted
                title="Emergency Approval"
                detail={selectedBudget.emergencyApproval ? "Yes" : "No"}
                //detail={selectedBudget.emergencyApproval}
              />
              <DetalisFormatted
                title="Budget Approval"
                detail={selectedBudget.budgetApproval ? "Yes" : "No"}
                //detail={selectedBudget.budgetApproval}
              />
              <DetalisFormatted
                title="L1 Approval"
                detail={selectedBudget.l1Approval ? "Yes" : "No"}
                //detail={selectedBudget.l1Approval}
              />
              <DetalisFormatted
                title="Invoice Attached"
                detail={selectedBudget.invoiceAttached ? "Yes" : "No"}
              />
              <DetalisFormatted
                title="Invoice Name"
                detail={selectedBudget.invoice?.name}
              />
              <DetalisFormatted
                title="Invoice Link"
                detail={
                  <a
                    href={selectedBudget.invoice?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Invoice
                  </a>
                }
              />
              <DetalisFormatted
                title="Invoice Date"
                detail={humanDate(selectedBudget.invoice?.date)}
              />
              <DetalisFormatted
                title="Voucher Name"
                detail={selectedBudget.voucher?.name}
              />
              <DetalisFormatted
                title="Voucher Link"
                detail={
                  <a
                    href={selectedBudget.voucher?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline cursor-pointer"
                  >
                    View Voucher
                  </a>
                }
              />

              <DetalisFormatted
                title="Reimbursement Date"
                detail={selectedBudget.reimbursementDate}
              />
              <DetalisFormatted title="Due Date" detail={selectedBudget.dueDate || "-"} />
            </div>
        )}
      </MuiModal>
    </div>
  );
};

export default RejectedVoucher;