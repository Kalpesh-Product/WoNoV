import TabLayout from "../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../constants/permissions";
import useAuth from "../../hooks/useAuth";

const KraKpaIndividualLayout = ({
  section,
  basePath: providedBasePath,
  showPendingApprovals = false,
}) => {
  const { auth } = useAuth();
  const isDailyScore = section === "daily-score";
  const basePath =
    providedBasePath || `/app/kra-kpa/individual/${section}`;
  const roleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
  const canViewPendingApprovals =
    showPendingApprovals &&
    (roleTitles.some((role) => role.includes("manager")) ||
      roleTitles.some((role) => /^hr(?:\s|$)/.test(role)) ||
      roleTitles.includes("top management"));

  const tabs = isDailyScore
    ? [
        {
          label: "KPA Rating",
          path: "kpa-rating",
          permission: PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA.value,
        },
        {
          label: "Daily Logs Rating",
          path: "daily-logs-rating",
          permission: PERMISSIONS.KRAKPA_SELF_KRA.value,
        },
      ]
    : [
        {
          label: "Self KPA",
          path: "individual-Monthly-KPA",
          permission: PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA.value,
        },
        {
          label: "Self KRA",
          path: "self-KRA",
          permission: PERMISSIONS.KRAKPA_SELF_KRA.value,
        },
        {
          label: "Due Task",
          path: "due-task",
          permission: PERMISSIONS.KRAKPA_SELF_KRA.value,
        },
        {
          label: "Daily Logs",
          path: "daily-logs",
          permission: PERMISSIONS.KRAKPA_SELF_KRA.value,
        },
        ...(canViewPendingApprovals
          ? [
              {
                label: "Pending Approvals",
                path: "pending-approvals",
                permission:
                  PERMISSIONS.KRAKPA_INDIVIDUAL_MONTHLY_KPA.value,
              },
            ]
          : []),
      ];

  return (
    <TabLayout
      basePath={basePath}
      defaultTabPath={tabs[0].path}
      tabs={tabs}
      fitTabLabels
    />
  );
};

export default KraKpaIndividualLayout;
