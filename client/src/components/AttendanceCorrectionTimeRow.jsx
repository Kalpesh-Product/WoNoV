import { TextField } from "@mui/material";
import { useWatch } from "react-hook-form";
import dayjs from "dayjs";
import humanTime from "../utils/humanTime";

const AttendanceCorrectionTimeRow = ({ control, attendance = [], type, children }) => {
  const selectedDay = useWatch({ control, name: "targetedDay" });
  const record = selectedDay && attendance.find((entry) =>
    entry.inTime && dayjs(entry.inTime).isSame(dayjs(selectedDay), "day"),
  );
  const originalTime = record?.[type];

  return (
    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
      <TextField
        label={type === "inTime" ? "Original In Time" : "Original Out Time"}
        value={originalTime ? humanTime(originalTime) : "-"}
        size="small"
        fullWidth
        InputProps={{ readOnly: true }}
      />
      {children}
    </div>
  );
};

export default AttendanceCorrectionTimeRow;
