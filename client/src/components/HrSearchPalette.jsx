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
const ACRONYMS = new Set(["HR", "KPA", "KRA", "SOP", "SOPS"]);

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
      permissions: [permission.value],
      searchText:
        `${permission.title} ${config.label} ${section} ${route}`.toLowerCase(),
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

const HrSearchPalette = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const paletteRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

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

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return authorizedDestinations;
    const terms = query.split(/\s+/).filter(Boolean);
    return authorizedDestinations.filter((destination) =>
      terms.every((term) => destination.searchText.includes(term)),
    );
  }, [authorizedDestinations, search]);

  const closePalette = () => {
    setOpen(false);
    setSearch("");
    setActiveIndex(0);
  };

  const openDestination = (destination) => {
    if (!destination) return;
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
      <div className="relative flex h-10 min-w-0 flex-1 items-center">
        <IoIosSearch
          className="pointer-events-none absolute left-4 z-10 text-primary"
          size={20}
        />
        <input
          ref={inputRef}
          value={search}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
          }}
          placeholder="Search pages..."
          aria-label="Search authorized dashboard pages"
          aria-expanded={open}
          className="h-10 w-full rounded-md border border-borderGray bg-white pl-12 pr-20 text-content text-primary outline-none transition-colors placeholder:text-gray-500 hover:border-primary focus:border-primary"
        />
        {open ? (
          <button
            type="button"
            onClick={closePalette}
            className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full text-black transition-colors hover:bg-gray-100"
            aria-label="Close search palette"
            title="Close"
          >
            <IoMdClose size={21} />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-3 rounded border border-borderGray bg-[#F7F8FA] px-2 py-0.5 text-xs text-primary">
            Ctrl K
          </kbd>
        )}
      </div>

      {open && (
        <section
          role="dialog"
          aria-label="Search authorized dashboard pages"
          className="absolute left-0 right-0 top-full z-[1500] mt-2 overflow-hidden rounded-xl border border-borderGray bg-white shadow-xl"
        >
              <div className="max-h-[55vh] overflow-y-auto p-2">
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
                          {destination.dashboardLabel} Dashboard &gt; {destination.section}
                        </span>
                      </span>
                      <IoIosArrowForward className="text-primary" />
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center text-sm text-gray-400">
                    No authorized pages match “{search}”.
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
