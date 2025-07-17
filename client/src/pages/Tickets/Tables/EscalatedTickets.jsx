import AgTable from "../../../components/AgTable";
import { Chip } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import { queryClient } from "../../../main";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { useState } from "react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import humanDate from "./../../../utils/humanDateForamt";

const EscalatedTickets = ({ title, departmentId }) => {
  const axios = useAxiosPrivate();
  const [openView, setOpenView] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Fetch Supported Tickets
  const { data: escalatedTickets = [], isLoading } = useQuery({
    queryKey: ["escalate-tickets"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/tickets/ticket-filter/escalate/${departmentId}`
      );

      return response.data;
    },
  });

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setOpenView(true);
  };

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
        queryKey: ["escalate-tickets"],
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
          const acceptedBy = ticket.acceptedBy
            ? `${ticket.acceptedBy?.firstName} ${ticket.acceptedBy?.lastName}`
            : "N/A";

          const escalatedTicket = {
            srno: index + 1,
            id: ticket._id,
            raisedBy: raisedBy || "Unknown",
            description: ticket.description || "N/A",
            priority: ticket.priority,
            raisedAt: ticket.createdAt || "N/A",
            acceptedBy: acceptedBy,
            raisedToDepartment: ticket.raisedToDepartment.name || "N/A",
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
            acceptedAt: ticket.acceptedAt || "N/A",
            escalatedStatus,
            escalatedTo:
              ticket.escalatedTo
                .map((dept) => dept.raisedToDepartment.name)
                .join(", ") || "N/A",
          };

          return escalatedTicket;
        });
  };

  const rows = isLoading ? [] : transformTicketsData(escalatedTickets);

  const recievedTicketsColumns = [
    { field: "srno", headerName: "Sr No", width: 100 },
    { field: "raisedBy", headerName: "Raised By" },
    {
      field: "selectedDepartment",
      headerName: "From Department",
    },
    { field: "ticketTitle", headerName: "Ticket Title", width: 250 },
    {
      field: "tickets",
      headerName: "Tickets",
      cellRenderer: (params) => {
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
          <div className="pt-3">
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
      pinned: "right",
      cellRenderer: (params) => {
        const menuItems = [
          {
            label: "View",
            onClick: () => handleViewTicket(params.data),
          },
        ];

        // Allow closing the original ticket only if escalated ticket is closed
        const isClosed = params.data.escalatedStatus === "Closed";
        if (isClosed) {
          menuItems.push({
            label: "Close",
            onClick: () => mutate(params.data.id),
          });
        }
        return (
          <ThreeDotMenu rowId={params.data.meetingId} menuItems={menuItems} />
        );
      },
    },
  ];

  return (
    <div className="p-4 border-default border-borderGray rounded-md">
      <div className="pb-4">
        <span className="text-subtitle">{title}</span>
      </div>
      <div className="w-full">
        <AgTable data={rows} columns={recievedTicketsColumns} search />
        <MuiModal
          open={openView}
          onClose={() => setOpenView(false)}
          title="View Escalated Ticket"
        >
          {selectedTicket && (
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              <DetalisFormatted
                title="Ticket"
                detail={selectedTicket.ticketTitle || "N/A"}
              />
              <DetalisFormatted
                title="Description"
                detail={selectedTicket.description || "N/A"}
              />
              <DetalisFormatted
                title="Raised By"
                detail={selectedTicket.raisedBy || "Unknown"}
              />
              <DetalisFormatted
                title="Raised At"
                detail={humanDate(new Date(selectedTicket.raisedAt))}
              />
              <DetalisFormatted
                title="From Department"
                detail={
                  selectedTicket.selectedDepartment
                    .map((item) => item)
                    .join(", ") || "N/A"
                }
              />
              <DetalisFormatted
                title="Raised To Department"
                detail={selectedTicket.raisedToDepartment || "N/A"}
              />
              <DetalisFormatted title="Status" detail={selectedTicket.status} />
              <DetalisFormatted
                title="Priority"
                detail={selectedTicket?.priority || "N/A"}
              />
              <DetalisFormatted
                title="Accepted by"
                detail={selectedTicket?.acceptedBy || "N/A"}
              />
              <DetalisFormatted
                title="Accepted at"
                detail={humanDate(selectedTicket?.acceptedAt) || "N/A"}
              />
              <DetalisFormatted
                title="Escalated To"
                detail={selectedTicket.escalatedTo || "N/A"}
              />
              <DetalisFormatted title="Status" detail={selectedTicket.status} />
              <DetalisFormatted
                title="Escalated Status"
                detail={selectedTicket.escalatedStatus}
              />
            </div>
          )}
        </MuiModal>
      </div>
    </div>
  );
};

export default EscalatedTickets;
