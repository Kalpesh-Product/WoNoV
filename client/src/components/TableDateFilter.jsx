import { useState } from "react";
import { IconButton, MenuItem, Popover, TextField } from "@mui/material";
import { DateRangePicker } from "react-date-range";
import { MdCalendarToday, MdClose } from "react-icons/md";
import dayjs from "dayjs";
import { getCurrentMonthDateRange } from "../utils/tableFilters";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const TableDateFilter = ({
  fields,
  field,
  onFieldChange,
  range,
  onChange,
  showPlaceholders = false,
  showFieldSelector = false,
  showClearButton = true,
  maxDate,
}) => {
  const [anchor, setAnchor] = useState(null);
  const unavailable = !fields.length;
  const dateLabel = (
    fields.find((entry) => entry.field === field)?.label ||
    field ||
    "date"
  )
    .replace(/Raw$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
  const rangeValue = range || getCurrentMonthDateRange();
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      title={
        unavailable
          ? "No date field is available for this table"
          : `Filter by ${dateLabel}`
      }
    >
      {showFieldSelector && fields.length > 1 && (
        <TextField
          select
          size="small"
          label="Filter date"
          value={field}
          onChange={(event) => onFieldChange(event.target.value)}
          sx={{ minWidth: 130 }}
        >
          {fields.map((entry) => (
            <MenuItem key={entry.field} value={entry.field}>
              {entry.label}
            </MenuItem>
          ))}
        </TextField>
      )}
      <div className="whitespace-nowrap rounded-md border-[1px] border-primary px-6 py-1">
        <span className="text-content font-pregular text-gray-600">
          {showPlaceholders && !range
            ? "Start date"
            : dayjs(rangeValue.startDate).format("DD MMM YYYY")}
        </span>
      </div>
      <div className="whitespace-nowrap rounded-md border-[1px] border-primary px-6 py-1">
        <span className="text-content font-pregular text-gray-600">
          {showPlaceholders && !range
            ? "End date"
            : dayjs(rangeValue.endDate).format("DD MMM YYYY")}
        </span>
      </div>
      <button
        type="button"
        aria-label="Select date range"
        onClick={(event) => setAnchor(event.currentTarget)}
        className="cursor-pointer rounded-md bg-primary p-2 text-white hover:bg-[#1E3D55]"
      >
        <MdCalendarToday size={19} color="#ffffff" />
      </button>
      {showClearButton && range && (
        <IconButton
          aria-label="Clear date filter"
          title="Show all dates"
          size="small"
          onClick={() => onChange(null)}
        >
          <MdClose />
        </IconButton>
      )}
      {range && unavailable && (
        <span className="text-xs text-gray-500">
          No date data is available to filter these rows.
        </span>
      )}
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <DateRangePicker
          ranges={[{ ...rangeValue, key: "selection" }]}
          onChange={({ selection }) => onChange(selection)}
          moveRangeOnFirstSelection={false}
          direction="vertical"
          maxDate={maxDate}
        />
      </Popover>
    </div>
  );
};

export default TableDateFilter;
