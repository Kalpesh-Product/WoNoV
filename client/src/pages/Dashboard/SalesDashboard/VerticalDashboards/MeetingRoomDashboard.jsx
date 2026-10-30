import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  MdAccessTime,
  MdAdd,
  MdBarChart,
  MdCalendarMonth,
  MdEdit,
  MdEventAvailable,
  MdGroups,
  MdMeetingRoom,
  MdOutlineRemoveRedEye,
  MdPercent,
  MdShoppingBag,
  MdKeyboardArrowDown,
  MdTrendingDown,
  MdTrendingUp,
} from "react-icons/md";
import {
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiCreditCard,
  FiGrid,
  FiSettings,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { SiGoogleadsense } from "react-icons/si";
import { FaGears } from "react-icons/fa6";
import { TbClockHour2Filled, TbMessageReportFilled } from "react-icons/tb";
import { TiCancel } from "react-icons/ti";
import {
  LuChartNoAxesCombined as ChartNoAxesCombined,
  LuChartPie as ChartPie,
} from "react-icons/lu";
import dayjs from "dayjs";
import meetingRoomBanner from "../../../../assets/meeting-room-banner.png";
import { PERMISSIONS } from "../../../../constants/permissions";
import useUserPermissions from "../../../../hooks/useUserPermissions";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import MeetingRevenue from "../MeetingRevenue";
import LeadsLayout from "../ViewClients/LeadsLayout";
import PieChartMui from "../../../../components/graphs/PieChartMui";
import BarGraph from "../../../../components/graphs/BarGraph";
import HeatMap from "../../../../components/graphs/HeatMap";
import WidgetSection from "../../../../components/WidgetSection";
import AgTable from "../../../../components/AgTable";
import StatusChip from "../../../../components/StatusChip";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { inrFormat } from "../../../../utils/currencyFormat";

const getFiscalYearLabel = () => {
  const currentDate = dayjs();
  const startYear = currentDate.month() >= 3
    ? currentDate.year()
    : currentDate.year() - 1;

  return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
};

const MeetingBarsIcon = () => (
  <span className="flex h-8 w-8 items-end justify-center gap-1">
    <span className="h-3 w-1.5 rounded-full bg-current" />
    <span className="h-5 w-1.5 rounded-full bg-current" />
    <span className="h-7 w-1.5 rounded-full bg-current" />
  </span>
);

const MeetingRoomSummaryCards = ({
  hasPermission,
  activeUniqueClientCount = 0,
}) => {
  const axios = useAxiosPrivate();
  const fiscalYear = getFiscalYearLabel();
  const { data: summaryMeetings = [] } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-meetings");
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const { data: summaryRooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-rooms");
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const {
    data: summaryMeetingRevenue = [],
    isLoading: isSummaryRevenueLoading,
  } = useQuery({
    queryKey: ["meetings-revenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-meeting-revenue");
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const revenueSummary = useMemo(() => {
    const currentMonth = dayjs().startOf("month");
    const financialYearStart = currentMonth.month() >= 3
      ? currentMonth.year()
      : currentMonth.year() - 1;
    const fiscalMonths = Array.from({ length: 12 }, (_item, index) =>
      dayjs()
        .year(financialYearStart)
        .month(3 + index)
        .startOf("month"),
    );
    const fiscalYearEnd = fiscalMonths[0].add(1, "year");
    const verifiedRevenueRows = summaryMeetingRevenue
      .flatMap((monthData) =>
        Array.isArray(monthData?.revenue) ? monthData.revenue : [],
      )
      .filter((row) => {
        const revenueDate = dayjs(row?.date);
        const financeStatus = String(row?.financeStatus || "")
          .trim()
          .toLowerCase();

        return (
          financeStatus === "verified" &&
          revenueDate.isValid() &&
          !revenueDate.isBefore(fiscalMonths[0]) &&
          revenueDate.isBefore(fiscalYearEnd)
        );
      });
    const actualByMonth = new Map();
    verifiedRevenueRows.forEach((row) => {
      const monthKey = dayjs(row.date).format("YYYY-MM");
      const amount =
        parseFloat(String(row?.taxable || "0").replace(/,/g, "")) || 0;

      actualByMonth.set(monthKey, (actualByMonth.get(monthKey) || 0) + amount);
    });

    const latestActualMonthIndex = fiscalMonths.reduce(
      (latestIndex, month, index) =>
        !currentMonth.isBefore(month.add(2, "month"), "month")
          ? index
          : latestIndex,
      -1,
    );

    if (latestActualMonthIndex < 0) {
      return {
        annualTarget: 0,
        booked: 0,
        due: 0,
        averagePrice: 0,
        averageShortfallSurplus: 0,
      };
    }

    const booked = fiscalMonths
      .slice(0, latestActualMonthIndex + 1)
      .reduce(
        (total, month) =>
          total + (actualByMonth.get(month.format("YYYY-MM")) || 0),
        0,
      );
    const projectedMonthlyAverage = booked / (latestActualMonthIndex + 1);
    const due =
      projectedMonthlyAverage * Math.max(11 - latestActualMonthIndex, 0);
    const latestActualMonthRevenue =
      actualByMonth.get(
        fiscalMonths[latestActualMonthIndex].format("YYYY-MM"),
      ) || 0;
    const averageShortfallSurplus = Math.round(
      latestActualMonthRevenue - projectedMonthlyAverage,
    );

    return {
      annualTarget: booked + due,
      booked,
      due,
      averagePrice:
        activeUniqueClientCount > 0
          ? Math.round(booked / activeUniqueClientCount)
          : 0,
      averageShortfallSurplus,
    };
  }, [activeUniqueClientCount, summaryMeetingRevenue]);
  const bookingCounts = useMemo(() => {
    const currentDate = dayjs();
    const financialYearStart = currentDate.month() >= 3
      ? currentDate.year()
      : currentDate.year() - 1;
    const rangeStart = dayjs()
      .year(financialYearStart)
      .month(3)
      .startOf("month");
    const rangeEnd = rangeStart.add(1, "year");
    const counts = { internal: 0, external: 0, openDesk: 0 };

    summaryMeetings.forEach((meeting) => {
      const meetingDate = dayjs(
        meeting?.date || meeting?.startDate || meeting?.startTime,
      );
      const meetingType = String(meeting?.meetingType || "").toLowerCase();
      const meetingStatus = String(
        meeting?.meetingStatus || meeting?.status || "",
      ).toLowerCase();

      if (
        !meetingDate.isValid() ||
        meetingDate.isBefore(rangeStart) ||
        !meetingDate.isBefore(rangeEnd) ||
        meetingStatus !== "completed"
      ) {
        return;
      }

      if (meetingType === "internal") counts.internal += 1;
      if (meetingType === "external") counts.external += 1;
    });

    summaryMeetingRevenue
      .flatMap((monthData) =>
        Array.isArray(monthData?.revenue) ? monthData.revenue : [],
      )
      .forEach((row) => {
        const bookingDate = dayjs(row?.date || row?.createdAt);
        const isOpenDesk =
          row?.source === "day-pass" ||
          ["full-day pass", "half-day pass"].includes(
            String(row?.meetingType || row?.meetingTypeRaw || "").toLowerCase(),
          );
        const isCompletedOpenDeskVisit = Boolean(
          row?.visitorDetails?.checkOut || row?.checkOut,
        );

        if (
          isOpenDesk &&
          isCompletedOpenDeskVisit &&
          bookingDate.isValid() &&
          !bookingDate.isBefore(rangeStart) &&
          bookingDate.isBefore(rangeEnd)
        ) {
          counts.openDesk += 1;
        }
      });

    return {
      ...counts,
      total: counts.internal + counts.external,
    };
  }, [summaryMeetingRevenue, summaryMeetings]);
  const averageRoomUtilisation = useMemo(
    () =>
      calculateAverageRoomUtilisation(
        summaryMeetings,
        summaryRooms,
        dayjs(),
      ),
    [summaryMeetings, summaryRooms],
  );
  const activeMeetingRooms = summaryRooms.filter(
    (room) => room?.isActive === true,
  );
  const activeMeetingRoomsByBuilding = Object.entries(
    activeMeetingRooms.reduce((counts, room) => {
      const buildingName =
        room?.location?.building?.buildingName ||
        room?.building?.buildingName ||
        room?.buildingName ||
        "Other";
      counts[buildingName] = (counts[buildingName] || 0) + 1;
      return counts;
    }, {}),
  ).map(([label, value], index) => ({
    label,
    value,
    className: index % 2 === 0 ? "text-[#1687F8]" : "text-[#FF7A1A]",
  }));
  const totalHoursBooked = useMemo(() => {
    const currentMonth = dayjs().startOf("month");
    const financialYearStart = currentMonth.month() >= 3
      ? currentMonth.year()
      : currentMonth.year() - 1;
    const rangeStart = dayjs()
      .year(financialYearStart)
      .month(3)
      .startOf("month");
    const fiscalMonths = Array.from({ length: 12 }, (_item, index) =>
      rangeStart.add(index, "month"),
    );
    const latestActualMonth = fiscalMonths.reduce(
      (latestMonth, month) =>
        !currentMonth.isBefore(month.add(2, "month"), "month")
          ? month
          : latestMonth,
      null,
    );
    const rangeEnd = latestActualMonth
      ? latestActualMonth.add(1, "month")
      : rangeStart;
    const activeRoomNames = new Set(
      summaryRooms
        .filter((room) => room?.isActive === true)
        .map((room) => room?.name)
        .filter(Boolean),
    );

    return summaryMeetings.reduce((total, meeting) => {
      const meetingDate = dayjs(
        meeting?.date || meeting?.startDate || meeting?.startTime,
      );
      const meetingStatus = String(
        meeting?.meetingStatus || meeting?.status || "",
      ).toLowerCase();
      const roomName = meeting?.roomName || meeting?.bookedRoom?.name;
      const duration = String(meeting?.duration || "0m");
      const durationMatch = duration.match(/(\d+(?:\.\d+)?)(m|h)/i);
      const durationValue = Number(durationMatch?.[1] || 0);
      const durationMinutes =
        durationMatch?.[2]?.toLowerCase() === "h"
          ? durationValue * 60
          : durationValue;

      if (
        meetingStatus === "cancelled" ||
        !meetingDate.isValid() ||
        meetingDate.isBefore(rangeStart) ||
        !meetingDate.isBefore(rangeEnd) ||
        !activeRoomNames.has(roomName)
      ) {
        return total;
      }

      return total + durationMinutes / 60;
    }, 0);
  }, [summaryMeetings, summaryRooms]);
  const totalHoursCancelled = useMemo(() => {
    const currentMonth = dayjs().startOf("month");
    const financialYearStart = currentMonth.month() >= 3
      ? currentMonth.year()
      : currentMonth.year() - 1;
    const rangeStart = dayjs()
      .year(financialYearStart)
      .month(3)
      .startOf("month");
    const fiscalMonths = Array.from({ length: 12 }, (_item, index) =>
      rangeStart.add(index, "month"),
    );
    const latestActualMonth = fiscalMonths.reduce(
      (latestMonth, month) =>
        !currentMonth.isBefore(month.add(2, "month"), "month")
          ? month
          : latestMonth,
      null,
    );
    const rangeEnd = latestActualMonth
      ? latestActualMonth.add(1, "month")
      : rangeStart;
    const activeRoomNames = new Set(
      summaryRooms
        .filter((room) => room?.isActive === true)
        .map((room) => room?.name)
        .filter(Boolean),
    );

    return summaryMeetings.reduce((total, meeting) => {
      const meetingDate = dayjs(
        meeting?.date || meeting?.startDate || meeting?.startTime,
      );
      const meetingStatus = String(
        meeting?.meetingStatus || meeting?.status || "",
      ).toLowerCase();
      const roomName = meeting?.roomName || meeting?.bookedRoom?.name;
      const duration = String(meeting?.duration || "0m");
      const durationMatch = duration.match(/(\d+(?:\.\d+)?)(m|h)/i);
      const durationValue = Number(durationMatch?.[1] || 0);
      const durationMinutes =
        durationMatch?.[2]?.toLowerCase() === "h"
          ? durationValue * 60
          : durationValue;

      if (
        meetingStatus !== "cancelled" ||
        !meetingDate.isValid() ||
        meetingDate.isBefore(rangeStart) ||
        !meetingDate.isBefore(rangeEnd) ||
        !activeRoomNames.has(roomName)
      ) {
        return total;
      }

      return total + durationMinutes / 60;
    }, 0);
  }, [summaryMeetings, summaryRooms]);
  const occupancyPercent = useMemo(() => {
    const currentMonth = dayjs().startOf("month");
    const financialYearStart = currentMonth.month() >= 3
      ? currentMonth.year()
      : currentMonth.year() - 1;
    const rangeStart = dayjs()
      .year(financialYearStart)
      .month(3)
      .startOf("month");
    const fiscalMonths = Array.from({ length: 12 }, (_item, index) =>
      rangeStart.add(index, "month"),
    );
    const latestActualMonth = fiscalMonths.reduce(
      (latestMonth, month) =>
        !currentMonth.isBefore(month.add(2, "month"), "month")
          ? month
          : latestMonth,
      null,
    );
    const rangeEnd = latestActualMonth
      ? latestActualMonth.add(1, "month")
      : rangeStart;
    const roomCapacityByName = new Map(
      summaryRooms
        .filter((room) => room?.isActive === true)
        .map((room) => [room?.name, Number(room?.seats || 0)])
        .filter(([name, seats]) => name && seats > 0),
    );

    const seatHours = summaryMeetings.reduce(
      (totals, meeting) => {
        const meetingDate = dayjs(
          meeting?.date || meeting?.startDate || meeting?.startTime,
        );
        const meetingStatus = String(
          meeting?.meetingStatus || meeting?.status || "",
        ).toLowerCase();
        const roomName = meeting?.roomName || meeting?.bookedRoom?.name;
        const roomCapacity = roomCapacityByName.get(roomName) || 0;
        const duration = String(meeting?.duration || "0m");
        const durationMatch = duration.match(/(\d+(?:\.\d+)?)(m|h)/i);
        const durationValue = Number(durationMatch?.[1] || 0);
        const durationHours =
          durationMatch?.[2]?.toLowerCase() === "h"
            ? durationValue
            : durationValue / 60;

        if (
          meetingStatus !== "completed" ||
          !meetingDate.isValid() ||
          meetingDate.isBefore(rangeStart) ||
          !meetingDate.isBefore(rangeEnd) ||
          roomCapacity <= 0 ||
          durationHours <= 0
        ) {
          return totals;
        }

        const participantCount = Array.isArray(meeting?.participants)
          ? meeting.participants.length
          : 0;
        totals.occupied +=
          Math.min(participantCount, roomCapacity) * durationHours;
        totals.available += roomCapacity * durationHours;
        return totals;
      },
      { occupied: 0, available: 0 },
    );

    return seatHours.available > 0
      ? (seatHours.occupied / seatHours.available) * 100
      : 0;
  }, [summaryMeetings, summaryRooms]);
  const cards = [
    {
      title: "Annual Revenue Target",
      value: isSummaryRevenueLoading
        ? "—"
        : `₹ ${inrFormat(revenueSummary.annualTarget)}`,
      icon: MdTrendingUp,
      tone: "green",
      valueTone: "text-[#1E3D73]",
      permission:
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_ANNUAL_REVENUE_TARGET_CARD
          .value,
    },
    {
      title: "Revenues Booked",
      value: isSummaryRevenueLoading
        ? "—"
        : `₹ ${inrFormat(revenueSummary.booked)}`,
      icon: MeetingBarsIcon,
      tone: "booked",
      valueTone: "text-[#13a573]",
      permission:
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_REVENUES_BOOKED_CARD.value,
    },
    {
      title: "Revenue Due",
      value: isSummaryRevenueLoading
        ? "—"
        : `₹ ${inrFormat(revenueSummary.due)}`,
      icon: ChartNoAxesCombined,
      tone: "due",
      valueTone: "text-[#f04a4a]",
      permission:
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_REVENUE_DUE_CARD.value,
    },
    {
      title: "Hourly Meeting Room Price",
      value: isSummaryRevenueLoading
        ? "—"
        : `₹ ${inrFormat(revenueSummary.averagePrice)}`,
      icon: ChartPie,
      tone: "lightNavy",
      valueTone: "text-[#1E3D73]",
      permission:
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_AVERAGE_PRICE_CARD.value,
    },
    {
      title: "Active Unique Client",
      value: activeUniqueClientCount.toLocaleString("en-IN"),
      icon: MdGroups,
      tone: "lightNavy",
      valueTone: "text-[#1E3D73]",
      permission:
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_ACTIVE_UNIQUE_CLIENT_CARD.value,
    },
    {
      title: "Total Bookings",
      value: bookingCounts.total.toLocaleString("en-IN"),
      bookingBreakdown: [
        {
          label: "Internal",
          value: bookingCounts.internal,
          className: "text-[#1687F8]",
        },
        {
          label: "External",
          value: bookingCounts.external,
          className: "text-[#FF7A1A]",
        },
      ],
      icon: MdEventAvailable,
      tone: "lightNavy",
      valueTone: "text-[#1E3D73]",
      permission:
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_TOTAL_BOOKINGS_CARD.value,
    },
    {
      title: "Average Room Utilisation",
      value: `${averageRoomUtilisation.toFixed(1)}%`,
      icon: MdAccessTime,
      tone: "lightNavy",
      valueTone: "text-[#1E3D73]",
      permission:
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_AVERAGE_UTILISATION_CARD.value,
    },
    {
      title: "Average Shortfall / Surplus",
      value: isSummaryRevenueLoading
        ? "—"
        : `${inrFormat(Math.abs(revenueSummary.averageShortfallSurplus))} ${
            revenueSummary.averageShortfallSurplus > 0
              ? "Surplus"
              : revenueSummary.averageShortfallSurplus < 0
                ? "Shortfall"
                : "On Target"
          }`,
      icon: MdTrendingDown,
      tone: revenueSummary.averageShortfallSurplus >= 0 ? "green" : "red",
      valueTone:
        revenueSummary.averageShortfallSurplus >= 0
          ? "text-[#13a573]"
          : "text-[#f04a4a]",
      permission:
        PERMISSIONS
          .SALES_VERTICAL_MEETING_ROOM_AVERAGE_SHORTFALL_SURPLUS_CARD.value,
    },
    {
      title: "Total Meeting Room",
      value: activeMeetingRooms.length,
      bookingBreakdown: activeMeetingRoomsByBuilding,
      icon: MdMeetingRoom,
      tone: "lightNavy",
      valueTone: "text-[#1E3D73]",
      route: "/app/dashboard/sales-dashboard/meeting-room/calendar",
      permission:
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_NO_OF_MEETING_ROOMS_CARD.value,
    },
    {
      title: "Total Hours Booked",
      value: Math.round(totalHoursBooked).toLocaleString("en-IN"),
      icon: TbClockHour2Filled,
      tone: "booked",
      valueTone: "text-[#13a573]",
      route: "/app/dashboard/sales-dashboard/meeting-room/reports",
      permission:
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_TOTAL_HOURS_BOOKED_CARD.value,
    },
    {
      title: "Total Hours Cancelled",
      value: Math.round(totalHoursCancelled).toLocaleString("en-IN"),
      icon: TiCancel,
      tone: "red",
      valueTone: "text-[#f04a4a]",
      route: "/app/dashboard/sales-dashboard/meeting-room/reports",
      permission:
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_TOTAL_HOURS_CANCELLED_CARD
          .value,
    },
    {
      title: "Occupancy %",
      value: `${occupancyPercent.toFixed(1)}%`,
      icon: MdPercent,
      tone: "lightNavy",
      valueTone: "text-[#1E3D73]",
      route: "/app/dashboard/sales-dashboard/meeting-room/average-occupancy",
      permission:
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_OCCUPANCY_PERCENT_CARD.value,
    },
  ];

  const toneClasses = {
    green: "bg-[#eafbf3] text-[#12a573]",
    booked: "bg-[#ecf9ff] text-[#13a573]",
    pink: "bg-[#fff0f5] text-[#f00068]",
    due: "bg-[#fff0f5] text-[#f04a4a]",
    lightNavy: "bg-[#eaf0f8] text-[#3F6291]",
    red: "bg-[#fff0f0] text-[#f04a4a]",
  };
  const visibleCards = cards.filter((card) => hasPermission(card.permission));

  if (visibleCards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {visibleCards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className={`flex min-h-[92px] items-center rounded-lg border border-[#e8ecf4] bg-white py-4 shadow-sm ${
              card.bookingBreakdown
                ? "gap-2 px-2 min-[1450px]:gap-2.5 min-[1450px]:px-3 min-[1700px]:gap-4 min-[1700px]:px-5"
                : "gap-4 px-5"
            }`}
          >
            <span
              className={`flex shrink-0 items-center justify-center rounded-full ${
                card.bookingBreakdown
                  ? "h-10 w-10 min-[1450px]:h-12 min-[1450px]:w-12 min-[1700px]:h-14 min-[1700px]:w-14"
                  : "h-14 w-14"
              } ${toneClasses[card.tone]}`}
            >
              <Icon
                size={card.bookingBreakdown ? 25 : 34}
                className={
                  card.bookingBreakdown
                    ? "min-[1700px]:h-[34px] min-[1700px]:w-[34px]"
                    : undefined
                }
                aria-hidden="true"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="mb-1 flex items-center justify-between gap-2 text-sm font-pregular leading-tight text-[#1E3D73]">
                <span>{card.title}</span>
                {card.bookingBreakdown && (
                  <span className="shrink-0 font-pmedium text-[#1E3D73]">
                    {card.value}
                  </span>
                )}
              </span>
              <span className="mb-1 block text-xs font-semibold text-[#58709A]">
                {fiscalYear}
              </span>
              {card.bookingBreakdown ? (
                <span className="mt-1 flex flex-nowrap items-center gap-0.5 whitespace-nowrap text-[9px] font-pmedium tracking-tight min-[1450px]:gap-1 min-[1450px]:text-[10px] min-[1700px]:gap-1.5 min-[1700px]:text-[13px]">
                  {card.bookingBreakdown.map((item, index) => (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-0.5 min-[1450px]:gap-1"
                    >
                      {index > 0 && (
                        <span
                          className="h-4 w-px bg-[#d7dce8]"
                          aria-hidden="true"
                        />
                      )}
                      <span className={item.className}>
                        {item.label} - {item.value.toLocaleString("en-IN")}
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

const MeetingRoomUniqueClientsGraph = ({ onUniqueClientCountChange }) => {
  const axios = useAxiosPrivate();
  const { data: meetingRevenue = [] } = useQuery({
    queryKey: ["meeting-room-unique-client-revenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/simple-consolidated-revenue");
      const revenue = Array.isArray(response.data?.meetingRevenue)
        ? response.data.meetingRevenue
        : [];

      return revenue.filter((row) => {
        const meetingType = String(
          row?.meetingType ||
            row?.particulars ||
            row?.visitorDetails?.purposeOfVisit ||
            "",
        )
          .trim()
          .toLowerCase();
        const isDayPass =
          row?.source === "day-pass" ||
          meetingType.includes("half-day") ||
          meetingType.includes("half day") ||
          meetingType.includes("full-day") ||
          meetingType.includes("full day");

        return !isDayPass;
      });
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const revenueRows = useMemo(
    () => (Array.isArray(meetingRevenue) ? meetingRevenue : []),
    [meetingRevenue],
  );
  const clientsByMonth = useMemo(() => {
    const grouped = {};

    revenueRows.forEach((row) => {
      const meetingDate = dayjs(row?.date || row?.createdAt);
      if (!meetingDate.isValid()) return;

      const month = meetingDate.format("MMMM");
      grouped[month] ||= [];
      grouped[month].push({
        client:
          row?.client?.clientName ||
          row?.clientName ||
          row?.meetingCompanyName ||
          row?.visitorDetails?.visitorCompany ||
          "Unknown",
        typeOfClient: "External Meetings",
        date: meetingDate.format("YYYY-MM-DD"),
        invoiceId: row?._id || row?.id,
      });
    });

    return Object.entries(grouped).map(([month, clients]) => ({
      month,
      clients,
    }));
  }, [revenueRows]);
  const currentDate = dayjs();
  const currentFinancialYear =
    currentDate.month() >= 3 ? currentDate.year() : currentDate.year() - 1;
  const financialYearLabel = `${currentFinancialYear}-${String(
    currentFinancialYear + 1,
  ).slice(-2)}`;
  const totalUniqueClientsTitle = ({ count }) =>
    `TOTAL UNIQUE CLIENTS: ${count.toLocaleString("en-IN")}`;

  return (
    <LeadsLayout
      data={clientsByMonth}
      hideAccordion
      title={
        <span
          className="inline-flex items-baseline gap-2 whitespace-nowrap leading-none text-[#1E3D73]"
        >
          <BiznestTitle />
          <span className="inline-flex items-baseline leading-none">
            MEETING ROOM UNIQUE CLIENT COUNT - FY {financialYearLabel}
          </span>
        </span>
      }
      titleAmount={totalUniqueClientsTitle}
      hideMonthAxisTitle
      noOuterPadding
      investorBlueStyle
      investorTitleAmountChip
      hideFinancialYearControls
      focusedClientSeries="External Meetings"
      actualMonthLag={2}
      virtualOfficeActualLegend="Actual Meeting Room Client"
      virtualOfficeProjectedLegend="Remaining KRA Target"
      virtualOfficeActualColor="#3cb37180"
      virtualOfficeProjectedColor="#787878"
      virtualOfficeTooltipLabel="Meeting Room Client"
      virtualOfficeDataLabelsAbove
      onSelectedFinancialYearClientsCountChange={onUniqueClientCountChange}
    />
  );
};

const meetingClientChartConfig = {
  internalExternalBookings: {
    title: "MEETING ROOM INTERNAL & EXTERNAL CLIENTS BOOKINGS",
    route:
      "/app/dashboard/sales-dashboard/meeting-room/internal-external-bookings",
    colors: ["#1687F8", "#FF7A1A"],
    tooltipUnit: "Booking",
  },
  internalCommitmentUtilization: {
    title: "MEETING ROOM INTERNAL COMMITMENT UTILIZATION",
    route: "/app/dashboard/sales-dashboard/meeting-room/monthly-clients",
    colors: ["#ef4444", "#16a34a", "#9fb2cf"],
    tooltipUnit: "Credit",
  },
  bookedHoursCancelled: {
    title: "MEETING ROOM BOOKED HOURS VS CANCELLED",
    route:
      "/app/dashboard/sales-dashboard/meeting-room/booked-hours-cancelled",
    colors: ["#16a34a", "#ef4444"],
    tooltipUnit: "Hour",
  },
  meetingDurationBreakdown: {
    title: "MEETING ROOM DURATION BREAKDOWN",
    route:
      "/app/dashboard/sales-dashboard/meeting-room/meeting-duration-breakdown",
    colors: ["#50c4a8", "#22457e", "#2f7ff0", "#f7a619", "#6aaed6", "#90caf9"],
    tooltipUnit: "Booking",
  },
};

const MeetingRoomClientCharts = ({ visibleCharts }) => {
  const axios = useAxiosPrivate();
  const { data: meetingRevenue = [] } = useQuery({
    queryKey: ["meetings-revenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-meeting-revenue");
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-meetings");
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-rooms");
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const { data: internalClients = [] } = useQuery({
    queryKey: ["meeting-room-internal-clients"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients", {
        params: { active: true, page: 1, limit: 500 },
      });
      return Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const revenueRows = useMemo(
    () =>
      meetingRevenue.flatMap((monthData) =>
        Array.isArray(monthData?.revenue) ? monthData.revenue : [],
      ),
    [meetingRevenue],
  );
  const internalExternalBookingsData = useMemo(() => {
    const counts = { Internal: 0, External: 0 };
    const sourceRows = meetings.length > 0 ? meetings : revenueRows;
    const currentDate = dayjs();
    const financialYearStart = currentDate.month() >= 3
      ? currentDate.year()
      : currentDate.year() - 1;
    const rangeStart = dayjs()
      .year(financialYearStart)
      .month(3)
      .startOf("month");
    const rangeEnd = rangeStart.add(1, "year");

    sourceRows.forEach((meeting) => {
      const meetingType = String(
        meeting?.meetingType || meeting?.meetingTypeRaw || "",
      ).toLowerCase();
      const meetingStatus = String(
        meeting?.meetingStatus || meeting?.status || "",
      ).toLowerCase();
      const meetingDate = dayjs(
        meeting?.date || meeting?.startDate || meeting?.startTime,
      );

      if (
        !meetingDate.isValid() ||
        meetingDate.isBefore(rangeStart) ||
        !meetingDate.isBefore(rangeEnd) ||
        meetingStatus !== "completed"
      ) {
        return;
      }

      if (meetingType === "internal") counts.Internal += 1;
      if (meetingType === "external") counts.External += 1;
    });

    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [meetings, revenueRows]);
  const internalCommitmentUtilizationData = useMemo(() => {
    const currentMonth = dayjs().startOf("month");
    const totals = internalClients.reduce(
      (result, client) => {
        const historyEntry = Array.isArray(client?.meetingCreditBalanceHistory)
          ? client.meetingCreditBalanceHistory.find((history) =>
              dayjs(history?.monthStartDate).isSame(currentMonth, "month"),
            )
          : null;
        const totalCredit = Number(
          historyEntry?.monthlyCredit ?? client?.totalMeetingCredits ?? 0,
        );
        const usedCredit = Number(historyEntry?.consumedCredit || 0);
        result.total += totalCredit;
        result.used += Math.max(usedCredit, 0);
        return result;
      },
      { total: 0, used: 0 },
    );

    return [
      { label: "Total Credit", value: Math.round(totals.total) },
      { label: "Total Used Credit", value: Math.round(totals.used) },
      {
        label: "Remaining Credit",
        value: Math.max(Math.round(totals.total - totals.used), 0),
      },
    ];
  }, [internalClients]);
  const bookedHoursCancelledData = useMemo(() => {
    const currentMonth = dayjs().startOf("month");
    const financialYearStart = currentMonth.month() >= 3
      ? currentMonth.year()
      : currentMonth.year() - 1;
    const rangeStart = dayjs()
      .year(financialYearStart)
      .month(3)
      .startOf("month");
    const fiscalMonths = Array.from({ length: 12 }, (_item, index) =>
      rangeStart.add(index, "month"),
    );
    const latestActualMonth = fiscalMonths.reduce(
      (latestMonth, month) =>
        !currentMonth.isBefore(month.add(2, "month"), "month")
          ? month
          : latestMonth,
      null,
    );
    const rangeEnd = latestActualMonth
      ? latestActualMonth.add(1, "month")
      : rangeStart;
    const activeRoomNames = new Set(
      rooms
        .filter((room) => room?.isActive === true)
        .map((room) => room?.name)
        .filter(Boolean),
    );
    const bookedStatuses = new Set([
      "upcoming",
      "ongoing",
      "completed",
      "extended",
    ]);
    const totals = meetings.reduce(
      (result, meeting) => {
        const meetingDate = dayjs(
          meeting?.date || meeting?.startDate || meeting?.startTime,
        );
        const status = String(
          meeting?.meetingStatus || meeting?.status || "",
        ).toLowerCase();
        const roomName = meeting?.roomName || meeting?.bookedRoom?.name;
        if (
          !meetingDate.isValid() ||
          meetingDate.isBefore(rangeStart) ||
          !meetingDate.isBefore(rangeEnd) ||
          !activeRoomNames.has(roomName)
        ) {
          return result;
        }

        const hours = parseMeetingDurationMinutes(meeting) / 60;
        if (status === "cancelled") result.cancelled += hours;
        if (bookedStatuses.has(status)) result.booked += hours;
        return result;
      },
      { booked: 0, cancelled: 0 },
    );

    return [
      { label: "Booked Hours", value: Math.round(totals.booked) },
      { label: "Cancelled Hours", value: Math.round(totals.cancelled) },
    ];
  }, [meetings, rooms]);
  const meetingDurationBreakdownData = useMemo(() => {
    const durationBuckets = ["15", "30", "60", "90", "120", "Others"];
    const durationCount = durationBuckets.reduce((counts, bucket) => {
      counts[bucket] = 0;
      return counts;
    }, {});

    meetings.forEach((meeting) => {
      const duration = String(meeting?.duration || "0m");
      const hours = Number(duration.match(/(\d+(?:\.\d+)?)h/i)?.[1] || 0);
      const minutes = Number(duration.match(/(\d+)m/i)?.[1] || 0);
      const durationInMinutes = hours * 60 + minutes;

      if (durationInMinutes <= 15) durationCount["15"] += 1;
      else if (durationInMinutes <= 30) durationCount["30"] += 1;
      else if (durationInMinutes <= 60) durationCount["60"] += 1;
      else if (durationInMinutes <= 90) durationCount["90"] += 1;
      else if (durationInMinutes <= 120) durationCount["120"] += 1;
      else durationCount.Others += 1;
    });

    return durationBuckets.map((label) => ({
      label,
      value: durationCount[label],
    }));
  }, [meetings]);
  const dataByChart = {
    internalExternalBookings: internalExternalBookingsData,
    internalCommitmentUtilization: internalCommitmentUtilizationData,
    bookedHoursCancelled: bookedHoursCancelledData,
    meetingDurationBreakdown: meetingDurationBreakdownData,
  };

  return (
    <WidgetSection
      layout={visibleCharts.length > 1 ? 2 : 1}
      gridGap="gap-x-4 gap-y-4"
      padding
    >
      {visibleCharts.map((chartKey) => {
        const chart = meetingClientChartConfig[chartKey];
        const chartData = dataByChart[chartKey];
        const labels = chartData.map((item) => item.label);
        const hasChartData = chartData.some((item) => item.value > 0);
        const legend = (
          <div className="w-full max-w-full select-none px-2 pb-1">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {labels.map((label, index) => (
                <div
                  key={label}
                  className="flex min-w-0 items-center gap-1 text-xs text-[#1E3D73]"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: chart.colors[index] }}
                  />
                  <span className="max-w-40 truncate" title={label}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

        return (
          <WidgetSection
            key={chartKey}
            title={
              <span
                className="inline-flex items-baseline gap-2 whitespace-nowrap text-[#1E3D73]"
              >
                <span
                  aria-label="BIZ Nest"
                  className="inline-flex items-baseline whitespace-nowrap normal-case leading-none text-[#2a2525]"
                >
                  <span>BI</span>
                  <span className="text-[#e33434]">Z</span>
                  <span>&nbsp;Nest</span>
                </span>
                <span>{chart.title}</span>
              </span>
            }
            border
            borderColor="#1E3D73"
            bodyBorderColor="#9FB2CF"
            titleClassName={
              chartKey === "internalExternalBookings"
                ? "!text-[17px] min-[1700px]:!text-widgetTitle"
                : ""
            }
            headerContentClassName={
              chartKey === "internalExternalBookings"
                ? "lg:!h-10 !gap-2"
                : "lg:!h-10"
            }
          >
            {hasChartData ? (
              <PieChartMui
                key={`${chartKey}-${chartData
                  .map((item) => `${item.label}-${item.value}`)
                  .join("-")}`}
                data={chartData}
                options={{
                  chart: { type: "pie", fontFamily: "Poppins-Regular" },
                  labels,
                  colors: chart.colors,
                  legend: { show: false },
                  dataLabels: {
                    formatter: (percentage) => `${percentage.toFixed(1)}%`,
                  },
                  tooltip: {
                    y: {
                      formatter: (value) => String(value),
                    },
                  },
                }}
                width={500}
                height={350}
                customLegend={legend}
                centerAlign
              />
            ) : (
              <div className="flex h-[350px] items-center justify-center text-sm text-[#1E3D73]">
                No chart data available
              </div>
            )}
          </WidgetSection>
        );
      })}
    </WidgetSection>
  );
};

const operationalChartConfig = {
  externalGuests: {
    title: "EXTERNAL GUEST VISITED",
    route: "/app/dashboard/sales-dashboard/meeting-room/external-guests",
    type: "bar",
  },
  averageOccupancy: {
    title: "AVERAGE OCCUPANCY OF ROOM",
    route: "/app/dashboard/sales-dashboard/meeting-room/average-occupancy",
    type: "bar",
  },
  availabilityStatus: {
    title: "MEETING ROOM AVAILABILITY STATUS - TODAY",
    route: "/app/dashboard/sales-dashboard/meeting-room/availability-status",
    type: "pie",
  },
  busyTimeWeek: {
    title: "MEETING ROOM BUSY TIME DURING THE WEEK",
    route: "/app/dashboard/sales-dashboard/meeting-room/busy-time-week",
    type: "heatmap",
  },
};

const parseMeetingDurationMinutes = (meeting) => {
  const startTime = dayjs(meeting?.startTime);
  const endTime = dayjs(meeting?.extendTime || meeting?.endTime);
  if (startTime.isValid() && endTime.isValid()) {
    return Math.max(0, endTime.diff(startTime, "minute"));
  }

  const duration = String(meeting?.duration || "");
  const hours = Number(duration.match(/(\d+(?:\.\d+)?)h/i)?.[1] || 0);
  const minutes = Number(duration.match(/(\d+)m/i)?.[1] || 0);
  return hours * 60 + minutes;
};

const getMeetingPersonName = (person, fallback = "N/A") => {
  if (!person) return fallback;
  if (typeof person === "string") return person.trim() || fallback;

  return (
    person.employeeName ||
    person.name ||
    person.fullName ||
    [person.firstName, person.middleName, person.lastName]
      .filter(Boolean)
      .join(" ") ||
    fallback
  );
};

const getMeetingDepartmentName = (department) => {
  if (!department) return "N/A";
  if (typeof department === "string") return department;
  if (Array.isArray(department)) {
    return department
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.name || item?.departmentName,
      )
      .filter(Boolean)
      .join(", ") || "N/A";
  }

  return department.name || department.departmentName || "N/A";
};

const getMeetingCompanyName = (meeting, fallback = "N/A") => {
  const company =
    meeting?.client ||
    meeting?.externalClient ||
    meeting?.companyName ||
    meeting?.company;

  if (!company) return fallback;
  if (typeof company === "string") return company;

  return (
    company.clientName ||
    company.companyName ||
    company.registeredClientCompany ||
    company.visitorCompany ||
    company.brandName ||
    company.name ||
    fallback
  );
};

const normalizeClientKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const getMeetingParticipants = (participants) => {
  if (!Array.isArray(participants) || participants.length === 0) return "N/A";

  return participants
    .map((participant) => getMeetingPersonName(participant, ""))
    .filter(Boolean)
    .join(", ") || "N/A";
};

const formatMeetingCurrency = (value) => {
  const amount = Number(value || 0);
  return `INR ${Number.isFinite(amount) ? amount.toLocaleString("en-IN") : 0}`;
};

const getMeetingPaymentStatus = (status) => {
  if (typeof status === "boolean") return status ? "Paid" : "Unpaid";
  return String(status || "Unpaid");
};

const countWorkingDays = (year, month) => {
  const lastDay = dayjs().year(year).month(month).endOf("month").date();
  let workingDays = 0;

  for (let date = 1; date <= lastDay; date += 1) {
    const weekday = dayjs().year(year).month(month).date(date).day();
    if (weekday >= 1 && weekday <= 6) workingDays += 1;
  }

  return workingDays;
};

const calculateAverageRoomUtilisation = (
  meetings,
  rooms,
  currentTime = dayjs(),
) => {
  const activeRooms = rooms.filter((room) => room?.isActive !== false);
  if (!activeRooms.length) return 0;

  const bookedHours = Object.fromEntries(
    activeRooms.map((room) => [room?.name, 0]),
  );

  meetings.forEach((meeting) => {
    const meetingDate = dayjs(
      meeting?.date || meeting?.startDate || meeting?.startTime,
    );
    const meetingStatus = String(
      meeting?.meetingStatus || meeting?.status || "",
    ).toLowerCase();
    const roomName = meeting?.roomName || meeting?.bookedRoom?.name;

    if (
      !meetingDate.isValid() ||
      !meetingDate.isSame(currentTime, "month") ||
      meetingStatus === "cancelled" ||
      !(roomName in bookedHours)
    ) {
      return;
    }

    bookedHours[roomName] += parseMeetingDurationMinutes(meeting) / 60;
  });

  const roomCapacity =
    9 * countWorkingDays(currentTime.year(), currentTime.month());
  if (roomCapacity <= 0) return 0;

  return (
    activeRooms.reduce(
      (total, room) =>
        total + ((bookedHours[room?.name] || 0) / roomCapacity) * 100,
      0,
    ) / activeRooms.length
  );
};

const MeetingOperationalChartTitle = ({ chart, monthLabel }) => (
  <span
    className="inline-flex items-baseline gap-2 whitespace-nowrap text-[#1E3D73]"
  >
    <span
      aria-label="BIZ Nest"
      className="inline-flex items-baseline whitespace-nowrap normal-case leading-none text-[#2a2525]"
    >
      <span>BI</span>
      <span className="text-[#e33434]">Z</span>
      <span>&nbsp;Nest</span>
    </span>
    <span className="whitespace-nowrap">
      {chart.title}
      {monthLabel ? ` - ${monthLabel}` : ""}
    </span>
  </span>
);

const MeetingRoomOperationalCharts = ({ visibleCharts }) => {
  const axios = useAxiosPrivate();
  const currentTime = dayjs();
  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-meetings");
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-rooms");
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const { data: visitors = [] } = useQuery({
    queryKey: ["visitors"],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const navyTextStyle = {
    fontFamily: "Poppins-Regular",
    colors: "#1E3D73",
  };
  const guestMonths = useMemo(
    () =>
      Array.from({ length: 12 }, (_item, index) =>
        currentTime.subtract(11 - index, "month"),
      ),
    [currentTime],
  );
  const externalGuestSeries = useMemo(() => {
    const counts = new Map(
      guestMonths.map((month) => [month.format("MMM-YY"), 0]),
    );

    visitors.forEach((visitor) => {
      const visitDate = dayjs(
        visitor?.dateOfVisit || visitor?.date || visitor?.createdAt,
      );
      const monthKey = visitDate.format("MMM-YY");
      if (visitDate.isValid() && counts.has(monthKey)) {
        counts.set(monthKey, counts.get(monthKey) + 1);
      }
    });

    return [{ name: "External Guests", data: Array.from(counts.values()) }];
  }, [guestMonths, visitors]);
  const guestCategories = guestMonths.map((month) => month.format("MMM-YY"));
  const externalGuestOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Poppins-Regular" },
    colors: ["#19BFC5"],
    xaxis: {
      categories: guestCategories,
      labels: { style: { ...navyTextStyle, fontSize: "10px" } },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      title: { text: "Guest Count", style: { color: "#1E3D73" } },
      labels: { style: navyTextStyle },
    },
    plotOptions: {
      bar: { columnWidth: "65%", borderRadius: 5, dataLabels: { position: "top" } },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: { fontSize: "11px", colors: ["#1E3D73"] },
    },
    tooltip: { y: { formatter: (value) => `${value} Guests` } },
    grid: { borderColor: "#D8E1EE" },
  };
  const activeRooms = useMemo(
    () => rooms.filter((room) => room?.isActive !== false),
    [rooms],
  );
  const roomNames = useMemo(
    () => activeRooms.map((room) => room?.name).filter(Boolean).sort(),
    [activeRooms],
  );
  const averageOccupancySeries = useMemo(() => {
    const bookedHours = Object.fromEntries(roomNames.map((name) => [name, 0]));

    meetings.forEach((meeting) => {
      const meetingDate = dayjs(
        meeting?.date || meeting?.startDate || meeting?.startTime,
      );
      if (!meetingDate.isValid() || !meetingDate.isSame(currentTime, "month")) {
        return;
      }
      if (String(meeting?.meetingStatus || meeting?.status).toLowerCase() === "cancelled") {
        return;
      }

      const roomName = meeting?.roomName || meeting?.bookedRoom?.name;
      if (roomName in bookedHours) {
        bookedHours[roomName] += parseMeetingDurationMinutes(meeting) / 60;
      }
    });

    const capacity = 9 * countWorkingDays(currentTime.year(), currentTime.month());
    return [
      {
        name: "Average Occupancy",
        data: roomNames.map((roomName) => ({
          x: roomName,
          y: capacity > 0 ? (bookedHours[roomName] / capacity) * 100 : 0,
        })),
      },
    ];
  }, [currentTime, meetings, roomNames]);
  const averageRoomUtilisation = useMemo(
    () => calculateAverageRoomUtilisation(meetings, rooms, currentTime),
    [currentTime, meetings, rooms],
  );
  const averageOccupancyOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Poppins-Regular" },
    colors: ["#19BFC5"],
    xaxis: {
      categories: roomNames,
      labels: { rotate: -45, style: { ...navyTextStyle, fontSize: "10px" } },
    },
    yaxis: {
      min: 0,
      max: 100,
      title: { text: "Occupancy %", style: { color: "#1E3D73" } },
      labels: {
        formatter: (value) => `${Math.round(value)}%`,
        style: navyTextStyle,
      },
    },
    plotOptions: {
      bar: { columnWidth: "45%", borderRadius: 4, dataLabels: { position: "top" } },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => `${value.toFixed(0)}%`,
      offsetY: -20,
      style: { fontSize: "10px", colors: ["#1E3D73"] },
    },
    tooltip: { y: { formatter: (value) => `${value.toFixed(1)}% Occupancy` } },
    grid: { borderColor: "#D8E1EE" },
  };
  const roomAvailability = useMemo(
    () =>
      activeRooms.map((room) => {
        const unavailable = meetings.some((meeting) => {
          const roomName = meeting?.roomName || meeting?.bookedRoom?.name;
          const start = dayjs(meeting?.startTime);
          const end = dayjs(meeting?.extendTime || meeting?.endTime);
          const isCancelled =
            String(meeting?.meetingStatus || meeting?.status).toLowerCase() ===
            "cancelled";
          return (
            roomName === room?.name &&
            !isCancelled &&
            start.isValid() &&
            end.isValid() &&
            currentTime.isAfter(start) &&
            currentTime.isBefore(end)
          );
        });

        return { roomName: room?.name || "Room", unavailable };
      }),
    [activeRooms, currentTime, meetings],
  );
  const availabilityData = [
    {
      label: "Available",
      value: roomAvailability.filter((room) => !room.unavailable).length,
    },
    {
      label: "Unavailable",
      value: roomAvailability.filter((room) => room.unavailable).length,
    },
  ];
  const availabilityOptions = {
    chart: { type: "pie", fontFamily: "Poppins-Regular" },
    labels: availabilityData.map((item) => item.label),
    colors: ["#54C4A7", "#ff000080"],
    legend: { show: false },
    dataLabels: {
      enabled: true,
      formatter: (value) => `${value.toFixed(1)}%`,
      style: { fontSize: "13px", colors: ["#FFFFFF"] },
    },
    tooltip: { y: { formatter: (value) => `${value} Rooms` } },
  };
  const availabilityLegend = (
    <div className="flex max-h-[300px] min-w-[150px] flex-col gap-1 overflow-y-auto px-2 text-xs text-[#1E3D73]">
      {roomAvailability.map((room) => (
        <span key={room.roomName} className="inline-flex items-center gap-1">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: room.unavailable ? "#ff000080" : "#54C4A7",
            }}
          />
          {room.roomName}
        </span>
      ))}
    </div>
  );
  const heatmapData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const slots = Array.from({ length: 12 }, (_item, index) => {
      const startHour = 8 + index;
      const endHour = startHour + 1;
      const formatHour = (hour) => {
        const normalized = hour % 12 || 12;
        return `${normalized}${hour < 12 ? "AM" : "PM"}`;
      };
      return `${formatHour(startHour)}-${formatHour(endHour)}`;
    });
    const weekStart = currentTime.startOf("week");
    const matrix = slots.map(() => Array(7).fill(0));

    meetings.forEach((meeting) => {
      const start = dayjs(meeting?.startTime);
      const isCancelled =
        String(meeting?.meetingStatus || meeting?.status).toLowerCase() ===
        "cancelled";
      if (!start.isValid() || isCancelled || !start.isSame(weekStart, "week")) {
        return;
      }
      const slotIndex = start.hour() - 8;
      if (slotIndex >= 0 && slotIndex < slots.length) {
        matrix[slotIndex][start.day()] += 1;
      }
    });

    return slots.map((slot, slotIndex) => ({
      name: slot,
      data: days.map((day, dayIndex) => ({ x: day, y: matrix[slotIndex][dayIndex] })),
    }));
  }, [currentTime, meetings]);
  const heatmapOptions = {
    chart: { type: "heatmap", toolbar: { show: false }, fontFamily: "Poppins-Regular" },
    dataLabels: { enabled: false },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: "#E5E7EB", name: "No Bookings" },
            { from: 1, to: 5, color: "#D9F99D", name: "Low (1-5)" },
            { from: 6, to: 10, color: "#A3E635", name: "Moderate (6-10)" },
            { from: 11, to: 15, color: "#22C55E", name: "High (11-15)" },
            { from: 16, to: 999, color: "#059669", name: "Very High (16+)" },
          ],
        },
      },
    },
    xaxis: { labels: { style: navyTextStyle } },
    yaxis: { labels: { style: navyTextStyle } },
    legend: { labels: { colors: "#1E3D73" } },
    tooltip: {
      y: { formatter: (value) => (value ? `${value} Bookings` : "No Bookings") },
    },
  };
  const monthLabel = currentTime.format("MMMM").toUpperCase();

  return (
    <WidgetSection
      layout={visibleCharts.length > 1 ? 2 : 1}
      gridGap="gap-x-4 gap-y-4"
      padding
    >
      {visibleCharts.map((chartKey) => {
        const chart = operationalChartConfig[chartKey];
        const titleMonth = ["externalGuests", "averageOccupancy"].includes(
          chartKey,
        )
          ? monthLabel
          : null;

        return (
          <WidgetSection
            key={chartKey}
            title={
              <MeetingOperationalChartTitle
                chart={chart}
                monthLabel={titleMonth}
              />
            }
            border
            borderColor="#1E3D73"
            bodyBorderColor="#9FB2CF"
            titleClassName={
              chartKey === "averageOccupancy"
                ? "!text-lg min-[1700px]:!text-widgetTitle"
                : ""
            }
            headerContentClassName={
              chartKey === "averageOccupancy"
                ? "lg:!h-10 !gap-2"
                : "lg:!h-10"
            }
            headerRightContent={
              chartKey === "averageOccupancy" ? (
                <div className="flex items-center justify-center gap-0.5 rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-1.5 py-1 text-[10px] font-pmedium uppercase text-[#274784] min-[1700px]:gap-1.5 min-[1700px]:px-2.5 min-[1700px]:py-1.5 min-[1700px]:text-sm">
                  <span>Utilisation:</span>
                  <span>{averageRoomUtilisation.toFixed(1)}%</span>
                </div>
              ) : undefined
            }
          >
            {chartKey === "externalGuests" && (
              <BarGraph
                data={externalGuestSeries}
                options={externalGuestOptions}
                height={350}
                responsiveResize
              />
            )}
            {chartKey === "averageOccupancy" && (
              <BarGraph
                data={averageOccupancySeries}
                options={averageOccupancyOptions}
                height={350}
                responsiveResize
              />
            )}
            {chartKey === "availabilityStatus" && (
              roomAvailability.length > 0 ? (
                <div className="flex min-h-[365px] w-full flex-col items-center justify-center gap-3 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <PieChartMui
                      data={availabilityData}
                      options={availabilityOptions}
                      width={360}
                      height={350}
                      centerAlign
                    />
                  </div>
                  <div className="w-full shrink-0 sm:w-auto">
                    {availabilityLegend}
                  </div>
                </div>
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-[#1E3D73]">
                  No room data available
                </div>
              )
            )}
            {chartKey === "busyTimeWeek" && (
              <HeatMap data={heatmapData} options={heatmapOptions} height={350} />
            )}
          </WidgetSection>
        );
      })}
    </WidgetSection>
  );
};

const MeetingRoomOngoingUpcomingTable = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-meetings");
      return Array.isArray(response.data) ? response.data : [];
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const rows = useMemo(() => {
    const currentMonth = dayjs();

    return meetings
      .filter((meeting) => {
        const meetingType = String(meeting?.meetingType || "").toLowerCase();
        const status = String(meeting?.meetingStatus || meeting?.status || "");
        const meetingDate = dayjs(
          meeting?.date || meeting?.startDate || meeting?.startTime,
        );
        const isCurrentMonth =
          meetingDate.isValid() &&
          meetingDate.month() === currentMonth.month() &&
          meetingDate.year() === currentMonth.year();

        return (
          ["internal", "external"].includes(meetingType) &&
          ["Upcoming", "Ongoing"].includes(status) &&
          isCurrentMonth
        );
      })
      .sort((first, second) => {
        const firstStart = dayjs(first?.startTime).valueOf();
        const secondStart = dayjs(second?.startTime).valueOf();
        return firstStart - secondStart;
      })
      .map((meeting, index) => {
        const startTime = dayjs(meeting?.startTime);
        const endTime = dayjs(meeting?.extendTime || meeting?.endTime);
        const meetingDate = dayjs(
          meeting?.date || meeting?.startDate || meeting?.startTime,
        );
        const meetingType = String(meeting?.meetingType || "N/A");
        const meetingStatus = String(
          meeting?.meetingStatus || meeting?.status || "Upcoming",
        );

        return {
          id: meeting?._id || meeting?.id || index,
          serialNumber: index + 1,
          meetingType,
          roomName:
            meeting?.roomName || meeting?.bookedRoom?.name || "Not Assigned",
          date: meetingDate.isValid() ? meetingDate.format("DD-MMM-YYYY") : "—",
          startTime: startTime.isValid() ? startTime.format("hh:mm A") : "—",
          endTime: endTime.isValid() ? endTime.format("hh:mm A") : "—",
          hours:
            startTime.isValid() && endTime.isValid()
              ? Math.max(0, endTime.diff(startTime, "minute") / 60).toFixed(1)
              : "0.0",
          status: meetingStatus,
          housekeepingStatus:
            meeting?.housekeepingStatus || meeting?.bookedRoom?.housekeepingStatus,
          paymentStatus: meeting?.paymentStatus,
          paymentVerification: meeting?.paymentVerification,
          meeting,
          actionRoute:
            meetingType.toLowerCase() === "internal"
              ? "/app/dashboard/sales-dashboard/meeting-room/manage-bookings/internal-meetings"
              : "/app/dashboard/sales-dashboard/meeting-room/manage-bookings/external-clients",
        };
      });
  }, [meetings]);
  const meetingStatusCounts = useMemo(
    () =>
      rows.reduce(
        (counts, row) => {
          const status = String(row?.status || "").toLowerCase();

          if (status === "ongoing") counts.ongoing += 1;
          if (status === "upcoming") counts.upcoming += 1;

          return counts;
        },
        { ongoing: 0, upcoming: 0 },
      ),
    [rows],
  );
  const openManageMeeting = (row) => navigate(row.actionRoute);
  const getMeetingMenuItems = (row) => [
    { label: "Update", onClick: () => openManageMeeting(row) },
  ];
  const columns = [
    { field: "serialNumber", headerName: "Sr.No", width: 90 },
    { field: "meetingType", headerName: "Meeting Type", flex: 0.9 },
    { field: "roomName", headerName: "Room", flex: 1.1 },
    { field: "date", headerName: "Date", flex: 0.9 },
    { field: "startTime", headerName: "Start Time", flex: 0.8 },
    { field: "endTime", headerName: "End Time", flex: 0.8 },
    { field: "hours", headerName: "Hours", flex: 0.55 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "actions",
      headerName: "Action",
      width: 140,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <div className="flex h-full items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedMeeting(params.data)}
            aria-label={`View ${params.data?.meetingType || "meeting"} meeting`}
            title="View meeting"
            className="rounded-lg bg-[#eaf4ff] p-2 text-[#1E3D73]"
          >
            <MdOutlineRemoveRedEye size={18} aria-hidden="true" />
          </button>
          <ThreeDotMenu
            rowId={params.data?.id}
            menuItems={getMeetingMenuItems(params.data)}
            buttonSx={{
              color: "#1E3D73",
              backgroundColor: "#eaf4ff",
              borderRadius: 2,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <WidgetSection
        title={
        <Link
          to="/app/dashboard/sales-dashboard/meeting-room/ongoing-upcoming-meetings"
          className="inline-flex items-baseline gap-2 text-[#1E3D73]"
        >
          <span
            aria-label="BIZ Nest"
            className="inline-flex items-baseline whitespace-nowrap normal-case leading-none text-[#2a2525]"
          >
            <span>BI</span>
            <span className="text-[#e33434]">Z</span>
            <span>&nbsp;Nest</span>
          </span>
          <span>MEETING ROOM ONGOING & UPCOMING INTERNAL & EXTERNAL CLIENTS</span>
        </Link>
      }
      border
      normalCase
      borderColor="#1E3D73"
      bodyBorderColor="#9FB2CF"
      padding
      headerRightContent={
        <>
          <span className="rounded-lg border border-[#BBDEFB] bg-[#E3F2FD] px-3 py-1.5 text-sm font-pmedium uppercase text-[#1565C0]">
            Upcoming: {meetingStatusCounts.upcoming}
          </span>
          <span className="rounded-lg border border-[#FFCC80] bg-[#FFF3E0] px-3 py-1.5 text-sm font-pmedium uppercase text-[#E65100]">
            Ongoing: {meetingStatusCounts.ongoing}
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
        />
      </div>
      </WidgetSection>
      <MuiModal
        open={Boolean(selectedMeeting)}
        onClose={() => setSelectedMeeting(null)}
        title={`${selectedMeeting?.meetingType || "Meeting"} Meeting Details`}
        widthClass="w-[min(92vw,720px)]"
      >
        {selectedMeeting && (
          <div className="flex flex-col gap-4 text-[#1E3D73]">
            <div className="font-pmedium">Basic Info</div>
            <DetalisFormatted
              title="Title"
              detail={
                selectedMeeting.meeting?.title ||
                selectedMeeting.meeting?.subject ||
                "N/A"
              }
            />
            <DetalisFormatted
              title="Agenda"
              detail={selectedMeeting.meeting?.agenda || "N/A"}
            />
            <DetalisFormatted title="Date" detail={selectedMeeting.date} />
            <DetalisFormatted
              title="Time"
              detail={`${selectedMeeting.startTime} - ${selectedMeeting.endTime}`}
            />
            <DetalisFormatted
              title="Duration"
              detail={`${parseMeetingDurationMinutes(selectedMeeting.meeting)}min`}
            />
            <DetalisFormatted title="Status" detail={selectedMeeting.status} />
            <DetalisFormatted
              title="Type"
              detail={selectedMeeting.meetingType}
            />
            <DetalisFormatted
              title="Company"
              detail={getMeetingCompanyName(selectedMeeting.meeting)}
            />

            {selectedMeeting.meetingType.toLowerCase() === "internal" ? (
              <>
                <div className="mt-2 pt-4 font-pmedium">
                  People Involved
                </div>
                <DetalisFormatted
                  title="Participants"
                  detail={getMeetingParticipants(
                    selectedMeeting.meeting?.participants,
                  )}
                />
                <DetalisFormatted
                  title="Booked By"
                  detail={getMeetingPersonName(
                    selectedMeeting.meeting?.bookedBy ||
                      selectedMeeting.meeting?.clientBookedBy,
                  )}
                />
                <DetalisFormatted
                  title="Receptionist"
                  detail={getMeetingPersonName(
                    selectedMeeting.meeting?.receptionist ||
                      selectedMeeting.meeting?.meetingReceptionist,
                  )}
                />
                <DetalisFormatted
                  title="Department"
                  detail={getMeetingDepartmentName(
                    selectedMeeting.meeting?.department ||
                      selectedMeeting.meeting?.bookedBy?.department,
                  )}
                />
                <DetalisFormatted
                  title="Company"
                  detail={getMeetingCompanyName(selectedMeeting.meeting)}
                />
              </>
            ) : (
              <>
                <DetalisFormatted
                  title="Booked By"
                  detail={getMeetingPersonName(
                    selectedMeeting.meeting?.bookedBy ||
                      selectedMeeting.meeting?.clientBookedBy,
                  )}
                />
                <DetalisFormatted
                  title="Receptionist"
                  detail={getMeetingPersonName(
                    selectedMeeting.meeting?.receptionist ||
                      selectedMeeting.meeting?.meetingReceptionist,
                  )}
                />
                <DetalisFormatted
                  title="Client"
                  detail={getMeetingCompanyName(selectedMeeting.meeting)}
                />
              </>
            )}

            <div className="mt-2 pt-4 font-pmedium">
              Venue Details
            </div>
            <DetalisFormatted title="Room" detail={selectedMeeting.roomName} />
            <DetalisFormatted
              title="Location"
              detail={
                selectedMeeting.meeting?.location?.unitNo ||
                selectedMeeting.meeting?.location?.unitName
                  ? `${selectedMeeting.meeting?.location?.unitNo || "N/A"} (${selectedMeeting.meeting?.location?.unitName || "N/A"})`
                  : selectedMeeting.meeting?.bookedRoom?.location?.unitNo ||
                      selectedMeeting.meeting?.bookedRoom?.location?.unitName
                    ? `${selectedMeeting.meeting?.bookedRoom?.location?.unitNo || "N/A"} (${selectedMeeting.meeting?.bookedRoom?.location?.unitName || "N/A"})`
                    : "N/A"
              }
            />
            <DetalisFormatted
              title="Building"
              detail={
                selectedMeeting.meeting?.location?.building?.buildingName ||
                selectedMeeting.meeting?.bookedRoom?.location?.building
                  ?.buildingName ||
                "N/A"
              }
            />
            <DetalisFormatted
              title="Housekeeping Status"
              detail={selectedMeeting.housekeepingStatus || "N/A"}
            />

            {selectedMeeting.meetingType.toLowerCase() === "external" && (
              <>
                <div className="mt-2 pt-4 font-pmedium">
                  Payment Details
                </div>
                <DetalisFormatted
                  title="Discount"
                  detail={formatMeetingCurrency(
                    selectedMeeting.meeting?.discountAmount ??
                      selectedMeeting.meeting?.paymentDiscountAmount ??
                      selectedMeeting.meeting?.paymnetDiscountAmount,
                  )}
                />
                <DetalisFormatted
                  title="Taxable Amount"
                  detail={formatMeetingCurrency(
                    selectedMeeting.meeting?.paymentBaseAmount ??
                      selectedMeeting.meeting?.taxableAmount ??
                      Math.max(
                        Number(selectedMeeting.meeting?.paymentAmount || 0) -
                          Number(
                            selectedMeeting.meeting?.paymentGstAmount ??
                              selectedMeeting.meeting?.gstAmount ??
                              0,
                          ),
                        0,
                      ),
                  )}
                />
                <DetalisFormatted
                  title="GST Amount"
                  detail={formatMeetingCurrency(
                    selectedMeeting.meeting?.paymentGstAmount ??
                      selectedMeeting.meeting?.gstAmount,
                  )}
                />
                <DetalisFormatted
                  title="Total Amount"
                  detail={formatMeetingCurrency(
                    selectedMeeting.meeting?.paymentAmount ??
                      selectedMeeting.meeting?.totalAmount,
                  )}
                />
                <DetalisFormatted
                  title="Status"
                  detail={getMeetingPaymentStatus(
                    selectedMeeting.meeting?.paymentStatus,
                  )}
                />
                <DetalisFormatted
                  title="Payment Mode"
                  detail={selectedMeeting.meeting?.paymentMode || "N/A"}
                />
                <DetalisFormatted
                  title="Payment Verification"
                  detail={selectedMeeting.paymentVerification || "Pending"}
                />
              </>
            )}
          </div>
        )}
      </MuiModal>
    </>
  );
};

const MeetingRoomDashboard = ({
  uniqueClientsOnly = false,
  meetingChartView = null,
  operationalChartView = null,
  meetingsTableOnly = false,
}) => {
  const { hasPermission } = useUserPermissions();
  const navigate = useNavigate();
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [activeMenuCard, setActiveMenuCard] = useState(null);
  const [activeUniqueClientCount, setActiveUniqueClientCount] = useState(0);

  const menuCards = [
    {
      title: "Book a Meeting Room",
      icon: MdAdd,
      permission: PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_BOOK_CARD.value,
      items: [
        {
          label: "Book a Meeting Room",
          description: "Create a new meeting room booking",
          icon: FiCalendar,
          route: "/app/dashboard/sales-dashboard/meeting-room/book-meeting",
        },
      ],
    },
    {
      title: "Manage Bookings",
      icon: MdEdit,
      permission:
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_MANAGE_BOOKINGS_CARD.value,
      items: [
        {
          label: "Internal Meetings",
          description: "View and manage internal meetings",
          icon: FiUsers,
          route:
            "/app/dashboard/sales-dashboard/meeting-room/manage-bookings/internal-meetings",
        },
        {
          label: "External Clients",
          description: "View and manage external client bookings",
          icon: FiUserPlus,
          route:
            "/app/dashboard/sales-dashboard/meeting-room/manage-bookings/external-clients",
        },
      ],
    },
    {
      title: "Room Calendar",
      icon: MdCalendarMonth,
      permission: PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_CALENDAR_CARD.value,
      items: [
        {
          label: "Room Calendar",
          description: "View meeting room availability",
          icon: FiCalendar,
          route: "/app/dashboard/sales-dashboard/meeting-room/calendar",
        },
      ],
    },
    {
      title: "Mix Bag",
      icon: MdShoppingBag,
      permission: PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_MIX_BAG_CARD.value,
      items: [],
    },
    {
      title: "Data",
      icon: SiGoogleadsense,
      permission: PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_DATA_CARD.value,
      items: [
        {
          label: "Client Credit",
          description: "View meeting client credit data",
          icon: FiCreditCard,
          route:
            "/app/dashboard/sales-dashboard/meeting-room/data/client-credit",
        },
        {
          label: "Client Review",
          description: "View meeting client reviews",
          icon: FiCheckCircle,
          route:
            "/app/dashboard/sales-dashboard/meeting-room/data/client-review",
        },
      ],
    },
    {
      title: "Reports",
      icon: TbMessageReportFilled,
      permission: PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_REPORTS_CARD.value,
      items: [
        {
          label: "Reports",
          description: "Open meeting room reports",
          icon: MdBarChart,
          route: "/app/dashboard/sales-dashboard/meeting-room/reports",
        },
      ],
    },
    {
      title: "Settings",
      icon: FaGears,
      items: [
        {
          label: "Settings",
          description: "Configure meeting room settings",
          icon: FiSettings,
          route: "/app/dashboard/sales-dashboard/meeting-room/setting",
        },
      ],
    },
  ].filter((card) => !card.permission || hasPermission(card.permission));
  const resolvedActiveMenuCard =
    menuCards.find((card) => card.title === activeMenuCard) || menuCards[0];

  if (uniqueClientsOnly) {
    return (
      <div className="p-3 pt-3">
        <MeetingRoomUniqueClientsGraph />
      </div>
    );
  }

  if (meetingChartView) {
    return (
      <div className="p-3 pt-3">
        <MeetingRoomClientCharts visibleCharts={[meetingChartView]} />
      </div>
    );
  }

  if (operationalChartView) {
    return (
      <div className="p-3 pt-3">
        <MeetingRoomOperationalCharts
          visibleCharts={[operationalChartView]}
        />
      </div>
    );
  }

  if (meetingsTableOnly) {
    return (
      <div className="p-3 pt-3">
        <MeetingRoomOngoingUpcomingTable />
      </div>
    );
  }

  const meetingChartPermissions = {
    internalCommitmentUtilization:
      PERMISSIONS
        .SALES_VERTICAL_MEETING_ROOM_INTERNAL_COMMITMENT_UTILIZATION_GRAPH
        .value,
    internalExternalBookings:
      PERMISSIONS
        .SALES_VERTICAL_MEETING_ROOM_INTERNAL_EXTERNAL_BOOKINGS_GRAPH.value,
    bookedHoursCancelled:
      PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_BOOKED_HOURS_CANCELLED_GRAPH
        .value,
    meetingDurationBreakdown:
      PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_MEETING_DURATION_BREAKDOWN_GRAPH
        .value,
  };
  const visibleMeetingCharts = [
    "internalExternalBookings",
    "internalCommitmentUtilization",
    "bookedHoursCancelled",
    "meetingDurationBreakdown",
  ].filter((chart) => hasPermission(meetingChartPermissions[chart]));
  const operationalChartPermissions = {
    externalGuests:
      PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_EXTERNAL_GUESTS_GRAPH.value,
    averageOccupancy:
      PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_AVERAGE_OCCUPANCY_GRAPH.value,
    availabilityStatus:
      PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_AVAILABILITY_STATUS_GRAPH.value,
    busyTimeWeek:
      PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_BUSY_TIME_WEEK_GRAPH.value,
  };
  const visibleOperationalCharts = [
    "externalGuests",
    "averageOccupancy",
    "availabilityStatus",
    "busyTimeWeek",
  ].filter((chart) => hasPermission(operationalChartPermissions[chart]));
  const canViewOngoingUpcomingTable = hasPermission(
    PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_ONGOING_UPCOMING_TABLE.value,
  );

  return (
    <div className="flex flex-col gap-4 p-3 pt-3">
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={() => setSettingsAnchor(null)}
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
        <div className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)]">
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
                    <Icon />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    {card.title}
                  </span>
                  <FiChevronRight className="shrink-0" size={17} />
                </button>
              );
            })}
          </div>
          <div className="relative min-h-[260px] p-4 sm:p-5">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setSettingsAnchor(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[#1E3D73] transition hover:bg-[#e8f1ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8d2f5]"
            >
              <FiX size={19} aria-hidden="true" />
            </button>
            {resolvedActiveMenuCard && (() => {
              const ActiveIcon = resolvedActiveMenuCard.icon;
              return (
                <>
                  <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#f4f8ff] p-3 pr-10">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e3efff] text-xl text-[#1E3D73]">
                      <ActiveIcon />
                    </span>
                    <div>
                      <p className="font-psemibold text-base text-[#1E3D73]">
                        {resolvedActiveMenuCard.title}
                      </p>
                      <p className="text-xs text-[#7084a4]">
                        Open meeting room module
                      </p>
                    </div>
                  </div>
                  <div className="max-h-[340px] divide-y divide-[#edf1f7] overflow-y-auto pr-1">
                    {resolvedActiveMenuCard.items.length === 0 && (
                      <p className="px-2 py-6 text-center text-sm text-[#7b8eac]">
                        No sub-modules available
                      </p>
                    )}
                    {resolvedActiveMenuCard.items.map((item) => {
                      const ItemIcon = item.icon || ActiveIcon;

                      return (
                        <button
                          key={item.route}
                          type="button"
                          onClick={() => {
                            setSettingsAnchor(null);
                            navigate(item.route);
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-[#294a7d] hover:bg-[#f7faff]"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#1E3D73]">
                            <ItemIcon />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-pmedium text-[15px] leading-tight">
                              {item.label}
                            </span>
                            <span className="mt-1 block text-xs leading-tight text-[#7b8eac]">
                              {item.description}
                            </span>
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
      </Menu>
      <div className="overflow-hidden rounded-lg">
        <div className="relative h-56 w-full md:h-[17rem] xl:h-[19rem]">
          <img
            src={meetingRoomBanner}
            alt="Meeting Room dashboard banner"
            className="h-full w-full object-cover"
            style={{ objectPosition: "center 58%" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[61%] bg-white/95"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, black 0%, black 84%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, black 0%, black 84%, transparent 100%)",
            }}
          />
          <div className="absolute inset-y-0 left-0 flex w-[55%] flex-col py-4 sm:py-6">
            <p className="font-pregular text-xs uppercase tracking-[0.02em] text-[#1E3D73] sm:text-base lg:text-[15px] min-[1700px]:text-base min-[1900px]:text-lg">
              Meeting Room Dashboard
            </p>
            <h1 className="mt-6 max-w-full whitespace-nowrap font-serif text-3xl font-semibold leading-[0.9] text-[#1E3D73] drop-shadow-sm sm:mt-10 sm:text-5xl lg:origin-left lg:scale-x-90 lg:text-[38px] xl:text-[42px] min-[1700px]:text-[46px] min-[1900px]:scale-x-100 min-[1900px]:text-[50px]">
              MEETING ROOM <span className="text-[#E64B4B]">DASHBOARD</span>
            </h1>
            <p className="mt-5 max-w-full font-pmedium text-xl leading-[0.94] text-[#1E3D73] sm:mt-8 sm:text-3xl md:whitespace-nowrap lg:text-[35px] min-[1700px]:text-[39px] min-[1900px]:text-[46px]">
              Meeting Room Customers
            </p>
          </div>
          <nav
            aria-label="Meeting Room dashboard navigation"
            className="absolute bottom-0 left-0 z-10 flex w-fit max-w-[61%] items-end gap-6 overflow-x-auto px-3 sm:gap-8 sm:px-4 lg:gap-10"
          >
            {["Annual KPA", "KRA", "Handbook", "Performance Summary"].map(
              (item) => (
                <Link
                  key={item}
                  to=""
                  className="group relative inline-flex shrink-0 items-center pb-0 pt-6 font-pmedium text-xs text-[#1E3D73] sm:text-sm lg:text-base"
                >
                  {item}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#E64B4B] transition-transform duration-200 group-hover:scale-x-100" />
                </Link>
              ),
            )}
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={Boolean(settingsAnchor)}
              onClick={(event) => setSettingsAnchor(event.currentTarget)}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#C8DCFA] bg-[#EEF5FF] px-3 py-2 font-pmedium text-xs text-[#123B82] shadow-sm focus-visible:outline-none sm:text-sm"
            >
              <FiGrid className="text-lg sm:text-xl" aria-hidden="true" />
              <span>Menu</span>
              <MdKeyboardArrowDown className="text-lg" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
      <MeetingRoomSummaryCards
        hasPermission={hasPermission}
        activeUniqueClientCount={activeUniqueClientCount}
      />
      {hasPermission(
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_REVENUES_GRAPH.value,
      ) && (
        <MeetingRevenue graphOnly dashboardView />
      )}
      {hasPermission(
        PERMISSIONS.SALES_VERTICAL_MEETING_ROOM_UNIQUE_CLIENT_COUNT_GRAPH.value,
      ) && (
        <MeetingRoomUniqueClientsGraph
          onUniqueClientCountChange={setActiveUniqueClientCount}
        />
      )}
      {visibleMeetingCharts.length > 0 && (
        <MeetingRoomClientCharts visibleCharts={visibleMeetingCharts} />
      )}
      {visibleOperationalCharts.length > 0 && (
        <MeetingRoomOperationalCharts
          visibleCharts={visibleOperationalCharts}
        />
      )}
      {canViewOngoingUpcomingTable && <MeetingRoomOngoingUpcomingTable />}
    </div>
  );
};

export default MeetingRoomDashboard;
