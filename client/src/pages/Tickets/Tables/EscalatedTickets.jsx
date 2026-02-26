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
import formatDateTime from "../../../utils/formatDateTime";

const EscalatedTickets = ({ title, departmentId }) => {
  const axios = useAxiosPrivate();
  const [openView, setOpenView] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Fetch Supported Tickets
  const { data: escalatedTickets = [], isLoading } = useQuery({
    queryKey: ["escalate-tickets"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/tickets/ticket-filter/escalate/${departmentId}`,
      );

      return response.data;
    },
  });

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setOpenView(true);
  };

  const formatAssignments = (assignments = []) => {
    const assignmentDetails = Array.isArray(assignments)
      ? assignments.map((assignment) => {
          const assignee = assignment?.assignee;
          const assigneeName =
            assignee?.firstName && assignee?.lastName
              ? `${assignee.firstName} ${assignee.lastName}`
              : "Unknown";
          const assignedAtFormatted = formatDateTime(assignment?.assignedAt);

          return { assigneeName, assignedAtFormatted };
        })
      : [];

    const assignedToDisplay = assignmentDetails
      .map(({ assigneeName, assignedAtFormatted }) =>
        assignedAtFormatted && assignedAtFormatted !== "N/A"
          ? `${assigneeName} (${assignedAtFormatted})`
          : assigneeName,
      )
      .join(", ");

    return { assignedToDisplay, assignmentDetails };
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
          const escalatedAt =
            ticket.escalatedTo.length > 0
              ? ticket.escalatedTo[escalatedIndex].createdAt
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
            escalatedAt,
            escalatedTo:
              ticket.escalatedTo
                .map((dept) => dept.raisedToDepartment.name)
                .join(", ") || "N/A",
            ...(() => {
              const { assignedToDisplay, assignmentDetails } =
                formatAssignments(ticket.assignedTo);
              return {
                assignedTo: assignedToDisplay,
                assignedToDetails: assignmentDetails,
              };
            })(),
          };

          return escalatedTicket;
        });
  };

  const rows = isLoading ? [] : transformTicketsData(escalatedTickets);

  const recievedTicketsColumns = [
    { field: "srno", headerName: "Sr No", width: 100 },
    { field: "ticketTitle", headerName: "Ticket Title", width: 250 },
    {
      field: "selectedDepartment",
      headerName: "From Department",
    },
    { field: "raisedBy", headerName: "Raised By" },
    { field: "raisedToDepartment", headerName: "Raised To Department" },
    // {
    //   field: "tickets",
    //   headerName: "Tickets",
    //   cellRenderer: (params) => {
    //     const statusColorMap = {
    //       "Assigned Ticket": { backgroundColor: "#ffbac2", color: "#ed0520" }, // Light orange bg, dark orange font
    //       "Ticket Accepted": { backgroundColor: "#90EE90", color: "#02730a" }, // Light green bg, dark green font
    //     };

    //     const { backgroundColor, color } = statusColorMap[params.value] || {
    //       backgroundColor: "gray",
    //       color: "white",
    //     };
    //     return (
    //       <div className="flex flex-col justify-center pt-4">
    //         <Chip
    //           label={params.value}
    //           style={{
    //             backgroundColor,
    //             color,
    //           }}
    //         />
    //         <span className="text-small text-borderGray text-center h-full">
    //           {params.data.acceptedBy}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
    {
      field: "escalatedTo",
      headerName: "Escalated To",
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
      field: "action",
      headerName: "Action",
      pinned: "right",
      cellRenderer: (params) => {
        // const menuItems = [
        //   {
        //     label: "View",
        //     onClick: () => handleViewTicket(params.data),
        //   },
        // ];
        const menuItems = [];

        // Allow closing the original ticket only if escalated ticket is closed
        const isClosed = params.data.escalatedStatus === "Closed";
        if (isClosed) {
          menuItems.push({
            label: "Close",
            onClick: () => mutate(params.data.id),
          });
        }
        return (
          <div className="flex items-center gap-2">
            <div
              role="button"
              onClick={() => handleViewTicket(params.data)}
              className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
            >
              <MdOutlineRemoveRedEye />
            </div>
            <ThreeDotMenu rowId={params.data.meetingId} menuItems={menuItems} />
          </div>
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
                title="Ticket Title"
                detail={selectedTicket.ticketTitle || "N/A"}
              />
              <DetalisFormatted
                title="Description"
                detail={selectedTicket.description || "N/A"}
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
                title="Raised By"
                detail={selectedTicket.raisedBy || "Unknown"}
              />
              <DetalisFormatted
                title="Raised At"
                detail={formatDateTime(selectedTicket.raisedAt)}
              />
              <DetalisFormatted
                title="Raised To Department"
                detail={selectedTicket.raisedToDepartment || "N/A"}
              />
              {/* <DetalisFormatted title="Status" detail={selectedTicket.status} /> */}
              <DetalisFormatted
                title="Priority"
                detail={selectedTicket?.priority || "N/A"}
              />
              <DetalisFormatted
                title="Accepted By"
                detail={selectedTicket?.acceptedBy || ""}
              />
              <DetalisFormatted
                title="Accepted At"
                detail={formatDateTime(selectedTicket?.acceptedAt)}
              />
              {selectedTicket?.assignedToDetails?.length ? (
                <div className="text-content flex items-start w-full">
                  <span className="w-[50%]">Assignees</span>
                  <span>:</span>
                  <div className="text-content flex flex-col gap-2 items-start w-full justify-start pl-4">
                    {selectedTicket.assignedToDetails.map(
                      (assignment, index) => (
                        <div key={`${assignment.assigneeName}-${index}`}>
                          <div className="font-medium">
                            {assignment.assigneeName}
                          </div>
                          <div className="text-borderGray">
                            {assignment.assignedAtFormatted || "N/A"}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <DetalisFormatted
                  title="Assignees"
                  detail={selectedTicket?.assignees || ""}
                />
              )}
              <DetalisFormatted
                title="Escalated To"
                detail={selectedTicket.escalatedTo || "N/A"}
              />
              <DetalisFormatted title="Status" detail={selectedTicket.status} />
              <DetalisFormatted
                title="Escalation Status"
                detail={selectedTicket.escalatedStatus}
              />
              <DetalisFormatted
                title="Escalated At"
                detail={formatDateTime(selectedTicket?.escalatedAt)}
              />
            </div>
          )}
        </MuiModal>
      </div>
    </div>
  );
};

export default EscalatedTickets;
