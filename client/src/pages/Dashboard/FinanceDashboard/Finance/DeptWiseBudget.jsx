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

  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
    queryKey: ["hrFinance"],
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
                    `/app/dashboard/finance-dashboard/finance/dept-wise-budget/${params.value}`
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
                `/app/dashboard/finance-dashboard/finance/dept-wise-budget/${params.value}`,
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
    return [
      {
        group: "FY 2024-25",
        name: "total",
        data: budgetBar?.utilisedBudget || [],
      },
      {
        group: "FY 2025-26",
        name: "total",
        data: [1000054, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    ];
  }, [budgetBar]);

  const expenseOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      stacked: true,
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
      formatter: (val) => inrFormat(val),
      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
      offsetY: -22,
    },
    yaxis: {
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => `${Math.round(val / 100000)}`,
      },
    },
    fill: { opacity: 1 },
    legend: { show: true, position: "top" },
    tooltip: {
      enabled: false,
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        const rawData = expenseRawSeries[seriesIndex]?.data[dataPointIndex];
        return `
          <div style="padding: 8px; font-size: 13px; font-family: Poppins, sans-serif">
            <div style="display: flex; align-items: center; justify-content: space-between; background-color: #d7fff4; color: #00936c; padding: 6px 8px; border-radius: 4px; margin-bottom: 4px;">
              <div><strong>Total Expense:</strong></div>
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
    budgetBar?.utilisedBudget?.reduce((acc, val) => acc + val, 0) || 0;

  // ✅ BLOCK RENDERING UNTIL DATA IS READY
  if (isHrLoading || !budgetBar || !budgetBar.utilisedBudget) {
    return (
      <div className="h-screen flex justify-start items-center">
        <CircularProgress />
      </div>
    ); // Replace with Skeleton if you have one
  }

  return (
    <div className="flex flex-col gap-8">
      <YearlyGraph
        data={expenseRawSeries}
        options={expenseOptions}
        title={"BIZ Nest DEPARTMENT WISE EXPENSE"}
        titleAmount={`INR ${Math.round(totalUtilised).toLocaleString("en-IN")}`}
      />

      <div>
        <WidgetSection layout={3} padding>
          <DataCard
            data={"INR 50,00,000"}
            title={"Projected"}
            description={`Current Month: ${new Date().toLocaleString(
              "default",
              {
                month: "short",
              }
            )}-25`}
          />
          <DataCard
            data={"INR 45,00,000"}
            title={"Actual"}
            description={`Current Month: ${new Date().toLocaleString(
              "default",
              {
                month: "short",
              }
            )}-25`}
          />
          <DataCard
            data={"INR 7,000"}
            title={"Requested"}
            description={`Current Month: ${new Date().toLocaleString(
              "default",
              {
                month: "short",
              }
            )}-25`}
          />
        </WidgetSection>
      </div>

      <AllocatedBudget financialData={financialData} noFilter hideTitle />
    </div>
  );
};

export default DeptWiseBudget;
