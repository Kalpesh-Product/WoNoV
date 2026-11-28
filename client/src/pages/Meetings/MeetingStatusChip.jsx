import { Chip } from "@mui/material";

const statusColors = {
  Upcoming: { bg: "#E3F2FD", text: "#1565C0" },
  Ongoing: { bg: "#FFF3E0", text: "#E65100" },
  Completed: { bg: "#E8F5E9", text: "#1B5E20" },
  Extended: { bg: "#EDE9FE", text: "#6D28D9" },
  Cancelled: { bg: "#FFEBEE", text: "#B71C1C" },
};

export default function MeetingStatusChip({ value }) {
  return (
    <Chip
      label={value || ""}
      sx={{
        backgroundColor: statusColors[value]?.bg || "#F5F5F5",
        color: statusColors[value]?.text || "#000",
        fontWeight: "bold",
      }}
    />
  );
}
