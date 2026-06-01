import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";
import useAuth from "../../../../hooks/useAuth";

const HrMemberKpaDetailsLayout = () => {
  const { auth } = useAuth();
  const { department } = useParams();
  const selectedMember = useSelector((state) => state.performance.selectedMember);
  const roleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const loggedInUserId = auth?.user?._id?.toString();
  const selectedMemberId = selectedMember?.memberId?.toString();
  const basePath = `/app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KPA/${encodeURIComponent(department)}/member-wise/member`;

  const canManageTeam =
    userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KRA.value) ||
    userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KPA.value);
  const isSuperOrMasterAdmin = roleTitles.some(
    (roleTitle) =>
      roleTitle?.includes("super admin") || roleTitle?.includes("master admin"),
  );
  const canViewMemberLevelControls = canManageTeam || isSuperOrMasterAdmin;
  const isManagerViewingOwnMemberRow =
    !!loggedInUserId && !!selectedMemberId && loggedInUserId === selectedMemberId;
  const isSelectedMemberManager = (selectedMember?.memberRole || "")
    .toLowerCase()
    .includes("manager");
  const isSelectedMemberEmployee =
    !!selectedMemberId && !isSelectedMemberManager;

  const tabs = useMemo(() => {
    const kpaTabs = [
      {
        label: "Department Monthly KPA",
        path: "monthly-KPA",
        permission: PERMISSIONS.PERFORMANCE_MONTHLY_KPA.value,
      },
      {
        label: "Individual Monthly KPA",
        path: "individual-Monthly-KPA",
        permission: PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA.value,
      },
      {
        label: "Team Monthly KPA",
        path: "team-Monthly-KPA",
        permission: PERMISSIONS.PERFORMANCE_TEAM_KPA.value,
      },
    ];

    if (
      canViewMemberLevelControls &&
      isSelectedMemberEmployee &&
      !isManagerViewingOwnMemberRow
    ) {
      return kpaTabs.filter((tab) => tab.path === "individual-Monthly-KPA");
    }

    return kpaTabs;
  }, [
    canViewMemberLevelControls,
    isManagerViewingOwnMemberRow,
    isSelectedMemberEmployee,
  ]);

  return (
    <TabLayout
      basePath={basePath}
      defaultTabPath="individual-Monthly-KPA"
      tabs={tabs}
    />
  );
};

export default HrMemberKpaDetailsLayout;