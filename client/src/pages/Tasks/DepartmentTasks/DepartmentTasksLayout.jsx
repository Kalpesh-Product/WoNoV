import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTopDepartment } from "../../../hooks/useTopDepartment";
import { setSelectedDepartment } from "../../../redux/slices/performanceSlice";
import useAuth from "../../../hooks/useAuth";

const DepartmentTasksLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { auth } = useAuth();
  const navigate = useNavigate();
   const currentDepartmentId = auth.user?.departments?.[0]?._id;
  const currentDepartment = auth.user?.departments?.[0]?.name;


  // Map routes to tabs
  const tabs = [
    { label: "Employee On-Boarding", path: ":/month" },
    { label: "View Employees", path: "view-employees" },
    { label: "Attendance", path: "attendance" },
    { label: "Leaves", path: "leaves" },
  ];

  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"


  // Determine whether to show the tabs
  const showTabs = !location.pathname.includes("department-tasks");

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
    <div className="p-4">
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
              backgroundColor: "#1E3D73", // Highlight background color for the active tab
              color: "white",
            },
          }}
        >
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
              })}
            >
              {tab.label}
            </NavLink>
          ))}
        </Tabs>
      )}

      <div className="py-0 bg-white">
        {/* Render the nested routes */}
        <Outlet />
      </div>
    </div>
  );
};

export default DepartmentTasksLayout;
