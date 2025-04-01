import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../../../pages/LoginPage/CalenderModal.css";

import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import dayjs from "dayjs";

import MuiModal from "../../../components/MuiModal";

const HousekeepingTeamMembersCalendar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState(""); // 'view' or 'add'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [headerBackground, setHeaderBackground] = useState("");
  const [eventFilter, setEventFilter] = useState(["holiday", "event"]);

  // **Hardcoded Events Array**
  const events = [
    {
      id: "1",
      title: "Team Meeting",
      start: "2025-04-01T10:00:00",
      end: "2025-04-01T11:00:00",
      extendedProps: { type: "event", description: "Monthly team meeting" },
    },
    {
      id: "2",
      title: "Company Holiday",
      start: "2025-04-05",
      extendedProps: { type: "holiday", description: "Public holiday" },
    },
    {
      id: "3",
      title: "Product Launch",
      start: "2025-04-10T14:00:00",
      extendedProps: { type: "event", description: "Launch of new product" },
    },
    {
      id: "4",
      title: "Office Renovation",
      start: "2025-04-15",
      end: "2025-04-18",
      extendedProps: { type: "event", description: "Renovation work" },
    },
  ];

  useEffect(() => {
    if (eventFilter.length === 0) {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter((event) =>
        eventFilter.includes(event.extendedProps?.type.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [eventFilter]);

  const getTodaysEvents = () => {
    const today = dayjs().startOf("day");
    return events.filter((event) => {
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
    const type = event.extendedProps?.type.toLowerCase();

    const colors = {
      holiday: "#4caf50",
      event: "#ff9800",
    };

    setSelectedEvent(event);
    setDrawerMode("view");
    setIsDrawerOpen(true);
    setHeaderBackground(colors[type] || "");
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="flex w-[70%] md:w-full">
      <div className="flex-1 p-4 bg-white">
        <div className="flex gap-4 relative w-full">
          <div className="flex flex-col gap-4 w-[25%]">
            <div className="border-2 border-gray-300 rounded-md">
              <div className="w-full flex justify-start border-b p-2">
                <span className="text-content font-bold uppercase">
                  Event Filters
                </span>
              </div>
              <div className="flex justify-start text-content px-2">
                <FormGroup column>
                  {["holiday", "event"].map((type) => {
                    const colors = {
                      holiday: "#4caf50",
                      event: "#ff9800",
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
                                  : prevFilter.filter((t) => t !== selectedType)
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
              </div>
            </div>

            <div className="border-2 border-gray-300 rounded-md">
              <div className="mb-2 text-content font-bold uppercase border-b p-2">
                <span>Today's Schedule</span>
              </div>

              <div className="px-2">
                {todaysEvents.length > 0 ? (
                  todaysEvents.map((event, index) => {
                    const colors = {
                      holiday: "#4caf50",
                      event: "#ff9800",
                    };
                    return (
                      <div key={index} className="flex gap-2 items-center mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: colors[event.extendedProps.type],
                          }}></div>
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
          title="Event Details">
          {drawerMode === "view" && selectedEvent && (
            <div>
              <div className="flex flex-col gap-2">
                <span className="text-content flex items-center">
                  <span className="w-[30%]">Title</span>
                  <span>:</span>
                  <span className="text-content font-pmedium w-full justify-start pl-4">
                    {selectedEvent.title}
                  </span>
                </span>
                <span className="text-content flex items-center">
                  <span className="w-[30%]"> Start Date </span>
                  <span>:</span>
                  <span className="text-content font-pmedium w-full justify-start pl-4">
                    {dayjs(selectedEvent.start).format("YYYY-MM-DD")}
                  </span>
                </span>
                {selectedEvent.extendedProps.description && (
                  <div>
                    <span className="text-content flex items-start">
                      <span className="w-[30%]"> Description</span>
                      <span>:</span>
                      <span className="text-content font-pmedium w-full justify-start pl-4">
                        {selectedEvent.extendedProps.description}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </MuiModal>
      </div>
    </div>
  );
};

export default HousekeepingTeamMembersCalendar;
