import Card from "../../../components/Card";
import WidgetSection from "../../../components/WidgetSection";
import useAuth from "../../../hooks/useAuth";
import { useLocation } from "react-router-dom";
import { getInventoryCardConfig } from "./MaintenanceInventoryTabs";

const MaintenanceInventoryCard = () => {
  const { auth } = useAuth();
  const { pathname } = useLocation();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const { basePath, cardPermissions } = getInventoryCardConfig(pathname);
  const inventoryCards = [
    {
      title: "OVERALL INVENTORY",
      route: `${basePath}/overall-inventory`,
      permission: cardPermissions.overall,
    },
    {
      title: "OVERALL ST INVENTORY",
       route: `${basePath}/overall-st-inventory`,
     // route: `${basePath}/sunteck-kanaka-units`,
      permission: cardPermissions.sunteck,
    },
    {
      title: "OVERALL DTC INVENTORY",
      route: `${basePath}/overall-dtc-inventory`,
    //  route: `${basePath}/dempo-trade-center`,
      permission: cardPermissions.dempo,
    },
    {
      title: "CATEGORY & ITEM",
      route: `${basePath}/category`,
      permission: cardPermissions.categoryItem,
    },
  ];

  return (
    <WidgetSection layout={2}>
      {inventoryCards
        .filter(({ permission }) => userPermissions.includes(permission))
        .map((card) => (
          <Card key={card.title} {...card} fullHeight />
        ))}
    </WidgetSection>
  );
};

export default MaintenanceInventoryCard;