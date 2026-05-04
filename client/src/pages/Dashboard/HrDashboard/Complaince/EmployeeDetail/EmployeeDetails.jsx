import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../../../constants/permissions";
import useAuth from "../../../../../hooks/useAuth";
import Unauthorized from "../../../../Unauthorized";

const EmployeeDetails = () => {
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
    { label: "Edit Details", path: "edit-details", permission: PERMISSIONS.HR_EMPLOYEE_EDIT_DETAILS.value },
    { label: "Attendance", path: "attendance", permission: PERMISSIONS.HR_EMPLOYEE_ATTENDANCE_DETAILS.value },
    { label: "Leaves", path: "leaves", permission: PERMISSIONS.HR_EMPLOYEE_LEAVES_DETAILS.value },
    { label: "Agreements", path: "agreements", permission: PERMISSIONS.HR_EMPLOYEE_AGREEMENTS_DETAILS.value },
    // { label: "KPI'S", path: "kpi" },
    // { label: "KRA'S", path: "kra" },
    { label: "Payslip", path: "payslip", permission: PERMISSIONS.HR_EMPLOYEE_PAYSLIP_DETAILS.value },
  ];

  const allowedTabs = tabs.filter((tab) => userPermissions.includes(tab.permission));

  useEffect(() => {
    if (!allowedTabs.length) return;

    const allowedPaths = allowedTabs.map((tab) => tab.path);
    const isPathAllowed = allowedPaths.some((path) => location.pathname.includes(path));

    if (!isPathAllowed) {
      const basePath = location.pathname.split("/").slice(0, -1).join("/");
      navigate(`${basePath}/${allowedTabs[0].path}`, { replace: true });
    }
  }, [allowedTabs, location.pathname, navigate]);

  if (allowedTabs.length === 0) {
    return (
      <Unauthorized
        redirectTo="/app/dashboard/HR-dashboard/employee/employee-list"
        title="Access Denied"
        message="You do not have access to the employee details tabs."
      />
    );
  }

  // Determine active tab based on location
  const activeTab = allowedTabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
    <div>
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
        }}
      >
        {allowedTabs.map((tab, index) => (
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
            })}
          >
            {tab.label}
          </NavLink>
        ))}
      </Tabs>

      <div className="py-4">
        {/* Render the nested routes */}
        <Outlet />
      </div>
    </div>
  );
};

export default EmployeeDetails;


// import { Tab, Tabs } from "@mui/material";
// import React, { useEffect } from "react";
// import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

// const EmployeeDetails = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Map routes to tabs
//   const tabs = [
//     { label: "Edit Details", path: "edit-details" },
//     { label: "Attendance", path: "attendance" },
//     { label: "Leaves", path: "leaves" },
//     { label: "Agreements", path: "agreements" },
//     // { label: "KPI'S", path: "kpi" },
//     // { label: "KRA'S", path: "kra" },
//     { label: "Payslip", path: "payslip" },
//   ];

//   useEffect(() => {
//     const subroutes = ["edit-details", "attendance", "leaves", "agreements", "kpi", "kra","payslip"];
//     if (!subroutes.some((subroute) => location.pathname.includes(subroute))) {
//       navigate(`${location.pathname}/edit-details`, { replace: true });
//     }
//   }, [location, navigate]);

//   // Determine active tab based on location
//   const activeTab = tabs.findIndex((tab) =>
//     location.pathname.includes(tab.path)
//   );

//   return (
//     <div>
//       <Tabs
//         value={activeTab}
//         variant="fullWidth"
//         TabIndicatorProps={{ style: { display: "none" } }}
//         sx={{
//           backgroundColor: "white",
//           borderRadius: 2,
//           border: "1px solid #d1d5db",
//           "& .MuiTab-root": {
//             textTransform: "none",
//             fontWeight: "medium",
//             padding: "12px 16px",
//             borderRight: "0.1px solid #d1d5db",
//           },
//           "& .Mui-selected": {
//             backgroundColor: "#1E3D73", // Highlight background color for the active tab
//             color: "white",
//           },
//         }}
//       >
//         {tabs.map((tab, index) => (
//           <NavLink
//             key={index}
//             className={"border-r-[1px] border-borderGray"}
//             to={tab.path}
//             style={({ isActive }) => ({
//               textDecoration: "none",
//               color: isActive ? "white" : "#1E3D73",
//               flex: 1,
//               textAlign: "center",
//               padding: "12px 16px",
//               display: "block",
//               backgroundColor: isActive ? "#1E3D73" : "white",
//             })}
//           >
//             {tab.label}
//           </NavLink>
//         ))}
//       </Tabs>

//       <div className="py-4">
//         {/* Render the nested routes */}
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default EmployeeDetails;
