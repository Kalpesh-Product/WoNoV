import { Chip } from "@mui/material";

const statusColorMap = {
  Pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
  "In Progress": { backgroundColor: "#FFECC5", color: "#CC8400"},
  resolved: { backgroundColor: "#90EE90", color: "#006400" },
  Open: { backgroundColor: "#FF9F93", color: "#B71C1C" },
  completed: { backgroundColor: "#D3D3D3", color: "#696969" },
  Approved: { backgroundColor: "#90EE90", color: "#006400" },
  Paid: { backgroundColor: "#90EE90", color: "#006400" },
  Unpaid: { backgroundColor: "#FDECEA", color: "#B71C1C" },
  Closed: { backgroundColor: "#90EE90", color: "#006400" },
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
