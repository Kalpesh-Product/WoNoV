import React, { useState, useMemo } from "react";
import WidgetSection from "../../../../components/WidgetSection";
import BarGraph from "../../../../components/graphs/BarGraph";
import AgTable from "../../../../components/AgTable";
import CollapsibleTable from "../../../../components/Tables/MuiCollapsibleTable";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import DataCard from "../../../../components/DataCard";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";

const Collections = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const axios = useAxiosPrivate();

  const { data: coWorkingData = [], isLoading: isCoWorkingLoading } = useQuery({
    queryKey: ["coWorkingData"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/sales/fetch-coworking-revenues`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const kraColumn = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "client", headerName: "Client", flex: 1 },
    { field: "amount", headerName: "Amount (INR)", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => handleViewModal(params.data)}
          >
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  const sortByMonth = (data) => {
    const parseMonth = (str) =>
      new Date(`01-${str.replace("-", "-20")}`).getTime();
    return [...data].sort((a, b) => parseMonth(a.month) - parseMonth(b.month));
  };

  const sortedData = useMemo(() => sortByMonth(coWorkingData), [coWorkingData]);

  const financialData = useMemo(() => {
    return sortedData.map((monthEntry) => {
      const rows = (monthEntry.clients || []).map((client, index) => ({
        srNo: index + 1,
        client: client.clientName,
        amount: client.revenue,
        status: client.rentStatus || "Paid",
        date: client.pastDueDate
          ? new Date(client.pastDueDate)
              .toLocaleDateString("en-GB")
              .replace(/\//g, "-")
          : "NA",
      }));

      const totalAmount = rows.reduce(
        (acc, curr) => acc + (curr.amount || 0),
        0
      );

      return {
        month: monthEntry.month,
        totalAmount: Math.round(totalAmount),
        tableData: {
          columns: kraColumn,
          rows,
        },
      };
    });
  }, [sortedData]);

  const barGraphData = useMemo(() => {
    const paid = [];
    const unpaid = [];

    sortedData.forEach((entry) => {
      let paidClients = 0;
      let unpaidClients = 0;
      entry.clients?.forEach((c) => {
        if (c.rentStatus === "Paid") paidClients++;
        else unpaidClients++;
      });

      const total = paidClients + unpaidClients || 1;
      paid.push(Math.round((paidClients / total) * 100));
      unpaid.push(Math.round((unpaidClients / total) * 100));
    });

    return [
      { name: "Paid", data: paid },
      { name: "Unpaid", data: unpaid },
    ];
  }, [sortedData]);

  const barGraphOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "40%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
    },
    xaxis: {
      categories: sortedData.map((item) => item.month),
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (val) => `${val}%`,
      },
      title: {
        text: "Client Collection %",
      },
    },
    legend: { position: "top" },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const month = w.globals.categories[dataPointIndex];
        const paid = series[0][dataPointIndex];
        const unpaid = series[1][dataPointIndex];
        const total = paid + unpaid;

        return `
      <div style="padding:10px;font-family:Poppins-Regular;font-size:13px">
        <div><strong>Month:</strong> ${month}</div>
        <div><strong>Total Clients:</strong> ${total}</div>
        <div style="color:#54C4A7"><strong>Paid:</strong> ${paid}</div>
        <div style="color:#EB5C45"><strong>Unpaid:</strong> ${unpaid}</div>
      </div>
    `;
      },
    },

    colors: ["#54C4A7", "#EB5C45"],
  };

  const grandTotal = financialData.reduce(
    (acc, item) => acc + item.totalAmount,
    0
  );

  if (isCoWorkingLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <WidgetSection
        layout={1}
        title={"COLLECTIONS"}
        titleLabel={"FY 2024-25"}
        border
      >
        <BarGraph data={barGraphData} options={barGraphOptions} />
        <hr />
        <WidgetSection layout={2}>
          <DataCard
            title={"Paid"}
            description={`Current Month: ${sortedData[0]?.month || "N/A"}`}
            data={`${barGraphData[0]?.data?.[0] || 0}%`}
          />
          <DataCard
            title={"Unpaid"}
            description={`Current Month: ${sortedData[0]?.month || "N/A"}`}
            data={`${barGraphData[1]?.data?.[0] || 0}%`}
          />
        </WidgetSection>
      </WidgetSection>

      <WidgetSection
        border
        title="Collections"
        titleLabel={"FY 2024-25"}
        TitleAmount={`INR ${inrFormat(grandTotal)}`}
        className="bg-white rounded-md shadow-sm"
      >
        <CollapsibleTable
          columns={[
            { field: "month", headerName: "Month" },
            { field: "totalAmount", headerName: "Total Amount (INR)" },
          ]}
          data={financialData.map((data, index) => ({
            id: index,
            month: data.month,
            totalAmount: `INR ${data.totalAmount.toLocaleString("en-IN")}`,
            tableData: data.tableData,
          }))}
          renderExpandedRow={(row) => {
            if (!row?.tableData?.rows || !Array.isArray(row.tableData.rows)) {
              return <div>No table data available</div>;
            }

            return (
              <AgTable
                search
                data={row.tableData.rows}
                columns={row.tableData.columns}
                tableHeight={250}
              />
            );
          }}
        />
      </WidgetSection>

      {viewDetails && (
        <MuiModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Collection Details"
        >
          <div className="space-y-3">
            <DetalisFormatted title="Client" detail={viewDetails.client} />
            <DetalisFormatted
              title="Amount Paid"
              detail={`INR ${Number(
                viewDetails.amount?.toString().replace(/,/g, "")
              ).toLocaleString("en-IN")}`}
            />
            <DetalisFormatted title="Payment Date" detail={viewDetails.date} />
            <DetalisFormatted
              title="Payment Status"
              detail={viewDetails.status}
            />
          </div>
        </MuiModal>
      )}
    </div>
  );
};

export default Collections;
