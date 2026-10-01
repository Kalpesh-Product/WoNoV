import DetalisFormatted from "./DetalisFormatted";
import { inrFormat } from "../utils/currencyFormat";
import humanDate from "../utils/humanDateForamt";

const MeetingPaymentDetails = ({ revenue, showFinanceDetails = true }) => {
  if (!revenue) {
    return (
      <>
        <div className="font-bold text-lg pt-4">Payment Details</div>
        <div>Meeting payment details are unavailable.</div>
      </>
    );
  }
  return (
    <>
    <div className="font-bold text-lg pt-4">Payment Details</div>
    <DetalisFormatted
      title="Payment Date"
      detail={
        revenue.paymentDate
          ? humanDate(revenue.paymentDate)
          : "N/A"
      }
    />
    <DetalisFormatted
      title="Hours Booked"
      detail={revenue.hoursBooked || "N/A"}
    />
    <DetalisFormatted
      title="Cost Per Hour"
      detail={`INR ${inrFormat(revenue.costPerHour || 0)}`}
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
      detail={
        revenue.paymentProofLink ? (
          <a
            href={revenue.paymentProofLink}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            {revenue.paymentProofName || "View File"}
          </a>
        ) : (
          "-"
        )
      }
    />
    <DetalisFormatted
      title="Payment Verification"
      detail={revenue.paymentVerification || "N/A"}
    />
    <DetalisFormatted
      title="Payment Mode"
      detail={revenue.paymentMode || "N/A"}
    />
    <DetalisFormatted
      title="Remarks"
      detail={revenue.remarks || "N/A"}
    />
    {showFinanceDetails && (
      <>
    <div className="font-bold text-lg pt-4">Finance Invoice Details</div>
    <DetalisFormatted
      title="Invoice Link"
      detail={
        revenue.invoiceLink ? (
          <a
            href={revenue.invoiceLink}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            View PDF
          </a>
        ) : (
          "-"
        )
      }
    />
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
      //detail={revenue.financeStatus || "Upload Invoice"}
    />
      </>
    )}
    </>
  );
};

export default MeetingPaymentDetails;
