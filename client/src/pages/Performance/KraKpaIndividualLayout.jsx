import TabLayout from "../../components/Tabs/TabLayout";
import { Outlet } from "react-router-dom";
import { PERMISSIONS } from "../../constants/permissions";

const KraKpaIndividualLayout = ({
  section,
  basePath: providedBasePath,
}) => {
  const isDailyScore = section === "daily-score";
  const basePath =
    providedBasePath || `/app/kra-kpa/individual/${section}`;

  const tabs = isDailyScore
    ? [
        {
          label: "KPA Rating",
          path: "kpa-rating",
          permission: PERMISSIONS.KRAKPA_KPA_RATING.value,
        },
        {
          label: "Daily Logs Rating",
          path: "daily-logs-rating",
          permission: PERMISSIONS.KRAKPA_DAILY_LOGS_RATING.value,
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
          permission: PERMISSIONS.KRAKPA_DUE_TASK.value,
        },
        {
          label: "Daily Logs",
          path: "daily-logs",
          permission: PERMISSIONS.KRAKPA_DAILY_LOGS.value,
        },
      ];

  return (
    isDailyScore ? <Outlet /> : <TabLayout
      basePath={basePath}
      defaultTabPath={tabs[0].path}
      tabs={tabs}
      fitTabLabels
      containerClassName="p-0"
      contentClassName="pt-4"
    />
  );
};

export default KraKpaIndividualLayout;
