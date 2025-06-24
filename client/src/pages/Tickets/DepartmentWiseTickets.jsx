import React, { useState } from "react";
import AgTable from "../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import MuiModal from "../../components/MuiModal";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import PrimaryButton from "../../components/PrimaryButton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../../main";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import { Controller, useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import { useLocation } from "react-router-dom";

const DepartmentWiseTickets = ({ title }) => {
  const [open, setOpen] = useState(false);
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const location = useLocation();
  const departmentTickets = location.state?.departmentTickets;

  // Add this dummy data variable above your component
  const dummyTicketsData = [
    {
      _id: "1",
      raisedBy: { firstName: "Utkarsha Palkar", departments: [{ name: "HR" }] },
      ticket: "Printer is not working",
      status: "Closed",
    },
    {
      _id: "2",
      raisedBy: {
        firstName: "Narshiva Naik",
        departments: [{ name: "Finance" }],
      },
      ticket: "Wifi is too slow",
      status: "Pending",
    },
    {
      _id: "3",
      raisedBy: {
        firstName: "Faizan Shaikh",
        departments: [{ name: "IT" }],
      },
      ticket: "Website cannot be viewed",
      status: "Pending",
    },
    {
      _id: "4",
      raisedBy: {
        firstName: "Aiwinraj KS",
        departments: [{ name: "Tech" }],
      },
      ticket: "Wifi is too slow",
      status: "Pending",
    },
    {
      _id: "5",
      raisedBy: {
        firstName: "Muskan Dodmani",
        departments: [{ name: "Tech" }],
      },
      ticket: "Leave correction required",
      status: "Closed",
    },
  ];

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/tickets/get-tickets");

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
        `/api/tickets/reject-ticket/${ticket.id}`
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
      const response = await axios.get("/api/users/assignees");

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
    return tickets.map((ticket) => ({
      id: ticket._id,
      raisedBy: ticket.raisedBy?.firstName || "Aiwinraj KS",
      fromDepartment:
        ticket.raisedBy?.departments?.map((dept) => dept.name) || "Tech",
      ticketTitle: ticket?.ticket || "Wifi is too slow",
      status: ticket.status || "Pending",
    }));
  };

  // Example usage
  // const rows = isLoading ? [] : transformTicketsData(tickets);
  // Then modify your rows assignment to use either API data or dummy data
  const rows = transformTicketsData(departmentTickets); // Always use dummy data

  const handleOpenAssignModal = (ticketId) => {
    setSelectedTicketId(ticketId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTicketId(null);
  };

  const recievedTicketsColumns = [
    { field: "raisedBy", headerName: "Raised By" },
    { field: "fromDepartment", headerName: "From Department" },
    { field: "ticketTitle", headerName: "Ticket Title", flex: 1 },

    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          "in-progress": { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
          resolved: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          open: { backgroundColor: "#E6E6FA", color: "#4B0082" }, // Light purple bg, dark purple font
          completed: { backgroundColor: "#D3D3D3", color: "#696969" }, // Light gray bg, dark gray font
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
      cellRenderer: (params) => (
        <>
          <ThreeDotMenu
            rowId={params.data.id}
            menuItems={[
              {
                label: "Accept",
                onClick: () => acceptMutate(params.data),
                isLoading: isLoading,
              },
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
                      onClick: () => rejectMutate(params.data),
                      isLoading: isLoading,
                    },
                  ]
                : []),
            ]}
          />
        </>
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
            tableHeight={350}
            columns={recievedTicketsColumns}
          />
        )}
      </div>
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
    </div>
  );
};

export default DepartmentWiseTickets;
