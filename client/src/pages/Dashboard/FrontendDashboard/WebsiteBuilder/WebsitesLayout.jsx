import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const WebsitesLayout = () => {
  // Map routes to tabs
  const tabs = [
    {
      label: "Active",
      path: "active",
      permission: PERMISSIONS.FRONTEND_ACTIVE_WEBSITES.value,
    },
    {
      label: "InActive",
      path: "inactive",
      permission: PERMISSIONS.FRONTEND_INACTIVE_WEBSITES.value,
    },
  ];

  return (
    <TabLayout
      tabs={tabs}
      basePath={"/app/dashboard/frontend-dashboard/websites"}
      defaultTabPath={"active"}
      scrollable={true}
      hideTabsOnPaths={["/app/dashboard/frontend-dashboard/websites/active/"]}
    />
  );
};

export default WebsitesLayout;
