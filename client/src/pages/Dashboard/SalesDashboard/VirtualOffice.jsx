import { inrFormat } from "../../../utils/currencyFormat";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import { parseRevenue } from "../../../utils/removeCommaInNum";
import { Skeleton } from "@mui/material";
import MonthWiseAgTable from "../../../components/Tables/MonthWiseAgTable";
import WidgetTable from "../../../components/Tables/WidgetTable";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import StatusChip from "../../../components/StatusChip";
import humanDate from "../../../utils/humanDateForamt";
import FyBarGraph from "../../../components/graphs/FyBarGraph";

const VirtualOffice = () => {
  const axios = useAxiosPrivate();
  const {
    data: virtualOfficeRevenue,
    isLoading: isLoadingVirtualOfficeRevenue = [],
  } = useQuery({
    queryKey: ["virtualOfficeRevenue"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/sales/get-virtual-office-revenue`
        );
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const options = {
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        // Format the value here for display in the chart
        return `${inrFormat(val)}`; // Use inrFormat only for display
      },
      style: {
        fontSize: "10px",
        fontWeight: "bold",
        colors: ["#000"],
      },
      offsetY: -22,
    },
    yaxis: {
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => val / 100000, // Display in Lakhs
      },
    },
    tooltip: {
      enabled: false,
      y: {
        formatter: (val) => `INR ${val.toLocaleString()}`, // Format tooltip
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 5,
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: ["#11daf5"],
  };

  const tableData = isLoadingVirtualOfficeRevenue
    ? []
    : virtualOfficeRevenue.map((item) => ({
        ...item,
        clientName: item.client?.clientName,
      }));

  return (
    <div className="flex flex-col gap-4">
      {!isLoadingVirtualOfficeRevenue ? (
        <FyBarGraph
          graphTitle="ANNUAL MONTHLY VIRTUAL OFFICE REVENUES"
          data={isLoadingVirtualOfficeRevenue ? [] : virtualOfficeRevenue}
          dateKey="rentDate"
          valueKey="revenue"
          chartOptions={options}
        />
      ) : (
        <Skeleton height={"500px"} width={"100%"} />
      )}

      {!isLoadingVirtualOfficeRevenue ? (
        <WidgetTable
          tableTitle={"Monthly Revenue with Client Details"}
          data={tableData}
          totalKey="revenue"
          dateColumn={"rentDate"}
          columns={[
            { headerName: "Sr No", field: "srNo", flex: 1 },
            { headerName: "Client Name", field: "clientName", flex: 1 },
            {
              headerName: "Revenue (INR)",
              field: "revenue",
              flex: 1,
              cellRenderer: (params) => inrFormat(params.value || 0),
            },
            {
              headerName: "Status",
              field: "status",
              flex: 1,
              cellRenderer: (params) => (
                <StatusChip status={params.value ? "Paid" : "Unpaid"} />
              ),
            },
          ]}
        />
      ) : (
        <Skeleton height={"500px"} width={"100%"} />
      )}
    </div>
  );
};

export default VirtualOffice;
