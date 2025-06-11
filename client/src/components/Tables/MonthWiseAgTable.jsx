import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import PrimaryButton from "../PrimaryButton";
import AgTable from "../AgTable";
import customParseFormat from "dayjs/plugin/customParseFormat";
import WidgetSection from "../WidgetSection";
import { parseAmount } from "../../utils/parseAmount";
import { inrFormat } from "../../utils/currencyFormat";

dayjs.extend(customParseFormat);

const MonthWiseAgTable = ({ financialData, passedColumns, title, amount }) => {
  const fiscalYears = ["FY 2024-25", "FY 2025-26"];
  const [selectedFYIndex, setSelectedFYIndex] = useState(0);
  const selectedFY = fiscalYears[selectedFYIndex];

  const sortedFinancialData = useMemo(() => {
    return [...financialData].sort((a, b) => {
      const aDate = dayjs(a.month, "MMM-YY").toDate();
      const bDate = dayjs(b.month, "MMM-YY").toDate();
      return aDate - bDate;
    });
  }, [financialData]);

  const normalizeMonth = (monthStr) => {
    return monthStr
      .replace(/^Sept/i, "Sep") // fix Sept typo
      .trim();
  };

  const filteredMonths = useMemo(() => {
    const yearRanges = {
      "FY 2024-25": [new Date("2024-03-01"), new Date("2025-03-31")],
      "FY 2025-26": [new Date("2025-03-01"), new Date("2026-03-31")],
    };
    const [start, end] = yearRanges[selectedFY];

    return sortedFinancialData.filter((item) => {
      if (!item.month) return false; // ✅ Fallback for undefined/null month

      const parsed = dayjs(normalizeMonth(item.month), "MMM-YY");
      if (!parsed.isValid()) return false;

      const date = parsed.toDate();
      return date >= start && date <= end;
    });
  }, [sortedFinancialData, selectedFY]);

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  const monthData = useMemo(() => {
    const data = filteredMonths[selectedMonthIndex] || {};
    return {
      month: data.month || "",
      actual: data.actual || 0,
      monthFormatted: data.month,
      rows: data.revenue || [],
    };
  }, [filteredMonths, selectedMonthIndex]);

  const monthTotal = monthData.rows
    .map(
      (item) =>
        parseAmount(item.revenue) || item.totalAmount || item.invoiceAmount
    )
    .reduce((sum, item) => item + sum, 0);
  const columns = [
    { headerName: "Particulars", field: "particulars" },
    {
      headerName: "Taxable Amount (INR)",
      field: "taxableAmount",
      valueFormatter: ({ value }) => `${value?.toLocaleString()}`,
    },
    {
      headerName: "GST (INR)",
      field: "gst",
      valueFormatter: ({ value }) => `${value?.toLocaleString()}`,
    },
    {
      headerName: "Invoice Amount (INR)",
      field: "invoiceAmount",
      valueFormatter: ({ value }) => `${value?.toLocaleString()}`,
    },
    {
      headerName: "Invoice Created",
      field: "invoiceCreationDate",
      valueFormatter: ({ value }) => dayjs(value).format("DD-MM-YYYY"),
    },
    {
      headerName: "Invoice Paid",
      field: "invoicePaidDate",
      valueFormatter: ({ value }) =>
        value ? dayjs(value).format("DD-MM-YYYY") : "—",
    },
    {
      headerName: "Status",
      field: "status",
      pinned: "right",
      flex: 1,
    },
  ];

  return (
    <div className="space-y-2">
      {/* Fiscal Year Selector */}

      <WidgetSection
        title={title}
        TitleAmount={amount || `INR ${inrFormat(monthTotal)}`}
        border>
        <div className="flex justify-center items-center space-x-2 px-4 pt-2 ">
          {/* Month Switcher */}
          {filteredMonths.length > 0 && (
            <div className="flex gap-4 items-center">
              <PrimaryButton
                title={<MdNavigateBefore />}
                handleSubmit={() =>
                  setSelectedMonthIndex((prev) => Math.max(prev - 1, 0))
                }
                disabled={selectedMonthIndex === 0}
              />
              <span className="text-body font-pmedium uppercase">
                {monthData.monthFormatted}
              </span>
              <PrimaryButton
                title={<MdNavigateNext />}
                handleSubmit={() =>
                  setSelectedMonthIndex((prev) =>
                    Math.min(prev + 1, filteredMonths.length - 1)
                  )
                }
                disabled={selectedMonthIndex === filteredMonths.length - 1}
              />
            </div>
          )}
          <div className="flex gap-4 items-center">
            {fiscalYears.length > 0 && (
              <div className="flex gap-4 items-center">
                <PrimaryButton
                  title={<MdNavigateBefore />}
                  handleSubmit={() =>
                    setSelectedFYIndex((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={selectedFYIndex === 0}
                />
                <span className="text-body font-pmedium uppercase">
                  {fiscalYears[selectedFYIndex]}
                </span>
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
            )}
          </div>
        </div>
        {/* AgTable */}
        {monthData.rows.length > 0 ? (
          <div className="h-72 overflow-y-auto mt-4 px-4">
            <AgTable
              data={
                monthData.rows
                  ? monthData.rows.map((item, index) => ({
                      ...item,
                      srNo: index + 1,
                    }))
                  : []
              }
              columns={passedColumns ? passedColumns : columns}
              tableHeight={250}
              hideFilter
            />
          </div>
        ) : (
          <div className="h-72 flex justify-center items-center text-muted">
            {/* No revenue data for {monthData.month} */}
          </div>
        )}
      </WidgetSection>
    </div>
  );
};

export default MonthWiseAgTable;
