import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const MaintenanceOfficesLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { client } = useParams();

  // Map routes to tabs
  const tabs = [
    { label: "Occupied", path: "maintenance-offices-occupied" },
    { label: "Clear", path: "maintenance-offices-clear" },
  ];

  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"
  useEffect(() => {
    if (
      location.pathname ===
      `/app/dashboard/maintenance-dashboard/maintenance-offices/maintenance-offices-layout/${client}`
    ) {
      navigate(
        `/app/dashboard/maintenance-dashboard/maintenance-offices/maintenance-offices-layout/${client}/maintenance-offices-occupied`,
        {
          replace: true,
        }
      );
    }
  }, [location, navigate]);

  // Determine whether to show the tabs
  const showTabs = !location.pathname.includes("maintenance-offices-occupied/");

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
    <div className="p-4">
      <div className="flex justify-between">
        <p className="text-title text-primary font-pmedium p-6">
          Office Layout ({client})
        </p>
        <p className="text-subtitle text-primary p-6">
          <span className="font-bold">Maintenance Lead: </span>Rajesh Sawant
        </p>
      </div>

      {/* Render tabs only if the current route is not EmployeeDetails */}
      {showTabs && (
        <Tabs
          value={activeTab}
          variant="fullWidth"
          TabIndicatorProps={{ style: { display: "none" } }}
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            border: "1px solid #d1d5db",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: "medium",
              padding: "12px 16px",
              borderRight: "0.1px solid #d1d5db",
            },
            "& .Mui-selected": {
              backgroundColor: "#1E3D73",
              color: "white",
            },
          }}>
          {tabs.map((tab, index) => (
            <NavLink
              key={index}
              className={"border-r-[1px] border-borderGray"}
              to={tab.path}
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "white" : "#1E3D73",
                flex: 1,
                textAlign: "center",
                padding: "12px 16px",
                display: "block",
                backgroundColor: isActive ? "#1E3D73" : "white",
              })}>
              {tab.label}
            </NavLink>
          ))}
        </Tabs>
      )}

      <div className="py-4">
        <Outlet />
      </div>
    </div>
  );
};

export default MaintenanceOfficesLayout;
