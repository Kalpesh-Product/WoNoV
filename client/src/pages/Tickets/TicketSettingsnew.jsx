import React, { useEffect, useState } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { queryClient } from "../../main";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import PageFrame from "../../components/Pages/PageFrame";

const Row = ({ row, onApprove, onReject }) => {
  const [open, setOpen] = React.useState(false);
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [ticketIssues, setTicketIssues] = useState([]); // State for ticket issues

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "api/company/get-company-data?field=selectedDepartments"
      );
      return response.data?.selectedDepartments;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const { data: fetchedDepartments = [], isPending: departmentLoading } =
    useQuery({
      queryKey: ["fetchedDepartments"],
      queryFn: fetchDepartments,
    });

  useEffect(() => {
    if (!fetchedDepartments.length || !auth.user?.departments?.length) return;

    const selectedDept = fetchedDepartments.find(
      (dept) => dept.department._id === auth.user.departments[0]._id
    );

    setTicketIssues(selectedDept?.ticketIssues || []);
  }, [fetchedDepartments, auth.user.departments]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ticketTitle: "",
      priority: "",
      resolveTime: 0,
    },
  });

  const statusColorMap = {
    "In Progress": { backgroundColor: "#FFECC5", color: "#CC8400" },
    Closed: { backgroundColor: "#90EE90", color: "#02730a" },
    Pending: { backgroundColor: "#FFE0DC", color: "#C2410C" },
    Escalated: { backgroundColor: "#E6E6FA", color: "#4B0082" },
  };

  const statusStyle = statusColorMap[row.status] || {
    backgroundColor: "gray",
    color: "white",
  };

  const onSubmit = (data) => {
    onApprove({
      ...data,
      title: row.ticket,
      ticketId: row._id,
      department: row.department,
      priority: data.priority,
      resolveTime: data.resolveTime,
    });
    reset();
  };

  const handleReject = () => {
    onReject({
      title: row.ticket,
      department: row.department,
      ticketId: row._id,
    });
  };

  return (
    <>
      <TableRow>
        <TableCell align="center">{row.srNo}</TableCell>
        <TableCell align="center">{`${row.raisedBy.firstName} ${row.raisedBy.lastName}`}</TableCell>
        <TableCell align="center">
          {row.raisedBy.departments.map((dept) => dept.name).join(", ")}
        </TableCell>
        <TableCell align="center">{row.ticket}</TableCell>

        {/* ✅ Add this line to display description */}
        <TableCell align="center">{row.description}</TableCell>

        <TableCell align="center">
          <Chip label={row.status} style={statusStyle} />
        </TableCell>
        <TableCell align="left">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {<IoIosArrowDown />}
          </IconButton>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={6} style={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, width: "100%" }}>
              <div className="flex items-center gap-4 mt-2">
                {/* <select className="border px-2 py-1 rounded text-sm">
                  <option>Priority</option>
                </select> */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex items-center gap-4 mt-2 w-3/4">
                  <Controller
                    name="ticketTitle"
                    control={control}
                    render={({ field }) => (
                      <>
                        <TextField
                          {...field}
                          size="small"
                          select
                          label="Issue"
                          fullWidth
                          helperText={errors.ticketTitle?.message}
                          error={!!errors.ticketTitle}>
                          <MenuItem value="" disabled>
                            Select Ticket Title
                          </MenuItem>
                          {ticketIssues.length > 0 ? (
                            ticketIssues
                              .filter((issue) => issue.title !== "Other")
                              .map((issue) => (
                                <MenuItem key={issue._id} value={issue._id}>
                                  {issue.title}
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled>No Issues Available</MenuItem>
                          )}
                        </TextField>
                      </>
                    )}
                  />
                  <PrimaryButton title={"Submit"} type={"submit"} />

                  {/* <SecondaryButton />
                  <button
                    type="button"
                    onClick={handleReject}
                    className="bg-red-300 text-white px-4 py-1 rounded hover:bg-red-400 text-sm"
                  >
                    REJECT
                  </button> */}
                </form>
              </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const TicketSettingsNew = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [department, setDepartment] = useState(auth.user.departments[0]._id);

  const { data: ticketsData = [], ticketsDataIsLoading } = useQuery({
    queryKey: ["other-tickets"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tickets/other-tickets/${department}`
        );

        return response.data;
      } catch (error) {
        console.error("Error fetching tickets:", error);
        throw new Error("Failed to fetch tickets");
      }
    },
  });

  const approveTicketMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axios.patch(`/api/tickets/update-ticket`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ticket approved successfully");
      queryClient.invalidateQueries({ queryKey: ["other-tickets"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to approve ticket");
    },
  });

  const rejectTicketMutation = useMutation({
    mutationFn: async (ticketId) => {
      const res = await axios.delete(
        `/api/tickets/reject-ticket-issue/${ticketId}`
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ticket rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["other-tickets"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to reject ticket");
    },
  });
  const headerCellStyle = {
    backgroundColor: "#f4f4f4",
    fontWeight: "bold",
    borderBottom: "2px solid #ddd",
    color: "#333",
    fontSize: "14px",
    letterSpacing: "0.5px",
    padding: "10px",
  };

  return (
    <div className="p-4">
      <PageFrame>
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={headerCellStyle}>
                  Sr No
                </TableCell>
                <TableCell align="center" sx={headerCellStyle}>
                  Raised By
                </TableCell>
                <TableCell align="center" sx={headerCellStyle}>
                  From Department
                </TableCell>
                <TableCell align="center" sx={headerCellStyle}>
                  Ticket Title
                </TableCell>
                <TableCell align="center" sx={headerCellStyle}>
                  Ticket Description
                </TableCell>
                <TableCell align="center" sx={headerCellStyle}>
                  Status
                </TableCell>
                <TableCell align="left" sx={headerCellStyle}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ticketsData.map((row, index) => (
                <Row
                  key={index}
                  row={{
                    ...row,
                    srNo: index + 1,
                    department,
                    description: row.description,
                  }}
                  onApprove={approveTicketMutation.mutate}
                  onReject={rejectTicketMutation.mutate}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </PageFrame>
    </div>
  );
};

export default TicketSettingsNew;
