import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const VisitorSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to "bulk-upload" if the current path is "/visitors/settings"
  useEffect(() => {
    if (location.pathname === "/app/visitors/settings") {
      navigate("/app/visitors/settings/bulk-upload", {
        replace: true,
      });
    }
  }, [location, navigate]);

  return (
    <div className="p-2 mb-32">
      <Outlet />
    </div>
  );
};

export default VisitorSettings;
