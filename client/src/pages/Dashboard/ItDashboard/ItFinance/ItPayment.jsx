import React, { useState, useEffect } from "react";
import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import "../../../../pages/LoginPage/CalenderModal.css";

import MuiModal from "../../../../components/MuiModal";
import { toast } from "sonner";

const ItPayment = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEvent(null);
  };

  // Updated dummy data for April 2025
  const dummyData = [
    {
      title: "Salary Disbursement",
      date: "2025-04-03",
      amount: "4000",
      status: "paid",
    },
    {
      title: "Freelancer Payment",
      date: "2025-04-05",
      amount: "1200",
      status: "unpaid",
    },
    {
      title: "Team Bonus",
      date: "2025-04-10",
      amount: "900",
      status: "paid",
    },
    {
      title: "Medical Reimbursement",
      date: "2025-04-21",
      amount: "300",
      status: "paid",
    },
    {
      title: "Travel Allowance",
      date: "2025-04-20",
      amount: "600",
      status: "unpaid",
    },
  ];

  // Payment status colors
  const statusColorMap = {
    paid: "#28a745", // green
    unpaid: "#dc3545", // red
  };

  const [statusFilters, setStatusFilters] = useState(["paid", "unpaid"]);

  const events = dummyData.map((payment) => ({
    title: payment.title,
    start: payment.date,
    backgroundColor: statusColorMap[payment.status],
    borderColor: statusColorMap[payment.status],
    extendedProps: {
      amount: payment.amount,
      status: payment.status,
    },
  }));

  const filteredEvents = events.filter((event) =>
    statusFilters.includes(event.extendedProps.status)
  );

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col p-4 bg-white">
      <div className="flex gap-4">
        {/* Filters Section */}
        <div className="flex flex-col gap-4 w-[25%]">
          <div className="border-2 border-gray-300 rounded-md">
            <div className="w-full flex justify-start border-b-default border-borderGray p-2">
              <span className="text-content font-bold uppercase">
                Payment Status
              </span>
            </div>
            <div className="flex justify-start text-content px-2">
              <FormGroup column>
                {["paid", "unpaid"].map((status) => (
                  <FormControlLabel
                    key={status}
                    control={
                      <Checkbox
                        sx={{
                          fontSize: "0.75rem",
                          transform: "scale(0.8)",
                          color: statusColorMap[status],
                          "&.Mui-checked": { color: statusColorMap[status] },
                        }}
                        checked={statusFilters.includes(status)}
                        onChange={(e) => {
                          const selectedStatus = e.target.value;
                          setStatusFilters((prev) =>
                            e.target.checked
                              ? [...prev, selectedStatus]
                              : prev.filter((s) => s !== selectedStatus)
                          );
                        }}
                        value={status}
                      />
                    }
                    label={
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "bold",
                          textTransform: "capitalize",
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
              <span>Today's Payments</span>
            </div>

            <div className="px-2 max-h-[33.5vh] overflow-y-auto">
              {filteredEvents.filter((e) =>
                dayjs(e.start).isSame(dayjs(), "day")
              ).length > 0 ? (
                filteredEvents
                  .filter((e) => dayjs(e.start).isSame(dayjs(), "day"))
                  .map((event, index) => (
                    <div key={index} className="flex gap-2 items-start mb-2">
                      <div
                        className="w-3 h-3 rounded-full mt-[0.3rem]"
                        style={{ backgroundColor: event.backgroundColor }}
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
                  ))
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-sm">No payments today.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="w-full h-full overflow-y-auto">
          <FullCalendar
            headerToolbar={{
              left: "today",
              center: "prev title next",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={filteredEvents}
            contentHeight={425}
            eventClick={handleEventClick}
            dayMaxEvents={2}
            eventDisplay="block"
          />
        </div>
      </div>

      {/* Modal Section */}
      <MuiModal
        open={isDrawerOpen}
        onClose={closeDrawer}
        title="Payment Details"
        headerBackground={
          selectedEvent
            ? statusColorMap[selectedEvent.extendedProps.status]
            : ""
        }
      >
        {selectedEvent && (
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
                <span className="w-[30%]">Date</span>
                <span>:</span>
                <span className="text-content font-pmedium w-full justify-start pl-4">
                  {dayjs(selectedEvent.start).format("YYYY-MM-DD")}
                </span>
              </span>
              <span className="text-content flex items-center">
                <span className="w-[30%]">Status</span>
                <span>:</span>
                <span className="text-content font-pmedium w-full justify-start pl-4 capitalize">
                  {selectedEvent.extendedProps.status}
                </span>
              </span>
              <span className="text-content flex items-center">
                <span className="w-[30%]">Amount</span>
                <span>:</span>
                <span className="text-content font-pmedium w-full justify-start pl-4">
                  {Number(selectedEvent.extendedProps.amount).toLocaleString(
                    "en-IN"
                  )}
                &nbsp;INR</span>
              </span>
            </div>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default ItPayment;
