import { useSelector } from "react-redux";
import TabLayout from "../../../components/Tabs/TabLayout";

const AssetsCategoriesLayout = () => {
  const departmentName = useSelector(
    (state) => state.assets.selectedDepartmentName
  );
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
