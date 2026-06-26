import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import SecondaryButton from "../SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import WidgetSection from "../WidgetSection";
import { inrFormat } from "../../utils/currencyFormat";
import BarGraph from "./BarGraph";

const getCurrentFinancialYearLabel = () => {
  const today = dayjs();
  const startYear = today.month() < 3 ? today.year() - 1 : today.year();
  return `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
};

const getFinancialYear = (dateStr) => {
  const date = dayjs(dateStr);
  if (!date.isValid()) return null;
  const year = date.month() < 3 ? date.year() - 1 : date.year();
  return `FY ${year}-${String((year + 1) % 100).padStart(2, "0")}`;
};

const shiftFinancialYear = (fyLabel, direction) => {
  if (!fyLabel?.startsWith("FY")) {
    return getCurrentFinancialYearLabel();
  }

  const [startYearStr] = fyLabel.replace("FY", "").trim().split("-");
  const startYear = parseInt(startYearStr, 10);

  if (Number.isNaN(startYear)) {
    return getCurrentFinancialYearLabel();
  }

  const nextStartYear = startYear + direction;
  return `FY ${nextStartYear}-${String((nextStartYear + 1) % 100).padStart(2, "0")}`;
};

const getMonthsWithYearLabels = (fyLabel) => {
  if (!fyLabel?.startsWith("FY")) return [];
  const [startYearStr] = fyLabel.replace("FY", "").split("-");
  const startYear = parseInt(startYearStr);
  if (isNaN(startYear)) return [];

  const endYear = startYear + 1;
  return [
    { month: "Apr", label: `Apr-${String(startYear).slice(-2)}` },
    { month: "May", label: `May-${String(startYear).slice(-2)}` },
    { month: "Jun", label: `Jun-${String(startYear).slice(-2)}` },
    { month: "Jul", label: `Jul-${String(startYear).slice(-2)}` },
    { month: "Aug", label: `Aug-${String(startYear).slice(-2)}` },
    { month: "Sep", label: `Sep-${String(startYear).slice(-2)}` },
    { month: "Oct", label: `Oct-${String(startYear).slice(-2)}` },
    { month: "Nov", label: `Nov-${String(startYear).slice(-2)}` },
    { month: "Dec", label: `Dec-${String(startYear).slice(-2)}` },
    { month: "Jan", label: `Jan-${String(endYear).slice(-2)}` },
    { month: "Feb", label: `Feb-${String(endYear).slice(-2)}` },
    { month: "Mar", label: `Mar-${String(endYear).slice(-2)}` },
  ];
};

const FyBarGraph = ({
  data = [],
  dateKey = "date",
  valueKey = "revenue",
  chartOptions = {},
  graphTitle = "",
  titleAmount,
  selectedFY: controlledSelectedFY,
  onSelectedFYChange,
  responsiveResize = true,
  chartId = "bargraph"
}) => {
  const [internalSelectedFY, setInternalSelectedFY] = useState(
    getCurrentFinancialYearLabel(),
  );
  const selectedFY = controlledSelectedFY ?? internalSelectedFY;

  const updateSelectedFY = (fy) => {
    if (onSelectedFYChange) {
      onSelectedFYChange(fy);
      return;
    }
    setInternalSelectedFY(fy);
  };

  useEffect(() => {
    if (!selectedFY) {
      updateSelectedFY(getCurrentFinancialYearLabel());
    }
  }, [selectedFY]);

  const monthsWithLabels = useMemo(() => {
    return getMonthsWithYearLabels(selectedFY);
  }, [selectedFY]);

  const filteredData = useMemo(() => {
    return data.filter(
      (item) => getFinancialYear(item?.[dateKey]) === selectedFY
    );
  }, [data, selectedFY, dateKey]);

  const stackedSeries = useMemo(() => {
    if (!selectedFY) return [];
    const base = {};
    const months = getMonthsWithYearLabels(selectedFY);

    filteredData.forEach((item) => {
      const date = dayjs(item?.[dateKey]);
      if (!date.isValid()) return;

      const month = date.format("MMM");
      const match = months.find((m) => m.month === month);
      if (!match) return;

      const label = match.label;
      const vertical = item?.vertical || "Unknown";

      if (!base[vertical]) base[vertical] = {};
      base[vertical][label] =
        (base[vertical][label] || 0) + (parseFloat(item?.[valueKey]) || 0);
    });

    return Object.entries(base).map(([vertical, monthData]) => ({
      name: vertical,
      data: months.map(({ label }) => monthData[label] || 0),
    }));
  }, [filteredData, selectedFY, valueKey, dateKey]);

  const mergedChartOptions = useMemo(() => {
    return {
      chart: {
        type: "bar",
        stacked: true,
        height: 350,
        toolbar: { show: false },
        fontFamily: "Poppins-Regular",
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: "40%",
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: monthsWithLabels.map((m) => m.label),
      },
      yaxis: {
        labels: {
          formatter: (val) =>
            typeof val === "number" ? val.toLocaleString("en-IN") : "0",
        },
      },
      legend: {
        position: "top",
      },
      colors: ["#1E3D73", "#4CAF50", "#FF9800", "#9C27B0", "#F44336"],
      ...chartOptions,
    };
  }, [monthsWithLabels, chartOptions]);
  const fyTotal = useMemo(() => {
    return stackedSeries.reduce((total, vertical) => {
      return (
        total +
        vertical.data.reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
      );
    }, 0);
  }, [stackedSeries]);

  return (
    <WidgetSection
      border
      title={`${graphTitle} ${selectedFY}`}
      TitleAmount={titleAmount || `INR ${inrFormat(fyTotal)}`}
    >
      <div className="flex flex-col gap-4 rounded-md">
        <BarGraph
          options={mergedChartOptions}
          data={stackedSeries}
          responsiveResize={responsiveResize}
          chartId={chartId}
          height={350}
        />

        <div className="flex justify-center items-center gap-4 mt-4">
          <SecondaryButton
            title={<MdNavigateBefore />}
            handleSubmit={() => updateSelectedFY(shiftFinancialYear(selectedFY, -1))}
          />

          <span className="text-primary text-content font-semibold">
            {selectedFY || "N/A"}
          </span>

          <SecondaryButton
            handleSubmit={() => updateSelectedFY(shiftFinancialYear(selectedFY, 1))}
            title={<MdNavigateNext />}
          />
        </div>
      </div>
    </WidgetSection>
  );
};

export default FyBarGraph;
