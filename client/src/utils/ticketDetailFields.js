import formatDateTime from "./formatDateTime.js";

const nameOf = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return [value.firstName, value.middleName, value.lastName]
    .filter(Boolean)
    .join(" ") || value.name || value.companyName || "";
};

const departmentOf = (value) => {
  if (Array.isArray(value)) return value.map(departmentOf).filter(Boolean).join(", ");
  if (!value) return "";
  return typeof value === "string" ? value : value.name || value.departmentName || "";
};

const dateOf = (value) => {
  if (!value || value === "N/A" || value === "-") return "";
  const formatted = formatDateTime(value);
  return formatted === "N/A" ? String(value).replace(/^'+/, "") : formatted;
};

const textOf = (value) => {
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join(", ");
  return value == null || value === "N/A" ? "" : String(value);
};

// The same ordered fields drive every ticket view and the existing report export.
export const getTicketDetailFields = (row = {}) => {
  const wrapper = row.sourceTicket || row;
  const ticket = wrapper.ticket && typeof wrapper.ticket === "object"
    ? wrapper.ticket
    : wrapper;
  const latestAssignment = ticket.assignedTo?.at?.(-1);
  const assignmentDetails = ticket.assignedTo?.length
    ? ticket.assignedTo.map(({ assignee, assignedAt }) =>
        [nameOf(assignee), dateOf(assignedAt)].filter(Boolean).join(" — "),
      ).join("; ")
    : row.assignedToDetails?.map(({ assigneeName, assignedAtFormatted }) =>
        [assigneeName, assignedAtFormatted].filter(Boolean).join(" — "),
      ).join("; ") || ticket.assignees?.map(nameOf).filter(Boolean).join(", ") || textOf(row.assignedTo || row.assignees);
  const escalation = ticket.escalatedTo?.at?.(-1);
  const rejection = ticket.reject || {};
  const attachmentLinks = (ticket.attachments || row.attachments || [])
    .map((file) => file.url).filter(Boolean);
  const legacyImage = ticket.image?.url ||
    (typeof ticket.image === "string" ? ticket.image : "") ||
    row.image?.url ||
    (typeof row.image === "string" ? row.image : "");
  if (legacyImage && !attachmentLinks.includes(legacyImage)) attachmentLinks.push(legacyImage);

  const fields = [
    ["Ticket ID", textOf(ticket._id || row.id)],
    ["Ticket Title", textOf(ticket.ticket || row.ticketTitle)],
    ["Description", textOf(ticket.description || row.description)],
    ["Company", nameOf(ticket.company || row.company)],
    ["From Department", departmentOf(ticket.raisedBy?.departments || row.fromDepartment || row.raisedByDepartment || row.selectedDepartment)],
    ["Raised By", nameOf(ticket.raisedBy || row.raisedUser || row.raisedBy)],
    ["Raised At", dateOf(ticket.createdAt || row.raisedAt || row.raisedDate)],
    ["Raised To Department", departmentOf(ticket.raisedToDepartment || row.raisedToDepartment || row.raisedTo)],
    ["Priority", textOf(row.priority || ticket.priority)],
    ["Status", textOf(ticket.status || row.status)],
    ["Accepted By", nameOf(ticket.acceptedBy || row.acceptedBy)],
    ["Accepted At", dateOf(ticket.acceptedAt || row.acceptedAt)],
    ["Assignees and Assignment Times", assignmentDetails],
    ["Last Assigned At", dateOf(latestAssignment?.assignedAt || ticket.assignedAt || row.assignedAt)],
    ["Escalated To", departmentOf(escalation?.raisedToDepartment || row.escalatedTo)],
    ["Escalated Status", textOf(escalation?.status || row.escalatedStatus)],
    ["Escalated At", dateOf(ticket.escalatededAt || escalation?.createdAt || row.escalatedAt)],
    ["Escalation Reason", textOf(escalation?.description || row.reasonForEscalated)],
    ["Rejected By", nameOf(rejection.rejectedBy || row.rejectedBy)],
    ["Rejected At", dateOf(rejection.rejectedAt || row.rejectedAt)],
    ["Rejection Reason", textOf(rejection.reason || ticket.specifiedReason || row.reason)],
    ["Resolved Date", dateOf(ticket.resolvedDate || row.resolvedDate)],
    ["Closed By", nameOf(ticket.closedBy || row.closedBy)],
    ["Closed At", dateOf(ticket.closedAt || row.closedAtRaw || row.closedAt)],
    ["Closing Remark", textOf(ticket.closingRemark || row.closingRemark)],
    ["Closing Categories", textOf(ticket.closingCategories || row.closingCategories)],
    ["Last Updated At", dateOf(ticket.updatedAt || row.updatedAt)],
    ["Attachments", attachmentLinks.join("; ")],
  ];

  if (wrapper !== ticket || row.supportRequestedAt) {
    fields.push(
      ["Support Requested By", nameOf(wrapper.user || row.supportRequestedBy)],
      ["Support Requested At", dateOf(wrapper.createdAt || row.supportRequestedAtRaw || row.supportRequestedAt)],
      ["Support Reason", textOf(wrapper.reason || row.reasonForSupport)],
    );
  }
  return fields.map(([label, value]) => ({ label, value }));
};
