import AgTable from "../../../components/AgTable";
import { Chip } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import { queryClient } from "../../../main";
import ThreeDotMenu from "../../../components/ThreeDotMenu";

const EscalatedTickets = ({ title }) => {
  const axios = useAxiosPrivate();

  // Fetch Supported Tickets
  const { data: escalatedTickets = [], isLoading } = useQuery({
    queryKey: ["tickets", "escalate-tickets"],
    queryFn: async () => {
      const response = await axios.get("/api/tickets/ticket-filter/escalate");

      return response.data;
    },
  });

  const { mutate } = useMutation({
    mutationKey: ["close-ticket"],
    mutationFn: async (ticketId) => {
      const response = await axios.patch("/api/tickets/close-ticket", {
        ticketId,
      });
      return response.data;
    },

    onSuccess: (data) => {
      toast.success(data.message || "Ticket closed successfully");

      queryClient.invalidateQueries({
        queryKey: ["tickets", "escalate-tickets"],
      });
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to close ticket");
    },
  });

  // Transform Tickets Data
  const transformTicketsData = (tickets) => {
    return !tickets.length
      ? []
      : tickets.map((ticket, index) => {
          const escalatedIndex = ticket.escalatedTo.length - 1;
          const escalatedStatus =
            ticket.escalatedTo.length > 0
              ? ticket.escalatedTo[escalatedIndex].status
              : null;
          const escalatedTo =
            ticket.escalatedTo.length > 0
              ? ticket.escalatedTo[escalatedIndex].raisedToDepartment.name
              : null;

          const raisedBy = `${ticket.raisedBy?.firstName} ${ticket.raisedBy?.lastName}`;
          const acceptedBy = `${ticket.acceptedBy?.firstName} ${ticket.acceptedBy?.lastName}`;
          const escalatedTicket = {
            srno: index + 1,
            id: ticket._id,
            raisedBy: raisedBy || "Unknown",
            acceptedBy: acceptedBy || "Unknown",
            selectedDepartment:
              ticket.raisedBy?.departments.map((dept) => dept.name) || "N/A",
            ticketTitle: ticket?.ticket || "No Title",
            tickets:
              ticket?.assignees.length > 0
                ? "Ticket Assigned"
                : ticket?.acceptedBy
                ? "Ticket Accepted"
                : "N/A",
            status: ticket.status || "Pending",
            escalatedStatus,
            escalatedTo,
          };

          return escalatedTicket;
        });
  };

  const rows = isLoading ? [] : transformTicketsData(escalatedTickets);

  const recievedTicketsColumns = [
    { field: "srno", headerName: "SR NO" },
    { field: "raisedBy", headerName: "Raised By" },
    {
      field: "selectedDepartment",
      headerName: "Selected Department",
      width: 100,
    },
    { field: "ticketTitle", headerName: "Ticket Title", flex: 1 },
    {
      field: "tickets",
      headerName: "Tickets",
      cellRenderer: (params) => {
        console.log(params.value);
        const statusColorMap = {
          "Assigned Ticket": { backgroundColor: "#ffbac2", color: "#ed0520" }, // Light orange bg, dark orange font
          "Ticket Accepted": { backgroundColor: "#90EE90", color: "#02730a" }, // Light green bg, dark green font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <div className="flex flex-col justify-center pt-4">
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
            <span className="text-small text-borderGray text-center h-full">
              {params.data.acceptedBy}
            </span>
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          "Ticket Accepted": { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          "In Progress": { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
          Closed: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          Escalated: { backgroundColor: "#E6E6FA", color: "#4B0082" }, // Light purple bg, dark purple font
          Completed: { backgroundColor: "#D3D3D3", color: "#696969" }, // Light gray bg, dark gray font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    {
      field: "escalatedStatus",
      headerName: "Escalated Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          "In Progress": { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
          Closed: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          Open: { backgroundColor: "#E6E6FA", color: "#4B0082" }, // Light purple bg, dark purple font
          Completed: { backgroundColor: "#D3D3D3", color: "#696969" }, // Light gray bg, dark gray font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <div className="flex flex-col justify-center pt-4">
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </div>
        );
      },
    },
    {
      field: "escalatedTo",
      headerName: "Escalated To",
    },
    {
      field: "action",
      headerName: "Action",
      cellRenderer: (params) => (
        <>
          <ThreeDotMenu
            rowId={params.data.id}
            menuItems={[
              { label: "Close", onClick: () => mutate(params.data.id) },
            ]}
          />
        </>
      ),
    },
  ];

  return (
    <div className="p-4 border-default border-borderGray rounded-md">
      <div className="pb-4">
        <span className="text-subtitle">{title}</span>
      </div>
      <div className="w-full">
        <AgTable data={rows} columns={recievedTicketsColumns} />
      </div>
    </div>
  );
};

export default EscalatedTickets;
