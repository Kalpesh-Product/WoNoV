import { Chip } from "@mui/material";

const statusColorMap = {
  pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
  "in progress": { backgroundColor: "#FFECC5", color: "#CC8400" },
  resolved: { backgroundColor: "#90EE90", color: "#006400" },
  active: { backgroundColor: "#90EE90", color: "#006400" },
  inactive: { backgroundColor: "#FF9F93", color: "#B71C1C" },
  total: { backgroundColor: "#dbe4ff", color: "#26457d" },
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

const countChipStyles = {
  total: {
    backgroundColor: "#dbe4ff",
    color: "#26457d",
    borderColor: "#bfd4ff",
  },
  active: {
    backgroundColor: "#d9f4e4",
    color: "#1e7a49",
    borderColor: "#b7e7cf",
  },
  inactive: {
    backgroundColor: "#fde0d8",
    color: "#c24b3d",
    borderColor: "#f3b7aa",
  },
};

const StatusChip = ({
  status,
  count,
  label: customLabel,
  variant = "status",
}) => {
  const label = String(status || "-").trim();
  const normalizedStatus = label.toLowerCase();

  if (variant === "count") {
    const normalizedCountStatus = normalizedStatus === "inactive"
      ? "inactive"
      : normalizedStatus === "active"
        ? "active"
        : "total";

    const styles = countChipStyles[normalizedCountStatus];
    const displayLabel =
      customLabel ||
      `${label.toUpperCase()} : ${count ?? 0}`;

    return (
      <Chip
        label={displayLabel}
        size="small"
        sx={{
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          border: `1px solid ${styles.borderColor}`,
          borderRadius: "8px",
          fontWeight: 600,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          height: 38,
          "& .MuiChip-label": {
            px: 1.5,
            py: 0.75,
          },
        }}
      />
    );
  }

  const { backgroundColor, color } = statusColorMap[normalizedStatus] || {
    backgroundColor: "gray",
    color: "white",
  };
  const displayLabel = customLabel || label;

  return (
    <Chip
      label={displayLabel}
      style={{
        backgroundColor,
        color,
        textTransform: "capitalize",
      }}
    />
  );
};

export default StatusChip;
