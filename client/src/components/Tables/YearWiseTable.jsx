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
  initialMonth, // ✅ NEW PROP
  onMonthChange,
  exportData,
  dropdownColumns = [],
  dateFilter,
}) => {
  const lastEmittedMonthRef = useRef(null);
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

  const [selectedFYIndex, setSelectedFYIndex] = useState(
    fiscalYears.findIndex((fy) => fy === getFiscalYear(new Date()))
  );
  const selectedFY = fiscalYears[selectedFYIndex] || fiscalYears[0];

  const monthsInFY = useMemo(() => {
    if (!selectedFY) return [];
    return Array.from(fiscalMap.get(selectedFY)?.keys() || []).sort(
      (a, b) => dayjs(a, "MMM-YYYY").toDate() - dayjs(b, "MMM-YYYY").toDate()
    );
  }, [fiscalMap, selectedFY]);

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  // ✅ Sync selectedMonthIndex with initialMonth prop
  useEffect(() => {
    if (initialMonth && monthsInFY.length > 0) {
      const matchedIndex = monthsInFY.findIndex((monthStr) => {
        return dayjs(monthStr, "MMM-YYYY").format("MMMM") === initialMonth;
      });
      if (matchedIndex !== -1) {
        setSelectedMonthIndex(matchedIndex);
      }
    }
  }, [initialMonth, monthsInFY]);

  // When selectedMonthIndex changes, notify parent
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
              return params.value; // ✅ raw value (e.g. ISO string or Date object)
            }

            if (formatTime) return date.format("hh:mm A");
            if (formatDate) return date.format("DD-MM-YYYY");
          },
        };
      }
      return col;
    });
  }, [columns, formatTime]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center w-full justify-between">
        <span className="text-title text-primary font-pmedium uppercase">
          {tableTitle}
        </span>
        {buttonTitle && (
          <PrimaryButton title={buttonTitle} handleSubmit={handleSubmit} />
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 w-full justify-center">
          {filteredData.length > 0 && (
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
        exportData={exportData}
        dropdownColumns={dropdownColumns}
        checkAll={checkAll}
        tableHeight={tableHeight ? tableHeight : 300}
        columns={formattedColumns}
        data={filteredData.map((item, index) => ({
          ...item,
          srNo: index + 1, // ✅ Resets per month view
          date: humanDate(item[dateColumn]),
        }))}
        hideFilter={filteredData.length <= 9}
        search={filteredData.length >= 10}
        dateColumn={dateColumn}
      />
    </div>
  );
};

export default YearWiseTable;
