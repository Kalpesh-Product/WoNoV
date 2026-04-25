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
   greenTitle,
  redTitle,
  responsiveResize = false,
  secondParam = false,
  chartHeight,
  currentYear,
  onYearChange,
  dateKey, // 👈 New prop
}) => {
   const yearKey = dataPoint === "name" ? "name" : "group";
  const currentDate = new Date();
  const currentFYStartYear =
    currentDate.getMonth() >= 3
      ? currentDate.getFullYear()
      : currentDate.getFullYear() - 1;
  const getFYLabel = (startYear) =>
    `FY ${startYear}-${String(startYear + 1).slice(-2)}`;

  const getYearIndexFromDate = (dateInput) => {
    const date = new Date(dateInput);
    const month = date.getMonth(); // 0 = Jan
    const year = date.getFullYear();

    const fyStartYear = month >= 3 ? year : year - 1;
    return fyStartYear;
  };

  const [selectedYearStart, setSelectedYearStart] = useState(() => {
    if (dateKey && data?.length > 0) {
      const dateValue = data[0]?.[dateKey];
      if (dateValue) return getYearIndexFromDate(dateValue);
    }
    return currentFYStartYear;
  });

  const selectedYear = getFYLabel(selectedYearStart);

  useEffect(() => {
    if (!dateKey && onYearChange) {
      onYearChange(selectedYear);
    }
  }, [selectedYear, onYearChange, dateKey]);

  const buildYearCategories = (fy) => {
    const startYear = Number(String(fy).match(/\d{4}/)?.[0]);
    if (!startYear) return [];
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    return months.map((month, index) => {
      const year = index < 9 ? startYear : startYear + 1;
      return `${month}-${String(year).slice(-2)}`;
    });

  };

  let filteredData;
  if (dataPoint === "name") {
    filteredData = data.filter((item) => item.name === selectedYear);
  } else {
    filteredData = data.filter((item) => item.group === selectedYear);
  }

 if (filteredData.length === 0 && dataPoint !== "name") {
    const uniqueSeriesNames = [...new Set((data || []).map((item) => item?.name).filter(Boolean))];
    filteredData = uniqueSeriesNames.map((seriesName) => ({
      name: seriesName,
      group: selectedYear,
      data: Array(12).fill(0),
    }));
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
       categories: buildYearCategories(selectedYear),
    },
  };

  const goToPrevYear = () => {
     setSelectedYearStart((prev) => prev - 1);
  };

  const goToNextYear = () => {
     setSelectedYearStart((prev) => prev + 1);
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
         greenTitle={greenTitle}
        redTitle={redTitle}
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
            {/* <div className="flex items-center pb-2 gap-4 mt-4"> */}
            <div className="flex items-center gap-4 mt-4">
              <SecondaryButton
                title={<MdNavigateBefore />}
                handleSubmit={goToPrevYear}
                // externalStyles="min-w-24 px-6 py-2 bg-[#B8BDC6] text-primary font-semibold rounded-lg"
               // disabled={selectedYearIndex === 0}
              />
              {/* <div className="text-sm min-w-[120px] text-center">
                {selectedYear}
              </div> */}
               <div className="text-primary text-content font-semibold">
                {selectedYear}
              </div>
              <SecondaryButton
                title={<MdNavigateNext />}
                handleSubmit={goToNextYear}
                 externalStyles="min-w-20 px-6 py-2 bg-[#9ca3af] text-black font-semibold rounded-lg"
               // disabled={selectedYearIndex === fiscalYears.length - 1}
              />
            </div>
          </div>
        </div>
      </WidgetSection>
    </div>
  );
};

export default YearlyGraph;
