import React, { useState } from "react";
import WidgetSection from "../../components/WidgetSection";
import TicketCard from "../../components/TicketCard";
import { CircularProgress, Tab, Tabs } from "@mui/material";
import RecievedTickets from "./Tables/RecievedTickets";
import AcceptedTickets from "./Tables/AcceptedTickets";
import SupportTickets from "./Tables/SupportTickets";
import EscalatedTickets from "./Tables/EscalatedTickets";
import ClosedTickets from "./Tables/ClosedTickets";
import AssignedTickets from "./Tables/AssignedTickets";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useSelector } from "react-redux";
import { PERMISSIONS } from "../../constants/permissions";

const ManageTickets = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const userPermissions = auth?.user?.permissions?.permissions || [];
  const selectedDepartment = useSelector(
    (state) => state.performance.selectedDepartment
  );

  const ticketLabel =
    auth.user.designation === "Founder & CEO" ||
    auth.user.designation === "Co-Founder & COO"
      ? "Department"
      : "Personal";

  const isAdmin = auth.user?.role?.some((item) =>
    item.roleTitle.includes("Admin")
  );

  const { data: ticketsData = [], isLoading } = useQuery({
    queryKey: ["tickets-data"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/tickets/department-tickets/${selectedDepartment}`
      );
      return response.data;
    },
  });

  const ticketsFilteredData = {
    openTickets: ticketsData.filter((item) => item.status === "Open").length,
    recievedTickets: ticketsData.filter((item) => item.status !== "Escalated")
      .length,
    closedTickets: ticketsData.filter((item) => item.status === "Closed")
      .length,
    pendingTickets: ticketsData.filter((item) => item.status === "Pending")
      .length,
    acceptedTickets: ticketsData
      .filter((item) => item.acceptedBy?._id === auth.user?._id)
      .filter((item) => item.status === "In Progress").length,
    inProgressTickets: ticketsData.filter(
      (item) => item.status === "In Progress"
    ).length,
    assignedTickets: ticketsData.filter((item) => item.assignees?.length > 0)
      .length,
    escalatedTickets: ticketsData.filter((item) => item.status === "Escalated")
      .length,
  };

  const widgets = [
    {
      layout: 2,
      widgets: [
        <WidgetSection
          key="department"
          border
          layout={3}
          title={"Department received Tickets :"}
          titleDataColor={"red"}
          TitleAmount={String(ticketsFilteredData.recievedTickets).padStart(
            2,
            "0"
          )}>
          <TicketCard
            title={"Open"}
            titleColor={"#1E3D73"}
            data={ticketsFilteredData.openTickets}
            fontColor={"#E83F25"}
            fontFamily={"Poppins-Bold"}
          />
          <TicketCard
            title={"In-Progress"}
            titleColor={"#1E3D73"}
            data={ticketsFilteredData.inProgressTickets}
            fontColor={"#FFBF42"}
            fontFamily={"Poppins-Bold"}
          />
          <TicketCard
            title={"Closed"}
            titleColor={"#1E3D73"}
            data={ticketsFilteredData.closedTickets}
            fontColor={"#52CE71"}
            fontFamily={"Poppins-Bold"}
          />
        </WidgetSection>,
        <WidgetSection
          key="personal"
          border
          layout={3}
          title={"Personal Pending Tickets :"}
          titleDataColor={"black"}
          TitleAmount={String(ticketsFilteredData.acceptedTickets).padStart(
            2,
            "0"
          )}>
          <TicketCard
            title={"Accepted Tickets"}
            data={ticketsFilteredData.acceptedTickets}
            fontColor={"#1E3D73"}
            fontFamily={"Poppins-Bold"}
            titleColor={"#1E3D73"}
          />
          <TicketCard
            title={"Assigned Tickets"}
            data={ticketsFilteredData.assignedTickets}
            fontColor={"#1E3D73"}
            fontFamily={"Poppins-Bold"}
            titleColor={"#1E3D73"}
          />
          <TicketCard
            title={"Escalated Tickets"}
            data={ticketsFilteredData.escalatedTickets}
            fontColor={"#1E3D73"}
            fontFamily={"Poppins-Bold"}
            titleColor={"#1E3D73"}
          />
        </WidgetSection>,
      ],
    },
  ];

  // Build dynamic tab list
  const tabItems = [
    {
      label: "Received Tickets",
      subLabel: "Department",
      permission: PERMISSIONS.TICKETS_RECIEVED_TICKETS.value,
      component: (
        <RecievedTickets
          departmentId={selectedDepartment}
          title="Department Ticket Received"
        />
      ),
    },
    {
      label: "Accepted Tickets",
      subLabel: ticketLabel,
      permission: PERMISSIONS.TICKETS_ACCEPTED_TICKETS.value,
      component: (
        <AcceptedTickets
          departmentId={selectedDepartment}
          title="Accepted & Assigned Tickets"
        />
      ),
    },
    {
      label: "Assigned Tickets",
      subLabel: ticketLabel,
      permission: PERMISSIONS.TICKETS_ASSIGNED_TICKETS.value,
      component: (
        <AssignedTickets
          departmentId={selectedDepartment}
          title="Assigned Tickets"
        />
      ),
    },
    {
      label: "Support Tickets",
      subLabel: ticketLabel,
      permission: PERMISSIONS.TICKETS_SUPPORT_TICKETS.value,
      component: (
        <SupportTickets
          departmentId={selectedDepartment}
          title="Support Tickets"
        />
      ),
    },
    {
      label: "Escalated Tickets",
      subLabel: ticketLabel,
      permission: PERMISSIONS.TICKETS_ESCALATED_TICKETS.value,
      component: (
        <EscalatedTickets
          departmentId={selectedDepartment}
          title="Escalated Tickets"
        />
      ),
    },
    {
      label: "Closed Tickets",
      subLabel: ticketLabel,
      permission: PERMISSIONS.TICKETS_CLOSED_TICKETS.value,
      component: (
        <ClosedTickets
          departmentId={selectedDepartment}
          title="Closed / Resolved Tickets"
        />
      ),
    },
  ];
  const visibleTabs = tabItems.filter((tab) => {
    // If there's no permission required, show it to all
    if (!tab.permission) return true;
    // Otherwise check if user has that permission
    return userPermissions.includes(tab.permission);
  });


  return (
    <div>
      {/* Widgets */}
      {!isLoading ? (
        <div>
          {widgets.map((widget, index) => (
            <div key={index}>
              <WidgetSection layout={widget.layout}>
                {widget.widgets}
              </WidgetSection>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-72 flex justify-center items-center">
          <CircularProgress />
        </div>
      )}

      {/* Tabs */}
      {/* Tabs or Fallback */}
      <div className="p-4">
        {visibleTabs.length > 0 ? (
          <>
            <Tabs
              value={activeTab}
              onChange={(e, newVal) => setActiveTab(newVal)}
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
                  backgroundColor: "#1E3D73",
                  color: "white",
                },
              }}
            >
              {visibleTabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <div className="flex flex-col gap-2 text-center">
                      <span className="text-content">{tab.label}</span>
                      <span className="text-small">{tab.subLabel}</span>
                    </div>
                  }
                />
              ))}
            </Tabs>

            <div className="py-4 bg-white">
              {visibleTabs[activeTab]?.component}
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-gray-500 bg-white rounded-md shadow-sm">
            You do not have permission to view any ticket tabs.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTickets;
