import AgTable from "../../../components/AgTable";
import {
  Autocomplete,
  Chip,
  CircularProgress,
  LinearProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../main";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import PrimaryButton from "../../../components/PrimaryButton";
import { useState } from "react";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import { IoMdClose } from "react-icons/io";
import DetalisFormatted from "../../../components/DetalisFormatted";
import humanTime from "../../../utils/humanTime";

import humanDate from "./../../../utils/humanDateForamt";

const AcceptedTickets = ({ title, departmentId }) => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [esCalateModal, setEscalateModal] = useState(false);
  const [esCalatedTicket, setEscalatedTicket] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const {
    handleSubmit: handleSupportTicketSubmit,
    reset: resetSupportTicketForm,
    control: supportTicketControl,
    formState: { errors: supportTicketsError },
  } = useForm({
    defaultValues: {
      reason: "",
    },
  });
  const {
    handleSubmit: handleEscalateTicketSubmit,
    reset: resetEscalateForm,
    control: escalateFormControl,
    formState: { errors: escalateTicketErrors },
  } = useForm({
    defaultValues: {
      departmentIds: [],
      description: "",
    },
  });

  const handleViewTicket = (ticket) => {
    setSelectedTicket({
      ...ticket,
      selectedDepartment: Array.isArray(ticket.raisedToDepartment)
        ? ticket.raisedToDepartment
        : [ticket.raisedToDepartment],
    });
    setOpenView(true);
  };

  const { data: departments = [], isPending: isDepartmentsPending } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "api/company/get-company-data?field=selectedDepartments"
        );
        return response.data?.selectedDepartments;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
  });

  // Fetch Accepted Tickets
  const { data: acceptedTickets = [], isLoading } = useQuery({
    queryKey: ["accepted-tickets"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tickets/ticket-filter/accept-assign/${departmentId}`
        );
        const filtered = response.data;
        const hasAssigned = filtered.some(
          (ticket) => ticket.assignees?.length > 0
        );
        return filtered;
      } catch (error) {
        console.error("Error fetching tickets:", error);
        throw new Error("Failed to fetch tickets");
      }
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["accepted-tickets"] }); // Refetch tickets
      queryClient.invalidateQueries({ queryKey: ["tickets-data"] });
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to close ticket");
    },
  });

  const { mutate: getSupport, isPending: isGetSupportPending } = useMutation({
    mutationKey: ["get-support"],
    mutationFn: async (data) => {
      const response = await axios.post(`/api/tickets/support-ticket`, data);
      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message || "Support ticket created successfully");
      queryClient.invalidateQueries({ queryKey: ["accepted-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets-data"] });
      resetSupportTicketForm();
      setOpenModal(false);
    },
    onError: function (error) {
      toast.error(
        error.response.data.message || "Failed to create support ticket"
      );
    },
  });
  const { mutate: escalateTicket, isPending: isEscalatePending } = useMutation({
    mutationKey: ["escalate-ticket"],
    mutationFn: async (ticketDetails) => {
      const response = await axios.patch("/api/tickets/escalate-ticket", {
        ticketId: esCalatedTicket.id,
        description: ticketDetails.description,
        departmentIds: ticketDetails.departmentIds,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setEscalateModal(false);
      resetEscalateForm();
      toast.success(data.message || "Ticket escalated successfully");
      queryClient.invalidateQueries({ queryKey: ["accepted-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets-data"] });
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Failed to escalate ticket");
    },
  });

  const handleSupportTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setOpenModal(true);
  };
  const handleEscalateTicket = (ticketDetails) => {
    setEscalateModal(true);
    setEscalatedTicket(ticketDetails);
  };
  const onSubmit = (data) => {
    if (!selectedTicketId) return;
    getSupport({ ticketId: selectedTicketId, reason: data.reason });
  };
  const onEscalate = (ticketDetails) => {
    console.log(ticketDetails);
    if (!ticketDetails) return;
    escalateTicket({
      ticketId: esCalatedTicket.id,
      description: ticketDetails.description,
      departmentIds: ticketDetails.departmentIds,
    });
  };

  const recievedTicketsColumns = [
    { field: "srNo", headerName: "Sr No" },
    { field: "acceptedBy", headerName: "Accepted By" },
    { field: "raisedBy", headerName: "Raised By" },
    {
      field: "raisedToDepartment",
      headerName: "From Department",
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
        <div className="flex gap-2">
          <ThreeDotMenu
            rowId={params.data.id}
            menuItems={[
              { label: "View", onClick: () => handleViewTicket(params.data) }, // 👈 Add this line
              { label: "Close", onClick: () => mutate(params.data.id) },
              {
                label: "Support",
                onClick: () => handleSupportTicket(params.data.id),
              },
              {
                label: "Escalate",
                onClick: () => handleEscalateTicket(params.data),
              },
            ]}
          />
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
            <LinearProgress color="black" />
          </div>
        )}
        {!isLoading ? (
          <AgTable
            key={acceptedTickets.length}
            hideFilter
            data={[
              ...acceptedTickets.map((ticket, index) => ({
                srNo: index + 1,
                id: ticket._id,
                raisedBy: ticket.raisedBy
                  ? `${ticket.raisedBy.firstName} ${ticket.raisedBy.lastName}`
                  : "Unknown",

                description: ticket.description,
                raisedToDepartment:
                  ticket.raisedBy.departments.map((dept) => dept.name) || "N/A",
                ticketTitle: ticket?.ticket || "No Title",
                status: ticket.status || "Pending",
                acceptedBy: ticket?.acceptedBy
                  ? `${ticket.acceptedBy.firstName} ${ticket.acceptedBy.lastName}`
                  : `${
                      ticket.assignees.map(
                        (item) => `${item.firstName} ${item.lastName}`
                      )[0]
                    }`,
                assignees: `${
                  ticket.assignees.map((item) => item.firstName)[0]
                }`,
                acceptedAt: ticket.acceptedAt
                  ? humanTime(ticket.acceptedAt)
                  : "-",
                priority: ticket.priority,
                image: ticket.image ? ticket.image.url : null,
              })),
            ]}
            columns={recievedTicketsColumns}
          />
        ) : (
          []
        )}
      </div>

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Support Ticket"}>
        <form
          onSubmit={handleSupportTicketSubmit(onSubmit)}
          className="flex flex-col gap-4">
          <Controller
            name="reason"
            control={supportTicketControl}
            rules={{ required: "Reason is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label={"Reason"}
                multiline
                rows={5}
                error={!!supportTicketsError.reason}
                helperText={supportTicketsError.reason?.message}
              />
            )}
          />
          <PrimaryButton
            title={"Submit"}
            isLoading={isGetSupportPending}
            disabled={isGetSupportPending}
            type={"submit"}
          />
        </form>
      </MuiModal>

      <MuiModal open={esCalateModal} onClose={() => setEscalateModal(false)}>
        <div>
          <form
            onSubmit={handleEscalateTicketSubmit(onEscalate)}
            className="grid grid-cols-1 gap-4">
            <Controller
              name="departmentIds"
              control={escalateFormControl}
              rules={{ required: "Department is required" }}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={departments}
                  getOptionLabel={(dept) => `${dept.department.name}`}
                  onChange={(_, newValue) =>
                    field.onChange(newValue.map((dept) => dept.department._id))
                  }
                  renderTags={(selected, getTagProps) =>
                    selected.map((dept, index) => (
                      <Chip
                        key={dept.department._id}
                        label={`${dept.department.name}`}
                        {...getTagProps({ index })}
                        deleteIcon={<IoMdClose />}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Departments"
                      size="small"
                      fullWidth
                      error={!!escalateTicketErrors.departmentIds}
                      helperText={escalateTicketErrors.departmentIds?.message}
                    />
                  )}
                />
              )}
            />

            <Controller
              name="description"
              control={escalateFormControl}
              rules={{ required: "Escalation description is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={"Description"}
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  error={!!escalateTicketErrors.description}
                  helperText={escalateTicketErrors.description?.message}
                />
              )}
            />
            <PrimaryButton
              title={"Escalate Ticket"}
              isLoading={isEscalatePending}
              disabled={isEscalatePending}
            />
          </form>
        </div>
      </MuiModal>

      <MuiModal
        open={openView}
        onClose={() => setOpenView(false)}
        title="View Accepted Ticket">
        {selectedTicket && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted
              title="Ticket"
              detail={selectedTicket.ticketTitle}
            />
            <DetalisFormatted
              title="Description"
              detail={selectedTicket.description || "N/A"}
            />
            <DetalisFormatted
              title="Raised By"
              detail={selectedTicket.raisedBy}
            />
            <DetalisFormatted
              title="Raised At"
              detail={humanDate(new Date(selectedTicket.raisedDate))}
            />
            <DetalisFormatted
              title="From Department"
              detail={
                Array.isArray(selectedTicket.selectedDepartment)
                  ? selectedTicket.selectedDepartment.join(", ")
                  : selectedTicket.selectedDepartment
              }
            />
            <DetalisFormatted
              title="Raised To Department"
              detail={selectedTicket.raisedToDepartment || "N/A"}
            />
            <DetalisFormatted title="Status" detail={selectedTicket.status} />
            <DetalisFormatted
              title="Priority"
              detail={selectedTicket?.priority}
            />
            <DetalisFormatted
              title="Accepted by"
              detail={selectedTicket?.acceptedBy}
            />
            <DetalisFormatted
              title="Accepted at"
              detail={selectedTicket?.acceptedAt}
            />
            {/* <DetalisFormatted title="Assigned to" detail={selectedTicket?.assignees} /> */}
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default AcceptedTickets;
