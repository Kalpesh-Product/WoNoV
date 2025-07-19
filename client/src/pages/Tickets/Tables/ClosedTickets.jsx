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
          closedAt: ticket.closedAt ? humanTime(ticket.closedAt) : "-",
          closedBy: ticket?.closedBy
            ? `${ticket.closedBy.firstName} ${ticket.closedBy.lastName}`
            : "None",
          priority: ticket.priority,
          image: ticket.image ? ticket.image.url : null,
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
            detail={humanDate(viewTicketDetails.createdAt)}
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
            title="Accepted by"
            detail={viewTicketDetails?.acceptedBy}
          />
          <DetalisFormatted
            title="Accepted at"
            detail={viewTicketDetails?.acceptedAt}
          />
          <DetalisFormatted
            title="Closed by"
            detail={viewTicketDetails?.closedBy}
          />
          <DetalisFormatted
            title="Closed at"
            detail={viewTicketDetails?.closedAt}
          />
        </div>
      </MuiModal>
    </div>
  );
};

export default ClosedTickets;
