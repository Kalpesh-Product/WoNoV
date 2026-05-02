import React from "react";
import { PERMISSIONS } from "../../../../../constants/permissions";
import useAuth from "../../../../../hooks/useAuth";
import CompanyTabs from "./CompanyTabs";
import Unauthorized from "../../../../Unauthorized";

const CompanySettings = () => {
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  if (!userPermissions.includes(PERMISSIONS.HR_COMPANY_SETTINGS_CARD.value)) return <Unauthorized redirectTo="/app/dashboard/HR-dashboard/company" title="Access Denied" message="You do not have access to the Company Settings section." />;

  const hasTabPermission = [PERMISSIONS.HR_COMPANY_LOGO.value,PERMISSIONS.HR_COMPANY_HANDBOOK.value,PERMISSIONS.HR_COMPANY_POLICIES.value,PERMISSIONS.HR_COMPANY_SOPS.value].some((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasTabPermission) return <Unauthorized redirectTo="/app/dashboard/HR-dashboard/company" title="Access Denied" message="You do not have access to the Company Settings section." />;
  const tabs = [
    { label: "Company Logo", path: "company-logo", permission: PERMISSIONS.HR_COMPANY_LOGO.value },
    { label: "Company Handbook", path: "company-handbook", permission: PERMISSIONS.HR_COMPANY_HANDBOOK.value },
    { label: "Company Policies", path: "policies", permission: PERMISSIONS.HR_COMPANY_POLICIES.value },
    { label: "Company SOPs", path: "sops", permission: PERMISSIONS.HR_COMPANY_SOPS.value },
  ];

  return <CompanyTabs basePath="/app/dashboard/HR-dashboard/company/company-settings" defaultTabPath="company-logo" tabs={tabs} />;
};

export default CompanySettings;