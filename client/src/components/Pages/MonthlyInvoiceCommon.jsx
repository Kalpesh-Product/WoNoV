import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { Chip } from "@mui/material";
import MuiModal from "../../components/MuiModal";
import DetalisFormatted from "../../components/DetalisFormatted";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import PageFrame from "../../components/Pages/PageFrame";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { inrFormat } from "../../utils/currencyFormat";
import usePageDepartment from "../../hooks/usePageDepartment";

const MonthlyInvoiceCommon = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const department = usePageDepartment();
  const departmentId = department?._id;

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  const [viewModal, setViewModal] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);

  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
    queryKey: ["departmentBudget", departmentId],
    enabled: !!departmentId,
    queryFn: async () => {
      try {
        const res = await axios.get(
          `/api/budget/company-budget?departmentId=${departmentId}`
        );
        // return Array.isArray(res.data?.allBudgets)
        //   ? res.data.allBudgets.filter((data) => data.isPaid === "Paid")
        //   : [];
        return Array.isArray(res.data?.allBudgets) ? res.data.allBudgets : [];
      } catch (err) {
        console.error("Error fetching department budgets:", err);
        return [];
      }
    },
  });

  const invoiceCreationColumns = [
    { headerName: "Sr No", field: "srNo", width: 100, sort: "asec" },
    { headerName: "Department", field: "department", flex: 1,hide:true },
    { headerName: "Expense Name", field: "expanseName", flex: 1 },
    { headerName: "Invoice Name", field: "invoiceName", flex: 1 },
    { headerName: "GSTIN", field: "gstIn", flex: 1 },
    { headerName: "Invoice Date", field: "invoiceDate", flex: 1 },

    {
      headerName: "Due Date",
      field: "dueDate",
      flex: 1,
      valueFormatter: (params) => formatDateTime(params.value),
    },
    {
      headerName: "Approval Status",
      field: "status",
      flex: 1,
      cellRenderer: (params) => {
        const status = String(params?.value || "-");
        const normalizedStatus = status.toLowerCase();
        const styleMap = {
          approved: { backgroundColor: "#DCFCE7", color: "#166534" },
          pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
          rejected: { backgroundColor: "#FEE2E2", color: "#991B1B" },
        };

        const chipStyle = styleMap[normalizedStatus] || {
          backgroundColor: "#F5F5F5",
          color: "#616161",
        };

        return <Chip label={status} size="small" sx={{ ...chipStyle }} />;
      },
    },
    {
      headerName: "Paid Status",
      field: "isPaid",
      flex:1,
      cellRenderer: (params) => {
        const statusColorMap = {
          Paid: { backgroundColor: "#28a745", color: "#fff" },
          Unpaid: { backgroundColor: "#dc3545", color: "#fff" },
        };

        const label = params.data?.isPaid === "Paid" ? "Paid" : "Unpaid";
        const { backgroundColor, color } =
          statusColorMap[label] || statusColorMap.Unpaid;

        return (
          <Chip
            label={label}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
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
            }}
          >
            <MdOutlineRemoveRedEye />
          </span>
          {/* <ThreeDotMenu
            rowId={params.data?.id}
            menuItems={[
              {
                label: "View",
                onClick: () => {
                  setViewDetails(params.data);
                  setViewModal(true);
                },
              },
            ]}
          /> */}
        </div>
      ),
    },
  ];

  const mappedRows = useMemo(() => {
    if (!Array.isArray(hrFinance)) return [];

    //return hrFinance.map((item, index) => {
    // const voucherOnlyBudgets = hrFinance.filter((item) => {
    //   const expenseType = String(item?.expanseType || "").toLowerCase();
    //   return (
    //     expenseType.includes("voucher") ||
    //     !!item?.finance?.voucher?.name ||
    //     !!item?.finance?.voucher?.link
    //   );
    // });

    // return voucherOnlyBudgets.map((item, index) => {  
     const voucherOnlyBudgets = hrFinance.filter((item) => {
      const expenseType = String(item?.expanseType || "")
        .trim()
        .toLowerCase();

      return (
        expenseType.includes("reimbursement") ||
        expenseType.includes("voucher") ||
        !!item?.finance?.voucher?.name ||
        !!item?.finance?.voucher?.link
      );
    });

    return voucherOnlyBudgets.map((item, index) => {
  
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
        srNo: index + 1,
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
        isPaid: item?.status === "Approved" ? "Paid" : "Unpaid",
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
  }, [hrFinance]);

  useEffect(() => {
    console.log("mappedRows", mappedRows);
  }, [mappedRows]);

  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        {departmentId ? (
          <YearWiseTable
            data={mappedRows}
            dropdownColumns={["department"]}
            columns={invoiceCreationColumns}
            search
            tableTitle={`${department?.name || ""
               } Department - Invoice Voucher Reports`}
            dateColumn="dueDate"
            formatDate={true}
            tableHeight={450}
          />
        ) : (
          <div className="text-red-500 text-sm font-medium">
            Department ID not available. Kindly log-in through the relevant
            department.
          </div>
        )}
      </PageFrame>

      {viewModal && viewDetails && (
        <MuiModal
          open={viewModal}
          onClose={() => {
            setViewModal(false);
            setViewDetails(null);
          }}
          title="Invoice Details"
        >
          <div className="space-y-3">
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

export default MonthlyInvoiceCommon;
