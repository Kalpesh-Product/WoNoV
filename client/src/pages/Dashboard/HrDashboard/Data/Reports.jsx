import React,{useState} from 'react'
import PrimaryButton from '../../../../components/PrimaryButton'
import AgTable from '../../../../components/AgTable'
import { Chip} from "@mui/material";
import { Select, MenuItem, FormControl, InputLabel,  Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";


const HrReports = ({title,buttonTitle,rowSelection}) => {

  const [selected, setSelected] = useState("");

  const handleChange = (event) => {
    setSelected(event.target.value);
  };

  const handleDelete = () => {
    setSelected("");
  };


  const StatusCellRenderer = (params) => {
    const status = params.value;
    const statusClass = status === 'completed' ? 'status-completed' : 'status-pending';
    return (
      <span className={`status-badge ${statusClass}`}>
        {status}
      </span>
    );
  };



    const holdiayEvents = [
      {
        headerCheckboxSelection: true, 
        checkboxSelection: true,       
        headerName: '',                
        width: 50                      
      },
        { field: "payrollid", headerName: "Payroll Id",flex:1 },
        { field: "employeename", headerName: "Employee Name",flex:1 },
        { field: "role", headerName: "Role",width:"200" },
        { field: "dateandtime", headerName: "Date & Time", width:"200" },
        { field: "totalsalary", headerName: "Total Salary",flex:1 },
        { field: "reimbursment", headerName: "Reimbursment",flex:1 },
        { field: "status", headerName: "Status", cellRenderer: (params) => {
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
         payrollid:"PYRL120124",
         employeename:"Kalpesh Naik",
         role:"Lead UI/UX Developer",
         dateandtime:"21 Jun, 2024 - 05.05pm ",
         totalsalary:"Rs 2,500.00",
         reimbursment:"Rs 500.00",
         status:"completed"
        },
        {
            payrollid:"PYRL120130",       
            employeename:"AiwinRaj",
            role:"Jr UI/UX Developer",
            dateandtime:"21 Jun, 2024 - 05.03pm ",
            totalsalary:"Rs 2,300.00",
            reimbursment:"Rs 100.00",
            status:"completed"
        },
        {
            payrollid:"PYRL120131",
            employeename:"Anushri Bhagat",
            role:"Jr UI/UX Developer",
            dateandtime:"21 Jun, 2024 - 05.05pm ",
            totalsalary:"Rs 2,000.00",
            reimbursment:"Rs 100.00",
            status:"Pending"
        },
        {
            payrollid:"PYRL120132",
            employeename:"Allen Silvera",
            role:"Jr UI/UX Developer",
            dateandtime:"21 Jun, 2024 - 05.00pm ",
            totalsalary:"Rs 2,000.00",
            reimbursment:"Rs 100.00",
            status:"Pending"
        },
        {
            payrollid:"PYRL120133",
            employeename:"Sankalp Kalangutkar",
            role:"Jr backed Develper",
            dateandtime:"21 Jun 2024 - 05.03pm ",
            totalsalary:"Rs 2,500.00",
            reimbursment:"Rs 200.00",
            status:"completed"
        },
        {
            payrollid:"PYRL120134",
            employeename:"Muskan Dodmani",
            role:"Jr backend Developer",
            dateandtime:"21 Jun 2024 - 05.10pm ",
            totalsalary:"Rs 2,500.00",
            reimbursment:"Rs 200.00",
            status:"Pending"
        },
       
      ];
  return (
    <div>
      <Box sx={{ width: 300, mt:4 }}>
      <FormControl fullWidth>
        <InputLabel id="dropdown-label">Select Option</InputLabel>
        <Select
          labelId="dropdown-label"
          value={selected}
          label="Select Option"
          onChange={handleChange}
        >
          <MenuItem value="Payroll">Payroll</MenuItem>
          <MenuItem value="Attendance">Attendance</MenuItem>
        </Select>
      </FormControl>

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
      
      <AgTable  columns={holdiayEvents} data={rows} tableTitle={'Reports'}  buttonTitle={"Export"} rowSelection='multiple' />
    </div>
  </div>
  )
}

export default HrReports