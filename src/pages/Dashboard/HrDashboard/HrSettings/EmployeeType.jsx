
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { useQuery } from '@tanstack/react-query';


const EmployeeType = () => {

  const axios = useAxiosPrivate()

  const { data: employeeTypes = [] } = useQuery({
    queryKey: ["employeeTypes"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/get-company-data/?field=employeeTypes");
        return response.data.employeeTypes
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const departmentsColumn = [
    { field:"id",headerName:"SR NO"},
    { field: "name", headerName: "Employee Type",
      cellRenderer:(params)=>{
        return(
          <div>
            <span className="text-primary cursor-pointer hover:underline">
              {params.value}
            </span>
          </div>
        )
      },flex:1},
     {
         field: "status",
         headerName: "Status",
         flex: 1,
         cellRenderer: (params) => {
           const status = params.value ? "Active" : "Inactive"; // Map boolean to string status
           const statusColorMap = {
             Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
             Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
           };
         
           const { backgroundColor, color } = statusColorMap[status] || {
             backgroundColor: "gray",
             color: "white",
           };
         
           return (
             <Chip
               label={status}
               style={{
                 backgroundColor,
                 color,
               }}
             />
           );
         },  
       },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: () => (
        <>
          <div className="p-2 mb-2 flex gap-2">
           <span className="text-content text-primary hover:underline cursor-pointer">
            Make Inactive
           </span>
          </div>
        </>
      ),
    },
  ];

  return (
    <div>
        <AgTable
          search={true}
          searchColumn={"Employee Type"}
          tableTitle={"Employee Type List"}
          buttonTitle={"Add Employee Type"}
          data={[
            ...employeeTypes.map((type, index) => ({
              id: index + 1, 
              name: type.name, 
              status: type.isActive 
            })),
          ]}
          columns={departmentsColumn}
        />
      </div>
  )
}

export default EmployeeType
