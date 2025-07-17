import { Chip } from "@mui/material";

const statusColorMap = {
  Pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
  "in-progress": { backgroundColor: "#ADD8E6", color: "#00008B" },
  resolved: { backgroundColor: "#90EE90", color: "#006400" },
  open: { backgroundColor: "#E6E6FA", color: "#4B0082" },
  completed: { backgroundColor: "#D3D3D3", color: "#696969" },
  Approved: { backgroundColor: "#90EE90", color: "#006400" },
  Paid: { backgroundColor: "#90EE90", color: "#006400" },
  Unpaid: { backgroundColor: "#FDECEA", color: "#B71C1C" },

  Upcoming: { bg: "#E3F2FD", text: "#1565C0" }, // Light Blue
  Ongoing: { bg: "#FFF3E0", text: "#E65100" }, // Light Orange
  Completed: { bg: "#E8F5E9", text: "#1B5E20" }, // Light Green
  Cancelled: { bg: "#FFEBEE", text: "#B71C1C" }, // Light Red
  Available: { bg: "#E3F2FD", text: "#0D47A1" },
  Occupied: { bg: "#ECEFF1", text: "#37474F" },
  Cleaning: { bg: "#E0F2F1", text: "#00796B" },
  "In Progress": { bg: "#FBE9E7", text: "#BF360C" },
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
