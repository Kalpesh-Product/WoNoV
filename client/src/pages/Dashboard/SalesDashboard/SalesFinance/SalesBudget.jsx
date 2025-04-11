import React from "react";
import LayerBarGraph from "../../../../components/graphs/LayerBarGraph";
import WidgetSection from "../../../../components/WidgetSection";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import PrimaryButton from "../../../../components/PrimaryButton";
import DataCard from "../../../../components/DataCard";
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";

const SalesBudget = () => {
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
  const financialData = [
    {
      month: "April 2024",
      projectedAmount: 18000,
      amount: "15000",
      tableData: {
        columns: [
          { field: "category", headerName: "Category", flex: 1 },
          { field: "expenseName", headerName: "Expense", flex: 1 },
          { field: "paymentDate", headerName: "Payment Date", flex: 1 },
          { field: "amount", headerName: "Amount", flex: 1 },
          { field: "status", headerName: "Status", flex: 1 },
        ],
        rows: [
          {
            id: 1,
            category: "Hosting",
            expenseName: "Hosting Fee",
            amount: "2500",
            paymentDate: "2024-04-10",
            status: "Paid",
          },
          {
            id: 2,
            category: "Domain",
            expenseName: "Domain Renewal",
            amount: "1500",
            paymentDate: "2024-04-12",
            status: "Pending",
          },
          {
            id: 3,
            category: "Software",
            expenseName: "SaaS Subscription",
            amount: "4500",
            paymentDate: "2024-04-15",
            status: "Paid",
          },
          {
            id: 4,
            category: "Marketing",
            expenseName: "Ad Campaign",
            amount: "3500",
            paymentDate: "2024-04-20",
            status: "Paid",
          },
        ],
      },
    },
    {
      month: "May 2024",
      projectedAmount: 23000,
      amount: "20000",
      tableData: {
        columns: [
          { field: "category", headerName: "Category", flex: 1 },
          { field: "expenseName", headerName: "Expense", flex: 1 },
          { field: "paymentDate", headerName: "Payment Date", flex: 1 },
          { field: "amount", headerName: "Amount", flex: 1 },
          { field: "status", headerName: "Status", flex: 1 },
        ],
        rows: [
          {
            id: 1,
            category: "Hosting",
            expenseName: "VPS Fee",
            amount: "3000",
            paymentDate: "2024-05-05",
            status: "Paid",
          },
          {
            id: 2,
            category: "Software",
            expenseName: "CRM Subscription",
            amount: "5500",
            paymentDate: "2024-05-07",
            status: "Pending",
          },
          {
            id: 3,
            category: "Marketing",
            expenseName: "Social Media Ads",
            amount: "7000",
            paymentDate: "2024-05-12",
            status: "Paid",
          },
          {
            id: 4,
            category: "Office",
            expenseName: "Internet Bill",
            amount: "2000",
            paymentDate: "2024-05-18",
            status: "Paid",
          },
        ],
      },
    },
    {
      month: "June 2024",
      projectedAmount: 20000,
      amount: "18500",
      tableData: {
        columns: [
          { field: "category", headerName: "Category", flex: 1 },
          { field: "expenseName", headerName: "Expense", flex: 1 },
          { field: "paymentDate", headerName: "Payment Date", flex: 1 },
          { field: "amount", headerName: "Amount", flex: 1 },
          { field: "status", headerName: "Status", flex: 1 },
        ],
        rows: [
          {
            id: 1,
            category: "Software",
            expenseName: "Accounting Software",
            amount: "5000",
            paymentDate: "2024-06-03",
            status: "Paid",
          },
          {
            id: 2,
            category: "Marketing",
            expenseName: "Email Marketing",
            amount: "3000",
            paymentDate: "2024-06-08",
            status: "Pending",
          },
          {
            id: 3,
            category: "Office",
            expenseName: "Electricity Bill",
            amount: "1500",
            paymentDate: "2024-06-10",
            status: "Paid",
          },
          {
            id: 4,
            category: "Salaries",
            expenseName: "Freelancer Payment",
            amount: "8000",
            paymentDate: "2024-06-15",
            status: "Paid",
          },
        ],
      },
    },
    {
      month: "July 2024",
      projectedAmount: 25000,
      amount: "22000",
      tableData: {
        columns: [
          { field: "category", headerName: "Category", flex: 1 },
          { field: "expenseName", headerName: "Expense", flex: 1 },
          { field: "paymentDate", headerName: "Payment Date", flex: 1 },
          { field: "amount", headerName: "Amount", flex: 1 },
          { field: "status", headerName: "Status", flex: 1 },
        ],
        rows: [
          {
            id: 1,
            category: "Software",
            expenseName: "Cloud Storage",
            amount: "2000",
            paymentDate: "2024-07-02",
            status: "Paid",
          },
          {
            id: 2,
            category: "Marketing",
            expenseName: "Content Marketing",
            amount: "4000",
            paymentDate: "2024-07-06",
            status: "Pending",
          },
          {
            id: 3,
            category: "Office",
            expenseName: "Rent",
            amount: "12000",
            paymentDate: "2024-07-10",
            status: "Paid",
          },
          {
            id: 4,
            category: "Salaries",
            expenseName: "Employee Bonus",
            amount: "5000",
            paymentDate: "2024-07-20",
            status: "Paid",
          },
        ],
      },
    },
    {
      month: "August 2024",
      projectedAmount: 21000,
      amount: "19500",
      tableData: {
        columns: [
          { field: "category", headerName: "Category", flex: 1 },
          { field: "expenseName", headerName: "Expense", flex: 1 },
          { field: "paymentDate", headerName: "Payment Date", flex: 1 },
          { field: "amount", headerName: "Amount", flex: 1 },
          { field: "status", headerName: "Status", flex: 1 },
        ],
        rows: [
          {
            id: 1,
            category: "Hosting",
            expenseName: "Server Maintenance",
            amount: "4000",
            paymentDate: "2024-08-04",
            status: "Paid",
          },
          {
            id: 2,
            category: "Software",
            expenseName: "Subscription Fee",
            amount: "2000",
            paymentDate: "2024-08-08",
            status: "Pending",
          },
          {
            id: 3,
            category: "Marketing",
            expenseName: "PPC Ads",
            amount: "5000",
            paymentDate: "2024-08-14",
            status: "Paid",
          },
          {
            id: 4,
            category: "Office",
            expenseName: "Water Bill",
            amount: "1000",
            paymentDate: "2024-08-18",
            status: "Paid",
          },
        ],
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="border-default border-borderGray rounded-md">
        <WidgetSection layout={1} title={"BUDGET 2024"}>
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
