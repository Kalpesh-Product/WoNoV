import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../../pages/LoginPage/CalenderModal.css";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { convertToISOFormat } from "../../utils/dateFormat";
import dayjs from "dayjs";
import MuiModal from "../../components/MuiModal";

const MeetingCalendar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const axios = useAxiosPrivate();
  const [eventsToBeRenamed, setEventsToBeRenamed] = useState([]);
  const statusColors = {
    Completed: "#4caf50", // Green for Completed
    Upcoming: "#ff9800", // Orange for Upcoming
  };

  const { data: meetingsCheck = [], isLoading } = useQuery({
    queryKey: ["meetingsCheck"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/meetings/get-meetings");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  useEffect(() => {
    if (isLoading || !Array.isArray(meetingsCheck)) return;

    const newEvents = meetingsCheck.map((meeting) => {
      const startDate = convertToISOFormat(meeting.date, meeting.startTime);
      const endDate = convertToISOFormat(meeting.date, meeting.endTime);

      return {
        title: meeting.subject || "Meeting",
        start: startDate,
        end: endDate,
        allDay: false,
        meetingStatus: meeting.meetingStatus,
        extendedProps: {},
      };
    });

    setEventsToBeRenamed(newEvents);
  }, [meetingsCheck, isLoading]);

  const getTodaysEvents = () => {
    const today = dayjs().format("YYYY-MM-DD"); // Get today's date in "YYYY-MM-DD"

    return meetingsCheck.filter((meeting) => {
      // Convert "DD-MM-YYYY" to "YYYY-MM-DD"
      console.log(meeting.date)
      const meetingDate = dayjs(meeting.date, "DD-MM-YYYY").format(
        "YYYY-MM-DD"
      );

      return meetingDate === today; // Compare with today's date
    });
  };

  

  const todaysEvents = getTodaysEvents();
  console.log(todaysEvents)

  const uniqueStatuses = Array.from(
    new Set(meetingsCheck.map((meeting) => meeting.meetingStatus))
  );

  // ✅ Initialize both checkboxes as selected by default
  const [filteredStatuses, setFilteredStatuses] = useState(uniqueStatuses);

  const handleCheckboxChange = (e) => {
    const selectedStatus = e.target.value;

    setFilteredStatuses((prevFilter) =>
      e.target.checked
        ? [...prevFilter, selectedStatus]
        : prevFilter.filter((s) => s !== selectedStatus)
    );
  };

  // ✅ Apply filtering logic
  const filteredEvents = eventsToBeRenamed
    .filter((event) => filteredStatuses.includes(event.meetingStatus))
    .map((event) => ({
      ...event,
      backgroundColor: statusColors[event.meetingStatus] || "#05C3F0",
      borderColor: statusColors[event.meetingStatus] || "#05C3F0",
    }));

const handleEventClick = (clickInfo) => {
  const eventDetails = clickInfo.event.extendedProps; // Extract extended properties
  setSelectedEvent({
    title: clickInfo.event.title,
    date: dayjs(clickInfo.event.start).format("YYYY-MM-DD"), // Format date
    startTime: dayjs(clickInfo.event.start).format("hh:mm A"), // Convert to AM/PM format
    endTime: dayjs(clickInfo.event.end).format("hh:mm A"),
    range: `${dayjs(clickInfo.event.start).format("hh:mm A")} - ${dayjs(clickInfo.event.end).format("hh:mm A")}`,
    department: eventDetails.department || "N/A", // Ensure department exists
    agenda: eventDetails.agenda || "No agenda available",
    meetingStatus: eventDetails.meetingStatus || "Unknown",
    company: eventDetails.company || "N/A",
  });

  setIsDrawerOpen(true);
};


  return (
    <div className="flex w-[70%] md:w-full">
      <div className="flex-1 p-4 bg-white">
        <div className="flex gap-4 relative w-full">
          <div className="flex flex-col gap-4 w-[25%]">
            <div className="border-2 border-gray-300 rounded-md">
              <div className="w-full flex justify-start border-b-default border-borderGray p-2">
                <span className="text-content font-bold uppercase">
                  Meeting Filters
                </span>
              </div>
              <div className="flex justify-start text-content px-2">
                <FormGroup column>
                  {uniqueStatuses.map((status) => (
                    <FormControlLabel
                      key={status}
                      defaultChecked={true}
                      control={
                        <Checkbox
                          sx={{
                            fontSize: "0.75rem",
                            transform: "scale(0.8)",
                            "&.Mui-checked": {
                              color: statusColors[status] || "#05C3F0", // Default fallback color
                            },
                          }}
                          checked={filteredStatuses.includes(status)}
                          onChange={handleCheckboxChange}
                          value={status}
                        />
                      }
                      label={
                        <span
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: "bold",
                            color: "black", // Label text color matches the checkbox
                          }}
                        >
                          {status}
                        </span>
                      }
                    />
                  ))}
                </FormGroup>
              </div>
            </div>

            <div className="border-2 border-gray-300 rounded-md">
              <div className="mb-2 text-content font-bold uppercase border-b-default border-borderGray p-2">
                <span>Today's Meetings</span>
              </div>

              <div className="px-2 max-h-[33.5vh] overflow-y-auto">
                {todaysEvents.length > 0 ? (
                  todaysEvents.map((event, index) => {
                    console.log(event.start)
                    const colors = {
                      Completed: "#4caf50",
                      Upcoming: "#ff9800",
                    };
                    return (
                      <div key={index} className="flex gap-2 items-center mb-2">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{
                            backgroundColor: colors[event.meetingStatus],
                          }}
                        ></div>
                        <div className="flex flex-col">
                          <span className="text-content font-medium">
                            {event.subject}
                          </span>
                          <span className="text-small text-gray-500">
                            {event.startDate
                              ? dayjs(event.startDate).format("h:mm A")
                              : "All Day"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span>No events today.</span>
                )}
              </div>
            </div>
          </div>
          <div className="w-full h-full overflow-y-auto">
            <FullCalendar
              headerToolbar={{
                left: "today",
                center: "prev title next",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              dayMaxEvents={2}
              eventDisplay="block"
              displayEventTime={false}
              eventClick={handleEventClick}
              contentHeight={520}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={filteredEvents} // ✅ Use filtered events
            />
          </div>
        </div>
      </div>

      <MuiModal
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Meeting Details"
      >
        {selectedEvent && (
          <div>
            <div className="flex flex-col gap-2">
              <span className="text-content flex items-center">
                <span className="w-[30%]">Subject</span>
                <span>:</span>
                <span className="text-content font-pmedium w-full justify-start pl-4">
                  {selectedEvent.title}
                </span>
              </span>
              <span className="text-content flex items-center">
                <span className="w-[30%]">Date</span>
                <span>:</span>
                <span className="text-content font-pmedium w-full justify-start pl-4">
                  {dayjs(selectedEvent.date).format("YYYY-MM-DD")}
                </span>
              </span>
              <span className="text-content flex items-center">
                <span className="w-[30%]">Duration</span>
                <span>:</span>
                <span className="text-content font-pmedium w-full justify-start pl-4">
                  {selectedEvent.range}
                </span>
              </span>
              <span className="text-content flex items-center">
                <span className="w-[30%]">Start Time</span>
                <span>:</span>
                <span className="text-content font-pmedium w-full justify-start pl-4">
                  {selectedEvent.startTime}
                </span>
              </span>
              <span className="text-content flex items-center">
                <span className="w-[30%]">End Time</span>
                <span>:</span>
                <span className="text-content font-pmedium w-full justify-start pl-4">
                  {selectedEvent.endTime}
                </span>
              </span>
            </div>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default MeetingCalendar;
