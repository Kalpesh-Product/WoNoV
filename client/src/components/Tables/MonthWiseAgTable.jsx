import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import PrimaryButton from "../PrimaryButton";
import AgTable from "../AgTable";
import customParseFormat from "dayjs/plugin/customParseFormat";
import WidgetSection from "../WidgetSection";
import { parseAmount } from "../../utils/parseAmount";
import { inrFormat } from "../../utils/currencyFormat";
import { useEffect } from "react";

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

  //   const parseAmount = (amount) => {
  //   if (!amount) return 0;
  //   if (typeof amount === "number") return amount;
  //   return parseFloat(amount.replace(/,/g, "")) || 0;
  // };

  const parseAmount = (amount) => {
    if (!amount) return 0;
    if (typeof amount === "number") return amount;
    return parseFloat(amount.replace(/,/g, "")) || 0;
  };

  const monthTotal = monthData.rows
    .map((item) => {
      const revenue = parseAmount(item.revenue);
      const total = parseAmount(item.totalAmount);
      const invoice = parseAmount(item.invoiceAmount);

      // Prefer revenue > total > invoice
      return revenue || total || invoice || 0;
    })
    .reduce((sum, item) => sum + item, 0);

  const columns = [
    { headerName: "Sr No", field: "srNo", width: 100 },
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
        border
      >
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
        <div className="h-72 mt-4 px-4 overflow-y-auto">
          {filteredMonths.length === 0 ? (
            <div className="h-full flex justify-center items-center text-muted">
              No data available for {selectedFY}
            </div>
          ) : monthData.rows.length === 0 ? (
            <div className="h-full flex justify-center items-center text-muted">
              No data available for {monthData.month || "selected month"}
            </div>
          ) : (
            <AgTable
              data={monthData.rows.map((item, index) => ({
                ...item,
                srNo: index + 1,
              }))}
              columns={passedColumns ? passedColumns : columns}
              tableHeight={250}
              hideFilter
            />
          )}
        </div>
      </WidgetSection>
    </div>
  );
};

export default MonthWiseAgTable;
