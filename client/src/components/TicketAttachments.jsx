import PropTypes from "prop-types";

const TicketAttachments = ({ attachments = [] }) => {
  if (!Array.isArray(attachments) || attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 lg:col-span-1">
      <span className="font-medium">Attachments</span>
      {attachments.map((attachment, index) => (
        <a
          key={attachment?.id || attachment?.url || index}
          href={attachment?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit break-all text-primary underline"
        >
          {attachment?.name || `Attachment ${index + 1}`}
        </a>
      ))}
    </div>
  );
};

TicketAttachments.propTypes = {
  attachments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      url: PropTypes.string,
      name: PropTypes.string,
    }),
  ),
};

export default TicketAttachments;
