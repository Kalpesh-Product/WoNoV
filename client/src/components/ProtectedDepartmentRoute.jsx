import { Navigate, useLocation, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useTopDepartment } from "../hooks/useTopDepartment";

export default function ProtectedDepartmentRoute({
  element,
  allowHrForPerformance = false,
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

  const isHrUser = userDepartments.some(
    (dept) => dept.name?.toLowerCase() === "hr"
  );
  const isPerformanceRoute =
    allowHrForPerformance && location.pathname.includes("/performance");

  if (isTop || (isHrUser && isPerformanceRoute)) {
    return element;
  }

  const isAllowed = userDepartments.find((dept) => dept.name === department);

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace={true} />;
  }

  return element;
}
