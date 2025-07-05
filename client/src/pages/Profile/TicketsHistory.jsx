import React, { useState } from "react";
import AgTable from "../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import humanTime from "../../utils/humanTime";

const TicketsHistory = ({ pageTitle }) => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [viewTicketDetails, setViewTicketDetails] = useState({});
  const { data: tickets, isPending: ticketsLoading } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: async function () {
      const response = await axios.get("/api/tickets/my-tickets");
      return response.data;
    },
  });
  const handleViewTicketDetails = (ticket) => {
    setViewTicketDetails(ticket);
    setOpenModal(true);
  };
  const recievedTicketsColumns = [
    { field: "srNo", headerName: "Sr No", width: 80, sort: "desc" },
    { field: "raisedBy", headerName: "Raised By", width: 150 },
    { field: "raisedTo", headerName: "To Department", width: 150 },
    { field: "ticketTitle", headerName: "Ticket Title", width: 250 },
    { field: "description", headerName: "Description", width: 300 },
    { field: "date", headerName: "Date" },

    {
      field: "priority",
      headerName: "Priority",
      width: 130,
      cellRenderer: (params) => {
        const statusColorMap = {
          High: { backgroundColor: "#FFC5C5", color: "#8B0000" },
          Medium: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Low: { backgroundColor: "#ADD8E6", color: "#00008B" },
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
    {
      field: "status",
      headerName: "Status",
      width: 140,
      cellRenderer: (params) => {
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
          "in-progress": { backgroundColor: "#ADD8E6", color: "#00008B" },
          resolved: { backgroundColor: "#90EE90", color: "#006400" },
          open: { backgroundColor: "#E6E6FA", color: "#4B0082" },
          completed: { backgroundColor: "#D3D3D3", color: "#696969" },
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
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
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
    <>
      <PageFrame>
        <div className="flex items-center justify-between pb-4">
          <span className="text-title font-pmedium text-primary uppercase">
            My Ticket History
          </span>
        </div>
        <div className=" w-full">
          {ticketsLoading ? (
            <div className="w-full h-full flex justify-center items-center">
              <CircularProgress color="black" />
            </div>
          ) : (
            <YearWiseTable
              dateColumn={"date"}
              key={tickets?.length}
              search
              data={tickets?.map((ticket, index) => ({
                srNo: index + 1,
                raisedBy: ticket.raisedBy.firstName,
                raisedTo: ticket.raisedToDepartment.name,
                description: ticket.description,
                ticketTitle: ticket.ticket,
                status: ticket.status,
                priority: ticket.priority,
                date: ticket.createdAt,
                 acceptedBy: ticket?.acceptedBy
                  ? `${ticket.acceptedBy.firstName} ${ticket.acceptedBy.lastName}`
                  : "None",
                closedBy: ticket?.closedBy
                  ? `${ticket.closedBy.firstName} ${ticket.closedBy.lastName}`
                  : "None",
                acceptedAt: ticket?.acceptedAt ,
                closedAt: ticket.closedAt ? ticket.closedAt : "None",
                image: ticket.image ? ticket.image.url : null,
                raisedAt: ticket.createdAt,
              }))}
              columns={recievedTicketsColumns}
              paginationPageSize={10}
            />
          )}
        </div>
      </PageFrame>

      <MuiModal
        open={openModal && viewTicketDetails}
        onClose={() => setOpenModal(false)}
        title={"Ticket Details"}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <DetalisFormatted
            title="Raised By"
            detail={viewTicketDetails?.raisedBy || "Unknown"}
          />
          <DetalisFormatted
            title="Raised To"
            detail={viewTicketDetails?.raisedTo || "N/A"}
          />
          <DetalisFormatted
            title="Ticket Title"
            detail={viewTicketDetails?.ticketTitle || "N/A"}
          />
          <DetalisFormatted
            title="Description"
            detail={viewTicketDetails?.description || "N/A"}
          />
          <DetalisFormatted title="Status" detail={viewTicketDetails?.status} />
          <DetalisFormatted
            title="Priority"
            detail={viewTicketDetails?.priority}
          />
             <DetalisFormatted
            title="Accepted by"
            detail={viewTicketDetails?.acceptedBy || "Unknown"}
          />
          <DetalisFormatted
            title="Accepted at"
            detail={viewTicketDetails.acceptedAt ?humanTime(viewTicketDetails?.acceptedAt) : "N/A"}
          />
          <DetalisFormatted
            title="Closed by"
            detail={viewTicketDetails?.closedBy || "Unknown"}
          />
          {viewTicketDetails.image && (
            <div className="lg:col-span-1">
              <img
                src={viewTicketDetails.image}
                alt="Ticket Attachment"
                className="max-w-full max-h-96 rounded border"
              />
            </div>
          )}
        </div>
      </MuiModal>
    </>
  );
};

export default TicketsHistory;
