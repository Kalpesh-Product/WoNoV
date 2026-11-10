import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
//import PageFrame from "../../components/Pages/PageFrame";
import WidgetSection from "../../components/WidgetSection";
import YearlyGraph from "../../components/graphs/YearlyGraph";
import PieChartMui from "../../components/graphs/PieChartMui";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Card from "../../components/Card";
import { CgWebsite } from "react-icons/cg";
import { FaChartLine, FaUser } from "react-icons/fa";
import { MdCheck, MdKeyboardArrowDown } from "react-icons/md";
import useAuth from "../../hooks/useAuth";
import { PERMISSIONS } from "../../constants/permissions";
import { toIndividualKpaTask } from "./kraKpaIndividualKpaAdapter";
import PerformanceChartSkeleton from "./PerformanceChartSkeleton";
import KraKpaEmployeeInsights from "./KraKpaEmployeeInsights";

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

const PerformanceHome = ({
  onlyFirstTwoCards = false,
  employeeDashboard = false,
}) => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const modulePath = onlyFirstTwoCards ? "/app/kra-kpa" : "/app/performance";
  const { auth } = useAuth();
  const storedSelectedMember = useSelector(
    (state) => state.performance.selectedMember,
  );
  const storedSelectedDepartment = useSelector(
    (state) => state.performance.selectedDepartment,
  );
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const roleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.trim().toLowerCase()).filter(Boolean) || [];
  const isHr = roleTitles.some((roleTitle) => /^hr(?:\s|$)/.test(roleTitle));
  const isManager = roleTitles.some((roleTitle) =>
    roleTitle.includes("manager") ||
    (/^\S+\s+admin(?:\s|$)/.test(roleTitle) &&
      !["master admin", "super admin"].includes(roleTitle)),
  );
  const isTopManagement =
    roleTitles.includes("top management") ||
    (auth?.user?.departments || []).some(
      (department) =>
        department?.name?.trim().toLowerCase() === "top management",
    );
  const hasOverallPerformanceAccess = roleTitles.some((roleTitle) =>
    ["master admin", "super admin"].includes(roleTitle),
  );
  const selfDashboard = onlyFirstTwoCards && Boolean(auth?.user?._id) && !employeeDashboard &&
    !isManager && !isHr && !isTopManagement && !hasOverallPerformanceAccess;
  const showEmployeeDashboard = employeeDashboard || selfDashboard;
  const showManagerDashboard = onlyFirstTwoCards && (isManager || isHr || isTopManagement) && !employeeDashboard;
  const showInsightsDashboard = showEmployeeDashboard || showManagerDashboard;
  const canUseIndividualView = !isHr && !isTopManagement;
  const [managerView, setManagerView] = useState(() => canUseIndividualView ? "individual" : "department");
  const [managerDepartmentChoice, setManagerDepartmentChoice] = useState("all");
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);
  const departmentPickerRef = useRef(null);
  const departmentButtonRef = useRef(null);
  const { data: allDashboardDepartments = [] } = useQuery({
    queryKey: ["kraKpaDashboardDepartments"],
    enabled: showManagerDashboard,
    queryFn: async () => {
      const response = await axios.get("/api/departments/get-departments");
      return response.data || [];
    },
  });
  const companyDepartmentIds = new Set(
    (auth?.user?.company?.selectedDepartments || [])
      .map((department) => String(department?.department?._id || department?.department || department?._id || department))
      .filter(Boolean),
  );
  const assignedDepartmentIds = new Set(
    (auth?.user?.departments || [])
      .map((department) => String(department?._id || department))
      .filter(Boolean),
  );
  const managerDepartments = allDashboardDepartments
    .filter((department) => department?.isActive !== false)
    .filter((department) => !canUseIndividualView || assignedDepartmentIds.has(String(department?._id)))
    .map((department) => ({
      id: String(typeof department === "string" ? department : department?._id || ""),
      name: typeof department === "string" ? department : department?.name || "Department",
    }))
    .filter((department) => department.id && (canUseIndividualView || !companyDepartmentIds.size || companyDepartmentIds.has(department.id)))
    .sort((first, second) => first.name.localeCompare(second.name));
  const selectedManagerDepartment = managerDepartments.find(
    (department) => department.id === managerDepartmentChoice,
  );
  const departmentView = showManagerDashboard && (!canUseIndividualView || managerView === "department");
  useEffect(() => {
    if (!isDepartmentMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!departmentPickerRef.current?.contains(event.target)) {
        setIsDepartmentMenuOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsDepartmentMenuOpen(false);
        departmentButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isDepartmentMenuOpen]);
  const selectedMember = selfDashboard || showManagerDashboard
    ? null
    : location.state?.selectedMember || storedSelectedMember;
  const employeeDashboardName =
    selectedMember?.memberName ||
    [auth?.user?.firstName, auth?.user?.middleName, auth?.user?.lastName]
      .filter(Boolean)
      .join(" ");
  const employeeDashboardTitleSuffix =
    showEmployeeDashboard && employeeDashboardName
      ? ` - ${employeeDashboardName.toUpperCase()}`
      : "";
  const selectedEmployeeId = selfDashboard || showManagerDashboard
    ? auth?.user?._id?.toString()
    : employeeDashboard ? selectedMember?.memberId?.toString() : null;
  const primaryDepartment = auth?.user?.departments?.[0];
  const primaryDepartmentId = typeof primaryDepartment === "string"
    ? primaryDepartment
    : primaryDepartment?._id;
  const employeeInsightsDepartmentId = showManagerDashboard
    ? selectedManagerDepartment?.id || null
    : selfDashboard
    ? primaryDepartmentId
    : location.state?.selectedDepartment ||
      storedSelectedDepartment ||
      primaryDepartmentId;
  const [currentDateInfo, setCurrentDateInfo] = useState(getCurrentDateInfo);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(() => {
    const now = new Date();
    const fyStartYear =
      now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
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
  const { data: managerTeamMembers = [] } = useQuery({
    queryKey: ["kraKpaManagerTeamMembers", departmentView ? managerDepartmentChoice : "individual", managerDepartments.map((department) => department.id)],
    enabled: departmentView && canUseIndividualView && managerDepartments.length > 0,
    queryFn: async () => {
      const departmentIds = selectedManagerDepartment
        ? [selectedManagerDepartment.id]
        : managerDepartments.map((department) => department.id);
      const responses = await Promise.all(departmentIds.map((deptId) =>
        axios.get("/api/users/assignees", { params: { deptId } }),
      ));
      return [...new Map(responses.flatMap((response) => response.data || [])
        .map((member) => [String(member.id), member])).values()];
    },
  });

  const { data: fetchedDepartments = [], isLoading: isDepartmentsLoading } =
    useQuery({
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

  const { data: kpaTasksRaw = [], isLoading: isKpaTasksLoading } = useQuery({
    queryKey: [onlyFirstTwoCards ? "kraKpaKpaOverview" : "performanceKpaTasks"],
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-kpa-tasks");
      const departmentTasks = response.data || [];
      if (!onlyFirstTwoCards) return departmentTasks;

      const individualResponse = await axios.get(
        "/api/kra-kpa/individual-monthly-kpa",
      );
      const groups = new Map(
        departmentTasks.map((group) => [
          group.department,
          { ...group, tasks: [...(group.tasks || [])] },
        ]),
      );
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
    const allowedDepartmentNames = new Set(
      (auth?.user?.departments || [])
        .map((dept) => normalizeName(dept?.name))
        .filter(Boolean),
    );

    const departmentTasks = hasOverallPerformanceAccess || isHr || isTopManagement
      ? kpaTasksRaw || []
      : allowedDepartmentNames.size === 0
        ? []
        : (kpaTasksRaw || []).filter((item) =>
            allowedDepartmentNames.has(normalizeName(item?.department)),
          );

    const selectedDepartmentTasks = showManagerDashboard && selectedManagerDepartment?.name
      ? departmentTasks.filter((item) =>
          normalizeName(item?.department) === normalizeName(selectedManagerDepartment.name),
        )
      : departmentTasks;

    if (!showInsightsDashboard || !selectedEmployeeId) return selectedDepartmentTasks;

    if (showManagerDashboard && departmentView && !canUseIndividualView) {
      return selectedDepartmentTasks;
    }

    const visibleEmployeeIds = showManagerDashboard && departmentView
      ? new Set([selectedEmployeeId, ...managerTeamMembers.map((member) => String(member.id))])
      : new Set([selectedEmployeeId]);

    return selectedDepartmentTasks
      .map((item) => ({
        ...item,
        tasks: (item.tasks || []).filter(
          (task) => visibleEmployeeIds.has(task?.assignToId?.toString()),
        ),
      }))
      .filter((item) => item.tasks.length > 0);
  }, [
    auth?.user?.departments,
    showInsightsDashboard,
    showManagerDashboard,
    departmentView,
    canUseIndividualView,
    isHr,
    isTopManagement,
    selectedManagerDepartment?.name,
    managerTeamMembers,
    hasOverallPerformanceAccess,
    kpaTasksRaw,
    selectedEmployeeId,
  ]);

  const {
    data: departmentDailyKraStats = [],
    isLoading: isDepartmentDailyKraStatsLoading,
  } = useQuery({
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
            (task) =>
              toLocalIsoDate(task?.assignedDate) === currentDateInfo.dateKey,
          );
          const todayCompletedTasks = (completedRes.data || []).filter(
            (task) =>
              toLocalIsoDate(task?.assignedDate) === currentDateInfo.dateKey,
          );
          const pending = todayPendingTasks.length;
          const completed = todayCompletedTasks.length;
          const assigned = pending + completed;

          return {
            assigned,
            completed,
            pending,
          };
        }),
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
          taskDate.getMonth() >= 3
            ? taskDate.getFullYear()
            : taskDate.getFullYear() - 1;
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
      ? Object.keys(fyTaskMap)
          .map(Number)
          .sort((a, b) => a - b)
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
            config.w.config.series[config.seriesIndex].data[
              config.dataPointIndex
            ].x;
          const destination = employeeDashboard
            ? `${modulePath}/department-KPA/member-wise-KPA/employee-dashboard/kra-kpa/individual-Monthly-KPA`
            : selfDashboard
              ? `${modulePath}/individual/kra-kpa/individual-Monthly-KPA`
              : `${modulePath}/department-KPA`;
          navigate(destination, {
            //navigate("/app/performance/department-wise/overall-department-kpa", {
            state: {
              ...location.state,
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
      completed: selectedYearTotals.monthlyCompleted.reduce(
        (sum, value) => sum + toCount(value),
        0,
      ),
      pending: selectedYearTotals.monthlyPending.reduce(
        (sum, value) => sum + toCount(value),
        0,
      ),
    };
  }, [annualKpaGraphData, selectedFiscalYear]);
  const annualKpaTotal =
    toCount(annualKpaYearlyTotals.completed) +
    toCount(annualKpaYearlyTotals.pending);

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
      0,
    );
    const pending = departmentDailyKraStats.reduce(
      (acc, departmentStats) => acc + toCount(departmentStats?.pending),
      0,
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

  const canAccessDepartmentKpaCard = onlyFirstTwoCards
    ? hasPermission(PERMISSIONS.KRAKPA_DEPARTMENT_MONTHLY_KPA)
    : hasPermission(PERMISSIONS.PERFORMANCE_DEPARTMENT_KPA_CARD);

  const canAccessDepartmentKraCard = hasPermission(
    PERMISSIONS.PERFORMANCE_DEPARTMENT_KRA_CARD,
  );

  const canAccessEmployeeKraKpaCard = hasPermission(
    PERMISSIONS.PERFORMANCE_EMPLOYEE_KRA_KPA,
  );

  const kraKpaWorkAccess = [
    PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA,
    PERMISSIONS.KRAKPA_SELF_KRA,
    PERMISSIONS.KRAKPA_DUE_TASK,
    PERMISSIONS.KRAKPA_DAILY_LOGS,
  ].some(hasPermission);
  const kraKpaScoreAccess = [
    PERMISSIONS.KRAKPA_KPA_RATING,
    PERMISSIONS.KRAKPA_DAILY_LOGS_RATING,
  ].some(hasPermission);
  const defaultKraKpaWorkPath = hasPermission(
    PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA,
  )
    ? "individual-Monthly-KPA"
    : hasPermission(PERMISSIONS.KRAKPA_SELF_KRA)
      ? "self-KRA"
      : hasPermission(PERMISSIONS.KRAKPA_DUE_TASK)
        ? "due-task"
        : "daily-logs";
  const defaultKraKpaScorePath = hasPermission(PERMISSIONS.KRAKPA_KPA_RATING)
    ? "kpa-rating"
    : "daily-logs-rating";

  const standardPerformanceCards = [
    {
      title: "DEPARTMENT KRA/KPA",
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
  ];

  const kraKpaDashboardCards = [
    {
      title: "EMPLOYEE KRA/KPA",
      route: employeeDashboard
        ? `${modulePath}/department-KPA/member-wise-KPA/employee-dashboard/kra-kpa/${defaultKraKpaWorkPath}`
        : `${modulePath}/individual/kra-kpa/${defaultKraKpaWorkPath}`,
      icon: <FaUser />,
      hasAccess: kraKpaWorkAccess,
    },
    {
      title: "DAILY SCORE",
      route: employeeDashboard
        ? `${modulePath}/department-KPA/member-wise-KPA/employee-dashboard/daily-score/${defaultKraKpaScorePath}`
        : `${modulePath}/individual/daily-score/${defaultKraKpaScorePath}`,
      icon: <FaChartLine />,
      hasAccess: kraKpaScoreAccess,
    },
    {
      title: "DEPARTMENT KRA/KPA",
      route: `${modulePath}/department-KPA`,
      icon: <CgWebsite />,
      hasAccess:
        !showEmployeeDashboard &&
        (isManager || isHr || isTopManagement) &&
        hasPermission(PERMISSIONS.KRAKPA_DEPARTMENT_MONTHLY_KPA),
    },
    {
      title: "PENDING APPROVALS",
      route: `${modulePath}/pending-approvals`,
      icon: <CgWebsite />,
      hasAccess:
        !showEmployeeDashboard &&
        (isManager || isHr || isTopManagement) &&
        hasPermission(PERMISSIONS.KRAKPA_PENDING_APPROVALS),
    },
    {
      title: "DEPARTMENT",
      route: `${modulePath}/departments`,
      icon: <CgWebsite />,
      hasAccess:
        !showEmployeeDashboard &&
        (isManager || isHr || isTopManagement) &&
        hasPermission(PERMISSIONS.KRAKPA_DEPARTMENTS),
    },
  ];

  const performanceCards = (
    onlyFirstTwoCards ? kraKpaDashboardCards : standardPerformanceCards
  ).filter((card) => card.hasAccess);

  const cardGridClass =
    performanceCards.length >= 5
      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-5"
      : performanceCards.length === 4
        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
        : performanceCards.length === 3
          ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          : performanceCards.length === 2
            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-2"
            : "grid-cols-1";

  const kpaOverviewWidget = (onlyFirstTwoCards
    ? hasPermission(PERMISSIONS.KRAKPA_DASHBOARD)
    : hasPermission(PERMISSIONS.PERFORMANCE_KPA_PENDING_VS_COMPLETED)) && (
    <WidgetSection
      border
      autoHeight={showInsightsDashboard}
      title={`KPA - Pending vs Completed - ${currentMonthLabel}`}
    >
      {isKpaTasksLoading ? (
        <PerformanceChartSkeleton variant="donut" />
      ) : (
        <PieChartMui
          data={kpaPieData}
          options={pieOptions(kpaPieData.map((item) => item.label))}
          centerAlign
        />
      )}
    </WidgetSection>
  );

  return (
    <div className="flex flex-col gap-4">
      {(onlyFirstTwoCards
        ? hasPermission(PERMISSIONS.KRAKPA_DASHBOARD)
        : hasPermission(PERMISSIONS.PERFORMANCE_ANNUAL_KPA_VS_ACHIEVEMENTS)) &&
        (isKpaTasksLoading ? (
          <WidgetSection
            border
            title={`ANNUAL KPA VS ACHIEVEMENTS${employeeDashboardTitleSuffix}`}
          >
            <PerformanceChartSkeleton variant="bar" height="h-[26rem]" />
          </WidgetSection>
        ) : (
          <YearlyGraph
            data={annualKpaGraphData}
            options={annualKpaChartOptions}
            title={`ANNUAL KPA VS ACHIEVEMENTS${employeeDashboardTitleSuffix}`}
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
        ))}
      {performanceCards.length > 0 && (
        <div className={`grid ${cardGridClass} gap-4 auto-rows-fr`}>
          {performanceCards.map((card) => (
            <div key={card.route} className="h-full">
              <Card
                icon={
                  showEmployeeDashboard ? card.icon || <CgWebsite /> : <CgWebsite />
                }
                title={card.title}
                route={card.route}
                hoverScale={showEmployeeDashboard ? 1 : undefined}
                navigationState={employeeDashboard ? location.state : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {showManagerDashboard && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d0d5dd] bg-white p-4">
          <h2 className="text-mobileTitle lg:text-widgetTitle font-pmedium uppercase text-primary">
            Department Performance Widgets
          </h2>
          <div ref={departmentPickerRef} className="relative">
            <div className="inline-flex rounded-lg border border-[#1e3d73]" role="group" aria-label="Dashboard view">
              {canUseIndividualView && <button
                type="button"
                aria-pressed={managerView === "individual"}
                onClick={() => {
                  setManagerView("individual");
                  setIsDepartmentMenuOpen(false);
                }}
                className={`rounded-l-md px-4 py-2 text-sm font-pmedium transition-colors ${managerView === "individual" ? "bg-[#1e3d73] text-white" : "bg-white text-[#1e3d73] hover:bg-[#eef3fb]"}`}
              >
                Individual
              </button>}
              <button
                ref={departmentButtonRef}
                type="button"
                aria-pressed={departmentView}
                aria-haspopup={managerDepartments.length > 0 ? "menu" : undefined}
                aria-expanded={managerDepartments.length > 0 ? isDepartmentMenuOpen : undefined}
                aria-controls={isDepartmentMenuOpen ? "manager-department-menu" : undefined}
                onClick={() => {
                  setManagerView("department");
                  if (managerDepartments.length > 0) {
                    setIsDepartmentMenuOpen((open) => !open);
                  }
                }}
                className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-pmedium transition-colors ${canUseIndividualView ? "rounded-r-md border-l border-[#1e3d73]" : "rounded-md"} ${departmentView ? "bg-[#1e3d73] text-white" : "bg-white text-[#1e3d73] hover:bg-[#eef3fb]"}`}
              >
                Department
                {managerDepartments.length > 0 && (
                  <MdKeyboardArrowDown aria-hidden="true" size={18} className={isDepartmentMenuOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                )}
              </button>
            </div>
            {isDepartmentMenuOpen && managerDepartments.length > 0 && (
              <div
                id="manager-department-menu"
                role="menu"
                aria-label="Select department"
                className="absolute right-0 top-full z-50 mt-2 min-w-[220px] max-w-[min(90vw,320px)] overflow-hidden rounded-xl border border-[#d8e0ec] bg-white py-1 shadow-[0_12px_32px_rgba(30,61,115,0.18)]"
              >
                <div className="border-b border-[#edf0f5] px-4 py-2 text-xs font-pmedium uppercase tracking-wide text-slate-500">
                  Select department
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={!selectedManagerDepartment}
                    onClick={() => {
                      setManagerDepartmentChoice("all");
                      setManagerView("department");
                      setIsDepartmentMenuOpen(false);
                      departmentButtonRef.current?.focus();
                    }}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${!selectedManagerDepartment ? "bg-[#eef3fb] font-pmedium text-[#1e3d73]" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    <span>All</span>
                    {!selectedManagerDepartment && <MdCheck aria-hidden="true" size={18} className="shrink-0 text-[#1e3d73]" />}
                  </button>
                  {managerDepartments.map((department) => {
                    const selected = department.id === selectedManagerDepartment?.id;
                    return (
                      <button
                        key={department.id}
                        type="button"
                        role="menuitemradio"
                        aria-checked={selected}
                        onClick={() => {
                          setManagerDepartmentChoice(department.id);
                          setManagerView("department");
                          setIsDepartmentMenuOpen(false);
                          departmentButtonRef.current?.focus();
                        }}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${selected ? "bg-[#eef3fb] font-pmedium text-[#1e3d73]" : "text-slate-700 hover:bg-slate-50"}`}
                      >
                        <span className="truncate">{department.name}</span>
                        {selected && <MdCheck aria-hidden="true" size={18} className="shrink-0 text-[#1e3d73]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!onlyFirstTwoCards &&
          hasPermission(PERMISSIONS.PERFORMANCE_KRA_PENDING_VS_COMPLETED) && (
            <WidgetSection
              border
              title={`KRA - Pending vs Completed - ${currentDateInfo.dateLabel}`}
            >
              {isDepartmentDailyKraStatsLoading || isDepartmentsLoading ? (
                <PerformanceChartSkeleton variant="donut" />
              ) : (
                <PieChartMui
                  data={kraPieData}
                  options={pieOptions(kraPieData.map((item) => item.label))}
                  centerAlign
                />
              )}
            </WidgetSection>
          )}

        {!showInsightsDashboard && kpaOverviewWidget}
        {showInsightsDashboard && (
          <KraKpaEmployeeInsights
            monthlyWidget={kpaOverviewWidget}
            departmentId={employeeInsightsDepartmentId}
            employeeId={selectedEmployeeId || auth?.user?._id}
            employeeName={employeeDashboardName}
            navigationState={showManagerDashboard
              ? {
                  selectedDepartment: selectedManagerDepartment?.id,
                  selectedDepartmentName: selectedManagerDepartment?.name,
                }
              : employeeDashboard ? location.state : undefined}
            selfDashboard={selfDashboard}
            managerDashboard={showManagerDashboard}
            leadershipDashboard={showManagerDashboard || (onlyFirstTwoCards && (isHr || isTopManagement) && !employeeDashboard)}
            teamMode={departmentView}
            allDepartmentsAccess={showManagerDashboard && !canUseIndividualView}
            departmentOptions={managerDepartments}
            showDeadlineDepartment={showManagerDashboard && (!canUseIndividualView || managerDepartments.length > 1)}
            includeSelfInDepartment={(auth?.user?.departments || []).some((department) =>
              String(department?._id || department) === String(employeeInsightsDepartmentId),
            )}
            canViewDepartments={hasPermission(PERMISSIONS.KRAKPA_DEPARTMENTS)}
            canViewApprovals={
              (isManager || isHr || isTopManagement) &&
              hasPermission(PERMISSIONS.KRAKPA_PENDING_APPROVALS)
            }
            canViewKpa={hasPermission(
              PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA,
            )}
            canViewRating={hasPermission(PERMISSIONS.KRAKPA_KPA_RATING)}
          />
        )}
      </div>
    </div>
  );
};

export default PerformanceHome;
