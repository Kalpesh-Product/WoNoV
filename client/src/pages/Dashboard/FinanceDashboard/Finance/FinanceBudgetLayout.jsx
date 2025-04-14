import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const FinanceBudgetLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
    { label: "Budget", path: "budget" },
    { label: "Dept. Wise Budget", path: "dept-wise-budget" },
    { label: "Payment Schedule", path: "payment-schedule" },
    { label: "Collections", path: "collections" },
    { label: "Statuory Payments", path: "statutory-payments" },
    { label: "Landlord Payments", path: "landlord-payments" },
  ];

  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"
  useEffect(() => {
    if (location.pathname === "/app/dashboard/finance-dashboard/finance") {
      navigate("/app/dashboard/finance-dashboard/finance/budget", {
        replace: true,
      });
    }
  }, [location, navigate]);

  // Determine whether to show the tabs
  const showTabs = !location.pathname.includes("view-clients/");

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
    <>
      <div className="p-4">
        {/* Render tabs only if the current route is not EmployeeDetails */}
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
                backgroundColor: "#1E3D73",
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
        )}
      </div>
      <div className="p-4">
        <Outlet />
      </div>
    </>
  );
};

export default FinanceBudgetLayout;
