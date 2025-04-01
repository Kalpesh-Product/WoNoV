import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const HrCommonLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Define tabs with paths
  const tabs = [
    { label: "Attendance", path: "attendance" },
    { label: "Leaves", path: "leaves" },
    { label: "Agreements", path: "agreements" },
    { label: "Payslips", path: "payslips" },
  ];

  // Redirect to "attendance" if at "/app/HR"
  useEffect(() => {
    if (location.pathname === "/app/profile/HR") {
      navigate("/app/profile/HR/attendance", { replace: true });
    }
  }, [location, navigate]);

  // Determine active tab
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
    <div className="flex h-[68vh] overflow-y-auto gap-4 p-2 px-0">
      {/* Sidebar Tabs */}
      <Tabs
        value={activeTab}
        orientation="vertical"
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          width: "250px",
          backgroundColor: "white",
          borderRadius: 2,
          border: "1px solid #d1d5db",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "medium",
            padding: "12px 16px",
            borderBottom: "1px solid #d1d5db",
            alignItems: "start",
            justifyContent: "flex-start",
            width: "100%",
          },
          "& .Mui-selected": {
            backgroundColor: "#1E3D73",
            color: "white",
          },
        }}
      >
        {tabs.map((tab, index) => (
          <NavLink
            key={index}
            to={tab.path}
            style={({ isActive }) => ({
              textDecoration: "none",
              color: isActive ? "white" : "#1E3D73",
              width: "100%",
              padding: "12px 16px",
              display: "block",
              backgroundColor: isActive ? "#1E3D73" : "white",
              borderRadius: "4px",
            })}
          >
            {tab.label}
          </NavLink>
        ))}
      </Tabs>

      {/* Content Section */}
      <div className="flex-1 p-4 rounded-md shadow-md overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default HrCommonLayout;
