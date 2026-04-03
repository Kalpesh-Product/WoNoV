import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import PageFrame from "../../components/Pages/PageFrame";
import WidgetSection from "../../components/WidgetSection";
import YearlyGraph from "../../components/graphs/YearlyGraph";
import PieChartMui from "../../components/graphs/PieChartMui";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Card from "../../components/Card";
import { CgWebsite } from "react-icons/cg";
import {
  setSelectedDepartment,
  setSelectedDepartmentName,
} from "../../redux/slices/performanceSlice";

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

const PerformanceHome = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  const { data: fetchedDepartments = [] } = useQuery({
    queryKey: ["performanceDepartments"],
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-depts-tasks");
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
              params: { dept: departmentId, type: "KRA" },
            }),
            axios.get("/api/performance/get-completed-tasks", {
              params: { dept: departmentId, type: "TEAMKRA" },
            }),
            axios.get("/api/performance/get-completed-tasks", {
              params: { dept: departmentId, type: "INDIVIDUALKRA" },
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
    const monthlyTotals = {};
    const monthlyAchieved = {};

    FISCAL_MONTHS.forEach((month) => {
      monthlyTotals[month] = 0;
      monthlyAchieved[month] = 0;
    });

    kpaTasksRaw.forEach((departmentTasks) => {
      departmentTasks?.tasks?.forEach((task) => {
        if (!task?.assignedDate) return;

        const taskDate = new Date(task.assignedDate);
        if (Number.isNaN(taskDate.getTime())) return;

        const fiscalMonth = FISCAL_MONTHS[(taskDate.getMonth() + 9) % 12];
        monthlyTotals[fiscalMonth] += 1;

        if (task.status === "Completed") {
          monthlyAchieved[fiscalMonth] += 1;
        }
      });
    });

    return [
      {
        name: "Completed KPA",
        group: "FY 2025-26",
        data: FISCAL_MONTHS.map((month) => {
          const total = monthlyTotals[month];
          const achieved = monthlyAchieved[month];
          const percent = total > 0 ? (achieved / total) * 100 : 0;
          return { x: month, y: +percent.toFixed(1), raw: achieved };
        }),
      },
      {
        name: "Remaining KPA",
        group: "FY 2025-26",
        data: FISCAL_MONTHS.map((month) => {
          const total = monthlyTotals[month];
          const achieved = monthlyAchieved[month];
          const remaining = total - achieved;
          const percent = total > 0 ? (remaining / total) * 100 : 0;
          return { x: month, y: +percent.toFixed(1), raw: remaining };
        }),
      },
    ];
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

          navigate("/app/performance/overall-KPA/department-KPA", {
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
    const completed = kpaTasksRaw.reduce((acc, dept) => acc + (dept.achieved || 0), 0);
    const total = kpaTasksRaw.reduce((acc, dept) => acc + (dept.total || 0), 0);
    const pending = Math.max(total - completed, 0);

    return [
      { label: "Completed KPA", value: completed },
      { label: "Pending KPA", value: pending },
    ];
  }, [kpaTasksRaw]);

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

  return (
    <div className="flex flex-col gap-4">
      <YearlyGraph
        data={annualKpaGraphData}
        options={annualKpaChartOptions}
        title="ANNUAL KPA VS ACHIEVEMENTS"
        titleAmount={`TOTAL KPA : ${kpaPieData[0].value + kpaPieData[1].value}`}
        secondParam
        currentYear
      />
      <WidgetSection layout={3}>
        <Card
          icon={<CgWebsite />}
          title="DEPARTMENT WISE KRA/KPA"
          route="/app/performance/overall-KPA/department-wise-KPA"
        />
        <Card
          icon={<CgWebsite />}
          title="ASSIGN KRA/KPA"
          route="/app/performance/assign-kra-kpa"
        />
        <Card
          icon={<CgWebsite />}
          title="Report KRA/KPA"
          route="/app/performance/report-kra-kpa"
        />
      </WidgetSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetSection border title="KRA - Pending vs Completed">
          <PieChartMui
            data={kraPieData}
            options={pieOptions(kraPieData.map((item) => item.label))}
            centerAlign
          />
        </WidgetSection>

        <WidgetSection border title="KPA - Pending vs Completed">
          <PieChartMui
            data={kpaPieData}
            options={pieOptions(kpaPieData.map((item) => item.label))}
            centerAlign
          />
        </WidgetSection>
      </div>
    </div>

  );
};

export default PerformanceHome;