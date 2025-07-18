import BarGraph from "../../../components/graphs/BarGraph";
import WidgetSection from "../../../components/WidgetSection";
import { inrFormat } from "../../../utils/currencyFormat";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import MonthWiseAgTable from "../../../components/Tables/MonthWiseAgTable";
import WidgetTable from "../../../components/Tables/WidgetTable";
import YearlyGraph from "../../../components/graphs/YearlyGraph";

const TotalRevenue = () => {
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
  const { data: simpleRevenue = [], isLoading: isSimpleRevenue } = useQuery({
    queryKey: ["completeRevenue"],
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
    // const revenue = isTotalLoading
    //   ? []
    //   : totalRevenue.map((category) => ({
    //       vertical: category.name,
    //       revenue: inrFormat(category.data["2024-25"][i]),
    //       percentage: `${100}%`,
    //     }));

    const revenue = isTotalLoading
      ? []
      : totalRevenue.map((category) => {
          const value = category.data?.["2024-25"]?.[i] ?? 0;
          return {
            vertical: category.name,
            revenue: inrFormat(value),
            percentage: "100%",
          };
        });

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
    group: "FY 2024-25",
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
    // tooltip: {
    //   y: {
    //     formatter: function (val, { seriesIndex, dataPointIndex }) {
    //       const actualVal = filteredByYear[seriesIndex]?.data?.[dataPointIndex];
    //       return actualVal ? `INR ${actualVal.toLocaleString()}` : "No data";
    //     },
    //   },
    // },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function ({ dataPointIndex, w }) {
        const monthLabel = w.globals.labels[dataPointIndex];

        // meetings altRevenue
        const meetings = filteredByYear[0]?.data?.[dataPointIndex] ?? 0;
        const altRevenue = filteredByYear[1]?.data?.[dataPointIndex] ?? 0;
        const virtualOffice = filteredByYear[2]?.data?.[dataPointIndex] ?? 0;
        const workation = filteredByYear[3]?.data?.[dataPointIndex] ?? 0;
        const coworking = filteredByYear[4]?.data?.[dataPointIndex] ?? 0;

        return `
      <div style="padding: 10px; width: 300px">
        <div class="apexcharts-tooltip-title" style="margin-bottom: 8px; font-weight: bold;">${monthLabel}</div>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${
            w.globals.colors[0]
          }; display: inline-block;"></span>
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span>Co-Working</span>
            <span>INR ${coworking.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${
            w.globals.colors[1]
          }; display: inline-block;"></span>
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span>Meetings</span>
            <span>INR ${meetings.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${
            w.globals.colors[2]
          }; display: inline-block;"></span>
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span>Virtual Office</span>
            <span>INR ${virtualOffice.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${
            w.globals.colors[3]
          }; display: inline-block;"></span>
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span>Workation</span>
            <span>INR ${workation.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${
            w.globals.colors[4]
          }; display: inline-block;"></span>
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span>Alt Revenues</span>
            <span>INR ${altRevenue.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    `;
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

  console.log("unified : ", unifiedRevenueData);

  const revenueByVertical = useMemo(() => {
    const grouped = {};

    unifiedRevenueData.forEach((entry) => {
      const amount = parseFloat(entry.revenue) || 0;
      if (!grouped[entry.vertical]) {
        grouped[entry.vertical] = 0;
      }
      grouped[entry.vertical] += amount;
    });

    return Object.entries(grouped).map(([vertical, revenue], idx) => ({
      srNo: idx + 1,
      vertical,
      revenue: inrFormat(revenue),
    }));
  }, [unifiedRevenueData]);

  console.log("revenueByVertical : ", revenueByVertical);

  const totalAnnualRevenue = useMemo(() => {
    return revenueByVertical.reduce(
      (sum, item) => sum + parseFloat(item.revenue.replace(/,/g, "")),
      0
    );
  }, [revenueByVertical]);

  return (
    <div className="flex flex-col gap-4 ">
      {isTotalLoading ? (
        <div className="flex h-72 justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <YearlyGraph
          title={"ANNUAL MONTHLY MIX REVENUES"}
          titleAmount={`INR ${inrFormat(totalAnnualRevenue)}`}
          data={normalizedData}
          options={options}
          dateKey={"dateKey"}
        />
      )}

      <WidgetTable
        tableTitle={"Annual Monthly Revenue Breakup"}
        dateColumn="date"
        totalKey="revenue"
        groupByKey="vertical" // 👈 we’ll use this to show 1 row per vertical
        columns={[
          { headerName: "Sr No", field: "srNo", flex: 1 },
          { headerName: "Vertical", field: "vertical", flex: 1 },
          { headerName: "Revenue (INR)", field: "revenue", flex: 1 },
        ]}
        amount={`INR ${inrFormat(totalAnnualRevenue)}`}
        data={unifiedRevenueData}
      />
    </div>
  );
};

export default TotalRevenue;
