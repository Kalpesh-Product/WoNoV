import React from "react";
import useAuth from "../../hooks/useAuth";

const Permissions = ({ permissions, mode = "any", fallback = null, children }) => {
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions || [];
  console.log("perms : ", userPermissions);

  if (!permissions || !Array.isArray(permissions)) return null;

  const hasAccess =
    mode === "all"
      ? permissions.every((perm) => userPermissions.includes(perm))
      : permissions.some((perm) => userPermissions.includes(perm));

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default Permissions;
