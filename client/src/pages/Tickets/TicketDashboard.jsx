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
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const { auth } = useAuth();
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

  const masterDepartments = [
    "IT",
    "Admin",
    "Tech",
    "HR",
    "Finance",
    "Sales",
    "Maintainance",
  ];

  const ticketWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection
          layout={1}
          border
          padding
          title={"Annual Tickets Raised"}
        >
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
          title={"Total Tickets"}
        >
          <DonutChart
            series={[49, 21, 30]}
            labels={["High", "Medium", "Low"]}
            colors={["#ff4d4d", "#ffc107", "#28a745"]}
            centerLabel={"Tickets"}
            tooltipValue={[49, 21, 30]}
          />
        </WidgetSection>,
        <WidgetSection
          layout={1}
          padding
          border
          titleLabel={"Current month"}
          title={"Department Tickets"}
        >
          <DonutChart
            series={[10, 4, 0, 5, 3, 2, 5]}
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
            tooltipValue={[30, 44, 50, 22, 14, 6, 39]}
            handleClick={() => navigate("reports")}
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
              { title: "MT. AV. Performance", value: "70%",route:"/app/tickets/manage-tickets" },
              { title: "Immediate Attended", value: "12",route:"/app/tickets/manage-tickets" },
              { title: "Medium Attended", value: "10",route:"/app/tickets/manage-tickets" },
              { title: "Low Attended", value: "26",route:"/app/tickets/manage-tickets" },
            ]}
          />
        </div>,

          <FinanceCard
            cardTitle="Department Tickets"
            timePeriod="Today"
            highlightNegativePositive={true}
            disableColorChange
            descriptionData={[
              { title: "Open Tickets", value: "200",route:"/app/tickets/manage-tickets" },
              { title: "Closed Tickets", value: "75",route:"/app/tickets/manage-tickets" },
              { title: "Pending Tickets", value: "100",route:"/app/tickets/manage-tickets" },
            ]}
          />,
          <FinanceCard
            cardTitle="Personal Tickets"
            timePeriod="Today"
            highlightNegativePositive={true}
            disableColorChange
            descriptionData={[
              { title: "Accepted Tickets", value: "106",route:"/app/tickets/manage-tickets" },
              { title: "Assigned Tickets", value: "65",route:"/app/tickets/manage-tickets" },
              { title: "Escalated Tickets", value: "50",route:"/app/tickets/manage-tickets" },
            ]}
          />
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
