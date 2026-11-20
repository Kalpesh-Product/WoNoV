import BarGraph from "../../../components/graphs/BarGraph";
import WidgetSection from "../../../components/WidgetSection";
import { inrFormat } from "../../../utils/currencyFormat";
import { isDayPassRevenue } from "../../../utils/dayPassRevenue";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SalesDashboardChartSkeleton from "./SalesDashboardChartSkeleton";
import dayjs from "dayjs";
import MonthWiseAgTable from "../../../components/Tables/MonthWiseAgTable";
import WidgetTable from "../../../components/Tables/WidgetTable";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import FyBarGraphPercentage from "../../../components/graphs/FyBarGraphPercentage";

const VERTICAL_ROUTE_MAP = {
  Meeting: "meetings",
  "Day Pass": "day-pass",
  Alternate: "alt-revenue",
  "Virtual Office": "virtual-office",
  Workation: "workation",
  "Co-Working": "co-working",
  "Flexy Desk": "flexible-desk-clients",
};

const REVENUE_SERIES_COLORS = {
  "Co-Working": "#1E3D73",
  "Flexy Desk": "#0077B6",
  Meeting: "#2196F3",
  "Day Pass": "#F59E0B",
  "Virtual Office": "#11daf5",
  Workation: "#54C4A7",
  Alternate: "#1976D2",
};

const getNormalizedPaymentStatus = (value) => {
  if (typeof value === "string") return value.trim().toLowerCase();
  return value ? "paid" : "unpaid";
};

const getNumericAmount = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  }
  return 0;
};

const isMeetingFinancePaid = (item) =>
  getNormalizedPaymentStatus(item?.financeStatus) === "verified";

const isFlexyDeskRevenue = (item) => {
  const clientType = String(item?.clientType || "").trim().toLowerCase();

  // clientType is the source of truth. billingFrequency defaults to
  // "Monthly" for every client, so it must only be used as a fallback
  // when clientType is missing.
  if (clientType === "annual client") return false;
  if (["flexy desk client", "flexi desk client", "flexible desk client"].includes(clientType)) {
    return true;
  }

  return String(item?.billingFrequency || "").trim().toLowerCase() === "monthly";
};

const isBeforeVirtualOfficeUploadLogicStart = (value) => {
  const date = dayjs(value);
  return date.isValid() && date.isBefore(dayjs("2026-09-01"), "month");
};

const getVirtualOfficeReportingAmount = (item) =>
  isBeforeVirtualOfficeUploadLogicStart(
    item?.rentDate || item?.invoiceUploadedAt || item?.createdAt,
  )
    ? getNumericAmount(item?.revenue ?? item?.taxableAmount)
    : getNumericAmount(
        item?.reportingAmount ??
          item?.receivedAmount ??
          item?.revenue ??
          item?.taxableAmount,
      );

const getRevenueSummaryForDateRange = (data, dateRange) => {
  const selectedRange = Array.isArray(dateRange) ? dateRange[0] : null;

  const filteredData =
    selectedRange?.startDate && selectedRange?.endDate
      ? data.filter((item) => {
          const itemDate = dayjs(item.date);
          if (!itemDate.isValid()) return false;

          return (
            itemDate.isAfter(dayjs(selectedRange.startDate).startOf("day").subtract(1, "millisecond")) &&
            itemDate.isBefore(dayjs(selectedRange.endDate).endOf("day").add(1, "millisecond"))
          );
        })
      : data;

  return filteredData.reduce(
    (summary, item) => {
      const amount = getNumericAmount(item.revenue);
      summary.total += amount;

      if (item.normalizedStatus === "paid") {
        summary.paid += amount;
      } else {
        summary.unpaid += amount;
      }

      return summary;
    },
    { total: 0, paid: 0, unpaid: 0 },
  );
};

const TotalRevenue = () => {
  const axios = useAxiosPrivate();
   const location = useLocation();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState("2025-26");

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

//  const [revenueBasePath] = location.pathname.split("/total-revenue");
//   const safeRevenueBasePath = revenueBasePath || location.pathname;

//   const handleVerticalNavigation = (vertical) => {
//     const targetPath = VERTICAL_ROUTE_MAP[vertical];
//     if (!targetPath) return;

//     navigate(`${safeRevenueBasePath}/${targetPath}`, {
//       state: { selectedVertical: vertical },
//     });
//   };

//   const clickableCellClass =
//     "w-full h-full text-left text-primary font-pmedium underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer";

//   const verticalLinkRenderer = (params) => {
//     const vertical = params.data?.vertical;
//     if (!VERTICAL_ROUTE_MAP[vertical]) return params.value;

//     return (
//       <button
//         type="button"
//         className={clickableCellClass}
//         onClick={() => handleVerticalNavigation(vertical)}
//         aria-label={`Open ${vertical} revenue details`}
//       >
//         {params.value}
//       </button>
//     );
//   };

const [revenueBasePath] = location.pathname.split("/total-revenue");
  const safeRevenueBasePath = revenueBasePath || location.pathname;

  const handleVerticalNavigation = (vertical) => {
    const targetPath = VERTICAL_ROUTE_MAP[vertical];
    if (!targetPath) return;

    navigate(`${safeRevenueBasePath}/${targetPath}`, {
      state: { selectedVertical: vertical },
    });
  };

  const clickableCellClass =
    "m-0 h-full w-auto cursor-pointer border-none bg-transparent p-0 text-left font-preregular text-primary underline underline-offset-2 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";

  const verticalLinkRenderer = (params) => {
    const vertical = params.data?.vertical;
    if (!VERTICAL_ROUTE_MAP[vertical]) return params.value;

    return (
      <button
        type="button"
        className={clickableCellClass}
        onClick={() => handleVerticalNavigation(vertical)}
        aria-label={`Open ${vertical} revenue details`}
      >
        {params.value}
      </button>
    );
  };

  const { data: simpleRevenue = [], isLoading: isSimpleRevenue } = useQuery({
    queryKey: ["completeRevenue"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/sales/simple-consolidated-revenue",
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

  // const filteredByYear = totalRevenue.map((item) => ({
  //   name: item.name,
  //   data: item.data[selectedYear] || [],
  // }));

  // const normalizedData = filteredByYear.map((domain) => ({
  //   name: domain.name,
  //   group: "FY 2024-25",
  //   data: domain.data.map((val, idx) => {
  //     const totalThisMonth = filteredByYear.reduce(
  //       (sum, item) => sum + item.data[idx],
  //       0
  //     );
  //     return totalThisMonth ? Math.round((val / totalThisMonth) * 100) : 0;
  //   }),
  // }));
  const options = {
    chart: {
      toolbar: false,
      stacked: true,
      fontFamily: "Poppins-Regular",
    },

    // tooltip: {
    //   shared: true,
    //   intersect: false,
    //   custom: function ({ dataPointIndex, w }) {
    //     const monthLabel = w.globals.labels[dataPointIndex];

    //     // meetings altRevenue
    //     const meetings = filteredByYear[0]?.data?.[dataPointIndex] ?? 0;
    //     const altRevenue = filteredByYear[1]?.data?.[dataPointIndex] ?? 0;
    //     const virtualOffice = filteredByYear[2]?.data?.[dataPointIndex] ?? 0;
    //     const workation = filteredByYear[3]?.data?.[dataPointIndex] ?? 0;
    //     const coworking = filteredByYear[4]?.data?.[dataPointIndex] ?? 0;

    //     return `
    //   <div style="padding: 10px; width: 300px">
    //     <div class="apexcharts-tooltip-title" style="margin-bottom: 8px; font-weight: bold;">${monthLabel}</div>

    //     <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
    //       <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${w.globals.colors[0]
    //       }; display: inline-block;"></span>
    //       <div style="display: flex; justify-content: space-between; width: 100%;">
    //         <span>Co-Working</span>
    //         <span>INR ${coworking.toLocaleString("en-IN")}</span>
    //       </div>
    //     </div>

    //     <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
    //       <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${w.globals.colors[1]
    //       }; display: inline-block;"></span>
    //       <div style="display: flex; justify-content: space-between; width: 100%;">
    //         <span>Meetings</span>
    //         <span>INR ${meetings.toLocaleString("en-IN")}</span>
    //       </div>
    //     </div>

    //     <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
    //       <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${w.globals.colors[2]
    //       }; display: inline-block;"></span>
    //       <div style="display: flex; justify-content: space-between; width: 100%;">
    //         <span>Virtual Office</span>
    //         <span>INR ${virtualOffice.toLocaleString("en-IN")}</span>
    //       </div>
    //     </div>

    //     <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
    //       <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${w.globals.colors[3]
    //       }; display: inline-block;"></span>
    //       <div style="display: flex; justify-content: space-between; width: 100%;">
    //         <span>Workation</span>
    //         <span>INR ${workation.toLocaleString("en-IN")}</span>
    //       </div>
    //     </div>

    //     <div style="display: flex; align-items: center; gap: 8px;">
    //       <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${w.globals.colors[4]
    //       }; display: inline-block;"></span>
    //       <div style="display: flex; justify-content: space-between; width: 100%;">
    //         <span>Alt Revenues</span>
    //         <span>INR ${altRevenue.toLocaleString("en-IN")}</span>
    //       </div>
    //     </div>
    //   </div>
    // `;
    //   },
    // },

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
        dataLabels: {
          hideOverflowingLabels: false,
          maxItems: 100,
        },
      },
    },
  };
  const tooltipBuilder = ({ monthLabel, rawDataMap, w, dataPointIndex }) => {
    const tooltipRows = [
      { label: "Co-Working", seriesName: "Co-Working" },
      { label: "Flexy Desk", seriesName: "Flexy Desk" },
      { label: "Virtual Office", seriesName: "Virtual Office" },
      { label: "Meetings", seriesName: "Meeting" },
      { label: "Day Pass", seriesName: "Day Pass" },
      { label: "Workation", seriesName: "Workation" },
      { label: "Alt Revenues", seriesName: "Alternate" },
    ].map(({ label, seriesName }) => {
      const seriesIndex = w.globals.seriesNames.indexOf(seriesName);
      return {
        label,
        color:
          seriesIndex >= 0
            ? w.globals.colors[seriesIndex]
            : REVENUE_SERIES_COLORS[seriesName] || "#6B7280",
        value: rawDataMap?.[seriesName]?.[dataPointIndex] ?? 0,
      };
    });
    const total = tooltipRows.reduce((sum, row) => sum + row.value, 0);
    const formatShare = (value) => {
      if (total <= 0 || value <= 0) return "0%";
      const percentage = (value / total) * 100;
      return `${Number(percentage.toFixed(2))}%`;
    };

    const rowsHtml = tooltipRows
      .map(({ label, color, value }) => `
        <div style="display:flex; align-items:center; gap:8px; padding:4px 10px; white-space:nowrap;">
          <span style="width:11px; height:11px; flex:none; border-radius:50%; background:${color};"></span>
          <span>${formatShare(value)} = ${label} =</span>
          <strong>INR ${inrFormat(value)}</strong>
        </div>`)
      .join("");

    return `
      <div style="overflow:hidden; border:1px solid #e5e7eb; border-radius:6px; background:#fff; box-shadow:0 4px 12px #0002; color:#1f2937; font-size:13px;">
        <div style="background:#eef0f2; padding:8px 10px;">${monthLabel}</div>
        <div style="padding:7px 0 9px;">
          ${rowsHtml}
          <div style="display:flex; align-items:center; gap:8px; margin:7px 10px 0; border-top:1px solid #e5e7eb; padding-top:10px; white-space:nowrap;">
            <span style="width:11px; height:11px; flex:none; border-radius:50%; background:#54C4A7;"></span>
            <span>${total > 0 ? 100 : 0}% = Overall Revenues =</span>
            <strong>INR ${inrFormat(total)}</strong>
          </div>
        </div>
      </div>`;
  };

  const unifiedRevenueData = useMemo(() => {
    if (!simpleRevenue) return [];

    const flatten = [];

    simpleRevenue.meetingRevenue?.forEach((item) => {
      const isDayPass = isDayPassRevenue(item);
      const isPaid = getNormalizedPaymentStatus(item.status) === "paid";

      flatten.push({
        vertical: isDayPass ? "Day Pass" : "Meeting",
        revenue: getNumericAmount(item.taxable),
        date: item.date,
        // Day Pass is counted only when payment is received and finance has
        // verified it - same rule as the Day Pass revenue tab.
        normalizedStatus:
          isMeetingFinancePaid(item) && (!isDayPass || isPaid)
            ? "paid"
            : "unpaid",
      });
    });

    simpleRevenue.alternateRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Alternate",
        revenue: getNumericAmount(item.taxableAmount),
        date: item.invoiceCreationDate,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      });
    });

    simpleRevenue.virtualOfficeRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Virtual Office",
        revenue: getVirtualOfficeReportingAmount(item),
        date: item.rentDate,
        normalizedStatus: getNormalizedPaymentStatus(
          item.rentStatus ?? item.status,
        ),
      });
    });

    simpleRevenue.workationRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Workation",
        revenue: getNumericAmount(item.taxableAmount),
        date: item.date,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      });
    });

    simpleRevenue.coworkingRevenues?.forEach((item) => {
      flatten.push({
        vertical: isFlexyDeskRevenue(item) ? "Flexy Desk" : "Co-Working",
        revenue: getNumericAmount(item.revenue),
        date: item.rentDate,
        normalizedStatus: getNormalizedPaymentStatus(item.rentStatus),
      });
    });

    return flatten;
  }, [simpleRevenue]);

  const paidRevenueData = useMemo(
    () =>
      unifiedRevenueData.filter(
        (item) => item.normalizedStatus === "paid",
      ),
    [unifiedRevenueData],
  );

  return (
    <div className="flex flex-col gap-4 ">
      {isTotalLoading || isSimpleRevenue ? (
        <WidgetSection border title="ANNUAL MONTHLY MIX INCOME">
          <SalesDashboardChartSkeleton title="Annual Monthly Mix Income" />
        </WidgetSection>
      ) : (
        <FyBarGraphPercentage
          data={isTotalLoading ? [] : paidRevenueData}
          dateKey="date"
          valueKey="revenue"
          graphTitle="ANNUAL MONTHLY MIX INCOME"
          chartOptions={options}
          tooltipBuilder={tooltipBuilder}
          showSmallLabels
          seriesColors={REVENUE_SERIES_COLORS}
          legendItems={[
            { label: "Co-Working", seriesName: "Co-Working" },
            { label: "Flexy Desk", seriesName: "Flexy Desk" },
            { label: "Virtual Office", seriesName: "Virtual Office" },
            { label: "Meetings", seriesName: "Meeting" },
            { label: "Day Pass", seriesName: "Day Pass" },
            { label: "Workation", seriesName: "Workation" },
            { label: "Alt Revenues", seriesName: "Alternate" },
          ]}
        />
      )}

      <WidgetTable
        tableTitle={"Annual Monthly Revenue Breakup"}
        loading={isTotalLoading || isSimpleRevenue}
        dateColumn="date"
        totalKey="revenue"
        groupByKey="vertical" // 👈 we’ll use this to show 1 row per vertical
        columns={[
          { headerName: "Sr No", field: "srNo", flex: 1 },
         {
            headerName: "Vertical",
            field: "vertical",
            flex: 1,
            cellRenderer: verticalLinkRenderer,
          },
          {
            headerName: "Revenue (INR)",
            field: "revenue",
            flex: 1,
            //cellRenderer: verticalLinkRenderer,
          },
        ]}
        titleAmountOverride=""
        titleAmountTotal={({ dateRange }) => {
          const summary = getRevenueSummaryForDateRange(
            unifiedRevenueData,
            dateRange,
          );
          return `INR ${inrFormat(summary.total)}`;
        }}
        titleAmountGreen={({ dateRange }) => {
          const summary = getRevenueSummaryForDateRange(
            unifiedRevenueData,
            dateRange,
          );
          return `INR ${inrFormat(summary.paid)}`;
        }}
        titleAmountRed={({ dateRange }) => {
          const summary = getRevenueSummaryForDateRange(
            unifiedRevenueData,
            dateRange,
          );
          return `INR ${inrFormat(summary.unpaid)}`;
        }}
        greenTitle="Paid"
        redTitle="Unpaid"
        totalTitle="Total"
        summaryChipVariant="ticket"
        data={paidRevenueData}
        exportData
      />
    </div>
  );
};

export default TotalRevenue;
