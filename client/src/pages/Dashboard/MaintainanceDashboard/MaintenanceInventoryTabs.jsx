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
        sunteckPermission: PERMISSIONS.ADMIN_INVENTORY_SUNTECK_UNITS.value,
        dempoPermission: PERMISSIONS.ADMIN_INVENTORY_DEMPO_UNITS.value,
      };
    }

    if (location.pathname.includes("/app/dashboard/IT-dashboard/inventory")) {
      return {
        basePath: "/app/dashboard/IT-dashboard/inventory",
        sunteckPermission: PERMISSIONS.IT_INVENTORY_SUNTECK_UNITS.value,
        dempoPermission: PERMISSIONS.IT_INVENTORY_DEMPO_UNITS.value,
      };
    }

    return {
      basePath: "/app/dashboard/maintenance-dashboard/inventory",
      sunteckPermission: PERMISSIONS.MAINTENANCE_INVENTORY_SUNTECK_UNITS.value,
      dempoPermission: PERMISSIONS.MAINTENANCE_INVENTORY_DEMPO_UNITS.value,
    };
  })();

  const tabs = [
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
      defaultTabPath="sunteck-kanaka-units"
      tabs={tabs}
      hideTabsCondition={(pathname) =>
         /\/inventory\/(sunteck-kanaka-units|dempo-trade-center)\/[^/]+(\/[^/]+)?$/i.test(
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