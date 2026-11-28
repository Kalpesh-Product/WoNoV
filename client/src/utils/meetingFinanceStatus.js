export const meetingPaymentVerification = {
  Pending: { label: "Pending", action: "Review Payment", next: "Under Review" },
  "Under Review": { label: "Review Payment", action: "Verify Payment", next: "Verified" },
  Verified: { label: "Verify Payment", action: "Completed", next: "Completed" },
  Completed: { label: "Completed" },
};

export const isMeetingPaid = (status) => status === "Paid" || status === true;

export const getMeetingFinanceStatus = (meeting) =>
  isMeetingPaid(meeting.paymentStatus)
    ? meetingPaymentVerification[meeting.paymentVerification]?.label || "Pending"
    : "Wait for Payment";
