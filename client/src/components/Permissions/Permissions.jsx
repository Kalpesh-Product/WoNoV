import React from "react";
import useAuth from "../../hooks/useAuth";

const Permissions = ({
  permissions,
  mode = "any",
  fallback = null,
  children,
}) => {
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  console.log("user permissions ss ", userPermissions);

  if (!permissions || !Array.isArray(permissions)) return null;

  // Normalize permissions to array of strings
  const normalizedPermissions = permissions.map((perm) => perm?.value);
  console.log("normalizeds : ", normalizedPermissions);

  const hasAccess =
    mode === "all"
      ? normalizedPermissions.every((perm) => userPermissions.includes(perm))
      : normalizedPermissions.some((perm) => userPermissions.includes(perm));

  return hasAccess ? <>{children}</> : undefined;
};

export default Permissions;
