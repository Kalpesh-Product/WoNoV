import { useQuery } from "@tanstack/react-query";
import AgTable from "../../components/AgTable";
import WidgetSection from "../../components/WidgetSection";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setSelectedDepartment,
  setSelectedDepartmentName,
} from "../../redux/slices/assetsSlice";
import { useTopDepartment } from "../../hooks/useTopDepartment";
import useAuth from "../../hooks/useAuth";
import { inrFormat } from "../../utils/currencyFormat";

const assetCardRouteConfig = {
  "assets-owned": {
    ownershipType: "Owned",
    tableTitle: "List of Assets - Owned Assets",
  },
  "assets-rental": {
    ownershipType: "Rental",
    tableTitle: "List of Assets - Rental Assets",
  },
  "assets-under-maintenance": {
    statusFilter: "underMaintenance",
    tableTitle: "List of Assets - Under Maintenance Assets",
  },
  "assets-damaged": {
    statusFilter: "damaged",
    tableTitle: "List of Assets - Damaged Assets",
  },
  "assets-extra": {
    statusFilter: "extra",
    tableTitle: "List of Assets - Extra Assets",
  },
};

const AssetsHome = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { assetCard } = useParams();
  const normalizedAssetCard = assetCard?.trim();
  const selectedAssetCardConfig =
    assetCardRouteConfig[normalizedAssetCard] || null;
  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  console.log("id in parent : ", currentDepartmentId);
  const currentDepartment = auth.user?.departments?.[0]?.name;
  const assetOwnershipType =
    selectedAssetCardConfig?.ownershipType || location.state?.assetOwnershipType;
  const assetTargetTab = location.state?.assetTargetTab;
  const assetStatusFilter =
    selectedAssetCardConfig?.statusFilter || location.state?.assetStatusFilter;
  const tableTitle =
    selectedAssetCardConfig?.tableTitle || "DEPARTMENT WISE ASSETS";
  const buildDepartmentAssetsPath = (departmentName) => {
    const encodedDepartment = encodeURIComponent((departmentName || "").trim());
    const cardPath = normalizedAssetCard ? `/${normalizedAssetCard}` : "";
    return `/app/assets/view-assets/${encodedDepartment}/list-of-assets${cardPath}`;
  };
  const getFilteredAssets = (assets = []) =>
    assets.filter((item) => {
      if (assetOwnershipType && item?.ownershipType !== assetOwnershipType) {
        return false;
      }

      if (assetStatusFilter === "underMaintenance") {
        return item?.isUnderMaintenance === true;
      }

      if (assetStatusFilter === "damaged") {
        return item?.isDamaged === true;
      }

      if (assetStatusFilter === "extra") {
        return item?.isExtra === true;
      }

      return true;
    });
  const roleTitles = auth?.user?.role?.map((item) => item?.roleTitle) || [];
  const isGlobalAssetsUser = roleTitles.some((roleTitle) =>
    ["Master Admin", "Super Admin"].includes(roleTitle),
  );

  useTopDepartment({
    additionalTopUserIds: [
      "67b83885daad0f7bab2f188b",
      "67b83885daad0f7bab2f1852",
      "681a10b13fc9dc666ede401c",
    ], //Mac//Kashif//Nigel
    onNotTop: () => {
      if (isGlobalAssetsUser) return;

      dispatch(setSelectedDepartment(currentDepartmentId));
      dispatch(setSelectedDepartmentName(currentDepartment));
      navigate(
        assetOwnershipType
          ? buildDepartmentAssetsPath(currentDepartment)
          : assetStatusFilter
            ? buildDepartmentAssetsPath(currentDepartment)
          // ? `/app/assets/view-assets/${currentDepartment}/list-of-assets`
          // : assetStatusFilter
          //   ? `/app/assets/view-assets/${currentDepartment}/list-of-assets`
          : assetTargetTab
            ? `/app/assets/view-assets/${currentDepartment}/${assetTargetTab}`
          : `/app/assets/view-assets/${currentDepartment}`,
        {
          state:
            assetOwnershipType || assetTargetTab || assetStatusFilter
              ? { assetOwnershipType, assetTargetTab, assetStatusFilter }
              : null,
        },
      );
    },
  });

  const { data: departmentAssets = [], isLoading } = useQuery({
    queryKey: ["all-assets"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/assets/get-assets-with-departments"
        );
        return response.data?.data;
      } catch (error) {
        console.log(error);
      }
    },
  });

  const assetsRaw = isLoading || !Array.isArray(departmentAssets)
    ? []
    : departmentAssets.flatMap((item) => getFilteredAssets(item?.assets || []));
  console.log("flat : ", assetsRaw);
  const totalAssetValue = assetsRaw.reduce(
    (sum, item) => sum + (Number(item?.price) || 0),
    0,
  );
  console.log("flat : ", totalAssetValue);
  const departmentColumns = [
    { headerName: "Sr No", field: "srNo", width: 100 },
    {
      headerName: "Department",
      field: "department",
      width: 300,
      cellRenderer: (params) => {
        return (
          <span
            role="button"
            onClick={() => {
              dispatch(setSelectedDepartment(params.data?.departmentId));
              dispatch(setSelectedDepartmentName(params.value));
              navigate(
                assetOwnershipType
                  ? buildDepartmentAssetsPath(params.value)
                  : assetStatusFilter
                    ? buildDepartmentAssetsPath(params.value)
                  // ? `/app/assets/view-assets/${params.value}/list-of-assets`
                  // : assetStatusFilter
                  //   ? `/app/assets/view-assets/${params.value}/list-of-assets`
                  : assetTargetTab
                    ? `/app/assets/view-assets/${params.value}/${assetTargetTab}`
                  : `/app/assets/view-assets/${params.value}`,
                {
                  state:
                    assetOwnershipType || assetTargetTab || assetStatusFilter
                      ? { assetOwnershipType, assetTargetTab, assetStatusFilter }
                      : null,
                },
              );
            }}
            className="text-primary font-pregular hover:underline cursor-pointer"
          >
            {params.value}
          </span>
        );
      },
    },
    { headerName: "No. Of Assets", field: "noOfAssets" },
    {
      headerName: "Value (INR)",
      field: "value",
      cellRenderer: (params) => inrFormat(params.value),
    },
    { headerName: "In Use", field: "inUse" },
    { headerName: "Damaged", field: "damaged" },
    { headerName: "Under Maintenance", field: "underMaintenance" },
    {headerName: "Extra", field: "extra"}
  ];

  const tableData = isLoading || !Array.isArray(departmentAssets)
    ? []
    : departmentAssets.map((item, index) => {
        const assets = getFilteredAssets(item?.assets || []);
        const assetValue = assets.reduce(
          (sum, a) => sum + (Number(a?.price) || 0),
          0,
        );
        return {
          ...item,
          srNo: index + 1,
          department: item.name || "N/A",
          departmentId: item._id,
          noOfAssets: assets.length || 0,
          value: assetValue || 0,
          inUse: assets.filter((a) => a.status === "Active").length,
          damaged: assets.filter((a) => a.isDamaged === true).length,
          underMaintenance: assets.filter((a) => a.isUnderMaintenance === true)
            .length,
          extra: assets.filter((a) => a.isExtra === true).length,
        };
      });

  return (
    <div className="flex flex-col gap-4 p-4">
      <WidgetSection
        layout={1}
        padding
        border
        // title={"DEPARTMENT WISE ASSETS"}
           title={tableTitle}
        TitleAmount={`TOTAL ASSET VALUE : INR ${
          inrFormat(totalAssetValue) || 0
        }`}
      >
        <AgTable data={tableData} columns={departmentColumns} hideFilter />
      </WidgetSection>
    </div>
  );
};

export default AssetsHome;
