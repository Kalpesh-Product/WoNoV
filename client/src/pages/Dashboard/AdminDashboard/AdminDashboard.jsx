import React, { Suspense, useEffect, useState, useMemo } from "react";
import Card from "../../../components/Card";
import {
  MdFormatListBulleted,
  MdOutlineMiscellaneousServices,
  MdRebaseEdit,
} from "react-icons/md";
import { SiCashapp, SiGoogleadsense } from "react-icons/si";
import WidgetSection from "../../../components/WidgetSection";
import LayerBarGraph from "../../../components/graphs/LayerBarGraph";
import DataCard from "../../../components/DataCard";
import PieChartMui from "../../../components/graphs/PieChartMui";
import DonutChart from "../../../components/graphs/DonutChart";
import MuiTable from "../../../components/Tables/MuiTable";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import TreemapGraph from "../../../components/graphs/TreemapGraph";
import { LuHardDriveUpload } from "react-icons/lu";
import { CgWebsite } from "react-icons/cg";
import { useLocation, useNavigate } from "react-router-dom";
import BudgetGraph from "../../../components/graphs/BudgetGraph";
import { useSidebar } from "../../../context/SideBarContext";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { transformBudgetData } from "../../../utils/transformBudgetData";
import { Box, CircularProgress, Skeleton } from "@mui/material";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import useAuth from "../../../hooks/useAuth";
import { inrFormat } from "../../../utils/currencyFormat";
import usePageDepartment from "../../../hooks/usePageDepartment";
import humanDate from "../../../utils/humanDateForamt";
import humanTime from "../../../utils/humanTime";
dayjs.extend(customParseFormat);
const AdminDashboard = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const department = usePageDepartment();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("FY 2024-25");

  const { data: hrFinance = [], isLoading: isHrFinanceLoading } = useQuery({
    queryKey: ["maintainance-budget"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=6798bae6e469e809084e24a4
            `
        );
        return response.data?.allBudgets;
      } catch (error) {
        throw new Error("Error fetching data");
      }
    },
  });

  const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
    queryKey: ["clientsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/co-working-clients");
        const data = response.data.filter((item) => item.isActive);
        return data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  const hrBarData = transformBudgetData(!isHrFinanceLoading ? hrFinance : []);
  const totalExpense = hrBarData?.projectedBudget?.reduce(
    (sum, val) => sum + (val || 0),
    0
  );

  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tasks/get-tasks?dept=${department._id}`
        );
        return response.data;
      } catch (error) {
        throw new Error("Error fetching data");
      }
    },
  });

  const { data: weeklySchedule = [], isLoading: isWeeklyScheduleLoading } =
    useQuery({
      queryKey: ["weeklySchedule"],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/weekly-unit/fetch-weekly-unit/${department._id}`
          );
          return response.data;
        } catch (error) {
          throw new Error("Error fetching data");
        }
      },
    });

  const expenseRawSeries = useMemo(() => {
    // Initialize monthly buckets
    const months = Array.from({ length: 12 }, (_, index) =>
      dayjs(`2024-04-01`).add(index, "month").format("MMM")
    );

    const fyData = {
      "FY 2024-25": Array(12).fill(0),
      "FY 2025-26": Array(12).fill(0),
    };

    hrFinance.forEach((item) => {
      const date = dayjs(item.dueDate);
      const year = date.year();
      const monthIndex = date.month(); // 0 = Jan, 11 = Dec

      if (year === 2024 && monthIndex >= 3) {
        // Apr 2024 to Dec 2024 (month 3 to 11)
        fyData["FY 2024-25"][monthIndex - 3] += item.actualAmount || 0;
      } else if (year === 2025) {
        if (monthIndex <= 2) {
          // Jan to Mar 2025 (months 0–2)
          fyData["FY 2024-25"][monthIndex + 9] += item.actualAmount || 0;
        } else if (monthIndex >= 3) {
          // Apr 2025 to Dec 2025 (months 3–11)
          fyData["FY 2025-26"][monthIndex - 3] += item.actualAmount || 0;
        }
      } else if (year === 2026 && monthIndex <= 2) {
        // Jan to Mar 2026
        fyData["FY 2025-26"][monthIndex + 9] += item.actualAmount || 0;
      }
    });

    return [
      {
        name: "total",
        group: "FY 2024-25",
        data: fyData["FY 2024-25"],
      },
      {
        name: "total",
        group: "FY 2025-26",
        data: fyData["FY 2025-26"],
      },
    ];
  }, [hrFinance]);

  const expenseOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },

      stacked: false,
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

    yaxis: {
      max: 600000,
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => `${val / 100000}`,
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
      enabled: false,
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

  const budgetBar = useMemo(() => {
    if (isHrFinanceLoading || !Array.isArray(hrFinance)) return null;
    return transformBudgetData(isHrFinanceLoading ? [] : hrFinance);
  }, [isHrFinanceLoading, hrFinance]);

  const totalUtilised =
    budgetBar?.[selectedFiscalYear]?.utilisedBudget?.reduce(
      (acc, val) => acc + val,
      0
    ) || 0;
  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const { setIsSidebarOpen } = useSidebar();

  // useEffect(() => {
  //   setIsSidebarOpen(true);
  // }, []);

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: false,
      fontFamily: "Poppins-Regular",
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
    colors: ["#36BA98", "#275D3E", "#E83F25"], // Colors for the series
    dataLabels: {
      enabled: true,
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
      y: {
        formatter: (value) => `${value}%`,
      },
    },
    legend: {
      show: true,
      position: "top",
    },
  };
  //-----------------------------------------------------------------------------------------------------------------//
  const taskData = [
    { unit: "ST-701A", tasks: 25 },
    { unit: "ST-701B", tasks: 30 },
    { unit: "ST-701A", tasks: 25 },
    { unit: "ST-701B", tasks: 30 },
    { unit: "ST-701A", tasks: 25 },
    { unit: "ST-701B", tasks: 30 },
    { unit: "ST-701A", tasks: 25 },
    { unit: "ST-701B", tasks: 30 },
  ];

  const totalUnitWiseTask = taskData.reduce((sum, item) => sum + item.tasks, 0);
  const unitWisePieData = taskData.map((item) => ({
    label: `${item.unit} (${((item.tasks / totalUnitWiseTask) * 100).toFixed(
      1
    )}%)`,
    value: item.tasks,
  }));

  const unitPieChartOptions = {
    labels: unitWisePieData.map((item) => item.label),
    chart: {
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => {
          navigate("/app/tasks");
        },
      },
    },
    toolTip: {
      y: {
        formatter: (val) => `${((val / totalUnitWiseTask) * 100).toFixed(1)}%`,
      },
    },
  };

  //-----------------------------------------------------------------------------------------------------------------//
  const executiveTasks = [
    { name: "Mac Parkar", tasks: 30 },
    { name: "Anne Fernandes", tasks: 10 },
    { name: "Naaz Bavannawar", tasks: 20 },
  ];

  const executiveTotalTasks = executiveTasks.reduce(
    (sum, user) => sum + user.tasks,
    0
  );
  const pieExecutiveData = executiveTasks.map((user) =>
    parseFloat(((user.tasks / executiveTotalTasks) * 100).toFixed(1))
  );
  const executiveTasksCount = executiveTasks.map((user) => user.tasks);
  const labels = executiveTasks.map((user) => user.name);
  const colors = ["#FF5733", "#FFC300", "#28B463"];
  //-----------------------------------------------------------------------------------------------------------------//
  const companyWiseDesk = [
    { company: "Zomato", desks: "12" },
    { company: "SquadStack", desks: "10" },
    { company: "Zimetrics", desks: "15" },
    { company: "Others", desks: "16" },
  ];
  const totalCompanyDesks = companyWiseDesk.reduce(
    (sum, item) => sum + item.desks,
    0
  );
  const pieCompanyWiseDeskData = companyWiseDesk.map((item) => ({
    label: `${item.company} (${((item.desks / totalCompanyDesks) * 100).toFixed(
      1
    )}%)`,
    value: item.desks,
  }));
  const pieCompanyWiseDeskOptions = {
    labels: companyWiseDesk.map((item) => item.company),
    chart: {
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => {
          navigate(
            "/app/dashboard/admin-dashboard/client-members/client-members-data"
          );
        },
      },
    },
    stroke: {
      show: true,
      width: 6, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    toolTip: {
      y: {
        formatter: (val) => `${((val / totalCompanyDesks) * 100).toFixed(1)}%`,
      },
    },
  };
  //-----------------------------------------------------------------------------------------------------------------//
  const genderData = [
    { gender: "Male", count: "45" },
    { gender: "Female", count: "40" },
  ];
  const totalGenderCount = genderData.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const pieGenderData = genderData.map((item) => ({
    label: `${item.gender} ${((item.count / totalGenderCount) * 100).toFixed(
      1
    )}%`,
    value: item.count,
  }));
  const pieGenderOptions = {
    labels: genderData.map((item) => item.gender),
    chart: {
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => {
          navigate(
            "/app/dashboard/admin-dashboard/client-members/client-members-data"
          );
        },
      },
    },
    stroke: {
      show: true,
      width: 6, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}`,
      },
    },
  };
  //-----------------------------------------------------------------------------------------------------------------//
  const houseKeepingMemberData = [
    { name: "Aryan", dateOfJoin: "20-02-2025", building: "DTC", unitNo: "002" },
    {
      name: "Karan",
      dateOfJoin: "27-02-2025",
      building: "ST",
      unitNo: "701(A)",
    },
    {
      name: "Rahul Saxena",
      dateOfJoin: "12-03-2025",
      building: "ST",
      unitNo: "601(B)",
    },
    {
      name: "Aishwarya Sharma",
      dateOfJoin: "10-04-2025",
      building: "DTC",
      unitNo: "103",
    },
    {
      name: "Kavya",
      dateOfJoin: "25-03-2025",
      building: "ST",
      unitNo: "606(C)",
    },
    {
      name: "Siddharth Patel",
      dateOfJoin: "15-04-2025",
      building: "DTC",
      unitNo: "201",
    },
    {
      name: "Rohan Mehra",
      dateOfJoin: `20-02-${new Date().getFullYear()}`,
      building: "DTC",
      unitNo: "004",
    },
    {
      name: "Aarav Jain",
      dateOfJoin: `25-03-${new Date().getFullYear()}`,
      building: "ST",
      unitNo: "607(D)",
    },
    {
      name: "Ishaan Kumar",
      dateOfJoin: `15-04-${new Date().getFullYear()}`,
      building: "DTC",
      unitNo: "202(E)",
    },
  ];
  const houseKeepingMemberColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "name", label: "Name", align: "left" },
    { id: "dateOfJoin", label: "Date Of Join", align: "left" },
    { id: "building", label: "Building", align: "left" },
    { id: "unitNo", label: "Unit No", align: "left" },
  ];
  //-----------------------------------------------------------------------------------------------------------------//
  const executiveShiftData = [
    {
      id: 1,
      name: "Amit Sharma",
      building: "ST",
      unitNo: "701(A)",
      startTime: "09:00 AM",
      endTime: "05:00 PM",
    },
    {
      id: 2,
      name: "Priya Nair",
      building: "ST",
      unitNo: "701(B)",
      startTime: "10:00 AM",
      endTime: "06:00 PM",
    },
    {
      id: 3,
      name: "Rohan Verma",
      building: "DTC",
      unitNo: "002",
      startTime: "08:00 AM",
      endTime: "04:00 PM",
    },
    {
      id: 4,
      name: "Sneha Mehta",
      building: "DTC",
      unitNo: "003",
      startTime: "11:00 AM",
      endTime: "07:00 PM",
    },
    {
      id: 5,
      name: "Karan Desai",
      building: "ST",
      unitNo: "601(B)",
      startTime: "07:00 AM",
      endTime: "03:00 PM",
    },
    {
      id: 6,
      name: "Anjali Kapoor",
      building: "ST",
      unitNo: "501(B)",
      startTime: "12:00 PM",
      endTime: "08:00 PM",
    },
    {
      id: 7,
      name: "Diksha Kandolkar",
      building: "ST",
      unitNo: "501(C)",
      startTime: "10:30 AM",
      endTime: "05:30 PM",
    },
    {
      id: 8,
      name: "Rahul Dhawan",
      building: "DTC",
      unitNo: "004",
      startTime: "09:00 AM",
      endTime: "06:00 PM",
    },
  ];

  const executiveShiftColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "name", label: "Name", align: "left" },
    { id: "building", label: "Building", align: "left" },
    { id: "unitNo", label: "Unit No", align: "left" },
    { id: "startTime", label: "Start Time", align: "left" },
    { id: "endTime", label: "End Time", align: "left" },
  ];
  //-----------------------------------------------------------------------------------------------------------------//
  const upcomingEventsData = [
    {
      event: "IBDO Anniversary Celebration",
      date: "12-02-2025",
      location: "Garrison Cafe",
    },
    {
      event: "Zomato Anniversary Celebration",
      date: "15-02-2025",
      location: "Garrison Cafe",
    },
    {
      event: "SquadStack Anniversary Celebration",
      date: "01-03-2025",
      location: "Garrison Cafe",
    },
    {
      event: "91 HR Anniversary Celebration",
      date: "10-04-2025",
      location: "Garrison Cafe",
    },
    {
      event: "Turtlemint Anniversary Celebration",
      date: "20-02-2025",
      location: "Garrison Cafe",
    },
    {
      event: "Lancesoft Anniversary Celebration",
      date: "25-03-2025",
      location: "Garrison Cafe",
    },
    {
      event: "Zimetrics Anniversary Celebration",
      date: "05-04-2025",
      location: "Garrison Cafe",
    },
    {
      event: "Infuse Anniversary Celebration",
      date: "02-03-2025",
      location: "Garrison Cafe",
    },
  ];
  const upcomingEventsColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "event", label: "Event", align: "left" },
    { id: "date", label: "Date", align: "left" },
    { id: "location", label: "Location", align: "left" },
  ];
  //-----------------------------------------------------------------------------------------------------------------//
  // const clientMemberBirthdays = [
  //   {
  //     name: "John Doe",
  //     company: "Zomato",
  //     dateOfJoin: "02-02-2024",
  //     dateOfBirth: "18-03-2001",
  //   },
  //   {
  //     name: "Anita Rao",
  //     company: "Swiggy",
  //     dateOfJoin: "12-05-2021",
  //     dateOfBirth: "25-03-1995",
  //   },
  //   {
  //     name: "Ravi Patel",
  //     company: "Paytm",
  //     dateOfJoin: "01-01-2020",
  //     dateOfBirth: "01-04-1988",
  //   },
  //   {
  //     name: "Sneha Shah",
  //     company: "Byju's",
  //     dateOfJoin: "10-07-2022",
  //     dateOfBirth: "22-03-1990",
  //   },
  //   {
  //     name: "Vikram Singh",
  //     company: "Nykaa",
  //     dateOfJoin: "15-08-2019",
  //     dateOfBirth: "29-03-1993",
  //   },
  //   {
  //     name: "Meena Iyer",
  //     company: "Flipkart",
  //     dateOfJoin: "20-09-2023",
  //     dateOfBirth: "20-03-1997",
  //   },
  // ];

  const clientMemberBirthdays = [
    {
      srNo: 1,
      name: "Aarav Mehta",
      upcomingIn: "3 days",
      dateOfBirth: "1996-04-22",
      company: "Zomato",
    },
    {
      srNo: 2,
      name: "Riya Sharma",
      upcomingIn: "5 days",
      dateOfBirth: "1992-04-24",
      company: "SquadStack",
    },
    {
      srNo: 3,
      name: "Kabir Khanna",
      upcomingIn: "7 days",
      dateOfBirth: "1994-04-26",
      company: "Zimetrics",
    },
    {
      srNo: 4,
      name: "Sneha Patel",
      upcomingIn: "9 days",
      dateOfBirth: "1997-04-28",
      company: "IBDO",
    },
    {
      srNo: 5,
      name: "Vikram Singh",
      upcomingIn: "1 day",
      dateOfBirth: "1995-04-20",
      company: "Flipkart",
    },
    {
      srNo: 6,
      name: "Ananya Gupta",
      upcomingIn: "2 days",
      dateOfBirth: "1993-04-21",
      company: "Nykaa",
    },
    {
      srNo: 7,
      name: "Rohan Desai",
      upcomingIn: "3 days",
      dateOfBirth: "1998-04-22",
      company: "Paytm",
    },
    {
      srNo: 8,
      name: "Priya Nair",
      upcomingIn: "4 days",
      dateOfBirth: "1990-04-23",
      company: "Amazon",
    },
    {
      srNo: 9,
      name: "Arjun Reddy",
      upcomingIn: "5 days",
      dateOfBirth: "1996-04-24",
      company: "Swiggy",
    },
    {
      srNo: 10,
      name: "Meera Iyer",
      upcomingIn: "6 days",
      dateOfBirth: "1994-04-25",
      company: "Ola",
    },
    {
      srNo: 11,
      name: "Nikhil Joshi",
      upcomingIn: "7 days",
      dateOfBirth: "1992-04-26",
      company: "Myntra",
    },
    {
      srNo: 12,
      name: "Sanya Kapoor",
      upcomingIn: "8 days",
      dateOfBirth: "1997-04-27",
      company: "Uber",
    },
    {
      srNo: 13,
      name: "Ishaan Malhotra",
      upcomingIn: "10 days",
      dateOfBirth: "1995-04-29",
      company: "Zomato",
    },
    {
      srNo: 14,
      name: "Tara Bose",
      upcomingIn: "11 days",
      dateOfBirth: "1993-04-30",
      company: "SquadStack",
    },
    {
      srNo: 15,
      name: "Aditya Rao",
      upcomingIn: "15 days",
      dateOfBirth: "1991-05-04",
      company: "Flipkart",
    },
    {
      srNo: 16,
      name: "Kavya Menon",
      upcomingIn: "20 days",
      dateOfBirth: "1996-05-09",
      company: "Nykaa",
    },
  ];

  const clientMemberBirthdaysColumns = [
    { id: "srNo", label: "Sr No", align: "left" },
    { id: "name", label: "Name", align: "left" },
    { id: "dateOfBirth", label: "DOB", align: "left" },
    { id: "upComingIn", label: "Upcoming In", align: "left" },
    { id: "company", label: "Company", align: "left" },
  ];

  const today = dayjs.utc().startOf("day");
  const cutOff = today.add(15, "day");

  // const upcomingBirthdays = clientsData
  //   .map((item) => {
  //     const dob = dayjs(item.dateOfBirth, "YYYY-MM-DD");
  //     const thisYearBirthday = dob.set("year", today.year());

  //     const birthday = thisYearBirthday.isBefore(today)
  //       ? thisYearBirthday.add(1, "year")
  //       : thisYearBirthday;

  //     const doj = dayjs(item.dateOfJoin, "YYYY-MM-DD");
  //     const completedYears = today.diff(doj, "year");
  //     const upComingIn = birthday.diff(today, "days");

  //     return {
  //       ...item,
  //       dateOfBirth: dayjs(item.dateOfBirth, "YYYY-MM-DD").format("DD-MM-YYYY"),
  //       upComingIn: `${upComingIn} days`,
  //       isUpcoming:
  //         birthday.isBefore(cutOff) &&
  //         birthday.isAfter(today.subtract(1, "day")),
  //     };
  //   })
  //   .filter((item) => item.isUpcoming);

  const upcomingBirthdays = clientsData
    .flatMap((client) =>
      (client.members || [])
        .filter((member) => member.dob && dayjs(member.dob).isValid())
        .map((member) => {
          const dob = dayjs.utc(member.dob).startOf("day");
          const thisYearBirthday = dob.set("year", today.year());

          const birthday = thisYearBirthday.isBefore(today)
            ? thisYearBirthday.add(1, "year")
            : thisYearBirthday;

          const birthdayStart = birthday.startOf("day");
          const upComingIn = birthdayStart.diff(today, "day");

          return {
            company: client.clientName,
            name: member.employeeName,
            email: member.email,
            dateOfBirth: dob.format("DD-MM-YYYY"),
            upComingIn: upComingIn === 0 ? "Today" : `${upComingIn} days`,
            isUpcoming:
              birthdayStart.isBefore(cutOff) &&
              birthdayStart.isAfter(today.subtract(1, "day")),
          };
        })
    )
    .filter((item) => item.isUpcoming);

  //-----------------------------------------------------------------------------------------------------------------//
  const clientAnniversaryData = [
    {
      srNo: 1,
      client: "Zomato",
      dateOfJoin: "22-03-2020", // Anniversary on 22 Mar 2025 → passed, next in ~337 days
      completedYears: 5,
      upComingIn: "337 days",
    },
    {
      srNo: 2,
      client: "Flipkart",
      dateOfJoin: "19-01-2023", // Anniversary on 19 Jan 2025 → passed, next in ~305 days
      completedYears: 2,
      upComingIn: "305 days",
    },
    {
      srNo: 3,
      client: "Nykaa",
      dateOfJoin: "18-03-2022", // Anniversary on 18 Mar 2025 → passed, next in ~333 days
      completedYears: 3,
      upComingIn: "333 days",
    },
    {
      srNo: 4,
      client: "SquadStack",
      dateOfJoin: "16-04-2021", // Anniversary on 16 Apr 2025 → in 3 days
      completedYears: 4,
      upComingIn: "3 days",
    },
    {
      srNo: 5,
      client: "Paytm",
      dateOfJoin: "14-02-2024", // Anniversary on 14 Feb 2025 → passed, next in ~301 days
      completedYears: 1,
      upComingIn: "301 days",
    },
    {
      srNo: 6,
      client: "Amazon",
      dateOfJoin: "25-04-2023", // Anniversary on 25 Apr 2025 → in 6 days
      completedYears: 2,
      upComingIn: "6 days",
    },
    {
      srNo: 7,
      client: "Swiggy",
      dateOfJoin: "10-05-2022", // Anniversary on 10 May 2025 → in 21 days
      completedYears: 3,
      upComingIn: "21 days",
    },
    {
      srNo: 8,
      client: "Ola",
      dateOfJoin: "30-06-2021", // Anniversary on 30 Jun 2025 → in 72 days
      completedYears: 4,
      upComingIn: "72 days",
    },
    {
      srNo: 9,
      client: "Myntra",
      dateOfJoin: "15-08-2024", // Anniversary on 15 Aug 2025 → in 118 days
      completedYears: 0,
      upComingIn: "118 days",
    },
    {
      srNo: 10,
      client: "Uber",
      dateOfJoin: "05-03-2020", // Anniversary on 5 Mar 2025 → passed, next in ~320 days
      completedYears: 5,
      upComingIn: "320 days",
    },
  ];

  // const upComingClientAnniversary = clientsData
  //   .map((item, index) => {
  //     const doj = dayjs(item.dateOfJoin, "DD-MM-YYYY");
  //     const thisYearAnniversary = doj.set("year", today.year());
  //     const anniversary = thisYearAnniversary.isBefore(today)
  //       ? thisYearAnniversary.add(1, "year")
  //       : thisYearAnniversary;

  //     const completedYears = today.diff(doj, "year");
  //     const upComingInDays = anniversary.diff(today, "day");

  //     return {
  //       srNo: index + 1,
  //       client: item.client,
  //       dateOfJoin: item.dateOfJoin,
  //       completedYears: completedYears,
  //       upComingIn:
  //         upComingInDays === 0
  //           ? "Today"
  //           : upComingInDays === 1
  //           ? "Tomorrow"
  //           : `${upComingInDays} days`,
  //       isUpcoming:
  //         anniversary.isBefore(cutOff) &&
  //         anniversary.isAfter(today.subtract(1, "day")),
  //     };
  //   })
  //   .filter((item) => item.isUpcoming);

  const calculateCompletedTime = (startDate) => {
    const start = dayjs(startDate);
    const today = dayjs();
    const totalMonths = today.diff(start, "month", true);

    if (totalMonths < 1) {
      const totalDays = today.diff(start, "day");
      return `${totalDays} Days`;
    } else if (totalMonths < 12) {
      return `${Math.floor(totalMonths)} Months`;
    } else {
      const years = totalMonths / 12;
      return `${years.toFixed(1)} Years`;
    }
  };

  const upComingClientAnniversary = clientsData
    .filter((item) => !!item.startDate)
    .map((item, index) => {
      const doj = dayjs.utc(item.startDate).startOf("day");

      const thisYearAnniversary = doj.set("year", today.year());

      const anniversary = thisYearAnniversary.isBefore(today)
        ? thisYearAnniversary.add(1, "year")
        : thisYearAnniversary;

      const completedYears = calculateCompletedTime(item.startDate);

      const upComingInDays = anniversary.diff(today, "day");
      return {
        srNo: index + 1,
        client: item.clientName,
        dateOfJoin: doj.format("DD-MM-YYYY"),
        completedYears,
        upComingIn:
          upComingInDays === 0
            ? "Today"
            : upComingInDays === 1
            ? "Tomorrow"
            : `${upComingInDays} days`,
        isUpcoming:
          anniversary.isBefore(cutOff) &&
          anniversary.isAfter(today.subtract(1, "day")),
      };
    })
    .filter((item) => item.isUpcoming);

  const upComingClientAnniversaryColumns = [
    { id: "srNo", label: "Sr No", align: "left" },
    { id: "client", label: "Company", align: "left" },
    { id: "dateOfJoin", label: "Date of Join", align: "left" },
    { id: "completedYears", label: "Completed Years", align: "left" },
    { id: "upComingIn", label: "Upcoming in", align: "left" },
  ];

  const executiveTimingsColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "name", label: "Name", align: "left" },
    // { id: "building", label: "Building", align: "left" },
    { id: "unitNo", label: "Unit No", align: "left" },
    { id: "startDate", label: "Start Date", align: "left" },
    { id: "endDate", label: "End Date", align: "left" },
  ];

  const utilisedData = [
    125000, 150000, 99000, 85000, 70000, 50000, 80000, 95000, 100000, 65000,
    50000, 120000,
  ];

  const maxBudget = [
    100000, 120000, 100000, 100000, 80000, 60000, 85000, 95000, 100000, 70000,
    60000, 110000,
  ];

  const transformedWeeklyShifts = useMemo(() => {
    if (isWeeklyScheduleLoading || !weeklySchedule.length) return [];

    return weeklySchedule.map((emp, index) => ({
      srNo: index + 1,
      id: index + 1,
      name: `${emp.employee.id.firstName} ${emp.employee.id.lastName}`,
      startDate: humanDate(emp.startDate),
      endDate: humanDate(emp.endDate),
      building: emp.location.building.buildingName,
      unitNo: emp.location.unitNo,
    }));
  }, [weeklySchedule, isWeeklyScheduleLoading]);

  const transformedTasks = tasks.map((task, index) => {
    return {
      id: index + 1,
      taskName: task.taskName,
      status: task.status,
      endTime: humanTime(task.dueTime),
    };
  });

  let simplifiedClientsPie = [];

  if (!isClientsDataPending && Array.isArray(clientsData)) {
    let otherTotalDesks = 0;

    simplifiedClientsPie = clientsData.reduce((acc, item) => {
      const { clientName: companyName, totalDesks } = item;

      if (totalDesks < 15) {
        otherTotalDesks += totalDesks;
        return acc;
      }

      acc.push({ companyName, totalDesks });
      return acc;
    }, []);

    if (otherTotalDesks > 0) {
      simplifiedClientsPie.push({
        companyName: "Other",
        totalDesks: otherTotalDesks,
      });
    }
  }

  const totalClientsDesks = simplifiedClientsPie.reduce(
    (sum, item) => sum + item.totalDesks,
    0
  );

  const totalDeskPercent = simplifiedClientsPie.map((item) => ({
    label: `${item.companyName} ${(
      (item.totalDesks / totalClientsDesks) *
      100
    ).toFixed(1)}%`,
    value: item.totalDesks,
  }));
  const clientsDesksPieOptions = {
    labels: simplifiedClientsPie.map((item) => {
      const label = item?.companyName ? `${item.companyName}` : "Unknown";
      return label.length > 10 ? label.slice(0, 15) + "..." : label;
    }),
    chart: {
      fontFamily: "Poppins-Regular",
      toolbar: false,
    },
    colors: [
      "#0F172A", // deep navy blue
      "#1E293B", // dark slate blue
      "#1D4ED8", // vibrant blue (slightly electric)
      "#2563EB", // crisp blue
      "#3B82F6", // standard vivid blue
      "#0284C7", // cyan-leaning blue
      "#0369A1", // oceanic deep blue
      "#0EA5E9", // bright cool blue
      "#3A60B5", // bold steel blue
      "#4C51BF", // indigo-tinged blue
    ],

    tooltip: {
      y: {
        formatter: (val) => {
          return `${val} Desks`; // Explicitly return the formatted value
        },
      },
    },
    legend: {
      position: "right",
    },
  };

  //-----------------------------------------------------------------------------------------------------------------//
  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <Suspense
          fallback={
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Simulating chart skeleton */}
              <Skeleton variant="text" width={200} height={30} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </Box>
          }
        >
          <WidgetSection normalCase layout={1} padding>
            <YearlyGraph
              data={expenseRawSeries}
              responsiveResize
              chartId={"bargraph-hr-expense"}
              options={expenseOptions}
              onYearChange={setSelectedFiscalYear}
              title={"BIZ Nest ADMIN DEPARTMENT EXPENSE"}
              titleAmount={`INR ${Math.round(totalUtilised).toLocaleString(
                "en-IN"
              )}`}
            />
          </WidgetSection>
        </Suspense>,
      ],
    },

    {
      layout: 6,
      widgets: [
        <Card
          icon={<MdFormatListBulleted />}
          title="Annual Expenses"
          route={"/app/dashboard/admin-dashboard/annual-expenses"}
        />,
        <Card
          icon={<MdFormatListBulleted />}
          title="Inventory"
          route={"/app/dashboard/admin-dashboard/inventory"}
        />,
        <Card
          icon={<SiCashapp />}
          title="Finance"
          route={"/app/dashboard/admin-dashboard/finance"}
        />,
        <Card
          icon={<MdFormatListBulleted />}
          title="Mix-Bag"
          route={"mix-bag"}
        />,
        <Card
          icon={<SiGoogleadsense />}
          title="Data"
          route={"/app/dashboard/admin-dashboard/data"}
        />,
        <Card
          icon={<MdOutlineMiscellaneousServices />}
          title="Settings"
          route={"/app/dashboard/admin-dashboard/settings"}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          route={"admin-offices"}
          title={"Total"}
          data={""}
          description={"Admin Offices"}
        />,
        <DataCard
          route={"/app/tasks"}
          title={"Total"}
          data={""}
          description={"Monthly Due Tasks"}
        />,
        <DataCard
          route={"admin-expenses"}
          title={"Average"}
          data={""}
          description={"Monthly Expense"}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          route={"per-sq-ft-expense"}
          title={"Total"}
          data={""}
          description={"Expense Per Sq. Ft."}
        />,
        <DataCard
          route={"per-sq-ft-electricity-expense"}
          title={"Total"}
          data={""}
          description={"Electricity Expense Per Sq. Ft."}
        />,
        <DataCard
          route={"admin-executive-expense"}
          title={"Top Executive"}
          data={""}
          description={"Mr. Machindranath Parkar"}
        />,
      ],
    },
    {
      layout: 2,
      widgets: [
        <MuiTable
          scroll
          Title={"Weekly Executive Shift Timing"}
          rowsToDisplay={3}
          rows={transformedWeeklyShifts}
          columns={executiveTimingsColumns}
        />,
        <MuiTable
          scroll
          Title={"Upcoming Events List"}
          rowsToDisplay={3}
          rows={[]}
          columns={upcomingEventsColumns}
        />,
        <MuiTable
          columns={clientMemberBirthdaysColumns}
          scroll
          rowsToDisplay={3}
          Title={"Upcoming Client Member Birthdays"}
          rows={upcomingBirthdays.map((item, index) => ({
            ...item,
            srNo: index + 1,
          }))}
        />,
        <MuiTable
          columns={upComingClientAnniversaryColumns}
          scroll
          rowsToDisplay={3}
          Title={"Upcoming Client Anniversaries"}
          rows={upComingClientAnniversary.map((item, index) => ({
            ...item,
            srNo: index + 1,
          }))}
        />,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Unit Wise Due Tasks"}>
          <PieChartMui data={[]} options={[]} />
        </WidgetSection>,
        <WidgetSection border title={"Executive Wise Due Tasks"}>
          <DonutChart
            centerLabel="Tasks"
            labels={[]}
            colors={colors}
            series={[]}
            tooltipValue={executiveTasksCount}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Total Desks Company Wise"}>
          {!isClientsDataPending ? (
            <PieChartMui
              data={totalDeskPercent}
              options={clientsDesksPieOptions}
              width={"100%"}
            />
          ) : (
            <CircularProgress color="#1E3D73" />
          )}
        </WidgetSection>,
        <WidgetSection border title={"Biometrics Gender Data"}>
          <PieChartMui data={[]} options={[]} />
        </WidgetSection>,
      ],
    },
    // {
    //   layout: 2,
    //   widgets: [
    //     <WidgetSection border title={"Overall Gender Data"}>
    //       <PieChartMui data={[]} options={[]} />
    //     </WidgetSection>,
    //     <WidgetSection border title={"Biometrics Gender Data"}>
    //       <PieChartMui data={[]} options={[]} />
    //     </WidgetSection>,
    //   ],
    // },
    // {
    //   layout: 2,
    //   widgets: [
    //     <WidgetSection border title={"Department Gender Data"}>
    //       <PieChartMui data={[]} options={[]} />
    //     </WidgetSection>,

    //     <WidgetSection border title={"House Keeping Staff Gender Data"}>
    //       <PieChartMui data={[]} options={[]} />
    //     </WidgetSection>,
    //   ],
    // },
    {
      layout: 1,
      widgets: [
        <MuiTable
          Title={"Newly Joined House Keeping Members"}
          rowsToDisplay={4}
          scroll
          rows={[]}
          columns={houseKeepingMemberColumns}
        />,
      ],
    },
  ];

  return (
    <div>
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout}>
          {section?.widgets}
        </WidgetSection>
      ))}
    </div>
  );
};

export default AdminDashboard;
