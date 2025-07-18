import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, FormControl, MenuItem, Select, TextField } from "@mui/material";
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
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";

const Shifts = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
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
    const payload = {
      type: "shifts",
      itemId: item._id,
      isDeleted: true,
    };
    setModalMode("delete");
    setOpenModal(true);
    setSelectedItem(item);
    // updateMutation.mutate(payload);
  };

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch(
        "/api/company/update-company-data",
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      if (modalMode === "delete") {
        toast.success("Shift deleted");
      } else {
        toast.success("Shift updated");
      }

      queryClient.invalidateQueries(["shifts"]);
      setOpenModal(false);
      resetEditForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const fetchShifts = async () => {
    try {
      const response = await axios.get(
        "/api/company/get-company-data/?field=shifts"
      );
      return response.data.shifts;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
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
    { field: "id", headerName: "Sr No" },
    {
      field: "shift",
      headerName: "Shift List",
      cellRenderer: (params) => {
        return (
          <div>
            <span className="">{params.value}</span>
          </div>
        );
      },
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive"; // Map boolean to string status
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
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
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
            {/* <span className="text-content text-primary hover:underline cursor-pointer">
                  Make Inactive
                </span> */}
            {/* <span
              onClick={() => handleEdit(params.data)}
              className="text-subtitle hover:bg-gray-300 rounded-full cursor-pointer p-1"
            >
              <HiOutlinePencilSquare />
            </span> */}

            <ThreeDotMenu
              rowId={params.data.id}
              menuItems={[
                {
                  label: "View",
                  onClick: () => handleView(params.data),
                },
                {
                  label: "Edit",
                  onClick: () => handleEdit(params.data),
                },
                {
                  label: "Delete",
                  onClick: () => handleDelete(params.data),
                },
              ]}
            />
          </div>
        </>
      ),
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

  const transformedData = isAddPending
    ? []
    : shifts.filter((data) => !data.isDeleted);

  const handleConfirmDelete = () => {
    const payload = {
      type: "shifts",
      itemId: selectedItem._id,
      isDeleted: true,
    };
    updateMutation.mutate(payload);
  };

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
              _id: shift._id,
            })),
          ]}
          columns={departmentsColumn}
        />

        <div>
          <MuiModal
            title={modalMode === "add" ? "Add Shift" : "Update Shift"}
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
                    <TextField {...field} size="small" select fullWidth>
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

            {modalMode === "delete" && (
              <div className="space-y-4">
                <p>
                  Are you sure you want to delete <b>{selectedItem?.shift}</b>?
                </p>
                <div className="flex gap-4 justify-end">
                  <PrimaryButton
                    title="Cancel"
                    handleSubmit={() => setOpenModal(false)}
                  />
                  <PrimaryButton
                    title="Confirm Delete"
                    handleSubmit={handleConfirmDelete}
                    isLoading={updateMutation.isPending}
                  />
                </div>
              </div>
            )}
            {modalMode === "view" && (
              <MuiModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                title={"Shift Details"}
              >
                <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[70vh]">
                  <DetalisFormatted
                    title="Shift Name"
                    detail={selectedItem?.shift || "N/A"}
                  />
                  <DetalisFormatted
                    title="Status"
                    detail={selectedItem?.status ? "Active" : "Inactive"}
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
                </div>
              </MuiModal>
            )}
          </MuiModal>
        </div>
      </div>
    </PageFrame>
  );
};

export default Shifts;
