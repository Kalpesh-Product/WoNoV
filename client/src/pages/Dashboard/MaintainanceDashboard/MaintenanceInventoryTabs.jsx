// -------------------- For Admin,IT,Maintainance Dashboard Invenotry -------------------
import TabLayout from "../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../constants/permissions";
import { useLocation } from "react-router-dom";

export const getInventoryCardConfig = (pathname) => {
  if (pathname.includes("/app/dashboard/admin-dashboard/inventory")) {
    return {
      basePath: "/app/dashboard/admin-dashboard/inventory",
      listPermission: PERMISSIONS.ADMIN_OVERALL_INVENTORY_TAB.value,
      categoryPermission: PERMISSIONS.ADMIN_INVENTORY_CATEGORY_TAB.value,
      itemPermission: PERMISSIONS.ADMIN_INVENTORY_ITEM_TAB.value,
      sunteckPermission: PERMISSIONS.ADMIN_INVENTORY_SUNTECK_UNITS_TABS.value,
      dempoPermission: PERMISSIONS.ADMIN_INVENTORY_DEMPO_TRADE_CENTRE_UNITS_TABS.value,
      cardPermissions: {
        overall: PERMISSIONS.ADMIN_OVERALL_INVENTORY_CARD.value,
        sunteck: PERMISSIONS.ADMIN_OVERALL_ST_INVENTORY_CARD.value,
        dempo: PERMISSIONS.ADMIN_OVERALL_DTC_INVENTORY_CARD.value,
        categoryItem: PERMISSIONS.ADMIN_INVENTORY_CATEGORY_ITEM_CARD.value,
      },
    };
  }

  if (pathname.includes("/app/dashboard/IT-dashboard/inventory")) {
    return {
      basePath: "/app/dashboard/IT-dashboard/inventory",
      listPermission: PERMISSIONS.IT_OVERALL_INVENTORY_TAB.value,
      categoryPermission: PERMISSIONS.IT_INVENTORY_CATEGORY_TAB.value,
      itemPermission: PERMISSIONS.IT_INVENTORY_ITEM_TAB.value,
      sunteckPermission: PERMISSIONS.IT_INVENTORY_SUNTECK_UNITS_TABS.value,
      dempoPermission: PERMISSIONS.IT_INVENTORY_DEMPO_TRADE_CENTRE_UNITS_TABS.value,
      cardPermissions: {
        overall: PERMISSIONS.IT_OVERALL_INVENTORY_CARD.value,
        sunteck: PERMISSIONS.IT_OVERALL_ST_INVENTORY_CARD.value,
        dempo: PERMISSIONS.IT_OVERALL_DTC_INVENTORY_CARD.value,
        categoryItem: PERMISSIONS.IT_INVENTORY_CATEGORY_ITEM_CARD.value,
      },
    };
  }

  return {
    basePath: "/app/dashboard/maintenance-dashboard/inventory",
    listPermission: PERMISSIONS.MAINTENANCE_OVERALL_INVENTORY_TAB.value,
    categoryPermission: PERMISSIONS.MAINTENANCE_INVENTORY_CATEGORY_TAB.value,
    itemPermission: PERMISSIONS.MAINTENANCE_INVENTORY_ITEM_TAB.value,
    sunteckPermission: PERMISSIONS.MAINTENANCE_INVENTORY_SUNTECK_UNITS_TABS.value,
    dempoPermission: PERMISSIONS.MAINTENANCE_INVENTORY_DEMPO_TRADE_CENTRE_UNITS_TABS.value,
    cardPermissions: {
      overall: PERMISSIONS.MAINTENANCE_OVERALL_INVENTORY_CARD.value,
      sunteck: PERMISSIONS.MAINTENANCE_OVERALL_ST_INVENTORY_CARD.value,
      dempo: PERMISSIONS.MAINTENANCE_OVERALL_DTC_INVENTORY_CARD.value,
      categoryItem: PERMISSIONS.MAINTENANCE_INVENTORY_CATEGORY_ITEM_CARD.value,
    },
  };
};

const MaintenanceInventoryTabs = () => {
  const location = useLocation();
  const dashboardConfig = getInventoryCardConfig(location.pathname);

  const isCategoryOrItemPath = /\/inventory\/(category|item)$/i.test(
    location.pathname,
  );
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
  ].filter((tab) =>
    isCategoryOrItemPath
      ? ["category", "item"].includes(tab.path)
      : !["category", "item"].includes(tab.path),
  );

  return (
    <TabLayout
      basePath={dashboardConfig.basePath}
      defaultTabPath={
        location.pathname === dashboardConfig.basePath
          ? undefined
          : "overall-inventory"
      }
      tabs={tabs}
      contentClassName="pt-2"
      hideTabsCondition={(pathname) =>
        pathname === dashboardConfig.basePath ||
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
// -------------------- For Admin,IT,Maintainance Dashboard Invenotry -------------------
// import TabLayout from "../../../components/Tabs/TabLayout";
// import { PERMISSIONS } from "../../../constants/permissions";
// import useAuth from "../../../hooks/useAuth";
// import { useLocation } from "react-router-dom";

// const MaintenanceInventoryTabs = () => {
//   const { auth } = useAuth();
//   const location = useLocation();
//   const userPermissions = auth?.user?.permissions?.permissions || [];

//   const dashboardConfig = (() => {
//     if (location.pathname.includes("/app/dashboard/admin-dashboard/inventory")) {
//       return {
//         basePath: "/app/dashboard/admin-dashboard/inventory",
//         listPermission: PERMISSIONS.ADMIN_OVERALL_INVENTORY_TAB.value,
//         categoryPermission: PERMISSIONS.ADMIN_INVENTORY_CATEGORY_TAB.value,
//         itemPermission: PERMISSIONS.ADMIN_INVENTORY_ITEM_TAB.value,
//         sunteckPermission: PERMISSIONS.ADMIN_INVENTORY_SUNTECK_UNITS_TABS.value,
//         dempoPermission: PERMISSIONS.ADMIN_INVENTORY_DEMPO_TRADE_CENTRE_UNITS_TABS.value,
//       };
//     }

//     if (location.pathname.includes("/app/dashboard/IT-dashboard/inventory")) {
//       return {
//         basePath: "/app/dashboard/IT-dashboard/inventory",
//         listPermission: PERMISSIONS.IT_OVERALL_INVENTORY_TAB.value,
//         categoryPermission: PERMISSIONS.IT_INVENTORY_CATEGORY_TAB.value,
//         itemPermission: PERMISSIONS.IT_INVENTORY_ITEM_TAB.value,
//         sunteckPermission: PERMISSIONS.IT_INVENTORY_SUNTECK_UNITS_TABS.value,
//         dempoPermission: PERMISSIONS.IT_INVENTORY_DEMPO_TRADE_CENTRE_UNITS_TABS.value,
//       };
//     }

//     return {
//       basePath: "/app/dashboard/maintenance-dashboard/inventory",
//       listPermission: PERMISSIONS.MAINTENANCE_OVERALL_INVENTORY_TAB.value,
//       categoryPermission: PERMISSIONS.MAINTENANCE_INVENTORY_CATEGORY_TAB.value,
//       itemPermission: PERMISSIONS.MAINTENANCE_INVENTORY_ITEM_TAB.value,
//       sunteckPermission: PERMISSIONS.MAINTENANCE_INVENTORY_SUNTECK_UNITS_TABS.value,
//       dempoPermission: PERMISSIONS.MAINTENANCE_INVENTORY_DEMPO_TRADE_CENTRE_UNITS_TABS.value,
//     };
//   })();

//   const tabs = [
//     {
//       label: "Overall Inventory",
//       path: "overall-inventory",
//       permission: dashboardConfig.listPermission,
//     },
//     {
//       label: "Category",
//       path: "category",
//       permission: dashboardConfig.categoryPermission,
//     },
//     {
//       label: "Item",
//       path: "item",
//       permission: dashboardConfig.itemPermission,
//     },
//     {
//       label: "Sunteck Kanaka Units",
//       path: "sunteck-kanaka-units",
//       permission: dashboardConfig.sunteckPermission,
//     },
//     {
//       label: "Dempo Trade Center",
//       path: "dempo-trade-center",
//       permission: dashboardConfig.dempoPermission,
//     },
//   ].filter((tab) => userPermissions.includes(tab.permission));

//   return (
//     <TabLayout
//       basePath={dashboardConfig.basePath}
//       defaultTabPath="overall-inventory"
//       tabs={tabs}
//       contentClassName="pt-2"
//       hideTabsCondition={(pathname) =>
//         /\/inventory\/(overall-inventory\/[^/]+|sunteck-kanaka-units\/[^/]+(\/[^/]+)?|dempo-trade-center\/[^/]+(\/[^/]+)?)$/i.test(
//           pathname,
//         )
//       }
//       hideTabsOnPaths={[
//         "/inventory/sunteck-kanaka-units/",
//         "/inventory/dempo-trade-center/",
//       ]}
//     />
//   );
// };

// export default MaintenanceInventoryTabs;

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
