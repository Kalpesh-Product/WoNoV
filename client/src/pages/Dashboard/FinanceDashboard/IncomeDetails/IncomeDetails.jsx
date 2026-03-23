import BarGraph from "../../../../components/graphs/BarGraph";
import WidgetSection from "../../../../components/WidgetSection";
import { inrFormat } from "../../../../utils/currencyFormat";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { CircularProgress } from "@mui/material";
import MonthWiseAgTable from "../../../../components/Tables/MonthWiseAgTable";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import WidgetTable from "../../../../components/Tables/WidgetTable";
import FyBarGraph from "../../../../components/graphs/FyBarGraph";
import FyBarGraphPercentage from "../../../../components/graphs/FyBarGraphPercentage";

const IncomeDetails = () => {
  const axios = useAxiosPrivate();
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

  // const { data: totalRevenue = [], isLoading } = useQuery({
  //   queryKey: ["totalRevenue"],
  //   queryFn: async () => {
  //     try {
  //       const response = await axios.get("/api/sales/consolidated-revenue");
  //       return response.data;
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   },
  // });

  const unifiedRevenueData = useMemo(() => {
    if (!simpleRevenue) return [];

    const revenueSources = [
      {
        key: "meetingRevenue",
        vertical: "Meeting",
        revenueKey: "taxable",
        dateKeys: ["date"],
      },
      {
        key: "alternateRevenues",
        vertical: "Alternate Revenue",
        revenueKey: "taxableAmount",
        dateKeys: ["invoiceCreationDate", "invoicePaidDate", "createdAt"],
      },
      {
        key: "virtualOfficeRevenues",
        vertical: "Virtual Office",
        revenueKey: "taxableAmount",
        dateKeys: ["rentDate", "createdAt"],
      },
      {
        key: "workationRevenues",
        vertical: "Workation",
        revenueKey: "taxableAmount",
        dateKeys: ["date", "createdAt"],
      },
      {
        key: "coworkingRevenues",
        vertical: "Coworking",
        revenueKey: "revenue",
        dateKeys: ["rentDate", "createdAt"],
      },
    ];

    return revenueSources.flatMap(({ key, vertical, revenueKey, dateKeys }) =>
      (simpleRevenue[key] || []).flatMap((item) => {
        const validDateKey = dateKeys.find((dateKey) => item?.[dateKey]);

        if (!validDateKey) {
          return [];
        }

        return {
          vertical,
          revenue: Number(item?.[revenueKey]) || 0,
          date: item[validDateKey],
        };
      })
    );
  }, [simpleRevenue]);
  const options = {
    colors: [
      "#1E3D73", // Dark Blue (Co-Working)
      "#2196F3", // Bright Blue (Meetings)
      "#11daf5", // Light Mint Green (Virtual Office)
      "#00BCD4", // Cyan Blue (Workation)
      "#1976D2", // Medium Blue (Alt Revenues)
    ],
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {isTotalLoading ? (
        <div className="flex h-72 justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <FyBarGraphPercentage
          data={isTotalLoading ? [] : unifiedRevenueData}
          dateKey="date"
          valueKey="revenue"
          graphTitle="ANNUAL MONTHLY MIX INCOME"
          chartOptions={options}
        />
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
