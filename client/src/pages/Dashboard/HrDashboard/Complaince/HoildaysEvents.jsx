import { useState } from "react";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import MuiModal from "../../../../components/MuiModal";
import { toast } from "sonner";
import { TextField } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PageFrame from "../../../../components/Pages/PageFrame";
import humanDate from "../../../../utils/humanDateForamt";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";
import { Controller, useForm } from "react-hook-form";
import { MdDeleteForever } from "react-icons/md";
import ConfirmationModal from "../../../../components/ConfirmationModal";

const HoildaysEvents = ({ title }) => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      startDate: null,
    },
  });

  const columns = [
    { field: "srNo", headerName: "SR No", width: 100 },
    { field: "title", headerName: "Holiday", flex: 1 },
    {
      field: "start",
      headerName: "Date",
      flex: 1,
      cellRenderer: (params) => humanDate(params.value),
    },
    { field: "day", headerName: "Day" ,flex: 1},
    {
      field: "action",
      headerName: "Action",
     pinned: "right",
      flex: 1,
      cellRenderer: (params) => (
        <button
          type="button"
          title="Delete"
          aria-label="Delete holiday"
          className="flex h-full w-8 items-center justify-center text-red-600 hover:text-red-700"
          onClick={() => setHolidayToDelete(params.data)}
        >
          <MdDeleteForever size={24} />
        </button>
      ),
    },
  ];

  const { data: holidayEvents = [] } = useQuery({
    queryKey: ["hrHolidays"],
    queryFn: async () => {
      const response = await axios.get("/api/events/get-holidays");
      return response.data;
    },
  });

  const combinedEvents = holidayEvents.map((holiday) => {
    const date = dayjs(holiday.start);
    return {
      _id: holiday._id,
      title: holiday.title,
      day: date.format("dddd"),
      start: holiday.start,
    };
  });

  const addHolidayMutation = useMutation({
    mutationFn: async (eventData) => {
      const response = await axios.post("/api/events/create-event", eventData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hrHolidays"] });
      toast.success("Holiday added successfully!");
      reset();
      setModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to add holiday.");
    },
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(
        `/api/events/delete/${holidayToDelete?._id}`,
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Holiday permanently deleted successfully");
      setHolidayToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["hrHolidays"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete holiday.",
      );
    },
  });

  const onSubmit = (data) => {
    if (!data.title || !data.startDate) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = {
      title: data.title.trim(),
      //type: { $in: ["Holiday", "holiday"] },
      type: "holiday",
      description: data.description,
      start: data.startDate,
      end: data.startDate,
    };

    addHolidayMutation.mutate(payload);
  };

  return (
    <PageFrame>
      <div>
        <YearWiseTable
          key={combinedEvents.length}
          search={true}
          dateColumn={"start"}
          tableTitle={"Holidays"}
          columns={columns}
          buttonTitle="Add Holiday"
          handleSubmit={() => setModalOpen(true)}
          data={combinedEvents}
        />

        <MuiModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            reset();
          }}
          title="Add Holiday"
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Controller
                name="title"
                control={control}
                rules={{
                  required: "Title is required",
                  validate: {
                    noOnlyWhitespace,
                    isAlphanumeric,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Title"
                    fullWidth
                    size="small"
                    error={!!errors.title}
                    helperText={errors?.title?.message}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                rules={{
                  required: "Description is required",
                  validate: {
                    noOnlyWhitespace,
                    isAlphanumeric,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    error={!!errors.description}
                    helperText={errors?.description?.message}
                  />
                )}
              />

              <Controller
                name="startDate"
                control={control}
                rules={{ required: "Date is required" }}
                render={({ field }) => (
                  <DatePicker
                    label="Date"
                    value={field.value}
                    format="DD-MM-YYYY"
                    onChange={(val) => field.onChange(val)}
                    slotProps={{
                      textField: {
                        size: "small",
                        error: !!errors.startDate,
                        helperText: errors?.startDate?.message,
                      },
                    }}
                  />
                )}
              />

              <PrimaryButton type="submit" title="Add Holiday" />
            </form>
          </LocalizationProvider>
        </MuiModal>

        <ConfirmationModal
          open={Boolean(holidayToDelete)}
          title="Delete Holiday"
          message="Are you sure you want to delete this holiday?"
          confirmText="Yes"
          cancelText="No"
          isLoading={deleteHolidayMutation.isPending}
          onClose={() => setHolidayToDelete(null)}
          onConfirm={() => deleteHolidayMutation.mutate()}
        />
      </div>
    </PageFrame>
  );
};

export default HoildaysEvents;
