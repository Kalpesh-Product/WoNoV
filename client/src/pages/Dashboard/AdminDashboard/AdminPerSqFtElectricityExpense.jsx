import React from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import AgTable from "../../../components/AgTable";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../../components/Pages/PageFrame";
import WidgetSection from "../../../components/WidgetSection";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import usePageDepartment from "../../../hooks/usePageDepartment";
import FyBarGraphPercentage from "../../../components/graphs/FyBarGraphPercentage";
import FyBarGraph from "../../../components/graphs/FyBarGraph";
import FyBarGraphCount from "../../../components/graphs/FyBarGraphCount";
import FyMonthBarGraph from "../../../components/graphs/FyMonthBarGraph";
import WidgetTable from "../../../components/Tables/WidgetTable";

const AdminPerSqFtElectricityExpense = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const department = usePageDepartment();

  const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
    queryKey: ["clientsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/co-working-clients");
        const data = response.data.filter((item) => item.isActive);
        return data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
    queryKey: ["departmentBudget", department?._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/budget/company-budget?departmentId=${department?._id}`
      );
      const budgets = response.data.allBudgets;
      return Array.isArray(budgets)
        ? budgets.filter((item) => item.expanseType === "ELECTRICITY")
        : [];
    },
    enabled: !!department?._id, // <- ✅ prevents firing until department is ready
  });

  const { data: unitsData, isLoading: isUnitsData } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-simple-units");
      return response.data;
    },
  });

  const totalSqFt = isUnitsData
    ? []
    : unitsData.reduce((sum, item) => sum + (item.sqft || 0), 0);

  console.log("totalSqft ", totalSqFt);

  const graphData = isHrLoading
    ? []
    : hrFinance.map((item) => ({
        ...item,
        unitNo: item.unit?.unitNo,
        actualAmount: item.actualAmount,
        sqftdata: item.unit?.sqft ? item.actualAmount / item.unit.sqft : 0,
      }));

  console.log("Electricty", graphData);

  const tableData = isHrLoading
    ? []
    : hrFinance.map((item) => ({
        ...item,
        unitNo: item.unit?.unitNo,
        expense: item.unit?.sqft
          ? (item.actualAmount / item.unit.sqft).toFixed(2)
          : "0.00",
      }));
  console.log("table data ", tableData);
  const columns = [
    { headerName: "SR NO", field: "srNo", width: 100 },
    {
      headerName: "Unit No",
      field: "unitNo",
      flex: 1,
      cellRenderer: (params) => (
        <span
          role="button"
          // onClick={() => {
          //   navigate(
          //     `/app/dashboard/admin-dashboard/admin-offices/${params.value}`,
          //     { state: { unitId: params.data.unitId, unitName: params.value } }
          //   );
          // }}
          // className="text-primary underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },
    { headerName: "Expense (INR)", field: "expense", flex: 1 },
  ];

  const chartOptions = {
    dataLabels: {
      enabled: true,
      formatter: (val) => {
        return val.toFixed(2);
      },

      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
      offsetY: -22,
    },
    
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <FyMonthBarGraph
        data={graphData}
        dateKey="dueDate"
        valueKey="sqftdata"
        chartOptions={chartOptions}
        labelKey="unitNo"
        graphTitle="Electricity Expenses Per Sq.ft"
      />

      <WidgetTable
        data={tableData}
        columns={columns}
        totalKey="expense"
        dateColumn={"dueDate"}
        search
        sortByString="unitNo"
        sortOrder="asc"
        tableTitle="admin expense per sq. ft"
      />
    </div>
  );
};

export default AdminPerSqFtElectricityExpense;
