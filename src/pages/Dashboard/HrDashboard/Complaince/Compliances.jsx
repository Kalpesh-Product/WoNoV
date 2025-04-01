import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const Compliances = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
    { label: "Company Logo", path: "company-logo" },
    { label: "Company Handbook", path: "company-handbook" },
    { label: "Departments", path: "departments" },
    { label: "Work Locations", path: "work-locations" },
    { label: "Holidays / Events", path: "holidays" },
    { label: "Company Policies", path: "policies" },
    { label: "Company SOP's", path: "sops" },
    { label: "Employee Types", path: "employee-type" },
    { label: "Shifts", path: "shifts" },
    { label: "Templates", path: "templates" },
    { label: "Vendor", path: "vendor-onboarding" },
  ];

  // Redirect to "company-logo" if the current path is "/app/dashboard/HR-dashboard/company"
  useEffect(() => {
    if (location.pathname === "/app/dashboard/HR-dashboard/company") {
      navigate("/app/dashboard/HR-dashboard/company/company-logo", {
        replace: true,
      });
    }
  }, [location, navigate]);

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
    <div className="p-4">
      {/* Render Tabs */}
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => {
          navigate(
            `/app/dashboard/HR-dashboard/company/${tabs[newValue].path}`
          );
        }}
        variant="scrollable" // Makes tabs scrollable
        scrollButtons="auto" // Show scroll buttons when needed
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          overflow: "hidden", // Prevent overflow
          width: "100%", // Ensure tabs fit within screen width
          whiteSpace: "nowrap", // Prevent text from wrapping
          backgroundColor: "white",
          borderRadius: 2,
          border: "1px solid #d1d5db",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "medium",
            padding: "12px 16px",
            minWidth: "20%", // Ensure tabs have a minimum width for responsiveness
            borderRight: "0.1px solid #d1d5db",
          },
          "& .Mui-selected": {
            backgroundColor: "#1E3D73",
            color: "#ffff",
          },
          "& .MuiTabs-scrollButtons": {
            "&.Mui-disabled": { opacity: 0.3 }, // Style disabled scroll buttons
          },
        }}>
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            sx={{
              "&:hover": {
                backgroundColor: "#e0e7ff",
              },
            }}
          />
        ))}
      </Tabs>

      <div className="py-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Compliances;
