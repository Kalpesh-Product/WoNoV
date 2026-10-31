import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowForward, IoIosSearch, IoMdClose } from "react-icons/io";
import { MdOutlineInsertDriveFile } from "react-icons/md";
import useAuth from "../hooks/useAuth";
import { PERMISSIONS } from "../constants/permissions";

const PALETTE_CONFIG = {
  hr: {
    label: "HR",
    root: "/app/dashboard/HR-dashboard",
    excludedRoutes: new Set([
      "/app/dashboard/hr-dashboard/finance/payroll",
    ]),
  },
  finance: {
    label: "Finance",
    root: "/app/dashboard/finance-dashboard",
    excludedRoutes: new Set(),
  },
  sales: {
    label: "Sales",
    root: "/app/dashboard/sales-dashboard",
    excludedRoutes: new Set(),
  },
  frontend: {
    label: "Frontend",
    root: "/app/dashboard/frontend-dashboard",
    excludedRoutes: new Set(),
  },
  admin: {
    label: "Administration",
    root: "/app/dashboard/admin-dashboard",
    excludedRoutes: new Set(),
  },
  maintenance: {
    label: "Maintenance",
    root: "/app/dashboard/maintenance-dashboard",
    excludedRoutes: new Set(),
  },
  it: {
    label: "IT",
    root: "/app/dashboard/IT-dashboard",
    excludedRoutes: new Set(),
  },
  legal: {
    label: "Legal",
    root: "/app/dashboard/legal-dashboard",
    excludedRoutes: new Set(),
  },
  cafe: {
    label: "Cafe",
    root: "/app/dashboard/cafe-dashboard",
    excludedRoutes: new Set(),
  },
};
const APP_MODULE_CONFIG = {
  assets: {
    label: "Assets",
    root: "/app/assets",
    permission: PERMISSIONS.SIDEBAR_ASSETS.value,
  },
  tickets: {
    label: "Tickets",
    root: "/app/tickets",
    permission: PERMISSIONS.SIDEBAR_TICKETS.value,
  },
  meetings: {
    label: "Meetings",
    root: "/app/meetings",
    permission: PERMISSIONS.SIDEBAR_MEETINGS.value,
  },
  tasks: {
    label: "Tasks",
    root: "/app/tasks",
    permission: PERMISSIONS.SIDEBAR_TASKS.value,
  },
  performance: {
    label: "Performance",
    root: "/app/performance",
    permission: PERMISSIONS.SIDEBAR_PERFORMANCE.value,
  },
  kraKpa: {
    label: "KRA & KPA",
    root: "/app/kra-kpa",
    permission: PERMISSIONS.KRAKPA_MODULE_ACCESS.value,
  },
  visitors: {
    label: "Visitors",
    root: "/app/visitors",
    permission: PERMISSIONS.SIDEBAR_VISITORS.value,
  },
  reports: {
    label: "Reports",
    root: "/app/reports",
    permission: PERMISSIONS.SIDEBAR_REPORTS.value,
  },
  printouts: {
    label: "Printout",
    root: "/app/printouts",
    permission: PERMISSIONS.SIDEBAR_PRINTOUTS.value,
  },
  calendar: {
    label: "Calendar",
    root: "/app/calendar",
    permission: PERMISSIONS.SIDEBAR_CALENDAR.value,
  },
  access: {
    label: "Access",
    root: "/app/access",
    permission: PERMISSIONS.SIDEBAR_ACCESS.value,
  },
  notifications: {
    label: "Notifications",
    root: "/app/notifications",
    permission: PERMISSIONS.SIDEBAR_NOTIFICATIONS.value,
  },
  profile: {
    label: "Account Profile",
    root: "/app/profile/my-profile",
    routePrefix: "/app/profile",
    permission: PERMISSIONS.SIDEBAR_PROFILE.value,
  },
  logs: {
    label: "Logs",
    root: "/app/secret-logs",
    permission: PERMISSIONS.SIDEBAR_LOGS.value,
  },
};
const APP_ROUTE_OVERRIDES = {
  "/app/tickets/settings": "/app/tickets/ticket-settings",
  "/app/meetings/manage-meetings/external-meetings":
    "/app/meetings/manage-meetings/external-clients",
  "/app/kra-kpa/department-kpa/member-wise-kpa/individual-monthly-kpa":
    "/app/kra-kpa/individual/kra-kpa/individual-Monthly-KPA",
  "/app/kra-kpa/department-kpa/member-wise-kpa/self-kra":
    "/app/kra-kpa/individual/kra-kpa/self-KRA",
  "/app/profile/hr": "/app/profile/HR/attendance",
  "/app/profile/assets": "/app/profile/my-assets",
};
const ACRONYMS = new Set(["HR", "KPA", "KRA", "SOP", "SOPS"]);
const RECENT_HISTORY_LIMIT = 3;
const RECENT_HISTORY_KEY_PREFIX = "wono:global-palette:recent:";

const readRecentHistory = (storageKey) => {
  if (!storageKey) return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    return Array.isArray(stored)
      ? [...new Set(stored.filter((route) => typeof route === "string"))]
        .slice(0, RECENT_HISTORY_LIMIT)
      : [];
  } catch {
    return [];
  }
};

const writeRecentHistory = (storageKey, routes) => {
  if (!storageKey) return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(routes));
  } catch {
    // Search navigation still works if browser storage is unavailable.
  }
};

const getMatchRank = (destination, query) => {
  const title = destination.title.toLowerCase();
  const directory = `${destination.contextLabel} ${destination.section}`.toLowerCase();
  if (title === query) return 0;
  if (title.startsWith(query)) return 1;
  if (title.split(/\s+/).some((word) => word.startsWith(query))) return 2;
  if (title.includes(query)) return 3;
  if (directory.includes(query)) return 4;
  return 5;
};

const formatTitle = (title) =>
  String(title || "")
    .toLowerCase()
    .split(" ")
    .map((word) => {
      const upperWord = word.toUpperCase();
      return ACRONYMS.has(upperWord)
        ? upperWord
        : `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
    })
    .join(" ");

const getSection = (route, fallbackSection) => {
  const normalizedRoute = route.toLowerCase();
  if (normalizedRoute.includes("/company/")) return "Company";
  if (normalizedRoute.includes("/finance/")) return "Finance";
  if (normalizedRoute.includes("/cashflow/")) return "Cashflow";
  if (normalizedRoute.includes("/billing/")) return "Billing";
  if (normalizedRoute.includes("/inventory/")) return "Inventory";
  if (normalizedRoute.includes("/websites/")) return "Websites";
  if (normalizedRoute.includes("/revenue/")) return "Revenue";
  if (normalizedRoute.includes("/mix-bag/")) return "Mix Bag";
  if (normalizedRoute.includes("/data/")) return "Data";
  if (normalizedRoute.includes("/settings/")) return "Settings";
  if (normalizedRoute.includes("/overall-kpa/")) return "Performance";
  if (normalizedRoute.includes("/employee/")) return "Employee";
  return fallbackSection;
};

const buildDestinations = (config) => {
  const destinationsByRoute = new Map();

  Object.values(PERMISSIONS).forEach((permission) => {
    const route = permission?.route;
    const normalizedRoute = String(route || "").toLowerCase();
    if (
      permission?.type !== "read" ||
      !route ||
      !normalizedRoute.startsWith(config.root.toLowerCase()) ||
      config.excludedRoutes.has(normalizedRoute) ||
      route.includes(":")
    ) {
      return;
    }

    const existing = destinationsByRoute.get(route);
    if (existing) {
      existing.permissions.push(permission.value);
      return;
    }

    const section = getSection(route, config.label);
    destinationsByRoute.set(route, {
      title: formatTitle(permission.title),
      route,
      section,
      dashboardLabel: config.label,
      contextLabel: `${config.label} Dashboard`,
      scope: "dashboard",
      permissions: [permission.value],
      searchText: `${permission.title} ${config.label} ${section}`.toLowerCase(),
    });
  });

  return Array.from(destinationsByRoute.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
};

const getAppSection = (route, module) => {
  const routePrefix = module.routePrefix || module.root;
  const remainder = route.slice(routePrefix.length).split(/[?#]/)[0];
  const segment = remainder.split("/").filter(Boolean)[0];
  if (module.label === "KRA & KPA" && segment?.toLowerCase() === "individual") {
    return "Employee KRA/KPA";
  }
  return segment ? formatTitle(segment.replaceAll("-", " ")) : module.label;
};

const buildAppDestinations = () => {
  const destinationsByRoute = new Map();

  Object.values(APP_MODULE_CONFIG).forEach((module) => {
    destinationsByRoute.set(module.root, {
      title: module.label,
      route: module.root,
      section: module.label,
      contextLabel: "Apps",
      moduleLabel: module.label,
      modulePermission: module.permission,
      permissions: [module.permission],
      moduleLanding: true,
      scope: "apps",
      searchText: `${module.label} apps`.toLowerCase(),
    });
  });

  Object.values(PERMISSIONS).forEach((permission) => {
    const rawRoute = permission?.route;
    if (
      permission?.type !== "read" ||
      typeof rawRoute !== "string" ||
      !rawRoute.toLowerCase().startsWith("/app/") ||
      rawRoute.toLowerCase().startsWith("/app/dashboard/") ||
      rawRoute.includes(":")
    ) {
      return;
    }

    const route = APP_ROUTE_OVERRIDES[rawRoute.toLowerCase()] || rawRoute;
    const normalizedRoute = route.toLowerCase();
    const module = Object.values(APP_MODULE_CONFIG).find((item) => {
      const prefix = (item.routePrefix || item.root).toLowerCase();
      return normalizedRoute === prefix || normalizedRoute.startsWith(`${prefix}/`);
    });
    if (!module) return;

    const existing = destinationsByRoute.get(route);
    if (existing) {
      existing.permissions.push(permission.value);
      return;
    }

    const section = getAppSection(route, module);
    destinationsByRoute.set(route, {
      title: formatTitle(permission.title),
      route,
      section,
      contextLabel: "Apps",
      moduleLabel: module.label,
      modulePermission: module.permission,
      permissions: [permission.value],
      moduleLanding: false,
      scope: "apps",
      searchText: `${permission.title} ${module.label} ${section} apps`.toLowerCase(),
    });
  });

  return Array.from(destinationsByRoute.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
};

const DASHBOARD_DESTINATIONS = Object.fromEntries(
  Object.entries(PALETTE_CONFIG).map(([key, config]) => [
    key,
    buildDestinations(config),
  ]),
);
const APP_DESTINATIONS = buildAppDestinations();

const HrSearchPalette = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const paletteRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [historyState, setHistoryState] = useState({ key: null, routes: [] });
  const historyStorageKey = auth?.user?._id
    ? `${RECENT_HISTORY_KEY_PREFIX}${auth.user._id}`
    : null;

  const userPermissions = useMemo(
    () => new Set(auth?.user?.permissions?.permissions || []),
    [auth?.user?.permissions?.permissions],
  );

  const authorizedDestinationsByDashboard = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(PALETTE_CONFIG).map((key) => [
          key,
          DASHBOARD_DESTINATIONS[key].filter((destination) =>
            destination.permissions.some((permission) =>
              userPermissions.has(permission),
            ),
          ),
        ]),
      ),
    [userPermissions],
  );

  const authorizedDestinations = useMemo(
    () =>
      Object.values(authorizedDestinationsByDashboard)
        .flat()
        .sort((a, b) => a.title.localeCompare(b.title)),
    [authorizedDestinationsByDashboard],
  );

  const authorizedAppDestinations = useMemo(
    () =>
      APP_DESTINATIONS.filter((destination) => {
        if (!userPermissions.has(destination.modulePermission)) return false;
        return (
          destination.moduleLanding ||
          destination.permissions.some((permission) =>
            userPermissions.has(permission),
          )
        );
      }),
    [userPermissions],
  );

  const allAuthorizedDestinations = useMemo(
    () =>
      [...authorizedDestinations, ...authorizedAppDestinations].sort(
        (a, b) =>
          a.title.localeCompare(b.title) ||
          a.contextLabel.localeCompare(b.contextLabel),
      ),
    [authorizedAppDestinations, authorizedDestinations],
  );

  useEffect(() => {
    if (!historyStorageKey || !Array.isArray(auth?.user?.permissions?.permissions)) {
      setHistoryState({ key: historyStorageKey, routes: [] });
      return;
    }

    const authorizedRoutes = new Set(
      allAuthorizedDestinations.map(({ route }) => route),
    );
    const storedRoutes = readRecentHistory(historyStorageKey);
    const routes = storedRoutes.filter((route) => authorizedRoutes.has(route));
    if (routes.length !== storedRoutes.length) writeRecentHistory(historyStorageKey, routes);
    setHistoryState({ key: historyStorageKey, routes });
  }, [
    allAuthorizedDestinations,
    auth?.user?.permissions?.permissions,
    historyStorageKey,
  ]);

  const recentDestinations = useMemo(() => {
    if (historyState.key !== historyStorageKey) return [];
    const destinationByRoute = new Map(
      allAuthorizedDestinations.map((destination) => [
        destination.route,
        destination,
      ]),
    );
    return historyState.routes
      .map((route) => destinationByRoute.get(route))
      .filter(Boolean);
  }, [allAuthorizedDestinations, historyState, historyStorageKey]);

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return recentDestinations;
    const terms = query.split(/\s+/).filter(Boolean);
    return allAuthorizedDestinations
      .filter((destination) =>
        terms.every((term) => destination.searchText.includes(term)),
      )
      .sort((a, b) =>
        getMatchRank(a, query) - getMatchRank(b, query) ||
        a.title.localeCompare(b.title) ||
        a.contextLabel.localeCompare(b.contextLabel),
      );
  }, [allAuthorizedDestinations, recentDestinations, search]);

  const closePalette = () => {
    setOpen(false);
    setSearch("");
    setActiveIndex(0);
  };

  const openDestination = (destination) => {
    if (
      !destination ||
      !allAuthorizedDestinations.some(
        ({ route }) => route === destination.route,
      )
    ) {
      return;
    }
    if (historyStorageKey) {
      const routes = [destination.route, ...readRecentHistory(historyStorageKey)
        .filter((route) => route !== destination.route)]
        .slice(0, RECENT_HISTORY_LIMIT);
      writeRecentHistory(historyStorageKey, routes);
      setHistoryState({ key: historyStorageKey, routes });
    }
    closePalette();
    navigate(destination.route);
  };

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event) => {
      if (!paletteRef.current?.contains(event.target)) closePalette();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      closePalette();
      return;
    }
    if (event.target !== inputRef.current) return;
    if (!filteredDestinations.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        current === filteredDestinations.length - 1 ? 0 : current + 1,
      );
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current === 0 ? filteredDestinations.length - 1 : current - 1,
      );
    }
    if (event.key === "Enter") {
      event.preventDefault();
      openDestination(filteredDestinations[activeIndex]);
    }
  };

  return (
    <div
      ref={paletteRef}
      className="relative flex w-full max-w-2xl items-center"
      onKeyDown={handleKeyDown}
    >
      <form
        id="global-page-search-form"
        role="search"
        autoComplete="off"
        onSubmit={(event) => event.preventDefault()}
        className="relative flex h-10 min-w-0 flex-1 items-center rounded-md border border-borderGray bg-white px-1.5 transition-colors hover:border-primary focus-within:border-primary"
      >
        <IoIosSearch
          className="pointer-events-none ml-2.5 shrink-0 text-primary"
          size={18}
        />
        <input
          ref={inputRef}
          type="search"
          id="global-page-search"
          name="global-page-search"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={search}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
          }}
          placeholder="Search pages..."
          aria-label="Search authorized Dashboard and App pages"
          aria-expanded={open}
          className="h-9 min-w-0 flex-1 border-0 bg-transparent px-2 pr-16 text-content text-primary outline-none placeholder:text-gray-500"
        />
        {open ? (
          <button
            type="button"
            onClick={closePalette}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full text-black transition-colors hover:bg-gray-100"
            aria-label="Close search palette"
            title="Close"
          >
            <IoMdClose size={21} />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-2 rounded border border-borderGray bg-[#F7F8FA] px-2 py-0.5 text-xs text-primary">
            Ctrl K
          </kbd>
        )}
      </form>

      {open && (
        <section
          role="dialog"
          aria-label="Search authorized Dashboard and App pages"
          className="absolute left-0 right-0 top-full z-[1500] mt-2 overflow-hidden rounded-xl border border-borderGray bg-white shadow-xl"
        >
              <div className="max-h-[55vh] overflow-y-auto p-2">
                {!search.trim() && (
                  <div className="px-4 pb-1 pt-2 text-xs font-pmedium uppercase tracking-wide text-gray-500">
                    Recent History
                  </div>
                )}
                {filteredDestinations.length ? (
                  filteredDestinations.map((destination, index) => (
                    <button
                      type="button"
                      key={destination.route}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => openDestination(destination)}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                        activeIndex === index
                          ? "bg-blue-50"
                          : "hover:bg-[#F7F8FA]"
                      }`}
                    >
                      <MdOutlineInsertDriveFile
                        className="shrink-0 text-primary"
                        size={21}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-content font-pmedium text-primary">
                          {destination.title}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {destination.contextLabel}
                          {destination.scope === "apps" && destination.moduleLabel
                            ? ` > ${destination.moduleLabel}`
                            : ""}
                          {destination.section &&
                          destination.section !== destination.moduleLabel &&
                          destination.section !== destination.dashboardLabel
                            ? ` > ${destination.section}`
                            : ""}
                        </span>
                      </span>
                      <IoIosArrowForward className="text-primary" />
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center text-sm text-gray-400">
                    {search.trim() ? (
                      `No authorized pages match "${search.trim()}".`
                    ) : (
                      "No recent pages yet. Open a page from search to see it here."
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center border-t border-borderGray bg-[#F7F8FA] px-5 py-3 text-xs text-gray-500">
                <div className="flex items-center divide-x divide-borderGray">
                  <span className="pr-4">↑↓ Navigate</span>
                  <span className="px-4">Enter Open</span>
                  <span className="pl-4">Esc Close</span>
                </div>
                <span className="ml-auto">
                  {filteredDestinations.length} page
                  {filteredDestinations.length === 1 ? "" : "s"}
                </span>
              </div>
        </section>
      )}
    </div>
  );
};

export default HrSearchPalette;
