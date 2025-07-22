import { useSelector } from "react-redux";
import TabLayout from "../../../components/Tabs/TabLayout"; // Adjust the path as per your structure

const ManageAssets = () => {
  const departmentName = useSelector(
    (state) => state.assets.selectedDepartmentName
  );
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
