import React, { useEffect, useMemo, useState } from "react";
import BarGraph from "../../../../components/graphs/BarGraph";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import dayjs from "dayjs";
import SecondaryButton from "../../../../components/SecondaryButton";

const LeadsLayout = ({ hideAccordion, data, additionalData }) => {
  const allClients = useMemo(
    () => data.flatMap((monthData) => monthData.clients || []),
    [data]
  );

  const availableFinancialYears = useMemo(() => {
    const years = allClients.reduce((acc, client) => {
      const clientDate = dayjs(client.date);

      if (!clientDate.isValid()) return acc;

      const financialYearStart = clientDate.month() >= 3 ? clientDate.year() : clientDate.year() - 1;
      acc.add(financialYearStart);
      return acc;
    }, new Set());

    const sortedYears = Array.from(years).sort((a, b) => a - b);

    if (!sortedYears.length) {
      const currentDate = dayjs();
      sortedYears.push(currentDate.month() >= 3 ? currentDate.year() : currentDate.year() - 1);
    }

    return sortedYears;
  }, [allClients]);

  const [financialYearIndex, setFinancialYearIndex] = useState(0);

  useEffect(() => {
    setFinancialYearIndex(availableFinancialYears.length - 1);
  }, [availableFinancialYears]);

  const currentFinancialYear = availableFinancialYears[financialYearIndex];
  const financialYearLabel = `FY ${currentFinancialYear}-${String(currentFinancialYear + 1).slice(-2)}`;

  const financialYearMonths = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) =>
        dayjs()
          .year(currentFinancialYear)
          .month(3 + index)
          .format("MMM-YY")
      ),
    [currentFinancialYear]
  );

  const transformedData = useMemo(() => {
    const groupedByMonth = Object.fromEntries(
      financialYearMonths.map((monthLabel) => [monthLabel, []])
    );

    allClients.forEach((client) => {
      const clientDate = dayjs(client.date);
      if (!clientDate.isValid()) return;

      const clientFinancialYear = clientDate.month() >= 3 ? clientDate.year() : clientDate.year() - 1;
      if (clientFinancialYear !== currentFinancialYear) return;

      const monthLabel = clientDate.format("MMM-YY");

      if (groupedByMonth[monthLabel]) {
        groupedByMonth[monthLabel].push(client);
      }
    });

    return financialYearMonths.map((monthLabel) => {
      const domainCounts = {
        "Coworking": 0,
        "Co-Living": 0,
        "Workations": 0,
        "Virtualoffice": 0,
        "Meeting": 0,
      };

      groupedByMonth[monthLabel].forEach((client) => {
        if (domainCounts[client.typeOfClient] !== undefined) {
          domainCounts[client.typeOfClient] += 1;
        }
      });

      return {
        month: monthLabel,
        clients: groupedByMonth[monthLabel],
        ...domainCounts,
      };
    });
  }, [allClients, currentFinancialYear, financialYearMonths]);

  // ✅ Transform Data for ApexCharts
  const uniqueClientsData = [
    {
      name: "Co-Working",
      data: transformedData.map((item) => item["Coworking"] || 0),
    },
    // {
    //   name: "Co-Living",
    //   data: transformedData.map((item) => item["Co-Living"] || 0),
    // },
    // {
    //   name: "Workations",
    //   data: transformedData.map((item) => item["Workations"] || 0),
    // },
    {
      name: "Virtual Office",
      data: transformedData.map((item) => item["Virtualoffice"] || 0),
    },
    {
      name: "Meetings",
      data: transformedData.map((item) => item["Meeting"] || 0),
    },
  ];
  const barChartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      stacked: true,
      fontFamily: "Poppins-Regular",
    },
    xaxis: {
      categories: financialYearMonths,
      title: { text: "Months" },
    },
    yaxis: {
      title: { text: "Number of Clients" },
      min: 0,
      forceNiceScale: true,
    },
    plotOptions: {
      bar: { columnWidth: "40%", borderRadius: 4 },
    },
    legend: { position: "top", horizontalAlign: "center" },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val) => `${val} Clients` },
    },
    colors: ["#1E3D73", "#80BF01", "#FFC300", "#00C8D7", "#FF5733"],
  };

  const handlePrevYear = () => {
    setFinancialYearIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextYear = () => {
    setFinancialYearIndex((prev) =>
      Math.min(prev + 1, availableFinancialYears.length - 1)
    );
  };

  // Define Table Columns
  const tableColumns = [
    { field: "client", headerName: "Client", flex: 1 },
    { field: "typeOfClient", headerName: "Type of Client", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "paymentStatus", headerName: "Payment Status", flex: 1 },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <WidgetSection
        layout={1}
        border
        padding
        title={"Unique Clients"}
        TitleAmount={additionalData || ""}
      >
        <div className="p-1"></div>

        <BarGraph
          data={uniqueClientsData}
          title=""
          options={barChartOptions}
          height={400}
        />
        <div className="flex justify-center items-center">
          <div className="flex items-center pb-4">
            <SecondaryButton
              title={<MdNavigateBefore />}
              handleSubmit={handlePrevYear}
              disabled={financialYearIndex === 0}
            />
            <div className="text-sm min-w-[120px] text-center">{financialYearLabel}</div>
            <SecondaryButton
              title={<MdNavigateNext />}
              handleSubmit={handleNextYear}
              disabled={financialYearIndex === availableFinancialYears.length - 1}
            />
          </div>
        </div>
      </WidgetSection>

      {/* Accordion for Monthly Client Breakdown */}
      {hideAccordion ? (
        ""
      ) : (
        <div className="flex flex-col gap-2 border-default border-borderGray rounded-md p-4">
          <div className="px-4 py-2 border-b-[1px] border-borderGray bg-gray-50">
            <div className="flex justify-between items-center w-full px-4 py-2">
              <span className="text-sm text-muted font-pmedium text-title">
                MONTH
              </span>
              <span className="px-8 text-sm text-muted font-pmedium text-title flex items-center gap-1">
                Total Unique Clients
              </span>
            </div>
          </div>
          {transformedData.map((data, index) => (
            <Accordion key={index} className="py-4">
              <AccordionSummary
                expandIcon={<IoIosArrowDown />}
                className="border-b-[1px] border-borderGray"
              >
                <div className="flex justify-between items-center w-full px-4">
                  <span className="text-subtitle font-medium">
                    {data.month}
                  </span>
                  <span className="px-8 text-subtitle font-medium">
                    {data.clients.length}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                <AgTable
                  search={true}
                  data={data.clients.map((client) => ({
                    ...client,
                    date: dayjs(client.date).format("DD-MM-YYYY"),
                    paymentStatus: "Paid",
                  }))}
                  columns={tableColumns}
                  tableHeight={250}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadsLayout;
