import React from "react";
import MuiModal from "./MuiModal";
import DetalisFormatted from "./DetalisFormatted";

const ViewDetailsModal = ({ open, onClose, data, fields, title = "Details" }) => {

  return (
    <MuiModal open={open} onClose={onClose} title={title}>
      {data && (
        <div className="space-y-3 text-sm">
          {fields.map(({ key, label }) => (
            <DetalisFormatted key={key} label={label} value={data[key] || '-'} />
            // <div key={key}>
            //   <strong>{label}: </strong>&nbsp;{data[key] || "—"}
            // </div>
          ))}
        </div>
      )}
    </MuiModal>
  );
};

export default ViewDetailsModal;
