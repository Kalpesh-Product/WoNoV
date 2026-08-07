import WidgetSection from "../../../components/WidgetSection";
import Card from "../../../components/Card";
import useAuth from "../../../hooks/useAuth";
import { PERMISSIONS } from "../../../constants/permissions";

const MaintenanceMixBag = () => {
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  const routes = [
    {
      title: "ST Energy – Daily Reading",
      route: "/app/dashboard/maintenance-dashboard/mix-bag/st-energy-daily-reading",
      permission: PERMISSIONS.MAINTENANCE_ST_ENERGY_DAILY_READING.value,
    },
    {
      title: "DTC Energy – Daily Reading",
      route: "/app/dashboard/maintenance-dashboard/mix-bag/dtc-energy-daily-reading",
      permission: PERMISSIONS.MAINTENANCE_DTC_ENERGY_DAILY_READING.value,
    },
    {
      title: "ST Energy – Monthly Reading",
      route: "/app/dashboard/maintenance-dashboard/mix-bag/st-energy-monthly-reading",
      permission: PERMISSIONS.MAINTENANCE_ST_ENERGY_MONTHLY_READING.value,
    },
    {
      title: "DTC Energy – Monthly Reading",
      route: "/app/dashboard/maintenance-dashboard/mix-bag/dtc-energy-monthly-reading",
      permission: PERMISSIONS.MAINTENANCE_DTC_ENERGY_MONTHLY_READING.value,
    },
    {
      title: "Team Members Schedule",
      route: "/app/dashboard/maintenance-dashboard/mix-bag/team-members-schedule",
      permission: PERMISSIONS.MAINTENANCE_TEAM_MEMBERS_SCHEDULE.value,
    },
  ];

  const filteredRoutes = routes.filter((route) => {
    const hasPermission =
      !route.permission || userPermissions.includes(route.permission);
    return hasPermission;
  });

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="min-h-[50vh] uppercase">
        <WidgetSection key={filteredRoutes.length} layout={2} padding>
          {filteredRoutes.map((route, index) => (
            <Card
              key={index}
              fullHeight
              title={route.title}
              route={route.route}
            />
          ))}
        </WidgetSection>
      </div>
    </div>
  );
};

export default MaintenanceMixBag;
