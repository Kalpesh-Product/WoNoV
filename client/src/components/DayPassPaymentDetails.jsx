import DetalisFormatted from "./DetalisFormatted";
import { inrFormat } from "../utils/currencyFormat";
import humanDate from "../utils/humanDateForamt";

const DetailSection = ({ title }) => (
  <div className="font-bold text-lg pt-4 first:pt-0">{title}</div>
);

const FileDetail = ({ file, label = "View File" }) => {
  const link = file?.link || file?.url;
  return link ? (
    <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary underline">
      {label}
    </a>
  ) : "-";
};

const DayPassPaymentDetails = ({ revenue, showFinanceDetails = true }) => (
  <>
      {/* Payment Details */}
      <DetailSection title="Payment Details" />

      <DetalisFormatted
        title="Desk Amount"
        detail={`INR ${inrFormat(revenue.deskAmount ?? (Number(revenue.taxable || 0) + Number(revenue.discount || 0)))}`}
      />

      <DetalisFormatted
        title="Discount"
        detail={`INR ${inrFormat(revenue.discount || 0)}`}
      />

      <DetalisFormatted
        title="Taxable Amount"
        detail={`INR ${inrFormat(revenue.taxable || 0)}`}
      />

      <DetalisFormatted
        title="GST Amount"
        detail={`INR ${inrFormat(revenue.gst || 0)}`}
      />
      <DetalisFormatted
        title="Total Amount"
        detail={`INR ${inrFormat(revenue.totalAmount || 0)}`}
      />
      <DetalisFormatted
        title="Status"
        detail={revenue.status || "N/A"}
      />

      <DetalisFormatted
        title="Payment Proof"
        detail={<FileDetail file={{ link: revenue.paymentProofLink }} />}
      />

      {showFinanceDetails && (
      <DetalisFormatted
        title="Invoice Link"
        detail={<FileDetail file={{ link: revenue.invoiceLink }} label="View PDF" />}
      />
      )}

      <DetalisFormatted
        title="Payment Mode"
        detail={revenue.paymentMode || revenue.remarks || "N/A"}
      />

      <DetalisFormatted
        title="Payment Verification"
        detail={revenue.paymentVerification || "N/A"}
      />

      {showFinanceDetails && (
        <>
      {/* Finance Invoice Details */}
      <DetailSection title="Finance Invoice Details" />

      <DetalisFormatted
        title="Invoice Uploaded At"
        detail={
          revenue.invoiceUploadedAt
            ? humanDate(revenue.invoiceUploadedAt)
            : "N/A"
        }
      />

      <DetalisFormatted
        title="Invoice Uploaded By"
        detail={revenue.invoiceUploadedByName || "N/A"}
      />

      <DetalisFormatted
        title="Finance Status"
        detail={revenue.financeStatus || "Pending"}
      />
        </>
      )}
  </>
);

export default DayPassPaymentDetails;
