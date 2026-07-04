import React, { useMemo, useState, useRef, useEffect } from "react";
import { DateRangePicker } from "react-date-range";
import { addDays, isWithinInterval } from "date-fns";
import dayjs from "dayjs";
import AgTable from "../AgTable";
import PrimaryButton from "../PrimaryButton";
import humanDate from "../../utils/humanDateForamt";
import { IconButton, Popover } from "@mui/material";
import { MdCalendarToday } from "react-icons/md";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const YearWiseTable = ({
  data = [],
  columns = [],
  dateColumn,
  formatTime = true,
  formatDate = true,
  tableHeight,
  tableTitle,
  buttonTitle,
  buttonDisabled,
  handleSubmit,
  secondaryButtonTitle,
  secondaryButtonDisabled,
  handleSecondarySubmit,
  middleButtonTitle,
  middleButtonDisabled,
  handleMiddleSubmit,
  checkbox,
  checkAll,
  key,
  exportData,
  exportAllColumns = false,
  dropdownColumns = [],
  handleBatchAction,
  batchButton,
  isRowSelectable,
  hideTitle = true,
  search = true,
  onMonthChange,
  onDateFilterChange,
  totalKey = "actualAmount",
  showDateNavigator = false,
  hideDateControls = false,
  selectedDateLabel = "",
  onPreviousDay,
  onNextDay,
  customExportTitle,
  handleCustomExport,
  customExportDisabled = false,
  exportButtonTitle = "Export",
  initialDateRange,
  taskExportDateTimeFormatting = false,
}) => {
  const agGridRef = useRef(null);
  const [exportTable, setExportTable] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const today = useMemo(() => dayjs(), []);

  // const [dateRange, setDateRange] = useState([]);
  const [dateRange, setDateRange] = useState(() =>
    initialDateRange
      ? [
          {
            ...initialDateRange,
            key: initialDateRange.key || "selection",
          },
        ]
      : [],
  );

  const [isUserChangedRange, setIsUserChangedRange] = useState(false);
  // Handle user-initiated date change
  const handleDateRangeChange = (item) => {
    setDateRange([item.selection]);
    setIsUserChangedRange(true); // 👈 mark that the user made a change
  };

  useEffect(() => {
    if (!dateColumn || showDateNavigator || isUserChangedRange) return; // ✅ skip if user manually changed or parent controls date navigation
    // if (!dateColumn || isUserChangedRange) return; // ✅ skip if user manually changed

    if (initialDateRange) {
      setDateRange([
        {
          ...initialDateRange,
          key: initialDateRange.key || "selection",
        },
      ]);
      return;
    }

    if (!data.length) {
      setDateRange([]);
      return;
    }

    const currentMonthStart = today.startOf("month");
    const currentMonthEnd = today.endOf("month");

    const monthHasData = data.some((item) => {
      const date = dayjs(item[dateColumn]);
      return (
        date.isValid() &&
        date.isAfter(currentMonthStart.subtract(1, "day")) &&
        date.isBefore(currentMonthEnd.add(1, "day"))
      );
    });

    if (monthHasData) {
      setDateRange([
        {
          startDate: currentMonthStart.toDate(),
          endDate: currentMonthEnd.toDate(),
          key: "selection",
        },
      ]);
      return;
    }

    const validDates = data
      .map((item) => dayjs(item[dateColumn]))
      .filter((d) => d.isValid())
      .sort((a, b) => b.valueOf() - a.valueOf());

    if (validDates.length > 0) {
      const latest = validDates[0];
      setDateRange([
        {
          startDate: latest.startOf("month").toDate(),
          endDate: latest.endOf("month").toDate(),
          key: "selection",
        },
      ]);
      return;
    }

    setDateRange([
      {
        startDate: addDays(new Date(), -30),
        endDate: new Date(),
        key: "selection",
      },
    ]);
  }, [
    data,
    dateColumn,
    initialDateRange,
    isUserChangedRange,
    showDateNavigator,
    today,
  ]);
  // }, [data, dateColumn, isUserChangedRange, today]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpenCalendar = (e) => setAnchorEl(e.currentTarget);
  const handleCloseCalendar = () => setAnchorEl(null);

  const validDateSet = useMemo(() => {
    const set = new Set();
    data.forEach((item) => {
      const d = dayjs(item[dateColumn]);
      if (d.isValid()) set.add(d.format("YYYY-MM-DD"));
    });
    return set;
  }, [data, dateColumn]);

  const filteredData = useMemo(() => {
    if (
      showDateNavigator ||
      !dateColumn ||
      dateRange.length === 0 ||
      !dateRange[0]
    )
      return data;
    //if (!dateColumn || dateRange.length === 0 || !dateRange[0]) return data;

    const { startDate, endDate } = dateRange[0];
    const start = dayjs(startDate).startOf("day").toDate();
    const end = dayjs(endDate).endOf("day").toDate();

    return data.filter((item) => {
      const itemDate = dayjs(item[dateColumn]);
      if (!itemDate.isValid()) return false;

      return isWithinInterval(itemDate.toDate(), { start, end });
    });
  }, [data, dateColumn, dateRange, showDateNavigator]);
  // }, [data, dateColumn, dateRange]);

  useEffect(() => {
    if (!onDateFilterChange) return;
    onDateFilterChange({
      isDateFilterActive: isUserChangedRange,
      filteredData,
      selectedRange: dateRange[0] || null,
    });
  }, [dateRange, filteredData, isUserChangedRange, onDateFilterChange]);

  const rangeTotal = useMemo(() => {
    if (!filteredData.length || !totalKey) return 0;

    return filteredData.reduce((sum, item) => {
      const rawValue = item[totalKey];
      const numericValue = parseFloat(
        String(rawValue || "0").replace(/,/g, ""),
      );
      return sum + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);
  }, [filteredData, totalKey]);

  useEffect(() => {
    if (!onMonthChange || !filteredData.length) return;

    const total = filteredData.reduce((sum, item) => {
      const amt = parseFloat(
        String(item.actualAmount || item.projectedAmount || "0").replace(
          /,/g,
          "",
        ),
      );
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);

    onMonthChange(total);
  }, [filteredData, onMonthChange]);

  const formattedColumns = useMemo(() => {
    return columns.map((col) => {
      if (col.field?.toLowerCase().includes("date")) {
        return {
          ...col,
          valueFormatter: (params) => {
            if (typeof params.value === "string") {
              const trimmedValue = params.value.trim();
              if (/^\d{2}-\d{2}-\d{4}$/.test(trimmedValue)) {
                return trimmedValue;
              }
            }

            const date = dayjs(params.value);
            if (!date.isValid()) return params.value;
            // if (formatTime) return date.format("hh:mm A");
            if (col.includeTime) return date.format("DD-MM-YYYY hh:mm A");
            if (formatDate) return date.format("DD-MM-YYYY");
            return params.value;
          },
        };
      }
      if (col.field?.toLowerCase().includes("time")) {
        return {
          ...col,
          valueFormatter: (params) => {
            const date = dayjs(params.value);
            if (!date.isValid()) return params.value;
            if (formatTime) return date.format("hh:mm A");
            // if (formatDate) return date.format("DD-MM-YYYY");
            return params.value;
          },
        };
      }
      return col;
    });
  }, [columns, formatDate, formatTime]);

  const finalTableData = useMemo(() => {
    return filteredData.map((item, index) => ({
      ...item,
      srNo: index + 1,
      date: humanDate(item[dateColumn]),
    }));
  }, [filteredData, dateColumn]);

  // const handleExportPass = () => {
  //   if (agGridRef.current) {
  //     agGridRef.current.api.exportDataAsCsv({
  //       fileName: `${tableTitle || "data"}.csv`,
  //       allColumns: exportAllColumns,
  //       columnKeys: formattedColumns.map((col) => col.field).filter(Boolean),
  //     });
  //   }
  // };
  const handleExportPass = () => {
    if (agGridRef.current) {
      agGridRef.current.api.exportDataAsCsv({
        fileName: `${tableTitle || "data"}.csv`,
        allColumns: exportAllColumns,
        processCellCallback: (params) => {
          const field = params?.column?.getColDef?.()?.field || "";
          const value = params?.value;
          const exportFormat = params?.column?.getColDef?.()?.exportFormat;

          if (value === null || value === undefined) return "";

          const normalizedField = field.toLowerCase();
          if (taskExportDateTimeFormatting) {
            const parsedValue = dayjs(value);

            if (parsedValue.isValid()) {
              if (exportFormat === "datetime") {
                return parsedValue.format("DD-MM-YYYY hh:mm A");
              }

              if (exportFormat === "datetime-comma") {
                return parsedValue.format("DD-MM-YYYY, hh:mm A");
              }

              if (exportFormat === "time") {
                return parsedValue.format("hh:mm A");
              }

              if (exportFormat === "date") {
                return parsedValue.format("DD-MM-YYYY");
              }

              if (normalizedField.includes("date")) {
                return parsedValue.format("DD-MM-YYYY");
              }

              if (normalizedField.includes("time")) {
                return parsedValue.format("hh:mm A");
              }
            }
          }

          const shouldPreserveAsText = /(at)$/i.test(field);

          const stringValue = String(value);

          if (!shouldPreserveAsText) return stringValue;

          return stringValue.startsWith(" ") ? stringValue : `${stringValue}`;
        },
        columnKeys: formattedColumns
          .filter((col) => !col.field?.toLowerCase().includes("action"))
          .map((col) => col.field)
          .filter(Boolean),
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between gap-2">
        {tableTitle ? (
          <span className="text-title text-primary font-pmedium uppercase">
            {tableTitle}
          </span>
        ) : (
          <span />
        )}

        <div className="flex gap-2 items-center justify-end flex-nowrap ml-auto">
          {/* ✅ Show calendar only if data is not empty */}

          {!hideDateControls && (
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleCloseCalendar}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              {dateRange.length > 0 && (
                <DateRangePicker
                  onChange={handleDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  ranges={dateRange}
                  direction="vertical"
                  dayContentRenderer={(date) => {
                    const dateStr = dayjs(date).format("YYYY-MM-DD");
                    const hasData = validDateSet.has(dateStr);
                    return (
                      <div className="overflow-hidden">
                        <div
                          style={{
                            backgroundColor: hasData ? "white" : "transparent",
                            borderBottom: hasData ? "4px solid #1E3D73" : "",
                            borderTopLeftRadius: "5px",
                            borderTopRightRadius: "5px",
                            height: "25px",
                            width: "25px",
                            fontWeight: hasData ? "bold" : "normal",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {date.getDate()}
                        </div>
                      </div>
                    );
                  }}
                />
              )}
            </Popover>
          )}

          {secondaryButtonTitle && (
            <PrimaryButton
              title={secondaryButtonTitle}
              handleSubmit={handleSecondarySubmit}
              disabled={secondaryButtonDisabled}
            />
          )}
          {middleButtonTitle && (
            <PrimaryButton
              title={middleButtonTitle}
              handleSubmit={handleMiddleSubmit}
              disabled={middleButtonDisabled}
            />
          )}
          {buttonTitle && (
            <PrimaryButton
              title={buttonTitle}
              handleSubmit={handleSubmit}
              disabled={buttonDisabled}
            />
          )}
          {customExportTitle && handleCustomExport && (
            <PrimaryButton
              title={customExportTitle}
              handleSubmit={handleCustomExport}
              disabled={customExportDisabled}
            />
          )}
          {exportData && (
            <PrimaryButton
              title={exportButtonTitle}
              handleSubmit={handleExportPass}
            />
          )}
          {batchButton && selectedRows.length > 0 && (
            <PrimaryButton
              title={batchButton}
              handleSubmit={() => handleBatchAction(selectedRows)}
            />
          )}
        </div>
      </div>
      {/* {dateRange.length > 0 && dateRange[0] && ( */}
      {!hideDateControls &&
        !showDateNavigator &&
        dateRange.length > 0 &&
        dateRange[0] && (
          <div className="flex justify-center items-center gap-2">
            {/* Date information here */}

            <div className="flex items-center gap-2  justify-center">
              <div className="px-6 py-1 rounded-md border-primary border-[1px]">
                <span className="text-gray-600 text-content font-pregular">
                  {dateRange.length > 0 &&
                    dateRange[0] &&
                    dayjs(dateRange[0].startDate).format("DD MMM YYYY")}
                </span>{" "}
              </div>

              <div className="px-6 py-1 rounded-md border-primary border-[1px]">
                <span className="text-gray-600 text-content font-pregular">
                  {dateRange.length > 0 &&
                    dateRange[0] &&
                    dayjs(dateRange[0].endDate).format("DD MMM YYYY")}
                </span>
              </div>
            </div>
            <div
              className="p-2 rounded-md bg-primary text-white cursor-pointer hover:bg-[#1E3D55]"
              onClick={handleOpenCalendar}
            >
              <MdCalendarToday size={19} />
            </div>
          </div>
        )}
      {!hideDateControls && showDateNavigator && (
        // <div className="flex justify-center items-center gap-2">
        //   <PrimaryButton title="<" handleSubmit={onPreviousDay} />
        //   <div className="px-6 py-1 rounded-md border-primary border-[1px] min-w-[170px] text-center">
        //     <span className="text-gray-600 text-content font-pregular">
        //       {selectedDateLabel}
        //     </span>
        //   </div>
        //   <PrimaryButton title=">" handleSubmit={onNextDay} />
        // </div>
        <div className="flex justify-center items-center gap-3">
          {/* Previous Button */}
          <button
            onClick={onPreviousDay}
            className="w-12 h-10 flex items-center justify-center rounded-xl bg-primary text-white text-2xl font-semibold hover:opacity-90 transition-all"
          >
            ‹
          </button>

          {/* Date Box */}
          <div className="px-4 py-1.5 rounded-lg border border-primary min-w-[140px] text-center bg-white">
            <span className="text-gray-600 text-sm font-pregular">
              {selectedDateLabel}
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={onNextDay}
            className="w-12 h-10 flex items-center justify-center rounded-xl bg-primary text-white text-2xl font-semibold hover:opacity-90 transition-all"
          >
            ›
          </button>
        </div>
      )}
      {/* 
      <div className="px-6 py-1 rounded-md border-green-600 border-[1px] bg-green-50 text-green-800 font-semibold">
        Total: INR {rangeTotal.toLocaleString("en-IN")}
      </div> */}

      {/* Table */}

      <>
        {finalTableData.length > 0 ? (
          <AgTable
            key={key}
            enableCheckbox={checkbox}
            tableRef={agGridRef}
            exportData={exportTable}
            dropdownColumns={dropdownColumns}
            checkAll={checkAll}
            tableTitle={tableTitle}
            tableHeight={tableHeight || 300}
            columns={formattedColumns}
            data={finalTableData}
            hideFilter={filteredData.length <= 9}
            search={search}
            dateColumn={dateColumn}
            isRowSelectable={isRowSelectable}
            onSelectionChange={(rows) => setSelectedRows(rows)}
            batchButton={batchButton}
            hideTitle={hideTitle}
          />
        ) : (
          <div
            className="h-[60vh] flex justify-center items-center"
            style={{ padding: "2rem", color: "#666" }}
          >
            No data available for the selected date range.
          </div>
        )}
      </>
    </div>
  );
};

export default YearWiseTable;
