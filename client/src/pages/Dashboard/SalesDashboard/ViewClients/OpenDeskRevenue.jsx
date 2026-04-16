import { useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { inrFormat } from "../../../../utils/currencyFormat";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useSelector } from "react-redux";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import humanDate from "../../../../utils/humanDateForamt";
import { MdOutlineRemoveRedEye } from "react-icons/md";

const OpenDeskRevenue = () => {
  const selectedClient = useSelector((state) => state?.client?.selectedClient);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedPaymentEntry, setSelectedPaymentEntry] = useState(null);

  const normalizePaymentStatus = (status) => {
    if (typeof status === "string") return status;
    return status ? "Paid" : "Unpaid";
  };

  const displayClientName =
    `${selectedClient?.firstName || ""} ${selectedClient?.lastName || ""}`.trim() ||
    selectedClient?.clientName ||
    selectedClient?.visitorCompany ||
    selectedClient?.brandName ||
    selectedClient?.registeredClientCompany ||
    "Unknown";

  const formatCurrencyWithoutRounding = (value) => {
    return Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 1,
    });
  };

  const columns = [
    { field: "srNo", headerName: "SR No", width: 100 },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      cellRenderer: (params) =>
        formatCurrencyWithoutRounding(params?.value ?? 0),
    },
    {
      field: "desk",
      headerName: "Desk",
      flex: 1,
      valueGetter: (params) => params?.data?.desk ?? 1,
    },
    {
      field: "purposeOfVisit",
      headerName: "Purpose of Visit",
      flex: 1.2,
    },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      flex: 1,
      cellRenderer: (params) => {
        const statusColorMap = {
          Paid: { backgroundColor: "#90EE90", color: "#006400" },
          Unpaid: { backgroundColor: "#D3D3D3", color: "#696969" },
        };

        const { backgroundColor, color } = statusColorMap[params?.value] || {
          backgroundColor: "gray",
          color: "white",
        };

        return (
          <Chip
            label={params?.value || "N/A"}
            style={{ backgroundColor, color }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      width: 120,
      cellRenderer: (params) => (
        <div className="flex items-center">
          <div
            role="button"
            title="View Payment Details"
            onClick={() => {
              setSelectedPaymentEntry(params?.data || null);
              setOpenPaymentModal(true);
            }}
            className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
          >
            <MdOutlineRemoveRedEye />
          </div>
        </div>
      ),
    },
  ];

  const tableData = useMemo(() => {
    if (!selectedClient) return [];

    const paymentEntries = (selectedClient?.externalVisits || []).filter(
      (visit) => {
        const visitorType = (visit?.visitorType || "").trim().toLowerCase();
        return (
          visitorType === "half-day pass" || visitorType === "full-day pass"
        );
      },
    );

    return paymentEntries.map((visit, index) => ({
      ...visit,
      srNo: index + 1,
      date: visit?.updatedAt || visit?.createdAt || visit?.dateOfVisit || null,
      amount: Number(visit?.amount) || Number(visit?.amount) || 0,
      desk: 1,
      purposeOfVisit:
        visit?.visitorType || selectedClient?.purposeOfVisit || "N/A",
      paymentStatus: normalizePaymentStatus(visit?.paymentStatus),
      paymentMode: visit?.paymentMode || "N/A",
      gstAmount: visit?.gstAmount ?? 0,
      discountAmount: visit?.discount ?? 0,
      discountPercentage: visit?.discountPercentage ?? 0,
      finalAmount: visit?.totalAmount ?? 0,
      paymentDate: visit?.updatedAt || visit?.createdAt || null,
      paymentProof: visit?.paymentProof?.url || visit?.paymentProof || "",
    }));
  }, [selectedClient]);

  const renderFileLink = (url) => {
    if (!url) return "N/A";

    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-primary underline"
      >
        View File
      </a>
    );
  };

  return (
    <div className="w-full">
      <PageFrame>
        <YearWiseTable
          dateColumn="date"
          tableTitle={`${displayClientName} Revenue Details`}
          search={true}
          searchColumn="paymentStatus"
          data={tableData}
          columns={columns}
        />
      </PageFrame>

      <MuiModal
        open={openPaymentModal}
        onClose={() => setOpenPaymentModal(false)}
        title="Payment Details"
      >
        <div className="grid grid-cols-1 gap-2">
          <DetalisFormatted
            title="Purpose of Visit"
            detail={selectedPaymentEntry?.purposeOfVisit || "N/A"}
          />
          <DetalisFormatted
            title="Amount (INR)"
            detail={inrFormat(selectedPaymentEntry?.amount || 0) || "INR 0"}
          />
          <DetalisFormatted
            title="Payment Status"
            detail={selectedPaymentEntry?.paymentStatus || "N/A"}
          />
          <DetalisFormatted
            title="Payment Mode"
            detail={selectedPaymentEntry?.paymentMode || "N/A"}
          />
          <DetalisFormatted
            title="GST Amount"
            detail={inrFormat(selectedPaymentEntry?.gstAmount || 0) || "INR 0"}
          />
          <DetalisFormatted
            title="Discount Amount"
            detail={
              inrFormat(selectedPaymentEntry?.discountAmount || 0) || "INR 0"
            }
          />
          <DetalisFormatted
            title="Discount Percentage"
            detail={`${selectedPaymentEntry?.discountPercentage || 0}%`}
          />
          <DetalisFormatted
            title="Final Amount"
            detail={formatCurrencyWithoutRounding(
              selectedPaymentEntry?.finalAmount ?? 0,
            )}
          />
          <DetalisFormatted
            title="Payment Date"
            detail={
              selectedPaymentEntry?.paymentDate
                ? humanDate(new Date(selectedPaymentEntry.paymentDate))
                : "N/A"
            }
          />
          <DetalisFormatted
            title="Payment Proof"
            detail={renderFileLink(selectedPaymentEntry?.paymentProof)}
          />
        </div>
      </MuiModal>
    </div>
  );
};

export default OpenDeskRevenue;
