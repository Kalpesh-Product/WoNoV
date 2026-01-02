import React, { useMemo }  from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import AgTable from "../../../components/AgTable";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../../components/Pages/PageFrame";
import WidgetSection from "../../../components/WidgetSection";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import usePageDepartment from "../../../hooks/usePageDepartment";

const formatCurrencyWithDecimals = (value = 0) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// const AdminPerSqFtExpense = () => {
//   const axios = useAxiosPrivate();
//     const navigate = useNavigate();
    
  
//     const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
//       queryKey: ["clientsData"],
//       queryFn: async () => {
//         try {
//           const response = await axios.get("/api/sales/co-working-clients");
//           const data = response.data.filter((item) => item.isActive);
//           return data;
//         } catch (error) {
//           console.error("Error fetching clients data:", error);
//         }
//       },
//     });
  
//     // Group by Unit Number
//     const groupedByUnits = clientsData.reduce((acc, item) => {
//       const unitNo = item.unit?.unitNo || "-";
  
//       if (!acc[unitNo]) {
//         acc[unitNo] = {
//           unitNo,
//           unitName: item.unit?.unitName || "-",
//           unitId: item.unit?._id,
//           clients: [],
//           buildingName: item.unit?.building?.buildingName,
//         };
//       }
  
//       acc[unitNo].clients.push(item);
  
//       return acc;
//     }, {});
  
//     const tableData = Object.values(groupedByUnits)
//       .sort((a, b) =>
//         a.unitNo.localeCompare(b.unitNo, undefined, { numeric: true })
//       )
//       .map((group, index) => ({
//         srNo: index + 1,
//         unitId: group.unitId,
//         unitNo: group.unitNo,
//         unitName: group.unitName,
//         buildingName: group.buildingName,
//         clientsCount: group.clients.length,
//         rawClients: group.clients,
//       }));
  
//     const columns = [
//       { headerName: "SR NO", field: "srNo", width: 100 },
//       {
//         headerName: "Unit No",
//         field: "unitNo",
//         flex: 1,
//         cellRenderer: (params) => (
//           <span
//             role="button"
//             // onClick={() => {
//             //   navigate(
//             //     `/app/dashboard/admin-dashboard/admin-offices/${params.value}`,
//             //     { state: { unitId: params.data.unitId, unitName: params.value } }
//             //   );
//             // }}
//             // className="text-primary underline cursor-pointer"
//           >
//             {params.value}
//           </span>
//         ),
//       },
//       { headerName: "Building", field: "buildingName", flex: 1 },
//       { headerName: "Expense", field: "expense" },
//     ];
  
//     // Step 1: Prepare chartData
//     const chartData = tableData.map((unit) => ({
//       unitNo: unit.unitNo,
//       occupied: unit.clientsCount,
//     }));
  
  
//     const maxY = Math.max(...chartData.map((item) => item.occupied), 5);
//     const roundedMax = Math.ceil(maxY / 5) * 5;
  
  
//     const inrFormat = (val) => val.toLocaleString("en-IN");
  
//     const barGraphSeries = [
//       {
//         name: "Clients",
//         data: chartData.map((item) => item.occupied),
//       },
//     ];
//     const totalOffices = chartData.reduce((sum,item)=>(item.occupied + sum),0)
  
//     const expenseOptions = {
//       chart: {
//         type: "bar",
//         toolbar: { show: false },
//         stacked: false,
//         fontFamily: "Poppins-Regular, Arial, sans-serif",
//       },
//       colors: ["#54C4A7"],
//       plotOptions: {
//         bar: {
//           horizontal: false,
//           columnWidth: "30%",
//           borderRadius: 5,
//           dataLabels: { position: "top" },
//         },
//       },
//       dataLabels: {
//         enabled: true,
//         formatter: (val) => inrFormat(val),
//         style: { fontSize: "12px", colors: ["#000"] },
//         offsetY: -22,
//       },
//       yaxis: {
//         max: roundedMax,
//         title: { text: "Amount in Lakhs" },
//       },
//       xaxis: {
//         categories: chartData.map((item) => item.unitNo),
//       },
//       fill: {
//         opacity: 1,
//       },
//       legend: {
//         show: true,
//         position: "top",
//       },
//     };
  
//     return (
//       <div className="p-4 flex flex-col gap-4">
//         <WidgetSection layout={1} border padding title={"Admin Expense Per Sq. ft"} TitleAmount={`INR 0`}>
//           <NormalBarGraph data={[]} options={expenseOptions} />
//         </WidgetSection>
//         <PageFrame>
//           <YearWiseTable
//             data={tableData}
//             columns={columns}
//             search
//             tableTitle="Admin Expense Per Sq. ft"
//           />
//         </PageFrame>
//       </div>
//     );
// };

const AdminPerSqFtExpense = () => {
  const axios = useAxiosPrivate();
    const navigate = useNavigate();
    
  
   const department = usePageDepartment();

  const { data: hrFinance = [], isPending: isBudgetLoading } = useQuery({
    queryKey: ["departmentBudget", department?._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/budget/company-budget?departmentId=${department._id}`
      );
      return response.data?.allBudgets || [];
    },
    enabled: !!department?._id,
  });

  const tableData = useMemo(() => {
    if (isBudgetLoading || !Array.isArray(hrFinance)) return [];

    const groupedByUnits = hrFinance.reduce((acc, item) => {
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
  
    return  Object.values(groupedByUnits)
      .sort((a, b) =>
        a.unitNo.localeCompare(b.unitNo, undefined, { numeric: true })
      )
        .map((group, index) => {
        const expensePerSqFt = group.sqft
          ? group.totalExpense / group.sqft
          : 0;

        return {
          ...group,
          srNo: index + 1,
          expense: formatCurrencyWithDecimals(expensePerSqFt),
          expensePerSqFt,
        };
      });
  }, [hrFinance, isBudgetLoading]);

   const perSqFtTotals = useMemo(() => {
    if (!tableData.length) return { totalSqFt: 0, totalExpense: 0 };

    return tableData.reduce(
      (acc, item) => {
        acc.totalExpense += Number(item.totalExpense) || 0;
        acc.totalSqFt += Number(item.sqft) || 0;
        return acc;
              },
      { totalSqFt: 0, totalExpense: 0 })
       }, [tableData]);
  
   const expensePerSqFtTotal =
    perSqFtTotals.totalSqFt > 0
      ? perSqFtTotals.totalExpense / perSqFtTotals.totalSqFt
      : 0;

  const columns = [
    { headerName: "SR NO", field: "srNo", width: 100 },
    {
      headerName: "Unit No",
      field: "unitNo",
      flex: 1,
    },
    { headerName: "Building", field: "buildingName", flex: 1 },
    { headerName: "Expense (INR/sq.ft)", field: "expense" },
  ];

  const maxY = Math.max(
    ...tableData.map((item) => item.expensePerSqFt),
    0
  );
  const roundedMax = Math.max(5, Math.ceil(maxY / 5) * 5);

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
      max: roundedMax,
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
        title={"Admin Expense Per Sq. ft"}
        TitleAmount={`INR ${formatCurrencyWithDecimals(expensePerSqFtTotal)}`}
      >
        <NormalBarGraph data={barGraphSeries} options={expenseOptions} />
      </WidgetSection>
      <PageFrame>
        <YearWiseTable
          data={tableData}
          columns={columns}
          search
          tableTitle="Admin Expense Per Sq. ft"
        />
      </PageFrame>
    </div>
  );
};

export default AdminPerSqFtExpense;
