import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import WidgetSection from "../../../../components/WidgetSection";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import AgTable from "../../../../components/AgTable";

const months = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

const transformRevenueData = (rawData) => {
  const transformed = [];

  rawData.forEach((item) => {
    const source = item.name;
    const monthlyData = item.data["2024-25"];

    if (Array.isArray(monthlyData)) {
      monthlyData.forEach((value, index) => {
        transformed.push({
          month: months[index],
          source: source,
          totalRevenue: value,
        });
      });
    }
  });

  return transformed;
};

const groupByMonth = (data) => {
  const grouped = {};

  data.forEach(({ month, source, totalRevenue }) => {
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push({
      name: source,
      revenue: totalRevenue,
      clients: [], // You can replace this with actual client data if needed
    });
  });

  return grouped;
};

const ActualBusinessRevenue = () => {
  const axios = useAxiosPrivate();
  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const { data: totalRevenue = [], isLoading: isTotalRevenue } = useQuery({
    queryKey: ["totalRevenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/consolidated-revenue");
      return response.data || [];
    },
  });

  const formattedData = transformRevenueData(totalRevenue);
  const groupedRevenue = groupByMonth(formattedData);
  const selectedMonthData = groupedRevenue[selectedMonth] || [];
  console.log("Selected month : ",selectedMonthData )

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const currentIndex = months.findIndex((m) => m === selectedMonth);

  const handlePrevMonth = () => {
    if (currentIndex > 0) {
      setSelectedMonth(months[currentIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    if (currentIndex < months.length - 1) {
      setSelectedMonth(months[currentIndex + 1]);
    }
  };

  const graphData = [
    {
      name: "Revenue",
      data: selectedMonthData.map((item) => item.revenue),
    },
  ];

  const options = {
    chart: {
      type: "bar",
      toolbar: false,
      stacked: false,
      fontFamily: "Poppins-Regular",
    },
    xaxis: {
      categories: selectedMonthData.map((item) => item.name),
      title: { text: "Verticals" },
    },
    yaxis: {
      title: { text: "Revenue in Lakhs (INR)" },
      labels: {
        formatter: (value) => `${(value / 100000).toLocaleString("en-IN")}`,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "20%",
        borderRadius: 5,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => inrFormat(val),
      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
      offsetY: -22,
    },
    tooltip: {
      enabled: false,
      y: {
        formatter: (value) => `INR ${value.toLocaleString("en-IN")}`,
      },
    },
    legend: { position: "top" },
    colors: ["#54C4A7", "#EB5C45"],
  };

  const tableData = selectedMonthData.map((domain, index) => ({
    id: index + 1,
    vertical: domain.name,
    revenue: ` ${inrFormat(domain.revenue)}`,
    clients: domain.clients || [],
  }));

  return (
    <div className="p-4 flex flex-col gap-4">
      {!isTotalRevenue ? (
        <>
          <WidgetSection
            layout={1}
            title={"Vertical-wise Revenue"}
            titleLabel={`${selectedMonth} 2024`}
            TitleAmount={`INR ${inrFormat(
              selectedMonthData.reduce((sum, d) => sum + d.revenue, 0)
            )}`}
            border
          >
            <NormalBarGraph data={graphData} options={options} height={400} />
          </WidgetSection>

          <div className="flex justify-end">
            <div className="flex items-center gap-4">
              {/* <SecondaryButton handleSubmit={handlePrevMonth} title="Prev" /> */}
              <TextField
                select
                size="small"
                label="Month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-[150px]"
                SelectProps={{
                  IconComponent: KeyboardArrowDownIcon,
                }}
              >
                {months.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </TextField>
              {/* <PrimaryButton handleSubmit={handleNextMonth} title="Next" /> */}
            </div>
          </div>

          <WidgetSection
            border
            title={`Vertical-wise Revenue Breakdown FY 2024-25`}
            TitleAmount={`INR ${inrFormat(
              selectedMonthData.reduce((sum, d) => sum + d.revenue, 0)
            )}`}
          >
            <AgTable
              hideFilter
              tableHeight={300}
              columns={[
                { headerName: "Sr No", field: "id", width: 100 },
                { headerName: "Vertical", field: "vertical", flex: 1 },
                { headerName: "Revenue (INR)", field: "revenue", width: 400 },
              ]}
              data={tableData}
            />
          </WidgetSection>
        </>
      ) : (
        <div className="h-96 flex justify-center items-center">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default ActualBusinessRevenue;
