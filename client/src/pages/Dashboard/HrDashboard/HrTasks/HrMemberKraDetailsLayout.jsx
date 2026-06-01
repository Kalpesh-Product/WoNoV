import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";
import useAuth from "../../../../hooks/useAuth";

const HrMemberKraDetailsLayout = () => {
  const { auth } = useAuth();
  const { department } = useParams();
  const selectedMember = useSelector((state) => state.performance.selectedMember);
  const roleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const loggedInUserId = auth?.user?._id?.toString();
  const selectedMemberId = selectedMember?.memberId?.toString();
  const basePath = `/app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KRA/${encodeURIComponent(department)}/member-wise/member`;

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
    const kraTabs = [
      {
        label: "Department Daily KRA",
        path: "daily-KRA",
        permission: PERMISSIONS.PERFORMANCE_DAILY_KRA.value,
      },
      {
        label: "Individual Daily KRA",
        path: "individual-Daily-KRA",
        permission: PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA.value,
      },
      {
        label: "Team Daily KRA",
        path: "team-Daily-KRA",
        permission: PERMISSIONS.PERFORMANCE_TEAM_KRA.value,
      },
    ];

    if (
      canViewMemberLevelControls &&
      isSelectedMemberEmployee &&
      !isManagerViewingOwnMemberRow
    ) {
      return kraTabs.filter(
        (tab) => tab.path === "daily-KRA" || tab.path === "individual-Daily-KRA",
      );
    }

    return kraTabs;
  }, [
    canViewMemberLevelControls,
    isManagerViewingOwnMemberRow,
    isSelectedMemberEmployee,
  ]);

  return <TabLayout basePath={basePath} defaultTabPath="daily-KRA" tabs={tabs} />;
};

export default HrMemberKraDetailsLayout;