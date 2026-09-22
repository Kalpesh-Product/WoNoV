import { inrFormat } from "../../../../utils/currencyFormat";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import WidgetTable from "../../../../components/Tables/WidgetTable";
import FyBarGraphPercentage from "../../../../components/graphs/FyBarGraphPercentage";
import dayjs from "dayjs";

const FINANCE_REVENUE_BASE_PATH =
  "/app/dashboard/finance-dashboard/mix-bag/revenue";

const VERTICAL_ROUTE_MAP = {
  Meeting: "meetings",
  "Alternate Revenue": "alt-revenue",
  "Virtual Office": "virtual-office",
  Workation: "workation",
  Coworking: "co-working",
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


const getRevenueSummaryForDateRange = (data, dateRange) => {
  const selectedRange = Array.isArray(dateRange) ? dateRange[0] : null;

  const filteredData =
    selectedRange?.startDate && selectedRange?.endDate
      ? data.filter((item) => {
          const itemDate = dayjs(item.date);
          if (!itemDate.isValid()) return false;

          return (
            itemDate.isAfter(
              dayjs(selectedRange.startDate)
                .startOf("day")
                .subtract(1, "millisecond")
            ) &&
            itemDate.isBefore(
              dayjs(selectedRange.endDate)
                .endOf("day")
                .add(1, "millisecond")
            )
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
    { total: 0, paid: 0, unpaid: 0 }
  );
};

const IncomeDetails = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

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

  const unifiedRevenueData = useMemo(() => {
    if (!simpleRevenue) return [];
    const flatten = [];

    simpleRevenue.meetingRevenue?.forEach((item) => {
      flatten.push({
        vertical: "Meeting",
        revenue: getNumericAmount(item.taxable),
        date: item.date,
        // normalizedStatus: getNormalizedPaymentStatus(item.status),
         normalizedStatus: isMeetingFinancePaid(item) ? "paid" : "unpaid",
      });
    });

    simpleRevenue.alternateRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Alternate Revenue",
        revenue: getNumericAmount(item.taxableAmount),
        date: item.invoiceCreationDate,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      });
    });

    simpleRevenue.virtualOfficeRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Virtual Office",
        revenue: getNumericAmount(item.revenue ?? item.taxableAmount),
        date: item.rentDate,
        normalizedStatus: getNormalizedPaymentStatus(
          item.rentStatus ?? item.status
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
        vertical: "Coworking",
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
        (item) => item.normalizedStatus === "paid"
      ),
    [unifiedRevenueData]
  );

  const handleVerticalNavigation = (vertical) => {
    const targetPath = VERTICAL_ROUTE_MAP[vertical];
    if (!targetPath) return;

    navigate(`${FINANCE_REVENUE_BASE_PATH}/${targetPath}`, {
      state: { selectedVertical: vertical },
    });
  };

  const clickableCellClass =
    "m-0 h-full w-auto cursor-pointer border-none bg-transparent p-0 text-left font-pregular text-primary underline underline-offset-2 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";

  const verticalLinkRenderer = (params) => {
    const vertical = params.data?.vertical;
    if (!VERTICAL_ROUTE_MAP[vertical]) return params.value;

    return (
      <button
        type="button"
        className={clickableCellClass}
        onClick={() => handleVerticalNavigation(vertical)}
        aria-label={`Open ${vertical} income details`}
      >
        {params.value}
      </button>
    );
  };

  const options = {};

  const tooltipBuilder = ({ monthLabel, rawDataMap, w, dataPointIndex }) => {
    const tooltipRows = [
      { label: "Co-Working", seriesName: "Coworking" },
      { label: "Meetings", seriesName: "Meeting" },
      { label: "Virtual Office", seriesName: "Virtual Office" },
      { label: "Workation", seriesName: "Workation" },
      { label: "Alt Revenues", seriesName: "Alternate Revenue" },
    ];
    let total = 0;

    const rowsHtml = tooltipRows
      .map(({ label, seriesName }) => {
        const seriesIndex = w.globals.seriesNames.indexOf(seriesName);
        const color =
          seriesIndex >= 0 ? w.globals.colors[seriesIndex] : "#6B7280";
        const value = rawDataMap?.[seriesName]?.[dataPointIndex] ?? 0;
        total += value;

        return `
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span style="height:10px; width:10px; flex:none; border-radius:50%; background-color:${color}; display:inline-block;"></span>
            <div style="display:flex; justify-content:space-between; width:100%; gap:24px;">
              <span>${label}</span>
              <span>INR ${inrFormat(value)}</span>
            </div>
          </div>`;
      })
      .join("");

    return `
      <div style="padding:10px; width:300px;">
        <div class="apexcharts-tooltip-title" style="margin-bottom:8px; font-weight:bold;">${monthLabel}</div>
        ${rowsHtml}
        <hr style="margin-top:6px;" />
        <div style="text-align:right; font-weight:600;">Total: INR ${inrFormat(total)}</div>
      </div>`;
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {isTotalLoading ? (
        <div className="flex h-72 justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <FyBarGraphPercentage
          data={paidRevenueData}
          dateKey="date"
          valueKey="revenue"
          graphTitle="ANNUAL MONTHLY MIX INCOME"
          chartOptions={options}
          tooltipBuilder={tooltipBuilder}
          showSmallLabels
          seriesColors={{
            Coworking: "#1E3D73",
            Meeting: "#2196F3",
            "Virtual Office": "#11daf5",
            Workation: "#54C4A7",
            "Alternate Revenue": "#1976D2",
          }}
          legendItems={[
            { label: "Co-Working", seriesName: "Coworking" },
            { label: "Meetings", seriesName: "Meeting" },
            { label: "Virtual Office", seriesName: "Virtual Office" },
            { label: "Workation", seriesName: "Workation" },
            { label: "Alt Revenues", seriesName: "Alternate Revenue" },
          ]}
        />
      )}

      <WidgetTable
        tableTitle="Annual Monthly Income Breakup"
        data={paidRevenueData}
        dateColumn="date"
        totalKey="revenue"
        totalText="INR"
        titleAmountOverride=""
        titleAmountTotal={({ dateRange }) => {
          const summary = getRevenueSummaryForDateRange(
            unifiedRevenueData,
            dateRange
          );
          return `INR ${inrFormat(summary.total)}`;
        }}
        titleAmountGreen={({ dateRange }) => {
          const summary = getRevenueSummaryForDateRange(
            unifiedRevenueData,
            dateRange
          );
          return `INR ${inrFormat(summary.paid)}`;
        }}
        titleAmountRed={({ dateRange }) => {
          const summary = getRevenueSummaryForDateRange(
            unifiedRevenueData,
            dateRange
          );
          return `INR ${inrFormat(summary.unpaid)}`;
        }}
        greenTitle="Paid"
        redTitle="Unpaid"
        totalTitle="Total"
        summaryChipVariant="ticket"
        groupByKey="vertical"
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
            cellRenderer: (params) => params.value,
          },
        ]}
        exportData
      />
    </div>
  );
};

export default IncomeDetails;
