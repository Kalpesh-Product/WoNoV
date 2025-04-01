
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const HrSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"
  useEffect(() => {
    if (location.pathname === "/app/dashboard/HR-dashboard/settings") {
      navigate("/app/dashboard/HR-dashboard/settings/bulk-upload", {
        replace: true,
      });
    }
  }, [location, navigate]);

  // Determine whether to show the tabs
  // const showTabs = !location.pathname.includes("budget/");

  // Determine active tab based on location
  // const activeTab = tabs.findIndex((tab) =>
  //   location.pathname.includes(tab.path)
  // );

  return (
    <div className="p-4">
      {/* Render tabs only if the current route is not EmployeeDetails */}
      

      <div className="py-4">
        <Outlet />
      </div>
    </div>
  );
};

export default HrSettings;
