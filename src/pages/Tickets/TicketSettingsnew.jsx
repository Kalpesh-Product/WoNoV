import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import WidgetSection from "../../components/WidgetSection";
import Card from "../../components/Card";
import TableRow from "@mui/material/TableRow";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Chip } from "@mui/material";

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        {/* <TableCell component="th" scope="row">
          
        </TableCell> */}
        <TableCell align="center">{row.raisedBy}</TableCell>
        <TableCell align="center">{row.department}</TableCell>
        <TableCell align="center">{row.ticketTitle}</TableCell>
        <TableCell align="center">
          <Chip
            label={row.status}
            style={{
              backgroundColor: "#FFECC5",
              color: "#CC8400",
            }}
          ></Chip>
        </TableCell>

        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Box display="flex" flexDirection="row" gap={2} mb={2}>
                <FormControl
                  size="small"
                  fullWidth
                  //
                >
                  <InputLabel>Department</InputLabel>
                  <Select label="Department">
                    <MenuItem value="">Select Department</MenuItem>
                    <MenuItem value="Male">IT</MenuItem>
                    <MenuItem value="Female">Tech</MenuItem>
                    <MenuItem value="Other">Admin</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  size="small"
                  fullWidth
                  //
                >
                  <InputLabel>Priority</InputLabel>
                  <Select label="Department">
                    <MenuItem value="">Select Priority</MenuItem>
                    <MenuItem value="Male">High</MenuItem>
                    <MenuItem value="Female">Medium</MenuItem>
                    <MenuItem value="Other">Low</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Time Required"
                  variant="outlined"
                  size="small"
                  fullWidth
                />

                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#90EE90",
                    color: "#006400",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#FF7F7F",
                    color: "#c0392b",
                    paddingLeft: "5px",
                    paddingRight: "5px",
                  }}
                >
                  Reject
                </Button>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

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

const TicketSettingsnew = () => {
  return (
    <>
      <div>
        <WidgetSection layout={4}>
          <Card
            title={"New Tickets"}
            bgcolor={"white"}
            data={"25"}
            titleColor={"#1E3D73"}
            fontColor={"#1E3D73"}
            height={"10rem"}
            fontFamily={"Poppins-Bold"}
          />
          <Card
            title={"Rejected Tickets"}
            data={"10"}
            bgcolor={"White"}
            titleColor={"red"}
            fontColor={"red"}
            height={"10rem"}
            fontFamily={"Poppins-Bold"}
          />
          <Card
            title={"Pending Tickets"}
            data={"10"}
            bgcolor={"white"}
            titleColor={"#1E3D73"}
            fontColor={"#FFBF42"}
            height={"10rem"}
            fontFamily={"Poppins-Bold"}
          />
          <Card
            title={"Approved Tickets"}
            bgcolor={"white"}
            data={"05"}
            titleColor={"green"}
            fontColor={"green"}
            height={"10rem"}
            fontFamily={"Poppins-Bold"}
          />
        </WidgetSection>
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead sx={{ backgroundColor: "#f8f9f9", height: "10px" }}>
              <TableRow sx={{ height: "10px" }}>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#f4f4f4", // Light gray background
                    fontWeight: "bold", // Bold font
                    borderBottom: "2px solid #ddd", // Border at the bottom
                    color: "#333", // Text color
                     // Uppercase text
                    fontSize: "14px", // Font size
                    letterSpacing: "0.5px", // Letter spacing
                    padding: "10px", // Padding
                  }}
                >
                  Raised By
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#f4f4f4", // Light gray background
                    fontWeight: "bold", // Bold font
                    borderBottom: "2px solid #ddd", // Border at the bottom
                    color: "#333", // Text color
                    // Uppercase text
                    fontSize: "14px", // Font size
                    letterSpacing: "0.5px", // Letter spacing
                    padding: "10px", // Padding
                  }}
                >
                  From Department
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#f4f4f4", // Light gray background
                    fontWeight: "bold", // Bold font
                    borderBottom: "2px solid #ddd", // Border at the bottom
                    color: "#333", // Text color
                    // Uppercase text
                    fontSize: "14px", // Font size
                    letterSpacing: "0.5px", // Letter spacing
                    padding: "10px", // Padding
                  }}
                >
                  Ticket Title
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#f4f4f4", // Light gray background
                    fontWeight: "bold", // Bold font
                    borderBottom: "2px solid #ddd", // Border at the bottom
                    color: "#333", // Text color
                     // Uppercase text
                    fontSize: "14px", // Font size
                    letterSpacing: "0.5px", // Letter spacing
                    padding: "10px", // Padding
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    backgroundColor: "#f4f4f4", // Light gray background
                    fontWeight: "bold", // Bold font
                    borderBottom: "2px solid #ddd", // Border at the bottom
                    color: "#333", // Text color
                     // Uppercase text
                    fontSize: "14px", // Font size
                    letterSpacing: "0.5px", // Letter spacing
                    padding: "10px", // Padding
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <Row key={row.name} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

export default TicketSettingsnew;
