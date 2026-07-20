import { useState } from "react";
import PrimaryButton from "../../../components/PrimaryButton";
import AgTable from "../../../components/AgTable";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { MenuItem, TextField } from "@mui/material";
import MuiModal from "../../../components/MuiModal";
import { DatePicker } from "@mui/x-date-pickers";
import PageFrame from "../../../components/Pages/PageFrame";
import { toast } from "sonner";

const AdminHolidaysEvents = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const holdiayEvents = [
    { field: "id", headerName: "SR No", width: 100 },
    { field: "title", headerName: "Holiday - Event Name", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "start", headerName: "Date", flex: 1 },
  ];

  const [modalOpen, setModalOpen] = useState(false); // For opening/closing modal
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "Holiday",
    description: "",
    startDate: null,
  }); // Form state

  const { mutate: createHolidayEvent, isPending: isCreatingHolidayEvent } =
    useMutation({
      mutationFn: async () => {
        const startDate = newEvent.startDate ? dayjs(newEvent.startDate) : null;

        return axios.post("/api/events/create-event", {
          title: newEvent.title.trim(),
          type: newEvent.type,
          description: newEvent.description.trim() || newEvent.title.trim(),
          start: startDate ? startDate.startOf("day").toISOString() : null,
          end: startDate ? startDate.endOf("day").toISOString() : null,
        });
      },
      onSuccess: () => {
        toast.success("Holiday / event added successfully");
        setNewEvent({
          title: "",
          type: "Holiday",
          description: "",
          startDate: null,
        });
        setModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["holidayEvents"] });
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message ||
            "Failed to add holiday / event",
        );
      },
    });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newEvent.title.trim() || !newEvent.startDate || !newEvent.type) {
      toast.error("Title, type and date are required");
      return;
    }

    createHolidayEvent();
  };

  const { data: holidayEvents = [] } = useQuery({
    queryKey: ["holidayEvents"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/events/all-events");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  return (
    <div className="p-4">
      <PageFrame>
        <div>
          <div className="flex justify-between items-center pb-4">
            <span className="text-title font-pmedium text-primary">
              {`HOLIDAYS & EVENT LIST`}
            </span>
            <PrimaryButton
              title={"Add Holiday - Event"}
              handleSubmit={() => setModalOpen(true)}
            />
          </div>

          <div>
            <AgTable
              key={holdiayEvents.length}
              search={true}
              searchColumn={"Holiday - Event Name"}
              columns={holdiayEvents}
              data={[
                ...holidayEvents.map((holidays, index) => ({
                  id: index + 1, // Auto-increment Sr No
                  title: holidays.title, // Birthday Name
                  type: (() => {
                    const normalizedType =
                      holidays.type || holidays.extendedProps?.type || "";
                    return normalizedType
                      ? normalizedType.charAt(0).toUpperCase() +
                          normalizedType.slice(1).toLowerCase()
                      : "-";
                  })(),
                  start: dayjs(new Date(holidays.start)).format("DD-MM-YYYY"), // Format as readable date
                })),
              ]}
            />
          </div>
        </div>
      </PageFrame>
      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Holiday - Event">
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
          <TextField
            select
            label="Type"
            fullWidth
            size="small"
            value={newEvent.type}
            onChange={(e) =>
              setNewEvent({ ...newEvent, type: e.target.value })
            }
          >
            <MenuItem value="Holiday">Holiday</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </TextField>
          <TextField
            label="Description"
            fullWidth
            size="small"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
          />
          <DatePicker
            label="Date"
            format="DD-MM-YYYY"
            slotProps={{ textField: { size: "small" } }}
            value={newEvent.startDate ? dayjs(newEvent.startDate) : null}
            onChange={(newDate) =>
              setNewEvent({ ...newEvent, startDate: newDate })
            }
          />
          <PrimaryButton
            type="submit"
            title="Add Holiday - Event"
            isLoading={isCreatingHolidayEvent}
            disabled={isCreatingHolidayEvent}
          />
        </form>
      </MuiModal>
    </div>
  );
};

export default AdminHolidaysEvents;
