import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";

const LeaveHistoryReportFilter = ({
  open,
  onClose,
  value,
  onApply,
  employees,
  defaults,
}) => {
  const [filters, setFilters] = useState(value);

  useEffect(() => {
    if (open) setFilters(value);
  }, [open, value]);

  const reset = () => {
    setFilters(defaults);
    onApply(defaults);
  };

  return (
    <MuiModal open={open} onClose={onClose} title="Advanced Search" widthClass="w-1/2">
      <div className="flex flex-col gap-5 p-3">
        <div className="grid grid-cols-[170px_1fr] items-center gap-4">
          <span className="text-right text-sm text-gray-600">Employee Name</span>
          <Autocomplete
            size="small"
            options={employees}
            value={
              employees.find(({ value: id }) => id === filters?.employee) ||
              employees[0] ||
              null
            }
            getOptionLabel={(option) => option.label || ""}
            isOptionEqualToValue={(option, selected) => option.value === selected.value}
            onChange={(_, option) =>
              setFilters((current) => ({ ...current, employee: option?.value || "" }))
            }
            noOptionsText="No options"
            renderInput={(params) => <TextField {...params} placeholder="All" />}
          />
        </div>
        <div className="grid grid-cols-[170px_1fr] items-center gap-4">
          <span className="text-right text-sm text-gray-600">From Date</span>
          <DatePicker
            label="From Date"
            format="DD-MM-YYYY"
            value={filters?.fromDate ? dayjs(filters.fromDate) : null}
            maxDate={filters?.toDate ? dayjs(filters.toDate) : undefined}
            onChange={(date) =>
              setFilters((current) => ({
                ...current,
                fromDate: date?.isValid() ? date.format("YYYY-MM-DD") : "",
              }))
            }
            slotProps={{ textField: { size: "small" } }}
          />
        </div>
        <div className="grid grid-cols-[170px_1fr] items-center gap-4">
          <span className="text-right text-sm text-gray-600">To Date</span>
          <DatePicker
            label="To Date"
            format="DD-MM-YYYY"
            value={filters?.toDate ? dayjs(filters.toDate) : null}
            minDate={filters?.fromDate ? dayjs(filters.fromDate) : undefined}
            onChange={(date) =>
              setFilters((current) => ({
                ...current,
                toDate: date?.isValid() ? date.format("YYYY-MM-DD") : "",
              }))
            }
            slotProps={{ textField: { size: "small" } }}
          />
        </div>
        <div className="flex justify-end gap-3 pt-8">
          <SecondaryButton title="Reset" handleSubmit={reset} />
          <PrimaryButton title="Apply" handleSubmit={() => onApply(filters)} />
        </div>
      </div>
    </MuiModal>
  );
};

export default LeaveHistoryReportFilter;
