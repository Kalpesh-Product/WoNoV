import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TabLayout from "../../../components/Tabs/TabLayout";

const AssetsCategoriesLayout = () => {
  const { department: urlDept } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const reduxDeptName = useSelector(
    (state) => state.assets.selectedDepartmentName
  );
  const departmentName = urlDept || reduxDeptName;
  const basePath = `/app/assets/view-assets/${departmentName}`;

  const tabs = [
    { label: "Assets Categories", path: "assets-categories" },
    { label: "Assets Sub Categories", path: "assets-sub-categories" },
    { label: "List of Assets", path: "list-of-assets" },
  ];

  useEffect(() => {
    const assetOwnershipType = location.state?.assetOwnershipType;
    const assetStatusFilter = location.state?.assetStatusFilter;
    const assetTargetTab = location.state?.assetTargetTab;
    const assetListTitle = location.state?.assetListTitle;
    const hasAssetCardState =
      assetOwnershipType ||
      assetStatusFilter ||
      assetTargetTab ||
      assetListTitle;

    if (!hasAssetCardState) return;

    const isListOfAssetsPath = /\/list-of-assets(\/[^/]+)?$/.test(
      location.pathname,
    );
    const shouldResetState = assetTargetTab
      ? location.pathname !== `${basePath}/${assetTargetTab}`
      : (assetOwnershipType || assetStatusFilter || assetListTitle) &&
        !isListOfAssetsPath;

    if (shouldResetState) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [basePath, location.pathname, location.state, navigate]);

  return (
    <TabLayout
      basePath={basePath}
      tabs={tabs}
      defaultTabPath="assets-categories"
    />
  );
};

export default AssetsCategoriesLayout;
