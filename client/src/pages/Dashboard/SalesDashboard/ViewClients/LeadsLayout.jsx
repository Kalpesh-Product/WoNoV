import React, { useEffect, useMemo, useState } from "react";
import BarGraph from "../../../../components/graphs/BarGraph";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import dayjs from "dayjs";
import SecondaryButton from "../../../../components/SecondaryButton";

const PROJECTED_UNIQUE_CLIENTS_BY_MONTH = {
  "Oct-26": {
    "Projected Co-Working": 10,
    "Projected Virtual Office": 6,
    "Projected External Meetings": 6,
    "Projected Open Desk": 3,
  },
  "Nov-26": {
    "Projected Co-Working": 11,
    "Projected Virtual Office": 7,
    "Projected External Meetings": 7,
    "Projected Open Desk": 4,
  },
  "Dec-26": {
    "Projected Co-Working": 12,
    "Projected Virtual Office": 6,
    "Projected External Meetings": 7,
    "Projected Open Desk": 4,
  },
  "Jan-27": {
    "Projected Co-Working": 12,
    "Projected Virtual Office": 7,
    "Projected External Meetings": 6,
    "Projected Open Desk": 4,
  },
  "Feb-27": {
    "Projected Co-Working": 13,
    "Projected Virtual Office": 7,
    "Projected External Meetings": 7,
    "Projected Open Desk": 5,
  },
  "Mar-27": {
    "Projected Co-Working": 14,
    "Projected Virtual Office": 8,
    "Projected External Meetings": 7,
    "Projected Open Desk": 5,
  },
};
const PROJECTED_UNIQUE_CLIENT_SERIES = [
  "Projected Co-Working",
  "Projected Virtual Office",
  "Projected External Meetings",
  "Projected Open Desk",
];
const ACTUAL_UNIQUE_CLIENT_SERIES = [
  "Co-Working",
  "Virtual Office",
  "External Meetings",
  "Open Desk",
];
const PROJECTED_UNIQUE_CLIENT_COLORS = [
  "#3c3c3c",
  "#616161",
  "#787878",
  "#b4b4b4",
];

const LeadsLayout = ({
  hideAccordion,
  data,
  additionalData,
  children,
  title = "Unique Clients",
  titleAmount,
  hideMonthAxisTitle = false,
  noOuterPadding = false,
  investorBlueStyle = false,
  hideFinancialYearControls = false,
}) => {
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

  const [selectedFinancialYear, setSelectedFinancialYear] = useState(() => {
    const currentDate = dayjs();
    return currentDate.month() >= 3 ? currentDate.year() : currentDate.year() - 1;
  });
  const [hiddenInvestorSeries, setHiddenInvestorSeries] = useState(() => new Set());

  useEffect(() => {
    setSelectedFinancialYear(
      availableFinancialYears[availableFinancialYears.length - 1]
    );
  }, [availableFinancialYears]);

  const currentFinancialYear = selectedFinancialYear;
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
        "External Meetings": 0,
        "Open Desk": 0,
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

  const selectedFinancialYearClientsCount = useMemo(
    () =>
      transformedData.reduce(
        (total, item) =>
          total +
          (item["Coworking"] || 0) +
          (item["Virtualoffice"] || 0) +
          (item["External Meetings"] || 0) +
          (item["Open Desk"] || 0),
        0
      ),
    [transformedData]
  );
  const resolvedTitleAmount =
    typeof titleAmount === "function"
      ? titleAmount({
          count: selectedFinancialYearClientsCount,
          financialYear: currentFinancialYear,
        })
      : titleAmount || `CLIENTS : ${selectedFinancialYearClientsCount}`;

  // ✅ Transform Data for ApexCharts
  const uniqueClientsData = useMemo(() => {
    const currentMonth = dayjs().startOf("month");
    const getActualValue = (item, monthIndex, key) => {
      if (!investorBlueStyle) return item[key] || 0;

      const monthDate = dayjs()
        .year(currentFinancialYear)
        .month(3 + monthIndex)
        .startOf("month");

      return monthDate.isAfter(currentMonth) ? 0 : item[key] || 0;
    };
    const actualSeries = [
      {
        name: "Co-Working",
        data: transformedData.map((item, monthIndex) =>
          getActualValue(item, monthIndex, "Coworking")
        ),
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
        data: transformedData.map((item, monthIndex) =>
          getActualValue(item, monthIndex, "Virtualoffice")
        ),
      },
      {
        name: "External Meetings",
        data: transformedData.map((item, monthIndex) =>
          getActualValue(item, monthIndex, "External Meetings")
        ),
      },
      {
        name: "Open Desk",
        data: transformedData.map((item, monthIndex) =>
          getActualValue(item, monthIndex, "Open Desk")
        ),
      },
    ];

    if (!investorBlueStyle) return actualSeries;

    const projectedSeries = PROJECTED_UNIQUE_CLIENT_SERIES.map((seriesName) => ({
      name: seriesName,
      data: transformedData.map((item, monthIndex) => {
        const monthDate = dayjs()
          .year(currentFinancialYear)
          .month(3 + monthIndex)
          .startOf("month");
        if (!monthDate.isAfter(currentMonth)) return 0;
        return PROJECTED_UNIQUE_CLIENTS_BY_MONTH[item.month]?.[seriesName] || 0;
      }),
    }));

    return [...actualSeries, ...projectedSeries];
  }, [currentFinancialYear, investorBlueStyle, transformedData]);
  const displayedUniqueClientsData = useMemo(
    () =>
      uniqueClientsData.map((series) => {
        const legendKey = series.name.startsWith("Projected ")
          ? "Projected"
          : series.name;

        return hiddenInvestorSeries.has(legendKey)
          ? { ...series, data: series.data.map(() => 0) }
          : series;
      }),
    [hiddenInvestorSeries, uniqueClientsData]
  );
  const toggleInvestorSeries = (seriesName) => {
    setHiddenInvestorSeries((current) => {
      const next = new Set(current);
      if (next.has(seriesName)) next.delete(seriesName);
      else next.add(seriesName);
      return next;
    });
  };
  const barChartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      stacked: true,
      fontFamily: "Poppins-Regular",
    },
    xaxis: {
      categories: financialYearMonths,
      ...(investorBlueStyle
        ? {
            crosshairs: {
              show: false,
            },
          }
        : {}),
      ...(hideMonthAxisTitle
        ? {}
        : {
            title: {
              text: "Months",
              ...(investorBlueStyle
                ? {
                    style: {
                      color: "#1234c9",
                    },
                  }
                : {}),
            },
          }),
      ...(investorBlueStyle
        ? {
            labels: {
              style: {
                colors: "#1234c9",
              },
            },
          }
        : {}),
    },
    yaxis: {
      title: {
        text: "Number of Clients",
        ...(investorBlueStyle
          ? {
              style: {
                color: "#1234c9",
              },
            }
          : {}),
      },
      ...(investorBlueStyle
        ? {
            labels: {
              style: {
                colors: "#1234c9",
              },
            },
          }
        : {}),
      min: 0,
      forceNiceScale: true,
    },
    plotOptions: {
      bar: { columnWidth: "40%", borderRadius: 4 },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => (value > 0 ? value : ""),
      ...(investorBlueStyle
        ? {
            style: {
              colors: ["#ffffff"],
              fontWeight: 600,
            },
          }
        : {}),
    },
    legend: investorBlueStyle
      ? { show: false }
      : {
          position: "top",
          horizontalAlign: "center",
        },
    tooltip: investorBlueStyle
      ? {
          shared: false,
          intersect: true,
          custom: ({ series, dataPointIndex, w }) => {
            const isProjectedMonth = series
              .slice(4)
              .some((values) => (values[dataPointIndex] || 0) > 0);
            const startIndex = isProjectedMonth ? 4 : 0;
            const endIndex = isProjectedMonth ? 8 : 4;
            const rows = [];

            for (let index = startIndex; index < endIndex; index += 1) {
              const value = series[index]?.[dataPointIndex] || 0;
              const seriesLabel = w.globals.seriesNames[index].replace(
                /^Projected /,
                ""
              );
              rows.push(`
                <div style="display:flex;align-items:center;gap:7px;padding:7px 10px;color:#222;white-space:nowrap;">
                  <span style="display:flex;align-items:center;gap:7px;">
                    <span style="width:9px;height:9px;border-radius:50%;background:${w.globals.colors[index]};display:inline-block;"></span>
                    ${seriesLabel}:
                  </span>
                  <strong>${value} Clients</strong>
                </div>
              `);
            }

            return `
              <div style="background:#fff;color:#222;border:1px solid #d9dce1;border-radius:5px;box-shadow:0 2px 8px rgba(0,0,0,.15);overflow:hidden;font-family:Poppins-Regular;font-size:12px;">
                <div style="padding:7px 10px;background:#eef1f4;border-bottom:1px solid #d9dce1;font-weight:500;">
                  ${w.globals.labels[dataPointIndex]}
                </div>
                ${rows.join("")}
              </div>
            `;
          },
        }
      : {
          shared: true,
          intersect: false,
          y: { formatter: (val) => `${val} Clients` },
        },
    colors: investorBlueStyle
      ? [
          "#1E3D73",
          "#80BF01",
          "#FFC300",
          "#00C8D7",
          ...PROJECTED_UNIQUE_CLIENT_COLORS,
        ]
      : ["#1E3D73", "#80BF01", "#FFC300", "#00C8D7", "#FF5733"],
  };

  const handlePrevYear = () => {
    setSelectedFinancialYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedFinancialYear((prev) => prev + 1);
  };

  // Define Table Columns
  const tableColumns = [
    { field: "client", headerName: "Client", flex: 1 },
    { field: "typeOfClient", headerName: "Type of Client", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "paymentStatus", headerName: "Payment Status", flex: 1 },
  ];

  return (
    <div className={`flex flex-col gap-4 ${noOuterPadding ? "" : "p-4"}`}>
      <WidgetSection
        layout={1}
        border
        padding
        title={title}
        TitleAmount={investorBlueStyle ? "" : resolvedTitleAmount}
        headerRightContent={
          investorBlueStyle ? (
            <span className="text-widgetTitle font-pmedium uppercase text-[#1234c9]">
              {resolvedTitleAmount}
            </span>
          ) : null
        }
      >
        <div className="p-1"></div>

        {investorBlueStyle ? (
          <div className="flex flex-wrap items-center justify-center gap-4 pb-2 pt-1">
            {[...ACTUAL_UNIQUE_CLIENT_SERIES, "Projected"].map(
              (seriesName, index) => {
                const legendColors = [
                  "#1E3D73",
                  "#80BF01",
                  "#FFC300",
                  "#00C8D7",
                  "#3c3c3c",
                ];
                const isHidden = hiddenInvestorSeries.has(seriesName);

                return (
                  <button
                    key={seriesName}
                    type="button"
                    onClick={() => toggleInvestorSeries(seriesName)}
                    className={`flex items-center gap-1 text-xs text-[#1234c9] transition-opacity ${
                      isHidden ? "opacity-40" : "opacity-100"
                    }`}
                    aria-pressed={!isHidden}
                  >
                    <span
                      className="h-3 w-3"
                      style={{ backgroundColor: legendColors[index] }}
                    />
                    <span>{seriesName}</span>
                  </button>
                );
              }
            )}
          </div>
        ) : null}

        <BarGraph
          data={
            investorBlueStyle
              ? displayedUniqueClientsData
              : uniqueClientsData
          }
          title=""
          options={barChartOptions}
          height={investorBlueStyle ? 350 : 400}
        />
        {!hideFinancialYearControls && (
          <div className="flex justify-center items-center pt-4 pb-2">
            <div className="flex items-center gap-[2px] mt-4">
              <SecondaryButton
                title={<MdNavigateBefore />}
                handleSubmit={handlePrevYear}
                externalStyles="min-w-20 px-6 py-2 bg-[#d1d5db] text-black font-semibold rounded-lg"
              />
              <div className="min-w-[96px] px-0 text-center text-primary text-content font-semibold">
                {financialYearLabel}
              </div>
              <SecondaryButton
                title={<MdNavigateNext />}
                handleSubmit={handleNextYear}
                externalStyles="min-w-20 px-6 py-2 bg-[#9ca3af] text-black font-semibold rounded-lg"
              />
            </div>
          </div>
        )}

        {children ? (
          <div className="mt-6 border-t border-borderGray pt-4">{children}</div>
        ) : null}
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
