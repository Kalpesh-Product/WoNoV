import Card from "../../components/Card";
import WidgetSection from "../../components/WidgetSection";
import { PERMISSIONS } from "../../constants/permissions";
import useAuth from "../../hooks/useAuth";
import TabLayout from "../../components/Tabs/TabLayout";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AssetsMixBag = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  const isVendorSection = location.pathname.includes("/app/assets/mix-bag/vendor");

  const hasMixBagAccess = userPermissions.includes(PERMISSIONS.ASSETS_MIX_BAG.value);
  const hasVendorAccess = userPermissions.includes(PERMISSIONS.ASSETS_MIX_BAG_VENDOR.value);

  if (!hasMixBagAccess) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  const routes = [
    {
      title: "Asset Vendor",
      route: "/app/assets/mix-bag/vendor",
      permission: PERMISSIONS.ASSETS_MIX_BAG_VENDOR.value,
    },
  ];

  const accessibleRoutes = routes.filter((route) =>
    userPermissions.includes(route.permission),
  );

  const tabs = [
    {
      label: "Asset Vendor",
      path: "vendor",
      permission: PERMISSIONS.ASSETS_MIX_BAG_VENDOR.value,
    },
  ];

  if (!isVendorSection && accessibleRoutes.length === 0) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  if (isVendorSection && !hasVendorAccess) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  if (isVendorSection) {
    return (
      <TabLayout
        basePath="/app/assets/mix-bag"
        tabs={tabs}
        defaultTabPath="vendor"
      />
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="h-[50vh] uppercase">
        <WidgetSection key={routes.length} layout={2} padding>
          {accessibleRoutes.map(
            (route, index) =>
              userPermissions.includes(route.permission) && (
                <Card
                  fullHeight
                  key={index}
                  title={route.title}
                  route={route.route}
                />
              ),
          )}
        </WidgetSection>
      </div>
      <Outlet />
    </div>
  );
};

export default AssetsMixBag;


// import Card from "../../components/Card";
// import WidgetSection from "../../components/WidgetSection";
// import { PERMISSIONS } from "../../constants/permissions";
// import useAuth from "../../hooks/useAuth";

// const AssetsMixBag = () => {
//     const { auth } = useAuth();
//     const userPermissions = auth?.user?.permissions?.permissions || [];
//     const routes = [
//         {
//             title: "vendor",
//             route: "/app/assets/mix-bag/vendor",
//             permission: PERMISSIONS.ASSETS_MIX_BAG_VENDOR.value,
//         },
//     ];

//     return (
//         <div className="p-4 flex flex-col gap-4">
//             <div className="h-[50vh] uppercase">
//                 <WidgetSection key={routes.length} layout={2} padding>
//                     {routes.map((route, index) => (
//                         userPermissions.includes(route.permission) && (
//                             <Card fullHeight key={index} title={route.title} route={route.route} />
//                         )
//                     ))}
//                 </WidgetSection>
//             </div>
//         </div>
//     );
// };

// export default AssetsMixBag;