import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../../pages/LoginPage/CalenderModal.css";

import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import dayjs from "dayjs";

import MuiModal from "../../components/MuiModal";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import DetalisFormatted from "../../components/DetalisFormatted";
import humanDate from "../../utils/humanDateForamt";
import { useSelector } from "react-redux";
import { setMeetings } from "../../redux/slices/meetingSlice";
import humanTime from "../../utils/humanTime";
const Calender = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState(""); // 'view' or 'add'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [headerBackground, setHeaderBackground] = useState("");
  const axios = useAxiosPrivate();
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    description: "",
  });
  const [eventFilter, setEventFilter] = useState([
    "upcoming",
    "completed", // ⬅ change "Completed" to "completed"
  ]);

  const { data: meetings = [], isLoading: isMeetingsLoading } = useQuery({
    queryKey: ["meetings-calendar"],
    queryFn: async () => {
      try {
        const respone = await axios.get("/api/meetings/get-meetings");
        return respone.data;
      } catch (error) {
        console.error(error);
      }
    },
  });

  const transformedMeetings = isMeetingsLoading
    ? []
    : meetings.map((meeting) => {
        const formattedStart = meeting.startTime.split("/").reverse().join("-");
        const formattedEnd = meeting.endTime.split("/").reverse().join("-");

        const status = meeting.meetingStatus.toLowerCase();
        const colors = {
          upcoming: "#3BACFF",
          completed: "#5EFE1F",
        };

        return {
          id: meeting._id,
          title: meeting.subject,
          start: formattedStart,
          end: formattedEnd,
          backgroundColor: colors[status] || undefined, // ✅ Add background color here
          borderColor: colors[status] || undefined,
          extendedProps: { ...meeting },
        };
      });

  useEffect(() => {
    if (eventFilter.length === 0) {
      setFilteredEvents([]); // Show nothing when no filters selected
    } else {
      const filtered = transformedMeetings.filter((event) =>
        eventFilter.includes(event.extendedProps?.meetingStatus.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [eventFilter, meetings]);

  const getTodaysEvents = () => {
    const today = dayjs().startOf("day");
    return transformedMeetings.filter((event) => {
      const eventStart = dayjs(event.start).startOf("day");
      const eventEnd = dayjs(event.end).startOf("day");
      return (
        today.isSame(eventStart) ||
        (today.isAfter(eventStart) && today.isBefore(eventEnd))
      );
    });
  };

  const todaysEvents = getTodaysEvents();

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const type = event.extendedProps?.meetingStatus.toLowerCase();

    const colors = {
      upcoming: "#3BACFF",
      completed: "#5EFE1F",
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


  return (
    <div className="flex w-[70%] md:w-full">
      <div className="flex-1 p-4 bg-white">
        {!isMeetingsLoading ? (
          <>
            <div className="flex gap-4 relative w-full">
              <div className="flex flex-col gap-4 w-[25%]">
                <div className="border-2 border-gray-300  rounded-md">
                  <div className="w-full flex justify-start border-b-default border-borderGray p-2">
                    <span className="text-content font-bold uppercase">
                      Meeting Filters
                    </span>
                  </div>
                  <div className="flex justify-start text-content px-2">
                    <FormGroup column>
                      {["upcoming", "Completed"].map((type) => {
                        const normalizedType = type.toLowerCase(); // ✅ always lowercase for logic
                        const colors = {
                          upcoming: "#3BACFF",
                          completed: "#5EFE1F",
                        };
                        return (
                          <FormControlLabel
                            key={type}
                            control={
                              <Checkbox
                                sx={{
                                  fontSize: "0.75rem",
                                  transform: "scale(0.8)",
                                  color: colors[normalizedType],
                                  "&.Mui-checked": {
                                    color: colors[normalizedType],
                                  },
                                }}
                                checked={eventFilter.includes(normalizedType)}
                                onChange={(e) => {
                                  const selectedType = normalizedType;
                                  setEventFilter((prevFilter) =>
                                    e.target.checked
                                      ? [...prevFilter, selectedType]
                                      : prevFilter.filter(
                                          (t) => t !== selectedType
                                        )
                                  );
                                }}
                                value={normalizedType}
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
                          Upcoming: "#3BACFF",
                          Completed: "#5EFE1F",
                        };
                        return (
                          <div
                            key={index}
                            className="flex gap-2 items-center mb-2"
                          >
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{
                                backgroundColor:
                                  colors[event.extendedProps.meetingStatus],
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
                      <span>No meetings today.</span>
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
          </>
        ) : (
          <div className="h-72 flex justify-center items-center">
            <CircularProgress />
          </div>
        )}

        <MuiModal
          open={isDrawerOpen}
          onClose={closeDrawer}
          headerBackground={headerBackground}
          title="Meeting Details"
        >
          {drawerMode === "view" && selectedEvent && (
            <div className="space-y-2">
              <div className="font-bold">Basic Info</div>
              <DetalisFormatted title="Title" detail={selectedEvent.title} />
              <DetalisFormatted
                title="Agenda"
                detail={selectedEvent.extendedProps.agenda}
              />
              <DetalisFormatted
                title="Date"
                detail={humanDate(selectedEvent.start)}
              />
              <DetalisFormatted
                title="Time"
                detail={`${humanTime(selectedEvent.start)} - ${humanTime(
                  selectedEvent.end
                )}`}
              />
              <DetalisFormatted
                title="Duration"
                detail={selectedEvent.extendedProps.duration}
              />
              <DetalisFormatted
                title="Status"
                detail={selectedEvent.extendedProps.meetingStatus}
              />
              <DetalisFormatted
                title="Type"
                detail={selectedEvent.extendedProps.meetingType}
              />
              <DetalisFormatted
                title="Company"
                detail={selectedEvent.extendedProps.client}
              />
              <br />
              <div className="font-bold">People Involved</div>
              {selectedEvent.extendedProps.participants?.length > 0 && (
                <DetalisFormatted
                  title="Participants"
                  detail={
                    selectedEvent.extendedProps.participants
                      .map((p) => {
                        return p.employeeName
                          ? p.employeeName
                          : p.firstName
                          ? `${p.firstName} ${p.lastName}`
                          : p.name
                          ? p.name
                          : "N/A";
                      })
                      .join(", ") || "N/A"
                  }
                />
              )}

              <DetalisFormatted
                title="Booked By"
                detail={
                  selectedEvent.extendedProps.bookedBy
                    ? `${selectedEvent.extendedProps.bookedBy?.firstName || ""} ${selectedEvent.extendedProps.bookedBy?.lastName || ""}` 
                    : selectedEvent.extendedProps?.clientBookedBy?.employeeName
                }
              />
              <DetalisFormatted
                title="Receptionist"
                detail={
                  selectedEvent.extendedProps.receptionist
                    ? selectedEvent.extendedProps.receptionist
                    : "N/A"
                }
              />
              <DetalisFormatted
                title="Department"
                detail={selectedEvent.extendedProps.department?.map((item)=>item.name)}
              />

              <br />
              <div className="font-bold">Venue Details</div>
              <DetalisFormatted
                title="Room"
                detail={selectedEvent.extendedProps.roomName}
              />
              <DetalisFormatted
                title="Location"
                detail={`${selectedEvent.extendedProps.location?.unitNo} (${selectedEvent.extendedProps.location?.unitName})`}
              />
              <DetalisFormatted
                title="Building"
                detail={
                  selectedEvent.extendedProps.location?.building?.buildingName
                }
              />
              <DetalisFormatted
                title="Housekeeping Status"
                detail={selectedEvent.extendedProps.housekeepingStatus}
              />
              {selectedEvent.extendedProps.mobileNumber && (
                <>
                  <DetalisFormatted
                    title="Mobile Number"
                    detail={selectedEvent.extendedProps.mobileNumber || "N/A"}
                  />
                  <DetalisFormatted
                    title="POC Name"
                    detail={selectedEvent.extendedProps.pocName || "N/A"}
                  />
                </>
              )}
            </div>
          )}
        </MuiModal>
      </div>
    </div>
  );
};

export default Calender;
