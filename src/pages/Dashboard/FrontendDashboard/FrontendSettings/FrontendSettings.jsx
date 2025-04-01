import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const FrontendSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to "bulk-upload" if the current path is "/frontend-dashboard/settings"
  useEffect(() => {
    if (location.pathname === "/app/dashboard/frontend-dashboard/settings") {
      navigate("/app/dashboard/frontend-dashboard/settings/bulk-upload", {
        replace: true,
      });
    }
  }, [location, navigate]);

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default FrontendSettings;
