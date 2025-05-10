import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import LayerBarGraph from "../../../../components/graphs/LayerBarGraph";
import WidgetSection from "../../../../components/WidgetSection";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import PrimaryButton from "../../../../components/PrimaryButton";
import DataCard from "../../../../components/DataCard";
import { MdTrendingUp } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import BudgetGraph from "../../../../components/graphs/BudgetGraph";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { inrFormat } from "../../../../utils/currencyFormat";
import BarGraph from "../../../../components/graphs/BarGraph";
import { transformBudgetData } from "../../../../utils/transformBudgetData";

const FinanceBudget = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      expanseName: "",
      expanseType: "",
      projectedAmount: null,
      dueDate: "",
    },
  });
  // const { data: hrFinance = [] } = useQuery({
  //   queryKey: ["hrFinance"],
  //   queryFn: async () => {
  //     try {
  //       const response = await axios.get(
  //         `/api/budget/company-budget?departmentId=6798bab9e469e809084e249e
  //               `
  //       );
  //       return response.data.allBudgets;
  //     } catch (error) {
  //       throw new Error("Error fetching data");
  //     }
  //   },
  // });

  const hrFinancex = [
    // April 2024
    {
      _id: 1,
      expanseName: "GST Filing Fees",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 12000,
      dueDate: "2024-04-20",
      status: "Approved",
    },
    {
      _id: 2,
      expanseName: "Accounting Software Subscription",
      department: "Finance",
      expanseType: "Software",
      projectedAmount: 18000,
      dueDate: "2024-04-25",
      status: "Approved",
    },
    {
      _id: 3,
      expanseName: "Quarterly Audit Retainer",
      department: "Finance",
      expanseType: "Audit",
      projectedAmount: 35000,
      dueDate: "2024-04-28",
      status: "Pending",
    },
    {
      _id: 4,
      expanseName: "TDS Payment",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 22000,
      dueDate: "2024-04-15",
      status: "Approved",
    },
    {
      _id: 5,
      expanseName: "Finance Team Salaries",
      department: "Finance",
      expanseType: "Payroll",
      projectedAmount: 150000,
      dueDate: "2024-04-30",
      status: "Approved",
    },

    // May 2024
    {
      _id: 6,
      expanseName: "Income Tax Filing Consultant",
      department: "Finance",
      expanseType: "Professional Fees",
      projectedAmount: 26000,
      dueDate: "2024-05-10",
      status: "Requested",
    },
    {
      _id: 7,
      expanseName: "Accounts Reconciliation Services",
      department: "Finance",
      expanseType: "Service",
      projectedAmount: 15000,
      dueDate: "2024-05-18",
      status: "Approved",
    },
    {
      _id: 8,
      expanseName: "Finance Team Salaries",
      department: "Finance",
      expanseType: "Payroll",
      projectedAmount: 150000,
      dueDate: "2024-05-31",
      status: "Approved",
    },
    {
      _id: 9,
      expanseName: "Professional Tax Payment",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 5000,
      dueDate: "2024-05-25",
      status: "Approved",
    },
    {
      _id: 10,
      expanseName: "Cloud File Storage",
      department: "Finance",
      expanseType: "Software",
      projectedAmount: 7000,
      dueDate: "2024-05-15",
      status: "Approved",
    },

    // June 2024
    {
      _id: 11,
      expanseName: "Bank Charges & Transfers",
      department: "Finance",
      expanseType: "Banking",
      projectedAmount: 6000,
      dueDate: "2024-06-10",
      status: "Approved",
    },
    {
      _id: 12,
      expanseName: "TDS Filing",
      department: "Finance",
      expanseType: "Compliance",
      projectedAmount: 8000,
      dueDate: "2024-06-07",
      status: "Approved",
    },
    {
      _id: 13,
      expanseName: "Finance Team Salaries",
      department: "Finance",
      expanseType: "Payroll",
      projectedAmount: 150000,
      dueDate: "2024-06-30",
      status: "Approved",
    },
    {
      _id: 14,
      expanseName: "GST Payment",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 12000,
      dueDate: "2024-06-20",
      status: "Pending",
    },
    {
      _id: 15,
      expanseName: "Software License Renewal",
      department: "Finance",
      expanseType: "Software",
      projectedAmount: 20000,
      dueDate: "2024-06-28",
      status: "Approved",
    },

    // July 2024
    {
      _id: 16,
      expanseName: "Audit Prep Charges",
      department: "Finance",
      expanseType: "Audit",
      projectedAmount: 30000,
      dueDate: "2024-07-10",
      status: "Requested",
    },
    {
      _id: 17,
      expanseName: "Finance Team Salaries",
      department: "Finance",
      expanseType: "Payroll",
      projectedAmount: 150000,
      dueDate: "2024-07-31",
      status: "Approved",
    },
    {
      _id: 18,
      expanseName: "Quarterly Advance Tax",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 35000,
      dueDate: "2024-07-15",
      status: "Approved",
    },
    {
      _id: 19,
      expanseName: "Consultant Fee - MIS",
      department: "Finance",
      expanseType: "Consulting",
      projectedAmount: 20000,
      dueDate: "2024-07-22",
      status: "Approved",
    },
    {
      _id: 20,
      expanseName: "File Archival Subscription",
      department: "Finance",
      expanseType: "Software",
      projectedAmount: 5000,
      dueDate: "2024-07-27",
      status: "Approved",
    },

    // August 2024
    {
      _id: 21,
      expanseName: "Tax Return Filing",
      department: "Finance",
      expanseType: "Compliance",
      projectedAmount: 15000,
      dueDate: "2024-08-15",
      status: "Approved",
    },
    {
      _id: 22,
      expanseName: "Finance Team Salaries",
      department: "Finance",
      expanseType: "Payroll",
      projectedAmount: 150000,
      dueDate: "2024-08-31",
      status: "Approved",
    },
    {
      _id: 23,
      expanseName: "Virtual CFO Retainer",
      department: "Finance",
      expanseType: "Consulting",
      projectedAmount: 40000,
      dueDate: "2024-08-05",
      status: "Requested",
    },
    {
      _id: 24,
      expanseName: "Bank Loan EMI",
      department: "Finance",
      expanseType: "Loan",
      projectedAmount: 50000,
      dueDate: "2024-08-10",
      status: "Approved",
    },
    {
      _id: 25,
      expanseName: "Invoice Processing Tools",
      department: "Finance",
      expanseType: "Software",
      projectedAmount: 12000,
      dueDate: "2024-08-20",
      status: "Approved",
    },

    // September 2024
    {
      _id: 26,
      expanseName: "Advance Tax Payment",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 30000,
      dueDate: "2024-09-15",
      status: "Approved",
    },
    {
      _id: 27,
      expanseName: "Finance Team Salaries",
      department: "Finance",
      expanseType: "Payroll",
      projectedAmount: 150000,
      dueDate: "2024-09-30",
      status: "Approved",
    },
    {
      _id: 28,
      expanseName: "Accounts Review Fees",
      department: "Finance",
      expanseType: "Audit",
      projectedAmount: 20000,
      dueDate: "2024-09-18",
      status: "Requested",
    },
    {
      _id: 29,
      expanseName: "Ledger Software License",
      department: "Finance",
      expanseType: "Software",
      projectedAmount: 18000,
      dueDate: "2024-09-25",
      status: "Approved",
    },
    {
      _id: 30,
      expanseName: "Compliance Filing Charges",
      department: "Finance",
      expanseType: "Compliance",
      projectedAmount: 10000,
      dueDate: "2024-09-07",
      status: "Approved",
    },

    // October 2024
    {
      _id: 31,
      expanseName: "Internal Financial Audit",
      department: "Finance",
      expanseType: "Audit",
      projectedAmount: 40000,
      dueDate: "2024-10-10",
      status: "Approved",
    },
    {
      _id: 32,
      expanseName: "Finance Team Salaries",
      department: "Finance",
      expanseType: "Payroll",
      projectedAmount: 150000,
      dueDate: "2024-10-31",
      status: "Approved",
    },
    {
      _id: 33,
      expanseName: "ITR Filing Fee",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 10000,
      dueDate: "2024-10-20",
      status: "Approved",
    },
    {
      _id: 34,
      expanseName: "CA Retainership",
      department: "Finance",
      expanseType: "Professional Fees",
      projectedAmount: 25000,
      dueDate: "2024-10-15",
      status: "Pending",
    },
    {
      _id: 35,
      expanseName: "Reimbursement Processing Software",
      department: "Finance",
      expanseType: "Software",
      projectedAmount: 15000,
      dueDate: "2024-10-25",
      status: "Approved",
    },

    // November 2024
    {
      _id: 36,
      expanseName: "Quarterly GST Payment",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 25000,
      dueDate: "2024-11-15",
      status: "Approved",
    },
    {
      _id: 37,
      expanseName: "Finance Team Salaries",
      department: "Finance",
      expanseType: "Payroll",
      projectedAmount: 150000,
      dueDate: "2024-11-30",
      status: "Approved",
    },
    {
      _id: 38,
      expanseName: "Statutory Compliance Filing",
      department: "Finance",
      expanseType: "Compliance",
      projectedAmount: 10000,
      dueDate: "2024-11-10",
      status: "Requested",
    },
    {
      _id: 39,
      expanseName: "Loan EMI Payment",
      department: "Finance",
      expanseType: "Loan",
      projectedAmount: 50000,
      dueDate: "2024-11-05",
      status: "Approved",
    },
    {
      _id: 40,
      expanseName: "Accounting System Maintenance",
      department: "Finance",
      expanseType: "Software",
      projectedAmount: 12000,
      dueDate: "2024-11-22",
      status: "Approved",
    },

    // December 2024
    {
      _id: 41,
      expanseName: "Year-end Audit Planning",
      department: "Finance",
      expanseType: "Audit",
      projectedAmount: 45000,
      dueDate: "2024-12-18",
      status: "Approved",
    },
    {
      _id: 42,
      expanseName: "Finance Team Salaries",
      department: "Finance",
      expanseType: "Payroll",
      projectedAmount: 150000,
      dueDate: "2024-12-31",
      status: "Approved",
    },
    {
      _id: 43,
      expanseName: "TDS Deposit",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 22000,
      dueDate: "2024-12-07",
      status: "Approved",
    },
    {
      _id: 44,
      expanseName: "Consulting Charges - Budget Forecast",
      department: "Finance",
      expanseType: "Consulting",
      projectedAmount: 30000,
      dueDate: "2024-12-12",
      status: "Approved",
    },
    {
      _id: 45,
      expanseName: "Invoice Management Tool",
      department: "Finance",
      expanseType: "Software",
      projectedAmount: 14000,
      dueDate: "2024-12-21",
      status: "Approved",
    },

    // January 2025
    {
      _id: 46,
      expanseName: "Quarterly Tax Payment",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 32000,
      dueDate: "2025-01-15",
      status: "Approved",
    },
    {
      _id: 47,
      expanseName: "Finance Team Salaries",
      department: "Finance",
      expanseType: "Payroll",
      projectedAmount: 150000,
      dueDate: "2025-01-31",
      status: "Approved",
    },
    {
      _id: 48,
      expanseName: "Financial Year Planning Workshop",
      department: "Finance",
      expanseType: "Consulting",
      projectedAmount: 18000,
      dueDate: "2025-01-20",
      status: "Requested",
    },
    {
      _id: 49,
      expanseName: "Banking Transaction Charges",
      department: "Finance",
      expanseType: "Banking",
      projectedAmount: 6000,
      dueDate: "2025-01-10",
      status: "Approved",
    },
    {
      _id: 50,
      expanseName: "Annual Compliance Software",
      department: "Finance",
      expanseType: "Software",
      projectedAmount: 25000,
      dueDate: "2025-01-25",
      status: "Approved",
    },

    // February 2025
    {
      _id: 51,
      expanseName: "Provisional Tax Filing",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 20000,
      dueDate: "2025-02-10",
      status: "Approved",
    },
    {
      _id: 52,
      expanseName: "Finance Team Salaries",
      department: "Finance",
      expanseType: "Payroll",
      projectedAmount: 150000,
      dueDate: "2025-02-28",
      status: "Approved",
    },
    {
      _id: 53,
      expanseName: "Audit Readiness Consulting",
      department: "Finance",
      expanseType: "Consulting",
      projectedAmount: 22000,
      dueDate: "2025-02-15",
      status: "Pending",
    },
    {
      _id: 54,
      expanseName: "Bank Loan EMI",
      department: "Finance",
      expanseType: "Loan",
      projectedAmount: 50000,
      dueDate: "2025-02-05",
      status: "Approved",
    },
    {
      _id: 55,
      expanseName: "Tax Planning Software",
      department: "Finance",
      expanseType: "Software",
      projectedAmount: 12000,
      dueDate: "2025-02-20",
      status: "Approved",
    },

    // March 2025
    {
      _id: 56,
      expanseName: "Final Audit Charges",
      department: "Finance",
      expanseType: "Audit",
      projectedAmount: 50000,
      dueDate: "2025-03-20",
      status: "Approved",
    },
    {
      _id: 57,
      expanseName: "Finance Team Salaries",
      department: "Finance",
      expanseType: "Payroll",
      projectedAmount: 150000,
      dueDate: "2025-03-31",
      status: "Approved",
    },
    {
      _id: 58,
      expanseName: "TDS Filing",
      department: "Finance",
      expanseType: "Compliance",
      projectedAmount: 10000,
      dueDate: "2025-03-07",
      status: "Approved",
    },
    {
      _id: 59,
      expanseName: "March GST Payment",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 25000,
      dueDate: "2025-03-25",
      status: "Approved",
    },
    {
      _id: 60,
      expanseName: "Financial Statement Software",
      department: "Finance",
      expanseType: "Software",
      projectedAmount: 18000,
      dueDate: "2025-03-18",
      status: "Approved",
    },
  ];

  // Data for the chart
  // const utilisedData = [125, 150, 99, 85, 70, 50, 80, 95, 100, 65, 50, 120];
  const utilisedData = [
    135000, 250000, 99000, 85000, 70000, 50000, 80000, 95000, 100000, 75000,
    50000, 120000,
  ];

  const maxBudget = [
    100000, 120000, 100000, 100000, 80000, 60000, 85000, 95000, 100000, 70000,
    60000, 110000,
  ];

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
    colors: ["#54C4A7", "#47755B", "#EB5C45"], // Colors for the series
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
        "Apr-24",
        "May-24",
        "Jun-24",
        "Jul-24",
        "Aug-24",
        "Sep-24",
        "Oct-24",
        "Nov-24",
        "Dec-24",
        "Jan-25",
        "Feb-25",
        "Mar-25",
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

  // Transform data into the required format
  const groupedData = hrFinancex.reduce((acc, item) => {
    const month = dayjs(item.dueDate).format("MMMM YYYY"); // Extracting month and year

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

  // Data array for rendering the Accordion
  const financialData = Object.values(groupedData)
    .map((data, index) => {
      const transoformedRows = data.tableData.rows.map((row, index) => ({
        ...row,
        srNo: index + 1,
        projectedAmount: Number(
          row.projectedAmount.toLocaleString("en-IN").replace(/,/g, "")
        ).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      }));
      const transformedCols = [
        { field: "srNo", headerName: "SR NO", flex: 1 },
        ...data.tableData.columns,
      ];

      return {
        ...data,
        projectedAmount: data.projectedAmount.toLocaleString("en-IN"), // Ensuring two decimal places for total amount
        amount: data.amount.toLocaleString("en-IN"), // Ensuring two decimal places for total amount
        tableData: {
          ...data.tableData,
          rows: transoformedRows,
          columns: transformedCols,
        },
      };
    })
    .sort((a, b) => dayjs(b.latestDueDate).diff(dayjs(a.latestDueDate))); // Sort descending

  const onSubmit = (data) => {
    setOpenModal(false);
    toast.success("Budget Requested succesfully");
    reset();
  };

  // BUDGET NEW START

  const [isReady, setIsReady] = useState(false);

  // const [openModal, setOpenModal] = useState(false);
  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
    queryKey: ["hrFinance"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=6798bacce469e809084e24a1`
        );
        const budgets = response.data.allBudgets;
        return Array.isArray(budgets) ? budgets : [];
      } catch (error) {
        console.error("Error fetching budget:", error);
        return [];
      }
    },
  });

  const budgetBar = useMemo(() => {
    if (isHrLoading || !Array.isArray(hrFinance)) return null;
    return transformBudgetData(hrFinance);
  }, [isHrLoading, hrFinance]);

  useEffect(() => {
    if (!isHrLoading) {
      const timer = setTimeout(() => setIsReady(true), 1000);
      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [isHrLoading]);

  const expenseRawSeries = useMemo(() => {
    return [
      {
        name: "FY 2024-25",
        data: budgetBar?.utilisedBudget || [],
        group: "total",
      },
      {
        name: "FY 2025-26",
        data: [1000054, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        group: "total",
      },
    ];
  }, [budgetBar]);

  const expenseOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },

      stacked: true,
      fontFamily: "Poppins-Regular, Arial, sans-serif",
      events: {
        dataPointSelection: () => {
          navigate("finance/budget");
        },
      },
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
    xaxis: {
      categories: [
        "Apr-24",
        "May-24",
        "Jun-24",
        "Jul-24",
        "Aug-24",
        "Sep-24",
        "Oct-24",
        "Nov-24",
        "Dec-24",
        "Jan-25",
        "Feb-25",
        "Mar-25",
      ],
      title: {
        text: "  ",
      },
    },
    yaxis: {
      // max: 3000000,
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => `${Math.round(val / 1000)}`,
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
      enabled: true,
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
    budgetBar?.utilisedBudget?.reduce((acc, val) => acc + val, 0) || 0;
  const navigate = useNavigate();
  // BUDGET NEW END

  return (
    <div className="flex flex-col gap-8">
      {/* <WidgetSection
        layout={1}
        titleLabel={"FY 2024-25"}
        title={"BUDGET"}
        border>
        <BudgetGraph
          utilisedData={utilisedData}
          maxBudget={maxBudget}
          route={"finance/budget"}
        />
      </WidgetSection> */}
      <WidgetSection
        normalCase
        layout={1}
        border
        padding
        titleLabel={"FY 2024-25"}
        TitleAmount={`INR ${Math.round(totalUtilised).toLocaleString("en-IN")}`}
        title={"BIZ Nest FINANCE DEPARTMENT EXPENSE"}>
        <BarGraph
          data={expenseRawSeries}
          options={expenseOptions}
          departments={["FY 2024-25", "FY 2025-26"]}
        />
      </WidgetSection>

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
            data={"INR 12,000"}
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

      <div className="flex justify-end">
        <PrimaryButton
          title={"Request Budget"}
          padding="px-5 py-2"
          fontSize="text-base"
        />
      </div>

      <AllocatedBudget financialData={financialData} />
      <MuiModal
        title="Request Budget"
        open={openModal}
        onClose={() => setOpenModal(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Expense Name */}
          <Controller
            name="expanseName"
            control={control}
            rules={{ required: "Expense name is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Expense Name"
                fullWidth
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Expense Type */}
          <Controller
            name="expanseType"
            control={control}
            rules={{ required: "Expense type is required" }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth error={!!fieldState.error}>
                <Select {...field} size="small" displayEmpty>
                  <MenuItem value="" disabled>
                    Select Expense Type
                  </MenuItem>
                  <MenuItem value="Internal">Internal</MenuItem>
                  <MenuItem value="External">External</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          {/* Amount */}
          <Controller
            name="projectedAmount"
            control={control}
            rules={{
              required: "Amount is required",
              pattern: {
                value: /^[0-9]+(\.[0-9]{1,2})?$/,
                message: "Enter a valid amount",
              },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Projected Amount"
                fullWidth
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Due Date */}
          <Controller
            name="dueDate"
            control={control}
            rules={{ required: "Due date is required" }}
            render={({ field, fieldState }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  {...field}
                  label="Due Date"
                  format="DD-MM-YYYY"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : null)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message,
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />

          {/* Due Date */}
          <Controller
            name="dueDate"
            control={control}
            rules={{ required: "Due date is required" }}
            render={({ field, fieldState }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  {...field}
                  label="Due Date"
                  format="DD-MM-YYYY"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : null)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message,
                    },
                  }}
                />
              </LocalizationProvider>
            )}
          />
          <div className="flex justify-center items-center">
            {/* Submit Button */}
            <PrimaryButton type={"submit"} title={"Submit"} />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default FinanceBudget;
