import React, { useMemo, useState } from "react";
import { Badge, Tooltip } from "@mui/material";
import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import PrimaryButton from "../../components/PrimaryButton";
import { bookedSlotsForDay, dateKeysInRange } from "./meetingBookingDates";

const MultiSelectDay = ({ day, selectedDateKeys, allowedDateKeys, bookings, conflictDateKeys, ...other }) => {
  const key = day.format("YYYY-MM-DD");
  const busySlots = bookedSlotsForDay(key, bookings);
  const selected = selectedDateKeys.includes(key);
  const conflict = conflictDateKeys.includes(key);
  const title = busySlots.length
    ? `Booked: ${busySlots.map((slot) => slot.label).join(", ")}`
    : "No bookings";
  return (
    <Tooltip title={title} arrow>
      <Badge badgeContent={busySlots.length} color={conflict ? "error" : "primary"} overlap="circular">
        <PickersDay
          {...other}
          day={day}
          selected={selected}
          disabled={other.disabled || !allowedDateKeys.includes(key)}
          sx={conflict ? { border: "2px solid #d32f2f", bgcolor: selected ? "#1e3d73" : undefined } : undefined}
        />
      </Badge>
    </Tooltip>
  );
};

const MeetingDateSelector = ({
  startDate,
  endDate,
  selectedDateKeys,
  onChange,
  bookings,
  startTime,
  endTime,
}) => {
  const [focusedDate, setFocusedDate] = useState(null);
  const allowedDateKeys = useMemo(() => dateKeysInRange(startDate, endDate), [startDate, endDate]);
  const conflictDateKeys = useMemo(() => {
    if (!startTime || !endTime) return [];
    return allowedDateKeys.filter((key) => {
      const start = dayjs(key).hour(dayjs(startTime).hour()).minute(dayjs(startTime).minute()).second(0);
      const end = dayjs(key).hour(dayjs(endTime).hour()).minute(dayjs(endTime).minute()).second(0);
      return bookedSlotsForDay(key, bookings).some((slot) => start.isBefore(slot.end) && end.isAfter(slot.start));
    });
  }, [allowedDateKeys, bookings, endTime, startTime]);
  const selectedConflicts = selectedDateKeys.filter((key) => conflictDateKeys.includes(key));
  const focusedKey = focusedDate?.format("YYYY-MM-DD") || selectedDateKeys[0] || allowedDateKeys[0];
  const focusedBookings = focusedKey ? bookedSlotsForDay(focusedKey, bookings) : [];

  const toggleDate = (value) => {
    if (!value) return;
    const key = value.format("YYYY-MM-DD");
    if (!allowedDateKeys.includes(key)) return;
    setFocusedDate(value);
    onChange(selectedDateKeys.includes(key)
      ? selectedDateKeys.filter((item) => item !== key)
      : [...selectedDateKeys, key].sort());
  };

  return (
    <div className="col-span-2 rounded-lg border border-gray-300 p-3 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-primary">The date range is selected. Toggle individual days or select weekdays. Blue numbers show booked slots.</div>
        <div className="flex gap-2">
          <PrimaryButton title="Select Weekdays" type="button" fontSize="text-xs leading-4" padding="px-3 py-1" handleSubmit={() => onChange(allowedDateKeys.filter((key) => ![0, 6].includes(dayjs(key).day())))} />
          <PrimaryButton title="Clear" type="button" fontSize="text-xs leading-4" padding="px-3 py-1" handleSubmit={() => onChange([])} />
        </div>
      </div>
      <DateCalendar
        value={focusedDate || dayjs(startDate)}
        onChange={toggleDate}
        minDate={dayjs().startOf("day")}
        slots={{ day: MultiSelectDay }}
        slotProps={{ day: { selectedDateKeys, allowedDateKeys, bookings, conflictDateKeys } }}
        sx={{ maxWidth: "100%", margin: "0 auto" }}
      />
      <div className="text-sm text-gray-600">
        {selectedDateKeys.length} selected · {selectedConflicts.length} conflicting with the chosen time
      </div>
      {focusedKey && (
        <div className="mt-2 rounded bg-gray-50 p-2 text-sm">
          <div className="font-medium">Booked on {dayjs(focusedKey).format("DD MMM YYYY")}</div>
          <div>{focusedBookings.length ? focusedBookings.map((slot) => slot.label).join(", ") : "No booked slots"}</div>
        </div>
      )}
      {selectedConflicts.length > 0 && (
        <div className="mt-2 text-sm text-red-600">Conflicts: {selectedConflicts.map((key) => dayjs(key).format("DD MMM")).join(", ")}. Remove these dates or change the time.</div>
      )}
    </div>
  );
};

export default MeetingDateSelector;
