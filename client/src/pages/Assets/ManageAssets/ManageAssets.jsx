import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import TabLayout from "../../../components/Tabs/TabLayout";

const ManageAssets = () => {
  const { department: urlDept } = useParams();
  const reduxDeptName = useSelector(
    (state) => state.assets.selectedDepartmentName
  );
  const departmentName = reduxDeptName || urlDept;
  const basePath = `/app/assets/manage-assets/${departmentName}`;

  const tabs = [
    { label: "Assign Assets", path: "assign-assets" },
    { label: "Assigned Assets", path: "assigned-assets" },
    { label: "Approvals", path: "approvals" },
  ];

  return (
    <TabLayout basePath={basePath} tabs={tabs} defaultTabPath="assign-assets" />
  );
};

export default ManageAssets;
