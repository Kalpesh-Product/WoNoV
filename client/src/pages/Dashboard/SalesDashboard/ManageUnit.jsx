import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery, useMutation } from "@tanstack/react-query";
import AgTable from "../../../components/AgTable";
import PageFrame from "../../../components/Pages/PageFrame";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../../components/MuiModal";
import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import PrimaryButton from "../../../components/PrimaryButton";
import { toast } from "sonner";
import { queryClient } from "../../../main";
import { HiPencilSquare } from "react-icons/hi2";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";
import { MenuItem } from "@mui/material";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import { inrFormat } from "../../../utils/currencyFormat";
import useAuth from "../../../hooks/useAuth";
import ConfirmationModal from "../../../components/ConfirmationModal";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

export default function ManageUnit() {
  const [openEdit, setOpenEdit] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [confirmationAction, setConfirmationAction] = useState(null);

  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const isTechDepartment = (auth?.user?.departments || []).some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      ["tech", "tech department"].includes(
        department?.name?.trim().toLowerCase(),
      ),
  );

  const {
    register,
    handleSubmit,
    setValue,
    unregister,
    control,
    formState: { errors },
  } = useForm({ mode: "onChange", defaultValues: { buildingId: "" } });

  const { data: unitsData = [], isPending: isUnitsDataPending } = useQuery({
    queryKey: ["units-data", Boolean(isTechDepartment)],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units", {
          params: { includeDeleted: isTechDepartment },
        });
        const data = response.data
          .filter(
            (item) => item.isActive || (isTechDepartment && item.isDeleted),
          )
          .filter((item) => !item.isOnlyBudget);
        return data;
      } catch (error) {
        console.error("Error fetching units data:", error);
        return [];
      }
    },
  });

  const { data: buildings, isPending: isBuildingPending } = useQuery({
    queryKey: ["buildings"],
    queryFn: async () => {
      const response = await axios.get("/api/company/buildings");
      return response.data;
    },
  });

  const { mutate: updateUnit, isPending: isUpdatePending } = useMutation({
    mutationKey: ["update-unit"],
    mutationFn: async (data) => {
      const response = await axios.patch("/api/company/update-unit", data);
      return response.data;
    },
    onSuccess: (data) => {
      setOpenEdit(null);
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["units-data"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: createUnit, isPending: isCreatePending } = useMutation({
    mutationKey: ["create-unit"],
    mutationFn: async (data) => {
      const response = await axios.post("/api/company/add-unit", data);
      return response.data;
    },
    onSuccess: (data) => {
      setOpenEdit(false);
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["units-data"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: deleteUnit, isPending: isDeletePending } = useMutation({
    mutationKey: ["delete-unit"],
    mutationFn: async (unitId) => {
      const response = await axios.delete(`/api/company/delete-unit/${unitId}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Unit deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["units-data"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete unit");
    },
  });

  const { mutate: restoreUnit, isPending: isRestorePending } = useMutation({
    mutationKey: ["restore-unit"],
    mutationFn: async (unitId) => {
      const response = await axios.patch(
        `/api/company/restore-unit/${unitId}`,
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Unit restored successfully");
      queryClient.invalidateQueries({ queryKey: ["units-data"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to restore unit");
    },
  });

  const handleEditClick = (unit) => {
    setModalMode("edit");
    setValue("unitId", unit._id);
    setValue("sqft", unit.sqft);
    setValue("openDesks", unit.openDesks);
    setValue("cabinDesks", unit.cabinDesks);
    setOpenEdit(true);
  };

  const handleAddClick = () => {
    setModalMode("add");
    setValue("unitId", "");
    setValue("unitName", "");
    setValue("unitNo", "");
    setValue("sqft", "");
    setValue("buildingId", "");
    setValue("openDesks", "");
    setValue("cabinDesks", "");
    setOpenEdit(true);
  };

  const onSubmit = (data) => {
    if (modalMode === "edit") {
      updateUnit({
        unitId: data.unitId,
        sqft: data.sqft,
        openDesks: data.openDesks,
        cabinDesks: data.cabinDesks,
      });
    } else {
      createUnit({
        buildingId: data.buildingId,
        unitName: data.unitName,
        unitNo: data.unitNo,
        sqft: data.sqft,
        openDesks: data.openDesks,
        cabinDesks: data.cabinDesks,
      });
    }
  };

  const confirmUnitAction = () => {
    const unitId = confirmationAction?.unit?._id;
    if (!unitId) return;

    if (confirmationAction.type === "restore") {
      restoreUnit(unitId);
      return;
    }

    deleteUnit(unitId);
  };

  const confirmationContent = {
    delete: {
      title: "Delete Unit",
      message: "Are you sure you want to delete this unit?",
    },
    "permanent-delete": {
      title: "Permanently Delete Unit",
      message: "Are you sure you want to permanently delete this unit?",
    },
    restore: {
      title: "Restore Unit",
      message: "Are you sure you want to restore this unit?",
    },
  }[confirmationAction?.type];

  const tableData = unitsData.map((item, index) => ({
    srNo: index + 1,
    unitId: item._id,
    unitNo: item.unitNo,
    unitName: item.unitName,
    sqft: item.sqft,
    openDesks: item.openDesks,
    cabinDesks: item.cabinDesks,
    buildingName: item.building?.buildingName || "-",
    isDeleted: Boolean(item.isDeleted),
    deletedByName: item.deletedBy
      ? [item.deletedBy.firstName, item.deletedBy.lastName]
          .filter(Boolean)
          .join(" ") ||
        item.deletedBy.employeeName ||
        item.deletedBy.name ||
        item.deletedBy.email ||
        "—"
      : "—",
    fullData: item, // store full unit for edit
  }));

  const columns = [
    { headerName: "SR NO", field: "srNo", width: 100 },
    { headerName: "Building", field: "buildingName", flex: 1 },
    { headerName: "Unit Name", field: "unitName", flex: 1 },
    { headerName: "Unit No", field: "unitNo", flex: 1 },
    {
      headerName: "Sqft",
      field: "sqft",
      flex: 1,
      cellRenderer: (params) => inrFormat(params.value),
    },
    { headerName: "Open Desks", field: "openDesks", flex: 1 },
    { headerName: "Cabin Desks", field: "cabinDesks", flex: 1 },
    ...(isTechDepartment
      ? [
          ...(unitsData.some((unit) => Boolean(unit.isDeleted))
            ? [
                {
                  headerName: "Deleted By",
                  field: "deletedByName",
                  flex: 1,
                  valueGetter: (params) =>
                    params.data?.isDeleted ? params.data.deletedByName : "",
                },
              ]
            : []),
        ]
      : []),
    {
      headerName: "Actions",
      pinned: "right",
      width: 130,
      cellRenderer: (params) => {
        const unit = params.data.fullData;

        if (unit.isDeleted) {
          return (
            <div className="flex h-full items-center gap-1">
              <button
                type="button"
                aria-label="Restore unit"
                title="Restore unit"
                disabled={isDeletePending || isRestorePending}
                onClick={() =>
                  setConfirmationAction({ type: "restore", unit })
                }
                className="p-1 h-7 w-7 flex items-center justify-center rounded-full text-black hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <MdOutlineRestore size={22} />
              </button>
              <button
                type="button"
                aria-label="Permanently delete unit"
                title="Permanently delete unit"
                disabled={isDeletePending || isRestorePending}
                onClick={() =>
                  setConfirmationAction({ type: "permanent-delete", unit })
                }
                className="p-1 h-7 w-7 flex items-center justify-center rounded-full text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <MdDeleteForever size={22} />
              </button>
            </div>
          );
        }

        return (
          <div className="flex h-full items-center gap-1">
            <button
              type="button"
              aria-label="Edit unit"
              title="Edit unit"
              onClick={() => handleEditClick(unit)}
              className="p-1 h-7 w-7 flex items-center justify-center rounded-full text-black hover:bg-gray-200"
            >
              <HiPencilSquare size={20} />
            </button>
            <button
              type="button"
              aria-label={
                isTechDepartment ? "Permanently delete unit" : "Delete unit"
              }
              title={
                isTechDepartment ? "Permanently delete unit" : "Delete unit"
              }
              disabled={isDeletePending || isRestorePending}
              onClick={() =>
                setConfirmationAction({
                  type: isTechDepartment ? "permanent-delete" : "delete",
                  unit,
                })
              }
              className="p-1 h-7 w-7 flex items-center justify-center rounded-full text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <MdDeleteForever size={22} />
            </button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (modalMode === "edit") {
      unregister("unitName");
      unregister("unitNo");
      unregister("buildingId");
    }
  }, [modalMode, unregister]);

  return (
    <div className="p-4 flex flex-col gap-4">
      <PageFrame>
        <AgTable
          data={tableData}
          columns={columns}
          search
          tableTitle="Manage Units"
          loading={isUnitsDataPending}
          buttonTitle="Add New Unit"
          handleClick={handleAddClick}
          exportData
          getRowStyle={(params) =>
            params.data?.isDeleted
              ? { backgroundColor: "#f4f4f4", color: "#7a7a7a" }
              : undefined
          }
        />
      </PageFrame>

      <MuiModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        title={modalMode === "edit" ? "Edit Unit" : "Add Unit"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {modalMode === "add" && (
            <>
              <Controller
                control={control}
                name="unitName"
                rules={{
                  required: "Unit Name is required",
                  validate: { isAlphanumeric, noOnlyWhitespace },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Unit Name"
                    fullWidth
                    size="small"
                    error={!!errors.unitName}
                    helperText={errors.unitName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="unitNo"
                rules={{
                  required: "Unit No is required",
                  validate: { isAlphanumeric, noOnlyWhitespace },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Unit No"
                    fullWidth
                    size="small"
                    error={!!errors.unitNo}
                    helperText={errors.unitNo?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="sqft"
                rules={{
                  required: "Sqft is required",
                  min: { value: 0, message: "Sqft must be at least 0" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Sqft"
                    type="number"
                    fullWidth
                    size="small"
                    error={!!errors.sqft}
                    helperText={errors.sqft?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="buildingId"
                rules={{ required: "Building is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    size="small"
                    fullWidth
                    label="Building"
                    error={!!errors.buildingId}
                    helperText={errors.buildingId?.message}
                  >
                    <MenuItem value="">
                      <em>Select Building</em>
                    </MenuItem>
                    {buildings?.map((building) => (
                      <MenuItem key={building._id} value={building._id}>
                        {building.buildingName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </>
          )}

          <Controller
            control={control}
            name="openDesks"
            rules={{
              required: "Open Desks is required",
              min: { value: 0, message: "Open Desks must be 0 or more" },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Open Desks"
                type="number"
                fullWidth
                size="small"
                error={!!errors.openDesks}
                helperText={errors.openDesks?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="cabinDesks"
            rules={{
              required: "Cabin Desks is required",
              min: { value: 0, message: "Cabin Desks must be 0 or more" },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cabin Desks"
                type="number"
                fullWidth
                size="small"
                error={!!errors.cabinDesks}
                helperText={errors.cabinDesks?.message}
              />
            )}
          />

          {modalMode === "edit" && (
            <Controller
              control={control}
              name="sqft"
              rules={{
                required: "Sqft is required",
                min: { value: 0, message: "Sqft must be 0 or more" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sqft"
                  type="number"
                  fullWidth
                  size="small"
                  error={!!errors.sqft}
                  helperText={errors.sqft?.message}
                />
              )}
            />
          )}

          <PrimaryButton
            disabled={isUpdatePending || isCreatePending}
            type="submit"
            title={modalMode === "edit" ? "Update Unit" : "Add Unit"}
          />
        </form>
      </MuiModal>

      <ConfirmationModal
        open={Boolean(confirmationAction)}
        title={confirmationContent?.title}
        message={confirmationContent?.message}
        confirmText="Yes"
        cancelText="No"
        isLoading={isDeletePending || isRestorePending}
        onClose={() => setConfirmationAction(null)}
        onConfirm={confirmUnitAction}
      />
    </div>
  );
}
