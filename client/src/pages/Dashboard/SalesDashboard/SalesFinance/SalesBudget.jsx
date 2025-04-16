import React from "react";
import LayerBarGraph from "../../../../components/graphs/LayerBarGraph";
import dayjs from "dayjs";
import WidgetSection from "../../../../components/WidgetSection";
import PrimaryButton from "../../../../components/PrimaryButton";
import DataCard from "../../../../components/DataCard";
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";
import BudgetGraph from "../../../../components/graphs/BudgetGraph";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Controller } from "react-hook-form";
import { TextField } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import MuiModal from "../../../../components/MuiModal";
import { FormControl, Select, MenuItem } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const SalesBudget = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      expanseName: "",
      expanseType: "",
      amount: "",
      dueDate: null,
    },
  });

  const onSubmit = (data) => {
    setOpenModal(false);
    toast.success("Budget requested successfully");
    reset();
  };

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
  const utilisedData = [
    7500000, 8200000, 6900000, 8800000, 9200000, 6100000, 7300000, 8100000,
    7700000, 9400000, 6600000, 8500000,
  ];

  const maxBudget = [
    8000000, 9000000, 7000000, 9500000, 8800000, 6300000, 7900000, 8700000,
    7600000, 9900000, 7100000, 8900000,
  ];

  ;


  const dummyData = [
    {
      "_id": "67c12be4a9f97d94bd2b1902",
      "expanseName": "Client Onboarding Seminar",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5200,
      "dueDate": "2024-04-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1903",
      "expanseName": "Sales Strategy Bootcamp",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 6000,
      "dueDate": "2024-04-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1904",
      "expanseName": "Quarterly Sales Meetup",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4100,
      "dueDate": "2024-04-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1905",
      "expanseName": "Advanced Negotiation Skills",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4800,
      "dueDate": "2024-04-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1906",
      "expanseName": "CRM System Training",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5300,
      "dueDate": "2024-04-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1907",
      "expanseName": "Sales Pitch Refinement Session",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4950,
      "dueDate": "2024-04-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1901",
      "expanseName": "Sales Software",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4500,
      "dueDate": "2024-04-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1903",
      "expanseName": "Social Media Ads",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4500,
      "dueDate": "2024-05-20T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1904",
      "expanseName": "Email Marketing Tools",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 1200,
      "dueDate": "2024-05-20T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1905",
      "expanseName": "SEO Consultant",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 5000,
      "dueDate": "2024-05-20T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1906",
      "expanseName": "Landing Page Development",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 2000,
      "dueDate": "2024-05-20T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1907",
      "expanseName": "Salesforce CRM Subscription",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 3500,
      "dueDate": "2024-05-20T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1908",
      "expanseName": "Affiliate Program Setup",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 2700,
      "dueDate": "2024-05-20T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1909",
      "expanseName": "Video Ad Production",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 6200,
      "dueDate": "2024-05-20T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },

    {
      "_id": "67c12be4a9f97d94bd2b1910",
      "expanseName": "Sales Team Training Program",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 2500,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1911",
      "expanseName": "Internal Networking Tools",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 1800,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1912",
      "expanseName": "Team Productivity Software",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 950,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1913",
      "expanseName": "Sales Enablement Toolkit",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 2100,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1914",
      "expanseName": "Intranet Portal Development",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3000,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1915",
      "expanseName": "Internal Communication Upgrade",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 1650,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1916",
      "expanseName": "Sales Analytics Dashboard",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 2750,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b192g",
      "expanseName": "Team Building Activity",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e61",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4500.00,
      "dueDate": "2024-07-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b192h",
      "expanseName": "Sales Conference",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e61",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 8900.00,
      "dueDate": "2024-07-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b192i",
      "expanseName": "Client Gifts",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e61",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 3000.00,
      "dueDate": "2024-07-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b192j",
      "expanseName": "Lead Generation Campaign",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e61",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 6700.00,
      "dueDate": "2024-07-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b192k",
      "expanseName": "Salesforce Training",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e61",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 5100.00,
      "dueDate": "2024-07-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b192l",
      "expanseName": "Market Research",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e61",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4200.00,
      "dueDate": "2024-07-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b192m",
      "expanseName": "Client Onboarding",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e61",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 5600.00,
      "dueDate": "2024-07-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1931",
      "expanseName": "Sales Team Accommodation",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e62",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 7600.00,
      "dueDate": "2024-08-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1932",
      "expanseName": "In-House Sales Training",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e62",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5000.00,
      "dueDate": "2024-08-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1933",
      "expanseName": "Internal Sales Strategy Meet",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e62",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 6450.50,
      "dueDate": "2024-08-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1934",
      "expanseName": "Sales Planning Resources",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e62",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5900.25,
      "dueDate": "2024-08-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1935",
      "expanseName": "Quarterly Sales Review",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e62",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 7150.00,
      "dueDate": "2024-08-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1936",
      "expanseName": "Sales Process Audit",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e62",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4725.00,
      "dueDate": "2024-08-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1937",
      "expanseName": "CRM Tools Upgrade",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e62",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 6880.80,
      "dueDate": "2024-08-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1931",
      "expanseName": "Product Launch Marketing",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e63",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 12650.00,
      "dueDate": "2024-09-01T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": true
    },
    {
      "_id": "67c12be4a9f97d94bd2b1905",
      "expanseName": "Client Networking Dinner",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e64",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4200,
      "dueDate": "2024-10-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1906",
      "expanseName": "Annual Sales Summit Venue",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e64",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 12500,
      "dueDate": "2024-10-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1907",
      "expanseName": "Product Launch Campaign",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e64",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 8300,
      "dueDate": "2024-10-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1908",
      "expanseName": "Regional Partner Meet",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e64",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 6700,
      "dueDate": "2024-10-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1909",
      "expanseName": "Sales Training Workshop",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e64",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 3900,
      "dueDate": "2024-10-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b190a",
      "expanseName": "Lead Generation Campaign",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e64",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 5600,
      "dueDate": "2024-10-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b190b",
      "expanseName": "Customer Loyalty Program",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e64",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 7100,
      "dueDate": "2024-10-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b190c",
      "expanseName": "Winter Campaign Ads",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 5200,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b190d",
      "expanseName": "Social Media Boosts",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 3050,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b190e",
      "expanseName": "New Year Giveaway Merchandise",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4800,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b190f",
      "expanseName": "Retail Promo Material Printing",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 3700,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1910",
      "expanseName": "End-of-Year Buyer Incentives",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 6100,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1911",
      "expanseName": "Salesforce CRM Add-ons",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4500,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1912",
      "expanseName": "Seasonal Print Ads Campaign",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 5300,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1906",
      "expanseName": "Corporate Gifting",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e66",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 2200,
      "dueDate": "2024-12-18T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1907",
      "expanseName": "New Year Ad Campaign",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e67",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 6700,
      "dueDate": "2025-01-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": true
    },
    {
      "_id": "67c12be4a9f97d94bd2b1908",
      "expanseName": "Sales Data Analytics Tools",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3100,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1909",
      "expanseName": "Q4 Incentive Budget",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5000,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    }
  ];


  const groupedData = dummyData.reduce((acc, item) => {
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <WidgetSection
          layout={1}
          title={"Budget v/s Achievements"}
          border
          titleLabel={"FY 2024-25"}>
          <BudgetGraph maxBudget={maxBudget} utilisedData={utilisedData} />
        </WidgetSection>
      </div>
      <WidgetSection layout={3} padding>
        <DataCard
          data={"INR " + inrFormat("7500000")}
          title={"Projected"}
          description={`Current Month: ${new Date().toLocaleString("default", {
            month: "short",
          })}-24`}
        />
        <DataCard
          data={"INR " + inrFormat("6200000")}
          title={"Actual"}
          description={`Current Month: ${new Date().toLocaleString("default", {
            month: "short",
          })}-24`}
        />
        <DataCard
          data={"INR " + inrFormat("89000")}
          title={"Requested"}
          description={`Current Month: ${new Date().toLocaleString("default", {
            month: "short",
          })}-24`}
        />
      </WidgetSection>

      <div className="flex justify-end">
        <PrimaryButton
          title={"Request Budget"}
          padding="px-5 py-2"
          fontSize="text-base"
          handleSubmit={() => setOpenModal(true)} // ✅ triggers modal
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
            name="amount"
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
                label="Amount"
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
          <div className="flex justify-center items-center">
            {/* Submit Button */}
            <PrimaryButton type={"submit"} title={"Submit"} />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default SalesBudget;
