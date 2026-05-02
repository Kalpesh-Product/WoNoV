
import React from "react";
import { PERMISSIONS } from "../../../../../constants/permissions";
import useAuth from "../../../../../hooks/useAuth";
import CompanyTabs from "./CompanyTabs";
import Unauthorized from "../../../../Unauthorized";

const TemplatesConfiguration = () => {
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  if (!userPermissions.includes(PERMISSIONS.HR_COMPANY_TEMPLATES_CONFIGURATION_CARD.value)) return <Unauthorized redirectTo="/app/dashboard/HR-dashboard/company" title="Access Denied" message="You do not have access to the Templates Configuration section." />;

  const hasTabPermission = [PERMISSIONS.HR_TEMPLATES.value].some((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasTabPermission) return <Unauthorized redirectTo="/app/dashboard/HR-dashboard/company" title="Access Denied" message="You do not have access to the Templates Configuration section." />;
  const tabs = [{ label: "Templates", path: "templates", permission: PERMISSIONS.HR_TEMPLATES.value }];

  return <CompanyTabs basePath="/app/dashboard/HR-dashboard/company/company-templates-configuration" defaultTabPath="templates" tabs={tabs} />;
};

export default TemplatesConfiguration;