import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import dayjs from "dayjs";
import {
  MdArrowForwardIos,
  MdAssignmentTurnedIn,
  MdCalendarToday,
  MdCheckCircleOutline,
  MdErrorOutline,
  MdHistory,
  MdOutlineAssessment,
  MdOutlineRateReview,
  MdPendingActions,
  MdReplay,
  MdTrendingUp,
} from "react-icons/md";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import WidgetSection from "../../components/WidgetSection";
import {
  getDailyScoreRows,
  getPendingActions,
  getPerformanceTrend,
  getTodayProgress,
  getUpcomingDeadlines,
} from "./employeeDashboardInsightsData";

const basePath = "/app/kra-kpa/department-KPA/member-wise-KPA";
const memberKpaPath = `${basePath}/employee-dashboard/kra-kpa/individual-Monthly-KPA`;
const memberRatingPath = `${basePath}/employee-dashboard/daily-score/kpa-rating`;
const selfKpaPath = "/app/kra-kpa/individual/kra-kpa/individual-Monthly-KPA";
const selfRatingPath = "/app/kra-kpa/individual/daily-score/kpa-rating";
const approvalsPath = `${basePath}/member-pending-approvals`;

const progressCards = [
  { key: "kraScheduled", label: "KRAs Scheduled", icon: MdCalendarToday, className: "bg-[#eef3ff] text-[#4868ad]" },
  { key: "carriedForward", label: "Carried Forward", icon: MdReplay, className: "bg-[#fff0f2] text-[#e84459]" },
  { key: "completed", label: "Tasks Completed", icon: MdCheckCircleOutline, className: "bg-[#eafaf0] text-[#159654]" },
  { key: "pending", label: "Tasks Pending", icon: MdHistory, className: "bg-[#fff8e8] text-[#d78300]" },
];

const statusClasses = {
  Overdue: "bg-red-100 text-red-700",
  "Due Today": "bg-red-100 text-red-700",
  "Due Soon": "bg-amber-100 text-amber-700",
  "On Track": "bg-green-100 text-green-700",
};

const LoadingBlock = ({ height = "h-40" }) => (
  <div className={`${height} animate-pulse rounded-xl bg-slate-100`} aria-label="Loading employee dashboard insights" />
);

const Section = ({ title, children, action, fillHeight = false, flushBody = false }) => (
  <WidgetSection border autoHeight={!fillHeight} fillHeight={fillHeight} flushBody={flushBody} title={title} headerRightContent={action}>
    <div className={flushBody ? "relative h-full min-h-72 min-w-0" : fillHeight ? "flex h-full min-w-0 flex-col" : "min-w-0"}>{children}</div>
  </WidgetSection>
);

const KraKpaEmployeeInsights = ({
  departmentId,
  employeeId,
  employeeName,
  navigationState,
  selfDashboard = false,
  canViewApprovals,
  canViewKpa,
  canViewRating,
}) => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const today = dayjs().format("YYYY-MM-DD");
  const fiscalYearStart = dayjs(today).month() >= 3
    ? dayjs(today).month(3).startOf("month")
    : dayjs(today).subtract(1, "year").month(3).startOf("month");
  const enabled = Boolean(departmentId && employeeId);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["kraKpaEmployeeInsights", departmentId, employeeId, today],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const [kpaResponse, logResponse, holidayResponse] = await Promise.all([
        axios.get("/api/kra-kpa/individual-monthly-kpa", {
          params: { department: departmentId, employee: employeeId },
        }),
        axios.get("/api/kra-kpa/daily-log", {
          params: {
            department: departmentId,
            employee: employeeId,
            date: today,
            startDate: fiscalYearStart.format("YYYY-MM-DD"),
            endDate: fiscalYearStart.add(1, "year").subtract(1, "day").format("YYYY-MM-DD"),
          },
        }),
        axios.get("/api/events/get-holidays"),
      ]);
      return {
        kpas: kpaResponse.data || [],
        logs: logResponse.data || [],
        holidays: holidayResponse.data || [],
      };
    },
  });

  const progress = useMemo(() => getTodayProgress(data?.logs || [], today), [data?.logs, today]);
  const dailyScoreRows = useMemo(() => getDailyScoreRows(data?.logs || [], today), [data?.logs, today]);
  const actions = useMemo(() => getPendingActions(data?.kpas || []), [data?.kpas]);
  const trend = useMemo(() => getPerformanceTrend(data?.kpas || [], data?.logs || [], today), [data?.kpas, data?.logs, today]);
  const deadlines = useMemo(() => getUpcomingDeadlines(data?.kpas || [], today, data?.holidays || []), [data?.kpas, data?.holidays, today]);

  const goTo = (path) => navigate(path, { state: navigationState });
  const kpaPath = selfDashboard ? selfKpaPath : memberKpaPath;
  const ratingPath = selfDashboard ? selfRatingPath : memberRatingPath;
  const pendingCards = [
    { label: "KPA Approvals", count: actions.approvals, icon: MdAssignmentTurnedIn, className: "bg-[#fff8eb] text-[#da9200]", path: selfDashboard ? kpaPath : approvalsPath, enabled: selfDashboard ? canViewKpa : canViewApprovals },
    { label: "Reviews Pending", count: actions.reviews, icon: MdOutlineRateReview, className: "bg-[#edf5ff] text-[#367bd6]", path: ratingPath, enabled: canViewRating },
    { label: "Ratings Pending", count: actions.ratings, icon: MdOutlineAssessment, className: "bg-[#f5efff] text-[#9860dd]", path: ratingPath, enabled: canViewRating },
    { label: "Changes Required", count: actions.changesRequired, icon: MdErrorOutline, className: "bg-[#fff0f0] text-[#e84e4e]", path: kpaPath, enabled: canViewKpa },
  ];

  const chartOptions = {
    chart: { type: "line", toolbar: { show: false }, animations: { enabled: false }, fontFamily: "Poppins-Regular" },
    colors: ["#31bd78", "#6489ed", "#9b67f5"],
    stroke: { curve: "smooth", width: 2.5 },
    markers: { size: 3 },
    dataLabels: { enabled: false },
    grid: { borderColor: "#eef0f4" },
    xaxis: { categories: trend.points.map((point) => point.label) },
    yaxis: { min: 0, max: 100, tickAmount: 4, labels: { formatter: (value) => `${value.toFixed(0)}%` } },
    tooltip: { y: { formatter: (value) => `${value}%` } },
    legend: { position: "bottom", fontSize: "12px" },
  };
  const chartSeries = [
    { name: "KPA Completion", data: trend.points.map((point) => point.completion) },
    { name: "KPA Rating", data: trend.points.map((point) => point.rating) },
    { name: "Daily Logs", data: trend.points.map((point) => point.dailyLogs) },
  ];

  if (!enabled) return null;
  if (isError) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Unable to load employee dashboard insights. Please refresh to try again.</div>;
  }

  return (
    <>
      <Section title={`Daily Score - ${dayjs(today).format("MMMM YYYY")}`} fillHeight flushBody>
        {isLoading ? <LoadingBlock height="h-full min-h-72" /> : (
          <div className="absolute inset-0 min-w-0 overflow-auto">
            <table className="w-full min-w-[480px] border-collapse text-center text-xs text-primary">
              <thead className="sticky top-0 z-10 bg-[#eaf0f8] font-pmedium">
                <tr>
                  {["Day", "Assigned", "Closed", "Carry Forward", "Score"].map((heading) => (
                    <th key={heading} className="border border-[#dce3ec] px-2 py-2 font-pmedium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dailyScoreRows.map((row) => {
                  const scoreTone = row.future || !row.assigned
                    ? "bg-slate-100 text-slate-600"
                    : row.score >= 80
                      ? "bg-[#36c982] text-white"
                      : row.score >= 74
                        ? "bg-[#ffe071] text-[#654a00]"
                        : "bg-[#ff7777] text-white";
                  return (
                    <tr key={row.date} className="odd:bg-white even:bg-[#f8fafc]">
                      <td className="border border-[#e6eaf0] px-2 py-1.5 font-pmedium">{dayjs(row.date).format("DD MMM")}</td>
                      <td className="border border-[#e6eaf0] px-2 py-1.5">{row.assigned}</td>
                      <td className="border border-[#e6eaf0] px-2 py-1.5">{row.closed}</td>
                      <td className="border border-[#e6eaf0] px-2 py-1.5">{row.carriedForward}</td>
                      <td className={`border border-[#e6eaf0] px-2 py-1.5 font-pmedium ${scoreTone}`}>{row.score}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Today's Progress" fillHeight>
        {isLoading ? <LoadingBlock height="h-full min-h-72" /> : (
          <div className="flex h-full min-h-72 flex-col justify-between gap-4">
            <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-3">
              {progressCards.map(({ key, label, icon: Icon, className }) => (
                <div key={key} className={`flex min-w-0 items-center gap-3 rounded-xl p-4 ${className}`}>
                  <span className="rounded-full bg-white/70 p-2"><Icon size={22} /></span>
                  <div className="min-w-0"><div className="text-xs font-pmedium">{label}</div><div className="text-2xl font-semibold">{progress[key]}</div></div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-sm font-pmedium text-green-700">{progress.completion}% Completed</div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#31bd78]" style={{ width: `${progress.completion}%` }} />
              </div>
            </div>
          </div>
        )}
      </Section>

      <Section title="Pending Actions" fillHeight action={canViewKpa && (
        <button type="button" className="text-sm text-blue-500 hover:underline" onClick={() => goTo(kpaPath)}>View All <span aria-hidden="true">›</span></button>
      )}>
        {isLoading ? <LoadingBlock height="h-full min-h-72" /> : (
          <div className="grid h-full min-h-72 grid-cols-2 grid-rows-2 gap-3">
            {pendingCards.map(({ label, count, icon: Icon, className, path, enabled: canOpen }) => (
              <button
                key={label}
                type="button"
                disabled={!canOpen}
                onClick={() => goTo(path)}
                className="flex min-w-0 items-center gap-3 rounded-lg border border-[#e4e8ef] p-3 text-left transition-colors enabled:hover:bg-slate-50 disabled:cursor-default"
              >
                <span className={`rounded-lg p-2 ${className}`}><Icon size={22} /></span>
                <span className="min-w-0 flex-1 truncate text-sm font-pmedium">{label}</span>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${className}`}>{count}</span>
                {canOpen && <MdArrowForwardIos size={12} className="text-gray-400" />}
              </button>
            ))}
          </div>
        )}
      </Section>

      <div className="lg:col-span-2">
      <Section title="Performance Trend">
        {isLoading ? <LoadingBlock height="h-72" /> : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: `KPA Completion - ${dayjs(today).format("MMM")}`, value: trend.completion, icon: MdTrendingUp, className: "bg-[#eafaf0] text-[#159654]" },
                { label: `KPA Rating - ${dayjs(today).format("MMM")}`, value: trend.rating, icon: MdOutlineAssessment, className: "bg-[#eef3ff] text-[#4c77e6]" },
                { label: `Daily Logs - ${dayjs(today).format("MMM")}`, value: trend.dailyLogs, icon: MdAssignmentTurnedIn, className: "bg-[#f5efff] text-[#9860dd]" },
              ].map(({ label, value, icon: Icon, className }) => (
                <div key={label} className={`flex min-w-0 items-center gap-2 rounded-lg p-3 ${className}`}>
                  <Icon size={20} className="shrink-0" />
                  <div className="min-w-0"><div className="truncate text-xs">{label}</div><div className="text-xl font-semibold">{value}%</div></div>
                </div>
              ))}
            </div>
            <ReactApexChart type="line" options={chartOptions} series={chartSeries} height={245} />
          </>
        )}
      </Section>
      </div>

      <div className="lg:col-span-2">
      <Section title="Upcoming Deadlines">
        {isLoading ? <div className="p-5"><LoadingBlock height="h-44" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-[#f6f7fa] text-gray-700"><tr>
                <th className="px-5 py-3 font-pmedium">KPA</th>
                <th className="px-4 py-3 font-pmedium">Employee</th>
                <th className="px-4 py-3 font-pmedium">Deadline</th>
                <th className="px-4 py-3 font-pmedium">Working Days</th>
                <th className="px-4 py-3 font-pmedium">Status</th>
              </tr></thead>
              <tbody>
                {deadlines.length ? deadlines.map((record) => (
                  <tr key={record.id} className="border-t border-[#edf0f4] odd:bg-white even:bg-[#fafbfc]">
                    <td className="max-w-[320px] truncate px-5 py-3" title={record.target}>{record.target}</td>
                    <td className="px-4 py-3">{employeeName}</td>
                    <td className="whitespace-nowrap px-4 py-3">{dayjs(record.deadline).format("DD MMM YYYY")}</td>
                    <td className="px-4 py-3">{record.workingDays}</td>
                    <td className="px-4 py-3"><span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-pmedium ${statusClasses[record.status]}`}>● &nbsp;{record.status}</span></td>
                  </tr>
                )) : <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500">No pending KPA deadlines</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Section>
      </div>
    </>
  );
};

export default KraKpaEmployeeInsights;
