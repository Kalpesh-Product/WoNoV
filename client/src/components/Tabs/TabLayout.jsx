import { useEffect, useMemo } from "react"; // 🆕 added useMemo
import { Tabs } from "@mui/material";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import useIsMobile from "../../hooks/useIsMobile"; // adjust the path
import { AnimatePresence, motion } from "motion/react";
import useAuth from "../../hooks/useAuth"; // 🆕 added

const TabLayout = ({
  basePath,
  tabs = [],
  defaultTabPath,
  hideTabsCondition = () => false,
  hideTabsOnPaths = [], // NEW PROP
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);
  const { auth } = useAuth(); // 🆕 get user
  const userPermissions = auth?.user?.permissions?.permissions || []; // 🆕

  // 🧠 Filter tabs based on permissions
  const filteredTabs = useMemo(() => {
    return tabs.filter(
      (tab) => !tab.permission || userPermissions.includes(tab.permission)
    );
  }, [tabs, userPermissions]);

  // 🧠 Check if current path is authorized
  const isAuthorized = useMemo(() => {
    const currentTab = tabs.find((tab) => location.pathname.includes(tab.path));
    if (!currentTab) return true;
    return (
      !currentTab.permission || userPermissions.includes(currentTab.permission)
    );
  }, [tabs, location.pathname, userPermissions]);

  // Redirect to first allowed default tab if on basePath
  useEffect(() => {
    if (
      location.pathname === basePath &&
      defaultTabPath &&
      filteredTabs.length > 0
    ) {
      navigate(`${basePath}/${filteredTabs[0].path}`, { replace: true });
    }
  }, [location, navigate, basePath, defaultTabPath, filteredTabs]);

  const activeTab = filteredTabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );
  const tabPercent = 100 / filteredTabs.length;

  const showTabs =
    !hideTabsCondition(location.pathname) &&
    !hideTabsOnPaths.some((path) => location.pathname.includes(path));

  if (!isAuthorized) {
    return null; // Or show an "Unauthorized" message wrapper
  }

  return (
    <div className="p-4">
      {showTabs && filteredTabs.length > 0 && (
        <Tabs
          value={activeTab === -1 ? false : activeTab}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          TabIndicatorProps={{ style: { display: "none" } }}
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            border: "1px solid #d1d5db",
            overflowX: isMobile ? "auto" : "hidden",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: "medium",
              padding: "12px 16px",
              borderRight: "0.1px solid #d1d5db",
              minWidth: isMobile ? "fit-content" : "auto",
            },
            "& .Mui-selected": {
              backgroundColor: "#1E3D73",
              color: "white",
            },
          }}
        >
          {filteredTabs.map((tab, index) => (
            <NavLink
              key={index}
              className="border-r-[1px] border-borderGray"
              to={`${basePath}/${tab.path}`}
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "white" : "#1E3D73",
                textAlign: "center",
                padding: "12px 16px",
                display: "block",
                backgroundColor: isActive ? "#1E3D73" : "white",
                minWidth: isMobile ? "70%" : `${tabPercent}%`,
              })}
            >
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

export default TabLayout;
