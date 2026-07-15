import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import PageFrame from "../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useAuth from "../../../hooks/useAuth";
import { inrFormat } from "../../../utils/currencyFormat";
import humanDate from "../../../utils/humanDateForamt";

const AssetReports = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) return "N/A";

    const datePart = `${String(dateObj.getDate()).padStart(2, "0")}-${String(
      dateObj.getMonth() + 1,
    ).padStart(2, "0")}-${dateObj.getFullYear()}`;
    const timePart = dateObj
      .toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();

    return `${datePart}, ${timePart}`;
  };

  const userDepartmentIds = (auth?.user?.departments || []).map((department) =>
    department?._id?.toString(),
  );

  const { data: groupedAssets = [], isLoading } = useQuery({
    queryKey: ["asset-reports", userDepartmentIds],
    queryFn: async () => {
      const response = await axios.get("/api/assets/get-assets");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const assetReportsColumns = [
    // visible columns
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "assetNumber", headerName: "Asset Number", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "brand", headerName: "Brand", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "purchaseDate", headerName: "Purchase Date", flex: 1, exportFormat: "date" },
    { field: "warranty", headerName: "Warranty", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },

    // hidden columns for export
    { field: "secondaryId", headerName: "Secondary ID", hide: true },
    { field: "assetName", headerName: "Asset Name", hide: true },
    { field: "serialNumber", headerName: "Serial Number", hide: true },
    { field: "description", headerName: "Description", hide: true },
    { field: "addedAt", headerName: "Added At", hide: true, exportFormat: "datetime-comma" },
    { field: "addedBy", headerName: "Added By", hide: true },
    { field: "assetType", headerName: "Asset Type", hide: true },
    { field: "department", headerName: "Department", hide: true },
    { field: "departmentAssetId", headerName: "Department Asset ID", hide: true },
    { field: "unitNo", headerName: "Unit No", hide: true },
    { field: "ownershipType", headerName: "Ownership Type", hide: true },
    { field: "quantity", headerName: "Quantity", hide: true },
    { field: "warrantyExpiryDate", headerName: "Warranty Expiry Date", hide: true, exportFormat: "date" },
    { field: "warrantyMonths", headerName: "Warranty (Months)", hide: true },
    { field: "rentedExpirationDate", headerName: "Rental Expiry Date", hide: true, exportFormat: "date" },
    { field: "subCategory", headerName: "Sub Category", hide: true },
    { field: "tangible", headerName: "Tangible", hide: true },
    { field: "status", headerName: "Status", hide: true },
    { field: "damaged", headerName: "Damaged", hide: true },
    { field: "underMaintenance", headerName: "Under Maintenance", hide: true },
    { field: "extra", headerName: "Extra", hide: true },
    { field: "assigned", headerName: "Assigned", hide: true },
    { field: "assignee", headerName: "Assignee", hide: true },
    { field: "approvedBy", headerName: "Approved By", hide: true },
    { field: "assignedBy", headerName: "Assigned By", hide: true },
    { field: "approvedAt", headerName: "Approved At", hide: true },
    { field: "assignedAt", headerName: "Assigned At", hide: true },
    { field: "assignedBuilding", headerName: "Assigned Building", hide: true },
    { field: "assignedUnit", headerName: "Assigned Unit", hide: true },
    { field: "assetImage", headerName: "Asset Image", hide: true },
    { field: "warrantyDocument", headerName: "Warranty Document", hide: true },
  ];

  const reportData = useMemo(
    () =>
      (Array.isArray(groupedAssets) ? groupedAssets : [])
        .filter((departmentGroup) =>
          userDepartmentIds.includes(departmentGroup?.departmentId?.toString()),
        )
        .flatMap((departmentGroup) =>
          (departmentGroup?.assets || []).map((asset, index) => ({
            srNo: index + 1,
            assetNumber: asset?.assetId || "N/A",
            secondaryId: asset?.secondaryId || "N/A",
            assetName: asset?.name || "N/A",
            serialNumber: asset?.serialNumber || "N/A",
            description: asset?.description || "N/A",
            addedAt: asset?.createdAt || null,
            addedBy: asset?.createdBy?.firstName
              ? `${asset.createdBy.firstName} ${asset?.createdBy?.lastName || ""}`.trim()
              : asset?.createdBy?.name ||
                (auth?.user?.firstName
                  ? `${auth.user.firstName} ${auth?.user?.lastName || ""}`.trim()
                  : auth?.user?.name || "N/A"),
            assetType: asset?.assetType || "N/A",
            brand: asset?.brand || "N/A",
            department: departmentGroup?.departmentName || "N/A",
            departmentAssetId: asset?.departmentAssetId || "N/A",
            unitNo: asset?.location?.unitNo || "N/A",
            location:
              asset?.location?.unitNo || asset?.location?.unitName || "N/A",
            ownershipType: asset?.ownershipType || "N/A",
            price: `INR ${inrFormat(asset?.price || 0)}`,
            quantity:
              Number.isFinite(Number(asset?.quantity)) && Number(asset?.quantity) > 0
                ? Number(asset.quantity)
                : 1,
            purchaseDate: asset?.purchaseDate || null,
            warranty: asset?.warranty ?? "N/A",
            warrantyMonths: asset?.warranty ?? "N/A",
            warrantyExpiryDate: asset?.warrantyExpiryDate || null,
            rentedExpirationDate: asset?.rentedExpirationDate || null,
            category: asset?.subCategory?.category?.categoryName || "N/A",
            subCategory: asset?.subCategory?.subCategoryName || "N/A",
            tangible: asset?.tangable ? "Yes" : "No",
            status: asset?.status || "N/A",
            underMaintenance: asset?.isUnderMaintenance ? "Yes" : "No",
            damaged: asset?.isDamaged ? "Yes" : "No",
            extra: asset?.isExtra ? "Yes" : "No",
            assigned: asset?.isAssigned ? "Yes" : "No",
            assignee: asset?.assignedAsset?.assignee
              ? `${asset.assignedAsset.assignee.firstName || ""} ${asset.assignedAsset.assignee.lastName || ""}`.trim()
              : "N/A",
            approvedBy: asset?.assignedAsset?.approvedBy
              ? `${asset.assignedAsset.approvedBy.firstName || ""} ${asset.assignedAsset.approvedBy.lastName || ""}`.trim()
              : "N/A",
            assignedBy: asset?.assignedAsset?.assignedBy
              ? `${asset.assignedAsset.assignedBy.firstName || ""} ${asset.assignedAsset.assignedBy.lastName || ""}`.trim()
              : "N/A",
            approvedAt:
              asset?.assignedAsset?.approvedBy && asset?.assignedAsset?.updatedAt
                ? formatDateTime(asset.assignedAsset.updatedAt)
                : "N/A",
            assignedAt: asset?.assignedAsset?.assignedAt
              ? formatDateTime(asset.assignedAsset.assignedAt)
              : asset?.assignedAsset?.createdAt
                ? formatDateTime(asset.assignedAsset.createdAt)
                : "N/A",
            assignedBuilding:
              asset?.assignedAsset?.location?.building?.buildingName || "N/A",
            assignedUnit: asset?.assignedAsset?.location?.unitNo || "N/A",
            assetImage: asset?.assetImage?.url || "N/A",
            warrantyDocument: asset?.warrantyDocument?.link || "N/A",
          })),
        ),
    [groupedAssets, userDepartmentIds, auth],
  );

  return (
    <div className="flex flex-col gap-8 p-4">
      <PageFrame>
        <YearWiseTable
          search
          exportData
          exportAllColumns
          taskExportDateTimeFormatting
          dateColumn="purchaseDate"
          tableTitle="Asset Reports"
          data={isLoading ? [] : reportData}
          columns={assetReportsColumns}
          dropdownColumns={[]}
          hideTitle={true}
        />
      </PageFrame>
    </div>
  );
};

export default AssetReports;




// import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import AgTable from "../../../components/AgTable";
// import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
// import useAuth from "../../../hooks/useAuth";
// import humanDate from "../../../utils/humanDateForamt";
// import { inrFormat } from "../../../utils/currencyFormat";

// const AssetReports = () => {
//   const axios = useAxiosPrivate();
//   const { auth } = useAuth();

//   const userDepartmentIds = (auth?.user?.departments || []).map((department) =>
//     department?._id?.toString(),
//   );

//   const { data: groupedAssets = [], isLoading } = useQuery({
//     queryKey: ["asset-reports", userDepartmentIds],
//     queryFn: async () => {
//       const response = await axios.get("/api/assets/get-assets");
//       return Array.isArray(response.data) ? response.data : [];
//     },
//   });

//   const assetsColumns = [
//     { field: "id", headerName: "ID", flex: 1 },
//     { field: "department", headerName: "Department", flex: 1 },
//     { field: "assetNumber", headerName: "Asset Number", flex: 1 },
//     { field: "category", headerName: "Category", flex: 1 },
//     { field: "brand", headerName: "Brand", flex: 1 },
//     { field: "price", headerName: "Price", flex: 1 },
//     { field: "quantity", headerName: "Quantity", flex: 1 },
//     { field: "purchaseDate", headerName: "Purchase Date", flex: 1 },
//     { field: "warranty", headerName: "Warranty", flex: 1 },
//     { field: "location", headerName: "Location", flex: 1 },
//   ];

//   const rows = (Array.isArray(groupedAssets) ? groupedAssets : [])
//     .filter((departmentGroup) =>
//       userDepartmentIds.includes(departmentGroup?.departmentId?.toString()),
//     )
//     .flatMap((departmentGroup) =>
//       (departmentGroup?.assets || []).map((asset) => ({
//         id: asset?._id,
//         department: departmentGroup?.departmentName || "N/A",
//         assetNumber: asset?.assetId || "N/A",
//         category: asset?.subCategory?.category?.categoryName || "N/A",
//         brand: asset?.brand || "N/A",
//         price: inrFormat(asset?.price || 0),
//         quantity: asset?.quantity || 0,
//         purchaseDate: asset?.purchaseDate ? humanDate(asset.purchaseDate) : "N/A",
//         warranty: asset?.warranty ?? "N/A",
//         location: asset?.location?.unitNo || asset?.location?.unitName || "N/A",
//       })),
//     );

//   return (
//     <div className="flex flex-col gap-8 p-4">
//       <div>
//         <AgTable
//           search={true}
//           tableTitle={"Reports"}
//           data={isLoading ? [] : rows}
//           columns={assetsColumns}
//           dropdownColumns={["department", "category", "brand"]}
//           buttonTitle={"Export"}
//         />
//       </div>
//     </div>
//   );
// };

// export default AssetReports;
