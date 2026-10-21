import { useState } from "react";
import { Popover } from "@mui/material";
import { DateRangePicker } from "react-date-range";
import { MdCalendarToday } from "react-icons/md";
import dayjs from "dayjs";
import MuiModal from "../../components/MuiModal";

const displayValue = (field, value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (["date", "deadline", "identificationDate", "startTime", "endTime"].includes(field) && dayjs(value).isValid()) {
    return dayjs(value).format(["startTime", "endTime"].includes(field) ? "DD-MM-YYYY, hh:mm A" : "DD-MM-YYYY");
  }
  return String(value);
};

const DailyLogEditHistory = ({ record, onClose }) => {
  const [anchor, setAnchor] = useState(null);
  const [range, setRange] = useState(() => {
    const dates = (record.editHistory || []).map((entry) => dayjs(entry.editedAt))
      .filter((date) => date.isValid()).sort((a, b) => a.valueOf() - b.valueOf());
    return {
      startDate: (dates[0] || dayjs()).startOf("day").toDate(),
      endDate: (dates[dates.length - 1] || dayjs()).endOf("day").toDate(),
      key: "selection",
    };
  });
  const rows = (record.editHistory || []).filter((entry) =>
    !dayjs(entry.editedAt).isBefore(dayjs(range.startDate), "day") &&
    !dayjs(entry.editedAt).isAfter(dayjs(range.endDate), "day"),
  ).slice().sort((a, b) => dayjs(b.editedAt).valueOf() - dayjs(a.editedAt).valueOf())
    .flatMap((entry) => (entry.changes || []).map((change, index) => ({
      ...entry, change, key: `${entry._id || entry.editedAt}-${index}`,
    })));

  return (
    <MuiModal open onClose={onClose} title={record.dayTaskName || record.dueTaskName} widthClass="w-[calc(100vw-2rem)] max-w-[960px]">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
          {dayjs(range.startDate).format("DD MMM YYYY")}
        </div>
        <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
          {dayjs(range.endDate).format("DD MMM YYYY")}
        </div>
        <button type="button" aria-label="Select edit history date range" className="rounded-md bg-primary p-3 text-white" onClick={(event) => setAnchor(event.currentTarget)}>
          <MdCalendarToday size={20} />
        </button>
      </div>
      <Popover open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} transformOrigin={{ vertical: "top", horizontal: "center" }}>
        <DateRangePicker ranges={[range]} onChange={({ selection }) => setRange(selection)} moveRangeOnFirstSelection={false} direction="vertical" />
      </Popover>
      <div className="max-h-[65vh] overflow-auto rounded-md border border-borderGray">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-gray-50 text-primary">
            <tr>{["Sr No", "Edited On", "Edited By", "Field", "Previous Value", "New Value"].map((label) => <th key={label} className="border-b px-4 py-3">{label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row, index) => (
              <tr key={row.key}>
                <td className="border-b px-4 py-3 align-top">{index + 1}</td>
                <td className="whitespace-nowrap border-b px-4 py-3 align-top">{dayjs(row.editedAt).format("DD-MM-YYYY, hh:mm A")}</td>
                <td className="border-b px-4 py-3 align-top">{[row.editedBy?.firstName, row.editedBy?.middleName, row.editedBy?.lastName].filter(Boolean).join(" ") || "-"}</td>
                <td className="border-b px-4 py-3 align-top font-medium">{row.change.label}</td>
                <td className="whitespace-pre-wrap break-words border-b px-4 py-3 align-top">{displayValue(row.change.field, row.change.oldValue)}</td>
                <td className="whitespace-pre-wrap break-words border-b px-4 py-3 align-top">{displayValue(row.change.field, row.change.newValue)}</td>
              </tr>
            )) : <tr><td colSpan={6} className="px-4 py-10 text-center text-borderGray">{record.editHistory?.length ? "No edit history found for the selected dates" : "No edit history available"}</td></tr>}
          </tbody>
        </table>
      </div>
    </MuiModal>
  );
};

export default DailyLogEditHistory;
