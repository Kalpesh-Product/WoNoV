import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const SidebarDropdown = ({ permissions = [], children }) => {
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const hasAccess = permissions.every((permission) =>
    userPermissions.includes(permission),
  );

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default SidebarDropdown;
