import React, { useEffect, useState } from "react";
import WidgetSection from "../WidgetSection";
import BarGraph from "./BarGraph";
import SecondaryButton from "../SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const YearlyGraph = ({
  options,
  data,
  dataPoint,
  title,
  titleAmount,
  chartId,
  TitleAmountGreen,
  TitleAmountRed,
  responsiveResize = false,
  secondParam = false,
  chartHeight,
  currentYear,
  onYearChange,
  dateKey, // 👈 New prop
}) => {
  const fiscalYears = ["FY 2024-25", "FY 2025-26"];

  const getYearIndexFromDate = (dateInput) => {
    const date = new Date(dateInput);
    const month = date.getMonth(); // 0 = Jan
    const year = date.getFullYear();

    if (
      (year === 2024 && month >= 3) || // Apr–Dec 2024
      (year === 2025 && month <= 2) // Jan–Mar 2025
    )
      return 0;

    if (
      (year === 2025 && month >= 3) || // Apr–Dec 2025
      (year === 2026 && month <= 2) // Jan–Mar 2026
    )
      return 1;

    return 0; // fallback
  };

  const [selectedYearIndex, setSelectedYearIndex] = useState(() => {
    if (dateKey && data?.length > 0) {
      const dateValue = data[0]?.dateKey;

      if (dateValue) return getYearIndexFromDate(dateValue);
    }
    return currentYear ? 1 : 0;
  });

  const selectedYear = fiscalYears[selectedYearIndex];

  useEffect(() => {
    if (!dateKey && onYearChange) {
      onYearChange(selectedYear);
    }
  }, [selectedYear, onYearChange, dateKey]);

  const yearCategories = {
    "FY 2024-25": [
      "Apr-24",
      "May-24",
      "Jun-24",
      "Jul-24",
      "Aug-24",
      "Sep-24",
      "Oct-24",
      "Nov-24",
      "Dec-24",
      "Jan-25",
      "Feb-25",
      "Mar-25",
    ],
    "FY 2025-26": [
      "Apr-25",
      "May-25",
      "Jun-25",
      "Jul-25",
      "Aug-25",
      "Sep-25",
      "Oct-25",
      "Nov-25",
      "Dec-25",
      "Jan-26",
      "Feb-26",
      "Mar-26",
    ],
  };

  let filteredData;
  if (dataPoint === "name") {
    filteredData = data.filter((item) => item.name === selectedYear);
  } else {
    filteredData = data.filter((item) => item.group === selectedYear);
  }

  const updatedOptions = {
    ...options,
    chart: {
      ...options.chart,
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      ...options.xaxis,
      categories: yearCategories[selectedYear],
    },
  };

  const goToPrevYear = () => {
    setSelectedYearIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNextYear = () => {
    setSelectedYearIndex((prev) => Math.min(fiscalYears.length - 1, prev + 1));
  };

  return (
    <div>
      <WidgetSection
        normalCase
        border
        title={title || "Title not given"}
        TitleAmount={titleAmount || ""}
        TitleAmountGreen={TitleAmountGreen}
        TitleAmountRed={TitleAmountRed}
      >
        <div className="flex flex-col gap-4">
          <BarGraph
            key={selectedYear}
            data={filteredData}
            options={updatedOptions}
            chartId={chartId || ""}
            responsiveResize={responsiveResize}
            secondParam={secondParam}
            height={chartHeight}
          />

          <div className="flex justify-center items-center">
            <div className="flex items-center pb-4">
              <SecondaryButton
                title={<MdNavigateBefore />}
                handleSubmit={goToPrevYear}
                disabled={selectedYearIndex === 0}
              />
              <div className="text-sm min-w-[120px] text-center">
                {selectedYear}
              </div>
              <SecondaryButton
                title={<MdNavigateNext />}
                handleSubmit={goToNextYear}
                disabled={selectedYearIndex === fiscalYears.length - 1}
              />
            </div>
          </div>
        </div>
      </WidgetSection>
    </div>
  );
};

export default YearlyGraph;
