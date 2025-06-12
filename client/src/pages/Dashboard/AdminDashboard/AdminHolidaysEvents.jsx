import { useState } from "react";
import PrimaryButton from "../../../components/PrimaryButton";
import AgTable from "../../../components/AgTable";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { TextField } from "@mui/material";
import MuiModal from "../../../components/MuiModal";
import { DatePicker } from "@mui/x-date-pickers";
import PageFrame from "../../../components/Pages/PageFrame";

const AdminHolidaysEvents = ({ title }) => {
  const axios = useAxiosPrivate();
  const holdiayEvents = [
    { field: "id", headerName: "SR No", width: 100 },
    { field: "title", headerName: "Holiday / Event Name", flex: 1 },
    { field: "start", headerName: "Date", flex: 1 },
  ];

  const [modalOpen, setModalOpen] = useState(false); // For opening/closing modal
  const [newEvent, setNewEvent] = useState({ title: "", startDate: null }); // Form state

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/events/create", {
        title: newEvent.title,
        start: newEvent.startDate,
      });
      setNewEvent({ title: "", startDate: null }); // Clear form
      setModalOpen(false); // Close modal
      // You may want to trigger a refetch here if you're using React Query
    } catch (error) {
      console.error("Failed to create holiday/event:", error);
    }
  };

  const rows = [
    {
      srno: "1",
      holidayEvent: "New Year 2025",
      date: "01 Jan, 2025",
    },
    {
      srno: "2",
      holidayEvent: "Rebublic Day 2025",
      date: "26 Jan, 2025",
    },
    {
      srno: "3",
      holidayEvent: "Gudi Padava",
      date: "30 Mar, 2025",
    },
    {
      srno: "4",
      holidayEvent: "Eid-Alt-Fitr (Ramadan)",
      date: "31 Mar, 2025",
    },
    {
      srno: "5",
      holidayEvent: "Sankalp's Birthday",
      date: "31 Jan, 2025",
    },
    {
      srno: "6",
      holidayEvent: "Labour Day (May Day)",
      date: "01 May, 2025",
    },
    {
      srno: "7",
      holidayEvent: "Eid Al-Adha (Bakri Eid)",
      date: "07 Jun, 2025",
    },
    {
      srno: "8",
      holidayEvent: "15 Aug 2025",
      date: "15 Aug, 2025",
    },
    {
      srno: "9",
      holidayEvent: "Ganesh Chaturthi (1st Day)",
      date: "27 Aug, 2025",
    },
    {
      srno: "10",
      holidayEvent: "Gandhi Jayanti",
      date: "02 Oct, 2025",
    },
  ];

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
              {title}
            </span>
            <PrimaryButton
              title={"Add Holiday / Event"}
              handleSubmit={() => setModalOpen(true)}
            />
          </div>

          <div>
            <AgTable
              key={holdiayEvents.length}
              search={true}
              searchColumn={"Holiday / Event Name"}
              columns={holdiayEvents}
              data={[
                ...holidayEvents.map((holidays, index) => ({
                  id: index + 1, // Auto-increment Sr No
                  title: holidays.title, // Birthday Name
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
        title="Add Holiday / Event">
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
          />
          <PrimaryButton type="submit" title="Add Holiday / Event" />
        </form>
      </MuiModal>
    </div>
  );
};

export default AdminHolidaysEvents;
