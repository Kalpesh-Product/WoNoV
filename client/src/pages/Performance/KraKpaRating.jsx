import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Chip, CircularProgress, Popover } from "@mui/material";
import { DateRangePicker } from "react-date-range";
import { MdCalendarToday } from "react-icons/md";
import ReactApexChart from "react-apexcharts";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import AgTable from "../../components/AgTable";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import WidgetSection from "../../components/WidgetSection";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import DailyLogTypeChip from "./DailyLogTypeChip";

const formatUserName = (user) =>
  user && typeof user === "object"
    ? [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ") || "-"
    : "-";

const formatDate = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD-MM-YYYY") : "-";
const formatTime = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format("hh:mm A") : "-";

const initialDateRange = () => ({
  startDate: dayjs().startOf("month").toDate(),
  endDate: dayjs().endOf("month").toDate(),
  key: "selection",
});

const statusChip = ({ value }) => (
  <Chip
    size="small"
    label={value || "Pending"}
    sx={
      ["Completed", "Closed", "Done"].includes(value)
        ? { backgroundColor: "#d8f0df", color: "#16784d" }
        : value === "Changes Required"
          ? { backgroundColor: "#fde2e2", color: "#b42318" }
          : { backgroundColor: "#ffedc9", color: "#ad7000" }
    }
  />
);

const ratingValue = ({ value }) =>
  value === null || value === undefined ? "Not rated" : String(value);

const formatPercentage = (value) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2);

const KraKpaRating = ({ type = "kpa" }) => {
  const axios = useAxiosPrivate();
  const location = useLocation();
  const { auth } = useAuth();
  const selectedDepartment = useSelector(
    (state) => state.performance.selectedDepartment,
  );
  const selectedDepartmentName = useSelector(
    (state) => state.performance.selectedDepartmentName,
  );
  const selectedMember = useSelector(
    (state) => state.performance.selectedMember,
  );
  const isIndividualRoute = location.pathname.includes(
    "/kra-kpa/individual/",
  );
  const member = isIndividualRoute
    ? null
    : location.state?.selectedMember || selectedMember;
  const departmentId = isIndividualRoute
    ? auth?.user?.departments?.[0]?._id
    : location.state?.selectedDepartment ||
      selectedDepartment ||
      auth?.user?.departments?.[0]?._id;
  const departmentName = isIndividualRoute
    ? auth?.user?.departments?.[0]?.name
    : location.state?.selectedDepartmentName ||
      selectedDepartmentName ||
      auth?.user?.departments?.find(
        (department) => String(department?._id) === String(departmentId),
      )?.name;
  const employeeId = member?.memberId || auth?.user?._id;
  const employeeName =
    member?.memberName ||
    [auth?.user?.firstName, auth?.user?.middleName, auth?.user?.lastName]
      .filter(Boolean)
      .join(" ");
  const isKpaRating = type === "kpa";
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [dailyLogMonth, setDailyLogMonth] = useState(() =>
    dayjs().startOf("month"),
  );
  const [dailyLogDrilldown, setDailyLogDrilldown] = useState(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["kraKpaRatings", type, departmentId, employeeId],
    enabled: Boolean(departmentId && employeeId),
    queryFn: async () => {
      const response = await axios.get(
        isKpaRating
          ? "/api/kra-kpa/individual-monthly-kpa"
          : "/api/kra-kpa/daily-log",
        { params: { department: departmentId, employee: employeeId } },
      );
      return response.data || [];
    },
  });

  const filteredRecords = useMemo(
    () =>
      isKpaRating
        ? records.filter((record) => {
            if (!record.month) return false;
            const recordStart = dayjs(`${record.month}-01`).startOf("month");
            const recordEnd = recordStart.endOf("month");
            return (
              recordStart.isBefore(dayjs(dateRange.endDate).endOf("day")) &&
              recordEnd.isAfter(dayjs(dateRange.startDate).startOf("day"))
            );
          })
        : records,
    [records, isKpaRating, dateRange],
  );

  const tableData = useMemo(
    () =>
      filteredRecords.map((record, index) => ({
        ...record,
        srNo: index + 1,
        dateLabel: formatDate(record.date),
        deadlineLabel: formatDate(record.deadline),
        assignedByName: formatUserName(record.createdBy),
        reviewStatus: record.verification || "Pending",
        finalClosure:
          record.hrRating === null || record.hrRating === undefined
            ? "Pending"
            : "Completed",
      })),
    [filteredRecords],
  );

  const kpaChartData = useMemo(() => {
    if (!isKpaRating) return { categories: [], completed: [], pending: [] };
    const categories = [];
    const completed = [];
    const pending = [];
    let monthCursor = dayjs(dateRange.startDate).startOf("month");
    const lastMonth = dayjs(dateRange.endDate).startOf("month");

    while (monthCursor.valueOf() <= lastMonth.valueOf()) {
      const monthKey = monthCursor.format("YYYY-MM");
      const monthRecords = filteredRecords.filter(
        (record) => record.month === monthKey,
      );
      const completedCount = monthRecords.filter(
        (record) => record.status === "Completed",
      ).length;
      const total = monthRecords.length;
      categories.push(monthCursor.format("MMM-YY"));
      completed.push(total ? Number(((completedCount / total) * 100).toFixed(2)) : 0);
      pending.push(
        total ? Number((((total - completedCount) / total) * 100).toFixed(2)) : 0,
      );
      monthCursor = monthCursor.add(1, "month");
    }

    return { categories, completed, pending };
  }, [filteredRecords, isKpaRating, dateRange]);

  const completedKpaCount = filteredRecords.filter(
    (record) => record.status === "Completed",
  ).length;
  const pendingKpaCount = filteredRecords.length - completedKpaCount;
  const kpaRatingSummary = useMemo(() => {
    const totalKpas = filteredRecords.length;
    if (!totalKpas) {
      return { finalRating: 0, yetToBeRated: 0 };
    }
    const managerRatingSum = filteredRecords.reduce(
      (sum, record) => sum + Number(record.kpaRating ?? 0),
      0,
    );
    const hrRatingSum = filteredRecords.reduce(
      (sum, record) => sum + Number(record.hrRating ?? 0),
      0,
    );
    const managerPercentage = (managerRatingSum / totalKpas) * 100;
    const hrPercentage = (hrRatingSum / totalKpas) * 100;
    const yetToBeRated = filteredRecords.filter(
      (record) =>
        record.kpaRating === null ||
        record.kpaRating === undefined ||
        record.hrRating === null ||
        record.hrRating === undefined,
    ).length;
    return {
      finalRating: (managerPercentage + hrPercentage) / 2,
      yetToBeRated,
    };
  }, [filteredRecords]);
  const kpaChartSeries = [
    { name: "Completed KPA", data: kpaChartData.completed },
    { name: "Pending KPA", data: kpaChartData.pending },
  ];
  const kpaChartOptions = {
    chart: {
      type: "bar",
      stacked: true,
      stackType: "100%",
      fontFamily: "Poppins-Regular",
      toolbar: { show: false },
      animations: { enabled: false },
    },
    colors: ["#55c7aa", "#f26452"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "38%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ["#ffffff"] },
    xaxis: { categories: kpaChartData.categories },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      title: { text: "Completion (%)" },
      labels: { formatter: (value) => `${Math.round(value)}%` },
    },
    legend: { position: "top", horizontalAlign: "center" },
    tooltip: { y: { formatter: (value) => `${value.toFixed(2)}%` } },
    grid: { borderColor: "#e5e7eb" },
  };

  const kpaColumns = [
    { headerName: "Sr No", field: "srNo", width: 85 },
    { headerName: "KPA", field: "target", minWidth: 280, flex: 2 },
    { headerName: "Assigned By", field: "assignedByName", minWidth: 180 },
    { headerName: "Deadline", field: "deadlineLabel", width: 155 },
    {
      headerName: "KPA Status",
      field: "status",
      width: 145,
      cellRenderer: statusChip,
    },
    {
      headerName: "Review Status",
      field: "reviewStatus",
      width: 175,
      cellRenderer: statusChip,
    },
    {
      headerName: "Final Closure",
      field: "finalClosure",
      width: 160,
      cellRenderer: statusChip,
    },
    {
      headerName: "Manager Rating",
      field: "kpaRating",
      width: 170,
      valueFormatter: ratingValue,
    },
    {
      headerName: "HR Rating",
      field: "hrRating",
      width: 145,
      valueFormatter: ratingValue,
    },
  ];

  const dailyLogMatrix = useMemo(() => {
    if (isKpaRating) {
      return {
        rows: [],
        columns: [],
        chartCategories: [],
        assignedCounts: [],
        closedCounts: [],
        carriedForwardCounts: [],
      };
    }
    const monthRecords = records.filter(
      (record) =>
        record.date && dayjs(record.date).isSame(dailyLogMonth, "month"),
    );
    const today = dayjs().startOf("day");
    const daysInMonth = dailyLogMonth.daysInMonth();
    const statsByDay = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const occurrenceDate = dailyLogMonth.date(day).startOf("day");
      const dayRecords = monthRecords.filter(
        (record) => dayjs(record.date).date() === day,
      );
      const total = dayRecords.length;
      const closed = dayRecords.filter(
        (record) => record.status === "Done",
      ).length;
      const carriedForward = occurrenceDate.isBefore(today)
        ? Math.max(total - closed, 0)
        : 0;
      const toPercentage = (value) =>
        total ? `${Math.round((value / total) * 100)}%` : "";
      return {
        day,
        records: dayRecords,
        total: total || "",
        closed: total ? closed : "",
        carriedForward: total ? carriedForward : "",
        performance: toPercentage(closed),
        delayed: toPercentage(carriedForward),
        overall: toPercentage(Math.min(total, closed + carriedForward)),
      };
    });
    const rowDefinitions = [
      { metric: "Tasks Assured for Closure", key: "total", tone: "total" },
      { metric: "Tasks Closed", key: "closed", tone: "closed" },
      {
        metric: "Tasks Carried Forward",
        key: "carriedForward",
        tone: "delayed",
      },
      {
        metric: "Day Performance Score",
        key: "performance",
        tone: "closed",
      },
      { metric: "Delayed Tasks", key: "delayed", tone: "delayed" },
      { metric: "Overall", key: "overall", tone: "overall" },
    ];
    const rows = rowDefinitions.map((definition) => ({
      metric: definition.metric,
      metricKey: definition.key,
      tone: definition.tone,
      ...Object.fromEntries(
        statsByDay.map((stats) => [
          `day${stats.day}`,
          stats[definition.key],
        ]),
      ),
    }));
    const dayColumns = statsByDay.map(({ day, records: dayRecords }) => {
      const date = dailyLogMonth.date(day);
      return {
        field: `day${day}`,
        headerName: String(day),
        width: 90,
        minWidth: 90,
        sortable: false,
        filter: false,
        suppressMovable: true,
        headerComponent: () => (
          <div className="flex w-full flex-col items-center leading-tight">
            <span className="font-semibold">{day}</span>
            <span className="mt-1 text-xs text-gray-500">
              {date.format("ddd")}
            </span>
          </div>
        ),
        cellStyle: { textAlign: "center" },
        cellRenderer: ({ data, value }) => {
          if (value === "" || value === null || value === undefined) return null;
          const toneStyles = {
            total: "bg-blue-50 text-blue-700",
            closed: "bg-emerald-50 text-emerald-700",
            delayed: "bg-red-50 text-red-700",
            overall: "bg-indigo-50 text-indigo-700",
          };
          const isTaskCount = ["total", "closed", "carriedForward"].includes(
            data.metricKey,
          );
          const isClickable = isTaskCount && Number(value) > 0;
          const valueClassName = `inline-flex min-w-12 justify-center rounded-md px-2 py-1 font-medium ${toneStyles[data.tone]}`;
          const openDrilldown = () => {
            const selectedRecords =
              data.metricKey === "closed"
                ? dayRecords.filter((record) => record.status === "Done")
                : data.metricKey === "carriedForward"
                  ? dayRecords.filter((record) => record.status !== "Done")
                  : dayRecords;
            setDailyLogDrilldown({
              title: `${data.metric} - ${date.format("DD MMM YYYY")}`,
              records: selectedRecords.map((record, index) => ({
                ...record,
                srNo: index + 1,
              })),
            });
          };

          return (
            <div className="flex h-full items-center justify-center py-2">
              {isClickable ? (
                <button
                  type="button"
                  className={`${valueClassName} cursor-pointer transition hover:ring-2 hover:ring-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                  aria-label={`View ${data.metric.toLowerCase()} for ${date.format("DD MMM YYYY")}`}
                  onClick={openDrilldown}
                >
                  {value}
                </button>
              ) : (
                <span className={valueClassName}>{value}</span>
              )}
            </div>
          );
        },
      };
    });
    return {
      rows,
      chartCategories: statsByDay.map(({ day }) => String(day)),
      assignedCounts: statsByDay.map(({ total }) => Number(total || 0)),
      closedCounts: statsByDay.map(({ closed }) => Number(closed || 0)),
      carriedForwardCounts: statsByDay.map(({ carriedForward }) =>
        Number(carriedForward || 0),
      ),
      columns: [
        {
          field: "metric",
          headerName: `DAILY TASKS - ${dailyLogMonth.format("MMMM YYYY").toUpperCase()}`,
          pinned: "left",
          lockPinned: true,
          lockPosition: true,
          width: 290,
          minWidth: 290,
          sortable: false,
          filter: false,
          suppressMovable: true,
          cellClass: "font-semibold text-primary bg-white",
        },
        ...dayColumns,
      ],
    };
  }, [records, isKpaRating, dailyLogMonth]);

  const dailyLogChartSeries = [
    { name: "Assigned Tasks", data: dailyLogMatrix.assignedCounts },
    { name: "Closed Tasks", data: dailyLogMatrix.closedCounts },
    {
      name: "Carried Forward Tasks",
      data: dailyLogMatrix.carriedForwardCounts,
    },
  ];
  const dailyLogChartOptions = {
    chart: {
      type: "bar",
      fontFamily: "Poppins-Regular",
      toolbar: { show: false },
      animations: { enabled: false },
    },
    colors: ["#5b8def", "#55c7aa", "#f59e0b"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: dailyLogMatrix.chartCategories,
      title: { text: "Day of Month" },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      title: { text: "Tasks" },
      labels: { formatter: (value) => Math.round(value) },
    },
    legend: { position: "top", horizontalAlign: "center" },
    tooltip: { y: { formatter: (value) => `${value} tasks` } },
    grid: { borderColor: "#e5e7eb" },
  };

  const dailyLogDrilldownColumns = [
    { headerName: "Sr No", field: "srNo", width: 85 },
    {
      headerName: "Task",
      field: "dayTaskName",
      minWidth: 260,
      flex: 2,
    },
    {
      headerName: "Type",
      field: "type",
      width: 130,
      cellRenderer: DailyLogTypeChip,
    },
    {
      headerName: "Task Source",
      field: "taskSource",
      width: 160,
      valueGetter: ({ data }) =>
        data.carriedFromDailyLog || data.isCarryForward ? "Carry Forward" : "New Task",
      cellRenderer: ({ value }) => (
        <Chip
          size="small"
          label={value}
          sx={
            value === "Carry Forward"
              ? { backgroundColor: "#ede9fe", color: "#6d28d9" }
              : { backgroundColor: "#dbeafe", color: "#1d4ed8" }
          }
        />
      ),
    },
    {
      headerName: "Status",
      field: "status",
      width: 125,
      cellRenderer: statusChip,
    },
    {
      headerName: "Deadline",
      field: "deadline",
      width: 145,
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      headerName: "Start Time",
      field: "startTime",
      width: 140,
      valueFormatter: ({ value }) => formatTime(value),
    },
    {
      headerName: "End Time",
      field: "endTime",
      width: 140,
      valueFormatter: ({ value }) => formatTime(value),
    },
    {
      headerName: "Resource Comment",
      field: "resourceComment",
      minWidth: 220,
      flex: 1,
    },
  ];

  return (
    <PageFrame>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title font-pmedium uppercase text-primary">
          {departmentName ? `${departmentName} - ` : ""}
          {employeeName}
        </h1>
      </div>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <>
          {isKpaRating && (
            <div className="mb-6">
              <WidgetSection
                border
                title="Monthly KPA Completion Overview"
                headerRightContent={
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip
                      label={`Total: ${filteredRecords.length}`}
                      sx={{ backgroundColor: "#dbe5ff", color: "#24344d" }}
                    />
                    <Chip
                      label={`Completed: ${completedKpaCount}`}
                      sx={{ backgroundColor: "#d2f1e8", color: "#16784d" }}
                    />
                    <Chip
                      label={`Pending: ${pendingKpaCount}`}
                      sx={{ backgroundColor: "#ffd9d4", color: "#b42318" }}
                    />
                  </div>
                }
              >
                <ReactApexChart
                  options={kpaChartOptions}
                  series={kpaChartSeries}
                  type="bar"
                  height={360}
                />
              </WidgetSection>
            </div>
          )}
          {!isKpaRating && (
            <>
              <div className="mb-6">
                <WidgetSection
                  border
                  title="Daily Tasks Assigned, Closed and Carried Forward"
                >
                  <ReactApexChart
                    type="bar"
                    height={330}
                    options={dailyLogChartOptions}
                    series={dailyLogChartSeries}
                  />
                </WidgetSection>
              </div>
              <div className="mb-1 flex justify-center">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    views={["year", "month"]}
                    format="MMM-YY"
                    value={dailyLogMonth}
                    onChange={(value) => {
                      if (value?.isValid()) {
                        setDailyLogMonth(value.startOf("month"));
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { width: 150 },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </>
          )}
          {isKpaRating && (
            <>
              <div className="mb-1 flex flex-wrap items-center justify-center gap-2">
                <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
                  {dayjs(dateRange.startDate).format("DD MMM YYYY")}
                </div>
                <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
                  {dayjs(dateRange.endDate).format("DD MMM YYYY")}
                </div>
                <button
                  type="button"
                  aria-label="Select date range"
                  className="rounded-md bg-primary p-3 text-white"
                  onClick={(event) => setCalendarAnchor(event.currentTarget)}
                >
                  <MdCalendarToday size={20} />
                </button>
              </div>
              <Popover
                open={Boolean(calendarAnchor)}
                anchorEl={calendarAnchor}
                onClose={() => setCalendarAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
              >
                <DateRangePicker
                  ranges={[dateRange]}
                  onChange={({ selection }) => setDateRange(selection)}
                  moveRangeOnFirstSelection={false}
                  direction="vertical"
                />
              </Popover>
            </>
          )}
          {isKpaRating ? (
            <AgTable
              showDateControls={false}
              data={tableData}
              columns={kpaColumns}
              hideTitle
              search
              searchRowActions={
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <Chip
                    label={`Final KPA Rating: ${formatPercentage(kpaRatingSummary.finalRating)}%`}
                    sx={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}
                  />
                  <Chip
                    label={`Pending Closure: ${kpaRatingSummary.yetToBeRated}`}
                    sx={{ backgroundColor: "#fef3c7", color: "#b45309" }}
                  />
                </div>
              }
              searchRowActionsPosition="right"
              exportData
              hideFilter
              processExportCell={({ value }) => value ?? ""}
              tableHeight={Math.max(
                300,
                Math.min(650, tableData.length * 58 + 90),
              )}
            />
          ) : (
            <AgTable
              data={dailyLogMatrix.rows}
              columns={dailyLogMatrix.columns}
              hideTitle
              exportData
              hideFilter
              processExportCell={({ value }) => value ?? ""}
              tableHeight={Math.max(
                300,
                Math.min(650, dailyLogMatrix.rows.length * 58 + 90),
              )}
            />
          )}
          {!isKpaRating && (
            <div className="mt-6">
              <WidgetSection border title="Performance Rating">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-content">
                  <tbody>
                    <tr className="bg-[#df9995] text-black">
                      <td className="border-r border-white/50 px-4 py-2">
                        Poor &amp; PIP Situation/Notice Situation
                      </td>
                      <td className="w-[32%] px-4 py-2 text-center font-pmedium">
                        60% or Below
                      </td>
                    </tr>
                    <tr className="bg-[#c9e7f3] text-black">
                      <td className="border-r border-white/50 px-4 py-2">
                        Can Do Better
                      </td>
                      <td className="px-4 py-2 text-center font-pmedium">
                        70% or Below
                      </td>
                    </tr>
                    <tr className="bg-[#f5bd8f] text-black">
                      <td className="border-r border-white/50 px-4 py-2">
                        Average
                      </td>
                      <td className="px-4 py-2 text-center font-pmedium">
                        80% or Below
                      </td>
                    </tr>
                    <tr className="bg-[#ffe69a] text-black">
                      <td className="border-r border-white/50 px-4 py-2">
                        Great
                      </td>
                      <td className="px-4 py-2 text-center font-pmedium">
                        90% or Below
                      </td>
                    </tr>
                    <tr className="bg-[#76943a] text-white">
                      <td className="border-r border-white/50 px-4 py-2">
                        Super
                      </td>
                      <td className="px-4 py-2 text-center font-pmedium">
                        Above 90%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              </WidgetSection>
            </div>
          )}
          <MuiModal
            open={Boolean(dailyLogDrilldown)}
            onClose={() => setDailyLogDrilldown(null)}
            title={dailyLogDrilldown?.title || "Daily Logs"}
            widthClass="w-[calc(100vw-2rem)] max-w-[960px]"
          >
            <AgTable
              data={dailyLogDrilldown?.records || []}
              columns={dailyLogDrilldownColumns}
              hideTitle
              hideFilter
              tableHeight={Math.max(
                260,
                Math.min(
                  600,
                  (dailyLogDrilldown?.records?.length || 0) * 58 + 90,
                ),
              )}
            />
          </MuiModal>
        </>
      )}
    </PageFrame>
  );
};

export default KraKpaRating;
