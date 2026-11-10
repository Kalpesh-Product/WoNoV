import DetalisFormatted from "./DetalisFormatted";
import TicketAttachments from "./TicketAttachments";
import { getTicketDetailFields } from "../utils/ticketDetailFields";


const TicketDetails = ({ ticket }) => {
  if (!ticket) return null;
  const wrapper = ticket.sourceTicket || ticket;
  const record = wrapper.ticket && typeof wrapper.ticket === "object" ? wrapper.ticket : wrapper;
  const alwaysVisible = new Set([
    "Ticket ID", "Ticket Title", "Description", "From Department",
    "Raised By", "Raised At", "Raised To Department", "Priority", "Status",
  ]);
  return (
    <div className="grid grid-cols-1 gap-4">
      {getTicketDetailFields(ticket)
        .filter(({ label, value }) => label !== "Attachments" && (alwaysVisible.has(label) || value))
        .map(({ label, value }) => (
          <DetalisFormatted key={label} title={label} detail={value || "—"} />
        ))}
      <TicketAttachments
        attachments={record.attachments || ticket.attachments}
        legacyImage={record.image?.url ||
          (typeof record.image === "string" ? record.image : "") ||
          ticket.image?.url ||
          (typeof ticket.image === "string" ? ticket.image : "")}
      />
    </div>
  );
};

export default TicketDetails;
