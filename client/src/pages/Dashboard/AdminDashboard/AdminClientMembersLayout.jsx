import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const AdminClientMembersLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
    { label: "Client Details", path: "client-details" },
    { label: "Members", path: "members" },
  ];

  useEffect(() => {
    const basePath = `/app/dashboard/admin-dashboard/mix-bag/client-members/client-members-data`;

    const pathParts = location.pathname.split("/").filter(Boolean); // remove empty parts
    const clientNameIndex = pathParts.indexOf("client-members-data") + 1;
    const clientName = pathParts[clientNameIndex];
    const isAtClientRoot =
      location.pathname === `${basePath}/${clientName}`;

      
    if (isAtClientRoot) {
      navigate(`${basePath}/${clientName}/client-details`, { replace: true });
    }
  }, [location, navigate]);


  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
    <div className=" flex flex-col gap-4">
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
            backgroundColor: "#1E3D73", // Highlight background color for the active tab
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

      <div>
        {/* Render the nested routes */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminClientMembersLayout;
