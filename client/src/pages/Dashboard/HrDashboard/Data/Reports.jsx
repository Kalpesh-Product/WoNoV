import React, { useState } from "react";
import PrimaryButton from "../../../../components/PrimaryButton";
import AgTable from "../../../../components/AgTable";
import { Chip, TextField } from "@mui/material";
import { Select, MenuItem, FormControl, InputLabel, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { inrFormat } from "../../../../utils/currencyFormat";

const HrReports = ({ title, buttonTitle, rowSelection }) => {
  const [selected, setSelected] = useState("");

  const handleChange = (event) => {
    setSelected(event.target.value);
  };

  const handleDelete = () => {
    setSelected("");
  };

  const StatusCellRenderer = (params) => {
    const status = params.value;
    const statusClass =
      status === "completed" ? "status-completed" : "status-pending";
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  const holdiayEvents = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "",
      width: 50,
    },
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "payrollid", headerName: "Payroll Id", flex: 1 },
    { field: "employeename", headerName: "Employee Name", flex: 1 },
    { field: "role", headerName: "Role" },
    { field: "dateandtime", headerName: "Date & Time", width: "200" },
    { field: "totalsalary", headerName: "Total Salary (INR)", flex: 1 },
    { field: "reimbursment", headerName: "Reimbursment (INR)", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font

          Completed: { backgroundColor: "#D3D3D3", color: "#696969" }, // Light gray bg, dark gray font
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
  ];

  const rows = [
    {
      srNo:1,
      payrollid: "PYRL120124",
      employeename: "Kalpesh Naik",
      role: "Lead UI/UX Developer",
      dateandtime: "21 Jun, 2024 - 05.05pm ",
      totalsalary: inrFormat("250000"),
      reimbursment: inrFormat("50000"),
      status: "completed",
    },
    {
      srNo:2,
      payrollid: "PYRL120130",
      employeename: "AiwinRaj",
      role: "Jr UI/UX Developer",
      dateandtime: "21 Jun, 2024 - 05.03pm ",
      totalsalary: inrFormat("230000"),
      reimbursment: inrFormat("10000"),
      status: "completed",
    },
    {
      srNo:3,
      payrollid: "PYRL120131",
      employeename: "Ashwin Karthik",
      role: "Jr UI/UX Developer",
      dateandtime: "21 Jun, 2024 - 05.05pm ",
      totalsalary: inrFormat("200000"),
      reimbursment: inrFormat("10000"),
      status: "Pending",
    },
    {
      srNo:4,
      payrollid: "PYRL120132",
      employeename: "Allen Silvera",
      role: "Jr UI/UX Developer",
      dateandtime: "21 Jun, 2024 - 05.00pm ",
      totalsalary: inrFormat("200000"),
      reimbursment: inrFormat("10000"),
      status: "Pending",
    },
    {
      srNo:5,
      payrollid: "PYRL120133",
      employeename: "Sankalp Kalangutkar",
      role: "Jr backed Develper",
      dateandtime: "21 Jun 2024 - 05.03pm ",
      totalsalary: inrFormat("250000"),
      reimbursment: inrFormat("20000"),
      status: "completed",
    },
    {
      srNo:6,
      payrollid: "PYRL120134",
      employeename: "Muskan Dodmani",
      role: "Jr backend Developer",
      dateandtime: "21 Jun 2024 - 05.10pm ",
      totalsalary: inrFormat("250000"),
      reimbursment: inrFormat("20000"),
      status: "Pending",
    },
  ];
  return (
    <div>
      <Box sx={{width:'20vw'}}>
        <FormControl fullWidth>
          <InputLabel id="dropdown-label">Select Option</InputLabel>
          <Select
            labelId="dropdown-label"
            value={selected}
            label="Select Option"
            size="small"
            onChange={handleChange}
          >
            <MenuItem value="Payroll">Payroll</MenuItem>
            <MenuItem value="Attendance">Attendance</MenuItem>
          </Select>
        </FormControl>
        {/* <div className="w-80">
          <TextField  label={"Select Option"} size="small" select fullWidth>
            <MenuItem value="" disabled>Select Option</MenuItem>
            <MenuItem value={"Payroll"}  >Payroll</MenuItem>
            <MenuItem value={selected} onChange={handleChange} >Attendance</MenuItem>
          </TextField>
        </div> */}

        {selected && (
          <Box sx={{ position: "relative", display: "inline-block", mt: 2 }}>
            <Chip
              label={selected}
              color="primary"
              onDelete={handleDelete}
              deleteIcon={<CloseIcon />}
              sx={{
                "& .MuiChip-deleteIcon": {
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  color: "red",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "red",
                    color: "white",
                  },
                },
              }}
            />
          </Box>
        )}
      </Box>
      <div className="flex justify-between items-center pb-4">
        <span className="text-title font-pmedium text-primary">{title}</span>
      </div>

      <div>
        <AgTable
          columns={holdiayEvents}
          data={[]}
          tableTitle={"Reports"}
          buttonTitle={"Export"}
          rowSelection="multiple"
        />
      </div>
    </div>
  );
};

export default HrReports;
