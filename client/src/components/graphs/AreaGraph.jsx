import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import SecondaryButton from "../SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

dayjs.extend(utc);

const AreaGraph = ({
  responseData,
  onTotalChange,
  timeFilter,
  setTimeFilter,
  onDateLabelChange,
}) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [data, setData] = useState({
    series: [
      { name: "Total Tickets", data: [], color: "#007bff" },
      { name: "Closed Tickets", data: [], color: "#28a745" },
      { name: "Open Tickets", data: [], color: "#ff4d4d" },
    ],
    categories: [],
  });

  // Function to transform the data based on the selected time filter
  const transformData = (data, filter) => {
    // Determine FY start and end based on currentDate
    const isBeforeApril = currentDate.month() < 3; // Jan/Feb/Mar
    const fyStartYear = isBeforeApril
      ? currentDate.year() - 1
      : currentDate.year();
    const fyStart = dayjs(`${fyStartYear}-04-01`);
    const fyEnd = fyStart.add(1, "year").subtract(1, "day");
    const daysInMonth = currentDate.daysInMonth();
    const monthlySeriesTemplate = [
      {
        name: "Total Tickets",
        data: Array(daysInMonth).fill(0),
        color: "#007bff",
      },
      {
        name: "Closed Tickets",
        data: Array(daysInMonth).fill(0),
        color: "#28a745",
      },
      {
        name: "Open Tickets",
        data: Array(daysInMonth).fill(0),
        color: "#ff4d4d",
      },
    ];
    const monthlyCategories = Array.from(
      { length: daysInMonth },
      (_, index) => String(index + 1).padStart(2, "0") // e.g., '01', '02', ...
    );

    const transformed = {
      Yearly: {
        series: [
          { name: "Total Tickets", data: Array(12).fill(0), color: "#007bff" },
          { name: "Closed Tickets", data: Array(12).fill(0), color: "#28a745" },
          { name: "Open Tickets", data: Array(12).fill(0), color: "#ff4d4d" },
        ],
        categories: [
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
      },
      Monthly: {
        series: monthlySeriesTemplate,
        categories: monthlyCategories,
      },
      Weekly: {
        series: [
          { name: "Total Tickets", data: Array(7).fill(0), color: "#007bff" },
          { name: "Closed Tickets", data: Array(7).fill(0), color: "#28a745" },
          { name: "Open Tickets", data: Array(7).fill(0), color: "#ff4d4d" },
        ],
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
    };

    data.forEach((ticket) => {
      const createdAt = dayjs(ticket.createdAt);

      if (filter === "Yearly") {
        if (
          !(createdAt.isSameOrAfter(fyStart) && createdAt.isSameOrBefore(fyEnd))
        )
          return;
      }

      if (filter === "Monthly") {
        if (
          createdAt.year() !== currentDate.year() ||
          createdAt.month() !== currentDate.month()
        )
          return;
      }

      if (filter === "Weekly") {
        const startOfWeek = currentDate.startOf("week");
        const endOfWeek = currentDate.endOf("week");
        if (
          !(
            createdAt.isSameOrAfter(startOfWeek) &&
            createdAt.isSameOrBefore(endOfWeek)
          )
        )
          return;
      }

      let categoryIndex = null;

      if (filter === "Yearly") {
        // Fiscal month offset: Apr = 0, Mar = 11
        const month = createdAt.month(); // 0-11
        categoryIndex = (month + 12 - 3) % 12; // April is 3 → 0
      } else if (filter === "Monthly") {
        categoryIndex = createdAt.date() - 1;
      } else if (filter === "Weekly") {
        categoryIndex = (createdAt.day() + 6) % 7; // Mon = 0
      }

      if (categoryIndex !== null) {
        transformed[filter].series[0].data[categoryIndex] += 1;
        if (ticket.status === "Closed") {
          transformed[filter].series[1].data[categoryIndex] += 1;
        } else if (ticket.status === "Open") {
          transformed[filter].series[2].data[categoryIndex] += 1;
        }
      }
    });

    return transformed[filter];
  };

  // Use effect to transform response data when it changes
  useEffect(() => {
    const transformedData = transformData(responseData, timeFilter);
    setData(transformedData);

    // ✅ Send total count to parent
    if (onTotalChange && transformedData?.series?.[0]?.data) {
      const total = transformedData.series[0].data.reduce(
        (sum, val) => sum + val,
        0
      );
      onTotalChange(total);
    }
  }, [responseData, timeFilter, currentDate]);

  useEffect(() => {
    const transformedData = transformData(responseData, timeFilter);
    setData(transformedData);

    // Total count
    if (onTotalChange && transformedData?.series?.[0]?.data) {
      const total = transformedData.series[0].data.reduce(
        (sum, val) => sum + val,
        0
      );
      onTotalChange(total);
    }

    // Calculate date label
    let label = "";
    if (timeFilter === "Yearly") {
      const fyStart =
        currentDate.month() < 3 ? currentDate.year() - 1 : currentDate.year();
      const fyEnd = fyStart + 1;
      label = `FY ${fyStart}-${String(fyEnd).slice(-2)}`; // ✅ only last 2 digits of end year
    } else if (timeFilter === "Monthly") {
      label = currentDate.format("MMMM YYYY");
    } else if (timeFilter === "Weekly") {
      label = `Week ${Math.ceil(currentDate.date() / 7)} - ${currentDate.format(
        "MMMM"
      )}`;
    }

    // Send label to parent
    if (onDateLabelChange) {
      onDateLabelChange(label);
    }
  }, [responseData, timeFilter, currentDate]);

  const chartOptions = {
    chart: {
      type: "area",
      height: 350,
      fontFamily: "Poppins-Regular",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      scrollable: false,
    },
    colors: data.series.map((item) => item.color),
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: data.categories,
    },
    yaxis: {
      min: 0,

      tickAmount: timeFilter === "Yearly" ? 3 : 5, // ✅ this gives ticks like 0, 10, 20, ...
      labels: {
        formatter: function (val) {
          return val.toFixed(0); // Optional: ensures integers
        },
      },
    },

    tooltip: {
      shared: true,
      intersect: false,
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  return (
    <div className="rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-title font-pregular"></h2>

        <div className="flex gap-2">
          {["Yearly", "Monthly", "Weekly"].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 text-sm font-medium rounded ${
                timeFilter === filter
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-black"
              }`}
              onClick={() => setTimeFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <Chart
        options={chartOptions}
        series={data.series}
        type="area"
        height={350}
      />

      <div className="flex justify-center w-full items-center gap-2">
        <SecondaryButton
          title={<MdNavigateBefore />}
          handleSubmit={() => {
            if (timeFilter === "Yearly") {
              setCurrentDate((prev) => prev.subtract(1, "year"));
            } else if (timeFilter === "Monthly") {
              setCurrentDate((prev) => prev.subtract(1, "month"));
            } else if (timeFilter === "Weekly") {
              setCurrentDate((prev) => prev.subtract(1, "week"));
            }
          }}
        />

        <span className="text-sm font-medium text-gray-700">
          {timeFilter === "Yearly" &&
            `FY ${
              currentDate.month() < 3
                ? currentDate.year() - 1
                : currentDate.year()
            }-${(currentDate.month() < 3
              ? currentDate.year()
              : currentDate.year() + 1
            )
              .toString()
              .slice(-2)}`}

          {timeFilter === "Monthly" && currentDate.format("MMMM YYYY")}
          {timeFilter === "Weekly" &&
            `Week ${Math.ceil(currentDate.date() / 7)} - ${currentDate.format(
              "MMMM"
            )}`}
        </span>

        <SecondaryButton
          title={<MdNavigateNext />}
          handleSubmit={() => {
            if (timeFilter === "Yearly") {
              setCurrentDate((prev) => prev.add(1, "year"));
            } else if (timeFilter === "Monthly") {
              setCurrentDate((prev) => prev.add(1, "month"));
            } else if (timeFilter === "Weekly") {
              setCurrentDate((prev) => prev.add(1, "week"));
            }
          }}
        />
      </div>
    </div>
  );
};

export default AreaGraph;
