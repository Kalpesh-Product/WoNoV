import React, { useState, useMemo } from "react";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import MuiModal from "../../../components/MuiModal";
import { TextField, MenuItem, CircularProgress } from "@mui/material";
import PageFrame from "../../../components/Pages/PageFrame";
import { useSelector } from "react-redux";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { Controller, useForm } from "react-hook-form";
import { inrFormat } from "../../../utils/currencyFormat";
import humanDate from "../../../utils/humanDateForamt";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { toast } from "sonner";
import { queryClient } from "../../../main";
import StatusChip from "../../../components/StatusChip";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useLocation } from "react-router-dom";

const AssignAssets = ({ availableOnly = false, tableTitle = "Overall Asset" }) => {
  const axios = useAxiosPrivate();
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [selectedAsset, setSelectedAsset] = useState([]);
  const departmentId = useSelector((state) => state.assets.selectedDepartment);
  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      assetId: "",
      toDepartmentIdId: "",
      assignee: "",
      building: "",
      unit: "",
    },
  });

  const selectedLocation = watch("building");
  const selectedUnit = watch("floor");
  const [selectedDepartment, setSelectedDepartment] = useState("");
   const isAvailableView = availableOnly || location.state?.assetViewFilter === "available";
  //const isAvailableView = location.state?.assetViewFilter === "available";
  //-----------------------API----------------------//
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

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

  const { mutate: assignAsset, isPending: isAssigning } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/assets/new-asset-assignment", {
        ...data,
        fromDepartmentId: departmentId,
        assetId: selectedAsset?._id,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "ASSIGNED");
      queryClient.invalidateQueries({ queryKey: ["assetsList"] });
      setOpenModal(false);
      reset();
    },
        onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to assign asset"
      );
    },
  });
  //   onError: (error) => {
  //     toast.error(error.message || "Failed to assign asset");
  //   },
  // });
  //-----------------------API----------------------//
  //---------------------------------------Data processing----------------------------------------------------//
  const departmentMap = new Map();
  employees.forEach((employee) => {
    employee.departments?.forEach((department) => {
      departmentMap.set(department._id, department);
    });
  });
  const uniqueDepartments = Array.from(departmentMap.values());

  const departmentEmployees = employees.filter((item) =>
    item.departments?.some((dept) => dept._id === selectedDepartment)
  );
  //---------------------------------------Data processing----------------------------------------------------//
  //-----------------------Event handlers----------------------//

  // Handle Assign button click
  const handleViewAsset = (asset) => {
    setModalMode("view");
    setSelectedAsset(asset);
    setOpenModal(true);
  };
  const handleAssignAsset = (asset) => {
    setModalMode("assign");
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
    { field: "assetId", headerName: "Asset ID" },
    { field: "assetType", headerName: "Asset Type", hide: true },
    { field: "secondaryId", headerName: "Secondary ID", hide: true },
    { field: "departmentAssetId", headerName: "Department Asset ID", hide: true },
    { field: "brand", headerName: "Brand" },
    { field: "department", headerName: "Department", hide: true },
    { field: "underMaintenanceLabel", headerName: "Under Maintenance", hide: true },
    { field: "name", headerName: "Asset Name" },
    { field: "serialNumber", headerName: "Serial Number" },
    { field: "building", headerName: "Building" },
    { field: "unit", headerName: "Location" },
    { field: "ownershipType", headerName: "Ownership Type", hide: true },
    { field: "rentedMonths", headerName: "Rented Months", hide: true },
    {
      field: "rentalExpiry",
      headerName: "Rented Expiration Date",
      hide: true,
      exportFormat: "date",
      cellRenderer: (params) => params.value || "N/A",
    },
    {
      field: "price",
      headerName: "Price (INR)",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "purchaseOn",
      headerName: "Purchase Date",
      exportFormat: "date",
      cellRenderer: (params) => params.value || "N/A",
    },
    { field: "warranty", headerName: "Warranty (Months)" },
    {
      field: "warrantyExpiry",
      headerName: "Warranty Expiry Date",
      hide: true,
      exportFormat: "date",
      cellRenderer: (params) => params.value || "N/A",
    },
    { field: "description", headerName: "Description", hide: true },
    { field: "assetStatus", headerName: "Status", hide: true },
    { field: "subCategory", headerName: "Sub Category", hide: true },
    { field: "tangableLabel", headerName: "Tangable", hide: true },
    { field: "damagedLabel", headerName: "Damaged", hide: true },
    { field: "extraLabel", headerName: "Extra", hide: true },
    {
      field: "assignedLabel",
      headerName: "Assigned",
      hide: true,
    },
    {
      field: "isAssigned",
      headerName: "Status",
      pinned: "right",
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => {
        const isAssignable = params.data.isAssigned === "Available";
        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="View"
              className="p-1 text-gray-600 hover:text-primary"
              onClick={() => handleViewAsset(params.data)}
            >
              <MdOutlineRemoveRedEye size={20} />
            </button>
            {isAssignable && (
              <ThreeDotMenu
                rowId={params.data._id}
                menuItems={[
                  {
                    label: "Assign",
                    onClick: () => handleAssignAsset(params.data),
                  },
                ]}
              />
            )}
          </div>
        );
      },
    },
  ];

  const tableData = isAssetsListPending
    ? []
    : assetsList
      .filter((item) => {
        const normalizedStatus = String(item?.status ?? "").trim().toLowerCase();
        const isActive = normalizedStatus
          ? normalizedStatus === "active"
          : item?.isActive === true;

        if (!isActive) return false;

        if (!isAvailableView) return true;

        const assignmentState = String(item?.assignmentState ?? "")
          .trim()
          .toLowerCase();

        if (assignmentState) return assignmentState === "available";
        return !item?.isAssigned;
      })
      .map((item, index) => ({
        ...item,
        srNo: index + 1,
        department: item?.department?.name || "N/A",
        subCategory: item?.subCategory?.subCategoryName || "N/A",
        assetType: item?.assetType || "N/A",
        secondaryId: item?.secondaryId || "N/A",
        departmentAssetId: item?.departmentAssetId || "N/A",
        building:
          item?.location?.building?.buildingName ||
          item?.building?.buildingName ||
          item?.buildingName ||
          "N/A",
        location: item?.location || null,
        unit: item?.location?.unitNo || "N/A",
        underMaintenanceLabel: item?.isUnderMaintenance ? "Yes" : "No",
        ownershipType: item?.ownershipType || "N/A",
        rentedMonths: item?.rentedMonths ?? "N/A",
        purchaseOn: item?.purchaseDate ? humanDate(item.purchaseDate) : "N/A",
        rentalExpiry: item?.rentedExpirationDate
          ? humanDate(item.rentedExpirationDate)
          : "N/A",
        warrantyExpiry: item?.warrantyExpiryDate
          ? humanDate(item.warrantyExpiryDate)
          : "N/A",
        description: item?.description || "N/A",
        assetStatus: item?.status || "N/A",
        tangableLabel: item?.tangable ? "Yes" : "No",
        damagedLabel: item?.isDamaged ? "Yes" : "No",
        extraLabel: item?.isExtra ? "Yes" : "No",
        assignedLabel: item?.isAssigned ? "Yes" : "No",
        isAssigned:
          item?.assignmentState || (item?.isAssigned ? "Assigned" : "Available"),
      }));

  //-----------------------Table Data----------------------//

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <AgTable
          key={assetsList.length}
          search={true}
           tableTitle={tableTitle}
          //tableTitle={"Assign Assets"}
          data={tableData}
          columns={assetsColumns}
          exportData
        />
      </PageFrame>
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={modalMode === "assign" ? "Assign Asset" : "View Asset"}
      >
        {modalMode === "view" && (
          <div className="grid grid-cols-1 gap-4">
            <DetalisFormatted
              title={"Asset ID"}
              detail={selectedAsset?.assetId || "N/A"}
            />
            <DetalisFormatted
              title={"Asset Name"}
              detail={selectedAsset?.name || "N/A"}
            />
            <DetalisFormatted
              title={"Asset Type"}
              detail={selectedAsset?.assetType || "N/A"}
            />
             <DetalisFormatted
              title={"Secondary ID"}
              detail={selectedAsset?.secondaryId || "N/A"}
            />
            <DetalisFormatted
              title={"Department Asset ID"}
              detail={selectedAsset?.departmentAssetId || "N/A"}
            />
            <DetalisFormatted
              title={"Brand"}
              detail={selectedAsset?.brand || "N/A"}
            />
            <DetalisFormatted
              title={"Department"}
              detail={selectedAsset?.department || "N/A"}
            />
            <DetalisFormatted
              title={"Under Maintenance"}
              detail={selectedAsset?.isUnderMaintenance ? "Yes" : "No"}
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
            />
            <DetalisFormatted
              title={"Ownership Type"}
              detail={selectedAsset?.ownershipType || "N/A"}
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
             // detail={inrFormat(selectedAsset?.price)}
              detail={`INR ${inrFormat(selectedAsset?.price)}`}

            />
            <DetalisFormatted
              title={"Purchase Date"}
              detail={humanDate(selectedAsset?.purchaseDate)}
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
              title={"Serial Number"}
              detail={selectedAsset?.serialNumber || "N/A"}
            />
            <DetalisFormatted
              title={"Description"}
              detail={selectedAsset?.description || "N/A"}
            />
            <DetalisFormatted
              title={"Status"}
              detail={selectedAsset?.status || "N/A"}
            />
            <DetalisFormatted
              title={"Sub Category"}
              detail={selectedAsset?.subCategory || "N/A"}
            />
            <DetalisFormatted
              title={"Tangable"}
              detail={selectedAsset?.tangable ? "Yes" : "No"}
            />
             <DetalisFormatted
              title={"Damaged"}
              detail={selectedAsset?.isDamaged ? "Yes" : "No"}
            />
            <DetalisFormatted
              title={"Extra"}
              detail={selectedAsset?.isExtra ? "Yes" : "No"}
            />
            <DetalisFormatted
              title={"Assigned"}
              detail={selectedAsset?.isAssigned ? "Yes" : "No"}
            />
            {/* <DetalisFormatted title={"Asset ID"} detail={selectedAsset?.status || "N/A"}/> */}
          </div>
        )}

        {modalMode === "assign" && (
          <form
            onSubmit={handleSubmit((data) => assignAsset(data))}
            className="grid grid-cols-2 gap-4"
          >
            <Controller
              name="toDepartmentId"
              control={control}
              rules={{ required: "Department is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  onChange={(e) => {
                    field.onChange(e);
                    setSelectedDepartment(e.target.value);
                  }}
                  label="Department"
                  size="small"
                >
                  <MenuItem value="" disabled>
                    <em>Select a Department</em>
                  </MenuItem>
                  {uniqueDepartments.map((department) => (
                    <MenuItem key={department._id} value={department._id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="assignee"
              control={control}
              rules={{ required: "Assignee is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  disabled={!selectedDepartment}
                  size="small"
                  label="Assignee"
                >
                  {departmentEmployees.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="building"
              control={control}
              rules={{ required: "Building is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  error={!!errors.building}
                  helperText={errors?.building?.message}
                  label="Building"
                >
                  <MenuItem value="" disabled>
                    Select Building
                  </MenuItem>
                  {locationsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : locationsError ? (
                    <MenuItem disabled>Error fetching units</MenuItem>
                  ) : (
                    uniqueBuildings.map(([id, name]) => (
                      <MenuItem key={id} value={name}>
                        {name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            />

            <Controller
              name="location"
              control={control}
              rules={{ required: "Unit is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Select Unit"
                  size="small"
                  fullWidth
                  disabled={!selectedLocation}
                  value={field.value}
                  error={!!errors.location}
                  helperText={errors?.location?.message}
                  onChange={(event) => field.onChange(event.target.value)}
                >
                  <MenuItem value="" disabled>
                    Select Unit
                  </MenuItem>
                  {units
                    .filter(
                      (unit) =>
                        unit.building &&
                        unit.building.buildingName === selectedLocation
                    )
                    .map((unit) => (
                      <MenuItem key={unit._id} value={unit._id}>
                        {unit.unitNo}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />
            <PrimaryButton
              title={"Assign Asset"}
              type={"submit"}
              isLoading={isAssigning}
              disabled={isAssigning}
              externalStyles={"col-span-2"}
            />
          </form>
        )}
      </MuiModal>
    </div>
  );
};

export default AssignAssets;
