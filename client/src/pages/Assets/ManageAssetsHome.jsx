import { useQuery } from "@tanstack/react-query";
import AgTable from "../../components/AgTable";
import WidgetSection from "../../components/WidgetSection";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setSelectedDepartment,
  setSelectedDepartmentName,
} from "../../redux/slices/assetsSlice";
import { useTopDepartment } from "../../hooks/useTopDepartment";
import useAuth from "../../hooks/useAuth";
import { inrFormat } from "../../utils/currencyFormat";

const ManageAssetsHome = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  console.log("id in parent : ", currentDepartmentId);
  const currentDepartment = auth.user?.departments?.[0]?.name;
  const isInUseView = location.state?.assetViewFilter === "inUse";

  useTopDepartment({
    additionalTopUserIds: [
      "67b83885daad0f7bab2f188b",
      "67b83885daad0f7bab2f1852",
      "681a10b13fc9dc666ede401c",
    ], //Mac//Kashif//Nigel
    onNotTop: () => {
      dispatch(setSelectedDepartment(currentDepartmentId));
      dispatch(setSelectedDepartmentName(currentDepartment));
      navigate(
        isInUseView
          ? `/app/assets/manage-assets/${currentDepartment}/assigned-assets`
          : `/app/assets/manage-assets/${currentDepartment}`,
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

  const { data: assignedAssetsInUse = [], isLoading: isAssignedAssetsLoading } =
    useQuery({
      queryKey: ["assignedAssetsInUse", "all"],
      queryFn: async () => {
        try {
          const response = await axios.get(
            "/api/assets/get-asset-requests?status=Approved",
          );

          return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
          console.log(error);
          return [];
        }
      },
      enabled: isInUseView,
    });

  const tableData =
    isLoading || (isInUseView && isAssignedAssetsLoading)
      ? []
      : isInUseView
        ? (Array.isArray(departmentAssets) ? departmentAssets : []).map(
            (item, index) => {
              const departmentAssignedAssets = assignedAssetsInUse.filter(
                (request) => request?.fromDepartment?._id === item?._id,
              );

              const assignedAssetItems = departmentAssignedAssets
                .map((request) => request?.asset)
                .filter(Boolean);

              const assetValue = assignedAssetItems.reduce(
                (sum, asset) => sum + (Number(asset?.price) || 0),
                0,
              );

              return {
                ...item,
                srNo: index + 1,
                department: item.name || "N/A",
                departmentId: item._id,
                noOfAssets: departmentAssignedAssets.length,
                value: assetValue,
                inUse: departmentAssignedAssets.filter(
                  (request) =>
                    String(request?.asset?.status ?? "").trim().toLowerCase() ===
                    "active",
                ).length,
                damaged: assignedAssetItems.filter((asset) => asset?.isDamaged)
                  .length,
                underMaintenance: assignedAssetItems.filter(
                  (asset) => asset?.isUnderMaintenance === true,
                ).length,
                extra: assignedAssetItems.filter((asset) => asset?.isExtra === true)
                  .length,
              };
            },
          )
        : (Array.isArray(departmentAssets) ? departmentAssets : []).map(
            (item, index) => {
              const assets = item.assets;
              const assetValue = assets.reduce((sum, a) => sum + a.price, 0);
              return {
                ...item,
                srNo: index + 1,
                department: item.name || "N/A",
                departmentId: item._id,
                noOfAssets: assets.length || 0,
                value: assetValue || 0,
                inUse: assets.filter((a) => a.status === "Active").length,
                damaged: assets.filter((a) => a.status === "Damaged").length,
                underMaintenance: assets.filter(
                  (a) => a.isUnderMaintenance === true,
                ).length,
                extra: assets.filter((a) => a.isExtra === true).length,
              };
            },
          );

  const assetsRaw = isInUseView
    ? assignedAssetsInUse.map((item) => item?.asset).filter(Boolean)
    : isLoading
      ? []
      : departmentAssets.flatMap((item) => item.assets);

  const totalAssetValue = assetsRaw.reduce((sum, item) => sum + item.price, 0);
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
                isInUseView
                  ? `/app/assets/manage-assets/${params.value}/assigned-assets`
                  : `/app/assets/manage-assets/${params.value}`,
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
    {headerName: "Extra", field: "extra"},
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <WidgetSection
        layout={1}
        padding
        border
        title={"DEPARTMENT WISE ASSETS"}
        TitleAmount={`TOTAL ASSET VALUE : INR ${
          inrFormat(totalAssetValue) || 0
        }`}
      >
        <AgTable data={tableData} columns={departmentColumns} hideFilter />
      </WidgetSection>
    </div>
  );
};

export default ManageAssetsHome;
