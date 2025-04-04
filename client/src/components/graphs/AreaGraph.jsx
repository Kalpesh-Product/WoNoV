import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs"; // Import dayjs for date manipulation

const AreaGraph = ({ responseData }) => {
  const [timeFilter, setTimeFilter] = useState("Yearly"); // State for the filter
  console.log("Response length : ",responseData.length)

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
    const transformed = {
      Yearly: {
        series: [
          { name: "Total Tickets", data: Array(12).fill(0), color: "#007bff" }, // Blue
          { name: "Closed Tickets", data: Array(12).fill(0), color: "#28a745" }, // Green
          { name: "Open Tickets", data: Array(12).fill(0), color: "#ff4d4d" }, // Red
        ],
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
      Monthly: {
        series: [
          { name: "Total Tickets", data: Array(7).fill(0), color: "#007bff" },
          { name: "Closed Tickets", data: Array(7).fill(0), color: "#28a745" },
          { name: "Open Tickets", data: Array(7).fill(0), color: "#ff4d4d" },
        ],
        categories: [
          "Week 1",
          "Week 2",
          "Week 3",
          "Week 4",
          "Week 5",
          "Week 6",
          "Week 7",
        ],
      },

      Weekly: {
        series: [
          { name: "Total Tickets", data: Array(7).fill(0), color: "#007bff" }, // Blue
          { name: "Closed Tickets", data: Array(7).fill(0), color: "#28a745" }, // Green
          { name: "Open Tickets", data: Array(7).fill(0), color: "#ff4d4d" }, // Red
        ],
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
    };

    const currentYear = currentDate.year();
    const currentMonth = currentDate.month();

    data.forEach((ticket) => {
      const createdAt = dayjs(ticket.createdAt); // Use dayjs to parse the date

      // Filter for each time range
      if (filter === "Yearly" && createdAt.year() !== currentYear) return;
      if (
        filter === "Monthly" &&
        (createdAt.year() !== currentYear || createdAt.month() !== currentMonth)
      )
        return;
      if (filter === "Weekly") {
        const startOfWeek = currentDate.startOf("week");
        const endOfWeek = currentDate.endOf("week");
        if (
          !(
            createdAt.isAfter(startOfWeek.subtract(1, "day")) &&
            createdAt.isBefore(endOfWeek.add(1, "day"))
          )
        )
          return;
      }

      // Depending on the filter, categorize and count the tickets
      let categoryIndex = null;
      switch (filter) {
        case "Yearly":
          categoryIndex = createdAt.month();
          break;
        case "Monthly":
          categoryIndex = Math.min(Math.floor((createdAt.date() - 1) / 7), 6);
          break;
        case "Weekly":
          categoryIndex = createdAt.day(); // 0 (Sun) - 6 (Sat)
          break;
        default:
          break;
      }

      // Count total, closed, and open tickets for each category
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
      max: timeFilter === "Yearly" ? 250 : 100,
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  return (
    <div className="rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-title font-pregular"></h2>

        <div className="flex items-center gap-2">
          <button
            className="text-sm px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => {
              if (timeFilter === "Yearly") {
                setCurrentDate((prev) => prev.subtract(1, "year"));
              } else if (timeFilter === "Monthly") {
                setCurrentDate((prev) => prev.subtract(1, "month"));
              } else if (timeFilter === "Weekly") {
                setCurrentDate((prev) => prev.subtract(1, "week"));
              }
            }}
          >
            Prev
          </button>

          <span className="text-sm font-medium text-gray-700">
            {timeFilter === "Yearly" && currentDate.format("YYYY")}
            {timeFilter === "Monthly" && currentDate.format("MMMM YYYY")}
            {timeFilter === "Weekly" &&
              `Week of ${currentDate.startOf("week").format("MMM D")}`}
          </span>

          <button
            className="text-sm px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => {
              if (timeFilter === "Yearly") {
                setCurrentDate((prev) => prev.add(1, "year"));
              } else if (timeFilter === "Monthly") {
                setCurrentDate((prev) => prev.add(1, "month"));
              } else if (timeFilter === "Weekly") {
                setCurrentDate((prev) => prev.add(1, "week"));
              }
            }}
          >
            Next
          </button>
        </div>

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
    </div>
  );
};

export default AreaGraph;
