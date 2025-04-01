;
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";


const Shifts = () => {

  const axios = useAxiosPrivate()

  const { data: shifts = [] } = useQuery({
    queryKey: ["shifts"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/get-company-data/?field=shifts");
        return response.data.shifts
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const departmentsColumn = [
    { field:"id" , headerName:"SR NO"},
      { field: "shift", headerName: "Shift List",
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
               }
    ];
  
  return (
    <div>
      <AgTable
        search={true}
        searchColumn={"Shifts"}
        tableTitle={"Shift List"}
        buttonTitle={"Add Shift List"}
        data={[
          ...shifts.map((shift, index) => ({
            id: index + 1, // Auto-increment Sr No
            shift: shift.name,
            status:shift.isActive
            ,
          })),
        ]}
        columns={departmentsColumn}
      />
    </div>
  );
};

export default Shifts;
