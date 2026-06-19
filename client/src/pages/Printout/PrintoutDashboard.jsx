import { CgProfile } from "react-icons/cg";
import { MdFormatListBulleted } from "react-icons/md";
import { RiArchiveDrawerLine, RiPagesLine } from "react-icons/ri";
import Card from "../../components/Card";
import WidgetSection from "../../components/WidgetSection";
import { PERMISSIONS } from "../../constants/permissions";
import useAuth from "../../hooks/useAuth";

const PrintoutDashboard = () => {
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  const cardsConfig = [
    {
      title: "Add Printout",
      route: "/app/printouts/add-printout",
      icon: <RiPagesLine />,
      permission: PERMISSIONS.PRINTOUT_ADD_PRINTOUT.value,
    },
    {
      title: "Manage Printout",
      route: "/app/printouts/manage-printout",
      icon: <RiArchiveDrawerLine />,
      permission: PERMISSIONS.PRINTOUT_MANAGE_PRINTOUT.value,
    },
    {
      title: "Report Printout",
      route: "/app/printouts/report-printout",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.PRINTOUT_REPORT_PRINTOUT.value,
    },
  ];

  const allowedCards = cardsConfig.filter(
    (card) => !card.permission || userPermissions.includes(card.permission),
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <WidgetSection title="Printout Dashboard" border layout={allowedCards.length}>
        {allowedCards.map((card) => (
          <Card
            key={card.title}
            title={card.title}
            route={card.route}
            icon={card.icon || <CgProfile />}
          />
        ))}
      </WidgetSection>
    </div>
  );
};

export default PrintoutDashboard;