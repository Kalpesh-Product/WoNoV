import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";

const ScatterGraph = () => {
  const [chartData, setChartData] = useState({ inTimes: [], outTimes: [] });
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"));

  // Mock data
  const data = [
    { date: "2023-10-01", inTime: "09:30", outTime: "17:30" },
    { date: "2023-10-02", inTime: "09:45", outTime: "17:45" },
    { date: "2023-10-03", inTime: "10:00", outTime: "18:00" },
    { date: "2023-10-04", inTime: "09:40", outTime: "17:50" },
    { date: "2023-10-05", inTime: "09:50", outTime: "17:40" },
    { date: "2023-10-06", inTime: "10:10", outTime: "18:20" },
    { date: "2023-10-07", inTime: "09:35", outTime: "17:35" },
    { date: "2023-10-08", inTime: "10:00", outTime: "18:00" },
    { date: "2023-10-09", inTime: "09:50", outTime: "17:40" },
    { date: "2023-10-10", inTime: "09:30", outTime: "17:30" },
    { date: "2023-10-11", inTime: "09:45", outTime: "17:45" },
    { date: "2023-10-12", inTime: "10:00", outTime: "18:15" },
    { date: "2023-10-13", inTime: "09:40", outTime: "17:50" },
    { date: "2023-10-14", inTime: "09:55", outTime: "17:35" },
    { date: "2023-10-15", inTime: "10:20", outTime: "18:10" },
    { date: "2023-10-16", inTime: "09:30", outTime: "17:30" },
    { date: "2023-10-17", inTime: "09:45", outTime: "17:45" },
    { date: "2023-10-18", inTime: "10:00", outTime: "18:00" },
    { date: "2023-10-19", inTime: "09:40", outTime: "17:50" },
    { date: "2023-10-20", inTime: "09:50", outTime: "17:40" },
    { date: "2023-10-21", inTime: "10:10", outTime: "18:20" },
    { date: "2023-10-22", inTime: "09:35", outTime: "17:35" },
    { date: "2023-10-23", inTime: "10:00", outTime: "18:00" },
    { date: "2023-10-24", inTime: "09:50", outTime: "17:40" },
    { date: "2023-10-25", inTime: "09:30", outTime: "17:30" },
    { date: "2023-10-26", inTime: "09:45", outTime: "17:45" },
    { date: "2023-10-27", inTime: "10:00", outTime: "18:15" },
    { date: "2023-10-28", inTime: "09:40", outTime: "17:50" },
    { date: "2023-10-29", inTime: "09:55", outTime: "17:35" },
    { date: "2023-10-30", inTime: "10:20", outTime: "18:10" },
    { date: "2023-10-31", inTime: "09:30", outTime: "17:30" },
  ];
  

  // Parse time into minutes for the Y-axis
  const parseTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  useEffect(() => {
    const inTimes = [];
    const outTimes = [];

    data.forEach((item) => {
      if (item.date.startsWith(currentMonth)) {
        const formattedDate = dayjs(item.date).format("DD MMM");

        inTimes.push({ x: formattedDate, y: parseTimeToMinutes(item.inTime) });
        outTimes.push({ x: formattedDate, y: parseTimeToMinutes(item.outTime) });
      }
    });

    setChartData({ inTimes, outTimes });
  }, [currentMonth]);

  // Temporary month change for 1 second to force chart re-render
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentMonth((prevMonth) =>
        prevMonth === "2023-10" ? dayjs().format("YYYY-MM") : "2023-10"
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const options = {
    chart: {
      type: "scatter",
      fontFamily:'Poppins-Regular',
      zoom: {
        enabled: true,
        type: "xy",
      },
    },
    xaxis: {
      title: {
        text: "Date",
      },
    },
    yaxis: {
      min: 570, // 9:30 AM in minutes
      max: 1170, // 7:30 PM in minutes
      tickAmount: 12,
      labels: {
        formatter: (value) => {
          const hours = Math.floor(value / 60);
          const minutes = value % 60;
          return `${hours}:${minutes.toString().padStart(2, "0")}`;
        },
      },
      title: {
        text: "Time",
      },
    },
    markers: {
      size: 5,
    },
    legend: {
      show: true,
      position: "top",
    },
    tooltip: {
      x: {
        formatter: (val) => val,
      },
      y: {
        formatter: (value) => {
          const hours = Math.floor(value / 60);
          const minutes = value % 60;
          return `${hours}:${minutes.toString().padStart(2, "0")}`;
        },
      },
    },
  };

  return (
    <div>
      <Chart
        options={options}
        series={[
          { name: "In Time", data: chartData.inTimes, color: "blue" },
          { name: "Out Time", data: chartData.outTimes, color: "red" },
        ]}
        type="scatter"
        height={450}
      />
    </div>
  );
};

export default ScatterGraph;
