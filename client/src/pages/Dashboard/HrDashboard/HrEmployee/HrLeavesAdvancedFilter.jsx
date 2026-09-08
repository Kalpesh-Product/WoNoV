import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
} from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";

const statusOptions = ["Pending", "Approved", "Rejected"];

const createDefaultFilters = () => ({
  statuses: statusOptions,
  leaveType: "",
  batch: "",
  department: "",
  employee: "",
});

const HrLeavesAdvancedFilter = ({
  open,
  onClose,
  value,
  onApply,
  leaveTypes = [],
  batches = [],
  departments = [],
  employees = [],
}) => {
  const [filters, setFilters] = useState(createDefaultFilters);

  useEffect(() => {
    if (open) setFilters(value || createDefaultFilters());
  }, [open, value]);

  const toggleStatus = (status) => {
    setFilters((current) => ({
      ...current,
      statuses: current.statuses.includes(status)
        ? current.statuses.filter((item) => item !== status)
        : [...current.statuses, status],
    }));
  };

  const resetFilters = () => {
    const defaults = createDefaultFilters();
    setFilters(defaults);
    onApply(defaults);
  };

  return (
    <MuiModal open={open} onClose={onClose} title="Advanced Filter">
      <div className="flex min-w-[42rem] flex-col gap-5 p-2 sm:min-w-0">
        <div className="grid grid-cols-[160px_1fr] items-start gap-4 sm:grid-cols-1">
          <span className="pt-2 text-sm text-gray-600">Status</span>
          <div className="grid grid-cols-2 gap-x-8 sm:grid-cols-1">
            {statusOptions.map((status) => (
              <FormControlLabel
                key={status}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.statuses.includes(status)}
                    onChange={() => toggleStatus(status)}
                  />
                }
                label={status}
              />
            ))}
          </div>
        </div>

        {[
          ["Leave Type", "leaveType", leaveTypes],
          ["Select Batch", "batch", batches],
          ["Select Department", "department", departments],
        ].map(([label, field, options]) => (
          <div
            key={field}
            className="grid grid-cols-[160px_1fr] items-center gap-4 sm:grid-cols-1"
          >
            <span className="text-sm text-gray-600">{label}</span>
            <TextField
              select
              size="small"
              fullWidth
              value={filters[field]}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))
              }
            >
              <MenuItem value="">All</MenuItem>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </div>
        ))}

        <div className="grid grid-cols-[160px_1fr] items-center gap-4 sm:grid-cols-1">
          <span className="text-sm text-gray-600">Employee Name</span>
          <Autocomplete
            size="small"
            options={employees}
            value={
              employees.find((option) => option.value === filters.employee) ||
              null
            }
            getOptionLabel={(option) => option.label || ""}
            isOptionEqualToValue={(option, selected) =>
              option.value === selected.value
            }
            onChange={(_, option) =>
              setFilters((current) => ({
                ...current,
                employee: option?.value || "",
              }))
            }
            noOptionsText="No options"
            renderInput={(params) => (
              <TextField {...params} placeholder="All" />
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <SecondaryButton title="Reset" handleSubmit={resetFilters} />
          <PrimaryButton
            title="Apply"
            handleSubmit={() => onApply(filters)}
          />
        </div>
      </div>
    </MuiModal>
  );
};

export default HrLeavesAdvancedFilter;
