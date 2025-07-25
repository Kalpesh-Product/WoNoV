import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
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
import {
  setSelectedMonth,
  setTasksData,
  setTasksOverallData,
} from "../../../redux/slices/hrSlice";
import dateToHyphen from "../../../utils/dateToHyphen";
import LazyDashboardWidget from "../../../components/Optimization/LazyDashboardWidget";

import { PERMISSIONS } from "./../../../constants/permissions";

const HrDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();
  const dispatch = useDispatch();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("FY 2024-25");
  const [selectedHrFiscalYear, setSelectedHrFiscalYear] =
    useState("FY 2024-25");

  const [budgetData, setBudgetData] = useState({});
  const [totalSalary, setTotalSalary] = useState({});
  const tasksRawData = useSelector((state) => state.hr.tasksRawData);
  const tasksOverallRedux = useSelector((state) => state.hr.tasksOverallData);

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  //------------------------PAGE ACCESS START-------------------//
  const cardsConfig = [
    {
      route: "employee",
      title: "Employee",
      icon: <CgWebsite />,
      permission: PERMISSIONS.HR_EMPLOYEE.value,
    },
    {
      route: "company",
      title: "Company",
      icon: <LuHardDriveUpload />,
      permission: PERMISSIONS.HR_COMPANY.value,
    },
    {
      route: "finance",
      title: "Finance",
      icon: <SiCashapp />,
      permission: PERMISSIONS.HR_FINANCE.value,
    },
    {
      route: "mix-bag",
      title: "Mix Bag",
      icon: <CgWebsite />,
      permission: PERMISSIONS.HR_MIX_BAG.value,
    },
    {
      route: "data",
      title: "Data",
      icon: <SiGoogleadsense />,
      permission: PERMISSIONS.HR_DATA.value,
    },
    {
      route: "settings/bulk-upload",
      title: "Settings",
      icon: <MdMiscellaneousServices />,
      permission: PERMISSIONS.HR_SETTINGS.value,
    },
  ];

  const allowedCards = cardsConfig.filter(
    (card) => !card.permission || userPermissions.includes(card.permission)
  );
  //------------------------PAGE ACCESS END-------------------//

  const axios = useAxiosPrivate();

  const navigate = useNavigate();
  // const accessibleModules = new Set();

  // auth.user.permissions?.deptWisePermissions?.forEach((department) => {
  //   department.modules.forEach((module) => {
  //     const hasViewPermission = module.submodules.some((submodule) =>
  //       submodule.actions.includes("View")
  //     );

  //     if (hasViewPermission) {
  //       accessibleModules.add(module.moduleName);
  //     }
  //   });
  // });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        return response.data.filter((u) => u.isActive);
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
    keepPreviousData: true,
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
        return response.data?.allBudgets;
      } catch (error) {
        throw new Error("Error fetching data");
      }
    },
  });

  const hrBarData = transformBudgetData(!isHrFinanceLoading ? hrFinance : []);
  const totalExpense = hrBarData?.projectedBudget?.reduce(
    (sum, val) => sum + (val || 0),
    0
  );

  //--------------------HR BUDGET---------------------------//
  //------------------------Graph round functions-------------------//
  const expenseSeries = useMemo(() => {
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

  const maxExpenseValue = Math.max(
    ...expenseSeries.flatMap((series) => series.data)
  );
  const roundedMax = Math.ceil((maxExpenseValue + 100000) / 100000) * 100000;
  //------------------------Graph round functions-------------------//
  //--------------------HR BUDGET---------------------------//

  //-------------------HR Expense graph start--------------------//

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

  const selectedHrExpenseSeries = expenseRawSeries.find(
    (item) => item.group === selectedHrFiscalYear
  );

  const totalUtilised = useMemo(() => {
    if (!selectedHrExpenseSeries) return 0;
    return selectedHrExpenseSeries.data.reduce((sum, val) => sum + val, 0);
  }, [selectedHrExpenseSeries]);

  const march2025Expense = Math.round(
    expenseRawSeries.find((series) => series.group === selectedHrFiscalYear)
      ?.data?.[11] || 0
  );

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
      min: 0,
      max: roundedMax,
      tickAmount: 4,
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
          const response = await axios.get("/api/performance/get-kpa-tasks");
          const formattedData = response.data.map((dept) => ({
            ...dept,
            tasks: dept.tasks.map((task) => ({
              ...task,
              assignedDate: dateToHyphen(task.assignedDate),
              dueDate: dateToHyphen(task.dueDate),
            })),
          }));
          dispatch(setTasksData(formattedData));
          return response.data;
        } catch (error) {
          console.error(error);
        }
      },
    });

  const { data: tasksOverallData = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasksRawData"],
    queryFn: async () => {
      const response = await axios.get("api/tasks/get-tasks-summary");
      const formattedData = response.data.map((dept) => ({
        ...dept,
        department:
          typeof dept.department === "object"
            ? dept.department.name
            : dept.department,
        tasks: dept.tasks.map((task) => ({
          ...task,
          department:
            typeof task.department === "object"
              ? task.department.name
              : task.department,
          assignedDate: dateToHyphen(task.assignedDate),
          dueDate: dateToHyphen(task.dueDate),
        })),
      }));
      dispatch(setTasksOverallData(formattedData));
      return response.data;
    },
  });

  function getFiscalYearDateRange(fyString) {
    // Example: "FY 2024-25"
    const [startYearStr, endYearStr] = fyString.replace("FY ", "").split("-");
    const startYear = parseInt(startYearStr);
    const endYear = parseInt("20" + endYearStr); // Handles "25" as 2025

    const startDate = new Date(`${startYear}-04-01T00:00:00.000Z`);
    const endDate = new Date(`${endYear}-03-31T23:59:59.999Z`);

    return { startDate, endDate };
  }

  function getTasksForSelectedFiscalYear(departments, selectedFiscalYear) {
    if (selectedFiscalYear === "FY 2024-25") {
      return []; // Override to show zero tasks for FY 2024-25
    }

    const { startDate, endDate } = getFiscalYearDateRange(selectedFiscalYear);
    const filteredTasks = [];

    departments.forEach((dept) => {
      dept.tasks?.forEach((task) => {
        const dueDate = new Date(task.dueDate);
        if (dueDate >= startDate && dueDate <= endDate) {
          filteredTasks.push({
            ...task,
            department: dept.department,
          });
        }
      });
    });

    return filteredTasks;
  }
  const tasksForSelectedYear = getTasksForSelectedFiscalYear(
    departmentTasks,
    selectedFiscalYear
  );

  const overallTasksForYear = getTasksForSelectedFiscalYear(
    tasksOverallData,
    selectedFiscalYear
  );

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
  const departmentMonthlyTotals = {};
  const departmentMonthlyAchieved = {};
  fyMonths.forEach((m) => {
    departmentMonthlyTotals[m] = 0;
    departmentMonthlyAchieved[m] = 0;
  });

  if (Array.isArray(tasksRawData)) {
    tasksRawData.forEach((dept) => {
      dept.tasks?.forEach((task) => {
        const [day, month, year] = task.assignedDate.split("-").map(Number);
        const dateObj = new Date(year, month - 1, day);
        const fyMonth = fyMonths[(dateObj.getMonth() + 9) % 12];

        departmentMonthlyTotals[fyMonth]++;
        if (task.status === "Completed") {
          departmentMonthlyAchieved[fyMonth]++;
        }
      });
    });
  }

  const overallMonthlyTotals = {};
  const overallMonthlyAchieved = {};
  fyMonths.forEach((m) => {
    overallMonthlyTotals[m] = 0;
    overallMonthlyAchieved[m] = 0;
  });

  if (Array.isArray(tasksOverallRedux)) {
    tasksOverallRedux.forEach((dept) => {
      dept.tasks?.forEach((task) => {
        const [day, month, year] = task.assignedDate.split("-").map(Number);
        const dateObj = new Date(year, month - 1, day);
        const fyMonth = fyMonths[(dateObj.getMonth() + 9) % 12];

        overallMonthlyTotals[fyMonth]++;
        if (task.status === "Completed") {
          overallMonthlyAchieved[fyMonth]++;
        }
      });
    });
  }

  // Final structure
  const tasksData = [
    {
      name: "Completed KPA",
      group: "FY 2025-26",
      data: fyMonths.map((month) => {
        const total = departmentMonthlyTotals[month];
        const achieved = departmentMonthlyAchieved[month];
        const percent = total > 0 ? (achieved / total) * 100 : 0;
        return { x: month, y: +percent.toFixed(1), raw: achieved };
      }),
    },
    {
      name: "Remaining KPA",
      group: "FY 2025-26",
      data: fyMonths.map((month) => {
        const total = departmentMonthlyTotals[month];
        const achieved = departmentMonthlyAchieved[month];
        const remaining = total - achieved;
        const percent = total > 0 ? (remaining / total) * 100 : 0;
        return { x: month, y: +percent.toFixed(1), raw: remaining };
      }),
    },
  ];

  const tasksGraphData = [
    {
      name: "Completed Tasks",
      group: "FY 2025-26",
      data: fyMonths.map((month) => {
        const total = overallMonthlyTotals[month];
        const achieved = overallMonthlyAchieved[month];
        const percent = total > 0 ? (achieved / total) * 100 : 0;
        return { x: month, y: +percent.toFixed(1), raw: achieved };
      }),
    },
    {
      name: "Remaining Tasks",
      group: "FY 2025-26",
      data: fyMonths.map((month) => {
        const total = overallMonthlyTotals[month];
        const achieved = overallMonthlyAchieved[month];
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

          navigate(`overall-KPA`, {
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
              <div style="width:100px ">Total KPA </div>
              <div style="width:"100%" ">:</div>
              <div style="width:"100%" ">${total}</div>
            </div>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div style="width:100px ">Completed KPA</div>
              <div style="width:"100%" ">:</div>
              <div style="width:"100%" ">${completed}</div>
            </div>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
            <div style="display:flex ; justify-content:space-between ; width:"100%" ">
              <div style="width:100px ">Remaining KPA</div>
              <div style="width:"100%" ">:</div>
              <div style="width:"100%" ">${remaining}</div>
            </div>
           
          </div>
        `;
      },
    },
  };
  const tasksOverallOptions = {
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

          navigate(`overall-KPA/department-tasks`, {
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
  //------------------Birthdays----------//
  const getUpcomingBirthdays = (employeeList) => {
    const today = dayjs();

    return employeeList
      .filter((emp) => emp.dateOfBirth) // ✅ filter out if dateOfBirth is missing/null
      .map((emp) => {
        const birthDate = dayjs(emp.dateOfBirth);

        // Prevent invalid dates like Feb 29 on non-leap years
        const normalizedDate = dayjs(
          `${today.year()}-${birthDate.format("MM-DD")}`,
          "YYYY-MM-DD",
          true // strict parsing
        );

        if (!normalizedDate.isValid()) return null;

        return {
          title: `${emp.firstName} ${emp.lastName}`,
          start: normalizedDate.format("YYYY-MM-DD"),
        };
      })
      .filter((item) => {
        if (!item) return false; // skip nulls from invalid date handling
        const birthday = dayjs(item.start);
        return birthday.month() === today.month(); // current month only
      });
  };

  const birthdays = getUpcomingBirthdays(
    usersQuery.isLoading ? [] : usersQuery.data
  );

  //------------------Birthdays----------//

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
        const response = await axios.get(
          "/api/events/all-events?thisMonth=true"
        );
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
  const totalUsers = usersQuery.isLoading ? [] : usersQuery?.data?.length;

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
          navigate("employee/employee-list");
        },
      },
    },
    stroke: {
      show: true,
      width: 1, // Increase for more "gap"
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

  const budgetBar = useMemo(() => {
    if (isHrFinanceLoading || !Array.isArray(hrFinance)) return null;
    const data = transformBudgetData(hrFinance);
    setBudgetData(data);
    return data;
  }, [isHrFinanceLoading, hrFinance]);

  // const totalUtilised =
  //   budgetBar?.[selectedFiscalYear]?.utilisedBudget?.reduce(
  //     (acc, val) => acc + val,
  //     0
  //   ) || 0;

  //Salary calculation

  const totalEmployees = useQuery.isLoading ? [] : usersQuery?.data?.length;
  const salaryExpense = isHrFinanceLoading
    ? []
    : hrFinance.filter((item) => item.expanseType === "SALARY EXPENSES");

  const salaryBar = useMemo(() => {
    if (isHrFinanceLoading || !Array.isArray(hrFinance)) return null;
    const data = transformBudgetData(salaryExpense);
    setBudgetData(data);
    return data;
  }, [isHrFinanceLoading, hrFinance]);

  // const totalSalary =
  //   salaryBar?.[selectedFiscalYear]?.utilisedBudget?.reduce(
  //     (acc, val) => acc + val,
  //     0
  //   ) || 0;

  const lastUtilisedValue = hrBarData?.utilisedBudget?.at(-1) || 0;

  //------------------- UnitData -----------------------//
  const { data: unitsData = [], isPending: isUnitsPending } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");

        return response.data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  const totalSqft = unitsData
    .filter((item) => item.isActive === true)
    .reduce((sum, item) => (item.sqft || 0) + sum, 0);
  //--------------------UnitData -----------------------//
  //--------------------New Data card data -----------------------//

  const HrExpenses = {
    cardTitle: "Expenses",
    // timePeriod: "FY 2024-25",
    descriptionData: [
      {
        title: `${selectedHrFiscalYear}`,
        // value: `INR ${Math.round(totalUtilised).toLocaleString("en-IN")}`,
        value: `INR ${inrFormat(totalUtilised)}`,
        route: "finance",
      },
      {
        title: `${
          selectedHrFiscalYear === "FY 2024-25" ? "March 2025" : "March 2026"
        }`,
        value: `INR ${inrFormat(march2025Expense)}`,
        route: "finance",
      },
      {
        title: `${
          selectedHrFiscalYear === "FY 2024-25"
            ? "March 2025 Budget"
            : "March 2026 Budget"
        }`,
        // value: "N/A",
        value: `INR ${inrFormat(march2025Expense)}`,
        route: "finance",
      },
      {
        title: "Exit Head Count",
        value: "2",
        route: "employee/employee-list",
      },
      {
        title: "Per Sq. Ft.",
        value: `INR ${inrFormat(totalUtilised / totalSqft)}`,
        route: "finance",
      },
    ],
  };

  const HrAverageExpense = {
    cardTitle: "Averages",
    // timePeriod: "FY 2024-25",
    descriptionData: [
      {
        title: "Annual Average Expense",
        // value: `INR ${inrFormat(totalExpense / 12)}`,
        value: `INR ${inrFormat(totalUtilised / 12)}`,
        route: "finance",
      },
      {
        title: "Average Salary",
        value: `INR ${inrFormat(totalSalary / totalEmployees)}`,
        route: "employee/employee-list",
      },
      {
        title: "Average Head Count",
        value: "30",
        route: "employee/employee-list",
      },
      {
        title: "Average Attendance",
        route: "employee/attendance",
        value: averageAttendance
          ? `${(Number(averageAttendance) - 55).toFixed(0)}%`
          : "0%",
      },
      {
        title: "Average Hours",
        route: "employee/attendance",
        value: averageWorkingHours
          ? `${(Number(averageWorkingHours) / 30).toFixed(2)}h`
          : "0h",
      },
    ],
  };
  //--------------------New Data card data -----------------------//

  //First pie-chart config data end

  //----------------------------------Second pie-chart config data start--------------------------------

  const cityData = {};

  usersQuery.data?.forEach((emp) => {
    let rawCity = emp?.homeAddress?.city || "Others";
    let normalizedCity = rawCity.trim().toLowerCase();
    let displayCity =
      normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1);

    cityData[displayCity] = (cityData[displayCity] || 0) + 1;
  });

  // 🔁 Group small-count cities into 'Others'
  const processedCityData = {};
  let othersCount = 0;

  Object.entries(cityData).forEach(([city, count]) => {
    if (count <= 1) {
      othersCount += count;
    } else {
      processedCityData[city] = count;
    }
  });

  if (othersCount > 0) {
    processedCityData["Others"] =
      (processedCityData["Others"] || 0) + othersCount;
  }

  // ✅ Convert to array for PieChartMui
  const pieChartData = Object.entries(processedCityData).map(
    ([city, count]) => ({
      label: city,
      value: count,
    })
  );

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
          }>
          <WidgetSection normalCase layout={1} padding>
            <YearlyGraph
              data={expenseRawSeries}
              responsiveResize
              chartId={"bargraph-hr-expense"}
              options={expenseOptions}
              title={`BIZ Nest HR DEPARTMENT EXPENSE`}
              titleAmount={`INR ${inrFormat(totalUtilised)}`}
              onYearChange={setSelectedHrFiscalYear}
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
    // {
    //   layout: 6,
    //   widgets: [
    //     { icon: <CgWebsite />, title: "Employee", route: "employee" },
    //     { icon: <LuHardDriveUpload />, title: "Company", route: "company" },
    //     { icon: <SiCashapp />, title: "Finance", route: "finance" },
    //     { icon: <CgWebsite />, title: "Mix Bag", route: "mix-bag" },
    //     { icon: <SiGoogleadsense />, title: "Data", route: "data" },
    //     {
    //       icon: <MdMiscellaneousServices />,
    //       title: "Settings",
    //       route: "settings/bulk-upload",
    //     },
    //   ]
    //     // .filter((widget) => accessibleModules.has(widget.title)) // ✅ Filter widgets
    //     .map((widget, index) => (
    //       <Card
    //         key={index}
    //         icon={widget.icon}
    //         title={widget.title}
    //         route={widget.route}
    //       />
    //     )), // ✅ Convert objects into JSX elements
    // },
    {
      layout: allowedCards.length, // ✅ dynamic layout
      widgets: allowedCards.map((card) => (
        <Card
          key={card.title}
          route={card.route}
          title={card.title}
          icon={card.icon}
        />
      )),
    },
    {
      layout: 2,
      widgets: [
        <Suspense
          fallback={
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Simulating chart skeleton */}
              <Skeleton variant="text" width={200} height={30} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </Box>
          }>
          <YearlyGraph
            data={tasksData}
            options={tasksOptions}
            title={"ANNUAL KPA VS ACHIEVEMENTS"}
            titleAmount={`TOTAL KPA : ${tasksForSelectedYear.length || 0}`}
            secondParam
            currentYear={true}
            onYearChange={setSelectedFiscalYear}
          />
        </Suspense>,
        <Suspense
          fallback={
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Simulating chart skeleton */}
              <Skeleton variant="text" width={200} height={30} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </Box>
          }>
          <YearlyGraph
            data={tasksGraphData}
            options={tasksOverallOptions}
            title={"ANNUAL TASKS VS ACHIEVEMENTS"}
            titleAmount={`TOTAL TASKS : ${overallTasksForYear.length || 0}`}
            secondParam
            currentYear={true}
            onYearChange={setSelectedFiscalYear}
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
            // height={"100%"}
            // width={"100%"}
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
        !usersQuery.isLoading ? (
          <MuiTable
            key={birthdays.length}
            Title="Current Month's Birthday List"
            columns={columns}
            rows={birthdays
              .filter((bd) => bd.start) // Only entries with a start date
              .map((bd, index) => {
                const date = dayjs(bd.start);
                return {
                  id: index + 1,
                  title: bd.title,
                  start: date.format("DD-MM-YYYY"),
                  day: date.format("dddd"),
                };
              })}
            rowsToDisplay={40}
            scroll={true}
            className="h-full"
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
          rowsToDisplay={40}
          scroll={true}
          className="h-full"
        />,
      ],
    },
  ];

  useEffect(() => {
    if (!isHrFinanceLoading && Array.isArray(hrFinance)) {
      const data = transformBudgetData(hrFinance);
      const utilised = data?.[selectedFiscalYear]?.utilisedBudget?.reduce(
        (a, b) => a + b,
        0
      );

      //Salary calculation
      const salary = transformBudgetData(salaryExpense);
      const utilisedSalary = salary?.[
        selectedFiscalYear
      ]?.utilisedBudget?.reduce((a, b) => a + b, 0);
      setTotalSalary(utilisedSalary);
    }
  }, [isHrFinanceLoading, hrFinance]);

  return (
    <>
      <div>
        <div className="flex flex-col gap-4">
          {hrWidgets.map((widget, index) => (
            <LazyDashboardWidget
              key={index}
              layout={widget.layout}
              widgets={widget.widgets}
            />
            // <WidgetSection key={index} layout={widget?.layout}>
            //   {widget?.widgets}
            // </WidgetSection>
          ))}
        </div>
      </div>
    </>
  );
};

export default HrDashboard;
