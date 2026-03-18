import { Tabs } from "@mui/material";
import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../../constants/permissions";
import TabLayout from "../../../../components/Tabs/TabLayout";

const LeavesLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
    { label: "Pending Approvals Leaves", path: "pending-approvals", permission: PERMISSIONS.HR_PENDING_APPROVALS_LEAVES.value },
    { label: "Completed Leaves", path: "completed-approvals", permission: PERMISSIONS.HR_COMPLETED_LEAVES.value },
  ];

  useEffect(() => {
    if (
      location.pathname === "/app/dashboard/HR-dashboard/mix-bag/leaves"
    ) {
      navigate(
        "/app/dashboard/HR-dashboard/mix-bag/leaves/pending-approvals",
        {
          replace: true,
        }
      );
    }
  }, [location, navigate]);

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
      basePath="/app/dashboard/HR-dashboard/mix-bag/leaves/"
      defaultTabPath="pending-approvals"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("pending-approvals/")}
    >
      <Outlet />
    </TabLayout>
  );
};

export default LeavesLayout;
