import BarGraph from "../../../../components/graphs/BarGraph";
import WidgetSection from "../../../../components/WidgetSection";
import { inrFormat } from "../../../../utils/currencyFormat";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import MonthWiseAgTable from "../../../../components/Tables/MonthWiseAgTable";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import WidgetTable from "../../../../components/Tables/WidgetTable";
import FyBarGraph from "../../../../components/graphs/FyBarGraph";

const IncomeDetails = () => {
  const axios = useAxiosPrivate();
  const [selectedYear, setSelectedYear] = useState("2024-25");

  const { data: simpleRevenue = [], isLoading: isTotalLoading } = useQuery({
    queryKey: ["simpleRevenue"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/sales/simple-consolidated-revenue"
        );
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
  });

  const { data: totalRevenue = [], isLoading } = useQuery({
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

  const unifiedRevenueData = useMemo(() => {
    if (!simpleRevenue) return [];

    const flatten = [];

    simpleRevenue.meetingRevenue?.forEach((item) => {
      flatten.push({
        vertical: "Meeting",
        revenue: item.taxable,
        date: item.date,
      });
    });

    simpleRevenue.alternateRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Alternate",
        revenue: item.taxableAmount,
        date: item.invoiceCreationDate,
      });
    });

    simpleRevenue.virtualOfficeRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Virtual Office",
        revenue: item.taxableAmount,
        date: item.rentDate,
      });
    });

    simpleRevenue.workationRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Workation",
        revenue: item.taxableAmount,
        date: item.date,
      });
    });

    simpleRevenue.coworkingRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Coworking",
        revenue: item.revenue,
        date: item.rentDate,
      });
    });

    return flatten;
  }, [simpleRevenue]);

  const filteredByYear = totalRevenue?.map((item) => ({
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

      <WidgetTable
        tableTitle="Annual Monthly Income Breakup"
        data={unifiedRevenueData}
        dateColumn="date"
        totalKey="revenue"
        totalText="INR"
        groupByKey="vertical" // ✅ triggers dynamic grouping by vertical
        columns={[
          { headerName: "Sr No", field: "srNo", flex: 1 },
          { headerName: "Vertical", field: "vertical", flex: 1 },
          {
            headerName: "Revenue (INR)",
            field: "revenue",
            flex: 1,
            cellRenderer: (params) => params.value,
          },
        ]}
      />
    </div>
  );
};

export default IncomeDetails;
