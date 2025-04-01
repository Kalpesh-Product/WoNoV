import React, { useState } from "react";
import AgTable from "../../components/AgTable";
import { Button, TextField, MenuItem } from "@mui/material";
import MuiAside from "../../components/MuiAside";
import PrimaryButton from "../../components/PrimaryButton";
import { IoFilterCircleOutline } from "react-icons/io5";
import { Chip } from "@mui/material";

const Reports = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    RaisedBy: "",
    SelectedDepartment: "All",
    TicketTitle: "",
    Priority: "All",
  });
  const [filteredRows, setFilteredRows] = useState(null); // Null to differentiate between initial state and no data

  const departments = ["All", "IT", "Admin", "Tech"];
  const priorities = ["All", "High", "Medium", "Low"];

  const rows = [
    {
      RaisedBy: "Abrar Shaikh",
      SelectedDepartment: "IT",
      TicketTitle: "Wifi is not working",
      Priority: "High",
    },
    {
      RaisedBy: "Abrar Shaikh",
      SelectedDepartment: "Admin",
      TicketTitle: "Ac is not working",
      Priority: "Medium",
    },
    {
      RaisedBy: "Abrar Shaikh",
      SelectedDepartment: "Admin",
      TicketTitle: "Need more chairs in Baga Room",
      Priority: "Medium",
    },
    {
      RaisedBy: "Abrar Shaikh",
      SelectedDepartment: "Admin",
      TicketTitle: "Need water bottles on the bottle",
      Priority: "High",
    },
    {
      RaisedBy: "Abrar Shaikh",
      SelectedDepartment: "Tech",
      TicketTitle: "Website is taking time to load",
      Priority: "High",
    },
  ];

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    const filtered = rows.filter((row) => {
      return (
        (!filters.RaisedBy ||
          row.RaisedBy.toLowerCase().includes(
            filters.RaisedBy.toLowerCase()
          )) &&
        (filters.SelectedDepartment === "All" ||
          row.SelectedDepartment === filters.SelectedDepartment) &&
        (!filters.TicketTitle ||
          row.TicketTitle.toLowerCase().includes(
            filters.TicketTitle.toLowerCase()
          )) &&
        (filters.Priority === "All" || row.Priority === filters.Priority)
      );
    });

    setFilteredRows(filtered.length > 0 ? filtered : []); // Set to [] if no matches
    setFilterOpen(false);
  };

  const PriorityCellRenderer = (params) => {
    const { value } = params;

    // Determine the color based on priority
    let color = "";
    let fontcolor = ""
    switch (value) {
      case "High":
        color = "#ffbac2"
        fontcolor = "#8B0000";
        break;
      case "Medium":
        color = "#FFECC5"
        fontcolor="#ffa500";
        break;
      case "Low":
        color = "green";
        break;
      default:
        color = "black"; // Fallback color
    }

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Chip
          label={value}
          style={{
             backgroundColor:color,
             color:fontcolor,
            
          }}
        />
      </div>
    );
  };

  const laptopColumns = [
    { field: "RaisedBy", headerName: "Raised By", flex: 1 },
    { field: "SelectedDepartment", headerName: "Selected Department", flex: 1 },
    { field: "TicketTitle", headerName: "Ticket Title", flex: 1 },
    {
      field: "Priority",
      headerName: "Priority",
      flex: 1,
      cellRenderer: PriorityCellRenderer,
    },
  ];

  const displayedRows = filteredRows !== null ? filteredRows : rows;

  return (
    <div>
      <div className="w-full rounded-md bg-white p-4 ">
        <div className="flex justify-end items-center pb-4">
          <Button sx={{ fontSize: "2rem" }} onClick={() => setFilterOpen(true)}>
            <IoFilterCircleOutline />
          </Button>
        </div>
        <div className="w-full">
          {displayedRows.length > 0 ? (
            <AgTable
              data={displayedRows}
              columns={laptopColumns}
              paginationPageSize={10}
            />
          ) : (
            <div className="text-center text-gray-500">No data available</div>
          )}
        </div>
      </div>

      {/* Sidebar for Filtering */}
      <MuiAside
        title={"Filter Options"}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <TextField
          label="Raised By"
          size="small"
          variant="outlined"
          fullWidth
          margin="normal"
          value={filters.RaisedBy}
          onChange={(e) => handleFilterChange("RaisedBy", e.target.value)}
        />
        <TextField
          label="Selected Department"
          size="small"
          variant="outlined"
          fullWidth
          margin="normal"
          select
          value={filters.SelectedDepartment}
          onChange={(e) =>
            handleFilterChange("SelectedDepartment", e.target.value)
          }
        >
          {departments.map((department) => (
            <MenuItem key={department} value={department}>
              {department}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Ticket Title"
          size="small"
          variant="outlined"
          fullWidth
          margin="normal"
          value={filters.TicketTitle}
          onChange={(e) => handleFilterChange("TicketTitle", e.target.value)}
        />
        <TextField
          label="Priority"
          size="small"
          variant="outlined"
          fullWidth
          margin="normal"
          select
          value={filters.Priority}
          onChange={(e) => handleFilterChange("Priority", e.target.value)}
        >
          {priorities.map((priority) => (
            <MenuItem key={priority} value={priority}>
              {priority}
            </MenuItem>
          ))}
        </TextField>

        <div className="flex justify-center w-full pt-2">
          <PrimaryButton
            title={"Apply Filter"}
            externalStyles={"w-full"}
            handleSubmit={applyFilters}
          />
        </div>
      </MuiAside>
    </div>
  );
};

export default Reports;
