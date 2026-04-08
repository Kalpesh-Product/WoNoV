import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
//import PageFrame from "../../components/Pages/PageFrame";
import WidgetSection from "../../components/WidgetSection";
import YearlyGraph from "../../components/graphs/YearlyGraph";
import PieChartMui from "../../components/graphs/PieChartMui";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
//import { useDispatch } from "react-redux";
import Card from "../../components/Card";
import { CgWebsite } from "react-icons/cg";
import useAuth from "../../hooks/useAuth";
import { PERMISSIONS } from "../../constants/permissions";

const FISCAL_MONTHS = [
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

const PIE_COLORS = ["#54C4A7", "#EB5C45"];
const toCount = (value) => Number(value) || 0;

const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    monthName: now.toLocaleString("en-US", { month: "long" }),
    year: now.getFullYear(),
  };
};


const PerformanceHome = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const [currentMonthYear, setCurrentMonthYear] = useState(getCurrentMonthYear);

  useEffect(() => {
    const now = new Date();
    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0,
    );

    const timeoutMs = Math.max(nextMonthStart.getTime() - now.getTime(), 1000);

    const timeoutId = setTimeout(() => {
      setCurrentMonthYear(getCurrentMonthYear());
    }, timeoutMs);

    return () => clearTimeout(timeoutId);
  }, [currentMonthYear]);

  const hasPermission = (permission) =>
    userPermissions.includes(permission.value);
  const currentMonthLabel = currentMonthYear.monthName;

  const { data: fetchedDepartments = [] } = useQuery({
      queryKey: ["performanceDepartments", currentMonthYear.monthName],
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-depts-tasks", {
        params: { month: currentMonthYear.monthName },
      });
      return response.data || [];
    },
  });

  const { data: kpaTasksRaw = [] } = useQuery({
    queryKey: ["performanceKpaTasks"],
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-kpa-tasks");
      return response.data || [];
    },
  });


  const { data: completedKraByDepartment = {} } = useQuery({
    queryKey: [
      "performanceCompletedKraByDepartment",
      fetchedDepartments.map((item) => item?.department?._id).filter(Boolean),
      currentMonthYear.monthName,
      currentMonthYear.year,
    ],
    enabled: fetchedDepartments.length > 0,
    queryFn: async () => {
      const departmentIds = fetchedDepartments
        .map((item) => item?.department?._id)
        .filter(Boolean);

      const completedByDeptEntries = await Promise.all(
        departmentIds.map(async (departmentId) => {
          const [kraRes, teamKraRes, individualKraRes] = await Promise.all([
            axios.get("/api/performance/get-completed-tasks", {
               params: {
                dept: departmentId,
                type: "KRA",
                month: currentMonthYear.monthName,
                year: currentMonthYear.year,
              },
            }),
            axios.get("/api/performance/get-completed-tasks", {
              params: {
                dept: departmentId,
                type: "TEAMKRA",
                month: currentMonthYear.monthName,
                year: currentMonthYear.year,
              },
            }),
            axios.get("/api/performance/get-completed-tasks", {
              params: {
                dept: departmentId,
                type: "INDIVIDUALKRA",
                month: currentMonthYear.monthName,
                year: currentMonthYear.year,
              },
            }),
          ]);

          const completedCount =
            (kraRes.data?.length || 0) +
            (teamKraRes.data?.length || 0) +
            (individualKraRes.data?.length || 0);

          return [departmentId, completedCount];
        })
      );

      return Object.fromEntries(completedByDeptEntries);
    },
  });


  const annualKpaGraphData = useMemo(() => {
      const fyTaskMap = {};
    const today = new Date();
    const currentFyStartYear =
      today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;

    kpaTasksRaw.forEach((departmentTasks) => {
      departmentTasks?.tasks?.forEach((task) => {
        if (!task?.assignedDate) return;

        const taskDate = new Date(task.assignedDate);
        if (Number.isNaN(taskDate.getTime())) return;

                const fyStartYear =
          taskDate.getMonth() >= 3 ? taskDate.getFullYear() : taskDate.getFullYear() - 1;
        const fiscalMonthIndex = (taskDate.getMonth() + 9) % 12;

        if (!fyTaskMap[fyStartYear]) {
          fyTaskMap[fyStartYear] = {
            total: Array(12).fill(0),
            achieved: Array(12).fill(0),
          };
        }

        fyTaskMap[fyStartYear].total[fiscalMonthIndex] += 1;

        if (task.status === "Completed") {
            fyTaskMap[fyStartYear].achieved[fiscalMonthIndex] += 1;
        }
      });
    });

     const fyStartYears = Object.keys(fyTaskMap).length
      ? Object.keys(fyTaskMap).map(Number).sort((a, b) => a - b)
      : [currentFyStartYear];

    return fyStartYears.flatMap((fyStartYear) => {
      const fiscalYearLabel = `FY ${fyStartYear}-${String(fyStartYear + 1).slice(-2)}`;
      const yearData = fyTaskMap[fyStartYear] || {
        total: Array(12).fill(0),
        achieved: Array(12).fill(0),
      };

      return [
        {
          name: "Completed KPA",
          group: fiscalYearLabel,
          data: FISCAL_MONTHS.map((month, index) => {
            const total = yearData.total[index];
            const achieved = yearData.achieved[index];
            const percent = total > 0 ? (achieved / total) * 100 : 0;
            return { x: month, y: +percent.toFixed(1), raw: achieved };
          }),
        },
        {
          name: "Remaining KPA",
          group: fiscalYearLabel,
          data: FISCAL_MONTHS.map((month, index) => {
            const total = yearData.total[index];
            const achieved = yearData.achieved[index];
            const remaining = total - achieved;
            const percent = total > 0 ? (remaining / total) * 100 : 0;
            return { x: month, y: +percent.toFixed(1), raw: remaining };
          }),
        },
      ];
    });
  }, [kpaTasksRaw]);

  const annualKpaChartOptions = {
    chart: {
      type: "bar",
      stacked: true,
      animations: { enabled: false },
      fontFamily: "Poppins-Regular",
      toolbar: { show: false },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const clickedMonth =
            config.w.config.series[config.seriesIndex].data[config.dataPointIndex].x;

            navigate("/app/performance/overall-department-kpa", {
            state: { month: clickedMonth },
          });
        },
      },
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
    colors: PIE_COLORS,
  };


  const kpaPieData = useMemo(() => {
     const hasMatchingAssignedMonth = (assignedDate) => {
      if (!assignedDate) return false;

      const parsedDate = new Date(assignedDate);
      if (Number.isNaN(parsedDate.getTime())) return false;

      return (
        parsedDate.toLocaleString("en-US", { month: "long" }) ===
          currentMonthYear.monthName &&
        parsedDate.getFullYear() === currentMonthYear.year
      );
    };

    const completed = kpaTasksRaw.reduce(
      (acc, dept) =>
        acc +
        (dept?.tasks || []).filter(
          (task) =>
            task?.status === "Completed" &&
            hasMatchingAssignedMonth(task?.assignedDate),
        ).length,
      0,
    );

    const total = kpaTasksRaw.reduce(
      (acc, dept) =>
        acc +
        (dept?.tasks || []).filter((task) =>
          hasMatchingAssignedMonth(task?.assignedDate),
        ).length,
      0,
    );
    const pending = Math.max(total - completed, 0);

    return [
      { label: "Completed KPA", value: completed },
      { label: "Pending KPA", value: pending },
    ];
   }, [kpaTasksRaw, currentMonthYear]);

  const kraPieData = useMemo(() => {
    const completed = fetchedDepartments.reduce(
      (acc, dept) =>
        acc + toCount(completedKraByDepartment[dept?.department?._id]),
      0
    );
    const assigned = fetchedDepartments.reduce(
      (acc, dept) =>
        acc +
        (toCount(dept.dailyKRA) +
          toCount(dept.teamDailyKRA) +
          toCount(dept.individualDailyKRA)),
      0
    );
    const pending = Math.max(assigned - completed, 0);

    return [
      { label: "Completed KRA", value: completed },
      { label: "Pending KRA", value: pending },
    ];
  }, [fetchedDepartments, completedKraByDepartment]);

  const pieOptions = (labels) => ({
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
      toolbar: { show: false },
    },
    labels,
    colors: PIE_COLORS,
    stroke: {
      show: true,
      width: 1,
      colors: ["#ffffff"],
    },
    legend: {
      position: "bottom",
    },
  });

   const canAccessDepartmentWiseCard =
    hasPermission(PERMISSIONS.PERFORMANCE_DEPARTMENT_WISE_KRA_KPA) ||
    hasPermission(PERMISSIONS.PERFORMANCE_OVERALL_DEPARTMENT_WISE_KPA) ||
    hasPermission(PERMISSIONS.PERFORMANCE_OVERALL_DEPARTMENT_WISE_KRA);


   const performanceCards = [
    {
      title: "DEPARTMENT WISE KRA/KPA",
      route: "/app/performance/department-wise",
      hasAccess: canAccessDepartmentWiseCard,
    },
    {
      title: "ASSIGN KRA/KPA",
      route: "/app/performance/assign-kra-kpa",
       hasAccess: hasPermission(PERMISSIONS.PERFORMANCE_ASSIGN_KRA_KPA),
    },
    {
      title: "Report KRA/KPA",
      route: "/app/performance/report-kra-kpa",
       hasAccess: hasPermission(PERMISSIONS.PERFORMANCE_REPORT_KRA_KPA),
    },
  ].filter((card) => card.hasAccess);

    const getCardGridClass = () => {
    if (performanceCards.length >= 3) {
      return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
    }

    if (performanceCards.length === 2) {
      return "grid-cols-1 md:grid-cols-2 xl:grid-cols-2";
    }

    return "grid-cols-1 md:grid-cols-1 xl:grid-cols-1";
  };


  return (
    <div className="flex flex-col gap-4">
      {hasPermission(PERMISSIONS.PERFORMANCE_ANNUAL_KPA_VS_ACHIEVEMENTS) && (
        <YearlyGraph
          data={annualKpaGraphData}
          options={annualKpaChartOptions}
          title="ANNUAL KPA VS ACHIEVEMENTS"
          titleAmount={`TOTAL KPA : ${kpaPieData[0].value + kpaPieData[1].value}`}
          secondParam
          currentYear

        />
        )}
      {performanceCards.length > 0 && (
        <div className={`grid ${getCardGridClass()} gap-4 auto-rows-fr`}>
          {performanceCards.map((card) => (
            <div key={card.route} className="h-full">
              <Card
                icon={<CgWebsite />}
                title={card.title}
                route={card.route}
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hasPermission(PERMISSIONS.PERFORMANCE_KRA_PENDING_VS_COMPLETED) && (
         <WidgetSection
            border
            title={`KRA - Pending vs Completed - ${currentMonthLabel}`}
          >
            <PieChartMui
              data={kraPieData}
              options={pieOptions(kraPieData.map((item) => item.label))}
              centerAlign
            />
          </WidgetSection>
        )}

        {hasPermission(PERMISSIONS.PERFORMANCE_KPA_PENDING_VS_COMPLETED) && (
           <WidgetSection
            border
            title={`KPA - Pending vs Completed - ${currentMonthLabel}`}
          >
            <PieChartMui
              data={kpaPieData}
              options={pieOptions(kpaPieData.map((item) => item.label))}
              centerAlign
            />
          </WidgetSection>
        )}
      </div>
    </div>

  );
};

export default PerformanceHome;