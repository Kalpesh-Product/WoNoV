import { Chip } from "@mui/material";

const statusColorMap = {
  pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
  "in progress": { backgroundColor: "#FFECC5", color: "#CC8400" },
  resolved: { backgroundColor: "#90EE90", color: "#006400" },
  active: { backgroundColor: "#90EE90", color: "#006400" },
  inactive: { backgroundColor: "#FF9F93", color: "#B71C1C" },
  open: { backgroundColor: "#FF9F93", color: "#B71C1C" },
  completed: { backgroundColor: "#D3D3D3", color: "#696969" },
  approved: { backgroundColor: "#90EE90", color: "#006400" },
  paid: { backgroundColor: "#90EE90", color: "#006400" },
  unpaid: { backgroundColor: "#FDECEA", color: "#B71C1C" },
  closed: { backgroundColor: "#90EE90", color: "#006400" },
  rejected: { backgroundColor: "#FFCCCC", color: "#B22222" },
  revoked: { backgroundColor: "#EADCFD", color: "#6B3FA0" },
  upcoming: { backgroundColor: "#E3F2FD", color: "#1565C0" },
  assigned: { backgroundColor: "#90EE90", color: "#006400" },
  ongoing: { backgroundColor: "#FFF3E0", color: "#E65100" },
  available: { backgroundColor: "#E3F2FD", color: "#0D47A1" },
  occupied: { backgroundColor: "#ECEFF1", color: "#37474F" },
  cleaning: { backgroundColor: "#E0F2F1", color: "#00796B" },
};

const StatusChip = ({ status }) => {
  const label = String(status || "-").trim();
  const normalizedStatus = label.toLowerCase();
  const { backgroundColor, color } = statusColorMap[normalizedStatus] || {
    backgroundColor: "gray",
    color: "white",
  };

  return (
    <Chip
      label={label}
      style={{
        backgroundColor,
        color,
        textTransform: "capitalize",
      }}
    />
  );
};

export default StatusChip;
