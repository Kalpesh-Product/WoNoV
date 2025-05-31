import { useMemo, useState } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import dayjs from "dayjs";
import AgTable from "../AgTable";
import PrimaryButton from "../PrimaryButton";
import useRefWithInitialRerender from "../../hooks/useRefWithInitialRerender";

const DateWiseTable = ({
  data = [],
  columns = [],
  dateColumn,
  checkbox,
  tableTitle,
  buttonTitle,
  handleSubmit,
  checkAll,
  formatTime = false, // <-- added default value
}) => {
  const { ref } = useRefWithInitialRerender;


  const dateLabels = useMemo(() => {
    const dateSet = new Set();
    data.forEach((item) => {
      const date = dayjs(item[dateColumn]);
      if (date.isValid()) {
        dateSet.add(date.format("D-MMM-YYYY"));
      }
    });
    return Array.from(dateSet).sort(
      (a, b) =>
        dayjs(a, "D-MMM-YYYY").toDate() - dayjs(b, "D-MMM-YYYY").toDate()
    );
  }, [data, dateColumn]);

  const today = dayjs().format("D-MMM-YYYY");

const defaultDateIndex = useMemo(() => {
  if (dateLabels.length === 0) return 0;

  const todayIndex = dateLabels.findIndex((d) => d === today);
  if (todayIndex !== -1) return todayIndex;

  // Find the closest previous date before today
  const pastDates = dateLabels.filter((d) => dayjs(d, "D-MMM-YYYY").isBefore(dayjs()));
  return pastDates.length > 0 ? dateLabels.indexOf(pastDates[pastDates.length - 1]) : 0;
}, [dateLabels]);

const [selectedDateIndex, setSelectedDateIndex] = useState(defaultDateIndex);


  const selectedDate = dateLabels[selectedDateIndex];

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const date = dayjs(item[dateColumn]);
      return date.isValid() && date.format("D-MMM-YYYY") === selectedDate;
    });
  }, [data, selectedDate, dateColumn]);

  // ✅ Conditional formatting based on formatTime
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
    <div ref={ref} className="flex flex-col gap-4">
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
        </div>
      </div>

      <AgTable
        tableHeight={350}
        enableCheckbox={checkbox}
        checkAll={checkAll}
        columns={formattedColumns}
        data={filteredData}
        hideFilter={filteredData.length <= 9}
        search={filteredData.length >= 10}
      />
    </div>
  );
};

export default DateWiseTable;
