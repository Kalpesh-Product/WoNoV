import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const AssetsSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to "bulk-upload" if the current path is "/assets/settings"
  useEffect(() => {
    if (location.pathname === "/app/assets/settings") {
      navigate("/app/assets/settings/bulk-upload", {
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

export default AssetsSettings;
