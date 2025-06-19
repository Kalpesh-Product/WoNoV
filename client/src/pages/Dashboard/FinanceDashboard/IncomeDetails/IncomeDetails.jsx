import BarGraph from "../../../../components/graphs/BarGraph";
import WidgetSection from "../../../../components/WidgetSection";
import { inrFormat } from "../../../../utils/currencyFormat";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CircularProgress } from "@mui/material";
import MonthWiseAgTable from "../../../../components/Tables/MonthWiseAgTable";

const IncomeDetails = () => {
  const axios = useAxiosPrivate();
  const [selectedYear, setSelectedYear] = useState("2024-25");
  

  const { data: totalRevenue = [], isLoading: isTotalLoading } = useQuery({
    queryKey: ["totalRevenue"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/consolidated-revenue");
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
  });

  const months = [
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
  ];

  const financialDataForTable = months.map((monthLabel, i) => {
    const revenue = isTotalLoading
      ? []
      : totalRevenue.map((category) => ({
          vertical: category.name,
          revenue: inrFormat(category.data["2024-25"][i]),
          percentage: `${100}%`,
        }));

    return {
      month: monthLabel,
      revenue,
    };
  });

  const filteredByYear = totalRevenue.map((item) => ({
    name: item.name,
    data: item.data[selectedYear] || [],
  }));

  const normalizedData = filteredByYear.map((domain) => ({
    name: domain.name,
    data: domain.data.map((val, idx) => {
      const totalThisMonth = filteredByYear.reduce(
        (sum, item) => sum + item.data[idx],
        0
      );
      return totalThisMonth ? Math.round((val / totalThisMonth) * 100) : 0;
    }),
  }));
  const options = {
    chart: {
      toolbar: false,
      stacked: true,
      fontFamily: "Poppins-Regular",
    },
    xaxis: {
      categories: [
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
      title: { text: "" },
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (val) => `${val}%`,
      },
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex, dataPointIndex }) {
          const actualVal = filteredByYear[seriesIndex]?.data?.[dataPointIndex];
          return actualVal ? `INR ${actualVal.toLocaleString()}` : "No data";
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
      },
    },
    legend: {
      show: true,
      position: "top",
    },
    colors: [
      "#1E3D73", // Dark Blue (Co-Working)
      "#2196F3", // Bright Blue (Meetings)
      "#11daf5", // Light Mint Green (Virtual Office)
      "#00BCD4", // Cyan Blue (Workation)
      "#1976D2", // Medium Blue (Alt Revenues)
    ],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${val}%`;
      },
      style: {
        fontSize: "10px",
        fontWeight: "bold",
        colors: ["#fff"],
      },
    },
  };

  const totalAnnualRevenue = filteredByYear.reduce((sum, domain) => {
    return sum + domain.data.reduce((acc, monthVal) => acc + monthVal, 0);
  }, 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      {isTotalLoading ? (
        <div className="flex h-72 justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <WidgetSection
          layout={1}
          title={"Annual Monthly Mix Income FY 2024-25"}
          border
          TitleAmount={`INR ${inrFormat(totalAnnualRevenue)}`}
        >
          <BarGraph height={400} data={normalizedData} options={options} />
        </WidgetSection>
      )}

      <MonthWiseAgTable
        title={"Annual Monthly Income Breakup"}
        passedColumns={[
          { headerName: "Sr No", field: "srNo", flex: 1 },
          { headerName: "Vertical", field: "vertical", flex: 1 },
          { headerName: "Revenue (INR)", field: "revenue", flex: 1 },
        ]}
        // amount={`INR ${inrFormat(totalAnnualRevenue)}`}
        financialData={financialDataForTable}
      />
    </div>
  );
};

export default IncomeDetails;
