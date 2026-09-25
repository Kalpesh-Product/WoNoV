import PropTypes from "prop-types";
import { Chip } from "@mui/material";

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
        <span className="text-content flex w-full flex-wrap items-start gap-2 pl-4">
          {files.map((attachment, index) => {
            const name = attachment?.name || `Attachment ${index + 1}`;
            return (
              <Chip
                key={attachment?.id || attachment?.url || index}
                component="a"
                href={attachment?.url}
                target="_blank"
                rel="noopener noreferrer"
                clickable
                label={name.length > 28
                  ? `${name.slice(0, 20)}...${name.includes(".") ? name.slice(name.lastIndexOf(".")) : ""}`
                  : name}
                title={name}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ maxWidth: "100%" }}
              />
            );
          })}
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
