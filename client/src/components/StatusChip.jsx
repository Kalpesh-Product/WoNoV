import { Chip } from "@mui/material";
import { getStatusColors } from "../constants/statusColors";

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
  disabled: {
    backgroundColor: "#ececec",
    color: "#666666",
    borderColor: "#d4d4d4",
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
        : normalizedStatus === "disabled"
          ? "disabled"
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

  const { backgroundColor, color } = getStatusColors(normalizedStatus);
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
