import React, { useState } from "react";
import AgTable from "../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";

const TicketsHistory = ({ pageTitle }) => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [viewTicketDetails, setViewTicketDetails] = useState({});
  const { data: tickets, isPending: ticketsLoading } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: async function () {
      const response = await axios.get("/api/tickets/today");
      return response.data;
    },
  });
  const handleViewTicketDetails = (ticket) => {
    setViewTicketDetails(ticket);
    setOpenModal(true);
  };
  const recievedTicketsColumns = [
    { field: "id", headerName: "Sr No", width: 80, sort: "desc" },
    { field: "raisedBy", headerName: "Raised By", width: 150 },
    { field: "raisedTo", headerName: "To Department", width: 150 },
    { field: "ticketTitle", headerName: "Ticket Title", width: 250 },
    { field: "description", headerName: "Description", width: 300 },

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
            onClick={() => handleViewTicketDetails(params.data)}>
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
            <AgTable
              key={tickets?.length}
              search
              data={tickets?.map((ticket, index) => ({
                id: index + 1,
                raisedBy: ticket.raisedBy.firstName,
                raisedTo: ticket.raisedToDepartment.name,
                description: ticket.description,
                ticketTitle: ticket.ticket,
                status: ticket.status,
                priority: ticket.priority,
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
        title={"View Ticket Details"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <DetalisFormatted
            title="Raised By"
            detail={viewTicketDetails?.raisedBy}
          />
          <DetalisFormatted
            title="Raised To"
            detail={viewTicketDetails?.raisedTo}
          />
          <DetalisFormatted
            title="Ticket Title"
            detail={viewTicketDetails?.ticketTitle}
          />
          <DetalisFormatted
            title="Description"
            detail={viewTicketDetails?.description}
          />
          <DetalisFormatted title="Status" detail={viewTicketDetails?.status} />
          <DetalisFormatted
            title="Priority"
            detail={viewTicketDetails?.priority}
          />
        </div>
      </MuiModal>
    </>
  );
};

export default TicketsHistory;
