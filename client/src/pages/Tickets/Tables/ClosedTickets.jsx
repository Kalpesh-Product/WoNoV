import { useEffect, useState } from "react";
import AgTable from "../../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import MuiModal from "../../../components/MuiModal";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../components/DetalisFormatted";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import StatusChip from "../../../components/StatusChip";
import formatDateTime from "../../../utils/formatDateTime";

const ClosedTickets = ({ title, departmentId }) => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [viewTicketDetails, setViewTicketDetails] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["closed-tickets"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/tickets/ticket-filter/close/${departmentId}`
      );
      return response.data || [];
    },
    initialData: [],
  });

  const handleViewTicketDetails = (ticket) => {
    setViewTicketDetails(ticket);
    setOpenModal(true);
  };

  const formatEscalation = (escalations = []) => {
    if (!Array.isArray(escalations) || !escalations.length) {
      return { escalatedTo: "", escalatedStatus: "", escalatedAt: "" };
    }

    const latest = escalations[escalations.length - 1];
    return {
      escalatedTo: latest?.raisedToDepartment?.name || "",
      escalatedStatus: latest?.status || "",
      escalatedAt: formatDateTime(latest?.createdAt) || "",
    };
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
          : assigneeName
      )
      .join(", ");

    return { assignedToDisplay, assignmentDetails };
  };

  const transformTicketsData = (tickets) => {
    return !tickets.length
      ? []
      : tickets.map((ticket, index) => ({
          ...ticket,
          srNo: index + 1,
          id: ticket._id,
          raisedBy: ticket.raisedBy?.firstName || "Unknown",

          fromDepartment: ticket.raisedBy?.departments?.map(
            (item) => item.name || "N/A"
          ),
          ticketTitle: ticket?.ticket || "No Title",
          status: ticket.status || "Pending",
          description: ticket.description || "-",
          acceptedBy: ticket?.acceptedBy
            ? `${ticket.acceptedBy.firstName} ${ticket.acceptedBy.lastName}`
            : "",
          acceptedAt: ticket.acceptedAt ? humanTime(ticket.acceptedAt) : "-",
          ...(() => {
            const { assignedToDisplay, assignmentDetails } = formatAssignments(
              ticket.assignedTo
            );
            return {
              assignees: assignedToDisplay || "N/A",
              assignedToDetails: assignmentDetails,
            };
          })(),
          //   assignees:
          //     ticket.assignees.length > 0
          //       ? `${ticket.assignees.map(
          //           (item) => `${item.firstName} ${item.lastName}`
          //         )}`
          //       : "N/A",
          assignedAt: ticket.assignedAt || null,
          ...(() => {
            const { assignedToDisplay, assignmentDetails } = formatAssignments(
              ticket.assignedTo
            );
            return {
              assignees: assignedToDisplay || "N/A",
              assignedToDetails: assignmentDetails,
            };
          })(),
          closedAt: ticket.closedAt ? formatDateTime(ticket.closedAt) : "-",
          closedBy: ticket?.closedBy
            ? `${ticket.closedBy.firstName} ${ticket.closedBy.lastName}`
            : "None",
          priority: ticket.priority,
          image: ticket.image ? ticket.image.url : null,
          ...formatEscalation(ticket.escalatedTo),
        }));
  };

  const rows = isLoading ? [] : transformTicketsData(data);

  const recievedTicketsColumns = [
    { field: "srNo", headerName: "Sr No" },
    { field: "raisedBy", headerName: "Raised By" },
    { field: "fromDepartment", headerName: "From Department" },
    { field: "ticketTitle", headerName: "Ticket Title", width: 250 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        return <StatusChip status={params.value} />;
      },
    },
    { field: "closedAt", headerName: "Closed At" },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => handleViewTicketDetails(params.data)}
          >
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 border-default border-borderGray rounded-md">
      <div className="pb-4">
        <span className="text-subtitle">{title}</span>
      </div>
      <div className="w-full">
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <CircularProgress color="black" />
          </div>
        ) : (
          <AgTable
            key={rows.length}
            data={rows}
            columns={recievedTicketsColumns}
            noRowsOverlayMessage="No tickets to display."
            search
          />
        )}
      </div>

      {/* Ticket Details Modal */}
      <MuiModal
        open={openModal && viewTicketDetails}
        onClose={() => setOpenModal(false)}
        title={"View Ticket Details"}
      >
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
          <DetalisFormatted
            title="Ticket Title"
            detail={viewTicketDetails?.ticketTitle}
          />
          <DetalisFormatted
            title="Description"
            detail={viewTicketDetails?.description}
          />
          <DetalisFormatted
            title="Raised By"
            detail={viewTicketDetails?.raisedBy}
          />
          <DetalisFormatted
            title="Raised At"
            detail={formatDateTime(viewTicketDetails.createdAt)}
          />
          <DetalisFormatted
            title="From Department"
            detail={viewTicketDetails?.fromDepartment}
          />
          <DetalisFormatted
            title="Raised To Department"
            detail={viewTicketDetails.raisedToDepartment?.name || "N/A"}
          />
          <DetalisFormatted title="Status" detail={viewTicketDetails?.status} />
          <DetalisFormatted
            title="Priority"
            detail={viewTicketDetails?.priority}
          />
          <DetalisFormatted
            title="Accepted By"
            detail={viewTicketDetails?.acceptedBy}
          />
          <DetalisFormatted
            title="Accepted At"
            detail={formatDateTime(viewTicketDetails.createdAt)}
          />

          {viewTicketDetails?.assignedToDetails?.length ? (
            <div className="text-content flex items-start w-full">
              <span className="w-[50%]">Assignees</span>
              <span>:</span>
              <div className="text-content flex flex-col gap-2 items-start w-full justify-start pl-4">
                {viewTicketDetails.assignedToDetails.map(
                  (assignment, index) => (
                    <div key={`${assignment.assigneeName}-${index}`}>
                      <div className="font-medium">
                        {assignment.assigneeName}
                      </div>
                      <div className="text-borderGray">
                        {assignment.assignedAtFormatted || "N/A"}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <DetalisFormatted
              title="Assignees"
              detail={viewTicketDetails?.assignees}
            />
          )}
          <DetalisFormatted
            title="Escalated To"
            detail={viewTicketDetails?.escalatedTo || ""}
          />
          <DetalisFormatted
            title="Escalated Status"
            detail={viewTicketDetails?.escalatedStatus || ""}
          />
          <DetalisFormatted
            title="Escalated At"
            detail={viewTicketDetails?.escalatedAt || ""}
          />
          <DetalisFormatted
            title="Closed By"
            detail={viewTicketDetails?.closedBy}
          />
          <DetalisFormatted
            title="Closed At"
            detail={formatDateTime(viewTicketDetails.closedAt)}
          />
          <DetalisFormatted
            title="Closing Remark"
            detail={viewTicketDetails?.closingRemark}
          />
        </div>
      </MuiModal>
    </div>
  );
};

export default ClosedTickets;
