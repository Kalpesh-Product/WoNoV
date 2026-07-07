import React, { useEffect, useState, useMemo } from "react";
import WidgetSection from "../../../../components/WidgetSection";
import BarGraph from "../../../../components/graphs/BarGraph";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import DataCard from "../../../../components/DataCard";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";
// import YearWiseTable from "../../../../components/Tables/YearWiseTable";
// import { MdOutlineRemoveRedEye } from "react-icons/md";
import humanDate from "../../../../utils/humanDateForamt";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import WidgetTable from "../../../../components/Tables/WidgetTable";
import SecondaryButton from "../../../../components/SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import StatusChip from "../../../../components/StatusChip";

// const fiscalYears = ["FY 2024-25", "FY 2025-26"];

// const fiscalYearMonthMap = {
//   "FY 2024-25": [
//     "Apr-24",
//     "May-24",
//     "Jun-24",
//     "Jul-24",
//     "Aug-24",
//     "Sep-24",
//     "Oct-24",
//     "Nov-24",
//     "Dec-24",
//     "Jan-25",
//     "Feb-25",
//     "Mar-25",
//   ],
//   "FY 2025-26": [
//     "Apr-25",
//     "May-25",
//     "Jun-25",
//     "Jul-25",
//     "Aug-25",
//     "Sep-25",
//     "Oct-25",
//     "Nov-25",
//     "Dec-25",
//     "Jan-26",
//     "Feb-26",
//     "Mar-26",
//   ],
dayjs.extend(customParseFormat);

const fiscalMonths = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

const getFiscalYearStart = (date = dayjs()) => {
  const parsedDate = dayjs(date);
  return parsedDate.month() >= 3 ? parsedDate.year() : parsedDate.year() - 1;
};

const formatFiscalYear = (startYear) =>
  `FY ${startYear}-${String(startYear + 1).slice(-2)}`;

const getFiscalYearMonths = (startYear) =>
  fiscalMonths.map((month, index) => {
    const year = index < 9 ? startYear : startYear + 1;
    return `${month}-${String(year).slice(-2)}`;
  });

const getFiscalYearStartFromMonth = (monthLabel) => {
  const parsedMonth = dayjs(`01-${monthLabel}`, "DD-MMM-YY", true);

  if (!parsedMonth.isValid()) return null;

  return parsedMonth.month() >= 3 ? parsedMonth.year() : parsedMonth.year() - 1;
};

const Collections = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [selectedMonthData, setSelectedMonthData] = useState([]);
  const [selectedMonthLabel, setSelectedMonthLabel] = useState("");
  const [selectedExportRange, setSelectedExportRange] = useState(null);
  const [selectedFiscalYearStart, setSelectedFiscalYearStart] = useState(() =>
    getFiscalYearStart()
  );
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
    { field: "srNo", headerName: "Sr No", width: 100 },
    {
      field: "clientName",
      headerName: "Client",
      flex: 1,
      cellRenderer: (params) => (
        <span
          className="text-primary underline cursor-pointer"
          onClick={() => handleViewModal(params.data)}
        >
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
    {
      field: "status",
      headerName: "Status",
      flex: 1,
       cellRenderer: (params) => (
        <StatusChip status={params.value || params.data.rentStatus} />
      ),
      //cellRenderer: (params) => <StatusChip status={params.value || params.data.rentStatus} />,
    },
  ];

  const sortedData = useMemo(() => {
    const parseMonth = (str) =>
      new Date(`01-${str.replace("-", "-20")}`).getTime();
    return [...coWorkingData].sort(
      (a, b) => parseMonth(a.month) - parseMonth(b.month)
    );
  }, [coWorkingData]);

  const fiscalGraphData = useMemo(() => {
    const fiscalYearMonths = getFiscalYearMonths(selectedFiscalYearStart);
    const fyBuckets = fiscalYearMonths.map((month) => ({
      month,
      paid: 0,
      unpaid: 0,
      paidAmount: 0,
      dueAmount: 0,
      tooltipMeta: null,
    }));

    sortedData.forEach((entry) => {
       if (getFiscalYearStartFromMonth(entry.month) !== selectedFiscalYearStart) {
        return;
      }
      let paidClients = 0;
      let unpaidClients = 0;
      let paidAmount = 0;
       let dueAmount = 0;

      entry.clients?.forEach((c) => {
        if (c.rentStatus === "Unpaid") {
          unpaidClients++;
          dueAmount += c.revenue || 0;
        } else {
          paidClients++;
          paidAmount += c.revenue || 0;
        }
      });

      const total = paidClients + unpaidClients || 1;
      const targetMonthIndex = fiscalYearMonths.indexOf(entry.month);
      if (targetMonthIndex === -1) return;

      fyBuckets[targetMonthIndex] = {
        month: entry.month,
        paid: Math.round((paidClients / total) * 100),
        unpaid: Math.round((unpaidClients / total) * 100),
         paidAmount,
        dueAmount,
        tooltipMeta: {
          month: entry.month,
          paidClients,
          unpaidClients,
          total,
          paidAmount,
        },
      };
    });

  return {
      chartData: [
        { name: "Collected", data: fyBuckets.map((item) => item.paid) },
        { name: "Due", data: fyBuckets.map((item) => item.unpaid) },
      ],
      tooltipMeta: fyBuckets.map((item) => item.tooltipMeta),
      paidTotal: fyBuckets.reduce((sum, item) => sum + item.paidAmount, 0),
      dueTotal: fyBuckets.reduce((sum, item) => sum + item.dueAmount, 0),
    };
  }, [selectedFiscalYearStart, sortedData]);

  const latestDataFiscalYearStart = useMemo(() => {
    const fiscalYearStarts = sortedData
      .map((entry) => getFiscalYearStartFromMonth(entry.month))
      .filter((yearStart) => yearStart !== null);

    return fiscalYearStarts.length ? Math.max(...fiscalYearStarts) : null;
  }, [sortedData]);

   useEffect(() => {
    if (latestDataFiscalYearStart !== null) {
      setSelectedFiscalYearStart(latestDataFiscalYearStart);
    }
  }, [latestDataFiscalYearStart]);

  const selectedFiscalYear = formatFiscalYear(selectedFiscalYearStart);
  const selectedFiscalYearMonths = useMemo(
    () => getFiscalYearMonths(selectedFiscalYearStart),
    [selectedFiscalYearStart]
  );
  const selectedGraph = fiscalGraphData;

  const barValues = selectedGraph.chartData.map((item) => item.data);
  const completed = barValues[0].reduce((sum, item) => item + sum, 0);
  const due = barValues[1].reduce((sum, item) => item + sum, 0);

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
       categories: selectedFiscalYearMonths,
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
      custom: function ({ seriesIndex, dataPointIndex }) {
        const meta = selectedGraph.tooltipMeta[dataPointIndex];
        if (!meta) return "";

        const { month, paidClients, unpaidClients, total, paidAmount } = meta;

        return `
      <div style="padding:10px;font-family:Poppins-Regular;font-size:13px;width:200px">
        <div style="display:flex; width : 100% ; justify-content : space-between"><strong>Month</strong> ${month}</div>
        <div style="display:flex; width : 100% ; justify-content : space-between"><strong>Total Clients</strong> ${total}</div>
        <div style="color:#54C4A7; display:flex; width : 100% ; justify-content : space-between"><strong>Paid</strong> ${paidClients}</div>
        <div style="color:#EB5C45; display:flex; width : 100% ; justify-content : space-between"><strong>Unpaid</strong> ${unpaidClients}</div>
        <div style="display:flex; width : 100% ; justify-content : space-between"><strong>Amount</strong> INR ${inrFormat(
          paidAmount
        )}</div>
      </div>
    `;
      },
    },

    colors: ["#54C4A7", "#EB5C45"],
  };

  const flatClientData = useMemo(() => {
    return coWorkingData.flatMap((monthObj) =>
      (monthObj.clients || []).map((client, index) => ({
        srno: index + 1,
        month: monthObj.month,
        monthLabel: dayjs(`01-${monthObj.month}`, "DD-MMM-YY").format("MMM-YYYY"),
        monthSortKey: dayjs(`01-${monthObj.month}`, "DD-MMM-YY").valueOf(),
        ...client,
        status: client.rentStatus || "-",
        date: client.rentDate,
      }))
    );
  }, [coWorkingData]);

  const monthWiseExportData = useMemo(() => {
    return [...flatClientData].sort((a, b) => {
      if (a.monthSortKey !== b.monthSortKey) {
        return a.monthSortKey - b.monthSortKey;
      }
      return (a.srno || 0) - (b.srno || 0);
    });
  }, [flatClientData]);

  const grandTotal = flatClientData.reduce(
    (acc, client) => acc + (client.revenue || 0),
    0
  );
  const handleMonthChange = (total, filteredRows = [], range = null) => {
    if (range?.startDate) {
      setSelectedMonthLabel(dayjs(range.startDate).format("MMM-YYYY"));
    } else if (filteredRows.length > 0) {
      setSelectedMonthLabel(dayjs(filteredRows[0].date).format("MMM-YYYY"));
    } else {
      setSelectedMonthLabel("");
    }

    setSelectedExportRange(range);
    setSelectedMonthData(filteredRows);
  };

  const currentMonthTotal = useMemo(() => {
    return selectedMonthData.reduce(
      (sum, client) => sum + (client.revenue || 0),
      0
    );
  }, [selectedMonthData]);

   const selectedCollectionMonthTitle = useMemo(() => {
    const selectedMonth = selectedMonthLabel
      ? dayjs(selectedMonthLabel, "MMM-YYYY")
      : dayjs();

    return selectedMonth.isValid()
      ? `COLLECTIONS - ${selectedMonth.format("MMMM").toUpperCase()}`
      : "COLLECTIONS";
  }, [selectedMonthLabel]);

  const buildExportFileName = (range) => {
    const start = range?.startDate ? dayjs(range.startDate) : null;
    const end = range?.endDate ? dayjs(range.endDate) : null;

    if (!start || !end || !start.isValid() || !end.isValid()) {
      return `collections-${selectedMonthLabel || "selected-month"}.csv`;
    }

    const startLabel = start.format("MMM");
    const endLabel = end.format("MMM");
    const yearLabel = end.format("YYYY");

    if (start.format("MMM-YYYY") === end.format("MMM-YYYY")) {
      return `collections-${startLabel}-${yearLabel}.csv`;
    }

    return `collections-${startLabel}-${endLabel}-${yearLabel}.csv`;
  };

  const handleExport = () => {
    const exportRows =
      selectedMonthData.length > 0 ? selectedMonthData : monthWiseExportData;

    if (!exportRows.length) return;

    const headers = [
      "Sr No",
      "Client Name",
      "Channel",
      "Total Term",
      "Rent Status",
      "No. of Desks",
      "Desk Rate",
      "Revenue",
      "Rent Date",
      "Past Due Date",
      "Annual Increment",
      "Next Increment Date",
    ];
    const rows = exportRows.map((client, index) => [
      index + 1,
      client.clientName || "",
      client.channel || "",
      client.totalTerm != null ? `${client.totalTerm} months` : "",
      client.status || client.rentStatus || "",
      client.noOfDesks != null ? client.noOfDesks : "",
      client.deskRate != null ? `INR ${inrFormat(client.deskRate)}` : "",
      client.revenue != null ? `INR ${inrFormat(client.revenue)}` : "",
      client.rentDate ? humanDate(client.rentDate) : "",
      client.pastDueDate ? humanDate(client.pastDueDate) : "",
      client.annualIncrement != null ? `${client.annualIncrement}%` : "0%",
      client.nextIncrementDate ? humanDate(client.nextIncrementDate) : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildExportFileName(selectedExportRange);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isCoWorkingLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <WidgetSection
        layout={1}
        title={"COLLECTIONS"}
         titleLabel={selectedFiscalYear}
        TitleAmount={`INR ${inrFormat(selectedGraph.paidTotal)}`}
        border
      >
        <BarGraph data={selectedGraph.chartData} options={barGraphOptions} />

        <div className="flex justify-center items-center mt-4">
          <div className="flex items-center gap-4">
            <SecondaryButton
              title={<MdNavigateBefore />}
              handleSubmit={() =>
                setSelectedFiscalYearStart((prev) => prev - 1)
              }
            />
            <div className="text-primary text-content font-semibold">
              {selectedFiscalYear}
            </div>
            <SecondaryButton
              title={<MdNavigateNext />}
              handleSubmit={() =>
                setSelectedFiscalYearStart((prev) => prev + 1)
              }
            />
          </div>
        </div>

        <hr />
        <WidgetSection layout={2}>
          <DataCard
            title={"Collected"}
            // description={`Current Month: ${sortedData[0]?.month || "N/A"}`}
             description={`Total : INR ${inrFormat(selectedGraph.paidTotal)}`}
            data={`${(completed / 12).toFixed(0) || 0}%`}
          />
          <DataCard
            title={"Due"}
            // description={`Current Month: ${sortedData[0]?.month || "N/A"}`}
            description={`Total : INR ${inrFormat(selectedGraph.dueTotal)}`}
            data={`${(due / 12).toFixed(0) || 0}%`}
          />
        </WidgetSection>
      </WidgetSection>  

      <WidgetSection
        border
        title={selectedCollectionMonthTitle}
        TitleAmount={`INR ${inrFormat(currentMonthTotal)}`}
      >
        <div className="flex justify-end px-4 pt-4">
          <PrimaryButton title="Export" handleSubmit={handleExport} />
        </div>

        <WidgetTable
          data={flatClientData}
          columns={kraColumn}
          dateColumn="date"
          totalKey="revenue"
          tableTitle={""}
          border={false}
          onMonthChange={handleMonthChange}
          handleSubmit={() => console.log("Export triggered")}
        />
      </WidgetSection>


      {viewDetails && (
        <MuiModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Collection Details"
        >
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
              //detail={`${viewDetails.annualIncrement}%`}
              detail={`${viewDetails.annualIncrement ?? 0}%`}
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
