import { useLocation } from "react-router-dom";
import Card from "../../components/Card";
import WidgetSection from "../../components/WidgetSection";
import useAuth from "../../hooks/useAuth";
import { PERMISSIONS } from "../../constants/permissions";
import DepartmentTicketSettings from "./DepartmentTicketSettings";

const TicketSettingsHome = () => {
  const { auth } = useAuth();
  const { hash } = useLocation();
  const permissions = auth?.user?.permissions?.permissions || [];
  const cards = [
    {
      title: "Department Ticket Settings",
      route: "/app/tickets/ticket-settings#departments",
      permission: PERMISSIONS.TICKETS_NEW_DEPARTMENT_TICKET_SETTINGS.value,
    },
    {
      title: "Others Settings",
      route: "/app/tickets/ticket-settings/others-settings",
      permission: PERMISSIONS.TICKETS_OTHERS_SETTINGS.value,
    },
  ].filter(({ permission }) => permissions.includes(permission));

  if (hash === "#departments") {
    return <DepartmentTicketSettings />;
  }

  return (
    <div className="p-4 flex flex-col gap-4 uppercase [&_h3]:whitespace-normal">
      <WidgetSection layout={2} padding>
        {cards.map((card) => (
          <Card
            fullHeight
            key={card.title}
            title={card.title}
            route={card.route}
          />
        ))}
      </WidgetSection>
    </div>
  );
};

export default TicketSettingsHome;
