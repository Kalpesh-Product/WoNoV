import React, { useState, useMemo } from "react";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import MuiModal from "../../../components/MuiModal";
import { TextField, MenuItem } from "@mui/material";
import PageFrame from "../../../components/Pages/PageFrame";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useForm } from "react-hook-form";
import { inrFormat } from "../../../utils/currencyFormat";
import humanDate from "../../../utils/humanDateForamt";
import ThreeDotMenu from "../../../components/ThreeDotMenu";

const AssignAssets = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const assignTypes = ["Rental", "Permanent"];
  const departmentId = useSelector((state) => state.assets.selectedDepartment);
  const { handleSubmit, control, watch } = useForm({});

  const selectedLocation = watch("location");
  const selectedUnit = watch("floor");

  //-----------------------API----------------------//
  const { data: assetsList = [], isPending: isAssetsListPending } = useQuery({
    queryKey: ["assetsList"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/assets/get-assets?departmentId=${departmentId}`
        );
        const filtered = response.data.flatMap((item) => item.assets);
        return filtered;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const {
    data: units = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-simple-units");

      return response.data;
    },
  });

  const selectedUnitId = useMemo(() => {
    if (!selectedUnit || !selectedLocation) return null;
    const unit = units.find(
      (unit) =>
        unit.unitNo === selectedUnit &&
        unit.building?.buildingName === selectedLocation // use ?. here too
    );
    return unit ? unit._id : null;
  }, [selectedUnit, selectedLocation, units]);

  const uniqueBuildings = Array.from(
    new Map(
      units.length > 0
        ? units.map((loc) => [
            loc.building?._id ?? `unknown-${loc.unitNo}`,
            loc.building?.buildingName ?? "Unknown Building",
          ])
        : []
    ).entries()
  );
  //-----------------------API----------------------//
  //-----------------------Event handlers----------------------//

  // Handle Assign button click
  const handleAssignAsset = (asset) => {
    setSelectedAsset(asset);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAsset(null);
  };
  //-----------------------Event handlers----------------------//
  //-----------------------Table Data----------------------//
  const assetsColumns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "department", headerName: "Department" },
    { field: "assetId", headerName: "Asset ID" },
    { field: "brand", headerName: "Brand" },
    {
      field: "price",
      headerName: "Price (INR)",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "purchaseDate",
      headerName: "Purchase Date",
      cellRenderer: (params) => humanDate(params.value),
    },
    { field: "warranty", headerName: "Warranty (Months)" },
    // { field: "location", headerName: "Location" },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <ThreeDotMenu
        rowId={params.data._id}
        menuItems={[
          { label: "Assign", onClick: () => handleAssignAsset(params.data) },
        ]}
        />
      ),
    },
  ];

  const tableData = isAssetsListPending
    ? []
    : assetsList.map((item, index) => ({
        ...item,
        srNo: index + 1,
        department: item?.department?.name,
        subCategory: item?.subCategory?.subCategoryName,
      }));

  console.log("table data : ", tableData);

  //-----------------------Table Data----------------------//

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <AgTable
          search={true}
          searchColumn={"assetNumber"}
          tableTitle={"Assign Assets"}
          data={tableData}
          columns={assetsColumns}
        />
      </PageFrame>
      <MuiModal open={openModal} onClose={()=>setOpenModal(false)} title={''}>

      </MuiModal>
    </div>
  );
};

export default AssignAssets;
