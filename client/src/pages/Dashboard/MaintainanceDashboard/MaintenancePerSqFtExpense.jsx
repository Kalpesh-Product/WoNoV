import { useMemo, useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import PageFrame from "../../../components/Pages/PageFrame";
import WidgetSection from "../../../components/WidgetSection";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import usePageDepartment from "../../../hooks/usePageDepartment";
import SecondaryButton from "../../../components/SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const formatCurrencyWithDecimals = (value = 0) =>
  Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getCurrentFinancialYearLabel = () => {
  const today = dayjs();
  const startYear = today.month() < 3 ? today.year() - 1 : today.year();
  return `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
};

const getFinancialYear = (dateStr) => {
  const date = dayjs(dateStr);
  if (!date.isValid()) return null;

  const startYear = date.month() < 3 ? date.year() - 1 : date.year();
  return `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
};

const shiftFinancialYear = (fyLabel, direction) => {
  if (!fyLabel?.startsWith("FY")) {
    return getCurrentFinancialYearLabel();
  }

  const [startYearText] = fyLabel.replace("FY", "").trim().split("-");
  const startYear = parseInt(startYearText, 10);

  if (Number.isNaN(startYear)) {
    return getCurrentFinancialYearLabel();
  }

  const nextStartYear = startYear + direction;
  return `FY ${nextStartYear}-${String((nextStartYear + 1) % 100).padStart(2, "0")}`;
};

const MaintenancePerSqFtExpense = () => {
  const axios = useAxiosPrivate();
  const department = usePageDepartment();
  const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYearLabel());
  const MAINTENANCE_DEPARTMENT_ID = "6798bafbe469e809084e24a7";
  const activeDepartmentId = location.pathname.includes(
    "/maintenance-dashboard/"
  )
    ? MAINTENANCE_DEPARTMENT_ID
    : department?._id;

  const { data: maintenanceBudgets = [], isPending: isBudgetLoading } = useQuery({
    queryKey: ["departmentBudget", activeDepartmentId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/budget/company-budget?departmentId=${activeDepartmentId}`
      );
      return response.data?.allBudgets || [];
    },
    enabled: !!activeDepartmentId,
  });

  const tableData = useMemo(() => {
    if (isBudgetLoading || !Array.isArray(maintenanceBudgets)) return [];

    const selectedFYBudgets = maintenanceBudgets.filter(
      (item) => getFinancialYear(item?.dueDate) === selectedFY
    );

    const groupedByUnits = selectedFYBudgets.reduce((acc, item) => {
      const unit = item.unit;

      if (!unit?._id) return acc;

      const unitNo = unit.unitNo || "-";

      if (!acc[unitNo]) {
        acc[unitNo] = {
          unitNo,
          unitName: unit.unitName || "-",
          unitId: unit._id,
          buildingName: unit.building?.buildingName || "-",
          sqft: Number(unit.sqft) || 0,
          totalExpense: 0,
        };
      }

      acc[unitNo].totalExpense += Number(item.actualAmount) || 0;

      return acc;
    }, {});

    return Object.values(groupedByUnits)
      .sort((a, b) =>
        a.unitNo.localeCompare(b.unitNo, undefined, { numeric: true })
      )
      .map((group, index) => {
        const expensePerSqFt = group.sqft ? group.totalExpense / group.sqft : 0;

        return {
          ...group,
          srNo: index + 1,
          expense: formatCurrencyWithDecimals(expensePerSqFt),
          expensePerSqFt,
        };
      });
  }, [maintenanceBudgets, isBudgetLoading, selectedFY]);

  const perSqFtTotals = useMemo(() => {
    if (!tableData.length) return { totalSqFt: 0, totalExpense: 0 };

    return tableData.reduce(
      (acc, item) => {
        acc.totalExpense += Number(item.totalExpense) || 0;
        acc.totalSqFt += Number(item.sqft) || 0;
        return acc;
      },
      { totalSqFt: 0, totalExpense: 0 }
    );
  }, [tableData]);

  const expensePerSqFtTotal =
    perSqFtTotals.totalSqFt > 0
      ? perSqFtTotals.totalExpense / perSqFtTotals.totalSqFt
      : 0;

  const columns = [
    { headerName: "SR NO", field: "srNo", width: 300 },
    {
      headerName: "Unit No",
      field: "unitNo",
      flex: 1,
    },
    { headerName: "Building", field: "buildingName", flex: 1 },
    { headerName: "Expense (INR/sq.ft)", field: "expense",flex:1 },
  ];

  const maxY = Math.max(...tableData.map((item) => item.expensePerSqFt), 0);
  // const roundedMax = Math.max(5, Math.ceil(maxY / 5) * 5);

  const expenseOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      stacked: false,
      fontFamily: "Poppins-Regular, Arial, sans-serif",
    },
    colors: ["#54C4A7"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "30%",
        borderRadius: 5,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => formatCurrencyWithDecimals(val),
      style: { fontSize: "12px", colors: ["#000"] },
      offsetY: -22,
    },
    yaxis: {
      // max: roundedMax,
      title: { text: "Expense per Sq. Ft." },
      labels: {
        formatter: (value) => `${Math.round(value)}`,
      },
    },
    xaxis: {
      categories: tableData.map((item) => item.unitNo),
    },
    fill: {
      opacity: 1,
    },
    legend: {
      show: true,
      position: "top",
    },
  };
  const barGraphSeries = [
    {
      name: "Expense per Sq. Ft.",
      data: tableData.map((item) => item.expensePerSqFt),
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <WidgetSection
        layout={1}
        border
        padding
        title={`maintenance expense per sq. ft ${selectedFY}`}
        TitleAmount={`INR ${formatCurrencyWithDecimals(expensePerSqFtTotal)}`}
      >
        <div className="flex flex-col gap-4 rounded-md">
          <NormalBarGraph data={barGraphSeries} options={expenseOptions} />

          <div className="flex justify-center items-center gap-4 pt-2 -mt-2 pb-4">
            <SecondaryButton
              title={<MdNavigateBefore />}
              handleSubmit={() =>
                setSelectedFY(shiftFinancialYear(selectedFY, -1))
              }
            />

            <span className="text-primary text-content font-semibold">
              {selectedFY}
            </span>

            <SecondaryButton
              title={<MdNavigateNext />}
              handleSubmit={() =>
                setSelectedFY(shiftFinancialYear(selectedFY, 1))
              }
            />
          </div>
        </div>
      </WidgetSection>
      <PageFrame>
        <YearWiseTable
          data={tableData}
          columns={columns}
          search
          tableTitle={`maintenance expense per sq. ft ${selectedFY}`}
          exportData
        />
      </PageFrame>
    </div>
  );
};

export default MaintenancePerSqFtExpense;
