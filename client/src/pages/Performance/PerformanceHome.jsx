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
import { toIndividualKpaTask } from "./kraKpaIndividualKpaAdapter";

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
const toLocalIsoDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCurrentDateInfo = () => {
  const now = new Date();
  return {
    day: now.getDate(),
    month: now.getMonth(),
    monthName: now.toLocaleString("en-US", { month: "long" }),
    year: now.getFullYear(),
    dateKey: toLocalIsoDate(now),
    dateLabel: now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
};

const PerformanceHome = ({ onlyFirstTwoCards = false }) => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const modulePath = onlyFirstTwoCards ? "/app/kra-kpa" : "/app/performance";
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const roleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
  const hasOverallPerformanceAccess = roleTitles.some((roleTitle) =>
    ["master admin", "super admin"].includes(roleTitle),
  );
  const [currentDateInfo, setCurrentDateInfo] = useState(getCurrentDateInfo);
   const [selectedFiscalYear, setSelectedFiscalYear] = useState(() => {
    const now = new Date();
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `FY ${fyStartYear}-${String(fyStartYear + 1).slice(-2)}`;
  });

   useEffect(() => {
    const now = new Date();
    const nextDayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0,
    );

      const timeoutMs = Math.max(nextDayStart.getTime() - now.getTime(), 1000);

        const timeoutId = setTimeout(() => {
      setCurrentDateInfo(getCurrentDateInfo());
    }, timeoutMs);

    return () => clearTimeout(timeoutId);
  }, [currentDateInfo]);

  const hasPermission = (permission) =>
    userPermissions.includes(permission.value);
  const currentMonthLabel = currentDateInfo.monthName;

  const { data: fetchedDepartments = [] } = useQuery({
      queryKey: ["performanceDepartments", currentDateInfo.monthName],
    enabled: !onlyFirstTwoCards,
    refetchInterval: 5 * 60 * 1000,
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-depts-tasks", {
        params: { month: currentDateInfo.monthName },
      });
      return response.data || [];
    },
  });

  const { data: kpaTasksRaw = [] } = useQuery({
    queryKey: [onlyFirstTwoCards ? "kraKpaKpaOverview" : "performanceKpaTasks"],
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-kpa-tasks");
      const departmentTasks = response.data || [];
      if (!onlyFirstTwoCards) return departmentTasks;

      const individualResponse = await axios.get("/api/kra-kpa/individual-monthly-kpa");
      const groups = new Map(departmentTasks.map((group) => [
        group.department,
        { ...group, tasks: [...(group.tasks || [])] },
      ]));
      (individualResponse.data || []).forEach((record) => {
        const departmentName = record.department?.name;
        if (!departmentName) return;
        if (!groups.has(departmentName)) {
          groups.set(departmentName, { department: departmentName, tasks: [] });
        }
        groups.get(departmentName).tasks.push(toIndividualKpaTask(record));
      });
      return [...groups.values()];
    },
  });

  const normalizeName = (value) =>
    (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();

  const visibleKpaTasksRaw = useMemo(() => {
    if (hasOverallPerformanceAccess) return kpaTasksRaw;

    const allowedDepartmentNames = new Set(
      (auth?.user?.departments || [])
        .map((dept) => normalizeName(dept?.name))
        .filter(Boolean),
    );

    if (allowedDepartmentNames.size === 0) return [];

    return (kpaTasksRaw || []).filter((departmentTasks) =>
      allowedDepartmentNames.has(normalizeName(departmentTasks?.department)),
    );
  }, [auth?.user?.departments, hasOverallPerformanceAccess, kpaTasksRaw]);


  const { data: departmentDailyKraStats = [] } = useQuery({
    queryKey: [
      "performanceDepartmentDailyKraStats",
      fetchedDepartments.map((item) => item?.department?._id).filter(Boolean),
      currentDateInfo.dateKey,
    ],
    enabled: !onlyFirstTwoCards && fetchedDepartments.length > 0,
    refetchInterval: 5 * 60 * 1000,
    queryFn: async () => {
      const departmentIds = fetchedDepartments
        .map((item) => item?.department?._id)
        .filter(Boolean);

      return Promise.all(
        departmentIds.map(async (departmentId) => {
          const [pendingRes, completedRes] = await Promise.all([
            axios.get("/api/performance/get-tasks", {
              params: {
                dept: departmentId,
                type: "KRA",
              },
            }),
            axios.get("/api/performance/get-completed-tasks", {
              params: {
                dept: departmentId,
                type: "KRA",
              },
            }),
          ]);

          const todayPendingTasks = (pendingRes.data || []).filter(
            (task) => toLocalIsoDate(task?.assignedDate) === currentDateInfo.dateKey,
          );
          const todayCompletedTasks = (completedRes.data || []).filter(
            (task) => toLocalIsoDate(task?.assignedDate) === currentDateInfo.dateKey,
          );
          const pending = todayPendingTasks.length;
          const completed = todayCompletedTasks.length;
          const assigned = pending + completed;

          return {
            assigned,
            completed,
            pending,
          };
        })
      );
    },
  });


  const annualKpaGraphData = useMemo(() => {
    const fyTaskMap = {};
    const today = new Date();
    const currentFyStartYear =
      today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;

    visibleKpaTasksRaw.forEach((departmentTasks) => {
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
  }, [visibleKpaTasksRaw]);

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
            navigate(`${modulePath}/department-KPA`, {

            //navigate("/app/performance/department-wise/overall-department-kpa", {
            state: {
              month: clickedMonth,
              ...(onlyFirstTwoCards && { fiscalYear: selectedFiscalYear }),
            },
          });
        },
      },
    },
    //  route: "",
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
     tooltip: {
      custom: ({ series, dataPointIndex, w }) => {
        const label =
          w?.config?.series?.[0]?.data?.[dataPointIndex]?.x || "Department";
        const completed =
          w?.config?.series?.[0]?.data?.[dataPointIndex]?.raw ??
          series?.[0]?.[dataPointIndex] ??
          0;
        const pending =
          w?.config?.series?.[1]?.data?.[dataPointIndex]?.raw ??
          series?.[1]?.[dataPointIndex] ??
          0;
        const total = completed + pending;

        return `
          <div style="padding:8px; font-family:Poppins, sans-serif; font-size:13px; width:220px;">
            <strong>${label}</strong><br/>
            <hr style="margin:6px 0; border-top:1px solid #ddd;" />
            <div style="display:flex; justify-content:space-between;"><span>Total KPA :</span><span>${total}</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Completed KPA :</span><span>${completed}</span></div>
            <hr style="margin:6px 0; border-top:1px solid #ddd;" />
            <div style="display:flex; justify-content:space-between;"><span>Pending KPA :</span><span>${pending}</span></div>
          </div>
        `;
      },
    },
  };

  const annualKpaYearlyTotals = useMemo(() => {
    const totalsByYear = {};

    annualKpaGraphData.forEach((series) => {
      const yearKey = series?.group;
      if (!yearKey) return;

      if (!totalsByYear[yearKey]) {
        totalsByYear[yearKey] = {
          monthlyCompleted: Array(12).fill(0),
          monthlyPending: Array(12).fill(0),
        };
      }

      (series.data || []).forEach((point, index) => {
        const rawValue = toCount(point?.raw);
        if (series.name === "Completed KPA") {
          totalsByYear[yearKey].monthlyCompleted[index] = rawValue;
        }
        if (series.name === "Remaining KPA") {
          totalsByYear[yearKey].monthlyPending[index] = rawValue;
        }
      });
    });

    const selectedYearTotals = totalsByYear[selectedFiscalYear] || {
      monthlyCompleted: Array(12).fill(0),
      monthlyPending: Array(12).fill(0),
    };

    return {
      completed: selectedYearTotals.monthlyCompleted.reduce((sum, value) => sum + toCount(value), 0),
      pending: selectedYearTotals.monthlyPending.reduce((sum, value) => sum + toCount(value), 0),
    };
  }, [annualKpaGraphData, selectedFiscalYear]);
  const annualKpaTotal =
    toCount(annualKpaYearlyTotals.completed) + toCount(annualKpaYearlyTotals.pending);

  const kpaPieData = useMemo(() => {
     const hasMatchingAssignedMonth = (assignedDate) => {
      if (!assignedDate) return false;

      const parsedDate = new Date(assignedDate);
      if (Number.isNaN(parsedDate.getTime())) return false;

      return (
        parsedDate.toLocaleString("en-US", { month: "long" }) ===
            currentDateInfo.monthName &&
        parsedDate.getFullYear() === currentDateInfo.year
      );
    };

    const completed = visibleKpaTasksRaw.reduce(
      (acc, dept) =>
        acc +
        (dept?.tasks || []).filter(
          (task) =>
            task?.status === "Completed" &&
            hasMatchingAssignedMonth(task?.assignedDate),
        ).length,
      0,
    );

    const total = visibleKpaTasksRaw.reduce(
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
  }, [visibleKpaTasksRaw, currentDateInfo]);

  const kraPieData = useMemo(() => {
    const completed = departmentDailyKraStats.reduce(
      (acc, departmentStats) => acc + toCount(departmentStats?.completed),
      0
    );
    const pending = departmentDailyKraStats.reduce(
      (acc, departmentStats) => acc + toCount(departmentStats?.pending),
      0
    );

    return [
      { label: "Completed KRA", value: completed },
      { label: "Pending KRA", value: pending },
    ];
  }, [departmentDailyKraStats]);

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

  const canAccessDepartmentKpaCard =
    onlyFirstTwoCards
      ? hasPermission(PERMISSIONS.KRAKPA_DEPARTMENT_MONTHLY_KPA)
      : hasPermission(PERMISSIONS.PERFORMANCE_DEPARTMENT_KPA_CARD);

  const canAccessDepartmentKraCard =
    hasPermission(PERMISSIONS.PERFORMANCE_DEPARTMENT_KRA_CARD);

  const canAccessEmployeeKraKpaCard =
    hasPermission(PERMISSIONS.PERFORMANCE_EMPLOYEE_KRA_KPA);

  const performanceCards = [
    {
       title: "DEPARTMENT MONTHLY KPA",
      route: `${modulePath}/department-KPA`,
      hasAccess: canAccessDepartmentKpaCard,
    },
    {
      title: "DEPARTMENT DAILY KRA",
      route: `${modulePath}/department-KRA`,
      hasAccess: !onlyFirstTwoCards && canAccessDepartmentKraCard,
    },
    {
      title: "EMPLOYEE KRA/KPA",
      route: `${modulePath}/employee-KRA-KPA`,
      hasAccess: canAccessEmployeeKraKpaCard,
    },
    {
      title: "ASSIGN KRA/KPA",
      route: `${modulePath}/assign-KRA-KPA`,
      hasAccess: hasPermission(PERMISSIONS.PERFORMANCE_ASSIGN_KRA_KPA),
    },
    {
      title: "REPORT KRA/KPA",
      route: `${modulePath}/report-KRA-KPA`,
      hasAccess: hasPermission(PERMISSIONS.PERFORMANCE_REPORT_KRA_KPA),
    },
  ].filter((card, index) => card.hasAccess && (!onlyFirstTwoCards || index < 2));

  const cardGridClass = onlyFirstTwoCards
    ? performanceCards.length > 1
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1"
    : performanceCards.length >= 5
      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-5"
      : performanceCards.length === 4
        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
        : performanceCards.length === 3
          ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          : performanceCards.length === 2
            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-2"
            : "grid-cols-1";

  return (
    <div className="flex flex-col gap-4">
      {(onlyFirstTwoCards
        ? hasPermission(PERMISSIONS.KRAKPA_DASHBOARD)
        : hasPermission(PERMISSIONS.PERFORMANCE_ANNUAL_KPA_VS_ACHIEVEMENTS)) && (
        <YearlyGraph
          data={annualKpaGraphData}
          options={annualKpaChartOptions}
          title="ANNUAL KPA VS ACHIEVEMENTS"
          titleAmount=""
          TitleAmountTotal={annualKpaTotal}
          TitleAmountGreen={annualKpaYearlyTotals.completed}
          TitleAmountRed={annualKpaYearlyTotals.pending}
          totalTitle="Total"
          greenTitle="KPA"
          redTitle="KPA"
          secondParam
          currentYear
          onYearChange={setSelectedFiscalYear}

        />
        )}
      {performanceCards.length > 0 && (
        <div className={`grid ${cardGridClass} gap-4 auto-rows-fr`}>
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
        {!onlyFirstTwoCards &&
          hasPermission(PERMISSIONS.PERFORMANCE_KRA_PENDING_VS_COMPLETED) && (
         <WidgetSection
            border
            title={`KRA - Pending vs Completed - ${currentDateInfo.dateLabel}`}
          >
            <PieChartMui
              data={kraPieData}
              options={pieOptions(kraPieData.map((item) => item.label))}
              centerAlign
            />
          </WidgetSection>
        )}

        {(onlyFirstTwoCards
          ? hasPermission(PERMISSIONS.KRAKPA_DASHBOARD)
          : hasPermission(PERMISSIONS.PERFORMANCE_KPA_PENDING_VS_COMPLETED)) && (
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
