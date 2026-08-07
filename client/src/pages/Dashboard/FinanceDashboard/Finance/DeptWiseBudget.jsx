import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import WidgetSection from "../../../../components/WidgetSection";
import DataCard from "../../../../components/DataCard";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
import { useNavigate } from "react-router-dom";
import { transformBudgetData } from "../../../../utils/transformBudgetData";
import { inrFormat } from "../../../../utils/currencyFormat";
import YearlyGraph from "../../../../components/graphs/YearlyGraph";
import { parseAmount } from "../../../../utils/parseAmount";
import { CircularProgress } from "@mui/material";

const DeptWiseBudget = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const getFiscalYearStart = (date = dayjs()) => {
  const parsedDate = dayjs(date);
  return parsedDate.month() >= 3 ? parsedDate.year() : parsedDate.year() - 1;
};

const formatFiscalYear = (startYear) =>
  `FY ${startYear}-${String(startYear + 1).slice(-2)}`;

const getFiscalMonthIndex = (date) => {
  const parsedDate = dayjs(date);
  const month = parsedDate.month();

  return month >= 3 ? month - 3 : month + 9;
};

const [selectedFiscalYear, setSelectedFiscalYear] = useState(() =>
  formatFiscalYear(getFiscalYearStart())
);
  
const [hiddenDepartmentExpenseSeries, setHiddenDepartmentExpenseSeries] =
  useState({
    actual: false,
    projected: false,
  });
  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
    queryKey: ["allBudgets"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/budget/company-budget`);
        const budgets = response.data.allBudgets;
        return Array.isArray(budgets) ? budgets : [];
      } catch (error) {
        console.error("Error fetching budget:", error);
        return [];
      }
    },
  });

  const groupedData = hrFinance.reduce((acc, item) => {
    const month = dayjs(item.dueDate).format("MMMM YYYY");

    if (!acc[month]) {
      acc[month] = {
        month,
        latestDueDate: item.dueDate,
        projectedAmount: 0,
        amount: 0,
        tableData: {
          rows: [],
          columns: [
            {
              field: "department",
              headerName: "Department",
              flex: 1,
              cellRenderer: (params) => {
                const handleClick = () => {
                  navigate(
                    // `/app/dashboard/finance-dashboard/finance/dept-wise-budget/${params.value}`
                   `/app/dashboard/finance-dashboard/mix-bag/department-wise-budget/${encodeURIComponent(params.value)}`
                  );
                };
                return (
                  <span
                    style={{ cursor: "pointer", color: "#1E3D73" }}
                    onClick={handleClick}
                  >
                    {params.value}
                  </span>
                );
              },
            },
            { field: "amount", headerName: "Amount (INR)", flex: 1 },
          ],
        },
      };
    }

    acc[month].projectedAmount += item.projectedAmount;
    acc[month].amount += item.actualAmount;
    acc[month].tableData.rows.push({
      id: item._id,
      expanseName: item.expanseName,
      department: item.department?.name,
      departmentId: item.department?._id,
      expanseType: item.expanseType,
      amount: item.actualAmount,
      projectedAmount: item?.projectedAmount?.toFixed(2),
      dueDate: dayjs(item.dueDate).format("DD-MM-YYYY"),
      status: item.status,
    });

    return acc;
  }, {});

  const financialData = Object.values(groupedData)
    .map((data, index) => {
      const departmentMap = {};

      data.tableData.rows.forEach((row) => {
        const dept = row.department || "Unknown";
        const deptId = row.departmentId || "Unknown";
        const actual = row.amount || 0;
        const projected = parseFloat(
          row.projectedAmount?.toString().replace(/,/g, "") || "0"
        );

        if (!departmentMap[dept]) {
          departmentMap[dept] = {
            id: dept,
            department: dept,
            deptId: deptId,
            actualAmount: actual,
            projectedAmount: projected,
          };
        } else {
          departmentMap[dept].actualAmount += actual;
          departmentMap[dept].projectedAmount += projected;
        }
      });

      const transoformedRows = Object.values(departmentMap).map(
        (deptRow, index) => ({
          ...deptRow,
          srNo: index + 1,
          actualAmount: inrFormat(deptRow.actualAmount),
          projectedAmount: inrFormat(deptRow.projectedAmount),
        })
      );

      const transformedCols = [
        { field: "srNo", headerName: "SR NO", flex: 1 },
        {
          field: "department",
          headerName: "Department",
          flex: 1,
          cellRenderer: (params) => {
            const handleClick = () => {
              navigate(
                // `/app/dashboard/finance-dashboard/finance/dept-wise-budget/${params.value}`,
                `/app/dashboard/finance-dashboard/mix-bag/department-wise-budget/${encodeURIComponent(params.value)}`,
                {
                  state: {
                    deptId: params.data?.deptId,
                    deptName: params.value,
                  },
                }
              );
            };
            return (
              <span
                className="hover:underline"
                style={{ cursor: "pointer", color: "#1E3D73" }}
                onClick={handleClick}
              >
                {params.value}
              </span>
            );
          },
        },
        { field: "projectedAmount", headerName: "Projected Amount (INR)", flex: 1 },
        { field: "actualAmount", headerName: "Actual Amount (INR)", flex: 1 },
      ];

      return {
        ...data,
        projectedAmount: inrFormat(data.projectedAmount),
        amount: inrFormat(data.amount),
        tableData: {
          ...data.tableData,
          rows: transoformedRows,
          columns: transformedCols,
        },
      };
    })
    .sort((a, b) => dayjs(b.latestDueDate).diff(dayjs(a.latestDueDate)));

  const budgetBar = useMemo(() => {
    if (isHrLoading || !Array.isArray(hrFinance)) return null;
    return transformBudgetData(hrFinance);
  }, [isHrLoading, hrFinance]);


const getAmount = (value) => {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const departmentExpenseByFiscalYear = useMemo(() => {
  const fyData = {};

  (hrFinance || []).forEach((item) => {
    if (!item?.dueDate || !dayjs(item.dueDate).isValid()) {
      return;
    }

    const fiscalYearStart =
      getFiscalYearStart(item.dueDate);

    const fiscalYearLabel =
      formatFiscalYear(fiscalYearStart);

    const monthIndex =
      getFiscalMonthIndex(item.dueDate);

    if (!fyData[fiscalYearLabel]) {
      fyData[fiscalYearLabel] = {
        actual: Array(12).fill(0),
        projected: Array(12).fill(0),
      };
    }

    const actualAmount =
      getAmount(item?.actualAmount);

    const projectedAmount =
      getAmount(item?.projectedAmount);

    fyData[fiscalYearLabel].actual[monthIndex] +=
      actualAmount;

    fyData[fiscalYearLabel].projected[monthIndex] +=
      projectedAmount;
  });

  const currentFiscalYear =
    formatFiscalYear(getFiscalYearStart());

  if (!fyData[currentFiscalYear]) {
    fyData[currentFiscalYear] = {
      actual: Array(12).fill(0),
      projected: Array(12).fill(0),
    };
  }

  return fyData;
}, [hrFinance]);

const expenseRawSeries = useMemo(() => {
  return Object.entries(departmentExpenseByFiscalYear)
    .sort(([fyA], [fyB]) => {
      const startA = Number(fyA.slice(3, 7));
      const startB = Number(fyB.slice(3, 7));

      return startA - startB;
    })
    .flatMap(([fiscalYear, data]) => {
      
      const actualForGraph = data.actual.map((actualAmount) => {
        if (hiddenDepartmentExpenseSeries.actual) {
          return 0;
        }

        return Number(actualAmount || 0);
      });

      const projectedForGraph = data.projected.map(
        (projectedAmount, monthIndex) => {
         
          if (hiddenDepartmentExpenseSeries.projected) {
            return 0;
          }

          
          if (hiddenDepartmentExpenseSeries.actual) {
            return Number(projectedAmount || 0);
          }

         
          const actualAmount =
            Number(data.actual?.[monthIndex] || 0);

          return actualAmount > 0
            ? 0
            : Number(projectedAmount || 0);
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
  departmentExpenseByFiscalYear,
  hiddenDepartmentExpenseSeries.actual,
  hiddenDepartmentExpenseSeries.projected,
]);


const { roundedMax, tickAmount } = useMemo(() => {
 
  const selectedYearSeries = expenseRawSeries.filter(
    (series) => series.group === selectedFiscalYear,
  );

 
  const monthlyTotals = Array.from(
    { length: 12 },
    (_, monthIndex) =>
      selectedYearSeries.reduce(
        (total, series) =>
          total + Number(series?.data?.[monthIndex] || 0),
        0,
      ),
  );

  const maxExpenseValue = Math.max(...monthlyTotals, 0);

  if (maxExpenseValue <= 0) {
    return {
      roundedMax: 10000,
      tickAmount: 1,
    };
  }

  
  const bufferedMax = maxExpenseValue * 1.1;
  const roughStep = bufferedMax / 6;

  const magnitude =
    10 ** Math.floor(Math.log10(roughStep));

  const normalizedStep = roughStep / magnitude;

  let step;

  if (normalizedStep <= 1) {
    step = magnitude;
  } else if (normalizedStep <= 2) {
    step = 2 * magnitude;
  } else if (normalizedStep <= 5) {
    step = 5 * magnitude;
  } else {
    step = 10 * magnitude;
  }

  const safeRoundedMax =
    Math.ceil(bufferedMax / step) * step;

  const safeTickAmount = Math.max(
    Math.round(safeRoundedMax / step),
    1,
  );

  return {
    roundedMax: safeRoundedMax,
    tickAmount: safeTickAmount,
  };
}, [expenseRawSeries, selectedFiscalYear]);

const selectedYearTotals = useMemo(() => {
  const selectedYearData =
    departmentExpenseByFiscalYear?.[selectedFiscalYear] || {};

  const actualTotal =
    (selectedYearData.actual || []).reduce(
      (sum, amount) => sum + Number(amount || 0),
      0,
    ) || 0;

  const projectedTotal =
    (selectedYearData.projected || []).reduce(
      (sum, amount) => sum + Number(amount || 0),
      0,
    ) || 0;

  return {
    actualTotal,
    projectedTotal,
  };
}, [departmentExpenseByFiscalYear, selectedFiscalYear]);


  const expenseOptions = {
  chart: {
  type: "bar",
  toolbar: {
    show: false,
  },
  stacked: true,
  fontFamily: "Poppins-Regular, Arial, sans-serif",

  events: {
    legendClick: (_chartContext, seriesIndex) => {
      setHiddenDepartmentExpenseSeries((currentState) => {
        /*
         * Series index 0 = Actual Amount
         */
        if (seriesIndex === 0) {
          return {
            ...currentState,
            actual: !currentState.actual,
          };
        }

        /*
         * Series index 1 = Projected Amount
         */
        if (seriesIndex === 1) {
          return {
            ...currentState,
            projected: !currentState.projected,
          };
        }

        return currentState;
      });
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
        formatter: (_, config) => {
          const total =
            config?.w?.globals?.stackedSeriesTotals?.[config?.dataPointIndex] ||
            0;

          return total ? inrFormat(Number(total)) : "";
        },
        style: {
          fontSize: "12px",
          fontWeight: 600,
          color: "#000",
        },
        offsetY: -8,
      },
    },
  },
},
   dataLabels: {
  enabled: false,
},

    // yaxis: {
    //   max: 7000000,
    //   title: { text: "Amount In Lakhs (INR)" },
    //   labels: {
    //     formatter: (val) => `${val / 100000}`,
    //   },
    // },
  xaxis: {
  crosshairs: {
    show: false,

    fill: {
      opacity: 0,
    },

    stroke: {
      opacity: 0,
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
      const axisValue =
        Number(value || 0) / 10000;

      if (Number.isInteger(axisValue)) {
        return String(axisValue);
      }

      return Number(
        axisValue.toFixed(2),
      ).toString();
    },

    style: {
      fontFamily: "Poppins-Regular, Arial, sans-serif",
      fontSize: "11px",
    },
  },
},
   fill: {
  opacity: 1,
},
states: {
  hover: {
    filter: {
      type: "none",
    },
  },
  active: {
    filter: {
      type: "none",
    },
  },
},
legend: {
  show: true,
  position: "top",

 
  onItemClick: {
    toggleDataSeries: false,
  },

  labels: {
    colors: [
      hiddenDepartmentExpenseSeries.actual
        ? "#D5D5D5"
        : "#4B4B4B",

      hiddenDepartmentExpenseSeries.projected
        ? "#D5D5D5"
        : "#4B4B4B",
    ],
  },

  markers: {
    fillColors: [
      hiddenDepartmentExpenseSeries.actual
        ? "#E1F5EF"
        : "#54C4A7",

      hiddenDepartmentExpenseSeries.projected
        ? "#E2E2E2"
        : "#C4C4C4",
    ],
  },
},

  tooltip: {
  enabled: true,
  shared: true,
  intersect: false,

  custom: function ({ dataPointIndex, w }) {
    const selectedYearData =
      departmentExpenseByFiscalYear?.[
        selectedFiscalYear
      ];

    const actualAmount = Number(
      selectedYearData?.actual?.[
        dataPointIndex
      ] || 0,
    );

    const projectedAmount = Number(
      selectedYearData?.projected?.[
        dataPointIndex
      ] || 0,
    );

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
                background: #C4C4C4;
                display: inline-block;
                flex-shrink: 0;
              "
            ></span>

            <span>Projected Amount:</span>
          </div>

          <span style="font-weight: 600;">
            INR ${Math.round(
              projectedAmount,
            ).toLocaleString("en-IN")}
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
                background: #54C4A7;
                display: inline-block;
                flex-shrink: 0;
              "
            ></span>

            <span>Actual Amount:</span>
          </div>

          <span style="font-weight: 600;">
            INR ${Math.round(
              actualAmount,
            ).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    `;
  },
},
  }

const totalUtilised =
  expenseRawSeries
    .find(
      (item) =>
        item.group === selectedFiscalYear && item.name === "Actual Amount"
    )
    ?.data?.reduce((acc, val) => acc + val, 0) || 0;

  // ✅ BLOCK RENDERING UNTIL DATA IS READY
  // if (isHrLoading || !budgetBar || !budgetBar.utilisedBudget) {
  //   return (
  //     <div className="h-screen flex justify-start items-center">
  //       <CircularProgress />
  //     </div>
  //   ); 
  // }



  return (
    // <div className="flex flex-col gap-8">
       <div className="p-4 flex flex-col gap-8">
      <YearlyGraph
        data={expenseRawSeries}
        options={expenseOptions}
        title={"BIZ NEST DEPARTMENT WISE EXPENSE DETAILS"}
        TitleAmountTotal={`INR ${inrFormat(selectedYearTotals.projectedTotal)}`}
        TitleAmountGreen={`INR ${inrFormat(selectedYearTotals.actualTotal)}`}
        totalTitle="PROJECTED"
        greenTitle="ACTUAL"
        summaryChipVariant="budget"
        onYearChange={setSelectedFiscalYear}
      />

      <AllocatedBudget financialData={financialData} noFilter hideTitle noInvoice exportData/>
    </div>
  );
};

export default DeptWiseBudget;
