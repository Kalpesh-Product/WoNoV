import BarGraph from "../../../components/graphs/BarGraph";
import WidgetSection from "../../../components/WidgetSection";
import { inrFormat } from "../../../utils/currencyFormat";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CircularProgress } from "@mui/material";
import MonthWiseAgTable from "../../../components/Tables/MonthWiseAgTable";

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
        const response = await axios.get("/api/sales/simple-consolidated-revenue");
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

    const coworking = filteredByYear[0]?.data?.[dataPointIndex] ?? 0;
    const meetings = filteredByYear[1]?.data?.[dataPointIndex] ?? 0;
    const virtualOffice = filteredByYear[2]?.data?.[dataPointIndex] ?? 0;
    const workation = filteredByYear[3]?.data?.[dataPointIndex] ?? 0;
    const altRevenue = filteredByYear[4]?.data?.[dataPointIndex] ?? 0;

    return `
      <div style="padding: 10px; width: 300px">
        <div class="apexcharts-tooltip-title" style="margin-bottom: 8px; font-weight: bold;">${monthLabel}</div>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${w.globals.colors[0]}; display: inline-block;"></span>
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span>Co-Working</span>
            <span>INR ${coworking.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${w.globals.colors[1]}; display: inline-block;"></span>
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span>Meetings</span>
            <span>INR ${meetings.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${w.globals.colors[2]}; display: inline-block;"></span>
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span>Virtual Office</span>
            <span>INR ${virtualOffice.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${w.globals.colors[3]}; display: inline-block;"></span>
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span>Workation</span>
            <span>INR ${workation.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${w.globals.colors[4]}; display: inline-block;"></span>
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

  const totalAnnualRevenue = filteredByYear.reduce((sum, domain) => {
    return sum + domain.data.reduce((acc, monthVal) => acc + monthVal, 0);
  }, 0);

  return (
    <div className="flex flex-col gap-4 ">
      {isTotalLoading ? (
        <div className="flex h-72 justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <WidgetSection
          layout={1}
          title={"Annual Monthly Mix Revenues FY 2024-25"}
          border
          TitleAmount={`INR ${inrFormat(totalAnnualRevenue)}`}
        >
          <BarGraph height={400} data={normalizedData} options={options} />
        </WidgetSection>
      )}

      {/* <WidgetSection
        border
        title={"Annual Monthly Revenue Breakup"}
        padding
        TitleAmount={`INR ${inrFormat(totalAnnualRevenue)}`}
      >
        <div className="flex flex-col gap-2 rounded-md p-4">
          <CollapsibleTable
            columns={[
              { headerName: "Vertical", field: "vertical" },
              { headerName: "Revenue (INR)", field: "revenue" },
              {
                headerName: "Percentage Of Business (%)",
                field: "contribution",
              },
            ]}
            data={filteredByYear.map((domain, index) => {
              const totalRevenue = domain.data.reduce(
                (sum, val) => sum + val,
                0
              );
              const contribution =
                totalAnnualRevenue > 0
                  ? ((totalRevenue / totalAnnualRevenue) * 100).toFixed(2)
                  : "0.00";

              return {
                id: index,
                vertical: domain.name,
                revenue: totalRevenue.toLocaleString("en-IN"),
                contribution: `${contribution}%`,
                monthly: domain.data.map((val, idx) => {
                  const [shortMonth, yearSuffix] = [
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
                  ][idx].split("-");

                  const fullMonthMap = {
                    Jan: "January",
                    Feb: "February",
                    Mar: "March",
                    Apr: "April",
                    May: "May",
                    Jun: "June",
                    Jul: "July",
                    Aug: "August",
                    Sep: "September",
                    Oct: "October",
                    Nov: "November",
                    Dec: "December",
                  };

                  return {
                    srNo: idx + 1,
                    month: fullMonthMap[shortMonth],
                    year: `20${yearSuffix}`,
                    revenue: val.toLocaleString("en-IN"),
                  };
                }),
              };
            })}
            renderExpandedRow={(row) => (
              <AgTable
                data={row.monthly}
                columns={[
                  { headerName: "Sr No", field: "srNo", flex: 1 },
                  { headerName: "Month", field: "month", flex: 1 },
                  { headerName: "Year", field: "year", flex: 1 },
                  { headerName: "Revenue (INR)", field: "revenue", flex: 1 },
                ]}
                tableHeight={300}
                hideFilter
              />
            )}
          /> 

         
        </div>
         
      </WidgetSection> */}

      <MonthWiseAgTable
        title={"Annual Monthly Revenue Breakup"}
        passedColumns={[
          { headerName: "Sr No", field: "srNo", flex: 1 },
          { headerName: "Vertical", field: "vertical", flex: 1 },
          { headerName: "Revenue (INR)", field: "revenue", flex: 1 },
        ]}
        amount={`INR ${inrFormat(totalAnnualRevenue)}`}
        financialData={financialDataForTable}
      />
    </div>
  );
};

export default TotalRevenue;
