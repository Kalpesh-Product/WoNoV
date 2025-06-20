import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import MuiModal from "../../../../components/MuiModal";
import { toast } from "sonner";
import { TextField, Button } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PageFrame from "../../../../components/Pages/PageFrame";

const HrEvents = ({ title }) => {
  const axios = useAxiosPrivate();
  const [modalOpen, setModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", startDate: "" });
  const [localEvents, setLocalEvents] = useState([]);

  const columns = [
    { field: "id", headerName: "SR No", width: 100 },
    { field: "title", headerName: "Event", flex: 1 },
    { field: "start", headerName: "Date" },
    { field: "day", headerName: "Day" },
  ];

  const { data: holidayEvents = [] } = useQuery({
    queryKey: ["holidayEvents"],
    queryFn: async () => {
      const response = await axios.get("/api/events/all-events");
      console.log(response.data);
      return response.data;
    },
  });

  const combinedEvents = [...holidayEvents, ...localEvents].map(
    (holiday, index) => {
      const date = dayjs(holiday.start);
      return {
        id: index + 1,
        title: holiday.title,
        day: date.format("dddd"), // e.g., "Monday"
        start: date.format("DD-MM-YYYY"),
      };
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.startDate) {
      toast.error("Please fill all fields");
      return;
    }

    setLocalEvents((prev) => [...prev, newEvent]);
    toast.success("Event/Event added successfully!");
    setNewEvent({ title: "", startDate: "" });
    setModalOpen(false);
  };

  return (
    <PageFrame>
      <div>
        <AgTable
          key={combinedEvents.length}
          search={true}
          tableTitle={"Events"}
          columns={columns}
          buttonTitle="Add Event"
          handleClick={() => setModalOpen(true)}
          data={combinedEvents}
        />

        <MuiModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add Event"
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <TextField
                label="Title"
                fullWidth
                size="small"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
              <DatePicker
                label="Date"
                slotProps={{ textField: { size: "small" } }}
                value={newEvent.startDate ? dayjs(newEvent.startDate) : null}
                onChange={(newDate) =>
                  setNewEvent({ ...newEvent, startDate: newDate })
                }
                renderInput={(params) => (
                  <TextField size="small" {...params} fullWidth />
                )}
              />

              <PrimaryButton type="submit" title="Add Event" />
            </form>
          </LocalizationProvider>
        </MuiModal>
      </div>
    </PageFrame>
  );
};

export default HrEvents;
