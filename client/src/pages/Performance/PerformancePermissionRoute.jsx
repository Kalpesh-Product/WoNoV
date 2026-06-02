import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const PerformancePermissionRoute = ({
  element,
  permissions = [],
  mode = "any",
  allowedRoleTitles = [],
}) => {
  const { auth } = useAuth();
  const location = useLocation();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const userRoleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];

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

  const normalizedRoleTitles = allowedRoleTitles
    .map((roleTitle) => roleTitle?.toLowerCase())
    .filter(Boolean);

  const hasRoleAccess =
    normalizedRoleTitles.length === 0 ||
    normalizedRoleTitles.some((roleTitle) => userRoleTitles.includes(roleTitle));

  if (!hasAccess || !hasRoleAccess) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return element;
};

export default PerformancePermissionRoute;
