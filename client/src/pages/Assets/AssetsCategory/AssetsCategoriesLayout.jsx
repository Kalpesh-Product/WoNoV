import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import TabLayout from "../../../components/Tabs/TabLayout";

const AssetsCategoriesLayout = () => {
  const { department: urlDept } = useParams();
  const reduxDeptName = useSelector(
    (state) => state.assets.selectedDepartmentName
  );
  const departmentName = reduxDeptName || urlDept;
  const basePath = `/app/assets/view-assets/${departmentName}`;

  const tabs = [
    { label: "Assets Categories", path: "assets-categories" },
    { label: "Assets Sub Categories", path: "assets-sub-categories" },
    { label: "List of Assets", path: "list-of-assets" },
  ];

  return (
    <TabLayout
      basePath={basePath}
      tabs={tabs}
      defaultTabPath="assets-categories"
    />
  );
};

export default AssetsCategoriesLayout;
