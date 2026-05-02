import React from "react";
import { PERMISSIONS } from "../../../../../constants/permissions";
import useAuth from "../../../../../hooks/useAuth";
import CompanyTabs from "./CompanyTabs";
import Unauthorized from "../../../../Unauthorized";

const CalendarActivities = () => {
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  if (!userPermissions.includes(PERMISSIONS.HR_COMPANY_CALENDAR_ACTIVITIES_CARD.value)) return <Unauthorized redirectTo="/app/dashboard/HR-dashboard/company" title="Access Denied" message="You do not have access to the Calendar & Activities section." />;

  const hasTabPermission = [PERMISSIONS.HR_HOLIDAYS.value,PERMISSIONS.HR_EVENTS.value].some((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasTabPermission) return <Unauthorized redirectTo="/app/dashboard/HR-dashboard/company" title="Access Denied" message="You do not have access to the Calendar & Activities section." />;
  const tabs = [
    { label: "Holidays", path: "holidays", permission: PERMISSIONS.HR_HOLIDAYS.value },
    { label: "Events", path: "events", permission: PERMISSIONS.HR_EVENTS.value },
  ];

  return <CompanyTabs basePath="/app/dashboard/HR-dashboard/company/company-calendar-activities" defaultTabPath="holidays" tabs={tabs} />;
};

export default CalendarActivities;