import React, { useState } from "react";
import WidgetSection from "../WidgetSection";
import BarGraph from "./BarGraph";
import SecondaryButton from "../SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const YearlyGraph = ({ options, data, dataPoint, title, titleAmount, chartId }) => {
  const fiscalYears = ["FY 2024-25", "FY 2025-26"];
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const selectedYear = fiscalYears[selectedYearIndex];
  console.log("YEar",selectedYear)

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
        titleLabel={selectedYear}
        TitleAmount={titleAmount || ""}
      >
        <BarGraph data={filteredData} options={updatedOptions} chartId={chartId || ""}  />

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
      </WidgetSection>
    </div>
  );
};

export default YearlyGraph;
