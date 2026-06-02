import { Navigate, useLocation, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useTopDepartment } from "../hooks/useTopDepartment";

export default function ProtectedDepartmentRoute({
  element,
  allowHrForPerformance = false,
  allowAdminForPerformance = false,
}) {
  const { auth } = useAuth();
  const { department } = useParams();
  const location = useLocation();
  const { isTop } = useTopDepartment({});
  const user = auth.user;

  // Example: user.department = "HR"
  // URL = /department-tasks/IT → blocked
  console.log("protection 🛡️");
  const userDepartments = user?.departments || [];
  const userRoleTitles =
    user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];

  const isHrUser = userDepartments.some(
    (dept) => dept.name?.toLowerCase() === "hr"
  );
  const isAdminUser = userRoleTitles.some((roleTitle) =>
    roleTitle?.endsWith("admin"),
  );
  const isPerformanceRoute =
    allowHrForPerformance && location.pathname.includes("/performance");

  if (
    isTop ||
    (isHrUser && isPerformanceRoute) ||
    (allowAdminForPerformance && isPerformanceRoute && isAdminUser)
  ) {
    return element;
  }

  const isAllowed = userDepartments.find((dept) => dept.name === department);

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace={true} />;
  }

  return element;
}
