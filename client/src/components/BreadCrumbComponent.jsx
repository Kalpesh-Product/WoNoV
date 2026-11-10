import React from "react";
import { Breadcrumbs, Typography, Link } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import CurrencySelector from "./CurrencySelector";
import { useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";

const BreadCrumbComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const selectedMember = useSelector(
    (state) => state.performance.selectedMember,
  );
  const isEmployeeKraKpaPage =
    location.pathname.startsWith("/app/kra-kpa/") &&
    /\/(individual-Monthly-KPA|self-KRA|due-task|daily-logs)$/i.test(
      location.pathname,
    );
  const isEmployeeDashboardContext = location.pathname.includes(
    "/kra-kpa/department-KPA/member-wise-KPA/employee-dashboard",
  );
  const isOwnDailyScorePage = location.pathname.startsWith(
    "/app/kra-kpa/individual/daily-score/",
  );
  const isOwnEmployeePage =
    location.pathname.includes("/employee-KRA-KPA") ||
    location.pathname.includes("/kra-kpa/individual/");
  const memberName = isOwnEmployeePage
    ? [auth?.user?.firstName, auth?.user?.middleName, auth?.user?.lastName]
        .filter(Boolean)
        .join(" ")
    : (location.state?.selectedMember || selectedMember)?.memberName;

  const formatLabel = (value) => {
    if (value.toLowerCase() === "kra-kpa") {
      return "KRA & KPA";
    }

    if (
      value.toLowerCase() === "departments" &&
      location.pathname.toLowerCase().startsWith("/app/kra-kpa/")
    ) {
      return "Department";
    }

    if (value.toLowerCase() === "sales-dashboard1") {
      return "Sales Dashboard";
    }

    if (value.toLowerCase() === "repeat-day-pass") {
      return "Repeat Booking";
    }

    if (
      value.toLowerCase() === "individual-monthly-kpa" &&
      location.pathname.toLowerCase().startsWith("/app/kra-kpa")
    ) {
      return "Self KPA";
    }

    if (
      value.toLowerCase() === "individual" &&
      location.pathname.toLowerCase().startsWith("/app/kra-kpa")
    ) {
      return "Employee KRA/KPA";
    }

    const acronymMap = {
      amc: "AMC",
      biz: "BIZ",
    };

    return decodeURIComponent(value)
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => {
        const normalizedWord = word.toLowerCase();
        if (acronymMap[normalizedWord]) {
          return acronymMap[normalizedWord];
        }

        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  // Extract query parameters
  const searchParams = new URLSearchParams(location.search);

  // Convert query parameters into an array of key-value pairs
  const queryParamEntries = Array.from(searchParams.entries());

  // Extract and process the path, excluding 'app' for display purposes
  const basePathSegments =
    location.pathname === "/app/dashboard"
      ? ["dashboard"]
      : location.pathname
          .split("/")
          .filter(
            (segment) =>
              segment && segment !== "app" && segment !== "dashboard",
          );

  const isVisitorHistoryPath = basePathSegments.includes("visitor-history");
  const isDayPassSalesHistoryPath =
    basePathSegments.includes("sales-dashboard") &&
    basePathSegments.includes("day-pass") &&
    basePathSegments.includes("manage-day-pass") &&
    basePathSegments.includes("external-clients");
  const historyType = searchParams.get("type");
  const pathSegments = [...basePathSegments];
  const isPendingApprovalsDetailView =
    location.pathname.replace(/\/$/, "") === "/app/kra-kpa/pending-approvals" &&
    Boolean(location.state?.pendingApprovalDepartment || location.state?.pendingApprovalMember);

  if (isVisitorHistoryPath && historyType && !isDayPassSalesHistoryPath) {
    const historyIndex = pathSegments.indexOf("visitor-history");
    const historyTab =
      historyType === "internal" ? "internal-visitors" : "external-clients";
    pathSegments.splice(historyIndex, 0, historyTab);
  }

  // Generate breadcrumb links
  const pathBreadcrumbs = pathSegments.map((segment, index) => {
    const isLast = index === pathSegments.length - 1;
    const isDepartmentCardCrumb =
      isEmployeeDashboardContext && segment.toLowerCase() === "department-kpa";
    const isEmployeeWorkCrumb =
      isEmployeeDashboardContext &&
      segment.toLowerCase() === "kra-kpa" &&
      pathSegments[index - 1]?.toLowerCase() === "employee-dashboard";
    const isSalesVerticalClientPath =
      (pathSegments.includes("virtual-office") ||
        pathSegments.includes("co-working")) &&
      pathSegments.includes("client");
    const isClientIdSegment =
      isSalesVerticalClientPath &&
      pathSegments[index - 1] === "client" &&
      ["client-details", "desks", "revenue", "members"].includes(
        pathSegments[index + 1],
      );
    const isNonNavigableSegment =
      segment === "visitor-history" ||
      isEmployeeWorkCrumb ||
      (segment === "daily-score" && location.pathname.startsWith("/app/kra-kpa/")) ||
      (isSalesVerticalClientPath && segment === "client");
    const isHistoryTabSegment =
      isVisitorHistoryPath &&
      !isDayPassSalesHistoryPath &&
      (segment === "internal-visitors" || segment === "external-clients");
    // Build the navigation path
    const path = pathSegments.slice(0, index + 1).join("/");
    const isDirectAppPath =
      location.pathname.startsWith(`/app/${path}`) &&
      !location.pathname.includes("/dashboard");
    const fullPath = isDepartmentCardCrumb
      ? "/app/kra-kpa/departments"
      : isHistoryTabSegment
        ? `/app/visitors/manage-visitors/${segment}`
        : isDirectAppPath
          ? `/app/${path}`
          : `/app/dashboard/${path}`;

    // Capitalize for display
    // const displayText = decodeURIComponent(segment)
    // .replace(/-/g, " ")
    // .replace(/\b\w/g, (char) => char.toUpperCase());

    const displayText =
      isDepartmentCardCrumb
        ? "Department"
        : isEmployeeWorkCrumb
          ? "Employee KRA/KPA"
          : isLast && location.state?.breadcrumbLabel
            ? location.state.breadcrumbLabel
            : formatLabel(segment);

    // Keep the segment in the path for child links, but don't repeat the module label.
    if (
      isClientIdSegment ||
      (isOwnDailyScorePage && segment === "individual") ||
      (isEmployeeDashboardContext && segment.toLowerCase() === "member-wise-kpa") ||
      (index > 0 &&
        pathSegments[0]?.toLowerCase() === "kra-kpa" &&
        segment.toLowerCase() === "kra-kpa" &&
        !isEmployeeWorkCrumb)
    ) return null;

    return isLast || isNonNavigableSegment ? (
      <Typography key={index} color="text.primary">
        {displayText}
      </Typography>
    ) : (
      <Link
        key={index}
        underline="hover"
        color="inherit"
        onClick={() =>
          navigate(
            fullPath,
            isEmployeeDashboardContext && segment === "employee-dashboard"
              ? { state: location.state }
              : undefined,
          )
        }
        style={{ cursor: "pointer" }}
      >
        {displayText}
      </Link>
    );
  });
  const breadcrumbs = [];
  if (isPendingApprovalsDetailView) {
    const approvalDepartment = location.state.pendingApprovalDepartment || location.state.pendingApprovalMember;
    const approvalMember = location.state.pendingApprovalMember;
    breadcrumbs.push(
      <Link key="kra-kpa" underline="hover" color="inherit" onClick={() => navigate("/app/kra-kpa")} sx={{ cursor: "pointer" }}>
        KRA &amp; KPA
      </Link>,
      <Link key="pending-approvals" underline="hover" color="inherit" onClick={() => navigate("/app/kra-kpa/pending-approvals", { state: null })} sx={{ cursor: "pointer" }}>
        Pending Approvals
      </Link>,
      <Typography key="approval-department" color="text.primary">
        {approvalDepartment.departmentName}
      </Typography>,
      approvalMember ? (
        <Link key="approval-team-members" underline="hover" color="inherit" onClick={() => navigate(location.pathname, { state: { ...location.state, pendingApprovalMember: null } })} sx={{ cursor: "pointer" }}>
          Team Members
        </Link>
      ) : (
        <Typography key="approval-team-members" color="text.primary">Team Members</Typography>
      ),
    );
    if (approvalMember) {
      breadcrumbs.push(
        <Typography key="approval-member" color="text.primary">
          {approvalMember.memberName}
        </Typography>,
      );
    }
  } else {
    breadcrumbs.push(...pathBreadcrumbs);
  }
  if (isEmployeeDashboardContext && memberName) {
    breadcrumbs.push(
      <Typography key="employee-dashboard-member" color="text.primary">
        {memberName}
      </Typography>,
    );
  }

  if (isEmployeeKraKpaPage && memberName && !isEmployeeDashboardContext) {
    breadcrumbs.push(
      <Typography key="employee-member" color="text.primary">
        {memberName}
      </Typography>,
    );
  }

  // Append query parameters dynamically to the breadcrumb
  queryParamEntries.forEach(([key, value], index) => {
    if (isVisitorHistoryPath && key === "type") return;

    breadcrumbs.push(
      <Typography key={`param-${index}`} color="text.primary">
        {formatLabel(value)}
      </Typography>,
    );
  });

  return (
    <div className="rounded-t-md flex items-center justify-between gap-4">
      <Breadcrumbs
        separator="›"
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-ol": {
            fontSize: "1rem !important",
            color: "#1E3D73",
          },
          "& .MuiBreadcrumbs-li": {
            fontSize: "0.9rem !important",
          },
          "& .MuiBreadcrumbs-li .MuiTypography-root": {
            fontSize: "0.9rem !important",
            color: "#1E3D73 !important",
          },
          "& .MuiBreadcrumbs-separator": {
            margin: "0 1rem",
          },
        }}
      >
        {breadcrumbs}
      </Breadcrumbs>
      {location.pathname.includes("/investor-dashboard") && (
        <div className="hidden md:block">
          <CurrencySelector />
        </div>
      )}
    </div>
  );
};

export default BreadCrumbComponent;
