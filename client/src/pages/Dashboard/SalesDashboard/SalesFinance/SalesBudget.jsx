import React from "react";
import LayerBarGraph from "../../../../components/graphs/LayerBarGraph";
import dayjs from "dayjs";
import WidgetSection from "../../../../components/WidgetSection";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import PrimaryButton from "../../../../components/PrimaryButton";
import DataCard from "../../../../components/DataCard";
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const SalesBudget = () => {
 const axios = useAxiosPrivate();

   const { data: hrFinance = [] } = useQuery({
      queryKey: ["hrFinance"],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/budget/company-budget?departmentId=6798bab9e469e809084e249e
            `
          );
          return response.data.allBudgets;
        } catch (error) {
          throw new Error("Error fetching data");
        }
      },
    });

  // Data for the chart
  const utilisedData = [125, 150, 99, 85, 70, 50, 80, 95, 100, 65, 50, 120];
  const defaultData = utilisedData.map((value) =>
    Math.max(100 - Math.min(value, 100), 0)
  );
  const utilisedStack = utilisedData.map((value) => Math.min(value, 100));
  const exceededData = utilisedData.map((value) =>
    value > 100 ? value - 100 : 0
  );

  const data = [
    { name: "Utilised Budget", data: utilisedStack },
    { name: "Default Budget", data: defaultData },
    { name: "Exceeded Budget", data: exceededData },
  ];

  const optionss = {
    chart: {
      type: "bar",
      toolbar: false,
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "35%",
        borderRadius: 3,
        borderRadiusWhenStacked: "all",
        borderRadiusApplication: "end",
      },
    },
    colors: ["#01bf50", "#01411C", "#FF0000"], // Colors for the series
    dataLabels: {
      enabled: true,
      fontSize: "10px",
      formatter: (value, { seriesIndex }) => {
        if (seriesIndex === 1) return "";
        return `${value}%`;
      },
    },
    xaxis: {
      categories: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
    yaxis: {
      max: 150,
      labels: {
        formatter: (value) => `${value}%`,
      },
    },
    tooltip: {
      shared: true, // Ensure all series values are shown together
      intersect: false, // Avoid showing individual values for each series separately
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const utilised = utilisedData[dataPointIndex] || 0;
        const exceeded = exceededData[dataPointIndex] || 0;
        const defaultVal = defaultData[dataPointIndex] || 0;

        // Custom tooltip HTML
        return `
        <div style="padding: 10px; font-size: 12px; line-height: 1.5; text-align: left;">
          <strong style="display: block; text-align: center; margin-bottom: 8px;">
            ${w.globals.labels[dataPointIndex]}
          </strong>
          <div style="display: flex; gap:3rem;">
            <span style="flex: 1; text-align: left;">Default Budget:</span>
            <span style="flex: 1; text-align: right;">100%</span>
          </div>
          <div style="display: flex; gap:3rem;">
            <span style="flex: 1; text-align: left;">Utilized Budget:</span>
            <span style="flex: 1; text-align: right;">${utilised}%</span>
          </div>
          <div style="display: flex; gap:3rem;">
            <span style="flex: 1; text-align: left;">Exceeded Budget:</span>
            <span style="flex: 1; text-align: right;">${exceeded}%</span>
          </div>
        </div>
      `;
      },
    },

    legend: {
      show: true,
      position: "top",
    },
  };

  // Data array for rendering the Accordion
//   const financialData = [
//     {
//       month: "April 2024",
//       projectedAmount: 18000,
//       amount: "15000",
//       tableData: {
//         columns: [
//           { field: "srNo", headerName: "SR NO", flex: 1 },
//           { field: "category", headerName: "Category", flex: 1 },
//           { field: "expenseName", headerName: "Expense", flex: 1 },
//           { field: "dueDate", headerName: "Due Date", flex: 1 },
//           { field: "amount", headerName: "Amount", flex: 1 },
//           { field: "status", headerName: "Status", flex: 1 },
//         ],
//         rows: [
//           {
//             srNo: 1,
//             category: "Hosting",
//             expenseName: "Hosting Fee",
//             amount: "2500",
//             dueDate: "2024-04-10",
//             status: "Paid",
//           },
//           {
//             srNo: 2,
//             category: "Domain",
//             expenseName: "Domain Renewal",
//             amount: "1500",
//             dueDate: "2024-04-12",
//             status: "Pending",
//           },
//           {
//             srNo: 3,
//             category: "Software",
//             expenseName: "SaaS Subscription",
//             amount: "4500",
//             dueDate: "2024-04-15",
//             status: "Paid",
//           },
//           {
//             srNo: 4,
//             category: "Marketing",
//             expenseName: "Ad Campaign",
//             amount: "3500",
//             dueDate: "2024-04-20",
//             status: "Paid",
//           },
//           {
//             srNo: 5,
//             category: "Office",
//             expenseName: "Printer Paper",
//             amount: "300",
//             dueDate: "2024-04-22",
//             status: "Paid",
//           },
//           {
//             srNo: 6,
//             category: "Utilities",
//             expenseName: "Water Supply",
//             amount: "200",
//             dueDate: "2024-04-24",
//             status: "Paid",
//           },
//           {
//             srNo: 7,
//             category: "Software",
//             expenseName: "Bug Tracking Tool",
//             amount: "1000",
//             dueDate: "2024-04-25",
//             status: "Pending",
//           },
//           {
//             srNo: 8,
//             category: "Salaries",
//             expenseName: "Part-time Developer",
//             amount: "3000",
//             dueDate: "2024-04-26",
//             status: "Paid",
//           },
//           {
//             srNo: 9,
//             category: "Marketing",
//             expenseName: "Design Templates",
//             amount: "500",
//             dueDate: "2024-04-28",
//             status: "Paid",
//           },
//           {
//             srNo: 10,
//             category: "Office",
//             expenseName: "Cleaning Supplies",
//             amount: "400",
//             dueDate: "2024-04-30",
//             status: "Pending",
//           },
//         ],
//       },
//     },
//     // Same structure to be repeated for May–August with unique data.
//   ];
  

// const transformedFinancialData = financialData.map((data) => {
//   const transformedRows = data.tableData.rows.map((row, index) => ({
//     srNo: index + 1,
//     category: row.category,
//     expenseName: row.expenseName,
//     amount: Number(row.amount).toLocaleString("en-IN", {
//       minimumFractionDigits: 0
//     }),
//     dueDate: dayjs(row.dueDate).format("DD-MM-YYYY"),
//     status: row.status,
//   }));

//   return {
//     ...data,
//     projectedAmount: Number(data.projectedAmount).toLocaleString("en-IN", {
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2,
//     }),
//     amount: Number(data.amount).toLocaleString("en-IN", {
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2,
//     }),
//     tableData: {
//       columns: data.tableData.columns,
//       rows: transformedRows,
//     },
//   };
// });

 const groupedData = hrFinance.reduce((acc, item) => {
    const month = dayjs(item.dueDate).format("MMM-YYYY"); // Extracting month and year

    if (!acc[month]) {
      acc[month] = {
        month,
        latestDueDate: item.dueDate, // Store latest due date for sorting
        projectedAmount: 0,
        amount: 0,
        tableData: {
          rows: [],
          columns: [
            { field: "expanseName", headerName: "Expense Name", flex: 1 },
            // { field: "department", headerName: "Department", flex: 200 },
            { field: "expanseType", headerName: "Expense Type", flex: 1 },
            { field: "projectedAmount", headerName: "Amount", flex: 1 },
            { field: "dueDate", headerName: "Due Date", flex: 1 },
            { field: "status", headerName: "Status", flex: 1 },
          ],
        },
      };
    }

    acc[month].projectedAmount += item.projectedAmount; // Summing the total projected amount per month
    acc[month].amount += item.projectedAmount; // Summing the total amount per month
    acc[month].tableData.rows.push({
      id: item._id,
      expanseName: item.expanseName,
      department: item.department,
      expanseType: item.expanseType,
      projectedAmount: item.projectedAmount.toFixed(2), // Ensuring two decimal places
      dueDate: dayjs(item.dueDate).format("DD-MM-YYYY"),
      status: item.status,
    });

    return acc;
  }, {});

  // Convert grouped data to array and sort by latest month (descending order)
   const financialData = Object.values(groupedData)
      .map((data,index) => {
         
        const transoformedRows = data.tableData.rows.map((row,index)=>({...row,srNo:index+1,projectedAmount:Number(row.projectedAmount.toLocaleString("en-IN").replace(/,/g, "")).toLocaleString("en-IN", { maximumFractionDigits: 0 })}))
        const transformedCols = [
          { field: 'srNo', headerName: 'SR NO', flex: 1 },
          ...data.tableData.columns
        ];
  
        return({
        ...data,
        projectedAmount: data.projectedAmount.toLocaleString("en-IN"), // Ensuring two decimal places for total amount
        amount: data.amount.toLocaleString("en-IN"), // Ensuring two decimal places for total amount
        tableData: {...data.tableData, rows:transoformedRows,columns: transformedCols}
      })
    })
      .sort((a, b) => dayjs(b.latestDueDate).diff(dayjs(a.latestDueDate))); // Sort descending

  return (
    <div className="flex flex-col gap-8">
      <div className="border-default border-borderGray rounded-md">
        <WidgetSection layout={1} title={"BUDGET 2024-25"}>
          <LayerBarGraph options={optionss} data={data} />
        </WidgetSection>
      </div>

      <div>
        <WidgetSection layout={3} padding>
          <DataCard data={"40K"} title={"Projected"} />
          <DataCard data={"35K"} title={"Actual"} />
          <DataCard data={6000} title={"Requested"} />
        </WidgetSection>
      </div>

      <div className="flex justify-end">
        <PrimaryButton
          title={"Request Budget"}
          padding="px-5 py-2"
          fontSize="text-base"
        />
      </div>

       <AllocatedBudget financialData={financialData}/>
    </div>
  );
};

export default SalesBudget;
