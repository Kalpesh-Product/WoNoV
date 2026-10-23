import { useMemo, useState } from "react";
import { Chip, IconButton, TextField } from "@mui/material";
import { IoFilter } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import MuiAside from "../components/MuiAside";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import TableDateFilter from "../components/TableDateFilter";
import { filterTableRows, getTableDateFields } from "../utils/tableFilters";

const useTableControls = (rows = [], columns = []) => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [applied, setApplied] = useState({});
  const [range, setRange] = useState(null);
  const [field, setField] = useState("");
  const [open, setOpen] = useState(false);
  const fields = getTableDateFields(columns, rows);
  const dateField = fields.some((entry) => entry.field === field) ? field : fields[0]?.field || "";
  const filteredRows = useMemo(() => filterTableRows(rows, { search, filters: applied, dateRange: range, dateField }), [rows, search, applied, range, dateField]);
  const clear = () => { setSearch(""); setFilters({}); setApplied({}); setRange(null); };
  const toolbar = (
    <div className="p-4">
      <div className="grid grid-cols-1 items-center gap-3 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <TextField label="Search" size="small" sx={{ minWidth: 0, width: "100%", maxWidth: 280 }} value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <IoIosSearch size={20} className="mr-2" /> }} />
        <TableDateFilter fields={fields} field={dateField} onFieldChange={setField} range={range} onChange={setRange} />
        <div className="flex justify-end"><IconButton aria-label="Advanced filter" onClick={() => setOpen(true)}><IoFilter /></IconButton></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(applied).filter(([, value]) => value).map(([key, value]) => <Chip key={key} label={`${columns.find((column) => column.field === key)?.headerName || key}: ${value}`} onDelete={() => { const next = { ...applied }; delete next[key]; setApplied(next); setFilters(next); }} />)}
      </div>
      <MuiAside title="Advanced Filter" open={open} onClose={() => setOpen(false)}>
        {columns.filter((column) => column.field && !/action/i.test(column.field)).map((column) => <TextField key={column.field} label={column.headerName || column.field} fullWidth size="small" margin="normal" value={filters[column.field] || ""} onChange={(event) => setFilters((previous) => ({ ...previous, [column.field]: event.target.value }))} />)}
        <div className="flex justify-center gap-4 py-4">
          <PrimaryButton title="Apply Filters" handleSubmit={() => { setApplied(filters); setOpen(false); }} />
          <SecondaryButton title="Clear Filters" handleSubmit={clear} />
        </div>
      </MuiAside>
    </div>
  );
  return { filteredRows, toolbar };
};

export default useTableControls;
