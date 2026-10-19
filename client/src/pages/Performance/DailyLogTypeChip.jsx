import { Chip } from "@mui/material";

const styles = {
  KRA: { backgroundColor: "#dbeafe", color: "#1d4ed8" },
  KPA: { backgroundColor: "#ffe2dc", color: "#b42318" },
  GENERAL: { backgroundColor: "#dcfce7", color: "#15803d" },
};

const DailyLogTypeChip = ({ data, value }) => (
  <Chip
    size="small"
    label={value === "KPA" && !data?.sourceSelfKpa ? "KPA Task" : value}
    sx={styles[value] || { backgroundColor: "#f3f4f6", color: "#4b5563" }}
  />
);

export default DailyLogTypeChip;
