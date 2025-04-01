import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";

const SalesPayment = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEvent(null); // Clear the selected event on close
  };

  // Dummy data for department payments
  const dummyData = [
    {
      department: "Finance",
      color: "#FF5733", // Finance color
      payments: [
        { title: "Budget Allocation", date: "2025-01-10", amount: "$1000" },
        { title: "Yearly Report", date: "2025-01-15", amount: "$1500" },
      ],
    },
    {
      department: "HR",
      color: "#33FF57", // HR color
      payments: [
        { title: "Salary Payment", date: "2025-01-20", amount: "$5000" },
        { title: "Team Building Expense", date: "2025-01-25", amount: "$800" },
      ],
    },
    {
      department: "Sales",
      color: "#3357FF", // Sales color
      payments: [
        { title: "Commission Payment", date: "2025-01-12", amount: "$2000" },
        { title: "Travel Reimbursement", date: "2025-01-18", amount: "$1200" },
      ],
    },
  ];

  // State for event filtering
  const [filteredDepartments, setFilteredDepartments] = useState([
    "Finance",
    "HR",
    "Sales",
  ]);

  // Combine all payments into a single array for FullCalendar
  const events = dummyData.flatMap((dept) =>
    dept.payments.map((payment) => ({
      title: `${payment.title}`,
      start: payment.date,
      backgroundColor: dept.color, // Assign department-specific color
      borderColor: dept.color,
      extendedProps: {
        department: dept.department,
        amount: payment.amount,
        color: dept.color,
      },
    }))
  );

  // Filter events by selected departments
  const filteredEvents = events.filter((event) =>
    filteredDepartments.includes(event.extendedProps.department)
  );

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event); // Set the selected event
    setIsDrawerOpen(true); // Open the modal
  };

  return (
    <div className="flex flex-col p-4 bg-white">
      <div className="flex gap-4">
        {/* Filters Section */}
        <div className="flex flex-col gap-4 w-[25%]">
          <div className="border-2 border-gray-300 rounded-md">
            <div className="w-full flex justify-start border-b-default border-borderGray p-2">
              <span className="text-content font-bold uppercase">
                Department Filters
              </span>
            </div>
            <div className="flex justify-start text-content px-2">
              <FormGroup column>
                {dummyData.map((dept) => (
                  <FormControlLabel
                    key={dept.department}
                    control={
                      <Checkbox
                        sx={{
                          fontSize: "0.75rem",
                          transform: "scale(0.8)",
                          color: dept.color,
                          "&.Mui-checked": { color: dept.color },
                        }}
                        checked={filteredDepartments.includes(dept.department)}
                        onChange={(e) => {
                          const selectedDept = e.target.value;
                          setFilteredDepartments((prevFilter) =>
                            e.target.checked
                              ? [...prevFilter, selectedDept]
                              : prevFilter.filter(
                                  (dept) => dept !== selectedDept
                                )
                          );
                        }}
                        value={dept.department}
                      />
                    }
                    label={
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "bold",
                        }}
                      >
                        {dept.department}
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
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => (
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
                <span>No payments today.</span>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="w-full h-full overflow-y-auto">
          <FullCalendar
            headerToolbar={{
              left: "prev title next",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={filteredEvents}
            contentHeight={425}
            eventClick={handleEventClick}
            dayMaxEvents={2} // Limits the number of events displayed per day
            eventDisplay="block"
          />
        </div>
      </div>

      {/* Modal Section */}
      <MuiModal
        open={isDrawerOpen}
        onClose={closeDrawer}
        title="Payment Details"
        headerBackground={selectedEvent?.extendedProps.color}
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
                <span className="w-[30%]">Start Date</span>
                <span>:</span>
                <span className="text-content font-pmedium w-full justify-start pl-4">
                  {dayjs(selectedEvent.start).format("YYYY-MM-DD")}
                </span>
              </span>
              <span className="text-content flex items-center">
                <span className="w-[30%]">Department</span>
                <span>:</span>
                <span className="text-content font-pmedium w-full justify-start pl-4">
                  {selectedEvent.extendedProps.department}
                </span>
              </span>
              <span className="text-content flex items-center">
                <span className="w-[30%]">Amount</span>
                <span>:</span>
                <span className="text-content font-pmedium w-full justify-start pl-4">
                  {selectedEvent.extendedProps.amount}
                </span>
              </span>
            </div>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default SalesPayment;
