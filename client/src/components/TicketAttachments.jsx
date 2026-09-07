import PropTypes from "prop-types";

const TicketAttachments = ({ attachments = [], legacyImage = "" }) => {
  const files = Array.isArray(attachments) ? [...attachments] : [];

  if (legacyImage && !files.some((file) => file?.url === legacyImage)) {
    files.push({ url: legacyImage, name: "Image attachment" });
  }

  if (files.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 lg:col-span-1">
      <span className="font-medium">Attachments</span>
      {files.map((attachment, index) => (
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
  legacyImage: PropTypes.string,
};

export default TicketAttachments;
