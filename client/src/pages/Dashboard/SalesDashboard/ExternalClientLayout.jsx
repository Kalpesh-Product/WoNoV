import React from "react";
import { useLocation, useParams } from "react-router-dom";
import TabLayout from "../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../constants/permissions";

const ExternalClientLayout = () => {
  const { clientName } = useParams();
  const location = useLocation();
  const isOpenDeskView = location.pathname.includes("/open-desk/");

  const tabs = [
    {
      label: isOpenDeskView
        ? "Open Desk Client Details"
        : "External Client Details",
      path: "client-details",
      permission: isOpenDeskView
        ? PERMISSIONS.SALES_EXTERNAL_OPEN_DESK_COMPANY_CLIENT_DETAILS.value
        : PERMISSIONS.SALES_EXTERNAL_COMPANY_CLIENT_DETAILS.value,
    },
    {
      label: isOpenDeskView ? "Open Desk" : "External Meetings",
      path: "meetings",
      permission: isOpenDeskView
        ? PERMISSIONS.SALES_EXTERNAL_OPEN_DESK_COMPANY_MEETINGS.value
        : PERMISSIONS.SALES_EXTERNAL_COMPANY_MEETINGS.value,
    },
    {
      label: "Revenue",
      path: "revenue",
      permission: isOpenDeskView
        ? PERMISSIONS.SALES_EXTERNAL_OPEN_DESK_COMPANY_REVENUE.value
        : PERMISSIONS.SALES_EXTERNAL_COMPANY_REVENUE.value,
    },
    {
      label: "Members",
      path: "members",
      permission: isOpenDeskView
        ? PERMISSIONS.SALES_EXTERNAL_OPEN_DESK_COMPANY_MEMBERS.value
        : PERMISSIONS.SALES_EXTERNAL_COMPANY_MEMBERS.value,
    },
  ];

  const fullBasePath = isOpenDeskView
    ? `/app/dashboard/sales-dashboard/mix-bag/external-client/open-desk/external-companies/${encodeURIComponent(clientName)}`
    : `/app/dashboard/sales-dashboard/mix-bag/external-client/meetings/external-companies/${encodeURIComponent(clientName)}`;

  return (
    <TabLayout
      basePath={fullBasePath}
      defaultTabPath="client-details"
      tabs={tabs}
    />
  );
};

export default ExternalClientLayout;
