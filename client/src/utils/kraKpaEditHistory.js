const timestamp = (value) => value ? new Date(value).getTime() : NaN;
const actorId = (value) => value ? String(value._id || value) : "";

// Merge retained lifecycle metadata with explicit field edits. Do not infer an
// actor from updatedBy: a later edit may have changed it.
export const getKraKpaEditHistory = (record, kind = "task") => {
  if (!record) return [];
  const history = (record.editHistory || []).map((entry) => ({
    ...entry,
    changes: (entry.changes || []).filter((change) =>
      kind !== "kpa" || !["managerRatingDate", "hrRatingDate"].includes(change.field),
    ),
  })).filter((entry) => entry.changes.length > 0);
  const add = (key, at, by, field, label, oldValue, newValue) => {
    if (!Number.isFinite(timestamp(at))) return;
    if (history.some((entry) => timestamp(entry.editedAt) === timestamp(at) && entry.changes.some((change) =>
      change.field === field && change.newValue === newValue,
    ))) return;
    history.push({ _id: `lifecycle-${key}`, editedAt: at, editedBy: by || null, changes: [{ field, label, oldValue, newValue }] });
  };

  // Source KPA logs are generated mirrors, not separate user-created tasks.
  if (!record.sourceSelfKpa) add("created", record.createdAt, record.createdBy, "created", "Created", null, "Created");
  const statusLabel = kind === "kra" ? "KRA Status" : kind === "kpa" ? "KPA Status" : "Task Status";
  for (const [index, completion] of (record.completionHistory || []).entries()) {
    add(`completed-${index}`, completion.completedAt, completion.completedBy, "status", statusLabel, "Pending", "Completed");
  }
  const completionStatus = kind === "task" ? "Done" : "Completed";
  const alreadyRecordedCompletion = history.some((entry) => entry.changes.some((change) =>
    change.field === "status" && change.newValue === completionStatus &&
    (kind === "task" || timestamp(entry.editedAt) === timestamp(record.completedAt)),
  ));
  if (!record.sourceSelfKpa && record.completedAt && !alreadyRecordedCompletion) {
    add("completed", record.completedAt, record.completedBy, "status", statusLabel, null, kind === "task" ? "Done" : "Completed");
  }
  if (kind !== "task" && record.status === "Completed" && !record.completedAt && !(record.completionHistory || []).length) {
    add("legacy-completed", record.closingDate, record.completedBy, "status", statusLabel, null, "Completed");
  }
  // Legacy auto-approved creations have the same creator and approver. Only
  // infer separate approval events when their retained actors differ.
  if (record.approvedBy && actorId(record.approvedBy) !== actorId(record.createdBy)) {
    add("approved", record.approvedAt, record.approvedBy, "approvalStatus", "Approval Status", "Pending Approval", "Approved");
  }
  if (record.rejectedBy) add("rejected", record.rejectedAt, record.rejectedBy, "approvalStatus", "Approval Status", "Pending Approval", "Rejected");
  // Show creation first, then edits and lifecycle events oldest to newest.
  // Sort the copied entries only; never reorder the API record's history.
  return history.sort((first, second) => {
    const firstCreated = first.changes.some((change) => change.field === "created");
    const secondCreated = second.changes.some((change) => change.field === "created");
    if (firstCreated !== secondCreated) return firstCreated ? -1 : 1;
    const firstTime = timestamp(first.editedAt);
    const secondTime = timestamp(second.editedAt);
    if (!Number.isFinite(firstTime)) return Number.isFinite(secondTime) ? 1 : 0;
    if (!Number.isFinite(secondTime)) return -1;
    return firstTime - secondTime;
  });
};
