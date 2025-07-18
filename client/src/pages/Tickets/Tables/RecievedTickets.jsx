import React, { useState } from "react";
import AgTable from "../../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import MuiModal from "../../../components/MuiModal";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import PrimaryButton from "../../../components/PrimaryButton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../main";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import { Controller, useForm } from "react-hook-form";
import useAuth from "../../../hooks/useAuth";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../components/DetalisFormatted";
import humanDate from "../../../utils/humanDateForamt";
import { useTopDepartment } from "../../../hooks/useTopDepartment";
import StatusChip from "../../../components/StatusChip";

const RecievedTickets = ({ title, departmentId }) => {
  const [open, setOpen] = useState(false);
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openView, setOpenView] = useState();
  const topManagementDepartment = "67b2cf85b9b6ed5cedeb9a2e";
  const { isTop } = useTopDepartment();

  const handleRejectClick = (ticket) => {
    setSelectedTicket(ticket);
    setRejectModalOpen(true);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setOpenView(true);
  };

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tickets/get-tickets/${departmentId}`
        );

        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { mutate: acceptMutate } = useMutation({
    mutationKey: ["accept-ticket"],
    mutationFn: async (ticket) => {
      const response = await axios.patch(
        `/api/tickets/accept-ticket/${ticket.id}`
      );

      return response.data.message;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["tickets-data"] });
      toast.success(data);
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });
  const { mutate: rejectMutate, isPending: rejectPending } = useMutation({
    mutationKey: ["reject-ticket"],
    mutationFn: async (ticket) => {
      const response = await axios.patch(
        `/api/tickets/reject-ticket/${ticket.id}`,
        { reason: ticket.specifiedReason }
      );

      return response.data.message;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });

      toast.success(data);
    },
    onError: (error) => {
      toast.error(error.response.data.message);
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
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(data);
      handleClose(); // Close modal on success
      reset(); // Reset form after submission
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
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

  const transformTicketsData = (tickets) => {
    if (!tickets.length) {
      return [];
    }
    return tickets.map((ticket, index) => ({
      srNo: index + 1,
      id: ticket._id,
      raisedBy: ticket.raisedBy?.firstName || "Unknown",
      description: ticket.description,
      fromDepartment:
        ticket.raisedBy?.departments?.map((dept) => dept.name) || "N/A",
      ticketTitle: ticket?.ticket || "No Title",
      raisedToDepartment: ticket.raisedToDepartment?.name || "N/A",
      status: ticket.status || "Pending",
      raisedDate: ticket.createdAt,
      priority: ticket.priority || "Low",
      image: ticket.image?.url,
    }));
  };
  

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please specify a rejection reason.");
      return;
    }

    rejectMutate(
      {
        id: selectedTicket.id,
        specifiedReason: rejectionReason,
      },
      {
        onSuccess: () => {
          setRejectModalOpen(false);
          setRejectionReason("");
          setSelectedTicket(null);
        },
      }
    );
  };

  // Example usage
  const rows = isLoading ? [] : transformTicketsData(tickets);


  const handleOpenAssignModal = (ticketId) => {
    setSelectedTicketId(ticketId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTicketId(null);
  };

  const recievedTicketsColumns = [
    { field: "srNo", headerName: "Sr No" },
    { field: "raisedBy", headerName: "Raised By" },
    { field: "fromDepartment", headerName: "From Department" },
    { field: "ticketTitle", headerName: "Ticket Title", flex: 1 },

    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        return (
          <>
            <StatusChip status={params.value} />
          </>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <div className="flex items-center gap-2">
          <div
            role="button"
            onClick={() => handleViewTicket(params.data)}
            className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
          >
            <MdOutlineRemoveRedEye />
          </div>
          {(!isTop || (isTop && departmentId === topManagementDepartment)) && (
            <ThreeDotMenu
              rowId={params.data.id}
              menuItems={[
                // Conditionally add "Accept"
                ...(auth.user.role.length > 0 &&
                // Case 1: If user is in Top Management & ticket is for Top Management
                ((auth.user.role[0].roleTitle === "Top Management" &&
                  params.data.raisedToDepartment === "Top Management") ||
                  // Case 2: If user is not Top Management
                  auth.user.role[0].roleTitle !== "Top Management")
                  ? [
                      {
                        label: "Accept",
                        onClick: () => acceptMutate(params.data),
                        isLoading: isLoading,
                      },
                    ]
                  : []),

                // {
                //   label: "Accept",
                //   onClick: () => acceptMutate(params.data),
                //   isLoading: isLoading,
                // },
                // Conditionally add "Assign"
                ...(auth.user.role.length > 0 &&
                (auth.user.role[0].roleTitle === "Master Admin" ||
                  auth.user.role[0].roleTitle === "Super Admin" ||
                  auth.user.role[0].roleTitle.endsWith("Admin"))
                  ? [
                      {
                        label: "Assign",
                        onClick: () => handleOpenAssignModal(params.data.id),
                      },
                      {
                        label: "Reject",
                        onClick: () => handleRejectClick(params.data), // ✅ open modal
                      },
                    ]
                  : []),
              ]}
            />
          )}
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
            data={rows ? rows : []}
            // hideFilter
            tableHeight={350}
            columns={recievedTicketsColumns}
            search
          />
        )}
      </div>
      <MuiModal
        open={openView}
        onClose={() => setOpenView(false)}
        title={"View Ticket"}
      >
        {selectedTicket && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <DetalisFormatted
              title="Ticket"
              detail={selectedTicket.ticketTitle}
            />
            <DetalisFormatted
              title="Description"
              detail={selectedTicket.description}
            />
            <DetalisFormatted
              title="Raised By"
              detail={`${selectedTicket.raisedBy}`}
            />
            <DetalisFormatted
              title="Raised At"
              detail={humanDate(new Date(selectedTicket.raisedDate))}
            />
            <DetalisFormatted
              title="From Department"
              detail={selectedTicket.fromDepartment || "N/A"}
            />
            <DetalisFormatted
              title="Raised To Department"
              detail={selectedTicket.raisedToDepartment || "N/A"}
            />
            <DetalisFormatted title="Status" detail={selectedTicket.status} />
            <DetalisFormatted
              title="Priority"
              detail={selectedTicket.priority}
            />

            {selectedTicket.image && (
              <div className="lg:col-span-2">
                <img
                  src={selectedTicket.image}
                  alt="Ticket Attachment"
                  className="max-w-full max-h-96 rounded border"
                />
              </div>
            )}
          </div>
        )}
      </MuiModal>

      <MuiModal open={open} onClose={handleClose} title="Assign Tickets">
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
        open={rejectModalOpen}
        setOpen={setRejectModalOpen}
        title="Reject Ticket"
        onClose={() => setRejectModalOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <textarea
            placeholder="Please mention the reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full p-2 border rounded resize-none min-h-[100px]"
          />
          <button
            disabled={!rejectionReason.trim() || rejectPending}
            onClick={handleRejectSubmit}
            className={`${
              !rejectionReason.trim() || rejectPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            } text-white px-4 py-2 rounded transition`}
          >
            {rejectPending ? "Submitting..." : "Submit Rejection"}
          </button>
        </div>
      </MuiModal>
    </div>
  );
};

export default RecievedTickets;
