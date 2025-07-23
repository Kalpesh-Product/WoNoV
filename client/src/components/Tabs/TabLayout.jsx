import { useEffect } from "react";
import { Tabs } from "@mui/material";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import useIsMobile from "../../hooks/useIsMobile";
import { AnimatePresence, motion } from "motion/react";

const TabLayout = ({
  basePath,
  tabs = [],
  defaultTabPath,
  hideTabsCondition = () => false,
  hideTabsOnPaths = [],
  scrollable = false, // ✅ NEW PROP
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);

  // Redirect to default tab if on basePath
  useEffect(() => {
    if (location.pathname === basePath && defaultTabPath) {
      navigate(`${basePath}/${defaultTabPath}`, { replace: true });
    }
  }, [location, navigate, basePath, defaultTabPath]);

  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );
  const tabPercent = 100 / tabs.length;

  const showTabs =
    !hideTabsCondition(location.pathname) &&
    !hideTabsOnPaths.some((path) => location.pathname.includes(path));

  return (
    <div className="p-4">
      {showTabs && (
        <Tabs
          value={activeTab}
          variant={
            scrollable || isMobile ? "scrollable" : "fullWidth"
          } // ✅ Respect `scrollable` for desktop
          scrollButtons={scrollable || isMobile ? "auto" : false} // ✅ Show scroll buttons
          TabIndicatorProps={{ style: { display: "none" } }}
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            border: "1px solid #d1d5db",
            overflowX: scrollable || isMobile ? "auto" : "hidden",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: "medium",
              padding: "12px 16px",
              borderRight: "0.1px solid #d1d5db",
              minWidth: scrollable || isMobile ? "160px" : `${tabPercent}%`,
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
              className="border-r-[1px] border-borderGray"
              to={`${basePath}/${tab.path}`}
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "white" : "#1E3D73",
                textAlign: "center",
                padding: "12px 16px",
                display: "block",
                backgroundColor: isActive ? "#1E3D73" : "white",
                minWidth: scrollable || isMobile ? "160px" : "auto", // ✅ fixed width
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
