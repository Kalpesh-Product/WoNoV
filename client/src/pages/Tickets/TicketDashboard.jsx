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

const TicketDashboard = () => {
  const axios = useAxiosPrivate();
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
          title={"Total Tickets (Last Month)"}
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
          title={"Department Tickets (Last Month)"}
        >
          <DonutChart
            series={[30, 44, 50]}
            labels={["IT", "Maintainance", "Admin"]}
            colors={["#86D1DE", "#67B6DB", "#00CDD1"]}
            centerLabel={"Tickets"}
            tooltipValue={[30, 44, 50]}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <div className="  rounded-md">
          <div className="">
            <WidgetSection layout={2} border title={"Basic Priority Dashboard"}>
              <TicketCard
                title={"MT. AV. Performance"}
                bgcolor={"#60A5F9"}
                data={"70%"}
                titleColor={"white"}
                fontColor={"white"}
                height={"10rem"}
              />
              <TicketCard
                title={"Immediate Attended"}
                data={"12"}
                bgcolor={"#FF0000"}
                titleColor={"white"}
                fontColor={"white"}
                height={"10rem"}
              />
              <TicketCard
                title={"Medium Attended"}
                data={"10"}
                bgcolor={"#FFBF42"}
                titleColor={"white"}
                fontColor={"white"}
                height={"10rem"}
              />
              <TicketCard
                title={"Low Attended"}
                data={"26"}
                bgcolor={"#01D870"}
                titleColor={"white"}
                fontColor={"white"}
                height={"10rem"}
              />
            </WidgetSection>
          </div>
        </div>,

        <div className=" rounded-md flex flex-col gap-4">
          <div className=" rounded-md">
            <WidgetSection layout={3} border title={"Department Tickets List"}>
              <TicketCard
                title={"Open Tickets"}
                titleColor={"#1E3D73"}
                data={"200"}
                fontColor={"red"}
                fontFamily={"Poppins-Bold"}
              />
              <TicketCard
                title={"Closed Tickets"}
                titleColor={"#1E3D73"}
                data={"75"}
                fontColor={"#52CE71"}
                fontFamily={"Poppins-Bold"}
              />
              <TicketCard
                title={"Pending Tickets"}
                titleColor={"#1E3D73"}
                data={"100"}
                fontColor={"#FFBF42"}
                fontFamily={"Poppins-Bold"}
              />
            </WidgetSection>
          </div>
          <div className="rounded-md">
            <WidgetSection layout={3} border title={"Personal Tickets List"}>
              <TicketCard
                title={"Accepted Tickets"}
                data={"106"}
                fontColor={"#1E3D73"}
                fontFamily={"Poppins-Bold"}
                titleColor={"#1E3D73"}
              />
              <TicketCard
                title={"Assigned Tickets"}
                data={"65"}
                fontColor={"#1E3D73"}
                fontFamily={"Poppins-Bold"}
                titleColor={"#1E3D73"}
              />
              <TicketCard
                title={"Escalated Tickets"}
                data={"50"}
                fontColor={"#1E3D73"}
                fontFamily={"Poppins-Bold"}
                titleColor={"#1E3D73"}
              />
            </WidgetSection>
          </div>
        </div>,
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
