import React from "react";
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

} from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";

const Row = ({ row }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow>
        <TableCell align="center">{row.srNo}</TableCell>
        <TableCell align="center">{row.raisedBy}</TableCell>
        <TableCell align="center">{row.department}</TableCell>
        <TableCell align="center">{row.ticketTitle}</TableCell>
        <TableCell align="center">
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
            {row.status}
          </span>
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
                <select className="border px-2 py-1 rounded text-sm">
                  <option>Department</option>
                </select>
                <select className="border px-2 py-1 rounded text-sm">
                  <option>Priority</option>
                </select>
                <select className="border px-2 py-1 rounded text-sm">
                  <option>Time Required</option>
                </select>
                <button className="bg-green-400 text-white px-4 py-1 rounded hover:bg-green-500 text-sm">
                  APPROVE
                </button>
                <button className="bg-red-300 text-white px-4 py-1 rounded hover:bg-red-400 text-sm">
                  REJECT
                </button>
              </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};


const TicketSettingsNew = () => {
  
  const rows = [
    {
      raisedBy: "Abrar Shaikh",
      department: "IT",
      ticketTitle: "Wifi is not working",
      status: "Pending",
    },
    {
      raisedBy: "Abrar Shaikh",
      department: "IT",
      ticketTitle: "Ac is not working",
      status: "Pending",
    },
    {
      raisedBy: "Abrar Shaikh",
      department: "IT",
      ticketTitle: "Page is not loading",
      status: "Pending",
    },
    {
      raisedBy: "Abrar Shaikh",
      department: "IT",
      ticketTitle: "Need More accessories",
      status: "Pending",
    },
    {
      raisedBy: "Abrar Shaikh",
      department: "IT",
      ticketTitle: "Need More accessories",
      status: "Pending",
    },
  ];

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
            {rows.map((row, index) => (
              <Row key={index} row={{ ...row, srNo: index + 1 }} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TicketSettingsNew;
