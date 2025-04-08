import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import MuiModal from "../../../components/MuiModal";
import { useLocation } from "react-router-dom";

const AdminTeamMembersCalendar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const location = useLocation();
  const passedData = location.state; // This is the data passed via navigate()

  useEffect(() => {
    console.log("Received state from navigation:", passedData);
  }, [passedData]);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEvent(null); // Clear the selected event on close
  };

  // Dummy data for department payments
  const dummyData = [
    {
      payment: "Anne",
      color: "#FF5733",
      transactions: [
        {
          title: "ST-701A",
          date: "2025-04-01",
          amount: "$1200",
        },
        {
          title: "ST-701A",
          date: "2025-04-02",
          amount: "$1200",
        },
        {
          title: "ST-701A",
          date: "2025-04-03",
          amount: "$1200",
        },
        {
          title: "ST-701A",
          date: "2025-04-04",
          amount: "$1200",
        },
        {
          title: "ST-701A",
          date: "2025-04-05",
          amount: "$2500",
        },
      ],
    },
    {
      payment: "Naaz",
      color: "#33FF57",
      transactions: [
        {
          title: "Domain Renewal - example.com",
          date: "2025-02-10",
          amount: "$500",
        },
        {
          title: "Domain Renewal - mybusiness.org",
          date: "2025-02-18",
          amount: "$300",
        },
      ],
    },
    {
      payment: "Melisa",
      color: "#3357FF",
      transactions: [
        {
          title: "SSL Certificate - Single Domain",
          date: "2025-02-08",
          amount: "$250",
        },
        {
          title: "SSL Certificate - Wildcard",
          date: "2025-02-22",
          amount: "$600",
        },
      ],
    },
    {
      payment: "Urjita",
      color: "#FF33A1",
      transactions: [
        {
          title: "SEO Analysis - Website Audit",
          date: "2025-01-07",
          amount: "$900",
        },
        {
          title: "SEO Monthly Optimization",
          date: "2025-01-15",
          amount: "$1500",
        },
      ],
    },
  ];

  // State for event filtering
  const [filteredPayments, setFilteredPayments] = useState(
    dummyData.map((p) => p.payment)
  );
  // Combine all payments into a single array for FullCalendar
  const events = dummyData.flatMap((paymentType) =>
    paymentType.transactions.map((transaction) => ({
      title: transaction.title,
      start: transaction.date,
      backgroundColor: paymentType.color,
      borderColor: paymentType.color,
      extendedProps: {
        payment: paymentType.payment,
        amount: transaction.amount,
        color: paymentType.color,
      },
    }))
  );

  // Filtering based on selected payments
  const filteredEvents = events.filter((event) =>
    filteredPayments.includes(event.extendedProps.payment)
  );

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event); // Set the selected event
    setIsDrawerOpen(true); // Open the modal
  };

  return (
    <div className="flex flex-col bg-white p-4">
      <div className="flex gap-4">
        {/* Filters Section */}
        <div className="flex flex-col gap-4 w-[25%]">
          <div className="border-2 border-gray-300 rounded-md">
            <div className="w-full flex justify-start border-b-default border-borderGray p-2">
              <span className="text-content font-bold uppercase">
                Team Members
              </span>
            </div>
            <div className="flex justify-start text-content px-2">
              <FormGroup>
                {dummyData.map((p) => (
                  <FormControlLabel
                    key={p.payment}
                    control={
                      <Checkbox
                        sx={{
                          color: p.color,
                          "&.Mui-checked": { color: p.color },
                        }}
                        checked={filteredPayments.includes(p.payment)}
                        onChange={(e) => {
                          const selectedPayment = e.target.value;
                          setFilteredPayments((prevFilter) =>
                            e.target.checked
                              ? [...prevFilter, selectedPayment]
                              : prevFilter.filter((p) => p !== selectedPayment)
                          );
                        }}
                        value={p.payment}
                      />
                    }
                    label={
                      <span
                        style={{ fontSize: "0.875rem", fontWeight: "bold" }}>
                        {p.payment}
                      </span>
                    }
                  />
                ))}
              </FormGroup>
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
        headerBackground={selectedEvent?.extendedProps.color}>
        {selectedEvent && (
          <div>
            <div className="flex flex-col gap-2">
              <span className="text-content flex items-center">
                <span className="w-[30%]">Unit</span> <span>:</span>
                <span className="text-content font-pmedium w-full pl-4">
                  {selectedEvent.title}
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
                  {selectedEvent.extendedProps.payment}
                </span>
              </span>
              <span className="text-content flex items-center">
                <span className="w-[30%]">Manager</span> <span>:</span>
                <span className="text-content font-pmedium w-full pl-4">
                  Machindrath Parkar
                </span>
              </span>
            </div>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default AdminTeamMembersCalendar;
