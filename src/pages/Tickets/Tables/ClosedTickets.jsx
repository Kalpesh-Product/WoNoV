import AgTable from "../../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

const ClosedTickets = ({ title }) => {
  const axios = useAxiosPrivate();

  const { data, isLoading } = useQuery({
    queryKey: ["closed-tickets"],
    queryFn: async () => {
      const response = await axios.get("/api/tickets/filtered-tickets/close");
      return response.data || []; 
    },
    initialData: [], 
  });

  const transformTicketsData = (tickets) => {
    return !tickets.length
      ? []
      : tickets.map((ticket) => ({
          id: ticket._id,
          raisedBy: ticket.raisedBy?.name || "Unknown",
          fromDepartment: ticket.raisedToDepartment?.name || "N/A",
          ticketTitle: ticket?.ticket || "No Title",
          status: ticket.status || "Pending",
        }));
  };

  const rows = isLoading ? [] : transformTicketsData(data);
  const recievedTicketsColumns = [
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
    </div>
  );
};

export default ClosedTickets;
