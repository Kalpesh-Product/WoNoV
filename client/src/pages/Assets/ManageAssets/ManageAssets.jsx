import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import TabLayout from "../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../constants/permissions";

const ManageAssets = () => {
  const { department: urlDept } = useParams();
  const reduxDeptName = useSelector(
    (state) => state.assets.selectedDepartmentName
  );
  const departmentName = reduxDeptName || urlDept;
  const basePath = `/app/assets/manage-assets/${departmentName}`;

  const tabs = [
    { label: "Assign Assets", path: "assign-assets", permission: PERMISSIONS.ASSETS_ASSIGN_ASSETS.value },
    { label: "Assigned Assets", path: "assigned-assets", permission: PERMISSIONS.ASSETS_ASSIGNED_ASSETS.value },
    { label: "Approvals", path: "approvals", permission: PERMISSIONS.ASSETS_APPROVALS.value },
  ];

  return (
    <TabLayout basePath={basePath} tabs={tabs} defaultTabPath="assign-assets" />
  );
};

export default ManageAssets;
