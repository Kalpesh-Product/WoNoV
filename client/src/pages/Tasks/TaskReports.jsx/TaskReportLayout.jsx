import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "@mui/material";

const TaskReportLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
    { label: "My Task Reports", path: "my-task-reports" },
    { label: "Assigned Task Reports", path: "assigned-task-reports" },
    { label: "Department Task Reports", path: "department-task-reports" },
  ];

  // Redirect to "assets-categories" if the current path is "/assets/categories"
  useEffect(() => {
    if (location.pathname === "/app/tasks/reports") {
      navigate("/app/tasks/reports/my-task-reports", {
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

      <div className="py-4">
        <Outlet />
      </div>
    </div>
  );
};

export default TaskReportLayout;
