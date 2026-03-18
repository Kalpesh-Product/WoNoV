import { Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../constants/permissions";
import TabLayout from "../../components/Tabs/TabLayout";

const ProfileLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
    { label: "Profile", path: "my-profile", permission: PERMISSIONS.PROFILE_MY_PROFILE.value },
    { label: "Change Password", path: "change-password", permission: PERMISSIONS.PROFILE_CHANGE_PASSWORD.value },
    { label: "Permissions", path: "permissions", permission: PERMISSIONS.PROFILE_PERMISSIONS.value },
    { label: "HR", path: "HR", permission: PERMISSIONS.PROFILE_HR.value },
    { label: "Assets", path: "my-assets", permission: PERMISSIONS.PROFILE_ASSETS.value },
    { label: "Meetings", path: "my-meetings", permission: PERMISSIONS.PROFILE_MY_MEETINGS.value },
    { label: "Ticket History", path: "tickets-history", permission: PERMISSIONS.PROFILE_TICKETS_HISTORY.value },
  ];

  // Redirect to "first tab" if the current path is "/module/first-page"
  // useEffect(() => {
  //   if (location.pathname === "/app/profile") {
  //     navigate("/app/profile/my-profile", {
  //       replace: true,
  //     });
  //   }
  // }, [location, navigate]);

  // Determine whether to show the tabs
  const showTabs = !location.pathname.includes("budget/");

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
    // <div className="p-4">
    //   {/* Render tabs only if the current route is not EmployeeDetails */}
    //   {showTabs && (
    //     <Tabs
    //       value={activeTab}
    //       variant="fullWidth"
    //       TabIndicatorProps={{ style: { display: "none" } }}
    //       sx={{
    //         backgroundColor: "white",
    //         borderRadius: 2,
    //         border: "1px solid #d1d5db",
    //         "& .MuiTab-root": {
    //           textTransform: "none",
    //           fontWeight: "medium",
    //           padding: "12px 16px",
    //           borderRight: "0.1px solid #d1d5db",
    //         },
    //         "& .Mui-selected": {
    //           backgroundColor: "#1E3D73",
    //           color: "white",
    //         },
    //       }}
    //     >
    //       {tabs.map((tab, index) => (
    //         <NavLink
    //           key={index}
    //           className={"border-r-[1px] border-borderGray"}
    //           to={tab.path}
    //           style={({ isActive }) => ({
    //             textDecoration: "none",
    //             color: isActive ? "white" : "#1E3D73",
    //             flex: 1,
    //             textAlign: "center",
    //             padding: "12px 16px",
    //             display: "block",
    //             backgroundColor: isActive ? "#1E3D73" : "white",
    //           })}
    //         >
    //           {tab.label}
    //         </NavLink>
    //       ))}
    //     </Tabs>
    //   )}

    //   <div className="py-4">
    //     <Outlet />
    //   </div>
    // </div>
    <TabLayout
      basePath="/app/profile"
      defaultTabPath="my-profile"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("my-profile/")}
    />
  );
};

export default ProfileLayout;
