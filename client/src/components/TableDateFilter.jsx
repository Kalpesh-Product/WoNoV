import { useState } from "react";
import { IconButton, MenuItem, Popover, TextField } from "@mui/material";
import { DateRangePicker } from "react-date-range";
import { MdCalendarToday } from "react-icons/md";
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
      <span className="whitespace-nowrap rounded-md border border-primary px-6 py-1 text-content text-gray-600">
        {showPlaceholders && !range
          ? "Start date"
          : dayjs(rangeValue.startDate).format("DD MMM YYYY")}
      </span>
      <span className="whitespace-nowrap rounded-md border border-primary px-6 py-1 text-content text-gray-600">
        {showPlaceholders && !range
          ? "End date"
          : dayjs(rangeValue.endDate).format("DD MMM YYYY")}
      </span>
      <IconButton
        aria-label="Select date range"
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{
          borderRadius: 1,
          bgcolor: "#1E3D73",
          color: "white",
          "&:hover": { bgcolor: "#16345f" },
        }}
      >
        <MdCalendarToday size={19} color="#ffffff" />
      </IconButton>
      {range && (
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
        />
      </Popover>
    </div>
  );
};

export default TableDateFilter;
