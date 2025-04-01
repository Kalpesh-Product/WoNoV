import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const MyTaskListLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const [activeTaskList,setActiveTasklist] = useState()
  
  const { data: taskList, isLoading } = useQuery({
    queryKey: ["taskList"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/tasks/get-tasks");
        return response.data
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const dailyTaskList = taskList.filter((task) => task.taskType === 'Daily')
  const monthlyTaskList = taskList.filter((task) => task.taskType === 'Monthly')
  const additionalTaskList = taskList.filter((task) => task.taskType === 'Additonal')


  // Map routes to tabs
  const tabs = [
    { label: "Daily Tasks", path: "daily-tasks" },
    { label: "Monthly Tasks", path: "monthly-tasks" },
    { label: "Additional Tasks", path: "additional-tasks" },
  ];

  // Redirect to "assets-categories" if the current path is "/assets/categories"
  useEffect(() => {
    if (location.pathname === "/app/tasks/my-tasklist") {
      navigate("/app/tasks/my-tasklist/daily-tasks", {
        replace: true,
      });
    }
  }, [location, navigate]);

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  useEffect(()=>{

    setActiveTasklist()
  },[activeTab])

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

export default MyTaskListLayout;
