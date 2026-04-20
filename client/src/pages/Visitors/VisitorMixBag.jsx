import Card from "../../components/Card";
import WidgetSection from "../../components/WidgetSection";
import { PERMISSIONS } from "../../constants/permissions";
import useAuth from "../../hooks/useAuth";

const VisitorMixBag = () => {
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  const mixBagCards = [
    {
      title: "REPEAT DAY PASS",
      route: "/app/visitors/mix-bag/repeat-day-pass/repeat-external-companies",
      permission: PERMISSIONS.VISITORS_MIX_BAG_REPEAT_DAY_PASS.value,
    },
     {
      title: "VISITORS TO CLIENT",
      route: "/app/visitors/mix-bag/visitors-to-client/convert-internal-visitors",
      permission: PERMISSIONS.VISITORS_MIX_BAG_VISITORS_TO_CLIENT.value,
    },
  ].filter(
    (card) => !card.permission || userPermissions.includes(card.permission),
  );

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="h-[50vh] uppercase">
        <WidgetSection key={mixBagCards.length} layout={2} padding>
          {mixBagCards.map((card) => (
            <Card
              fullHeight
              key={card.title}
              title={card.title}
              route={card.route}
            />
          ))}
        </WidgetSection>
      </div>
    </div>
  );
};

export default VisitorMixBag;