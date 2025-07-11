import React, { useMemo, useState, useRef, useEffect } from "react";
import { DateRangePicker } from "react-date-range";
import { addDays, isWithinInterval } from "date-fns";
import dayjs from "dayjs";
import AgTable from "../AgTable";
import PrimaryButton from "../PrimaryButton";
import humanDate from "../../utils/humanDateForamt";
import { IconButton, Popover, Typography } from "@mui/material";
import { MdCalendarToday } from "react-icons/md";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const YearWiseTable = ({
  data = [],
  columns = [],
  dateColumn,
  formatTime = false,
  formatDate = true,
  tableHeight,
  tableTitle,
  buttonTitle,
  handleSubmit,
  checkbox,
  checkAll,
  key,
  exportData,
  dropdownColumns = [],
  handleBatchAction,
  batchButton,
  isRowSelectable,
  hideTitle = true,
  search = true,
}) => {
  const agGridRef = useRef(null);
  const [exportTable, setExportTable] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const today = dayjs();

  // ✅ Safe initial empty state
  const [dateRange, setDateRange] = useState([]);

  // ✅ Set dateRange after data is available
  useEffect(() => {
    if (!data.length || !dateColumn) return;

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
  }, [data, dateColumn]);

  // Calendar popover logic
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpenCalendar = (e) => setAnchorEl(e.currentTarget);
  const handleCloseCalendar = () => setAnchorEl(null);

  // Precompute valid dates for highlighting
  const validDateSet = useMemo(() => {
    const set = new Set();
    data.forEach((item) => {
      const d = dayjs(item[dateColumn]);
      if (d.isValid()) set.add(d.format("YYYY-MM-DD"));
    });
    return set;
  }, [data, dateColumn]);

  // ✅ Filter table data based on safe range
  const filteredData = useMemo(() => {
    if (!dateColumn || dateRange.length === 0 || !dateRange[0]) return data;

    const { startDate, endDate } = dateRange[0];
    const start = dayjs(startDate).startOf("day").toDate();
    const end = dayjs(endDate).endOf("day").toDate();

    return data.filter((item) => {
      const itemDate = dayjs(item[dateColumn]);
      if (!itemDate.isValid()) return false;

      return isWithinInterval(itemDate.toDate(), { start, end });
    });
  }, [data, dateColumn, dateRange]);

  const formattedColumns = useMemo(() => {
    return columns.map((col) => {
      if (col.field?.toLowerCase().includes("date")) {
        return {
          ...col,
          valueFormatter: (params) => {
            const date = dayjs(params.value);
            if (!date.isValid()) return params.value;
            if (formatTime) return date.format("hh:mm A");
            if (formatDate) return date.format("DD-MM-YYYY");
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

  const handleExportPass = () => {
    if (agGridRef.current) {
      agGridRef.current.api.exportDataAsCsv({
        fileName: `${tableTitle || "data"}.csv`,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center w-full justify-between flex-wrap">
        {tableTitle && (
          <span className="text-title text-primary font-pmedium uppercase">
            {tableTitle}
          </span>
        )}

        <div className="flex gap-2 items-center flex-wrap">
          <IconButton onClick={handleOpenCalendar}>
            <MdCalendarToday size={24} />
          </IconButton>

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
                onChange={(item) => setDateRange([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                direction="vertical"
                dayContentRenderer={(date) => {
                  const dateStr = dayjs(date).format("YYYY-MM-DD");
                  const hasData = validDateSet.has(dateStr);
                  return (
                    <div className="overflow-hidden h-[30px]">
                      <div
                        style={{
                          backgroundColor: hasData ? "#E0F7FA" : "transparent",
                          borderRadius: "50%",
                          height: "32px",
                          width: "32px",
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

          {buttonTitle && (
            <PrimaryButton title={buttonTitle} handleSubmit={handleSubmit} />
          )}
          {exportData && (
            <PrimaryButton title="Export" handleSubmit={handleExportPass} />
          )}
          {batchButton && selectedRows.length > 0 && (
            <PrimaryButton
              title={batchButton}
              handleSubmit={() => handleBatchAction(selectedRows)}
            />
          )}
        </div>
      </div>

      {/* Table */}
      {dateRange.length > 0 && (
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
            <div className="h-[60vh] flex justify-center items-center"
              style={{ padding: "2rem", color: "#666" }}
            >
              No data available for the selected date range.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default YearWiseTable;
