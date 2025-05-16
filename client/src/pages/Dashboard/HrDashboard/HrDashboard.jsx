import React, { lazy, Suspense, useEffect } from "react";
import WidgetSection from "../../../components/WidgetSection";
import Card from "../../../components/Card";
import { LuHardDriveUpload } from "react-icons/lu";
import { Skeleton, Box, CircularProgress } from "@mui/material";
import { CgWebsite } from "react-icons/cg";
import { SiCashapp } from "react-icons/si";
import { SiGoogleadsense } from "react-icons/si";
import { MdMiscellaneousServices } from "react-icons/md";
import PayRollExpenseGraph from "../../../components/HrDashboardGraph/PayRollExpenseGraph";
import MuiTable from "../../../components/Tables/MuiTable";
import PieChartMui from "../../../components/graphs/PieChartMui";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { inrFormat } from "../../../utils/currencyFormat";
import { useSidebar } from "../../../context/SideBarContext";
import { transformBudgetData } from "../../../utils/transformBudgetData";
import { calculateAverageAttendance } from "../../../utils/calculateAverageAttendance ";
import { calculateAverageDailyWorkingHours } from "../../../utils/calculateAverageDailyWorkingHours ";
import FinanceCard from "../../../components/FinanceCard";
import dayjs from "dayjs";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedMonth, setTasksData } from "../../../redux/slices/hrSlice";
import dateToHyphen from "../../../utils/dateToHyphen";

const HrDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();
  const dispatch = useDispatch();
  const tasksRawData = useSelector((state) => state.hr.tasksRawData);

  useEffect(()=>{console.log("TASKS FROM REDUX : ", tasksRawData)}, [tasksRawData])

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
  //--------------------HR BUDGET---------------------------//

  //-------------------HR Expense graph start--------------------//

  const expenseRawSeries = [
    {
      name: "Expense",
      group: "FY 2024-25",
      data: hrFinance?.utilisedBudget,
    },
    {
      name: "Expense",
      group: "FY 2025-26",
      data: [1000054, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ];

  const expenseOptions = {
    chart: {
      type: "bar",
      animations: { enabled: false },
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
      // formatter: (val) => {
      //   const scaled = Math.round((val / 100000) * 100) / 100;
      //   return Number.isInteger(scaled) ? scaled.toFixed(0) : scaled.toFixed(2);
      // },

      // formatter: (val) => {
      //   return val.toLocaleString("en-IN"); // Formats number with commas (Indian style)
      // },
      formatter: (val) => {
        return Math.round(val).toLocaleString("en-IN");
      },

      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
      offsetY: -22,
    },
    xaxis: {
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
      enabled: false,
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

  const { data: departmentTasks = [], isLoading: isDepartmentLoading } =
    useQuery({
      queryKey: ["departmentTasks"],
      queryFn: async () => {
        try {
          const response = await axios.get("/api/tasks/get-kpa-tasks");
          const formattedData = response.data.map((dept) => ({
            ...dept,
            tasks: dept.tasks.map((task) => ({
              ...task,
              assignedDate: dateToHyphen(task.assignedDate),
              dueDate: dateToHyphen(task.dueDate),
            })),
          }));
          dispatch(setTasksData(formattedData));
          return formattedData;
        } catch (error) {
          console.error(error);
        }
      },
    });

  // Month names in financial year order (Apr to Mar)
  const fyMonths = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
  ];


  // Init counters
  const monthlyTotals = {};
  const monthlyAchieved = {};
  fyMonths.forEach((month) => {
    monthlyTotals[month] = 0;
    monthlyAchieved[month] = 0;
  });

  tasksRawData.forEach((dept) => {
    dept.tasks.forEach((task) => {
      const [day, month, year] = task.assignedDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day); // JS months are 0-indexed

      // Determine FY month name
      const monthIndex = dateObj.getMonth(); // 0 to 11
      const fyMonth = fyMonths[(dateObj.getMonth() + 9) % 12]; // shift Jan=9, Feb=10, Mar=11

      monthlyTotals[fyMonth]++;
      if (task.status === "Completed") {
        monthlyAchieved[fyMonth]++;
      }
    });
  });

  // Final structure
  const tasksData = [
    {
      name: "Completed Tasks",
      group: "FY 2025-26",
      data: fyMonths.map((month) => {
        const total = monthlyTotals[month];
        const achieved = monthlyAchieved[month];
        const percent = total > 0 ? (achieved / total) * 100 : 0;
        return { x: month, y: +percent.toFixed(1), raw: achieved };
      }),
    },
    {
      name: "Remaining Tasks",
      group: "FY 2025-26",
      data: fyMonths.map((month) => {
        const total = monthlyTotals[month];
        const achieved = monthlyAchieved[month];
        const remaining = total - achieved;
        const percent = total > 0 ? (remaining / total) * 100 : 0;
        return { x: month, y: +percent.toFixed(1), raw: remaining };
      }),
    },
  ];

  const tasksOptions = {
    chart: {
      type: "bar",
      stacked: true, // ✅ Enable stacking
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const clickedMonth =
            config.w.config.series[config.seriesIndex].data[
              config.dataPointIndex
            ].x;

          dispatch(setSelectedMonth(clickedMonth));

          const selectedMonthTasks = [];
          tasksRawData.forEach((dept) => {
            dept.tasks.forEach((task) => {
              const [day, month, year] = task.assignedDate
                .split("-")
                .map(Number);
              const taskDate = new Date(year, month - 1, day);
              const taskMonth = fyMonths[(taskDate.getMonth() + 9) % 12];

              if (taskMonth === clickedMonth) {
                selectedMonthTasks.push({
                  department: dept.department,
                  ...task,
                });
              }
            });
          });

          navigate(`overall-tasks`, {
            state: {
              month: clickedMonth,
              tasks: selectedMonthTasks,
            },
          });
        },
      },
      animations: { enabled: false },
      fontFamily: "Poppins-Regular",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 1,
      colors: ["#fff"],
    },
    yaxis: {
      title: { text: "Completion (%)" },
      max: 100,
      labels: { formatter: (val) => `${val.toFixed(0)}%` },
    },
    legend: {
      position: "top",
    },
    fill: {
      opacity: 1,
    },
    colors: ["#54C4A7", "#EB5C45"],
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const month = w.config.series[seriesIndex].data[dataPointIndex].x;

        const completed = w.config.series[0].data[dataPointIndex].raw;
        const remaining = w.config.series[1].data[dataPointIndex].raw;
        const total = completed + remaining;

        return `
          <div style="padding:8px; font-family: Poppins, sans-serif; font-size: 13px; width : 200px ">
            <strong>${month}</strong><br/>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div style="width:100px ">Total tasks </div>
              <div style="width:"100%" ">:</div>
              <div style="width:"100%" ">${total}</div>
            </div>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div style="width:100px ">Completed tasks</div>
              <div style="width:"100%" ">:</div>
              <div style="width:"100%" ">${completed}</div>
            </div>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div style="width:100px ">Remaining tasks</div>
              <div style="width:"100%" ">:</div>
              <div style="width:"100%" ">${remaining}</div>
            </div>
           
          </div>
        `;
      },
    },
  };

  const totalTasksCount = tasksRawData.reduce((sum, dept) => {
    return sum + dept.tasks.length;
  }, 0);

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
      custom: function ({ seriesIndex }) {
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

  const lastUtilisedValue = hrFinance?.utilisedBudget?.at(-1) || 0;

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
        value: `INR ${Math.round(lastUtilisedValue).toLocaleString("en-IN")}`,
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
          ? `${(Number(averageAttendance) - 55).toFixed(0)}%`
          : "0%",
      },
      {
        title: "Average Hours",
        value: averageWorkingHours
          ? `${(Number(averageWorkingHours) / 30 + 3.4).toFixed(2)}h`
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
          <WidgetSection normalCase layout={1} padding>
            <YearlyGraph
              data={expenseRawSeries}
              responsiveResize
              chartId={"bargraph-hr-expense"}
              options={expenseOptions}
              title={"BIZ Nest HR DEPARTMENT EXPENSE"}
              titleAmount={`INR ${Math.round(totalUtilised).toLocaleString(
                "en-IN"
              )}`}
            />
          </WidgetSection>
        </Suspense>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <FinanceCard titleCenter {...HrExpenses} />,
        <FinanceCard titleCenter {...HrAverageExpense} />,
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
          <YearlyGraph
            data={tasksData}
            options={tasksOptions}
            title={"ANNUAL KPA VS ACHIEVEMENTS"}
            titleAmount={`TOTAL TASKS : ${totalTasksCount || 0}`}
            secondParam
          />
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
            height={360}
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
            scroll
          />
        ) : (
          <CircularProgress key="loading-spinner" />
        ),

        <MuiTable
          Title="Current Months Holiday List"
          columns={columns2}
          rows={holidayEvents.map((holiday, index) => {
            const date = dayjs(holiday.start);
            return {
              id: index + 1,
              title: holiday.title,
              start: date.format("DD-MM-YYYY"),
              day: date.format("dddd"),
            };
          })}
          rowsToDisplay={10}
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
