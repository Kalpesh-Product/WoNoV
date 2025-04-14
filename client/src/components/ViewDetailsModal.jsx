import React from "react";
import MuiModal from "./MuiModal";

const ViewDetailsModal = ({ open, onClose, data, fields, title = "Details" }) => {

  return (
    <MuiModal open={open} onClose={onClose} title={title}>
      {data && (
        <div className="space-y-3 text-sm">
          {fields.map(({ key, label }) => (
            <div key={key}>
              <strong>{label}: </strong>&nbsp;{data[key] || "—"}
            </div>
          ))}
        </div>
      )}
    </MuiModal>
  );
};

export default ViewDetailsModal;
