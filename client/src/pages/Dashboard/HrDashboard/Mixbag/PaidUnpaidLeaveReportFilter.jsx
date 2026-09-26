import { useEffect, useState } from "react";
import { Autocomplete, MenuItem, TextField } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";

const PaidUnpaidLeaveReportFilter = ({
  open,
  onClose,
  value,
  onApply,
  payPeriods,
  leaveTypes,
  employees,
}) => {
  const [filters, setFilters] = useState(value);

  useEffect(() => {
    if (open) setFilters(value);
  }, [open, value]);

  const reset = () => {
    const defaults = { month: payPeriods[0]?.value || "", leaveType: "All", employee: "" };
    setFilters(defaults);
    onApply(defaults);
  };

  return (
    <MuiModal open={open} onClose={onClose} title="Advanced Search" widthClass="w-1/2">
      <div className="flex flex-col gap-5 p-3">
        <div className="grid grid-cols-[170px_1fr] items-center gap-4">
          <span className="text-right text-sm text-gray-600">Select Pay Period</span>
          <TextField
            select
            size="small"
            value={filters?.month || ""}
            onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value }))}
          >
            {payPeriods.map((period) => (
              <MenuItem key={period.value} value={period.value}>{period.label}</MenuItem>
            ))}
          </TextField>
        </div>
        <div className="grid grid-cols-[170px_1fr] items-center gap-4">
          <span className="text-right text-sm text-gray-600">Leave Type</span>
          <TextField
            select
            size="small"
            value={filters?.leaveType || "All"}
            onChange={(event) => setFilters((current) => ({ ...current, leaveType: event.target.value }))}
          >
            <MenuItem value="All">All</MenuItem>
            {leaveTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
        </div>
        <div className="grid grid-cols-[170px_1fr] items-center gap-4">
          <span className="text-right text-sm text-gray-600">Employee Name</span>
          <Autocomplete
            size="small"
            options={employees}
            value={employees.find(({ value: id }) => id === filters?.employee) || null}
            getOptionLabel={(option) => option.label || ""}
            isOptionEqualToValue={(option, selected) => option.value === selected.value}
            onChange={(_, option) => setFilters((current) => ({ ...current, employee: option?.value || "" }))}
            noOptionsText="No options"
            renderInput={(params) => <TextField {...params} placeholder="Select Employee Name" />}
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

export default PaidUnpaidLeaveReportFilter;
