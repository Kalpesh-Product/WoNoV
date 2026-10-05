import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, MenuItem, TextField } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import { toast } from "sonner";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useEffect } from "react";
import humanTime from "../../../../utils/humanTime";
import dayjs from "dayjs";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";
import { HiPencilSquare } from "react-icons/hi2";
import { IoEyeOutline } from "react-icons/io5";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";
import useAuth from "../../../../hooks/useAuth";
import ConfirmationModal from "../../../../components/ConfirmationModal";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const Shifts = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const isTechDepartment = auth?.user?.departments?.some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      ["tech", "tech department"].includes(
        department?.name?.trim().toLowerCase(),
      ),
  );
  const {
    handleSubmit: handleAddSubmit,
    control: addControl,
    reset: resetAddForm,
    formState: { errors: addingErrors },
  } = useForm({
    defaultValues: {
      shiftName: "",
      startTime: null,
      endTime: null,
    },
    mode: "onChange",
  });

  const {
    handleSubmit: handleEditSubmit,
    control: editControl,
    reset: resetEditForm,
    setValue: setEditValue,
    formState: { errors: editingErrors },
  } = useForm({
    defaultValues: {
      shiftName: "",
      startTime: null,
      endTime: null,
      isActive: true,
    },
    mode: "onChange",
  });
  const { mutate: addMutation, isPending: isAddPending } = useMutation({
    mutationKey: ["shifts", "add"],
    mutationFn: async (data) => {
      const response = await axios.post("/api/company/add-shift", {
        shiftName: data.shiftName,
        startTime: data.startTime,
        endTime: data.endTime,
      });

      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setOpenModal(false);
      resetAddForm();
      // console.log("data", data);
    },
    onError: function (error) {
      toast.error(error.response?.data?.message || "Addition failed");
    },
  });

  const handleEdit = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleView = (item) => {
    setModalMode("view");
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleDelete = (item) => {
    setConfirmationAction({
      type: isTechDepartment ? "permanent-delete" : "delete",
      item,
    });
  };

  const handleRestore = (item) => {
    setConfirmationAction({ type: "restore", item });
  };

  const handlePermanentDelete = (item) => {
    setConfirmationAction({ type: "permanent-delete", item });
  };

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch(
        "/api/company/update-company-data",
        payload,
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Shift updated");

      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setOpenModal(false);
      setConfirmationAction(null);
      resetEditForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const fetchShifts = async () => {
    try {
      const response = await axios.get(
        `/api/company/get-company-data/?field=shifts${
          isTechDepartment ? "&includeDeleted=true" : ""
        }`,
      );
      return response.data.shifts;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts", Boolean(isTechDepartment)],
    queryFn: fetchShifts,
  });

  const onAddSubmit = (data) => {
    addMutation(data);
  };

  const onEditSubmit = (data) => {
    const payload = {
      type: "shifts",
      itemId: selectedItem._id,
      name: data.shiftName,
      startTime: data.startTime,
      endTime: data.endTime,
      isActive: data.isActive === "true",
    };
    updateMutation.mutate(payload);
  };

  const departmentsColumn = [
    { field: "id", headerName: "Sr No", width: 300 },
    {
      field: "shift",
      headerName: "Shift List",
      flex: 1,
      cellRenderer: (params) => {
        return (
          <div>
            <span className="">{params.value}</span>
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      sort: "desc",
      flex: 1,
      cellRenderer: (params) => {
        const status = params.data.isDeleted
          ? "Disabled"
          : params.value
            ? "Active"
            : "Inactive";
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          Disabled: { backgroundColor: "#D3D3D3", color: "#666666" },
        };

        const { backgroundColor, color } = statusColorMap[status] || {
          backgroundColor: "gray",
          color: "white",
        };

        return (
          <Chip
            label={status}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
    {
      field: "startTime",
      headerName: "Start Time",
      flex: 1,
      hide: true,
      valueGetter: (params) => humanTime(params?.data?.startTime) || "N/A",
    },
    {
      field: "endTime",
      headerName: "End Time",
      flex: 1,
      hide: true,
      valueGetter: (params) => humanTime(params?.data?.endTime) || "N/A",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        const isDeleted = params.data.isDeleted;

        return (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              title="View shift"
              aria-label="View shift"
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
              onClick={() => handleView(params.data)}
            >
              <IoEyeOutline size={24} />
            </button>

            {isDeleted ? (
              <>
                <button
                  type="button"
                  title="Restore shift"
                  aria-label="Restore shift"
                  className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
                  onClick={() => handleRestore(params.data)}
                >
                  <MdOutlineRestore size={24} />
                </button>
                <button
                  type="button"
                  title="Permanently delete shift"
                  aria-label="Permanently delete shift"
                  className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700"
                  onClick={() => handlePermanentDelete(params.data)}
                >
                  <MdDeleteForever size={24} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  title="Edit shift"
                  aria-label="Edit shift"
                  className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
                  onClick={() => handleEdit(params.data)}
                >
                  <HiPencilSquare size={24} />
                </button>
                <button
                  type="button"
                  title={isTechDepartment ? "Permanently delete shift" : "Delete shift"}
                  aria-label={isTechDepartment ? "Permanently delete shift" : "Delete shift"}
                  className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(params.data)}
                >
                  <MdDeleteForever size={24} />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (modalMode === "edit" && selectedItem) {
      setEditValue("shiftName", selectedItem?.shift);
      setEditValue("isActive", selectedItem?.status);
      setEditValue("startTime", dayjs(selectedItem?.startTime));
      setEditValue("endTime", dayjs(selectedItem?.endTime));
    }
  }, [modalMode, selectedItem, setEditValue]);

  const transformedData = isAddPending ? [] : shifts;

  const handleConfirmAction = () => {
    if (!confirmationAction?.item?._id) return;

    const payload = {
      type: "shifts",
      itemId: confirmationAction.item._id,
      action: confirmationAction.type,
    };
    updateMutation.mutate(payload);
  };

  const confirmationContent = {
    delete: {
      title: "Delete Shift",
      message: `Are you sure you want to delete ${
        confirmationAction?.item?.shift || "this shift"
      }?`,
    },
    restore: {
      title: "Restore Shift",
      message: `Are you sure you want to restore ${
        confirmationAction?.item?.shift || "this shift"
      }?`,
    },
    "permanent-delete": {
      title: "Permanently Delete Shift",
      message: `Are you sure you want to permanently delete ${
        confirmationAction?.item?.shift || "this shift"
      }?`,
    },
  }[confirmationAction?.type];

  return (
    <PageFrame>
      <div>
        <AgTable
          search={true}
          searchColumn={"Shifts"}
          tableTitle={"Shift List"}
          buttonTitle={"Add Shift List"}
          handleClick={() => {
            setModalMode("add");
            setOpenModal(true);
          }}
          data={[
            ...transformedData.map((shift, index) => ({
              id: index + 1, // Auto-increment Sr No
              shift: shift.name,
              status: shift.isActive,
              startTime: shift.startTime,
              endTime: shift.endTime,
              isDeleted: Boolean(shift.isDeleted),
              deletedByName: shift.deletedBy
                ? [shift.deletedBy.firstName, shift.deletedBy.lastName]
                    .filter(Boolean)
                    .join(" ") ||
                  shift.deletedBy.employeeName ||
                  shift.deletedBy.name ||
                  shift.deletedBy.email ||
                  "N/A"
                : "N/A",
              _id: shift._id,
            })),
          ]}
          columns={departmentsColumn}
          getRowStyle={(params) =>
            params.data?.isDeleted
              ? { backgroundColor: "#f4f4f4", color: "#7a7a7a" }
              : undefined
          }
          exportData
        />

        <div>
          <MuiModal
            title={
              modalMode === "add"
                ? "Add Shift"
                : modalMode === "edit"
                  ? "Update Shift"
                  : "Shift Details"
            }
            open={openModal}
            onClose={() => setOpenModal(false)}
          >
            {modalMode === "add" && (
              <form
                onSubmit={handleAddSubmit(onAddSubmit)}
                className="flex flex-col gap-4"
              >
                <Controller
                  name="shiftName"
                  control={addControl}
                  rules={{
                    required: "Please provide a shift name",
                    validate: { isAlphanumeric, noOnlyWhitespace },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      fullWidth
                      label="Shift Name"
                      error={!!addingErrors.shiftName}
                      helperText={addingErrors.shiftName?.message}
                    />
                  )}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="startTime"
                    control={addControl}
                    rules={{
                      required: "Start time is required",
                    }}
                    render={({ field }) => (
                      <TimePicker
                        {...field}
                        label="Select Start Time"
                        slotProps={{
                          textField: {
                            size: "small",
                            error: !!addingErrors.startTime,
                            helperText: addingErrors.startTime?.message,
                          },
                        }}
                        render={(params) => <TextField {...params} fullWidth />}
                      />
                    )}
                  />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="endTime"
                    control={addControl}
                    rules={{
                      required: "End time is required",
                    }}
                    render={({ field }) => (
                      <TimePicker
                        {...field}
                        label="Select End Time"
                        slotProps={{
                          textField: {
                            size: "small",
                            error: !!addingErrors.endTime,
                            helperText: addingErrors.endTime?.message,
                          },
                        }}
                        render={(params) => <TextField {...params} fullWidth />}
                      />
                    )}
                  />
                </LocalizationProvider>

                <PrimaryButton
                  title="Add Shift"
                  type="submit"
                  isLoading={isAddPending}
                />
              </form>
            )}
            {modalMode === "edit" && (
              <form
                onSubmit={handleEditSubmit(onEditSubmit)}
                className="flex flex-col gap-4"
              >
                <Controller
                  name="shiftName"
                  control={editControl}
                  rules={{
                    required: "Please provide a shift name",
                    validate: { isAlphanumeric, noOnlyWhitespace },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      fullWidth
                      label="Shift Name"
                      error={!!editingErrors.shiftName}
                      helperText={editingErrors.shiftName?.message}
                    />
                  )}
                />

                <Controller
                  name="startTime"
                  control={editControl}
                  rules={{
                    required: "Start time is required",
                  }}
                  render={({ field }) => (
                    <TimePicker
                      {...field}
                      label="Select Start Time"
                      slotProps={{
                        textField: {
                          size: "small",
                          error: !!editingErrors.startTime,
                          helperText: editingErrors.startTime?.message,
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="endTime"
                  control={editControl}
                  rules={{
                    required: "End time is required",
                  }}
                  render={({ field }) => (
                    <TimePicker
                      {...field}
                      label="Select End Time"
                      slotProps={{
                        textField: {
                          size: "small",
                          error: !!editingErrors.endTime,
                          helperText: editingErrors?.endTime?.message,
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="isActive"
                  control={editControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Active Status"
                      select
                      fullWidth
                    >
                      <MenuItem value="" disabled>
                        Select Active Status
                      </MenuItem>
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </TextField>
                  )}
                />

                <PrimaryButton
                  title="Update Shift"
                  type="submit"
                  isLoading={isAddPending}
                />
              </form>
            )}

            {modalMode === "view" && (
              <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto">
                <DetalisFormatted
                  title="Shift Name"
                  detail={selectedItem?.shift || "N/A"}
                />
                <DetalisFormatted
                  title="Status"
                  detail={
                    selectedItem?.isDeleted
                      ? "Disabled"
                      : selectedItem?.status
                        ? "Active"
                        : "Inactive"
                  }
                />
                <DetalisFormatted
                  title="Start Time"
                  detail={
                    selectedItem?.startTime
                      ? humanTime(selectedItem.startTime)
                      : "N/A"
                  }
                />
                <DetalisFormatted
                  title="End Time"
                  detail={
                    selectedItem?.endTime
                      ? humanTime(selectedItem.endTime)
                      : "N/A"
                  }
                />
                {selectedItem?.isDeleted && (
                  <DetalisFormatted
                    title="Deleted By"
                    detail={selectedItem.deletedByName || "N/A"}
                  />
                )}
              </div>
            )}
          </MuiModal>
        </div>

        <ConfirmationModal
          open={Boolean(confirmationAction)}
          title={confirmationContent?.title}
          message={confirmationContent?.message}
          confirmText="Yes"
          cancelText="No"
          isLoading={updateMutation.isPending}
          onClose={() => setConfirmationAction(null)}
          onConfirm={handleConfirmAction}
        />
      </div>
    </PageFrame>
  );
};

export default Shifts;
