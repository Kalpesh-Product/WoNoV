import { useState } from "react";
import AgTable from "../../../components/AgTable";
import MuiModal from "../../../components/MuiModal";
import {
  Autocomplete,
  Chip,
  CircularProgress,
  MenuItem,
  TextField,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import { queryClient } from "../../../main";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import PrimaryButton from "../../../components/PrimaryButton";
import { IoMdClose } from "react-icons/io";
import DetalisFormatted from "../../../components/DetalisFormatted";
import humanDate from "../../../utils/humanDateForamt";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import { useTopDepartment } from "../../../hooks/useTopDepartment";
import { DateEnv } from "@fullcalendar/core/internal";
import useAuth from "../../../hooks/useAuth";
import formatDateTime from "../../../utils/formatDateTime";
import { MdOutlineRemoveRedEye } from "react-icons/md";

const AssignedTickets = ({ title, departmentId }) => {
  const { auth } = useAuth();
  const [openModal, setopenModal] = useState(false);
  const [esCalateModal, setEscalateModal] = useState(false);
  const [esCalatedTicket, setEscalatedTicket] = useState(null);
  const [openSupportModal, setOpenSupportModal] = useState(false);
  const axios = useAxiosPrivate();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  // const topManagementDepartment = "67b2cf85b9b6ed5cedeb9a2e";
  const { isTop } = useTopDepartment();

  // Fetch Supported Tickets
  const { data: supportedTickets = [], isLoading } = useQuery({
    queryKey: ["assigned-tickets"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tickets/ticket-filter/assign/${departmentId}`,
        );

        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
  });

  const handleOpenAssignModal = (ticketId) => {
    setSelectedTicketId(ticketId);
    setopenModal(true);
  };

  const handleSupportTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setOpenSupportModal(true);
  };

  const [closeModal, setCloseModal] = useState(false);
  const [closingTicketId, setClosingTicketId] = useState(null);

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
      // selectedDepartment: Array.isArray(ticket.raisedBy?.departments)
      //   ? ticket.raisedBy.departments.map((d) => d.name)
      //   : ["N/A"],
    });
    setOpenView(true);
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

  // Transform Tickets Data
  const transformTicketsData = (tickets) => {
    return !tickets.length
      ? []
      : tickets.map((ticket, index) => {
          const mostRecentAssignment = Array.isArray(ticket.assignedTo)
            ? ticket.assignedTo[ticket.assignedTo.length - 1]
            : null;
          const mostRecentAssigneeName =
            mostRecentAssignment?.assignee?.firstName &&
            mostRecentAssignment?.assignee?.lastName
              ? `${mostRecentAssignment.assignee.firstName} ${mostRecentAssignment.assignee.lastName}`
              : ticket.assignees?.length
                ? `${ticket.assignees[ticket.assignees.length - 1]?.firstName || ""} ${ticket.assignees[ticket.assignees.length - 1]?.lastName || ""}`.trim() ||
                  "N/A"
                : "N/A";

          const supportTicket = {
            id: ticket._id,
            srno: index + 1,
            description: ticket.description,
            raisedBy:
              ticket.raisedBy?.firstName && ticket.raisedBy?.lastName
                ? `${ticket.raisedBy.firstName} ${ticket.raisedBy.lastName}`
                : "Unknown",
            recentAssignee: mostRecentAssigneeName,
            raisedAt: ticket.createdAt,
            raisedToDepartment: ticket.raisedToDepartment.name,
            selectedDepartment:
              Array.isArray(ticket.raisedBy?.departments) &&
              ticket.raisedBy.departments.length > 0
                ? ticket.raisedBy.departments.map((dept) => dept.name)
                : ["N/A"],
            priority: ticket.priority,
            ticketTitle: ticket.ticket || "No Title",
            ...(() => {
              const { assignedToDisplay, assignmentDetails } =
                formatAssignments(ticket.assignedTo);
              return {
                assignees: assignedToDisplay || "N/A",
                assignedToDetails: assignmentDetails,
              };
            })(),
            assignees:
              ticket.assignees.length > 0
                ? `${ticket.assignees.map(
                    (item) => `${item.firstName} ${item.lastName}`,
                  )}`
                : "N/A",
            tickets:
              ticket.assignees.length > 0
                ? "Assigned Ticket"
                : ticket.ticket?.acceptedBy
                  ? "Accepted Ticket"
                  : "N/A",
            assignedAt: ticket.assignedAt || "N/A",
            status: ticket.status || "Pending",
          };

          return supportTicket;
        });
  };

  const recievedTicketsColumns = [
    { field: "srno", headerName: "Sr No" },
    { field: "ticketTitle", headerName: "Ticket Title" },
    {
      field: "selectedDepartment",
      headerName: "From Department",
    },
    { field: "raisedBy", headerName: "Raised By" },
    { field: "recentAssignee", headerName: "Asignees" },
    // { field: "assignees", headerName: "Assigned To", width: 300 },
    // {
    //   field: "tickets",
    //   headerName: "Tickets",
    //   cellRenderer: (params) => {
    //     const statusColorMap = {
    //       "Assigned Ticket": { backgroundColor: "#ffbac2", color: "#ed0520" }, // Light orange bg, dark orange font
    //       "Accepted Ticket": { backgroundColor: "#90EE90", color: "#02730a" }, // Light green bg, dark green font
    //     };

    //     const { backgroundColor, color } = statusColorMap[params.value] || {
    //       backgroundColor: "gray",
    //       color: "white",
    //     };
    //     return (
    //       <div className="flex flex-col gap-1 p-2">
    //         <Chip
    //           label={params.value}
    //           style={{
    //             backgroundColor,
    //             color,
    //           }}
    //         />
    //         <span className="text-small text-borderGray text-center h-full">
    //           {params.data?.acceptedBy}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   field: "status",
    //   headerName: "Status",
    //   cellRenderer: (params) => {
    //     const statusColorMap = {
    //       Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
    //       "In Progress": { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
    //       Closed: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
    //       Open: { backgroundColor: "#E6E6FA", color: "#4B0082" }, // Light purple bg, dark purple font
    //       Completed: { backgroundColor: "#D3D3D3", color: "#696969" }, // Light gray bg, dark gray font
    //     };

    //     const { backgroundColor, color } = statusColorMap[params.value] || {
    //       backgroundColor: "gray",
    //       color: "white",
    //     };
    //     return (
    //       <div className="flex flex-col justify-center pt-4">
    //         <Chip
    //           label={params.value}
    //           style={{
    //             backgroundColor,
    //             color,
    //           }}
    //         />
    //       </div>
    //     );
    //   },
    // },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          "In Progress": { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Closed: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          Open: { backgroundColor: "#E6E6FA", color: "#4B0082" }, // Light purple bg, dark purple font
          Completed: { backgroundColor: "#D3D3D3", color: "#696969" }, // Light gray bg, dark gray font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => {
        // const commonItems = [
        //   {
        //     label: "View",
        //     onClick: () => handleViewTicket(params.data),
        //   },
        // ];

        const roleTitle = auth?.user?.role?.[0]?.roleTitle || "";
        const canReassignTicket = isTop;
        const canEscalateTicket = roleTitle.endsWith("Admin") || isTop;

        const conditionalItems = [
          ...(canReassignTicket
            ? [
                {
                  label: "Re-Assign",
                  onClick: () => handleOpenAssignModal(params.data.id),
                },
              ]
            : []),
          ...(canEscalateTicket
            ? [
                {
                  label: "Escalate",
                  onClick: () => handleEscalateTicket(params.data),
                },
              ]
            : []),
          {
            label: "Support",
            onClick: () => handleSupportTicket(params.data.id),
          },

          {
            label: "Close",
            onClick: () => handleCloseTicket(params.data.id),
          },
        ];

        return (
          <div className="flex items-center gap-2">
            <div
              role="button"
              onClick={() => handleViewTicket(params.data)}
              className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
            >
              <MdOutlineRemoveRedEye />
            </div>
            <ThreeDotMenu rowId={params.data.id} menuItems={conditionalItems} />
          </div>
        );
      },
    },
  ];

  const rows = isLoading ? [] : transformTicketsData(supportedTickets);

  const { mutate: closeTicket, isPending: isClosingTicket } = useMutation({
    mutationKey: ["close-ticket"],
    mutationFn: async ({ ticketId, closingRemark }) => {
      const response = await axios.patch("/api/tickets/close-ticket", {
        ticketId,
        closingRemark,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["assigned-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets-data"] });
      resetCloseForm();
      setCloseModal(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to close ticket");
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
      queryClient.invalidateQueries({ queryKey: ["assigned-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets-data"] });
      resetSupportTicketForm();
      setOpenSupportModal(false);
    },
    onError: function (error) {
      toast.error(
        error.response?.data?.message || "Failed to create support ticket",
      );
    },
  });

  const fetchSubOrdinates = async () => {
    try {
      const response = await axios.get(
        `/api/users/assignees?deptId=${departmentId}`,
      );

      return response.data;
    } catch (error) {
      toast.error(error.message || "Failed to fetch users");
    }
  };

  const { data: subOrdinates = [], isPending: isSubOrdinates } = useQuery({
    queryKey: ["sub-ordinates"],
    queryFn: fetchSubOrdinates,
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      selectedEmployees: {},
    },
  });
  const { mutate: assignMutate } = useMutation({
    mutationKey: ["assign-ticket"],
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/tickets/assign-ticket/${data.ticketId}`,
        {
          assignees: data.assignedEmployees,
        },
      );

      return response.data.message;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["supported-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets-data"] });
      toast.success(data);
      setopenModal(false); // Close modal on success
      reset(); // Reset form after submission
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const onSubmit = (formData) => {
    const assignedEmployeeIds = Object.keys(formData.selectedEmployees).filter(
      (id) => formData.selectedEmployees[id],
    ); // ✅ Keep only selected IDs

    if (assignedEmployeeIds.length === 0) {
      toast.error("Please select at least one employee.");
      return;
    }

    assignMutate({
      ticketId: selectedTicketId,
      assignedEmployees: assignedEmployeeIds,
    }); // ✅ Send array of IDs
  };

  const onSupportSubmit = (data) => {
    if (!selectedTicketId) return;
    getSupport({ ticketId: selectedTicketId, reason: data.reason });
  };

  const { data: departments = [], isPending: isDepartmentsPending } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "api/company/get-company-data?field=selectedDepartments",
        );
        return response.data?.selectedDepartments;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
  });

  const {
    handleSubmit: handleEscalateTicketSubmit,
    reset: resetEscalateForm,
    control: escalateFormControl,
    formState: { errors: escalateTicketErrors },
  } = useForm({
    defaultValues: {
      departmentIds: "",
      description: "",
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
      queryClient.invalidateQueries({ queryKey: ["supported-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets-data"] });
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Failed to escalate ticket");
    },
  });

  const onEscalate = (ticketDetails) => {
    if (!ticketDetails) return;
    escalateTicket({
      ticketId: esCalatedTicket.id,
      description: ticketDetails.description,
      departmentIds: ticketDetails.departmentIds,
    });
  };

  const handleEscalateTicket = (ticketDetails) => {
    setEscalateModal(true);
    setEscalatedTicket(ticketDetails);
  };

  const handleCloseTicket = (ticketId) => {
    setClosingTicketId(ticketId);
    setCloseModal(true);
  };

  return (
    <div className="p-4 border-default border-borderGray rounded-md">
      <div className="pb-4">
        <span className="text-subtitle">{title}</span>
      </div>
      <div className="w-full">
        {!isClosingTicket ? (
          <AgTable
            key={rows.length}
            data={rows}
            columns={recievedTicketsColumns}
            search
          />
        ) : (
          <>
            <CircularProgress color="#1E3D73" />
          </>
        )}
      </div>
      <MuiModal
        open={openModal}
        onClose={() => setopenModal(false)}
        title="Assign Tickets"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ul>
            {!isSubOrdinates ? (
              subOrdinates.map((employee) => (
                <div key={employee.id} className="flex flex-row gap-6">
                  <Controller
                    name={`selectedEmployees.${employee.id}`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        {...field}
                        checked={!!field.value}
                      />
                    )}
                  />
                  <li>{employee.name}</li>
                </div>
              ))
            ) : (
              <CircularProgress color="#1E3D73" />
            )}
          </ul>

          <div className="flex items-center justify-center mb-4">
            <PrimaryButton title="Assign" type="submit" />
          </div>
        </form>
      </MuiModal>

      <MuiModal
        open={openSupportModal}
        onClose={() => setOpenSupportModal(false)}
        title={"Support Ticket"}
      >
        <form
          onSubmit={handleSupportTicketSubmit(onSupportSubmit)}
          className="flex flex-col gap-4"
        >
          <Controller
            name="reason"
            control={supportTicketControl}
            rules={{
              required: "Reason is required",
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

      <MuiModal open={esCalateModal} onClose={() => setEscalateModal(false)}>
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
                        field.onChange(
                          newValue.map((dept) => dept.department._id),
                        )
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
                          helperText={
                            escalateTicketErrors.departmentIds?.message
                          }
                        />
                      )}
                    />
                  )}
                />
              )}
            />
            <Controller
              name="description"
              control={escalateFormControl}
              rules={{
                required: "Escalation description is required",
                validate: { noOnlyWhitespace, isAlphanumeric },
              }}
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
        title="View Assigned Ticket"
      >
        {selectedTicket && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted
              title="Ticket Title"
              detail={selectedTicket.ticketTitle || "N/A"}
            />
            <DetalisFormatted
              title="Description"
              detail={selectedTicket.description || "N/A"}
            />
            <DetalisFormatted
              title="From Department"
              detail={
                selectedTicket.selectedDepartment
                  .map((item) => item)
                  .join(", ") || "N/A"
              }
            />
            <DetalisFormatted
              title="Raised By"
              detail={selectedTicket.raisedBy || "Unknown"}
            />
            <DetalisFormatted
              title="Raised At"
              detail={formatDateTime(selectedTicket.raisedAt)}
            />
            <DetalisFormatted
              title="Raised To Department"
              detail={selectedTicket.raisedToDepartment || "N/A"}
            />
            {selectedTicket?.assignedToDetails?.length ? (
              <div className="text-content flex items-start w-full">
                <span className="w-[50%]">Assignees</span>
                <span>:</span>
                <div className="text-content flex flex-col gap-2 items-start w-full justify-start pl-4">
                  {selectedTicket.assignedToDetails.map((assignment, index) => (
                    <div key={`${assignment.assigneeName}-${index}`}>
                      <div className="font-medium">
                        {assignment.assigneeName}
                      </div>
                      <div className="text-borderGray">
                        {assignment.assignedAtFormatted || "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <DetalisFormatted
                title="Assignees"
                detail={selectedTicket?.assignees || "N/A"}
              />
            )}
            <DetalisFormatted
              title="Priority"
              detail={selectedTicket?.priority || "N/A"}
            />
            <DetalisFormatted title="Status" detail={selectedTicket.status} />
          </div>
        )}
      </MuiModal>

      <MuiModal
        open={closeModal}
        onClose={() => setCloseModal(false)}
        title="Close Ticket"
      >
        <form
          onSubmit={handleCloseSubmit((data) =>
            closeTicket({
              ticketId: closingTicketId,
              closingRemark: data.closingRemark,
            }),
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
                label="Closing Remark"
                fullWidth
                size="small"
                multiline
                rows={4}
                error={!!closeErrors.closingRemark}
                helperText={closeErrors.closingRemark?.message}
              />
            )}
          />

          <PrimaryButton
            title="Close Ticket"
            isLoading={isClosingTicket}
            disabled={isClosingTicket}
            type="submit"
          />
        </form>
      </MuiModal>
    </div>
  );
};

export default AssignedTickets;
