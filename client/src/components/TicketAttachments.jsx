import PropTypes from "prop-types";

const TicketAttachments = ({ attachments = [], legacyImage = "" }) => {
  const files = Array.isArray(attachments) ? [...attachments] : [];

  if (legacyImage && !files.some((file) => file?.url === legacyImage)) {
    files.push({ url: legacyImage, name: "Image attachment" });
  }

  if (files.length === 0) return null;

  return (
    <div>
      <div className="text-content flex w-full items-start">
        <span className="w-[50%]">Attachments</span>
        <span>:</span>
        <span className="text-content flex w-full flex-wrap items-start gap-y-1 pl-4">
          {files.map((attachment, index) => (
            <span
              key={attachment?.id || attachment?.url || index}
              className="inline"
            >
              <a
                href={attachment?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-words text-primary underline"
              >
                {attachment?.name || `Attachment ${index + 1}`}
              </a>
              {index < files.length - 1 ? ", " : ""}
            </span>
          ))}
        </span>
      </div>
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
