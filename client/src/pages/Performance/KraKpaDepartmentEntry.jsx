import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import PerformanceDepartmentWiseKraKpa from "./PerformanceDepartmentWiseKraKpa";

const KraKpaDepartmentEntry = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const user = auth?.user;
  const roleTitles =
    user?.role?.map((role) => role?.roleTitle?.trim().toLowerCase()) || [];
  const departments = (user?.departments || []).filter(
    (department) => department?._id,
  );
  const isHr = roleTitles.some((role) => /^hr(?:\s|$)/.test(role));
  const isManager = roleTitles.some((role) => role.includes("manager"));
  const isEmployee = roleTitles.some((role) => role.includes("employee"));

  if (isHr || (isManager && departments.length > 1)) {
    return <PerformanceDepartmentWiseKraKpa />;
  }

  const department = departments[0];
  if (!department) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  const sharedState = {
    ...location.state,
    selectedDepartment: department._id,
    selectedDepartmentName: department.name,
  };

  if (isManager) {
    return (
      <Navigate
        to="/app/kra-kpa/department-KPA/member-wise-KPA"
        replace
        state={sharedState}
      />
    );
  }

  if (isEmployee) {
    const memberName = [user?.firstName, user?.middleName, user?.lastName]
      .filter(Boolean)
      .join(" ");
    return (
      <Navigate
        to="/app/kra-kpa/department-KPA/member-wise-KPA/individual-Monthly-KPA"
        replace
        state={{
          ...sharedState,
          selectedMember: {
            memberId: user?._id,
            memberName,
            memberRole: roleTitles.join(", "),
          },
        }}
      />
    );
  }

  return <PerformanceDepartmentWiseKraKpa />;
};

export default KraKpaDepartmentEntry;
