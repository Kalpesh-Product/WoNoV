import { Navigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useTopDepartment } from "../hooks/useTopDepartment";

export default function ProtectedDepartmentRoute({ element }) {
  const { auth } = useAuth();
  const { department } = useParams();
  const { isTop } = useTopDepartment({});
  const user = auth.user;

  // Example: user.department = "HR"
  // URL = /department-tasks/IT → blocked
  console.log("protection 🛡️");
  const userDepartments = user?.departments || [];

  if (isTop) {
    return element;
  }

  const isAllowed = userDepartments.find((dept) => dept.name === department);

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace={true} />;
  }

  return element;
}
