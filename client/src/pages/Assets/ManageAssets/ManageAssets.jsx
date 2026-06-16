import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TabLayout from "../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../constants/permissions";

const ManageAssets = () => {
  const { department: urlDept } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const reduxDeptName = useSelector(
    (state) => state.assets.selectedDepartmentName
  );
  const departmentName = reduxDeptName || urlDept;
  const basePath = `/app/assets/manage-assets/${departmentName}`;
  const isUnassignedRoute = location.pathname.includes("/unassigned-assets");

  const tabs = [
    {
      label: isUnassignedRoute ? "Unassigned Assets" : "Assign Assets",
      path: isUnassignedRoute ? "unassigned-assets" : "assign-assets",
      permission: PERMISSIONS.ASSETS_ASSIGN_ASSETS.value,
    },
    { label: "Assigned Assets", path: "assigned-assets", permission: PERMISSIONS.ASSETS_ASSIGNED_ASSETS.value },
    { label: "Approvals", path: "approvals", permission: PERMISSIONS.ASSETS_APPROVALS.value },
  ];

  useEffect(() => {
    const assetViewFilter = location.state?.assetViewFilter;

    if (!assetViewFilter) return;

    const expectedPath =
      assetViewFilter === "inUse"
        ? `${basePath}/assigned-assets`
        : assetViewFilter === "available"
          ? `${basePath}/unassigned-assets`
          : null;

    if (expectedPath && location.pathname !== expectedPath) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [basePath, location.pathname, location.state, navigate]);

  return (
    <TabLayout basePath={basePath} tabs={tabs} defaultTabPath="assign-assets" />
  );
};

export default ManageAssets;
