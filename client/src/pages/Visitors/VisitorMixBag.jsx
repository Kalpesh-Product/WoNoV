import Card from "../../components/Card";
import WidgetSection from "../../components/WidgetSection";
import { PERMISSIONS } from "../../constants/permissions";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { MdEventRepeat, MdGroups, MdPersonAddAlt1 } from "react-icons/md";

const MeetingRoomMixBagIcon = ({ type }) => {
  const icons = {
    dayPass: MdEventRepeat,
    convert: MdPersonAddAlt1,
    visitors: MdGroups,
  };
  const Icon = icons[type] || MdGroups;

  return (
    <span className="relative inline-flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#1b4d80] min-[1800px]:h-[88px] min-[1800px]:w-[88px]">
      <Icon className="text-[38px] text-white min-[1800px]:text-[48px]" />
    </span>
  );
};

const VisitorMixBag = ({
  basePath = "/app/visitors/mix-bag",
  ignoreCardPermissions = false,
  financeCardStyle = false,
  hideAllCards = false,
}) => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  const mixBagCards = [
    {
      title: "REPEAT DAY PASS",
      description: "Repeat an existing client's day pass visit.",
      action: "View Repeat Day Pass",
      icon: "dayPass",
      route: `${basePath}/repeat-day-pass/repeat-external-companies`,
      permission: PERMISSIONS.VISITORS_MIX_BAG_REPEAT_DAY_PASS.value,
    },
     {
      title: "VISITORS TO CLIENT",
      description: "Convert an internal visitor into a client.",
      action: "View Convert Visitor",
      icon: "convert",
      route: `${basePath}/visitors-to-client/convert-internal-visitors`,
      permission: PERMISSIONS.VISITORS_MIX_BAG_VISITORS_TO_CLIENT.value,
    },
     {
      title: "REPEAT VISITORS",
      description: "Create another visit for an existing visitor.",
      action: "View Repeat Visitor",
      icon: "visitors",
      route: `${basePath}/repeat-visitors/repeat-internal-visitors`,
      permission: PERMISSIONS.VISITORS_MIX_BAG_REPEAT_VISITORS.value,
    },
  ].filter(
    (card) =>
      !hideAllCards &&
      (ignoreCardPermissions ||
        !card.permission ||
        userPermissions.includes(card.permission)),
  );

  if (financeCardStyle) {
    return (
      <div className="p-4 lg:p-5 min-[1800px]:p-6">
        <div className="flex w-full flex-wrap gap-4 min-[1800px]:gap-5">
          {mixBagCards.map((card) => (
            <button
              key={card.route}
              type="button"
              onClick={() => navigate(card.route)}
              className="group relative flex min-h-[150px] w-full grow basis-full overflow-hidden rounded-[24px] border border-[#dfe8f2] bg-white text-left shadow-[0_10px_24px_rgba(30,61,115,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(30,61,115,0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3D73] focus-visible:ring-offset-2 md:basis-[calc(50%-0.625rem)] xl:basis-[calc(25%-0.9375rem)] min-[1800px]:min-h-[185px] min-[1800px]:rounded-[28px] min-[1800px]:shadow-[0_12px_30px_rgba(30,61,115,0.08)] min-[1800px]:hover:shadow-[0_16px_36px_rgba(30,61,115,0.13)]"
            >
              <span
                className="absolute inset-y-0 left-0 z-10 w-2 bg-[#0d6eb8] min-[1800px]:w-2.5"
                aria-hidden="true"
              />

              <div className="flex w-[30%] min-w-[90px] shrink-0 items-center justify-center px-2 py-5 sm:min-w-[100px] sm:px-3 min-[1800px]:min-w-[120px] min-[1800px]:px-4">
                <MeetingRoomMixBagIcon type={card.icon} />
              </div>

              <div className="relative min-w-0 flex-1 px-3 sm:px-4">
                <div className="absolute left-3 right-2 top-[39px] flex h-[72px] flex-col items-start justify-between sm:left-4 sm:right-3 min-[1800px]:left-5 min-[1800px]:right-4 min-[1800px]:top-[49px] min-[1800px]:h-[88px]">
                  <h2 className="max-w-full whitespace-normal break-words text-xs font-pbold uppercase leading-tight tracking-[-0.02em] text-[#073f77] sm:text-[13px] min-[1800px]:text-base">
                    {card.title}
                  </h2>
                  <span className="flex items-center gap-2 whitespace-nowrap text-xs font-pmedium normal-case text-[#073f77] sm:text-[13px] min-[1800px]:gap-2.5 min-[1800px]:text-base">
                    {card.action}
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eff5fb] transition-all duration-200 group-hover:translate-x-1 group-hover:bg-[#e5eff9] min-[1800px]:h-7 min-[1800px]:w-7">
                      <FiChevronRight
                        className="text-sm min-[1800px]:text-base"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

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
