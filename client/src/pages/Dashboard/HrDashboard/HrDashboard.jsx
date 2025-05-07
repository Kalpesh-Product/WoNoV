import React, { lazy, Suspense, useEffect } from "react";
import WidgetSection from "../../../components/WidgetSection";
import Card from "../../../components/Card";
import { LuHardDriveUpload } from "react-icons/lu";
import { Skeleton, Box, CircularProgress } from "@mui/material";
import { CgWebsite } from "react-icons/cg";
import { SiCashapp } from "react-icons/si";
import { SiGoogleadsense } from "react-icons/si";
import { MdMiscellaneousServices } from "react-icons/md";
import DataCard from "../../../components/DataCard";
import PayRollExpenseGraph from "../../../components/HrDashboardGraph/PayRollExpenseGraph";
import MuiTable from "../../../components/Tables/MuiTable";
import PieChartMui from "../../../components/graphs/PieChartMui";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import BarGraph from "../../../components/graphs/BarGraph";
import { useNavigate } from "react-router-dom";
import BudgetGraph from "../../../components/graphs/BudgetGraph";
import { inrFormat } from "../../../utils/currencyFormat";
import { useSidebar } from "../../../context/SideBarContext";
import { transformBudgetData } from "../../../utils/transformBudgetData";
import { calculateAverageAttendance } from "../../../utils/calculateAverageAttendance ";
import { calculateAverageDailyWorkingHours } from "../../../utils/calculateAverageDailyWorkingHours ";
import FinanceCard from "../../../components/FinanceCard";
import HrExpenseGraph from "../../../components/graphs/HrExpenseGraph";
import dayjs from "dayjs";

const HrDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const accessibleModules = new Set();

  auth.user.permissions?.deptWisePermissions?.forEach((department) => {
    department.modules.forEach((module) => {
      const hasViewPermission = module.submodules.some((submodule) =>
        submodule.actions.includes("View")
      );

      if (hasViewPermission) {
        accessibleModules.add(module.moduleName);
      }
    });
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  //--------------------HR BUDGET---------------------------//
  const { data: hrFinance = [], isLoading: isHrFinanceLoading } = useQuery({
    queryKey: ["hrFinance"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=6798bab9e469e809084e249e
            `
        );

        console.log(transformBudgetData(response.data.allBudgets));
        return transformBudgetData(response.data.allBudgets);
      } catch (error) {
        throw new Error("Error fetching data");
      }
    },
  });
  const totalExpense = hrFinance?.projectedBudget?.reduce(
    (sum, val) => sum + (val || 0),
    0
  );

  //--------------------HR BUDGET---------------------------//

  //-------------------HR Expense graph start--------------------//

  const expenseRawSeries = [
    {
      name: "FY 2024-25",
      data: hrFinance?.utilisedBudget,
      group: "total",
    },
    {
      name: "FY 2025-26",
      data: [1000054, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      group: "total",
    },
    // {
    //   name: "Tech Assigned",
    //   data: [45, 50, 40, 55, 60, 50, 65, 60, 70, 75, 30, 30],
    //   group: "total",
    // },

    // {
    //   name: "Admin Assigned",
    //   data: [45, 50, 40, 55, 60, 50, 65, 60, 70, 75, 10, 10],
    //   group: "total",
    // },
    // {
    //   name: "Maintainance Assigned",
    //   data: [45, 50, 40, 55, 60, 50, 65, 60, 70, 75, 5, 3],
    //   group: "total",
    // },
    // {
    //   name: "Space Completed",
    //   data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   group: "space",
    // },
    // {
    //   name: "Sales Completed",
    //   data: [40, 45, 25, 40, 45, 35, 50, 45, 55, 60, 10, 10],
    //   group: "completed",
    // },
    // {
    //   name: "IT Completed",
    //   data: [40, 45, 25, 40, 45, 35, 50, 45, 55, 60, 20, 10],
    //   group: "completed",
    // },

    // {
    //   name: "Tech Completed",
    //   data: [45, 40, 30, 45, 50, 40, 55, 50, 60, 65, 30, 30],
    //   group: "completed",
    // },
    // {
    //   name: "Admin Completed",
    //   data: [40, 30, 40, 52, 46, 40, 60, 59, 50, 70, 8, 10],
    //   group: "completed",
    // },
    // {
    //   name: "Maintainance Completed",
    //   data: [45, 50, 40, 55, 60, 50, 65, 60, 70, 75, 4, 1],
    //   group: "completed",
    // },
  ];

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
      // formatter: (val) => inrFormat(val),
      // formatter: (val) => {
      //   const scaled = val / 100000; // Scale from actual to "xx.xx" format
      //   return scaled.toFixed(2); // Keep two digits after decimal
      // },
      formatter: (val) => {
        const scaled = Math.round((val / 100000) * 100) / 100;
        return Number.isInteger(scaled) ? scaled.toFixed(0) : scaled.toFixed(2);
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
      // y: {
      //   formatter: (val, { seriesIndex, dataPointIndex }) => {
      //     const rawData = expenseRawSeries[seriesIndex]?.data[dataPointIndex];
      //     // return `${rawData} Tasks`;
      //     return `HR Expense: INR ${rawData.toLocaleString("en-IN")}`;
      //   },
      // },
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        const rawData = expenseRawSeries[seriesIndex]?.data[dataPointIndex];
        // return `<div style="padding: 8px; font-family: Poppins, sans-serif;">
        //       HR Expense: INR ${rawData.toLocaleString("en-IN")}
        //     </div>`;
        return `
            <div style="padding: 8px; font-size: 13px; font-family: Poppins, sans-serif">
        
              <div style="display: flex; align-items: center; justify-content: space-between; background-color: #d7fff4; color: #00936c; padding: 6px 8px; border-radius: 4px; margin-bottom: 4px;">
                <div><strong>HR Expense:</strong></div>
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

  //-------------------HR Expense graph end--------------------//

  //-------------------Tasks vs Achievements graph--------------------//

  // const rawSeries = [
  //   {
  //     name: "Sales Assigned",
  //     data: [40, 45, 35, 50, 55, 45, 60, 55, 65, 70, 20, 15],
  //     group: "total",
  //   },
  //   {
  //     name: "IT Assigned",
  //     data: [40, 45, 35, 50, 55, 45, 60, 55, 65, 70, 25, 10],
  //     group: "total",
  //   },
  //   {
  //     name: "Tech Assigned",
  //     data: [45, 50, 40, 55, 60, 50, 65, 60, 70, 75, 30, 30],
  //     group: "total",
  //   },

  //   {
  //     name: "Admin Assigned",
  //     data: [45, 50, 40, 55, 60, 50, 65, 60, 70, 75, 10, 10],
  //     group: "total",
  //   },
  //   {
  //     name: "Maintainance Assigned",
  //     data: [45, 50, 40, 55, 60, 50, 65, 60, 70, 75, 5, 3],
  //     group: "total",
  //   },
  //   {
  //     name: "Space Completed",
  //     data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  //     group: "space",
  //   },
  //   {
  //     name: "Sales Completed",
  //     data: [40, 45, 25, 40, 45, 35, 50, 45, 55, 60, 10, 10],
  //     group: "completed",
  //   },
  //   {
  //     name: "IT Completed",
  //     data: [40, 45, 25, 40, 45, 35, 50, 45, 55, 60, 20, 10],
  //     group: "completed",
  //   },

  //   {
  //     name: "Tech Completed",
  //     data: [45, 40, 30, 45, 50, 40, 55, 50, 60, 65, 30, 30],
  //     group: "completed",
  //   },
  //   {
  //     name: "Admin Completed",
  //     data: [40, 30, 40, 52, 46, 40, 60, 59, 50, 70, 8, 10],
  //     group: "completed",
  //   },
  //   {
  //     name: "Maintainance Completed",
  //     data: [45, 50, 40, 55, 60, 50, 65, 60, 70, 75, 4, 1],
  //     group: "completed",
  //   },
  // ];

  const tasksData = [
    {
      name: "Total Tasks",
      data: [45, 60, 50, 70, 65, 80, 90, 85, 75, 60, 55, 70],
    },
    {
      name: "Achieved Tasks",
      data: [30, 50, 40, 60, 50, 70, 80, 75, 65, 50, 45, 60],
    },
  ];

  const tasksOptions = {
    chart: {
      type: "bar",
      fontFamily: "Poppins-Regular",
      stacked: false,
      toolbar: { show: false },
      // events: {
      //   dataPointSelection: () => {
      //     navigate("/app/tasks");
      //   },
      // },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
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
      labels: {
        rotate: -45,
      },
    },
    yaxis: {
      title: {
        text: "Task Count",
      },
      max: 100,
    },
    legend: {
      position: "top",
    },
    fill: {
      opacity: 1,
    },
    colors: ["#54C4A7", "#EB5C45"], // Green for Total, Red for Achieved
    tooltip: {
      y: {
        formatter: (val) => `${val} tasks`,
      },
    },
  };

  // const options = {
  //   chart: {
  //     type: "bar",
  //     toolbar: { show: false },

  //     stacked: true,
  //     fontFamily: "Poppins-Regular, Arial, sans-serif",
  //     events: {
  //       dataPointSelection: () => {
  //         navigate("/app/tasks");
  //       },
  //     },
  //   },
  //   colors: ["#54C4A7", "#EB5C45"],
  //   plotOptions: {
  //     bar: {
  //       horizontal: false,
  //       columnWidth: "65%",
  //       borderRadius: 2,
  //       borderRadiusApplication: "none",
  //     },
  //   },
  //   dataLabels: {
  //     enabled: true, // Enable data labels
  //   },
  //   xaxis: {
  //     categories: [
  //       "Apr-24",
  //       "May-24",
  //       "Jun-24",
  //       "Jul-24",
  //       "Aug-24",
  //       "Sep-24",
  //       "Oct-24",
  //       "Nov-24",
  //       "Dec-24",
  //       "Jan-25",
  //       "Feb-25",
  //       "Mar-25",
  //     ],
  //     title: {
  //       text: "  ",
  //     },
  //   },
  //   yaxis: {
  //     max: 100,
  //     title: { text: "Assigned vs Completed" },
  //     labels: {
  //       formatter: (val) => `${Math.round(val)}`,
  //     },
  //   },
  //   fill: {
  //     opacity: 1,
  //   },
  //   legend: {
  //     show: true,
  //     position: "top",
  //   },

  //   tooltip: {
  //     y: {
  //       formatter: (val, { seriesIndex, dataPointIndex }) => {
  //         const rawData = rawSeries[seriesIndex]?.data[dataPointIndex];
  //         return `${rawData} Tasks`;
  //       },
  //     },
  //   },
  // };

  //-------------------Tasks vs Achievements graph--------------------//

  //--------------------Attendance Data---------------//
  const { data: attendanceData = [], isLoading: isAttendanceLoading } =
    useQuery({
      queryKey: ["attendance"],
      queryFn: async () => {
        try {
          const response = await axios.get("/api/company/company-attandances");
          return response.data;
        } catch (error) {
          throw new Error(error.response.data.message);
        }
      },
    });
  //--------------------Attendance Data---------------//

  //-----------------------Working Hours-------------------//
  const { companyAttandances = [], workingDays } = attendanceData;
  const averageAttendance = calculateAverageAttendance(
    companyAttandances,
    workingDays
  );
  const averageWorkingHours = calculateAverageDailyWorkingHours(
    companyAttandances,
    workingDays
  );
  //-----------------------Working Hours-------------------//

  const columns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "title", label: "Name", align: "left" },
    { id: "start", label: "Date", align: "left" },
    { id: "day", label: "Day", align: "left" },
  ];

  const { data: birthdays = [], isLoading } = useQuery({
    queryKey: ["birthdays"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/events/get-birthdays");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const dummyBirthdays = [
    { title: "Machindrath Parkar", start: "2025-04-16" },
    { title: "Faizan Shaikh", start: "2025-04-16" },
    { title: "Anne Fernandes", start: "2025-04-18" },
    { title: "Melisa Fernandes", start: "2025-04-20" },
    { title: "Allan Silveira", start: "2025-04-22" },
    { title: "Sankalp Kalangutkar", start: "2025-04-22" },
    { title: "Narshiva Naik", start: "2025-04-26" },
    { title: "Hema", start: "2025-04-30" },
  ];

  const columns2 = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "title", label: "Holiday/Event", align: "center" },
    { id: "start", label: "Date", align: "left" },
    { id: "day", label: "Day", align: "left" },
  ];

  const { data: holidayEvents = [] } = useQuery({
    queryKey: ["holidayEvents"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/events/all-events");
        const filteredEvents = response.data.filter(
          (event) => event.extendedProps.type !== "birthday"
        );
        return filteredEvents;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  // Calculate total and gender-specific counts
  const totalUsers = usersQuery.isLoading ? [] : usersQuery.data.length;

  const maleCount = usersQuery.isLoading
    ? []
    : usersQuery.data.filter((user) => user.gender === "Male").length;

  const femaleCount = usersQuery.isLoading
    ? []
    : usersQuery.data.filter((user) => user.gender === "Female").length;

  const genderData = [
    {
      id: 0,
      value: ((maleCount / totalUsers) * 100).toFixed(2),
      actualCount: maleCount,
      label: "Male",
      color: "#0056B3",
    },
    {
      id: 1,
      value: ((femaleCount / totalUsers) * 100).toFixed(2),
      actualCount: femaleCount,
      label: "Female",
      color: "#FD507E",
    },
  ];

  const genderPieChart = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => {
          navigate("employee/view-employees");
        },
      },
    },
    stroke: {
      show: true,
      width: 6, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    labels: ["Male", "Female"], // Labels for the pie slices
    colors: ["#0056B3", "#FD507E"], // Pass colors as an array
    dataLabels: {
      enabled: true,
      position: "center",
      style: {
        fontSize: "14px", // Adjust the font size of the labels
        fontWeight: "bold",
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: "#000",
        opacity: 0.45,
      },
      formatter: function (val) {
        return `${val.toFixed(0)}%`; // Show percentage value in the center
      },
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex }) {
        const item = genderData[seriesIndex]; // Use genderData to fetch the correct item
        return `
          <div style="padding: 5px; font-size: 12px;">
            ${item.label}: ${item.actualCount} employees
          </div>`;
      },
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
    },
  };

  const totalUtilised =
    hrFinance?.utilisedBudget?.reduce((acc, val) => acc + val, 0) || 0;

  //--------------------New Data card data -----------------------//
  const HrExpenses = {
    cardTitle: "Expenses",
    // timePeriod: "FY 2024-25",
    descriptionData: [
      {
        title: "FY 2024-25",
        value: `INR ${Math.round(totalUtilised).toLocaleString("en-IN")}`,
      },
      {
        title: "March 2025",
        value: "INR 27,00,000",
      },
      {
        title: "March 2025 Budget",
        value: "N/A",
      },
      { title: "Exit Head Count", value: "2" },
      { title: "Per Sq. Ft.", value: "810" },
    ],
  };

  const HrAverageExpense = {
    cardTitle: "Averages",
    // timePeriod: "FY 2024-25",
    descriptionData: [
      {
        title: "Annual Average Expense",
        value: `INR ${inrFormat(totalExpense / 12)}`,
      },
      {
        title: "Average Salary",
        value: "INR 60,000",
      },
      {
        title: "Average Head Count",
        value: "30",
      },
      {
        title: "Average Attendance",
        value: averageAttendance
          ? `${Number(averageAttendance).toFixed(0)}%`
          : "0%",
      },
      {
        title: "Average Hours",
        value: averageWorkingHours
          ? `${Number(averageWorkingHours) + 3.7}h`
          : "0h",
      },
    ],
  };
  //--------------------New Data card data -----------------------//

  //First pie-chart config data end

  //----------------------------------Second pie-chart config data start--------------------------------

  const cityData = {};

  usersQuery.data?.forEach((emp) => {
    let rawCity = emp?.homeAddress?.city || "Panaji";
    let normalizedCity = rawCity.trim().toLowerCase();
    let displayCity =
      normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1);

    cityData[displayCity] = (cityData[displayCity] || 0) + 1;
  });

  // Convert to array format suitable for PieChartMui
  const pieChartData = Object.entries(cityData).map(([city, count]) => ({
    label: city,
    value: count,
  }));

  const techGoaVisitorsOptions = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
    },
    labels: pieChartData.map((item) => item.label),
    colors: [
      "#1E3D73", // original
      "#34528A", // slightly lighter
      "#4A68A1", // medium shade
      "#608DB8", // lighter
      "#76A2CF", // even lighter
      "#8CB8E6", // lightest
    ],

    legend: {
      position: "right",
    },
    stroke: {
      show: true,
      width: 1, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return `${value} employee${value > 1 ? "s" : ""}`;
        },
      },
    },
  };

  const hrWidgets = [
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
          <WidgetSection
            normalCase
            layout={1}
            border
            padding
            titleLabel={"FY 2024-25"}
            // TitleAmount={"INR 23,13,365"}
            TitleAmount={`INR ${Math.round(totalUtilised).toLocaleString(
              "en-IN"
            )}`}
            title={"BIZ Nest HR DEPARTMENT EXPENSE"}
          >
            <BarGraph
              data={expenseRawSeries}
              options={expenseOptions}
              // departments={["Sales", "IT", "Tech", "Admin", "Maintainance"]}
              departments={["FY 2024-25", "FY 2025-26"]}
            />
          </WidgetSection>
        </Suspense>,
      ],
    },
    // {
    //   layout: 1,
    //   widgets: [
    //     <Suspense
    //       fallback={
    //         <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

    //           <Skeleton variant="text" width={200} height={30} />
    //           <Skeleton variant="rectangular" width="100%" height={300} />
    //         </Box>
    //       }>
    //       <WidgetSection
    //         layout={1}
    //         border
    //         title={"BIZ Nest HR DEPARTMENT  EXPENSE FY 2024-25"}
    //         // titleLabel={"FY 2024-25"}
    //       >
    //         {!isHrFinanceLoading ? (
    //           // <BudgetGraph
    //           //   utilisedData={hrFinance?.utilisedBudget}
    //           //   maxBudget={hrFinance?.projectedBudget}
    //           //   route={"finance/budget"}
    //           // />
    //           <HrExpenseGraph
    //             utilisedData={hrFinance?.utilisedBudget}
    //             maxBudget={hrFinance?.projectedBudget}
    //             route={"finance/budget"}
    //           />
    //         ) : (
    //           // <BarGraph
    //           //   height={400}
    //           //   data={averageBookingSeries}
    //           //   options={averageBookingOptions}
    //           // />
    //           <Skeleton variant="rectangular" width="100%" height={300} />
    //         )}
    //       </WidgetSection>
    //     </Suspense>,
    //   ],
    // },
    {
      layout: 2,
      widgets: [
        <FinanceCard titleCenter {...HrExpenses} />,
        <FinanceCard titleCenter {...HrAverageExpense} />,

        // <DataCard
        //   title="Average"
        //   data="25"
        //   description="Monthly Employees"
        //   route={"employee/view-employees"}
        // />,
        // <DataCard
        //   title="Average"
        //   data="4%"
        //   description="Monthly Attrition"
        //   route={"employee/view-employees"}
        // />,
        // !isAttendanceLoading ? (
        //   <DataCard
        //     title="Average"
        //     data={
        //       averageAttendance
        //         ? `${Number(averageAttendance).toFixed(0)}%`
        //         : "0%"
        //     }
        //     description="Attendance"
        //     route={"employee/view-employees"}
        //   />
        // ) : (
        //   <Skeleton variant="rectangular" width="100%" height={"100%"} />
        // ),
        // !isAttendanceLoading ? (
        //   <DataCard
        //     title="Average"
        //     data={averageWorkingHours ? `${averageWorkingHours}h` : "0h"}
        //     description="Working Hours"
        //     route={"employee/view-employees"}
        //   />
        // ) : (
        //   <Skeleton variant="rectangular" width="100%" height={"100%"} />
        // ),
      ],
    },
    {
      layout: 6,
      widgets: [
        { icon: <CgWebsite />, title: "Employee", route: "employee" },
        { icon: <LuHardDriveUpload />, title: "Company", route: "company" },
        { icon: <SiCashapp />, title: "Finance", route: "finance" },
        { icon: <CgWebsite />, title: "Mix Bag", route: "#" },
        { icon: <SiGoogleadsense />, title: "Data", route: "data" },
        {
          icon: <MdMiscellaneousServices />,
          title: "Settings",
          route: "settings/bulk-upload",
        },
      ]
        .filter((widget) => accessibleModules.has(widget.title)) // ✅ Filter widgets
        .map((widget, index) => (
          <Card
            key={index}
            icon={widget.icon}
            title={widget.title}
            route={widget.route}
          />
        )), // ✅ Convert objects into JSX elements
    },
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
          <WidgetSection
            layout={1}
            border
            padding
            titleLabel={"FY 2024-25"}
            title={"Department Wise KPA Vs Achievements "}
          >
            <BarGraph data={tasksData} options={tasksOptions} />
          </WidgetSection>
        </Suspense>,
      ],
    },
    {
      layout: 2,
      heading: "Site Visitor Analytics",
      widgets: [
        <WidgetSection title={"Employee Gender Distribution"} border>
          <PieChartMui
            percent={true} // Enable percentage display
            title={"Gender Distribution"}
            data={genderData} // Pass processed data
            options={genderPieChart}
          />
        </WidgetSection>,
        <WidgetSection layout={1} border title={"City Wise Employees"}>
          {!usersQuery.isLoading ? (
            <PieChartMui
              percent={true} // Enable percentage display
              data={pieChartData} // Pass processed data
              options={techGoaVisitorsOptions}
            />
          ) : (
            <Skeleton height={"100%"} width={"100%"} />
          )}
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        !isLoading ? (
          <MuiTable
            key={birthdays.length}
            Title="Current Months Birthday List"
            columns={columns}
            // rows={[
            //   ...[...dummyBirthdays, ...birthdays].map((bd, index) => ({
            //     id: index + 1,
            //     title: bd.title,
            //     start: new Date(bd.start).toLocaleDateString(),
            //   })),
            // ]}
            rows={[
              ...[...dummyBirthdays, ...birthdays].map((bd, index) => {
                const date = dayjs(bd.start);
                return {
                  id: index + 1,
                  title: bd.title,
                  start: date.format("DD-MM-YYYY"),
                  day: date.format("dddd"),
                };
              }),
            ]}
            // rowsToDisplay={3}
            scroll
          />
        ) : (
          <CircularProgress key="loading-spinner" />
        ),

        <MuiTable
          Title="Current Months Holiday List"
          columns={columns2}
          // rows={holidayEvents.map((holiday, index) => ({
          //   id: index + 1,
          //   title: holiday.title,
          //   start: new Date(holiday.start).toLocaleDateString(),
          // }))}
          rows={holidayEvents.map((holiday, index) => {
            const date = dayjs(holiday.start);
            return {
              id: index + 1,
              title: holiday.title,
              start: date.format("DD-MM-YYYY"),
              day: date.format("dddd"),
            };
          })}
          rowsToDisplay={5}
          scroll
        />,
      ],
    },
  ];

  return (
    <>
      <PayRollExpenseGraph />
      <div>
        {hrWidgets.map((widget, index) => (
          <div>
            <WidgetSection layout={widget.layout} key={index}>
              {widget.widgets}
            </WidgetSection>
          </div>
        ))}
      </div>
    </>
  );
};

export default HrDashboard;
