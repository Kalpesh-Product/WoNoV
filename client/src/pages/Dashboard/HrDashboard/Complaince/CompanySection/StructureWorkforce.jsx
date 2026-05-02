import React from "react";
import { PERMISSIONS } from "../../../../../constants/permissions";
import useAuth from "../../../../../hooks/useAuth";
import CompanyTabs from "./CompanyTabs";
import Unauthorized from "../../../../Unauthorized";

const StructureWorkforce = () => {
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  if (!userPermissions.includes(PERMISSIONS.HR_COMPANY_STRUCTURE_WORKFORCE_CARD.value)) return <Unauthorized redirectTo="/app/dashboard/HR-dashboard/company" title="Access Denied" message="You do not have access to the Structure & Workforce section." />;

  const hasTabPermission = [PERMISSIONS.HR_DEPARTMENTS.value,PERMISSIONS.HR_WORK_LOCATIONS.value,PERMISSIONS.HR_EMPLOYEE_TYPES.value,PERMISSIONS.HR_SHIFTS.value].some((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasTabPermission) return <Unauthorized redirectTo="/app/dashboard/HR-dashboard/company" title="Access Denied" message="You do not have access to the Structure & Workforce section." />;
  const tabs = [
    { label: "Departments", path: "departments", permission: PERMISSIONS.HR_DEPARTMENTS.value },
    { label: "Work Locations", path: "work-locations", permission: PERMISSIONS.HR_WORK_LOCATIONS.value },
    { label: "Employee Types", path: "employee-type", permission: PERMISSIONS.HR_EMPLOYEE_TYPES.value },
    { label: "Shifts", path: "shifts", permission: PERMISSIONS.HR_SHIFTS.value },
  ];

  return <CompanyTabs basePath="/app/dashboard/HR-dashboard/company/company-structure-workforce" defaultTabPath="departments" tabs={tabs} />;
};

export default StructureWorkforce;