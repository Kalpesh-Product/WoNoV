import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../utils/currencyFormat";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import dayjs from "dayjs";
import { CircularProgress } from "@mui/material";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../constants/permissions";
import useUserPermissions from "../../../hooks/useUserPermissions";
import FinanceCard from "../../../components/FinanceCard";
import LeadsLayout from "../SalesDashboard/ViewClients/LeadsLayout";
import CheckAvailability from "../SalesDashboard/CoWorkingSeats/CheckAvailability";
import BarGraph from "../../../components/graphs/BarGraph";
import HeatMap from "../../../components/graphs/HeatMap";
import InvestorOperationalCharts from "./InvestorOperationalCharts";
import { useCurrency } from "../../../context/CurrencyContext";
//import PieChartMui from "../../../components/graphs/PieChartMui";

const fiscalYearLabel = (date) => {
  const value = dayjs(date);
  const startYear = value.month() >= 3 ? value.year() : value.year() - 1;
  return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
};

const fiscalMonthIndex = (date) => {
  const month = dayjs(date).month();
  return month >= 3 ? month - 3 : month + 9;
};

const appreciationTooltipAmount = (month, assetIndex) => {
  const monthSeed = [...String(month)].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return 10000 + ((monthSeed * 997 + (assetIndex + 1) * 7919) % 490000);
};

const appreciationPlaceholderCount = (month) => {
  const monthSeed = [...String(month)].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return 2 + (monthSeed % 4);
};

const appreciationDisplayAssets = (monthAssets, month) =>
  monthAssets.length
    ? monthAssets
    : Array.from({ length: appreciationPlaceholderCount(month) }, () => ({}));

const appreciationDisplayTotal = (monthAssets, month) =>
  appreciationDisplayAssets(monthAssets, month)
    .slice(0, 5)
    .reduce(
      (total, asset, index) =>
        total + appreciationTooltipAmount(month, index),
      0,
    );

const asArray = (value) => (Array.isArray(value) ? value : []);
const INVESTOR_MONTHLY_PROJECTED_AMOUNT = 5_000_000;
const visitorTypes = [
  "Half-Day Pass",
  "Full-Day Pass",
  "Walk In",
  "Meeting",
  "Scheduled",
];

const fiscalYearMonths = (fiscalYear) => {
  const startYear = Number(String(fiscalYear || "").match(/\d{4}/)?.[0]);

  if (!startYear) return [];

  return [
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
  ].map(
    (month, index) =>
      `${month}-${String(index < 9 ? startYear : startYear + 1).slice(-2)}`,
  );
};

const InvestorAppreciationCenter = () => {
   const { currency, format } = useCurrency();
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  const [selectedFiscalYear, setSelectedFiscalYear] = useState(() =>
    fiscalYearLabel(dayjs()),
  );

  const { data: departmentAssets = [], isPending } = useQuery({
    queryKey: ["investor-appreciation-center-assets"],
    queryFn: async () => {
      const response = await axios.get("/api/assets/get-assets");

      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const assets = useMemo(
    () =>
      departmentAssets.flatMap((department) =>
        Array.isArray(department?.assets) ? department.assets : [],
      ),
    [departmentAssets],
  );

  const assetsByFiscalYear = useMemo(() => {
    const grouped = {};

    assets.forEach((asset) => {
      const purchaseDate = dayjs(asset?.purchaseDate);

      if (!purchaseDate.isValid()) return;

      const fiscalYear = fiscalYearLabel(purchaseDate);
      const month = purchaseDate.format("MMM-YY");

      grouped[fiscalYear] ||= {};
      grouped[fiscalYear][month] ||= [];

      grouped[fiscalYear][month].push({
        amount: Number(asset?.price) || 0,
      });
    });

    return grouped;
  }, [assets]);

  const graphData = useMemo(() => {
    const currentFiscalYearStart = Number(
      fiscalYearLabel(dayjs()).match(/\d{4}/)?.[0],
    );
    const fiscalYears = new Set([
      "FY 2024-25",
      "FY 2025-26",
      fiscalYearLabel(dayjs()),
      ...Object.keys(assetsByFiscalYear),
    ].filter((fiscalYear) => {
      const startYear = Number(fiscalYear.match(/\d{4}/)?.[0]);
      return startYear >= 2024 && startYear <= currentFiscalYearStart;
    }));

    return [...fiscalYears].map((fiscalYear) => ({
      group: fiscalYear,
      name: "Assets",
        data: fiscalYearMonths(fiscalYear).map(
        (month) => {
          const monthTotal = appreciationDisplayTotal(
            assetsByFiscalYear[fiscalYear]?.[month] || [],
            month,
          );

          return monthTotal / 100000;
        },
      ),
    }));
  }, [assetsByFiscalYear]);

  const currentFiscalYearStart = Number(
    fiscalYearLabel(dayjs()).match(/\d{4}/)?.[0],
  );
  const selectedYearStart = Number(
    selectedFiscalYear.match(/\d{4}/)?.[0],
  );
  const selectedYearSupportsData =
    selectedYearStart >= 2024 && selectedYearStart <= currentFiscalYearStart;
  const selectedYearTotal = selectedYearSupportsData
    ? fiscalYearMonths(selectedFiscalYear).reduce(
        (total, month) =>
          total +
          appreciationDisplayTotal(
            assetsByFiscalYear[selectedFiscalYear]?.[month] || [],
            month,
          ),
        0,
      )
    : 0;

  const selectedYearMax = Math.max(
    ...(selectedYearSupportsData
      ? fiscalYearMonths(selectedFiscalYear).map(
          (month) =>
            appreciationDisplayTotal(
              assetsByFiscalYear[selectedFiscalYear]?.[month] || [],
              month,
            ) / 100000,
        )
      : [0]),
    0,
  );
  const useSmallScale = selectedYearMax <= 4;
  const yAxisMax = useSmallScale
    ? Math.max(1, Math.ceil(selectedYearMax) + 1)
    : Math.ceil(selectedYearMax / 20) * 20 + 20;

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },

    colors: ["#24467E"],

    legend: {
      show: false,
    },

    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: "40%",
        distributed: false,
        dataLabels: {
          position: "top",
        },
      },
    },

    fill: {
      opacity: 1,
    },

    stroke: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },

    yaxis: {
      min: 0,
      max: yAxisMax,
      tickAmount: useSmallScale ? yAxisMax : yAxisMax / 20,

      title: {
        text: `Amount In Lakhs (${currency})`,
      },

      labels: {
        formatter: (value) => Math.round(value),
      },
    },

    tooltip: {
      custom: ({ dataPointIndex }) => {
        const month =
          fiscalYearMonths(selectedFiscalYear)[dataPointIndex];

        const monthAssets = selectedYearSupportsData
          ? appreciationDisplayAssets(
              assetsByFiscalYear[selectedFiscalYear]?.[month] || [],
              month,
            )
          : [];

        const visibleMonthAssets = monthAssets.slice(0, 5);
        const total = visibleMonthAssets.reduce(
          (sum, asset, index) =>
            sum + appreciationTooltipAmount(month, index),
          0,
        );

        const rows = visibleMonthAssets
          .map((asset, index) => {
            const tooltipAmount = appreciationTooltipAmount(month, index);

            return (
              `<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:12px;color:#111827;">` +
              `<span style="width:12px;height:12px;border-radius:999px;background:#24467E;display:inline-block;"></span>` +
              `<span>Asset ${index + 1}:</span>` +
              `<span style="font-weight:700;">${format(tooltipAmount)}</span>` +
              `</div>`
            );
          })
          .join("");

        const tooltipTitle = visibleMonthAssets.length
          ? `${month || ""} &nbsp;&nbsp; Total: ${format(total)}`
          : month || "";

        return (
          `<div style="min-width:160px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 14px rgba(15, 23, 42, 0.18);border:1px solid #e5e7eb;">` +
          `<div style="background:#eef2f6;color:#1f2937;font-size:12px;padding:8px 12px;border-bottom:1px solid #dbe1e8;white-space:nowrap;">${tooltipTitle}</div>` +
          (rows || `<div style="padding:10px 12px;font-size:12px;color:#111827;">No assets</div>`) +
          `</div>`
        );
      },
    },
  };

  return (
    <div
      className="h-[425px] cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label="View BIZNEST Appreciation Center"
      onClick={() =>
        navigate(
          "/app/dashboard/investor-dashboard/appreciation-center",
        )
      }
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          navigate(
            "/app/dashboard/investor-dashboard/appreciation-center",
          );
        }
      }}
    >
      {isPending ? (
        <WidgetSection
          title="BIZNEST APPRECIATION CENTER"
          border
        >
           <div className="flex h-[350px] items-center justify-center">
            <CircularProgress />
          </div>
        </WidgetSection>
      ) : (
        <YearlyGraph
          title="BIZNEST APPRECIATION CENTER"
          titleAmount={format(selectedYearTotal)}
          data={graphData}
          options={options}
          onYearChange={setSelectedFiscalYear}
          chartHeight={280}
          sectionHeight="h-[425px]"
          refreshOnDataChange
        />
      )}
    </div>
  );
};

const InvestorUniqueClientsGraph = () => {
  const axios = useAxiosPrivate();
  const { data: consolidatedClients = {} } = useQuery({
    queryKey: ["investor-unique-clients"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/consolidated-clients");
      return response.data && typeof response.data === "object"
        ? response.data
        : {};
    },
  });
  const { data: coWorkingClients = [] } = useQuery({
    queryKey: ["investor-unique-clients-coworking"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const clientsByMonth = useMemo(() => {
    const grouped = {};
    const toTitleCase = (value) =>
      value
        .toLowerCase()
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("-");
    const serviceMapping = {
      coworking: "Coworking",
      virtualOffice: "Virtualoffice",
      externalMeeting: "External Meetings",
      openDesk: "Open Desk",
      workation: "Workations",
      coliving: "Co-Living",
    };

    const unifiedClients = Object.entries(consolidatedClients).flatMap(
      ([key, clients]) =>
        asArray(clients).map((client) => ({
          ...client,
          clientType: key.replace(/Clients$/, ""),
        })),
    );

    unifiedClients.forEach((client) => {
      let rawServiceName = client.clientType || "Unknown";

      if (rawServiceName === "meeting") {
        const purpose = String(client.purposeOfVisit || "").trim().toLowerCase();
        if (purpose === "meeting room booking") {
          rawServiceName = "externalMeeting";
        } else if (purpose === "half-day pass" || purpose === "full-day pass") {
          rawServiceName = "openDesk";
        }
      }

      if (rawServiceName === "coworking" && client.service?.serviceName) {
        const serviceName = client.service.serviceName.toLowerCase();
        if (serviceName.includes("workation")) {
          rawServiceName = "workation";
        } else if (
          serviceName.includes("living") ||
          serviceName.includes("coliving")
        ) {
          rawServiceName = "coliving";
        }
      }

      const typeOfClient =
        serviceMapping[rawServiceName] || toTitleCase(rawServiceName);

      let date = null;
      if (rawServiceName === "coworking") {
        date = client.startDate ? new Date(client.startDate) : null;
      } else if (rawServiceName === "virtualOffice") {
        date = client.termStartDate
          ? new Date(client.termStartDate)
          : client.rentDate
            ? new Date(client.rentDate)
            : null;
      } else if (
        rawServiceName === "externalMeeting" ||
        rawServiceName === "openDesk"
      ) {
        date = client.dateOfVisit
          ? new Date(client.dateOfVisit)
          : client.scheduledDate
            ? new Date(client.scheduledDate)
            : null;
      } else {
        date =
          client.startDate || client.dateOfVisit || client.termStartDate
            ? new Date(
                client.startDate || client.dateOfVisit || client.termStartDate,
              )
            : null;
      }

      if (!date || Number.isNaN(date.getTime())) return;

      const transformedClient = {
        client:
          client.clientName ||
          [client.firstName, client.lastName].filter(Boolean).join(" ") ||
          "Unknown",
        typeOfClient,
        date: date.toISOString().split("T")[0],
      };
      const month = date.toLocaleString("default", { month: "long" });
      grouped[month] ||= [];
      grouped[month].push(transformedClient);
    });

    return Object.entries(grouped).map(([month, clients]) => ({
      month,
      clients,
    }));
  }, [consolidatedClients]);

  const clientSummaryCards = useMemo(() => {
    const virtualOfficeClients = asArray(
      consolidatedClients.virtualOfficeClients,
    );
    const meetingClients = asArray(consolidatedClients.meetingClients);
    const externalVisitors = meetingClients.filter(
      (client) =>
        String(client?.visitorFlag || "").trim().toLowerCase() === "client",
    );
    const externalMeetings = externalVisitors.filter(
      (client) =>
        String(client?.purposeOfVisit || "").trim().toLowerCase() ===
        "meeting room booking",
    );
    const openDesk = externalVisitors.filter((client) => {
      const purpose = String(client?.purposeOfVisit || "")
        .trim()
        .toLowerCase();

      return (
        purpose === "half-day pass" ||
        purpose === "full-day pass" ||
        purpose === "half day pass" ||
        purpose === "full day pass" ||
        Boolean(client?.convertedFromInternal)
      );
    });

    const buildSummary = (clients) => {
      const active = clients.filter((client) =>
        typeof client?.isActive === "boolean"
          ? client.isActive
          : Boolean(client?.clientStatus),
      ).length;

      return {
        active,
        inactive: Math.max(0, clients.length - active),
      };
    };

    return [
      {
        id: "coworking",
        name: "Co-Working",
        clients: coWorkingClients,
      },
      {
        id: "virtual-office",
        name: "Virtual-Office",
        clients: virtualOfficeClients,
      },
      {
        id: "external-meetings",
        name: "External Meetings",
        clients: externalMeetings,
      },
      {
        id: "open-desk",
        name: "Open Desk",
        clients: openDesk,
      },
    ].map((item) => ({
      ...item,
      statusSummary: buildSummary(item.clients),
    }));
  }, [coWorkingClients, consolidatedClients]);

  const averageMonthlyUniqueClientTitle = ({ count, financialYear }) => {
    const currentDate = dayjs();
    const currentFinancialYear =
      currentDate.month() >= 3 ? currentDate.year() : currentDate.year() - 1;
    const elapsedMonths =
      financialYear === currentFinancialYear
        ? currentDate.month() >= 3
          ? currentDate.month() - 2
          : 12
        : financialYear < currentFinancialYear
          ? 12
          : 1;

    return `AVERAGE MONTHLY UNIQUE CLIENT : ${(count / elapsedMonths).toFixed(2)}`;
  };

  return (
    <LeadsLayout
      data={clientsByMonth}
      hideAccordion
      title="BIZNEST Unique Clients"
      titleAmount={averageMonthlyUniqueClientTitle}
      hideMonthAxisTitle
    >
      {/*
      <div className="border-b border-borderGray px-4 pb-4">
        <h2 className="text-mobileTitle lg:text-widgetTitle text-primary font-pmedium uppercase">
          BIZNEST Overall Clients
        </h2>
      </div>
      <div className="pt-4">
        <WidgetSection layout={2}>
          {clientSummaryCards.map((item) => (
            <DataCard
              key={item.id}
              data={item.clients.length}
              title={item.name}
              statusSummary={item.statusSummary}
            />
          ))}
        </WidgetSection>
      </div>
      */}
    </LeadsLayout>
  );
};

//Meetings
const parseMeetingMinutes = (duration = "") => {
  // const hours = Number(duration.match(/(\d+(?:\.\d+)?)h/)?.[1] || 0);
  // const minutes = Number(duration.match(/(\d+(?:\.\d+)?)m/)?.[1] || 0);

  // return hours * 60 + minutes;
    const match = String(duration).match(/(\d+)(m|h)/);
  if (!match) return 0;

  const value = Number(match[1]);
  return match[2] === "h" ? value * 60 : value;
};

const InvestorMeetingAnalytics = ({ visibleGraphs }) => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const showDurationDetails =
    visibleGraphs.length === 1 && visibleGraphs[0] === "duration";

  const now = dayjs();
  const currentMonthLabel = now.format("MMM-YY");

  const fiscalStartYear = now.month() >= 3 ? now.year() : now.year() - 1;

  const fiscalLabel = `FY ${fiscalStartYear}-${String(
    fiscalStartYear + 1,
  ).slice(-2)}`;

  const months = Array.from({ length: 12 }, (_, index) =>
   dayjs(`${fiscalStartYear}-04-01`)
      .add(index, "month")
      .format("MMM-YY"),
  );

  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () =>
      (await axios.get("/api/meetings/get-meetings")).data,
     refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () =>
      (await axios.get("/api/meetings/get-rooms")).data,
     refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const { data: visitors = [] } = useQuery({
     queryKey: ["investor-visitors"],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const analytics = useMemo(() => {
     const activeRooms = rooms.filter((room) => room.isActive === true);
    //const activeRooms = rooms.filter((room) => room.isActive !== false);

    const activeRoomNames = new Set(
      activeRooms.map((room) => room.name),
    );

    const workingDays = (date) => {
      let count = 0;

      for (let day = 1; day <= date.daysInMonth(); day += 1) {
        const weekday = date.date(day).day();

        if (weekday >= 1 && weekday <= 6) {
          count += 1;
        }
      }

      return count;
    };

    const bookedByMonth = Object.fromEntries(
      months.map((month) => [month, 0]),
    );

    meetings.forEach((meeting) => {
      if (
        activeRoomNames.size &&
        !activeRoomNames.has(meeting.roomName)
      ) {
        return;
      }

      const date = dayjs(meeting.date || meeting.startTime);
      const label = date.format("MMM-YY");

      if (date.isValid() && label in bookedByMonth) {
        bookedByMonth[label] +=
          parseMeetingMinutes(meeting.duration) / 60;
      }
    });

    const bookedHours = Object.values(bookedByMonth).reduce(
      (sum, value) => sum + value,
      0,
    );

    const utilization = [
      {
        group: fiscalLabel,
        data: months.map((month) => {
          const date = dayjs(month, "MMM-YY");
          const capacity =
            activeRooms.length * 9 * workingDays(date);

          return {
            x: month,
            y: capacity
              ? (bookedByMonth[month] / capacity) * 100
              : 0,
          };
        }),
      },
    ];

    const guestMonths = [];
    const monthlyGuestMap = {};
    for (let i = 0; i < 12; i += 1) {
      const month = now.subtract(11 - i, "month");
      const label = month.format("MMM-YY");
      guestMonths.push(label);
      monthlyGuestMap[label] = 0;
    }

    const guestCounts = Object.fromEntries(months.map((month) => [month, 0]));
    const visitorTypeCounts = Object.fromEntries(
      visitorTypes.map((type) => [
        type,
        Object.fromEntries(months.map((month) => [month, 0])),
      ]),
    );

    visitors.forEach((visitor) => {
      const date = dayjs(visitor.dateOfVisit || visitor.checkIn || visitor.createdAt);
      const label = date.format("MMM-YY");
      const visitorType = visitor.visitorType;

      if (date.isValid() && label in guestCounts) {
        guestCounts[label] += 1;
        if (visitorType && visitorTypeCounts[visitorType]) {
          visitorTypeCounts[visitorType][label] += 1;
        }
      }

      if (date.isValid() && monthlyGuestMap[label] !== undefined) {
        monthlyGuestMap[label] += 1;
      }
    });

    // const roomNames = activeRooms
    //   .map((room) => room.name)
    //   .sort();

    const roomNames = rooms.map((room) => room.name).sort();


    const roomHours = Object.fromEntries(
      roomNames.map((name) => [name, 0]),
    );

    meetings.forEach((meeting) => {
      const date = dayjs(meeting.date || meeting.startTime);

      if (
        date.isSame(now, "month") &&
        meeting.roomName in roomHours
      ) {
        roomHours[meeting.roomName] +=
          parseMeetingMinutes(meeting.duration) / 60;
      }
    });

    const monthlyCapacity = 9 * workingDays(now);

    const occupancy = [
      {
        name: "Average Occupancy",
        data: roomNames.map((name) => ({
          x: name,
          y: monthlyCapacity
            ? (roomHours[name] / monthlyCapacity) * 100
            : 0,
        })),
      },
    ];

    const dayNames = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ];

    const timeSlots = Array.from({ length: 12 }, (_, index) => {
      const start = dayjs()
        .hour(index + 8)
        .minute(0);

      return `${start.format("hA")}-${start
        .add(1, "hour")
        .format("hA")}`;
    });

    // const weekStart = now.startOf("week");

   const matrix = timeSlots.map(() => Array(7).fill(0));

    const monday = now
      .subtract((now.day() + 6) % 7, "day")
      .startOf("day");
    const meetingWeekDays = Array.from({ length: 6 }, (_, index) =>
      monday.add(index, "day").format("YYYY-MM-DD"),
    );

    meetings.forEach((meeting) => {
      const date = dayjs(meeting.startTime);
      const slot = date.hour() - 8;
      const dayIndex = meetingWeekDays.indexOf(date.format("YYYY-MM-DD"));

      if (
        date.isValid() &&
        dayIndex !== -1 &&
        slot >= 0 &&
        slot < 12
      ) {
        matrix[slot][dayIndex] += 1;
      }
    });

    const heatmap = timeSlots.map((name, index) => ({
      name,
      data: dayNames.map((day, dayIndex) => ({
        x: day,
        y: matrix[index][dayIndex],
      })),
    }));

    const durationBuckets = [15, 30, 60, 90, 120, 150, "Others"];
    const durationCounts = Array(durationBuckets.length).fill(0);
    const longerDurationCounts = {};

    meetings.forEach((meeting) => {
      const minutes = parseMeetingMinutes(meeting.duration);
      const bucketIndex = [15, 30, 60, 90, 120, 150].findIndex(
        (limit) => minutes <= limit,
      );
      if (bucketIndex === -1) {
        longerDurationCounts[minutes] = (longerDurationCounts[minutes] || 0) + 1;
      }
      durationCounts[bucketIndex === -1 ? 6 : bucketIndex] += 1;
    });

    const externalGuestsData = [
      {
        name: "Visitors",
        data: guestMonths.map((month) => monthlyGuestMap[month]),
      },
    ];
    const externalGuestsMax = Math.max(
      120,
      Math.ceil(
        Math.max(...guestMonths.map((month) => monthlyGuestMap[month]), 0) / 20,
      ) * 20,
    );

    const externalGuestsOptions = {
      chart: {
        type: "bar",
        fontFamily: "Poppins-Regular",
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: guestMonths,
        title: {
          text: "",
        },
        labels: {
          style: {
            fontSize: "8px",
            fontFamily: "Poppins-Regular",
            colors: "#333",
          },
        },
      },
      yaxis: {
        max: externalGuestsMax,
        min: 0,
        tickAmount: 4,
        forceNiceScale: false,
        title: {
          text: "Guest Count",
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "65%",
          borderRadius: 5,
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "12px",
          colors: ["#000"],
        },
        offsetY: -22,
      },
      colors: ["#08b6bc"],
    };

    // const bucketLabels = [
    //   "15",
    //   "30",
    //   "60",
    //   "90",
    //   "120",
    //   "Others",
    // ];

    // const bucketCounts = Array(6).fill(0);

    // meetings.forEach((meeting) => {
    //   const minutes = parseMeetingMinutes(meeting.duration);

    //   const index = [15, 30, 60, 90, 120].findIndex(
    //     (limit) => minutes <= limit,
    //   );

    //   bucketCounts[index < 0 ? 5 : index] += 1;
    // });

    return {
      bookedHours,
      utilization,
      guestCounts,
      visitorTypeCounts,
      externalGuestsData,
      externalGuestsOptions,
      totalVisitors: Object.values(guestCounts).reduce(
        (total, count) => total + count,
        0,
      ),
      roomNames,
      roomHours,
      occupancy,
      heatmap,
      duration: durationBuckets.map((bucket, index) => ({
        label: bucket === "Others" ? bucket : `${bucket} min`,
        value: durationCounts[index],
      })),
      durationDetails: [
        ...durationBuckets.slice(0, -1).map((bucket, index) => ({
          label: `${bucket} min`,
          value: durationCounts[index],
        })),
        ...Object.entries(longerDurationCounts)
          .sort(([minutesA], [minutesB]) => Number(minutesA) - Number(minutesB))
          .map(([minutes, value]) => ({
            label: `${minutes} min`,
            value,
          })),
      ],
    };
  }, [fiscalLabel, meetings, months, now, rooms, visitors]);

  const goTo = (route) => () =>
    navigate(`/app/dashboard/investor-dashboard/${route}`);

  const utilizationOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    xaxis: {
      categories: months,
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      forceNiceScale: false,
      title: {
        text: "Utilization (%)",
      },
      labels: {
        formatter: (value) => Math.round(value),
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => `${value.toFixed(1)}%`,
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: "40%",
      },
    },
  };

  const barOptions = (categories, yTitle, formatter, showDataLabels = true) => {
    const isOccupancy = yTitle.includes("Occupancy");

    return {
      chart: {
        type: "bar",
        toolbar: { show: false },
        fontFamily: "Poppins-Regular",
      },
      xaxis: {
        categories,
        labels: {
          rotate: isOccupancy ? -45 : 0,
          trim: true,
          hideOverlappingLabels: true,
          style: {
            fontSize: isOccupancy ? "10px" : "12px",
          },
        },
      },
      yaxis: {
        max: isOccupancy ? 100 : undefined,
        min: 0,
        tickAmount: isOccupancy ? 5 : undefined,
        forceNiceScale: false,
        title: {
          text: yTitle,
        },
        labels: {
          formatter: (value) =>
            isOccupancy ? `${Math.round(value)}%` : Math.round(value),
        },
      },
      colors: ["#2DC1C6"],
      dataLabels: {
        enabled: showDataLabels,
        formatter,
        offsetY: -18,
        style: {
          colors: ["#111"],
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          columnWidth: "55%",
          dataLabels: {
            position: "top",
          },
        },
      },
    };
  };

  const heatmapOptions = {
    chart: {
      type: "heatmap",
      toolbar: { show: false },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              color: "#d1d5db",
              name: "No Bookings",
            },
            {
              from: 1,
              to: 5,
              color: "#B2FFB2",
              name: "Low (1-5)",
            },
            {
              from: 6,
              to: 10,
              color: "#4CAF50",
              name: "Moderate (6-10)",
            },
            {
              from: 11,
              to: 15,
              color: "#2E7D32",
              name: "High (11-15)",
            },
            {
              from: 16,
              to: 999,
              color: "#1B5E20",
              name: "Very High (16-20)",
            },
          ],
        },
      },
    },
  };
  const visitorOptions = {
    ...barOptions(
      months,
      "No. of Visitors",
      (value) => value.toFixed(0),
      false,
    ),
    colors: ["#2196F3", "#16B8C4", "#3498DB", "#174EA6", "#5C6BC0"],
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
    },
    tooltip: {
      y: {
        formatter: (value) => `${Number(value || 0).toFixed(0)}`,
      },
    },
  };

  const meetingDurationOptions = {
    ...barOptions(
      analytics.duration.map((item) => item.label),
      "Meeting Count",
      (value) => Math.round(value),
    ),
    xaxis: {
      ...barOptions(
        analytics.duration.map((item) => item.label),
        "Meeting Count",
        (value) => Math.round(value),
      ).xaxis,
      title: {
        text: "Minutes",
      },
      crosshairs: {
        show: false,
      },
    },
    yaxis: {
      ...barOptions(
        analytics.duration.map((item) => item.label),
        "Meeting Count",
        (value) => Math.round(value),
      ).yaxis,
      crosshairs: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: "35%",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => Math.round(value),
      offsetY: -26,
      style: {
        colors: ["#111"],
      },
    },
    colors: ["#9FA1FF"],
  };

  // const pieOptions = {
  //   labels: analytics.duration.map((item) => item.label),
  //   legend: {
  //     position: "bottom",
  //   },
  //   colors: [
  //     "#1E3D73",
  //     "#34528A",
  //     "#4A68A1",
  //     "#608DB8",
  //     "#76A2CF",
  //     "#8CB8E6",
  //   ],
  //   dataLabels: {
  //     enabled: true,
  //     formatter: (value) => `${value.toFixed(1)}%`,
  //   },
  // };

  const show = (key) => visibleGraphs.includes(key);

  return (
    <div className="flex flex-col gap-6">
      {show("utilization") && (
        <div
          onClick={goTo("meeting-room-utilization")}
          className="cursor-pointer"
        >
          <YearlyGraph
            title="BIZNEST AVERAGE MEETING ROOM UTILIZATION"
            data={analytics.utilization}
            options={utilizationOptions}
            currentYear={fiscalLabel}
          />
        </div>
      )}

      {(show("guests") || show("occupancy")) && (
        <WidgetSection
          layout={Number(show("guests")) + Number(show("occupancy"))}
           padding
          gridGap="gap-x-6 gap-y-6"
        >
          {show("guests") && (
            <WidgetSection
              border
              padding
              height="min-h-[430px]"
              title="EXTERNAL GUESTS VISITED"
              titleLabel={currentMonthLabel}
            >
              <div
                onClick={goTo("external-guests-visited")}
                className="cursor-pointer"
              >
                <BarGraph
                  data={analytics.externalGuestsData}
                  options={analytics.externalGuestsOptions}
                  height={450}
                />
              </div>
            </WidgetSection>
          )}

          {show("occupancy") && (
            <WidgetSection
              border
              padding
              height="min-h-[430px]"
              title="AVERAGE OCCUPANCY OF ROOMS IN %"
              titleLabel={currentMonthLabel}
            >
              <div
                onClick={goTo("average-room-occupancy")}
                className="cursor-pointer"
              >
                <BarGraph
                  data={analytics.occupancy}
                  options={barOptions(
                    analytics.roomNames,
                    "Occupancy (%)",
                    (value) => `${value.toFixed(0)}%`,
                  )}
                  height={450}
                />
              </div>
            </WidgetSection>
          )}
        </WidgetSection>
      )}

      {show("busy") && (
        <WidgetSection border title="BIZNEST BUSY TIME DURING THE WEEK">
          <div
            onClick={goTo("busy-time-during-week")}
            className="cursor-pointer"
          >
            <HeatMap
              data={analytics.heatmap}
              options={heatmapOptions}
              height={500}
            />
          </div>
        </WidgetSection>
      )}
      {show("duration") && (
        <WidgetSection border title="BIZNEST MEETING DURATION BREAKDOWN">
          <div
            onClick={goTo("meeting-duration-breakdown")}
            className="cursor-pointer"
          >
            <BarGraph
              data={[
                {
                  name: "Meetings",
                  data: analytics.duration.map((item) => item.value),
                },
              ]}
              options={meetingDurationOptions}
              height={450}
            />
          </div>
        </WidgetSection>
      )}
      {showDurationDetails && (
        <WidgetSection
          border
          title="BIZNEST MEETING DURATION BREAKDOWN DETAILS"
        >
          <AgTable
            data={analytics.durationDetails.map((item, index) => ({
              id: index + 1,
              minute: item.label,
              meeting: item.value,
            }))}
            columns={[
              { field: "id", headerName: "Sr No", flex: 1.5 },
              { field: "minute", headerName: "Minute", flex: 1.5 },
              { field: "meeting", headerName: "Meeting Count", flex: 1 },
                ]}
            search
              />
        </WidgetSection>
      )}
      {show("visitors") && (
        <div
          onClick={goTo("monthly-total-visitors")}
          className="cursor-pointer"
        >
          <YearlyGraph
            title={`BIZNEST MONTHLY TOTAL VISITORS ${fiscalLabel}`}
            headerRightContent={
              <span className="text-mobileTitle lg:text-widgetTitle text-primary font-pmedium">
                TOTAL COUNT: {analytics.totalVisitors}
              </span>
            }
            data={[
              ...visitorTypes.map((type) => ({
                name: type,
                group: fiscalLabel,
                data: months.map((month) => analytics.visitorTypeCounts[type][month]),
              })),
            ]}
            options={visitorOptions}
            chartHeight={380}
            currentYear={fiscalLabel}
          />
        </div>
      )}
    </div>
  );
};


const InvestorIncomeExpenseGraph = ({ showSummaryCards }) => {
  const { currency, format } = useCurrency();
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const currentFiscalYear = fiscalYearLabel(dayjs());
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(currentFiscalYear);

  const { data: revenueExpenseData = [] } = useQuery({
    queryKey: ["revenueExpenseData"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/income-expense");
      return Array.isArray(response.data?.response) ? response.data.response : [];
    },
  });

  const { data: managedUnitsData = [] } = useQuery({
    queryKey: ["investor-managed-units"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-simple-units");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: budgetData = [] } = useQuery({
    queryKey: ["budgetData", "investor-income-expense"],
    queryFn: async () => {
      const response = await axios.get("/api/budget/company-budget", {
        params: { view: "dashboard" },
      });
      return Array.isArray(response.data?.allBudgets) ? response.data.allBudgets : [];
    },
  });

 const { series, totals, selectedIncome, selectedExpense } = useMemo(() => {
    const incomeByYear = new Map();
    const expenseByYear = new Map();
    const addAmount = (map, date, amount) => {
      if (!date || !dayjs(date).isValid()) return;
      const year = fiscalYearLabel(date);
      const values = map.get(year) || Array(12).fill(0);
      values[fiscalMonthIndex(date)] += Number(amount) || 0;
      map.set(year, values);
    };

    revenueExpenseData.forEach((entry) => {
      const income = entry?.income || {};
      [
        ...asArray(income.meetingRevenue),
        ...asArray(income.alternateRevenues),
        ...asArray(income.virtualOfficeRevenues),
        ...asArray(income.workationRevenues),
        ...asArray(income.coworkingRevenues),
      ].forEach((item) =>
        addAmount(
          incomeByYear,
          item.date || item.rentDate || item.invoiceCreationDate,
          item.taxableAmount || item.revenue || item.taxable,
        ),
      );
    });

    budgetData.forEach((item) =>
      addAmount(expenseByYear, item?.dueDate, item?.actualAmount),
    );

    const years = new Set([
      ...incomeByYear.keys(),
      ...expenseByYear.keys(),
      currentFiscalYear,
    ]);
    const graphSeries = [...years].flatMap((group) => {
      const incomeValues = incomeByYear.get(group) || Array(12).fill(0);
      const expenseValues = expenseByYear.get(group) || Array(12).fill(0);
       const projectedValues = incomeValues.map((incomeAmount, monthIndex) => {
        const expenseAmount = expenseValues[monthIndex];

        return incomeAmount === 0 && expenseAmount === 0
          ? INVESTOR_MONTHLY_PROJECTED_AMOUNT
          : 0;
      });
      return [
        { name: "Income", group, data: incomeValues },
        { name: "Expense", group, data: expenseValues },
         { name: "Projected", group, data: projectedValues },
      ];
    });
    const income = incomeByYear.get(selectedFiscalYear) || [];
    const expense = expenseByYear.get(selectedFiscalYear) || [];

    return {
      series: graphSeries,
      totals: {
        income: income.reduce((sum, value) => sum + value, 0),
        expense: expense.reduce((sum, value) => sum + value, 0),
      },
    selectedIncome: income,
      selectedExpense: expense,
    };
  }, [budgetData, currentFiscalYear, revenueExpenseData, selectedFiscalYear]);
  const totalSqft = useMemo(
    () =>
      revenueExpenseData
        .filter((item) => item?.units)
        .flatMap((item) => asArray(item.units))
        .reduce((sum, item) => sum + (Number(item?.sqft) || 0), 0),
    [revenueExpenseData],
  );
  const annualManagedSqft = useMemo(() => {
    const managedBuildings = new Set(["sunteck kanaka", "dempo trade center"]);
    const totalManagedSqft = managedUnitsData
      .filter((unit) => {
        const buildingName = String(
          unit?.building?.buildingName || unit?.buildingName || "",
        )
          .trim()
          .toLowerCase()
          .replace(/centre/g, "center");

        return managedBuildings.has(buildingName);
      })
      .reduce((sum, unit) => sum + (Number(unit?.sqft) || 0), 0);

    return totalManagedSqft / 12;
  }, [managedUnitsData]);

  const previousMonthIndex = fiscalMonthIndex(dayjs().subtract(1, "month"));
  const selectedYearStart = Number(selectedFiscalYear.match(/\d{4}/)?.[0]);
  const selectedMonthDate = Number.isFinite(selectedYearStart)
    ? dayjs(`${selectedYearStart}-04-01`).add(previousMonthIndex, "month")
    : null;
  const summaryMonthLabel = selectedMonthDate
    ? `${selectedMonthDate.format("MMMM")} - ${selectedFiscalYear}`
    : "-";
  const summaryMonthIncome = selectedIncome[previousMonthIndex] || 0;
  const summaryMonthExpense = selectedExpense[previousMonthIndex] || 0;
  const perSqft = (value) => (totalSqft ? value / totalSqft : 0);
  const projectedAmount = (series.find(
    (item) => item.name === "Projected" && item.group === selectedFiscalYear,
  )?.data || []).reduce((sum, value) => sum + value, 0);

  const buildCardData = (cardTitle, values, highlightNegativePositive = false) => ({
    cardTitle,
    timePeriod: selectedFiscalYear,
    highlightNegativePositive,
    descriptionData: [
      {
        title: summaryMonthLabel,
        value: format(values.month),
        route: "#",
      },
      {
        title: "Annual Average",
        value: format(values.total / 12),
        route: "#",
      },
      {
        title: "Overall Manage Sq.Ft",
        value: `${inrFormat(annualManagedSqft)} Sq.Ft`,
        route: "#",
      },
      {
        title: "Per Sq. Ft.",
        value: format(perSqft(values.total)),
        route: "#",
      },
    ],
  });

  const options = {
    chart: {
      id: "investor-income-vs-expense",
      animations: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
     colors: ["#54C4A7", "#EB5C45", "#c4c4c4"],
    plotOptions: { bar: { horizontal: false, columnWidth: "70%", borderRadius: 6 } },
    dataLabels: { enabled: false },
    legend: {
      show: true,
      position: "top",
      onItemHover: { highlightDataSeries: false },
    },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    xaxis: {
      crosshairs: { show: false },
    },
    yaxis: {
      min: 0,
      title: { text: `Amount In Lakhs (${currency})` },
      labels: { formatter: (value) => `${Math.round(value / 100000)}` },
    },
    tooltip: { y: { formatter: (value) => format(value) } },
  };

  return (
   <div className="flex flex-col gap-4">
      <YearlyGraph
        data={series}
        options={options}
        chartId="bargraph-investor-income-expense"
        title={`BIZNest FINANCE INCOME V/S EXPENSE - ${selectedFiscalYear}`}
        chartHeight={450}
        headerCenterContent={
          <div className="flex gap-2 justify-center items-center uppercase bg-[#c4c4c4] p-2 rounded-lg text-body text-black font-pmedium">
          Projected: {format(projectedAmount)}
          </div>
        }
        TitleAmountGreen={format(totals.income)}
        TitleAmountRed={format(totals.expense)}
        currentYear={selectedFiscalYear}
        onYearChange={setSelectedFiscalYear}
        refreshOnDataChange
      />
      {showSummaryCards && (
        <div className="mt-2">
          <WidgetSection
            border
            height="min-h-[340px]"
            title={"BIZNEST PROFIT & LOSS - LAST MONTHS"}
          >
            <div className="mt-4 mb-4 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {[
                {
                  title: "Income",
                  month: summaryMonthIncome,
                  total: totals.income,
                },
                {
                  title: "Expense",
                  month: summaryMonthExpense,
                  total: totals.expense,
                },
                {
                  title: "Profit & Loss",
                  month: summaryMonthIncome - summaryMonthExpense,
                  total: totals.income - totals.expense,
                  highlightNegativePositive: true,
                },
              ].map((card) => {
                const cardData = buildCardData(
                  card.title,
                  { month: card.month, total: card.total },
                  card.highlightNegativePositive,
                );
                return (
                  <div key={card.title} className="flex flex-col gap-3">
                    <FinanceCard
                      cardTitle={card.title}
                      timePeriod={selectedFiscalYear}
                      descriptionData={[]}
                      minHeight="min-h-[50px]"
                      hideHeaderDivider
                      centerContent
                      disableLinks
                    />
                    <FinanceCard
                      {...cardData}
                      descriptionData={cardData.descriptionData.slice(0, 2)}
                      minHeight="min-h-[110px]"
                      hideHeader
                      hideDividerAfter={["Annual Average", "Per Sq. Ft."]}
                      disableLinks
                    />
                    <FinanceCard
                      {...cardData}
                      descriptionData={cardData.descriptionData.slice(2)}
                      minHeight="min-h-[110px]"
                      hideHeader
                      hideDividerAfter={["Annual Average", "Per Sq. Ft."]}
                      disableLinks
                    />
                  </div>
                );
              })}
            </div>
          </WidgetSection>
        </div>
      )}
    </div>      
  );
};

const yearCategories = {
  "FY 2024-2025": [
    "Apr-24",
    "May-24",
    "Jun-24",
    "Jul-24",
    "Aug-24",
    "Sep-24",
    "Oct-24",
    "Nov-24",
    "Dec-24",
    "Jan-25",
    "Feb-25",
    "Mar-25",
  ],
  "FY 2025-2026": [
    "Apr-25",
    "May-25",
    "Jun-25",
    "Jul-25",
    "Aug-25",
    "Sep-25",
    "Oct-25",
    "Nov-25",
    "Dec-25",
    "Jan-26",
    "Feb-26",
    "Mar-26",
  ],
};

const InvestorDashboard = () => {
  const { currency, format } = useCurrency();
  const axios = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useUserPermissions();
  const showDetails = location.pathname.endsWith("/historical-P&L");
  const showIncomeExpensePage = location.pathname.endsWith("/income-expense");
  const showUniqueClientsPage = location.pathname.endsWith("/unique-clients");
  const showInventoryPage = location.pathname.endsWith("/inventory");
  const showAppreciationCenterPage = location.pathname.endsWith(
    "/appreciation-center",
  );
  const selectedHistoricalFiscalYear = fiscalYearLabel(dayjs());
   const meetingGraphRoutes = {
    utilization: "/meeting-room-utilization",
    guests: "/external-guests-visited",
    occupancy: "/average-room-occupancy",
    busy: "/busy-time-during-week",
    visitors: "/monthly-total-visitors",
    duration: "/meeting-duration-breakdown",
  };
   const operationalGraphRoutes = {
    sector: "/app/dashboard/investor-dashboard/sector-wise-occupancy",
    client: "/app/dashboard/investor-dashboard/client-wise-occupancy",
    gender: "/app/dashboard/investor-dashboard/client-member-gender-wise-data",
    india: "/app/dashboard/investor-dashboard/india-wise-members",
    desks: "/app/dashboard/investor-dashboard/total-desks-company-wise",
    visitorCategory: "/app/dashboard/investor-dashboard/overall-visitor-category",
    visitorClientType: "/app/dashboard/investor-dashboard/overall-visitor-client-type",
    visitorGender: "/app/dashboard/investor-dashboard/overall-visitor-gender-data",
  };
  const showDashboardHome = location.pathname.endsWith("/investor-dashboard");
  const canViewHistoricalPnlGraph = hasPermission(
    PERMISSIONS.INVESTOR_HISTORICAL_PNL_GRAPH.value,
  );
  const canViewIncomeExpenseGraph = hasPermission(
    PERMISSIONS.INVESTOR_INCOME_EXPENSE_GRAPH.value,
  );
   const canViewFinanceSummaryCards = hasPermission(
    PERMISSIONS.INVESTOR_FINANCE_SUMMARY_CARDS.value,
  );
 const canViewUniqueClientsGraph = hasPermission(
    PERMISSIONS.INVESTOR_UNIQUE_CLIENTS_GRAPH.value,
  );
  const canViewInventoryOverview = hasPermission(
    PERMISSIONS.INVESTOR_INVENTORY_OVERVIEW.value,
  );
  const canViewAppreciationCenter = hasPermission(
    PERMISSIONS.INVESTOR_APPRECIATION_CENTER.value,
  );
  const meetingGraphPermissions = {
    utilization: PERMISSIONS.INVESTOR_MEETING_ROOM_UTILIZATION.value,
    guests: PERMISSIONS.INVESTOR_EXTERNAL_GUESTS_VISITED.value,
    occupancy: PERMISSIONS.INVESTOR_AVERAGE_ROOM_OCCUPANCY.value,
    busy: PERMISSIONS.INVESTOR_BUSY_TIME_WEEK.value,
    duration: PERMISSIONS.INVESTOR_MEETING_DURATION_BREAKDOWN.value,
       visitors: PERMISSIONS.INVESTOR_MONTHLY_TOTAL_VISITORS.value,
  };
  const visibleMeetingGraphs = Object.keys(meetingGraphRoutes).filter(
    (key) =>
      hasPermission(meetingGraphPermissions[key]) &&
      (showDashboardHome || location.pathname.endsWith(meetingGraphRoutes[key])),
  );
 const operationalGraphPermissions = {
    sector: PERMISSIONS.INVESTOR_SECTOR_WISE_OCCUPANCY.value,
    client: PERMISSIONS.INVESTOR_CLIENT_WISE_OCCUPANCY.value,
    gender: PERMISSIONS.INVESTOR_CLIENT_MEMBER_GENDER_WISE_DATA.value,
    india: PERMISSIONS.INVESTOR_INDIA_WISE_MEMBERS.value,
    desks: PERMISSIONS.INVESTOR_TOTAL_DESKS_COMPANY_WISE.value,
    visitorCategory: PERMISSIONS.INVESTOR_OVERALL_VISITOR_CATEGORY.value,
    visitorClientType: PERMISSIONS.INVESTOR_OVERALL_VISITOR_CLIENT_TYPE.value,
    visitorGender: PERMISSIONS.INVESTOR_OVERALL_VISITOR_GENDER_DATA.value,
  };
  const visibleOperationalGraphs = Object.keys(operationalGraphRoutes).filter(
    (key) =>
      hasPermission(operationalGraphPermissions[key]) &&
      (showDashboardHome || location.pathname.endsWith(operationalGraphRoutes[key])),
  );
  const operationalGraphsBeforeMeeting = [
    "sector",
    "client",
    "gender",
    "india",
    "desks",
  ];
  const { data: revenueExpenseData = [], isLoading } = useQuery({
    queryKey: ["historicalIncomeExpense"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/income-expense");
      return Array.isArray(response.data?.response) ? response.data.response : [];
    },
     enabled: showDetails || canViewHistoricalPnlGraph,
  });

  //-----------------------------------------------------Graph------------------------------------------------------//
  // Base data for first 3 years
  const baseIncomeData = [25174680, 31929380, 31929380];
  const baseExpenseData = [24168780, 33899540, 33899540];

  // Replace last year with Redux values (default to 0 if not available)
  const historicalData = useMemo(() => {
    const expenseItems = revenueExpenseData
      .filter((item) => item.expense)
      .flatMap((item) => item.expense || []);

    const incomeItems = revenueExpenseData.flatMap((item) => {
      const income = item.income || {};
      return [
        ...(Array.isArray(income.meetingRevenue) ? income.meetingRevenue : []),
        ...(Array.isArray(income.alternateRevenues)
          ? income.alternateRevenues
          : []),
        ...(Array.isArray(income.virtualOfficeRevenues)
          ? income.virtualOfficeRevenues
          : []),
        ...(Array.isArray(income.workationRevenues)
          ? income.workationRevenues
          : []),
        ...(Array.isArray(income.coworkingRevenues)
          ? income.coworkingRevenues
          : []),
      ];
    });

    const summary = Object.entries(yearCategories).map(([fiscalYear, months]) => {
      const income = incomeItems.reduce((sum, item) => {
        const rawDate = item.date || item.rentDate || item.invoiceCreationDate;
        if (!rawDate || !dayjs(rawDate).isValid()) return sum;
        if (!months.includes(dayjs(rawDate).format("MMM-YY"))) return sum;

        return sum + (Number(item.taxableAmount) || Number(item.revenue) || Number(item.taxable) || 0);
      }, 0);

      const expense = expenseItems.reduce((sum, item) => {
        if (!item?.dueDate || !dayjs(item.dueDate).isValid()) return sum;
        if (!months.includes(dayjs(item.dueDate).format("MMM-YY"))) return sum;

        return sum + (Number(item.actualAmount) || 0);
      }, 0);

      return {
        fiscalYear,
        income,
        expense,
        profitLoss: income - expense,
      };
    });

    return summary;
  }, [revenueExpenseData]);

  const incomeExpenseData = [
    {
      name: "Income",
      data: [...baseIncomeData, ...historicalData.map((item) => item.income)],
    },
    {
      name: "Expense",
      data: [...baseExpenseData, ...historicalData.map((item) => item.expense)],
    },
  ];

  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7", "#EB5C45"],
    legend: {
      show: true,
      position: "top",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories:
        ["FY 2021-22", "FY 2022-23", "FY 2023-24", ...historicalData.map((item) => item.fiscalYear)],
    },
     yaxis: {
      title: {
        text: `Amount In Crores (${currency})`,
      },
      labels: {
        formatter: (val) => `${Math.round(val / 10000000)}`,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => format(val),
      },
    },
  };

  const historicalTableData = [
    ...baseIncomeData,
    ...historicalData.map(item => item.income),
  ].map((incomeValue, index) => {
    const isBaseYear = index < 3;

    const name = isBaseYear
      ? `FY ${2021 + index}-${2022 + index}`
      : historicalData[index - 3].fiscalYear;

    const income = isBaseYear
      ? baseIncomeData[index]
      : historicalData[index - 3].income;

    const expense = isBaseYear
      ? baseExpenseData[index]
      : historicalData[index - 3].expense;

    const profitLoss = income - expense;

    return {
      srNo: index + 1,           // ← this is the clean fix
      name,
      totalIncome: format(income),
      totalExpense: format(expense),
      totalProfitLoss: format(profitLoss),
    };
  });

  return (
    <div className="flex flex-col gap-4 pt-5">
      {(showDashboardHome || showDetails) && canViewHistoricalPnlGraph && (
        <WidgetSection layout={1}>
          <WidgetSection
            border
            title={`BIZNest Historical P&L - ${selectedHistoricalFiscalYear}`}
          >
            {isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <CircularProgress />
              </div>
            ) : (
              <div
                className="cursor-pointer"
                onClick={() =>
                  navigate(
                    "/app/dashboard/investor-dashboard/historical-P&L",
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(
                      "/app/dashboard/investor-dashboard/historical-P&L",
                    );
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="View historical profit and loss details"
              >
                <NormalBarGraph
                  data={incomeExpenseData}
                  options={incomeExpenseOptions}
                  height={450}
                />
              </div>
            )}
          </WidgetSection>
        </WidgetSection>
      )}

      {(showDashboardHome || showIncomeExpensePage) && canViewIncomeExpenseGraph && (
        <div className="-mt-6">
          <WidgetSection layout={1}>
            <InvestorIncomeExpenseGraph
              showSummaryCards={canViewFinanceSummaryCards}
            />
          </WidgetSection>
        </div>
      )}
      {(showDashboardHome || showUniqueClientsPage) &&
        canViewUniqueClientsGraph && (
          <div className="-mt-6">
            <InvestorUniqueClientsGraph />
          </div>
        )}

      {(showDashboardHome || showInventoryPage) && canViewInventoryOverview && (
        <div className="-mt-6">
          <CheckAvailability
            cardsFirst
            disableCardLinks
            hideCheckInventory
            graphHeight={450}
            cardsBorder
            hideInventoryLastDivider
            cardsTitle="BIZNEST INVENTORY DETAILS"
            graphTitle="BIZNEST OCCUPIED v/s UNOCCUPIED - FY 2026-27"
            monthlyView
          />
        </div>
      )}

      {visibleOperationalGraphs.some((key) =>
        operationalGraphsBeforeMeeting.includes(key),
      ) && (
        <div className={showDashboardHome ? "-mt-6" : "mt-0.5"}>
            <InvestorOperationalCharts
              visibleCharts={visibleOperationalGraphs.filter((key) =>
              operationalGraphsBeforeMeeting.includes(key) &&
                (key !== "desks" || !showDashboardHome),
              )}
              routes={operationalGraphRoutes}
              showDetails={!showDashboardHome}
            />
          </div>
        )}
      {showDashboardHome && visibleOperationalGraphs.includes("desks") && (
        <div className="-mt-2 grid w-full grid-cols-1 items-stretch gap-x-4 gap-y-4 px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[425px]">
          <div className="flex h-full min-w-0 w-full flex-col">
            <InvestorOperationalCharts
              visibleCharts={["desks"]}
              routes={operationalGraphRoutes}
               flushLayout  
            />
          </div>
          {canViewAppreciationCenter && (
            <div className="flex h-full min-w-0 w-full flex-col">
              <InvestorAppreciationCenter />
            </div>
          )}
        </div>
      )}
      {(showDashboardHome || showAppreciationCenterPage) &&
        canViewAppreciationCenter && (
          <div
            className={showDashboardHome ? "-mt-6" : "mt-0.5"}
            hidden={showDashboardHome && visibleOperationalGraphs.includes("desks")}
          >
            <WidgetSection layout={1}>
              <InvestorAppreciationCenter />
            </WidgetSection>
          </div>
        )}
      {visibleMeetingGraphs.length > 0 && (
        <div className={showDashboardHome ? "-mt-6" : "mt-0.5"}>
          <WidgetSection layout={1}>
            <InvestorMeetingAnalytics visibleGraphs={visibleMeetingGraphs} />
          </WidgetSection>
        </div>
      )}
      {visibleOperationalGraphs.some(
        (key) => !operationalGraphsBeforeMeeting.includes(key),
      ) && (
        <div className={showDashboardHome ? "-mt-6" : "mt-0.5"}>
          <InvestorOperationalCharts
            visibleCharts={visibleOperationalGraphs.filter(
              (key) => !operationalGraphsBeforeMeeting.includes(key),
            )}
            routes={operationalGraphRoutes}
          />
        </div>
      )}


      {showDetails && (
        <WidgetSection layout={1}>
          <WidgetSection
            title={`BIZNEST Historical P&L Details ${selectedHistoricalFiscalYear}`}
            border
          >
            <AgTable
              columns={[
                { field: "srNo", headerName: "Sr No", sort: "desc" },
                { field: "name", headerName: "Financial Year", flex: 1 },
               { field: "totalIncome", headerName: `Total Income (${currency})` },
                { field: "totalExpense", headerName: `Total Expense (${currency})` },
                {
                  field: "totalProfitLoss",
                  headerName: `Total Profit / Loss (${currency})`,
                },
              ]}
              hideFilter
              data={historicalTableData}
            />
          </WidgetSection>
        </WidgetSection>
      )}
    </div>
  );
};

export default InvestorDashboard;


// const InvestorDashboard = () => {
//   return (
//     <section className="rounded-lg bg-white p-6 shadow-sm">
//       <h1 className="text-2xl font-semibold text-gray-800">
//         Investor Dashboard
//       </h1>
//     </section>
//   );
// };

// export default InvestorDashboard;
