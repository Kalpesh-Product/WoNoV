import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import TabLayout from "../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../constants/permissions";

const AdminClientMembersLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientName } = useParams();

  // Map routes to tabs
  const tabs = [
    { label: "Client Details", path: "client-details", permission: PERMISSIONS.ADMIN_CLIENT_DETAILS.value },
    { label: "Members", path: "members", permission: PERMISSIONS.ADMIN_MEMBERS.value },
  ];

  const fullBasePath = `/app/dashboard/admin-dashboard/mix-bag/client-members/client-members-data/${encodeURIComponent(clientName)}`;


  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
    // <div className=" flex flex-col gap-4">
    //   <Tabs
    //     value={activeTab}
    //     variant="fullWidth"
    //     TabIndicatorProps={{ style: { display: "none" } }}
    //     sx={{
    //       backgroundColor: "white",
    //       borderRadius: 2,
    //       border: "1px solid #d1d5db",
    //       "& .MuiTab-root": {
    //         textTransform: "none",
    //         fontWeight: "medium",
    //         padding: "12px 16px",
    //         borderRight: "0.1px solid #d1d5db",
    //       },
    //       "& .Mui-selected": {
    //         backgroundColor: "#1E3D73", // Highlight background color for the active tab
    //         color: "white",
    //       },
    //     }}>
    //     {tabs.map((tab, index) => (
    //       <NavLink
    //         key={index}
    //         className={"border-r-[1px] border-borderGray"}
    //         to={tab.path}
    //         style={({ isActive }) => ({
    //           textDecoration: "none",
    //           color: isActive ? "white" : "#1E3D73",
    //           flex: 1,
    //           textAlign: "center",
    //           padding: "12px 16px",
    //           display: "block",
    //           backgroundColor: isActive ? "#1E3D73" : "white",
    //         })}>
    //         {tab.label}
    //       </NavLink>
    //     ))}
    //   </Tabs>

    //   <div>
    //     {/* Render the nested routes */}
    //     <Outlet />
    //   </div>
    // </div>
    <TabLayout
      basePath={fullBasePath}
      defaultTabPath="client-details"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("client-details/")}
    />
  );
};

export default AdminClientMembersLayout;
