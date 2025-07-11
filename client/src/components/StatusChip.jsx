import { Chip } from "@mui/material";

const statusColorMap = {
  Pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
  "in-progress": { backgroundColor: "#ADD8E6", color: "#00008B" },
  resolved: { backgroundColor: "#90EE90", color: "#006400" },
  open: { backgroundColor: "#E6E6FA", color: "#4B0082" },
  completed: { backgroundColor: "#D3D3D3", color: "#696969" },
  Approved: { backgroundColor: "#90EE90", color: "#006400" },
  Paid: { backgroundColor: "#90EE90", color: "#006400" },
};

const StatusChip = ({ status }) => {
  const { backgroundColor, color } = statusColorMap[status] || {
    backgroundColor: "gray",
    color: "white",
  };

  return (
    <Chip
      label={status}
      style={{
        backgroundColor,
        color,
      }}
    />
  );
};

export default StatusChip;
