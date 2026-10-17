import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import Chart from "react-apexcharts";
import WidgetSection from "../../components/WidgetSection";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const INCLUDED_DEPARTMENTS = new Set([
  "marketing",
  "maintenance",
  "it",
  "finance",
  "tech",
  "expansion",
  "administration",
  "hr",
  "top management",
  "sales",
  "compliance",
]);

const MONTH_LABELS = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];
const CHART_COLORS = ["#54c4a7", "#eb5c45", "#5b8def"];
const normalize = (value) => String(value || "").trim().toLowerCase();
const percent = (value, total) =>
  total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0;
const departmentIdOf = (record) =>
  String(record?.department?._id || record?.department || "");

const getFiscalPeriod = (fiscalYear) => {
  const matchedYear = String(fiscalYear || "").match(/(\d{4})/);
  const startYear = matchedYear
    ? Number(matchedYear[1])
    : new Date().getMonth() >= 3
      ? new Date().getFullYear()
      : new Date().getFullYear() - 1;
  const monthKeys = [
    ...Array.from({ length: 9 }, (_, index) =>
      `${startYear}-${String(index + 4).padStart(2, "0")}`,
    ),
    ...Array.from({ length: 3 }, (_, index) =>
      `${startYear + 1}-${String(index + 1).padStart(2, "0")}`,
    ),
  ];
  return {
    monthKeys,
    start: new Date(`${monthKeys[0]}-01T00:00:00.000Z`),
    end: new Date(`${startYear + 1}-04-01T00:00:00.000Z`),
    startDate: `${startYear}-04-01`,
    endDate: `${startYear + 1}-03-31`,
  };
};

const monthKeyOf = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

const dateKeyOf = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const baseOptions = (categories, yAxisTitle, maximum) => ({
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
    fontFamily: "Poppins-Regular",
  },
  colors: CHART_COLORS,
  dataLabels: { enabled: false },
  grid: { borderColor: "#e5e7eb" },
  legend: { position: "top" },
  xaxis: { categories },
  yaxis: {
    min: 0,
    ...(maximum ? { max: maximum } : {}),
    title: { text: yAxisTitle },
    labels: maximum
      ? { formatter: (value) => `${Math.round(value)}%` }
      : { formatter: (value) => Math.round(value) },
  },
  tooltip: { shared: true, intersect: false },
});

const ChartWidget = ({ title, type = "bar", series, options }) => (
  <WidgetSection border title={title}>
    <Chart type={type} height={310} series={series} options={options} />
  </WidgetSection>
);

const KraKpaDepartmentWidgets = ({
  fiscalYear,
  canViewAllDepartments,
  userDepartments = [],
}) => {
  const axios = useAxiosPrivate();
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const period = useMemo(() => getFiscalPeriod(fiscalYear), [fiscalYear]);

  const { data: allDepartments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ["kraKpaDashboardDepartments"],
    queryFn: async () => {
      const response = await axios.get("/api/departments/get-departments");
      return response.data || [];
    },
  });

  const departments = useMemo(() => {
    const accessibleIds = new Set(
      userDepartments.map((department) => String(department?._id || department)),
    );
    return allDepartments
      .filter((department) => INCLUDED_DEPARTMENTS.has(normalize(department.name)))
      .filter(
        (department) =>
          canViewAllDepartments || accessibleIds.has(String(department._id)),
      )
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [allDepartments, canViewAllDepartments, userDepartments]);

  useEffect(() => {
    if (
      selectedDepartment !== "all" &&
      !departments.some(
        (department) => String(department._id) === selectedDepartment,
      )
    ) {
      setSelectedDepartment("all");
    }
  }, [departments, selectedDepartment]);

  const { data: kpas = [], isLoading: kpasLoading } = useQuery({
    queryKey: ["kraKpaDepartmentWidgetKpas", fiscalYear],
    queryFn: async () => {
      const response = await axios.get("/api/kra-kpa/individual-monthly-kpa", {
        params: { fiscalYear: String(fiscalYear || "").replace(/^FY\s+/i, "") },
      });
      return response.data || [];
    },
  });

  const { data: dailyLogs = [], isLoading: dailyLogsLoading } = useQuery({
    queryKey: ["kraKpaDepartmentWidgetDailyLogs", fiscalYear],
    queryFn: async () => {
      const response = await axios.get("/api/kra-kpa/daily-log", {
        params: {
          startDate: period.startDate,
          endDate: period.endDate,
        },
      });
      return response.data || [];
    },
  });

  const departmentIds = useMemo(
    () => new Set(departments.map((department) => String(department._id))),
    [departments],
  );
  const visibleKpas = useMemo(
    () =>
      kpas.filter((record) => {
        const departmentId = departmentIdOf(record);
        return (
          departmentIds.has(departmentId) &&
          (selectedDepartment === "all" || departmentId === selectedDepartment)
        );
      }),
    [departmentIds, kpas, selectedDepartment],
  );
  const visibleLogs = useMemo(
    () =>
      dailyLogs.filter((record) => {
        const departmentId = departmentIdOf(record);
        const logDate = new Date(record.date);
        return (
          departmentIds.has(departmentId) &&
          (selectedDepartment === "all" || departmentId === selectedDepartment) &&
          !Number.isNaN(logDate.getTime()) &&
          logDate >= period.start &&
          logDate < period.end
        );
      }),
    [dailyLogs, departmentIds, period, selectedDepartment],
  );

  const displayedDepartments = useMemo(
    () =>
      selectedDepartment === "all"
        ? departments
        : departments.filter(
            (department) => String(department._id) === selectedDepartment,
          ),
    [departments, selectedDepartment],
  );

  const metrics = useMemo(() => {
    const byDepartment = new Map(
      displayedDepartments.map((department) => [
        String(department._id),
        {
          name: department.name,
          kpas: [],
          logs: [],
          monthly: period.monthKeys.map(() => ({ kpas: [], logs: [] })),
        },
      ]),
    );
    const monthIndex = new Map(
      period.monthKeys.map((monthKey, index) => [monthKey, index]),
    );

    visibleKpas.forEach((record) => {
      const metric = byDepartment.get(departmentIdOf(record));
      if (!metric) return;
      metric.kpas.push(record);
      const index = monthIndex.get(record.month || monthKeyOf(record.deadline));
      if (index !== undefined) metric.monthly[index].kpas.push(record);
    });
    visibleLogs.forEach((record) => {
      const metric = byDepartment.get(departmentIdOf(record));
      if (!metric) return;
      metric.logs.push(record);
      const index = monthIndex.get(monthKeyOf(record.date));
      if (index !== undefined) metric.monthly[index].logs.push(record);
    });

    const summarise = (kpaRows, logRows) => {
      const completedKpas = kpaRows.filter((record) => record.status === "Completed");
      const completedLogs = logRows.filter((record) => record.status === "Done");
      const onTime = completedKpas.filter((record) => {
        if (!record.deadline || !record.closingDate) return false;
        return dateKeyOf(record.closingDate) <= dateKeyOf(record.deadline);
      }).length;
      const delayed = completedKpas.filter((record) => {
        if (!record.deadline || !record.closingDate) return false;
        return dateKeyOf(record.closingDate) > dateKeyOf(record.deadline);
      }).length;
      const managerPercentage = percent(
        kpaRows.reduce((sum, record) => sum + Number(record.kpaRating || 0), 0),
        kpaRows.length,
      );
      const hrPercentage = percent(
        kpaRows.reduce((sum, record) => sum + Number(record.hrRating || 0), 0),
        kpaRows.length,
      );
      const rating = (managerPercentage + hrPercentage) / 2;
      const kpaCompletion = percent(completedKpas.length, kpaRows.length);
      const logCompletion = percent(completedLogs.length, logRows.length);
      const onTimeRate = percent(onTime, onTime + delayed);
      return {
        totalKpas: kpaRows.length,
        completedKpas: completedKpas.length,
        pendingKpas: kpaRows.length - completedKpas.length,
        kpaCompletion,
        onTime,
        delayed,
        rating: Number(rating.toFixed(1)),
        totalLogs: logRows.length,
        completedLogs: completedLogs.length,
        carriedLogs: logRows.filter((record) => record.carriedFromDailyLog).length,
        completedKras: logRows.filter(
          (record) => record.type === "KRA" && record.status === "Done",
        ).length,
        pendingKras: logRows.filter(
          (record) => record.type === "KRA" && record.status !== "Done",
        ).length,
        performance: Number(
          ((kpaCompletion + logCompletion + onTimeRate + rating) / 4).toFixed(1),
        ),
      };
    };

    const departmentMetrics = [...byDepartment.values()].map((department) => ({
      ...department,
      summary: summarise(department.kpas, department.logs),
      monthlySummary: department.monthly.map((month) =>
        summarise(month.kpas, month.logs),
      ),
    }));
    return {
      departments: departmentMetrics,
      total: summarise(visibleKpas, visibleLogs),
      monthly: period.monthKeys.map((_, index) =>
        summarise(
          departmentMetrics.flatMap((department) => department.monthly[index].kpas),
          departmentMetrics.flatMap((department) => department.monthly[index].logs),
        ),
      ),
    };
  }, [displayedDepartments, period.monthKeys, visibleKpas, visibleLogs]);

  const departmentNames = metrics.departments.map((item) => item.name);
  const percentOptions = (categories, title) =>
    baseOptions(categories, title, 100);
  const loading = departmentsLoading || kpasLoading || dailyLogsLoading;

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-300 bg-white p-4">
        <div>
          <h2 className="text-widgetTitle font-pmedium uppercase text-primary">
            Department Performance Widgets
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            All calculations use {fiscalYear || "the selected financial year"}.
          </p>
        </div>
        <TextField
          select
          size="small"
          label="Department"
          value={selectedDepartment}
          onChange={(event) => setSelectedDepartment(event.target.value)}
          sx={{ minWidth: 240 }}
        >
          <MenuItem value="all">All Departments</MenuItem>
          {departments.map((department) => (
            <MenuItem key={department._id} value={String(department._id)}>
              {department.name}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartWidget
          title="Company KPA Achievement Trend"
          series={[
            { name: "Completed KPAs", data: metrics.monthly.map((item) => item.completedKpas) },
            { name: "Pending KPAs", data: metrics.monthly.map((item) => item.pendingKpas) },
          ]}
          options={{
            ...baseOptions(MONTH_LABELS, "Number of KPAs"),
            chart: { ...baseOptions(MONTH_LABELS).chart, stacked: true },
          }}
        />
        <ChartWidget
          title="Department Performance Comparison"
          series={[{ name: "Performance", data: metrics.departments.map((item) => item.summary.performance) }]}
          options={percentOptions(departmentNames, "Performance")}
        />
        <ChartWidget
          title="Department KPA Completion Rate"
          series={[{ name: "Completion", data: metrics.departments.map((item) => item.summary.kpaCompletion) }]}
          options={percentOptions(departmentNames, "Completion")}
        />
        <ChartWidget
          title="On-Time vs Delayed Completion"
          type="donut"
          series={[metrics.total.onTime, metrics.total.delayed]}
          options={{
            chart: { toolbar: { show: false }, fontFamily: "Poppins-Regular" },
            labels: ["On Time", "Delayed"],
            colors: [CHART_COLORS[0], CHART_COLORS[1]],
            legend: { position: "bottom" },
            noData: { text: "No completed KPAs in this period" },
          }}
        />
        <ChartWidget
          title="KPA Rating Comparison"
          series={[{ name: "Final KPA Rating", data: metrics.departments.map((item) => item.summary.rating) }]}
          options={percentOptions(departmentNames, "Rating")}
        />
        <ChartWidget
          title="Daily Work Completion Trend"
          series={[
            { name: "Assigned", data: metrics.monthly.map((item) => item.totalLogs) },
            { name: "Completed", data: metrics.monthly.map((item) => item.completedLogs) },
            { name: "Carried Forward", data: metrics.monthly.map((item) => item.carriedLogs) },
          ]}
          options={baseOptions(MONTH_LABELS, "Daily Tasks")}
        />
        <ChartWidget
          title="Performance Trend by Department"
          type="line"
          series={metrics.departments.map((department) => ({
            name: department.name,
            data: department.monthlySummary.map((item) => item.performance),
          }))}
          options={percentOptions(MONTH_LABELS, "Performance")}
        />
        <ChartWidget
          title="KRA and KPA Completion Overview"
          series={[
            { name: "Completed", data: [metrics.total.completedKras, metrics.total.completedKpas] },
            { name: "Pending", data: [metrics.total.pendingKras, metrics.total.pendingKpas] },
          ]}
          options={{
            ...baseOptions(["KRA", "KPA"], "Number of Records"),
            chart: { ...baseOptions(["KRA", "KPA"]).chart, stacked: true },
          }}
        />
      </div>
    </section>
  );
};

export default KraKpaDepartmentWidgets;
