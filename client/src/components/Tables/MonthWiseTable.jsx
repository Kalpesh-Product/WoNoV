import React, { useMemo, useState } from "react";
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
  handleSubmit
}) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  console.log("Recieved data : ", data)

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

  const selectedMonth = monthLabels[selectedMonthIndex];

  // Step 2: Filter data by selected month
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const date = dayjs(item[dateColumn]);
      return date.isValid() && date.format("MMM-YYYY") === selectedMonth;
    });
  }, [data, selectedMonth, dateColumn]);
  console.log("Filtered inside : ", filteredData);

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
          {buttonTitle ? (
            <div>
              <PrimaryButton title={buttonTitle} handleSubmit={handleSubmit} />
            </div>
          ) : null}
        </div>
      </div>

      <AgTable
        tableHeight={300}
        columns={formattedColumns}
        data={filteredData.map((item) => ({
          ...item,
          date: humanDate(item.date),
        }))}
        hideFilter={filteredData.length <= 9}
        search={filteredData.length >= 10}
      />
    </div>
  );
};

export default MonthWiseTable;
