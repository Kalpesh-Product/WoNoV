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
      className="group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl bg-white p-6 text-center shadow-md transition-all hover:border-[0.2px] hover:border-primary hover:shadow-xl"
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
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(() =>
    formatFiscalYear(getFiscalYearStart()),
  );

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

  const expenseSeries = useMemo(() => {
    const currentFiscalYear = formatFiscalYear(getFiscalYearStart());
    const fiscalYearData = {
      [currentFiscalYear]: {
        actual: Array(12).fill(0),
        projected: Array(12).fill(0),
      },
    };

    budgets.forEach((budget) => {
      if (!budget?.dueDate || !dayjs(budget.dueDate).isValid()) return;

      const fiscalYear = formatFiscalYear(getFiscalYearStart(budget.dueDate));
      const monthIndex = getFiscalMonthIndex(budget.dueDate);
      fiscalYearData[fiscalYear] ||= {
        actual: Array(12).fill(0),
        projected: Array(12).fill(0),
      };

      const actualAmount = toAmount(budget.actualAmount);
      const projectedAmount = toAmount(budget.projectedAmount);
      fiscalYearData[fiscalYear].actual[monthIndex] += actualAmount;
      fiscalYearData[fiscalYear].projected[monthIndex] += projectedAmount;
    });

    return Object.entries(fiscalYearData).flatMap(([fiscalYear, data]) => [
      { name: "Actual Amount", group: fiscalYear, data: data.actual },
      { name: "Projected Amount", group: fiscalYear, data: data.projected },
    ]);
  }, [budgets]);

  const totalExpense = useMemo(
    () =>
      expenseSeries
        .find(
          (series) =>
            series.group === selectedFiscalYear &&
            series.name === "Actual Amount",
        )
        ?.data.reduce((total, amount) => total + amount, 0) || 0,
    [expenseSeries, selectedFiscalYear],
  );

 const expenseOptions = useMemo(
  () => {
    const selectedSeries = expenseSeries.filter(
      (series) => series.group === selectedFiscalYear,
    );

    const actualData =
      selectedSeries.find(
        (series) => series.name === "Actual Amount",
      )?.data || [];

    const projectedData =
      selectedSeries.find(
        (series) => series.name === "Projected Amount",
      )?.data || [];

    const highestMonthlyAmount = Math.max(
      ...Array.from({ length: 12 }, (_, index) => {
        const actualAmount = Number(actualData[index] || 0);
        const projectedAmount = Number(projectedData[index] || 0);

        return actualAmount + projectedAmount;
      }),
      0,
    );

    const highestAmountInLakhs = highestMonthlyAmount / 100000;

    let yAxisMaximumInLakhs = 5;

    if (highestAmountInLakhs > 0) {
      const magnitude =
        10 ** Math.floor(Math.log10(highestAmountInLakhs));

      const normalizedValue =
        highestAmountInLakhs / magnitude;

      let niceNormalizedMaximum;

      if (normalizedValue <= 1) {
        niceNormalizedMaximum = 1;
      } else if (normalizedValue <= 2) {
        niceNormalizedMaximum = 2;
      } else if (normalizedValue <= 3) {
        niceNormalizedMaximum = 3;
      } else if (normalizedValue <= 5) {
        niceNormalizedMaximum = 5;
      } else {
        niceNormalizedMaximum = 10;
      }

      yAxisMaximumInLakhs =
        niceNormalizedMaximum * magnitude;
    }

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
    dataPointSelection: () => {
      navigate(
        `/app/dashboard/legal-dashboard/finance/budget?title=${encodeURIComponent(
          "BIZ Nest LEGAL DEPARTMENT EXPENSE",
        )}&fy=${encodeURIComponent(selectedFiscalYear)}`,
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

              formatter: (value, options) => {
                const currentFiscalYear = formatFiscalYear(
                  getFiscalYearStart(dayjs()),
                );

                const currentMonthIndex =
                  getFiscalMonthIndex(dayjs());

                const isCurrentMonth =
                  selectedFiscalYear === currentFiscalYear &&
                  options.dataPointIndex ===
                    currentMonthIndex;

                if (isCurrentMonth) return "";

                const totalAmount = Number(value || 0);

                if (totalAmount <= 0) return "";

                return Math.round(
                  totalAmount,
                ).toLocaleString("en-IN");
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
          top: 8,
          right: 10,
          bottom: 0,
          left: 10,
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

        max: yAxisMaximumInLakhs * 100000,

        tickAmount: 4,

        forceNiceScale: false,

        title: {
          text: "Amount In Lakhs (INR)",

          style: {
            fontFamily:
              "Poppins-Regular, Arial, sans-serif",
          },
        },

        labels: {
          formatter: (value) =>
            `${Math.round(
              Number(value || 0) / 100000,
            )}`,

          style: {
            fontFamily:
              "Poppins-Regular, Arial, sans-serif",
          },
        },
      },

      legend: {
        show: true,
        position: "top",
        fontFamily:
          "Poppins-Regular, Arial, sans-serif",
      },

      tooltip: {
        enabled: true,
        shared: false,
        intersect: true,

        custom: ({
          seriesIndex,
          dataPointIndex,
          w,
        }) => {
          const seriesName =
            w.globals.seriesNames?.[seriesIndex] || "";

          const amount = Number(
            w.globals.initialSeries?.[seriesIndex]?.data?.[
              dataPointIndex
            ] || 0,
          );

          const monthLabel =
            w.globals.labels?.[dataPointIndex] ||
            `Month ${dataPointIndex + 1}`;

          const color =
            seriesName === "Actual Amount"
              ? "#54C4A7"
              : "#c4c4c4";

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
                min-width: 220px;
              "
            >
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  white-space: nowrap;
                "
              >
                <span
                  style="
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: ${color};
                    display: inline-block;
                    flex-shrink: 0;
                  "
                ></span>

                <span>${seriesName}:</span>

                <span style="font-weight: 600;">
                  INR ${Math.round(
                    amount,
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          `;
        },
      },
    };
  },
  [expenseSeries, selectedFiscalYear,navigate],
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
        <div
          className={`grid w-full gap-4 ${
            allowedCards.length === 1
              ? "grid-cols-1"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
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