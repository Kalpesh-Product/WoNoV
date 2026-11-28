import { Chip } from "@mui/material";
import MeetingPaymentChip from "./MeetingPaymentChip";

const styles = {
  Completed: { backgroundColor: "#D1FAE5", color: "#047857" },
  Pending: { backgroundColor: "#FFF7ED", color: "#F97316" },
  "Verify Payment": { backgroundColor: "#DBEAFE", color: "#1D4ED8" },
  "Review Payment": { backgroundColor: "#FEF3C7", color: "#B45309" },
  "Wait for Payment": { backgroundColor: "#FEE2E2", color: "#B91C1C" },
};

export default function MeetingFinanceStatusChip({ status }) {
  if (status === "Not Required") return <MeetingPaymentChip status={status} />;
  return <Chip label={status} sx={{ ...styles[status], fontWeight: "bold" }} />;
}
