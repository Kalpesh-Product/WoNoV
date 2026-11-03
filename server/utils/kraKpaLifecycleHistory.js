const buildLifecycleHistoryEntry = ({ user, at, field, label, oldValue = null, newValue }) => ({
  editedBy: user,
  editedAt: at,
  changes: [{ field, label, oldValue, newValue }],
});

const buildKpaApprovalUpdate = (status, user, at) => {
  if (!["Approved", "Rejected"].includes(status)) throw new Error("Invalid approval decision");
  return {
    $set: {
      approvalStatus: status,
      ...(status === "Approved" ? { approvedBy: user, approvedAt: at } : { rejectedBy: user, rejectedAt: at }),
      updatedBy: user,
    },
    $push: {
      editHistory: buildLifecycleHistoryEntry({
        user, at, field: "approvalStatus", label: "Approval Status",
        oldValue: "Pending Approval", newValue: status,
      }),
    },
  };
};

module.exports = { buildLifecycleHistoryEntry, buildKpaApprovalUpdate };
