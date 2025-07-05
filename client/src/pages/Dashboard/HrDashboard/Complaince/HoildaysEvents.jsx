import { useState } from "react";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
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

const HoildaysEvents = ({ title }) => {
  const axios = useAxiosPrivate();
  const [modalOpen, setModalOpen] = useState(false);
  const [localEvents, setLocalEvents] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      startDate: null,
    },
  });

  const columns = [
    { field: "srNo", headerName: "SR No", width: 100 },
    { field: "title", headerName: "Holiday", flex: 1 },
    {
      field: "start",
      headerName: "Date",
      cellRenderer: (params) => humanDate(params.value),
    },
    { field: "day", headerName: "Day" },
  ];

  const { data: holidayEvents = [] } = useQuery({
    queryKey: ["holidayEvents"],
    queryFn: async () => {
      const response = await axios.get("/api/events/all-events");
      return response.data;
    },
  });

  const combinedEvents = [...holidayEvents, ...localEvents].map(
    (holiday, index) => {
      const date = dayjs(holiday.start);
      return {
        id: index + 1,
        title: holiday.title,
        day: date.format("dddd"),
        start: date,
      };
    }
  );

  const onSubmit = (data) => {
    if (!data.title || !data.startDate) {
      toast.error("Please fill all fields");
      return;
    }

    const newEvent = {
      title: data.title.trim(),
      start: data.startDate,
    };

    setLocalEvents((prev) => [...prev, newEvent]);
    toast.success("Holiday/Event added successfully!");
    reset();
    setModalOpen(false);
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
      </div>
    </PageFrame>
  );
};

export default HoildaysEvents;
