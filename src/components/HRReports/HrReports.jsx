import React from "react";
import AgTable from "../AgTable";

const HrReports = () => {
    const holdiayEvents = [
        {
          headerCheckboxSelection: true, 
          checkboxSelection: true,       
          headerName: '',                
          width: 50                      
        },
          { field: "employeeid", headerName: "Employee Id",flex:1 },
          { field: "employeename", headerName: "Employee Name",flex:1 },
          { field: "role", headerName: "Role",flex:1 },
          { field: "department", headerName: "Department",flex:1 },
          { field: "daysabsent", headerName: "Days Absent",flex:1 },
          { field: "presentpercentage", headerName: "Present (%)",flex:1 },
        //   { field: "status", headerName: "Status", cellRenderer: (params) => {
        //     const statusColorMap = {
        //       Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
             
        //       Completed: { backgroundColor: "#D3D3D3", color: "#696969" }, // Light gray bg, dark gray font
        //     };
    
        //     const { backgroundColor, color } = statusColorMap[params.value] || {
        //       backgroundColor: "gray",
        //       color: "white",
        //     };
        //     return (
        //       <>
        //         <Chip
        //           label={params.value}
        //           style={{
        //             backgroundColor,
        //             color,
        //           }}
        //         />
        //       </>
        //     );
        //   },
        // },
        ];
  
        const rows = [
          
          {
            employeeid:"EMPIID1024",
           employeename:"Kalpesh Naik",
           role:"Lead UI/UX Developer",
           department:"Tech",
           daysabsent:"12",
           presentpercentage:"70%",
          
          },
          {
            employeeid:"EMPIID1030",
            employeename:"Aiwinraj",
            role:"Jr UI/UX Developer",
            department:"Tech",
            daysabsent:"10",
            presentpercentage:"75%",
          },
          {
            employeeid:"EMPIID1031",
            employeename:"Allen Silvera",
            role:"Lead UI/UX Developer",
            department:"Tech",
            daysabsent:"20",
            presentpercentage:"50%",
          },
          {
            employeeid:"EMPIID1032",
            employeename:"Anushri Bhagat",
            role:"Lead UI/UX Developer",
            department:"Tech",
            daysabsent:"15",
            presentpercentage:"60%",
          },
          {
            employeeid:"EMPIID1033",
            employeename:"Sankalp Kalangutkar",
            role:"Backend Developer",
            department:"Tech",
            daysabsent:"19",
            presentpercentage:"52%",
          },
          {
            employeeid:"EMPIID1034",
            employeename:"Muskan Dodmani",
            role:"Backend Developer",
            department:"Tech",
            daysabsent:"16",
            presentpercentage:"69%",
          },
         
        ];
  return (
    <div>
      
        <AgTable
          columns={holdiayEvents}
          data={rows}
          tableTitle={"Monthly Attendance"}
          buttonTitle={"Export"}
          rowSelection="multiple"
        />
      
    </div>
  );
};

export default HrReports;
