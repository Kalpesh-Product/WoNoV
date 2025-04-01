import React, { useState } from "react";
import WidgetSection from "../../components/WidgetSection";
import Card from "../../components/Card";
import AgTable from "../../components/AgTable";
import { Button, IconButton, TextField, Box } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Chip } from "@mui/material";

const TicketSettings = () => {
  const [expandedRow, setExpandedRow] = useState({});

  const toggleRowExpansion = (rowId) => {

    ('RowId',rowId);
    setExpandedRow((prevState) => ({
      ...prevState,
      [rowId]: !prevState[rowId], // Toggle the specific row
    })); // Toggle expanded row
  };
  const laptopColumns = [
    { field:"Id",headerName:"ID",},
    { field: "RaisedBy", headerName: "Raised By", flex: 1 },
    { field: "FromDepartment", headerName: "From Department", flex: 1 },
    { field: "TicketTitle", headerName: "Ticket Title", flex: 1 },
    {
      field: "Status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          "in-progress": { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
          resolved: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          open: { backgroundColor: "#E6E6FA", color: "#4B0082" }, // Light purple bg, dark purple font
          Closed: { backgroundColor: "#D3D3D3", color: "#696969" }, // Light gray bg, dark gray font
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
      }
    },
    {
      field: "Action",
      headerName: "Action",
      flex: 1,
      cellRenderer: (params) => {
        const isExpanded = expandedRow[params.data?.Id] || false;

        return (
          <IconButton onClick={() => toggleRowExpansion(params.data.Id)}>
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        );
      },
    },
  ];

  const rows = [
    { 
      Id:"1",
      RaisedBy: "Abrar Shaikh",
      FromDepartment: "IT",
      TicketTitle: "Laptop Screen Malfunctioning",
      Status: "Pending",
    },
    {
      Id:"2",
      RaisedBy: "Abrar Shaikh",
      FromDepartment: "IT",
      TicketTitle: "Laptop Screen Malfunctioning",
      Status: "Pending",
    },
    {
      Id:"3",
      RaisedBy: "Abrar Shaikh",
      FromDepartment: "IT",
      TicketTitle: "Laptop is not working",
      Status: "Pending",
    },
    {
      Id:"4",
      RaisedBy: "Abrar Shaikh",
      FromDepartment: "IT",
      TicketTitle: "Wifi is slow",
      Status: "Pending",
    },
    {
      Id:"5",
      RaisedBy: "Abrar Shaikh",
      FromDepartment: "IT",
      TicketTitle: "Laptop Screen Malfunctioning",
      Status: "Pending",
    },
  ];

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
      <div>
        <div className="rounded-md bg-white p-4 border-2 m-4">
          <div className=" w-full">
            <AgTable
              data={rows}
              columns={laptopColumns}
              paginationPageSize={10}
              rowHeight={expandedRow ? 120 : 60} // Adjust row height when expanded
              components={{
                Row: (props) => {
                  const isExpanded = expandedRow === props.data.id;

                  return (
                    <>
                      <div {...props}>
                        {/* Render default row */}
                        {props.children}
                      </div>
                      {isExpanded && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: 2,
                            borderTop: "1px solid #ddd",
                          }}
                        >
                          {/* Expanded row content */}
                          <TextField
                            label="Input 1"
                            variant="outlined"
                            size="small"
                            sx={{ marginRight: 2 }}
                          />
                          <TextField
                            label="Input 2"
                            variant="outlined"
                            size="small"
                            sx={{ marginRight: 2 }}
                          />
                          <TextField
                            label="Input 3"
                            variant="outlined"
                            size="small"
                            sx={{ marginRight: 2 }}
                          />
                          <Button variant="contained" color="primary">
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            sx={{ marginLeft: 2 }}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </>
                  );
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketSettings;
