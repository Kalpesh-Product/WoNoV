const previousVerificationStatus = {
  "Under Review": "Pending",
  Verified: "Under Review",
  Completed: "Verified",
};

const canVerifyInternalMeetingPayment = (departments = [], roles = []) =>
  departments.some((department) => department?.name === "Finance") ||
  roles.some((role) => ["Super Admin", "Master Admin"].includes(role));

const canAdvanceVerification = (current, target) =>
  previousVerificationStatus[target] === current;

module.exports = {
  previousVerificationStatus,
  canVerifyInternalMeetingPayment,
  canAdvanceVerification,
};
