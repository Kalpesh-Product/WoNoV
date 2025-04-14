import React from "react";
import WidgetSection from "../../components/WidgetSection";
import AreaGraph from "../../components/graphs/AreaGraph";
import Card from "../../components/Card";
import TicketCard from "../../components/TicketCard";
import DonutChart from "../../components/graphs/DonutChart";
import { RiArchiveDrawerLine } from "react-icons/ri";
import { RiPagesLine } from "react-icons/ri";
import { MdFormatListBulleted } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import FinanceCard from "../../components/FinanceCard";

const TicketDashboard = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const { data: ticketsData = [], isLoading } = useQuery({
    queryKey: ["tickets-data"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tickets/get-all-tickets`
        );

        return response.data;
      } catch (error) {
        console.error("Error fetching tickets:", error);
        throw new Error("Failed to fetch tickets");
      }
    },
  });

  const ticketsFilteredData =  {
    openTickets: ticketsData.filter((item) => item.status === "Open").length,
    closedTickets: ticketsData.filter((item) => item.status === "Closed")
      .length,
    pendingTickets: ticketsData.filter((item) => item.status === "Pending")
      .length,
    acceptedTickets: ticketsData.filter((item) => item.acceptedBy).length,
    assignedTickets: ticketsData.filter((item) => item.assignees.length > 0).length,
    escalatedTickets: ticketsData.filter((item)=>item.status === "Escalated").length,
  };



  const masterDepartments = [
    "IT",
    "Admin",
    "Tech",
    "HR",
    "Finance",
    "Sales",
    "Maintenance",
  ];
  const departmentCountMap = {};

  ticketsData.forEach(item => {
    const dept = item.raisedToDepartment.name;
    if (dept) {
      departmentCountMap[dept] = (departmentCountMap[dept] || 0) + 1;
    }
  });
  
  const donutSeries = masterDepartments.map(dept => departmentCountMap[dept] || 0);

  const ticketWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection
          layout={1}
          border
          padding
          title={"Annual Tickets Raised"}>
          <AreaGraph responseData={ticketsData} />
        </WidgetSection>,
      ],
    },
    {
      layout: 5,
      widgets: [
        <Card
          route={"/app/tickets/raise-ticket"}
          title={"Raise A Ticket"}
          icon={<RiPagesLine />}
        />,
        <Card
          route={"/app/tickets/manage-tickets"}
          title={"Manage Tickets"}
          icon={<RiArchiveDrawerLine />}
        />,
        <Card
          route={"/app/tickets/Reports"}
          title={"Reports"}
          icon={<MdFormatListBulleted />}
        />,
        <Card
          route={"/app/tickets/team-members"}
          title={"Team Members"}
          icon={<CgProfile />}
        />,
        <Card
          route={"/app/tickets/ticket-settings"}
          title={"Ticket Settings"}
          icon={<RiPagesLine />}
        />,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection
          layout={1}
          padding
          border
          titleLabel={"Last Month"}
          title={"Total Tickets"}>
          <DonutChart
            series={[9, 5, 7]}
            labels={["High", "Medium", "Low"]}
            colors={["#ff4d4d", "#ffc107", "#28a745"]}
            centerLabel={"Tickets"}
            tooltipValue={[9, 5, 7]}
          />
        </WidgetSection>,
        <WidgetSection
          layout={1}
          padding
          border
          titleLabel={"Current month"}
          title={"Department Tickets"}>
          <DonutChart
            series={donutSeries}
            labels={masterDepartments}
            colors={[
              "#211C84",
              "#4D55CC",
              "#7A73D1",
              "#9EC6F3",
              "#8F87F1",
              "#BDDDE4",
              "#C7D9DD",
            ]}
            centerLabel={"Tickets"}
            tooltipValue={donutSeries}
            handleClick={() => navigate("department-wise-tickets")}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 3,
      widgets: [
        <div className="rounded-md">
          <FinanceCard
            cardTitle="Live Tickets"
            timePeriod="Today"
            highlightNegativePositive={true}
            disableColorChange
            descriptionData={[
              {
                title: "MT. AV. Performance",
                value: "70%",
                route: "/app/tickets/manage-tickets",
              },
              {
                title: "Immediate Attended",
                value: "5",
                route: "/app/tickets/manage-tickets",
              },
              {
                title: "Medium Attended",
                value: "5",
                route: "/app/tickets/manage-tickets",
              },
              {
                title: "Low Attended",
                value: "3",
                route: "/app/tickets/manage-tickets",
              },
            ]}
          />
        </div>,

        <FinanceCard
          cardTitle="Department Tickets"
          timePeriod="Today"
          highlightNegativePositive={true}
          disableColorChange
          descriptionData={[
            {
              title: "Open Tickets",
              value: "5",
              route: "/app/tickets/manage-tickets",
            },
            {
              title: "Closed Tickets",
              value: "7",
              route: "/app/tickets/manage-tickets",
            },
            {
              title: "Pending Tickets",
              value: "1",
              route: "/app/tickets/manage-tickets",
            },
          ]}
        />,
        <FinanceCard
          cardTitle="Personal Tickets"
          timePeriod="Today"
          highlightNegativePositive={true}
          disableColorChange
          descriptionData={[
            {
              title: "Accepted Tickets",
              value: ticketsFilteredData.acceptedBy? ticketsFilteredData.acceptedBy : 0,
              route: "/app/tickets/manage-tickets",
            },
            {
              title: "Assigned Tickets",
              value: ticketsFilteredData.assignedTickets ? ticketsFilteredData.assignedTickets : 0,
              route: "/app/tickets/manage-tickets",
            },
            {
              title: "Escalated Tickets",
              value: ticketsFilteredData.escalatedTickets ? ticketsFilteredData.escalatedTickets : 0,
              route: "/app/tickets/manage-tickets",
            },
          ]}
        />,
      ],
    },
  ];
  return (
    <div>
      <div>
        {ticketWidgets.map((widget, index) => (
          <div>
            <WidgetSection key={index} layout={widget.layout}>
              {widget?.widgets}
            </WidgetSection>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketDashboard;
