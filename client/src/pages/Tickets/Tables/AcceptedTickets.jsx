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
import { useEffect, useState } from "react";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import { IoMdClose } from "react-icons/io";
import DetalisFormatted from "../../../components/DetalisFormatted";
import humanTime from "../../../utils/humanTime";
import humanDate from "./../../../utils/humanDateForamt";
// import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import { noOnlyWhitespace } from "../../../utils/validators";
import { useTopDepartment } from "../../../hooks/useTopDepartment";
import StatusChip from "../../../components/StatusChip";

const AcceptedTickets = ({ title, departmentId }) => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [esCalateModal, setEscalateModal] = useState(false);
  const [esCalatedTicket, setEscalatedTicket] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const topManagementDepartment = "67b2cf85b9b6ed5cedeb9a2e";
  const { isTop } = useTopDepartment();

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
      departmentIds: "", // string, not array
      description: "",
    },
  });

  const [closeModal, setCloseModal] = useState(false);
  const [closingTicketId, setClosingTicketId] = useState(null);

  const {
    handleSubmit: handleCloseSubmit,
    reset: resetCloseForm,
    control: closeControl,
    formState: { errors: closeErrors },
  } = useForm({
    defaultValues: {
      closingRemark: "",
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

  // const { data: departments = [], isPending: isDepartmentsPending } = useQuery({
  //   queryKey: ["departments"],
  //   queryFn: async () => {
  //     try {
  //       const response = await axios.get("api/departments/get-departments");
  //       return response.data?.selectedDepartments;
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   },
  // });

  const { data: departments = [], isPending: isDepartmentsPending } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await axios.get("api/departments/get-departments");
      return response.data; // because it's already an array
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

  const { mutate: closeTicket, isPending: isClosing } = useMutation({
    mutationKey: ["close-ticket"],
    mutationFn: async ({ ticketId, closingRemark }) => {
      const response = await axios.patch("/api/tickets/close-ticket", {
        ticketId,
        closingRemark,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Ticket closed successfully");
      queryClient.invalidateQueries({ queryKey: ["accepted-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets-data"] });
      resetCloseForm();
      setCloseModal(false);
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
        departmentIds: [ticketDetails.departmentIds],
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
  const handleCloseTicket = (ticketId) => {
    setClosingTicketId(ticketId);
    setCloseModal(true);
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
    if (!ticketDetails) return;
    escalateTicket({
      ticketId: esCalatedTicket.id,
      description: ticketDetails.description,
      departmentIds: ticketDetails.departmentIds,
    });
  };

  const recievedTicketsColumns = [
    { field: "srNo", headerName: "Sr No", width: 100 },

    { field: "raisedUser", headerName: "Raised By" },
    {
      field: "raisedToDepartment",
      headerName: "From Department",
      width: 100,
    },
    { field: "ticketTitle", headerName: "Ticket Title" },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        return <StatusChip status={params.value} />;
      },
    },
    { field: "acceptedBy", headerName: "Accepted By" },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => {
        const commonItems = [
          { label: "View", onClick: () => handleViewTicket(params.data) },
        ];

        const showOtherActions =
          !isTop || (isTop && departmentId === topManagementDepartment);

        const additionalItems = showOtherActions
          ? [
              {
                label: "Close",
                onClick: () => handleCloseTicket(params.data.id),
              },

              {
                label: "Support",
                onClick: () => handleSupportTicket(params.data.id),
              },
              {
                label: "Escalate",
                onClick: () => handleEscalateTicket(params.data),
              },
            ]
          : [];

        return (
          <div className="flex gap-2">
            <ThreeDotMenu
              rowId={params.data.id}
              menuItems={[...commonItems, ...additionalItems]}
            />
          </div>
        );
      },
    },
  ];
  console.log("rows : ", [
    ...acceptedTickets.map((ticket, index) => ({
      ...ticket,
      srNo: index + 1,
      id: ticket._id,
      raisedUser: `${ticket.raisedBy?.firstName || ""} ${
        ticket.raisedBy?.lastName || ""
      }`,

      description: ticket.description,
      raisedByDepartment:
        ticket.raisedBy?.departments?.map((dept) => dept.name) || "N/A",
      raisedToDepartment: ticket.raisedToDepartment?.name,
      ticketTitle: ticket?.ticket || "No Title",
      status: ticket.status || "Pending",
      acceptedBy: ticket?.acceptedBy
        ? `${ticket.acceptedBy.firstName} ${ticket.acceptedBy.lastName}`
        : `${
            ticket.assignees.map(
              (item) => `${item.firstName} ${item.lastName}`
            )[0]
          }`,
      assignees: `${ticket.assignees.map((item) => item.firstName)[0]}`,
      acceptedAt: ticket.acceptedAt ? humanTime(ticket.acceptedAt) : "-",
      priority: ticket.priority,
      image: ticket.image ? ticket.image.url : null,
    })),
  ]);

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
            search
            // hideFilter
            data={[
              ...acceptedTickets.map((ticket, index) => ({
                ...ticket,
                srNo: index + 1,
                id: ticket._id,
                raisedUser: `${ticket.raisedBy?.firstName || ""} ${
                  ticket.raisedBy?.lastName || ""
                }`,

                description: ticket.description,
                raisedByDepartment:
                  ticket.raisedBy?.departments?.map((dept) => dept.name) ||
                  "N/A",
                raisedToDepartment: ticket.raisedBy?.departments?.map(
                  (item) => item.name || "N/A"
                ),
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
        title={"Support Ticket"}
      >
        <form
          onSubmit={handleSupportTicketSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <Controller
            name="reason"
            control={supportTicketControl}
            rules={{
              required: "Reason is required",
              // validate: { noOnlyWhitespace, isAlphanumeric },
              validate: { noOnlyWhitespace },
            }}
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

      <MuiModal
        open={esCalateModal}
        onClose={() => setEscalateModal(false)}
        title={"Escalate Ticket"}
      >
        <div>
          <form
            onSubmit={handleEscalateTicketSubmit(onEscalate)}
            className="grid grid-cols-1 gap-4"
          >
            <Controller
              name="departmentIds"
              control={escalateFormControl}
              rules={{ required: "Department is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  label="Select Department"
                  value={field.value || ""} // safeguard
                >
                  <MenuItem value="" disabled>
                    Select a Department
                  </MenuItem>

                  {departments.map((item) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
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
        title="View Accepted Ticket"
      >
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
              detail={selectedTicket.raisedUser}
            />
            <DetalisFormatted
              title="Raised At"
              detail={humanDate(selectedTicket.createdAt)}
            />
            <DetalisFormatted
              title="From Department"
              // detail={
              //   Array.isArray(selectedTicket.selectedDepartment)
              //     ? selectedTicket.selectedDepartment.join(", ")
              //     : selectedTicket.selectedDepartment
              // }
              detail={selectedTicket?.raisedByDepartment}
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

      <MuiModal
        open={closeModal}
        onClose={() => setCloseModal(false)}
        title={"Close Ticket"}
      >
        <form
          onSubmit={handleCloseSubmit((data) =>
            closeTicket({
              ticketId: closingTicketId,
              closingRemark: data.closingRemark,
            })
          )}
          className="grid grid-cols-1 gap-4"
        >
          <Controller
            name="closingRemark"
            control={closeControl}
            rules={{ required: "Closing remark is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label={"Closing Remark"}
                fullWidth
                multiline
                rows={4}
                size="small"
                error={!!closeErrors.closingRemark}
                helperText={closeErrors.closingRemark?.message}
              />
            )}
          />

          <PrimaryButton
            title={"Close Ticket"}
            isLoading={isClosing}
            disabled={isClosing}
            type="submit"
          />
        </form>
      </MuiModal>
    </div>
  );
};

export default AcceptedTickets;
