import { useState } from "react";
import { Popover } from "@mui/material";
import dayjs from "dayjs";
import { MdCalendarToday } from "react-icons/md";
import { DateRangePicker } from "react-date-range";
import MuiModal from "../../../components/MuiModal";

export default function SalesEditHistory({ title, editHistory, historyPending, historyError, onClose }) {
  const [historyDateRange, setHistoryDateRange] = useState(null);
  const [historyCalendarAnchor, setHistoryCalendarAnchor] = useState(null);
  const fullHistoryRange = editHistory.length ? {
    startDate: new Date(Math.min(...editHistory.map((entry) => new Date(entry.editedAt).getTime()))),
    endDate: new Date(Math.max(...editHistory.map((entry) => new Date(entry.editedAt).getTime()))),
    key: "selection",
  } : { startDate: new Date(), endDate: new Date(), key: "selection" };
  const activeHistoryRange = historyDateRange || fullHistoryRange;
  const visibleHistory = editHistory.filter((entry) => {
    const date = dayjs(entry.editedAt);
    return !date.isBefore(dayjs(activeHistoryRange.startDate), "day")
      && !date.isAfter(dayjs(activeHistoryRange.endDate), "day");
  }).flatMap((entry) => (entry.changes || []).map((change) => ({ ...entry, change })));
  return (
      <MuiModal open onClose={onClose} title={title} widthClass="w-[calc(100vw-2rem)] max-w-[960px]">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
            {dayjs(activeHistoryRange.startDate).format("DD MMM YYYY")}
          </div>
          <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
            {dayjs(activeHistoryRange.endDate).format("DD MMM YYYY")}
          </div>
          <button type="button" aria-label="Select edit history date range" className="rounded-md bg-primary p-3 text-white" onClick={(event) => setHistoryCalendarAnchor(event.currentTarget)}>
            <MdCalendarToday size={20} />
          </button>
        </div>
        <Popover open={Boolean(historyCalendarAnchor)} anchorEl={historyCalendarAnchor} onClose={() => setHistoryCalendarAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} transformOrigin={{ vertical: "top", horizontal: "center" }}>
          <DateRangePicker ranges={[activeHistoryRange]} onChange={({ selection }) => setHistoryDateRange(selection)} moveRangeOnFirstSelection={false} direction="vertical" />
        </Popover>
        <div className="max-h-[65vh] overflow-auto rounded-md border border-borderGray">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-gray-50 text-primary">
              <tr>
                <th className="border-b px-4 py-3">Sr No</th>
                <th className="border-b px-4 py-3">Edited On</th>
                <th className="border-b px-4 py-3">Edited By</th>
                <th className="border-b px-4 py-3">Field</th>
                <th className="border-b px-4 py-3">Previous Value</th>
                <th className="border-b px-4 py-3">New Value</th>
              </tr>
            </thead>
            <tbody>
              {visibleHistory.length ? visibleHistory.map((entry, index) => (
                <tr key={`${entry._id || entry.editedAt}-${entry.change.field}-${index}`}>
                  <td className="border-b px-4 py-3 align-top">{index + 1}</td>
                  <td className="whitespace-nowrap border-b px-4 py-3 align-top">{dayjs(entry.editedAt).format("DD-MM-YYYY, hh:mm A")}</td>
                  <td className="border-b px-4 py-3 align-top">{[entry.editedBy?.firstName, entry.editedBy?.middleName, entry.editedBy?.lastName].filter(Boolean).join(" ") || "—"}</td>
                  <td className="border-b px-4 py-3 align-top font-medium">{entry.change.label}</td>
                  <td className="whitespace-pre-wrap break-words border-b px-4 py-3 align-top">{entry.change.oldValue || "—"}</td>
                  <td className="whitespace-pre-wrap break-words border-b px-4 py-3 align-top">{entry.change.newValue || "—"}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-borderGray">
                  {historyPending ? "Loading edit history..." : historyError ? "Could not load edit history" : editHistory.length ? "No edit history found for the selected dates" : "No edit history available"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </MuiModal>
  );
}
