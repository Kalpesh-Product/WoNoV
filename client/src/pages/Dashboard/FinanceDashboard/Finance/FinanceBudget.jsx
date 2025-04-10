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

const FinanceBudget = () => {
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
      month: "April 2025",
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
            paymentDate: "2025-04-10",
            status: "Paid",
          },
          {
            id: 2,
            category: "Domain",
            expenseName: "Domain Renewal",
            amount: "1500",
            paymentDate: "2025-04-12",
            status: "Pending",
          },
          {
            id: 3,
            category: "Software",
            expenseName: "SaaS Subscription",
            amount: "4500",
            paymentDate: "2025-04-15",
            status: "Paid",
          },
          {
            id: 4,
            category: "Marketing",
            expenseName: "Ad Campaign",
            amount: "3500",
            paymentDate: "2025-04-20",
            status: "Paid",
          },
        ],
      },
    },
    {
      month: "May 2025",
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
            paymentDate: "2025-05-05",
            status: "Paid",
          },
          {
            id: 2,
            category: "Software",
            expenseName: "CRM Subscription",
            amount: "5500",
            paymentDate: "2025-05-07",
            status: "Pending",
          },
          {
            id: 3,
            category: "Marketing",
            expenseName: "Social Media Ads",
            amount: "7000",
            paymentDate: "2025-05-12",
            status: "Paid",
          },
          {
            id: 4,
            category: "Office",
            expenseName: "Internet Bill",
            amount: "2000",
            paymentDate: "2025-05-18",
            status: "Paid",
          },
        ],
      },
    },
    {
      month: "June 2025",
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
            paymentDate: "2025-06-03",
            status: "Paid",
          },
          {
            id: 2,
            category: "Marketing",
            expenseName: "Email Marketing",
            amount: "3000",
            paymentDate: "2025-06-08",
            status: "Pending",
          },
          {
            id: 3,
            category: "Office",
            expenseName: "Electricity Bill",
            amount: "1500",
            paymentDate: "2025-06-10",
            status: "Paid",
          },
          {
            id: 4,
            category: "Salaries",
            expenseName: "Freelancer Payment",
            amount: "8000",
            paymentDate: "2025-06-15",
            status: "Paid",
          },
        ],
      },
    },
    {
      month: "July 2025",
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
            paymentDate: "2025-07-02",
            status: "Paid",
          },
          {
            id: 2,
            category: "Marketing",
            expenseName: "Content Marketing",
            amount: "4000",
            paymentDate: "2025-07-06",
            status: "Pending",
          },
          {
            id: 3,
            category: "Office",
            expenseName: "Rent",
            amount: "12000",
            paymentDate: "2025-07-10",
            status: "Paid",
          },
          {
            id: 4,
            category: "Salaries",
            expenseName: "Employee Bonus",
            amount: "5000",
            paymentDate: "2025-07-20",
            status: "Paid",
          },
        ],
      },
    },
    {
      month: "August 2025",
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
            paymentDate: "2025-08-04",
            status: "Paid",
          },
          {
            id: 2,
            category: "Software",
            expenseName: "Subscription Fee",
            amount: "2000",
            paymentDate: "2025-08-08",
            status: "Pending",
          },
          {
            id: 3,
            category: "Marketing",
            expenseName: "PPC Ads",
            amount: "5000",
            paymentDate: "2025-08-14",
            status: "Paid",
          },
          {
            id: 4,
            category: "Office",
            expenseName: "Water Bill",
            amount: "1000",
            paymentDate: "2025-08-18",
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

      <WidgetSection layout={3} padding>
        <DataCard
          data={"40K"}
          title={"Projected"}
          description={`Current Month: ${new Date().toLocaleString("default", {
            month: "long",
          })}`}
        />
        <DataCard
          data={"35K"}
          title={"Actual"}
          description={`Current Month: ${new Date().toLocaleString("default", {
            month: "long",
          })}`}
        />
        <DataCard
          data={6000}
          title={"Requested"}
          description={`Current Month: ${new Date().toLocaleString("default", {
            month: "long",
          })}`}
        />
      </WidgetSection>

      <div className="flex flex-col gap-4 border-default border-borderGray rounded-md p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-title font-pmedium text-primary">
              Allocated Budget :{" "}
            </span>
            <span className="text-title font-pmedium">
              {"INR " + Number("500000").toLocaleString("en-IN")}
            </span>
          </div>
          <div>
            <PrimaryButton title={"Request Budget"} />
          </div>
        </div>
        <div>
          {financialData.map((data, index) => (
            <Accordion key={index} className="py-4">
              <AccordionSummary
                expandIcon={<IoIosArrowDown />}
                aria-controls={`panel{index}-content`}
                id={`panel{index}-header`}
                className="border-b-[1px] border-borderGray"
              >
                <div className="flex justify-between items-center w-full px-4">
                  <span className="text-subtitle font-pmedium">
                    {data.month}
                  </span>
                  <span className="text-subtitle font-pmedium">
                    {"INR " + Number(data.amount).toLocaleString("en-GB")}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails>
              <AgTable
                  search={data.tableData?.rows?.length > 10}
                  searchColumn={"Department"}
                  data={data.tableData.rows}
                  columns={data.tableData.columns}
                  tableHeight={400}
                  hideFilter={data.tableData.rows.length < 10}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinanceBudget;
