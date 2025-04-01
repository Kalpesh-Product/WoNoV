import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, TextField } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import { toast } from "sonner";
import SecondaryButton from "../../../../components/SecondaryButton";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const Shifts = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false);
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      shiftName: "",
      startTime: null,
      endTime: null,
    },
  });

  const { mutate, isPending } = useMutation({
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
      queryClient.invalidateQueries({queryKey:["shifts"]})
      setOpenModal(false);
      reset();
    },
    onError: function (data) {
      toast.error(data.message);
    },
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  const fetchShifts = async()=>{
    try {
      const response = await axios.get(
        "/api/company/get-company-data/?field=shifts"
      );
      return response.data.shifts;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  }

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn:  fetchShifts,
  });

  const departmentsColumn = [
    { field: "id", headerName: "SR NO" },
    {
      field: "shift",
      headerName: "Shift List",
      cellRenderer: (params) => {
        return (
          <div>
            <span className="text-primary cursor-pointer hover:underline">
              {params.value}
            </span>
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
  ];
  return (
    <div>
      <AgTable
        search={true}
        searchColumn={"Shifts"}
        tableTitle={"Shift List"}
        buttonTitle={"Add Shift List"}
        handleClick={() => setOpenModal(true)}
        data={[
          ...shifts.map((shift, index) => ({
            id: index + 1, // Auto-increment Sr No
            shift: shift.name,
            status: shift.isActive,
          })),
        ]}
        columns={departmentsColumn}
      />

      <div>
        <MuiModal title={"Add Shift"} open={openModal} onClose={() => setOpenModal(false)}>
          <div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Controller
                name="shiftName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    fullWidth
                    label={"Shift Name"}
                  />
                )}
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      {...field}
                      slotProps={{ textField: { size: "small" } }}
                      label={"Select Start Time"}
                      render={(params) => (
                        <TextField size="small" {...params} fullWidth />
                      )}
                    />
                  )}
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      {...field}
                      label={"Select End Time"}
                      slotProps={{ textField: { size: "small" } }}
                      renderInput={(params) => (
                        <TextField {...params} size="small" fullWidth />
                      )}
                    />
                  )}
                />
              </LocalizationProvider>

              <div className="flex items-center justify-center gap-4">
                <SecondaryButton
                  title={"Cancel"}
                  handleSubmit={() => setOpenModal(false)}
                />
                <PrimaryButton
                  title="Add Shift"
                  type="submit"
                  isLoading={isPending}
                  disabled={isPending}
                />
              </div>
            </form>
          </div>
        </MuiModal>
      </div>
    </div>
  );
};

export default Shifts;
