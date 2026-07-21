import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { SiCashapp } from "react-icons/si";
import Card from "../../../components/Card";
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

const CafeDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();
  const { hasPermission } = useUserPermissions();
  const axios = useAxiosPrivate();
  const department = usePageDepartment();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(() =>
    formatFiscalYear(getFiscalYearStart()),
  );

  useEffect(() => {
    setIsSidebarOpen(true);
  }, [setIsSidebarOpen]);

  const { data: budgets = [] } = useQuery({
    queryKey: ["cafe-dashboard-budget", department?._id],
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
      fiscalYearData[fiscalYear].projected[monthIndex] += Math.max(
        projectedAmount - actualAmount,
        0,
      );
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
    () => ({
      chart: { type: "bar", toolbar: { show: false }, stacked: true },
      colors: ["#54C4A7", "#c4c4c4"],
      plotOptions: { bar: { horizontal: false, columnWidth: "40%" } },
      dataLabels: { enabled: false },
      yaxis: {
        min: 0,
        title: { text: "Amount In Lakhs (INR)" },
        labels: { formatter: (value) => `${value / 100000}` },
      },
      legend: { show: true, position: "top" },
      tooltip: {
        y: { formatter: (value) => `INR ${inrFormat(Number(value || 0))}` },
      },
    }),
    [],
  );

  return (
    <div className="p-4">
      {hasPermission(PERMISSIONS.CAFE_DEPARTMENT_EXPENSE.value) && (
        <div className="mb-6">
          <YearlyGraph
            chartId="bargraph-cafe-expense"
            data={expenseSeries}
            options={expenseOptions}
            title="BIZ Nest CAFE DEPARTMENT EXPENSE"
            titleAmount={`INR ${inrFormat(totalExpense)}`}
            onYearChange={setSelectedFiscalYear}
          />
        </div>
      )}
      {hasPermission(PERMISSIONS.CAFE_FINANCE.value) && (
        <div className="w-full max-w-sm">
          <Card
            title="Finance"
            icon={<SiCashapp />}
            route="/app/dashboard/cafe-dashboard/finance"
          />
        </div>
      )}
    </div>
  );
};

export default CafeDashboard;








// import React, { useEffect } from "react";
// import { SiCashapp } from "react-icons/si";
// import Card from "../../../components/Card";
// import { PERMISSIONS } from "../../../constants/permissions";
// import { useSidebar } from "../../../context/SideBarContext";
// import useUserPermissions from "../../../hooks/useUserPermissions";

// const CafeDashboard = () => {
//   const { setIsSidebarOpen } = useSidebar();
//   const { hasPermission } = useUserPermissions();

//   useEffect(() => {
//     setIsSidebarOpen(true);
//   }, [setIsSidebarOpen]);

//   return (
//     <div className="p-4">
//       {hasPermission(PERMISSIONS.CAFE_FINANCE.value) && (
//         <div className="w-full max-w-sm">
//           <Card
//             title="Finance"
//             icon={<SiCashapp />}
//             route="/app/dashboard/cafe-dashboard/finance"
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default CafeDashboard;


// import React, { useEffect } from "react";
// import cafeImage from "../../../assets/cafe-dashboard-2.png"; // Import your image file
// import { useSidebar } from "../../../context/SideBarContext";

// const CafeDashboard = () => {
//   const { setIsSidebarOpen } = useSidebar();

//   useEffect(() => {
//     setIsSidebarOpen(true);
//   }, []); // Empty dependency array ensures this runs once on mount

//   return (
//     // <div className="fixed inset-0 -z-10 overflow-hidden">
//     <div className="h-[90vh] p-4 overflow-hidden w-full  rounded-lg">
//       <img
//         src={cafeImage}
//         alt="Cafe Background"
//         className="w-full h-full object-cover overflow-hidden rounded-lg"
//       />
//     </div>
//   );
// };

// export default CafeDashboard;
