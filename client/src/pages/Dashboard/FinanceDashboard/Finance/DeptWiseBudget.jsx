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

// const expenseRawSeries = useMemo(() => {
//   const fyData = {};

//   hrFinance.forEach((item) => {
//     if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;

//     const fiscalYearStart = getFiscalYearStart(item.dueDate);
//     const fiscalYearLabel = formatFiscalYear(fiscalYearStart);
//     const monthIndex = getFiscalMonthIndex(item.dueDate);

//     if (!fyData[fiscalYearLabel]) {
//       fyData[fiscalYearLabel] = Array(12).fill(0);
//     }

//     fyData[fiscalYearLabel][monthIndex] += Number(item.actualAmount || 0);
//   });

//   const currentFiscalYear = formatFiscalYear(getFiscalYearStart());

//   if (!fyData[currentFiscalYear]) {
//     fyData[currentFiscalYear] = Array(12).fill(0);
//   }

//   return Object.entries(fyData)
//     .sort(([fyA], [fyB]) => {
//       const startA = Number(fyA.slice(3, 7));
//       const startB = Number(fyB.slice(3, 7));
//       return startA - startB;
//     })
//     .map(([fiscalYear, data]) => ({
//       name: "total",
//       group: fiscalYear,
//       data,
//     }));
// }, [hrFinance]);

const getAmount = (value) => {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const expenseRawSeries = useMemo(() => {
  const fyData = {};

  hrFinance.forEach((item) => {
    if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;

    const fiscalYearStart = getFiscalYearStart(item.dueDate);
    const fiscalYearLabel = formatFiscalYear(fiscalYearStart);
    const monthIndex = getFiscalMonthIndex(item.dueDate);

    if (!fyData[fiscalYearLabel]) {
      fyData[fiscalYearLabel] = {
        actual: Array(12).fill(0),
        projectedTotal: Array(12).fill(0),
      };
    }

    const actualAmount = getAmount(item.actualAmount);
const projectedAmount = getAmount(item.projectedAmount);

    fyData[fiscalYearLabel].actual[monthIndex] += actualAmount;
    fyData[fiscalYearLabel].projectedTotal[monthIndex] += projectedAmount;
  });

  const currentFiscalYear = formatFiscalYear(getFiscalYearStart());

  if (!fyData[currentFiscalYear]) {
    fyData[currentFiscalYear] = {
      actual: Array(12).fill(0),
      projectedTotal: Array(12).fill(0),
    };
  }

  return Object.entries(fyData)
    .sort(([fyA], [fyB]) => {
      const startA = Number(fyA.slice(3, 7));
      const startB = Number(fyB.slice(3, 7));
      return startA - startB;
    })
    .flatMap(([fiscalYear, data]) => {
      const projectedBalance = data.projectedTotal.map((projected, index) => {
        const actual = data.actual[index] || 0;
        return Math.max(projected - actual, 0);
      });

      return [
        {
          name: "Actual Amount",
          group: fiscalYear,
          data: data.actual,
        },
        {
          name: "Projected Amount",
          group: fiscalYear,
          data: projectedBalance,
        },
      ];
    });
}, [hrFinance]);


  const expenseOptions = {
    chart: {
  type: "bar",
  toolbar: { show: false },
  stacked: true,
  fontFamily: "Poppins-Regular, Arial, sans-serif",
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

    yaxis: {
      max: 7000000,
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => `${val / 100000}`,
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
},

  tooltip: {
  enabled: true,
  custom: function ({ seriesIndex, dataPointIndex, w }) {
    const seriesName = w.globals.seriesNames?.[seriesIndex];

    const actualSeries = w.globals.initialSeries.find(
      (item) => item.name === "Actual Amount"
    );

    const projectedSeries = w.globals.initialSeries.find(
      (item) => item.name === "Projected Amount"
    );

    const actualAmount = actualSeries?.data?.[dataPointIndex] || 0;
    const projectedBalance = projectedSeries?.data?.[dataPointIndex] || 0;

    // Projected series me balance store hai, tooltip me total projected dikhana hai
    const projectedTotal = actualAmount + projectedBalance;

    const monthLabel =
      w.globals.labels && w.globals.labels[dataPointIndex]
        ? w.globals.labels[dataPointIndex]
        : `Month ${dataPointIndex + 1}`;

    const isActual = seriesName === "Actual Amount";

    const label = isActual ? "Actual Amount" : "Projected Amount";
    const amount = isActual ? actualAmount : projectedTotal;
    const color = isActual ? "#54C4A7" : "#c4c4c4";

    return `
      <div class="apexcharts-tooltip-title" style="
        font-family: Poppins-Regular;
        font-size: 12px;
        padding: 6px 10px;
        margin-bottom: 0;
      ">
        ${monthLabel}
      </div>

      <div style="
        padding: 8px 10px;
        font-family: Poppins-Regular;
        font-size: 12px;
        background: #fff;
        min-width: 230px;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        ">
          <span style="
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${color};
            display: inline-block;
          "></span>

          <span>${label}:</span>

          <span style="font-weight: 600;">
            INR ${Math.round(amount).toLocaleString("en-IN")}
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
        title={"BIZ Nest DEPARTMENT WISE EXPENSE"}
        titleAmount={`INR ${Math.round(totalUtilised).toLocaleString("en-IN")}`}
        onYearChange={setSelectedFiscalYear}
      />

      <AllocatedBudget financialData={financialData} noFilter hideTitle noInvoice exportData/>
    </div>
  );
};

export default DeptWiseBudget;
