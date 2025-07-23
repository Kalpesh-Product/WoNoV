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
import { toast } from "sonner";
import { queryClient } from "../../../main";

const AssignedAssets = () => {
  const axios = useAxiosPrivate();
  const [selectedAsset, setSelectedAsset] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const departmentId = useSelector((state) => state.assets.selectedDepartment);
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
      toast.error(error.message || "Failed to revoke asset");
    },
  });

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
        <ThreeDotMenu
          rowId={params.data.assetId}
          menuItems={[
            { label: "View", onClick: () => handleView(params.data) },
            params.data.status !== "Revoked" && {
              label: "Revoke",
              onClick: () => revokeAsset(params.data),
            },
          ]}
        />
      ),
    },
  ];

  const tableData = isAssignedPending
    ? []
    : assignedAssets.map((item, index) => {
        const assets = item.asset;
        const category = assets?.subCategory?.category?.categoryName;
        console.log("assets inside data", category);
        return {
          ...assets,
          ...item,
          srNo: index + 1,
          assignee: `${item.assignee?.firstName} ${item.assignee?.lastName}`,
          assetId: item._id,
          assetNumber: item?.asset?.assetId,
          department: item?.department?.name,
          category: category,
          brand: assets?.brand,
        };
      });

  //-----------------------Table Data----------------------//

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <AgTable
          key={assignedAssets.length}
          search={true}
          tableTitle={"Assigned Assets"}
          data={tableData}
          columns={assetsColumns}
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
              title={"Assigned Date"}
              detail={humanDate(selectedAsset?.createdAt)}
            />
            <DetalisFormatted
              title={"Damaged"}
              detail={selectedAsset?.isDamaged ? "Yes" : "No"}
            />
            <DetalisFormatted
              title={"Revoked"}
              detail={selectedAsset?.isRevoked ? "Yes" : "No"}
            />
            <DetalisFormatted
              title={"Under Maintenance"}
              detail={selectedAsset?.isUnderMaintenance ? "Yes" : "No"}
            />
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default AssignedAssets;
