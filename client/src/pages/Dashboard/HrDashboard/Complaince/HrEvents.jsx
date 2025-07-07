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

const HrEvents = ({ title }) => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

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
    { field: "startDate", headerName: "Date" },
    { field: "day", headerName: "Day" },
  ];

  const { data: holidayEvents = [] } = useQuery({
    queryKey: ["holidayEvents"],
    queryFn: async () => {
      const response = await axios.get("/api/events/get-events");
      return response.data;
    },
  });

  const combinedEvents = [...holidayEvents].map((holiday) => {
    const date = dayjs(holiday.start);
    return {
      title: holiday.title,
      day: date.format("dddd"),
      startDate: holiday.start,
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
      </div>
    </PageFrame>
  );
};

export default HrEvents;
