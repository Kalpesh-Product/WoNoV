import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import MuiModal from "../../../components/MuiModal";

const AdminTeamMembersCalendar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const location = useLocation();
  const passedData = location.state;

  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    if (passedData?.startDate && passedData?.endDate) {
      const start = dayjs(passedData.startDate);
      const end = dayjs(passedData.endDate);

      const generatedEvents = [];
      for (
        let current = start;
        current.isSameOrBefore(end, "day");
        current = current.add(1, "day")
      ) {
        generatedEvents.push({
          title: passedData.unitName,
          start: current.format("YYYY-MM-DD"),
          backgroundColor: "#3357FF", // optional styling
          borderColor: "#3357FF",
          extendedProps: {
            teamMember: passedData.name,
            unit: passedData.unitName,
            manager: "Machindrath Parkar", // static or dynamic
          },
        });
      }

      setCalendarEvents(generatedEvents);
    }
  }, [passedData]);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-4">
      <span className="text-title font-pmedium text-primary">
        {`${passedData?.name || "User"} Schedule`}
      </span>
      {/* Calendar Section */}
      <div className="w-full h-full overflow-y-auto">
        <FullCalendar
          headerToolbar={{
            left: "prev title next",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          contentHeight={425}
          eventClick={handleEventClick}
          dayMaxEvents={2}
          eventDisplay="block"
        />
      </div>

      {/* Modal Section */}
      <MuiModal
        open={isDrawerOpen}
        onClose={closeDrawer}
        title="Schedule Details"
      >
        {selectedEvent && (
          <div className="flex flex-col gap-2">
            <span className="text-content flex items-center">
              <span className="w-[30%]">Unit</span> <span>:</span>
              <span className="text-content font-pmedium w-full pl-4">
                {selectedEvent.extendedProps.unit}
              </span>
            </span>
            <span className="text-content flex items-center">
              <span className="w-[30%]">Date</span> <span>:</span>
              <span className="text-content font-pmedium w-full pl-4">
                {dayjs(selectedEvent.start).format("MMM D, YYYY")}
              </span>
            </span>
            <span className="text-content flex items-center">
              <span className="w-[30%]">Team Member</span> <span>:</span>
              <span className="text-content font-pmedium w-full pl-4">
                {selectedEvent.extendedProps.teamMember}
              </span>
            </span>
            <span className="text-content flex items-center">
              <span className="w-[30%]">Manager</span> <span>:</span>
              <span className="text-content font-pmedium w-full pl-4">
                {selectedEvent.extendedProps.manager}
              </span>
            </span>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default AdminTeamMembersCalendar;
