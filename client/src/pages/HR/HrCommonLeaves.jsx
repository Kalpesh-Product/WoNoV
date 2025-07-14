import React, { useEffect, useState } from "react";
import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import { Chip, CircularProgress, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Controller, useForm } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MuiModal from "../../components/MuiModal";
import dayjs from "dayjs";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import { isAlphanumeric, noOnlyWhitespace } from "../../utils/validators";

const HrCommonLeaves = () => {
  const { auth } = useAuth();
  const id = auth.user.empId;
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);

  const leaveType = ["Privileged", "Sick"];
  const leavePeriodOptions = ["Partial", "Single", "Multiple"];

  const {
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fromDate: null,
      toDate: null,
      leaveType: "",
      leavePeriod: "",
      hours: 0,
      description: "",
    },mode:'onChange'
  });

  const leavePeriod = watch("leavePeriod");
  const fromDate = watch("fromDate");
  const toDate = watch("toDate");

  useEffect(() => {
    if (leavePeriod === "Single" && fromDate) {
      setValue("toDate", fromDate);
      setValue("hours", 9);
    }

    if (leavePeriod === "Multiple" && fromDate && toDate) {
      const start = dayjs(fromDate);
      const end = dayjs(toDate);
      const days = end.diff(start, "day") + 1;
      if (days > 0) {
        setValue("hours", days * 9);
      } else {
        setValue("hours", 9); // fallback
      }
    }
  }, [leavePeriod, fromDate, toDate, setValue]);
  useEffect(() => {
    setValue("toDate", null);
    setValue("hours", 0);

    if (leavePeriod === "Partial" && fromDate) {
      setValue("toDate", fromDate); // 👈 Set toDate same as fromDate
    }
    if (leavePeriod === "Single" && fromDate) {
      setValue("toDate", fromDate); // 👈 Set toDate same as fromDate
    }
  }, [leavePeriod, fromDate, setValue]);

  const leavesColumn = [
    { field: "srNo", headerName: "Sr No" },
    { field: "fromDate", headerName: "From Date" },
    { field: "toDate", headerName: "To Date" },
    { field: "leaveType", headerName: "Leave Type" },
    { field: "leavePeriod", headerName: "Leave Period" },
    { field: "hours", headerName: "Hours" },
    { field: "description", headerName: "Description" },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      pinned: "right",
      cellRenderer: (params) => {
        const status = params.value;

        const statusColorMap = {
          Approved: { backgroundColor: "#DFF5E1", color: "#218739" }, // Light green bg, dark green font
          Pending: { backgroundColor: "#FFF8E1", color: "#F5A623" }, // Light yellow bg, orange font
          Rejected: { backgroundColor: "#FDECEA", color: "#D32F2F" }, // Light red bg, red font
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
              fontWeight: 500,
            }}
            size="small"
          />
        );
      },
    },
  ];

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => {
      const response = await axios.get(`/api/leaves/view-leaves/${id}`);
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { mutate: leaveRequest, isPending: leaveRequestPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/leaves/request-leave", {
        ...data,
        empId: id,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setOpenModal(false);
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      reset();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const onSubmit = (data) => {
    leaveRequest(data);
  };

  return (
    <div className="flex flex-col gap-8 overflow-hidden">
      <YearWiseTable
        tableTitle="Leaves Table"
        tableHeight={300}
        dateColumn="fromDate"
        columns={leavesColumn}
        buttonTitle="Add Requested Leave"
        handleSubmit={() => setOpenModal(true)}
        data={
          isLoading
            ? []
            : leaves.map((leave, index) => ({
                srNo: index + 1,
                ...leave,
              }))
        }
      />

      <MuiModal
        title="Leave Request"
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Leave Type */}

          <Controller
            name="leaveType"
            control={control}
            rules={{ required: "Leave type is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                select
                label="Leave type"
                size="small"
              >
                {leaveType.map((type, idx) => (
                  <MenuItem key={idx} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          {/* Leave Period */}
          <Controller
            name="leavePeriod"
            control={control}
            rules={{ required: "Leave period is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                select
                label="Leave period"
                size="small"
              >
                {leavePeriodOptions.map((option, idx) => (
                  <MenuItem key={idx} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            {/* From Date */}
            <Controller
              name="fromDate"
              control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    {...field}
                    label="From Date"
                    disablePast
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: "small" } }}
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => {
                      field.onChange(date ? date.toISOString() : null);
                    }}
                  />
                </LocalizationProvider>
              )}
            />

            {/* To Date (conditionally disabled) */}
            <Controller
              name="toDate"
              control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    {...field}
                    disabled={leavePeriod !== "Multiple"}
                    disablePast
                    label="To Date"
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: "small" } }}
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => {
                      field.onChange(date ? date.toISOString() : null);
                    }}
                  />
                </LocalizationProvider>
              )}
            />
          </div>

          {/* Hours */}
          <Controller
            name="hours"
            control={control}
            rules={{ required: "Hours are required" }}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                disabled={leavePeriod !== "Partial"}
                label="Hours"
                type="number"
                fullWidth
              />
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            rules={{ required: "Description is required", validate:{
              isAlphanumeric,
              noOnlyWhitespace
            } }}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label="Description"
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors?.description?.message}
              />
            )}
          />

          <div className="flex items-center justify-center gap-4">
            <SecondaryButton
              title="Cancel"
              handleSubmit={() => setOpenModal(false)}
            />
            <PrimaryButton
              title="Submit"
              type="submit"
              isLoading={leaveRequestPending}
              disabled={leaveRequestPending}
            />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default HrCommonLeaves;
