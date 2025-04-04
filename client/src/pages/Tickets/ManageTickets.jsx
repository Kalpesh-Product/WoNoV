import React, { useState, useEffect } from "react";
import WidgetSection from "../../components/WidgetSection";
import Card from "../../components/Card";
import { Tab, Tabs } from "@mui/material";
import RecievedTickets from "./Tables/RecievedTickets";
import AcceptedTickets from "./Tables/AcceptedTickets";
import SupportTickets from "./Tables/SupportTickets";
import EscalatedTickets from "./Tables/EscalatedTickets";
import ClosedTickets from "./Tables/ClosedTickets";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import TicketCard from "../../components/TicketCard";

const ManageTickets = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fetch Accepted Tickets
  const { data: ticketsData = [], isLoading } = useQuery({
    queryKey: ["tickets-data"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tickets/department-tickets/${auth.user?.departments?.map(
            (dept) => dept._id
          )}`
        );

        return response.data;
      } catch (error) {
        console.error("Error fetching tickets:", error);
        throw new Error("Failed to fetch tickets");
      }
    },
  });

  const ticketsFilteredData = {
    openTickets: ticketsData.filter((item) => item.status === "Open").length,
    closedTickets: ticketsData.filter((item) => item.status === "Closed")
      .length,
    pendingTickets: ticketsData.filter((item) => item.status === "Pending")
      .length,
    acceptedTickets: ticketsData
    .filter((item) => item.acceptedBy === auth.user?._id).filter((item)=>item.status === "In Progress").length,
  };
  console.log(
    ticketsData
      .filter((item) => item.acceptedBy === auth.user?._id).filter((item)=>item.status === "In Progress")

  );

  const widgets = [
    {
      layout: 2,
      widgets: [

          <div className="border-default border-borderGray rounded-md w-full">
            <WidgetSection
              layout={3}
              title={"Department Pending Tickets"}
              titleDataColor={"red"}
              titleData={ticketsFilteredData.pendingTickets}
            >
              <TicketCard
                title={"Recieved Tickets"}
                titleColor={"#1E3D73"}
                data={ticketsData.length}
                fontColor={"#1E3D73"}
                fontFamily={"Poppins-Bold"}
              />
              <TicketCard
                title={"Open Tickets"}
                titleColor={"#1E3D73"}
                data={ticketsFilteredData.openTickets}
                fontColor={"#FFBF42"}
                fontFamily={"Poppins-Bold"}
              />
              <TicketCard
                title={"Closed Tickets"}
                titleColor={"#1E3D73"}
                data={ticketsFilteredData.closedTickets}
                fontColor={"#52CE71"}
                fontFamily={"Poppins-Bold"}
              />
            </WidgetSection>
          </div>,
          <div className="border-default border-borderGray rounded-md w-full">
            <WidgetSection
              layout={3}
              title={"Personal Pending Tickets"}
              titleDataColor={"black"}
              titleData={"06"}
            >
              <TicketCard
                title={"Accepted Tickets"}
                data={ticketsFilteredData.acceptedTickets}
                fontColor={"#1E3D73"}
                fontFamily={"Poppins-Bold"}
                titleColor={"#1E3D73"}
              />
              <TicketCard
                title={"Assigned Tickets"}
                data={"01"}
                fontColor={"#1E3D73"}
                fontFamily={"Poppins-Bold"}
                titleColor={"#1E3D73"}
              />
              <TicketCard
                title={"Escalated Tickets"}
                data={"02"}
                fontColor={"#1E3D73"}
                fontFamily={"Poppins-Bold"}
                titleColor={"#1E3D73"}
              />
            </WidgetSection>
          </div>
       
      ],
    },
  ];

  return (
    <div>
      <div>
        {widgets.map((widget, index) => (
          <div>
            <WidgetSection key={index} layout={widget.layout}>
              {widget?.widgets}
            </WidgetSection>
          </div>
        ))}
      </div>

      <div className="p-4">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          TabIndicatorProps={{ style: { display: "none" } }}
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            border: "1px solid #d1d5db",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: "medium",
              padding: "12px 16px",
              borderRight: "0.1px solid #d1d5db",
            },
            "& .Mui-selected": {
              backgroundColor: "#1E3D73", // Highlight background color for the active tab
              color: "white",
            },
          }}
        >
          <Tab
            label={
              <div className="flex flex-col gap-2 text-center">
                <span className="text-content">Recieved Tickets</span>
                <span className="text-small">Department</span>
              </div>
            }
          />
          <Tab
            label={
              <div className="flex flex-col gap-2 text-center">
                <span className="text-content">Accepted Tickets</span>
                <span className="text-small">Personal</span>
              </div>
            }
          />
          <Tab
            label={
              <div className="flex flex-col gap-2 text-center">
                <span className="text-content">Support Tickets</span>
                <span className="text-small">Personal</span>
              </div>
            }
          />
          <Tab
            label={
              <div className="flex flex-col gap-2 text-center">
                <span className="text-content">Escalated Tickets</span>
                <span className="text-small">Personal</span>
              </div>
            }
          />

          <Tab
            label={
              <div className="flex flex-col gap-2 text-center">
                <span className="text-content">Closed Tickets</span>
                <span className="text-small">Personal</span>
              </div>
            }
          />
        </Tabs>

        <div className="py-4 bg-white">
          {activeTab === 0 && (
            <div className="">
              <RecievedTickets title={"Department Ticket Recieved"} />
            </div>
          )}
          {activeTab === 1 && (
            <div>
              <AcceptedTickets title={"Accepted & Assigned Tickets"} />
            </div>
          )}
          {activeTab === 2 && (
            <div>
              <SupportTickets
                title={"Need Support or Pass/Unresolve Tickets "}
              />
            </div>
          )}
          {activeTab === 3 && (
            <div>
              <EscalatedTickets
                title={"Need Support or Pass/Unresolve Tickets "}
              />
            </div>
          )}
          {activeTab === 4 && (
            <div>
              <ClosedTickets title={"Close / Resolve Tickets"} />
            </div>
          )}
          {activeTab === 5 && <div></div>}
        </div>
      </div>
    </div>
  );
};

export default ManageTickets;
