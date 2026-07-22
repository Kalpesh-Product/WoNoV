// -------------------- For Admin,IT,Maintainance Dashboard Invenotry -------------------
import TabLayout from "../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../constants/permissions";
import useAuth from "../../../hooks/useAuth";
import { useLocation } from "react-router-dom";

const MaintenanceInventoryTabs = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  const dashboardConfig = (() => {
    if (location.pathname.includes("/app/dashboard/admin-dashboard/inventory")) {
      return {
        basePath: "/app/dashboard/admin-dashboard/inventory",
        listPermission: PERMISSIONS.ADMIN_OVERALL_INVENTORY_TAB.value,
        categoryPermission: PERMISSIONS.ADMIN_INVENTORY_CATEGORY_TAB.value,
        itemPermission: PERMISSIONS.ADMIN_INVENTORY_ITEM_TAB.value,
        sunteckPermission: PERMISSIONS.ADMIN_INVENTORY_SUNTECK_UNITS_TABS.value,
        dempoPermission: PERMISSIONS.ADMIN_INVENTORY_DEMPO_TRADE_CENTRE_UNITS_TABS.value,
      };
    }

    if (location.pathname.includes("/app/dashboard/IT-dashboard/inventory")) {
      return {
        basePath: "/app/dashboard/IT-dashboard/inventory",
        listPermission: PERMISSIONS.IT_OVERALL_INVENTORY_TAB.value,
        categoryPermission: PERMISSIONS.IT_INVENTORY_CATEGORY_TAB.value,
        itemPermission: PERMISSIONS.IT_INVENTORY_ITEM_TAB.value,
        sunteckPermission: PERMISSIONS.IT_INVENTORY_SUNTECK_UNITS_TABS.value,
        dempoPermission: PERMISSIONS.IT_INVENTORY_DEMPO_TRADE_CENTRE_UNITS_TABS.value,
      };
    }

    return {
      basePath: "/app/dashboard/maintenance-dashboard/inventory",
      listPermission: PERMISSIONS.MAINTENANCE_OVERALL_INVENTORY_TAB.value,
      categoryPermission: PERMISSIONS.MAINTENANCE_INVENTORY_CATEGORY_TAB.value,
      itemPermission: PERMISSIONS.MAINTENANCE_INVENTORY_ITEM_TAB.value,
      sunteckPermission: PERMISSIONS.MAINTENANCE_INVENTORY_SUNTECK_UNITS_TABS.value,
      dempoPermission: PERMISSIONS.MAINTENANCE_INVENTORY_DEMPO_TRADE_CENTRE_UNITS_TABS.value,
    };
  })();

  const tabs = [
    {
      label: "Overall Inventory",
      path: "overall-inventory",
      permission: dashboardConfig.listPermission,
    },
    {
      label: "Category",
      path: "category",
      permission: dashboardConfig.categoryPermission,
    },
    {
      label: "Item",
      path: "item",
      permission: dashboardConfig.itemPermission,
    },
    {
      label: "Sunteck Kanaka Units",
      path: "sunteck-kanaka-units",
      permission: dashboardConfig.sunteckPermission,
    },
    {
      label: "Dempo Trade Center",
      path: "dempo-trade-center",
      permission: dashboardConfig.dempoPermission,
    },
  ].filter((tab) => userPermissions.includes(tab.permission));

  return (
    <TabLayout
      basePath={dashboardConfig.basePath}
      defaultTabPath="overall-inventory"
      tabs={tabs}
      contentClassName="pt-2"
      hideTabsCondition={(pathname) =>
        /\/inventory\/(overall-inventory\/[^/]+|sunteck-kanaka-units\/[^/]+(\/[^/]+)?|dempo-trade-center\/[^/]+(\/[^/]+)?)$/i.test(
          pathname,
        )
      }
      hideTabsOnPaths={[
        "/inventory/sunteck-kanaka-units/",
        "/inventory/dempo-trade-center/",
      ]}
    />
  );
};

export default MaintenanceInventoryTabs;

// ----------------- Only For Admin ---------------------------
// import TabLayout from "../../../components/Tabs/TabLayout";
// import { PERMISSIONS } from "../../../constants/permissions";
// import useAuth from "../../../hooks/useAuth";

// const MaintenanceInventoryTabs = () => {
//   const { auth } = useAuth();
//   const userPermissions = auth?.user?.permissions?.permissions || [];

//   const tabs = [
//     {
//       label: "Sunteck Kanaka Units",
//       path: "sunteck-kanaka-units",
//       permission: PERMISSIONS.MAINTENANCE_INVENTORY_SUNTECK_UNITS.value,
//     },
//     {
//       label: "Dempo Trade Center",
//       path: "dempo-trade-center",
//       permission: PERMISSIONS.MAINTENANCE_INVENTORY_DEMPO_UNITS.value,
//     },
//   ]
//     .filter((tab) => userPermissions.includes(tab.permission));

//   return (
//     <TabLayout
//       basePath="/app/dashboard/maintenance-dashboard/inventory"
//       defaultTabPath="sunteck-kanaka-units"
//       tabs={tabs}
//       hideTabsCondition={(pathname) =>
//         /\/inventory\/(sunteck-kanaka-units|dempo-trade-center)\/[^/]+$/i.test(
//           pathname,
//         )
//       }
//     />
//   );
// };

// export default MaintenanceInventoryTabs;
