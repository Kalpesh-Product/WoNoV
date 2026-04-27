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
    { headerName: "Voucher Sr.No", field: "voucherSrNo", hide: true },
    { headerName: "Expense Name", field: "expanseName", hide: true },
    { headerName: "Expense Type", field: "expanseType", hide: true },
    { headerName: "Department", field: "department", flex: 1 },
    { headerName: "Unit", field: "unitName", hide: true },
    { headerName: "Unit No", field: "unitNo", hide: true },
    { headerName: "Building", field: "buildingName", hide: true },
    { headerName: "Particulars", field: "particularSummary", hide: true },
    { headerName: "Total Amount", field: "projectedAmount", hide: true },
    { headerName: "Paid Status", field: "isPaid", hide: true },
    { headerName: "Extra Budget", field: "isExtraBudgetText", hide: true },
    { headerName: "Pre-Approved", field: "preApprovedText", hide: true },
    { headerName: "Emergency Approval", field: "emergencyApprovalText", hide: true },
    { headerName: "Budget Approval", field: "budgetApprovalText", hide: true },
    { headerName: "L1 Approval", field: "l1ApprovalText", hide: true },
    { headerName: "Invoice Attached", field: "invoiceAttachedText", hide: true },
    { headerName: "Invoice Name", field: "invoiceName", flex: 1 },
    { headerName: "GSTIN", field: "gstIn", flex: 1 },
    { headerName: "Invoice Link", field: "invoiceLink", hide: true },
    { headerName: "Invoice Date", field: "invoiceDate", flex: 1 },
    { headerName: "Voucher Name", field: "voucherName", hide: true },
    { headerName: "Voucher Link", field: "voucherLink", hide: true },
    { headerName: "Reimbursement Date", field: "reimbursementDate", hide: true },
    { headerName: "Due Date", field: "dueDate", flex: 1 },
    { headerName: "Approval Status", field: "status",
      cellRenderer: (params) => {
        const status = String(params?.value || "Pending");
        const normalizedStatus = status.toLowerCase();

        const styleMap = {
          approved: { backgroundColor: "#DCFCE7", color: "#166534" },
          pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
          //rejected: { backgroundColor: "#FEE2E2", color: "#991B1B" },
        };

        const chipStyle = styleMap[normalizedStatus] || {
          backgroundColor: "#F5F5F5",
          color: "#616161",
        };

        return (
          <Chip
            label={status}
            size="small"
            sx={{
              ...chipStyle,
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          />
        );
      },
    },
    { headerName: "Finance Sr No", field: "financeSrNo", hide: true },
    { headerName: "Mode of Payment", field: "modeOfPayment", hide: true },
    { headerName: "Cheque No", field: "chequeNo", hide: true },
    { headerName: "Cheque Date", field: "chequeDate", hide: true },
    { headerName: "Finance Particulars", field: "financeParticularSummary", hide: true },
    { headerName: "Finance Total Amount", field: "financeParticularTotal", hide: true },
    { headerName: "Advance Amount", field: "advanceAmount", hide: true },
    { headerName: "Approved At", field: "approvedAt", hide: true },
    { headerName: "Expected Invoice Date", field: "expectedDateInvoice", hide: true },
    { headerName: "Finance Voucher File", field: "financeVoucherLink", hide: true },

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

  //const mappedRows = (hrFinance || []).map((item, index) => {
    const mappedRows = (hrFinance || [])
    .filter((item) => {
      const normalizedStatus = String(item?.status || "pending").toLowerCase();
      return normalizedStatus === "approved" || normalizedStatus === "pending";
    })
    .map((item, index) => {
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
    const financeParticulars = Array.isArray(finance.particulars)
      ? finance.particulars
      : [];
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
      particularSummary:
        particularDetails.length > 0
          ? particularDetails
              .map((p) => `${p.label}: ${p.name} (INR ${inrFormat(p.amount)})`)
              .join(" | ")
          : "-",
      dueDate: item.dueDate || "-",
      gstIn: item.gstIn || "-",
      status: item.status || "Pending",
      isPaid: item.isPaid || "Unpaid",
      isExtraBudget: Boolean(item.isExtraBudget),
      isExtraBudgetText: item.isExtraBudget ? "Yes" : "No",
      preApproved: Boolean(item.preApproved),
      preApprovedText: item.preApproved ? "Yes" : "No",
      emergencyApproval: Boolean(item.emergencyApproval),
      emergencyApprovalText: item.emergencyApproval ? "Yes" : "No",
      budgetApproval: Boolean(item.budgetApproval),
      budgetApprovalText: item.budgetApproval ? "Yes" : "No",
      l1Approval: Boolean(item.l1Approval),
      l1ApprovalText: item.l1Approval ? "Yes" : "No",
      invoiceAttached: Boolean(item.invoiceAttached),
      invoiceAttachedText: item.invoiceAttached ? "Yes" : "No",
      reimbursementDate: item.reimbursementDate || null,

      invoiceName: invoice.name || "-",
      invoiceLink: invoice.link || "-",
      invoiceDate: invoice.date || null,
      voucherName: voucher.name || "-",
      voucherLink: voucher.link || "-",
      financeSrNo: finance.fSrNo || "-",
      modeOfPayment: finance.modeOfPayment || "-",
      chequeNo: finance.chequeNo || "-",
      chequeDate: finance.chequeDate || "-",
      approvedAt: finance.approvedAt || "-",
      expectedDateInvoice: finance.expectedDateInvoice || "-",
      financeParticularSummary:
        financeParticulars.length > 0
          ? financeParticulars
              .map(
                (p, idx) =>
                  `Particular ${idx + 1}: ${p?.particularName || "-"} (INR ${inrFormat(p?.particularAmount || 0)})`,
              )
              .join(" | ")
          : "-",
      financeParticularTotal: financeParticulars.reduce(
        (sum, p) => sum + Number(p?.particularAmount || 0),
        0,
      ),
      advanceAmount: finance.advanceAmount || 0,
      financeVoucherLink: finance.voucher?.link || "-",

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
          title="Invoice Details">
          <div className="space-y-3">
            {/* <div className="font-bold">Department-Invoice Voucher Summary</div> */}
             <span className="text-subtitle font-pmedium text-primary my-4 uppercase">
                 Department-Invoice Voucher Summary
                </span>
            <DetalisFormatted
              title="Voucher Sr No"
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
              title="Invoice Name"
              detail={viewDetails.invoiceName || "-"}
            />
             <DetalisFormatted
              title="Invoice Link"
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
            
              {/* <DetalisFormatted
                title="Status"
                detail={viewDetails.isPaid || "Unpaid"}
              /> */}
           

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




// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { MdOutlineRemoveRedEye } from "react-icons/md";
// import { Chip } from "@mui/material";
// import MuiModal from "../../../../components/MuiModal";
// import DetalisFormatted from "../../../../components/DetalisFormatted";
// import ThreeDotMenu from "../../../../components/ThreeDotMenu";
// import PageFrame from "../../../../components/Pages/PageFrame";
// import { inrFormat } from "../../../../utils/currencyFormat";
// import YearWiseTable from "../../../../components/Tables/YearWiseTable";
// import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

// const DepartmentInvoice = () => {
//   const navigate = useNavigate();
//   const axios = useAxiosPrivate();

//   const [viewModal, setViewModal] = useState(false);
//   const [viewDetails, setViewDetails] = useState(null);

//   const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
//     queryKey: ["allBudgets"],
//     queryFn: async () => {
//       try {
//         const response = await axios.get(`/api/budget/company-budget`);
//          const budgets = Array.isArray(response.data.allBudgets)
//           ? response.data.allBudgets
//           : [];

//         return budgets.filter((budget) => {
//           const expenseType = String(budget.expanseType || "")
//             .trim()
//             .toLowerCase();
//           return (
//             expenseType.includes("reimbursement") ||
//             expenseType.includes("voucher")
//           );
//         });
//       } catch (error) {
//         console.error("Error fetching budget:", error);
//         return [];
//       }
//     },
//   });

//   const invoiceCreationColumns = [
//     { headerName: "Sr No", field: "srNo", width: 100 },
//     { headerName: "Department", field: "department", flex: 1 },
//     { headerName: "Invoice Name", field: "invoiceName", flex: 1 },
//     { headerName: "GSTIN", field: "gstIn", flex: 1 },
//     { headerName: "Invoice Date", field: "invoiceDate", flex: 1 },
//     { headerName: "Due Date", field: "dueDate", flex: 1 },

//     {
//       field: "actions",
//       headerName: "Actions",
//       pinned: "right",
//       cellRenderer: (params) => (
//         <div className="p-2 flex gap-2 items-center">
//           <span
//             className="text-subtitle cursor-pointer"
//             onClick={() => {
//               setViewDetails(params.data);
//               setViewModal(true);
//             }}>
//             <MdOutlineRemoveRedEye />
//           </span>
//         </div>
//       ),
//     },
//   ];

//   const mappedRows = (hrFinance || []).map((item, index) => {
//     const invoice = item.invoice || {};
//     const voucher = item.voucher || {};
//     const finance = item.finance || {};
//     const unit = item.unit || {};
//     const building = unit.building || {};
//     const departmentName = item.department?.name || "-";
//     const particulars = Array.isArray(item.particulars) ? item.particulars : [];
//     const particularDetails = particulars.map((p, idx) => ({
//       label: `Particular ${idx + 1}`,
//       name: p?.particularName || "-",
//       amount: Number(p?.particularAmount || 0),
//     }));
//     return {
//       ...item,

//       id: item._id,
//       voucherSrNo: item.srNo || "-",
//       expanseName: item.expanseName || "-",
//       expanseType: item.expanseType || "-",
//       department: departmentName,
//       unitName: unit.unitName || "-",
//       unitNo: unit.unitNo || "-",
//       buildingName: building.buildingName || "-",
//       particularDetails,
//       dueDate: item.dueDate || "-",
//       gstIn: item.gstIn || "-",
//       status: item.status || "Pending",
//       isPaid: item.isPaid || "Unpaid",
//       isExtraBudget: Boolean(item.isExtraBudget),
//       preApproved: Boolean(item.preApproved),
//       emergencyApproval: Boolean(item.emergencyApproval),
//       budgetApproval: Boolean(item.budgetApproval),
//       l1Approval: Boolean(item.l1Approval),
//       invoiceAttached: Boolean(item.invoiceAttached),
//       reimbursementDate: item.reimbursementDate || null,

//       invoiceName: invoice.name || "-",
//       invoiceLink: invoice.link || "-",
//       invoiceDate: invoice.date || null,
//       voucherName: voucher.name || "-",
//       voucherLink: voucher.link || "-",

//       finance: {
//         fSrNo: finance.fSrNo || "-",
//         modeOfPayment: finance.modeOfPayment || "-",
//         chequeNo: finance.chequeNo || "-",
//         chequeDate: finance.chequeDate || null,
//         approvedAt: finance.approvedAt || null,
//         expectedDateInvoice: finance.expectedDateInvoice || null,
//         advanceAmount: finance.advanceAmount || 0,
//         voucher: finance.voucher || null,
//         particulars: Array.isArray(finance.particulars)
//           ? finance.particulars
//           : [],
//       },
//       unit: unit,
//     };
//   });


//   return (
//     <div className="flex flex-col gap-4">
//       <PageFrame>
//         <YearWiseTable
//           data={mappedRows}
//           dropdownColumns={["department"]}
//           columns={invoiceCreationColumns}
//           search
//           tableTitle="Department-Invoice Voucher"
//           dateColumn="dueDate"
//           formatDate={true}
//           tableHeight={450}
//         />
//       </PageFrame>

//       {viewModal && viewDetails && (
//         <MuiModal
//           open={viewModal}
//           onClose={() => {
//             setViewModal(false);
//             setViewDetails(null);
//           }}
//           title="Invoice Details">
//           <div className="space-y-3">
//             {/* <div className="font-bold">Department-Invoice Voucher Summary</div> */}
//              <span className="text-subtitle font-pmedium text-primary my-4 uppercase">
//                  Department-Invoice Voucher Summary
//                 </span>
//             <DetalisFormatted
//               title="Voucher Sr No"
//               detail={viewDetails.voucherSrNo || "-"}
//             />    
//             <DetalisFormatted
//               title="Expense Name"
//               detail={viewDetails.expanseName || "-"}
//             />
//             <DetalisFormatted
//               title="Expense Type"
//               detail={viewDetails.expanseType || "-"}
//             />
//             <DetalisFormatted
//               title="Department"
//               detail={viewDetails.department || "-"}
//             />
//               <DetalisFormatted
//               title="Unit"
//               detail={viewDetails.unitName || "-"}
//             />
//             <DetalisFormatted
//               title="Unit No"
//               detail={viewDetails.unitNo || "-"}
//             />
//             <DetalisFormatted
//               title="Building"
//               detail={viewDetails.buildingName || "-"}
//             />
//             {/* <DetalisFormatted
//               title="Particular"
//               detail={viewDetails.particularNames || "-"}
//             /> */}
//              {Array.isArray(viewDetails.particularDetails) &&
//             viewDetails.particularDetails.length > 0 ? (
//               viewDetails.particularDetails.map((particular, index) => (
//                 <DetalisFormatted
//                   key={`${particular.name}-${index}`}
//                   title={particular.label}
//                   detail={`${particular.name} — INR ${inrFormat(particular.amount || 0)}`}
//                 />
//               ))
//             ) : (
//               <DetalisFormatted title="Particular" detail="-" />
//             )}
//             <DetalisFormatted
//               title="Total Amount"
//               detail={`INR ${Number(viewDetails.projectedAmount || 0).toLocaleString("en-IN")}`}
//             />
//              <DetalisFormatted title="GSTIN" detail={viewDetails.gstIn || "-"} />
//             <DetalisFormatted
//               title="Approval Status"
//               detail={viewDetails.status || "Pending"}
//             />
//             <DetalisFormatted
//               title="Paid Status"
//               detail={viewDetails.isPaid || "Unpaid"}
//             />
//              <DetalisFormatted
//               title="Extra Budget"
//               detail={viewDetails.isExtraBudget ? "Yes" : "No"}
//             />
//             <DetalisFormatted
//               title="Pre-Approved"
//               detail={viewDetails.preApproved ? "Yes" : "No"}
//             />
//             <DetalisFormatted
//               title="Emergency Approval"
//               detail={viewDetails.emergencyApproval ? "Yes" : "No"}
//             />
//             <DetalisFormatted
//               title="Budget Approval"
//               detail={viewDetails.budgetApproval ? "Yes" : "No"}
//             />
//             <DetalisFormatted
//               title="L1 Approval"
//               detail={viewDetails.l1Approval ? "Yes" : "No"}
//             />
//             <DetalisFormatted
//               title="Invoice Attached"
//               detail={viewDetails.invoiceAttached ? "Yes" : "No"}
//             />
//              <DetalisFormatted
//               title="Invoice Name"
//               detail={viewDetails.invoiceName || "-"}
//             />
//              <DetalisFormatted
//               title="Invoice Link"
//               detail={
//                 viewDetails.invoiceLink !== "-" ? (
//                   <a
//                     href={viewDetails.invoiceLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-primary underline">
//                     {viewDetails.invoiceName}
//                   </a>
//                 ) : (
//                   "-"
//                 )
//               }
//             />
//             <DetalisFormatted
//               title="Invoice Date"
//               detail={
//                 viewDetails.invoiceDate
//                   ? new Date(viewDetails.invoiceDate).toLocaleDateString(
//                       "en-IN",
//                       {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                       }
//                     )
//                   : "-"
//               }
//             />
//             <DetalisFormatted
//               title="Voucher Name"
//               detail={viewDetails.voucherName || "-"}
//             />
//             <DetalisFormatted
//               title="Voucher Link"
//               detail={
//                 viewDetails.voucherLink !== "-" ? (
//                   <a
//                     href={viewDetails.voucherLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-primary underline">
//                     {viewDetails.voucherName || "View Voucher"}
//                   </a>
//                 ) : (
//                   "-"
//                 )
//               }
//             />
//             <DetalisFormatted
//               title="Reimbursement Date"
//               detail={
//                 viewDetails.reimbursementDate
//                   ? new Date(viewDetails.reimbursementDate).toLocaleDateString(
//                       "en-IN",
//                       {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                       }
//                     )
//                   : "-"
//               }
//             />
//             <DetalisFormatted
//               title="Due Date"
//               detail={
//                 viewDetails.dueDate
//                   ? new Date(viewDetails.dueDate).toLocaleDateString("en-IN", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                     })
//                   : "-"
//               }
//             />
            
//               {/* <DetalisFormatted
//                 title="Status"
//                 detail={viewDetails.isPaid || "Unpaid"}
//               /> */}
           

//             {/* Finance Details */}
//             {viewDetails.finance && (
//               <div className="mt-4 flex flex-col gap-4">
//                 <span className="text-subtitle font-pmedium text-primary my-0.5 uppercase">
//                  Voucher History Finance Details
//                 </span>
//                 <DetalisFormatted
//                   title="Finance Sr No"
//                   detail={viewDetails.finance.fSrNo || "-"}
//                 />
//                 <DetalisFormatted
//                   title="Mode of Payment"
//                   detail={viewDetails.finance.modeOfPayment || "-"}
//                 />                
//                 <DetalisFormatted
//                   title="Cheque No"
//                   detail={viewDetails.finance.chequeNo || "-"}
//                 />
//                 <DetalisFormatted
//                   title="Cheque Date"
//                   detail={
//                     viewDetails.finance.chequeDate
//                       ? new Date(
//                           viewDetails.finance.chequeDate
//                         ).toLocaleDateString("en-IN", {
//                           day: "2-digit",
//                           month: "short",
//                           year: "numeric",
//                         })
//                       : "-"
//                   }
//                 />
//                  {(viewDetails.finance.particulars || []).map((p, idx) => (
//                   // <div key={idx} className="border-t pt-2">
//                     <DetalisFormatted
//                       title={`Particular ${idx + 1}`}
//                       detail={`${p.particularName || "-"} — INR ${inrFormat(p.particularAmount || 0)}`}
//                     />
//                   // </div>
//                 ))}
//                  <DetalisFormatted
//                   title="Total Amount"
//                   detail={`INR ${(viewDetails.finance.particulars || []).reduce(
//                     (sum, item) => sum + Number(item?.particularAmount || 0),
//                     0
//                   )}`}
//                 />
//                 <DetalisFormatted
//                   title="Advance Amount"
//                   detail={`INR ${inrFormat(viewDetails.finance.advanceAmount || 0)}`}
//                 />
//                  <DetalisFormatted
//                   title="Approved At"
//                   detail={
//                     viewDetails.finance.approvedAt
//                       ? new Date(
//                           viewDetails.finance.approvedAt
//                         ).toLocaleDateString("en-IN", {
//                           day: "2-digit",
//                           month: "short",
//                           year: "numeric",
//                         })
//                       : "-"
//                   }
//                 />
//                 <DetalisFormatted
//                   title="Expected Invoice Date"
//                   detail={
//                     viewDetails.finance.expectedDateInvoice
//                       ? new Date(
//                           viewDetails.finance.expectedDateInvoice
//                         ).toLocaleDateString("en-IN", {
//                           day: "2-digit",
//                           month: "short",
//                           year: "numeric",
//                         })
//                       : "-"
//                   }
//                 />
//                 <DetalisFormatted
//                   title="Voucher File"
//                   detail={
//                     viewDetails.finance.voucher?.link ? (
//                       <a
//                         href={viewDetails.finance.voucher.link}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-primary underline">
//                         {viewDetails.finance.voucher.name}
//                       </a>
//                     ) : (
//                       "-"
//                     )
//                   }
//                 />
//                 {/* {(viewDetails.finance.particulars || []).map((p, idx) => (
//                   // <div key={idx} className="border-t pt-2">
//                     <DetalisFormatted
//                       title={`Particular ${idx + 1}`}
//                       detail={`${p.particularName || "-"} — ₹${
//                         p.particularAmount || 0
//                       }`}
//                     />
//                   // </div>
//                 ))} */}

//               </div>
//             )}
//           </div>
//         </MuiModal>
//       )}
//     </div>
//   );
// };

// export default DepartmentInvoice;
