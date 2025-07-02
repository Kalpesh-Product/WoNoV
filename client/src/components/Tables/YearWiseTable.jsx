import React, { useMemo, useState, useEffect, useRef } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import dayjs from "dayjs";
import AgTable from "../AgTable";
import PrimaryButton from "../PrimaryButton";
import humanDate from "../../utils/humanDateForamt";

const getFiscalYear = (date) => {
  const d = dayjs(date);
  const year = d.month() >= 3 ? d.year() : d.year() - 1;
  return `FY ${year}-${String((year + 1) % 100).padStart(2, "0")}`;
};

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
  initialMonth,
  onMonthChange,
  exportData,
  dropdownColumns = [],
  dateFilter,
  handleBatchAction,
  batchButton,
  isRowSelectable,
  hideTitle = true,
  search = true,
}) => {
  const lastEmittedMonthRef = useRef(null);
  const [exportTable, setExportTable] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const agGridRef = useRef(null);
  const handleExportPass = () => {
    if (agGridRef.current) {
      agGridRef.current.api.exportDataAsCsv({
        fileName: `${tableTitle || "data"}.csv`,
      });
    }
  };
  const fiscalMap = useMemo(() => {
    const map = new Map();
    data.forEach((item) => {
      const date = dayjs(item[dateColumn]);
      if (!date.isValid()) return;

      const fy = getFiscalYear(date);
      const month = date.format("MMM-YYYY");

      if (!map.has(fy)) map.set(fy, new Map());
      const monthMap = map.get(fy);

      if (!monthMap.has(month)) monthMap.set(month, []);
      monthMap.get(month).push(item);
    });
    return map;
  }, [data, dateColumn]);

  const fiscalYears = useMemo(
    () => Array.from(fiscalMap.keys()).sort(),
    [fiscalMap]
  );

  const [selectedFYIndex, setSelectedFYIndex] = useState(() => {
    const defaultIndex = fiscalYears.findIndex(
      (fy) => fy === getFiscalYear(new Date())
    );
    return defaultIndex !== -1 ? defaultIndex : 0;
  });

  const selectedFY = fiscalYears[selectedFYIndex] || fiscalYears[0];

  const monthsInFY = useMemo(() => {
    if (!selectedFY) return [];
    return Array.from(fiscalMap.get(selectedFY)?.keys() || []).sort(
      (a, b) => dayjs(a, "MMM-YYYY").toDate() - dayjs(b, "MMM-YYYY").toDate()
    );
  }, [fiscalMap, selectedFY]);

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  // ✅ Sync initial month if provided
  useEffect(() => {
    if (monthsInFY.length > 0) {
      if (initialMonth) {
        const matchedIndex = monthsInFY.findIndex((monthStr) => {
          return dayjs(monthStr, "MMM-YYYY").format("MMMM") === initialMonth;
        });
        if (matchedIndex !== -1) {
          setSelectedMonthIndex(matchedIndex);
          return;
        }
      }

      // ✅ Default to latest month available
      setSelectedMonthIndex(monthsInFY.length - 1);
    }
  }, [initialMonth, monthsInFY]);

  // ✅ Reset month if it doesn't exist in the new FY
  useEffect(() => {
    if (monthsInFY.length === 0) return;

    const currentMonth = monthsInFY[selectedMonthIndex];
    const isValid = fiscalMap.get(selectedFY)?.has(currentMonth);

    if (!isValid) {
      setSelectedMonthIndex(0); // Default to first month
    }
  }, [selectedFYIndex, monthsInFY, fiscalMap, selectedFY, selectedMonthIndex]);

  // Notify parent on month change
  useEffect(() => {
    const currentMonth = monthsInFY[selectedMonthIndex];
    if (
      onMonthChange &&
      currentMonth &&
      currentMonth !== lastEmittedMonthRef.current
    ) {
      onMonthChange(currentMonth);
      lastEmittedMonthRef.current = currentMonth;
    }
  }, [selectedMonthIndex, monthsInFY, onMonthChange]);

  const selectedMonth = monthsInFY[selectedMonthIndex] || "";

  const filteredData = useMemo(() => {
    return fiscalMap.get(selectedFY)?.get(selectedMonth) || [];
  }, [fiscalMap, selectedFY, selectedMonth]);

  const formattedColumns = useMemo(() => {
    return columns.map((col) => {
      if (col.field?.toLowerCase().includes("date")) {
        return {
          ...col,
          valueFormatter: (params) => {
            const date = dayjs(params.value);
            if (!date.isValid()) return params.value;

            if (!formatDate && !formatTime) {
              return params.value;
            }

            if (formatTime) return date.format("hh:mm A");
            if (formatDate) return date.format("DD-MM-YYYY");
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center w-full justify-between">
        {tableTitle && (
          <div>
            <span className="text-title text-primary font-pmedium uppercase">
              {tableTitle}
            </span>
          </div>
        )}
        <div className="flex gap-4 items-center">
          {buttonTitle && (
            <PrimaryButton title={buttonTitle} handleSubmit={handleSubmit} />
          )}
          {exportData && (
            <PrimaryButton title={"Export"} handleSubmit={handleExportPass} />
          )}
          {batchButton && selectedRows.length>0 && (
            <PrimaryButton
              title={batchButton || "Generate"}
              handleSubmit={() => handleBatchAction(selectedRows)}
            />
          )}
        </div>
      </div>
      <hr />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 w-full justify-center">
          {monthsInFY.length > 0 && (
            <>
              {/* Month Switcher */}
              <div className="flex items-center gap-2">
                <PrimaryButton
                  title={<MdNavigateBefore />}
                  handleSubmit={() =>
                    setSelectedMonthIndex((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={selectedMonthIndex === 0}
                />
                <div className="text-subtitle text-center font-pmedium w-[100px]">
                  {selectedMonth}
                </div>
                <PrimaryButton
                  title={<MdNavigateNext />}
                  handleSubmit={() =>
                    setSelectedMonthIndex((prev) =>
                      Math.min(prev + 1, monthsInFY.length - 1)
                    )
                  }
                  disabled={selectedMonthIndex === monthsInFY.length - 1}
                />
              </div>

              {/* FY Switcher */}
              <div className="flex items-center gap-2">
                <PrimaryButton
                  title={<MdNavigateBefore />}
                  handleSubmit={() =>
                    setSelectedFYIndex((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={selectedFYIndex === 0}
                />
                <div className="text-subtitle text-center font-pmedium w-fit">
                  {selectedFY}
                </div>
                <PrimaryButton
                  title={<MdNavigateNext />}
                  handleSubmit={() =>
                    setSelectedFYIndex((prev) =>
                      Math.min(prev + 1, fiscalYears.length - 1)
                    )
                  }
                  disabled={selectedFYIndex === fiscalYears.length - 1}
                />
              </div>
            </>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default YearWiseTable;
