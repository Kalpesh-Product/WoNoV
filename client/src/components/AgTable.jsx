import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { TextField, MenuItem, Chip } from "@mui/material";
import MuiAside from "./MuiAside";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import { IoIosSearch } from "react-icons/io";

const AgTableComponent = React.memo(
  ({
    data,
    columns,
    dropdownColumns = [],
    paginationPageSize,
    exportData,
    hideFilter,
    rowSelection,
    search,
    tableTitle,
    handleClick,
    buttonTitle,
    tableHeight,
    enableCheckbox, // ✅ New prop to enable checkboxes
    getRowStyle,
  }) => {
    const [filteredData, setFilteredData] = useState(data);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});
    const [appliedFilters, setAppliedFilters] = useState({});
    const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]); // ✅ Track selected rows
    const [isTableInView, setTableInView] = useState(true); // ✅ Track table visibility

    const tableRef = useRef(null); // ✅ Reference to track table visibility
    const gridRef = useRef(null);

    const tableRefCurrent = tableRef.current;

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setTableInView(entry.isIntersecting);
        },
        { threshold: 0.6 } // 20% of the table must be visible
      );

      if (tableRefCurrent) {
        observer.observe(tableRefCurrent);
      }

      return () => {
        if (tableRefCurrent) observer.unobserve(tableRefCurrent);
      };
    }, [tableRefCurrent]);

    useEffect(() => {
      if (data && data.length > 0) {
        setFilteredData(data);
      }
    }, [data]);

    const defaultColDef = {
      resizable: true,
      sortable: true,
      autoHeight: true,
    };

    // Get unique values for dropdown columns
    const columnOptions = useMemo(() => {
      const options = {};
      dropdownColumns.forEach((col) => {
        options[col] = [...new Set(data.map((row) => row[col]))];
      });
      return options;
    }, [data, dropdownColumns]);

    const handleSearch = (event) => {
      const query = event.target.value.toLowerCase();
      setSearchQuery(query);
      if (!query) {
        setFilteredData(data);
        return;
      }
      const filtered = data.filter((row) =>
        Object.values(row).some((value) =>
          value?.toString().toLowerCase().includes(query)
        )
      );
      setFilteredData(filtered);
    };

    const handleFilterChange = (field, value) => {
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const removeFilter = (field) => {
      setAppliedFilters((prev) => {
        const updatedFilters = { ...prev };
        delete updatedFilters[field];
        return updatedFilters;
      });
      setFilters((prev) => {
        const updatedFilters = { ...prev };
        delete updatedFilters[field];
        return updatedFilters;
      });
      applyFilters();
    };

    const applyFilters = () => {
      setAppliedFilters(filters);
      const filtered = data.filter((row) => {
        return Object.keys(filters).every((field) => {
          const filterValue = filters[field]?.toLowerCase();
          return (
            !filterValue ||
            row[field]?.toString().toLowerCase().includes(filterValue)
          );
        });
      });
      setFilteredData(filtered);
      setFilterDrawerOpen(false);
    };

    const handleSelectionChanged = useCallback((params) => {
      setSelectedRows(params.api.getSelectedRows()); // ✅ Update selected rows
    }, []);

    const handleActionClick = () => {
      alert(`Performing action on ${selectedRows.length} selected items!`);
      // You can implement delete, edit, or any batch operation here
    };

    // ✅ Modify columns to conditionally include checkboxes
    const modifiedColumns = useMemo(() => {
      if (!enableCheckbox) return columns; // No change if checkboxes are not needed
      return [
        {
          field: "",
          headerCheckboxSelection: true, // Select all checkbox in header
          checkboxSelection: true, // Enable row selection checkboxes
          width: 50,
        },
        ...columns, // Append existing columns after checkbox column
      ];
    }, [columns, enableCheckbox]);

    return (
      <div className="border-b-[1px] border-borderGray">
        <div className="flex justify-between items-center py-2">
          {search && (
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search"
              InputProps={{
                startAdornment: (
                  <IoIosSearch size={20} style={{ marginRight: 8 }} />
                ),
              }}
            />
          )}
          {hideFilter ? (
            ""
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex justify-end items-center w-full">
                <PrimaryButton
                  title={<MdFilterAlt />}
                  handleSubmit={() => setFilterDrawerOpen(true)}
                  externalStyles={"rounded-r-none"}
                />
                <SecondaryButton
                  title={<MdFilterAltOff />}
                  externalStyles={"rounded-l-none"}
                  handleSubmit={() => {
                    setFilters({});
                    setAppliedFilters({});
                    setSearchQuery("");
                    setFilteredData(data);
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {Object.keys(appliedFilters).map((field) =>
            appliedFilters[field] ? (
              <Chip
                key={field}
                label={`${field}: ${appliedFilters[field]}`}
                onDelete={() => removeFilter(field)}
              />
            ) : null
          )}
        </div>
        {tableTitle && (
          <div className="flex items-center justify-between py-4">
            <span className="font-pmedium text-title text-primary uppercase">
              {tableTitle}
            </span>
            <div className="flex items-center gap-4">
              {exportData ? (
                <PrimaryButton
                  title={"Export"}
                  handleSubmit={() => {
                    if (gridRef.current) {
                      gridRef.current.api.exportDataAsCsv({
                        fileName: `${tableTitle || "table-data"}.csv`,
                      });
                    }
                  }}
                />
              ) : (
                ""
              )}
              {buttonTitle ? (
                <PrimaryButton title={buttonTitle} handleSubmit={handleClick} />
              ) : (
                ""
              )}
            </div>
          </div>
        )}

        <MuiAside
          open={isFilterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          title="Advanced Filter">
          {columns.map((column) =>
            dropdownColumns.includes(column.field) ? (
              <TextField
                key={column.field}
                label={column.headerName}
                variant="outlined"
                size="small"
                select
                fullWidth
                margin="normal"
                value={filters[column.field] || ""}
                onChange={(e) =>
                  handleFilterChange(column.field, e.target.value)
                }>
                <MenuItem value="">All</MenuItem>
                {columnOptions[column.field]?.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                key={column.field}
                label={column.headerName}
                variant="outlined"
                size="small"
                fullWidth
                margin="normal"
                onChange={(e) =>
                  handleFilterChange(column.field, e.target.value)
                }
              />
            )
          )}
          <div className="flex items-center justify-center py-4">
            <PrimaryButton title="Apply Filters" handleSubmit={applyFilters} />
          </div>
        </MuiAside>

        <div
          ref={tableRef}
          className="ag-theme-quartz border-none w-full font-pregular"
          style={{ height: tableHeight || 500 }}>
          <AgGridReact
            ref={gridRef}
            rowData={filteredData}
            columnDefs={modifiedColumns} // ✅ Use modified columns with checkboxes
            defaultColDef={defaultColDef}
            pagination={false}
            paginationPageSize={paginationPageSize}
            rowHeight={50}
            rowSelection={enableCheckbox ? "multiple" : rowSelection} // ✅ Enable multiple selection only when checkboxes are on
            onSelectionChanged={handleSelectionChanged}
            getRowStyle={getRowStyle}
            className="font-pregular"
            rowBuffer={20} // ✅ Defines how many extra rows to render outside viewport
            cacheBlockSize={paginationPageSize} // ✅ Controls how many rows to fetch per block
            suppressRowVirtualization={false} // ✅ Ensures row virtualization is active
            suppressColumnVirtualisation={false} // ✅ Ensures column virtualization is active
          />
        </div>

        {/* Floating Action Button */}
        {selectedRows.length > 0 && isTableInView && (
          <div
            className="fixed bottom-8 right-[38rem] bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition motion-preset-slide-up-sm"
            onClick={handleActionClick}>
            Mark as Done ({selectedRows.length})
          </div>
        )}
      </div>
    );
  }
);

AgTableComponent.displayName = "AgTable";

const AgTable = React.memo(AgTableComponent);

export default AgTable;
