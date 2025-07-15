import { useState, useMemo } from "react";
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
import usePageDepartment from "../../hooks/usePageDepartment";

const MonthlyInvoiceCommon = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const department = usePageDepartment();
  const departmentId = department?._id;
  console.log("department : ", departmentId);

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
        return Array.isArray(res.data?.allBudgets)
          ? res.data.allBudgets.filter((data) => data.isPaid === "Paid")
          : [];
      } catch (err) {
        console.error("Error fetching department budgets:", err);
        return [];
      }
    },
  });

  const invoiceCreationColumns = [
    { headerName: "Sr No", field: "srNo", width: 100, sort: "desc" },
    // { headerName: "Department", field: "department", flex: 1 },
    { headerName: "Expense Name", field: "expanseName", flex: 1 },
    { headerName: "Invoice Name", field: "invoiceName", flex: 1 },
    { headerName: "GSTIN", field: "gstIn", flex: 1 },
    { headerName: "Invoice Date", field: "invoiceDate", flex: 1 },
    { headerName: "Due Date", field: "dueDate", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
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

    return hrFinance.map((item, index) => {
      const invoice = item.invoice || {};
      const finance = item.finance || {};
      const unit = item.unit || {};
      const building = unit.building || {};
      const departmentName = item.department?.name || "-";

      return {
        ...item,
        id: item._id,
        srNo: index + 1,
        expanseName: item.expanseName || "-",
        expanseType: item.expanseType || "-",
        department: departmentName,
        unitName: unit.unitName || "-",
        unitNo: unit.unitNo || "-",
        buildingName: building.buildingName || "-",
        dueDate: item.dueDate || "-",
        gstIn: item.gstIn || "-",
        isPaid: item.isPaid || "Unpaid",
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
          amount: finance.amount || 0,
          voucher: finance.voucher || null,
          particulars: Array.isArray(finance.particulars)
            ? finance.particulars
            : [],
        },
        unit: unit,
      };
    });
  }, [hrFinance]);

  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        {departmentId ? (
          <YearWiseTable
            data={mappedRows}
            dropdownColumns={["department"]}
            columns={invoiceCreationColumns}
            search
            tableTitle={`${
              department?.name || ""
            } Department - Invoice Reports`}
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
            <DetalisFormatted
              title="Expense Name"
              detail={viewDetails?.expanseName || "-"}
            />
            <DetalisFormatted
              title="Expense Type"
              detail={viewDetails?.expanseType || "-"}
            />
            <DetalisFormatted
              title="Department"
              detail={viewDetails?.department || "-"}
            />
            <DetalisFormatted
              title="Unit"
              detail={viewDetails?.unitName || "-"}
            />
            <DetalisFormatted
              title="Unit No"
              detail={viewDetails?.unitNo || "-"}
            />
            <DetalisFormatted
              title="Building"
              detail={viewDetails?.buildingName || "-"}
            />
            <DetalisFormatted
              title="Due Date"
              detail={
                viewDetails?.dueDate
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
              detail={viewDetails?.invoiceName || "-"}
            />
            <DetalisFormatted
              title="GSTIN"
              detail={viewDetails?.gstIn || "-"}
            />
            <DetalisFormatted
              title="Invoice Date"
              detail={
                viewDetails?.invoiceDate
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
              title="Status"
              detail={viewDetails?.isPaid || "Unpaid"}
            />
            <DetalisFormatted
              title="Invoice File"
              detail={
                viewDetails?.invoiceLink !== "-" ? (
                  <a
                    href={viewDetails.invoiceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {viewDetails.invoiceName}
                  </a>
                ) : (
                  "-"
                )
              }
            />

            {/* Finance Section */}
            {viewDetails?.finance && (
              <div className="mt-4 flex flex-col gap-4">
                <span className="text-subtitle font-pmedium text-primary my-4 uppercase">
                  Finance Details
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
                <DetalisFormatted
                  title="Advance Amount"
                  detail={`₹${viewDetails.finance.amount || 0}`}
                />
                <DetalisFormatted
                  title="Voucher File"
                  detail={
                    viewDetails.finance.voucher?.link ? (
                      <a
                        href={viewDetails.finance.voucher.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        {viewDetails.finance.voucher.name}
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
                {(viewDetails.finance.particulars || []).map((p, idx) => (
                  <div key={idx} className="border-t pt-2">
                    <DetalisFormatted
                      title={`Particular ${idx + 1}`}
                      detail={`${p.particularName || "-"} — ₹${
                        p.particularAmount || 0
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </MuiModal>
      )}
    </div>
  );
};

export default MonthlyInvoiceCommon;
