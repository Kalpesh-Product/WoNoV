import WidgetSection from "../../components/WidgetSection";
import AreaGraph from "../../components/graphs/AreaGraph";
import Card from "../../components/Card";
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
import { CircularProgress } from "@mui/material";
import { useState } from "react";
import dayjs from "dayjs";
import Permissions from "../../components/Permissions/Permissions";
import { PERMISSIONS } from "../../constants/permissions";

const TicketDashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const axios = useAxiosPrivate();
  //------------------------PAGE ACCESS-------------------//
  const cardsConfig = [
    {
      title: "Raise A Ticket",
      route: "/app/tickets/raise-ticket",
      icon: <RiPagesLine />,
      permission: PERMISSIONS.TICKETS_RAISE_TICKET.value,
    },
    {
      title: "Manage Tickets",
      route: "/app/tickets/manage-tickets",
      icon: <RiArchiveDrawerLine />,
      permission: PERMISSIONS.TICKETS_MANAGE_TICKETS.value,
    },
    {
      title: "Reports",
      route: "/app/tickets/Reports",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.TICKETS_REPORTS.value,
    },
    {
      title: "Team Members",
      route: "/app/tickets/team-members",
      icon: <CgProfile />,
      permission: PERMISSIONS.TICKETS_TEAM_MEMBERS.value,
    },
    {
      title: "Ticket Settings",
      route: "/app/tickets/ticket-settings",
      icon: <RiPagesLine />,
      permission: PERMISSIONS.TICKETS_TICKET_SETTINGS.value,
    },
  ];
  const allowedCards = cardsConfig.filter(
    (card) => !card.permission || userPermissions.includes(card.permission)
  );
  //------------------------PAGE ACCESS-------------------//

  const roles = auth.user.role.map((role) => role.roleTitle);
  const depts = auth.user.departments.map((dept) => dept.name);
  const [timeFilter, setTimeFilter] = useState("Yearly");
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [dateLabel, setDateLabel] = useState("");

  const { data: ticketsData = [], isLoading } = useQuery({
    queryKey: ["tickets-data"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/tickets/get-all-tickets`);
        return response.data;
      } catch (error) {
        console.error("Error fetching tickets:", error);
        throw new Error("Failed to fetch tickets");
      }
    },
  });

  const { data: departments = [], departmentsIsLoading } = useQuery({
    queryKey: ["departments-data"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/departments/get-departments`);

        return response.data;
      } catch (error) {
        console.error("Error fetching departments:", error);
        throw new Error("Failed to fetch departments");
      }
    },
  });
  const totalTickets = ticketsData.length || 0;

  const todayDate = dayjs().startOf("day");

  const ticketsFilteredData = {
    openTickets: ticketsData.filter((item) => {
      return (
        item.status === "Open" && dayjs(item.createdAt).isSame(todayDate, "day")
      );
    }).length,

    closedTickets: ticketsData.filter(
      (item) =>
        item.status === "Closed" &&
        dayjs(item?.closedAt).isSame(todayDate, "day")
    ).length,

    pendingTickets: ticketsData.filter(
      (item) =>
        item.status === "Pending" &&
        dayjs(item.createdAt).isSame(todayDate, "day")
    ).length,

    acceptedTickets: ticketsData.filter(
      (item) =>
        item?.acceptedBy?._id === auth.user?._id &&
        item.status === "In Progress" &&
        dayjs(item?.acceptedAt).isSame(todayDate, "day")
    ).length,

    assignedTickets: ticketsData.filter(
      (item) =>
        item.assignees?.length > 0 &&
        dayjs(item?.assignedAt).isSame(todayDate, "day")
    ).length,

    escalatedTickets: ticketsData.filter((item) => {
      const depts = auth.user.departments.map((dept) => dept._id.toString());

      const matchedDept = depts.some(
        (dept) => dept === item.raisedToDepartment?._id.toString()
      );

      return (
        matchedDept &&
        item.status === "Escalated" &&
        dayjs(item?.escalatededAt).isSame(todayDate, "day")
      );
    }).length,

    averagePerformance: (
      (ticketsData.filter(
        (item) =>
          item.status === "Closed" &&
          dayjs(item.createdAt).isSame(todayDate, "day")
      ).length /
        ticketsData.filter((item) =>
          dayjs(item.createdAt).isSame(todayDate, "day")
        ).length || 1) * 100
    ).toFixed(0),
  };

  const avg = (
    (ticketsData.filter((item) => item.status === "Closed").length /
      ticketsData.length) *
    100
  ).toFixed(0);

  let masterDepartments = [];

  if (roles.includes("Master Admin") || roles.includes("Super Admin")) {
    masterDepartments = !departmentsIsLoading
      ? departments.map((dept) => dept.name)
      : [];
  } else {
    masterDepartments = !departmentsIsLoading
      ? departments
          .filter((dept) => depts.includes(dept.name))
          .map((dept) => dept.name)
      : [];
  }

  const departmentCountMap = {};

  const today = new Date();
  const currentYear = new Date().getFullYear();

  const todayTickets = ticketsData.filter((ticket) => {
    const createdAt = new Date(ticket.createdAt);
    return (
      createdAt.getDate() === today.getDate() &&
      createdAt.getFullYear() === currentYear
    );
  });

  const lastMonth = new Date().getMonth();

  const lastMonthTickets = ticketsData.filter((ticket) => {
    const createdAt = new Date(ticket.createdAt);
    return (
      createdAt.getMonth() - 1 === lastMonth - 1 &&
      createdAt.getFullYear() === currentYear
    );
  });

  const currentMonth = new Date().getMonth();

  const currentMonthTickets = ticketsData.filter((ticket) => {
    const createdAt = new Date(ticket.createdAt);

    return (
      createdAt.getMonth() === currentMonth &&
      createdAt.getFullYear() === currentYear
    );
  });

  currentMonthTickets.forEach((item) => {
    const dept = item.raisedToDepartment.name;
    if (dept) {
      departmentCountMap[dept] = (departmentCountMap[dept] || 0) + 1;
    }
  });

  const donutSeries = masterDepartments.map(
    (dept) => departmentCountMap[dept] || 0
  );

  //Task Priority data for widget
  const priorityCountMap = {};

  lastMonthTickets.forEach((item) => {
    const priority = item.priority.toLowerCase();
    if (priority) {
      priorityCountMap[priority] = (priorityCountMap[priority] || 0) + 1;
    }
  });

  const priorityOrder = ["high", "medium", "low"]; // order you want in the chart
  const series = priorityOrder.map(
    (priority) => priorityCountMap[priority] || 0
  );

  //Live tickets
  const todayPriorityCountMap = {};

  todayTickets.forEach((item) => {
    const priority = item.priority.toLowerCase();
    if (priority) {
      todayPriorityCountMap[priority] =
        (todayPriorityCountMap[priority] || 0) + 1;
    }
  });

  const todayPriorityOrder = ["high", "medium", "low"]; // order you want in the chart
  const todayTicketseries = todayPriorityOrder.map(
    (priority) => todayPriorityCountMap[priority] || 0
  );

  const filterDepartmentTickts = (department) => {
    const tickets = currentMonthTickets.filter(
      (ticket) => ticket.raisedToDepartment.name === department
    );
    return tickets;
  };

  const ticketWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection
          layout={1}
          border
          padding
          title={`Overall Department Raised Tickets - ${dateLabel}`}
          TitleAmount={`TOTAL TICKETS : ${filteredTotal}`}>
          {!isLoading ? (
            <AreaGraph
              responseData={ticketsData}
              onTotalChange={setFilteredTotal}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              onDateLabelChange={setDateLabel}
            />
          ) : (
            <div className="h-72 flex items-center justify-center">
              <CircularProgress />
            </div>
          )}
        </WidgetSection>,
      ],
    },
    {
      layout: allowedCards.length, // ✅ dynamic layout
      widgets: allowedCards.map((card) => (
        <Card
          key={card.title}
          route={card.route}
          title={card.title}
          icon={card.icon}
        />
      )),
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection
          layout={1}
          padding
          border
          titleLabel={`${new Date().toLocaleString("default", {
            month: "short",
          })}-${new Date().getFullYear().toString().slice(-2)}`}
          title={"Total Tickets"}>
          <DonutChart
            series={series}
            labels={["High", "Medium", "Low"]}
            colors={["#ff4d4d", "#ffc107", "#28a745"]}
            centerLabel={"Tickets"}
            tooltipValue={series}
          />
        </WidgetSection>,
        <WidgetSection
          layout={1}
          padding
          border
          titleLabel={`${new Date().toLocaleString("default", {
            month: "short",
          })}-${new Date().getFullYear().toString().slice(-2)}`}
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
            onSliceClick={(index) => {
              const clickedDepartment = masterDepartments[index];
              console.log("dep : ", clickedDepartment);

              const departmentTickets =
                filterDepartmentTickts(clickedDepartment);

              navigate(`manage-tickets/${clickedDepartment}`, {
                state: { departmentTickets },
              });
            }}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 3,
      widgets: [
        <div className="rounded-md">
          <FinanceCard
            cardTitle="Priority Wise Tickets"
            timePeriod="Today"
            highlightNegativePositive={true}
            disableColorChange
            descriptionData={[
              // {
              //   title: "MT. AV. Performance",
              //   value: `${ticketsFilteredData.averagePerformance}%`,
              //   route: "/app/tickets/manage-tickets",
              // },
              {
                title: "High",
                value: todayTicketseries[0],
                route: "/app/tickets/manage-tickets",
              },
              {
                title: "Medium",
                value: todayTicketseries[1],
                route: "/app/tickets/manage-tickets",
              },
              {
                title: "Low",
                value: todayTicketseries[2],
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
              value: ticketsFilteredData.openTickets,
              route: "/app/tickets/manage-tickets",
            },
            {
              title: "Closed Tickets",
              value: ticketsFilteredData.closedTickets,
              route: "/app/tickets/manage-tickets",
            },
            {
              title: "Pending Tickets",
              value: ticketsFilteredData.pendingTickets,
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
              value: ticketsFilteredData.acceptedTickets,
              route: "/app/tickets/manage-tickets",
            },
            {
              title: "Assigned Tickets",
              value: ticketsFilteredData.assignedTickets
                ? ticketsFilteredData.assignedTickets
                : 0,
              route: "/app/tickets/manage-tickets",
            },
            {
              title: "Escalated Tickets",
              value: ticketsFilteredData.escalatedTickets
                ? ticketsFilteredData.escalatedTickets
                : 0,
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
