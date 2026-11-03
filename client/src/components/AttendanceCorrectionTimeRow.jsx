import { TextField } from "@mui/material";
import { useWatch } from "react-hook-form";
import dayjs from "dayjs";
import humanTime from "../utils/humanTime";

const AttendanceCorrectionTimeRow = ({ control, attendance = [], type, children }) => {
  const selectedDay = useWatch({ control, name: "targetedDay" });
  const record = selectedDay && attendance.find((entry) =>
    entry.inTime && dayjs(entry.inTime).isSame(dayjs(selectedDay), "day"),
  );
  const originalTime =
    type === "startBreak"
      ? record?.breaks?.[0]?.startBreak
      : type === "endBreak"
        ? record?.breaks?.[0]?.endBreak
        : record?.[type];
  const label = {
    inTime: "In Time",
    outTime: "Out Time",
    startBreak: "Break Start",
    endBreak: "Break End",
  }[type];

  return (
    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
      {children}
      <TextField
        label={`Original ${label}`}
        value={originalTime ? humanTime(originalTime) : "-"}
        size="small"
        fullWidth
        InputProps={{ readOnly: true }}
      />
    </div>
  );
};

export default AttendanceCorrectionTimeRow;
