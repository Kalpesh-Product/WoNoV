import React, { useState } from "react";
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

const Row = ({ row, onApprove, onReject  }) => {

  const [open, setOpen] = React.useState(false);
  const { control, handleSubmit, reset } = useForm({
      defaultValues: {
        department:"",
        priority: "",
        resolveTime:0
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
      department: row.department,
      priority:data.priority,
      resolveTime:data.resolveTime
    });
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
        <TableCell align="center">{row.raisedBy.departments.map((dept)=>dept.name).join(", ")}</TableCell>
        <TableCell align="center">{row.ticket}</TableCell>
        <TableCell align="center">
        <Chip
    label={row.status}
    style={statusStyle}
  
  />
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
            <Box sx={{ margin: 1, width:'100%' }}>
              <div className="flex items-center gap-4 mt-2">
                {/* <select className="border px-2 py-1 rounded text-sm">
                  <option>Priority</option>
                </select> */}
                 <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-4 mt-2">
                 <Controller 
                  
                            name="priority"
                            control={control}
                            render={({ field }) => (
                              <Select {...field} required displayEmpty size="small">
                                <MenuItem value="" disabled>
                                  Select Priority
                                </MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="low">Low</MenuItem>
                              </Select>
                            )}
                          />
                           <Controller
                              name="resolveTime"
                              control={control}
                              rules={{ required: "Resolve time is required" }}
                              render={({ field }) => (
                              <TextField
                              size="small"
                              {...field}
                              label="Resolve Time"
                              type="number"
                            
                            />
                            )}
                                          />
                <button type="submit" className="bg-green-400 text-white px-4 py-1 rounded hover:bg-green-500 text-sm">
                  APPROVE
                </button>
                <button type="button"
                onClick={handleReject} className="bg-red-300 text-white px-4 py-1 rounded hover:bg-red-400 text-sm">
                  REJECT
                </button>
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


  const {auth} = useAuth()
  const axios = useAxiosPrivate()
  const [department,setDepartment] = useState(auth.user.departments[0]._id)

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
      const res = await axios.patch(`/api/tickets/add-ticket-issue`, data);
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
      const res = await axios.delete(`/api/tickets/reject-ticket-issue/${ticketId}`);
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

  // const rows = [
  //   {
  //     srNo: "1",
  //     raisedBy: "Utkarsha Palkar",
  //     fromDepartment: "Maintenance",
  //     ticketTitle: "AC not working in Collosseum",
  //     status: "In Progress",
  //   },
  //   {
  //     srNo: "2",
  //     raisedBy: "Kalpesh Naik",
  //     fromDepartment: "Finance",
  //     ticketTitle: "Unable to generate monthly expense report",
  //     status: "Closed",
  //   },
  //   {
  //     srNo: "3",
  //     raisedBy: "Allan Mark Silvera",
  //     fromDepartment: "IT",
  //     ticketTitle: "System running slow after update",
  //     status: "Pending",
  //   },
  //   {
  //     srNo: "4",
  //     raisedBy: "Siddhi Naik",
  //     fromDepartment: "IT",
  //     ticketTitle: "Printer not connecting to Wi-Fi",
  //     status: "Open",
  //   },
  //   {
  //     srNo: "5",
  //     raisedBy: "Aiwinraj KS",
  //     fromDepartment: "Maintenance",
  //     ticketTitle: "Water leakage near server room",
  //     status: "In Progress",
  //   },
  //   {
  //     srNo: "6",
  //     raisedBy: "Utkarsha Palkar",
  //     fromDepartment: "Finance",
  //     ticketTitle: "Incorrect tax calculations in payroll system",
  //     status: "Pending",
  //   },
  //   {
  //     srNo: "7",
  //     raisedBy: "Hema Sawant",
  //     fromDepartment: "Tech",
  //     ticketTitle: "Server downtime experienced at 2 AM",
  //     status: "Closed",
  //   },
  //   {
  //     srNo: "8",
  //     raisedBy: "Sankalp Kalangutkar",
  //     fromDepartment: "IT",
  //     ticketTitle: "Mouse and keyboard not working",
  //     status: "Open",
  //   },
  // ];

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
                Status
              </TableCell>
              <TableCell align="left" sx={headerCellStyle}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ticketsData.map((row, index) => (
              <Row key={index} 
              row={{ ...row, srNo: index + 1,department }}
              onApprove={approveTicketMutation.mutate}
              onReject={rejectTicketMutation.mutate} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TicketSettingsNew;
