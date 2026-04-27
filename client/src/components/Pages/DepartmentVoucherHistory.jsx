import { useState } from "react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import YearWiseTable from "../Tables/YearWiseTable";
import PageFrame from "./PageFrame";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";
import MuiModal from "../MuiModal";
import DetalisFormatted from "../DetalisFormatted";
import humanDate from "../../utils/humanDateForamt";
import { inrFormat } from "../../utils/currencyFormat";
import { HideImage } from "@mui/icons-material";
import { h } from "@fullcalendar/core/preact.js";

const DepartmentVoucherHistory = () => {
  const axios = useAxiosPrivate();
  const department = usePageDepartment();
  const departmentTitle = department?.name || "Department";
  const [viewModal, setViewModal] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);

  const { data: voucherData = [], isPending: isVoucherPending } = useQuery({
    queryKey: ["departmentVoucherHistory", department?._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/budget/company-budget?departmentId=${department?._id}`,
      );
      const budgets = response?.data?.allBudgets;
      return Array.isArray(budgets) ? budgets : [];
    },
    enabled: !!department?._id,
  });

  const voucherHistoryData = (voucherData || []).filter(
    (item) => item?.finance?.voucher?.name || item?.finance?.voucher?.link,
  );

  const columns = [
    { field: "srNo", headerName: "Sr No", flex: 0.5 },
    { field: "voucherName", headerName: "Voucher Name", flex: 1 },
    { field: "modeOfPayment", headerName: "Mode of Payment", flex: 1 },
    { field: "totalAmount", headerName: "Total Amount(INR)", flex: 1, valueFormatter: (params) => inrFormat(params.value), },
    {
      field: "advanceAmount",
      headerName: "Advance Amount(INR)",
      flex: 1,
      valueFormatter: (params) => inrFormat(params.value),hide: true,
    },
    { field: "chequeNo", headerName: "Cheque No", flex: 1,hide: true },
    { field: "chequeDate", headerName: "Cheque Date", flex: 1,hide: true },
    {
      field: "approvedAt",
      headerName: "Approved Date",
      flex: 1,
      cellRenderer: (params) => humanDate(params.value),
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <div className="p-2 flex gap-2 hover:bg-gray-300 rounded-full w-fit">
          <span
            role="button"
            onClick={() => {
              setViewDetails(params.data);
              setViewModal(true);
            }}
          >
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageFrame>
        <YearWiseTable
          data={voucherHistoryData.map((item, index) => ({
            ...item,
            srNo: index + 1,
            voucherName: item.finance?.voucher?.name || "-",
            voucherLink: item.finance?.voucher?.link || "-",
            modeOfPayment: item.finance?.modeOfPayment || "-",
            totalAmount: Array.isArray(item.finance?.particulars)
              ? item.finance.particulars.reduce(
                  (sum, entry) => sum + Number(entry?.particularAmount || 0),
                  0,
                )
              : 0,
            advanceAmount: item.finance?.advanceAmount ?? "-",
            chequeNo: item.finance?.chequeNo || "-",
            chequeDate: item.finance?.chequeDate
              ? dayjs(item.finance.chequeDate).format("DD MMM YYYY")
              : "-",
            approvedAt: item.finance?.approvedAt || "-",
            expectedDateInvoice: humanDate(item.finance?.expectedDateInvoice) || "-",
            financeParticulars: Array.isArray(item.finance?.particulars)
              ? item.finance.particulars
              : [],
          }))}
          dateColumn="approvedAt"
          columns={columns}
          search
        //   tableTitle="Voucher History"
         tableTitle={`${departmentTitle} Voucher History`}
          tableHeight={450}
          isLoading={isVoucherPending}
        />
      </PageFrame>

      {viewModal && viewDetails && (
        <MuiModal
          open={viewModal}
          onClose={() => {
            setViewModal(false);
            setViewDetails(null);
          }}
         title="Voucher Finance Details"
        //    title={
        //     <span className="text-subtitle font-pmedium text-primary my-4 uppercase">
        //       Department-Invoice Budget Summary
        //     </span>
        //   }
        >
          <div className="space-y-3">
            <span className="text-subtitle font-pmedium text-primary my-0.5 uppercase">
                 Voucher History Finance Details
            </span>
            {(() => {
              const particulars = Array.isArray(viewDetails.financeParticulars)
                ? viewDetails.financeParticulars
                : [];
              const particularsTotal = particulars.reduce(
                (sum, item) => sum + Number(item?.particularAmount || 0),
                0,
              );

              return (
                <>
                  <DetalisFormatted title="Sr No" detail={viewDetails.srNo || "-"} />
                  <DetalisFormatted
                    title="Mode of Payment"
                    detail={viewDetails.modeOfPayment}
                  />
                <DetalisFormatted title="Cheque No" detail={viewDetails.chequeNo} />
                  <DetalisFormatted
                    title="Cheque Date"
                    detail={viewDetails.chequeDate}
                  />
                  {(viewDetails.financeParticulars || []).length > 0 ? (
                    <>
                      {(viewDetails.financeParticulars || []).map((p, idx) => (
                        <DetalisFormatted
                          key={idx}
                          title={`Particular ${idx + 1}`}
                          detail={`${p.particularName || "-"} — INR ${inrFormat(p.particularAmount || 0)}`}
                        />
                      ))}
                    </>
                  ) : (
                    <DetalisFormatted title="Particulars" detail="-" />
                  )}

                  <DetalisFormatted
                    title="Total Amount"
                    detail={`INR ${inrFormat(particularsTotal)}`}
                  />
                  <DetalisFormatted
                    title="Advance Amount"
                    detail={`INR ${inrFormat(viewDetails.finance?.advanceAmount || 0)}`}
                  />
                  <DetalisFormatted
                    title="Expected Invoice Date"
                    detail={viewDetails.expectedDateInvoice}
                  />
                  <DetalisFormatted
                    title="Voucher File"
                    detail={
                      viewDetails.voucherLink !== "-" ? (
                        <a
                          href={viewDetails.voucherLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          View Voucher
                        </a>
                      ) : (
                        "-"
                      )
                    }
                  />
                </>
              );
            })()}
          </div>
        </MuiModal>
      )}
    </>
  );
};

export default DepartmentVoucherHistory;