import React from "react";
import { Breadcrumbs, Typography, Link } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const BreadCrumbComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract query parameters
  const searchParams = new URLSearchParams(location.search);
  
  // Convert query parameters into an array of key-value pairs
  const queryParamEntries = Array.from(searchParams.entries());

  // Extract and process the path, excluding 'app' for display purposes
  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => segment && segment !== "app" && segment !== "dashboard");

  // Generate breadcrumb links
  const breadcrumbs = pathSegments.map((segment, index) => {
    const isLast = index === pathSegments.length - 1;

    // Build the navigation path
    const path = pathSegments.slice(0, index + 1).join("/");
    const isDirectAppPath = location.pathname.startsWith(`/app/${path}`) && !location.pathname.includes("/dashboard");
    const fullPath = isDirectAppPath ? `/app/${path}` : `/app/dashboard/${path}`;

    // Capitalize for display
    const displayText = segment
      .replace(/-/g, " ") // Replace hyphens with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize for display

    return isLast ? (
      <Typography key={index} color="text.primary">
        {displayText}
      </Typography>
    ) : (
      <Link
        key={index}
        underline="hover"
        color="inherit"
        onClick={() => navigate(fullPath)}
        style={{ cursor: "pointer" }}
      >
        {displayText}
      </Link>
    );
  });

  // Append query parameters dynamically to the breadcrumb
  queryParamEntries.forEach(([key, value], index) => {
    breadcrumbs.push(
      <Typography key={`param-${index}`} color="text.primary">
        {`${value}`}
      </Typography>
    );
  });

  return (
    <div className="rounded-t-md">
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
    </div>
  );
};

export default BreadCrumbComponent;
