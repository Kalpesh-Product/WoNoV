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
import AllocatedBudget from "../../../../components/Tables/AllocatedBudget";
import BudgetGraph from "../../../../components/graphs/BudgetGraph";

const HrBudget = () => {
  const axios = useAxiosPrivate();
  const utilisedData = [
    125000, 150000, 99000, 85000, 70000, 50000, 80000, 95000, 100000, 65000,
    50000, 120000,
  ];

  const maxBudget = [
    100000, 120000, 100000, 100000, 80000, 60000, 85000, 95000, 100000, 70000,
    60000, 110000,
  ];

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

  const hrFinance = [
    {
      "_id": "67c12be4a9f97d94bd2b1902",
      "expanseName": "Cloud Infrastructure Workshop",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5200,
      "dueDate": "2024-05-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1903",
      "expanseName": "Cybersecurity Awareness Training",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 6000,
      "dueDate": "2024-06-20T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1904",
      "expanseName": "Agile Development Seminar",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4100,
      "dueDate": "2024-07-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1905",
      "expanseName": "AI and Machine Learning Conference",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4800,
      "dueDate": "2024-08-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1906",
      "expanseName": "DevOps Implementation Training",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5300,
      "dueDate": "2024-09-12T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1907",
      "expanseName": "Blockchain Technology Workshop",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4950,
      "dueDate": "2024-10-18T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1901",
      "expanseName": "ERP System Upgrade",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e51",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4500,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1903",
      "expanseName": "AI-Powered Analytics Platform",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4500,
      "dueDate": "2024-07-22T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1904",
      "expanseName": "Cloud Database Migration",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 1200,
      "dueDate": "2024-08-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1905",
      "expanseName": "Cybersecurity Audit",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 5000,
      "dueDate": "2024-09-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1906",
      "expanseName": "API Integration Services",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 2000,
      "dueDate": "2024-10-18T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1907",
      "expanseName": "IT Infrastructure Monitoring Tool",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Sales" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 3500,
      "dueDate": "2024-11-30T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1908",
      "expanseName": "Cloud Infrastructure Setup",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "IT" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4500,
      "dueDate": "2024-05-20T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1909",
      "expanseName": "Cybersecurity Software License",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "IT" },
      "unit": "67ed1b4f3ea0f84ec3068e52",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 8200,
      "dueDate": "2024-05-20T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1910",
      "expanseName": "IT Staff Training Certification",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "IT" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3800,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1911",
      "expanseName": "Network Monitoring Tools",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "IT" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 2750,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1912",
      "expanseName": "Development Software Licenses",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "IT" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 1950,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1913",
      "expanseName": "Server Maintenance Contract",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "IT" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3200,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1914",
      "expanseName": "IT Helpdesk System Upgrade",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "IT" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4800,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1915",
      "expanseName": "Network Security Upgrade",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "IT" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 2250,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1916",
      "expanseName": "IT Infrastructure Monitoring",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "IT" },
      "unit": "67ed1b4f3ea0f84ec3068e53",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3750,
      "dueDate": "2024-06-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b192g",
      "expanseName": "IT Team Offsite Workshop",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "IT" },
      "unit": "67ed1b4f3ea0f84ec3068e61",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 6500.00,
      "dueDate": "2024-07-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b192h",
      "expanseName": "Tech Conference Attendance",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "IT" },
      "unit": "67ed1b4f3ea0f84ec3068e61",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 10200.00,
      "dueDate": "2024-07-15T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b192i",
      "expanseName": "Developer Tools Subscription",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "IT" },
      "unit": "67ed1b4f3ea0f84ec3068e61",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4200.00,
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
      "expanseName": "AC Unit Replacement",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e62",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 7100.50,
      "dueDate": "2024-08-10T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1931",
      "expanseName": "Pest Control Treatment",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e63",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 11200.00,
      "dueDate": "2024-09-01T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": true
    },
    {
      "_id": "67c12be4a9f97d94bd2b1905",
      "expanseName": "Restroom Renovation Work",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e64",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4600,
      "dueDate": "2024-10-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1906",
      "expanseName": "Ceiling Leak Repair",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e64",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 11900,
      "dueDate": "2024-10-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1907",
      "expanseName": "Paint Work & Touch-ups",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e64",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 7800,
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
      "expanseName": "Air Filter Replacements",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e64",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4800,
      "dueDate": "2024-10-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b190b",
      "expanseName": "Deep Cleaning Services",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e64",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 6600,
      "dueDate": "2024-10-05T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b190c",
      "expanseName": "Boiler System Service",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 5500,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b190d",
      "expanseName": "Pipe Leakage Fix",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 3100,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b190e",
      "expanseName": "Winterizing Equipment",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4900,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b190f",
      "expanseName": "Parking Lot Resurfacing",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 3950,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1910",
      "expanseName": "Exhaust Fan Installation",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 6300,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1911",
      "expanseName": "Hand Dryer Installation",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 4700,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1912",
      "expanseName": "Roof Inspection Services",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e65",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "External",
      "projectedAmount": 5100,
      "dueDate": "2024-11-25T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1907",
      "expanseName": "Tool Room Equipment Purchase",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e66",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 1650,
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
      "expanseName": "Air Conditioning Tune-Up",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3100,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1922",
      "expanseName": "Tool Inventory Update",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3500,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1923",
      "expanseName": "Workshop Safety Audit",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3900,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1924",
      "expanseName": "Lighting Maintenance Supplies",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3250,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1926",
      "expanseName": "Building HVAC Repair",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 3800,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1927",
      "expanseName": "Elevator Maintenance Contract",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e68",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4600,
      "dueDate": "2025-02-14T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1928",
      "expanseName": "Plumbing System Upgrade",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 6100,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1929",
      "expanseName": "Lighting System Overhaul",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5300,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1930",
      "expanseName": "Generator Fuel Refill",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 4900,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1931",
      "expanseName": "Electrical Wiring Audit",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
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
      "expanseName": "Building Sanitation Contract",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5200,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1933",
      "expanseName": "Waste Disposal System Upgrade",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5400,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    },
    {
      "_id": "67c12be4a9f97d94bd2b1934",
      "expanseName": "Roof Waterproofing",
      "department": { "_id": "6798bab9e469e809084e24aa", "name": "Maintenance" },
      "unit": "67ed1b4f3ea0f84ec3068e69",
      "company": "6799f0cd6a01edbe1bc3fcea",
      "expanseType": "Internal",
      "projectedAmount": 5000,
      "dueDate": "2025-03-28T18:30:00.000Z",
      "status": "Approved",
      "isExtraBudget": false
    }
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
  const groupedData = hrFinance.reduce((acc, item) => {
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

  // ---------------------------------------------------------------------//

  return (
    <div className="flex flex-col gap-8">
      <div>
        <WidgetSection
          layout={1}
          title={"BUDGET 2024"}
          titleLabel={"FY 2024-25"}
          border
        >
          <BudgetGraph utilisedData={utilisedData} maxBudget={maxBudget} />
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

      <AllocatedBudget financialData={financialData} />
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
