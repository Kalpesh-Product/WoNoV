import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  TextField,
  FormControl,
  InputLabel,
} from "@mui/material";
import AgTable from "../../../components/AgTable";
import MuiModal from "../../../components/MuiModal";
import PrimaryButton from "../../../components/PrimaryButton";
import SecondaryButton from "../../../components/SecondaryButton";
import PageFrame from "../../../components/Pages/PageFrame";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useSelector } from "react-redux";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import StatusChip from "../../../components/StatusChip";
import DetalisFormatted from "../../../components/DetalisFormatted";
import humanDate from "../../../utils/humanDateForamt";
import { inrFormat } from "../../../utils/currencyFormat";
import { toast } from "sonner";
import { queryClient } from "../../../main";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useLocation } from "react-router-dom";

const AssignedAssets = () => {
  const axios = useAxiosPrivate();
  const location = useLocation();
  const [selectedAsset, setSelectedAsset] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const departmentId = useSelector((state) => state.assets.selectedDepartment);
  const isInUseView = location.state?.assetViewFilter === "inUse";
  const tableTitle = isInUseView
    ? "Assigned Assets - In Use"
    : "Assigned Assets";

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) return "N/A";

    const datePart = `${dateObj.getDate()}-${dateObj.getMonth() + 1}-${dateObj.getFullYear()}`;
    const timePart = dateObj
      .toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .toLowerCase();

    return `${datePart}, ${timePart}`;
  };
  //-----------------------API----------------------//
  const { data: assignedAssets = [], isLoading: isAssignedPending } = useQuery({
    queryKey: ["assignedAssets"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/assets/get-asset-requests?department=${departmentId}&status=Approved`
        );
        return response.data;
      } catch (error) {
        console.error(error.response.data.message);
      }
    },
  });
  //-----------------------API----------------------//

  const { mutate: revokeAsset, isPending: isRevoking } = useMutation({
    mutationFn: async (data) => {
      console.log("data", data);
      const response = await axios.patch(
        `/api/assets/revoke-asset/${data._id}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Revoked");
      queryClient.invalidateQueries({ queryKey: ["assignedAssets"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to revoke asset"
      );
    },
  });
  //   onError: (error) => {
  //     toast.error(error.message || "Failed to revoke asset");
  //   },
  // });

  //-----------------------Event handlers----------------------//
  const handleView = (data) => {
    setModalMode("view");
    setSelectedAsset(data);
    setModalOpen(true);
  };
  //-----------------------Event handlers----------------------//

  //-----------------------Table Data----------------------//
  const assetsColumns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "assignee", headerName: "Assignee Name" },
    { field: "assetNumber", headerName: "Asset Id" },
    { field: "department", headerName: "Department" },
    { field: "category", headerName: "Category" },
    { field: "brand", headerName: "Brand" },
    { field: "name", headerName: "Asset Name" },
    { field: "serialNumber", headerName: "Serial Number" },
    { field: "building", headerName: "Building", minWidth: 160, flex: 1 },
    // { field: "location", headerName: "Location" },
    //  { field: "building", headerName: "Building" },
    { field: "unit", headerName: "Location", minWidth: 140, flex: 1 },
    {
      field: "assignedBuilding",
      headerName: "Assigned Building",
      minWidth: 180,
      flex: 1,
    },
    {
      field: "assignedUnit",
      headerName: "Assigned Unit",
      minWidth: 160,
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      pinned: "right",
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="View"
            className="p-1 text-gray-600 hover:text-primary"
            onClick={() => handleView(params.data)}
          >
            <MdOutlineRemoveRedEye size={20} />
          </button>
          <ThreeDotMenu
            rowId={params.data.assetId}
            menuItems={[
              params.data.status !== "Revoked" && {
                label: "Revoke",
                onClick: () => revokeAsset(params.data),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const tableData = isAssignedPending
    ? []
    : assignedAssets.map((item, index) => {
        const assets = item.asset;
          const assetLocation = assets?.location || assets?.unit || null;
        const assignedLocation = item?.location || item?.unit || null;
        const buildingName =
          assetLocation?.building?.buildingName ||
          assetLocation?.buildingName ||
          assets?.building?.buildingName ||
          assets?.buildingName ||
          "N/A";
        const unitNo =
          assetLocation?.unitNo ||
          assetLocation?.unit ||
          assets?.unitNo ||
          assets?.unit ||
          "N/A";
        const assignedBuildingName =
          assignedLocation?.building?.buildingName ||
          assignedLocation?.buildingName ||
          item?.building?.buildingName ||
          item?.buildingName ||
          "N/A";
        const assignedUnitNo =
          assignedLocation?.unitNo ||
          assignedLocation?.unit ||
          item?.unitNo ||
          item?.unit ||
          "N/A";
        const category = assets?.subCategory?.category?.categoryName;
        return {
          ...assets,
          ...item,
          srNo: index + 1,
          assignee: `${item.assignee?.firstName} ${item.assignee?.lastName}`,
          assetId: item._id,
          assetNumber: item?.asset?.assetId,
          department: item?.fromDepartment?.name,
          category: category,
          brand: assets?.brand,
          name: assets?.name || "N/A",
          serialNumber: assets?.serialNumber || "N/A",
          building: buildingName,
          location: assignedLocation,
          unit: unitNo,
          assignedBuilding: assignedBuildingName,
          assignedUnit: assignedUnitNo,
          assetLocation,
          assignedLocation,
        };
      });
      //   const assetLocation =
      //     assets?.location ||
      //     item?.location ||
      //     assets?.unit ||
      //     item?.unit ||
      //     null;
      //   const buildingName =
      //     item?.location?.building?.buildingName ||
      //     assets?.location?.building?.buildingName ||
      //     assetLocation?.building?.buildingName ||
      //     assetLocation?.buildingName ||
      //     item?.building?.buildingName ||
      //     assets?.building?.buildingName ||
      //     item?.buildingName ||
      //     assets?.buildingName ||
      //     "N/A";
      //   const unitNo =
      //     item?.location?.unitNo ||
      //     item?.location?.unit ||
      //     assets?.location?.unitNo ||
      //     assets?.location?.unit ||
      //     assetLocation?.unitNo ||
      //     assetLocation?.unit ||
      //     item?.unitNo ||
      //     item?.unit ||
      //     "N/A";
      //   const category = assets?.subCategory?.category?.categoryName;
      //   return {
      //     ...assets,
      //     ...item,
      //     srNo: index + 1,
      //     assignee: `${item.assignee?.firstName} ${item.assignee?.lastName}`,
      //     assetId: item._id,
      //     assetNumber: item?.asset?.assetId,
      //     department: item?.fromDepartment?.name,
      //     category: category,
      //     brand: assets?.brand,
      //     name: assets?.name || "N/A",
      //     serialNumber: assets?.serialNumber || "N/A",
      //     building: buildingName,
      //     location: item?.location || null,
      //     unit: unitNo,
      //     assetLocation,
      //   };
      // });

  //-----------------------Table Data----------------------//

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <AgTable
          key={assignedAssets.length}
          search={true}
          tableTitle={tableTitle}
          data={tableData}
          columns={assetsColumns}
          exportData
        />
      </PageFrame>
      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === "view" ? "View Asset" : "Revoke Asset"}
      >
        {modalMode === "view" && (
          <div className="grid grid-cols-1 gap-4">
            <DetalisFormatted
              title={"Assignee"}
              detail={selectedAsset?.assignee}
            />
            <DetalisFormatted
              title={"Approved By"}
              detail={
                selectedAsset?.approvedBy
                  ? `${selectedAsset.approvedBy.firstName || ""} ${selectedAsset.approvedBy.lastName || ""}`.trim()
                  : "N/A"
              }
            />
             <DetalisFormatted
              title={"Assigned By"}
              detail={
                (selectedAsset?.assignedBy || selectedAsset?.approvedBy)
                  ? `${(selectedAsset.assignedBy || selectedAsset.approvedBy)?.firstName || ""} ${(selectedAsset.assignedBy || selectedAsset.approvedBy)?.lastName || ""}`.trim()
                  : "N/A"
              }
            />
            <DetalisFormatted
              title={"Approved At"}
              detail={
                selectedAsset?.status === "Approved" && selectedAsset?.updatedAt
                  ? formatDateTime(selectedAsset.updatedAt)
                  : "N/A"
              }
            />
             <DetalisFormatted
              title={"Assigned At"}
              detail={formatDateTime(selectedAsset?.assignedAt || selectedAsset?.createdAt)}
            />
            <DetalisFormatted
              title={"Asset Name"}
              detail={selectedAsset?.name}
            />
            <DetalisFormatted
              title={"Asset ID"}
              detail={selectedAsset?.assetNumber}
            />
            <DetalisFormatted
              title={"Asset Type"}
              detail={selectedAsset?.assetType}
            />
             <DetalisFormatted
              title={"Secondary ID"}
              detail={selectedAsset?.secondaryId || "N/A"}
            />
            <DetalisFormatted
              title={"Department Asset ID"}
              detail={selectedAsset?.departmentAssetId || "N/A"}
            />
            <DetalisFormatted title={"Brand"} detail={selectedAsset?.brand} />
            <DetalisFormatted
              title={"Category"}
              detail={selectedAsset?.category}
            />
            <DetalisFormatted
              title={"Sub Category"}
              detail={selectedAsset?.subCategory?.subCategoryName}
            />
            <DetalisFormatted
              title={"Purchase Date"}
              detail={formatDateTime(selectedAsset?.purchaseDate)}
            />
            <DetalisFormatted
              title={"Warranty (Months)"}
              detail={selectedAsset?.warranty ?? "N/A"}
            />
            <DetalisFormatted
              title={"Warranty Expiry Date"}
              detail={
                selectedAsset?.warrantyExpiryDate
                  ? humanDate(selectedAsset?.warrantyExpiryDate)
                  : "N/A"
              }
            />
            <DetalisFormatted
              title={"Rented Months"}
              detail={selectedAsset?.rentedMonths ?? "N/A"}
            />
            <DetalisFormatted
              title={"Rented Expiration Date"}
              detail={
                selectedAsset?.rentedExpirationDate
                  ? humanDate(selectedAsset?.rentedExpirationDate)
                  : "N/A"
              }
            />
            <DetalisFormatted
              title={"Price"}
              //detail={inrFormat(selectedAsset?.price)}
              detail={`INR ${inrFormat(selectedAsset?.price)}`}
            />
            <DetalisFormatted
              title={"Serial Number"}
              detail={selectedAsset?.serialNumber || "N/A"}
            />
            <DetalisFormatted
              title={"Description"}
              detail={selectedAsset?.description || "N/A"}
            />
            <DetalisFormatted
              title={"Ownership Type"}
              detail={selectedAsset?.ownershipType || "N/A"}
            />
            <DetalisFormatted
              title={"Tangable"}
              detail={selectedAsset?.tangable ? "Yes" : "No"}
            />
            <DetalisFormatted
              title={"Status"}
              detail={selectedAsset?.status || "N/A"}
            />
              <DetalisFormatted
              title={"Department"}
              detail={selectedAsset?.department || "N/A"}
            />
            <DetalisFormatted
              title={"Building"}
              detail={
                selectedAsset?.assetLocation?.building?.buildingName ||
                selectedAsset?.building ||
                "N/A"
              }
            />
            <DetalisFormatted
              title={"UnitNo"}
              detail={
                selectedAsset?.assetLocation?.unitNo || selectedAsset?.unit || "N/A"
              }
            />
            <DetalisFormatted
              title={"Assigned Building"}
              detail={selectedAsset?.assignedBuilding || "N/A"}
            />
            <DetalisFormatted
              title={"Assigned Unit"}
              detail={selectedAsset?.assignedUnit || "N/A"}
            />
              {/* <DetalisFormatted
                title={"Department"}
                detail={selectedAsset?.department || "N/A"}
              />
             <DetalisFormatted
                           title={"Building"}
                           detail={
                             selectedAsset?.location?.building?.buildingName ||
                             selectedAsset?.building ||
                             "N/A"
                           }
                         />
                         <DetalisFormatted
                           title={"UnitNo"}
                           detail={selectedAsset?.location?.unitNo || selectedAsset?.unit || "N/A"}
                         /> */}
            <DetalisFormatted
              title={"Damaged"}
              detail={selectedAsset?.isDamaged ? "Yes" : "No"}
            />
            <DetalisFormatted
              title={"Under Maintenance"}
              detail={selectedAsset?.isUnderMaintenance ? "Yes" : "No"}
            />
            <DetalisFormatted
              title={"Extra"}
              detail={selectedAsset?.isExtra ? "Yes" : "No"}
            />
            <DetalisFormatted
              title={"Revoked"}
              detail={selectedAsset?.isRevoked ? "Yes" : "No"}
            />
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default AssignedAssets;
