import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import AgTable from "../../../../components/AgTable";
import MuiModal from "../../../../components/MuiModal";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import { MenuItem, TextField } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PageFrame from "../../../../components/Pages/PageFrame";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";
import { MdDeleteForever } from "react-icons/md";
import ConfirmationModal from "../../../../components/ConfirmationModal";

const HrEvents = ({ title }) => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      type: "",
      description: "",
      start: null,
      end: null,
    },
    mode: "onChange",
  });

  const columns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "title", headerName: "Event", flex: 1 },
    { field: "startDate", headerName: "Date" ,flex: 1 },
    { field: "day", headerName: "Day" ,flex: 1},
    {
      field: "action",
      headerName: "Action",
      flex: 1 ,
      pinned: "right",
      cellRenderer: (params) => (
        <button
          type="button"
          title="Delete"
          aria-label="Delete event"
          className="flex h-full w-8 items-center justify-center text-red-600 hover:text-red-700"
          onClick={() => setEventToDelete(params.data)}
        >
          <MdDeleteForever size={24} />
        </button>
      ),
    },
    { field: "startDate", headerName: "Start Date" },
    { field: "endDate", headerName: "End Date" },
    // { field: "day", headerName: "Day" },
  ];

  const { data: holidayEvents = [] } = useQuery({
    queryKey: ["holidayEvents"],
    queryFn: async () => {
      const response = await axios.get("/api/events/get-events");
      return response.data;
    },
  });

  const combinedEvents = [...holidayEvents].map((holiday, index) => {
    const date = dayjs(holiday.start);
    const endDate = holiday.end ? dayjs(holiday.end) : null;
    return {
      _id: holiday._id,
      srNo: index + 1,
      title: holiday.title,
      day: date.format("dddd"),
      startDate: date.format("DD-MM-YYYY"),
      endDate: endDate ? endDate.format("DD-MM-YYYY") : "-",
    };
  });

  const addEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const response = await axios.post("/api/events/create-event", eventData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidayEvents"] });
      toast.success("Event added successfully!");
      reset(); // Clear form
      setModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to add event.");
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(
        `/api/events/delete/${eventToDelete?._id}`,
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Event permanently deleted successfully");
      setEventToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["holidayEvents"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete event.");
    },
  });

  const onSubmit = (data) => {
    if (!data.title || !data.start) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = {
      title: data.title,
      type: "event",
      description: data.description,
      start: data.start,
      end: data.end,
    };

    addEventMutation.mutate(payload);
  };

  return (
    <PageFrame>
      <div>
        <YearWiseTable
          dateColumn={"startDate"}
          key={combinedEvents.length}
          tableTitle={"Events"}
          columns={columns}
          buttonTitle="Add Event"
          handleSubmit={() => setModalOpen(true)}
          data={combinedEvents}
        />

        <MuiModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add Event"
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
                  required: "Event title is required",
                  validate: { isAlphanumeric, noOnlyWhitespace },
                }}
                render={({ field }) => (
                  <TextField
                    label="Title"
                    fullWidth
                    size="small"
                    {...field}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                rules={{
                  required: "Event Description is required",
                  validate: { isAlphanumeric, noOnlyWhitespace },
                }}
                render={({ field }) => (
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    {...field}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Controller
                  name="start"
                  control={control}
                  rules={{
                    required: "Start Date is required",
                  }}
                  render={({ field }) => (
                    <DatePicker
                      label="Start Date"
                      value={field.value}
                      format="DD-MM-YYYY"
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          size: "small",
                          error: !!errors.start,
                          helperText: errors.start?.message,
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="end"
                  control={control}
                  rules={{
                    required: "End Date is required",
                  }}
                  render={({ field }) => (
                    <DatePicker
                      label="End Date"
                      value={field.value}
                      format="DD-MM-YYYY"
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          size: "small",
                          error: !!errors.end,
                          helperText: errors.end?.message,
                        },
                      }}
                    />
                  )}
                />
              </div>
              <PrimaryButton type="submit" title="Add Event" />
            </form>
          </LocalizationProvider>
        </MuiModal>

        <ConfirmationModal
          open={Boolean(eventToDelete)}
          title="Delete Event"
          message="Are you sure you want to delete this event?"
          confirmText="Yes"
          cancelText="No"
          isLoading={deleteEventMutation.isPending}
          onClose={() => setEventToDelete(null)}
          onConfirm={() => deleteEventMutation.mutate()}
        />
      </div>
    </PageFrame>
  );
};

export default HrEvents;
