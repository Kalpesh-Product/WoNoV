import { useState } from "react";
import AgTable from "../../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import MuiModal from "../../../components/MuiModal";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../components/DetalisFormatted";
import humanTime from "../../../utils/humanTime";
import humanDate from "../../../utils/humanDateForamt";

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
          srNo: index + 1,
          id: ticket._id,
          raisedBy: ticket.raisedBy?.firstName || "Unknown",
          fromDepartment: ticket.raisedToDepartment?.name || "N/A",
          ticketTitle: ticket?.ticket || "No Title",
          status: ticket.status || "Pending",
          description: ticket.description || "-",
          acceptedBy: ticket?.acceptedBy
            ? `${ticket.acceptedBy.firstName} ${ticket.acceptedBy.lastName}`
            : "",
          acceptedAt: ticket.acceptedAt ? humanTime(ticket.acceptedAt) : "-",
          closedAt: ticket.closedAt ? humanTime(ticket.closedAt) : "-",
          priority: ticket.priority,
          image: ticket.image ? ticket.image.url : null,
        }));
  };

  const rows = isLoading ? [] : transformTicketsData(data);

  const recievedTicketsColumns = [
    { field: "srNo", headerName: "Sr No" },
    { field: "raisedBy", headerName: "Raised By" },
    { field: "fromDepartment", headerName: "From Department" },
    { field: "ticketTitle", headerName: "Ticket Title", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
          "in-progress": { backgroundColor: "#ADD8E6", color: "#00008B" },
          resolved: { backgroundColor: "#90EE90", color: "#006400" },
          open: { backgroundColor: "#E6E6FA", color: "#4B0082" },
          Closed: { backgroundColor: "#cce7fc", color: "#259bf5" },
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <Chip
            label={params.value}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
    { field: "closedAt", headerName: "Closed At" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => handleViewTicketDetails(params.data)}>
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
          />
        )}
      </div>

      {/* Ticket Details Modal */}
      <MuiModal
        open={openModal && viewTicketDetails}
        onClose={() => setOpenModal(false)}
        title={"View Ticket Details"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
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
            detail={humanDate(new Date(viewTicketDetails.raisedDate))}
          />
          <DetalisFormatted
            title="From Department"
            detail={viewTicketDetails?.fromDepartment}
          />
          <DetalisFormatted
            title="Raised To Department"
            detail={viewTicketDetails.raisedToDepartment || "N/A"}
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
            title="Closed at"
            detail={viewTicketDetails?.closedAt}
          />
        </div>
      </MuiModal>
    </div>
  );
};

export default ClosedTickets;
