import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import MuiModal from "../../components/MuiModal";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";
import { Checkbox, CircularProgress, FormControlLabel } from "@mui/material";

const TeamMemberDetails = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
  employee: true,
  substitute: true,
});

  const department = usePageDepartment()
    const axios = useAxiosPrivate();
  const location = useLocation();
  // const passedData = location.state;
  const passedData =  {
    id:"67ed1a4b3ea0f84ec3068e5f",
    name:"ST 701 A"
  };

  const [calendarEvents, setCalendarEvents] = useState([]);

   const { data: unitSchedule = [], isPending: isUnitSchedulePending } = useQuery({
      queryKey: ["unitSchedule"],
      queryFn: async () => {
        try {
          const response = await axios.get(`/api/weekly-unit/get-unit-schedule?unitId=${passedData.id}&department=${department._id}`);
        
          return response.data;
        } catch (error) {
          console.error("Error fetching clients data:", error);
        }
      },
    });


  // useEffect(() => {
  //   // if (passedData?.startDate && passedData?.endDate) {
  //   //   console.log(passedData)
  //   //   const start = dayjs(passedData.startDate);
  //   //   const end = dayjs(passedData.endDate);

  //   //   const generatedEvents = [];
  //   //   for (
  //   //     let current = start;
  //   //     current.isSameOrBefore(end, "day");
  //   //     current = current.add(1, "day")
  //   //   ) {
  //   //     generatedEvents.push({
  //   //       title: passedData.unitName,
  //   //       start: current.format("YYYY-MM-DD"),
  //   //       backgroundColor: "#3357FF", // optional styling
  //   //       borderColor: "#3357FF",
  //   //       extendedProps: {
  //   //         teamMember: passedData.name,
  //   //         unit: passedData.unitName,
  //   //         manager: "Machindrath Parkar", // static or dynamic
  //   //       },
  //   //     });
  //   //   }

  //   //   setCalendarEvents(generatedEvents);
  //   // }


  // }, [passedData]);

useEffect(() => {
  if (!unitSchedule?.length) return;

  const allEvents = [];

  unitSchedule.forEach((schedule) => {
    const empName = `${schedule.employee.id.firstName} ${schedule.employee.id.lastName}`;
    const unitName = schedule.location.unitName;
    const manager = schedule.manager;

    const start = dayjs(schedule.startDate);
    const end = dayjs(schedule.endDate);

    // Employee events
    if (filters.employee) {
      for (
        let current = start;
        current.isSameOrBefore(end, "day");
        current = current.add(1, "day")
      ) {
        allEvents.push({
          title: empName,
          start: current.format("YYYY-MM-DD"),
          backgroundColor: "#3357FF",
          borderColor: "#3357FF",
          extendedProps: {
            employeeName: empName,
            unit: unitName,
            manager,
            isSubstitute: false,
            substitutes: schedule.substitutions,
          },
        });
      }
    }

    // Substitution events
    if (filters.substitute) {
      schedule.substitutions?.forEach((sub) => {
        if (!sub.isActive) return;

        const subName = `${sub.substitute.firstName} ${sub.substitute.lastName}`;
        const subStart = dayjs(sub.fromDate);
        const subEnd = dayjs(sub.toDate);

        for (
          let current = subStart;
          current.isSameOrBefore(subEnd, "day");
          current = current.add(1, "day")
        ) {
          allEvents.push({
            title: subName,
            start: current.format("YYYY-MM-DD"),
            backgroundColor: "#66b2ff",
            borderColor: "#66b2ff",
            extendedProps: {
              employeeName: subName,
              unit: unitName,
              manager,
              isSubstitute: true,
              substitutes: [],
            },
          });
        }
      });
    }
  });

  setCalendarEvents(allEvents);
}, [unitSchedule, filters]);


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
        {`${passedData?.name || "USER"} SCHEDULE`}
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
      <span className="w-[30%]">Employee</span> <span>:</span>
      <span className="text-content font-pmedium w-full pl-4">
        {selectedEvent.extendedProps.employeeName}
        {selectedEvent.extendedProps.isSubstitute && " (Substitute)"}
      </span>
    </span>
    <span className="text-content flex items-center">
      <span className="w-[30%]">Date</span> <span>:</span>
      <span className="text-content font-pmedium w-full pl-4">
        {dayjs(selectedEvent.start).format("MMM D, YYYY")}
      </span>
    </span>
    <span className="text-content flex items-center">
      <span className="w-[30%]">Unit</span> <span>:</span>
      <span className="text-content font-pmedium w-full pl-4">
        {selectedEvent.extendedProps.unit}
      </span>
    </span>
    <span className="text-content flex items-center">
      <span className="w-[30%]">Manager</span> <span>:</span>
      <span className="text-content font-pmedium w-full pl-4">
        {selectedEvent.extendedProps.manager}
      </span>
    </span>

    {selectedEvent.extendedProps.substitutes?.length > 0 && (
      <div className="pt-2">
        <span className="font-semibold text-sm">Substitutes:</span>
        <ul className="list-disc pl-6">
          {selectedEvent.extendedProps.substitutes.map((sub, index) => (
            <li key={index}>
              {sub.substitute.firstName} {sub.substitute.lastName} (
              {dayjs(sub.fromDate).format("MMM D")} -{" "}
              {dayjs(sub.toDate).format("MMM D")})
              {sub.isActive && " - Active"}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}

      </MuiModal>
    </div>
  );
};

export default TeamMemberDetails;
