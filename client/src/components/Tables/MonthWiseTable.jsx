import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import dayjs from "dayjs";
import AgTable from "../AgTable"; // Adjust the import path as needed
import PrimaryButton from "../PrimaryButton";
import humanDate from "../../utils/humanDateForamt";

const MonthWiseTable = ({
  data = [],
  columns = [],
  dateColumn,
  formatTime = false,
  tableTitle,
  buttonTitle,
  handleSubmit,
  checkbox,
  checkAll,
  key,
  onMonthChange,
  exportData,
}) => {
    const [exportTable, setExportTable] = useState(false);
    const agGridRef = useRef(null);
    const handleExportPass = () => {
      if (agGridRef.current) {
        agGridRef.current.api.exportDataAsCsv({
          fileName: `${tableTitle || "data"}.csv`,
        });
      }
    };
  // Step 1: Get unique months from the date column
  const monthLabels = useMemo(() => {
    const monthSet = new Set();

    data.forEach((item) => {
      const date = dayjs(item[dateColumn]);
      if (date.isValid()) {
        monthSet.add(date.format("MMM-YYYY"));
      }
    });

    return Array.from(monthSet).sort((a, b) => {
      return dayjs(a, "MMM-YYYY").toDate() - dayjs(b, "MMM-YYYY").toDate();
    });
  }, [data, dateColumn]);

  // Step 2: Pick current month if present
  const currentMonth = dayjs().format("MMM-YYYY");

  const selectedMonthIndexDefault = useMemo(() => {
    const index = monthLabels.findIndex((label) => label === currentMonth);
    return index >= 0 ? index : 0;
  }, [monthLabels]);

  // Step 3: Selected month state
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    selectedMonthIndexDefault
  );

  const selectedMonth = monthLabels[selectedMonthIndex];

  useEffect(() => {
    if (onMonthChange) {
      onMonthChange(selectedMonth);
    }
  }, [selectedMonth, onMonthChange]);

  // Step 4: Filter data by selected month
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const date = dayjs(item[dateColumn]);
      return date.isValid() && date.format("MMM-YYYY") === selectedMonth;
    });
  }, [data, selectedMonth, dateColumn]);

  const formattedColumns = useMemo(() => {
    return columns.map((col) => {
      if (col.field?.toLowerCase().includes("date")) {
        return {
          ...col,
          valueFormatter: (params) => {
            const date = dayjs(params.value);
            return date.isValid()
              ? formatTime
                ? date.format("hh:mm A")
                : date.format("DD-MM-YYYY")
              : params.value;
          },
        };
      }
      return col;
    });
  }, [columns, formatTime]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-title text-primary font-pmedium uppercase">
          {tableTitle}
        </span>

        <div className="flex items-center gap-4">
          {buttonTitle ? (
            <div>
              <PrimaryButton title={buttonTitle} handleSubmit={handleSubmit} />
            </div>
          ) : null}
          {exportData && (
            <PrimaryButton title={"Export"} handleSubmit={handleExportPass} />
          )}
        </div>
      </div>
      <div className="flex w-full justify-center">
        {monthLabels.length > 0 && (
          <div className="flex justify-end items-center">
            <PrimaryButton
              title={<MdNavigateBefore />}
              handleSubmit={() =>
                setSelectedMonthIndex((prev) => Math.max(prev - 1, 0))
              }
              disabled={selectedMonthIndex === 0}
            />
            <div className="text-subtitle text-center font-pmedium w-[120px]">
              {selectedMonth}
            </div>
            <PrimaryButton
              title={<MdNavigateNext />}
              handleSubmit={() =>
                setSelectedMonthIndex((prev) =>
                  Math.min(prev + 1, monthLabels.length - 1)
                )
              }
              disabled={selectedMonthIndex === monthLabels.length - 1}
            />
          </div>
        )}
      </div>

      <AgTable
        key={key}
        enableCheckbox={checkbox}
        exportData={exportTable}
        checkAll={checkAll}
        tableHeight={300}
        columns={formattedColumns}
        data={filteredData.map((item, index) => ({
          ...item,
          srNo: index + 1,
          date: humanDate(item.date),
        }))}
        hideFilter={filteredData.length <= 9}
        search={filteredData.length >= 10}
      />
    </div>
  );
};

export default MonthWiseTable;
