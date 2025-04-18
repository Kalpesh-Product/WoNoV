import React, { useState } from "react";
import LayerBarGraph from "../../../../components/graphs/LayerBarGraph";
import WidgetSection from "../../../../components/WidgetSection";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import PrimaryButton from "../../../../components/PrimaryButton";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import useAuth from "../../../../hooks/useAuth";
import DataCard from "../../../../components/DataCard";
import { MdTrendingUp } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
import BudgetGraph from "../../../../components/graphs/BudgetGraph";

const HrBudget = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  // const { data: hrFinance = [] } = useQuery({
  //   queryKey: ["hrFinance"],
  //   queryFn: async () => {
  //     try {
  //       const response = await axios.get(
  //         `/api/budget/company-budget?departmentId=6798bab9e469e809084e249e
  //         `
  //       );
  //       return response.data.allBudgets;
  //     } catch (error) {
  //       throw new Error("Error fetching data");
  //     }
  //   },
  // });

  const adminBudget = [
  {
    "_id": "67c12be4a9f97d94bd2b1902",
    "expanseName": "Office Supplies Restocking",
    "department": { "_id": "6798bae6e469e809084e24a4", "name": "Admin" },
    "unit": "67ed1b4f3ea0f84ec3068e51",
    "company": "6799f0cd6a01edbe1bc3fcea",
    "expanseType": "Internal",
    "projectedAmount": 4300,
    "dueDate": "2024-04-10T18:30:00.000Z",
    "status": "Approved",
    "isExtraBudget": false
  },
  {
    "_id": "67c12be4a9f97d94bd2b1903",
    "expanseName": "Facility Maintenance",
    "department": { "_id": "6798bae6e469e809084e24a4", "name": "Admin" },
    "unit": "67ed1b4f3ea0f84ec3068e51",
    "company": "6799f0cd6a01edbe1bc3fcea",
    "expanseType": "Internal",
    "projectedAmount": 5700,
    "dueDate": "2024-04-10T18:30:00.000Z",
    "status": "Approved",
    "isExtraBudget": false
  },
  {
    "_id": "67c12be4a9f97d94bd2b1904",
    "expanseName": "Admin Software License Renewal",
    "department": { "_id": "6798bae6e469e809084e24a4", "name": "Admin" },
    "unit": "67ed1b4f3ea0f84ec3068e51",
    "company": "6799f0cd6a01edbe1bc3fcea",
    "expanseType": "Internal",
    "projectedAmount": 3900,
    "dueDate": "2024-04-10T18:30:00.000Z",
    "status": "Approved",
    "isExtraBudget": false
  },
  {
    "_id": "67c12be4a9f97d94bd2b1905",
    "expanseName": "Document Archival System Upgrade",
    "department": { "_id": "6798bae6e469e809084e24a4", "name": "Admin" },
    "unit": "67ed1b4f3ea0f84ec3068e51",
    "company": "6799f0cd6a01edbe1bc3fcea",
    "expanseType": "Internal",
    "projectedAmount": 5100,
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
      "_id": "67c12be4a9f97d94bd2b1935",
      "expanseName": "Office Supplies Replenishment",
      "department": { "_id": "6798bae6e469e809084e24a4", "name": "Admin" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4800,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1936",
      "expanseName": "Reception Area Maintenance",
      "department": { "_id": "6798bae6e469e809084e24a4", "name": "Admin" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5250,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1937",
      "expanseName": "Admin Software Licensing",
      "department": { "_id": "6798bae6e469e809084e24a4", "name": "Admin" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5700,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1930",
      "expanseName": "Workplace Hygiene Supplies",
      "department": { "_id": "6798bae6e469e809084e24a4", "name": "Admin" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4650,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1931",
      "expanseName": "Admin Team Development Training",
      "department": { "_id": "6798bae6e469e809084e24a4", "name": "Admin" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5200,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1932",
      "expanseName": "Visitor Management System Upgrade",
      "department": { "_id": "6798bae6e469e809084e24a4", "name": "Admin" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4870,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1933",
      "expanseName": "Admin Office Furniture Repairs",
      "department": { "_id": "6798bae6e469e809084e24a4", "name": "Admin" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4950,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1934",
      "expanseName": "Admin Travel Allowance",
      "department": { "_id": "6798bae6e469e809084e24a4", "name": "Admin" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5100,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    }
  ];

  const utilisedBudget = [
    125000, 150000, 99000, 85000, 70000, 50000, 80000, 95000, 100000, 65000,
    50000, 120000,
  ];

  const maxBudget = [
    100000, 120000, 100000, 100000, 80000, 60000, 85000, 95000, 100000, 70000,
    60000, 110000,
  ];

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      expanseName: "",
      expanseType: "",
      amount: "",
      dueDate: null,
    },
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    setOpenModal(false);
    reset();
  };

  // Transform data into the required format
 const groupedData = adminBudget.reduce((acc, item) => {
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
            { field: "projectedAmount", headerName: "Amount (INR)", flex: 1 },
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
    .sort((a, b) => dayjs(b.latestDueDate).diff(dayjs(a.latestDueDate))); // Sort descending// Sort descending

  // ---------------------------------------------------------------------//
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
      ]
      
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

  return (
    <div className="flex flex-col gap-8">
      <div className="border-default border-borderGray rounded-md">
        <WidgetSection layout={1} titleLabel={"FY 2024-25"} title={"BUDGET"}>
                    <BudgetGraph utilisedData={utilisedBudget} maxBudget={maxBudget} />
        </WidgetSection>
      </div>

      <WidgetSection layout={3} padding>
        <DataCard
          data={"INR 45,00,000"}
          title={"Projected"}
          description={`Current Month: ${new Date().toLocaleString("default", {
            month: "short",
          })}-25`}
        />
        <DataCard
          data={"INR 40,00,000"}
          title={"Actual"}
          description={`Current Month: ${new Date().toLocaleString("default", {
            month: "short",
          })}-25`}
        />
        <DataCard
          data={"INR 15,000"}
          title={"Requested"}
          description={`Current Month: ${new Date().toLocaleString("default", {
            month: "short",
          })}-25`}
        />
      </WidgetSection>

<div className="flex justify-end">
        <PrimaryButton
          title={"Request Budget"}
          padding="px-5 py-2"
          fontSize="text-base"
          handleSubmit={() => setOpenModal(true)}
        />
      </div>

      <AllocatedBudget financialData={financialData}/>
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
};

export default HrBudget;
