import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useContext,
} from "react";
import { AgGridReact } from "ag-grid-react";
import { createPortal } from "react-dom";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { TextField, MenuItem, Chip, Pagination } from "@mui/material";
import MuiAside from "./MuiAside";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import { IoIosSearch } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import TableDateFilter from "./TableDateFilter";
import {
  TableHeaderBorderContext,
  shouldHideTableHeaderDivider,
} from "./TableHeaderBorderContext";
import { shouldStackTableToolbar } from "../utils/tableToolbarSizing";
import {
  filterTableRows,
  getTableDateFields,
  getAdvancedFilterColumns,
  shouldShowTableDateFilter,
} from "../utils/tableFilters";
const AgTableComponent = React.memo(
  ({
    data = [],
    columns,
    dropdownColumns = [],
    paginationPageSize,
    exportData,
    exportAction,
    exportButtonContainer,
    exportInTitleRow = false,
    hideFilter,
    advancedFilterAction,
    rowSelection,
    search = true,
    showTableControls = true,
    dateColumn,
    showDateControls,
    toolbarDateControls,
    toolbarActions,
    compactToolbar = false,
    dateRangePlaceholders = false,
    tableTitle,
    titleCenterContent,
    titleRightContent,
    handleClick,
    buttonTitle,
    exportButtonExternalStyles,
    headerActions,
    summaryContent,
    exportBeforeHeaderActions = false,
    searchRowActions,
    searchRowActionsPosition = "left",
    searchBottomContent,
    tableHeight = 400,
    gridHeight = 440,
    fillAvailableHeight = false,
    enableCheckbox, // ✅ New prop to enable checkboxes
    getRowStyle,
    getRowId,
    checkAll,
    disabled,
    handleBatchAction,
    isRowSelectable,
    showDisabledCheckboxes = false,
    checkboxTooltip,
    batchButton,
    hideTitle,
    hideHeaderDivider,
    tableRef,
    onSelectionChange,
    selectionResetKey,
    isPagination = false,
    serverPagination,
    paginationPage = 1,
    paginationTotal = 0,
    onPaginationPageChange,
    pageSizeOptions = [],
    onPaginationPageSizeChange,
    serverSearch = false,
    searchValue = "",
    onSearchChange,
    headerBottomContent,
    processExportCell,
  }) => {
    const borderedSectionTitle = useContext(TableHeaderBorderContext);
    const hideToolbarDivider = shouldHideTableHeaderDivider(
      hideHeaderDivider,
      borderedSectionTitle,
      Boolean(!hideTitle && tableTitle),
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [tableDateRange, setTableDateRange] = useState(null);
    const [chosenDateField, setChosenDateField] = useState("");
    const dateFields = useMemo(
      () => getTableDateFields(columns, data, dateColumn),
      [columns, data, dateColumn],
    );
    const dateControlsEnabled = shouldShowTableDateFilter(
      columns,
      dateColumn,
      showDateControls,
    );
    const effectiveDateField = dateFields.some(
      (entry) => entry.field === chosenDateField,
    )
      ? chosenDateField
      : dateFields.find((entry) => entry.field === dateColumn)?.field ||
        dateFields[0]?.field ||
        "";
    const [filters, setFilters] = useState({});
    const [appliedFilters, setAppliedFilters] = useState({});
    const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]); // ✅ Track selected rows
    const gridRef = useRef(null);
    const toolbarRef = useRef(null);
    const toolbarDateRef = useRef(null);
    const toolbarActionsRef = useRef(null);
    const [stackToolbar, setStackToolbar] = useState(false);
    const previousServerPageRef = useRef(paginationPage);
    const previousSelectionResetKeyRef = useRef(selectionResetKey);

    useEffect(() => {
      if (previousSelectionResetKeyRef.current === selectionResetKey) return;
      previousSelectionResetKeyRef.current = selectionResetKey;
      gridRef.current?.api?.deselectAll();
    }, [selectionResetKey]);

    useEffect(() => {
      if (!toolbarRef.current || typeof ResizeObserver === "undefined") return;
      const measure = () => {
        if (!toolbarRef.current) return;
        const actions = toolbarActionsRef.current;
        const buttons = Array.from(actions?.querySelectorAll("button") || []);
        const buttonWidth = buttons.reduce(
          (total, button) => total + button.getBoundingClientRect().width,
          0,
        );
        const actionsWidth = Math.max(
          buttonWidth + Math.max(0, buttons.length - 1) * 16,
          ...Array.from(actions?.children || []).map(
            (child) => child.scrollWidth,
          ),
        );
        const dateWidth = Math.max(
          0,
          ...Array.from(toolbarDateRef.current?.children || []).map(
            (child) => child.scrollWidth,
          ),
        );
        setStackToolbar(
          shouldStackTableToolbar({
            width: toolbarRef.current.clientWidth,
            searchWidth: showTableControls && search ? (compactToolbar ? 210 : 280) : 0,
            dateWidth,
            actionsWidth,
            gap: compactToolbar ? 8 : 12,
          }),
        );
      };
      const observer = new ResizeObserver(measure);
      [toolbarRef.current, toolbarDateRef.current, toolbarActionsRef.current]
        .filter(Boolean)
        .forEach((element) => observer.observe(element));
      measure();
      return () => observer.disconnect();
    }, [
      showTableControls,
      search,
      toolbarDateControls,
      toolbarActions,
      compactToolbar,
      headerActions,
      searchRowActions,
      buttonTitle,
      advancedFilterAction,
      exportAction,
      exportData,
    ]);

    const hasCustomDateControls = toolbarDateControls !== undefined;
    const filteredData = useMemo(
      () =>
        filterTableRows(data || [], {
          search:
            showTableControls && search && !serverSearch ? searchQuery : "",
          filters: showTableControls ? appliedFilters : {},
          dateRange:
            showTableControls && dateControlsEnabled && !hasCustomDateControls
              ? tableDateRange
              : null,
          dateField: effectiveDateField,
        }),
      [
        data,
        searchQuery,
        search,
        serverSearch,
        appliedFilters,
        tableDateRange,
        effectiveDateField,
        dateControlsEnabled,
        hasCustomDateControls,
        showTableControls,
      ],
    );

    useEffect(() => {
      if (serverSearch) setSearchQuery(searchValue || "");
    }, [searchValue, serverSearch]);

    useEffect(() => {
      if (tableRef && gridRef.current) {
        tableRef.current = gridRef.current;
      }
    }, [gridRef, tableRef]);

    useEffect(() => {
      const previousPage = previousServerPageRef.current;
      previousServerPageRef.current = paginationPage;

      if (!serverPagination || previousPage === paginationPage) return;

      const frameId = requestAnimationFrame(() => {
        gridRef.current?.api?.ensureIndexVisible(0, "top");
      });

      return () => cancelAnimationFrame(frameId);
    }, [paginationPage, serverPagination]);

    const defaultColDef = useMemo(
      () => ({
        resizable: true,
        sortable: true,
        autoHeight: true,
      }),
      [],
    );

    // Get unique values for dropdown columns
    const columnOptions = useMemo(() => {
      const options = {};
      dropdownColumns.forEach((col) => {
        options[col] = [...new Set(data.map((row) => row[col]))];
      });
      return options;
    }, [data, dropdownColumns]);

    const handleSearch = (event) => {
      const rawQuery = event.target.value;
      const query = rawQuery.toLowerCase();
      setSearchQuery(query);
      if (serverSearch) {
        onSearchChange?.(rawQuery);
        return;
      }
    };

    const handleFilterChange = (field, value) => {
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    // const removeFilter = (field) => {
    //   setAppliedFilters((prev) => {
    //     const updatedFilters = { ...prev };
    //     delete updatedFilters[field];
    //     return updatedFilters;
    //   });
    //   setFilters((prev) => {
    //     const updatedFilters = { ...prev };
    //     delete updatedFilters[field];
    //     return updatedFilters;
    //   });
    //   applyFilters();
    // };

    // const applyFilters = () => {
    //   setAppliedFilters(filters);
    //   const filtered = data.filter((row) => {
    //     return Object.keys(filters).every((field) => {
    //       const filterValue = filters[field]?.toLowerCase();
    //       return (
    //         !filterValue ||
    //         row[field]?.toString().toLowerCase().includes(filterValue)
    //       );
    //     });
    //   });
    //   setFilteredData(filtered);
    //   setFilterDrawerOpen(false);
    // };

    const applyFilters = (filtersToApply = filters) => {
      const safeFilters =
        filtersToApply && typeof filtersToApply === "object"
          ? filtersToApply?.nativeEvent || filtersToApply?.target
            ? filters
            : filtersToApply
          : filters;

      setAppliedFilters(safeFilters);
      setFilterDrawerOpen(false);
    };

    const removeFilter = (field) => {
      const updatedFilters = { ...appliedFilters };
      delete updatedFilters[field];
      setFilters(updatedFilters);
      setAppliedFilters(updatedFilters);
    };

    const clearFilters = () => {
      setFilters({});
      setAppliedFilters({});
      setSearchQuery("");
      if (serverSearch) onSearchChange?.("");
      setTableDateRange(null);
    };

    const handleSelectionChanged = useCallback(
      (params) => {
        const rows = params.api.getSelectedRows();
        setSelectedRows(rows);
        if (typeof onSelectionChange === "function") {
          onSelectionChange(rows);
        }
      },
      [onSelectionChange],
    );

    const handleActionClick = () => {
      handleBatchAction(selectedRows);
    };

    const formatExportCell = useCallback(
      (params) => {
        const field = params?.column?.getColDef?.()?.field || "";
        const value = params?.value;

        const pageFormattedValue = processExportCell?.(params);
        if (pageFormattedValue !== undefined) return pageFormattedValue;

        if (value === null || value === undefined) return "";

        const normalizedField = field.toLowerCase();
        const shouldPreserveAsText =
          normalizedField.includes("date") ||
          normalizedField.includes("time") ||
          /(at)$/i.test(field);

        const stringValue = String(value);

        if (!shouldPreserveAsText) return stringValue;

        // Prefix with an apostrophe so Excel keeps the literal date/time text.
        return stringValue.startsWith("'") ? stringValue : `'${stringValue}`;
      },
      [processExportCell],
    );

    const renderExportButton = () =>
      exportAction !== undefined ? (
        exportAction
      ) : exportData ? (
        <PrimaryButton
          title={"Export"}
          externalStyles={exportButtonExternalStyles}
          handleSubmit={() => {
            if (gridRef.current) {
              gridRef.current.api.exportDataAsCsv({
                fileName: `${tableTitle || "table-data"}.csv`,
                allColumns: true,
                columnKeys: getExportColumnKeys(),
                processCellCallback: formatExportCell,
              });
            }
          }}
        />
      ) : (
        ""
      );

    const getExportColumnKeys = useCallback(() => {
      if (!gridRef.current?.api) return undefined;

      return gridRef.current.api
        .getAllGridColumns()
        .filter((column) => {
          const colDef = column.getColDef?.() || {};
          const field = (colDef.field || "").toString().toLowerCase();
          const headerName = (colDef.headerName || "").toString().toLowerCase();
          const isActionColumn =
            field.includes("action") || headerName.includes("action");

          return (
            !isActionColumn &&
            !colDef.suppressCsvExport &&
            !colDef.suppressExcelExport
          );
        })
        .map((column) => column.getColId());
    }, []);

    const filterableColumns = useMemo(
      () => getAdvancedFilterColumns(columns),
      [columns],
    );

    const stateSafeColumns = useMemo(
      () =>
        columns.map((column) => {
          if (column.sort === undefined && column.sortIndex === undefined) {
            return column;
          }

          const { sort, sortIndex, ...columnWithoutSortState } = column;
          return {
            ...columnWithoutSortState,
            initialSort: column.initialSort ?? sort,
            initialSortIndex: column.initialSortIndex ?? sortIndex,
          };
        }),
      [columns],
    );

    const modifiedColumns = useMemo(() => {
      if (!enableCheckbox) return stateSafeColumns;

      return [
        {
          field: "",
          headerCheckboxSelection: checkAll, // ✅ Only allow header checkbox when checkAll is true
          checkboxSelection: true,
          showDisabledCheckboxes,
          tooltipValueGetter: checkboxTooltip,
          width: 50,
        },
        ...stateSafeColumns,
      ];
    }, [
      stateSafeColumns,
      enableCheckbox,
      checkAll,
      showDisabledCheckboxes,
      checkboxTooltip,
    ]);

    const effectivePageSize = paginationPageSize || pageSizeOptions?.[0] || 1;

    return (
      <div
        className={`border-b-[1px] border-borderGray ${
          fillAvailableHeight ? "flex flex-col flex-1 min-h-0" : ""
        }`}
      >
        {!hideTitle && tableTitle && (
          titleCenterContent ? (
            <div className="grid grid-cols-1 items-center gap-3 pb-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
              <span className="font-pmedium text-title uppercase text-primary">
                {tableTitle}
              </span>
              <div className="justify-self-center">{titleCenterContent}</div>
              <div className="justify-self-end">{titleRightContent}</div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <span className="font-pmedium text-title uppercase text-primary">
                {tableTitle}
              </span>
              {titleRightContent}
            </div>
          )
        )}

        {exportButtonContainer &&
          createPortal(renderExportButton(), exportButtonContainer)}

        {/* Custom content below title/actions */}
        {headerBottomContent && (
          <div className="w-full">{headerBottomContent}</div>
        )}

        {!hideToolbarDivider && <hr className="my-2" />}

        {summaryContent && (
          <div className="table-toolbar-summary flex flex-wrap items-center justify-end gap-2 pb-3">
            {summaryContent}
          </div>
        )}

        {(showTableControls ||
          exportData ||
          exportAction ||
          toolbarActions ||
          searchRowActions ||
          buttonTitle ||
          headerActions) && (
          <div
            ref={toolbarRef}
            data-stacked={stackToolbar || undefined}
            data-compact={compactToolbar || undefined}
            className={`table-toolbar grid items-center py-2 ${compactToolbar ? "gap-2" : "gap-3"}`}
          >
            {showTableControls && search ? (
              <div className="table-toolbar-search flex min-w-0 flex-wrap items-center gap-3">
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search"
                  sx={{
                    width: "100%",
                    maxWidth: compactToolbar ? 210 : 280,
                    minWidth: 0,
                  }}
                  InputProps={{
                    startAdornment: (
                      <IoIosSearch size={20} style={{ marginRight: 8 }} />
                    ),
                  }}
                />
                {searchRowActionsPosition === "left" && searchRowActions
                  ? searchRowActions
                  : ""}
              </div>
            ) : (
              <></>
            )}
            {showTableControls &&
              (toolbarDateControls !== undefined || dateControlsEnabled) && (
                <div
                  ref={toolbarDateRef}
                  className="table-toolbar-dates flex w-max min-w-0 items-center justify-center justify-self-center"
                  title={
                    toolbarDateControls === undefined && serverPagination
                      ? "Date filter applies to currently loaded rows"
                      : undefined
                  }
                >
                  {toolbarDateControls !== undefined ? (
                    toolbarDateControls
                  ) : (
                    <TableDateFilter
                      fields={dateFields}
                      field={effectiveDateField}
                      onFieldChange={setChosenDateField}
                      range={tableDateRange}
                      onChange={setTableDateRange}
                      showPlaceholders={dateRangePlaceholders}
                      showFieldSelector={dateRangePlaceholders}
                    />
                  )}
                </div>
              )}
            <div
              ref={toolbarActionsRef}
              className={`table-toolbar-actions flex w-max flex-nowrap items-center justify-end justify-self-end ${compactToolbar ? "gap-2" : "gap-4"}`}
            >
              {buttonTitle && (
                <PrimaryButton
                  title={buttonTitle}
                  handleSubmit={handleClick}
                  disabled={disabled}
                />
              )}
              {headerActions}
              {searchRowActionsPosition === "right" && searchRowActions
                ? searchRowActions
                : ""}
              {searchRowActionsPosition === "aboveFilter"
                ? searchRowActions
                : null}
              {toolbarActions}
              {!exportButtonContainer && renderExportButton()}
              {showTableControls && advancedFilterAction}
              {!showTableControls ||
              hideFilter ||
              advancedFilterAction ||
              !filterableColumns.length ? (
                ""
              ) : (
                <button
                  type="button"
                  aria-label="Advanced filter"
                  className="p-2 hover:bg-gray-200 cursor-pointer rounded-full border-[1px] border-borderGray"
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  <IoFilter />
                </button>
              )}
            </div>
          </div>
        )}
        {showTableControls &&
          serverPagination &&
          ((dateControlsEnabled && tableDateRange) ||
            Object.values(appliedFilters).some(Boolean)) && (
            <p className="pb-2 text-xs text-gray-500">
              Date and advanced filters apply to loaded rows on this page.
            </p>
          )}
        {searchBottomContent ? (
          <div className="w-full pb-3">{searchBottomContent}</div>
        ) : null}
        <div className="flex gap-2">
          {showTableControls &&
            Object.keys(appliedFilters).map((field) =>
              appliedFilters[field] ? (
                <Chip
                  key={field}
                  label={`${field}: ${appliedFilters[field]}`}
                  onDelete={() => removeFilter(field)}
                />
              ) : null,
            )}
        </div>

        <MuiAside
          open={isFilterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          title="Advanced Filter"
        >
          {filterableColumns.map((column) =>
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
                value={filters[column.field] || ""}
                onChange={(e) =>
                  handleFilterChange(column.field, e.target.value)
                }
              />
            ),
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
          className={`ag-theme-quartz border-none w-full font-pregular ${
            fillAvailableHeight ? "flex-1 min-h-0" : ""
          }`}
          style={fillAvailableHeight ? undefined : { height: gridHeight }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={filteredData}
            getRowId={getRowId}
            columnDefs={modifiedColumns} // ✅ Use modified columns with checkboxes
            defaultColDef={defaultColDef}
            pagination={isPagination && !serverPagination}
            isRowSelectable={isRowSelectable}
            tooltipShowDelay={checkboxTooltip ? 300 : undefined}
            paginationPageSize={paginationPageSize}
            // paginationPageSize={false}
            suppressCellSelection={false}
            enableCellTextSelection={true}
            rowHeight={50}
            rowSelection={
              enableCheckbox ? (checkAll ? "multiple" : "single") : rowSelection
            }
            suppressRowClickSelection={enableCheckbox}
            onSelectionChanged={handleSelectionChanged}
            getRowStyle={getRowStyle}
            className="font-pregular"
            rowBuffer={20} // ✅ Defines how many extra rows to render outside viewport
            cacheBlockSize={paginationPageSize} // ✅ Controls how many rows to fetch per block
            suppressRowVirtualization={false} // ✅ Ensures row virtualization is active
            suppressColumnVirtualisation={false} // ✅ Ensures column virtualization is active
            suppressScrollOnNewData
          />
        </div>
        {serverPagination && paginationTotal > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-4">
            <div className="flex flex-wrap items-center gap-3">
              {pageSizeOptions?.length > 0 && onPaginationPageSizeChange && (
                <TextField
                  select
                  size="small"
                  value={paginationPageSize || pageSizeOptions[0]}
                  onChange={(e) =>
                    onPaginationPageSizeChange?.(Number(e.target.value))
                  }
                  sx={{
                    minWidth: 88,
                    "& .MuiOutlinedInput-input": {
                      py: 1,
                    },
                  }}
                >
                  {pageSizeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <span className="font-pregular text-sm text-gray-600">
                {`${(paginationPage - 1) * effectivePageSize + 1}-${Math.min(
                  paginationPage * effectivePageSize,
                  paginationTotal,
                )} of ${paginationTotal}`}
              </span>
            </div>

            <Pagination
              page={paginationPage}
              count={Math.ceil(paginationTotal / effectivePageSize)}
              onChange={(_, nextPage) => onPaginationPageChange?.(nextPage)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </div>
        )}

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
  },
);

AgTableComponent.displayName = "AgTable";

const AgTable = React.memo(AgTableComponent);

export default AgTable;
