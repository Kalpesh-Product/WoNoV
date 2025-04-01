import AgTable from "../../../components/AgTable";
import { Chip, CircularProgress, Typography } from "@mui/material";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../main";

const AcceptedTickets = ({ title }) => {
  const axios = useAxiosPrivate();

  // Fetch Accepted Tickets
  const { data: acceptedTickets = [], isLoading } = useQuery({
    queryKey: ["accepted-tickets"],
    queryFn: async () => {
      const response = await axios.get("/api/tickets/filtered-tickets/accept");

      return response.data;
    },
  });

  const { mutate } = useMutation({
    mutationKey: ["close-ticket"],
    mutationFn: async (ticketId) => {
      const response = await axios.post("/api/tickets/close-ticket", {
        ticketId,
      });
      return response.data;
    },

    onSuccess: (data) => {
      toast.success(data.message || "Ticket closed successfully");
      queryClient.invalidateQueries(["accepted-tickets"]); // Refetch tickets
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to close ticket");
    },
  });

  // Transform Tickets Data
  const transformTicketsData = (tickets) => {
    return !tickets.length
      ? []
      : tickets.map((ticket) => ({
          id: ticket._id,
          raisedBy: ticket.raisedBy?.name || "Unknown",
          raisedToDepartment: ticket.raisedToDepartment.name || "N/A",
          ticketTitle: ticket?.ticket || "No Title",
          status: ticket.status || "Pending",
        }));
  };

  const rows = isLoading ? [] : transformTicketsData(acceptedTickets);

  const recievedTicketsColumns = [
    { field: "raisedBy", headerName: "Raised By" },
    {
      field: "raisedToDepartment",
      headerName: "Selected Department",
      width: 100,
    },
    { field: "ticketTitle", headerName: "Ticket Title", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          "In Progress": { backgroundColor: "#FFECC5", color: "#CC8400" },
          Closed: { backgroundColor: "#90EE90", color: "#02730a" },
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return <Chip label={params.value} style={{ backgroundColor, color }} />;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <button
            onClick={() => mutate(params.data.id)}
            style={{
              backgroundColor: "green",
              color: "white",
              border: "none",
              padding: "0.1rem 0.5rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <button
            style={{
              backgroundColor: "blue",
              color: "white",
              border: "none",
              padding: "0.1rem 0.5rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Support
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 border-default border-borderGray rounded-md">
      <div className="pb-4">
        <Typography variant="h6">{title}</Typography>
      </div>
      <div className="w-full">
        {isLoading && (
          <div className="flex justify-center">
            <CircularProgress color="black" />
          </div>
        )}
        {!isLoading ? (
          <AgTable
            key={rows.length}
            data={rows}
            columns={recievedTicketsColumns}
          />
        ) : null}
      </div>
    </div>
  );
};

export default AcceptedTickets;
