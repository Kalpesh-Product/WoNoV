import { Chip } from "@mui/material";

const paymentColors = {
  Paid: { backgroundColor: "#D1FAE5", color: "#047857" },
  Unpaid: { backgroundColor: "#FECACA", color: "#B91C1C" },
  "Not Required": { backgroundColor: "#E2E8F0", color: "#334155" },
};

export default function MeetingPaymentChip({ status }) {
  return <Chip label={status} sx={{ ...paymentColors[status], fontWeight: "bold" }} />;
}
