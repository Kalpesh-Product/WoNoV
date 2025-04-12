import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import dayjs from "dayjs";

import MuiModal from "../../../../components/MuiModal";

const PaymentSchedule = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState(""); // 'view' or 'add'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [headerBackground, setHeaderBackground] = useState("");
  const [eventFilter, setEventFilter] = useState(["paid", "unpaid"]);

  const dummyEvents = [
    {
      title: "John Doe - Rent Paid",
      start: "2025-04-03",
      extendedProps: { type: "paid", description: "Payment for April Rent" },
      backgroundColor: "#4caf50",
      borderColor: "#4caf50",
      textColor: "#fff",
    },
    {
      title: "Jane Smith - Rent Unpaid",
      start: "2025-04-05",
      extendedProps: { type: "unpaid", description: "Awaiting April Payment" },
      backgroundColor: "#f44336",
      borderColor: "#f44336",
      textColor: "#fff",
    },
    {
      title: "Acme Corp - Maintenance Paid",
      start: "2025-04-15",
      extendedProps: { type: "paid", description: "AMC Payment received" },
      backgroundColor: "#4caf50",
      borderColor: "#4caf50",
      textColor: "#fff",
    },
    {
      title: "XYZ Pvt Ltd - Unpaid Dues",
      start: "2025-04-21",
      extendedProps: { type: "unpaid", description: "Pending invoice" },
      backgroundColor: "#f44336",
      borderColor: "#f44336",
      textColor: "#fff",
    },
  ];

  useEffect(() => {
    if (eventFilter.length === 0) {
      setFilteredEvents(dummyEvents);
    } else {
      const filtered = dummyEvents.filter((event) =>
        eventFilter.includes(event.extendedProps?.type.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [eventFilter]);

  const getTodaysEvents = () => {
    const today = dayjs().startOf("day");
    return dummyEvents.filter((event) => {
      const eventStart = dayjs(event.start).startOf("day");
      const eventEnd = dayjs(event.end || event.start).startOf("day");
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
      paid: "#4caf50",
      unpaid: "#f44336",
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
            {/* Filters */}
            <div className="border-2 border-gray-300 rounded-md">
              <div className="w-full flex justify-start border-b p-2">
                <span className="text-content font-bold uppercase">
                  Payment Filters
                </span>
              </div>
              <div className="flex justify-start text-content px-2">
                <FormGroup>
                  {["paid", "unpaid"].map((type) => {
                    const colors = {
                      paid: "#4caf50",
                      unpaid: "#f44336",
                    };
                    return (
                      <FormControlLabel
                        key={type}
                        control={
                          <Checkbox
                            sx={{
                              transform: "scale(0.8)",
                              color: colors[type],
                              "&.Mui-checked": { color: colors[type] },
                            }}
                            checked={eventFilter.includes(type)}
                            onChange={(e) => {
                              const selectedType = e.target.value;
                              setEventFilter((prev) =>
                                e.target.checked
                                  ? [...prev, selectedType]
                                  : prev.filter((t) => t !== selectedType)
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

            {/* Today's Schedule */}
            <div className="px-2">
              {todaysEvents.length > 0 ? (
                todaysEvents.map((event, index) => {
                  const type = event.extendedProps?.type?.toLowerCase();
                  const colors = {
                    paid: "#4caf50",
                    unpaid: "#f44336",
                  };
                  return (
                    <div key={index} className="flex gap-2 items-center mb-2">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: colors[type],
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
                <div className="flex items-center gap-2 text-gray-500">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#9e9e9e" }} // neutral gray dot
                  ></div>
                  <span>No payments today.</span>
                </div>
              )}
            </div>
          </div>

          {/* Calendar */}
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

        {/* Modal */}
        <MuiModal
          open={isDrawerOpen}
          onClose={closeDrawer}
          headerBackground={headerBackground}
          title="Event Details"
        >
          {drawerMode === "view" && selectedEvent && (
            <div className="flex flex-col gap-2">
              <span className="text-content flex items-center">
                <span className="w-[30%]">Title</span>
                <span>:</span>
                <span className="text-content font-pmedium w-full pl-4">
                  {selectedEvent.title}
                </span>
              </span>
              <span className="text-content flex items-center">
                <span className="w-[30%]"> Start Date </span>
                <span>:</span>
                <span className="text-content font-pmedium w-full pl-4">
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(selectedEvent.start))}
                </span>
              </span>
              {selectedEvent.extendedProps.description && (
                <div className="text-content flex items-start">
                  <span className="w-[30%]"> Description</span>
                  <span>:</span>
                  <span className="text-content font-pmedium w-full pl-4">
                    {selectedEvent.extendedProps.description}
                  </span>
                </div>
              )}
            </div>
          )}
        </MuiModal>
      </div>
    </div>
  );
};

export default PaymentSchedule;
