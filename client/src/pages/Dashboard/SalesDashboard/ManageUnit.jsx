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
import { MenuItem } from "@mui/material";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import { inrFormat } from "../../../utils/currencyFormat";

export default function ManageUnit() {
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const axios = useAxiosPrivate();

  const {
    register,
    handleSubmit,
    setValue,
    unregister,
    control,
    formState: { errors },
  } = useForm({ mode: "onChange", defaultValues: { buildingId: "" } });

  const { data: unitsData = [], isPending: isUnitsDataPending } = useQuery({
    queryKey: ["units-data"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        const data = response.data
          .filter((item) => item.isActive)
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
      queryClient.invalidateQueries(["units-data"]);
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
      queryClient.invalidateQueries(["units-data"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEditClick = (unit) => {
    setModalMode("edit");
    setValue("unitId", unit._id);
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

  const tableData = unitsData.map((item, index) => ({
    srNo: index + 1,
    unitId: item._id,
    unitNo: item.unitNo,
    unitName: item.unitName,
    sqft: item.sqft,
    openDesks: item.openDesks,
    cabinDesks: item.cabinDesks,
    buildingName: item.building?.buildingName || "-",
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
    {
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <div
          onClick={() => {
            handleEditClick(params.data.fullData);
          }}
          className="flex justify-center items-center p-2 w-[50px] h-[50px] cursor-pointer"
        >
          <HiPencilSquare size={20} />
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (modalMode === "edit") {
      unregister("unitName");
      unregister("unitNo");
      unregister("sqft");
      unregister("buildingId");
    }
  }, [modalMode]);

  return (
    <div className="p-4 flex flex-col gap-4">
      <PageFrame>
        <AgTable
          data={tableData}
          columns={columns}
          search
          tableTitle="Manage Units"
          loading={isUnitsDataPending}
          buttonTitle="Add new unit"
          handleClick={handleAddClick}
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

          <PrimaryButton
            disabled={isUpdatePending || isCreatePending}
            type="submit"
            title={modalMode === "edit" ? "Update Unit" : "Add Unit"}
          />
        </form>
      </MuiModal>
    </div>
  );
}
