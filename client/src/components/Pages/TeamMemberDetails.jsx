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
import DetalisFormatted from "../DetalisFormatted";
import PageFrame from "./PageFrame";

const TeamMemberDetails = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    employee: true,
    substitute: true,
  });

  const department = usePageDepartment();
  const axios = useAxiosPrivate();
  const location = useLocation();
  const passedData = location.state;
  // const passedData =  {
  //   id:"67ed1a4b3ea0f84ec3068e5f",
  //   name:"ST 701 A"
  // };

  const [calendarEvents, setCalendarEvents] = useState([]);

  const { data: unitSchedule = [], isPending: isUnitSchedulePending } =
    useQuery({
      queryKey: ["unitSchedule"],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/weekly-unit/get-unit-schedule?unitId=${passedData.id}&department=${department._id}`
          );

          return response.data;
        } catch (error) {
          console.error("Error fetching clients data:", error);
        }
      },
    });

  // 🧠 Added defensive programming across the component

  useEffect(() => {
    if (!Array.isArray(unitSchedule) || !unitSchedule.length) return;

    const allEvents = [];

    unitSchedule.forEach((schedule) => {
      const empId = schedule?.employee?.id;
      const empName = empId
        ? `${empId.firstName ?? ""} ${empId.lastName ?? ""}`.trim()
        : "Unknown";

      const unitName = schedule?.location?.unitName || "N/A";
      const manager = schedule?.manager || "N/A";

      const start = dayjs(schedule?.startDate);
      const end = dayjs(schedule?.endDate);

      if (!start.isValid() || !end.isValid()) return;

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
              substitutes: Array.isArray(schedule.substitutions)
                ? schedule.substitutions
                : [],
            },
          });
        }
      }

      if (filters.substitute && Array.isArray(schedule.substitutions)) {
        schedule.substitutions.forEach((sub) => {
          if (!sub?.isActive) return;

          const subName =
            `${sub?.substitute?.firstName ?? ""} ${
              sub?.substitute?.lastName ?? ""
            }`.trim() || "Unknown Substitute";

          const subStart = dayjs(sub?.fromDate);
          const subEnd = dayjs(sub?.toDate);

          if (!subStart.isValid() || !subEnd.isValid()) return;

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
      <PageFrame>
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
      </PageFrame>

      {/* Modal Section */}
      <MuiModal
        open={isDrawerOpen}
        onClose={closeDrawer}
        title="Schedule Details"
      >
        {selectedEvent && (
          <div className="flex flex-col gap-2">
            <DetalisFormatted
              title="Employee"
              detail={
                selectedEvent.extendedProps?.employeeName
                  ? `${selectedEvent.extendedProps.employeeName}${
                      selectedEvent.extendedProps.isSubstitute
                        ? " (Substitute)"
                        : ""
                    }`
                  : "N/A"
              }
            />

            <DetalisFormatted
              title="Date"
              detail={
                dayjs(selectedEvent.start).isValid()
                  ? dayjs(selectedEvent.start).format("DD-MM-YYYY")
                  : "Invalid Date"
              }
            />

            <DetalisFormatted
              title="Unit"
              detail={selectedEvent.extendedProps?.unit || "N/A"}
            />

            <DetalisFormatted
              title="Manager"
              detail={selectedEvent.extendedProps?.manager || "N/A"}
            />

            {Array.isArray(selectedEvent.extendedProps?.substitutes) &&
              selectedEvent.extendedProps.substitutes.length > 0 && (
                <div className="pt-2">
                  <span className="font-semibold text-sm">Substitutes:</span>
                  <ul className="list-disc pl-6">
                    {selectedEvent.extendedProps.substitutes.map(
                      (sub, index) => (
                        <li key={index}>
                          {sub?.substitute?.firstName ?? "?"}{" "}
                          {sub?.substitute?.lastName ?? ""}
                          {" ("}
                          {dayjs(sub.fromDate).isValid()
                            ? dayjs(sub.fromDate).format("MMM D")
                            : "?"}
                          {" - "}
                          {dayjs(sub.toDate).isValid()
                            ? dayjs(sub.toDate).format("MMM D")
                            : "?"}
                          {")"}
                          {sub?.isActive && " - Active"}
                        </li>
                      )
                    )}
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
