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
  Chip,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import WidgetSection from "../../components/WidgetSection";
import Card from "../../components/Card";

function Row({ row }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell align="center">{row.srNo}</TableCell>
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
          />
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
                <FormControl size="small" fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select label="Department">
                    <MenuItem value="">Select Department</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="Tech">Tech</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select label="Priority">
                    <MenuItem value="">Select Priority</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
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
                    px: 1,
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#FF7F7F",
                    color: "#c0392b",
                    px: 1,
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
          titleColor={"#FFBF42"}
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
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={headerCellStyle}>Sr No</TableCell>
              <TableCell align="center" sx={headerCellStyle}>Raised By</TableCell>
              <TableCell align="center" sx={headerCellStyle}>From Department</TableCell>
              <TableCell align="center" sx={headerCellStyle}>Ticket Title</TableCell>
              <TableCell align="center" sx={headerCellStyle}>Status</TableCell>
              <TableCell align="left" sx={headerCellStyle}>Action</TableCell>
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
