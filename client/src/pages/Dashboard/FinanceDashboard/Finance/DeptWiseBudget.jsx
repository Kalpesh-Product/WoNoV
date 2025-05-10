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
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
import BudgetGraph from "../../../../components/graphs/BudgetGraph";
import { useNavigate } from "react-router-dom"; // For programmatic navigation
import { transformBudgetData } from "../../../../utils/transformBudgetData";
import { inrFormat } from "../../../../utils/currencyFormat";
import BarGraph from "../../../../components/graphs/BarGraph";
// import dayjs from "dayjs";

const DeptWiseBudget = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  // const { data: hrFinance = [] } = useQuery({
  //   queryKey: ["hrFinance"],
  //   queryFn: async () => {
  //     try {
  //       const response = await axios.get(
  //         `/api/budget/company-budget?departmentId=6798bab9e469e809084e249e
  //                   `
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
      amount: "35,000",
      dueDate: "2024-04-20",
      status: "Approved",
    },
    {
      _id: 2,
      expanseName: "Software License Renewal",
      department: "Tech",
      expanseType: "Software",
      projectedAmount: 25000,
      amount: "35,000",
      dueDate: "2024-04-15",
      status: "Approved",
    },
    {
      _id: 3,
      expanseName: "Employee Training Program",
      department: "HR",
      expanseType: "Training",
      projectedAmount: 35000,
      amount: "35,000",
      dueDate: "2024-04-10",
      status: "Pending",
    },
    {
      _id: 4,
      expanseName: "Marketing Campaign",
      department: "Sales",
      expanseType: "Marketing",
      projectedAmount: 45000,
      amount: "35,000",
      dueDate: "2024-04-05",
      status: "Approved",
    },
    {
      _id: 5,
      expanseName: "Office Supplies",
      department: "Admin",
      expanseType: "Supplies",
      projectedAmount: 15000,
      amount: "35,000",
      dueDate: "2024-04-25",
      status: "Approved",
    },
    {
      _id: 6,
      expanseName: "Server Maintenance",
      department: "IT",
      expanseType: "Maintenance",
      projectedAmount: 20000,
      amount: "35,000",
      dueDate: "2024-04-18",
      status: "Approved",
    },
    {
      _id: 7,
      expanseName: "Building Repairs",
      department: "Maintenance",
      expanseType: "Facility",
      projectedAmount: 30000,
      amount: "35,000",
      dueDate: "2024-04-30",
      status: "Approved",
    },

    // May 2024
    {
      _id: 8,
      expanseName: "TDS Payment",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 22000,
      amount: "35,000",
      dueDate: "2024-05-15",
      status: "Approved",
    },
    {
      _id: 9,
      expanseName: "Cloud Services Subscription",
      department: "Tech",
      expanseType: "Software",
      projectedAmount: 18000,
      amount: "35,000",
      dueDate: "2024-05-20",
      status: "Approved",
    },
    {
      _id: 10,
      expanseName: "Recruitment Costs",
      department: "HR",
      expanseType: "Hiring",
      projectedAmount: 28000,
      amount: "35,000",
      dueDate: "2024-05-10",
      status: "Approved",
    },
    {
      _id: 11,
      expanseName: "Sales Conference",
      department: "Sales",
      expanseType: "Event",
      projectedAmount: 50000,
      amount: "35,000",
      dueDate: "2024-05-25",
      status: "Pending",
    },
    {
      _id: 12,
      expanseName: "Office Rent",
      department: "Admin",
      expanseType: "Facility",
      projectedAmount: 75000,
      amount: "35,000",
      dueDate: "2024-05-01",
      status: "Approved",
    },
    {
      _id: 13,
      expanseName: "Network Upgrade",
      department: "IT",
      expanseType: "Infrastructure",
      projectedAmount: 35000,
      amount: "35,000",
      dueDate: "2024-05-18",
      status: "Approved",
    },
    {
      _id: 14,
      expanseName: "AC Servicing",
      department: "Maintenance",
      expanseType: "Facility",
      projectedAmount: 15000,
      amount: "35,000",
      dueDate: "2024-05-12",
      status: "Approved",
    },

    // June 2024
    {
      _id: 15,
      expanseName: "GST Payment",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 12000,
      amount: "35,000",
      dueDate: "2024-06-20",
      status: "Pending",
    },
    {
      _id: 16,
      expanseName: "Development Tools",
      department: "Tech",
      expanseType: "Software",
      projectedAmount: 22000,
      amount: "35,000",
      dueDate: "2024-06-10",
      status: "Approved",
    },
    {
      _id: 17,
      expanseName: "Employee Benefits",
      department: "HR",
      expanseType: "Benefits",
      projectedAmount: 45000,
      amount: "35,000",
      dueDate: "2024-06-15",
      status: "Approved",
    },
    {
      _id: 18,
      expanseName: "Customer Gifts",
      department: "Sales",
      expanseType: "Marketing",
      projectedAmount: 18000,
      amount: "35,000",
      dueDate: "2024-06-05",
      status: "Approved",
    },
    {
      _id: 19,
      expanseName: "Office Cleaning",
      department: "Admin",
      expanseType: "Facility",
      projectedAmount: 10000,
      amount: "35,000",
      dueDate: "2024-06-28",
      status: "Approved",
    },
    {
      _id: 20,
      expanseName: "Cybersecurity Tools",
      department: "IT",
      expanseType: "Software",
      projectedAmount: 30000,
      amount: "35,000",
      dueDate: "2024-06-22",
      status: "Approved",
    },
    {
      _id: 21,
      expanseName: "Elevator Maintenance",
      department: "Maintenance",
      expanseType: "Facility",
      projectedAmount: 25000,
      amount: "35,000",
      dueDate: "2024-06-18",
      status: "Approved",
    },

    // July 2024
    {
      _id: 22,
      expanseName: "Advance Tax",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 35000,
      amount: "35,000",
      dueDate: "2024-07-15",
      status: "Approved",
    },
    {
      _id: 23,
      expanseName: "New Laptops",
      department: "Tech",
      expanseType: "Hardware",
      projectedAmount: 150000,
      amount: "35,000",
      dueDate: "2024-07-10",
      status: "Approved",
    },
    {
      _id: 24,
      expanseName: "Team Building Event",
      department: "HR",
      expanseType: "Event",
      projectedAmount: 40000,
      amount: "35,000",
      dueDate: "2024-07-20",
      status: "Pending",
    },
    {
      _id: 25,
      expanseName: "Trade Show Booth",
      department: "Sales",
      expanseType: "Marketing",
      projectedAmount: 75000,
      amount: "35,000",
      dueDate: "2024-07-05",
      status: "Approved",
    },
    {
      _id: 26,
      expanseName: "Office Furniture",
      department: "Admin",
      expanseType: "Furniture",
      projectedAmount: 50000,
      amount: "35,000",
      dueDate: "2024-07-25",
      status: "Approved",
    },
    {
      _id: 27,
      expanseName: "Data Backup Solution",
      department: "IT",
      expanseType: "Software",
      projectedAmount: 25000,
      amount: "35,000",
      dueDate: "2024-07-18",
      status: "Approved",
    },
    {
      _id: 28,
      expanseName: "Plumbing Repairs",
      department: "Maintenance",
      expanseType: "Facility",
      projectedAmount: 18000,
      amount: "35,000",
      dueDate: "2024-07-12",
      status: "Approved",
    },

    // August 2024
    {
      _id: 29,
      expanseName: "Professional Tax",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 5000,
      amount: "35,000",
      dueDate: "2024-08-25",
      status: "Approved",
    },
    {
      _id: 30,
      expanseName: "API Subscriptions",
      department: "Tech",
      expanseType: "Software",
      projectedAmount: 15000,
      amount: "35,000",
      dueDate: "2024-08-15",
      status: "Approved",
    },
    {
      _id: 31,
      expanseName: "Performance Bonuses",
      department: "HR",
      expanseType: "Benefits",
      projectedAmount: 80000,
      amount: "35,000",
      dueDate: "2024-08-10",
      status: "Approved",
    },
    {
      _id: 32,
      expanseName: "CRM Software",
      department: "Sales",
      expanseType: "Software",
      projectedAmount: 35000,
      amount: "35,000",
      dueDate: "2024-08-20",
      status: "Approved",
    },
    {
      _id: 33,
      expanseName: "Office Snacks",
      department: "Admin",
      expanseType: "Supplies",
      projectedAmount: 12000,
      amount: "35,000",
      dueDate: "2024-08-05",
      status: "Approved",
    },
    {
      _id: 34,
      expanseName: "Firewall Upgrade",
      department: "IT",
      expanseType: "Security",
      projectedAmount: 28000,
      amount: "35,000",
      dueDate: "2024-08-18",
      status: "Approved",
    },
    {
      _id: 35,
      expanseName: "Parking Lot Repairs",
      department: "Maintenance",
      expanseType: "Facility",
      projectedAmount: 22000,
      amount: "35,000",
      dueDate: "2024-08-22",
      status: "Pending",
    },

    // September 2024
    {
      _id: 36,
      expanseName: "TDS Filing",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 10000,
      amount: "35,000",
      dueDate: "2024-09-07",
      status: "Approved",
    },
    {
      _id: 37,
      expanseName: "Mobile App Development",
      department: "Tech",
      expanseType: "Development",
      projectedAmount: 120000,
      amount: "35,000",
      dueDate: "2024-09-20",
      status: "Approved",
    },
    {
      _id: 38,
      expanseName: "Health Insurance",
      department: "HR",
      expanseType: "Benefits",
      projectedAmount: 60000,
      amount: "35,000",
      dueDate: "2024-09-15",
      status: "Approved",
    },
    {
      _id: 39,
      expanseName: "Sales Training",
      department: "Sales",
      expanseType: "Training",
      projectedAmount: 35000,
      amount: "35,000",
      dueDate: "2024-09-10",
      status: "Approved",
    },
    {
      _id: 40,
      expanseName: "Office Internet",
      department: "Admin",
      expanseType: "Utility",
      projectedAmount: 15000,
      amount: "35,000",
      dueDate: "2024-09-05",
      status: "Approved",
    },
    {
      _id: 41,
      expanseName: "Server Replacement",
      department: "IT",
      expanseType: "Hardware",
      projectedAmount: 90000,
      amount: "35,000",
      dueDate: "2024-09-25",
      status: "Pending",
    },
    {
      _id: 42,
      expanseName: "HVAC Maintenance",
      department: "Maintenance",
      expanseType: "Facility",
      projectedAmount: 30000,
      amount: "35,000",
      dueDate: "2024-09-18",
      status: "Approved",
    },

    // October 2024
    {
      _id: 43,
      expanseName: "Income Tax Filing",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 28000,
      amount: "35,000",
      dueDate: "2024-10-10",
      status: "Approved",
    },
    {
      _id: 44,
      expanseName: "AI Tools Subscription",
      department: "Tech",
      expanseType: "Software",
      projectedAmount: 35000,
      amount: "35,000",
      dueDate: "2024-10-15",
      status: "Approved",
    },
    {
      _id: 45,
      expanseName: "Employee Recognition",
      department: "HR",
      expanseType: "Event",
      projectedAmount: 25000,
      amount: "35,000",
      dueDate: "2024-10-20",
      status: "Approved",
    },
    {
      _id: 46,
      expanseName: "Lead Generation Tools",
      department: "Sales",
      expanseType: "Software",
      projectedAmount: 22000,
      amount: "35,000",
      dueDate: "2024-10-05",
      status: "Approved",
    },
    {
      _id: 47,
      expanseName: "Office Electricity",
      department: "Admin",
      expanseType: "Utility",
      projectedAmount: 18000,
      amount: "35,000",
      dueDate: "2024-10-25",
      status: "Approved",
    },
    {
      _id: 48,
      expanseName: "VPN Subscription",
      department: "IT",
      expanseType: "Software",
      projectedAmount: 12000,
      amount: "35,000",
      dueDate: "2024-10-18",
      status: "Approved",
    },
    {
      _id: 49,
      expanseName: "Window Cleaning",
      department: "Maintenance",
      expanseType: "Facility",
      projectedAmount: 15000,
      amount: "35,000",
      dueDate: "2024-10-12",
      status: "Approved",
    },

    // November 2024
    {
      _id: 50,
      expanseName: "GST Payment",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 25000,
      amount: "35,000",
      dueDate: "2024-11-15",
      status: "Approved",
    },
    {
      _id: 51,
      expanseName: "Code Repository Subscription",
      department: "Tech",
      expanseType: "Software",
      projectedAmount: 18000,
      amount: "35,000",
      dueDate: "2024-11-20",
      status: "Approved",
    },
    {
      _id: 52,
      expanseName: "HR Software",
      department: "HR",
      expanseType: "Software",
      projectedAmount: 30000,
      amount: "35,000",
      dueDate: "2024-11-10",
      status: "Approved",
    },
    {
      _id: 53,
      expanseName: "Customer Appreciation Event",
      department: "Sales",
      expanseType: "Event",
      projectedAmount: 45000,
      amount: "35,000",
      dueDate: "2024-11-25",
      status: "Pending",
    },
    {
      _id: 54,
      expanseName: "Office Water Supply",
      department: "Admin",
      expanseType: "Utility",
      projectedAmount: 8000,
      amount: "35,000",
      dueDate: "2024-11-05",
      status: "Approved",
    },
    {
      _id: 55,
      expanseName: "IT Support Contract",
      department: "IT",
      expanseType: "Service",
      projectedAmount: 40000,
      amount: "35,000",
      dueDate: "2024-11-18",
      status: "Approved",
    },
    {
      _id: 56,
      expanseName: "Fire Safety Equipment",
      department: "Maintenance",
      expanseType: "Facility",
      projectedAmount: 25000,
      amount: "35,000",
      dueDate: "2024-11-12",
      status: "Approved",
    },

    // December 2024
    {
      _id: 57,
      expanseName: "Year-end Tax Planning",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 30000,
      amount: "35,000",
      dueDate: "2024-12-12",
      status: "Approved",
    },
    {
      _id: 58,
      expanseName: "DevOps Tools",
      department: "Tech",
      expanseType: "Software",
      projectedAmount: 28000,
      amount: "35,000",
      dueDate: "2024-12-15",
      status: "Approved",
    },
    {
      _id: 59,
      expanseName: "Year-end Party",
      department: "HR",
      expanseType: "Event",
      projectedAmount: 60000,
      amount: "35,000",
      dueDate: "2024-12-20",
      status: "Approved",
    },
    {
      _id: 60,
      expanseName: "Sales Analytics Tool",
      department: "Sales",
      expanseType: "Software",
      projectedAmount: 35000,
      amount: "35,000",
      dueDate: "2024-12-10",
      status: "Approved",
    },
    {
      _id: 61,
      expanseName: "Office Decorations",
      department: "Admin",
      expanseType: "Supplies",
      projectedAmount: 15000,
      amount: "35,000",
      dueDate: "2024-12-05",
      status: "Approved",
    },
    {
      _id: 62,
      expanseName: "Database License",
      department: "IT",
      expanseType: "Software",
      projectedAmount: 45000,
      amount: "35,000",
      dueDate: "2024-12-18",
      status: "Approved",
    },
    {
      _id: 63,
      expanseName: "Generator Maintenance",
      department: "Maintenance",
      expanseType: "Facility",
      projectedAmount: 20000,
      amount: "35,000",
      dueDate: "2024-12-22",
      status: "Approved",
    },

    // January 2025
    {
      _id: 64,
      expanseName: "Provisional Tax",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 32000,
      amount: "35,000",
      dueDate: "2025-01-15",
      status: "Approved",
    },
    {
      _id: 65,
      expanseName: "UI/UX Tools",
      department: "Tech",
      expanseType: "Software",
      projectedAmount: 22000,
      amount: "35,000",
      dueDate: "2025-01-20",
      status: "Approved",
    },
    {
      _id: 66,
      expanseName: "New Hire Onboarding",
      department: "HR",
      expanseType: "Training",
      projectedAmount: 25000,
      amount: "35,000",
      dueDate: "2025-01-10",
      status: "Approved",
    },
    {
      _id: 67,
      expanseName: "Sales Kickoff Meeting",
      department: "Sales",
      expanseType: "Event",
      projectedAmount: 55000,
      amount: "35,000",
      dueDate: "2025-01-25",
      status: "Pending",
    },
    {
      _id: 68,
      expanseName: "Office Printer Lease",
      department: "Admin",
      expanseType: "Equipment",
      projectedAmount: 12000,
      amount: "35,000",
      dueDate: "2025-01-05",
      status: "Approved",
    },
    {
      _id: 69,
      expanseName: "Email Hosting",
      department: "IT",
      expanseType: "Software",
      projectedAmount: 18000,
      amount: "35,000",
      dueDate: "2025-01-18",
      status: "Approved",
    },
    {
      _id: 70,
      expanseName: "Pest Control",
      department: "Maintenance",
      expanseType: "Facility",
      projectedAmount: 15000,
      amount: "35,000",
      dueDate: "2025-01-12",
      status: "Approved",
    },

    // February 2025
    {
      _id: 71,
      expanseName: "TDS Deposit",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 22000,
      amount: "35,000",
      dueDate: "2025-02-07",
      status: "Approved",
    },
    {
      _id: 72,
      expanseName: "Testing Tools",
      department: "Tech",
      expanseType: "Software",
      projectedAmount: 25000,
      amount: "35,000",
      dueDate: "2025-02-15",
      status: "Approved",
    },
    {
      _id: 73,
      expanseName: "Leadership Training",
      department: "HR",
      expanseType: "Training",
      projectedAmount: 40000,
      amount: "35,000",
      dueDate: "2025-02-20",
      status: "Approved",
    },
    {
      _id: 74,
      expanseName: "Customer Survey Tool",
      department: "Sales",
      expanseType: "Software",
      projectedAmount: 18000,
      amount: "35,000",
      dueDate: "2025-02-10",
      status: "Approved",
    },
    {
      _id: 75,
      expanseName: "Office Security System",
      department: "Admin",
      expanseType: "Security",
      projectedAmount: 30000,
      amount: "35,000",
      dueDate: "2025-02-25",
      status: "Approved",
    },
    {
      _id: 76,
      expanseName: "Backup Storage",
      department: "IT",
      expanseType: "Hardware",
      projectedAmount: 35000,
      amount: "35,000",
      dueDate: "2025-02-18",
      status: "Approved",
    },
    {
      _id: 77,
      expanseName: "Landscaping",
      department: "Maintenance",
      expanseType: "Facility",
      projectedAmount: 20000,
      amount: "35,000",
      dueDate: "2025-02-12",
      status: "Approved",
    },

    // March 2025
    {
      _id: 78,
      expanseName: "Final Tax Payment",
      department: "Finance",
      expanseType: "Tax",
      projectedAmount: 25000,
      amount: "35,000",
      dueDate: "2025-03-25",
      status: "Approved",
    },
    {
      _id: 79,
      expanseName: "Project Management Software",
      department: "Tech",
      expanseType: "Software",
      projectedAmount: 30000,
      amount: "35,000",
      dueDate: "2025-03-15",
      status: "Approved",
    },
    {
      _id: 80,
      expanseName: "Employee Engagement Survey",
      department: "HR",
      expanseType: "Consulting",
      projectedAmount: 25000,
      amount: "35,000",
      dueDate: "2025-03-20",
      status: "Approved",
    },
    {
      _id: 81,
      expanseName: "Sales Commission Payout",
      department: "Sales",
      expanseType: "Commission",
      projectedAmount: 80000,
      amount: "35,000",
      dueDate: "2025-03-10",
      status: "Approved",
    },
    {
      _id: 82,
      expanseName: "Office Chairs",
      department: "Admin",
      expanseType: "Furniture",
      projectedAmount: 40000,
      amount: "35,000",
      dueDate: "2025-03-05",
      status: "Pending",
    },
    {
      _id: 83,
      expanseName: "Network Security Audit",
      department: "IT",
      expanseType: "Security",
      projectedAmount: 35000,
      amount: "35,000",
      dueDate: "2025-03-18",
      status: "Approved",
    },
    {
      _id: 84,
      expanseName: "Building Painting",
      department: "Maintenance",
      expanseType: "Facility",
      projectedAmount: 45000,
      amount: "35,000",
      dueDate: "2025-03-22",
      status: "Approved",
    },
  ];

  // Data for the chart
  // const utilisedData = [125, 150, 99, 85, 70, 50, 80, 95, 100, 65, 50, 120];

  const utilisedData = [
    101250, 215000, 91080, 63750, 56700, 46500, 73600, 74100, 86000, 65250,
    38500, 106800,
  ];
  const maxBudget = [
    78000, 109200, 80000, 80000, 62400, 51600, 72250, 79800, 78000, 63000,
    51000, 99000,
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

  // // Data array for rendering the Accordion
  // const groupedData = hrFinance.reduce((acc, item) => {
  //   const month = dayjs(item.dueDate).format("MMMM YYYY"); // Extracting month and year

  //   if (!acc[month]) {
  //     acc[month] = {
  //       month,
  //       latestDueDate: item.dueDate, // Store latest due date for sorting
  //       projectedAmount: 0,
  //       amount: 0,
  //       tableData: {
  //         rows: [],
  //         columns: [
  //           { field: "department", headerName: "Department", flex: 1 },
  //           { field: "amount", headerName: "Amount", flex: 1 },
  //           // { field: "expanseName", headerName: "Expense Name", flex: 1 },
  //           // // { field: "department", headerName: "Department", flex: 200 },
  //           // { field: "expanseType", headerName: "Expense Type", flex: 1 },
  //           // { field: "projectedAmount", headerName: "Amount", flex: 1 },
  //           // { field: "dueDate", headerName: "Due Date", flex: 1 },
  //           // { field: "status", headerName: "Status", flex: 1 },
  //         ],
  //       },
  //     };
  //   }

  //   acc[month].projectedAmount += item.projectedAmount; // Summing the total projected amount per month
  //   acc[month].amount += item.projectedAmount; // Summing the total amount per month
  //   acc[month].tableData.rows.push({
  //     id: item._id,
  //     expanseName: item.expanseName,
  //     department: item.department,
  //     expanseType: item.expanseType,
  //     amount: item.amount,
  //     projectedAmount: item.projectedAmount.toFixed(2), // Ensuring two decimal places
  //     dueDate: dayjs(item.dueDate).format("DD-MM-YYYY"),
  //     status: item.status,
  //   });

  //   return acc;
  // }, {});

  // Your groupedData logic
  const groupedData = hrFinancex.reduce((acc, item) => {
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
                // const navigate = useNavigate(); // Hook for navigation
                const handleClick = () => {
                  console.log("redirect");
                  navigate(
                    `/app/dashboard/finance-dashboard/finance/dept-wise-budget/${params.value}`
                  ); // Redirect to new page with department as param
                };
                return (
                  <span
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={handleClick}>
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
    acc[month].amount += item.projectedAmount;
    acc[month].tableData.rows.push({
      id: item._id,
      expanseName: item.expanseName,
      department: item.department,
      expanseType: item.expanseType,
      amount: item.amount,
      projectedAmount: item.projectedAmount.toFixed(2),
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
    .sort((a, b) => dayjs(b.latestDueDate).diff(dayjs(a.latestDueDate)));

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
  // const navigate = useNavigate();
  // BUDGET NEW END

  return (
    <div className="flex flex-col gap-8">
      {/* <WidgetSection
        layout={1}
        titleLabel={"FY 2024-25"}
        title={"DEPARTMENT BUDGET"}
        border>
        <BudgetGraph
          utilisedData={utilisedData}
          maxBudget={maxBudget}
        />
      </WidgetSection> */}
      <WidgetSection
        normalCase
        layout={1}
        border
        padding
        titleLabel={"FY 2024-25"}
        TitleAmount={`INR ${Math.round(totalUtilised).toLocaleString("en-IN")}`}
        title={"BIZ Nest DEPARTMENT WISE EXPENSE"}>
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
      {/* <div className="flex justify-end">
        <PrimaryButton
          title={"Request Budget"}
          padding="px-5 py-2"
          fontSize="text-base"
        />
      </div> */}
      <AllocatedBudget financialData={financialData} />
    </div>
  );
};

export default DeptWiseBudget;
