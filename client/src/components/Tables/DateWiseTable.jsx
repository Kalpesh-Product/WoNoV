import React, { useMemo, useState } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import dayjs from "dayjs";
import AgTable from "../AgTable";
import PrimaryButton from "../PrimaryButton";
import humanDate from "../../utils/humanDateForamt";

const DateWiseTable = ({ data = [], columns = [], dateColumn, checkbox }) => {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Step 1: Get unique dates from the data
  const dateLabels = useMemo(() => {
    const dateSet = new Set();

    data.forEach((item) => {
      const date = dayjs(item[dateColumn]);
      if (date.isValid()) {
        dateSet.add(date.format("D-MMM-YYYY")); // e.g., 5-May-2025
      }
    });

    return Array.from(dateSet).sort((a, b) => {
      return dayjs(a, "D-MMM-YYYY").toDate() - dayjs(b, "D-MMM-YYYY").toDate();
    });
  }, [data, dateColumn]);

  const selectedDate = dateLabels[selectedDateIndex];

  // Step 2: Filter data by selected date
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const date = dayjs(item[dateColumn]);
      return date.isValid() && date.format("D-MMM-YYYY") === selectedDate;
    });
  }, [data, selectedDate, dateColumn]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end items-center">
        <PrimaryButton
          title={<MdNavigateBefore />}
          handleSubmit={() =>
            setSelectedDateIndex((prev) => Math.max(prev - 1, 0))
          }
          disabled={selectedDateIndex === 0}
        />
        <div className="text-subtitle text-center font-pmedium w-[140px]">
          {selectedDate}
        </div>
        <PrimaryButton
          title={<MdNavigateNext />}
          handleSubmit={() =>
            setSelectedDateIndex((prev) =>
              Math.min(prev + 1, dateLabels.length - 1)
            )
          }
          disabled={selectedDateIndex === dateLabels.length - 1}
        />
      </div>

      <AgTable
        tableHeight={300}
        enableCheckbox={checkbox}
        columns={columns}
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

export default DateWiseTable;

