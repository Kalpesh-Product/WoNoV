import { useMemo, useState } from "react";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import dayjs from "dayjs";
import { Chip } from "@mui/material";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import MuiModal from "../../../components/MuiModal";
import TicketDetails from "../../../components/TicketDetails";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../components/DetalisFormatted";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";
import StatusChip from "../../../components/StatusChip";
import formatDateTime from "../../../utils/formatDateTime";
import TicketAttachments from "../../../components/TicketAttachments";

const ClosedTickets = ({
  title,
  departmentId,
  isItDepartment,
  isTechDepartment,
}) => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [viewTicketDetails, setViewTicketDetails] = useState({});
  const initialDateRange = useMemo(
    () => ({
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    }),
    [],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["closed-tickets", departmentId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/tickets/ticket-filter/close/${departmentId}`,
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
          : assigneeName,
      )
      .join(", ");

    return { assignedToDisplay, assignmentDetails };
  };

  const transformTicketsData = (tickets) => {
    return !tickets.length
      ? []
      : tickets.map((ticket) => ({
          ...ticket,
          sourceTicket: ticket,
          id: ticket._id,
          raisedBy: ticket.raisedBy?.firstName || "Unknown",

          fromDepartment: ticket.raisedBy?.departments?.map(
            (item) => item.name || "N/A",
          ),
          raisedToDepartment: ticket?.raisedToDepartment?.name || "N/A",
          ticketTitle: ticket?.ticket || "No Title",
          status: ticket.status || "Pending",
          description: ticket.description || "-",
          acceptedBy: ticket?.acceptedBy
            ? `${ticket.acceptedBy.firstName} ${ticket.acceptedBy.lastName}`
            : "",
          acceptedAt: ticket.acceptedAt ? humanTime(ticket.acceptedAt) : "-",
          ...(() => {
            const { assignedToDisplay, assignmentDetails } = formatAssignments(
              ticket.assignedTo,
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
              ticket.assignedTo,
            );
            return {
              assignees: assignedToDisplay || "N/A",
              assignedToDetails: assignmentDetails,
            };
          })(),
          closedAt: ticket.closedAt ? formatDateTime(ticket.closedAt) : "-",
          closedAtRaw: ticket.closedAt || null,
          closedBy: ticket?.closedBy
            ? `${ticket.closedBy.firstName} ${ticket.closedBy.lastName}`
            : "None",
          priority: ticket.priority,
          image: ticket.image ? ticket.image.url : null,
          attachments: ticket.attachments || [],
          ...formatEscalation(ticket.escalatedTo),
        }));
  };

  const rows = isLoading ? [] : transformTicketsData(data);

  const recievedTicketsColumns = [
    { field: "srNo", headerName: "Sr No", sort: "asc" },
    { field: "ticketTitle", headerName: "Ticket Title", width: 250 },
    { field: "fromDepartment", headerName: "From Department" },
    { field: "raisedBy", headerName: "Raised By" },
    { field: "raisedToDepartment", headerName: "Raised To Department" },
    { field: "acceptedBy", headerName: "Accepted By" },
    {
      field: "status",
      headerName: "Status",
      pinned: "right",
      cellRenderer: (params) => {
        return <StatusChip status={params.value} />;
      },
    },
    { field: "closedBy", headerName: "Closed By",pinned: "right", },
    { field: "closedAt", headerName: "Closed At" ,pinned: "right",},
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
      <div className="w-full">
          <YearWiseTable
            loading={isLoading}
            tableTitle={title}
            data={rows}
            columns={recievedTicketsColumns}
            dateColumn="closedAtRaw"
            initialDateRange={initialDateRange}
            tableHeight={400}
            showEmptyTable
            search
          />
      </div>

      {/* Ticket Details Modal */}
      <MuiModal
        open={openModal && viewTicketDetails}
        onClose={() => setOpenModal(false)}
        title={"View Ticket Details"}
      >
        <TicketDetails ticket={viewTicketDetails} />
      </MuiModal>
    </div>
  );
};

export default ClosedTickets;
