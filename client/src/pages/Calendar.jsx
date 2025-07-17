import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../pages/LoginPage/CalenderModal.css";

import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import dayjs from "dayjs";

import MuiModal from "../components/MuiModal";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import humanDate from "../utils/humanDateForamt";
import humanTime from "../utils/humanTime";

const Calender = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState(""); // 'view' or 'add'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [headerBackground, setHeaderBackground] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    description: "",
  });
  const [eventFilter, setEventFilter] = useState([
    "holiday",
    "event",
    "meeting",
  ]);
  const axios = useAxiosPrivate();

  //---------------------------------API------------------------------------------//

  const { data: events = [], isPending: isEventsPending } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/events/all-events");
        return response.data;
      } catch (error) {
        toast.error(error.message);
        return [];
      }
    },
  });

  const { data: meetings = [], isLoading: isMeetingsLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/my-meetings");
      return response.data;
    },
  });

  const transformedMeetings = meetings.map((meeting) => ({
    id: meeting._id,
    title: meeting.subject || "Meeting",
    start: meeting.startTime,
    end: meeting.endTime,
    allDay: false,
    backgroundColor: "#2196f3", // blue for meetings
    extendedProps: {
      type: "meeting", // so it can be filtered
      agenda: meeting.agenda,
      roomName: meeting.roomName,
      bookedBy: meeting.bookedBy,
      receptionist: meeting.receptionist,
      client: meeting.client,
      meetingType: meeting.meetingType,
      duration: meeting.duration,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      subject: meeting.subject,
      department: meeting.department,
      participants: meeting.participants?.map(
        (p) => `${p.firstName} ${p.lastName}`
      ),
      meetingStatus: meeting.meetingStatus,
      housekeepingStatus: meeting.housekeepingStatus,
      location: meeting.location,
    },
  }));

  const transformedEvents = events.map((event) => {
    const type = event?.extendedProps?.type?.toLowerCase?.() || "event";
    const colorMap = {
      holiday: "#4caf50",
      event: "#ff9800",
      meeting: "#2196f3",
    };

    return {
      ...event,
      backgroundColor: colorMap[type] || "#757575", // default gray if unknown
    };
  });

  //---------------------------------API------------------------------------------//

  useEffect(() => {
    const allCombinedEvents = [...transformedEvents, ...transformedMeetings];

    if (eventFilter.length === 0) {
      setFilteredEvents([]); // ✅ Show nothing if no filter selected
    } else {
      const filtered = allCombinedEvents.filter((event) =>
        eventFilter.includes(event.extendedProps?.type?.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [eventFilter, events, meetings]);

  const getTodaysEvents = () => {
    const today = dayjs().startOf("day");

    return filteredEvents.filter((event) => {
      const start = dayjs(event.start).startOf("day");
      const end = event.end ? dayjs(event.end).startOf("day") : start;

      return (
        today.isSame(start) ||
        today.isSame(end) ||
        (today.isAfter(start) && today.isBefore(end))
      );
    });
  };

  console.log("filtered events : ", filteredEvents);
  const todaysEvents = getTodaysEvents();

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const type = event.extendedProps?.type.toLowerCase();

    const colors = {
      holiday: "#4caf50",
      event: "#ff9800",
      meeting: "#2196f3",
    };

    const headerBackground = colors[type] || ""; // Fallback to empty if type doesn't match

    setSelectedEvent(event);
    setDrawerMode("view");
    setIsDrawerOpen(true);
    setHeaderBackground(headerBackground); // Set the background color
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEvent(null);
    setNewEvent({
      title: "",
      start: "",
      description: "",
    });
  };

  console.log("selected : ", filteredEvents);
  return (
    <div className="flex w-[70%] md:w-full">
      {!isMeetingsLoading && !isEventsPending ? (
        <div className="flex-1 p-4 bg-white">
          <div className="flex gap-4 relative w-full">
            <div className="flex flex-col gap-4 w-[25%]">
              <div className="border-2 border-gray-300  rounded-md">
                <div className="w-full flex justify-start border-b-default border-borderGray p-2">
                  <span className="text-content font-bold uppercase">
                    Event Filters
                  </span>
                </div>
                <div className="flex justify-start text-content px-2">
                  {!isEventsPending ? (
                    <FormGroup column>
                      {["holiday", "event", "meeting"].map((type) => {
                        const colors = {
                          holiday: "#4caf50",
                          event: "#ff9800",
                          meetings: "#2196f3",
                        };
                        return (
                          <FormControlLabel
                            key={type}
                            control={
                              <Checkbox
                                sx={{
                                  fontSize: "0.75rem",
                                  transform: "scale(0.8)",
                                  color: colors[type],
                                  "&.Mui-checked": { color: colors[type] },
                                }}
                                checked={eventFilter.includes(type)}
                                onChange={(e) => {
                                  const selectedType = e.target.value;
                                  setEventFilter((prevFilter) =>
                                    e.target.checked
                                      ? [...prevFilter, selectedType]
                                      : prevFilter.filter(
                                          (t) => t !== selectedType
                                        )
                                  );
                                }}
                                value={type}
                              />
                            }
                            label={
                              <span style={{ fontSize: "0.875rem" }}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </span>
                            }
                          />
                        );
                      })}
                    </FormGroup>
                  ) : (
                    <CircularProgress color="#1E3D73" size={15} />
                  )}
                </div>
              </div>

              <div className="border-2 border-gray-300  rounded-md">
                <div className="mb-2 text-content font-bold uppercase border-b-default border-borderGray p-2">
                  <span>Today's Schedule</span>
                </div>

                <div className="px-2">
                  {todaysEvents.length > 0 ? (
                    todaysEvents.map((event, index) => {
                      const colors = {
                        holiday: "#4caf50",
                        event: "#ff9800",
                        meeting: "#2196f3",
                      };
                      return (
                        <div
                          key={index}
                          className="flex gap-2 items-center mb-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: colors[event.extendedProps.type],
                            }}
                          ></div>
                          <div className="flex flex-col">
                            <span className="text-content font-medium">
                              {event.title}
                            </span>
                            <span className="text-small text-gray-500">
                              {event.start
                                ? dayjs(event.start).format("h:mm A")
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
                eventContent={(meeting) => (
                  <span className="text-content">{meeting.event.title}</span>
                )}
                eventClick={handleEventClick}
                contentHeight={520}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={filteredEvents}
              />
            </div>
          </div>

          <MuiModal
            open={isDrawerOpen}
            onClose={closeDrawer}
            headerBackground={headerBackground}
            title={
              selectedEvent?.extendedProps?.type.toLowerCase() === "holiday"
                ? "Holiday Details"
                : selectedEvent?.extendedProps?.type.toLowerCase() === "meeting"
                ? "Meeting Details"
                : selectedEvent?.extendedProps?.type.toLowerCase() === "event"
                ? "Event Details"
                : selectedEvent?.extendedProps?.type.toLowerCase() ===
                  "birthday"
                ? "Birthday Details"
                : ""
            }
          >
            {drawerMode === "view" && selectedEvent && (
              <div>
                <div className="flex flex-col gap-2">
                  {selectedEvent?.extendedProps?.type.toLowerCase() ===
                    "meeting" && <div className="font-bold">Basic Info</div>}
                  <span className="text-content flex items-center">
                    <span className="w-[30%]">Title</span>
                    <span>:</span>
                    <span className="text-content w-full justify-start pl-4">
                      {selectedEvent.title}
                    </span>
                  </span>
                  {selectedEvent.extendedProps?.agenda && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Agenda</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.agenda}
                        </span>
                      </span>
                    </div>
                  )}
                  <span className="text-content flex  items-center">
                    <span className="w-[30%]"> Start Date </span>
                    <span>:</span>
                    <span className="text-content   w-full justify-start pl-4">
                      {humanDate(
                        new Date(selectedEvent?._instance.range.start)
                      )}
                    </span>{" "}
                  </span>{" "}
                  <span className="text-content flex  items-center">
                    <span className="w-[30%]"> End Date </span>
                    <span>:</span>
                    <span className="text-content   w-full justify-start pl-4">
                      {humanDate(selectedEvent?._instance.range.end)}
                    </span>{" "}
                  </span>{" "}
                  {selectedEvent.extendedProps.startTime && (
                    <div>
                      <span className="text-content flex  items-start ">
                        <span className="w-[30%]"> Time</span>
                        <span>:</span>

                        <span className="text-content   w-full justify-start pl-4">
                          {`${humanTime(selectedEvent.start)} - ${humanTime(
                            selectedEvent.end
                          )}`}
                        </span>
                      </span>{" "}
                    </div>
                  )}
                  {selectedEvent.extendedProps.duration && (
                    <div>
                      <span className="text-content flex  items-start ">
                        <span className="w-[30%]">Duration</span>
                        <span>:</span>

                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.duration}
                        </span>
                      </span>{" "}
                    </div>
                  )}
                  {selectedEvent.extendedProps.meetingStatus && (
                    <div>
                      <span className="text-content flex  items-start ">
                        <span className="w-[30%]">Status</span>
                        <span>:</span>

                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.meetingStatus}
                        </span>
                      </span>{" "}
                    </div>
                  )}
                  {selectedEvent.extendedProps?.meetingType && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Meeting Type</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.meetingType}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps?.client && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Company</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.client}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps?.externalClient && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Company</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.externalClient}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps.description && (
                    <div>
                      <span className="text-content flex  items-start ">
                        <span className="w-[30%]"> Description</span>
                        <span>:</span>

                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.description}
                        </span>
                      </span>{" "}
                    </div>
                  )}
                  {selectedEvent?.extendedProps?.type.toLowerCase() ===
                    "meeting" && (
                    <>
                      <br />
                      <div className="font-bold">People Involved</div>
                    </>
                  )}
                  {selectedEvent.extendedProps?.participants?.length > 0 && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Participants</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.participants
                            .map((p) => p)
                            .join(",")}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps?.bookedBy && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Booked By</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.bookedBy}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps?.receptionist && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Receptionist</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4 ">
                          {selectedEvent.extendedProps.receptionist || "N/A"}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps?.department && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Department</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.department?.map(
                            (item) => item.name
                          )}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent?.extendedProps?.type.toLowerCase() ===
                    "meeting" && (
                    <>
                      <br />
                      <div className="font-bold">Venue Details</div>
                    </>
                  )}
                  {selectedEvent.extendedProps?.roomName && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Room</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.roomName}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps?.location && (
                    <>
                      {selectedEvent.extendedProps.location?.unitNo &&
                        selectedEvent.extendedProps.location?.unitName && (
                          <div>
                            <span className="text-content flex items-start">
                              <span className="w-[30%]">Location</span>
                              <span>:</span>
                              <span className="text-content   w-full justify-start pl-4">
                                {`${selectedEvent.extendedProps.location.unitNo} (${selectedEvent.extendedProps.location.unitName})`}
                              </span>
                            </span>
                          </div>
                        )}
                      {selectedEvent.extendedProps.location?.building
                        ?.buildingName && (
                        <div>
                          <span className="text-content flex items-start">
                            <span className="w-[30%]">Building</span>
                            <span>:</span>
                            <span className="text-content   w-full justify-start pl-4">
                              {
                                selectedEvent.extendedProps.location.building
                                  .buildingName
                              }
                            </span>
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {selectedEvent.extendedProps?.housekeepingStatus && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Housekeeping Status</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.housekeepingStatus}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </MuiModal>
        </div>
      ) : (
        <CircularProgress color="#1E3D73" size={15} />
      )}
    </div>
  );
};

export default Calender;
