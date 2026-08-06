import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { MdFormatListBulleted } from "react-icons/md";
import { SiCashapp, SiGoogleadsense } from "react-icons/si";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import { PERMISSIONS } from "../../../constants/permissions";
import { useSidebar } from "../../../context/SideBarContext";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import usePageDepartment from "../../../hooks/usePageDepartment";
import useUserPermissions from "../../../hooks/useUserPermissions";
import { inrFormat } from "../../../utils/currencyFormat";

const getFiscalYearStart = (date) =>
  dayjs(date).month() >= 3 ? dayjs(date).year() : dayjs(date).year() - 1;

const formatFiscalYear = (startYear) =>
  `FY ${startYear}-${String(startYear + 1).slice(-2)}`;

const getFiscalMonthIndex = (date) =>
  dayjs(date).month() >= 3 ? dayjs(date).month() - 3 : dayjs(date).month() + 9;

const toAmount = (value) => {
  if (typeof value === "number") return value;
  return Number(String(value || "").replace(/,/g, "")) || 0;
};

const LegalDashboardCard = ({ title, icon, route }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(route)}
      className="group relative flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-2xl bg-white p-6 text-center shadow-md transition-all hover:border-[0.2px] hover:border-primary hover:shadow-xl"
    >
      <span className="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <FaArrowRight size={14} />
      </span>

      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      )}

      <h3 className="text-base font-bold whitespace-nowrap">{title}</h3>
    </div>
  );
};

const LegalDashboard = () => {
  const navigate = useNavigate();
  const { setIsSidebarOpen } = useSidebar();
  const { permissions: userPermissions, hasPermission } = useUserPermissions();
  const axios = useAxiosPrivate();
  const department = usePageDepartment();
  const cardsConfig = [
    {
      route: "/app/dashboard/legal-dashboard/finance",
      title: "Finance",
      icon: <SiCashapp />,
      permission: PERMISSIONS.LEGAL_FINANCE.value,
    },
    {
      route: "/app/dashboard/legal-dashboard/mix-bag",
      title: "Mix Bag",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.LEGAL_MIX_BAG.value,
    },
    {
      route: "/app/dashboard/legal-dashboard/data",
      title: "Data",
      icon: <SiGoogleadsense />,
      permission: PERMISSIONS.LEGAL_DATA.value,
    },
  ];

  const allowedCards = cardsConfig.filter(
    (card) =>
      !card.permission || userPermissions.includes(card.permission),
  );
  const allowedCardCount = allowedCards.length;
  const cardGridColumns =
    allowedCardCount <= 1
      ? "grid-cols-1"
      : allowedCardCount === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : allowedCardCount === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(() =>
    formatFiscalYear(getFiscalYearStart()),
  );
const [hiddenLegalExpenseSeries, setHiddenLegalExpenseSeries] = useState({
  actual: false,
  projected: false,
});
  useEffect(() => {
    setIsSidebarOpen(true);
  }, [setIsSidebarOpen]);

  const { data: budgets = [] } = useQuery({
    queryKey: ["legal-dashboard-budget", department?._id],
    enabled: Boolean(department?._id),
    queryFn: async () => {
      const response = await axios.get(
        `/api/budget/company-budget?departmentId=${department._id}`,
      );
      return Array.isArray(response.data?.allBudgets)
        ? response.data.allBudgets
        : [];
    },
  });

  const legalExpenseByFiscalYear = useMemo(() => {
  const currentFiscalYear = formatFiscalYear(getFiscalYearStart());

  const fiscalYearData = {
    [currentFiscalYear]: {
      actual: Array(12).fill(0),
      projected: Array(12).fill(0),
    },
  };

  (budgets || []).forEach((budget) => {
    if (!budget?.dueDate || !dayjs(budget.dueDate).isValid()) {
      return;
    }

    const fiscalYear = formatFiscalYear(
      getFiscalYearStart(budget.dueDate),
    );

    const monthIndex = getFiscalMonthIndex(budget.dueDate);

    if (!fiscalYearData[fiscalYear]) {
      fiscalYearData[fiscalYear] = {
        actual: Array(12).fill(0),
        projected: Array(12).fill(0),
      };
    }

    const actualAmount = toAmount(budget.actualAmount);
    const projectedAmount = toAmount(budget.projectedAmount);

    fiscalYearData[fiscalYear].actual[monthIndex] += actualAmount;
    fiscalYearData[fiscalYear].projected[monthIndex] += projectedAmount;
  });

  return fiscalYearData;
}, [budgets]);

const expenseSeries = useMemo(() => {
  return Object.entries(legalExpenseByFiscalYear)
    .sort(([firstFiscalYear], [secondFiscalYear]) => {
      const firstStartYear = Number(
        firstFiscalYear.match(/\d{4}/)?.[0] || 0,
      );

      const secondStartYear = Number(
        secondFiscalYear.match(/\d{4}/)?.[0] || 0,
      );

      return firstStartYear - secondStartYear;
    })
    .flatMap(([fiscalYear, data]) => {
      /*
       * Actual legend hidden hai to Actual series 0.
       * Visible hai to original Actual values.
       */
      const actualForGraph = data.actual.map((actualAmount) =>
        hiddenLegalExpenseSeries.actual ? 0 : actualAmount,
      );

      const projectedForGraph = data.projected.map(
        (projectedAmount, monthIndex) => {
          /*
           * Projected legend hidden hai to
           * Projected graph se poori tarah hide.
           */
          if (hiddenLegalExpenseSeries.projected) {
            return 0;
          }

          /*
           * Actual legend hidden hai to
           * sab months ke original Projected dikhao.
           */
          if (hiddenLegalExpenseSeries.actual) {
            return projectedAmount;
          }

          /*
           * Default:
           * Actual available hai to Projected hide.
           * Actual nahi hai to Projected show.
           */
          const actualAmount = data.actual[monthIndex] || 0;

          return actualAmount > 0 ? 0 : projectedAmount;
        },
      );

      return [
        {
          name: "Actual Amount",
          group: fiscalYear,
          data: actualForGraph,
        },
        {
          name: "Projected Amount",
          group: fiscalYear,
          data: projectedForGraph,
        },
      ];
    });
}, [
  legalExpenseByFiscalYear,
  hiddenLegalExpenseSeries.actual,
  hiddenLegalExpenseSeries.projected,
]);

 const selectedLegalActualAmounts = useMemo(() => {
  return (
    legalExpenseByFiscalYear?.[selectedFiscalYear]?.actual ||
    Array(12).fill(0)
  );
}, [legalExpenseByFiscalYear, selectedFiscalYear]);

const totalExpense = useMemo(() => {
  return selectedLegalActualAmounts.reduce(
    (total, amount) => total + (Number(amount) || 0),
    0,
  );
}, [selectedLegalActualAmounts]);

const { roundedMax, tickAmount } = useMemo(() => {
  /*
   * Graph display series ke bajay original selected FY data use kar rahe hain.
   * Isse legend click karne par Y-axis scale change nahi hogi.
   */
  const selectedYearData =
    legalExpenseByFiscalYear?.[selectedFiscalYear] || {
      actual: Array(12).fill(0),
      projected: Array(12).fill(0),
    };

  const monthlyValues = Array.from(
    { length: 12 },
    (_, monthIndex) => {
      const actualAmount = Number(
        selectedYearData?.actual?.[monthIndex] || 0,
      );

      const projectedAmount = Number(
        selectedYearData?.projected?.[monthIndex] || 0,
      );

      /*
       * Default graph logic:
       * Actual hai to Actual consider hoga,
       * warna Projected.
       */
      return actualAmount > 0
        ? actualAmount
        : projectedAmount;
    },
  );

  const maximumValue = Math.max(...monthlyValues, 0);

  if (maximumValue <= 0) {
    return {
      roundedMax: 40000,
      tickAmount: 4,
    };
  }

  /*
   * BudgetPage jaisa dynamic readable scale.
   */
  const targetTickAmount = 5;
  const roughStep = maximumValue / targetTickAmount;

  const magnitude =
    10 ** Math.floor(Math.log10(roughStep));

  const normalizedStep = roughStep / magnitude;

  let niceStepMultiplier;

  if (normalizedStep <= 1) {
    niceStepMultiplier = 1;
  } else if (normalizedStep <= 2) {
    niceStepMultiplier = 2;
  } else if (normalizedStep <= 5) {
    niceStepMultiplier = 5;
  } else {
    niceStepMultiplier = 10;
  }

  const niceStep =
    niceStepMultiplier * magnitude;

  // const dynamicRoundedMax =
  //   Math.ceil(maximumValue / niceStep) * niceStep;
  const dynamicRoundedMax =
  (Math.ceil(maximumValue / niceStep) + 1) * niceStep;

  const dynamicTickAmount = Math.max(
    Math.round(dynamicRoundedMax / niceStep),
    1,
  );

  return {
    roundedMax: dynamicRoundedMax,
    tickAmount: dynamicTickAmount,
  };
}, [legalExpenseByFiscalYear, selectedFiscalYear]);

 const expenseOptions = useMemo(
  () => {
    // const selectedSeries = expenseSeries.filter(
    //   (series) => series.group === selectedFiscalYear,
    // );

    // const actualData =
    //   selectedSeries.find(
    //     (series) => series.name === "Actual Amount",
    //   )?.data || [];

    // const projectedData =
    //   selectedSeries.find(
    //     (series) => series.name === "Projected Amount",
    //   )?.data || [];

    // const highestMonthlyAmount = Math.max(
    //   ...Array.from({ length: 12 }, (_, index) => {
    //     const actualAmount = Number(actualData[index] || 0);
    //     const projectedAmount = Number(projectedData[index] || 0);

    //     return actualAmount + projectedAmount;
    //   }),
    //   0,
    // );

    // const highestAmountInLakhs = highestMonthlyAmount / 100000;

    // let yAxisMaximumInLakhs = 5;

    // if (highestAmountInLakhs > 0) {
    //   const magnitude =
    //     10 ** Math.floor(Math.log10(highestAmountInLakhs));

    //   const normalizedValue =
    //     highestAmountInLakhs / magnitude;

    //   let niceNormalizedMaximum;

    //   if (normalizedValue <= 1) {
    //     niceNormalizedMaximum = 1;
    //   } else if (normalizedValue <= 2) {
    //     niceNormalizedMaximum = 2;
    //   } else if (normalizedValue <= 3) {
    //     niceNormalizedMaximum = 3;
    //   } else if (normalizedValue <= 5) {
    //     niceNormalizedMaximum = 5;
    //   } else {
    //     niceNormalizedMaximum = 10;
    //   }

    //   yAxisMaximumInLakhs =
    //     niceNormalizedMaximum * magnitude;
    // }

    return {
      chart: {
        type: "bar",
        stacked: true,
        toolbar: {
          show: false,
        },
        fontFamily: "Poppins-Regular, Arial, sans-serif",
       animations: {
  enabled: false,
},

redrawOnWindowResize: false,
redrawOnParentResize: false,
     events: {
  legendClick: (_chartContext, seriesIndex) => {
    setHiddenLegalExpenseSeries((currentState) => {
      // Series index 0 = Actual Amount
      if (seriesIndex === 0) {
        return {
          ...currentState,
          actual: !currentState.actual,
        };
      }

      // Series index 1 = Projected Amount
      if (seriesIndex === 1) {
        return {
          ...currentState,
          projected: !currentState.projected,
        };
      }

      return currentState;
    });
  },

  // Purana navigation same rahega
  dataPointSelection: () => {
    navigate(
      "/app/dashboard/legal-dashboard/finance/budget",
    );
  },
},
      },

      colors: ["#54C4A7", "#c4c4c4"],

      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "40%",
          borderRadius: 5,
          borderRadiusApplication: "end",

          dataLabels: {
            position: "top",

            total: {
              enabled: true,

             formatter: (value) => {
  const totalAmount = Number(value || 0);

  if (totalAmount <= 0) {
    return "";
  }

  return Math.round(totalAmount).toLocaleString("en-IN");
},

              offsetY: -10,

              style: {
                fontSize: "11px",
                fontFamily:
                  "Poppins-Regular, Arial, sans-serif",
                fontWeight: 600,
                color: "#000000",
              },
            },
          },
        },
      },

      dataLabels: {
        enabled: false,
      },

      stroke: {
        show: false,
        width: 0,
      },

      fill: {
        opacity: 1,
      },

      states: {
        normal: {
          filter: {
            type: "none",
            value: 0,
          },
        },

        hover: {
          filter: {
            type: "none",
            value: 0,
          },
        },

        active: {
          allowMultipleDataPointsSelection: false,

          filter: {
            type: "none",
            value: 0,
          },
        },
      },

     grid: {
  padding: {
    top: 20,
    right: 10,
    bottom: 0,
    left: 0,
  },
},

      xaxis: {
        title: {
          text: "  ",
        },

        labels: {
          style: {
            fontFamily:
              "Poppins-Regular, Arial, sans-serif",
          },
        },
      },

     yaxis: {
  min: 0,
  max: roundedMax,
  tickAmount,
  forceNiceScale: false,

  title: {
    text: "Amount In Lakhs (INR)",
  },

  labels: {
    minWidth: 25,
    maxWidth: 35,

    formatter: (value) => {
     
      const axisValue = Number(value || 0) / 10000;

      if (Number.isInteger(axisValue)) {
        return String(axisValue);
      }

      return Number(axisValue.toFixed(2)).toString();
    },

    style: {
      fontFamily: "Poppins-Regular, Arial, sans-serif",
      fontSize: "11px",
    },
  },
},

     legend: {
  show: true,
  position: "top",
  fontFamily: "Poppins-Regular, Arial, sans-serif",

  
  onItemClick: {
    toggleDataSeries: false,
  },

  labels: {
    colors: [
      // Actual legend text
      hiddenLegalExpenseSeries.actual
        ? "#D5D5D5"
        : "#4B4B4B",

      // Projected legend text
      hiddenLegalExpenseSeries.projected
        ? "#D5D5D5"
        : "#4B4B4B",
    ],
  },

  markers: {
    fillColors: [
      // Actual marker
      hiddenLegalExpenseSeries.actual
        ? "#E1F5EF"
        : "#54C4A7",

      // Projected marker
      hiddenLegalExpenseSeries.projected
        ? "#E2E2E2"
        : "#C4C4C4",
    ],
  },
},

    tooltip: {
  enabled: true,
  shared: true,
  intersect: false,

  custom: ({ dataPointIndex, w }) => {
    const selectedYearData =
      legalExpenseByFiscalYear?.[selectedFiscalYear];

    const actualAmount =
      selectedYearData?.actual?.[dataPointIndex] || 0;

    const projectedAmount =
      selectedYearData?.projected?.[dataPointIndex] || 0;

    const monthLabel =
      w?.globals?.labels?.[dataPointIndex] ||
      `Month ${dataPointIndex + 1}`;

    return `
      <div
        class="apexcharts-tooltip-title"
        style="
          font-family: Poppins-Regular;
          font-size: 12px;
          padding: 6px 10px;
          margin-bottom: 0;
        "
      >
        ${monthLabel}
      </div>

      <div
        style="
          padding: 8px 10px;
          font-family: Poppins-Regular;
          font-size: 12px;
          background: #ffffff;
          min-width: 230px;
        "
      >
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            margin-bottom: 7px;
            white-space: nowrap;
          "
        >
          <div
            style="
              display: flex;
              align-items: center;
              gap: 6px;
            "
          >
            <span
              style="
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #54C4A7;
                display: inline-block;
                flex-shrink: 0;
              "
            ></span>

            <span>Actual Amount:</span>
          </div>

          <span style="font-weight: 600;">
            INR ${Math.round(actualAmount).toLocaleString("en-IN")}
          </span>
        </div>

        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            white-space: nowrap;
          "
        >
          <div
            style="
              display: flex;
              align-items: center;
              gap: 6px;
            "
          >
            <span
              style="
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #C4C4C4;
                display: inline-block;
                flex-shrink: 0;
              "
            ></span>

            <span>Projected Amount:</span>
          </div>

          <span style="font-weight: 600;">
            INR ${Math.round(projectedAmount).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    `;
  },
},
    };
  },
[
  expenseSeries,
  legalExpenseByFiscalYear,
  selectedFiscalYear,
  navigate,
  roundedMax,
  tickAmount,
  hiddenLegalExpenseSeries.actual,
  hiddenLegalExpenseSeries.projected,
],
);

  return (
    <div className="p-4">
      {hasPermission(PERMISSIONS.LEGAL_DEPARTMENT_EXPENSE.value) && (
        <div className="mb-6">
          <YearlyGraph
            chartId="bargraph-legal-expense"
            data={expenseSeries}
            options={expenseOptions}
            title="BIZ Nest LEGAL DEPARTMENT EXPENSE"
            titleAmount={`INR ${inrFormat(totalExpense)}`}
            onYearChange={setSelectedFiscalYear}
          />
        </div>
      )}
      {allowedCards.length > 0 && (
        <div className={`grid w-full gap-4 ${cardGridColumns}`}>
          {allowedCards.map((card) => (
            <LegalDashboardCard
              key={card.title}
              title={card.title}
              icon={card.icon}
              route={card.route}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LegalDashboard;
