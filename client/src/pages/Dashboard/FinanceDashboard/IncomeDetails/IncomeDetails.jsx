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
        normalizedStatus: getNormalizedPaymentStatus(item.status),
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
          item.status ?? item.rentStatus
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

  const options = {
    colors: [
      "#1E3D73",
      "#2196F3",
      "#11daf5",
      "#00BCD4",
      "#1976D2",
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
          data={paidRevenueData}
          dateKey="date"
          valueKey="revenue"
          graphTitle="ANNUAL MONTHLY MIX INCOME"
          chartOptions={options}
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
