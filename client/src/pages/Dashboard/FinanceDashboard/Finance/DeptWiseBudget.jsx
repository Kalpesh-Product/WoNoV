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
        { field: "projectedAmount", headerName: "Projected (INR)", flex: 1 },
        { field: "actualAmount", headerName: "Actual (INR)", flex: 1 },
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

const expenseRawSeries = useMemo(() => {
  const fyData = {};

  hrFinance.forEach((item) => {
    if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;

    const fiscalYearStart = getFiscalYearStart(item.dueDate);
    const fiscalYearLabel = formatFiscalYear(fiscalYearStart);
    const monthIndex = getFiscalMonthIndex(item.dueDate);

    if (!fyData[fiscalYearLabel]) {
      fyData[fiscalYearLabel] = Array(12).fill(0);
    }

    fyData[fiscalYearLabel][monthIndex] += Number(item.actualAmount || 0);
  });

  const currentFiscalYear = formatFiscalYear(getFiscalYearStart());

  if (!fyData[currentFiscalYear]) {
    fyData[currentFiscalYear] = Array(12).fill(0);
  }

  return Object.entries(fyData)
    .sort(([fyA], [fyB]) => {
      const startA = Number(fyA.slice(3, 7));
      const startB = Number(fyB.slice(3, 7));
      return startA - startB;
    })
    .map(([fiscalYear, data]) => ({
      name: "total",
      group: fiscalYear,
      data,
    }));
}, [hrFinance]);


  const expenseOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },

      stacked: false,
      fontFamily: "Poppins-Regular, Arial, sans-serif",
    },
    colors: ["#54C4A7", "#EB5C45"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
        borderRadiusApplication: "none",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => {
        return inrFormat(val);
      },

      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
      offsetY: -22,
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
    legend: {
      show: true,
      position: "top",
    },

    tooltip: {
      enabled: false,
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        const rawData = expenseRawSeries[seriesIndex]?.data[dataPointIndex];
        // return `<div style="padding: 8px; font-family: Poppins, sans-serif;">
        //       HR Expense: INR ${rawData.toLocaleString("en-IN")}
        //     </div>`;
        return `
              <div style="padding: 8px; font-size: 13px; font-family: Poppins, sans-serif">
          
                <div style="display: flex; align-items: center; justify-content: space-between; background-color: #d7fff4; color: #00936c; padding: 6px 8px; border-radius: 4px; margin-bottom: 4px;">
                  <div><strong>Finance Expense:</strong></div>
                  <div style="width: 10px;"></div>
               <div style="text-align: left;">INR ${Math.round(
                 rawData
               ).toLocaleString("en-IN")}</div>
  
                </div>
       
              </div>
            `;
      },
    },
  };

const totalUtilised =
  expenseRawSeries
    .find((item) => item.group === selectedFiscalYear)
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
