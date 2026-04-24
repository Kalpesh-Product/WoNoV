import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { PERMISSIONS } from "../../constants/permissions";

const AssetsLayout = () => {
  const location = useLocation();
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const canAccessAssets = userPermissions.includes(
    PERMISSIONS.SIDEBAR_ASSETS.value,
  );

  if (!canAccessAssets) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from: location,
          redirectTo: "/app/dashboard",
          title: "Access Denied",
          message: "You do not have access to the Assets module.",
        }}
      />
    );
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default AssetsLayout;

// import React from "react";
// import { Outlet } from "react-router-dom";

// const AssetsLayout = () => {
//   return (
//     <div>
//       <Outlet />
//     </div>
//   );
// };

// export default AssetsLayout;
