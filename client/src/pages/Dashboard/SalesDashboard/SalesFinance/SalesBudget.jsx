import React, { Suspense, useEffect, useMemo, useState } from "react";
import WidgetSection from "../../../../components/WidgetSection";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  Skeleton,
  Box,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PrimaryButton from "../../../../components/PrimaryButton";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import DataCard from "../../../../components/DataCard";
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
import { toast } from "sonner";
import BudgetGraph from "../../../../components/graphs/BudgetGraph";
import { inrFormat } from "../../../../utils/currencyFormat";
import { useNavigate } from "react-router-dom";
import BarGraph from "../../../../components/graphs/BarGraph";
import { transformBudgetData } from "../../../../utils/transformBudgetData";

const SalesBudget = () => {
  const axios = useAxiosPrivate();
  const [isReady, setIsReady] = useState(false);

  const [openModal, setOpenModal] = useState(false);
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
      "_id": "67c12be4a9f97d94bd2b1907",
      "expanseName": "Team Outing",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e66",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 1500,
      "dueDate": "2024-12-18T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1908",
      "expanseName": "Client Meetings",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e66",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3200,
      "dueDate": "2024-12-18T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1909",
      "expanseName": "Sales Training",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e66",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 1800,
      "dueDate": "2024-12-18T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1910",
      "expanseName": "Event Sponsorship",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e66",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4500,
      "dueDate": "2024-12-18T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1911",
      "expanseName": "Product Samples",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e66",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 2700,
      "dueDate": "2024-12-18T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1912",
      "expanseName": "Promotional Campaigns",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e66",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5200,
      "dueDate": "2024-12-18T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1913",
      "expanseName": "Marketing Materials",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e66",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3900,
      "dueDate": "2024-12-18T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1914",
      "expanseName": "Holiday Discounts Promo",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e67",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 7100,
      "dueDate": "2025-01-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": true
    },
    {
      "_id": "67c12be4a9f97d94bd2b1915",
      "expanseName": "Billboard Advertising",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e67",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 8200,
      "dueDate": "2025-01-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": true
    },
    {
      "_id": "67c12be4a9f97d94bd2b1916",
      "expanseName": "Radio Spot Booking",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e67",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4900,
      "dueDate": "2025-01-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": true
    },
    {
      "_id": "67c12be4a9f97d94bd2b1917",
      "expanseName": "Influencer Collaborations",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e67",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 7300,
      "dueDate": "2025-01-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": true
    },
    {
      "_id": "67c12be4a9f97d94bd2b1918",
      "expanseName": "TV Commercials",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e67",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 9200,
      "dueDate": "2025-01-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": true
    },
    {
      "_id": "67c12be4a9f97d94bd2b1919",
      "expanseName": "Online Ads Retargeting",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e67",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 6100,
      "dueDate": "2025-01-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": true
    },
    {
      "_id": "67c12be4a9f97d94bd2b1920",
      "expanseName": "Magazine Spread",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e67",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 5600,
      "dueDate": "2025-01-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": true
    },
    {
      "_id": "67c12be4a9f97d94bd2b1921",
      "expanseName": "CRM Subscription",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 2900,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1922",
      "expanseName": "Lead Generation Tools",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3400,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1923",
      "expanseName": "Sales Forecasting Software",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3600,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1924",
      "expanseName": "Customer Insights Platform",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3300,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1925",
      "expanseName": "Sales Dashboard Integration",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 2800,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1926",
      "expanseName": "Data Visualization Tools",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3000,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1927",
      "expanseName": "Territory Mapping Software",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3500,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1928",
      "expanseName": "Quarterly Bonus Payouts",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5400,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1929",
      "expanseName": "Sales Contest Rewards",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4700,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1930",
      "expanseName": "Top Performer Awards",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5200,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1931",
      "expanseName": "Incentive Trip Budget",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5800,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1932",
      "expanseName": "Employee Recognition Gifts",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4900,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1933",
      "expanseName": "Q4 Commission Reserve",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5300,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1934",
      "expanseName": "Referral Incentive Fund",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5100,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    }
  ];


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
        formatter: (val) => `${Math.round(val / 100000)}`,
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
                <div><strong>Sales Expense:</strong></div>
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
    toast.success("Budget Requested succesfully");
    reset();
  };

  // Transform data into the required format
  const groupedData = Array.isArray(dummyData)
    ? dummyData?.reduce((acc, item) => {
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
                { field: "expanseType", headerName: "Expense Type", flex: 1 },
                { field: "projectedAmount", headerName: "Projected", flex: 1 },
                { field: "actualAmount", headerName: "Actual", flex: 1 }, // ✅ add this
                { field: "dueDate", headerName: "Due Date", flex: 1 },
                { field: "status", headerName: "Status", flex: 1 },
              ],
            },
          };
        }

        acc[month].projectedAmount += item?.projectedAmount; // Summing the total projected amount per month
        acc[month].amount += item?.actualAmount; // Summing the total amount per month
        acc[month].tableData.rows.push({
          id: item._id,
          expanseName: item?.expanseName,
          department: item?.department,
          expanseType: item?.expanseType,
          projectedAmount: Number(item?.projectedAmount).toFixed(2),
          actualAmount: Number(item?.actualAmount || 0).toFixed(2), // ✅ Add this
          dueDate: dayjs(item.dueDate).format("DD-MM-YYYY"),
          status: item.status,
        });

        return acc;
      }, {})
    : [];

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
        amount: Number(data?.amount || 0).toLocaleString("en-IN"),
        expanseType: data?.expanseType,
        tableData: {
          ...data.tableData,
          rows: transoformedRows,
          columns: transformedCols,
        },
      };
    })
    .sort((a, b) => dayjs(b.latestDueDate).diff(dayjs(a.latestDueDate))); // Sort descending
    console.log("financeial Data", financialData);

  // ---------------------------------------------------------------------//
  if (!isReady) {
    return <Skeleton height="100vh" width="100%" />;
  } else {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <Suspense
            fallback={
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Simulating chart skeleton */}
                <Skeleton variant="text" width={200} height={30} />
                <Skeleton variant="rectangular" width="100%" height={300} />
              </Box>
            }
          >
            <WidgetSection
              normalCase
              layout={1}
              border
              padding
              titleLabel={"FY 2024-25"}
              TitleAmount={`INR ${Math.round(totalUtilised).toLocaleString(
                "en-IN"
              )}`}
              title={"BIZ Nest HR DEPARTMENT EXPENSE"}
            >
              <BarGraph
                data={expenseRawSeries}
                options={expenseOptions}
                departments={["FY 2024-25", "FY 2025-26"]}
              />
            </WidgetSection>
          </Suspense>
        </div>
        <div>
          <WidgetSection layout={3} padding>
            <DataCard
              data={"INR " + inrFormat("2000000")}
              title={"Projected"}
              route={"/app/dashboard/hr-dashboard/finance/budget"}
              description={`Current Month: ${new Date().toLocaleString(
                "default",
                {
                  month: "short",
                }
              )}-25`}
            />
            <DataCard
              data={"INR " + inrFormat("150000")}
              title={"Actual"}
              route={"/app/dashboard/hr-dashboard/finance/budget"}
              description={`Current Month: ${new Date().toLocaleString(
                "default",
                {
                  month: "short",
                }
              )}-25`}
            />
            <DataCard
              data={"INR " + inrFormat(12000)}
              title={"Requested"}
              route={"/app/dashboard/hr-dashboard/finance/budget"}
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
            handleSubmit={() => setOpenModal(true)}
          />
        </div>

        {!isHrLoading ? (
          <AllocatedBudget
            financialData={financialData}
            isLoading={isHrLoading}
          />
        ) : (
          <Skeleton height={600} width={"100%"} />
        )}

        <MuiModal
          title="Request Budget"
          open={openModal}
          onClose={() => setOpenModal(false)}
        >
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
  }
};

export default SalesBudget;
