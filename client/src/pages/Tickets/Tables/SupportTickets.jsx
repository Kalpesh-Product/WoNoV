import { useEffect, useState } from "react";
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

import humanDate from "./../../../utils/humanDateForamt";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import { useTopDepartment } from "../../../hooks/useTopDepartment";

const SupportTickets = ({ title, departmentId }) => {
  const [openModal, setopenModal] = useState(false);
  const [esCalateModal, setEscalateModal] = useState(false);
  const [esCalatedTicket, setEscalatedTicket] = useState(null);
  const axios = useAxiosPrivate();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const topManagementDepartment = "67b2cf85b9b6ed5cedeb9a2e";
  const { isTop } = useTopDepartment();

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

  // Fetch Supported Tickets
  const { data: supportedTickets = [], isLoading } = useQuery({
    queryKey: ["supported-tickets"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tickets/ticket-filter/support/${departmentId}`
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

  const handleViewTicket = (ticket) => {
    const raw = ticket || {};
    setSelectedTicket(ticket);
    setOpenView(true);
  };

  const handleCloseTicket = (ticketId) => {
    setClosingTicketId(ticketId);
    setCloseModal(true);
  };

  // Transform Tickets Data
  const transformTicketsData = (tickets) => {
    return !tickets.length
      ? []
      : tickets.map((ticket, index) => {
          const supportTicket = {
            ...ticket,
            id: ticket.ticket?._id,
            srno: index + 1,
            raisedBy:
              ticket.ticket?.raisedBy?.firstName &&
              ticket.ticket?.raisedBy?.lastName
                ? `${ticket.ticket?.raisedBy?.firstName} ${ticket.ticket?.raisedBy?.lastName}`
                : "Unknown",

            priority: ticket.priority,
            selectedDepartment:
              Array.isArray(ticket.ticket.raisedBy?.departments) &&
              ticket.ticket.raisedBy.departments.length > 0
                ? ticket.ticket.raisedBy.departments.map((dept) => dept.name)
                : ["N/A"],

            ticketTitle: ticket.reason || "No Title",
            acceptedBy: `${ticket.ticket?.acceptedBy?.firstName ?? ""} ${
              ticket.ticket.acceptedBy?.lastName ?? ""
            }`,
            acceptedAt: ticket.ticket.acceptedAt,
            tickets:
              ticket.ticket?.assignees.length > 0
                ? "Assigned Ticket"
                : ticket.ticket?.acceptedBy
                ? "Accepted Ticket"
                : "N/A",
            raisedDate: ticket.createdAt || "N/A",
            status: ticket.ticket.status || "Pending",
            raisedToDepartment:
              ticket.ticket?.raisedToDepartment?.name || "N/A",
          };

          return supportTicket;
        });
  };

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
      resetCloseForm();
      setCloseModal(false);
      queryClient.invalidateQueries({ queryKey: ["supported-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets-data"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to close ticket");
    },
  });

  const fetchSubOrdinates = async () => {
    try {
      const response = await axios.get(
        `/api/users/assignees?deptId=${departmentId}`
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
        }
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
      (id) => formData.selectedEmployees[id]
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
  const { data: departments = [], isPending: isDepartmentsPending } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      try {
        const response = await axios.get("api/departments/get-departments");
        return response.data;
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

  const recievedTicketsColumns = [
    { field: "srno", headerName: "Sr No" },
    { field: "raisedBy", headerName: "Raised By" },
    {
      field: "selectedDepartment",
      headerName: "From Department",
      width: 100,
    },
    { field: "ticketTitle", headerName: "Ticket Title", width: 250 },
    {
      field: "tickets",
      headerName: "Ticket Type",
      cellRenderer: (params) => {
        const statusColorMap = {
          "Assigned Ticket": { backgroundColor: "#ffbac2", color: "#ed0520" }, // Light orange bg, dark orange font
          "Accepted Ticket": { backgroundColor: "#90EE90", color: "#02730a" }, // Light green bg, dark green font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <div className="flex flex-col gap-1 p-4">
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
            <span className="text-small text-borderGray text-center h-full">
              {params.data.acceptedBy}
            </span>
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          "In Progress": { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
          Closed: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          Open: { backgroundColor: "#E6E6FA", color: "#4B0082" }, // Light purple bg, dark purple font
          Completed: { backgroundColor: "#D3D3D3", color: "#696969" }, // Light gray bg, dark gray font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <div className="flex flex-col justify-center p-4">
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => {
        const commonItems = [
          {
            label: "View",
            onClick: () => handleViewTicket(params.data),
          },
        ];

        const showOtherActions =
          !isTop || (isTop && departmentId === topManagementDepartment);

        const conditionalItems = showOtherActions
          ? [
              {
                label: "Close",
                onClick: () => handleCloseTicket(params.data.id),
              },

              {
                label: "Re-Assign",
                onClick: () => handleOpenAssignModal(params.data.id),
              },
              {
                label: "Escalate",
                onClick: () => handleEscalateTicket(params.data),
              },
            ]
          : [];

        return (
          <ThreeDotMenu
            rowId={params.data.id}
            menuItems={[...commonItems, ...conditionalItems]}
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
                      getOptionLabel={(dept) => `${dept.name}`}
                      onChange={(_, newValue) =>
                        field.onChange(newValue.map((dept) => dept._id))
                      }
                      renderTags={(selected, getTagProps) =>
                        selected.map((dept, index) => (
                          <Chip
                            key={dept._id}
                            label={`${dept.name}`}
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
        title="View Support Ticket"
      >
        {selectedTicket && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted
              title="Ticket"
              detail={selectedTicket?.ticket?.ticket || "N/A"}
            />
            <DetalisFormatted
              title="Description"
              detail={selectedTicket?.ticket?.description || "N/A"}
            />
            <DetalisFormatted
              title="Raised By"
              detail={selectedTicket.raisedBy || "Unknown"}
            />
            <DetalisFormatted
              title="Raised At"
              detail={humanDate(selectedTicket.raisedDate)}
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
              title="Raised To Department"
              detail={selectedTicket.raisedToDepartment}
            />
            <DetalisFormatted title="Status" detail={selectedTicket.status} />
            <DetalisFormatted
              title="Priority"
              detail={selectedTicket?.priority || "N/A"}
            />
            <DetalisFormatted
              title="Accepted by"
              detail={selectedTicket?.acceptedBy || "N/A"}
            />
            <DetalisFormatted
              title="Accepted at"
              detail={selectedTicket?.acceptedAt || "N/A"}
            />
            <DetalisFormatted
              title="Reason For Support"
              detail={selectedTicket?.reason || "N/A"}
            />
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

export default SupportTickets;
