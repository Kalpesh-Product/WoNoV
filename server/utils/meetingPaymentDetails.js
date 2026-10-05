const getMeetingPaymentDetails = (revenue, meeting = revenue?.meeting) => {
  if (!meeting || typeof meeting !== "object") return null;
  const normalizedStatus = String(meeting.paymentStatus ?? "").trim().toLowerCase();
  const date = new Date(revenue?.date || meeting.startDate);
  const now = new Date();
  const historical = !Number.isNaN(date.getTime()) &&
    date < new Date(now.getFullYear(), now.getMonth(), 1);
  const uploader = revenue?.invoiceUploadedBy;
  const paymentVerification = revenue?.paymentVerification || meeting.paymentVerification || "N/A";

  const start = meeting.startTime ? new Date(meeting.startTime).getTime() : NaN;
  const end = meeting.endTime ? new Date(meeting.endTime).getTime() : NaN;
  const extendedEnd = meeting.extendTime ? new Date(meeting.extendTime).getTime() : NaN;
  const effectiveEnd = Number.isFinite(extendedEnd) && extendedEnd > end ? extendedEnd : end;
  const scheduledHours = Number.isFinite(start) && Number.isFinite(effectiveEnd) && effectiveEnd > start
    ? Number(((effectiveEnd - start) / 3600000).toFixed(2))
    : null;

  return {
    paymentDate: revenue?.paymentDate || null,
    hoursBooked: revenue?.hoursBooked || scheduledHours,
    costPerHour: revenue?.costPerHour ?? meeting.bookedRoom?.perHourPrice ?? 0,
    taxable: revenue?.taxable ?? meeting.paymentBaseAmount ?? 0,
    gst: revenue?.gst ?? meeting.paymentGstAmount ?? 0,
    discount: revenue?.discount ?? meeting.discountAmount ?? 0,
    totalAmount: revenue?.totalAmount ?? meeting.paymentAmount ?? 0,
    status: ["true", "paid"].includes(normalizedStatus) ? "Paid" : "Unpaid",
    paymentProofLink: meeting.paymentProof?.link || "",
    paymentProofName: meeting.paymentProof?.name || "",
    paymentVerification,
    paymentMode: meeting.paymentMode || revenue?.remarks || "N/A",
    remarks: revenue?.remarks || "",
    invoiceLink: revenue?.invoice?.link || "",
    invoiceUploadedAt: revenue?.invoiceUploadedAt || revenue?.invoice?.date || null,
    invoiceUploadedByName: typeof uploader === "string" ? uploader :
      uploader?.employeeName ||
      [uploader?.firstName, uploader?.middleName, uploader?.lastName].filter(Boolean).join(" ") || "N/A",
    financeStatus: historical || revenue?.financeStatus === "Verified" ? "Verified" :
      paymentVerification === "Completed" ? "Upload Invoice" : "Pending",
  };
};

module.exports = { getMeetingPaymentDetails };
