import React, { useState, useMemo } from "react";
import WidgetSection from "../../../../components/WidgetSection";
import BarGraph from "../../../../components/graphs/BarGraph";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import DataCard from "../../../../components/DataCard";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import humanDate from "../../../../utils/humanDateForamt";

const Collections = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const axios = useAxiosPrivate();

  const { data: coWorkingData = [], isLoading: isCoWorkingLoading } = useQuery({
    queryKey: ["collections-data"],
    queryFn: async () => {
      const response = await axios.get(`/api/sales/fetch-coworking-revenues`);
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  const kraColumn = [
    { field: "srno", headerName: "Sr No", width: 100 },
    {
      field: "clientName",
      headerName: "Client",
      flex: 1,
      cellRenderer: (params) => (
        <span
          className="text-primary underline cursor-pointer"
          onClick={() => handleViewModal(params.data)}>
          {params.value}
        </span>
      ),
    },
    {
      field: "revenue",
      headerName: "Revenue",
      flex: 1,
      cellRenderer: (params) => `${inrFormat(params.value)}`,
    },
    { field: "rentStatus", headerName: "Status", flex: 1 },
  ];

  const sortedData = useMemo(() => {
    const parseMonth = (str) =>
      new Date(`01-${str.replace("-", "-20")}`).getTime();
    return [...coWorkingData].sort(
      (a, b) => parseMonth(a.month) - parseMonth(b.month)
    );
  }, [coWorkingData]);

  const barGraphData = useMemo(() => {
    const paid = [];
    const unpaid = [];

    sortedData.forEach((entry) => {
      let paidClients = 0;
      let unpaidClients = 0;

      entry.clients?.forEach((c) => {
        if (c.rentStatus === "Unpaid") {
          unpaidClients++;
        } else {
          paidClients++;
        }
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
    // tooltip: {
    //   custom: function ({ series, seriesIndex, dataPointIndex, w }) {
    //     const month = w.globals.categories[dataPointIndex];
    //     const paid = series[0][dataPointIndex];
    //     const unpaid = series[1][dataPointIndex];
    //     const total = paid + unpaid;

    //     return `
    //   <div style="padding:10px;font-family:Poppins-Regular;font-size:13px">
    //     <div><strong>Month:</strong> ${month}</div>
    //     <div><strong>Total Clients:</strong> ${total}</div>
    //     <div style="color:#54C4A7"><strong>Paid:</strong> ${paid}</div>
    //     <div style="color:#EB5C45"><strong>Unpaid:</strong> ${unpaid}</div>
    //   </div>
    // `;
    //   },
    // },

    tooltip: {
      y: {
        formatter: (val) => `${val}%`,
      },
    },
    colors: ["#54C4A7", "#EB5C45"],
  };

  const flatClientData = useMemo(() => {
    return coWorkingData.flatMap((monthObj) =>
      monthObj.clients.map((client, index) => ({
        srno: index + 1,
        ...client,
        date: client.rentDate,
      }))
    );
  }, [coWorkingData]);

  const grandTotal = flatClientData.reduce(
    (acc, client) => acc + (client.revenue || 0),
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
        border>
        <BarGraph data={barGraphData} options={barGraphOptions} />
        <hr />
        <WidgetSection layout={2}>
          <DataCard
            title={"Collected"}
            // description={`Current Month: ${sortedData[0]?.month || "N/A"}`}
            description={`Total : INR ${inrFormat(grandTotal)}`}
            data={`${barGraphData[0]?.data?.[0] || 0}%`}
          />
          <DataCard
            title={"Due"}
            // description={`Current Month: ${sortedData[0]?.month || "N/A"}`}
            description={`Total : INR 0`}
            data={`${barGraphData[1]?.data?.[0] || 0}%`}
          />
        </WidgetSection>
      </WidgetSection>

      <WidgetSection
        border
        title="Collections"
        titleLabel={"FY 2024-25"}
        TitleAmount={`INR ${inrFormat(grandTotal)}`}
        className="bg-white rounded-md shadow-sm">
        <YearWiseTable
          data={flatClientData}
          columns={kraColumn}
          dateColumn="date"
          handleSubmit={() => console.log("Export triggered")}
        />
      </WidgetSection>

      {viewDetails && (
        <MuiModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Collection Details">
          <div className="space-y-3">
            <div className="font-bold">Client & Contract Info</div>
            <DetalisFormatted
              title="Client Name"
              detail={viewDetails.clientName}
            />
            <DetalisFormatted title="Channel" detail={viewDetails.channel} />
            <DetalisFormatted
              title="Total Term"
              detail={`${viewDetails.totalTerm} months`}
            />
            <DetalisFormatted
              title="Rent Status"
              detail={viewDetails.rentStatus}
            />
            <br />
            <div className="font-bold">Space & Financials</div>
            <DetalisFormatted
              title="No. of Desks"
              detail={viewDetails.noOfDesks}
            />
            <DetalisFormatted
              title="Desk Rate"
              detail={`INR ${inrFormat(viewDetails.deskRate)}`}
            />
            <DetalisFormatted
              title="Revenue"
              detail={`INR ${inrFormat(viewDetails.revenue)}`}
            />
            <br />
            <div className="font-bold">Rent Schedule</div>
            <DetalisFormatted
              title="Rent Date"
              detail={humanDate(viewDetails.rentDate)}
            />

            <DetalisFormatted
              title="Past Due Date"
              detail={humanDate(viewDetails.pastDueDate)}
            />
            <DetalisFormatted
              title="Annual Increment"
              detail={`${viewDetails.annualIncrement}%`}
            />
            <DetalisFormatted
              title="Next Increment Date"
              detail={humanDate(viewDetails.nextIncrementDate)}
            />
          </div>
        </MuiModal>
      )}
    </div>
  );
};

export default Collections;
