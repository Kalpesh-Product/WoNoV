import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const PerformancePermissionRoute = ({
  element,
  permissions = [],
  mode = "any",
}) => {
  const { auth } = useAuth();
  const location = useLocation();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  const normalizedPermissions = permissions
    .map((permission) => permission?.value || permission)
    .filter(Boolean);

  if (!normalizedPermissions.length) {
    return element;
  }

  const hasAccess =
    mode === "all"
      ? normalizedPermissions.every((permission) =>
          userPermissions.includes(permission)
        )
      : normalizedPermissions.some((permission) =>
          userPermissions.includes(permission)
        );

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return element;
};

export default PerformancePermissionRoute;