import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  IoMdNotifications,
  IoMdNotificationsOutline,
} from "react-icons/io";
import { IoCheckmarkDoneSharp, IoCheckmarkOutline } from "react-icons/io5";
import {
  FaBell,
  FaBullseye,
  FaCalendarAlt,
  FaChartBar,
  FaCheckCircle,
  FaChevronDown,
  FaFileAlt,
  FaFilter,
  FaTicketAlt,
  FaUserFriends,
} from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { queryClient } from "../main";

const MODULE_STYLES = [
  {
    test: /meeting|calendar/i,
    Icon: FaCalendarAlt,
    color: "text-[#31598F]",
    bg: "bg-[#EEF4FB]",
  },
  {
    test: /ticket|issue/i,
    Icon: FaTicketAlt,
    color: "text-[#31598F]",
    bg: "bg-[#EEF4FB]",
  },
  {
    test: /asset|inventory/i,
    Icon: FaUserFriends,
    color: "text-[#31598F]",
    bg: "bg-[#EEF4FB]",
  },
  {
    test: /kra|kpi|report/i,
    Icon: FaChartBar,
    color: "text-[#31598F]",
    bg: "bg-[#EEF4FB]",
  },
  {
    test: /performance|review|target/i,
    Icon: FaBullseye,
    color: "text-[#31598F]",
    bg: "bg-[#EEF4FB]",
  },
  {
    test: /policy|document|notice/i,
    Icon: FaFileAlt,
    color: "text-[#31598F]",
    bg: "bg-[#EEF4FB]",
  },
  {
    test: /task|approval|resolved|added/i,
    Icon: FaCheckCircle,
    color: "text-[#31598F]",
    bg: "bg-[#EEF4FB]",
  },
];

const DEFAULT_STYLE = {
  Icon: FaBell,
  color: "text-[#31598F]",
  bg: "bg-[#EEF4FB]",
};

const SECTIONS = ["Today", "Yesterday", "This Week", "Earlier"];

const MODULE_ROUTES = {
  assets: "/app/assets/view-assets",
  finance:
    "/app/dashboard/finance-dashboard/billing/budget-request/pending-approvals-budget",
  logs: "/app/logs",
  meetings: "/app/meetings/manage-meetings/internal-meetings",
  performance: "/app/kra-kpa/departments",
  tasks: "/app/tasks/department-tasks",
  tickets: "/app/tickets/manage-tickets",
  visitors: "/app/visitors/manage-visitors/internal-visitors",
};

const getModuleRoute = (moduleName = "") => {
  const normalizedModule = moduleName.trim().toLowerCase();
  if (normalizedModule === "ticket") return MODULE_ROUTES.tickets;
  if (normalizedModule === "meeting") return MODULE_ROUTES.meetings;
  if (normalizedModule === "task") return MODULE_ROUTES.tasks;
  if (normalizedModule === "visitor") return MODULE_ROUTES.visitors;
  if (["kra/kpa", "kra & kpa", "kra-kpa"].includes(normalizedModule)) {
    return MODULE_ROUTES.performance;
  }
  if (normalizedModule === "budget") return MODULE_ROUTES.finance;
  return MODULE_ROUTES[normalizedModule] || null;
};

const startOfToday = () => dayjs().startOf("day");

const getSection = (date) => {
  const value = dayjs(date);
  if (!value.isValid()) return "Earlier";

  const today = startOfToday();
  if (value.isAfter(today)) return "Today";
  if (value.isAfter(today.subtract(1, "day"))) return "Yesterday";
  if (value.isAfter(today.subtract(7, "day"))) return "This Week";
  return "Earlier";
};

const formatTimestamp = (date) => {
  const value = dayjs(date);
  const section = getSection(date);
  if (section === "Today") return value.format("hh:mm A");
  if (section === "Yesterday") return `Yesterday, ${value.format("hh:mm A")}`;
  if (section === "This Week") return value.format("ddd, hh:mm A");
  return value.format("D MMM, hh:mm A");
};

const getStyle = (notification) => {
  const haystack = `${notification.module || ""} ${notification.type || ""}`;
  return MODULE_STYLES.find((style) => style.test.test(haystack)) || DEFAULT_STYLE;
};

const Notifications = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  const updateIndicator = useCallback(() => {
    const node = tabRefs.current[activeTab];
    if (!node) return;
    setIndicator({
      left: node.offsetLeft,
      top: node.offsetTop,
      width: node.offsetWidth,
      height: node.offsetHeight,
    });
  }, [activeTab]);

  useEffect(() => {
    if (!isFilterOpen) return undefined;
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  useEffect(() => {
    const frame = requestAnimationFrame(updateIndicator);
    window.addEventListener("resize", updateIndicator);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  const {
    data: notifications = [],
    isLoading: isNotificationsLoading,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axios.get("/api/notifications/get-my-notifications");
      return res.data;
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });

  const { mutate: markAsRead, isPending: isMarkingRead } = useMutation({
    mutationFn: async (notificationId) => {
      const res = await axios.patch(
        `/api/notifications/mark-as-read/${notificationId}`
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(data?.message || "Notification marked as read");
    },
    onError: (error) => {
      toast.error(error?.message || "Could not mark notification as read");
    },
  });

  const { mutate: markAllRead, isPending: isMarkingAllRead } = useMutation({
    mutationFn: async () => {
      const res = await axios.patch("/api/notifications/mark-all-read");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      toast.error(error?.message || "Could not mark all notifications as read");
    },
  });

  const myEntry = (notification) =>
    (notification.users || []).find(
      (entry) =>
        String(entry.userActions?.whichUser?._id || entry.userActions?.whichUser) ===
        String(auth?.user?._id)
    );

  const isUnread = (notification) =>
    myEntry(notification)?.userActions?.hasRead === false;

  const unreadCount = useMemo(
    () => notifications.filter((notification) => isUnread(notification)).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notifications, auth?.user?._id]
  );

  const readCount = notifications.length - unreadCount;

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator, unreadCount, readCount]);

  const categories = useMemo(() => {
    const names = new Set();
    notifications.forEach((notification) => {
      const name = (notification.module || "").trim();
      if (name) names.add(name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [notifications]);

  const visibleNotifications = useMemo(() => {
    const byModule =
      moduleFilter === "all"
        ? notifications
        : notifications.filter(
            (notification) => (notification.module || "") === moduleFilter
          );
    if (activeTab === "unread") {
      return byModule.filter((notification) => isUnread(notification));
    }
    if (activeTab === "read") {
      return byModule.filter((notification) => !isUnread(notification));
    }
    return byModule;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, activeTab, moduleFilter, auth?.user?._id]);

  const grouped = useMemo(() => {
    const groups = {};
    SECTIONS.forEach((section) => {
      groups[section] = [];
    });
    visibleNotifications.forEach((notification) => {
      groups[getSection(notification.createdAt)].push(notification);
    });
    return groups;
  }, [visibleNotifications]);

  const tabs = [
    { key: "all", label: "All Notifications" },
    { key: "unread", label: `Unread (${unreadCount})` },
    { key: "read", label: `Read (${readCount})` },
  ];

  return (
    <div className="w-full p-4 md:p-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#edf4ff] via-[#f7faff] to-[#e8f4fc] py-8 pl-6 pr-6 md:py-10 md:pr-10">
        <svg
          aria-hidden="true"
          viewBox="0 0 1380 160"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-[0.3] sm:block"
        >
          <path d="M0 90 Q110 30 220 50 T440 20 T660 52 T880 18 T1100 50 T1380 0 V160 H0Z" fill="#d5eafa" />
          <path d="M0 125 Q120 80 240 100 T480 70 T720 105 T960 72 T1200 100 T1380 80 V160 H0Z" fill="#b9dced" />
          <path d="M90 126 Q230 110 370 120 T650 112 T930 122 T1210 112 T1380 120 M150 145 Q300 133 450 144 T750 136 T1050 145 T1380 136" fill="none" stroke="#f7fcff" strokeWidth="5" />
          <path d="M220 114 L270 82 L320 101 L370 72 L430 100 V116 H220Z M680 114 L730 82 L780 101 L830 72 L890 100 V116 H680Z M1120 114 L1170 82 L1220 101 L1270 72 L1330 100 V116 H1120Z" fill="#9dbdcb" />
        </svg>
        <div className="relative flex items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-pbold tracking-tight text-[#163b73] md:text-4xl">
              Notifications
            </h1>
            <p className="mt-5 font-pbold text-base tracking-tight text-[#5b606c] md:text-xl">
              Stay Updated with Important Alerts and Activities.
            </p>
          </div>
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 shadow-lg shadow-amber-400/40 ring-4 ring-white/60 md:h-24 md:w-24">
              <IoMdNotifications size={44} className="text-white" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-8 min-w-8 items-center justify-center rounded-full bg-[#e5484d] px-1.5 text-sm font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs + mark all */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-1 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative flex flex-wrap items-center gap-2 md:gap-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute rounded-xl bg-[#1E3D73] shadow-sm shadow-[#1E3D73]/30 transition-all duration-300 ease-out"
            style={{
              left: indicator.left,
              top: indicator.top,
              width: indicator.width,
              height: indicator.height,
              opacity: indicator.width ? 1 : 0,
            }}
          />
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                ref={(node) => {
                  tabRefs.current[tab.key] = node;
                }}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative z-10 whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-medium transition-colors md:text-base ${
                  isActive
                    ? "text-white"
                    : "text-[#1E3D73] hover:bg-[#eaf2ff]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={isFilterOpen}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-[#1E3D73] transition-colors hover:bg-[#eaf2ff] md:text-base"
            >
              <FaFilter size={14} className="shrink-0" />
              {moduleFilter === "all" ? "All Categories" : moduleFilter}
              <FaChevronDown
                size={12}
                className={`shrink-0 transition-transform ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isFilterOpen && (
              <div className="absolute left-0 top-full z-30 mt-2 max-h-64 w-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setModuleFilter("all");
                    setIsFilterOpen(false);
                  }}
                  className={`flex w-full items-center px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-[#eaf2ff] hover:text-[#1E3D73] ${
                    moduleFilter === "all"
                      ? "bg-[#eaf2ff] text-[#1E3D73]"
                      : "text-slate-600"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setModuleFilter(category);
                      setIsFilterOpen(false);
                    }}
                    className={`flex w-full items-center px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-[#eaf2ff] hover:text-[#1E3D73] ${
                      moduleFilter === category
                        ? "bg-[#eaf2ff] text-[#1E3D73]"
                        : "text-slate-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => markAllRead()}
          disabled={unreadCount === 0 || isMarkingAllRead}
          className="inline-flex items-center justify-center gap-2 self-center rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-[#3b45c4] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
        >
          <IoCheckmarkDoneSharp size={18} />
          {isMarkingAllRead ? "Marking..." : "Mark All as Read"}
        </button>
      </div>
      <div className="mt-5 border-b border-slate-200" />

      {/* Timeline */}
      <div className="mt-6">
        {isNotificationsLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-500">
            Loading notifications...
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <IoMdNotificationsOutline size={36} className="text-slate-300" />
            <p className="text-sm text-slate-500">
              {moduleFilter !== "all"
                ? "No notifications in this category."
                : activeTab === "unread"
                ? "You are all caught up. No unread notifications."
                : activeTab === "read"
                ? "No read notifications yet."
                : "No notifications yet."}
            </p>
          </div>
        ) : (
          SECTIONS.filter((section) => grouped[section].length > 0).map(
            (section) => (
              <div key={section} className="mb-6">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt size={18} className="text-[#31598F]" />
                  <h2 className="text-xl font-pbold tracking-tight text-[#1E3D73]">{section}</h2>
                </div>

                <div className="relative mt-4 pl-9">
                  <div className="absolute bottom-4 left-[17px] top-2 w-px bg-slate-200" />
                  {grouped[section].map((notification) => {
                    const unread = isUnread(notification);
                    const { Icon, color, bg } = getStyle(notification);
                    const moduleRoute = getModuleRoute(notification.module);
                    return (
                      <div key={notification._id} className="relative mb-3">
                        <span
                          className={`absolute -left-[25px] top-6 h-3 w-3 rounded-full border-2 ${
                            unread
                              ? "border-[#3b45c4] bg-[#3b45c4]"
                              : "border-slate-300 bg-slate-200"
                          }`}
                        />
                        <div
                          className={`flex flex-col gap-3 rounded-xl border bg-white px-4 py-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between ${
                            unread
                              ? "border-[#dfe3f7] shadow-[0_2px_10px_rgba(30,61,115,0.06)]"
                              : "border-slate-200"
                          }`}
                        >
                          <div className="flex min-w-0 items-start gap-4">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}
                            >
                              <Icon size={20} className={color} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[15px] font-pbold tracking-tight text-slate-900">
                                {notification.module || "Notification"}
                              </p>
                              <p className="mt-1 break-words text-sm text-slate-600">
                                {notification.message}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center justify-between gap-4 pl-[60px] sm:justify-end sm:pl-0">
                            <span className="whitespace-nowrap text-sm font-medium text-slate-500">
                              {formatTimestamp(notification.createdAt)}
                            </span>
                            {unread ? (
                              <button
                                type="button"
                                onClick={() => markAsRead(notification._id)}
                                disabled={isMarkingRead}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d5daf5] bg-[#eef1fe] text-[#3b45c4] transition-colors hover:bg-[#e2e7fd] disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label="Mark notification as read"
                                title="Mark as read"
                              >
                                <IoCheckmarkOutline size={20} />
                              </button>
                            ) : (
                              <span
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600"
                                aria-label="Notification read"
                                title="Read"
                              >
                                <IoCheckmarkDoneSharp size={20} />
                              </span>
                            )}
                            {moduleRoute && (
                              <button
                                type="button"
                                onClick={() => navigate(moduleRoute)}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d5daf5] bg-white text-[#1E3D73] transition-colors hover:bg-[#eaf2ff]"
                                aria-label={`Go to ${notification.module} module`}
                                title={`Go to ${notification.module} module`}
                              >
                                <FiExternalLink size={17} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

export default Notifications;
