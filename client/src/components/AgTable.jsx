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
import { IoFilter } from "react-icons/io5";
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
    tableHeight = 400,
    enableCheckbox, // ✅ New prop to enable checkboxes
    getRowStyle,
    checkAll,
    disabled,
    handleBatchAction,
    isRowSelectable,
    batchButton,
    hideTitle,
    tableRef,
    onSelectionChange,
  }) => {
    const [filteredData, setFilteredData] = useState(data);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});
    const [appliedFilters, setAppliedFilters] = useState({});
    const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]); // ✅ Track selected rows
    const gridRef = useRef(null);

    useEffect(() => {
      if (data && data.length > 0) {
        setFilteredData(data);
      }
    }, [data]);

    useEffect(() => {
      if (tableRef && gridRef.current) {
        tableRef.current = gridRef.current;
      }
    }, [gridRef, tableRef]);

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

    const clearFilters = () => {
      setFilters({});
      setAppliedFilters({});
      setSearchQuery("");
      setFilteredData(data);
    };

    const handleSelectionChanged = useCallback(
      (params) => {
        const rows = params.api.getSelectedRows();
        setSelectedRows(rows);
        if (typeof onSelectionChange === "function") {
          onSelectionChange(rows);
        }
      },
      [onSelectionChange]
    );

    const handleActionClick = () => {
      handleBatchAction(selectedRows);
    };

    const modifiedColumns = useMemo(() => {
      if (!enableCheckbox) return columns;

      return [
        {
          field: "",
          headerCheckboxSelection: checkAll, // ✅ Only allow header checkbox when checkAll is true
          checkboxSelection: true,
          width: 50,
        },
        ...columns,
      ];
    }, [columns, enableCheckbox, checkAll]);

    return (
      <div className="border-b-[1px] border-borderGray">
        <div className=" flex gap-4 items-center">
          <div
            className={`flex items-center ${
              tableTitle
                ? "justify-between w-full items-center"
                : "justify-end w-full"
            } `}
          >
            {!hideTitle && (
              <div className="flex items-center justify-between pb-4">
                <span className="font-pmedium text-title text-primary uppercase">
                  {tableTitle}
                </span>
              </div>
            )}
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
                <PrimaryButton
                  title={buttonTitle}
                  handleSubmit={handleClick}
                  disabled={disabled}
                />
              ) : (
                ""
              )}

              {/* {batchButton ? (
                <div cla>
                  <PrimaryButton
                    title={batchButton || ""}
                    handleSubmit={handleActionClick}
                    disabled={!selectedRows.length > 0}
                  />
                </>
              ) : (
                ""
              )} */}
            </div>
          </div>
        </div>

        <hr className="my-2" />

        <div
          className={`flex ${
            search ? "justify-between" : "justify-end"
          }  items-center py-2`}
        >
          {search ? (
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
          ) : (
            <></>
          )}
          <div className="flex items-center gap-4">
            {hideFilter ? (
              ""
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex justify-end items-center w-full">
                  <div
                    className="p-2 hover:bg-gray-200 cursor-pointer rounded-full border-[1px] border-borderGray"
                    onClick={() => setFilterDrawerOpen(true)}
                  >
                    <IoFilter />
                  </div>
                </div>
              </div>
            )}
          </div>
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

        <MuiAside
          open={isFilterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          title="Advanced Filter"
        >
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
                }
              >
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
          <div className="flex items-center gap-4 justify-center py-4">
            <PrimaryButton title="Apply Filters" handleSubmit={applyFilters} />
            <SecondaryButton
              title="Clear Filters"
              handleSubmit={clearFilters}
            />
          </div>
        </MuiAside>

        <div
          ref={tableRef}
          className="ag-theme-quartz border-none w-full font-pregular"
          style={{ height: 440 }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={filteredData}
            columnDefs={modifiedColumns} // ✅ Use modified columns with checkboxes
            defaultColDef={defaultColDef}
            pagination={false}
            isRowSelectable={isRowSelectable}
            paginationPageSize={paginationPageSize}
            suppressCellSelection={false}
            enableCellTextSelection={true}
            rowHeight={50}
            rowSelection={
              enableCheckbox ? (checkAll ? "multiple" : "single") : rowSelection
            }
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
        {/* {selectedRows.length > 0 && isTableInView && (
          <div
            className="fixed bottom-8 right-[38rem] bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition motion-preset-slide-up-sm"
            onClick={handleActionClick}>
            Mark as Done ({selectedRows.length})
          </div>
        )} */}
      </div>
    );
  }
);

AgTableComponent.displayName = "AgTable";

const AgTable = React.memo(AgTableComponent);

export default AgTable;
