import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import WidgetSection from "../../../../components/WidgetSection";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import AgTable from "../../../../components/AgTable";

const SALES_REVENUE_BASE_PATH = "/app/dashboard/sales-dashboard/revenue";

const VERTICAL_ROUTE_MAP = {
  Meeting: "meetings",
  Meetings: "meetings",
  Alternate: "alt-revenue",
  "Alternate Revenue": "alt-revenue",
  "Alternate Revenues": "alt-revenue",
  "Alt. Revenue": "alt-revenue",
  "Alt. Revenues": "alt-revenue",
  "Virtual Office": "virtual-office",
  "Virtual Offices": "virtual-office",
  Workation: "workation",
  Workations: "workation",
  "Co-Working": "co-working",
  "Co-Working Revenue": "co-working",
  Coworking: "co-working",
  "Co Working": "co-working",
};

const months = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];
const fyOptions = [
  { label: "FY 2024–25", value: "2024-25" },
  { label: "FY 2025–26", value: "2025-26" },
];

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

const normalizeVerticalLabel = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "meeting" || normalized === "meetings") return "Meetings";
  if (
    normalized === "alternate" ||
    normalized === "alternate revenue" ||
    normalized === "alternate revenues" ||
    normalized === "alt. revenue" ||
    normalized === "alt. revenues"
  ) {
    return "Alt. Revenues";
  }
  if (normalized === "virtual office" || normalized === "virtual offices") {
    return "Virtual Offices";
  }
  if (normalized === "workation" || normalized === "workations") {
    return "Workations";
  }
  if (
    normalized === "co-working" ||
    normalized === "co-working revenue" ||
    normalized === "coworking" ||
    normalized === "co working"
  ) {
    return "Coworking";
  }

  return value || "N/A";
};

const getFinancialYearForDate = (value) => {
  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) return null;

  const monthIndex = dateObj.getMonth();
  const startYear = monthIndex < 3 ? dateObj.getFullYear() - 1 : dateObj.getFullYear();

  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
};

const ActualBusinessRevenue = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const getCurrentFinancialYearValue = () => {
    const today = new Date();
    const startYear =
      today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();
    return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
  };
  const getCurrentFinancialMonth = () => {
    const currentMonthIndex = new Date().getMonth();
    const financialMonthIndex =
      currentMonthIndex >= 3 ? currentMonthIndex - 3 : currentMonthIndex + 9;
    return months[financialMonthIndex];
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentFinancialMonth());
  const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYearValue());

  const { data: simpleRevenue = {}, isLoading: isTotalRevenue } = useQuery({
    queryKey: ["turnover-simple-revenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/simple-consolidated-revenue");
      return response.data || {};
    },
  });

  const unifiedRevenueData = useMemo(() => {
    const flatten = [];

    (simpleRevenue?.meetingRevenue || []).forEach((item) => {
      flatten.push({
        vertical: "Meetings",
        revenue: getNumericAmount(item.taxable),
        date: item.date,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      });
    });

    (simpleRevenue?.alternateRevenues || []).forEach((item) => {
      flatten.push({
        vertical: "Alt. Revenues",
        revenue: getNumericAmount(item.taxableAmount),
        date: item.invoiceCreationDate,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      });
    });

    (simpleRevenue?.virtualOfficeRevenues || []).forEach((item) => {
      flatten.push({
        vertical: "Virtual Offices",
        revenue: getNumericAmount(item.revenue ?? item.taxableAmount),
        date: item.rentDate,
        normalizedStatus: getNormalizedPaymentStatus(
          item.status ?? item.rentStatus,
        ),
      });
    });

    (simpleRevenue?.workationRevenues || []).forEach((item) => {
      flatten.push({
        vertical: "Workations",
        revenue: getNumericAmount(item.taxableAmount),
        date: item.date,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      });
    });

    (simpleRevenue?.coworkingRevenues || []).forEach((item) => {
      flatten.push({
        vertical: "Coworking",
        revenue: getNumericAmount(item.revenue),
        date: item.rentDate,
        normalizedStatus: getNormalizedPaymentStatus(item.rentStatus),
      });
    });

    return flatten.filter((item) => item.date);
  }, [simpleRevenue]);

  const dynamicFyOptions = useMemo(() => {
    const currentFinancialYearValue = getCurrentFinancialYearValue();
    const currentStartYear = Number(
      String(currentFinancialYearValue).split("-")[0],
    );
    const fyValues = new Set([currentFinancialYearValue]);

    for (let offset = 1; offset <= 10; offset += 1) {
      const startYear = currentStartYear + offset;
      fyValues.add(
        `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`,
      );
    }

    unifiedRevenueData.forEach((item) => {
      const fyKey = getFinancialYearForDate(item.date);
      if (fyKey) {
        fyValues.add(fyKey);
      }
    });

    return Array.from(fyValues)
      .sort()
      .map((fyValue) => ({
        value: fyValue,
        label: `FY ${fyValue}`,
      }));
  }, [unifiedRevenueData]);

  useEffect(() => {
    if (!dynamicFyOptions.some((fy) => fy.value === selectedFY)) {
      setSelectedFY(
        dynamicFyOptions[dynamicFyOptions.length - 1]?.value ||
          getCurrentFinancialYearValue(),
      );
    }
  }, [dynamicFyOptions, selectedFY]);

  const selectedMonthEntries = useMemo(
    () =>
      unifiedRevenueData.filter((item) => {
        const itemDate = new Date(item.date);
        if (Number.isNaN(itemDate.getTime())) return false;

        const financialMonth =
          months[
            itemDate.getMonth() >= 3
              ? itemDate.getMonth() - 3
              : itemDate.getMonth() + 9
          ];

        return (
          getFinancialYearForDate(item.date) === selectedFY &&
          financialMonth === selectedMonth
        );
      }),
    [unifiedRevenueData, selectedFY, selectedMonth],
  );

  const selectedMonthSummary = useMemo(
    () =>
      selectedMonthEntries.reduce(
        (summary, item) => {
          summary.total += item.revenue;

          if (item.normalizedStatus === "paid") {
            summary.paid += item.revenue;
          } else {
            summary.unpaid += item.revenue;
          }

          return summary;
        },
        { total: 0, paid: 0, unpaid: 0 },
      ),
    [selectedMonthEntries],
  );

  const selectedMonthData = useMemo(() => {
    const grouped = {};

    selectedMonthEntries.forEach((item) => {
      const vertical = normalizeVerticalLabel(item.vertical);

      if (!grouped[vertical]) {
        grouped[vertical] = {
          name: vertical,
          paidRevenue: 0,
          totalRevenue: 0,
          unpaidRevenue: 0,
        };
      }

      grouped[vertical].totalRevenue += item.revenue;

      if (item.normalizedStatus === "paid") {
        grouped[vertical].paidRevenue += item.revenue;
      } else {
        grouped[vertical].unpaidRevenue += item.revenue;
      }
    });

    return Object.values(grouped);
  }, [selectedMonthEntries]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleFinancialYearChange = (event) => {
    const newFinancialYear = event.target.value;
    setSelectedFY(newFinancialYear);
    setSelectedMonth((currentMonth) =>
      months.includes(currentMonth) ? currentMonth : getCurrentFinancialMonth(),
    );
  };

  const currentIndex = months.findIndex((m) => m === selectedMonth);

  const handlePrevMonth = () => {
    if (currentIndex > 0) {
      setSelectedMonth(months[currentIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    if (currentIndex < months.length - 1) {
      setSelectedMonth(months[currentIndex + 1]);
    }
  };

  const graphData = [
    {
      name: "Paid Revenue",
      data: selectedMonthData.map((item) => item.paidRevenue),
    },
  ];

  const options = {
    chart: {
      type: "bar",
      toolbar: false,
      stacked: false,
      fontFamily: "Poppins-Regular",
    },
    xaxis: {
      categories: selectedMonthData.map((item) => item.name),
      title: { text: "Verticals" },
    },
    yaxis: {
      title: { text: "Paid Revenue in Lakhs (INR)" },
      labels: {
        formatter: (value) => `${(value / 100000).toLocaleString("en-IN")}`,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "20%",
        borderRadius: 5,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => inrFormat(val),
      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
      offsetY: -22,
    },
    tooltip: {
      enabled: false,
      y: {
        formatter: (value) => `INR ${value.toLocaleString("en-IN")}`,
      },
    },
    legend: { position: "top" },
    colors: ["#54C4A7"],
  };

 const handleVerticalNavigation = (vertical) => {
    const targetPath = VERTICAL_ROUTE_MAP[vertical];
    if (!targetPath) return;

    navigate(`${SALES_REVENUE_BASE_PATH}/${targetPath}`, {
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
        aria-label={`Open ${vertical} revenue details`}
      >
        {params.value}
      </button>
    );
  };



  const tableData = selectedMonthData.map((domain, index) => ({
    id: index + 1,
    vertical: domain.name,
    revenue: ` ${inrFormat(domain.paidRevenue)}`,
  }));

  const selectedMonthYearLabel = useMemo(() => {
    const [startYearText, endYearSuffix] = String(selectedFY || "").split("-");
    const startYear = Number(startYearText);
    const endYear =
      endYearSuffix !== undefined
        ? 2000 + Number(endYearSuffix)
        : startYear + 1;

    if (!startYear || Number.isNaN(startYear) || Number.isNaN(endYear)) {
      return selectedMonth;
    }

    const monthIndex = months.indexOf(selectedMonth);
    const yearForMonth = monthIndex >= 0 && monthIndex <= 8 ? startYear : endYear;

    return `${selectedMonth} ${yearForMonth}`;
  }, [selectedFY, selectedMonth]);

  return (
    <div className="p-4 flex flex-col gap-4">
      {!isTotalRevenue ? (
        <>
          <WidgetSection
            layout={1}
            title={"Vertical-wise Revenue"}
            titleLabel={selectedMonthYearLabel}
            TitleAmount={`INR ${inrFormat(selectedMonthSummary.paid)}`}
            border
          >
            <NormalBarGraph data={graphData} options={options} height={400} />
          </WidgetSection>

          <div className="flex justify-center">
            <div className="flex items-center gap-4">
              <TextField
                select
                size="small"
                label="Financial Year"
                value={selectedFY}
                onChange={handleFinancialYearChange}
                className="w-[160px]"
                SelectProps={{
                  IconComponent: KeyboardArrowDownIcon,
                }}
              >
                {dynamicFyOptions.map((fy) => (
                  <MenuItem key={fy.value} value={fy.value}>
                    {fy.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-[150px]"
                SelectProps={{
                  IconComponent: KeyboardArrowDownIcon,
                }}
              >
                {months.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>

          <WidgetSection
            border
            title={`Vertical-wise Revenue Breakdown FY ${selectedFY}`}
            TitleAmountTotal={`INR ${inrFormat(selectedMonthSummary.total)}`}
            TitleAmountGreen={`INR ${inrFormat(selectedMonthSummary.paid)}`}
            TitleAmountRed={`INR ${inrFormat(selectedMonthSummary.unpaid)}`}
            totalTitle="Total"
            greenTitle="Paid"
            redTitle="Unpaid"
            summaryChipVariant="ticket"
          >
            <AgTable
              hideFilter
              tableHeight={300}
              columns={[
                { headerName: "Sr No", field: "id", width: 100 },
                // { headerName: "Vertical", field: "vertical", flex: 1 },
                 {
                  headerName: "Vertical",
                  field: "vertical",
                  flex: 1,
                  cellRenderer: verticalLinkRenderer,
                },
                { headerName: "Revenue (INR)", field: "revenue", width: 400 },
              ]}
              data={tableData}
              exportData
            />
          </WidgetSection>
        </>
      ) : (
        <div className="h-96 flex justify-center items-center">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default ActualBusinessRevenue;
