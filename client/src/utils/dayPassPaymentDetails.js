// Adapt a saved visitor visit to the same payment fields used by revenue views.
export const getDayPassPaymentDetails = (visit = {}) => {
  const deskAmount = Number(visit.amount || 0);
  const discount = Number(visit.discount || 0);
  const uploader = visit.invoiceUploadedBy;
  const status = String(visit.paymentStatus ?? "").toLowerCase();
  const date = visit.dateOfVisit ? new Date(visit.dateOfVisit) : null;
  const now = new Date();
  const isHistorical = date && date < new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    deskAmount,
    discount,
    taxable: Math.max(deskAmount - discount, 0),
    gst: Number(visit.gstAmount || 0),
    totalAmount: Number(visit.totalAmount || 0),
    status: ["true", "paid"].includes(status) ? "Paid" : "Unpaid",
    paymentProofLink: visit.paymentProof?.url || visit.paymentProof?.link || "",
    invoiceLink: visit.invoice?.link || "",
    paymentMode: visit.paymentMode || "N/A",
    paymentVerification: visit.paymentVerification || "N/A",
    invoiceUploadedAt: visit.invoiceUploadedAt || visit.invoice?.date || null,
    invoiceUploadedByName:
      uploader?.employeeName ||
      [uploader?.firstName, uploader?.middleName, uploader?.lastName].filter(Boolean).join(" ") ||
      uploader?.name || "N/A",
    financeStatus: isHistorical || visit.financeStatus === "Verified"
      ? "Verified"
      : visit.paymentVerification === "Completed" ? "Upload Invoice" : "Pending",
  };
};
