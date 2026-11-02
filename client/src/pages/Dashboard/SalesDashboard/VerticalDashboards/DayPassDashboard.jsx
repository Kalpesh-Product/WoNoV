import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { FiChevronRight, FiGrid, FiX } from "react-icons/fi";
import {
  MdAccessTime,
  MdBarChart,
  MdEventAvailable,
  MdGroupAdd,
  MdGroups,
  MdKeyboardArrowDown,
  MdPersonAddAlt1,
  MdShoppingBag,
  MdOutlineRemoveRedEye,
  MdShowChart,
  MdTrendingDown,
  MdTrendingUp,
} from "react-icons/md";
import { LuChartNoAxesCombined as ChartNoAxesCombined } from "react-icons/lu";
import dayPassBanner from "../../../../assets/day-pass-banner.png";
import { PERMISSIONS } from "../../../../constants/permissions";
import useUserPermissions from "../../../../hooks/useUserPermissions";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import WidgetSection from "../../../../components/WidgetSection";
import PieChartMui from "../../../../components/graphs/PieChartMui";
import AgTable from "../../../../components/AgTable";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import MuiModal from "../../../../components/MuiModal";
import humanDate from "../../../../utils/humanDateForamt";
import humanTime from "../../../../utils/humanTime";
import MeetingRevenue from "../MeetingRevenue";
import LeadsLayout from "../ViewClients/LeadsLayout";

const BiznestTitle = () => (
  <span
    aria-label="BIZNest"
    className="inline-flex shrink-0 items-baseline whitespace-nowrap leading-none text-[#2a2525]"
  >
    <span>BI</span>
    <span className="text-[#e33434]">Z</span>
    <span>
      &nbsp;N<span className="lowercase">est</span>
    </span>
  </span>
);

const DayPassUniqueClientsGraph = () => {
  const axios = useAxiosPrivate();
  const { data: dayPassRevenue = [] } = useQuery({
    queryKey: ["day-pass-unique-client-revenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/simple-consolidated-revenue");
      const revenue = Array.isArray(response.data?.meetingRevenue)
        ? response.data.meetingRevenue
        : [];

      return revenue.filter((row) => {
        const type = String(
          row?.meetingType ||
            row?.meetingTypeRaw ||
            row?.particulars ||
            row?.visitorDetails?.purposeOfVisit ||
            "",
        ).toLowerCase();

        if (row?.source === "day-pass") return true;

        const isMeetingRoomRecord =
          Boolean(row?.meetingRoomName) || type.includes("meeting room booking");
        const isDayPassType =
          type.includes("open desk") ||
          type.includes("half-day") ||
          type.includes("half day") ||
          type.includes("full-day") ||
          type.includes("full day");

        return isDayPassType && !isMeetingRoomRecord;
      });
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const clientsByMonth = useMemo(() => {
    const grouped = {};

    dayPassRevenue.forEach((row) => {
      const date = dayjs(row?.date || row?.createdAt);
      if (!date.isValid()) return;

      const month = date.format("MMMM");
      grouped[month] ||= [];
      grouped[month].push({
        client:
          row?.client?.clientName ||
          row?.clientName ||
          row?.meetingCompanyName ||
          row?.visitorDetails?.visitorCompany ||
          "Unknown",
        typeOfClient: "Open Desk",
        date: date.format("YYYY-MM-DD"),
        invoiceId: row?._id || row?.id,
      });
    });

    return Object.entries(grouped).map(([month, clients]) => ({ month, clients }));
  }, [dayPassRevenue]);
  const currentDate = dayjs();
  const financialYearStart =
    currentDate.month() >= 3 ? currentDate.year() : currentDate.year() - 1;
  const financialYearLabel = `${financialYearStart}-${String(
    financialYearStart + 1,
  ).slice(-2)}`;

  return (
    <LeadsLayout
      data={clientsByMonth}
      hideAccordion
      title={
        <span className="inline-flex items-baseline gap-2 whitespace-nowrap leading-none text-[#1E3D73]">
          <BiznestTitle />
          <span className="inline-flex items-baseline leading-none">
            DAY PASS UNIQUE CLIENT COUNT - FY {financialYearLabel}
          </span>
        </span>
      }
      titleAmount={({ count }) =>
        `TOTAL UNIQUE CLIENTS: ${count.toLocaleString("en-IN")}`
      }
      hideMonthAxisTitle
      noOuterPadding
      investorBlueStyle
      investorTitleAmountChip
      hideFinancialYearControls
      focusedClientSeries="Open Desk"
      actualMonthLag={2}
      virtualOfficeActualLegend="Actual Day Pass Client"
      virtualOfficeProjectedLegend="Remaining KRA Target"
      virtualOfficeActualColor="#3cb37180"
      virtualOfficeProjectedColor="#787878"
      virtualOfficeTooltipLabel="Day Pass Client"
      virtualOfficeDataLabelsAbove
    />
  );
};

const DayPassOperationalCharts = ({ chartView = null, visibleCharts: requestedCharts }) => {
  const axios = useAxiosPrivate();
  const { data: revenueRows = [], isLoading } = useQuery({
    queryKey: ["day-pass-operational-charts"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/simple-consolidated-revenue");
      return Array.isArray(response.data?.meetingRevenue)
        ? response.data.meetingRevenue
        : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const fiscalYear = useMemo(() => {
    const now = dayjs();
    const startYear = now.month() >= 3 ? now.year() : now.year() - 1;
    return {
      startYear,
      label: `${startYear}-${String(startYear + 1).slice(-2)}`,
    };
  }, []);
  const chartData = useMemo(() => {
    const start = dayjs().year(fiscalYear.startYear).month(3).startOf("month");
    const end = start.add(1, "year");
    const currentMonth = dayjs().startOf("month");
    const fiscalMonths = Array.from({ length: 12 }, (_, index) =>
      start.add(index, "month"),
    );
    const latestActualMonthIndex = fiscalMonths.reduce(
      (latestIndex, month, index) =>
        !currentMonth.isBefore(month.add(2, "month"), "month")
          ? index
          : latestIndex,
      -1,
    );
    const isCurrentFY = (row) => {
      const date = dayjs(row?.date || row?.createdAt);
      return date.isValid() && !date.isBefore(start) && date.isBefore(end);
    };
    const dayPassRows = revenueRows.filter(
      (row) => row?.source === "day-pass" && isCurrentFY(row),
    );
    const actualDayPassRows = dayPassRows.filter((row) => {
      const date = dayjs(row?.date || row?.createdAt);
      const monthIndex = fiscalMonths.findIndex((month) => month.isSame(date, "month"));
      return monthIndex >= 0 && monthIndex <= latestActualMonthIndex;
    });
    const halfDayCount = actualDayPassRows.filter((row) =>
      String(row?.meetingType || "").toLowerCase().includes("half"),
    ).length;
    const fullDayCount = actualDayPassRows.filter((row) =>
      String(row?.meetingType || "").toLowerCase().includes("full"),
    ).length;
    const externalClientCount = actualDayPassRows.length;

    return {
      booking: [
        { label: "Half Day Pass", value: halfDayCount },
        { label: "Full Day Pass", value: fullDayCount },
      ],
      externalClientCount,
      externalClients: [{ label: "External Clients", value: externalClientCount }],
    };
  }, [fiscalYear, revenueRows]);
  const chartDefinitions = {
    booking: {
      title: "DAY PASS BOOKINGS",
      colors: ["#0878f9", "#ff9f0a"],
    },
    externalClients: {
      title: "DAY PASS EXTERNAL CLIENTS",
      colors: ["#0878f9", "#d9e4f5"],
    },
  };
  const visibleCharts = (requestedCharts || (chartView ? [chartView] : ["booking", "externalClients"]))
    .filter((key) => chartDefinitions[key]);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {visibleCharts.map((key) => {
        const chart = chartDefinitions[key];
        const data = chartData[key];
        const hasChartData = data.some((item) => item.value > 0);

        return (
          <WidgetSection
            key={key}
            title={
              <span className="inline-flex items-baseline gap-2 whitespace-nowrap text-[#1E3D73]">
                <BiznestTitle />
                <span>{chart.title} - FY {fiscalYear.label}</span>
              </span>
            }
            border
            borderColor="#1E3D73"
            bodyBorderColor="#9FB2CF"
            autoHeight
          >
            {!isLoading && hasChartData ? (
              <PieChartMui
                data={data}
                options={{
                  chart: { type: "pie", fontFamily: "Poppins-Regular" },
                  labels: data.map((item) => item.label),
                  colors: chart.colors,
                  legend: { show: true, labels: { colors: "#1E3D73" } },
                  dataLabels: {
                    formatter: (percentage) =>
                      key === "externalClients"
                        ? String(chartData.externalClientCount)
                        : `${percentage.toFixed(1)}%`,
                  },
                  tooltip: {
                    y: {
                      formatter: (value) =>
                        key === "externalClients"
                          ? `${chartData.externalClientCount} clients`
                          : String(value),
                    },
                  },
                }}
                width={500}
                height={350}
                centerAlign
              />
            ) : (
              <div className="flex h-[350px] items-center justify-center text-sm text-[#1E3D73]">
                {isLoading ? "Loading chart data…" : "No chart data available"}
              </div>
            )}
          </WidgetSection>
        );
      })}
    </div>
  );
};

const DayPassClientDetailsToday = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const [selectedVisit, setSelectedVisit] = useState(null);
  const today = dayjs().format("YYYY-MM-DD");
  const { data: visitors = [] } = useQuery({
    queryKey: ["day-pass-client-details-today", today],
    queryFn: async () => {
      const date = dayjs();
      const response = await axios.get("/api/visitors/fetch-visitors", {
        params: {
          type: "day-pass",
          visitorFlag: "Client",
          page: 1,
          limit: 500,
          searchContext: "finance-day-pass",
          filters: {
            startDate: date.startOf("day").toISOString(),
            endDate: date.endOf("day").toISOString(),
          },
        },
      });

      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const rows = useMemo(
    () =>
      visitors.flatMap((visitor) =>
        (Array.isArray(visitor?.externalVisits) ? visitor.externalVisits : [])
          .filter((visit) =>
            ["full-day pass", "half-day pass"].includes(
              String(visit?.visitorType || "").trim().toLowerCase(),
            ),
          )
          .map((visit, index) => ({
            id: visit?._id || `${visitor?._id}-${index}`,
            visitorId: visitor?._id,
            visitorRecord: visitor,
            visitRecord: visit,
            visitorType: visit?.visitorType || "N/A",
            name: `${visitor?.firstName || ""} ${visitor?.lastName || ""}`.trim() || "N/A",
            company:
              visitor?.registeredClientCompany ||
              visitor?.visitorCompany ||
              visitor?.brandName ||
              "N/A",
            purposeOfVisit:
              visit?.purposeOfVisit || visitor?.purposeOfVisit || "N/A",
            email: visitor?.email || "N/A",
            phoneNumber: visitor?.phoneNumber || "N/A",
            dateOfVisit: visit?.dateOfVisit ? humanDate(new Date(visit.dateOfVisit)) : "N/A",
            checkIn: humanTime(visit?.checkIn),
            checked: humanTime(visit?.checkOut),
          })),
      ),
    [visitors],
  );
  const checkedInCount = rows.filter(
    (row) => Boolean(row.visitRecord?.checkIn) && !row.visitRecord?.checkOut,
  ).length;
  const checkedOutCount = rows.filter((row) => Boolean(row.visitRecord?.checkOut)).length;
  const columns = [
    { field: "srNo", headerName: "S.No", width: 78, valueGetter: (params) => params.node.rowIndex + 1 },
    { field: "visitorType", headerName: "Visitor Type", minWidth: 130 },
    { field: "name", headerName: "Name", minWidth: 140 },
    { field: "company", headerName: "Company", minWidth: 150 },
    { field: "purposeOfVisit", headerName: "Purpose", minWidth: 150 },
    { field: "email", headerName: "Email", minWidth: 190 },
    { field: "phoneNumber", headerName: "Phone No", minWidth: 130 },
    { field: "dateOfVisit", headerName: "Date of Visit", minWidth: 130 },
    { field: "checkIn", headerName: "Check In", minWidth: 110 },
    { field: "checked", headerName: "Checked", minWidth: 110 },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: ({ data }) => {
        const openHistory = () =>
          navigate(
            `/app/dashboard/sales-dashboard/day-pass/manage-day-pass/external-clients/visitor-history/${data.visitorId}?type=client`,
            { state: { breadcrumbLabel: data.name || "Day Pass Client" } },
          );

        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`View ${data.name} details`}
              onClick={() => setSelectedVisit(data)}
              className="rounded-full bg-[#eaf4ff] p-2 text-[#0878f9] hover:bg-[#dbeafe]"
            >
              <MdOutlineRemoveRedEye />
            </button>
            <ThreeDotMenu
              menuItems={[
                {
                  label: "Update",
                  onClick: () =>
                    navigate(
                      "/app/dashboard/sales-dashboard/day-pass/manage-day-pass/external-clients",
                    ),
                },
                { label: "View History", onClick: openHistory },
              ]}
            />
          </div>
        );
      },
    },
  ];
  const visitor = selectedVisit?.visitorRecord;
  const visit = selectedVisit?.visitRecord;
  const formatCurrency = (amount) =>
    `INR ${Number(amount || 0).toLocaleString("en-IN")}`;
  const fileLink = (file) => {
    const url = typeof file === "string" ? file : file?.link || file?.url;
    return url ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="font-pmedium text-[#1E3D73] underline underline-offset-2"
      >
        View File
      </a>
    ) : (
      "—"
    );
  };
  const detailRow = (label, value) => (
    <div
      key={label}
      className="grid grid-cols-[minmax(170px,0.34fr)_12px_minmax(0,1fr)] items-start gap-1 py-2 text-[15px] text-[#1E3D73]"
    >
      <span className="font-pregular">{label}</span>
      <span>:</span>
      <span className="min-w-0 break-words">{value || "—"}</span>
    </div>
  );
  const detailSection = (title, rows, extraClass = "") => (
    <section key={title} className={`space-y-1 ${extraClass}`}>
      <h3 className="mb-2 text-base font-pmedium text-[#1E3D73]">
        {title}
      </h3>
      {rows}
    </section>
  );

  return (
    <>
      <WidgetSection
        title={
          <Link
            to="/app/dashboard/sales-dashboard/day-pass/client-details-today"
            className="inline-flex items-baseline gap-2 whitespace-nowrap text-[#1E3D73]"
          >
            <BiznestTitle />
            <span>DAY PASS CLIENT DETAILS - TODAY</span>
          </Link>
        }
        border
        normalCase
        borderColor="#1E3D73"
        bodyBorderColor="#9FB2CF"
        padding
        autoHeight
        headerRightContent={
          <>
            <span
              className="rounded-lg border px-3 py-1.5 text-sm font-pmedium uppercase text-[#176b3a]"
              style={{
                backgroundImage: "linear-gradient(to right, #3cb37180, #3cb37145)",
                borderColor: "#3cb37180",
              }}
            >
              Check-In: {checkedInCount}
            </span>
            <span
              className="rounded-lg border px-3 py-1.5 text-sm font-pmedium uppercase text-[#9e0000]"
              style={{
                backgroundImage: "linear-gradient(to right, #ff000080, #ff000045)",
                borderColor: "#ff000080",
              }}
            >
              Check-Out: {checkedOutCount}
            </span>
          </>
        }
      >
        <div
          className="text-[#1E3D73] [&_.ag-cell]:!text-[#1E3D73] [&_.ag-header-cell-text]:!text-[#1E3D73] [&_.ag-icon]:!text-[#1E3D73] [&_.ag-paging-panel]:!text-[#1E3D73] [&_.MuiInputBase-input]:!text-[#1E3D73] [&_.MuiInputLabel-root]:!text-[#1E3D73] [&_button]:!text-[#1E3D73]"
          style={{
            "--ag-foreground-color": "#1E3D73",
            "--ag-header-foreground-color": "#1E3D73",
            "--ag-icon-color": "#1E3D73",
          }}
        >
          <AgTable
            hideTitle
            data={rows}
            columns={columns}
            search
            hideFilter
            showDateControls={false}
            gridHeight={420}
          />
        </div>
      </WidgetSection>
      <MuiModal
        open={Boolean(selectedVisit)}
        onClose={() => setSelectedVisit(null)}
        title="VISITOR DETAIL"
        widthClass="w-[min(94vw,760px)]"
      >
        {selectedVisit && (
          <div className="space-y-7 text-[#1E3D73]">
            {detailSection("Client Details", [
              detailRow("First Name", visitor?.firstName),
              detailRow("Last Name", visitor?.lastName),
              detailRow("Email", visitor?.email),
              detailRow("Phone Number", visitor?.phoneNumber),
              detailRow("Gender", visitor?.gender),
              detailRow(
                "Purpose of Visit",
                visit?.purposeOfVisit || visitor?.purposeOfVisit || visit?.visitorType,
              ),
              detailRow(
                "Building",
                visit?.unit?.building?.buildingName || visit?.building?.buildingName,
              ),
              detailRow(
                "Unit",
                visit?.unit?.unitName || visit?.unit?.unitNo || "—",
              ),
            ])}
            {detailSection("Company Details", [
              detailRow("Brand Name", visitor?.brandName),
              detailRow("Registered Company", visitor?.registeredClientCompany),
              detailRow("State", visitor?.state),
              detailRow("City", visitor?.city),
              detailRow("Sector", visitor?.sector),
            ])}
            {detailSection("GST", [
              detailRow("GST Number", visitor?.gstNumber),
              detailRow("Upload File", fileLink(visitor?.gstFile)),
            ])}
            {detailSection("Verification", [
              detailRow("ID Type", visitor?.idProof?.idType),
              detailRow("ID Number", visitor?.idProof?.idNumber),
              detailRow("Upload File", fileLink(visitor?.otherFile)),
            ])}
            {detailSection("Others", [
              detailRow(
                "Date of Visit",
                visit?.dateOfVisit ? humanDate(new Date(visit.dateOfVisit)) : "—",
              ),
              detailRow("Checkin Time", humanTime(visit?.checkIn)),
              detailRow(
                "Checkin By",
                [visit?.checkedInBy?.firstName, visit?.checkedInBy?.lastName]
                  .filter(Boolean)
                  .join(" "),
              ),
              detailRow("Checkout Time", humanTime(visit?.checkOut)),
              detailRow(
                "Checkout By",
                [visit?.checkedOutBy?.firstName, visit?.checkedOutBy?.lastName]
                  .filter(Boolean)
                  .join(" "),
              ),
            ])}
            {detailSection("Payment Details", [
              detailRow("Desk Amount", formatCurrency(visit?.amount)),
              detailRow("Discount", formatCurrency(visit?.discount)),
              detailRow(
                "Taxable Amount",
                formatCurrency(Math.max(Number(visit?.amount || 0) - Number(visit?.discount || 0), 0)),
              ),
              detailRow("GST Amount", formatCurrency(visit?.gstAmount)),
              detailRow("Total Amount", formatCurrency(visit?.totalAmount)),
              detailRow("Status", visit?.paymentStatus ? "Paid" : "Unpaid"),
              detailRow("Payment Proof", fileLink(visit?.paymentProof)),
              detailRow("Payment Mode", visit?.paymentMode || "N/A"),
              detailRow("Payment Verification", visit?.paymentVerification || "Pending"),
            ])}
          </div>
        )}
      </MuiModal>
    </>
  );
};

const DayPassBarsIcon = () => (
  <span className="flex h-8 w-8 items-end justify-center gap-1">
    <span className="h-3 w-1.5 rounded-full bg-current" />
    <span className="h-5 w-1.5 rounded-full bg-current" />
    <span className="h-7 w-1.5 rounded-full bg-current" />
  </span>
);

const DAY_PASS_CARDS = [
  {
    key: "annualRevenueTarget",
    title: "Annual Revenue Target",
    value: "—",
    icon: MdTrendingUp,
    tone: "bg-[#eafbf3] text-[#12a573]",
    valueTone: "text-[#1E3D73]",
    route: "/app/dashboard/sales-dashboard/day-pass/annual-revenue-target",
    permission:
      PERMISSIONS.SALES_VERTICAL_DAY_PASS_ANNUAL_REVENUE_TARGET_CARD.value,
  },
  {
    key: "revenuesBooked",
    title: "Revenues Booked",
    value: "—",
    icon: DayPassBarsIcon,
    tone: "bg-[#ecf9ff] text-[#13a573]",
    valueTone: "text-[#13a573]",
    route: "/app/dashboard/sales-dashboard/day-pass/revenues-booked",
    permission: PERMISSIONS.SALES_VERTICAL_DAY_PASS_REVENUES_BOOKED_CARD.value,
  },
  {
    key: "revenueDue",
    title: "Revenue Due",
    value: "—",
    icon: ChartNoAxesCombined,
    tone: "bg-[#fff0f5] text-[#f04a4a]",
    valueTone: "text-[#f04a4a]",
    route: "/app/dashboard/sales-dashboard/day-pass/revenue-due",
    permission: PERMISSIONS.SALES_VERTICAL_DAY_PASS_REVENUE_DUE_CARD.value,
  },
  {
    key: "averagePrice",
    title: "Average Day Pass Price",
    value: "—",
    icon: MdAccessTime,
    tone: "bg-[#eaf0f8] text-[#3F6291]",
    valueTone: "text-[#1E3D73]",
    route: "/app/dashboard/sales-dashboard/day-pass/average-day-pass-price",
    permission: PERMISSIONS.SALES_VERTICAL_DAY_PASS_AVERAGE_PRICE_CARD.value,
  },
  {
    key: "activeUniqueClient",
    title: "Active Unique Client",
    value: "—",
    icon: MdGroups,
    tone: "bg-[#eaf0f8] text-[#3F6291]",
    valueTone: "text-[#1E3D73]",
    route: "/app/dashboard/sales-dashboard/day-pass/active-unique-client",
    permission:
      PERMISSIONS.SALES_VERTICAL_DAY_PASS_ACTIVE_UNIQUE_CLIENT_CARD.value,
  },
  {
    key: "overallBookings",
    title: "Overall Day Pass Bookings",
    value: "—",
    bookingBreakdown: [
      { label: "External", value: "—", className: "text-[#FF7A1A]" },
    ],
    icon: MdEventAvailable,
    tone: "bg-[#eaf4ff] text-[#3F6291]",
    valueTone: "text-[#1E3D73]",
    route: "/app/dashboard/sales-dashboard/day-pass/overall-bookings",
    permission: PERMISSIONS.SALES_VERTICAL_DAY_PASS_OVERALL_BOOKINGS_CARD.value,
  },
  {
    key: "dayPassBookings",
    title: "Day Pass Bookings",
    value: "—",
    bookingBreakdown: [
      { label: "Half Day", value: "—", className: "text-[#12a573]" },
      { label: "Full Day", value: "—", className: "text-[#f04a4a]" },
    ],
    icon: MdGroupAdd,
    tone: "bg-[#eaf4ff] text-[#3F6291]",
    valueTone: "text-[#1E3D73]",
    route: "/app/dashboard/sales-dashboard/day-pass/day-pass-bookings",
    permission: PERMISSIONS.SALES_VERTICAL_DAY_PASS_MTD_BOOKINGS_CARD.value,
  },
  {
    key: "averageMonthlySurplus",
    title: "Average Shortfall / Surplus",
    value: "—",
    icon: MdTrendingDown,
    tone: "bg-[#eafbf3] text-[#12a573]",
    valueTone: "text-[#13a573]",
    route: "/app/dashboard/sales-dashboard/day-pass/average-monthly-surplus",
    permission:
      PERMISSIONS.SALES_VERTICAL_DAY_PASS_AVERAGE_MONTHLY_SURPLUS_CARD.value,
  },
];

const DayPassSummaryCards = ({ cardView, hasPermission }) => {
  const axios = useAxiosPrivate();
  const { data: dayPassRows = [], isLoading } = useQuery({
    queryKey: ["day-pass-live-summary"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/simple-consolidated-revenue");
      const revenue = Array.isArray(response.data?.meetingRevenue)
        ? response.data.meetingRevenue
        : [];

      return revenue.filter((row) => row?.source === "day-pass");
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const summary = useMemo(() => {
    const currentMonth = dayjs().startOf("month");
    const fiscalYearStart = currentMonth.month() >= 3
      ? currentMonth.year()
      : currentMonth.year() - 1;
    const fiscalYearStartDate = dayjs().year(fiscalYearStart).month(3).startOf("month");
    const fiscalYearEndDate = fiscalYearStartDate.add(1, "year");
    const fiscalMonths = Array.from({ length: 12 }, (_, index) =>
      fiscalYearStartDate.add(index, "month"),
    );
    const fiscalYear = `FY ${fiscalYearStart}-${String(fiscalYearStart + 1).slice(-2)}`;
    const latestActualMonthIndex = fiscalMonths.reduce(
      (latestIndex, month, index) =>
        !currentMonth.isBefore(month.add(2, "month"), "month")
          ? index
          : latestIndex,
      -1,
    );
    const isInFiscalYear = (row) => {
      const date = dayjs(row?.date || row?.createdAt);
      return date.isValid() && !date.isBefore(fiscalYearStartDate) && date.isBefore(fiscalYearEndDate);
    };
    const verifiedRows = dayPassRows.filter(
      (row) =>
        isInFiscalYear(row) &&
        String(row?.financeStatus || "").trim().toLowerCase() === "verified",
    );
    const revenueByMonth = new Map();
    verifiedRows.forEach((row) => {
      const monthKey = dayjs(row.date).format("YYYY-MM");
      revenueByMonth.set(
        monthKey,
        (revenueByMonth.get(monthKey) || 0) +
          (parseFloat(String(row?.taxable || "0").replace(/,/g, "")) || 0),
      );
    });
    const booked = latestActualMonthIndex >= 0
      ? fiscalMonths.slice(0, latestActualMonthIndex + 1).reduce(
          (total, month) => total + (revenueByMonth.get(month.format("YYYY-MM")) || 0),
          0,
        )
      : 0;
    const monthlyAverage = latestActualMonthIndex >= 0
      ? booked / (latestActualMonthIndex + 1)
      : 0;
    const due = monthlyAverage * Math.max(11 - latestActualMonthIndex, 0);
    const latestMonthRevenue = latestActualMonthIndex >= 0
      ? revenueByMonth.get(fiscalMonths[latestActualMonthIndex].format("YYYY-MM")) || 0
      : 0;
    const averageShortfallSurplus = Math.round(
      latestMonthRevenue - monthlyAverage,
    );
    const actualVisits = dayPassRows.filter((row) => {
      if (!isInFiscalYear(row)) return false;
      const date = dayjs(row?.date || row?.createdAt);
      const monthIndex = fiscalMonths.findIndex((month) => month.isSame(date, "month"));
      return monthIndex >= 0 && monthIndex <= latestActualMonthIndex;
    });
    const activeUniqueClients = dayPassRows.filter((row) => {
      if (!isInFiscalYear(row)) return false;
      const date = dayjs(row?.date || row?.createdAt);
      const monthIndex = fiscalMonths.findIndex((month) => month.isSame(date, "month"));

      return monthIndex >= 0 && monthIndex <= latestActualMonthIndex;
    }).length;
    const halfDayBookings = actualVisits.filter((row) =>
      String(row?.meetingType || "").toLowerCase().includes("half"),
    ).length;
    const fullDayBookings = actualVisits.filter((row) =>
      String(row?.meetingType || "").toLowerCase().includes("full"),
    ).length;
    const dayPassBookings = halfDayBookings + fullDayBookings;
    return {
      fiscalYear,
      annualTarget: booked + due,
      booked,
      due,
      averagePrice: activeUniqueClients
        ? Math.round(booked / activeUniqueClients)
        : 0,
      activeUniqueClients,
      overallBookings: dayPassBookings,
      dayPassBookings,
      halfDayBookings,
      fullDayBookings,
      averageShortfallSurplus,
    };
  }, [dayPassRows]);
  const formatMoney = (amount) => `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;
  const cards = DAY_PASS_CARDS.map((card) => {
    const values = {
      annualRevenueTarget: formatMoney(summary.annualTarget),
      revenuesBooked: formatMoney(summary.booked),
      revenueDue: formatMoney(summary.due),
      averagePrice: formatMoney(summary.averagePrice),
      activeUniqueClient: summary.activeUniqueClients.toLocaleString("en-IN"),
      overallBookings: summary.overallBookings.toLocaleString("en-IN"),
      dayPassBookings: summary.dayPassBookings.toLocaleString("en-IN"),
      averageMonthlySurplus: `${formatMoney(Math.abs(summary.averageShortfallSurplus))} ${summary.averageShortfallSurplus > 0 ? "Surplus" : summary.averageShortfallSurplus < 0 ? "Shortfall" : "On Target"}`,
    };
    const bookingBreakdown = card.key === "overallBookings"
      ? [{ ...card.bookingBreakdown[0], value: summary.overallBookings.toLocaleString("en-IN") }]
      : card.key === "dayPassBookings"
        ? [
            { ...card.bookingBreakdown[0], value: summary.halfDayBookings.toLocaleString("en-IN") },
            { ...card.bookingBreakdown[1], value: summary.fullDayBookings.toLocaleString("en-IN") },
          ]
        : card.bookingBreakdown;
    return {
      ...card,
      value: isLoading ? "—" : values[card.key],
      subtitle: summary.fiscalYear,
      bookingBreakdown: bookingBreakdown?.map((item) => ({
        ...item,
        value: isLoading ? "—" : item.value,
      })),
      ...(card.key === "averageMonthlySurplus" && summary.averageShortfallSurplus < 0
        ? { tone: "bg-[#fff0f0] text-[#f04a4a]", valueTone: "text-[#f04a4a]" }
        : {}),
    };
  });
  const visibleCards = cards.filter(
    (card) =>
      hasPermission(card.permission) && (!cardView || card.key === cardView),
  );

  if (visibleCards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {visibleCards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className="flex min-h-[92px] items-center gap-4 rounded-lg border border-[#e8ecf4] bg-white px-5 py-4 text-left shadow-sm"
          >
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${card.tone}`}
            >
              <Icon size={34} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="mb-1 flex items-start justify-between gap-2 text-sm font-pregular leading-tight text-[#1E3D73]">
                <span>{card.title}</span>
                {card.bookingBreakdown && (
                  <span className="shrink-0 font-pmedium">{card.value}</span>
                )}
              </span>
              <span className="mb-1 block text-xs font-semibold text-[#58709A]">
                {card.subtitle || "FY 2024-25"}
              </span>
              {card.bookingBreakdown ? (
                <span className="flex flex-wrap items-center gap-1 whitespace-nowrap text-[11px] font-pmedium text-[#1E3D73] min-[1450px]:text-xs">
                  {card.bookingBreakdown.map((item, index) => (
                    <span key={item.label} className="inline-flex items-center gap-1">
                      {index > 0 && (
                        <span className="text-[#9aa8bd]" aria-hidden="true">
                          |
                        </span>
                      )}
                      <span className={item.className || ""}>
                        {item.label} - {item.value}
                      </span>
                    </span>
                  ))}
                </span>
              ) : (
                <span className={`block text-lg font-pmedium ${card.valueTone}`}>
                  {card.value}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const DayPassDashboard = ({
  cardView,
  uniqueClientsOnly = false,
  dayPassChartView = null,
  clientDetailsTodayOnly = false,
  emptyView = false,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeMenuCard, setActiveMenuCard] = useState(null);
  const { hasPermission } = useUserPermissions();
  const navigate = useNavigate();
  const menuCards = [
    {
      title: "Add Client",
      icon: MdPersonAddAlt1,
      permission: PERMISSIONS.SALES_VERTICAL_DAY_PASS_ADD_CLIENT_MENU.value,
      items: [
        {
          label: "Add Client",
          description: "Add a Day Pass client.",
          icon: MdPersonAddAlt1,
          route: "/app/dashboard/sales-dashboard/day-pass/add-client",
        },
      ],
    },
    {
      title: "Manage Day Pass",
      icon: MdGroups,
      permission: PERMISSIONS.SALES_VERTICAL_DAY_PASS_MANAGE_DAY_PASS_MENU.value,
      items: [
        {
          label: "External Clients",
          description: "Manage Day Pass external clients.",
          icon: MdGroups,
          route: "/app/dashboard/sales-dashboard/day-pass/manage-day-pass/external-clients",
        },
      ],
    },
    {
      title: "Mix Bag",
      icon: MdShoppingBag,
      permission: PERMISSIONS.SALES_VERTICAL_DAY_PASS_MIX_BAG_MENU.value,
      openRoute: "/app/dashboard/sales-dashboard/day-pass/mix-bag",
      items: [
        {
          label: "Repeat Day Pass",
          description: "Create another visit for an existing Day Pass client.",
          icon: MdEventAvailable,
          route: "/app/dashboard/sales-dashboard/day-pass/mix-bag/repeat-day-pass/repeat-external-companies",
        },
        {
          label: "Visitors to Client",
          description: "Convert an internal visitor into a client.",
          icon: MdPersonAddAlt1,
          route: "/app/dashboard/sales-dashboard/day-pass/mix-bag/visitors-to-client/convert-internal-visitors",
        },
      ],
    },
    {
      title: "Report",
      icon: MdBarChart,
      permission: PERMISSIONS.SALES_VERTICAL_DAY_PASS_REPORTS_MENU.value,
      items: [
        {
          label: "Visitor Report",
          description: "View visitor reports for Day Pass entries.",
          icon: MdBarChart,
          route: "/app/dashboard/sales-dashboard/day-pass/reports",
        },
      ],
    },
  ].filter((card) => hasPermission(card.permission));
  const resolvedActiveMenuCard =
    menuCards.find((card) => card.title === activeMenuCard) || menuCards[0];

  if (emptyView) return null;

  if (dayPassChartView) {
    return (
      <div className="p-3 pt-3">
        <DayPassOperationalCharts chartView={dayPassChartView} />
      </div>
    );
  }

  if (clientDetailsTodayOnly) {
    return (
      <div className="p-3 pt-3">
        <DayPassClientDetailsToday />
      </div>
    );
  }

  if (uniqueClientsOnly) {
    return (
      <div className="p-3 pt-3">
        <DayPassUniqueClientsGraph />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-3 pt-3">
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "calc(100vw - 24px)", sm: 680 },
              maxWidth: "calc(100vw - 24px)",
              borderRadius: 2,
              border: "1px solid #e0e8f5",
              mt: 1,
            },
          },
        }}
      >
        {menuCards.length ? (
          <div className="relative grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)]">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuAnchor(null)}
              className="absolute -top-2 right-0 z-20 flex h-7 w-7 items-center justify-center bg-transparent text-[#1E3D73] transition hover:bg-[#ff7777] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8d2f5]"
            >
              <FiX size={17} aria-hidden="true" />
            </button>
            <div className="border-b border-[#e2eaf5] bg-[#f8fbff] p-2 sm:border-b-0 sm:border-r">
              {menuCards.map((card) => {
                const Icon = card.icon;

                return (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => setActiveMenuCard(card.title)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-pmedium text-sm text-[#1E3D73] transition ${
                      resolvedActiveMenuCard?.title === card.title
                        ? "bg-[#e7f1ff]"
                        : "hover:bg-[#eef5ff]"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f1ff] text-lg">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">{card.title}</span>
                    <FiChevronRight className="shrink-0" size={17} />
                  </button>
                );
              })}
            </div>
            <div className="relative min-h-[260px] p-4 sm:p-5">
              {resolvedActiveMenuCard && (() => {
                const Icon = resolvedActiveMenuCard.icon;
                const menuHeader = (
                  <div className="flex items-center gap-3 rounded-xl bg-[#f4f8ff] p-3 pr-10">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e3efff] text-xl text-[#1E3D73]">
                      <Icon aria-hidden="true" />
                    </span>
                    <div className="text-left">
                      <p className="font-psemibold text-base text-[#1E3D73]">
                        {resolvedActiveMenuCard.title}
                      </p>
                      <p className="text-xs text-[#7084a4]">
                        Open Day Pass modules
                      </p>
                    </div>
                  </div>
                );

                return (
                  <>
                    {resolvedActiveMenuCard.openRoute ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuAnchor(null);
                          navigate(resolvedActiveMenuCard.openRoute);
                        }}
                        className="mb-3 block w-full rounded-xl text-left transition hover:ring-1 hover:ring-[#d8e5f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8d2f5]"
                        aria-label="Open Day Pass Mix Bag cards"
                      >
                        {menuHeader}
                      </button>
                    ) : (
                      <div className="mb-3">{menuHeader}</div>
                    )}
                    <div className="max-h-[340px] divide-y divide-[#edf1f7] overflow-y-auto pr-1">
                      {resolvedActiveMenuCard.items.map((item) => {
                        const ItemIcon = item.icon || Icon;

                        return (
                          <button
                            key={item.route}
                            type="button"
                            onClick={() => {
                              setMenuAnchor(null);
                              navigate(item.route);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-[#294a7d] hover:bg-[#f7faff]"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#1E3D73]">
                              <ItemIcon aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-pmedium text-[15px] leading-tight">
                                {item.label}
                              </span>
                              {item.description && (
                                <span className="mt-1 block text-xs leading-tight text-[#7b8eac]">
                                  {item.description}
                                </span>
                              )}
                            </span>
                            <FiChevronRight className="shrink-0" size={17} />
                          </button>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <p className="px-5 py-4 text-center text-sm text-[#7b8eac]">
            No sub-modules available
          </p>
        )}
      </Menu>
      <div className="overflow-hidden rounded-lg">
        <div className="relative h-56 w-full md:h-[17rem] xl:h-[19rem]">
          <img
            src={dayPassBanner}
            alt="Day Pass dashboard banner"
            className="h-full w-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[46%] bg-white/95"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, black 0%, black 84%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, black 0%, black 84%, transparent 100%)",
            }}
          />
          <div className="absolute inset-y-0 left-0 flex w-[48%] flex-col px-3 py-4 sm:px-4 sm:py-6">
            <p className="font-pregular text-xs uppercase tracking-[0.02em] text-[#1E3D73] sm:text-base lg:text-[15px] min-[1700px]:text-base min-[1900px]:text-lg">
              Day Pass Dashboard
            </p>
            <h1 className="mt-6 max-w-full whitespace-nowrap font-serif text-4xl font-semibold leading-[0.9] text-[#1E3D73] drop-shadow-sm sm:mt-10 sm:text-5xl lg:origin-left lg:scale-x-90 lg:text-[42px] xl:text-[46px] min-[1700px]:text-[50px] min-[1900px]:scale-x-100 min-[1900px]:text-[54px]">
              DAY PASS <span className="text-[#E64B4B]">DASHBOARD</span>
            </h1>
            <p className="mt-5 max-w-full font-pmedium text-xl leading-[0.94] text-[#1E3D73] sm:mt-8 sm:text-3xl md:whitespace-nowrap lg:text-[35px] min-[1700px]:text-[39px] min-[1900px]:text-[46px]">
              Day Pass Customers
            </p>
          </div>
          <nav
            aria-label="Day Pass dashboard navigation"
            className="absolute bottom-0 left-0 z-10 flex w-fit max-w-full items-end gap-6 overflow-x-auto px-3 sm:gap-8 sm:px-4 lg:w-[46%] lg:max-w-none lg:justify-between lg:gap-0 lg:overflow-visible"
          >
            {["Annual KPA", "KRA", "Handbook", "Performance Summary"].map(
              (item) => (
                <Link
                  key={item}
                  to=""
                  className="group relative inline-flex shrink-0 items-center pb-0 pt-6 font-pmedium text-xs text-[#1E3D73] sm:text-sm"
                >
                  {item}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#E64B4B] transition-transform duration-200 group-hover:scale-x-100" />
                </Link>
              ),
            )}
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={Boolean(menuAnchor)}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#C8DCFA] bg-[#EEF5FF] px-3 py-2 font-pmedium text-xs text-[#123B82] shadow-sm focus-visible:outline-none sm:text-sm"
            >
              <FiGrid className="text-lg sm:text-xl" aria-hidden="true" />
              <span>Menu</span>
              <MdKeyboardArrowDown className="text-lg" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
      <DayPassSummaryCards
        cardView={cardView}
        hasPermission={hasPermission}
      />
      {!cardView &&
        hasPermission(PERMISSIONS.SALES_VERTICAL_DAY_PASS_REVENUES_GRAPH.value) && (
          <MeetingRevenue
            graphOnly
            dashboardView
            dashboardTitle="DAY PASS REVENUES"
              dashboardClientLabel="Day Pass Client"
          />
        )}
      {!cardView &&
        hasPermission(
          PERMISSIONS.SALES_VERTICAL_DAY_PASS_UNIQUE_CLIENT_COUNT_GRAPH.value,
        ) && <DayPassUniqueClientsGraph />}
      {!cardView &&
        (hasPermission(PERMISSIONS.SALES_VERTICAL_DAY_PASS_BOOKING_BREAKDOWN_GRAPH.value) ||
          hasPermission(PERMISSIONS.SALES_VERTICAL_DAY_PASS_EXTERNAL_CLIENTS_GRAPH.value)) && (
          <DayPassOperationalCharts
            visibleCharts={[
              ...(hasPermission(PERMISSIONS.SALES_VERTICAL_DAY_PASS_BOOKING_BREAKDOWN_GRAPH.value)
                ? ["booking"]
                : []),
              ...(hasPermission(PERMISSIONS.SALES_VERTICAL_DAY_PASS_EXTERNAL_CLIENTS_GRAPH.value)
                ? ["externalClients"]
                : []),
            ]}
          />
        )}
      {!cardView &&
        hasPermission(
          PERMISSIONS.SALES_VERTICAL_DAY_PASS_CLIENT_DETAILS_TODAY_TABLE.value,
        ) && <DayPassClientDetailsToday />}
    </div>
  );
};

export default DayPassDashboard;
